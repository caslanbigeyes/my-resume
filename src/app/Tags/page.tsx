'use client'
import React from "react";
import Layout from '../Components/Layout'
import { tags, getArticlesByTag } from '@/lib/data'
import Link from 'next/link'

export default function TagsPage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">技术标签</h1>

                {/* 标签云 */}
                <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-6">标签云</h2>
                    <div className="flex flex-wrap gap-3">
                        {tags.map(tag => (
                            <Link
                                key={tag._id}
                                href={`/tags/${tag.slug}`}
                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: tag.color + '20',
                                    color: tag.color,
                                    border: `1px solid ${tag.color}40`
                                }}
                            >
                                {tag.name}
                                <span className="ml-2 text-xs opacity-75">
                                    {getArticlesByTag(tag.slug).length}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 标签列表 */}
                <div>
                    <h2 className="text-xl font-semibold mb-6">所有标签</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tags.map(tag => {
                            const articles = getArticlesByTag(tag.slug);
                            return (
                                <div
                                    key={tag._id}
                                    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold" style={{ color: tag.color }}>
                                            {tag.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {articles.length} 篇文章
                                        </span>
                                    </div>

                                    {tag.description && (
                                        <p className="text-gray-600 text-sm mb-4">
                                            {tag.description}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        {articles.slice(0, 3).map(article => (
                                            <Link
                                                key={article._id}
                                                href={`/articles/${article.slug}`}
                                                className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                                            >
                                                • {article.title}
                                            </Link>
                                        ))}
                                        {articles.length > 3 && (
                                            <Link
                                                href={`/tags/${tag.slug}`}
                                                className="block text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                查看更多 ({articles.length - 3} 篇)
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
