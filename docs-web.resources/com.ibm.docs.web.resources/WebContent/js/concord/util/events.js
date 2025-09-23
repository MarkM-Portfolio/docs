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

dojo.provide("concord.util.events");

//
// Components that listen and publish events
//
    concord.util.events.presSceneEvents             = 	"concord.scenes.PresDocScene";
    concord.util.events.presSceneEvents_Render      = 	"concord.scenes.PresDocScene_Render";
    concord.util.events.presSceneEvents_Resize      = 	"concord.scenes.PresDocScene_Resize";
	concord.util.events.PRES_MENUBAR_COMPONENT 		=  	"concord.widgets.presMenubar";
	concord.util.events.presMenubarEvents_Focus 	= 	"concord.widgets.presMenubar_Focus";
	concord.util.events.presMenubarEvents_SetFocus 	= 	"concord.widgets.presMenubar_SetFocus";
	concord.util.events.PRES_TOOLBAR_COMPONENT		=	"concord.widgets.presToolbar";
	concord.util.events.presToolbarEvents_Focus 	= 	"concord.widgets.presToolbar_Focus";
	concord.util.events.presToolbarEvents_SetFocus 	= 	"concord.widgets.presToolbar_SetFocus";
	concord.util.events.SLIDE_SORTER_COMPONENT		=	"concord.widgets.slideSorter";
	concord.util.events.slideSorterEvents_Focus		=	"concord.widgets.slideSorter_Focus";
	concord.util.events.slideSorterEvents_SetFocus	=	"concord.widgets.slideSorter_SetFocus";
	concord.util.events.SLIDE_EDITOR_COMPONENT 		=	"concord.widgets.slideEditor";
	concord.util.events.slideEditorEvents_Focus 	=	"concord.widgets.slideEditor_Focus";
	concord.util.events.slideEditorEvents_SetFocus 	=	"concord.widgets.slideEditor_SetFocus";
	concord.util.events.COEDITING_COMPONENT			= 	"concord.scenes.coediting";
	concord.util.events.NOTIFICATION_COMPONENT		= 	"concord.scenes.notification";
	concord.util.events.COMMENTS_COMPONENT			= 	"concord.widgets.CommentsManager";
//	concord.util.events.SPEAKER_NOTES_COMPONENT		=	"concord.widget.speakerNotes";
	concord.util.events.SLIDE_SHOW_COMPONENT		=	"concord.widgets.slideShow";
	concord.util.events.PRESENTATION_FOCUS_COMPONENT=	"concord.widgets.FocusManager";
	concord.util.events.CONTENT_BOX_COMPONENT		=	"concord.widgets.contentBox";
	concord.util.events.SIDE_BAR_COMPONENT			=   "concord.widgets.sideBar";
	concord.util.events.NEED_SOLVE_EVENT			=	"concord.util.events.needSolveEvent";
// event topics
	concord.util.events.presMenubarEvents 	= 	concord.util.events.PRES_MENUBAR_COMPONENT;
	concord.util.events.presToolbarEvents 	= 	concord.util.events.PRES_TOOLBAR_COMPONENT;
	concord.util.events.coeditingEvents 	= 	concord.util.events.COEDITING_COMPONENT;
	concord.util.events.notificationEvents	= 	concord.util.events.NOTIFICATION_COMPONENT;
	concord.util.events.commenttingEvents 	= 	concord.util.events.COMMENTS_COMPONENT;
	concord.util.events.slideShowEvents 	= 	concord.util.events.SLIDE_SHOW_COMPONENT;
	concord.util.events.undoRedoEvents 		= 	"concord.util.events.UNDOREDO_COMPONENT";
	concord.util.events.presentationFocus 	= 	concord.util.events.PRESENTATION_FOCUS_COMPONENT;
	concord.util.events.contentBoxEvents 	= 	concord.util.events.CONTENT_BOX_COMPONENT;
	concord.util.events.sideBarEvents 		= 	concord.util.events.SIDE_BAR_COMPONENT;
	concord.util.events.needSolveEvents		= 	concord.util.events.NEED_SOLVE_EVENT;	
	concord.util.events.genericEvents		=	"concord.widgets.GenericEvents";
	concord.util.events.assignmentEvents	=	"concord.widgets.assignmentEvents";
	
	concord.util.events.needSolveEvents_tableLeftArrowPressed="tableLeftArrowPressed";
	concord.util.events.needSolveEvents_tableRightArrowPressed="tableRightArrowPressed";
	concord.util.events.needSolveEvents_tableUpArrowPressed="tableUpArrowPressed";
	concord.util.events.needSolveEvents_tableDownArrowPressed="tableDownArrowPressed";
	concord.util.events.needSolveEvents_CtrlAPressed="needSolveEvents_CtrlAPressed";
	
//
//	presDocScene  EVENT TOPIC and Data
//	
	concord.util.events.presDocSceneEvents_eventName_userJoined 			= "userJoined";					//var eventData = [{'eventName': concord.util.events.presDocSceneEvents_eventName_userJoined ,'userId':user.getId()}];
	concord.util.events.presDocSceneEvents_eventName_userLeft	 			= "userLeft";					//var eventData = [{'eventName': concord.util.events.presDocSceneEvents_eventName_userJoined ,'userId':user.getId()}];
	concord.util.events.presDocSceneEvents_eventName_docShare 				= "docShare";					//var eventData = [{'eventName': concord.util.events.presDocSceneEvents_eventName_docShare,'shares':shares,'newShare':shareto}];
	concord.util.events.presDocSceneEvents_eventName_coeditStarted			= "coeditStarted"; 				//var eventData = [ {'eventName' : concord.util.events.presDocSceneEvents_eventName_coeditStarted} ];
	
//	Generic events
	concord.util.events.genericEvents_eventName_blockKeyPress				= "blockKeyPress";
	concord.util.events.genericEvents_eventName_unblockKeyPress				= "unblockKeyPress";
	
//
//	toolbar EVENT TOPIC and Data
//	
	concord.util.events.presToolbarEvents_eventName_slideTransitions        = 'slideTransitions';		//var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_slideTransitions,'smil_type':transitionSmilType,'smil_direction':transitionSmilSubType,'smil_subtype':transitionSmilDirection}];
	concord.util.events.presToolbarEvents_eventName_concordPresSave  		= 'concordPresSave'; 			//var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_concordPresSave}];
	concord.util.events.presToolbarEvents_eventName_concordBGFill  			= 'concordBGFill'; 			//var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_concordBGFill,'color':'#ffffff'}];	
	concord.util.events.presToolbarEvents_eventName_concordBorderColor  	= 'concordBorderColor';
	concord.util.events.presToolbarEvents_eventName_verticalAlign           = 'verticalAlign';          //var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_verticalAlign,'verticalAlign':'bottom'}];
    concord.util.events.presToolbarEvents_eventName_concordPresPrint        = 'concordPrePrint';
 
//
// sidebar EVENT TOPIC and Data
//
    
    concord.util.events.presSideBarEvents_eventName_concordOpenSlideSorter  = 'concordOpenSlideSorter';

//
//	presMenubarEvents EVENT TOPIC and Data
//
	concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes		= "showHideSpeakerNotes";
	concord.util.events.presMenubarEvents_eventName_showHideSlideSorter			= "showHideSlideSorter";
    concord.util.events.presMenubarEvents_eventName_cutSlides 					= 'cutSlides';
	concord.util.events.presMenubarEvents_eventName_cutEditorObj 				= 'cutEditorObj';
	concord.util.events.presMenubarEvents_eventName_copySlides					= 'copySlides';
	concord.util.events.presMenubarEvents_eventName_copyEditorObj 				= 'copyEditorObj';
	concord.util.events.presMenubarEvents_eventName_pasteSlides					= 'pasteSlides';
	concord.util.events.presMenubarEvents_eventName_pasteEditorObj 				= 'pasteEditorObj';
	concord.util.events.presMenubarEvents_eventName_deleteSlides				= 'deleteSlides';
	concord.util.events.presMenubarEvents_eventName_createNewSlide 				= 'createNewSlide';
	concord.util.events.presMenubarEvents_eventName_assignTask					= 'assignTask';
	concord.util.events.presMenubarEvents_eventName_launchImageDialog 			= 'launchImageDialog';
	concord.util.events.presMenubarEvents_eventName_launchShapeMessageDialog    = 'launchShapeMessageDialog';
	concord.util.events.presMenubarEvents_eventName_createNewShapeBox 			= 'createNewShapeBox';
	concord.util.events.presMenubarEvents_eventName_createNewTextBox 			= 'createNewTextBox';
	concord.util.events.presMenubarEvents_eventName_createDefaultTextBox 		= 'createDefaultTextBox';
	concord.util.events.presMenubarEvents_eventName_createTableBox 				= 'createTableBox';
	concord.util.events.presMenubarEvents_eventName_deleteTableBox 				= 'deleteTableBox';	
	concord.util.events.presMenubarEvents_eventName_showtablecaption       		= 'showtablecaption';
	concord.util.events.presMenubarEvents_eventName_hidetablecaption       		= 'hidetablecaption';
	concord.util.events.presMenubarEvents_eventName_addtablerow    				= 'addtablerow';
	concord.util.events.presMenubarEvents_eventName_deletetablerow    			= 'deletetablerow';
	concord.util.events.presMenubarEvents_eventName_deletetablecol				= 'deletetablecol';
	concord.util.events.presMenubarEvents_eventName_addtablecol					= 'addtablecol';
	concord.util.events.presMenubarEvents_eventName_changesize					= 'changeSize';
	concord.util.events.presMenubarEvents_eventName_changedrawframesize			= 'changeDrawFrameSize';
	concord.util.events.presMenubarEvents_eventName_launchSlideTransitionDialog = 'launchSlideTransitionDialog';
	concord.util.events.presMenubarEvents_eventName_launchTableRowDialog        = 'launchTableRowDialog';
	concord.util.events.presMenubarEvents_eventName_launchTableColDialog        = 'launchTableColDialog';
	concord.util.events.presMenubarEvents_eventName_launchSlideLayoutDialog 	= 'launchSlideLayoutDialog';
	concord.util.events.presMenubarEvents_eventName_launchSlideDesignDialog 	= 'launchSlideDesignDialog';
	concord.util.events.presMenubarEvents_eventName_launchImagePropertyDlg 		= 'launchImagePropertyDialog';
	concord.util.events.presMenubarEvents_eventName_launchShapePropertyDlg 		= 'launchShapePropertyDialog';
	concord.util.events.presMenubarEvents_eventName_launchCellPropertyDlg 		= 'launchCellPropertyDialog';
	concord.util.events.presMenubarEvents_eventName_bringToFront			 	= 'bringToFront';
	concord.util.events.presMenubarEvents_eventName_sendToBack				 	= 'sendToBack';
	concord.util.events.presMenubarEvents_eventName_slideShow 					= 'slideShow';
	concord.util.events.presMenubarEvents_eventName_printHtml 					= 'printHtml';
	concord.util.events.presMenubarEvents_eventName_moveSTRowUp 				= 'moveSTRowUp';
	concord.util.events.presMenubarEvents_eventName_moveSTRowDown 				= 'moveSTRowDown';	
	concord.util.events.presMenubarEvents_eventName_AddSTRowAbv 				= 'AddSTRowAbv';
	concord.util.events.presMenubarEvents_eventName_AddSTRowBlw 				= 'AddSTRowBlw';		
	concord.util.events.presMenubarEvents_eventName_DelSTRow 					= 'DelSTRow';		
	concord.util.events.presMenubarEvents_eventName_AddSTColBfr					= 'AddSTColBfr';
	concord.util.events.presMenubarEvents_eventName_AddSTColAft					= 'AddSTColAft';
	concord.util.events.presMenubarEvents_eventName_moveSTColLeft				= 'moveSTColLeft';
	concord.util.events.presMenubarEvents_eventName_moveSTColRight				= 'moveSTColRight';
	concord.util.events.presMenubarEvents_eventName_clearCellContent			= 'clearSTCellContent';
	concord.util.events.presMenubarEvents_eventName_leftAlignCellContent		= 'leftAlignSTCellContent';
	concord.util.events.presMenubarEvents_eventName_centerAlignCellContent		= 'centerAlignSTCellContent';
	concord.util.events.presMenubarEvents_eventName_rightAlignCellContent		= 'rightAlignSTCellContent';

	concord.util.events.presMenubarEvents_eventName_sortSTColAsc				= 'sortSTColAsc';
	concord.util.events.presMenubarEvents_eventName_sortSTColDesc				= 'sortSTColDesc';
	concord.util.events.presMenubarEvents_eventName_DelSTCol					= 'DelSTCol';
	concord.util.events.presMenubarEvents_eventName_ResizeSTCol					= 'ResizeSTCol';
	
	concord.util.events.presMenubarEvents_eventName_CopyObject					= 'copyObject';
	concord.util.events.presMenubarEvents_eventName_DeleteObject				= 'deleteObject';	
	concord.util.events.presMenubarEvents_eventName_CutObject					= 'cutObject';
	concord.util.events.presMenubarEvents_eventName_PasteObject					= 'pasteObject';
	concord.util.events.presMenubarEvents_eventName_addTableStyle				= 'addTableStyle';
    concord.util.events.presMenubarEvents_eventName_addCustomTableStyle			= 'addCustomTableStyle';
    concord.util.events.presMenubarEvents_eventName_customTableDialogLaunched	= 'customTableDialogLaunched';
    concord.util.events.presMenubarEvents_eventName_createTableAndAddTableStyle	= 'createTableAndAddTableStyle';
	concord.util.events.presMenubarEvents_eventName_CreateTaskShowDialog		= 'createTaskShowDialog';
	concord.util.events.presMenubarEvents_eventName_RemoveCompletedTask			= 'removeCompletedTask';
	concord.util.events.presMenubarEvents_eventName_unassignSlides				= 'unassignSlides';
	concord.util.events.presMenubarEvents_eventName_AboutSlideAssignment		= 'aboutSlideAssignment';
	concord.util.events.presMenubarEvents_eventName_getSlideSelectedTaskMenu    = 'getSlideSelectedTaskMenu';
	concord.util.events.presMenubarEvents_eventName_openSlideSorterCommentsPane	= 'openSlideSorterCommentsPane';	
	concord.util.events.presMenubarEvents_eventName_launchPropertyDlg			= 'launchPropertyDlg';
	concord.util.events.presMenubarEvents_eventName_subscript                   = 'subscript';
	concord.util.events.presMenubarEvents_eventName_superscript                 = 'superscript';
	concord.util.events.presMenubarEvents_eventName_strikethrough               = 'strikethrough';
	concord.util.events.presMenubarEvents_eventName_bold		                = 'bold';
	concord.util.events.presMenubarEvents_eventName_italic		                = 'italic';
	concord.util.events.presMenubarEvents_eventName_underline	                = 'underline';

	
//
//	presToolbarEvents EVENT TOPIC and Data
//	
	concord.util.events.presToolbarEvents_eventName_createTableBoxDefault =	'createTableBoxDefault';
	
//
//slideSorterEvents EVENT TOPIC and Data
//
	concord.util.events.slideSorterEvents = concord.util.events.SLIDE_SORTER_COMPONENT;
	concord.util.events.slideSorterEvents_eventName_slideSorterReady 		= "slideSorterReady";			//var eventData = [{eventName: 'slideSorterReady',cssFiles:['office_styles.css','office_automatic_styles.css']}];
	concord.util.events.slideSorterEvents_eventName_onCKEInstanceReady 		= "onCKEInstanceReady";			//var eventData = [{eventName: concord.util.events.slideSorterEvents_eventName_onCKEInstanceReady,editorName:this.ckeditorInstanceName}];
	concord.util.events.slideSorterEvents_eventName_slideSelected 			= "slideSelected";				//var eventData = [{eventName: 'slideSelected',slideSelected:this.selectedSlide}];
	concord.util.events.slideSorterEvents_eventName_launchSlideLayoutDialog	= "launchSlideLayoutDialog";	//var eventData = [{eventName: 'launchSlideLayoutDialog'}];
	concord.util.events.slideSorterEvents_eventName_launchSlideTransitionDialog	= "launchSlideTransitionDialog";//var eventData = [{eventName: 'launchSlideTransitionDialog'}];
	concord.util.events.slideSorterEvents_eventName_launchSlideDesignDialog	= "launchSlideDesignDialog";	//var eventData = [{eventName: 'launchSlideDesignDialog'}];
	concord.util.events.slideSorterEvents_eventName_templateApplied			= "templateApplied";			//var eventData = [{eventName: 'templateApplied',cssFiles:cssFiles,templateData:templateData}];
	concord.util.events.slideSorterEvents_eventName_attributeChange			= "attributeChange";			//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_attributeChange,'id':id,'attributeName':'style','attributeValue':style}];
	concord.util.events.slideSorterEvents_eventName_layoutAppliedFromCoediting	= "layoutAppliedFromCoediting";		//var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_layoutAppliedFromCoediting,'slideSelected':slideElem}];
	concord.util.events.slideSorterEvents_eventName_masterTemplateChange		= "masterTemplateChange";   //eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_masterTemplateChange,'currMasterFrameStylesJSON':currMasterFrameStylesJSON}];
	concord.util.events.slideSorterEvents_eventName_slideShowData			= "slideShowData";
	concord.util.events.slideSorterEvents_eventName_presHtmlPrintData			= "presHtmlPrintData";
	concord.util.events.slideSorterEvents_eventName_slideSelectedTaskMenu		= "slideSelectedTaskMenu"; //Task 18900 //var eventData = [{eventName:concord.util.events.slideSorterEvents_eventName_slideSelectedTaskMenu, isUnassignDisabled:isUnassignDisabled,isMarkDoneDisabled:isMarkDoneDisabled, isApproveDisabled:isApproveDisabled,isRejectDisabled:isRejectDisabled, isReassign:isReassign, isAboutSlideAssignmentDisabled:isAboutSlideAssignmentDisabled, isWriteAssigneeAvailable:isWriteAssigneeAvailable}];
	concord.util.events.slideSorterEvents_eventName_deleteCommentIcon			="deleteCommentIcon";
	concord.util.events.slideSorterEvents_eventName_launchContentLockDialog	= "launchContentLockDialog";	//var eventData = [{eventName: 'launchContentLockDialog'}];
	concord.util.events.slideSorterEvents_eventName_commentSelectedInSlideOpened = "commentSelectedInSlideOpened";
	concord.util.events.slideSorterEvents_eventName_taskMarkedComplete			= "taskMarkedComplete";
	concord.util.events.slideSorterEvents_eventName_completedTaskRemoved		= "completedTaskRemoved";
	concord.util.events.slideSorterEvents_eventName_afterContentDom				= "afterOnContentDom";
	concord.util.events.slideSorterEvents_eventName_updateContextMenuOptions	= "updateContextMenuOptions";
	concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset = "cleanupOldContentBeforeReset";
	concord.util.events.slideSorterEvents_eventName_slidesLoaded			 	= "slidesLoaded";	
	concord.util.events.slideSorterEvents_eventName_selectedSlideNumberUpdated	= "selectedSlideNumberUpdated";  //event for slideeditor to also update the slide number
	concord.util.events.slideSorterEvents_eventName_nextPrevSlide               = "nextPrevSlide";
	concord.util.events.slideSorterEvents_eventName_layoutApplied 		   		= "layoutApplied";				//eventData = [{'eventName': 'layoutApplied','slideSelected':copyNode}];

//
//slideEditorEvents EVENT TOPIC and Data
//
	concord.util.events.slideEditorEvents_eventName_cutCopyPasteDialog 			= 'cutCopyPasteDialog';
	concord.util.events.slideEditorEvents = concord.util.events.SLIDE_EDITOR_COMPONENT;
	concord.util.events.slideEditorEvents_eventName_applyLayout 		   		= "applyLayout";
	concord.util.events.slideEditorEvents_eventName_slideChanged  		   		= "layoutApplied";				//TODO: UPDATE NAME WHEN SORTER IS READY  //eventData = [{'eventName': 'slideChanged','slideSelected':copyNode}];
	concord.util.events.slideEditorEvents_eventName_showHideCoeditingIndicators = "showHideCoeditingIndicators"; //
	concord.util.events.slideEditorEvents_eventName_templateDesignApplied  		= "templateDesignApplied";		//eventData = [{'eventName': 'templateDesignApplied','templateData':templateJSONDefinition,'slideSelected':copyNode}];	
	concord.util.events.slideEditorEvents_eventName_attributeChange	       		= "attributeChange";			//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_attributeChange,'id':id,'attributeName':'style','attributeValue':style}];
	concord.util.events.slideEditorEvents_eventName_boxEditMode	       			= "boxEditMode";				//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_boxInEditMode,'drawFrameId':id,'editNodeId':id}];
	concord.util.events.slideEditorEvents_eventName_insertNodeFrame	       		= "insertNodeFrame";			//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_insertNodeFrame,'node':this.mainNode,'parentId':this.parentContainerNode.id,'siblingId':this.mainNode.previousSibling}];
	concord.util.events.slideEditorEvents_eventName_deleteNodeFrame	       		= "deleteNodeFrame";			//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_deleteNodeFrame,'node':this.mainNode,'parentId':this.parentContainerNode.id}];
	concord.util.events.slideEditorEvents_eventName_currentElementBeingEdited	= "currentElementBeingEdited";	//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_currentElementBeingEdited,'nodeId':id}];
	concord.util.events.slideEditorEvents_eventName_layoutConverted				= "layoutConverted";			//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_layoutConverted,'nodeId':id}];
	concord.util.events.slideEditorEvents_eventName_cutSlides 					= 'cutSlides';
	concord.util.events.slideEditorEvents_eventName_copySlides					= 'copySlides';
	concord.util.events.slideEditorEvents_eventName_pasteSlides					= 'pasteSlides';
	concord.util.events.slideEditorEvents_eventName_deleteSlides				= 'deleteSlides';
	concord.util.events.slideEditorEvents_eventName_multipleInsertNodeFrame	   	= "multipleInsertNodeFrame";    //var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_multipleInsertNodeFrame,'nodeList':objList}];		
	concord.util.events.slideEditorEvents_eventName_multipleDeleteNodeFrame		= "multipleDeleteNodeFrame";
	concord.util.events.slideEditorEvents_eventName_slideTransitionApplied		= "slideTransitionApplied";		//var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_slideTransitionApplied,'smil_type':transitionSmilType,'smil_subtype':transitionSmilSubType,'smil_direction':transitionSmilDirection,'applyToAll':applyToAll}];
	concord.util.events.slideEditorEvents_eventName_disableBringToFrontMenuItems= "disableBringToFrontMenuItems";  //eventData = [{'eventName': 'disableBringToFrontMenuItems'}];
	concord.util.events.slideEditorEvents_eventName_enableBringToFrontMenuItems	= "enableBringToFrontMenuItems"; //eventData = [{'eventName': 'enableBringToFrontMenuItems'}];
	concord.util.events.slideEditorEvents_eventName_disableSendToBackMenuItems	= "disableSendToBackMenuItems";  //eventData = [{'eventName': 'disableSendToBackMenuItems'}];
	concord.util.events.slideEditorEvents_eventName_enableSendToBackMenuItems	= "enableSendToBackMenuItems"; //eventData = [{'eventName': 'enableSendToBackMenuItems'}];

//
//	ContentBox Events
//	
	concord.util.events.contentBoxEvents_eventName_boxClicked = 'boxClicked';
	
	
//
// keypressHandlerEvents EVENT TOPIC and Data
//
	concord.util.events.keypressHandlerEvents = "concord.widgets.keypressHandler"; //eventData = [{'eventName':this.KEYPRESS ,'e':e,'eventAction':action}]; 
	
	concord.util.events.keypressHandlerEvents_eventName_keypressEvent 	= "KEYPRESS"; 	
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_A 		= "CTRL_A";
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_C 		= "CTRL_C";
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_X 		= "CTRL_X";
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_V 		= "CTRL_V";
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_M 		= "CTRL_M";
	concord.util.events.keypressHandlerEvents_eventAction_DELETE		= "DELETE";
	concord.util.events.keypressHandlerEvents_eventAction_DOWN_ARROW	= "DOWN_ARROW";
	concord.util.events.keypressHandlerEvents_eventAction_END			= "END";
	concord.util.events.keypressHandlerEvents_eventAction_ENTER			= "ENTER";
	concord.util.events.keypressHandlerEvents_eventAction_ESC			= "ESC";
	concord.util.events.keypressHandlerEvents_eventAction_HOME 			= "HOME";
	concord.util.events.keypressHandlerEvents_eventAction_INSERT		= "INSERT";
	concord.util.events.keypressHandlerEvents_eventAction_LEFT_ARROW	= "LEFT_ARROW";
	concord.util.events.keypressHandlerEvents_eventAction_PAGE_DOWN		= "PAGE_DOWN";
	concord.util.events.keypressHandlerEvents_eventAction_PAGE_UP		= "PAGE_UP";
	concord.util.events.keypressHandlerEvents_eventAction_RIGHT_ARROW	= "RIGHT_ARROW";
	concord.util.events.keypressHandlerEvents_eventAction_UP_ARROW		= "UP_ARROW";
	concord.util.events.keypressHandlerEvents_eventAction_TAB			= "TAB";
	concord.util.events.keypressHandlerEvents_eventAction_CTRL_TAB		= "CTRL_TAB";
	concord.util.events.keypressHandlerEvents_eventAction_OUTSIDE_EDITOR = "OUTSIDE_EDITOR";
	concord.util.events.keypressHandlerEvents_eventAction_SHIFT_TAB		= "SHIFT_TAB";
	concord.util.events.keypressHandlerEvents_eventAction_BACKSPACE		= "BACKSPACE";
	concord.util.events.keypressHandlerEvents_eventAction_SAVE          = "SAVE";
	concord.util.events.keypressHandlerEvents_eventAction_ALT_SHIFT_F   = "ALT_SHIFT_F";
	concord.util.events.keypressHandlerEvents_eventAction_ALT_F10		= "ALT_F10";
	concord.util.events.keypressHandlerEvents_eventAction_SHIFT_F10		= "SHIFT_F10";
	concord.util.events.keypressHandlerEvents_eventAction_SPACE		= "SPACE";
	
	

//
// Cross Component event topics
//
	//concord.util.events.crossComponentEvents  = "concord.widgets.crossComponentEvents";   //eventData = [{'eventName': 'inFocus','componentName':'xxxx'}];
	concord.util.events.crossComponentEvents_eventName_inFocus			 = "inFocus";
	concord.util.events.crossComponentEvents_eventName_disableMenuItems	 = "disableMenuItems"; //eventData = [{'eventName': 'disableMenuItems','menuItemLabels':[label1,label2,..., labeln]}];
	concord.util.events.crossComponentEvents_eventName_enableMenuItems	 = "enableMenuItems";  //eventData = [{'eventName': 'enableMenuItems','menuItemLabels':[label1,label2,..., labeln]}];
	concord.util.events.crossComponentEvents_eventName_disableTableEditingMenuItems	 = "disableTableEditingMenuItems"; //eventData = [{'eventName': 'disableTableEditingMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_enableTableEditingMenuItems	 = "enableTableEditingMenuItems";  //eventData = [{'eventName': 'enableTableEditingMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_changeTableEditingMenuItems   = "changeTableEditingMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTableSelectionMenuItems	 = "disableTableSelectionMenuItems"; //eventData = [{'eventName': 'disableTableSelectionMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_enableTableSelectionMenuItems	 = "enableTableSelectionMenuItems";  //eventData = [{'eventName': 'enableTableSelectionMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_disableTextSelectionMenuItems	 = "disableTextSelectionMenuItems"; //eventData = [{'eventName': 'disableTextSelectionMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_enableTextSelectionMenuItems	 = "enableTextSelectionMenuItems";  //eventData = [{'eventName': 'enableTextSelectionMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_disableUndoMenuItem	 = "disableUndoMenuItem"; //eventData = [{'eventName': 'disableUndoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_enableUndoMenuItem	 = "enableUndoMenuItem";  //eventData = [{'eventName': 'enableUndoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_disableRedoMenuItem	 = "disableRedoMenuItem"; //eventData = [{'eventName': 'disableRedoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_enableRedoMenuItem	 = "enableRedoMenuItem";  //eventData = [{'eventName': 'enableRedoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_enableWebClipboardMenuItem	 = "enableWebClipboardMenuItem";  //eventData = [{'eventName': 'enableWebClipboardMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_disableWebClipboardMenuItem	 = "disableWebClipboardMenuItem";  //eventData = [{'eventName': 'enableWebClipboardMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_disableEditMenuItems = "disableEditMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableDiscardMenuItem	 = "enableDiscardMenuItem";  //eventData = [{'eventName': 'enableUndoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_disableDiscardMenuItem	 = "disableDiscardMenuItem"; //eventData = [{'eventName': 'disableRedoMenuItem'}];
	concord.util.events.crossComponentEvents_eventName_enableImagePropertyMenuItems = "enableImagePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableImagePropertyMenuItems = "disableImagePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableTablePropertyMenuItems = "enableTablePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTablePropertyMenuItems = "disableTablePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableTableCellPropertyMenuItems = "enableTableCellPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTableCellPropertyMenuItems = "disableTableCellPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enablePropertyMenuItems = "enablePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disablePropertyMenuItems = "disablePropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableTextPropertyMenuItems = "enableTextPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTextPropertyMenuItems = "disableTextPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableTextFontPropertyMenuItems = "enableTextFontPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTextFontPropertyMenuItems = "disableTextFontPropertyMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableTextStlyleMenuItems	 = "enableTextStyleMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableTextStyleMenuItems	 = "disableTextStyleMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableStrikeThroughMenuItems	 = "disableStrikeThroughMenuItems"; //eventData = [{'eventName': 'disableStrikeThroughMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_enableStrikeThroughMenuItems	 = "enableStrikeThroughMenuItems";  //eventData = [{'eventName': 'enableStrikeThroughMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOn	 = "superscriptCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOff	 = "superscriptCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOn	 = "subscriptCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOff	 = "subscriptCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn	 = "strikethorughCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff	 = "strikethroughCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn	 = "boldCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff	 = "boldCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn	 = "italicCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff	 = "italicCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOn	 = "underlineCheckedMenuOn";
	concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOff	 = "underlineCheckedMenuOff";
	concord.util.events.crossComponentEvents_eventName_disableCopyCutMenuItems	 = "disableCopyCutMenuItems"; //eventData = [{'eventName': 'disableCopyCutMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_enableCopyCutMenuItems	 = "enableCopyCutMenuItems"; //eventData = [{'eventName': 'enableCopyCutMenuItems'}];
	concord.util.events.crossComponentEvents_eventName_verticalAlignOptionOn	 = "verticalAlignOptionOn"; //eventData = [{'eventName': 'verticalAlignOptionOn', 'verticalAlign' 'top': }];
	concord.util.events.crossComponentEvents_eventName_verticalAlignOptionAllOff = "verticalAlignOptionAllOff"; //eventData = [{'eventName': 'verticalAlignOptionAllOff'}];
	concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems = "enableIncreaseIndentMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems = "disableIncreaseIndentMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems = "enableDecreaseIndentMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems = "disableDecreaseIndentMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableDecreaseFontSizeMenuItems = "enableDecreaseFontSizeMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableDecreaseFontSizeMenuItems = "disableDecreaseFontSizeMenuItems";
	concord.util.events.crossComponentEvents_eventName_enableIncreaseFontSizeMenuItems = "enableIncreaseFontSizeMenuItems";
	concord.util.events.crossComponentEvents_eventName_disableIncreaseFontSizeMenuItems = "disableIncreaseFontSizeMenuItems";
	
	concord.util.events.crossComponentEvents_eventName_speakerNotesOptionOff = "speakerNotesOptionOff"; //eventData = [{'eventName': 'speakerNotesOptionOff'}];
	
	
	//concord.util.events.crossComponentEvents_componentName_SLIDE_SORTER  = concord.util.events.SLIDE_SORTER_COMPONENT;
	concord.util.events.crossComponentEvents_componentName_SLIDE_EDITOR  = concord.util.events.SLIDE_EDITOR_COMPONENT;
	concord.util.events.crossComponentEvents_componentName_PRES_TOOLBAR	 = concord.util.events.PRES_TOOLBAR_COMPONENT;
	concord.util.events.crossComponentEvents_componentName_PRES_MENUBAR  = concord.util.events.PRES_MENUBAR_COMPONENT;
	
//Coediting event topics
	concord.util.events.coeditingEvents_eventName_processMessageInsertSlide			= "processMessageInsertSlide";//eventData = [{eventName: concord.util.events.coeditingEvents_eventName_processMessageInsertSlide,slideElem:element, nextSlideWrapper:nextSibling, slideParent:parent}];
	concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide			= "processMessageDeleteSlide"; //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide}];
	concord.util.events.coeditingEvents_eventName_preProcessMessageDeleteSlide		= "preProcessMessageDeleteSlide"; //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide}];
	concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUser			= "slideSelectedByOtherUser";  //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUser, msg:entry}]; //var entry = {'drawFrameId':msg.elemId,'user':msg.user,'action':'slideSelected'};	
	concord.util.events.coeditingEvents_eventName_doAssignmentByOtherUser			= "doAssignmentByOtherUser"; //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_doAssignmentByOtherUser, msg:entry}]; //var entry = {'slideIdArray':msg.slideIdArray, 'taskBean':msg.taskBean,'action':'taskAssigned'};
	concord.util.events.coeditingEvents_eventName_templateAppliedByOtherUser		= "templateAppliedByOtherUser"; //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_templateAppliedByOtherUser, msg:entry}]; //var entry = {'templateData':msg.templateData,'action':'templateApplied'};
	concord.util.events.coeditingEvents_eventName_layoutAppliedByOtherUser			= "layoutAppliedByOtherUser"; //eventData = [{eventName: concord.util.events.coeditingEvents_eventName_layoutAppliedByOtherUser, msg:entry}]; //var entry = {'slideWithNewLayout':msg.slideWithNewLayout,'action':'layoutApplied'};
	concord.util.events.coeditingEvents_eventName_processMessageInsertSlideWrapper  = "processMessageInsertSlideWrapper"; //var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_processMessageInsertSlideWrapper,slideElem:element, nextSlideWrapper:nextSibling, slideParent:parent}];
	concord.util.events.coeditingEvents_eventName_toggleContentBoxLock  			= "toggleContentBoxLock"; //var eventData = [{eventName: concord.util.events.coeditingEvents_eventName_toggleContentBoxLock,'contentBoxId' : drawFrameId, 'lockContentBox': lockContentBox}];
	concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUserRemoved   = "slideSelectedByOtherUserRemoved";	
	//
//Undo Redo event topics
	concord.util.events.undoRedoEvents_eventName_undo								= "undo";//var eventData = [{eventName: concord.util.events.undoRedoEvents_eventName_undo,slideId:slideElemAffected.id}];
	concord.util.events.undoRedoEvents_eventName_applyTemplate						= "applyTemplate"; //
	concord.util.events.undoRedoEvents_eventName_processMessageInsertSlideWrapper	= "undoRedoInserSlideWrapper";
	concord.util.events.undoRedoEvents_eventName_processMessageDeleteSlideWrapper	= "undoRedoDeleteSlideWrapper";
//comments event topics	
	concord.util.events.commenttingEvents_eventName_commentSelected                 = "commentSelected";
	concord.util.events.commenttingEvents_eventName_commentUnselected                 = "commentUnselected";
	concord.util.events.commenttingEvents_eventName_commentDeleted                  = "commentDeleted";
	concord.util.events.commenttingEvents_eventName_createComment                   = "createComment";
	concord.util.events.commenttingEvents_eventName_commentCreated                  = "commentCreated";
	concord.util.events.commenttingEvents_eventName_expandComments                  = "expandComments";
	concord.util.events.commenttingEvents_eventName_disableComments                 = "disableComments";
	concord.util.events.commenttingEvents_eventName_DeleteComments                  = "deleteComments";
	concord.util.events.commenttingEvents_eventName_addCommentIcon                  = "addCommentIcon";
	concord.util.events.commenttingEvents_eventName_deleteCommentIcon               = "deleteCommentIcon";
	concord.util.events.commenttingEvents_eventName_addSlideCommentIcon            = "addSlideCommentIcon";
	concord.util.events.commenttingEvents_eventName_delSlideCommentIcon            = "delSlideCommentIcon";
	
//task events topics
	concord.util.events.taskEvents_eventName_undoOTFailedTaskHolder					= "undoOTFailedTaskHolder";
	concord.util.events.taskEvents_eventName_taskLoaded								= "taskLoaded";
	concord.util.events.taskEvents_eventName_taskAdded 								= "taskAdded";
	concord.util.events.taskEvents_eventName_taskUpdated							= "taskUpdated";
	concord.util.events.taskEvents_eventName_taskDeleted							= "taskDeleted";
	concord.util.events.taskEvents_eventName_taskSelected							= "taskSelected";
	concord.util.events.taskEvents_eventName_taskCreateEnabled						= "taskCreatedEanbled";
	concord.util.events.taskEvents_eventName_taskExisted							= "taskExisted";
	concord.util.events.taskEvents_eventName_dueDateSet								= "dueDateSet";
	concord.util.events.taskEvents_eventName_presTaskUpdated						= "presTaskUpdated";
// sidebar editor event topics
	concord.util.events.sidebarEditorEvents_eventName_editorSelected               	="editorSelected";
	concord.util.events.sidebarEditorEvents_eventName_refreshFilter               	="refreshFilter";
	concord.util.events.sidebarEditorEvents_eventName_hideAllAssignments			="hideAllAssignments";
	concord.util.events.sidebarEditorEvents_eventName_showAllAssignments			="showAllAssignments";
	concord.util.events.sidebarEditorEvents_eventName_showMyAssignments				="showMyAssignments";
	concord.util.events.sidebarEditorEvents_eventName_showUserAssignments			="showUserAssignments";
	concord.util.events.sidebarEditorEvents_eventName_slideSorterExpand             ="slideSorterExpand";
// Presentation Assignment events	
	concord.util.events.presAssignment_eventName_assignSlides					="assignSlides";
	concord.util.events.presAssignment_eventName_editAssignSlide				="editAssignSlide";
	concord.util.events.presAssignment_eventName_reopenAssignSlides				="reopenAssignSlides";
	concord.util.events.presAssignment_eventName_reassignSlides					="reassignSlides";
	concord.util.events.presAssignment_eventName_unassignSlides			 		="unassignSlides";
	concord.util.events.presAssignment_eventName_markDoneSlides					="markDoneSlides";
	concord.util.events.presAssignment_eventName_approveSlides					="approveSlides";
	concord.util.events.presAssignment_eventName_rejectSlides					="rejectSlides"; 
	concord.util.events.presAssignment_eventName_RemoveCompletedTask			="RemoveCompletedTask";
	concord.util.events.presAssignment_eventName_AboutSlideAssignment			="AboutSlideAssignment";
	
	concord.util.events.presAssignment_updateProgressbar						="updateProgressbar";	
	
	concord.util.events.taskEvents_eventName_taskSelected						= "taskSelected";	
// Local Synch Event Constants: These events will be used by Slide Sorter and Slide Editor
//
	concord.util.events.LocalSync_eventName_attributeChange 			 = "attributeChange";   //var eventData = [{'eventName': attributeChange,'nodeId':id,'attributeName':'style','attributeValue':style}];
	concord.util.events.LocalSync_eventName_multiBoxAttributeChange		 = "multiBoxAttributeChange";
	concord.util.events.LocalSync_eventName_conflictingZindex            = "conflictingZindex";

		
	//Notification event Topics
	//wangxum@cn.ibm.com
	concord.util.events.notificationEvents_eventName_slideContentChanged	= "slideContentsChanged"; //eventData = [{'eventName': concord.util.events.notificationEvents_eventName_slideContentChanged,'slideId':slideSelected}];
	concord.util.events.notificationEvents_eventName_updateNotifyMsg  = "updateNotifymsg"; //var eventData = [{eventName: concord.util.events.notificationEvents_eventName_updateNotifyMsg,messageNode:notificationWrapper}];
//	concord.util.events.notificationEvents_eventName_getSlideNumbers 	= "getSlideNumbers"; //var eventData = [{eventName: concord.util.events.notificationEvents_eventName_getSlideNumbers}];
//	concord.util.events.notificationEvents_eventName_showSlide			= "showSlide"; 	//var eventData = [{eventName: concord.util.events.notificationEvents_eventName_showSlide, slideId:slideId}];

//SlideShow and HTML print topics
	concord.util.events.slideShowEvents_eventName_getSlidesForShow = "getSlidesForShow";
	concord.util.events.slideShowEvents_eventName_getSlidesForPrint = "getSlidesForPrint";
	
//Focus Component topics
	concord.util.events.presentationFocus_eventName_setComponentFocus = "setComponentFocus";		//var eventData = [{'eventName': concord.util.events.presentationFocus_eventName_setComponentFocus, 'nextFocusRegion':nextFocusRegion}];
	
	concord.util.events.comments_reload = 'comments_reload';
	concord.util.events.doc_data_reload = 'document_data_reload';
	concord.util.events.doc_data_changed = 'text_data_changed';
	concord.util.events.doc_header_dom_changed = 'doc_header_dom_changed';
	//comments
	concord.util.events.comments_selected = 'comments_icon_clicked';
	concord.util.events.comments_deselected = 'comments_deselected';
	concord.util.events.comments_deleted = 'comments_icon_deleted';
	concord.util.events.disable_commentsPanel = 'disable_commentsPanel';
	concord.util.events.comments_queryposition = 'comments_query_position';
	concord.util.events.commentBoxReLocation = 'commentBoxReLocation';
	concord.util.events.commentButtonDisabled = 'commentButtonDisabled';
	//typeahead
	concord.util.events.typeahead_selection = 'typeahead_selection';
	//LotusUploader
	concord.util.events.uploader_loaded = 'uploader_loaded';
	
	//activity
	concord.util.events.activity_linked = 'activity_linked';
	
	//sidebar
	concord.util.events.sidebar_editorspane_switched = 'sidebar_editorspane_switched';	
	concord.util.events.sidebar_user_deselected = 'sidebar_user_deselected';	
	concord.util.events.sidebar_user_selected = 'sidebar_user_selected';
	//new sidebar redesign
	concord.util.events.commentingEvents = 'commenting_events';
	concord.util.events.commenting_addComment = 'commenting_addComment';
	concord.util.events.commenting_removeComment = 'commenting_removeComment';
	concord.util.events.commenting_resolved = 'commenting_resolved'; 
	concord.util.events.commenting_reopen = 'commenting_reopen'; 
	concord.util.events.commenting_addReply = 'commenting_addReply';
	concord.util.events.commenting_selectComment ="commenting_selectComment";
	concord.util.events.commenting_popupDlg_click ="commenting_popupDlg_click";
	concord.util.events.commenting_popupDlg_mouseOut ="commenting_popupDlg_mouseOut";
	concord.util.events.commenting_popupDlg_mouseOver ="commenting_popupDlg_mouseOver";
	concord.util.events.commenting_hide = 'commenting_hide';
	concord.util.events.commenting_show = 'commenting_show';
	concord.util.events.commenting_delete = 'commenting_delete';
	concord.util.events.commenting_undoDelete = 'commenting_undoDelete';
	concord.util.events.commenting_addCommentPopupDlg = 'commenting_addCommentPopupDlg';
	concord.util.events.commenting_closeCommentPopupDlg = 'commenting_closeCommentPopupDlg';
	//spell check
	concord.util.events.spellcheck_cellname_changed = 'spellcheck_cellname_changed';	
	concord.util.events.spellcheck_focuscell_removed = 'spellcheck_focuscell_removed';
	concord.util.events.spellcheck_focussheet_removed = 'spellcheck_focussheet_removed';
	concord.util.events.spellcheck_focussheet_moved = 'spellcheck_focussheet_moved';
	
	concord.util.events.document_metadata_updated = 'document_metadata_updated'; 
	
concord.util.events.publish = function(topic, args) {
	return dojo.publish(topic, args);
};

concord.util.events.subscribe = function(topic, context, method) {
	return dojo.subscribe(topic, context, method);
};

//get event object if the handler doesn't have event argument. 
concord.util.events.getEvent = function() {
	// for ie
	if (dojo.isIE) {
		return window.event;
	}
	// for firefox
	var fc = concord.util.events.getEvent.caller;
	while (fc != null) {
		var earg = fc.arguments[0];
		if ((earg)
				&& (earg.constructor == Event || earg.constructor == MouseEvent || (typeof (earg) == "object"
						&& earg.preventDefault && earg.stopPropagation))) {
			return earg;
		}
		fc = fc.caller;
	}
	return null;
};