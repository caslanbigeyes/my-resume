const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.md': {
          loaders: ['@mdx-js/loader'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = withContentlayer(nextConfig)
