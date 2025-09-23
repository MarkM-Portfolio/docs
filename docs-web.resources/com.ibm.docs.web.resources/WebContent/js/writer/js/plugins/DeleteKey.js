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
    "dojo/i18n!writer/nls/lang",
    "writer/core/Range",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/track/trackChange"
], function(declare, lang, i18nlang, Range, msgCenter, Plugin, ModelTools, RangeTools, trackChange, ConfirmBox, i18nTrack) {

    var DeleteKey = declare("writer.plugins.DeleteKey", Plugin, {

    	deleteFn : function(isBackspace, overTrackContent) {
    		var tools = ModelTools;
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            //check ranges in same table cell and split in different page
            ranges = RangeTools.mergeRangesInCrossPageCell(ranges);

            var msgs = [],
                range = ranges[0],
                para = range.getStartParaPos().obj,
                doc = tools.getDocument(para);
            var cmdId = "deleteKey";
            if (!RangeTools.canDo(ranges)) {
                /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                return;
            }
            msgCenter.beginRecord();
            for (var i = ranges.length - 1; i > -1; i--) {
                var range = ranges[i];
                if (!range.isCollapsed()) {
                    //delete contents				
                    msgs = msgs.concat(range.deleteContents(true, true));
                } else if (range.isCollapsed()) {
                    //remove a char
                    msgs = msgs.concat(range.deleteAtCursor(isBackspace));
                    cmdId = isBackspace ? "backSpace" : "deleteAtCursor";
                }
            }

            //send msgs

            if (doc.firstChild() == null) {
                tools.fixBlock(doc, range, msgs);
                selection.selectRangesBeforeUpdate([range]);
            } else if (ranges.length > 1) {
                var firstPara = RangeTools.getFirstParaInRanges(ranges);
                var newRange = new Range(firstPara, firstPara, range.rootView);
                selection.selectRangesBeforeUpdate([newRange]);
            }

            if(overTrackContent)
            	msgs = msgs.concat(trackChange.insertOverLmtText(overTrackContent));

            doc.update();
            if(msgs && msgs.length)
            	msgCenter.sendMessage(msgs, cmdId);
            msgCenter.endRecord();
        	selection._checkCursor();
        },

        init: function() {
            //Merge paragraph
            var plugin = this; 

            var executeDelete = function(isBackspace) {
                var selection = pe.lotusEditor.getSelection();
                if (!selection) {
                    return;
                }
                var ranges = selection.getRanges();
                if (!ranges) {
                    return;
                }

        	    var trackStop = trackChange.isOverMaxTxtSizeLmt();
                if(trackStop)
          	        trackChange.pause();
                plugin.deleteFn(isBackspace, trackStop);
                if(trackStop){
                	trackChange.resume();
                	trackChange.showOverTrackTxtLmtMsg(); 
                }
            };

            var backspaceCommand = {
                exec: function() {
                	executeDelete(true);
                }
            };

            var deleteCommand = {
                exec: function() {
                	executeDelete();
                }
            };

            this.editor.addCommand("backspace", backspaceCommand, 8);
            this.editor.addCommand("delete", deleteCommand, 46);
        }

    });
    return DeleteKey;
});
