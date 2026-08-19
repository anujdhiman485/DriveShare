/**
 * Inline SVG placeholder for cars without a photo. Solid neutral fill — no
 * gradients — so it sits quietly next to real photography.
 * Self-contained so listings still look intentional when an image 404s.
 */
export const carPlaceholder = (label = 'DriveShare') => {
  const text = String(label).trim() || 'DriveShare';
  const safe = text.replace(/[<>&]/g, '').slice(0, 28);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#e5e5e5"/>
    <g fill="#a3a3a3" transform="translate(320 176)">
      <path d="M-58-10l10-26a14 14 0 0 1 13-9h70a14 14 0 0 1 13 9l10 26h6a10 10 0 0 1 10 10v26a8 8 0 0 1-8 8h-10v10a10 10 0 0 1-10 10h-12a10 10 0 0 1-10-10v-10h-48v10a10 10 0 0 1-10 10H-56a10 10 0 0 1-10-10v-10h-10a8 8 0 0 1-8-8V0a10 10 0 0 1 10-10zM-40-12h80l-7-19a5 5 0 0 0-5-3h-56a5 5 0 0 0-5 3zM-52 8a9 9 0 1 0 0 18 9 9 0 0 0 0-18m104 0a9 9 0 1 0 0 18 9 9 0 0 0 0-18"/>
    </g>
    <text x="320" y="286" font-family="Montserrat, Segoe UI, Helvetica, Arial, sans-serif" font-size="24"
          font-weight="600" fill="#737373" text-anchor="middle">${safe}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * via.placeholder.com is defunct — it no longer resolves, so requests hang
 * instead of erroring and `onError` never fires. Existing listings are seeded
 * with those URLs, so treat them as "no image" rather than waiting on them.
 */
const isDeadPlaceholder = (url) =>
  typeof url === 'string' && /(^|\/\/|\.)placeholder\.com\//.test(url);

/** Picks the first usable image for a car, falling back to the placeholder. */
export const carImageSrc = (car) => {
  const candidate = car?.images?.find((url) => url && !isDeadPlaceholder(url)) ||
    (isDeadPlaceholder(car?.image) ? null : car?.image);

  return candidate || carPlaceholder(`${car?.brand || ''} ${car?.model || ''}`);
};

/** onError handler that swaps in the placeholder exactly once. */
export const handleImageError = (label) => (event) => {
  const fallback = carPlaceholder(label);
  if (event.target.src === fallback) return;
  event.target.src = fallback;
};
