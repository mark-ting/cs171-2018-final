$('document').ready(() => {
  renderMap()
})

async function renderMap() {
  // Load station data
  const stationCsvData = await d3.csv('res/data/Hubway_Stations_2011_2016.csv')
  const stations = stationCsvData.map(s => Object.assign(s, {
    'Latitude': +s['Latitude'],
    'Longitude': +s['Longitude']
  }))

  // Attempt initialization
  try {
    const stationMap = new StationMap('map-area', 'map-sidebar', stations)
    stationMap.init()
  } catch (e) {
    console.warn('Error occurred while initialzing Leaflet/map.')
    console.warn(e)
  }
}
