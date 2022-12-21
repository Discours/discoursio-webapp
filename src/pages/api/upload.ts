// pages/api/upload.ts

import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

export async function putToS3(fileObject, presignedUrl) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': fileObject.type
    },
    body: fileObject
  }
  const response = await fetch(presignedUrl, requestOptions)
  return await response
}

export default async function handler(req, res) {
  const s3Client = new S3Client({
    region: process.env.S3_REGION || 'eu-west-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  })
  const presignedUrl = await createPresignedPost(s3Client, {
    Bucket: process.env.S3_BUCKET_NAME || 'discours-io',
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
  const result = await putToS3(req.query.file, presignedUrl)
  console.debug(result)
  res.status(200).json(presignedUrl)
}
