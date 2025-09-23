({
	//actionNew dojo menu
	newName : "Neu",
	newTooltip : "Dokument erstellen",

	//newDocument 
	newDocumentName : "Dokument",
	newDocumentTooltip : "Dokument erstellen",
	newDocumentDialogTitle : "Dokument erstellen",
	newDocumentDialogContent : "Geben Sie einen neuen Namen für diesen unbenannten Entwurf an",
	newDocumentDialogBtnOK : "Erstellen",
	newDocumentDialogBtnOKTitle : "Dokument erstellen",
	newDocumentDialogBtnCancel : "Abbrechen",
	newDocumentDialogNamepre : "Name (*)",
	newDocumentDialogInitialName : "Unbenanntes Dokument",
	newDocumentDialogDupErrMsg : "Ein doppelt vorhandener Dateiname wurde gefunden. Geben Sie einen neuen Namen ein.",
	newDocumentDialogIllegalErrMsg : "${0} ist ein ungültiger Dokumenttitel. Geben Sie einen anderen an.",
	newDocumentDialogServerErrMsg : "Der HCL Docs Server ist nicht verfügbar. Kontaktieren Sie den Serveradministrator und versuchen Sie es später erneut.",
	newDocumentDialogServerErrMsg2 : "Der HCL Connections-Server ist nicht verfügbar. Wenden Sie sich an den Serveradministrator und versuchen Sie es später noch einmal.",


	//newSpreadsheet 
	newSheetName : "Arbeitsblatt",
	newSheetTooltip : "Arbeitsblatt erstellen",
	newSheetDialogTitle : "Arbeitsblatt erstellen",
	newSheetDialogBtnOKTitle : "Arbeitsblatt erstellen",
	newSheetDialogInitialName : "Unbenanntes Arbeitsblatt",

	//newPresentation 
	newPresName : "Präsentation",
	newPresTooltip : "Präsentation erstellen",
	newPresDialogTitle : "Präsentation erstellen",
	newPresDialogBtnOKTitle : "Präsentation erstellen",
	newPresDialogInitialName : "Unbenannte Präsentation",

	//actionNewFrom
	newFromName : "Datei erstellen",
	newFromTooltip: "Neue Datei mithilfe dieser Datei als Vorlage erstellen",
	newFromDocTip : "Ein Dokument mithilfe der aktuellen Datei als Vorlage erstellen.",
	newFromSheetTip : "Ein Arbeitsblatt mit der aktuellen Datei als Vorlage erstellen.",

	//actionEdit
	editName : "Bearbeiten",
	editTooltip : "Bearbeiten",

	//actionView
	viewName : "Ansicht",
	viewTooltip : "Vorschau der Datei in einem Browser anzeigen",

	//doc too large
	docTooLargeTitle : "Das Dokument ist zu groß.",
	docTooLargeDescription : "Das Dokument, das Sie bearbeiten wollen ist zu groß. <br />Stellen Sie sicher, dass die Dateigröße im Format *.odt, *.doc, <br />oder *.docx nicht größer als 2048 K ist.",
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
	downloadWithUnsavedDraftReadersDescription: "Diese Version enthält möglicherweise nicht die neuesten Bearbeitungen. Diese Version des heruntergeladenen Dokumentes ist die zuletzt gespeicherte Version eines Bearbeiters des Dokuments. Möchten Sie den Vorgang fortsetzen?",

	//draft tab

	draft_tab_title : "Entwurf",
	draft_created : "${0} auf der Basis von Version ${1}",
	draft_beiing_edited : "Diese Datei wird zurzeit im World Wide Web von ${user} bearbeitet.",
	draft_editor_valid : "Dieser Entwurf kann nur von der Datei zugewiesenen Bearbeitern verwendet werden.",
	draft_doctype_valid : "Es können nur HCL Docs-Dokumente bearbeitet werden.",
	draft_unpublished_tip : "Vorhandene Entwurfsbearbeitungen wurden noch nicht als Version gespeichert.",
	draft_save_action_label : "Speichern",
	draft_not_found : "Für diese Datei gibt es keine weiteren Entwürfe.",
	draft_latest_edit : "Letzte Bearbeitung:",
	draft_cur_editing : "Aktuelle Bearbeitung:",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "Nicht unterstützter Browser",
	unSupporteBrowserContent1: "Ihr Browser funktioniert eventuell nicht ordnungsgemäß mit HCL Docs. Für bestmögliche Ergebnisse, verwenden Sie bitte einen der folgenden unterstützten Browser.",
	unSupporteBrowserContent2: "Selbstverständlich können Sie mit Ihrem Browser fortfahren, dadurch können Sie unter Umständen jedoch nicht alle Funktionen von HCL Docs verwenden.",
	unSupporteBrowserContent3: "Diese Nachricht nicht mehr anzeigen."
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})
