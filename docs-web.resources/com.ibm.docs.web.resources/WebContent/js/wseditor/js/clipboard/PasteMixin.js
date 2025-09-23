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

dojo.provide("websheet.clipboard.PasteMixin");
dojo.require("websheet.clipboard.CSVHelper");
dojo.require("websheet.widget.InlineEditor");
dojo.require("websheet.i18n.numberRecognizer");
dojo.require("websheet.model.ModelHelper");

dojo.declare("websheet.clipboard.PasteMixin", null,
{
    _prevFocusItem: null,
    _pasteContainer: null,
    _receiveHTML: true,
    
    constructor: function()
    {
    	// For Safari/Chrome
    	var eventName = websheet.widget.InlineEditor.prototype.ONPASTE_EVENT;
    	dojo.subscribe(eventName, dojo.hitch(this, function(e){
    		this._onPaste(e, true);
    	}));
    	this._receiveHTML = !dojo.isFF;
    	this._getPasteContainer();
    },
    
    _getPasteContainer: function()
    {
    	// to receive Image copy in FireFox & IE 11, we can only create 'div' as paste container.
    	try {
			if (this.editor !== null) {
    			var grid = this.editor.getCurrentGrid();
    			var inlineEditor = grid.getInlineEditor();
    			if (dojo.isWebKit) {
    				this._pasteContainer = inlineEditor.getNode();
    			} else if (this._pasteContainer == null) {
    				this._pasteContainer = dojo.create('div', {
    					tabindex: "-1",
    					className: "pasteContainer",
    					title: "paste" // a11y
    				}, dojo.body());
    				this._pasteContainer.contentEditable = true;
    				dojo.connect(this._pasteContainer, "onpaste", this, "_onPaste");
    			}
    			return this._pasteContainer;
			}
		} catch(e){}
//    	if(dojo.isWebKit)
//    	{
//    		try{
//    			if(this.editor !== null)
//    			{
//	    			var grid = this.editor.getCurrentGrid();
//	    			var inlineEditor = grid.getInlineEditor();
//	    			this._pasteContainer = inlineEditor.getNode();
//	    			return this._pasteContainer;
//    			}
//    		}
//    		catch(e){}
//    	}
//    	
//    	else if(this._pasteContainer == null)
//    	{
//    		var useTextArea = !this._receiveHTML;
//    	    this._pasteContainer = dojo.create(useTextArea ? "textarea" : "div",
//    	    {
//    	    	tabindex: "-1",
//    	        className: "pasteContainer",
//    	        title: "paste" // a11y...
//    	    }, dojo.body());
//    	    if(!useTextArea)
//    		    this._pasteContainer.contentEditable = true;
//            dojo.connect(this._pasteContainer, "onpaste", this, "_onPaste");
//    	}
    	return this._pasteContainer;
    },
    
    
    _preparePasteDom: function ()
    {
    	var pc = this._getPasteContainer();
        pc.innerHTML = pc.value = "";
        this._prevFocusItem = null;
        if(dijit._curFocus != pc)
        {
        	this._prevFocusItem = dijit._curFocus;
        	pc.focus();
        }
    },
    
    _onPaste: function (e, fromInlineEditor)
    {
        var elem = e.currentTarget;
        var iePasteText, webkitPasteText;
        var pasteSN;
        if (window.clipboardData)
        {
            iePasteText = window.clipboardData.getData('Text');
        }
        if (e && e.clipboardData)
        {
            webkitPasteText = e.clipboardData.getData("text/plain");
            pasteSN = e.clipboardData.getData(this._customClipType);
            // webkitPasteHtml = e.clipboardData.getData("text/html");
        }
        var text = dojo.isIE ? iePasteText : webkitPasteText;
        var htmlStopped = false;
        var limitation = dojo.isIE ? 3000 : 10000;
        if(this._receiveHTML && text && text.length > limitation)
        {
        	// do not wait the HTML done for this ultra paste event that will lead a browser hang.
        	dojo.stopEvent(e);
        	htmlStopped = true;
        }
//        if (fromInlineEditor) {
//        	elem.blur();
//        }
        setTimeout(dojo.hitch(this, function ()
        {
        	if (!fromInlineEditor)
        		this.editor.focus2Grid();
        	else
        	{
        		elem.focus();
        	}
            if(!this._receiveHTML && text == "")
            {
            	// we can not parse HTML for now, read the text content instead.
            	text = elem.textContent;
            }
           
            if(text && text.length > 1000 || htmlStopped)
            {
            	this.editor.scene.showWarningMessage(this.editor.scene.nls.browserWorkingMsg);
            }
            
            this._onPasteDone(elem, text, pasteSN, htmlStopped);
            
            elem.innerHTML = "";
            
        }, 100));
    },
    
    _onPasteDone: function (elem, text, sn, htmlStopped)
    {
        if (!text)
        {
        	// CTRL+V, but nothing got, it should be a image paste
        	if (this._pasteImagesFromDesktop(elem)) {
        		// it may paste image from external,
        		return;
        	} else {
        		// or it may paste image from internal
        		var data = this._storage.getData();
            	if (data && !data._invalid) {
            		this._pasteFromInternalClipBoard(data);
            	} else {
            		this.editor.scene.hideErrorMessage();
            	}
        	}
            return;
        }
        
        // compare local data and the data from system clipboard to detect
        // whether they are identical, if yes, prefer to use local data because it contains rich information
        var content = this._storage.getData();
        var incomingData = this._comparePasteData(elem, text, sn, htmlStopped, content);
        if (incomingData instanceof Object)
        {
        	// ok not match
        	this.exitSelect();
            this._pasteFromInComingData(incomingData);
        }
        else
        {
        	if(content)
        	{
        		if(!content._invalid)
        		{
	        		this._pasteFromInternalClipBoard(content);
        		}
        		else
        		{
        			this.exitSelect();
        			this.editor.scene.hideErrorMessage();
        			// matched, but not valid, do nothing.
        		}
        	}
        }
    },
    
    /*Bool*/_pasteImagesFromDesktop: function (pastebin) {
    	// summary:
    	//		return, if there's any image in the element;
    	var result = false;
		var htmlContent = pastebin.innerHTML;
		if (!htmlContent || htmlContent.toLowerCase().indexOf('<img') == -1) {
			return false;
		}
		var imgContent = "";
		var images = pastebin.getElementsByTagName('img');
		for ( var i = 0; i < images.length; i++) {
			var img = images[i];
			var src = img.src;
			var validImg = src.match(/^data:image\/([\w]+);base64/);
			if (validImg) {
				// validate image size;
				if ((src.length - 814) * 0.63 > g_maxImgSize * 1024) {
	    			this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[g_maxImgSize]),2000);
				} else {
					this.editor.getImageHdl().uploadImageBase64(src);
				}
				result = true;
			}
		}
		return result;
    },
    
    _pasteFromInComingData: function(incomingData)
    {
    	var grid = this.editor.getCurrentGrid();
    	var sheetName = grid.getSheetName();
    	var selector = grid.selection.activeSelector();
    	var range = selector.getRangeInfo();
		var rowIndex = grid.selection.getFocusedRow() + 1;
	    var colIndex = grid.selection.getFocusedCol(); 
	    
	    if (selector.selectingColumn()) {
	    	// when clipboard is column, current selector is column, normalize focus to column start
	    	rowIndex = 1;
	    	colIndex = range.startCol;
	    } 
	    
	    var data = incomingData.data;
	    
	    var trunked = incomingData.trunked;
	    
    	var columns = 0;
    	for(var i = 0; i < data.length; i++)
    	{
    		var row = data[i];
    		columns = Math.max(row.length, columns);
    	};
    	
    	var endRowIndex = rowIndex;
    	var endColIndex = colIndex;
    	
    	if(data.length > 1)
    		endRowIndex = Math.min(this.editor.getMaxRow(), rowIndex + data.length - 1);
    	
    	if(columns > 1)	
    		endColIndex = Math.min(websheet.Constant.MaxColumnIndex, colIndex + columns - 1);
    	
    	trunked = trunked || endRowIndex < rowIndex + data.length - 1 || endColIndex < colIndex + columns - 1;
    	
    	if(endRowIndex < rowIndex + data.length - 1)
    	{
    		data = data.slice(0, endRowIndex - rowIndex + 1);
    	}
    	
    	if(endColIndex < colIndex + columns - 1)
    	{
    		var _data = [];
    		columns = endColIndex - colIndex + 1;
    		for(var i = 0; i < data.length; i++)
        	{
        		var row = data[i];
        		if(row.length > columns)
        		{
        			row = row.slice(0, columns);
        		}
        		_data.push(row);
        	};
        	data = _data;
    	}
    	
    	this._reviseSelectRect(sheetName, rowIndex, endRowIndex, colIndex, endColIndex, websheet.Constant.Range);
    	
    	if(websheet.model.ModelHelper.isRangeProtected(sheetName, rowIndex, endRowIndex, colIndex, endColIndex)){
    		this.editor.protectedWarningDlg();
    		this.editor.scene.hideErrorMessage();
    		return;
    	}
    	var addr = websheet.Helper.getAddressByIndex(sheetName,rowIndex,colIndex,null,endRowIndex,endColIndex,{refMask:websheet.Constant.RANGE_MASK});
    	if(this.editor.isACLForbiddenArea(addr))
    		return;

    	var scene = this.editor.scene;
		var sceneNls = scene.nls;
		
    	var length = data.length;
    	var rangeJson = {};
    	var step = 80;
    	if(length > step)
    	{
	    	var tm = this.editor.getTaskMan();
	    	
	    	var from = 0, to = 0;;
	    	
	    	for(var i = 0; i < data.length; i++)
	    	{
	    		if((i > 0 && i % step == 0) || i == data.length -1)
	    		{
	    			to = i;
	    			tm.addTask(websheet.Utils, "formatRawValueInJson", [data, rangeJson, rowIndex, colIndex, from, to, columns], tm.Priority.UserOperation);
	    			from = i + 1;
	    		}
	    	};
	    	
	    	var result = {rows: rangeJson};
	    	var params = {result: result, data: result, sheetName: sheetName, startRowIndex: rowIndex, endRowIndex: endRowIndex, 
				     startColIndex:colIndex, endColIndex: endColIndex, cbStartRowIndex: rowIndex, cbStartColIndex: colIndex, forIncomingData:true};
	    	tm.addTask(this, "_pasteRangeCallback", [params], tm.Priority.UserOperation);
	    	
			if(trunked)
				scene.showWarningMessage(this._nls.PASTE_DATA_TRUNKED_PLUS_WORING);
			else
				scene.showWarningMessage(sceneNls.browserWorkingMsg);
	    	
	    	tm.start();
    	}
    	else
    	{
    		websheet.Utils.formatRawValueInJson(data, rangeJson, rowIndex, colIndex, 0, data.length - 1, columns);
    		var result = {rows: rangeJson};
    		var params = {result: result, data: result, sheetName: sheetName, startRowIndex: rowIndex, endRowIndex: endRowIndex, 
				     startColIndex:colIndex, endColIndex: endColIndex, cbStartRowIndex: rowIndex, cbStartColIndex: colIndex, forIncomingData:true};
    		this._pasteRangeCallback(params);
    		
    		if(trunked)
    		{
    			setTimeout(dojo.hitch(this, function(){
    				scene.showWarningMessage(this._nls.PASTE_DATA_TRUNKED, 1500);
    			}), 200);
    		}
    	}
    },
    
    // U+00A0, \s covered this.
    _whiteSpace: new RegExp(String.fromCharCode(160), "gm"),
    
    _normalizePasteValue: function(s, hasQuotes)
    {
    	// special whitespace normalization.
    	if(!s)
    		return s;
    	s = s.replace(this._whiteSpace, " ");
    	
    	if(dojo.isMac && dojo.isChrome)
    	{
    		// defect 21891, when mac chrome copy multiple white spaces out, it will be only one whitespace
    		s = s.replace(/ +/g, " "); 
    	}
    	s = dojo.trim(s);
    	
    	if(hasQuotes)
    	{
    		while (s && s.length > 1 && s.indexOf("\"") == 0 && s.substring(s.length - 1) == "\"")
	    		s = dojo.trim(s.substring(1, s.length - 1));
    	}
    	
    	return s;
    },
    
    _moreLooseComparePasteData: function(sysclip, pasteData, text, htmlStopped)
    {
    	var strictParsedData = websheet.clipboard.CSVHelper.getDataStrictMode(text);
    	
    	var compareResult = htmlStopped ? this._looseComparePasteData(sysclip, strictParsedData, true) : this._strictComparePasteData(sysclip, strictParsedData, true);
    	
    	if(compareResult == strictParsedData)
    		return pasteData;
    	else
    		return true;
    },
        
    _looseComparePasteData: function(sysclip, pasteData, hasQuotes)
    {
    	var sysclipPlainArr = [];
    	for (var i = 0; i < sysclip.length; i++)
    	{
    		var row = sysclip[i];
    		for (var j = 0; j < row.length; j++)
    		{
    			var data = this._normalizePasteValue(row[j], hasQuotes);
    			data && sysclipPlainArr.push(data);
    		}	
    	}
    	var len = sysclipPlainArr.length;
    	var index = 0;
    	for (var i = 0; i < pasteData.data.length; i++)
    	{
    		var row = pasteData.data[i];
    		for (var j = 0; j < row.length; j++)
    		{
    			var data = this._normalizePasteValue(row[j], hasQuotes);
    			if(data)
    			{
    				if(index < len)
    				{
    					if(sysclipPlainArr[index].localeCompare(data) != 0)
    					{
    						return pasteData;
    					}
    				}
    				else
    				{
    					return pasteData;
    				}
    				index ++;
    			}
    		}	
    	}
    	
    	if(index < len-1)
    	{
    		return pasteData;
    	}
    	
    	return true;
    },
    
    _strictComparePasteData: function(sysclip, pasteData, hasQuotes)
    {
    	var innerLen = sysclip.length;
    	var outerLen = pasteData.data.length;
    	var lastDataEmpty = outerLen > 1 && pasteData.data[outerLen - 1] && pasteData.data[outerLen - 1].length == 0;
    	if (innerLen == outerLen || (outerLen == innerLen + 1 && lastDataEmpty))
        {
    		// match the length or out text contains a "\n" in the tail
            for (var i = 0; i < innerLen; i++)
            {
                var row = sysclip[i];
                var pRow = pasteData.data[i];
                if (row.length == pRow.length)
                {
                    for (var j = 0; j < row.length; j++)
                    {
                    	var rd = this._normalizePasteValue(row[j], hasQuotes);
                    	var pd = this._normalizePasteValue(pRow[j], hasQuotes);
                        if (rd.localeCompare(pd) != 0) 
                        	return pasteData;
                    }
                }
                else
                {
                    return pasteData;
                }
            }
        }
        else
        {
            return pasteData;
        }
        return true;
    },
    
    _looseCompareChartPasteData: function(sysclip, pasteData)
    {
    	var s = sysclip.trim();
    	var p = pasteData.trim();
    	if(dojo.isChrome)
    	{
    		// when chrome copy multiple white spaces out, it will be only one whitespace
    		s = s.replace(/ +/g, " "); 
    	}
    	
    	return s.localeCompare(p) == 0;
    },
    
    _IE10ComparePasteData: function(sysclip, pasteData, text)
    {
    	// IE10, when copy table out, no 'TAB' between cell content, just a normal space.
    	// In that case, we would not know how to split cells to compare the data, so use this rough method.
    	var sysString = "";
    	for (var i = 0; i < sysclip.length; i++)
        {
            var row = sysclip[i];
            for (var j = 0; j < row.length; j++)
            {
            	sysString += row[j];
            }
        }
    	
    	sysString = sysString.replace(/\s|\"/g, ""); 
    	text = text.replace(/\s|\"/g, ""); 
    	
    	if(sysString == text)
    		return true;
    	else
    		return pasteData;
    },
    
    _comparePasteData: function (elem, text, sn, htmlStopped, content)
    {
    	if(sn && content && content.sn == sn)
    	{
    		return true;
    	}
    	
    	// safari/webkit can check the node in inline editor, but basically it would not goes to here.
    	var toCheckHtml = this._receiveHTML && !htmlStopped;
    	
        if (toCheckHtml && content && content.sn)
        {
        	// IE11 will also copy a empty text node after table node
        	// so make elem.childNodes.length >= 1
        	if (elem.childNodes && elem.childNodes.length >= 1)
        	{
        		 var ele = elem.childNodes[0];
                 if( ( (ele.tagName == "SPAN" && dojo.hasClass(ele, "Apple-style-span") )
                		 || (ele.tagName == "DIV" && dojo.hasClass(ele, "copyContainer") )) // sometimes select copy dom node rather than node content in CopyMixin._selectRange
                	 && ele.childNodes && ele.childNodes.length >= 1)
                	 ele = ele.childNodes[0];
                 if (ele.tagName == "TABLE")
                 {
                     var sn = content.sn;
                     if (sn === ele.id)
                     {
                         return true;
                     }
                 }
        	}
        }
        
        var pasteData = websheet.clipboard.CSVHelper.getData(text);
        
        if (toCheckHtml)
        	// the paste html does not match ours.
        	return pasteData;
        
        else if(content && content.sysclip)
        {
        	// for Firefox browser, or big HTML we just stopped to receive
        	var sysclip = content.sysclip;
        	if(typeof sysclip == "string"){
	        	if(typeof text == "string" && this._looseCompareChartPasteData(sysclip, text)){//paste chart
	        		return true;
	        	}
	        	return pasteData;
        	}
        	
        	var limited = content.contentLimited || htmlStopped;
        	
           	if((dojo.isIE && dojo.isIE >= 10) || dojo.isEdge)
        	{
        		return this._IE10ComparePasteData(sysclip, pasteData, text, limited);
        	}
        	if(text.indexOf("\"") > -1)
        		// the paste data is not a strict CSV, if the incoming data contains double quotes,
        		// it may have line break, and if our internal data have no double quotes, and our copy
        		// would not output line break out since the line break have been transformed into a whitespace,
        		// so in that case, incoming data with double quotes, we do not, then it does not come from internal copy.
        		
        		// but if we really have double quotes in cell, the thing is becoming complex, we can not 100% for sure of that.
        		return this._moreLooseComparePasteData(sysclip, pasteData, text, limited);
        	else if (limited)
        		return this._looseComparePasteData(sysclip, pasteData);
        	else
        		return this._strictComparePasteData(sysclip, pasteData);
        }
        
        return pasteData;

    }
});