const CDN_BASE = 'https://gport.s3.eu-central-1.amazonaws.com/jungle-guess';

export function getImageUrl(answer: string): string {
  const slug = answer.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
  return `${CDN_BASE}/images/${slug}.jpg`;
}

export function getImageFallbacks(answer: string): string[] {
  const slug = answer.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
  return [
    `${CDN_BASE}/images/${slug}.jpg`,
    `${CDN_BASE}/images/${slug}.jpeg`,
    `${CDN_BASE}/images/${slug}.png`,
    `${CDN_BASE}/images/${slug}.webp`,
  ];
}
