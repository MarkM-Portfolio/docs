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
	"dojo/_base/array",
	"writer/common/tools",
	"writer/common/Container",
	"writer/msg/msgCenter",
	"writer/constants",
	"writer/model/text/TextRun",
	"writer/global"
], function(lang, array, tools, Container, msgCenter, constants, TextRun, g) {
	var TrackDeletedObjs = function(json, owner, objs) {
		this.paragraph = owner.paragraph || owner;
        this.parent = owner;
        this.objs = new Container(this);
		this.clist = [];
        if (objs){
        	array.forEach(objs, function(obj) {
				var jsonModel = null;
				if (obj.modelType == constants.MODELTYPE.PARAGRAPH)
					jsonModel = obj.toJson(0, null ,true);
				else
					jsonModel = obj.toJson();
				this.objs.append(g.modelFac.createModel(jsonModel, this));
        	}, this);
        }
        this.start = -1;
        this.length = 1;
        this.text = "\u0001";
        this.fromJson(json);
        // store owner's rPrCh
        if (!this.isFront && !this.pRPrCh && this.start == owner.getLength())
        	this.pRPrCh = lang.clone(owner.rPrCh) || [];
	};
	TrackDeletedObjs.prototype =  {
		modelType: constants.MODELTYPE.TRACKDELETEDOBJS,

		fromJson: function(jsonStr) {
			TextRun.prototype.fromJson.apply(this,[jsonStr]);
			if(jsonStr.pRPrCh)
				this.pRPrCh = jsonStr.pRPrCh;
			if (jsonStr.isFront)
				this.isFront = jsonStr.isFront;
			if (lang.isArray(jsonStr.objs)) {
				var me = this;
				array.forEach(jsonStr.objs, function(objJson){
					me.objs.append(g.modelFac.createModel(objJson, this));
				}, this);
			}
		},

		getPRPrCh: function() {
			if (this.pRPrCh) {
				return this.pRPrCh.concat(this.ch);
			} else
				return;
		},

		appendObj: function(obj, msgs) {
			if(msgs) {
				var actPair = msgCenter.createInsertElementAct(obj);
				var msg = msgCenter.createMsg(constants.MSGTYPE.Element, [actPair]);
				if (msg)
					msgs.push(msg);
			}
			this.objs.append(obj);
		},

		canInsert: function() {
			return false;
		},

		toJson: function() {
			var jsonStr = {};
			jsonStr.isFront = this.isFront;
			jsonStr.s = this.start.toString();
			jsonStr.l = this.length.toString();
			jsonStr.rt = constants.RUNMODEL.TRACKDELETEDOBJS;
			jsonStr.tab = this.tab;
			jsonStr.ptab = this.ptab;
			jsonStr.e_a = this.author;
			jsonStr.sym = this._sym;
			jsonStr.ch = lang.clone(this.ch);
			if (this.pRPrCh) {
				jsonStr.pRPrCh = lang.clone(this.pRPrCh);
			}
			jsonStr.objs = [];
			if (this.objs && this.objs.length) {
				this.objs.forEach(function(obj){
					if (obj.modelType == constants.MODELTYPE.PARAGRAPH)
						jsonStr.objs.push(obj.toJson(0, null ,true));
					else if (obj.toJson)
						jsonStr.objs.push(obj.toJson());
				});
			}
			if (this.clist && this.clist.length > 0) {
                jsonStr.cl = [];
                jsonStr.cl = this.clist.concat();
            }
			return jsonStr;
		},

		createRun: function(reset) {
			if (!this.paragraph)
				return null;
			return this;
		},
		nextChild: function(m) {
            return this.objs.next(m);
        },
        previousChild: function(m) {
        	return this.objs.prev(m);
        },
		update: function() {
			// do nothing
		}
	};
	tools.extend(TrackDeletedObjs.prototype, new TextRun());
	return TrackDeletedObjs;
});