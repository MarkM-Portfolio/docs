({
	//actionNew dojo menu
	newName : "Nytt",
	newTooltip : "Skapa ett dokument",
	WARN_INTERNAL : "När en fil har skapats går det inte att ändra behörigheterna för att dela filen med andra utanför den egna organisationen.",
	newCommunityInfo : "Gemenskapsmedlemmar har rätt att redigera denna fil.",
  	CANCEL : "Avbryt",
  	DOWNLOAD_EMPTY_TITLE : "Det går inte att hämta filen",
  	DOWNLOAD_EMPTY_OK : "Stäng",
  	DOWNLOAD_EMPTY_CONTENT1 : "Det finns ingen publicerad version av filen att hämta.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Versioner kan publiceras från Docs-redigeraren.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Det går inte att hämta filen",
  	DOWNLOAD_EMPTYVIEW_OK : "Stäng",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Det finns ingen publicerad version av filen att hämta.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Be filägaren att publicera en version av den här filen.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Hämta en version",
  	DOWNLOAD_NEWDRAFT_OK : "Hämta version",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "senast redigerad den ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "senast redigerad den ${date}",	
		TODAY: "senast redigerad idag kl ${time}",	
		YEAR: "senast redigerad den ${date_long}",	
		YESTERDAY:	"senast redigerad igår kl ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Det finns ett nyare utkast som senast ändrades ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Det finns ett nyare utkast som senast ändrades ${date}.",	
		TODAY: "Det finns ett nyare utkast som senast ändrades idag klockan ${time}.",	
		YEAR: "Det finns ett nyare utkast som senast ändrades ${date_long}.",	
		YESTERDAY:	"Det finns ett nyare utkast som senast ändrades igår klockan ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Vill du fortsätta att hämta den version som publicerades ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Vill du fortsätta att hämta den version som publicerades ${date}?",	
		TODAY: "Vill du fortsätta att hämta den version som publicerades idag klockan ${time}?",	
		YEAR: "Vill du fortsätta att hämta den version som publicerades ${date_long}?",	
		YESTERDAY:	"Vill du fortsätta att hämta den version som publicerades igår klockan ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Det här är den senaste hämtningsbara versionen av en Docs-fil. Kontakta den som äger filen och fråga om det finns en senare version i utkastformat.",

  	VIEW_FILE_DETAILS_LINK : "Visa fildetaljer",
  	OPEN_THIS_FILE_TIP: "Öppna den här filen",
  
	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Nytt dokument",
	newDocumentDialogTitle : "Nytt dokument",
	newDocumentDialogContent : "Ge det namnlösa dokumentet ett nytt namn.",
	newDocumentDialogBtnOK : "Skapa",
	newDocumentDialogBtnOKTitle : "Skapa ett dokument",
	newDocumentDialogInitialName : "Namnlöst dokument",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Avbryt",
	newDocumentDialogNamepre : "*Namn:",
	newDocumentDialogDocumentTypePre : "Typ:",
	newDocumentDialogDocumentChangeTypeLink : "Ändra standardfiltillägget",
	newDocumentDialogDupErrMsg : "Filnamnet finns redan. Välj ett nytt namn.",
	newDocumentDialogIllegalErrMsg : "${0} är ett ogiltigt dokumentnamn. Välj ett annat namn.",
	newDocumentDialogNoNameErrMsg : "Du måste fylla i ett dokumentnamn.",
	newDocumentDialogNoPermissionErrMsg : "Det går inte att skapa filen eftersom du inte har redigeringsbehörighet. Kontakta administratören.",
	newDocumentDialogServerErrMsg : "Docs-servern är inte tillgänglig. Kontakta serveradministratören och försök igen senare.",
	newDocumentDialogServerErrMsg2 : "Connections-servern är inte tillgänglig. Kontakta serveradministratören och försök igen senare.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Vill du ge dokumentet ett kortare namn?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Dokumentets namn innehåller för många tecken.",
	newDialogProblemidErrMsg : "Rapportera det här problemet till administratören. ",
	newDialogProblemidErrMsg_tip : "Rapportera det här problemet till administratören. ${shown_action}",
	newDialogProblemidErrMsgShow: "Visa detaljer genom att klicka här",
	newDialogProblemidErrMsgHide: "Dölj genom att klicka här",
	newDocumentDialogTargetPre: "*Spara i:",
	newDocumentDialogTargetCommunity: "Den här gemenskapen",
	newDocumentDialogTargetMyFiles: "Mina filer",

	//newSpreadsheet 
	newSheetName : "Kalkylark",
	newSheetTooltip : "Nytt kalkylark",
	newSheetDialogTitle : "Nytt kalkylark",
	newSheetDialogBtnOKTitle : "Skapa ett kalkylark",
	newSheetDialogInitialName : "Namnlöst kalkylark",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Presentation",
	newPresTooltip : "Ny presentation",
	newPresDialogTitle : "Ny Presentation",
	newPresDialogBtnOKTitle : "Skapa en presentation",
	newPresDialogInitialName : "Namnlös presentation",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Skapa fil",
	newFromDialogName : "Ny från fil",
	newFromTooltip: "Skapa en ny fil med denna fil som mall",
	newFromDocTip : "Skapa ett dokument (DOC, DOCX eller ODT) från en mall. Du kan redigera dessa dokument online i Docs.",
	newFromSheetTip : "Skapa ett kalkylark (XLS, XLSX eller ODS) från en mall. Du kan redigera kalkylarken online i Docs.",
	newFromPresTip : "Skapa en presentation (PPT, PPTX eller ODP) från en mall. Du kan redigera presentationerna online i Docs.",

	//actionEdit
	editName : "Redigera i Docs",
	editTooltip : "Redigera i Docs",
	editWithDocsDialogTitle : "Vill du börja redigera online med Docs?",
	editWithDocsDialogContent1 : "I Docs kan du samarbeta om filer parallellt med andra och se ändringarna direkt. Du kan arbeta online privat också.",
	editWithDocsDialogContent2 : "Du behöver inte överföra nya versioner av dokument. Om all redigering görs online skyddas både ditt arbete och gjorda kommentarer. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Redigera online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Visa",
	viewTooltip : "Förhandsgranska filen i en webbläsare",

	//doc too large
	docTooLargeTitle : "Dokumentet är för stort.",
	docTooLargeDescription : "Det dokument du vill redigera är för stort. <br />Kontrollera att storleken på filen i något av formaten *.odt, *.doc, <br />eller *.docx inte är större än 2 048 KB.",
	docTooLargeCancelBtn: "Avbryt",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Aktuell redigering: ",
		
	//Sheet title
	sheetTitle0: "Ark 1",
	sheetTitle1: "Ark 2",
	sheetTitle2: "Ark 3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Hämta som Microsoft Office-format",
	downloadAsPDF: "Hämta som PDF-fil",
	downloadWithUnsavedDraftTitle: "Utkast",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "Denna version innehåller inte de senaste onlineredigeringarna. Klicka på Spara för att skapa en ny version och hämta den. Klicka på Avbryt om du vill fortsätta utan att spara.",
	downloadWithUnsavedDraftReadersDescription: "Denna version innehåller kanske inte de senaste redigeringarna. Det dokument som hämtas kommer att vara den senaste sparade versionen som redigerats. Vill du fortsätta?",

	//draft tab

	draft_tab_title : "Utkast",
	draft_created : "${0} baserat på version ${1}",
	draft_published : "De senaste redigeringarna i utkastet har publicerats.",
	draft_beiing_edited : "Filen redigeras för närvarande på webben av ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Endast filer som är Docs-dokument kan redigeras.",
	draft_unpublished_tip : "Det finns ändringar i utkastet som inte har publicerats som en version. ${publish_action}",
	draft_save_action_label : "Publicera en version",
	draft_not_found : "Det finns inga utkast för denna fil.",
	draft_latest_edit : "Senaste redigeringen:",
	draft_cur_editing : "Aktuell redigering:",
	draft_edit_link : "Redigera",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Det här är en Docs-fil. Alla redigeringar måste göras online.",
	nonentitlement_docs_indicator_text: "Filen är endast tillgänglig för onlineredigering om du har köpt en Docs-licens.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} publicerade ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publicerade ${date}",	
		TODAY: "${user} publicerade idag ${time}",	
		YEAR: "${user} publicerade ${date_long}",	
		YESTERDAY:	"${user} publicerade igår ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publicerades ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Publicerades ${date}",	
		TODAY: "Publicerades idag ${time}",	
		YEAR: "Publicerades ${date_long}",	
		YESTERDAY:	"Publicerades igår ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} publicerade versionen ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publicerade versionen ${date}",	
		TODAY: "${user} publicerade versionen idag ${time}",	
		YEAR: "${user} publicerade versionen ${date_long}",	
		YESTERDAY:	"${user} publicerade versionen igår ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Version publicerad ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version publicerad ${date}",	
		TODAY: "Version publicerad idag ${time}",	
		YEAR: "Version publicerad ${date_long}",	
		YESTERDAY:	"Version publicerad igår ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} skapade ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} skapade ${date}",	
		TODAY: "${user} skapade idag ${time}",	
		YEAR: "${user} skapade ${date_long}",	
		YESTERDAY:	"${user} skapade igår ${time}"
	},
	LABEL_CREATED: {
		DAY: "Skapades ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Skapades ${date}",	
		TODAY: "Skapades idag ${time}",	
		YEAR: "Skapades ${date_long}",	
		YESTERDAY:	"Skapades igår ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} redigerade utkastet ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} redigerade utkastet ${date}",	
		TODAY: "${user} redigerade utkastet idag ${time}",	
		YEAR: "${user} redigerade utkastet ${date_long}",	
		YESTERDAY:	"${user} redigerade utkastet igår ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Utkast redigerat ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Utkast redigerat ${date}",	
		TODAY: "Utkast redigerat idag ${time}",	
		YEAR: "Utkast redigerat ${date_long}",	
		YESTERDAY:	"Utkast redigerat igår ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} skapade utkastet ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} skapade utkastet ${date}",	
		TODAY: "${user} skapade utkastet idag ${time}",	
		YEAR: "${user} skapade utkastet ${date_long}",	
		YESTERDAY:	"${user} skapade utkastet igår ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Utkast skapat ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Utkast skapat ${date}",	
		TODAY: "Utkast skapat idag ${time}",	
		YEAR: "Utkast skapat ${date_long}",	
		YESTERDAY:	"Utkast skapat igår ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Redigerat ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Redigerat ${date}",	
		TODAY: "Redigerat idag ${time}",	
		YEAR: "Redigerat ${date_long}",	
		YESTERDAY:	"Redigerat igår ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Webbläsaren stöds inte",
	unSupporteBrowserContent1: "Webbläsaren kanske inte fungerar på rätt sätt med Docs. Bäst resultat får du om du använder någon av de webbläsare som stöds.",
	unSupporteBrowserContent2: "Du kan självklart fortsätta använda den nuvarande webbläsaren, men du kanske inte kan utnyttja alla funktioner i Docs.",
	unSupporteBrowserContent3: "Visa inte det här meddelandet igen",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Nybörjare på Filer och Docs?",
	INTRODUCTION_BOX_BLURB: "Överför och dela dina filer. Skapa och redigera filer enskilt eller tillsammans med andra i Docs. Sortera filer i mappar, bevaka filer för att kunna spåra ändringar och välja favoritfiler.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Logga in och börja använda Filer och Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Klicka på Överför filer när du vill lägga till en fil. Klicka på Ny om du vill skapa en fil i Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Klicka på Överför filer när du vill lägga till en fil. Klicka på Ny om du vill skapa en fil i Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Stäng avsnittet "Välkommen till Filer och Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Skapa och samarbeta om innehåll med kollegor. Lär dig hur du",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Lägger till egna filer",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Börjar redigera online, i realtid, individuellt eller i samarbete",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Överför och redigerar dokument, kalkylark och presentationer",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}lägga till egna filer{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}börja redigera online, i realtid, individuellt eller i samarbete{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}överför och redigera dokument, kalkylark och presentationer{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Utskriftsalternativ",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientering",
	PORTRAIT: "Stående",
	LANDSCAPE: "Liggande",	
	MARGINS_LABEL: "Marginaler",
	TOP: "Övre:",
	TOP_DESC:"Övre marginal (i centimeter)",
	TOP_DESC2:"Övre marginal (i tum)",
	BOTTOM: "Nedre:",
	BOTTOM_DESC:"Nedre marginal (i centimeter)",
	BOTTOM_DESC2:"Nedre marginal (i tum)",
	LEFT: "Vänster:",
	LEFT_DESC:"Vänster marginal (i centimeter)",
	LEFT_DESC2:"Vänster marginal (i tum)",	
	RIGHT: "Höger:",
	RIGHT_DESC:"Höger marginal (i centimeter)",
	RIGHT_DESC2:"Höger marginal (i tum)",
	PAPER_FORMAT_LABEL: "Pappersformat",
	PAPER_SIZE_LABEL: "Format:",
	HEIGHT: "Höjd:",
	HEIGHT_DESC:"Pappershöjd (i centimeter)",
	HEIGHT_DESC2:"Pappershöjd (i tum)",	
	WIDTH: "Bredd:",
	WIDTH_DESC:"Pappersbredd (i centimeter)",
	WIDTH_DESC2:"Pappersbredd (i tum)",
	CM_LABEL: " cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Användare",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai",
	DISPLAY_OPTION_LABEL: "Visningsalternativ",
	HEADER: "Sidhuvud",
	HEADER_DESC:"Sidhuvudshöjd (i centimeter)",	
	FOOTER: "Sidfot",
	FOOTER_DESC:"Sidfotshöjd (i centimeter)",
	GRIDLINE: "Rutnätslinjer",
	TAGGED_PDF: "PFD med märkord",
	PAGE_LABEL: "Sidordning",
	PAGE_TYPE1: "Uppifrån och ned, sedan åt höger",
	PAGE_TYPE2: "Från vänster till höger, sedan nedåt",
	PAGE_SETUP_INVALID_MSG: "Indata är ogiltiga och har automatiskt korrigerats. Ange ett annat värde om du vill ha ett annat resultat.",
	
	//Docs publish message
	service_unavailable_content: "Docs-tjänsten är inte tillgänglig. Begäran kan inte bearbetas just nu. Försök igen senare eller kontakta systemadministratören.",
	viewaccess_denied_content: "Du har inte behörighet att öppna filen. Filen måste göras publik eller så måste den delas med dig.",
	editaccess_denied_content: "Du har inte behörighet att redigera filen. Du måste ha behörighet att använda Docs och filen måste vara delad med dig eller så måste du ha behörighet att redigera filen.",
	doc_notfound_content: "Det dokument som du vill nå har tagits bort eller flyttats. Kontrollera att länken är korrekt.",
	repository_out_of_space_content: "Du har inte tillräckligt med utrymme för att spara det nya dokumentet. Ta bort övriga filer för att frigöra tillräckligt med utrymme för att spara dokumentet.",
	fileconnect_denied_content: "Docs kan inte ansluta till fillagret. Försök igen senare eller kontakta systemadministratören.",
	convservice_unavailable_content: "Docs-tjänsten är inte tillgänglig. Begäran kan inte bearbetas just nu. Försök igen senare eller kontakta systemadministratören.",
	doc_toolarge_content: "Det dokument du vill få tillgång till är för stort.",
	conversion_timeout_content: "Just nu tar dokumentet för långt tid att konvertera. Försök igen senare.",
	storageserver_error_content: "Servern är inte tillgänglig. Begäran kan inte bearbetas just nu. Försök igen senare eller kontakta systemadministratören.",
	server_busy_content:"Vänta lite och försök igen senare.",
	publish_locked_file: "Du kan inte publicera filen som en ny version eftersom den är låst. Innehåller sparas dock automatiskt i utkastet.",
	publishErrMsg: "Versionen har inte publicerats. Filen kan vara för stor eller också är servern inte tillgänglig. Försök igen eller be administratören att kontrollera serverloggen.",
	publishErrMsg_Quota_Out: "Det finns inte tillräckligt med utrymme för att publicera en ny version av dokumentet. Ta bort andra filer för att frigöra tillräckligt med utrymme för att kunna publicera dokumentet.",
	publishErrMsg_NoFile: "Eftersom det här dokumentet har raderats av andra går det inte att publicera det.",
	publishErrMsg_NoPermission: "Det gick inte att publicera till någon ny version eftersom du inte har behörighet att redigera filen. Be filägaren om redigeringsbehörighet och försök igen."
		
})

