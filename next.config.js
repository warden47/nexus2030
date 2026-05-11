/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development best practices
  reactStrictMode: true,

  // Output standalone build for PWA / Docker / Node.js deployment
  output: 'standalone',

  // Transpile ESM packages (Three.js)
  transpilePackages: ['three'],

  // Image optimization: allow external domains via remote patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },

  // Experimental features (serverActions are stable in Next 14, but explicit)
  experimental: {
    serverActions: true,
  },

  // Custom HTTP headers (Content-Security-Policy)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://js.stripe.com",
              // Styles
              "style-src 'self' 'unsafe-inline'",
              // Media (HLS, Mux)
              "media-src 'self' blob: mediastream: https://*.mux.com https://stream.mux.com",
              // Connections (Firebase, Mux, Stripe, etc.)
              "connect-src 'self' " +
                "https://*.firebaseio.com " +
                "https://*.googleapis.com " +
                "https://identitytoolkit.googleapis.com " +
                "https://securetoken.googleapis.com " +
                "https://firestore.googleapis.com " +
                "wss://*.firebaseio.com " +
                "https://*.mux.com " +
                "https://api.stripe.com " +
                "https://*.stripe.com",
              // Images
              "img-src 'self' data: https://firebasestorage.googleapis.com https://image.mux.com https://i.ytimg.com https://*.stripe.com",
              // Frames (Stripe Elements)
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              // Workers (for hls.js, etc.)
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Webpack is not explicitly needed (transpilePackages handles three.js)
};

module.exports = nextConfig;