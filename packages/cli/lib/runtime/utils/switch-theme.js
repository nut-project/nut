/* global document */

export default function switchTheme( theme ) {
  switch ( theme ) {
  case 'ocean':
    document.documentElement.style.setProperty( '--primary-color', '#79bef6' )
    document.documentElement.style.setProperty( '--primary-color-dark', '#568ffd' )
    break
  case 'sakura':
    document.documentElement.style.setProperty( '--primary-color', '#f67995' )
    document.documentElement.style.setProperty( '--primary-color-dark', '#ff6a8b' )
    break
  default:
    break
  }
}
