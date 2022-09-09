import { atom, action } from 'nanostores'
import type { AuthResult } from '../graphql/types.gen'
import { getLogger } from '../utils/logger'
import { resetToken, setToken } from '../graphql/privateGraphQLClient'

const log = getLogger('auth-store')

export const session = atom<AuthResult & { email: string }>()
