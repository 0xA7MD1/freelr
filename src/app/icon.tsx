import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 100, height: 100 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0052FC',
          borderRadius: '20px',
        }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <path d="M 23 14 H 77 L 59 32 H 41 V 50 H 59 V 68 H 41 V 50 H 23 Z M 23 68 H 41 V 86 H 23 Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}



