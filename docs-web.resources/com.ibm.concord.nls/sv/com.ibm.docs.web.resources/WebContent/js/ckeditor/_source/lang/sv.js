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
	editorTitle : "RTF-redigerare, %1.",

	// ARIA descriptions.
	toolbars	: "Redigerarverktygsfält",
	editor	: "RTF-redigerare",

	// Toolbar buttons without dialogs.
	source			: "Källa",
	newPage			: "Ny sida",
	save			: "Spara",
	preview			: "Förhandsgranskning:",
	cut				: "Klipp ut",
	copy			: "Kopiera",
	paste			: "Klistra in",
	print			: "Skriv ut",
	underline		: "Understrykning",
	bold			: "Halvfet",
	italic			: "Kursiv",
	selectAll		: "Markera allt",
	removeFormat	: "Ta bort formatering",
	strike			: "Genomstrykning",
	subscript		: "Nedsänkt",
	superscript		: "Upphöjt",
	horizontalrule	: "Infoga horisontell linje",
	pagebreak		: "Infoga sidbrytning",
	pagebreakAlt		: "Sidbrytning",
	unlink			: "Ta bort länk",
	undo			: "Ångra",
	redo			: "Gör om",

	// Common messages and labels.
	common :
	{
		browseServer	: "Webbläsarserver:",
		url				: "URL:",
		protocol		: "Protokoll:",
		upload			: "Överför:",
		uploadSubmit	: "Sänd till servern",
		image			: "Infoga bild",
		flash			: "Infoga Flash-film",
		form			: "Infoga formulär",
		checkbox		: "Infoga kryssruta",
		radio			: "Infoga alternativknapp",
		textField		: "Infoga textfält",
		textarea		: "Infoga textområde",
		hiddenField		: "Infoga gömt fält",
		button			: "Infoga knapp",
		select			: "Infoga urvalsfält",
		imageButton		: "Infoga bildknapp",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Namn:",
		langDir			: "Textriktning: ",
		langDirLtr		: "Vänster till höger",
		langDirRtl		: "Höger till vänster",
		langCode		: "Språkkod:",
		longDescr		: "URL-adress till lång beskrivning:",
		cssClass		: "Formatmallsklasser:",
		advisoryTitle	: "Beskrivande namn:",
		cssStyle		: "Format:",
		ok				: "OK",
		cancel			: "Avbryt",
		close : "Stäng",
		preview			: "Förhandsgranskning:",
		generalTab		: "Allmänt",
		advancedTab		: "Avancerat",
		validateNumberFailed	: "Det här värdet är inte ett tal.",
		confirmNewPage	: "Du kommer att förlora eventuella ändringar du inte har sparat. Vill du läsa in en ny sida?",
		confirmCancel	: "Vissa av alternativen har ändrats. Vill du stänga dialogrutan?",
		options : "Alternativ",
		target			: "Mål:",
		targetNew		: "Nytt fönster (_blank)",
		targetTop		: "Det översta fönstret (_top)",
		targetSelf		: "Samma fönster (_self)",
		targetParent	: "Det överordnade fönstret (_parent)",
		langDirLTR		: "Vänster till höger",
		langDirRTL		: "Höger till vänster",
		styles			: "Format:",
		cssClasses		: "Formatmallsklasser:",
		width			: "Bredd:",
		height			: "Höjd:",
		align			: "Justera:",
		alignLeft		: "Vänster",
		alignRight		: "Höger",
		alignCenter		: "Centrerat",
		alignTop		: "Överkant",
		alignMiddle		: "Centrera",
		alignBottom		: "Underkant",
		invalidHeight	: "Höjd måste vara ett positivt heltal.",
		invalidWidth	: "Bredd måste vara ett positivt heltal.",
		invalidCssLength	: "Värdet som anges för fältet '%1' måste vara ett positivt tal med eller utan giltig CSS-måttenhet (px, %, tum, cm, mm, em, ex, pt eller pc).",
		invalidHtmlLength	: "Värdet som anges för fältet '%1' måste vara ett positivt tal med eller utan giltig HTML-måttenhet (px eller %).",
		invalidInlineStyle	: "Värdet som anges för textformatet måste bestå av en eller flera tupler med formatet \"namn : värde\", åtskilt med semikolon.",
		cssLengthTooltip	: "Ange ett tal för ett värde i pixlar eller ett tal med en giltig CSS-enhet (px, %, in, cm, mm, em, ex, pt eller pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, ej tillgängligt</span>"
	},

	contextmenu :
	{
		options : "Alternativ på kontextmenyn"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Infoga specialtecken",
		title		: "Specialtecken",
		options : "Alternativ för specialtecken"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL-adresslänk",
		other 		: "<other>",
		menu		: "Ändra länk...",
		title		: "Länka",
		info		: "Länkinformation",
		target		: "Mål",
		upload		: "Överför:",
		advanced	: "Avancerat",
		type		: "Länktyp:",
		toUrl		: "URL-adress",
		toAnchor	: "Länk till ankare i texten",
		toEmail		: "E-post",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Målramnamn:",
		targetPopupName	: "Fönsternamn:",
		popupFeatures	: "Fönsterfunktioner:",
		popupResizable	: "Storleksändringsbart",
		popupStatusBar	: "Statusfält",
		popupLocationBar	: "Adressfält",
		popupToolbar	: "Verktygsfält",
		popupMenuBar	: "Menyrad",
		popupFullScreen	: "Helskärmsläge (endast Internet Explorer)",
		popupScrollBars	: "Bläddringslister",
		popupDependent	: "Underordnat fönster (Netscape)",
		popupLeft		: "Position för vänsterkanten",
		popupTop		: "Position för överkanten",
		id				: "ID:",
		langDir			: "Textriktning: ",
		langDirLTR		: "Vänster till höger",
		langDirRTL		: "Höger till vänster",
		acccessKey		: "Snabbtangent:",
		name			: "Namn:",
		langCode		: "Språkkod:",
		tabIndex		: "Tabbindex:",
		advisoryTitle	: "Beskrivande namn:",
		advisoryContentType	: "Rådgivande innehållstyp:",
		cssClasses		: "Formatmallsklasser:",
		charset			: "Länkad resursteckenuppsättning:",
		styles			: "Format:",
		rel			: "Relation",
		selectAnchor	: "Välj ett ankare",
		anchorName		: "Efter ankarnamn",
		anchorId		: "Efter element-ID",
		emailAddress	: "E-postadress",
		emailSubject	: "Meddelandeärende",
		emailBody		: "Meddelandetext",
		noAnchors		: "Det finns inga tillgängliga bokmärken i dokumentet. Klicka på Infoga dokumentbokmärke i verktygsfältet om du vill lägga till ett bokmärke.",
		noUrl			: "Du måste ange länk-URL-adressen",
		noEmail			: "Du måste ange e-postadressen"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Infoga dokumentbokmärke",
		menu		: "Redigera dokumentbokmärke",
		title		: "Dokumentbokmärke",
		name		: "Namn:",
		errorName	: "Ange ett namn på dokumentbokmärket",
		remove		: "Ta bort dokumentbokmärke"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Egenskaper för numrerad lista",
		bulletedTitle		: "Egenskaper för punktlista",
		type				: "Typ",
		start				: "Start",
		validateStartNumber				:"Startnumret för listan måste vara ett heltal.",
		circle				: "Cirkel",
		disc				: "Skiva",
		square				: "Kvadrat",
		none				: "Ingen",
		notset				: "<not set>",
		armenian			: "Armenisk numrering",
		georgian			: "Georgisk numrering (an, ban, gan osv.)",
		lowerRoman			: "Romerska gemener (i, ii, iii, iv, v osv.)",
		upperRoman			: "Romerska versaler (I, II, III, IV, V osv.)",
		lowerAlpha			: "Gemener (a, b, c, d, e osv.)",
		upperAlpha			: "Versaler (A, B, C, D, E osv.)",
		lowerGreek			: "Grekiska bokstavsbenämningar (alfa, beta, gamma osv.)",
		decimal				: "Decimaltal (1, 2, 3 osv.)",
		decimalLeadingZero	: "Decimaltal med inledande nolla (01, 02, 03 osv.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Sök och ersätt",
		find				: "Sök",
		replace				: "Ersätt",
		findWhat			: "Sök efter:",
		replaceWith			: "Ersätt med:",
		notFoundMsg			: "Det gick inte att hitta den angivna texten.",
		noFindVal			: 'Du måste fylla i söktext.',
		findOptions			: "Sökalternativ",
		matchCase			: "Matcha skiftläge",
		matchWord			: "Matcha hela ord",
		matchCyclic			: "Sök i hela dokumentet",
		replaceAll			: "Ersätt alla",
		replaceSuccessMsg	: "%1 förekomster ersattes."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Infoga tabell",
		title		: "Tabell",
		menu		: "Tabellegenskaper",
		deleteTable	: "Ta bort tabell",
		rows		: "Rader:",
		columns		: "Kolumner:",
		border		: "Kantlinjetjocklek:",
		widthPx		: "bildpunkter",
		widthPc		: "procent",
		widthUnit	: "Breddenhet:",
		cellSpace	: "Cellavstånd:",
		cellPad		: "Cellutfyllnad:",
		caption		: "Bildtext:",
		summary		: "Sammanfattning:",
		headers		: "Rubriker:",
		headersNone		: "Ingen",
		headersColumn	: "Första kolumnen",
		headersRow		: "Första raden",
		headersBoth		: "Båda",
		invalidRows		: "Antalet rader måste vara ett heltal större än noll.",
		invalidCols		: "Antalet kolumner måste vara ett heltal större än noll.",
		invalidBorder	: "Kantlinjetjockleken måste vara ett positivt tal.",
		invalidWidth	: "Tabellbredden måste vara ett positivt tal.",
		invalidHeight	: "Tabellhöjden måste vara ett positivt tal.",
		invalidCellSpacing	: "Cellavstånd måste vara ett positivt tal.",
		invalidCellPadding	: "Cellutfyllnad måste vara ett positivt tal.",

		cell :
		{
			menu			: "Cell",
			insertBefore	: "Infoga cell före",
			insertAfter		: "Infoga cell efter",
			deleteCell		: "Radera celler",
			merge			: "Sammanfoga celler",
			mergeRight		: "Sammanfoga åt höger",
			mergeDown		: "Sammanfoga nedåt",
			splitHorizontal	: "Dela cell horisontellt",
			splitVertical	: "Dela cell vertikalt",
			title			: "Cellegenskaper",
			cellType		: "Celltyp:",
			rowSpan			: "Radomfång:",
			colSpan			: "Kolumnomfång:",
			wordWrap		: "Radbrytning:",
			hAlign			: "Horisontell justering:",
			vAlign			: "Vertikal justering:",
			alignBaseline	: "Baslinje",
			bgColor			: "Bakgrundsfärg:",
			borderColor		: "Kantlinjefärg",
			data			: "Data",
			header			: "Sidhuvud",
			yes				: "Ja",
			no				: "Nej",
			invalidWidth	: "Cellbredd måste vara ett positivt tal.",
			invalidHeight	: "Cellhöjd måste vara ett positivt tal.",
			invalidRowSpan	: "Radomfång måste vara ett positivt heltal.",
			invalidColSpan	: "Kolumnomfång måste vara ett positivt heltal.",
			chooseColor : "Välj"
		},

		row :
		{
			menu			: "Rad",
			insertBefore	: "Infoga rad före",
			insertAfter		: "Infoga rad efter",
			deleteRow		: "Ta bort rader"
		},

		column :
		{
			menu			: "Kolumn ",
			insertBefore	: "Infoga kolumn före",
			insertAfter		: "Infoga kolumn efter",
			deleteColumn	: "Ta bort kolumner"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Knappegenskaper",
		text		: "Text (värde):",
		type		: "Typ:",
		typeBtn		: "Knapp",
		typeSbm		: "Skicka",
		typeRst		: "Återställ"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Kryssruteegenskaper",
		radioTitle	: "Alternativknappsegenskaper",
		value		: "Värde:",
		selected	: "Markerade"
	},

	// Form Dialog.
	form :
	{
		title		: "Infoga formulär",
		menu		: "Formuläregenskaper",
		action		: "Åtgärd:",
		method		: "Metod:",
		encoding	: "Kodning:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Välj fältegenskaper",
		selectInfo	: "Välj information",
		opAvail		: "Tillgängliga alternativ",
		value		: "Värde:",
		size		: "Storlek:",
		lines		: "rader",
		chkMulti	: "Tillåt val av flera alternativ",
		opText		: "Text:",
		opValue		: "Värde:",
		btnAdd		: "Lägg till",
		btnModify	: "Ändra",
		btnUp		: "Uppåt",
		btnDown		: "Nedåt",
		btnSetValue : "Ange som valt värde",
		btnDelete	: "Ta bort"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Textområdesegenskaper",
		cols		: "Kolumner:",
		rows		: "Rader:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Textfältsegenskaper",
		name		: "Namn:",
		value		: "Värde:",
		charWidth	: "Teckenbredd:",
		maxChars	: "Maximalt teckenantal:",
		type		: "Typ:",
		typeText	: "Text",
		typePass	: "Lösenord"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Egenskaper för gömt fält",
		name	: "Namn:",
		value	: "Värde:"
	},

	// Image Dialog.
	image :
	{
		title		: "Bild",
		titleButton	: "Bildknappsegenskaper",
		menu		: "Bildegenskaper...",
		infoTab	: "Bildinformation",
		btnUpload	: "Sänd till servern",
		upload	: "Överför",
		alt		: "Alternativtext:",
		lockRatio	: "Lås höjd/bredd-förhållandet",
		resetSize	: "Återställ storleken",
		border	: "Kantlinje:",
		hSpace	: "Horisontellt avstånd:",
		vSpace	: "Vertikalt avstånd:",
		alertUrl	: "Du måste ange URL-adressen till bilden",
		linkTab	: "Länka",
		button2Img	: "Vill du omvandla den valda bildknappen till en bild?",
		img2Button	: "Vill du omvandla den valda bilden till en bildknapp?",
		urlMissing : "URL till bildkällan saknas.",
		validateBorder : "Kantlinjen måste vara ett positivt heltal.",
		validateHSpace : "Horisontellt avstånd måste vara ett positivt heltal.",
		validateVSpace : "Vertikalt avstånd måste vara ett positivt heltal."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash-egenskaper",
		propertiesTab	: "Egenskaper",
		title		: "Blixt",
		chkPlay		: "Spela upp automatiskt",
		chkLoop		: "Slinga",
		chkMenu		: "Aktivera menyn Flash",
		chkFull		: "Tillåt helskärmsläge",
 		scale		: "Skala:",
		scaleAll		: "Visa alla",
		scaleNoBorder	: "Ingen kantlinje",
		scaleFit		: "Passa exakt",
		access			: "Skriptåtkomst:",
		accessAlways	: "Alltid",
		accessSameDomain	: "Samma domän",
		accessNever	: "Aldrig",
		alignAbsBottom: "Absolut efter underkant",
		alignAbsMiddle: "Absolut efter mitten",
		alignBaseline	: "Baslinje",
		alignTextTop	: "Text överst",
		quality		: "Kvalitet:",
		qualityBest	: "Bästa",
		qualityHigh	: "Hög",
		qualityAutoHigh	: "Automatiskt högsta",
		qualityMedium	: "Medelhög",
		qualityAutoLow	: "Automatiskt lägsta",
		qualityLow	: "Lägsta",
		windowModeWindow	: "Fönster",
		windowModeOpaque	: "Täckande",
		windowModeTransparent	: "Transparent",
		windowMode	: "Fönsterläge:",
		flashvars	: "Variabler:",
		bgcolor	: "Bakgrundsfärg:",
		hSpace	: "Horisontellt avstånd:",
		vSpace	: "Vertikalt avstånd:",
		validateSrc : "Du måste ange en URL-adress.",
		validateHSpace : "Horisontellt avstånd måste vara ett positivt heltal.",
		validateVSpace : "Vertikalt avstånd måste vara ett positivt heltal."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Stavningskontroll",
		title			: "Stavningskontroll",
		notAvailable	: "Tjänsten är inte tillgänglig.",
		errorLoading	: "Det uppstod ett fel när programtjänstvärden skulle läsas in: %s.",
		notInDic		: "Finns inte i ordlistan",
		changeTo		: "Ändra till",
		btnIgnore		: "Ignorera",
		btnIgnoreAll	: "Ignorera alla",
		btnReplace		: "Ersätt",
		btnReplaceAll	: "Ersätt alla",
		btnUndo			: "Ångra",
		noSuggestions	: "- inga förslag -",
		progress		: "Stavningskontrollen utförs...",
		noMispell		: "Stavningskontrollen slutfördes: Inga stavfel hittades",
		noChanges		: "Stavningskontrollen slutfördes: Inga ord ändrades",
		oneChange		: "Stavningskontrollen slutfördes: Ett ord ändrades",
		manyChanges		: "Stavningskontrollen slutfördes: %1 ord ändrades",
		ieSpellDownload	: "Stavningskontrollsfunktionen är inte installerad. Vill du hämta den nu?"
	},

	smiley :
	{
		toolbar	: "Infoga smilis",
		title	: "Smilisar",
		options : "Alternativ för smilisar"
	},

	elementsPath :
	{
		eleLabel : "Elementsökväg",
		eleTitle : "%1-element"
	},

	numberedlist : "Numrerad lista",
	bulletedlist : "Punktlista",
	indent : "Öka indrag",
	outdent : "Minska indrag",

	bidi :
	{
		ltr : "Vänster till höger",
		rtl : "Höger till vänster",
	},

	justify :
	{
		left : "Vänsterjustera",
		center : "Centrera",
		right : "Högerjustera",
		block : "Marginaljustera"
	},

	blockquote : "Blockcitat",

	clipboard :
	{
		title		: "Klistra in",
		cutError	: "Säkerhetsinställningarna för webbläsaren förhindrar automatiskt urklippning. Tryck på Ctrl+X i stället.",
		copyError	: "Säkerhetsinställningarna för webbläsaren förhindrar automatiskt kopiering. Tryck på Ctrl+C i stället.",
		pasteMsg	: "Tryck på Ctrl+V (Kommando+V i Mac OS) om du vill klistra in nedan.",
		securityMsg	: "Säkerhetsinställningarna för webbläsaren innebär att det inte går att klistra in direkt från Urklipp.",
		pasteArea	: "Klistra in område"
	},

	pastefromword :
	{
		confirmCleanup	: "Det verkar som om den text du vill klistra in är kopierad från Word. Vill du rensa den innan du klistrar in?",
		toolbar			: "Klistra in special",
		title			: "Klistra in special",
		error			: "Det gick inte att rensa inklistrade data på grund av ett internt fel"
	},

	pasteText :
	{
		button	: "Klistra in som oformaterad text",
		title	: "Klistra in som oformaterad text"
	},

	templates :
	{
		button 			: "Mallar",
		title : "Innehållsmallar",
		options : "Mallalternativ",
		insertOption: "Ersätt faktiskt innehåll",
		selectPromptMsg: "Välj den mall du ska öppna i redigeraren",
		emptyListMsg : "(Det finns inga definierade mallar)"
	},

	showBlocks : "Visa block",

	stylesCombo :
	{
		label		: "Format",
		panelTitle 	: "Format",
		panelTitle1	: "Blockformat",
		panelTitle2	: "Textformat",
		panelTitle3	: "Objektformat"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Styckeformat",

		tag_p		: "Normal",
		tag_pre		: "Formaterat",
		tag_address	: "Adress",
		tag_h1		: "Rubrik 1",
		tag_h2		: "Rubrik 2",
		tag_h3		: "Rubrik 3",
		tag_h4		: "Rubrik 4",
		tag_h5		: "Rubrik 5",
		tag_h6		: "Rubrik 6",
		tag_div		: "Normalt (DIV)"
	},

	div :
	{
		title				: "Skapa DIV-behållare",
		toolbar				: "Skapa DIV-behållare",
		cssClassInputLabel	: "Formatmallsklasser",
		styleSelectLabel	: "Format",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Språkkod",
		inlineStyleInputLabel	: "Integrerat format",
		advisoryTitleInputLabel	: "Beskrivande namn",
		langDirLabel		: "Textriktning ",
		langDirLTRLabel		: "Vänster till höger",
		langDirRTLLabel		: "Höger till vänster",
		edit				: "Redigera DIV",
		remove				: "Ta bort DIV"
  	},

	iframe :
	{
		title		: "IFrame-ehenskaper",
		toolbar		: "Infoga IFrame",
		noUrl		: "Ange URL-adressen för iframe",
		scrolling	: "rAktivera rullningslister",
		border		: "Visa kantlinjer"
	},

	font :
	{
		label		: "Teckensnitt",
		voiceLabel	: "Teckensnitt",
		panelTitle	: "Teckensnitt"
	},

	fontSize :
	{
		label		: "Storlek",
		voiceLabel	: "Teckenstorlek",
		panelTitle	: "Teckenstorlek"
	},

	colorButton :
	{
		textColorTitle	: "Textfärg",
		bgColorTitle	: "Bakgrundsfärg",
		panelTitle		: "Färger",
		auto			: "Automatiskt",
		more			: "Fler färger..."
	},

	colors :
	{
		"000" : "Svart",
		"800000" : "Rödbrun",
		"8B4513" : "Sadelbrun",
		"2F4F4F" : "Mörkt skiffergrå",
		"008080" : "Blågrön",
		"000080" : "Marinblå",
		"4B0082" : "Indigoblå",
		"696969" : "Mörkt grå",
		"B22222" : "Tegelstensröd",
		"A52A2A" : "Brun",
		"DAA520" : "Gyllenröd",
		"006400" : "Mörkt grön",
		"40E0D0" : "Turkos",
		"0000CD" : "Mellanblå",
		"800080" : "Lila",
		"808080" : "Grå",
		"F00" : "Röd",
		"FF8C00" : "Mörkt orange",
		"FFD700" : "Guld",
		"008000" : "Grön",
		"0FF" : "Cyan",
		"00F" : "Blå",
		"EE82EE" : "Violett",
		"A9A9A9" : "Dimgrå",
		"FFA07A" : "Ljust laxrosa",
		"FFA500" : "Orange",
		"FFFF00" : "Gul",
		"00FF00" : "Limegrön",
		"AFEEEE" : "Ljust turkos",
		"ADD8E6" : "Ljust blå",
		"DDA0DD" : "Plommon",
		"D3D3D3" : "Ljust grå",
		"FFF0F5" : "Lavendel",
		"FAEBD7" : "Antikvit",
		"FFFFE0" : "Ljust gul",
		"F0FFF0" : "Honungsdagg",
		"F0FFFF" : "Azurblå",
		"F0F8FF" : "Aliceblå",
		"E6E6FA" : "Syrenlila",
		"FFF" : "Vit"
	},

	scayt :
	{
		title			: "Stavningskontrollera medan du skriver",
		opera_title		: "Kan inte användas i Opera",
		enable			: "Aktivera SCAYT",
		disable			: "Avaktivera SCAYT",
		about			: "Om SCAYT",
		toggle			: "Växla SCAYT",
		options			: "Alternativ",
		langs			: "Språk",
		moreSuggestions	: "Fler förslag",
		ignore			: "Ignorera",
		ignoreAll		: "Ignorera alla",
		addWord			: "Lägg till ord",
		emptyDic		: "Ordlistans namn får inte vara tomt.",

		optionsTab		: "Alternativ",
		allCaps			: "Ignorera ord med endast versaler",
		ignoreDomainNames : "Ignorera domännamn",
		mixedCase		: "Ignorera ord med både versaler och gemener",
		mixedWithDigits	: "Ignorera ord som innehåller tal",

		languagesTab	: "Språk",

		dictionariesTab	: "Ordlistor",
		dic_field_name	: "Ordlistenamn",
		dic_create		: "Skapa",
		dic_restore		: "Återställ",
		dic_delete		: "Ta bort",
		dic_rename		: "Byt namn",
		dic_info		: "Användarordlistan lagras ursprungligen i en kaka, men kakor har en begränsad storlek. Det innebär att när användarordlistan blir så stor att det inte går att lagra den i en kaka kan den i stället lagras på servern. Om du vill lagra din privata ordlista på servern anger du ett namn för den. Om du redan har en lagrad ordlista anger du namnet på den och sedan klickar du på Återställ.",

		aboutTab		: "Om"
	},

	about :
	{
		title		: "Om CKEditor",
		dlgTitle	: "Om CKEditor",
		help	: "Tryck på $1 för hjälp.",
		userGuide : "CKEditor användarhandbok",
		moreInfo	: "Om du vill ha information om licensiering går du till vår webbplats:",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "Maximera",
	minimize : "Minimera",

	fakeobjects :
	{
		anchor	: "Ankare",
		flash	: "Flash-animering",
		iframe		: "IFrame",
		hiddenfield	: "Gömt fält",
		unknown	: "Okänt objekt"
	},

	resize : "Om du vill ändra storlek drar du",

	colordialog :
	{
		title		: "Välj färg",
		options	:	"Färgalternativ",
		highlight	: "Framhävning",
		selected	: "Vald färg",
		clear		: "Rensa"
	},

	toolbarCollapse	: "Komprimera verktygsfält",
	toolbarExpand	: "Expandera verktygsfält",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Urklipp/Ångra",
		editing : "Redigering",
		forms : "Formulär",
		basicstyles : "Grundformat",
		paragraph : "Stycke",
		links : "Länkar",
		insert : "Infoga",
		styles : "Format",
		colors : "Färger",
		tools : "Verktyg"
	},

	bidi :
	{
		ltr : "Byt till vänster till höger ",
		rtl : "Byt till höger till vänster "
	},

	docprops :
	{
		label : "Dokumentegenskaper",
		title : "Dokumentegenskaper",
		design : "Design",
		meta : "Metataggar",
		chooseColor : "Välj",
		other : "Övrigt...",
		docTitle :	"Sidrubrik",
		charset : 	"Teckenuppsättning",
		charsetOther : "Annan teckenuppsättning",
		charsetASCII : "ASCII",
		charsetCE : "Centraleuropeisk",
		charsetCT : "Kinesiska (traditionell) (Big5)",
		charsetCR : "Kyrilliska",
		charsetGR : "Grekiska",
		charsetJP : "Japanska",
		charsetKR : "Koreanska",
		charsetTR : "Turkiska",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Västeuropeisk",
		docType : "Dokumenttypsrubrik",
		docTypeOther : "Annan dokumenttypsrubrik",
		xhtmlDec : "Inkludera XHTML-deklarationer",
		bgColor : "Bakgrundsfärg",
		bgImage : "URL till bakgrundsbild",
		bgFixed : "Icke-rullande (fast) bakgrund",
		txtColor : "Textfärg",
		margin : "Sidmarginaler",
		marginTop : "Överkant",
		marginLeft : "Vänster",
		marginRight : "Höger",
		marginBottom : "Underkant",
		metaKeywords : "Nyckelord för dokumentinexering (avgränsa med kommatecken)",
		metaDescription : "Dokumentbeskrivning",
		metaAuthor : "Författare",
		metaCopyright : "Copyright",
		previewHtml : "<p>Detta är <strong>exempeltext</strong>. Du använder <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "tum",
			widthCm	: "centimeter",
			widthMm	: "millimeter",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "punkter",
			widthPc	: "pica"
		},
		table :
		{
			heightUnit	: "Höjdenhet:",
			insertMultipleRows : "Infoga rader",
			insertMultipleCols : "Infoga kolumner",
			noOfRows : "Antal rader:",
			noOfCols : "Antal kolumner:",
			insertPosition : "Position:",
			insertBefore : "Före",
			insertAfter : "Efter",
			selectTable : "Markera tabell",
			selectRow : "Välj rad",
			columnTitle : "Kolumn ",
			colProps : "Kolumnegenskaper",
			invalidColumnWidth	: "Kolumnbredden måste vara ett positivt tal."
		},
		cell :
		{
			title : "Cell"
		},
		emoticon :
		{
			angel		: "Ängel",
			angry		: "Arg",
			cool		: "Cool",
			crying		: "Gråter",
			eyebrow		: "Ögonbryn",
			frown		: "Miner",
			goofy		: "Tokig",
			grin		: "Leende",
			half		: "Halv",
			idea		: "Idé",
			laughing	: "Skrattar",
			laughroll	: "Gapskratt",
			no			: "Nej",
			oops		: "Hoppsan",
			shy			: "Blyg",
			smile		: "Glad min",
			tongue		: "Tunga",
			wink		: "Blinkar med ena ögat",
			yes			: "Ja"
		},

		menu :
		{
			link	: "Infoga länk",
			list	: "Lista",
			paste	: "Klistra in",
			action	: "Åtgärd",
			align	: "Justera",
			emoticon: "Smilisar"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Numrerad lista",
			bulletedTitle		: "Punktlista"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Ange ett beskrivande namn på bokmärket, som 'Avsnitt 1.2'. När du har infogat bokmärket klickar du på antingen ikonen 'Länk' eller 'Länk till dokumentbokmärke' för att länka till det.",
			title		: "Länk till dokumentbokmärke",
			linkTo		: "Länk till:"
		},

		urllink :
		{
			title : "URL-adresslänk",
			linkText : "Länktext:",
			selectAnchor: "Välj ett ankare:",
			nourl: "Ange en URL-adress i textfältet.",
			urlhelp: "Skriv eller klistra in en URL-adress som ska öppnas när användare klickar på länken. Exempel: http://www.företaget.se/.",
			displaytxthelp: "Skriv den text som ska visas i länken.",
			openinnew : "Öppna länken i nytt fönster"
		},

		spellchecker :
		{
			title : "Stavningskontrollera",
			replace : "Ersätt:",
			suggesstion : "Förslag:",
			withLabel : "Med:",
			replaceButton : "Ersätt",
			replaceallButton:"Ersätt alla",
			skipButton:"Ignorera",
			skipallButton: "Ignorera alla",
			undochanges: "Ångra ändringar",
			complete: "Stavningskontrollen är slutförd",
			problem: "Problem med hämtningen av XML-data",
			addDictionary: "Lägg till i ordlista",
			editDictionary: "Redigera katalog"
		},

		status :
		{
			keystrokeForHelp: "Om du vill visa hjälpen trycker du på Alt+0."
		},

		linkdialog :
		{
			label : "Länkdialogruta"
		},

		image :
		{
			previewText : "Texten flödas runt den bild du lägger som i exemplet."
		}
	}

};
