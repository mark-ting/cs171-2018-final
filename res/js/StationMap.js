/*global L */

// TODO: get municipalities externally
const municipalitiesToIds = {
  'Boston': 0,
  'Brookline': 1,
  'Cambridge': 2,
  'Somerville': 3
}

class StationMap {
  constructor(mapElement, mapCenter, dataService, sidebarElement) {
    this.mapElement = mapElement
    this.mapCenter = mapCenter
    this.dataService = dataService
    this.sidebarElement = sidebarElement

    this.prevStation = null
    this.activeStation = null
    this.init()
  }

  // Wrapper for chained initialization
  async init() {
    await this.loadData()

    this
      .initMap()
      .initSvgLayer()
      .update()
  }

  async loadData () {
    const stationData = (await this.dataService.get('stations_with_trips')).stations

    this.stations = stationData.map(s => {
      const station = Object.assign(s, {
        'latitude': +s['latitude'],
        'longitude': +s['longitude'],
        'LatLng': new L.LatLng(s['latitude'], s['longitude']),
        'docks': +s['docks']
      })
      return station
    })

    return this
  }

  initMap() {
    this.map = L.map(this.mapElement)
    this.map.setView([this.mapCenter.Latitude, this.mapCenter.Longitude], 13)
    this.map.on('zoom moveend', () => {
      this.update()
    })

    return this
  }

  initSvgLayer() {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF0MzA0OSIsImEiOiJjam9sdHB0NDgwdWNkM3ZtbzEzY3dldWNjIn0.4owqhToBPRWbdAfVz2FtIg', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.map)

    const svgLayer = L.svg({
      interactive: true,
      bubblingMouseEvents: true,
      pane: 'markerPane'
    })
    svgLayer.addTo(this.map)

    this.svg = d3.select('#' + this.mapElement).select('svg')
    this.g = this.svg.select('g')

    return this
  }

  update() {
    const bounds = this.map.getBounds()
    const drawable = this.stations.filter(s => bounds.contains(s.LatLng))

    const stationElements = this.g.selectAll('circle')
      .data(drawable)

    stationElements.enter()
      .append('circle')
      .attr('class', 'station')
      .attr("pointer-events", "all")
      .on('mouseover', (d, i, q) => {
        if (this.activeStation == d) {
          return
        }

        d3.select(q[i])
          .attr('stroke', 'blue')
          .attr('stroke-width', '2')
      })
      .on('mouseout', (d, i, q) => {
        if (this.activeStation == d) {
          return
        }

        d3.select(q[i])
          .attr('stroke-width', '0')
      })
      .on('click', (d, i ,q) => {
        d3.select(q[i])
        .attr('stroke', 'green')
        .attr('stroke-width', '2')

        this.setActiveStation(d)
      })

    stationElements
      .attr('r', 10)
      .attr('transform', d => {
        const t = this.map.latLngToLayerPoint(d.LatLng)
        return `translate(${t.x}, ${t.y})`
      })

    stationElements.exit()
      .remove()
  }

  setActiveStation(station) {
    this.activeStation = station
    this.updateSidebar(station)
  }

  // TODO: update with new data format
  // TODO: dynamic binding to sidebar object
  updateSidebar(station) {
    // Skip if station invalid
    if (station === undefined || station === null) {
      return
    }

    // Skip if no sidebar defined
    if (this.sidebarElement === undefined || this.sidebarElement === null) {
      return
    }

    $('#sidebar-station').text(station['name'])
    $('#sidebar-station-municipality').text(station['municipality'])
    $('#sidebar-station-id').text(station['id'])
    $('#sidebar-station-docks').text(station['docks'])
    // $('#sidebar-station-outgoing').text(station['outgoing'])
    // $('#sidebar-station-incoming').text(station['incoming'])
  }
}
