import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#9b1d3a",
        }}
      >
        <svg width="118" height="118" viewBox="0 0 40 40">
          <path
            d="M20 34c-8-5.4-14-11.2-14-18A8 8 0 0 1 20 9.2 8 8 0 0 1 34 16c0 6.8-6 12.6-14 18Z"
            fill="#fff6f0"
          />
          <path
            d="M26 8c2.4-3 5.8-3.6 8-1.8"
            fill="none"
            stroke="#fff6f0"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="16.5" cy="16.5" r="2" fill="#9b1d3a" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
