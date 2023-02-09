import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import formidable from 'formidable'
import { Writable } from 'stream'
import path from 'path'
import crypto from 'crypto'

const { STORJ_ACCESS_KEY, STORJ_SECRET_KEY, STORJ_END_POINT, STORJ_BUCKET_NAME, CDN_DOMAIN } = process.env

const storjS3Client = new S3Client({
  endpoint: STORJ_END_POINT,
  credentials: {
    accessKeyId: STORJ_ACCESS_KEY,
    secretAccessKey: STORJ_SECRET_KEY
  }
})

const formidablePromise = async (request, options) => {
  return new Promise((resolve, reject) => {
    const form = formidable(options)

    form.parse(request, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return resolve({ fields, files })
    })
  })
}

const fileConsumer = (acc) => {
  return new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk)
      next()
    }
  })
}

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false
}

const handleFileUpload = async (request) => {
  const chunks = []
  const { files } = await formidablePromise(request, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
    fileWriteStreamHandler: () => fileConsumer(chunks)
  })

  const data = Buffer.concat(chunks)

  const { originalFilename, mimetype } = files.file

  const fileExtension = path.extname(originalFilename)

  const filename = crypto.randomUUID() + fileExtension

  const params = {
    Bucket: STORJ_BUCKET_NAME,
    Key: filename,
    Body: data,
    ContentType: mimetype
  }

  const upload = new Upload({ params, client: storjS3Client })
  await upload.done()

  return `http://${CDN_DOMAIN}/${filename}`
}

const handler = async (request, response) => {
  try {
    const location = await handleFileUpload(request)
    return response.status(200).json(location)
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
}

export default handler
