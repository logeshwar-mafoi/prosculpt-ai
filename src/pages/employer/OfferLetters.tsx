import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { DocumentTextIcon, PaperAirplaneIcon, EyeIcon } from '@heroicons/react/24/outline'

const BASE = `Dear {candidate_name},

We are pleased to offer you the position of {role} at {company_name}.

Your Cost to Company (CTC) will be Rs.{ctc} per annum.

Your joining date is {joining_date}.

Please confirm your acceptance by replying within 3 working days.

Congratulations and welcome to the team!

Warm regards,
{hr_name}
{company_name}`

export default function OfferLetters() {
  const { user, profile } = useAuthStore()
  const [applications, setApplications] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [preview, setPreview] = useState('')
  const [sending, setSending] = useState(false)
  const { register, watch } = useForm<any>({ defaultValues: { company_name: profile?.company_name, hr_name: profile?.name } })

  useEffect(() => {
    supabase.from('applications')
      .select('*, student_profiles(*), jobs!inner(employer_id, title)')
      .eq('jobs.employer_id', user?.id)
      .eq('status', 'shortlisted')
      .then(({ data }) => setApplications(data ?? []))
  }, [user])

  const generatePreview = () => {
    if (!selected) { toast.error('Select a candidate first'); return }
    const d = watch()
    const vars: Record<string, string> = {
      candidate_name: selected.student_profiles?.name ?? 'Candidate',
      role: d.role || selected.jobs?.title,
      company_name: d.company_name ?? '',
      ctc: d.ctc ?? '',
      joining_date: d.joining_date ?? '',
      hr_name: d.hr_name ?? '',
    }
    let letter = BASE
    Object.entries(vars).forEach(([k, v]) => { letter = letter.replaceAll(`{${k}}`, v) })
    setPreview(letter)
  }

  const sendOffer = async () => {
    if (!selected || !preview) { toast.error('Generate preview first'); return }
    setSending(true)
    await supabase.from('offer_letters').insert({ application_id: selected.id, student_id: selected.student_id, employer_id: user?.id, template: preview, status: 'sent' })
    await supabase.from('applications').update({ status: 'offered' }).eq('id', selected.id)
    setApplications(prev => prev.filter(a => a.id !== selected.id))
    setSelected(null); setPreview('')
    toast.success('Offer sent! Pending admin approval.')
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Offer Letters</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Select Candidate</h3>
          {applications.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No shortlisted candidates.</p>
            : applications.map(app => (
              <button key={app.id} onClick={() => setSelected(app)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 mb-2 transition-all ${selected?.id === app.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{app.student_profiles?.name?.[0]}</div>
                <div><p className="font-semibold text-sm text-gray-800">{app.student_profiles?.name}</p><p className="text-xs text-gray-500">{app.jobs?.title}</p></div>
              </button>
            ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800">Offer Details</h3>
          <input {...register('role')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Role / Position" />
          <input {...register('ctc')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="CTC (e.g. 6,00,000)" />
          <input {...register('joining_date')} type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
          <input {...register('company_name')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Company Name" />
          <input {...register('hr_name')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="HR Name" />
          <div className="flex gap-3">
            <button type="button" onClick={generatePreview} className="border border-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl hover:bg-gray-50 flex items-center gap-2 flex-1">
              <EyeIcon className="w-4 h-4" /> Preview
            </button>
            <button type="button" onClick={sendOffer} disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2 flex-1">
              <PaperAirplaneIcon className="w-4 h-4" />{sending ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </div>
      </div>
      {preview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-blue-600" /> Letter Preview</h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 font-mono text-sm whitespace-pre-wrap text-gray-700">{preview}</div>
          <p className="text-xs text-amber-600 mt-3">Reviewed by admin before delivery to candidate.</p>
        </div>
      )}
    </div>
  )
}