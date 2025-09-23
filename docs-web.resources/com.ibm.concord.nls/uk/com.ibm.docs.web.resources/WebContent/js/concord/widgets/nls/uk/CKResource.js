({
	clipboard:{
		pasteTableToTableError 	: "You cannot create or paste a table within another table.",
		securityMsg	: "Because of your browser\'s security settings, the application cannot access your clipboard.  To access your clipboard, type Ctrl+V to paste the content into this field and then click OK.",
		pasteMaxMsg : "The size of the content that you want to paste is too large.",
		cutError	: 'Your browser security settings prevent automatic copying. Use Ctrl+X on your keyboard instead.',
		copyError	: 'Your browser security settings prevent automatic copying. Use Ctrl+C on your keyboard instead.',
		pasteError  : "Because of your browser\'s security settings, the application cannot access your clipboard. Use Ctrl+V on your keyboard instead.",
		cutErrorOnMac: 'Your browser security settings prevent automatic copying. Use \u2318X on your keyboard instead.',
		copyErrorOnMac: 'Your browser security settings prevent automatic copying. Use \u2318C on your keyboard instead.',
		pasteErrorOnMac: "Because of your browser\'s security settings, the application cannot access your clipboard. Use \u2318V on your keyboard instead."
	},
	coediting:{
		exitTitle:"Exit Co-Editing",
		offlineTitle:"Network Problem",
		reloadTitle : "Synchronization Problem",
		firstTab : "First Tab",
		connectMsg: "Click ${0} button to connect again, or ${1} to refresh.",
		exitMsg:"Click Exit to exit co-editing mode, or click View mode to switch to READ ONLY mode.",
		lockMsg:"The editor will be locked to prevent data lost.",
		connectLabel:"Connect",
		exitLabel:"Exit",
		reloadLabel : "Reload",
		viewLabel:"View Mode",
		viweAlert:"PLACEHOLDER for VIEW only mode",
		forbiddenInput:"You cannot enter text because the selection contains a task.",
		taskLockMsg: "${0} is working privately on this section. Your changes are overwritten when the private work is submitted back to the document."
	},
	comments :
	{
		commentLabel : "Add Comment",
		deleteComment : "Delete Comment",
		showComment : "Show Comment",
		hoverText		: "Comment"
	},
	concordhelp :
	{
		about : "Help Contents"
	},
	
	concordpresentations:
	{
		newSlide: "New Slide",
		addImage: "Insert Image",
		slideShow: "Start Slide Show",
		addTextBox: "Add Text Box",
		addPresComments: "Add Comment",
		ctxMenuSmartTable : "Add Table",
		slideTemplate : "Master Styles",
		slideLayout : "Slide Layout",
		saveAsDraft : "Save"
	},
	
	concordrestyler:
	{
		toolbarRestylePrevious: "Previous Style",
		toolbarRestyleNext: "Next Style"
	},
	
	concordsave :
	{
		concordsaveLabel : "Save the Document",
		concordpublishLabel : "Publish a Version",
		publishOkLabel: "Publish",
		checkinLabel: "Check In"
	},
	
	concordtemplates :
	{
		toolbarTemplates : "Templates",
		dlgLabelDefaultSearchbarValue : "Search",
		dlgLabelInitSearchResults : "Results: 5 templates",
		dlgLabelResults : "Results: ",
		dlgLabelTemplates : " templates",
		dlgLabelShow : "Show: ",
		dlgLabelAll : " All ",
		dlgLabelDoc : "Documents",
		dlgLabelST : "Tables",
		dlgLabelSections : "Sections",
		dlgLabelSeperator : " | ", 
		dlgLabelDone : " Done ", 
		dlgLabelCancel : " Cancel ",
		dlgInsertSectionError : "You cannot insert a section because the selection is inside a table.",
		dlgLabelDataError : "Unable to retrieve templates at this time. Please try again later.",
		dlgTitle: "Templates",
		dlgLabelLoading: "Loading...",
		RESULTS_TOTAL_TEMPLATES: "Results: ${0} templates",
		template0 :
		{
			title : "Fax",
			description : ""
		},
		template1 :
		{
			title : "Invoice",
			description : ""
		},
		template2 :
		{
			title : "Memo",
			description : ""
		},
		template3 : 
		{
			title : "Letter",
			description : ""
		},
		template4 :
		{
			title : "Resume",
			description : ""
		},
		template5 :
		{
			title : "Employee LetterHead",
			description : ""
		},
		template6 :
		{
			title : "Company LetterHead",
			description : ""
		},
		template7 : 
		{
			title : "Personal LetterHead",
			description : ""
		},
		template8 :
		{
			title : "Research Paper LetterHead",
			description : ""
		},
		template9 :
		{
			title : "References",
			description : ""
		}
	},
	deletekey :
	{
	   forbiddenCopy: "You cannot copy the conent because the selection contains task or comments",
	   forbiddenCut: "You cannot cut the content because the selection contains a task",
	   forbiddenDelete: "You cannot delete the content because the selection contains a task."
	},
	dialogmessage:
	{
		title : "Message",
		dlgTitle : "Message",
		validate : "validate",
		dialogMessage : "Dialog Message Here"
	},
	
	increasefont :
	{
		fail: "You cannot continue to increase or decrease the font size. It has reached the maximum or minimal value."
	},
	
	list :
	{
		disableMutliRangeSel : "You cannot add numbers or bullets to discontinuous lines in one operation. Try adding numbers or bullets to lines one at a time.",
		disableBullet : "You cannot add numbers or bullets to the task selector. Try selecting text without selecting the Actions button and then add numbers or bullets."
	},
	
	listPanel :
	{
		continuelabel : "Continue List",
		restartlabel : "Restart List"
	},
	liststyles :
	{
	    // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
	    titles :
	    {
	        numeric : "Numbering",
	        bullets : "Bullets",
	        multilevel : "Multi-level Lists"  // for both numeric and bullet lists
	    },
	    numeric :
	    {
	        numeric1 : "Numeric 1",
	        numeric2 : "Numeric 2",
	        numericParen : "Numeric parenthesis",
	        numericLeadingZero : "Numeric leading zero",
	        upperAlpha : "Upper-alphabetic",
	        upperAlphaParen : "Upper-alphabetic parenthesis",
	        lowerAlpha : "Lower-alphabetic",
	        lowerAlphaParen : "Lower-alphabetic parenthesis",
	        upperRoman : "Upper-roman",
	        lowerRoman : "Lower-roman",
	        japanese1 : "Japanese Numeric 1",
	        japanese2 : "Japanese Numeric 2"
	    },
	    multilevelNumeric :
	    {
	        numeric : "Numeric",
	        tieredNumbers : "Tiered Numbers",
	        alphaNumeric : "Alpha-numeric",
	        numericRoman : "Numeric-roman",
	        numericArrows : "Numeric / descending arrows",
	        alphaNumericBullet : "Alpha-numeric / bullet",
	        alphaRoman : "Alpha-roman",
	        lowerAlphaSquares : "Lower-alpha / squares",
	        upperRomanArrows : "Upper-roman / arrows"
	    },
	    bullets :
	    {
	        circle : "Circle",
	        cutOutSquare : "Cut-out square",
	        rightArrow : "Right arrow",
	        diamond : "Diamond",
	        doubleArrow : "Double arrow",
	        asterisk : "Asterisk",
	        thinArrow : "Thin arrow",
	        checkMark : "Check mark",
	        plusSign : "Plus sign",
	        // TODO - captions for image bullets
	        //      - using image titles as starting point
	        //        (see images in story 42428 in pre-2012 RTC repository)
	        imgBlueCube : "Blue cube",
	        imgBlackSquare : "Black square",
	        imgBlueAbstract : "Blue abstract",
	        imgLeaf : "Leaf",
	        imgSilver : "Silver circle",
	        imgRedArrow : "Red arrow",
	        imgBlackArrow : "Black arrow",
	        imgPurpleArrow : "Purple arrow",
	        imgGreenCheck : "Green check",
	        imgRedX : "Red X",
	        imgGreenFlag : "Green flag",
	        imgRedFlag : "Red flag",
	        imgStar : "Star"
	    },
	    multilevelBullets :
	    {
	        numeric : "Numeric",
	        tieredNumbers : "Tiered Numbers",
	        lowerAlpha : "Lower-alphabetic",
	        alphaRoman : "Alpha-roman",
	        lowerRoman : "Lower-roman",
	        upperRoman : "Upper-roman",
	        dirArrows : "Directional arrows",
	        descCircles : "Descending Circles",
	        descSquares : "Descending Squares"
	    }
	},
	
	presComments :
	{
		addPresComments : "Add Comment"
	},

	publish:
	{
		publishLabel : "Save Document in My Files",
		publishDocument: "Save Document in My Files",
		publishDocumentWaitMessage: "Please wait while document is being saved in My Files.",
		documentPublished: "Document saved in My Files"
	},
	
	smarttables :
	{
	   toolbarAddST: "Add Table",
	   toolbarDelSTRow: "Delete Row",
	   toolbarDelSTCol: "Delete Column",
	   toolbarDelST: "Delete Table",
	   toolbarChgSTStyle: "Change Table Style",
	   toolbarMoveSTRowUp: "Move Row Above",
	   toolbarMoveSTRowDown: "Move Row Below",
	   toolbarMoveSTColBefore: "Move Column Before",
	   toolbarMoveSTColAfter: "Move Column After",
	   toolbarSortSTColAsc: "Sort Ascending",
	   toolbarSortSTColDesc: "Sort Descending",
	   toolbarResizeSTCols: "Resize Columns",
	   toolbarMakeHeaderRow: "Make Header",
	   toolbarMakeNonHeaderRow: "Make Non-Header",
	   toolbarMakeHeaderCol: "Make Header",
	   toolbarMakeNonHeaderCol: "Make Non-Header",
	   toolbarToggleFacetSelection: "Generate Category in View Mode",
	   ctxMenuSmartTable: "Table",
	   ctxMenuTableProperties: "Table Properties...",
	   ctxMenuTableCellProperties: "Cell Properties...",
	   ctxMenuDeleteST: "Delete",
	   ctxMenuChgSTStyle: "Change Style",
	   ctxMenuShowCaption: "Show Caption",
	   ctxMenuHideCaption: "Hide Caption",
	   ctxMenuResizeST: "Resize",
	   ctxMenuResizeColumnsST: "Resize Columns",
	   ctxMenuSTRow: "Row",
	   ctxMenuAddSTRowAbv: "Insert Row Above",
	   ctxMenuAddSTRowBlw: "Insert Row Below",
	   ctxMenuMoveSTRowUp: "Move Row Up",
	   ctxMenuMoveSTRowDown: "Move Row Down",
	   ctxMenuDelSTRow: "Delete",
	   ctxMenuSTCol: "Column",
	   ctxMenuAddSTColBfr: "Insert Column Before",
	   ctxMenuAddSTColAft: "Insert Column After",  
	   ctxMenuMoveSTColBefore: "Move Column Left",
	   ctxMenuMoveSTColAfter: "Move Column Right",
	   ctxMenuDelSTCol: "Delete",
	   ctxMenuSortSTColAsc: "Sort Ascending",
	   ctxMenuSortSTColDesc: "Sort Descending",
	   ctxMenuShowAllFacets: "Show Categories",
	   ctxMenuHideAllFacets: "Hide Categories",
	   ctxMenuSTCell: "Cell",
	   ctxMenuMergeCells: "Merge Cells",
	   ctxMenuMergeDown: "Merge with Cell Below",
	   ctxMenuVerSplit: "Split Vertically",
	   ctxMenuHorSplit: "Split Horizontally",
	   ctxMenuAlignTextLeft: "Align Left",
	   ctxMenuAlignTextCenter: "Align Center",
	   ctxMenuAlignTextRight: "Align Right",
	   ctxMenuClearSTCellContent: "Clear Content",
	   ctxMenuMakeHeaderRow: "Use Selected Row as Header",
	   ctxMenuMakeNonHeaderRow: "Remove Heading Style",
	   ctxMenuMakeHeaderCol: "Use Selected Column as Header",
	   ctxMenuMakeNonHeaderCol: "Remove Heading Style",
	   msgCannotInsertRowBeforeHeader: "A new row cannot be inserted before the header.",
	   msgCannotInsertCoBeforeHeader: "A new column cannot be inserted before the header.",
	   msgCannotMoveHeaderRow: "The header row cannot be moved.",
	   dlgTitleSTProperties: "Table Properties",
	   dlgTitleAddST: "Add a Table",
	   dlgLabelSTName: "Table name:",
	   dlgLabelSTType: "Select header type",
	   dlgLabelSTRows: "Number of rows",
	   dlgLabelSTCols: "Number of columns",
	   dlgLabelSTTemplate: "Use Template",
	   dlgMsgValidationRowsMax:"Enter a number between 1 and 200.",
	   dlgMsgValidationColsMax:"Enter a number between 1 and 25.",
	   dlgMsgValidation:"The value must be a positive integer",
	   dlgLabelSTInstruction: "Enter the number of rows and columns. The maximum value is 200 for rows and 25 for columns."
	},	
	task :{
	   titleAssign:"Assign Section",
	   ctxMenuTask: "Assign",
	   ctxMenuCreateTask: "Assign a Section",
	   ctxMenuDeleteTask: "Delete",
	   ctxMenuClearTask: "Clear Assignments",	   
	   ctxMenuHideTask: "Hide All",
	   ctxMenuShowTask: "Show All"
	},
	tablestyles :{
	   tableStylesToolbarLabel: "Change Table Style",
	   styleTableHeading: "Style Table",
	   recommendedTableHeading: "Recommended",
	   tableStylesGalleryHeading: "Gallery",
	   customHeading: "Custom",
	   customTableHeading: "Custom Table",
	   customTableCustomizeATable: "Customize a table",
	   customTableStyleATable: "Style a table",
	   customTableAddATable: "Add a table",
	   customTableSelectTableGrid: "Select table grid",
	   customTableSelectColorScheme: "Select color scheme",
	   customTableHeader: "Header",
	   customTableBanding: "Banding",
	   customTableSummary: "Summary",
	   customTableBorders: "Borders",
	   customTableBackground: "Background",
	   tableStylePlain: "Plain",
	   tableStyleBlueStyle: "Blue style",
	   tableStyleRedTint: "Red tint",
	   tableStyleBlueHeader: "Blue header",
	   tableStyleDarkGrayHeaderFooter: "Dark gray header/footer",
	   tableStyleLightGrayRows: "Light gray rows",
	   tableStyleDarkGrayRows: "Dark gray rows",
	   tableStyleBlueTint: "Blue tint",
	   tableStyleRedHeader: "Red header",
	   tableStyleGreenHeaderFooter: "Green header/footer",
	   tableStylePlainRows: "Plain rows",
	   tableStyleGrayTint: "Gray tint",
	   tableStyleGreenTint: "Green tint",
	   tableStyleGreenHeader: "Green header",
	   tableStyleRedHeaderFooter: "Red header/footer",
	   tableStyleGreenStyle: "Green style",
	   tableStylePurpleTint: "Purple tint",
	   tableStyleBlackHeader: "Black header",
	   tableStylePurpleHeader: "Purple header",
	   tableStyleLightBlueHeaderFooter: "Light blue header/footer"
	},
	toc:{
		title : "Table of Contents",
		update: "Update",
		del: "Delete",
		toc: "Table of Contents",
		linkTip: "Ctrl click to navigate",
		pageNumber: "Page Number only",
		entireTable: "Entire Table"
	},
	link:{
		gotolink: "Go to Link",
		unlink	: "Remove Link",
		editlink: "Edit Link"
	},
	field:{
		update: "Update Field"
	},
	undo:{
		undoTip : "Undo",
		redoTip : "Redo"
	},
	wysiwygarea:{
		failedPasteActions : "Fail to paste. ${productName} cannot copy and paste images from another application.  Upload the image file to ${productName} to use the image there. ",
		filteredPasteActions : "Fail to paste. To make the image available from other website, download the image to your local computer, then upload the image file to ${productName}."
	}
})