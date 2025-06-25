'use client'
import React from "react";
import { useParams } from 'next/navigation';
import Layout from '../../Components/Layout'
import { getArticleBySlug, getRelatedArticles, getTagById, getCategoryById } from '@/lib/data'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const article = getArticleBySlug(slug);
    
    if (!article) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">文章未找到</h1>
                    <p className="text-gray-600 mb-6">抱歉，您访问的文章不存在或已被删除。</p>
                    <Link 
                        href="/articles" 
                        className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        返回文章列表
                    </Link>
                </div>
            </Layout>
        );
    }

    const category = getCategoryById(article.category);
    const relatedArticles = getRelatedArticles(article.id);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 面包屑导航 */}
                <nav className="mb-8 text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-600">首页</Link>
                    <span className="mx-2">/</span>
                    <Link href="/articles" className="hover:text-blue-600">文章</Link>
                    {category && (
                        <>
                            <span className="mx-2">/</span>
                            <Link href={`/categories/${category.slug}`} className="hover:text-blue-600">
                                {category.name}
                            </Link>
                        </>
                    )}
                    <span className="mx-2">/</span>
                    <span className="text-gray-800">{article.title}</span>
                </nav>

                {/* 文章头部 */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        {category && (
                            <span 
                                className="px-3 py-1 text-sm rounded-full font-medium"
                                style={{ 
                                    backgroundColor: category.color + '20',
                                    color: category.color 
                                }}
                            >
                                {category.name}
                            </span>
                        )}
                        {article.featured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                                精选文章
                            </span>
                        )}
                        <span className="text-sm text-gray-500">
                            {article.readingTime} 分钟阅读
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                        {article.title}
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            <span>作者：{article.author.name}</span>
                            <span>发布于 {new Date(article.publishedAt).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            {article.updatedAt && (
                                <span>更新于 {new Date(article.updatedAt).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* 文章内容 */}
                <article className="prose prose-lg max-w-none mb-12">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-800">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">{children}</h3>,
                            p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                            code: ({ children, className }) => {
                                const isInline = !className;
                                if (isInline) {
                                    return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>;
                                }
                                return (
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                                        <code className="text-sm font-mono">{children}</code>
                                    </pre>
                                );
                            },
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
                                    {children}
                                </blockquote>
                            ),
                            ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-700">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-700">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                    >
                        {article.content}
                    </ReactMarkdown>
                </article>

                {/* 标签 */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">标签</h3>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map(tagId => {
                            const tag = getTagById(tagId);
                            return tag ? (
                                <Link
                                    key={tagId}
                                    href={`/tags/${tag.slug}`}
                                    className="px-3 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                                    style={{ 
                                        backgroundColor: tag.color + '20',
                                        color: tag.color,
                                        border: `1px solid ${tag.color}40`
                                    }}
                                >
                                    {tag.name}
                                </Link>
                            ) : null;
                        })}
                    </div>
                </div>

                {/* 相关文章 */}
                {relatedArticles.length > 0 && (
                    <section className="border-t border-gray-200 pt-8">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800">相关文章</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {relatedArticles.map(relatedArticle => {
                                const relatedCategory = getCategoryById(relatedArticle.category);
                                return (
                                    <div key={relatedArticle.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                            {relatedCategory && (
                                                <span 
                                                    className="px-2 py-1 text-xs rounded-full font-medium"
                                                    style={{ 
                                                        backgroundColor: relatedCategory.color + '20',
                                                        color: relatedCategory.color 
                                                    }}
                                                >
                                                    {relatedCategory.name}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {relatedArticle.readingTime} 分钟
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                                            <Link href={`/articles/${relatedArticle.slug}`} className="hover:text-blue-600">
                                                {relatedArticle.title}
                                            </Link>
                                        </h4>
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {relatedArticle.excerpt}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 导航按钮 */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                    <Link 
                        href="/articles" 
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ← 返回文章列表
                    </Link>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            回到顶部
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
