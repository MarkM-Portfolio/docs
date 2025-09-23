/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Wszystkie formuły",
	LABEL_FORMULA_LIST: "Lista formuł:",
	formula:{
	ABS:{	
	    Syntax:"${0}(liczba)",
	    Disp:"Zwraca wartość bezwzględną podanej liczby."
    },
    ACOS:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca wartość arcus cosinus liczby. Kąt jest zwracany w radianach."
    },
    ACOSH:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca arcus cosinus hiperboliczny liczby."
    },
    ACOT:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca arcus cotangens liczby. Kąt jest wyrażany w radianach."
    },
    ACOTH:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca arcus cotangens hiperboliczny liczby."
    },
    ADDRESS:{
         Syntax:"${0}(wiersz${1} kolumna${1} [abs]${1} [a1]${1} [arkusz])",
         Disp:"Zwraca odwołanie do komórki jako tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} – bezwzględne",
        		 result : 1
        	 }, {
        		 label : "${0} – bezwzględny wiersz / względna kolumna",
        		 result : 2
        	 }, {
        		 label : "${0} – względny wiersz / bezwzględna kolumna",
        		 result : 3
        	 }, {
        		 label : "${0} – względne",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} – styl R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} – styl A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(wartość logiczna 1${1} [wartość logiczna 2]${1}...)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wszystkie argumenty mają wartość PRAWDA."
    },
    ASIN:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca wartość arcus sinus liczby. Kąt jest zwracany w radianach."
    },
    ASINH:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca arcus sinus hiperboliczny liczby."
    },
    ATAN:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca wartość arcus tangens liczby. Kąt jest zwracany w radianach."
    },
    AVERAGE:{    
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca średnią argumentów."
    },
    AVERAGEA:{    
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca średnią z próbki. Wartość funkcji dla tekstu jest równa zero."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(zakres${1} kryteria${1} [zakres_liczenia_średniej])",
    	Disp:"Zwraca średnią (arytmetyczną) argumentów, które spełniają podany warunek."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(zakres_liczenia_średniej${1} zakres_kryteriów1${1} kryteria1${1}...)",
    	Disp:"Zwraca średnią (arytmetyczną) argumentów, które spełniają wiele warunków."
    },
    ATAN2:{
    	Syntax:"${0}(liczba_x${1} liczba_y)",
    	Disp:"Zwraca arcus tangens lub odwrotny tangens określonych współrzędnych x i y. Arcus tangens to kąt od osi x do linii zawierającej punkt początkowy (0, 0) i punkt o współrzędnych (liczba_x, liczba_y)."
    },
    ATANH:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca arcus tangens hiperboliczny liczby. Wartość liczby musi być w zakresie od -1 do 1 (z wyłączeniem -1 i 1)."
    },
    BASE:{    
    	Syntax:"${0}(liczba${1} podstawa${1} [minimalna długość])",
    	Disp:"Przekształca dodatnią liczbę całkowitą w tekst w systemie liczbowym o podanej podstawie."
    },
    BIN2DEC:{
    	Syntax:"${0}(liczba)",
    	Disp:"Przekształca liczbę dwójkową w dziesiętną."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę dwójkową w szesnastkową."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę dwójkową w ósemkową."
    },
    CEILING:{  
    	Syntax: "${0}(liczba${1} przyrost)",
    	Disp:"Zaokrągla podaną liczbę do najbliższej liczby całkowitej lub wielokrotności parametru przyrostu."
    },
    CHAR: {
    	Syntax: "${0}(liczba)",
    	Disp: "Zwraca znak odwzorowywany przez liczbę. Wyszukuje znak na mapie znaków kodu Unicode. Liczba należy do przedziału od 1 do 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} wartość1${1} [wartość2]${1}...)",
    	Disp: "Wyszukuje i zwraca odpowiednią wartość na podstawie indeksu. Można wybierać spośród maksymalnie 30 wartości."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Zwraca kod liczbowy pierwszego znaku łańcucha tekstowego."
    },
    COLUMN:{    
    	Syntax:"${0}([odwołanie])",
    	Disp:"Zwraca wewnętrzny numer kolumny podanego odwołania."
    },
    COLUMNS:{    
    	Syntax:"${0}(tablica)",
    	Disp:"Zwraca liczbę kolumn w tablicy lub odwołaniu."
    },
    COMBIN:{
    	Syntax:"${0}(liczba${1} wybrana_liczba)",
    	Disp:"Zwraca liczbę kombinacji dla wybranej liczby elementów. Użyj wartości ${0} do określenia łącznej możliwej liczby grup dla podanej liczby elementów."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1}...)",
    	Disp:"Łączy kilka ciągów tekstowych w jeden łańcuch."
    },
    CONVERT:{
    	Syntax:"${0}(liczba${1} jednostka_źródłowa${1} jednostka_docelowa)",
    	Disp:"Przekształca liczbę między różnymi systemami miar.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} – gram",
       		 result : "g"
       	 }, {
       		 label : "${0} – slug",
       		 result : "sg"
       	 }, {
       		 label : "${0} – funt masy (avoirdupois)",
       		 result : "lbm"
       	 }, {
       		 label : "${0} – U (jednostka masy atomowej)",
       		 result : "u"
       	 }, {
       		 label : "${0} – uncja (avoirdupois)",
       		 result : "ozm"
       	 }, {
       		 label : "${0} – metr",
       		 result : "m"
       	 }, {
       		 label : "${0} – mila statutowa",
       		 result : "mi"
       	 }, {
       		 label : "${0} – cal",
       		 result : "in"
       	 }, {
       		 label : "${0} – stopa",
       		 result : "ft"
       	 }, {
       		 label : "${0} – jard",
       		 result : "yd"
       	 }, {
       		 label : "${0} – angstrom",
       		 result : "ang"
       	 }, {
       		 label : "${0} – pica",
       		 result : "pica"
       	 }, {
       		 label : "${0} – rok",
       		 result : "yr"
       	 }, {
       		 label : "${0} – dzień",
       		 result : "day"
       	 }, {
       		 label : "${0} – godzina",
       		 result : "hr"
       	 }, {
       		 label : "${0} – minuta",
       		 result : "mn"
       	 }, {
       		 label : "${0} – sekunda",
       		 result : "sec"
       	 }, {
       		 label : "${0} – paskal",
       		 result : "Pa"
       	 }, {
       		 label : "${0} – atmosfera",
       		 result : "atm"
       	 }, {
       		 label : "${0} – milimetr słupka rtęci (Tor)",
       		 result : "mmHg"
       	 }, {
       		 label : "${0} – niuton",
       		 result : "N"
       	 }, {
       		 label : "${0} – dyna",
       		 result : "dyn"
       	 }, {
       		 label : "${0} – funt-siła",
       		 result : "lbf"
       	 }, {
       		 label : "${0} – dżul",
       		 result : "J"
       	 }, {
       		 label : "${0} – erg",
       		 result : "e"
       	 }, {
       		 label : "${0} – kaloria międzynarodowa",
       		 result : "cal"
       	 }, {
       		 label : "${0} – elektronovolt",
       		 result : "eV"
       	 }, {
       		 label : "${0} – koniogodzina",
       		 result : "HPh"
       	 }, {
       		 label : "${0} – watogodzina",
       		 result : "Wh"
       	 }, {
       		 label : "${0} – stopofunt",
       		 result : "flb"
       	 }, {
       		 label : "${0} – BTU",
       		 result : "BTU"
       	 }, {
       		 label : "${0} – kaloria termodynamiczna",
       		 result : "c"
       	 }, {
       		 label : "${0} – koń mechaniczny",
       		 result : "HP"
       	 }, {
       		 label : "${0} – wat",
       		 result : "W"
       	 }, {
       		 label : "${0} – tesla",
       		 result : "T"
       	 }, {
       		 label : "${0} - gaus",
       		 result : "ga"
       	 }, {
       		 label : "${0} – stopień Celsjusza",
       		 result : "C"
       	 }, {
       		 label : "${0} – stopień Fahrenheita",
       		 result : "F"
       	 }, {
       		 label : "${0} – kelwin",
       		 result : "K"
       	 }, {
       		 label : "${0} – łyżeczka",
       		 result : "tsp"
       	 }, {
       		 label : "${0} – łyżka",
       		 result : "tbs"
       	 }, {
       		 label : "${0} – uncja objętości/pojemności",
       		 result : "oz"
       	 }, {
       		 label : "${0} – szklanka",
       		 result : "cup"
       	 }, {
       		 label : "${0} – pinta (Stany Zjednoczone)",
       		 result : "us_pt"
       	 }, {
       		 label : "${0} – pinta (Wielka Brytania)",
       		 result : "uk_pt"
       	 }, {
       		 label : "${0} – kwarta",
       		 result : "qt"
       	 }, {
       		 label : "${0} – galon",
       		 result : "gal"
       	 }, {
       		 label : "${0} – litr",
       		 result : "I"
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca cosinus podanego kąta."
    },
    COSH:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca cosinus hiperboliczny liczby."
    },
    COT:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca cotangens podanej liczby."
    },
    COTH:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca cotangens hiperboliczny podanej liczby."
    },
    COUNT:{   
    	Syntax:"${0}(wartość1${1} [wartość2]${1}...)",
    	Disp:"Oblicza, ile liczb znajduje się na liście argumentów. Pozycje tekstowe są ignorowane."
    },
    COUNTA:{   
    	Syntax:"${0}(wartość1${1} [wartość2]${1}...)",
    	Disp:"Oblicza, ile wartości znajduje się liście argumentów."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(zakres)",
    	Disp: "Liczy puste komórki w określonym zakresie."
    },
    COUNTIF:{
    	Syntax: "${0}(zakres${1} kryteria)",
    	Disp:"Liczy komórki, które spełniają podany warunek."
    },
    COUNTIFS:{
    	Syntax: "${0}(zakres_kryteriów1${1} kryteria1${1}...)",
    	Disp:"Liczy komórki, które spełniają wiele warunków."
    },
    CUMIPMT:{	
	    Syntax:"${0}(stopa_procentowa${1} liczba_okresów${1} bieżąca_wartość${1} okres_początkowy${1} okres_końcowy${1} typ)",
	    Disp:"Oblicza łączną kwotę odsetek spłacanych między dwoma podanymi okresami."
    },
    CUMPRINC:{	
	    Syntax:"${0}(stopa_procentowa${1} liczba_okresów${1} bieżąca_wartość${1} okres_początkowy${1} okres_końcowy${1} typ)",
	    Disp:"Oblicza łączną kwotę kapitału spłacanego między dwoma podanymi okresami."
    }, 
    DATE:{	
	    Syntax:"${0}(rok${1} miesiąc${1} dzień)",
	    Disp:"Zwraca wewnętrzną liczbę odpowiadającą podanej dacie."
    },  
    DATEDIF:{	
	    Syntax:"${0}(data początkowa${1} data końcowa${1} format)",
	    Disp:"Zwraca czas, jaki upłynął między dwiema datami (w latach, miesiącach lub dniach).",
	    Arguments: {
	    	2 : [{
	    		label: "${0} – liczba pełnych lat w okresie.",
	    		result: "Y"
	    	}, {
	    		label: "${0} – liczba pełnych miesięcy w okresie.",
	    		result: "M"
	    	}, {
	    		label: "${0} – liczba pełnych dni w okresie.",
	    		result: "D"
	    	}, {
	    		label: "${0} - liczba dni między datą początkową a datą końcową (bez miesięcy i lat).",
	    		result: "MD"
	    	}, {
	    		label: "${0} - liczba miesięcy między datą początkową a datą końcową (bez lat).",
	    		result: "YM"
	    	}, {
	    		label: "${0} - liczba dni między datą początkową a datą końcową (bez lat).",
	    		result: "YD"
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Zwraca wewnętrzną liczbę odpowiadającą tekstowi podanemu w postaci zgodnej z formatem czasu."
    }, 
    DAY:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca dzień dla podanej wartości daty. Wynikiem jest liczba całkowita z zakresu od 1 do 31. Wprowadzić można także ujemną wartość daty/godziny."
    },
    DAYS360:{
    	Syntax:"${0}(data początkowa${1} data końcowa${1} [metoda])",
    	Disp:"Oblicza liczbę dni między dwiema datami, zakładając rok liczący 360 dni.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - metoda amerykańska (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} – metoda europejska",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(data początkowa${1} data końcowa${1})",
    	Disp:"Oblicza liczbę dni między dwiema datami."
    },
    DEC2BIN:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę dziesiętną w dwójkową."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"=Przekształca liczbę dziesiętną w szesnastkową."
    },
    DEC2OCT:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę dziesiętną w ósemkową."
    },
    DEGREES:{	
	    Syntax:"${0}(kąt)",
	    Disp:"Służy do przekształcania radianów w stopnie."
    },
    DISC:{
    	Syntax:"${0}(rozliczenie${1} zapadalność${1} cena${1} wykup${1} [podstawa])",
    	Disp:"Oblicza stopę dyskonta dla papieru wartościowego."
    }, 
    DOLLAR:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę w tekst przy użyciu formatu waluty $ (USD)."
    },
    EDATE:{
    	Syntax:"${0}(data_początkowa${1} liczba_miesięcy)",
    	Disp:"Zwraca wartość liczby seryjnej reprezentującej datę, która przypada wskazaną liczbę miesięcy przed lub po podanej dacie początkowej."
    },
    EOMONTH:{
    	Syntax:"${0}(data_początkowa${1} liczba_miesięcy)",
    	Disp:"Zwraca wartość liczby seryjnej reprezentującej ostatni dzień miesiąca, który przypada wskazaną liczbę miesięcy przed lub po podanej dacie początkowej."
    },
    ERFC:{   
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca uzupełniającą funkcję błędu, której obszarem całkowania jest przedział od podanej liczby do nieskończoności."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(odwołanie)",
    	Disp:"Zwraca numer odpowiadający typowi błędu."
//    		,
//    	Arguments: {
//       	 0 : [{
//       		 label : "${0} - #NULL!",
//       		 result : -1
//       	 }, {
//       		 label : "${0} - #DIV/0!",
//       		 result : -2
//       	 }, {
//       		 label : "${0} - #VALUE!",
//       		 result : -3
//       	 }, {
//       		 label : "${0} - #REF!",
//       		 result : -4
//       	 }, {
//       		 label : "${0} - #NAME?",
//       		 result : -5
//       	 }, {
//       		 label : "${0} - #NUM!",
//       		 result : -6
//       	 }, {
//       		 label : "${0} - #N/A",
//       		 result : -7
//       	 }, {
//       		 label : "${0} - #GETTING_DATA",
//       		 result : -8
//       	 }
//       	 ]
//        }
    },    
    EVEN:{   
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca liczbę zaokrągloną w górę do najbliższej parzystej liczby całkowitej."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Porównuje dwa łańcuchy tekstowe i zwraca wartość PRAWDA, jeśli są one identyczne. Ta funkcja rozróżnia wielkość liter."
    },
    EXP:{    
    	Syntax:"${0}(liczba)",
    	Disp: "Zwraca wartość liczby e podniesionej do potęgi określonej przez podaną liczbę."
    },
    FACT:{  
    	Syntax:"${0}(liczba)",
    	Disp:"Oblicza silnię liczby."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca silnię podwójną podanej liczby."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Zwraca wartość logiczną FAŁSZ."
    },
    FIND:{   
    	Syntax:"${0}(tekst wyszukiwany${1} tekst${1} [pozycja])",
    	Disp:"Szuka łańcucha znaków w tekście, rozróżniając wielkość liter."
    },
    FIXED:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku]${1} [bez_przecinków])",
    	Disp:"Formatuje liczbę jako tekst z ustaloną liczbą miejsc po przecinku.",
    	Arguments: {
    		2 : [{
    			label : "${0} – zapobiegaj używaniu przecinków",
    			result : "TRUE"
    		}, {
    			label : "${0} – nie zapobiegaj używaniu przecinków",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(liczba${1} istotność)",
    	Disp:"Zaokrągla liczbę w dół do najbliższej wielokrotności parametru istotności."
    },
    FORMULA:{   
    	Syntax:"${0}(odwołanie)",
    	Disp:"Zwraca formułę komórki."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ListaKolejnychLiczb_dane${1} ListaKolejnychLiczb_pojemniki)",
    	Disp:"Klasyfikuje wartości w okresy i zlicza liczbę wartości w każdym z nich."
    },
    FV:{
    	Syntax:"${0}(stopa_procentowa${1} liczba_okresów${1} płatność${1} [bieżąca_wartość]${1} [typ])",
    	Disp:"Oblicza przyszłą wartość inwestycji po zastosowaniu stałej stopy procentowej."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(kapitał${1} stopy_procentowe)",
        Disp:"Oblicza przyszłą wartość kapitału początkowego po zastosowaniu serii stóp procentowych i procentu składanego."
    },
    GAMMALN:{   
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca wartość logarytmu naturalnego funkcji gamma."
    },
    GCD:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
        Disp:"Zwraca największy wspólny dzielnik wszystkich argumentów."
    },
    HEX2BIN:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę szesnastkową w dwójkową."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(liczba)",
    	Disp:"Przekształca liczbę szesnastkową w dziesiętną."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę szesnastkową w ósemkową."
    },
    HOUR:{   
    	Syntax:"${0}(liczba)",
    	Disp:"Określa godzinę w dobie (0-23) na podstawie wartości godzinowej."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kryteria_wyszukiwania${1} tablica${1} indeks${1} [sortowanie])",
    	Disp:"Wyszukiwanie poziome i odwołanie do komórek znajdujących się poniżej.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - przybliżona zgodność",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - dokładna zgodność",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(odsyłacz${1} [tekst_komórki])",
    	Disp:"Zwraca odsyłacz, który wskazuje zasób sieciowy lub zakres przywoływany przez ten odsyłacz. Opcjonalnie, jeśli podano tekst_komórki, wyświetla go. W przeciwnym razie wyświetla odsyłacz jako tekst."
    },    
    IF:{    
    	Syntax:"${0}(test_logiczny${1} [wartość_dla_prawdy]${1} [wartość_dla_fałszu])",
    	Disp:"Definiuje test logiczny, który ma zostać wykonany."
    },
    IFS:{
    	Syntax:"${0}(test1${1} wartość_dla_prawdy1${1} ...)",
    	Disp:"Wykonuje testy logiczne, aby sprawdzić, czy jest spełniony jeden lub więcej warunków, a następnie zwraca wartość, która jest zgodna z pierwszym spełnionym warunkiem."
    },
    IFERROR:{
    	Syntax:"${0}(wartość${1} wartość_dla_błędu)",
    	Disp:"Zwraca podaną wartość, jeśli wyrażenie zwraca błąd. W przeciwnym razie zwraca wynik wyrażenia."
    },
    IFNA:{
    	Syntax:"${0}(wartość${1} wartość_dla_Nie_dotyczy)",
    	Disp:"Zwraca podaną wartość, jeśli wyrażenie zwraca błąd #N/A (Nie dotyczy). W przeciwnym razie zwraca wynik wyrażenia."
    },
    INDEX:{    
    	Syntax:"${0}(odwołanie${1} wiersz${1} [kolumna]${1} [zakres])",
    	Disp:"Zwraca odwołanie do komórki z podanego zakresu."
    },
    INDIRECT:{    
    	Syntax:"${0}(odwołanie${1} [styl_odwołania])",
    	Disp:"Zwraca zawartość komórki podanej jako odwołanie w postaci tekstu.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} – styl R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} – styl A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zaokrągla liczbę w dół do najbliższej liczby całkowitej."
    },
    IPMT:{
    	Syntax:"${0}(stopa_procentowa${1} okres${1} liczba_okresów${1} bieżąca_wartość${1} [przyszła_wartość]${1} [typ])",
    	Disp:"Oblicza kwotę spłaty odsetek w przypadku podanego okresu dla inwestycji opartej na regularnych płatnościach i stałej stopie procentowej."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli przywoływana komórka jest pusta. W przeciwnym razie zwraca wartość FAŁSZ."
    },
    ISERR:{
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość błędu jest różna od #NIE DOTYCZY."
    },
    ISERROR:{
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest dowolną wartością błędu."
    },
    ISEVEN:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest parzysta. W przeciwnym razie zwraca wartość FAŁSZ." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(odwołanie)",
    	Disp:"Zwraca wartość PRAWDA, jeśli komórka jest komórką formuły."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest wartością logiczną."
    },
    ISNA:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartością błędu jest #NIE DOTYCZY."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość nie jest tekstem."
    },
    ISNUMBER:{   
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest liczbą."
    },
    ISODD:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest nieparzystą liczbą całkowitą."
    },
    ISPMT:{
    	Syntax:"${0}(stopa_procentowa${1} okres${1} liczba_okresów${1} bieżąca_wartość)",
    	Disp:"Oblicza kwotę odsetek spłacanych podczas podanego okresu inwestycji."
    }, 
    ISREF:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest odwołaniem."
    },
    ISTEXT:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Zwraca wartość PRAWDA, jeśli wartość jest tekstem."
    },
    LARGE:{
        Syntax:"${0}(tablica${1} n-ta pozycja)",
    	Disp:"Zwraca n-tą największą wartość ze zbioru wartości."
    },
    LCM:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
        Disp:"Zwraca najmniejszą wspólną wielokrotność wszystkich liczb z podanej listy."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [długość])",
    	Disp:"Zwraca podana liczbę znaków od początku tekstu."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Zwraca długość łańcucha tekstowego."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Zwraca liczbę bajtów łańcucha tekstowego."
    },
    LN:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca logarytm naturalny podanej liczby."
    },
    LOG:{
    	Syntax:"${0}(liczba${1} [podstawa])",
    	Disp:"Zwraca logarytm o określonej podstawie z danej liczby."
    },
    LOG10:{
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca dla podanej liczby logarytm dziesiętny."
    },
    LOOKUP:{
    	Syntax: "${0}(kryterium wyszukiwania${1} przeszukiwany wektor${1} [wektor wynikowy])",
    	Disp:"Określa składową wektora przez porównanie ze składowymi innego wektora."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Przekształca wszystkie litery w tekście w małe litery."
    },    
    MATCH:{    
    	Syntax: "${0}(kryterium wyszukiwania${1} przeszukiwana tablica${1} [typ])",
    	Disp:"Wyznacza pozycję w tablicy po porównaniu wartości.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} – mniejsze niż",
         		 result : 1
         	 }, {
         		 label : "${0} - dokładna zgodność",
         		 result : 0
         	 }, {
         		 label : "${0} – większe niż",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca maksymalną wartość z listy argumentów."
    },
    MEDIAN:{    
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca wartość środkową, jeśli zostanie podana nieparzysta liczba wartości. W przeciwnym razie zwraca średnią arytmetyczną dwóch wartości środkowych."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} liczba${1} liczba)",
    	Disp:"Zwraca podaną liczbę znaków z podanego łańcucha tekstowego."
    }, 
    MIN:{    
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca minimalną wartość z listy argumentów."
    },    
    MINUTE:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Określa minutę w godzinie (0-59) na podstawie wartości godzinowej."
    },    
    MOD:{    
    	Syntax:"${0}(dzielna${1} dzielnik)",
    	Disp:"Zwraca resztę z dzielenia dzielnej przez dzielnik."
    },
    MODE:{    
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca najczęściej występującą wartość w próbce."
    },
    MONTH:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca miesiąc wybranej wartości daty. Wynikiem jest liczba całkowita z zakresu od 1 do 12."
    },
    MROUND:{   
    	Syntax: "${0}(liczba${1} wielokrotność)",
        Disp:"Zwraca liczbę zaokrągloną do podanej wielokrotności."
    },
    MMULT:{    
    	Syntax:"${0}(tablica${1} tablica)",
    	Disp:"Mnożenie macierzy. Zwraca iloczyn dwóch macierzy."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
        Disp:"Zwraca stosunek silni sumy zbioru liczb do iloczynu silni."
    },
    N:{    
    	Syntax:"${0}(wartość)",
    	Disp:"Przekształca wartość w liczbę."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Zwraca wartość błędu #NIE DOTYCZY."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(data początkowa${1} data końcowa${1} [dni wolne od pracy])",
    	Disp:"Zwraca liczbę dni roboczych między dwiema datami."
    },
    NOT:{    
    	Syntax:"${0}(wartość logiczna)",
    	Disp:"Odwraca wartość argumentu."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Określa bieżącą godzinę systemową."
    },
    NPV:{   
    	Syntax:"${0}(stopa_procentowa${1} wartość_1${1} [wartość_2]${1} ...)",
        Disp:"Oblicza bieżącą wartość netto inwestycji dla serii przyszłych płatności przy podanej stopie dyskonta."
    },
    OCT2BIN:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę ósemkową w dwójkową."
    },
    OCT2DEC:{
    	Syntax:"${0}(liczba)",
    	Disp:"Przekształca liczbę ósemkową w dziesiętną."
    },
    OCT2HEX:{
    	Syntax:"${0}(liczba${1} [miejsca_po_przecinku])",
    	Disp:"Przekształca liczbę ósemkową w szesnastkową."
    },
    ODD:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zaokrągla liczbę w górę do następnej nieparzystej liczby całkowitej (\"w górę\" oznacza \"poza 0\")."
    },
    OFFSET:{
    	Syntax:"${0}(odwołanie${1} wiersze${1} kolumny${1} [wysokość]${1} [szerokość])",
    	Disp:"Zwraca odwołanie do zakresu będącego podaną liczbą wierszy i kolumn z komórki lub zakresu komórek."
    },
    OR:{    
    	Syntax:"${0}(wartość logiczna 1${1} [wartość logiczna 2]${1}...)",
    	Disp:"Zwraca wartość PRAWDA, jeśli co najmniej jeden argument ma wartość PRAWDA."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Zwraca przybliżoną wartość liczby pi."
    },
    PMT:{
    	Syntax:"${0}(stopa_procentowa${1} liczba_okresów${1} bieżąca_wartość${1} [przyszła_wartość]${1} [typ])",
    	Disp:"Zwraca płatność dla pożyczki opartej na regularnych płatnościach i stałej stopie procentowej."
    },
    POWER:{    
    	Syntax:"${0}(podstawa${1} potęga)",
    	Disp:"Podaje wartość liczby podniesionej do potęgi."
    },
    PPMT:{
    	Syntax:"${0}(stopa_procentowa${1} okres${1} liczba_okresów${1} bieżąca_wartość${1} [przyszła_wartość]${1} [typ])",
    	Disp:"Oblicza kwotę spłaty w przypadku podanego okresu dla inwestycji opartej na regularnych płatnościach i stałej stopie procentowej."
    },
    PRICEDISC:{
    	Syntax:"${0}(rozliczenie${1} zapadalność${1} dyskonto${1} wykup${1} [podstawa])",
    	Disp:"Oblicza cenę za 100 jednostek wartości nominalnej dyskontowanego papieru wartościowego."
    },
    PRICEMAT:{
    	Syntax:"${0}(rozliczenie${1} zapadalność${1} emisja${1} stopa_procentowa${1} rentowność${1} [podstawa])",
    	Disp:"Oblicza cenę za 100 jednostek wartości nominalnej papieru wartościowego, w przypadku którego odsetki są płacone po osiągnięciu daty zapadalności."
    },
    PRODUCT:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Mnoży wszystkie liczby podane jako argumenty i zwraca ich iloczyn."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Dokonuje konwersji łańcucha tekstowego na litery właściwej wielkości; pierwszą literę w każdym słowie na wielką literę, a wszystkie inne litery na małe litery."
    },
    PV:{
    	Syntax:"${0}(stopa_procentowa${1} liczba_okresów${1} płatność${1} [przyszła_wartość]${1} [typ])",
    	Disp:"Oblicza bieżącą wartość inwestycji na podstawie serii przyszłych płatności."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(licznik${1} mianownik)",
        Disp:"Zwraca wynik dzielenia jednej liczby przez inną liczbę (skrócony do liczby całkowitej)."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Zwraca liczbę losową z zakresu od 0 do 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(dolne ograniczenie${1} górne ograniczenie)",
    	Disp: "Zwraca liczbę losową z przedziału między podanymi wartościami."
    },
    RANK:{    
    	Syntax:"${0}(liczba${1} odwołanie${1} [porządek])",
    	Disp: "Zwraca pozycję wartości w próbce.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} – malejąco",
          		 result : 0
          	 }, {
          		 label : "${0} – rosnąco",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(rozliczenie${1} zapadalność${1} inwestycja${1} dyskonto${1} [podstawa])",
    	Disp:"Oblicza kwotę otrzymywaną po osiągnięciu daty zapadalności papieru wartościowego całkowicie ulokowanego."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} pozycja${1} długość${1} nowy tekst)",
    	Disp:"Zastępuje znaki z łańcucha tekstowego innym łańcuchem tekstowym."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} liczba miejsc)",
    	Disp:"Powtarza tekst podaną liczbę razy."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [liczba])",
    	Disp:"Zwraca ostatni znak lub ostatnie znaki tekstu."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [liczba])",
    	Disp:"Zwraca ostatni znak lub ostatnie znaki tekstu."
    },
    ROUND:{   
    	Syntax: "${0}(liczba${1} liczba miejsc)",
    	Disp:"Zaokrągla liczbę z określoną dokładnością."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(liczba${1} liczba miejsc)",
    	Disp:"Zaokrągla liczbę w dół z określoną dokładnością."
    },
    ROUNDUP:{   
    	Syntax: "${0}(liczba${1} liczba miejsc)",
    	Disp:"Zaokrągla liczbę w górę z określoną dokładnością."
    },
    ROW:{   
    	Syntax:"${0}([odwołanie])",
    	Disp:"Wyznacza wewnętrzny numer wiersza w odwołaniu."
    },
    ROWS:{   
    	Syntax:"${0}(tablica)",
    	Disp:"Zwraca liczbę kolumn w tablicy lub odwołaniu."
    },
    RADIANS:{   
    	Syntax:"${0}(kąt)",
    	Disp:"Przekształca stopnie w radiany."
    },
    ROMAN:{   
    	Syntax:"${0}(liczba${1} [forma])",
    	Disp:"Przekształca liczby arabskie na rzymskie jako tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - klasyczne",
          		 result : 0
          	 }, {
          		 label : "${0} - bardziej zwięzłe",
          		 result : 1
          	 }, {
          		 label : "${0} - bardziej zwięzłe",
          		 result : 2
          	 }, {
          		 label : "${0} - bardziej zwięzłe",
          		 result : 3
          	 }, {
          		 label : "${0} – uproszczone",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(tekst wyszukiwany${1} tekst${1} [pozycja])",
    	Disp:"Szuka łańcucha znaków w tekście, nie rozróżniając wielkich i małych liter."
    },  
    SIGN:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca znak liczby."
    },
    SIN:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca sinus podanego kąta."
    },
    SINH:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca sinus hiperboliczny liczby."
    },
    SECOND:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Określa sekundę w minucie (0-59) na podstawie wartości godzinowej."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} współczynniki)",
        Disp:"Zwraca sumę szeregu potęgowego na podstawie formuły."
    },
    SHEET:{   
    	Syntax:"${0}([odwołanie])",
    	Disp:"Zwraca wewnętrzny numer arkusza dla odwołania lub łańcucha znaków."
    },
    SMALL:{   
    	Syntax:"${0}(tablica${1} n-ta pozycja)",
    	Disp:"Zwraca n-tą najmniejszą wartość ze zbioru wartości."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} stary${1} nowy${1} [który])",
    	Disp:"Zwraca tekst, w którym stary tekst jest zastąpiony nowym."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcja${1} zakres${1}...)",
    	Disp:"Oblicza sumy pośrednie w arkuszu kalkulacyjnym.",
    	Arguments: {
    		0 : [{
    			label : "${0} – AVERAGE",
    			result : 1
    		}, {
    			label : "${0} – COUNT",
    			result: 2
    		}, {
    			label : "${0} – COUNTA",
    			result: 3
    		}
    		, {
    			label : "${0} – MAX",
    			result: 4
    		}
    		, {
    			label : "${0} – MIN",
    			result: 5
    		}
    		, {
    			label : "${0} – PRODUCT",
    			result: 6
    		}
    		, {
    			label : "${0} – STDEV",
    			result: 7
    		}
    		, {
    			label : "${0} – STDEVP",
    			result: 8
    		}
    		, {
    			label : "${0} – SUM",
    			result: 9
    		}
    		, {
    			label : "${0} – VAR",
    			result: 10
    		}, {
    			label : "${0} – VARP",
    			result: 11
    		}, {
    			label : "${0} – AVERAGE",
    			result: 101
    		}, {
    			label : "${0} – COUNT",
    			result: 102
    		}, {
    			label : "${0} – COUNTA",
    			result: 103
    		}, {
    			label : "${0} – MAX",
    			result: 104
    		}, {
    			label : "${0} – MIN",
    			result: 105
    		}, {
    			label : "${0} – PRODUCT",
    			result: 106
    		}, {
    			label : "${0} – STDEV",
    			result: 107
    		}, {
    			label : "${0} – STDEVP",
    			result: 108
    		}, {
    			label : "${0} – SUM",
    			result: 109
    		}, {
    			label : "${0} – VAR",
    			result: 110
    		}, {
    			label : "${0} – VARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Zwraca sumę wszystkich argumentów."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(tablica 1${1} [tablica 2]${1}...)",
    	Disp:"Zwraca sumę iloczynów argumentów tablicy."
    },
    SUMIF:{   
    	Syntax:"${0}(zakres${1} kryteria${1} [zakres sumowania])",
    	Disp:"Sumuje argumenty, które spełniają podane warunki."
    },
    SUMIFS:{
    	Syntax: "${0}(zakres_sumowania${1} zakres_kryteriów1${1} kryteria1${1}...)",
    	Disp:"Sumuje argumenty, które spełniają wiele warunków."
    },
    SQRT:{   
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca wartość pierwiastka kwadratowego liczby."
    },
    SQRTPI:{   
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca pierwiastek kwadratowy iloczynu podanej liczby i stałej Pi."
    },
    STDEV:
    {
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Oblicza odchylenie standardowe na podstawie próbki."
    },
    STDEVP:
    {
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
    	Disp:"Oblicza odchylenie standardowe dla całej populacji."
    },
    SUMSQ:{
    	Syntax:"${0}(liczba 1${1} [liczba 2]${1}...)",
        Disp:"Zwraca sumę kwadratów liczb podanych na liście."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Przekształca argumenty w tekst."
    },
    TAN:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca tangens podanej liczby."
    },
    TANH:{    
    	Syntax:"${0}(liczba)",
        Disp:"Zwraca tangens hiperboliczny podanej liczby."
    },
    TBILLPRICE:{
    	Syntax:"${0}(rozliczenie${1} zapadalność${1} dyskonto)",
    	Disp:"Oblicza cenę za 100 jednostek wartości nominalnej bonu skarbowego."
    },
    TEXT:{
    	Syntax:"${0}(wartość${1} kod formatowania)",
    	Disp:"Przekształca wartość w tekst zgodnie z regułami kodu formatowania liczby i zwraca wynik przekształcenia."
    },
    TIME:{   
    	Syntax:"${0}(godzina${1} minuta${1} sekunda)",
    	Disp:"Określa wartość godzinową na podstawie podanej godziny, minuty i sekundy."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Zwraca wewnętrzną liczbę odpowiadającą tekstowi podanemu w postaci zgodnej z formatem czasu."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Określa bieżącą datę systemową."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Powoduje usunięcie wszystkich odstępów na początku i na końcu. Każda sekwencja 2 lub większej liczby spacji wewnętrznych jest zastępowana jedną spacją."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Zwraca wartość logiczną PRAWDA."
    },
    TRUNC:{   
    	Syntax:"${0}(liczba${1} [liczba miejsc])",
    	Disp:"Obcina miejsca dziesiętne."
    },
    TYPE:{   
    	Syntax:"${0}(wartość)",
    	Disp:"Definiuje typ danych dla wartości."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Przekształca wszystkie litery tekstu w wielkie."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Przekształca argument tekstowy w liczbę."
    },
    VAR:{    
    	Syntax: "${0}(liczba1${1} [liczba2]${1}...)",
    	Disp:"Powoduje oszacowanie wariancji na podstawie próbki."
    },
    VARA:{    
    	Syntax: "${0}(liczba1${1} [liczba2]${1}...)",
    	Disp:"Powoduje oszacowanie wariancji na podstawie próbki z uwzględnieniem liczb, tekstu i wartości logicznych."
    },
    VARP:{    
    	Syntax: "${0}(liczba1${1} [liczba2]${1}...)",
    	Disp:"Oblicza wariancję dla całej populacji."
    },
    VARPA:{    
    	Syntax: "${0}(liczba1${1} [liczba2]${1}...)",
    	Disp:"Oblicza wariancję dla całej populacji z uwzględnieniem liczb, tekstu i wartości logicznych."
    },
    VLOOKUP:{    
    	Syntax: "${0}(kryterium wyszukiwania${1} tablica${1} indeks${1} [porządek sortowania])",
    	Disp:"Pionowe wyszukiwanie i odwołanie do wskazanych komórek.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - przybliżona zgodność",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - dokładna zgodność",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(liczba${1} [typ])",
    	Disp:"Zwraca w postaci liczby całkowitej dzień tygodnia dla podanej daty.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – liczby od 1 (niedziela) do 7 (sobota)",
          		 result : 1
          	 }, {
          		 label : "${0} – liczby od 1 (poniedziałek) do 7 (niedziela)",
          		 result : 2
          	 }, {
          		 label : "${0} – liczby od 0 (poniedziałek) do 6 (niedziela)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} – liczby od 1 (poniedziałek) do 7 (niedziela)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} – liczby od 1 (wtorek) do 7 (poniedziałek)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} – liczby od 1 (środa) do 7 (wtorek)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} – liczby od 1 (czwartek) do 7 (środa)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} – liczby od 1 (piątek) do 7 (czwartek)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} – liczby od 1 (sobota) do 7 (piątek)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} – liczby od 1 (niedziela) do 7 (sobota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(liczba${1} [tryb])",
    	Disp:"Oblicza tydzień kalendarzowy odpowiadający podanej dacie.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – niedziela",
          		 result : 1
          	 }, {
          		 label : "${0} – poniedziałek",
          		 result : 2
          		 /*
          	 }, {
          		 label : "${0} - Monday",
          		 result : 11
          	 }, {
          		 label : "${0} - Tuesday",
          		 result : 12
          	 }, {
          		 label : "${0} - Wednesday",
          		 result : 13
          	 }, {
          		 label : "${0} - Thursday",
          		 result : 14
          	 }, {
          		 label : "${0} - Friday",
          		 result : 15
          	 }, {
          		 label : "${0} - Saturday",
          		 result : 16
          	 }, {
          		 label : "${0} - Sunday",
          		 result : 17
          	 }, {
          		 label : "${0} - Monday",
          		 result : 21
          		 */
          	 }
          	 ]
           }
    },
    WORKDAY:{    
    	Syntax:"${0}(data początkowa${1} liczba dni${1} [dni wolne od pracy])",
    	Disp:"Zwraca numer seryjny daty przed podaną liczbą dni roboczych lub po niej."
    },
    XNPV:{   
    	Syntax:"${0}(stopa_procentowa${1} wartości${1} daty)",
    	Disp:"Oblicza bieżącą wartość netto dla płatności wykonywanych w podanych terminach."
    },
    YEAR:{    
    	Syntax:"${0}(liczba)",
    	Disp:"Zwraca rok podanej daty w postaci liczby całkowitej."
    }
}
})

