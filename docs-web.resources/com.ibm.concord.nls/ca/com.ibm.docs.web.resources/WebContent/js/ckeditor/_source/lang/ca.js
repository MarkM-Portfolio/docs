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
	editorTitle : "Editor de text enriquit, %1.",

	// ARIA descriptions.
	toolbars	: "Barres d\'eines d\'editor",
	editor	: "Editor de text enriquit",

	// Toolbar buttons without dialogs.
	source			: "Origen",
	newPage			: "Pàgina nova",
	save			: "Desa",
	preview			: "Visualització prèvia:",
	cut				: "Retalla",
	copy			: "Copia",
	paste			: "Enganxa",
	print			: "Imprimeix",
	underline		: "Subratlla",
	bold			: "Negreta",
	italic			: "Cursiva",
	selectAll		: "Selecciona\'ls tots",
	removeFormat	: "Elimina format",
	strike			: "Ratllat",
	subscript		: "Subíndex",
	superscript		: "Superíndex",
	horizontalrule	: "Insereix una línia horitzontal",
	pagebreak		: "Insereix un salt de pàgina",
	pagebreakAlt		: "Salt de pàgina",
	unlink			: "Elimina enllaç",
	undo			: "Desfés",
	redo			: "Refés",

	// Common messages and labels.
	common :
	{
		browseServer	: "Servidor del navegador:",
		url				: "URL:",
		protocol		: "Protocol:",
		upload			: "Carrega:",
		uploadSubmit	: "Envia\'l al servidor",
		image			: "Insereix imatge",
		flash			: "Insereix pel·lícula Flash",
		form			: "Insereix un formulari",
		checkbox		: "Insereix un quadre de selecció",
		radio			: "Insereix un botó d\'opció",
		textField		: "Insereix camp de text",
		textarea		: "Insereix àrea de text",
		hiddenField		: "Insereix un camp ocult",
		button			: "Insereix un botó",
		select			: "Insereix un camp de selecció",
		imageButton		: "Insereix un botó d\'imatge",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Nom:",
		langDir			: "Direcció del text:",
		langDirLtr		: "D'esquerra a dreta",
		langDirRtl		: "De dreta a esquerra",
		langCode		: "Codi de l\'idioma:",
		longDescr		: "URL de descripció llarga:",
		cssClass		: "Classes de full d\'estil:",
		advisoryTitle	: "Títol informatiu:",
		cssStyle		: "Estil:",
		ok				: "D\'acord",
		cancel			: "Cancel·la",
		close : "Tanca",
		preview			: "Visualització prèvia:",
		generalTab		: "General",
		advancedTab		: "Avançat",
		validateNumberFailed	: "Aquest valor no és un número.",
		confirmNewPage	: "Qualsevol canvi sense desar a aquest contingut es perdrà. Esteu segur que voleu carregar una pàgina nova?",
		confirmCancel	: "Algunes de les opcions han canviat. Esteu segur que voleu tancar el diàleg?",
		options : "Opcions",
		target			: "Destinació:",
		targetNew		: "Finestra nova (_blank)",
		targetTop		: "Finestra a la part superior (_top)",
		targetSelf		: "Mateixa finestra (_self)",
		targetParent	: "Finestra pare (_parent)",
		langDirLTR		: "D'esquerra a dreta",
		langDirRTL		: "De dreta a esquerra",
		styles			: "Estil:",
		cssClasses		: "Classes de full d\'estil:",
		width			: "Amplada:",
		height			: "Alçada:",
		align			: "Alineació:",
		alignLeft		: "Esquerra",
		alignRight		: "Dreta",
		alignCenter		: "Centre",
		alignTop		: "Superior",
		alignMiddle		: "Mig",
		alignBottom		: "Inferior",
		invalidHeight	: "L'alçada ha de ser un número enter positiu.",
		invalidWidth	: "L'amplada ha de ser un número enter positiu.",
		invalidCssLength	: "El valor especificat per al camp '%1' ha de ser un número positiu amb o sense una unitat de mesura CSS vàlida (px, %, in, cm, mm, em, ex, pt, o pc).",
		invalidHtmlLength	: "El valor especificat per al camp '%1' ha de ser un número positiu amb o sense una unitat de mesura HTML vàlida (px o %).",
		invalidInlineStyle	: "El valor especificat per a l\'estil en línia ha de tenir un o més tuples amb el format de \"nom: valor\", separades per punt i coma.",
		cssLengthTooltip	: "Escriviu un número per un valor en píxels o un número amb una unitat CSS vàlida (px, %, in, cm, mm, em, ex, pt, o pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, no disponible</span>"
	},

	contextmenu :
	{
		options : "Opcions del menú contextual"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Insereix caràcter especial",
		title		: "Caràcter especial",
		options : "Opcions de caràcters especials"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Enllaç de l\'URL",
		other 		: "<other>",
		menu		: "Edita enllaç...",
		title		: "Enllaç",
		info		: "Informació de l\'enllaç",
		target		: "Destinació",
		upload		: "Carrega:",
		advanced	: "Avançat",
		type		: "Tipus d\'enllaç:",
		toUrl		: "URL",
		toAnchor	: "Enllaç amb àncora del text",
		toEmail		: "Correu electrònic",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nom del marc de destinació:",
		targetPopupName	: "Nom de la finestra emergent:",
		popupFeatures	: "Característiques de la finestra emergent:",
		popupResizable	: "Mida ajustable",
		popupStatusBar	: "Barra d\'estat",
		popupLocationBar	: "Barra d\'ubicació",
		popupToolbar	: "Barra d\'eines",
		popupMenuBar	: "Barra de menú",
		popupFullScreen	: "Pantalla completa (IE)",
		popupScrollBars	: "Barres de desplaçament",
		popupDependent	: "Dependent (Netscape)",
		popupLeft		: "Posició esquerra",
		popupTop		: "Posició a la part superior",
		id				: "ID:",
		langDir			: "Direcció del text:",
		langDirLTR		: "D'esquerra a dreta",
		langDirRTL		: "De dreta a esquerra",
		acccessKey		: "Clau d\'accés:",
		name			: "Nom:",
		langCode		: "Codi de l\'idioma:",
		tabIndex		: "Índex de pestanyes:",
		advisoryTitle	: "Títol informatiu:",
		advisoryContentType	: "Tipus de contingut informatiu:",
		cssClasses		: "Classes de full d\'estil:",
		charset			: "Codificació de caràcters de recursos enllaçats:",
		styles			: "Estil:",
		rel			: "Relació",
		selectAnchor	: "Selecciona una àncora",
		anchorName		: "Per nom de l\'àncora",
		anchorId		: "Per ID de l\'element",
		emailAddress	: "Adreça de correu electrònic",
		emailSubject	: "Tema del missatge",
		emailBody		: "Cos del missatge",
		noAnchors		: "No hi ha adreces d\'interès disponibles en el document. Feu clic a la icona \"Insereix adreça d\'interès del document\" a la barra d\'eines per afegir-ne una.",
		noUrl			: "Escriviu l\'URL de l\'enllaç",
		noEmail			: "Escriviu l\'adreça de correu electrònic"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Insereix adreça d\'interès del document",
		menu		: "Edita adreça d\'interès del document",
		title		: "Adreça d\'interès del document",
		name		: "Nom:",
		errorName	: "Introduïu un nom per a l\'adreça d\'interès del document.",
		remove		: "Elimina adreça d\'interès del document"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Propietats de la llista numerada",
		bulletedTitle		: "Propietats de la llista amb vinyetes",
		type				: "Tipus",
		start				: "Inici",
		validateStartNumber				:"El número d\'inici de la llista ha de ser un número enter.",
		circle				: "Cercle",
		disc				: "Disc",
		square				: "Quadrat",
		none				: "Cap",
		notset				: "<not set>",
		armenian			: "Numeració armènia",
		georgian			: "Numeració georgiana (an, ban, gan, etc.)",
		lowerRoman			: "Números romans en minúscula (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Números romans en majúscula (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Alfabet en minúscula (a, b, c, d, e, etc.)",
		upperAlpha			: "Alfabet en majúscula (A, B, C, D, E, etc.)",
		lowerGreek			: "Alfabet grec en minúscula (alpha, beta, gamma, etc.)",
		decimal				: "Decimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimal amb zero inicial (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Cerca i substitueix",
		find				: "Cerca",
		replace				: "Substitueix",
		findWhat			: "Cerca:",
		replaceWith			: "Substitueix per:",
		notFoundMsg			: "El text especificat no s\'ha trobat.",
		noFindVal			: 'El text per trobar és necessari.',
		findOptions			: "Opcions de cerca",
		matchCase			: "Coincidència de majúscules i minúscules",
		matchWord			: "Coincidència de tota la paraula",
		matchCyclic			: "Coincidència cíclica",
		replaceAll			: "Substitueix tot",
		replaceSuccessMsg	: "%1 aparició(ns) substituïda(es)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Insereix una taula",
		title		: "Taula",
		menu		: "Propietats de la taula",
		deleteTable	: "Suprimeix la taula",
		rows		: "Files:",
		columns		: "Columnes:",
		border		: "Mida del contorn:",
		widthPx		: "píxels",
		widthPc		: "percentatge",
		widthUnit	: "Unitat d\'amplada:",
		cellSpace	: "Espaiat entre cel·les:",
		cellPad		: "Marge de cel·les:",
		caption		: "Llegenda:",
		summary		: "Resum:",
		headers		: "Capçaleres:",
		headersNone		: "Cap",
		headersColumn	: "Primera columna",
		headersRow		: "Primera fila",
		headersBoth		: "Ambdós",
		invalidRows		: "El número de files ha de ser un número enter més gran que zero.",
		invalidCols		: "El número de columnes ha de ser un número enter més gran que zero.",
		invalidBorder	: "La mida del contorn ha de ser un número positiu.",
		invalidWidth	: "L'amplada de la taula ha de ser un número positiu.",
		invalidHeight	: "L'alçada de la taula ha de ser un número positiu.",
		invalidCellSpacing	: "L'espaiat entre cel·les ha de ser un número positiu.",
		invalidCellPadding	: "El marge de cel·les ha de ser un número positiu.",

		cell :
		{
			menu			: "Cel·la",
			insertBefore	: "Insereix una cel·la abans",
			insertAfter		: "Insereix una cel·la després",
			deleteCell		: "Suprimeix cel·les",
			merge			: "Combina cel·les",
			mergeRight		: "Combina a la dreta",
			mergeDown		: "Combina cap avall",
			splitHorizontal	: "Divideix la cel·la horitzontalment",
			splitVertical	: "Divideix la cel·la verticalment",
			title			: "Propietats de la cel·la",
			cellType		: "Tipus de cel·la:",
			rowSpan			: "Lapse de files:",
			colSpan			: "Lapse de columnes:",
			wordWrap		: "Ajustament automàtic del text:",
			hAlign			: "Alineació horitzontal:",
			vAlign			: "Alineació vertical:",
			alignBaseline	: "Línia de base",
			bgColor			: "Color de fons",
			borderColor		: "Color del contorn:",
			data			: "Dades",
			header			: "Capçalera",
			yes				: "Sí",
			no				: "No",
			invalidWidth	: "L'amplada de la cel·la ha de ser un número positiu.",
			invalidHeight	: "L'alçada de la cel·la ha de ser un número positiu.",
			invalidRowSpan	: "El lapse de files ha de ser un número enter positiu.",
			invalidColSpan	: "El lapse de columnes ha de ser un número enter positiu.",
			chooseColor : "Tria"
		},

		row :
		{
			menu			: "Fila",
			insertBefore	: "Insereix una fila abans",
			insertAfter		: "Insereix una fila després",
			deleteRow		: "Suprimeix files"
		},

		column :
		{
			menu			: "Columna",
			insertBefore	: "Insereix una columna abans",
			insertAfter		: "Insereix una columna després",
			deleteColumn	: "Suprimeix columnes"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Propietats del botó",
		text		: "Text (Valor):",
		type		: "Tipus:",
		typeBtn		: "Botó",
		typeSbm		: "Tramet",
		typeRst		: "Restableix"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Propietats del quadre de selecció",
		radioTitle	: "Propietats del botó d\'opció",
		value		: "Valor:",
		selected	: "Seleccionat"
	},

	// Form Dialog.
	form :
	{
		title		: "Insereix un formulari",
		menu		: "Propietats del formulari",
		action		: "Acció:",
		method		: "Mètode:",
		encoding	: "Codificació:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Selecciona les propietats del camp",
		selectInfo	: "Selecciona la informació",
		opAvail		: "Opcions disponibles",
		value		: "Valor:",
		size		: "Mida:",
		lines		: "línies",
		chkMulti	: "Permet diverses seleccions",
		opText		: "Text:",
		opValue		: "Valor:",
		btnAdd		: "Afegeix",
		btnModify	: "Modifica",
		btnUp		: "Amunt",
		btnDown		: "Cap avall",
		btnSetValue : "Defineix com a valor seleccionat",
		btnDelete	: "Suprimeix"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Propietats de l\'àrea de text",
		cols		: "Columnes:",
		rows		: "Files:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Propietats del camp de text",
		name		: "Nom:",
		value		: "Valor:",
		charWidth	: "Amplada del caràcter:",
		maxChars	: "Nombre màxim de caràcters:",
		type		: "Tipus:",
		typeText	: "Text",
		typePass	: "Contrasenya"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Propietats del camp ocult",
		name	: "Nom:",
		value	: "Valor:"
	},

	// Image Dialog.
	image :
	{
		title		: "Imatge",
		titleButton	: "Propietats del botó d\'imatge",
		menu		: "Propietats de la imatge...",
		infoTab	: "Informació de la imatge",
		btnUpload	: "Envia\'l al servidor",
		upload	: "Carrega",
		alt		: "Text alternatiu:",
		lockRatio	: "Bloca la proporció",
		resetSize	: "Restableix la mida",
		border	: "Contorn:",
		hSpace	: "Espai horitzontal:",
		vSpace	: "Espai vertical:",
		alertUrl	: "Escriviu l\'URL de la imatge",
		linkTab	: "Enllaç",
		button2Img	: "Voleu transformar el botó d\'imatge seleccionat en una simple imatge?",
		img2Button	: "Voleu transformar el botó seleccionat en un botó d\'imatge?",
		urlMissing : "Falta l\'URL d\'origen de la imatge.",
		validateBorder : "El contorn ha de ser un número enter positiu.",
		validateHSpace : "L'espai horitzontal ha de ser un número enter positiu.",
		validateVSpace : "L'espai vertical ha de ser un número enter positiu."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Propietats de Flash",
		propertiesTab	: "Propietats",
		title		: "Flash",
		chkPlay		: "Reproducció automàtica",
		chkLoop		: "Bucle",
		chkMenu		: "Habilita menú Flash",
		chkFull		: "Habilita la pantalla completa",
 		scale		: "Escala:",
		scaleAll		: "Mostra-ho tot",
		scaleNoBorder	: "Sense contorns",
		scaleFit		: "Ajustament exacte",
		access			: "Accés d\'script:",
		accessAlways	: "Sempre",
		accessSameDomain	: "Mateix domini",
		accessNever	: "Mai",
		alignAbsBottom: "Part més inferior",
		alignAbsMiddle: "Just al mig",
		alignBaseline	: "Línia de base",
		alignTextTop	: "Text a la part superior",
		quality		: "Qualitat:",
		qualityBest	: "Millor",
		qualityHigh	: "Alta",
		qualityAutoHigh	: "Alta automàtica",
		qualityMedium	: "Mitjà",
		qualityAutoLow	: "Baixa automàtica",
		qualityLow	: "Baixa",
		windowModeWindow	: "Finestra",
		windowModeOpaque	: "Opaca",
		windowModeTransparent	: "Transparent",
		windowMode	: "Mode de finestra:",
		flashvars	: "Variables:",
		bgcolor	: "Color de fons",
		hSpace	: "Espai horitzontal:",
		vSpace	: "Espai vertical:",
		validateSrc : "L\'URL no pot ser buit.",
		validateHSpace : "L'espai horitzontal ha de ser un número enter positiu.",
		validateVSpace : "L'espai vertical ha de ser un número enter positiu."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Correcció ortogràfica",
		title			: "Correcció ortogràfica",
		notAvailable	: "Ho sentim, aquest servei no està disponible ara.",
		errorLoading	: "S\'ha produït un error en carregar l\'amfitrió del servei d\'aplicació: %s.",
		notInDic		: "No es troba al diccionari",
		changeTo		: "Canvia a",
		btnIgnore		: "Ignora",
		btnIgnoreAll	: "Ignora tot",
		btnReplace		: "Substitueix",
		btnReplaceAll	: "Substitueix tot",
		btnUndo			: "Desfés",
		noSuggestions	: "- Sense suggeriments -",
		progress		: "Correcció ortogràfica en curs...",
		noMispell		: "Correcció ortogràfica completa: no s\'ha trobat cap error ortogràfic",
		noChanges		: "Correcció ortogràfica completa: no s\'ha canviat cap paraula",
		oneChange		: "Correcció ortogràfica completa: s\'ha canviat una paraula",
		manyChanges		: "Correcció ortogràfica completa: %1 paraules canviades",
		ieSpellDownload	: "Corrector ortogràfic no instal·lat. Voleu baixar-lo ara? "
	},

	smiley :
	{
		toolbar	: "Insereix emoticona",
		title	: "Emoticones",
		options : "Opcions d\'emoticona"
	},

	elementsPath :
	{
		eleLabel : "Camí d\'accés dels elements",
		eleTitle : "%1 element"
	},

	numberedlist : "Llista numerada",
	bulletedlist : "Llista amb vinyetes",
	indent : "Augmenta el sagnat",
	outdent : "Disminueix sagnat",

	bidi :
	{
		ltr : "D'esquerra a dreta",
		rtl : "De dreta a esquerra",
	},

	justify :
	{
		left : "Alineació esquerra",
		center : "Alineació centre",
		right : "Alineació dreta",
		block : "Alineació justificada"
	},

	blockquote : "DelimitacióBloc",

	clipboard :
	{
		title		: "Enganxa",
		cutError	: "Els paràmetres de seguretat del navegador impedeixen retallar de manera automàtica. En lloc d\'això, utilitzeu Ctrl+X del teclat.",
		copyError	: "Els paràmetres de seguretat del navegador impedeixen copiar de manera automàtica. En lloc d\'això, utilitzeu Ctrl+C del teclat.",
		pasteMsg	: "Premeu Ctrl+V (Cmd+V en el MAC) per enganxar a continuació.",
		securityMsg	: "La seguretat del vostre navegador evita l\'enganxament directe des del porta-retalls.",
		pasteArea	: "Enganxa àrea"
	},

	pastefromword :
	{
		confirmCleanup	: "El text que voleu enganxar sembla que està copiat del Word. Voleu netejar-lo abans d\'enganxar?",
		toolbar			: "Enganxament especial",
		title			: "Enganxament especial",
		error			: "No s\'han pogut netejar les dades enganxades a causa d\'un error intern"
	},

	pasteText :
	{
		button	: "Enganxa com a text sense format",
		title	: "Enganxa com a text sense format"
	},

	templates :
	{
		button 			: "Plantilles",
		title : "Plantilles de contingut",
		options : "Opcions de plantilla",
		insertOption: "Substitueix el contingut actual",
		selectPromptMsg: "Selecciona la plantilla per obrir a l\'editor",
		emptyListMsg : "(No ni ha plantilles definides)"
	},

	showBlocks : "Mostra els blocs",

	stylesCombo :
	{
		label		: "Estils",
		panelTitle 	: "Estils",
		panelTitle1	: "Estils de blocs",
		panelTitle2	: "Estils en línia",
		panelTitle3	: "Estils d\'objectes"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format de paràgraf",

		tag_p		: "Normal",
		tag_pre		: "Formatat",
		tag_address	: "Adreça",
		tag_h1		: "Encapçalament 1",
		tag_h2		: "Encapçalament 2",
		tag_h3		: "Encapçalament 3",
		tag_h4		: "Encapçalament 4",
		tag_h5		: "Encapçalament 5",
		tag_h6		: "Encapçalament 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Crea un contenidor Div",
		toolbar				: "Crea un contenidor Div",
		cssClassInputLabel	: "Classes de full d\'estil",
		styleSelectLabel	: "Estil",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Codi de l\'idioma",
		inlineStyleInputLabel	: "Estil en línia",
		advisoryTitleInputLabel	: "Títol informatiu",
		langDirLabel		: "Direcció del text",
		langDirLTRLabel		: "D'esquerra a dreta",
		langDirRTLLabel		: "De dreta a esquerra",
		edit				: "Edita Div",
		remove				: "Elimina Div"
  	},

	iframe :
	{
		title		: "Propietats IFrame",
		toolbar		: "Insereix IFrame",
		noUrl		: "Escriviu l\'URL de l\'iframe",
		scrolling	: "Habilita les barres de desplaçament",
		border		: "Mostra el marge del marc"
	},

	font :
	{
		label		: "Tipus de lletra",
		voiceLabel	: "Tipus de lletra",
		panelTitle	: "Nom del tipus de lletra"
	},

	fontSize :
	{
		label		: "Mida",
		voiceLabel	: "Mida del tipus de lletra",
		panelTitle	: "Mida del tipus de lletra"
	},

	colorButton :
	{
		textColorTitle	: "Color del text",
		bgColorTitle	: "Color de fons",
		panelTitle		: "Colors",
		auto			: "Automàtic",
		more			: "Més colors..."
	},

	colors :
	{
		"000" : "Negre",
		"800000" : "Marró fosc",
		"8B4513" : "Marró cuir",
		"2F4F4F" : "Gris pissarra fosc",
		"008080" : "Xarxet",
		"000080" : "Blau marí",
		"4B0082" : "Indi",
		"696969" : "Gris fosc",
		"B22222" : "Maó refractari",
		"A52A2A" : "Marró",
		"DAA520" : "Crema",
		"006400" : "Verd fosc",
		"40E0D0" : "Turquesa",
		"0000CD" : "Blau mitjà",
		"800080" : "Porpra",
		"808080" : "Gris",
		"F00" : "Vermell",
		"FF8C00" : "Taronja fosc",
		"FFD700" : "Daurat",
		"008000" : "Verd",
		"0FF" : "Cian",
		"00F" : "Blau",
		"EE82EE" : "Violat",
		"A9A9A9" : "Gris fosc",
		"FFA07A" : "Salmó clar",
		"FFA500" : "Taronja",
		"FFFF00" : "Groc",
		"00FF00" : "Llima",
		"AFEEEE" : "Turquesa pàl·lid",
		"ADD8E6" : "Blau clar",
		"DDA0DD" : "Pruna",
		"D3D3D3" : "Gris clar",
		"FFF0F5" : "Lavanda clar",
		"FAEBD7" : "Blanc trencat",
		"FFFFE0" : "Groc clar",
		"F0FFF0" : "Mel",
		"F0FFFF" : "Blau cel",
		"F0F8FF" : "Blau de cobalt",
		"E6E6FA" : "Lavanda",
		"FFF" : "Blanc"
	},

	scayt :
	{
		title			: "Fer correcció ortogràfica mentre escriu",
		opera_title		: "No suportat per l\'Opera",
		enable			: "Habilita SCAYT",
		disable			: "Inhabilita SCAYT",
		about			: "Quant a SCAYT",
		toggle			: "Commuta SCAYT",
		options			: "Opcions",
		langs			: "Idiomes",
		moreSuggestions	: "Més suggeriments",
		ignore			: "Ignora",
		ignoreAll		: "Ignora tot",
		addWord			: "Afegeix paraula",
		emptyDic		: "El nom del diccionari no pot ser buit.",

		optionsTab		: "Opcions",
		allCaps			: "Ignora les paraules amb totes les lletres en majúscules",
		ignoreDomainNames : "Ignora els noms de domini",
		mixedCase		: "Ignora les paraules amb combinació de majúscules i minúscules",
		mixedWithDigits	: "Ignora les paraules amb números",

		languagesTab	: "Idiomes",

		dictionariesTab	: "Diccionaris",
		dic_field_name	: "Nom de diccionari",
		dic_create		: "Crea",
		dic_restore		: "Restaura",
		dic_delete		: "Suprimeix",
		dic_rename		: "Canvia el nom",
		dic_info		: "Inicialment el diccionari d\'usuari s\'emmagatzema en una galeta. Tot i així, les galetes tenen una mida limitada. Quan el diccionari d\'usuari augmenta i ja no es pot emmagatzemar en una galeta, es pot emmagatzemar al nostre servidor. Per emmagatzemar el vostre diccionari personal en el nostre servidor, heu d\'especificar un nom per al diccionari. Si ja heu emmagatzemat el diccionari, escriviu el seu nom i feu clic al botó Restaura.",

		aboutTab		: "Quant a"
	},

	about :
	{
		title		: "Quant a CKEditor",
		dlgTitle	: "Quant a CKEditor",
		help	: "Comproveu $1 per a l\'ajuda",
		userGuide : "Guia de l\'usuari del CKEditor",
		moreInfo	: "Per obtenir informació sobre la llicència, visiteu el lloc web:",
		copy		: "Copyright &copy; $1. Tots els drets reservats."
	},

	maximize : "Maximitza",
	minimize : "Minimitza",

	fakeobjects :
	{
		anchor	: "Àncora",
		flash	: "Animació Flash",
		iframe		: "IFrame",
		hiddenfield	: "Camp ocult",
		unknown	: "Objecte desconegut"
	},

	resize : "Arrossegueu per canviar la mida",

	colordialog :
	{
		title		: "Seleccioneu color",
		options	:	"Opcions de color",
		highlight	: "Ressalta",
		selected	: "Color seleccionat",
		clear		: "Esborra"
	},

	toolbarCollapse	: "Redueix la barra d\'eines",
	toolbarExpand	: "Expandeix la barra d\'eines",

	toolbarGroups :
	{
		document : "Document",
		clipboard : "Porta- retalls/Desfés",
		editing : "Edició",
		forms : "Formularis",
		basicstyles : "Estils bàsics",
		paragraph : "Paràgraf",
		links : "Enllaços",
		insert : "Insereix",
		styles : "Estils",
		colors : "Colors",
		tools : "Eines"
	},

	bidi :
	{
		ltr : "Canviar la direcció del text d'esquerra a dreta",
		rtl : "Canviar la direcció del text de dreta a esquerra"
	},

	docprops :
	{
		label : "Propietats del document",
		title : "Propietats del document",
		design : "Disseny",
		meta : "Etiquetes meta",
		chooseColor : "Tria",
		other : "Altres...",
		docTitle :	"Títol de la pàgina",
		charset : 	"Codificació de joc de caràcters",
		charsetOther : "Altres codificacions de joc de caràcters",
		charsetASCII : "ASCII",
		charsetCE : "Europeu central",
		charsetCT : "Xinès tradicional (Big5)",
		charsetCR : "Ciríl·lic",
		charsetGR : "Grec",
		charsetJP : "Japonès",
		charsetKR : "Coreà",
		charsetTR : "Turc",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europeu occidental",
		docType : "Encapçalament del tipus de document",
		docTypeOther : "Altres encapçalaments del tipus de document",
		xhtmlDec : "Inclou declaracions XHTML",
		bgColor : "Color de fons",
		bgImage : "URL de la imatge de fons",
		bgFixed : "Fons sense desplaçament (Fixe)",
		txtColor : "Color del text",
		margin : "Marges de pàgina",
		marginTop : "Superior",
		marginLeft : "Esquerra",
		marginRight : "Dreta",
		marginBottom : "Inferior",
		metaKeywords : "Paraules clau d\'indexació de documents (separades per comes)",
		metaDescription : "Descripció del document",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Aquest és un <strong>text d\'exemple</strong>. Esteu utilitzant l\'<a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "polzades",
			widthCm	: "centímetres",
			widthMm	: "mil·límetres",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "punts",
			widthPc	: "piques"
		},
		table :
		{
			heightUnit	: "Unitat d\'alçada:",
			insertMultipleRows : "Insereix files",
			insertMultipleCols : "Insereix columnes",
			noOfRows : "Número de files:",
			noOfCols : "Número de columnes:",
			insertPosition : "Posició:",
			insertBefore : "Abans",
			insertAfter : "Després",
			selectTable : "Selecciona taula",
			selectRow : "Selecciona fila",
			columnTitle : "Columna",
			colProps : "Propietats de la columna",
			invalidColumnWidth	: "L'amplada de la columna ha de ser un número positiu."
		},
		cell :
		{
			title : "Cel·la"
		},
		emoticon :
		{
			angel		: "Àngel",
			angry		: "Enfadat",
			cool		: "Xulo",
			crying		: "Ploraner",
			eyebrow		: "Cella",
			frown		: "Celles arrufades",
			goofy		: "Estúpid",
			grin		: "Ganyota",
			half		: "Mig",
			idea		: "Idea",
			laughing	: "Riure",
			laughroll	: "Riure molt",
			no			: "No",
			oops		: "Ui",
			shy			: "Tímid",
			smile		: "Somriure",
			tongue		: "Llengua",
			wink		: "Picar l\'ull",
			yes			: "Sí"
		},

		menu :
		{
			link	: "Insereix un enllaç",
			list	: "Llista",
			paste	: "Enganxa",
			action	: "Acció",
			align	: "Alineació",
			emoticon: "Emoticona"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Llista numerada",
			bulletedTitle		: "Llista amb vinyetes"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Escriviu un nom d\'adreça d\'interès descriptiu, com ara \"Secció 1.2\". Després d\'inserir l\'adreça d\'interès, feu clic a la icona \"Enllaç\" o \"Enllaç d\'adreça d\'interès del document\" per enllaçar-hi.",
			title		: "Enllaç d\'adreça d\'interès del document:",
			linkTo		: "Enllaç a:"
		},

		urllink :
		{
			title : "Enllaç de l\'URL",
			linkText : "Text de l\'enllaç:",
			selectAnchor: "Selecciona una àncora:",
			nourl: "Escriviu l\'URL a un camp de text.",
			urlhelp: "Escriviu o enganxeu un URL per obrir quan els usuaris facin clic a aquest enllaç, per exemple http://www.exemple.com.",
			displaytxthelp: "Escriviu el text que es mostrarà per l\'enllaç.",
			openinnew : "Obra l\'enllaç a una nova finestra"
		},

		spellchecker :
		{
			title : "Comprovació ortogràfica",
			replace : "Substitueix:",
			suggesstion : "Suggeriments:",
			withLabel : "Per:",
			replaceButton : "Substitueix",
			replaceallButton:"Substitueix tot",
			skipButton:"Omet",
			skipallButton: "Omet totes",
			undochanges: "Desfés els canvis",
			complete: "Comprovació ortogràfica completa",
			problem: "Problema en recuperar les dades XML",
			addDictionary: "Afegeix al diccionari",
			editDictionary: "Edita el diccionari"
		},

		status :
		{
			keystrokeForHelp: "Premeu ALT 0 per obtenir ajuda"
		},

		linkdialog :
		{
			label : "Diàleg de l\'enllaç"
		},

		image :
		{
			previewText : "El text circularà al voltant de la imatge que esteu afegint com en aquest exemple."
		}
	}

};
