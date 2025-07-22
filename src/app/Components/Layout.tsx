'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleNav = () => {
        if (!isNavOpen) {
            // 打开菜单
            setIsNavOpen(true);
            setIsAnimating(true);
        } else {
            // 关闭菜单
            setIsAnimating(false);
            // 延迟设置 display: none
            setTimeout(() => {
                setIsNavOpen(false);
            }, 300); // 与动画时长匹配
        }
    };

    // 处理菜单项点击，自动关闭菜单
    const handleNavItemClick = () => {
        if (isNavOpen) {
            setIsAnimating(false);
            setTimeout(() => {
                setIsNavOpen(false);
            }, 300);
        }
    };

    // 监听屏幕尺寸变化，大屏幕时自动关闭移动端菜单
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isNavOpen) {
                setIsNavOpen(false);
                setIsAnimating(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isNavOpen]);

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
                        ✨ 个人文档
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
                                    工具集
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
            {/* 移动端导航菜单背景遮罩 */}
            {isNavOpen && (
                <div
                    className={`
                        fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden
                        transition-opacity duration-300 ease-out
                        ${isAnimating ? 'opacity-100' : 'opacity-0'}
                    `}
                    onClick={toggleNav}
                />
            )}

            {/* 移动端导航菜单 */}
            {isNavOpen && (
                <nav className={`
                    md:hidden glass-effect rounded-2xl p-4 mb-6 card-shadow relative z-50
                    transition-all duration-300 ease-out transform origin-top
                    ${isAnimating
                        ? 'opacity-100 translate-y-0 scale-100 rotate-0'
                        : 'opacity-0 -translate-y-8 scale-95 -rotate-1'
                    }
                `}>
                    <div className="space-y-1">
                        {[
                            { href: "/", icon: "🏠", label: "首页", delay: "delay-[50ms]" },
                            { href: "/articles", icon: "📝", label: "文章", delay: "delay-[100ms]" },
                            { href: "/tools", icon: "🛠️", label: "工具集", delay: "delay-[150ms]" },
                            { href: "/About", icon: "👤", label: "关于", delay: "delay-[200ms]" },
                            { href: "/Tags", icon: "🏷️", label: "标签", delay: "delay-[250ms]" },
                            { href: "/Categories", icon: "📂", label: "分类", delay: "delay-[300ms]" }
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    mobile-nav-link group
                                    transition-all duration-300 ease-out transform
                                    ${isAnimating
                                        ? `opacity-100 translate-x-0 ${item.delay}`
                                        : 'opacity-0 -translate-x-4'
                                    }
                                `}
                                onClick={handleNavItemClick}
                            >
                                <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                                    {item.icon}
                                </span>
                                <span className="relative">
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                                <span className="ml-auto opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* 菜单装饰动画 */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full opacity-30 animate-pulse"></div>
                </nav>
            )}

            {/* 主内容区域 */}
            <main className="animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;