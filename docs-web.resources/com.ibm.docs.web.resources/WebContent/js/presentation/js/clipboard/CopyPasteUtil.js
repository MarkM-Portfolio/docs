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

dojo.provide("pres.clipboard.CopyPasteUtil");
dojo.require("pres.clipboard.BaseCopyPasteUtil");
dojo.declare("pres.clipboard.CopyPasteUtil", pres.clipboard.BaseCopyPasteUtil, {

	/*
	 * "within_file" : in same presentation file. "within_pres" : from another presentation file. "within_docs" : from other docs application "outer" : from other apps
	 */
	externalMode: "",
	isExternal: "",

	constructor: function()
	{

	},

	setExternalMode: function(externalMode)
	{
		this.externalMode = externalMode;
	},

	clearExternalMode: function()
	{
		this.externalMode = "";
	},

	isOnlyRemove: function()
	{
		return this.externalMode == 'within_file';
	},

	getEncodedHtmlDom: function(htmlDom)
	{
		if (!htmlDom)
			return null;

		this._EnCodingDataForBrowser(htmlDom);
		return htmlDom;
	},

	getDecodedHtmlDom: function(htmlDom, removeClass)
	{
		if (!htmlDom)
			return null;

		this._DeCodingDataForBrowser(htmlDom, removeClass ? !removeClass : this.isOnlyRemove());
		return htmlDom;
	},

	getEncodedSlide: function(slide)
	{
		if (!slide)
			return null;

		var encodedSlide = slide.toJson(true);
		// TODO: encode slide styles

		encodedSlide.elements = [];
		dojo.forEach(slide.elements, function(ele)
		{
			encodeEele = this.getEncodedElement(ele);
			if(encodeEele)
				encodedSlide.elements.push(encodeEele);
		}, this);

		return encodedSlide;
	},

	encodedColWidth: function(table, tableWidth)
	{
		if (!table || !table.colWidths)
			return null;

		if (!tableWidth)
			return table;

		var _visibleStyle = '';
		dojo.forEach(table.colWidths, function(colwidth)
		{
			_visibleStyle += colwidth / tableWidth;
			_visibleStyle += '@';
		}, tableWidth, _visibleStyle);

		table._visibleStyle = _visibleStyle;
		return table;
	},

	getEncodedCell: function(cell)
	{
		if (!cell)
			return null;

		if (!cell.attrs.docsbackgroundfill)
		{
			var m = pe.scene.slideEditor.mainNode;
			var cellNode = dojo.query("[id='" + cell.id + "']", m)[0];
			if (cellNode)
			{
				if (dojo.hasClass(cellNode, 'cellselected'))
				{
					var cellSelectedClasses = EditorUtil.removeTabelCellSelectionClass(cellNode);
					setTimeout(dojo.hitch(this, function(cellNode)
					{
						// restore it back.
						for(var c=0;c<cellSelectedClasses.length;c++)
							dojo.addClass(cellNode, cellSelectedClasses[c]);
						
					}, cellNode), 0);
				}
				var _visibleStyle = this._getVisibleStyleStringForTd(cellNode);
				cell._visibleStyle = _visibleStyle;
			}
		}
		var content = cell.content;
		var htmlDOM = document.createElement('div');
		htmlDOM.innerHTML = content;
		htmlDOM = this.getEncodedHtmlDom(htmlDOM);

		cell.content = htmlDOM.innerHTML;
		return cell;
	},

	getEncodedRow: function(row)
	{
		if (!row)
			return null;

		var encodedCells = [];
		dojo.forEach(row.cells, function(cell)
		{
			encodedCells.push(this.getEncodedCell(cell));
		}, this, encodedCells);

		row.cells = encodedCells;
		return row;
	},

	getEncodedTable: function(table, parent)
	{
		if (!table)
			return null;

		table = this.encodedColWidth(table, parent.w);
		var encodedRows = [];
		dojo.forEach(table.rows, function(row)
		{
			encodedRows.push(this.getEncodedRow(row));
		}, this, encodedRows);

		table.rows = encodedRows;
		return table;
	},

	getEncodedElement: function(element)
	{
		if (!element)
			return null;

		if(this.isRotatedPPTODPGroupBox(element))
		{
			pe.scene.slideEditor.showWarningMsgForRotatedObject();
			return null;
		}
		
		var encodedElement = element.toJson();
		var styles = element.getFinalStyle();
		encodedElement._visibleStyles = styles;

		if (element.family == 'table' && element.table)
		{
			var encodedTable = this.getEncodedTable(encodedElement.table, encodedElement);
			encodedElement.table = encodedTable;
		}
		else if (element.family == 'group')
		{
			// Only shape with text box need be encoded
			if (encodedElement.txtBox)
			{
				var htmlDOM = document.createElement('div');
				htmlDOM.innerHTML = encodedElement.txtBox.content;
				htmlDOM = this.getEncodedHtmlDom(htmlDOM);

				encodedElement.txtBox.content = htmlDOM.innerHTML;
			}
			if (encodedElement.img)
			{
				var nodeId = encodedElement.id;
				var prefixedNodeId = pres.utils.a11yUtil.addPrefixId(nodeId);
				var node = dojo.byId(nodeId);
				if (!node)
					node = dojo.byId(prefixedNodeId);
				if (node)
				{
					var imgNodes = node.querySelectorAll('img.draw_image');
					var imgUrl = imgNodes[0].src;
					imgUrl = imgUrl.replace(/%20/g, ' ');
					encodedElement.img.attrs.src = imgUrl;
				}
			}
		}
		else
		{
			var content = encodedElement.content;
			var htmlDOM = document.createElement('div');
			htmlDOM.innerHTML = content;
			if (htmlDOM.firstElementChild && dojo.hasClass(htmlDOM.firstElementChild, 'layoutClassSS') && encodedElement.family != 'notes')
			{
				encodedElement.emptyPlaceholder = true;
			}
			else
			{
				htmlDOM = this.getEncodedHtmlDom(htmlDOM);
				encodedElement.content = htmlDOM.innerHTML;
			}
		}
		return encodedElement;
	},

	getEncodedJson: function(SlideOrElementOrContent)
	{
		if (!SlideOrElementOrContent)
			return null;

		if (SlideOrElementOrContent instanceof pres.model.Slide)
		{
			return this.getEncodedSlide(SlideOrElementOrContent);
		}
		else if (SlideOrElementOrContent instanceof pres.model.Element)
		{
			return this.getEncodedElement(SlideOrElementOrContent);
		}
		else
		{
			return this.getEncodedContent(SlideOrElementOrContent);
		}
	},
	getEncodedContent: function(paragraphs)
	{
		var adjustValue = parseFloat(pres.constants.LINESPACE_ADJUST_VALUE);
		for ( var i = 0; i < paragraphs.paragraphs.length; i++)
		{
			var p = paragraphs.paragraphs[i];
			if(!isNaN(parseFloat(p.lineHeight))){
				p.absLineHeight = Math.round(parseFloat(p.lineHeight)*100/adjustValue)/100;//EditorUtil.setCustomStyle(p, 'abs-line-height', '1.222222');
			}
			for ( var j = 0; j < p.spanList.length; j++)
			{
				var span = p.spanList[j];
				var nodeId = span.id;
				var srcDiv = dojo.byId(nodeId);
				if (!srcDiv || (srcDiv && srcDiv.nodeName.toLowerCase() != "span"))
					continue;
				var computedStyle = dojo.getComputedStyle(srcDiv);
				var fontSize = PresCKUtil.getAbsoluteValue(srcDiv, PresConstants.ABS_STYLES.FONTSIZE);
				if (!fontSize || fontSize.length == 0)
				{
					fontSize = PresFontUtil.convertFontsizeToPT(computedStyle.fontSize);
				}
				span.fontSize && (fontSize = span.fontSize);
				fontSize = parseInt(fontSize * 100);
				// get other font sytle, include: font weight, font style, font family
				// var styles = ['sys_vs', 'fontSize', 'textDecoration','fontBold', 'fontItalic', 'fontName', 'fontColor','lineHeight'];
				var splitor = '@';
				var visibleStr = "sys_vs" + splitor;
				visibleStr += fontSize;
				visibleStr += splitor;
				visibleStr += computedStyle.textDecoration;
				visibleStr += splitor;
				var fontWeight = parseInt(computedStyle.fontWeight);
				if (fontWeight == 400)
					fontWeight = 'normal';
				else if (fontWeight == 700)
					fontWeight = 'bold';
				else
					fontWeight = computedStyle.fontWeight;
				visibleStr += fontWeight;
				visibleStr += splitor;
				visibleStr += computedStyle.fontStyle;
				visibleStr += splitor;
				visibleStr += computedStyle.fontFamily;
				visibleStr += splitor;
				visibleStr += PresCKUtil.normalizeColorValue(computedStyle.color);
				visibleStr += splitor;
				visibleStr += (span.lineHeight||"");
				span.visibleStr = visibleStr;
			}
			//D49053: [MVC]Alignment changed to left after copy paste text to other textbox
			var srcDiv = dojo.byId(p.id);
			if (!srcDiv || (srcDiv && srcDiv.nodeName.toLowerCase() != "p"))
				continue;
			var computedStyle = dojo.getComputedStyle(srcDiv);
			p.textAligment = computedStyle.textAlign;
		}
		return paragraphs;
	},
	getDecodedSlide: function(slide)
	{
		if (!slide)
			return null;

		// TODO decode slide
		var elements = slide.elements;
		var decodedSlide = slide;
		decodedSlide.elements = [];
		dojo.forEach(elements, function(ele)
		{
			decodedSlide.elements.push(this.getDecodedElement(ele));
		}, this);
		decodedSlide.attrs.comments = 'false';
		decodedSlide.attrs.commentsid = '';
		return decodedSlide;
	},

	decodedColWidths: function(table, tableWidth)
	{
		if (!table || !tableWidth)
			return table;

		if (!this.isOnlyRemove())
		{
			var decodedColWidths = [];
			var _visibleStr = table._visibleStyle;
			if (_visibleStr)
			{
				var inlineStyles = _visibleStr.split('@');
				for ( var t = 0; t < inlineStyles.length - 1; t++)
				{
					var value = inlineStyles[t];
					var newWidth = value * tableWidth;
					decodedColWidths.push(newWidth);
				}
				table.colWidths = decodedColWidths;
			}
		}

		table._visibleStyle = "";
		return table;
	},

	getDecodedCell: function(cell)
	{
		if (!cell)
			return null;
		if (!cell.attrs.docsbackgroundfill)
		{
			var visibleStyles = cell._visibleStyle || '';
			var style = '';
			var styles = ['sys_vs', 
			              'background-color', 
			              'padding-left', 
			              'padding-right', 
			              'padding-top', 
			              'padding-bottom', 
			              'vertical-align',
			              'text-align'];
			if (visibleStyles.match(/^sys_vs@/))
			{
				if (!this.isOnlyRemove() || pe.keepViewStyle)
				{
					style = "background-image:none;";
					var inlineStyles = visibleStyles.split('@');
					for ( var t = 1; t < inlineStyles.length; t++)
					{
						if (t == 1)
						{
							if (inlineStyles[t].match(/transparent/))
								style += styles[t] + ";";
							else
								style += styles[t] + ":" + inlineStyles[t] + ";";
						}
						else if (t > 1 && t < 8)
						{
							style += styles[t] + ":" + inlineStyles[t] + ";";
						}
						else
						{
							// TODO for other properties
						}
					}
					cell.attrs.style = style;
				}
			}
		}
		var content = cell.content;
		var htmlDOM = document.createElement('div');
		htmlDOM.innerHTML = content;
		htmlDOM = this.getDecodedHtmlDom(htmlDOM);

		cell.content = htmlDOM.innerHTML;
		return cell;
	},

	getDecodedRow: function(row)
	{
		if (!row)
			return null;

		var decodedCells = [];
		dojo.forEach(row.cells, function(cell)
		{
			decodedCells.push(this.getDecodedCell(cell));
		}, this, decodedCells);

		row.cells = decodedCells;
		return row;
	},

	getDecodedTable: function(element)
	{
		if (!element)
			return null;

		table = this.decodedColWidths(element.table, element.w);
		var decodedRows = [];
		dojo.forEach(table.rows, function(row)
		{
			decodedRows.push(this.getDecodedRow(row));
		}, this, decodedRows);

		table.rows = decodedRows;
		return table;
	},

	getDecodedElement: function(element)
	{
		if (!element)
			return null;

		// TODO: change the code of getting current slide settings
		var parent = pe.scene.slideSorter.getSelectedThumbs()[0].slide;

		if (!this.isOnlyRemove())
		{
			// decode element
			var styleValues = element._visibleStyles;
			var styles = pres.utils.htmlHelper.extractStyle(styleValues);
			value = "";
			for ( var s in styles)
			{
				var percValue = styles[s];
				var value = percValue.substring(0, percValue.indexOf('%'));
				if (s == 'width')
				{
					element.w = (value / 100) * (parent.w);
				}
				else if (s == 'height')
				{
					element.h = (value / 100) * (parent.h);
				}
				else if (s == 'top')
				{
					element.t = (value / 100) * (parent.h);
				}
				else if (s == 'left')
				{
					element.l = (value / 100) * (parent.w);
				}
			}
			delete element.attrs.id_html_ref;
			delete element.attrs.clipinfo;
		}
		pe.cleanMasterClass = false;
		// 46833: [MVC][Regression]placeholder should change to a textbox after copy/paste
		if (!pe.pasteSlideInSameFile && element.attrs.presentation_placeholder == 'true' && (element.attrs.presentation_class == 'title' || element.attrs.presentation_class == 'subtitle' || element.attrs.presentation_class == 'outline'))
		{
			element.attrs.presentation_placeholder = 'false';
			element.attrs.presentation_class = '';
			pe.cleanMasterClass = true;
		}

		element._visibleStyles = '';

		if (element.family == 'table' && element.table)
		{
			this.getDecodedTable(element);
		}
		else if (element.family == 'group')
		{
			// Only shape with text box need be decoded
			if (element.txtBox)
			{
				var htmlDOM = document.createElement('div');
				htmlDOM.innerHTML = element.txtBox.content;
				htmlDOM = this.getDecodedHtmlDom(htmlDOM);

				element.txtBox.content = htmlDOM.innerHTML;
			}

			if (element.img)
			{
				var fullUrl = element.img.attrs.src;
				var docroot = concord.util.uri.getDocPageRoot();
				var isSame = fullUrl.indexOf(docroot);
				if (isSame > 0)
				{
					element.img.attrs.src = fullUrl.substr(isSame + docroot.length + 1);
				}
				else
				{// copy image from other files.
					var newImgUrl = this.addImageToDoc(fullUrl.split("?")[0]); // clean random param before sending to backend service
					if (newImgUrl != null)
					{
						element.img.attrs.src = newImgUrl;
					}
				}
				element.img.id = EditorUtil.getUUID();
				element.img.divId = EditorUtil.getUUID();
				element.dataId = EditorUtil.getUUID();
			}
			else if (element.svg)
			{// TODO update svg id.

			}
		}
		else
		{
			var content = element.content;
			// ///////////////////////////////////
			var htmlDOM = document.createElement('div');
			htmlDOM.innerHTML = content;
			htmlDOM = this.getDecodedHtmlDom(htmlDOM,pe.cleanMasterClass);
			delete pe.cleanMasterClass;
			element.content = htmlDOM.innerHTML;
		}
		element.attrs.comments = 'false';
		element.attrs.commentsid = '';
		return element;
	},

	getDecodedJson: function(SlideOrBoxOrContent, samefile , isplaceholder)
	{
		if (!SlideOrBoxOrContent)
			return null;

		if (samefile)
		{
			this.setExternalMode('within_file');
			this.isExternal = false;
		}
		else
		{
			this.isExternal = true;
		}		
		if (SlideOrBoxOrContent.type == 'slide')
		{
			return this.getDecodedSlide(SlideOrBoxOrContent);
		}
		else if (SlideOrBoxOrContent.type == 'element')
		{
			return this.getDecodedElement(SlideOrBoxOrContent);
		}
		else
		{
			return this.getDecodedContent(SlideOrBoxOrContent ,isplaceholder);
		}
	},

	getDecodedContent: function(paragraphs ,isplaceholder)
	{
		var adjustValue = parseFloat(pres.constants.LINESPACE_ADJUST_VALUE);
		var supportListTypes = ["lst-c", "lst-cs", "lst-ra", "lst-d", "lst-da", "lst-ta", "lst-cm", "lst-ps", "lst-n", "lst-np", "lst-ua", "lst-uap", "lst-la", "lst-lap", "lst-ur", "lst-lr"];
		// if(isplaceholder)
		// return paragraphs;
		// else
		// paste to textbox which is not placeholder.
		// {
		if (!(this.isExternal))
		{
			for ( var i = 0; i < paragraphs.paragraphs.length; i++)
			{
				var p = paragraphs.paragraphs[i];
				if(!isplaceholder)
				{
					if (p.listType == 'bullet')
					{
						!p.clsCustom && (p.clsCustom = 'lst-c');
					}
					else if (p.listType)
					{
						if (!p.clsCustom)
						{
							p.clsCustom = 'lst-n';
							p.listType = '1';
						}
					}
				}
				if (!this.isOnlyRemove())
				{
					if (p.listType == 'bullet')
					{
						if(!p.clsCustom || (supportListTypes.indexOf(p.clsCustom) == -1))
						{
							p.clsCustom = 'lst-c';
						}
					}
					else if (p.listType)
					{
						if (!p.clsCustom || (supportListTypes.indexOf(p.clsCustom) == -1))
						{
							p.clsCustom = 'lst-n';
							p.listType = '1';
						}
					}
				}
				if (!p.startNumber)
					p.startNumber = '1';
				if(!isNaN(parseFloat(p.lineHeight)))
				{
					if((DOC_SCENE.extension.toLowerCase() == "odp" || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft)) && p.lineHeight > 2.5116 )
					{	
						p.absLineHeight = 2;
						p.lineHeight = 2.5116;
					}
					else
						p.absLineHeight = Math.round(parseFloat(p.lineHeight)*100/adjustValue)/100; 
				}
				for ( var j = 0; j < p.spanList.length; j++)
				{
					var span = p.spanList[j];
					var visibleStyles = span.visibleStr;
					var styles = ['sys_vs', 'fontSize', 'textDecoration', 'fontBold', 'fontItalic', 'fontName', 'fontColor', 'lineHeight'];
					if (visibleStyles && visibleStyles.match(/^sys_vs@/))
					{
						
						var inlineStyles = visibleStyles.split('@');
						for ( var t = 1; t < inlineStyles.length; t++)
						{
							if (t == 1)
							{
								var absFontSize = parseInt(inlineStyles[t]);
								absFontSize = absFontSize / 100;
								span[styles[t]] = absFontSize;
							}
							else if (t == 2)
							{
								var textDecoration = inlineStyles[t];
								var tds = textDecoration.split(' ');
								for ( var k = 0; k < tds.length; k++)
								{
									var tv = tds[k];
									if (tv == 'underline')
										span.fontUnderLine = true;
									else if (tv == 'line-through')
										span.fontStrikeThrough = true;
								}
							}
							else if (t == 3)
							{
								span[styles[t]] = (inlineStyles[t] == 'bold');
							}
							else if (t == 4)
							{
								span[styles[t]] = (inlineStyles[t] == 'italic');
							}else if (t == 7){								
								if(!isNaN(parseFloat(inlineStyles[7]))){
									span[styles[7]] = inlineStyles[7];
								}else
									span[styles[7]] = "";
							}				
							else
							{
								span[styles[t]] = inlineStyles[t];
							}
						}
						
					}
					if((DOC_SCENE.extension.toLowerCase() == "odp" || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft)) && span.lineHeight > 2.5116 )
					{	
						span.lineHeight = 2.5116;
					}		
				}
			}
		}
		else
		{
			for ( var i = 0; i < paragraphs.paragraphs.length; i++)
			{
				var p = paragraphs.paragraphs[i];
				p.lineHeight = 1.2558;
				if(!isplaceholder)
				{
					if (p.listType == 'bullet')
					{
						!p.clsCustom && (p.clsCustom = 'lst-c');
					}
					else if (p.listType)
					{
						if (!p.clsCustom)
						{
							p.clsCustom = 'lst-n';
							p.listType = '1';
						}
					}
				}
				if (!this.isOnlyRemove())
				{
					if (p.listType == 'bullet')
					{
						if(!p.clsCustom || (supportListTypes.indexOf(p.clsCustom) == -1))
						{
							p.clsCustom = 'lst-c';
						}
					}
					else if (p.listType)
					{
						if (!p.clsCustom || (supportListTypes.indexOf(p.clsCustom) == -1))
						{
							p.clsCustom = 'lst-n';
							p.listType = '1';
						}
					}
				}
				if (!p.startNumber)
					p.startNumber = '1';
				for ( var j = 0; j < p.spanList.length; j++)
				{
					var span = p.spanList[j];
					var visibleStyles = span.visibleStr;
					var styles = ['sys_vs', 'fontSize', 'textDecoration', 'fontBold', 'fontItalic', 'fontName', 'fontColor', 'lineHeight'];
					if (visibleStyles && visibleStyles.match(/^sys_vs@/))
					{
						var inlineStyles = visibleStyles.split('@');
						for ( var t = 1; t < inlineStyles.length; t++)
						{
							if (t == 1)
							{
								var absFontSize = parseInt(inlineStyles[t]);
								absFontSize = absFontSize / 100;
								span[styles[t]] = absFontSize;
							}
							else if (t == 2)
							{
								var textDecoration = inlineStyles[t];
								var tds = textDecoration.split(' ');
								for ( var k = 0; k < tds.length; k++)
								{
									var tv = tds[k];
									if (tv == 'underline')
										span.fontUnderLine = true;
									else if (tv == 'line-through')
										span.fontStrikeThrough = true;
								}
							}
							else if (t == 3)
							{
								span[styles[t]] = (inlineStyles[t] == 'bold');
							}
							else if (t == 4)
							{
								span[styles[t]] = (inlineStyles[t] == 'italic');
							}
							else
							{
								span[styles[t]] = inlineStyles[t];
							}
						}
					}
					span.lineHeight = 1.2558;
				}
			}
		}
		return paragraphs;
	},

	removeEditableObjects: function(slide)
	{
		if (!slide || !slide.elements)
			return null;

		var newElements = dojo.filter(slide.elements, function(ele)
		{
			return ele.family == "background" || ele.family == 'page-number';
		});
		slide.elements = newElements;
		return slide;
	},
	/**
	 * This method is used to process data from system clipboard.
	 * 
	 * @param htmlContent
	 * @param event
	 */
	processClipboardData: function(pastebin)
	{
		dojo["require"]("pres.clipboard.pastefromword");
		var fromExt = true;
		var htmlContent = pastebin.innerHTML;
		console.log("Pre processClipboardData paste Content in HTML:" + htmlContent);
		// sometimes copying from Symphony adds some invalid info text at the beginning of the data
		// we want to trip that out.
		if (htmlContent.toLowerCase().indexOf("version") == 0)
		{
			htmlContent = htmlContent.replace(/Version[^<]*/ig, '');
		}
		var endTagIdx = htmlContent.indexOf('<!--EndFragment-->');
		if(endTagIdx>0)
		{
			htmlContent = htmlContent.substring(0,endTagIdx);
		}
		
		// check is paste data is from word or if data contains <font tags
		// assume it is external data and attempt to clean.
		if ((/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/).test(htmlContent))
		// D26136: [Chrome]copy text and paste, font name and font color are incorrect
		// || htmlContent.indexOf('<div') != -1 || htmlContent.indexOf('<font') != -1
		{
			// this is a workaround for identifying lists in PowerPoint data
			while (htmlContent.indexOf('mso-special-format') != -1)
			{
				htmlContent = htmlContent.replace('mso-special-format:', 'concord-list:');
			}

			if (dojo.isChrome || dojo.isSafari)
			{
				// the cleanWord code is not properly converting lists in MS Word so
				// workaround for now is all lists copied from MS Word will be marked as unordered lists.
				while (htmlContent.indexOf('mso-list:') != -1)
				{
					htmlContent = htmlContent.replace('mso-list:', 'chrome-list:');
				}
				// this will be used in presCopyPasteUtil.cleanStyles() to identify it as a list item
			}

			htmlContent = CKEDITOR.cleanWord && CKEDITOR.cleanWord(htmlContent);

			// D27432: [Regression]Empty space is lost after copy from MS Office to IBM docs
			// strip all &nbsp; from htmlContent
			// while(htmlContent.indexOf('&nbsp;') != -1)
			// htmlContent = htmlContent.replace('&nbsp;','');

			// find preserved list format from PowerPoint data and convert to attr for conversion to list later.
			while (htmlContent.indexOf('<span style="concord-list:') != -1)
			{
				htmlContent = htmlContent.replace('<span style="concord-list:', '<span concordList=');
			}
			// D23562: [Regression][CopyPaste][FF/Chrome] Copy text with blank space from Symphony Documents to concord , the first blank space disappear
			var charValue = String.fromCharCode(10);
			htmlContent = htmlContent.replace(new RegExp(charValue, "gm"), ' ');
		}
		if ((htmlContent.indexOf('<table') == 0 && htmlContent.indexOf('smartTable') > 0 && htmlContent.indexOf('ibmdocsTable') > 0))
		{
			fromExt = false;
		}
		// strip out any newLine chars
		htmlContent = htmlContent.replace(/[\t\n]*/ig, '');

		htmlContent = htmlContent.replace(/(<!--.*?-->)/gm, '');

		// re-fix D31262 for D35122: [Regression] Space char before misspelled words is lost after copy from pptx/ppt to IBM Docs.
		// htmlContent = htmlContent.replace(/\>+\s+\<+/g,'><');
		htmlContent = htmlContent.replace(/>+\s+<td/g, '><td');
		htmlContent = htmlContent.replace(/>+\s+<th/g, '><th');
		htmlContent = htmlContent.replace(/>+\s+<tr/g, '><tr');
		htmlContent = htmlContent.replace(/>+\s+<tbody/g, '><tbody');
		htmlContent = htmlContent.replace(/>+\s+<table/g, '><table');
		htmlContent = htmlContent.replace(/>+\s+<\/td/g, '><\/td');
		htmlContent = htmlContent.replace(/>+\s+<\/th/g, '><\/th');
		htmlContent = htmlContent.replace(/>+\s+<\/tr/g, '><\/tr');
		htmlContent = htmlContent.replace(/>+\s+<\/tbody/g, '><\/tbody');
		htmlContent = htmlContent.replace(/>+\s+<\/table/g, '><\/table');

		// D16785: [Table][FF][CopyPaste] Copy/Paste the line2 in a cell,the first line is also selected
		// Sometime, the br will be included at the start, remove it.'
		var atstart = htmlContent.indexOf('<br class=\"hideInIE\">');
		if (atstart == 0)
			htmlContent = htmlContent.replace('<br class=\"hideInIE\">', '');

		// To embed pure text in <span> for copied data from ie.
		pastebin.innerHTML = htmlContent;
		var tmpContent = '';
		var child = pastebin.firstChild;
		while (null != child)
		{
			if (child.nodeType == CKEDITOR.NODE_TEXT)
			{
				var pureData = child.data.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
				tmpContent = tmpContent + '<span>' + pureData + '</span>';
			}
			else
			{
				if (child.nodeType == CKEDITOR.NODE_ELEMENT && (child.nodeName.toLowerCase() == 'ol' || child.nodeName.toLowerCase() == 'ul'))
				{
					this.removePInLi(child);
				}
				tmpContent = tmpContent + PresCKUtil.getOuterHtml(child);
			}
			child = child.nextSibling;
		}
		htmlContent = tmpContent;
		pastebin.innerHTML = htmlContent;

		if (dojo.isChrome || dojo.isSafari)
		{
			// this is a workaround for an issue when copying Lists from MSoffice in chrome
			// it wants to put the list items wrapped in a div and strips out anything to indicate it is from msoffice
			// so the assumption we are making here is anything being pasted in chrome wrapped in a div is a unordered list item.
			// D24412: [Regression[Copy/Paste][Table][Chrome/Safari]The bottom of table border cross the slide in sorter with some lines list, which is inconsistence with in placeholder
			htmlContent = PresCKUtil.fixStyleWebkit(CKEDITOR.document, htmlContent);
		}
		else
		{
			htmlContent = PresCKUtil.fixPNonWebKit(CKEDITOR.document, htmlContent);
		}

		// Some external sources including Symphony require additional processing
		// of the copied HTML for invalid html tags
		htmlContent = this.transformFontNodes(htmlContent);
		htmlContent = this.convertStyleTags(htmlContent);
		htmlContent = this.fixPAlignTags(htmlContent);
		htmlContent = this.cleanStyles(htmlContent, fromExt);
		htmlContent = this.UpdateID(htmlContent);
		htmlContent = this.fixTables(htmlContent);
		htmlContent = this.fixExternalData(htmlContent);
		htmlContent = this.fixHyperLink(htmlContent);
		if (htmlContent.indexOf('<span') == 0 || htmlContent.indexOf('<a') == 0)
		{
			var ps = htmlContent.split('<br>');
			var pasteHtml = '';
			for ( var i = 0; i < ps.length; i++)
			{
				var content = ps[i] ? ps[i] : '<span>&#8203;</span>';
				pasteHtml += '<p>' + content + '</p>';
			}
			htmlContent = pasteHtml;
		}
		pastebin.innerHTML = htmlContent;
		console.log("Post processClipboardData paste Content in HTML:" + htmlContent);
	},
	fixHyperLink: function(htmlContent)
	{
		var htmlElement = document.createElement('div');
		htmlElement.innerHTML = htmlContent;
		var as = htmlElement.getElementsByTagName('a');
		for ( var ti = 0; ti < as.length; ti++)
		{
			var aNode = as[ti];
			var aStyle = dojo.attr(aNode,'style');
			dojo.removeAttr(aNode,'style');
			var text = aNode.textContent;
			var span = document.createElement('span');
			span.innerHTML = text;
			aNode.innerHTML = '';
			aNode.appendChild(span);
			if(aStyle && aStyle.indexOf('font-size')>0) {
				dojo.attr(span, 'style', aStyle);
				var stylea = EditorUtil.turnStyleStringToArray(aStyle);
				var fontsize = stylea['font-size'];
				fontsize = parseFloat(fontsize);
				var absfont =  fontsize * 18;
				EditorUtil.setCustomStyle(span, EditorUtil.ABS_STYLES.FONTSIZE, absfont);
			}
		}
		htmlContent = htmlElement.innerHTML;
		dojo.destroy(htmlElement);
		return htmlContent;
	},
	fixTables: function(htmlContent)
	{
		if (!htmlContent || (htmlContent.toLowerCase().indexOf('<table') < 0))
			return htmlContent;
		var copyPasteUtil = this;
		// chrome will make all the % to px, needs to adjust back
		var htmlElement = document.createElement('div');
		htmlElement.innerHTML = htmlContent;
		var tables = htmlElement.getElementsByTagName('table');
		for ( var ti = 0; ti < tables.length; ti++)
		{
			var table = tables[ti];
			if (PresTableUtil.isMergeCell(table))
			{
				htmlContent = "";
				return '';
			}
			PresTableUtil.changePxToPercentForRowCell(table);
			dojo.query('tr', table).forEach(function(row)
			{
				var cells = row.cells;
				if (cells && cells.length == 0)
				{
					dojo.addClass(row, 'removeThisNode');
				}
			});
			dojo.query('.removeThisNode', table).forEach(dojo.destroy);
			dojo.query('colgroup', table).forEach(dojo.destroy);
			if (!dojo.attr(table, 'table_template-name'))
			{
				dojo.attr(table, 'table_template-name', 'st_plain');
				dojo.addClass(table, 'st_plain');
			}
		}
		htmlContent = htmlElement.innerHTML;
		dojo.destroy(htmlElement);
		// If internal table, then skip the following formatting.
		if ((htmlContent.indexOf('smartTable') > 0) || (htmlContent.indexOf('ibmdocsTable') > 0))
		{
			return htmlContent;
		}

		var htmlElement = document.createElement('div');
		htmlElement.innerHTML = htmlContent;
		var tables = htmlElement.getElementsByTagName('table');
		for ( var t = 0; t < tables.length; t++)
		{
			var table = tables[t];
			// merge multiple tbody's into one (our editor does not handle multiple tbody's)
			// keep a reference to the first tbody (which we will keep).
			var tbody = dojo.query('tbody', table)[0];
			var thead = dojo.query('thead', table)[0];
			if (thead)
			{
				// process table header
				dojo.query('th', thead).forEach(function(th, i, arr)
				{
					var td = document.createElement('td');
					var colspan = dojo.attr(th, 'colspan');
					if (colspan)
						dojo.attr(td, 'colspan', colspan);
					dojo.attr(td, 'role', 'columnheader');
					td.innerHTML = th.innerHTML;
					dojo.place(td, th, 'replace');
				});

				var tbodyTop = tbody.firstChild;
				while (thead.hasChildNodes())
				{
					var tr = thead.firstChild;
					if (tbodyTop)
						dojo.place(tr, tbodyTop, 'before');
					else
						tbody.appendChild(tr);
				}
			}

			thead && dojo.destroy(thead);

			dojo.removeClass(table);
			dojo.removeAttr(table, 'border');
			dojo.removeAttr(table, 'height');
			dojo.removeAttr(table, 'width');
			dojo.removeAttr(table, 'frame');
			dojo.removeAttr(table, 'rules');
			// strippig this out for now because sometimes certain styles set this with the
			// intention of using multiple tBody's to seperate different table rows and we don't
			// support that right now, so the end result is different than the copies source table.
			dojo.removeAttr(table, 'bordercolor');

			dojo.addClass(table, 'table_table');
			dojo.addClass(table, 'smartTable');
			dojo.addClass(table, 'ibmdocsTable');
			dojo.addClass(table, 'st_plain');
			dijit.setWaiRole(table, 'grid');
			dojo.attr(table, 'cellspacing', '0');
			dojo.attr(table, 'cellpadding', '0');
			dojo.attr(table, 'table_use-rows-styles', 'true');
			dojo.attr(table, 'table_use-banding-rows-styles', 'true');
			dojo.attr(table, 'table_template-name', 'st_plain');

			dojo.query('tr', table).forEach(function(row, i, arr)
			{
				var numRows = arr.length;
				dojo.removeClass(row);
				dijit.setWaiRole(row, 'row');
				dojo.removeAttr(row, 'height');
				dojo.removeAttr(row, 'width');
				dojo.addClass(row, 'table_table-row');
				dojo.attr(row, 'table_default-cell-style-name', '');
				// dojo.style(row,'height',(100/numRows)+'%');

				if (i % 2 == 0)
				{ // even rows
					if (i != 0)
						dojo.addClass(row, 'alternateRow');
				}

				if (i == numRows - 1)
				{
					dojo.addClass(row, 'lastRow');
				}

				var cols = row.children;
				dojo.forEach(cols, function(col, j, arr)
				{
					var numCols = arr.length;
					dojo.removeClass(col);
					dojo.removeAttr(col, 'height');
					dojo.removeAttr(col, 'width');
					dojo.addClass(col, 'table_table-cell');
					var style = copyPasteUtil.getMergedStyles(table, col);
					dojo.attr(col, 'style', style);
					if (j == 0)
					{
						dojo.addClass(col, 'firstColumn');
					}
					else if (j == (arr.length - 1))
					{
						dojo.addClass(col, 'lastColumn');
					}

					var role = dojo.attr(col, 'role');
					if (role == 'columnheader')
					{
						dijit.setWaiRole(col, 'columnheader');
						if (!dojo.hasClass(row, 'tableHeaderRow'))
							dojo.addClass(row, 'tableHeaderRow');
					}
					else
						dijit.setWaiRole(col, 'gridcell');

					// fix data within table cells which may come in from external sources with
					// incorrect structure
					col.innerHTML = copyPasteUtil.fixExternalData(col.innerHTML, true);
				});

				if (row.parentNode != tbody)
					tbody.appendChild(row);

			});

			// remove empty tbody elements
			dojo.query('tbody', table).forEach(function(node, i, arr)
			{
				if (node.children.length == 0)
					dojo.destroy(node);
			});
			dojo.attr(table, 'style', '');
		}
		htmlContent = htmlElement.innerHTML;
		dojo.destroy(htmlElement);
		return htmlContent;
	},
	getMergedStyles: function(node1, node2)
	{
		var style1 = node1 && dojo.attr(node1, 'style') ? dojo.attr(node1, 'style').replace(/(^\s+|\s+$)/g, '') : '';
		var style2 = node2 && dojo.attr(node2, 'style') ? dojo.attr(node2, 'style').replace(/(^\s+|\s+$)/g, '') : '';

		if ((style1 == '' || style1 == 'null') && (style2 == '' || style2 == 'null'))
			return '';
		else if (style1 == '' || style1 == 'null')
			return style2;
		else if (style2 == '' || style2 == 'null')
			return style1;

		var styleArr1 = style1 ? style1.split(';') : [];
		var styleArr2 = style2 ? style2.split(';') : [];
		var mergedStyles = '';
		for ( var i = 0; i < styleArr1.length; i++)
		{
			if (styleArr1[i] == '' || styleArr1[i] == 'null')
				continue;

			var sName1 = styleArr1[i].split(':')[0] == null ? '' : styleArr1[i].split(':')[0].replace(/(^\s+|\s+$)/g, '');
			var sValue1 = styleArr1[i].split(':')[1] == null ? '' : styleArr1[i].split(':')[1].replace(/(^\s+|\s+$)/g, '');
			for ( var j = 0; j < styleArr2.length; j++)
			{
				if (styleArr2[j] == '')
					continue;

				var sName2 = styleArr2[j].split(':')[0] == null ? '' : styleArr2[j].split(':')[0].replace(/(^\s+|\s+$)/g, '');
				var sValue2 = styleArr2[j].split(':')[1] == null ? '' : styleArr2[j].split(':')[1].replace(/(^\s+|\s+$)/g, '');
				if (sName1 == sName2)
				{
					if (sValue1 == sValue2)
						mergedStyles += sName2 + ':' + sValue2 + ';';
					else
					{
						if (sName2 == 'font-size')
						{
							var ndx2 = sValue2.indexOf('em');
							if (ndx2 >= 0)
								sValue2 = sValue2.substring(0, ndx2);
							var ndx1 = sValue1.indexOf('em');
							if (ndx1 >= 0)
								sValue1 = sValue1.substring(0, ndx1);
							if (ndx2 >= 0 && ndx1 >= 0)
								mergedStyles += sName2 + ':' + sValue2 * sValue1 + 'em;';
							else
								mergedStyles += sName2 + ':' + sValue2 + ';';
						}
						else if (sName2 == 'text-decoration')
						{
							mergedStyles += [sName2, ':', sValue2 == "none" ? '' : sValue2, ' ', sValue1 == "none" ? '' : sValue1 + ';'].join('');
						}
						else
							mergedStyles += sName2 + ':' + sValue2 + ';';
					}
					styleArr2[j] = '';
					styleArr1[i] = '';
				}
			}
			if (styleArr1[i] != '')
				mergedStyles += styleArr1[i] + ';';
		}

		for ( var k = 0; k < styleArr2.length; k++)
		{
			if (styleArr2[k] != '')
				mergedStyles += styleArr2[k] + ';';
		}

		return mergedStyles;
	},
	getMergedCustomStyles: function(node1, node2)
	{
		var style1 = node1 && dojo.attr(node1, 'customstyle') ? dojo.attr(node1, 'customstyle').replace(/(^\s+|\s+$)/g, '') : '';
		var style2 = node2 && dojo.attr(node2, 'customstyle') ? dojo.attr(node2, 'customstyle').replace(/(^\s+|\s+$)/g, '') : '';

		if ((style1 == '' || style1 == 'null') && (style2 == '' || style2 == 'null'))
			return '';
		else if (style1 == '' || style1 == 'null')
			return style2;
		else if (style2 == '' || style2 == 'null')
			return style1;

		var styleArr1 = style1 ? style1.split(';') : [];
		var styleArr2 = style2 ? style2.split(';') : [];
		var mergedStyles = '';
		for ( var i = 0; i < styleArr1.length; i++)
		{
			if (styleArr1[i] == '' || styleArr1[i] == 'null')
				continue;

			var sName1 = styleArr1[i].split(':')[0] == null ? '' : styleArr1[i].split(':')[0].replace(/(^\s+|\s+$)/g, '');
			var sValue1 = styleArr1[i].split(':')[1] == null ? '' : styleArr1[i].split(':')[1].replace(/(^\s+|\s+$)/g, '');
			for ( var j = 0; j < styleArr2.length; j++)
			{
				if (styleArr2[j] == '')
					continue;

				var sName2 = styleArr2[j].split(':')[0] == null ? '' : styleArr2[j].split(':')[0].replace(/(^\s+|\s+$)/g, '');
				var sValue2 = styleArr2[j].split(':')[1] == null ? '' : styleArr2[j].split(':')[1].replace(/(^\s+|\s+$)/g, '');
				if (sName1 == sName2)
				{
					mergedStyles += sName2 + ':' + sValue2 + ';';
					styleArr2[j] = '';
					styleArr1[i] = '';
				}
			}
			if (styleArr1[i] != '')
				mergedStyles += styleArr1[i] + ';';
		}

		for ( var k = 0; k < styleArr2.length; k++)
		{
			if (styleArr2[k] != '')
				mergedStyles += styleArr2[k] + ';';
		}

		return mergedStyles;
	},
	getDefaultCellContentHtml: function(text)
	{
		var content = text ? text : '&nbsp;';
		var p = document.createElement('p');
		p.innerHTML = '<span>' + content + '</span><br class="hideInIE">';
		return p.outerHTML;
	},
	fixExternalData: function(htmlContent, forTable)
	{
		if (!htmlContent && forTable)
		{
			return this.getDefaultCellContentHtml();
		}
		else if (!htmlContent)
			return htmlContent;

		var ckNode = document.createElement('div');
		ckNode.innerHTML = htmlContent;
		PresCKUtil.fixNestedSpans(ckNode);
		if (forTable && !PresCKUtil.doesNodeContainText(ckNode))
		{
			dojo.destroy(ckNode);
			return this.getDefaultCellContentHtml();
		}

		var pasteNodes = ckNode.children;

		// handle the case where all we are fixing is text.
		if (pasteNodes.length == 0 && ckNode.textContent.length > 0)
		{
			if (forTable)
			{
				return this.getDefaultCellContentHtml(ckNode.innerHTML);
			}
			else
				return '<span>' + ckNode.innerHTML + '</span>';
		}

		var ulStr = '<ul odf_element="text:list" class="text_list lst-c"></ul>';
		var olStr = '<ol class="text_list lst-n" odf_element="text:list" style="counter-reset: lst-n 0; "></ol>';
		var ul = CKEDITOR.dom.element.createFromHtml(ulStr).$;
		var ol = CKEDITOR.dom.element.createFromHtml(olStr).$;
		var isOL = false;
		// we need to go through all the nodes and build any ul/ol's we find
		// and also we are flattening nested spans.
		for ( var n = 0; n < pasteNodes.length; n++)
		{
			var node = pasteNodes[n];
			if (dojo.hasClass(node, 'removeThisNode'))
				continue;

			var bulletNode = dojo.attr(node, 'concordList') ? node : dojo.query('[concordList]', node)[0];
			if (bulletNode)
			{
				var isOL = dojo.attr(bulletNode, 'concordList').indexOf('numbullet') != -1;
				var childCount = node.children.length;
				dojo.addClass(node, 'removeThisNode');
				// if MSOffice added a bullet node remove it.
				if (node.firstChild != node.lastChild)
				{
					for ( var x = childCount - 1; x >= 0; x--)
					{
						var child = node.children[x];
						if (x == 0)
						{
							// remove bullet node
							dojo.destroy(child);
						}
						else
						{
							while (child.hasChildNodes() && child.firstChild == child.lastChild && child.firstChild.nodeType != CKEDITOR.NODE_TEXT)
							{
								var style = this.getMergedStyles(child, child.firstChild);
								child = dojo.place(child.firstChild, child, 'replace');
								dojo.attr(child, 'style', style);
							}
						}
					}
				}
				// convert node to li
				var li = document.createElement('li');
				EditorUtil.injectRdomIdsForElement(li);
				dojo.addClass(li, 'text_list-item'); // for conversion
				li.innerHTML = ((node.firstChild == node.lastChild) && node.firstChild.nodeType == CKEDITOR.NODE_TEXT) ? '<span>' + node.innerHTML + '</span>' : node.innerHTML;
				dojo.attr(li, 'p_text_style-name', '');
				dojo.attr(li, 'text_p', 'true');
				var isEnd = (n == pasteNodes.length - 1);
				if (!isOL)
				{
					if (ol.hasChildNodes())
					{
						// we are starting a new UL flush out old OL
						dojo.place(ol, node, 'before');
						ol = CKEDITOR.dom.element.createFromHtml(olStr).$;
					}
					ul.appendChild(li);
					// if we are at the last node move ul into paste data
					if (isEnd)
					{
						dojo.place(ul, node, 'before');
					}
				}
				else
				{
					if (ul.hasChildNodes())
					{
						// we are starting a new OL flush out old UL
						dojo.place(ul, node, 'before');
						ul = CKEDITOR.dom.element.createFromHtml(ulStr).$;
					}
					ol.appendChild(li);
					// if we are at the last node move ol into paste data
					if (isEnd)
					{
						dojo.place(ol, node, 'before');
					}
				}
			}
			else
			{
				// not a bullet, therefore (not)/(is end of) a list
				if (ul.hasChildNodes())
				{
					dojo.place(ul, node, 'before');
					ul = CKEDITOR.dom.element.createFromHtml(ulStr).$;
				}
				else if (ol.hasChildNodes())
				{
					dojo.place(ol, node, 'before');
					ol = CKEDITOR.dom.element.createFromHtml(olStr).$;
				}

				if (node.nodeType != CKEDITOR.NODE_TEXT && node.nodeName.toLowerCase() == 'p')
				{
					dojo.removeAttr(node,'style');
					var childCount = node.children.length;
					for ( var x = childCount - 1; x >= 0; x--)
					{
						var child = node.children[x];
						while (child.hasChildNodes() && (child.firstChild == child.lastChild || (child.childNodes.length == 2 && child.lastChild.childNodes.length == 0)) && child.firstChild.nodeType != CKEDITOR.NODE_TEXT && child.firstChild.nodeName.toLowerCase() != 'a')
						{
							var style = this.getMergedStyles(child, child.firstChild);
							child = dojo.place(child.firstChild, child, 'replace');
							dojo.attr(child, 'style', style);
						}
					}
					if (childCount == 0 && node.firstChild && node.firstChild.nodeType == CKEDITOR.NODE_TEXT)
					{
						// text under p not correct. wrap in span
						var nodeText = node.innerHTML;
						node.innerHTML = '<span>' + nodeText + '</span>';
					}
					else if (!PresCKUtil.doesNodeContainText(node))
					{
						// remove empty P nodes.
						dojo.addClass(node, 'removeThisNode');
					}
				}
				else if (node.nodeType != CKEDITOR.NODE_TEXT && node.nodeName.toLowerCase() == 'span')
				{
					while (node.hasChildNodes() && node.firstChild == node.lastChild && node.firstChild.nodeType != CKEDITOR.NODE_TEXT)
					{
						var style = this.getMergedStyles(node, node.firstChild);
						node = dojo.place(node.firstChild, node, 'replace');
						dojo.attr(node, 'style', style);
					}
					if (forTable)
					{
						var p = document.createElement('p');
						p.innerHTML = node.outerHTML;
						dojo.place(p, node, 'before');
						dojo.addClass(node, 'removeThisNode');
					}
				}
				else if (node.nodeType != CKEDITOR.NODE_TEXT && node.nodeName.toLowerCase() == 'a')
				{
					var text = node.textContent;
					var span = document.createElement('span');
					span.innerHTML = text;
					node.innerHTML = '';
					node.appendChild(span);					
					var p = document.createElement('p');
					dojo.place(p, node, 'before');
					p.appendChild(node);
				}
				else if (node.nodeType != CKEDITOR.NODE_TEXT && (node.nodeName.toLowerCase() == 'ol' || node.nodeName.toLowerCase() == 'ul'))
				{
					var listChildCount = node.children.length;
					for ( var l = listChildCount - 1; l >= 0; l--)
					{
						var listChild = node.children[l];
						if (listChild.nodeName.toLowerCase() != 'li')
						{
							if (PresCKUtil.doesNodeContainText(listChild))
							{
								var li = document.createElement('li');
								li.innerHTML = listChild.outerHTML;
								listChild = dojo.place(li, listChild, 'replace');
								this.fixLi(listChild);
							}
							else
								dojo.destroy(listChild);
						}
					}

					dojo.query('li', node).forEach(function(n, i, a)
					{
						if (n.firstChild && n.firstChild.nodeType != CKEDITOR.NODE_TEXT && n.firstChild.nodeName.toLowerCase() == 'p')
						{
							// convert to span.
							var ihtml = n.innerHTML;
							ihtml = ihtml.replace(/<p/ig, '<span');
							ihtml = ihtml.replace(/p>/ig, 'span>');
							n.innerHTML = ihtml;
						}
					});
				}
			}
		}
		dojo.query('.removeThisNode', ckNode).forEach(dojo.destroy);

		// D21073 apply font-size reduction for sub/super script text
		dojo.query('*[style*=\"vertical-align: super\"],*[style*=\"vertical-align: sub\"]', ckNode).forEach(function(node, i, arr)
		{
			dojo.style(node, 'fontSize', '0.58em');
		});

		htmlContent = ckNode.innerHTML;
		dojo.destroy(ckNode);
		return htmlContent;
	},
	removePInLi: function(node)
	{
		// fix the list structure copied on ie, that there will be <p> node
		// under list, which is illegal and may result in error
		var pNodes = dojo.query('li > p', node);
		for ( var i = 0; i < pNodes.length; i++)
		{
			var pNode = pNodes[i];
			var childNodes = pNode.childNodes;
			for ( var j = 0; j < childNodes.length; j++)
			{
				var childNode = CKEDITOR.dom.node(childNodes[j]);
				var newNode = childNode.clone(true);
				newNode.insertBefore(CKEDITOR.dom.node(pNode));
			}
			if (childNodes.length > 0)
			{
				dojo.addClass(pNode, 'removeThisNode');
			}
		}
		dojo.query('.removeThisNode', node).forEach(dojo.destroy);
	},
	getLstClass: function(node)
	{
		var classes = dojo.getNodeProp(node, 'class');
		if (classes)
		{
			var array = classes.split(' ');
			var idx = 0;
			for (; idx < array.length; idx++)
			{
				if (array[idx].indexOf('lst-') >= 0)
				{
					return array[idx];
				}
			}
		}
		return null;
	},
	fixOl: function(node)
	{
		var lstClass = this.getLstClass(node);
		if (!lstClass)
		{
			var firstChild = node.firstChild;
			if (firstChild && firstChild.nodeName.toLowerCase() == 'li')
				lstClass = this.getLstClass(firstChild);
		}
		if (lstClass)
			dojo.style(node, 'counterReset', lstClass);
		else
			dojo.style(node, 'counterReset', 'lst-n 0');
	},
	fixLi: function(node)
	{
		var parent = node.parentNode;
		if (parent.nodeName.toLowerCase() != 'ul' && parent.nodeName.toLowerCase() != 'ol')
		{
			// convert li to span not in a list and bad format
			node.outerHTML = node.outerHTML.replace('<li', '<span');
			node.outerHTML = node.outerHTML.replace('li>', 'span>');
		}
		else
		{
			dojo.addClass(node, 'text_list-item');
			dojo.addClass(parent, 'text_list');
			var hasLstML = false;
			var listClassesStr = dojo.attr(node, 'class');
			if (listClassesStr)
			{
				var listClasses = listClassesStr.split(' ');
				for ( var j = 0; j < listClasses.length; j++)
				{
					if ((listClasses[j].match(/^lst-/) && !listClasses[j].match(/^lst-MR/)) || listClasses[j].match(/^ML_/))
					{
						hasLstML = true;
						break;
					}
				}
			}
			if (!hasLstML)
			{
				if (parent.nodeName.toLowerCase() == 'ol')
				{
					dojo.addClass(node, 'lst-n');
					dojo.addClass(parent, 'lst-n');
				}
				else
				{
					dojo.addClass(node, 'lst-c');
					dojo.addClass(parent, 'lst-c');
				}
			}
		}
	},
	transformFontNodes: function(htmlContent)
	{
		if (htmlContent != null)
		{
			if (htmlContent.toLowerCase().indexOf("<font") != -1)
			{
				// D14643 Grab color, face and size attribute from font level if exists
				var fontElement = null;
				var spanElements = null;
				var isTbody = false;
				var htmlElement = document.createElement('div');
				if (htmlContent.toLowerCase().indexOf("<tbody") == 0)
				{
					htmlElement.innerHTML = "<table>" + htmlContent + "</table>";
					isTbody = true;
				}
				else
					htmlElement.innerHTML = htmlContent;

				var fontElements = htmlElement.getElementsByTagName('font');
				for ( var k = 0; k < fontElements.length; k++)
				{
					fontElement = fontElements[k];
					// var htmlElement = CKEDITOR.dom.element.createFromHtml(htmlContent);
					// There are 2 formats seen when the <font> element is added
					// 1) <font color=xxx><span><span><...></span></span></font>
					// In this case we want to update all spans within the <font>
					if (fontElement != null)
					{
						// get all the spans direct children of the font element
						// check the firstchild is not a text node
						var firstChild = fontElement.firstElementChild;
						var children = false;
						if (firstChild != null && firstChild.nodeName.toLowerCase() == "span")
						{ // it has span as children, then assume all children are spans
							spanElements = fontElement.children;
							children = true;
						}
						else
						{
							// 2) <span><font color=xxx></font></span>
							// Just update the parent in this case
							spanElements = fontElement.parentElement;
							if (spanElements == null || (spanElements.nodeName.toLowerCase() != "span"))
							{
								var span = document.createElement('span');
								span.innerHTML = fontElement.outerHTML;
								fontElement.parentElement.replaceChild(span, fontElement);
								spanElements = span;
							}
						}
						var colorAttr = fontElement.getAttribute('color');
						var faceAttr = fontElement.getAttribute('face');
						var sizeAttr = fontElement.getAttribute('size');

						this._updateFontElementStylesToSpan('color', colorAttr, children, spanElements);
						if (dojo.isIE != 8 && !dojo.isChrome && !dojo.isSafari)
						{
							// in IE8 the font size coming in is not accurate and therefore we are discarding it.
							this._updateFontElementStylesToSpan('fontSize', sizeAttr, children, spanElements);
						}
						this._updateFontElementStylesToSpan('fontFamily', faceAttr, children, spanElements);

					}
				}
				if (isTbody)
				{
					htmlContent = htmlElement.getFirst().innerHTML;
				}
				else
					// htmlContent = htmlElement.getOuterHtml();
					htmlContent = htmlElement.innerHTML;
				// remove and <font> </font> from data
				htmlContent = htmlContent.replace(/<font[^>]*>|<\/font>/ig, '');
				dojo.destroy(htmlElement);
			}
		}
		return htmlContent;
	},
	_updateFontElementStylesToSpan: function(styleName, styleValue, children, spanElements)
	{
		if (styleValue)
		{
			if (children)
			{
				for ( var i = 0; i < spanElements.length; i++)
				{
					var spanElement = spanElements[i];
					if (spanElement && spanElement.nodeName.toLowerCase() == 'span')
					{
						dojo.style(spanElement, styleName, styleValue);
					}
				}
			}
			else
			{
				var spanElement = spanElements;
				if (spanElement && spanElement.nodeName.toLowerCase() == 'span')
				{
					dojo.style(spanElement, styleName, styleValue);
				}
			}
		}
	},
	convertStyleTags: function(htmlstr)
	{
		if (!htmlstr)
			return htmlstr;
		// look for and replace <u> <b> <i> <strike> with span equivelents.
		// <b = <span style="font-weight:bold;"
		// <u = <span style="text-decoration:underline;"
		// <i = <span style="font-style:italic;"
		// <strike =<span style="text-decoration:line-through;"
		var styles = ['b', 'u', 'i', 'strike', 'em', 'strong'];
		var htmlElement = document.createElement('div');
		htmlElement.innerHTML = htmlstr;
		for ( var s = 0; s < styles.length; s++)
		{
			var elements = htmlElement.getElementsByTagName(styles[s]);
			var eCount = elements.length;
			for ( var e = eCount - 1; e >= 0; e--)
			{
				var element = elements[e];
				if (element != null)
				{
					var span = document.createElement('span');
					if (styles[s] == 'b' || styles[s] == 'strong')
					{
						span.style.fontWeight = 'bold';
					}
					else if (styles[s] == 'u')
					{
						span.style.textDecoration = 'underline';
					}
					else if (styles[s] == 'i' || styles[s] == 'em')
					{
						span.style.fontStyle = 'italic';
					}
					else if (styles[s] == 'strike')
					{
						span.style.textDecoration = 'line-through';
					}

					span.innerHTML = element.innerHTML;
					dojo.place(span, element, 'replace');
				}
			}
		}

		htmlstr = htmlElement.innerHTML;
		dojo.destroy(htmlElement);
		return htmlstr;
	},
	fixPAlignTags: function(htmlstr)
	{
		if (!htmlstr || htmlstr.toLowerCase().indexOf('<p') == -1 || htmlstr.toLowerCase().indexOf('align=') == -1)
			return htmlstr;
		var htmlElement = document.createElement('div');
		htmlElement.innerHTML = htmlstr;
		var pElems = htmlElement.getElementsByTagName('p');
		var count = pElems.length;
		for ( var p = count - 1; p >= 0; p--)
		{
			var pElem = pElems[p];
			if (!PresCKUtil.doesNodeContainText(pElem))
			{
				dojo.destroy(pElem);
			}
			else if (pElem && dojo.hasAttr(pElem, 'align'))
			{
				var align = dojo.attr(pElem, 'align');
				dojo.removeAttr(pElem, 'align');
				dojo.style(pElem, 'textAlign', align.toLowerCase());
			}
		}
		htmlstr = htmlElement.innerHTML;
		dojo.destroy(htmlElement);
		return htmlstr;

	},
	cleanStyles: function(htmlstr, fromExt)
	{
		concord.util.presCopyPasteUtil = this;
		if (!htmlstr)
			return htmlstr;
		var ckNode = document.createElement('div');
		// S22654 only support copy plaintext from office to presentation now.
		// D26449: Copy text from MS office 2003 to textbox, titleplace holder style is not correct
		ckNode.innerHTML = '<tempp>' + htmlstr + '</tempp>';
		PresCKUtil.fixDOMStructure(ckNode);
		if (fromExt)
		{
			var filterpasteElems = dojo.query('span', ckNode);
			for ( var i = 0; i < filterpasteElems.length; i++)
			{
				var fnode = filterpasteElems[i];
				if (fnode.hasAttribute('concord-list') || fnode.hasAttribute('concordlist') || fnode.hasAttribute('concord-list') || fnode.hasAttribute('chrome-list') || (fnode.hasAttribute('style') && (dojo.attr(fnode, 'style').indexOf('concord-list') >= 0 || dojo.attr(fnode, 'style').indexOf('mso-list') >= 0 || dojo.attr(fnode, 'style').indexOf('chrome-list') >= 0)))
				{
					dojo.destroy(fnode);
				}
			}
			if (dojo.isWebKit)
			{
				var filterpasteElems = dojo.query('p', ckNode);
				for ( var i = 0; i < filterpasteElems.length; i++)
				{
					var fnode = filterpasteElems[i];
					if ((fnode.hasAttribute('concordlist') || fnode.hasAttribute('concord-list') || fnode.hasAttribute('chrome-list') || (fnode.hasAttribute('style') && (dojo.attr(fnode, 'style').indexOf('concord-list') >= 0 || dojo.attr(fnode, 'style').indexOf('mso-list') >= 0 || dojo.attr(fnode, 'style').indexOf('chrome-list') >= 0))) && fnode.firstChild && fnode.childNodes.length > 1 && fnode.firstChild.nextSibling.nodeName.toLowerCase() == 'span')
					{
						dojo.destroy(fnode.firstChild);
					}
				}
			}

			htmlstr = ckNode.innerHTML;
			htmlstr = htmlstr.replace(/ concordlist=\".*?\"/gi, "");
			htmlstr = htmlstr.replace(/ concordlist=\'.*?\'/gi, "");
			htmlstr = htmlstr.replace(/:colorscheme colors=\".*?\"/gi, "");
			htmlstr = htmlstr.replace(/:colorscheme colors=\'.*?\'/gi, "");
			htmlstr = htmlstr.replace(/:colorscheme/gi, "");
			htmlstr = htmlstr.replace(/ v:shape=\".*?\">/gi, ">");
			htmlstr = htmlstr.replace(/ v:shape=\'.*?\'>/gi, ">");
			// D26136: [Chrome]copy text and paste, font name and font color are incorrect
			// htmlstr = htmlstr.replace(/ class=".*?\"/gi, "");
			// htmlstr = htmlstr.replace(/ style=\".*?\"/gi, "");
			// htmlstr = htmlstr.replace(/ style=\'.*?\'/gi, "");
			htmlstr = htmlstr.replace(/u style=\".*?\"/gi, "u");
			htmlstr = htmlstr.replace(/s style=\".*?\"/gi, "s");
			htmlstr = htmlstr.replace(/u style=\'.*?\'/gi, "u");
			htmlstr = htmlstr.replace(/s style=\'.*?\'/gi, "s");
			htmlstr = htmlstr.replace(/ id=\".*?\"/gi, "");
			htmlstr = htmlstr.replace(/ id=\'.*?\'/gi, "");
			var charValue = String.fromCharCode(8226);
			htmlstr = htmlstr.replace(new RegExp(charValue, "gm"), '');
			charValue = String.fromCharCode(10);
			htmlstr = htmlstr.replace(new RegExp(charValue, "gm"), '');
			htmlstr = htmlstr.replace(new RegExp('<div.*?>', "gm"), '<p>');
			htmlstr = htmlstr.replace(new RegExp('</div>', "gm"), '</p>');
			htmlstr = htmlstr.replace(new RegExp('<ul.*?>', "gm"), '');
			htmlstr = htmlstr.replace(new RegExp('</ul>', "gm"), '');
			htmlstr = htmlstr.replace(new RegExp('<ol.*?>', "gm"), '');
			htmlstr = htmlstr.replace(new RegExp('</ol>', "gm"), '');
			htmlstr = htmlstr.replace(new RegExp('<li.*?>', "gm"), '<p>');
			htmlstr = htmlstr.replace(new RegExp('</li>', "gm"), '</p>');
			htmlstr = htmlstr.replace(/(<s>)+/gm, "");
			htmlstr = htmlstr.replace(/(<\/s>)+/gm, "");
			htmlstr = htmlstr.replace(/(<u>)+/gm, "");
			htmlstr = htmlstr.replace(/(<\/u>)+/gm, "");
			ckNode.innerHTML = htmlstr;
			PresCKUtil.fixDOMStructure(ckNode);
			htmlstr = ckNode.innerHTML;
			htmlstr = htmlstr.replace(/(<span>)+/gm, '<span>');
			htmlstr = htmlstr.replace(/(<\/span>)+/gm, '</span>');
			htmlstr = htmlstr.replace(/(<p>)+/gm, '<p>');
			htmlstr = htmlstr.replace(/(<\/p>)+/gm, '</p>');
			htmlstr = htmlstr.replace(/(<\/span><span>)+/gm, "");
			htmlstr = htmlstr.replace(/(<span><\/span>)+/gm, "");
			htmlstr = htmlstr.replace(/(<p><\/p>)+/gm, "");
			charValue = null;
			ckNode.innerHTML = htmlstr;
			// D23587: [IE/Chrome][CopyPaste]Copy text from MS Documents to concord ,text remain source property except for color
			// htmlstr=htmlstr.replace(/font-size:.*?\em;/gi, 'font-size:1.0em;');
		}
		var pasteElems = dojo.query('span,li,p,ul,ol,table,td,tr', ckNode);
		for ( var i = 0; i < pasteElems.length; i++)
		{
			var node = pasteElems[i];
			var fontWeight = node.style.fontWeight;
			var fontStyle = node.style.fontStyle;
			var fontFamily = node.style.fontFamily;
			var textDecoration = node.style.textDecoration;
			var color = node.style.color;
			var fontSize = node.style.fontSize;
			var verticalAlign = node.style.verticalAlign;
			var textAlign = node.style.textAlign;
			var counterReset = node.style.counterReset;
			var indent = node.style.marginLeft;

			var bgcolor = node.style.backgroundColor;
			var bdcolor = node.style.borderColor;

			// D26683: [Regression]Javascript is stop work after copy&Paste list paragraph in a table issue 1
			var lineheight = node.style.lineHeight;
			var liststyletype = node.style.listStyleType;
			if ((dojo.isChrome || dojo.isSafari) && node.nodeName.toLowerCase() == 'p' && fromExt)
			{
				// workaround for issue with cleanWord list conversion in chrome
				var ns = dojo.attr(node, 'style');
				if (ns && (ns != '' || ns != ' '))
				{
					ns = ns.split(';');
					for ( var x = 0; x < ns.length; x++)
					{
						var stylePair = ns[x].replace(/(^\s+|\s+$)/g, '');
						if (stylePair.split(':')[0] == 'chrome-list')
						{
							// in webKit every list is a UL
							dojo.attr(node, 'concordList', 'bullet');
						}
					}
				}
			}

			var font = node.style.font;
			if (dojo.isSafari && font && font.length > 0)
			{
				dojo.style(node, 'font', '');
			}

			// D32889 new a customized table and copy part of cells,but the copied part table cell border lost.
			// if(htmlstr.indexOf('smartTable') < 0){
			// dojo.removeAttr(node, 'style');

			if (PresCKUtil.checkNodeName(node, 'td', 'th'))
			{
				var width = "";
				if (dojo.isFF || dojo.isIE)
				{
					width = dojo.getComputedStyle(node).width; // e.g. "width: 50%;";
				}
				else
				{
					var wholeStyle = node.style.cssText;
					var sList = wholeStyle.split(";");
					for ( var j = 0, len = sList.length; j < len; j++)
					{
						var styleObject = sList[j].split(":");
						var key = styleObject[0] || "";
						if (dojo.trim(key.toLowerCase()) == "width")
						{
							width = styleObject[1]; // in chrome, this value is in px
							break;
						}
					}

				}
				dojo.removeAttr(node, 'style');
				dojo.style(node, "width", width || '20%');
			}

			if (bgcolor && bgcolor.length > 0)
			{
				dojo.style(node, 'backgroundColor', bgcolor);
			}
			if (bdcolor && bdcolor.length > 0)
			{
				dojo.style(node, 'borderColor', bdcolor);
			}

			// }
			if (lineheight && lineheight.length > 0 && lineheight.toLowerCase().indexOf('px') < 0)
			{
				dojo.style(node, 'lineHeight', lineheight);
			}
			if (liststyletype && liststyletype.length > 0)
			{
				dojo.style(node, 'listStyleType', liststyletype);
			}
			if (fontWeight && fontWeight.length > 0)
			{
				dojo.style(node, 'fontWeight', fontWeight);
			}

			if (fontStyle && fontStyle.length > 0)
			{
				dojo.style(node, 'fontStyle', fontStyle);
			}

			if (fontFamily && fontFamily.length > 0)
			{
				fontFamily = pres.utils.cssHelper.replaceFontName(fontFamily);
				dojo.style(node, 'fontFamily', fontFamily);
			}

			if (textDecoration && textDecoration.length > 0)
			{
				dojo.style(node, 'textDecoration', textDecoration);
			}

			if (color && color.length > 0)
			{
				dojo.style(node, 'color', color);
			}

			// D26449: Copy text from MS office 2003 to textbox, titleplace holder style is not correct
			// Sometime the default fontsize doesn't be saved, add it.
			if (fromExt && !fontSize && node.nodeName.toLowerCase() == 'span' && !dojo.hasClass(node, 'text_p') && node.parentNode && node.parentNode.nodeName.toLowerCase() != 'span' && !node.parentNode.style.fontSize)
				fontSize = '18pt';
			if (fontSize && fontSize.length > 0 && parseFloat(fontSize))
			{
				var absFontSize = PresFontUtil.convertFontsizeToPT(fontSize);
				if (absFontSize != 18.0)
					PresCKUtil.setCustomStyle(node, PresConstants.ABS_STYLES.FONTSIZE, absFontSize);
				if (PresCKUtil.checkNodeName(node, 'span'))
				{
					dojo.style(node, 'fontSize', absFontSize / 18.0 + 'em');
				}
				else
				{
					var element = new CKEDITOR.dom.element(node);
					element.removeStyle('font-size');
				}

			}

			if (verticalAlign && verticalAlign.length > 0)
			{
				dojo.style(node, 'verticalAlign', verticalAlign);
			}

			if (textAlign && textAlign.length > 0)
			{
				dojo.style(node, 'textAlign', textAlign);
			}
			// if counterReset is set preserve, otherwise if it is an OL add counterReset style
			if (counterReset && counterReset.length > 0)
			{
				dojo.style(node, 'counterReset', counterReset);
			}
			else if (node.nodeName.toLowerCase() == 'ol')
			{
				this.fixOl(node);
			}

			if (indent && indent.length > 0)
			{
				dojo.style(node, 'marginLeft', indent);
			}

			// fix list classes for lists copied from msWord
			if (node.nodeName.toLowerCase() == 'li')
			{
				if (!dojo.hasClass(node, 'text_list-item'))
					this.fixLi(node);
				else
				{
					PresListUtil.removeListBeforeClass(node);
				}
			}

		}

		htmlstr = ckNode.innerHTML;
		htmlstr = htmlstr.replace(/<tempp>/, "");
		htmlstr = htmlstr.replace(/<\/tempp>/, "");
		dojo.destroy(ckNode);
		return htmlstr;
	},
	UpdateID: function(htmlstr)
	{
		if (!htmlstr)
			return htmlstr;
		var ckNode = document.createElement('div');
		ckNode.innerHTML = '<tempp>' + htmlstr + '</tempp>';
		var filterpasteSpans = dojo.query('span', ckNode);
		for ( var i = 0; i < filterpasteSpans.length; i++)
		{
			var fnode = filterpasteSpans[i];
			if (fnode.hasAttribute('id'))
			{
				fnode.removeAttribute('id');
			}
		}
		htmlstr = ckNode.innerHTML;
		htmlstr = htmlstr.replace(/<tempp>/, "");
		htmlstr = htmlstr.replace(/<\/tempp>/, "");
		dojo.destroy(ckNode);
		return htmlstr;
	},
	buildNewID: function(tempDiv)
	{
		if (!tempDiv)
			return tempDiv;
		var children = tempDiv.getElementsByTagName('*');
		for ( var i = 0; i < children.length; i++)
		{
			EditorUtil.injectRdomIdsForElement(children[i]);
		}
		return tempDiv;
	},
	isRotatedPPTODPGroupBox: function(element)
	{
		var isPPTODPGroupBox = (element.family == "group" || element.family =="text") && (DOC_SCENE.extension.toLowerCase() != 'pptx' || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft));
		if (!isPPTODPGroupBox)
			return false;
		
		var styleString = element.attrs.draw_transform || '';
		if (styleString.indexOf('transform') >= 0 || styleString.indexOf('rotate') >= 0)
		{
			return true;
		}
		var txtbox = element.txtBox;
		if (txtbox)
		{
			var styleString = txtbox.attrs.style || '';
			if (styleString.indexOf('transform') >= 0 || styleString.indexOf('rotate') >= 0)
			{
				return true;
			}
		}
		return false;
	},
	sortZIndexArray: function(pasteArray)
	{
		var zArray = [];
		if (pasteArray && pasteArray.constructor === Array)
		{
			for ( var i = 0; i < pasteArray.length; i++)
			{
				var element = pasteArray[i];
				var zOrder = element.z ? element.z : 0;
				zArray.push({
					'index': i,
					'zIndex': zOrder
				});
			}
			zArray.sort(function(a, b)
			{
				if (a.zIndex == b.zIndex)
					return 0;
				else if (a.zIndex < b.zIndex)
					return -1;
				else
					return 1;
			});
		}
		return zArray;
	}
});