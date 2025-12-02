import { useEffect, useRef, useState } from 'react'
import Layout from '@/components/Layout'

export default function EditorPage() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [inserted, setInserted] = useState(false)
  const textRef = useRef<string>('')
  const nodeRef = useRef<Text | null>(null)
  const indexRef = useRef<number>(0)
  const caretRef = useRef<HTMLSpanElement | null>(null)
  const [title, setTitle] = useState('')
  const titleRef = useRef<HTMLDivElement>(null)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const savedTitle = typeof window !== 'undefined' ? (localStorage.getItem('docTitle') || '') : ''
    if (savedTitle) {
      setTitle(savedTitle)
      if (titleRef.current) {
        titleRef.current.textContent = savedTitle
      }
    }
    editorRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      const el = editorRef.current
      if (!el) return
      if (titleRef.current && (e.target instanceof Node) && titleRef.current.contains(e.target as Node)) {
        return
      }
      if (inserted) return
      if (!textRef.current) {
        textRef.current = localStorage.getItem('parsedText') || ''
        if (!textRef.current) return
      }
      if (!nodeRef.current) {
        el.innerHTML = ''
        nodeRef.current = document.createTextNode('')
        el.appendChild(nodeRef.current)
        caretRef.current = document.createElement('span')
        caretRef.current.className = 'caret'
        el.appendChild(caretRef.current)
      }
      const isDeleteKey = e.key === 'Backspace' || e.key === 'Delete'
      if (isDeleteKey) {
        if (e.repeat) return
        e.preventDefault()
        e.stopPropagation()
        const i = indexRef.current
        if (i > 0 && nodeRef.current) {
          const data = nodeRef.current.data
          nodeRef.current.data = data.slice(0, i - 1)
          indexRef.current = i - 1
          if (caretRef.current) {
            el.appendChild(caretRef.current)
          }
        }
        return
      }
      const isAdvanceKey = (
        e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' ||
        e.code === 'Enter' || e.key === 'Enter'
      )
      if (!isAdvanceKey) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const i = indexRef.current
      const t = textRef.current
      if (i >= t.length) {
        setInserted(true)
        return
      }
      nodeRef.current.appendData(t[i])
      indexRef.current = i + 1
      if (caretRef.current) {
        el.appendChild(caretRef.current)
      }
      if (indexRef.current >= t.length) {
        setInserted(true)
        if (caretRef.current) {
          caretRef.current.remove()
          caretRef.current = null
        }
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey as any)
  }, [inserted])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('docTitle', title)
    }
    setSaved(false)
    const t = setTimeout(() => setSaved(true), 300)
    return () => clearTimeout(t)
  }, [title])

  return (
    <Layout>
      <div className="min-h-screen bg-[#0f1115] text-gray-200 flex">
        <aside className="w-64 bg-[#151821] border-r border-[#1f2330] flex flex-col">
          <div className="h-12 flex items-center px-4 text-sm font-semibold gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7 L9 13 L12 11 L5 4 Z" fill="#22c55e"/>
              <path d="M5 17 L9 13 L12 11 L19 20 L5 20 Z" fill="#2563eb"/>
              <path d="M12 11 L15 9 L21 15 L19 20 Z" fill="#3b82f6" opacity="0.75"/>
            </svg>
            <span className="text-gray-200">飞书云文档</span>
          </div>
          <div className="px-3">
            <div className="relative">
              <input placeholder="搜索" className="w-full px-3 py-2 rounded bg-[#1b2030] text-gray-300 placeholder-gray-500 outline-none" />
              <span className="absolute right-3 top-2.5 text-gray-500">⌕</span>
            </div>
          </div>
          <div className="mt-3 px-3 space-y-1 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#17375f] text-blue-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8-1 1H4L3 11l9-8zM4 12h16v8H4v-8z"/></svg>
              <span>主页</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 14a6 6 0 1112 0H6zm-2 2h16v4H4v-4z"/></svg>
              <span>云盘</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v4H4V5zm0 6h10v4H4v-4zm12 0h4v4h-4v-4z"/></svg>
              <span>知识库</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 00-5 5h2a3 3 0 116 0h2a5 5 0 00-5-5zm-6 9h12v2H6v-2zm-2 4h16v6H4v-6z"/></svg>
              <span>智能纪要</span>
            </div>
          </div>
          <div className="mt-4 px-3 text-xs text-gray-400">置顶文档</div>
          <div className="px-3 pt-2 text-sm space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af"><path d="M4 4h16v16H4V4zm4 3h8v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2z"/></svg>
              <span>在AI-Journey玩转云文档</span>
            </div>
          </div>
          <div className="mt-3 px-3 text-xs text-gray-400">置顶知识库</div>
          <div className="px-3 pt-2 text-sm space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af"><path d="M3 6h18v4H3V6zm0 6h12v4H3v-4zm14 0h4v4h-4v-4z"/></svg>
              <span>新建或置顶知识库</span>
            </div>
          </div>
          <div className="mt-3 px-3 text-xs text-gray-400 flex items-center justify-between">
            <span>我的文档库</span>
            <button className="text-gray-400 hover:text-gray-200">＋</button>
          </div>
          <div className="px-3 pt-2 text-sm space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#1b2030]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af"><path d="M4 5h16v4H4V5zm0 6h12v4H4v-4z"/></svg>
              <span>知识问答</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded border-l-2 border-blue-500 bg-[#0f1a2b] text-blue-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#60a5fa"><path d="M4 4h16v16H4V4zm5 3h7v2H9V7zm0 4h7v2H9v-2zm0 4h7v2H9v-2z"/></svg>
              <span>{(title && title.trim()) ? title.trim() : '未命名文档'}</span>
            </div>
          </div>
          <div className="mt-auto p-3 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
            <div className="py-2 rounded bg-[#1b2030]">🏠</div>
            <div className="py-2 rounded bg-[#1b2030]">🗂️</div>
            <div className="py-2 rounded bg-[#1b2030]">🧭</div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <div className="h-12 border-b border-[#1f2330] flex items-center justify-end px-4 gap-3">
            <button className="h-8 px-3 rounded-md bg-[#2563eb] text-white text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12h8v8H4v-8zm8-8h8v8h-8V4zm-8 8l8-8"/></svg>
              <span>分享</span>
            </button>
            <button className="h-8 px-3 rounded-md border border-[#2a2f3a] bg-[#1b2030] text-gray-200 text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21l3-1 11-11-2-2L4 18l-1 3zM14 5l2 2 2-2-2-2-2 2z"/></svg>
              <span>编辑</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <div className="h-8 w-8 rounded-md border border-[#2a2f3a] bg-[#1b2030] flex items-center justify-center text-gray-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zM18 16V9a6 6 0 10-12 0v7l-2 2h16l-2-2z"/></svg>
            </div>
            <div className="h-8 w-8 rounded-md border border-[#2a2f3a] bg-[#1b2030] flex items-center justify-center text-gray-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </div>
            <div className="h-6 w-px bg-[#2a2f3a]" />
            <div className="h-8 w-8 rounded-md border border-[#2a2f3a] bg-[#1b2030] flex items-center justify-center text-gray-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17a7 7 0 110-14 7 7 0 010 14zm8 3l-4-4"/></svg>
            </div>
            <div className="h-8 w-8 rounded-md border border-[#2a2f3a] bg-[#1b2030] flex items-center justify-center text-gray-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2563eb]" />
          </div>
          <div className="flex-1 px-16">
            <div className="max-w-3xl mx-auto">
              <div className="pt-10">
                <div
                  ref={titleRef}
                  contentEditable
                  data-placeholder="请输入标题"
                  onInput={(e) => setTitle(e.currentTarget.textContent || '')}
                  className="title text-4xl font-bold text-gray-100 outline-none"
                  suppressContentEditableWarning
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-[#7c4cff]" />
                  <span>付浩</span>
                  <span>·</span>
                  <span>今天修改</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full border ${saved ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}`}>{saved ? '已保存至云端' : '正在保存…'}</span>
                </div>
              </div>
              <div className="mt-8">
                <div
                  ref={editorRef}
                  contentEditable={inserted}
                  onBeforeInput={(e) => {
                    if (!inserted) return
                    const native = (e as any).nativeEvent
                    const type = native && native.inputType
                    if (type !== 'deleteContentBackward' && type !== 'deleteContentForward') return
                    const el = editorRef.current
                    if (!el) return
                    const sel = window.getSelection()
                    if (!sel || !sel.anchorNode) return
                    if (!el.contains(sel.anchorNode)) return
                    e.preventDefault()
                    const node = sel.anchorNode as any
                    const textNode: Text = node.nodeType === Node.TEXT_NODE ? (node as Text) : document.createTextNode('')
                    if (node.nodeType !== Node.TEXT_NODE) {
                      el.appendChild(textNode)
                    }
                    const data = textNode.data ?? textNode.textContent ?? ''
                    const offset = sel.anchorOffset
                    let next = data
                    let newOffset = offset
                    if (type === 'deleteContentBackward') {
                      if (offset <= 0) return
                      next = data.slice(0, offset - 1) + data.slice(offset)
                      newOffset = offset - 1
                    } else {
                      if (offset >= data.length) return
                      next = data.slice(0, offset) + data.slice(offset + 1)
                      newOffset = offset
                    }
                    textNode.data = next
                    const range = document.createRange()
                    range.setStart(textNode, Math.max(0, Math.min(next.length, newOffset)))
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                  }}
                  onFocus={() => {
                    if (titleRef.current) titleRef.current.blur()
                    const sel = window.getSelection()
                    if (sel) sel.removeAllRanges()
                  }}
                  onMouseDown={(e) => {
                    const el = editorRef.current
                    if (!el) return
                    if (inserted) return
                    e.preventDefault()
                    e.stopPropagation()
                    if (titleRef.current) titleRef.current.blur()
                    const sel = window.getSelection()
                    if (sel) sel.removeAllRanges()
                    if (!nodeRef.current) {
                      el.innerHTML = ''
                      nodeRef.current = document.createTextNode('')
                      el.appendChild(nodeRef.current)
                    }
                    if (!caretRef.current) {
                      caretRef.current = document.createElement('span')
                      caretRef.current.className = 'caret'
                    }
                    el.appendChild(caretRef.current)
                  }}
                  className="min-h-[60vh] outline-none leading-7 text-gray-200"
                  suppressContentEditableWarning
                />
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button className="w-10 h-10 rounded-full bg-[#1b2030] text-gray-300">⌘</button>
          <button className="w-10 h-10 rounded-full bg-[#1b2030] text-gray-300">?</button>
        </div>
      </div>
    </Layout>
  )
}
