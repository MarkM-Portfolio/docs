/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2009.
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

CKEDITOR.lang['de'] =
{
	/**
	 * The language reading direction. Possible values are "rtl" for
	 * Right-To-Left languages (like Arabic) and "ltr" for Left-To-Right
	 * languages (like English).
	 * @default 'ltr'
	 */
	/**
	 * #START NON_TRANSLATABLE <for dir: 'ltr'>
	 * Please pay attention to variable 'dir' when tranlating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir as 'rtl' (dir : 'rtl'),
	 * other languages DO NOT need to translate on variable 'dir',leave it as (dir : 'ltr')
	 */	
	dir : 'ltr',
	/**
	 * #END NON_TRANSLATABLE <for dir: 'ltr'>
	 */
	/*
	 * Screenreader titles. Please note that screenreaders are not always capable
	 * of reading non-English words. So be careful while translating it.
	 */
	editorTitle		: 'Rich Text-Editor, %1',

	// Toolbar buttons without dialogs.
	source			: 'Quelle',
	newPage			: 'Neue Seite',
	save			: 'Speichern',
	preview			: 'Vorschau',
	cut				: 'Ausschneiden',
	copy			: 'Kopieren',
	paste			: 'Einfügen',
	print			: 'Drucken',
	underline		: 'Unterstrichen',
	bold			: 'Fett',
	italic			: 'Kursiv',
	selectAll		: 'Alles auswählen',
	removeFormat	: 'Formatierung löschen',
	strike			: 'Durchgestrichen',
	subscript		: 'Tiefgestellt',
	superscript		: 'Hochgestellt',
	horizontalrule	: 'Zeilenumbruch einfügen' /*'Insert Horizontal Line'*/,
	pagebreak		: 'Seitenumbruch einfügen',
	unlink			: 'Verknüpfung entfernen',
	undo			: 'Rückgängig machen',
	redo			: 'Wiederholen',
	// Common messages and labels.
	common :
	{
		browseServer	: 'Server durchsuchen',
		url				: 'URL',
		protocol		: 'Protokoll',
		upload			: 'Upload',
		uploadSubmit	: 'An Server senden',
		image			: 'Bild einfügen',
		form			: 'Formular einfügen',
		checkbox		: 'Kontrollkästchen einfügen',
		radio			: 'Optionsfeld einfügen',
		textField		: 'Textfeld einfügen',
		textarea		: 'Textbereich einfügen',
		hiddenField		: 'Ausgeblendetes Feld einfügen',
		button			: 'Schaltfläche "Einfügen"',
		select			: 'Auswahlfeld "Einfügen"',
		imageButton		: 'Schaltfläche "Bild einfügen"',
		notSet			: '<not set>',
		id				: 'ID:',
		name			: 'Name',
		langDir			: 'Sprachrichtung',
		langDirLtr		: 'Von links nach rechts (LTR)',
		langDirRtl		: 'Von rechts nach links (RTL)',
		langCode		: 'Sprachencode',
		longDescr		: 'Langbeschreibungs-URL',
		cssClass		: 'Formatvorlagenklassen:',
		advisoryTitle	: 'Advisory Title:',
		cssStyle		: 'Formatvorlage:',
		ok				: 'OK',
		cancel			: 'Abbrechen',
		generalTab		: 'Allgemein',
		advancedTab		: 'Erweitert',
		validateNumberFailed	: 'Dieser Wert ist keine Zahl.',
//		confirmNewPage	: 'Any unsaved changes to this content will be lost. Are you sure you want to load a new page?',
		confirmCancel	: 'Möchten Sie wirklich diesen Dialog schließen, ohne Ihre Änderungen zu speichern?',

		// Put the voice-only part of the label in the span.
		unavailable		: '%1<span class="cke_accessibility">, nicht verfügbar</span>'
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: 'Sonderzeichen' /*'Insert Special Character'*/,
		title		: 'Sonderzeichen einfügen'
	},

	// Link dialog.
	link :
	{
		toolbar		: 'Link einfügen' /*'Link'*/,
		menu		: 'Link bearbeiten',
		title		: 'Link hinzufügen',
		info		: 'Linkinformationen',
		targetTab	: 'Ziel',
		upload		: 'Upload',
		advanced	: 'Erweitert',
		type		: 'Linktyp',
		toAnchor	: 'Verknüpfung zu Anker in Text',
		toEmail		: 'E-Mail',
		target		: 'Ziel laden:',
		targetNotSet	: '<not set>',
		targetFrame	: '<frame>',
		targetPopup	: 'Popup-Fenster',
		targetNew	: 'Neues Fenster (_blank)',
		targetTop	: 'Hauptteil des Fensters',
		targetSelf	: 'Gleicher Frame',
		targetParent	: 'Übergeordnetes Fenster (_parent)',
		targetFrameName	: 'Name des Ziels',
		targetPopupName	: 'Name des Popup-Fensters',
		popupFeatures	: 'Popup-Fenster-Funktionen',
		popupResizable	: 'Größe veränderbar',
		popupStatusBar	: 'Statusleiste',
		popupLocationBar	: 'Positionsleiste',
		popupToolbar	: 'Symbolleiste',
		popupMenuBar	: 'Menüleiste',
		popupFullScreen	: 'Vollbild (IE)',
		popupScrollBars	: 'Bildlaufleiste',
		popupDependent	: 'Abhängiges Objekt (Netscape)',
		popupWidth		: 'Breite',
		popupLeft		: 'Linke Position',
		popupHeight		: 'Höhe',
		popupTop		: 'Obere Position',
		id				: 'ID',
		langDir			: 'Sprachrichtung',
		langDirNotSet	: '<not set>',
		langDirLTR		: 'Von links nach rechts',
		langDirRTL		: 'Von rechts nach links',
		acccessKey		: 'Zugriffstaste',
		name			: 'Name',
		langCode		: 'Sprachencode:',
		tabIndex		: 'Tabulatorindex:',
		advisoryTitle	: 'Advisory Title:',
		advisoryContentType	: 'Advisory-Inhaltstyp:',
		cssClasses		: 'Formatvorlagenklassen:',
		charset			: 'Zeichensatz für verlinkte Ressource:',
		styles			: 'Formatvorlage',
		selectAnchor	: 'Anker auswählen',
		anchorName		: 'Nach Ankername',
		anchorId		: 'Nach Element-ID',
		emailAddress	: 'E-Mail-Adresse',
		emailSubject	: 'Betreff der Nachricht',
		emailBody		: 'Nachrichtentext',
		noAnchors		: '(Keine Anker im Dokument verfügbar)',
		noUrl			: 'Geben Sie die Webadresse in das Feld "Web-Link" ein.',
		noEmail			: 'Geben Sie die E-Mail-Adresse ein',
		other			: '<other>'
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: 'Anker',
		menu		: 'Anker bearbeiten',
		title		: 'Ankereigenschaften',
		name		: 'Ankername',
		errorName	: 'Geben Sie den Ankernamen ein'
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: 'Suchen und ersetzen',
		find				: 'Suchen',
		replace				: 'Ersetzen',
		findWhat			: 'Zu suchender Text:',
		replaceWith			: 'Ersetzen durch:',
		notFoundMsg			: 'Der angegebene Text wurde nicht gefunden.',
		matchCase			: 'Groß- und Kleinschreibung abgleichen',
		matchWord			: 'Ganzes Wort abgleichen',
		matchCyclic			: 'Umbruch am Anfang oder Ende',
		replaceAll			: 'Alle(s) ersetzen',
		replaceSuccessMsg	: '%1 Vorkommen ersetzt.'
	},

	// Table Dialog
	table :
	{
		toolbar		: 'Tabelle einfügen' /*'Table'*/,
		title		: 'Tabelleneigenschaften',
		menu		: 'Tabelleneigenschaften',
		deleteTable	: 'Tabelle löschen',
		rows		: 'Zeilen:',
		columns		: 'Spalten:',
		border		: 'Rahmengröße:',
		align		: 'In Blocksatz gesetzt:',
		alignNotSet	: '<Not set>',
		alignLeft	: 'Linksbündig',
		alignCenter	: 'Zentriert',
		alignRight	: 'Rechtsbündig',
		width		: 'Breite:',
		widthPx		: 'Pixel',
		widthPc		: 'Prozent',
		height		: 'Höhe:',
		cellSpace	: 'Zellenabstand:',
		cellPad		: 'Zellenrandbreite:',
		caption		: 'Beschriftung:',
		summary		: 'Zusammenfassung:',
		headers		: 'Kopfzeilen:',
		headersNone		: 'Keine',
		headersColumn	: 'Erste Spalte',
		headersRow		: 'Erste Zeile',
		headersBoth		: 'Beide',
		invalidRows		: 'Zeilenanzahl muss größer als 0 sein.',
		invalidCols		: 'Spaltenanzahl muss größer als 0 sein.',
		invalidBorder	: 'Rahmengröße muss eine Zahl sein.',
		invalidWidth	: 'Tabellenbreite muss eine Zahl sein.',
		invalidHeight	: 'Tabellenhöhe muss eine Zahl sein.',
		invalidCellSpacing	: 'Zellenabstand muss eine Zahl sein.',
		invalidCellPadding	: 'Zellenrandbreite muss eine Zahl sein.',

		cell :
		{
			menu			: 'Zelle',
			insertBefore	: 'Zelle davor einfügen',
			insertAfter		: 'Zelle danach einfügen',
			deleteCell		: 'Zellen löschen',
			merge			: 'Zellen verbinden',
			mergeRight		: 'Rechts verbinden',
			mergeDown		: 'Unten verbinden',
			splitHorizontal	: 'Zelle horizontal teilen',
			splitVertical	: 'Zelle vertikal teilen',
			title			: 'Zelleneigenschaften',
			cellType		: 'Zellentyp',
			rowSpan			: 'Zeilenerstreckung',
			colSpan			: 'Spaltenerstreckung',
			wordWrap		: 'Zeilenumbruch',
			hAlign			: 'Horizontale Ausrichtung',
			vAlign			: 'Vertikale Ausrichtung',
			alignTop		: 'Oben',
			alignMiddle		: 'Mitte',
			alignBottom		: 'Unten',
			alignBaseline	: 'Basislinie',
			bgColor			: 'Hintergrundfarbe',
			borderColor		: 'Rahmenfarbe',
			data			: 'Daten',
			header			: 'Kopfzeile',
			yes				: 'Ja',
			no				: 'Nein',
			invalidWidth	: 'Zellenbreite muss eine Zahl sein.',
			invalidHeight	: 'Zellenhöhe muss eine Zahl sein.',
			invalidRowSpan	: 'Zeilenerstreckung muss eine ganze Zahl sein.',
			invalidColSpan	: 'Spaltenerstreckung muss eine ganze Zahl sein.',
			chooseColor : 'Wählen'
		},

		row :
		{
			menu			: 'Zeile',
			insertBefore	: 'Zeile davor einfügen',
			insertAfter		: 'Zeile danach einfügen',
			deleteRow		: 'Zeilen löschen'
		},

		column :
		{
			menu			: 'Spalte',
			insertBefore	: 'Spalte davor einfügen',
			insertAfter		: 'Spalte danach einfügen',
			deleteColumn	: 'Spalten löschen'
		}
	},

	// Button Dialog.
	button :
	{
		title		: 'Schaltflächeneigenschaften',
		text		: 'Text (Wert)',
		type		: 'Typ',
		typeBtn		: 'Schaltfläche',
		typeSbm		: 'Absenden',
		typeRst		: 'Zurücksetzen'
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : 'Eigenschaften für Kontrollkästchen',
		radioTitle	: 'Eigenschaften für Optionsfeld',
		value		: 'Wert',
		selected	: 'Ausgewählt'
	},

	// Form Dialog.
	form :
	{
		title		: 'Formular einfügen',
		menu		: 'Formulareigenschaften',
		action		: 'Aktion',
		method		: 'Methode',
		encoding	: 'Codierung',
		target		: 'Ziel',
		targetNotSet	: '<not set>',
		targetNew	: 'Neues Fenster (_blank)',
		targetTop	: 'Aktives Fenster (_top)',
		targetSelf	: 'Gleiches Fenster (_self)',
		targetParent	: 'Übergeordnetes Fenster (_parent)'
	},

	// Select Field Dialog.
	select :
	{
		title		: 'Eigenschaften für Auswahlfeld',
		selectInfo	: 'Information auswählen',
		opAvail		: 'Verfügbare Optionen',
		value		: 'Wert',
		size		: 'Größe',
		lines		: 'Linien',
		chkMulti	: 'Mehrfachauswahl zulassen',
		opText		: 'Text',
		opValue		: 'Wert',
		btnAdd		: 'Hinzufügen',
		btnModify	: 'Ändern',
		btnUp		: 'Nach oben',
		btnDown		: 'Nach unten',
		btnSetValue : 'Als ausgewählten Wert festlegen',
		btnDelete	: 'Löschen'
	},

	// Textarea Dialog.
	textarea :
	{
		title		: 'Eigenschaften für Textbereich',
		cols		: 'Spalten',
		rows		: 'Zeilen'
	},

	// Text Field Dialog.
	textfield :
	{
		title		: 'Eigenschaften für Textfeld',
		name		: 'Name',
		value		: 'Wert',
		charWidth	: 'Zeichenbreite',
		maxChars	: 'Zeichen maximal',
		type		: 'Typ',
		typeText	: 'Text',
		typePass	: 'Kennwort'
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: 'Eigenschaften für ausgeblendetes Feld',
		name	: 'Name',
		value	: 'Wert'
	},

	// Image Dialog.
	image :
	{
		title		: 'Bildeigenschaften',
		titleButton	: 'Eigenschaften für Bild-Schaltfläche',
		menu		: 'Bildeigenschaften',
		infoTab	: 'Bildinformationen',
		btnUpload	: 'An Server senden',
		url		: 'URL:',
		upload	: 'Von Dateisystem',
		alt		: 'Alternativtext',
		width		: 'Breite',
		height	: 'Höhe',
		lockRatio	: 'Breiten- und Höhenverhältnis sperren',
		resetSize	: 'Größe zurücksetzen',
		border	: 'Rahmen',
		hSpace	: 'Abstand untereinander',
		vSpace	: 'Vertikaler nebeneinander',
		align		: 'Ausrichten',
		alignLeft	: 'Links',
		alignRight	: 'Rechts',
		preview	: 'Vorschau',
//		alertUrl	: 'Please type the image URL',
//		linkTab	: 'Link',
		button2Img	: 'Möchten Sie die Schaltfläche für das ausgewählte Bild in ein einfaches Bild umwandeln?',
		img2Button	: 'Möchten Sie das ausgewählte Bild in eine Bild-Schaltfläche umwandeln?',
		urlMissing : 'URL für die Bildquelle fehlt.'
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: 'Rechtschreibprüfung' /*'Check Spelling'*/,
		title			: 'Rechtschreibprüfung',
		notAvailable	: 'Der Service ist derzeit leider nicht verfügbar.',
		errorLoading	: 'Fehler beim Laden des Anwendungsservice-Hosts: %s.'
//		notInDic		: 'Not in dictionary',
//		changeTo		: 'Change to',
//		btnIgnore		: 'Ignore',
//		btnIgnoreAll	: 'Ignore All',
//		btnReplace		: 'Replace',
//		btnReplaceAll	: 'Replace All',
//		btnUndo			: 'Undo',
//		noSuggestions	: '- No suggestions -',
//		progress		: 'Spell check in progress...',
//		noMispell		: 'Spell check complete: No misspellings found',
//		noChanges		: 'Spell check complete: No words changed',
//		oneChange		: 'Spell check complete: One word changed',
//		manyChanges		: 'Spell check complete: %1 words changed',
//		ieSpellDownload	: 'Spell checker not installed. Do you want to download it now?'
	},
	
	smiley :
	{
		toolbar	: 'Smileys einfügen' /*'Smiley'*/,
		title	: 'Smileys'
	},

	elementsPath :
	{
		eleTitle : '%1 Element'
	},

	numberedlist : 'Nummerierung',
	bulletedlist : 'Aufzählung',
	//Following change based on feedback from ID team
	//indent : 'Indent Paragraph', 
	indent : 'Einzug',
	//outdent : 'Outdent',
	outdent : 'Einzug verkleinern',

	list :
	{
		disableMutliRangeSel : 'Nummerierungen und Aufzählungszeichen können nicht gleichzeitig unterbrochenen Linien hinzugefügt werden. Versuchen Sie, die Nummerierungen oder Aufzählungszeichen nacheinander einer Linie hinzuzufügen.',
		disableBullet : 'Dem Task-Selektor können keine Nummerierungen oder Aufzählungszeichen hinzugefügt werden. Versuchen Sie, Text auszuwählen ohne die Schaltfläche Aktionen auszuwählen und fügen Sie dann Nummerierungen und Aufzählungszeichen hinzu.'
	},
	
	justify :
	{
		//title: 'Justify',
		left : 'Linksbündig',
		center : 'Zentriert',
		right : 'Rechtsbündig',
		block : 'Blocksatz'
	},

	blockquote : 'Blockquote (Blockzitat)',

	clipboard :
	{
		title		: 'Webbasierte Zwischenablage',
		cutError	: 'Die Sicherheitseinstellungen des Browsers verhindern automatisches Ausschneiden. Verwenden Sie stattdessen die Tastenkombination Strg+X.',
		copyError	: 'Die Sicherheitseinstellungen des Browsers verhindern automatisches Kopieren. Verwenden Sie stattdessen die Tastenkombination Strg+C.',
		pasteError  : 'Aufgrund der Sicherheitseinstellungen Ihres Browsers konnte die Anwendung nicht auf Ihre Zwischenablage zugreifen. Verwenden Sie stattdessen Strg+V auf Ihrer Tastatur.',
		pasteMsg	: '',
		securityMsg	: 'Aufgrund der Sicherheitseinstellungen des Browsers kann die Anwendung nicht auf die Zwischenablage zugreifen. Um auf Ihre Zwischenablage zugreifen zu können, geben Sie Strg+V ein, um den Inhalt in dieses Feld einzufügen und klicken Sie anschließend auf "OK".',
		pasteTableToTableError 	: 'Sie können eine Tabelle nicht innerhalb einer anderen Tabelle erstellen bzw. in diese einfügen.' ,
		pasteMaxMsg : 'Die Inhalte, die Sie einfügen wollen, sind zu groß.'
	},

	pastefromword :
	{
		confirmCleanup : 'Der Text, den Sie einfügen möchten, ist anscheinend aus Word kopiert. Möchten Sie ihn vor dem Einfügen bereinigen?',
		toolbar : 'Aus Word einfügen',
		title : 'Aus Word einfügen',
		error : 'Aufgrund eines internen Fehler war es nicht möglich, die eingefügten Daten zu bereinigen'
	},

	pasteText :
	{
		button : 'Als unformatierten Text einfügen',
		title : 'Als unformatierten Text einfügen'
	},

	templates :
	{
		button : 'Vorlagen',
		title : 'Inhaltsvorlagen',
		insertOption: 'Aktuellen Inhalt ersetzen',
		selectPromptMsg: 'Wählen Sie die im Editor zu öffnende Vorlage aus',
		emptyListMsg : '(Keine Vorlagen definiert)'
	},

	showBlocks : 'Blöcke anzeigen',

	stylesCombo :
	{
		label : 'Formatvorlagen',
		voiceLabel : 'Formatvorlagen',
		panelVoiceLabel : 'Wählen Sie eine Formatvorlage aus. Verwenden Sie dazu die Pfeil- oder Tabulatortasten.',
		panelTitle1 : 'Block Styles (Block-Formatvorlagen)',
		panelTitle2 : 'Inline Styles (Inline-Formatvorlagen)',
		panelTitle3 : 'Object Styles (Object-Formatvorlagen)'
	},

	format :
	{
		//label : 'Format',
		label : '', //for concord, doesn't need the label to show for saving UI real estate
		voiceLabel : 'Format',
		panelTitle : 'Format',
		panelVoiceLabel : 'Wählen Sie ein Absatzformat aus. Verwenden Sie dazu die Pfeiltasten oder die Tabulatortaste.',

		tag_p : 'Normal',
		tag_pre : 'Formatiert',
		tag_address : 'Adresse',
		tag_h1 : 'Überschrift 1',
		tag_h2 : 'Überschrift 2',
		tag_h3 : 'Überschrift 3',
		tag_h4 : 'Überschrift 4',
		tag_h5 : 'Überschrift 5',
		tag_h6 : 'Überschrift 6',
		tag_div : 'Normal (DIV)'
	},

	div :
	{
		title				: 'Div-Container erstellen',
		toolbar				: 'Div-Container erstellen',
//		cssClassInputLabel	: 'Stylesheet Classes',
		styleSelectLabel	: 'Formatvorlage',
//		IdInputLabel		: 'Id',
//		languageCodeInputLabel	: ' Language Code',
//		inlineStyleInputLabel	: 'Inline Style',
//		advisoryTitleInputLabel	: 'Advisory Title',
//		langDirLabel		: 'Language Direction',
//		langDirLTRLabel		: 'Left to Right (LTR)',
//		langDirRTLLabel		: 'Right to Left (RTL)',
		edit				: 'Div bearbeiten',
		remove				: 'Div entfernen'
  	},

	font :
	{
		//label : 'Font',
		label : '', //for concord no need to display label, to save UI realestate
		voiceLabel : 'Schriftart',
		panelTitle : 'Wählen Sie eine Schriftart',
		panelVoiceLabel : 'Wählen Sie eine Schriftart aus. Verwenden Sie dazu die Pfeiltasten oder die Tabulatortaste.'
	},

	fontSize :
	{
		//label : 'Size',
		//id: "P_t_FontSize",
		label : '', //for concord no need to display label, to save UI realestate
		voiceLabel : 'Schriftgrad',
		panelTitle : 'Schriftgrad',
		panelVoiceLabel : 'Wählen Sie einen Schriftgrad aus. Verwenden Sie dazu die Pfeiltasten oder die Tabulatortaste.'
	},

	colorButton :
	{
		textColorTitle : 'Textfarbe',
		bgColorTitle : 'Hintergrundfarbe',
		auto : 'Automatisch',
		more : 'Weitere Farben...',
		backgroundFill: 'Hintergrundfüllbereich'
	},

	colors :
	{
		'000' : 'Schwarz',
		'800000' : 'Kastanienbraun',
		'8B4513' : 'Sattelbraun',
		'2F4F4F' : 'Dunkles Schiefergrau',
		'008080' : 'Blaugrün',
		'000080' : 'Marineblau',
		'4B0082' : 'Indigo',
		'696969' : 'Mattgrau',
		'B22222' : 'Ziegelrot',
		'A52A2A' : 'Braun',
		'DAA520' : 'Goldruten(gelb)',
		'006400' : 'Dunkelgrün',
		'40E0D0' : 'Türkis',
		'0000CD' : 'Mittelblau',
		'800080' : 'Purpurrot',
		'808080' : 'Grau',
		'F00' : 'Rot',
		'FF8C00' : 'Dunkelorange',
		'FFD700' : 'Gold',
		'008000' : 'Grün',
		'0FF' : 'Zyanblau',
		'00F' : 'Blau',
		'EE82EE' : 'Violett',
		'A9A9A9' : 'Dunkelgrau',
		'FFA07A' : 'Helles Lachsrot',
		'FFA500' : 'Orange',
		'FFFF00' : 'Gelb',
		'00FF00' : 'Limone',
		'AFEEEE' : 'Blasstürkis',
		'ADD8E6' : 'Hellblau',
		'DDA0DD' : 'Pflaumenblau',
		'D3D3D3' : 'Hellgrau',
		'FFF0F5' : 'Helles Flieder',
		'FAEBD7' : 'Antikweiß',
		'FFFFE0' : 'Hellgelb',
		'F0FFF0' : 'Honigmelone',
		'F0FFFF' : 'Pastellblau',
		'F0F8FF' : 'Eisblau',
		'E6E6FA' : 'Lavendel',
		'FFF' : 'Weiß'
	},
	scayt :
	{
		title : 'Rechtschreibprüfung beim Eintippen (SCAYT) ',
		enable : 'SCAYT aktivieren',
		disable : 'SCAYT inaktivieren',
		about : 'Info zu SCAYT',
		toggle : 'SCAYT ein-/ausschalten',
		options : 'Optionen',
		langs : 'Sprachen',
		moreSuggestions : 'Weitere Vorschläge',
		ignore : 'Ignorieren',
		ignoreAll : 'Alle ignorieren',
		addWord : 'Wort hinzufügen',
//		emptyDic : 'Dictionary name should not be empty.',
		optionsTab : 'Optionen',
		languagesTab : 'Sprachen',
		dictionariesTab : 'Wörterbücher',
		aboutTab : 'Info zu'
	},

	about :
	{
		title : 'Info zu CKEditor',
		dlgTitle : 'Info zu CKEditor',
		moreInfo : 'Lizenzinformationen finden Sie auf unserer Website:',
		copy : 'Copyright &copy; $1. Alle Rechte vorbehalten.'
	},

	maximize : 'Maximieren',
	minimize : 'Minimieren',

	fakeobjects :
	{
		anchor : 'Anker',
		flash : 'Flash-Animation',
		div : 'Seitenumbruch',
		unknown : 'Unbekanntes Objekt'
	},

	resize : 'Ziehen, um die Größe zu ändern',

	colordialog :
	{
		title : 'Farbe auswählen',
		highlight : 'Hervorheben',
		selected : 'Ausgewählt',
		clear : 'Löschen'
	},
	
	toolbarCollapse : 'Symbolleiste ausblenden',
	toolbarExpand : 'Symbolleiste einblenden',
	targetRemovedWhenDialogOpen : 'Die Aktion kann nicht beendet werden, da das Ziel von einem anderen Editor entfernt wurde.'
};
