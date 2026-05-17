/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gutenberg.org",
        pathname: "/cache/epub/**",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
    ],
  },
}

export default nextConfig
