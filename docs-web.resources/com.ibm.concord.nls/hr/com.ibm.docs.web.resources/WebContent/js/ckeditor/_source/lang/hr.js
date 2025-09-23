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
	editorTitle : "Editor bogatog teksta, %1.",

	// ARIA descriptions.
	toolbars	: "Trake s alatima editora",
	editor	: "Editor bogatog teksta",

	// Toolbar buttons without dialogs.
	source			: "Izvor",
	newPage			: "Nova stranica",
	save			: "Spremi",
	preview			: "Pregled:",
	cut				: "Izreži",
	copy			: "Kopiraj",
	paste			: "Zalijepi",
	print			: "Ispiši",
	underline		: "Podcrtaj",
	bold			: "Podebljaj",
	italic			: "Kurziv",
	selectAll		: "Izaberi sve",
	removeFormat	: "Ukloni format",
	strike			: "Precrtaj",
	subscript		: "Indeks",
	superscript		: "Superskript",
	horizontalrule	: "Umetni vodoravnu liniju",
	pagebreak		: "Umetni prekid stranice",
	pagebreakAlt		: "Prekid stranice",
	unlink			: "Ukloni vezu",
	undo			: "Poništi",
	redo			: "Ponovno napravi",

	// Common messages and labels.
	common :
	{
		browseServer	: "Poslužitelj pretražitelja:",
		url				: "URL:",
		protocol		: "Protokol:",
		upload			: "Upload:",
		uploadSubmit	: "Pošalji na poslužitelj",
		image			: "Umetni sliku",
		flash			: "Umetni fleš film",
		form			: "Umetni obrazac",
		checkbox		: "Umetni kontrolnu kućicu",
		radio			: "Umetni kružni izbornik",
		textField		: "Umetni polje teksta",
		textarea		: "Umetni područje teksta",
		hiddenField		: "Umetni sakriveno polje",
		button			: "Umetni gumb",
		select			: "Umetni polje izbora",
		imageButton		: "Umetni gumb slike",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Ime:",
		langDir			: "Smjer teksta:",
		langDirLtr		: "Od lijeva na desno",
		langDirRtl		: "Od desna na lijevo",
		langCode		: "Šifra jezika:",
		longDescr		: "URL dugog opisa:",
		cssClass		: "Klase lista stila:",
		advisoryTitle	: "Savjetodavni naslov:",
		cssStyle		: "Stil:",
		ok				: "OK",
		cancel			: "Opoziv",
		close : "Zatvori",
		preview			: "Pregled:",
		generalTab		: "Općenito",
		advancedTab		: "Napredno",
		validateNumberFailed	: "Ova vrijednost nije broj.",
		confirmNewPage	: "Sve nespremljene promjene ovog sadržaja će biti izgubljene. Jeste li sigurni da želite učitati novu stranicu?",
		confirmCancel	: "Neke opcije su promijenjene. Jeste li sigurni da želite zatvoriti dijalog? ",
		options : "Opcije",
		target			: "Cilj:",
		targetNew		: "Novi prozor (_blank)",
		targetTop		: "Najviši prozor (_top)",
		targetSelf		: "Isti prozor (_self)",
		targetParent	: "Nadređeni prozor (_parent)",
		langDirLTR		: "Od lijeva na desno",
		langDirRTL		: "Od desna na lijevo",
		styles			: "Stil:",
		cssClasses		: "Klase lista stila:",
		width			: "Širina:",
		height			: "Visina:",
		align			: "Poravnanje:",
		alignLeft		: "Lijevo",
		alignRight		: "Desno",
		alignCenter		: "Centar",
		alignTop		: "Vrh",
		alignMiddle		: "Sredina",
		alignBottom		: "Dno",
		invalidHeight	: "Visina mora biti pozitivan cijeli broj.",
		invalidWidth	: "Širina mora biti pozitivan cijeli broj.",
		invalidCssLength	: "Vrijednost navedena za polje '%1' mora biti pozitivan broj s ili bez važeće CSS jedinice mjere (px, %, in, cm, mm, em, ex, pt ili pc).",
		invalidHtmlLength	: "Vrijednost navedena za polje '%1' mora biti pozitivan broj s ili bez važeće HTML jedinice mjere (px ili %).",
		invalidInlineStyle	: "Vrijednost navedena za umetnuti stil mora se sastojati od jedne ili više n-torki s formatom od \"name : value\", odijeljeno s točka-zarez.",
		cssLengthTooltip	: "Unesite broj za vrijednost u pikselima ili broj s važećom CSS jedinicom (px, %, in, cm, mm, em, ex, pt ili pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, nedostupno</span>"
	},

	contextmenu :
	{
		options : "Opcije kontekstnog izbornika"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Umetnite posebni znak",
		title		: "Posebni znak",
		options : "Opcije posebnog znaka"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL veza",
		other 		: "<other>",
		menu		: "Uređivanje veze...",
		title		: "Veza",
		info		: "Informacije o vezi",
		target		: "Cilj",
		upload		: "Upload:",
		advanced	: "Napredno",
		type		: "Tip veze:",
		toUrl		: "URL",
		toAnchor	: "Veza na sidro u tekstu",
		toEmail		: "E-pošta",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Ime ciljnog okvira:",
		targetPopupName	: "Ime pop-up prozora:",
		popupFeatures	: "Svojstva pop-up prozora:",
		popupResizable	: "Može se povećati",
		popupStatusBar	: "Traka statusa",
		popupLocationBar	: "Traka lokacije",
		popupToolbar	: "Traka s alatima",
		popupMenuBar	: "Traka s izbornicima",
		popupFullScreen	: "Pun ekran (IE)",
		popupScrollBars	: "Klizne trake",
		popupDependent	: "Ovisan (Netscape)",
		popupLeft		: "Lijeva pozicija",
		popupTop		: "Gornja pozicija",
		id				: "Id:",
		langDir			: "Smjer teksta:",
		langDirLTR		: "Od lijeva na desno",
		langDirRTL		: "Od desna na lijevo",
		acccessKey		: "Pristupni ključ:",
		name			: "Ime:",
		langCode		: "Šifra jezika:",
		tabIndex		: "Indeks kartice:",
		advisoryTitle	: "Savjetodavni naslov:",
		advisoryContentType	: "Tip savjetodavnog sadržaja:",
		cssClasses		: "Klase lista stila:",
		charset			: "Povezani skup znakova resursa:",
		styles			: "Stil:",
		rel			: "Relacija",
		selectAnchor	: "Izbor sidra",
		anchorName		: "Po imenu sidra",
		anchorId		: "Po ID-u elementa",
		emailAddress	: "Adresa e-pošte",
		emailSubject	: "Predmet poruke",
		emailBody		: "Tijelo poruke",
		noAnchors		: "Nema raspoloživih knjiških oznaka u dokumentu. Za dodavanje, kliknite ikonu 'Umetni knjišku oznaku dokumenta' na traci s alatima.",
		noUrl			: "Molim unesite URL veze",
		noEmail			: "Molim unesite adresu e-pošte"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Umetnite knjišku oznaku dokumenta",
		menu		: "Uredite knjišku oznaku dokumenta",
		title		: "Knjiška oznaka",
		name		: "Ime:",
		errorName	: "Molim unesite ime za knjišku oznaku dokumenta",
		remove		: "Uklonite knjišku oznaku dokumenta"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Svojstva numerirane liste",
		bulletedTitle		: "Svojstva označene liste",
		type				: "Tip",
		start				: "Početak",
		validateStartNumber				:"Početni broj liste mora biti cijeli broj.",
		circle				: "Krug",
		disc				: "Disk",
		square				: "Kvadrat",
		none				: "Ništa",
		notset				: "<not set>",
		armenian			: "Armensko numeriranje",
		georgian			: "Gregorijansko numeriranje (an, ban, gan itd.)",
		lowerRoman			: "Mala rimska (i, ii, iii, iv, v itd.)",
		upperRoman			: "Velika rimska (I, II, III, IV, V itd.)",
		lowerAlpha			: "Mala alfa (a, b, c, d, e itd.)",
		upperAlpha			: "Velika alfa (A, B, C, D, E itd.)",
		lowerGreek			: "Mala grčka (alpha, beta, gamma itd.)",
		decimal				: "Decimalni(1, 2, 3 itd.)",
		decimalLeadingZero	: "Decimalni s vodećom nulom (01, 02, 03 itd.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Nalaženje i zamjena",
		find				: "Nađi",
		replace				: "Zamijeni",
		findWhat			: "Nađi:",
		replaceWith			: "Zamijeni sa:",
		notFoundMsg			: "Navedeni tekst nije nađen.",
		noFindVal			: 'Obavezan je tekst za nalaženje.',
		findOptions			: "Opcije traženja",
		matchCase			: "Podudaranje slova",
		matchWord			: "Podudaranje čitave riječi",
		matchCyclic			: "Podudaranje ciklički",
		replaceAll			: "Zamijeni sve",
		replaceSuccessMsg	: "%1 pojava zamijenjeno."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Umetni tablicu",
		title		: "Tablica",
		menu		: "Svojstva tablice",
		deleteTable	: "Izbriši tablicu",
		rows		: "Redovi:",
		columns		: "Stupci:",
		border		: "Veličina ruba:",
		widthPx		: "pikseli",
		widthPc		: "postotak",
		widthUnit	: "Jedinica širine:",
		cellSpace	: "Prored ćelija:",
		cellPad		: "Punjenje ćelija:",
		caption		: "Naslov:",
		summary		: "Sažetak:",
		headers		: "Zaglavlja:",
		headersNone		: "Ništa",
		headersColumn	: "Prvi stupac",
		headersRow		: "Prvi red",
		headersBoth		: "Oboje",
		invalidRows		: "Broj redova mora biti cijeli broj veći od nule.",
		invalidCols		: "Broj stupaca mora biti cijeli broj veći od nule.",
		invalidBorder	: "Veličina ruba mora biti pozitivan broj.",
		invalidWidth	: "Širina tablice mora biti pozitivan broj.",
		invalidHeight	: "Visina tablice mora biti pozitivan broj.",
		invalidCellSpacing	: "Prored ćelija mora biti pozitivan broj.",
		invalidCellPadding	: "Punjenje ćelija mora biti pozitivan broj.",

		cell :
		{
			menu			: "Ćelija",
			insertBefore	: "Umetni ćeliju ispred",
			insertAfter		: "Umetni ćeliju iza",
			deleteCell		: "Izbriši ćelije",
			merge			: "Spoji ćelije",
			mergeRight		: "Spoji desno",
			mergeDown		: "Spoji dolje",
			splitHorizontal	: "Razdijeli ćeliju vodoravno",
			splitVertical	: "Razdijeli ćeliju okomito",
			title			: "Svojstva ćelije",
			cellType		: "Tip ćelija:",
			rowSpan			: "Protezanje redova:",
			colSpan			: "Protezanje stupaca:",
			wordWrap		: "Prelamanje riječi:",
			hAlign			: "Vodoravno poravnanje:",
			vAlign			: "Okomito poravnanje:",
			alignBaseline	: "Osnovna linija",
			bgColor			: "Boja pozadine:",
			borderColor		: "Boja ruba:",
			data			: "Podaci",
			header			: "Zaglavlje",
			yes				: "Da",
			no				: "Ne",
			invalidWidth	: "Širina ćelije mora biti pozitivan broj.",
			invalidHeight	: "Visina ćelije mora biti pozitivan broj.",
			invalidRowSpan	: "Protezanje redova mora biti pozitivan cijeli broj.",
			invalidColSpan	: "Protezanje stupaca mora biti pozitivan cijeli broj.",
			chooseColor : "Izaberi"
		},

		row :
		{
			menu			: "Red",
			insertBefore	: "Umetni red ispred",
			insertAfter		: "Umetni red iza",
			deleteRow		: "Izbriši redove"
		},

		column :
		{
			menu			: "Stupac",
			insertBefore	: "Umetni stupac ispred",
			insertAfter		: "Umetni stupac iza",
			deleteColumn	: "Izbriši stupce"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Svojstva gumba",
		text		: "Tekst (Vrijednost):",
		type		: "Tip:",
		typeBtn		: "Gumb",
		typeSbm		: "Submit",
		typeRst		: "Reset"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Svojstva kontrolne kućice",
		radioTitle	: "Svojstva kružnog izbornika",
		value		: "Vrijednost:",
		selected	: "Izabrano"
	},

	// Form Dialog.
	form :
	{
		title		: "Umetni obrazac",
		menu		: "Svojstva obrasca",
		action		: "Akcija:",
		method		: "Metoda:",
		encoding	: "Kodiranje:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Izbor svojstava polja",
		selectInfo	: "Izaberi Info",
		opAvail		: "Raspoložive opcije",
		value		: "Vrijednost:",
		size		: "Veličina:",
		lines		: "linije",
		chkMulti	: "Dozvoli višestruke izbore",
		opText		: "Tekst:",
		opValue		: "Vrijednost:",
		btnAdd		: "Dodaj",
		btnModify	: "Promijeni",
		btnUp		: "Gore",
		btnDown		: "Dolje",
		btnSetValue : "Postavi kao izabranu vrijednost",
		btnDelete	: "Izbriši"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Svojstva područja teksta",
		cols		: "Stupci:",
		rows		: "Redovi:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Svojstva polja teksta",
		name		: "Ime:",
		value		: "Vrijednost:",
		charWidth	: "Širina znaka:",
		maxChars	: "Maksimum znakova:",
		type		: "Tip:",
		typeText	: "Tekst",
		typePass	: "Lozinka"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Svojstva sakrivenog polja",
		name	: "Ime:",
		value	: "Vrijednost:"
	},

	// Image Dialog.
	image :
	{
		title		: "Slika",
		titleButton	: "Svojstva gumba slike",
		menu		: "Svojstva slike...",
		infoTab	: "Informacije o slici",
		btnUpload	: "Pošalji na poslužitelj",
		upload	: "Upload",
		alt		: "Zamjenski tekst:",
		lockRatio	: "Omjer zaključavanja",
		resetSize	: "Resetiraj veličinu",
		border	: "Rub:",
		hSpace	: "Vodoravan razmak:",
		vSpace	: "Okomit razmak:",
		alertUrl	: "Molim unesite URL slike",
		linkTab	: "Veza",
		button2Img	: "Želite li pretvoriti izabrani gumb slike u jednostavnu sliku?",
		img2Button	: "Želite li pretvoriti izabranu sliku u gumb slike?",
		urlMissing : "Nedostaje URL izvora slike.",
		validateBorder : "Rub mora biti pozitivan cijeli broj.",
		validateHSpace : "Vodoravni razmak mora biti pozitivan cijeli broj.",
		validateVSpace : "Okomit razmak mora biti pozitivan cijeli broj."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Svojstva fleša",
		propertiesTab	: "Svojstva",
		title		: "Fleš",
		chkPlay		: "Auto pokretanje",
		chkLoop		: "Petlja",
		chkMenu		: "Omogući fleš izbornik",
		chkFull		: "Omogući puni ekran",
 		scale		: "Skala:",
		scaleAll		: "Pokaži sve",
		scaleNoBorder	: "Bez ruba",
		scaleFit		: "Točno se uklapa",
		access			: "Skript pristup:",
		accessAlways	: "Uvijek",
		accessSameDomain	: "Ista domena",
		accessNever	: "Nikad",
		alignAbsBottom: "Abs dno",
		alignAbsMiddle: "Abs sredina",
		alignBaseline	: "Osnovna linija",
		alignTextTop	: "Tekst na vrh",
		quality		: "Kvaliteta:",
		qualityBest	: "Najbolja",
		qualityHigh	: "Visoka",
		qualityAutoHigh	: "Auto visoka",
		qualityMedium	: "Srednja",
		qualityAutoLow	: "Auto niska",
		qualityLow	: "Niska",
		windowModeWindow	: "Prozor",
		windowModeOpaque	: "Neprozirno",
		windowModeTransparent	: "Prozirno",
		windowMode	: "Način prozora:",
		flashvars	: "Varijable:",
		bgcolor	: "Boja pozadine:",
		hSpace	: "Vodoravan razmak:",
		vSpace	: "Okomit razmak:",
		validateSrc : "URL ne smije biti prazan.",
		validateHSpace : "Vodoravni razmak mora biti pozitivan cijeli broj.",
		validateVSpace : "Okomit razmak mora biti pozitivan cijeli broj."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Provjera pravopisa",
		title			: "Provjera pravopisa",
		notAvailable	: "Oprostite, usluga je trenutno nedostupna.",
		errorLoading	: "Došlo je do greške kod učitavanja aplikacijske usluge hosta: %s.",
		notInDic		: "Nije u rječniku",
		changeTo		: "Promijeni na",
		btnIgnore		: "Zanemari",
		btnIgnoreAll	: "Zanemari sve",
		btnReplace		: "Zamijeni",
		btnReplaceAll	: "Zamijeni sve",
		btnUndo			: "Poništi",
		noSuggestions	: "- Nema prijedloga -",
		progress		: "Provjera pravopisa u tijeku...",
		noMispell		: "Provjera pravopisa je završila: nisu nađene pravopisne greške",
		noChanges		: "Provjera pravopisa je završila: riječi nisu promijenjene",
		oneChange		: "Provjera pravopisa je završila: jedna riječ je promijenjena",
		manyChanges		: "Provjera pravopisa je završila: %1 riječi promijenjeno",
		ieSpellDownload	: "Alat za provjeru pravopisa nije instaliran. Želite li ga sada preuzeti?"
	},

	smiley :
	{
		toolbar	: "Umetni emoticone",
		title	: "Emoticoni",
		options : "Opcije emoticona"
	},

	elementsPath :
	{
		eleLabel : "Staza elemenata",
		eleTitle : "%1 element"
	},

	numberedlist : "Lista s brojevima",
	bulletedlist : "Lista s oznakama",
	indent : "Povećaj uvlačenje",
	outdent : "Smanji uvlačenje",

	bidi :
	{
		ltr : "Od lijeva na desno",
		rtl : "Od desna na lijevo",
	},

	justify :
	{
		left : "Poravnaj lijevo",
		center : "Poravnaj u centar",
		right : "Poravnaj desno",
		block : "Poravnaj u bloku"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Zalijepi",
		cutError	: "Sigurnosne postavke vašeg pretražitelja spriječavaju automatsko izrezivanje. Umjesto toga koristite Ctrl+X na tipkovnici.",
		copyError	: "Sigurnosne postavke vašeg pretražitelja spriječavaju automatsko kopiranje. Umjesto toga koristite Ctrl+C na tipkovnici.",
		pasteMsg	: "Pritisnite Ctrl+V (Cmd+V na MAC-u) za lijepljenje.",
		securityMsg	: "Sigurnost vašeg pretražitelja blokira lijepljenje izravno iz memorije isječaka.",
		pasteArea	: "Područje lijepljenja"
	},

	pastefromword :
	{
		confirmCleanup	: "Izgleda da je tekst koji želite zalijepiti kopiran iz Word-a. Želite li ga očistiti prije lijepljenja?",
		toolbar			: "Posebno lijepljenje",
		title			: "Posebno lijepljenje",
		error			: "Zbog interne greške nije bilo moguće očistiti zalijepljene podatke"
	},

	pasteText :
	{
		button	: "Zalijepi kao obični tekst",
		title	: "Lijepljenje kao obični tekst"
	},

	templates :
	{
		button 			: "Predlošci",
		title : "Predlošci sadržaja",
		options : "Opcije predloška",
		insertOption: "Zamijeni stvarne sadržaje",
		selectPromptMsg: "Izaberi predložak za otvaranje u editoru",
		emptyListMsg : "(nema definiranih predložaka)"
	},

	showBlocks : "Pokaži blokove",

	stylesCombo :
	{
		label		: "Stilovi",
		panelTitle 	: "Stilovi",
		panelTitle1	: "Stilovi blokova",
		panelTitle2	: "Umetnuti stilovi",
		panelTitle3	: "Stilovi objekata"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format odlomka",

		tag_p		: "Normalno",
		tag_pre		: "Formatirano",
		tag_address	: "Adresa",
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
		title				: "Kreiranje Div spremnika",
		toolbar				: "Kreiranje Div spremnika",
		cssClassInputLabel	: "Klase listova stila",
		styleSelectLabel	: "Stil",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Šifra jezika",
		inlineStyleInputLabel	: "Umetnuti stil",
		advisoryTitleInputLabel	: "Savjetodavni naslov",
		langDirLabel		: "Smjer teksta",
		langDirLTRLabel		: "Od lijeva na desno",
		langDirRTLLabel		: "Od desna na lijevo",
		edit				: "Uredi Div",
		remove				: "Ukloni Div"
  	},

	iframe :
	{
		title		: "IFrame svojstva",
		toolbar		: "Umetni IFrame",
		noUrl		: "Molim unesite iframe URL",
		scrolling	: "Omogući trake pomicanja",
		border		: "Pokaži rubove okvira"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Ime fonta"
	},

	fontSize :
	{
		label		: "Veličina",
		voiceLabel	: "Veličina fonta",
		panelTitle	: "Veličina fonta"
	},

	colorButton :
	{
		textColorTitle	: "Boja teksta",
		bgColorTitle	: "Boja pozadine",
		panelTitle		: "Boje",
		auto			: "Automatski",
		more			: "Još boja..."
	},

	colors :
	{
		"000" : "Crna",
		"800000" : "Kesten",
		"8B4513" : "Sedlo smeđa",
		"2F4F4F" : "Tamnosiva slate",
		"008080" : "Tirkizna plava",
		"000080" : "Tamno plava",
		"4B0082" : "Indigo",
		"696969" : "Tamno siva",
		"B22222" : "Ciglasto crvena",
		"A52A2A" : "Smeđa",
		"DAA520" : "Zlatni štap",
		"006400" : "Tamno zelena",
		"40E0D0" : "Tirkiz",
		"0000CD" : "Srednje plava",
		"800080" : "Purpurna",
		"808080" : "Siva",
		"F00" : "Crvena",
		"FF8C00" : "Tamno narančasta",
		"FFD700" : "Zlatna",
		"008000" : "Zelena",
		"0FF" : "Cijan",
		"00F" : "Plava",
		"EE82EE" : "Ljubičasta",
		"A9A9A9" : "Mutno siva",
		"FFA07A" : "Losos svijetla",
		"FFA500" : "Narančasta",
		"FFFF00" : "Žuta",
		"00FF00" : "Limeta zelena",
		"AFEEEE" : "Blijedo tirkiz",
		"ADD8E6" : "Svijetlo plava",
		"DDA0DD" : "Tamno ljubičasta",
		"D3D3D3" : "Svijetlo siva",
		"FFF0F5" : "Lavenda rumena",
		"FAEBD7" : "Antički bijela",
		"FFFFE0" : "Svijetlo žuta",
		"F0FFF0" : "Medljikava",
		"F0FFFF" : "Azurno plava",
		"F0F8FF" : "Alice plava",
		"E6E6FA" : "Lavanda",
		"FFF" : "Bijela"
	},

	scayt :
	{
		title			: "Provjera pravopisa kod pisanja",
		opera_title		: "Nije podržano u Operi",
		enable			: "Omogući SCAYT",
		disable			: "Onemogući SCAYT",
		about			: "O SCAYT-u",
		toggle			: "Prebaci SCAYT",
		options			: "Opcije",
		langs			: "Jezici",
		moreSuggestions	: "Još prijedloga",
		ignore			: "Zanemari",
		ignoreAll		: "Zanemari sve",
		addWord			: "Dodaj riječ",
		emptyDic		: "Ime rječnik ne treba biti prazno",

		optionsTab		: "Opcije",
		allCaps			: "Zanemari riječi samo s velikim slovima",
		ignoreDomainNames : "Zanemari imena domena",
		mixedCase		: "Zanemari riječi s miješanom veličinom slova",
		mixedWithDigits	: "Zanemari riječi s brojevima",

		languagesTab	: "Jezici",

		dictionariesTab	: "Rječnici",
		dic_field_name	: "Ime rječnika",
		dic_create		: "Kreiraj",
		dic_restore		: "Vrati",
		dic_delete		: "Izbriši",
		dic_rename		: "Preimenuj",
		dic_info		: "Inicijalno je korisnički rječnik pohranjen u Cookie. Ipak, Cookie su ograničene veličine. Kad korisnički rječnik naraste do točke kad ne može biti spremljen u Cookie, tada rječnik može biti spremljen na naš poslužitelj. Za spremanje vašeg osobnog rječnika na naš poslužitelj, morate navesti ime za vaš rječnik. Ako već imate spremljen rječnik, molim unesite njegovo ime i kliknite gumb Vrati.",

		aboutTab		: "O proizvodu"
	},

	about :
	{
		title		: "O CKEditoru",
		dlgTitle	: "O CKEditoru",
		help	: "Provjerite $1 za pomoć.",
		userGuide : "CKEditor Vodič za korisnike",
		moreInfo	: "Za licencne informacije, molim posjetite naše Web sjedište:",
		copy		: "Copyright &copy; $1. Sva prava pridržana."
	},

	maximize : "Maksimiziraj",
	minimize : "Minimiziraj",

	fakeobjects :
	{
		anchor	: "Sidro",
		flash	: "Fleš animacija",
		iframe		: "IFrame",
		hiddenfield	: "Sakriveno polje",
		unknown	: "Nepoznati objekt"
	},

	resize : "Povuci za promjenu veličine",

	colordialog :
	{
		title		: "Izbor boje",
		options	:	"Opcije boje",
		highlight	: "Istaknuto",
		selected	: "Izabrana boja",
		clear		: "Očisti"
	},

	toolbarCollapse	: "Stisni traku s alatima",
	toolbarExpand	: "Proširi traku s alatima",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Memorija/poništi",
		editing : "Uređivanje",
		forms : "Obrasci",
		basicstyles : "Osnovno stilovi",
		paragraph : "Odlomak",
		links : "Veze",
		insert : "Umetni",
		styles : "Stilovi",
		colors : "Boje",
		tools : "Alati"
	},

	bidi :
	{
		ltr : "Promijeni na tekst lijevo-na-desno",
		rtl : "Promijeni na tekst desno-na-lijevo"
	},

	docprops :
	{
		label : "Svojstva dokumenta",
		title : "Svojstva dokumenta",
		design : "Dizajn",
		meta : "Meta oznake",
		chooseColor : "Izaberi ",
		other : "Drugo...",
		docTitle :	"Naslov stranice",
		charset : 	"Kodiranje skupa stranica",
		charsetOther : "Kodiranje drugog skupa stranica",
		charsetASCII : "ASCII",
		charsetCE : "Srednjoeuropski",
		charsetCT : "Kineski tradicionalni (Big5)",
		charsetCR : "Čirilica",
		charsetGR : "Grčki",
		charsetJP : "Japanski",
		charsetKR : "Korejski",
		charsetTR : "Turski",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Zapadnoeuropski",
		docType : "Naslov tipa dokumenta",
		docTypeOther : "Drugi naslov tipa dokumenta",
		xhtmlDec : "Uključi XHTML deklaracije",
		bgColor : "Boja pozadine",
		bgImage : "URL slike pozadine",
		bgFixed : "Nepomična (fiksna) pozadina",
		txtColor : "Boja teksta",
		margin : "Margine stranice",
		marginTop : "Vrh",
		marginLeft : "Lijevo",
		marginRight : "Desno",
		marginBottom : "Dno",
		metaKeywords : "Ključne riječi indeksiranja dokumenta (odijeljeno zarezom)",
		metaDescription : "Opis dokumenta",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Ovo je neki <strong>uzorak teksta</strong>. Vi koristite <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inči",
			widthCm	: "centimetri",
			widthMm	: "milimetri",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "točke",
			widthPc	: "pike"
		},
		table :
		{
			heightUnit	: "Jedinica visine:",
			insertMultipleRows : "Umetni redove",
			insertMultipleCols : "Umetni stupce",
			noOfRows : "Broj redova:",
			noOfCols : "Broj stupaca:",
			insertPosition : "Pozicija:",
			insertBefore : "Ispred",
			insertAfter : "Iza",
			selectTable : "Izaberi tablicu",
			selectRow : "Izaberi red",
			columnTitle : "Stupac",
			colProps : "Svojstva stupca",
			invalidColumnWidth	: "Širina stupca mora biti pozitivan broj."
		},
		cell :
		{
			title : "Ćelija"
		},
		emoticon :
		{
			angel		: "Anđeo",
			angry		: "Ljuti se",
			cool		: "Cool",
			crying		: "Plače",
			eyebrow		: "Podignuta obrva",
			frown		: "Namršten",
			goofy		: "Šašav",
			grin		: "Cerekav",
			half		: "Prevrtljiv",
			idea		: "Ideja",
			laughing	: "Nasmijan",
			laughroll	: "Kugla se od smijeha",
			no			: "Ne",
			oops		: "Opaa",
			shy			: "Stidljiv",
			smile		: "Smješak",
			tongue		: "Jezik",
			wink		: "Namiguje",
			yes			: "Da"
		},

		menu :
		{
			link	: "Umetni vezu",
			list	: "Lista",
			paste	: "Zalijepi",
			action	: "Akcija",
			align	: "Poravnaj",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Lista s brojevima",
			bulletedTitle		: "Lista s oznakama"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Upiši opisno ime knjiške oznake, kao npr. 'Odjeljak 1.2'. Nakon umetanja knjiške oznake, kliknite ili 'Veza' ili ikonu 'Veza knjiške oznake dokumenta' za povezivanje.",
			title		: "Veza knjiške oznake dokumenta",
			linkTo		: "Povežite na:"
		},

		urllink :
		{
			title : "URL veza",
			linkText : "Tekst veze:",
			selectAnchor: "Izaberite sidro",
			nourl: "Molim unesite URL u polje teksta.",
			urlhelp: "Unesite ili zalijepite URL za otvaranje kad korisnici kliknu vezu, na primjer http://www.example.com.",
			displaytxthelp: "Unesite prikaz teksta za vezu.",
			openinnew : "Otvorite vezu u novom prozoru"
		},

		spellchecker :
		{
			title : "Provjera pravopisa",
			replace : "Zamjena:",
			suggesstion : "Prijedlog:",
			withLabel : "Sa:",
			replaceButton : "Zamijeni",
			replaceallButton:"Zamijeni sve",
			skipButton:"Preskoči",
			skipallButton: "Preskoči sve",
			undochanges: "Poništi promjene",
			complete: "Provjera pravopisa je dovršena",
			problem: "Problem u dohvatu XML podataka",
			addDictionary: "Dodaj u rječnik",
			editDictionary: "Uredi rječnik"
		},

		status :
		{
			keystrokeForHelp: "Pritisni ALT 0 za pomoć"
		},

		linkdialog :
		{
			label : "Dijalog veze"
		},

		image :
		{
			previewText : "Tekst će teći oko slike koju dodajete kao u ovom primjeru."
		}
	}

};
