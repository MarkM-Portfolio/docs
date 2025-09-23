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
	editorTitle : "Πρόγραμμα επεξεργασίας εμπλουτισμένου κειμένου, %1",

	// ARIA descriptions.
	toolbars	: "Γραμμές εργαλείων προγράμματος σύνταξης",
	editor	: "Πρόγραμμα σύνταξης εμπλουτισμένου κειμένου",

	// Toolbar buttons without dialogs.
	source			: "Προέλευση",
	newPage			: "Νέα σελίδα",
	save			: "Αποθήκευση",
	preview			: "Προεπισκόπηση:",
	cut				: "Αποκοπή",
	copy			: "Αντιγραφή",
	paste			: "Επικόλληση",
	print			: "Εκτύπωση",
	underline		: "Υπογράμμιση",
	bold			: "Έντονη γραφή",
	italic			: "Πλάγια γραφή",
	selectAll		: "Επιλογή όλων",
	removeFormat	: "Αφαίρεση μορφοποίησης",
	strike			: "Διαγράμμιση",
	subscript		: "Δείκτης",
	superscript		: "Εκθέτης",
	horizontalrule	: "Εισαγωγή οριζόντιας γραμμής",
	pagebreak		: "Εισαγωγή αλλαγής σελίδας",
	pagebreakAlt		: "Αλλαγή σελίδας",
	unlink			: "Αφαίρεση διασύνδεσης",
	undo			: "Αναίρεση",
	redo			: "Ακύρωση αναίρεσης",

	// Common messages and labels.
	common :
	{
		browseServer	: "Αναζήτηση εξυπηρετητή",
		url				: "Διεύθυνση URL:",
		protocol		: "Πρωτόκολλο:",
		upload			: "Μεταφόρτωση:",
		uploadSubmit	: "Αποστολή στον εξυπηρετητή",
		image			: "Εισαγωγή εικόνας",
		flash			: "Εισαγωγή ταινίας Flash",
		form			: "Εισαγωγή φόρμας",
		checkbox		: "Εισαγωγή τετραγωνιδίου επιλογής",
		radio			: "Εισαγωγή κουμπιού επιλογής",
		textField		: "Εισαγωγή πεδίου κειμένου",
		textarea		: "Εισαγωγή περιοχής κειμένου",
		hiddenField		: "Εισαγωγή κρυφού πεδίου",
		button			: "Εισαγωγή κουμπιού",
		select			: "Εισαγωγή πεδίου επιλογής",
		imageButton		: "Εισαγωγή κουμπιού εικόνας",
		notSet			: "<δεν έχει οριστεί>",
		id				: "Ταυτότητα:",
		name			: "Όνομα:",
		langDir			: "Κατεύθυνση κειμένου:",
		langDirLtr		: "Αριστερά προς δεξιά",
		langDirRtl		: "Δεξιά προς αριστερά",
		langCode		: "Κωδικός γλώσσας:",
		longDescr		: "Διεύθυνση URL εκτενούς περιγραφής:",
		cssClass		: "Κλάσεις φύλλων στυλ:",
		advisoryTitle	: "Πληροφοριακός τίτλος:",
		cssStyle		: "Στυλ:",
		ok				: "OK",
		cancel			: "Ακύρωση",
		close : "Κλείσιμο",
		preview			: "Προεπισκόπηση:",
		generalTab		: "Γενικά",
		advancedTab		: "Σύνθετες επιλογές",
		validateNumberFailed	: "Αυτή η τιμή δεν είναι αριθμός.",
		confirmNewPage	: "Οι μη αποθηκευμένες αλλαγές σε αυτό το περιεχόμενο θα χαθούν. Είστε βέβαιοι ότι θέλετε να φορτώσετε μια νέα σελίδα;",
		confirmCancel	: "Ορισμένες επιλογές έχουν αλλάξει. Είστε βέβαιοι ότι θέλετε να κλείσετε το παράθυρο;",
		options : "Επιλογές",
		target			: "Προορισμός:",
		targetNew		: "Νέο παράθυρο (_blank)",
		targetTop		: "Πρώτο παράθυρο (_top)",
		targetSelf		: "Ίδιο παράθυρο (_self)",
		targetParent	: "Γονικό παράθυρο (_parent)",
		langDirLTR		: "Αριστερά προς δεξιά",
		langDirRTL		: "Δεξιά προς αριστερά",
		styles			: "Στυλ:",
		cssClasses		: "Κλάσεις φύλλων στυλ",
		width			: "Πλάτος:",
		height			: "Ύψος:",
		align			: "Στοίχιση:",
		alignLeft		: "Αριστερά",
		alignRight		: "Δεξιά",
		alignCenter		: "Στο κέντρο",
		alignTop		: "Πάνω",
		alignMiddle		: "Στο κέντρο",
		alignBottom		: "Κάτω",
		invalidHeight	: "Η τιμή για το ύψος πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
		invalidWidth	: "Η τιμή για το πλάτος πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
		invalidCssLength	: "Η τιμή για το πεδίο '%1' πρέπει να είναι ένας θετικός αριθμός με ή χωρίς μια έγκυρη μονάδα μέτρησης CSS (px, %, in, cm, mm, em, ex, pt ή pc).",
		invalidHtmlLength	: "Η τιμή για το πεδίο '%1' πρέπει να είναι ένας θετικός αριθμός με ή χωρίς μια έγκυρη μονάδα μέτρησης HTML (px ή %).",
		invalidInlineStyle	: "Η τιμή για το εσωτερικό στυλ πρέπει να αποτελείται από ένα η περισσότερα ζεύγη (πλειάδες) της μορφής \"όνομα : τιμή\" που θα χωρίζονται με ερωτηματικό (;).",
		cssLengthTooltip	: "Καταχωρήστε έναν αριθμό εικονοστοιχείων ή έναν αριθμό με μια έγκυρη μονάδα μέτρησης CSS (px, %, in, cm, mm, em, ex, pt ή pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\"> - Μη διαθέσιμο</span>"
	},

	contextmenu :
	{
		options : "Επιλογές μενού περιβάλλοντος"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Εισαγωγή ειδικού χαρακτήρα",
		title		: "Ειδικός χαρακτήρας",
		options : "Επιλογές ειδικών χαρακτήρων"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Διασύνδεση URL",
		other 		: "<άλλο>",
		menu		: "Τροποποίηση διασύνδεσης...",
		title		: "Διασύνδεση",
		info		: "Πληροφορίες διασύνδεσης",
		target		: "Προορισμός",
		upload		: "Μεταφόρτωση:",
		advanced	: "Σύνθετες επιλογές",
		type		: "Είδος διασύνδεσης",
		toUrl		: "Διεύθυνση URL",
		toAnchor	: "Διασύνδεση με άγκυρα στο κείμενο",
		toEmail		: "Διεύθυνση e-mail",
		targetFrame	: "<πλαίσιο>",
		targetPopup	: "<αναδυόμενο παράθυρο>",
		targetFrameName	: "Όνομα πλαισίου προορισμού:",
		targetPopupName	: "Όνομα αναδυόμενου παραθύρου:",
		popupFeatures	: "Χαρακτηριστικά αναδυόμενου παραθύρου:",
		popupResizable	: "Δυνατότητα αλλαγής διαστάσεων",
		popupStatusBar	: "Γραμμή κατάστασης",
		popupLocationBar	: "Γραμμή θέσης",
		popupToolbar	: "Γραμμή εργαλείων",
		popupMenuBar	: "Γραμμή μενού",
		popupFullScreen	: "Πλήρης οθόνη (IE)",
		popupScrollBars	: "Γραμμές κύλισης",
		popupDependent	: "Εξαρτώμενο (Netscape)",
		popupLeft		: "Θέση αριστερής πλευράς",
		popupTop		: "Θέση πάνω πλευράς",
		id				: "Ταυτότητα:",
		langDir			: "Κατεύθυνση κειμένου:",
		langDirLTR		: "Αριστερά προς δεξιά",
		langDirRTL		: "Δεξιά προς αριστερά",
		acccessKey		: "Πλήκτρο πρόσβασης:",
		name			: "Όνομα:",
		langCode		: "Κωδικός γλώσσας:",
		tabIndex		: "Σειρά ενεργοποίησης με το πλήκτρο Tab:",
		advisoryTitle	: "Πληροφοριακός τίτλος:",
		advisoryContentType	: "Είδος πληροφοριακού περιεχομένου:",
		cssClasses		: "Κλάσεις φύλλων στυλ:",
		charset			: "Σύνολο χαρακτήρων διασυνδεδεμένου πόρου:",
		styles			: "Στυλ:",
		rel			: "Σχέση",
		selectAnchor	: "Επιλογή άγκυρας",
		anchorName		: "Κατά όνομα άγκυρας",
		anchorId		: "Κατά ταυτότητα στοιχείου",
		emailAddress	: "Διεύθυνση e-mail",
		emailSubject	: "Θέμα μηνύματος",
		emailBody		: "Κυρίως κείμενο μηνύματος",
		noAnchors		: "Δεν υπάρχουν σελιδοδείκτες στο έγγραφο. Πατήστε στο εικονίδιο 'Εισαγωγή σελιδοδείκτη εγγράφου' στη γραμμή εργαλείων για να προσθέσετε ένα σελιδοδείκτη.",
		noUrl			: "Καταχωρήστε τη διεύθυνση URL διασύνδεσης.",
		noEmail			: "Καταχωρήστε τη διεύθυνση e-mail."
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Εισαγωγή σελιδοδείκτη εγγράφου",
		menu		: "Τροποποίηση σελιδοδείκτη εγγράφου",
		title		: "Σελιδοδείκτης εγγράφου",
		name		: "Όνομα:",
		errorName	: "Καταχωρήστε ένα όνομα για το σελιδοδείκτη εγγράφου.",
		remove		: "Αφαίρεση σελιδοδείκτη εγγράφου"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Ιδιότητες αριθμημένης λίστας",
		bulletedTitle		: "Ιδιότητες λίστας με κουκίδες",
		type				: "Είδος",
		start				: "Έναρξη",
		validateStartNumber				:"Ο αριθμός από τον οποίο θα ξεκινά η λίστα πρέπει να είναι ένας ακέραιος αριθμός.",
		circle				: "Κύκλος",
		disc				: "Δίσκος",
		square				: "Τετράγωνο",
		none				: "Καμία",
		notset				: "<δεν έχει οριστεί>",
		armenian			: "Αρμενική αρίθμηση",
		georgian			: "Γεωργιανή αρίθμηση",
		lowerRoman			: "Πεζοί λατινικοί αριθμοί (i, ii, iii, iv, v, κ.λπ.)",
		upperRoman			: "Κεφαλαίοι λατινικοί αριθμοί (I, II, III, IV, V, κ.λπ.)",
		lowerAlpha			: "Πεζοί λατινικοί αλφαβητικοί χαρακτήρες (a, b, c, d, e, κ.λπ.)",
		upperAlpha			: "Κεφαλαίοι λατινικοί αλφαβητικοί χαρακτήρες (A, B, C, D, E, κ.λπ.)",
		lowerGreek			: "Πεζοί ελληνικοί αριθμοί (α, β, γ, δ, ε, κ.λπ.)",
		decimal				: "Αραβικοί αριθμοί (1, 2, 3, κ.λπ.)",
		decimalLeadingZero	: "Αραβικοί αριθμοί με προτασσόμενο 0 (01, 02, 03, κ.λπ.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Εύρεση και αντικατάσταση",
		find				: "Εύρεση",
		replace				: "Αντικατάσταση",
		findWhat			: "Εύρεση:",
		replaceWith			: "Αντικατάσταση με:",
		notFoundMsg			: "Το καθορισμένο κείμενο δεν βρέθηκε.",
		noFindVal			: 'Απαιτείται ο ορισμός του κειμένου που θέλετε να εντοπίσετε.',
		findOptions			: "Επιλογές εύρεσης",
		matchCase			: "Συμφωνία πεζών/κεφαλαίων",
		matchWord			: "Εύρεση ολόκληρων λέξεων",
		matchCyclic			: "Κυκλική αναζήτηση",
		replaceAll			: "Αντικατάσταση όλων",
		replaceSuccessMsg	: "Το αναζητούμενο κείμενο αντικαταστάθηκε %1 φορά(-ές)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Εισαγωγή πίνακα",
		title		: "Πίνακας",
		menu		: "Ιδιότητες πίνακα",
		deleteTable	: "Διαγραφή πίνακα",
		rows		: "Γραμμές:",
		columns		: "Στήλες:",
		border		: "Μέγεθος περιγράμματος:",
		widthPx		: "εικονοστοιχεία",
		widthPc		: "%",
		widthUnit	: "Μονάδα πλάτους:",
		cellSpace	: "Απόσταση κελιών:",
		cellPad		: "Περιθώριο κελιών:",
		caption		: "Λεζάντα:",
		summary		: "Σύνοψη:",
		headers		: "Κεφαλίδες:",
		headersNone		: "Καμία",
		headersColumn	: "Πρώτη στήλη",
		headersRow		: "Πρώτη γραμμή",
		headersBoth		: "Και τα δύο",
		invalidRows		: "Η τιμή για τον αριθμό γραμμών πρέπει να είναι ένας ακέραιος αριθμός μεγαλύτερος από 0.",
		invalidCols		: "Η τιμή για τον αριθμό στηλών πρέπει να είναι ένας ακέραιος αριθμός μεγαλύτερος από 0.",
		invalidBorder	: "Η τιμή για το μέγεθος περιγράμματος πρέπει να είναι ένας θετικός αριθμός.",
		invalidWidth	: "Η τιμή για το πλάτος πίνακα πρέπει να είναι ένας θετικός αριθμός.",
		invalidHeight	: "Η τιμή για το ύψος πίνακα πρέπει να είναι ένας θετικός αριθμός.",
		invalidCellSpacing	: "Η τιμή για την απόσταση κελιών πρέπει να είναι ένας θετικός αριθμός.",
		invalidCellPadding	: "Η τιμή για το περιθώριο κελιών πρέπει να είναι ένας θετικός αριθμός.",

		cell :
		{
			menu			: "Κελί",
			insertBefore	: "Εισαγωγή κελιού πριν",
			insertAfter		: "Εισαγωγή κελιού μετά",
			deleteCell		: "Διαγραφή κελιών",
			merge			: "Συγχώνευση κελιών",
			mergeRight		: "Συγχώνευση προς τα δεξιά",
			mergeDown		: "Συγχώνευση προς τα κάτω",
			splitHorizontal	: "Διαχωρισμός κελιού οριζόντια",
			splitVertical	: "Διαχωρισμός κελιού κατακόρυφα",
			title			: "Ιδιότητες κελιού",
			cellType		: "Είδος κελιών:",
			rowSpan			: "Εύρος γραμμών:",
			colSpan			: "Εύρος στηλών:",
			wordWrap		: "Αναδίπλωση λέξεων:",
			hAlign			: "Οριζόντια στοίχιση:",
			vAlign			: "Κατακόρυφη στοίχιση:",
			alignBaseline	: "Γραμμή βάσης",
			bgColor			: "Χρώμα φόντου:",
			borderColor		: "Χρώμα περιγράμματος:",
			data			: "Δεδομένα",
			header			: "Κεφαλίδα",
			yes				: "Ναι",
			no				: "Όχι",
			invalidWidth	: "Η τιμή για το πλάτος κελιών πρέπει να είναι ένα θετικός αριθμός.",
			invalidHeight	: "Η τιμή για το ύψος κελιών πρέπει να είναι ένα θετικός αριθμός.",
			invalidRowSpan	: "Η τιμή για το εύρος γραμμών πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
			invalidColSpan	: "Η τιμή για το εύρος στηλών πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
			chooseColor : "Επιλογή"
		},

		row :
		{
			menu			: "Γραμμή",
			insertBefore	: "Εισαγωγή γραμμής πριν",
			insertAfter		: "Εισαγωγή γραμμής μετά",
			deleteRow		: "Διαγραφή γραμμών"
		},

		column :
		{
			menu			: "Στήλη",
			insertBefore	: "Εισαγωγή στήλης πριν",
			insertAfter		: "Εισαγωγή στήλης μετά",
			deleteColumn	: "Διαγραφή στηλών"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Ιδιότητες κουμπιού",
		text		: "Κείμενο (Τιμή):",
		type		: "Τύπος:",
		typeBtn		: "Κουμπί",
		typeSbm		: "Υποβολή",
		typeRst		: "Επαναφορά"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Ιδιότητες τετραγωνιδίου επιλογής",
		radioTitle	: "Ιδιότητες κουμπιού επιλογής",
		value		: "Τιμή:",
		selected	: "Επιλογή"
	},

	// Form Dialog.
	form :
	{
		title		: "Εισαγωγή φόρμας",
		menu		: "Ιδιότητες φόρμας",
		action		: "Ενέργεια:",
		method		: "Μέθοδος:",
		encoding	: "Κωδικοποίηση:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Ιδιότητες πεδίου επιλογής",
		selectInfo	: "Πληροφορίες επιλογής",
		opAvail		: "Διαθέσιμες επιλογές",
		value		: "Τιμή:",
		size		: "Μέγεθος:",
		lines		: "γραμμές",
		chkMulti	: "Δυνατότητα πολλαπλών επιλογών",
		opText		: "Κείμενο:",
		opValue		: "Τιμή:",
		btnAdd		: "Προσθήκη",
		btnModify	: "Τροποποίηση",
		btnUp		: "Πάνω",
		btnDown		: "Κάτω",
		btnSetValue : "Ορισμός ως επιλεγμένης τιμής",
		btnDelete	: "Διαγραφή"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Ιδιότητες περιοχής κειμένου",
		cols		: "Στήλες:",
		rows		: "Γραμμές:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Ιδιότητες πεδίου κειμένου",
		name		: "Όνομα:",
		value		: "Τιμή:",
		charWidth	: "Πλάτος χαρακτήρων:",
		maxChars	: "Μέγιστος αριθμός χαρακτήρων:",
		type		: "Τύπος:",
		typeText	: "Κείμενο",
		typePass	: "Κωδικός πρόσβασης"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Ιδιότητες κρυφού πεδίου",
		name	: "Όνομα:",
		value	: "Τιμή:"
	},

	// Image Dialog.
	image :
	{
		title		: "Εικόνα",
		titleButton	: "Ιδιότητες κουμπιού εικόνας",
		menu		: "Ιδιότητες εικόνας...",
		infoTab	: "Πληροφορίες εικόνας",
		btnUpload	: "Αποστολή στον εξυπηρετητή",
		upload	: "Μεταφόρτωση στον εξυπηρετητή",
		alt		: "Εναλλακτικό κείμενο:",
		lockRatio	: "Κλείδωμα αναλογιών",
		resetSize	: "Επαναφορά μεγέθους",
		border	: "Περίγραμμα:",
		hSpace	: "Οριζόντια απόσταση:",
		vSpace	: "Κατακόρυφη απόσταση:",
		alertUrl	: "Καταχωρήστε τη διεύθυνση URL της εικόνας.",
		linkTab	: "Διασύνδεση",
		button2Img	: "Θέλετε να μετατρέψετε το επιλεγμένο κουμπί εικόνας σε απλή εικόνα;",
		img2Button	: "Θέλετε να μετατρέψετε την επιλεγμένη εικόνα σε κουμπί εικόνας;",
		urlMissing : "Δεν υπάρχει η διεύθυνση URL προέλευσης εικόνας.",
		validateBorder : "Η τιμή για το περίγραμμα πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
		validateHSpace : "Η τιμή για την οριζόντια απόσταση πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
		validateVSpace : "Η τιμή για την κατακόρυφη απόσταση πρέπει να είναι ένας θετικός ακέραιος αριθμός."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Ιδιότητες αντικειμένου Flash",
		propertiesTab	: "Ιδιότητες",
		title		: "Flash",
		chkPlay		: "Αυτόματη αναπαραγωγή",
		chkLoop		: "Βρόχος",
		chkMenu		: "Ενεργοποίηση μενού Flash",
		chkFull		: "Δυνατότητα προβολής πλήρους οθόνης",
 		scale		: "Κλίμακα:",
		scaleAll		: "Εμφάνιση όλων",
		scaleNoBorder	: "Χωρίς περίγραμμα",
		scaleFit		: "Ακριβής προσαρμογή",
		access			: "Πρόσβαση μέσω σεναρίου:",
		accessAlways	: "Πάντα",
		accessSameDomain	: "Ίδιος τομέας",
		accessNever	: "Ποτέ",
		alignAbsBottom: "Κάτω - Απόλυτη",
		alignAbsMiddle: "Μέση - Απόλυτη",
		alignBaseline	: "Γραμμή βάσης",
		alignTextTop	: "Κορυφή κειμένου",
		quality		: "Ποιότητα:",
		qualityBest	: "Βέλτιστη",
		qualityHigh	: "Υψηλή",
		qualityAutoHigh	: "Αυτόματη - Υψηλή",
		qualityMedium	: "Μέτρια",
		qualityAutoLow	: "Αυτόματη - Χαμηλή",
		qualityLow	: "Χαμηλή",
		windowModeWindow	: "Παράθυρο",
		windowModeOpaque	: "Αδιαφανές",
		windowModeTransparent	: "Διαφανές",
		windowMode	: "Κατάσταση παραθύρου:",
		flashvars	: "Μεταβλητές:",
		bgcolor	: "Χρώμα φόντου:",
		hSpace	: "Οριζόντια απόσταση:",
		vSpace	: "Κατακόρυφη απόσταση:",
		validateSrc : "Η διεύθυνση URL δεν πρέπει να είναι κενή.",
		validateHSpace : "Η τιμή για την οριζόντια απόσταση πρέπει να είναι ένας θετικός ακέραιος αριθμός.",
		validateVSpace : "Η τιμή για την κατακόρυφη απόσταση πρέπει να είναι ένας θετικός ακέραιος αριθμός."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Ορθογραφικός έλεγχος",
		title			: "Ορθογραφικός έλεγχος",
		notAvailable	: "Η υπηρεσία δεν είναι διαθέσιμη αυτή τη στιγμή.",
		errorLoading	: "Σφάλμα φόρτωσης υπολογιστή υπηρεσίας εφαρμογής: %s.",
		notInDic		: "Δεν υπάρχει στο λεξικό",
		changeTo		: "Αλλαγή σε",
		btnIgnore		: "Παράβλεψη",
		btnIgnoreAll	: "Παράβλεψη όλων",
		btnReplace		: "Αντικατάσταση",
		btnReplaceAll	: "Αντικατάσταση όλων",
		btnUndo			: "Αναίρεση",
		noSuggestions	: "- Δεν υπάρχουν προτάσεις -",
		progress		: "Ορθογραφικός έλεγχος σε εξέλιξη...",
		noMispell		: "Ο ορθογραφικός έλεγχος ολοκληρώθηκε: Δεν εντοπίστηκαν ορθογραφικά λάθη.",
		noChanges		: "Ο ορθογραφικός έλεγχος ολοκληρώθηκε: Δεν έγιναν αλλαγές.",
		oneChange		: "Ο ορθογραφικός έλεγχος ολοκληρώθηκε: Άλλαξε μία λέξη.",
		manyChanges		: "Ο ορθογραφικός έλεγχος ολοκληρώθηκε: Άλλαξαν %1 λέξεις.",
		ieSpellDownload	: "Η λειτουργία ορθογραφικού ελέγχου δεν έχει εγκατασταθεί. Θέλετε να τη μεταφορτώσετε τώρα;"
	},

	smiley :
	{
		toolbar	: "Εισαγωγή εικονιδίου συναισθήματος",
		title	: "Εικονίδια συναισθήματος",
		options : "Επιλογές εικονιδίων συναισθήματος"
	},

	elementsPath :
	{
		eleLabel : "Διαδρομή στοιχείων",
		eleTitle : "Στοιχείο %1"
	},

	numberedlist : "Αριθμημένη λίστα",
	bulletedlist : "Λίστα με κουκίδες",
	indent : "Αύξηση εσοχής",
	outdent : "Μείωση εσοχής",

	bidi :
	{
		ltr : "Αριστερά προς δεξιά",
		rtl : "Δεξιά προς αριστερά",
	},

	justify :
	{
		left : "Στοίχιση αριστερά",
		center : "Στοίχιση στο κέντρο",
		right : "Στοίχιση δεξιά",
		block : "Πλήρης στοίχιση"
	},

	blockquote : "Ενότητα παράθεσης",

	clipboard :
	{
		title		: "Επικόλληση",
		cutError	: "Οι ρυθμίσεις ασφάλειας του προγράμματος πλοήγησης δεν επιτρέπουν την αυτόματη αποκοπή. Εκτελέστε αυτή την ενέργεια χρησιμοποιώντας το συνδυασμό πλήκτρων Ctrl+X.",
		copyError	: "Οι ρυθμίσεις ασφάλειας του προγράμματος πλοήγησης δεν επιτρέπουν την αυτόματη αντιγραφή. Εκτελέστε αυτή την ενέργεια χρησιμοποιώντας το συνδυασμό πλήκτρων Ctrl+C.",
		pasteMsg	: "Πατήστε Ctrl+V (Cmd+V σε MAC) για να επικολλήσετε περιεχόμενο παρακάτω.",
		securityMsg	: "Οι ρυθμίσεις ασφάλειας του προγράμματος πλοήγησης δεν επιτρέπουν την απευθείας επικόλληση από το πρόχειρο.",
		pasteArea	: "Περιοχή επικόλλησης"
	},

	pastefromword :
	{
		confirmCleanup	: "Το κείμενο που θέλετε να επικολλήσετε έχει μάλλον αντιγραφτεί από το Word. Θέλετε να γίνει εκκαθάριση του κειμένου πριν από την επικόλληση;",
		toolbar			: "Ειδική επικόλληση",
		title			: "Ειδική επικόλληση",
		error			: "Δεν ήταν δυνατή η εκκαθάριση του κειμένου που επικολλήθηκε λόγω εσωτερικού σφάλματος."
	},

	pasteText :
	{
		button	: "Επικόλληση σε μορφή απλού κειμένου",
		title	: "Επικόλληση σε μορφή απλού κειμένου"
	},

	templates :
	{
		button 			: "Πρότυπα",
		title : "Πρότυπα περιεχομένου",
		options : "Επιλογές προτύπων",
		insertOption: "Αντικατάσταση τρέχοντος περιεχομένου",
		selectPromptMsg: "Επιλέξτε το πρότυπο που θα ανοίξετε στο πρόγραμμα σύνταξης",
		emptyListMsg : "(Δεν έχουν οριστεί πρότυπα)"
	},

	showBlocks : "Εμφάνιση ενοτήτων",

	stylesCombo :
	{
		label		: "Στυλ",
		panelTitle 	: "Στυλ",
		panelTitle1	: "Στυλ ενοτήτων",
		panelTitle2	: "Ενσωματωμένα στυλ",
		panelTitle3	: "Στυλ αντικειμένων"
	},

	format :
	{
		label		: "Μορφή",
		panelTitle	: "Μορφή παραγράφου",

		tag_p		: "Κανονική",
		tag_pre		: "Με μορφοποίηση",
		tag_address	: "Διεύθυνση",
		tag_h1		: "Επικεφαλίδα 1",
		tag_h2		: "Επικεφαλίδα 2",
		tag_h3		: "Επικεφαλίδα 3",
		tag_h4		: "Επικεφαλίδα 4",
		tag_h5		: "Επικεφαλίδα 5",
		tag_h6		: "Επικεφαλίδα 6",
		tag_div		: "Κανονική (DIV)"
	},

	div :
	{
		title				: "Δημιουργία θέσης υποδοχής DIV",
		toolbar				: "Δημιουργία θέσης υποδοχής DIV",
		cssClassInputLabel	: "Κλάσεις φύλλων στυλ",
		styleSelectLabel	: "Στυλ",
		IdInputLabel		: "Ταυτότητα",
		languageCodeInputLabel	: " Κωδικός γλώσσας",
		inlineStyleInputLabel	: "Εσωτερικό στυλ",
		advisoryTitleInputLabel	: "Πληροφοριακός τίτλος",
		langDirLabel		: "Κατεύθυνση κειμένου",
		langDirLTRLabel		: "Αριστερά προς δεξιά",
		langDirRTLLabel		: "Δεξιά προς αριστερά",
		edit				: "Τροποποίηση στοιχείου DIV",
		remove				: "Αφαίρεση στοιχείου DIV"
  	},

	iframe :
	{
		title		: "Ιδιότητες IFrame",
		toolbar		: "Εισαγωγή IFrame",
		noUrl		: "Καταχωρήστε τη διεύθυνση URL του iFrame.",
		scrolling	: "Ενεργοποίηση γραμμών κύλισης",
		border		: "Εμφάνιση περιγράμματος πλαισίου"
	},

	font :
	{
		label		: "Γραμματοσειρά",
		voiceLabel	: "Γραμματοσειρά",
		panelTitle	: "Όνομα γραμματοσειράς"
	},

	fontSize :
	{
		label		: "Μέγεθος",
		voiceLabel	: "Μέγεθος γραμματοσειράς",
		panelTitle	: "Μέγεθος γραμματοσειράς"
	},

	colorButton :
	{
		textColorTitle	: "Χρώμα κειμένου",
		bgColorTitle	: "Χρώμα φόντου",
		panelTitle		: "Χρώματα",
		auto			: "Αυτόματα",
		more			: "Περισσότερα χρώματα..."
	},

	colors :
	{
		"000" : "Μαύρο",
		"800000" : "Βυσσινί",
		"8B4513" : "Σκούρο καφέ",
		"2F4F4F" : "Σκούρο γκρι-μπλε",
		"008080" : "Πετρόλ",
		"000080" : "Ναυτικό μπλε",
		"4B0082" : "Λουλακί",
		"696969" : "Σκούρο γκρι",
		"B22222" : "Σκούρο κόκκινο",
		"A52A2A" : "Καφέ",
		"DAA520" : "Σκούρο χρυσαφί",
		"006400" : "Σκούρο πράσινο",
		"40E0D0" : "Τυρκουάζ",
		"0000CD" : "Έντονο μπλε",
		"800080" : "Μωβ",
		"808080" : "Γκρι",
		"F00" : "Κόκκινο",
		"FF8C00" : "Σκούρο πορτοκαλί",
		"FFD700" : "Χρυσαφί",
		"008000" : "Πράσινο",
		"0FF" : "Γαλάζιο",
		"00F" : "Μπλε",
		"EE82EE" : "Βιολετί",
		"A9A9A9" : "Μουντό γκρι",
		"FFA07A" : "Ανοιχτό σομόν",
		"FFA500" : "Πορτοκαλί",
		"FFFF00" : "Κίτρινο",
		"00FF00" : "Πρασινοκίτρινο",
		"AFEEEE" : "Ανοιχτό τυρκουάζ",
		"ADD8E6" : "Ανοιχτό μπλε",
		"DDA0DD" : "Δαμασκηνί",
		"D3D3D3" : "Ανοιχτό γκρι",
		"FFF0F5" : "Λιλά",
		"FAEBD7" : "Μπεζ",
		"FFFFE0" : "Ανοιχτό κίτρινο",
		"F0FFF0" : "Μελί",
		"F0FFFF" : "Μπλε του ουρανού",
		"F0F8FF" : "Γαλάζιο παλ",
		"E6E6FA" : "Λεβάντα",
		"FFF" : "Λευκό"
	},

	scayt :
	{
		title			: "Ορθογραφικός έλεγχος κατά την πληκτρολόγηση",
		opera_title		: "Δεν υποστηρίζεται από το Opera",
		enable			: "Ενεργοποίηση ορθογραφικού ελέγχου κατά την πληκτρολόγηση",
		disable			: "Απενεργοποίηση ορθογραφικού ελέγχου κατά την πληκτρολόγηση",
		about			: "Πληροφορίες για τη λειτουργία ορθογραφικού ελέγχου κατά την πληκτρολόγηση",
		toggle			: "Εναλλαγή εμφάνισης λειτουργίας ορθογραφικού ελέγχου κατά την πληκτρολόγηση",
		options			: "Επιλογές",
		langs			: "Γλώσσες",
		moreSuggestions	: "Περισσότερες προτάσεις",
		ignore			: "Παράβλεψη",
		ignoreAll		: "Παράβλεψη όλων",
		addWord			: "Προσθήκη λέξης",
		emptyDic		: "Το όνομα λεξικού δεν μπορεί να είναι κενό.",

		optionsTab		: "Επιλογές",
		allCaps			: "Παράβλεψη λέξεων με κεφαλαία γράμματα",
		ignoreDomainNames : "Παράβλεψη ονομάτων τομέων",
		mixedCase		: "Παράβλεψη λέξεων με πεζά και κεφαλαία γράμματα",
		mixedWithDigits	: "Παράβλεψη λέξεων με αριθμούς",

		languagesTab	: "Γλώσσες",

		dictionariesTab	: "Λεξικά",
		dic_field_name	: "Όνομα λεξικού",
		dic_create		: "Δημιουργία",
		dic_restore		: "Επαναφορά",
		dic_delete		: "Διαγραφή",
		dic_rename		: "Μετονομασία",
		dic_info		: "Αρχικά, το λεξικό χρήστη αποθηκεύεται σε ένα cookie. Ωστόσο, το μέγεθος των cookies είναι περιορισμένο. Όταν το μέγεθος του λεξικού χρήστη αυξηθεί τόσο ώστε να μην είναι δυνατή η αποθήκευση του λεξικού σε ένα cookie, το λεξικό μπορεί να αποθηκευτεί στους εξυπηρετητές μας. Για να αποθηκεύσετε το λεξικό σας σε έναν εξυπηρετητή μας, πρέπει να ορίσετε ένα όνομα για το λεξικό. Αν έχετε αποθηκεύσει ήδη ένα λεξικό, καταχωρήστε το όνομά του και πατήστε το κουμπί Επαναφορά.",

		aboutTab		: "Πληροφορίες"
	},

	about :
	{
		title		: "Πληροφορίες για το CKEditor",
		dlgTitle	: "Πληροφορίες για το CKEditor",
		help	: "Ανατρέξτε στην τεκμηρίωση ($1) για βοήθεια.",
		userGuide : "Οδηγός χρήσης του CKEditor",
		moreInfo	: "Για πληροφορίες σχετικά με την άδεια χρήσης, επισκεφτείτε το δικτυακό μας τόπο:",
		copy		: "Copyright &copy; $1. Με την επιφύλαξη παντός δικαιώματος."
	},

	maximize : "Μεγιστοποίηση",
	minimize : "Ελαχιστοποίηση",

	fakeobjects :
	{
		anchor	: "Άγκυρα",
		flash	: "Κινούμενη εικόνα Flash",
		iframe		: "IFrame",
		hiddenfield	: "Κρυφό πεδίο",
		unknown	: "Άγνωστο αντικείμενο"
	},

	resize : "Σύρετε το ποντίκι για να αλλάξετε το μέγεθος",

	colordialog :
	{
		title		: "Επιλογή χρώματος",
		options	:	"Επιλογές χρώματος",
		highlight	: "Επισήμανση",
		selected	: "Επιλεγμένο χρώμα",
		clear		: "Εκκαθάριση"
	},

	toolbarCollapse	: "Σύμπτυξη γραμμής εργαλείων",
	toolbarExpand	: "Ανάπτυξη γραμμής εργαλείων",

	toolbarGroups :
	{
		document : "Έγγραφο",
		clipboard : "Πρόχειρο/Αναίρεση",
		editing : "Τροποποίηση",
		forms : "Φόρμες",
		basicstyles : "Βασικά στυλ",
		paragraph : "Παράγραφος",
		links : "Διασυνδέσεις",
		insert : "Εισαγωγή",
		styles : "Στυλ",
		colors : "Χρώματα",
		tools : "Εργαλεία"
	},

	bidi :
	{
		ltr : "Αλλαγή σε κείμενο κατεύθυνσης από αριστερά προς δεξιά",
		rtl : "Αλλαγή σε κείμενο κατεύθυνσης από δεξιά προς αριστερά"
	},

	docprops :
	{
		label : "Ιδιότητες εγγράφου",
		title : "Ιδιότητες εγγράφου",
		design : "Σχεδίαση",
		meta : "Μετα-προσδιοριστικά",
		chooseColor : "Επιλογή",
		other : "Άλλο...",
		docTitle :	"Τίτλος σελίδας",
		charset : 	"Κωδικοποίηση συνόλου χαρακτήρων",
		charsetOther : "Άλλη κωδικοποίηση συνόλου χαρακτήρων",
		charsetASCII : "ASCII",
		charsetCE : "Κεντρική Ευρώπη",
		charsetCT : "Κινεζικά παραδοσιακά (Big5)",
		charsetCR : "Κυριλλικά",
		charsetGR : "Ελληνικά",
		charsetJP : "Ιαπωνικά",
		charsetKR : "Κορεατικά",
		charsetTR : "Τουρκικά",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Δυτική Ευρώπη",
		docType : "Επικεφαλίδα είδους εγγράφων",
		docTypeOther : "Επικεφαλίδα άλλου είδους εγγράφων",
		xhtmlDec : "Συμπερίληψη δηλώσεων XHTML",
		bgColor : "Χρώμα φόντου",
		bgImage : "Διεύθυνση URL εικόνας φόντου",
		bgFixed : "Μη κυλιόμενο (σταθερό) φόντο",
		txtColor : "Χρώμα κειμένου",
		margin : "Περιθώρια σελίδας",
		marginTop : "Πάνω",
		marginLeft : "Αριστερά",
		marginRight : "Δεξιά",
		marginBottom : "Κάτω",
		metaKeywords : "Λέξεις-κλειδιά ευρετηριοποίησης εγγράφου (διαχωρισμός με κόμμα)",
		metaDescription : "Περιγραφή εγγράφου",
		metaAuthor : "Συντάκτης",
		metaCopyright : "Δικαιώματα πνευματικής ιδιοκτησίας",
		previewHtml : "<p>Αυτό είναι ένα <strong>δείγμα κειμένου</strong>. Χρησιμοποιείτε το <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "ίντσες",
			widthCm	: "εκατοστά",
			widthMm	: "χιλιοστά",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "pt",
			widthPc	: "pc"
		},
		table :
		{
			heightUnit	: "Μονάδα ύψους:",
			insertMultipleRows : "Εισαγωγή γραμμών",
			insertMultipleCols : "Εισαγωγή στηλών",
			noOfRows : "Αριθμός γραμμών:",
			noOfCols : "Αριθμός στηλών:",
			insertPosition : "Θέση:",
			insertBefore : "Πριν",
			insertAfter : "Μετά",
			selectTable : "Επιλογή πίνακα",
			selectRow : "Επιλογή γραμμής",
			columnTitle : "Στήλη",
			colProps : "Ιδιότητες στήλης",
			invalidColumnWidth	: "Η τιμή για το πλάτος στήλης πρέπει να είναι ένας θετικός αριθμός."
		},
		cell :
		{
			title : "Κελί"
		},
		emoticon :
		{
			angel		: "Αγγελούδι",
			angry		: "Θυμωμένος",
			cool		: "Άνετος",
			crying		: "Κλάμα",
			eyebrow		: "Σηκωμένο φρύδι",
			frown		: "Συνοφρυωμένος",
			goofy		: "Χαζόφατσα",
			grin		: "Πλατύ χαμόγελο",
			half		: "Μισό",
			idea		: "Ιδέα",
			laughing	: "Γέλιο",
			laughroll	: "Ξεκάρδισμα",
			no			: "Όχι",
			oops		: "Δυσάρεστη έκπληξη",
			shy			: "Ντροπαλός",
			smile		: "Χαμόγελο",
			tongue		: "Κοροϊδία",
			wink		: "Κλείσιμο ματιού",
			yes			: "Ναι"
		},

		menu :
		{
			link	: "Εισαγωγή διασύνδεσης",
			list	: "Λίστα",
			paste	: "Επικόλληση",
			action	: "Ενέργεια",
			align	: "Στοίχιση",
			emoticon: "Εικονίδιο συναισθήματος"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Αριθμημένη λίστα",
			bulletedTitle		: "Λίστα με κουκίδες"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Καταχωρήστε ένα περιγραφικό όνομα για το σελιδοδείκτη (π.χ. 'Ενότητα 1.2'). Αφού προσθέσετε το σελιδοδείκτη, διασυνδέστε τον πατώντας στο εικονίδιο 'Διασύνδεση' ή 'Διασύνδεση σελιδοδείκτη εγγράφου'.",
			title		: "Διασύνδεση σελιδοδείκτη εγγράφου",
			linkTo		: "Διασύνδεση με:"
		},

		urllink :
		{
			title : "Διασύνδεση URL",
			linkText : "Κείμενο διασύνδεσης:",
			selectAnchor: "Επιλογή άγκυρας:",
			nourl: "Καταχωρήστε μια διεύθυνση URL στο πεδίο κειμένου.",
			urlhelp: "Καταχωρήστε ή επικολλήστε τη διεύθυνση URL (π.χ. http://www.example.com) που θα ανοίγει όταν οι χρήστες χρησιμοποιούν αυτή τη διασύνδεση.",
			displaytxthelp: "Καταχωρήστε το κείμενο που θα εμφανίζεται για τη διασύνδεση.",
			openinnew : "Άνοιγμα διασύνδεσης σε νέο παράθυρο"
		},

		spellchecker :
		{
			title : "Ορθογραφικός έλεγχος",
			replace : "Αντικατάσταση:",
			suggesstion : "Προτάσεις:",
			withLabel : "Με:",
			replaceButton : "Αντικατάσταση",
			replaceallButton:"Αντικατάσταση όλων",
			skipButton:"Παράβλεψη",
			skipallButton: "Παράβλεψη όλων",
			undochanges: "Αναίρεση αλλαγών",
			complete: "Ολοκλήρωση ορθογραφικού ελέγχου",
			problem: "Πρόβλημα κατά την ανάκτηση δεδομένων XML",
			addDictionary: "Προσθήκη στο λεξικό",
			editDictionary: "Επεξεργασία λεξικού"
		},

		status :
		{
			keystrokeForHelp: "Πατήστε ALT 0 για την εμφάνιση βοήθειας."
		},

		linkdialog :
		{
			label : "Παράθυρο διαλόγου διασύνδεσης"
		},

		image :
		{
			previewText : "Το κείμενο θα αναδιπλωθεί γύρω από την εικόνα που προσθέτετε, όπως φαίνεται σε αυτό το παράθυρο."
		}
	}

};
