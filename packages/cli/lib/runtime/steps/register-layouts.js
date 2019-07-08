import defaultLayout from '../layouts/default'
import nowLayout from '../layouts/now'
import now2Layout from '../layouts/now2'
import noneLayout from '../layouts/none'
import saberLayout from '../layouts/saber'
import kaolaLayout from '../layouts/kaola'

import applyPlugins from './apply-plugins'

export default async function ( pluginOptions, context ) {
  await applyPlugins( [
    defaultLayout,
    saberLayout,
    nowLayout,
    noneLayout,
    kaolaLayout,
    now2Layout,
  ], pluginOptions, context )
}
