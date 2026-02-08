import {
    fetchAndUpdateData,
    fetchAdminDivisions,
    fetchAreaData,
} from './fetch.js';
import { colorRegion, interpolateColor } from './utils.js';
import {
    calculateCandidateChange,
    calculateMaxCandidate,
    calculateMinMaxValue,
    calculateRelativeDensity,
    calculateTurnout,
    calculateTurnoutChange,
    createGroupCandidatesSection,
    returnMinAndMaxDensity,
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

const marginalWinsCheckbox = document.getElementById('marginalWinMerging');
const marginContainer = document.getElementById('marginContainer');
const marginalWinValue = document.getElementById('marginalWinValue');

const groupingGradients = document.getElementById('groupingGradients');

const refreshButton = document.getElementById('refresh');

const minValueText = document.getElementById('precentageMinValue');
const maxValueText = document.getElementById('precentageMaxValue');
const minValueSlider = document.getElementById('precentageMinSlide');
const maxValueSlider = document.getElementById('precentageMaxSlide');
minValueText.innerHTML = minValueSlider.value + '%';
maxValueText.innerHTML = maxValueSlider.value + '%';

const colorBegin = document.getElementById('colorBegin');
const colorEnd = document.getElementById('colorEnd');
const colorInterval = document.getElementById('intervalCount');

const candidateListHtml = document.getElementById('candidateList');

var maxinset = 0;
var mininset = 1;
var average = 0;

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
    currentData.areaData = await fetchAreaData(currentData.geoJsonType);
    let temp = await returnMinAndMaxDensity(currentData.electionData1);
    console.log(temp);
    currentData.electionData1MinDensity = temp[0];
    currentData.electionData1MaxDensity = temp[1];

    if (elecSecondCheckbox.checked) {
        currentData.electionData2 = await fetchAndUpdateData(
            elecSecondTypeSelect.value,
            elecSecondYearSelect.value || '2025',
            roundSecondSelect.value,
            adminDivision.value,
        );
        let temp = returnMinAndMaxDensity(currentData.electionData2);
        currentData.electionData2MinDensity = temp[0];
        currentData.electionData2MaxDensity = temp[1];
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

function showAndHideHtmlElements() {
    if (currentData.dataCurrentlyAnalysed == 'turnout') {
        marginContainer.style.display = 'none';
        maxValueSlider.style.display = minValueSlider.style.display = 'block';
        minValueText.style.display = maxValueText.style.display = 'block';
        document.getElementById('turnoutColorSegment').style.display = 'block';
    } else if (currentData.dataCurrentlyAnalysed == 'results') {
        marginContainer.style.display = 'block';
        maxValueSlider.style.display = minValueSlider.style.display = 'block';
        minValueText.style.display = maxValueText.style.display = 'block';
        if (elecSecondCheckbox.checked) {
            document.getElementById('turnoutColorSegment').style.display =
                'block';
        } else {
            document.getElementById('turnoutColorSegment').style.display =
                'none';
        }
    } else if (currentData.dataCurrentlyAnalysed == 'population') {
        marginContainer.style.display = 'none';
        maxValueSlider.style.display = minValueSlider.style.display = 'none';
        minValueText.style.display = maxValueText.style.display = 'none';
        document.getElementById('turnoutColorSegment').style.display = 'none';
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

var map = L.map('map').setView([51.5, 19], 13);

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
    showAndHideHtmlElements();
    if (marginalWinsCheckbox.checked) {
        var winMargin = parseFloat(marginalWinValue.value);
    } else {
        var winMargin = 0;
    }
    var colorOutput = 0;
    if (currentData.dataCurrentlyAnalysed == 'turnout') {
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
            colorOutput = colorRegion(
                calculateMaxCandidate(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                ),
                colorBegin.value,
                colorEnd.value,
                winMargin,
            );
        }
    } else if (currentData.dataCurrentlyAnalysed == 'population') {
        colorOutput = colorRegion(
            calculateRelativeDensity(
                feature.properties.terc,
                currentData.geoJsonType,
                currentData.electionData1,
            ),
            colorBegin.value,
            colorEnd.value,
            true,
            true,
        );
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

var infoLock = 1; //1 to false ma być
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
    if (infoLock == -1) {
        this._div.style.border = '2px solid darkorange';
    } else this._div.style.border = '2px solid black';
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
    if (infoLock != -1) info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
function displayRegion(e) {
    infoLock = infoLock * -1;
    console.log(infoLock);
    if (infoLock != -1) {
        var layer = e.target;
        layer.setStyle({
            weight: 1,
            color: '#000000',
            dashArray: '',
            fillOpacity: 1,
        });
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
//mouseOut się nie wykonuje czasem - to jest remedium na to
document.getElementById('map').addEventListener('mouseleave', () => {
    //geojson.resetStyle();
    infoLock = 1;
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
    showAndHideHtmlElements();
    if (marginalWinsCheckbox.checked) {
        var winMargin = parseFloat(marginalWinValue.value);
    } else {
        var winMargin = 0;
    }
    if (currentData.dataCurrentlyAnalysed == 'turnout') {
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
                    //tu trzeba zmienić, żeby tylko na prezydenckich 2tura było / dało się ustalić różnicę progową
                    winMargin,
                ),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.95,
            }));
        }
    } else if (currentData.dataCurrentlyAnalysed == 'population') {
        geojson.setStyle((feature) => ({
            color: '#000000',
            fillColor: colorRegion(
                calculateRelativeDensity(
                    feature.properties.terc,
                    currentData.geoJsonType,
                    currentData.electionData1,
                ),
                colorBegin.value,
                colorEnd.value,
                true,
                true,
            ),
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.95,
        }));
    }
    const gradDisplay = document.getElementById('gradientLegend');
    var gradTable = interpolateColor(
        colorBegin.value,
        colorEnd.value,
        colorInterval.value,
    );
    //do wyświetlania gradientu grup
    var colorTableLeft = interpolateColor(
        '#ffc6c6',
        '#aa0000',
        colorInterval.value,
    );
    var colorTableRight = interpolateColor(
        '#ddddff',
        '#000099',
        colorInterval.value,
    );
    var colorTableCenter = interpolateColor(
        '#f8f8b0',
        '#504611',
        colorInterval.value,
    );
    var colorTableOther = interpolateColor(
        '#999999',
        '#222222',
        colorInterval.value,
    );
    //
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

colorInterval.addEventListener('input', () => {
    redrawGeoJson();
});
document.getElementById('colorBegin').addEventListener('input', () => {
    redrawGeoJson();
});
document.getElementById('colorEnd').addEventListener('input', () => {
    redrawGeoJson();
});
marginalWinsCheckbox.addEventListener('input', () => {
    redrawGeoJson();
});
marginalWinValue.addEventListener('input', () => {
    document.getElementById('marginValueDisplay').innerHTML =
        'różnica zwycięstwa: ' + marginalWinValue.value;
    redrawGeoJson();
});
minValueSlider.addEventListener('input', async (e) => {
    redrawGeoJson();
    minValueText.innerHTML = minValueSlider.value + '%';
});
maxValueSlider.addEventListener('input', async (e) => {
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
