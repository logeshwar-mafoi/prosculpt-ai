import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function AdminColleges() {
  const [colleges, setColleges] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('college_profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setColleges(data || []))
  }, [])

  const verify = async (id: string) => {
    await supabase.from('college_profiles').update({ verified: true }).eq('id', id)
    setColleges(prev => prev.map(c => c.id === id ? { ...c, verified: true } : c))
    toast.success('College verified!')
  }

  const toggleSubscription = async (id: string, current: boolean) => {
    await supabase.from('college_profiles').update({ subscription_active: !current }).eq('id', id)
    setColleges(prev => prev.map(c => c.id === id ? { ...c, subscription_active: !current } : c))
    toast.success(!current ? 'Subscription activated' : 'Subscription deactivated')
  }

  const filtered = colleges.filter(c =>
    c.college_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">College Management</h1>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" placeholder="Search colleges..." />
      </div>
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{c.college_name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
              <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">{c.website}</a>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
              {!c.verified ? (
                <button onClick={() => verify(c.id)} className="btn-primary text-sm py-2 flex items-center gap-1">
                  <ShieldCheckIcon className="w-4 h-4" /> Verify
                </button>
              ) : <span className="badge bg-green-100 text-green-700">Verified ✅</span>}
              <button onClick={() => toggleSubscription(c.id, c.subscription_active)}
                className={`text-sm px-3 py-2 rounded-xl font-semibold transition-colors ${c.subscription_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}`}>
                {c.subscription_active ? 'Deactivate' : 'Activate Sub'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}