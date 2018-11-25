

var colorScheme = d3.schemeSet2;


var chord1;
var chord2;


d3.csv('res/data/merged.csv')
    .then(function (data) {




        chord1 = new chordDiagram("chord1", data, true);

        chord2 = new chordDiagram("chord2", data, false);

        window.addEventListener("resize", function(){
            chord1.initVis();
            chord2.initVis();
        });


    });

function updateStations(){
    chord2.wrangleData();
}


