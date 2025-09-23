/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("writer.ui.widget.TableTemplatePane");
dojo.require("writer.model.TableTempleStyles");
dojo.requireLocalization("writer.ui.widget","TableTemplatePane");
dojo.declare("writer.ui.widget.TableTemplatePane",
	[dijit._Widget, dijit._Templated], {
	containerNode:null,
	tableNode:null,

	templateString: dojo.cache("writer.ui.widget", "templates/TableTemplatePane.html"),
	templateTableStr:"<div class='templateNode' title='${0}' role='option' hidefocus='true'  style='text-decoration:none;' >" +
			"<table cellspacing='0' cellpadding='0' style='border-collapse:collapse; height: 24px; width: 72px;' class='smartTablePreview ${1}'>" +
			"<tbody><tr class='tableHeaderRow'><td height='25%' style=''></td><td height='25%' style=''></td><td height='25%' style=''></td></tr><tr><td height='25%' style=''></td><td height='25%' style=''></td><td height='25%' style=''></td></tr><tr class='alternateRow'><td height='25%' style=''></td><td height='25%' style=''></td><td height='25%' style=''></td></tr><tr class='lastRow'><td height='25%' style=''></td><td height='25%' style=''></td><td height='25%' style=''></td></tr></tbody></table></div>",

	styleIds :[
	             "Plain", "BlueStyle", "RedTint","BlueHeader","DarkGrayHF",
	             "LightGrayRows","DarkGray","BlueTint","RedHeader","GreenHF",
	             "PlainRow","GrayTint","GreenTint","GreenHeader","RedHF",
	             "GreenStyle","PurpleTint","BlackHeader","PurpleHeader","LightBlueHF"
	          ],
	focusIndex:0,
	cells:null,
	
	buildRendering: function(){
		this.inherited(arguments);	
	},	
	
	focus:function(){
		dijit.focus(this.focusNode);
	},
	onChange: function(/*===== value =====*/){
		// summary:
		//		Callback when a cell is selected.
		// value: String
		//		Value corresponding to cell.
	},

	onOpen:function(){
		this.inherited(arguments);
		this.targetTable = null;
		this._initOpen();
	},
	_initOpen:function(){
		if(pe.lotusEditor){
			plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Table");
			if(plugin){
				var selection = pe.lotusEditor.getSelection();
				var res = plugin.getStateBySel(selection);
				if(res.isInTable){
					var ranges = selection.getRanges();				
					var	firstRange = ranges[0];
					var startModel = firstRange.getStartModel().obj;
					var targetTable = plugin.getTable(startModel);
					if(targetTable){
						this.targetTable = targetTable;	
						var styleid = this.targetTable.tableStyleId;
						var curr = 0;
						for(var i = 0; i< this.styleIds.length; i++){
							if(this.styleIds[i] == styleid){
								curr = i;
								break;
							}
						}						
						this._setCurrent(this.cells[curr]);
						this.focusIndex = curr;
						this.focus();
					}
				}
			}
		}
	},
	
	postCreate:function(){
		this.inherited(arguments);
		if(!this.containerNode)return;
		// append rows to table
		var nls = dojo.i18n.getLocalization("writer.ui.widget","TableTemplatePane");
		this.templates = [
		         {tooltip:nls.Plain,tableClass:"st_plain"},
		         {tooltip:nls.BlueStyle,tableClass:"st_blue_style"},
		         {tooltip:nls.RedTint,tableClass:"st_red_tint"},
		         {tooltip:nls.BlueHeader,tableClass:"st_blue_header"},
		         {tooltip:nls.DarkGrayHF,tableClass:"st_dark_gray_header_footer"},
		         {tooltip:nls.LightGrayRows,tableClass:"st_light_gray_rows"},
		         {tooltip:nls.DarkGrayRows,tableClass:"st_dark_gray"},
		         {tooltip:nls.BlueTint,tableClass:"st_blue_tint"},
		         {tooltip:nls.RedHeader,tableClass:"st_red_header"},
		         {tooltip:nls.GreenHF,tableClass:"st_green_header_footer"},
		         {tooltip:nls.PlainRows,tableClass:"st_plain_rows"},
		         {tooltip:nls.GrayTint,tableClass:"st_gray_tint"},
		         {tooltip:nls.GreenTint,tableClass:"st_green_tint"},
		         {tooltip:nls.GreenHeader,tableClass:"st_green_header"},
		         {tooltip:nls.RedHF,tableClass:"st_red_header_footer"},
		         {tooltip:nls.GreenStyle,tableClass:"st_green_style"},
		         {tooltip:nls.PurpleTint,tableClass:"st_purple_tint"},
		         {tooltip:nls.BlackHeader,tableClass:"st_black_header"},
		         {tooltip:nls.PurpleHeader,tableClass:"st_purple_header"},
		         {tooltip:nls.LightBlueHF,tableClass:"st_light_blue_header_footer"}
		      ];
		
		this.len =this.templates.length;
		var count = 5;
		for(var i =0; i < this.len; i=i+count){
			var trNode = dojo.create("tr");
			var max = this.len > i +count ? i+ count : this.len;
			for(j = i; j < max ;j++){
				var tmp = this.templates[j];
				var tdNode = dojo.create("td",{tabindex: 0,id:"templateTD"+j, innerHTML:dojo.string.substitute(this.templateTableStr, [tmp.tooltip, tmp.tableClass])}, trNode);
				dojo.addClass(tdNode, "tablestyle_gallery_box");
			}
			this.tableNode.appendChild(trNode);
		}
		this.cells = dojo.query(".tablestyle_gallery_box",this.containerNode);
		this.cells.onclick(dojo.hitch(this,this.onClick));
		this.cells.onmouseover(dojo.hitch(this,this.onMouseOver));
		this.cells.onmouseout(dojo.hitch(this,this.onMouseOut));
		dojo.query(".tablestyle_gallery_box",this.containerNode)
			.onmouseover(dojo.hitch(this,this.onMouseOver))
			.onmouseout(dojo.hitch(this,this.onMouseOut));
		var keyIncrementMap = {
		UP_ARROW: -5,
		// The down key the index is increase by the x dimension.
		DOWN_ARROW: 5,
		// Right and left move the index by 1.
		RIGHT_ARROW: this.isLeftToRight() ? 1 : -1,
		LEFT_ARROW: this.isLeftToRight() ? -1 : 1
		};
		
		dojo.connect(this.containerNode,"onkeypress",this,function(evt){
			var keys = dojo.keys;
			if(evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE || evt.charCode == keys.TAB || evt.keyCode == keys.TAB)
				return;
				
			var navKey=false;
			for(var key in keyIncrementMap){
				var charOrCode = keys[key];
				if(charOrCode==evt.charCode||charOrCode==evt.keyCode){
					var increment = keyIncrementMap[key];
					this._navigateByKey(increment);
					navKey=true;
					break;
				}
			}
			if(!navKey){
				if(evt.charCode==keys.SPACE || evt.keyCode==keys.SPACE || evt.charCode==keys.ENTER || evt.keyCode==keys.ENTER){
					//press space, enter
					this.createTableWithTemplate(this.styleIds[this.focusIndex]);
				}
			}
			
			dojo.stopEvent(evt);
		});

		this._setCurrent(this.cells[0]);
	},
	_navigateByKey:function(increment){
		if(!increment) return;
		var newIndex = this.focusIndex+increment;
		if(newIndex<0||newIndex>=this.cells.length) return ;

		this._setCurrent(this.cells[newIndex]);
		setTimeout(dojo.hitch(this,"focus"),0);
		this.focusIndex=newIndex;
		pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.templates[newIndex].tooltip);
	},
	createTableWithTemplate: function(styleId){		
		this.onChange();
		if(this.targetTable && !this.targetTable.parent.container.contains(this.targetTable)){
			delete this.targetTable;
			this._initOpen();
		}
		if(this.targetTable){
			WRITER.MSG.beginRecord();	
			try{
				
			var refStyle = pe.lotusEditor.getRefStyle(styleId);
			if(!refStyle){
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
			pe.lotusEditor.execCommand("changeTableStyle",[this.targetTable, styleId]);
			
			}
			catch(e){
			}
			WRITER.MSG.endRecord();
		}
		
	},
	_setCurrent:function(node){
		this.focusNode && this.changeStyle(this.focusNode,true);		
		this.focusNode=node;
		this.changeStyle(this.focusNode, false);
		if(node)
			dojo.attr(node,"tabIndex",this.tabIndex);
	},
	changeStyle : function(node, isRemove) {
		var target = this.getTargetNode(node);
		if(isRemove){
			dojo.removeClass(target, "tablestyle_gallery_box_selected");
		}else{
			dojo.addClass(target, "tablestyle_gallery_box_selected");
		}
	},
	onMouseOver : function(evt) {
		this.changeStyle(evt.target, false);
	},
	onMouseOut : function(evt) {
		this.changeStyle(evt.target, true);
	},
	onClick : function(evt) {	
		var targetNode = this.getTargetNode(evt.target);
		this._setCurrent(targetNode);		
		var index = targetNode.id.substring(10);
		this.createTableWithTemplate(this.styleIds[index]);
		},
	getTargetNode : function(n/* node the mouse over on */) {
		while (n && ("TD" !== n.tagName.toUpperCase() || !dojo.hasClass(n, "tablestyle_gallery_box"))) {
			n = n && n.parentNode;
		}
		return n;
	}
	
});
