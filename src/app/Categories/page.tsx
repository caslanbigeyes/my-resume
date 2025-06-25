'use client'
import React from "react";
import Layout from '../Components/Layout'
import { categories, getArticlesByCategory } from '@/lib/data'
import Link from 'next/link'

export default function CategoriesPage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">文章分类</h1>

                {/* 分类统计 */}
                <div className="mb-12 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <div className="text-2xl font-bold text-blue-600">
                                {categories.length}
                            </div>
                            <div className="text-sm text-gray-600">总分类数</div>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <div className="text-2xl font-bold text-green-600">
                                {categories.reduce((sum, cat) => sum + getArticlesByCategory(cat.slug).length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">总文章数</div>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <div className="text-2xl font-bold text-purple-600">
                                {Math.max(...categories.map(cat => getArticlesByCategory(cat.slug).length))}
                            </div>
                            <div className="text-sm text-gray-600">最多文章</div>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <div className="text-2xl font-bold text-orange-600">
                                {Math.round(categories.reduce((sum, cat) => sum + getArticlesByCategory(cat.slug).length, 0) / categories.length)}
                            </div>
                            <div className="text-sm text-gray-600">平均文章数</div>
                        </div>
                    </div>
                </div>

                {/* 分类列表 */}
                <div className="grid gap-6 md:grid-cols-2">
                    {categories.map(category => {
                        const articles = getArticlesByCategory(category.slug);
                        return (
                            <div
                                key={category._id}
                                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4"
                                style={{ borderLeftColor: category.color }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold" style={{ color: category.color }}>
                                        {category.name}
                                    </h3>
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                            backgroundColor: category.color + '20',
                                            color: category.color
                                        }}
                                    >
                                        {articles.length} 篇
                                    </span>
                                </div>

                                {category.description && (
                                    <p className="text-gray-600 mb-4">
                                        {category.description}
                                    </p>
                                )}

                                <div className="space-y-2 mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700">最新文章：</h4>
                                    {articles.slice(0, 3).map(article => (
                                        <Link
                                            key={article._id}
                                            href={`/articles/${article.slug}`}
                                            className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                                        >
                                            • {article.title}
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    href={`/categories/${category.slug}`}
                                    className="inline-flex items-center text-sm font-medium hover:underline"
                                    style={{ color: category.color }}
                                >
                                    查看所有文章 →
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}
