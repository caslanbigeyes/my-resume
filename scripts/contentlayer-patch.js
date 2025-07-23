#!/usr/bin/env node

// Contentlayer 错误修复补丁
// 这个脚本会在 contentlayer 构建后修复退出码问题

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Applying Contentlayer patch...');

try {
  // 运行 contentlayer build 并捕获输出
  console.log('📝 Running contentlayer build...');
  
  const result = execSync('npx contentlayer build', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  console.log('✅ Contentlayer build completed successfully');
  
} catch (error) {
  // 检查是否是我们知道的错误
  if (error.message.includes('ERR_INVALID_ARG_TYPE') || 
      error.message.includes('TypeError: The "code" argument must be of type number')) {
    
    // 检查文档是否实际生成了
    const contentlayerDir = path.join(process.cwd(), '.contentlayer');
    if (fs.existsSync(contentlayerDir)) {
      console.log('✅ Documents generated successfully (ignoring exit code error)');
    } else {
      console.error('❌ Failed to generate documents');
      process.exit(1);
    }
  } else {
    // 其他错误，重新抛出
    console.error('❌ Contentlayer build failed:', error.message);
    process.exit(1);
  }
}

console.log('🔧 Contentlayer patch applied successfully');
