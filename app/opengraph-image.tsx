// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#FAF9F6',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#131316',
            marginBottom: 24,
          }}
        >
          Connect<span style={{ color: '#C9A24B' }}>Cards</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#131316',
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          One tap. Your whole identity.
        </div>
        <div style={{ fontSize: 28, color: '#6B6B70', marginTop: 24 }}>
          Premium NFC business cards with a digital identity platform built in.
        </div>
      </div>
    ),
    { ...size },
  );
}
