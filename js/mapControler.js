import { fetchAndUpdateData, fetchAdminDivisions } from './fetch.js';
import { colorRegion, interpolateColor } from './utils.js';
import {
    calculateMinMaxValue,
    calculateTurnout,
    groupCandidates,
} from './DataManager.js';
import { currentData } from './store.js';

const elecTypeSelect = document.getElementById('electionType');
const elecYearSelect = document.getElementById('electionYear');
const presidentialYearList = [2005, 2010, 2015, 2020, 2025];
const parlimentaryYearList = [2005, 2007, 2011, 2015, 2019, 2023];
const adminDivision = document.getElementById('administrativeDivision');
const dataType = document.getElementById('dataType');
const roundSelect = document.getElementById('electionRound');
const refreshButton = document.getElementById('refresh');
const minValueText = document.getElementById('precentageMinValue');
const maxValueText = document.getElementById('precentageMaxValue');
const minValueSlider = document.getElementById('precentageMinSlide');
const maxValueSlider = document.getElementById('precentageMaxSlide');
minValueText.innerHTML = minValueSlider.value;
maxValueText.innerHTML = maxValueSlider.value;
const colorBegin = document.getElementById('colorBegin');
const colorEnd = document.getElementById('colorEnd');
const candidateListHtml = document.getElementById('candidateList');

currentData.geoJsonType = 'powiaty';
currentData.dataCurrentlyAnalysed = 'turnout';
currentData.electionData1 = await fetchAndUpdateData(
    elecTypeSelect.value,
    elecYearSelect.value || '2025',
    roundSelect.value,
    adminDivision.value,
);
currentData.geoJson = await fetchAdminDivisions(currentData.geoJsonType);

var maxinset = 0;
var mininset = 1;
var average = 0;

/**
 * oblicza minimalną / maksymalną wartość, zależnie od wybranej opcji.
 *
 * Bierze pod uwagę jak bardzo średnia min/max odbiega od faktycznych min/max.
 */

/**
 * aktualizuje select Lat oraz pokazuje/ukrywa select tury
 */
async function updateYearAndRoundSelect() {
    //console.log(elecTypeSelect.value);
    elecYearSelect.innerHTML = '';
    if (elecTypeSelect.value == 'prezy') {
        presidentialYearList.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            if ((year = presidentialYearList[presidentialYearList.length - 1]))
                option.selected = true;
            elecYearSelect.appendChild(option);
            roundSelect.style.visibility = 'visible';
        });
    } else if (elecTypeSelect.value == 'parla') {
        parlimentaryYearList.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            if ((year = parlimentaryYearList[parlimentaryYearList.length - 1]))
                option.selected = true;
            elecYearSelect.appendChild(option);
            roundSelect.style.visibility = 'hidden';
        });
    }
}
updateYearAndRoundSelect();
elecTypeSelect.addEventListener('input', updateYearAndRoundSelect);

refreshButton.addEventListener('click', async () => {
    currentData.geoJsonType = adminDivision.value;
    currentData.dataCurrentlyAnalysed = dataType.value;
    currentData.electionData1 = await fetchAndUpdateData(
        elecTypeSelect.value,
        elecYearSelect.value || '2025',
        roundSelect.value,
        adminDivision.value,
    );
    currentData.geoJson = await fetchAdminDivisions(currentData.geoJsonType);
    await addGeoJsonData();
    await redrawGeoJson();

    if (
        currentData.electionData1.tura == 1 ||
        currentData.electionData1.rodzaj_wyborów == 'parlamentarne'
    ) {
        candidateListHtml.innerHTML = '';
        candidateListHtml.appendChild(
            groupCandidates(currentData.electionData1),
        );
    }

    enableAndDisableRefresh();
    document.addEventListener('click', enableAndDisableRefresh);
    console.log(calculateMinMaxValue(currentData.electionData1));
    //wyświetlanie, zależnie od rodzaju
});

/**
 * wyłącza przycisk odświeżania jeżeli wszystkie dane są takie same
 */
function enableAndDisableRefresh() {
    if (
        elecTypeSelect.value ==
            currentData.electionData1.rodzaj_wyborów.slice(0, 5) &&
        parseInt(elecYearSelect.value) == currentData.electionData1.rok &&
        adminDivision.value == currentData.geoJsonType &&
        parseInt(roundSelect.value) == currentData.electionData1.tura &&
        dataType.value == currentData.dataCurrentlyAnalysed
    ) {
        refreshButton.disabled = true;
    } else {
        refreshButton.disabled = false;
    }
}
//document.addEventListener('click', enableAndDisableRefresh);

/**
 *
 * ############################################################
 * sekcja leaflet
 * ############################################################
 *
 */
//console.log(testData.rok, testData.rodzaj_wyborów, testData.tura)

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
    //console.log(currentData.geoJsonType);
    return {
        color: '#000000',
        fillColor: colorRegion(
            calculateTurnout(
                feature.properties.terc,
                currentData.geoJsonType,
                currentData.electionData1,
            ),
            colorBegin.value,
            colorEnd.value,
        ),
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.95,
    };
}

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

var geojson = 0;
function addGeoJsonData() {
    if (geojson != 0) map.removeLayer(geojson);
    geojson = L.geoJson(currentData.geoJson, {
        style: style,
        onEachFeature: onEachFeature,
    });

    geojson.addTo(map);
}

map.on('zoomed', function () {
    var currentZoom = map.getZoom();
});

async function redrawGeoJson() {
    geojson.setStyle((feature) => ({
        color: '#000000',
        fillColor: colorRegion(
            calculateTurnout(
                feature.properties.terc,
                currentData.geoJsonType,
                currentData.electionData1,
            ),
            colorBegin.value,
            colorEnd.value,
        ),
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.95,
    }));
    const gradDisplay = document.getElementById('gradientLegend');
    var gradTable = interpolateColor(
        colorBegin.value,
        colorEnd.value,
        document.getElementById('intervalCount').value,
    );
    const interval = 100 / gradTable.length;
    var gradCalc = '';
    for (let i = 0; i < gradTable.length; i++) {
        if (i != 0) gradCalc += ', ';
        gradCalc +=
            gradTable[i] +
            ' ' +
            interval * i +
            '%, ' +
            gradTable[i] +
            ' ' +
            interval * (i + 1) +
            '%';
    }
    gradDisplay.style.background =
        'linear-gradient(to right, ' + gradCalc + ')';
}

document.getElementById('intervalCount').addEventListener('input', () => {
    redrawGeoJson();
});
document.getElementById('colorBegin').addEventListener('input', () => {
    redrawGeoJson();
});
document.getElementById('colorEnd').addEventListener('input', () => {
    redrawGeoJson();
});
document
    .getElementById('precentageMinSlide')
    .addEventListener('input', async (e) => {
        //console.log(e.target.value);
        if (e.target.value >= maxValueSlider.value - 15) {
            e.target.value = maxValueSlider.value - 15;
            console.log(e.target.value, ' fixed');
            return;
        }
        redrawGeoJson();
        minValueText.innerHTML = minValueSlider.value;
    });
document
    .getElementById('precentageMaxSlide')
    .addEventListener('input', async (e) => {
        //console.log(e.target.value);
        if (e.target.value < minValueSlider.value + 15) {
            e.target.value = minValueSlider.value + 15;
            console.log(minValueSlider.value, ' bixed');
            return;
        }
        redrawGeoJson();
        maxValueText.innerHTML = maxValueSlider.value;
    });
