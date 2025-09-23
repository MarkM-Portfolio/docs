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
	editorTitle : "Editor rich text, %1.",

	// ARIA descriptions.
	toolbars	: "Barre degli strumenti dell'Editor",
	editor	: "Editor Rich Text",

	// Toolbar buttons without dialogs.
	source			: "Origine",
	newPage			: "Nuova pagina",
	save			: "Salva",
	preview			: "Anteprima:",
	cut				: "Taglia",
	copy			: "Copia",
	paste			: "Incolla",
	print			: "Stampa",
	underline		: "Sottolineato",
	bold			: "Grassetto",
	italic			: "Corsivo",
	selectAll		: "Seleziona tutto",
	removeFormat	: "Rimuovi formato",
	strike			: "Barrato",
	subscript		: "Pedice",
	superscript		: "Apice",
	horizontalrule	: "Inserisci linea orizzontale",
	pagebreak		: "Inserisci interruzione di pagina",
	pagebreakAlt		: "Interruzione di pagina",
	unlink			: "Rimuovi collegamento",
	undo			: "Annulla",
	redo			: "Ripristina",

	// Common messages and labels.
	common :
	{
		browseServer	: "Server del browser:",
		url				: "URL:",
		protocol		: "Protocollo:",
		upload			: "Carica:",
		uploadSubmit	: "Invia al server",
		image			: "Inserisci immagine",
		flash			: "Inserisci filmato Flash",
		form			: "Inserisci modulo",
		checkbox		: "Inserisci casella di spunta",
		radio			: "Inserisci pulsante di scelta",
		textField		: "Inserisci campo di testo",
		textarea		: "Inserisci area di testo",
		hiddenField		: "Inserisci campo nascosto",
		button			: "Inserisci pulsante",
		select			: "Inserisci campo di selezione",
		imageButton		: "Inserisci pulsante immagine",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Nome:",
		langDir			: "Orientamento testo:",
		langDirLtr		: "Da sinistra a destra",
		langDirRtl		: "Da destra a sinistra",
		langCode		: "Codice lingua:",
		longDescr		: "URL descrizione estesa:",
		cssClass		: "Classi foglio di stile:",
		advisoryTitle	: "Titolo avviso:",
		cssStyle		: "Stile:",
		ok				: "OK",
		cancel			: "Annulla",
		close : "Chiudi",
		preview			: "Anteprima:",
		generalTab		: "Generale",
		advancedTab		: "Avanzate",
		validateNumberFailed	: "Questo valore non è un numero.",
		confirmNewPage	: "Eventuali modifiche apportate a questo contenuto e non salvate verranno perse. Caricare comunque una nuova pagina?",
		confirmCancel	: "Alcune delle opzioni sono state modificate. Si è sicuri di voler chiudere la finestra di dialogo?",
		options : "Opzioni",
		target			: "Destinazione:",
		targetNew		: "Nuova finestra (_blank)",
		targetTop		: "Finestra più in alto (_top)",
		targetSelf		: "Stessa finestra (_self)",
		targetParent	: "Finestra parent (_parent)",
		langDirLTR		: "Da sinistra a destra",
		langDirRTL		: "Da destra a sinistra",
		styles			: "Stile:",
		cssClasses		: "Classi foglio di stile:",
		width			: "Larghezza:",
		height			: "Altezza:",
		align			: "Allinea:",
		alignLeft		: "A sinistra",
		alignRight		: "A destra",
		alignCenter		: "Centra",
		alignTop		: "In alto",
		alignMiddle		: "Al centro",
		alignBottom		: "In basso",
		invalidHeight	: "L'altezza deve essere un numero intero positivo.",
		invalidWidth	: "La larghezza deve essere un numero intero positivo.",
		invalidCssLength	: "Il valore specificato per il  campo '%1' deve essere un numero positivo con o senza un'unità di misura CSS valida (px, %, in, cm, mm, em, ex, pt o pc).",
		invalidHtmlLength	: "Il valore specificato per il campo '%1' deve essere un numero positivo con o senza un'unità di misura HTML valida (px o %).",
		invalidInlineStyle	: "Il valore specificato per lo stile allineato deve essere costituito da uno o più serie ordinate con il formato \"nome : valore\", separato da punti e virgole.",
		cssLengthTooltip	: "Immettere un numero per un valore in pixel o un numero con un'unità CSS valida (px, %, in, cm, mm, em, ex, pt o pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, non disponibile</span>"
	},

	contextmenu :
	{
		options : "Opzioni del Menu di scelta rapida"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Inserisci carattere speciale",
		title		: "Carattere speciale",
		options : "Opzioni carattere speciale"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Collegamento URL",
		other 		: "<other>",
		menu		: "Modifica collegamento...",
		title		: "Collegamento",
		info		: "Informazioni sul collegamento",
		target		: "Destinazione",
		upload		: "Carica:",
		advanced	: "Avanzate",
		type		: "Tipo di collegamento:",
		toUrl		: "URL",
		toAnchor	: "Collegamento all'ancoraggio testo",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nome cornice di destinazione:",
		targetPopupName	: "Nome finestra pop-up:",
		popupFeatures	: "Funzioni finestra pop-up:",
		popupResizable	: "Ridimensionabile",
		popupStatusBar	: "Barra di stato",
		popupLocationBar	: "Barra degli indirizzi",
		popupToolbar	: "Barra degli strumenti",
		popupMenuBar	: "Barra dei menu",
		popupFullScreen	: "Schermo intero (IE)",
		popupScrollBars	: "Barre di scorrimento",
		popupDependent	: "Dipendente (Netscape)",
		popupLeft		: "Posizione sinistra",
		popupTop		: "Posizione superiore",
		id				: "Id:",
		langDir			: "Orientamento testo:",
		langDirLTR		: "Da sinistra a destra",
		langDirRTL		: "Da destra a sinistra",
		acccessKey		: "Chiave di accesso:",
		name			: "Nome:",
		langCode		: "Codice lingua:",
		tabIndex		: "Indice scheda:",
		advisoryTitle	: "Titolo avviso:",
		advisoryContentType	: "Tipo di contenuto advisory:",
		cssClasses		: "Classi foglio di stile:",
		charset			: "Set di caratteri risorsa collegata:",
		styles			: "Stile:",
		rel			: "Rapporto",
		selectAnchor	: "Selezionare un ancoraggio",
		anchorName		: "Per nome ancoraggio",
		anchorId		: "Per ID elemento",
		emailAddress	: "Indirizzo e-mail",
		emailSubject	: "Oggetto del messaggio",
		emailBody		: "Corpo del messaggio",
		noAnchors		: "Nessun segnalibro disponibile nel documento. Fare clic sull'icona 'Inserisci segnalibro del documento' sulla Barra degli strumenti per aggiungerne uno.",
		noUrl			: "Immettere l'URL del collegamento",
		noEmail			: "Immettere l'indirizzo e-mail"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Inserisci segnalibro del documento",
		menu		: "Modifica segnalibro del documento",
		title		: "Segnalibro del documento",
		name		: "Nome:",
		errorName	: "Immettere un nome per il segnalibro del documento",
		remove		: "Rimuovi segnalibro del documento"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Proprietà elenco numerato",
		bulletedTitle		: "Proprietà elenco puntato",
		type				: "Tipo",
		start				: "Inizio",
		validateStartNumber				:"Il numero di inizio dell'elenco deve essere un numero intero.",
		circle				: "Cerchio",
		disc				: "Disco",
		square				: "Quadrato",
		none				: "Nessuno",
		notset				: "<not set>",
		armenian			: "Numerazione armena",
		georgian			: "Numerazione georgiana (an, ban, gan e così via.)",
		lowerRoman			: "Romano minuscolo  (i, ii, iii, iv, v e così via.)",
		upperRoman			: "Romano maiuscolo (I, II, III, IV, V e così via.)",
		lowerAlpha			: "Alpha minuscolo (a, b, c, d, e, e così via.)",
		upperAlpha			: "Alpha maiuscolo (A, B, C, D, E e così via.)",
		lowerGreek			: "Greco minuscolo (alpha, beta, gamma e così via.)",
		decimal				: "Decimale (1, 2, 3 e così via.)",
		decimalLeadingZero	: "Zero iniziale decimale (01, 02, 03 e così via)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Trova e sostituisci",
		find				: "Trova",
		replace				: "Sostituisci",
		findWhat			: "Trova:",
		replaceWith			: "Sostituisci con:",
		notFoundMsg			: "Il testo specificato non è stato trovato.",
		noFindVal			: 'Il testo da cercare è obbligatorio.',
		findOptions			: "Opzioni trova",
		matchCase			: "Maiuscole/minuscole",
		matchWord			: "Parola intera",
		matchCyclic			: "Corrispondenza ciclica",
		replaceAll			: "Sostituisci tutto",
		replaceSuccessMsg	: "%1 ricorrenza sostituita."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Inserisci tabella",
		title		: "Tabella",
		menu		: "Proprietà tabella",
		deleteTable	: "Elimina tabella",
		rows		: "Righe:",
		columns		: "Colonne:",
		border		: "Dimensioni bordo:",
		widthPx		: "pixel",
		widthPc		: "%",
		widthUnit	: "Unità di larghezza:",
		cellSpace	: "Spaziatura celle:",
		cellPad		: "Riempimento celle:",
		caption		: "Didascalia:",
		summary		: "Sommario:",
		headers		: "Intestazioni:",
		headersNone		: "Nessuno",
		headersColumn	: "Prima colonna",
		headersRow		: "Prima riga",
		headersBoth		: "Entrambi",
		invalidRows		: "Il numero di righe deve essere un numero intero maggiore di zero.",
		invalidCols		: "Il numero di colonne deve essere un numero intero maggiore di zero.",
		invalidBorder	: "La dimensione del bordo deve essere un numero positivo.",
		invalidWidth	: "La dimensione della tabella deve essere un numero positivo.",
		invalidHeight	: "L'altezza della tabella deve essere un numero positivo.",
		invalidCellSpacing	: "La spaziatura delle celle deve essere un numero positivo.",
		invalidCellPadding	: "Il riempimento delle celle deve essere un numero positivo.",

		cell :
		{
			menu			: "Cella",
			insertBefore	: "Inserisci cella prima",
			insertAfter		: "Inserisci cella dopo",
			deleteCell		: "Elimina celle",
			merge			: "Unisci celle",
			mergeRight		: "Unisci a destra",
			mergeDown		: "Unisci in basso",
			splitHorizontal	: "Dividi la cella orizzontalmente",
			splitVertical	: "Dividi la cella verticalmente",
			title			: "Proprietà cella",
			cellType		: "Tipo di cella:",
			rowSpan			: "Intervallo righe:",
			colSpan			: "Intervallo colonne:",
			wordWrap		: "Manda a capo parola:",
			hAlign			: "Allineamento orizzontale:",
			vAlign			: "Allineamento verticale:",
			alignBaseline	: "Alla linea di base",
			bgColor			: "Colore sfondo:",
			borderColor		: "Colore del bordo:",
			data			: "Dati",
			header			: "Intestazione",
			yes				: "Sì",
			no				: "No",
			invalidWidth	: "La larghezza delle celle deve essere un numero positivo.",
			invalidHeight	: "L'altezza delle celle deve essere un numero positivo.",
			invalidRowSpan	: "L'intervallo delle righe deve essere un numero intero positivo.",
			invalidColSpan	: "L'intervallo delle colonne deve essere un numero intero positivo.",
			chooseColor : "Scegli"
		},

		row :
		{
			menu			: "Riga",
			insertBefore	: "Inserisci riga prima",
			insertAfter		: "Inserisci riga dopo",
			deleteRow		: "Elimina righe"
		},

		column :
		{
			menu			: "Colonna",
			insertBefore	: "Inserisci colonna prima",
			insertAfter		: "Inserisci colonna dopo",
			deleteColumn	: "Elimina colonne"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Proprietà pulsante",
		text		: "Testo (Valore):",
		type		: "Tipo:",
		typeBtn		: "Pulsante",
		typeSbm		: "Invia",
		typeRst		: "Ripristina"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Proprietà casella di spunta",
		radioTitle	: "Proprietà pulsante di scelta",
		value		: "Valore:",
		selected	: "Selezionato"
	},

	// Form Dialog.
	form :
	{
		title		: "Inserisci modulo",
		menu		: "Proprietà modulo",
		action		: "Azione:",
		method		: "Metodo:",
		encoding	: "Codifica:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Selezionare le proprietà dei campi",
		selectInfo	: "Selezionare Informazioni",
		opAvail		: "Opzioni disponibili",
		value		: "Valore:",
		size		: "Dimensione:",
		lines		: "righe",
		chkMulti	: "Consenti selezioni multiple",
		opText		: "Testo:",
		opValue		: "Valore:",
		btnAdd		: "Aggiungi",
		btnModify	: "Modifica",
		btnUp		: "Su",
		btnDown		: "Giù",
		btnSetValue : "Imposta come valore selezionato",
		btnDelete	: "Elimina"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Proprietà area di testo",
		cols		: "Colonne:",
		rows		: "Righe:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Proprietà campo di testo",
		name		: "Nome:",
		value		: "Valore:",
		charWidth	: "Larghezza carattere:",
		maxChars	: "Numero massimo caratteri:",
		type		: "Tipo:",
		typeText	: "Testo",
		typePass	: "Password"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Nascondi le proprietà dei campi",
		name	: "Nome:",
		value	: "Valore:"
	},

	// Image Dialog.
	image :
	{
		title		: "Immagine",
		titleButton	: "Proprietà pulsante immagine",
		menu		: "Proprietà immagine...",
		infoTab	: "Informazioni sull\'immagine",
		btnUpload	: "Invia al server",
		upload	: "Carica",
		alt		: "Testo alternativo:",
		lockRatio	: "Rapporto di blocco",
		resetSize	: "Ripristina dimensioni",
		border	: "Bordo:",
		hSpace	: "Spazio orizzontale:",
		vSpace	: "Spazio verticale:",
		alertUrl	: "Immettere l\'URL dell\'immagine",
		linkTab	: "Collegamento",
		button2Img	: "Trasformare il pulsante immagine selezionato in un\'immagine semplice?",
		img2Button	: "Trasformare l\'immagine selezionata in un pulsante immagine?",
		urlMissing : "Manca l\'URL di origine dell\'immagine.",
		validateBorder : "Il bordo deve essere un numero intero positivo.",
		validateHSpace : "Lo spazio orizzontale deve essere un numero intero positivo.",
		validateVSpace : "Lo spazio verticale deve essere un numero intero positivo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Proprietà Flash",
		propertiesTab	: "Proprietà",
		title		: "Flash",
		chkPlay		: "Riproduzione automatica",
		chkLoop		: "Loop",
		chkMenu		: "Abilita menu flash",
		chkFull		: "Consenti schermo intero",
 		scale		: "Scala:",
		scaleAll		: "Mostra tutto",
		scaleNoBorder	: "Nessun bordo",
		scaleFit		: "Adatta",
		access			: "Accesso script:",
		accessAlways	: "Sempre",
		accessSameDomain	: "Stesso dominio",
		accessNever	: "Mai",
		alignAbsBottom: "In basso assoluto",
		alignAbsMiddle: "In centro assoluto",
		alignBaseline	: "Alla linea di base",
		alignTextTop	: "In alto sul testo",
		quality		: "Qualità:",
		qualityBest	: "Massima",
		qualityHigh	: "Alta",
		qualityAutoHigh	: "Alta automatica",
		qualityMedium	: "Media",
		qualityAutoLow	: "Bassa automatica",
		qualityLow	: "Bassa",
		windowModeWindow	: "Finestra",
		windowModeOpaque	: "Opaca",
		windowModeTransparent	: "Trasparente",
		windowMode	: "Modalità finestra:",
		flashvars	: "Variabili:",
		bgcolor	: "Colore sfondo:",
		hSpace	: "Spazio orizzontale:",
		vSpace	: "Spazio verticale:",
		validateSrc : "È necessario fornire l\'URL.",
		validateHSpace : "Lo spazio orizzontale deve essere un numero intero positivo.",
		validateVSpace : "Lo spazio verticale deve essere un numero intero positivo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Controllo ortografico",
		title			: "Controllo ortografico",
		notAvailable	: "Al momento il servizio non è disponibile.",
		errorLoading	: "Errore nel caricamento dell\'host del servizio applicazione: %s.",
		notInDic		: "Non presente nel dizionario",
		changeTo		: "Cambia",
		btnIgnore		: "Ignora",
		btnIgnoreAll	: "Ignora tutto",
		btnReplace		: "Sostituisci",
		btnReplaceAll	: "Sostituisci tutto",
		btnUndo			: "Annulla",
		noSuggestions	: "- Nessun suggerimento -",
		progress		: "Controllo ortografico in corso...",
		noMispell		: "Controllo ortografico completato: nessun errore di ortografia trovato",
		noChanges		: "Controllo ortografico completato: nessuna parola cambiata",
		oneChange		: "Controllo ortografico completato: è stata cambiata una sola parola",
		manyChanges		: "Controllo ortografico completato: sono state cambiate %1 parole",
		ieSpellDownload	: "Correttore ortografico non installato. Scaricarlo ora?"
	},

	smiley :
	{
		toolbar	: "Inserisci Emoticon",
		title	: "Emoticon",
		options : "Opzioni Emoticon"
	},

	elementsPath :
	{
		eleLabel : "Percorso elementi",
		eleTitle : "Elemento %1"
	},

	numberedlist : "Elenco numerato",
	bulletedlist : "Elenco puntato",
	indent : "Aumenta rientro",
	outdent : "Diminuisci rientro",

	bidi :
	{
		ltr : "Da sinistra a destra",
		rtl : "Da destra a sinistra",
	},

	justify :
	{
		left : "Allinea a sinistra",
		center : "Centra",
		right : "Allinea a destra",
		block : "Allinea giustificato"
	},

	blockquote : "Citazione",

	clipboard :
	{
		title		: "Incolla",
		cutError	: "Le impostazioni di sicurezza del browser impediscono il taglio automatico. In alternativa, utilizzare Ctrl+X sulla tastiera.",
		copyError	: "Le impostazioni della sicurezza del browser impediscono la copia automatica. In alternativa, utilizzare Ctrl+C sulla tastiera.",
		pasteMsg	: "Premere Ctrl+V (Cmd+V su MAC) per incollare sotto.",
		securityMsg	: "La sicurezza del browser blocca l'incollatura direttamente dagli appunti.",
		pasteArea	: "Area di incollatura"
	},

	pastefromword :
	{
		confirmCleanup	: "Il testo da incollare sembra sia stato copiato da Word. Cancellarlo prima di incollarlo?",
		toolbar			: "Incolla speciale",
		title			: "Incolla speciale",
		error			: "Non è stato possibile cancellare i dati incollati a causa di un errore interno"
	},

	pasteText :
	{
		button	: "Incolla come testo normale",
		title	: "Incolla come testo normale"
	},

	templates :
	{
		button 			: "Modelli",
		title : "Modelli di contenuto",
		options : "Opzioni modello",
		insertOption: "Sostituisci contenuto effettivo",
		selectPromptMsg: "Selezionare il modello da aprire nell\'editor",
		emptyListMsg : "(Nessun modello definito)"
	},

	showBlocks : "Mostra blocchi",

	stylesCombo :
	{
		label		: "Stili",
		panelTitle 	: "Stili",
		panelTitle1	: "Stili blocco",
		panelTitle2	: "Stili in linea",
		panelTitle3	: "Stili oggetto"
	},

	format :
	{
		label		: "Formato",
		panelTitle	: "Formato paragrafo",

		tag_p		: "Normale",
		tag_pre		: "Formattato",
		tag_address	: "Indirizzo",
		tag_h1		: "Intestazione 1",
		tag_h2		: "Intestazione 2",
		tag_h3		: "Intestazione 3",
		tag_h4		: "Intestazione 4",
		tag_h5		: "Intestazione 5",
		tag_h6		: "Intestazione 6",
		tag_div		: "Normale (DIV)"
	},

	div :
	{
		title				: "Crea contenitore Div",
		toolbar				: "Crea contenitore Div",
		cssClassInputLabel	: "Classi foglio di stile",
		styleSelectLabel	: "Stile",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Codice lingua",
		inlineStyleInputLabel	: "Stile in linea",
		advisoryTitleInputLabel	: "Titolo advisory",
		langDirLabel		: "Orientamento testo",
		langDirLTRLabel		: "Da sinistra a destra",
		langDirRTLLabel		: "Da destra a sinistra",
		edit				: "Modifica Div",
		remove				: "Rimuovi Div"
  	},

	iframe :
	{
		title		: "Proprietà IFrame",
		toolbar		: "Inserisci IFrame",
		noUrl		: "Immettere l'URL iframe",
		scrolling	: "Abilita barre di scorrimento",
		border		: "Mostra bordo cornice"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Nome font"
	},

	fontSize :
	{
		label		: "Dimensioni",
		voiceLabel	: "Dimensione font",
		panelTitle	: "Dimensione font"
	},

	colorButton :
	{
		textColorTitle	: "Colore testo",
		bgColorTitle	: "Colore sfondo",
		panelTitle		: "Colori",
		auto			: "Automatico",
		more			: "Altri colori..."
	},

	colors :
	{
		"000" : "Nero",
		"800000" : "Bordeaux",
		"8B4513" : "Cacao",
		"2F4F4F" : "Grigio ardesia scuro",
		"008080" : "Verde acqua",
		"000080" : "Blu scuro",
		"4B0082" : "Indaco",
		"696969" : "Grigio scuro",
		"B22222" : "Mattone",
		"A52A2A" : "Marrone",
		"DAA520" : "Dorato scuro",
		"006400" : "Verde scuro",
		"40E0D0" : "Turchese",
		"0000CD" : "Blu medio",
		"800080" : "Viola",
		"808080" : "Grigio",
		"F00" : "Rosso",
		"FF8C00" : "Arancione scuro",
		"FFD700" : "Dorato",
		"008000" : "Verde",
		"0FF" : "Azzurro",
		"00F" : "Blu",
		"EE82EE" : "Violetto",
		"A9A9A9" : "Grigio tenue",
		"FFA07A" : "Salmone chiaro",
		"FFA500" : "Arancione",
		"FFFF00" : "Giallo",
		"00FF00" : "Verde limone",
		"AFEEEE" : "Turchese chiaro",
		"ADD8E6" : "Blu chiaro",
		"DDA0DD" : "Prugna",
		"D3D3D3" : "Grigio chiaro",
		"FFF0F5" : "Lavanda rosato",
		"FAEBD7" : "Rosa antico",
		"FFFFE0" : "Giallo chiaro",
		"F0FFF0" : "Miele",
		"F0FFFF" : "Azzurro cielo",
		"F0F8FF" : "Blu alice",
		"E6E6FA" : "Lilla",
		"FFF" : "Bianco"
	},

	scayt :
	{
		title			: "Controllo ortografico durante la digitazione",
		opera_title		: "Non supportato da Opera",
		enable			: "Abilita SCAYT",
		disable			: "Disabilita SCAYT",
		about			: "Informazioni su SCAYT",
		toggle			: "Attiva/Disattiva SCAYT",
		options			: "Opzioni",
		langs			: "Lingue",
		moreSuggestions	: "Altri suggerimenti",
		ignore			: "Ignora",
		ignoreAll		: "Ignora tutto",
		addWord			: "Aggiungi parola",
		emptyDic		: "È necessario indicare il nome del dizionario.",

		optionsTab		: "Opzioni",
		allCaps			: "Ignora tutte le parole maiuscole",
		ignoreDomainNames : "Ignora nomi dominio",
		mixedCase		: "Ignora parole con miscellanea di maiuscolo e minuscolo",
		mixedWithDigits	: "Ignora parole con numeri",

		languagesTab	: "Lingue",

		dictionariesTab	: "Dizionari",
		dic_field_name	: "Nome dizionario",
		dic_create		: "Crea",
		dic_restore		: "Ripristina",
		dic_delete		: "Elimina",
		dic_rename		: "Rinomina",
		dic_info		: "Inizialmente, il dizionario utente è memorizzato in un Cookie. Tuttavia, i Cookie hanno una dimensione limitata. Quando il dizionario utente aumenta al punto in cui non può più essere memorizzato in un Cookie, esso può essere memorizzato sul proprio server. Per memorizzare il dizionario personale sul server, è necessario specificare un nome per il dizionario. Se già si dispone di un dizionario memorizzato, immetterne il nome e fare clic sul pulsante Ripristina.",

		aboutTab		: "Informazioni"
	},

	about :
	{
		title		: "Informazioni su CKEditor",
		dlgTitle	: "Informazioni su CKEditor",
		help	: "Controlla $1 per la guida.",
		userGuide : "Guida per l'utente CKEditor",
		moreInfo	: "Per informazioni sulla licenza, visitare il nostro sito Web:",
		copy		: "Copyright &copy; $1. Tutti i diritti riservati."
	},

	maximize : "Ingrandisci al massimo",
	minimize : "Riduci al minimo",

	fakeobjects :
	{
		anchor	: "Ancoraggio",
		flash	: "Animazione Flash",
		iframe		: "IFrame",
		hiddenfield	: "Campo nascosto",
		unknown	: "Oggetto sconosciuto"
	},

	resize : "Trascinare per ridimensionare",

	colordialog :
	{
		title		: "Seleziona un colore",
		options	:	"Opzioni colore",
		highlight	: "Evidenzia",
		selected	: "Colore selezionato",
		clear		: "Cancella"
	},

	toolbarCollapse	: "Comprimi barra degli strumenti",
	toolbarExpand	: "Espandi barra degli strumenti",

	toolbarGroups :
	{
		document : "Documento",
		clipboard : "Appunti/Annulla",
		editing : "Modifica",
		forms : "Moduli",
		basicstyles : "Stili di base",
		paragraph : "Paragrafo",
		links : "Collegamenti",
		insert : "Inserisci",
		styles : "Stili",
		colors : "Colori",
		tools : "Strumenti"
	},

	bidi :
	{
		ltr : "Passa al testo da sinistra a destra",
		rtl : "Passa al testo da destra a sinistra"
	},

	docprops :
	{
		label : "Proprietà del documento",
		title : "Proprietà del documento",
		design : "Progettazione",
		meta : "Meta Tag",
		chooseColor : "Scegli",
		other : "Altro...",
		docTitle :	"Titolo pagina",
		charset : 	"Codifica set di caratteri",
		charsetOther : "Altra codifica set di caratteri",
		charsetASCII : "ASCII",
		charsetCE : "Europeo centrale",
		charsetCT : "Cinese tradizionale (Big5)",
		charsetCR : "Cirillico",
		charsetGR : "Greco",
		charsetJP : "Giapponese",
		charsetKR : "Coreano",
		charsetTR : "Turco",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europeo occidentale",
		docType : "Intestazione tipo di documento",
		docTypeOther : "Altra intestazione tipo di documento",
		xhtmlDec : "Includi dichiarazioni XHTML",
		bgColor : "Colore sfondo",
		bgImage : "URL immagine di sfondo",
		bgFixed : "Sfondo non mobile (fisso)",
		txtColor : "Colore testo",
		margin : "Margini pagina",
		marginTop : "In alto",
		marginLeft : "A sinistra",
		marginRight : "A destra",
		marginBottom : "In basso",
		metaKeywords : "Parole chiave indicizzazione documento (separate da virgole)",
		metaDescription : "Descrizione documento",
		metaAuthor : "Autore",
		metaCopyright : "Copyright",
		previewHtml : "<p>Questo è un <strong>testo di esempio</strong>. Si sta utilizzando <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "pollici",
			widthCm	: "centimetri",
			widthMm	: "millimetri",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "punti",
			widthPc	: "pica"
		},
		table :
		{
			heightUnit	: "Unità di altezza:",
			insertMultipleRows : "Inserisci righe",
			insertMultipleCols : "Inserisci colonne",
			noOfRows : "Numero di righe:",
			noOfCols : "Numero di colonne:",
			insertPosition : "Posizione:",
			insertBefore : "Prima",
			insertAfter : "Dopo",
			selectTable : "Seleziona tabella",
			selectRow : "Seleziona riga",
			columnTitle : "Colonna",
			colProps : "Proprietà colonna",
			invalidColumnWidth	: "La larghezza della colonna deve essere un numero positivo."
		},
		cell :
		{
			title : "Cella"
		},
		emoticon :
		{
			angel		: "Angelo",
			angry		: "Arrabbiato",
			cool		: "Sfacciato",
			crying		: "In lacrime",
			eyebrow		: "Accigliato",
			frown		: "Accigliato",
			goofy		: "Sciocco",
			grin		: "Ghigno",
			half		: "Metà",
			idea		: "Idea",
			laughing	: "Allegro",
			laughroll	: "A bocca aperta",
			no			: "No",
			oops		: "Oops",
			shy			: "Timido",
			smile		: "Sorriso",
			tongue		: "Lingua",
			wink		: "Occhiolino",
			yes			: "Sì"
		},

		menu :
		{
			link	: "Inserisci collegamento",
			list	: "Elenco",
			paste	: "Incolla",
			action	: "Azione",
			align	: "Allinea",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Elenco numerato",
			bulletedTitle		: "Elenco puntato"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Immettere un nome segnalibro descrittivo, come 'Sezione 1.2'. Dopo aver inserito il segnalibro, fare clic sull'icona 'Collegamento' o su 'Collegamento al segnalibro del documento' per collegarsi ad esso.",
			title		: "Collegamento al segnalibro del documento",
			linkTo		: "Collegamento a:"
		},

		urllink :
		{
			title : "Collegamento URL",
			linkText : "Testo del collegamento:",
			selectAnchor: "Selezionare un ancoraggio:",
			nourl: "Immettere un URL nel campo di testo.",
			urlhelp: "Immettere o incollare un URL da aprire quando si fa clic su questo collegamento, ad esempio http://www.example.com.",
			displaytxthelp: "Immettere la visualizzazione testo per il collegamento.",
			openinnew : "Apri collegamento in una nuova finestra"
		},

		spellchecker :
		{
			title : "Controllo ortografia",
			replace : "Sostituisci:",
			suggesstion : "Suggerimenti:",
			withLabel : "Con:",
			replaceButton : "Sostituisci",
			replaceallButton:"Sostituisci tutto",
			skipButton:"Ignora",
			skipallButton: "Ignora tutto",
			undochanges: "Annulla modifiche",
			complete: "Controllo ortografico completato",
			problem: "Problema nel richiamo dei dati XML",
			addDictionary: "Aggiungi al dizionario",
			editDictionary: "Modifica dizionario"
		},

		status :
		{
			keystrokeForHelp: "Premere ALT 0 per la guida"
		},

		linkdialog :
		{
			label : "Finestra di dialogo Collegamento"
		},

		image :
		{
			previewText : "Il testo scorrerà intorno all'immagine che si sta aggiungendo come in questo esempio."
		}
	}

};
