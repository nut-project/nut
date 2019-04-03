import Router from 'unfancy-router'
import routes from 'nut-auto-generated-routes'
import createNico from '../core/router'

export default function ( ctx ) {
  const router = Router()

  const root = router.create( {
    name: '_',
    path: '',
  } )

  const nico = createNico( root, router, '', ctx )
  nico.define( routes )

  return nico
}
