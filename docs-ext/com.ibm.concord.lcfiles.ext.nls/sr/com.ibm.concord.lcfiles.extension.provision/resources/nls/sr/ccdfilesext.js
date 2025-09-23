({
	//actionNew dojo menu
	newName : "Novo",
	newTooltip : "Kreirajte dokument",
	WARN_INTERNAL : "Kada se datoteka kreira, nije moguće menjati dozvolu za deljenje sa drugima van organizacije.",
	newCommunityInfo : "Članovi zajednice mogu da uređuju ovu datoteku.",
  	CANCEL : "Otkaži",
  	DOWNLOAD_EMPTY_TITLE : "Preuzimanje datoteke nije moguće",
  	DOWNLOAD_EMPTY_OK : "Zatvori",
  	DOWNLOAD_EMPTY_CONTENT1 : "Ne postoji objavljena verzija ove datoteke za preuzimanje.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Verzije mogu biti objavljene iz Docs uređivača.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Preuzimanje datoteke nije moguće",
  	DOWNLOAD_EMPTYVIEW_OK : "Zatvori",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Ne postoji objavljena verzija ove datoteke za preuzimanje.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Zatražite od vlasnika datoteke da objavi verziju ove datoteke.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Preuzimanje verzije",
  	DOWNLOAD_NEWDRAFT_OK : "Preuzmi verziju",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "poslednji put uređeno ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "poslednji put uređeno ${date}",	
		TODAY: "poslednji put uređeno danas u ${time}",	
		YEAR: "poslednji put uređeno ${date_long}",	
		YESTERDAY:	"poslednji put uređeno juče u ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Otkrivena je novija verzija, poslednji put uređena ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Otkrivena je novija verzija, poslednji put uređena ${date}.",	
		TODAY: "Otkrivena je novija verzija, poslednji put uređena danas u ${time}.",	
		YEAR: "Otkrivena je novija verzija, poslednji put uređena ${date_long}.",	
		YESTERDAY:	"Otkrivena je novija verzija, poslednji put uređena juče u ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Želite li zaista da nastavite preuzimanje verzije objavljene ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Želite li zaista da nastavite preuzimanje verzije objavljene ${date}?",	
		TODAY: "Želite li zaista da nastavite preuzimanje verzije objavljene danas u ${time}?",	
		YEAR: "Želite li zaista da nastavite preuzimanje verzije objavljene ${date_long}?",	
		YESTERDAY:	"Želite li zaista da nastavite preuzimanje verzije objavljene juče u ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Ovo je najnovija verzija Docs datoteke dostupna za preuzimanje. Da biste saznali da li postoji kasnija nedovršena verzija, kontaktirajte vlasnika datoteke.",

  	VIEW_FILE_DETAILS_LINK : "Prikaži detalje o datoteci",
  	OPEN_THIS_FILE_TIP: "Otvorite datoteku",
  
	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Novi dokument",
	newDocumentDialogTitle : "Novi dokument",
	newDocumentDialogContent : "Navedite ime za dokument bez naslova.",
	newDocumentDialogBtnOK : "Kreiraj",
	newDocumentDialogBtnOKTitle : "Kreirajte dokument",
	newDocumentDialogInitialName : "Dokument bez naslova",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Otkaži",
	newDocumentDialogNamepre : "*Ime:",
	newDocumentDialogDocumentTypePre : "Tip:",
	newDocumentDialogDocumentChangeTypeLink : "Promeni podrazumevanu oznaku tipa datoteke",
	newDocumentDialogDupErrMsg : "Pronađen je duplikat imena datoteke. Unesite novo ime.",
	newDocumentDialogIllegalErrMsg : "${0} nije dozvoljeno ime datoteke, navedite drugo ime.",
	newDocumentDialogNoNameErrMsg : "Potrebno je ime dokumenta.",
	newDocumentDialogNoPermissionErrMsg : "Ne možete kreirati datoteku zbog toga što nemate pristup uređivača. Kontaktirajte administratora.",
	newDocumentDialogServerErrMsg : "Docs server nije dostupan. Kontaktirajte administratora servera i pokušajte kasnije.",
	newDocumentDialogServerErrMsg2 : "Connections server nije dostupan. Kontaktirajte administratora servera i pokušajte kasnije.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Skratiti ime dokumenta?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Ime dokumenta je predugačko.",
	newDialogProblemidErrMsg : "Prijavite ovaj problem administratoru. ",
	newDialogProblemidErrMsg_tip : "Prijavite ovaj problem administratoru. ${shown_action}",
	newDialogProblemidErrMsgShow: "Kliknite da biste prikazali detalje",
	newDialogProblemidErrMsgHide: "Kliknite da biste sakrili",
	newDocumentDialogTargetPre: "*Sačuvaj na:",
	newDocumentDialogTargetCommunity: "Ovu zajednicu",
	newDocumentDialogTargetMyFiles: "Moje datoteke",

	//newSpreadsheet 
	newSheetName : "Unakrsna tabela",
	newSheetTooltip : "Nova unakrsna tabela",
	newSheetDialogTitle : "Nova unakrsna tabela",
	newSheetDialogBtnOKTitle : "Kreirajte unakrsnu tabelu",
	newSheetDialogInitialName : "Unakrsna tabela bez imena",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Prezentacija",
	newPresTooltip : "Nova prezentacija",
	newPresDialogTitle : "Nova prezentacija",
	newPresDialogBtnOKTitle : "Kreirajte prezentaciju",
	newPresDialogInitialName : "Prezentacija bez imena",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Kreiraj datoteku",
	newFromDialogName : "Novo od datoteke",
	newFromTooltip: "Kreirajte novu datoteku koristeći ovu datoteku kao predložak",
	newFromDocTip : "Kreirajte dokument (DOC,DOCX ili ODT datoteku) po datoteci-predlošku. Ove dokumente možete uređivati onlajn u programu Docs.",
	newFromSheetTip : "Kreirajte unakrsnu tabelu (XLS,XLSX ili ODS datoteku) po datoteci-predlošku. Ove unakrsne tabele možete uređivati onlajn u programu Docs.",
	newFromPresTip : "Kreirajte prezentaciju (PPT,PPTX ili ODP datoteku) po datoteci-predlošku. Ove prezentacije možete uređivati onlajn u programu Docs.",

	//actionEdit
	editName : "Uredi u programu Docs",
	editTooltip : "Uredi u programu Docs",
	editWithDocsDialogTitle : "Želite li da započnete uređivanje onlajn u programu Docs?",
	editWithDocsDialogContent1 : "Docs vam omogućava da radite ma datotekama u isto vreme kada i drugi ljudi, i da odmah vidite unete izmene. Takođe, onlajn možete raditi u privatnom režimu.",
	editWithDocsDialogContent2 : "Ne morate da otpremite nove verzije dokumenta. Ukoliko uređujete dokument onlajn, vaš rad i komentari su zaštićeni. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Uredi onlajn",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Prikaži",
	viewTooltip : "Prikažite datoteku u pregledaču",

	//doc too large
	docTooLargeTitle : "Dokument je prevelik.",
	docTooLargeDescription : "Dokument koji želite da uređujete je prevelik. <br />Proverite da datoteka u formatu *.odt, *.doc, <br />ili *.docx nije veća od 2048 K.",
	docTooLargeCancelBtn: "Otkaži",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Trenutno uređuje: ",
		
	//Sheet title
	sheetTitle0: "List 1",
	sheetTitle1: "List 2",
	sheetTitle2: "List 3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Preuzmi u Microsoft Office formatu",
	downloadAsPDF: "Preuzmi kao PDF datoteku",
	downloadWithUnsavedDraftTitle: "Nesačuvana nedovršena verzija",
	downloadWithUnsavedDraftReadersOkLabel: "U redu",
	downloadWithUnsavedDraftDescription: "Ova verzija možda ne sadrži najnovije onlajn izmene. Kliknite na Sačuvaj da biste kreirali i preuzeli novu verziju. Kliknite Otkaži da biste nastavili bez čuvanja.",
	downloadWithUnsavedDraftReadersDescription: "Ova verzija možda ne sadrži najnovije izmene. Preuzeta verzija dokumenta će biti poslednja verzija koju je sačuvao uređivač. Želite li da nastavite?",

	//draft tab

	draft_tab_title : "Nedovršena verzija",
	draft_created : "${0} zasnovana na verziji ${1}",
	draft_published : "Najnovije izmene u nedovršenoj verziji su objavljene.",
	draft_beiing_edited : "Ovu datoteku trenutno onlajn uređuje korisnik ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Samo datoteke koje su Docs dokumenti mogu biti uređene.",
	draft_unpublished_tip : "U ovoj nedovršenoj verziji postoje izmene koje nisu objavljene kao verzija. ${publish_action}",
	draft_save_action_label : "Objavi verziju",
	draft_not_found : "Nema nedovršenih verzija ove datoteke.",
	draft_latest_edit : "Poslednja izmena:",
	draft_cur_editing : "Trenutno uređuje:",
	draft_edit_link : "Uredi",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Ovo je Docs datoteka. Izmene se moraju unositi onlajn.",
	nonentitlement_docs_indicator_text: "Ovaj dokument možete uređivati onlajn samo ako ste kupili Docs licencu.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "Korisnik ${user} je objavio ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Korisnik ${user} je objavio ${date}",	
		TODAY: "Korisnik ${user} je objavio danas u ${time}",	
		YEAR: "Korisnik ${user} je objavio ${date_long}",	
		YESTERDAY:	"Korisnik ${user} je objavio juče u ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Objavljeno ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Objavljeno ${date}",	
		TODAY: "Objavljeno danas u ${time}",	
		YEAR: "Objavljeno ${date_long}",	
		YESTERDAY:	"Objavljeno juče u ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "Korisnik ${user} je objavio verziju ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Korisnik ${user} je objavio verziju ${date}",	
		TODAY: "Korisnik ${user} je objavio verziju danas u ${time}",	
		YEAR: "Korisnik ${user} je objavio verziju ${date_long}",	
		YESTERDAY:	"Korisnik ${user} je objavio verziju juče u ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Verzija je objavljena ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Verzija je objavljena ${date}",	
		TODAY: "Verzija je objavljena danas u ${time}",	
		YEAR: "Verzija je objavljena ${date_long}",	
		YESTERDAY:	"Verzija je objavljena juče u ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "Korisnik ${user} je kreirao ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Korisnik ${user} je kreirao ${date}",	
		TODAY: "Korisnik ${user} je kreirao danas u ${time}",	
		YEAR: "Korisnik ${user} je kreirao ${date_long}",	
		YESTERDAY:	"Korisnik ${user} je kreirao juče u ${time}"
	},
	LABEL_CREATED: {
		DAY: "Kreirano ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Kreirano ${date}",	
		TODAY: "Kreirano danas u ${time}",	
		YEAR: "Kreirano ${date_long}",	
		YESTERDAY:	"Kreirano juče u ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "Korisnik ${user} je uredio nedovršenu verziju ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Korisnik ${user} je uredio nedovršenu verziju ${date}",	
		TODAY: "Korisnik ${user} je uredio nedovršenu verziju danas u ${time}",	
		YEAR: "Korisnik ${user} je uredio nedovršenu verziju ${date_long}",	
		YESTERDAY:	"Korisnik ${user} je uredio nedovršenu verziju juče u ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Nedovršena verzija uređena ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Nedovršena verzija uređena ${date}",	
		TODAY: "Nedovršena verzija uređena danas u ${time}",	
		YEAR: "Nedovršena verzija uređena ${date_long}",	
		YESTERDAY:	"Nedovršena verzija uređena juče u ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "Korisnik ${user} je kreirao nedovršenu verziju ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Korisnik ${user} je kreirao nedovršenu verziju ${date}",	
		TODAY: "Korisnik ${user} je kreirao nedovršenu verziju danas u ${time}",	
		YEAR: "Korisnik ${user} je kreirao nedovršenu verziju ${date_long}",	
		YESTERDAY:	"Korisnik ${user} je kreirao nedovršenu verziju juče u ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Nedovršena verzija kreirana ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Nedovršena verzija kreirana ${date}",	
		TODAY: "Nedovršena verzija kreirana danas u ${time}",	
		YEAR: "Nedovršena verzija kreirana ${date_long}",	
		YESTERDAY:	"Nedovršena verzija kreirana juče u ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Uređeno ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Uređeno ${date}",	
		TODAY: "Uređeno danas u ${time}",	
		YEAR: "Uređeno ${date_long}",	
		YESTERDAY:	"Uređeno juče u ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Nepodržan pregledač",
	unSupporteBrowserContent1: "Nažalost, vaš pregledač možda neće ispravno raditi sa programom Docs. Da biste dobili najbolje rezultate, pokušajte sa nekim od sledećih podržanih pregledača.",
	unSupporteBrowserContent2: "Naravno, možete nastaviti sa svojim pregledačem, ali vam možda neće biti dostupne sve funkcije programa Docs.",
	unSupporteBrowserContent3: "Ne prikazuj više ovu poruku.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Prvi put koristite datoteke i dokumente?",
	INTRODUCTION_BOX_BLURB: "Otpremite i podelite svoje datoteke. Kreirajte i uređujte datoteke samostalno ili sa saradnicima uz pomoć programa Docs. Organizujte datoteke u fascikle, pratite promene u datotekama i obeležite omiljene datoteke.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Prijavite se da biste počeli da koristite datoteke i dokumente.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Kliknite na „Otpremi datoteke“ da biste dodali datoteku. Kliknite na „Novo“ da biste kreirali datoteku u programu Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Kliknite na Otpremi datoteke da biste dodali datoteku. Kliknite na Novo da biste kreirali datoteku u programu Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Zatvori odeljak „Dobro došli u datoteke i dokumente“',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Kreirajte sadržaj i sarađujte sa kolegama na njemu. Saznajte kako:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "da dodate svoje datoteke.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "da započnete onlajn uređivanje, u realnom vremenu, samostalno ili u saradnji sa drugima.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "da otpremite i uredite dokumente, unakrsne tabele, ili prezentacije.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}da dodate svoje datoteke{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}da započnete onlajn uređivanje, u realnom vremenu, samostalno ili u saradnji sa drugima{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}da otpremite i uredite dokumente, unakrsne tabele, ili prezentacije{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Podešavanje stranice",
	PAGE_SETUP_BTN_OK: "U redu",
	ORIENTATION_LABEL: "Orijentacija",
	PORTRAIT: "Uspravno",
	LANDSCAPE: "Položeno",	
	MARGINS_LABEL: "Margine",
	TOP: "Gornja:",
	TOP_DESC:"Gornja margina, u centimetrima",
	TOP_DESC2:"Gornja margina, u inčima",
	BOTTOM: "Donja:",
	BOTTOM_DESC:"Donja margina, u centimetrima",
	BOTTOM_DESC2:"Donja margina, u inčima",
	LEFT: "Leva:",
	LEFT_DESC:"Leva margina, u centimetrima",
	LEFT_DESC2:"Leva margina, u inčima",	
	RIGHT: "Desna:",
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
	USER: "Korisnički definisano",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai large",
	DISPLAY_OPTION_LABEL: "Opcije prikaza",
	HEADER: "Zaglavlje",
	HEADER_DESC:"Visina zaglavlja, u centimetrima",	
	FOOTER: "Podnožje",
	FOOTER_DESC:"Visina podnožja, u centimetrima",
	GRIDLINE: "Koordinatne linije",
	TAGGED_PDF: "Označeni PDF",
	PAGE_LABEL: "Redosled stranica",
	PAGE_TYPE1: "Odozgo nadole, pa udesno",
	PAGE_TYPE2: "Sleva nadesno, pa nadole",
	PAGE_SETUP_INVALID_MSG: "Unos je nevažeći i automatski je ispravljen. Pokušajte sa nekom drugom vrednošću ako želite da dobijete drugačiji rezultat.",
	
	//Docs publish message
	service_unavailable_content: "Docs usluga nije dostupna. Zahtev trenutno nije moguće obraditi. Pokušajte ponovo kasnije ili kontaktirajte administratora sistema.",
	viewaccess_denied_content: "Nemate dozvolu da prikažete ovu datoteku. Datoteka mora da bude javna ili mora da se deli sa vama.",
	editaccess_denied_content: "Nemate dozvolu za uređivanje ove datoteke. Morate imati licencu za program Docs i dokument mora biti podeljen sa vama, ili morate imati uređivački pristup datoteci.",
	doc_notfound_content: "Dokument kome želite da pristupite je izbrisan ili premešten. Proverite da li je link ispravan.",
	repository_out_of_space_content: "Nemate dovoljno prostora da sačuvate novi dokument. Uklonite druge datoteke da biste oslobodili dovoljno prostora za čuvanje ovog dokumenta.",
	fileconnect_denied_content: "Program Docs ne može da se poveže sa spremištem datoteka. Pokušajte ponovo kasnije ili kontaktirajte administratora sistema.",
	convservice_unavailable_content: "Docs usluga konverzije nije dostupna. Zahtev trenutno nije moguće obraditi. Pokušajte ponovo kasnije ili kontaktirajte administratora sistema.",
	doc_toolarge_content: "Dokument kome želite da pristupite je preveliki.",
	conversion_timeout_content: "Konverzija dokumenta traje predugo. Pokušajte ponovo kasnije.",
	storageserver_error_content: "Server trenutno nije dostupan. Zahtev trenutno nije moguće obraditi. Pokušajte ponovo kasnije ili kontaktirajte administratora sistema.",
	server_busy_content:"Sačekajte malo i pokušajte ponovo kasnije.",
	publish_locked_file: "Ne možete da objavite ovu datoteku kao novu verziju jer je zaključana. Međutim, sadržaj se automatski čuva u nedovršenoj verziji.",
	publishErrMsg: "Verzija nije objavljena. Datoteka je možda prevelika ili je isteklo vreme za odziv servera. Pokušajte ponovo ili otkažite i zatražite od administratora da proveri evidenciju servera kako bi utvrdio u čemu je problem.",
	publishErrMsg_Quota_Out: "Nema dovoljno prostora za objavljivanje nove verzije ovog dokumenta. Uklonite druge datoteke da biste oslobodili dovoljno prostora za objavljivanje ovog dokumenta.",
	publishErrMsg_NoFile: "Objavljivanje nije uspelo zato što su drugi obrisali ovaj dokument.",
	publishErrMsg_NoPermission: "Objavljivanje nove verzije nije uspelo jer nemate dozvole uređivača za ovu datoteku. Kontaktirajte vlasnika datoteke da biste dobili dozvole uređivača i pokušajte ponovo."
		
})

