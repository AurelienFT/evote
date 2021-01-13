import axios from 'axios'

function Api() {
    return axios.create({
      baseURL: `https://api.vote.oursin.eu`
    });
}

export default Api;