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
    "dojo/_base/Color",
    "concord/util/browser",
    "writer/common/RangeIterator",
    "writer/constants",
    "writer/model/HFType",
    "writer/util/ModelTools",
    "writer/template",
    "writer/common/tools",
], function(dojoColor, browser, RangeIterator, constants, HFType, ModelTools, WriterTemplate, tools) {

    var HelperTools = {

        /**
         * Check if the run is selected from startPos to endPos
         * @param run
         * @param isCollapsed
         * @param startPos The start position object. It's from range.getStartParaPos()
         * @param endPos The start position object. It's from range.getEndParaPos()
         * @returns {Boolean}
         */
        isInSelection: function(run, isCollapsed, startPos, endPos) {
            if (isCollapsed) {
                if (run && ModelTools.isRun(run)) {
                    var startIdx = startPos.index;
                    var runPara = ModelTools.getParagraph(run);

                    // Check start
                    if (runPara == startPos.obj && run.start + run.length < startIdx)
                        return false;
                    // if run.start == index,  think it in selection only if the run is first run in the paragraph, or the run length is 0
                    if (runPara == startPos.obj && ((run.start == startPos.index && (startPos.index != 0 && run.length != 0)) || run.start > startPos.index))
                        return false;
                    //Do not Check end
                    return true;
                }

            }

            if (run && ModelTools.isRun(run)) {
                var startIdx = startPos.index;
                var runPara = ModelTools.getParagraph(run);

                // Check start
                if (runPara == startPos.obj && (run.start + run.length <= startIdx && run.length != 0 || (run.length == 0 && run.start < startIdx)))
                    return false;
                // Check end
                if (runPara == endPos.obj && run.start >= endPos.index)
                    return false;
                return true;
            }
            return false;
        },

        getSelectedParaOrTable: function() {
            var objs = [];
            var selection = pe.lotusEditor.getSelection();
            if (!selection) {
                return objs;
            }
            var ranges = selection.getRanges();
            if (!ranges) {
                return objs;
            }
            var indexOf = [].indexOf ?
                function(arr, item) {
                    return arr.indexOf(item);
                } :
                function indexOf(arr, item) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                };
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var it = new RangeIterator(range);
                var para = null;
                while (para = it.nextParagraph()) {
                    if (para.modelType == constants.MODELTYPE.PARAGRAPH) {
                        var table = ModelTools.getRootTable(para);
                        if (table) {
                            if (objs.indexOf(table) == -1)
                                objs.push(table);
                        } else
                            objs.push(para);

                    }
                }
            }
            return objs;
        },

        getSelectedTaskId: function() {
            return "";

            var objs = pe.lotusEditor.getSelectedParagraph();
            if (objs.length > 0) {
                var table = ModelTools.getRootTable(objs[0]);
                if (table)
                    return table.getTaskId();
                else
                    return objs[0].getTaskId();
            } else
                return "";
        },
        /**
         * check if the selection can assign task
         * return false, if the selection contain a task already
         * @returns {Boolean}
         */
        canTaskCreate: function() {
            if (!pe.lotusEditor.isContentEditing())
                return false;
            var objs = this.getSelectedParaOrTable();
            for (var i = 0; i < objs.length; i++) {
                if (ModelTools.inTextBox(objs[i]))
                    return false;
                if (ModelTools.isInToc(objs[i]))
                    return false;
                if (objs[i].isTask())
                    return false;
            }
            return true;
        },
        /**
         * check if the selection can be deleted
         * as it may contain task
         * @returns {Boolean}
         */
        canTaskDelete: function() {
            return true;

            var paras = pe.lotusEditor.getSelectedParagraph();
            if (paras.length == 1 && !paras[0].isEmpty())
                return true;

            var firstTask = secondTask = null;
            for (var i = 0; i < paras.length; i++) {
                if (paras[i].isTask()) {
                    if (!firstTask)
                        firstTask = paras[i].getTaskId();
                    else if (firstTask == paras[i].getTaskId())
                        continue;
                    else if (!secondTask)
                        secondTask = paras[i].getTaskId();
                    else if (secondTask == paras[i].getTaskId())
                        continue;
                    else
                        return false;
                }
            }

            if (!firstTask)
                return true;
            var firstObj = ModelTools.getRootTable(paras[0]);
            if (firstObj == null)
                firstObj = paras[0];
            var lastObj = ModelTools.getRootTable(paras[paras.length - 1]);
            if (lastObj == null)
                lastObj = paras[paras.length - 1];

            var pre_para = ModelTools.getPrev(firstObj, ModelTools.isParagraph);
            var next_para = ModelTools.getNext(lastObj, ModelTools.isParagraph);
            if (!pre_para && !next_para)
                return false;

            if (secondTask)
                return (pre_para && firstTask == pre_para.getTaskId() && next_para && secondTask == next_para.getTaskId());
            else
                return (pre_para && firstTask == pre_para.getTaskId()) || (next_para && firstTask == next_para.getTaskId());
        },

        getCursorColor: function(backgroundColor, bCalcCursoColor) {
            var color = browser.isMobile() ? '#426bf2' : 'black';
            if (bCalcCursoColor && this.isNeedChangeColor(backgroundColor)) {
                color = 'white';
            }
            return color;
        },
        combineColors: function(bg, color) {
            var a = color.a;
            var arr = [
                (1 - a) * bg.r + a * color.r, (1 - a) * bg.g + a * color.g, (1 - a) * bg.b + a * color.b
            ];
            return dojoColor.fromArray(arr);
        },

        isNeedChangeColor: function(backgroundColor) {
            if (!backgroundColor)
                return false;
            var BgColor;
            // if the color is RGB or GRBA, convert it to Hex
            if (backgroundColor.toLowerCase().indexOf("rgb") == 0) {
                var bgColor = dojoColor.fromRgb(backgroundColor);
                BgColor = this.combineColors(dojoColor.fromHex("#FFFFFF"), bgColor);
            } else {
                // the color may not start with # or just number
                if (backgroundColor.length == 6)
                    backgroundColor = "#" + backgroundColor;
                BgColor = dojoColor.fromHex(backgroundColor);
            }
            try {
                if (BgColor.a && BgColor.a >= 0.8)
                //transparent color
                    return false;
                if (BgColor.r <= 38 && BgColor.g <= 38 && BgColor.b <= 38)
                    return true;


            } catch (e) {}

            return false;
        },

        normalizeTextWatermark: function() {
        	//window.g_watermark = {enabled:"true", text_watermark:{text:"CONFIDENTIAL",color:"#00ff00",size:"72",font:"Arial", diagonal:"true"}};
    		var watermark = window.g_watermark && window.g_watermark.text_watermark ? dojo.clone(window.g_watermark.text_watermark) : {};

    		// text
    		if (watermark.text && watermark.text.trim().length != 0) {
    			if (watermark.text.indexOf("$") > -1) {
    				var user = window.g_authUser && window.g_authUser.disp_name ? window.g_authUser.disp_name : "";
    				var time = (new Date()).toLocaleDateString();
    				watermark.text = dojo.string.substitute(watermark.text, {user: user, time: time});
    			}
    		} else {
    			watermark.text = "DRAFT";
    		}

    		// font
    		var wFont = watermark.font || "Arial";

    		// size 
    		var wSize = watermark.size && parseInt(watermark.size);
    		wSize = wSize ? (wSize < 36 ? 36 : (wSize > 144 ? 144 : wSize)) : 90;
    		var measure = dojo.create("div", {
    			innerHTML : watermark.text,
    			style : {
    				fontSize : wSize + "pt",
    				fontFamily : wFont,
    				position : "absolute",
    				top : "-1000px"
    			}
    		  }, dojo.body());
    		var width = tools.PxToEmu(measure.clientWidth);
    		var height = tools.PxToEmu(measure.clientHeight);
    		dojo.destroy(measure);

    		// hex color 
    		var wColor = (!watermark.color || !/^#[0-9A-F]{6}$/i.test(watermark.color)) ?  "#D2D2D2" : watermark.color;
    		var rotation = (!watermark.diagonal || watermark.diagonal.toLowerCase() == "true") ? 18900000 : 0;

    		var template = WriterTemplate.WATERMARK;
    		template = dojo.string.substitute(template, {
    				text : watermark.text,
    				font : wFont,
    				size : wSize,
    				color : wColor,
    				length : watermark.text.length,
    				rotation : rotation,
    				height : height,
    				width : width
    		});

    		return JSON.parse(template);
        },

        setViewWaterMark: function(cEditor, docJson) {
        	var id = "watermark";
        	var watermark = this.normalizeTextWatermark();
        	cEditor.relations.insertRelation(id, watermark);
        	var len = cEditor.setting.getSectionLength();
        	var hIds = {};
        	for (var i = 0; i < len; i++) {
        		 var sec = cEditor.setting.getSectionByIndex(i);
        		 var fh = sec.getHeaderFooterByType(HFType.FIRST_HEADER);
        		 var eh = sec.getHeaderFooterByType(HFType.EVEN_HEADER);
        		 var dh = sec.getHeaderFooterByType(HFType.DEFAULT_HEADER);
        		 fh && !hIds[fh] && (hIds[fh] = true);
        		 eh && !hIds[eh] && (hIds[eh] = true);
        		 dh && !hIds[dh] && (hIds[dh] = true);
        		 if (!dh) {
        			 sec.setHeaderFooterByType(HFType.DEFAULT_HEADER, id); 
        		 }
        		 if (sec.firstDifferent && !fh) {
        			 sec.setHeaderFooterByType(HFType.FIRST_HEADER, id);
        		 }
        	}
   		    for (var hId in hIds) {
   				 var header = docJson.relations[hId].content;
       			 for (var j = 0; j < header.length; j++) {
       				 var hdr = header[j];
       				 var fmt = hdr.fmt;
       				 if (fmt) {
           				 for (var k = 0; k < fmt.length; k++) {
           					 if (hdr.fmt[k].anchor && hdr.fmt[k].anchor.docPr && hdr.fmt[k].anchor.docPr.isWMO 
           							 && hdr.fmt[k].anchor.docPr.isWMO == "1")
           						hdr.fmt.splice(k, 1);
           				 }
       				 }
       			 }
       			 header.push(watermark.content[0]);
   			 }
        }
    };
    return HelperTools;
});
