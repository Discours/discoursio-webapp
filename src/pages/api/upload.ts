// pages/api/upload.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

export default async function handler(req, res) {
  const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  })

  const post = await createPresignedPost(s3Client, {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.query.file,
    Fields: {
      acl: 'public-read',
      'Content-Type': req.query.fileType
    },
    Expires: 600, // seconds
    Conditions: [
      ['content-length-range', 0, 22 * 1048576] // up to 22 MB
    ]
  })

  res.status(200).json(post)
}
