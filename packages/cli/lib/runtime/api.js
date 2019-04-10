import axios from 'axios'

export default function ( { pages } = {} ) {
  let axiosInstance = axios.create( {
    withCredentials: true,
    crossDomain: true,
  } )

  return {
    axios: axiosInstance,
    getPageLink( page, data ) {
      // TODO: data, pathToRegexp.compile
      const found = pages.find( p => p.page === page )

      if ( !found ) {
        return location.hash
      }

      return '/#' + found.route
    },
  }
}
