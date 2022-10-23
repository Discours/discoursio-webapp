import { createReadStream } from 'fs'
import { S3Client, type S3ClientConfig, PutObjectCommand } from '@aws-sdk/client-s3'

// const accessKeyId = process.env.ACCESS_KEY
// const secretAccessKey = process.env.SECRET_KEY

const config: S3ClientConfig = {
  apiVersion: '2006-03-01',
  region: 'eu-east-1'
}
const s3 = new S3Client(config)

export default async function handler(req, res) {
  const params = {
    Bucket: process.env.S3_BUCKET || 'discours-io',
    Key: 'file-name', // FIXME
    Body: createReadStream('file-path') // FIXME
  }
  await s3.send(new PutObjectCommand(params))
  res.status(200).json() // FIXME
}
