/*global L */

// TODO: get municipalities externally
const municipalitiesToIds = {
  'Boston': 0,
  'Brookline': 1,
  'Cambridge': 2,
  'Somerville': 3
}

class StationMap {
  constructor(mapElement, mapCenter, stations, sidebarElement) {
    this.mapElement = mapElement
    this.mapCenter = mapCenter
    this.stations = stations
    this.sidebarElement = sidebarElement

    this.activeStation = null
    this.init()
  }

  // Wrapper for chained initialization
  init() {
    this
      .initIcons()
      .initMap()
      .initLayers()
      .updateMap()
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
    this.map = L.map(this.mapElement).setView([this.mapCenter.Latitude, this.mapCenter.Longitude], 13)
    return this
  }

  initLayers() {
    const defaultBase = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF0MzA0OSIsImEiOiJjam9sdHB0NDgwdWNkM3ZtbzEzY3dldWNjIn0.4owqhToBPRWbdAfVz2FtIg', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.map)

    this.base = {
      "Default": defaultBase
    }

    this.overlays = {
    }

    // TODO: get municipalities externally
    const municipalities = [...new Set(this.stations.map(s => s.Municipality))]
    municipalities.forEach(m => {
      this.overlays[m] = L.featureGroup().addTo(this.map)
    })

    L.control.layers(this.base, this.overlays).addTo(this.map);
    return this
  }

  updateMap() {
    // Clear layers
    for (const layerName in this.overlays) {
      const overlayLayer = this.overlays[layerName]
      overlayLayer.clearLayers()
    }

    // Add stations
    this.stations.forEach(s => {
      let stationIcon

      // TODO: externalize municipality color coding
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
      }).addTo(this.overlays[s.Municipality])

      // Bind station to marker
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
    // Skip if no sidebar defined
    if (this.sidebarElement === undefined || this.sidebarElement === null) {
      return
    }

    $('#sidebar-station').text(station['Station'])
    $('#sidebar-station-municipality').text(station['Municipality'])
    $('#sidebar-station-id').text(station['Station ID'])
    $('#sidebar-station-docks').text(station['# of Docks'])
    $('#sidebar-station-outgoing').text(station['outgoing'])
    $('#sidebar-station-incoming').text(station['incoming'])
  }
}
