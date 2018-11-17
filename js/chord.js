var margin = {left:90, top:90, right:90, bottom:90},
    width =  700 - margin.left - margin.right, // more flexibility: Math.min(window.innerWidth, 1000)
    height =  700 - margin.top - margin.bottom, // same: Math.min(window.innerWidth, 1000)
    innerRadius = Math.min(width, height) * .40,
    outerRadius = innerRadius * 1.2;

var regions = ['Boston', 'Brookline', 'Cambridge', 'Somerville'],
    color_scale = ['#edc7b7','#bab2b9','#123c80','#ac3b61'],
    opacityDefault = 0.75;

// var matrix = [
//     [579576, 11128, 103917, 4953],
//     [11923, 2115, 2664, 59],
//     [104749, 2524, 228953, 23091],
//     [5065, 89, 23721, 13216]
// ];


var indexByReg = new Map;
var regByIndex = new Map;

var indexBySta = new Map;
var staByIndex = new Map;

var matrix = [];
var matrix2 = [];

var n = 0;
var n2 = 0;

d3.csv('data/merged.csv')
    .then(function (data) {

        data.forEach(function(d){

            if (!indexByReg.has(d = (d['start_region']))) {
                regByIndex.set(n, d);
                indexByReg.set(d, n++);
            }


        });



        data.forEach(function(d){

            var source = indexByReg.get(d['start_region']);
            var target = indexByReg.get(d['end_region']);
            var row = matrix[source];
            if (!row) row = matrix[source] = Array.from({length: n}).fill(0);
            row[target] ++;


        });


        var boston_data = data.filter(function(d) {
            return d['start_region'] == 'Boston' && d['end_region'] == 'Boston';
        });


        console.log(boston_data);
        boston_data.forEach(function(d){


            if (!indexBySta.has(d = (d['start_station']))) {
                staByIndex.set(n2, d);
                indexBySta.set(d, n2++);
            }

        });


        boston_data.forEach(function(d){


            var source2 = indexBySta.get(d['start_station']);
            var target2 = indexBySta.get(d['end_station']);
            var row2 = matrix2[source2];
            if (!row2) row2 = matrix2[source2] = Array.from({length: n2}).fill(0);
            row2[target2] ++;


        });
        // console.log(matrix);
        // console.log(matrix2);
        draw(matrix, "#chord1", regByIndex );
        draw(matrix2, "#chord2", staByIndex);

    });



function draw(matrix, parent, names){

    var colors = d3.scaleOrdinal()
        .domain(d3.range(names.length))
        .range(color_scale);

    var chord = d3.chord()
        .padAngle(.01)
        .sortChords(d3.descending);

    var arc = d3.arc()
        .innerRadius(innerRadius*1.05)
        .outerRadius(outerRadius);

    var path = d3.ribbon()
        .radius(innerRadius);

    var svg = d3.select(parent).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
        .datum(chord(matrix));

    var outerArcs = svg.selectAll("g.group")
        .data(function(chords) { return chords.groups; })
        .enter().append("g")
        .attr("class", "group")
        .on("mouseover", function(d,i){
            svg.selectAll("path.chord")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .transition()
                .style("opacity", 0.07);
        })
        .on("mouseout", function(d,i) {
            svg.selectAll("path.chord")
                .filter(function (d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", opacityDefault);
        });



    outerArcs.append("path")
        .style("fill", function(d) { return colors(d.index); })
        .style('opacity', opacityDefault)
        .style('stroke', 'black')
        .attr("id", function(d, i) { return "group" + d.index; })
        .attr("d", arc);

    outerArcs.append("text")
        .attr("xlink:href", function (d) {
            return "#group" + d.index;
        })
        .attr("dy", '.4em')
        .text(function(chords, i){
            console.log(names[i]);
            return names.get(i);})
        .style("color", "black")
        .style('font-size', 10);

    outerArcs.select("text")
        .attr("transform", function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
            //store the midpoint angle in the data object

            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                " translate(" + (innerRadius + 50) + ")" +
                (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
            //include the rotate zero so that transforms can be interpolated
        })
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : "begin";
        });

    svg.selectAll("path.chord")
        .data(function(chords) {
            return chords; })
        .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) {
            return colors(d.source.index); })
        .style("opacity", opacityDefault)
        .style('stroke', 'black')
        .attr("d", path);

}





//
//
//
// Second chord diagram


// var chord2 = d3.chord()
//     .padAngle(.05)
//     .sortChords(d3.descending);
//
// var arc2 = d3.arc()
//     .innerRadius(innerRadius*1.05)
//     .outerRadius(outerRadius);
//
// var path2 = d3.ribbon()
//     .radius(innerRadius);
//
// var svg2 = d3.select("#chord2").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
//     .datum(chord2(matrix));
//
// var outerArcs2 = svg2.selectAll("g.group")
//     .data(function(chords) { return chords.groups; })
//     .enter().append("g")
//     .attr("class", "group2")
//     .on("mouseover", function(d,i){
//         svg2.selectAll("path.chord")
//             .filter(function(d) { return d.source.index != i && d.target.index != i; })
//             .transition()
//             .style("opacity", 0.07);
//     })
//     .on("mouseout", function(d,i) {
//         svg2.selectAll("path.chord")
//             .filter(function (d) {
//                 return d.source.index != i && d.target.index != i;
//             })
//             .transition()
//             .style("opacity", opacityDefault);
//     });
//
//
// outerArcs2.append("path")
//     .style("fill", function(d) { return colors(d.index); })
//     .style('opacity', opacityDefault)
//     .style('stroke', 'black')
//     .attr("id", function(d, i) { return "group" + d.index; })
//     .attr("d", arc2);
//
// outerArcs2.append("text")
//     .attr("xlink:href", function (d) {
//         return "#group" + d.index;
//     })
//     .attr("dy", '.4em')
//     .text(function(chords, i){return names[i];})
//     .style("color", "black")
//     .style('font-size', 20);
//
// outerArcs2.select("text")
//     .attr("transform", function(d) {
//         d.angle = (d.startAngle + d.endAngle) / 2;
//         //store the midpoint angle in the data object
//
//         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
//             " translate(" + (innerRadius + 50) + ")" +
//             (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
//         //include the rotate zero so that transforms can be interpolated
//     })
//     .attr("text-anchor", function (d) {
//         return d.angle > Math.PI ? "end" : "begin";
//     });
//
// svg2.selectAll("path.chord")
//     .data(function(chords) {
//         return chords; })
//     .enter().append("path")
//     .attr("class", "chord")
//     .style("fill", function(d) {
//         return colors(d.source.index); })
//     .style("opacity", opacityDefault)
//     .style('stroke', 'black')
//     .attr("d", path2);
