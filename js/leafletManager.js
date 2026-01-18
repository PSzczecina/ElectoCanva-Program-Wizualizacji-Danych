import { dataManager } from './jsonFetchManager.js';
export { map };
var map = L.map('map').setView([52, 19], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 6,
    maxZoom: 10,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

map.setZoom(6);
map.setMaxBounds(map.getBounds());
map.setZoom(7);
function style(feature) {
    return {
        color: '#666666',
        fillColor: colorRegion(calculateDensity(feature.properties.terc)),
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.75,
    };
}

export function update() {
    var geojson;

    geojson = L.geoJson(geoDataWojewodztwa, {
        style: style,
        onEachFeature: onEachFeature,
    });

    geojson.addTo(map);
}
var geojson;

function highlightFeature(e) {
    //console.log(e.target.feature.properties.terc)
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#000000',
        dashArray: '',
        fillOpacity: 1,
    });
    layer.bringToFront();
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
}

map.on('zoomed', function () {
    var currentZoom = map.getZoom();
});

function redrawGeoJson() {
    geojson.setStyle((feature) => ({
        color: '#666666',
        fillColor: colorRegion(calculateDensity(feature.properties.terc)),
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.75,
    }));
}

function calculateDensity(TERYT, geoDataType = 'województwa') {
    //console.log(TERYT)
    if (geoDataType == 'gminy') {
        TERYT = TERYT.slice(0, -1);
        if (TERYT == '146501' && testData.rok != 2005) {
            //warszawa ma dzielnice, plik geojson ma całe miasto - trzeba je zsumować
            var warszawaObecni = 0;
            var warszawaUprawnieni = 0;
            for (var i = 1; i <= 18; i++) {
                //console.log(TERYT)
                warszawaObecni +=
                    testData[parseInt(TERYT) + i].liczba_wyborców_obecnych;
                warszawaUprawnieni +=
                    testData[parseInt(TERYT) + i].liczba_wyborców_uprawnionych;
            }
            return warszawaObecni / warszawaUprawnieni;
        }
        if (TERYT == '180710' && testData.rok < 2010) {
            TERYT = '180702';
        } //gm Jaśliska - wydzielona została w 2010 roku
        if (TERYT == '026501') {
            if (testData.rok <= 2013 && testData.rok >= 2003) TERYT = '022109';
        } //gmina wałbrzych - miała inny   teryt między 2002-2013
        if (TERYT == '060315' && testData.rok == 2005) {
            TERYT = '060608';
        } //gm rejowiec - zmieniła powiat
        var result =
            testData[TERYT].liczba_wyborców_obecnych /
            testData[TERYT].liczba_wyborców_uprawnionych;
        return result;
    }
    if (geoDataType == 'powiaty') {
        //do zoptymalizowania
        var obecni = 0,
            uprawnieni = 0;
        Object.keys(testData).forEach((k) => {
            //console.log(testData[k])
            if (k.slice(0, 4) == TERYT) {
                obecni += testData[k].liczba_wyborców_obecnych;
                uprawnieni += testData[k].liczba_wyborców_uprawnionych;
            }
            //console.log(obecni, uprawnieni)
        });
        return obecni / uprawnieni;
    }
    if (geoDataType == 'województwa') {
        var obecni = 0,
            uprawnieni = 0;
        Object.keys(testData).forEach((k) => {
            //console.log(testData[k])
            if (k.slice(0, 2) == TERYT) {
                obecni += testData[k].liczba_wyborców_obecnych;
                uprawnieni += testData[k].liczba_wyborców_uprawnionych;
            }
            //console.log(obecni, uprawnieni)
        });
        return obecni / uprawnieni;
    }
}

//gradienty trzeba czytelne zrobić
function colorRegion(value, isAbsoluteValues = false) {
    var relativeStages = document.getElementById('intervalCount').value;
    var rangeTable = [];
    if (isAbsoluteValues == false) {
        var min =
            parseInt(document.getElementById('precentageMinSlide').value) / 100;
        var max =
            parseInt(document.getElementById('precentageMaxSlide').value) / 100;
        var diff = max - min;
        for (var i = 0; i < relativeStages; i++) {
            rangeTable[i] = min + (diff / relativeStages) * i;
        }
        for (var i = 0; i < relativeStages; i++) {
            if (value > rangeTable[relativeStages - 1 - i])
                return rgb(255 - (relativeStages - i) * 16, i * 40, i * 40);
        }
        return rgb(255, relativeStages * 40, relativeStages * 40);
    }
    return value > 0.75
        ? '#aa0000'
        : value > 0.5
        ? '#ff4444'
        : value > 0.25
        ? '#ff8888'
        : '#FFCCCC';
}

function rgb(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
