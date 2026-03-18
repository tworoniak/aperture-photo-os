// const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!
// const API_KEY = Deno.env.get("CLOUDINARY_API_KEY")!
// const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!

// async function generateSignature(params: Record<string, string>): Promise<string> {
//   const sortedKeys = Object.keys(params).sort()
//   const paramString = sortedKeys
//     .map((key) => `${key}=${params[key]}`)
//     .join("&")

//   const stringToSign = paramString + API_SECRET

//   // Cloudinary uses SHA-1 hash, not HMAC
//   const encoder = new TextEncoder()
//   const data = encoder.encode(stringToSign)
//   const hashBuffer = await crypto.subtle.digest("SHA-1", data)

//   return Array.from(new Uint8Array(hashBuffer))
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("")
// }

// Deno.serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       },
//     })
//   }

//   if (req.method !== "POST") {
//     return new Response("Method not allowed", { status: 405 })
//   }

//   try {
//     const { publicIds, galleryTitle } = await req.json()

//     if (!publicIds || publicIds.length === 0) {
//       return new Response(
//         JSON.stringify({ error: "No photos provided" }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       )
//     }

//     const timestamp = Math.floor(Date.now() / 1000).toString()
//     const targetPublicId = `aperture-${(galleryTitle as string)
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-|-$/g, "")}-${timestamp}`

//     // Sort public IDs for consistent signing
//     const sortedPublicIds = [...publicIds].sort().join(",")

//     const paramsToSign: Record<string, string> = {
//   mode:             "download",
//   public_ids:       sortedPublicIds,
//   target_public_id: targetPublicId,
//   timestamp,
// }

//     const signature = await generateSignature(paramsToSign)

//     const formData = new FormData()
//     formData.append("public_ids", sortedPublicIds)
//     formData.append("target_public_id", targetPublicId)
//     formData.append("timestamp", timestamp)
//     formData.append("api_key", API_KEY)
//     formData.append("signature", signature)
//     formData.append("mode", "download")

//     console.log("Calling Cloudinary with params:", {
//       public_ids: sortedPublicIds,
//       target_public_id: targetPublicId,
//       timestamp,
//       api_key: API_KEY,
//     })

//     const response = await fetch(
//       `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/generate_archive`,
//       { method: "POST", body: formData }
//     )

//     const responseText = await response.text()
//     console.log("Cloudinary response:", responseText)

//     if (!response.ok) {
//       throw new Error(`Cloudinary error: ${responseText}`)
//     }

//     const data = JSON.parse(responseText)

//     return new Response(
//       JSON.stringify({ url: data.url }),
//       {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     )
//   } catch (err) {
//     return new Response(
//       JSON.stringify({ error: (err as Error).message }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     )
//   }
// })
