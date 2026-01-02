/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // 코드 분할 및 성능 최적화
  compiler: {
    // 프로덕션 빌드에서만 최적화
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 번들 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-i18next'],
  },

  // 정적 자산 최적화
  compress: true,
};

module.exports = nextConfig;
