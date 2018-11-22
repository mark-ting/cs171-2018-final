

var colorScheme = d3.schemeSet2;

var indexByReg = new Map;
var regByIndex = new Map;


var station_count = new Map;

var indexBySta = new Map;
var staByIndex = new Map;

var top5_stations = [];

// var indexBySta_5 = new Map;
// var staByIndex_5 = new Map;


var reg_matrix = [];
var sta_matrix = [];

var n = 0;
var n2 = 0;

var chord1;
var chord2;


d3.csv('res/data/merged.csv')
    .then(function (data) {

        // //build region matrix
        // data.forEach(function(d){
        //
        //     if (!indexByReg.has(d = (d['start_region']))) {
        //         regByIndex.set(n, d);
        //         indexByReg.set(d, n++);
        //     }
        //
        //
        // });
        //
        //
        // data.forEach(function(d){
        //
        //     var source = indexByReg.get(d['start_region']);
        //     var target = indexByReg.get(d['end_region']);
        //     var row = reg_matrix[source];
        //     if (!row) row = reg_matrix[source] = Array.from({length: n}).fill(0);
        //     row[target] ++;
        //
        //
        // });
        //
        //
        //
        //
        // data.forEach(function (d) {
        //     if (!station_count.has(d = (d['start_station']))) {
        //         station_count.set(d, 0);
        //     } else{
        //         station_count.set(d, station_count.get(d) + 1);
        //     }
        // });
        //
        //
        // //sort stations by count, and pick top 5 stations
        // station_count[Symbol.iterator] = function* () {
        //     yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        // };
        //
        //
        // var i = 0;
        // for (let [key, value] of station_count) {
        //     if(i == 5){
        //         break;
        //     }
        //     top5_stations.push(key);
        //     console.log(key + ' ' + value);
        //     i ++;
        // };
        //
        // //filter data by the top 5 stations
        // var top5_data = data.filter(function (d) {
        //     return top5_stations.includes(d['start_station']) && top5_stations.includes(d['end_station']);
        // });
        //
        // console.log(top5_data);
        //
        // top5_data.forEach(function(d){
        //
        //
        //     if (!indexBySta.has(d = (d['start_station']))) {
        //         staByIndex.set(n2, d);
        //         indexBySta.set(d, n2++);
        //     }
        //
        // });
        //
        //
        // top5_data.forEach(function(d){
        //
        //
        //     var source2 = indexBySta.get(d['start_station']);
        //     var target2 = indexBySta.get(d['end_station']);
        //     var row2 = sta_matrix[source2];
        //     if (!row2) row2 = sta_matrix[source2] = Array.from({length: n2}).fill(0);
        //     row2[target2] ++;
        //
        //
        // });
        //
        // // console.log(sta_matrix);


        chord1 = new chordDiagram("chord1", data, true);

        chord2 = new chordDiagram("chord2", data, false);
        d3.select("#region-drop").on("change", function () {
            chord2.wrangleData();
        });

    });


