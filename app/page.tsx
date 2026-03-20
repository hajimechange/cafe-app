'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react'; // アイコンを追加

export default function CafeApp() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false); // コピー完了表示用
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, communication error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // チャット内容をコピーする機能
  const copyToClipboard = () => {
    const text = messages
      .map(m => `${m.role === 'user' ? 'Me' : 'Teacher'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center px-6">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold tracking-widest text-white">CAFE App</h1>
          <p className="text-xs opacity-80">Chat App for Fukui English</p>
        </div>
        <div className="flex-1 flex justify-end">
          {/* 3つ目の機能：コピーボタン */}
          {messages.length > 0 && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm transition-all shadow-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Chat'}
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-inner flex flex-col border border-gray-200">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                <p className="text-lg">Hello! Let's practice English.</p>
                <p>何でも英語で話しかけてみてね！</p>
              </div>
            )}
            
           {messages.map((m, i) => {
  const isAI = m.role === 'model';
  const isAdvice = isAI && m.content.includes("【アドバイス】");

  return (
    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
      <div className={`max-w-[85%] p-4 rounded-2xl text-lg shadow-sm ${
        m.role === 'user' 
          ? 'bg-green-500 text-white rounded-tr-none' 
          : isAdvice 
            ? 'bg-yellow-50 border border-yellow-200 text-gray-700 rounded-xl rounded-tl-none italic' // アドバイスなら黄色
            : 'bg-gray-200 text-gray-800 rounded-tl-none' // 普通の会話ならグレー
      }`}>
        {/* アドバイスの場合は先頭に電球アイコンを付ける */}
        {isAdvice && <span className="font-bold text-yellow-700 block mb-1">💡 Teacher's Check:</span>}
        {m.content}
      </div>
    </div>
  );
})}
            
            {isLoading && (
              <div className="text-gray-400 animate-pulse text-sm">AI Teacher is thinking...</div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <div className="flex gap-4 max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-sm bg-white"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 transition-colors font-bold disabled:bg-gray-400 shadow-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
