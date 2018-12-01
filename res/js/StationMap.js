/*global L */

class StationMap {
  constructor(mapElement, mapCenter, dataService, distanceService, sidebarElement) {
    this.mapElement = mapElement
    this.mapCenter = mapCenter
    this.dataService = dataService
    this.distanceService = distanceService
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

  // Load initial station data
  async loadData() {
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

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF0MzA0OSIsImEiOiJjam9sdHB0NDgwdWNkM3ZtbzEzY3dldWNjIn0.4owqhToBPRWbdAfVz2FtIg', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(this.map)

    this.map.setView([this.mapCenter.Latitude, this.mapCenter.Longitude], 13)

    this.map.on('zoom moveend', () => {
      this.update()
    })

    return this
  }

  initSvgLayer() {
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

  async update() {
    const bounds = this.map.getBounds()
    const drawable = this.stations.filter(s => bounds.contains(s.LatLng))

    const activeStrokeWidth = 4

    this.g.selectAll('.station')
      .data(drawable)
      .enter()
      .append('circle')
      .attr('class', 'station')
      .attr('pointer-events', 'all')
      .on('mouseover', (d, i, q) => {
        if (this.activeStation == d) {
          return
        }

        d3.select(q[i])
          .attr('stroke', 'yellow')
          .attr('stroke-width', activeStrokeWidth)
      })
      .on('mouseout', (d, i, q) => {
        if (this.activeStation == d) {
          return
        }

        d3.select(q[i])
          .attr('stroke-width', '0')
      })
      .on('click', (d, i, q) => {
        d3.select(q[i])
          .attr('stroke', 'cyan')
          .attr('stroke-width', activeStrokeWidth)

        this.updateStationSelection(d)
        this.update()
      })

    this.g.selectAll('.station')
      .attr('fill', 'rgb(23, 73, 172)')
      .attr('fill-opacity', 0.7)
      .attr('stroke-opacity', 1)
      .attr('stroke-width', d => this.activeStation === d ? activeStrokeWidth : 0)
      .attr('r', d => {
        return 10
      })
      .attr('transform', d => {
        const t = this.map.latLngToLayerPoint(d.LatLng)
        return `translate(${t.x}, ${t.y})`
      })

    this.g.selectAll('.station')
      .data(drawable)
      .exit()
      .remove()
  }

  async updateStationSelection(station) {
    if (this.activeStation === station) {
      return
    }

    this.prevStation = this.activeStation
    this.activeStation = station
    this.updateSidebar()
    this.updateComparison()
  }

  async updateSidebar() {
    // Skip if no active station
    if (this.activeStation === undefined || this.activeStation === null) {
      return
    }

    // Skip if no sidebar defined
    if (this.sidebarElement === undefined || this.sidebarElement === null) {
      return
    }

    // Fetch demographic data
    const demographics = await this.dataService.get('demographics', {
      'station': this.activeStation.id
    })

    // Fetch in/outbound data
    const outbound = await this.dataService.get('outbound', {
      'station': this.activeStation.id
    })

    const inbound = await this.dataService.get('inbound', {
      'station': this.activeStation.id
    })

    // Process in/outbound data
    let outboundTotal = 0
    for (const [k, v] of Object.entries(outbound)) {
      outbound[k] = +v
      outboundTotal += +v
    }

    let inboundTotal = 0
    for (const [k, v] of Object.entries(inbound)) {
      inbound[k] = +v
      inboundTotal += +v
    }

    $('#sidebar-station').text(this.activeStation['name'])
    $('#sidebar-station-municipality').text(this.activeStation['municipality'])
    $('#sidebar-station-id').text(this.activeStation['id'])
    $('#sidebar-station-docks').text(this.activeStation['docks'])
    $('#sidebar-station-outbound').text(outboundTotal)
    $('#sidebar-station-inbound').text(inboundTotal)
    $('#sidebar-station-demo-f').text(demographics['female'] || 0)
    $('#sidebar-station-demo-m').text(demographics['male'] || 0)
    $('#sidebar-station-demo-u').text(demographics['unknown'] || 0)
  }

  async updateComparison() {
    if (!this.prevStation || !this.activeStation) {
      return
    }

    const drivingInfo = await this.getDistanceInfo(this.activeStation, this.prevStation, 'DRIVING')
    const bikingInfo = await this.getDistanceInfo(this.activeStation, this.prevStation, 'BICYCLING')

    $('#comparison-start').text(this.prevStation['name'])
    $('#comparison-end').text(this.activeStation['name'])
    $('#comparison-distance-driving').text(drivingInfo.distance.text)
    $('#comparison-distance-biking').text(bikingInfo.distance.text)
    $('#comparison-time-driving').text(drivingInfo.duration.text)
    $('#comparison-time-biking').text(bikingInfo.duration.text)
    $('#comparison-emission').html('~' + (drivingInfo.distance.value / 1609.34 * 404).toFixed(2) + 'g CO<sub>2</sub>')
  }

  async getDistanceInfo(a, b, mode) {
    if (!a || !b) {
      return
    }

    const request = new Promise((resolve, reject) => {
      this.distanceService.getDistanceMatrix(
        {
          origins: [a.LatLng],
          destinations: [b.LatLng],
          travelMode: mode,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, resolve)
    })

    return (await request).rows[0].elements[0]
  }
}
