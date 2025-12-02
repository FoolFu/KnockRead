import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import fs from 'fs/promises'
import path from 'path'
import { parsePDFBuffer } from '@/utils/parsePDF'
import { extractDocxText, extractDocText } from '@/utils/parseDoc'
import os from 'os'
import fssync from 'fs'

function ensureDataDirs() {
  const base = path.join(process.cwd(), 'data')
  const docsDir = path.join(base, 'docs')
  if (!fssync.existsSync(base)) fssync.mkdirSync(base)
  if (!fssync.existsSync(docsDir)) fssync.mkdirSync(docsDir)
  const uploadsJson = path.join(base, 'uploads.json')
  if (!fssync.existsSync(uploadsJson)) fssync.writeFileSync(uploadsJson, JSON.stringify([], null, 2))
  return { base, docsDir, uploadsJson }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_SIZE = 20 * 1024 * 1024

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const form = formidable({
    multiples: false,
    maxFileSize: MAX_SIZE,
  })

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const uploaded = (files as Record<string, File | File[] | undefined>).file
    if (!uploaded) {
      res.status(400).send('缺少文件')
      return
    }

    const file = (Array.isArray(uploaded) ? uploaded[0] : uploaded) as File
    const filepath = (file?.filepath ?? (file as any)?.path) as string
    if (!filepath) {
      res.status(400).send('上传文件路径缺失')
      return
    }
    const buffer = await fs.readFile(filepath)
    // 删除临时文件
    try { await fs.unlink(filepath) } catch {}

    const ext = path.extname(file?.originalFilename || '').toLowerCase()

    let text = ''
    if (ext === '.pdf') {
      text = await parsePDFBuffer(buffer)
    } else if (ext === '.docx') {
      text = await extractDocxText(buffer)
    } else if (ext === '.doc') {
      text = await extractDocText(buffer)
    } else {
      res.status(400).send('不支持的文件类型')
      return
    }

    const { base, docsDir, uploadsJson } = ensureDataDirs()
    const id = (typeof (global as any).crypto !== 'undefined' && (global as any).crypto.randomUUID) ? (global as any).crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const docPath = path.join(docsDir, `${id}.txt`)
    await fs.writeFile(docPath, text, 'utf8')
    // append metadata
    try {
      const metaRaw = await fs.readFile(uploadsJson, 'utf8')
      const list = JSON.parse(metaRaw || '[]') as Array<{ id: string; name: string; createdAt: number }>
      list.push({ id, name: file?.originalFilename || '未命名文件', createdAt: Date.now() })
      await fs.writeFile(uploadsJson, JSON.stringify(list, null, 2), 'utf8')
    } catch {}

    res.status(200).json({ id, name: file?.originalFilename || '未命名文件' })
  } catch (e: any) {
    res.status(500).send(e?.message || '解析失败')
  }
}
