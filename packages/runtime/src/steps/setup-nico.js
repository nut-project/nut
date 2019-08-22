import createNico from '../core/nico'

export default function ( ctx, pluginOptions, routes, root, router ) {
  const nico = createNico( root, router, '', ctx, pluginOptions )

  nico.define( routes )

  return nico
}
