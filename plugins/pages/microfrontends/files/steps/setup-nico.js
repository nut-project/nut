import createNico from '../core/nico'

export default function ( ctx, routes, root, router, pluginOptions ) {
  const nico = createNico( ctx, root, router, pluginOptions )

  nico.define( routes )

  return nico
}
