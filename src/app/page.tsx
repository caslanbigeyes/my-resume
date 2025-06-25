'use client'
import React from "react";
import Layout from './Components/Layout'
import HomeContent from './Components/HomeContent'

// 如果你想要服务端重定向，可以使用下面的代码替换：
// import { redirect } from 'next/navigation'
// export default function Home() {
//     redirect('/Home')
// }

export default function Home() {
    return (
        <Layout>
            <HomeContent />
        </Layout>
    );
}
