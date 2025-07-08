import * as tf from '@tensorflow/tfjs'

/**
 * 设计特征接口
 */
export interface DesignFeatures {
  colorHue: number        // 色相 (0-360)
  saturation: number      // 饱和度 (0-100)
  brightness: number      // 亮度 (0-100)
  fontWeight: number      // 字重 (100-900)
  fontSize: number        // 字号 (12-100)
  aspectRatio: number     // 宽高比 (0.5-2.0)
  shapeComplexity: number // 形状复杂度 (0-1)
  contrast: number        // 对比度 (0-1)
}

/**
 * 样式推荐结果
 */
export interface StyleRecommendation {
  name: string
  score: number
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  characteristics: string[]
  confidence: number
}

/**
 * 样式类别定义
 */
export const STYLE_CATEGORIES = {
  MODERN: 0,
  CLASSIC: 1,
  CREATIVE: 2,
  MINIMAL: 3,
  CORPORATE: 4
} as const

/**
 * 样式推荐器类
 */
export class StyleRecommender {
  private model: tf.LayersModel | null = null
  private isInitialized = false

  /**
   * 初始化推荐器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 设置 TensorFlow.js 后端
      await tf.ready()
      
      // 创建或加载模型
      this.model = await this.createStyleModel()
      
      // 使用预设数据训练模型
      await this.trainModel()
      
      this.isInitialized = true
      console.log('🎨 样式推荐器初始化成功')
    } catch (error) {
      console.error('样式推荐器初始化失败:', error)
      throw error
    }
  }

  /**
   * 创建样式推荐模型
   */
  private async createStyleModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        // 输入层：8个特征
        tf.layers.dense({
          inputShape: [8],
          units: 32,
          activation: 'relu',
          kernelInitializer: 'randomNormal'
        }),
        
        // 隐藏层1：特征提取
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Dropout 防止过拟合
        tf.layers.dropout({ rate: 0.3 }),
        
        // 隐藏层2：特征组合
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        
        // 输出层：5个样式类别
        tf.layers.dense({
          units: 5,
          activation: 'softmax'
        })
      ]
    })

    // 编译模型
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  /**
   * 训练模型（使用预设的设计数据）
   */
  private async trainModel(): Promise<void> {
    if (!this.model) throw new Error('模型未初始化')

    // 生成训练数据
    const trainingData = this.generateTrainingData()
    
    const xs = tf.tensor2d(trainingData.features)
    const ys = tf.tensor2d(trainingData.labels)

    // 训练模型
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`训练进度: Epoch ${epoch}, Loss: ${logs?.loss?.toFixed(4)}, Accuracy: ${logs?.acc?.toFixed(4)}`)
          }
        }
      }
    })

    // 清理内存
    xs.dispose()
    ys.dispose()
  }

  /**
   * 生成训练数据
   */
  private generateTrainingData(): { features: number[][], labels: number[][] } {
    const features: number[][] = []
    const labels: number[][] = []

    // 现代风格样本
    for (let i = 0; i < 50; i++) {
      features.push([
        Math.random() * 360,           // 色相：任意
        0.6 + Math.random() * 0.4,     // 饱和度：中高
        0.4 + Math.random() * 0.4,     // 亮度：中等
        400 + Math.random() * 300,     // 字重：中等到粗
        16 + Math.random() * 24,       // 字号：中等
        0.8 + Math.random() * 0.4,     // 宽高比：偏方形
        0.2 + Math.random() * 0.3,     // 形状复杂度：简单
        0.6 + Math.random() * 0.4      // 对比度：高
      ])
      labels.push([1, 0, 0, 0, 0]) // MODERN
    }

    // 经典风格样本
    for (let i = 0; i < 50; i++) {
      features.push([
        Math.random() * 60,            // 色相：偏暖色
        0.3 + Math.random() * 0.4,     // 饱和度：中低
        0.3 + Math.random() * 0.4,     // 亮度：中等
        300 + Math.random() * 200,     // 字重：轻到中等
        14 + Math.random() * 16,       // 字号：小到中等
        1.0 + Math.random() * 0.5,     // 宽高比：偏横向
        0.4 + Math.random() * 0.4,     // 形状复杂度：中等
        0.4 + Math.random() * 0.4      // 对比度：中等
      ])
      labels.push([0, 1, 0, 0, 0]) // CLASSIC
    }

    // 创意风格样本
    for (let i = 0; i < 50; i++) {
      features.push([
        Math.random() * 360,           // 色相：任意
        0.7 + Math.random() * 0.3,     // 饱和度：高
        0.5 + Math.random() * 0.5,     // 亮度：中高
        300 + Math.random() * 400,     // 字重：变化大
        18 + Math.random() * 32,       // 字号：中大
        0.6 + Math.random() * 0.8,     // 宽高比：变化大
        0.6 + Math.random() * 0.4,     // 形状复杂度：复杂
        0.3 + Math.random() * 0.7      // 对比度：变化大
      ])
      labels.push([0, 0, 1, 0, 0]) // CREATIVE
    }

    // 极简风格样本
    for (let i = 0; i < 50; i++) {
      features.push([
        Math.random() * 60 + 180,      // 色相：冷色调
        0.1 + Math.random() * 0.3,     // 饱和度：低
        0.2 + Math.random() * 0.6,     // 亮度：低到中
        200 + Math.random() * 200,     // 字重：轻
        12 + Math.random() * 18,       // 字号：小到中
        0.9 + Math.random() * 0.2,     // 宽高比：接近方形
        0.0 + Math.random() * 0.2,     // 形状复杂度：极简
        0.7 + Math.random() * 0.3      // 对比度：高
      ])
      labels.push([0, 0, 0, 1, 0]) // MINIMAL
    }

    // 企业风格样本
    for (let i = 0; i < 50; i++) {
      features.push([
        200 + Math.random() * 60,      // 色相：蓝色系
        0.4 + Math.random() * 0.4,     // 饱和度：中等
        0.2 + Math.random() * 0.4,     // 亮度：偏暗
        400 + Math.random() * 200,     // 字重：中粗
        14 + Math.random() * 20,       // 字号：中等
        1.2 + Math.random() * 0.3,     // 宽高比：偏横向
        0.1 + Math.random() * 0.3,     // 形状复杂度：简单
        0.5 + Math.random() * 0.3      // 对比度：中等
      ])
      labels.push([0, 0, 0, 0, 1]) // CORPORATE
    }

    return { features, labels }
  }

  /**
   * 从设计配置中提取特征
   */
  extractFeatures(config: any): DesignFeatures {
    // 解析颜色
    const color = this.hexToHsl(config.textColor || '#000000')
    const bgColor = this.hexToHsl(config.backgroundColor || '#ffffff')
    
    // 计算对比度
    const contrast = this.calculateContrast(config.textColor, config.backgroundColor)
    
    // 计算形状复杂度
    const shapeComplexity = this.calculateShapeComplexity(config.shape, config.iconType)

    return {
      colorHue: color.h,
      saturation: color.s,
      brightness: color.l,
      fontWeight: this.getFontWeight(config.fontFamily),
      fontSize: config.fontSize || 24,
      aspectRatio: 1.0, // 假设为方形
      shapeComplexity,
      contrast
    }
  }

  /**
   * 获取样式推荐
   */
  async getRecommendations(features: DesignFeatures): Promise<StyleRecommendation[]> {
    if (!this.model || !this.isInitialized) {
      throw new Error('样式推荐器未初始化')
    }

    // 特征归一化
    const normalizedFeatures = this.normalizeFeatures(features)
    
    // 创建输入张量
    const input = tf.tensor2d([normalizedFeatures])
    
    // 预测
    const prediction = this.model.predict(input) as tf.Tensor
    const scoresData = await prediction.data()
    const scores = new Float32Array(scoresData)

    // 清理内存
    input.dispose()
    prediction.dispose()

    // 生成推荐结果
    const recommendations = this.generateRecommendations(scores)
    
    return recommendations.sort((a, b) => b.score - a.score)
  }

  /**
   * 特征归一化
   */
  private normalizeFeatures(features: DesignFeatures): number[] {
    return [
      features.colorHue / 360,
      features.saturation / 100,
      features.brightness / 100,
      (features.fontWeight - 100) / 800,
      (features.fontSize - 12) / 88,
      (features.aspectRatio - 0.5) / 1.5,
      features.shapeComplexity,
      features.contrast
    ]
  }

  /**
   * 生成推荐结果
   */
  private generateRecommendations(scores: Float32Array): StyleRecommendation[] {
    const styleTemplates = [
      {
        name: '现代简约',
        colors: { primary: '#2563eb', secondary: '#8b5cf6', accent: '#06b6d4' },
        fonts: { primary: 'Inter', secondary: 'Roboto' },
        characteristics: ['简洁线条', '高对比度', '几何形状', '现代感']
      },
      {
        name: '经典优雅',
        colors: { primary: '#374151', secondary: '#6b7280', accent: '#d97706' },
        fonts: { primary: 'Georgia', secondary: 'Times New Roman' },
        characteristics: ['传统美感', '优雅字体', '温和色调', '平衡布局']
      },
      {
        name: '创意活力',
        colors: { primary: '#ef4444', secondary: '#f59e0b', accent: '#8b5cf6' },
        fonts: { primary: 'Poppins', secondary: 'Montserrat' },
        characteristics: ['鲜艳色彩', '动感设计', '创新元素', '年轻活力']
      },
      {
        name: '极简主义',
        colors: { primary: '#000000', secondary: '#ffffff', accent: '#6b7280' },
        fonts: { primary: 'Helvetica', secondary: 'Arial' },
        characteristics: ['极简设计', '留白艺术', '纯净色彩', '功能至上']
      },
      {
        name: '商务专业',
        colors: { primary: '#1e40af', secondary: '#374151', accent: '#059669' },
        fonts: { primary: 'Open Sans', secondary: 'Lato' },
        characteristics: ['专业可信', '稳重色调', '清晰易读', '商务感']
      }
    ]

    return styleTemplates.map((template, index) => ({
      ...template,
      score: scores[index],
      confidence: Math.min(scores[index] * 1.2, 1.0)
    }))
  }

  /**
   * 工具方法：HEX 转 HSL
   */
  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  /**
   * 计算颜色对比度
   */
  private calculateContrast(color1: string, color2: string): number {
    // 简化的对比度计算
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    
    const l1 = this.getLuminance(rgb1)
    const l2 = this.getLuminance(rgb2)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    }
  }

  private getLuminance(rgb: { r: number, g: number, b: number }): number {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  /**
   * 计算形状复杂度
   */
  private calculateShapeComplexity(shape: string, iconType: string): number {
    let complexity = 0
    
    // 基于形状的复杂度
    switch (shape) {
      case 'circle': complexity += 0.1; break
      case 'square': complexity += 0.2; break
      case 'rounded': complexity += 0.3; break
      case 'hexagon': complexity += 0.6; break
      case 'diamond': complexity += 0.5; break
      default: complexity += 0.0
    }
    
    // 基于图标的复杂度
    if (iconType && iconType !== 'none') {
      complexity += 0.3
    }
    
    return Math.min(complexity, 1.0)
  }

  /**
   * 获取字体权重
   */
  private getFontWeight(fontFamily: string): number {
    const weights: { [key: string]: number } = {
      'Arial': 400,
      'Helvetica': 400,
      'Georgia': 400,
      'Times New Roman': 400,
      'Courier New': 400,
      'Impact': 700,
      'Comic Sans MS': 400,
      'Trebuchet MS': 400
    }
    return weights[fontFamily] || 400
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.isInitialized = false
  }
}

// 创建全局实例
export const styleRecommender = new StyleRecommender()
