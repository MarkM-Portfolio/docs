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
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/has",
    "writer/util/ViewTools",
    "writer/view/selection/Base"
], function(declare, lang, domClass, domConstruct, domStyle, has, ViewTools, Base) {

    var Text = declare("writer.view.selection.Text", Base, {
        _line: null,
        _start: null,
        _end: null,
        _shell: null,
        constructor: function(createParam) {
            var line = createParam.viewItem;
            var start = createParam.start;
            var end = createParam.end;
            var tools = ViewTools;
            if (line) {
                var conentLeft = line.getContentLeft();
                this._shell = createParam.shell;
                if (start == null) {
                	var fr = tools.first(line);
                	if(!fr)
                		return;
                    start = fr.getLeft(true);
                }

                if (end == null) {
                    var lastRun = tools.last(line);
                    	end = lastRun.getLeft(true) + lastRun.w;
                }
                this._line = line;
                if (start > end) {
                    var tmp = start;
                    start = end;
                    end = tmp;
                }
                var lineDomNode = line.render();
                if (line.isBidiLine()) {
                    conentLeft += line.paddingLeft;
                    if (line.isRtlDir && line.listOffset)
                        conentLeft += line.listOffset;

                    this._start = start - conentLeft;
                    this._end = end - conentLeft;
                } else {
                    var marginLeft = line.getRealPaddingLeft(); //parseInt(dojo.style(lineDomNode,"marginLeft"));
                    this._start = start - conentLeft - marginLeft;
                    this._end = end - conentLeft - marginLeft;
                }
                var width = this._end - this._start;
                if (width == 0) {
                    var r = line.container.getFirst();
                    var vTools = ViewTools;
                    var emptyLine = true;
                    while (r) {
                        if (!vTools.isZeroRun(r)) {
                            emptyLine = false;
                            break;
                        }
                        r = line.container.next(r);
                    }
                    if (emptyLine)
                        width = 10;
                }


                //var top = line.getSelectionTop() + this._shell.baseTop;
                this._domNode = domConstruct.create("div", null, lineDomNode);
                var top = 0;

                domStyle.set(this._domNode, "position", "absolute");
                domStyle.set(this._domNode, "zIndex", this._selectLayer);
                var focusEffect = 0;
                var height = line.getBoxHeight();
                //		var vTools = writer.util.ViewTools;
                //		var inCell =vTools.getCell(vTools.first(line));
                //		if(inCell){
                //			height += inCell.getTopEdge()+ inCell.getBottomEdge();
                //		}
                if (createParam.effect) {
                    focusEffect = 8;
                    setTimeout(
                        lang.hitch(this, function() {
                            domStyle.set(this._domNode, 'left', this._start + 'px');
                            domStyle.set(this._domNode, 'width', width + 'px');
                            domStyle.set(this._domNode, 'top', top + 'px');
                            domStyle.set(this._domNode, 'height', height + 'px');
                            focusEffect = 0;
                        }), 100
                    );
                }
                domStyle.set(this._domNode, 'left', this._start - focusEffect / 2 + 'px');

                domStyle.set(this._domNode, 'width', width + focusEffect + 'px');
                domStyle.set(this._domNode, 'top', top - focusEffect / 2 + 'px');
                domStyle.set(this._domNode, 'height', height + focusEffect + 'px');
                domClass.add(this._domNode, "textSelection");
                this.highLight(createParam.highlightType);
                if (has("ie") && has("ie") <= 10) {
                    var color = domStyle.get(this._domNode, "backgroundColor");
                    this._domNode.innerHTML = "<span style = 'color:" + color + ";'>t</span>";
                }
            }
        }
    });
    return Text;
});
