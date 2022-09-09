import loglevel from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

prefix.reg(loglevel)
prefix.apply(loglevel, {
  template: '[%n]'
})

// FIXME isDev
loglevel.enableAll()

export const getLogger = (name: string) => loglevel.getLogger(name)
