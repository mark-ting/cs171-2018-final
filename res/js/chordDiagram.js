chordDiagram = function(_parentElement, _data, _names){
    this.parentElement = _parentElement;
    this.data = _data;
    this.names = _names;
    // this.displayData = _data;
    // this.sorting = true;

    this.initVis();
};


chordDiagram.prototype.initVis = function() {
    var vis = this;

    // $("#"+vis.parentElement).empty();
    vis.margin = { top: 60, right: 60, bottom: 30, left: 60};
    vis.width = $("#"+vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;


    vis.innerRadius = Math.min(vis.width, vis.height) * .45;
    vis.outerRadius = vis.innerRadius * 1.2;

    vis.colorScheme = d3.schemeSet2;
    vis.opacityDefault = 0.75;

    vis.colorScale = d3.scaleOrdinal()
        .domain(d3.range(vis.names.length))
        .range(vis.colorScheme);

    vis.chord = d3.chord()
        .padAngle(.01)
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
        .attr("transform", "translate(" + (vis.width/2 + vis.margin.left) + "," + (vis.height/2 + vis.margin.top) + ")")
        .datum(vis.chord(vis.data));





    vis.wrangleData();
}


chordDiagram.prototype.wrangleData = function(){
    var vis = this;



    vis.updateVis();
}


chordDiagram.prototype.updateVis = function () {
    var vis = this;



    vis.tip = d3.tip()
        .attr("class", "d3-tip-chord")
        .offset([0, 5])
        .html(function(d) {
            var result = vis.names.get(d.index)+"<br/>";
            console.log(d);
            return result;
        });

    vis.svg.call(vis.tip);

    vis.outerArcs = vis.svg.selectAll("g.group")
        .data(function(chords) { return chords.groups; })
        .enter().append("g")
        .attr("class", "group")
        .on("mouseover", function(d,i){


            vis.tip.show(d);




            vis.svg.selectAll("path.chord")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .transition()
                .style("opacity", 0.07);
        })
        .on("mouseout", function(d,i) {
            vis.tip.hide(d);


            vis.svg.selectAll("path.chord")
                .filter(function (d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", vis.opacityDefault);
        });



    vis.outerArcs.append("path")
        .style("fill", function(d) { return vis.colorScale(d.index); })
        .style('opacity', vis.opacityDefault)
        // .style('stroke', 'black')
        .attr("id", function(d, i) { return "group" + d.index; })
        .attr("d", vis.arc);

    // vis.outerArcs.append("text")
    //     .attr("xlink:href", function (d) {
    //         return "#group" + d.index;
    //     })
    //     .attr("dy", '.4em')
    //     .text(function(chords, i){
    //         return vis.names.get(i);})
    //     .style("color", "black")
    //     .style('font-size', 10);
    //
    // vis.outerArcs.select("text")
    //     .attr("transform", function(d) {
    //         d.angle = (d.startAngle + d.endAngle) / 2;
    //
    //         return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
    //             " translate(" + (vis.innerRadius + 30) + ")" +
    //             (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
    //     })
    //     .attr("text-anchor", function (d) {
    //         return d.angle > Math.PI ? "end" : "begin";
    //     });

    vis.svg.selectAll("path.chord")
        .data(function(chords) {
            return chords; })
        .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) {
            return vis.colorScale(d.source.index); })
        .style("opacity", vis.opacityDefault)
        // .style('stroke', 'black')
        .attr("d", vis.path);




}