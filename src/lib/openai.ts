import axios from 'axios'

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

export const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' }
})

export async function chatWithAI(messages: {role:string, content:string}[]) {
  const res = await openaiClient.post('/chat/completions', {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000
  })
  return res.data.choices[0].message.content
}

export async function analyzeResume(resumeText: string) {
  const prompt = `You are an expert ATS resume analyzer. Analyze this resume and return JSON with:
  { atsScore: number (0-100), strengths: string[], improvements: string[], keywords: string[], summary: string }
  Resume: ${resumeText}`
  return chatWithAI([{ role: 'user', content: prompt }])
}

export async function generateJobAssessment(jobTitle: string, jobDescription: string, type: string) {
  const prompt = `Generate a ${type} assessment for ${jobTitle} role. Job description: ${jobDescription}.
  Return JSON: { questions: [{question, options?, correctAnswer?, type}], timeLimit: number }`
  return chatWithAI([{ role: 'user', content: prompt }])
}

export async function matchJobsToStudent(resumeText: string, jobs: any[]) {
  const prompt = `Given this resume, rank these jobs by match score (0-100). Resume: ${resumeText}
  Jobs: ${JSON.stringify(jobs.slice(0, 20))}
  Return JSON array: [{jobId, matchScore, reasons: string[]}]`
  return chatWithAI([{ role: 'user', content: prompt }])
}