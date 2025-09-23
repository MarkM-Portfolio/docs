({
	//actionNew dojo menu
	newName : "Nouveau",
	newTooltip : "Créer un document",
	WARN_INTERNAL : "Une fois qu'un fichier est créé, il n'est pas possible de modifier l'autorisation de partage avec des personnes externes à votre organisation.",
	newCommunityInfo : "Les membres de communauté peuvent éditer ce fichier.",
  	CANCEL : "Annuler",
  	DOWNLOAD_EMPTY_TITLE : "Impossible de télécharger le fichier",
  	DOWNLOAD_EMPTY_OK : "Fermer",
  	DOWNLOAD_EMPTY_CONTENT1 : "Il n'existe pas de version publiée de ce fichier à télécharger.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Les versions peuvent être publiées à partir de l'éditeur Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Impossible de télécharger le fichier",
  	DOWNLOAD_EMPTYVIEW_OK : "Fermer",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Il n'existe pas de version publiée de ce fichier à télécharger.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Demandez au propriétaire de publier une version de ce fichier.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Télécharger une version",
  	DOWNLOAD_NEWDRAFT_OK : "Télécharger la version",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "dernière édition le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "dernière édition le ${date}",	
		TODAY: "dernière édition aujourd'hui à ${time}",	
		YEAR: "dernière édition le ${date_long}",	
		YESTERDAY:	"dernière édition hier à ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Un brouillon plus récent, édité en dernier le ${date}, a été détecté.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Un brouillon plus récent, édité en dernier le ${date}, a été détecté.",	
		TODAY: "Un brouillon plus récent, édité en dernier à ${time}, a été détecté.",	
		YEAR: "Un brouillon plus récent, édité en dernier le ${date_long}, a été détecté.",	
		YESTERDAY:	"Un brouillon plus récent, édité en dernier hier à ${time}, a été détecté."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Voulez-vous vraiment continuer à télécharger la version publiée le ${date} ?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Voulez-vous vraiment continuer à télécharger la version publiée le ${date} ?",	
		TODAY: "Voulez-vous vraiment continuer à télécharger la version publiée aujourd'hui à ${time} ?",	
		YEAR: "Voulez-vous vraiment continuer à télécharger la version publiée le ${date_long} ?",	
		YESTERDAY:	"Voulez-vous vraiment continuer à télécharger la version publiée hier à ${time} ?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Il s'agit de la version téléchargeable la plus récente d'un fichier Docs. Pour savoir si une version ultérieure existe en format brouillon, contactez le propriétaire du fichier.",

  	VIEW_FILE_DETAILS_LINK : "Afficher les détails du fichier",
  	OPEN_THIS_FILE_TIP: "Ouvrir ce fichier",
  
	//newDocument 
	newDocumentName : "Document",
	newDocumentTooltip : "Nouveau document",
	newDocumentDialogTitle : "Nouveau document",
	newDocumentDialogContent : "Indiquez un nom pour ce document sans titre.",
	newDocumentDialogBtnOK : "Créer",
	newDocumentDialogBtnOKTitle : "Créer un document",
	newDocumentDialogInitialName : "Document sans titre",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003 (*.doc)",
		odt: "OpenDocument Text (*.odt)"
  	},
	newDocumentDialogBtnCancel : "Annuler",
	newDocumentDialogNamepre : "*Nom :",
	newDocumentDialogDocumentTypePre : "Type :",
	newDocumentDialogDocumentChangeTypeLink : "Modifier l'extension de fichier par défaut",
	newDocumentDialogDupErrMsg : "Un nom de fichier en double a été détecté. Indiquez un nouveau nom.",
	newDocumentDialogIllegalErrMsg : "${0} est un titre de document non admis. Indiquez-en un autre.",
	newDocumentDialogNoNameErrMsg : "Nom de document requis.",
	newDocumentDialogNoPermissionErrMsg : "Le fichier ne peut être créé car vous n'avez pas d'accès Editeur. Contactez l'administrateur.",
	newDocumentDialogServerErrMsg : "Le serveur Docs n'est pas disponible. Contactez l'administrateur du serveur et réessayez plus tard.",
	newDocumentDialogServerErrMsg2 : "Le serveur Connections n'est pas disponible. Contactez l'administrateur du serveur et réessayez plus tard.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Raccourcir le nom du document ?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Le nom du document est trop long.",
	newDialogProblemidErrMsg : "Signalez ce problème à votre administrateur. ",
	newDialogProblemidErrMsg_tip : "Signalez ce problème à votre administrateur. ${shown_action}",
	newDialogProblemidErrMsgShow: "Cliquez pour afficher des détails",
	newDialogProblemidErrMsgHide: "Cliquez pour masquer",
	newDocumentDialogTargetPre: "*Enregistrer dans :",
	newDocumentDialogTargetCommunity: "Cette communauté",
	newDocumentDialogTargetMyFiles: "Mes fichiers",

	//newSpreadsheet 
	newSheetName : "Feuille de calcul",
	newSheetTooltip : "Nouvelle feuille de calcul",
	newSheetDialogTitle : "Nouvelle feuille de calcul",
	newSheetDialogBtnOKTitle : "Créer une feuille de calcul",
	newSheetDialogInitialName : "Feuille de calcul sans titre",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003 (*.xls)",
		ods: "OpenDocument Spreadsheet (*.ods)"
  	},

	//newPresentation 
	newPresName : "Présentation",
	newPresTooltip : "Nouvelle présentation",
	newPresDialogTitle : "Nouvelle présentation",
	newPresDialogBtnOKTitle : "Créer une présentation",
	newPresDialogInitialName : "Présentation sans titre",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003 (*.ppt)",
		odp: "OpenDocument Presentation (*.odp)"
  	},

	//actionNewFrom
	newFromName : "Créer un fichier",
	newFromDialogName : "Nouveau à partir du fichier",
	newFromTooltip: "Créez un fichier en utilisant ce fichier comme modèle",
	newFromDocTip : "Créez un document (fichier DOC,DOCX ou ODT) à partir d'un fichier modèle. Vous pouvez éditer ces documents en ligne dans Docs.",
	newFromSheetTip : "Créez une feuille de calcul (fichier XLS, XLSX ou ODS) à partir d'un fichier modèle. Vous pouvez éditer ces feuilles de calcul en ligne dans Docs.",
	newFromPresTip : "Créez une présentation (fichier PPT, PPTX ou ODP) à partir d'un fichier modèle. Vous pouvez éditer ces présentations en ligne dans Docs.",

	//actionEdit
	editName : "Editer dans Docs",
	editTooltip : "Editer dans Docs",
	editWithDocsDialogTitle : "Démarrer l'édition en ligne avec Docs ?",
	editWithDocsDialogContent1 : "Docs permet de travailler sur des fichiers en même temps que d'autres collaborateurs et de voir immédiatement les modifications. Vous pouvez aussi travailler en ligne en privé.",
	editWithDocsDialogContent2 : "Vous n'avez pas besoin d'envoyer par téléchargement de nouvelles versions d'un document. Si toute l'édition est effectuée en ligne, votre travail et vos commentaires sont protégés. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Editer en ligne",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

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
	draft_published : "Les dernières modifications du brouillon ont été publiées.",
	draft_beiing_edited : "Ce fichier est actuellement édité sur le Web par ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Seuls les fichiers qui sont des documents Docs peuvent être édités.",
	draft_unpublished_tip : "Certaines modifications de ce brouillon n'ont pas été publiées en tant que version. ${publish_action}",
	draft_save_action_label : "Publier une version",
	draft_not_found : "Il n'existe aucune modification de brouillon pour ce fichier.",
	draft_latest_edit : "Dernière modification :",
	draft_cur_editing : "Edition actuelle :",
	draft_edit_link : "Editer",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Il s'agit d'un fichier Docs. Toutes les éditions doivent être effectuées en ligne.",
	nonentitlement_docs_indicator_text: "Ce fichier est disponible pour édition uniquement si vous avez acheté une autorisation d'utilisation Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} a publié le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} a publié le ${date}",	
		TODAY: "${user} a publié aujourd'hui à ${time}",	
		YEAR: "${user} a publié le ${date_long}",	
		YESTERDAY:	"${user} a publié hier à ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publié le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Publié le ${date}",	
		TODAY: "Publié aujourd'hui à ${time}",	
		YEAR: "Publié le ${date_long}",	
		YESTERDAY:	"Publié hier à ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "Version publiée par ${user} le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version publiée par ${user} le ${date}",	
		TODAY: "Version publiée par ${user} aujourd'hui à ${time}",	
		YEAR: "Version publiée par ${user} le ${date_long}",	
		YESTERDAY:	"Version publiée par ${user} hier à ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Version publiée le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version publiée le ${date}",	
		TODAY: "Version publiée aujourd'hui à ${time}",	
		YEAR: "Version publiée le ${date_long}",	
		YESTERDAY:	"Version publiée hier à ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "Créé par ${user} le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Créé par ${user} le ${date}",	
		TODAY: "Créé par ${user} aujourd'hui à ${time}",	
		YEAR: "Créé par ${user} le ${date_long}",	
		YESTERDAY:	"Créé par ${user} hier à ${time}"
	},
	LABEL_CREATED: {
		DAY: "Créé le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Créé le ${date}",	
		TODAY: "Créé aujourd'hui à ${time}",	
		YEAR: "Créé le ${date_long}",	
		YESTERDAY:	"Créé hier à ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "Brouillon édité par ${user} le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Brouillon édité par ${user} le ${date}",	
		TODAY: "Brouillon édité par ${user} aujourd'hui à ${time}",	
		YEAR: "Brouillon édité par ${user} le ${date_long}",	
		YESTERDAY:	"Brouillon édité par ${user} hier à ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Brouillon édité le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Brouillon édité le ${date}",	
		TODAY: "Brouillon édité aujourd'hui à ${time}",	
		YEAR: "Brouillon édité le ${date_long}",	
		YESTERDAY:	"Brouillon édité hier à ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "Brouillon créé par ${user} le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Brouillon créé par ${user} le ${date}",	
		TODAY: "Brouillon créé par ${user} aujourd'hui à ${time}",	
		YEAR: "Brouillon créé par ${user} le ${date_long}",	
		YESTERDAY:	"Brouillon créé par ${user} hier à ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Brouillon créé le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Brouillon créé le ${date}",	
		TODAY: "Brouillon créé aujourd'hui à ${time}",	
		YEAR: "Brouillon créé le ${date_long}",	
		YESTERDAY:	"Brouillon créé hier à ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Edité le ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Edité le ${date}",	
		TODAY: "Edité aujourd'hui à ${time}",	
		YEAR: "Edité le ${date_long}",	
		YESTERDAY:	"Edité hier à ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Navigateur non pris en charge",
	unSupporteBrowserContent1: "Votre navigateur risque de ne pas fonctionner correctement avec Docs. Pour de meilleurs résultats, essayez l'un des navigateurs pris en charge.",
	unSupporteBrowserContent2: "Vous pouvez bien sûr continuer à utiliser votre navigateur mais il est possible que vous ne bénéficierez pas de toutes les fonctions de Docs.",
	unSupporteBrowserContent3: "Ne plus afficher ce message.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Vous utilisez Fichiers et Docs pour la première fois ?",
	INTRODUCTION_BOX_BLURB: "Envoyez par téléchargement et partagez des fichiers. Créez et éditez des fichiers individuellement ou en équipe à l'aide de Docs. Organisez les fichiers dans des dossiers, suivez les modifications de fichiers et épinglez vos favoris.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Connectez-vous pour commencer à utiliser Fichiers et Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Cliquez sur "Envoyer des fichiers par téléchargement" pour ajouter un fichier. Cliquez sur "Nouveau" pour créer un fichier avec Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Cliquez sur Envoyer des fichiers par téléchargement pour ajouter un fichier. Cliquez sur Nouveau pour créer un fichier avec Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Fermer la section "Bienvenue dans Fichiers et Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Créez et partagez du contenu avec des collègues. Apprenez à :",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Ajouter vos propres fichiers.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Commencer à éditer en ligne, en temps réel, individuellement ou en collaboration.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Envoyer par téléchargement et éditer des documents, des feuilles de calcul ou des présentations.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Ajouter vos propres fichiers{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Commencer à éditer en ligne, en temps réel, individuellement ou en collaboration{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Envoyer par téléchargement et éditer des documents, des feuilles de calcul ou des présentations{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Mise en page",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientation",
	PORTRAIT: "Portrait",
	LANDSCAPE: "Paysage",	
	MARGINS_LABEL: "Marges",
	TOP: "Haut :",
	TOP_DESC:"Marge supérieure, en centimètres",
	TOP_DESC2:"Marge supérieure, en pouces",
	BOTTOM: "Bas :",
	BOTTOM_DESC:"Marge inférieure, en centimètres",
	BOTTOM_DESC2:"Marge inférieure, en pouces",
	LEFT: "Gauche :",
	LEFT_DESC:"Marge de gauche, en centimètres",
	LEFT_DESC2:"Marge de gauche, en pouces",	
	RIGHT: "Droite :",
	RIGHT_DESC:"Marge de droite, en centimètres",
	RIGHT_DESC2:"Marge de droite, en pouces",
	PAPER_FORMAT_LABEL: "Format de papier",
	PAPER_SIZE_LABEL: "Format de papier :",
	HEIGHT: "Hauteur :",
	HEIGHT_DESC:"Hauteur du papier, en centimètres",
	HEIGHT_DESC2:"Hauteur du papier, en pouces",	
	WIDTH: "Largeur :",
	WIDTH_DESC:"Largeur du papier, en centimètres",
	WIDTH_DESC2:"Largeur du papier, en pouces",
	CM_LABEL: "cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Utilisateur",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai grand",
	DISPLAY_OPTION_LABEL: "Options d'affichage",
	HEADER: "En-tête",
	HEADER_DESC:"Hauteur de l'en-tête, en centimètres",	
	FOOTER: "Pied de page",
	FOOTER_DESC:"Hauteur du pied de page, en centimètres",
	GRIDLINE: "Quadrillage",
	TAGGED_PDF: "PDF balisé",
	PAGE_LABEL: "Ordre des pages",
	PAGE_TYPE1: "De haut en bas, puis vers la droite",
	PAGE_TYPE2: "De gauche à droite, puis vers le bas",
	PAGE_SETUP_INVALID_MSG: "L'entrée n'est pas valide et a été rectifiée automatiquement. Essayez une autre valeur si vous voulez un résultat différent.",
	
	//Docs publish message
	service_unavailable_content: "Le service Docs n'est pas disponible. Votre demande ne peut pas être traitée pour l'instant. Réessayez ultérieurement ou contactez votre administrateur système.",
	viewaccess_denied_content: "Vous ne disposez pas des droits nécessaires pour afficher ce fichier. Le fichier doit être public ou partagé avec vous.",
	editaccess_denied_content: "Vous ne disposez pas des droits nécessaires pour éditer ce fichier. Vous devez disposer de droits sur Docs et le fichier doit être partagé avec vous ou vous devez disposer d'un accès Editeur au fichier.",
	doc_notfound_content: "Le document auquel vous voulez accéder a été supprimé ou déplacé. Vérifiez que le lien est correct.",
	repository_out_of_space_content: "L'espace dont vous disposez ne vous permet pas d'enregistrer votre nouveau document. Retirez des fichiers pour libérer de la place et procéder à cet enregistrement.",
	fileconnect_denied_content: "Docs ne peut pas se connecter au référentiel de fichiers. Réessayez ultérieurement ou contactez votre administrateur système.",
	convservice_unavailable_content: "Le service de conversion de Docs n'est pas disponible. Votre demande ne peut pas être traitée pour l'instant. Réessayez ultérieurement ou contactez votre administrateur système.",
	doc_toolarge_content: "Le document auquel vous voulez accéder est trop volumineux.",
	conversion_timeout_content: "Pour l'instant, la conversion du document prend trop de temps. Réessayez ultérieurement.",
	storageserver_error_content: "Le serveur n'est pas disponible actuellement. Votre demande ne peut pas être traitée pour l'instant. Réessayez ultérieurement ou contactez votre administrateur système.",
	server_busy_content:"Attendez un moment puis réessayez.",
	publish_locked_file: "Vous ne pouvez pas publier ce fichier en tant que nouvelle version car il est verrouillé, le contenu est toutefois automatiquement enregistré dans le brouillon.",
	publishErrMsg: "La version n'a pas été publiée. Il se peut que le fichier soit trop gros ou que le serveur fasse l'objet d'un dépassement de délai. Recommencez ou annulez et demandez à votre administrateur de consulter le journal serveur afin d'identifier le problème.",
	publishErrMsg_Quota_Out: "L'espace disponible ne permet pas de publier une nouvelle version de ce document. Supprimez des fichiers pour libérer de l'espace afin de procéder à la publication de ce document.",
	publishErrMsg_NoFile: "Puisque ce document a été supprimé par d'autres, la publication a échoué.",
	publishErrMsg_NoPermission: "La publication d'une nouvelle version a échoué car vous ne disposez pas de droits en édition sur ce fichier. Contactez le propriétaire du fichier pour les obtenir puis réessayez."
		
})

