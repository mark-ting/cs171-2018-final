$('document').ready(() => {
  renderMap()
})

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

  // Attempt initialization
  try {
    const stationMap = new StationMap('map-area', 'map-sidebar', stations)
    stationMap.init()
  } catch (e) {
    console.warn('Error occurred while initialzing Leaflet/map.')
    console.warn(e)
  }
}
