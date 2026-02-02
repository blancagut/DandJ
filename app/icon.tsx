/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

export default async function Icon() {
  const svg = await fetch(new URL("../public/icon.svg", import.meta.url)).then((res) => res.text())
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1E3A",
          borderRadius: 8,
        }}
      >
        <img src={dataUrl} width={28} height={28} alt="Diaz & Johnson" />
      </div>
    ),
    size,
  )
}
