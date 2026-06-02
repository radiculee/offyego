import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Off Ye Go: Cannot pick a pub? Off ye go. We will pick one for you.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0d0b',
          color: '#ede0cc',
          fontFamily: 'serif',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '120px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            color: '#ede0cc',
          }}
        >
          Off Ye Go
        </div>
        <div
          style={{
            fontSize: '36px',
            color: '#c8904a',
            marginBottom: '40px',
            fontStyle: 'italic',
          }}
        >
          {"Can't pick a pub? We'll pick one."}
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#9a8a74',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          A sarcastic pub randomiser for the Republic of Ireland.
        </div>
      </div>
    ),
    { ...size }
  );
}
