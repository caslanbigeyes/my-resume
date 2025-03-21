import fs from "fs";
import path from "path";
import React from "react";
import Layout from '../Components/Layout';
import ReactMarkdown from "react-markdown";

export default async function page() {
    const filePath = path.join(process.cwd(), "public", "about", "1.md");
    const content = fs.readFileSync(filePath, "utf-8");
    //  点击id可以跳转
    return (
        <Layout>
            <div>
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </Layout>
    );
}
