import type { AstroUserConfig } from 'astro'
import { selectAll } from 'hast-util-select'

const write =
  (cl) =>
  ({ properties }) => {
    properties.className = properties.className ? properties.className + ' ' + cl : cl
  }
const adder = ([selector, className]) => {
  const writer = write(className)
  return (node) => selectAll(selector, node).forEach((el) => writer(el as any))
}
const addClasses = (additions) => {
  const adders = Object.entries(additions).map((entry) => adder(entry))
  return (node) => adders.forEach((a) => a(node))
}

export const markdownOptions: AstroUserConfig['markdown'] = {
  // remarkPlugins: ['remark-code-titles'],
  rehypePlugins: [
    // 'rehype-slug',
    // ['rehype-autolink-headings', { behavior: 'prepend' }],
    // ['rehype-toc', { headings: ['h2', 'h3'] }],
    [addClasses, { 'h1,h2,h3': 'title' }]
  ]
}
