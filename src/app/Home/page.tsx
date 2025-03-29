'use client'
import React from "react";
import Layout from '../Components/Layout'

export default function BlogPost() {


    return (
        <Layout>
            {/* 文章内容 */}
            <article className="mt-6" >
            <div className="flex flex-col items-center mt-4 p-4 border rounded-lg shadow-md bg-white">
                <h2 className="text-xl font-semibold mb-2">访客统计</h2>
                <div className="flex justify-between w-full mb-2">
                    <div className="text-center">
                        <p className="text-lg font-bold">当前在线访客</p>
                        <p className="text-2xl text-blue-600">42</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold">总访问量</p>
                        <p className="text-2xl text-blue-600">1,234</p>
                    </div>
                </div>
                <p className="text-gray-600 text-sm">数据更新于：{new Date().toLocaleString()}</p>
            </div>
            </article>
        </Layout>
    );
}
