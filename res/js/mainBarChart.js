

// function fillStation(stationData) {
//     var result = "<option value='"+stationData[0].id+"' selected='selected'>"+stationData[0].name+"</option>";
//     for(var i=1; i<stationData.length; i++){
//         result += "<option value='"+stationData[i].id+"'>"+stationData[i].name+"</option>";
//     }
//     document.getElementById("station").innerHTML = result;
// }

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

fillWeek();

// var proxy = "http://michaeloppermann.com/proxy.php?url=";
// var stationUrl = "http://vps77598.vps.ovh.ca/bluebikes/stations.php"
// var tripUrl = "http://vps77598.vps.ovh.ca/bluebikes/rides.php?start=2015-05-25&end=2016-05-25"

var tripBarChart;


// $.getJSON(proxy+stationUrl, function(jsonData){
//     var station = jsonData.stations;
//     fillStation(station);
// });





d3.csv('res/data/trips_2015.csv')
    .then(function (tripData) {
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


    });

