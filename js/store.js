class CurrentData {
    areaData;
    administrativeNames;
    electionData1;
    electionData1CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    electionData1MinDensity;
    electionData1MaxDensity;
    electionData1MinPopulation;
    electionData1MaxPopulation;

    electionData2;
    electionData2CandidateGrouping = {
        prawica: [],
        centrum: [],
        lewica: [],
        inni: [],
    };
    electionData2MinDensity;
    electionData2MaxDensity;
    electionData2MinPopulation;
    electionData2MaxPopulation;
    geoJsonType;
    geoJson;
    dataCurrentlyAnalysed;
}

export const currentData = new CurrentData();
