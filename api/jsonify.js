// api/convert.js
import { Editor } from '@tiptap/core'
import { base, custom } from 'src/lib/editorOptions'

// Добавьте другие расширения при необходимости

export default function handler(req, res) {
  // Разрешаем только метод POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Получаем HTML из тела запроса
  const { html } = req.body

  if (!html) {
    res.status(400).json({ error: 'No HTML content provided' })
    return
  }

  try {
    const editor = new Editor({ extensions: [...base, ...custom] })

    editor.commands.setContent(html, false, {
      parseOptions: {
        preserveWhitespace: 'full'
      }
    })

    const jsonOutput = editor.getJSON()

    res.status(200).json(jsonOutput)
  } catch (error) {
    console.error('Ошибка при конвертации:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
