/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Vse formule",
	LABEL_FORMULA_LIST: "Seznam formul:",
	formula:{
	ABS:{	
	    Syntax:"${0}(število)",
	    Disp:"Vrne absolutno vrednost števila."
    },
    ACOS:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne arkus kosinus števila. Kot je izražen v radianih."
    },
    ACOSH:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne inverzni hiperbolični kosinus števila."
    },
    ACOT:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne inverzni kotangens števila. Kot je izmerjen v radianih."
    },
    ACOTH:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne inverzni hiperbolični kotangens števila."
    },
    ADDRESS:{
         Syntax:"${0}(vrstica${1} stolpec${1} [abs]${1} [a1]${1} [list])",
         Disp:"Vrne sklic v celico kot besedilo.",
         Arguments: {
        	 2 : [{
        		 label : "${0} – absolutno",
        		 result : 1
        	 }, {
        		 label : "${0} – absolutna vrstica / relativen stolpec",
        		 result : 2
        	 }, {
        		 label : "${0} – relativna vrstica / absoluten stolpec",
        		 result : 3
        	 }, {
        		 label : "${0} – relativno",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} – slog R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} – slog A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(logična vrednost 1${1} [logična vrednost 2]${1} ...)",
    	Disp:"Vrne TRUE, če so vsi argumenti TRUE."
    },
    ASIN:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne arkus sinus števila. Kot je izražen v radianih."
    },
    ASINH:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne inverzni hiperbolični sinus števila."
    },
    ATAN:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne arkus tangens števila. Kot je izražen v radianih."
    },
    AVERAGE:{    
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne povprečno vrednost argumentov."
    },
    AVERAGEA:{    
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne povprečno vrednost vzorca. Besedilo se oceni kot nič."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(obseg${1} kriteriji${1} [povprečni_obseg])",
    	Disp:"Vrne povprečno vrednost (aritmetično sredino) argumentov, ki izpolnjujejo podani pogoj."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(povprečni_obseg${1} obseg_kriterijev1${1} kriteriji1${1} ...)",
    	Disp:"Vrne povprečno vrednost (aritmetično sredino) argumentov, ki izpolnjujejo več pogojev."
    },
    ATAN2:{
    	Syntax:"${0}(x_štev${1} y_štev)",
    	Disp:"Vrne arkus tangens ali inverzni tangens iz navedenih koordinat X in Y. Arkus tangens je kot od osi x do črte, ki vsebuje izvor (0, 0), in točke s koordinatama (x_štev, y_štev)."
    },
    ATANH:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne inverzni hiperbolični tangens števila. Število mora biti med -1 in 1 (izključujoč -1 in 1)."
    },
    BASE:{    
    	Syntax:"${0}(število${1} osnova${1} [najmanjša dolžina])",
    	Disp:"Pretvori pozitivno celo število v besedilo iz številčnega sistema v opredeljeno osnovo."
    },
    BIN2DEC:{
    	Syntax:"${0}(število)",
    	Disp:"Pretvori binarno število v decimalno število."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori binarno število v šestnajstiško število."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori binarno število v osmiško število."
    },
    CEILING:{  
    	Syntax: "${0}(število${1} povečanje)",
    	Disp:"Zaokroži število na najbližje celo število ali na najbližji mnogokratnik značilnega števila."
    },
    CHAR: {
    	Syntax: "${0}(število)",
    	Disp: "Vrne znak, ki ga preslikava število. Znak najde v preslikavi znakov Unicode. Število je med 1 in 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} vrednost1${1} [vrednost2]${1} ...)",
    	Disp: "Poišče in vrne ustrezno vrednost v sladu z indeksom. Izbira lahko med največ 30 vrednostmi."
    },
    CODE:{
    	Syntax:"${0}(besedilo)",
    	Disp:"Vrne številsko kodo za prvi znak v besedilnem nizu, ki je zakodiran s standardom Unicode."
    },
    COLUMN:{    
    	Syntax:"${0}([sklic])",
    	Disp:"Vrne notranjo številko stolpca v sklicu."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrika)",
    	Disp:"Vrne številke stolpcev v matriki ali sklicu."
    },
    COMBIN:{
    	Syntax:"${0}(število${1} število_izbrano)",
    	Disp:"Vrne število kombinacij za dano število predmetov. Če želite določiti največje možno število skupin za dano število predmetov, uporabite argument ${0}."
    },
    CONCATENATE:{   
    	Syntax:"${0}(besedilo 1${1} ...)",
    	Disp:"Združi več besedilnih nizov v en besedilni niz."
    },
    CONVERT:{
    	Syntax:"${0}(število${1} iz_enote${1} v_enoto)",
    	Disp:"Pretvori število iz enega merskega sistema v drugega.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} – gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} – slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} – masa funta (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} – u (enota atomske mase)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} – masa unče (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} – meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} – statutarna milja",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} – palec",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} – čevelj",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} – seženj",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} – angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} – pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} – leto",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} – dan",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} – ura",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} – minuta",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} – sekunda",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} – pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} – atomosfera",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} – milimetri živega srebra (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} – newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} – dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} – sila funta",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} – joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} – erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} – mednarodna kalorija",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} – elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} – konjska moč na uro",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} – vatna ura",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} – čevelj-funt",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} – britanska toplotna enota",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} – termodinamična kalorija",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} – konjska moč",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} – watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} – tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} – gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} – stopinja Celzija",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} – stopinja Fahrenheita",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} – kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} – čajna žlička",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} – jedilna žlica",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} – tekočinska unča",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} – skodelica",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} – ameriški pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} – angleški pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} – kvart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} – galona",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} – liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne kosinus danega kota."
    },
    COSH:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne hiperbolični kosinus števila."
    },
    COT:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne kotangens podanega števila."
    },
    COTH:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne hiperbolični kotangens podanega števila."
    },
    COUNT:{   
    	Syntax:"${0}(vrednost1${1} [vrednost2]${1} ...)",
    	Disp:"Prešteje, koliko števil je na seznamu argumentov. Besedilni vnosi se prezrejo."
    },
    COUNTA:{   
    	Syntax:"${0}(vrednost1${1} [vrednost2]${1} ...)",
    	Disp:"Prešteje, koliko vrednosti je na seznamu argumentov."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(obseg)",
    	Disp: "Prešteje število praznih celic v določenem obsegu."
    },
    COUNTIF:{
    	Syntax: "${0}(obseg${1} kriteriji)",
    	Disp:"Prešteje število celic, ki izpolnjujejo podani pogoj."
    },
    COUNTIFS:{
    	Syntax: "${0}(obseg_kriterijev1${1}kriteriji1${1} ...)",
    	Disp:"Prešteje število celic, ki izpolnjujejo več pogojev."
    },
    CUMIPMT:{	
	    Syntax:"${0}(mera${1} obdobja${1} sv${1} začetno_obdobje${1} končno_obdobje${1} vrsta)",
	    Disp:"Izračuna kumulativne obresti, plačane med dvema podanima obdobjema."
    },
    CUMPRINC:{	
	    Syntax:"${0}(mera${1} obdobja${1} sv${1} začetno_obdobje${1} končno_obdobje${1} vrsta)",
	    Disp:"Izračuna kumulativno glavnico, plačano na posojilo med dvema podanima obdobjema."
    }, 
    DATE:{	
	    Syntax:"${0}(leto${1} mesec${1} dan)",
	    Disp:"Vrne notranje število navedenega datuma."
    },  
    DATEDIF:{	
	    Syntax:"${0}(začetni datum${1} končni datum${1} oblika)",
	    Disp:"Vrne razliko v letih, mesecih ali dneh med dvema datumoma.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} – število celih let v obdobju.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} – število celih mesecev v obdobju.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} – število dni v obdobju.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Število dni med datumom začetka in datumom konca, pri čemer se prezrejo meseci in leta.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Število mesecev med datumom začetka in datumom konca, pri čemer se prezrejo leta.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Število dni med datumom začetka in datumom konca, pri čemer se prezrejo leta.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(besedilo)",
	    Disp:"Vrne notranje število za besedilo, ki je v možni obliki datuma."
    }, 
    DAY:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne dan dane vrednosti datuma. Dan je naveden kot celo število med 1 in 31. Za datum/čas lahko vnesete tudi negativno vrednost."
    },
    DAYS360:{
    	Syntax:"${0}(začetni_datum${1} končni_datum${1} [metoda])",
    	Disp:"Izračuna število dni med dvema datumoma na podlagi leta s 360 dnevi.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} – ameriška metoda (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} – evropska metoda",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(začetni_datum${1} končni_datum${1})",
    	Disp:"Izračuna število dni med dvema datumoma."
    },
    DEC2BIN:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori decimalno število v binarno število."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori decimalno število v šestnajstiško število."
    },
    DEC2OCT:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori decimalno število v osmiško število."
    },
    DEGREES:{	
	    Syntax:"${0}(kot)",
	    Disp:"Pretvori radiane v stopinje."
    },
    DISC:{
    	Syntax:"${0}(poravnava${1} zapadlost${1} pr${1} odkup${1} [osnova])",
    	Disp:"Izračuna stopnjo popusta za vrednostni papir."
    }, 
    DOLLAR:{
    	Syntax:"${0}(število${1} [decimalna mesta])",
    	Disp:"Pretvori število v besedilo, pri čemer uporabi obliko valute $ (dolar)."
    },
    EDATE:{
    	Syntax:"${0}(začetni_datum${1} meseci)",
    	Disp:"Vrne serijsko številko, ki predstavlja datum, ki je naznačeno število mesecev pred začetnim_datumom ali po njem."
    },
    EOMONTH:{
    	Syntax:"${0}(začetni_datum${1} meseci)",
    	Disp:"Vrne serijsko številko za zadnji dan v mesecu, ki je naznačeno število mesecev pred začetnim_datumom ali po njem."
    },
    ERFC:{   
    	Syntax:"${0}(število)",
        Disp:"Vrne komplementarno funkcijo napake, integrirano med številom in neskončnostjo."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(sklic)",
    	Disp:"Vrne število, ki ustreza vrsti napake."
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
    	Syntax:"${0}(število)",
    	Disp:"Vrne število, zaokroženo na najbližje sodo celo število."
    },
    EXACT:{    
    	Syntax:"${0}(besedilo 1${1} besedilo 2)",
    	Disp: "Primerja dva besedilna niza in vrne TRUE, če sta identična. Funkcija razlikuje med velikimi in malimi črkami."
    },
    EXP:{    
    	Syntax:"${0}(število)",
    	Disp: "Vrne e na potenco navedenega števila."
    },
    FACT:{  
    	Syntax:"${0}(število)",
    	Disp:"Vrne fakulteto števila."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(število)",
        Disp:"Vrne dvojno fakulteto števila."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Vrne logično vrednost FALSE."
    },
    FIND:{   
    	Syntax:"${0}(besedilo za iskanje${1} besedilo${1} [položaj])",
    	Disp:"Poišče niz besedila znotraj drugega (razlikuje med velikimi in malimi črkami)."
    },
    FIXED:{
    	Syntax:"${0}(število${1} [decimalna mesta]${1} [brez_vejic])",
    	Disp:"Oblikuje število kot besedilo s fiksnim številom decimalnih mest.",
    	Arguments: {
    		2 : [{
    			label : "${0} – prepreči vejice",
    			result : "TRUE"
    		}, {
    			label : "${0} – ne prepreči vejic",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(število${1} pomembnost)",
    	Disp:"Zaokroži število navzdol na najbližji mnogokratnik značilnega števila."
    },
    FORMULA:{   
    	Syntax:"${0}(sklic)",
    	Disp:"Vrne formulo celice s formulo."
    },
    FREQUENCY:{   
    	Syntax:"${0}(Seznam zaporedja števil_podatki${1} Seznam zaporedja števil_koši)",
    	Disp:"Kategorizira vrednosti v intervale in prešteje število vrednosti v vsakem intervalu."
    },
    FV:{
    	Syntax:"${0}(mera${1} obdobja${1} pmt${1} [sv]${1} [vrsta])",
    	Disp:"Izračuna bodočo vrednost naložbe na osnovi stalne obrestne mere."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(glavnica${1} razpored)",
        Disp:"Izračuna bodočo vrednost začetne glavnice po uporabi zaporedja sestavljenih obrestnih mer."
    },
    GAMMALN:{   
    	Syntax:"${0}(število)",
        Disp:"Vrne naravni logaritem funkcije gama."
    },
    GCD:{   
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
        Disp:"Vrne največji skupni delitelj vseh argumentov."
    },
    HEX2BIN:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori šestnajstiško število v binarno število."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(število)",
    	Disp:"Pretvori šestnajstiško število v decimalno število."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori šestnajstiško število v osmiško število."
    },
    HOUR:{   
    	Syntax:"${0}(število)",
    	Disp:"Določi zaporedno število ure dneva (0–23) za časovno vrednost."
    },
    HLOOKUP:{   
    	Syntax:"${0}(iskalni_kriteriji${1} matrika${1} indeks${1} [razvrščeno])",
    	Disp:"Išče vodoravno in se sklicuje na celice pod.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} – približno ujemanje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} – točno ujemanje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(povezava${1} [besedilo_celice])",
    	Disp:"Vrne povezavo, ki usmerja k omrežnemu viru ali obsegu, na katerega se sklicuje povezava. Prikaže besedilo_celice (izbirno), če je na voljo; drugače prikaže povezavo kot besedilo."
    },    
    IF:{    
    	Syntax:"${0}(preskus${1} [vrednost_za_potem]${1} [vrednost_za_sicer])",
    	Disp:"Navede logičen preskus, ki se bo izvedel."
    },
    IFS:{
    	Syntax:"${0}(preskus1${1} vrednost_če_je_true1${1} ...)",
    	Disp:"Zažene logične teste, s katerimi se preveri, ali so izpolnjeni nekateri kriteriji, in vrne vrednost, ki ustreza prvemu pogoju TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(vrednost${1} vrednost_če_napaka)",
    	Disp:"Vrne vrednost, ki jo določite, če je izraz napaka. Sicer vrne rezultat izraza."
    },
    IFNA:{
    	Syntax:"${0}(vrednost${1} vrednost_if_na)",
    	Disp:"Vrne vrednost, ki jo določite, če izraz vrne vrednost napake #N/A. Sicer vrne rezultat izraza."
    },
    INDEX:{    
    	Syntax:"${0}(sklic${1} vrstica${1} [stolpec]${1} [obseg])",
    	Disp:"Vrne sklic na celico iz navedenega obsega."
    },
    INDIRECT:{    
    	Syntax:"${0}(sklic${1} [slog_sklica])",
    	Disp:"Vrne vsebino celice, na katero se sklicuje v besedilni obliki.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} – slog R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} – slog A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(število)",
    	Disp:"Zaokroži število navzdol na najbližje celo število."
    },
    IPMT:{
    	Syntax:"${0}(mera${1} obdobje${1} obdobja${1} sv${1} [fv]${1} [vrsta])",
    	Disp:"Izračuna odplačilni znesek obresti za določeno obdobje za naložbo na podlagi rednih plačil in fiksne obrestne mere."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je celica, na katero se sklicuje, prazna, v nasprotnem primeru vrne FALSE."
    },
    ISERR:{
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost vrednost napake, ki ni enaka #N/V."
    },
    ISERROR:{
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost napačna vrednost."
    },
    ISEVEN:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost sodo število, v nasprotnem primeru vrne FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(sklic)",
    	Disp:"Vrne TRUE, če je celica celica s formulo."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če celica vsebuje logično število."
    },
    ISNA:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost enaka #N/V."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne true, če vrednost ni besedilo."
    },
    ISNUMBER:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost število."
    },
    ISODD:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost liho celo število."
    },
    ISPMT:{
    	Syntax:"${0}(mera${1} obdobje${1} obdobja${1} sv)",
    	Disp:"Izračuna obresti, plačane med določenim obdobjem za naložbo."
    }, 
    ISREF:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost sklic."
    },
    ISTEXT:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Vrne TRUE, če je vrednost besedilo."
    },
    LARGE:{
        Syntax:"${0}(matrika${1} n-ti_položaj)",
    	Disp:"Vrne n-to največjo vrednost v naboru podatkov."
    },
    LCM:{   
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
        Disp:"Vrne najmanjši skupni večkratnik vseh števil na seznamu."
    },
    LEFT:{
        Syntax:"${0}(besedilo${1} [dolžina])",
    	Disp:"Vrne navedeno število znakov z začetka besedila."
    },
    LEN:{
    	Syntax:"${0}(besedilo)",
    	Disp:"Vrne dolžino besedilnega niza."
    },
    LENB:{
    	Syntax:"${0}(besedilo)",
    	Disp:"Vrne število bajtov besedilnega niza."
    },
    LN:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne naravni logaritem števila."
    },
    LOG:{
    	Syntax:"${0}(število${1} [osnova])",
    	Disp:"Vrne logaritem števila za navedeno osnovo."
    },
    LOG10:{
    	Syntax:"${0}(število)",
    	Disp:"Vrne logaritem števila z osnovo 10."
    },
    LOOKUP:{
    	Syntax: "${0}(kriterij iskanja${1} vektor iskanja${1} [vektor_rezultata])",
    	Disp:"Poišče vrednosti v vektorju s primerjavo z vrednostmi v drugem vektorju."
    },
    LOWER:{    
    	Syntax:"${0}(besedilo)",
    	Disp:"Pretvori besedilo v male črke."
    },    
    MATCH:{    
    	Syntax: "${0}(kriterij iskanja${1} matrika za iskanje${1} [vrsta])",
    	Disp:"Določi položaj v matriki po primerjavi vrednosti.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} – manj kot",
         		 result : 1
         	 }, {
         		 label : "${0} – točno ujemanje",
         		 result : 0
         	 }, {
         		 label : "${0} – več kot",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne največjo možno vrednost na seznamu argumentov."
    },
    MEDIAN:{    
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne srednjo vrednost, če je dano liho število vrednosti. V nasprotnem primeru vrne aritmetično sredino dveh srednjih vrednosti."
    },
    MID:{    
    	Syntax:"${0}(besedilo${1} število${1} število)",
    	Disp:"Vrne delni besedilni niz."
    }, 
    MIN:{    
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne najmanjšo vrednost na seznamu argumentov."
    },    
    MINUTE:{    
    	Syntax:"${0}(število)",
    	Disp:"Določi zaporedno število za minuto ure (0-59) za časovno vrednost."
    },    
    MOD:{    
    	Syntax:"${0}(deljeno_število${1} delitelj)",
    	Disp:"Vrne ostanek, kadar je deljeno število deljeno z deliteljem."
    },
    MODE:{    
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne najpogostejšo vrednost v vzorcu."
    },
    MONTH:{    
    	Syntax:"${0}(število)",
    	Disp:"Vrne mesec za dano datumsko vrednost. Mesec je naveden kot celo število med 1 in 12."
    },
    MROUND:{   
    	Syntax: "${0}(število${1} večkratnik)",
        Disp:"Vrne število, zaokroženo na podani večkratnik."
    },
    MMULT:{    
    	Syntax:"${0}(matrika${1} matrika)",
    	Disp:"Množenje matrik. Vrne zmnožek dveh matrik."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
        Disp:"Vrne polinomski koeficient nabora števil."
    },
    N:{    
    	Syntax:"${0}(vrednost)",
    	Disp:"Pretvori vrednost v število."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Vrne vrednost napake #N/V."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(začetni_datum${1} končni_datum${1} [prazniki])",
    	Disp:"Vrne število vseh delovnih dni med dvema datumoma."
    },
    NOT:{    
    	Syntax:"${0}(logična vrednost)",
    	Disp:"Obrne vrednost argumenta."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Določi trenutni čas računalnika."
    },
    NPV:{   
    	Syntax:"${0}(mera${1} vrednost 1${1} [vrednost 2]${1} ...)",
        Disp:"Izračuna neto sedanjo vrednost naložbe na podlagi podane stopnje popusta ter zaporedja prihodnjih plačil in prihodkov."
    },
    OCT2BIN:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori osmiško število v binarno število."
    },
    OCT2DEC:{
    	Syntax:"${0}(število)",
    	Disp:"Pretvori osmiško število v decimalno število."
    },
    OCT2HEX:{
    	Syntax:"${0}(število${1} [mesta])",
    	Disp:"Pretvori osmiško število v šestnajstiško število."
    },
    ODD:{    
    	Syntax:"${0}(število)",
    	Disp:"Zaokroži število navzgor na najbližje liho celo število, kjer \"navzgor\" pomeni \"stran od 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(sklic${1} vrstice${1} stolpci${1} [višina]${1} [širina])",
    	Disp:"Vrne sklic na obseg, ki je določeno število vrstic in stolpcev iz celice ali obsega celic."
    },
    OR:{    
    	Syntax:"${0}(logična vrednost 1${1} [logična vrednost 2]${1} ...)",
    	Disp:"Vrne TRUE, če je vsaj en argument TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Vrne vrednost števila pi."
    },
    PMT:{
    	Syntax:"${0}(mera${1} obdobja${1} sv${1} [fv]${1} [vrsta])",
    	Disp:"Vrne plačilo za posojilo na podlagi rednih plačil in fiksne obrestne mere."
    },
    POWER:{    
    	Syntax:"${0}(osnova${1} potenca)",
    	Disp:"Poveča število na potenco drugega."
    },
    PPMT:{
    	Syntax:"${0}(mera${1} obdobje${1} obdobja${1} sv${1} [fv]${1} [vrsta])",
    	Disp:"Izračuna odplačilni znesek za določeno obdobje za naložbo na podlagi rednih plačil in fiksne obrestne mere."
    },
    PRICEDISC:{
    	Syntax:"${0}(poravnava${1} zapadlost${1} popust${1} odkup${1} [osnova])",
    	Disp:"Izračuna ceno na 100 ameriških dolarjev nominalne vrednosti za vrednostni papir s popustom."
    },
    PRICEMAT:{
    	Syntax:"${0}(poravnava${1} zapadlost${1} izdaja${1} mera${1} donos${1} [osnova])",
    	Disp:"Izračuna ceno na 100 ameriških dolarjev nominalne vrednosti za vrednostni papir, ki ob zapadlosti izplača obresti."
    },
    PRODUCT:{   
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Zmnoži vsa števila, dana kot argumente, in vrne zmnožek."
    },
    PROPER:{    
    	Syntax:"${0}(besedilo)",
    	Disp:"Pretvori besedilni niz v ustrezno uporabo velikih in malih črk; prvo črko v vsaki besedi piše z veliko začetnico in vse ostale črke z malo."
    },
    PV:{
    	Syntax:"${0}(mera${1} obdobja${1} pmt${1} [fv]${1} [vrsta])",
    	Disp:"Izračuna sedanjo vrednost naložbe na podlagi zaporedja prihodnjih plačil."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(števec${1} imenovalec)",
        Disp:"Vrne rezultat deljenja števila z drugim številom, zaokrožen na celo število."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Vrne naključno število med 0 in 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(spodnje${1} zgornje)",
    	Disp: "Vrne naključno celo število med števili, ki jih navedete."
    },
    RANK:{    
    	Syntax:"${0}(število${1} sklic${1} [vrstni red])",
    	Disp: "Vrne rang vrednosti v vzorcu.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} – padajoče",
          		 result : 0
          	 }, {
          		 label : "${0} – naraščajoče",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(poravnava${1} zapadlost${1} naložba${1} popust${1} [osnova])",
    	Disp:"Izračuna znesek, prejet ob zapadlosti za v celoti vložen vrednostni papir."
    }, 
    REPLACE:{    
    	Syntax: "${0}(besedilo${1} položaj${1} dolžina${1} novo besedilo)",
    	Disp:"Zamenja znake v besedilnem nizu z drugačnim besedilnim nizom."	
    },
    REPT:{    
    	Syntax: "${0}(besedilo${1} število)",
    	Disp:"Ponovi besedilo tolikokrat, kot je navedeno."	
    },
    RIGHT:{
    	Syntax: "${0}(besedilo${1} [število])",
    	Disp:"Vrne zadnji znak oziroma znake besedila."
    },
    RIGHTB:{
    	Syntax: "${0}(besedilo${1} [število])",
    	Disp:"Vrne zadnji znak oziroma znake besedila."
    },
    ROUND:{   
    	Syntax: "${0}(število${1} število)",
    	Disp:"Zaokroži število na predhodno določeno natančnost."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(število${1} število)",
    	Disp:"Zaokroži število navzdol na predhodno določeno natančnost."
    },
    ROUNDUP:{   
    	Syntax: "${0}(število${1} število)",
    	Disp:"Zaokroži število navzgor na predhodno določeno natančnost."
    },
    ROW:{   
    	Syntax:"${0}([sklic])",
    	Disp:"Vrne notranjo številko vrstice za sklic."
    },
    ROWS:{   
    	Syntax:"${0}(matrika)",
    	Disp:"Vrne število vrstic v matriki ali sklicu."
    },
    RADIANS:{   
    	Syntax:"${0}(kot)",
    	Disp:"Pretvori stopinje v radiane."
    },
    ROMAN:{   
    	Syntax:"${0}(število${1} [oblika])",
    	Disp:"Pretvori arabsko številko v rimsko kot besedilo.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – klasično",
          		 result : 0
          	 }, {
          		 label : "${0} – bolj zgoščeno",
          		 result : 1
          	 }, {
          		 label : "${0} – bolj zgoščeno",
          		 result : 2
          	 }, {
          		 label : "${0} – bolj zgoščeno",
          		 result : 3
          	 }, {
          		 label : "${0} – poenostavljeno",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(besedilo za iskanje${1} besedilo${1} [položaj])",
    	Disp:"Poišče eno besedilno vrednost v drugi (ne razlikuje med velikimi in malimi črkami)."
    },  
    SIGN:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne algebrski znak števila."
    },
    SIN:{    
    	Syntax:"${0}(število)",
    	Disp:"Vrne sinus navedenega kota."
    },
    SINH:{    
    	Syntax:"${0}(število)",
    	Disp:"Vrne hiperbolični sinus števila."
    },
    SECOND:{    
    	Syntax:"${0}(število)",
    	Disp:"Določi zaporedno število za sekundo v minuti (0-59) za časovno vrednost."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeficienti)",
        Disp:"Vrne vsoto potenciranih nizov glede na formulo."
    },
    SHEET:{   
    	Syntax:"${0}([sklic])",
    	Disp:"Vrne notranjo številko lista za sklic ali niz."
    },
    SMALL:{   
    	Syntax:"${0}(matrika${1} n-ti_položaj)",
    	Disp:"Vrne n-to najmanjšo vrednost v naboru vrednosti."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(besedilo${1} staro${1} novo${1} [kateri])",
    	Disp:"Vrne besedilo, pri katerem je staro besedilo zamenjano z novim."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funkcija${1} obseg${1} ...)",
    	Disp:"Izračuna delno vsoto v preglednici.",
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
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Vrne vsoto vseh argumentov."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrika 1${1} [matrika 2]${1} ...)",
    	Disp:"Vrne vsoto zmnožkov argumentov matrike."
    },
    SUMIF:{   
    	Syntax:"${0}(obseg${1} kriteriji${1} [obseg vsote])",
    	Disp:"Sešteje argumente, ki ustrezajo pogojem."
    },
    SUMIFS:{
    	Syntax: "${0}(obseg_vsote${1} obseg_kriterijev1${1} kriteriji1${1} ...)",
    	Disp:"Sešteje argumente, ki ustrezajo več pogojem."
    },
    SQRT:{   
    	Syntax:"${0}(število)",
    	Disp:"Vrne kvadratni koren števila."
    },
    SQRTPI:{   
    	Syntax:"${0}(število)",
        Disp:"Vrne kvadratni koren (števila * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Izračuna standardni odklon glede na vzorec."
    },
    STDEVP:
    {
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
    	Disp:"Izračuna standardni odklon glede na celotno populacijo."
    },
    SUMSQ:{
    	Syntax:"${0}(število 1${1} [število 2]${1} ...)",
        Disp:"Vrne vsoto kvadratov števil na seznamu."
    },
    T:{
    	Syntax:"${0}(besedilo)",
    	Disp:"Pretvori argumente v besedilo."
    },
    TAN:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne tangens podanega števila."
    },
    TANH:{    
    	Syntax:"${0}(število)",
        Disp:"Vrne hiperbolični tangens podanega števila."
    },
    TBILLPRICE:{
    	Syntax:"${0}(poravnava${1} zapadlost${1} popust)",
    	Disp:"Izračuna ceno na 100 ameriških dolarjev nominalne vrednosti za zakladno menico."
    },
    TEXT:{
    	Syntax:"${0}(vrednost${1} koda oblike)",
    	Disp:"Pretvori vrednost v besedilo v skladu s pravili kode številske oblike in jo vrne."
    },
    TIME:{   
    	Syntax:"${0}(ura${1} minuta${1} sekunda)",
    	Disp:"Določi časovno vrednost z navedbo ure, minute in sekunde."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(besedilo)",
	    Disp:"Vrne notranje število za besedilo, ki je v možni obliki datuma."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Določi trenutni datum računalnika."
    },    
    TRIM:{
    	Syntax:"${0}(besedilo)",
    	Disp:"Odstrani vse začetne in zaključne presledke. Kakršnokoli drugo zaporedje dveh ali več notranjih presledkov je zamenjano z enim presledkom."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Vrne logično vrednost TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(število${1} [št. mest])",
    	Disp:"Prireže število na celo število."
    },
    TYPE:{   
    	Syntax:"${0}(vrednost)",
    	Disp:"Določi vrsto podatkov za vrednost."	
    },
    UPPER:{  
    	Syntax: "${0}(besedilo)",
    	Disp:"Pretvori besedilo v velike črke."
    },
    VALUE:{    
    	Syntax: "${0}(besedilo)",
    	Disp:"Pretvori besedilni argument v število."
    },
    VAR:{    
    	Syntax: "${0}(število1${1} [število2]${1}...)",
    	Disp:"Oceni varianco glede na vzorec."
    },
    VARA:{    
    	Syntax: "${0}(število1${1} [število2]${1}...)",
    	Disp:"Oceni varianco glede na vzorec, vključno s števili, besedilom in logičnimi vrednostmi."
    },
    VARP:{    
    	Syntax: "${0}(število1${1} [število2]${1}...)",
    	Disp:"Izračuna varianco glede na celotno populacijo."
    },
    VARPA:{    
    	Syntax: "${0}(število1${1} [število2]${1}...)",
    	Disp:"Izračuna varianco glede na celotno populacijo, vključno s števili, besedilom in logičnimi vrednostmi."
    },
    VLOOKUP:{    
    	Syntax: "${0}(kriterij iskanja${1} matrika${1} indeks${1} [vrstni red razvrščanja])",
    	Disp:"Navpično iskanje in sklicevanje na navedene celice.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} – približno ujemanje",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} – točno ujemanje",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(število${1} [vrsta])",
    	Disp:"Vrne dan v tednu za datumsko vrednost kot celo število.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – števila od 1 (nedelja) do 7 (sobota)",
          		 result : 1
          	 }, {
          		 label : "${0} – števila od 1 (ponedeljek) do 7 (nedelja)",
          		 result : 2
          	 }, {
          		 label : "${0} – števila od 0 (ponedeljek) do 6 (nedelja)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} – števila od 1 (ponedeljek) do 7 (nedelja)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} – števila od 1 (torek) do 7 (ponedeljek)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} – števila od 1 (sreda) do 7 (torek)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} – števila od 1 (četrtek) do 7 (sreda)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} – števila od 1 (petek) do 7 (četrtek)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} – števila od 1 (sobota) do 7 (petek)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} – števila od 1 (nedelja) do 7 (sobota)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(število${1} [način])",
    	Disp:"Izračuna koledarski teden, ki ustreza danemu datumu.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} – nedelja",
          		 result : 1
          	 }, {
          		 label : "${0} – ponedeljek",
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
    	Syntax:"${0}(začetni datum${1} dni${1} [prazniki])",
    	Disp:"Vrne zaporedno število datuma pred navedenim številom delovnih dni ali po njem."
    },
    XNPV:{   
    	Syntax:"${0}(mera${1} vrednosti${1} datumi)",
    	Disp:"Izračuna neto sedanjo vrednost za razpored denarnih pretokov."
    },
    YEAR:{    
    	Syntax:"${0}(število)",
    	Disp:"Vrne leto datumske vrednosti kot celo število."
    }
}
})

