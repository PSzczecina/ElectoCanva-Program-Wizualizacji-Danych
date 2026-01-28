export function colorRegion(
    value,
    colorBegin,
    colorEnd,
    mergeMarginalWins = false,
    useAbsoluteValue = false,
) {
    if (value.length == 2) {
        var candidate = value[1];
        value = value[0];
        //console.log(value, candidate);
    }
    if (value < 0) return '#000000';
    var colorTable = [];
    var relativeStages = document.getElementById('intervalCount').value;
    if (!useAbsoluteValue) {
        var min =
            parseInt(document.getElementById('precentageMinSlide').value) / 100;
        var max =
            parseInt(document.getElementById('precentageMaxSlide').value) / 100;
        var diff = max - min;

        //jeśli nie ma kandydatów = jest to frekwencja
        if (!candidate) {
            colorTable = interpolateColor(colorBegin, colorEnd, relativeStages);
            for (var i = 0; i < relativeStages - 1; i++) {
                if (value <= min + (diff / relativeStages) * (i + 1)) {
                    return colorTable[i];
                }
            }
            return colorTable[colorTable.length - 1];
        }
        //jeśli są to kandydaci = jest to pokazywanie wyników
        var colorTableLeft = interpolateColor(
            '#ffaaaa',
            '#aa0000',
            relativeStages,
        );
        var colorTableRight = interpolateColor(
            '#babaff',
            '#000099',
            relativeStages,
        );
        var colorTableCenter = interpolateColor(
            '#fbfb7a',
            '#95852c',
            relativeStages,
        );
        var colorTableOther = interpolateColor(
            '#999999',
            '#222222',
            relativeStages,
        );
        //ten fragment powinien zwracać kolor biały, gdy wynik kandydata mieści się w odchyleniu (to znaczy: różnica między dwoma kandydatami jest minimalna)
        //
        //jest szansza że będzie trzeba przerobić / dodać nową funkcjonalność
        //if (value < 0.52) return '#ffffff';
        //
        if (value < 0.525 && mergeMarginalWins) return '#ffffff';
        for (var i = 0; i < relativeStages - 1; i++) {
            if (value <= min + (diff / relativeStages) * (i + 1)) {
                if (candidate == 'lewica') return colorTableLeft[i];
                else if (candidate == 'prawica') return colorTableRight[i];
                else if (candidate == 'centrum') return colorTableCenter[i];
                else if (candidate == 'inni') return colorTableOther[i];
            }
        }
        if (candidate == 'lewica')
            return colorTableLeft[colorTableLeft.length - 1];
        else if (candidate == 'prawica')
            return colorTableRight[colorTableRight.length - 1];
        else if (candidate == 'centrum')
            return colorTableCenter[colorTableCenter.length - 1];
        else if (candidate == 'inni')
            return colorTableOther[colorTableOther.length - 1];
    } else {
        var colorTableAbsolute = interpolateColor(
            '#f9f9c8',
            '#584e15',
            relativeStages,
        );
        var min = 0,
            max = 1;
        var diff = max - min;
        //console.log(value);
        //console.log(relativeStages);
        for (var i = 0; i < relativeStages - 1; i++) {
            if (value <= min + (diff / relativeStages) * (i + 1)) {
                return colorTableAbsolute[i];
            }
        }
        return '#584e15';
    }
}

function rgb(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

export function interpolateColor(col1, col2, stages) {
    col1 = col1.replace('#', '');
    col2 = col2.replace('#', '');
    var col1RGB = {
        r: parseInt(col1.substring(0, 2), 16),
        g: parseInt(col1.substring(2, 4), 16),
        b: parseInt(col1.substring(4, 6), 16),
    };
    var col2RGB = {
        r: parseInt(col2.substring(0, 2), 16),
        g: parseInt(col2.substring(2, 4), 16),
        b: parseInt(col2.substring(4, 6), 16),
    };
    const gradient = [];
    for (let i = 0; i < stages; i++) {
        const ratio = i / (stages - 1);
        const r = Math.round(col1RGB.r + ratio * (col2RGB.r - col1RGB.r));
        const g = Math.round(col1RGB.g + ratio * (col2RGB.g - col1RGB.g));
        const b = Math.round(col1RGB.b + ratio * (col2RGB.b - col1RGB.b));

        const hex =
            '#' +
            [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        gradient.push(hex);
    }
    return gradient;
}
