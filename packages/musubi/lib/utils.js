exports.singleton = ( function () {
  const map = new Map()

  return function singleton( FactoryClass ) {
    if ( !map.has( FactoryClass ) ) {
      map.set( FactoryClass, new FactoryClass() )
    }

    return map.get( FactoryClass )
  }
} )()
