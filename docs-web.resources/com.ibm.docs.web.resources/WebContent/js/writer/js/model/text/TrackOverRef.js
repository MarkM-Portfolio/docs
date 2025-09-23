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
	"dojo/_base/lang",
	"writer/common/tools",
	"writer/constants",
	"writer/model/text/TextRun"
], function(lang, tools, constants, TextRun) {
	/**
	 * make a virtual run to keep reference of big deleted block
	 * @param json   the json object
	 * @param owner it should be a paragraph in most cases
	 * @param text   the deleted text
	 */
	var TrackOverRef = function(json, owner, text) {
		this.start = 0;
		this.length = 1;
		this.relText = (text || (json && json.relText));
		this.paragraph = owner.paragraph || owner;
        this.parent = owner;
        this.fromJson(json);
	};

	TrackOverRef.prototype = {
		modelType: constants.MODELTYPE.TRACKOVERREF,

        canMerge: function(run) {
        	return false;
        },
        getCh: function(){
        	return this.ch;
        },
		isVisibleInTrack: function() {
			return false;
		},
        isTextRun: function() {
            return false;
        },        
		toJson: function() {
			var jsonStr = {};
			jsonStr.s = this.start.toString();
			jsonStr.l = this.length.toString();
			jsonStr.rt = constants.RUNMODEL.TRACKOVERREF;
			jsonStr.relText = this.relText;
			jsonStr.ch = lang.clone(this.ch);
			return jsonStr;
		}
	};

	tools.extend(TrackOverRef.prototype, new TextRun());
	return TrackOverRef;
});