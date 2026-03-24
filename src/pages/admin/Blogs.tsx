import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function AdminBlogs() {
  const { user } = useAuthStore()
  const [blogs, setBlogs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()

  useEffect(() => {
    supabase.from('blogs').select('*').order('created_at', { ascending: false }).then(({ data }) => setBlogs(data || []))
  }, [])

  const onSubmit = async (data: any) => {
    const tags = data.tags?.split(',').map((t: string) => t.trim()) || []
    const { data: blog, error } = await supabase.from('blogs').insert({ ...data, tags, author_id: user?.id, published: false }).select().single()
    if (error) { toast.error(error.message); return }
    setBlogs(prev => [blog, ...prev])
    toast.success('Blog created!')
    setShowForm(false); reset()
  }

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('blogs').update({ published: !current }).eq('id', id)
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, published: !current } : b))
    toast.success(!current ? 'Blog published!' : 'Blog unpublished')
  }

  const deleteBlog = async (id: string) => {
    await supabase.from('blogs').delete().eq('id', id)
    setBlogs(prev => prev.filter(b => b.id !== id))
    toast.success('Blog deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">Blog Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> New Blog
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-primary-200">
          <h3 className="font-bold text-gray-800 mb-4">Create Blog Post</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('title', { required: true })} className="input-field" placeholder="Blog Title" />
            <input {...register('cover_url')} className="input-field" placeholder="Cover Image URL (optional)" />
            <textarea {...register('content', { required: true })} rows={8} className="input-field resize-none" placeholder="Write your blog content here... (Markdown supported)" />
            <input {...register('tags')} className="input-field" placeholder="Tags (comma separated: career, placement, tips)" />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save Blog</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {blogs.length === 0 && <div className="card text-center py-12 text-gray-400">No blogs yet. Create your first!</div>}
        {blogs.map(b => (
          <div key={b.id} className="card flex items-center gap-4">
            {b.cover_url && <img src={b.cover_url} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">{b.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{b.content?.substring(0, 80)}...</p>
              <div className="flex gap-2 mt-1">
                {b.tags?.map((t: string) => <span key={t} className="badge bg-gray-100 text-gray-600 text-xs">{t}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge text-xs ${b.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.published ? 'Published' : 'Draft'}
              </span>
              <button onClick={() => togglePublish(b.id, b.published)}
                className={`p-2 rounded-xl transition-colors ${b.published ? 'bg-amber-100 hover:bg-amber-200' : 'bg-green-100 hover:bg-green-200'}`}>
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => deleteBlog(b.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors">
                <TrashIcon className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}