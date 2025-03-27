'use client';
import React, { useEffect } from 'react'

export default function Client({ content }) {

  // Convert Markdown to Word format (simple conversion)
  const wordContent = content.replace(/#/g, ''); // Basic conversion, you may want to improve this
  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = "赵小霞.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // 释放对象 URL
  };

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url); // 组件卸载时释放对象 URL
    };
  }, [url]);

  return (
    <div className='flex justify-center align-center w-full opacity-50 hover:opacity-100 transition-opacity duration-300 mt-4'>
          <button onClick={handleDownload}>Download</button>
    </div>
  )
}