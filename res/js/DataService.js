class DataService {
  constructor(baseUrl, suffix) {
    this.baseUrl = baseUrl
    this.suffix = suffix
  }

  async get(endpoint, params) {
    let paramStr = ''

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (paramStr) {
          paramStr += '&'
        } else {
          paramStr += '?'
        }

        paramStr += `${k}=${encodeURIComponent(params[k])}`
      }
    }

    const requestUrl = this.baseUrl + '/' + this.s(endpoint) + paramStr
    console.log(requestUrl)

    try {
      const response = await fetch(requestUrl)
      return response.json()
    } catch (e) {
      console.error(e)
    }
  }

  s(endpoint) {
    return endpoint + this.suffix
  }
}