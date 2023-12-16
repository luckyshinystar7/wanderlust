import { useNavigate } from 'react-router-dom';
import Post from '@/types/post-type';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { createSlug } from '@/utils/slug-generator';

export default function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const slug = createSlug(post.title);
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
      <div
        className="mr-8 mt-4 mb-4 cursor-pointer rounded-lg bg-light shadow-md dark:bg-dark-card"
        onClick={() => navigate(`/details-page/${slug}/${post._id}`, { state: { post } })}
      >
        <img
          src={post.imageLink}
          alt={post.title}
          className="h-48 w-full rounded-t-lg object-cover"
        />
        <div className="p-4">
          <div className="mb-1 text-xs text-light-info dark:text-dark-info">
            {post.authorName} • {formatPostTime(post.timeOfPost)}
          </div>
          <h2 className="mb-2 line-clamp-1 text-lg font-semibold text-light-title dark:text-dark-title">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm text-light-description dark:text-dark-description">
            {post.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.categories.map((category, index) => (
              <CategoryPill key={`${category}-${index}`} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
