import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'

export default function Home() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || '上传失败')
      }
      const data: { text: string } = await res.json()
      localStorage.setItem('parsedText', data.text || '')
      router.push('/editor')
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-semibold mb-6">文档查看工具</h1>
        <div className="bg-white rounded-lg shadow p-8 w-full max-w-md text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-gray-500 mt-3">支持 PDF / Word（.doc, .docx），最大 20MB</p>
          {uploading && <p className="mt-4 text-blue-600">正在解析，请稍候…</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    </Layout>
  )
}
