const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 服务器构建优化配置
  experimental: {
    // 禁用一些实验性功能以节省内存
    turbo: false,
    optimizePackageImports: ['lucide-react'],
  },
  
  // 编译器优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack 配置优化
  webpack: (config, { isServer, dev }) => {
    // 减少内存使用
    config.optimization = {
      ...config.optimization,
      splitChunks: isServer ? false : {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // 将 node_modules 打包成单独的 chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // 将公共代码打包
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    }
    
    // 减少并行处理以节省内存
    config.parallelism = 1
    
    // 禁用 source map 以节省内存和空间
    if (!dev) {
      config.devtool = false
    }
    
    return config
  },
  
  // 禁用 SWC 压缩以节省内存（使用 Terser）
  swcMinify: false,
  
  // 图片优化配置
  images: {
    unoptimized: true, // 禁用图片优化以节省内存
  },
  
  // 输出配置
  output: 'standalone',
  
  // 禁用遥测
  telemetry: false,
  
  // 减少静态生成的并发数
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = withContentlayer(nextConfig)
