/* An event image from the API, or a brand-tinted field when there is none
   or it fails to load (images are the source's URLs; some die). The URL has
   already passed safeHttpUrl. Decorative: the title carries the meaning. */

import { useState } from "react";

export interface EventImageProps {
  readonly src: string | undefined;
  readonly className: string;
}

export function EventImage({ src, className }: EventImageProps) {
  const [broken, setBroken] = useState(false);
  if (src === undefined || broken) {
    return <div aria-hidden="true" className={`${className} bg-brand-bg`} />;
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={`${className} bg-surface-sunken object-cover`}
      onError={() => setBroken(true)}
    />
  );
}
