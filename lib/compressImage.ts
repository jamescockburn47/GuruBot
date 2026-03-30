// lib/compressImage.ts
const MAX_BYTES = 300 * 1024 // 300KB binary → ~400KB base64, safe for repeated sends
const MAX_DIMENSION = 768  // sufficient for Claude vision; phone photos are overkill beyond this

export interface CompressedImage {
  base64: string       // without data: URL prefix
  mimeType: string
  width: number
  height: number
}

export async function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.85
        let dataUrl = canvas.toDataURL('image/jpeg', quality)

        // Fine-grained quality reduction until under limit
        while (dataUrl.length * 0.75 > MAX_BYTES && quality > 0.05) {
          quality = Math.max(0.05, quality - 0.05)
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }

        const base64 = dataUrl.split(',')[1]

        if (base64.length * 0.75 > MAX_BYTES) {
          reject(new Error('Image could not be compressed small enough. Try a different photo.'))
          return
        }
        
        resolve({ base64, mimeType: 'image/jpeg', width, height })
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
