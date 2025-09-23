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

dojo.require("dijit.form.DropDownButton");
dojo.require("concord.widgets.TextColorPalette");
dojo.requireLocalization("concord.widgets","tablePropertiesDlg");
dojo.provide("concord.widgets.presTablePropertiesDlg");
dojo.declare("concord.widgets.presTablePropertiesDlg", [concord.widgets.concordDialog], {
	nls:null,
	defaultColor:'#000000',
	borderStyle:[{title:'',width:1,color:'#000000',border:'border-top-style',style:'none'},
				 {title:'',width:1,color:'#000000',border:'border-top-style',style:'solid'},
				 {title:'',width:4,color:'#000000',border:'border-top-style',style:'double'},
				 {title:'',width:1,color:'#000000',border:'border-top-style',style:'dashed'},
				 {title:'',width:2,color:'#000000',border:'border-top-style',style:'dotted'},
				 {title:'',width:4,color:'#C0C0C0',border:'border-top-style',style:'ridge'},
				 {title:'',width:4,color:'#C0C0C0',border:'border-top-style',style:'groove'}//,
				 ],
	borderWidth:[1,2,3,4,5,6,7,8,10,12,14],
	borderTitle:null,
	borderStyleTitle:null,
	borderWidthTitle:null,
	borderColorTitle:null,
	borderWidthUnit:null,
	columnWidthTitle:null,
	rowHeightTitle:null,
	widthHeightTitle:null,
	borderStyleId:'concord_tableStyle',
	borderWidthId:'concord_tableWidth',
	borderColorId:'concord_tableColor',
	columnWidthId:'concord_tableColumnWidth',
	rowHeightId:'concord_tableRowHeight',
	widthLeft:60,
	widthRight:60,
	constructor: function(object, title, oklabel, visible, params) {
		this.editor= object;
	},
	init:function(){
		var c = CKEDITOR.env.ie?'#C0C0C0':'#696969';
		this.borderStyle = [{title:'',width:1,color:'#000000',border:'border-top-style',style:'none'},
		                    {title:'',width:1,color:'#000000',border:'border-top-style',style:'solid'},
		                    {title:'',width:4,color:'#000000',border:'border-top-style',style:'double'},
		                    {title:'',width:1,color:'#000000',border:'border-top-style',style:'dashed'},
		                    {title:'',width:2,color:'#000000',border:'border-top-style',style:'dotted'},
		                    {title:'',width:4,color:c,border:'border-top-style',style:'ridge'},
		                    {title:'',width:4,color:c,border:'border-top-style',style:'groove'}
		                    ];
		this.borderWidth = [1,2,3,4,5,6,7,8,10,12,14];
		this.selectedStyle=-1;
		this.selectedWidth=-1;
		this.selectedColor= this.defaultColor;
		this.initSelectedStyle = this.selectedStyle;
		this.initSelectedWidth = this.selectedWidth;
		this.initSelectedColor = this.selectedColor;
		this._initWH();
	},
	_initWH:function(){
		this.oldColumnWidth = 0;
		this.newColumnWidth=null;
		this.columnWidthInput.value = this.oldColumnWidth+"px";
		this.targetCol = null;
		this.targetTable = null;
		this.oldRowheight = 0;
		this.newRowHeight=null;
		//this.rowHeightInput.value = this.oldRowheight+"px";
		this.targetRow = null;
		if(!this.unit)
		{
			this.unit = CKEDITOR.tools.isMeticUnit() ? this.nls.cmUnit : '"';
		}
	},
	_setNLSStr: function(){
        this.nls = dojo.i18n.getLocalization("concord.widgets", "tablePropertiesDlg");
        if (this.nls) {
        	this.borderTitle = this.nls.borderTitle;
        	this.borderStyleTitle = this.nls.borderStyleTitle;
        	this.borderWidthTitle = this.nls.borderWidthTitle;
        	this.borderColorTitle = this.nls.borderColorTitle;
        	this.borderWidthUnit = this.nls.borderWidthUnit;
        	this.columnWidthTitle = this.nls.columnWidth;
        	this.rowHeightTitle = this.nls.rowHeight;
        	this.widthHeightTitle = this.nls.widthHeight;
        }
    },
    _setTDWidth: function(){
    	var localeWidth = [{locale:'el',widthLeft:'100',widthRight:'70'},
    	                    {locale:'ja',widthLeft:'70',widthRight:'50'},
    	                    {locale:'pt',widthLeft:'90',widthRight:'80'},
    	                    {locale:'it',widthLeft:'80',widthRight:'80'},
    	                    {locale:'pl',widthLeft:'80',widthRight:'90'},
    	                    {locale:'pt-br',widthLeft:'80',widthRight:'80'},
    	                    {locale:'th',widthLeft:'90',widthRight:'80'},
    	                    {locale:'fr',widthLeft:'90',widthRight:'90'}];
		for (var i = 0; i < localeWidth.length; i++)
		{
			if(localeWidth[i].locale == window.g_locale)
			{
				this.widthLeft = localeWidth[i].widthLeft;
				this.widthRight = localeWidth[i].widthRight;
				break;
			}
		}
    },
	setDialogID: function() {
		this.dialogId = "P_d_SmartTableProperties";
		
	},
	createContent: function (contentDiv) {
		this._setNLSStr();
		this._setTDWidth();
		var containerDIV = dojo.create('div', null, contentDiv);
		var borderStyleDIV = dojo.create('div', null, containerDIV);
		dojo.style(borderStyleDIV,{
			"display":"inline-block",
			//"height":"105px"
			"height":"40px"
		});
		//this.createSetBorderArea(borderStyleDIV);
		var seperateDIV = dojo.create('div', null, containerDIV);
		//var marginleft ="20px";
		var marginleft ="2px";
		if(CKEDITOR.env.ie&&CKEDITOR.env.version<9){
			marginleft="50px";
		};
		dojo.attr(seperateDIV,{style:"background: none repeat scroll 0 0 #FFFFFF;display: inline-block;height: 35px;margin-left:"+marginleft+";margin-right:1px;vertical-align: top;width: 1px;"});
		var whDIV = dojo.create('div', null, containerDIV);
		dojo.style(whDIV,{
			"display":"inline-block",
			//"height":"105px"
			"height":"40px"
		});
		this.createSetWHArea(whDIV);
	},
	createSetBorderArea:function(container){
		var tb = dojo.create('table', null, container);
		dijit.setWaiRole(tb, 'presentation');
		var tbody = dojo.create('tbody', null, tb);
		var tr = dojo.create('tr', null, tbody);
		dojo.style(tr,{"height":"30px"});
		var td = dojo.create('td', null, tr);
		dojo.attr(td,{style:'width:'+this.widthLeft+'pt;'});
		var label = dojo.create('label', null, td);
		dojo.attr(label,{'for':this.borderStyleId});
		var lableText = document.createTextNode(this.borderStyleTitle);
		label.appendChild(lableText);
		td = dojo.create('td', null, tr);
		dojo.attr(td,{style:'width:90pt;'});
		var selectStyleDiv = dojo.create('div', null, td);
		dojo.attr(selectStyleDiv,{style:'width:100pt; margin: 5px;'});
		this.createBorderStyleSelector(selectStyleDiv);
		
		tr = dojo.create('tr', null, tbody);
		dojo.style(tr,{"height":"30px"});
		td = dojo.create('td', null, tr);
		label = dojo.create('label', null, td);
		dojo.attr(label,{'for':this.borderWidthId});
		lableText = document.createTextNode(this.borderWidthTitle);
		label.appendChild(lableText);
		td = dojo.create('td', null, tr);
		var selectWidthDiv = dojo.create('div', null, td);
		dojo.attr(selectWidthDiv,{style:'width:100pt; margin: 5px;'});
		this.createBorderWidthSelector(selectWidthDiv);
		
		tr = dojo.create('tr', null, tbody);
		dojo.style(tr,{"height":"30px"});
		td = dojo.create('td', null, tr);
		label = dojo.create('label', null, td);
		dojo.attr(label,{'for':this.borderColorId});
		lableText = document.createTextNode(this.borderColorTitle);
		label.appendChild(lableText);
		td = dojo.create('td', null, tr);
		selectDiv = dojo.create('div', null, td);
		dojo.attr(selectDiv,{style:'width:50pt; margin-left: 5px;'});
		this.creatBorderColorSelector(selectDiv);
	},
	createSetWHArea:function(container){
		tb = dojo.create('table', null, container);
		dijit.setWaiRole(tb, 'presentation');
		tbody = dojo.create('tbody', null, tb);
		tr = dojo.create('tr', null, tbody);
		dojo.style(tr,{
			"height":"30px"
		});
		td = dojo.create('td', null, tr);
		dojo.attr(td,{style:'width:'+this.widthRight+'pt;'});
		label = dojo.create('label', null, td);
		dojo.attr(label,{'for':this.columnWidthId});
		labelText = document.createTextNode(this.columnWidthTitle);
		label.appendChild(labelText);
		td.appendChild(label);
		td = dojo.create('td', null, tr);
		dojo.attr(td,{style:'width:40pt;'});
		this.columnWidthInput = columnWidhtDiv = dojo.create('input', {id:this.columnWidthId}, td);
		dojo.style(columnWidhtDiv,{
			"width":"60px",
			"margin":"5px"
		});
		dojo.connect(columnWidhtDiv,"onchange",dojo.hitch(this,this.columnWidthChange));
		
		// Do not support row height for now
//		tr = dojo.create('tr', null, tbody);
//		dojo.style(tr,{
//			"height":"30px"
//		});
//		td = dojo.create('td', null, tr);
//		label = dojo.create('label', null, td);
//		dojo.attr(label,{'for':this.rowHeightId});
//		labelText = document.createTextNode(this.rowHeightTitle);
//		label.appendChild(labelText);
//		td.appendChild(label);
//		td = dojo.create('td', null, tr);
//		this.rowHeightInput= rowHeightDIV = dojo.create('input', {id:this.rowHeightId}, td);
//		dojo.style(rowHeightDIV,{
//			"width":"60px",
//			"margin":"5px"
//		});
//		dojo.connect(rowHeightDIV,"onchange",dojo.hitch(this,this.rowHeightChange));
	},
	createBorderStyleSelector: function(container){
		var options = new Array();
		options.push({
			label: '<span style="display:inline-block;width:70pt;text-align:center;margin-left:6px;color:'+this.defaultColor+';">'+this.nls.borderStyleNone+'</span>',
			value: 1,
			selected: true
		});
		this.selectedStyle=-1;
		for (var i = 1; i < this.borderStyle.length; i++)
		{
			var innerHTML = '<table cellspacing="0" style="height:15px;"><tbody><tr><td style="vertical-align:middle">'
							+'<div style="'
							+this.borderStyle[i].border+':'+this.borderStyle[i].style
							+';border-color:'+this.selectedColor
							+';border-width:'+this.borderStyle[i].width+'pt'
							+';width:63pt'
							+';margin-left:6px'
							+';"> </div></td></tr></tbody></table>';
			options.push({
				label: innerHTML,
				value: i+1
			});
			
		}
		
		var actBorderStyleSelect = new dijit.form.Select({
            name: 'boder style selector',
            id: this.borderStyleId,
            options: options,
            style: {'width': '100pt'}
	    });
	    dojo.connect(actBorderStyleSelect.dropDown,"onItemClick",this,"onStyleSelected");
		dojo.connect(actBorderStyleSelect.dropDown,"onOpen",this,"onStyleClick");
		this.actBorderStyleSelect = actBorderStyleSelect;

        container.appendChild(actBorderStyleSelect.domNode);
	},
	createBorderWidthSelector:function(container){
		var options = new Array();
		this.selectedWidth=0;
		var selectedborder=this.borderStyle[0];
		if (this.selectedStyle!=-1){
			var selectedborder= this.borderStyle[this.selectedStyle];
		}
		for (var i = 0; i < this.borderStyle.length; i++)
		{
			var innerHTML = '<span style="'
							+selectedborder.border+':'+selectedborder.style
							+';border-color:'+this.selectedColor
							+';border-width:'+this.borderWidth[i] + 'pt'
							+';display:inline-block'
							+';width:'+(45-(this.borderWidth[i]+this.borderWidthUnit).length*4)+'pt'
							+';vertical-align:middle'
							+';margin-left:6px'
							+';height:2pt'
							+';"> </span>'
							+'<span style="margin-left:6px;color:'+this.defaultColor+';">'
							+CKEDITOR.tools.formatNumber(this.borderWidth[i])+this.borderWidthUnit+'</span>';
			options.push({
				label: innerHTML,
				value: i+1
			});
			
		}
		
		var actBorderWidthSelect = new dijit.form.Select({
            name: 'boder width selector',
            id: this.borderWidthId,
            options: options,
            style: {'width': '100pt'}
	    });
	    dojo.connect(actBorderWidthSelect.dropDown,"onItemClick",this,"onWidthSelected");
	    dojo.connect(actBorderWidthSelect.dropDown,"onOpen",this,"onWidthClick");
		this.actBorderWidthSelect = actBorderWidthSelect;
        container.appendChild(actBorderWidthSelect.domNode);
	},
	creatBorderColorSelector:function(container){
		var colorPalette = new concord.widgets.TextColorPalette({
			showLabel: false,
			onChange : dojo.hitch(this,this.onColorSeleced)
		});
		dojo.addClass( colorPalette.domNode, 'tablePropertiesDlgColorPallette');
		var button = new dijit.form.DropDownButton({
			id: this.borderColorId,
            label: '<span style="width:10pt;height:10pt;background-color:#FD23AC;display:inline-block;vertical-align:middle"></span>',
            dropDown: colorPalette
        });
        dojo.connect(colorPalette,"focus", function(){
        	colorPalette._cells[0].node.focus();
        	dojo.query('.dijitPaletteCellSelected', colorPalette.domNode).forEach(function(node, index, array){
     	   		node.focus();
			});
		});
		container.appendChild(button.domNode);
		this.actBorderColorSelect= button;

	},
	columnWidthChange:function(input){
		var value = input.target.value;
		var w = this.parseValue(value);
		if( isNaN(w) || w < 0 ||w==this.oldColumnWidth)
		{
			input.target.value= this.formatLocalizedValue( this.oldColumnWidth+"cm");
			return;
		}
		if(w!=this.oldColumnWidth){
			this.newColumnWidth =w;
			input.target.value = this.formatLocalizedValue(w+"cm") ;
		}
		
	},
	rowHeightChange:function(input){
		var value = input.target.value;
		var w = this.parseValue(value);
		if( isNaN(w) || w < 0 ||w==this.oldRowheight){
			input.target.value= this.formatLocalizedValue( this.oldRowheight+"cm");
			return;
		}else{
			this.newRowHeight =w;
			input.target.value = this.formatLocalizedValue(w+"cm") ;
		}
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
	onStyleClick:function(e){
		if(this.selectedStyle < 0)
			this.actBorderStyleSelect._setDisplay("");
		else
			this.actBorderStyleSelect._setDisplay(this.actBorderStyleSelect.options[this.selectedStyle].label);
		this.modifyDefaultSelector(this.actBorderStyleSelect.dropDown);
	},
	onWidthClick:function(e){
		this.actBorderWidthSelect._setDisplay(this.actBorderWidthSelect.options[this.selectedWidth].label);
		this.modifyDefaultSelector(this.actBorderWidthSelect.dropDown);	
	},
	onStyleSelected:function(item, evt){
		this.selectedStyle=item.option.value-1;
		if(item.option.value == 1)
		{
			this.actBorderWidthSelect._setDisabledAttr(true);
			this.actBorderColorSelect._setDisabledAttr(true);
			this.actBorderWidthSelect._setDisplay("");
			return;
		}
		else{
			this.actBorderWidthSelect._setDisabledAttr(false);
			this.actBorderColorSelect._setDisabledAttr(false);
		}
		this.resetBorderColor();
		this.resetBorderWidth();
	},
	onWidthSelected:function(item, evt){
		this.selectedWidth=item.option.value-1;
		this.resetBorderColor();
		this.resetBorderStyle();
	},
	onColorSeleced:function(color){
		var label ='<span style="width:10pt;height:10pt;background-color:'+color+';display:inline-block;vertical-align:middle"></span>';
		this.actBorderColorSelect.setLabel(label);
		this.selectedColor=color;
		this.resetBorderStyle();
		this.resetBorderWidth();
	},
	resetBorderWidth:function(selectedWidth){
		if( this.selectedStyle<0)
			return;
		var options = this.actBorderWidthSelect.options;
		for (var i =0;i<options.length;i++){
			var innerHTML = '<span style="'
							+this.borderStyle[this.selectedStyle].border+':'+this.borderStyle[this.selectedStyle].style
							+';border-color:'+this.selectedColor
							+';border-width:'+this.borderWidth[i]+'pt'
							+';display:inline-block'
							+';width:'+(61-(this.borderWidth[i]+this.borderWidthUnit).length*4)+'pt'
							+';vertical-align:middle'
							+';margin-left:6px'
							+';height:2pt'
							+';"> </span>'
							+'<span style="margin-left:6px;color:'+this.defaultColor+';">'
							+CKEDITOR.tools.formatNumber(this.borderWidth[i])+this.borderWidthUnit+'</span>';
			options[i].label= innerHTML;
		}
		
		this.actBorderWidthSelect._loadChildren(true);
		if(selectedWidth==null){
			var width = this.borderStyle[this.selectedStyle].width;
			var widthIndex= this.isDefinedBorderWidth(width);
			this.selectedWidth= widthIndex;
			this.actBorderWidthSelect._setDisplay(options[widthIndex].label);
		}else{
			this.actBorderWidthSelect._setDisplay(options[selectedWidth].label);
		}
	},
	resetBorderStyle:function(){
		if( this.selectedStyle<0||this.selectedWidth<0)
			return;
		var options = this.actBorderStyleSelect.options;
		this.borderStyle[this.selectedStyle].color = this.selectedColor;
		if( this.selectedStyle == 0 )
			options[0].label = '<span style="display:inline-block;width:70pt;text-align:center;margin-left:6px;color:'+this.defaultColor+';">'+this.nls.borderStyleNone+'</span>';
		else{
			var innerHTML = '<table cellspacing="0" style="height:15px;"><tbody><tr><td style="vertical-align:middle">'
						+'<div style="'
						+this.borderStyle[this.selectedStyle].border+':'+this.borderStyle[this.selectedStyle].style
						+';border-color:'+this.borderStyle[this.selectedStyle].color
						+';border-width:'+this.borderWidth[this.selectedWidth]+'pt'
						+';width:70pt'
						+';margin-left:6px'
						+';"> </div></td></tr></tbody></table>';
			options[this.selectedStyle].label = innerHTML;
		}
		this.borderStyle[this.selectedStyle].width = this.borderWidth[this.selectedWidth];
		this.actBorderStyleSelect._loadChildren(true);
		this.actBorderStyleSelect._setDisplay(options[this.selectedStyle].label);
	},
	resetBorderColor:function(color){
		if(this.selectedStyle!=-1){
			this.selectedColor = color||this.borderStyle[this.selectedStyle].color;
		}else{
			this.selectedColor = color||this.defaultColor;
		}
		var label ='<span style="width:10pt;height:10pt;background-color:'+this.selectedColor+';display:inline-block;vertical-align:middle"></span>';
		this.actBorderColorSelect.setLabel(label);
		this.resetColorPallete(this.selectedColor);
	},
	resetColorPallete:function(color){
		var colorPallette = this.actBorderColorSelect.dropDown;
		dojo.query('.dijitPaletteCell', this.actBorderColorSelect.dropDown.domNode).forEach(function(node, index, array){
			var nodeColor = concord.text.tools.colorHex(node.firstChild.firstChild.style.backgroundColor);
			if( nodeColor == concord.text.tools.colorHex(color) )
			{
				colorPallette._setCurrent(node);
				setTimeout(function(){
					dijit.focus(node);
					colorPallette._setValueAttr(nodeColor, false);
				});
			}
		});
	},
	reBuildSelector:function(){
		var options = this.actBorderStyleSelect.options;
		options[0].label = '<span style="display:inline-block;width:70pt;text-align:center;margin-left:6px;color:'+this.defaultColor+';">'+this.nls.borderStyleNone+'</span>';
		for (var i = 1; i < this.borderStyle.length; i++)
		{
			var innerHTML = '<table cellspacing="0" style="height:15px;"><tbody><tr><td style="vertical-align:middle">'
							+'<div style="'
							+this.borderStyle[i].border+':'+this.borderStyle[i].style
							+';border-color:'+this.borderStyle[i].color
							+';border-width:'+this.borderStyle[i].width+'pt'
							+';width:70pt'
							+';margin-left:6px'
							+';"> </div></td></tr></tbody></table>';
			options[i].label = innerHTML;
		}
		this.actBorderStyleSelect._loadChildren(true);
		options = this.actBorderWidthSelect.options;
		var selectedborder=this.borderStyle[0];
		for (var i = 0; i < this.borderStyle.length; i++)
		{
			var innerHTML = '<span style="'
							+selectedborder.border+':'+selectedborder.style
							+';border-color:'+this.selectedColor
							+';border-width:'+this.borderWidth[i]+'pt'
							+';display:inline-block'
							+';width:'+(88-(this.borderWidth[i]+this.borderWidthUnit).length*4)+'pt'
							+';vertical-align:middle'
							+';margin-left:6px'
							+';height:2pt'
							+';"> </span>'
							+'<span style="margin-left:6px;color:'+this.defaultColor+';">'
							+this.borderWidth[i]+this.borderWidthUnit+'</span>';
			options[i].label = innerHTML;
		}
		this.actBorderWidthSelect._loadChildren(true);
		this.actBorderStyleSelect.reset();
		this.actBorderWidthSelect.reset();
	},
	onOk: function (editor){
//		if (CKEDITOR.env.ie && !editor.getSelection()){
//			editor.focus();
//		}
//		var sel = editor.getSelection();
//		var range = sel.getRanges()[0];
//		var startContainer= range.startContainer;
//		var table = startContainer.getAscendant('table',true);
//		if(table==null){
//			return ;
//		}
		var actList=[];
		//this.setBorder(table,actList);
		if(!this.newColumnWidth&&!this.newRowHeight){
			if(actList.length==0){
				return ;
			}
			var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Table,actList,null,editor.id);
			SYNCMSG.sendMessage([msg]);
		}else{
			this.setWidthHeight(editor, actList);
		}
		
	},
	setBorder:function(table,actList){
		if( this.initSelectedStyle == this.selectedStyle
				&& this.initSelectedWidth == this.selectedWidth
				&& this.initSelectedColor == this.selectedColor)
				return;
			if ( this.selectedStyle==-1 ){
				return
			}
			var tbody = table.getFirst();
			while(tbody && !tbody.is('tbody')){
				tbody = tbody.getNext();
			}
			if( tbody==null|| !tbody.is('tbody')){
				return 
			}
			var borderStyle =this.borderStyle[this.selectedStyle].style;
			var borderWidth;
			if(this.selectedStyle == 0)
				borderWidth= this.borderWidth[0];
			else
				borderWidth= this.borderWidth[this.selectedWidth];
			var borderColor= this.selectedColor;
			var tmp_styles = {};
		 	var tmp_attributes = {}; 
		 	var tmp_oldstyles = {};
		 	var tmp_oldatts = {};
		 	var oldStyle = table.getAttribute("style");
		 	if(oldStyle==null){
		 		oldStyle ="";
		 	}
		 	var style = this.clearTableBorder(table);
			if(style==""){
				style = "border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor+";";
			}else{
				style = style+";border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor;
			}
			if( style!= oldStyle){
				tmp_oldatts.style=oldStyle;
				tmp_attributes.style= style;
				table.setAttribute('style',style);
				var act =SYNCMSG.createAttributeAct( table.getId(),tmp_attributes,tmp_styles,tmp_oldatts, tmp_oldstyles );
				actList.push(act);
			}
			var rows = tbody.getChildren();
			for ( var rindex =0;rindex< rows.count();rindex++){
				var row = rows.getItem(rindex);
				var cols = row.getChildren();
				for(var cindex=0;cindex<cols.count();cindex++){
					var col = cols.getItem(cindex);
					if(!col.getId()){
						continue;
					}
					var tmp_styles = {};
				 	var tmp_attributes = {}; 
				 	var tmp_oldstyles = {};
				 	var tmp_oldatts = {};
				 	var oldStyle = col.getAttribute("style");
				 	if(oldStyle==null){
				 		oldStyle ="";
				 	}
				 	var style = this.clearTableBorder(col);
					if(style==""){
						style = "border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor+";";
					}else{
						style = style+";border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor;
					}
					if( style!= oldStyle){
						tmp_oldatts.style=oldStyle;
						tmp_attributes.style= style;
						col.setAttribute('style',style);
						var act =SYNCMSG.createAttributeAct( col.getId(),tmp_attributes,tmp_styles,tmp_oldatts, tmp_oldstyles );
						actList.push(act);
					}				
				}
			}
			return actList;
	},
	setWidthHeight:function(editor,actList){
		var changeSet=[];
		var table = this.editor.mainNode;
		// Change the width of the table by the same percent as the column being changed.  Similar behavior as document.
		if(this.newColumnWidth&& this.targetCol ){
			// First update the column information
			var newWidthValue = CKEDITOR.tools.CmToPx(this.newColumnWidth);
			var oldWidthValue = CKEDITOR.tools.CmToPx(this.oldColumnWidth);
			var changedWidth = newWidthValue - oldWidthValue;
			
			// Need to update the first cell in the column even if selected another cell lower in the column.  Save all the 
			// original width values of into an array as we need to update each once the size of one column changes
			var firstRow = this.targetCol.getAscendant('tbody').getFirst().$;
			var firstRowSizeArray = [];
	        for (var i=0; i< firstRow.cells.length; i++){
	        	var obj = {};
	        	obj.width = dojo.style(firstRow.cells[i], 'width');
	        	obj.oldWidth = firstRow.cells[i].style.width;
	        	firstRowSizeArray.push(obj);
	        }
	        
	        firstRowSizeArray[this.targetCol.$.cellIndex].width = firstRowSizeArray[this.targetCol.$.cellIndex].width + changedWidth;		

			// Update the table width
			var tableWidth = dojo.style(table, 'width');
			var oldTableWidth = editor.PxToPercent(tableWidth)+"%";
			var newTableWidthInPx = tableWidth+changedWidth;
			var newTableWidth = editor.PxToPercent(tableWidth+changedWidth)+"%";
			dojo.style(table, 'width', newTableWidth);
			// Table change attribute message
			var tableChange =  {"e":table,"oldTableWidth":oldTableWidth,"newTableWidth":newTableWidth,"type":"table"};
			changeSet.push(tableChange);

			// Update the table size
			this.editor._update();
			
			// Update each of the columns with the updated sizes converted to percent
	        for (var i=0; i< firstRowSizeArray.length; i++){
	        	var currentObj = firstRow.cells[i];
	        	var obj = firstRowSizeArray[i];
	        	var value = editor.PxToPercent(obj.width)+"%"; 
	        	
	        	//18132 - For imported tables, needs to calculate the new column percents corresponding 
	        	// to the new table width.  The variable oldWidth should be in "%"
	        	if (!dojo.hasClass(currentObj.parentNode.parentNode.parentNode, "ibmdocsTable")) {
		        	value = obj.oldWidth;
		        	if(i == this.targetCol.$.cellIndex){
		        		value = obj.width/newTableWidthInPx*100 + "%";
		        	}else{
		        		var oldPercentWidth = parseFloat(obj.oldWidth);  //need to get rid of the "%" symbol
			        	var newPercentWidth = ((oldPercentWidth/100) * tableWidth)/newTableWidthInPx*100;
			        	value = newPercentWidth + "%";
		        	}
	        	}
	        	
				dojo.style(currentObj, 'width', value);
				var change = {"e":currentObj,"oldWidth":obj.oldWidth,"newWidth":value,"type":"td"};
				changeSet.push(change);
	        }			
		}
		if(this.newRowHeight&&this.targetRow){
			var newHeight = this.newRowHeight+"cm";
			var oldHeight = this.oldRowheight+"cm";
			this.targetRow.setStyle("height",newHeight);
			var change = {"e":this.targetRow,"oldHeight":oldHeight,"newHeight":newHeight,"type":"tr"};
			changeSet.push(change);
		}
		setTimeout(function(){
			var acts=[];
			for(var i=0;i< changeSet.length;i++){
				var change = changeSet[i];
				var type = change.type;
				if(type =="td"){
					//var realWidth =CKEDITOR.tools.PxToCm( CKEDITOR.tools.getWidth2(change.e))+"cm";
					var act =SYNCMSG.createAttributeAct(change.e.id,{},{'width':change.newWidth},{}, {'width':change.oldWidth} ,true);
					acts.push(act);
				}else if(type=="tr"){
					//var realHeight =CKEDITOR.tools.getHeight2(change.e);
					var realHeight =editor.PxToPercent(CKEDITOR.tools.getHeight2(change.e), "height");
					var act =SYNCMSG.createAttributeAct(change.e.getId(),{},{'height':realHeight},{}, {'height':change.oldHeight},true );
					acts.push(act);
				}else if(type=="table"){
					var act =SYNCMSG.createAttributeAct(change.e.id,{},{'width':change.newTableWidth},{}, {'width':change.oldTableWidth},true );
					acts.push(act);
				}
			}
			for(var i=0;i< acts.length;i++){
				actList.push(acts[i]);
			}
			actList= actList.concat(acts);
			var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Table,actList,null,editor.getContentRootNode().parentNode.id);
			SYNCMSG.sendMessage([msg]);
		},0);
	},
	onCancel: function(editor){
	
	},
	_onShowWH:function(startContainer){
		var column = startContainer.getAscendant('td',true);
 		var table = startContainer.getAscendant('table',true);

		if(column){
			var columnWidth = column.$.offsetWidth;
			columnWidth = this.formatLocalizedValue(columnWidth+"px");
			this.oldColumnWidth = this.parseValue(columnWidth);
			this.columnWidthInput.value = columnWidth;
			this.targetCol = column;
			this.targetTable = table;
		}
		var row = startContainer.getAscendant('tr',true);
		if(row){
			var rowHeight = row.$.offsetHeight;
			rowHeight =  this.formatLocalizedValue(rowHeight+"px");
			this.oldRowheight = this.parseValue(rowHeight);
			//this.rowHeightInput.value = rowHeight;
			this.targetRow = row;
		}
	},
	onShow:function(){
		
		this.init();
		var currentEditor = this.editor.getEditor();
		var selectedCells = currentEditor.getSelectedTableCells(currentEditor);
		var startContainer = selectedCells[0];
		this._onShowWH(startContainer);
		var table = startContainer.getAscendant('table',true);
		if(table==null){
			return ;
		}
		var tableBorderStyle = table.getStyle('border-style');
		var tableBorderWidth = table.getStyle("border-width");
		var tableBorderColor = table.getStyle("border-color");
		// Some concord table style have same border style for all td.
		var classList = ['st_plain','st_green_style','st_blue_style','st_dark_gray','st_gray_tint',
		                 'st_purple_tint','st_red_tint','st_blue_tint','st_green_tint'];
		if(tableBorderStyle == "" && this.hasClass(table,classList)){
			var tbody = table.getLast();
			if( tbody && tbody.is && tbody.is('tbody')){
				cell = tbody.getChildren().getItem(0).getChildren().getItem(0);
				if( cell && cell.is && (cell.is('td','th') ) ){
					tableBorderStyle = cell.getComputedStyle('border-bottom-style');
					tableBorderWidth = cell.getComputedStyle('border-bottom-width');
					tableBorderColor = cell.getComputedStyle('border-bottom-color');
				}
			}
		}
		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
		
//		tableBorderWidth = CKEDITOR.tools.toPtValue(tableBorderWidth);
//		this.selectedStyle= this.isDefinedBorderStyle(tableBorderStyle);
//		this.selectedWidth= this.selectedStyle == 0?0:this.isDefinedBorderWidth(tableBorderWidth);
//		if( this.selectedWidth==-1 ){
//			this.selectedWidth = this.addBorderWidth(tableBorderWidth);
//		}
//		this.reBuildSelector();
//		this.resetBorderColor(tableBorderColor);
//		this.resetBorderStyle();
//		this.resetBorderWidth(this.selectedWidth);
//		this.initSelectedStyle = this.selectedStyle;
//		this.initSelectedWidth = this.selectedWidth;
//		this.initSelectedColor = this.selectedColor;
//		if( this.selectedStyle<1 )
//		{
//			this.actBorderWidthSelect._setDisabledAttr(true);
//			this.actBorderColorSelect._setDisabledAttr(true);
//			if( this.selectedStyle < 0 )
//				this.actBorderStyleSelect._setDisplay("");
//			this.actBorderWidthSelect._setDisplay("");
//		}else{
//			this.actBorderWidthSelect._setDisabledAttr(false);
//			this.actBorderColorSelect._setDisabledAttr(false);
//		}
	},
	hasClass:function(element, classList)
	{
		if( element && element.hasClass )
		{
			for (var i = 0; i < classList.length; i++){
				if( element.hasClass(classList[i]) )
					return true;
			}
		}
		return false;
	},
	isDefinedBorderStyle:function(style){
		for (var i = 0; i < this.borderStyle.length; i++){
			if( this.borderStyle[i].style== style ){
				return i;
			}
		}
		return -1;
	},
	isDefinedBorderWidth:function(width){
		for (var i =0;i< this.borderWidth.length;i++ ){
			if( this.borderWidth[i]==width ){
				return i;
			}
		}
		return -1;
	},
	addBorderWidth:function(width){
		var temp = null;
		for (var i = 0; i < this.borderStyle.length; i++){
			if(width<this.borderWidth[i]){
				for (var j = this.borderWidth.length-1; j > i; j--){
					this.borderWidth[j] = this.borderWidth[j-1];
				}
				this.borderWidth[i] = width;
				return i;
			}
		}
		this.borderWidth[this.borderWidth.length-1] = width;
		return this.borderWidth.length-1;
	},
	clearTableBorder:function(element){
		var styleStr = element.getAttribute("style");
		if(styleStr==null||styleStr==""){
			return "";
		}
		var styles =styleStr.split(/\s*;\s*/);
		var preservedStyle=[];
		for(var i =0;i< styles.length;i++){
			var style = styles[i];
			var match = style.match("border");
			if(style==""){
				continue;
			}
			if(match==null||match ==""||match==undefined){
				preservedStyle.push(style);
			}
			match = style.match("border-collapse");
			if(match!=null && match!="" && match!=undefined){
				preservedStyle.push("border-collapse: collapse");
			}
			match = style.match("border-spacing");
			if(match!=null && match!="" && match!=undefined){
				preservedStyle.push(style);
			}
		}
		var newStyleStr= preservedStyle.join(";");
		return newStyleStr;
	},
	parseValue : function( string)
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':'"', 'pct':'%' };
		var unitIndex = string.length+1;
		var unit = CKEDITOR.tools.isMeticUnit() ? 'cm' : 'in';
		string = CKEDITOR.tools.trim(string);
		for(var i in allowedUnit)
		{
			var regExp = eval("/"+allowedUnit[i]+"$/i");
			var result = regExp.exec(string);
			if(result)
			{
				unitIndex = result.index;
				unit = i;
				break;
			}
		}
		string = CKEDITOR.tools.trim(string.substring(0,unitIndex));
		numberLocale = CKEDITOR.tools.parseNumber(string);
		if(!isNaN(numberLocale))
			return CKEDITOR.tools.toCmValue(numberLocale+unit);
		else
			return NaN;
	},
	resizeTable : function(changeSet){
		var acts=[];
		for(var i=0;i< changeSet.length;i++){
			var change = changeSet[i];
			var type = change.type;
			if(type =="td"){
				var realWidth =CKEDITOR.tools.PxToCm( getWidth2(change.e))+"cm";
				var act =SYNCMSG.createAttributeAct(change.e.getId(),{},{'width':realWidth},{}, {'width':change.oldWidth} ,true);
				acts.push(act);
			}else if(type=="tr"){
				var realHeight =CKEDITOR.tools.PxToCm( getHeight2(change.e))+"cm";
				var act =SYNCMSG.createAttributeAct(change.e.getId(),{},{'height':realHeight},{}, {'height':change.oldHeight},true );
				acts.push(act);
			}
		}
		return acts;
	},
	//
	// This function returns the equivalent % given a px number
	//
	PxToPercent: function(px,heightOrWidth){
		var pxValue = parseFloat(px);
		var value = (heightOrWidth=='height')? this.editor.mainNode.offsetHeight : this.editor.mainNode.offsetWidth;

		var result =  (pxValue * 100)/value;
		return result;
	},

	formatLocalizedValue : function(value)
	{
		//return CKEDITOR.tools.formatNumber(editor.PxToPercent(value, "width"))+'%';
		var numberLocale = CKEDITOR.tools.toLocalizedValue(value);
		return CKEDITOR.tools.formatNumber(numberLocale) + ' ' + this.unit;
	}
});