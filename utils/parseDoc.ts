import mammoth from 'mammoth'
import WordExtractor from 'word-extractor'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

function isZip(buffer: Buffer): boolean {
  // ZIP files start with 'PK' (0x50 0x4B)
  return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B
}

function isOleCompoundFile(buffer: Buffer): boolean {
  // OLE CF header: D0 CF 11 E0 A1 B1 1A E1
  const sig = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
  if (buffer.length < sig.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (buffer[i] !== sig[i]) return false
  }
  return true
}

export async function extractDocxText(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer })
  return value || ''
}

export async function extractDocText(buffer: Buffer): Promise<string> {
  if (isZip(buffer)) {
    return extractDocxText(buffer)
  }
  if (isOleCompoundFile(buffer)) {
    const tmp = path.join(os.tmpdir(), `upload-${Date.now()}-${Math.random().toString(16)}.doc`)
    await fs.writeFile(tmp, buffer)
    try {
      const extractor = new (WordExtractor as any)()
      const doc = await extractor.extract(tmp)
      return doc.getBody() || ''
    } finally {
      try { await fs.unlink(tmp) } catch {}
    }
  }
  try {
    return await extractDocxText(buffer)
  } catch (e: any) {
    throw new Error('无法解析该 Word 文件，请尝试另存为 .docx 后重试')
  }
}
