/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)", // adjust this path as needed
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000", // Cache for 1 year
          },
        ],
      },
    ];
  },
};

export default nextConfig;
