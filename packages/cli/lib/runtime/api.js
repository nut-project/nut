import axios from 'axios'

let service = axios.create()

if ( process.env.NODE_ENV === 'development' ) {
  service = axios.create( {
    withCredentials: true,
    crossDomain: true,
  } )
}

const api = {
  axios: service,
}

export default api
