/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Kaikki kaavat",
	LABEL_FORMULA_LIST: "Kaavaluettelo:",
	formula:{
	ABS:{	
	    Syntax:"${0}(luku)",
	    Disp:"Palauttaa luvun absoluuttisen arvon."
    },
    ACOS:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun arkuskosinin. Kulma palautetaan radiaaneina."
    },
    ACOSH:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun käänteisen hyperbolisen kosinin."
    },
    ACOT:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa luvun käänteisen kotangentin. Kulma mitataan radiaaneina."
    },
    ACOTH:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa luvun käänteisen hyperbolisen kotangentin."
    },
    ADDRESS:{
         Syntax:"${0}(rivi${1} sarake${1} [abs.arvo]${1} [a1]${1} [taulukko])",
         Disp:"Palauttaa soluviitteen tekstinä.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - tarkka",
        		 result : 1
        	 }, {
        		 label : "${0} - tarkka rivi, suhteellinen sarake",
        		 result : 2
        	 }, {
        		 label : "${0} - suhteellinen rivi, tarkka sarake",
        		 result : 3
        	 }, {
        		 label : "${0} - suhteellinen",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1-tyyli",
        		 result : 0
        	 }, {
        		 label: "${0} - A1-tyyli",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(looginen arvo 1${1} [looginen arvo 2]${1} ...)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos kaikki argumentit ovat tosia."
    },
    ASIN:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun arkussinin. Kulma palautetaan radiaaneina."
    },
    ASINH:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun käänteisen hyperbolisen sinin."
    },
    ATAN:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun arkustangentin. Kulma palautetaan radiaaneina."
    },
    AVERAGE:{    
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa argumenttien keskiarvon."
    },
    AVERAGEA:{    
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa otoksen keskiarvon. Järjestelmä tulkitsee tekstiä sisältävät arvot nollaksi."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(alue${1} ehdot${1} [keskiarvoalue])",
    	Disp:"Palauttaa ehdot täyttävien argumenttien (aritmeettisen) keskiarvon."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(keskiarvoalue${1} ehtoalue1${1} ehto1${1} ...)",
    	Disp:"Palauttaa useat ehdot täyttävien argumenttien (aritmeettisen) keskiarvon."
    },
    ATAN2:{
    	Syntax:"${0}(x-luku${1} y-luku)",
    	Disp:"Palauttaa määritettyjen x- ja y-koordinaattien arkustangentin eli käänteisen tangentin. Arkustangentti on x-akselin sekä origon (0, 0) ja pisteen (koordinaatit: x-luku, y-luku) määrittämän suoran välinen kulma."
    },
    ATANH:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun käänteisen hyperbolisen tangentin. Luvun on oltava -1 - 1 (ei kuitenkaan -1 tai 1)."
    },
    BASE:{    
    	Syntax:"${0}(luku${1} kantaluku${1} [vähimmäispituus])",
    	Disp:"Muuntaa positiivisen kokonaisluvun tekstiksi määritetyn kantaluvun lukujärjestelmän perusteella."
    },
    BIN2DEC:{
    	Syntax:"${0}(luku)",
    	Disp:"Muuntaa binaariluvun desimaaliluvuksi."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa binaariluvun heksadesimaaliluvuksi."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa binaariluvun oktaaliluvuksi."
    },
    CEILING:{  
    	Syntax: "${0}(luku${1} lisäyskerroin)",
    	Disp:"Pyöristää luvun lähimpään kokonaislukuun tai merkittävään monikertaan."
    },
    CHAR: {
    	Syntax: "${0}(luku)",
    	Disp: "Palauttaa lukua vastaavan merkin. Funktio etsii merkin Unicode-merkistöstä. Luku voi olla 1–255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeksi${1} arvo1${1} [arvo2]${1} ...)",
    	Disp: "Etsii ja palauttaa vastaavan arvon indeksin mukaan. CHOOSE-funktiolla voidaan valita arvo enintään 30 arvon joukosta."
    },
    CODE:{
    	Syntax:"${0}(teksti)",
    	Disp:"Palauttaa Unicode-koodatun tekstimerkkijonon ensimmäisen merkin numerokoodin."
    },
    COLUMN:{    
    	Syntax:"${0}([viite])",
    	Disp:"Määrittää viitteen sisäisen sarakenumeron."
    },
    COLUMNS:{    
    	Syntax:"${0}(taulukko)",
    	Disp:"Palauttaa taulukon tai viitteen sarakkeiden määrän."
    },
    COMBIN:{
    	Syntax:"${0}(luku${1} valittu_luku)",
    	Disp:"Palauttaa kombinaatioiden määrän annettujen alkioiden määrän perusteella. Käytä funktiota ${0} selvittääksesi mahdollisten ryhmien kokonaismäärän annettujen alkioiden lukumäärän perusteella."
    },
    CONCATENATE:{   
    	Syntax:"${0}(teksti 1${1} ...)",
    	Disp:"Yhdistää useita tekstimerkkijonoja yhdeksi merkkijonoksi."
    },
    CONVERT:{
    	Syntax:"${0}(luku${1} yksiköstä${1} yksikköön)",
    	Disp:"Muuntaa yhden mittajärjestelmän luvun toiseksi.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - gramma",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - naula (engl. ja amer. kauppapainojärjestelmä)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomipaino)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - unssi (engl. ja amer. kauppapainojärjestelmä)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - metri",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - maili (englanninpeninkulma)",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - tuuma",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - jalka",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - jaardi",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - ångström",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - vuosi",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - päivä",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - tunti",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - minuutti",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - sekunti",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - ilmakehä",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - elohopeamillimetri (torri)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - naula (voima)",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - ergi",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT-kalori",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - elektronivoltti",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - hevosvoimatunti",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - wattitunti",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - jalkanaula",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - termodynaaminen kalori",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - hevosvoima",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - watti",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - Gaussi",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - teelusikallinen",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - ruokalusikallinen",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - unssi (neste)",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - kahvikupillinen",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - pint (US)",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - U.K. pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - neljännesgallona",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - gallona",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - litra",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa annetun kulman kosinin."
    },
    COSH:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun hyperbolisen kosinin."
    },
    COT:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa annetun luvun kotangentin."
    },
    COTH:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa annetun luvun hyperbolisen kotangentin."
    },
    COUNT:{   
    	Syntax:"${0}(arvo1${1} [arvo2]${1} ...)",
    	Disp:"Laskee argumenttiluettelon lukujen määrän. Funktio ohittaa luettelon tekstimuotoiset arvot."
    },
    COUNTA:{   
    	Syntax:"${0}(arvo1${1} [arvo2]${1} ...)",
    	Disp:"Laskee argumenttiluettelon arvojen määrän."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(alue)",
    	Disp: "Laskee valitun alueen tyhjät solut."
    },
    COUNTIF:{
    	Syntax: "${0}(alue${1} ehdot)",
    	Disp:"Laskee annetun ehdon täyttävien solujen määrän."
    },
    COUNTIFS:{
    	Syntax: "${0}(ehtoalue1${1} ehto1${1} ...)",
    	Disp:"Laskee useat ehdot täyttävien solujen määrän."
    },
    CUMIPMT:{	
	    Syntax:"${0}(korko${1} jaksojen_määrä${1} nykyarvo${1} aloitusjakso${1} lopetusjakso${1} laji)",
	    Disp:"Laskee kahden määritetyn jakson välillä kertyneen koron."
    },
    CUMPRINC:{	
	    Syntax:"${0}(korko${1} jaksojen_määrä${1} nykyarvo${1} aloitusjakso${1} lopetusjakso${1} laji)",
	    Disp:"Laskee kahden määritetyn jakson välillä maksetun lainanlyhennyksen määrän."
    }, 
    DATE:{	
	    Syntax:"${0}(vuosi${1} kuukausi${1} päivä)",
	    Disp:"Määrittää annetun päivämäärän sisäisen tunnusluvun."
    },  
    DATEDIF:{	
	    Syntax:"${0}(alkupäivämäärä${1} loppupäivämäärä${1} muoto)",
	    Disp:"Palauttaa kahden päivämäärän välisen eron vuosina, kuukausina tai päivinä.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Kokonaisten vuosien määrä ajanjaksolla.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Kokonaisten kuukausien määrä ajanjaksolla.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Päivien määrä ajanjaksolla.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Aloituspäivämäärän ja lopetuspäivämäärän välinen päivien määrä; kuukaudet ja vuodet ohitetaan.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Aloituspäivämäärän ja lopetuspäivämäärän välinen kuukausien määrä; vuodet ohitetaan.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Aloituspäivämäärän ja lopetuspäivämäärän välinen päivien määrä; vuodet ohitetaan.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(teksti)",
	    Disp:"Palauttaa mahdollisen päivämäärämuodon sisäisen arvon."
    }, 
    DAY:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa annetun päivämääräarvon päivän. Päivä palautetaan kokonaislukuna 1–31. Voit määrittää päivämäärän ja kellonajan joko positiivisena tai negatiivisena."
    },
    DAYS360:{
    	Syntax:"${0}(alkupäivämäärä${1} loppupäivämäärä${1} [metodi])",
    	Disp:"Laskee kahden päivämäärän välisten päivien määrän 360 päivän pituisen vuoden mukaan.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - yhdysvaltalainen NASD (National Association of Securities Dealers) -menetelmä",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - eurooppalainen menetelmä",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(alkupäivämäärä${1} loppupäivämäärä${1})",
    	Disp:"Laskee kahden päivämäärän välisten päivien määrän."
    },
    DEC2BIN:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa desimaaliluvun binaariluvuksi."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa desimaaliluvun heksadesimaaliluvuksi."
    },
    DEC2OCT:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa desimaaliluvun oktaaliluvuksi."
    },
    DEGREES:{	
	    Syntax:"${0}(kulma)",
	    Disp:"Muuntaa radiaanit asteiksi."
    },
    DISC:{
    	Syntax:"${0}(tilityspäivä${1} erääntymispäivä${1} hinta${1} lunastushinta${1} [peruste])",
    	Disp:"Laskee arvopaperin diskonttokoron."
    }, 
    DOLLAR:{
    	Syntax:"${0}(luku${1} [desimaalit])",
    	Disp:"Muuntaa luvun $ (dollari) -valuutan muotoiseksi tekstiksi."
    },
    EDATE:{
    	Syntax:"${0}(alkupäivämäärä${1} kuukaudet)",
    	Disp:"Palauttaa sen päivämäärän sarjanumeron, joka on määritetyn kuukausien määrän eteen- tai taaksepäin alkupäivämäärästä"
    },
    EOMONTH:{
    	Syntax:"${0}(alkupäivämäärä${1} kuukaudet)",
    	Disp:"Palauttaa sen kuukauden viimeisen päivän sarjanumeron, joka on määritetyn kuukausien määrän eteen- tai taaksepäin alkupäivämäärästä"
    },
    ERFC:{   
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa komplementtivirhefunktion integroituna annetusta luvusta äärettömään."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(viite)",
    	Disp:"Palauttaa virhelajia vastaavan luvun."
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
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun, joka on pyöristetty ylöspäin lähimpään parilliseen kokonaislukuun."
    },
    EXACT:{    
    	Syntax:"${0}(teksti 1${1} teksti 2)",
    	Disp: "Vertaa kahta tekstimerkkijonoa ja palauttaa arvon TRUE (tosi), jos merkkijonot ovat samat. Funktio vertaa myös kirjainkokoa."
    },
    EXP:{    
    	Syntax:"${0}(luku)",
    	Disp: "Palauttaa e:n korotettuna annetun luvun mukaiseen potenssiin."
    },
    FACT:{  
    	Syntax:"${0}(luku)",
    	Disp:"Laskee luvun kertoman."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa luvun kaksoiskertoman."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Palauttaa loogisen arvon arvoksi FALSE (epätosi)."
    },
    FIND:{   
    	Syntax:"${0}(etsittävä teksti${1} teksti${1} [sijainti])",
    	Disp:"Etsii merkkijonoa tekstistä (kirjainkoon erottelu)."
    },
    FIXED:{
    	Syntax:"${0}(luku${1} [desimaalit]${1} [ei_pilkkuja])",
    	Disp:"Muotoilee luvun tekstinä, jossa tietty määrä desimaaleja.",
    	Arguments: {
    		2 : [{
    			label : "${0} - estä pilkut",
    			result : "TRUE"
    		}, {
    			label : "${0} - älä estä pilkkuja",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(luku${1} merkitsevyys)",
    	Disp:"Pyöristää luvun alaspäin lähimpään merkittävään monikertaan."
    },
    FORMULA:{   
    	Syntax:"${0}(viite)",
    	Disp:"Palauttaa kaavasolun kaavan."
    },
    FREQUENCY:{   
    	Syntax:"${0}(lukusarjaluettelon_tiedot${1} lukusarjaluettelon_binaariarvot)",
    	Disp:"Luokittelee arvot väleihin ja laskee arvojen määrän kussakin välissä."
    },
    FV:{
    	Syntax:"${0}(korko${1} jaksojen_määrä${1} maksuerä${1} [nykyarvo]${1} [laji])",
    	Disp:"Laskee investoinnin tulevan arvon kiinteän koron perusteella."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(pääoma${1} aikataulu)",
        Disp:"Laskee alkupääoman tulevan arvon vaihtelevan koron kertymisen jälkeen."
    },
    GAMMALN:{   
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa gammafunktion luonnollisen logaritmin."
    },
    GCD:{   
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
        Disp:"Palauttaa kaikkien argumenttien suurimman yhteisen tekijän."
    },
    HEX2BIN:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa heksadesimaaliluvun binaariluvuksi."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(luku)",
    	Disp:"Muuntaa heksadesimaaliluvun desimaaliluvuksi."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa heksadesimaaliluvun oktaaliluvuksi."
    },
    HOUR:{   
    	Syntax:"${0}(luku)",
    	Disp:"Määrittää aika-arvon tuntimäärityksen järjestysnumeron (0 -23)."
    },
    HLOOKUP:{   
    	Syntax:"${0}(hakuehdot${1} taulukko${1} indeksi${1} [lajiteltu])",
    	Disp:"Vaakasuunnan haku ja viite alempana oleviin soluihin.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - likimääräinen vastine",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - tarkka vastine",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(linkki${1} [solun_teksti])",
    	Disp:"Palauttaa linkin, joka osoittaa linkin viittaamaan verkon resurssiin tai alueeseen. Näyttää solun_tekstin (valinnainen), jos annettu. Muussa tapauksessa näyttää linkin tekstinä."
    },    
    IF:{    
    	Syntax:"${0}(testi${1} [sitten-arvo]${1} [muuten-arvo])",
    	Disp:"Määrittää suoritettavan loogisen testin."
    },
    IFS:{
    	Syntax:"${0}(testi1${1} arvo_jos_tosi1${1} ...)",
    	Disp:"Tarkastaa, täyttyykö ainakin yksi ehto, ajamalla loogisia testejä ja palauttaa arvon, joka vastaa ensimmäistä tosi-ehtoa."
    },
    IFERROR:{
    	Syntax:"${0}(arvo${1} arvo_jos_virhe)",
    	Disp:"Palauttaa määritetyn arvon, jos lauseke on virheellinen. Muussa tapauksessa palauttaa lausekkeen tuloksen."
    },
    IFNA:{
    	Syntax:"${0}(arvo${1} arvo_jos_NA)",
    	Disp:"Palauttaa määritetyn arvon, jos lauseke palauttaa #N/A-virhearvon. Muussa tapauksessa palauttaa lausekkeen tuloksen."
    },
    INDEX:{    
    	Syntax:"${0}(viite${1} rivi${1} [sarake]${1} [alue])",
    	Disp:"Palauttaa soluviitteen määritetyltä alueelta."
    },
    INDIRECT:{    
    	Syntax:"${0}(viite${1} [viitteen_tyyli])",
    	Disp:"Palauttaa sen solun sisällön, johon tekstilomakkeessa viitataan.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1-tyyli",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1-tyyli",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(luku)",
    	Disp:"Pyöristää luvun alaspäin lähimpään kokonaislukuun."
    },
    IPMT:{
    	Syntax:"${0}(korko${1} jakso${1} jaksojen_määrä${1} nykyarvo${1} [odotusarvo]${1} [laji])",
    	Disp:"Laskee jakson koron takaisinmaksun määrän investoinnille säännöllisten maksuerien ja kiinteän korkoprosentin perusteella."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos viitattu solu on tyhjä, muuten arvon FALSE (epätosi)."
    },
    ISERR:{
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on virhearvo, joka ei ole #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on virhearvo."
    },
    ISEVEN:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on parillinen, muuten arvon FALSE (epätosi)." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(viite)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos solu on kaavasolu."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvossa on looginen luku."
    },
    ISNA:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo ei ole tekstiä."
    },
    ISNUMBER:{   
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on luku."
    },
    ISODD:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on pariton kokonaisluku."
    },
    ISPMT:{
    	Syntax:"${0}(korko${1} jakso${1} jaksojen_määrä${1} nykyarvo)",
    	Disp:"Laskee määritetyllä jaksolla investoinnille maksetun koron."
    }, 
    ISREF:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on viite."
    },
    ISTEXT:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos arvo on teksti."
    },
    LARGE:{
        Syntax:"${0}(taulukko${1} n:s_sijoitus)",
    	Disp:"Palauttaa arvojoukon n:nneksi suurimman arvon."
    },
    LCM:{   
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
        Disp:"Palauttaa kaikkien luettelon lukujen pienimmän yhteisen jaettavan."
    },
    LEFT:{
        Syntax:"${0}(teksti${1} [pituus])",
    	Disp:"Palauttaa määritetyn määrän merkkejä tekstin alusta laskien."
    },
    LEN:{
    	Syntax:"${0}(teksti)",
    	Disp:"Palauttaa tekstimerkkijonon pituuden."
    },
    LENB:{
    	Syntax:"${0}(teksti)",
    	Disp:"Palauttaa tekstimerkkijonon tavujen määrän."
    },
    LN:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun luonnollisen logaritmin."
    },
    LOG:{
    	Syntax:"${0}(luku${1} [kantaluku])",
    	Disp:"Palauttaa annetun luvun määritetyn kantaluvun mukaisen logaritmin."
    },
    LOG10:{
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun kymmenkantalogaritmin."
    },
    LOOKUP:{
    	Syntax: "${0}(hakuehto${1} hakuvektori${1} [tulosvektori])",
    	Disp:"Määrittää vektorin arvon vertaamalla toisen vektorin arvoihin."
    },
    LOWER:{    
    	Syntax:"${0}(teksti)",
    	Disp:"Muuntaa tekstin pieniin kirjaimiin."
    },    
    MATCH:{    
    	Syntax: "${0}(hakuehto${1} hakutaulukko${1} [laji])",
    	Disp:"Määrittää taulukon paikan arvovertailun jälkeen.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - pienempi kuin",
         		 result : 1
         	 }, {
         		 label : "${0} - tarkka vastine",
         		 result : 0
         	 }, {
         		 label : "${0} - suurempi kuin",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa argumenttiluettelon suurimman arvon."
    },
    MEDIAN:{    
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa keskimmäisen arvon, jos annettuja arvoja on pariton määrä. Muussa tapauksessa funktio palauttaa kahden keskimmäisen arvon aritmeettisen keskiarvon."
    },
    MID:{    
    	Syntax:"${0}(teksti${1} luku${1} luku)",
    	Disp:"Palauttaa osittaisen tekstiosan tekstistä."
    }, 
    MIN:{    
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa argumenttiluettelon pienimmän arvon."
    },    
    MINUTE:{    
    	Syntax:"${0}(luku)",
    	Disp:"Määrittää aika-arvon minuuttien määrän (0–59)."
    },    
    MOD:{    
    	Syntax:"${0}(jaettava_luku${1} jakaja)",
    	Disp:"Palauttaa jakojäännöksen, kun jaettava luku jaetaan jakajalla."
    },
    MODE:{    
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa otoksen yleisimmän arvon."
    },
    MONTH:{    
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa annetun päivämääräarvon kuukauden. Kuukausi palautetaan kokonaislukuna 1 - 12."
    },
    MROUND:{   
    	Syntax: "${0}(luku${1} kerrannainen)",
        Disp:"Palauttaa luvun pyöristettynä määritettyyn kerrannaiseen."
    },
    MMULT:{    
    	Syntax:"${0}(taulukko${1} taulukko)",
    	Disp:"Taulukoiden tulo. Kertoo kahden taulukon arvot."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
        Disp:"Palauttaa lukujoukon multinomikertoimen."
    },
    N:{    
    	Syntax:"${0}(arvo)",
    	Disp:"Muuntaa arvon luvuksi."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Palauttaa virhearvon #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(alkupäivämäärä${1} loppupäivämäärä${1} [vapaapäivät])",
    	Disp:"Palauttaa kahden päivämäärän välisten työpäivien määrän."
    },
    NOT:{    
    	Syntax:"${0}(looginen arvo)",
    	Disp:"Kääntää argumentin arvon."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Määrittää tietokoneen nykyisen kellonajan."
    },
    NPV:{   
    	Syntax:"${0}(korko${1} arvo 1${1} [arvo 2]${1} ...)",
        Disp:"Laskee investoinnin nettonykyarvon annetun diskonttokoron sekä tulevien maksujen ja tulojen perusteella."
    },
    OCT2BIN:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa oktaaliluvun binaariluvuksi."
    },
    OCT2DEC:{
    	Syntax:"${0}(luku)",
    	Disp:"Muuntaa oktaaliluvun desimaaliluvuksi."
    },
    OCT2HEX:{
    	Syntax:"${0}(luku${1} [desimaalien määrä])",
    	Disp:"Muuntaa oktaaliluvun heksadesimaaliluvuksi."
    },
    ODD:{    
    	Syntax:"${0}(luku)",
    	Disp:"Pyöristää luvun ylöspäin (nollasta poispäin) lähimpään parittomaan kokonaislukuun."
    },
    OFFSET:{
    	Syntax:"${0}(viite${1} rivit${1} sarakkeet${1} [korkeus]${1} [leveys])",
    	Disp:"Palauttaa viittauksen solusta tai solualueesta alueeseen, joka on määritettyjen rivien ja sarakkeiden määrän kokoinen."
    },
    OR:{    
    	Syntax:"${0}(looginen arvo 1${1} [looginen arvo 2]${1} ...)",
    	Disp:"Palauttaa arvon TRUE (tosi), jos vähintään yksi argumentti on TRUE (tosi)."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Palauttaa piin likiarvon."
    },
    PMT:{
    	Syntax:"${0}(korko${1} jaksojen_määrä${1} nykyarvo${1} [odotusarvo]${1} [laji])",
    	Disp:"Palauttaa lainan maksuerän säännöllisten maksuerien ja kiinteän korkoprosentin perusteella."
    },
    POWER:{    
    	Syntax:"${0}(kanta${1} potenssi)",
    	Disp:"Korottaa luvun potenssiin, joka määräytyy toisen luvun perusteella."
    },
    PPMT:{
    	Syntax:"${0}(korko${1} jakso${1} jaksojen_määrä${1} nykyarvo${1} [odotusarvo]${1} [laji])",
    	Disp:"Laskee jakson takaisinmaksun määrän investoinnille säännöllisten maksuerien ja kiinteän korkoprosentin perusteella."
    },
    PRICEDISC:{
    	Syntax:"${0}(tilityspäivä${1} erääntymispäivä${1} diskonttokorko${1} lunastushinta${1} [peruste])",
    	Disp:"Laskee arvopaperin diskontatun hinnan 100 euron nimellisarvoa kohden."
    },
    PRICEMAT:{
    	Syntax:"${0}(tilityspäivä${1} erääntymispäivä${1} liikkeeseenlaskupäivä${1} korko${1} tuotto${1} [peruste])",
    	Disp:"Laskee hinnan 100 euron nimellisarvoa kohden arvopaperille, jonka korko maksetaan erääntymispäivänä."
    },
    PRODUCT:{   
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa kaikkien argumentteina annettujen lukujen tulon."
    },
    PROPER:{    
    	Syntax:"${0}(teksti)",
    	Disp:"Muuntaa tekstimerkkijonon asianmukaiseen kirjainkokoon eli kunkin sanan ensimmäisen kirjaimen isoksi ja muut kirjaimet pieniksi."
    },
    PV:{
    	Syntax:"${0}(korko${1} jaksojen_määrä${1} maksuerä${1} [odotusarvo]${1} [laji])",
    	Disp:"Laskee investoinnin nykyarvon tulevien maksujen perusteella."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(osoittaja${1} nimittäjä)",
        Disp:"Palauttaa jakotuloksen luvusta jaettuna toisella luvulla, katkaistuna kokonaislukuun."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Palauttaa satunnaisluvun 0–1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(alaraja${1} yläraja)",
    	Disp: "Palauttaa satunnaisen kokonaisluvun määrittämältäsi arvoväliltä."
    },
    RANK:{    
    	Syntax:"${0}(luku${1} viite${1} [järjestys])",
    	Disp: "Palauttaa arvon sijoituksen otoksessa.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - laskeva",
          		 result : 0
          	 }, {
          		 label : "${0} - nouseva",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(tilityspäivä${1} erääntymispäivä${1} investointi${1} diskonttokorko${1} [peruste])",
    	Disp:"Laskee arvopaperin tuoton erääntymispäivänä täysin maksetulle investoinnille."
    }, 
    REPLACE:{    
    	Syntax: "${0}(teksti${1} sijainti${1} pituus${1} uusi_teksti)",
    	Disp:"Korvaa tekstijonon merkit toisella tekstijonolla."	
    },
    REPT:{    
    	Syntax: "${0}(teksti${1} määrä)",
    	Disp:"Toistaa tekstin niin monta kertaa kuin on määritetty."	
    },
    RIGHT:{
    	Syntax: "${0}(teksti${1} [luku])",
    	Disp:"Palauttaa tekstin viimeisen merkin tai merkit."
    },
    RIGHTB:{
    	Syntax: "${0}(teksti${1} [luku])",
    	Disp:"Palauttaa tekstin viimeisen merkin tai merkit."
    },
    ROUND:{   
    	Syntax: "${0}(luku${1} määrä)",
    	Disp:"Pyöristää luvun ennalta määritettyyn tarkkuuteen."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(luku${1} määrä)",
    	Disp:"Pyöristää luvun alaspäin ennalta määritettyyn tarkkuuteen."
    },
    ROUNDUP:{   
    	Syntax: "${0}(luku${1} määrä)",
    	Disp:"Pyöristää luvun ylöspäin ennalta määritettyyn tarkkuuteen."
    },
    ROW:{   
    	Syntax:"${0}([viite])",
    	Disp:"Määrittää viitteen sisäisen rivinumeron."
    },
    ROWS:{   
    	Syntax:"${0}(taulukko)",
    	Disp:"Palauttaa taulukon tai viitteen rivien määrän."
    },
    RADIANS:{   
    	Syntax:"${0}(kulma)",
    	Disp:"Muuntaa asteet radiaaneiksi."
    },
    ROMAN:{   
    	Syntax:"${0}(luku${1} [muoto])",
    	Disp:"Muuntaa arabialaisen luvun roomalaiseksi (tekstinä).",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - perinteinen",
          		 result : 0
          	 }, {
          		 label : "${0} - lyhyempi",
          		 result : 1
          	 }, {
          		 label : "${0} - lyhyempi",
          		 result : 2
          	 }, {
          		 label : "${0} - lyhyempi",
          		 result : 3
          	 }, {
          		 label : "${0} - yksinkertaistettu",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(etsittävä teksti${1} teksti${1} [sijainti])",
    	Disp:"Etsii tekstiarvoa toisen tekstin sisältä (ei kirjainkoon erottelua)."
    },  
    SIGN:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa luvun etumerkin."
    },
    SIN:{    
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa annetun kulman sinin."
    },
    SINH:{    
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun hyperbolisen sinin."
    },
    SECOND:{    
    	Syntax:"${0}(luku)",
    	Disp:"Määrittää aika-arvon sekuntien määrän (0–59)."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} kertoimet)",
        Disp:"Palauttaa kaavaan perustuvan potenssisarjan arvon."
    },
    SHEET:{   
    	Syntax:"${0}([viite])",
    	Disp:"Määrittää viitteen tai merkkijonon sisäisen taulukkonumeron."
    },
    SMALL:{   
    	Syntax:"${0}(taulukko${1} n:s_sijoitus)",
    	Disp:"Palauttaa arvojoukon n:nneksi pienimmän arvon."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(teksti${1} vanha${1} uusi${1} [esiintymä])",
    	Disp:"Palauttaa tekstin, jossa vanha teksti korvataan uudella tekstillä."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(funktio${1} alue${1} ...)",
    	Disp:"Laskee laskentataulukon välisummat.",
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
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Palauttaa kaikkien argumenttien summan."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(taulukko 1${1} [taulukko 2]${1} ...)",
    	Disp:"Palauttaa taulukon argumenttien tulojen summan."
    },
    SUMIF:{   
    	Syntax:"${0}(alue${1} ehdot${1} [summa-alue])",
    	Disp:"Laskee ehdot täyttävien argumenttien summan."
    },
    SUMIFS:{
    	Syntax: "${0}(summa-alue${1} ehtoalue1${1} ehto1${1} ...)",
    	Disp:"Laskee useat ehdot täyttävien argumenttien summan."
    },
    SQRT:{   
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa luvun neliöjuuren."
    },
    SQRTPI:{   
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa luvun (luku * pii) neliöjuuren."
    },
    STDEV:
    {
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee otokseen perustuvan keskihajonnan."
    },
    STDEVP:
    {
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee keskihajonnan koko populaation perusteella."
    },
    SUMSQ:{
    	Syntax:"${0}(luku1${1} [luku2]${1} ...)",
        Disp:"Palauttaa luettelon lukujen neliöiden summan."
    },
    T:{
    	Syntax:"${0}(teksti)",
    	Disp:"Muuntaa argumentit tekstiksi."
    },
    TAN:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa annetun luvun tangentin."
    },
    TANH:{    
    	Syntax:"${0}(luku)",
        Disp:"Palauttaa annetun luvun hyperbolisen tangentin."
    },
    TBILLPRICE:{
    	Syntax:"${0}(tilityspäivä${1} erääntymispäivä${1} diskonttokorko)",
    	Disp:"Laskee obligaation hinnan 100 euron nimellisarvoa kohden."
    },
    TEXT:{
    	Syntax:"${0}(arvo${1} muotoilukoodi)",
    	Disp:"Muuntaa arvon tekstiksi lukujen muotoilukoodin sääntöjen perusteella ja palauttaa arvon."
    },
    TIME:{   
    	Syntax:"${0}(tunnit${1} minuutit${1} sekunnit)",
    	Disp:"Määrittää kellonaikaa kuvaavan arvon tuntien, minuuttien ja sekuntien mukaan."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(teksti)",
	    Disp:"Palauttaa mahdollisen ajan muodon sisäisen arvon."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Määrittää tietokoneen nykyisen päivämäärän."
    },    
    TRIM:{
    	Syntax:"${0}(teksti)",
    	Disp:"Poistaa kaikki välilyönnit tekstin alusta ja lopusta. Funktio korvaa kaikki muut vähintään kahden välilyönnin jaksot yhdellä välilyönnillä."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Palauttaa loogisen arvon TRUE (tosi)."
    },
    TRUNC:{   
    	Syntax:"${0}(luku${1} [määrä])",
    	Disp:"Katkaisee luvun desimaalit."
    },
    TYPE:{   
    	Syntax:"${0}(arvo)",
    	Disp:"Määrittää arvon tietolajin."	
    },
    UPPER:{  
    	Syntax: "${0}(teksti)",
    	Disp:"Muuntaa tekstin isoiksi kirjaimiksi."
    },
    VALUE:{    
    	Syntax: "${0}(teksti)",
    	Disp:"Muuntaa tekstiargumentin luvuksi."
    },
    VAR:{    
    	Syntax: "${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee otokseen perustuvan arvioidun varianssin."
    },
    VARA:{    
    	Syntax: "${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee otokseen perustuvan arvioidun varianssin, myös luvuista, tekstistä ja loogisista arvoista."
    },
    VARP:{    
    	Syntax: "${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee varianssin koko populaation perusteella."
    },
    VARPA:{    
    	Syntax: "${0}(luku1${1} [luku2]${1} ...)",
    	Disp:"Laskee varianssin koko populaation perusteella, myös luvuista, tekstistä ja loogisista arvoista."
    },
    VLOOKUP:{    
    	Syntax: "${0}(hakuehto${1} taulukko${1} indeksi${1} [lajittelujärjestys])",
    	Disp:"Pystyhaku ja viite määritettyihin soluihin.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - likimääräinen vastine",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - tarkka vastine",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(luku${1} [laji])",
    	Disp:"Palauttaa päivämääräarvon päivämäärityksen kokonaislukuna.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Luvut 1 (sunnuntai) - 7 (lauantai)",
          		 result : 1
          	 }, {
          		 label : "${0} - Luvut 1 (maanantai) - 7 (sunnuntai)",
          		 result : 2
          	 }, {
          		 label : "${0} - Luvut 0 (maanantai) - 6 (sunnuntai)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Luvut 1 (maanantai) - 7 (sunnuntai)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Luvut 1 (tiistai) - 7 (maanantai)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Luvut 1 (keskiviikko) - 7 (tiistai)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Luvut 1 (torstai) - 7 (keskiviikko)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Luvut 1 (perjantai) - 7 (torstai)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Luvut 1 (lauantai) - 7 (perjantai)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Luvut 1 (sunnuntai) - 7 (lauantai)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(luku${1} [tila])",
    	Disp:"Laskee annettua päivämäärää vastaavan kalenteriviikon.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - sunnuntai",
          		 result : 1
          	 }, {
          		 label : "${0} - maanantai",
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
    	Syntax:"${0}(alkupäivämäärä${1} päivät${1} [vapaapäivät])",
    	Disp:"Palauttaa sen päivämäärän sarjanumeron, joka on määritetyn työpäivien määrän verran eteen- tai taaksepäin alkupäivämäärästä."
    },
    XNPV:{   
    	Syntax:"${0}(korko${1} arvot${1} päivämäärät)",
    	Disp:"Laskee nettonykyarvon kassavirtasarjoille."
    },
    YEAR:{    
    	Syntax:"${0}(luku)",
    	Disp:"Palauttaa päivämäärän vuosiarvon kokonaislukuna."
    }
}
})

