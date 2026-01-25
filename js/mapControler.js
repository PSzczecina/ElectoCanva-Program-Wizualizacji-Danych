import { fetchAndUpdateData, fetchAdminDivisions } from './fetch.js';
import { colorRegion, interpolateColor } from './utils.js';
import {
    calculateCandidateChange,
    calculateMaxCandidate,
    calculateMinMaxValue,
    calculateTurnout,
    calculateTurnoutChange,
    createGroupCandidatesSection,
} from './DataManager.js';
import { currentData } from './store.js';

//elementy HTML
const presidentialYearList = [2005, 2010, 2015, 2020, 2025];
const parlimentaryYearList = [2005, 2007, 2011, 2015, 2019, 2023];

const elecTypeSelect = document.getElementById('electionType');
const elecYearSelect = document.getElementById('electionYear');
const roundSelect = document.getElementById('electionRound');

const elecSecondCheckbox = document.getElementById('secondElectionCheckbox');

const elecSecondTypeSelect = document.getElementById('electionTypeSecond');
const elecSecondYearSelect = document.getElementById('electionYearSecond');
const roundSecondSelect = document.getElementById('electionRoundSecond');

const adminDivision = document.getElementById('administrativeDivision');
const dataType = document.getElementById('dataType');

const refreshButton = document.getElementById('refresh');

const minValueText = document.getElementById('precentageMinValue');
const maxValueText = document.getElementById('precentageMaxValue');
const minValueSlider = document.getElementById('precentageMinSlide');
const maxValueSlider = document.getElementById('precentageMaxSlide');
minValueText.innerHTML = minValueSlider.value + '%';
maxValueText.innerHTML = maxValueSlider.value + '%';

const colorBegin = document.getElementById('colorBegin');
const colorEnd = document.getElementById('colorEnd');

const candidateListHtml = document.getElementById('candidateList');

//====================================
/*currentData.geoJsonType = 'powiaty';
currentData.dataCurrentlyAnalysed = 'turnout';
currentData.electionData1 = await fetchAndUpdateData(
    elecTypeSelect.value,
    elecYearSelect.value || '2025',
    roundSelect.value,
    adminDivision.value,
);
currentData.geoJson = await fetchAdminDivisions(currentData.geoJsonType);
*/
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
    //
    if (true) {
        elecSecondYearSelect.innerHTML = '';
        if (elecSecondTypeSelect.value == 'prezy') {
            presidentialYearList.forEach((year) => {
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                if (
                    (year =
                        presidentialYearList[presidentialYearList.length - 1])
                )
                    option.selected = true;
                elecSecondYearSelect.appendChild(option);
                roundSecondSelect.style.visibility = 'visible';
            });
        } else if (elecSecondTypeSelect.value == 'parla') {
            parlimentaryYearList.forEach((year) => {
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                if (
                    (year =
                        parlimentaryYearList[parlimentaryYearList.length - 1])
                )
                    option.selected = true;
                elecSecondYearSelect.appendChild(option);
                roundSecondSelect.style.visibility = 'hidden';
            });
        }
    }
}
updateYearAndRoundSelect();
elecTypeSelect.addEventListener('input', updateYearAndRoundSelect);
elecSecondCheckbox.addEventListener('input', updateYearAndRoundSelect);
elecSecondTypeSelect.addEventListener('input', updateYearAndRoundSelect);

refreshButton.addEventListener('click', async () => {
    //zaktualizuj store danych
    currentData.geoJsonType = adminDivision.value;
    currentData.dataCurrentlyAnalysed = dataType.value;
    currentData.electionData1 = await fetchAndUpdateData(
        elecTypeSelect.value,
        elecYearSelect.value || '2025',
        roundSelect.value,
        adminDivision.value,
    );
    if (elecSecondCheckbox.checked) {
        currentData.electionData2 = await fetchAndUpdateData(
            elecSecondTypeSelect.value,
            elecSecondYearSelect.value || '2025',
            roundSecondSelect.value,
            adminDivision.value,
        );
    }
    currentData.geoJson = await fetchAdminDivisions(currentData.geoJsonType);
    await addGeoJsonData();
    await redrawGeoJson();

    //trzeba dodać czy wybory są nadal takie same. Jeśli tak, to zostaw bez zmian

    if (currentData.dataCurrentlyAnalysed == 'results') {
        candidateListHtml.innerHTML = '';
        if (elecSecondCheckbox.checked) {
            candidateListHtml.appendChild(
                createGroupCandidatesSection(
                    currentData.electionData1,
                    currentData.electionData2,
                ),
            );
        } else {
            candidateListHtml.appendChild(
                createGroupCandidatesSection(currentData.electionData1),
            );
        }
    } else {
        candidateListHtml.innerHTML = '';
    }

    //enableAndDisableRefresh();
    //document.addEventListener('click', enableAndDisableRefresh);
    calculateMinMaxValue(currentData.electionData1);
    calculateMinMaxValue(currentData.electionData2);
    //wyświetlanie, zależnie od rodzaju
});

/**
 * wyłącza przycisk odświeżania jeżeli wszystkie dane są takie same
 */
function enableAndDisableRefresh() {
    if (
        (elecTypeSelect.value ==
            currentData.electionData1.rodzaj_wyborów.slice(0, 5) &&
            parseInt(elecYearSelect.value) == currentData.electionData1.rok &&
            adminDivision.value == currentData.geoJsonType &&
            parseInt(roundSelect.value) == currentData.electionData1.tura &&
            currentData.dataCurrentlyAnalysed ==
                currentData.dataCurrentlyAnalysed) ||
        (elecSecondTypeSelect.value ==
            currentData.electionData2.rodzaj_wyborów.slice(0, 5) &&
            parseInt(elecSecondYearSelect.value) ==
                currentData.electionData2.rok &&
            adminDivision.value == currentData.geoJsonType &&
            parseInt(roundSecondSelect.value) ==
                currentData.electionData2.tura &&
            currentData.dataCurrentlyAnalysed ==
                currentData.dataCurrentlyAnalysed)
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

var map = L.map('map').setView([51, 19], 13);

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
    var colorOutput = 0;
    if (currentData.dataCurrentlyAnalysed == 'turnout') {
        document.getElementById('turnoutColorSegment').style.display = 'block';
        if (elecSecondCheckbox.checked) {
            colorOutput = colorRegion(
                calculateTurnoutChange(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                    currentData.electionData2,
                ),
                colorBegin.value,
                colorEnd.value,
            );
        } else {
            colorOutput = colorRegion(
                calculateTurnout(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                ),
                colorBegin.value,
                colorEnd.value,
            );
        }
    } else if (currentData.dataCurrentlyAnalysed == 'results') {
        if (elecSecondCheckbox.checked) {
            document.getElementById('turnoutColorSegment').style.display =
                'block';
            colorOutput = colorRegion(
                calculateCandidateChange(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                    currentData.electionData2,
                ),
                colorBegin.value,
                colorEnd.value,
            );
        } else {
            document.getElementById('turnoutColorSegment').style.display =
                'none';
            colorOutput = colorRegion(
                calculateMaxCandidate(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                ),
                colorBegin.value,
                colorEnd.value,
                true,
            );
        }
    }
    //console.log(colorOutput);
    return {
        color: '#000000',
        fillColor: colorOutput,
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.95,
    };
}

var info = L.control({ position: 'bottomleft' });
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    this._div.style.display = 'none';
    return this._div;
};
info.update = function (props) {
    if (props && props != -1) {
        this._div.style.display = 'block';
        var _name = props.name;
        var _terc = props.terc;
        if (currentData.geoJsonType == 'gminy') {
            var jed = 'Gmina';
            _terc = _terc.slice(0, -1);
        }
        if (currentData.geoJsonType == 'powiaty') var jed = 'Powiat';
        if (currentData.geoJsonType == 'wojewodztwa') var jed = 'Województwo';
        this._div.innerHTML =
            '<h4>' + jed + ' ' + _name + ' (terc ' + _terc + ')</h4>';
        for (let [key, value] of Object.entries(
            currentData.electionData1[_terc],
        )) {
            if (key == 'liczba_wyborców_uprawnionych')
                key = 'Wyborcy uprawnieni';
            if (key == 'liczba_wyborców_obecnych') key = 'Obecni na miejscu';
            if (key == 'łączna_ilość_głosów') key = 'Wszystkie głosy';
            this._div.innerHTML += '<p>' + key + ': <b>' + value + '</b></p>';
            if (key == 'Wszystkie głosy')
                this._div.innerHTML += '<p><b>=================</b></p>';
        }
    } else if (props == -1) {
        this._div.style.display = 'none';
    }
};
info.addTo(map);

function highlightFeature(e) {
    //console.log(e.target.feature.properties.terc)
    var layer = e.target;
    layer.setStyle({
        weight: 1,
        color: '#000000',
        dashArray: '',
        fillOpacity: 1,
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function displayRegion(e) {
    let terc = e.target.feature.properties.terc;
    let name = e.target.feature.properties.name;
    info.innerHTML = terc + ' | ' + name;
    console.log(name);
    if (currentData.geoJsonType == 'gminy') terc = terc.slice(0, -1);
    for (const [key, value] of Object.entries(
        currentData.electionData1[terc],
    )) {
        //console.log(key, value);
    }
}
//mouseOut się nie wykonuje czasem - to jest remedium na to
document.getElementById('map').addEventListener('mouseleave', () => {
    //geojson.resetStyle();
    info.update(-1);
});

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: displayRegion,
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
    if (currentData.dataCurrentlyAnalysed == 'turnout') {
        document.getElementById('turnoutColorSegment').style.display = 'block';
        if (elecSecondCheckbox.checked) {
            //console.log('wybrano drugie wybory');
            geojson.setStyle((feature) => ({
                color: '#000000',
                fillColor: colorRegion(
                    calculateTurnoutChange(
                        feature.properties.terc,
                        currentData.geoJsonType,
                        currentData.electionData1,
                        currentData.electionData2,
                    ),
                    colorBegin.value,
                    colorEnd.value,
                ),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.95,
            }));
        } else {
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
        }
    } else if (currentData.dataCurrentlyAnalysed == 'results') {
        if (elecSecondCheckbox.checked) {
            document.getElementById('turnoutColorSegment').style.display =
                'block';
            //console.log('wybrano drugie wybory');
            geojson.setStyle((feature) => ({
                color: '#000000',
                fillColor: colorRegion(
                    calculateCandidateChange(
                        feature.properties.terc,
                        currentData.geoJsonType,
                        currentData.electionData1,
                        currentData.electionData2,
                    ),
                    colorBegin.value,
                    colorEnd.value,
                ),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.95,
            }));
        } else {
            document.getElementById('turnoutColorSegment').style.display =
                'none';
            geojson.setStyle((feature) => ({
                color: '#000000',
                fillColor: colorRegion(
                    calculateMaxCandidate(
                        feature.properties.terc,
                        currentData.geoJsonType,
                        currentData.electionData1,
                    ),
                    colorBegin.value,
                    colorEnd.value,
                    true,
                ),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.95,
            }));
        }
    }
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
        redrawGeoJson();
        minValueText.innerHTML = minValueSlider.value + '%';
    });
document
    .getElementById('precentageMaxSlide')
    .addEventListener('input', async (e) => {
        redrawGeoJson();
        maxValueText.innerHTML = maxValueSlider.value + '%';
    });

document.getElementById('refreshDisplay').addEventListener('click', () => {
    geojson.resetStyle();
});

//SEKCJA DEBUG
document.onkeydown = function (e) {
    if (e.key == 'q') {
        console.log(currentData);
    }
};
