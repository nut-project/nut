import routes from 'nut-auto-generated-routes'
import createNico from '../core/router'

export default function ( ctx, pluginOptions, root, router ) {
  const nico = createNico( root, router, '', ctx, pluginOptions )
  nico.define( routes )

  return nico
}
