barChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.sorting = true;

    this.initVis();
}


barChart.prototype.initVis = function() {
    var vis = this;

    $("#"+vis.parentElement).empty();

    vis.margin = { top: 30, right: 60, bottom: 30, left: 60};
    vis.width = $("#"+vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

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

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g")
        .attr("class", "title")
        .attr("fill", "black")
        .attr("transform", "translate(" + (-30) + "," + (-10) + ")")
        .append("text")
        .text("Bike ID");

    vis.color = d3.scaleSequential(d3.interpolateGreens);

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-5, 0]);

    vis.wrangleData();
}


barChart.prototype.wrangleData = function(){
    var vis = this;

    var stationSelection = d3.select("#station").property("value");
    var freqSelection = d3.select("#data-freq").property("value");
    var timeSelection;
    var filteredData = vis.data.filter(function (d) {
        if(freqSelection=="week") {
            timeSelection = d3.select("#week-drop").property("value");
            return d.start_station_id==stationSelection && d.week==timeSelection;
        }
        else {
            timeSelection = d3.select("#month-drop").property("value");
            return d.start_station_id==stationSelection && d.month==timeSelection;
        }
    });

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

    filteredData.forEach(function (d) {
        d['totalOcc'] = bikeID[d.bikeid];
    });

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

    if(occSort.length<=15) vis.displayData = filteredData;
    else{
        occSort = occSort.slice(0, 15);
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


barChart.prototype.updateVis = function () {
    var vis = this;

    var infoType = d3.select("#trip-info-type").property("value");

    var bikeInfo = {};
    vis.displayData.forEach(function(d){
        d.duration = +d.duration;
        d.distance = +d.distance;
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

    var maxVal = 0;
    for(var key in bikeInfo) {
        if(bikeInfo[key]>maxVal) maxVal = bikeInfo[key];
    }

    vis.x.domain([0, maxVal]);
    vis.y.domain(vis.displayData.map(function (d) {
        return d.bikeid;
    }));

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


}