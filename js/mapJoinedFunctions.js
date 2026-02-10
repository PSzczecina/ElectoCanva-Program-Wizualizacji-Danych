import { currentData } from './store.js';

//trzeba dodać jeszcze - zależnie od rodzaju danych (analizy/porównania, frekwencja/wyniki) wyświetla co innego
export function updateDetailsDisplay(props, infoLock, detailSection) {
    if (props && props != -1 && infoLock != -1) {
        detailSection.style.display = 'block';
        var _name = props.name;
        var _terc = props.terc;
        if (currentData.geoJsonType == 'gminy') {
            var jed = 'Gmina';
            _terc = _terc.slice(0, -1);
        }
        if (currentData.geoJsonType == 'powiaty') var jed = 'Powiat';
        if (currentData.geoJsonType == 'wojewodztwa') var jed = 'Województwo';
        detailSection.innerHTML =
            '<h4>' + jed + ' ' + _name + ' (terc&nbsp' + _terc + ')</h4>';
        var detailTable = document.createElement('table');
        for (let [key, value] of Object.entries(
            currentData.electionData1[_terc],
        )) {
            if (key == 'liczba_wyborców_uprawnionych')
                key = 'Wyborcy uprawnieni';
            if (key == 'liczba_wyborców_obecnych') key = 'Obecni na miejscu';
            if (key == 'łączna_ilość_głosów') key = 'Wszystkie głosy';
            detailTable.innerHTML +=
                '<td>' +
                key +
                ': </td><td class="tabNum">' +
                value.toLocaleString() +
                '</td>';
            if (key == 'Wszystkie głosy')
                detailTable.innerHTML += '<td></td><td></td>';
        }
        detailSection.appendChild(detailTable);
    }
    if (infoLock == -1) {
        detailSection.style.border = '1px solid orange';
        //console.log(document.getElementsByClassName('lockedDisplayInfo'));
    } else {
        detailSection.style.border = '1px solid black';
    }
}
