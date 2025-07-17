/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactStrictMode: true,

    // Performance optimizations
    experimental: {
        optimizePackageImports: ['antd', '@ant-design/icons', 'lucide-react'],
    },

    // Image optimization
    images: {
        domains: ['localhost'],
        formats: ['image/webp', 'image/avif'],
    },

    // Reduce bundle size
    swcMinify: true,

    // Webpack optimization cho development
    webpack: (config, { dev, isServer }) => {
        // Tối ưu cho development
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }

        return config;
    },

    // Tối ưu TypeScript
    typescript: {
        ignoreBuildErrors: false,
    },

    // Tối ưu ESLint
    eslint: {
        ignoreDuringBuilds: false,
    },

};

module.exports = nextConfig; 