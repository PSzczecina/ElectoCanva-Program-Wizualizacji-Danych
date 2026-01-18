export function colorRegion(
    value,
    colorBegin,
    colorEnd,
    isAbsoluteValues = false
) {
    //console.log(colorBegin, colorEnd);
    var colorTable = [];
    if (isAbsoluteValues == false) {
        var min =
            parseInt(document.getElementById('precentageMinSlide').value) / 100;
        var max =
            parseInt(document.getElementById('precentageMaxSlide').value) / 100;
        var relativeStages = document.getElementById('intervalCount').value;
        var diff = max - min;

        colorTable = interpolateColor(colorBegin, colorEnd, relativeStages);
        //for (var i = 0; i < relativeStages; i++) {
        //    rangeTable[i] = min + (diff / relativeStages) * i;
        //}
        //console.log(colorTable);
        for (var i = 0; i < relativeStages - 1; i++) {
            //console.log(value);
            if (value <= min + (diff / relativeStages) * (i + 1)) {
                //console.log(colorTable[i], value);
                return colorTable[i];
            }
        }
        return colorTable[colorTable.length - 1];
    }
    return value > 0.75
        ? '#aa0000'
        : value > 0.5
        ? '#ff4444'
        : value > 0.25
        ? '#ff8888'
        : '#FFCCCC';
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
