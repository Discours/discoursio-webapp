import formidable from 'formidable'

export const formidablePromise = async (request, options) => {
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
