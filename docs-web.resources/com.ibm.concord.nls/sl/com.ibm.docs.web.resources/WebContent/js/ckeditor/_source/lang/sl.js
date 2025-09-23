/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "Urejevalnik obogatenega besedila, %1.",

	// ARIA descriptions.
	toolbars	: "Orodne vrstice urejevalnika",
	editor	: "Urejevalnik obogatenega besedila",

	// Toolbar buttons without dialogs.
	source			: "Vir",
	newPage			: "Nova stran",
	save			: "Shrani",
	preview			: "Predogled:",
	cut				: "Izreži",
	copy			: "Kopiraj",
	paste			: "Prilepi",
	print			: "Natisni",
	underline		: "Podčrtano",
	bold			: "Krepko",
	italic			: "Ležeče",
	selectAll		: "Izberi vse",
	removeFormat	: "Odstrani oblikovanje",
	strike			: "Prečrtano",
	subscript		: "Podpisano",
	superscript		: "Nadpisano",
	horizontalrule	: "Vstavi vodoravno črto",
	pagebreak		: "Vstavi prelom strani",
	pagebreakAlt		: "Prelom strani",
	unlink			: "Odstrani povezavo",
	undo			: "Razveljavi",
	redo			: "Ponovno uveljavi",

	// Common messages and labels.
	common :
	{
		browseServer	: "Strežnik brskalnika:",
		url				: "URL:",
		protocol		: "Protokol:",
		upload			: "Naloži:",
		uploadSubmit	: "Pošlji v strežnik",
		image			: "Vstavi sliko",
		flash			: "Vstavi posnetek Flash",
		form			: "Vstavi obrazec",
		checkbox		: "Vstavi potrditveno polje",
		radio			: "Vstavi izbirni gumb",
		textField		: "Vstavi besedilno polje",
		textarea		: "Vstavi besedilno območje",
		hiddenField		: "Vstavi skrito polje",
		button			: "Vstavi gumb",
		select			: "Vstavi izbirno polje",
		imageButton		: "Vstavi slikovni gumb",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Ime:",
		langDir			: "Smer besedila:",
		langDirLtr		: "Od leve proti desni",
		langDirRtl		: "Od desne proti levi",
		langCode		: "Jezikovna koda:",
		longDescr		: "URL dolgega opisa:",
		cssClass		: "Razredi slogovnih listov:",
		advisoryTitle	: "Naslov nasveta:",
		cssStyle		: "Slog:",
		ok				: "V redu",
		cancel			: "Prekliči",
		close : "Zapri",
		preview			: "Predogled:",
		generalTab		: "Splošno",
		advancedTab		: "Napredno",
		validateNumberFailed	: "Ta vrednost ni številska.",
		confirmNewPage	: "Vse neshranjene spremembe te vsebine bodo izgubljene. Ali ste prepričani, da želite dodati novo stran?",
		confirmCancel	: "Nekatere možnosti so bile spremenjene. Ali ste prepričani, da želite izbrisati pogovor?",
		options : "Možnosti",
		target			: "Cilj:",
		targetNew		: "Novo okno (_blank)",
		targetTop		: "Okno na vrhu (_top)",
		targetSelf		: "Isto okno (_self)",
		targetParent	: "Nadrejeno okno (_parent)",
		langDirLTR		: "Od leve proti desni",
		langDirRTL		: "Od desne proti levi",
		styles			: "Slog:",
		cssClasses		: "Razredi slogovnih listov:",
		width			: "Širina:",
		height			: "Višina:",
		align			: "Poravnaj:",
		alignLeft		: "Levo",
		alignRight		: "Desno",
		alignCenter		: "Na sredino",
		alignTop		: "Na vrh",
		alignMiddle		: "Na sredino",
		alignBottom		: "Na dno",
		invalidHeight	: "Višina mora biti pozitivno celo število.",
		invalidWidth	: "Širina mora biti pozitivno celo število.",
		invalidCssLength	: "Vrednost, podana za polje '%1', mora biti pozitivno število z mersko enoto CSS ali brez nje (px, %, in, cm, mm, em, ex, pt ali pc).",
		invalidHtmlLength	: "Vrednost, podana za polje '%1', mora biti pozitivno število z mersko enoto HTML ali brez nje (px ali %).",
		invalidInlineStyle	: "Vrednost, podana za slog naslovne vrstice, mora biti sestavljena iz ene ali več množic z obliko zapisa \"name : value\", ločene s podpičji",
		cssLengthTooltip	: "Vnesite številko za vrednost v slikovnih pikah ali številko z veljavno enoto CSS (px, %, in, cm, mm, em, ex, pt ali pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, ni na voljo</span>"
	},

	contextmenu :
	{
		options : "Možnosti kontekstnega menija"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Vstavi posebni znak",
		title		: "Posebni znak",
		options : "Možnosti posebnega znaka"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Povezava URL",
		other 		: "<other>",
		menu		: "Uredi povezavo ...",
		title		: "Povezava",
		info		: "Informacije o povezavi",
		target		: "Cilj",
		upload		: "Naloži:",
		advanced	: "Napredno",
		type		: "Vrsta povezave:",
		toUrl		: "URL",
		toAnchor	: "Povezava do sidra v besedilu",
		toEmail		: "E-pošta",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Ime ciljnega okvirja:",
		targetPopupName	: "Ime pojavnega okna:",
		popupFeatures	: "Funkcije pojavnega okna:",
		popupResizable	: "Prilagodljiva velikost",
		popupStatusBar	: "Vrstica stanja",
		popupLocationBar	: "Vrstica z mestom",
		popupToolbar	: "Orodna vrstica",
		popupMenuBar	: "Menijska vrstica",
		popupFullScreen	: "Celotni zaslon",
		popupScrollBars	: "Drsni trakovi",
		popupDependent	: "Odvisno (Netscape)",
		popupLeft		: "Položaj na levi",
		popupTop		: "Položaj na vrhu",
		id				: "Id:",
		langDir			: "Smer besedila:",
		langDirLTR		: "Od leve proti desni",
		langDirRTL		: "Od desne proti levi",
		acccessKey		: "Dostopovni ključ:",
		name			: "Ime:",
		langCode		: "Jezikovna koda:",
		tabIndex		: "Kazalo zavihkov:",
		advisoryTitle	: "Naslov nasveta:",
		advisoryContentType	: "Vrsta svetovalne vsebine:",
		cssClasses		: "Razredi slogovnih listov:",
		charset			: "Nabor znakov povezanega vira:",
		styles			: "Slog:",
		rel			: "Razmerje",
		selectAnchor	: "Izberi sidro",
		anchorName		: "Glede na ime sidra",
		anchorId		: "Glede na ID elementa",
		emailAddress	: "E-poštni naslov",
		emailSubject	: "Zadeva sporočila",
		emailBody		: "Telo sporočila",
		noAnchors		: "V dokumentu ni zaznamkov. Če ga želite dodati, kliknite ikono 'Vstavi zaznamek v dokument' v orodni vrstici.",
		noUrl			: "Vnesite URL povezave.",
		noEmail			: "Vnesite e-poštni naslov"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Vstavi zaznamek v dokument",
		menu		: "Uredi zaznamek v dokumentu",
		title		: "Zaznamek v dokumentu",
		name		: "Ime:",
		errorName	: "Vnesite ime za zaznamek v dokumentu",
		remove		: "Odstrani zaznamek iz dokumenta"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Lastnosti številčnega seznama",
		bulletedTitle		: "Lastnosti označenega seznama",
		type				: "Vrsta",
		start				: "Začni",
		validateStartNumber				:"Začetna številka seznama mora biti celo število.",
		circle				: "Krog",
		disc				: "Disk",
		square				: "Kvadrat",
		none				: "Brez",
		notset				: "<not set>",
		armenian			: "Armensko oštevilčenje",
		georgian			: "Gruzinsko oštevilčenje (an, ban, gan itd.)",
		lowerRoman			: "Male rimske številke (i, ii, iii, iv, v itd.)",
		upperRoman			: "Velike rimske številke (I, II, III, IV, V itd.)",
		lowerAlpha			: "Male Alpha (a, b, c, d, e itd.)",
		upperAlpha			: "Velike Alpha (A, B, C, D, E itd.)",
		lowerGreek			: "Male grške (alpha, beta, gamma itd.)",
		decimal				: "Decimalne (1, 2, 3 itd.)",
		decimalLeadingZero	: "Decimalne z vodilno ničlo (01, 02, 03 itd.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Poišči in zamenjaj",
		find				: "Poišči",
		replace				: "Zamenjaj",
		findWhat			: "Poišči:",
		replaceWith			: "Zamenjaj s/z:",
		notFoundMsg			: "Podanega besedila ni bilo mogoče najti.",
		noFindVal			: 'Besedilo za iskanje je obvezno.',
		findOptions			: "Možnosti iskanja",
		matchCase			: "Ujemanje velikih in malih črk",
		matchWord			: "Ujemanje cele besede",
		matchCyclic			: "Ciklično ujemanje",
		replaceAll			: "Zamenjaj vse",
		replaceSuccessMsg	: "Zamenjano je bilo naslednje št. pojavitev: %1."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Vstavi tabelo",
		title		: "Tabela",
		menu		: "Lastnosti tabele",
		deleteTable	: "Izbriši tabelo",
		rows		: "Vrstice:",
		columns		: "Stolpci:",
		border		: "Velikost obrobe:",
		widthPx		: "slikovnih pik",
		widthPc		: "odstotkov",
		widthUnit	: "Enota širine:",
		cellSpace	: "Razmik celic:",
		cellPad		: "Zapolnjevanje celic:",
		caption		: "Napis:",
		summary		: "Povzetek:",
		headers		: "Glave:",
		headersNone		: "Brez",
		headersColumn	: "Prvi stolpec",
		headersRow		: "Prva vrstica",
		headersBoth		: "Oboje",
		invalidRows		: "Število vrstic mora biti celo število, večje od nič.",
		invalidCols		: "Število stolpcev mora biti celo število, večje od nič.",
		invalidBorder	: "Velikost obrobe mora biti pozitivno število.",
		invalidWidth	: "Širina tabele mora biti pozitivno število.",
		invalidHeight	: "Višina tabele mora biti pozitivno število.",
		invalidCellSpacing	: "Razmik med celicami mora biti pozitivno število.",
		invalidCellPadding	: "Zapolnjevanje celic mora biti pozitivno število.",

		cell :
		{
			menu			: "Celica",
			insertBefore	: "Vstavi celico pred",
			insertAfter		: "Vstavi celico za",
			deleteCell		: "Izbriši celice",
			merge			: "Spoji celice",
			mergeRight		: "Spoji desno",
			mergeDown		: "Spoji navzdol",
			splitHorizontal	: "Razdeli celico vodoravno",
			splitVertical	: "Razdeli celico navpično",
			title			: "Lastnosti celice",
			cellType		: "Vrsta celice: ",
			rowSpan			: "Razpon vrstic:",
			colSpan			: "Razpon stolpcev:",
			wordWrap		: "Ovijanje besedila:",
			hAlign			: "Vodoravna poravnava:",
			vAlign			: "Navpična poravnava:",
			alignBaseline	: "Osnovnica",
			bgColor			: "Barva ozadja:",
			borderColor		: "Barva obrobe:",
			data			: "Podatki",
			header			: "Glava",
			yes				: "Da",
			no				: "Ne",
			invalidWidth	: "Širina celice mora biti pozitivno število.",
			invalidHeight	: "Višina celice mora biti pozitivno število.",
			invalidRowSpan	: "Razpon vrstic mora biti pozitivno celo število.",
			invalidColSpan	: "Razpon stolpcev mora biti pozitivno celo število.",
			chooseColor : "Izberi"
		},

		row :
		{
			menu			: "Vrstica",
			insertBefore	: "Vstavi vrstico pred",
			insertAfter		: "Vstavi vrstico za",
			deleteRow		: "Izbriši vrstice"
		},

		column :
		{
			menu			: "Stolpec",
			insertBefore	: "Vstavi stolpec pred",
			insertAfter		: "Vstavi stolpec za",
			deleteColumn	: "Izbriši stolpce"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Lastnosti gumba",
		text		: "Besedilo (vrednost):",
		type		: "Vrsta:",
		typeBtn		: "Gumb",
		typeSbm		: "Predloži",
		typeRst		: "Ponastavi"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Lastnosti potrditvenega polja",
		radioTitle	: "Lastnosti izbirnega gumba",
		value		: "Vrednost:",
		selected	: "Izbrano"
	},

	// Form Dialog.
	form :
	{
		title		: "Vstavi obrazec",
		menu		: "Lastnosti obrazca",
		action		: "Dejanje:",
		method		: "Metoda:",
		encoding	: "Kodiranje:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Izbira lastnosti polja",
		selectInfo	: "Izbira informacij",
		opAvail		: "Razpoložljive možnosti",
		value		: "Vrednost:",
		size		: "Velikost:",
		lines		: "vrstice",
		chkMulti	: "Dovoli več izborov",
		opText		: "Besedilo:",
		opValue		: "Vrednost:",
		btnAdd		: "Dodaj",
		btnModify	: "Spremeni",
		btnUp		: "Gor",
		btnDown		: "Dol",
		btnSetValue : "Nastavi kot izbrano vrednost",
		btnDelete	: "Izbriši"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Lastnosti besedilnega področja",
		cols		: "Stolpci:",
		rows		: "Vrstice:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Lastnosti besedilnega polja",
		name		: "Ime:",
		value		: "Vrednost:",
		charWidth	: "Širina znakov:",
		maxChars	: "Največje število znakov:",
		type		: "Vrsta:",
		typeText	: "Besedilo",
		typePass	: "Geslo"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Lastnosti skritega polja",
		name	: "Ime:",
		value	: "Vrednost:"
	},

	// Image Dialog.
	image :
	{
		title		: "Slika",
		titleButton	: "Lastnosti slikovnega gumba",
		menu		: "Lastnosti slike ...",
		infoTab	: "Informacije o sliki",
		btnUpload	: "Pošlji v strežnik",
		upload	: "Naloži",
		alt		: "Nadomestno besedilo:",
		lockRatio	: "Razmerje zaklepanja",
		resetSize	: "Ponastavi velikost",
		border	: "Obroba:",
		hSpace	: "Vodoravni prostor:",
		vSpace	: "Navpični prostor:",
		alertUrl	: "Vnesite URL slike",
		linkTab	: "Povezava",
		button2Img	: "Ali želite pretvoriti izbrani slikovni gumb v preprosto sliko?",
		img2Button	: "Ali želite pretvoriti izbrano sliko v slikovni gumb?",
		urlMissing : "Manjka URL izvorne slike.",
		validateBorder : "Obroba mora biti pozitivno celo število.",
		validateHSpace : "Vodoravni prostor mora biti pozitivno celo število.",
		validateVSpace : "Navpični prostor mora biti pozitivno celo število."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Lastnosti elementa Flash",
		propertiesTab	: "Lastnosti",
		title		: "Flash",
		chkPlay		: "Samodejno predvajanje",
		chkLoop		: "Zanka",
		chkMenu		: "Omogoči meni flash",
		chkFull		: "Dovoli celozaslonski prikaz",
 		scale		: "Merilo:",
		scaleAll		: "Prikaži vse",
		scaleNoBorder	: "Brez obrobe",
		scaleFit		: "Natančno prileganje",
		access			: "Dostopovni skript:",
		accessAlways	: "Vedno",
		accessSameDomain	: "Ista domena",
		accessNever	: "Nikoli",
		alignAbsBottom: "Abs na dno",
		alignAbsMiddle: "Abs na sredino",
		alignBaseline	: "Osnovnica",
		alignTextTop	: "Besedilo na vrh",
		quality		: "Kakovost:",
		qualityBest	: "Najboljša",
		qualityHigh	: "Visoka",
		qualityAutoHigh	: "Samodejno visoka",
		qualityMedium	: "Srednja",
		qualityAutoLow	: "Samodejno nizka",
		qualityLow	: "Nizka",
		windowModeWindow	: "Okno",
		windowModeOpaque	: "Neprosojno",
		windowModeTransparent	: "Prosojno",
		windowMode	: "Način okna:",
		flashvars	: "Spremenljivke:",
		bgcolor	: "Barva ozadja:",
		hSpace	: "Vodoravni prostor:",
		vSpace	: "Navpični prostor:",
		validateSrc : "Polje za URL ne sme biti prazno.",
		validateHSpace : "Vodoravni prostor mora biti pozitivno celo število.",
		validateVSpace : "Navpični prostor mora biti pozitivno celo število."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Preverjanje črkovanja",
		title			: "Preverjanje črkovanja",
		notAvailable	: "Žal storitev trenutno ni na voljo.",
		errorLoading	: "Napaka pri nalaganja gostitelja aplikacijske storitve: %s.",
		notInDic		: "Ni v slovarju",
		changeTo		: "Spremeni v",
		btnIgnore		: "Prezri",
		btnIgnoreAll	: "Prezri vse",
		btnReplace		: "Zamenjaj",
		btnReplaceAll	: "Zamenjaj vse",
		btnUndo			: "Razveljavi",
		noSuggestions	: "- Ni predlogov -",
		progress		: "Poteka preverjanje črkovanja ...",
		noMispell		: "Preverjanje črkovanja je končano: najdena ni bila nobena napaka v črkovanju",
		noChanges		: "Preverjanje črkovanja je končano: nobena beseda ni bila spremenjena",
		oneChange		: "Preverjanje črkovanja je končano: spremenjena je bila ena beseda",
		manyChanges		: "Preverjanje črkovanja je končano: spremenjenih je bilo naslednje št. besed: %1",
		ieSpellDownload	: "Črkovalnik ni nameščen. Ali ga želite prenesti zdaj?"
	},

	smiley :
	{
		toolbar	: "Vstavi čustveni simbol",
		title	: "Čustveni simboli",
		options : "Možnosti čustvenih simbolov"
	},

	elementsPath :
	{
		eleLabel : "Pot elementov",
		eleTitle : "%1 element"
	},

	numberedlist : "Oštevilčen seznam",
	bulletedlist : "Označen seznam",
	indent : "Povečaj zamik",
	outdent : "Zmanjšaj zamik",

	bidi :
	{
		ltr : "Od leve proti desni",
		rtl : "Od desne proti levi",
	},

	justify :
	{
		left : "Poravnaj levo",
		center : "Poravnaj na sredino",
		right : "Poravnaj desno",
		block : "Poravnaj obojestransko"
	},

	blockquote : "Daljši citat",

	clipboard :
	{
		title		: "Prilepi",
		cutError	: "Nastavitve varnosti v vašem brskalniku preprečujejo samodejno izrezovanje. Namesto tega uporabite kombinacijo tipk Ctrl+X na tipkovnici.",
		copyError	: "Nastavitve varnosti v vašem brskalniku preprečujejo samodejno kopiranje. Namesto tega uporabite kombinacijo tipk Ctrl+C na tipkovnici.",
		pasteMsg	: "Pritisnite Ctrl+V (Cmd+V v sistemu MAC), da prilepite spodaj.",
		securityMsg	: "Nastavitve varnosti v vašem brskalniku preprečujejo samodejno lepljenje iz odložišča. ",
		pasteArea	: "Območje lepljenja"
	},

	pastefromword :
	{
		confirmCleanup	: "Besedilo, ki ga želite prilepiti, je kopirano iz programa Word. Ali ga želite pred lepljenjem počistiti?",
		toolbar			: "Posebno lepljenje",
		title			: "Posebno lepljenje",
		error			: "Zaradi notranje napake ni bilo mogoče počistiti prilepljenih podatkov"
	},

	pasteText :
	{
		button	: "Prilepi kot čisto besedilo",
		title	: "Prilepi kot čisto besedilo"
	},

	templates :
	{
		button 			: "Predloge",
		title : "Predloge za vsebino",
		options : "Možnosti predlog",
		insertOption: "Zamenjaj dejansko vsebino",
		selectPromptMsg: "Izberite predlogo, ki jo želite odpreti v urejevalniku",
		emptyListMsg : "(Definirana ni nobena predloga)"
	},

	showBlocks : "Prikaži bloke",

	stylesCombo :
	{
		label		: "Slogi",
		panelTitle 	: "Slogi",
		panelTitle1	: "Slogi blokov",
		panelTitle2	: "Slogi v vrstici",
		panelTitle3	: "Slogi objektov"
	},

	format :
	{
		label		: "Oblikovanje",
		panelTitle	: "Oblikovanje odstavka",

		tag_p		: "Normalno",
		tag_pre		: "Oblikovano",
		tag_address	: "Naslov",
		tag_h1		: "Naslov 1",
		tag_h2		: "Naslov 2",
		tag_h3		: "Naslov 3",
		tag_h4		: "Naslov 4",
		tag_h5		: "Naslov 5",
		tag_h6		: "Naslov 6",
		tag_div		: "Normalno (DIV)"
	},

	div :
	{
		title				: "Ustvari vsebnik Div",
		toolbar				: "Ustvari vsebnik Div",
		cssClassInputLabel	: "Razredi slogovnih listov",
		styleSelectLabel	: "Slog",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Jezikovna koda",
		inlineStyleInputLabel	: "Slog v vrstici",
		advisoryTitleInputLabel	: "Svetovalni naslov",
		langDirLabel		: "Smer besedila",
		langDirLTRLabel		: "Od leve proti desni",
		langDirRTLLabel		: "Od desne proti levi",
		edit				: "Uredi Div",
		remove				: "Odstrani Div"
  	},

	iframe :
	{
		title		: "Lastnosti informacijskega okvirja",
		toolbar		: "Vstavi informacijski okvir",
		noUrl		: "Vnesite URL informacijskega okvirja",
		scrolling	: "Omogoči drsnike za pomikanje",
		border		: "Prikaži obrobo okvirja"
	},

	font :
	{
		label		: "Pisava",
		voiceLabel	: "Pisava",
		panelTitle	: "Ime pisave"
	},

	fontSize :
	{
		label		: "Velikost",
		voiceLabel	: "Velikost pisave",
		panelTitle	: "Velikost pisave"
	},

	colorButton :
	{
		textColorTitle	: "Barva besedila",
		bgColorTitle	: "Barva ozadja",
		panelTitle		: "Barve",
		auto			: "Samodejno",
		more			: "Več barv ..."
	},

	colors :
	{
		"000" : "Črna",
		"800000" : "Kostanjeva",
		"8B4513" : "Sedlasto rjava",
		"2F4F4F" : "Temno siva skrilavca",
		"008080" : "Zeleno modra",
		"000080" : "Mornarsko modra",
		"4B0082" : "Indigo",
		"696969" : "Temnosiva",
		"B22222" : "Opečnata",
		"A52A2A" : "Rjava",
		"DAA520" : "Zlato rumena",
		"006400" : "Temno zelena",
		"40E0D0" : "Turkizna",
		"0000CD" : "Srednje modra",
		"800080" : "Vijolična",
		"808080" : "Siva",
		"F00" : "Rdeča",
		"FF8C00" : "Temno oranžna",
		"FFD700" : "Zlata",
		"008000" : "Zelena",
		"0FF" : "Cian",
		"00F" : "Modra",
		"EE82EE" : "Vijolična",
		"A9A9A9" : "Mračno siva",
		"FFA07A" : "Svetlo lososova",
		"FFA500" : "Oranžna",
		"FFFF00" : "Rumena",
		"00FF00" : "Limona",
		"AFEEEE" : "Bledo turkizna",
		"ADD8E6" : "Svetlo modra",
		"DDA0DD" : "Sliva",
		"D3D3D3" : "Svetlo siva",
		"FFF0F5" : "Svetlo vijoličasta",
		"FAEBD7" : "Antično bela",
		"FFFFE0" : "Svetlo rumena",
		"F0FFF0" : "Medena",
		"F0FFFF" : "Azurna",
		"F0F8FF" : "Modra Alice",
		"E6E6FA" : "Sivka",
		"FFF" : "Bela"
	},

	scayt :
	{
		title			: "Preverjanje črkovanja med tipkanjem",
		opera_title		: "Ni podprto v brskalniku Opera",
		enable			: "Omogoči SCAYT",
		disable			: "Onemogoči SCAYT",
		about			: "Več o SCAYT",
		toggle			: "Preklopi SCAYT",
		options			: "Možnosti",
		langs			: "Jeziki",
		moreSuggestions	: "Več predlogov",
		ignore			: "Prezri",
		ignoreAll		: "Prezri vse",
		addWord			: "Dodaj besedo",
		emptyDic		: "Polje za ime slovarja ne sme biti prazno.",

		optionsTab		: "Možnosti",
		allCaps			: "Prezri besede s sami velikimi črkami",
		ignoreDomainNames : "Prezri imena domen",
		mixedCase		: "Prezri besede z mešanimi velikimi in malimi črkami",
		mixedWithDigits	: "Prezri besede s številkami",

		languagesTab	: "Jeziki",

		dictionariesTab	: "Slovarji",
		dic_field_name	: "Ime slovarja",
		dic_create		: "Ustvari",
		dic_restore		: "Obnovi",
		dic_delete		: "Izbriši",
		dic_rename		: "Preimenuj",
		dic_info		: "Uporabniški slovar je najprej shranjen v piškotku. Vendar je velikost piškotkov omejena. Ko uporabniški slovar doseže takšno velikost, da ga ni več mogoče shranjevati v piškotek, ga je mogoče shraniti v naš strežnik. Če želite svoj osebni slovar shraniti v naš strežnik, morate navesti ime slovarja. Če že imate shranjen slovar, vnesite njegovo ime in kliknite gumb Obnovi.",

		aboutTab		: "Več o"
	},

	about :
	{
		title		: "Več o urejevalniku CKEditor",
		dlgTitle	: "Več o urejevalniku CKEditor",
		help	: "Za pomoč glejte $1.",
		userGuide : "Uporabniški priročnik za CKEditor",
		moreInfo	: "Licenčne informacije so na voljo na našem spletnem mestu:",
		copy		: "Copyright &copy; $1. Vse pravice pridržane."
	},

	maximize : "Povečaj",
	minimize : "Zmanjšaj",

	fakeobjects :
	{
		anchor	: "Sidro",
		flash	: "Animacija Flash",
		iframe		: "Informacijski okvir",
		hiddenfield	: "Skrito polje",
		unknown	: "Neznani objekt"
	},

	resize : "Povlecite za spremembo velikosti",

	colordialog :
	{
		title		: "Izberi barvo",
		options	:	"Možnosti barve",
		highlight	: "Označi",
		selected	: "Izbrana barva",
		clear		: "Počisti"
	},

	toolbarCollapse	: "Strni orodno vrstico",
	toolbarExpand	: "Razširi orodno vrstico",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Odložišče/razveljavi",
		editing : "Urejanje ",
		forms : "Oblike",
		basicstyles : "Osnovni slogi",
		paragraph : "Odstavek",
		links : "Povezave",
		insert : "Vstavljanje",
		styles : "Slogi",
		colors : "Barve",
		tools : "Orodja"
	},

	bidi :
	{
		ltr : "Spremeni smer besedila v Od leve proti desni",
		rtl : "Spremeni smer besedila v Od desne proti levi"
	},

	docprops :
	{
		label : "Lastnosti dokumenta",
		title : "Lastnosti dokumenta",
		design : "Načrt",
		meta : "Metaoznake",
		chooseColor : "Izberi",
		other : "Drugo ...",
		docTitle :	"Naslov strani",
		charset : 	"Kodiranje nabora znakov",
		charsetOther : "Drugo kodiranje nabora znakov",
		charsetASCII : "ASCII",
		charsetCE : "Srednjeevropsko",
		charsetCT : "Tradicionalna kitajščina (Big5)",
		charsetCR : "Cirilsko",
		charsetGR : "Grško",
		charsetJP : "Japonsko",
		charsetKR : "Korejsko",
		charsetTR : "Turško",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Zahodnoevropsko",
		docType : "Naslov vrste dokumenta",
		docTypeOther : "Drug naslov vrste dokumenta",
		xhtmlDec : "Vključuje deklaracije XHTML",
		bgColor : "Barva ozadja",
		bgImage : "URL slike ozadja",
		bgFixed : "Nedrsno (fiksno) ozadje",
		txtColor : "Barva besedila",
		margin : "Robovi strani",
		marginTop : "Zgoraj",
		marginLeft : "Levo",
		marginRight : "Desno",
		marginBottom : "Spodaj",
		metaKeywords : "Ključne besede za indeksiranje dokumenta (ločene z vejicami)",
		metaDescription : "Opis dokumenta",
		metaAuthor : "Avtor",
		metaCopyright : "Avtorske pravice",
		previewHtml : "<p>To je <strong>vzorčno besedilo</strong>. Uporabljate <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "palci",
			widthCm	: "centimetri",
			widthMm	: "milimetri",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "točke",
			widthPc	: "ciceri"
		},
		table :
		{
			heightUnit	: "Enota višine:",
			insertMultipleRows : "Vstavljanje vrstic",
			insertMultipleCols : "Vstavljanje stolpcev",
			noOfRows : "Število vrstic:",
			noOfCols : "Število stolpcev:",
			insertPosition : "Položaj",
			insertBefore : "Pred",
			insertAfter : "Za",
			selectTable : "Izberi tabelo",
			selectRow : "Izberi vrstico",
			columnTitle : "Stolpec",
			colProps : "Lastnosti stolpca",
			invalidColumnWidth	: "Širina stolpca mora biti pozitivno število."
		},
		cell :
		{
			title : "Celica"
		},
		emoticon :
		{
			angel		: "Angel",
			angry		: "Jezen",
			cool		: "Brezbrižen ",
			crying		: "Jokajoč",
			eyebrow		: "Z dvignjeno obrvjo",
			frown		: "Mrk ",
			goofy		: "Bedast",
			grin		: "Režeč",
			half		: "Polovičen",
			idea		: "Ideja",
			laughing	: "Široko nasmejan",
			laughroll	: "Smejoč in vrteč se",
			no			: "Ne",
			oops		: "Ups",
			shy			: "Sramežljiv",
			smile		: "Smejoč",
			tongue		: "Jezik",
			wink		: "Pomežik",
			yes			: "Da"
		},

		menu :
		{
			link	: "Vstavi povezavo",
			list	: "Seznam",
			paste	: "Prilepi",
			action	: "Dejanje",
			align	: "Poravnaj",
			emoticon: "Čustveni simbol"
		},

		iframe :
		{
			title	: "Informacijski okvir"
		},

		list:
		{
			numberedTitle		: "Oštevilčen seznam",
			bulletedTitle		: "Označen seznam"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Vnesite opisno ime zaznamka, kot je 'Razdelek 1.2'. Potem ko vstavite zaznamek, kliknite 'Poveži' ali ikono 'Povezava z zaznamkom v dokumentu', da vzpostavite povezavo z njim.",
			title		: "Povezava z zaznamkom v dokumentu",
			linkTo		: "Poveži s/z:"
		},

		urllink :
		{
			title : "Povezava URL",
			linkText : "Besedilo povezave:",
			selectAnchor: "Izberite sidro:",
			nourl: "Vnesite URL v besedilno polje.",
			urlhelp: "Vnesite ali prilepite URL, ki se bo odprl, ko bodo uporabniki kliknili to povezavo, npr. http://www.example.com.",
			displaytxthelp: "Vnesite besedilo za prikaz v povezavi.",
			openinnew : "Odpri povezavo v novem oknu"
		},

		spellchecker :
		{
			title : "Preveri črkovanje",
			replace : "Zamenjaj:",
			suggesstion : "Predlogi:",
			withLabel : "S/z:",
			replaceButton : "Zamenjaj",
			replaceallButton:"Zamenjaj vse",
			skipButton:"Preskoči",
			skipallButton: "Preskoči vse",
			undochanges: "Razveljavi spremembe",
			complete: "Preverjanje črkovanja je končano",
			problem: "Težave pri pridobivanju podatkov XML",
			addDictionary: "Dodaj v slovar",
			editDictionary: "Uredi slovar"
		},

		status :
		{
			keystrokeForHelp: "Za pomoč pritisnite ALT 0"
		},

		linkdialog :
		{
			label : "Pogovorno okno za povezavo"
		},

		image :
		{
			previewText : "Besedilo bo potekalo okoli slike, ki jo dodajate, kot v tem primeru."
		}
	}

};
