exports.name = 'test',

exports.apply = function ( ctx = {}, options = {} ) {
  const { events } = ctx

  events.on( 'system:before-startup', () => {} )
  events.on( 'route:enabled', () => {} )
}
