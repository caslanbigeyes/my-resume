'use client'
import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import Link from 'next/link';
import { Calendar, Clock, BookOpen, Image, FileText } from 'lucide-react';

interface LearningNote {
  id: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: number;
  hasImages: boolean;
  slug: string;
}

export default function LearningNotesPage() {
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<LearningNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // 模拟数据 - 实际项目中这些数据会从文件系统或数据库中获取
  useEffect(() => {
    const mockNotes: LearningNote[] = [
      {
        id: '1',
        title: '测试0826今天',
        date: '2024-08-26',
        summary: '今天开始学习大模型应用开发，了解了基本概念和开发环境搭建',
        tags: ['大模型', '入门', '环境搭建'],
        readingTime: 5,
        hasImages: true,
        slug: '2024-08-26-getting-started'
      },
      {
        id: '2',
        title: 'Transformer架构深入理解',
        date: '2024-08-25',
        summary: '深入学习Transformer架构，包括注意力机制、编码器解码器结构等核心概念',
        tags: ['Transformer', '注意力机制', '深度学习'],
        readingTime: 15,
        hasImages: true,
        slug: '2024-08-25-transformer-architecture'
      },
      {
        id: '3',
        title: 'LangChain框架实践',
        date: '2024-08-24',
        summary: '学习LangChain框架的基本使用，包括链式调用、提示工程等',
        tags: ['LangChain', '框架', '实践'],
        readingTime: 12,
        hasImages: false,
        slug: '2024-08-24-langchain-practice'
      },
      {
        id: '4',
        title: 'RAG系统设计与实现',
        date: '2024-08-23',
        summary: '学习检索增强生成(RAG)系统的设计原理和实现方法',
        tags: ['RAG', '检索', '生成'],
        readingTime: 20,
        hasImages: true,
        slug: '2024-08-23-rag-system'
      }
    ];
    setNotes(mockNotes);
    setFilteredNotes(mockNotes);
  }, []);

  // 搜索和过滤功能
  useEffect(() => {
    let filtered = notes;
    
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }
    
    setFilteredNotes(filtered);
  }, [searchTerm, selectedTag, notes]);

  // 获取所有标签
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            🧠 大模型应用开发学习笔记
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            记录每日学习进度，分享大模型应用开发的心得体会和技术实践
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="glass-effect rounded-2xl p-6 card-shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索笔记标题、内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有标签</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-6 text-center card-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">{notes.length}</div>
            <div className="text-sm text-gray-600">总笔记数</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center card-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {notes.reduce((sum, note) => sum + note.readingTime, 0)}
            </div>
            <div className="text-sm text-gray-600">总学习时长(分钟)</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center card-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">{allTags.length}</div>
            <div className="text-sm text-gray-600">技术标签</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center card-shadow">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {notes.filter(note => note.hasImages).length}
            </div>
            <div className="text-sm text-gray-600">包含图片</div>
          </div>
        </div>

        {/* 笔记列表 */}
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 glass-effect rounded-2xl">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无匹配的学习笔记</h3>
              <p className="text-gray-500">尝试调整搜索条件或创建新的学习笔记</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="glass-effect rounded-2xl p-6 card-shadow hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{note.date}</span>
                      <Clock className="w-4 h-4 text-gray-500 ml-4" />
                      <span className="text-sm text-gray-600">{note.readingTime} 分钟</span>
                      {note.hasImages && (
                        <>
                          <Image className="w-4 h-4 text-gray-500 ml-4" />
                          <span className="text-sm text-gray-600">包含图片</span>
                        </>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                      <Link href={`/learning-notes/${note.slug}`} className="hover:underline">
                        {note.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {note.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/learning-notes/${note.slug}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-sm font-medium flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      阅读笔记
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 添加新笔记按钮 */}
        {/* <div className="text-center py-8">
          <Link
            href="/learning-notes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            <FileText className="w-5 h-5" />
            添加新的学习笔记
          </Link>
        </div> */}
      </div>
    </Layout>
  );
}