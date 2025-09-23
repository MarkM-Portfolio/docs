dojo.require("writer.model.prop.Property");

dojo.provide("writer.model.numberingDefinition");
writer.model.numberingDefinition = function(source){
	this.init(source);
};
writer.model.numberingDefinition.prototype = {
		init : function(source) {
			this.start = source.start && source.start.val;
			this.paraProperty =  source.pPr
			&& new writer.model.prop.ParagraphProperty(source.pPr, null, true);
			this.tplc = source.tplc;
			this.numFmt = source.numFmt && source.numFmt.val;
			this.ilvl = source.ilvl;
			this.lvlJc = source.lvlJc && source.lvlJc.val;
			this.tentative = source.tentative;
			this.lvlText = source.lvlText && source.lvlText.val;
			this.textProperty = source.rPr && new writer.model.prop.TextProperty(source.rPr);
			this.lvlPicBulletId = source.lvlPicBulletId && source.lvlPicBulletId.val;
			this.lvlRestart = source.lvlRestart && source.lvlRestart.val;
		},
		getTextProperty : function(){
			return this.textProperty;
		},
		getParaProperty : function(){
			return this.paraProperty;
		},
		setStart : function(start){
			this.start = start;
		},
		getStart : function(){
			var ret = this.start; 
			if(!ret && ret != 0)
				ret = 0;	// Default value.
			return ret;
		},
		isRestart: function(){
			return !(this.lvlRestart == 0);
		},
		setNumFmt : function(numFmt){
			this.numFmt = numFmt;
		},
		getNumFmt : function(){
			return this.numFmt;
		},
		setLvlJc : function(lvlJc){
			this.lvlJc = lvlJc;
		},
		getLvlJc : function(){
			return this.lvlJc;
		},
		setLvlText : function(lvlText){
			this.lvlText = lvlText;
		},
		getLvlText : function(){
			return this.lvlText;
		},
		setTplc : function(tplc){
			this.tplc  = tplc;
		},
		getTplc : function(){
			this.tplc;
		},
		setIlvl : function(ilvl){
			this.ilvl  = ilvl;
		},
		getIlvl : function(){
			this.ilvl;
		},
		setTentative : function(tentative){
			this.tentative  = tentative;
		},
		getTentative : function(){
			this.tentative;
		},
		setLvlPicBulletId : function(lvlPicBulletId){
			this.lvlPicBulletId = lvlPicBulletId;
		},
		getLvlPicBulletId : function(){
			return this.lvlPicBulletId;
		},
		toJson : function(){
			var json = {};
			json.tplc = this.tplc;
			json.ilvl = this.ilvl;
			json.tentative = this.tentative;
			
			json.start = {}, json.numFmt = {}, json.lvlText = {};

			json.start.val = this.start;
			json.numFmt.val = this.numFmt;
			if(  this.lvlJc != undefined ){
				json.lvlJc = {};
				json.lvlJc.val = this.lvlJc;
			}
			
			json.lvlText.val = this.lvlText;
			json.pPr = this.paraProperty && this.paraProperty.toJson();
			json.rPr = this.textProperty && this.textProperty.toJson();
			if(this.lvlPicBulletId != undefined)
			{
				json.lvlPicBulletId = {};
				json.lvlPicBulletId.val = this.lvlPicBulletId;
			}
			if(this.lvlRestart != undefined)
			{
				json.lvlRestart = {};
				json.lvlRestart.val = this.lvlRestart;
			}
			
			json.t = "lvl";
			
			return json;
		},
		isSameStyle: function(targetLvl, isCompareIndent)
		{
			if(!targetLvl)
				return false;
			
			var isSameStyle = false;
			if(this.numFmt == targetLvl.numFmt) 
			{
				if(this.lvlText)
				{
					if(this.lvlText == targetLvl.lvlText)
						isSameStyle = true;
					else if(this.numFmt != "bullet")
					{
						// Compare Numbering, like %3 is same with %4
						// %1. is not same with %1)
						var cur = this.lvlText.substring(2, this.lvlText.length);
						var tar = targetLvl.lvlText.substring(2, targetLvl.lvlText.length);
						if(cur == tar)
							isSameStyle = true;
					}	
				}
				if(!isSameStyle && this.lvlPicBulletId != undefined && this.lvlPicBulletId == targetLvl.lvlPicBulletId)
					isSameStyle = true;
				
				if(isSameStyle && isCompareIndent)
				{
					if(this.paraProperty && targetLvl.paraProperty && this.paraProperty.indentLeft == targetLvl.paraProperty.indentLeft )
						isSameStyle = true;
					else
						isSameStyle = false;
				}
			}
				
			return isSameStyle;
		},
		/**
		 * Change the numbering definition's numFmt, lvlText and lvlPicBulletId. 
		 * @param newDefinition
		 * @param numId The number id, use it to create message
		 * @param level The level, use it to create message
		 * @returns {Array}
		 */
		changeListType: function(newDefinition, numId, level)
		{
			var newJson = {}, oldJson = {};
			newJson["lvl"] = oldJson["lvl"] = level;
			
			newJson["numFmt"] = newDefinition.numFmt;
			if(newDefinition.lvlText) newJson["lvlText"] = newDefinition.lvlText;
			if(newDefinition.lvlPicBulletId) newJson["lvlPicBulletId"] = newDefinition.lvlPicBulletId;
			
			oldJson["numFmt"] = this.numFmt;
			if(this.lvlText) oldJson["lvlText"] = this.lvlText;
			
			if(this.textProperty)
			{
				var rPrData =  this.textProperty.toJson();
				if(rPrData && rPrData instanceof Object )
					oldJson["rPr"] = rPrData;
			}
			if(newDefinition.rPr && newDefinition.rPr instanceof Object)
			{
				newJson["rPr"] = newDefinition.rPr;
				this.textProperty = new writer.model.prop.TextProperty(newDefinition.rPr);
			}
			else
				this.textProperty = null;
			
			oldJson["lvlJc"] = this.lvlJc || "";
			newJson["lvlJc"] = newDefinition.lvlJc || "";
			this.lvlJc = newDefinition.lvlJc;
			
			oldJson["lvlPicBulletId"] = this.lvlPicBulletId;
			newJson["lvlPicBulletId"] = newDefinition.lvlPicBulletId;
			
			this.numFmt = newDefinition.numFmt;
			this.lvlText = newDefinition.lvlText;
			this.lvlPicBulletId = newDefinition.lvlPicBulletId;
			
			var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.List,  [WRITER.MSG.createSetListAttributeAct( numId,newJson,oldJson,WRITER.ACTTYPE.ChangeType )],WRITER.MSGCATEGORY.List  );
			
			return [msg];
		}
};