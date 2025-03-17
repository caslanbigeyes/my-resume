'use client'
import React, { useState } from "react";
import Link from "next/link";
import Layout from '../Components/Layout'

export default function BlogPost() {


    return (
        <Layout>
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
        </Layout>
    );
}
