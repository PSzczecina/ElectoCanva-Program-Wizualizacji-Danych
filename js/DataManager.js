import {
    fetchAndUpdateData,
    fetchAdminDivisions,
    fetchAreaData,
} from './fetch.js';
import { currentData } from './store.js';

/**
 * oblicza minimalną / maksymalną wartość, zależnie od wybranej opcji.
 *
 * Bierze pod uwagę jak bardzo średnia min/max odbiega od faktycznych min/max.
 */
export async function calculateMinMaxValue(electionData) {
    if (!electionData) return 'nie ma danych';
    var maxinset = 0;
    var average = 0;
    var mininset = 1;
    var tercCount = 0;
    Object.keys(electionData).forEach((k) => {
        var turnoutpercent =
            electionData[k].liczba_wyborców_obecnych /
            electionData[k].liczba_wyborców_uprawnionych;
        if (!isNaN(turnoutpercent)) {
            tercCount += 1;
            average = average + (turnoutpercent - average) / tercCount;
            if (turnoutpercent < mininset) mininset = turnoutpercent;
            if (turnoutpercent > maxinset) maxinset = turnoutpercent;
        }
        //console.log(k, mininset, maxinset);
    });
    console.log(
        mininset * 100,
        maxinset * 100,
        average * 100,
        ((mininset + maxinset) / 2) * 100,
        'min, max, avg, min+max/2',
    );
    //return(mininset, maxinset)
}

export function createGroupCandidatesSection(electionData, electionData2) {
    //console.log(electionData, electionData2);
    var candidateListHtml = document.createElement('table');
    if (electionData2) {
        candidateListHtml.innerHTML +=
            '<tr><th>Kandydat (wybory 1)</th><th>Grupuj</th><th>Zignoruj</th></tr>';
        for (let i = 0; i < electionData.kandydaci.length; i++) {
            var candiElement =
                '<tr>' +
                '<td> ' +
                electionData.kandydaci[i] +
                ' </td>' +
                '<td>' +
                '<input type="radio" name="grPolityData1' +
                i +
                '" value="inni">' +
                '</td>' +
                '<td>' +
                '<input checked type="radio" name="grPolityData1' +
                i +
                '" value="zignoruj">' +
                '</td>' +
                '</tr>';
            candidateListHtml.innerHTML += candiElement;
        }
        candidateListHtml.innerHTML +=
            '<tr><th>Kandydat (wybory 2)</th><th>Grupuj</th><th>Zignoruj</th></tr>';
        for (let i = 0; i < electionData2.kandydaci.length; i++) {
            var candiElement =
                '<tr>' +
                '<td> ' +
                electionData2.kandydaci[i] +
                ' </td>' +
                '<td>' +
                '<input type="radio" name="grPolityData2' +
                i +
                '" value="inni">' +
                '</td>' +
                '<td>' +
                '<input checked type="radio" name="grPolityData2' +
                i +
                '" value="zignoruj">' +
                '</td>' +
                '</tr>';
            candidateListHtml.innerHTML += candiElement;
        }
    } else {
        if (electionData.kandydaci.length == 2) {
            candidateListHtml.innerHTML +=
                '<tr><th>Kandydat</th><th>Prawica</th><th>Lewica</th><th>Zignoruj</th></tr>';
            var candiElement =
                '<tr><td>' +
                electionData.kandydaci[0] +
                '</td><td><input type="radio" name="grPolity0" value="prawica"></td><td><input type="radio" name="grPolity0" value="lewica"></td><td><input type="radio" name="grPolity0" value="zignoruj" checked></td></tr>';
            candidateListHtml.innerHTML += candiElement;
            candiElement =
                '<tr><td>' +
                electionData.kandydaci[1] +
                '</td><td><input type="radio" name="grPolity1" value="prawica"></td><td><input type="radio" name="grPolity1" value="lewica"></td><td><input type="radio" name="grPolity1" value="zignoruj" checked></td></tr>';
            candidateListHtml.innerHTML += candiElement;
        } else {
            candidateListHtml.innerHTML +=
                '<tr><th>Kandydat</th><th>Prawica</th><th>Centrum</th><th>Lewica</th><th>Inni</th><th>Zignoruj</th></tr>';
            for (let i = 0; i < electionData.kandydaci.length; i++) {
                var candiElement =
                    '<tr>' +
                    '<td> ' +
                    electionData.kandydaci[i] +
                    ' </td>' +
                    '<td>' +
                    '<input type="radio" name="grPolity' +
                    i +
                    '" value="prawica">' +
                    '</td>' +
                    '<td>' +
                    '<input type="radio" name="grPolity' +
                    i +
                    '" value="centrum">' +
                    '</td>' +
                    '<td>' +
                    '<input type="radio" name="grPolity' +
                    i +
                    '" value="lewica">' +
                    '</td>' +
                    '<td>' +
                    '<input type="radio" name="grPolity' +
                    i +
                    '" value="inni">' +
                    '</td>' +
                    '<td>' +
                    '<input checked type="radio" name="grPolity' +
                    i +
                    '" value="zignoruj">' +
                    '</td>' +
                    '</tr>';
                candidateListHtml.innerHTML += candiElement;
            }
        }
    }
    //console.log(candidateListHtml);
    candidateListHtml.addEventListener('mousemove', (event) => {
        if (event.target.tagName == 'INPUT') {
            groupCandidates(electionData, candidateListHtml);
            if (electionData2)
                groupCandidates(electionData2, candidateListHtml, true);
        }
        if (event.buttons == 1) {
            if (event.target) {
                event.target.checked = true;
                //wyciągnij ID z tabeli polityka
                //zaznacz że jest on przypisany do jednej z grup
                //zresetuj widok
            }
        }
    });
    return candidateListHtml;
}

export function calculateTurnout(TERYT, geoDataType, data) {
    TERYT = fixTERYT(TERYT, geoDataType, data.rok);
    return (
        data[TERYT].liczba_wyborców_obecnych /
        data[TERYT].liczba_wyborców_uprawnionych
    );
}

export function calculateMaxCandidate(TERYT, geoDataType, data) {
    TERYT = fixTERYT(TERYT, geoDataType, data.rok);
    //tu trzeba zgrupować na podstawie wcześniej ustalonych grup (prawica, [centrum], lewica, [inni])
    //po zsumowaniu ludzi do danej kategorii można bawić się w szukanie kto ma więcej
    const rejon = data[TERYT];
    const osobyWRejonie = data[TERYT].liczba_wyborców_obecnych;
    const kandydaci = data.kandydaci;
    const ugrupowania = currentData.electionData1CandidateGrouping;
    let wynikPrawica = 0,
        wynikLewica = 0,
        wynikCentrum = 0,
        wynikInni = 0;
    ugrupowania.prawica.forEach((kandydat) => {
        wynikPrawica += rejon[kandydat];
    });
    ugrupowania.lewica.forEach((kandydat) => {
        wynikLewica += rejon[kandydat];
    });
    ugrupowania.centrum.forEach((kandydat) => {
        wynikCentrum += rejon[kandydat];
    });
    ugrupowania.inni.forEach((kandydat) => {
        wynikInni += rejon[kandydat];
    });
    let zwyciesca = null;
    let wynikZwyciescy = -Infinity;

    wynikZwyciescy = Math.max(
        wynikPrawica,
        wynikLewica,
        wynikCentrum,
        wynikInni,
    );

    if (wynikZwyciescy == wynikPrawica) {
        zwyciesca = 'prawica';
    } else if (wynikZwyciescy == wynikLewica) {
        zwyciesca = 'lewica';
    } else if (wynikZwyciescy == wynikCentrum) {
        zwyciesca = 'centrum';
    } else if (wynikZwyciescy == wynikInni) {
        zwyciesca = 'inni';
    }
    return [wynikZwyciescy / osobyWRejonie, zwyciesca];
}

export function calculateTurnoutChange(TERYT, geoDataType, data1, data2) {
    TERYT = fixTERYT(TERYT, geoDataType, data1.rok);
    let output =
        data1[TERYT].liczba_wyborców_obecnych /
        data1[TERYT].liczba_wyborców_uprawnionych /
        (data2[TERYT].liczba_wyborców_obecnych /
            data2[TERYT].liczba_wyborców_uprawnionych);
    return output - 1;
}

export function calculateCandidateChange(TERYT, geoDataType, data1, data2) {
    var TERYT1 = fixTERYT(TERYT, geoDataType, data1.rok);
    var TERYT2 = fixTERYT(TERYT, geoDataType, data2.rok);
    var wynikGrupaData1 = 0,
        wynikGrupaData2 = 0;
    var kandydaciData1 = currentData.electionData1CandidateGrouping.inni,
        kandydaciData2 = currentData.electionData2CandidateGrouping.inni;
    kandydaciData1.forEach((kandydat) => {
        wynikGrupaData1 += data1[TERYT1][kandydat];
    });
    kandydaciData2.forEach((kandydat) => {
        wynikGrupaData2 += data2[TERYT2][kandydat];
    });
    let output =
        wynikGrupaData1 / data1[TERYT1].liczba_wyborców_obecnych -
        wynikGrupaData2 / data2[TERYT2].liczba_wyborców_obecnych;
    return output - 1;
}

//do przemyślenia - trzeba ogarnąć dane o gęstości
export function calculateRelativeDensity(TERYT, geoDataType, data) {
    //const areaData = await fetchAreaData(geoDataType);
    //console.log(areaData);
    TERYT = fixTERYT(TERYT, geoDataType, data.rok);
    let density =
        data[TERYT].liczba_wyborców_uprawnionych / currentData.areaData[TERYT];
    let divider = 20;
    if (geoDataType == 'wojewodztwa') divider = 1;
    let output =
        (density - currentData.electionData1MinPopulation) /
        (currentData.electionData1MaxPopulation / divider -
            currentData.electionData1MinPopulation);
    return output;
}
//tutaj - funckja do gęstości zaludnienia (wyciągnąć największą i najmniejszą wartość, po czym na podstawie tego skalę zrobić i zwrócić )

async function groupCandidates(data, groupingControl, isSecond) {
    //console.log(data, groupingControl);
    const zgrupowanie = {};
    groupingControl.querySelectorAll('tr').forEach((row, index) => {
        if (index === 0) return;

        const kandydat = row.querySelector('td')?.innerText.trim();
        const checked = row.querySelector('input:checked');

        if (!kandydat || !checked) return;

        const grupa = checked.value;
        if (!zgrupowanie[grupa]) {
            zgrupowanie[grupa] = [];
        }
        zgrupowanie[grupa].push(kandydat);
    });
    if (isSecond) {
        currentData.electionData1CandidateGrouping = {
            prawica: [],
            centrum: [],
            lewica: [],
            inni: [],
        };
        currentData.electionData2CandidateGrouping = {
            prawica: [],
            centrum: [],
            lewica: [],
            inni: [],
        };
        zgrupowanie.inni.forEach((osobnik) => {
            if (currentData.electionData1.kandydaci.includes(osobnik)) {
                currentData.electionData1CandidateGrouping.inni.push(osobnik);
            } else if (currentData.electionData2.kandydaci.includes(osobnik)) {
                currentData.electionData2CandidateGrouping.inni.push(osobnik);
            }
        });
    } else {
        currentData.electionData1CandidateGrouping = {
            prawica: [],
            centrum: [],
            lewica: [],
            inni: [],
        };
        currentData.electionData2CandidateGrouping = {
            prawica: [],
            centrum: [],
            lewica: [],
            inni: [],
        };
        //opcje to: prawica, lewica, centurm, inni
        if (zgrupowanie.prawica)
            currentData.electionData1CandidateGrouping.prawica =
                zgrupowanie.prawica;
        if (zgrupowanie.lewica)
            currentData.electionData1CandidateGrouping.lewica =
                zgrupowanie.lewica;
        if (zgrupowanie.centrum)
            currentData.electionData1CandidateGrouping.centrum =
                zgrupowanie.centrum;
        if (zgrupowanie.inni)
            currentData.electionData1CandidateGrouping.inni = zgrupowanie.inni;
    }
}

//
// modyfikuje niektóre kody, żeby pasowały do danego roku
//
function fixTERYT(TERYT, geoDataType, dataYear) {
    if (geoDataType == 'gminy') {
        TERYT = TERYT.slice(0, -1);
        if (TERYT == '180710' && dataYear < 2010) {
            TERYT = '180702';
        } //gm Jaśliska - wydzielona została w 2010 roku
        if (TERYT == '026501') {
            if (dataYear <= 2013 && dataYear >= 2003) TERYT = '022109';
        } //gmina wałbrzych - miała inny powiat między 2002-2013
        if (TERYT == '060315' && dataYear == 2005) {
            TERYT = '060608';
        } //gm rejowiec - zmieniła powiat
    }
    if (geoDataType == 'powiaty') {
        TERYT = TERYT.slice(0, 4);
        if (TERYT == '0265') {
            if (dataYear <= 2013 && dataYear >= 2003) TERYT = '0221';
        } //gmina wałbrzych - miała inny   k między 2002-2013
    }
    if (geoDataType == 'wojewodztwa') TERYT = TERYT.slice(0, 2);
    //console.log(TERYT);
    return TERYT;
}

export function returnMinAndMaxPopulation(data) {
    let minPop = Infinity,
        maxPop = -Infinity,
        avgPop = 0;
    for (const [key, value] of Object.entries(data)) {
        if (
            value.liczba_wyborców_uprawnionych / currentData.areaData[key] >
            maxPop
        )
            maxPop =
                value.liczba_wyborców_uprawnionych / currentData.areaData[key];
        else if (
            value.liczba_wyborców_uprawnionych / currentData.areaData[key] <
            minPop
        )
            minPop =
                value.liczba_wyborców_uprawnionych / currentData.areaData[key];
    }
    return [minPop, maxPop];
}
