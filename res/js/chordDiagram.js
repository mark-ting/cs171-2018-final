chordDiagram = function(_parentElement, _data, _region){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.region = _region;

    this.initVis();
};


chordDiagram.prototype.initVis = function() {
    var vis = this;

    $("#"+vis.parentElement).empty();

    vis.margin = { top: 60, right: 60, bottom: 30, left: 60};
    vis.width = $("#"+vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;


    vis.innerRadius = Math.min(vis.width, vis.height) * .42;
    vis.outerRadius = vis.innerRadius * 1.2;

    vis.colorScheme = d3.schemeSet2;
    vis.opacityDefault = 0.95;

    vis.colorScale = d3.scaleOrdinal()
        .range(vis.colorScheme);

    vis.chord = d3.chord()
        .padAngle(0)
        .sortChords(d3.descending);

    vis.arc = d3.arc()
        .innerRadius(vis.innerRadius*1.05)
        .outerRadius(vis.outerRadius);

    vis.path = d3.ribbon()
        .radius(vis.innerRadius);

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (vis.width/2 + vis.margin.left) + "," + (vis.height/2 + vis.margin.top) + ")");



    vis.wrangleData();
}


chordDiagram.prototype.wrangleData = function(){
    var vis = this;

    vis.indexByName = new Map;
    vis.nameByIndex = new Map;

    vis.station_count = new Map;


    vis.top_stations = [];

    vis.matrix = [];

    vis.n = 0;


    if(vis.region == true){
        //build region matrix

        vis.data.forEach(function (d) {
            if (!vis.station_count.has(d['start_region']) && !vis.station_count.has(d['end_region'])) {
                vis.station_count.set(d['start_region'], 0);
                vis.station_count.set(d['end_region'], 0);

            } else if (!vis.station_count.has(d['start_region'])) {
                vis.station_count.set(d['start_region'], 0);
                vis.station_count.set(d['end_region'], vis.station_count.get(d['end_region']) + 1);

            } else if (!vis.station_count.has(d['end_region'])){
                vis.station_count.set(d['end_region'], 0);

                vis.station_count.set(d['start_region'], vis.station_count.get(d['start_region']) + 1);

            } else{
                vis.station_count.set(d['start_region'], vis.station_count.get(d['start_region']) + 1);
                vis.station_count.set(d['end_region'], vis.station_count.get(d['end_region']) + 1);
            }
        });

        vis.data.forEach(function(d){

            if (!vis.indexByName.has(d = (d['start_region']))) {
                vis.nameByIndex.set(vis.n, d);
                vis.indexByName.set(d, vis.n++);
            }


        });


        vis.data.forEach(function(d){

            var source = vis.indexByName.get(d['start_region']);
            var target = vis.indexByName.get(d['end_region']);
            var row = vis.matrix[source];
            if (!row) row = vis.matrix[source] = Array.from({length: vis.n}).fill(0);
            row[target] ++;


        });


    } else{

        var regionSelection = d3.select("#region-drop").property("value");
        var rankSelection = +d3.select('#rank-drop').property("value");

        if(regionSelection != 'Total'){
            vis.displayData = vis.data.filter(function(d){
                return d['start_region'] == regionSelection && d['end_region'] == regionSelection;
            });
        }


        //building station matrix
        vis.displayData.forEach(function (d) {
            if (!vis.station_count.has(d['start_station']) && !vis.station_count.has(d['end_station'])) {
                vis.station_count.set(d['start_station'], 0);
                vis.station_count.set(d['end_station'], 0);

            } else if (!vis.station_count.has(d['start_station'])) {
                vis.station_count.set(d['start_station'], 0);
                vis.station_count.set(d['end_station'], vis.station_count.get(d['end_station']) + 1);

            } else if (!vis.station_count.has(d['end_station'])){
                vis.station_count.set(d['end_station'], 0);

                vis.station_count.set(d['start_station'], vis.station_count.get(d['start_station']) + 1);

            } else{
                vis.station_count.set(d['start_station'], vis.station_count.get(d['start_station']) + 1);
                vis.station_count.set(d['end_station'], vis.station_count.get(d['end_station']) + 1);
            }
        });


        //sort stations by count, and pick top 5 stations
        vis.station_count[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        };


        var i = 0;
        for (let [key, value] of vis.station_count) {
            if(i == rankSelection){
                break;
            }
            vis.top_stations.push(key);
            i ++;
        }

        //filter data by the top 5 stations
        vis.top_data = vis.displayData.filter(function (d) {
            return vis.top_stations.includes(d['start_station']) && vis.top_stations.includes(d['end_station']);
        });


        vis.top_data.forEach(function(d){


            if (!vis.indexByName.has(d = (d['start_station']))) {
                vis.nameByIndex.set(vis.n, d);
                vis.indexByName.set(d, vis.n++);
            }

        });


        vis.top_data.forEach(function(d){


            var source2 = vis.indexByName.get(d['start_station']);
            var target2 = vis.indexByName.get(d['end_station']);
            var row2 = vis.matrix[source2];
            if (!row2) row2 = vis.matrix[source2] = Array.from({length: vis.n}).fill(0);
            row2[target2] ++;


        });



    }

    //set default to Boston
    if(vis.region == true){
        var totalRides = 0;
        var inbounds = 0;
        var outbounds = 0;
        var roundTrip = 0;
        var boston_index = vis.indexByName.get('Boston');
        for(var i = 0; i < vis.matrix[0].length; i ++){
            totalRides += vis.matrix[boston_index][i];
            outbounds += vis.matrix[boston_index][i];
        }

        for(var i = 0; i < vis.matrix.length; i ++){
            totalRides += vis.matrix[i][boston_index];
            inbounds += vis.matrix[i][boston_index];
        }

        roundTrip = vis.matrix[boston_index][boston_index]
        totalRides -= roundTrip;


        document.getElementById("region").innerHTML = vis.nameByIndex.get(boston_index);
        document.getElementById("num").innerHTML = totalRides;
        document.getElementById("inbounds").innerHTML = inbounds;
        document.getElementById("outbounds").innerHTML = outbounds;
        document.getElementById("round").innerHTML = roundTrip;
    }



    vis.displayData = vis.data;
    vis.updateVis();
}


chordDiagram.prototype.updateVis = function () {
    var vis = this;

    vis.svg.datum(vis.chord(vis.matrix));

    vis.colorScale.domain(d3.range(vis.nameByIndex.length));

    vis.tip = d3.tip()
        .attr("class", "d3-tip-chord")
        .offset([0, 5])
        .html(function(d) {

            return vis.nameByIndex.get(d.index)+ "<br/>";
        });

    vis.svg.call(vis.tip);



    vis.outerArcs = vis.svg.selectAll("g.group")
        .data(function(chords) { return chords.groups; });




    vis.outerGroup = vis.outerArcs.enter().append("g");



    vis.outerGroup
        .append("path")
        .attr("class", "group")
        .merge(vis.outerArcs)
        .style("fill", function(d) { return vis.colorScale(d.index); })
        .style('opacity', vis.opacityDefault)
        .attr("id", function(d, i) { return "group" + d.index; })
        .attr("d", vis.arc)
        .on("mouseover", function(d,i){

            vis.tip.show(d);

            d3.select(this)
                // .style("fill", 'grey')
                .style('stroke', 'white')
                .style('stroke-width', 6);

            vis.svg.selectAll("path.chord")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .transition()
                .style("opacity", 0.07);
        })
        .on("mouseout", function(d,i) {
            vis.tip.hide(d);

            d3.select(this)
                .style("stroke", 'transparent');

            vis.svg.selectAll("path.chord")
                .filter(function (d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", vis.opacityDefault);
        })
        .on('click', function(d, i){

            //compute total num of rides
            var totalRides = 0;
            var inbounds = 0;
            var outbounds = 0;
            var roundTrip = 0;
            for(var i = 0; i < vis.matrix[0].length; i ++){
                totalRides += vis.matrix[d.index][i];
                outbounds += vis.matrix[d.index][i];
            }

            for(var i = 0; i < vis.matrix.length; i ++){
                totalRides += vis.matrix[i][d.index];
                inbounds += vis.matrix[i][d.index];
            }

            roundTrip = vis.matrix[d.index][d.index]
            totalRides -= roundTrip;


            document.getElementById("region").innerHTML = vis.nameByIndex.get(d.index);
            document.getElementById("num").innerHTML = totalRides;
            document.getElementById("inbounds").innerHTML = inbounds;
            document.getElementById("outbounds").innerHTML = outbounds;
            document.getElementById("round").innerHTML = roundTrip;


            if(vis.region == true){
                var click_region = vis.nameByIndex.get(d.index);
                if(click_region == 'Boston'){
                    document.getElementById("region-drop").selectedIndex = "1";
                } else if(click_region == 'Brookline'){
                    document.getElementById("region-drop").selectedIndex = "2";
                } else if(click_region == 'Cambridge'){
                    document.getElementById("region-drop").selectedIndex = "3";
                } else if(click_region == 'Somerville'){
                    document.getElementById("region-drop").selectedIndex = "4";
                }

                updateStations();
            }
        })
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut);


    //
    if(vis.region == true) {
        vis.outerGroup.append("text")
            .attr("xlink:href", function (d) {
                return "#group" + d.index;
            })
            .attr("dy", '.4em')
            .text(function (d) {
                return vis.nameByIndex.get(d.index);
            })
            .style("color", "black")
            .style('font-family', "Verdana")
            .style('font-size', 12);

        vis.outerGroup.select("text")
            .attr("transform", function (d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                //store the midpoint angle in the data object
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    " translate(" + (vis.innerRadius + 40) + ")" +
                    (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
                //include the rotate zero so that transforms can be interpolated
            })
            .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : "begin";
            });
    }


    vis.outerArcs.exit().remove();

    vis.paths = vis.svg.selectAll("path.chord")
        .data(function(chords) {
            return chords; });

    vis.paths.enter().append("path")
        .attr("class", "chord")
        .merge(vis.paths)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .style("fill", function(d) {
            return vis.colorScale(d.source.index); })
        .style("opacity", vis.opacityDefault)
        .attr("d", vis.path);


    vis.paths.exit().remove();

};