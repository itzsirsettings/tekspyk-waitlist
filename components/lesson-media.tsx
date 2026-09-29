import Image from "next/image";
import type { LearningMedia } from "@/lib/learning-store";

export function LessonMedia({ media, topic }: { media: LearningMedia[]; topic: string }) {
  if (!media.length) return null;
  return <div className="lesson-media-stack" aria-label="Lesson illustrations and videos">
    {media.map((item) => <figure className="lesson-media-card" key={item.id}>
      {item.mime_type.startsWith("image/") ? <Image
        src={`/api/learning/media/${item.id}`}
        alt={item.alt_text || `Illustration for ${topic}`}
        width={1200}
        height={800}
        unoptimized
        className="lesson-media-image"
      /> : <video className="lesson-media-video" controls preload="metadata" playsInline aria-label={item.alt_text || item.original_name}>
        <source src={`/api/learning/media/${item.id}`} type={item.mime_type} />
        Your browser does not support this video format.
      </video>}
      {item.alt_text && <figcaption>{item.alt_text}</figcaption>}
    </figure>)}
  </div>;
}
