import { ROUTES } from '../stores/router'
import { getServerRoute as gsr } from '../utils/getServerRoute'

const getServerRoute = () => gsr(ROUTES.drafts)

export { getServerRoute }
