/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "Editeur de texte enrichi, %1.",

	// ARIA descriptions.
	toolbars	: "Barres d'outils d'éditeur",
	editor	: "Editeur de texte enrichi",

	// Toolbar buttons without dialogs.
	source			: "Source",
	newPage			: "Nouvelle page",
	save			: "Enregistrer",
	preview			: "Aperçu :",
	cut				: "Couper",
	copy			: "Copier",
	paste			: "Coller",
	print			: "Imprimer",
	underline		: "Soulignement",
	bold			: "Gras",
	italic			: "Italique",
	selectAll		: "Tout sélectionner",
	removeFormat	: "Supprimer le format",
	strike			: "Barré",
	subscript		: "Indice",
	superscript		: "Exposant",
	horizontalrule	: "Insérer une ligne horizontale",
	pagebreak		: "Insérer un saut de page",
	pagebreakAlt		: "Saut de page",
	unlink			: "Supprimer le lien",
	undo			: "Annuler",
	redo			: "Rétablir",

	// Common messages and labels.
	common :
	{
		browseServer	: "Serveur de navigateur :",
		url				: "URL :",
		protocol		: "Protocole :",
		upload			: "Télécharger :",
		uploadSubmit	: "L'envoyer au serveur",
		image			: "Insérer une image",
		flash			: "Insérer une vidéo Flash",
		form			: "Insérer un masque",
		checkbox		: "Insérer une case à cocher",
		radio			: "Insérer un bouton radio",
		textField		: "Insérer une zone de texte",
		textarea		: "Insérer une région de texte",
		hiddenField		: "Insérer une zone masquée",
		button			: "Insérer un bouton",
		select			: "Insérer une zone de sélection",
		imageButton		: "Insérer un bouton picto",
		notSet			: "<not set>",
		id				: "ID :",
		name			: "Nom :",
		langDir			: "Orientation du texte :",
		langDirLtr		: "De gauche à droite",
		langDirRtl		: "De droite à gauche",
		langCode		: "Code de langue :",
		longDescr		: "URL de longue description :",
		cssClass		: "Classes de feuille de style :",
		advisoryTitle	: "Titre d'avis :",
		cssStyle		: "Style :",
		ok				: "OK",
		cancel			: "Annuler",
		close : "Fermer",
		preview			: "Aperçu :",
		generalTab		: "Général",
		advancedTab		: "Avancé",
		validateNumberFailed	: "Cette valeur n'est pas un nombre.",
		confirmNewPage	: "Toute modification non enregistrée apportée à ce contenu sera perdue. Voulez-vous vraiment charger une nouvelle page ?",
		confirmCancel	: "Certaines options ont changé. Voulez-vous vraiment fermer la boîte de dialogue ?",
		options : "Options",
		target			: "Cible :",
		targetNew		: "Nouvelle fenêtre (_blank)",
		targetTop		: "Fenêtre supérieure (_top)",
		targetSelf		: "Même fenêtre (_self)",
		targetParent	: "Fenêtre parent (_parent)",
		langDirLTR		: "De gauche à droite",
		langDirRTL		: "De droite à gauche",
		styles			: "Style :",
		cssClasses		: "Classes de feuille de style :",
		width			: "Largeur :",
		height			: "Hauteur :",
		align			: "Aligner :",
		alignLeft		: "Gauche",
		alignRight		: "Droite",
		alignCenter		: "Centrer",
		alignTop		: "Haut",
		alignMiddle		: "Milieu",
		alignBottom		: "Bas",
		invalidHeight	: "La valeur de hauteur doit être un nombre entier positif.",
		invalidWidth	: "La valeur de largeur doit être un nombre entier positif.",
		invalidCssLength	: "La valeur spécifiée pour la zone %1 doit être un nombre positif avec ou sans unité de mesure CSS valide (px, %, in, cm, mm, em, ex, pt ou pc).",
		invalidHtmlLength	: "La valeur spécifiée pour la zone %1 doit être un nombre positif avec ou sans unité de mesure HTML valide (px ou %).",
		invalidInlineStyle	: "La valeur spécifiée pour le style interne doit se composer d'un ou de plusieurs tuples au format \"name : value\", séparés par des points virgules.",
		cssLengthTooltip	: "Entrez un nombre pour une valeur en pixels ou un nombre avec une unité CSS valide (px, %, in, cm, mm, em, ex, pt ou pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, indisponible</span>"
	},

	contextmenu :
	{
		options : "Options de menu contextuel"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Insérer un caractère spécial",
		title		: "Caractères spéciaux",
		options : "Options de caractère spécial"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Lien URL",
		other 		: "<other>",
		menu		: "Editer le lien...",
		title		: "Lien",
		info		: "Informations sur le lien",
		target		: "Cible",
		upload		: "Télécharger :",
		advanced	: "Avancé",
		type		: "Type de lien :",
		toUrl		: "URL",
		toAnchor	: "Lier à l'ancrage du texte",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nom de cadre cible :",
		targetPopupName	: "Nom de fenêtre en incrustation :",
		popupFeatures	: "Fonctions de fenêtre en incrustation :",
		popupResizable	: "Redimensionnable",
		popupStatusBar	: "Barre d'état",
		popupLocationBar	: "Barre d'emplacement",
		popupToolbar	: "Barre d'outils",
		popupMenuBar	: "Barre de menus",
		popupFullScreen	: "Plein écran (IE)",
		popupScrollBars	: "Barres de défilement",
		popupDependent	: "Dépendante (Netscape)",
		popupLeft		: "Position gauche",
		popupTop		: "Position haute",
		id				: "ID :",
		langDir			: "Orientation du texte :",
		langDirLTR		: "De gauche à droite",
		langDirRTL		: "De droite à gauche",
		acccessKey		: "Clé d'accès :",
		name			: "Nom :",
		langCode		: "Code de langue :",
		tabIndex		: "Index de tabulation :",
		advisoryTitle	: "Titre d'avis :",
		advisoryContentType	: "Type de contenu d'avis :",
		cssClasses		: "Classes de feuille de style :",
		charset			: "Jeu de caractères de ressources liées :",
		styles			: "Style :",
		rel			: "Relation",
		selectAnchor	: "Sélectionnez un ancrage",
		anchorName		: "Par nom d'ancrage",
		anchorId		: "Par ID d'élément",
		emailAddress	: "Adresse électronique",
		emailSubject	: "Objet du message",
		emailBody		: "Corps du message",
		noAnchors		: "Aucun signet disponible dans le document. Cliquez sur l'icône Insérer un signet de document dans la barre d'outils pour en ajouter un.",
		noUrl			: "Entrez l'URL de lien",
		noEmail			: "Tapez l'adresse électronique"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Insérer un signet de document",
		menu		: "Editer un signet de document",
		title		: "Signet de document",
		name		: "Nom :",
		errorName	: "Entrez un nom pour le signet de document",
		remove		: "Supprimer un signet de document"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Propriétés de la liste numérotée",
		bulletedTitle		: "Propriétés de la liste à puces",
		type				: "Type",
		start				: "Début",
		validateStartNumber				:"Le numéro de départ indiqué doit être un nombre entier.",
		circle				: "Cercle",
		disc				: "Disque",
		square				: "Carré",
		none				: "Aucun",
		notset				: "<not set>",
		armenian			: "Numérotation arménienne",
		georgian			: "Numérotation géorgienne",
		lowerRoman			: "Romain minuscule (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Romain majuscule (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Alphanumérique minuscule (a, b, c, d, e, etc.)",
		upperAlpha			: "Alphanumérique majuscule (A, B, C, D, E, etc.)",
		lowerGreek			: "Grec décimal (alpha, beta, gamma, etc.)",
		decimal				: "Décimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Zéro décimal de gauche (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Rechercher et Remplacer",
		find				: "Rechercher",
		replace				: "Remplacer",
		findWhat			: "Rechercher :",
		replaceWith			: "Remplacer par :",
		notFoundMsg			: "Le texte spécifié n'a pas été trouvé.",
		noFindVal			: 'L\'entrée du texte à rechercher est requise.',
		findOptions			: "Options de recherche",
		matchCase			: "Respecter la casse",
		matchWord			: "Rechercher le mot entier",
		matchCyclic			: "Vers le haut",
		replaceAll			: "Tout remplacer",
		replaceSuccessMsg	: "%1 occurrence(s) remplacée(s)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Insérer un tableau",
		title		: "Tableau",
		menu		: "Propriétés du tableau",
		deleteTable	: "Supprimer le tableau",
		rows		: "Lignes :",
		columns		: "Colonnes :",
		border		: "Taille de bordure :",
		widthPx		: "pixels",
		widthPc		: "pour cent",
		widthUnit	: "Unité de largeur :",
		cellSpace	: "Espacement de cellule :",
		cellPad		: "Remplissage de cellule :",
		caption		: "Légende :",
		summary		: "Récapitulatif :",
		headers		: "En-têtes :",
		headersNone		: "Aucun",
		headersColumn	: "Première colonne",
		headersRow		: "Première ligne",
		headersBoth		: "Les deux",
		invalidRows		: "Le nombre de lignes doit être un nombre entier supérieur à zéro.",
		invalidCols		: "Le nombre de colonnes doit être un nombre entier supérieur à zéro.",
		invalidBorder	: "La valeur de taille de bordure doit être un nombre positif.",
		invalidWidth	: "La valeur de largeur de tableau doit être un nombre positif.",
		invalidHeight	: "La valeur de hauteur de tableau doit être un nombre positif.",
		invalidCellSpacing	: "La valeur d'espacement de cellule doit être un nombre positif.",
		invalidCellPadding	: "La valeur de remplissage de cellule doit être un nombre positif.",

		cell :
		{
			menu			: "Cellule",
			insertBefore	: "Insérer la cellule avant",
			insertAfter		: "Insérer la cellule après",
			deleteCell		: "Supprimer les cellules",
			merge			: "Fusionner les cellules",
			mergeRight		: "Fusionner vers la droite",
			mergeDown		: "Fusionner vers le bas",
			splitHorizontal	: "Diviser les cellules horizontalement",
			splitVertical	: "Diviser les cellules verticalement",
			title			: "Propriétés des cellules",
			cellType		: "Type de cellule :",
			rowSpan			: "Etendue des lignes :",
			colSpan			: "Etendue des colonnes :",
			wordWrap		: "Renvoi à la ligne :",
			hAlign			: "Alignement horizontal",
			vAlign			: "Alignement vertical",
			alignBaseline	: "Ligne de base",
			bgColor			: "Couleur d'arrière-plan",
			borderColor		: "Couleur de bordure",
			data			: "Données",
			header			: "En-tête",
			yes				: "Oui",
			no				: "Non",
			invalidWidth	: "La valeur de largeur de cellule doit être un nombre positif.",
			invalidHeight	: "La valeur de hauteur de cellule doit être un nombre positif.",
			invalidRowSpan	: "La valeur d'étendue des lignes doit être un nombre entier positif.",
			invalidColSpan	: "La valeur d'étendue des colonnes doit être un nombre entier positif.",
			chooseColor : "Choisir"
		},

		row :
		{
			menu			: "Ligne",
			insertBefore	: "Insérer une ligne avant",
			insertAfter		: "Insérer une ligne après",
			deleteRow		: "Supprimer des lignes"
		},

		column :
		{
			menu			: "Colonne",
			insertBefore	: "Insérer une colonne avant",
			insertAfter		: "Insérer une colonne après",
			deleteColumn	: "Supprimer des colonnes"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Propriétés du bouton",
		text		: "Texte (valeur) :",
		type		: "Type :",
		typeBtn		: "Bouton",
		typeSbm		: "Soumettre",
		typeRst		: "Réinitialiser"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Propriétés de la case à cocher",
		radioTitle	: "Propriétés du bouton radio",
		value		: "Valeur :",
		selected	: "Sélectionné"
	},

	// Form Dialog.
	form :
	{
		title		: "Insertion de masque",
		menu		: "Propriétés du masque",
		action		: "Action :",
		method		: "Méthode :",
		encoding	: "Codage :"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Sélection des propriétés de zone",
		selectInfo	: "Sélectionnez les informations",
		opAvail		: "Options disponibles",
		value		: "Valeur :",
		size		: "Taille :",
		lines		: "lignes",
		chkMulti	: "Autoriser des sélections multiples",
		opText		: "Texte :",
		opValue		: "Valeur :",
		btnAdd		: "Ajouter",
		btnModify	: "Modifier",
		btnUp		: "En haut",
		btnDown		: "En bas",
		btnSetValue : "Définir comme valeur sélectionnée",
		btnDelete	: "Supprimer"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Propriétés de la région de texte",
		cols		: "Colonnes :",
		rows		: "Lignes :"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Propriétés de la zone de texte",
		name		: "Nom :",
		value		: "Valeur :",
		charWidth	: "Largeur de caractère :",
		maxChars	: "Caractères maximum :",
		type		: "Type :",
		typeText	: "Texte",
		typePass	: "Mot de passe"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Propriétés de la zone masquée",
		name	: "Nom :",
		value	: "Valeur :"
	},

	// Image Dialog.
	image :
	{
		title		: "Image",
		titleButton	: "Propriétés du bouton picto",
		menu		: "Propriétés de l'image...",
		infoTab	: "Informations d'image",
		btnUpload	: "L'envoyer au serveur",
		upload	: "Télécharger",
		alt		: "Texte de remplacement",
		lockRatio	: "Verrouiller le ratio",
		resetSize	: "Réinitialiser la taille",
		border	: "Bordure :",
		hSpace	: "Espace horizontal :",
		vSpace	: "Espace vertical :",
		alertUrl	: "Entrez l'URL d'image",
		linkTab	: "Lien",
		button2Img	: "Voulez-vous transformer le bouton picto sélectionné en une image simple ?",
		img2Button	: "Voulez-vous transformer l'image sélectionnée en un bouton image ?",
		urlMissing : "L'URL source de l'image n'existe pas.",
		validateBorder : "La valeur de bordure doit être un nombre entier positif.",
		validateHSpace : "La valeur d'espace horizontal doit être un nombre entier positif.",
		validateVSpace : "La valeur d'espace vertical doit être un nombre entier positif."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Propriétés Flash",
		propertiesTab	: "Propriétés",
		title		: "Flash",
		chkPlay		: "Exécution auto.",
		chkLoop		: "Boucle",
		chkMenu		: "Activer le menu flash",
		chkFull		: "Autoriser le plein écran",
 		scale		: "Echelle :",
		scaleAll		: "Tout afficher",
		scaleNoBorder	: "Aucune bordure",
		scaleFit		: "Adaptation exacte",
		access			: "Accès de script :",
		accessAlways	: "Toujours",
		accessSameDomain	: "Même domaine",
		accessNever	: "Jamais",
		alignAbsBottom: "Abs Bottom",
		alignAbsMiddle: "Abs Middle",
		alignBaseline	: "Ligne de base",
		alignTextTop	: "Texte haut",
		quality		: "Qualité :",
		qualityBest	: "Optimale",
		qualityHigh	: "Haute",
		qualityAutoHigh	: "Haute auto.",
		qualityMedium	: "Moyenne",
		qualityAutoLow	: "Basse auto.",
		qualityLow	: "Basse",
		windowModeWindow	: "Fenêtre",
		windowModeOpaque	: "Opaque",
		windowModeTransparent	: "Transparent",
		windowMode	: "Mode Fenêtre",
		flashvars	: "Variables :",
		bgcolor	: "Couleur d'arrière-plan :",
		hSpace	: "Espace horizontal :",
		vSpace	: "Espace vertical :",
		validateSrc : "L'URL ne doit pas être vide.",
		validateHSpace : "La valeur d'espace horizontal doit être un nombre entier positif.",
		validateVSpace : "La valeur d'espace vertical doit être un nombre entier positif."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Vérification orthographique",
		title			: "Vérification orthographique",
		notAvailable	: "Le service est indisponible pour l'instant.",
		errorLoading	: "Erreur lors du chargement de l'hôte de service d'application : %s.",
		notInDic		: "Absent du dictionnaire",
		changeTo		: "Changer en",
		btnIgnore		: "Ignorer",
		btnIgnoreAll	: "Tout ignorer",
		btnReplace		: "Remplacer",
		btnReplaceAll	: "Tout remplacer",
		btnUndo			: "Annuler",
		noSuggestions	: "- Aucune suggestion -",
		progress		: "Vérification orthographique en cours...",
		noMispell		: "Vérification orthographique terminée : aucune faute d'orthographe trouvée",
		noChanges		: "Vérification orthographique terminée : aucun mot modifié",
		oneChange		: "Vérification orthographique terminée : un mot modifié",
		manyChanges		: "Vérification orthographique terminée : %1 mots modifiés",
		ieSpellDownload	: "Vérificateur orthographique non installé. Voulez-vous le télécharger maintenant ?"
	},

	smiley :
	{
		toolbar	: "Insérer des émoticônes",
		title	: "Emoticônes",
		options : "Options d'émoticône"
	},

	elementsPath :
	{
		eleLabel : "Chemin d'éléments",
		eleTitle : "%1 élément"
	},

	numberedlist : "Liste numérotée",
	bulletedlist : "Liste à puces",
	indent : "Augmenter le retrait",
	outdent : "Réduire le retrait",

	bidi :
	{
		ltr : "De gauche à droite",
		rtl : "De droite à gauche",
	},

	justify :
	{
		left : "Aligner à gauche",
		center : "Centrer",
		right : "Aligner à droite",
		block : "Justifier"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Coller",
		cutError	: "Les paramètres de sécurité de votre navigateur empêchent le coupage automatique. Utilisez la combinaison de touches Ctrl+X de votre clavier.",
		copyError	: "Les paramètres de sécurité de votre navigateur empêchent la copie automatique. Utilisez à la place la combinaison de touches Ctrl+C de votre clavier.",
		pasteMsg	: "Appuyez sur Ctrl+V (Cmd+V sous MAC) pour coller ci-dessous.",
		securityMsg	: "Les paramètres de sécurité de votre navigateur empêchent un collage direct depuis le presse-papiers.",
		pasteArea	: "Zone de collage"
	},

	pastefromword :
	{
		confirmCleanup	: "Le texte que vous voulez coller semble être copié à partir de Word. Voulez-vous le nettoyer avant d'effectuer le collage ?",
		toolbar			: "Collage spécial",
		title			: "Collage spécial",
		error			: "Une erreur interne a empêché le nettoyage des données collées"
	},

	pasteText :
	{
		button	: "Coller comme texte normal",
		title	: "Collage en tant que texte normal"
	},

	templates :
	{
		button 			: "Modèles",
		title : "Modèles de contenu",
		options : "Options de modèle",
		insertOption: "Remplacer le contenu actuel",
		selectPromptMsg: "Sélectionnez le modèle pour l'ouvrir dans l'éditeur",
		emptyListMsg : "(Aucun modèle défini)"
	},

	showBlocks : "Afficher les blocs",

	stylesCombo :
	{
		label		: "Styles",
		panelTitle 	: "Styles",
		panelTitle1	: "Styles de bloc",
		panelTitle2	: "Styles internes",
		panelTitle3	: "Styles d'objet"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format de paragraphe",

		tag_p		: "Normal",
		tag_pre		: "Formaté",
		tag_address	: "Adresse",
		tag_h1		: "Titre 1",
		tag_h2		: "Titre 2",
		tag_h3		: "Titre 3",
		tag_h4		: "Titre 4",
		tag_h5		: "Titre 5",
		tag_h6		: "Titre 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Création d'un conteneur div",
		toolbar				: "Créer un conteneur div",
		cssClassInputLabel	: "Classes de feuille de style",
		styleSelectLabel	: "Style",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Code de langue",
		inlineStyleInputLabel	: "Style interne",
		advisoryTitleInputLabel	: "Titre d'avis",
		langDirLabel		: "Orientation du texte",
		langDirLTRLabel		: "De gauche à droite",
		langDirRTLLabel		: "De droite à gauche",
		edit				: "Editer une division",
		remove				: "Supprimer une division"
  	},

	iframe :
	{
		title		: "Propriétés IFrame",
		toolbar		: "Insérer IFrame",
		noUrl		: "Entrez l'URL Iframe",
		scrolling	: "Activer les barres d'outils",
		border		: "Afficher la bordure de cadre"
	},

	font :
	{
		label		: "Police",
		voiceLabel	: "Police",
		panelTitle	: "Nom de police"
	},

	fontSize :
	{
		label		: "Taille",
		voiceLabel	: "Taille de la police",
		panelTitle	: "Taille de la police"
	},

	colorButton :
	{
		textColorTitle	: "Couleur du texte",
		bgColorTitle	: "Couleur d'arrière-plan",
		panelTitle		: "Couleurs",
		auto			: "Automatique",
		more			: "Autres couleurs..."
	},

	colors :
	{
		"000" : "Noir",
		"800000" : "Marron",
		"8B4513" : "Mordoré",
		"2F4F4F" : "Gris anthracite",
		"008080" : "Bleu sarcelle",
		"000080" : "Bleu marine",
		"4B0082" : "Indigo",
		"696969" : "Gris foncé",
		"B22222" : "Brique",
		"A52A2A" : "Brun",
		"DAA520" : "Vieil or",
		"006400" : "Vert foncé",
		"40E0D0" : "Turquoise",
		"0000CD" : "Bleu outremer",
		"800080" : "Violet",
		"808080" : "Gris",
		"F00" : "Rouge",
		"FF8C00" : "Orange foncé",
		"FFD700" : "Or",
		"008000" : "Vert",
		"0FF" : "Cyan",
		"00F" : "Bleu",
		"EE82EE" : "Lilas",
		"A9A9A9" : "Gris acier",
		"FFA07A" : "Saumon",
		"FFA500" : "Orange",
		"FFFF00" : "Jaune",
		"00FF00" : "Citron vert",
		"AFEEEE" : "Turquoise clair",
		"ADD8E6" : "Bleu clair",
		"DDA0DD" : "Rose",
		"D3D3D3" : "Gris clair",
		"FFF0F5" : "Rose pâle",
		"FAEBD7" : "Blanc cassé",
		"FFFFE0" : "Jaune clair",
		"F0FFF0" : "Miel",
		"F0FFFF" : "Azur",
		"F0F8FF" : "Bleu dragée",
		"E6E6FA" : "Lavande",
		"FFF" : "Blanc"
	},

	scayt :
	{
		title			: "Vérification orthographique pendant que vous tapez (SCAYT)",
		opera_title		: "Non pris en charge par Opera",
		enable			: "Activer SCAYT",
		disable			: "Désactiver SCAYT",
		about			: "A propos de SCAYT",
		toggle			: "Basculer vers SCAYT",
		options			: "Options",
		langs			: "Langues",
		moreSuggestions	: "Autres suggestions",
		ignore			: "Ignorer",
		ignoreAll		: "Tout ignorer",
		addWord			: "Ajouter le mot",
		emptyDic		: "Le nom du dictionnaire ne peut être vide.",

		optionsTab		: "Options",
		allCaps			: "Ignorer les mots tout en majuscule",
		ignoreDomainNames : "Ignorer les noms de domaine",
		mixedCase		: "Ignorer les mots avec une casse mixte",
		mixedWithDigits	: "Ignorer les mots avec des nombres",

		languagesTab	: "Langues",

		dictionariesTab	: "Dictionnaires",
		dic_field_name	: "Nom de dictionnaire",
		dic_create		: "Créer",
		dic_restore		: "Restaurer",
		dic_delete		: "Supprimer",
		dic_rename		: "Renommer",
		dic_info		: "Initialement, le dictionnaire utilisateur est stocké dans un cookie, mais la taille des cookies est limitée. Quand ce dictionnaire devient trop gros pour être enregistré dans un cookie, vous pouvez le stocker sur le serveur. Pour ce faire, vous devez lui donner un nom. Si vous disposez déjà d'un dictionnaire enregistré, entrez son nom puis cliquez sur le bouton Restaurer.",

		aboutTab		: "A propos"
	},

	about :
	{
		title		: "A propos de CKEditor",
		dlgTitle	: "A propos de CKEditor",
		help	: "Consultez $1 pour accéder à l'aide.",
		userGuide : "Guide de l'utilisateur CKEditor",
		moreInfo	: "Pour les informations de licence, visitez notre site Web :",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "Maximum",
	minimize : "Réduire",

	fakeobjects :
	{
		anchor	: "Ancrage",
		flash	: "Animation Flash",
		iframe		: "IFrame",
		hiddenfield	: "Zone masquée",
		unknown	: "Objet inconnu"
	},

	resize : "Glisser pour redimensionner",

	colordialog :
	{
		title		: "Sélection de la couleur",
		options	:	"Options de couleur",
		highlight	: "Mise en évidence",
		selected	: "Couleur sélectionnée",
		clear		: "Désélectionner"
	},

	toolbarCollapse	: "Condenser la barre d'outils",
	toolbarExpand	: "Développer la barre d'outils",

	toolbarGroups :
	{
		document : "Document",
		clipboard : "Presse-papiers/Annuler",
		editing : "Edition",
		forms : "Masques",
		basicstyles : "Styles de base",
		paragraph : "Paragraphe",
		links : "Liens",
		insert : "Insérer",
		styles : "Styles",
		colors : "Couleurs",
		tools : "Outils"
	},

	bidi :
	{
		ltr : "Passer en texte de la gauche vers la droite",
		rtl : "Passer en texte de la droite vers la gauche"
	},

	docprops :
	{
		label : "Propriétés du document",
		title : "Propriétés du document",
		design : "Conception",
		meta : "Balises meta",
		chooseColor : "Choisir",
		other : "Autre...",
		docTitle :	"Titre de page",
		charset : 	"Codage de jeu de caractères",
		charsetOther : "Autre codage de jeu de caractères",
		charsetASCII : "ASCII",
		charsetCE : "Europe centrale",
		charsetCT : "Chinois traditionnel (Big5)",
		charsetCR : "Cyrillique",
		charsetGR : "Grec",
		charsetJP : "Japonais",
		charsetKR : "Coréen",
		charsetTR : "Turc",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europe de l'Ouest",
		docType : "Titre de type de document",
		docTypeOther : "Autre titre de type de document",
		xhtmlDec : "Inclure les déclarations XHTML",
		bgColor : "Couleur d'arrière-plan",
		bgImage : "URL d'image d'arrière-plan",
		bgFixed : "Arrière-plan sans défilement (fixe)",
		txtColor : "Couleur du texte",
		margin : "Marges de page",
		marginTop : "Haut",
		marginLeft : "Gauche",
		marginRight : "Droite",
		marginBottom : "Bas",
		metaKeywords : "Mots clés d'indexation de document (séparés par des virgules)",
		metaDescription : "Description de document",
		metaAuthor : "Auteur",
		metaCopyright : "Copyright",
		previewHtml : "<p>Voici un <strong>texte exemple</strong>. Vous utilisez <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "pouces",
			widthCm	: "centimètres",
			widthMm	: "millimètres",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "points",
			widthPc	: "picas"
		},
		table :
		{
			heightUnit	: "Unité de hauteur :",
			insertMultipleRows : "Insérer des lignes",
			insertMultipleCols : "Insérer des colonnes",
			noOfRows : "Nombre de lignes",
			noOfCols : "Nombre de colonnes",
			insertPosition : "Position:",
			insertBefore : "Avant",
			insertAfter : "Après",
			selectTable : "Sélectionner le tableau",
			selectRow : "Sélectionner la ligne",
			columnTitle : "Colonne",
			colProps : "Propriétés de la colonne",
			invalidColumnWidth	: "La valeur de largeur de colonne doit être un nombre positif."
		},
		cell :
		{
			title : "Cellule"
		},
		emoticon :
		{
			angel		: "Ange",
			angry		: "En colère",
			cool		: "Cool",
			crying		: "Pleurs",
			eyebrow		: "Sourcil",
			frown		: "Froncement",
			goofy		: "Gaffeur",
			grin		: "Rictus",
			half		: "Moitié",
			idea		: "Idée",
			laughing	: "Rire",
			laughroll	: "Pelote rieuse",
			no			: "Non",
			oops		: "Oops",
			shy			: "Timide",
			smile		: "Sourire",
			tongue		: "Langue",
			wink		: "Clin d'oeil",
			yes			: "Oui"
		},

		menu :
		{
			link	: "Insérer un lien",
			list	: "Liste",
			paste	: "Coller",
			action	: "Action",
			align	: "Alignement",
			emoticon: "Emoticône"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Liste numérotée",
			bulletedTitle		: "Liste à puces"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Tapez un nom de signet descriptif, comme Section 1.2. Une fois le signet inséré, cliquez sur l'icône Lien ou Lien de signet de document pour effectuer le lien.",
			title		: "Lien de signet de document",
			linkTo		: "Lier à"
		},

		urllink :
		{
			title : "Lien URL",
			linkText : "Texte de lien :",
			selectAnchor: "Sélectionnez un ancrage :",
			nourl: "Entrez une URL dans la zone de texte.",
			urlhelp: "Entrez ou tapez une URL pour ouvrir quand les utilisateurs cliquent sur ce lien, comme http://www.exemple.com.",
			displaytxthelp: "Tapez le texte d'affichage du lien.",
			openinnew : "Ouvrez le lien dans une nouvelle fenêtre"
		},

		spellchecker :
		{
			title : "Vérification orthographique",
			replace : "Remplacer :",
			suggesstion : "Suggestions :",
			withLabel : "Par :",
			replaceButton : "Remplacer",
			replaceallButton:"Tout remplacer",
			skipButton:"Ignorer",
			skipallButton: "Tout ignorer",
			undochanges: "Annuler les changements",
			complete: "Vérification orthographique terminée",
			problem: "Problème lors de l'extraction des données XML",
			addDictionary: "Ajouter au dictionnaire",
			editDictionary: "Editer le dictionnaire"
		},

		status :
		{
			keystrokeForHelp: "Appuyez sur ALT 0 pour l'aide"
		},

		linkdialog :
		{
			label : "Boîte de dialogue de lien"
		},

		image :
		{
			previewText : "Le texte est placé autour de l'image que vous ajoutez comme dans cet exemple."
		}
	}

};
