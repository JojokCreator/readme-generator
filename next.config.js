/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: { NEXTAUTH_URL: "https://read-gen.vercel.app" },
}

module.exports = nextConfig
