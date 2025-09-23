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
    "concord/util/browser",
    "writer/controller/CursorContext",
    "writer/ui/widget/CoEditIndicator",
], function(fx, lang, declare, array, dom, domConstruct, domStyle, domClass, on, browser, CursorContext, CoEditIndicator) {

    var Cursor = declare("writer.controller.Cursor",
        null, {
            // EditShell
            _shell: null,

            // CursorContext
            _context: null,

            // DOM node of the blinking cursor
            _domNode: null,

            _blinkInterval: null,

            _blinkable: true,

            _cursorLayer: 1000,

            _visible: false,

            _locked: false,

            _offsetH: 2, // Let the cursor looks beautiful like character g,p.

            _color: null,

            _useId: null,
            
            _mobileIndicator: null,

            constructor: function(createParam) {
                this._shell = createParam.shell;
                this._color = createParam.color;
                this._userId = createParam.userId;
                this._connections = [];
                if (createParam.blinkable === false)
                    this._blinkable = false;
                if (this._shell) {
                    this._context = new CursorContext(createParam);
                    this._domNode = domConstruct.create("div", {className: "cursor"}, this._shell.domNode());
                    domStyle.set(this._domNode, "position", "absolute");
                    domStyle.set(this._domNode, "zIndex", this._userId ? this._cursorLayer : this._cursorLayer + 1);
                    if (this._userId) {
                        this._connections.push(on(this._domNode, "mouseenter", lang.hitch(this, "showCoEditIndicator")));
                        this._connections.push(on(this._domNode, "mouseleave", lang.hitch(this, "hideCoEditIndicator")));
                    }
                    if (this._color)
                        this._domNode.style.borderLeftColor = this._color;
                    if (createParam.mobileIndicatorManager) {
                        this._mobileIndicator = createParam.mobileIndicatorManager.createCursorIndicator(this._shell, this._domNode, this._visible);
                    }
                }
            },

            hideCoEditIndicator: function(e) {
                var _that = this;
                clearTimeout(this._hideIndicatorTimer);
                this._hideIndicatorTimer = setTimeout(function() {
                    _that.detachCoEditIndicator(true);
                }, 2 * 1000);
            },

            posCoEditIndicator: function() {
                if (!this._isVisible())
                    return;

                if (this.coEditIndicator && this.coEditIndicator.domNode && this._domNode) {
                    this.coEditIndicator.show(this._domNode);
                }
            },

            showCoEditIndicator: function(autoHide) {
                if (/*!pe.scene.isIndicatorAuthor() || */!this._userId)
                    return;
                /*
                if (!pe.scene.getUsersColorStatus(this._userId))
                    return;
                */
                var store = pe.scene.getEditorStore();
                if (!store)
                	return;
                
                var u = store.getEditorById(this._userId);
                if (!u)
                	return;
                
				var userName = u.getName();
                if (!userName)
                   return; 
                   
                var target = this._domNode;

                if (!this._isVisible() || !target || domStyle.get(target, "display") == "none" || !target.parentNode) {
                    return;
                }

                clearTimeout(this._hideIndicatorTimer);

                if (this.coEditIndicatorAnim)
                    this.coEditIndicatorAnim.stop();
                this.coEditIndicatorAnim = null;

                if (this.coEditIndicator) {
                    domStyle.set(this.coEditIndicator.domNode, "opacity", 100);

                    this.coEditIndicator.show(target);
                    if (autoHide) {
                        this.hideCoEditIndicator();
                    }
                    return;
                }

                this.detachCoEditIndicator();
               
                if (userName) {
                    var userCssKey = pe.lotusEditor.indicatorManager.getUserCSSKey(this._userId);
                    this.coEditIndicator = new CoEditIndicator({
                        label: userName,
                        userId: userCssKey,
                        ownerDocument: this._domNode.ownerDocument
                    });
                    var editorNode = dom.byId("editor", this._domNode.ownerDocument);
                    if (editorNode)
                        editorNode.appendChild(this.coEditIndicator.domNode);
                    this.coEditIndicator.show(target);
                    if (autoHide) {
                        this.hideCoEditIndicator();
                    }
                }
            },

            detachCoEditIndicator: function(anim) {
                clearTimeout(this._hideIndicatorTimer);
                if (this.coEditIndicator) {
                    if (this.coEditIndicatorAnim) {
                        if (anim) {
                            // let it go.
                            return;
                        } else {
                            this.coEditIndicatorAnim.stop();
                            this.coEditIndicatorAnim = null;
                        }
                    } else if (anim) {
                        var me = this;
                        this.coEditIndicatorAnim = fx.fadeOut({
                            node: this.coEditIndicator.domNode,
                            onEnd: function() {
                                // stop will not trigger onEnd, stop(true) would.
                                if (me.coEditIndicator)
                                    me.coEditIndicator.destroy();
                                me.coEditIndicator = null;
                                me.coEditIndicatorAnim = null;
                            }
                        });
                        this.coEditIndicatorAnim.play();
                    }

                    if (!anim) {
                        if (this.coEditIndicator)
                            this.coEditIndicator.destroy();
                        this.coEditIndicator = null;
                    }
                }
            },

            /*
             * Render
             */
            updateDOM: function(updateParam) {
                //if(this._shell.getEditor().isReadOnly()){
                //  return;
                //}

                if (updateParam) {
                    var _domNode = this._domNode;
                    window.setTimeout(
                        function() {
                            var func = updateParam.italic ? "add" : "remove";
                            domClass[func](_domNode, "italicCursor");
                        }, 0);

                    if (!isNaN(updateParam.length)) {
                        domStyle.set(this._domNode, "height", (updateParam.length + this._offsetH) + "px");
                        if (this._mobileIndicator){
                        	updateParam.length = updateParam.length + this._offsetH;
                        }	
                    }

                    if (!isNaN(updateParam.thickness)) {
                        if (browser.isMobile())
                            domStyle.set(this._domNode, "borderLeft", updateParam.thickness + "px solid " + (updateParam.bColor ? updateParam.bColor : "#426bf2"));
                        else
                            domStyle.set(this._domNode, "borderLeft", updateParam.thickness + "px solid " + (updateParam.bColor ? updateParam.bColor : "#000000"));
                    }

                    if (this._color)
                        this._domNode.style.borderLeftColor = this._color;

                    if (updateParam.position) {
                        var x = updateParam.position.x + "px";
                        var y = updateParam.position.y + "px";
                        domStyle.set(this._domNode, {
                            "left": x,
                            "top": y
                        });
                    }
                    if (this._mobileIndicator)
                        this._mobileIndicator.updateDOM(updateParam);
                } else {
                    var cursorInfo = this._context.getCursorInfo();
                    if (cursorInfo)
                        this.updateDOM(cursorInfo);
                }
            },
            _show: function() {
                if (this._locked)
                    return;

                domStyle.set(this._domNode, "visibility", "visible");
                this._visible = true;
            },
            _hide: function() {
                if (this._locked)
                    return;

                domStyle.set(this._domNode, "visibility", "hidden");
                this._visible = false;
            },
            _isVisible: function() {
                return this._visible;
                //return  dojo.style(this._domNode, "visibility") != "hidden";
            },

            lock: function() {
                this._locked = true;
            },

            unlock: function() {
                this._locked = false;
            },

            show: function(noblink, highlight) {
                if (!noblink) {
                    this._blink();
                } else {
                    this._quiet();
                    if (!this._isVisible())
                        this._show();
                }
                if (highlight && this._domNode) {
                    var blc = "borderLeftColor";
                    var n = this._domNode;
                    var color = domStyle.get(n, blc);
                    domStyle.set(n, blc, "blue");
                    this._blinkable = true;
                    this._blink();
                    var me = this;
                    setTimeout(function() {
                        me._quiet();
                        me._blinkable = false;
                        domStyle.set(n, blc, color);
                    }, 1500);
                }
            },

            getX: function() {
                return this._domNode.style.left;
            },
            getY: function() {
                return this._domNode.style.top;
            },
            hide: function() {
                this._quiet();
                if (this._isVisible())
                    this._hide();
            },
            quiet: function() {
                this.show(true);
            },
            _quiet: function() {
                if (this._blinkInterval) {
                    clearInterval(this._blinkInterval);
                    this._blinkInterval = null;
                }
                if (this._mobileIndicator && this._mobileIndicator.isVisible())
                    this._mobileIndicator.hideIndicator();
            },

            _blink: function() {

                function proc() {
                    if (this._isVisible()) {
                        this._hide();
                    } else {
                        this._show();
                    }
                };
                if (this._blinkInterval)
                    clearInterval(this._blinkInterval);
                this._show();

                if (this._blinkable)
                    this._blinkInterval = setInterval(lang.hitch(this, proc), 500);
                if (this._mobileIndicator && !this._mobileIndicator.isVisible())
                    this._mobileIndicator.showIndicator();
            },

            /*
             * Movement
             */
            moveTo: function(run, index) {
            	// skip track deleted runs
            	// TODO: after fix deleted run's height, these codes can be removed
                var target = run ,targetIdx = index;
                if (!run.isVisibleInTrack()) {
                    if (index >= run.len) {
                        target = run.next();
                        targetIdx = 0;
                        while (target && !target.isVisibleInTrack()) {
                            target = target.next();
                        }
                    }
                    if (!target || index < run.len) {
                        if (run._vRun)
                            target = run._vRun.previous();
                        target = run.previous();
                        while (target && !target.isVisibleInTrack()) {
                            target = target.previous();
                        }
                        if (target) {
                            targetIdx = target.len;
                        } else {
                            target = run;
                            targetIdx = 0;   
                        }
                    }

                }
                if (this._context && this._context.moveTo(target, targetIdx)) {
                    this.updateDOM();
                    return true;
                }
                return false;
            },

            /*
             * Events
             */
            _onFocus: function(event) {
                this.show();
            },

            _onBlur: function(event) {
                this.hide();
            },

            getContext: function() {
                return this._context;
            },
            getMobileIndicator: function() {
            	return this._mobileIndicator;
            },
            destroy: function() {
                this._quiet();
                if (this._connections)
                    array.forEach(this._connections, function(c) {
                        c && c.remove && c.remove();
                    });
                this._connections = [];
                if (this._mobileIndicator) {
                    this._mobileIndicator.destroy();
                }
                domConstruct.destroy(this._domNode);
                this.detachCoEditIndicator();
                this._context = null;
                this._destroyed = true;
            }

        });

    return Cursor;
});
