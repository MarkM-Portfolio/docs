/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Toutes les formules",
	LABEL_FORMULA_LIST: "Liste des formules :",
	formula:{
	ABS:{	
	    Syntax:"${0}(nombre)",
	    Disp:"Renvoie la valeur absolue d'un nombre."
    },
    ACOS:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retourne l'arc cosinus d'un nombre. L'angle est exprimé en radians."
    },
    ACOSH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le cosinus hyperbolique inverse d'un nombre."
    },
    ACOT:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la cotangente inverse d'un nombre. L'angle est mesuré en radians."
    },
    ACOTH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la cotangente hyperbolique inverse d'un nombre."
    },
    ADDRESS:{
         Syntax:"${0}(ligne${1} colonne${1} [abs]${1} [a1]${1} [feuille])",
         Disp:"Renvoie la référence à une cellule, sous forme de texte.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolue",
        		 result : 1
        	 }, {
        		 label : "${0} - Ligne absolue / Colonne relative",
        		 result : 2
        	 }, {
        		 label : "${0} - Ligne relative / Colonne absolue",
        		 result : 3
        	 }, {
        		 label : "${0} - Relative",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - Style R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - Style A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(valeur logique${1} [valeur logique 2]${1} ...)",
    	Disp:"Renvoie la valeur TRUE, lorsque tous les arguments ont la valeur TRUE."
    },
    ASIN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retourne l'arc sinus d'un nombre. L'angle est exprimé en radians."
    },
    ASINH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le sinus hyperbolique inverse d'un nombre."
    },
    ATAN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Retourne l'arc tangente d'un nombre. L'angle est exprimé en radians."
    },
    AVERAGE:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la moyenne des arguments."
    },
    AVERAGEA:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la valeur moyenne d'un échantillon. Le texte est évalué en tant que zéro."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(plage${1} critères${1} [plage_de_moyennes])",
    	Disp:"Renvoie la moyenne (arithmétique) des arguments remplissant les conditions indiquées."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(plage_de_moyennes${1} plage_de_critères1${1} critères1${1} ...)",
    	Disp:"Renvoie la moyenne (arithmétique) des arguments remplissant plusieurs conditions."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Renvoie l'arc tangente, ou tangente inverse, des coordonnées x et y spécifiées. L'arc tangente est l'angle formé par l'axe des x et une ligne contenant l'origine (0, 0) et un point ayant les coordonnées (x_num; y_num)."
    },
    ATANH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie la tangente hyperbolique inverse d'un nombre. Le nombre doit être compris entre -1 et 1 (à l'exclusion de -1 et 1)."
    },
    BASE:{    
    	Syntax:"${0}(nombre${1} base${1} [longueur minimale])",
    	Disp:"Convertit un nombre entier positif en texte d'un système de numération dans la base définie."
    },
    BIN2DEC:{
    	Syntax:"${0}(nombre)",
    	Disp:"Convertit un nombre binaire en nombre décimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre binaire en nombre hexadécimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre binaire en nombre octal."
    },
    CEILING:{  
    	Syntax: "${0}(nombre${1} incrément)",
    	Disp:"Arrondit un nombre à l'entier ou à la valeur aux chiffres significatifs les plus proches."
    },
    CHAR: {
    	Syntax: "${0}(nombre)",
    	Disp: "Renvoie un caractère mappé par le nombre. Il trouve le caractères dans la mappe de caractères Unicode. Le nombre est compris entre 1 et 255."
    },
    CHOOSE: {
    	Syntax: "${0}(index${1} valeur1${1} [valeur2]${1} ...)",
    	Disp: "Recherche et renvoie la valeur correspondante selon l'index, le choix s'effectuant dans une liste de 30 valeurs."
    },
    CODE:{
    	Syntax:"${0}(texte)",
    	Disp:"Renvoie un code numérique pour le premier caractère d'une chaîne de texte dont la page de codes est Unicode."
    },
    COLUMN:{    
    	Syntax:"${0}([référence])",
    	Disp:"Renvoie le numéro de colonne interne d'une référence."
    },
    COLUMNS:{    
    	Syntax:"${0}(matrice)",
    	Disp:"Renvoie le nombre de colonnes d'une référence ou d'une matrice."
    },
    COMBIN:{
    	Syntax:"${0}(nombre${1} nom_choisi)",
    	Disp:"Renvoie le nombre de combinaisons pour un nombre donné d'éléments. Utilisez ${0} pour déterminer le nombre de groupes total possible pour un nombre donné d'éléments."
    },
    CONCATENATE:{   
    	Syntax:"${0}(texte 1${1} ...)",
    	Disp:"Combine plusieurs chaînes de texte pour n'en former qu'une."
    },
    CONVERT:{
    	Syntax:"${0}(nombre${1} de_unité${1} vers_unité)",
    	Disp:"Convertit un nombre d'un système de mesure à un autre.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gramme",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Livre (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (unité de masse atomique)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Once (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Mètre",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Mile terrestre",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Pouce",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Pied",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angström",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Année",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Jour",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Heure",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Minute",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Seconde",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosphère",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - Millimètres de mercure (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Livre-force",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - Calorie IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Electronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Cheval-valeur par heure",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-heure",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Livre-pied",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Calorie thermodynamique",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - cheval-vapeur",
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
       		 label : "${0} - Degré Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Degré Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Cuillère à thé",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Cuillère à soupe",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Once liquide",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Tasse",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - Pinte américaine",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - Pinte britannique",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litre",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le cosinus d'un angle donné."
    },
    COSH:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le cosinus hyperbolique d'un nombre."
    },
    COT:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la cotangente du nombre donné."
    },
    COTH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la cotangente hyperbolique du nombre donné."
    },
    COUNT:{   
    	Syntax:"${0}(valeur1${1} [valeur2]${1} ...)",
    	Disp:"Compte combien la liste des arguments comporte de nombres. Les entrées de texte sont ignorées."
    },
    COUNTA:{   
    	Syntax:"${0}(valeur1${1} [valeur2]${1} ...)",
    	Disp:"Compte le nombre de valeurs qui sont comprises dans la liste des arguments."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(plage)",
    	Disp: "Compte les cellules vides d'une plage."
    },
    COUNTIF:{
    	Syntax: "${0}(plage${1} critère)",
    	Disp:"Compte le nombre de cellules remplissant la condition donnée."
    },
    COUNTIFS:{
    	Syntax: "${0}(plage_de_critères1${1} critères1${1} ...)",
    	Disp:"Compte le nombre de cellules remplissant plusieurs conditions."
    },
    CUMIPMT:{	
	    Syntax:"${0}(taux${1} npm${1} va${1} période_début${1} période_fin${1} type)",
	    Disp:"Calcule l'intérêt cumulé payé entre deux périodes spécifiées."
    },
    CUMPRINC:{	
	    Syntax:"${0}(taux${1} npm${1} va${1} période_début${1} période_fin${1} type)",
	    Disp:"Calcule le principal cumulé payé sur un emprunt, entre deux périodes spécifiées."
    }, 
    DATE:{	
	    Syntax:"${0}(année${1} mois${1} jour)",
	    Disp:"Fournit un nombre interne pour la date spécifiée."
    },  
    DATEDIF:{	
	    Syntax:"${0}(date_début${1} date_fin${1} format)",
	    Disp:"Renvoie la différence en années, mois ou jours entre deux dates.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Nombre d'années complètes dans la période.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Nombre de mois complets dans la période.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Nombre de jours complets dans la période.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Nombre de jours entre date_début et date_fin, mois et années ignorés.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Nombre de mois entre date_début et date_fin, années ignorées.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Nombre de jours entre date_début et date_fin, années ignorées.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(texte)",
	    Disp:"Renvoie un nombre interne pour un texte comportant un format de date possible."
    }, 
    DAY:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le jour d'une valeur de date donnée. Le jour est exprimé sous la forme d'un entier entre 1 et 31. Vous pouvez également entrer une valeur de date/heure négative."
    },
    DAYS360:{
    	Syntax:"${0}(date_début${1} date_fin${1} [méthode])",
    	Disp:"Renvoie le nombre de jours entre deux dates en partant du principe qu'une année compte 360 jours.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - Méthode américaine (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Méthode européenne",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(date_début${1} date_fin${1})",
    	Disp:"Renvoie le nombre de jours entre deux dates."
    },
    DEC2BIN:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre décimal en nombre binaire."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre décimal en nombre hexadécimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre décimal en nombre octal."
    },
    DEGREES:{	
	    Syntax:"${0}(angle)",
	    Disp:"Convertit des radians en degrés."
    },
    DISC:{
    	Syntax:"${0}(règlement${1} échéance${1} valeur_nominale${1} valeur_échéance${1} [base])",
    	Disp:"Calcule le taux d'escompte d'un titre."
    }, 
    DOLLAR:{
    	Syntax:"${0}(nombre${1} [décimales])",
    	Disp:"Convertit un nombre en texte, en utilisant le format de devise $ (dollar)."
    },
    EDATE:{
    	Syntax:"${0}(date_début${1} mois)",
    	Disp:"Renvoie le numéro de série qui représente la date correspondant au nombre de mois avant ou après la date_début."
    },
    EOMONTH:{
    	Syntax:"${0}(date_début${1} mois)",
    	Disp:"Renvoie le numéro de série pour le dernier jour du mois correspondant au nombre de mois avant ou après la date_début."
    },
    ERFC:{   
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la fonction d'erreur complémentaire, intégrée entre un nombre et l'infini."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(référence)",
    	Disp:"Renvoie un nombre correspondant à un type d'erreur."
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
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie un nombre arrondi au nombre entier pair le plus proche."
    },
    EXACT:{    
    	Syntax:"${0}(texte 1${1} texte 2)",
    	Disp: "Compare deux chaînes de texte et renvoie la valeur TRUE si elles sont identiques. Cette fonction tient compte des majuscules et des minuscules."
    },
    EXP:{    
    	Syntax:"${0}(nombre)",
    	Disp: "Renvoie e élevé à la puissance spécifiée par le nombre donné."
    },
    FACT:{  
    	Syntax:"${0}(nombre)",
    	Disp:"Calcule la factorielle d'un nombre."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la double factorielle d'un nombre."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Renvoie la valeur logique FALSE."
    },
    FIND:{   
    	Syntax:"${0}(texte recherché${1} texte${1} [position])",
    	Disp:"Recherche une chaîne dans un texte en respectant la casse (majuscules et minuscules)."
    },
    FIXED:{
    	Syntax:"${0}(nombre${1} [décimales]${1} [aucune_virgule])",
    	Disp:"Met en forme un nombre sous forme de texte avec un nombre donné de décimales.",
    	Arguments: {
    		2 : [{
    			label : "${0} - Empêche l'utilisation de virgules",
    			result : "TRUE"
    		}, {
    			label : "${0} - Permet l'utilisation de virgules",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(nombre${1} précision)",
    	Disp:"Arrondit un nombre à la valeur inférieure aux chiffres significatifs les plus proches."
    },
    FORMULA:{   
    	Syntax:"${0}(référence)",
    	Disp:"Renvoie la formule d'une cellule de formule."
    },
    FREQUENCY:{   
    	Syntax:"${0}(données_ListeSéquenceNumérique${1} classes_ListeSéquenceNumérique)",
    	Disp:"Catégorise les valeurs en intervalles et compte le nombre de valeurs dans chaque intervalle."
    },
    FV:{
    	Syntax:"${0}(taux${1} npm${1} vpm${1} [va]${1} [type])",
    	Disp:"Calcule la valeur capitalisée d'un investissement sur la base d'un taux d'intérêt constant."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(va${1} taux)",
        Disp:"Calcule la valeur capitalisée d'un investissement en appliquant une série de taux d'intérêt composites."
    },
    GAMMALN:{   
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie le logarithme naturel de la fonction gamma."
    },
    GCD:{   
    	Syntax:"${0}(nombre1${1} [nombre 2]${1} ...)",
        Disp:"Renvoie le plus grand diviseur commun de tous les arguments."
    },
    HEX2BIN:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre hexadécimal en nombre binaire."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(nombre)",
    	Disp:"Convertit un nombre hexadécimal en nombre décimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre hexadécimal en nombre octal."
    },
    HOUR:{   
    	Syntax:"${0}(nombre)",
    	Disp:"Détermine le nombre séquentiel de l'heure du jour (0-23) pour la valeur d'heure."
    },
    HLOOKUP:{   
    	Syntax:"${0}(critère_recherche${1} matrice${1} index${1} [trié])",
    	Disp:"Recherche horizontale et référence à des cellules situées en dessous.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondance approximative",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Correspondance exacte",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(link${1} [texte_cellule])",
    	Disp:"Renvoie un lien qui pointe vers une ressource réseau ou vers une plage référencée par le lien. Affiche texte_cellule (facultatif) si fourni ; sinon, affiche le lien en tant que texte."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [valeur_si_vrai]${1} [valeur_si_faux])",
    	Disp:"Spécifie un test logique à effectuer."
    },
    IFS:{
    	Syntax:"${0}(test1${1} valeur_si_true1${1} ...)",
    	Disp:"Exécute des tests logiques pour vérifier si une ou plusieurs conditions sont remplies et renvoie une valeur correspondant à la première condition TRUE."
    },
    IFERROR:{
    	Syntax:"${0}(valeur${1} valeur_si_erreur)",
    	Disp:"Renvoie la valeur que vous avez indiquée si l'expression est une erreur. Sinon, renvoie le résultat de l'expression."
    },
    IFNA:{
    	Syntax:"${0}(valeur${1} valeur_si_na)",
    	Disp:"Renvoie la valeur que vous avez indiquée si l'expression renvoie une valeur d'erreur #N/A. Sinon, renvoie le résultat de l'expression."
    },
    INDEX:{    
    	Syntax:"${0}(référence${1} ligne${1} [colonne]${1} [plage])",
    	Disp:"Renvoie une référence à une cellule à partir d'une plage définie."
    },
    INDIRECT:{    
    	Syntax:"${0}(réf${1} [style_réf])",
    	Disp:"Renvoie le contenu d'une cellule référencée sous forme de texte.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - Style R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - Style A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Arrondit un nombre à l'entier inférieur le plus proche."
    },
    IPMT:{
    	Syntax:"${0}(taux${1} pér${1} npér${1} va${1} [vc]${1} [type])",
    	Disp:"Calcule le montant de remboursement des intérêts d'une période pour un investissement basé sur des paiements réguliers et un taux d'intérêt fixe."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la cellule référencée est vide, sinon renvoie FALSE."
    },
    ISERR:{
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur fait référence à une des valeurs d'erreur, à l'exception de #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est une valeur d'erreur."
    },
    ISEVEN:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est paire, sinon renvoie FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(référence)",
    	Disp:"Renvoie TRUE si la cellule est une cellule de formule."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur comporte un nombre logique."
    },
    ISNA:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est égale à #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur n'est pas du texte."
    },
    ISNUMBER:{   
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est un nombre."
    },
    ISODD:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est un nombre entier impair."
    },
    ISPMT:{
    	Syntax:"${0}(taux${1} pér${1} npm${1} va)",
    	Disp:"Calcule le montant des intérêts payés au cours d'une période spécifique d'un investissement."
    }, 
    ISREF:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est une référence."
    },
    ISTEXT:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Renvoie TRUE si la valeur est un texte."
    },
    LARGE:{
        Syntax:"${0}(matrice${1} position_n)",
    	Disp:"Renvoie la nième plus grande valeur d'un ensemble de valeurs."
    },
    LCM:{   
    	Syntax:"${0}(nombre1${1} [nombre 2]${1} ...)",
        Disp:"Renvoie le plus petit multiple commun de tous les nombres de la liste."
    },
    LEFT:{
        Syntax:"${0}(texte${1} [longueur])",
    	Disp:"Renvoie le nombre de caractères spécifiés, en partant du début du texte."
    },
    LEN:{
    	Syntax:"${0}(texte)",
    	Disp:"Renvoie la longueur d'une chaîne de texte."
    },
    LENB:{
    	Syntax:"${0}(texte)",
    	Disp:"Renvoie le nombre d'octets d'une chaîne de texte."
    },
    LN:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le logarithme naturel d'un nombre."
    },
    LOG:{
    	Syntax:"${0}(nombre${1} [base])",
    	Disp:"Renvoie le logarithme d'un nombre dans la base spécifiée."
    },
    LOG10:{
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le logarithme de base 10 d'un nombre."
    },
    LOOKUP:{
    	Syntax: "${0}(critère_recherche${1} vecteur_recherche${1} [vecteur_résultat])",
    	Disp:"Détermine une valeur dans un vecteur en effectuant une comparaison avec les valeurs d'un autre vecteur."
    },
    LOWER:{    
    	Syntax:"${0}(texte)",
    	Disp:"Convertit un texte en minuscules."
    },    
    MATCH:{    
    	Syntax: "${0}(critère_recherche${1} matrice_recherche${1} [type])",
    	Disp:"Détermine une position dans une matrice après comparaison des valeurs.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Inférieur à",
         		 result : 1
         	 }, {
         		 label : "${0} - Correspondance exacte",
         		 result : 0
         	 }, {
         		 label : "${0} - Supérieur à",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Calcule la valeur maximale d'une liste d'arguments."
    },
    MEDIAN:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la valeur du milieu, quand le nombre de valeurs est impair. Quand il est pair, renvoie la moyenne arithmétique des deux valeurs situées au milieu de la série."
    },
    MID:{    
    	Syntax:"${0}(texte${1} nombre${1} nombre)",
    	Disp:"Renvoie une chaîne de caractères partielle d'un texte."
    }, 
    MIN:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la valeur minimale d'une liste d'arguments."
    },    
    MINUTE:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Détermine le nombre séquentiel de la minute de l'heure (0-59) pour la valeur d'heure."
    },    
    MOD:{    
    	Syntax:"${0}(dividende${1} diviseur)",
    	Disp:"Renvoie le reste quand le dividende est divisé par le diviseur."
    },
    MODE:{    
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la valeur la plus fréquente dans un échantillon."
    },
    MONTH:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie la partie mois d'une valeur de date donnée. Le mois est exprimé sous la forme d'un nombre entier de 1 à 12."
    },
    MROUND:{   
    	Syntax: "${0}(nombre${1} multiple)",
        Disp:"Renvoie un nombre arrondi au multiple spécifié."
    },
    MMULT:{    
    	Syntax:"${0}(matrice${1} matrice)",
    	Disp:"Multiplication de matrice. Renvoie le produit de deux matrices."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(nombre1${1} [nombre 2]${1} ...)",
        Disp:"Renvoie le coefficient multinomial d'un ensemble de nombres."
    },
    N:{    
    	Syntax:"${0}(valeur)",
    	Disp:"Convertit une valeur en nombre."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Renvoie la valeur d'erreur #NA."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(date de début${1} date de fin${1} [congés])",
    	Disp:"Renvoie le nombre de jours ouvrés compris entre deux dates."
    },
    NOT:{    
    	Syntax:"${0}(valeur logique)",
    	Disp:"Inverse la valeur de l'argument."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Détermine l'heure actuelle sur l'ordinateur."
    },
    NPV:{   
    	Syntax:"${0}(taux${1} valeur 1${1} [valeur 2]${1} ...)",
        Disp:"Calcule la valeur nette actualisée d'un investissement, basée sur un taux d'escompte fourni et une série de paiements et de revenus futurs."
    },
    OCT2BIN:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre octal en nombre binaire."
    },
    OCT2DEC:{
    	Syntax:"${0}(nombre)",
    	Disp:"Convertit un nombre octal en nombre décimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(nombre${1} [positions])",
    	Disp:"Convertit un nombre octal en nombre hexadécimal."
    },
    ODD:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Arrondit un nombre à l'entier impair le plus proche."
    },
    OFFSET:{
    	Syntax:"${0}(référence${1} lignes${1} colonnes${1} [hauteur]${1} [largeur])",
    	Disp:"Renvoie une référence à une plage qui est un nombre spécifié de lignes et de colonnes à partir d'une cellule ou d'une plage de cellules."
    },
    OR:{    
    	Syntax:"${0}(valeur logique${1} [valeur logique 2]${1} ...)",
    	Disp:"Renvoie TRUE si au moins un argument a la valeur TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Renvoie la valeur approximative de Pi."
    },
    PMT:{
    	Syntax:"${0}(taux${1} npér${1} va${1} [vc]${1} [type])",
    	Disp:"Renvoie le paiement pour un prêt basé sur des paiements réguliers et un taux d'intérêt fixe."
    },
    POWER:{    
    	Syntax:"${0}(base${1} puissance)",
    	Disp:"Elève un nombre à la puissance d'un autre."
    },
    PPMT:{
    	Syntax:"${0}(taux${1} pér${1} npér${1} va${1} [vc]${1} [type])",
    	Disp:"Calcule le montant de remboursement d'une période pour un investissement basé sur des paiements réguliers et un taux d'intérêt fixe."
    },
    PRICEDISC:{
    	Syntax:"${0}(règlement${1} échéance${1} escompte${1} valeur_échéance${1} [base])",
    	Disp:"Calcule la valeur d'encaissement d'un escompte sur un titre, pour une valeur nominale de 100 euros."
    },
    PRICEMAT:{
    	Syntax:"${0}(règlement${1} échéance${1} émission${1} taux${1} rendement${1} [base])",
    	Disp:"Calcule la valeur d'encaissement sur un titre payant des intérêts à l'échéance, pour une valeur nominale de 100 euros."
    },
    PRODUCT:{   
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Multiplie tous les nombres fournis en tant qu'arguments et renvoie le produit."
    },
    PROPER:{    
    	Syntax:"${0}(texte)",
    	Disp:"Convertit une chaîne de texte en mettant en majuscule la première lettre de chaque mot et en laissant les autres lettres en minuscule."
    },
    PV:{
    	Syntax:"${0}(taux${1} pér${1} vpm${1} [vc]${1} [type])",
    	Disp:"Calcule la valeur actuelle d'un investissement sur la base d'une série de paiements futurs."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(numérateur${1} dénominateur)",
        Disp:"Renvoie le résultat d'un nombre divisé par un autre nombre, tronqué à un nombre entier."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Renvoie un nombre aléatoire entre 0 et 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bas${1} haut)",
    	Disp: "Renvoie un nombre aléatoire entier compris entre les nombres spécifiés."
    },
    RANK:{    
    	Syntax:"${0}(nombre${1} réf${1} [ordre])",
    	Disp: "Renvoie le rang d'une valeur d'un échantillon.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Décroissant",
          		 result : 0
          	 }, {
          		 label : "${0} - Croissant",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(règlement${1} échéance${1} investissement${1} escompte${1} [base])",
    	Disp:"Calcule le montant perçu à l'échéance pour un titre entièrement investi."
    }, 
    REPLACE:{    
    	Syntax: "${0}(texte${1} position${1} longueur${1} nouveau texte)",
    	Disp:"Remplace une chaîne de texte par une autre."	
    },
    REPT:{    
    	Syntax: "${0}(texte${1} nombre de fois)",
    	Disp:"Répète un texte autant de fois que spécifié."	
    },
    RIGHT:{
    	Syntax: "${0}(texte${1} [nombre])",
    	Disp:"Renvoie le ou les derniers caractères d'un texte."
    },
    RIGHTB:{
    	Syntax: "${0}(texte${1} [nombre])",
    	Disp:"Renvoie le ou les derniers caractères d'un texte."
    },
    ROUND:{   
    	Syntax: "${0}(nombre${1} nombre)",
    	Disp:"Arrondit un nombre avec une précision prédéfinie."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(nombre${1} nombre)",
    	Disp:"Arrondit un nombre à l'unité inférieure avec une précision prédéfinie."
    },
    ROUNDUP:{   
    	Syntax: "${0}(nombre${1} nombre)",
    	Disp:"Arrondit un nombre à l'unité supérieure avec une précision prédéfinie."
    },
    ROW:{   
    	Syntax:"${0}([référence])",
    	Disp:"Détermine le numéro de ligne interne d'une référence."
    },
    ROWS:{   
    	Syntax:"${0}(matrice)",
    	Disp:"Renvoie le nombre de lignes d'une matrice ou d'une référence."
    },
    RADIANS:{   
    	Syntax:"${0}(angle)",
    	Disp:"Convertit des degrés en radians."
    },
    ROMAN:{   
    	Syntax:"${0}(nombre${1} [format])",
    	Disp:"Convertit un nombre arabe en nombre romain, sous forme de texte.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Classique",
          		 result : 0
          	 }, {
          		 label : "${0} - Plus concis",
          		 result : 1
          	 }, {
          		 label : "${0} - Plus concis",
          		 result : 2
          	 }, {
          		 label : "${0} - Plus concis",
          		 result : 3
          	 }, {
          		 label : "${0} - Simplifié",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(texte recherché${1} texte${1} [position])",
    	Disp:"Recherche une chaîne de texte dans un texte sans respecter la casse (majuscules et minuscules)."
    },  
    SIGN:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie le signe algébrique d'un nombre."
    },
    SIN:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le sinus d'un angle donné."
    },
    SINH:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie le sinus hyperbolique d'un nombre."
    },
    SECOND:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Détermine le nombre séquentiel de la seconde de la minute (0-59) pour la valeur d'heure."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} coefficients)",
        Disp:"Renvoie la somme d'une série de puissances basée sur la formule."
    },
    SHEET:{   
    	Syntax:"${0}([référence])",
    	Disp:"Renvoie le numéro de feuille interne d'une référence ou d'une chaîne."
    },
    SMALL:{   
    	Syntax:"${0}(matrice${1} position_n)",
    	Disp:"Renvoie la nième plus petite valeur d'un ensemble de valeurs."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(texte${1} ancien${1} nouveau${1} [occurrence])",
    	Disp:"Renvoie un texte dans lequel un ancien texte est remplacé par un nouveau."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(fonction${1} plage${1} ...)",
    	Disp:"Calcule les sous-totaux dans une feuille de calcul.",
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
    	Syntax:"${0}(nombre1${1} [nombre 2]${1} ...)",
    	Disp:"Renvoie la somme de tous les arguments."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(matrice 1${1} [matrice 2]${1} ...)",
    	Disp:"Renvoie la somme des produits des arguments de matrice."
    },
    SUMIF:{   
    	Syntax:"${0}(plage${1} critères${1} [plage de sommes])",
    	Disp:"Additionne les arguments qui remplissent les conditions."
    },
    SUMIFS:{
    	Syntax: "${0}(plage_de_sommes${1} plage_de_critères1${1} critères1${1} ...)",
    	Disp:"Calcule le total des arguments qui remplissent plusieurs conditions."
    },
    SQRT:{   
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie la racine carrée d'un nombre."
    },
    SQRTPI:{   
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la racine carrée de (nombre * Pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Calcule l'écart type en se basant sur un échantillon."
    },
    STDEVP:
    {
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
    	Disp:"Calcule l'écart type à partir de la population entière."
    },
    SUMSQ:{
    	Syntax:"${0}(nombre 1${1} [nombre 2]${1} ...)",
        Disp:"Renvoie la somme des carrés des nombres de la liste."
    },
    T:{
    	Syntax:"${0}(texte)",
    	Disp:"Convertit les arguments d'un texte en texte."
    },
    TAN:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la tangente du nombre donné."
    },
    TANH:{    
    	Syntax:"${0}(nombre)",
        Disp:"Renvoie la tangente hyperbolique du nombre donné."
    },
    TBILLPRICE:{
    	Syntax:"${0}(règlement${1} échéance${1} escompte)",
    	Disp:"Calcule le prix d’un bon du Trésor d’une valeur nominale de 100 euros."
    },
    TEXT:{
    	Syntax:"${0}(valeur${1} code format)",
    	Disp:"Convertit la valeur en texte selon les règles du code de format spécifié et renvoie le résultat obtenu."
    },
    TIME:{   
    	Syntax:"${0}(heure${1} minute${1} seconde)",
    	Disp:"Détermine une valeur d'heure à partir des données en heures, minutes et secondes."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(texte)",
	    Disp:"Renvoie un nombre interne pour un texte comportant un format d'heure possible."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Détermine la date actuelle sur l'ordinateur."
    },    
    TRIM:{
    	Syntax:"${0}(texte)",
    	Disp:"Supprime tous les espaces de début et de fin. Toute autre séquence composée d'au moins 2 espaces internes est remplacée par un seul espace."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Renvoie la valeur logique TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(nombre${1} [nombre])",
    	Disp:"Réduit le nombre de décimales d'un nombre."
    },
    TYPE:{   
    	Syntax:"${0}(valeur)",
    	Disp:"Définit le type de données d'une valeur."	
    },
    UPPER:{  
    	Syntax: "${0}(texte)",
    	Disp:"Convertit un texte en majuscules."
    },
    VALUE:{    
    	Syntax: "${0}(texte)",
    	Disp:"Convertit un argument de texte en nombre."
    },
    VAR:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Estime la variance sur la base d'un échantillon."
    },
    VARA:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Estime la variance sur la base d'un échantillon, en incluant des nombres, du texte et des valeurs logiques."
    },
    VARP:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Calcule la variance à partir de la population entière."
    },
    VARPA:{    
    	Syntax: "${0}(nombre1${1} [nombre2]${1}...)",
    	Disp:"Calcule la variance à partir de la population entière, en incluant des nombres, du texte et des valeurs logiques."
    },
    VLOOKUP:{    
    	Syntax: "${0}(critère recherche${1} matrice${1} index${1} [ordre de tri])",
    	Disp:"Recherche verticale et référence aux cellules indiquées.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Correspondance approximative",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Correspondance exacte",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(nombre${1} [type])",
    	Disp:"Renvoie le jour de la semaine pour la valeur de date indiquée sous forme d'entier.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Nombres 1 (dimanche) à 7 (samedi)",
          		 result : 1
          	 }, {
          		 label : "${0} - Nombres 1 (lundi) à 7 (dimanche)",
          		 result : 2
          	 }, {
          		 label : "${0} - Nombres 0 (lundi) à 6 (dimanche)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Nombres 1 (lundi) à 7 (dimanche)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Nombres 1 (mardi) à 7 (lundi)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Nombres 1 (mercredi) à 7 (mardi)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Nombres 1 (jeudi) à 7 (mercredi)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Nombres 1 (vendredi) à 7 (jeudi)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Nombres 1 (samedi) à 7 (vendredi)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Nombres 1 (dimanche) à 7 (samedi)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(nombre${1} [mode])",
    	Disp:"Renvoie la semaine calendaire correspondant à la date donnée.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Dimanche",
          		 result : 1
          	 }, {
          		 label : "${0} - Lundi",
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
    	Syntax:"${0}(date_début${1} jours${1} [congés])",
    	Disp:"Renvoie le numéro de série de la date avant ou après un nombre donné de jours de travail."
    },
    XNPV:{   
    	Syntax:"${0}(taux${1} valeurs${1} dates)",
    	Disp:"Calcule la valeur nette actualisée d'un ensemble de paiements."
    },
    YEAR:{    
    	Syntax:"${0}(nombre)",
    	Disp:"Renvoie l'année de la valeur date sous forme d'entier."
    }
}
})

