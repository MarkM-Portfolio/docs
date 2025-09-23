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
	editorTitle : "Rich text editor, %1.",

	// ARIA descriptions.
	toolbars	: "Editor toolbars",
	editor	: "Rich Text Editor",

	// Toolbar buttons without dialogs.
	source			: "Source",
	newPage			: "New Page",
	save			: "Save",
	preview			: "Preview:",
	cut				: "Cut",
	copy			: "Copy",
	paste			: "Paste",
	print			: "Print",
	underline		: "Underline",
	bold			: "Bold",
	italic			: "Italic",
	selectAll		: "Select All",
	removeFormat	: "Remove Format",
	strike			: "Strikethrough",
	subscript		: "Subscript",
	superscript		: "Superscript",
	horizontalrule	: "Insert Horizontal Line",
	pagebreak		: "Insert Page Break",
	pagebreakAlt		: "Page Break",
	unlink			: "Remove Link",
	undo			: "Undo",
	redo			: "Redo",

	// Common messages and labels.
	common :
	{
		browseServer	: "Browser Server:",
		url				: "URL:",
		protocol		: "Protocol:",
		upload			: "Upload:",
		uploadSubmit	: "Send it to the Server",
		image			: "Insert Image",
		flash			: "Insert Flash Movie",
		form			: "Insert Form",
		checkbox		: "Insert Checkbox",
		radio			: "Insert Radio Button",
		textField		: "Insert Text Field",
		textarea		: "Insert Text Area",
		hiddenField		: "Insert Hidden Field",
		button			: "Insert Button",
		select			: "Insert Selection Field",
		imageButton		: "Insert Image Button",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Name:",
		langDir			: "Text Direction:",
		langDirLtr		: "Left to Right",
		langDirRtl		: "Right to Left",
		langCode		: "Language Code:",
		longDescr		: "Long Description URL:",
		cssClass		: "Stylesheet classes:",
		advisoryTitle	: "Advisory title:",
		cssStyle		: "Style:",
		ok				: "OK",
		cancel			: "Cancel",
		close : "Close",
		preview			: "Preview:",
		generalTab		: "General",
		advancedTab		: "Advanced",
		validateNumberFailed	: "This value is not a number.",
		confirmNewPage	: "Any unsaved changes to this content will be lost. Are you sure you want to load a new page?",
		confirmCancel	: "Some of the options have been changed. Are you sure you want to close the dialog?",
		options : "Options",
		target			: "Target:",
		targetNew		: "New Window (_blank)",
		targetTop		: "Topmost Window (_top)",
		targetSelf		: "Same Window (_self)",
		targetParent	: "Parent Window (_parent)",
		langDirLTR		: "Left to Right",
		langDirRTL		: "Right to Left",
		styles			: "Style:",
		cssClasses		: "Stylesheet Classes:",
		width			: "Width:",
		height			: "Height:",
		align			: "Align:",
		alignLeft		: "Left",
		alignRight		: "Right",
		alignCenter		: "Center",
		alignTop		: "Top",
		alignMiddle		: "Middle",
		alignBottom		: "Bottom",
		invalidHeight	: "Height must be a positive whole number.",
		invalidWidth	: "Width must be a positive whole number.",
		invalidCssLength	: "Value specified for the '%1' field must be a positive number with or without a valid CSS measurement unit (px, %, in, cm, mm, em, ex, pt, or pc).",
		invalidHtmlLength	: "Value specified for the '%1' field must be a positive number with or without a valid HTML measurement unit (px or %).",
		invalidInlineStyle	: "Value specified for the inline style must consist of one or more tuples with the format of \"name : value\", separated by semi-colons.",
		cssLengthTooltip	: "Enter a number for a value in pixels or a number with a valid CSS unit (px, %, in, cm, mm, em, ex, pt, or pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, unavailable</span>"
	},

	contextmenu :
	{
		options : "Context Menu Options"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Insert Special Character",
		title		: "Special Character",
		options : "Special Character Options"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL Link",
		other 		: "<other>",
		menu		: "Edit Link...",
		title		: "Link",
		info		: "Link Information",
		target		: "Target",
		upload		: "Upload:",
		advanced	: "Advanced",
		type		: "Link Type:",
		toUrl		: "URL",
		toAnchor	: "Link to anchor in the text",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Target Frame Name:",
		targetPopupName	: "Popup Window Name:",
		popupFeatures	: "Popup Window Features:",
		popupResizable	: "Resizable",
		popupStatusBar	: "Status Bar",
		popupLocationBar	: "Location Bar",
		popupToolbar	: "Toolbar",
		popupMenuBar	: "Menu Bar",
		popupFullScreen	: "Full Screen (IE)",
		popupScrollBars	: "Scroll Bars",
		popupDependent	: "Dependent (Netscape)",
		popupLeft		: "Left Position",
		popupTop		: "Top Position",
		id				: "Id:",
		langDir			: "Text Direction:",
		langDirLTR		: "Left to Right",
		langDirRTL		: "Right to Left",
		acccessKey		: "Access Key:",
		name			: "Name:",
		langCode		: "Language Code:",
		tabIndex		: "Tab Index:",
		advisoryTitle	: "Advisory title:",
		advisoryContentType	: "Advisory Content Type:",
		cssClasses		: "Stylesheet classes:",
		charset			: "Linked Resource Charset:",
		styles			: "Style:",
		rel			: "Relationship",
		selectAnchor	: "Select an Anchor",
		anchorName		: "By Anchor Name",
		anchorId		: "By Element Id",
		emailAddress	: "E-Mail Address",
		emailSubject	: "Message Subject",
		emailBody		: "Message Body",
		noAnchors		: "No bookmarks available in the document. Click the 'Insert Document Bookmark' icon on the toolbar to add one.",
		noUrl			: "Please type the link URL",
		noEmail			: "Please type the e-mail address"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Insert Document Bookmark",
		menu		: "Edit Document Bookmark",
		title		: "Document Bookmark",
		name		: "Name:",
		errorName	: "Please enter a name for the document bookmark",
		remove		: "Remove Document Bookmark"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Numbered List Properties",
		bulletedTitle		: "Bulleted List Properties",
		type				: "Type",
		start				: "Start",
		validateStartNumber				:"List start number must be a whole number.",
		circle				: "Circle",
		disc				: "Disc",
		square				: "Square",
		none				: "None",
		notset				: "<not set>",
		armenian			: "Armenian numbering",
		georgian			: "Georgian numbering (an, ban, gan, etc.)",
		lowerRoman			: "Lower Roman (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Upper Roman (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Lower Alpha (a, b, c, d, e, etc.)",
		upperAlpha			: "Upper Alpha (A, B, C, D, E, etc.)",
		lowerGreek			: "Lower Greek (alpha, beta, gamma, etc.)",
		decimal				: "Decimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimal leading zero (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Find and Replace",
		find				: "Find",
		replace				: "Replace",
		findWhat			: "Find:",
		replaceWith			: "Replace with:",
		notFoundMsg			: "The specified text was not found.",
		noFindVal			: 'Text to find is required.',
		findOptions			: "Find Options",
		matchCase			: "Match case",
		matchWord			: "Match whole word",
		matchCyclic			: "Match cyclic",
		replaceAll			: "Replace All",
		replaceSuccessMsg	: "%1 occurrence(s) replaced."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Insert Table",
		title		: "Table",
		menu		: "Table Properties",
		deleteTable	: "Delete Table",
		rows		: "Rows:",
		columns		: "Columns:",
		border		: "Border size:",
		widthPx		: "pixels",
		widthPc		: "percent",
		widthUnit	: "Width unit:",
		cellSpace	: "Cell spacing:",
		cellPad		: "Cell padding:",
		caption		: "Caption:",
		summary		: "Summary:",
		headers		: "Headers:",
		headersNone		: "None",
		headersColumn	: "First column",
		headersRow		: "First Row",
		headersBoth		: "Both",
		invalidRows		: "The Number of rows must be a whole number greater than zero.",
		invalidCols		: "The Number of columns must be a whole number greater than zero.",
		invalidBorder	: "Border size must be a positive number.",
		invalidWidth	: "Table width must be a positive number.",
		invalidHeight	: "Table height must be a positive number.",
		invalidCellSpacing	: "Cell spacing must be a positive number.",
		invalidCellPadding	: "Cell padding must be a positive number.",

		cell :
		{
			menu			: "Cell",
			insertBefore	: "Insert Cell Before",
			insertAfter		: "Insert Cell After",
			deleteCell		: "Delete Cells",
			merge			: "Merge Cells",
			mergeRight		: "Merge Right",
			mergeDown		: "Merge Down",
			splitHorizontal	: "Split Cell Horizontally",
			splitVertical	: "Split Cell Vertically",
			title			: "Cell Properties",
			cellType		: "Cell type:",
			rowSpan			: "Rows span:",
			colSpan			: "Columns span:",
			wordWrap		: "Word wrap:",
			hAlign			: "Horizontal alignment:",
			vAlign			: "Vertical alignment:",
			alignBaseline	: "Baseline",
			bgColor			: "Background color:",
			borderColor		: "Border color:",
			data			: "Data",
			header			: "Header",
			yes				: "Yes",
			no				: "No",
			invalidWidth	: "Cell width must be a positive number.",
			invalidHeight	: "Cell height must be a positive number.",
			invalidRowSpan	: "Rows span must be a positive whole number.",
			invalidColSpan	: "Columns span must be a positive whole number.",
			chooseColor : "Choose"
		},

		row :
		{
			menu			: "Row",
			insertBefore	: "Insert Row Before",
			insertAfter		: "Insert Row After",
			deleteRow		: "Delete Rows"
		},

		column :
		{
			menu			: "Column",
			insertBefore	: "Insert Column Before",
			insertAfter		: "Insert Column After",
			deleteColumn	: "Delete Columns"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Button Properties",
		text		: "Text (Value):",
		type		: "Type:",
		typeBtn		: "Button",
		typeSbm		: "Submit",
		typeRst		: "Reset"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Checkbox Properties",
		radioTitle	: "Radio Button Properties",
		value		: "Value:",
		selected	: "Selected"
	},

	// Form Dialog.
	form :
	{
		title		: "Insert Form",
		menu		: "Form Properties",
		action		: "Action:",
		method		: "Method:",
		encoding	: "Encoding:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Select Field Properties",
		selectInfo	: "Select Info",
		opAvail		: "Available Options",
		value		: "Value:",
		size		: "Size:",
		lines		: "lines",
		chkMulti	: "Allow multiple selections",
		opText		: "Text:",
		opValue		: "Value:",
		btnAdd		: "Add",
		btnModify	: "Modify",
		btnUp		: "Up",
		btnDown		: "Down",
		btnSetValue : "Set as selected value",
		btnDelete	: "Delete"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Textarea Properties",
		cols		: "Columns:",
		rows		: "Rows:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Text Field Properties",
		name		: "Name:",
		value		: "Value:",
		charWidth	: "Character Width:",
		maxChars	: "Maximum Characters:",
		type		: "Type:",
		typeText	: "Text",
		typePass	: "Password"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Hidden Field Properties",
		name	: "Name:",
		value	: "Value:"
	},

	// Image Dialog.
	image :
	{
		title		: "Image",
		titleButton	: "Image Button Properties",
		menu		: "Image Properties...",
		infoTab	: "Image Information",
		btnUpload	: "Send it to the server",
		upload	: "Upload",
		alt		: "Alternative text:",
		lockRatio	: "Lock Ratio",
		resetSize	: "Reset Size",
		border	: "Border:",
		hSpace	: "Horizontal space:",
		vSpace	: "Vertical space:",
		alertUrl	: "Please type the image URL",
		linkTab	: "Link",
		button2Img	: "Do you want to transform the selected image button into a simple image?",
		img2Button	: "Do you want to transform the selected image into an image button?",
		urlMissing : "Image source URL is missing.",
		validateBorder : "Border must be a positive whole number.",
		validateHSpace : "Horizontal space must be a positive whole number.",
		validateVSpace : "Vertical space must be a positive whole number."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash Properties",
		propertiesTab	: "Properties",
		title		: "Flash",
		chkPlay		: "Auto play",
		chkLoop		: "Loop",
		chkMenu		: "Enable flash menu",
		chkFull		: "Allow fullscreen",
 		scale		: "Scale:",
		scaleAll		: "Show all",
		scaleNoBorder	: "No Border",
		scaleFit		: "Exact Fit",
		access			: "Script access:",
		accessAlways	: "Always",
		accessSameDomain	: "Same domain",
		accessNever	: "Never",
		alignAbsBottom: "Abs Bottom",
		alignAbsMiddle: "Abs Middle",
		alignBaseline	: "Baseline",
		alignTextTop	: "Text Top",
		quality		: "Quality:",
		qualityBest	: "Best",
		qualityHigh	: "High",
		qualityAutoHigh	: "Auto High",
		qualityMedium	: "Medium",
		qualityAutoLow	: "Auto Low",
		qualityLow	: "Low",
		windowModeWindow	: "Window",
		windowModeOpaque	: "Opaque",
		windowModeTransparent	: "Transparent",
		windowMode	: "Window mode:",
		flashvars	: "Variables:",
		bgcolor	: "Background color:",
		hSpace	: "Horizontal space:",
		vSpace	: "Vertical space:",
		validateSrc : "URL must not be empty.",
		validateHSpace : "Horizontal space must be a positive whole number.",
		validateVSpace : "Vertical space must be a positive whole number."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Spellcheck",
		title			: "Spell Check",
		notAvailable	: "Sorry, but service is unavailable now.",
		errorLoading	: "Error loading application service host: %s.",
		notInDic		: "Not in dictionary",
		changeTo		: "Change to",
		btnIgnore		: "Ignore",
		btnIgnoreAll	: "Ignore All",
		btnReplace		: "Replace",
		btnReplaceAll	: "Replace All",
		btnUndo			: "Undo",
		noSuggestions	: "- No suggestions -",
		progress		: "Spell check in progress...",
		noMispell		: "Spell check complete: No misspellings found",
		noChanges		: "Spell check complete: No words changed",
		oneChange		: "Spell check complete: One word changed",
		manyChanges		: "Spell check complete: %1 words changed",
		ieSpellDownload	: "Spell checker not installed. Do you want to download it now?"
	},

	smiley :
	{
		toolbar	: "Insert Emoticon",
		title	: "Emoticons",
		options : "Emoticon Options"
	},

	elementsPath :
	{
		eleLabel : "Elements path",
		eleTitle : "%1 element"
	},

	numberedlist : "Numbered List",
	bulletedlist : "Bulleted List",
	indent : "Increase Indent",
	outdent : "Decrease Indent",

	bidi :
	{
		ltr : "Left to Right",
		rtl : "Right to Left",
	},

	justify :
	{
		left : "Align Left",
		center : "Align Center",
		right : "Align Right",
		block : "Align Justified"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Paste",
		cutError	: "Your browser security settings prevent automatic cutting. Use Ctrl+X on your keyboard instead.",
		copyError	: "Your browser security settings prevent automatic copying. Use Ctrl+C on your keyboard instead.",
		pasteMsg	: "Press Ctrl+V (Cmd+V on MAC) to paste below.",
		securityMsg	: "Your browser security blocks pasting directly from the clipboard.",
		pasteArea	: "Paste Area"
	},

	pastefromword :
	{
		confirmCleanup	: "The text you want to paste seems to be copied from Word. Do you want to clean it before pasting?",
		toolbar			: "Paste Special",
		title			: "Paste Special",
		error			: "It was not possible to clean up the pasted data due to an internal error"
	},

	pasteText :
	{
		button	: "Paste as plain text",
		title	: "Paste as Plain Text"
	},

	templates :
	{
		button 			: "Templates",
		title : "Content Templates",
		options : "Template Options",
		insertOption: "Replace actual contents",
		selectPromptMsg: "Select the template to open in the editor",
		emptyListMsg : "(No templates defined)"
	},

	showBlocks : "Show Blocks",

	stylesCombo :
	{
		label		: "Styles",
		panelTitle 	: "Styles",
		panelTitle1	: "Block Styles",
		panelTitle2	: "Inline Styles",
		panelTitle3	: "Object Styles"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Paragraph Format",

		tag_p		: "Normal",
		tag_pre		: "Formatted",
		tag_address	: "Address",
		tag_h1		: "Heading 1",
		tag_h2		: "Heading 2",
		tag_h3		: "Heading 3",
		tag_h4		: "Heading 4",
		tag_h5		: "Heading 5",
		tag_h6		: "Heading 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Create Div Container",
		toolbar				: "Create Div Container",
		cssClassInputLabel	: "Stylesheet classes",
		styleSelectLabel	: "Style",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Language Code",
		inlineStyleInputLabel	: "Inline Style",
		advisoryTitleInputLabel	: "Advisory title",
		langDirLabel		: "Text Direction",
		langDirLTRLabel		: "Left to Right",
		langDirRTLLabel		: "Right to Left",
		edit				: "Edit Div",
		remove				: "Remove Div"
  	},

	iframe :
	{
		title		: "IFrame Properties",
		toolbar		: "Insert IFrame",
		noUrl		: "Please type the iframe URL",
		scrolling	: "Enable scrollbars",
		border		: "Show frame border"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Font Name"
	},

	fontSize :
	{
		label		: "Size",
		voiceLabel	: "Font Size",
		panelTitle	: "Font Size"
	},

	colorButton :
	{
		textColorTitle	: "Text Color",
		bgColorTitle	: "Background Color",
		panelTitle		: "Colors",
		auto			: "Automatic",
		more			: "More Colors..."
	},

	colors :
	{
		"000" : "Black",
		"800000" : "Maroon",
		"8B4513" : "Saddle Brown",
		"2F4F4F" : "Dark Slate Gray",
		"008080" : "Teal",
		"000080" : "Navy",
		"4B0082" : "Indigo",
		"696969" : "Dark Gray",
		"B22222" : "Fire Brick",
		"A52A2A" : "Brown",
		"DAA520" : "Golden Rod",
		"006400" : "Dark Green",
		"40E0D0" : "Turquoise",
		"0000CD" : "Medium Blue",
		"800080" : "Purple",
		"808080" : "Gray",
		"F00" : "Red",
		"FF8C00" : "Dark Orange",
		"FFD700" : "Gold",
		"008000" : "Green",
		"0FF" : "Cyan",
		"00F" : "Blue",
		"EE82EE" : "Violet",
		"A9A9A9" : "Dim Gray",
		"FFA07A" : "Light Salmon",
		"FFA500" : "Orange",
		"FFFF00" : "Yellow",
		"00FF00" : "Lime",
		"AFEEEE" : "Pale Turquoise",
		"ADD8E6" : "Light Blue",
		"DDA0DD" : "Plum",
		"D3D3D3" : "Light Grey",
		"FFF0F5" : "Lavender Blush",
		"FAEBD7" : "Antique White",
		"FFFFE0" : "Light Yellow",
		"F0FFF0" : "Honeydew",
		"F0FFFF" : "Azure",
		"F0F8FF" : "Alice Blue",
		"E6E6FA" : "Lavender",
		"FFF" : "White"
	},

	scayt :
	{
		title			: "Spell Check As You Type",
		opera_title		: "Not supported by Opera",
		enable			: "Enable SCAYT",
		disable			: "Disable SCAYT",
		about			: "About SCAYT",
		toggle			: "Toggle SCAYT",
		options			: "Options",
		langs			: "Languages",
		moreSuggestions	: "More suggestions",
		ignore			: "Ignore",
		ignoreAll		: "Ignore All",
		addWord			: "Add Word",
		emptyDic		: "Dictionary name should not be empty.",

		optionsTab		: "Options",
		allCaps			: "Ignore All-Caps Words",
		ignoreDomainNames : "Ignore Domain Names",
		mixedCase		: "Ignore Words with Mixed Case",
		mixedWithDigits	: "Ignore Words with Numbers",

		languagesTab	: "Languages",

		dictionariesTab	: "Dictionaries",
		dic_field_name	: "Dictionary name",
		dic_create		: "Create",
		dic_restore		: "Restore",
		dic_delete		: "Delete",
		dic_rename		: "Rename",
		dic_info		: "Initially the User Dictionary is stored in a Cookie. However, Cookies are limited in size. When the User Dictionary grows to a point where it cannot be stored in a Cookie, then the dictionary may be stored on our server. To store your personal dictionary on our server you should specify a name for your dictionary. If you already have a stored dictionary, please type it's name and click the Restore button.",

		aboutTab		: "About"
	},

	about :
	{
		title		: "About CKEditor",
		dlgTitle	: "About CKEditor",
		help	: "Check $1 for help.",
		userGuide : "CKEditor User's Guide",
		moreInfo	: "For licensing information please visit our web site:",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "Maximize",
	minimize : "Minimize",

	fakeobjects :
	{
		anchor	: "Anchor",
		flash	: "Flash Animation",
		iframe		: "IFrame",
		hiddenfield	: "Hidden Field",
		unknown	: "Unknown Object"
	},

	resize : "Drag to resize",

	colordialog :
	{
		title		: "Select Color",
		options	:	"Color Options",
		highlight	: "Highlight",
		selected	: "Selected Color",
		clear		: "Clear"
	},

	toolbarCollapse	: "Collapse Toolbar",
	toolbarExpand	: "Expand Toolbar",

	toolbarGroups :
	{
		document : "Document",
		clipboard : "Clipboard/Undo",
		editing : "Editing",
		forms : "Forms",
		basicstyles : "Basic Styles",
		paragraph : "Paragraph",
		links : "Links",
		insert : "Insert",
		styles : "Styles",
		colors : "Colors",
		tools : "Tools"
	},

	bidi :
	{
		ltr : "Change to Left-to-Right Text",
		rtl : "Change to Right-to-Left Text"
	},

	docprops :
	{
		label : "Document Properties",
		title : "Document Properties",
		design : "Design",
		meta : "Meta Tags",
		chooseColor : "Choose",
		other : "Other...",
		docTitle :	"Page Title",
		charset : 	"Character Set Encoding",
		charsetOther : "Other Character Set Encoding",
		charsetASCII : "ASCII",
		charsetCE : "Central European",
		charsetCT : "Chinese Traditional (Big5)",
		charsetCR : "Cyrillic",
		charsetGR : "Greek",
		charsetJP : "Japanese",
		charsetKR : "Korean",
		charsetTR : "Turkish",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Western European",
		docType : "Document Type Heading",
		docTypeOther : "Other Document Type Heading",
		xhtmlDec : "Include XHTML Declarations",
		bgColor : "Background Color",
		bgImage : "Background Image URL",
		bgFixed : "Non-scrolling (Fixed) Background",
		txtColor : "Text Color",
		margin : "Page Margins",
		marginTop : "Top",
		marginLeft : "Left",
		marginRight : "Right",
		marginBottom : "Bottom",
		metaKeywords : "Document Indexing Keywords (comma separated)",
		metaDescription : "Document Description",
		metaAuthor : "Author",
		metaCopyright : "Copyright",
		previewHtml : "<p>This is some <strong>sample text</strong>. You are using <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inches",
			widthCm	: "centimeters",
			widthMm	: "millimeters",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "points",
			widthPc	: "picas"
		},
		table :
		{
			heightUnit	: "Height unit:",
			insertMultipleRows : "Insert Rows",
			insertMultipleCols : "Insert Columns",
			noOfRows : "Number of Rows:",
			noOfCols : "Number of Columns:",
			insertPosition : "Position:",
			insertBefore : "Before",
			insertAfter : "After",
			selectTable : "Select Table",
			selectRow : "Select Row",
			columnTitle : "Column",
			colProps : "Column Properties",
			invalidColumnWidth	: "Column width must be a positive number."
		},
		cell :
		{
			title : "Cell"
		},
		emoticon :
		{
			angel		: "Angel",
			angry		: "Angry",
			cool		: "Cool",
			crying		: "Crying",
			eyebrow		: "Eyebrow",
			frown		: "Frown",
			goofy		: "Goofy",
			grin		: "Grin",
			half		: "Half",
			idea		: "Idea",
			laughing	: "Laughing",
			laughroll	: "Laughing roll",
			no			: "No",
			oops		: "Oops",
			shy			: "Shy",
			smile		: "Smile",
			tongue		: "Tongue",
			wink		: "Wink",
			yes			: "Yes"
		},

		menu :
		{
			link	: "Insert Link",
			list	: "List",
			paste	: "Paste",
			action	: "Action",
			align	: "Align",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Numbered List",
			bulletedTitle		: "Bulleted List"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Type a descriptive bookmark name, such as 'Section 1.2'. After inserting the bookmark, click either the 'Link' or 'Document Bookmark Link' icon to link to it.",
			title		: "Document Bookmark Link",
			linkTo		: "Link to:"
		},

		urllink :
		{
			title : "URL Link",
			linkText : "Link Text:",
			selectAnchor: "Select an Anchor:",
			nourl: "Please enter a URL into the text field.",
			urlhelp: "Type or paste a URL to open when users click this link, for example http://www.example.com.",
			displaytxthelp: "Type text display for the link.",
			openinnew : "Open link in new window"
		},

		spellchecker :
		{
			title : "Check Spelling",
			replace : "Replace:",
			suggesstion : "Suggestions:",
			withLabel : "With:",
			replaceButton : "Replace",
			replaceallButton:"Replace All",
			skipButton:"Skip",
			skipallButton: "Skip All",
			undochanges: "Undo Changes",
			complete: "Spell Check Complete",
			problem: "Problem retrieving XML data",
			addDictionary: "Add to Dictionary",
			editDictionary: "Edit Dictionary"
		},

		status :
		{
			keystrokeForHelp: "Press ALT 0 for help"
		},

		linkdialog :
		{
			label : "Link Dialog"
		},

		image :
		{
			previewText : "Text will flow around the image you are adding like in this example."
		}
	}

};
