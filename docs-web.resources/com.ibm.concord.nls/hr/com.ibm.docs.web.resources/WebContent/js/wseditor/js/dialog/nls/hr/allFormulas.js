/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Sve formule",
	LABEL_FORMULA_LIST: "Lista formula:",
	formula:{
	ABS:{	
	    Syntax:"${0}(broj)",
	    Disp:"Vraća apsolutnu vrijednost broja."
    },
    ACOS:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus kosinus broja. Kut se vraća u radijanima."
    },
    ACOSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolni kosinus broja."
    },
    ACOT:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća inverzni kotangens broja. Kut se mjeri u radijanima."
    },
    ACOTH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća inverzni hiperbolni kotangens broja."
    },
    ADDRESS:{
         Syntax:"${0}(red${1} stupac${1} [aps]${1} [a1]${1} [list])",
         Disp:"Vraća referencu ćelije kao tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Apsolutno",
        		 result : 1
        	 }, {
        		 label : "${0} - Apsolutni red / Relativni stupac",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativni red / Apsolutni stupac",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativno",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 stil",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 stil",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logička vrijednost 1${1} [logička vrijednost 2]${1} ...)",
    	Disp:"Vraća TRUE ako su svi argumenti TRUE."
    },
    ASIN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus sinus broja. Kut se vraća u radijanima."
    },
    ASINH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolni sinus broja."
    },
    ATAN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus tangens broja. Kut se vraća u radijanima."
    },
    AVERAGE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosjek argumenata."
    },
    AVERAGEA:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosječnu vrijednost za primjer. Tekst se vrednuje kao nula."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(raspon${1} kriteriji${1} [prosjek_raspona])",
    	Disp:"Vraća prosjek (aritmetičku sredinu) argumenata koji zadovoljavaju dani uvjet."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(prosjek_raspona${1} kriteriji_raspona${1} kriteriji${1} ...)",
    	Disp:"Vraća prosjek (aritmetičku sredinu) argumenata koji zadovoljavaju više uvjeta."
    },
    ATAN2:{
    	Syntax:"${0}(x_broj${1} y_broj)",
    	Disp:"Vraća arkus tangens ili inverzni tangens od navedene x i y koordinate. Arkus tangens je kut od x-osi do pravca kojeg određuje ishodište (0,0) i točka s koordinatama (x_broj, y_broj)."
    },
    ATANH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolni tangens broja. Broj mora biti između -1 i 1 (isključivo -1 i 1)."
    },
    BASE:{    
    	Syntax:"${0}(broj${1} baza${1} [minimalna duljina])",
    	Disp:"Pretvara pozitivni cijeli broj u tekst, iz brojevnog sustava u definiranu bazu."
    },
    BIN2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertira binarni broj u decimalni broj."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira binarni broj u heksadecimalni broj."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira binarni broj u oktalni broj."
    },
    CEILING:{  
    	Syntax: "${0}(broj${1} povećanje)",
    	Disp:"Zaokružuje broj na najbliži cijeli broj ili višekratnik signifikantne vrijednosti."
    },
    CHAR: {
    	Syntax: "${0}(broj)",
    	Disp: "Vraća znak mapiran s brojem. Pronalazi znak u Unicode mapi znakova. Broj je između 1 i 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp: "Pronalazi i vraća odgovarajuću vrijednost u skladu s indeksom. Može izabrati do 30 vrijednosti."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća numerički kod za prvi znak u tekstualnom nizu koji kodira u unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj stupca reference."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrica)",
    	Disp:"Vraća broj stupaca u matrici ili referenci."
    },
    COMBIN:{
    	Syntax:"${0}(broj${1} izabrani_broj)",
    	Disp:"Vraća broj kombinacija za dani broj stavaka. Koristite ${0} za određivanje ukupnog mogućeg broja grupa za dani broj stavaka."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Kombinira nekoliko tekstualnih nizova u jedan niz."
    },
    CONVERT:{
    	Syntax:"${0}(broj${1} od_jedinice${1} do_jedinice)",
    	Disp:"Pretvara broj iz jednog sistema mjera u drugi.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slag",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Funta mase (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomska jedinica za masu)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Unca mase (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metar",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Engleska milja",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Inč",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Stopa",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Jard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstreom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Godina",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dan",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Sat",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minuta",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Sekunda",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Paskal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Milimetri stupca žive (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Njutn",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Din",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Funta snage",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Džul",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT kalorija",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Konjska snaga-sat",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Vatsat",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Stopa-funta",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodinamička kalorija",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Konjska snaga",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - Vat",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - Gaus",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - Stupnjeva Celzija",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Stupnjeva Fahrenheita",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Čajna žličica",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Žlica",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Tekuća unca",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Šalica",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - SAD pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - VB pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Kvart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litra",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kosinus danog kuta."
    },
    COSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća hiperbolni kosinus broja."
    },
    COT:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća kotangens navedenog broja."
    },
    COTH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća hiperbolni kotangens navedenog broja."
    },
    COUNT:{   
    	Syntax:"${0}(vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp:"Broji koliko brojeva je u listi argumenata. Tekstualni unosi se ignoriraju."
    },
    COUNTA:{   
    	Syntax:"${0}(vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp:"Broji koliko vrijednosti je u listi argumenata."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(raspon)",
    	Disp: "Broji prazne ćelije u navedenom rasponu."
    },
    COUNTIF:{
    	Syntax: "${0}(raspon${1} kriterij)",
    	Disp:"Broji ćelije koje zadovoljavaju zadani uvjet."
    },
    COUNTIFS:{
    	Syntax: "${0}(raspon_kriterija1${1} kriterij1${1} ...)",
    	Disp:"Broji ćelije koje zadovoljavaju više uvjeta."
    },
    CUMIPMT:{	
	    Syntax:"${0}(stopa${1} brrazd${1} sv${1} početno_razdoblje${1} završno_razdoblje${1} vrsta)",
	    Disp:"Izračunava kumulativnu kamatu plaćenu između dva navedena razdoblja."
    },
    CUMPRINC:{	
	    Syntax:"${0}(stopa${1} brrazd${1} sv${1} početno_razdoblje${1} završno_razdoblje${1} vrsta)",
	    Disp:"Izračunava kumulativnu glavnicu plaćenu za zajam, između dva navedena perioda."
    }, 
    DATE:{	
	    Syntax:"${0}(godina${1} mjesec${1} dan)",
	    Disp:"Daje interni broj za dani datum."
    },  
    DATEDIF:{	
	    Syntax:"${0}(početni datum${1} krajnji datum${1} format)",
	    Disp:"Vraća razliku u godinama, mjesecima ili danima između dva datuma.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Broj cijelih godina u razdoblju.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Broj cijelih mjeseci u razdoblju.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Broj dana u razdoblju.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Broj dana između početnog datuma i krajnjeg datuma, ignorirajući mjesece i godine.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Broj mjeseci između početnog datuma i krajnjeg datuma, ignorirajući godine.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Broj dana između početnog datuma i krajnjeg datuma, ignorirajući godine.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Vraća interni broj za tekst koji ima mogući format datuma."
    }, 
    DAY:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća dan od dane vrijednosti datuma. Dan se vraća kao cijeli broj između 1 i 31. Također možete unijeti negativnu vrijednost datum/vrijeme."
    },
    DAYS360:{
    	Syntax:"${0}(početni datum${1} krajnji datum${1} [metoda])",
    	Disp:"Računa broj dana između dva datuma bazirano na godini od 360 dana.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - SAD (NASD) metoda",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europska metoda",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(početni datum${1} krajnji datum${1})",
    	Disp:"Računa broj dana između dva datuma."
    },
    DEC2BIN:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira decimalni broj u binarni broj."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira decimalni broj u heksadecimalni broj."
    },
    DEC2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira decimalni broj u oktalni broj."
    },
    DEGREES:{	
	    Syntax:"${0}(kut)",
	    Disp:"Pretvara radijane u stupnjeve."
    },
    DISC:{
    	Syntax:"${0}(isplata${1} dospijeće${1} cijena${1} otkup${1} [temelj])",
    	Disp:"Izračunava diskontnu stopu za vrijednosnicu."
    }, 
    DOLLAR:{
    	Syntax:"${0}(broj${1} [decimale])",
    	Disp:"Pretvara broj u tekst, koristeći $ (dolar) format valute."
    },
    EDATE:{
    	Syntax:"${0}(početni_datum${1} mjeseci)",
    	Disp:"Vraća serijski broj koji predstavlja datum određen s brojem mjeseci prije ili nakon početnog_datuma "
    },
    EOMONTH:{
    	Syntax:"${0}(početni_datum${1} mjeseci)",
    	Disp:"Vraća serijski broj koji predstavlja zadnji dan mjeseca određenog s brojem mjeseci prije ili nakon početnog_datuma "
    },
    ERFC:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća komplementarnu funkciju pogreške, integriranu između broja i beskonačnosti."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća broj koji odgovara tipu greške."
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
    	Syntax:"${0}(broj)",
    	Disp:"Vraća broj zaokružen na najbliži veći parni cijeli broj."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Uspoređuje dva tekstualna niza i vraća TRUE ako su jednaki. Ova funkcija je osjetljiva na veličinu slova."
    },
    EXP:{    
    	Syntax:"${0}(broj)",
    	Disp: "Vraća e podignut na dani broj."
    },
    FACT:{  
    	Syntax:"${0}(broj)",
    	Disp:"Izračunava faktorijele broja."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(broj)",
        Disp:"Vraća dvostruki faktorijel broja."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrijednost FALSE."
    },
    FIND:{   
    	Syntax:"${0}(traženi tekst${1} tekst${1} [pozicija])",
    	Disp:"Traži niz od teksta unutar drugog teksta (osjetljivo na veličinu slova)."
    },
    FIXED:{
    	Syntax:"${0}(broj${1} [decimale]${1} [no_commas])",
    	Disp:"Formatira broj kao tekst s fiksnim brojem decimala.",
    	Arguments: {
    		2 : [{
    			label : "${0} - sprječava zareze",
    			result : "TRUE"
    		}, {
    			label : "${0} - ne sprječava zareze",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(broj${1} važnost)",
    	Disp:"Zaokružuje broj na najbliži manji višekratnik signifikantne vrijednosti."
    },
    FORMULA:{   
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća formulu od ćelije s formulom."
    },
    FREQUENCY:{   
    	Syntax:"${0}(lista_brojeva_data${1} lista brojeva_bins)",
    	Disp:"Kategorizira vrijednosti u intervale i zbraja broj vrijednosti u svakom intervalu."
    },
    FV:{
    	Syntax:"${0}(stopa${1} brrazd${1} rata${1} [sv]${1} [vrsta])",
    	Disp:"Izračunava buduću vrijednost ulaganja na temelju konstantne kamatne stope."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(glavnica${1} raspored)",
        Disp:"Izračunava buduću vrijednost početne glavnice nakon primjene niza kamatnih stopa na kumulativnu vrijednost."
    },
    GAMMALN:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća prirodni logaritam gama funkcije."
    },
    GCD:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
        Disp:"Vraća najveći zajednički djelitelj svih argumenata."
    },
    HEX2BIN:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira heksadecimalni broj u binarni broj."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertira heksadecimalni broj u decimalni broj."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira heksadecimalni broj u oktalni broj."
    },
    HOUR:{   
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj sati dana (0-23) za vrijednost vremena."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kriterij_traženja${1} matrica${1} Indeks${1} [sortirano])",
    	Disp:"Vodoravno traženje i referenca do ćelija lociranih ispod.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Točno podudaranje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(veza${1} [tekst_ćelije])",
    	Disp:"Vraća vezu koja pokazuje na mrežni resurs ili na raspon referenciran u vezi. Prikazuje tekst_ćelije (opcijski) ako je naveden; inače prikazuje vezu kao tekst."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_vrijednost]${1} [otherwise_vrijednost])",
    	Disp:"Navodi logički test za izvođenje."
    },
    IFS:{
    	Syntax:"${0}(test1${1} vrijednost_if_true1${1} ...)",
    	Disp:"Izvodi logičke testove koji provjeravaju da li je zadovoljen jedan ili više uvjeta pa vraća vrijednost koja odgovara prvom TRUE uvjetu."
    },
    IFERROR:{
    	Syntax:"${0}(vrijednost${1} vrijednost_if_error)",
    	Disp:"Vraća vrijednost koju ste specificirali ako je izraz pogrešan. U suprotnom, vraća rezultat izraza."
    },
    IFNA:{
    	Syntax:"${0}(vrijednost${1} vrijednost_if_na)",
    	Disp:"Vraća vrijednost koju ste specificirali ako izraz vrati grešku #N/A. U suprotnom, vraća rezultat izraza."
    },
    INDEX:{    
    	Syntax:"${0}(referenca${1} red${1} [stupac]${1} [raspon])",
    	Disp:"Vraća referencu u ćeliju iz definiranog raspona."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_stil])",
    	Disp:"Vraća sadržaj ćelije koji je referenciran u tekstualnom formatu.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 stil",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 stil",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(broj)",
    	Disp:"Zaokružuje broj na najbliži manji cijeli broj."
    },
    IPMT:{
    	Syntax:"${0}(stopa${1} per${1} brrazd${1} sv${1} [bv]${1} [vrsta])",
    	Disp:"Izračunava iznos kamata za period, za ulaganje koje se temelji na redovnim uplatama i fiksnoj kamatnoj stopi."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je prazna referencirana ćelija, inače vraća FALSE."
    },
    ISERR:{
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost zapravo vrijednost greške različita od #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost zapravo vrijednost greške."
    },
    ISEVEN:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost pozitivna, inače vraća FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća TRUE ako je to ćelija formule."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako vrijednost nosi logički broj."
    },
    ISNA:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost jednaka #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako vrijednost nije tekst."
    },
    ISNUMBER:{   
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost broj."
    },
    ISODD:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost neparan cijeli broj."
    },
    ISPMT:{
    	Syntax:"${0}(stopa${1} razd${1} brrazd${1} sv)",
    	Disp:"Izračunava kamatu plaćenu tijekom određenog razdoblja ulaganja."
    }, 
    ISREF:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost referenca."
    },
    ISTEXT:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Vraća TRUE ako je vrijednost tekst."
    },
    LARGE:{
        Syntax:"${0}(matrica${1} n-ta_pozicija)",
    	Disp:"Vraća n-tu najveću vrijednost iz skupa vrijednosti."
    },
    LCM:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
        Disp:"Vraća najniži zajednički višekratnik svih brojeva na listi."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [duljina])",
    	Disp:"Vraća određeni broj znakova od početka teksta."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća duljinu tekstualnog niza."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća broj bajtova tekstualnog niza."
    },
    LN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća prirodni logaritam broja."
    },
    LOG:{
    	Syntax:"${0}(broj${1} [baza])",
    	Disp:"Vraća logaritam broja po navedenoj bazi."
    },
    LOG10:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća logaritam broja po bazi 10."
    },
    LOOKUP:{
    	Syntax: "${0}(kriterij traženja${1} vektor traženja${1} [rezultat_vektor])",
    	Disp:"Određuje vrijednost vektora usporedbom s vrijednostima u drugom vektoru."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Pretvara tekst u mala slova."
    },    
    MATCH:{    
    	Syntax: "${0}(kriterij traženja${1} lookup_matrica${1} [tip])",
    	Disp:"Definira poziciju u matrici nakon uspoređivanja vrijednosti.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Manje od",
         		 result : 1
         	 }, {
         		 label : "${0} - Točno podudaranje",
         		 result : 0
         	 }, {
         		 label : "${0} - Veće od",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća maksimalnu vrijednost u listi argumenata."
    },
    MEDIAN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća srednju vrijednost ako je dan neparan broj vrijednosti. Inače vraća aritmetički prosjek od dvije srednje vrijednosti."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} broj${1} broj)",
    	Disp:"Vraća djelomičan tekstualni niz od teksta."
    }, 
    MIN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća minimalnu vrijednost u listi argumenata."
    },    
    MINUTE:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj minuta od sata(0-59) za vrijednost vremena."
    },    
    MOD:{    
    	Syntax:"${0}(broj_za_dijeljenje${1} divizor)",
    	Disp:"Vraća ostatak kad se podijeli broj za dijeljenje s divizorom."
    },
    MODE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća najveću zajedničku vrijednost u primjeru."
    },
    MONTH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća mjesec za danu vrijednost datuma. Mjesec se vraća kao cijeli broj između 1 i 12."
    },
    MROUND:{   
    	Syntax: "${0}(broj${1} višekratnik)",
        Disp:"Vraća broj zaokružen na određeni višekratnik."
    },
    MMULT:{    
    	Syntax:"${0}(matrica${1} matrica)",
    	Disp:"Množenje matrica. Vraća umnožak dvije matrice."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
        Disp:"Vraća multinomijalni koeficijent skupa brojeva."
    },
    N:{    
    	Syntax:"${0}(vrijednost)",
    	Disp:"Pretvara vrijednost u broj."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Vraća vrijednost greške #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(početni datum${1} završni datum${1} [praznici])",
    	Disp:"Vraća broj radnih dana između dva datuma."
    },
    NOT:{    
    	Syntax:"${0}(logička_vrijednost)",
    	Disp:"Daje suprotnu vrijednost argumenta."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Utvrđuje trenutno vrijeme računala."
    },
    NPV:{   
    	Syntax:"${0}(stopa${1} vrijednost 1${1} [vrijednost 2]${1} ...)",
        Disp:"Izračunava čistu sadašnju vrijednost ulaganja, prema diskontnoj stopi i nizu budućih novčanih izdataka i novčanih primitaka."
    },
    OCT2BIN:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira oktalni broj u binarni broj."
    },
    OCT2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertira oktalni broj u decimalni broj."
    },
    OCT2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Konvertira oktalni broj u heksadecimalni broj."
    },
    ODD:{    
    	Syntax:"${0}(broj)",
    	Disp:"Zaokruži broj na najbliži veći neparni cijeli broj veći od nule."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} redovi${1} stupci${1} [visina]${1} [širina])",
    	Disp:"Vraća referencu u raspon koji je navedeni broj redova i stupaca od ćelije ili raspona ćelija."
    },
    OR:{    
    	Syntax:"${0}(logička vrijednost 1${1} [logička vrijednost 2]${1} ...)",
    	Disp:"Vraća TRUE ako je barem jedan argument TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vraća približnu vrijednost od Pi."
    },
    PMT:{
    	Syntax:"${0}(stopa${1} brrazd${1} sv${1} [bv]${1} [vrsta])",
    	Disp:"Vraća ratu kredita, koji se temelji na redovnim uplatama i fiksnoj kamatnoj stopi."
    },
    POWER:{    
    	Syntax:"${0}(baza${1} potencija)",
    	Disp:"Podiže broj na zadanu potenciju."
    },
    PPMT:{
    	Syntax:"${0}(stopa${1} per${1} brrazd${1} sv${1} [bv]${1} [vrsta])",
    	Disp:"Izračunava otplaćeni iznos za period, za ulaganje koje se temelji na redovnim uplatama i fiksnoj kamatnoj stopi."
    },
    PRICEDISC:{
    	Syntax:"${0}(isplata${1} dospijeće${1} popust${1} otkup${1} [temelj])",
    	Disp:"Izračunava cijenu za diskontnu vrijednosnicu nominalne vrijednosti 100 kn."
    },
    PRICEMAT:{
    	Syntax:"${0}(isplata${1} dospijeće${1} izdavanje${1} stopa${1} prinos${1} [temelj])",
    	Disp:"Izračunava cijenu za vrijednosnicu nominalne vrijednosti 100 kn koja daje kamate po dospijeću."
    },
    PRODUCT:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Množi sve brojeve dane kao argumente i vraća umnožak."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Pretvara tekstualni niz u odgovarajuću veličinu slova, prvo slovo svake riječi u veliko slovo, a sva ostala u mala slova."
    },
    PV:{
    	Syntax:"${0}(stopa${1} brrazd${1} rata${1} [bv]${1} [vrsta])",
    	Disp:"Izračunava sadašnju vrijednost ulaganja na temelju niza budućih novčanih izdataka."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(brojnik${1} nazivnik)",
        Disp:"Vraća rezultat broja podijeljenog drugim brojem, skraćen na cijeli broj."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Vraća slučajan broj između 0 i 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(donji${1} gornji)",
    	Disp: "Vraća slučajan cijeli broj između navedenih brojeva."
    },
    RANK:{    
    	Syntax:"${0}(broj${1} ref${1} [redoslijed])",
    	Disp: "Vraća rang vrijednosti u primjeru.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Silazni",
          		 result : 0
          	 }, {
          		 label : "${0} - Uzlazni",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(isplata${1} dospijeće${1} ulaganje${1} popust${1} [temelj])",
    	Disp:"Izračunava primljeni iznos po dospijeću za potpuno otplaćenu vrijednosnicu."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} pozicija${1} duljina${1} novi_tekst)",
    	Disp:"Zamjenjuje znakove unutar tekstualnog niza s drugim tekstualnim nizom."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} brojač)",
    	Disp:"Ponavlja tekst za dani broj puta."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [broj])",
    	Disp:"Vraća zadnji znak ili znakove u tekstu."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [broj])",
    	Disp:"Vraća zadnji znak ili znakove u tekstu."
    },
    ROUND:{   
    	Syntax: "${0}(broj${1} brojač)",
    	Disp:"Zaokružuje broj na preddefiniranu točnost."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(broj${1} brojač)",
    	Disp:"Zaokružuje broj na preddefiniranu točnost prema dolje."
    },
    ROUNDUP:{   
    	Syntax: "${0}(broj${1} brojač)",
    	Disp:"Zaokružuje broj na preddefiniranu točnost prema gore."
    },
    ROW:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Definira interni broj reda reference."
    },
    ROWS:{   
    	Syntax:"${0}(matrica)",
    	Disp:"Vraća broj redova u matrici ili referenci."
    },
    RADIANS:{   
    	Syntax:"${0}(kut)",
    	Disp:"Pretvara stupnjeve u radijane."
    },
    ROMAN:{   
    	Syntax:"${0}(broj${1} [oblik])",
    	Disp:"Pretvara arapske brojeve u rimske, kao tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasično",
          		 result : 0
          	 }, {
          		 label : "${0} - Sažetije",
          		 result : 1
          	 }, {
          		 label : "${0} - Sažetije",
          		 result : 2
          	 }, {
          		 label : "${0} - Sažetije",
          		 result : 3
          	 }, {
          		 label : "${0} - Pojednostavljeno",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(traženi tekst${1} tekst${1} [pozicija])",
    	Disp:"Traži vrijednost teksta unutar drugog teksta (nije osjetljivo na veličinu slova)."
    },  
    SIGN:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća predznak broja."
    },
    SIN:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća sinus danog kuta."
    },
    SINH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća hiperbolni sinus broja."
    },
    SECOND:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj sekundi od minute(0-59) za vrijednost vremena."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeficijenti)",
        Disp:"Vraća sumu redova potencija na temelju formule."
    },
    SHEET:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj lista od reference ili niza."
    },
    SMALL:{   
    	Syntax:"${0}(matrica${1} n-ta_pozicija)",
    	Disp:"Vraća n-tu najmanju vrijednost iz skupa vrijednosti."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} stari${1} novi${1} [koji])",
    	Disp:"Vraća tekst gdje je stari tekst zamijenjen s novim tekstom."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcija${1} rang${1} ...)",
    	Disp:"Računa međuzbrojeve u proračunskoj tablici.",
    	Arguments: {
    		0 : [{
    			label : "${0} - AVERAGE",
    			result : 1
    		}, {
    			label : "${0} - COUNT",
    			result: 2
    		}, {
    			label : "${0} - COUNTA",
    			result: 3
    		}
    		, {
    			label : "${0} - MAX",
    			result: 4
    		}
    		, {
    			label : "${0} - MIN",
    			result: 5
    		}
    		, {
    			label : "${0} - PRODUCT",
    			result: 6
    		}
    		, {
    			label : "${0} - STDEV",
    			result: 7
    		}
    		, {
    			label : "${0} - STDEVP",
    			result: 8
    		}
    		, {
    			label : "${0} - SUM",
    			result: 9
    		}
    		, {
    			label : "${0} - VAR",
    			result: 10
    		}, {
    			label : "${0} - VARP",
    			result: 11
    		}, {
    			label : "${0} - AVERAGE",
    			result: 101
    		}, {
    			label : "${0} - COUNT",
    			result: 102
    		}, {
    			label : "${0} - COUNTA",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - PRODUCT",
    			result: 106
    		}, {
    			label : "${0} - STDEV",
    			result: 107
    		}, {
    			label : "${0} - STDEVP",
    			result: 108
    		}, {
    			label : "${0} - SUM",
    			result: 109
    		}, {
    			label : "${0} - VAR",
    			result: 110
    		}, {
    			label : "${0} - VARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća zbroj svih argumenata."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrica 1${1} [matrica 2]${1} ...)",
    	Disp:"Vraća zbroj umnožaka argumenata matrice."
    },
    SUMIF:{   
    	Syntax:"${0}(raspon${1} kriterij${1} [ukupni raspon])",
    	Disp:"Zbraja argumente koji odgovaraju uvjetima."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_range${1} criteria_range1${1} criteria1${1} ...)",
    	Disp:"Zbraja argumente koji zadovoljavaju više uvjeta."
    },
    SQRT:{   
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kvadratni korijen broja."
    },
    SQRTPI:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća kvadratni korijen od (broj * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Računa standardnu devijaciju bazirano na primjeru."
    },
    STDEVP:
    {
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Računa standardnu devijaciju bazirano na čitavoj populaciji."
    },
    SUMSQ:{
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
        Disp:"Vraća sumu kvadrata brojeva na listi."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Pretvara argumente u tekst."
    },
    TAN:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća tangens navedenog broja."
    },
    TANH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća hiperbolni tangens navedenog broja."
    },
    TBILLPRICE:{
    	Syntax:"${0}(isplata${1} dospijeće${1} popust)",
    	Disp:"Izračunava cijenu blagajničkog zapisa za 100 kn nominalne vrijednosti."
    },
    TEXT:{
    	Syntax:"${0}(vrijednost${1} kod_formata)",
    	Disp:"Pretvara vrijednost u tekst u skladu s pravilima koda formata broja i vraća ga."
    },
    TIME:{   
    	Syntax:"${0}(sat${1} minuta${1} sekunda)",
    	Disp:"Određuje vrijednost vremena iz detalja sati, minuta i sekunda."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Vraća interni broj za tekst koji ima mogući format vremena."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Utvrđuje trenutni datum računala."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Uklanja sve vodeće i prateće praznine. Svaki drugi niz od 2 ili više unutrašnjih praznina, mijenja se s jednom prazninom."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrijednost TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(broj${1} [brojanje])",
    	Disp:"Skraćuje decimalna mjesta broja."
    },
    TYPE:{   
    	Syntax:"${0}(vrijednost)",
    	Disp:"Definira tip podataka za vrijednost."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Pretvara tekst u velika slova."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Pretvara argument tekst u broj."
    },
    VAR:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Procjenjuje varijaciju baziranu na primjeru."
    },
    VARA:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Procjenjuje varijaciju baziranu na primjeru, uključivo brojeve, tekst i logičke vrijednosti."
    },
    VARP:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Računa varijaciju bazirano na čitavoj populaciji."
    },
    VARPA:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Računa varijaciju baziranu na čitavoj populaciji, uključivo brojeve, tekst i logičke vrijednosti."
    },
    VLOOKUP:{    
    	Syntax: "${0}(kriterij traženja${1} matrica${1} indeks${1} [redoslijed sortiranja])",
    	Disp:"Okomito pretraživanje i referenca na pokazane ćelije.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Točno podudaranje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(broj${1} [tip])",
    	Disp:"Vraća dan u tjednu za vrijednost datuma kao cijeli broj.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Brojevi 1 (Nedjelja) do 7 (Subota)",
          		 result : 1
          	 }, {
          		 label : "${0} - Brojevi 1 (Ponedjeljak) do 7 (Nedjelja)",
          		 result : 2
          	 }, {
          		 label : "${0} - Brojevi 0 (Ponedjeljak) do 6 (Nedjelja)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Brojevi 1 (Ponedjeljak) do 7 (Nedjelja)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Utorak) do 7 (Ponedjeljak)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Srijeda) do 7 (Utorak)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Četvrtak) do 7 (Srijeda)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Petak) do 7 (Četvrtak)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Subota) do 7 (Petak)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Brojevi 1 (Nedjelja) do 7 (Subota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(broj${1} [način])",
    	Disp:"Računa kalendarski tjedan koji odgovara danom datumu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Nedjelja",
          		 result : 1
          	 }, {
          		 label : "${0} - Ponedjeljak",
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
    	Syntax:"${0}(početni datum${1} dana${1} [praznika])",
    	Disp:"Vraća serijski broj datuma prije ili poslije navedenog broja radnih dana."
    },
    XNPV:{   
    	Syntax:"${0}(stopa${1} vrijednosti${1} datumi)",
    	Disp:"Izračunava čistu sadašnju vrijednost za slijed novčanih tokova."
    },
    YEAR:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća godinu od vrijednosti datuma kao cijeli broj."
    }
}
})

