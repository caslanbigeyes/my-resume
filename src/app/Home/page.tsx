'use client'
import React, { useState } from "react";
import Link from "next/link";

export default function BlogPost() {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        if (isNavOpen) {
            setIsNavOpen(false);
        }
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 text-gray-900">
            {/* 顶部导航 */}
            <header className="flex justify-between items-center py-4 border-b border-gray-300">
                <h1 className="text-lg font-bold bg-black text-white px-4 py-2">个人记录</h1>
                <nav className={`hidden md:flex space-x-4 text-gray-600`}>
                    <Link href="/home" className="hover:text-black">首页</Link>
                    <Link href="/about" className="hover:text-black">关于</Link>
                    <Link href="/tags" className="hover:text-black">标签</Link>
                    <Link href="/categories" className="hover:text-black">分类</Link>
                </nav>
                <button onClick={toggleNav} className="md:hidden text-gray-600">☰</button>
            </header>
            <nav className={`site-nav transition-transform transform border-x-sky-100 border-gray-300 bg-white shadow-md absolute top-19 left-0 right-0 z-10 p-4 rounded-lg duration-500 ease-in-out ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
                <Link href="/home" className="block py-2 px-4 hover:bg-gray-200 transition-colors">首页</Link>
                <Link href="/about" className="block py-2 px-4 hover:bg-gray-200 transition-colors">关于</Link>
                <Link href="/tags" className="block py-2 px-4 hover:bg-gray-200 transition-colors">标签</Link>
                <Link href="/categories" className="block py-2 px-4 hover:bg-gray-200 transition-colors">分类</Link>
            </nav>

            {/* 文章内容 */}
            <article className="mt-6" >
                <h2 className="text-2xl font-bold">linux 有关网络操作的 11 个命令</h2>
                <p className="text-gray-500 text-sm mt-1">📅 发布于 2024-06-25 | 📂 分类于 <span className="text-blue-600">Linux</span></p>
                <p className="mt-4 text-gray-700">
                    下面的 11 个命令在进行 linux 网络操作很有用，特意记录下。
                </p>
                <div className="bg-gray-100 p-3 rounded-lg mt-4 border border-gray-300">
                    <p className="text-gray-600 font-semibold">原文链接：</p>
                    <a
                        href="https://github.com/oldratlee/translations/blob/master/how-to-work-with-network-from-linux-terminal/README.md"
                        className="text-blue-500 break-words"
                    >
                        https://github.com/oldratlee/translations/blob/master/how-to-work-with-network-from-linux-terminal/README.md
                    </a>
                </div>

                <h3 className="text-lg font-bold mt-6">curl & wget</h3>
                <p className="mt-2 text-gray-700">curl 和 wget 都可以下载文件</p>
            </article>
        </div>
    );
}
