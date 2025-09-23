({
	//actionNew dojo menu
	newName : "Nouveau",
	newTooltip : "Créer un document",

	//newDocument 
	newDocumentName : "Document",
	newDocumentTooltip : "Créer un document",
	newDocumentDialogTitle : "Créer un document",
	newDocumentDialogContent : "Indiquez un nom pour ce brouillon sans titre",
	newDocumentDialogBtnOK : "Créer",
	newDocumentDialogBtnOKTitle : "Créer un document",
	newDocumentDialogBtnCancel : "Annuler",
	newDocumentDialogNamepre : "Nom (*)",
	newDocumentDialogInitialName : "Document sans titre",
	newDocumentDialogDupErrMsg : "Un nom de fichier en double a été détecté. Indiquez un nouveau nom.",
	newDocumentDialogIllegalErrMsg : "${0} est un titre de document non admis, indiquez-en un autre.",
	newDocumentDialogServerErrMsg : "Le serveur HCL Docs n'est pas disponible. Contactez l'administrateur du serveur et réessayez plus tard.",
	newDocumentDialogServerErrMsg2 : "Le serveur HCL Connections n'est pas disponible. Contactez l'administrateur du serveur et réessayez plus tard.",


	//newSpreadsheet 
	newSheetName : "Feuille de calcul",
	newSheetTooltip : "Créer une feuille de calcul",
	newSheetDialogTitle : "Créer une feuille de calcul",
	newSheetDialogBtnOKTitle : "Créer une feuille de calcul",
	newSheetDialogInitialName : "Feuille de calcul sans titre",

	//newPresentation 
	newPresName : "Présentation",
	newPresTooltip : "Créer une présentation",
	newPresDialogTitle : "Créer une présentation",
	newPresDialogBtnOKTitle : "Créer une présentation",
	newPresDialogInitialName : "Présentation sans titre",

	//actionNewFrom
	newFromName : "Créer un fichier",
	newFromTooltip: "Créer un fichier en utilisant ce fichier comme modèle",
	newFromDocTip : "Créer un document en utilisant le fichier actuel comme modèle.",
	newFromSheetTip : "Créer une feuille de calcul en utilisant le fichier actuel comme modèle.",

	//actionEdit
	editName : "Edition",
	editTooltip : "Edition",

	//actionView
	viewName : "Vue",
	viewTooltip : "Prévisualiser le fichier dans un navigateur",

	//doc too large
	docTooLargeTitle : "Le document est trop volumineux.",
	docTooLargeDescription : "Le document que vous voulez éditer est trop volumineux. <br />Vérifiez que la taille du fichier au format *.odt, *.doc, <br />ou *.docx n'est pas supérieure à 2048 ko.",
	docTooLargeCancelBtn: "Annuler",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Edition actuelle : ",
		
	//Sheet title
	sheetTitle0: "Feuille1",
	sheetTitle1: "Feuille2",
	sheetTitle2: "Feuille3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Télécharger au format Microsoft Office",
	downloadAsPDF: "Télécharger sous forme de fichier PDF",
	downloadWithUnsavedDraftTitle: "Brouillon en instance",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "Cette version peut ne pas contenir les éditions en ligne les plus récentes. Cliquez sur Enregistrer pour créer une version et un téléchargement. Cliquez sur Annuler pour poursuivre sans enregistrer.",
	downloadWithUnsavedDraftReadersDescription: "Cette version peut ne pas contenir les éditions les plus récentes. La version du document téléchargé sera la dernière version enregistrée par un éditeur du document. Voulez-vous poursuivre ?",

	//draft tab

	draft_tab_title : "Brouillon",
	draft_created : "${0} reposant sur Version ${1}",
	draft_beiing_edited : "Ce fichier est actuellement édité sur le Web par ${user}.",
	draft_editor_valid : "Seules les personnes qui sont affectées en tant qu'éditeurs du fichier peuvent travailler avec un brouillon.",
	draft_doctype_valid : "Seuls les fichiers qui sont des documents HCL Docs peuvent être édités.",
	draft_unpublished_tip : "Certaines modifications du brouillon n'ont pas été enregistrées en tant que version.",
	draft_save_action_label : "Enregistrer",
	draft_not_found : "Il n'existe aucune modification de brouillon pour ce fichier.",
	draft_latest_edit : "Dernière modification :",
	draft_cur_editing : "Edition actuelle : ",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "Navigateur non pris en charge",
	unSupporteBrowserContent1: "Votre navigateur risque de ne pas fonctionner correctement avec HCL Docs. Pour de meilleurs résultats, essayez l'un des navigateurs pris en charge.",
	unSupporteBrowserContent2: "Vous pouvez bien sûr continuer à utiliser votre navigateur mais il est possible que vous ne bénéficierez pas de toutes les fonctions d'HCL Docs.",
	unSupporteBrowserContent3: "Ne plus afficher ce message."
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})
