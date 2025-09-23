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
define(["writer/util/RangeTools",
    "writer/util/ModelTools",
    "writer/core/Range",
    "dojo/_base/lang",
    "dojo/string",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/on",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/_base/wai",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dijit/MenuSeparator",
    "dijit/PopupMenuItem",
    "dijit/PopupMenuBarItem",
    "dijit/registry",
    "concord/util/ApiEngine",
    "writer/constants",
    "concord/widgets/MessageBox",
    "concord/widgets/ConfirmBox",
    "concord/widgets/InputBox",
    "concord/widgets/ModelDialog",
    "writer/ui/sidebar/SidePane",
    "writer/ui/widget/MenuTooltip",
    "concord/util/acf",
    "concord/util/strings"
], function(RangeTools, ModelTools, Range, lang, string, i18nmenubar, on, array, dom, domConstruct, domClass, domStyle, wai, Menu, MenuItem, CheckedMenuItem, MenuSeparator, PopupMenuItem, PopupMenuBarItem, registry, ApiEngine, constants, MessageBox, ConfirmBox, InputBox, ModelDialog, SidePane, MenuTooltip, acf, strings) {

    var api = {
		MenuBarType: {
			POPUPMENUBAR :	1,
			POPUPMENU:	2,
			MENUITEM:	3,
			MENUSEPORATOR:	4
		},
		
		ModeVisible: {
			INVISIBLE:				0,
			EDITMODEVISIBLE:		1,
			OBSERVERMODEVISIBLE:	2,
			VIEWDRAFTMODEVISIBLE:	4,
			HTMLVIEWINVISIBLE:  	8  // this menu item is always visible in VIEWDRAFTMODE but invisible in HTMLVIEW
		},
		
        getDocType: function() {
    		var docType = "text";
    		return this._genResult(docType);
        },

        // Publish silently to create new file version
		_idocs_saveToRepository: function() {
			var editor = pe.lotusEditor;
			var data = {"changeSummary": ""};
    		editor.currentScene.publish(data);
    		
			return this._genResult();
		},
		
		// append custom fonts to fontname drop down
		_idocs_addFonts: function(list) {
			var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
			// var fontPlugin = editor.getPlugin("Font");
			var tempList = [];

			var fontNameMenu = registry.byId("D_m_FontName");
			array.forEach(fontNameMenu.getChildren(), function(child){
				tempList.push(child.label.toLowerCase());
			});
			
    		for (var i = 0; i < list.length; ++i) {
				var label = list[i];
				if (!label || typeof label != "string" || label.length == 0)
					continue;
			
				label = label.trim();
				label = acf.escapeXml(label);
				
				var found = false;
				var lowercaseLabel = label.toLowerCase();
				for (var j = 0; j < tempList.length; j++) {
					if (lowercaseLabel == tempList[j]) {
						found = true;
						break;
					}
				}
				if (found) continue;
				tempList.push(lowercaseLabel);
				
				var _mItem = null;
				var id = "D_i_FONT_" + label.replace(/ /g,"_");
				fontNameMenu.addChild(_mItem = new CheckedMenuItem({
		    		id: id,
		        	label: label,
		        	style: {fontFamily: label},
		        	_data: label,
		        	onClick: function() {
		        		pe.lotusEditor.execCommand("fontname", this._data);
		        	},
		        	dir: dirAttr
		    	}));
				wai.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
				
				// FIXME need to create its name style and put the style to fontNameStyles in font plugin
				// var name_style = new Style({'rFonts': {"ascii": label}});
                // fontPlugin.fontNameStyles[label] = name_style;
			}
			
			return this._genResult();
		},
        
        // The same code as the function being implemented in websheet/Menubar
        _createSubMenu: function(node, sub, dirAttr){
			if(!node._focusFirstUpdated)
			{
				var focusFirstChildMethod = node.focusFirstChild;
				node.focusFirstChild = function()
				{
					array.forEach(this.getChildren(), function(c){
						c && c._setSelected && c._setSelected(false);
					});
					focusFirstChildMethod.apply(this, arguments);
				};
				node._focusFirstUpdated = true;
			}
			var self = this;
			array.forEach(sub, function(widget) {
				var isShow = widget.isShow  != undefined ? widget.isShow: true;
				var _mItem = null;
				if(isShow){
					if(widget.type == self.MenuBarType.POPUPMENU) {
						var popupMenu;
						if(widget.popupMethod){
							var param = {id:widget.id};
							if(widget.label)
								param.label = widget.label;
							if(widget.templateString)
								param.templateString = widget.templateString;
							popupMenu = widget.popupMethod(param);
						}else{
							popupMenu = new Menu({ id: widget.id, dir: dirAttr});
							domClass.add(popupMenu.domNode,"lotusActionMenu");
				    		wai.setWaiState(popupMenu.domNode, "label", widget.label);
				    		domClass.add(popupMenu.domNode,widget.cssClass);
				    		self._createSubMenu(popupMenu, widget.sub, dirAttr);
						}
						var popupMenuItem = new PopupMenuItem({
								label: widget.label,
								id: widget.pid,
								popup: popupMenu,
								dir: dirAttr
				    		});
						if(widget.variable){
							if(widget.varIsMenu){
								pe[widget.variable] = popupMenu;
							}else{
								pe[widget.variable] = popupMenuItem;
							}
						}
						if(widget.event){
							array.forEach(widget.event, function(e){
							 	on(popupMenu, e.eventName, lang.hitch(this, e.eventFunc));
							});
						}
						wai.setWaiState(popupMenuItem.domNode, "label", widget.accLabel? widget.accLabel: widget.label);
						domStyle.set(popupMenuItem.arrowWrapper, 'visibility', '');
						node.addChild(popupMenuItem);
					}
					else if(widget.type == self.MenuBarType.MENUITEM) {
						var param={
					    	label: widget.label,
							disabled: widget.disable? widget.disable: false,
							id:  widget.id,
					    	onClick: function(){
					    		if(widget.privatecommand)
					    			widget.privatecommand();
					        	else
					        		pe.lotusEditor.execCommand(widget.command);
					    	},
					    	dir: dirAttr
						};
						if(widget.accelKey)
							param.accelKey = widget.accelKey;
						if(widget.iconClass)
							param.iconClass = widget.iconClass;
						if(widget.variable){
							if(widget.checkedMenuItem){
								param.checked = widget.checked? true:false;
								node.addChild(_mItem = pe[widget.variable] = new CheckedMenuItem(param));
							}
							else{
								node.addChild(_mItem = pe[widget.variable] = new MenuItem(param));
								if(widget.accLabel){
									wai.removeWaiState(pe[widget.variable].domNode, "labelledby");
						    		wai.setWaiState(pe[widget.variable].domNode, "label",widget.accLabel);
								}else
									wai.setWaiState(pe[widget.variable].domNode, "labelledby", pe[widget.variable].containerNode.id);
							}
						}else{
							if(widget.checkedMenuItem){
								param.checked = widget.checked? true:false;
								node.addChild(_mItem = new CheckedMenuItem(param));
							}
							else
								node.addChild(_mItem = new MenuItem(param) );
							if(widget.accLabel){
								wai.removeWaiState(_mItem.domNode, "labelledby");
						    	wai.setWaiState(_mItem.domNode, "label",widget.accLabel);
							}else
								wai.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
						}
						if(widget.style)
						{
							var children = node.getChildren();
							var addedMenuItem = children[children.length - 1];
							domStyle.set(addedMenuItem.containerNode, widget.style);
						}
						if(widget.tooltip && _mItem) {
							var w = _mItem;
							w.tooltip = new MenuTooltip({
					        	widget: w,
				    	    	ownerDocument: this.ownerDocument,
				        		_focusManager: this._focusManager,
				        		position: [widget.tooltip.pos]
							});
							w.connect(w, "uninitialize", function() {
								this.tooltip && this.tooltip.destroy();
							});
							w.tooltip.setTitleAck(widget.tooltip.tip, "");
						}
					}
					else if(widget.type == self.MenuBarType.MENUSEPORATOR) {
						node.addChild(new MenuSeparator());
					}
				}
			});
		},

        /*void*/configSubMenu: function(/*array*/menubarData, /*MenubarConfig*/widget, level) {
			var visibleMode = this.ModeVisible.EDITMODEVISIBLE;
			for (var i = 0; i < menubarData.length; i++) {
				var element = {};
				var item = menubarData[i];
				var type = item.type;
				if (type == "separator") {
					element.type = this.MenuBarType.MENUSEPORATOR;
					element.showMODE = visibleMode;
				} else if (type == "menuitem") {
					var label = item.label;
					var func = item.func;
				
					element.id = string.substitute("D_i_Add-ons_${0}_${1}", [level, label]);
					element.isShow = true;
					element.type = this.MenuBarType.MENUITEM,
					element.label = acf.escapeXml(label);
					element.showMODE = visibleMode;
					element.privatecommand = func;
				} else if (type == "menu") {
					var subMenu = item.sub;
					var label = subMenu.label;

		     		element.id = string.substitute("D_m_Add-ons_${0}_${1}", [level, label]);
 			 		element.pid = string.substitute("D_i_Add-ons_${0}_${1}", [level, label]);
 			 		element.isShow = true;
	 		    	element.type = this.MenuBarType.POPUPMENU; 
	 		    	element.label = acf.escapeXml(label);
	 		    	element.showMODE = visibleMode;
	 		    	element.sub = [];
	 		    
	 		    	this.configSubMenu(subMenu.elements, element.sub, ++level);
				}
			
				widget.push(element);
			}
		},
	
		/*void*/createSubMenu: function(widget) {
			var menubar = registry.byId("document_menubar"); // document specific menubar id
			if (!menubar) return;

			var isShow = widget.isShow  != undefined ? widget.isShow: true;
			if	(!isShow) return;

			var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
			if	(widget.type == this.MenuBarType.POPUPMENUBAR) {
				var popupmenubar = registry.byId(widget.id);
				if (popupmenubar)
					this._createSubMenu(popupmenubar, widget.sub, dirAttr);
				else {
					popupmenubar = new Menu({ id:  widget.id, dir: dirAttr });
					domClass.add(popupmenubar.domNode,"lotusActionMenu");
					domClass.add(popupmenubar.domNode,widget.cssClass);
					wai.setWaiState(popupmenubar.domNode, "label", widget.accLabel? widget.accLabel: widget.label);
					
					this._createSubMenu(popupmenubar, widget.sub, dirAttr);
				
					var helpMenu = menubar._getLast();
					menubar.removeChild(helpMenu);
					menubar.addChild(new PopupMenuBarItem({label: widget.label, id: widget.pid, popup: popupmenubar}));
					menubar.addChild(helpMenu);
				}
			}
		},
        
		_idocs_menu_addUi: function(/*array*/menubarData) {
			var label = i18nmenubar.addOnsMenu;

			var widget = {};
     		widget.id = string.substitute("D_m_Add-ons_0_${0}", [label]);
			widget.pid = string.substitute("D_i_Add-ons_0_${0}", [label]);
			widget.isShow = true;
			widget.type = this.MenuBarType.POPUPMENUBAR; 
			widget.label = label;
			widget.sub = [];
			widget.showMODE = this.ModeVisible.EDITMODEVISIBLE;

			this.configSubMenu(menubarData, widget.sub, 1);
			this.createSubMenu(widget);
		
			return this._genResult();
		},
	
		_idocs_ui_alert: function(title, message, okButtonOnly, domain, messageId) {
			var params = {message: message};
			var dialog;
			var productName = strings.getProdName();
			if (okButtonOnly) {
				params.callback = this._idocs_ui_alert_callback;
				params.cancelCallback = this._idocs_ui_alert_cancelCallback;
				dialog = new MessageBox(this, title ? title : productName, null, false, params);
			} else {
				params.callback = this._idocs_ui_confirm_callback;
				dialog = new ConfirmBox(this, title ? title : productName, null, true, params);
			}
			dialog.show();

			this.alert_domain = domain;
			this.alert_messageId = messageId;
			
			return null;
		},

		_idocs_ui_alert_cancelCallback: function(apiObj) {
			apiObj._idocs_ui_alert_callback(apiObj, true);
		},
	
		_idocs_ui_confirm_callback: function(apiObj, okBtnClicked) {
			apiObj._idocs_ui_alert_callback(apiObj, !okBtnClicked);
		},
		
		_idocs_ui_alert_callback: function(apiObj, cancelBtnClicked) {
			cancelBtnClicked = !!cancelBtnClicked;
    		var result = apiObj._genResult(!cancelBtnClicked);
    		
    		var domain = apiObj.alert_domain;
    		var id = apiObj.alert_messageId;
    		apiObj.responseApiCall(domain, id, result.status, result.detail);
    		
    		delete apiObj.alert_domain;
    		delete apiObj.alert_messageId;
		},

		_idocs_ui_prompt: function(title, message, domain, messageId) {
			var params = {message: message,
						callback: this._idocs_ui_prompt_callback,
						cancelCallback: this._idocs_ui_prompt_cancelCallback};
			var productName = strings.getProdName();
			var dialog = new InputBox(this, title ? title : productName, null, true, params);
			dialog.show();

			this.prompt_domain = domain;
			this.prompt_messageId = messageId;
		
			return null;
		},

		_idocs_ui_prompt_cancelCallback: function(apiObj) {
			apiObj._idocs_ui_prompt_callback(apiObj, null, true);
		},

		_idocs_ui_prompt_callback: function(apiObj, input, cancelBtnClicked) {
			cancelBtnClicked = !!cancelBtnClicked;
			var response = {button: !cancelBtnClicked};
			if (input) response.input = input;
    		var result = apiObj._genResult(response);
    		
    		var domain = apiObj.prompt_domain;
    		var id = apiObj.prompt_messageId;
    		apiObj.responseApiCall(domain, id, result.status, result.detail);
    		
    		delete apiObj.prompt_domain;
    		delete apiObj.prompt_messageId;
		},

		_idocs_ui_showDialog: function(userInterface) {
			var params = {content: userInterface.content};
			if (userInterface.width) params.width = userInterface.width;
			var productName = strings.getProdName();
			var title = userInterface.title;
			var dialog = new ModelDialog(this, title ? title : productName, null, false, params);
			dialog.show();

			return this._genResult();
		},
		
		_idocs_ui_showSidebar: function(userInterface) {			
			if (this._sidebar) {
				this._sidebar.close();
				if(registry.byId("idocs_sidebar_div"))
					registry.byId("idocs_sidebar_div").destroy();
				this._sidebar = null;
			}
            var editorFrame = dom.byId("editorFrame");
			var pNode = dom.byId("idocs_sidebar_div");
			if(!pNode)
				pNode = domConstruct.create("div",{id: "idocs_sidebar_div"});
			domConstruct.place(pNode, editorFrame, "before");

			var title = userInterface.title ? userInterface.title : "API Sidebar";
			this._sidebar = new SidePane({paneTitle: title}, pNode);			
			var sdRoot = this._sidebar.domNode;
			var contentNode = dojo.create("div", null, sdRoot);
			dojo.create("div", {innerHTML: userInterface.content}, contentNode);
			this._sidebar.toggle();
			return this._genResult();
		},

        _getSentences: function(text) {
            var arr = [];
            var sentence = "";
            for (var i = 0; i < text.length; i++) {
                var c = text.charAt(i);
                var nextChar = "";
                if (i < text.length - 1)
                    nextChar = text.charAt(i + 1);
                sentence += c;
                switch (c) {
                    // chinese period
                    case '\u3002':
                        if (nextChar != '\u3002') {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    case '\uFF1B':
                        // chinese ;
                        if (nextChar != '\uFF1B' && nextChar != '\u3002') {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    // chinese ?
                    case '\uFF1F':
                        if (nextChar != '\uFF1F' && nextChar != '\u3002') {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    // chinese !
                    case '\uFF01':
                        if (nextChar != '\uFF01' && nextChar != '\u3002') {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    case '!':
                        if (nextChar != '!' && nextChar != ".") {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    case ';':
                        if (nextChar != ';' && nextChar != ".") {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    case '?':
                        if (nextChar != '?' && nextChar != ".") {
                            arr.push(sentence);
                            sentence = "";
                        }
                        break;
                    case '.':
                        if (nextChar != "." && (!(nextChar >= '0' && nextChar <= '9'))) {
                            // not number, not "."
                            arr.push(sentence);
                            sentence = "";
                        }
                }
            }
            if (sentence)
                arr.push(sentence);
            if (arr.length == 0)
                arr.push("");
            return arr;
        },

        getSelectedTextInScope: function(scope) {
            // scope:['paragraph'|'sentence'|'object']
            // if selection is collapsed, then get text of the enclosing scope; 
            // else if selection <= scope, then get text of selection; 
            // else if selection cross multiple scopes, then get text of intersection of selection and first scope. 
            // No selection change here.
            if (!scope)
                scope = "paragraph";
            if (scope != "paragraph" && scope != "sentence")
                return this._genError("not supported scope, just support paragraph(default) or sentence");
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();

            // maybe multiple range (across table-cell)
            // maybe select multiple text/
            var range = ranges[0];

            var startParaPos = range.getStartParaPos();
            var startPara = startParaPos.obj;
            var startParaIndex = startParaPos.index;

            if (scope == 'paragraph') {
                return this._genResult(startPara.getVisibleText());
            }
            else if (scope == 'sentence') {
                var text = startPara.getVisibleText();
                // Note, this sentences break is very immature.
                var sentences = this._getSentences(text);
                if (sentences.length == 1)
                    return this._genResult(sentences[0]);
                var start = 0;
                var sen = null;
                for (var i = 0; i < sentences.length; i++) {
                    sen = sentences[i];
                    var count = sen.length;
                    if (startParaIndex >= start && startParaIndex < start + count) {
                        break;
                    }
                    start += count;
                }
                return this._genResult(sen);
            }
        },

        selectTextInScope: function(scope, direction) {
            //scope:['paragraph'|'sentence'|'object'], direction: ['self'|'nextSibling'];
            /*
            *Change the selection to one single scope and highlight and scroll into view. 
            *If direction = self, then the scope calculation is same as "getSelectedTextInScope"; 
            *else if direction = nextSibling, then next full scope.
            */
            if (!scope)
                scope = "paragraph";
            if (scope != "paragraph" && scope != "sentence")
                return this._genError("not supported scope, just support paragraph(default) or sentence");

            if (!direction)
                direction = "self";
            if (direction != "self" && direction != "nextSibling")
                return this._genError("not supported direction, self or nextSibling");

            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];

            var startParaPos = range.getStartParaPos();
            var startPara = startParaPos.obj;
            var startParaIndex = startParaPos.index;
            var cRange = new Range({
                obj: {}
            }, {
                    obj: {}
                }, range.rootView);
            var thePara = startPara;
            if (scope == 'paragraph') {
                if (direction == "nextSibling") {
                    var filterFunc = function(m) {
                    	return m.modelType == startPara.modelType && (!m.isVisibleInTrack || m.isVisibleInTrack());
                    };
                    thePara = ModelTools.getNext(startPara, filterFunc);
                    if (thePara == startPara)
                        return false;
                }
                if (thePara) {
                    RangeTools.selectToEditStart(cRange, thePara);
                    RangeTools.selectToEditEnd(cRange, thePara);
                    selection.selectRanges([cRange]);
                }
            }
            else if (scope == 'sentence') {
                var thePara = startPara;
                var text = thePara.getVisibleText();
                // Note, this sentences break is very immature.
                var sentences = this._getSentences(text);
                var start = 0;
                var sen = null;
                var senStart = 0;
                var senIndex = 0;
                for (var i = 0; i < sentences.length; i++) {
                    sen = sentences[i];
                    senStart = start;
                    senIndex = i;
                    var count = sen.length;
                    if (startParaIndex >= start && startParaIndex < start + count) {
                        break;
                    }
                    start += count;
                }

                if (direction == "nextSibling") {
                    if (senIndex != sentences.length - 1) {
                        senStart += sen.length;
                        sen = sentences[i + 1];
                    }
                    else {
                        // already the last sentence.
                        var filterFunc = function(m) {
                            return m.modelType == startPara.modelType;
                        };
                        thePara = ModelTools.getNext(startPara, filterFunc);
                        if (!thePara || thePara == startPara)
                            return false;
                        sentences = this._getSentences(thePara.getVisibleText());
                        senStart = 0;
                        sen = sentences[0];
                    }
                }

                var run = thePara.byIndex(thePara.getVisibleIndex(senStart), null, true);
                var run2 = thePara.byIndex(thePara.getVisibleIndex(senStart + sen.length), null, true);
                var cRange = new Range({
                    obj: run,
                    index: senStart - run.start
                }, {
                        obj: run2,
                        index: senStart + sen.length - run2.start
                    }, range.rootView);
                selection.selectRanges([cRange]);
                selection.scrollIntoView();
            }
            return this._genResult();
        },

        setTextInScope: function(string, scope) {
            if (!scope)
                scope = "paragraph";
            if (scope != "paragraph" && scope != "sentence")
                return this._genError("not supported scope, just support paragraph(default) or sentence");

            if (this.selectTextInScope(scope)) {
                var shell = pe.lotusEditor.getShell();
                shell.insertText(string);
                return this._genResult();
            }
            return this._genError("operation failed");
        },

        _text_clearChangeHistory: function() {
        	pe.scene.clearChangeHistory && pe.scene.clearChangeHistory();
        },

        _text_getDocProperty: function(propType) {
        	var propValue = "";
        	if(propType)
        	{
        		if(propType == "title")
        			propValue = DOC_SCENE.title;
        	}

            if (propValue.length == 0)
                return this._genError("not supported property.");
                
            return this._genResult(propValue);
        },

        _text_getCursor: function() {
        	var cursor = {};
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];

            var startParaPos = range.getStartParaPos();
            var startObj = startParaPos.obj;
            if(startObj.id) {
	            cursor.id = startObj.id;
	            cursor.offset = startParaPos.index;
            }
            return this._genResult(cursor);
         },

         _text_getSelection: function() {
         	var sel = {};
             var selection = pe.lotusEditor.getSelection();
             var ranges = selection.getRanges();
             var range = ranges[0];

             var startParaPos = range.getStartParaPos();
             var startObj = startParaPos.obj;
             if(startObj && startObj.id)
            	 sel.start = {"id":startObj.id, "offset":startParaPos.index};

             if(range.isCollapsed())
            	 sel.isCollapsed = true;
             else {
                 var endParaPos = range.getEndParaPos();
                 var endObj = endParaPos.obj;
                 if(endObj && endObj.id)
                	 sel.end = {"id":endObj.id, "offset":endParaPos.index};
             }
             return this._genResult(sel);
          },

         _text_setCursor: function(position) {
         	var editor = pe.lotusEditor;
         	var nPos = this.fixPosition(position);
         	var m = this.getPosModel(nPos);
         	if(m) {
                var selection = editor.getSelection();
                var ranges = selection.getRanges();
                var range = ranges[0];
                if(nPos.offset == null)
                	nPos.offset = 0;
                if (ModelTools.isParagraph(m)) {
                    range.moveToPosition(m, nPos.offset);
                    range.collapse();
                    editor.getSelection().selectRanges([range]);
//	                selection.scrollIntoView();
         		} else
                	return this._genError("Currently only paragraph position is supported!");
         	} else
         		return this._genError("Can not find the position!");

         	return this._genResult();
          },

          _text_setTrackChange: function(status) {
        	  pe.scene.switchTrackChanges && pe.scene.switchTrackChanges(status);
          },

          _text_setSelection: function(scope){
          	  var editor = pe.lotusEditor;
          	  var nScope = this.fixRange(scope);
        	  var startM = nScope && this.getPosModel(nScope.start);
        	  var endM = nScope && this.getPosModel(nScope.end);
        	  if(startM) {
        		  if(endM) {
        	            var selection = editor.getSelection();
        	            var ranges = selection.getRanges();
        	            var range = ranges[0];

                        var cRange = new Range({
                            obj: startM,
                            index: nScope.start.offset
                        }, {
                            obj: endM,
                            index: nScope.end.offset
                        }, range.rootView);
                        selection.selectRanges([cRange]);
                        selection.scrollIntoView();
                        return this._genResult();
        		  } else
        			 return this._text_setCursor(nScope.start); 
        	  }
        	  return this._genError("Can not find the position! Currently only paragraph position is supported!");
          },

          _text_body_appendParagraph: function(text){
        	  var doc = pe.lotusEditor.document;
        	  var para = doc.appendParagraph(text);
        	  var pId = para && para.id;
        	  return this._genResult(pId);
          },

          _text_body_getParagraphs: function(){
        	  var paras = [];
        	  var models = window.layoutEngine.rootModel.getParagraphs();
        	  if(models && models.length > 0) {
        		  array.forEach(models, function(para){if(para.id) paras.push(para.id);});
        	  }
        	  return this._genResult(paras);
          },

          _text_body_insertParagraph: function(index, text){
        	  if(index < 1)
        		  return this._genError("Incorrect value of index!");
        	  var doc = pe.lotusEditor.document;
        	  var para = doc.insertParagraph((index - 1), text);
        	  var pId = para && para.id;
        	  return this._genResult(pId);
          },

          _text_containerElement_getChild: function(container, index) {
        	  var m = this.getContainerModel(container);
        	  if(m) {
        		  var child = m.container && m.container.getByIndex(index - 1);
        		  if(child) {
        			  if(child.id)
        				  return this._genResult({"id":child.id,"type":this.getElementType(child.modelType)});

       				  return this._genResult({"id":container.id,"offset":child.start,"len":child.length,"type":this.getElementType(child.modelType)});
        		  }

        		  return this._genResult();
        	  }
        	  return this._genError("Can not find the element!");
          },

          _text_containerElement_getChildIndex: function(container, child) {
        	  var m1 = this.getContainerModel(container);
        	  if(m1) {
        		  var m2 = null, index = -1;
        		  if(child.isContainer)
        			  m2 =  this.getContainerModel(child);
        		  else
        			  m2 = m1.byIndex && m1.byIndex(child.start);

       			  if(m1 != null)
       				  index = m1.container && m1.container.indexOf(m2);

        		  return this._genResult(((index >=0) ? (index + 1):index));
        	  }
        	  return this._genError("Can not find the element!");        	  
          },


          _text_containerElement_getNumChildren: function(container) {
        	  var m = this.getContainerModel(container);
        	  if(m && m.container)
           		  return this._genResult(m.container.length());

        	  return this._genError("Can not find the element!");
          },

          _text_element_getNextSibling: function(obj) {
        	  var m = null,pid = null;
        	  if (obj.isContainer)
        		  m = this.getContainerModel(obj);
        	  else {
        		  var parent = obj.parent && this.getContainerModel(obj.parent);
        		  if(parent) {
        			  pid = parent.id;
        			  m = parent.byIndex && parent.byIndex(obj.start);
//        			  if((m.start + m.length) > (obj.start + obj.len)) {
//        				  return this._genResult({"id":pid,"offset":(obj.start + obj.len),"len":(m.length - (obj.start - m.start) - obj.len),"type":this.getElementType(m.modelType)});
//        			  }
        		  }
        	  }

        	  if(m) {
        		  var next = ModelTools.nextSibling(m);
        		  if(next) {
        			  if(next.id)
        				  return this._genResult({"id":next.id,"type":this.getElementType(next.modelType)});
        			  else if((next.start != null) && (next.length != null)){
        				  return this._genResult({"id":pid,"offset":next.start,"len":next.length,"type":this.getElementType(next.modelType)});
        			  }
        		  }
        		  return this._genResult();
        	  }        		  
        	  return this._genError("Can not find the element!");
          },

          _text_element_getParent: function(obj) {
        	  var m = this.getContainerModel(obj);
        	  if(m) {
        		  var parent = (obj.isContainer ? m.getParent() : m);
        		  if(parent)
        			  return this._genResult({"id":parent.id,"type":this.getElementType(parent.modelType)});
        		  return this._genResult();
        	  }

        	  return this._genError("Can not find the element!");
          },

          _text_element_getPrevSibling: function(obj) {
        	  var m = null,pid = null;
        	  if (obj.isContainer)
        		  m = this.getContainerModel(obj);
        	  else {
        		  var parent = obj.parent && this.getContainerModel(obj.parent);
        		  if(parent) {
        			  pid = parent.id;
        			  m = parent.byIndex && parent.byIndex(obj.start);
//        			  if(m.start < obj.start) {
//        				  return this._genResult({"id":pid,"offset":m.start,"len":(obj.start - m.start),"type":this.getElementType(m.modelType)});
//        			  }
        		  }
        	  }
        	  if(m) {
        		  var prev = ModelTools.previousSibling(m);
        		  if(prev) {
        			  if(prev.id)
        				  return this._genResult({"id":prev.id,"type":this.getElementType(prev.modelType)});
        			  else if((prev.start != null) && (prev.length != null)){
        				  return this._genResult({"id":pid,"offset":prev.start,"len":prev.length,"type":this.getElementType(prev.modelType)});
        			  }
        		  }
        		  return this._genResult();
        	  }
        	  return this._genError("Can not find the element!");
          },

          _text_paragraph_appendText: function(pId, text){
          	  var editor = pe.lotusEditor;
        	  var targetPara = ModelTools.getModelById(pId);
        	  if(targetPara){
                  var selection = editor.getSelection();
                  var ranges = selection.getRanges();
                  var range = ranges[0];
                  range.moveToPosition(targetPara, ModelTools.getLength(targetPara));
                  range.collapse();
                  var shell = editor.getShell();
//                  pe.scene.setAutoTextMerge(false);
                  shell.insertText(text);
//                  pe.scene.setAutoTextMerge(true);
                  return this._genResult();	  
        	  }
        	  return this._genError("Can not find the paragraph!");
          },

          _text_paragraph_setText: function(pId, text){
          	  var editor = pe.lotusEditor;
        	  var targetPara = ModelTools.getModelById(pId);
        	  if(targetPara){
                  var selection = editor.getSelection();
                  var ranges = selection.getRanges();
                  var range = ranges[0];
                  var cRange = new Range({
                      obj: {}
                  }, {
                          obj: {}
                      }, range.rootView);
                  RangeTools.selectToEditStart(cRange, targetPara);
                  RangeTools.selectToEditEnd(cRange, targetPara);
                  selection.selectRanges([cRange]);
                  var shell = editor.getShell();
                  if(!text || text.length ==0)
                	  shell.deleteText();
                  else {
//                      pe.scene.setAutoTextMerge(false);
                      shell.insertText(text);
//                      pe.scene.setAutoTextMerge(true);
                  }
                  return this._genResult();	  
        	  }
        	  return this._genError("Can not find the paragraph!");
          },

          _text_position_insertText: function(position, text){
              var editor = pe.lotusEditor;
              var nPos = this.fixPosition(position);              
        	  var moveCursor = this._text_setCursor(nPos);
        	  if(moveCursor.status == "error")
        		  return moveCursor;

              var shell = editor.getShell();
//              pe.scene.setAutoTextMerge(false);
              shell.insertText(text);
//              pe.scene.setAutoTextMerge(true);
              return this._genResult();	  
           },

           _text_text_getText: function(container, startOffset, length){
        	   var txtArry = this.getTextArry(container, startOffset, length);
        	   var ret = "";
        	   for(var i=0;i<txtArry.length;i++) {
        		   ret = ret.concat(txtArry[i]);
        	   }
               return this._genResult(ret);
            },

            _text_text_setText: function(range, text){
              var editor = pe.lotusEditor;
         	  var moveCursor = this._text_setSelection(range);
         	  if(moveCursor.status == "error")
         		  return moveCursor;

               var shell = editor.getShell();
               if(!text || text.length ==0)
             	  shell.deleteText();
               else {
//                   pe.scene.setAutoTextMerge(false);
                   shell.insertText(text);
//                   pe.scene.setAutoTextMerge(true);            	   
               }
               return this._genResult();
            },

           getPosModel: function(position) {
        	   return position && this.getContainerModel(position.element);
           },

           getContainerModel: function(container) {
        	   var m = null;
        	   if(container && container.isContainer) {
        		   if(container.type == "body")
        			   m = pe.lotusEditor.document;
        		   else
        			   m = ModelTools.getModelById(container.id);
        	   }  
        	   return m;
           },

           getElementType: function(modelType) {
        	   var ret = 0;
        	   if(modelType == "document")
        		   ret = 1 << 1;
        	   else if (modelType == "paragraph")
        		   ret = 1 << 2;
        	   else if (modelType == "run.text")
        		   ret = 1 << 3;
        	   else
        		   ret = 1 << 10;
        	   return ret;
           },

           getTextArry: function(container, startOffset, length) {
        	   if(!container) return [];
        	   var arry = [];
        	   var m = this.getContainerModel(container);
        	   if(m) {
        		   var paras = m.getParagraphs && m.getParagraphs();
        		   startOffset = (startOffset > 0 ? parseInt(startOffset) : 0);
        		   length = (length > 0 ? parseInt(length) : null) ;
        		   var cOffset = 0, cLen = length, on = false;
        		   for (var i=0;i<paras.length;i++) {
        			   var para = paras[i];
        			   if(!para.text)
        				   continue;
        			   var text = para.text;
        			   var l = text.length;
        			   if(on) {
        				   if(cLen == null){
        					   arry.push(text);
        				   } else {
            				   if(cLen > l) {
            					   arry.push(text);
            					   cLen = cLen - l;
            				   } else {
            					   arry.push(text.substr(0, cLen));
            					   break;
            				   }        					   
        				   }
        			   } else {
            			   if((cOffset + l) >= startOffset) {
            				   var start = (startOffset - cOffset);
            				   if((cLen != null) && ((l - start) >= cLen)) {
            					   arry.push(text.substr(start, cLen));
            					   break;
            				   } else {
            					   if(start > 0)
            						   arry.push(text.substr(start));
            					   else
            						   arry.push(text);
	            				   on = true;
	            				   if(cLen != null)
	            					   cLen = length - (l - start);
            				   }
            			   }
        			   }
       				   cOffset+=l;
        		   }
        	   }
        	   return arry;
           },
           fixRange: function(range) {
        	   if(!range || (range && range.fixed))
        		   return range;

        	   var newRange = {};
        	   newRange.start = this.fixPosition(range.start);
        	   newRange.end = this.fixPosition(range.end);
        	   newRange.fixed = true;
        	   return newRange;
           },
           fixPosition: function(position) {
        	   if(!position || position.fixed)
        		   return position;

        	   var newPosition = {};
        	   if(position) {
        		   var m = this.getPosModel(position);
               	   if(ModelTools.isParagraph(m))
               		newPosition = position;
            	   else {
            		   var p = m.getParaByTextOffset && m.getParaByTextOffset(position.offset);
            		   if(p && p.para) {
            			   newPosition.element = {"id":p.para.id};
            			   newPosition.offset = p.offset;
            		   }
            	   }
               	newPosition.fixed = true;
        	   }
        	   return newPosition;
           }
    };

    lang.mixin(api, ApiEngine.prototype);

    api.configure();
    api.startListener();

    return api;
});