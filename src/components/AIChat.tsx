import { useState, useRef, useEffect } from 'react'
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INIT = "Hi! I am your ProSculpt AI assistant. I can help you find jobs, improve your resume, or prepare for interviews. What would you like help with?"

export default function AIChat({ onClose }: { onClose?: () => void }) {
  const { profile } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: INIT }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are ProSculpt AI. Student name: ${profile?.name ?? 'student'}. Help with jobs, resume, interviews.` },
            ...newMessages,
          ],
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices?.[0]?.message?.content ?? 'No response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50" style={{ height: '520px' }}>
      <div className="flex items-center justify-between px-5 py-4 bg-blue-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <SparklesIcon className="w-5 h-5" />
          <span className="font-bold">ProSculpt AI</span>
        </div>
        <button onClick={onClose} className="text-white hover:text-blue-200"><XMarkIcon className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
              {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Ask me anything..." />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-40">
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}