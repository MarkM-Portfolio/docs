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
define([], function() {
	
    var constants = {
        STYLE: {
            DEFAULT: "docDefaults"
        },

        CMDSTATE: {
            TRISTATE_ON: 1,
            TRISTATE_OFF: 2,
            TRISTATE_DISABLED: 0,
            TRISTATE_HIDDEN: 3
        },

        EDITMODE: {
            EDITOR_MODE: 0,
            HEADER_FOOTER_MODE: 1,
            FOOTNOTE_MODE: 2,
            ENDNOTE_MODE: 3
        },

        KEYS: {
            CTRL: 0x110000,
            SHIFT: 0x220000,
            ALT: 0x440000
        },

        MODELTYPE: {
            DOCUMENT: "document",
            HEADERFOOTER: "headerfooter",
            PARAGRAPH: "paragraph",
            TABLE: "table.table",
            ROW: "table.row",
            CELL: "table.cell",
            TEXT: "run.text",
            LIST: "list",

            // image
            IMAGE: "run.image", // Inline image
            TBIMAGE: "run.tbImage", // top&bottom image
            SQIMAGE: "run.sqImage", // square image
            FLIMAGE: "run.floatImage", // float image
            SIMPLEIMAGE: "run.simpleImage", // simple image in canvas/group

            // textbox/shape
            TXBX: "run.txbx", // inline textbox
            FLTXBX: "run.floatTxbx", // float textbox
            SQTXBX: "run.sqTxbx", // square text box
            TBTXBX: "run.tbTxbx", // top&bottom text box
            SIMPLETXBX: "run.simpleTxbx", // simpleTxbx in canvas/group

            // canvas/group
            CANVAS: "run.canvas", // inline canvas
            FLCANVAS: "run.floatCanvas", // float canvas
            SQCANVAS: "run.sqCanvas", // square canvas
            TBCANVAS: "run.tbCanvas", // top&bottom canvas
            SIMPLECANVAS: "run.simpleCanvas", // simpleCanvas in canvas/group

            // Alternate Content Run
            ALTCONTENT: "run.altContent",

            // TOC
            TOC: "toc",

            LINK: "run.hyperlink",
            RFOOTNOTE: "run.rfootNote",
            RENDNOTE: "run.rendNote",
            FIELD: "run.field",
            FOOTNOTE: "footnote",
            ENDNOTE: "endnote",
            NOTEITEM: "noteitem",
            PAGENUMBER: "run.pageNumber", // only in header/footer

            BOOKMARK: "run.bookMark",
            TRACKDELETEDREF: "run.trackDeletedRef", // virtual run to reference a deleted block (e.g. table)
            TRACKDELETEDOBJS: "run.trackDeletedObjs",
            TRACKOVERREF: "run.trackOverRef"
        },

        MSGCATEGORY: {
            // "Category" : "mc",
            "Content": "c", // Content change message category
            "Style": "s", // Style change message category
            "List": "l", // List change message category
            "Setting": "st", // Setting change message category
            "Relation": "r", // Relation change message category
            "Footnotes": "fn",
            "Endnotes": "en",
            "Meta": "mt" // Control message, ignore in client. It's used for
                // update total page number in server.
        },

        MSGTYPE: {
            "Text": "t", // Message category: Content, Relation(in Header,
            // footer). Text change message
            "Element": "e", // Message category: Content, Relation(in Header,
            // footer).
            "Attribute": "a", // Message category: Content, Relation(in Header,
            // footer). Change Paragraph/Table property. Such as
            // change paragraph alignment, heading
            "TextAttribute": "ta", // Message category: Content, Relation(in
            // Header, footer). Such as bold
            "Table": "tb", // Message category: Content, Relation(in Header,
            // footer).
            "TextComment": "tm", // Message category: Content.
            "Section": "sec", // Message category: Setting.
            "Setting": "stt", // Message category: Setting.
            "Task": "task",
            "KeyMessage": "k", // Message category: Setting, Relation. The key
            // change message. It will be used in modify Json
            // data.
            "List": "l", // Message category: List. The message was used to
            // change numbering.json content
            "Style": "st", // Message category: Style. Change style.json message,
            // like change style or crate style.
            "Meta": "mt",
            "Selection": "sel", // Message category: Content, Relation(in Header,
                // footer). When user selection changed.
            "CheckModel": "cm",
            "AcceptTrackChange" :"ctc"
        },

        ACTTYPE: {
            "DocsTrackChangeOn": "trackOn",
            "DocsTrackChangeOff": "trackOff",
            "InsertText": "it", // Message type: Text.
            "DeleteText": "dt", // Message type: Text.
            "InsertElement": "ie", // Message type: Element, Table.
            "DeleteElement": "de", // Message type: Element.
            "SetAttribute": "sa", // Message type: Attribute, Table.
            "SetTextAttribute": "sta", // Message type: TextAttribute.
            "InsertRow": "ir", // Message type: Table.
            "DeleteRow": "dr", // Message type: Table.
            "InsertColumn": "ic", // Message type: Table.
            "DeleteColumn": "dc", // Message type: Table.
            "MergeCells": "tmc", // Message type: Table.
            "SplitCells": "tsc", // Message type: Table.

            // Use the following action to change setting, relations, styles and
            // numbering
            "InsertKey": "ik", // Message type: KeyMessage. The action will add a
            // key in object
            "DeleteKey": "dk", // Message type: KeyMessage. No used yet. The action
            // will remove the key from object
            "ReplaceKey": "rk", // Message type: KeyMessage. The action will
            // replace the key content

            "InsertArray": "ia", // Message type: KeyMessage. The action will add
            // a object to an array
            "DeleteArray": "da", // Message type: KeyMessage. The action will
            // remove a object from an array

            // Numbering related message
            "AddList": "al", // Message type: List. Add numbering item in
            // numbering.json
            "IndentList": "il", // Message type: List. Indent list
            "ChangeType": "ct", // Message type: List. Change list type
            "ChangeStart": "cs", // Message type: List. Change list start

            // Style related message
            "AddStyle": "as", // Message type: Style. Add a style in style.json

            // Task related message
            "TaskUpdate": "tup", // Message type: update the task item
            "TaskDelete": "tdel", // Message type: delete the task item
            "SetParaTask": "sps", // Message type: Set Paragraph task
            "SetTableTask": "sts", // Message type: Set Table task

            // Comments related message
            "AddComment": "acmt", // Message type: TextComment.
            "DelComment": "dcmt", // Message type: TextComment.
            "UpdateComment": "ucmt", // Message type: TextComment.
            "DeleteSection": "deSec", // Message type: Section.
            "InsertSection": "iSec", // Message type: Section.
            "AddEvenOdd": "ieo", // Message type: Setting.
            "RemoveEvenOdd": "deo", // Message type: Setting.

            "PageCount": "pc", // The document's page count

            "SelectionChanged": "selc", // Message type: Selection, when selection changed
            
            "CheckModel": "cm",
            "AcceptTrackChange" :"ctc"
        },

        KEYPATH: {
            "Footnote": "footnote",
            "Endnote": "endnote",
            "Section": "sects"
        },

        EVENT: {
            TRACKCHANGE_ON: "trackChange_on",
            
            COEDIT_STARTED: "coedit_started",
            COEDIT_STOPPED: "coedit_stopped",
            COEDIT_USER_JOINED: "coedit_user_joined",
            COEDIT_USER_LEFT: "coedit_user_left",
            COEDIT_COLOR_UPDATE: "coedit_user_color_update",


            CMD_STATE_CHANGE: "command_state_change",

            SELECTION_CHANGE: "selection_change",

            BEFORE_SELECT: "beforeSelect",

            BEFORE_EXECCOMMAND: "before_execcommand",

            OPENLINK: "OpenLink",

            REMOVE_SELECT: "removeSelect",

            DOMCREATED: "DomCreated",

            PAGE_NUMBER_CHANGED: "PageNumberChanged",

            UPDATE_REFERENCE: "UpdateReference",

            PAGECREATED: "PageCreated",

            SHOWTOTALNUM: "freshTotalNum",
            FOCUSBACKFINDDLG: "focusBackFindReplaceDialog",

            EDITAREACHANGED: "editAreaChanged",

            /**
             * this event is fired after all controllers and models are loaded in editor.js
             */
            LOAD_READY: "LOAD_READY",

            /**
             * this event is fired before all controllers and models are loaded in editor.js
             */

            BEFORE_LOAD: "BEFORE_LOAD",

            /**
             * The event is fired after style load finished.
             */
            STYLE_LOADED: "STYLE_LOADED",

            /**
             * Load model and prelayout finished
             */
            PREMEASURE: "PrelayoutFinished",

            /**
             * After render the first part in partial loading mode.
             */
            FIRSTTIME_RENDERED: "FirstTimeRendered",

            /*
             * when the section is delete , notify the document view to update
             * 
             */
            UPDATECHANGESECTION: "UpdateChangeSection",

            UPDATEDELETESECTION: "UpdateDeleteSection",

            UPDATEINSERTSECTION: "UpdateInsertSection",

            DELETESECTION: "DeleteSection",

            INSERTSECTION: "InsertSection",

            //notify the refer element, such as footnote refer to update the id,
            UPDATEFNREFERID: "UpdateReferId",


            BEGINUPDATEDOCMODEL: "BeginUpdateDocModel",

            ENDUPDATEDOCMODEL: "EndUpdateDocModel",
            BEFORELEAVE: "beforeLeave",

            RESIZECOLUMN: "ResizeCol",
            RESIZECELL: "ResizeCell",
            RESIZEROW: "ResizeRow",
            RESIZETEXTBOX: "ResizeTextBox",

            RESIZETABLE: "ResizeTable",

            TBLDOMCHG: "TableDOMChange",
            CANCELRESIZE: "CalcelTableResize",

            REQUESTSPELLCHECKONPARA: "RequestSpellcheckOnPara",
            CREATEDNEWPARA: "CreatedNewParagraph",

            LEFTMOUSEDOWN: "LeftMouseDown",
            CURSORCOMMAND: "CursorCommand",

            // Batch change event, may be undo/redo/rollback/co-editing msg ...
            GROUPCHANGE_START: "GroupChangeEvent_Start",
            GROUPCHANGE_END: "GroupChangeEvent_End",

            // Switch page by scroll event
            SCROLLPAGE: "ScrollPage",
            PAGESCROLLED: "PageScrolled",
            PAGEONSCROLL: "PageScrolling",

            PAGELEFTCHANGED: "PageLeftChanged",

            MENTIONSDOMCREATED: "mentionsDomCreated"
        },

        TASK: {
            FLAG_TOP: 0x01,
            FLAG_BOTTOM: 0x02,
            FLAG_LEFT: 0x04,
            FLAG_RIGHT: 0x08
        },

        RUNMODEL: {
            TEXT_Run: "rPr",
            FIELD_Run: "fld",
            SIMPLE_FIELD_Run: "fldSimple",
            LINK_Run: "hyperlink",
            IMAGE: "img",
            TXBX: "txbx",
            SMARTART: "smartart",
            CANVAS: "wpc",
            GROUP: "wgp",
            BOOKMARK: "bmk",
            COMMENT: "cmt",
            FOOTNOTE: "fn",
            ENDNOTE: "en",
            TRACKDELETEDOBJS: "tcDelObjs",
            TRACKOVERREF: "trackOverRef"
        }
    };

    return constants;
});
