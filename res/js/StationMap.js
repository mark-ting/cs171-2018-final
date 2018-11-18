/*global L */

// TODO: make these shared globals with other vis
const Boston = {
  Latitude: 42.3601,
  Longitude: -71.075
}

const municipalitiesToIds = {
  'Boston': 0,
  'Brookline': 1,
  'Cambridge': 2,
  'Somerville': 3
}

class StationMap {
  constructor(mapElement, sidebarElement, stations) {
    this.mapElement = mapElement
    this.sidebarElement = sidebarElement
    this.stations = stations
    this.activeStation = null
  }

  // Wrapper for chained initialization
  init() {
    this.initIcons().initMap().initMarkers()
  }

  initIcons() {
    const BaseIcon = L.Icon.extend({
      options: {
        iconAnchor: [13, 41],
        popupAnchor: [0, -40],
        shadowUrl: 'res/img/marker-shadow.png'
      }
    })

    this.icons = {
      blue: new BaseIcon({ iconUrl: 'res/img/marker-icon-blue.png' }),
      orange: new BaseIcon({ iconUrl: 'res/img/marker-icon-orange.png' }),
      purple: new BaseIcon({ iconUrl: 'res/img/marker-icon-purple.png' }),
      red: new BaseIcon({ iconUrl: 'res/img/marker-icon-red.png' })
    }

    return this
  }

  initMap() {
    const Boston = {
      Latitude: 42.3601,
      Longitude: -71.075
    }

    this.map = L.map(this.mapElement).setView([Boston.Latitude, Boston.Longitude], 13)

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF0MzA0OSIsImEiOiJjam9sdHB0NDgwdWNkM3ZtbzEzY3dldWNjIn0.4owqhToBPRWbdAfVz2FtIg', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.map)

    return this
  }

  initMarkers() {
    L.featureGroup().addTo(this.map).on('click', e => {
      console.log(e)
    })

    this.stations.forEach(s => {
      let stationIcon
      switch (s['Municipality']) {
        case 'Boston':
          stationIcon = this.icons.blue
          break

        case 'Brookline':
          stationIcon = this.icons.orange
          break

        case 'Cambridge':
          stationIcon = this.icons.purple
          break

        case 'Somerville':
          stationIcon = this.icons.red
          break
      }

      const stationMarker = L.marker([s.Latitude, s.Longitude], {
        icon: stationIcon
      }).addTo(this.map)

      stationMarker['station'] = s

      const stationText = (
        `<b>${s['Station']}</b><br>` +
        `Docks: ${s['# of Docks']}`
      )

      stationMarker
        .bindPopup(stationText)
        .openPopup()

      stationMarker.on('click', (e) => {
        const station = e.target.station
        this.updateSidebar(station)
      })

    })
    return this
  }

  // TODO: update with new data format
  // TODO: dynamic binding to sidebar object
  updateSidebar(station) {
    $('#sidebar-station').text(station['Station'])
    $('#sidebar-station-municipality').text(station['Municipality'])
    $('#sidebar-station-id').text(station['Station ID'])
    $('#sidebar-station-docks').text(station['# of Docks'])
    $('#sidebar-station-outgoing').text(station['outgoing'])
    $('#sidebar-station-incoming').text(station['incoming'])
  }
}
