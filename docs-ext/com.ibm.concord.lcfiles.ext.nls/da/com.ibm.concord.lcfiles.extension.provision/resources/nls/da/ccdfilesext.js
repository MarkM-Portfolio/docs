({
	//actionNew dojo menu
	newName : "Ny",
	newTooltip : "Opret et dokument",
	WARN_INTERNAL : "Når en fil er oprettet, er det ikke muligt at ændre tilladelse til at dele med andre uden for din organisation.",
	newCommunityInfo : "Fællesskabsmedlemmer kan redigere denne fil.",
  	CANCEL : "Annullér",
  	DOWNLOAD_EMPTY_TITLE : "Filen kan ikke downloades",
  	DOWNLOAD_EMPTY_OK : "Luk",
  	DOWNLOAD_EMPTY_CONTENT1 : "Der er ingen publiceret version af denne fil, der kan downloades.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Versioner kan publiceres fra Docs-editoren.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Filen kan ikke downloades",
  	DOWNLOAD_EMPTYVIEW_OK : "Luk",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Der er ingen publiceret version af denne fil, der kan downloades.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Bed ejeren af filen om at publicere en version af filen.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Download en version",
  	DOWNLOAD_NEWDRAFT_OK : "Download version",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "sidst redigeret ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "sidst redigeret ${date}",	
		TODAY: "sidst redigeret i dag ${time}",	
		YEAR: "sidst redigeret ${date_long}",	
		YESTERDAY:	"sidst redigeret i går ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Der er fundet en nyere kladde, sidst redigeret ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Der er fundet en nyere kladde, sidst redigeret ${date}.",	
		TODAY: "Der er fundet en nyere kladde, sidst redigeret i dag ${time}.",	
		YEAR: "Der er fundet en nyere kladde, sidst redigeret ${date_long}.",	
		YESTERDAY:	"Der er fundet en nyere kladde, sidst redigeret i går ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Er du sikker på, at du vil fortsætte med at downloade den version, der blev publiceret ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Er du sikker på, at du vil fortsætte med at downloade den version, der blev publiceret ${date}?",	
		TODAY: "Er du sikker på, at du vil fortsætte med at downloade den version, der blev publiceret i dag ${time}?",	
		YEAR: "Er du sikker på, at du vil fortsætte med at downloade den version, der blev publiceret ${date_long}?",	
		YESTERDAY:	"Er du sikker på, at du vil fortsætte med at downloade den version, der blev publiceret i går ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Dette er den seneste version af en Docs-fil, der kan downloades. Kontakt filejeren, hvis du vil have oplysninger, om der evt. findes en senere version i kladdeformat.",

  	VIEW_FILE_DETAILS_LINK : "Vis fildetaljer",
  	OPEN_THIS_FILE_TIP: "Åbn denne fil",
  
	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Nyt dokument",
	newDocumentDialogTitle : "Nyt dokument",
	newDocumentDialogContent : "Angiv et navn til dette dokument uden navn.",
	newDocumentDialogBtnOK : "Opret",
	newDocumentDialogBtnOKTitle : "Opret et dokument",
	newDocumentDialogInitialName : "Dokument uden titel",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Annullér",
	newDocumentDialogNamepre : "*Navn:",
	newDocumentDialogDocumentTypePre : "Type:",
	newDocumentDialogDocumentChangeTypeLink : "Revidér standardfiltypen",
	newDocumentDialogDupErrMsg : "Filnavnet findes allerede. Angiv et nyt navn.",
	newDocumentDialogIllegalErrMsg : "${0} er en ugyldig dokumenttitel. Angiv en anden.",
	newDocumentDialogNoNameErrMsg : "Angiv et dokumentnavn.",
	newDocumentDialogNoPermissionErrMsg : "Filen kan ikke oprettes, fordi du ikke har redaktøradgang. Kontakt administratoren.",
	newDocumentDialogServerErrMsg : "Docs-serveren er ikke tilgængelig. Kontakt serveradministratoren, og prøv igen senere.",
	newDocumentDialogServerErrMsg2 : "Connections-serveren er ikke tilgængelig. Kontakt serveradministratoren, og prøv igen senere.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Forkort dokumentnavnet?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Dokumentnavnet er for langt.",
	newDialogProblemidErrMsg : "Rapportér problemet til administratoren. ",
	newDialogProblemidErrMsg_tip : "Rapportér problemet til administratoren. ${shown_action}",
	newDialogProblemidErrMsgShow: "Klik for at få vist detaljer",
	newDialogProblemidErrMsgHide: "Klik for at skjule",
	newDocumentDialogTargetPre: "*Gem i:",
	newDocumentDialogTargetCommunity: "Dette fællesskab",
	newDocumentDialogTargetMyFiles: "Mine filer",

	//newSpreadsheet 
	newSheetName : "Regneark",
	newSheetTooltip : "Nyt regneark",
	newSheetDialogTitle : "Nyt regneark",
	newSheetDialogBtnOKTitle : "Opret et regneark",
	newSheetDialogInitialName : "Regneark uden navn",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Præsentation",
	newPresTooltip : "Ny præsentation",
	newPresDialogTitle : "Ny præsentation",
	newPresDialogBtnOKTitle : "Opret en præsentation",
	newPresDialogInitialName : "Præsentation uden titel",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Opret fil",
	newFromDialogName : "Ny fra Fil",
	newFromTooltip: "Opret en ny fil med denne fil som skabelon",
	newFromDocTip : "Opret et dokument (DOC-, DOCX- eller ODT-fil) fra en skabelonfil. Du kan redigere disse dokumenter online i Docs.",
	newFromSheetTip : "Opret et regneark (XLS-, XLSX- eller ODS-fil) fra en skabelonfil. Du kan redigere disse regneark online i Docs.",
	newFromPresTip : "Opret en præsentation (PPT-, PPTX- eller ODP-fil) fra en skabelonfil. Du kan redigere disse præsentationer online i Docs.",

	//actionEdit
	editName : "Redigér i Docs",
	editTooltip : "Redigér i Docs",
	editWithDocsDialogTitle : "Start redigering online med Docs?",
	editWithDocsDialogContent1 : "Med Docs kan du samarbejde om filer med andre personer samtidig og straks få vist ændringerne. Du kan også arbejde online privat.",
	editWithDocsDialogContent2 : "Du behøver ikke at uploade nye versioner af et dokument. Hvis al redigering sker online, bliver både dit arbejde og kommentarer beskyttet. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Redigér online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Vis",
	viewTooltip : "Vis eksempel på fil i en browser",

	//doc too large
	docTooLargeTitle : "Dokumentet er for stort.",
	docTooLargeDescription : "Det dokument, du vil redigere, er for stort. <br />Kontrollér, at størrelsen på filen i formatet *.odt, *.doc <br />eller *.docx ikke er større end 2048 K.",
	docTooLargeCancelBtn: "Annullér",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Redigerer i øjeblikket: ",
		
	//Sheet title
	sheetTitle0: "Ark1",
	sheetTitle1: "Ark2",
	sheetTitle2: "Ark3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Download i Microsoft Office-format",
	downloadAsPDF: "Download som PDF-fil",
	downloadWithUnsavedDraftTitle: "Udestående kladde",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "Denne version indeholder muligvis ikke de seneste onlineredigeringer. Klik på Gem for at oprette en ny version og downloade. Klik på Annullér for at fortsætte uden at gemme.",
	downloadWithUnsavedDraftReadersDescription: "Denne version indeholder muligvis ikke de seneste redigeringer. Den downloadede version af dokumentet vil være den sidst gemte version af en redaktør af dokumentet. Vil du fortsætte?",

	//draft tab

	draft_tab_title : "Kladde",
	draft_created : "${0} baseret på version ${1}",
	draft_published : "De seneste redigeringer i kladden er publiceret.",
	draft_beiing_edited : "Denne fil redigeres i øjeblikket på internettet af ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Kun filer, der er Docs-dokumenter, kan redigeres.",
	draft_unpublished_tip : "Der er kladderedigeringer, der ikke er publiceret som en version. ${publish_action}",
	draft_save_action_label : "Publicér en version",
	draft_not_found : "Der er ingen kladderedigeringer for denne fil.",
	draft_latest_edit : "Seneste redigering:",
	draft_cur_editing : "Redigerer i øjeblikket:",
	draft_edit_link : "Redigér",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Dette er en Docs-fil. Alle redigeringer skal foretages online.",
	nonentitlement_docs_indicator_text: "Filen er kun tilgængelig for onlineredigering, hvis du har købt en Docs-licens.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} publiceret ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publiceret ${date}",	
		TODAY: "${user} publiceret i dag ${time}",	
		YEAR: "${user} publiceret ${date_long}",	
		YESTERDAY:	"${user} publiceret i går ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publiceret ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Publiceret ${date}",	
		TODAY: "Publiceret i dag ${time}",	
		YEAR: "Publiceret ${date_long}",	
		YESTERDAY:	"Publiceret i går ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} publicerede version ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publicerede version ${date}",	
		TODAY: "${user} publicerede version i dag ${time}",	
		YEAR: "${user} publicerede version ${date_long}",	
		YESTERDAY:	"${user} publicerede version i går ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Version er publiceret ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version er publiceret ${date}.",	
		TODAY: "Version publiceret i dag ${time}",	
		YEAR: "Version er publiceret ${date_long}.",	
		YESTERDAY:	"Version publiceret i går ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} oprettet ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} oprettet ${date}",	
		TODAY: "${user} oprettet i dag ${time}",	
		YEAR: "${user} oprettet ${date_long}",	
		YESTERDAY:	"${user} oprettet i går ${time}"
	},
	LABEL_CREATED: {
		DAY: "Oprettet ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Oprettet ${date}",	
		TODAY: "Oprettet i dag ${time}",	
		YEAR: "Oprettet ${date_long}",	
		YESTERDAY:	"Oprettet i går ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} redigerede kladde ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} redigerede kladde ${date}",	
		TODAY: "${user} redigerede kladde i dag ${time}",	
		YEAR: "${user} redigerede kladde ${date_long}",	
		YESTERDAY:	"${user} redigerede kladde i går ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Kladde redigeret ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Kladde redigeret ${date}",	
		TODAY: "Kladde redigeret i dag ${time}",	
		YEAR: "Kladde redigeret ${date_long}",	
		YESTERDAY:	"Kladde redigeret i går ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} oprettede kladde ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} oprettede kladde ${date}",	
		TODAY: "${user} oprettede kladde i dag ${time}",	
		YEAR: "${user} oprettede kladde ${date_long}",	
		YESTERDAY:	"${user} oprettede kladde i går ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Kladde oprettet ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Kladde oprettet ${date}",	
		TODAY: "Kladde oprettet i dag ${time}",	
		YEAR: "Kladde oprettet ${date_long}",	
		YESTERDAY:	"Kladde oprettet i går ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Redigeret ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Redigeret ${date}",	
		TODAY: "Redigeret i dag ${time}",	
		YEAR: "Redigeret ${date_long}",	
		YESTERDAY:	"Redigeret i går ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Ikke-understøttet browser",
	unSupporteBrowserContent1: "Din browser arbejder sandsynligvis ikke korrekt sammen med Docs. Du opnår de bedste resultater ved at prøve at bruge en af de understøttede browsere.",
	unSupporteBrowserContent2: "Du kan selvfølgelig fortsætte med din browser, men det er ikke sikkert, at du vil opleve alle de funktioner, der er i Docs.",
	unSupporteBrowserContent3: "Vis ikke denne meddelelse igen.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Har du ikke prøvet Filer og Docs før?",
	INTRODUCTION_BOX_BLURB: "Upload og del dine filer. Opret og redigér filer selv, eller samarbejd om filer med Docs. Organisér filer i en folder, følg filer for at spore ændringer, og fastgør dine favoritter.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Log på for at begynde at bruge Filer og Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Klik på "Upload filer" for at tilføje en fil. Klik på "Ny" for at oprette en fil med Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Klik på Upload filer for at tilføje en fil. Klik på Ny for at oprette en fil med Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Luk afsnittet "Velkommen til Filer og Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Opret og samarbejd om indhold med kollegaer. Få mere at vide om følgende:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Tilføj dine egne filer.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Start redigering online, i realtid, individuelt eller via et samarbejde.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Upload og redigér dokumenter, regneark eller præsentationer.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Tilføj dine egne filer{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Start redigering online, i realtid, individuelt eller via et samarbejde{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Upload og redigér dokumenter, regneark eller præsentationer{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Sideopsætning",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Retning",
	PORTRAIT: "Stående",
	LANDSCAPE: "Liggende",	
	MARGINS_LABEL: "Margener",
	TOP: "Top:",
	TOP_DESC:"Topmargen, i centimeter",
	TOP_DESC2:"Topmargen, i tommer",
	BOTTOM: "Bund:",
	BOTTOM_DESC:"Bundmargen, i centimeter",
	BOTTOM_DESC2:"Bundmargen, i tommer",
	LEFT: "Venstre:",
	LEFT_DESC:"Venstre margen, i centimeter",
	LEFT_DESC2:"Venstre margen, i tommer",	
	RIGHT: "Højre:",
	RIGHT_DESC:"Højre margen, i centimeter",
	RIGHT_DESC2:"Højre margen, i tommer",
	PAPER_FORMAT_LABEL: "Papirformat",
	PAPER_SIZE_LABEL: "Papirstørrelse:",
	HEIGHT: "Højde:",
	HEIGHT_DESC:"Papirhøjde, i centimeter",
	HEIGHT_DESC2:"Papirhøjde, i tommer",	
	WIDTH: "Bredde:",
	WIDTH_DESC:"Papirbredde, i centimeter",
	WIDTH_DESC2:"Papirbredde, i tommer",
	CM_LABEL: "cm",
	LETTER: "Brev",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Bruger",
	SIZE1: "Kuv. #6 3/4",
	SIZE2: "Kuv. Monarch",
	SIZE3: "Kuv. #9",
	SIZE4: "Kuv. #10",
	SIZE5: "Kuv. #11",
	SIZE6: "Kuv. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai stor",
	DISPLAY_OPTION_LABEL: "Fremvisningsvalg",
	HEADER: "Overskrift",
	HEADER_DESC:"Overskriftshøjde, i centimeter",	
	FOOTER: "Bundtekst",
	FOOTER_DESC:"Bundteksthøjde, i centimeter",
	GRIDLINE: "Gitterlinjer",
	TAGGED_PDF: "Kodet PDF",
	PAGE_LABEL: "Siderækkefølge",
	PAGE_TYPE1: "Oppefra og ned, derefter til højre",
	PAGE_TYPE2: "Fra venstre mod højre, derefter ned",
	PAGE_SETUP_INVALID_MSG: "Inputtet er ugyldigt, og er automatisk blevet rettet. Prøv en anden værdi, hvis du vil have et andet resultat.",
	
	//Docs publish message
	service_unavailable_content: "Docs-serviceprogrammet er ikke tilgængeligt. Din forespørgsel kan ikke behandles i øjeblikket. Prøv igen senere, eller kontakt systemadministratoren.",
	viewaccess_denied_content: "Du har ikke tilladelse til at få vist denne fil. Filen skal være offentlig, eller den skal være delt med dig.",
	editaccess_denied_content: "Du har ikke tilladelse til at redigere denne fil. Du skal have adgang til Docs, og filen skal være delt med dig, eller du skal have redigeringsadgang til filen.",
	doc_notfound_content: "Det dokument, du vil anvende, er blevet slettet eller flyttet. Kontrollér, at linket er korrekt.",
	repository_out_of_space_content: "Du har ikke nok plads til at gemme dit nye dokument. Fjern andre filer for at frigøre nok plads til at gemme dette dokument.",
	fileconnect_denied_content: "Docs kan ikke oprette forbindelse til fillageret. Prøv igen senere, eller kontakt systemadministratoren.",
	convservice_unavailable_content: "Docs-konverteringsservicen er ikke tilgængelig. Din forespørgsel kan ikke behandles i øjeblikket. Prøv igen senere, eller kontakt systemadministratoren.",
	doc_toolarge_content: "Det dokument, du vil have adgang til, er for stort.",
	conversion_timeout_content: "Det tager i øjeblikket for lang tid tid at konvertere dokumentet. Prøv igen senere.",
	storageserver_error_content: "Der er aktuelt ikke adgang til serveren. Din forespørgsel kan ikke behandles i øjeblikket. Prøv igen senere, eller kontakt systemadministratoren.",
	server_busy_content:"Vent, og prøv igen senere.",
	publish_locked_file: "Du kan ikke publicere denne fil som en ny version, fordi den er låst. Indholdet bliver imidlertid automatisk gemt i kladden.",
	publishErrMsg: "Versionen blev ikke publiceret. Filen er muligvis for stor, eller der er udløbet en tidsfrist på serveren. Prøv igen, eller annullér, og bed administratoren om at kontrollere serverloggen for at identificere problemet.",
	publishErrMsg_Quota_Out: "Der er ikke nok plads til at publicere en ny version af dette dokument. Fjern andre filer for at frigive nok plads til at gemme dokumentet.",
	publishErrMsg_NoFile: "Da dokumentet er blevet slettet af andre, kunne det ikke publiceres.",
	publishErrMsg_NoPermission: "Du kan ikke gemme som en ny version, fordi du ikke har redigeringstilladelse til filen. Kontakt ejeren af filen for at få redigeringstilladelse, og prøv igen."
		
})

