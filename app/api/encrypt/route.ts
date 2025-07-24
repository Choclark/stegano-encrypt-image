import { NextRequest, NextResponse } from 'next/server'
import { hideTextInImage } from '@/app/actions/stegano.actions' // your hideTextInImage with jimp or sharp
import { encryptText } from '@/app/actions/text.action'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('image') as File
  const text = formData.get('text') as string
    const key = formData.get('key') as string // Optional key for encryption

  if (!file || !text) {
    return NextResponse.json({ error: 'Missing image or text' }, { status: 400 })
  }
  const encryptedText=  encryptText(text, key) // Encrypt the text if a key is provided
  const buffer = Buffer.from(await file.arrayBuffer())
  const encryptedBuffer = await hideTextInImage(buffer, encryptedText)

  return new Response(new Uint8Array(encryptedBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
    },
  })
}
