export const Samicon = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 190 190"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="samGradient" x1="24.47" y1="95" x2="165.53" y2="95">
        <stop offset="0" stopColor="#00c895"/>
        <stop offset="1" stopColor="#00c895"/>
      </linearGradient>
    </defs>
    <path
      fill="currentColor"
      d="M161.46,73.73H142.32V53.8a13.8,13.8,0,1,0-8.55,0V73.73H99.28V31.46a13.8,13.8,0,1,0-8.56,0V73.73H59.41V53.8a13.81,13.81,0,1,0-8.55,0V73.73H28.54a4.07,4.07,0,0,0-4.07,4.07v44.12A4.07,4.07,0,0,0,28.54,126H50.86v16.58a13.81,13.81,0,1,0,8.55,0V126h34.5v32.55a13.81,13.81,0,1,0,8.55,0V126h31.31v16.58a13.81,13.81,0,1,0,8.55,0V126h19.14a4.07,4.07,0,0,0,4.07-4.07V77.8A4.07,4.07,0,0,0,161.46,73.73Zm-4.06,44.13H32.6v-36H157.4Z"
    />
  </svg>
);