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
    	Disp:"Vraća arkus kosinusa broja. Ugao je vraćen u radijanima."
    },
    ACOSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolni kosinus broja."
    },
    ADDRESS:{
         Syntax:"${0}(red${1} kolona${1} [aps]${1} [a1]${1} [list])",
         Disp:"Vraća referencu kao tekst u ćeliji.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Apsolutno",
        		 result : 1
        	 }, {
        		 label : "${0} - Apsolutni red / Relativna kolona",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativni red / Apsolutni kolona",
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
    	Disp:"Vraća arkus sinusa broja. Ugao je vraćen u radijanima."
    },
    ASINH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolni sinus broja."
    },
    ATAN:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća arkus tangensa broja. Ugao je vraćen u radijanima."
    },
    AVERAGE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosjek argumenata."
    },
    AVERAGEA:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća prosječnu vrijednost za uzorak. Tekst je vrednovan kao nula."
    },
    ATAN2:{
    	Syntax:"${0}(x_broj${1} y_broj)",
    	Disp:"Vraća arkus tangensa ili inverzni tangens navedenih x- i y-koordinata. Arkus tangens je ugao od x-osi do linije koja sadrži izvor (0, 0) i tačku s koordinatama (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća inverzni hiperbolički tangens broja. Broj mora biti između -1 i 1 (isključujući -1 i 1)."
    },
    BASE:{    
    	Syntax:"${0}(broj${1} baza${1} [minimalna dužina])",
    	Disp:"Pretvara pozitivni cijeli broj u tekst iz broja u definisanu bazu."
    },
    BIN2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Pretvara binarni broj u decimalni broj."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara binarni broj u heksadecimalni broj."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara binarni broj u oktalni broj."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća numerički kod za prvi znak u tekstualnom stringu koji kodira u unicode"
    },
    COS:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kosinus danog ugla."
    },
    COSH:{
    	Syntax:"${0}(broj)",
    	Disp:"Vraća hiperbolni kosinus broja."
    },
    COMBIN:{
    	Syntax:"${0}(broj${1} izabrani_broj)",
    	Disp:"Vraća broj kombinacija za dati broj stavki. Koristite ${0} da odredite ukupni mogući broj grupa za dani broj stavki."
    },
    CEILING:{  
    	Syntax: "${0}(broj${1} povećanje)",
    	Disp:"Zaokružuje broj na najbliži cijeli broj ili na djeljiv broj značajne vrijednosti."
    },
    CHAR: {
    	Syntax: "${0}(broj)",
    	Disp: "Vraća znak mapiran brojem. Nađe znak u mapi znakova. Broj je između 1 i 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp: "Nalazi i vraća odgovarajuću vrijednost s obzirom na indeks. Može BIRATI između 30 vrijednosti."
    },
    COLUMN:{    
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj kolone reference."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrica)",
    	Disp:"Vraća broj kolona u matrici ili referenci."
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
       		 label : "${0} - Jarda",
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
       		 label : "${0} - Milimetara živinog stuba (Torr)",
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
       		 label : "${0} - Stepeni Celsiusa",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Stepeni Fahrenheita",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Čajna kašičica",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Kašika",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Tekuća unca",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Šolja",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - SAD pinta",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - VB pinta",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Četvrtina",
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
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Kombinuje nekoliko tekstualnih stringova u jedan string."
    },
    COUNT:{   
    	Syntax:"${0}(vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp:"Broji koliko je brojeva na listi argumenata. Tekstualni unosi su ignorisani."
    },
    COUNTA:{   
    	Syntax:"${0}(vrijednost1${1} [vrijednost2]${1} ...)",
    	Disp:"Broji koliko vrijednosti je u listi argumenata."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(interval)",
    	Disp: "Broji prazne ćelije u navedenom intervalu."
    },
    COUNTIF:{
    	Syntax: "${0}(interval${1} kriterij)",
    	Disp:"Broji argumente koji odgovaraju postavljenim uslovima."
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
	    		label: "${0} - Broj dana između početnog datuma i krajnjeg datuma, ignorišući mjesece i godine.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Broj mjeseci između početnog datuma i krajnjeg datuma, ignorišući godine.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Broj dana između početnog datuma i krajnjeg datuma, ignoririšući godine.",
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
    	Disp:"Vraća dan za danu vrijednost datuma. Dan je vraćen kao cijeli broj između 1 i 31. Također možete upisati negativne vrijednosti datum/vrijeme."
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
    	Disp:"Pretvara decimalni broj u binarni broj."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara decimalni broj u heksadecimalni broj."
    },
    DEC2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara decimalni broj u oktalni broj."
    },
    DEGREES:{	
	    Syntax:"${0}(kut)",
	    Disp:"Pretvara radijane u stepene."
    },
    DOLLAR:{
    	Syntax:"${0}(broj${1} [decimale])",
    	Disp:"Pretvara broj u tekst, koristeći $ (dolar) format valute."
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
    	Disp: "Uspoređuje dva tekstualna stringa i vraća TRUE ako su identični. Ova funkcija je osjetljiva na veličinu slova."
    },
    EXP:{    
    	Syntax:"${0}(broj)",
    	Disp: "Vraća e podignut na dati broj."
    },
    FACT:{  
    	Syntax:"${0}(broj)",
    	Disp:"Izračunava faktorijele broja."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrijednost FALSE."
    },
    FIND:{   
    	Syntax:"${0}(traženi tekst${1} tekst${1} [pozicija])",
    	Disp:"Traži tekstualni string unutar drugog teksta (osjetljivo na veličinu slova)."
    },
    FIXED:{
    	Syntax:"${0}(broj${1} [decimale]${1} [no_commas])",
    	Disp:"Formatira broj kao tekst s fiksnim brojem decimala.",
    	Arguments: {
    		2 : [{
    			label : "${0} - sprečava zareze",
    			result : "TRUE"
    		}, {
    			label : "${0} - ne sprečava zareze",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(broj${1} važnost)",
    	Disp:"Zaokružuje broj na najbliži manji djeljiv broj značajne vrijednosti."
    },
    FORMULA:{   
    	Syntax:"${0}(referenca)",
    	Disp:"Vraća formulu od ćelije s formulom."
    },
    FREQUENCY:{   
    	Syntax:"${0}(matrica_data${1} matrica_bins)",
    	Disp:"Kategorizuje vrijednosti u intervale i sabire broj vrijednosti u svakom intervalu."
    },
    HEX2BIN:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara heksadecimalni broj u binarni broj."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Pretvara heksadecimalni broj u decimalni broj."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara heksadecimalni broj u oktalni broj."
    },
    HOUR:{   
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj sati dana (0-23) za vrijednost vremena."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kriterij_traženja${1} matrica${1} Indeks${1} [sortirano])",
    	Disp:"Horizontalno traženje i referenca do ćelija lociranih ispod.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Tačno podudaranje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(url${1} [tekst_ćelije])",
    	Disp:"Vraća hiperlink koja pokazuje na mrežni resurs naveden u url-u, koji prikazuje (opcijski) tekst_u_ćeliji."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_vrijednost]${1} [otherwise_vrijednost])",
    	Disp:"Navodi logički test za izvođenje."
    },
    INDEX:{    
    	Syntax:"${0}(referenca${1} red${1} [kolona]${1} [interval])",
    	Disp:"Vraća referencu u ćeliju iz definisanog intervala."
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
    LEFT:{
        Syntax:"${0}(tekst${1} [dužina])",
    	Disp:"Vraća određeni broj znakova od početka teksta."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća dužinu tekstualnog stringa."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Vraća broj bajtova tekstualnog stringa."
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
    	Disp:"Definiše poziciju u matrici nakon uspoređivanja vrijednosti.",
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
    	Disp:"Vraća maksimalnu vrijednost u listi argumenata."
    },
    MEDIAN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća srednju vrijednost, ako je dat neparan broj ili vrijednosti. U suprotnom, vraća aritmetički prosjek dvije srednje vrijednosti."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} broj${1} broj)",
    	Disp:"Vraća djelimičan tekstualni string od teksta."
    }, 
    MIN:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća minimalnu vrijednost u listi argumenata."
    },    
    MINUTE:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj minuta sata(0-59) za vrijednost vremena."
    },    
    MOD:{    
    	Syntax:"${0}(broj_za_dijeljenje${1} divizor)",
    	Disp:"Vraća ostatak kad se podijeli broj za dijeljenje s djeliteljem."
    },
    MODE:{    
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Vraća najveću zajedničku vrijednost u primjeru."
    },
    MONTH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća mjesec za datu vrijednost datuma. Mjesec je vraćen kao cijeli broj između 1 i 12."
    },
    MMULT:{    
    	Syntax:"${0}(matrica${1} matrica)",
    	Disp:"Množenje matrice. Vraća proizvod dvije matrice."
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
    	Disp:"Utvrđuje trenutno vrijeme računara."
    },
    OCT2BIN:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara oktalni broj u binarni broj."
    },
    OCT2DEC:{
    	Syntax:"${0}(broj)",
    	Disp:"Pretvara oktalni broj u decimalni broj."
    },
    OCT2HEX:{
    	Syntax:"${0}(broj${1} [mjesta])",
    	Disp:"Pretvara oktalni broj u heksadecimalni broj."
    },
    ODD:{    
    	Syntax:"${0}(broj)",
    	Disp:"Zaokružuje broj na najbliži veći neparni cijeli broj različit od nule."
    },
    OFFSET:{
    	Syntax:"${0}(reference${1} redovi${1} kolone${1} [visina]${1} [širina])",
    	Disp:"Vraća referencu u interval koji je navedeni broj redova i kolona od ćelije ili intervala ćelija."
    },
    OR:{    
    	Syntax:"${0}(logička vrijednost 1${1} [logička vrijednost 2]${1} ...)",
    	Disp:"Vraća TRUE ako je barem jedan argument TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vraća približnu vrijednost od Pi."
    },
    POWER:{    
    	Syntax:"${0}(baza${1} potencija)",
    	Disp:"Podiže broj na zadanu potenciju."
    },
    PRODUCT:{   
    	Syntax:"${0}(broj 1${1} [broj 2]${1} ...)",
    	Disp:"Množi sve brojeve date kao argumente i vraća umnožak."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Pretvara tekstualni string u odgovarajuću veličinu slova, prvo slovo svake riječi u veliko slovo, a sva ostala u mala slova."
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
    REPLACE:{    
    	Syntax: "${0}(tekst${1} pozicija${1} dužina${1} novi_tekst)",
    	Disp:"Zamjenjuje znakove unutar tekstualnog stringa drugim tekstualnim stringom."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} brojač)",
    	Disp:"Ponavlja tekst dati broj puta."	
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
    	Disp:"Zaokružuje broj na preddefinisanu tačnost."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(broj${1} brojač)",
    	Disp:"Zaokružuje broj na preddefinisanu tačnost prema dole."
    },
    ROUNDUP:{   
    	Syntax: "${0}(broj${1} brojač)",
    	Disp:"Zaokružuje broj na preddefinisanu tačnost prema gore."
    },
    ROW:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Definiše interni broj reda reference."
    },
    ROWS:{   
    	Syntax:"${0}(matrica)",
    	Disp:"Vraća broj redova u matrici ili referenci."
    },
    RADIANS:{   
    	Syntax:"${0}(kut)",
    	Disp:"Pretvara stepene u radijane."
    },
    ROMAN:{   
    	Syntax:"${0}(broj${1} [oblik])",
    	Disp:"Pretvara arapske brojeve u rimske, kao tekst.",
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
    	Syntax:"${0}(traženi tekst${1} tekst${1} [pozicija])",
    	Disp:"Traži vrijednost teksta unutar drugog teksta (nije osjetljivo na veličinu slova)."
    },  
    SIN:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća sinus datog ugla."
    },
    SINH:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća hiperbolni sinus broja."
    },
    SECOND:{    
    	Syntax:"${0}(broj)",
    	Disp:"Određuje uzastopan broj sekundi minute(0-59) za vrijednost vremena."
    },
    SHEET:{   
    	Syntax:"${0}([referenca])",
    	Disp:"Vraća interni broj lista od reference ili stringa."
    },
    SMALL:{   
    	Syntax:"${0}(matrica${1} n-ta_pozicija)",
    	Disp:"Vraća n-tu najmanju vrijednost iz skupa vrijednosti."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} stari${1} novi${1} [koji])",
    	Disp:"Vraća tekst gdje je stari tekst zamijenjen novim tekstom."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcija${1} rang${1} ...)",
    	Disp:"Računa međuzbirove u proračunskoj tabeli.",
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
    	Disp:"Vraća zbir svih argumenata."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrica 1${1} [matrica 2]${1} ...)",
    	Disp:"Vraća zbir proizvoda argumenata matrice."
    },
    SUMIF:{   
    	Syntax:"${0}(interval${1} kriterij${1} [ukupni interval])",
    	Disp:"Sabire argumente koji odgovaraju uvjetima."
    },
    SQRT:{   
    	Syntax:"${0}(broj)",
    	Disp:"Vraća kvadratni korijen broja."
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
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Pretvara argumente u tekst."
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
    	Disp:"Utvrđuje trenutni datum računara."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Uklanja sve vodeće i krajnje razmake. Bilo koji drugi string od 2 ili više unutrašnjih razmaka je zamijenjen jednostrukim razmakom."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vraća logičku vrijednost TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(broj${1} [brojanje])",
    	Disp:"Skraćuje broj decimalnih mjesta broja."
    },
    TYPE:{   
    	Syntax:"${0}(vrijednost)",
    	Disp:"Definiše tip podataka za vrijednost."	
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
    	Disp:"Vertikalno pretraživanje i referenca na pokazane ćelije.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Približno podudaranje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Tačno podudaranje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(broj${1} [tip])",
    	Disp:"Vraća dan u sedmici za vrijednost datuma kao cijeli broj.",
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
    	Disp:"Računa kalendarski sedmicu koja odgovara datom datumu.",
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
    YEAR:{    
    	Syntax:"${0}(broj)",
    	Disp:"Vraća godinu od vrijednosti datuma kao cijeli broj."
    }
}
})
