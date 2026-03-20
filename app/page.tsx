'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function CafeApp() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, communication error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md text-center">
        <h1 className="text-2xl font-bold tracking-widest">CAFE App</h1>
        <p className="text-xs opacity-80">Chat App for Fukui English</p>
      </header>

      {/* Main Chat Area - Optimized for PC/iPad (max-width set) */}
      <main className="flex-1 overflow-hidden flex justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-inner flex flex-col border border-gray-200">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                <p>Hello! Let's practice English.</p>
                <p>何でも英語で話しかけてみてね！</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl text-lg shadow-sm ${
                  m.role === 'user' ? 'bg-green-500 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-gray-400 animate-pulse text-sm">AI Teacher is thinking...</div>}
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
                className="flex-1 p-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 transition-colors font-bold disabled:bg-gray-400"
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