/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Prevent stale cached versions on mobile browsers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ]
  },

  // URLs cortas con rewrites (no cambia la URL visible)
  async rewrites() {
    return [
      // Alias cortos → rutas reales
      { source: "/c", destination: "/consult" },
      { source: "/a", destination: "/admin" },
      { source: "/t", destination: "/team" },
      { source: "/r", destination: "/resources" },
      { source: "/l", destination: "/legal" },
      
      // Áreas de práctica con slug corto
      // /p/immigration → /areas/immigration
      { source: "/p/:slug", destination: "/areas/:slug" },
    ]
  },
}

export default nextConfig
