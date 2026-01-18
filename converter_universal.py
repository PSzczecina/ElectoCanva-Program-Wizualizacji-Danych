import pandas as pd
import json
import os
import math

WojewodztwaTERYT = {
    '02': "Dolnośląskie",
    '04': "Kujawsko-Pomorskie",
    '06': "Lubelskie",
    '08': "Lubuskie",
    '10': "Łódzkie",
    '12': "Małopolskie",
    '14': "Mazowieckie",
    '16': "Opolskie",
    '18': "Podkarpackie",
    '20': "Podlaskie",
    '22': "Pomorskie",
    '24': "Śląskie",
    '26': "Świętokrzyskie",
    '28': "Warmińsko-Mazurskie",
    '30': "Wielkopolskie",
    '32': "Zachodnio-Pomorskie"
}

def convertToJson(year, electionType, candidateNumber, dataFilePath, attributeList, newFileName, saveDirectory = "", round=1):
    """
    konwertuje dane z xls/csv na Json

    year - rok wyborów

    electionType - rodzaj wyborów

    candidateNumber - liczba kandydatów/partii w wyborach

    filePath - ścieżka do pliku do konwersji

    attributeList - lista nazw kolumn z danymi wyborczymi. Kolejno: uprawnieni do głosu - wydane karty(obecni)- głosy ważne

    round - runda wyborów (głównie w przypadku prezydenckich)

    saveDirectory - ścieżka do folderu zapisu. Gdy brak, domyślnie zapisuje w folderze konwerteru
    """
    if not candidateNumber or not year or not electionType:
        print("błąd - brakuje parametru/ów \n\n parametry kolejno: rok; typ wyborów; liczba kandydatów; ścieżka do pliku; lista atrybutów; tura (gdy obecna)")
        return

    
    dataImport = pd.read_excel(dataFilePath)

    #definicja nowego elementu
    newJsonData = dict()
    newJsonData["rodzaj_wyborów"]=electionType
    if electionType == 'prezydenckie':
        newJsonData["tura"]=round
    newJsonData["rok"]=year
    #dodawanie kandydatów jako oddzielnego elementu w Json, poza samymi TERYTami
    candidates = list()
    for i in range(1, candidateNumber+1):
        candidates.append(dataImport.columns[-i])
    newJsonData["kandydaci"] = candidates

    for i in range(len(dataImport.index)):
        tercCode = dataImport.loc[i,"TERYT"].item()
        print(type(tercCode), tercCode)
        if not math.isnan(tercCode):
            tercCode = int(tercCode)
            if len(str(tercCode)) ==5:tercCode = "0"+str(tercCode)

            newEntry = {
                "liczba_wyborców_uprawnionych": dataImport.loc[i, attributeList[0]].item(),
                "liczba_wyborców_obecnych": dataImport.loc[i, attributeList[1]].item(),
                "łączna_ilość_głosów": dataImport.loc[i, attributeList[2]].item(),
            }
            for j in range(1, candidateNumber+1):
                x = dataImport.loc[i,dataImport.columns[-j]]
                if type(x) != int and type(x) != str:
                    x = x.item()
                newEntry[dataImport.columns[-j]] = x
            newJsonData[tercCode] = newEntry

    #print(os.getcwd())
    with open(os.path.join(saveDirectory, newFileName), "w", encoding="utf-8") as f:
        f.write(json.dumps(newJsonData, ensure_ascii=False,indent=4))
    print(f"\n{newFileName} został utworzony.")

#niekiedy trzeba było jeszcze zedytować pliki xls/xlsx. na przykład - w różnych plikach różnie była kolumna TERYT zapisywana (nr. gminy, kod TERYT, TERYT gminy, etc.) 
#do dorobienia - oczyszczenie/ustandaryzowanie nazw partii (w jednych plikach jest 'nazwapartii', w innych 'KOMITET WYBORCZY NAZWAPARTII') nazw 

#prezydenckie
"""
convertToJson(2005, 
              'prezydenckie', 
              2, 
              "prezydenckie/2005/2 tura/prezydenckie2005_2tura_gminy.xls", 
              ["Uprawnieni do głosowania", "Wydane karty do głosowania", "Głosy ważne"], 
              "2005_prezy_2tura.json",
              "results",
              2)
convertToJson(2005, 
              'prezydenckie', 
              12, 
              "prezydenckie/2005/1 tura/prezydenckie2005_1tura_gminy.xls", 
              ["Uprawnieni do głosowania", "Wydane karty do głosowania", "Głosy ważne"], 
              "2005_prezy_1tura.json",
              "results",
              1)
convertToJson(
    year=2010,
    electionType='prezydenckie',
    candidateNumber=10,
    dataFilePath="prezydenckie/2010/1 tura/pzt2010-wyn-gmn.xls",
    attributeList=["Uprawnieni do głosowania", "Wydane karty do głosowania", "Głosy ważne"],
    newFileName="2010_prezy_1tura.json",
    saveDirectory="results",
    round=1
)
convertToJson(
    year=2010,
    electionType='prezydenckie',
    candidateNumber=2,
    dataFilePath="prezydenckie/2010/2 tura/pzt2010-wyn-gmn.xls",
    attributeList=["Uprawnieni do głosowania", "Wydane karty do głosowania", "Głosy ważne"],
    newFileName="2010_prezy_2tura.json",
    saveDirectory="results",
    round=2
)
convertToJson(
    year=2015,
    electionType='prezydenckie',
    candidateNumber=11,
    dataFilePath="prezydenckie/2015/1 tura/prez2015_1_tura_gm.xls",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
    newFileName="2015_prezy_1tura.json",
    saveDirectory="results",
    round=1
)
convertToJson(
    year=2015,
    electionType='prezydenckie',
    candidateNumber=2,
    dataFilePath="prezydenckie/2015/2 tura/prez2015_2_tura_gm.xls",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
    newFileName="2015_prezy_2tura.json",
    saveDirectory="results",
    round=2
)
convertToJson(
    year=2020,
    electionType='prezydenckie',
    candidateNumber=11,
    dataFilePath="prezydenckie/2020/1 tura/wyniki_gl_na_kand_po_gminach_utf8.xlsx",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
    newFileName="2020_prezy_1tura.json",
    saveDirectory="results",
    round=1
)
convertToJson(
    year=2020,
    electionType='prezydenckie',
    candidateNumber=2,
    dataFilePath="prezydenckie/2020/2 tura/wyniki_gl_na_kand_po_gminach_utf8.xlsx",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
    newFileName="2020_prezy_2tura.json",
    saveDirectory="results",
    round=2
)
"""
convertToJson(
    year=2025,
    electionType='prezydenckie',
    candidateNumber=13,
    dataFilePath="prezydenckie/2025/1 tura/wyniki_gl_na_kandydatow_po_gminach_utf8.xlsx",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania w lokalu wyborczym", "Liczba kart ważnych"],
    newFileName="2025_prezy_1tura.json",
    saveDirectory="results",
    round=1
)
convertToJson(
    year=2025,
    electionType='prezydenckie',
    candidateNumber=2,
    dataFilePath="prezydenckie/2025/2 tura/wyniki_gl_na_kandydatow_po_gminach_w_drugiej_turze_utf8.xlsx",
    attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania w lokalu wyborczym", "Liczba kart ważnych"],
    newFileName="2025_prezy_2tura.json",
    saveDirectory="results",
    round=2
)

#parlamentarne
"""
convertToJson(year=2005,
              electionType="parlamentarne",
              candidateNumber=18,
              dataFilePath="../parlamentarne/2005/1456225675_36795.xls",
              attributeList=["Uprawnieni do głosowania", "Karty wydane (frekwencja)", "Głosy ważne"],
              newFileName="2005_parla_sejm.json",
              saveDirectory="parlamentarne")
convertToJson(year=2007,
              electionType="parlamentarne",
              candidateNumber=10,
              dataFilePath="../parlamentarne/2007/sejm2007-gm-listy.xls",
              attributeList=["Upr.", "Frekw.", "Ważne"],
              newFileName="2007_parla_sejm.json",
              saveDirectory="parlamentarne")
convertToJson(year=2011,
              electionType="parlamentarne",
              candidateNumber=11,
              dataFilePath="../parlamentarne/2011/2011-gl-lis-gm.xls",
              attributeList=["Liczba uprawnionych do głosowania", "Liczba kart wydanych", "Głosy ważne"],
              newFileName="2011_parla_sejm.json",
              saveDirectory="parlamentarne")
convertToJson(year=2015,
              electionType="parlamentarne",
              candidateNumber=17,
              dataFilePath="../parlamentarne/2015/2015-gl-lis-gm.xls",
              attributeList=["Liczba wyborców", "Wydane karty", "Karty ważne"],
              newFileName="2015_parla_sejm.json",
              saveDirectory="parlamentarne")
convertToJson(year=2019,
              electionType="parlamentarne",
              candidateNumber=10,
              dataFilePath="../parlamentarne/2019/wyniki_gl_na_listy_po_gminach_sejm.xlsx",
              attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
              newFileName="2019_parla_sejm.json",
              saveDirectory="parlamentarne")
convertToJson(year=2023,
              electionType="parlamentarne",
              candidateNumber=12,
              dataFilePath="../parlamentarne/2023/wyniki_gl_na_listy_po_gminach_sejm_utf8.xlsx",
              attributeList=["Liczba wyborców uprawnionych do głosowania", "Liczba wyborców, którym wydano karty do głosowania", "Liczba kart ważnych"],
              newFileName="2023_parla_sejm.json",
              saveDirectory="parlamentarne")
"""




# krok po kroku:
# 1. wyciągnij kandydatów/partie (pewnie będzie trzeba podać na początku ile kandydatów było w danych wyborach)
# 2. kolejno idź po wierszach oryginalnego pliku
# 3. gdy wykryto nowe województwo - stwórz nowy atrybut w JSONie
# 4. gdy wykryto nowy powiat - stwórz nowy atrybut w JSONie w województwie
# 5. gdy wykryto nową gminę - stwórz nowy atrybut w JSONie w powiecie