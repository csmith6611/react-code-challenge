import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CiHeart } from "react-icons/ci";

dayjs.extend(relativeTime);

export function Card(props: {
  title: string;
  author: string;
  points?: number;
  time: string;
  url?: string;
}) {
  const { title, author, points, time, url } = props;
  return (
    <article className="card border-2 border-neutral-200 w-116 h-48 shadow-xl p-2">
      <h2 className="card-title">{title}</h2>
      <p className="">{author}</p>
      <p className="">{points}</p>
      <p className="">{dayjs(time).fromNow()}</p>
      <div className="card-actions justify-end p-2">
        <button className="btn bg-secondary text-secondary-content hover:bg-secondary-focus hover:text-secondary-content hover:shadow-lg transition-all duration-300 ease-in-out">
          <CiHeart />
        </button>
      </div>
    </article>
  );
}
