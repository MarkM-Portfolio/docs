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

dojo.provide("websheet.clipboard.CopyMixin");
dojo.require("websheet.clipboard.CopyIEMenuMixin");
dojo.require("concord.util.BidiUtils");
dojo.declare("websheet.clipboard.CopyMixin", websheet.clipboard.CopyIEMenuMixin,
{
    COPY_URL_ATTR: "ibm_docs_ss_url",
    COPY_RANGE_ATTR: "ibm_docs_ss_range",
    COPY_LAST_VALUE_POSITION_ATTR: "ibm_docs_ss_last_value",
    COPY_CHART_ATTR: "ibm_docs_ss_chart",

    constructor: function ()
    {
        if (dojo.isWebKit)
        {
            // for Mac Safari/Chrome
            var dom = dojo.body();
            dojo.connect(dom, "onbeforecopy", dojo.hitch(this, "_selectDummyCopyCutContainer"));
            dojo.connect(dom, "onbeforecut", dojo.hitch(this, "_selectDummyCopyCutContainer"));
            this._createDummyCopyCutContainer();
        }
        
        this._createCopyCutContainer();
    },
    
    _selectDummyCopyCutContainer: function()
    {
    	 var grid = this.editor.getCurrentGrid();
         if(grid && grid.getInlineEditor() && grid._focusWithInGrid())
         {
        	this._dummyCopyCutContainer.value = ' ';
         	// Body::OnBeforeCopy -> make Dummy container focus and select -> Dummy::OnCopy
         	this._dummyCopyCutContainer.focus();
         	this._dummyCopyCutContainer.select();
         }
    },
    
    _createDummyCopyCutContainer: function()
    {
    	if(!this._dummyCopyCutContainer)
    	{
	    	this._dummyCopyCutContainer = dojo.create("textarea",
	        {
	            className: "copyContainer",
	            title: "_copy",
	            innerHTML: " ",
	            tabindex : "-1"
	        }, dojo.body());
	    	dojo.connect(this._dummyCopyCutContainer, "oncopy", dojo.hitch(this, function (e)
            {
	    		if(this.editor.scene.supportInCurrMode(commandOperate.COPY))
                	this.editor.execCommand(window.commandOperate.COPY, [e]);
            }));
	    	dojo.connect(this._dummyCopyCutContainer, "oncut", dojo.hitch(this, function (e)
	        {
	            if(this.editor.scene.supportInCurrMode(commandOperate.CUT))
	                 this.editor.execCommand(window.commandOperate.CUT, [e]);
	        }));
    	}
    },
    
    _createCopyCutContainer: function()
    {
    	if(!this._copyCutContainer)
    	{
	    	this._copyCutContainer = dojo.create("div",
	        {
	            className: "copyContainer"
	        }, dojo.body());
    	}
    },

    _getCopyCutContainer: function (forCut)
    {
    	this._copyCutContainer.contentEditable = forCut || !dojo.isSafari;
    	return this._copyCutContainer;
    },

    _prepareCopyDom: function (dom, data)
    {
    	if (data.data.img && data.data.img.svg)
    		return this._prepareCopyShapeDom(dom, data);
    	else if (data.data.img) 
        	return this._prepareCopyImageDom(dom, data);
        else if(data.data.chart)
        	return this._prepareCopyChartDom(dom, data);
        else 
        	return this._prepareCopyRangeDom(dom, data);
    },
    
    // In order to improve formula calculation performance, spreadsheet has been implemented
    // to calculate formulas cell in visible page and calc remaining formulas at background with calcManager.
    // when copy one big range, there would have some cells that aren't being calculated, so need
    // to detect it
    _checkRawFormula: function(cell)
    {
    	if(cell && cell.model)
    	{
    		if(cell.model.isFormula() && !cell.model.isCalculated())
    			return true;
    	}
    	return false;
    },

    _prepareCopyRangeDom: function (dom, data)
    {
        var result = this._generateClipForRangeCopy(data);
        if(result == null)
        {
        	 dom.innerHTML = "<div></div>";
        	 return null;
        }
        result.limited = data._limited || result.limited;
        
        dom.innerHTML = result.html;

        var table = dom.childNodes[0];
        // cascade cell style to the link.
        dojo.forEach(dojo.query("a", table), function (link)
        {
            var td = link.parentNode;
            var color = td.style.color;
            if (color) dojo.style(link, "color", color);
            var textDec = td.style.textDecoration;
            if (textDec) dojo.style(link, "textDecoration", textDec);
        });

        return result;
    },

    _prepareCopyImageDom: function (dom, data)
    {
        var result = this._generateClipForImageCopy(data);
        dom.innerHTML = result.html;
        return result;
    },
    
    _prepareCopyShapeDom: function (dom, data)
    {
        var result = this._generateClipForShapeCopy(data);
        dom.innerHTML = result.html;
        return result;
    },
    
    _prepareCopyChartDom: function (dom, data)
    {
        var result = this._generateClipForChartCopy(data);
        dom.innerHTML = result.html;
        return result;
    },
    
    _translateBorder: function(b)
    {
    	if(b === "thick")
    		return 3;
    	else if(b == "thin")
    		return 1;
    	else
    		return parseInt(b);
    },
    
    _getStyleCode: function(cell)
    {
    	if(!cell.style)
    		return null;
    	if(cell._styleCode)
    		return cell._styleCode;
    	else
    	{
    		cell._styleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON, cell.style); 
    		return cell._styleCode;
    	}
    },
    
    _findCellsBelow: function(cell, position, nextCells)
    {
    	var cells = [];
    	var colspan = cell && cell.cs ? cell.cs : 1;
    	
    	var len = nextCells.length;
    	var _position = 0;
    	
    	for(var i = 0; i < len; i ++)
    	{
    		var _cell = nextCells[i];
    		
        	if(i > 0)
        	{
        		var _colspan = _prevCell && _prevCell.cs ? _prevCell.cs : 1;
        		_position += _colspan;
        	}
        	
        	_prevCell = _cell;
        	
        	var _colspan = _cell && _cell.cs ? _cell.cs : 1;
        	var _start = _position;
        	var _end = _start + _colspan;
        	
        	if(_start > position)
        		break;
        	
        	if(position >= _start && position < _end)
        	{
        		cells.push(_cell);
        	}
    	}
    	
    	return cells;
    },
    
    _getDefaultStyleCss: function()
    {
    	if(this._defaultStyleCss)
    		return this._defaultStyleCss;
    	else
    	{
    		var dcsAttrs = websheet.style.DefaultStyleCode._attributes;
    		var wcs = websheet.Constant.Style;
    		var arrCss = [];
    		var attr = dcsAttrs[wcs.TEXT_ALIGN];
			if (attr && attr != "left") {
				arrCss.push("text-align:", attr, ";");
			}
			var vattr = dcsAttrs[wcs.VERTICAL_ALIGN];
			if (vattr) {
				arrCss.push("vertical-align:", vattr, ";");
			}
			else
			{
				arrCss.push("vertical-align:", "bottom;");
			}
			var iattr = dcsAttrs[wcs.INDENT];
			if (iattr && iattr != 0) {
				if(attr && attr == "left") {
					if(iattr >= 0) {
						arrCss.push("padding-left:", iattr, "px;");
					}
					else {
						// this is a workaround about ods import, the max indent is a negative value.
						arrCss.push("padding-left:", 2250, "px;");
					}
				}
				else if(attr && attr == "right") {
					arrCss.push("padding-right:", iattr, "px;");
				}
			}
			var bU, bST;
			bU = !!dcsAttrs[wcs.UNDERLINE];
			bST = !!dcsAttrs[wcs.STRIKETHROUGH];
			if (bU || bST) {
				arrCss.push("text-decoration:");
				if (bU) {
					arrCss.push("underline");
				}
				// else don't mark unerline
				if (bST) {
					arrCss.push(" line-through");
				}
				// else don't mark strikethrough
				arrCss.push(";");
			}
			this._defaultStyleCss = arrCss.join("").replace(/[<>'"]/g, "");;	
			return this._defaultStyleCss;
    	}
    },
    
    _attachBorder: function(cell, styleCode, position, nextCell, nextRow)
    {
    	var cssString = "";
    	// attach border information
		var wcs = websheet.Constant.Style;
        var sc = {};
        if(styleCode)
        	sc = styleCode._attributes;
        var defaultSc = websheet.style.DefaultStyleCode._attributes;
		
        // width
		var leftBorder = sc[wcs.BORDER_LEFT] || defaultSc[wcs.BORDER_LEFT];
		var rightBorder = sc[wcs.BORDER_RIGHT] || defaultSc[wcs.BORDER_RIGHT];
		var bottomBorder = sc[wcs.BORDER_BOTTOM] || defaultSc[wcs.BORDER_BOTTOM];
		var topBorder = sc[wcs.BORDER_TOP] || defaultSc[wcs.BORDER_TOP];
		
		// color
		var defaultColor =  websheet.Constant.DEFAULT_BORDER_COLOR_VALUE;
		var blColor = sc[wcs.BORDER_LEFT_COLOR] || defaultSc[wcs.BORDER_LEFT_COLOR] || defaultColor;
        var brColor = sc[wcs.BORDER_RIGHT_COLOR] || defaultSc[wcs.BORDER_RIGHT_COLOR] || defaultColor;
        var bbColor = sc[wcs.BORDER_BOTTOM_COLOR] || defaultSc[wcs.BORDER_BOTTOM_COLOR] || defaultColor;
        var btColor = sc[wcs.BORDER_TOP_COLOR] || defaultSc[wcs.BORDER_TOP_COLOR] || defaultColor;
        
        //style
        var defaultStyle =  websheet.Constant.DEFAULT_BORDER_STYLE_VALUE;
		var blStyle = sc[wcs.BORDER_LEFT_STYLE] || defaultSc[wcs.BORDER_LEFT_STYLE] || defaultStyle;
        var brStyle = sc[wcs.BORDER_RIGHT_STYLE] || defaultSc[wcs.BORDER_RIGHT_STYLE] || defaultStyle;
        var bbStyle = sc[wcs.BORDER_BOTTOM_STYLE] || defaultSc[wcs.BORDER_BOTTOM_STYLE] || defaultStyle;
        var btStyle = sc[wcs.BORDER_TOP_STYLE] || defaultSc[wcs.BORDER_TOP_STYLE] || defaultStyle;
        
        if(cell && (cell.cs && cell.cs > 1) && cell.model)
        {
        	// use correct right border.
        	var model = cell.model;
        	var rowModel = model._parent;
        	var col = model.getCol();
        	var idx = col + cell.cs -1;
        	var coveredLastCell = rowModel.getCell(idx, websheet.Constant.CellType.STYLE, true) || {};
        	var column = model._getSheet().getColumn(idx, true) || {};
        	
        	var styleId = coveredLastCell._styleId ||  column._styleId;
        	
        	var sc = {};
        	
        	if(styleId)
        	{
        		var styleManager = this.editor.getDocumentObj()._styleManager;
        		var stylesMap = styleManager.styleMap;
        		
        		var ssc = stylesMap[styleId];
        		if(ssc)
        			sc = ssc._attributes || {};
        	}
        	
        	rightBorder = sc[wcs.BORDER_RIGHT] || defaultSc[wcs.BORDER_RIGHT];
    		bottomBorder = sc[wcs.BORDER_BOTTOM] || defaultSc[wcs.BORDER_BOTTOM];
    		
    		brColor = sc[wcs.BORDER_RIGHT_COLOR] || defaultSc[wcs.BORDER_RIGHT_COLOR] || defaultColor;
            bbColor = sc[wcs.BORDER_BOTTOM_COLOR] || defaultSc[wcs.BORDER_BOTTOM_COLOR] || defaultColor;
            
            brStyle = sc[wcs.BORDER_RIGHT_STYLE] || defaultSc[wcs.BORDER_RIGHT_STYLE] || defaultStyle;
            bbStyle = sc[wcs.BORDER_BOTTOM_STYLE] || defaultSc[wcs.BORDER_BOTTOM_STYLE] || defaultStyle;
        }
        
        if(rightBorder && nextCell)
        {
        	var nextSc = {};
        	var nextStyleCode = this._getStyleCode(nextCell);
        	if(nextStyleCode)
        		nextSc = nextStyleCode._attributes;
        	
        	var nextSc_leftBorder = nextSc[wcs.BORDER_LEFT] || defaultSc[wcs.BORDER_LEFT];
        	
        	// thick, thin
        	if(nextSc_leftBorder && nextSc_leftBorder !== "0")
        	{
        		var intLeftBorder = this._translateBorder(nextSc_leftBorder);
        		var intRightBorder = this._translateBorder(rightBorder);
        		
        		if(intRightBorder <= intLeftBorder)
        		{
        			rightBorder = null;
        		}
        	}
        }
        
        if(bottomBorder && nextRow)
        {
        	var cells = this._findCellsBelow(cell, position, nextRow);
        	if (cells && cells.length == 1)
        	{
        		// only one cell below, which means that the below cell is bigger or just the same width as ourself.
        		var belowCell = cells[0];
        		if (belowCell)
        		{
        			var belowSc = {};
                	var belowStyleCode = this._getStyleCode(belowCell);
                	if(belowStyleCode)
                		belowSc = belowStyleCode._attributes;
                	
                	var belowCell_topBorder = belowSc[wcs.BORDER_TOP] || defaultSc[wcs.BORDER_TOP];
                	
        			if(belowCell_topBorder && belowCell_topBorder !== "0")
        			{
                		var intBottomBorder = this._translateBorder(bottomBorder);
                		var intTopBorder = this._translateBorder(belowCell_topBorder);
        				
                		if(intTopBorder >= intBottomBorder)
        				{
                			bottomBorder = null;
        				}
        			}
        		}
        	}
        }
        
        var borderAttached = false;
        
        if(blColor == btColor && btColor == brColor && brColor == bbColor && bbColor == blColor)
        {
        	if(leftBorder == rightBorder && leftBorder == bottomBorder && leftBorder == topBorder)
			{
        		if(leftBorder !== "0" && leftBorder !== null)
        		{
        			var border = this._translateBorder(leftBorder);
        			if (border > 0)
        				cssString += "border:" + border + "px " + blStyle +" " + blColor + ";";
        		}
				borderAttached = true;
			}
        }
        if(!borderAttached)
        {
	        if(leftBorder !== "0" && leftBorder !== null)
	        	cssString += ("border-left:" + this._translateBorder(leftBorder) + "px " + blStyle +" " + blColor + ";");
	        if(rightBorder !== "0" && rightBorder !== null)
	        	cssString += ("border-right:" + this._translateBorder(rightBorder) + "px " + brStyle +" " + brColor + ";");
	        if(topBorder !== "0" && topBorder !== null)
	        	cssString += ("border-top:" + this._translateBorder(topBorder) + "px " + btStyle +" " + btColor + ";");
	        if(bottomBorder !== "0" && bottomBorder !== null)
	        	cssString += ("border-bottom:" + this._translateBorder(bottomBorder) + "px " + bbStyle +" " + bbColor + ";");
        }
        
        return cssString;
    },
    
    _formatCell: function(cell, position, nextCell, nextRow, column)
    {
    	var cssString = this._getDefaultStyleCss();
    	
    	// take nextCell, nextRow into account to compute the border.
        if (!cell) 
        {
        	cssString += this._attachBorder(cell, null, position, nextCell, nextRow);
        	if(column)
            {
             	cssString += column;
            }
        	if(!cssString)
        		return "";
        	else
        		return " style='" + cssString + "' ";
        }
        
        var str = "";
        
        var wsconst = websheet.Constant;
        
        var cellModel = cell.model;
        var v = cellModel ? cellModel._rawValue : "";
        var isString = (cellModel != null) && cellModel.isString();
     	var styleCode = null;
		
        if (cell.style)
        {
            styleCode = this._getStyleCode(cell);
            var wcs = wsconst.Style;
    		var attrs = styleCode._attributes;
    		var fontSize = attrs[wcs.SIZE];
    		
            cssString += styleCode.getCssString();
            
            if (cssString)
            {
                // White color is default color
                cssString = cssString.replace("background-color:#ffffff", "");
                // or not started with "-"  var re = /^(?!-).?color:#000000/g
                cssString = cssString.replace(";color:#000000", ";");
                
                // use pt for copy
                cssString = cssString.replace(/font\-size:\d+px;/, "");
                if(fontSize)
                	cssString += (";font-size: " + fontSize + "pt;");
            }
            
            var format = cell.style.format;
            if (format)
            {
                if (format[wcs.FORMATTYPE])
                {
                    //str = " ibm_docs_ss_format_category='" + this._normalizeHTMLAttr(format[wcs.FORMATTYPE]) + "'";
                    if (format[wcs.FORMATTYPE] == "text") isString = true;
                }
                /*
    			if(format[wcs.FORMATCODE])
    				str += " ibm_docs_ss_format_code='" + this._normalizeHTMLAttr(format[wcs.FORMATCODE]) + "'";
    			if(format[wcs.FORMATCURRENCY])
    				str += " ibm_docs_ss_format_currency='" + this._normalizeHTMLAttr(format[wcs.FORMATCURRENCY]) + "'";
    			*/
                if (format[wcs.FORMAT_FONTCOLOR])
                {
                    //str += " ibm_docs_ss_format_fmcolor='" + this._normalizeHTMLAttr(format[wcs.FORMAT_FONTCOLOR]) + "'";
                	var cv = this._getValue(cell);
                    if (cv !== undefined)
                    {
                        var formatColor = format[wcs.FORMAT_FONTCOLOR] ? format[wcs.FORMAT_FONTCOLOR] : "";
                        var formatCode = format[wcs.FORMATCODE] ? format[wcs.FORMATCODE] : "";
                        var fColor = websheet.Utils.getFormatColor(cv, formatColor, formatCode, isString, this._getType(cell));
                        if (fColor) cssString += "color:" + fColor;
                    }
                }
            }
        }
        
        cssString += this._attachBorder(cell, styleCode, position, nextCell, nextRow);
        
        if(column && !cell.style)
        {
        	cssString += column;
        }
        
        // by default the text-align is right, unless text direction is 'rtl'
        if (isString) {
        	if (!BidiUtils.isBidiOn()) {
        		cssString = "text-align:left;" + cssString;
        	} else {
        		var direction = null;
        		if(styleCode && styleCode._attributes)
        			direction = styleCode._attributes[websheet.Constant.Style.DIRECTION];
        		if((direction === "ltr") || (!direction && !BidiUtils.isTextRtl(v))) {
        			if (cellModel && cellModel.isError()) {
        				cssString = "text-align:center;" + cssString;
        			} else {
        				cssString = "text-align:left;" + cssString;
        			}
        		}
        	}
        }
        
        if (cssString) 
        {
        	cssString = cssString.replace(/;;/g, ";");
        	if(cssString.charAt(0) == ";")
        		cssString = cssString.substring(1, cssString.length);
        	str += " style='" + cssString + "'";
        }

        var colspan = cell.cs;
        if (colspan)
        {
            if (str) 
            	return str + " colspan=" + colspan;
            else 
            	return " colspan=" + colspan;
        }

        return str;
    },

    _normalizeHTMLAttr: function (s)
    {
        if (s) return s.replace(/'/g, "&apos;");
        return s;
    },

    _generateClipForImageCopy: function (content)
    {
        var img = content.data.img;
        var src = img.href;
        var id = new Date().valueOf();
        return {
            html: "<img id='ibm_docs_ss_img_" + id + "' src='" + src + "' width='" + img.w + "' height='" + img.h + "'></img>"
        };
    },
    
    _generateClipForShapeCopy: function (content)
    {
        var sn = "ibm_docs_ss_shape_" + new Date().valueOf();
        return {
        	obj: " ",
            html: "<table id='" + sn + "' ibm_docs_ss_shape='" + this._normalizeHTMLAttr(content.srcRangeId)  + "'>" + "<tbody><tr><td>&nbsp;</td></tr></tbody></table>"
        };
    },
    
    _generateClipForChartCopy: function (content)
    {        
        var json = this._generateChartJsonForCopy(content);
        var jsonStr = dojo.toJson(json);
        var normalizedJsonStr = this._normalizeHTMLAttr(jsonStr);
        var sn = "ibm_docs_ss_chart_" + (dojo.isIE ? "IE_" : "") + new Date().valueOf();
        content.sn = sn;
        var location = window.location.href;
        var poStr = "&nbsp;";
        return {
        	obj: " ",
            html: "<table id='" + sn + "' " + this.COPY_URL_ATTR + "='" + this._normalizeHTMLAttr(location) + "' " + this.COPY_CHART_ATTR + "='" + this._normalizeHTMLAttr(content.srcRangeId)  +"' name = '" + normalizedJsonStr + "'>" + "<tbody><tr><td>" + poStr + "</td></tr></tbody>"+ "</table>"
        };
    },
    
    _normalizeChartJson: function(chart){
    	return chart.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
        .replace(/>/gm, "&gt;").replace("/\r\n/g", "&nbsp;").replace(/\n/g, "&nbsp;").replace(/\r/g, "&nbsp;").replace(/\t/g, "&nbsp;").replace(/ /g, "&nbsp;"); // transform line break to white blank
    },
    
    _generateChartJsonForCopy: function(content)
    {
    	var chart = content.data.chart;
        var chartId = content.srcRangeId;
    	var doc = this.editor.getDocumentObj();
    	var chartDoc = doc._charts[chartId];
    	var svg;
    	if(chartDoc)
    		svg = chartDoc.getSvg();
    	var chartJson = {
    		"chart":this._generateChartJsonForCopyPaste(chart),
    	    "width":chart.w,
    	    "height":chart.h,
    	    "svg":svg
    	};
    	return chartJson;
    },
    
    //remove ref, add exRef or remove transform exRef to ref
    //currUri when paste   
    _generateChartJsonForCopyPaste:function(chart, currUri)
    {    	
    	var chartJson = dojo.clone(chart.chart);
    	if(chartJson.plotArea){
			var axisJson = chartJson.plotArea.axis;
			if(axisJson){
				for(var i = 0; i < axisJson.length; i++){
					var axis = axisJson[i];
					if(axis.numFmt && currUri !== chart.uri){//paset to another file or to clipboard
						axis.numFmt.sourceLinked = 0;
					}
					if(axis.cat){//paste in the same file
						if(currUri === chart.uri){
							if(axis.cat.ref && axis.cat.cache)
								delete axis.cat.cache.pts;
						}
						else{
							if(axis.cat.ref){//paset to another file or to clipboard
								axis.cat.exRef = "[" + chart.uri + "]" + axis.cat.ref;
								delete axis.cat.ref; 
							}else if(currUri && axis.cat.exRef){
								var exR = websheet.Helper.parseExRef(axis.cat.exRef);
								if(exR && currUri == exR.uri){//paste back to original file
									axis.cat.ref = exR.ref;
									if(axis.cat.cache)
										delete axis.cat.cache.pts;
									delete axis.cat.exRef;
								}
							}
						}
					}
				}
			}
			chartJson.plotArea.axis = axisJson;
			
			var plotsJson = chartJson.plotArea.plots;
			if(plotsJson){
				for(var i = 0; i < plotsJson.length; i++){
					var plot = plotsJson[i];
					if(plot.series){
						for(var j = 0; j < plot.series.length; j++){
							var series = plot.series[j];
							if(series.label){
								if(currUri === chart.uri){
									if(series.label.ref)
										delete series.label.v;
								}
								else{
									if(series.label.ref){
										series.label.exRef = "[" + chart.uri + "]" + series.label.ref;
										delete series.label.ref;
									}else if(currUri && series.label.exRef){
										var exR = websheet.Helper.parseExRef(series.label.exRef);
										if(exR && currUri == exR.uri){
											series.label.ref = exR.ref;
											delete series.label.v;
											delete series.label.exRef;
										}
									}
								}
							}
							if(series.yVal){ 
								if(currUri === chart.uri){
									if(series.yVal.ref && series.yVal.cache)
										delete series.yVal.cache.pts;
								}
								else{
									if(series.yVal.ref){
										series.yVal.exRef = "[" + chart.uri + "]" + series.yVal.ref;
										delete series.yVal.ref;
									}else if(currUri && series.yVal.exRef){
										var exR = websheet.Helper.parseExRef(series.yVal.exRef);
										if(exR && currUri == exR.uri){
											series.yVal.ref = exR.ref;
											if(series.yVal.cache)
												delete series.yVal.cache.pts;
											delete series.yVal.exRef;
										}
									}
								}
							}
							if(series.xVal){
								if(currUri === chart.uri){
									if(series.xVal.ref && series.xVal.cache)
										delete series.xVal.cache.pts;
								}
								else{
									if(series.xVal.ref){
										series.xVal.exRef = "[" + chart.uri + "]" + series.xVal.ref;
										delete series.xVal.ref;
									}
									else if(currUri && series.xVal.exRef){
										var exR = websheet.Helper.parseExRef(series.xVal.exRef);
										if(exR && currUri == exR.uri){
											series.xVal.ref = exR.ref;
											if(series.xVal.cache)
												delete series.xVal.cache.pts;
											delete series.xVal.exRef;
										}
									}
								}
							}
						}
					}
				    plotsJson[i] = plot;
				}
			}
			chartJson.plotArea.plots = plotsJson;
		}
    	return chartJson;
    },    
    
    _getRowHeight: function(cell)
    {
    	if(cell && cell.model)
    	{
    		var row = cell.model._parent;
    		if(row)
    			return row._calcHeight || row._height;
    	}
    	return null;
    },
    
    _getColumnStyle:function(cols, colIndex)
	{
		var defaultWidth = websheet.Constant.DEFAULT_COLUMN_WIDTH;
		var width = 0;
		var col = cols && cols[colIndex];
		var width = defaultWidth;
		var visible = true;
		if(col){
			var tmpWidth = col.getWidth();
			if(tmpWidth !== null)
				width = tmpWidth;
			visible = col.isVisible();
		}
		return {width: width, visible: visible};
	},
    
    _gatherCells: function(d)
    {
        var helper = websheet.Helper;
        var data = d.data;
        var refValue = d.refValue;
        var refType = d.refType;
        var cbRef = websheet.Helper.parseRef(refValue);
        var cellsArray = [];
        var table = [];

        var sheetName = this.editor.getCurrentGrid().getSheetName();
        var maxCellsNumber = this._cutting && (dojo.isWebKit || dojo.isIE )? websheet.Constant.MaxCutCellsWebKit :websheet.Constant.MaxCopyCells;
        var maxSheetRows = this.editor.getMaxRow();
        var cellsNumberLimited = false;
        var containsRawFormula = false;
        var cols;
        
        if (data.cell)
        {
        	var range = {};
        	range.sheetName = sheetName;
        	range.startCol = cbRef.startCol;
        	range.endCol = cbRef.endCol;
        	cols = websheet.model.ModelHelper.getCols(range, true, true).data; 
 		
            // one cell
        	containsRawFormula = containsRawFormula || this._checkRawFormula(data.cell);
            if(containsRawFormula)
            	return null;
        	cellsArray.push([data.cell]);
            table.push([this._normalizeShowValueForJSON(data.cell)]);
        }
        else if (data.rows)
        {
        	var cbRefType = cbRef.getType();
            var prevRow;
            if (cbRefType != websheet.Constant.RangeType.COLUMN)
            {
                var startColumn = cbRef.startCol;
                var endColumn = cbRef.endCol;
                var range = {};
        		range.sheetName = sheetName;
        		range.startCol = startColumn;
        		range.endCol = endColumn;
        		cols = websheet.model.ModelHelper.getCols(range, true, true).data; 

                var maxRow = maxSheetRows;
                if (endColumn > startColumn) 
                	maxRow = parseInt(maxCellsNumber / (endColumn - startColumn + 1));
                maxRow = Math.min(maxRow, maxSheetRows);
                
                var endRow = Math.min(cbRef.endRow, cbRef.startRow + maxRow - 1);
                
                if (cbRef.endRow > endRow)
                {
                	cellsNumberLimited = true;
                }
                for (var i = cbRef.startRow; i <= endRow; i++)
                {
                    var rowObj = [];
                    var rowCells = [];
                    var currentRow = data.rows[i];
                    var repeatRow = false;
                    if (currentRow && currentRow.cells)
                    {
                        var cells = currentRow.cells;
                        var prevCell = null;
                        var prevCellCol;
                        for (var j = startColumn; j <= endColumn; j++)
                        {
                            var chr = helper.getColChar(j);
                            var hasValue = false;
                            if (cells[chr] && !cells[chr].ic)
                            {
                            	containsRawFormula = containsRawFormula || this._checkRawFormula(cells[chr]);
                                if(containsRawFormula)
                                	return null;
                            	rowCells.push(cells[chr]);
                                hasValue = true;
                                if (cells[chr].cs)
                                {
                                	// covered cell would be skiped here..
                                    j = j + cells[chr].cs - 1;
                                }
                                prevCell = cells[chr];
                                prevCellCol = j;
                            }
                            rowObj.push(this._normalizeShowValueForJSON(cells[chr], cols[j - startColumn]) || "");
                            if (!hasValue)
                            {
                                if (prevCell && prevCell.rn && j <= prevCell.rn + prevCellCol)
                                {
                                	rowCells.push(prevCell);
                                }
                                else 
                                {
                                	rowCells.push(null);
                                }
                            }
                        }
                    }
                    else
                    {
                        if (!currentRow)
                        {
                            if (prevRow && prevRow.rn && i <= prevRow.rn + prevRowIndex)
                            {
                                repeatRow = true;
                                rowCells = prevRowCells;
                                rowObj = dojo.clone(prevRowObj);
                            }
                        }
                        if (!repeatRow)
                        {
                            for (var j = startColumn; j <= endColumn; j++)
                            {
                            	rowCells.push(null);
                                rowObj.push("");
                            }
                        }
                    }
                    
                    var _row = repeatRow ? prevRow : currentRow;
                    /*
                    if (_row && _row.visibility === "hide")
                    {
                        // not to add row obj
                    }
                    else
                    {
                    */
                        table.push(rowObj);
                        cellsArray.push(rowCells);
                    //}

                    if (currentRow)
                    {
                        prevRow = currentRow;
                        prevRowIndex = i;
                        prevRowCells = rowCells;
                        prevRowObj = rowObj;
                    }
                }
            }
            else
            {
                // copy a column
                var startColumn = cbRef.startCol;
                var endColumn = cbRef.endCol;
                
                var range = {};
        		range.sheetName = sheetName;
        		range.startCol = startColumn;
        		range.endCol = endColumn;
        		cols = websheet.model.ModelHelper.getCols(range, true, true).data; 
              
                var maxRow = maxCellsNumber /(endColumn -startColumn + 1);
                if(maxRow < maxSheetRows)
                {
                	cellsNumberLimited = true;
                }
                maxRow = Math.min(maxRow, maxSheetRows);
                for (var i = 1; i <= maxRow; i++)
                {
                    var rowObj = [];
                    var rowCells = [];
                    var currentRow = data.rows[i];
                    var repeatRow = false;
                    if (currentRow && currentRow.cells)
                    {
                        var cells = currentRow.cells;
                        for (var j = startColumn; j <= endColumn; j++)
                        {
                            var hasValue = false;
                            var chr = helper.getColChar(j);
                            if (cells[chr])
                            {
                            	containsRawFormula = containsRawFormula || this._checkRawFormula(cells[chr]);
                                if(containsRawFormula)
                                	return null;
                            	rowCells.push(cells[chr]);
                                hasValue = true;
                                if (cells[chr].cs)
                                {
                                    j = j + cells[chr].cs - 1;
                                }
                            }
                            if (!hasValue) 
                            {
                            	rowCells.push(null);
                            }
                            rowObj.push(this._normalizeShowValueForJSON(cells[chr], cols[j - startColumn]) || "");
                        }
                    }
                    else
                    {
                        if (!currentRow)
                        {
                            if (prevRow && prevRow.rn && i <= prevRow.rn + prevRowIndex)
                            {
                                repeatRow = true;
                                rowCells = prevRowCells;
                                rowObj = dojo.clone(prevRowObj);
                            }
                        }
                        if (!repeatRow)
                        {
                            for (var j = startColumn; j <= endColumn; j++)
                            {
                            	rowCells.push(null);
                                rowObj.push("");
                            }
                        }
                    }

                    var _row = repeatRow ? prevRow : currentRow;
                    if (_row && _row.visibility === "hide")
                    {
                        // not to add row obj
                    }
                    else
                    {
                        table.push(rowObj);
                        cellsArray.push(rowCells);
                    }

                    if (currentRow)
                    {
                        prevRow = currentRow;
                        prevRowIndex = i;
                        prevRowCells = rowCells;
                        prevRowObj = rowObj;
                    }
                }
            }
        }
        
        var result = 
        {
        	cells: cellsArray,
        	obj: table,
            limited: cellsNumberLimited,
            cols: cols
        };
        return result;
    },
    
    _columnStyleToCSSString: function(style)
    {
		var strCss = "";
		var attr = null;
		var wcs = websheet.Constant.Style;

		if(style[wcs.TEXT_ALIGN])
		{
			strCss += "text-align:" + style[wcs.TEXT_ALIGN] + ";";
		}
		if(style[wcs.VERTICAL_ALIGN])
		{
			strCss += "vertical-align:" + style[wcs.VERTICAL_ALIGN] + ";";
		}
		if(style[wcs.PADDING_LEFT])
		{
			strCss += "padding-left:" + style[wcs.PADDING_LEFT] + ";";
		}
		if(style[wcs.PADDING_RIGHT])
		{
			strCss += "padding-right:" + style[wcs.PADDING_RIGHT] + ";";
		}
		if(style[wcs.BACKGROUND_COLOR])
		{
			strCss += "background-color:" + style[wcs.BACKGROUND_COLOR] + ";";
		}
		if(style["font"])
		{
			var font = style["font"];
			var name = font[wcs.FONTNAME];
			var size = font[wcs.SIZE];
			var underline = font[wcs.UNDERLINE];
			var line_through = font[wcs.STRIKETHROUGH];
			var italic = font[wcs.ITALIC];
			var bold = font[wcs.BOLD];
			
			if(name)
				strCss += "font-family:" + name + ";";
			
			if(size)
			{
				strCss += "font-size:" + size + "pt;";
			}
			
			if(bold)
				strCss += "font-weight:bold;";
			if(italic)
				strCss += "font-style:italic;";
				
			if (underline || line_through) {
				strCss += "text-decoration:";
				if (underline) {
					strCss += "underline "; 
				}
				if (line_through) {
					strCss += "line-through";
				}
				strCss += ";";
			}
		}
		
		return strCss;
    },
    
    _computeHtml: function(d, cellsResult, sn)
    {
    	var rows = cellsResult.cells;
    	var cols = cellsResult.cols;
    	var obj = cellsResult.obj;
    	var lastValueRow = 0;
    	var lastValueCell = 0;
    	
    	var len = obj.length;
    
    	outer:
    	for(var i = len -1; i >=0 ;i--)
    	{
    		var row = obj[i];
    		for(var j = row.length -1; j >=0 ;j--)
    		{
    			if(row[j])
    			{
    				lastValueCell = j;
    				lastValueRow = i;
    				break outer;
    			}
    		}
    	}
    	
    	var lastValuePosition = lastValueRow + ":" + lastValueCell;
    	
    	var refValue = d.refValue;
    	var cbRef = websheet.Helper.parseRef(refValue);
    	
        var location = window.location.href;
        var defaultCellFontFamily = "Arial, Verdana, sans-serif;";
        var b = dojo.body();
        if(dojo.hasClass(b, "lotusJapanese"))
        {
        	defaultCellFontFamily = "MS PMincho, MS PGothic, Apple Gothic, Arial, Verdana, sans-serif;";
        }
        else if(dojo.hasClass(b, "lotusKorean"))
        {
        	defaultCellFontFamily = '"Gulim","GulimChe", Arial, Helvetica, sans-serif;';
        }
        
        var tableStyle = "text-align:right;font-size:10pt;font-family:" + defaultCellFontFamily;
        
        var dsc = websheet.style.DefaultStyleCode;
        if(dsc)
        {
        	var dscCss = dsc.toCssString();
        	if (dscCss)
        	{
        		var wcs = websheet.Constant.Style;
        		var fontSize = dsc._attributes[websheet.Constant.Style.SIZE];
        		dscCss = dscCss.replace(/font\-size:\d+px;/, "");
        		  // use pt for copy
        		if(fontSize && fontSize != 10)
        			dscCss += (";font-size: " + fontSize + "pt;");
        		
        		// NOTE:
        		// Not all css style appened on table will cascade to td when copy.
        		// OK : Font-Family, Font-Size, Background-Color, Font-Color, Bold, Italic
        		// Not-OK: Line-Through, Underline, Text-Align
        		// And, Border information need to be taken into consideration carefully.
        		
        		// append default cell style into copy table.
        		tableStyle += dscCss;
        	}
        }
        
        tableStyle = tableStyle.replace(/;;/g, ";");
        
        var tableHeader = "<table id='" + sn + "' " + this.COPY_URL_ATTR + "='" + this._normalizeHTMLAttr(location) + "' "+ this.COPY_RANGE_ATTR +"='" + this._normalizeHTMLAttr(refValue) + "' " + this.COPY_LAST_VALUE_POSITION_ATTR + "='" + lastValuePosition + "' class='copyTable' cellspacing='0' cellpadding='0' style='"+tableStyle+"'>";
        
        var startColIndex = cbRef.startCol;
        var endColIndex = cbRef.endCol;
        
        var columnsData = [];
        var columns = "";
        var data = d.data;
        
        if(d.refType != websheet.Constant.Column && !data.columns)
        {
        	// Range copy.
	        for(var j = startColIndex; j <= endColIndex; j++)
	        {
	        	var style = this._getColumnStyle(cols, j - startColIndex);
	        	if(style)
	        	{
	        		var w = style.visible ? style.width : 0;
	        		columns += "<col style='width:" + w + "px;'/>";
	        	}
	        }
        }
        else
        {
        	// Copy All or one column.
        	if(!startColIndex)
        		startColIndex = 1;
        	if(!endColIndex)
        		endColIndex = websheet.Constant.MaxColumnIndex;
        	var wcs = websheet.Constant.Style;
        	for(var j = startColIndex; j <= endColIndex; j++)
	        {
        		var name = websheet.Helper.getColChar(j);
        		var width = data.columns && data.columns[name] && data.columns[name][wcs.WIDTH] ? data.columns[name][wcs.WIDTH] : websheet.Constant.DEFAULT_COLUMN_WIDTH;
        		if(data.columns && data.columns[name] && data.columns[name].visibility == "hide")
        			width = 0;
        		var column = "";
        		if(width > 0)
        		{
        			if(data.columns && data.columns[name] && data.columns[name].style)
        			{
        				var cssStr = this._columnStyleToCSSString(data.columns[name].style);
        				columnsData.push(cssStr);
        				cssStr += ";width:" + width + "px";
        				column = "<col style='"+cssStr+"'/>";
        			}
        			else
        			{
        				column = "<col style='width:" + width + "px;'/>";
        				columnsData.push("");
        			}
        		}
        		else
        		{
        			column = "<col style='width:0px;'/>";
        			columnsData.push("");
        		}
        		
        		columns += column;
        		if(data.columns && data.columns[name] && data.columns[name].rn)
        		{
        			var rn = data.columns[name].rn;
        			for(var i = 0; i < rn; i++)
        			{
        				columns += column;
        				columnsData.push(columnsData[columnsData.length - 1]);
        			}
        			j += rn;
        		}
	        }
        }
        
        if(d.refType != websheet.Constant.Column)
       		// copy all does not need this.
        	columnsData = [];
        
        if(columns)
        	columns = "<colgroup>" + columns + "</colgroup>";

        var tbodyHeader = "<tbody>";
        var tableFooter = "</tbody></table>";
        
        var rowLen = rows.length;
        var html = tableHeader + columns + tbodyHeader;
        var cellsNum = 0;
        var limited = false;
        var contentLimited = false;
        for(var i = 0; i < rowLen; i++)
        {
        	// Safari, Chrome, Cut too many dom nodes will lead a hang.
        	/*
        	if(dojo.isWebKit && this._cutting && html.length > 80000)
        	{
        		limited = true;
        		contentLimited = true;
        		
        		var num = 0;
        		cellsResult.obj = dojo.filter(cellsResult.obj, function(a, i){
        			num += a.length;
        			return num <= cellsNum;
        		});
        		break;
        	}
        	*/
        	
        	var tds = "";
        	var rowHeight = 0;
        	var rowHeightCalc = false;
        	var cells = rows[i];
        	var nextRow = i < rowLen - 1 ? rows[i + 1] : null;
        	var len = cells.length;
        	var position = 0;
        	for(var j = 0; j < len; j++)
        	{
        		var cell = cells[j];
        		if(j > 0)
        		{
        			var colspan = prevCell && prevCell.cs ? prevCell.cs : 1;
        			position += colspan;
        		}
        		var nextCell = j < len - 1 ? cells[j + 1] : null;
        		var column = columnsData[position];
        		tds += ("<td" + this._formatCell(cell, position, nextCell, nextRow, column)+ ">" + this._normalizeShowValue(cell, cols[j]) + "</td>");
        		prevCell = cell;
        		cellsNum ++;
        		if(cell && !rowHeightCalc)
        		{
        			rowHeight = this._getRowHeight(cell);
        			rowHeightCalc = true;
        		}
        	}
        	if(!rowHeight)
        	{
        		rowHeight = websheet.Constant.defaultRowHeight;
        	}
        	rowString = "<tr style='height:"+ rowHeight+ "px'>" + tds + "</tr>";

        	html += rowString;
        }
        
        html += tableFooter;
        
        return {html : html, cellsNum: cellsNum, limited: limited, contentLimited: contentLimited};
    },

    _generateClipForRangeCopy: function (d)
    {
    	var sn = "ibm_docs_ss_" + (dojo.isIE ? "IE_" : "") + new Date().valueOf();
    	d.sn = sn;
    	
    	var cellsResult = this._gatherCells(d);
    	if(!cellsResult)
    		// containsRawFormula
    		return null;
    	
    	var htmlResult = this._computeHtml(d, cellsResult, sn);
    	
        return {
            html: htmlResult.html,
            obj: cellsResult.obj,
            limited: cellsResult.limited || htmlResult.limited,
            contentLimited: htmlResult.contentLimited,
            cellsNum: htmlResult.cellsNum
        };
    },

    _selectRange: function (node)
    {
    	if(dojo.isSafari)
    		node.focus();
    	else if(document.activeElement)
    		document.activeElement.blur();
        if (document.createRange && window.getSelection)
        {
            var sel = window.getSelection();
            try
            {
                sel.removeAllRanges();
            }
            catch (e)
            {}
            var range = document.createRange();
            try
            {
            	// Defect 53341 for IE11, if the dom is large, it can not be copied succesfully by selectNodeContents
            	if( (dojo.isIE || dojo.isEdge) && !this._cutting)
                	range.selectNode(node);
                else
                	range.selectNodeContents(node);
            }
            catch (e)
            {
                range.selectNode(node);
            }
            sel.addRange(range);
        }
        else if (document.body.createTextRange)
        {
            var range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        }
    },
    
    _getShowValue: function(cell, col)
    {
    	if(!cell)
    		return;
    	if(cell.showValue === undefined)
    	{
    		var cModel = cell.model;
    		if(cModel)
    		{
    			var styleId = null;
    			if (col)
    				styleId = col._styleId;
    			var sv = cModel.getShowValue(cell._styleId || styleId);
    			cell.showValue = sv;
    		}
    	}
    	
    	var sv = cell.showValue;
    	if (sv !== null && sv !== undefined)
    		cell.showValue = "" + sv;
    	
    	return cell.showValue;
    },
    
    _getType: function(cell) {
    	var cModel = cell.model;
    	if (cModel) {
    		return cModel.getType();
    	} else {
    		return null;
    	}
    },
    
    _getValue: function(cell)
    {
    	// summary: returns calculated value for formula cell, raw value for plain cell
    	var cModel = cell.model;
    	if (cModel) {
    		if (cModel.isFormula()) {
    			return cModel._calculatedValue;
    		} else {
    			return cModel.getRawValue();
    		}
    	} else {
    		return null;
    	}
    },

    _normalizeShowValue: function (cell, col)
    {
    	if(!cell)
    		return "&nbsp;";
        var result = "";
        var showValue = this._getShowValue(cell, col) || " ";
        var cModel = cell.model;
        if (cModel)
        {
        	var link = cModel.getLink();
        	if(link)
        	{
	            if (!(link.indexOf("http://") == 0 || link.indexOf("https://") == 0 || link.indexOf("ftp://") == 0))
	            {
	                link = "http://" + link;
	            }
	            result = "<a href='" + link + "'>";
        	}
        }
        if (showValue)
        {
            showValue = showValue.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
                .replace(/>/gm, "&gt;").replace("/\r\n/g", "&nbsp;").replace(/\n/g, "&nbsp;").replace(/\r/g, "&nbsp;").replace(/\t/g, "&nbsp;"); // transform line break to white blank
            
            var toReplaceWhiteSpace = true;
            if(!dojo.isIE && cell.style && cell.style.format && cell.style.format[websheet.Constant.Style.FORMATCURRENCY])
            {
            	// defect 16599, not to replace the whitespace between currency sign and number.
            	var isString = false;
            	if (cell.style.format[websheet.Constant.Style.FORMATTYPE] == "text")
                {
                    isString = true;
                }
            	else
            	{
            		var cellModel = cell.model;
                	var v = cellModel ? cellModel._rawValue : "";
            		isString = cellModel != null && cellModel.isString();
            	}   
            	if(!isString)
            	{
            		toReplaceWhiteSpace = false;
            	}
            }
            
            if(toReplaceWhiteSpace)
            	showValue = showValue.replace(/ /g, "&nbsp;");
            result += showValue;
        }
        if (link)
        {
            result += "</a>";
        }
        return result;
    },

    _normalizeShowValueForJSON: function (cell, col)
    {
    	this._getShowValue(cell, col);
        if (!cell || !cell.showValue) return "";
        // transform line break to white blank
        return cell.showValue.replace("/\r\n/g", " ").replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ");
    }
});