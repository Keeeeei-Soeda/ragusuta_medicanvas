/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // 開発環境ではコメントアウト（静的エクスポートは本番ビルド時のみ）
  images: {
    unoptimized: true
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  },
}

module.exports = nextConfig


