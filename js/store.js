class CurrentData {
    electionData1;
    electionData2;
    electionData1CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    electionData2CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    geoJsonType;
    geoJson;
    dataCurrentlyAnalysed;
}

export const currentData = new CurrentData();
