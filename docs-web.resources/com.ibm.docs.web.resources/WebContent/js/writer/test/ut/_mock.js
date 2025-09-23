DOC_SCENE = {}
g_locale = "en"
contextPath = "";
g_bidiOn = false;

if (!window.pe)
    pe = {};

if (!pe.scene)
    pe.scene = {
		coedit: false,
        cursorDecEnabled: false,
        isSingleMode: function() {
            return true;
        },
		isNote: function(){return false},
        editorLeft: null,
        getEditorLeft: function() {
            return pe.scene.editorLeft;
        },
        setEditorLeft: function(left) {
            pe.scene.editorLeft = left;
        },
        isHTMLViewMode: function() {
            return false;
        },
        getEditorStore: function()
        {
        	return null;
        },
        isIndicatorAuthor : function() {
			return true
		},
		getUsersColorStatus : function() {
			return true
		},
        addResizeListener: function() {},
        getSession : function()
        {
        	return this.session;
        }
    };

if (!pe.scene.session) {
    pe.scene.session = {
    	waitingList: [],
		isSingleMode: function() {
            return true;
        },
        sendMessage: function() {},
        createMessage:function(isControl, asControl){
        	var msg = new Object();
        	if (isControl)
        	{
        		msg.isCtrl = true;
        	}
        	if (asControl)
        	{
        		msg.asCtrl = true;
        	}
        	return msg;
    	}
    };
}

define([
    "dojo/ready",
    "dojo/dom-construct",
    "writer/json",
    "writer/util/FontTools",
    "writer/controller/LayoutEngine",
    "writer/controller/UpdateManager",
    "concord/beans/EditorStore",
    "dojo/domReady!"
], function(ready, domConstruct, w, FontTools, LayoutEngine, UpdateManager, EditorStore) {

    pe.lotusEditor = {
        _commands: [],
        focus: function(){},
        getDefaultTextStyle: function() {
            return null
        },
        getEditorDoc: function() {
            return document.body
        },
        isEndnoteEditing: function() {
            return false;
        },
        isFootnoteEditing: function() {
            return false
        },
        isHeaderFooterEditing: function() {
            return false
        },
        getCommand: function() {
            return {
                setState: function() {}
            }
        },
        addCommand: function() {},
        editorHandlers: [],
        setting: {
            getSectionLength: function() {
                return 0;
            },
            getDefaultDirection: function() {
                return "ltr"
            },
            setImportFormat: function() {

            },
            isOdtImport: function() {
                return null
            }
        },

        getDefaultParagraphStyle: function() {
            return null;
        },
        getRefStyle: function() {
            return null;
        },
        getScale: function(){return 1}
    }

    pe.lotusEditor.layoutEngine = new LayoutEngine(pe.lotusEditor);
    pe.lotusEditor.updateManager = new UpdateManager();
    pe.lotusEditor.undoManager = {
        addUndo: function() {}
    };
    pe.lotusEditor.indicatorManager = {
        drawUserSelections: function() {}
    }
    pe.lotusEditor.getEditor = function() {
        return this;
    };
    pe.lotusEditor.getScale = function() {
        return 1;
    };
    window.layoutEngine = pe.lotusEditor.layoutEngine;

    domConstruct.create("iframe", {
        id: "measureFrame",
        style: "position:absolute;top:-1000px;left:-1000px",
        src: 'blank.html'
    }, document.body);

    return {};
});
