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

dojo.provide("writer.plugins.MobileInit");
dojo.require("writer.model.TableTempleStyles");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.util.mobileUtil");
dojo.declare( "writer.plugins.MobileInit", [writer.plugins.Plugin], {
	headingMap : {},
	tableMap : {"st_plain" : "Plain",
		"st_blue_style" : "BlueStyle",
		"st_red_tint" : "RedTint",
		"st_blue_header" : "BlueHeader",
		"st_dark_gray_header_footer" : "DarkGrayHF",
		"st_light_gray_rows" :  "LightGrayRows",
		"st_dark_gray" : "DarkGray",
		"st_blue_tint" : "BlueTint",
		"st_red_header" :"RedHeader",
		"st_green_header_footer" : "GreenHF",
		"st_plain_rows" : "PlainRow",
		"st_gray_tint" : "GrayTint",
		"st_green_tint" : "GreenTint",
		"st_green_header" : "GreenHeader",
		"st_red_header_footer" : "RedHF",
		"st_green_style" : "GreenStyle",
		"st_purple_tint" : "PurpleTint",
		"st_black_header" : "BlackHeader",
		"st_purple_header" : "PurpleHeader",
		"st_light_blue_header_footer" : "LightBlueHF"
		},
	init: function() {
		dojo.subscribe(writer.EVENT.LOAD_READY, function(){
			var events = [{"name":"stopActivityIndicator", "params":[]}];
			events.push({"name":"initToolbar", "params":["layoutEngine"]});
			concord.util.mobileUtil.jsObjCBridge.postEvents( events );
			toolbarNode = dojo.byId('lotus_editor_toolbar');
			toolbarNode.style.display = 'none';
		});
		
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, function(){
			var selectionPos = concord.util.mobileUtil.layoutDoc.getSelectionPos();
			var events = [{"name":"selectionChange", "params":selectionPos}];
			concord.util.mobileUtil.jsObjCBridge.postEvents( events );
			
			// for table control
			var tpCommand = pe.lotusEditor.getCommand('setTableProperties');
			if(tpCommand && tpCommand.state == writer.TRISTATE_OFF )
			{
				var ranges =  pe.lotusEditor.getSelection().getRanges();
				var range = ranges[0];
				var start = range.getStartView();
				var cellView = writer.util.ViewTools.getCell(start.obj);
				concord.util.mobileUtil.tableResize.onSelectionChange(cellView);
			}
			else
			{
				concord.util.mobileUtil.tableResize.onSelectionChange();
			}
		});
		
		var fontNameButton = dijit.byId("D_t_FontName");
		var fontSizeButton =  dijit.byId("D_t_FontSize");
		var headingButton =  dijit.byId("D_t_FontHeading");
		dojo.connect(fontNameButton, 'setLabel', function() {
			// some fonts can show on browsers but not on iOS, thus we need fall back these fonts
			var fontName = this.label.replace(/^[\"|\']\s*/g,"").replace(/\s*[\"|\']$/g,"");
			var fallbackFont = concord.util.mobileUtil.fontFallback[fontName];
			var events = [];
			var params = [!!fallbackFont?fallbackFont:fontName];
			events.push({"name":"customFont", "params":params});
			concord.util.mobileUtil.jsObjCBridge.postEvents(events);
		});
		dojo.connect(fontSizeButton, 'setLabel', function() {
			var value = -1;
			// multiply 100 for float font size.
			var parsedValue = parseFloat(this.label);
			if(!isNaN(parsedValue))
				value = parseInt(Math.round(parsedValue*100));
			pe.lotusEditor.getCommand('fontSize').setState(value);
		});
		dojo.connect(headingButton, 'setLabel', dojo.hitch(this, function(button) {
			var index = (this.headingMap[button.label]==null)?-1:this.headingMap[button.label];
			pe.lotusEditor.getCommand('heading').setState(index);
		}, headingButton));
		
		this.mockCommand("addST", "createTable");
		
		this.editor.addCommand( "fontSize", {
			exec: function(data){
				pe.lotusEditor.getCommand("fontsize").exec(data.fontSize);
			}
		});
		
		this.editor.addCommand( "decreasefont", {
			exec: function(data){
				var fontPlugin = pe.lotusEditor.getPlugin("Font");
				var fontSizeButton =  dijit.byId("D_t_FontSize");
				var curSize = fontSizeButton.label;
				if (curSize > 0) {
					var curIndex = -1;
					for(var i = 0; i < fontPlugin.sizes.length; i++ ) {
						if (Math.abs(fontPlugin.sizes[i] - curSize) < 0.01) {
							curIndex = i;
							break;
						} else if ((fontPlugin.sizes[i] - curSize) > 0) {
							curIndex = i;
							break;
						}
					}
					if (curIndex > -1) {
						var decIndex = curIndex - 1;
						if (decIndex >= 0) {
							var decSize = fontPlugin.sizes[decIndex];
							pe.lotusEditor.getCommand("fontsize").exec(decSize);
						}
					}
				}
			}
		});
		
		this.editor.addCommand( "increasefont", {
			exec: function(data){
				var fontPlugin = pe.lotusEditor.getPlugin("Font");
				var fontSizeButton = dijit.byId("D_t_FontSize");
				var curSize = fontSizeButton.label;
				if (curSize > 0) {
					var curIndex = -1;
					for(var i = 0; i < fontPlugin.sizes.length; i++ ) {
						if (Math.abs(fontPlugin.sizes[i] - curSize) < 0.01) {
							curIndex = i;
							break;
						} else if ((fontPlugin.sizes[i] - curSize) > 0) {
							curIndex = i-1;
							break;
						}
					}
					if (curIndex >= -1) {
						var incIndex = curIndex + 1;
						if (incIndex < fontPlugin.sizes.length) {
							var incSize = fontPlugin.sizes[incIndex];
							pe.lotusEditor.getCommand("fontsize").exec(incSize);
						}
					}
				}
			}
		});
		
		this.editor.addCommand( "setColor", {
			exec: function(data){
				if (data.type == "fore") {
					pe.lotusEditor.getCommand("ForeColor").exec(data.color);
				} else if (data.type == "back") {
					pe.lotusEditor.getCommand("HighlightColor").exec(data.color);
				}
			}
		});
		
		this.editor.addCommand( "font", {
			exec: function(data){
				var fontPlugin = pe.lotusEditor.getPlugin("Font");
				if(!fontPlugin.fontNameStyles[data.fontFamily])
					fontPlugin.fontNameStyles[data.fontFamily] = new writer.style({'rFonts':{"ascii":data.fontName}});
				pe.lotusEditor.getCommand("fontname").exec(data.fontFamily);
			}
		});
		
		this.editor.addCommand( "heading", {
			exec: function(data){
				var fontPlugin = pe.lotusEditor.getPlugin("Font");
				pe.lotusEditor.getCommand("headingFormat").exec(fontPlugin.fontHeadings[data.index-1]);
			}
		});
		
		this.editor.addCommand( 'list',{
			exec : function( data )
			{
				var type;
				if(data.type == "bulletedlist"){
					type = "bullet";
				}else{
					type = "numbering";
				}
				if(data.style.length == 0) {
					data.style = "none";
				}
				pe.lotusEditor.execCommand(type,{"numbering":data.style, "onOff":false});
			}
		});

		// add numberedList and bulletedList only use to keep list state in native.
		this.editor.addCommand( 'numberedList',{ exec : function( editor, data ){} });
		this.editor.addCommand( 'bulletedList',{ exec : function( editor, data ){} });
		
		this.editor.addCommand( 'insertTable',{
			exec : function( data )
			{
				var tablePlugin = pe.lotusEditor.getPlugin("Table");
				var table = tablePlugin.createTable(4, 4);
				if (table) {
					var mobilePlugin = pe.lotusEditor.getPlugin("MobileInit");
					var styleId = mobilePlugin.tableMap[data.tableStyleClass];
					if (styleId) {
						WRITER.MSG.beginRecord();						
						var refStyle = pe.lotusEditor.getRefStyle(styleId);
						if(!refStyle) {
							/// create table template style
							var styles = new writer.model.TableTempleStyles();
							var templateStyle = styles.templateJson[styleId];
							var msgs = [];
							var msg;
							if(templateStyle.basedOn){
								var baseOnStyle = pe.lotusEditor.getRefStyle(templateStyle.basedOn);
								if(!baseOnStyle){
									msg = pe.lotusEditor.createStyle(templateStyle.basedOn,  styles.templateJson[templateStyle.basedOn]);
									msg && msgs.push(msg);
									msg = null;
								}							
							}														
							
							msg = pe.lotusEditor.createStyle(styleId, templateStyle);
							msg && msgs.push(msg);
							if(msgs.length > 0){
								WRITER.MSG.sendMessage( msgs );
							}					
						}
						tablePlugin.changeStyle(table, styleId);
						WRITER.MSG.endRecord();
					}
				}
			}
		});
		
		this.editor.addCommand('setTableStyle', {
			exec : function( data ) 
			{
				var plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Table");
				var mobilePlugin = pe.lotusEditor.getPlugin("MobileInit");
				var styleId = mobilePlugin.tableMap[data.tableStyleClass];
				if(plugin && styleId){
					var selection = pe.lotusEditor.getSelection();
					var res = plugin.getStateBySel(selection);
					if(res.isInTable){					
						var ranges = selection.getRanges();				
						var	firstRange = ranges[0];
						var startModel = firstRange.getStartModel().obj;
						var targetTable = plugin.getTable(startModel);
						if (targetTable) {
							var refStyle = pe.lotusEditor.getRefStyle(styleId);
							if(!refStyle) {
								/// create table template style
								var styles = new writer.model.TableTempleStyles();
								var templateStyle = styles.templateJson[styleId];
								if(templateStyle.basedOn){
									var baseOnStyle = pe.lotusEditor.getRefStyle(templateStyle.basedOn);
									if(!baseOnStyle){
										pe.lotusEditor.createStyle(templateStyle.basedOn,  styles.templateJson[templateStyle.basedOn]);
									}					
								}
								pe.lotusEditor.createStyle(styleId, templateStyle);
							}
							plugin.changeStyle(targetTable, styleId);
						}
					}
				}
			}
		});
		
		var fontNameMenu = dijit.byId("D_m_FontName");
		var fontHeadingMenu = dijit.byId("D_m_FontHeading");
		var fontSizeMenu = dijit.byId("D_m_FontSize");
		
		var nameList = {};
		nameList.font = [];
		nameList.fontSize = [];
		nameList.heading = [];
		nameList.numberList = [];
		nameList.bulletList = [];
		
		var fontNames = fontNameMenu.getChildren();
		var fontSizes = fontSizeMenu.getChildren();
		var fontHeadings = fontHeadingMenu.getChildren();
		for(var i in fontNames){nameList.font.push(fontNames[i]._data);};
		for(var i in fontSizes){nameList.fontSize.push(fontSizes[i]._data);};
		for(var i in fontHeadings){
			nameList.heading.push(fontHeadings[i].label);
			this.headingMap[fontHeadings[i].label] = parseInt(i)+ 1;
		};
		// list have no translation string yet, so hard code here and may update it later.
		dojo.requireLocalization("concord.widgets", "outlineDlg");
		var outlinenls = dojo.i18n.getLocalization("concord.widgets", "outlineDlg"); 
		nameList.numberList.push({title: "upperLetter", style:"upperLetter", symbol:"A\u002e"});
		nameList.numberList.push({title: "lowerLetter", style:"lowerLetter", symbol:"a\u002e"});
		nameList.numberList.push({title: "lowerLetterParenthesis", style:"lowerLetterParenthesis", symbol:"a\u0029"});
		nameList.numberList.push({title: "decimal", style:"decimal", symbol:"1\u002e"});
		nameList.numberList.push({title: "decimalParenthesis", style:"decimalParenthesis", symbol:"1\u0029"});
		nameList.numberList.push({title: "decimalB", style:"decimalB", symbol:"1b"});
		nameList.numberList.push({title: "upperRoman", style:"upperRoman", symbol:"I\u002e"});
		nameList.numberList.push({title: "lowerRoman", style:"lowerRoman", symbol:"i\u002e"});

		nameList.bulletList.push({title: outlinenls.label_circle, style:"circle", symbol:"\u25CF"});
		nameList.bulletList.push({title: outlinenls.label_diamond, style:"diamond", symbol:"\u2666"});
		nameList.bulletList.push({title: outlinenls.label_square, style:"square", symbol:"\u25A0"});
		nameList.bulletList.push({title: outlinenls.label_plusSign, style:"plus", symbol:"\u271A"});
		nameList.bulletList.push({title: outlinenls.label_fourDiamond, style:"fourDiamond", symbol:"\u2756"});
		nameList.bulletList.push({title: outlinenls.label_rightArrow, style:"rightArrow", symbol:"\u25BA"});
		nameList.bulletList.push({title: outlinenls.label_checkMark, style:"checkMark", symbol:"\u2714"});
		nameList.bulletList.push({title: outlinenls.label_thinArrow, style:"thinArrow", symbol:"\u2794"});
		var events = [];
		events.push({"name":"nameLists", "params":[nameList]});
		concord.util.mobileUtil.jsObjCBridge.postEvents( events );
	},
	
	mockCommand: function(newCmdName, oldCmdName)
	{
		var oldCmd = this.editor.getCommand(oldCmdName);
		if(!oldCmd)
			return;
		this.editor.addCommand( newCmdName, {
			exec: function(data){
			}
		});
		var newCmd = this.editor.getCommand(newCmdName);
		var lisr = new writer.core.Listener();
		lisr.startListening(oldCmd);
		lisr.notify = function(){
			newCmd.setState(oldCmd.state);
		};
	}
});