/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

export default async function Icon() {
  const iconBuffer = await fetch(new URL("../public/favicon.ico", import.meta.url)).then((res) => res.arrayBuffer())
  const base64 = Buffer.from(iconBuffer).toString('base64')
  const dataUrl = `data:image/x-icon;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={dataUrl} width={32} height={32} alt="Diaz & Johnson" />
      </div>
    ),
    size,
  )
}
