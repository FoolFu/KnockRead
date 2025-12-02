import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }
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
