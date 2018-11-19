$('document').ready(() => {
  renderMap()
})

const Boston = {
  Latitude: 42.3601,
  Longitude: -71.075
}

async function renderMap() {
  // Load station data
  const stationCsvData = await d3.csv('res/data/Hubway_Stations_2011_2016.csv')
  const stationTripCsvData = await d3.csv('res/data/station_trips_2011.csv')
  const stationsWithTrips = stationTripCsvData.map(s => s.station)

  const stationTripsById = stationTripCsvData.reduce((map, obj) => (map[obj['station']] = obj, map), {})

  const stations = stationCsvData
    .filter(s => stationsWithTrips.includes(s['Station']))
    .map(s => {
      const stationName = s['Station']
      const station = Object.assign(s, {
        'Latitude': +s['Latitude'],
        'Longitude': +s['Longitude'],
        '# of Docks': +s['# of Docks'],
        'outgoing': stationTripsById[stationName]['outgoing'],
        'incoming': stationTripsById[stationName]['incoming']
      })
      return station
    })

  // TODO: move this into shared data streaming manager
  const municipalities = [...new Set(stations.map(s => s.Municipality))]

  // Attempt initialization
  try {
    const stationMap = new StationMap('map-area', Boston, stations, 'map-sidebar')
  } catch (e) {
    console.warn('Error occurred while initialzing Leaflet/map.')
    console.warn(e)
  }
}
