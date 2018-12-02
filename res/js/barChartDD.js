barChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.sorting = true;

    this.initVis();
}


barChart.prototype.initVis = function() {
    var vis = this;

    // remove content
    $("#"+vis.parentElement).empty();

    // initialize svg components
    vis.margin = { top: 30, right: 30, bottom: 30, left: 60};
    vis.width = $("#"+vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleLinear()
        .range([0, vis.width]);
    vis.y = d3.scaleBand()
        .rangeRound([vis.height, 0])
        .paddingInner(0.1);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "y-axis axis");
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "title")
        .attr("fill", "black")
        .attr("transform", "translate(" + (-30) + "," + (-10) + ")")
        .append("text")
        .text("Bike ID");

    vis.color = d3.scaleSequential(d3.interpolatePuBu);

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-5, 0]);

    // dictionary for month and number
    vis.monthDict = {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    };

    vis.wrangleData();
}


barChart.prototype.wrangleData = function(){
    var vis = this;

    vis.stationSelection = d3.select("#station").property("value");
    vis.freqSelection = d3.select("#data-freq").property("value");
    // filter data based on dropdown boxes
    var filteredData = vis.data.filter(function (d) {
        if(vis.freqSelection=="week") {
            vis.timeSelection = d3.select("#week-drop").property("value");
            return d.start_station_id==vis.stationSelection && d.week==vis.timeSelection;
        }
        else {
            vis.timeSelection = d3.select("#month-drop").property("value");
            return d.start_station_id==vis.stationSelection && d.month==vis.timeSelection;
        }
    });

    if(filteredData.length>0){
        var bikeID = {};
        filteredData.forEach(function (d) {
            if (!(d.bikeid in bikeID)) {
                d['numOcc'] = 1;
                bikeID[d.bikeid] = 1;
            } else {
                bikeID[d.bikeid] += 1;
                d['numOcc'] = bikeID[d.bikeid];
            }
        });

        vis.totalDuration = 0;
        vis.totalDistance = 0;
        filteredData.forEach(function (d) {
            d['totalOcc'] = bikeID[d.bikeid];
            d.duration = +d.duration;
            d.distance = +d.distance;
            vis.totalDuration += d.duration;
            vis.totalDistance += d.distance;
        });

        // sort bike id by number of trips
        var occSort = [];
        for(var key in bikeID) {
            var count = {
                "id": key,
                "num": bikeID[key]
            };
            occSort.push(count);
        }
        occSort.sort(function (a, b) {
            return b.num - a.num;
        });

        // keep the top 20
        if(occSort.length<=20) vis.displayData = filteredData;
        else{
            occSort = occSort.slice(0, 20);
            var ids = [];
            occSort.forEach(function (value) {
                ids.push(value.id);
            });
            vis.displayData = filteredData.filter(function (d) {
                return ids.includes(d.bikeid);
            });
        }

        vis.updateVis();
    }
    else {
        $("#"+vis.parentElement).empty();
        $("#trip-summary").empty();
        var displayText = "<p id='unavailable'>Trip information is not available given the selected filter.<br>";
        displayText += "This station may be closed during the chosen period.<br>";
        displayText += "Please select another station or time range. </p>";
        document.getElementById(vis.parentElement).innerHTML= displayText;
    }

}


barChart.prototype.updateVis = function () {
    var vis = this;

    var infoType = d3.select("#trip-info-type").property("value");

    // calculate the position of bars
    var bikeInfo = {};
    vis.displayData.forEach(function(d){
        if (!(d.bikeid in bikeInfo)) {
            bikeInfo[d.bikeid] = d[infoType];
            d['totaldist'] = d[infoType];
            d['distancePlot'] = 0;
        } else {
            bikeInfo[d.bikeid] += d[infoType];
            d['totaldist'] = bikeInfo[d.bikeid];
            d['distancePlot'] = bikeInfo[d.bikeid]-d[infoType];
        }
    });

    vis.displayData.sort(function (a, b) {
        return b.totaldist-a.totaldist;
    });

    // update domain of x-axis and y-axis
    var maxVal = 0;
    for(var key in bikeInfo) {
        if(bikeInfo[key]>maxVal) maxVal = bikeInfo[key];
    }

    vis.x.domain([0, maxVal]);
    vis.y.domain(vis.displayData.map(function (d) {
        return d.bikeid;
    }));

    // sorting
    if(!vis.sorting) vis.y.rangeRound([0, vis.height]);
    else vis.y.rangeRound([vis.height, 0]);

    vis.color.domain(d3.extent(vis.displayData, function (d) {
        return d[infoType];
    }))

    // console.log(vis.displayData);

    vis.tip.html(function(d) {
        var result = "Start Station: "+d.start_station+"<br/>";
        result += "End Station: "+d.end_station+"<br/>";
        result += "Distance: "+d.distance.toFixed(2)+"km<br/>";
        result += "Duration: "+d.duration+" seconds";
        return result;
    });
    vis.svg.call(vis.tip);

    vis.rect = vis.svg.selectAll("rect")
        .data(vis.displayData);

    vis.rect.enter()
        .append("rect")
        .attr("class", "bar")
        .style('stroke', 'black')
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .merge(vis.rect)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr("x", function (d) {
            return vis.x(d.distancePlot);
        })
        .attr("y", function(d) { return vis.y(d.bikeid); })
        .attr("height", vis.y.bandwidth())
        .attr("width", function (d) {
            return vis.x(d[infoType]);
        })
        .style("fill", function (d) {
            return vis.color(d[infoType]);
        });

    vis.rect.exit().remove();

    vis.svg.select(".axis.y-axis")
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .call(vis.yAxis);
    vis.svg.select(".axis.x-axis")
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "title")
        .attr("fill", "black")
        .attr("transform", "translate(" + (vis.width-2*vis.margin.right) + "," + (vis.height+vis.margin.bottom*5/6) + ")")
        .append("text")
        .text(function(){
            if(infoType=='duration') return "Duration (seconds)";
            else return "Distance (km)";
        });


    // update text block
    var tripSummary = "<span id='summary-title'>Breif Summary:</span><br>";
    var numBikes = Object.keys(bikeInfo).length;
    if (numBikes==20) tripSummary += "More than 20 bikes started from ";
    else tripSummary += numBikes + " bikes started from ";
    tripSummary += vis.displayData[0].start_station + " in ";
    if(vis.freqSelection=="week") {

        tripSummary += "week " + vis.timeSelection;
    }
    else {
        tripSummary += vis.monthDict[vis.timeSelection];
    }
    tripSummary += ", totaling more than " + vis.totalDistance.toFixed(2) + " km and ";
    tripSummary += (vis.totalDuration/60).toFixed(2) + " minutes.";
    tripSummary += "This saves at least " + (vis.totalDistance/100).toFixed(2) + " liters of fuel";
    tripSummary += " and reduces carbon emission by " + (vis.totalDistance/100*2.3035).toFixed(2) + " kg.";

    document.getElementById("trip-summary").innerHTML = tripSummary;

}