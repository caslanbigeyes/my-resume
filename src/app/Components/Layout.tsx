'use client'
import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen transition-colors">
            <header className="flex justify-between items-center py-4 border-b border-gray-300 dark:border-gray-600">
                <h1 className="text-lg font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-2 transition-colors">个人记录</h1>
                <div className="flex items-center gap-4">
                    <nav className={`hidden md:flex space-x-4 text-gray-600 dark:text-gray-300`}>
                        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">首页</Link>
                        <Link href="/articles" className="hover:text-black dark:hover:text-white transition-colors">文章</Link>
                        <Link href="/tools" className="hover:text-black dark:hover:text-white transition-colors">🛠️ 工具集</Link>
                        <Link href="/About" className="hover:text-black dark:hover:text-white transition-colors">关于</Link>
                        <Link href="/Tags" className="hover:text-black dark:hover:text-white transition-colors">标签</Link>
                        <Link href="/Categories" className="hover:text-black dark:hover:text-white transition-colors">分类</Link>
                    </nav>
                    <ThemeToggle />
                    <button onClick={toggleNav} className="md:hidden text-gray-600 dark:text-gray-300">☰</button>
                </div>
            </header>
            <nav className={`site-nav transition-transform transform border-x-sky-100 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md absolute top-19 left-0 right-0 z-10 p-4 rounded-lg duration-500 ease-in-out ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
                <Link href="/" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">首页</Link>
                <Link href="/articles" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">文章</Link>
                <Link href="/tools" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">🛠️ 工具集</Link>
                <Link href="/About" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">关于</Link>
                <Link href="/Tags" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">标签</Link>
                <Link href="/Categories" className="block py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">分类</Link>
            </nav>
            <div className="transition-colors">
                {children} {/* 渲染子组件 */}
            </div>
        </div>
    );
};

export default Layout;