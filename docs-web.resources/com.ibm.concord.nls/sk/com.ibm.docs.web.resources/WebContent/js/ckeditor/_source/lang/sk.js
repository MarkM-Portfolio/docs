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
	editorTitle : "Editor formátovaného textu, %1.",

	// ARIA descriptions.
	toolbars	: "Lišty nástrojov editora",
	editor	: "Editor formátovaného textu",

	// Toolbar buttons without dialogs.
	source			: "Zdroj",
	newPage			: "Nová stránka",
	save			: "Uložiť",
	preview			: "Náhľad:",
	cut				: "Vystrihnúť",
	copy			: "Kopírovať",
	paste			: "Prilepiť",
	print			: "Tlačiť",
	underline		: "Podčiarknutie",
	bold			: "Tučné písmo",
	italic			: "Kurzíva",
	selectAll		: "Vybrať všetko",
	removeFormat	: "Odstrániť formátovanie",
	strike			: "Prečiarknutie",
	subscript		: "Dolný index",
	superscript		: "Horný index",
	horizontalrule	: "Vložiť vodorovnú čiaru",
	pagebreak		: "Vložiť oddeľovač stránky",
	pagebreakAlt		: "Oddeľovač stránky",
	unlink			: "Odstrániť odkaz",
	undo			: "Vrátiť späť",
	redo			: "Znova vykonať",

	// Common messages and labels.
	common :
	{
		browseServer	: "Server prehliadača:",
		url				: "Adresa URL:",
		protocol		: "Protokol:",
		upload			: "Odoslať:",
		uploadSubmit	: "Odoslať na server",
		image			: "Vložiť obrázok",
		flash			: "Vložiť video vo formáte Flash",
		form			: "Vložiť formulár",
		checkbox		: "Vložiť začiarkavacie políčko",
		radio			: "Vložiť prepínač",
		textField		: "Vložiť textové pole",
		textarea		: "Vložiť textovú oblasť",
		hiddenField		: "Vložiť skryté pole",
		button			: "Vložiť tlačidlo",
		select			: "Vložiť výberové pole",
		imageButton		: "Vložiť obrázkové tlačidlo",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Názov:",
		langDir			: "Smer textu:",
		langDirLtr		: "Zľava doprava",
		langDirRtl		: "Sprava doľava",
		langCode		: "Kód jazyka:",
		longDescr		: "Adresa URL s podrobným opisom:",
		cssClass		: "Triedy hárka štýlov:",
		advisoryTitle	: "Pomocný nadpis:",
		cssStyle		: "Štýl:",
		ok				: "OK",
		cancel			: "Zrušiť",
		close : "Zatvoriť",
		preview			: "Náhľad:",
		generalTab		: "Všeobecné",
		advancedTab		: "Rozšírené",
		validateNumberFailed	: "Táto hodnota nie je číslo.",
		confirmNewPage	: "Všetky neuložené zmeny v tomto obsahu sa stratia. Naozaj chcete načítať novú stránku?",
		confirmCancel	: "Niektoré z volieb sa zmenili. Naozaj chcete zatvoriť dialógové okno?",
		options : "Možnosti",
		target			: "Cieľ:",
		targetNew		: "Nové okno (_blank)",
		targetTop		: "Okno najvyššej úrovne (_top)",
		targetSelf		: "Rovnaké okno (_self)",
		targetParent	: "Rodičovské okno (_parent)",
		langDirLTR		: "Zľava doprava",
		langDirRTL		: "Sprava doľava",
		styles			: "Štýl:",
		cssClasses		: "Triedy hárka štýlov:",
		width			: "Šírka:",
		height			: "Výška:",
		align			: "Zarovnať:",
		alignLeft		: "Vľavo",
		alignRight		: "Vpravo",
		alignCenter		: "Na stred",
		alignTop		: "Vrch",
		alignMiddle		: "Na stred",
		alignBottom		: "Spodok",
		invalidHeight	: "Výška musí byť celé kladné číslo.",
		invalidWidth	: "Šírka musí byť celé kladné číslo.",
		invalidCssLength	: "Hodnota zadané pre pole '%1' musí byť kladné číslo a môže a nemusí obsahovať platnú mernú jednotku CSS (px, %, in, cm, mm, em, ex, pt alebo pc).",
		invalidHtmlLength	: "Hodnota zadané pre pole '%1' musí byť kladné číslo a môže a nemusí obsahovať platnú mernú jednotku HTML (px alebo %).",
		invalidInlineStyle	: "Hodnota zadaná pre inline štýl musí obsahovať jeden alebo viacero zoznamov vo formáte \"názov : hodnota\", ktoré sú oddelené bodkočiarkami.",
		cssLengthTooltip	: "Zadajte číslo pre hodnotu v pixloch alebo číslo s platnou jednotkou CSS (px, %, in, cm, mm, em, ex, pt alebo pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, nedostupné</span>"
	},

	contextmenu :
	{
		options : "Možnosti kontextovej ponuky"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Vložiť špeciálny znak",
		title		: "Špeciálny znak",
		options : "Možnosti špeciálneho znaku"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Odkaz s adresou URL",
		other 		: "<other>",
		menu		: "Upraviť odkaz...",
		title		: "Odkaz",
		info		: "Informácie o odkaze",
		target		: "Cieľ",
		upload		: "Odoslať:",
		advanced	: "Rozšírené",
		type		: "Typ odkazu:",
		toUrl		: "Adresa URL",
		toAnchor	: "Odkaz na kotvu v tomto texte",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Názov cieľového rámca:",
		targetPopupName	: "Názov kontextového okna:",
		popupFeatures	: "Vlastnosti kontextového okna:",
		popupResizable	: "Možnosť meniť veľkosť",
		popupStatusBar	: "Stavová lišta",
		popupLocationBar	: "Panel umiestnenia",
		popupToolbar	: "Lišta nástrojov",
		popupMenuBar	: "Ponuková lišta",
		popupFullScreen	: "Celá obrazovka (IE)",
		popupScrollBars	: "Posuvné lišty",
		popupDependent	: "Závislosť (Netscape)",
		popupLeft		: "Ľavý okraj",
		popupTop		: "Horný okraj",
		id				: "ID:",
		langDir			: "Smer textu:",
		langDirLTR		: "Zľava doprava",
		langDirRTL		: "Sprava doľava",
		acccessKey		: "Prístupový kláves:",
		name			: "Názov:",
		langCode		: "Kód jazyka:",
		tabIndex		: "Poradie elementu:",
		advisoryTitle	: "Pomocný nadpis:",
		advisoryContentType	: "Typ pomocného obsahu:",
		cssClasses		: "Triedy hárka štýlov:",
		charset			: "Množina znakov prepojeného prostriedku:",
		styles			: "Štýl:",
		rel			: "Vzťah",
		selectAnchor	: "Vyberte kotvu",
		anchorName		: "Podľa názvu kotvy",
		anchorId		: "Podľa ID elementu",
		emailAddress	: "E-mailová adresa",
		emailSubject	: "Predmet správy",
		emailBody		: "Telo správy",
		noAnchors		: "V dokumente nie sú žiadne záložky. Ak ju chcete pridať, kliknite na ikonu Vložiť záložku na dokument.",
		noUrl			: "Zadajte adresu URL odkazu",
		noEmail			: "Zadajte e-mailovú adresu"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Vložiť záložku dokumentu",
		menu		: "Upraviť záložku na dokument",
		title		: "Záložka na dokument",
		name		: "Názov:",
		errorName	: "Zadajte názov záložky na dokument",
		remove		: "Odstrániť záložku na dokument"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Vlastnosti očíslovaného zoznamu",
		bulletedTitle		: "Vlastnosti zoznamu s odrážkami",
		type				: "Typ",
		start				: "Spustiť",
		validateStartNumber				:"Začiatočné číslo zoznamu musí byť celé číslo.",
		circle				: "Kruh",
		disc				: "Disk",
		square				: "Štvorec",
		none				: "Žiadny",
		notset				: "<not set>",
		armenian			: "Arménske číslovanie",
		georgian			: "Gregoriánske číslovanie (an, ban, gan atď.)",
		lowerRoman			: "Malé rímske písmená (i, ii, iii, iv, v atď.)",
		upperRoman			: "Veľké rímske písmená (I, II, III, IV, V atď.)",
		lowerAlpha			: "Malé písmená abecedy (a, b, c, d, e atď.)",
		upperAlpha			: "Veľké písmená abecedy (A, B, C, D, E atď.)",
		lowerGreek			: "Malé grécke písmená (alfa, beta, gama atď.)",
		decimal				: "Desiatkové číslice (1, 2, 3 atď.)",
		decimalLeadingZero	: "Desiatkové číslice s úvodnou nulou (01, 02, 03 atď.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Hľadať a nahradiť",
		find				: "Nájsť",
		replace				: "Nahradiť",
		findWhat			: "Nájsť:",
		replaceWith			: "Nahradiť čím:",
		notFoundMsg			: "Zadaný text sa nenašiel.",
		noFindVal			: 'Vyžaduje sa text na hľadanie.',
		findOptions			: "Možnosti hľadania",
		matchCase			: "Zohľadňovanie veľkosti písmen",
		matchWord			: "Zhoda iba celých slov",
		matchCyclic			: "Hľadať cyklicky",
		replaceAll			: "Nahradiť všetko",
		replaceSuccessMsg	: "Počet nahradených výskytov: %1."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Vložiť tabuľku",
		title		: "Tabuľka",
		menu		: "Vlastnosti tabuľky",
		deleteTable	: "Vymazať tabuľku",
		rows		: "Riadky:",
		columns		: "Stĺpce:",
		border		: "Veľkosť okraja:",
		widthPx		: "pixle",
		widthPc		: "percent",
		widthUnit	: "Jednotka šírky:",
		cellSpace	: "Rozstup buniek:",
		cellPad		: "Výplň buniek:",
		caption		: "Nadpis:",
		summary		: "Súhrn:",
		headers		: "Hlavičky:",
		headersNone		: "Žiadny",
		headersColumn	: "Prvý stĺpec",
		headersRow		: "Prvý riadok",
		headersBoth		: "Oboje",
		invalidRows		: "Počet riadkov musí byť celé číslo väčšie ako nula.",
		invalidCols		: "Počet stĺpcov musí byť celé číslo väčšie ako nula.",
		invalidBorder	: "Veľkosť rámika musí byť kladné číslo.",
		invalidWidth	: "Šírka tabuľky musí byť kladné číslo.",
		invalidHeight	: "Výška tabuľky musí byť kladné číslo.",
		invalidCellSpacing	: "Rozstup bunky musí byť kladné číslo.",
		invalidCellPadding	: "Výplň bunky musí byť kladné číslo.",

		cell :
		{
			menu			: "Bunka",
			insertBefore	: "Vložiť bunku pred",
			insertAfter		: "Vložiť bunku za",
			deleteCell		: "Vymazať bunky",
			merge			: "Zlúčiť bunky",
			mergeRight		: "Zlúčiť doprava",
			mergeDown		: "Zlúčiť nadol",
			splitHorizontal	: "Rozdeliť bunku horizontálne",
			splitVertical	: "Rozdeliť bunku vertikálne",
			title			: "Vlastnosti bunky",
			cellType		: "Typ bunky:",
			rowSpan			: "Spojenie riadkov:",
			colSpan			: "Spojenie stĺpcov:",
			wordWrap		: "Zalomiť slová:",
			hAlign			: "Horizontálne zarovnanie:",
			vAlign			: "Vertikálne zarovnanie:",
			alignBaseline	: "Základná linka",
			bgColor			: "Farba pozadia:",
			borderColor		: "Farba okraja:",
			data			: "Údaje",
			header			: "Hlavička",
			yes				: "Áno",
			no				: "Nie",
			invalidWidth	: "Šírka bunky musí byť kladné číslo.",
			invalidHeight	: "Výška bunky musí byť kladné číslo.",
			invalidRowSpan	: "Spojenie riadkov musí byť celé kladné číslo.",
			invalidColSpan	: "Spojenie stĺpcov musí byť celé kladné číslo.",
			chooseColor : "Vybrať"
		},

		row :
		{
			menu			: "Riadok",
			insertBefore	: "Vložiť riadok pred",
			insertAfter		: "Vložiť riadok za",
			deleteRow		: "Vymazať riadky"
		},

		column :
		{
			menu			: "Stĺpec",
			insertBefore	: "Vložiť stĺpec pred",
			insertAfter		: "Vložiť stĺpec za",
			deleteColumn	: "Vymazať stĺpce"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Vlastnosti tlačidla",
		text		: "Text (hodnota):",
		type		: "Typ:",
		typeBtn		: "Tlačidlo",
		typeSbm		: "Odoslať",
		typeRst		: "Vynulovať"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Vlastnosti začiarkavacieho políčka",
		radioTitle	: "Vlastnosti prepínača",
		value		: "Hodnota:",
		selected	: "Vybratý"
	},

	// Form Dialog.
	form :
	{
		title		: "Vložiť formulár",
		menu		: "Vlastnosti formulára",
		action		: "Akcia:",
		method		: "Metóda:",
		encoding	: "Kódovanie:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Vlastnosti výberového poľa",
		selectInfo	: "Informácie o výbere",
		opAvail		: "Dostupné voľby",
		value		: "Hodnota:",
		size		: "Veľkosť:",
		lines		: "riadkov",
		chkMulti	: "Povoliť viacnásobný výber",
		opText		: "Text:",
		opValue		: "Hodnota:",
		btnAdd		: "Pridať",
		btnModify	: "Upraviť",
		btnUp		: "Nahor",
		btnDown		: "Nadol",
		btnSetValue : "Nastaviť ako vybratú hodnotu",
		btnDelete	: "Vymazať"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Vlastnosti textovej oblasti",
		cols		: "Stĺpce:",
		rows		: "Riadky:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Vlastnosti textového poľa",
		name		: "Názov:",
		value		: "Hodnota:",
		charWidth	: "Šírka v znakoch:",
		maxChars	: "Maximálny počet znakov:",
		type		: "Typ:",
		typeText	: "Text",
		typePass	: "Heslo"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Vlastnosti skrytého poľa",
		name	: "Názov:",
		value	: "Hodnota:"
	},

	// Image Dialog.
	image :
	{
		title		: "Obrázok",
		titleButton	: "Vlastnosti obrázkového tlačidla",
		menu		: "Vlastnosti obrázka...",
		infoTab	: "Informácie o obrázku",
		btnUpload	: "Odoslať na server",
		upload	: "Odoslať",
		alt		: "Alternatívny text:",
		lockRatio	: "Zamknúť pomer strán",
		resetSize	: "Obnoviť veľkosť",
		border	: "Rámik:",
		hSpace	: "Horizontálny odstup:",
		vSpace	: "Vertikálny odstup:",
		alertUrl	: "Zadajte adresu URL obrázka",
		linkTab	: "Odkaz",
		button2Img	: "Chcete transformovať vybraté obrázkové tlačidlo na obyčajný obrázok?",
		img2Button	: "Chcete transformovať vybratý obrázok na obrázkové tlačidlo?",
		urlMissing : "Chýba zdrojová adresa URL obrázka.",
		validateBorder : "Rámik musí byť zadaný ako celé kladné číslo.",
		validateHSpace : "Horizontálny odstup musí byť kladné celé číslo.",
		validateVSpace : "Vertikálny odstup musí byť kladné celé číslo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Vlastnosti elementu Flash",
		propertiesTab	: "Vlastnosti",
		title		: "Flash",
		chkPlay		: "Automaticky prehrať",
		chkLoop		: "Prehrávať v slučke",
		chkMenu		: "Povoliť ponuku vo formáte flash",
		chkFull		: "Povoliť zobrazenie na celú obrazovku",
 		scale		: "Mierka:",
		scaleAll		: "Zobraziť všetko",
		scaleNoBorder	: "Bez okraja",
		scaleFit		: "Prispôsobiť",
		access			: "Prístup skriptu:",
		accessAlways	: "Vždy",
		accessSameDomain	: "Rovnaká doména",
		accessNever	: "Nikdy",
		alignAbsBottom: "Abs. spodok",
		alignAbsMiddle: "Abs. stred",
		alignBaseline	: "Základná linka",
		alignTextTop	: "Vrch textu",
		quality		: "Kvalita:",
		qualityBest	: "Najvyššia",
		qualityHigh	: "Vysoká",
		qualityAutoHigh	: "Automaticky vysoká",
		qualityMedium	: "Stredná",
		qualityAutoLow	: "Automaticky nízka",
		qualityLow	: "Nízka",
		windowModeWindow	: "Okno",
		windowModeOpaque	: "Nepriehľadné",
		windowModeTransparent	: "Priesvitná",
		windowMode	: "Režim okna:",
		flashvars	: "Premenné:",
		bgcolor	: "Farba pozadia:",
		hSpace	: "Horizontálny odstup:",
		vSpace	: "Vertikálny odstup:",
		validateSrc : "Adresa URL nesmie byť prázdna.",
		validateHSpace : "Horizontálny odstup musí byť kladné celé číslo.",
		validateVSpace : "Vertikálny odstup musí byť kladné celé číslo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Kontrola pravopisu",
		title			: "Kontrola pravopisu",
		notAvailable	: "Služba je momentálne nedostupná.",
		errorLoading	: "Nastala chyba pri načítavaní hostiteľa aplikačnej služby: %s.",
		notInDic		: "Nie je v slovníku",
		changeTo		: "Zmeniť na",
		btnIgnore		: "Ignorovať",
		btnIgnoreAll	: "Ignorovať všetko",
		btnReplace		: "Nahradiť",
		btnReplaceAll	: "Nahradiť všetko",
		btnUndo			: "Vrátiť späť",
		noSuggestions	: "- Žiadne návrhy -",
		progress		: "Prebieha kontrola pravopisu...",
		noMispell		: "Kontrola pravopisu je dokončená: nenašli sa žiadne chyby",
		noChanges		: "Kontrola pravopisu je dokončená: nezmenili sa žiadne slová",
		oneChange		: "Kontrola pravopisu je dokončená: zmenilo sa jedno slovo",
		manyChanges		: "Kontrola pravopisu je dokončená: zmenilo sa %1 slov",
		ieSpellDownload	: "Nie je nainštalovaný program na kontrolu pravopisu. Chcete ho teraz prevziať?"
	},

	smiley :
	{
		toolbar	: "Vložiť emotikon",
		title	: "Emotikony",
		options : "Možnosti pre emotikony"
	},

	elementsPath :
	{
		eleLabel : "Cesta k elementom",
		eleTitle : "Element %1"
	},

	numberedlist : "Očíslovaný zoznam",
	bulletedlist : "Zoznam s odrážkami",
	indent : "Zvýšiť odsadenie",
	outdent : "Znížiť odsadenie",

	bidi :
	{
		ltr : "Zľava doprava",
		rtl : "Sprava doľava",
	},

	justify :
	{
		left : "Zarovnať vľavo",
		center : "Zarovnať na stred",
		right : "Zarovnať vpravo",
		block : "Zarovnať podľa okrajov"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Prilepiť",
		cutError	: "Bezpečnostné nastavenia vášho prehliadača nedovoľujú automatické vystrihovanie. Použite klávesovú skratku Ctrl + X.",
		copyError	: "Bezpečnostné nastavenia vášho prehliadača nedovoľujú automatické kopírovanie. Použite klávesovú skratku Ctrl + C.",
		pasteMsg	: "Ak chcete prilepiť obsah dole, stlačte klávesovú skratku Ctrl + V (Cmd + V v systémoch Mac).",
		securityMsg	: "Bezpečnostné nastavenia vášho prehliadača blokujú priame prilepenie zo schránky.",
		pasteArea	: "Oblasť na prilepenie obsahu"
	},

	pastefromword :
	{
		confirmCleanup	: "Zdá sa, že chcete vložiť text skopírovaný z aplikácie Word. Chcete ho pred prilepením vyčistiť?",
		toolbar			: "Prilepiť špeciálne",
		title			: "Prilepiť špeciálne",
		error			: "Nastala interná chyba a nebolo možné vyčistiť prilepený obsah"
	},

	pasteText :
	{
		button	: "Prilepiť ako prostý text",
		title	: "Prilepiť ako prostý text"
	},

	templates :
	{
		button 			: "Šablóny",
		title : "Šablóny obsahu",
		options : "Možnosti šablóny",
		insertOption: "Nahradiť skutočný obsah",
		selectPromptMsg: "Vyberte šablónu, ktorú chcete otvoriť v editore",
		emptyListMsg : "(Nie sú definované žiadne šablóny)"
	},

	showBlocks : "Zobraziť bloky",

	stylesCombo :
	{
		label		: "Štýly",
		panelTitle 	: "Štýly",
		panelTitle1	: "Štýly blokov",
		panelTitle2	: "Inline štýly",
		panelTitle3	: "Štýly objektov"
	},

	format :
	{
		label		: "Formát",
		panelTitle	: "Formát odseku",

		tag_p		: "Normálna",
		tag_pre		: "Formátovaný",
		tag_address	: "Adresa",
		tag_h1		: "Nadpis 1",
		tag_h2		: "Nadpis 2",
		tag_h3		: "Nadpis 3",
		tag_h4		: "Nadpis 4",
		tag_h5		: "Nadpis 5",
		tag_h6		: "Nadpis 6",
		tag_div		: "Normálny (DIV)"
	},

	div :
	{
		title				: "Vytvoriť kontajner Div",
		toolbar				: "Vytvoriť kontajner Div",
		cssClassInputLabel	: "Triedy hárka štýlov",
		styleSelectLabel	: "Štýl",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Kód jazyka",
		inlineStyleInputLabel	: "Inline štýl",
		advisoryTitleInputLabel	: "Pomocný nadpis",
		langDirLabel		: "Smer textu",
		langDirLTRLabel		: "Zľava doprava",
		langDirRTLLabel		: "Sprava doľava",
		edit				: "Upraviť div",
		remove				: "Odstrániť div"
  	},

	iframe :
	{
		title		: "Vlastnosti IFrame",
		toolbar		: "Vložiť IFrame",
		noUrl		: "Zadajte adresu URL iframe",
		scrolling	: "Povoliť rolovacie lišty",
		border		: "Zobraziť kraj rámčeka"
	},

	font :
	{
		label		: "Písmo",
		voiceLabel	: "Písmo",
		panelTitle	: "Názov písma"
	},

	fontSize :
	{
		label		: "Veľkosť",
		voiceLabel	: "Veľkosť písma",
		panelTitle	: "Veľkosť písma"
	},

	colorButton :
	{
		textColorTitle	: "Farba textu",
		bgColorTitle	: "Farba pozadia",
		panelTitle		: "Farby",
		auto			: "Automaticky",
		more			: "Viac farieb..."
	},

	colors :
	{
		"000" : "Čierna",
		"800000" : "Gaštanová",
		"8B4513" : "Sedlová hnedá",
		"2F4F4F" : "Tmavá bridlicová sivá",
		"008080" : "Zelenomodrá",
		"000080" : "Námornícka modrá",
		"4B0082" : "Indigo",
		"696969" : "Tmavá sivá",
		"B22222" : "Ohňovzdorná tehla",
		"A52A2A" : "Hnedá",
		"DAA520" : "Zlatobyľ",
		"006400" : "Tmavá zelená",
		"40E0D0" : "Tyrkysová",
		"0000CD" : "Stredne modrá",
		"800080" : "Purpurová",
		"808080" : "Sivá",
		"F00" : "Červená",
		"FF8C00" : "Tmavá oranžová",
		"FFD700" : "Zlatá",
		"008000" : "Zelená",
		"0FF" : "Zelenomodrá",
		"00F" : "Modrá",
		"EE82EE" : "Fialová",
		"A9A9A9" : "Matná sivá",
		"FFA07A" : "Svetlá lososová",
		"FFA500" : "Oranžová",
		"FFFF00" : "Žltá",
		"00FF00" : "Lipovo zelená",
		"AFEEEE" : "Bledá tyrkysová",
		"ADD8E6" : "Svetlá modrá",
		"DDA0DD" : "Slivka",
		"D3D3D3" : "Svetlá sivá",
		"FFF0F5" : "Levanduľová červeň",
		"FAEBD7" : "Antická biela",
		"FFFFE0" : "Svetlá žltá",
		"F0FFF0" : "Ambróziová",
		"F0FFFF" : "Azúrová",
		"F0F8FF" : "Alicina modrá",
		"E6E6FA" : "Levanduľová",
		"FFF" : "Biela"
	},

	scayt :
	{
		title			: "Kontrola pravopisu počas písania",
		opera_title		: "Nepodporované v prehliadači Opera",
		enable			: "Povoliť SCAYT",
		disable			: "Zakázať SCAYT",
		about			: "Informácie o SCAYT",
		toggle			: "Prepnúť SCAYT",
		options			: "Možnosti",
		langs			: "Jazyky",
		moreSuggestions	: "Viac návrhov",
		ignore			: "Ignorovať",
		ignoreAll		: "Ignorovať všetko",
		addWord			: "Pridať slovo",
		emptyDic		: "Názov slovníka by nemal byť prázdny.",

		optionsTab		: "Možnosti",
		allCaps			: "Ignorovať slová so všetkými veľkými písmenami",
		ignoreDomainNames : "Ignorovať názvy domén",
		mixedCase		: "Ignorovať slová so zmiešanou veľkosťou písmen",
		mixedWithDigits	: "Ignorovať slová s číslami",

		languagesTab	: "Jazyky",

		dictionariesTab	: "Slovníky",
		dic_field_name	: "Názov slovníka",
		dic_create		: "Vytvoriť",
		dic_restore		: "Obnoviť",
		dic_delete		: "Vymazať",
		dic_rename		: "Premenovať",
		dic_info		: "Užívateľský slovník je počiatočne uložený v súbore cookie. Súbory cookie však majú obmedzenú veľkosť. Keď sa užívateľský slovník zväčší natoľko, že sa nedá uložiť v súbore cookie, užívateľský slovník môžete uložiť v našom serveri. Ak chcete uložiť svoj osobný slovník v našom serveri, musíte zadať názov slovníka. Ak už máte uložený slovník, napíšte jeho názov a kliknite na tlačidlo Obnoviť.",

		aboutTab		: "Informácie"
	},

	about :
	{
		title		: "Informácie o CKEditor",
		dlgTitle	: "Informácie o CKEditor",
		help	: "Pomoc nájdete v $1.",
		userGuide : "CKEditor, užívateľská príručka",
		moreInfo	: "Informácie o licencovaní nájdete na našej webovej lokalite:",
		copy		: "Copyright &copy; $1. Všetky práva vyhradené."
	},

	maximize : "Maximalizovať",
	minimize : "Minimalizovať",

	fakeobjects :
	{
		anchor	: "Kotva",
		flash	: "Flash animácia",
		iframe		: "IFrame",
		hiddenfield	: "Skryté pole",
		unknown	: "Neznámy objekt"
	},

	resize : "Potiahnutím zmeňte veľkosť",

	colordialog :
	{
		title		: "Vybrať farbu",
		options	:	"Možnosti farieb",
		highlight	: "Zvýrazniť",
		selected	: "Vybratá farba",
		clear		: "Vyčistiť"
	},

	toolbarCollapse	: "Zvinúť lištu nástrojov",
	toolbarExpand	: "Rozvinúť lištu nástrojov",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Schránka/vrátiť späť",
		editing : "Úprava",
		forms : "Formuláre",
		basicstyles : "Základné štýly",
		paragraph : "Odsek",
		links : "Odkazy",
		insert : "Vložiť",
		styles : "Štýly",
		colors : "Farby",
		tools : "Nástroje"
	},

	bidi :
	{
		ltr : "Zmeniť na text zľava doprava",
		rtl : "Zmeniť na text sprava doľava"
	},

	docprops :
	{
		label : "Vlastnosti dokumentu",
		title : "Vlastnosti dokumentu",
		design : "Návrh:",
		meta : "Metaznačky",
		chooseColor : "Vybrať",
		other : "Iné...",
		docTitle :	"Nadpis stránky",
		charset : 	"Kódovanie sady znakov",
		charsetOther : "Iné kódovanie sady znakov",
		charsetASCII : "ASCII",
		charsetCE : "Centrálna Európa",
		charsetCT : "Tradičná čínština (Big5)",
		charsetCR : "Cyrilika",
		charsetGR : "Gréčtina",
		charsetJP : "Japončina",
		charsetKR : "Kórejčina",
		charsetTR : "Turečtina",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Západná Európa",
		docType : "Záhlavie typu dokumentu",
		docTypeOther : "Iné záhlavie typu dokumentu",
		xhtmlDec : "Zahrnúť deklarácie XHTML",
		bgColor : "Farba pozadia",
		bgImage : "Adresa URL obrázka pozadia",
		bgFixed : "Pevné pozadie (bez posúvania)",
		txtColor : "Farba textu",
		margin : "Okraje strany",
		marginTop : "Vrch",
		marginLeft : "Vľavo",
		marginRight : "Vpravo",
		marginBottom : "Spodok",
		metaKeywords : "Kľúčové slová pre indexovanie dokumentu (oddelené čiarkou)",
		metaDescription : "Popis dokumentu",
		metaAuthor : "Autor",
		metaCopyright : "Autorské právo",
		previewHtml : "<p>Toto je <strong>vzorový text</strong>. Používate <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "palce",
			widthCm	: "centimetre",
			widthMm	: "milimetre",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "body",
			widthPc	: "pica"
		},
		table :
		{
			heightUnit	: "Jednotka výšky:",
			insertMultipleRows : "Vložiť riadky",
			insertMultipleCols : "Vložiť stĺpce",
			noOfRows : "Počet riadkov:",
			noOfCols : "Počet stĺpcov:",
			insertPosition : "Pozícia:",
			insertBefore : "Pred",
			insertAfter : "Po",
			selectTable : "Vybrať tabuľku",
			selectRow : "Vybrať riadok",
			columnTitle : "Stĺpec",
			colProps : "Vlastnosti stĺpca",
			invalidColumnWidth	: "Šírka stĺpca musí byť kladné číslo."
		},
		cell :
		{
			title : "Bunka"
		},
		emoticon :
		{
			angel		: "Anjel",
			angry		: "Nahnevaný",
			cool		: "Super",
			crying		: "Plač",
			eyebrow		: "Obočie",
			frown		: "Mračenie",
			goofy		: "Pojašený",
			grin		: "Úškrn",
			half		: "Polovica",
			idea		: "Nápad",
			laughing	: "Smiech",
			laughroll	: "Záchvat smiechu",
			no			: "Nie",
			oops		: "Ups",
			shy			: "Zahanbený",
			smile		: "Úsmev",
			tongue		: "Jazyk",
			wink		: "Žmurk",
			yes			: "Áno"
		},

		menu :
		{
			link	: "Vložiť odkaz",
			list	: "Zoznam",
			paste	: "Prilepiť",
			action	: "Akcia",
			align	: "Zarovnať",
			emoticon: "Emotikon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Očíslovaný zoznam",
			bulletedTitle		: "Zoznam s odrážkami"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Napíšte opisný názov záložky, napríklad Sekcia 1.2. Po vložení záložky kliknite na ikonu Odkaz alebo Odkaz na záložku na dokument, aby ste ju prepojili.",
			title		: "Odkaz na záložku na dokument",
			linkTo		: "Odkaz na:"
		},

		urllink :
		{
			title : "Odkaz s adresou URL",
			linkText : "Text odkazu",
			selectAnchor: "Vyberte kotvu:",
			nourl: "Zadajte adresu URL do textového poľa.",
			urlhelp: "Napíšte alebo prilepte adresu URL, ktorá sa otvorí, keď užívatelia kliknú na tento odkaz. Príklad: http://www.example.com",
			displaytxthelp: "Napíšte zobrazovaný text pre odkaz.",
			openinnew : "Otvoriť odkaz v novom okne"
		},

		spellchecker :
		{
			title : "Kontrola pravopisu",
			replace : "Nahradiť:",
			suggesstion : "Návrhy:",
			withLabel : "Čím:",
			replaceButton : "Nahradiť",
			replaceallButton:"Nahradiť všetko",
			skipButton:"Preskočiť",
			skipallButton: "Preskočiť všetko",
			undochanges: "Vrátiť zmeny",
			complete: "Kontrola pravopisu je dokončená",
			problem: "Nastal problém pri získavaní údajov XML",
			addDictionary: "Pridať do slovníka",
			editDictionary: "Upraviť slovník"
		},

		status :
		{
			keystrokeForHelp: "Ak chcete zobraziť pomoc, stlačte ALT 0"
		},

		linkdialog :
		{
			label : "Dialógové okno Odkaz"
		},

		image :
		{
			previewText : "Text bude tiecť okolo pridávaného obrázka ako v tomto príklade."
		}
	}

};
