/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 서버 없이 정적 파일로 배포 (GitHub Pages·Vercel·Netlify 어디든)
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
