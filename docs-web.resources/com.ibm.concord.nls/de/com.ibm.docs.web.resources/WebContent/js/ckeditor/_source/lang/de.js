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
	editorTitle : "Rich Text-Editor, %1.",

	// ARIA descriptions.
	toolbars	: "Editor-Werkzeugleisten",
	editor	: "Rich-Text-Editor",

	// Toolbar buttons without dialogs.
	source			: "Quelle",
	newPage			: "Neue Seite",
	save			: "Speichern",
	preview			: "Vorschau:",
	cut				: "Ausschneiden",
	copy			: "Kopieren",
	paste			: "Einfügen",
	print			: "Drucken",
	underline		: "Unterstreichen",
	bold			: "Fett",
	italic			: "Kursiv",
	selectAll		: "Alles auswählen",
	removeFormat	: "Formatierung entfernen",
	strike			: "Durchstreichung",
	subscript		: "Tiefgestellt",
	superscript		: "Hochgestellt",
	horizontalrule	: "Horizontale Linie einfügen",
	pagebreak		: "Seitenumbruch einfügen",
	pagebreakAlt		: "Seitenumbruch",
	unlink			: "Verknüpfung entfernen",
	undo			: "Rückgängig",
	redo			: "Wiederholen",

	// Common messages and labels.
	common :
	{
		browseServer	: "Browser-Server:",
		url				: "URL:",
		protocol		: "Protokoll:",
		upload			: "Hochladen:",
		uploadSubmit	: "An Server senden",
		image			: "Bild einfügen",
		flash			: "Flash-Film einfügen",
		form			: "Formular einfügen",
		checkbox		: "Kontrollkästchen einfügen",
		radio			: "Optionsfeld einfügen",
		textField		: "Textfeld einfügen",
		textarea		: "Textbereich einfügen",
		hiddenField		: "Ausgeblendetes Feld einfügen",
		button			: "Schaltfläche einfügen",
		select			: "Auswahlfeld einfügen",
		imageButton		: "Schaltfläche 'Bild' einfügen",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Name:",
		langDir			: "Textausrichtung:",
		langDirLtr		: "Links nach Rechts",
		langDirRtl		: "Rechts nach Links",
		langCode		: "Sprachencode:",
		longDescr		: "URL in Langbeschreibung:",
		cssClass		: "Formatvorlagen-Klassen:",
		advisoryTitle	: "Titel der Empfehlung:",
		cssStyle		: "Formatvorlage:",
		ok				: "OK",
		cancel			: "Abbrechen",
		close : "Schließen",
		preview			: "Vorschau:",
		generalTab		: "Allgemein",
		advancedTab		: "Erweitert",
		validateNumberFailed	: "Dieser Wert ist keine Zahl.",
		confirmNewPage	: "Alle nicht gespeicherten Inhaltsänderungen gehen verloren. Möchten Sie wirklich eine neue Seite laden?",
		confirmCancel	: "Einige Optionen wurden geändert. Möchten Sie den Dialog wirklich schließen?",
		options : "Optionen",
		target			: "Ziel:",
		targetNew		: "Neues Fenster (_blank)",
		targetTop		: "Aktives Fenster (_top)",
		targetSelf		: "Gleiches Fenster (_self)",
		targetParent	: "Übergeordnetes Fenster (_parent)",
		langDirLTR		: "Links nach Rechts",
		langDirRTL		: "Rechts nach Links",
		styles			: "Formatvorlage:",
		cssClasses		: "Formatvorlagen-Klassen:",
		width			: "Breite:",
		height			: "Höhe:",
		align			: "Ausrichten:",
		alignLeft		: "Links",
		alignRight		: "Rechts",
		alignCenter		: "Zentriert",
		alignTop		: "Oben",
		alignMiddle		: "Mitte",
		alignBottom		: "Unten",
		invalidHeight	: "Die Höhe muss eine positive Ganzzahl sein.",
		invalidWidth	: "Die Breite muss eine positive Ganzzahl sein.",
		invalidCssLength	: "Der für das Feld '%1' angegebene Wert muss eine positive Zahl mit oder ohne gültiger CSS-Maßeinheit (px, %, in, cm, mm, em, ex, pt, oder pc) sein.",
		invalidHtmlLength	: "Der für das Feld '%1' angegebene Wert muss eine positive Ganzzahl mit oder ohne gültiger HTML-Maßeinheit (px or %) sein.",
		invalidInlineStyle	: "Der für den Wert angegebene Inline-Stil muss mindestens ein Tupel im Format \'Name : Wert\' getrennt durch Semikola beinhalten.",
		cssLengthTooltip	: "Geben Sie eine Zahl für den Pixelwert an oder eine Zahl mit gültiger CSS-Einheit (px, %, in, cm, mm, em, ex, pt oder pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, nicht verfügbar</span>"
	},

	contextmenu :
	{
		options : "Kontextmenüoptionen"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Sonderzeichen einfügen",
		title		: "Sonderzeichen",
		options : "Sonderzeichenoptionen"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL-Link",
		other 		: "<other>",
		menu		: "Link bearbeiten...",
		title		: "Link",
		info		: "Linkinformationen",
		target		: "Ziel",
		upload		: "Upload:",
		advanced	: "Erweitert",
		type		: "Linktyp:",
		toUrl		: "URL",
		toAnchor	: "Im Text zu verankernder Link",
		toEmail		: "E-Mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Zielrahmenname:",
		targetPopupName	: "Popup-Fenstername:",
		popupFeatures	: "Popup-Fensterfunktionen:",
		popupResizable	: "Größenverstellbar",
		popupStatusBar	: "Statusleiste",
		popupLocationBar	: "Positionsleiste",
		popupToolbar	: "Symbolleiste",
		popupMenuBar	: "Menüleiste",
		popupFullScreen	: "Vollbild (IE)",
		popupScrollBars	: "Bildlaufleiste",
		popupDependent	: "Abhängiges Objekt (Netscape)",
		popupLeft		: "Linke Position",
		popupTop		: "Obere Position",
		id				: "ID:",
		langDir			: "Textausrichtung:",
		langDirLTR		: "Links nach Rechts",
		langDirRTL		: "Rechts nach Links",
		acccessKey		: "Zugriffsschlüssel:",
		name			: "Name:",
		langCode		: "Sprachencode:",
		tabIndex		: "Tabulatorindex:",
		advisoryTitle	: "Titel der Empfehlung:",
		advisoryContentType	: "Inhaltstyp der Empfehlung:",
		cssClasses		: "Formatvorlagen-Klassen:",
		charset			: "Zeichensatz der verlinkten Ressource:",
		styles			: "Formatvorlage:",
		rel			: "Abhängigkeit",
		selectAnchor	: "Anker auswählen",
		anchorName		: "Nach Ankername",
		anchorId		: "Nach Element-ID",
		emailAddress	: "E-Mail-Adresse",
		emailSubject	: "Betreff der Nachricht",
		emailBody		: "Nachrichtentext",
		noAnchors		: "Keine Lesezeichen im Dokument verfügbar. Klicken Sie in der Symbolleiste auf 'Dokumentlesezeichen einfügen', um eines hinzuzufügen.",
		noUrl			: "Geben Sie bitte die Link-URL ein",
		noEmail			: "Geben Sie bitte die E-Mail-Adresse ein"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Dokumentlesezeichen einfügen",
		menu		: "Dokumentlesezeichen bearbeiten",
		title		: "Dokumentlesezeichen",
		name		: "Name:",
		errorName	: "Geben Sie bitte einen Namen für das Dokumentlesezeichen ein",
		remove		: "Dokumentlesezeichen entfernen"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Eigenschaften der nummerierten Liste",
		bulletedTitle		: "Eigenschaften der Liste mit Punkten",
		type				: "Typ",
		start				: "Start",
		validateStartNumber				:"Die Startnummer der Liste muss eine Ganzzahl sein.",
		circle				: "Kreis",
		disc				: "Scheibe",
		square				: "Quadrat",
		none				: "Keine",
		notset				: "<not set>",
		armenian			: "Armenische Nummerierung",
		georgian			: "Georgische Nummerierung(an, ban, gan, usw.)",
		lowerRoman			: "Römische Kleinbuchstaben (i, ii, iii, iv, v, usw.)",
		upperRoman			: "Römische Großbuchstaben (I, II, III, IV, V, usw.)",
		lowerAlpha			: "Kleinbuchstaben (a, b, c, d, e, usw.)",
		upperAlpha			: "Großbuchstaben (A, B, C, D, E, usw.)",
		lowerGreek			: "Griechische Kleinschreibweise (alpha, beta, gamma, usw.)",
		decimal				: "Dezimale Schreibweise (1, 2, 3, usw.)",
		decimalLeadingZero	: "Dezimal mit vorangestellter Null (01, 02, 03, usw.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Suchen und ersetzen",
		find				: "Suchen",
		replace				: "Ersetzen",
		findWhat			: "Suchen nach:",
		replaceWith			: "Ersetzen durch:",
		notFoundMsg			: "Der angegebene Text wurde nicht gefunden.",
		noFindVal			: 'Sie müssen einen zu suchenden Text eingeben.',
		findOptions			: "Suchoptionen",
		matchCase			: "Groß- und Kleinschreibung beachten",
		matchWord			: "Ganzes Wort abgleichen",
		matchCyclic			: "Zyklischer Abgleich",
		replaceAll			: "Alle(s) ersetzen",
		replaceSuccessMsg	: "%1 Vorkommen ersetzt."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Tabelle einfügen",
		title		: "Tabelle",
		menu		: "Tabelleneigenschaften",
		deleteTable	: "Tabelle löschen",
		rows		: "Zeilen:",
		columns		: "Spalten:",
		border		: "Rahmengröße:",
		widthPx		: "Pixel",
		widthPc		: "Prozent",
		widthUnit	: "Einheit der Breite:",
		cellSpace	: "Zellenabstand:",
		cellPad		: "Zellenrandbreite:",
		caption		: "Beschriftung:",
		summary		: "Zusammenfassung:",
		headers		: "Kopfzeilen:",
		headersNone		: "Keine",
		headersColumn	: "Erste Spalte",
		headersRow		: "Erste Zeile",
		headersBoth		: "Beide",
		invalidRows		: "Anzahl der Zeilen muss eine Ganzzahl größer als Null sein.",
		invalidCols		: "Anzahl der Spalten muss eine Ganzzahl größer als Null sein.",
		invalidBorder	: "Rahmengröße muss eine positive Zahl sein.",
		invalidWidth	: "Tabellenbreite muss eine positive Zahl sein.",
		invalidHeight	: "Tabellenhöhe muss eine positive Zahl sein.",
		invalidCellSpacing	: "Zellenabstand muss eine positive Zahl sein.",
		invalidCellPadding	: "Zellenrandbreite muss eine positive Zahl sein.",

		cell :
		{
			menu			: "Zelle",
			insertBefore	: "Zelle davor einfügen",
			insertAfter		: "Zelle danach einfügen",
			deleteCell		: "Zellen löschen",
			merge			: "Zellen verbinden",
			mergeRight		: "Rechts verbinden",
			mergeDown		: "Unten verbinden",
			splitHorizontal	: "Zelle horizontal teilen",
			splitVertical	: "Zelle vertikal teilen",
			title			: "Zelleneigenschaften",
			cellType		: "Zellentyp",
			rowSpan			: "Zeilenzahl:",
			colSpan			: "Spaltenzahl:",
			wordWrap		: "Zeilenumbruch:",
			hAlign			: "Horizontale Ausrichtung:",
			vAlign			: "Vertikale Ausrichtung:",
			alignBaseline	: "Grundlinie",
			bgColor			: "Hintergrundfarbe:",
			borderColor		: "Randfarbe:",
			data			: "Daten",
			header			: "Kopfzeile",
			yes				: "Ja",
			no				: "Nein",
			invalidWidth	: "Zellenbreite muss eine positive Zahl sein.",
			invalidHeight	: "Zellenhöhe muss eine positive Zahl sein.",
			invalidRowSpan	: "Zeilenzahl muss eine positive Ganzzahl sein.",
			invalidColSpan	: "Spaltenzahl muss eine positive Ganzzahl sein.",
			chooseColor : "Farbwahl"
		},

		row :
		{
			menu			: "Zeile",
			insertBefore	: "Zeile davor einfügen",
			insertAfter		: "Zeile danach einfügen",
			deleteRow		: "Zeilen löschen"
		},

		column :
		{
			menu			: "Spalte",
			insertBefore	: "Spalte davor einfügen",
			insertAfter		: "Spalte danach einfügen",
			deleteColumn	: "Spalten löschen"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Schaltflächeneigenschaften",
		text		: "Text (Wert):",
		type		: "Typ:",
		typeBtn		: "Schaltfläche",
		typeSbm		: "Absenden",
		typeRst		: "Zurücksetzen"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Eigenschaften der Kontrollkästchen",
		radioTitle	: "Eigenschaften des Optionsfelds",
		value		: "Wert:",
		selected	: "Ausgewählt"
	},

	// Form Dialog.
	form :
	{
		title		: "Formular einfügen",
		menu		: "Formulareigenschaften",
		action		: "Aktion:",
		method		: "Methode:",
		encoding	: "Verschlüsselung:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Eigenschaften des Auswahlfelds",
		selectInfo	: "Information auswählen",
		opAvail		: "Verfügbare Optionen",
		value		: "Wert:",
		size		: "Größe:",
		lines		: "Linien",
		chkMulti	: "Mehrfachauswahl zulassen",
		opText		: "Text:",
		opValue		: "Wert:",
		btnAdd		: "Hinzufügen",
		btnModify	: "Ändern",
		btnUp		: "Nach oben",
		btnDown		: "Nach unten",
		btnSetValue : "Als ausgewählten Wert festlegen",
		btnDelete	: "Löschen"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Eigenschaften des Textbereichs",
		cols		: "Spalten:",
		rows		: "Zeilen:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Eigenschaften des Textfelds",
		name		: "Name:",
		value		: "Wert:",
		charWidth	: "Zeichenbreite:",
		maxChars	: "Maximale Zeichenzahl:",
		type		: "Typ:",
		typeText	: "Text",
		typePass	: "Kennwort"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Eigenschaften für ausgeblendetes Feld",
		name	: "Name:",
		value	: "Wert:"
	},

	// Image Dialog.
	image :
	{
		title		: "Bild",
		titleButton	: "Eigenschaften der Bild-Schaltfläche",
		menu		: "Bildeigenschaften...",
		infoTab	: "Bildinformationen",
		btnUpload	: "Auf den Server hochladen",
		upload	: "Upload",
		alt		: "Alternativer Text:",
		lockRatio	: "Verhältnis festsetzen",
		resetSize	: "Größe zurücksetzen",
		border	: "Rahmen:",
		hSpace	: "Horizontaler Bereich:",
		vSpace	: "Vertikaler Bereich:",
		alertUrl	: "Geben Sie bitte die Bild-URL ein",
		linkTab	: "Link",
		button2Img	: "Möchten Sie die ausgewählte Bild-Schaltfläche in ein einfaches Bild umwandeln?",
		img2Button	: "Möchten Sie das ausgewählte Bild in eine Bild-Schaltfläche umwandeln?",
		urlMissing : "URL für die Bildquelle fehlt.",
		validateBorder : "Der Rahmen muss eine positive Ganzzahl sein.",
		validateHSpace : "Horizontaler Bereich muss eine positive Ganzzahl sein.",
		validateVSpace : "Vertikaler Bereich muss eine positive Ganzzahl sein."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash-Eigenschaften",
		propertiesTab	: "Eigenschaften",
		title		: "Flash",
		chkPlay		: "Automatische Wiedergabe",
		chkLoop		: "Schleife",
		chkMenu		: "Flash-Menü aktivieren",
		chkFull		: "Gesamtanzeige ermöglichen",
 		scale		: "Maßstab:",
		scaleAll		: "Alle(s) anzeigen",
		scaleNoBorder	: "Kein Rahmen",
		scaleFit		: "Genau einpassen",
		access			: "Skript-Zugriff:",
		accessAlways	: "Immer",
		accessSameDomain	: "Gleiche Domäne",
		accessNever	: "Nie",
		alignAbsBottom: "Ganz unten",
		alignAbsMiddle: "Zentriert",
		alignBaseline	: "Grundlinie",
		alignTextTop	: "Text oben",
		quality		: "Qualität:",
		qualityBest	: "Optimal",
		qualityHigh	: "Hoch",
		qualityAutoHigh	: "Automatisch hoch",
		qualityMedium	: "Mittel",
		qualityAutoLow	: "Automatisch niedrig",
		qualityLow	: "Niedrig",
		windowModeWindow	: "Fenster",
		windowModeOpaque	: "Undurchsichtig",
		windowModeTransparent	: "Transparent",
		windowMode	: "Fenstermodus:",
		flashvars	: "Variable:",
		bgcolor	: "Hintergrundfarbe:",
		hSpace	: "Horizontaler Bereich:",
		vSpace	: "Vertikaler Bereich:",
		validateSrc : "URL darf nicht leer sein.",
		validateHSpace : "Horizontaler Bereich muss eine positive Ganzzahl sein.",
		validateVSpace : "Vertikaler Bereich muss eine positive Ganzzahl sein."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Rechtschreibprüfung",
		title			: "Rechtschreibprüfung",
		notAvailable	: "Der Service ist derzeit leider nicht verfügbar.",
		errorLoading	: "Fehler beim Laden des Anwendungsservice-Hosts: %s.",
		notInDic		: "Nicht im Wörterbuch",
		changeTo		: "Ändern in",
		btnIgnore		: "Ignorieren",
		btnIgnoreAll	: "Alle ignorieren",
		btnReplace		: "Ersetzen",
		btnReplaceAll	: "Alle(s) ersetzen",
		btnUndo			: "Rückgängig",
		noSuggestions	: "- Keine Vorschläge -",
		progress		: "Rechtschreibprüfung wird durchgeführt...",
		noMispell		: "Rechtschreibprüfung abgeschlossen: Keine Rechtschreibfehler gefunden",
		noChanges		: "Rechtschreibprüfung abgeschlossen: Es wurden keine Wörter geändert",
		oneChange		: "Rechtschreibprüfung abgeschlossen: Ein Wort wurde geändert",
		manyChanges		: "Rechtschreibprüfung abgeschlossen: %1 Wörter wurden geändert",
		ieSpellDownload	: "Rechtschreibprüfung nicht installiert. Wollen Sie diese jetzt herunterladen?"
	},

	smiley :
	{
		toolbar	: "Emoticon einfügen",
		title	: "Emoticons",
		options : "Emoticon-Optionen"
	},

	elementsPath :
	{
		eleLabel : "Elementpfad",
		eleTitle : "%1 Element"
	},

	numberedlist : "Nummerierte Liste",
	bulletedlist : "Liste mit Punkten",
	indent : "Einzug vergrößern",
	outdent : "Einzug verkleinern",

	bidi :
	{
		ltr : "Links nach Rechts",
		rtl : "Rechts nach Links",
	},

	justify :
	{
		left : "Linksbündig",
		center : "Zentriert",
		right : "Rechtsbündig",
		block : "Blocksatz"
	},

	blockquote : "Blockzitat",

	clipboard :
	{
		title		: "Einfügen",
		cutError	: "Die Sicherheitseinstellungen des Browsers verhindern automatisches Ausschneiden. Verwenden Sie stattdessen Strg+X auf Ihrer Tastatur.",
		copyError	: "Die Sicherheitseinstellungen des Browsers verhindern automatisches Kopieren. Verwenden Sie stattdessen Strg+C auf Ihrer Tastatur.",
		pasteMsg	: "Mit Strg+V (Cmd+V beim MAC) fügen Sie wieder ein.",
		securityMsg	: "Die Sicherheitsfunktion Ihres Browsers verhindert direktes Einfügen aus der Zwischenablage.",
		pasteArea	: "Einfügebereich"
	},

	pastefromword :
	{
		confirmCleanup	: "Der Text, den Sie einfügen möchten, ist anscheinend aus Word kopiert. Möchten Sie ihn vor dem Einfügen bereinigen?",
		toolbar			: "Selektiv einfügen",
		title			: "Selektiv einfügen",
		error			: "Aufgrund eines internen Fehlers war es nicht möglich, die eingefügten Daten zu bereinigen"
	},

	pasteText :
	{
		button	: "Als unformatierten Text einfügen",
		title	: "Als unformatierten Text einfügen"
	},

	templates :
	{
		button 			: "Vorlagen",
		title : "Inhaltsvorlagen",
		options : "Vorlagen-Optionen",
		insertOption: "Aktuellen Inhalt ersetzen",
		selectPromptMsg: "Wählen Sie die im Editor zu öffnende Vorlage aus",
		emptyListMsg : "(Keine Vorlagen definiert)"
	},

	showBlocks : "Blöcke anzeigen",

	stylesCombo :
	{
		label		: "Formatvorlagen",
		panelTitle 	: "Formatvorlagen",
		panelTitle1	: "Block Styles (Block-Formatvorlagen)",
		panelTitle2	: "Inline Styles (Inline-Formatvorlagen)",
		panelTitle3	: "Object Styles (Object-Formatvorlagen)"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Abschnittformat",

		tag_p		: "Normal",
		tag_pre		: "Formatiert",
		tag_address	: "Adresse",
		tag_h1		: "Überschrift 1",
		tag_h2		: "Überschrift 2",
		tag_h3		: "Überschrift 3",
		tag_h4		: "Überschrift 4",
		tag_h5		: "Überschrift 5",
		tag_h6		: "Überschrift 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Div-Container erstellen",
		toolbar				: "Div-Container erstellen",
		cssClassInputLabel	: "Formatvorlagen-Klassen",
		styleSelectLabel	: "Formatvorlage",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Sprachencode",
		inlineStyleInputLabel	: "Inline-Formatvorlage",
		advisoryTitleInputLabel	: "Titel der Empfehlung",
		langDirLabel		: "Textausrichtung",
		langDirLTRLabel		: "Links nach Rechts",
		langDirRTLLabel		: "Rechts nach Links",
		edit				: "Div bearbeiten",
		remove				: "Div entfernen"
  	},

	iframe :
	{
		title		: "I-Frame-Eigenschaften",
		toolbar		: "I-Frame einfügen",
		noUrl		: "Geben Sie bitte die I-Frame-URL ein",
		scrolling	: "Bildlaufleisten aktivieren",
		border		: "Rahmenumrandung anzeigen"
	},

	font :
	{
		label		: "Schriftart",
		voiceLabel	: "Schriftart",
		panelTitle	: "Schriftartname"
	},

	fontSize :
	{
		label		: "Größe",
		voiceLabel	: "Schriftgrad",
		panelTitle	: "Schriftgrad"
	},

	colorButton :
	{
		textColorTitle	: "Textfarbe",
		bgColorTitle	: "Hintergrundfarbe",
		panelTitle		: "Farben",
		auto			: "Automatisch",
		more			: "Weitere Farben..."
	},

	colors :
	{
		"000" : "Schwarz",
		"800000" : "Kastanienbraun",
		"8B4513" : "Sattelbraun",
		"2F4F4F" : "Dunkles Schiefergrau",
		"008080" : "Blaugrün",
		"000080" : "Marineblau",
		"4B0082" : "Indigo",
		"696969" : "Dunkelgrau",
		"B22222" : "Ziegelrot",
		"A52A2A" : "Braun",
		"DAA520" : "Goldrutengelb",
		"006400" : "Dunkelgrün",
		"40E0D0" : "Türkis",
		"0000CD" : "Mittelblau",
		"800080" : "Purpurrot",
		"808080" : "Grau",
		"F00" : "Rot",
		"FF8C00" : "Dunkelorange",
		"FFD700" : "Gold",
		"008000" : "Grün",
		"0FF" : "Zyanblau",
		"00F" : "Blau",
		"EE82EE" : "Violett",
		"A9A9A9" : "Mattgrau",
		"FFA07A" : "Helles Lachsrot",
		"FFA500" : "Orange",
		"FFFF00" : "Gelb",
		"00FF00" : "Limone",
		"AFEEEE" : "Blasstürkis",
		"ADD8E6" : "Hellblau",
		"DDA0DD" : "Pflaumenblau",
		"D3D3D3" : "Hellgrau",
		"FFF0F5" : "Helles Flieder",
		"FAEBD7" : "Antikweiß",
		"FFFFE0" : "Hellgelb",
		"F0FFF0" : "Honigmelone",
		"F0FFFF" : "Pastellblau",
		"F0F8FF" : "Eisblau",
		"E6E6FA" : "Lavendel",
		"FFF" : "Weiß"
	},

	scayt :
	{
		title			: "Rechtschreibprüfung beim Eintippen (SCAYT)",
		opera_title		: "Wird von Opera nicht unterstützt",
		enable			: "SCAYT aktivieren",
		disable			: "SCAYT inaktivieren",
		about			: "Info zu SCAYT",
		toggle			: "SCAYT ein-/ausschalten",
		options			: "Optionen",
		langs			: "Sprachen",
		moreSuggestions	: "Weitere Vorschläge",
		ignore			: "Ignorieren",
		ignoreAll		: "Alle ignorieren",
		addWord			: "Wort hinzufügen",
		emptyDic		: "Der Wörterbuchname darf nicht leer sein.",

		optionsTab		: "Optionen",
		allCaps			: "Wörter in Großbuchstaben ignorieren",
		ignoreDomainNames : "Domänennamen ignorieren",
		mixedCase		: "Wörter mit Groß-/Kleinschreibung ignorieren",
		mixedWithDigits	: "Wörter mit Zahlen ignorieren",

		languagesTab	: "Sprachen",

		dictionariesTab	: "Wörterbücher",
		dic_field_name	: "Wörterbuchname",
		dic_create		: "Erstellen",
		dic_restore		: "Wiederherstellen",
		dic_delete		: "Löschen",
		dic_rename		: "Umbenennen",
		dic_info		: "Zu Beginn ist das Benutzerwörterbuch in einem Cookie gespeichert. Cookies sind jedoch in ihrer Größe begrenzt. Wenn das Benutzerwörterbuch zu groß für ein Cookie wird, kann es auch auf unserem Server gespeichert werden. Um Ihr persönliches Wörterbuch auf unserem Server zu speichern, müssen Sie einen Namen für Ihr Wörterbuch angeben. Falls Sie bereits ein Wörterbuch gespeichert haben, geben Sie bitte dessen Namen ein und klicken die Schaltfläche für Wiederherstellung.",

		aboutTab		: "Info zu"
	},

	about :
	{
		title		: "Info zu CKEditor",
		dlgTitle	: "Info zu CKEditor",
		help	: "Wählen Sie $1 für Hilfe.",
		userGuide : "CKEditor-Benutzerhandbuch",
		moreInfo	: "Lizenzinformationen finden Sie auf unserer Website:",
		copy		: "Copyright &copy; $1. Alle Rechte vorbehalten."
	},

	maximize : "Maximieren",
	minimize : "Minimieren",

	fakeobjects :
	{
		anchor	: "Anker",
		flash	: "Flash-Animation",
		iframe		: "I-Frame",
		hiddenfield	: "Verdecktes Feld",
		unknown	: "Unbekanntes Objekt"
	},

	resize : "Ziehen, um die Größe zu ändern",

	colordialog :
	{
		title		: "Farbe auswählen",
		options	:	"Farboptionen",
		highlight	: "Hervorheben",
		selected	: "Farbauswahl",
		clear		: "Löschen"
	},

	toolbarCollapse	: "Symbolleiste ausblenden",
	toolbarExpand	: "Symbolleiste einblenden",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Zwischenablage/Rückgängig",
		editing : "Bearbeiten",
		forms : "Formulare",
		basicstyles : "Basis-Formatvorlagen",
		paragraph : "Absatz",
		links : "Links",
		insert : "Einfügen",
		styles : "Formatvorlagen",
		colors : "Farben",
		tools : "Werkzeuge"
	},

	bidi :
	{
		ltr : "Ersetzen durch Textausrichtung Links nach Rechts",
		rtl : "Ersetzen durch Textausrichtung Rechts nach Links "
	},

	docprops :
	{
		label : "Dokumenteigenschaften",
		title : "Dokumenteigenschaften",
		design : "Design",
		meta : "Meta-Tags",
		chooseColor : "Farbwahl",
		other : "Andere...",
		docTitle :	"Seitenüberschrift",
		charset : 	"Zeichensatzcodierung",
		charsetOther : "Andere Zeichensatzcodierung",
		charsetASCII : "ASCII",
		charsetCE : "Mitteleuropäisch",
		charsetCT : "Chinesisch traditionell (Big5)",
		charsetCR : "Kyrillisch",
		charsetGR : "Griechisch",
		charsetJP : "Japanisch",
		charsetKR : "Koreanisch",
		charsetTR : "Türkisch",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Westeuropäisch",
		docType : "Dokumenttyp-Kopfzeile",
		docTypeOther : "Andere Dokumenttyp-Kopfzeile",
		xhtmlDec : "XHTML-Deklarationen einbeziehen",
		bgColor : "Hintergrundfarbe",
		bgImage : "Hintergrundbild-URL",
		bgFixed : "Nicht-scrollbarer (fixierter) Hintergrund",
		txtColor : "Textfarbe",
		margin : "Seitenrand",
		marginTop : "Oben",
		marginLeft : "Links",
		marginRight : "Rechts",
		marginBottom : "Unten",
		metaKeywords : "Schlüsselwörter des Dokumentverzeichnisses, kommagetrennt",
		metaDescription : "Dokumentbeschreibung",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Dies ist ein <strong>Beispieltext</strong>. Sie verwenden <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "Zoll",
			widthCm	: "Zentimeter",
			widthMm	: "Millimeter",
			widthEm	: "Em",
			widthEx	: "Ex",
			widthPt	: "Punkt",
			widthPc	: "Pica"
		},
		table :
		{
			heightUnit	: "Höheneinheit:",
			insertMultipleRows : "Zeilen einfügen",
			insertMultipleCols : "Spalten einfügen",
			noOfRows : "Zeilenanzahl:",
			noOfCols : "Spaltenanzahl:",
			insertPosition : "Position:",
			insertBefore : "Vorher",
			insertAfter : "Danach",
			selectTable : "Tabelle auswählen",
			selectRow : "Zeile auswählen",
			columnTitle : "Spalte",
			colProps : "Spalteneigenschaften",
			invalidColumnWidth	: "Spaltenbreite muss eine positive Zahl sein."
		},
		cell :
		{
			title : "Zelle"
		},
		emoticon :
		{
			angel		: "Engel",
			angry		: "Verärgert",
			cool		: "Cool",
			crying		: "Weinen",
			eyebrow		: "Augenbrauen hochziehen",
			frown		: "Stirnrunzeln",
			goofy		: "Albern",
			grin		: "Grinsen",
			half		: "Halb",
			idea		: "Gedanke",
			laughing	: "Lachen",
			laughroll	: "Lachend am Boden liegen",
			no			: "Nein",
			oops		: "Hoppla",
			shy			: "Schüchtern",
			smile		: "Lächeln",
			tongue		: "Zunge",
			wink		: "Augenzwinkern",
			yes			: "Ja"
		},

		menu :
		{
			link	: "Link einfügen",
			list	: "Liste",
			paste	: "Einfügen",
			action	: "Aktion",
			align	: "Ausrichten",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "I-Frame"
		},

		list:
		{
			numberedTitle		: "Nummerierte Liste",
			bulletedTitle		: "Liste mit Punkten"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Geben Sie einen beschreibenden Lesezeichennamen ein, etwa 'Abschnitt 1.2'. Nach dem Einfügen des Lesezeichens klicken Sie entweder auf 'Link' oder 'Dokumentlesezeichen-Link', um die Verknüpfung herzustellen.",
			title		: "Dokumentlesezeichen-Link",
			linkTo		: "Link zu:"
		},

		urllink :
		{
			title : "URL-Link",
			linkText : "Linktext:",
			selectAnchor: "Einen Anker auswählen:",
			nourl: "Geben Sie eine URL in das Textfeld ein.",
			urlhelp: "Geben oder fügen Sie eine URL ein, die sich beim Klicken des Links öffnet, beispielsweise http://www.example.com.",
			displaytxthelp: "Geben Sie die Textanzeige für den Link ein.",
			openinnew : "Link in einem neuen Fenster öffnen"
		},

		spellchecker :
		{
			title : "Rechtschreibung prüfen",
			replace : "Ersetzen:",
			suggesstion : "Vorschläge:",
			withLabel : "Mit:",
			replaceButton : "Ersetzen",
			replaceallButton:"Alle(s) ersetzen",
			skipButton:"Überspringen",
			skipallButton: "Alle überspringen",
			undochanges: "Änderungen rückgängig machen",
			complete: "Rechtschreibprüfung vollständig",
			problem: "Probleme beim Abrufen der XML-Daten",
			addDictionary: "Zum Wörterbuch hinzufügen",
			editDictionary: "Wörterbuch bearbeiten"
		},

		status :
		{
			keystrokeForHelp: "Drücken Sie ALT-0 um Hilfetext zu erhalten"
		},

		linkdialog :
		{
			label : "Link-Dialog"
		},

		image :
		{
			previewText : "Der Text erscheint wie im Beispiel um das Bild herum."
		}
	}

};
