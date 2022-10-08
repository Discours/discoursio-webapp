import { inputRules } from 'prosemirror-inputrules'
import type { MarkType } from 'prosemirror-model'
import { markInputRule } from './mark-input-rule'
import type { ProseMirrorExtension } from '../../store/state'

const strikethroughRule = (nodeType: MarkType) => markInputRule(/~{2}(.+)~{2}$/, nodeType)

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
