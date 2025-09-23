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
	"dojo/has",
	"writer/common/tools",
	"writer/constants",
	"writer/model/text/TextRun",
	"writer/model/text/TrackDeletedObjs"
], function(has, tools, constants, TextRun, TrackDeletedObjs) {
	if (!has("trackGroup"))
		return TrackDeletedObjs;
	/**
	 * make a virtual run to keep reference of deleted block
	 * @param obj   the deleted block
	 * @param owner it should be a TrackBlockGroup in most cases
	 */
	var TrackDeletedRef = function(obj, owner) {
		this.start = 0;
		this.length = 0;
		this.paragraph = owner.paragraph || owner;
        this.parent = owner;
        this.obj = obj;
        this.ch = obj.ch;
	};

	TrackDeletedRef.prototype = {
		modelType: constants.MODELTYPE.TRACKDELETEDREF,
		getCh: function() {
			return this.obj.getCh();
		},

		isVisibleInTrack: function() {
			return false;
		},

		createRun: function(reset) {
			if (!this.paragraph)
				return null;
			return this;
		}
	};

	tools.extend(TrackDeletedRef.prototype, new TextRun());
	return TrackDeletedRef;
});