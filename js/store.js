class CurrentData {
    areaData;
    electionData1;
    electionData1CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    electionData1MinPopulation;
    electionData1MaxPopulation;
    electionData1AveragePopulation;

    electionData2;
    electionData2CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    electionData2MinPopulation;
    electionData2MaxPopulation;
    geoJsonType;
    geoJson;
    dataCurrentlyAnalysed;
}

export const currentData = new CurrentData();
