import { currentData } from './store.js';
import {} from './fetch.js';

const ctx = document.getElementById('chart');

const presidentialYearList = [2005, 2010, 2015, 2020, 2025];
const parlimentaryYearList = [2005, 2007, 2011, 2015, 2019, 2023];

const elecTypeSelect = document.getElementById('electionType');
const elecYearSelect = document.getElementById('electionYear');
const roundSelect = document.getElementById('electionRound');
const refreshButton = document.getElementById('refresh');

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

refreshButton.addEventListener('click', () => {});

//========================================================================
//charts
//========================================================================

var bubbleChartData;
var lineChartData;

function prepareDataToDisplay() {}

Chart.defaults.backgroundColor = '#ffffff';
const data = {
    datasets: [
        {
            label: 'First Dataset',
            data: [
                {
                    x: 20,
                    y: 30,
                    r: 15,
                },
                {
                    x: 40,
                    y: 10,
                    r: 10,
                },
            ],
            backgroundColor: 'rgb(255, 0, 55)',
        },
    ],
};

const bubbleConfig = {
    type: 'bubble',
    data: data,
    options: {},
};

const labels = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july'];
const datalines = {
    labels: labels,
    datasets: [
        {
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(0, 0, 255)',
            tension: 0.1,
        },
    ],
};

const lineConfig = {
    type: 'line',
    data: datalines,
};

new Chart(ctx, bubbleConfig);

//SEKCJA DEBUG
document.onkeydown = function (e) {
    if (e.key == 'q') {
        console.log(currentData);
    }
};
