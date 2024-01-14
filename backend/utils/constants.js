export const validCategories = [
    'Travel',
    'Nature',
    'City',
    'Adventure',
    'Beaches',
    'Landmarks',
    'Mountains',
];
export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
}
export const RESPONSE_MESSAGES = {
    COMMON: {
        INTERNAL_SERVER_ERROR: 'Internal Server Error',
        REQUIRED_FIELDS: 'All fields are required.',
    },
    POSTS: {
        CREATED: 'Post created successfully',
        DELETED: 'Post deleted',
        NOT_FOUND: 'Post not found',
        INVALID_CATEGORY: 'Invalid category',
        MAX_CATEGORIES: 'Please select up to three categories only',
        INVALID_IMAGE_URL: 'Image URL must end with .jpg, .jpeg, .webp, or .png'
    }
};