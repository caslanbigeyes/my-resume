import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import Client from "./Components/Client.js";


export default async function Home() {
    const filePath = path.join(process.cwd(), "public", "zhao.md");
    const content = fs.readFileSync(filePath, "utf-8");

    // Convert Markdown to Word format (simple conversion)
    const wordContent = content.replace(/#/g, ''); // Basic conversion, you may want to improve this
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);



    return (
        <div className="prose mx-auto p-6">

            <ReactMarkdown>{content}</ReactMarkdown>

            {/* <Link className="flex justify-center align-center w-full opacity-50 hover:opacity-100 transition-opacity duration-300" href="/Home" >*</Link> */}
            <Client  content={content} />
        </div>
    )
}
