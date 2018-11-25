$('document').ready(() => {
  renderMap()
})


const Boston = {
  Latitude: 42.3601,
  Longitude: -71.075
}

async function renderMap() {
  // Attempt initialization
  try {
    const dataService = new DataService('http://vps77598.vps.ovh.ca/bluebikes', '.php')
    const stationMap = new StationMap('map-area', Boston, dataService, 'map-sidebar')
  } catch (e) {
    console.warn('Error occurred while initialzing Leaflet/map.')
    console.warn(e)
  }
}
