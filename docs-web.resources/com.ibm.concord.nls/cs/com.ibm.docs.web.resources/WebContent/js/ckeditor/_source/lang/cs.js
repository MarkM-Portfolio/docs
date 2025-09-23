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
	toolbars	: "Panely editoru",
	editor	: "Editor formátovaného textu",

	// Toolbar buttons without dialogs.
	source			: "Zdroj",
	newPage			: "Nová stránka",
	save			: "Uložit",
	preview			: "Náhled:",
	cut				: "Vyjmout",
	copy			: "Kopírovat",
	paste			: "Vložit",
	print			: "Tisk",
	underline		: "Podtržené",
	bold			: "Tučné",
	italic			: "Kurzíva",
	selectAll		: "Vybrat vše",
	removeFormat	: "Odebrat formát",
	strike			: "Přeškrtnuté",
	subscript		: "Dolní index",
	superscript		: "Horní index",
	horizontalrule	: "Vložit vodorovnou čáru",
	pagebreak		: "Vložit zalomení stránky",
	pagebreakAlt		: "Zalomení stránky",
	unlink			: "Odebrat odkaz",
	undo			: "Zpět",
	redo			: "Znovu",

	// Common messages and labels.
	common :
	{
		browseServer	: "Server prohlížeče:",
		url				: "Adresa URL:",
		protocol		: "Protokol:",
		upload			: "Odeslat:",
		uploadSubmit	: "Odeslat na server",
		image			: "Vložit obrázek",
		flash			: "Vložit animaci Flash",
		form			: "Vložit formulář",
		checkbox		: "Vložit zaškrtávací políčko",
		radio			: "Vložit přepínač",
		textField		: "Vložit pole pro text",
		textarea		: "Vložit oblast textu",
		hiddenField		: "Vložit skryté pole",
		button			: "Vložit tlačítko",
		select			: "Vložit pole pro výběr",
		imageButton		: "Vložit tlačítko s obrázkem",
		notSet			: "<nenastaveno>",
		id				: "ID:",
		name			: "Název:",
		langDir			: "Směr textu:",
		langDirLtr		: "Zleva doprava",
		langDirRtl		: "Zprava doleva",
		langCode		: "Kód jazyka:",
		longDescr		: "Adresa URL dlouhého popisu:",
		cssClass		: "Třídy šablony stylů:",
		advisoryTitle	: "Pomocný nadpis:",
		cssStyle		: "Styl:",
		ok				: "OK",
		cancel			: "Storno",
		close : "Zavřít",
		preview			: "Náhled:",
		generalTab		: "Obecné",
		advancedTab		: "Rozšířené",
		validateNumberFailed	: "Tato hodnota není číselná.",
		confirmNewPage	: "Veškeré neuložené změny tohoto obsahu budou ztraceny. Opravdu chcete načíst novou stránku?. Opravdu chcete načíst novou stránku?",
		confirmCancel	: "Některé z voleb byly změněny. Opravdu chcete toto dialogové okno zavřít?",
		options : "Volby",
		target			: "Cíl:",
		targetNew		: "Nové okno (_blank)",
		targetTop		: "Okno nejvyšší úrovně (_top)",
		targetSelf		: "Totéž okno (_self)",
		targetParent	: "Nadřízené okno (_parent)",
		langDirLTR		: "Zleva doprava",
		langDirRTL		: "Zprava doleva",
		styles			: "Styl:",
		cssClasses		: "Třídy šablony stylů:",
		width			: "Šířka:",
		height			: "Výška:",
		align			: "Zarovnat:",
		alignLeft		: "Vlevo",
		alignRight		: "Vpravo",
		alignCenter		: "Na střed",
		alignTop		: "Nahoru",
		alignMiddle		: "Doprostřed",
		alignBottom		: "Dolů",
		invalidHeight	: "Výška musí být celé kladné číslo.",
		invalidWidth	: "Šířka musí být celé kladné číslo.",
		invalidCssLength	: "Hodnota pole '%1' musí být kladné číslo bez nebo s platnou měrnou jednotkou CSS (px, %, in, cm, mm, em, ex, pt, nebo pc).",
		invalidHtmlLength	: "Hodnota pole '%1' musí být kladné číslo bez nebo s platnou měrnou jednotkou HTML (px nebo %).",
		invalidInlineStyle	: "Hodnota stylu se musí skládat z jedné nebo více n-tic ve formátu \"jméno/název : hodnota\", oddělených středníky.",
		cssLengthTooltip	: "Zadejte číslo pro hodnotu v pixelech nebo číslo s platnou jednotkou CSS (px, %, in, cm, mm, em, ex, pt nebo pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, není k dispozici</span>"
	},

	contextmenu :
	{
		options : "Volby kontextové nabídky"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Vložit speciální znak",
		title		: "Speciální znak",
		options : "Volby speciálního znaku"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Odkaz na adresu URL",
		other 		: "<other>",
		menu		: "Upravit odkaz...",
		title		: "Odkaz",
		info		: "Informace o odkazu",
		target		: "Cíl",
		upload		: "Odeslat:",
		advanced	: "Rozšířené",
		type		: "Typ odkazu:",
		toUrl		: "Adresa URL",
		toAnchor	: "Odkaz na kotvu v textu",
		toEmail		: "E-mail",
		targetFrame	: "<rámec>",
		targetPopup	: "<rozevírací okno>",
		targetFrameName	: "Název cílového rámce:",
		targetPopupName	: "Název informačního okna:",
		popupFeatures	: "Funkce informačního okna:",
		popupResizable	: "S možností změny velikosti",
		popupStatusBar	: "Stavový řádek",
		popupLocationBar	: "Pruh umístění",
		popupToolbar	: "Panel nástrojů",
		popupMenuBar	: "Pruh nabídky",
		popupFullScreen	: "Celá obrazovka (IE)",
		popupScrollBars	: "Posuvníky",
		popupDependent	: "Závislé (Netscape)",
		popupLeft		: "Pozice levého okraje",
		popupTop		: "Pozice horního okraje",
		id				: "ID:",
		langDir			: "Směr textu:",
		langDirLTR		: "Zleva doprava",
		langDirRTL		: "Zprava doleva",
		acccessKey		: "Přístupová klávesa:",
		name			: "Název:",
		langCode		: "Kód jazyka:",
		tabIndex		: "Index karty:",
		advisoryTitle	: "Pomocný nadpis:",
		advisoryContentType	: "Pomocný typ obsahu:",
		cssClasses		: "Třídy šablony stylů:",
		charset			: "Znaková sada odkazovaného prostředku:",
		styles			: "Styl:",
		rel			: "Vztah",
		selectAnchor	: "Vybrat kotvu",
		anchorName		: "Podle názvu kotvy",
		anchorId		: "Podle ID prvku",
		emailAddress	: "E-mailová adresa",
		emailSubject	: "Předmět zprávy",
		emailBody		: "Text zprávy",
		noAnchors		: "V dokumentu nejsou k dispozici žádné záložky. Klepnutím na ikonu 'Vložit záložku' na panelu nástrojů je přidáte.",
		noUrl			: "Zadejte adresu URL odkazu.",
		noEmail			: "Zadejte e-mailovou adresu."
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Vložit záložku dokumentu",
		menu		: "Upravit záložku dokumentu",
		title		: "Záložka dokumentu",
		name		: "Název:",
		errorName	: "Zadejte název záložky dokumentu.",
		remove		: "Odebrat záložku dokumentu"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Vlastnosti číslovaného seznamu",
		bulletedTitle		: "Vlastnosti seznamu s odrážkami",
		type				: "Typ",
		start				: "Start",
		validateStartNumber				:"Číslo začátku seznamu musí být celočíselné.",
		circle				: "Kruh",
		disc				: "Disk",
		square				: "Čtverec",
		none				: "Žádná položka",
		notset				: "<nenastaveno>",
		armenian			: "Arménské číslování",
		georgian			: "Gruzínské číslování (an, ban, gan atd.)",
		lowerRoman			: "Malé římské číslice (i, ii, iii, iv, v atd.)",
		upperRoman			: "Velké římské číslice (I, II, III, IV, V atd.)",
		lowerAlpha			: "Malá abeceda (a, b, c, d, e atd.)",
		upperAlpha			: "Velká abeceda (A, B, C, D, E atd.)",
		lowerGreek			: "Malé řecké znaky (alfa, beta, gama atd.)",
		decimal				: "Desítková čísla (1, 2, 3 atd.)",
		decimalLeadingZero	: "Desítková čísla uvozená nulou (01, 02, 03 atd.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Najít a nahradit",
		find				: "Najít",
		replace				: "Nahradit",
		findWhat			: "Najít:",
		replaceWith			: "Nahradit textem: ",
		notFoundMsg			: "Zadaný text nebyl nalezen.",
		noFindVal			: 'Je nutné zadat hledaný text. ',
		findOptions			: "Volby vyhledávání",
		matchCase			: "Rozlišovat malá a velká písmena",
		matchWord			: "Hledat shodu celého slova",
		matchCyclic			: "Hledat shodu v cyklu",
		replaceAll			: "Nahradit vše",
		replaceSuccessMsg	: "Počet nahrazených výskytů: %1. "
	},

	// Table Dialog
	table :
	{
		toolbar		: "Vložit tabulku",
		title		: "Tabulka",
		menu		: "Vlastnosti tabulky",
		deleteTable	: "Odstranit tabulku",
		rows		: "Řádky:",
		columns		: "Sloupce:",
		border		: "Velikost ohraničení: ",
		widthPx		: "pixely",
		widthPc		: "procent",
		widthUnit	: "Jednotka šířky:",
		cellSpace	: "Velikost mezer mezi buňkami:",
		cellPad		: "Odsazení obsahu buněk:",
		caption		: "Popisek:",
		summary		: "Souhrn:",
		headers		: "Záhlaví:",
		headersNone		: "Žádná položka",
		headersColumn	: "První sloupec",
		headersRow		: "První řádek",
		headersBoth		: "Obojí",
		invalidRows		: "Počet řádků musí být celé číslo větší než nula.",
		invalidCols		: "Počet sloupců musí být celé číslo větší než nula.",
		invalidBorder	: "Velikost ohraničení musí být kladné číslo.",
		invalidWidth	: "Šířka tabulky musí být kladné číslo.",
		invalidHeight	: "Šířka tabulky musí být kladné číslo.",
		invalidCellSpacing	: "Řádkování buněk musí být kladné číslo.",
		invalidCellPadding	: "Výplň buněk musí být kladné číslo.",

		cell :
		{
			menu			: "Buňka",
			insertBefore	: "Vložit buňku před",
			insertAfter		: "Vložit buňku za",
			deleteCell		: "Odstranit buňky",
			merge			: "Sloučit buňky",
			mergeRight		: "Sloučit vpravo",
			mergeDown		: "Sloučit dolů",
			splitHorizontal	: "Rozdělit buňku vodorovně",
			splitVertical	: "Rozdělit buňku svisle",
			title			: "Vlastnosti buňky",
			cellType		: "Typ buňky:",
			rowSpan			: "Spojené řádky:",
			colSpan			: "Spojené sloupce:",
			wordWrap		: "Zalamování slov:",
			hAlign			: "Vodorovné zarovnání:",
			vAlign			: "Svislé zarovnání:",
			alignBaseline	: "Na účaří",
			bgColor			: "Barva pozadí:",
			borderColor		: "Barva ohraničení:",
			data			: "Data",
			header			: "Záhlaví",
			yes				: "Ano",
			no				: "Ne",
			invalidWidth	: "Šířka buňky musí být kladné číslo.",
			invalidHeight	: "Výška buňky musí být kladné číslo.",
			invalidRowSpan	: "Počet spojených řádků musí být celé kladné číslo.",
			invalidColSpan	: "Počet spojených sloupců musí být celé kladné číslo.",
			chooseColor : "Zvolit"
		},

		row :
		{
			menu			: "Řádek",
			insertBefore	: "Vložit řádek před",
			insertAfter		: "Vložit řádek za",
			deleteRow		: "Odstranit řádky"
		},

		column :
		{
			menu			: "Sloupec",
			insertBefore	: "Vložit sloupec před",
			insertAfter		: "Vložit sloupec za",
			deleteColumn	: "Odstranit sloupce"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Vlastnosti tlačítka",
		text		: "Text (hodnota):",
		type		: "Typ:",
		typeBtn		: "Tlačítko",
		typeSbm		: "Odeslat",
		typeRst		: "Resetovat"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Vlastnosti zaškrtávacího políčka",
		radioTitle	: "Vlastnosti přepínače",
		value		: "Hodnota:",
		selected	: "Vybrané"
	},

	// Form Dialog.
	form :
	{
		title		: "Vložit formulář",
		menu		: "Vlastnosti formuláře",
		action		: "Akce:",
		method		: "Metoda:",
		encoding	: "Kódování"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Vlastnosti pole pro výběr",
		selectInfo	: "Informace o výběru",
		opAvail		: "Volby k dispozici",
		value		: "Hodnota:",
		size		: "Velikost:",
		lines		: "řádků",
		chkMulti	: "Povolit výběr více položek",
		opText		: "Text:",
		opValue		: "Hodnota:",
		btnAdd		: "Přidat",
		btnModify	: "Upravit",
		btnUp		: "Nahoru",
		btnDown		: "Dolů",
		btnSetValue : "Nastavit jako vybranou hodnotu",
		btnDelete	: "Odstranit"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Vlastnosti oblasti textu",
		cols		: "Sloupce:",
		rows		: "Řádky:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Vlastnosti pole pro text",
		name		: "Název:",
		value		: "Hodnota:",
		charWidth	: "Šířka znaku:",
		maxChars	: "Maximální počet znaků:",
		type		: "Typ:",
		typeText	: "Text",
		typePass	: "Heslo"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Vlastnosti skrytého pole",
		name	: "Název:",
		value	: "Hodnota:"
	},

	// Image Dialog.
	image :
	{
		title		: "Obrázek",
		titleButton	: "Vlastnosti tlačítka s obrázkem",
		menu		: "Vlastnosti obrázku...",
		infoTab	: "Informace o obrázku",
		btnUpload	: "Odeslat na server",
		upload	: "Odeslat",
		alt		: "Alternativní text:",
		lockRatio	: "Uzamknout poměr",
		resetSize	: "Resetovat velikost",
		border	: "Ohraničení:",
		hSpace	: "Vodorovná mezera:",
		vSpace	: "Svislá mezera:",
		alertUrl	: "Zadejte adresu URL obrázku.",
		linkTab	: "Odkaz",
		button2Img	: "Chcete převést vybrané tlačítko s obrázkem na jednoduchý obrázek?",
		img2Button	: "Chcete převést vybraný obrázek na tlačítko s obrázkem?",
		urlMissing : "Chybí zdrojová adresa URL obrázku.",
		validateBorder : "Ohraničení musí být celé kladné číslo.",
		validateHSpace : "Vodorovná mezera musí být celé kladné číslo.",
		validateVSpace : "Svislá mezera musí být celé kladné číslo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Vlastnosti objektu Flash",
		propertiesTab	: "Vlastnosti",
		title		: "Flash",
		chkPlay		: "Automatické přehrávání",
		chkLoop		: "Zacyklit",
		chkMenu		: "Povolit nabídku prostředí Flash",
		chkFull		: "Povolit režim celé obrazovky",
 		scale		: "Měřítko:",
		scaleAll		: "Zobrazit vše",
		scaleNoBorder	: "Bez ohraničení",
		scaleFit		: "Podle rozměrů okna",
		access			: "Přístup pro skript:",
		accessAlways	: "vždy",
		accessSameDomain	: "Stejná doména",
		accessNever	: "Nikdy",
		alignAbsBottom: "Zcela dolů",
		alignAbsMiddle: "Zcela doprostřed",
		alignBaseline	: "Na účaří",
		alignTextTop	: "K hornímu okraji textu",
		quality		: "Kvalita:",
		qualityBest	: "Nejvyšší",
		qualityHigh	: "Vysoká",
		qualityAutoHigh	: "Střední až vysoká",
		qualityMedium	: "Střední",
		qualityAutoLow	: "Nízká až střední",
		qualityLow	: "Nízká",
		windowModeWindow	: "Okno",
		windowModeOpaque	: "Neprůhledné",
		windowModeTransparent	: "Průhledné",
		windowMode	: "Režim okna:",
		flashvars	: "Proměnné:",
		bgcolor	: "Barva pozadí:",
		hSpace	: "Vodorovná mezera:",
		vSpace	: "Svislá mezera:",
		validateSrc : "Adresa URL nesmí být prázdná.",
		validateHSpace : "Vodorovná mezera musí být celé kladné číslo.",
		validateVSpace : "Svislá mezera musí být celé kladné číslo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Kontrola_pravopisu",
		title			: "Kontrola pravopisu",
		notAvailable	: "Litujeme, služba nyní není k dispozici.",
		errorLoading	: "Chyba při načítání hostitele služby aplikace: %s.",
		notInDic		: "Neuvedeno ve slovníku",
		changeTo		: "Změnit na:",
		btnIgnore		: "Ignorovat",
		btnIgnoreAll	: "Ignorovat vše",
		btnReplace		: "Nahradit",
		btnReplaceAll	: "Nahradit vše",
		btnUndo			: "Zpět",
		noSuggestions	: "- Žádné návrhy -",
		progress		: "Probíhá kontrola pravopisu...",
		noMispell		: "Kontrola pravopisu byla dokončena: Nebyly nalezeny žádné chyby.",
		noChanges		: "Kontrola pravopisu byla dokončena: Nebyla změněna žádná slova.",
		oneChange		: "Kontrola pravopisu byla dokončena: Bylo změněno jedno slovo.",
		manyChanges		: "Kontrola pravopisu byla dokončena: Bylo změněno %1 slov.",
		ieSpellDownload	: "Modul pro kontrolu pravopisu není nainstalován. Chcete jej nyní stáhnout?"
	},

	smiley :
	{
		toolbar	: "Vložit emotikonu",
		title	: "Emotikony",
		options : "Volby emotikon"
	},

	elementsPath :
	{
		eleLabel : "Cesta k prvkům",
		eleTitle : "Prvek %1"
	},

	numberedlist : "Číslovaný seznam",
	bulletedlist : "Seznam s odrážkami",
	indent : "Zvětšit odsazení",
	outdent : "Zmenšit odsazení",

	bidi :
	{
		ltr : "Zleva doprava",
		rtl : "Zprava doleva",
	},

	justify :
	{
		left : "Zarovnat vlevo",
		center : "Zarovnat na střed",
		right : "Zarovnat vpravo",
		block : "Zarovnat do bloku"
	},

	blockquote : "Citace v bloku",

	clipboard :
	{
		title		: "Vložit",
		cutError	: "Nastavení zabezpečení prohlížeče neumožňují použít automatické vyjmutí. Použijte kombinaci kláves Ctrl+X.",
		copyError	: "Nastavení zabezpečení prohlížeče neumožňují použít automatické kopírování. Použijte kombinaci kláves Ctrl+C.",
		pasteMsg	: "Do níže uvedené oblasti lze vkládat stisknutím kombinace kláves Ctrl+V (nebo Cmd+V v počítačích Mac). ",
		securityMsg	: "Zabezpečení prohlížeče brání přímému vkládání ze schránky.",
		pasteArea	: "Oblast pro vložení"
	},

	pastefromword :
	{
		confirmCleanup	: "Text, který chcete vložit, je pravděpodobně zkopírován z aplikace Word. Chcete text před vložením vyčistit?",
		toolbar			: "Vložit jinak",
		title			: "Vložit jinak",
		error			: "Vložená data nebylo možné vyčistit v důsledku interní chyby."
	},

	pasteText :
	{
		button	: "Vložit jako prostý text",
		title	: "Vložit jako prostý text"
	},

	templates :
	{
		button 			: "Šablony",
		title : "Šablony obsahu",
		options : "Volby šablony",
		insertOption: "Nahradit skutečný obsah",
		selectPromptMsg: "Vybrat šablonu pro otevření v editoru",
		emptyListMsg : "(nejsou definovány žádné šablony)"
	},

	showBlocks : "Zobrazovat bloky",

	stylesCombo :
	{
		label		: "Styly",
		panelTitle 	: "Styly",
		panelTitle1	: "Styly bloků",
		panelTitle2	: "Styly vložených objektů",
		panelTitle3	: "Styly objektů"
	},

	format :
	{
		label		: "Formát",
		panelTitle	: "Formát odstavce",

		tag_p		: "Normální",
		tag_pre		: "Formátovaný",
		tag_address	: "Adresa",
		tag_h1		: "Nadpis 1",
		tag_h2		: "Nadpis 2",
		tag_h3		: "Nadpis 3",
		tag_h4		: "Nadpis 4",
		tag_h5		: "Nadpis 5",
		tag_h6		: "Nadpis 6",
		tag_div		: "Normální (DIV)"
	},

	div :
	{
		title				: "Vytvořit kontejner Div",
		toolbar				: "Vytvořit kontejner Div",
		cssClassInputLabel	: "Třídy šablony stylů",
		styleSelectLabel	: "Styl",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Kód jazyka",
		inlineStyleInputLabel	: "Styly vložených objektů",
		advisoryTitleInputLabel	: "Pomocný nadpis",
		langDirLabel		: "Směr textu",
		langDirLTRLabel		: "Zleva doprava",
		langDirRTLLabel		: "Zprava doleva",
		edit				: "Upravit kontejner Div",
		remove				: "Odebrat kontejner Div"
  	},

	iframe :
	{
		title		: "Vlastnosti objektu Iframe",
		toolbar		: "Vložit objekt Iframe",
		noUrl		: "Zadejte adresu URL objektu Iframe",
		scrolling	: "Povolit posuvníky",
		border		: "Zobrazit barvu ohraničení rámce"
	},

	font :
	{
		label		: "Písmo",
		voiceLabel	: "Písmo",
		panelTitle	: "Název písma"
	},

	fontSize :
	{
		label		: "Velikost",
		voiceLabel	: "Velikost písma",
		panelTitle	: "Velikost písma"
	},

	colorButton :
	{
		textColorTitle	: "Barva textu",
		bgColorTitle	: "Barva pozadí",
		panelTitle		: "Barvy",
		auto			: "Automatická",
		more			: "Více barev..."
	},

	colors :
	{
		"000" : "Černá",
		"800000" : "Kaštanová",
		"8B4513" : "Hnědá",
		"2F4F4F" : "Tmavě břidlicově šedá",
		"008080" : "Šedozelená",
		"000080" : "Námořnická modrá",
		"4B0082" : "Indigově modrá",
		"696969" : "Tmavě šedá",
		"B22222" : "Cihlová",
		"A52A2A" : "Světle hnědá",
		"DAA520" : "Diviznová",
		"006400" : "Tmavě zelená",
		"40E0D0" : "Tyrkysová",
		"0000CD" : "Středně modrá",
		"800080" : "Nachová",
		"808080" : "Šedá",
		"F00" : "Červená",
		"FF8C00" : "Tmavě oranžová",
		"FFD700" : "Zlatá",
		"008000" : "Zelená",
		"0FF" : "Azurová",
		"00F" : "Modrá",
		"EE82EE" : "Fialová",
		"A9A9A9" : "Kouřově šedá",
		"FFA07A" : "Světle lososová",
		"FFA500" : "Oranžová",
		"FFFF00" : "Žlutá",
		"00FF00" : "Limetková",
		"AFEEEE" : "Bledě tyrkysová",
		"ADD8E6" : "Světle modrá",
		"DDA0DD" : "Švestková",
		"D3D3D3" : "Světle šedá",
		"FFF0F5" : "Levandulová růžová",
		"FAEBD7" : "Krémově bílá",
		"FFFFE0" : "Bledě žlutá",
		"F0FFF0" : "Nazelenalá",
		"F0FFFF" : "Bledě azurová",
		"F0F8FF" : "Modravá",
		"E6E6FA" : "Levandulová",
		"FFF" : "Bílá"
	},

	scayt :
	{
		title			: "Průběžná kontrola pravopisu",
		opera_title		: "Nepodporováno prohlížečem Opera",
		enable			: "Povolit průběžnou kontrolu pravopisu",
		disable			: "Zakázat průběžnou kontrolu pravopisu",
		about			: "O průběžné kontrole pravopisu",
		toggle			: "Přepnout průběžnou kontrolu pravopisu",
		options			: "Volby",
		langs			: "Jazyky",
		moreSuggestions	: "Další návrhy",
		ignore			: "Ignorovat",
		ignoreAll		: "Ignorovat vše",
		addWord			: "Přidat slovo",
		emptyDic		: "Název slovníku nemůže být prázdný.",

		optionsTab		: "Volby",
		allCaps			: "Ignorovat slova velkými písmeny",
		ignoreDomainNames : "Ignorovat názvy domén",
		mixedCase		: "Ignorovat slova s malými i velkými písmeny",
		mixedWithDigits	: "Ignorovat slova s číslicemi",

		languagesTab	: "Jazyky",

		dictionariesTab	: "Slovníky",
		dic_field_name	: "Název slovníku",
		dic_create		: "Vytvořit",
		dic_restore		: "Obnovit",
		dic_delete		: "Odstranit",
		dic_rename		: "Přejmenovat",
		dic_info		: "Ze začátku je uživatelský slovník uložen v souboru cookie. Soubory cookie ale mají omezenou velikost. Pokud se uživatelský slovník zvětší na velikost, kterou nelze v souboru cookie uložit, může být slovník uložen na našem serveru. Chcete-li uložit svůj osobní slovník na našem serveru, je třeba mu zadat název. Pokud již máte uložený slovník, zadejte jeho název a klepněte na tlačítko Obnovit.",

		aboutTab		: "O produktu"
	},

	about :
	{
		title		: "O programu CKEditor",
		dlgTitle	: "O programu CKEditor",
		help	: "Nápověda: $1.",
		userGuide : "Uživatelská příručka CKEditor",
		moreInfo	: "Informace o licenci naleznete na našem webu:",
		copy		: "Copyright &copy; $1. Všechna práva vyhrazena."
	},

	maximize : "Maximalizovat",
	minimize : "Minimalizovat",

	fakeobjects :
	{
		anchor	: "Kotva",
		flash	: "Animace Flash",
		iframe		: "Objekt Iframe",
		hiddenfield	: "Skryté pole",
		unknown	: "Neznámý objekt"
	},

	resize : "Tažením myší změníte velikost. ",

	colordialog :
	{
		title		: "Vybrat barvu",
		options	:	"Volby barev",
		highlight	: "Zvýraznit",
		selected	: "Vybraná barva",
		clear		: "Vymazat"
	},

	toolbarCollapse	: "Sbalit panel nástrojů",
	toolbarExpand	: "Rozbalit panel nástrojů",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Schránka/Zpět",
		editing : "Úpravy",
		forms : "Formuláře",
		basicstyles : "Základní styly",
		paragraph : "Odstavec",
		links : "Odkazy",
		insert : "Vložit",
		styles : "Styly",
		colors : "Barvy",
		tools : "Nástroje"
	},

	bidi :
	{
		ltr : "Změnit na text psaný zleva doprava",
		rtl : "Změnit na text psaný zprava doleva"
	},

	docprops :
	{
		label : "Vlastnosti dokumentu",
		title : "Vlastnosti dokumentu",
		design : "Návrh",
		meta : "Metaznačky",
		chooseColor : "Zvolit",
		other : "Další...",
		docTitle :	"Titulek stránky",
		charset : 	"Kódování znakové sady",
		charsetOther : "Další kódování znakové sady",
		charsetASCII : "ASCII",
		charsetCE : "Středoevropský",
		charsetCT : "Tradiční čínština (Big5)",
		charsetCR : "Cyrilice",
		charsetGR : "Řečtina",
		charsetJP : "Japonština",
		charsetKR : "Korejština",
		charsetTR : "Turečtina",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Západoevropský",
		docType : "Nadpis typu dokumentu",
		docTypeOther : "Další nadpis typu dokumentu",
		xhtmlDec : "Zahrnout deklarace XHTML",
		bgColor : "Barva pozadí",
		bgImage : "Adresa URL obrázku pozadí",
		bgFixed : "Pevné pozadí",
		txtColor : "Barva textu",
		margin : "Okraje stránky",
		marginTop : "Nahoře",
		marginLeft : "Vlevo",
		marginRight : "Vpravo",
		marginBottom : "Dole",
		metaKeywords : "Klíčová slova indexace dokumentu (oddělena čárkami)",
		metaDescription : "Popis dokumentu",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Toto je <strong>vzorový text</strong>. Používáte <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "in",
			widthCm	: "cm",
			widthMm	: "mm",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "b.",
			widthPc	: "pic."
		},
		table :
		{
			heightUnit	: "Jednotka výšky:",
			insertMultipleRows : "Vložit řádky",
			insertMultipleCols : "Vložit sloupce",
			noOfRows : "Počet řádků:",
			noOfCols : "Počet sloupců:",
			insertPosition : "Pozice:",
			insertBefore : "Před",
			insertAfter : "Po",
			selectTable : "Vybrat tabulku",
			selectRow : "Vyberte řádek",
			columnTitle : "Sloupec",
			colProps : "Vlastnosti sloupce",
			invalidColumnWidth	: "Šířka sloupce musí být kladné číslo."
		},
		cell :
		{
			title : "Buňka"
		},
		emoticon :
		{
			angel		: "Anděl",
			angry		: "Rozčilený",
			cool		: "Klidný",
			crying		: "Pláč",
			eyebrow		: "Zvednuté obočí",
			frown		: "Zamračený",
			goofy		: "Potrhlý",
			grin		: "Škleb",
			half		: "Pochyby",
			idea		: "Nápad",
			laughing	: "Smích",
			laughroll	: "Hysterický smích",
			no			: "Ne",
			oops		: "Jejda",
			shy			: "Stydlivý",
			smile		: "Úsměv",
			tongue		: "Jazyk",
			wink		: "Mrknutí",
			yes			: "Ano"
		},

		menu :
		{
			link	: "Vložit odkaz",
			list	: "Seznam",
			paste	: "Vložit",
			action	: "Akce",
			align	: "Zarovnání",
			emoticon: "Emotikona"
		},

		iframe :
		{
			title	: "Objekt Iframe"
		},

		list:
		{
			numberedTitle		: "Číslovaný seznam",
			bulletedTitle		: "Seznam s odrážkami"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Zadejte popisný název záložky, např. 'Kapitola 1.2'. Po vložení záložky klepněte buď na ikonu 'Odkaz', nebo 'Odkaz na záložku dokumentu' a uložte si její odkaz.",
			title		: "Odkaz na záložku dokumentu",
			linkTo		: "Odkaz na:"
		},

		urllink :
		{
			title : "Odkaz na adresu URL",
			linkText : "Text odkazu:",
			selectAnchor: "Vyberte kotvu:",
			nourl: "Zadejte do textového pole adresu URL.",
			urlhelp: "Zadejte nebo vložte adresu URL, která se má otevřít, když uživatelé klepnou na tento odkaz, například http://www.example.com.",
			displaytxthelp: "Zadejte text, který má být zobrazen pro příslušný odkaz.",
			openinnew : "Otevřít odkaz v novém okně"
		},

		spellchecker :
		{
			title : "Zkontrolovat pravopis",
			replace : "Nahradit:",
			suggesstion : "Návrhy:",
			withLabel : "Čím:",
			replaceButton : "Nahradit",
			replaceallButton:"Nahradit vše",
			skipButton:"Přeskočit",
			skipallButton: "Přeskočit vše",
			undochanges: "Vrátit změny",
			complete: "Kontrola pravopisu je dokončena.",
			problem: "Při načítání dat XML nastal problém.",
			addDictionary: "Přidat do slovníku",
			editDictionary: "Upravit slovník"
		},

		status :
		{
			keystrokeForHelp: "Nápovědu zobrazíte stisknutím kombinace kláves Alt+0."
		},

		linkdialog :
		{
			label : "Dialogové okno odkazu"
		},

		image :
		{
			previewText : "Text bude obtékat přidaný obrázek jako v tomto příkladu."
		}
	}

};
