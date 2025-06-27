'use client'
import React, { useState } from "react";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 text-foreground bg-background min-h-screen">
            {/* 背景装饰 */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <header className="glass-effect rounded-2xl p-6 mb-8 card-shadow animate-fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold gradient-text">
                        ✨ 个人记录
                    </h1>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="nav-link group">
                                <span className="relative">
                                    首页
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link href="/articles" className="nav-link group">
                                <span className="relative">
                                    文章
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link href="/tools" className="nav-link group">
                                <span className="relative">
                                    🛠️ 工具集
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link href="/About" className="nav-link group">
                                <span className="relative">
                                    关于
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link href="/Tags" className="nav-link group">
                                <span className="relative">
                                    标签
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link href="/Categories" className="nav-link group">
                                <span className="relative">
                                    分类
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                        </nav>
                        <button
                            onClick={toggleNav}
                            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isNavOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${isNavOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 mt-1 ${isNavOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
            {/* 移动端导航菜单 */}
            <nav className={`
                md:hidden glass-effect rounded-2xl p-4 mb-6 card-shadow
                transition-all duration-500 ease-out transform
                ${isNavOpen
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                }
            `}>
                <div className="space-y-2">
                    <Link href="/" className="mobile-nav-link">
                        <span className="text-lg">🏠</span>
                        首页
                    </Link>
                    <Link href="/articles" className="mobile-nav-link">
                        <span className="text-lg">📝</span>
                        文章
                    </Link>
                    <Link href="/tools" className="mobile-nav-link">
                        <span className="text-lg">🛠️</span>
                        工具集
                    </Link>
                    <Link href="/About" className="mobile-nav-link">
                        <span className="text-lg">👤</span>
                        关于
                    </Link>
                    <Link href="/Tags" className="mobile-nav-link">
                        <span className="text-lg">🏷️</span>
                        标签
                    </Link>
                    <Link href="/Categories" className="mobile-nav-link">
                        <span className="text-lg">📂</span>
                        分类
                    </Link>
                </div>
            </nav>

            {/* 主内容区域 */}
            <main className="animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;