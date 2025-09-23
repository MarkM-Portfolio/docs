({
	//actionNew dojo menu
	newName : "New",
	newTooltip : "Create a document",
	WARN_INTERNAL : "Once a file is created, it is not possible to change permission to share with others outside of your organization.",
	newCommunityInfo : "Community members are able to edit this file.",
  	CANCEL : "Cancel",
  	DOWNLOAD_EMPTY_TITLE : "Cannot Download the File",
  	DOWNLOAD_EMPTY_OK : "Close",
  	DOWNLOAD_EMPTY_CONTENT1 : "There is no published version of this file to download.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Versions can be published from the Docs editor.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Cannot Download the File",
  	DOWNLOAD_EMPTYVIEW_OK : "Close",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "There is no published version of this file to download.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Ask the file owner to publish a version of this file.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Download a Version",
  	DOWNLOAD_NEWDRAFT_OK : "Download Version",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "last edited on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "last edited on ${date}",	
		TODAY: "last edited today at ${time}",	
		YEAR: "last edited on ${date_long}",	
		YESTERDAY:	"last edited yesterday at ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "A newer draft, last edited on ${date}, has been detected.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "A newer draft, last edited on ${date}, has been detected.",	
		TODAY: "A newer draft, last edited today at ${time}, has been detected.",	
		YEAR: "A newer draft, last edited on ${date_long}, has been detected.",	
		YESTERDAY:	"A newer draft, last edited yesterday at ${time}, has been detected."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Are you sure you want to continue to download the version that was published on ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Are you sure you want to continue to download the version that was published on ${date}?",	
		TODAY: "Are you sure you want to continue to download the version that was published today at ${time}?",	
		YEAR: "Are you sure you want to continue to download the version that was published on ${date_long}?",	
		YESTERDAY:	"Are you sure you want to continue to download the version that was published yesterday at ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "This is the latest downloadable version of a Docs file. To learn if a later version exists in draft format, contact the file owner.",

  	VIEW_FILE_DETAILS_LINK : "View File Details",
  	OPEN_THIS_FILE_TIP: "Open this file",
  
	//newDocument 
	newDocumentName : "Document",
	newDocumentTooltip : "New document",
	newDocumentDialogTitle : "New Document",
	newDocumentDialogContent : "Provide a name for this untitled document.",
	newDocumentDialogBtnOK : "Create",
	newDocumentDialogBtnOKTitle : "Create a document",
	newDocumentDialogInitialName : "Untitled Document",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Cancel",
	newDocumentDialogNamepre : "*Name:",
	newDocumentDialogDocumentTypePre : "Type:",
	newDocumentDialogDocumentChangeTypeLink : "Change default file extension",
	newDocumentDialogDupErrMsg : "A duplicate file name was found. Enter a new name.",
	newDocumentDialogIllegalErrMsg : "${0} is an illegal document title, please specify another one.",
	newDocumentDialogNoNameErrMsg : "Document name is required.",
	newDocumentDialogNoPermissionErrMsg : "The file cannot be created because you do not have editor access. Contact the administrator.",
	newDocumentDialogServerErrMsg : "The Docs server is not available. Contact the server administrator and try again later.",
	newDocumentDialogServerErrMsg2 : "The Connections server is not available. Contact the server administrator and try again later.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Shorten the document name?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "The document name is too long.",
	newDialogProblemidErrMsg : "Report this problem to your administrator. ",
	newDialogProblemidErrMsg_tip : "Report this problem to your administrator. ${shown_action}",
	newDialogProblemidErrMsgShow: "Click to show details",
	newDialogProblemidErrMsgHide: "Click to hide",
	newDocumentDialogTargetPre: "*Save to:",
	newDocumentDialogTargetCommunity: "This Community",
	newDocumentDialogTargetMyFiles: "My Files",

	//newSpreadsheet 
	newSheetName : "Spreadsheet",
	newSheetTooltip : "New spreadsheet",
	newSheetDialogTitle : "New Spreadsheet",
	newSheetDialogBtnOKTitle : "Create a spreadsheet",
	newSheetDialogInitialName : "Untitled Spreadsheet",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Presentation",
	newPresTooltip : "New presentation",
	newPresDialogTitle : "New Presentation",
	newPresDialogBtnOKTitle : "Create a presentation",
	newPresDialogInitialName : "Untitled Presentation",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Create File",
	newFromDialogName : "New from File",
	newFromTooltip: "Create a new file using this file as a template",
	newFromDocTip : "Create a document (DOC,DOCX or ODT file) from a template file. You can edit these documents online in Docs.",
	newFromSheetTip : "Create a spreadsheet (XLS,XLSX or ODS file) from a template file. You can edit these spreadsheets online in Docs.",
	newFromPresTip : "Create a presentation (PPT,PPTX or ODP file) from a template file. You can edit these presentations online in Docs.",

	//actionEdit
	editName : "Edit in Docs",
	editTooltip : "Edit in Docs",
	editWithDocsDialogTitle : "Start editing online with Docs?",
	editWithDocsDialogContent1 : "Docs lets you collaborate on Files with other people at the same time, and see changes immediately. You can work online privately as well.",
	editWithDocsDialogContent2 : "You do not need to upload new versions of a document. If all editing is done online, both your work and comments are protected. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Edit Online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "View",
	viewTooltip : "Preview the file in a browser",

	//doc too large
	docTooLargeTitle : "The document is too large.",
	docTooLargeDescription : "The document that you want to edit is too large. <br />Make sure that the size of file in *.odt, *.doc, <br />or *.docx format is no greater than 2048 K.",
	docTooLargeCancelBtn: "Cancel",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Current editing: ",
		
	//Sheet title
	sheetTitle0: "Sheet1",
	sheetTitle1: "Sheet2",
	sheetTitle2: "Sheet3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Download as Microsoft Office Format",
	downloadAsPDF: "Download as PDF File",
	downloadWithUnsavedDraftTitle: "Outstanding Draft",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "This version may not contain the latest online edits. Click save to create a new version and download. Click cancel to proceed without saving.",
	downloadWithUnsavedDraftReadersDescription: "This version may not contain the latest edits. The version of the document downloaded will be the last saved version by an editor of the document. Do you want to continue?",

	//draft tab

	draft_tab_title : "Draft",
	draft_created : "${0} based on Version ${1}",
	draft_published : "The latest edits in the draft have been published.",
	draft_beiing_edited : "This file is currently being edited on the web by ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Only files that are Docs documents can be edited.",
	draft_unpublished_tip : "There are edits to this draft that have not been published as a version. ${publish_action}",
	draft_save_action_label : "Publish a version",
	draft_not_found : "There are no draft edits for this file.",
	draft_latest_edit : "Latest edit:",
	draft_cur_editing : "Current editing:",
	draft_edit_link : "Edit",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "This is a Docs file. All edits must be made online.",
	nonentitlement_docs_indicator_text: "This file is available for online editing only if you have purchased Docs entitlement.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} published on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} published on ${date}",	
		TODAY: "${user} published today at ${time}",	
		YEAR: "${user} published on ${date_long}",	
		YESTERDAY:	"${user} published yesterday at ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Published on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Published on ${date}",	
		TODAY: "Published today at ${time}",	
		YEAR: "Published on ${date_long}",	
		YESTERDAY:	"Published yesterday at ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} published version on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} published version on ${date}",	
		TODAY: "${user} published version today at ${time}",	
		YEAR: "${user} published version on ${date_long}",	
		YESTERDAY:	"${user} published version yesterday at ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Version published on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Version published on ${date}",	
		TODAY: "Version published today at ${time}",	
		YEAR: "Version published on ${date_long}",	
		YESTERDAY:	"Version published yesterday at ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} created on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} created on ${date}",	
		TODAY: "${user} created today at ${time}",	
		YEAR: "${user} created on ${date_long}",	
		YESTERDAY:	"${user} created yesterday at ${time}"
	},
	LABEL_CREATED: {
		DAY: "Created on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Created on ${date}",	
		TODAY: "Created today at ${time}",	
		YEAR: "Created on ${date_long}",	
		YESTERDAY:	"Created yesterday at ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} edited draft on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} edited draft on ${date}",	
		TODAY: "${user} edited draft today at ${time}",	
		YEAR: "${user} edited draft on ${date_long}",	
		YESTERDAY:	"${user} edited draft yesterday at ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Draft edited on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Draft edited on ${date}",	
		TODAY: "Draft edited today at ${time}",	
		YEAR: "Draft edited on ${date_long}",	
		YESTERDAY:	"Draft edited yesterday at ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} created draft on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} created draft on ${date}",	
		TODAY: "${user} created draft today at ${time}",	
		YEAR: "${user} created draft on ${date_long}",	
		YESTERDAY:	"${user} created draft yesterday at ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Draft created on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Draft created on ${date}",	
		TODAY: "Draft created today at ${time}",	
		YEAR: "Draft created on ${date_long}",	
		YESTERDAY:	"Draft created yesterday at ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Edited on ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Edited on ${date}",	
		TODAY: "Edited today at ${time}",	
		YEAR: "Edited on ${date_long}",	
		YESTERDAY:	"Edited yesterday at ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Unsupported Browser",
	unSupporteBrowserContent1: "We're sorry, but your browser might  not work properly with Docs. For best results, try using one of these supported browsers.",
	unSupporteBrowserContent2: "Of course, you can continue with your browser but you might not experience all the features of Docs.",
	unSupporteBrowserContent3: "Don't show me this message again.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "New to Files and Docs?",
	INTRODUCTION_BOX_BLURB: "Upload and share your files. Create and edit files individually or collaboratively using Docs. Organize files in folder, follow files to track changes, and pin your favorites.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Log in to start using Files and Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Click "Upload Files" to add a file. Click "New" to create a file with Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Click Upload Files to add a file. Click New to create a file with Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Close the "Welcome to Files and Docs" section',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Create and collaborate on content with colleagues. Learn how to:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Add your own files.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Start editing online, in real-time, individually or collaboratively.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Upload and edit documents, spreadsheets, or presentations.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Add your own files{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Start editing online, in real-time, individually or collaboratively{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Upload and edit documents, spreadsheets, or presentations{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Page Setup",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientation",
	PORTRAIT: "Portrait",
	LANDSCAPE: "Landscape",	
	MARGINS_LABEL: "Margins",
	TOP: "Top:",
	TOP_DESC:"Top margin, in centimeters",
	TOP_DESC2:"Top margin, in inches",
	BOTTOM: "Bottom:",
	BOTTOM_DESC:"Bottom margin, in centimeters",
	BOTTOM_DESC2:"Bottom margin, in inches",
	LEFT: "Left:",
	LEFT_DESC:"Left margin, in centimeters",
	LEFT_DESC2:"Left margin, in inches",	
	RIGHT: "Right:",
	RIGHT_DESC:"Right margin, in centimeters",
	RIGHT_DESC2:"Right margin, in inches",
	PAPER_FORMAT_LABEL: "Paper format",
	PAPER_SIZE_LABEL: "Paper size:",
	HEIGHT: "Height:",
	HEIGHT_DESC:"Paper height, in centimeters",
	HEIGHT_DESC2:"Paper height, in inches",	
	WIDTH: "Width:",
	WIDTH_DESC:"Paper width, in centimeters",
	WIDTH_DESC2:"Paper width, in inches",
	CM_LABEL: "cm",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "User",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai large",
	DISPLAY_OPTION_LABEL: "Display options",
	HEADER: "Header",
	HEADER_DESC:"Header height, in centimeters",	
	FOOTER: "Footer",
	FOOTER_DESC:"Footer height, in centimeters",
	GRIDLINE: "Grid lines",
	TAGGED_PDF: "Tagged PDF",
	PAGE_LABEL: "Page order",
	PAGE_TYPE1: "Top to bottom, then right",
	PAGE_TYPE2: "Left to right, then down",
	PAGE_SETUP_INVALID_MSG: "The input is invalid and has been rectified automatically. Try another value if you want a different result.",
	
	//Docs publish message
	service_unavailable_content: "Docs service is not available. Your request cannot be processed at this time. Try again later or contact your system administrator.",
	viewaccess_denied_content: "You do not have permission to view this file. The file must be made public or must be shared with you.",
	editaccess_denied_content: "You do not have permission to edit this file. You must be entitled for Docs and the file must be shared with you or you must have editor access to the file.",
	doc_notfound_content: "The document that you want to access has been deleted or moved. Check that the link is correct.",
	repository_out_of_space_content: "You do not have enough space to save your new document. Remove other files to free enough space to save this document.",
	fileconnect_denied_content: "Docs cannot connect to the file repository. Try again later or contact your system administrator.",
	convservice_unavailable_content: "Docs conversion service is not available. Your request cannot be processed at this time. Try again later or contact your system administrator.",
	doc_toolarge_content: "The document that you want to access is too large.",
	conversion_timeout_content: "At this time, the document takes too long to convert. Try again later.",
	storageserver_error_content: "The server is currently unavailable. Your request cannot be processed at this time. Try again later or contact your system administrator.",
	server_busy_content:"Wait for a while and try again later.",
	publish_locked_file: "You cannot publish this file as a new version because it is locked, however, your content is automatically saved in the draft.",
	publishErrMsg: "The version was not published. The file might be too large, or the server might have timed out. Try again, or cancel and ask your administrator to check the server log to identify the problem.",
	publishErrMsg_Quota_Out: "There is not enough space to publish a new version of this document. Remove other files to free enough space to publish this document.",
	publishErrMsg_NoFile: "Because this document has been deleted by others, publish failed.",
	publishErrMsg_NoPermission: "Failed to publish new version because you do not have editor permissions on this file. Contact the file owner to obtain editor permissions and try again."
		
})
