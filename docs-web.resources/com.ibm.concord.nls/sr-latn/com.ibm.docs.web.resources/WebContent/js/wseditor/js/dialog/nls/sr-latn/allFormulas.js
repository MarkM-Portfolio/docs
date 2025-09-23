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
	    Disp:"Vraća apsolutnu vrednost broja."
    },
    ACOS:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus kosinus broja. Ugao se vraća u radijanima."
    },
    ACOSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni kosinus hiperbolični broja."
    },
    ACOT:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća inverzni kotangens broja. Ugao se meri u radijanima."
    },
    ACOTH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća inverzni kotangens hiperbolični broja."
    },
    ADDRESS:{
         Syntax:"${0}(red${1} kolona${1} [abs]${1} [a1]${1} [list])",
         Disp:"Vraća referencu na ćeliju kao tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Apsolutna vrednost",
        		 result : 1
        	 }, {
        		 label : "${0} - Apsolutni red/relativna kolona",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativni red/apsolutna kolona",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativna vrednost",
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
    	Syntax:"${0}(logička vrednost 1${1} [logička vrednost 2]${1} ...)",
    	Disp:"Vraća „TAČNO“ ako svi argumenti imaju vrednost „TAČNO“."
    },
    ASIN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus sinus broja. Ugao se vraća u radijanima."
    },
    ASINH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni sinus hiperbolični broja."
    },
    ATAN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus tangens broja. Ugao se vraća u radijanima."
    },
    AVERAGE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosek argumenata."
    },
    AVERAGEA:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosečnu vrednost za uzorak. Tekst se procenjuje kao nula."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(opseg${1} kriterijum${1} [prosečan_opseg])",
    	Disp:"Vraća prosek (aritmetičku sredinu) argumenata koji odgovaraju kriterijumu."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(prosečan_opseg${1} kriterijum_opsega1${1} kriterijum1${1} ...)",
    	Disp:"Vraća prosek (aritmetičku sredinu) argumenata koji odgovaraju višestrukim kriterijumima."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Vraća arkus tangens ili inverzni tangens navedenih x i y koordinata. Arkus tangens je ugao od x-ose do linije koja sadrži početak (0, 0) i tačku sa koordinatama (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolički tangens broja. Broj mora da bude između -1 i 1 (izuzev -1 i 1)."
    },
    BASE:{    
    	Syntax:"${0}(broj${1} osnova${1} [minimalna dužina])",
    	Disp:"Konvertuje pozitivni ceo broj u tekstualnu vrednost iz brojčanog sistema definisane osnove."
    },
    BIN2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertuje binarni broj u decimalni broj."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje binarni broj u heksadecimalni broj."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje binarni broj u oktalni broj."
    },
    CEILING:{  
    	Syntax: "${0}(broj${1} inkrement)",
    	Disp:"Zaokružuje broj na najbliži relevantan ceo broj ili umnožak definisane vrednosti."
    },
    CHAR: {
    	Syntax: "${0}(broj)",
    	Disp: "Vraća znak mapiran brojem. Pronalazi znak na mapi Unikod znakova. Broj je između 1 i 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} vrednost1${1} [vrednost2]${1} ...)",
    	Disp: "Pronalazi i vraća odgovarajuću vrednost prema indeksu. Može da BIRA između 30 vrednosti."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća numerički kôd za prvi znak u tekstualnoj niski koji je kodiran u Unikodu"
    },
    COLUMN:{    
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj kolone reference."
    },
    COLUMNS:{    
    	Syntax:"${0}(niz)",
    	Disp:"Vraća broj kolona u nizu ili referenci."
    },
    COMBIN:{
    	Syntax:"${0}(broj${1} izabrani_broj)",
    	Disp:"Vraća broj kombinacija za dati broj stavki. Koristite ${0} da biste odredili ukupan mogući broj grupa za dati broj stavki."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Kombinuje nekoliko tekstualnih niski u jednu nisku."
    },
    CONVERT:{
    	Syntax:"${0}(broj${1} iz_jedinice${1} u_jedinicu)",
    	Disp:"Konvertuje broj iz jednog mernog sistema u drugi.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - slag",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - funta (masa) (avoardipoa)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomska jedinica mase)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - unca mase (avoardipoa)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - metar",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - zakonska milja",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - inč",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - stopa",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - jarda",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - angstrem",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pajk",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - godina",
       		 result : "\"god\""
       	 }, {
       		 label : "${0} - dan",
       		 result : "\"d\""
       	 }, {
       		 label : "${0} - čas",
       		 result : "\"č\""
       	 }, {
       		 label : "${0} - minut",
       		 result : "\"min\""
       	 }, {
       		 label : "${0} - sekund",
       		 result : "\"sek\""
       	 }, {
       		 label : "${0} - paskal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - atmosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimetara živinog stuba (Tor)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - njutn",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - din",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - funta (sila)",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - džul",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT kalorija",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - konjska snaga-čas",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - vat-čas",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - stopa-funta",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - termodinamička kalorija",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - konjska snaga",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - vat",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - gaus",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - stepen Celzijusa",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - stepen Farenhajta",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - kafena kašičica",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - supena kašika",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - tečna unca",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - šolja",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - američka pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - britanska pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - kvart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - galon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - litar",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kosinus datog ugla."
    },
    COSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kosinus hiperbolični broja."
    },
    COT:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća kotangens datog broja."
    },
    COTH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća kotangens hiperbolični datog broja."
    },
    COUNT:{   
    	Syntax:"${0}(vrednost1${1} [vrednost2]${1} ...)",
    	Disp:"Broji koliko brojeva ima na listi argumenata. Tekstualni unosi se zanemaruju."
    },
    COUNTA:{   
    	Syntax:"${0}(vrednost1${1} [vrednost2]${1} ...)",
    	Disp:"Broji koliko vrednosti ima na listi argumenata."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(opseg)",
    	Disp: "Broji prazne ćelije u navedenom opsegu."
    },
    COUNTIF:{
    	Syntax: "${0}(opseg${1} kriterijumi)",
    	Disp:"Računa broj ćelija koje odgovaraju datom uslovu."
    },
    COUNTIFS:{
    	Syntax: "${0}(kriterijum_opsega1${1} kriterijum1${1} ...)",
    	Disp:"Računa broj ćelija koje odgovaraju višestrukim uslovima."
    },
    CUMIPMT:{	
	    Syntax:"${0}(stopa${1} nper${1} pv${1} početni_period${1} krajnji_period${1} tip)",
	    Disp:"Računa ukupnu isplaćenu kamatu između dva navedena perioda."
    },
    CUMPRINC:{	
	    Syntax:"${0}(stopa${1} nper${1} pv${1} početni_period${1} krajnji_period${1} tip)",
	    Disp:"Računa ukupnu isplaćenu glavnicu na kredit između dva navedena perioda."
    }, 
    DATE:{	
	    Syntax:"${0}(godina${1} mesec${1} dan)",
	    Disp:"Navodi interni broj za navedeni datum."
    },  
    DATEDIF:{	
	    Syntax:"${0}(datum početka${1} datum završetka${1} format)",
	    Disp:"Vraća razliku u godinama, mesecima ili danima između dva datuma.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Broj kompletnih godina u periodu.",
	    		result: "\"G\""
	    	}, {
	    		label: "${0} - Broj kompletnih meseci u periodu.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Broj dana u periodu.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Broj dana između datuma_početka i datuma_završetka, zanemarujući mesece i godine.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Broj meseci između datuma_početka i datuma_završetka, zanemarujući godine.",
	    		result: "\"GM\""
	    	}, {
	    		label: "${0} - Broj dana između datuma_početka i datuma_završetka, zanemarujući godine.",
	    		result: "\"GD\""
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
    	Disp:"Vraća dan date vrednosti datuma. Dan se vraća kao ceo broj između 1 i 31. Možete da unesete i negativnu vrednost datuma i vremena."
    },
    DAYS360:{
    	Syntax:"${0}(datum_početka${1} datum_završetka${1} [metod])",
    	Disp:"Izračunava broj dana između dva datuma na osnovu godine od 360 dana.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Američki metod (NASD)",
       		 result : "„NETAČNO“"
       	 }, {
       		 label : "${0} - Evropski metod",
       		 result : "„TAČNO“"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(datum_početka${1} datum_završetka${1})",
    	Disp:"Izračunava broj dana između dva datuma."
    },
    DEC2BIN:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje decimalni broj u binarni broj."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje decimalni broj u heksadecimalni broj."
    },
    DEC2OCT:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje decimalni broj u oktalni broj."
    },
    DEGREES:{	
	    Syntax:"${0}(ugao)",
	    Disp:"Konvertuje radijane u stepene."
    },
    DISC:{
    	Syntax:"${0}(poravnanje${1} zrelost${1} pr${1} povraćaj${1} [osnova])",
    	Disp:"Računa stopu popusta za pokriće."
    }, 
    DOLLAR:{
    	Syntax:"${0}(broj${1} [decimale])",
    	Disp:"Konvertuje broj u tekst, pomoću formata valute $ (dolar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} meseci)",
    	Disp:"Vraća redni broj koji predstavlja datum naznačenog broja meseci pre ili posle navedenog datuma start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} meseci)",
    	Disp:"Vraća redni broj za poslednji dan meseca za naznačeni broj meseci pre ili posle navedenog datuma start_date"
    },
    ERFC:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća komplementarnu funkciju greške, ugrađenu između broja i beskonačnosti."
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
    	Disp:"Vraća broj zaokružen na najbliži paran ceo broj."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Poredi dve tekstualne niske i vraća vrednost „TAČNO“ ako su identične. Ova funkcija razlikuje mala i velika slova."
    },
    EXP:{    
    	Syntax:"${0}(broj)",
    	Disp: "Vraća e stepenovano datim brojem."
    },
    FACT:{  
    	Syntax:"${0}(broj)",
    	Disp:"Izračunava faktorijel broja."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(broj)",
        Disp:"Vraća dvostruki faktorijel broja."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrednost kao „NETAČNO“."
    },
    FIND:{   
    	Syntax:"${0}(pronađi tekst${1} tekst${1} [položaj])",
    	Disp:"Traži nisku teksta u okviru neke druge (razlikuje mala i velika slova)."
    },
    FIXED:{
    	Syntax:"${0}(broj${1} [decimale]${1} [bez_zareza])",
    	Disp:"Oblikuje broj kao tekst sa fiksnim brojem decimala.",
    	Arguments: {
    		2 : [{
    			label : "${0} - Blokiraj zareze",
    			result : "„TAČNO“"
    		}, {
    			label : "${0} - Ne blokiraj zareze",
    			result: "„NETAČNO“" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(broj${1} relevantnost)",
    	Disp:"Zaokružuje broj nadole na najbliži relevantan umnožak definisane vrednosti."
    },
    FORMULA:{   
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća formulu ćelije sa formulom."
    },
    FREQUENCY:{   
    	Syntax:"${0}(ListaSekvenceBrojeva_podaci${1} ListaSekvenceBrojeva_intervali)",
    	Disp:"Kategorizuje vrednosti u intervale i prebrojava koliko vrednosti ima u svakom intervalu."
    },
    FV:{
    	Syntax:"${0}(stopa${1} nper${1} pmt${1} [pv]${1} [tip])",
    	Disp:"Računa buduću vrednost investicije zasnovane na nepromenljivoj kamatnoj stopi."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(glavnica${1} raspored)",
        Disp:"Računa buduću vrednost početne glavnice nakon primene grupe složenih kamatnih stopa."
    },
    GAMMALN:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća prirodni logaritam gama funkcije."
    },
    GCD:{   
    	Syntax:"${0}(broj1${1} [broj 2]${1} ...)",
        Disp:"Vraća najveći zajednički delilac svih argumenata."
    },
    HEX2BIN:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje heksadecimalni broj u binarni broj."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertuje heksadecimalni broj u decimalni broj."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje heksadecimalni broj u oktalni broj."
    },
    HOUR:{   
    	Syntax:"${0}(broj)",
    	Disp:"Određuje sekvencijalni broj sata u danu (0-23) za vrednost vremena."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kriterijum_pretrage${1} niz${1} indeks${1} [sortirano])",
    	Disp:"Horizontalna pretraga i referenca na ćelije ispod.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "„TAČNO“"
          	 }, {
          		 label : "${0} - Tačno podudaranje",
          		 result : "„NETAČNO“"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [tekst_ćelije])",
    	Disp:"Vraća link koji ukazuje na mrežni resurs ili na opseg reference linka. Prikazuje tekst_ćelije (opcionalno) u slučaju da je dat; u suprotnom prikazuje link kao tekst."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [vrednost_onda]${1} [vrednost_ako-ne])",
    	Disp:"Navodi logički test koji treba obaviti."
    },
    IFS:{
    	Syntax:"${0}(test1${1} vrednost_ako_tačno1${1} ...)",
    	Disp:"Pokreće logički test da bi ispitao da li je ispunjen jedan ili više uslova i vraća vrednost koja odgovara prvom tačnom (TRUE) uslovu."
    },
    IFERROR:{
    	Syntax:"${0}(vrednost${1} vrednost_ako_greška)",
    	Disp:"Vraća vrednost koju ste naveli ukoliko je izraz greška. U suprotnom, vraća rezultat izraza."
    },
    IFNA:{
    	Syntax:"${0}(vrednost${1} vrednost_ako_na)",
    	Disp:"Vraća vrednost koju ste naveli ukoliko je izraz vratio grešku „#N/A“. U suprotnom, vraća rezultat izraza."
    },
    INDEX:{    
    	Syntax:"${0}(referenca${1} red${1} [kolona]${1} [opseg])",
    	Disp:"Vraća referencu na ćeliju iz definisanog opsega."
    },
    INDIRECT:{    
    	Syntax:"${0}(referenca${1} [stil_reference])",
    	Disp:"Vraća sadržaj ćelije na koju se upućuje u tekstualnom obrascu.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 stil",
         		 result : "„NETAČNO“"
         	 }, {
         		 label : "${0} - A1 stil",
         		 result : "„TAČNO“"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(broj)",
    	Disp:"Zaokružuje broj nadole na najbliži ceo broj."
    },
    IPMT:{
    	Syntax:"${0}(stopa${1} per${1} nper${1} pv${1} [fv]${1} [tip])",
    	Disp:"Računa iznos kamate za period za investiciju osnovanu na redovnim plaćanjima sa fiksnom kamatnom stopom."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je referencirana ćelija prazna. U suprotnom vraća „NETAČNO“."
    },
    ISERR:{
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost pogrešna vrednost koja nije jednaka #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost pogrešna vrednost."
    },
    ISEVEN:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost paran broj. U suprotnom vraća „NETAČNO“." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća „TAČNO“ ako ćelija predstavlja ćeliju sa formulom."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost logički broj."
    },
    ISNA:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „tačno“ ako vrednost nije tekstualna."
    },
    ISNUMBER:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost broj."
    },
    ISODD:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost neparan ceo broj."
    },
    ISPMT:{
    	Syntax:"${0}(stopa${1} per${1} nper${1} pv)",
    	Disp:"Računa kamatu uplaćenu tokom navedenog perioda investicije."
    }, 
    ISREF:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost referenca."
    },
    ISTEXT:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vraća „TAČNO“ ako je vrednost tekstuelna."
    },
    LARGE:{
        Syntax:"${0}(niz${1} n-ti_položaj)",
    	Disp:"Vraća n-tu najveću vrednost iz skupa vrednosti."
    },
    LCM:{   
    	Syntax:"${0}(broj1${1} [broj 2]${1} ...)",
        Disp:"Vraća najmanji zajednički sadržalac svih brojeva u listi."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [dužina])",
    	Disp:"Vraća navedeni broj znakova od početka teksta."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća dužinu tekstualne niske."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća broj bajtova tekstualne niske."
    },
    LN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća prirodni logaritam broja."
    },
    LOG:{
    	Syntax:"${0}(broj${1} [osnova])",
    	Disp:"Vraća logaritam broja navedene osnove."
    },
    LOG10:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća logaritam broja u osnovi 10."
    },
    LOOKUP:{
    	Syntax: "${0}(kriterijum pretrage${1} vektor pretrage${1} [vektor_rezultata])",
    	Disp:"Određuje vrednost u vektoru poređenjem sa vrednostima u drugom vektoru."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konvertuje tekst u mala slova."
    },    
    MATCH:{    
    	Syntax: "${0}(kriterijum pretrage${1} niz_traženja${1} [tip])",
    	Disp:"Definiše položaj u nizu nakon poređenja vrednosti.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Manje od",
         		 result : 1
         	 }, {
         		 label : "${0} - Tačno podudaranje",
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
    	Disp:"Vraća maksimalnu vrednost sa liste argumenata."
    },
    MEDIAN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća srednju vrednost ako je dat neparan broj vrednosti. U suprotnom, vraća aritmetički prosek dve srednje vrednosti."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} broj${1} broj)",
    	Disp:"Vraća delimičnu tekstualnu nisku teksta."
    }, 
    MIN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća minimalnu vrednost sa liste argumenata."
    },    
    MINUTE:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje sekvencijalni broj minuta u satu (0-59) za vrednost vremena."
    },    
    MOD:{    
    	Syntax:"${0}(podeljeni_broj${1} delilac)",
    	Disp:"Vraća ostatak kada se podeljeni broj podeli deliocem."
    },
    MODE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća najčešću vrednost u uzorku."
    },
    MONTH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća mesec za datu vrednost datuma. Vraćeni mesec je ceo broj između 1 i 12."
    },
    MROUND:{   
    	Syntax: "${0}(broj${1} umnožak)",
        Disp:"Vraća broj zaokružen na zadati umnožak."
    },
    MMULT:{    
    	Syntax:"${0}(niz${1} niz)",
    	Disp:"Množenje nizova. Vraća proizvod dva niza."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(broj1${1} [broj 2]${1} ...)",
        Disp:"Vraća multinomni koeficijent skupa brojeva."
    },
    N:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Konvertuje vrednost u broj."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Vraća vrednost greške #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(datum početka${1} datum završetka${1} [praznici])",
    	Disp:"Vraća broj radnih dana između dva datuma."
    },
    NOT:{    
    	Syntax:"${0}(logička vrednost)",
    	Disp:"Invertuje vrednost argumenta."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Određuje trenutno vreme računara."
    },
    NPV:{   
    	Syntax:"${0}(stopa${1} vrednost 1${1} [vrednost 2]${1} ...)",
        Disp:"Računa neto sadašnju vrednost investicije bazirano na priloženoj stopi popusta, grupi budućih rata i prihodu."
    },
    OCT2BIN:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje oktalni broj u binarni broj."
    },
    OCT2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Konvertuje oktalni broj u decimalni broj."
    },
    OCT2HEX:{
    	Syntax:"${0}(broj${1} [mesta])",
    	Disp:"Konvertuje oktalni broj u heksadecimalni broj."
    },
    ODD:{    
    	Syntax:"${0}(broj)",
    	Disp:"Zaokružuje broj nagore na najbliži neparni ceo broj, pri čemu „nagore“ znači „dalje od 0“."
    },
    OFFSET:{
    	Syntax:"${0}(referenca${1} redovi${1} kolone${1} [visina]${1} [širina])",
    	Disp:"Vraća referencu na opseg koji predstavlja navedeni broj redova i kolona iz ćelije ili opsega ćelija."
    },
    OR:{    
    	Syntax:"${0}(logička vrednost 1${1} [logička vrednost 2]${1} ...)",
    	Disp:"Vraća „TAČNO“ ako najmanje jedan argument ima vrednost „TAČNO“."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vraća približnu vrednost broja Pi."
    },
    PMT:{
    	Syntax:"${0}(stopa${1} nper${1} pv${1} [fv]${1} [tip])",
    	Disp:"Vraća isplatu za kredit osnovan na redovnim plaćanjima sa fiksnom kamatnom stopom."
    },
    POWER:{    
    	Syntax:"${0}(osnova${1} stepen)",
    	Disp:"Podiže broj na stepen drugog broja."
    },
    PPMT:{
    	Syntax:"${0}(stopa${1} per${1} nper${1} pv${1} [fv]${1} [tip])",
    	Disp:"Računa iznos rate za period za investiciju osnovanu na redovnim plaćanjima sa fiksnom kamatnom stopom."
    },
    PRICEDISC:{
    	Syntax:"${0}(poravnanje${1} zrelost${1} popust${1} povraćaj${1} [osnova])",
    	Disp:"Računa cenu na $100 nominalne vrednosti za pokriće sa popustom."
    },
    PRICEMAT:{
    	Syntax:"${0}(poravnanje${1} zrelost${1} problem${1} stopa${1} yld${1} [osnova])",
    	Disp:"Računa cenu na $100 nominalne vrednosti pokrića za koje se plaća kamata po dospeću."
    },
    PRODUCT:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Množi sve brojeve koji su dati kao argumenti i vraća proizvod."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konvertuje tekstualnu nisku u odgovarajuću veličinu slova, pri čemu je prvo slovo svake reči veliko, a sva ostala mala."
    },
    PV:{
    	Syntax:"${0}(stopa${1} nper${1} pmt${1} [fv]${1} [tip])",
    	Disp:"Računa sadašnju vrednost investicije bazirano na grupi budućih rata."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(brojilac${1} imenilac)",
        Disp:"Vraća rezultate broja podeljenog sa drugim brojem, zaokrugljeno na ceo broj."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Vraća nasumični broj između 0 i 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(dno${1} vrh)",
    	Disp: "Vraća nasumični ceo broj između brojeva koje navedete."
    },
    RANK:{    
    	Syntax:"${0}(broj${1} referenca${1} [redosled])",
    	Disp: "Vraća rang vrednosti u uzorku.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Opadajuće",
          		 result : 0
          	 }, {
          		 label : "${0} - Rastuće",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(poravnanje${1} zrelost${1} investicija${1} popust${1} [osnova])",
    	Disp:"Računa svotu koja se dobija po dospeću za potpuno investirano pokriće."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} položaj${1} dužina${1} novi tekst)",
    	Disp:"Zamenjuje znakove iz tekstualne niske drugom tekstualnom niskom."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} broj)",
    	Disp:"Ponavlja tekst dati broj puta."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [broj])",
    	Disp:"Vraća poslednji znak ili znakove teksta."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [broj])",
    	Disp:"Vraća poslednji znak ili znakove teksta."
    },
    ROUND:{   
    	Syntax: "${0}(broj${1} broj)",
    	Disp:"Zaokružuje broj prema unapred definisanoj tačnosti."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(broj${1} broj)",
    	Disp:"Zaokružuje broj nadole prema unapred definisanoj tačnosti."
    },
    ROUNDUP:{   
    	Syntax: "${0}(broj${1} broj)",
    	Disp:"Zaokružuje broj nagore prema unapred definisanoj tačnosti."
    },
    ROW:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Definiše interni broj reda reference."
    },
    ROWS:{   
    	Syntax:"${0}(niz)",
    	Disp:"Vraća broj redova u nizu ili referenci."
    },
    RADIANS:{   
    	Syntax:"${0}(ugao)",
    	Disp:"Konvertuje stepene u radijane."
    },
    ROMAN:{   
    	Syntax:"${0}(broj${1} [oblik])",
    	Disp:"Konvertuje arapski broj u rimski, kao tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasično",
          		 result : 0
          	 }, {
          		 label : "${0} - Konciznije",
          		 result : 1
          	 }, {
          		 label : "${0} - Konciznije",
          		 result : 2
          	 }, {
          		 label : "${0} - Konciznije",
          		 result : 3
          	 }, {
          		 label : "${0} - Pojednostavljeno",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(pronađi tekst${1} tekst${1} [položaj])",
    	Disp:"Traži jednu tekstualnu vrednost u drugoj (ne razlikuje mala i velika slova)."
    },  
    SIGN:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća algebarski predznak broja."
    },
    SIN:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća sinus datog ugla."
    },
    SINH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća sinus hiperbolični broja."
    },
    SECOND:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje sekvencijalni broj sekundi u minutu (0-59) za vrednost vremena."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeficijenti)",
        Disp:"Vraća zbir stepenog reda osnovan na formuli."
    },
    SHEET:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj lista reference ili niske."
    },
    SMALL:{   
    	Syntax:"${0}(niz${1} n-ti_položaj)",
    	Disp:"Vraća n-tu najmanju vrednost iz skupa vrednosti."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} staro${1} novo${1} [koje])",
    	Disp:"Vraća tekst u kome je stari tekst zamenjen novim."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcija${1} opseg${1} ...)",
    	Disp:"Izračunava međuvrednosti u unakrsnoj tabeli.",
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
    	Syntax:"${0}(broj1${1} [broj 2]${1} ...)",
    	Disp:"Vraća zbir svih argumenata."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(niz 1${1} [niz 2]${1} ...)",
    	Disp:"Vraća zbir proizvoda argumenata niza."
    },
    SUMIF:{   
    	Syntax:"${0}(opseg${1} kriterijumi${1} [opseg zbirova])",
    	Disp:"Sabira argumente koji ispunjavaju uslove."
    },
    SUMIFS:{
    	Syntax: "${0}(suma_opsega${1} kriterijum_opsega1${1} kriterijum1${1} ...)",
    	Disp:"Sabira argumente koji ispunjavaju više uslova."
    },
    SQRT:{   
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kvadratni koren broja."
    },
    SQRTPI:{   
    	Syntax:"${0}(broj)",
        Disp:"Vraća koren za (broj * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Izračunava standardnu devijaciju na osnovu uzorka."
    },
    STDEVP:
    {
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Izračunava standardnu devijaciju na osnovu cele populacije."
    },
    SUMSQ:{
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
        Disp:"Vraća zbir kvadrata brojeva na listi."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Konvertuje argumente u tekst."
    },
    TAN:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća tangens datog broja."
    },
    TANH:{    
    	Syntax:"${0}(broj)",
        Disp:"Vraća tangens hiperbolični datog broja."
    },
    TBILLPRICE:{
    	Syntax:"${0}(poravnanje${1} zrelost${1} popust)",
    	Disp:"Računa cenu na $100 nominalne vrednosti za državne obveznice."
    },
    TEXT:{
    	Syntax:"${0}(vrednost${1} kôd formata)",
    	Disp:"Konvertuje vrednost u tekst prema pravilima koda formata broja i vraća ga."
    },
    TIME:{   
    	Syntax:"${0}(sat${1} minut${1} sekunda)",
    	Disp:"Određuje vrednost vremena na osnovu detalja o satu, minutu i sekundi."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Vraća interni broj za tekst koji ima mogući format vremena."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Određuje trenutni datum računara."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Uklanja sve razmake na početku i na kraju. Svi drugi nizovi od 2 ili više unutrašnjih razmaka zamenjuju se jednim razmakom."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrednost „TAČNO“."
    },
    TRUNC:{   
    	Syntax:"${0}(broj${1} [broj])",
    	Disp:"Skraćuje decimalna mesta broja."
    },
    TYPE:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Definiše tip podataka vrednosti."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Konvertuje tekst u velika slova."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Konvertuje tekstualni argument u broj."
    },
    VAR:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Procenjuje varijansu na osnovu uzorka."
    },
    VARA:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Procenjuje varijansu na osnovu uzorka, uključujući numeričke, tekstualne i logičke vrednosti."
    },
    VARP:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Izračunava varijansu na osnovu cele populacije."
    },
    VARPA:{    
    	Syntax: "${0}(broj1${1} [broj2]${1}...)",
    	Disp:"Izračunava varijansu na osnovu cele populacije, uključujući numeričke, tekstualne i logičke vrednosti."
    },
    VLOOKUP:{    
    	Syntax: "${0}(kriterijum pretrage${1} niz${1} indeks${1} [redosled sortiranja])",
    	Disp:"Vertikalna pretraga i referenca na navedene ćelije.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "„TAČNO“"
          	 }, {
          		 label : "${0} - Tačno podudaranje",
          		 result : "„NETAČNO“"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(broj${1} [tip])",
    	Disp:"Vraća dan u nedelji za vrednost datuma u obliku celog broja.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Brojevi od 1 (nedelja) do 7 (subota)",
          		 result : 1
          	 }, {
          		 label : "${0} - Brojevi od 1 (ponedeljak) do 7 (nedelja)",
          		 result : 2
          	 }, {
          		 label : "${0} - Brojevi od 0 (ponedeljak) do 6 (nedelja)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Brojevi od 1 (ponedeljak) do 7 (nedelja)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (utorak) do 7 (ponedeljak)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (sreda) do 7 (utorak)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (četvrtak) do 7 (sreda)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (petak) do 7 (četvrtak)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (subota) do 7 (petak)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Brojevi od 1 (nedelja) do 7 (subota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(broj${1} [režim])",
    	Disp:"Izračunava nedelju u kalendaru koja odgovara navedenom datumu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - nedelja",
          		 result : 1
          	 }, {
          		 label : "${0} - ponedeljak",
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
    	Syntax:"${0}(datum početka${1} dani${1} [praznici])",
    	Disp:"Vraća serijski broj datuma pre ili posle navedenog broja radnih dana."
    },
    XNPV:{   
    	Syntax:"${0}(stopa${1} vrednosti${1} datumi)",
    	Disp:"Računa sadašnju neto vrednost za praćenje tokova novca."
    },
    YEAR:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća godinu vrednosti datuma kao ceo broj."
    }
}
})

