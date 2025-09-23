({
	//actionNew dojo menu
	newName : "Nuovo",
	newTooltip : "Crea un documento",
	WARN_INTERNAL : "Una volta creato un file, non è possibile modificare l'autorizzazione per la condivisione con altri all'esterno dell'organizzazione.",
	newCommunityInfo : "I membri della comunità possono modificare questo file.",
  	CANCEL : "Annulla",
  	DOWNLOAD_EMPTY_TITLE : "Impossibile scaricare il file",
  	DOWNLOAD_EMPTY_OK : "Chiudi",
  	DOWNLOAD_EMPTY_CONTENT1 : "Non esiste alcuna versione pubblicata di questo file da scaricare.",
  	DOWNLOAD_EMPTY_CONTENT2 : "È possibile pubblicare versioni dall'editor Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Impossibile scaricare il file",
  	DOWNLOAD_EMPTYVIEW_OK : "Chiudi",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Non esiste alcuna versione pubblicata di questo file da scaricare.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Chiedere al proprietario del file di pubblicare una versione di tale file.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Scarica una versione",
  	DOWNLOAD_NEWDRAFT_OK : "Scarica versione",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "ultima modifica il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "ultima modifica il ${date}",	
		TODAY: "ultima modifica oggi alle ${time}",	
		YEAR: "ultima modifica il ${date_long}",	
		YESTERDAY:	"ultima modifica ieri alle ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "È stata rilevata una nuova bozza, modificata per l'ultima volta il ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "È stata rilevata una nuova bozza, modificata per l'ultima volta il ${date}.",	
		TODAY: "È stata rilevata una nuova bozza, modificata per l'ultima volta oggi alle ${time}.",	
		YEAR: "È stata rilevata una nuova bozza, modificata per l'ultima volta il ${date_long}.",	
		YESTERDAY:	"È stata rilevata una nuova bozza, modificata per l'ultima volta ieri alle ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Continuare a scaricare la versione pubblicata il ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Continuare a scaricare la versione pubblicata il ${date}?",	
		TODAY: "Continuare a scaricare la versione pubblicata oggi alle ${time}?",	
		YEAR: "Continuare a scaricare la versione pubblicata il ${date_long}?",	
		YESTERDAY:	"Continuare a scaricare la versione pubblicata ieri alle ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Questa è la versione scaricabile più recente di un file Docs. Per sapere se esiste una versione successiva in formato bozza, rivolgersi al proprietario del file.",

  	VIEW_FILE_DETAILS_LINK : "Visualizza dettagli file",
  	OPEN_THIS_FILE_TIP: "Apri questo file",
  
	//newDocument 
	newDocumentName : "Documento",
	newDocumentTooltip : "Nuovo documento",
	newDocumentDialogTitle : "Nuovo documento",
	newDocumentDialogContent : "Fornire un nome per questo documento senza titolo.",
	newDocumentDialogBtnOK : "Crea",
	newDocumentDialogBtnOKTitle : "Crea un documento",
	newDocumentDialogInitialName : "Documento senza titolo",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "Testo OpenDocument(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Annulla",
	newDocumentDialogNamepre : "*Nome:",
	newDocumentDialogDocumentTypePre : "Tipo:",
	newDocumentDialogDocumentChangeTypeLink : "Modifica estensione file predefinita",
	newDocumentDialogDupErrMsg : "È stato rilevato un nome file duplicato. Immettere un nuovo nome.",
	newDocumentDialogIllegalErrMsg : "${0} è un titolo di documento non consentito; specificare un altro nome.",
	newDocumentDialogNoNameErrMsg : "Il nome del documento è obbligatorio.",
	newDocumentDialogNoPermissionErrMsg : "Impossibile creare il file poiché non si dispone dell'accesso di editor. Rivolgersi all'amministratore.",
	newDocumentDialogServerErrMsg : "Il server Docs non è disponibile. Rivolgersi all'amministratore del server e riprovare in seguito.",
	newDocumentDialogServerErrMsg2 : "Il server Connections non è disponibile. Rivolgersi all'amministratore del server e riprovare in seguito.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Abbreviare il nome del documento?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Il nome del documento è troppo lungo.",
	newDialogProblemidErrMsg : "Riportare il problema all'amministratore ",
	newDialogProblemidErrMsg_tip : "Riportare il problema all'amministratore ${shown_action}",
	newDialogProblemidErrMsgShow: "Fare clic per mostrare i dettagli",
	newDialogProblemidErrMsgHide: "Fare clic per nascondere",
	newDocumentDialogTargetPre: "*Salva in:",
	newDocumentDialogTargetCommunity: "Questa comunità",
	newDocumentDialogTargetMyFiles: "File personali",

	//newSpreadsheet 
	newSheetName : "Foglio di calcolo",
	newSheetTooltip : "Nuovo foglio di calcolo",
	newSheetDialogTitle : "Nuovo foglio di calcolo",
	newSheetDialogBtnOKTitle : "Crea un foglio di calcolo",
	newSheetDialogInitialName : "Foglio di calcolo senza titolo",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "Foglio di calcolo OpenDocument(*.ods)"
  	},

	//newPresentation 
	newPresName : "Presentazione",
	newPresTooltip : "Nuova presentazione",
	newPresDialogTitle : "Nuova presentazione",
	newPresDialogBtnOKTitle : "Crea una presentazione",
	newPresDialogInitialName : "Presentazione senza titolo",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "Presentazione OpenDocument(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Crea un file",
	newFromDialogName : "Nuovo da file",
	newFromTooltip: "Crea un nuovo file utilizzando questo file come modello",
	newFromDocTip : "Crea un documento (file DOC, DOCX o ODT) da un file modello. È possibile modificare questi documenti online in Docs.",
	newFromSheetTip : "Crea un foglio di calcolo (file XLS, XLSX o ODS) da un file modello. È possibile modificare questi fogli di lavoro online in Docs.",
	newFromPresTip : "Crea una presentazione (file PPT, PPTX o ODP) da un file modello. È possibile modificare queste presentazioni online in Docs.",

	//actionEdit
	editName : "Modifica in Docs",
	editTooltip : "Modifica in Docs",
	editWithDocsDialogTitle : "Avviare la modifica online con Docs?",
	editWithDocsDialogContent1 : "Docs consente di collaborare su file con altri utenti contemporaneamente e di visualizzare immediatamente le modifiche. È inoltre possibile lavorare in linea privatamente.",
	editWithDocsDialogContent2 : "Non è necessario caricare nuove versioni di un documento. Se tutte le modifiche vengono eseguite in linea, sia il lavoro che i commenti sono protetti. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Modifica in linea",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Visualizza",
	viewTooltip : "Visualizza in anteprima il file in un browser",

	//doc too large
	docTooLargeTitle : "Il documento è troppo grande.",
	docTooLargeDescription : "Il documento che si desidera modificare è troppo grande. <br />Accertarsi che la dimensione del file in formato *.odt, *.doc <br />o *.docx non superi 2048 K.",
	docTooLargeCancelBtn: "Annulla",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Modifica corrente: ",
		
	//Sheet title
	sheetTitle0: "Foglio1",
	sheetTitle1: "Foglio2",
	sheetTitle2: "Foglio3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Scarica come formato Microsoft Office",
	downloadAsPDF: "Scarica come file PDF",
	downloadWithUnsavedDraftTitle: "Bozza in sospeso",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "Questa versione potrebbe non contenere le ultime modifiche in linea. Fare clic su Salva per creare una nuova versione ed eseguire il download. Fare clic su Annulla per continuare senza salvare.",
	downloadWithUnsavedDraftReadersDescription: "Questa versione potrebbe non contenere le ultime modifiche. La versione del documento scaricato sarà l'ultima versione salvata con un editor del documento. Si desidera continuare?",

	//draft tab

	draft_tab_title : "Bozza",
	draft_created : "${0} basato sulla Versione ${1}",
	draft_published : "Le ultime modifiche nella bozza sono state pubblicate.",
	draft_beiing_edited : "Questo file è attualmente in corso di modifica sul web da parte di ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "È possibile modificare solo i file che sono documenti Docs.",
	draft_unpublished_tip : "Alcune delle modifiche a questa bozza non sono state pubblicate come una versione. ${publish_action}",
	draft_save_action_label : "Pubblica una versione",
	draft_not_found : "Non ci sono modifiche di bozza per questo file.",
	draft_latest_edit : "Ultima modifica:",
	draft_cur_editing : "Modifica corrente:",
	draft_edit_link : "Modifica",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Questo è un file Docs. Tutte le modifiche devono essere eseguite in linea.",
	nonentitlement_docs_indicator_text: "Questo file è disponibile per la modifica online solo se è stato acquistato un diritto Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} pubblicato il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} pubblicato il ${date}",	
		TODAY: "${user} pubblicato oggi alle ${time}",	
		YEAR: "${user} pubblicato il ${date_long}",	
		YESTERDAY:	"${user} pubblicato ieri alle ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Pubblicato il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Pubblicato il ${date}",	
		TODAY: "Pubblicato oggi alle ${time}",	
		YEAR: "Pubblicato il ${date_long}",	
		YESTERDAY:	"Pubblicato ieri alle ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} versione pubblicata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} versione pubblicata il ${date}",	
		TODAY: "${user} versione pubblicata oggi alle ${time}",	
		YEAR: "${user} versione pubblicata il ${date_long}",	
		YESTERDAY:	"${user} versione pubblicata ieri alle ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Versione pubblicata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Versione pubblicata il ${date}",	
		TODAY: "Versione pubblicata oggi alle ${time}",	
		YEAR: "Versione pubblicata il ${date_long}",	
		YESTERDAY:	"Versione pubblicata ieri alle ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} creato il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} creato il ${date}",	
		TODAY: "${user} creato oggi alle ${time}",	
		YEAR: "${user} creato il ${date_long}",	
		YESTERDAY:	"${user} creato ieri alle ${time}"
	},
	LABEL_CREATED: {
		DAY: "Creato il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Creato il ${date}",	
		TODAY: "Creato oggi alle ${time}",	
		YEAR: "Creato il ${date_long}",	
		YESTERDAY:	"Creato ieri alle ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} bozza modificata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} bozza modificata il ${date}",	
		TODAY: "${user} bozza modificata oggi alle ${time}",	
		YEAR: "${user} bozza modificata il ${date_long}",	
		YESTERDAY:	"${user} bozza modificata ieri alle ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Bozza modificata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Bozza modificata il ${date}",	
		TODAY: "Bozza modificata oggi alle ${time}",	
		YEAR: "Bozza modificata il ${date_long}",	
		YESTERDAY:	"Bozza modificata ieri alle ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} bozza creata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} bozza creata il ${date}",	
		TODAY: "${user} bozza creata oggi alle ${time}",	
		YEAR: "${user} bozza creata il ${date_long}",	
		YESTERDAY:	"${user} bozza creata ieri alle ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Bozza creata il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Bozza creata il ${date}",	
		TODAY: "Bozza creata oggi alle ${time}",	
		YEAR: "Bozza creata il ${date_long}",	
		YESTERDAY:	"Bozza creata ieri alle ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Modificato il ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Modificato il ${date}",	
		TODAY: "Modificato oggi alle ${time}",	
		YEAR: "Modificato il ${date_long}",	
		YESTERDAY:	"Modificato ieri alle ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Browser non supportato",
	unSupporteBrowserContent1: "Spiacenti, il browser utilizzato potrebbe non funzionare correttamente con Docs. Per risultati ottimali, provare a usare uno dei seguenti browser supportati.",
	unSupporteBrowserContent2: "È possibile continuare a utilizzare il browser corrente, ma alcune funzioni Docs potrebbero non essere disponibili.",
	unSupporteBrowserContent3: "Non visualizzare più questo messaggio.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Novità per File e Docs?",
	INTRODUCTION_BOX_BLURB: "Caricare e condividere i propri file. Creare e condividere file singolarmente o collaborando con altri utenti tramite Docs. Organizzare i file in cartelle, seguirli per tenere traccia delle modifiche e memorizzare i propri siti preferiti.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Accedere per iniziare a utilizzare File e Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Fare clic su "Carica File" per aggiungere un file. Fare clic su "Nuovo" per creare un file con Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Fare clic su Carica File per aggiungere un file. Fare clic su Nuovo per creare un file con Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Chiudere la sezione "Benvenuti in File e Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Crea e collabora al contenuto con i colleghi. Impara a:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Aggiungere i file.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Avviare la modifica in linea, in tempo reale, individualmente o in collaborazione.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Caricare e modificare documenti, fogli di calcolo o presentazioni.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Aggiungere i propri file{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Iniziare la modifica online, in tempo reale, in modo individuale o collaborativo{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Caricare e modificare documenti, fogli di calcolo o presentazioni{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Impostazione pagina",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientamento",
	PORTRAIT: "Verticale",
	LANDSCAPE: "Orizzontale",	
	MARGINS_LABEL: "Margini",
	TOP: "Superiore:",
	TOP_DESC:"Margine superiore, in centimetri",
	TOP_DESC2:"Margine superiore, in pollici",
	BOTTOM: "Inferiore:",
	BOTTOM_DESC:"Margine inferiore, in centimetri",
	BOTTOM_DESC2:"Margine inferiore, in pollici",
	LEFT: "Sinistro:",
	LEFT_DESC:"Margine sinistro, in centimetri",
	LEFT_DESC2:"Margine sinistro, in pollici",	
	RIGHT: "Destro:",
	RIGHT_DESC:"Margine destro, in centimetri",
	RIGHT_DESC2:"Margine destro, in pollici",
	PAPER_FORMAT_LABEL: "Formato carta",
	PAPER_SIZE_LABEL: "Dimensione carta:",
	HEIGHT: "Altezza:",
	HEIGHT_DESC:"Altezza carta, in centimetri",
	HEIGHT_DESC2:"Altezza carta, in pollici",	
	WIDTH: "Larghezza:",
	WIDTH_DESC:"Larghezza carta, in centimetri",
	WIDTH_DESC2:"Larghezza carta, in pollici",
	CM_LABEL: "cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Utente",
	SIZE1: "Busta #6 3/4",
	SIZE2: "Busta Monarch",
	SIZE3: "Busta #9",
	SIZE4: "Busta #10",
	SIZE5: "Busta #11",
	SIZE6: "Busta #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai grande",
	DISPLAY_OPTION_LABEL: "Opzioni di visualizzazione",
	HEADER: "Intestazione",
	HEADER_DESC:"Altezza intestazione, in centimetri",	
	FOOTER: "Piè di pagina",
	FOOTER_DESC:"Altezza piè di pagina, in centimetri",
	GRIDLINE: "Linee griglia",
	TAGGED_PDF: "PDF con tag",
	PAGE_LABEL: "Ordine pagine",
	PAGE_TYPE1: "Dall'alto in basso, quindi a destra",
	PAGE_TYPE2: "Da sinistra a destra, quindi in basso",
	PAGE_SETUP_INVALID_MSG: "L'input non è valido ed è stato corretto automaticamente. Inserire un altro valore per ottenere un risultato differente.",
	
	//Docs publish message
	service_unavailable_content: "Il servizio Docs non è disponibile. Al momento è impossibile elaborare la richiesta. Riprovare in seguito o rivolgersi all'amministratore di sistema.",
	viewaccess_denied_content: "Non si dispone dell'autorizzazione per visualizzare questo file. Il file deve essere reso pubblico o deve essere condiviso con l'utente.",
	editaccess_denied_content: "Non si dispone dell'autorizzazione per modificare questo file. L'utente deve disporre del diritto a utilizzare Docs e dell'accesso di editor al file oppure il file deve esserere stato condiviso con l'utente.",
	doc_notfound_content: "Il documento al quale si desidera accedere è stato eliminato o spostato. Verificare che il collegamento sia corretto.",
	repository_out_of_space_content: "Non si dispone dello spazio sufficiente per salvare il nuovo documento. Rimuovere altri file per liberare spazio sufficiente per salvare questo documento.",
	fileconnect_denied_content: "Docs non è in grado di collegarsi al respository di file. Riprovare in seguito o rivolgersi all'amministratore di sistema.",
	convservice_unavailable_content: "Il servizio di conversione Docs non è disponibile. Al momento è impossibile elaborare la richiesta. Riprovare in seguito o rivolgersi all'amministratore di sistema.",
	doc_toolarge_content: "Il documento cui si desidera accedere è troppo grande.",
	conversion_timeout_content: "Al momento, la conversione del documento richiede troppo tempo. Riprovare in seguito.",
	storageserver_error_content: "Il server non è al momento disponibile. Al momento è impossibile elaborare la richiesta. Riprovare in seguito o rivolgersi all'amministratore di sistema.",
	server_busy_content:"Attendere qualche minuto e riprovare.",
	publish_locked_file: "Impossibile pubblicare questo file come nuova versione perché è bloccato; tuttavia, il contenuto viene salvato automaticamente in bozza.",
	publishErrMsg: "La versione non è stata pubblicata. Il file potrebbe essere troppo grande, oppure il server potrebbe essere andato in timeout. Riprovare, oppure annullare e chiedere al proprio amministratore di controllare il registro del server per identificare il problema.",
	publishErrMsg_Quota_Out: "Spazio insufficiente per pubblicare una nuova versione di questo documento. Rimuovere altri file per liberare spazio sufficiente per pubblicare questo documento.",
	publishErrMsg_NoFile: "Poiché questo documento è stato eliminato da altri, la pubblicazione non è riuscita.",
	publishErrMsg_NoPermission: "Impossibile pubblicare la nuova versione perché non si dispone delle autorizzazioni di editor su questo file. Rivolgersi al proprietario del file per ottenere le autorizzazioni di editor e riprovare."
		
})

