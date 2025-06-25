const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
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
