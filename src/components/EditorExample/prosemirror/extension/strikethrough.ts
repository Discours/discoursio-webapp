import { inputRules } from 'prosemirror-inputrules'
import type { MarkSpec, MarkType } from 'prosemirror-model'
import { markInputRule } from './mark-input-rule'
import type { ProseMirrorExtension } from '../helpers'
import type OrderedMap from 'orderedmap'

const strikethroughRule = (nodeType: MarkType) => markInputRule(/~{2}(.+)~{2}$/, nodeType)

const strikethroughSchema = {
  strikethrough: {
    parseDOM: [{ tag: 'del' }],
    toDOM: () => ['del']
  }
} as MarkSpec

export default (): ProseMirrorExtension => ({
  schema: (prev) => ({
    ...prev,
    marks: (prev.marks as OrderedMap<MarkSpec>).append(strikethroughSchema)
  }),
  plugins: (prev, schema) => [
    ...prev,
    inputRules({ rules: [strikethroughRule(schema.marks.strikethrough)] })
  ]
})
