/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

define([
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/_Templated",
    "dijit/_Widget",
    "concord/util/browser",
    "dojo/dom",
    "dojo/dom-geometry",
    "dijit/place",
    "dojo/_base/html",
    "dojo/_base/window",
    "dojo/keys",
    "dojo/on",
    "dojo/query",
    "writer/constants",
    "writer/global",
    "writer/view/Page",
    "writer/view/Body",
    "writer/common/Space",
    "writer/model/table/Table"
], function (lang, array, declare, domConstruct, domClass, domStyle, _Templated, _Widget, browser, dom, geo, place, dojoHtml, dojoWin, keys, on, query, constants, g, Page, Body, Space, Table) {

    var TrackChangePopup = declare("writer.ui.widget.TrackChangePopup", [_Widget, _Templated], {
        act: null,
        templateString: "<div class='track_change_popup' style='position:absolute' data-dojo-attach-point='focusNode' tabIndex='-1'><div class='content' style='position:relative' data-dojo-attach-point='contentNode'></div></div>",
        _getPreviewBody: function () {
            var rootView = window.layoutEngine.rootView;
            var page = new Page(rootView, rootView.settings.getFirstSection(), null);
            var space = new Space(10, 10);
            var body = new Body(page, space, 0, 0);
            return body;
        },
        _getPreviewPara: function (run) {
            var para = run.paragraph;
            var doc = pe.scene.getEditor().document;
            var paraObj = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), doc);
            if (para) {
                paraObj.directProperty = para.directProperty.clone();
                paraObj.directProperty.paragraph = this;
                paraObj.paraTextProperty = para.paraTextProperty.clone();
                paraObj.paraTextProperty.paragraph = this;
            }
            paraObj.forPreview = true;
            var json = run.toJson();
            json.ch = [];
            json.forPreview = true;
            paraObj.insertRichText(json);
            paraObj.hints.forEach(function (hint) {
                hint.forPreview = true;
            });
            return paraObj;
        },
        _previewRender: function (para) {
            var body = this._getPreviewBody();
            var view = para.preLayout("rootView");
            view.layout(body.textArea);
            return view.render();
        },
        postCreate: function () {
            this.inherited(arguments);
            var setHTML = false;
            var anchorNode = null;
            var tableNode = null;
            var model = this.act.modelChPairs[0].model;
            if (g.modelTools.isTrackDeletedRef(model))
                model = model.obj;
            if (this.act.isImageAct()) {
                var image = new Image();
                image.className = "image";
                image.src = model.url;
                image.alt = model.description || "";
                this.contentNode.appendChild(image);
                domClass.add(this.domNode, "image_popup");
                setHTML = true;
            }
            else if (this.act.isTableAct()) {
                var clonedTable = new Table(model.toJson());
                var doc = pe.scene.getEditor().document;
                clonedTable.parent = doc;
                clonedTable.forPreview = true;
//                clonedTable.rows.forEach(function(r){
//                    r.forPreview = true;
//                });
                var dom = this._previewRender(clonedTable);
                this.contentNode.appendChild(dom);
                tableNode = query("table", dom)[0];
                setHTML = true;
            }
            else if (this.act.isTextBoxAct() || this.act.isCanvasAct()) {
                var paraObj = this._getPreviewPara(model);
                var dom = this._previewRender(paraObj);
                var lines = query(" > .line", dom);
                if (lines.length > 1) {
                    lines.forEach(function (line, index) {
                        if (index > 0)
                            line.parentNode.removeChild(line);
                    });
                }
                var line = lines[0];
                var carriageNode = query(".line > .carriageNode", dom)[0];
                if (carriageNode)
                    carriageNode.parentNode.removeChild(carriageNode);
                line.style.position = "";
                line.style.paddingTop = "";
                var tb = query(".line > div", dom)[0];
                tb.style.position = "";
                tb.style.left = "0";
                tb.style.top = "0";
                this.contentNode.appendChild(dom);
                anchorNode = dom;
                setHTML = true;
            }
            else if (this.act.mixTypes()) {
                var onlyContinueDeletes = this.act.getOnlyContinueDeleteModels();
                if (onlyContinueDeletes && onlyContinueDeletes.length) {
                    onlyContinueDeletes = array.map(onlyContinueDeletes, function(c){return c.model});
                    var domHTML = this.act.getActionMovesHtmlView(true, onlyContinueDeletes);
                    this.contentNode.innerHTML = domHTML;
                    this.useSimpleHtml = true;
                    this.onlyContinueDeletes = true;
                    setHTML = true;
                }
            }
            if (!setHTML) {
                var domHTML = this.act.getActionMovesHtmlView(true);
                this.contentNode.innerHTML = domHTML;
                this.useSimpleHtml = true;
            }
            domClass.add(this.domNode, "track_change_popup_" + this.act.u);
            this.ownerDocumentBody.appendChild(this.domNode);

            if (anchorNode != null) {
                var tb = query(".line > div", anchorNode)[0];
                if (tb) {
                    var box = geo.getMarginBox(tb);
                    anchorNode.style.width = box.w + "px";
                    anchorNode.style.height = box.h + "px";

                    var cBox = geo.getContentBox(tb);
                    if(cBox.w > box.w)
                    	anchorNode.style.width = cBox.w + "px";
                    if(cBox.h > box.h)
                    	anchorNode.style.height = cBox.h + "px";
                }
            }
            if (tableNode != null) {
                var tb = this.contentNode.children[0];
                if (tb) {
                    var box = geo.getMarginBox(tb.children[0]);
                    tb.style.width = box.w + "px";
                    tb.style.height = box.h + "px";
                }
            }

            this.connect(this.domNode, "onkeypress", this.onKey);
            this.connect(this.domNode, "onmousedown", this.onmousedown);
            this.connect(this.domNode, "oncontextmenu", this.oncontextmenu);
        },
        onmousedown: function (e) {
            e.stopPropagation();
        },
        oncontextmenu: function (e) {
            e.stopPropagation();
        },
        onDestroy: function () {

        },
        onBlur: function () {
            this.onDestroy();
        },
        focus: function () {
            this.focusNode.focus();
        },
        show: function (parent) {
            var sel = pe.lotusEditor.getSelection();
            dojoWin.withDoc(this.ownerDocument, function () {
                var viewDoms = query(".track-id-" + this.act.id, this.ownerDocument);
                if ((!viewDoms || viewDoms.length==0) && this.act.isTableAct() && this.act.types[0] && this.act.types[0]=="del")
                	viewDoms = query(".track-id-" + (this.act.id - 1), this.ownerDocument);

                var viewDom = null;
                if (viewDoms && viewDoms.length)
                {
                	if (this.onlyContinueDeletes)
                	{
	                    for (var i = 0; i < viewDoms.length; i++)
	                    {
	                        var vd = viewDoms[i];
	                        if (vd.className.indexOf("track-deleted") >= 0)
	                        {
	                            viewDom = vd;
	                            break;
	                        }
	                    }
                	}

                    if (!viewDom)
                        viewDom = viewDoms[viewDoms.length - 1];
                }
                
                if (!viewDom)
                {
                    // perhaps the delete does not add act-id in class;
                    var modelChPairs = this.act.modelChPairs;
                    var lastModel = modelChPairs[modelChPairs.length - 1].model;
                    var delObjs = g.modelTools.getParent(lastModel, constants.MODELTYPE.TRACKDELETEDOBJS);
                    while (delObjs)
                    {
                        lastModel = delObjs;
                        delObjs = g.modelTools.getParent(lastModel, constants.MODELTYPE.TRACKDELETEDOBJS);
                    }
                    var isPara = lastModel.modelType ==  constants.MODELTYPE.PARAGRAPH;
                    var viewers = lastModel._viewers;
                    if (viewers && viewers["rootView"])
                    {
                        var lastView = viewers["rootView"].getLast();
                        if (lastView)
                        {
                            if (isPara)
                            {
                                if (lastView.lines)
                                    viewDom = lastView.lines.getLast();
                            }
                            else
                            {
                                if (lastView._vRun)
                                    lastView = lastView._vRun;
                                viewDom = lastView.domNode;
                            }
                        }
                    }
                }

                var popupDom = viewDom || sel._cursor._domNode;
               
                var scale = pe.lotusEditor.getScale();
                
                /*
                if (popupDom == viewDom && viewDom.innerHTML == "" && domClass.contains(viewDom, "track-deleted"))
                {
                    domConstruct.create("span", {className: "delete-text", innerHTML : "&#8203;"}, viewDom);
                    domConstruct.create("span", {className: "delete-triangle"}, viewDom);
                }
                */
                
                var pos = dojoHtml.coords(popupDom, true);
                
                var padding = 10;
                if (scale != 1) {
                    pos.x = (pos.x - padding) / scale + padding;
                    pos.y = (pos.y - padding) / scale + padding;
                }
                
                this.domNode.style.position = "absolute";
                this.domNode.style.visibility = "hidden";
                this.domNode.style.display = "";
                this.domNode.style.left = (pos.x - 4) + "px";
                this.domNode.style.top = (pos.y + pos.h) + "px";
                this.domNode.style.visibility = "";
                
                var w = this.domNode.offsetWidth;
                var h = this.domNode.offsetHeight;
                
                if (parent)
                    parent.appendChild(this.domNode);
                
                if (this.useSimpleHtml) 
                    this.domNode.style.width = (w - 4) + "px";
                    
                if (w < 700 && h < 300)
                {
                    this.domNode.style.overflow = "hidden";
                }
                
                if (w < 700)
                {
                    this.domNode.style.maxWidth = "";
                }
                
                if (h < 300)
                {
                    this.domNode.style.maxHeight = "";
                }
                else
                {
                    // too tall, need vertical scrollbar
                    if (w < 700)
                        this.domNode.style.width = w + 20 + "px";
                }
                
            }, this);
        },
        onKey: function (e) {
            if (e.keyCode == keys.ESCAPE) {
                this.onDestroy();
                pe.lotusEditor.focus();
            }
        }

    });

    return TrackChangePopup;
});
