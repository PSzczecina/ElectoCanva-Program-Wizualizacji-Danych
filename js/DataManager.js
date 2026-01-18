import { fetchAndUpdateData, fetchAdminDivisions } from './fetch.js';

/**
 * oblicza minimalną / maksymalną wartość, zależnie od wybranej opcji.
 *
 * Bierze pod uwagę jak bardzo średnia min/max odbiega od faktycznych min/max.
 */
export async function calculateMinMaxValue(electionData) {
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
}

export function groupCandidates(electionData) {
    var candidateListHtml = document.createElement('table');
    candidateListHtml.innerHTML +=
        '<tr><th>Kandydat</th><th>Prawica</th><th>Centrum</th><th>Lewica</th><th>Inni</th></tr>';
    for (let i = 0; i < electionData.kandydaci.length; i++) {
        var candiElement =
            '<tr>' +
            '<td> ' +
            electionData.kandydaci[i] +
            ' </td>' +
            '<td>' +
            '<input type="radio" name="grPolity' +
            i +
            '" id="prawica">' +
            '</td>' +
            '<td>' +
            '<input type="radio" name="grPolity' +
            i +
            '" id="centrum">' +
            '</td>' +
            '<td>' +
            '<input type="radio" name="grPolity' +
            i +
            '" id="lewica">' +
            '</td>' +
            '<td>' +
            '<input checked type="radio" name="grPolity' +
            i +
            '" id="inni">' +
            '</td>' +
            '</tr>';
        candidateListHtml.innerHTML += candiElement;
    }
    console.log(candidateListHtml);
    return candidateListHtml;
}

export function calculateTurnout(TERYT, geoDataType, data) {
    //console.log(TERYT, geoDataType, data.rok);
    TERYT = fixTERYT(TERYT, geoDataType, data.rok);
    //console.log(data, TERYT, geoDataType);
    return (
        data[TERYT].liczba_wyborców_obecnych /
        data[TERYT].liczba_wyborców_uprawnionych
    );
}

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
