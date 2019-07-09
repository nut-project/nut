module.exports = {
  extends: [ '@commitlint/config-conventional' ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'release',
        'dependency',
        'breaking',
      ]
    ],
    'header-max-length': [ 2, 'always', 120 ]
  }
}
