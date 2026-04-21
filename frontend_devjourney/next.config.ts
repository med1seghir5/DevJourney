import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://devjourneybackend-hn16.onrender.com/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
