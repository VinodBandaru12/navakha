export default function NavakhaLogo({ size = 32 }) {
  const r = Math.round(size * 0.22) // corner radius scales with size
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="12" fill="url(#navakha-grad)" />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="white"
      >
        N
      </text>
      <defs>
        <linearGradient id="navakha-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#185FA5" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
    </svg>
  )
}
