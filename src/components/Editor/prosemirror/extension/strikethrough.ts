import { inputRules } from 'prosemirror-inputrules'
import { MarkType } from 'prosemirror-model'
import { markInputRule } from './mark-input-rule'
import { ProseMirrorExtension } from '../helpers'

const strikethroughRule = (nodeType: MarkType) => markInputRule(/(?:~~)(.+)(?:~~)$/, nodeType)

const strikethroughSchema = {
  strikethrough: {
    parseDOM: [{ tag: 'del' }],
    toDOM: () => ['del']
  }
}

export default (): ProseMirrorExtension => ({
  schema: (prev) => ({
    ...prev,
    marks: (prev.marks as any).append(strikethroughSchema)
  }),
  plugins: (prev, schema) => [
    ...prev,
    inputRules({ rules: [strikethroughRule(schema.marks.strikethrough)] })
  ]
})
