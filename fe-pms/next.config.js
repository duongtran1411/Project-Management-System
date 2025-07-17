/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactStrictMode: true,

    // Performance optimizations
    experimental: {
        optimizePackageImports: ['antd', '@ant-design/icons', 'lucide-react'],
        // Tăng tốc compile
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
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

            // Tăng tốc compile
            config.optimization = {
                ...config.optimization,
                removeAvailableModules: false,
                removeEmptyChunks: false,
                splitChunks: false,
                minimize: false,
                concatenateModules: false,
            };

            // Disable source maps trong development
            config.devtool = 'eval';
        }

        return config;
    },

    // Tối ưu TypeScript - bỏ qua lỗi trong development
    typescript: {
        ignoreBuildErrors: true,
    },

    // Tối ưu ESLint - bỏ qua trong development
    eslint: {
        ignoreDuringBuilds: true,
    },

};

module.exports = nextConfig; 