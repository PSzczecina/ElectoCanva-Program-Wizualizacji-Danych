export function colorRegion(
    value,
    colorBegin,
    colorEnd,
    marginalWinsValue = 0,
    useAbsoluteValue = false,
    secondBestValue = NaN,
) {
    if (value.length == 2) {
        var candidate = value[1];
        value = value[0];
        //console.log(value, candidate);
    }
    if (value < 0) {
        var grayscale = true;
        value *= -1;
    }
    var colorTable = [];
    var relativeStages = document.getElementById('intervalCount').value;
    if (!useAbsoluteValue) {
        var min =
            parseInt(document.getElementById('precentageMinSlide').value) / 100;
        var max =
            parseInt(document.getElementById('precentageMaxSlide').value) / 100;
        var diff = max - min;

        var colorTableOther = interpolateColor(
            '#bbbbbb',
            '#222222',
            relativeStages,
        );

        //jeśli nie ma kandydatów = jest to frekwencja lub porównanie zmian
        if (!candidate) {
            if (grayscale) {
                for (var i = 0; i < relativeStages - 1; i++) {
                    if (value <= min + (diff / relativeStages) * (i + 1)) {
                        return colorTableOther[i];
                    }
                }
                return colorTable[colorTableOther.length - 1];
            }
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
            '#ffc6c6',
            '#aa0000',
            relativeStages,
        );
        var colorTableRight = interpolateColor(
            '#ddddff',
            '#000099',
            relativeStages,
        );
        var colorTableCenter = interpolateColor(
            '#f8f8b0',
            '#504611',
            relativeStages,
        );
        //--------var colorTableOther = interpolateColor(...){...}

        //ten fragment powinien zwracać kolor biały, gdy wynik kandydata mieści się w odchyleniu (to znaczy: różnica między dwoma kandydatami jest minimalna)
        //
        //jest szansza że będzie trzeba przerobić / dodać nową funkcjonalność
        //if (value < 0.52) return '#ffffff';
        //
        if (
            marginalWinsValue != 0 &&
            value < 0.5 + marginalWinsValue / 2 / 100
        ) {
            //console.log(marginalWinsValue, 0.5 + marginalWinsValue / 100);
            return '#ff9100';
        }
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

export function getColorForX(
    x,
    y,
    minX = -50,
    maxX = 50,
    minY = 0,
    maxY = 100,
) {
    const t = (x - minX) / (maxX - minX); // 0..1
    const ty = (y - minY) / (maxY - minY);
    const r = Math.round(255 * (1 - t));
    const g = 0;
    const b = Math.round(255 * t);
    const a = ty;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
