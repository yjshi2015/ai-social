"use client";

import React from 'react';
import '@mysten/dapp-kit/dist/index.css';


export default function Home() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    欢迎来到 AI 涂鸦平台
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    这是一个基于人工智能的创意平台，让您的想象力自由翱翔
                </p>
                <div className="space-y-4 text-gray-500">
                    <p>🎨 使用 AI 将您的想法转化为独特的艺术作品</p>
                    <p>💾 自动保存到去中心化存储，永久保存您的创作</p>
                    <p>🌐 随时随地访问和分享您的作品</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">如何使用</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                        <li>点击顶部导航栏的 "Generate" 进入创作页面</li>
                        <li>输入您想要创作的图片描述</li>
                        <li>等待 AI 为您生成独特的艺术作品</li>
                        <li>将作品上传到去中心化存储进行永久保存</li>
                    </ol>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">特色功能</h2>
                    <ul className="space-y-3 text-gray-600">
                        <li>✨ 先进的 AI 图像生成技术</li>
                        <li>🔒 去中心化存储保障作品安全</li>
                        <li>🔍 支持在 Display 页面浏览所有作品</li>
                        <li>🔗 便捷的作品分享功能</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
