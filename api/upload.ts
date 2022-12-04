import { Writable } from 'stream'
import formidable from 'formidable'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

export const config = {
  api: {
    bodyParser: false
  }
}

const BUCKET_NAME = process.env.S3_BUCKET || 'discours-io'
const s3 = new S3Client({
  region: process.env.S3_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
})

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false
}

const formidablePromise = async (req, opts) => {
  return new Promise((accept, reject) => {
    const form = formidable(opts)

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return accept({ fields, files })
    })
  })
}

const fileConsumer = (acc) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk)
      next()
    }
  })

  return writable
}

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const chunks = []
      const { fields, files }: any = await formidablePromise(req, {
        ...formidableConfig,
        // consume this, otherwise formidable tries to save the file to disk
        fileWriteStreamHandler: () => fileConsumer(chunks)
      })

      const data = Buffer.concat(chunks)

      const params = {
        Bucket: process.env.S3_BUCKET || 'discours-io',
        Key: fields.name + '.' + fields.ext,
        Body: data,
        ACL: 'public-read',
        'Content-Type': fields.type
      }

      const upload = new Upload({ params, client: s3 })
      await upload.done()
      // console.log(upload)
      const { singleUploadResult: result }: any = upload
      return res.status(200).json(result.Location)
    } catch (error) {
      console.error(error)
    }
  }

  return res.status(405).end()
}

export default handler
