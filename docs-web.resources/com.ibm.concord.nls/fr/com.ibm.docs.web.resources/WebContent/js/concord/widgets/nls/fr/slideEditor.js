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
	ctxMenu_createSlide: 	"Créer une diapositive",
	ctxMenu_renameSlide: 	"Renommer la diapositive",
	ctxMenu_deleteSlide: 	"Supprimer une diapositive",
	ctxMenu_selectAll: 	 	"Tout sélectionner",
	ctxMenu_createTextBox: 	"Ajouter une zone de texte",
	ctxMenu_addImage:	 	"Ajouter une image",		
	ctxMenu_createTable: 	"Créer un tableau",
	ctxMenu_slideTransition: "Transition entre les diapositives",
	ctxMenu_slideTransitionTitle: "Sélectionner une transition",
	ctxMenu_slideLayout: 	"Mise en page de diapositive",
	ctxMenu_slideTemplates: "Styles maître",
	ctxMenu_paste: 	 		"Coller",
	ctxMenu_autoFix: 		"Correction automatique",
		
	imageDialog: {	
		titleInsert:		"Insérer une image",
		insertImageBtn:		"Insérer",							
		URL:				"URL :",
		uploadFromURL:		"Image depuis le Web",
		imageGallery:		"Galerie d'images",
		uploadAnImageFile:	"Image depuis un fichier",
		uploadImageFileTitle: "Spécification d'une image à envoyer par téléchargement depuis un fichier",
		insertImageErrorP1: "Impossible d'insérer l'image dans le document.",
		insertImageErrorP2: "Un problème a été détecté sur le serveur (par exemple, un manque d'espace disque).",
		insertImageErrorP3: "Demandez à votre administrateur de consulter le journal serveur afin d'identifier le problème."
	},
	
	concordGallery:{
		results:		"Résultats : ${0}",
		show:			"Afficher :",
		all	:			"Tout",
		images:			"Images",
		pictures: 		"Images",
		arrows: 		"Flèches",
		bullets: 		"Puces",
		computer: 		"Informatique",
		diagram: 		"Diagramme",
		education: 		"Enseignement",
		environment: 	"Environnement",
		finance: 		"Finance",
		people: 		"Personnes",
		shape: 			"Formes",
		symbol: 		"Symboles",
		transportation:	"Transport",
		table:			"Tableaux",
		search:			"Rechercher",
		loading:		"Chargement en cours..."
	},
	
	contentLockTitle: "Message de verrouillage de contenu",
	contentLockMsg :  "L'opération ne peut pas être effectuée sur certains des objets sélectionnés car ces derniers sont actuellement utilisés par le ou les utilisateurs suivants :",
	contentLockemail: "adresse électronique",
	
	warningforRotatedShape: "L'opération sur un ou plusieurs des objets ne peut pas être effectuée car ces objets sont des objets ayant subi une rotation.",
	
	cannotCreateShapesTitle: "Impossible de créer des formes",
	cannotCreateShapesMessage: "${productName} ne prend pas en charge la création de formes dans les versions d'Internet Explorer antérieures à la version 9. Pour créer des formes, utilisez un autre navigateur.",
	cannotShowShapesTitle: "Impossible d'afficher des formes",

	slidesInUse:"Diapositives en cours d'utilisation",
	slidesInUseAll: "L'opération n'a pas pu être exécutée sur les diapositives sélectionnées car certaines d'entre elles sont actuellement utilisées par les personnes suivantes :",
	slidesInUseSome: "L'opération n'a pas pu être exécutée sur certaines des diapositives sélectionnées car elles sont actuellement utilisées par les personnes suivantes :",
	
	contentInUse:"Contenu en cours d'utilisation",
	contentInUseAll:"L'opération n'a pas pu être exécutée sur le contenu de diapositive sélectionné car une partie de ce dernier est actuellement utilisé par les personnes suivantes :",
	contentInUseSome:"L'opération n'a pas pu être exécutée sur une partie du contenu de diapositives sélectionné car ce dernier est actuellement utilisé par les personnes suivantes :",
		
	undoContentNotAvailable: "L'annulation n'a pas pu être exécutée car le contenu n'est plus disponible.",
	redoContentNotAvailable: "Le rétablissement n'a pas pu être exécuté car le contenu n'est plus disponible.",
	undoContentAlreadyExist: "L'annulation n'a pas pu être exécutée car le contenu existe déjà." ,
	redoContentAlreadyExist: "Le rétablissement n'a pas pu être exécuté car le contenu existe déjà.",
	
	preventTemplateChange:"Diapositives en cours d'utilisation",
	preventTemplateChangeMsg: "Le style maître ne peut pas être modifié lorsqu'un autre utilisateur édite la présentation.",
	
	createTblTitle: 	"Créer un tableau",
	createTblLabel: 	"Entrez le nombre de lignes et de colonnes. La valeur maximum est 10.",
	createTblNumRows: "Nombre de lignes",
	createTblNumCols: "Nombre de colonnes",
	createTblErrMsg:  "Vérifiez que la valeur est un entier positif, qu'elle n'est pas à blanc et qu'elle n'est pas supérieure à 10.",

	insertTblRowTitle: 	"Insérer des lignes",
	insertTblRowNumberOfRows: 	"Nombre de lignes",
	insertTblRowNumberPosition: 	"Position :",
	insertTblRowAbove: 	"Au-dessus",
	insertTblRowBelow: 	"En dessous",
	
	insertTblColTitle: 	"Insérer des colonnes",
	insertTblColNumberOfCols: 	"Nombre de colonnes",
	insertTblColNumberPosition: 	"Position :",
	insertTblColBefore: "Avant",
	insertTblColAfter: 	"Après",
	
	insertVoicePosition: "Position",
	
 	defaultText_newBox2: "Cliquez deux fois pour ajouter du texte",	
	defaultText_newBox: "Cliquez pour ajouter du texte",
	defaultText_speakerNotesBox: "Cliquez pour ajouter des notes",
	
	cannotAddComment_Title: "Impossible d'ajouter un commentaire",
	cannotAddComment_Content: "Aucun commentaire ne peut être associé à cette zone de contenu ou à cette diapositive. La zone de contenu ou la diapositive ne peut comporter que ${0} commentaires au maximum.",
	
	invalidImageType: "Ce type d'image n'est pas pris en charge actuellement. Transformez l'image en .bmp, .jpg, .jpeg, .gif ou .png puis réessayez.",
	
	error_unableToDestroyTABContentsInDialog: "Impossible de supprimer le contenu des onglets de la boite de dialogue",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Annuler",
	preparingSlide: "Préparation de la diapositive pour l'édition",
	
	slideCommentClose: "Fermer le commentaire",
	slideCommentDone: "Terminé",
	slideCommentPrev: "Précédent",
	slideCommentNext: "Suivant"
})

