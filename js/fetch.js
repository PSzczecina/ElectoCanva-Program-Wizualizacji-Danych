/**
 * wyciąga dane do pobrania i karze zaktualizować wykresy/mapy
 */
export async function fetchAndUpdateData(type, year, round, adminDiv) {
    //
    // albo i nie - jak będziesz pracować u siebie to używaj "../data/" zamiast "data/""
    //
    var fetchURL = 'data/';
    if (type == 'prezy') {
        fetchURL += `prezydenckie/${year}_prezy_${round}tura.json`;
    } else if (type == 'parla') {
        fetchURL += `parlamentarne/${year}_parla_sejm.json`;
    }

    var electionData = await fetch(fetchURL).then((res) => res.json());
    //console.log(electionData);
    var output = await formatData(adminDiv, electionData);
    //console.log(output);
    return output;
}

export async function fetchAdminDivisions(adminDiv) {
    //console.log(adminDiv);
    //tu też
    var fetchURL = 'data/GeoJson/poland.';
    if (adminDiv == 'gminy') fetchURL += 'municipalities.json';
    else if (adminDiv == 'powiaty') fetchURL += 'counties.json';
    else if (adminDiv == 'wojewodztwa') fetchURL += 'voivodeships.json';
    //console.log(fetchURL, adminDiv);
    var adminDivision = await fetch(fetchURL).then((res) => res.json());
    return adminDivision;
}
/**
 * przearabia dane z Jsona, zależnie jakie dokładnie dane chcemy
 *
 */
async function formatData(geoDataType, data) {
    var output = {};
    output.kandydaci = data.kandydaci;
    output.rodzaj_wyborów = data.rodzaj_wyborów;
    output.rok = data.rok;
    if (data.tura) output.tura = data.tura;

    //console.log(data);

    for (const [key, value] of Object.entries(data)) {
        if (parseInt(key)) {
            if (geoDataType != 'gminy') {
                let groupKey = 0;
                if (geoDataType == 'powiaty') groupKey = key.slice(0, 4);
                else if (geoDataType == 'wojewodztwa')
                    groupKey = key.slice(0, 2);

                if (!output[groupKey]) {
                    // jeśli grupa nie istnieje, kopiujemy strukturę obiektu z wartości
                    output[groupKey] = { ...value };
                } else {
                    // jeśli grupa już istnieje, sumujemy każdą właściwość
                    for (const prop in value) {
                        output[groupKey][prop] =
                            (output[groupKey][prop] ?? 0) + value[prop];
                    }
                }
            } else {
                if (key >= 146502 && key <= 146519 && data.rok != 2005) {
                    //warszawa ma dzielnice, plik geojson ma całe miasto - trzeba je zsumować
                    if (!output[146501]) output[146501] = { ...value };
                    for (const prop in value) {
                        output[146501][prop] =
                            (output[146501][prop] ?? 0) + value[prop];
                    }
                }
                if (key == '180710' && data.rok < 2010) {
                    key = '180702';
                } //gm Jaśliska - wydzielona została w 2010 roku
                if (key == '026501') {
                    if (data.rok <= 2013 && data.rok >= 2003) key = '022109';
                } //gmina wałbrzych - miała inny   k między 2002-2013
                if (key == '060315' && data.rok == 2005) {
                    key = '060608';
                } //gm rejowiec - zmieniła powiat

                if (!output[key]) {
                    output[key] = { ...value };
                } else {
                    for (const prop in value) {
                        output[key][prop] =
                            (output[key][prop] ?? 0) + value[prop];
                    }
                }
            }
        }
    }
    return output;
}
