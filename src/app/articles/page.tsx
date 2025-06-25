'use client'
import React, { useState } from "react";
import Layout from '../Components/Layout'
import { getPublishedArticles, getFeaturedArticles, tags, categories, getTagBySlug, getCategoryBySlug } from '@/lib/data'
import Link from 'next/link'

export default function ArticlesPage() {
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const allArticles = getPublishedArticles();
    const featuredArticles = getFeaturedArticles();

    // 过滤文章
    const filteredArticles = allArticles.filter(article => {
        const matchesTag = !selectedTag || article.tags.includes(selectedTag);
        const matchesCategory = !selectedCategory || article.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTag && matchesCategory && matchesSearch;
    });

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">技术文章</h1>

                {/* 搜索和过滤 */}
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                搜索文章
                            </label>
                            <input
                                type="text"
                                placeholder="输入关键词..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                按分类筛选
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">所有分类</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                按标签筛选
                            </label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">所有标签</option>
                                {tags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(selectedTag || selectedCategory || searchQuery) && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-600">当前筛选：</span>
                            {selectedCategory && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {getCategoryById(selectedCategory)?.name}
                                </span>
                            )}
                            {selectedTag && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {getTagById(selectedTag)?.name}
                                </span>
                            )}
                            {searchQuery && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    "{searchQuery}"
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedTag('');
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                清除筛选
                            </button>
                        </div>
                    )}
                </div>

                {/* 精选文章 */}
                {!selectedTag && !selectedCategory && !searchQuery && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6">精选文章</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredArticles.map(article => (
                                <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
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
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {article.tags.slice(0, 3).map(tagSlug => {
                                                const tag = getTagBySlug(tagSlug);
                                                return tag ? (
                                                    <span
                                                        key={tagSlug}
                                                        className="px-2 py-1 text-xs rounded-full"
                                                        style={{
                                                            backgroundColor: tag.color + '20',
                                                            color: tag.color
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                                            <span>作者：{article.author}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 文章列表 */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">
                            {selectedTag || selectedCategory || searchQuery ? '筛选结果' : '所有文章'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            共 {filteredArticles.length} 篇文章
                        </span>
                    </div>

                    {filteredArticles.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">没有找到符合条件的文章</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredArticles.map(article => {
                                const category = getCategoryBySlug(article.category);
                                return (
                                    <div key={article._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {category && (
                                                    <span
                                                        className="px-3 py-1 text-xs rounded-full font-medium"
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
                                            <span className="text-xs text-gray-500">
                                                {article.readingTime.minutes} 分钟阅读
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                            <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                                                {article.title}
                                            </Link>
                                        </h3>

                                        <p className="text-gray-600 mb-4">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {article.tags.map(tagSlug => {
                                                const tag = getTagBySlug(tagSlug);
                                                return tag ? (
                                                    <Link
                                                        key={tagSlug}
                                                        href={`/tags/${tag.slug}`}
                                                        className="px-2 py-1 text-xs rounded-full hover:opacity-80 transition-opacity"
                                                        style={{
                                                            backgroundColor: tag.color + '20',
                                                            color: tag.color
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </Link>
                                                ) : null;
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>发布于 {new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                                            <span>作者：{article.author.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
