'use server'
import sharp from 'sharp'

// Convert string to binary (with null terminator)
function textToBinary(text: string): string {
  return text
    .split('')
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('') + '00000000'
}

// Convert binary string to text (stops at null terminator)
function binaryToText(binary: string): string {
  let text = ''
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    const byte = binary.slice(i, i + 8)
    if (byte === '00000000') break
    text += String.fromCharCode(parseInt(byte, 2))
  }
  return text
}

/**
 * Hide `text` inside `imageBuffer` by encoding into LSBs of each channel.
 * Returns a PNG buffer.
 */
export async function hideTextInImage(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  const bits = textToBinary(text)
  let bitIndex = 0

  // Read into raw RGBA (or RGB) pixels
  const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  // Iterate over each byte in the pixel array
  for (let i = 0; i < data.length && bitIndex < bits.length; i++) {
    // If there's an alpha channel, skip every 4th byte
    if (channels === 4 && (i + 1) % 4 === 0) {
      continue
    }

    // Clear LSB and set to the next bit
    const bit = Number(bits[bitIndex++])
    data[i] = (data[i] & 0xfe) | bit
  }

  // Re-encode as PNG
  return sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer()
}

/**
 * Extract hidden text from `imageBuffer` by reading LSBs in channel order.
 */
export async function readTextFromImage(imageBuffer: Buffer): Promise<string> {
  const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true })
  const { channels } = info

  let bits = ''
  for (let i = 0; i < data.length; i++) {
    // Skip alpha channel bytes if present
    if (channels === 4 && (i + 1) % 4 === 0) {
      continue
    }
    bits += (data[i] & 1).toString()
    if (bits.endsWith('00000000')) {
      break
    }
  }

  return binaryToText(bits)
}
