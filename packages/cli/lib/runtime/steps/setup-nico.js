import Router from 'unfancy-router'
import routes from 'nut-auto-generated-routes'
import createNico from '../core/router'

export default function ( ctx, pluginOptions ) {
  const router = Router()

  const root = router.create( {
    name: '_',
    path: '',
  } )

  const nico = createNico( root, router, '', ctx, pluginOptions )
  nico.define( routes )

  return nico
}
