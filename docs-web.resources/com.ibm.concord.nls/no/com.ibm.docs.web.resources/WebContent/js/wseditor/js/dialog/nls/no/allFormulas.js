/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Alle formler",
	LABEL_FORMULA_LIST: "Formelliste:",
	formula:{
	ABS:{	
	    Syntax:"${0}(tall)",
	    Disp:"Returnerer den absolutte verdien for et tall."
    },
    ACOS:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer arccosinus for et tall. Vinkelen returneres i radianer."
    },
    ACOSH:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer invers hyperbolsk cosinus til et tall."
    },
    ACOT:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer invers cotangens til et tall. Vinkelen måles i radianer."
    },
    ACOTH:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer invers hyperbolsk cotangens til et tall."
    },
    ADDRESS:{
         Syntax:"${0}(rad${1} kolonne${1} [abs]${1} [a1]${1} [ark])",
         Disp:"Returnerer referansen til en celle som tekst.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolutt",
        		 result : 1
        	 }, {
        		 label : "${0} - Absolutt rad / Relativ kolonne",
        		 result : 2
        	 }, {
        		 label : "${0} - Relativ rad / Absolutt kolonne",
        		 result : 3
        	 }, {
        		 label : "${0} - Relativ",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-stil",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-stil",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(Logisk verdi 1${1} [logisk verdi 2]${1} ...)",
    	Disp:"Returnerer TRUE hvis alle argumentene er TRUE."
    },
    ASIN:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer arcsinus for et tall. Vinkelen returneres i radianer."
    },
    ASINH:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer invers hyperbolsk sinus til et tall."
    },
    ATAN:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer arctangens for et tall. Vinkelen returneres i radianer."
    },
    AVERAGE:{    
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer gjennomsnittet av argumentene."
    },
    AVERAGEA:{    
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer gjennomsnittsverdien for et utvalg. Tekst blir evaluert som null."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(område${1} kriterium${1} [gjennomsnittsområde])",
    	Disp:"Returnerer gjennomsnittet (aritmetisk middelverdi) for argumentene som oppfyller den gitte betingelsen."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(gjennomsnittsområde${1} kriterieområde1${1} kriterium1${1} ...)",
    	Disp:"Returnerer gjennomsnittet (aritmetisk middelverdi) for argumentene som oppfyller flere betingelser."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Returnerer arctangens, eller invers tangens, for de oppgitte x- og y-koordinatene. Arctangens er vinkelen fra x-aksen til en linje som inneholder startpunktet (0, 0) og et punkt med koordinater (x_num, y_num)."
    },
    ATANH:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer invers hyperbolsk tangens til et tall. Tallet må være mellom -1 og 1 (ekskludert -1 og 1)."
    },
    BASE:{    
    	Syntax:"${0}(tall${1} grunntall${1} [minimumslengde])",
    	Disp:"Konverterer et positivt heltall til tekst fra et tallsystem til det definerte grunntallet."
    },
    BIN2DEC:{
    	Syntax:"${0}(tall)",
    	Disp:"Konverterer et binært tall til et desimaltall."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et binært tall til et heksadesimalt tall."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et binært tall til et oktaltall."
    },
    CEILING:{  
    	Syntax: "${0}(tall${1} økning)",
    	Disp:"Runder av et tall til nærmeste heltall eller signifikante multiplum."
    },
    CHAR: {
    	Syntax: "${0}(tall)",
    	Disp: "Returnerer et tegn tilordnet etter tallet. Finner tegnet i Unicode-tegnkartet. Tallet er mellom 1 og 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} verdi1${1} [verdi2]${1} ...)",
    	Disp: "Finner og returnerer den tilsvarende verdien i henhold til indeksen. Den kan velge (CHOOSE) fra opptil 30 verdier."
    },
    CODE:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer en numerisk kode for det første tegnet i en tegnstreng som er kodet i unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([referanse])",
    	Disp:"Returnerer det interne kolonnenummeret for en referanse."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrise)",
    	Disp:"Returnerer antall kolonner i en matrise eller referanse."
    },
    COMBIN:{
    	Syntax:"${0}(tall${1} valgt_tall)",
    	Disp:"Returnerer antall kombinasjoner for et gitt antall elementer. Bruk ${0} til å bestemme det totale antall mulige grupper for et gitt antall elementer."
    },
    CONCATENATE:{   
    	Syntax:"${0}(tekst 1${1} ...)",
    	Disp:"Slår sammen flere tekststrenger til en streng."
    },
    CONVERT:{
    	Syntax:"${0}(tall${1} fra_enhet${1} til_enhet)",
    	Disp:"Konverterer et tall fra ett målesystem til et annet.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pund masse (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atommasseenhet)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ounce masse (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Engelsk mil",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Tomme",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Fot",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Ångstrøm",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - År",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Dag",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Time",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minutt",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Sekund",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atomosfære",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - kvikksølvmillimeter (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyn",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pund styrke",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT-kalori",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Hestekraft-time",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-time",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Fot-pund",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodynamisk kalori",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Hestekraft",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - Watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - Gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - Grad Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Grad Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Teskje",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Spiseskje",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Flytende unse",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Kopp",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Amerikansk pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Britisk pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Kvart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer cosinus til en gitt vinkel."
    },
    COSH:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer hyperbolsk cosinus til et tall."
    },
    COT:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer cotangens til et gitt tall."
    },
    COTH:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer hyperbolsk cotangens til et gitt tall."
    },
    COUNT:{   
    	Syntax:"${0}(verdi1${1} [verdi2]${1} ...)",
    	Disp:"Teller hvor mange tall det er på listen over argumenter. Tekstoppføringer blir ignorert."
    },
    COUNTA:{   
    	Syntax:"${0}(verdi1${1} [verdi2]${1} ...)",
    	Disp:"Teller hvor mange verdier det er på listen over argumenter."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(område)",
    	Disp: "Teller de tomme cellene i et angitt område."
    },
    COUNTIF:{
    	Syntax: "${0}(område${1} kriterier)",
    	Disp:"Teller hvor mange celler som oppfyller den gitte betingelsen."
    },
    COUNTIFS:{
    	Syntax: "${0}(kriterieområde1${1} kriterium1${1} ...)",
    	Disp:"Teller hvor mange celler som oppfyller flere betingelser."
    },
    CUMIPMT:{	
	    Syntax:"${0}(sats${1} nper${1} pv${1} start_periode${1} slutt_periode${1} type)",
	    Disp:"Beregner den akkumulerte renten som er betalt mellom to angitte perioder."
    },
    CUMPRINC:{	
	    Syntax:"${0}(sats${1} nper${1} pv${1} start_periode${1} slutt_periode${1} type)",
	    Disp:"Beregner den kumulative hovedstolen som er betalt på et lån, mellom to angitte perioder."
    }, 
    DATE:{	
	    Syntax:"${0}(år${1} måned${1} dag)",
	    Disp:"Returnerer et internt tall for den angitte datoen."
    },  
    DATEDIF:{	
	    Syntax:"${0}(startdato${1} sluttdato${1} format)",
	    Disp:"Returnerer differansen i år, måneder eller dager mellom to datoer.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Antall fullstendige år i perioden.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Antall fullstendige måneder i perioden.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Antall dager i perioden.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Antall dager mellom startdato og sluttdato. Måneder og år ignoreres.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Antall måneder mellom startdato og sluttdato. År ignoreres.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Antall dager mellom startdato og sluttdato. År ignoreres.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Returnerer et internt tall for en tekst med et mulig datoformat."
    }, 
    DAY:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer dagen til en gitt datoverdi. Dagen blir returnert som et heltall mellom 1 og 31. Du kan også angi en negativ dato-/klokkeslettverdi."
    },
    DAYS360:{
    	Syntax:"${0}(startdato${1} sluttdato${1} [metode])",
    	Disp:"Beregner antall dager mellom to datoer basert på et år med 360 dager.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Amerikansk (NASD) metode",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Europeisk metode",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(startdato${1} sluttdato${1})",
    	Disp:"Beregner antall dager mellom to datoer."
    },
    DEC2BIN:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et desimaltall til et binært tall."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et desimaltall til et heksadesimalt tall."
    },
    DEC2OCT:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et desimaltall til et oktaltall."
    },
    DEGREES:{	
	    Syntax:"${0}(vinkel)",
	    Disp:"Konverterer radianer til grader."
    },
    DISC:{
    	Syntax:"${0}(oppgjør${1} forfall${1} pr${1} innløsning${1} [basis])",
    	Disp:"Beregner diskonteringssatsen for et verdipapir."
    }, 
    DOLLAR:{
    	Syntax:"${0}(tall${1} [desimaler])",
    	Disp:"Konverterer et tall til tekst ved hjelp av valutaformatet $ (dollar)."
    },
    EDATE:{
    	Syntax:"${0}(start_date${1} måneder)",
    	Disp:"Returnerer serienummeret som representerer datoen som er det angitte antall måneder før eller etter start_date "
    },
    EOMONTH:{
    	Syntax:"${0}(start_date${1} måneder)",
    	Disp:"Returnerer serienummeret for den siste dagen i måneden som er det angitte antall måneder før eller etter start_date"
    },
    ERFC:{   
    	Syntax:"${0}(tall)",
        Disp:"Returnerer den komplementære feilfunksjonen, integrert mellom et tall og uendelighet."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referanse)",
    	Disp:"Returnerer et tall som svarer til en feiltype."
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
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer et tall som er rundet av oppover til nærmeste heltall som er et partall."
    },
    EXACT:{    
    	Syntax:"${0}(tekst 1${1} tekst 2)",
    	Disp: "Sammenlikner to tekststrenger og returnerer TRUE hvis de er identiske. Denne funksjonen skiller mellom store og små bokstaver."
    },
    EXP:{    
    	Syntax:"${0}(tall)",
    	Disp: "Returnerer e opphøyd i det oppgitte tallet."
    },
    FACT:{  
    	Syntax:"${0}(tall)",
    	Disp:"Beregner fakultetet til et tall."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(tall)",
        Disp:"Returnerer dobbelt fakultet til et tall."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Returnerer den logiske verdien som FALSE."
    },
    FIND:{   
    	Syntax:"${0}(søk etter tekst${1} tekst${1} [posisjon])",
    	Disp:"Ser etter en tekststreng i en annen (skiller mellom store og små bokstaver)."
    },
    FIXED:{
    	Syntax:"${0}(tall${1} [desimaler]${1} [ingen_komma])",
    	Disp:"Formaterer et tall som tekst med et fast antall desimaler.",
    	Arguments: {
    		2 : [{
    			label : "${0} - hindre komma",
    			result : "TRUE"
    		}, {
    			label : "${0} - ikke hindre komma",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(tall${1} signifikans)",
    	Disp:"Runder av et tall nedover til nærmeste signifikante multiplum."
    },
    FORMULA:{   
    	Syntax:"${0}(referanse)",
    	Disp:"Returnerer formelen til en formelcelle."
    },
    FREQUENCY:{   
    	Syntax:"${0}(tallsekvenslistedata${1} tallsekvenslistegrupper)",
    	Disp:"Kategoriserer verdier i intervaller og teller antall verdier i hvert enkelt intervall."
    },
    FV:{
    	Syntax:"${0}(sats${1} nper${1} pmt${1} [pv]${1} [type])",
    	Disp:"Beregner den fremtidige verdien av en investering basert på en konstant rentesats."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(hovedstol${1} tidsplan)",
        Disp:"Beregner den fremtidige verdien av en initialhovedstol, etter bruk av en serie med satser for rentes rente."
    },
    GAMMALN:{   
    	Syntax:"${0}(tall)",
        Disp:"Returnerer den naturlige logaritmen for gammafunksjonen."
    },
    GCD:{   
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
        Disp:"Returnerer største felles divisor for alle argumenter."
    },
    HEX2BIN:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et heksadesimalt tall til et binært tall."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(tall)",
    	Disp:"Konverterer et heksadesimalt tall til et desimaltall."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et heksadesimalt tall til et oktaltall."
    },
    HOUR:{   
    	Syntax:"${0}(tall)",
    	Disp:"Bestemmer det sekvensielle tallet for time på dagen (0-23) for klokkeslettverdien."
    },
    HLOOKUP:{   
    	Syntax:"${0}(søkekriterier${1} datatabell${1} indeks${1} [sortert])",
    	Disp:"Vannrett søk og referanse til cellene nedenfor.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Tilnærmet samsvar",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Nøyaktig samsvar",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [celletekst])",
    	Disp:"Returnerer en kobling som peker til en nettverksressurs eller til et område som koblingen refererer til. Viser celletekst (valgfritt) hvis den er angitt. Ellers vises koblingen som tekst."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [verdi_hvis_sant]${1} [verdi_hvis_usant])",
    	Disp:"Angir en logisk test som skal utføres."
    },
    IFS:{
    	Syntax:"${0}(test1${1} verdi_hvis_sann1${1} ...)",
    	Disp:"Kjører logiske tester for å kontrollere om en eller flere betingelser er oppfylt, og returnerer en verdi som samsvarer med den første TRUE-betingelsen."
    },
    IFERROR:{
    	Syntax:"${0}(verdi${1} verdi_hvis_feil)",
    	Disp:"Returnerer verdien du angir hvis uttrykket er en feil. Returnerer ellers resultatet av uttrykket."
    },
    IFNA:{
    	Syntax:"${0}(verdi${1} verdi_hvis_na)",
    	Disp:"Returnerer verdien du angir hvis uttrykket returnerer #N/A-feilverdien. Returnerer ellers resultatet av uttrykket."
    },
    INDEX:{    
    	Syntax:"${0}(referanse${1} rad${1} [kolonne]${1} [område])",
    	Disp:"Returnerer en referanse til en celle fra et definert område."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [ref_stil])",
    	Disp:"Returnerer innholdet i en celle som det refereres til i tekstformat.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-stil",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-stil",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(tall)",
    	Disp:"Runder av et tall nedover til nærmeste heltall."
    },
    IPMT:{
    	Syntax:"${0}(sats${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beregner rentenedbetalingsbeløpet for en periode for en investering basert på faste avdrag og en fast rentesats."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis den refererte cellen er tom. Ellers returneres FALSE."
    },
    ISERR:{
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er en feilverdi som ikke er lik #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er en feilverdi."
    },
    ISEVEN:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er et partall. Ellers returneres FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referanse)",
    	Disp:"Returnerer TRUE hvis cellen er en formelcelle."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien har et logisk tall."
    },
    ISNA:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er lik #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer true hvis verdien ikke er tekst."
    },
    ISNUMBER:{   
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er et tall."
    },
    ISODD:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er et heltall som er et oddetall."
    },
    ISPMT:{
    	Syntax:"${0}(sats${1} per${1} nper${1} pv)",
    	Disp:"Beregner renten som er betalt i en angitt periode for en investering."
    }, 
    ISREF:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er en referanse."
    },
    ISTEXT:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Returnerer TRUE hvis verdien er en tekst."
    },
    LARGE:{
        Syntax:"${0}(matrise${1} nte_posisjon)",
    	Disp:"Returnerer den nte største verdien fra et sett med verdier."
    },
    LCM:{   
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
        Disp:"Returnerer minste felles multiplum for alle tall på listen."
    },
    LEFT:{
        Syntax:"${0}(tekst${1} [lengde])",
    	Disp:"Returnerer det angitte antall tegn fra starten av en tekst."
    },
    LEN:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer lengden på en tekststreng."
    },
    LENB:{
    	Syntax:"${0}(tekst)",
    	Disp:"Returnerer antall byte i en tekststreng."
    },
    LN:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer den naturlige logaritmen til et tall."
    },
    LOG:{
    	Syntax:"${0}(tall${1} [grunntall])",
    	Disp:"Returnerer logaritmen til et tall i en oppgitt grunntall."
    },
    LOG10:{
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer logaritmen med grunntall 10 for et tall."
    },
    LOOKUP:{
    	Syntax: "${0}(søkekriterium${1} søkevektor${1} [resultatvektor])",
    	Disp:"Bestemmer en verdi i en vektor sammenliknet med verdier i en annen vektor."
    },
    LOWER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer tekst til små bokstaver."
    },    
    MATCH:{    
    	Syntax: "${0}(søkekriterier${1} søkematrise${1} [type])",
    	Disp:"Definerer en posisjon i en matrise etter sammenligning av verdier.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Mindre enn",
         		 result : 1
         	 }, {
         		 label : "${0} - Nøyaktig samsvar",
         		 result : 0
         	 }, {
         		 label : "${0} - Større enn",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer maksimumsverdien i en argumentliste."
    },
    MEDIAN:{    
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer middelverdien, hvis gitt et oddetall med verdier. Returnerer ellers det aritmetiske gjennomsnittet av de to middelverdiene."
    },
    MID:{    
    	Syntax:"${0}(tekst${1} tall${1} tall)",
    	Disp:"Returnerer en delvis tekststreng fra en tekst."
    }, 
    MIN:{    
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer minimumsverdien i en argumentliste."
    },    
    MINUTE:{    
    	Syntax:"${0}(tall)",
    	Disp:"Bestemmer det sekvensielle tallet for minutt i timen (0-59) for klokkeslettverdien."
    },    
    MOD:{    
    	Syntax:"${0}(delt_tall${1} divisor)",
    	Disp:"Returnerer resten når det delte tallet er delt på divisoren."
    },
    MODE:{    
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer den vanligste verdien i et utvalg."
    },
    MONTH:{    
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer måneden for den gitte datoverdien. Måneden blir returnert som et heltall mellom 1 og 12."
    },
    MROUND:{   
    	Syntax: "${0}(tall${1} multiplum)",
        Disp:"Returnerer et tall som er rundet av til et angitt multiplum."
    },
    MMULT:{    
    	Syntax:"${0}(matrise${1} matrise)",
    	Disp:"Matrisemultiplikasjon. Returnerer produktet av to matriser."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
        Disp:"Returnerer en polynomisk koeffisient for et tallsett."
    },
    N:{    
    	Syntax:"${0}(verdi)",
    	Disp:"Konverterer en verdi til et tall."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Returnerer feilverdien #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(startdato${1} sluttdato${1} [helligdager])",
    	Disp:"Returnerer antall arbeidsdager mellom to datoer."
    },
    NOT:{    
    	Syntax:"${0}(logisk verdi)",
    	Disp:"Reverserer verdien på argumentet."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Bestemmer gjeldende klokkeslett på datamaskinen."
    },
    NPV:{   
    	Syntax:"${0}(sats${1} verdi 1${1} [verdi 2]${1} ...)",
        Disp:"Beregner netto nåverdi for en investering, basert på en angitt diskontosats og en serie med fremtidige betalinger og inntekter."
    },
    OCT2BIN:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et oktaltall til et binært tall."
    },
    OCT2DEC:{
    	Syntax:"${0}(tall)",
    	Disp:"Konverterer et oktaltall til et desimaltall."
    },
    OCT2HEX:{
    	Syntax:"${0}(tall${1} [plasser])",
    	Disp:"Konverterer et oktaltall til et heksadesimalt tall."
    },
    ODD:{    
    	Syntax:"${0}(tall)",
    	Disp:"Runder av et tall oppover til nærmeste hele oddetall, der \"oppover\" betyr \"bort fra 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(referanse${1} rader${1} kolonner${1} [høyde]${1} [bredde])",
    	Disp:"Returnerer en referanse til et område som er et angitt antall rader og kolonner fra en celle eller et celleområde."
    },
    OR:{    
    	Syntax:"${0}(Logisk verdi 1${1} [logisk verdi 2]${1} ...)",
    	Disp:"Returnerer TRUE hvis minst ett argument er TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Returnerer den omtrentlige verdien til Pi."
    },
    PMT:{
    	Syntax:"${0}(sats${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Returnerer avdraget for et lån basert på faste avdrag og en fast rentesats."
    },
    POWER:{    
    	Syntax:"${0}(grunntall${1} potens)",
    	Disp:"Et tall opphøyd i potensen til et annet."
    },
    PPMT:{
    	Syntax:"${0}(sats${1} per${1} nper${1} pv${1} [fv]${1} [type])",
    	Disp:"Beregner nedbetalingsbeløpet for en periode for en investering basert på faste avdrag og en fast rentesats."
    },
    PRICEDISC:{
    	Syntax:"${0}(oppgjør${1} forfall${1} diskonto${1} innløsning${1} [basis])",
    	Disp:"Beregner prisen per $100 nominell verdi for et diskontert verdipapir."
    },
    PRICEMAT:{
    	Syntax:"${0}(oppgjør${1} forfall${1} utstedelse${1} sats${1} avkastning${1} [basis])",
    	Disp:"Beregner prisen per $100 nominell verdi for et verdipapir som gir renteutbytte ved forfall."
    },
    PRODUCT:{   
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Multipliserer alle tallene gitt som argumenter og returnerer produktet."
    },
    PROPER:{    
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer en tekststreng til et fast mønster for store og små bokstaver, der den første bokstaven i hvert ord er stor og alle andre bokstaver er små."
    },
    PV:{
    	Syntax:"${0}(sats${1} nper${1} pmt${1} [fv]${1} [type])",
    	Disp:"Beregner nåverdien for en investering, basert på en serie med fremtidige betalinger."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(teller${1} nevner)",
        Disp:"Returnerer resultatet av et tall dividert med et annet tall, avkortet til et heltall."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Returnerer et tilfeldig tall mellom 0 og 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bunn${1} topp)",
    	Disp: "Returnerer et tilfeldig heltall mellom tallene du angir."
    },
    RANK:{    
    	Syntax:"${0}(tall${1} ref${1} [rekkefølge])",
    	Disp: "Returnerer rangeringen til en verdi i et utvalg.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Synkende",
          		 result : 0
          	 }, {
          		 label : "${0} - Stigende",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(oppgjør${1} forfall${1} investering${1} diskonto${1} [basis])",
    	Disp:"Beregner beløpet som mottas ved forfall for et fullfinansiert verdipapir."
    }, 
    REPLACE:{    
    	Syntax: "${0}(tekst${1} posisjon${1} lengde${1} ny tekst)",
    	Disp:"Erstatter tegn i en tekststreng med en annen tekststreng."	
    },
    REPT:{    
    	Syntax: "${0}(tekst${1} antall)",
    	Disp:"Gjentar tekst et gitt antall ganger."	
    },
    RIGHT:{
    	Syntax: "${0}(tekst${1} [tall])",
    	Disp:"Returnerer det siste tegnet eller de siste tegnene i tekst."
    },
    RIGHTB:{
    	Syntax: "${0}(tekst${1} [tall])",
    	Disp:"Returnerer det siste tegnet eller de siste tegnene i tekst."
    },
    ROUND:{   
    	Syntax: "${0}(tall${1} antall)",
    	Disp:"Runder av et tall oppover til en forhåndsdefinert nøyaktighet."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(tall${1} antall)",
    	Disp:"Runder av et tall nedover til en forhåndsdefinert nøyaktighet."
    },
    ROUNDUP:{   
    	Syntax: "${0}(tall${1} antall)",
    	Disp:"Runder av et tall oppover til en forhåndsdefinert nøyaktighet."
    },
    ROW:{   
    	Syntax:"${0}([referanse])",
    	Disp:"Definerer det interne radnummeret til en referanse."
    },
    ROWS:{   
    	Syntax:"${0}(matrise)",
    	Disp:"Returnerer antall rader i en matrise eller referanse."
    },
    RADIANS:{   
    	Syntax:"${0}(vinkel)",
    	Disp:"Konverterer grader til radianer."
    },
    ROMAN:{   
    	Syntax:"${0}(tall${1} [form])",
    	Disp:"Konverterer vanlige tall til romertall, som tekst.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klassisk",
          		 result : 0
          	 }, {
          		 label : "${0} - Mer konsist",
          		 result : 1
          	 }, {
          		 label : "${0} - Mer konsist",
          		 result : 2
          	 }, {
          		 label : "${0} - Mer konsist",
          		 result : 3
          	 }, {
          		 label : "${0} - Forenklet",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(søk etter tekst${1} tekst${1} [posisjon])",
    	Disp:"Ser etter en tekstverdi i en annen (skiller ikke mellom store og små bokstaver)"
    },  
    SIGN:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer det algebraiske tegnet for et tall."
    },
    SIN:{    
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer sinus til en gitt vinkel."
    },
    SINH:{    
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer hyperbolsk sinus til et tall."
    },
    SECOND:{    
    	Syntax:"${0}(tall)",
    	Disp:"Bestemmer det sekvensielle tallet for sekundet i minuttet (0-59) for klokkeslettverdien."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koeffisienter)",
        Disp:"Returnerer summen av en potensrekke basert på formelen."
    },
    SHEET:{   
    	Syntax:"${0}([referanse])",
    	Disp:"Returnerer det interne arknummeret til en referanse eller streng."
    },
    SMALL:{   
    	Syntax:"${0}(matrise${1} nte_posisjon)",
    	Disp:"Returnerer den nte minste verdien fra et sett med verdier."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(tekst${1} gammel${1} ny${1} [hvilken])",
    	Disp:"Returnerer teksten der en gammel tekst blir erstattet med en ny tekst."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funksjon${1} område${1} ...)",
    	Disp:"Beregner delsummer i et regneark.",
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
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Returnerer summen av alle argumenter."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrise 1${1} [matrise 2]${1} ...)",
    	Disp:"Returnerer summen av produktene i matriseargumenter."
    },
    SUMIF:{   
    	Syntax:"${0}(område${1} kriterium${1} [sumområde])",
    	Disp:"Legger sammen argumentene som oppfyller betingelsene."
    },
    SUMIFS:{
    	Syntax: "${0}(sum_område${1} kriterieområde1${1} kriterium1${1} ...)",
    	Disp:"Legger sammen argumentene som oppfyller flere betingelser."
    },
    SQRT:{   
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer kvadratroten til et tall."
    },
    SQRTPI:{   
    	Syntax:"${0}(tall)",
        Disp:"Returnerer kvadratroten av (tall * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner standardavviket basert på et utvalg."
    },
    STDEVP:
    {
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner standardavviket basert på hele populasjonen."
    },
    SUMSQ:{
    	Syntax:"${0}(tall 1${1} [tall 2]${1} ...)",
        Disp:"Returnerer summen av kvadratene for tallene på listen."
    },
    T:{
    	Syntax:"${0}(tekst)",
    	Disp:"Konverterer argumentene til tekst."
    },
    TAN:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer tangens til et gitt tall."
    },
    TANH:{    
    	Syntax:"${0}(tall)",
        Disp:"Returnerer hyperbolsk tangens til et gitt tall."
    },
    TBILLPRICE:{
    	Syntax:"${0}(oppgjør${1} forfall${1} diskonto)",
    	Disp:"Beregner prisen per $100 nominell verdi for en statsobligasjon."
    },
    TEXT:{
    	Syntax:"${0}(verdi${1} formatkode)",
    	Disp:"Konverterer verdien til en tekst i henhold til reglene for en tallformatkode og returnerer den."
    },
    TIME:{   
    	Syntax:"${0}(time${1} minutt${1} sekund)",
    	Disp:"Bestemmer en klokkeslettverdi fra opplysningene om time, minutt og sekund."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(tekst)",
	    Disp:"Returnerer et internt tall for en tekst med et mulig klokkeslettformat."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Bestemmer gjeldende dato på datamaskinen."
    },    
    TRIM:{
    	Syntax:"${0}(tekst)",
    	Disp:"Fjerner alle foranstilte og etterfølgende blanktegn. Alle andre sekvenser med 2 eller flere indre blanktegn blir erstattet med ett enkelt blanktegn."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Returnerer den logiske verdien TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(tall${1} [antall])",
    	Disp:"Kutter antall desimaler for et tall."
    },
    TYPE:{   
    	Syntax:"${0}(verdi)",
    	Disp:"Definerer datatypen til en verdi."	
    },
    UPPER:{  
    	Syntax: "${0}(tekst)",
    	Disp:"Konverterer tekst til store bokstaver."
    },
    VALUE:{    
    	Syntax: "${0}(tekst)",
    	Disp:"Konverterer et tekstargument til et tall."
    },
    VAR:{    
    	Syntax: "${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner varians basert på et utvalg."
    },
    VARA:{    
    	Syntax: "${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner varians basert på et utvalg, inkludert tall, tekst og logiske verdier."
    },
    VARP:{    
    	Syntax: "${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner varians basert på hele populasjonen."
    },
    VARPA:{    
    	Syntax: "${0}(tall 1${1} [tall 2]${1} ...)",
    	Disp:"Beregner varians basert på hele populasjonen, inkludert tall, tekst og logiske verdier."
    },
    VLOOKUP:{    
    	Syntax: "${0}(søkekriterium${1} datatabell${1} indeks${1} [sorteringsrekkefølge])",
    	Disp:"Loddrett søk og referanse til angitte celler.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Tilnærmet samsvar",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Nøyaktig samsvar",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(tall${1} [type])",
    	Disp:"Returnerer ukedagen for datoverdien som et heltall.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Tall 1 (søndag) til og med 7 (lørdag)",
          		 result : 1
          	 }, {
          		 label : "${0} - Tall 1 (mandag) til og med 7 (søndag)",
          		 result : 2
          	 }, {
          		 label : "${0} - Tall 0 (mandag) til og med 6 (søndag)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Tall 1 (mandag) til og med 7 (søndag)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Tall 1 (tirsdag) til og med 7 (mandag)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Tall 1 (onsdag) til og med 7 (tirsdag)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Tall 1 (torsdag) til og med 7 (onsdag)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Tall 1 (fredag) til og med 7 (torsdag)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Tall 1 (lørdag) til og med 7 (fredag)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Tall 1 (søndag) til og med 7 (lørdag)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(tall${1} [modus])",
    	Disp:"Beregner kalenderuken som tilsvarer en gitt dato.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Søndag",
          		 result : 1
          	 }, {
          		 label : "${0} - Mandag",
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
    	Syntax:"${0}(startdato${1} dager${1} [helligdager])",
    	Disp:"Returnerer serienummeret for datoen før og etter et angitt antall arbeidsdager."
    },
    XNPV:{   
    	Syntax:"${0}(sats${1} verdier${1} datoer)",
    	Disp:"Beregner netto nåverdi for en tidsplan med kontantstrømmer."
    },
    YEAR:{    
    	Syntax:"${0}(tall)",
    	Disp:"Returnerer året i en datoverdi som et heltall."
    }
}
})

