import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function AdminEmployers() {
  const [employers, setEmployers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('employer_profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setEmployers(data || []))
  }, [])

  const verify = async (id: string) => {
    await supabase.from('employer_profiles').update({ verified: true, verified_at: new Date().toISOString() }).eq('id', id)
    setEmployers(prev => prev.map(e => e.id === id ? { ...e, verified: true } : e))
    toast.success('Employer verified!')
  }

  const filtered = employers.filter(e =>
    e.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Employer Verification</h1>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" placeholder="Search employers..." />
      </div>
      <div className="space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{e.company_name}</p>
              <p className="text-sm text-gray-500">{e.email}</p>
              <a href={`https://${e.website}`} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">{e.website}</a>
            </div>
            {e.verified ? (
              <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                <ShieldCheckIcon className="w-4 h-4" /> Verified
              </span>
            ) : (
              <button onClick={() => verify(e.id)} className="btn-primary text-sm py-2 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" /> Verify
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}