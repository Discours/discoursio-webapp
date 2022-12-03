// pages/api/upload.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import formidable from 'formidable'
import fs from 'fs'

const putObject = async (s3Client, key, body, contentType) => {
  // workaround for the issue: https://github.com/aws/aws-sdk-js-v3/issues/1800
  s3Client.middlewareStack.add(
    (next, _context) => (args) => {
      delete args.request.headers['content-type']
      return next(args)
    },
    {
      step: 'build'
    }
  )

  const objectParams = {
    ACL: 'public-read',
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType
  }

  const results = await s3Client.send(new PutObjectCommand(objectParams))
  return results
}

const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      resolve({ fields, files })
    })
  })
}

export async function handler(req, res) {
  const s3Client = new S3Client({
    region: process.env.S3_REGION || 'eu-west-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    }
  })

  if (req.method === 'POST') {
    const data = await parseFormData(req)
    const files = data?.files
    const image = files.image
    const body = fs.readFileSync(image.path)

    // const resp = await putObject(s3Client, image.name, body, image.type)

    const resp = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_BUCKET_NAME || 'discours-io',
      Key: image.path,
      Fields: {
        acl: 'public-read',
        'Content-Type': image.type
      },
      Expires: 600, // seconds
      Conditions: [
        ['content-length-range', 0, 22 * 1048576] // up to 22 MB
      ]
    })
    return res.status(200).json(resp)
  }

  return res.status(405).end()
}
