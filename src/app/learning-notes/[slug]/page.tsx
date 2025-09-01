'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../Components/Layout';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLearningNoteBySlug } from '@/lib/data';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function LearningNoteDetailPage({ params }: PageProps) {
  // 检查 params 是否存在以及 slug 是否存在
  if (!params || !params.slug) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">页面错误</h1>
          <p className="text-gray-600 mb-8">无法获取笔记信息。</p>
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

  const slug = params.slug as string;
  const note = getLearningNoteBySlug(slug);

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
              <span>{new Date(note.date).toISOString().split('T')[0]}</span>
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
              {note.body.raw}
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