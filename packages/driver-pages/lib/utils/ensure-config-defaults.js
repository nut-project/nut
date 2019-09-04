module.exports = function ensureConfigDefaults( config = {} ) {
  config.markdown = config.markdown || {}
  config.markdown.theme = config.markdown.theme || 'prism-tomorrow'
  config.markdown.remarkPlugins = config.markdown.remarkPlugins || []
  config.markdown.rehypePlugins = config.markdown.rehypePlugins || []
}
