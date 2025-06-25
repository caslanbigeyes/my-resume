'use client'
import React from "react";
import Layout from '../Components/Layout'
import { aboutContent, timeline, skills, projects } from '@/lib/data'
import Link from 'next/link'

export default function AboutPage() {
    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">{aboutContent.title}</h1>

                {/* 个人简介 */}
                <section className="mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">个人简介</h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed">
                            {aboutContent.sections
                                .find(section => section.type === 'text')
                                ?.content.split('\n')
                                .map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph.trim()}
                                    </p>
                                ))
                            }
                        </div>
                    </div>
                </section>

                {/* 个人经历时间线 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">个人经历</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        {timeline
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((item, index) => (
                                <div key={item.id} className="relative flex items-start mb-8">
                                    <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white ${
                                        item.type === 'work' ? 'bg-blue-500' :
                                        item.type === 'education' ? 'bg-green-500' :
                                        item.type === 'project' ? 'bg-purple-500' :
                                        'bg-orange-500'
                                    }`}></div>
                                    <div className="ml-10 bg-white rounded-lg shadow-md p-6 flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {item.title}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(item.date).toLocaleDateString('zh-CN', {
                                                    year: 'numeric',
                                                    month: 'long'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{item.description}</p>
                                        {item.company && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                <strong>公司：</strong>{item.company}
                                                {item.location && ` • ${item.location}`}
                                            </p>
                                        )}
                                        {item.technologies && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.technologies.map(tech => (
                                                    <span
                                                        key={tech}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </section>

                {/* 技能专长 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">技能专长</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                            <div key={category} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">{category}</h3>
                                <div className="space-y-3">
                                    {categorySkills.map(skill => (
                                        <div key={skill.id}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {skill.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {skill.level}/5
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${(skill.level / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            {skill.description && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {skill.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 项目作品 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">项目作品</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {projects.map(project => (
                            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 联系方式 */}
                <section className="text-center">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">联系我</h2>
                        <p className="text-gray-600 mb-4">
                            如果你对我的项目感兴趣，或者想要交流技术问题，欢迎联系我！
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href="mailto:your-email@example.com"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                发送邮件
                            </Link>
                            <Link
                                href="https://github.com/yourusername"
                                target="_blank"
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                            >
                                GitHub
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
