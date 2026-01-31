import { currentData } from './store.js';
import {
    fetchAndUpdateData,
    fetchAdminDivisions,
    fetchAreaData,
    fetchAdminNames,
} from './fetch.js';
import {
    calculateMinMaxValue,
    returnMinAndMaxDensity,
    returnMinAndMaxPopulation,
} from './DataManager.js';
import { getColorForX } from './utils.js';

const verticalLinePlugin = {
    id: 'verticalLineAtZero',
    afterDraw(chart) {
        const { ctx, scales } = chart;
        const xScale = scales.x;

        if (!xScale) return;

        const x = xScale.getPixelForValue(0);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, chart.chartArea.top);
        ctx.lineTo(x, chart.chartArea.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.44)';
        ctx.setLineDash([6, 4]); // linia przerywana (opcjonalnie)
        ctx.stroke();
        ctx.restore();
    },
};

const ctx = document.getElementById('chart');

const presidentialYearList = [2005, 2010, 2015, 2020, 2025];
const parlimentaryYearList = [2005, 2007, 2011, 2015, 2019, 2023];

const elecTypeSelect = document.getElementById('electionType');
const elecYearSelect = document.getElementById('electionYear');
const roundSelect = document.getElementById('electionRound');
const refreshButton = document.getElementById('refresh');
const chartType = document.getElementById('chartTypeSelect');

const bubbleAdminType = document.getElementById('bubbleAdminType');
const bubbleDetails = document.getElementsByClassName('bubbleDetails')[0];
const bubbleGradientDisplay = document.getElementsByClassName(
    'bubbleGradientDisplay',
)[0];
const bubbleAbsoluteXCheck = document.getElementById('absoluteX');
const bubbleAbsoluteYCheck = document.getElementById('absoluteY');

const lineDetails = document.getElementsByClassName('lineDetails')[0];
const lineCheckbox = document.getElementById('specificRegionCheckbox');
const lineAdminType = document.getElementById('lineAdminType');
const lineTerytInput = document.getElementById('terytInput');

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
}
updateYearAndRoundSelect();
elecTypeSelect.addEventListener('input', updateYearAndRoundSelect);

chartType.addEventListener('input', redrawChartMenu);
refreshButton.addEventListener('click', async () => {
    //zaktualizuj store danych
    currentData.dataCurrentlyAnalysed = chartType.value;
    currentData.electionData1 = await fetchAndUpdateData(
        elecTypeSelect.value,
        elecYearSelect.value || '2025',
        roundSelect.value,
        bubbleAdminType.value,
    );
    currentData.geoJsonType = bubbleAdminType.value;
    currentData.areaData = await fetchAreaData(currentData.geoJsonType);
    let temp = await returnMinAndMaxDensity(currentData.electionData1);
    //console.log(temp);
    currentData.electionData1MinDensity = temp[0];
    currentData.electionData1MaxDensity = temp[1];
    temp = await returnMinAndMaxPopulation(currentData.electionData1);
    currentData.electionData1MinPopulation = temp[0];
    currentData.electionData1MaxPopulation = temp[1];
    currentData.administrativeNames = await fetchAdminNames(
        currentData.geoJsonType,
    );
    redrawChartMenu();
    prepareDataToDisplay(chartType);
    /*if (elecSecondCheckbox.checked) {
        currentData.electionData2 = await fetchAndUpdateData(
            elecSecondTypeSelect.value,
            elecSecondYearSelect.value || '2025',
            roundSecondSelect.value,
        );
        let temp = returnMinAndMaxPopulation(currentData.electionData2);
        currentData.electionData2MinPopulation = temp[0];
        currentData.electionData2MaxPopulation = temp[1];
    }

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
    }*/

    //enableAndDisableRefresh();
    //document.addEventListener('click', enableAndDisableRefresh);
    calculateMinMaxValue(currentData.electionData1);
    calculateMinMaxValue(currentData.electionData2);
});

//========================================================================
//charts
//========================================================================
function redrawChartMenu() {
    if (chartType.value == 'bubble') {
        bubbleGradientDisplay.style.display = 'block';
        document.getElementsByClassName('bubbleGradientDesc')[0].style.display =
            'inline';
        document.getElementsByClassName('bubbleGradientDesc')[0].style =
            'text-align: center';
        siteChart.options.plugins.verticalLineAtZero = true;
        lineDetails.style.display = 'none';
        bubbleDetails.style.display = 'block';
    } else if (chartType.value == 'line') {
        bubbleGradientDisplay.style.display = 'none';
        document.getElementsByClassName('bubbleGradientDesc')[0].style.display =
            'none';
        lineDetails.style.display = 'block';
        bubbleDetails.style.display = 'none';
        siteChart.options.plugins.verticalLineAtZero = false;
    } else {
        bubbleGradientDisplay.style.display = 'none';
        document.getElementsByClassName('bubbleGradientDesc')[0].style.display =
            'none';
        lineDetails.style.display = 'none';
        bubbleDetails.style.display = 'none';
        siteChart.options.plugins.verticalLineAtZero = false;
    }
}

var bubbleData = [];
var lineData = [];
var barData = [];

function prepareDataToDisplay(chartType) {
    if (chartType.value == 'bubble') {
        //x to wybór jednego z kandydatów
        //y to frekwencja
        //r to średnia gęstość
        bubbleData = {
            datasets: [
                {
                    label: 'region',
                    data: [],
                },
            ],
        };

        if (bubbleAbsoluteXCheck.checked)
            bubbleConfig.options.scales.x = bubbleAbsoluteXScale;
        else bubbleConfig.options.scales.x = bubbleRelativeXScale;
        //bubbleConfig.options.scales.x.title.text = 'poparcie dla strony';
        if (bubbleAbsoluteYCheck.checked)
            bubbleConfig.options.scales.y = bubbleAbsoluteYScale;
        else bubbleConfig.options.scales.y = bubbleRelativeYScale;
        //bubbleConfig.options.scales.y.title.text = 'frekwencja';

        var totalPopPresent = 0;
        for (const [key, value] of Object.entries(currentData.electionData1)) {
            if (value.liczba_wyborców_obecnych)
                totalPopPresent += value.liczba_wyborców_obecnych;
        }

        var x, y, r;
        for (const [key, value] of Object.entries(currentData.electionData1)) {
            //console.log(currentData.areaData, key);
            //trzeba dodać możliwość wyboru rodzaju wyborów i grupowania do 2 grup
            //na teraz, żeby działało coś - tak jak poniżej
            if (currentData.electionData1.rok == 2025) {
                var leftCandidate = 'TRZASKOWSKI Rafał Kazimierz';
                var rightCandidate = 'NAWROCKI Karol Tadeusz';
            } else if (currentData.electionData1.rok == 2015) {
                var leftCandidate = 'Komorowski Bronisław Maria';
                var rightCandidate = 'Duda Andrzej Sebastian';
            }
            //
            if (!(key > 146501 && key < 146520)) {
                var leftCount = value[leftCandidate];
                var rightCount = value[rightCandidate];
                x = (
                    rightCount / value.liczba_wyborców_obecnych -
                    leftCount / value.liczba_wyborców_obecnych
                ).toFixed(2);
                x *= 50;
                y = (
                    value.liczba_wyborców_obecnych /
                    value.liczba_wyborców_uprawnionych
                ).toFixed(2);
                y *= 100;
                r = value.liczba_wyborców_obecnych / totalPopPresent;
                var multiplier = 1;
                if (currentData.geoJsonType == 'wojewodztwa') {
                    var renderR = r * 200;
                }
                if (currentData.geoJsonType == 'powiaty') {
                    var renderR = r * 800;
                    if (renderR < 1) renderR = 1;
                }
                if (currentData.geoJsonType == 'gminy') {
                    var renderR = r * 600;
                    if (renderR < 1) renderR = 1;
                }
                //var renderR = r;
                bubbleData.datasets[0].data.push({
                    x,
                    y,
                    r: renderR,
                    Czaskoski: leftCount,
                    NowRocky: rightCount,
                    gęstość: parseInt(
                        value.liczba_wyborców_uprawnionych /
                            currentData.areaData[key],
                    ),
                    TERYT: key,
                    nazwa: currentData.areaData[key],
                });
            }
        }
        bubbleConfig.data = bubbleData;
        bubbleData.datasets[0].backgroundColor =
            bubbleData.datasets[0].data.map((p) => getColorForX(p.x, p.y));
        bubbleData.datasets[0].borderColor = 'rgb(63, 63, 63)';
        bubbleData.datasets[0].borderWidth = 0.5;
        usedConfig = bubbleConfig;
    } else if (chartType.value == 'line') {
        if (!lineCheckbox.checked) {
            //zlicz całość po prostu
        } else {
            if (lineAdminType.value == 'gminy') {
                console.log(lineAdminType.value, lineTerytInput.value);
                if (lineTerytInput.value.length == 6) {
                } else
                    console.log(
                        'poprawny teryt gminy musi mieć 6 cyfr (bez ostatniej, siódmej liczby)',
                    );
            } else if (lineAdminType.value == 'powiaty') {
                console.log(lineAdminType.value, lineTerytInput.value);
                if (lineTerytInput.value.length >= 4) {
                } else console.log('poprawny teryt powiatu musi mieć 4 cyfry');
            } else if (lineAdminType.value == 'wojewodztwa') {
                console.log(lineAdminType.value, lineTerytInput.value);
                if (lineTerytInput.value.length >= 2) {
                } else console.log('poprawny teryt powiatu musi mieć 2 cyfry');
            }
        }
        usedConfig = lineConfig;
    } else if (chartType.value == 'bar') {
    }
    siteChart.update({ duration: 200, easing: 'easeOutQuart' });
}

//////
Chart.defaults.borderColor = 'rgb(35, 35, 35)';
Chart.defaults.color = '#ffffff';
Chart.register(verticalLinePlugin);
var bubbleAbsoluteXScale = {
    min: -50,
    max: 50,
    title: {
        text: 'poparcie',
        display: true,
    },
};
var bubbleRelativeXScale = {
    suggestedMin: -20,
    suggestedMax: 20,
    title: {
        text: 'poparcie',
        display: true,
    },
};
var bubbleAbsoluteYScale = {
    min: 0,
    max: 100,
    title: {
        text: 'frekwencja',
        display: true,
    },
};
var bubbleRelativeYScale = {
    suggestedMin: 50,
    suggestedMax: 80,
    title: {
        text: 'frekwencja',
        display: true,
    },
};

const bubbleConfig = {
    type: 'bubble',
    data: bubbleData,
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const point = context.raw;
                        const terc = point.TERYT;
                        const name = currentData.administrativeNames[terc];

                        return [
                            `${name} (terc: ${terc})`,
                            `frekwencja: ${point.y}%`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                min: -50,
                max: 50,
                title: {
                    display: true,
                    text: 'x',
                },
            },
            y: {
                suggestedMin: 0,
                suggestedMax: 100,
                title: {
                    display: true,
                    text: 'y',
                },
            },
        },
    },
};

const lineConfig = {
    type: 'line',
    data: lineData,
    options: {
        scales: {
            x: {
                min: 2005,
                max: 2025,
            },
            y: {
                min: 0,
                max: 100,
            },
        },
    },
};
var usedConfig = bubbleConfig;
const siteChart = new Chart(ctx, usedConfig);

//SEKCJA DEBUG
document.onkeydown = function (e) {
    if (e.key == 'q') {
        console.log(currentData, usedConfig.data);
    }
};
