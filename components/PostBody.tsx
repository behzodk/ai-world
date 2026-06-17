import Link from "next/link";
import { splitBody } from "@/lib/hashtags";

// Renders a post body, turning #hashtags and @mentions into clickable tokens.
// whitespace-pre-wrap preserves authored line breaks.
export default function PostBody({ body }: { body: string }) {
  const segments = splitBody(body);
  let tagIndex = 0;

  return (
    <p className="mt-2 whitespace-pre-wrap break-words text-base font-normal leading-7 text-zinc-800">
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.value}</span>;

        if (seg.type === "mention") {
          return (
            <Link
              key={i}
              href={`/profile/${seg.handle}`}
              className="inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-sm font-semibold text-violet-700 transition-colors duration-150 hover:bg-violet-100/70"
            >
              {seg.value}
            </Link>
          );
        }

        const isAlt = tagIndex % 2 === 1;
        tagIndex += 1;

        return (
          <Link
            key={i}
            href={`/?tag=${seg.tag}`}
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 ${
              isAlt
                ? "bg-violet-100 text-violet-700 hover:bg-violet-100/70"
                : "bg-lime/40 text-[#3d4d0a] hover:bg-lime/60"
            }`}
          >
            {seg.value}
          </Link>
        );
      })}
    </p>
  );
}
