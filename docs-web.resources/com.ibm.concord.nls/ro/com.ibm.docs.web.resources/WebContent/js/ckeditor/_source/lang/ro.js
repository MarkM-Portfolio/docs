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
	editorTitle : "Editor rich-text, %1.",

	// ARIA descriptions.
	toolbars	: "Bare de unelte editor",
	editor	: "Editor rich-text",

	// Toolbar buttons without dialogs.
	source			: "Sursă",
	newPage			: "Pagină nouă",
	save			: "Salvare",
	preview			: "Previzualizare",
	cut				: "Decupare",
	copy			: "Copiere",
	paste			: "Lipire",
	print			: "Tipărire",
	underline		: "Subliniere",
	bold			: "Aldin",
	italic			: "Cursiv",
	selectAll		: "Selectare tot",
	removeFormat	: "Înlăturare format",
	strike			: "Tăiere",
	subscript		: "Indice inferior",
	superscript		: "Indice superior",
	horizontalrule	: "Inserare linie orizontală",
	pagebreak		: "Inserare întrerupere pagină",
	pagebreakAlt		: "Întrerupere pagină",
	unlink			: "Înlăturare legătură",
	undo			: "Anulare acţiune",
	redo			: "Refacere acţiune",

	// Common messages and labels.
	common :
	{
		browseServer	: "Server browser:",
		url				: "URL:",
		protocol		: "Protocol:",
		upload			: "Încărcare:",
		uploadSubmit	: "Trimitere către server",
		image			: "Inserare imagine",
		flash			: "Inserare film Flash",
		form			: "Inserare formular",
		checkbox		: "Inserare casetă de bifare",
		radio			: "Inserare buton radio",
		textField		: "Inserare câmp text",
		textarea		: "Inserare zonă de text",
		hiddenField		: "Inserare câmp ascuns",
		button			: "Inserare buton",
		select			: "Inserare câmp selectat",
		imageButton		: "Inserare buton imagine",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Nume:",
		langDir			: "Direcţie text:",
		langDirLtr		: "De la stânga la dreapta",
		langDirRtl		: "De la dreapta la stânga",
		langCode		: "Cod limbă:",
		longDescr		: "URL descriere lungă:",
		cssClass		: "Clase foi de stil:",
		advisoryTitle	: "Titlu consultativ:",
		cssStyle		: "Stil:",
		ok				: "OK",
		cancel			: "Anulare",
		close : "Închidere",
		preview			: "Previzualizare",
		generalTab		: "General",
		advancedTab		: "Avansat",
		validateNumberFailed	: "Această valoare nu este un membru.",
		confirmNewPage	: "Orice modificări nesalvate la acest conţinut vor fi pierdute. Sunteţi sigur că vreţi să încărcaţi o pagină nouă?",
		confirmCancel	: "Unele dintre opţiuni au fost modificate. Sunteţi sigur că vreţi să închideţi dialogul?",
		options : "Opţiuni",
		target			: "Ţintă:",
		targetNew		: "Fereastră nouă (_blank)",
		targetTop		: "Fereastră superioară (_top)",
		targetSelf		: "Aceeaşi fereastră (_self)",
		targetParent	: "Fereastră părinte (_parent)",
		langDirLTR		: "De la stânga la dreapta",
		langDirRTL		: "De la dreapta la stânga",
		styles			: "Stil:",
		cssClasses		: "Clase foi de stil:",
		width			: "Lăţime:",
		height			: "Înălţime:",
		align			: "Aliniere:",
		alignLeft		: "Stânga",
		alignRight		: "Dreapta",
		alignCenter		: "Centru",
		alignTop		: "Sus",
		alignMiddle		: "Mijloc",
		alignBottom		: "Jos",
		invalidHeight	: "Înălţimea trebuie să fie un număr întreg pozitiv.",
		invalidWidth	: "Lăţimea trebuie să fie un număr întreg pozitiv.",
		invalidCssLength	: "Valoarea specificată pentru câmpul '%1' trebuie să fie un număr pozitiv cu sau fără o unitate de măsură CSS validă (px, %, in, cm, mm, em, ex, pt sau pc).",
		invalidHtmlLength	: "Valoarea specificată pentru câmpul '%1' trebuie să fie un număr pozitiv cu sau fără o unitate de măsură HTML validă (px sau %).",
		invalidInlineStyle	: "Valoarea specificată pentru stilul inline trebuie să conţină una sau mai multe tuple cu formatul \"name : value\", separate prin punct şi virgulă.",
		cssLengthTooltip	: "Introduceţi un număr pentru o valoare în pixeli sau un număr cu o unitate CSS validă (px, %, in, cm, mm, em, ex, pt sau pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, unavailable</span>"
	},

	contextmenu :
	{
		options : "Opţiuni meniu contextual"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Inserare caracter special",
		title		: "Caracter special",
		options : "Opţiuni caracter special"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Legătură URL",
		other 		: "<other>",
		menu		: "Editare legătură...",
		title		: "Legătură",
		info		: "Informaţii legătură",
		target		: "Ţintă",
		upload		: "Încărcare:",
		advanced	: "Avansat",
		type		: "Tip legătură:",
		toUrl		: "URL",
		toAnchor	: "Legătură la ancoră din text",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nume cadru ţintă:",
		targetPopupName	: "Nume fereastră popup:",
		popupFeatures	: "Caracteristici fereastră popup:",
		popupResizable	: "Redimensionabil",
		popupStatusBar	: "Bară de stare",
		popupLocationBar	: "Bară de locaţie",
		popupToolbar	: "Bară de unelte",
		popupMenuBar	: "Bară de meniuri",
		popupFullScreen	: "Ecran complet(IE)",
		popupScrollBars	: "Bare de defilare",
		popupDependent	: "Dependent (Netscape)",
		popupLeft		: "Poziţia din stânga",
		popupTop		: "Poziţia de sus",
		id				: "Id:",
		langDir			: "Direcţie text:",
		langDirLTR		: "De la stânga la dreapta",
		langDirRTL		: "De la dreapta la stânga",
		acccessKey		: "Cheie de acces:",
		name			: "Nume:",
		langCode		: "Cod limbă:",
		tabIndex		: "Index filă:",
		advisoryTitle	: "Titlu consultativ:",
		advisoryContentType	: "Tip conţinut consultativ:",
		cssClasses		: "Clase foi de stil:",
		charset			: "Set de caractere resursă legat:",
		styles			: "Stil:",
		rel			: "Relaţie",
		selectAnchor	: "Selectaţi o ancoră",
		anchorName		: "După nume ancoră",
		anchorId		: "După ID element",
		emailAddress	: "Adresă e-mail",
		emailSubject	: "Subiect mesaj",
		emailBody		: "Corp mesaj",
		noAnchors		: "Nu există semne de carte disponibile în document. Faceţi clic pe pictograma 'Inserare semn de carte document' de pe bara de unelte pentru a adăuga unul.",
		noUrl			: "Vă rugăm să tastaţi URL-ul legăturii",
		noEmail			: "Vă rugăm să tastaţi adresa de e-mail"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Inserare semn de carte document",
		menu		: "Editare semn de carte document",
		title		: "Semn de carte document",
		name		: "Nume:",
		errorName	: "Vă rugăm să introduceţi un nume pentru semnul de carte al documentului",
		remove		: "Înlăturare semn de carte document"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Proprietăţi listă numerotate",
		bulletedTitle		: "Proprietăţi listă marcate",
		type				: "Tip",
		start				: "Pornire",
		validateStartNumber				:"Numărul de pornire listă trebuie să fie un număr întreg.",
		circle				: "Cerc",
		disc				: "Disc",
		square				: "Pătrat",
		none				: "Fără",
		notset				: "<not set>",
		armenian			: "Numerotare armeniană",
		georgian			: "Numerotare georgiană (an, ban, gan, etc.)",
		lowerRoman			: "Numere romane mici (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Numere romane mari (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Litere alfa mici (a, b, c, d, e, etc.)",
		upperAlpha			: "Litere alfa mari (A, B, C, D, E, etc.)",
		lowerGreek			: "Litere greceşti mici (alpha, beta, gamma, etc.)",
		decimal				: "Zecimale (1, 2, 3, etc.)",
		decimalLeadingZero	: "Zecimale cu zero în faţă (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Găsire şi înlocuire",
		find				: "Găsire",
		replace				: "Înlocuire",
		findWhat			: "Găsire:",
		replaceWith			: "Înlocuire cu:",
		notFoundMsg			: "Textul specificat nu a fost găsit.",
		noFindVal			: 'Textul de găsit este necesar.',
		findOptions			: "Opţiuni de găsire",
		matchCase			: "Potrivire majuscule",
		matchWord			: "Potrivire cuvânt întreg",
		matchCyclic			: "Potrivire ciclică",
		replaceAll			: "Înlocuire tot",
		replaceSuccessMsg	: "%1 apariţii înlocuite."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Inserare tabel",
		title		: "Tabel",
		menu		: "Proprietăţi tabel",
		deleteTable	: "Ştergere tabel",
		rows		: "Rânduri:",
		columns		: "Coloane:",
		border		: "Dimensiune bordură:",
		widthPx		: "pixeli",
		widthPc		: "procent",
		widthUnit	: "Unitate lăţime:",
		cellSpace	: "Spaţiere celulă:",
		cellPad		: "Padding celulă:",
		caption		: "Titlu:",
		summary		: "Sumar:",
		headers		: "Anteturi:",
		headersNone		: "Fără",
		headersColumn	: "Prima coloană",
		headersRow		: "Primul rând",
		headersBoth		: "Ambele",
		invalidRows		: "Numărul de rânduri trebuie să fie un număr întreg mai mare decât zero.",
		invalidCols		: "Numărul de coloane trebuie să fie un număr întreg mai mare decât zero.",
		invalidBorder	: "Dimensiunea bordurii trebuie să fie un număr pozitiv.",
		invalidWidth	: "Lăţimea tabelului trebuie să fie un număr pozitiv.",
		invalidHeight	: "Înălţimea tabelului trebuie să fie un număr pozitiv.",
		invalidCellSpacing	: "Spaţierea celulei trebui să fie un număr pozitiv.",
		invalidCellPadding	: "Padding-ul celulei trebui să fie un număr pozitiv.",

		cell :
		{
			menu			: "Celulă",
			insertBefore	: "Inserare celulă înainte",
			insertAfter		: "Inserare celulă după",
			deleteCell		: "Ştergere celule",
			merge			: "Combinare celule",
			mergeRight		: "Combinare la dreapta",
			mergeDown		: "Combinare în jos",
			splitHorizontal	: "Divizare celulă orizontal",
			splitVertical	: "Divizare celulă vertical",
			title			: "Proprietăţi celulă",
			cellType		: "Tip celulă:",
			rowSpan			: "Întindere rânduri:",
			colSpan			: "Întindere coloane:",
			wordWrap		: "Înfăşurare cuvânt:",
			hAlign			: "Aliniere orizontală:",
			vAlign			: "Aliniere verticală:",
			alignBaseline	: "Linie de bază",
			bgColor			: "Culoare fundal:",
			borderColor		: "Culoare bordură:",
			data			: "Date",
			header			: "Antet",
			yes				: "Da",
			no				: "Nu",
			invalidWidth	: "Lăţimea celulei trebui să fie un număr pozitiv.",
			invalidHeight	: "Înălţimea celulei trebui să fie un număr pozitiv.",
			invalidRowSpan	: "Întinderea rândurilor trebuie să fie un număr întreg pozitiv.",
			invalidColSpan	: "Întinderea coloanelor trebuie să fie un număr întreg pozitiv.",
			chooseColor : "Alegere"
		},

		row :
		{
			menu			: "Rând",
			insertBefore	: "Inserare rând înainte",
			insertAfter		: "Inserare rând după",
			deleteRow		: "Ştergere rânduri"
		},

		column :
		{
			menu			: "Coloană",
			insertBefore	: "Inserare coloană înainte",
			insertAfter		: "Inserare coloană după",
			deleteColumn	: "Ştergere coloane"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Proprietăţi buton",
		text		: "Text (Valoare):",
		type		: "Tip:",
		typeBtn		: "Buton",
		typeSbm		: "Trimitere",
		typeRst		: "Reset"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Proprietăţi casetă de bifare",
		radioTitle	: "Proprietăţi buton radio",
		value		: "Valoare:",
		selected	: "Selectată"
	},

	// Form Dialog.
	form :
	{
		title		: "Inserare formular",
		menu		: "Proprietăţi formular",
		action		: "Acţiune:",
		method		: "Metodă:",
		encoding	: "Codare:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Selectare proprietăţi câmp",
		selectInfo	: "Selectare informaţii",
		opAvail		: "Opţiuni disponibile",
		value		: "Valoare:",
		size		: "Dimensiune:",
		lines		: "linii",
		chkMulti	: "Permiteţi selecţii multiple",
		opText		: "Text:",
		opValue		: "Valoare:",
		btnAdd		: "Adăugare",
		btnModify	: "Modificare ",
		btnUp		: "Sus",
		btnDown		: "Jos",
		btnSetValue : "Setare ca valoare selectată",
		btnDelete	: "Ştergere"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Proprietăţi zonă de text",
		cols		: "Coloane:",
		rows		: "Rânduri:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Proprietăţi câmp text",
		name		: "Nume:",
		value		: "Valoare:",
		charWidth	: "Lăţime caracter:",
		maxChars	: "Maxim caractere:",
		type		: "Tip:",
		typeText	: "Text",
		typePass	: "Parolă"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Proprietăţi câmp ascuns",
		name	: "Nume:",
		value	: "Valoare:"
	},

	// Image Dialog.
	image :
	{
		title		: "Imagine",
		titleButton	: "Proprietăţi buton imagine",
		menu		: "Proprietăţi imagine...",
		infoTab	: "Informaţii imagine",
		btnUpload	: "Trimiteţi către server",
		upload	: "Încărcare",
		alt		: "Text alternativ:",
		lockRatio	: "Raport de blocare",
		resetSize	: "Resetare dimensiune",
		border	: "Bordură:",
		hSpace	: "Spaţiu orizontal:",
		vSpace	: "Spaţiu vertical:",
		alertUrl	: "Vă rugăm să tastaţi URL-ul imaginii",
		linkTab	: "Legătură",
		button2Img	: "Doriţi să transformaţi butonul imagine selectat într-o imagine simplă?",
		img2Button	: "Doriţi să transformaţi imaginea selectat într-un buton imagine?",
		urlMissing : "URL-ul sursei imaginii lipseşte.",
		validateBorder : "Bordura trebuie să fie un număr întreg pozitiv.",
		validateHSpace : "Spaţiul orizontal trebuie să fie un număr întreg pozitiv.",
		validateVSpace : "Spaţiul vertical trebuie să fie un număr întreg pozitiv."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Proprietăţi Flash",
		propertiesTab	: "Proprietăţi",
		title		: "Flash",
		chkPlay		: "Redare automată",
		chkLoop		: "Buclă",
		chkMenu		: "Activare meniu flash",
		chkFull		: "Permitere ecran complet",
 		scale		: "Scală:",
		scaleAll		: "Afişare toate",
		scaleNoBorder	: "Fără bordură",
		scaleFit		: "Potrivire exactă",
		access			: "Acces script:",
		accessAlways	: "Întotdeauna",
		accessSameDomain	: "Acelaşi domeniu",
		accessNever	: "Niciodată",
		alignAbsBottom: "Abs jos",
		alignAbsMiddle: "Abs mijloc",
		alignBaseline	: "Linie de bază",
		alignTextTop	: "Text sus",
		quality		: "Calitate:",
		qualityBest	: "Cea mai bună",
		qualityHigh	: "Înaltă",
		qualityAutoHigh	: "Înaltă auto",
		qualityMedium	: "Medie",
		qualityAutoLow	: "Scăzută auto",
		qualityLow	: "Scăzută",
		windowModeWindow	: "Fereastră",
		windowModeOpaque	: "Opacă",
		windowModeTransparent	: "Transparentă",
		windowMode	: "Mod fereastră:",
		flashvars	: "Variabile:",
		bgcolor	: "Culoare fundal:",
		hSpace	: "Spaţiu orizontal:",
		vSpace	: "Spaţiu vertical:",
		validateSrc : "URL-ul nu trebuie să fie gol.",
		validateHSpace : "Spaţiul orizontal trebuie să fie un număr întreg pozitiv.",
		validateVSpace : "Spaţiul vertical trebuie să fie un număr întreg pozitiv."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Verificare ortografică",
		title			: "Verificare ortografică",
		notAvailable	: "Ne pare rău, dar serviciul ewste indisponibil momentan.",
		errorLoading	: "Eroare încărcare gazdă de servicii aplicaţie: %s.",
		notInDic		: "Nu este în dicţionar",
		changeTo		: "modificare la",
		btnIgnore		: "Ignorare",
		btnIgnoreAll	: "Ignorare toate",
		btnReplace		: "Înlocuire",
		btnReplaceAll	: "Înlocuire toate",
		btnUndo			: "Anulare",
		noSuggestions	: "- fără sugestii -",
		progress		: "Verificare ortografică în curs...",
		noMispell		: "Verificare ortografică completă: Nicio greşeală ortografică găsită",
		noChanges		: "Verificare ortografică completă: Niciun cuvânt modificat",
		oneChange		: "Verificare ortografică completă: Un cuvânt modificat",
		manyChanges		: "Verificare ortografică completă: %1 cuvinte modificate",
		ieSpellDownload	: "Verificator ortografic neinstalat. Doriţi să îl descărcaţi acum?"
	},

	smiley :
	{
		toolbar	: "Inserare emoticon",
		title	: "Emoticoane",
		options : "Opţiuni emoticon"
	},

	elementsPath :
	{
		eleLabel : "Cale elemente",
		eleTitle : "%1 element"
	},

	numberedlist : "Listă numerotată",
	bulletedlist : "Listă marcată",
	indent : "Creştere indentare",
	outdent : "Descreştere indentare",

	bidi :
	{
		ltr : "De la stânga la dreapta",
		rtl : "De la dreapta la stânga",
	},

	justify :
	{
		left : "Aliniere la stânga",
		center : "Aliniere la centru",
		right : "Aliniere la dreapta",
		block : "Aliniere justificată"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Lipire",
		cutError	: "Setările de securitate ale browser-ului dumneavoastră împiedică decuparea automată. Utilizaţi Ctrl+X de pe tastatura dumneavoastră în loc.",
		copyError	: "Setările de securitate ale browser-ului dumneavoastră împiedică copierea automată. Utilizaţi Ctrl+C de pe tastatura dumneavoastră în loc.",
		pasteMsg	: "Apăsaţi Ctrl+V (Cmd+V pe MAC) pentru a lipi mai jos.",
		securityMsg	: "Securitatea browser-ului dumneavoastră blochează lipirea directă din clipboard.",
		pasteArea	: "Zonă de lipire"
	},

	pastefromword :
	{
		confirmCleanup	: "Textul pe care vreţi să îl lipiţi pare să fie copiat din Word. Doriţi să îl curăţaţi înainte de a îl lipi?",
		toolbar			: "Lipire specială",
		title			: "Lipire specială",
		error			: "Nu s-au putut curăţa datele lipite din cauza unei erori interne"
	},

	pasteText :
	{
		button	: "Lipire ca text simplu",
		title	: "Lipire ca text simplu"
	},

	templates :
	{
		button 			: "Şabloane",
		title : "Şabloane de conţinut",
		options : "Opţiuni şablon",
		insertOption: "Înlocuire conţinut actual",
		selectPromptMsg: "Selectaţi şablonul pentru a îl deschide în editor",
		emptyListMsg : "(Niciun şablon definit)"
	},

	showBlocks : "Afişare blocuri",

	stylesCombo :
	{
		label		: "Stiluri",
		panelTitle 	: "Stiluri",
		panelTitle1	: "Stiluri bloc",
		panelTitle2	: "Stiluri inline",
		panelTitle3	: "Stiluri obiect"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format paragraf",

		tag_p		: "Normal",
		tag_pre		: "Formatat",
		tag_address	: "Adresă",
		tag_h1		: "Titlu 1",
		tag_h2		: "Titlu 2",
		tag_h3		: "Titlu 3",
		tag_h4		: "Titlu 4",
		tag_h5		: "Titlu 5",
		tag_h6		: "Titlu 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Creare container Div",
		toolbar				: "Creare container Div",
		cssClassInputLabel	: "Clase foaie de stil",
		styleSelectLabel	: "Stil",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Cod limbă",
		inlineStyleInputLabel	: "Stil inline",
		advisoryTitleInputLabel	: "Titlu consultativ",
		langDirLabel		: "Direcţie text",
		langDirLTRLabel		: "De la stânga la dreapta",
		langDirRTLLabel		: "De la dreapta la stânga",
		edit				: "Editare Div",
		remove				: "Înlăturare Div"
  	},

	iframe :
	{
		title		: "Proprietăţi IFrame",
		toolbar		: "Inserare IFrame",
		noUrl		: "Vă rugăm să tastaţi URL-ul iframe-ului",
		scrolling	: "Activare bare de defilare",
		border		: "Afişare bordură cadru"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Nume font"
	},

	fontSize :
	{
		label		: "Dimensiune",
		voiceLabel	: "Dimensiune font",
		panelTitle	: "Dimensiune font"
	},

	colorButton :
	{
		textColorTitle	: "Culoare text",
		bgColorTitle	: "Culoare fundal",
		panelTitle		: "Culori",
		auto			: "Automat",
		more			: "Culori suplimentare..."
	},

	colors :
	{
		"000" : "Negru",
		"800000" : "Castaniu",
		"8B4513" : "Maro de şa",
		"2F4F4F" : "Gri ardezie închis",
		"008080" : "Lişiţă",
		"000080" : "Bleumarin",
		"4B0082" : "Indigo",
		"696969" : "Gri închis",
		"B22222" : "Cărămiziu aprins",
		"A52A2A" : "Maro",
		"DAA520" : "Galben goldenrod",
		"006400" : "Verde închis",
		"40E0D0" : "Turcoaz",
		"0000CD" : "Albastru mediu",
		"800080" : "Mov",
		"808080" : "Gri",
		"F00" : "Roşu",
		"FF8C00" : "Portocaliu închis",
		"FFD700" : "Auriu",
		"008000" : "Verde",
		"0FF" : "Cyan",
		"00F" : "Albastru",
		"EE82EE" : "Violet",
		"A9A9A9" : "Gri şters",
		"FFA07A" : "Roz portocaliu deschis",
		"FFA500" : "Portocaliu",
		"FFFF00" : "Galben",
		"00FF00" : "Lime",
		"AFEEEE" : "Turcoaz pal",
		"ADD8E6" : "Albastru deschis",
		"DDA0DD" : "Prună",
		"D3D3D3" : "Gri deschis",
		"FFF0F5" : "Roşu levănţică",
		"FAEBD7" : "Alb antic",
		"FFFFE0" : "Galben deschis",
		"F0FFF0" : "Fagure",
		"F0FFFF" : "Azuriu",
		"F0F8FF" : "Albastru Alice",
		"E6E6FA" : "Lavandă",
		"FFF" : "Alb"
	},

	scayt :
	{
		title			: "Verificare ortografică pe măsură ce tastaţi",
		opera_title		: "Nesuportată de Opera",
		enable			: "Activare SCAYT",
		disable			: "Dezactivare SCAYT",
		about			: "Despre SCAYT",
		toggle			: "Comutare SCAYT",
		options			: "Opţiuni",
		langs			: "Limbi",
		moreSuggestions	: "Mai multe sugestii",
		ignore			: "Ignorare",
		ignoreAll		: "Ignorare toate",
		addWord			: "Adăugare cuvânt",
		emptyDic		: "Numele dicţionarului nu ar trebui să fie gol.",

		optionsTab		: "Opţiuni",
		allCaps			: "Ignorare cuvinte cu masjuscule",
		ignoreDomainNames : "Ignorare nume domenii",
		mixedCase		: "Ignorare cuvinte cu litere amestecate",
		mixedWithDigits	: "Ignorare cuvinte cu numere",

		languagesTab	: "Limbi",

		dictionariesTab	: "Dicţionare",
		dic_field_name	: "Nume dicţionar",
		dic_create		: "Creare",
		dic_restore		: "Restaurare",
		dic_delete		: "Ştergere",
		dic_rename		: "Redenumire",
		dic_info		: "Iniţial Dicţionarul de utilizator este stocat într-un Cookie. Totuşi, Cookie-urile sunt limitate ca dimensiune. Când dicţionarul de utilizator ajunge la un punct în care nu mai poate fi stocat într-un Cookie, atunci dicţionarul poate fi stocat pe serverul nostru. Pentru a vă stoca dicţionarul personal pe serverul nostru ar trebui să specificaţi un nume pentru dicţionarul dumneavoastră. Dacă aveţi deja un dicţionar stocat, vă rugăm să-i tastaţi numele şi să faceţi clic pe butonul Restaurare.",

		aboutTab		: "Despre"
	},

	about :
	{
		title		: "Despre CKEditor",
		dlgTitle	: "Despre CKEditor",
		help	: "Verificaţi $1 pentru ajutor.",
		userGuide : "CKEditor User's Guide",
		moreInfo	: "Pentru informaţii de autorizare vă rugăm să vizitaţi site-ul nostru web:",
		copy		: "Copyright &copy; $1. Toate drepturile rezervate."
	},

	maximize : "Maximizare",
	minimize : "Minimizare",

	fakeobjects :
	{
		anchor	: "Ancoră",
		flash	: "Animaţie Flash",
		iframe		: "IFrame",
		hiddenfield	: "Obiect ascuns",
		unknown	: "Obiect necunsocut"
	},

	resize : "Trageţi pentru a redimensiona",

	colordialog :
	{
		title		: "Selectare culoare",
		options	:	"Opţiuni culoare",
		highlight	: "Evidenţiere",
		selected	: "Culoare selectată",
		clear		: "Curăţare"
	},

	toolbarCollapse	: "Restrângere bară de unelte",
	toolbarExpand	: "Expandare bară de unelte",

	toolbarGroups :
	{
		document : "Document",
		clipboard : "Clipboard/Anulare acţiune",
		editing : "Editare",
		forms : "Formulare",
		basicstyles : "Stiluri de bază",
		paragraph : "Paragraf",
		links : "Legături",
		insert : "Inserare",
		styles : "Stiluri",
		colors : "Culori",
		tools : "Unelte"
	},

	bidi :
	{
		ltr : "Modificare la text de la stânga la dreapta",
		rtl : "Modificare la text de la dreapta la stânga"
	},

	docprops :
	{
		label : "Proprietăţi document",
		title : "Proprietăţi document",
		design : "Design",
		meta : "Taguri meta",
		chooseColor : "Alegere",
		other : "Altul...",
		docTitle :	"Titlu pagină",
		charset : 	"Codare set de caractere",
		charsetOther : "Altă codare set de caractere",
		charsetASCII : "ASCII",
		charsetCE : "Central-European",
		charsetCT : "Chinez tradiţional (Big5)",
		charsetCR : "Chirilic",
		charsetGR : "Grec",
		charsetJP : "Japonez",
		charsetKR : "Coreean",
		charsetTR : "Turc",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Vest-European",
		docType : "Titlul tip document",
		docTypeOther : "Alt titlu tip document",
		xhtmlDec : "Includere declaraţii XHTML",
		bgColor : "Culoare fundal",
		bgImage : "URL imagine fundal",
		bgFixed : "Fundal fără defilare (Fixat)",
		txtColor : "Culoare text",
		margin : "Margini pagină",
		marginTop : "Sus",
		marginLeft : "Stânga",
		marginRight : "Dreapta",
		marginBottom : "Jos",
		metaKeywords : "Cuvinte cheie de indexare document (separate prin virgulă)",
		metaDescription : "Descriere document",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Acesta este un <strong>text eşantion</strong>. Utilizaţi <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inch",
			widthCm	: "centimetri",
			widthMm	: "milimetri",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "puncte",
			widthPc	: "cicero"
		},
		table :
		{
			heightUnit	: "Unitate înălţime:",
			insertMultipleRows : "Inserare rânduri",
			insertMultipleCols : "Inserare coloane",
			noOfRows : "Număr de rânduri:",
			noOfCols : "Număr de coloane:",
			insertPosition : "Poziţie:",
			insertBefore : "Înainte",
			insertAfter : "După",
			selectTable : "Selectare tabel",
			selectRow : "Selectare rând",
			columnTitle : "Coloană",
			colProps : "Proprietăţi coloană",
			invalidColumnWidth	: "Lăţimea coloanei trebuie să fie un număr pozitiv."
		},
		cell :
		{
			title : "Celulă"
		},
		emoticon :
		{
			angel		: "Înger",
			angry		: "Furios",
			cool		: "Calm",
			crying		: "Plâns",
			eyebrow		: "Sprânceană",
			frown		: "Posac",
			goofy		: "Tont",
			grin		: "Rânjet",
			half		: "Jumătate",
			idea		: "Idee",
			laughing	: "Râs",
			laughroll	: "Tăvălit de râs",
			no			: "Nu",
			oops		: "Vai",
			shy			: "Timid",
			smile		: "Zâmbet",
			tongue		: "Limbă",
			wink		: "Face cu ochiul",
			yes			: "Da"
		},

		menu :
		{
			link	: "Inserare legătură",
			list	: "Listă",
			paste	: "Lipire",
			action	: "Acţiune",
			align	: "Aliniere",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Listă numerotată",
			bulletedTitle		: "Listă marcată"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Tastaţi un nume semn de carte descriptiv, cum ar fi 'Section 1.2'. După inserarea semnului de carte, faceţi clic fie pe pictograma 'Legătură', fie pe 'Legătură semn de carte document' pentru a legătură la ea.",
			title		: "Legătură semn de carte document",
			linkTo		: "Legătură la:"
		},

		urllink :
		{
			title : "Legătură URL",
			linkText : "Text legătură:",
			selectAnchor: "Selectaţi o ancoră:",
			nourl: "Vă rugăm să introduceţi un URL în câmpul text",
			urlhelp: "Tastaţi sau lipiţi un URL care să se deschidă când utilizatorii fac clic pe această legătură, de exemplu http://www.example.com.",
			displaytxthelp: "Tastaţi text de afişare pentru legătură.",
			openinnew : "Deschidere legătură în fereastră nouă"
		},

		spellchecker :
		{
			title : "Verificare ortografică",
			replace : "Înlocuire:",
			suggesstion : "Sugestii:",
			withLabel : "Cu:",
			replaceButton : "Înlocuire",
			replaceallButton:"Înlocuire toate",
			skipButton:"Sărire",
			skipallButton: "Sărire toate",
			undochanges: "Anulare modificări",
			complete: "Verificare ortografică completă",
			problem: "Problemă extragere date XML",
			addDictionary: "Adăugare la dicţionar",
			editDictionary: "Editare dicţionar"
		},

		status :
		{
			keystrokeForHelp: "Apăsaţi ALT 0 pentru ajutor"
		},

		linkdialog :
		{
			label : "Dialog legătură"
		},

		image :
		{
			previewText : "Textul va curge în jurul imaginii pe care o adăugaţi ca în acest exemplu."
		}
	}

};
