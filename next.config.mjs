/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    if (isServer) {
      config.externals = [...(config.externals || []), 'pdfjs-dist', 'canvas'];
    }

    return config;
  },
};

export default nextConfig;
