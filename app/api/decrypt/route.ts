import { type NextRequest, NextResponse } from "next/server"
import { readTextFromImage } from "@/app/actions/stegano.actions"
import { decryptText } from "@/app/actions/text.action"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("image") as File
  const key = formData.get("key") as string

  if (!file) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const hiddenText = await readTextFromImage(buffer)
    const decryptedText = decryptText(hiddenText,key)


    return NextResponse.json({ text: decryptedText })
  } catch (error:any) {
    return NextResponse.json({ error: error.message || "Failed to extract text from image" }, { status: 500 })
  }
}
