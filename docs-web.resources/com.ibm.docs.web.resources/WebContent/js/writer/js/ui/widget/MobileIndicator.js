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
define([
    "dojo/_base/fx",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/on",
    "writer/util/ModelTools",
    "writer/model/comments/CommentService",
], function(fx, lang, declare, array, dom, domConstruct, domStyle, domClass, on, ModelTools, CommentService) {

    var MobileIndicator = declare("writer.ui.widget.MobileIndicator",
        null, {
            // EditShell
            _shell: null,
            _relatedNode: null,
            _domNode: null,
            
            _visible: null,
            _className: "mobileIndicator",     
            _color: "#2a7bda",
            _INDICATOR_WIDTH: 20,

            _isSelection: false,
            // event registration 
            _connects: null, // indicator touch down
            _docConnects: null, // indicator touch up/move events



            //selection
            _isLeft: false,

            // below offset used to adjust the selection indicatior touched pos to mobileSelection pos 
            _offsetX: 0,
            _offsetY: 0,

            //cursor
            _cursorWidth: 2,
            _FIX_OFFSET_TOP: 4,         
            _cursorInfo: null,
            _MOVE_OFFSETX: 6,
            _moveInitX: null,
            _moveInitY: null,
            _touchScreenX: null,
            _touchScreenY: null,
            _move: false,

            constructor: function(createParam) {
                this._shell = createParam.shell;
                if (createParam.relatedNode) {
                    this._relatedNode = createParam.relatedNode;
                }
                 if (createParam.isSelection) {
                    this._isSelection = createParam.isSelection;
                }
                if (createParam.className) {
                    this._className = createParam.className;
                }
                if (createParam.visible) {
                	this._visible = true;
                }
                if (createParam.color) {
                    this._color = createParam.color;
                }
                this._connects = [];
                this._docConnects = [];
                var touchDown = "_onCursorIndicatorDown",
                    classSuffix= "",
                    radius= "50% 0 50% 50%",
                    left = 0,
                    top =0;
                if (this._isSelection) {
                    if (createParam.isLeft) {
                        this._isLeft = true;
                    }

                    left = this._isLeft ? - this._INDICATOR_WIDTH : 0;
                    if (createParam.top) {
                        top = createParam.top;
                    }
                    if (createParam.left) {
                        left += createParam.left;
                    }
    
                    this._offsetY = - this._INDICATOR_WIDTH;
                    classSuffix = this._isLeft ? "Left" : "Right";
                    radius = this._isLeft? "50% 0 50% 50%" : "0 50% 50% 50%";
                    touchDown = "_onSelectionIndicatorDown";
                    if (this._shell && this._relatedNode) {
                        this._domNode = domConstruct.create("div", {
                            className: this._className + classSuffix,
                            "style": "position:absolute" +
                            ";z-index:50000" +
                            ";background-color:" + this._color +
                            ";border-radius:" + radius +
                            ";visibility:" + (this._visible? "visible" : "hidden") +                      
                            ";width: 20px" +
                            ";height:20px" +
                            ";top:" + top + "px" +
                            ";left:" + left + "px"
                            });
                        domConstruct.place(this._domNode, this._relatedNode, "after");
                        this._connects.push(on(this._domNode, "touchstart", lang.hitch(this, touchDown)));
                    }
                    
                } else {
                    if (createParam.cursorWidth) {
                        this._cursorWidth = createParam.cursorWidth;
                    }
                    top = this._FIX_OFFSET_TOP;
                    left = (- (this._cursorWidth + this._INDICATOR_WIDTH)/2);
                    radius += ";transform: rotate(-45deg)";
                    if (this._shell && this._relatedNode) {
                        this._domNode = domConstruct.create("div", {
                            className: this._className + classSuffix,
                            "style": "position:absolute" +
                            ";z-index:50000" +
                            ";background-color:" + this._color +
                            ";border-radius:" + radius +
                            ";visibility:" + (this._visible? "visible" : "hidden") +                      
                            ";width: 20px" +
                            ";height:20px" +
                            ";top:" + top + "px" +
                            ";left:" + left + "px"
                            }, this._relatedNode);
                        
                        this._connects.push(on(this._domNode, "touchstart", lang.hitch(this, touchDown)));
                       
                    }                   
                };
            },

            /*
             * Render
             */
            updateDOM: function(updateParam) {

                if (updateParam) {
                    if (this._isSelection) {
                        if (!isNaN(updateParam.left)) {
                            domStyle.set(this._domNode, "left", updateParam.left + "px");
                        }
                        if (!isNaN(updateParam.top)) {
                            domStyle.set(this._domNode, "top", updateParam.top + "px");
                        }
                        
                    } else {
                        if (!isNaN(updateParam.length)) {
                            domStyle.set(this._domNode, "top", (updateParam.length + this._FIX_OFFSET_TOP) + "px");
                        }
    
                        if (!isNaN(updateParam.thickness)) {
                            domStyle.set(this._domNode, "left", (- (updateParam.thickness + this._INDICATOR_WIDTH)/2) + "px");
                        }
                    }
                } 
            },
 
            showIndicator: function() {
                domStyle.set(this._domNode, "visibility", "visible");
                this._visible = true;
            },
            hideIndicator: function() {
            	domStyle.set(this._domNode, "visibility", "hidden");
                this._visible = false;
            },
            isVisible: function() {
                return this._visible;
            },
            // for cursor indicator move
            _onCursorIndicatorDown: function(event) {
                // disable context menu
                pe.lotusEditor.getShell().dismissContextMenu();
                var selection = this._shell.getSelection();
                if (selection)
                    selection.getCursor().show(true);
                this._moveInitX = event.clientX || event.changedTouches[0].clientX;
                this._moveInitY = event.clientY || event.changedTouches[0].clientY;
                if (concord.util.browser.isIOSBrowser()) {
                    //on ios browser client pos is the real element pos, change to screen pos
                    //see cursor left/top value for reference, here we need a screen pos
                    this._touchScreenX = event.screenX;
                    this._touchScreenX = event.screenY;
                }
                this._refreshCursor();
                // register doc event
                this._docConnects.push(on(this._domNode, "touchmove", lang.hitch(this, "_onCursorIndicatorMove")));
                this._docConnects.push(on(this._domNode, "touchend", lang.hitch(this, "_onCursorIndicatorUp")));
                this._docConnects.push(on(this._domNode, "touchend", lang.hitch(this, "_onCursorIndicatorUpOut")));
                 event.preventDefault(), event.stopPropagation();
            },
            
            _onCursorIndicatorMove: function(event) {
            	var offsetX = event.clientX || event.changedTouches[0].clientX;
                var offsetY = event.clientY || event.changedTouches[0].clientY;
                var moveX = offsetX - this._moveInitX;
                var moveY = offsetY - this._moveInitY;
                if (Math.abs(moveX) > this._cursorWidth || Math.abs(moveY) > this._cursorWidth)
                    this._move = true;
                var pos = this._shell.screenToClient({x: offsetX, y: offsetY});
                var selection = this._shell.getSelection();
                if (selection) {
                    if (moveX > 0 && moveX > this._MOVE_OFFSETX ) {
                        if (pos.x > this._cursorInfo.position.x) 
                            selection.moveRight();
                        this._moveInitX = offsetX;
                    } else if (moveX < 0 && moveX < -this._MOVE_OFFSETX) {
                        if (pos.x < this._cursorInfo.position.x) 
                            selection.moveLeft();
                        this._moveInitX = offsetX;        
                    }
                    var cursorY = this._cursorInfo.position.y+ this._cursorInfo.length +2+ this._FIX_OFFSET_TOP;
                    if (moveY > 0 && moveY > this._MOVE_OFFSETX) {
                        if (pos.y > cursorY) 
                            selection.lineDown();
                        this._moveInitY = offsetY;
                    } else if (moveY < 0 && moveY < -this._MOVE_OFFSETX) {
                        if (pos.y < cursorY) 
                            selection.lineUp();
                        this._moveInitY = offsetY; 
                    }
                    this._refreshCursor();
                }  
            },
            _onCursorIndicatorUp: function(event) {
                var selection = this._shell.getSelection();
                if (this._move) {
                    this._move = false;              
                    if (selection)
                        selection.getCursor().show();
                } else {
                    var mobileMenu = pe.lotusEditor.MobileMenu;
                        selection = this._shell.getSelection();
                    if (selection && selection._cursor) {
                        selection._cursor.quiet();
                        if (mobileMenu) {
                            this._refreshCursor();
                            var runModel = this._getRelatedRunModel();
                            var hasComments = ModelTools.hasComments(runModel);
                            // touch posX - adjust(40), mobilemenu left offset 40 of cursor pos
                            var offsetX = this._moveInitX - 40;
                            // touch posY - cursor.height - mobilemenu.height(24) - (adjust)30
                            var offsetY = this._moveInitY - this._cursorInfo.length -54;
                            if (concord.util.browser.isIOSBrowser()) {
                                offsetX = this._touchScreenX - 40;
                                offsetY = this._touchScreenX - this._cursorInfo.length -54;
                            }
                            mobileMenu.show(true, hasComments, offsetX, offsetY);
                        }
                    }
                }
                
                // unregister document move event
                for (var i = 0; i < this._docConnects.length; i++) {
                    this._docConnects[i].remove();
                }

                this._docConnects = [];
            },
            _onCursorIndicatorUpOut: function(event)
            {
                var x = event.clientX;
                var y = event.clientY;
                var _editorFrame = dom.byId("editorFrame");
                x -= _editorFrame.offsetLeft;
                y -= _editorFrame.offsetTop;
                this._onIndicatorUp({clientX: x, clientY: y});
            },

            _getCursorInfo: function() {
                var selection = this._shell.getSelection();
                if (selection) {
                    return selection.getInputPos().getCursorInfo();
                }
                
            },
            _refreshCursor: function() {
                this._cursorInfo = this._getCursorInfo();
            },
            _getRelatedRunModel: function() {
                var selection = this._shell.getSelection();
                var context = selection.getInputPos();
                if (context) {
                    var run = context.run();
                    return run ? run.model : run;
                }
            },
            // for selection indicator move
            _onSelectionIndicatorDown: function(event) {
                // disable context menu
                this._shell.dismissContextMenu();
                var selection = this._shell.getSelection();
                var startPos = this._isLeft ? selection._end : selection._start;
                var initX = event.clientX || event.changedTouches[0].clientX;
                var initY = event.clientY || event.changedTouches[0].clientY;
                var target = event.target || event.srcElement;
                selection.beginSelect(startPos, true);
                this._setOffsetX();
                this._shell.moveSelect(target, initX + this._offsetX, initY + this._offsetY, false, true);
                
                // register doc event
                this._docConnects.push(on(this._domNode, "touchmove", lang.hitch(this, "_onSelectionIndicatorMove")));
                this._docConnects.push(on(this._domNode, "touchend", lang.hitch(this, "_onSelectionIndicatorUp")));
                this._docConnects.push(on(this._domNode, "touchend", lang.hitch(this, "_onSelectionIndicatorUpOut")));
                 event.preventDefault(), event.stopPropagation();
            },
            
            _onSelectionIndicatorMove: function(event) {
            	var movedX = event.clientX || event.changedTouches[0].clientX;
                var movedY = event.clientY|| event.changedTouches[0].clientY;
                var target = event.target || event.srcElement;
                this._setOffsetX();
                this._shell.moveSelect(target, movedX + this._offsetX, movedY + this._offsetY, false, true);              
            },
            _onSelectionIndicatorUp: function(event) {
                var endedX = event.clientX || event.changedTouches[0].clientX;
                var endedY = event.clientY|| event.changedTouches[0].clientY;
                this._setOffsetX();
                var target = event.target || event.srcElement;
                this._shell.endSelect(target, endedX + this._offsetX, endedY + this._offsetY, false, true);
               
                // unregister document move event
                for (var i = 0; i < this._docConnects.length; i++) {
                    this._docConnects[i].remove();
                }

                this._docConnects = [];
            },
            _onSelectionIndicatorUpOut: function(event)
            {
                var x = event.clientX;
                var y = event.clientY;
                var _editorFrame = dom.byId("editorFrame");
                x -= _editorFrame.offsetLeft;
                y -= _editorFrame.offsetTop;
                this._onIndicatorUp({clientX: x, clientY: y});
            },
            _setOffsetX: function() {
                this._offsetX = this._showAsLeft? this._INDICATOR_WIDTH/2 : -this._INDICATOR_WIDTH/2;
            },

            getX: function() {
                var left = this._domNode.style.left;
                return left.substring(0, left.length - 2);
            },
            getY: function() {
                var top = this._domNode.style.top;
                return top.substring(0, top.length - 2);
            },
            destroy: function() {
                if (this._connects)
                    array.forEach(this._connects, function(c) {
                        c && c.remove && c.remove();
                    });
                this._connects = [];
                domConstruct.destroy(this._domNode);
                this._destroyed = true;
            }

        });

    return MobileIndicator;
});
