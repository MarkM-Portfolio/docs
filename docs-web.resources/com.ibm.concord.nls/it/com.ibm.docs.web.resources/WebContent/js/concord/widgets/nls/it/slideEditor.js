/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

({
	ctxMenu_createSlide: 	"Crea diapositiva",
	ctxMenu_renameSlide: 	"Rinomina diapositiva",
	ctxMenu_deleteSlide: 	"Elimina diapositiva",
	ctxMenu_selectAll: 	 	"Seleziona tutto",
	ctxMenu_createTextBox: 	"Aggiungi casella di testo",
	ctxMenu_addImage:	 	"Aggiungi un\'immagine",		
	ctxMenu_createTable: 	"Crea tabella",
	ctxMenu_slideTransition: "Transizioni diapositiva",
	ctxMenu_slideTransitionTitle: "Seleziona una transizione",
	ctxMenu_slideLayout: 	"Layout diapositiva",
	ctxMenu_slideTemplates: "Stili principali",
	ctxMenu_paste: 	 		"Incolla",
	ctxMenu_autoFix: 		"Correggi automaticamente",
		
	imageDialog: {	
		titleInsert:		"Inserisci immagine",
		insertImageBtn:		"Inserisci",							
		URL:				"URL:",
		uploadFromURL:		"Immagine dal web",
		imageGallery:		"Galleria di immagini",
		uploadAnImageFile:	"Immagine da file",
		uploadImageFileTitle: "Specificare un'immagine da caricare dal file",
		insertImageErrorP1: "Impossibile inserire l'immagine nel documento.",
		insertImageErrorP2: "Esiste un problema sul server, ad esempio spazio insufficiente sul disco.",
		insertImageErrorP3: "Chiedere al proprio amministratore di controllare il registro del server per identificare il problema."
	},
	
	concordGallery:{
		results:		"Risultati: ${0}",
		show:			"Mostra:",
		all	:			"Tutto",
		images:			"Immagini",
		pictures: 		"Foto",
		arrows: 		"Frecce",
		bullets: 		"Punti elenco",
		computer: 		"Computer",
		diagram: 		"Diagramma",
		education: 		"Istruzione",
		environment: 	"Ambiente",
		finance: 		"Finanza",
		people: 		"Persone",
		shape: 			"Forme",
		symbol: 		"Simboli",
		transportation:	"Trasporto",
		table:			"Tabelle",
		search:			"Cerca",
		loading:		"Caricamento in corso..."
	},
	
	contentLockTitle: "Messaggio di blocco contenuto",
	contentLockMsg :  "L'operazione non può essere eseguita su alcuni degli oggetti selezionati perché tali oggetti sono attualmente utilizzati dai seguenti utenti:",
	contentLockemail: "e-mail",
	
	warningforRotatedShape: "L'operazione non può essere eseguita su alcuni degli oggetti selezionati perché tali oggetti sono oggetti ruotati.",
	
	cannotCreateShapesTitle: "Impossibile creare forme",
	cannotCreateShapesMessage: "${productName} non supporta la creazione di forme in versioni di Internet Explorer precedenti alla 9. Per creare delle forme, utilizzare un browser diverso.",
	cannotShowShapesTitle: "Impossibile visualizzare le forme",

	slidesInUse:"Diapositive in uso",
	slidesInUseAll: "Impossibile eseguire l'operazione sulle diapositive selezionate perché alcune di esse sono al momento utilizzate dai seguenti utenti:",
	slidesInUseSome: "Impossibile eseguire l'operazione su alcune delle diapositive selezionate, perché sono al momento utilizzate dai seguenti utenti:",
	
	contentInUse:"Contenuto in uso",
	contentInUseAll:"Impossibile eseguire l'operazione sul contenuto della diapositiva selezionato, perché una parte di tale contenuto è al momento utilizzato dai seguenti utenti:",
	contentInUseSome:"Impossibile eseguire l'operazione su una parte del contenuto della diapositiva selezionata, perché quel contenuto è al momento utilizzato dai seguenti utenti:",
		
	undoContentNotAvailable: "Non è stato possibile eseguire l'operazione di annullamento perché il contenuto non è più disponibile.",
	redoContentNotAvailable: "Non è stato possibile eseguire l'operazione di ripetizione perché il contenuto non è più disponibile.",
	undoContentAlreadyExist: "Non è stato possibile eseguire l'operazione di annullamento perché il contenuto già esiste." ,
	redoContentAlreadyExist: "Non è stato possibile eseguire l'operazione di ripetizione perché il contenuto già esiste.",
	
	preventTemplateChange:"Diapositive in uso",
	preventTemplateChangeMsg: "Lo stile principale non può essere cambiato mentre un altro utente sta modificando la presentazione.",
	
	createTblTitle: 	"Crea una tabella",
	createTblLabel: 	"Immettere il numero di righe e colonne. Il valore massimo è 10.",
	createTblNumRows: "Numero di righe",
	createTblNumCols: "Numero di colonne",
	createTblErrMsg:  "Accertarsi che il valore sia un numero intero positivo, non sia vuoto e non sia maggiore di 10.",

	insertTblRowTitle: 	"Inserisci righe",
	insertTblRowNumberOfRows: 	"Numero di righe:",
	insertTblRowNumberPosition: 	"Posizione:",
	insertTblRowAbove: 	"Sopra",
	insertTblRowBelow: 	"Sotto",
	
	insertTblColTitle: 	"Inserisci colonne",
	insertTblColNumberOfCols: 	"Numero di colonne:",
	insertTblColNumberPosition: 	"Posizione:",
	insertTblColBefore: "Prima",
	insertTblColAfter: 	"Dopo",
	
	insertVoicePosition: "Posizione",
	
 	defaultText_newBox2: "Fare doppio clic per aggiungere il testo",	
	defaultText_newBox: "Fare clic per aggiungere testo",
	defaultText_speakerNotesBox: "Fare clic per aggiungere le note",
	
	cannotAddComment_Title: "Impossibile aggiungere un commento",
	cannotAddComment_Content: "Impossibile allegare commenti a questa casella di testo o a questa diapositiva. La casella di testo o la diapositiva possono supportare un massimo di ${0} commenti. ",
	
	invalidImageType: "Questo tipo di immagine al momento non è supportato. Trasformare l\'immagine in un formato .bmp, .jpg, .jpeg, .gif o .png e riprovare.",
	
	error_unableToDestroyTABContentsInDialog: "Impossibile distruggere il contenuto della scheda nella finestra di dialogo",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Annulla",
	preparingSlide: "Preparazione in corso della diapositiva per la modifica",
	
	slideCommentClose: "Chiudi commento",
	slideCommentDone: "Fatto",
	slideCommentPrev: "Indietro",
	slideCommentNext: "Avanti"
})

