'use client'
import React from "react";
import Layout from '../Components/Layout'
import { getPageBySlug, getFeaturedProjects } from '@/lib/data'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function AboutPage() {
    const aboutPage = getPageBySlug('about');
    const featuredProjects = getFeaturedProjects();

    if (!aboutPage) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">页面未找到</h1>
                    <p className="text-gray-600 mb-6">抱歉，关于页面暂时无法访问。</p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        返回首页
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">{aboutPage.title}</h1>

                {/* 页面描述 */}
                {aboutPage.description && (
                    <div className="text-center mb-8">
                        <p className="text-lg text-gray-600">{aboutPage.description}</p>
                    </div>
                )}

                {/* 页面内容 */}
                <section className="mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="prose prose-lg max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-800">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">{children}</h3>,
                                    p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-700">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-700">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
                                            {children}
                                        </blockquote>
                                    ),
                                }}
                            >
                                {aboutPage.body.raw}
                            </ReactMarkdown>
                        </div>
                    </div>
                </section>

                {/* 精选项目 */}
                {featuredProjects.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">精选项目</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {featuredProjects.map(project => (
                                <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    {project.imageUrl && (
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500">项目截图</span>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {project.title}
                                            </h3>
                                            {project.featured && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                    精选
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mb-4">{project.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.technologies.map(tech => (
                                                <span
                                                    key={tech}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            {project.githubUrl && (
                                                <Link
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    GitHub →
                                                </Link>
                                            )}
                                            {project.liveUrl && (
                                                <Link
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    在线预览 →
                                                </Link>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-3">
                                            状态: {project.status === 'completed' ? '已完成' :
                                                   project.status === 'in-progress' ? '进行中' :
                                                   project.status === 'planning' ? '计划中' : '已归档'}
                                            {project.startDate && (
                                                <span className="ml-2">
                                                    开始时间: {new Date(project.startDate).toLocaleDateString('zh-CN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 联系方式 */}
                <section className="text-center">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">联系我</h2>
                        <p className="text-gray-600 mb-4">
                            如果你对我的项目感兴趣，或者想要交流技术问题，欢迎联系我！
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href="mailto:zhangsan@example.com"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                发送邮件
                            </Link>
                            <Link
                                href="https://github.com/zhangsan"
                                target="_blank"
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                            >
                                GitHub
                            </Link>
                        </div>

                        {aboutPage.lastUpdated && (
                            <p className="text-xs text-gray-500 mt-4">
                                最后更新: {new Date(aboutPage.lastUpdated).toLocaleDateString('zh-CN')}
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
