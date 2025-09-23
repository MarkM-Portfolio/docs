({
	//actionNew dojo menu
	newName : "Novo",
	newTooltip : "Kreiraj dokument",
	WARN_INTERNAL : "Nakon što je dokument kreiran, nije moguće promijeniti dozvolu za dijeljenje s drugima izvan vaše organizacije.",
	newCommunityInfo : "Članovi zajednice mogu urediti ovu datoteku.",
  	CANCEL : "Odustani",
  	DOWNLOAD_EMPTY_TITLE : "Nije moguće preuzeti datoteku",
  	DOWNLOAD_EMPTY_OK : "Zatvori",
  	DOWNLOAD_EMPTY_CONTENT1 : "Ne postoji objavljena verzija ove datoteke za preuzimanje.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Verzije se mogu objaviti iz Docs editora.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Nije moguće preuzeti datoteku",
  	DOWNLOAD_EMPTYVIEW_OK : "Zatvori",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Ne postoji objavljena verzija ove datoteke za preuzimanje.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Za objavljivanje verzije ove datoteke pitajte vlasnika .",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Preuzimanje verzije",
  	DOWNLOAD_NEWDRAFT_OK : "Preuzimanje verzije",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "zadnje uređivanje ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "zadnje uređivanje ${date}",	
		TODAY: "zadnje uređivanje danas u ${time}",	
		YEAR: "zadnje uređivanje ${date_long}",	
		YESTERDAY:	"zadnje uređivanje jučer u ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Otkrivena je novija skica, zadnji put uređivana ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Otkrivena je novija skica, zadnji put uređivana ${date}.",	
		TODAY: "Otkrivena je novija skica, zadnji put uređivana danas u ${time}.",	
		YEAR: "Otkrivena je novija skica, zadnji put uređivana ${date_long}.",	
		YESTERDAY:	"Otkrivena je novija skica, zadnji put uređivana jučer u ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Da li ste sigurni da želite nastaviti preuzimanje verzije koja je objavljena ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Da li ste sigurni da želite nastaviti preuzimanje verzije koja je objavljena ${date}?",	
		TODAY: "Da li ste sigurni da želite nastaviti preuzimanje verzije koja je objavljena danas u ${time}?",	
		YEAR: "Da li ste sigurni da želite nastaviti preuzimanje verzije koja je objavljena ${date_long}?",	
		YESTERDAY:	"Da li ste sigurni da želite nastaviti preuzimanje verzije koja je objavljena jučer u ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Ovo je najnovija verzija Docs datoteke koju možete da preuzmete. Da biste doznali postoji li novija verzija skice, obratite se vlasniku datoteke.",

  	VIEW_FILE_DETAILS_LINK : "Pogledajte detalje datoteke",
  	OPEN_THIS_FILE_TIP: "Otvorite ovu datoteku",
  
	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Novi dokument",
	newDocumentDialogTitle : "Novi dokument",
	newDocumentDialogContent : "Dajte ime ovom dokumentu bez naslova.",
	newDocumentDialogBtnOK : "Kreiraj",
	newDocumentDialogBtnOKTitle : "Kreiraj dokument",
	newDocumentDialogInitialName : "Dokument bez naslova",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Odustani",
	newDocumentDialogNamepre : "*Ime:",
	newDocumentDialogDocumentTypePre : "Tip:",
	newDocumentDialogDocumentChangeTypeLink : "Promijenite default ekstenziju datoteke",
	newDocumentDialogDupErrMsg : "Pronađena je datoteke s istim imenom. Unesite novo ime.",
	newDocumentDialogIllegalErrMsg : "${0} je nedopušten naslov dokumenta, molim navedite neki drugi.",
	newDocumentDialogNoNameErrMsg : "Potreban je naziv dokumenta.",
	newDocumentDialogNoPermissionErrMsg : "Ne može se kreirati datoteka jer nemate pristup editora. Kontaktirajte administratora.",
	newDocumentDialogServerErrMsg : "Docs server nije dostupan. Kontaktirajte administratora servera i pokušajte ponovo kasnije.",
	newDocumentDialogServerErrMsg2 : "Connections server nije dostupan. Kontaktirajte administratora servera i pokušajte ponovo kasnije.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Skratiti ime dokumenta?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Ime dokumenta je predugo.",


	//newSpreadsheet 
	newSheetName : "Proračunska tabela",
	newSheetTooltip : "Nova proračunska tabela",
	newSheetDialogTitle : "Nova proračunska tabela",
	newSheetDialogBtnOKTitle : "Kreiraj proračunsku tabelu",
	newSheetDialogInitialName : "Proračunska tabela bez naslova",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Prezentacija",
	newPresTooltip : "Nova prezentacija",
	newPresDialogTitle : "Nova prezentacija",
	newPresDialogBtnOKTitle : "Kreiraj prezentaciju",
	newPresDialogInitialName : "Prezentacija bez naslova",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Kreiraj datoteku",
	newFromDialogName : "Nova datoteka kao obrazac",
	newFromTooltip: "Kreiranje nove datoteke koristeći ovu datoteku kao obrazac",
	newFromDocTip : "Kreiranje dokumenta (DOC, DOCX ili ODT datoteka) iz datoteke obrasca. Te dokumente možete urediti online koristeći Docs.",
	newFromSheetTip : "Kreiranje proračunske tabele (XLS, XLSX ili ODS datoteka) iz datoteke obrasca. Ove proračunske tabele možete urediti online koristeći Docs.",
	newFromPresTip : "Kreiranje prezentacije (PPT, PPTX ili ODP datoteka) iz datoteke obrasca. Te prezentacije možete urediti online koristeći Docs.",

	//actionEdit
	editName : "Uredi u Docsu",
	editTooltip : "Uređivanje u Docsu",
	editWithDocsDialogTitle : "Želite li da počnete da uređujete online koristeći Docs?",
	editWithDocsDialogContent1 : "Docs vam omogućuje istovremenu suradnju na datotekama s drugim osobama i trenutni pregled promjena. Također možete privatno raditi online.",
	editWithDocsDialogContent2 : "Ne morate napraviti upload nove verzije dokumenta. Ako se uređivanje napravilo online, vaš rad i komentari su zaštićeni. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Uređivanje online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Pogled",
	viewTooltip : "Pregled datoteke u pretraživaču",

	//doc too large
	docTooLargeTitle : "Dokument je prevelik.",
	docTooLargeDescription : "Dokument koji želite da uredite je prevelik. <br />Osigurajte da datoteka u formatu *.odt, *.doc <br />ili *.docx format nije veća od 2048 K.",
	docTooLargeCancelBtn: "Odustani",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Trenutno uređivanje: ",
		
	//Sheet title
	sheetTitle0: "List1",
	sheetTitle1: "List2",
	sheetTitle2: "List3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Preuzmi kao Microsoft Office format",
	downloadAsPDF: "Preuzmi kao PDF datoteku",
	downloadWithUnsavedDraftTitle: "Istaknuta skica",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "Ova verzija možda ne sadrži zadnja online uređivanja. Kliknite Spremi za kreiranje nove verzije i preuzmite. Kliknite Odustani za nastavak bez spremanja.",
	downloadWithUnsavedDraftReadersDescription: "Ova verzija možda ne sadrži zadnja uređivanja. Zadnja preuzeta verzija dokumenta biće zadnja spremljena verzija editora dokumenta. Da li želite da nastavite?",

	//draft tab

	draft_tab_title : "Skica",
	draft_created : "${0} bazirano na verziji ${1}",
	draft_published : "Objavljena su zadnja uređivanja u skici.",
	draft_beiing_edited : "Ovaj dokument trenutno na Webu uređuje ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Mogu se urediti samo datoteke koje su Docs dokumenti.",
	draft_unpublished_tip : "Postoje izmjene ove skice koja nisu bile objavljene kao verzije. ${publish_action}",
	draft_save_action_label : "Objava verzije",
	draft_not_found : "Ne postoje izmjene skica za ovaj dokument.",
	draft_latest_edit : "Zadnja uređivanja:",
	draft_cur_editing : "Trenutno uređivanje:",
	draft_edit_link : "Uredi",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Ovo je Docs datoteka. Sva uređivanja se moraju napraviti online.",
	nonentitlement_docs_indicator_text: "Ova datoteka dostupna je za online uređivanje samo ako ste kupili Docs licencu.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} objavio ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} objavio ${date}",	
		TODAY: "${user} objavio danas u ${time}",	
		YEAR: "${user} objavio ${date_long}",	
		YESTERDAY:	"${user} objavio jučer u ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Objavljeno ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Objavljeno ${date}",	
		TODAY: "Objavljeno danas u ${time}",	
		YEAR: "Objavljeno ${date_long}",	
		YESTERDAY:	"Objavljeno jučer u ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} objavio verziju ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} objavio verziju ${date}",	
		TODAY: "${user} objavio verziju danas u ${time}",	
		YEAR: "${user} objavio verziju ${date_long}",	
		YESTERDAY:	"${user} objavio verziju jučer u ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Verzija objavljena ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Verzija objavljena ${date}",	
		TODAY: "Verzija objavljena danas u ${time}",	
		YEAR: "Verzija objavljena ${date_long}",	
		YESTERDAY:	"Verzija objavljena jučer u ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} kreirao ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} kreirao ${date}",	
		TODAY: "${user} kreirao danas u ${time}",	
		YEAR: "${user} kreirao ${date_long}",	
		YESTERDAY:	"${user} kreirao jučer u ${time}"
	},
	LABEL_CREATED: {
		DAY: "Kreirano ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Kreirano ${date}",	
		TODAY: "Kreirano danas u ${time}",	
		YEAR: "Kreirano ${date_long}",	
		YESTERDAY:	"Kreirano jučer u ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} uredio skicu ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} uredio skicu ${date}",	
		TODAY: "${user} uredio skicu danas u ${time}",	
		YEAR: "${user} uredio skicu ${date_long}",	
		YESTERDAY:	"${user} uredio skicu jučer u ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Skica uređena ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Skica uređena ${date}",	
		TODAY: "Skica uređena danas u ${time}",	
		YEAR: "Skica uređena ${date_long}",	
		YESTERDAY:	"Skica uređena jučer u ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} kreirao skicu ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} kreirao skicu ${date}",	
		TODAY: "${user} kreirao skicu danas u ${time}",	
		YEAR: "${user} kreirao skicu ${date_long}",	
		YESTERDAY:	"${user} kreirao skicu jučer u ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Skica kreirana ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Skica kreirana ${date}",	
		TODAY: "Skica kreirana danas u ${time}",	
		YEAR: "Skica kreirana ${date_long}",	
		YESTERDAY:	"Skica kreiranaa jučer u ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Uređeno ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Uređeno ${date}",	
		TODAY: "Uređeno danas u ${time}",	
		YEAR: "Uređeno ${date_long}",	
		YESTERDAY:	"Uređeno jučer u ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Nepodržani pretraživač",
	unSupporteBrowserContent1: "Žao nam je, ali vaš pretraživač možda neće raditi ispravno sa Docs. Za najbolje rezultate, pokušajte koristiti jedan od ovih podržanih pretraživača.",
	unSupporteBrowserContent2: "Naravno, možete nastaviti koristite svoj pretraživač, ali možda nećete moći koristiti sve funkcije Docsa.",
	unSupporteBrowserContent3: "Nemoj mi više prikazivati ovu poruku.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Novi ste u aplikacijama Datoteke i Docs?",
	INTRODUCTION_BOX_BLURB: "Izvršite upload i podijelite vaše datoteke. Kreirajte i uređujte datoteke samostalno ili u saradnji s drugima koristeći Docs. Organizujte datoteke u folder, pratite promjena u datotekama i označite vaše favorite.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Prijavite se da biste počeli koristiti Datoteke i Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Kliknite "Upload datoteka" da biste dodali datoteku. Kliknite "Novo" da biste kreirali datoteku koristeći Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Kliknite Upload datoteka da biste dodali datoteku. Kliknite Novo da biste kreirali datoteku koristeći Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Zatvorite sekciju "Dobro došli u Datoteke i Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Kreirajte i surađujte na sadržaju s kolegama. Naučite kako:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Dodajte vlastite datoteke.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Počnite uređivanje online, u realnom vremenu, samostalno ili u suradnji.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Izvršite upload i uređujte dokumente, proračunske tabele ili prezentacije.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Dodajte vaše vlastite datoteke{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Počnite uređivanje online, u realnom vremenu, samostalno ili u saradnji{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Predajte i uredite dokumente, proračunske tabele ili prezentacije{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Podešavanje stranice",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orijentacija",
	PORTRAIT: "Portret",
	LANDSCAPE: "Pejzaž",	
	MARGINS_LABEL: "Margine",
	TOP: "Vrh:",
	TOP_DESC:"Gornja margina, u centimetrima",
	TOP_DESC2:"Gornja margina, u inčima",
	BOTTOM: "Dno:",
	BOTTOM_DESC:"Donja margina, u centimetrima",
	BOTTOM_DESC2:"Donja margina, u inčima",
	LEFT: "Lijevo:",
	LEFT_DESC:"Lijeva margina, u centimetrima",
	LEFT_DESC2:"Lijeva margina, u inčima",	
	RIGHT: "Desno:",
	RIGHT_DESC:"Desna margina, u centimetrima",
	RIGHT_DESC2:"Desna margina, u inčima",
	PAPER_FORMAT_LABEL: "Format papira",
	PAPER_SIZE_LABEL: "Veličina papira:",
	HEIGHT: "Visina:",
	HEIGHT_DESC:"Visina papira, u centimetrima",
	HEIGHT_DESC2:"Visina papira, u inčima",	
	WIDTH: "Širina:",
	WIDTH_DESC:"Širina papira, u centimetrima",
	WIDTH_DESC2:"Širina papira, u inčima",
	CM_LABEL: "cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Korisnik",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai veliko",
	DISPLAY_OPTION_LABEL: "Opcije prikazivanja",
	HEADER: "Zaglavlje",
	HEADER_DESC:"Visina zaglavlja, u centimetrima",	
	FOOTER: "Podnožje",
	FOOTER_DESC:"Visina podnožja, u centimetrima",
	GRIDLINE: "Linije mreže",
	TAGGED_PDF: "Označen PDF",
	PAGE_LABEL: "Redoslijed stranica",
	PAGE_TYPE1: "S vrha ka dnu, zatim desno",
	PAGE_TYPE2: "S lijeva na desno, zatim dolje",
	PAGE_SETUP_INVALID_MSG: "Unos je pogrešan i automatski je ispravljen. Pokušajte drugu vrijednost ako želite različit rezultat.",
	
	//Docs publish message
	service_unavailable_content: "Usluga Docs nije dostupna. Vaš zahtjev trenutno ne može biti obrađen. Pokušajte kasnije ili kontaktirajte vašeg sistemskog administratora.",
	viewaccess_denied_content: "Nemate dozvolu za pregled ove datoteke. Datoteka mora biti javna ili mora biti podijeljena s vama.",
	editaccess_denied_content: "Nemate dozvolu za uređivanje ove datoteke. Morate imati ovlaštenje za Docs i datoteka mora biti podijeljena s vama ili morate imati prava editora za datoteku.",
	doc_notfound_content: "Dokument kojem želite pristupiti je izbrisan ili premješten. Provjerite ispravnost linka.",
	repository_out_of_space_content: "Nema dovoljno prostora za spremanje novog dokumenta. Uklonite neke datoteke da biste oslobodili dovoljno prostora za spremanja ovog dokumenta.",
	fileconnect_denied_content: "Docs se ne može povezati sa repopzitorijem datoteka. Pokušajte kasnije ili kontaktirajte vašeg sistemskog administratora.",
	convservice_unavailable_content: "Docs usluga konverzije nije dostupna. Vaš zahtjev se trenutno ne može obraditi. Pokušajte kasnije ili kontaktirajte vašeg sistemskog administratora.",
	doc_toolarge_content: "Dokument kojem želite pristupiti je prevelik.",
	conversion_timeout_content: "Trenutno, konverzija dokumenta traje predugo. Pokušajte ponovo kasnije.",
	storageserver_error_content: "Server je trenutno nedostupan. Vaš zahtjev se trenutno ne može obraditi. Pokušajte kasnije ili kontaktirajte vašeg sistemskog administratora.",
	server_busy_content:"Sačekajte i pokušajte ponovo kasnije.",
	publish_locked_file: "Ne možete objaviti ovu datoteku kao novu verziju jer je zaključana, ali njen sadržaj je automatski spremljen kao skica.",
	publishErrMsg: "Verzija nije objavljena. Datoteka je možda prevelika ili je na serveru došlo do vremenskog prekoračenja. Pokušajte ponovo ili odustanite i zatražite od administratora da provjeri zapise na serveru i identifikuje problem.",
	publishErrMsg_Quota_Out: "Nema dovoljno prostora za objavu nove verzije ovog dokumenta. Uklonite neke datoteke da biste oslobodili dovoljno prostora za objavu ovog dokumenta.",
	publishErrMsg_NoFile: "Objava nije uspjela jer je netko izbrisao dokument.",
	publishErrMsg_NoPermission: "Nije uspjela objava nove verzije jer nemate prava za uređivanje ove datoteke. Kontaktirajte vlasnika datoteke da biste dobili prava za uređivanje i pokušajte ponovo."
		
})

