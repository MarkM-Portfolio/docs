({
	//actionNew dojo menu
	newName : "Neu",
	newTooltip : "Dokument erstellen",
	WARN_INTERNAL : "Sobald eine Datei erstellt wurde, ist es nicht mehr möglich, die Berechtigung zur Freigabe an Personen außerhalb der Organisation zu ändern.",
	newCommunityInfo : "Community-Mitglieder können diese Datei immer bearbeiten.",
  	CANCEL : "Abbrechen",
  	DOWNLOAD_EMPTY_TITLE : "Download der Datei nicht möglich",
  	DOWNLOAD_EMPTY_OK : "Schließen",
  	DOWNLOAD_EMPTY_CONTENT1 : "Es ist keine veröffentlichte Version dieser Datei zum Download vorhanden.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Versionen können aus dem Docs Editor heraus veröffentlicht werden.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Download der Datei nicht möglich",
  	DOWNLOAD_EMPTYVIEW_OK : "Schließen",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Es ist keine veröffentlichte Version dieser Datei zum Download vorhanden.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Bitten Sie den Dateieigner, eine Version der Datei zu veröffentlichen.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Eine Version herunterladen",
  	DOWNLOAD_NEWDRAFT_OK : "Version herunterladen",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "zuletzt bearbeitet am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "zuletzt bearbeitet am ${date}",	
		TODAY: "zuletzt bearbeitet heute um ${time}",	
		YEAR: "zuletzt bearbeitet am ${date_long}",	
		YESTERDAY:	"zuletzt bearbeitet gestern um ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Es wurde ein neuer Entwurf gefunden, zuletzt bearbeitet am ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Es wurde ein neuer Entwurf gefunden, zuletzt bearbeitet am ${date}.",	
		TODAY: "Es wurde ein neuer Entwurf gefunden, zuletzt bearbeitet heute um ${time}.",	
		YEAR: "Es wurde ein neuer Entwurf gefunden, zuletzt bearbeitet am ${date_long}.",	
		YESTERDAY:	"Es wurde ein neuer Entwurf gefunden, zuletzt bearbeitet gestern um ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Sind Sie sicher, dass Sie mit dem Download der am  ${date} veröffentlichten Version fortfahren möchten?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Sind Sie sicher, dass Sie mit dem Download der am ${date} veröffentlichten Version fortfahren möchten?",	
		TODAY: "Sind Sie sicher, dass Sie mit dem Download der heute um ${time} veröffentlichten Version fortfahren möchten?",	
		YEAR: "Sind Sie sicher, dass Sie mit dem Download der am ${date_long} veröffentlichten Version fortfahren möchten?",	
		YESTERDAY:	"Sind Sie sicher, dass Sie mit dem Download der gestern um ${time} veröffentlichten Version fortfahren möchten?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Dies ist die aktuellste für den Download verfügbare Version einer Docs-Datei. Wenn Sie erfahren möchten, ob eine neuere Version als Entwurf vorliegt, wenden Sie sich an den Dateieigner.",

  	VIEW_FILE_DETAILS_LINK : "Dateiinformationen anzeigen",
  	OPEN_THIS_FILE_TIP: "Diese Datei öffnen",
  
	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Neues Dokument",
	newDocumentDialogTitle : "Neues Dokument",
	newDocumentDialogContent : "Geben Sie einen neuen Namen für dieses unbenannte Dokument an.",
	newDocumentDialogBtnOK : "Erstellen",
	newDocumentDialogBtnOKTitle : "Dokument erstellen",
	newDocumentDialogInitialName : "Unbenanntes Dokument",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument-Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Abbrechen",
	newDocumentDialogNamepre : "*Name:",
	newDocumentDialogDocumentTypePre : "Typ:",
	newDocumentDialogDocumentChangeTypeLink : "Standarddateierweiterung ändern",
	newDocumentDialogDupErrMsg : "Ein doppelt vorhandener Dateiname wurde gefunden. Geben Sie einen neuen Namen ein.",
	newDocumentDialogIllegalErrMsg : "${0} ist ein ungültiger Dokumenttitel. Geben Sie einen anderen an.",
	newDocumentDialogNoNameErrMsg : "Dokumentname ist erforderlich.",
	newDocumentDialogNoPermissionErrMsg : "Die Datei kann nicht erstellt werden, weil Sie keinen Editorzugriff haben. Wenden Sie sich an den Administrator.",
	newDocumentDialogServerErrMsg : "Der Docs-Server ist nicht verfügbar. Wenden Sie sich an den Serveradministrator und versuchen Sie es später noch einmal.",
	newDocumentDialogServerErrMsg2 : "Der Connections-Server ist nicht verfügbar. Wenden Sie sich an den Serveradministrator und versuchen Sie es später noch einmal.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Dokumentnamen kürzen?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Der Dokumentname ist zu lang.",
	newDialogProblemidErrMsg : "Melden Sie dieses Problem Ihrem Administrator. ",
	newDialogProblemidErrMsg_tip : "Melden Sie dieses Problem Ihrem Administrator. ${shown_action}",
	newDialogProblemidErrMsgShow: "Klicken, um Details anzuzeigen",
	newDialogProblemidErrMsgHide: "Klicken, um auszublenden",
	newDocumentDialogTargetPre: "*Speichern in:",
	newDocumentDialogTargetCommunity: "Dieser Community",
	newDocumentDialogTargetMyFiles: "Meine Dateien",

	//newSpreadsheet 
	newSheetName : "Arbeitsblatt",
	newSheetTooltip : "Neues Arbeitsblatt",
	newSheetDialogTitle : "Neues Arbeitsblatt",
	newSheetDialogBtnOKTitle : "Arbeitsblatt erstellen",
	newSheetDialogInitialName : "Unbenanntes Arbeitsblatt",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument-Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Präsentation",
	newPresTooltip : "Neue Präsentation",
	newPresDialogTitle : "Neue Präsentation",
	newPresDialogBtnOKTitle : "Präsentation erstellen",
	newPresDialogInitialName : "Unbenannte Präsentation",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument-Präsentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Datei erstellen",
	newFromDialogName : "Neu aus Datei",
	newFromTooltip: "Neue Datei mithilfe dieser Datei als Vorlage erstellen",
	newFromDocTip : "Dokument (DOC-, DOCX- oder ODT-Datei) aus Vorlagedatei erstellen. Sie können diese Dokumente online in Docs bearbeiten.",
	newFromSheetTip : "Arbeitsblatt (XLS-, XLSX- oder ODS-Datei) aus Vorlagedatei erstellen. Sie können diese Arbeitsblätter online in Docs bearbeiten.",
	newFromPresTip : "Präsentation (PPT-, PPTX- oder ODP-Datei) aus Vorlagedatei erstellen. Sie können diese Präsentationen online in Docs bearbeiten.",

	//actionEdit
	editName : "In Docs bearbeiten",
	editTooltip : "In Docs bearbeiten",
	editWithDocsDialogTitle : "Online-Bearbeitung mit Docs beginnen?",
	editWithDocsDialogContent1 : "Mit Docs können Sie mit anderen Personen gleichzeitig an Dateien arbeiten und die Änderungen unverzüglich sehen. Sie können auch privat online arbeiten.",
	editWithDocsDialogContent2 : "Sie müssen keine neue Version eines Dokuments hochladen. Wenn die Bearbeitung online ausgeführt wird, sind sowohl Ihre Arbeit als auch Ihre Kommentare geschützt. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Online bearbeiten",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Ansicht",
	viewTooltip : "Vorschau der Datei in einem Browser anzeigen",

	//doc too large
	docTooLargeTitle : "Das Dokument ist zu groß.",
	docTooLargeDescription : "Das Dokument, das Sie bearbeiten möchten, ist zu groß. <br />Vergewissern Sie sich, dass die Datei im Format *.odt, *.doc, <br />oder *.docx nicht größer als 2048 K ist.",
	docTooLargeCancelBtn: "Abbrechen",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Aktuelle Bearbeitung: ",
		
	//Sheet title
	sheetTitle0: "Blatt1",
	sheetTitle1: "Blatt2",
	sheetTitle2: "Blatt3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Im Microsoft Office-Format herunterladen",
	downloadAsPDF: "Als PDF-Datei herunterladen",
	downloadWithUnsavedDraftTitle: "Ausstehender Entwurf",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "Diese Version enthält möglicherweise nicht die neuesten Online-Bearbeitungen. Klicken Sie auf 'Speichern', um eine neue Version zu erstellen und herunterzuladen. Klicken Sie auf 'Abbrechen', um ohne zu speichern fortzufahren.",
	downloadWithUnsavedDraftReadersDescription: "Diese Version enthält möglicherweise nicht die neuesten Bearbeitungen. Die heruntergeladene Version des Dokuments ist die zuletzt gespeicherte Version eines Bearbeiters des Dokuments. Möchten Sie den Vorgang fortsetzen?",

	//draft tab

	draft_tab_title : "Entwurf",
	draft_created : "${0} auf der Basis von Version ${1}",
	draft_published : "Die letzten Bearbeitungen des Entwurfs wurden veröffentlicht.",
	draft_beiing_edited : "Diese Datei wird zurzeit im World Wide Web von ${user} bearbeitet.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Es können nur als Docs-Dokumente formatierte Dateien bearbeitet werden.",
	draft_unpublished_tip : "Es sind Bearbeitungen dieses Entwurfs vorhanden, die nicht als Version veröffentlicht wurden. ${publish_action}",
	draft_save_action_label : "Version veröffentlichen",
	draft_not_found : "Für diese Datei gibt es keine weiteren Entwürfe.",
	draft_latest_edit : "Letzte Bearbeitung:",
	draft_cur_editing : "Aktuelle Bearbeitung:",
	draft_edit_link : "Bearbeiten",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Dies ist eine Docs-Datei. Alle Bearbeitungen müssen online vorgenommen werden.",
	nonentitlement_docs_indicator_text: "Diese Datei ist für die Online-Bearbeitung nur verfügbar, wenn Sie ein Docs-Nutzungsrecht erworben haben.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "Veröffentlicht von ${user} am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Veröffentlicht von ${user} am ${date}",	
		TODAY: "Veröffentlicht von ${user} heute um ${time}",	
		YEAR: "Veröffentlicht von ${user} am ${date_long}",	
		YESTERDAY:	"Veröffentlicht von ${user} gestern um ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Veröffentlicht am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Veröffentlicht am ${date}",	
		TODAY: "Veröffentlicht heute um ${time}",	
		YEAR: "Veröffentlicht am ${date_long}",	
		YESTERDAY:	"Veröffentlicht gestern um ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} veröffentlichte Version am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} veröffentlichte Version am ${date}",	
		TODAY: "${user} veröffentlichte Version heute um ${time}",	
		YEAR: "${user} veröffentlichte Version am ${date_long}",	
		YESTERDAY:	"${user} veröffentlichte Version gestern um ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Version veröffentlicht am ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version veröffentlicht am ${date}.",	
		TODAY: "Version veröffentlicht heute um ${time}",	
		YEAR: "Version veröffentlicht am ${date_long}.",	
		YESTERDAY:	"Version veröffentlicht gestern um ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "Von ${user} erstellt am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Von ${user} erstellt am ${date}",	
		TODAY: "Von ${user} erstellt heute um ${time}",	
		YEAR: "Von ${user} erstellt am ${date_long}",	
		YESTERDAY:	"Von ${user} erstellt gestern um ${time}"
	},
	LABEL_CREATED: {
		DAY: "Erstellt am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Erstellt am ${date}",	
		TODAY: "Erstellt heute um ${time}",	
		YEAR: "Erstellt am ${date_long}",	
		YESTERDAY:	"Erstellt gestern um ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} bearbeitete Entwurf am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} bearbeitete Entwurf am ${date}",	
		TODAY: "${user} bearbeitete Entwurf heute um ${time}",	
		YEAR: "${user} bearbeitete Entwurf am ${date_long}",	
		YESTERDAY:	"${user} bearbeitete Entwurf gestern um ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Entwurf bearbeitet am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Entwurf bearbeitet am ${date}",	
		TODAY: "Entwurf bearbeitet heute um ${time}",	
		YEAR: "Entwurf bearbeitet am ${date_long}",	
		YESTERDAY:	"Entwurf bearbeitet gestern um ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} bearbeitete Entwurf am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} bearbeitete Entwurf am ${date}",	
		TODAY: "${user} erstellte Entwurf heute um ${time}",	
		YEAR: "${user} erstellte Entwurf am ${date_long}",	
		YESTERDAY:	"${user} erstellte Entwurf gestern um ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Entwurf erstellt am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Entwurf erstellt am ${date}",	
		TODAY: "Entwurf erstellt heute um ${time}",	
		YEAR: "Entwurf erstellt am ${date_long}",	
		YESTERDAY:	"Entwurf erstellt gestern um ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Bearbeitet am ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Bearbeitet am ${date}",	
		TODAY: "Bearbeitet heute um ${time}",	
		YEAR: "Bearbeitet am ${date_long}",	
		YESTERDAY:	"Bearbeitet gestern um ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Nicht unterstützter Browser",
	unSupporteBrowserContent1: "Ihr Browser funktioniert eventuell nicht ordnungsgemäß mit Docs. Für bestmögliche Ergebnisse, verwenden Sie bitte einen der folgenden unterstützten Browser.",
	unSupporteBrowserContent2: "Selbstverständlich können Sie mit Ihrem Browser fortfahren, dadurch können Sie unter Umständen jedoch nicht alle Funktionen von Docs verwenden.",
	unSupporteBrowserContent3: "Diese Nachricht nicht mehr anzeigen.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Neu bei \"Files\" in Docs?",
	INTRODUCTION_BOX_BLURB: "Laden Sie Ihre Dateien hoch und geben Sie sie frei. Erstellen und bearbeiten Sie Dateien mit Docs - allein oder gemeinsam mit anderen. Verwalten Sie Dateien in Ordnern, überwachen Sie Dateien, um Änderungen zu verfolgen, und fixieren Sie Ihre Favoriten.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Melden Sie sich zur Verwendung von Files und Docs an.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Klicken Sie auf "Dateien hochladen", um eine Datei hochzuladen. Klicken Sie auf "Neu", um eine Datei mit Docs zu erstellen.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Klicken Sie auf "Dateien hochladen", um eine Datei hinzuzufügen. Klicken Sie auf "Neu", um eine Datei mit Docs zu erstellen.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Schließen Sie den Abschnitt "Willkommen bei Files und Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Erstellen Sie Inhalte und arbeiten Sie mit Kollegen zusammen daran. Lernen Sie Folgendes:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Eigene Dateien hinzufügen.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Bearbeitung online, in Echtzeit, einzeln oder in Zusammenarbeit starten.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Hochladen und Bearbeiten von Dokumenten, Spreadsheets oder Präsentationen.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Eigene Dateien hinzufügen{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Bearbeitung online, in Echtzeit, einzeln oder in Zusammenarbeit{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Hochladen und Bearbeiten von Dokumenten, Arbeitsblättern oder Präsentationen{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Seite einrichten",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Ausrichtung",
	PORTRAIT: "Hochformat",
	LANDSCAPE: "Querformat",	
	MARGINS_LABEL: "Randeinstellungen",
	TOP: "Oben:",
	TOP_DESC:"Oberer Rand in Zentimetern",
	TOP_DESC2:"Oberer Rand in Zoll",
	BOTTOM: "Unten:",
	BOTTOM_DESC:"Unterer Rand in Zentimetern",
	BOTTOM_DESC2:"Unterer Rand in Zoll",
	LEFT: "Links:",
	LEFT_DESC:"Linker Rand in Zentimetern",
	LEFT_DESC2:"Linker Rand in Zoll",	
	RIGHT: "Rechts:",
	RIGHT_DESC:"Rechter Rand in Zentimetern",
	RIGHT_DESC2:"Rechter Rand in Zoll",
	PAPER_FORMAT_LABEL: "Papierformat",
	PAPER_SIZE_LABEL: "Papierformat:",
	HEIGHT: "Höhe:",
	HEIGHT_DESC:"Papierlänge in Zentimetern",
	HEIGHT_DESC2:"Papierlänge in Zoll",	
	WIDTH: "Breite:",
	WIDTH_DESC:"Papierbreite in Zentimetern",
	WIDTH_DESC2:"Papierbreite in Zoll",
	CM_LABEL: "cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Benutzer(spezifisch)",
	SIZE1: "Umschlag #6 3/4",
	SIZE2: "Umschlag Monarch",
	SIZE3: "Umschlag #9",
	SIZE4: "Umschlag #10",
	SIZE5: "Umschlag #11",
	SIZE6: "Umschlag #12",
	SIZE7: "16 Kai",
	SIZE8: "32 Kai",
	SIZE9: "32 Kai groß",
	DISPLAY_OPTION_LABEL: "Anzeigeoptionen",
	HEADER: "Kopfzeile",
	HEADER_DESC:"Höhe der Kopfzeile in Zentimetern",	
	FOOTER: "Fußzeile",
	FOOTER_DESC:"Höhe der Fußzeile in Zentimetern",
	GRIDLINE: "Rasterlinien",
	TAGGED_PDF: "PDF mit Kennung",
	PAGE_LABEL: "Seitenreihenfolge",
	PAGE_TYPE1: "Von oben nach unten, dann nach links",
	PAGE_TYPE2: "Von links nach rechts, dann nach unten",
	PAGE_SETUP_INVALID_MSG: "Die Eingabe ist ungültig und wurde automatisch korrigiert. Geben Sie einen anderen Wert ein, wenn Sie ein anderes Ergebnis möchten.",
	
	//Docs publish message
	service_unavailable_content: "Der Docs-Service ist nicht verfügbar. Ihre Anfrage kann derzeit nicht bearbeitet werden. Versuchen Sie es später noch einmal oder wenden Sie sich an Ihren Systemadministrator.",
	viewaccess_denied_content: "Sie sind nicht berechtigt, diese Datei anzuzeigen. Die Datei muss öffentlich oder für Sie freigegeben sein.",
	editaccess_denied_content: "Sie sind nicht berechtigt, diese Datei zu bearbeiten. Sie müssen die Berechtigung für Docs haben und diese Datei muss für Sie freigegeben sein oder Sie müssen über einen Editorzugriff für diese Datei verfügen.",
	doc_notfound_content: "Das Dokument, auf das Sie zugreifen möchten, wurde gelöscht oder verschoben. Überprüfen Sie, ob der Link richtig ist.",
	repository_out_of_space_content: "Es ist nicht genügend Speicherplatz verfügbar, um Ihr neues Dokument zu speichern. Entfernen Sie andere Dateien, um mehr Speicherplatz zu erhalten.",
	fileconnect_denied_content: "Docs kann keine Verbindung mit dem Dateirepository herstellen. Versuchen Sie es später noch einmal oder wenden Sie sich an Ihren Systemadministrator.",
	convservice_unavailable_content: "Der Docs-Konvertierungsservice ist nicht verfügbar. Ihre Anfrage kann derzeit nicht bearbeitet werden. Versuchen Sie es später noch einmal oder wenden Sie sich an Ihren Systemadministrator.",
	doc_toolarge_content: "Das Dokument, auf das Sie zugreifen möchten, ist zu groß.",
	conversion_timeout_content: "Die Konvertierung des Dokuments dauert zurzeit zu lang. Versuchen Sie es später erneut.",
	storageserver_error_content: "Der Server ist zurzeit nicht verfügbar. Ihre Anfrage kann derzeit nicht bearbeitet werden. Versuchen Sie es später noch einmal oder wenden Sie sich an Ihren Systemadministrator.",
	server_busy_content:"Haben Sie einen Moment Geduld und versuchen Sie es später noch einmal.",
	publish_locked_file: "Sie können diese Datei nicht als eine neue Version veröffentlichen, da sie gesperrt ist. Die von Ihnen eingegebenen Inhalte werden jedoch im Entwurf gespeichert.",
	publishErrMsg: "Die Version wurde nicht veröffentlicht. Möglicherweise ist die Datei zu groß oder der Server hat das zulässige Zeitlimit überschritten. Versuchen Sie es später noch einmal oder brechen Sie den Vorgang ab und wenden Sie sich an Ihren Administrator, um das Serverprotokoll zu überprüfen und das Problem zu ermitteln.",
	publishErrMsg_Quota_Out: "Es ist nicht ausreichend Speicherplatz vorhanden, um eine neue Version des Dokuments zu veröffentlichen. Entfernen Sie andere Dateien, um genügend Speicherplatz für die Veröffentlichung dieses Dokuments zu erhalten.",
	publishErrMsg_NoFile: "Die Veröffentlichung ist fehlgeschlagen, da dieses Dokument von anderen Benutzern gelöscht wurde.",
	publishErrMsg_NoPermission: "Die Veröffentlichung der neuen Version ist fehlgeschlagen, da Sie nicht berechtigt sind, diese Datei zu bearbeiten. Wenden Sie sich an den Dateieigner, um die Berechtigung zum Bearbeiten zu erhalten, und versuchen Sie es erneut."
		
})

