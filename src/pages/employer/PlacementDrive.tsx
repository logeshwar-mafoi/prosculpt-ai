import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default function PlacementDrive() {
  const { user } = useAuthStore()
  const [drives, setDrives] = useState<any[]>([])
  const [colleges, setColleges] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()

  useEffect(() => {
    supabase.from('placement_drives').select('*, college_profiles(college_name)').eq('employer_id', user?.id).then(({ data }) => setDrives(data || []))
    supabase.from('college_profiles').select('id, college_name').eq('verified', true).then(({ data }) => setColleges(data || []))
  }, [user])

  const onSubmit = async (data: any) => {
    const { error } = await supabase.from('placement_drives').insert({
      ...data, employer_id: user?.id, status: 'pending', admin_approved: false, payment_status: 'pending'
    })
    if (error) { toast.error(error.message); return }
    toast.success('Drive submitted for admin approval!')
    setShowForm(false); reset()
  }

  const statusColor: Record<string,string> = {
    pending:'bg-amber-100 text-amber-700', approved:'bg-green-100 text-green-700',
    active:'bg-blue-100 text-blue-700', completed:'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">Placement Drives</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Create Drive
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-primary-200">
          <h3 className="font-bold text-gray-800 mb-4">New Placement Drive</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('title', { required: true })} className="input-field" placeholder="Drive Title" />
            <textarea {...register('description')} className="input-field resize-none" rows={3} placeholder="Drive description..." />
            <div className="grid sm:grid-cols-2 gap-4">
              <select {...register('college_id', { required: true })} className="input-field">
                <option value="">Select Target College</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.college_name}</option>)}
              </select>
              <input {...register('drive_date', { required: true })} type="date" className="input-field" />
              <input {...register('location')} className="input-field" placeholder="Location / Online" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Submit for Approval</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {drives.length === 0 && <div className="card text-center py-12 text-gray-400">No drives created yet.</div>}
        {drives.map(d => (
          <div key={d.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{d.title}</h3>
                <p className="text-primary-600 flex items-center gap-1 text-sm"><BuildingOfficeIcon className="w-4 h-4" />{d.college_profiles?.college_name}</p>
                <p className="text-gray-500 text-sm mt-1">{d.drive_date} • {d.location}</p>
                <p className="text-gray-600 text-sm mt-2">{d.description}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-2">
                <span className={`badge ${statusColor[d.status]}`}>{d.status}</span>
                {!d.admin_approved && <p className="text-xs text-amber-600">Pending admin approval</p>}
                {d.payment_status === 'pending' && d.admin_approved && (
                  <button className="btn-primary text-xs py-1.5 px-3">Pay & Confirm</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}