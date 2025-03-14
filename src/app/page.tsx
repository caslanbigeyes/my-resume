import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default async function Home() {
    const filePath = path.join(process.cwd(), "public", "zhao.md");
    const content = fs.readFileSync(filePath, "utf-8");

    return <div className="prose mx-auto p-6"><ReactMarkdown>{content}</ReactMarkdown></div>;
}
