'use client'
import React from "react";
import { getLatestArticles, getFeaturedArticles, getStats, getTagBySlug, getCategoryBySlug } from '@/lib/data'
import Link from 'next/link'

export default function HomeContent() {
    const stats = getStats();
    const latestArticles = getLatestArticles(6);
    const featuredArticles = getFeaturedArticles();

    return (
        <div className="space-y-8">
            {/* 欢迎区域 */}
            <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Baby</h1>
                <p className="text-lg text-gray-600 mb-6">分享技术心得，记录成长历程</p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/articles"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        浏览文章
                    </Link>
                    <Link
                        href="/About"
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        了解我
                    </Link>
                </div>
            </section>

            {/* 统计数据 */}
            <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalArticles}</div>
                        <div className="text-sm text-gray-600">技术文章</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalTags}</div>
                        <div className="text-sm text-gray-600">技术标签</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalCategories}</div>
                        <div className="text-sm text-gray-600">文章分类</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <div className="text-3xl font-bold text-orange-600 mb-2">{Math.floor(stats.totalViews / 1000)}k+</div>
                        <div className="text-sm text-gray-600">总阅读量</div>
                    </div>
                </div>
            </section>

            {/* 精选文章 */}
            {featuredArticles.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">精选文章</h2>
                        <Link href="/articles" className="text-blue-600 hover:text-blue-800 text-sm">
                            查看更多 →
                        </Link>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {featuredArticles.slice(0, 3).map(article => {
                            const category = getCategoryBySlug(article.category);
                            return (
                                <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                                精选
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {article.readingTime.minutes} 分钟阅读
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800 line-clamp-2">
                                            <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {article.excerpt}
                                        </p>
                                        {category && (
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="px-2 py-1 text-xs rounded-full"
                                                    style={{
                                                        backgroundColor: category.color + '20',
                                                        color: category.color
                                                    }}
                                                >
                                                    {category.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 最新文章 */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">最新文章</h2>
                    <Link href="/articles" className="text-blue-600 hover:text-blue-800 text-sm">
                        查看全部 →
                    </Link>
                </div>
                <div className="space-y-4">
                    {latestArticles.map(article => {
                        const category = getCategoryBySlug(article.category);
                        return (
                            <div key={article._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {category && (
                                                <span
                                                    className="px-2 py-1 text-xs rounded-full font-medium"
                                                    style={{
                                                        backgroundColor: category.color + '20',
                                                        color: category.color
                                                    }}
                                                >
                                                    {category.name}
                                                </span>
                                            )}
                                            {article.featured && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                    精选
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                            <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                                            <span>{article.readingTime.minutes} 分钟阅读</span>
                                            <span>作者：{article.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 快速导航 */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">快速导航</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/articles"
                        className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <div className="text-2xl mb-2">📚</div>
                        <div className="text-sm font-medium text-gray-700">技术文章</div>
                    </Link>
                    <Link
                        href="/Tags"
                        className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <div className="text-2xl mb-2">🏷️</div>
                        <div className="text-sm font-medium text-gray-700">技术标签</div>
                    </Link>
                    <Link
                        href="/Categories"
                        className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                        <div className="text-2xl mb-2">📂</div>
                        <div className="text-sm font-medium text-gray-700">文章分类</div>
                    </Link>
                    <Link
                        href="/About"
                        className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                        <div className="text-2xl mb-2">👨‍💻</div>
                        <div className="text-sm font-medium text-gray-700">关于我</div>
                    </Link>
                </div>
            </section>
        </div>
    );
}
