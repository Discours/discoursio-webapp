import { UploadFile } from '@solid-primitives/upload'

export const validateFiles = (fileType: string, files: UploadFile[]): boolean => {
  const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp'])
  const docExtensions = new Set(['doc', 'docx', 'pdf', 'txt'])

  for (const file of files) {
    let isValid: boolean

    switch (fileType) {
      case 'image': {
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        isValid = fileExtension ? imageExtensions.has(fileExtension) : false
        break
      }
      case 'video': {
        isValid = file.file.type.startsWith('video/')
        break
      }
      case 'doc': {
        const docExtension = file.name.split('.').pop()?.toLowerCase()
        isValid = docExtension ? docExtensions.has(docExtension) : false
        break
      }
      case 'audio': {
        isValid = file.file.type.startsWith('audio/')
        break
      }
      default: {
        isValid = false
      }
    }

    if (!isValid) {
      return false
    }
  }

  return true
}
