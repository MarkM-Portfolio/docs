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
dojo.provide("concord.widgets.shapePropDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.presTools");
dojo.require("dijit.ColorPalette");
dojo.require("concord.widgets.presColorPalette");
dojo.requireLocalization("concord.widgets","presPropertyDlg");
dojo.declare("concord.widgets.shapePropDlg", [concord.widgets.concordDialog], {
	nls:null,	
	editor:null,
	widthInput:null,	
	heightInput:null,
	currentWidth:null,
	currentHeight:null,
	currentShape:null,
	altText:null,
	widthValid:true,
	heightValid:true,
	borderValid:true,
			
	constructor: function(editor) {	
		this.dialog.attr("title", this.concordTitle);	
		this.editor = editor;
	},

    createColorSelectButton: function( id, tabIndexId, appendToId, buttonLabel){
		var randomSeed = new Date().getTime();
		var buttonLabelId = id + '_color_label';
		var buttonId = id;
		var colorPalette = new concord.widgets.presColorPalette({
		onChange : function(selectedColor) {
				var nls = dojo.i18n.getLocalization("concord.widgets","presPropertyDlg");
				var image = dojo.query('img.dijitColorPaletteSwatch', dojo.byId(id+'_label'))[0];
				if (image) dojo.destroy(image);
				if (this._selectedCell == 0 && dojo.attr(this._currentFocus, 'title') == nls.noColor) {
					var template = "<img src='${blankGif}' alt='${alt}' border='0' class='dijitColorPaletteSwatch'/>";
					var noneSwatchPath = window.contextPath + window.staticRootPath + '/images/smarttable/None_swatch.gif';
					var html = dojo.string.substitute(template, {
						blankGif: noneSwatchPath,
						alt: 'transparent'								
					});
					dojo.place(html, dojo.byId(id+'_label'));
					selectedColor = 'transparent';
				}
				
				dojo.style( dojo.byId(id+'_label'),  {
					'backgroundColor': selectedColor
				});
				
				dojo.query('.dijitPaletteCell', this.domNode).forEach(function(node, index, array){ 		
					dojo.style( node, {
						'border' : '1px solid #FFFFFF',
						'padding': '2px',
						'backgroundColor': ''
					});
            	});
			}
		});
		var button = new dijit.form.ComboButton({
			iconClass: 'plusBlockIcon',
			name: 'Color Picker Button',
			optionsTitle: buttonLabel,
			dropDown: colorPalette,
			id: buttonId,
			onFocus : function() {
				dojo.style( dojo.byId(buttonId + "_arrow"), 'borderColor', '#666666');
			},
			onBlur : function() {
				dojo.style( dojo.byId(buttonId + "_arrow"), 'borderColor', '');
			}
		});	
		dojo.byId(appendToId).appendChild(button.domNode);	
		var colorButton = dojo.byId( buttonId + "_button" );
		var buttonArrow = dojo.byId( buttonId + "_arrow" );
		dojo.attr(  buttonArrow, 'tabindex', tabIndexId + 18);
		dojo.attr( colorButton, 'tabindex', -1);
		this.modifyDefaultColorPallete( colorPalette);
		dojo.connect(button,"onFocus",dojo.hitch(this,this.adjustPalleteColor,button));
		dojo.connect(button.dropDown,"onFocus",dojo.hitch(this,this.adjustPalleteColor,button));
		return button;
	},
	
	adjustPalleteColor: function(button) {
		var nodeToCheck = dojo.byId(button.id+'_label');
		if (dojo.style(nodeToCheck,'backgroundColor') == 'transparent' || dojo.style(nodeToCheck,'backgroundColor') == 'rgba(0, 0, 0, 0)' ) {
        	dojo.style( button.dropDown._cells[0].node, {
    			'border' : '1px solid #316ac5',
    			'backgroundColor': '#dff1ff'
    		});
        	if (!dojo.isIE) {
        		button.dropDown._cells[0].node.focus();
        	}
        } else {
        	var paletteNodes = dojo.query('.dijitPaletteCell', button.dropDown.domNode);
        	var currentColor = concord.text.tools.colorHex(dojo.style(nodeToCheck,'backgroundColor'));
        	for (var i=0; i< paletteNodes.length; i++){
				var selectedColor = concord.text.tools.colorHex(paletteNodes[i].firstChild.firstChild.style.backgroundColor);
            	if (currentColor == selectedColor) {
            		if (selectedColor == "#000000") {
            			if (!dojo.isIE) {
            				button.dropDown._cells[button.dropDown._cells.length-10].node.focus();
            			}
            			dojo.style( button.dropDown._cells[button.dropDown._cells.length-10].node, {
    						'border' : '1px solid #316ac5',
    						'backgroundColor': '#dff1ff'
    					});	
            		} else {
            			if (!dojo.isIE) {
            				paletteNodes[i].focus();
            			}
            			dojo.style( paletteNodes[i], {
    						'border' : '1px solid #316ac5',
    						'backgroundColor': '#dff1ff'
    					});	
            		}
            	} else {
            		dojo.style( paletteNodes[i], {
						'border' : '1px solid #FFFFFF',
						'padding': '2px',
						'backgroundColor': ''
					});
            	}
			}           		
        }
	},
		
	modifyDefaultColorPallete: function(colorPalette){
		var nls = dojo.i18n.getLocalization("concord.widgets","presPropertyDlg");
		var noneSwatchPath = window.contextPath + window.staticRootPath + '/images/smarttable/None_swatch.gif';
	    dojo.query('.dijitPaletteImg', colorPalette.domNode).forEach(function(node, index, array){
			dojo.style( node, {
				'width' : '10px',
				'height': '10px',
				'border' : '1px solid #808080',
				'padding': '0px'
			});	
		});
		dojo.query('.dijitPaletteCell', colorPalette.domNode).forEach(function(node, index, array){
			if (index == 0) {
				var transImage = dojo.query('.dijitColorPaletteSwatch', node);
				if (transImage && transImage[0]) {
					dojo.attr(transImage[0], 'src', noneSwatchPath);
				}
				
				dojo.attr(node, "title", nls.noColor);
			}
			dojo.style( node, {
				'border' : '1px solid #FFFFFF',
				'padding': '2px'
			});
			dojo.connect(node, 'onmouseover', function() {
				dojo.style( node, {
					'border' : '1px solid #316ac5',
					'backgroundColor': '#dff1ff'
				});
			});
			dojo.connect(node, 'onmouseout', function() {
				dojo.style( node, {
					'border' : '1px solid #FFFFFF',
					'backgroundColor': ''
				});
			});
		});
	    dojo.query('.dijitColorPaletteSwatch', colorPalette.domNode).forEach(function(node, index, array){
			dojo.style( node, {
				'width' : '10px',
				'height': '10px'
			});	
		});
		dojo.query('img.dijitColorPaletteUnder', colorPalette.domNode).forEach(function(node, index, array){
			dojo.style( node, {
				'visibility': 'hidden'
			});							
		});
	},
		
	createContent: function (contentDiv) {
		this.nls = dojo.i18n.getLocalization("concord.widgets","presPropertyDlg");
		this.noneSwatchPath = window.contextPath + window.staticRootPath + '/images/smarttable/None_swatch.gif';
		
		if(!this.unit){
			this.unit = PresTools.isMetricUnit() ? this.nls.cmUnit : this.nls.inUnit;			
		}
		
		var headerTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		
		// Width label and input
		var headerTR0 = dojo.create('tr', null, headerTbody);
		var headerTR0TD1 = dojo.create('td', null, headerTR0);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);
		var headerTR1TD2 = dojo.create('td', null, headerTR1);
		dojo.style(headerTR1TD1, 'paddingBottom', '10px');
		dojo.style(headerTR1TD2, 'paddingBottom', '10px');
		
		var labelWidthText = dojo.create('label', null, headerTR0TD1);
		labelWidthText.appendChild(document.createTextNode(this.nls.width));
		dojo.attr(labelWidthText,'for',this.inputWidthID);
		this.widthInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.currentWidth), id: this.inputWidthID, intermediateChanges: true});	
		dojo.addClass (this.widthInput.domNode, "inputBox");
		
		this.widthInput.domNode.style.width ='8em';
		headerTR1TD1.appendChild(this.widthInput.domNode);
		dijit.setWaiState(dojo.byId(this.inputWidthID), "required", true);
		
		this.createErrorIcon(headerTR1TD2, this.widthErrorIconId, this.nls.validUnitsWarning);

		// Height label and input
		var headerTR2 = dojo.create('tr', null, headerTbody);
		var headerTR2TD1 = dojo.create('td', null, headerTR2);
		var headerTR3 = dojo.create('tr', null, headerTbody);
		var headerTR3TD1 = dojo.create('td', null, headerTR3);
		var headerTR3TD2 = dojo.create('td', null, headerTR3);
		dojo.style(headerTR3TD1, 'paddingBottom', '10px');
		dojo.style(headerTR3TD2, 'paddingBottom', '10px');

		var labelHeightText = dojo.create('label', null, headerTR2TD1);
		labelHeightText.appendChild( document.createTextNode(this.nls.height));
		dojo.attr(labelHeightText,'for',this.inputHeightID);	
		this.heightInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.currentHeight), id: this.inputHeightID, intermediateChanges: true});	
		dojo.addClass(this.heightInput.domNode, "inputBox");
		
		this.heightInput.domNode.style.width ='8em';
		headerTR3TD1.appendChild(this.heightInput.domNode);	
		dijit.setWaiState(dojo.byId(this.inputHeightID), "required", true);
		
		this.createErrorIcon(headerTR3TD2, this.heightErrorIconId, this.nls.validUnitsWarning);

		// Fill row label and dropdown
		var headerTR4 = dojo.create('tr', null, headerTbody);
		var headerTR4TD1 = dojo.create('td', null, headerTR4);
		var headerTR5 = dojo.create('tr', null, headerTbody);
		var headerTR5TD1 = dojo.create('td', null, headerTR5);
		dojo.style(headerTR5TD1, 'paddingBottom', '10px');
		
		var fillColorLabel = dojo.create('label', null, headerTR4TD1);
		fillColorLabel.appendChild(document.createTextNode(this.nls.fillColor));
		
		var fillColorDiv = dojo.create('div', null, headerTR5TD1);
		dojo.attr(fillColorDiv,'id','fillColorDiv');
		this.fillColorSelect = this.createColorSelectButton(this.fillColorID, 1, 'fillColorDiv', this.nls.fillColorSelect);
		dojo.style(dojo.byId('P_d_ShapePropFillColor_label'),"width","10px");
		dojo.style(dojo.byId('P_d_ShapePropFillColor_label'),"height","10px");
		this.fillColorSelect.attr('disabled','disabled');	
		
		// Border color label and dropdown
		var headerTR6 = dojo.create('tr', null, headerTbody);
		var headerTR6TD1 = dojo.create('td', null, headerTR6);
		var headerTR7 = dojo.create('tr', null, headerTbody);
		var headerTR7TD1 = dojo.create('td', null, headerTR7);
		dojo.style(headerTR7TD1, 'paddingBottom', '10px');

		var borderColorLabel = dojo.create('label', null, headerTR6TD1);
		borderColorLabel.appendChild(document.createTextNode(this.nls.borderColor));
		
		var borderColorDiv = dojo.create('div', null, headerTR7TD1);
		dojo.attr(borderColorDiv,'id','borderColorDiv');
		this.borderColorSelect = this.createColorSelectButton(this.borderColorID, 1, 'borderColorDiv', this.nls.borderColorSelect);
		dojo.style(dojo.byId('P_d_ShapePropBorderColor_label'),"width","10px");
		dojo.style(dojo.byId('P_d_ShapePropBorderColor_label'),"height","10px");		
		this.borderColorSelect.attr('disabled','disabled');	

		// Border style label and dropdown
		var headerTR8 = dojo.create('tr', null, headerTbody);
		var headerTR8TD1 = dojo.create('td', null, headerTR8);
		var headerTR9 = dojo.create('tr', null, headerTbody);
		var headerTR9TD1 = dojo.create('td', null, headerTR9);
		dojo.style(headerTR9TD1, 'paddingBottom', '10px');

		var borderStyleLabel = dojo.create('label', {id: this.borderStyleLabelID}, headerTR8TD1);
		borderStyleLabel.appendChild(document.createTextNode(this.nls.borderStyle));
		
		this.borderStyleSelect = new dijit.form.Select({
            name: "borderStyle",
            id: ""+this.borderStyleID+"",
            options: [
                { label: "<span style='display:inline-block;width:110pt;text-align:center;margin-left:6px;color:black;'>"+this.nls.borderStyleNone+"</span>", value: "none" },
                { label: "<table role='presentation' cellspacing='0' style='height:15px;'><tbody><tr role='presentation'><td role='presentation' style='vertical-align:middle'><div style='border-top-style:solid;border-color:rgb(0, 0, 0);border-width:0.75pt;width:110pt;margin-left:6px;' aria-label='" + this.nls.borderStyleSolid + "'> </div></td></tr></tbody></table>", value: "solid"},
                { label: "<table role='presentation' cellspacing='0' style='height:15px;'><tbody><tr role='presentation'><td role='presentation' style='vertical-align:middle'><div style='border-top-style:dashed;border-color:#000000;border-width:1pt;width:110pt;margin-left:6px;' aria-label='" + this.nls.borderStyleDashed + "'> </div></td></tr></tbody></table>", value: "dashed" }
            ]
		}).placeAt(headerTR9TD1);
		dijit.setWaiState(this.borderStyleSelect._buttonNode, 'labelledby', this.borderStyleLabelID + " " + this.borderStyleID);

		// Border width label and dropdown
		var headerTR10 = dojo.create('tr', null, headerTbody);
		var headerTR10TD1 = dojo.create('td', null, headerTR10);
		var headerTR11 = dojo.create('tr', null, headerTbody);
		var headerTR11TD1 = dojo.create('td', null, headerTR11);
		dojo.style(headerTR11TD1, 'paddingBottom', '10px');

		var borderWidthLabel = dojo.create('label', {id: this.borderWidthLabelID}, headerTR10TD1);
		borderWidthLabel.appendChild(document.createTextNode(this.nls.borderWidth));

		this.borderWidthSelect = new dijit.form.Select({
            name: "borderWidth",
            id: ""+this.borderWidthID+"",
            options: [
                { label: "<span style='border-top-style:solid;border-color:rgb(0, 0, 0);border-width:0.75pt;display:inline-block;width:110pt;vertical-align:middle;margin-left:6px;height:2pt;' aria-label='" + this.nls.borderWidthThin + "'> </span>", value: "thin" },
                { label: "<span style='border-top-style:solid;border-color:rgb(0, 0, 0);border-width:1.50pt;display:inline-block;width:110pt;vertical-align:middle;margin-left:6px;height:2pt;' aria-label='" + this.nls.borderWidthMedium + "'> </span>", value: "medium" },
                { label: "<span style='border-top-style:solid;border-color:rgb(0, 0, 0);border-width:3.00pt;display:inline-block;width:110pt;vertical-align:middle;margin-left:6px;height:2pt;' aria-label='" + this.nls.borderWidthThick + "'> </span>", value: "thick" }
            ]
		}).placeAt(headerTR11TD1);
		this.borderWidthSelect.attr('disabled','disabled');		
		dijit.setWaiState(this.borderWidthSelect._buttonNode, 'labelledby', this.borderWidthLabelID + " " + this.borderWidthID);

		// Alt text label and input
		var headerTR7 = dojo.create('tr', null, headerTbody);
		var headerTR7TD1 = dojo.create('td', null, headerTR7);
		var headerTR7TD2 = dojo.create('td', null, headerTR7);
		var headerTR8 = dojo.create('tr', null, headerTbody);
		var headerTR8TD1 = dojo.create('td', null, headerTR8);

		this.createInfoIcon(headerTR7TD2, this.altTextIconId, this.nls.altTextDesc);

		var altTextLabel = dojo.create('label', null, headerTR7TD1);
		altTextLabel.appendChild(document.createTextNode(this.nls.alt));
		dojo.attr(altTextLabel,'for',this.altTextID);
		
		this.altTextInput = new dijit.form.TextBox({value:this.altText, id: this.altTextID});	
		dojo.addClass (this.altTextInput.domNode, "inputBox");	
		this.altTextInput.domNode.style.width ='20em';
		headerTR8TD1.appendChild(this.altTextInput.domNode);
		dojo.style(headerTR1TD1, 'marginLeft', '2px');
	
		dojo.connect( this.borderStyleSelect, "onChange", dojo.hitch(this,this.checkBorderStyle));
		dojo.connect( this.widthInput, "onChange", dojo.hitch(this,this.widthChanged));
		dojo.connect(this.widthInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
		dojo.connect( this.heightInput, "onChange", dojo.hitch(this,this.heightChanged));
		dojo.connect( this.heightInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
		dojo.connect(this.borderStyleSelect.dropDown,"onOpen", dojo.hitch(this,this.modifyDefaultSelector, this.borderStyleSelect.dropDown));
		dojo.connect(this.borderWidthSelect.dropDown,"onOpen", dojo.hitch(this,this.modifyDefaultSelector, this.borderWidthSelect.dropDown));
		
		this.widthInput.focus();
		this.widthInput.focusNode.select();		
	},	

	modifyDefaultSelector:function ( selector ){
		if( !selector.domNode )
			return;
		dojo.query('.dijitMenuItem', selector.domNode).forEach(function(node, index, array){
			dojo.style( node, {'backgroundColor': '#FFFFFF'});
			dojo.connect(node, 'onmouseover', function() {
				dojo.style( node, {
					'backgroundColor': '#DFF1FF'
				});
			});
			dojo.connect(node, 'onmouseout', function() {
				dojo.style( node, {
					'backgroundColor' : '#FFFFFF'
				});
			});
			dojo.connect(node, 'onfocus', function() {
				dojo.style( node, {
					'backgroundColor': '#DFF1FF'
				});
			});
			dojo.connect(node, 'onblur', function() {
				dojo.style( node, {
					'backgroundColor' : '#FFFFFF'
				});
			});
		});
	},
		
	show:function(){
		this.inherited(arguments);
		dojo.query('.dijitPaletteCell', this.borderColorSelect.dropDown.domNode).forEach(function(node, index, array){
			dojo.style( node, {
				'border' : '1px solid #FFFFFF',
				'padding': '2px',
				'backgroundColor': ''
			});
		});
		dojo.query('.dijitPaletteCell', this.fillColorSelect.dropDown.domNode).forEach(function(node, index, array){
			dojo.style( node, {
				'border' : '1px solid #FFFFFF',
				'padding': '2px',
				'backgroundColor': ''
			});
		});
        for (var i=0; i<this.editor.CONTENT_BOX_ARRAY.length; i++){
            if (this.editor.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.editor.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE)){
            	this.currentShape = this.editor.CONTENT_BOX_ARRAY[i];
            	break;
            }
        }
		this.currentWidth = dojo.style(this.currentShape.mainNode, 'width');
		this.currentHeight = dojo.style(this.currentShape.mainNode, 'height');
		

		var svgNode = dojo.query("svg", this.currentShape.mainNode);
		if (svgNode && svgNode.length > 0) {
			this.altText = dojo.attr(svgNode[0], 'alt');
			var gNode = dojo.query("g", svgNode[0]);
			if (gNode && gNode.length > 0) {
				//show the correct border width
				if (dojo.hasAttr(gNode[0], "docs_border_thickness") && (dojo.attr(gNode[0], "docs_border_thickness") == "thin" || dojo.attr(gNode[0], "docs_border_thickness") == "medium" || dojo.attr(gNode[0], "docs_border_thickness") == "thick") ) {
					if (dojo.attr(gNode[0], "docs_border_thickness") == "thin") {
						this.borderWidthSelect.attr( 'value', 'thin');
					} else if (dojo.attr(gNode[0], "docs_border_thickness") == "medium") {
						this.borderWidthSelect.attr( 'value', 'medium');
					} else if (dojo.attr(gNode[0], "docs_border_thickness") == "thick") {
						this.borderWidthSelect.attr( 'value', 'thick');
					}	
				} else {
					this.borderWidthSelect.attr( 'value', 'none');
					this.borderWidthSelect.attr('disabled','disabled');
					this.borderColorSelect.attr('disabled','disabled');	
				}
				
				//show the correct border style
				if (dojo.attr(gNode[0], "stroke") == "none" && dojo.attr(gNode[0], "docs_border_thickness") == "none"){
					this.borderStyleSelect.attr( 'value', "none");
					this.borderWidthSelect.attr('disabled','disabled');
					this.borderColorSelect.attr('disabled','disabled');	
				} else {
					this.borderWidthSelect.attr('disabled','');
					this.borderColorSelect.attr('disabled','');
					if (dojo.hasAttr(gNode[0], 'stroke-dasharray') && dojo.attr(gNode[0], 'stroke-dasharray') != "none" && dojo.attr(gNode[0], 'stroke-dasharray') != "") {
						this.borderStyleSelect.attr( 'value', "dashed");
					} else {
						this.borderStyleSelect.attr( 'value', "solid");
					}
				}
				
				//show the correct border color
				var selectedBorderColor = "transparent";
				var borderColorImage = dojo.query('img.dijitColorPaletteSwatch', dojo.byId('P_d_ShapePropBorderColor_label'))[0];
				if (borderColorImage) {
					dojo.destroy(borderColorImage);
				}
				if (dojo.hasAttr(gNode[0], "stroke") && dojo.attr(gNode[0], "stroke") != "none") {
					selectedBorderColor = dojo.attr(gNode[0], "stroke");
				} else {
					var template = "<img src='${blankGif}' alt='${alt}' border='0' class='dijitColorPaletteSwatch'/>";
					var noneSwatchPath = window.contextPath + window.staticRootPath + '/images/smarttable/None_swatch.gif';
					var html = dojo.string.substitute(template, {
						blankGif: noneSwatchPath,
						alt: 'transparent'								
					});
					dojo.place(html, dojo.byId('P_d_ShapePropBorderColor_label'));
					selectedBorderColor = "transparent";
				}
				dojo.style( dojo.byId('P_d_ShapePropBorderColor_label'),  {
						'backgroundColor': ''+selectedBorderColor+''
				});
				
				//19869 make sure border color value is set corectly when showing the dialog
				this.borderColorSelect.dropDown.value = selectedBorderColor;

				//show the correct fill color
				var selectedFillColor = "transparent";
				var fillColorImage = dojo.query('img.dijitColorPaletteSwatch', dojo.byId('P_d_ShapePropFillColor_label'))[0];
				if (fillColorImage) {
					dojo.destroy(fillColorImage);
				}
				if (dojo.hasAttr(gNode[0], "fill") && dojo.attr(gNode[0], "fill") != "none") {
					selectedFillColor = dojo.attr(gNode[0], "fill");
				} else {
					var template = "<img src='${blankGif}' alt='${alt}' border='0' class='dijitColorPaletteSwatch'/>";
					var noneSwatchPath = window.contextPath + window.staticRootPath + '/images/smarttable/None_swatch.gif';
					var html = dojo.string.substitute(template, {
						blankGif: noneSwatchPath,
						alt: 'transparent'								
					});
					dojo.place(html, dojo.byId('P_d_ShapePropFillColor_label'));
					selectedFillColor = "transparent";
				}
				dojo.style( dojo.byId('P_d_ShapePropFillColor_label'),  {
					'backgroundColor': ''+selectedFillColor+''
				});
				//19869 make sure fill color value is set corectly when showing the dialog
				this.fillColorSelect.dropDown.value = selectedFillColor;
				this.fillColorSelect.attr('disabled','');		

			}
		}
		
		this.altTextInput.setValue(this.altText);
		this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
		this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));
		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
	},
	
	reset:function(){
		this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
		this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));
	},
	
	setDialogID: function() {
		this.dialogId = "P_d_ShapeProp";
		this.altTextID = "P_d_ShapePropAltText";
		this.borderWidthID = "P_d_ShapePropBorderWidth";
		this.borderWidthLabelID = "P_d_ShapePropBorderWidthLabel";
		this.borderStyleID = "P_d_ShapePropBorderStyle";
		this.borderStyleLabelID = "P_d_ShapePropBorderStyleLabel";
		this.fillColorID = "P_d_ShapePropFillColor";
		this.borderColorID = "P_d_ShapePropBorderColor";
		this.inputWidthID = "P_d_ShapePropWidth";
		this.inputHeightID = "P_d_ShapePropHeight";
		this.widthErrorIconId = "P_d_ShapeWidthErrorIcon";
		this.heightErrorIconId = "P_d_ShapeHeightErrorIcon";
		this.altTextIconId = "P_d_ShapeAltTextInfoIcon";
	},	

	onKeyPressed: function(e){
		if (e.keyCode == dojo.keys.ENTER) {
			if(this.getOkBtn()){
				//move focus out input, or get its value should be old value
				this.getOkBtn().focus();
				if(this.onOk())
					this.hide();
			}			
		}
	},
	onOk: function (){		
		if(this.heightValid && this.widthValid && this.borderValid){
			this.setShapeInfo(this.currentWidth, this.currentHeight, this.altText);
			return true;
		}else
			return false;
	},
	formatLocalizedValue : function(value)
	{
		if(isNaN(value))
			return 'NaN';
		var numberLocale = PresTools.toLocalizedValue(value+'px');
		return PresTools.formatNumber(numberLocale) + ' ' + this.unit;
	},
	
	checkBorderStyle : function()
	{
		if (this.borderStyleSelect.value == "none") {
			this.borderWidthSelect.attr('disabled','disabled');
			this.borderColorSelect.attr('disabled','disabled');
		} else {
			this.borderWidthSelect.attr('disabled','');
			this.borderColorSelect.attr('disabled','');
		}
	},

	widthChanged : function()
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit};
		var w = PresTools.parseValue(this.widthInput.value, allowedUnit, true);
		
		if( isNaN(w) || w <= 0 ){
			this.setWarningMsg(this.nls.inputWarning);
			this.setWarningIcon(this.widthErrorIconId, true);
			this.widthInput.focus();
			this.widthValid = false;
			return false;
		}else{
			this.currentWidth = w;
			this.widthValid = true;
			this.setWarningIcon(this.widthErrorIconId, false);
			if(this.heightValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	heightChanged : function()
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit};
		var h = PresTools.parseValue(this.heightInput.value, allowedUnit, true);
		if( isNaN(h) || h <= 0){			
			this.setWarningMsg(this.nls.inputWarning);
			this.setWarningIcon(this.heightErrorIconId, true);
			this.heightInput.focus();
			this.heightValid = false;
			return false;
		}else{
			this.currentHeight = h;
			this.heightValid = true;
			this.setWarningIcon(this.heightErrorIconId, false);
			if(this.widthValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	setShapeInfo : function(width, height, altText)
	{
		var acts=[];
		var shapeContentBox = null;
        for (var i=0; i<this.editor.CONTENT_BOX_ARRAY.length; i++){
            if (this.editor.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.editor.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE || this.editor.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE)){
            	shapeContentBox = this.editor.CONTENT_BOX_ARRAY[i];
            	break;
            }
        }
        
        var newWidth = shapeContentBox.PxToPercent(width)+"%";
		var newHeight = shapeContentBox.PxToPercent(height, 'height')+"%";
		var oldStyle = dojo.attr(shapeContentBox.mainNode, 'style');
		dojo.style(shapeContentBox.mainNode, 'width', newWidth);
		dojo.style(shapeContentBox.mainNode, 'height', newHeight);
		
		var resizeContent = false;
		shapeContentBox.updateHandlePositions(resizeContent);

		// Fix issue with IE resizing the contentBoxDataNode on adjustContentDataSize events.
		if (dojo.isIE) {
			dojo.attr(shapeContentBox.contentBoxDataNode,"style","POSITION: relative; WIDTH: 100%; HEIGHT: 100%; CURSOR: pointer");
			shapeContentBox.adjustContentDataSize();
		}
		
		var newStyle = dojo.attr(shapeContentBox.mainNode, 'style');
		var act1 =SYNCMSG.createAttributeAct(shapeContentBox.mainNode.id,{'style':newStyle}, null, {'style':oldStyle}, null);
		acts.push(act1);
		
		var svgNode = dojo.query("svg", shapeContentBox.mainNode)[0];
		if (svgNode) {
			var oldFillColor = dojo.attr(svgNode.firstChild,"fill");
			var oldDocsBorderThickness = dojo.attr(svgNode.firstChild,"docs_border_thickness");
			var oldStrokeWidth = dojo.attr(svgNode.firstChild,"stroke-width");
			var oldStrokeColor = dojo.attr(svgNode.firstChild,"stroke");
			var oldStrokeDashArray = dojo.attr(svgNode.firstChild,"stroke-dasharray");
			var oldAltText = dojo.attr(svgNode,"alt");
			var oldViewBox = dojo.attr(svgNode,"viewBox");
			var oldPath = dojo.attr(svgNode.firstChild.firstChild,"d");
			
			//set the fill
			if (this.fillColorSelect.dropDown._selectedCell == "0") {
				if (dojo.attr(this.fillColorSelect.dropDown._currentFocus, 'title') == this.nls.noColor) {
					dojo.attr(svgNode.firstChild, 'fill', 'none');
				} else {
					dojo.attr(svgNode.firstChild, 'fill', '#000000');
				}
			} else {
				if (this.fillColorSelect.dropDown.value != null) {
					dojo.attr(svgNode.firstChild, 'fill', this.fillColorSelect.dropDown.value);
				}
			}

			//set the stroke related attributes
			if (this.borderStyleSelect.value == "none") {
				dojo.attr(svgNode.firstChild, 'docs_border_thickness', 'none');
				dojo.attr(svgNode.firstChild,'stroke','none');
				dojo.attr(svgNode.firstChild,'stroke-dasharray','none');
			} else {
				if (this.borderWidthSelect.value == "thin") {
					dojo.attr(svgNode.firstChild, 'docs_border_thickness', 'thin');
				} else if (this.borderWidthSelect.value == "medium") {
					dojo.attr(svgNode.firstChild, 'docs_border_thickness', 'medium');
				} else if (this.borderWidthSelect.value == "thick") {
					dojo.attr(svgNode.firstChild, 'docs_border_thickness', 'thick');
				} else {
					dojo.attr(svgNode.firstChild, 'docs_border_thickness', 'none');
				}
				if (this.borderColorSelect.dropDown._selectedCell == "0") {
					if (dojo.attr(this.borderColorSelect.dropDown._currentFocus, 'title') == this.nls.noColor) {
						dojo.attr(svgNode.firstChild, 'stroke', 'none');
					} else {
						dojo.attr(svgNode.firstChild, 'stroke', '#000000');
					}
				} else {
					if (this.borderColorSelect.dropDown.value != null) {
						dojo.attr(svgNode.firstChild, 'stroke', this.borderColorSelect.dropDown.value);
					}
				}
				if (this.borderStyleSelect.value == "solid" || this.borderStyleSelect.value == "none") {
					dojo.attr(svgNode.firstChild, 'stroke-dasharray', 'none');
				} else {
					dojo.attr(svgNode.firstChild, 'stroke-dasharray', '5 5');
				}
			}
			
			//set the alt text
			dojo.attr(svgNode, 'alt', this.altTextInput.value);
			dijit.setWaiState(svgNode,'label',this.altTextInput.value);
			
			//now set the svg shapeProperties
			var cb = window.pe.scene.slideEditor.getRegisteredContentBoxById(svgNode.parentNode.parentNode.parentNode.id);
			if (cb && cb.G_CONTENT_BOX_ARRAY && cb.G_CONTENT_BOX_ARRAY[0].contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
				cb.G_CONTENT_BOX_ARRAY[0].setSvgShapePropeties(false);
			}
		
			//check for differences and add messages
			var newViewBox = dojo.attr(svgNode, 'viewBox');
			if (oldViewBox != newViewBox) {
			    var actViewBox =SYNCMSG.createAttributeAct(svgNode.id, {'viewBox':newViewBox}, null, {'viewBox':oldViewBox}, null);
			    acts.push(actViewBox);
			}
			var newPath = dojo.attr(svgNode.firstChild.firstChild, 'd');
			if (oldPath != newPath) {
			    var actpath =SYNCMSG.createAttributeAct(svgNode.firstChild.firstChild.id, {'d':newPath}, null, {'d':oldPath}, null);
			    acts.push(actpath);
			}
			var newStrokeWidth = dojo.attr(svgNode.firstChild, 'stroke-width');
			if (oldStrokeWidth != newStrokeWidth) {
			    var actStrokeWidth =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'stroke-width':newStrokeWidth}, null, {'stroke-width':oldStrokeWidth}, null);
			    acts.push(actStrokeWidth);
			}
			var newFillColor = dojo.attr(svgNode.firstChild, 'fill');
			if (oldFillColor != newFillColor) {
				var actFill =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'fill':newFillColor}, null, {'fill':oldFillColor}, null);
				acts.push(actFill);
			}
			var newStrokeColor = dojo.attr(svgNode.firstChild, 'stroke');
			if (oldStrokeColor != newStrokeColor) {
				var actStroke =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'stroke':newStrokeColor}, null, {'stroke':oldStrokeColor}, null);
				acts.push(actStroke);
			}
			var newStrokeDashArray = dojo.attr(svgNode.firstChild, 'stroke-dasharray');
			if (oldStrokeDashArray != newStrokeDashArray) {
				var actStrokeDashArray =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'stroke-dasharray':newStrokeDashArray}, null, {'stroke-dasharray':oldStrokeDashArray}, null);
				acts.push(actStrokeDashArray);
			}
			var newDocsBorderThickness = dojo.attr(svgNode.firstChild,"docs_border_thickness");
			if (oldDocsBorderThickness != newDocsBorderThickness) {
				var actDocsBorderThickness =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'docs_border_thickness':newDocsBorderThickness}, null, {'docs_border_thickness':oldDocsBorderThickness}, null);
				acts.push(actDocsBorderThickness);
			}
			var newAltText = dojo.attr(svgNode, 'alt');
			if (oldAltText != newAltText) {
				var actAltText =SYNCMSG.createAttributeAct(svgNode.id, {'alt':newAltText}, null, {'alt':oldAltText}, null);
				acts.push(actAltText);
				var actAriaLabel =SYNCMSG.createAttributeAct(svgNode.id, {'aria-label':newAltText}, null, {'aria-label':oldAltText}, null);
				acts.push(actAriaLabel);
			}
		}
		
		var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,acts);
		SYNCMSG.sendMessage([msg]);

	}
});
