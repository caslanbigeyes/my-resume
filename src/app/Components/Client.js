'use client';
import React from 'react'

export default function Client() {
  const handleDownload = () => {
    // Create link to download local file
    const link = document.createElement('a');
    link.href = '/zxx.docx';
    link.download = 'zxx.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='flex justify-center align-center w-full opacity-50 hover:opacity-100 transition-opacity duration-300 mt-4'>
          <button onClick={handleDownload}>Download</button>
    </div>
  )
}