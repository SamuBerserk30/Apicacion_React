const PLACEHOLDER_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#e5e7eb" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)" />
    <g fill="none" stroke="#94a3b8" stroke-width="18">
      <rect x="140" y="120" width="520" height="360" rx="28" />
      <path d="M220 390l110-110 95 95 70-70 85 85" />
      <circle cx="300" cy="220" r="34" fill="#94a3b8" stroke="none" />
    </g>
    <text
      x="50%"
      y="88%"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="36"
      font-weight="700"
      fill="#475569"
    >
      Imagen no disponible
    </text>
  </svg>
`)}`;

function OptionalImage({ src, alt, onError, ...props }) {
  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const resolvedSrc = normalizedSrc || PLACEHOLDER_SRC;
  const resolvedAlt = alt || 'Imagen no disponible';

  const handleError = (event) => {
    if (event.currentTarget.src !== PLACEHOLDER_SRC) {
      event.currentTarget.src = PLACEHOLDER_SRC;
    }

    onError?.(event);
  };

  return <img {...props} src={resolvedSrc} alt={resolvedAlt} onError={handleError} />;
}

export default OptionalImage;
