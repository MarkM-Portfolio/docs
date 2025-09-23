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
	editorTitle : "Rich text-editor, %1.",

	// ARIA descriptions.
	toolbars	: "Editor-værktøjslinjer",
	editor	: "Rich Text-editor",

	// Toolbar buttons without dialogs.
	source			: "Kilde",
	newPage			: "Ny side",
	save			: "Gem",
	preview			: "Eksempel:",
	cut				: "Klip",
	copy			: "Kopiér",
	paste			: "Sæt ind",
	print			: "Udskriv",
	underline		: "Understreget",
	bold			: "Fed",
	italic			: "Kursiv",
	selectAll		: "Markér alle",
	removeFormat	: "Fjern format",
	strike			: "Gennemstreget",
	subscript		: "Sænket skrift",
	superscript		: "Hævet skrift",
	horizontalrule	: "Indsæt vandret streg",
	pagebreak		: "Indsæt sideskift",
	pagebreakAlt		: "Sideskift",
	unlink			: "Fjern link",
	undo			: "Fortryd",
	redo			: "Annullér Fortryd",

	// Common messages and labels.
	common :
	{
		browseServer	: "Browserserver:",
		url				: "URL:",
		protocol		: "Protokol:",
		upload			: "Upload:",
		uploadSubmit	: "Send det til serveren",
		image			: "Indsæt billede",
		flash			: "Indsæt flash-film",
		form			: "Indsæt formular",
		checkbox		: "Indsæt afkrydsningsfelt",
		radio			: "Indsæt alternativknap",
		textField		: "Indsæt tekstfelt",
		textarea		: "Indsæt tekstområde",
		hiddenField		: "Indsæt skjult felt",
		button			: "Indsæt knap",
		select			: "Indsæt valgfelt",
		imageButton		: "Indsæt billedknap",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Navn:",
		langDir			: "Tekstretning",
		langDirLtr		: "Venstre til højre",
		langDirRtl		: "Højre til venstre",
		langCode		: "Sprogkode",
		longDescr		: "URL til lang beskrivelse",
		cssClass		: "Typografiarkklasser:",
		advisoryTitle	: "Hjælpetitel:",
		cssStyle		: "Typografi:",
		ok				: "OK",
		cancel			: "Annullér",
		close : "Luk",
		preview			: "Eksempel:",
		generalTab		: "Generelt",
		advancedTab		: "Avanceret",
		validateNumberFailed	: "Værdien er ikke et tal.",
		confirmNewPage	: "Eventuelle ændringer af indholdet, som ikke er gemt, går tabt. Er du sikker på, at du vil indlæse en ny side?",
		confirmCancel	: "Nogle af indstillingerne er ændret. Er du sikker på, at du vil lukke dialogboksen?",
		options : "Indstillinger",
		target			: "Mål:",
		targetNew		: "Nyt vindue (_blank)",
		targetTop		: "Øverste vindue (_top)",
		targetSelf		: "Samme vindue (_self)",
		targetParent	: "Overordnet vindue (_parent)",
		langDirLTR		: "Venstre til højre",
		langDirRTL		: "Højre til venstre",
		styles			: "Typografi:",
		cssClasses		: "Typografiarkklasser:",
		width			: "Bredde:",
		height			: "Højde:",
		align			: "Justér:",
		alignLeft		: "Venstre",
		alignRight		: "Højre",
		alignCenter		: "Centreret",
		alignTop		: "Top",
		alignMiddle		: "Midt",
		alignBottom		: "Bund",
		invalidHeight	: "Højde skal være et positivt helt tal.",
		invalidWidth	: "Bredden skal være et positivt helt tal.",
		invalidCssLength	: "Den værdi, der er angivet for feltet '%1', skal være et positivt tal med eller uden en gyldig CSS-måleenhed (px, %, in, cm, mm, em, ex, pt eller pc).",
		invalidHtmlLength	: "Den værdi, der er angivet for feltet '%1', skal være et positivt tal med eller uden en gyldig HTML-måleenhed (px eller %).",
		invalidInlineStyle	: "Den værdi, der er angivet for den indbyggede typografi, skal bestå af flere tupler med formatet  \"navn : værdi\", adskilt af semikolonner.",
		cssLengthTooltip	: "Angiv et tal for en værdi i pixel eller et tal med en gyldig CSS-enhed (px, %, in, cm, mm, em, ex, pt eller pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, ikke tilgængelig</span>"
	},

	contextmenu :
	{
		options : "Tilpasning af kontekstmenu"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Indsæt specialtegn",
		title		: "Specialtegn",
		options : "Tilpasning af specialtegn"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL-link",
		other 		: "<other>",
		menu		: "Redigér link...",
		title		: "Link",
		info		: "Linkoplysninger",
		target		: "Mål",
		upload		: "Upload:",
		advanced	: "Avanceret",
		type		: "Link-type:",
		toUrl		: "URL",
		toAnchor	: "Link til anker i teksten",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Navn på målramme:",
		targetPopupName	: "Navn på pop op-vindue",
		popupFeatures	: "Funktioner i pop op-vindue:",
		popupResizable	: "Størrelse kan tilpasses",
		popupStatusBar	: "Statuslinje",
		popupLocationBar	: "Placeringslinje",
		popupToolbar	: "Værktøjslinje",
		popupMenuBar	: "Menulinje",
		popupFullScreen	: "Fuld skærm (IE)",
		popupScrollBars	: "Rullepaneler",
		popupDependent	: "Afhængig (Netscape)",
		popupLeft		: "Venstre position",
		popupTop		: "Øverste position",
		id				: "Id:",
		langDir			: "Tekstretning",
		langDirLTR		: "Venstre til højre",
		langDirRTL		: "Højre til venstre",
		acccessKey		: "Adgangstast:",
		name			: "Navn:",
		langCode		: "Sprogkode:",
		tabIndex		: "Faneindeks:",
		advisoryTitle	: "Hjælpetitel:",
		advisoryContentType	: "Hjælpeindholdets type:",
		cssClasses		: "Typografiarkklasser:",
		charset			: "Tegnsæt for linket ressource:",
		styles			: "Typografi:",
		rel			: "Relation",
		selectAnchor	: "Vælg et anker",
		anchorName		: "Efter ankernavn",
		anchorId		: "Efter element-id",
		emailAddress	: "E-mail-adresse",
		emailSubject	: "Beskedemne",
		emailBody		: "Beskedindhold",
		noAnchors		: "Ingen tilgængelige bogmærker i dokumentet. Klik på ikonen 'Indsæt dokumentbogmærke' på værktøjslinjen for at tilføje et.",
		noUrl			: "Skriv URL til linket",
		noEmail			: "Skriv e-mailadressen"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Indsæt dokumentbogmærke",
		menu		: "Redigér dokumentbogmærke",
		title		: "Dokumentbogmærke",
		name		: "Navn:",
		errorName	: "Angiv et navn på dokumentbogmærket",
		remove		: "Fjern dokumentbogmærke"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Egenskaber for nummereret liste",
		bulletedTitle		: "Egenskaber for punktliste",
		type				: "Type",
		start				: "Start",
		validateStartNumber				:"Listens startnummer skal være et helt tal.",
		circle				: "Cirkel",
		disc				: "Skive",
		square				: "Firkant",
		none				: "Ingen",
		notset				: "<not set>",
		armenian			: "Armensk nummerering",
		georgian			: "Georgiansk nummerering (an, ban, gan, etc.)",
		lowerRoman			: "Små romertal (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Store romertal (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Små bogstaver (a, b, c, d, e, etc.)",
		upperAlpha			: "Store bogstaver (A, B, C, D, E, etc.)",
		lowerGreek			: "Små græske bogstaver (alpha, beta, gamma, etc.)",
		decimal				: "Decimaler (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimaler med foranstillet nul (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Søg og erstat",
		find				: "Søg",
		replace				: "Erstat",
		findWhat			: "Søg efter:",
		replaceWith			: "Erstat med:",
		notFoundMsg			: "Den angivne tekst er ikke fundet.",
		noFindVal			: 'Tekst, der skal findes, er påkrævet.',
		findOptions			: "Søgeindstillinger",
		matchCase			: "Store/små bogstaver",
		matchWord			: "Find hele forekomster af ord",
		matchCyclic			: "Genstart søgning fra start af dokument",
		replaceAll			: "Erstat alle",
		replaceSuccessMsg	: "%1 forekomst(er) erstattet."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Indsæt tabel",
		title		: "Tabel",
		menu		: "Tabelegenskaber",
		deleteTable	: "Slet tabel",
		rows		: "Rækker:",
		columns		: "Kolonner:",
		border		: "Kantstørrelse:",
		widthPx		: "pixel",
		widthPc		: "procent",
		widthUnit	: "Breddeenhed:",
		cellSpace	: "Celleafstand:",
		cellPad		: "Celleudfyldning:",
		caption		: "Billedtekst:",
		summary		: "Resumé:",
		headers		: "Overskrifter:",
		headersNone		: "Ingen",
		headersColumn	: "Første kolonne",
		headersRow		: "Første række",
		headersBoth		: "Begge",
		invalidRows		: "Antallet af rækker skal være et helt tal, der er større end nul.",
		invalidCols		: "Antallet af kolonner skal være et helt tal, der er større end nul.",
		invalidBorder	: "Kantstørrelsen skal være et positivt tal.",
		invalidWidth	: "Tabelbredden skal være et positivt tal.",
		invalidHeight	: "Tabelhøjden skal være et positivt tal.",
		invalidCellSpacing	: "Celleafstanden skal være et positivt tal.",
		invalidCellPadding	: "Celleudfyldningen skal være et positivt tal.",

		cell :
		{
			menu			: "Celle",
			insertBefore	: "Indsæt celle før",
			insertAfter		: "Indsæt celle efter",
			deleteCell		: "Slet celler",
			merge			: "Flet celler",
			mergeRight		: "Flet til højre",
			mergeDown		: "Flet nedad",
			splitHorizontal	: "Opdel celle vandret",
			splitVertical	: "Opdel celle lodret",
			title			: "Celleegenskaber",
			cellType		: "Celletype:",
			rowSpan			: "Rækkespænd:",
			colSpan			: "Kolonnespænd:",
			wordWrap		: "Tekstombrydning:",
			hAlign			: "Vandret justering:",
			vAlign			: "Lodret justering:",
			alignBaseline	: "Grundlinje",
			bgColor			: "Baggrundsfarve:",
			borderColor		: "Kantfarve:",
			data			: "Data",
			header			: "Overskrift",
			yes				: "Ja",
			no				: "Nej",
			invalidWidth	: "Cellebredden skal være et positivt tal.",
			invalidHeight	: "Cellehøjden skal være et positivt tal.",
			invalidRowSpan	: "Rækkespænd skal være et positivt helt tal.",
			invalidColSpan	: "Kolonnespænd skal være et positivt helt tal.",
			chooseColor : "Vælg"
		},

		row :
		{
			menu			: "Række",
			insertBefore	: "Indsæt række før",
			insertAfter		: "Indsæt række efter",
			deleteRow		: "Slet rækker"
		},

		column :
		{
			menu			: "Kolonne",
			insertBefore	: "Indsæt kolonne før",
			insertAfter		: "Indsæt kolonne efter",
			deleteColumn	: "Slet kolonner"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Knapegenskaber",
		text		: "Tekst (værdi):",
		type		: "Type:",
		typeBtn		: "Knap",
		typeSbm		: "Afsend",
		typeRst		: "Nulstil"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Egenskaber for afkrydsningsfelt",
		radioTitle	: "Egenskaber for alternativknap",
		value		: "Værdi:",
		selected	: "Valgt"
	},

	// Form Dialog.
	form :
	{
		title		: "Indsæt formular",
		menu		: "Egenskaber for formular",
		action		: "Handling:",
		method		: "Metode:",
		encoding	: "Kodning:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Vælg feltegenskaber",
		selectInfo	: "Vælg oplysninger",
		opAvail		: "Tilgængelige indstillinger",
		value		: "Værdi:",
		size		: "Størrelse:",
		lines		: "linjer",
		chkMulti	: "Tillad flere valg",
		opText		: "Tekst:",
		opValue		: "Værdi:",
		btnAdd		: "Tilføj",
		btnModify	: "Revidér",
		btnUp		: "Op",
		btnDown		: "Ned",
		btnSetValue : "Angiv som valgt værdi",
		btnDelete	: "Slet"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Egenskaber for tekstområde",
		cols		: "Kolonner:",
		rows		: "Rækker:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Egenskaber for tekstfelt",
		name		: "Navn:",
		value		: "Værdi:",
		charWidth	: "Tegnbredde:",
		maxChars	: "Maksimalt antal tegn:",
		type		: "Type:",
		typeText	: "Tekst",
		typePass	: "Adgangskode"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Egenskaber for skjult felt",
		name	: "Navn:",
		value	: "Værdi:"
	},

	// Image Dialog.
	image :
	{
		title		: "Billede",
		titleButton	: "Egenskaber for billedknap",
		menu		: "Billedegenskaber...",
		infoTab	: "Billedoplysninger",
		btnUpload	: "Send det til serveren",
		upload	: "Upload",
		alt		: "Alternativ tekst:",
		lockRatio	: "Lås højde-breddeforhold",
		resetSize	: "Nulstil størrelse",
		border	: "Kant:",
		hSpace	: "Vandret plads:",
		vSpace	: "Lodret plads:",
		alertUrl	: "Skriv URL til billede",
		linkTab	: "Link",
		button2Img	: "Vil du omdanne den valgte billedknap til et simpelt billede?",
		img2Button	: "Vil du omdanne det valgte billede til en billedknap?",
		urlMissing : "URL til billede mangler.",
		validateBorder : "Kant skal være et positivt helt tal.",
		validateHSpace : "Vandret plads skal være et positivt helt tal.",
		validateVSpace : "Lodret plads skal være et positivt helt tal."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash-egenskaber",
		propertiesTab	: "Egenskaber",
		title		: "Flash",
		chkPlay		: "Afspil automatisk",
		chkLoop		: "Løkke",
		chkMenu		: "Aktivér flash-menu",
		chkFull		: "Tillad fuldskærm",
 		scale		: "Skalering:",
		scaleAll		: "Vis alle",
		scaleNoBorder	: "Ingen kant",
		scaleFit		: "Tilpas nøjagtigt",
		access			: "Scriptadgang:",
		accessAlways	: "Altid",
		accessSameDomain	: "Samme domæne",
		accessNever	: "Aldrig",
		alignAbsBottom: "Abs bund",
		alignAbsMiddle: "Abs midt",
		alignBaseline	: "Grundlinje",
		alignTextTop	: "Tekst, top",
		quality		: "Kvalitet",
		qualityBest	: "Bedst",
		qualityHigh	: "Høj",
		qualityAutoHigh	: "Automatisk høj",
		qualityMedium	: "Medium",
		qualityAutoLow	: "Automatisk lav",
		qualityLow	: "Lav",
		windowModeWindow	: "Vindue",
		windowModeOpaque	: "Uigennemsigtig",
		windowModeTransparent	: "Gennemsigtig",
		windowMode	: "Vinduestilstand",
		flashvars	: "Variabler:",
		bgcolor	: "Baggrundsfarve:",
		hSpace	: "Vandret plads:",
		vSpace	: "Lodret plads:",
		validateSrc : "URL må ikke være tom.",
		validateHSpace : "Vandret plads skal være et positivt helt tal.",
		validateVSpace : "Lodret plads skal være et positivt helt tal."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Stavekontrol",
		title			: "Stavekontrol",
		notAvailable	: "Servicen er desværre ikke tilgængelig i øjeblikket.",
		errorLoading	: "Fejl under indlæsning af vært for programservice: %s.",
		notInDic		: "Ikke i ordbog",
		changeTo		: "Ret til",
		btnIgnore		: "Ignorér",
		btnIgnoreAll	: "Ignorér alle",
		btnReplace		: "Erstat",
		btnReplaceAll	: "Erstat alle",
		btnUndo			: "Fortryd",
		noSuggestions	: "- Ingen forslag -",
		progress		: "Stavekontrol er i gang...",
		noMispell		: "Stavekontrol er udført: Der er ikke fundet nogen stavefejl",
		noChanges		: "Stavekontrol er udført: Der er ikke ændret nogen ord",
		oneChange		: "Stavekontrol er udført: Et ord er ændret",
		manyChanges		: "Stavekontrol er udført: % ord er ændret",
		ieSpellDownload	: "Stavekontrol er ikke installeret. Vil du downloade den nu?"
	},

	smiley :
	{
		toolbar	: "Indsæt humørikon",
		title	: "Humørikoner",
		options : "Tilpasning af humørikon"
	},

	elementsPath :
	{
		eleLabel : "Elementsti",
		eleTitle : "%1-element"
	},

	numberedlist : "Nummereret liste",
	bulletedlist : "Punktliste",
	indent : "Forøg indrykning",
	outdent : "Formindsk indrykning",

	bidi :
	{
		ltr : "Venstre til højre",
		rtl : "Højre til venstre",
	},

	justify :
	{
		left : "Venstrejusteret",
		center : "Centreret",
		right : "Højrejusteret",
		block : "Lige margener"
	},

	blockquote : "Citat",

	clipboard :
	{
		title		: "Sæt ind",
		cutError	: "Sikkerhedsindstillingerne i din browser forhindrer automatisk klipning. Brug Ctrl+X på tastaturet i stedet for.",
		copyError	: "Sikkerhedsindstillingerne i din browser forhindrer automatisk kopiering. Brug Ctrl+C på tastaturet i stedet.",
		pasteMsg	: "Tryk på Ctrl+V (Kommando+V på Mac) for at indsætte nedenfor.",
		securityMsg	: "Din browsers sikkerhedsindstillinger blokerer for direkte indsætning fra udklipsholderen.",
		pasteArea	: "Indsætningsområde"
	},

	pastefromword :
	{
		confirmCleanup	: "Teksten, du ønsker at indsætte, synes at være kopieret fra Word. Vil du rense den, før du sætter ind?",
		toolbar			: "Indsæt speciel",
		title			: "Indsæt speciel",
		error			: "Det er ikke muligt at rense de indsatte data pga. en intern fejl"
	},

	pasteText :
	{
		button	: "Sæt ind som almindelig tekst",
		title	: "Sæt ind som almindelig tekst"
	},

	templates :
	{
		button 			: "Skabeloner",
		title : "Indholdsskabeloner",
		options : "Skabelonindstillinger",
		insertOption: "Erstat faktisk indhold",
		selectPromptMsg: "Vælg den skabelon, der skal åbnes i editoren",
		emptyListMsg : "(Der er ikke defineret nogen skabeloner)"
	},

	showBlocks : "Vis blokke",

	stylesCombo :
	{
		label		: "Typografier",
		panelTitle 	: "Typografier",
		panelTitle1	: "Bloktypografier",
		panelTitle2	: "Indbyggede typografier",
		panelTitle3	: "Objekttypografier"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Afsnitsformat",

		tag_p		: "Normal",
		tag_pre		: "Formateret",
		tag_address	: "Adresse",
		tag_h1		: "Overskrift 1",
		tag_h2		: "Overskrift 2",
		tag_h3		: "Overskrift 3",
		tag_h4		: "Overskrift 4",
		tag_h5		: "Overskrift 5",
		tag_h6		: "Overskrift 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Opret DIV-opbevaringssted",
		toolbar				: "Opret DIV-opbevaringssted",
		cssClassInputLabel	: "Typografiarkklasser",
		styleSelectLabel	: "Typografi",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Sprogkode",
		inlineStyleInputLabel	: "Indbygget typografi",
		advisoryTitleInputLabel	: "Hjælpetitel",
		langDirLabel		: "Tekstretning",
		langDirLTRLabel		: "Venstre til højre",
		langDirRTLLabel		: "Højre til venstre",
		edit				: "Redigér DIV",
		remove				: "Fjern DIV"
  	},

	iframe :
	{
		title		: "IFrame-egenskaber",
		toolbar		: "Indsæt IFrame",
		noUrl		: "Skriv iframe-URL",
		scrolling	: "Aktivér rullepaneler",
		border		: "Vis rammekant"
	},

	font :
	{
		label		: "Skrifttype",
		voiceLabel	: "Skrifttype",
		panelTitle	: "Skriftnavn"
	},

	fontSize :
	{
		label		: "Størrelse",
		voiceLabel	: "Skriftstørrelse",
		panelTitle	: "Skriftstørrelse"
	},

	colorButton :
	{
		textColorTitle	: "Tekstfarve",
		bgColorTitle	: "Baggrundsfarve",
		panelTitle		: "Farver",
		auto			: "Automatisk",
		more			: "Flere farver..."
	},

	colors :
	{
		"000" : "Sort",
		"800000" : "Rødbrun",
		"8B4513" : "Saddelbrun",
		"2F4F4F" : "Mørk skifergrå",
		"008080" : "Blågrøn",
		"000080" : "Marineblå",
		"4B0082" : "Indigo",
		"696969" : "Mørkegrå",
		"B22222" : "Chamottesten",
		"A52A2A" : "Brun",
		"DAA520" : "Gyldenris",
		"006400" : "Mørkegrøn",
		"40E0D0" : "Turkis",
		"0000CD" : "Mellemblå",
		"800080" : "Lilla",
		"808080" : "Grå",
		"F00" : "Rød",
		"FF8C00" : "Mørk orange",
		"FFD700" : "Guld",
		"008000" : "Grøn",
		"0FF" : "Cyan",
		"00F" : "Blå",
		"EE82EE" : "Violet",
		"A9A9A9" : "Svag grå",
		"FFA07A" : "Lys laksefarvet",
		"FFA500" : "Orange",
		"FFFF00" : "Gul",
		"00FF00" : "Lime",
		"AFEEEE" : "Bleg turkis",
		"ADD8E6" : "Lyseblå",
		"DDA0DD" : "Blomme",
		"D3D3D3" : "Lysegrå",
		"FFF0F5" : "Lavendelrød",
		"FAEBD7" : "Antikhvid",
		"FFFFE0" : "Lysegul",
		"F0FFF0" : "Honningdug",
		"F0FFFF" : "Azurblå",
		"F0F8FF" : "Babyblå",
		"E6E6FA" : "Lysviolet",
		"FFF" : "Hvid"
	},

	scayt :
	{
		title			: "Stavekontrol under indtastning (SCAYT)",
		opera_title		: "Understøttes ikke af Opera",
		enable			: "Aktivér SCAYT",
		disable			: "Deaktivér SCAYT",
		about			: "Om SCAYT",
		toggle			: "Aktivér/deaktivér SCAYT",
		options			: "Indstillinger",
		langs			: "Sprog",
		moreSuggestions	: "Flere forslag",
		ignore			: "Ignorér",
		ignoreAll		: "Ignorér alle",
		addWord			: "Tilføj ord",
		emptyDic		: "Ordbogsnavnet må ikke være tomt.",

		optionsTab		: "Indstillinger",
		allCaps			: "Ignorér ord med udelukkende store bogstaver",
		ignoreDomainNames : "Ignorér domænenavne",
		mixedCase		: "Ignorér ord med blandet store/små bogstaver",
		mixedWithDigits	: "Ignorér ord med tal",

		languagesTab	: "Sprog",

		dictionariesTab	: "Ordbøger",
		dic_field_name	: "Navn på ordbog",
		dic_create		: "Opret",
		dic_restore		: "Gendan",
		dic_delete		: "Slet",
		dic_rename		: "Omdøb",
		dic_info		: "Først gemmes brugerordbogen i en cookie. Men cookies har en begrænset størrelse. Når brugerordbogen vokser sig så stor, at den ikke kan gemmes i en cookie, kan den gemmes på serveren. Hvis du skal gemme din personlige ordbog på serveren, skal du angive et navn på ordbogen. Hvis du allerede har en gemt ordbog, skal du skrive dens navn og klikke på knappen Gendan.",

		aboutTab		: "Om"
	},

	about :
	{
		title		: "Om CKEditor",
		dlgTitle	: "Om CKEditor",
		help	: "Der er hjælp i $1.",
		userGuide : "CKEditor User's Guide",
		moreInfo	: "Besøg vores websted for at få oplysninger om licens:",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "Maksimér",
	minimize : "Minimér",

	fakeobjects :
	{
		anchor	: "Anker",
		flash	: "Flashanimation",
		iframe		: "IFrame",
		hiddenfield	: "Skjult felt",
		unknown	: "Ukendt objekt"
	},

	resize : "Træk for at ændre størrelse",

	colordialog :
	{
		title		: "Vælg farve",
		options	:	"Farveindstillinger",
		highlight	: "Fremhæv",
		selected	: "Valgt farve",
		clear		: "Ryd"
	},

	toolbarCollapse	: "Skjul værktøjslinje",
	toolbarExpand	: "Udvid værktøjslinje",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Udklipsholder/Fortryd",
		editing : "Redigerer",
		forms : "Formularer",
		basicstyles : "Basistypografier",
		paragraph : "Afsnit",
		links : "Link",
		insert : "Indsæt",
		styles : "Typografier",
		colors : "Farver",
		tools : "Værktøjer"
	},

	bidi :
	{
		ltr : "Skift til Venstre til højre-tekst",
		rtl : "Skift til Højre til venstre-tekst"
	},

	docprops :
	{
		label : "Dokumentegenskaber",
		title : "Dokumentegenskaber",
		design : "Design",
		meta : "Metatags",
		chooseColor : "Vælg",
		other : "Andet...",
		docTitle :	"Sidetitel",
		charset : 	"Tegnsætkodning",
		charsetOther : "Anden tegnsætkodning",
		charsetASCII : "ASCII",
		charsetCE : "Centraleuropæisk",
		charsetCT : "Uforkortet kinesisk (Big5)",
		charsetCR : "Kyrillisk",
		charsetGR : "Græsk",
		charsetJP : "Japansk",
		charsetKR : "Koreansk",
		charsetTR : "Tyrkisk",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Vesteuropæisk",
		docType : "Dokumenttypeoverskrift",
		docTypeOther : "Anden dokumenttypeoverskrift",
		xhtmlDec : "Inkludér XHTML-erklæringer",
		bgColor : "Baggrundsfarve",
		bgImage : "Baggrundsbilled-URL",
		bgFixed : "Ikke-rullende (fast) baggrund",
		txtColor : "Tekstfarve",
		margin : "Sidemarginer",
		marginTop : "Top",
		marginLeft : "Venstre",
		marginRight : "Højre",
		marginBottom : "Bund",
		metaKeywords : "Dokumentindekseringsnøgleord (kommasepareret)",
		metaDescription : "Dokumentbeskrivelse",
		metaAuthor : "Forfatter",
		metaCopyright : "Copyright",
		previewHtml : "<p>Dette er <strong>eksempeltekst</strong>. Du benytter <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "tommer",
			widthCm	: "centimeter",
			widthMm	: "millimeter",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "point",
			widthPc	: "pica"
		},
		table :
		{
			heightUnit	: "Højdeenhed:",
			insertMultipleRows : "Indsæt rækker",
			insertMultipleCols : "Indsæt kolonner",
			noOfRows : "Antal rækker:",
			noOfCols : "Antal kolonner:",
			insertPosition : "Position:",
			insertBefore : "Før",
			insertAfter : "Efter",
			selectTable : "Markér tabel",
			selectRow : "Markér række",
			columnTitle : "Kolonne",
			colProps : "Kolonneegenskaber",
			invalidColumnWidth	: "Kolonnebredden skal være et positivt tal."
		},
		cell :
		{
			title : "Celle"
		},
		emoticon :
		{
			angel		: "Engel",
			angry		: "Vred",
			cool		: "Sej",
			crying		: "Græder",
			eyebrow		: "Øjenbryn",
			frown		: "Rynker panden",
			goofy		: "Skør",
			grin		: "Grin",
			half		: "Halv",
			idea		: "Idé",
			laughing	: "Ler",
			laughroll	: "Ler og ruller",
			no			: "Nej",
			oops		: "Ups",
			shy			: "Genert",
			smile		: "Smil",
			tongue		: "Tungen ud",
			wink		: "Blink",
			yes			: "Ja"
		},

		menu :
		{
			link	: "Indsæt link",
			list	: "Liste",
			paste	: "Sæt ind",
			action	: "Handling",
			align	: "Justér",
			emoticon: "Humørikon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Nummereret liste",
			bulletedTitle		: "Punktliste"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Skriv et beskrivende bogmærkenavn, f.eks. 'Afsnit 1.2'. Når du har indsat bogmærket, kan du enten klikke på ikonen 'Link' eller 'Dokumentbogmærkelink' for at oprette forbindelse til det.",
			title		: "Dokumentbogmærkelink",
			linkTo		: "Link til:"
		},

		urllink :
		{
			title : "URL-link",
			linkText : "Linktekst:",
			selectAnchor: "Vælg et anker:",
			nourl: "Angiv en URL i tekstfeltet.",
			urlhelp: "Skriv eller indsæt en URL, der skal åbnes, når brugerne klikker på dette link, f.eks. http://www.example.com.",
			displaytxthelp: "Skriv tekst, der skal vises for linket.",
			openinnew : "Åbn link i nyt vindue"
		},

		spellchecker :
		{
			title : "Kontrollér stavning",
			replace : "Erstat:",
			suggesstion : "Forslag:",
			withLabel : "Med:",
			replaceButton : "Erstat",
			replaceallButton:"Erstat alle",
			skipButton:"Spring over",
			skipallButton: "Spring alle over",
			undochanges: "Fortryd ændringer",
			complete: "Stavekontrollen er udført",
			problem: "Problem under hentning af XML-data",
			addDictionary: "Tilføj til ordbog",
			editDictionary: "Redigér ordbog"
		},

		status :
		{
			keystrokeForHelp: "Tryk på ALT 0 for at få hjælp"
		},

		linkdialog :
		{
			label : "Linkdialog"
		},

		image :
		{
			previewText : "Teksten bliver ombrudt omkring det billede, du tilføjer, som i dette eksempel."
		}
	}

};
