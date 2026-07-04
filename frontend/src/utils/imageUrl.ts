export type ImageSize = 'hero' | 'card' | 'thumb';

const SIZE_CONFIG: Record<ImageSize, { width: number; quality: number }> = {
  hero: { width: 1920, quality: 90 },
  card: { width: 900, quality: 85 },
  thumb: { width: 400, quality: 80 }
};

function isUnsplashUrl(url: string): boolean {
  return url.includes('unsplash.com') || url.includes('images.unsplash.com');
}

function extractUnsplashPhotoId(url: string): string | null {
  const match = url.match(
    /unsplash\.com\/(?:photos|es\/fotos)\/(?:[^/?]+-)?([a-zA-Z0-9_-]{10,12})(?:\/|\?|$|")/
  );
  return match?.[1] ?? null;
}

function buildUnsplashUrl(url: string, width: number, quality: number): string {
  if (url.includes('images.unsplash.com')) {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    return parsed.toString();
  }

  if (url.includes('/download')) {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    return parsed.toString();
  }

  const photoId = extractUnsplashPhotoId(url);
  if (photoId) {
    return `https://unsplash.com/photos/${photoId}/download?w=${width}&q=${quality}&auto=format&fit=crop`;
  }

  return url;
}

export function imageUrl(url: string | undefined, size: ImageSize = 'card'): string {
  if (!url) return '';
  const { width, quality } = SIZE_CONFIG[size];
  if (!isUnsplashUrl(url)) return url;
  return buildUnsplashUrl(url, width, quality);
}

export interface ImageFocus {
  x?: number;
  y?: number;
}

function clampFocus(value: number | undefined, fallback = 50): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function imageObjectPosition(focus?: ImageFocus): string {
  const x = clampFocus(focus?.x);
  const y = clampFocus(focus?.y);
  return `${x}% ${y}%`;
}

export function heroImageProps(url: string | undefined, focus?: ImageFocus): {
  src: string;
  srcSet?: string;
  sizes?: string;
  style?: { objectPosition: string };
} {
  if (!url) return { src: '' };
  const objectPosition = imageObjectPosition(focus);
  const style = { objectPosition };

  if (!isUnsplashUrl(url)) return { src: url, style };

  return {
    src: buildUnsplashUrl(url, 1920, 90),
    srcSet: [
      `${buildUnsplashUrl(url, 1280, 85)} 1280w`,
      `${buildUnsplashUrl(url, 1920, 90)} 1920w`,
      `${buildUnsplashUrl(url, 2560, 90)} 2560w`
    ].join(', '),
    sizes: '100vw',
    style
  };
}
