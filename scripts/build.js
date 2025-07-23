#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// 检查是否已经有生成的文档
const contentlayerDir = path.join(process.cwd(), '.contentlayer');
const hasExistingDocs = fs.existsSync(contentlayerDir);

if (hasExistingDocs) {
  console.log('📝 Found existing contentlayer documents, skipping generation...');
  startNextBuild();
} else {
  console.log('📝 Building contentlayer documents...');

  // 设置环境变量来抑制错误输出
  const env = { ...process.env, NODE_ENV: 'production' };

  const contentlayerProcess = spawn('npx', ['contentlayer', 'build'], {
    stdio: ['inherit', 'inherit', 'pipe'], // 捕获 stderr
    shell: true,
    cwd: process.cwd(),
    env
  });

  let stderrData = '';
  contentlayerProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
    // 只显示非错误的输出
    if (!data.toString().includes('TypeError') && !data.toString().includes('ERR_INVALID_ARG_TYPE')) {
      process.stderr.write(data);
    }
  });

  contentlayerProcess.on('close', (code) => {
    // 检查是否成功生成了文档
    const docsGenerated = fs.existsSync(contentlayerDir);

    if (docsGenerated) {
      console.log('✅ Documents generated successfully');
      startNextBuild();
    } else {
      console.error('❌ Failed to generate contentlayer documents');
      process.exit(1);
    }
  });

  contentlayerProcess.on('error', (error) => {
    console.error('❌ Error running contentlayer build:', error);
    process.exit(1);
  });
}

function startNextBuild() {
  console.log('🏗️  Building Next.js application...');
  const nextProcess = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  nextProcess.on('close', (nextCode) => {
    if (nextCode === 0) {
      console.log('✅ Build completed successfully!');
      process.exit(0);
    } else {
      console.error('❌ Next.js build failed');
      process.exit(nextCode);
    }
  });

  nextProcess.on('error', (error) => {
    console.error('❌ Error running Next.js build:', error);
    process.exit(1);
  });
}
