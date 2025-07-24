"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, Eye, EyeOff, Lock, Unlock, ImageIcon } from "lucide-react"
import Image from "next/image"

export default function SteganographyApp() {
  const [encodeFile, setEncodeFile] = useState<File | null>(null)
  const [encodeText, setEncodeText] = useState("")
  const [encodedImage, setEncodedImage] = useState<string | null>(null)
  const [encodeLoading, setEncodeLoading] = useState(false)
  const [encodeKey,setEncodeKey] = useState("")
  const [decodeKey,setDecodeKey] = useState("")

  const [decodeFile, setDecodeFile] = useState<File | null>(null)
  const [decodedText, setDecodedText] = useState("")
  const [decodeLoading, setDecodeLoading] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleEncode = async () => {
    if (!encodeFile || !encodeText.trim()) {
      setError("Please select an image and enter text to hide")
      return
    }
    if (encodeText.length > 1000) {
      setError("Text is too long. Maximum 1000 characters allowed.")
      return
    }
    

    setEncodeLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("image", encodeFile)
      formData.append("text", encodeText)
      formData.append('key',encodeKey)

      const response = await fetch("/api/encrypt", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to encode image")
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setEncodedImage(imageUrl)
      setSuccess("Text successfully hidden in image!")
    } catch (err:any) {
      setError("Failed to encode image. Please try again.")
    } finally {
      setEncodeLoading(false)
    }
  }

  const handleDecode = async () => {
    if (!decodeFile) {
      setError("Please select an image to decode")
      return
    }

    setDecodeLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("image", decodeFile)
      formData.append('key',decodeKey)

      const response = await fetch("/api/decrypt", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to decode image")
      }

      setDecodedText(data.text)
      setSuccess("Hidden text successfully extracted!")
    } catch (err:any) {
      setError(err.message || "Failed to decode image. Make sure the image contains hidden text.")
    } finally {
      setDecodeLoading(false)
    }
  }

  const downloadImage = () => {
    if (encodedImage) {
      const link = document.createElement("a")
      link.href = encodedImage
      link.download = "encoded-image.png"
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Steganography Tool
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Hide secret messages inside images using advanced steganography techniques
            </p>
            <Badge variant="secondary" className="mt-2">
              Created by Chofor Seitsou Priestley Clarkson
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error/Success Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="encode" className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4" />
              <span>Hide Text</span>
            </TabsTrigger>
            <TabsTrigger value="decode" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Extract Text</span>
            </TabsTrigger>
          </TabsList>

          {/* Encode Tab */}
          <TabsContent value="encode">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Hide Secret Text</span>
                  </CardTitle>
                  <CardDescription>Upload an image and enter the text you want to hide inside it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="encode-image">Select Image</Label>
                    <div className="relative">
                      <Input
                        id="encode-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEncodeFile(e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <Upload className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {encodeFile && <p className="text-sm text-muted-foreground">Selected: {encodeFile.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret-text">Secret Text</Label>
                    <Textarea
                      id="secret-text"
                      placeholder="Enter the text you want to hide..."
                      value={encodeText}
                      onChange={(e) => setEncodeText(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{encodeText.length} characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret-text">Encrypt Key(Optional)</Label>
                    <Input
                      id="secret-key"
                      placeholder="Enter a key (Optional)"
                      value={encodeKey}
                      onChange={(e) => setEncodeKey(e.target.value)}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{encodeKey.length} characters</p>
                  </div>

                  <Button
                    onClick={handleEncode}
                    disabled={encodeLoading || !encodeFile || !encodeText.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {encodeLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Encoding...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Hide Text in Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Result Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Encoded Result</span>
                  </CardTitle>
                  <CardDescription>Your image with hidden text will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  {encodedImage ? (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border">
                        <Image
                          src={encodedImage || "/placeholder.svg"}
                          alt="Encoded image"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                      <Button onClick={downloadImage} className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Encoded Image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground text-center">Encoded image will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Decode Tab */}
          <TabsContent value="decode">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Unlock className="h-5 w-5" />
                    <span>Extract Hidden Text</span>
                  </CardTitle>
                  <CardDescription>
                    Upload an image that contains hidden text to extract the secret message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="decode-image">Select Encoded Image</Label>
                    <div className="relative">
                      <Input
                        id="decode-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDecodeFile(e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <Upload className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {decodeFile && <p className="text-sm text-muted-foreground">Selected: {decodeFile.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret-text">Decode Key(Optional)</Label>
                    <Input
                      id="secret-key-decode"
                      placeholder="Enter a key (Optional) "
                      value={decodeKey}
                      onChange={(e) => setDecodeKey(e.target.value)}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{decodeKey.length} characters</p>
                  </div>
                  <Button
                    onClick={handleDecode}
                    disabled={decodeLoading || !decodeFile}
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    {decodeLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Extract Hidden Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Decoded Text Result */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Extracted Text</span>
                  </CardTitle>
                  <CardDescription>The hidden message will be revealed here</CardDescription>
                </CardHeader>
                <CardContent>
                  {decodedText ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Textarea
                          value={decodedText}
                          readOnly
                          rows={6}
                          className="resize-none border-0 bg-transparent focus:ring-0"
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{decodedText.length} characters extracted</span>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(decodedText)}>
                          Copy Text
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <Eye className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground text-center">Hidden text will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-12" />

        {/* Info Section */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <Lock className="h-8 w-8 mx-auto text-blue-500" />
              <p className="font-medium">LSB Steganography</p>
              <p>Hides text in the least significant bits of image pixels</p>
            </div>
            <div className="space-y-2">
              <ImageIcon className="h-8 w-8 mx-auto text-green-500" />
              <p className="font-medium">Invisible Changes</p>
              <p>Modifications are imperceptible to the human eye</p>
            </div>
            <div className="space-y-2">
              <Unlock className="h-8 w-8 mx-auto text-purple-500" />
              <p className="font-medium">Perfect Extraction</p>
              <p>Retrieve the exact hidden message from encoded images</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
