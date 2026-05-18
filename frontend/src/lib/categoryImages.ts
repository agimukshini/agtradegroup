export const CATEGORY_PLACEHOLDER_IMAGES: Record<string, string> = {
  plumbing:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/727d057b25-adf8f790ac4a34521ae3.png',
  heating:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/1505bd3b9c-a25438db3f5a4402b21d.png',
  tools:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/17eef3f172-03d7a4798460605cc956.png',
  'building-materials':
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/00047b1406-f81789516f7574d511f7.png',
  'hand-tools':
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/cf803bd999-403c108fc3ddd0ae067d.png',
  electrical:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/03bdc2336d-44995a5fd670d643c917.png',
};

export const HERO_BG_IMAGE =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/1cdaad3c6e-601e55b01d8d2f28066c.png';

export const HERO_PRODUCTS_IMAGE =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/f997b3b7c2-5d6c6d1648868b05c6d4.png';

export function getCategoryImage(slug: string, image?: string | null) {
  return image || CATEGORY_PLACEHOLDER_IMAGES[slug] || CATEGORY_PLACEHOLDER_IMAGES.plumbing;
}
