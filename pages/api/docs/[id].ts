import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    res.status(400).send('缺少 id')
    return
  }
  try {
    const base = path.join(process.cwd(), 'data')
    const docPath = path.join(base, 'docs', `${id}.txt`)
    const text = await fs.readFile(docPath, 'utf8')
    // try fetch name from uploads.json
    let name: string | undefined
    try {
      const raw = await fs.readFile(path.join(base, 'uploads.json'), 'utf8')
      const list = JSON.parse(raw || '[]') as Array<{ id: string; name: string }>
      const item = list.find((x) => x.id === id)
      name = item?.name
    } catch {}
    res.status(200).json({ id, name, text })
  } catch (e: any) {
    res.status(404).send('文档不存在')
  }
}
