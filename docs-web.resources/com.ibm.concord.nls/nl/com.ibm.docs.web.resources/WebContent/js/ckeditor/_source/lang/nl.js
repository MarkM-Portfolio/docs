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
	toolbars	: "Editor-werkbalken",
	editor	: "Rich Text Editor",

	// Toolbar buttons without dialogs.
	source			: "Bron",
	newPage			: "Nieuwe pagina",
	save			: "Opslaan",
	preview			: "Preview:",
	cut				: "Knippen",
	copy			: "Kopiëren",
	paste			: "Plakken",
	print			: "Afdrukken",
	underline		: "Onderstrepen",
	bold			: "Vet",
	italic			: "Cursief",
	selectAll		: "Alles selecteren",
	removeFormat	: "Opmaak verwijderen",
	strike			: "Doorhalen",
	subscript		: "Subscript",
	superscript		: "Superscript",
	horizontalrule	: "Horizontale lijn invoegen",
	pagebreak		: "Paginaeinde invoegen",
	pagebreakAlt		: "Paginaeinde",
	unlink			: "Link verwijderen",
	undo			: "Ongedaan maken",
	redo			: "Opnieuw uitvoeren",

	// Common messages and labels.
	common :
	{
		browseServer	: "Browserserver:",
		url				: "URL:",
		protocol		: "Protocol:",
		upload			: "Uploaden:",
		uploadSubmit	: "Verzenden naar de server",
		image			: "Afbeelding invoegen",
		flash			: "Flash-movie invoegen",
		form			: "Formulier invoegen",
		checkbox		: "Selectievakje invoegen",
		radio			: "Keuzerondje invoegen",
		textField		: "Tekstveld invoegen",
		textarea		: "Tekstgebied invoegen",
		hiddenField		: "Verborgen veld invoegen",
		button			: "Knop invoegen",
		select			: "Keuzeveld invoegen",
		imageButton		: "Afbeeldingsknop invoegen",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Naam:",
		langDir			: "Tekstrichting",
		langDirLtr		: "Links naar rechts",
		langDirRtl		: "Rechts naar links",
		langCode		: "Taalcode:",
		longDescr		: "URL lange beschrijving:",
		cssClass		: "Stijlbladklassen:",
		advisoryTitle	: "Voorgestelde titel:",
		cssStyle		: "Stijl:",
		ok				: "OK",
		cancel			: "Annuleren",
		close : "Sluiten",
		preview			: "Preview:",
		generalTab		: "Algemeen",
		advancedTab		: "Geavanceerd",
		validateNumberFailed	: "Deze waarde is niet een getal.",
		confirmNewPage	: "Alle niet opgeslagen wijzigingen voor deze content gaan verloren. Weet u zeker dat u een nieuwe pagina wilt laden?",
		confirmCancel	: "Een aantal van deze opties is gewijzigd. Weet u zeker dat u het dialoogvenster wilt sluiten?",
		options : "Opties",
		target			: "Doel:",
		targetNew		: "Nieuw venster (_blank)",
		targetTop		: "Bovenste venster (_top)",
		targetSelf		: "Zelfde venster (_self)",
		targetParent	: "Hoofdvenster (_parent)",
		langDirLTR		: "Links naar rechts",
		langDirRTL		: "Rechts naar links",
		styles			: "Stijl:",
		cssClasses		: "Stijlbladklassen:",
		width			: "Breedte:",
		height			: "Hoogte:",
		align			: "Uitlijnen:",
		alignLeft		: "Links",
		alignRight		: "Rechts",
		alignCenter		: "Centreren",
		alignTop		: "Boven",
		alignMiddle		: "Midden",
		alignBottom		: "Onder",
		invalidHeight	: "Hoogte moet een positief geheel getal zijn.",
		invalidWidth	: "Breedte moet een positief geheel getal zijn.",
		invalidCssLength	: "De waarde die u opgeeft in het veld '%1' moet een positief getal zijn met of zonder geldige CSS-maateenheid (px, %, in, cm, mm, em, ex, pt of pc).",
		invalidHtmlLength	: "De waarde die u opgeeft in het veld '%1' moet een positief getal zijn met of zonder geldige HTML-maateenheid (px of %).",
		invalidInlineStyle	: "De waarde die u opgeeft voor de inline stijl, moet bestaan uit een of meer tupels met de indeling \"naam : waarde\", gescheiden met puntkomma's.",
		cssLengthTooltip	: "Geef een getal op voor een waarde in pixels of een getal met een geldige CSS-maateenheid (px, %, in, cm, mm, em, ex, pt of pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, niet beschikbaar</span>"
	},

	contextmenu :
	{
		options : "Contextmenuopties"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Speciaal teken invoegen",
		title		: "Speciaal teken",
		options : "Opties voor speciale tekens"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL-link",
		other 		: "<other>",
		menu		: "Link bewerken...",
		title		: "Link",
		info		: "Linkgegevens",
		target		: "Doel",
		upload		: "Uploaden:",
		advanced	: "Geavanceerd",
		type		: "Linktype:",
		toUrl		: "URL",
		toAnchor	: "Koppelen aan anker in de tekst",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Naam doelframe:",
		targetPopupName	: "Naam voorgrondvenster:",
		popupFeatures	: "Functies voorgrondvenster:",
		popupResizable	: "Verstelbaar formaat",
		popupStatusBar	: "Statusbalk",
		popupLocationBar	: "Locatiebalk",
		popupToolbar	: "Werkbalk",
		popupMenuBar	: "Menubalk",
		popupFullScreen	: "Volledig scherm (IE)",
		popupScrollBars	: "Schuifbalken",
		popupDependent	: "Afhankelijk (Netscape)",
		popupLeft		: "Linkerpositie",
		popupTop		: "Bovenste positie",
		id				: "ID:",
		langDir			: "Tekstrichting",
		langDirLTR		: "Links naar rechts",
		langDirRTL		: "Rechts naar links",
		acccessKey		: "Toegangssleutel:",
		name			: "Naam:",
		langCode		: "Taalcode:",
		tabIndex		: "Tabvolgorde:",
		advisoryTitle	: "Voorgestelde titel:",
		advisoryContentType	: "Voorgesteld contenttype:",
		cssClasses		: "Stijlbladklassen:",
		charset			: "Tekenset gekoppelde resource:",
		styles			: "Stijl:",
		rel			: "Relatie",
		selectAnchor	: "Selecteer een anker",
		anchorName		: "Op ankernaam",
		anchorId		: "Op element-ID",
		emailAddress	: "E-mailadres",
		emailSubject	: "Onderwerp bericht",
		emailBody		: "Berichttekst",
		noAnchors		: "Er zijn geen bladwijzers beschikbaar in het document. Klik op het pictogram 'Documentbladwijzer invoegen' op de werkbalk om er een toe te voegen.",
		noUrl			: "Geef de URL van de link op",
		noEmail			: "Geef het e-mailadres op"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Documentbladwijzer invoegen",
		menu		: "Documentbladwijzer bewerken",
		title		: "Documentbladwijzer",
		name		: "Naam:",
		errorName	: "Geef een naam op voor de documentbladwijzer.",
		remove		: "Documentbladwijzer verwijderen"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Eigenschappen genummerde lijst",
		bulletedTitle		: "Eigenschappen lijst met opsommingstekens",
		type				: "Type",
		start				: "Starten",
		validateStartNumber				:"Eerste nummer van lijst moet een geheel getal zijn.",
		circle				: "Cirkel",
		disc				: "Schijf",
		square				: "Vierkant",
		none				: "Geen",
		notset				: "<not set>",
		armenian			: "Armeense nummering",
		georgian			: "Georgische nummering (an, ban, gan, etc.)",
		lowerRoman			: "Kleine Romeinse cijfers (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Grote Romeinse cijfers (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Kleine letters (a, b, c, d, e, etc.)",
		upperAlpha			: "Hoofdletters (A, B, C, D, E, etc.)",
		lowerGreek			: "Grieks kleine letters (alfa, bèta, gamma, etc.)",
		decimal				: "Decimalen (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimaal met voorafgaande nul (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Zoeken en vervangen",
		find				: "Zoeken",
		replace				: "Vervangen",
		findWhat			: "Zoeken:",
		replaceWith			: "Vervangen door:",
		notFoundMsg			: "De opgegeven tekst is niet gevonden.",
		noFindVal			: 'Zoektekst is vereist.',
		findOptions			: "Zoekopties",
		matchCase			: "Hoofdlettergevoelig",
		matchWord			: "Volledig woord moet overeenkomen",
		matchCyclic			: "Cyclisch zoeken",
		replaceAll			: "Alle vervangen",
		replaceSuccessMsg	: "%1 maal vervangen."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Tabel invoegen",
		title		: "Tabel",
		menu		: "Tabeleigenschappen",
		deleteTable	: "Tabel wissen",
		rows		: "Rijen:",
		columns		: "Kolommen:",
		border		: "Randbreedte:",
		widthPx		: "pixels",
		widthPc		: "procent",
		widthUnit	: "Breedte-eenheid:",
		cellSpace	: "Celspatiëring:",
		cellPad		: "Celopvulling:",
		caption		: "Bijschrift:",
		summary		: "Overzicht:",
		headers		: "Koppen",
		headersNone		: "Geen",
		headersColumn	: "Eerste kolom",
		headersRow		: "Eerste rij",
		headersBoth		: "Beide",
		invalidRows		: "Het aantal rijen moet een positief geheel getal zijn.",
		invalidCols		: "Het aantal kolommen moet een positief geheel getal zijn.",
		invalidBorder	: "Randbreedte moet een positief getal zijn.",
		invalidWidth	: "Tabelbreedte moet een positief getal zijn.",
		invalidHeight	: "Tabelhoogte moet een positief getal zijn.",
		invalidCellSpacing	: "Celspatiëring moet een positief getal zijn.",
		invalidCellPadding	: "Celopvulling moet een positief getal zijn.",

		cell :
		{
			menu			: "Cel",
			insertBefore	: "Cel invoegen voor",
			insertAfter		: "Cel invoegen na",
			deleteCell		: "Cellen wissen",
			merge			: "Cellen samenvoegen",
			mergeRight		: "Rechts samenvoegen",
			mergeDown		: "Omlaag samenvoegen",
			splitHorizontal	: "Cel horizontaal splitsen",
			splitVertical	: "Cel verticaal splitsen",
			title			: "Celeigenschappen",
			cellType		: "Celtype:",
			rowSpan			: "Rijbereik",
			colSpan			: "Kolombereik:",
			wordWrap		: "Automatische terugloop:",
			hAlign			: "Horizontale uitlijning:",
			vAlign			: "Verticale uitlijning:",
			alignBaseline	: "Basislijn",
			bgColor			: "Achtergrondkleur:",
			borderColor		: "Randkleur:",
			data			: "Gegevens",
			header			: "Titel",
			yes				: "Ja",
			no				: "Nee",
			invalidWidth	: "Celbreedte moet een positief getal zijn.",
			invalidHeight	: "Celhoogte moet een positief getal zijn.",
			invalidRowSpan	: "Rijbereik moet een geheel getal zijn.",
			invalidColSpan	: "Kolombereik moet een positief geheel getal zijn.",
			chooseColor : "Kiezen"
		},

		row :
		{
			menu			: "Rij",
			insertBefore	: "Rij invoegen voor",
			insertAfter		: "Rij invoegen na",
			deleteRow		: "Rijen wissen"
		},

		column :
		{
			menu			: "Kolom",
			insertBefore	: "Kolom invoegen voor",
			insertAfter		: "Kolom invoegen na",
			deleteColumn	: "Kolommen wissen"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Knopeigenschappen",
		text		: "Tekst (waarde):",
		type		: "Type:",
		typeBtn		: "Knop",
		typeSbm		: "Verzenden",
		typeRst		: "Opnieuw instellen"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Eigenschappen selectievakje",
		radioTitle	: "Eigenschappen keuzerondje",
		value		: "Waarde:",
		selected	: "Geselecteerd"
	},

	// Form Dialog.
	form :
	{
		title		: "Formulier invoegen",
		menu		: "Formuliereigenschappen",
		action		: "Actie:",
		method		: "Methode:",
		encoding	: "Codering:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Veldeigenschappen selecteren",
		selectInfo	: "Informatie selecteren",
		opAvail		: "Beschikbare opties",
		value		: "Waarde:",
		size		: "Grootte:",
		lines		: "lijnen",
		chkMulti	: "Meerdere selecties toestaan",
		opText		: "Tekst:",
		opValue		: "Waarde:",
		btnAdd		: "Toevoegen",
		btnModify	: "Wijzigen",
		btnUp		: "Omhoog",
		btnDown		: "Omlaag",
		btnSetValue : "Instellen als geselecteerde waarde",
		btnDelete	: "Wissen"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Eigenschappen tekstgebied",
		cols		: "Kolommen:",
		rows		: "Rijen:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Eigenschappen tekstveld",
		name		: "Naam:",
		value		: "Waarde:",
		charWidth	: "Tekenbreedte:",
		maxChars	: "Maximumaantal tekens:",
		type		: "Type:",
		typeText	: "Tekst",
		typePass	: "Wachtwoord"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Eigenschappen verborgen veld",
		name	: "Naam:",
		value	: "Waarde:"
	},

	// Image Dialog.
	image :
	{
		title		: "Afbeelding",
		titleButton	: "Eigenschappen afbeeldingsknop",
		menu		: "Eigenschappen afbeelding...",
		infoTab	: "Afbeeldingsgegevens",
		btnUpload	: "Verzenden naar de server",
		upload	: "Uploaden",
		alt		: "Alternatieve tekst:",
		lockRatio	: "Verhouding vergrendelen",
		resetSize	: "Grootte opnieuw instellen",
		border	: "Kader:",
		hSpace	: "Horizontale ruimte:",
		vSpace	: "Verticale ruimte:",
		alertUrl	: "Typ de afbeeldings-URL",
		linkTab	: "Link",
		button2Img	: "Wilt u de geselecteerde afbeeldingsknop converteren tot een eenvoudige afbeelding?",
		img2Button	: "Wilt u de geselecteerde afbeelding converteren tot een afbeeldingsknop?",
		urlMissing : "Bron-URL van afbeelding ontbreekt.",
		validateBorder : "Kader moet een positief geheel getal zijn.",
		validateHSpace : "Horizontale ruimte moet een positief geheel getal zijn.",
		validateVSpace : "Verticale ruimte moet een positief geheel getal zijn."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash-eigenschappen",
		propertiesTab	: "Eigenschappen",
		title		: "Flash",
		chkPlay		: "Automatisch afspelen",
		chkLoop		: "Lus",
		chkMenu		: "Flash-menu inschakelen",
		chkFull		: "Volledig scherm toestaan",
 		scale		: "Schaal:",
		scaleAll		: "Alles afbeelden",
		scaleNoBorder	: "Geen kader",
		scaleFit		: "Exacte maat",
		access			: "Scripttoegang:",
		accessAlways	: "Altijd",
		accessSameDomain	: "Zelfde domein",
		accessNever	: "Nooit",
		alignAbsBottom: "Abs einde",
		alignAbsMiddle: "Abs midden",
		alignBaseline	: "Basislijn",
		alignTextTop	: "Tekst bovenaan",
		quality		: "Kwaliteit:",
		qualityBest	: "Beste",
		qualityHigh	: "Hoog",
		qualityAutoHigh	: "Automatisch hoog",
		qualityMedium	: "Gemiddeld",
		qualityAutoLow	: "Automatisch laag",
		qualityLow	: "Laag",
		windowModeWindow	: "Venster",
		windowModeOpaque	: "Ondoorzichtig",
		windowModeTransparent	: "Transparant",
		windowMode	: "Venstermodus:",
		flashvars	: "Variabelen:",
		bgcolor	: "Achtergrondkleur:",
		hSpace	: "Horizontale ruimte:",
		vSpace	: "Verticale ruimte:",
		validateSrc : "URL mag niet leeg zijn.",
		validateHSpace : "Horizontale ruimte moet een positief geheel getal zijn.",
		validateVSpace : "Verticale ruimte moet een positief geheel getal zijn."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Spellingcontrole",
		title			: "Spellingcontrole",
		notAvailable	: "De service is helaas niet beschikbaar.",
		errorLoading	: "Fout bij laden van host toepassingsservice: %s.",
		notInDic		: "Niet in woordenboek",
		changeTo		: "Wijzigen in",
		btnIgnore		: "Negeren",
		btnIgnoreAll	: "Alle negeren",
		btnReplace		: "Vervangen",
		btnReplaceAll	: "Alle vervangen",
		btnUndo			: "Ongedaan maken",
		noSuggestions	: "- Geen suggesties -",
		progress		: "Spellingcontrole in uitvoering...",
		noMispell		: "Spellingcontrole voltooid: Geen spelfouten gevonden",
		noChanges		: "Spellingcontrole voltooid: Geen woorden gewijzigd",
		oneChange		: "Spellingcontrole voltooid: Eén woord gewijzigd",
		manyChanges		: "Spellingcontrole voltooid: %1 woorden gewijzigd",
		ieSpellDownload	: "Spellingcontrole is niet geïnstalleerd. Wilt u deze nu downloaden?"
	},

	smiley :
	{
		toolbar	: "Emoticon invoegen",
		title	: "Emoticons",
		options : "Opties voor emoticons"
	},

	elementsPath :
	{
		eleLabel : "Elementenpad",
		eleTitle : "%1-element"
	},

	numberedlist : "Genummerde lijst",
	bulletedlist : "Lijst met opsommingstekens",
	indent : "Inspringing vergroten",
	outdent : "Inspringing verkleinen",

	bidi :
	{
		ltr : "Links naar rechts",
		rtl : "Rechts naar links",
	},

	justify :
	{
		left : "Links uitlijnen",
		center : "Centreren",
		right : "Rechts uitlijnen",
		block : "Uitgevuld uitlijnen"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Plakken",
		cutError	: "De beveiligingsinstellingen van uw browser verhinderen automatisch knippen. Gebruik in plaats daarvan de toetsencombinatie Ctrl+X.",
		copyError	: "De beveiligingsinstellingen van uw browser verhinderen automatisch kopiëren. Gebruik in plaats daarvan de toetsencombinatie Ctrl+C.",
		pasteMsg	: "Druk op Ctrl+V (Cmd+V op MAC) om hieronder te plakken.",
		securityMsg	: "De beveiligingsinstellingen van uw browser verhinderen rechtstreeks plakken vanaf het klembord.",
		pasteArea	: "Gebied plakken"
	},

	pastefromword :
	{
		confirmCleanup	: "De te plakken tekst lijkt te zijn gekopieerd in Word. Wilt u deze tekst opschonen voordat wordt geplakt?",
		toolbar			: "Plakken speciaal",
		title			: "Plakken speciaal",
		error			: "Vanwege een interne fout was het niet mogelijk de te plakken gegevens op te schonen"
	},

	pasteText :
	{
		button	: "Plakken als platte tekst",
		title	: "Plakken als platte tekst"
	},

	templates :
	{
		button 			: "Sjablonen",
		title : "Contentsjablonen",
		options : "Sjabloonopties",
		insertOption: "Feitelijke inhoud vervangen",
		selectPromptMsg: "Selecteer de sjabloon die u wilt openen in de editor",
		emptyListMsg : "(Geen sjablonen gedefinieerd)"
	},

	showBlocks : "Blokken weergeven",

	stylesCombo :
	{
		label		: "Stijlen",
		panelTitle 	: "Stijlen",
		panelTitle1	: "Blokstijlen",
		panelTitle2	: "Inline stijlen",
		panelTitle3	: "Objectstijlen"
	},

	format :
	{
		label		: "Opmaak",
		panelTitle	: "Alineaindeling",

		tag_p		: "Normaal",
		tag_pre		: "Ingedeeld",
		tag_address	: "Adres",
		tag_h1		: "Kop 1",
		tag_h2		: "Kop 2",
		tag_h3		: "Kop 3",
		tag_h4		: "Kop 4",
		tag_h5		: "Kop 5",
		tag_h6		: "Kop 6",
		tag_div		: "Normaal (DIV)"
	},

	div :
	{
		title				: "Div-container maken",
		toolbar				: "Div-container maken",
		cssClassInputLabel	: "Stijlbladklassen",
		styleSelectLabel	: "Stijl",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Taalcode",
		inlineStyleInputLabel	: "Inline stijl",
		advisoryTitleInputLabel	: "Voorgestelde titel",
		langDirLabel		: "Tekstrichting",
		langDirLTRLabel		: "Links naar rechts",
		langDirRTLLabel		: "Rechts naar links",
		edit				: "Div bewerken",
		remove				: "Div verwijderen"
  	},

	iframe :
	{
		title		: "Eigenschappen IFrame",
		toolbar		: "IFrame invoegen",
		noUrl		: "Geef de IFrame-URL op",
		scrolling	: "Schuifbalken inschakelen",
		border		: "Framekader afbeelden"
	},

	font :
	{
		label		: "Lettertype",
		voiceLabel	: "Lettertype",
		panelTitle	: "Lettertypenaam"
	},

	fontSize :
	{
		label		: "Grootte",
		voiceLabel	: "Lettergrootte",
		panelTitle	: "Lettergrootte"
	},

	colorButton :
	{
		textColorTitle	: "Tekstkleur",
		bgColorTitle	: "Achtergrondkleur",
		panelTitle		: "Kleuren",
		auto			: "Automatisch",
		more			: "Meer kleuren..."
	},

	colors :
	{
		"000" : "Zwart",
		"800000" : "Kastanjebruin",
		"8B4513" : "Zadelbruin",
		"2F4F4F" : "Donker blauwgrijs",
		"008080" : "Blauwgroen",
		"000080" : "Marineblauw",
		"4B0082" : "Indigo",
		"696969" : "Donkergrijs",
		"B22222" : "Vuursteen",
		"A52A2A" : "Bruin",
		"DAA520" : "Guldenroede",
		"006400" : "Donkergroen",
		"40E0D0" : "Turquoise",
		"0000CD" : "Middelblauw",
		"800080" : "Paars",
		"808080" : "Gijs",
		"F00" : "Rood",
		"FF8C00" : "Donkeroranje",
		"FFD700" : "Goudkleurig",
		"008000" : "Groen",
		"0FF" : "Cyaan",
		"00F" : "Blauw",
		"EE82EE" : "Violet",
		"A9A9A9" : "Middelgrijs",
		"FFA07A" : "Licht zalmkleurig",
		"FFA500" : "Sinaasappel",
		"FFFF00" : "Geel",
		"00FF00" : "Limoen",
		"AFEEEE" : "Lichtturquoise",
		"ADD8E6" : "Lichtblauw",
		"DDA0DD" : "Donkerrood",
		"D3D3D3" : "Lichtgrijs",
		"FFF0F5" : "Lavendelroze",
		"FAEBD7" : "Antiekwit",
		"FFFFE0" : "Lichtgeel",
		"F0FFF0" : "Honingwit",
		"F0FFFF" : "Hemelsblauw",
		"F0F8FF" : "Zachtblauw",
		"E6E6FA" : "Lavendel",
		"FFF" : "Wit"
	},

	scayt :
	{
		title			: "Spellingcontrole terwijl u typt",
		opera_title		: "Niet ondersteund door Opera",
		enable			: "SCAYT inschakelen",
		disable			: "SCAYT uitschakelen",
		about			: "SCAYT - Info",
		toggle			: "SCAYT afwisselen",
		options			: "Opties",
		langs			: "Talen",
		moreSuggestions	: "Meer suggesties",
		ignore			: "Negeren",
		ignoreAll		: "Alle negeren",
		addWord			: "Woord toevoegen",
		emptyDic		: "Naam van woordenboek mag niet leeg zijn.",

		optionsTab		: "Opties",
		allCaps			: "Woorden in hoofdletters negeren",
		ignoreDomainNames : "Domeinnamen negeren",
		mixedCase		: "Woorden met hoofd- en kleine letters negeren",
		mixedWithDigits	: "Woorden met getallen negeren",

		languagesTab	: "Talen",

		dictionariesTab	: "Woordenboeken",
		dic_field_name	: "Naam woordenboek",
		dic_create		: "Maken",
		dic_restore		: "Herstellen",
		dic_delete		: "Wissen",
		dic_rename		: "Naam wijzigen",
		dic_info		: "In eerste instantie wordt het gebruikerswoordenboek opgeslagen in een cookie. De grootte van cookies is echter beperkt. Als het gebruikerswoordenboek zo groot is geworden dat het niet meer kan worden opgeslagen in een cookie, kan het woordenboek worden opgeslagen op onze server. Om uw persoonlijke woordenboek op onze server op te slaan, moet u een naam opgeven voor het woordenboek. Als u al een opgeslagen woordenboek hebt, typ dan de naam ervan en klik op de knop Herstellen.",

		aboutTab		: "Info"
	},

	about :
	{
		title		: "CKEditor - Info",
		dlgTitle	: "CKEditor - Info",
		help	: "Selecteer $1 voor Help.",
		userGuide : "CKEditor Gebruikershandleiding",
		moreInfo	: "Voor licentiegegevens bezoekt u onze website:",
		copy		: "Copyright &copy; $1. Alle rechten voorbehouden."
	},

	maximize : "Maximaliseren",
	minimize : "Minimaliseren",

	fakeobjects :
	{
		anchor	: "Anker",
		flash	: "Flash-animatie",
		iframe		: "IFrame",
		hiddenfield	: "Verborgen veld",
		unknown	: "Onbekend object"
	},

	resize : "Slepen voor wijzigen formaat",

	colordialog :
	{
		title		: "Kleur selecteren",
		options	:	"Kleuropties",
		highlight	: "Accentueren",
		selected	: "Geselecteerde kleur",
		clear		: "Wissen"
	},

	toolbarCollapse	: "Werkbalk samenvouwen",
	toolbarExpand	: "Werkbalk uitvouwen",

	toolbarGroups :
	{
		document : "Document",
		clipboard : "Klembord/Ongedaan maken",
		editing : "Bewerken",
		forms : "Formulieren",
		basicstyles : "Basisstijlen",
		paragraph : "Alinea",
		links : "Links",
		insert : "Invoegen",
		styles : "Stijlen",
		colors : "Kleuren",
		tools : "Extra"
	},

	bidi :
	{
		ltr : "Wijzigen in Links naar rechts",
		rtl : "Wijzigen in Rechts naar links"
	},

	docprops :
	{
		label : "Documenteigenschappen",
		title : "Documenteigenschappen",
		design : "Ontwerp",
		meta : "Metatags",
		chooseColor : "Kiezen",
		other : "Overig...",
		docTitle :	"Paginatitel",
		charset : 	"Codering tekenset",
		charsetOther : "Alternatieve codering tekenset",
		charsetASCII : "ASCII",
		charsetCE : "Centraal-Europees",
		charsetCT : "Traditioneel Chinees (Big5)",
		charsetCR : "Cyrillisch",
		charsetGR : "Grieks",
		charsetJP : "Japans",
		charsetKR : "Koreaans",
		charsetTR : "Turks",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "West-Europees",
		docType : "Documenttypekop",
		docTypeOther : "Alternatieve documenttypekop",
		xhtmlDec : "Inclusief XHTML-declaraties",
		bgColor : "Achtergrondkleur",
		bgImage : "URL voor achtergrondafbeelding",
		bgFixed : "Vaste achtergrond",
		txtColor : "Tekstkleur",
		margin : "Paginamarges",
		marginTop : "Boven",
		marginLeft : "Links",
		marginRight : "Rechts",
		marginBottom : "Onder",
		metaKeywords : "Documentindexen (gescheiden met komma's)",
		metaDescription : "Documentbeschrijving",
		metaAuthor : "Auteur",
		metaCopyright : "Copyright",
		previewHtml : "<p>Dit is een <strong>voorbeeldtekst</strong>. U gebruikt <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inches",
			widthCm	: "centimeters",
			widthMm	: "millimeters",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "punten",
			widthPc	: "pica's"
		},
		table :
		{
			heightUnit	: "Hoogte-eenheid:",
			insertMultipleRows : "Rijen invoegen",
			insertMultipleCols : "Kolommen invoegen",
			noOfRows : "Aantal rijen:",
			noOfCols : "Aantal kolommen:",
			insertPosition : "Positie:",
			insertBefore : "Voor",
			insertAfter : "Na",
			selectTable : "Tabel selecteren",
			selectRow : "Rij selecteren",
			columnTitle : "Kolom",
			colProps : "Kolomeigenschappen",
			invalidColumnWidth	: "Kolombreedte moet een positief getal zijn."
		},
		cell :
		{
			title : "Cel"
		},
		emoticon :
		{
			angel		: "Engel",
			angry		: "Boos",
			cool		: "Cool",
			crying		: "Huilend",
			eyebrow		: "Wenkbrauw",
			frown		: "Frons",
			goofy		: "Goofy",
			grin		: "Grijns",
			half		: "Half",
			idea		: "Idee",
			laughing	: "Lachend",
			laughroll	: "Schaterend",
			no			: "Nee",
			oops		: "Oeps",
			shy			: "Verlegen",
			smile		: "Glimlach",
			tongue		: "Tong",
			wink		: "Knipoog",
			yes			: "Ja"
		},

		menu :
		{
			link	: "Link invoegen",
			list	: "Lijst",
			paste	: "Plakken",
			action	: "Actie",
			align	: "Uitlijnen",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Genummerde lijst",
			bulletedTitle		: "Lijst met opsommingstekens"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Geef een beschrijving voor de bladwijzer op, zoals 'Paragraaf 1.2'. Klik na toevoeging van de bladwijzer op het pictogram 'Link' of 'Link voor documentbladwijzer' om deze te openen.",
			title		: "Link voor documentbladwijzer",
			linkTo		: "Link naar:"
		},

		urllink :
		{
			title : "URL-link",
			linkText : "Linktekst:",
			selectAnchor: "Selecteer een anker",
			nourl: "Geef een URL op in het tekstveld.",
			urlhelp: "Typ of plak een URL die moet worden geopend wanneer gebruikers klikken op deze link, bijvoorbeeld http://www.voorbeeld.com.",
			displaytxthelp: "Typ de tekstweergave voor de link.",
			openinnew : "Link openen in nieuw venster"
		},

		spellchecker :
		{
			title : "Spelling controleren",
			replace : "Vervangen:",
			suggesstion : "Suggesties:",
			withLabel : "Met:",
			replaceButton : "Vervangen",
			replaceallButton:"Alle vervangen",
			skipButton:"Overslaan",
			skipallButton: "Alles overslaan",
			undochanges: "Wijzigingen ongedaan maken",
			complete: "Spellingcontrole voltooid",
			problem: "Probleem bij ophalen van XML-gegevens",
			addDictionary: "Toevoegen aan woordenboek",
			editDictionary: "Woordenboek bewerken"
		},

		status :
		{
			keystrokeForHelp: "Druk op Alt-0 voor Help-informatie"
		},

		linkdialog :
		{
			label : "Linkvenster"
		},

		image :
		{
			previewText : "Tekst wordt rondom de door u toegevoegde afbeelding weergegeven, zoals in dit voorbeeld."
		}
	}

};
