/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
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
      {
        source: "/api/:path*",
        destination: "https://library-management-system-piim.onrender.com/api/:path*",
      },
      {
        source: "/dashboard/:path*",
        destination: "https://library-management-system-piim.onrender.com/dashboard/:path*",
      },
    ];
  },
};

export default nextConfig;
