

function fillStation(stationData) {
    var result = "<option value='"+stationData[0].id+"' selected='selected'>"+stationData[0].station+"</option>";
    for(var i=1; i<stationData.length; i++){
        result += "<option value='"+stationData[i].id+"'>"+stationData[i].station+"</option>";
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

fillWeek();

d3.csv('data/station.csv')
    .then(function (stationData) {
        fillStation(stationData);
    });

var tripBarChart;
d3.csv('data/trips_2015.csv')
    .then(function (tripData) {
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


    });

