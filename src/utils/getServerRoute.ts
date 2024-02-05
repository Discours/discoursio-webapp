// /:slug -> /@slug
// https://vike.dev/routing
// https://www.npmjs.com/package/@nanostores/router
import { ROUTES } from '../stores/router'

export const getServerRoute = (clientRoute: string = ROUTES) => clientRoute.replaceAll(':', '@')
