import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: `http://ec2-15-237-109-51.eu-west-3.compute.amazonaws.com:8081`
  })
}