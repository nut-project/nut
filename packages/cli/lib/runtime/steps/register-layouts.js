import defaultLayout from '../layouts/default'
import nowLayout from '../layouts/now'
import noneLayout from '../layouts/none'
import saberLayout from '../layouts/saber'
import kaolaLayout from '../layouts/kaola'

import applyPlugins from './apply-plugins'

export default async function ( context ) {
  await applyPlugins( [
    defaultLayout,
    saberLayout,
    nowLayout,
    noneLayout,
    kaolaLayout,
  ], {}, context )
}
