import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import fs from 'fs/promises'
import path from 'path'
import { parsePDFBuffer } from '@/utils/parsePDF'
import { extractDocxText, extractDocText } from '@/utils/parseDoc'

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

    res.status(200).json({ text })
  } catch (e: any) {
    res.status(500).send(e?.message || '解析失败')
  }
}
