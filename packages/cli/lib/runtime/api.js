import axios from 'axios'

let axiosInstance = axios.create( {
  withCredentials: true,
  crossDomain: true,
} )

const api = {
  axios: axiosInstance,
}

export default api
