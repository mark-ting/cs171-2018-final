
function fillStation(stationData) {
    var result = "";
    var count = 0;
    for (var key in stationData) {
        if(count==0) result = "<option value='"+key+"' selected='selected'>"+stationData[key]+"</option>";
        else result += "<option value='"+key+"'>"+stationData[key]+"</option>";
        count+=1;
    }
    document.getElementById("station").innerHTML = result;
}

function fillWeek(){
    var result = "<option value='1' selected='selected'>1</option>";
    for(var i=2; i<=52; i++){
        result += "<option value='"+i+"'>"+i+"</option>";
    }
    document.getElementById("week-drop").innerHTML = result;
}

function changeFrequency(){
    var selection = d3.select("#data-freq").property("value");
    d3.select("#"+selection)
        .style("display", "block");
    if(selection=="week") {
        d3.select("#month")
            .style("display", "none");
    }
    else {
        d3.select("#week")
            .style("display", "none");
    }
}

function updateStations(){
    chord2.wrangleData();
}


fillWeek();


var tripBarChart;
var colorScheme = d3.schemeSet2;


var chord1;
var chord2;




// d3.csv('res/data/trips_2015.csv')
d3.csv('https://media.githubusercontent.com/media/mat3049/cs171-2018-final/master/res/data/trips_2015.csv?raw=true')
    .then(function (tripData) {
        // barchart
        var station = {};
        tripData.forEach(function (d) {
            if(!(d.start_station_id in station)) station[d.start_station_id] = d.start_station;
        });
        fillStation(station);

        tripBarChart = new barChart("barChartArea", tripData);
        d3.select("#station").on("change", function () {
            tripBarChart.initVis();
        });
        d3.select("#trip-info-type").on("change", function () {
            tripBarChart.initVis();
        });
        d3.select("#data-freq").on("change", function () {
            tripBarChart.initVis();
        });
        d3.select("#week-drop").on("change", function () {
            tripBarChart.initVis();
        });
        d3.select("#month-drop").on("change", function () {
            tripBarChart.initVis();
        });
        d3.select("#change-sorting").on("click", function() {
            tripBarChart.sorting = !tripBarChart.sorting;
            tripBarChart.initVis();
        });

        window.addEventListener("resize", function(){
            tripBarChart.initVis();
        });

        // chord diagram
        var tripData_filtered = tripData.filter(function (d) {
            return (d.start_region!="") && (d.end_region!="");
        });

        chord1 = new chordDiagram("chord1", tripData_filtered, true);

        chord2 = new chordDiagram("chord2", tripData_filtered, false);

        window.addEventListener("resize", function(){
            chord1.initVis();
            chord2.initVis();
        });

    });


