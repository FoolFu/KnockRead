import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import fssync from 'fs'

async function cleanupDataOnce() {
  if (!(global as any).__KNOCKREAD_CACHE_CLEARED) {
    (global as any).__KNOCKREAD_CACHE_CLEARED = true
    const base = path.join(process.cwd(), 'data')
    const docsDir = path.join(base, 'docs')
    const uploadsJson = path.join(base, 'uploads.json')
    if (!fssync.existsSync(base)) fssync.mkdirSync(base)
    if (!fssync.existsSync(docsDir)) fssync.mkdirSync(docsDir)
    try {
      const files = await fs.readdir(docsDir)
      await Promise.all(files.map(async (f) => {
        try { await fs.unlink(path.join(docsDir, f)) } catch {}
      }))
    } catch {}
    try {
      await fs.writeFile(uploadsJson, JSON.stringify([], null, 2), 'utf8')
    } catch {}
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }
  await cleanupDataOnce()
  try {
    const uploadsJson = path.join(process.cwd(), 'data', 'uploads.json')
    try {
      const raw = await fs.readFile(uploadsJson, 'utf8')
      const list = JSON.parse(raw || '[]')
      res.status(200).json({ list })
    } catch {
      res.status(200).json({ list: [] })
    }
  } catch (e: any) {
    res.status(500).send(e?.message || '读取失败')
  }
}
