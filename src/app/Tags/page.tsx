'use client'
import React, { useState, useEffect } from "react";
import Layout from '../Components/Layout'

// 添加算法题表单组件
const AlgorithmForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        category: '',
        difficulty: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <input
                type="text"
                placeholder="题目名称"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="block w-full mb-2 p-2 border rounded"
            />
            <input
                type="text"
                placeholder="题目链接"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="block w-full mb-2 p-2 border rounded"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                添加题目
            </button>
        </form>
    );
};

export default function Page() {
    const [algorithms, setAlgorithms] = useState([]);

    useEffect(() => {
        fetchAlgorithms();
    }, []);

    const fetchAlgorithms = async () => {
        const response = await fetch('/api/algorithms');
        const data = await response.json();
        setAlgorithms(data);
    };

    const handleSubmit = async (formData) => {
        try {
            const response = await fetch('/api/algorithms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                fetchAlgorithms(); // 重新获取列表
            }
        } catch (error) {
            console.error('Error adding algorithm:', error);
        }
    };

    return (
        <Layout>
            <div className="text-[18px] mb-4">算法随想录</div>
            <AlgorithmForm onSubmit={handleSubmit} />
            {algorithms.map((item) => (
                <a 
                    key={item.id} 
                    className="block mb-2 hover:text-blue-500" 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    {item.title}
                </a>
            ))}
        </Layout>
    );
}
