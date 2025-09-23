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

dojo.provide("websheet.view.View");

dojo.require("dojo.cookie");
dojo.require("concord.beans.User");
dojo.requireLocalization("websheet", "view");
dojo.requireLocalization("websheet", "base");

dojo.declare("websheet.view.View", null, {
	_documentObj: null,
	_IDManager: null,
	_filterMenu: null,
	_filterElement: null,
	_viewFilterHandler: null,
    bMSFormula: true,
	REGEXP: /^((ftp|http|https):\/\/)+/i,
	REGEXPURL: /^((http(s|)\:\/\/)|(ftp\:\/\/(([\u0020-\u00fe]+:[\u0020-\u00fe]+|anonymous)@)?))?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])(\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])){3}|([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6})(:\d+)?(\/([\d\w\@\.\%\+\-\=\&amp;\?\:\\\&quot;\'\,\|\~\;\#])*)*$/i,
	DEFAULT_PROTOCOL: "http://",
	constructor: function() {
		this._render();
		
		var pe = window.pe = { base: this };
		
		pe.authenticatedUser = this.loadAuthentication();
		
		// dummy scene
		pe.scene = {
			getLocale: function() {
				if (!this.locale) {
					this.locale = g_locale;
					var sheetLocale = dojo.cookie("sheetLocale");
	        		if (sheetLocale) {
	           			this.locale = sheetLocale;
	        		}
				}
				return this.locale;
			},
			setLocale: function(locale) {
				this.locale = locale;
			},
			getEditor: function() {
				return pe.base;
			},
			bean: {
				getRepository: function() {
					return g_Repository;
				},
				getUri: function() {
					return g_DocUri;
				}
			},
			hideErrorMessage: function() {
				//no use in view
			
			}
		};
		
		if (g_sheets.length > 0)
		{
			this.onNewSheetLoaded(g_sheets[0]["id"]);
		}
	},
	
	loadAuthentication: function() {
		var user = new concord.beans.User(g_authUser);
		user.setEntitlements(g_EntitlementsStr);
		return user;
	},
	
    emitErrorMessage: function(e){
        if (djConfig.isDebug) {
            console.warn(e);
        }
        throw ("#ERROR!");
    },
	
    getIDManager: function() {
    	if(!this._IDManager){
    		this._IDManager = new websheet.model.IDManager();
    	}
    	return this._IDManager;
    },
    
    getPartialManager: function() {
    	if(!this._partialManager){
    		this._partialManager = new websheet.model.PartialManager();
    	}
    	return this._partialManager;
    }, 
    
	getDocumentObj: function() {
		if (!this._documentObj) {
			this._initClientModel();
			this._documentObj = new websheet.model.Document();
		}
		return this._documentObj;
	},
	
	getController: function() {
		return this;
	},
	
    loadDocument: function(content) {
		this._documentObj = this.getDocumentObj();
    	this._documentObj.init(content, null, true);
    },
    
    onNewSheetLoaded: function(sheetId) {
    	this._fixTableWidth(sheetId);
    	
    	var data = g_documentData[sheetId];
    	this._loadSheetId=sheetId;
    	if (data) {
    		this.loadDocument(data);
    	}else {
    		this.filterEvent();
    	}
    	this._refreshDecimal(sheetId);

    	this._checkColumnExceeded(sheetId);
    },
    
    _checkColumnExceeded: function(sheetId) {
    	var n = dojo.byId("grid-" + sheetId);
    	if (dojo.hasClass(n, "columnExceeded")) {
    		var sheetName = this._getSheetName(sheetId);
			var nls = dojo.i18n.getLocalization("websheet", "base");
    		var warningMessage = dojo.string.substitute(nls.BEYOND_COLUMNS_NUMBER_SHEET_MSG, [sheetName, websheet.Constant.MaxColumnIndex]);
			this.showMessage(warningMessage, 5000);
    	}
    },
    
    _fixTableWidth: function(sheetId) {
    	
		// nee to fix tabe width if table is smaller than its container 
		var wrapperWidth = this._getGridWrapperWidth(sheetId);
		// query for all columns and sum their width
		var n = dojo.byId("grid-" + sheetId);
		if (!n) {
			return;
		} 
			    	
    	if (dojo.isIE){
			var colNodes = dojo.query("col", n);
			var tableWidth = 0;
			// if total table width greater then container width then we not need to
			// add width
			for (var i = 0; i < colNodes.length; ++i)
			{
				var colNode = colNodes[i];
				tableWidth += dojo.style(colNode, "width");
				if (tableWidth >= wrapperWidth) {
					break;
				}
			}
			if (tableWidth < wrapperWidth)
			{
				dojo.style(n, "width", tableWidth + "px");
			}	
    	}else{
    		dojo.style(n, "width", 0);
    	}
    },
    
	_getGridWrapperWidth: function(sheetId) {
		var id = "pane-" + sheetId;
		return dojo.contentBox(dojo.byId(id)).w;
	},
	
	_getSheetName: function(sheetId) {
		for (var i = 0; i < g_sheets.length; i++) {
			var sheet = g_sheets[i];
			if (sheet["id"] == sheetId) {
				return sheet["sheetname"];
			}
		}
	},
    
    showMessage: function(text, /* timeout to hide, 0 to never hide */ timeout, /* false for warning */ isError) {
    	var imgPath = isError ? '/images/error.png' : '/images/warning.png';
    	var className = isError ? 'lotusMessage' : 'lotusMessage lotusWarning'

		var messageNode = dojo.byId("message");
		dojo.attr(messageNode, "className", className);
    	dojo.attr(dojo.byId("messageImg"), "src", contextPath + window.staticRootPath + imgPath);
    	dojo.byId("messageText").innerHTML = text;
    	
    	dojo.style(messageNode, "display", "inline-block");
    	var messageWidth = dojo.marginBox(messageNode).w;
    	var browserWidth = dojo.marginBox(dojo.body()).w;
		var left = (browserWidth - messageWidth) / 2;
		dojo.style(messageNode, "left", left + "px");
		dojo.style(messageNode, "top", "8px");
		
		if (timeout > 0) {
			setTimeout(dojo.hitch(this,this.hideMessage), timeout);
		}
    },
    
    hideMessage: function() {
    	dojo.style(dojo.byId("message"), "display", "none");
    },
    
    _refreshDecimal: function(sheetId) {
    	var decimalNodeList = dojo.query("td.decimal", dojo.byId("grid-" + sheetId));
    	if (decimalNodeList && decimalNodeList.length > 0)
    	{
    		dojo.require("websheet.i18n.Number");
	    	decimalNodeList.forEach(function(node) {
	    		var s = node.innerHTML;
	    		s = this.f(parseFloat(s));
	    		node.innerHTML = s;
	    	}, { f: dojo.hitch(websheet.i18n.Number, websheet.i18n.Number.roundFloat) });
    	}
    },
   
    // The method will get called back from document partial loading
    _postRender: function() {
    	var docObj = this.getDocumentObj();
    	var sheetId = this._loadSheetId;
    	var sheet = docObj.getSheetById(sheetId);
    	if (sheet) {
    		var sheetName = sheet.getSheetName();
    		var rangeInfo = {
    			startRow: 1,
    			startCol: 1,
    			endRow: 5000,
    			endCol: websheet.Constant.MaxColumnIndex,
    			"sheetName": sheetName
    		};
    		var cellArray = websheet.model.ModelHelper.getMixedCells(rangeInfo, true);
    		var colArray = websheet.model.ModelHelper.getCols(rangeInfo, true);
    		dojo.query("td.rawValue", dojo.byId("grid-" + sheetId)).forEach(function(node) {
    			var id = node.id;
    			// match and find rowIndex and colIndex
    			var matches = /r(\d+)_c(\d+)/.exec(id);
    			if (matches != null) {
    				// rowIndex and colIndex are 0-based, matches cellArray
    				var rowIndex = parseInt(matches[1]);
    				var colIndex = parseInt(matches[2]);
    				var row = this.cellArray.data[rowIndex];
    				if (row && row.data) {
    					var cell = row.data[colIndex];
    					if (cell) {
    						var column = this.colArray.data[colIndex];
    						var colStyleId = column ? column.getStyleId() : null;
    						// workaround to get _cv and link
    						cell.getShowValue(colStyleId);
    						var currentValue = cell._calculatedValue;
    						//if need conditional style
    						var isString = cell != null && cell.isString();
    						var link = cell.link;
    						//search the link without protocol and add http://
    						if(link && this.context.REGEXPURL.test(link)){
    							if(!this.context.REGEXP.test(link)){
    								link = this.context.DEFAULT_PROTOCOL + link;	
    							}
    							node.innerHTML = "<a href ='" + link + "'>" + websheet.Helper.escapeXml(cell.getShowValue(colStyleId)) + "</a>";
    						}else{
    							node.innerHTML = websheet.Helper.escapeXml(cell.getShowValue(colStyleId));
    						}
    						var style = cell.getStyle(colStyleId);
    						if(style != null){
    							var fmcolor = style.getAttr(websheet.Constant.Style.FORMAT_FONTCOLOR)? style.getAttr(websheet.Constant.Style.FORMAT_FONTCOLOR) : "";
        						var fColorArray = fmcolor.split(";"); //"positive;negative;zero;text"
        						var lenFC = fColorArray.length;
        						var fColor = fColorArray[0]; //"[blue]#.0" or "[blue]@@"
        						
        						var formatCode = style.getAttr(websheet.Constant.Style.FORMATCODE)? style.getAttr(websheet.Constant.Style.FORMATCODE) : "";
        						var fCodeArray = formatCode.split(";");
        						var lenFCode = fCodeArray.length;
        						if(isString){
        		    				if(this.context._isTextFormat(fCodeArray[lenFCode - 1]))
        		    					fColor = fColorArray[lenFC - 1]; 	
        		    				else
        		    					fColor = null;
        		    			}
        		    			else if(currentValue > 0){
        		    				if(lenFC > 0)
        		    					fColor = fColorArray[0];
        		    			}
        		    			else if(currentValue < 0){
        		    				if(lenFC > 1)
        		    					fColor = fColorArray[1];
        		    			}		
        		    			else if(currentValue == 0){
        		    				if(lenFC > 2)
        		    					fColor = fColorArray[2];
        		    			}
        						if(fColor){
        							dojo.style(node, "color", fColor);
        						}
    						}
    						
    						// if need left alignment
    						var align = node.style.textAlign;
    						if (!align || align.length == 0) {
    							if (cell.getError()) {
    								// keep right align if cell has error
    								;
    							} else if (!cell.isNumber()) {
    								dojo.style(node, "textAlign", "left");
    							} else {
    								// if set to "text" FORMAT
    								var style = cell.getStyle(colStyleId);
							        if (style) {
							        	var category = style.getAttr(websheet.Constant.Style.FORMATTYPE);
							        	if (category && category == "text") {
							        		dojo.style(node, "textAlign", "left");
							        	}
							        } else {
							       		var format = cell.getFormulaFormat();
							       		if (format && format.category == "text") {
							       			dojo.style(node, "textAlign", "left");
							       		}
							        }
    							}
    						}
    					}
    				}
    			}
    		}, { cellArray: cellArray, colArray: colArray, context: this});
    	}
    	this.filterEvent();
    },
    
    filterEvent: function(){
    	var filterHeadNode = "FilterHeader_" + this._loadSheetId;
    	this._filterElement = dojo.byId(filterHeadNode);
    	var filterElement = this._filterElement;
    	if(filterElement){
    		dojo.connect(filterElement,'onmouseover',this,'doMouseOverEvent');
    		dojo.connect(filterElement,'onmouseout',this,'doMouseOutEvent');
    		dojo.connect(filterElement,'onclick',this,'doClickEvent');
    	}
    },
    doMouseOverEvent: function(e){
    	var filterElement = this._filterElement;
		dojo.addClass(filterElement, "filterHeaderHoverIcon");	
	},
	
	doMouseOutEvent: function(e){
		var filterElement = this._filterElement;
        dojo.removeClass(filterElement, "filterHeaderHoverIcon");
	},
	
    doClickEvent:function(e){		
		var selColIndex = 0;
//		dojo.require("websheet.widget.FilterContextMenu");
		dojo.require("websheet.view.ViewFilterHandler");
		//var content = dojo.byId("sheetContainer");//dojo.body();pane-st3
		var sheetId = this._loadSheetId;
		
		this._viewFilterHandler = new websheet.view.ViewFilterHandler(sheetId);
		this._filterMenu = this._viewFilterHandler._filterMenu;
		var filterElement = this._filterElement;

		var pps = dojo.position(filterElement);
		var ppt = dojo.marginBox(filterElement);
		var headerX = filterElement.offsetLeft;
		var headerY = filterElement.offsetTop;
		var width = filterElement.clientWidth;
		var height = filterElement.clientHeight;
		headerY += height; 
		var pos = {x:headerX, y:headerY, w:width, h:height};
		//show the Context menu or hide it if it's shown
		if(this._filterMenu!=null && this._filterMenu.isShow()){
		//hide it
			this._viewFilterHandler.hideContextMenu();
		}else{
			this._viewFilterHandler.prepareContextMenu();
		    this._viewFilterHandler.showContextMenu(pos);
		} 
	},
	
	
    /* boolean */_isTextFormat : function(formatCode) 
	 {
		 var replaced = formatCode.replace(/([\\\\].)/ig, "");
		 return replaced.match(/@/) != null ? true : false;
	 },	
    _render: function() {
		// locale setting
		if(g_locale == 'ja' || g_locale == 'ja-jp') {
			dojo.body().addClass("lotusJapanese");
		}
		// translate menu
		translateMenu();
		dojo.style("mainMenu", "display", "");
		dijit.byId("gridLineItem").attr("checked", false);
		
		window.g_sheetContainer = createSheetContainer(dojo.byId("sheetContainer"));
		if (g_sheets.length > 0) {
			dojo.forEach(g_sheets, function(sheet, i) {
				var pane = new dijit.layout.ContentPane({
					title: sheet["sheetname"],
					sheetIndex: i,
					"id": "pane-" + sheet["id"],
					"class": "gridWrapper"
				});
				
				g_sheetContainer.addChild(pane);
			});
			var sheet = g_sheets[0];
			var w = dijit.byId("pane-" + sheet["id"]);
			var n = dojo.byId("grid-" + sheet["id"]);
			dojo.place(n, w.domNode);
			if (dojo.isFF) {
				dojo.place(dojo.create("div", { "class": "clear"}), w.domNode);
			}
			g_sheetContainer.layout();
		} else {
			var nls = dojo.i18n.getLocalization("websheet", "view");
			this.showMessage(nls.emptySheet, 5000);
		}
    },
    
    _initClientModel: function() {
    	// escape dojo build system scan
		dojo["require"]("websheet.view._ViewClientModel");
    	websheet.Constant.init();
    	websheet.functions.Formulas.init();
    }
});
