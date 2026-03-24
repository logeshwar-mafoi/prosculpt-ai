import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon, AcademicCapIcon, BuildingOfficeIcon,
  ChevronRightIcon, StarIcon, CheckCircleIcon, SparklesIcon
} from '@heroicons/react/24/outline'

const employers = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra',
  'Cognizant', 'Capgemini', 'Accenture', 'IBM', 'Amazon',
  'Ciel HR', 'Ma Foi', 'Deloitte', 'EY', 'KPMG'
]

const colleges = [
  'IIT Madras', 'Anna University', 'VIT Vellore', 'SRM Institute',
  'PSG Tech', 'Coimbatore IT', 'Amrita University', 'SASTRA',
  'Hindustan University', 'Vel Tech', 'SECE', 'KCG College'
]

const stats = [
  { label: 'Students Placed', value: '12,000+' },
  { label: 'Partner Colleges', value: '200+' },
  { label: 'Employers', value: '500+' },
  { label: 'Success Rate', value: '87%' },
]

const features = [
  { icon: SparklesIcon, title: 'AI-Powered Matching', desc: 'Smart job recommendations based on your resume, skills, and goals.' },
  { icon: BriefcaseIcon, title: 'Campus Placement Drives', desc: 'Seamless B2B drives between employers and colleges, admin-verified.' },
  { icon: AcademicCapIcon, title: 'Ma Foi Employability Score', desc: 'Certified employability assessment that boosts your resume shortlisting.' },
  { icon: BuildingOfficeIcon, title: 'Smart ATS Resume Builder', desc: '10+ professional templates auto-built from your profile data.' },
]

function InfiniteScroll({ items, reverse }: { items: string[], reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-6"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
        {doubled.map((item, i) => (
          <span key={i}
            className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-800
            font-semibold px-5 py-2 rounded-full text-sm shadow-sm whitespace-nowrap">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <span className={`font-black text-xl ${scrolled ? 'text-primary-900' : 'text-white'}`}>ProSculpt<span className="text-accent-400">.AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['Features','Employers','Colleges','Blog'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className={`hover:text-accent-400 transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors
              ${scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-white hover:text-accent-300'}`}>Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-hero-gradient min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
              <span className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <SparklesIcon className="w-4 h-4 text-accent-300" />
                AI-Powered Campus Placement Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Shape Your Career with <span className="text-accent-300">AI Intelligence</span>
              </h1>
              <p className="text-primary-100 text-lg md:text-xl mb-8 leading-relaxed">
                ProSculpt.AI connects students, colleges, and employers through intelligent matching,
                automated assessments, and data-driven placement tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register?role=student"
                  className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg text-center">
                  I'm a Student →
                </Link>
                <Link to="/register?role=employer"
                  className="bg-accent-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-accent-600 transition-all shadow-lg text-center">
                  I'm an Employer
                </Link>
                <Link to="/register?role=college"
                  className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-primary-700 transition-all text-center">
                  I'm a College
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm py-6">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-primary-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer Scroll */}
      <section id="employers" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Trusted by Top Employers</p>
          <h2 className="text-center text-2xl font-bold text-gray-800">500+ Companies Hiring on ProSculpt</h2>
        </div>
        <div className="space-y-4 py-4">
          <InfiniteScroll items={employers} />
          <InfiniteScroll items={[...employers].reverse()} reverse />
        </div>
      </section>

      {/* College Scroll */}
      <section id="colleges" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <p className="text-center text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Partner Institutions</p>
          <h2 className="text-center text-2xl font-bold text-gray-800">200+ Colleges Trust ProSculpt</h2>
        </div>
        <div className="space-y-4 py-4">
          <InfiniteScroll items={colleges} />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need to Get Placed</h2>
            <p className="text-primary-300 text-lg max-w-2xl mx-auto">From AI resume building to automated placement drives — all in one platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-primary-900 border border-primary-700 rounded-2xl p-6 hover:border-accent-400 transition-colors group">
                <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-500/40 transition-colors">
                  <f.icon className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-primary-300 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Get Placed?</h2>
          <p className="text-primary-100 text-xl mb-10">Join 12,000+ students already using ProSculpt.AI</p>
          <Link to="/register" className="bg-white text-primary-700 font-black text-lg px-12 py-5 rounded-2xl hover:bg-primary-50 transition-all shadow-2xl inline-block">
            Start Free Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 text-primary-300 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-white font-black text-xl">ProSculpt<span className="text-accent-400">.AI</span></p>
            <p className="text-sm mt-1">Powered by AI. Built for India.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm">© 2025 ProSculpt.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}