// components/profile/gallery.tsx
import Image from 'next/image';
import type { GalleryItem } from '@/types/database.types';

export function Gallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] opacity-60">
        Portfolio
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-[color:var(--profile-fg)]/5"
          >
            {item.media_type === 'image' ? (
              <Image
                src={item.media_url}
                alt={item.caption ?? 'Portfolio item'}
                fill
                sizes="(max-width: 480px) 50vw, 240px"
                className="object-cover"
              />
            ) : (
              <video
                src={item.media_url}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
