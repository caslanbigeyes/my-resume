const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  experimental: {
    // 暂时禁用 turbo 以避免字体加载问题
    // turbo: {
    //   rules: {
    //     '*.md': {
    //       loaders: ['@mdx-js/loader'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },
}

module.exports = withContentlayer(nextConfig)
