import type { AstroUserConfig } from 'astro'
import type { RehypePlugin } from '@astrojs/markdown-remark'
import { selectAll } from 'hast-util-select'
import rehypeToc from '@jsdevtools/rehype-toc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkCodeTitles from 'remark-code-titles'

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
  remarkPlugins: [remarkCodeTitles],
  rehypePlugins: [
    rehypeSlug,
    [rehypeToc as RehypePlugin<any[]>, { headings: ['h1', 'h2', 'h3'] }],
    [rehypeAutolinkHeadings, { behavior: 'prepend' }],
    [addClasses, { 'h1,h2,h3': 'title' }]
  ],
  extendDefaultPlugins: true
}
