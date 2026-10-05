/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  images: {
    domains: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/accounts/:path*",
        destination: "https://library-management-system-piim.onrender.com/accounts/:path*",
      },
    ];
  },
};

export default nextConfig;
