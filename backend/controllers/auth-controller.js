import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { cookieOptions } from '../utils/cookie_options.js';
import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

//REGULAR EMAIL PASSWORD STRATEGY
//1.Sign Up
export const signUpWithEmail = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  if (!userName || !fullName || !email || !password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS);
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    if (existingUser.userName === userName) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.USERS.USER_USERNAME_EXISTS);
    }
    if (existingUser.email === email) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.USERS.USER_EMAIL_EXISTS);
    }
  }

  const user = new User({
    userName,
    fullName,
    email,
    password,
  });

  try {
    await user.validate();
  } catch (error) {
    const validationErrors = [];
    for (const key in error.errors) {
      validationErrors.push(error.errors[key].message);
    }
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, validationErrors.join(', '));
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save();
  user.password = undefined;

  res
    .status(HTTP_STATUS.OK)
    .cookie('access_token', accessToken, cookieOptions)
    .cookie('refresh_token', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          accessToken,
          refreshToken,
          user,
        },
        RESPONSE_MESSAGES.USERS.SIGNED_UP
      )
    );
});

//2.Sign In
export const signInWithEmailOrUsername = asyncHandler(async (req, res) => {
  const { userNameOrEmail, password } = req.body;
  if (!userNameOrEmail || !password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS);
  }

  const user = await User.findOne({
    $or: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
  }).select('+password');

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS);
  }

  const isCorrectPassword = await user.isPasswordCorrect(password);

  if (!isCorrectPassword) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGES.USERS.INVALID_PASSWORD);
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  user.password = undefined;

  res
    .status(HTTP_STATUS.OK)
    .cookie('access_token', accessToken, cookieOptions)
    .cookie('refresh_token', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          accessToken,
          refreshToken,
          user,
        },
        RESPONSE_MESSAGES.USERS.SIGNED_IN
      )
    );
});

//Sign Out
export const signOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: '',
      },
    },
    {
      new: true,
    }
  );

  res
    .status(HTTP_STATUS.OK)
    .clearCookie('access_token', cookieOptions)
    .clearCookie('refresh_token', cookieOptions)
    .json(new ApiResponse(HTTP_STATUS.OK, '', RESPONSE_MESSAGES.USERS.SIGNED_OUT));
});

// check user
export const isLoggedIn = asyncHandler(async (req, res) => {
  let access_token = req.cookies?.access_token;
  let refresh_token = req.cookies?.refresh_token;
  const { _id } = req.params;

  if (access_token) {
    try {
      await jwt.verify(access_token, JWT_SECRET);
      return res
        .status(HTTP_STATUS.OK)
        .json(new ApiResponse(HTTP_STATUS.OK, access_token, RESPONSE_MESSAGES.USERS.VALID_TOKEN));
    } catch (error) {
      // Access token invalid, proceed to check refresh token
      console.log(error);
    }
  } else if (refresh_token) {
    try {
      await jwt.verify(refresh_token, JWT_SECRET);
      access_token = await user.generateAccessToken();
      return res
        .status(HTTP_STATUS.OK)
        .cookie('access_token', access_token, cookieOptions)
        .json(new ApiResponse(HTTP_STATUS.OK, access_token, RESPONSE_MESSAGES.USERS.VALID_TOKEN));
    } catch (error) {
      // Access token invalid, proceed to check refresh token that is in db
      console.log(error);
    }
  }
  const user = await User.findById(_id);
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json(new ApiResponse(HTTP_STATUS.NOT_FOUND, '', RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS));
  }

  const { refreshToken } = user;

  if (!refreshToken) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(new ApiResponse(HTTP_STATUS.UNAUTHORIZED, '', RESPONSE_MESSAGES.USERS.INVALID_TOKEN));
  }

  try {
    await jwt.verify(refreshToken, JWT_SECRET);
    access_token = await user.generateAccessToken();
    refresh_token = await user.generateRefreshToken();

    user.refreshToken = refresh_token;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .cookie('access_token', access_token, cookieOptions)
      .cookie('refresh_token', refresh_token, cookieOptions)
      .json(new ApiResponse(HTTP_STATUS.OK, access_token, RESPONSE_MESSAGES.USERS.VALID_TOKEN));
  } catch (error) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(
        new ApiResponse(
          HTTP_STATUS.UNAUTHORIZED,
          error.message,
          RESPONSE_MESSAGES.USERS.INVALID_TOKEN
        )
      );
  }
});
