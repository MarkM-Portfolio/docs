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
	ctxMenu_createSlide: 	"Create Slide",
	ctxMenu_renameSlide: 	"Rename Slide",
	ctxMenu_deleteSlide: 	"Delete Slide",
	ctxMenu_selectAll: 	 	"Select All",
	ctxMenu_createTextBox: 	"Add Text Box",
	ctxMenu_addImage:	 	"Add an Image",		
	ctxMenu_createTable: 	"Create Table",
	ctxMenu_slideTransition: "Slide Transitions",
	ctxMenu_slideTransitionTitle: "Select a Transition",
	ctxMenu_slideLayout: 	"Slide Layout",
	ctxMenu_slideTemplates: "Master Styles",
	ctxMenu_paste: 	 		"Paste",
	ctxMenu_autoFix: 		"Auto Fix",
		
	imageDialog: {	
		titleInsert:		"Insert Image",
		insertImageBtn:		"Insert",							
		URL:				"URL:",
		uploadFromURL:		"Image from Web",
		imageGallery:		"Image Gallery",
		uploadAnImageFile:	"Image from File",
		uploadImageFileTitle: "Specify image to upload from file",
		insertImageErrorP1: "The image cannot be inserted into the document.",
		insertImageErrorP2: "There is a problem on the server, such as not enough disk space.",
		insertImageErrorP3: "Ask your administrator to check the server log to identify the problem."
	},
	
	concordGallery:{
		results:		"Results: ${0}",
		show:			"Show:",
		all	:			"All",
		images:			"Images",
		pictures: 		"Pictures",
		arrows: 		"Arrows",
		bullets: 		"Bullets",
		computer: 		"Computer",
		diagram: 		"Diagram",
		education: 		"Education",
		environment: 	"Environment",
		finance: 		"Finance",
		people: 		"People",
		shape: 			"Shapes",
		symbol: 		"Symbols",
		transportation:	"Transportation",
		table:			"Tables",
		search:			"Search",
		loading:		"Loading..."
	},
	
	contentLockTitle: "Content Lock Message",
	contentLockMsg :  "Operation on some of the selected object(s) can not be performed since these objects are currently being used by following user(s):",
	contentLockemail: "email",
	
	warningforRotatedShape: "Operation on some of the selected object(s) can not be performed since these objects are rotated objects.",
	
	cannotCreateShapesTitle: "Cannot Create Shapes",
	cannotCreateShapesMessage: "${productName} does not support shape creation in Internet Explorer versions lower than 9. To create shapes, use a different browser.",
	cannotShowShapesTitle: "Cannot Show Shapes",

	slidesInUse:"Slides in Use",
	slidesInUseAll: "The operation cannot be performed on the selected slides because some of these slides are currently being used by the following users:",
	slidesInUseSome: "The operation cannot be performed on some of the selected slides because these slides are currently being used by the following users:",
	
	contentInUse:"Content in Use",
	contentInUseAll:"The operation cannot be performed on the selected slide content because some slide content is currently being used by the following users:",
	contentInUseSome:"The operation cannot be performed on some of the selected slide content because that content is currently being used by the following users:",
		
	undoContentNotAvailable: "The undo could not be performed because the content is no longer available.",
	redoContentNotAvailable: "The redo could not be performed because the content is no longer available.",
	undoContentAlreadyExist: "The undo could not be performed because the content already exists." ,
	redoContentAlreadyExist: "The redo could not be performed because the content already exists.",
	
	preventTemplateChange:"Slides in Use",
	preventTemplateChangeMsg: "The master style cannot be changed while there is another user editing the presentation.",
	
	createTblTitle: 	"Create a Table",
	createTblLabel: 	"Enter the number of rows and columns. The maximum value is 10.",
	createTblNumRows: "Number of Rows",
	createTblNumCols: "Number of Columns",
	createTblErrMsg:  "Make sure that the value is a positive integer, is not blank, and is not greater than 10.",

	insertTblRowTitle: 	"Insert Rows",
	insertTblRowNumberOfRows: 	"Number of Rows:",
	insertTblRowNumberPosition: 	"Position:",
	insertTblRowAbove: 	"Above",
	insertTblRowBelow: 	"Below",
	
	insertTblColTitle: 	"Insert Columns",
	insertTblColNumberOfCols: 	"Number of Columns:",
	insertTblColNumberPosition: 	"Position:",
	insertTblColBefore: "Before",
	insertTblColAfter: 	"After",
	
	insertVoicePosition: "Position",
	
 	defaultText_newBox2: "Double-click to add text",	
	defaultText_newBox: "Click to add text",
	defaultText_speakerNotesBox: "Click to add notes",
	
	cannotAddComment_Title: "Cannot Add Comment",
	cannotAddComment_Content: "Comments cannot be attached to this contentbox. The contentbox can only support a maximum of ${0} comments. ",
	
	invalidImageType: "This image type is currently not supported.  Transform the image to a .bmp, .jpg, .jpeg, .gif, or .png, and try again.",
	
	error_unableToDestroyTABContentsInDialog: "Unable to destroy TAB contents in dialog",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Cancel",
	preparingSlide: "Preparing the slide for editing",
	
	slideCommentClose: "Close Comment",
	slideCommentDone: "Done",
	slideCommentPrev: "Previous",
	slideCommentNext: "Next"
})
