const path = require( 'path' )

module.exports = {
  transformer: 'handlebars',

  templateData: {
    nutVersion: require( '../../../package.json' ).version
  },

  prompts() {
    return [
      {
        name: 'name',
        message: 'What is the name of the new project',
        default: this.outFolder,
        filter: val => val.toLowerCase()
      },
      {
        name: 'description',
        message: 'How would you descripe the new project',
        default: `my awesome nut project`
      },
      {
        name: 'username',
        message: 'What is your username',
        default: this.gitUser.username || this.gitUser.name,
        filter: val => val.toLowerCase(),
        store: true
      },
      {
        name: 'email',
        message: 'What is your email?',
        default: this.gitUser.email,
        store: true
      },

      // nut.config.js
      {
        name: 'zh',
        message: 'Name of your application in Chinese',
        default: '应用名',
      },
    ]
  },

  actions: [
    {
      type: 'add',
      files: '**',
    },
  ],

  async completed() {
    await this.gitInit()

    // const pkgPath = path.join( this.outDir, 'package.json' )
    // if ( await this.fs.pathExists( pkgPath ) ) {
    //   await this.npmInstall()
    // }

    this.showProjectTips()
  }
}
