import loglevel from 'loglevel'
import prefix from 'loglevel-plugin-prefix'
import { isDev } from './config'

prefix.reg(loglevel)
prefix.apply(loglevel, { template: '[%n]' })
loglevel.setLevel(isDev ? loglevel.levels.TRACE : loglevel.levels.ERROR)

export const getLogger = (name: string) => loglevel.getLogger(name)
