import { ROUTES } from '../../stores/router'
import { getServerRoute } from '../../utils/getServerRoute'

// yes, it's a hack
export default getServerRoute(ROUTES.expo.replace(':layout?', '*'))
