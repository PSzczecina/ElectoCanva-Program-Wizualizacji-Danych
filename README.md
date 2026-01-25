w.i.p.

Projekt na potrzeby projektu licencjackiego

## ElectoCanva - Program wizualizacji danych

Repozytorium zawiera aplikację webową prezentującą wyniki wyborów w Polsce oraz pozwalającą na przystępną analizę różnych aspektów poszczególnych wyborów (frekwencja względna/bezwzględna, najpopularniejszy kandydat w gminach/powiatach/województwach, etc.), jak i porównanie różnic/zmian między różnymi wyborami (np. Wzrost/spadek przewagi głosów między parlamentarnymi 2023 a prezydenckimi 2025)

W aplikacji wykorzystano technologie webowe (HTML, CSS, JS) oraz biblioteki Leaflet i Chart.js.

Oryginalne dane, dostępne na stronie Państwowej Komisji Wyborczej https://danewyborcze.kbw.gov.pl/indexc4fa.html?title=Strona\_g%C5%82%C3%B3wna ,

zostały przekonwertowane i usystematyzowane z xls/xlsx do plików Json za pomocą kodu w Pythonie, z Biblioteką Pandas.

W projekcie wykorzystano pliki Json gmin, powiatów i województw z repozytorium dostępnego na GitHubie: https://github.com/jusuff/PolandGeoJson .

# Projekt jest nadal w.i.p. Mogą występować błędy.

W celu uruchomienia aplikacji, na stan 18.01.2026, uruchamiany jest liveserver w visual studio code.
