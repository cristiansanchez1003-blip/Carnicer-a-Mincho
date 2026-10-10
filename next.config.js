/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `next dev` no debe crear AGENTS.md por su cuenta en el repositorio.
  agentRules: false,
  // Fija la raíz del proyecto (hay otro package-lock.json en la carpeta de usuario).
  turbopack: { root: __dirname },
  // Las fotos subidas desde el panel viven en data/images (se leen por GitHub en producción);
  // no deben empaquetarse dentro de las funciones, que solo las usarían en desarrollo local.
  outputFileTracingExcludes: {
    '/api/img/[name]': ['./data/images/**'],
    '/api/admin/upload': ['./data/images/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // El panel y su API no deben aparecer en buscadores ni guardarse en cachés.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
