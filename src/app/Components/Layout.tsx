'use client'
import React, { useState } from "react";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 text-gray-900">
            <header className="flex justify-between items-center py-4 border-b border-gray-300">
                <h1 className="text-lg font-bold bg-black text-white px-4 py-2">个人记录</h1>
                <nav className={`hidden md:flex space-x-4 text-gray-600`}>
                    <Link href="/Home" className="hover:text-black">首页</Link>
                    <Link href="/About" className="hover:text-black">关于</Link>
                    <Link href="/Tags" className="hover:text-black">标签</Link>
                    <Link href="/Categories" className="hover:text-black">分类</Link>
                </nav>
                <button onClick={toggleNav} className="md:hidden text-gray-600">☰</button>
            </header>
            <nav className={`site-nav transition-transform transform border-x-sky-100 border-gray-300 bg-white shadow-md absolute top-19 left-0 right-0 z-10 p-4 rounded-lg duration-500 ease-in-out ${isNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
                <Link href="/Home" className="block py-2 px-4 hover:bg-gray-200 transition-colors">首页</Link>
                <Link href="/About" className="block py-2 px-4 hover:bg-gray-200 transition-colors">关于</Link>
                <Link href="/Tags" className="block py-2 px-4 hover:bg-gray-200 transition-colors">标签</Link>
                <Link href="/Categories" className="block py-2 px-4 hover:bg-gray-200 transition-colors">分类</Link>
            </nav>
            {children} {/* 渲染子组件 */}
        </div>
    );
};

export default Layout; 