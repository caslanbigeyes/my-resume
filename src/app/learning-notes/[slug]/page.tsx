'use client'
import React, { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LearningNoteDetail {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  readingTime: number;
  hasImages: boolean;
  slug: string;
  images?: string[];
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function LearningNoteDetailPage({ params }: PageProps) {
  const [note, setNote] = useState<LearningNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从文件系统或API获取笔记内容
    const fetchNote = async () => {
      setLoading(true);
      
      // 模拟数据 - 实际项目中会根据slug从文件系统读取markdown文件
      const mockNotes: { [key: string]: LearningNoteDetail } = {
        '2024-08-26-getting-started': {
          id: '1',
          title: '测试0826今天',
          date: '2024-08-26',
          summary: '今天开始学习大模型应用开发，了解了基本概念和开发环境搭建',
          tags: ['大模型', '入门', '环境搭建'],
          readingTime: 5,
          hasImages: true,
          slug: '2024-08-26-getting-started',
          images: ['/images/learning-notes/llm-overview.png', '/images/learning-notes/dev-setup.png'],
          content: `# 大模型应用开发入门

## 今日学习目标
- 了解大模型的基本概念
- 搭建开发环境
- 运行第一个示例程序

## 学习内容

### 1. 大模型基础概念

大语言模型（Large Language Model, LLM）是一种基于深度学习的自然语言处理模型，具有以下特点：

- **规模庞大**：参数量通常在数十亿到数千亿级别
- **预训练**：在大量文本数据上进行无监督预训练
- **通用性强**：可以处理多种NLP任务
- **涌现能力**：在规模达到一定程度时展现出意想不到的能力

![大模型概览](/images/learning-notes/llm-overview.png)

### 2. 开发环境搭建

#### 必需工具
\`\`\`bash
# 安装Python 3.8+
python --version

# 安装必要的包
pip install openai
pip install langchain
pip install streamlit
pip install python-dotenv
\`\`\`

#### 环境配置
\`\`\`python
# .env 文件配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
\`\`\`

![开发环境搭建](/images/learning-notes/dev-setup.png)

### 3. 第一个示例程序

\`\`\`python
import openai
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

# 配置OpenAI客户端
client = openai.OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

def chat_with_llm(message):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message.content

# 测试
if __name__ == "__main__":
    user_input = "你好，请介绍一下大语言模型"
    response = chat_with_llm(user_input)
    print(f"用户: {user_input}")
    print(f"AI: {response}")
\`\`\`

## 今日收获

1. **理论基础**：掌握了大模型的基本概念和发展历程
2. **实践能力**：成功搭建了开发环境并运行了第一个程序
3. **工具熟悉**：了解了OpenAI API的基本使用方法

## 明日计划

- [ ] 深入学习Transformer架构
- [ ] 了解提示工程（Prompt Engineering）
- [ ] 实践更复杂的对话系统

## 参考资料

- [OpenAI API文档](https://platform.openai.com/docs)
- [LangChain官方文档](https://python.langchain.com/)
- [《大语言模型》- 赵鑫等著](https://example.com)

---

**学习心得**：今天是正式开始大模型应用开发学习的第一天，虽然内容相对基础，但为后续深入学习打下了良好的基础。环境搭建过程中遇到了一些API配置问题，通过查阅文档和实践最终解决了。`
        },
        '2024-08-25-transformer-architecture': {
          id: '2',
          title: 'Transformer架构深入理解',
          date: '2024-08-25',
          summary: '深入学习Transformer架构，包括注意力机制、编码器解码器结构等核心概念',
          tags: ['Transformer', '注意力机制', '深度学习'],
          readingTime: 15,
          hasImages: true,
          slug: '2024-08-25-transformer-architecture',
          images: ['/images/learning-notes/transformer-arch.png'],
          content: `# Transformer架构深入理解

## 学习目标
- 理解Transformer的整体架构
- 掌握自注意力机制的原理
- 了解位置编码的作用

## 核心内容

### 1. Transformer整体架构

Transformer是一种基于注意力机制的神经网络架构，由编码器和解码器组成。

### 2. 自注意力机制

自注意力机制允许模型在处理序列时关注序列中的不同位置。

\`\`\`python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        
        # 线性变换并重塑为多头
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 计算注意力
        attention_output = self.scaled_dot_product_attention(Q, K, V, mask)
        
        # 合并多头
        attention_output = attention_output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.d_model
        )
        
        return self.W_o(attention_output)
    
    def scaled_dot_product_attention(self, Q, K, V, mask=None):
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attention_weights = torch.softmax(scores, dim=-1)
        return torch.matmul(attention_weights, V)
\`\`\`

## 今日收获
深入理解了Transformer的核心机制，为后续学习大模型奠定了理论基础。`
        },
        '2024-08-24-langchain-practice': {
          id: '3',
          title: 'LangChain框架实践',
          date: '2024-08-24',
          summary: '学习LangChain框架的基本使用，包括链式调用、提示工程等',
          tags: ['LangChain', '框架', '实践'],
          readingTime: 12,
          hasImages: false,
          slug: '2024-08-24-langchain-practice',
          content: `# LangChain框架实践

## 学习目标
- 掌握LangChain的基本概念
- 实践链式调用
- 学习提示模板的使用

## 实践内容

### 1. LangChain基础

LangChain是一个用于构建基于语言模型应用的框架。

\`\`\`python
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# 初始化LLM
llm = OpenAI(temperature=0.7)

# 创建提示模板
prompt = PromptTemplate(
    input_variables=["topic"],
    template="请写一篇关于{topic}的简短介绍"
)

# 创建链
chain = LLMChain(llm=llm, prompt=prompt)

# 运行链
result = chain.run("人工智能")
print(result)
\`\`\`

### 2. 复杂链式调用

\`\`\`python
from langchain.chains import SimpleSequentialChain

# 第一个链：生成主题
first_prompt = PromptTemplate(
    input_variables=["subject"],
    template="为{subject}课程生成一个有趣的主题"
)
first_chain = LLMChain(llm=llm, prompt=first_prompt)

# 第二个链：基于主题写内容
second_prompt = PromptTemplate(
    input_variables=["topic"],
    template="为主题'{topic}'写一个详细的大纲"
)
second_chain = LLMChain(llm=llm, prompt=second_prompt)

# 组合链
overall_chain = SimpleSequentialChain(
    chains=[first_chain, second_chain],
    verbose=True
)

result = overall_chain.run("机器学习")
\`\`\`

## 学习心得
LangChain大大简化了LLM应用的开发流程，链式调用的设计很优雅。`
        },
        '2024-08-23-rag-system': {
          id: '4',
          title: 'RAG系统设计与实现',
          date: '2024-08-23',
          summary: '学习检索增强生成(RAG)系统的设计原理和实现方法',
          tags: ['RAG', '检索', '生成'],
          readingTime: 20,
          hasImages: true,
          slug: '2024-08-23-rag-system',
          images: ['/images/learning-notes/rag-architecture.png'],
          content: `# RAG系统设计与实现

## 学习目标
- 理解RAG系统的工作原理
- 实现一个简单的RAG系统
- 了解向量数据库的使用

## RAG系统概述

检索增强生成（Retrieval-Augmented Generation, RAG）是一种结合了检索和生成的方法，能够让语言模型访问外部知识库。

### 系统架构

1. **文档处理**：将文档分块并向量化
2. **检索**：根据查询检索相关文档片段
3. **生成**：基于检索到的内容生成回答

\`\`\`python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# 1. 加载文档
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# 2. 文档分块
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# 3. 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings)

# 4. 创建检索QA链
qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 5. 查询
query = "什么是机器学习？"
result = qa.run(query)
print(result)
\`\`\`

## 实践收获
RAG系统能够有效解决LLM知识更新和幻觉问题，是构建实用AI应用的重要技术。`
        }
      };

      // 模拟异步加载
      setTimeout(() => {
        const foundNote = mockNotes[params.slug];
        setNote(foundNote || null);
        setLoading(false);
      }, 500);
    };

    fetchNote();
  }, [params.slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">笔记未找到</h1>
          <p className="text-gray-600 mb-8">抱歉，您要查找的学习笔记不存在。</p>
          <Link
            href="/learning-notes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回笔记列表
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 返回按钮 */}
        <div className="flex items-center gap-4">
          <Link
            href="/learning-notes"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回笔记列表
          </Link>
        </div>

        {/* 笔记头部信息 */}
        <div className="glass-effect rounded-2xl p-8 card-shadow">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{note.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{note.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{note.readingTime} 分钟阅读</span>
            </div>
            {note.hasImages && (
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>包含图片</span>
              </div>
            )}
          </div>

          <p className="text-lg text-gray-700 mb-6">{note.summary}</p>

          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 笔记内容 */}
        <div className="glass-effect rounded-2xl p-8 card-shadow">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 自定义代码块样式
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                // 自定义图片样式
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                    loading="lazy"
                  />
                ),
                // 自定义标题样式
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b border-gray-200 pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2" {...props} />
                ),
                // 自定义链接样式
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                ),
                // 自定义列表样式
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1 text-gray-700" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-1 text-gray-700" {...props} />
                ),
                // 自定义引用样式
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 bg-blue-50 py-2 rounded-r" {...props} />
                ),
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* 相关笔记推荐 */}
        <div className="glass-effect rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">相关学习笔记</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/learning-notes/2024-08-25-transformer-architecture"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-800 mb-2">Transformer架构深入理解</h4>
              <p className="text-sm text-gray-600">深入学习Transformer架构，包括注意力机制...</p>
            </Link>
            <Link
              href="/learning-notes/2024-08-24-langchain-practice"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-800 mb-2">LangChain框架实践</h4>
              <p className="text-sm text-gray-600">学习LangChain框架的基本使用，包括链式调用...</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}