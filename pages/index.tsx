import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'

export default function Home() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const [docs, setDocs] = useState<Array<{ id: string; name: string; createdAt: number }>>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
      const data: { id: string; name: string } = await res.json()
      setUploadedName(data.name || file.name)
      await loadDocs()
    } catch (err: any) {
      setError(err?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const loadDocs = async () => {
    try {
      const listRes = await fetch('/api/docs')
      const json = await listRes.json()
      setDocs(json.list || [])
    } catch {}
  }

  useEffect(() => { loadDocs() }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0f1115] to-[#0b0d12] text-gray-200">
        <section className="px-6 md:px-12 pt-20 md:pt-28">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            <div className="flex items-center gap-4 text-gray-200">
              <svg width="66" height="66" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7 L9 13 L12 11 L5 4 Z" fill="#22c55e"/>
                <path d="M5 17 L9 13 L12 11 L19 20 L5 20 Z" fill="#2563eb"/>
                <path d="M12 11 L15 9 L21 15 L19 20 Z" fill="#3b82f6" opacity="0.75"/>
              </svg>
              <span className="text-2xl md:text-3xl font-semibold">KnockRead</span>
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">这是一个摸鱼看小说的平台</h1>
            <p className="mt-4 text-gray-400 max-w-3xl">上传 PDF / Word 小说文本，解析成纯文字，在仿飞书深色编辑页里以打字机方式慢慢看，低调不扎眼。</p>
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => {
                  if (!selectedId) {
                    setError('请先上传文件')
                    return
                  }
                  router.push(`/editor?id=${encodeURIComponent(selectedId)}`)
                }}
                className="h-11 px-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >开始摸鱼</button>
            </div>
            {uploading && <p className="mt-3 text-blue-400">正在解析，请稍候…</p>}
            {error && <p className="mt-3 text-red-400">{error}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </section>

        <section className="px-6 md:px-12 pt-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#1f2330] bg-[#131722]/85 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50">
              <div className="text-blue-400">PDF / Word</div>
              <div className="mt-2 text-lg">解析成纯文本</div>
            </div>
            <div className="p-6 rounded-2xl border border-[#1f2330] bg-[#131722]/85 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50">
              <div className="text-blue-400">逐字展示</div>
              <div className="mt-2 text-lg">空格/回车推进一个字</div>
            </div>
            <div className="p-6 rounded-2xl border border-[#1f2330] bg-[#131722]/85 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50">
              <div className="text-blue-400">仿飞书体验</div>
              <div className="mt-2 text-lg">深色布局与细节徽标</div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 pt-16 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-[#1f2330] bg-[#11141c] p-8">
              <div className="text-gray-300">上传你的小说开始摸鱼体验：</div>
              <div className="mt-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 px-5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm"
                    >选择文件</button>
                    {uploadedName && !uploading && !error && (
                      <div className="mt-2 text-sm text-green-400">已选择：{uploadedName}</div>
                    )}
                    {docs && docs.length > 0 && (
                      <div className="mt-3 text-sm text-gray-300">
                        <div className="mb-2 text-xs text-gray-500">已上传文件（点击选择）</div>
                        <div className="space-y-2">
                          {docs.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => setSelectedId(d.id)}
                              className={`w-full text-left px-3 py-2 rounded-md border ${selectedId === d.id ? 'border-blue-500 text-blue-300 bg-[#13203a]' : 'border-[#2a2f3a] text-gray-300 bg-[#151821]'}`}
                            >{d.name}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 md:self-center">支持 .pdf / .doc / .docx，最大 20MB</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
