dojo.provide("writer.core.Event");

dojo.declare("writer.core.Event", null, {
	_type : null,	// event type
    data: null,
	constructor: function(type, data) {
		this._type = type;
		this.data = data;
	}

});

if(!writer.EVENT)
	writer.EVENT = {};

writer.EVENT.COEDIT_STARTED = "coedit_started";
writer.EVENT.COEDIT_STOPPED = "coedit_stopped";
writer.EVENT.COEDIT_USER_JOINED = "coedit_user_joined";
writer.EVENT.COEDIT_USER_LEFT = "coedit_user_left";
writer.EVENT.COEDIT_COLOR_UPDATE = "coedit_user_color_update";


writer.EVENT.CMD_STATE_CHANGE = "command_state_change";

writer.EVENT.SELECTION_CHANGE = "selection_change";

writer.EVENT.BEFORE_SELECT = "beforeSelect";

writer.EVENT.BEFORE_EXECCOMMAND ="before_execcommand";
	
writer.EVENT.OPENLINK = "OpenLink";

writer.EVENT.REMOVE_SELECT = "removeSelect";

writer.EVENT.DOMCREATED = "DomCreated";

writer.EVENT.PAGE_NUMBER_CHANGED = "PageNumberChanged";

writer.EVENT.UPDATE_REFERENCE = "UpdateReference";

writer.EVENT.PAGECREATED = "PageCreated";

writer.EVENT.SHOWTOTALNUM = "freshTotalNum";
writer.EVENT.FOCUSBACKFINDDLG = "focusBackFindReplaceDialog";

writer.EVENT.EDITAREACHANGED = "editAreaChanged";

/**
 * this event is fired after all controllers and models are loaded in editor.js
 */
writer.EVENT.LOAD_READY = "LOAD_READY";

/**
 * this event is fired before all controllers and models are loaded in editor.js
 */

writer.EVENT.BEFORE_LOAD = "BEFORE_LOAD";

/**
 * The event is fired after style load finished.
 */
writer.EVENT.STYLE_LOADED = "STYLE_LOADED";

/**
 * Load model and prelayout finished
 */
writer.EVENT.PREMEASURE = "PrelayoutFinished";

/**
 * After render the first part in partial loading mode.
 */
writer.EVENT.FIRSTTIME_RENDERED = "FirstTimeRendered";

/*
 * when the section is delete , notify the document view to update
 * 
*/
writer.EVENT.UPDATECHANGESECTION = "UpdateChangeSection";

writer.EVENT.UPDATEDELETESECTION = "UpdateDeleteSection";

writer.EVENT.UPDATEINSERTSECTION = "UpdateInsertSection";

writer.EVENT.DELETESECTION = "DeleteSection";

writer.EVENT.INSERTSECTION = "InsertSection";

//notify the refer element, such as footnote refer to update the id;
writer.EVENT.UPDATEFNREFERID  = "UpdateReferId";


writer.EVENT.BEGINUPDATEDOCMODEL = "BeginUpdateDocModel";

writer.EVENT.ENDUPDATEDOCMODEL = "EndUpdateDocModel";
writer.EVENT.BEFORELEAVE = "beforeLeave";

writer.EVENT.RESIZECOLUMN = "ResizeCol";
writer.EVENT.RESIZECELL = "ResizeCell";
writer.EVENT.RESIZEROW = "ResizeRow";
writer.EVENT.RESIZETEXTBOX = "ResizeTextBox";

writer.EVENT.RESIZETABLE = "ResizeTable";

writer.EVENT.TBLDOMCHG = "TableDOMChange";
writer.EVENT.CANCELRESIZE="CalcelTableResize";
// Reference from CK/core/dom/event.js
//For the followind constants, we need to go over the Unicode boundaries
//(0x10FFFF) to avoid collision.

/**
* CTRL key (0x110000).
* @constant
* @example
*/
writer.CTRL = 0x110000;

/**
* SHIFT key (0x220000).
* @constant
* @example
*/
writer.SHIFT = 0x220000;

/**
* ALT key (0x440000).
* @constant
* @example
*/
writer.ALT = 0x440000;

writer.EVENT.REQUESTSPELLCHECKONPARA = "RequestSpellcheckOnPara";
writer.EVENT.CREATEDNEWPARA = "CreatedNewParagraph";

writer.EVENT.LEFTMOUSEDOWN = "LeftMouseDown";
writer.EVENT.CURSORCOMMAND = "CursorCommand";

// Batch change event, may be undo/redo/rollback/co-editing msg ...
writer.EVENT.GROUPCHANGE_START = "GroupChangeEvent_Start";
writer.EVENT.GROUPCHANGE_END   = "GroupChangeEvent_End";

// Switch page by scroll event
writer.EVENT.SCROLLPAGE = "ScrollPage";
writer.EVENT.PAGESCROLLED = "PageScrolled";