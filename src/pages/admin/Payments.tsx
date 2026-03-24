import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CurrencyRupeeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function AdminPayments() {
  const [drives, setDrives] = useState<any[]>([])

  useEffect(() => {
    supabase.from('placement_drives')
      .select('*, employer_profiles(company_name), college_profiles(college_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setDrives(data || []))
  }, [])

  const approvePayment = async (id: string) => {
    await supabase.from('placement_drives').update({ payment_status: 'paid', admin_approved: true, status: 'active' }).eq('id', id)
    setDrives(prev => prev.map(d => d.id === id ? { ...d, payment_status: 'paid', admin_approved: true, status: 'active' } : d))
  }

  const totalRevenue = drives.filter(d => d.payment_status === 'paid').length * 25000

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Payments & Revenue</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card bg-primary-50 border-primary-200">
          <CurrencyRupeeIcon className="w-8 h-8 text-primary-600 mb-2" />
          <p className="text-3xl font-black text-primary-700">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-primary-600">Total Revenue</p>
        </div>
        <div className="card">
          <CheckCircleIcon className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-3xl font-black text-gray-800">{drives.filter(d => d.payment_status === 'paid').length}</p>
          <p className="text-sm text-gray-500">Paid Drives</p>
        </div>
        <div className="card">
          <ClockIcon className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-3xl font-black text-gray-800">{drives.filter(d => d.payment_status === 'pending').length}</p>
          <p className="text-sm text-gray-500">Pending Payments</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Placement Drive Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Drive','Employer','College','Amount','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drives.map(d => (
                <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{d.title}</td>
                  <td className="px-4 py-3 text-gray-600">{d.employer_profiles?.company_name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.college_profiles?.college_name}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹25,000</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${d.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.payment_status !== 'paid' && (
                      <button onClick={() => approvePayment(d.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {drives.length === 0 && <p className="text-center text-gray-400 py-8">No payment records yet.</p>}
        </div>
      </div>
    </div>
  )
}