import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default async function Home() {
    const filePath = path.join(process.cwd(), "public", "zhao.md");
    const content = fs.readFileSync(filePath, "utf-8");

    return (
        <div className="prose mx-auto p-6">

            <ReactMarkdown>{content}</ReactMarkdown>

            <Link className="flex justify-center align-center w-full" href="/Home" className="opacity-50 hover:opacity-100 transition-opacity duration-300">*</Link>
        </div>
    )
}
