dojo.require("writer.model.Numbering");
dojo.require("writer.model.listPrototype");
dojo.require("writer.model.numberingDefinition");

dojo.provide("writer.model.list");

writer.model.list = function(id) {
	this.id = id;
	this.paras = [];
	this.absNum = null;
	this.listSymbolProperties = {};
	this.init();
};

writer.model.list.prototype = {
	modelType : writer.MODELTYPE.LIST,
	init : function() {
		this.absNum = pe.lotusEditor.number.getAbsNum(this.id);
	},
	/**
	 * Add paragraph into list
	 */
	addPara: function(para)
	{
		if(this.paras.length == 0)
			this.paras.push(para);
		else
		{	
			// TODO Special case for list in text box
			var curPath = writer.util.ModelTools.getParagraphPath(para);
			var existPath, compareResult;
			for(var i = this.paras.length - 1; i >= 0 ; i--)
			{
				// Compare from back to front.
				// Performance improvement with Binary search
				var existPath = writer.util.ModelTools.getParagraphPath(this.paras[i]);
				var compareResult = common.tools.arrayCompare(curPath, existPath);
				if(compareResult > 0)
				{
					if(i == this.paras.length - 1)
						this.paras.push(para);
					else
						this.paras.splice(i+1, 0, para);
					break;
				}	
				else if(compareResult < 0)
				{
					if(i == 0)
						this.paras.unshift(para);
					else
						continue;
				}
				else
				{
					if(para.id && this.paras[i].id != para.id) // Defect 41770, Same content copied in different header/ footer
						this.paras.push(para);
					else
						throw "The paragraph has been isnerted into this list.";
				}
			}	
		}
		
		var listPpr = pe.lotusEditor.number.getListPr(this.id,
				para.directProperty.getNumLevel());
		para.directProperty.listParaProperty = listPpr;
	},
	/**
	 * The function was used to rearrange the paragraph sequence of list.
	 * Like merge/split cell or apply merge/split cell message.
	 */
	rebuild: function()
	{
		this.needRebuild = true;
	},
	
	/**
	 * The function is rebuild implementation function, it's called when the list will be update
	 * It will add these paragraphs into list again.
	 */
	_rebuildImpl: function()
	{
		if(!this.needRebuild)
			return;
		this.needRebuild = false;
		
		var paraArray = this.paras;
		this.paras = [];
		for(var i = 0; i < paraArray.length; i++)
			this.addPara(paraArray[i]);
	},
	
	/**
	 * Only use this function in loading
	 * @param para
	 * @param refPara
	 * @param withoutMsg
	 */
	appendParaInLoading : function(para){//, refPara, withoutMsg) {
		this.paras.push(para);
		var listPpr = pe.lotusEditor.number.getListPr(this.id,
				para.directProperty.getNumLevel());
		para.directProperty.listParaProperty = listPpr;
	},
//	isSameStyle : function(list, lvl) {
//		if (lvl) {
//			var thisFmt = this.absNum.getNumDefinitonByLevel(lvl).getNumFmt();
//			var thatFmt = list.absNum.getNumDefinitonByLevel(lvl).getNumFmt();
//			if (thisFmt == thatFmt)
//				return true;
//		}
//		return false;
//	},
	removePara : function(para, count) {
		var index = this.paras.indexOf(para);
		if (index >= 0) {
			if (!count) {
				count = this.paras.length - index;
			}
			var ret = this.paras.splice(index, count);
			for(var i = 0; ret && i < ret.length; i++)
			{
				ret[i].directProperty.listParaProperty = null;
			}	
				
			return ret;
		}
	},
	getParagraph: function(index){
		return this.paras[index];
	},
	getParagraphs: function()
	{
		return this.paras;
	},
	getAbsNum : function() {
		return this.absNum;
	},
	getParagraphProperty : function(level) {

	},
	getListSymbolProperty : function(level) {
		if (!this.listSymbolProperties[level]) {
			var lvlInfo = this.absNum.getNumDefinitonByLevel(level);
			if (lvlInfo)
			{
				var textProp = lvlInfo.getTextProperty();
				var paraProp = lvlInfo.getParaProperty();
				var styleTextProp = null;
				if(paraProp && paraProp.styleId && paraProp.styleId != paraProp.getDefaultVal())
				{
					var refStyle = pe.lotusEditor.getRefStyle(paraProp.styleId);
					styleTextProp = refStyle && refStyle.getMergedTextProperty();
					if(styleTextProp == "empty")
						styleTextProp = null;
				}	
				
				if(styleTextProp)
					textProp = textProp ? styleTextProp.merge(textProp) : styleTextProp;
					
				this.listSymbolProperties[level] = textProp;
			}
		}

		return this.listSymbolProperties[level];
	},
	/**
	 * Update the list value immediately
	 * @param isUpdate is true when call from update manager
	 */
	updateListValueNow: function(isUpdate){
		this._rebuildImpl();
		
		var paras = this.paras;
		var updateParas = [];
		var listValues = [ null, null, null, null, null, null, null, null, null ];
		var lvlJustifications = {};
		var preLevel = -1;
		for ( var i = 0; i < paras.length; i++) {
			var para = paras[i];
			var indentLevel = para.directProperty.getNumLevel();
			if( indentLevel == -1 )
				continue;
			
			if(preLevel == -1 || preLevel > indentLevel)
			{	
				for ( var k = 0; k < indentLevel; k++) {
					if (!listValues[k])
						listValues[k] = Math.round(this.absNum.getNumDefinitonByLevel(k).getStart()) || 0;
				}
				if( preLevel > indentLevel && !listValues[indentLevel])
					listValues[indentLevel] = Math.round(this.absNum.getNumDefinitonByLevel(indentLevel).getStart()) || 0;
				
				k++;
				for (; k < listValues.length; k++) {
					if( this.absNum.getNumDefinitonByLevel(k).isRestart() )
						listValues[k] = null;
				}
			}
			else if(preLevel < indentLevel - 1)
			{
				for(var k = preLevel + 1; k < indentLevel; k++)
				{
					if (!listValues[k])
						listValues[k] = Math.round(this.absNum.getNumDefinitonByLevel(k).getStart()) || 0;
				}	
			}
			
			var value;
			if( listValues[indentLevel] || listValues[indentLevel] == 0 )
				value = listValues[indentLevel] + 1;
			else
				value = Math.round(this.absNum.getNumDefinitonByLevel(indentLevel).getStart());
			
			listValues[indentLevel] = value;

			preLevel = indentLevel;
			
			lvlJustifications[indentLevel] = lvlJustifications[indentLevel] || this.absNum.getNumDefinitonByLevel(indentLevel).getLvlJc();
			
			var changed = this._updateListSymbol(para, indentLevel, value, listValues, lvlJustifications[indentLevel]);
			if(changed)
			{
				updateParas.push(para);
				if(isUpdate)
				{
					para.markReset();
					para.parent.update();
				}
			}
		}
		return updateParas;
	},
	/**
	 * Cache the updated list and update them before render. 
	 * @returns {Array}
	 */
	updateListValue : function() {
		pe.lotusEditor.updateManager.addChangedList(this);
	},
	/**
	 * 
	 * @param para
	 * @param lvl
	 * @param val
	 * @param listValues
	 * @param justification	The numbering horizontal alignment, left/right/center
	 * @returns
	 */
	_updateListSymbol : function(para, lvl, val, listValues, justification) {
		if (!this.absNum.getNumDefinitonByLevel(lvl)) {
			return;
		}
//		para.directProperty.listParaProperty = pe.lotusEditor.number.getListPr(this.id, lvl);
		
		var lvlObj = this.absNum.getNumDefinitonByLevel(lvl);
		var lvlText = lvlObj.getLvlText() || "";
		var picBulletId = lvlObj.getLvlPicBulletId();
		if (!picBulletId && picBulletId != 0) {
			var isMultiLevel = lvlText.indexOf("%") == lvlText.lastIndexOf("%") ? false
					: true;
			if (isMultiLevel) {
				for ( var i = 0; i < lvl + 1; i++) {
					lvlText = this._getSymbolText(lvlText, i, listValues);
				}
			} else {
				lvlText = this._getSymbolText(lvlText, lvl, listValues);
			}

		}
		if(lvlText != "" || picBulletId || picBulletId == 0)	// No lvlText will not display list and Tab. 
			lvlText = lvlText + "\t";
		return para.setListSymbol(lvlText, picBulletId, justification);
	},
	_getSymbolText : function(lvlText, lvl, listValues) {
		var type = 1;	// Default type
		var numFmt = this.absNum.getNumDefinitonByLevel(lvl).getNumFmt();
		
		// Defect 39557, Hard code for this special case.
		var isMultiLevel = lvlText.indexOf("%") == lvlText.lastIndexOf("%") ? false : true;
		if(isMultiLevel && lvl == 0 && numFmt == "upperRoman")
		{
			// only have two %
			var startIdx = lvlText.indexOf("%");
			var endIdx = lvlText.lastIndexOf("%");
			var subStr = lvlText.substring(startIdx + 1, endIdx);
			if(subStr && subStr.indexOf("%") == -1 )
				numFmt = "decimal";
		}	
		
		switch (numFmt) {
		case "lowerLetter":
		case "lowerLetterParenthesis":
			type = "a";
			break;
		case "lowerRoman":
			type = "i";
			break;
		case "upperLetter":
			type = "A";
			break;
		case "upperRoman":
			type = "I";
			break;
		case "decimal":
		case "decimalB":
		case "decimalParenthesis":
		case "decimalZero":	
			type = 1;
			break;
		case "none":
			return "";	// Shall not display any numbering.
		}
		var symbol = type ? writer.model.list.prototype.getNextValue(type,
				type, (listValues[lvl] - 1)) : "";
		if(symbol == undefined || symbol == "NaN")
			symbol = "";
		if(numFmt == "decimalZero" && symbol < 10)
			symbol = "0" + symbol;
		var regx = new RegExp("%" + (Math.round(lvl) + 1));
		lvlText = lvlText.replace(regx, symbol);
		return lvlText;
	},
	
	/**
	 * Check if the numbering is a decimal list
	 * @param lvl
	 * @returns 0 Decimal, 1 Letter, 3 other
	 */
	getListType: function(lvl){
		var lvlObj = this.absNum.getNumDefinitonByLevel(lvl);
		var numFmt = lvlObj.getNumFmt();
		if(numFmt && numFmt.indexOf("decimal") != -1)
			return 0;
		if(numFmt && numFmt.indexOf("Letter") != -1)
			return 1;
		
		var lvlText = lvlObj.getLvlText() || "";
		
		// Defect 39557, Hard code for this special case.
		var isMultiLevel = lvlText.indexOf("%") == lvlText.lastIndexOf("%") ? false : true;
		if(isMultiLevel && lvl == 0 && numFmt == "upperRoman")
		{
			// only have two %
			var startIdx = lvlText.indexOf("%");
			var endIdx = lvlText.lastIndexOf("%");
			var subStr = lvlText.substring(startIdx + 1, endIdx);
			if(subStr && subStr.indexOf("%") == -1 )
				return 0;
		}
		
		return 3;
	},
	
	/**
	 * Get the sequence of the paragraph in the list
	 * @param para
	 */
	getListContext: function(checkPara){
		var paras = this.paras;
		var updateParas = [];
		var listValues = [ null, null, null, null, null, null, null, null, null ];
		var lvlJustifications = {};
		var preLevel = -1;
		for ( var i = 0; i < paras.length; i++) {
			var para = paras[i];
			var indentLevel = para.directProperty.getNumLevel();
			if( indentLevel == -1 )
				continue;
			
			if(preLevel == -1 || preLevel > indentLevel)
			{	
				for ( var k = 0; k < indentLevel; k++) {
					if (!listValues[k])
						listValues[k] = Math.round(this.absNum.getNumDefinitonByLevel(k).getStart()) || 0;
				}
				if( preLevel > indentLevel && !listValues[indentLevel])
					listValues[indentLevel] = Math.round(this.absNum.getNumDefinitonByLevel(indentLevel).getStart()) || 0;
				
				k++;
				for (; k < listValues.length; k++) {
					if( this.absNum.getNumDefinitonByLevel(k).isRestart() )
						listValues[k] = null;
				}
			}
			else if(preLevel < indentLevel - 1)
			{
				for(var k = preLevel + 1; k < indentLevel; k++)
				{
					if (!listValues[k])
						listValues[k] = Math.round(this.absNum.getNumDefinitonByLevel(k).getStart()) || 0;
				}	
			}
			
			var value;
			if( listValues[indentLevel]  || listValues[indentLevel] == 0 )
				value = listValues[indentLevel] + 1;
			else
				value = Math.round(this.absNum.getNumDefinitonByLevel(indentLevel).getStart());
			
			listValues[indentLevel] = value;

			preLevel = indentLevel;
			
			if(checkPara == para)
				return {value: value, values:listValues, level: indentLevel};
		}
		return null;
	},
	
	getListSymbolPreview : function(listContext) {
		var lvl = listContext.level;
		var listValues = listContext.values;
		
		if (!this.absNum.getNumDefinitonByLevel(lvl)) {
			return;
		}

		var lvlObj = this.absNum.getNumDefinitonByLevel(lvl);
		var lvlText = lvlObj.getLvlText() || "";
		var picBulletId = lvlObj.getLvlPicBulletId();
		if (!picBulletId && picBulletId != 0) {
			var isMultiLevel = lvlText.indexOf("%") == lvlText.lastIndexOf("%") ? false
					: true;
			if (isMultiLevel) {
				for ( var i = 0; i < lvl + 1; i++) {
					lvlText = this._getSymbolText(lvlText, i, listValues);
				}
			} else {
				lvlText = this._getSymbolText(lvlText, lvl, listValues);
			}

		}
		
		return lvlText;
	},

	getNextValue : function(type, currentValue, offset) {
		var ret = "";
		var base = this.getBaseType(type);
		if (offset == 0) {
			ret = base.values ? base.values[0] : 1;
		} 
		else if(offset < 0){
			ret = base.values ? base.values[0] : 0;
		}
		else {
			if (offset == null || offset == "" || offset == undefined) {
				offset = 1;
			}
			ret = base.getNextValue(currentValue, offset);
		}
		return ret;
	},
	
	getNumberingDefintion: function(level)
	{
		return this.absNum.getNumDefinitonByLevel(level);
	},
	
	/**
	 * Change the level's numbering definition
	 * @param style The new numbering definition
	 * @param level The changed level
	 * @return Return the message
	 */
	changeListStyle: function(newNumberingDefinition, level)
	{
		var curNumberingDefintion = this.getNumberingDefintion(level);
		var msgs = curNumberingDefintion.changeListType(newNumberingDefinition, this.id, level);
		//Defect 53111
		if(curNumberingDefintion.start === 0 && this.getListType(level) != 0)
			msgs = msgs.concat(this.setNumberingStart(1,level));
		this.listSymbolProperties[level] = null;
		this.updateListValue();
		return msgs;
	},

	setNumberingStart: function(startVal, level){
		var curNumberingDefintion = this.getNumberingDefintion(level);
		var oldStart = curNumberingDefintion.start;
		if(!oldStart && oldStart != 0)
			oldStart = "null";
		
		var newJson = {}, oldJson = {};
		newJson["lvl"] = oldJson["lvl"] = level;
		newJson["val"] = startVal;
		oldJson["val"] = oldStart;
		
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.List,  [WRITER.MSG.createSetListAttributeAct( this.id, newJson, oldJson, WRITER.ACTTYPE.ChangeStart )],WRITER.MSGCATEGORY.List  );
		
		if(startVal == "null")
			startVal = null;
		curNumberingDefintion.setStart(startVal);
		
		this.updateListValue();
		return [msg];
	},
	
	/**
	 * Reset the list contained paragraphs to update them
	 */
	reset: function()
	{
		this.updateListValue();
		var para;
		for(var i = 0; i < this.paras.length; i++)
		{
			para = this.paras[i];
    		para.markReset();
    		para.buildRuns();
    		para.parent.update();
		}
	},
	
	/**
	 * Check if the jsonData defined style same with current list.
	 */
	isSameStyle: function(abstractNum, isCompareIndent)
	{
		var curNumDefs = this.absNum.getNumDefinition();
		var tarNumDefs = abstractNum.getNumDefinition();
		if(curNumDefs.length != tarNumDefs.length)
			return false;
		
		for(var i = 0; i < curNumDefs.length; i++)
		{
			if(!curNumDefs[i].isSameStyle(tarNumDefs[i], isCompareIndent))
				return false;
		}	
		
		return true;
	}
};
common.tools.extend(writer.model.list.prototype, new writer.model.listPrototype());