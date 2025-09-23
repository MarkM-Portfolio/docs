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


dojo.provide("writer.plugins.Styles");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.common.RangeIterator");
dojo.require("writer.core.Event");
dojo.require("writer.util.HelperTools");
dojo.requireLocalization("concord.widgets","menubar");

writer.style = function( commandDef, removeStyleDef  )
{
	this._ =
	{
		definition : commandDef,
		removeStyle : removeStyleDef,
		applyRecords:[],
		applyParaRecords:[]
	};
};

writer.style.prototype =
{
	_generateStyle: function( model )
	{
		var styles ;//
		
		if( model.textProperty &&  model.textProperty.style)
		//do not collect merged styles
			styles = model.textProperty.style;
		else
			styles = model.getStyle();
		
		var retStyles = {};
		var styleDef = this._.definition;
		for (var key in styleDef){
			retStyles[key] = styles[key] ||"";
		}
		return retStyles;
	},
	
	_setModelStyle:function(m,remove){
		if(!m) return;
		var rec;
		var styleDef = remove ? (this._.removeStyle || this._.definition) : this._.definition;
		
		if(m.modelType===writer.MODELTYPE.PARAGRAPH){
			rec = this._.applyParaRecords[this._.applyParaRecords.length-1];
			var prop = m.paraTextProperty; 
			if(prop){
				rec.o.push({s:prop.toJson()});
				prop.setStyle(styleDef,remove);
				rec.n.push({s:prop.toJson()});
			}
		}else{
			if( m.hints){
				var hints = m.hints, that = this;
				hints.forEach( function( hint ){
					that._setModelStyle(hint, remove);
				});
			}
			else{
				rec = this._.applyRecords[this._.applyRecords.length-1];
				
				if(styleDef.u)
					rec.o = m.textProperty.getUnderline();
				else if(styleDef.strike)
					rec.o = m.textProperty.getStrike();
				else if(styleDef.rFonts)
					rec.o = m.textProperty.getFontFamily();
				else
					rec.o = this._generateStyle( m );
				
				//for create message
				m.setStyle(styleDef,remove);
				
				if(styleDef.u)
					rec.n = m.textProperty.getUnderline();
				else if(styleDef.strike)
					rec.n = m.textProperty.getStrike();
				else if(styleDef.rFonts)
					rec.n = m.textProperty.getFontFamily();
				else
					rec.n = this._generateStyle( m );
			}
		}
	},
	/* apply style to selection.
	 * para:	The selected paragraph
	 * start:	The start position of paragraph
	 * end:		The end position of paragraph
	 * bRemove: remove styles if true. add else.
	 * isCollapsed: The set style range is collapsed. True will select split run in range. 
	 * */
	_applyStyle:function(para,start,end,bRemove, isCollapsed){
		var cont = para.container;
		if(end < start) {//reverse the first and the last.
			var tmp = start;
			start = end;
			end = start;
		}
		var hasReset = false;
		//this._.applyRecords.push({idx:start,len:end-start,target:para,n:[],o:[]});
		// 1.1:select the whole paragraph.
		var isSelectEmpty = false;
		var modelTools = writer.util.ModelTools; 
		if(start == 0 && para.getLength() === end ){
			this._.applyParaRecords.push({target:para,n:[],o:[]});
			this._setModelStyle(para, bRemove);
			// Will change the list symbol text property
			if(para.isList())
			{
				hasReset = true;
				para.markReset();
				para.parent.update();
			}
		}
		else if(isCollapsed )
		{
			// Check if current select run is setting style run.
			// For case set style twice, like set italic + underline
			var sel = pe.lotusEditor.getSelection();
			var range = sel.getRanges()[0];
			var startModel = range.getStartModel();
			var run = startModel.obj;
			if( run.modelType == writer.MODELTYPE.PARAGRAPH )
				run = run.byIndex( startModel.index )||run.hints.getLast();
			if( run.length == 0 && run.isTextRun && run.isTextRun() && !run.isStyleRun )
				run.isStyleRun = true;

			if( run.length == 0 && run.isStyleRun)
			{
				isSelectEmpty = true;
				this._.applyRecords.push({idx:run.start,len:run.length,target:para,n:[],o:[]});
				this._setModelStyle(run,bRemove);

				if(!modelTools.isEmptyParagraph( para ))
					this._recordStyleRun(run);
			}
		}
		
		if(!isSelectEmpty)
		{	
			var runs;
			if(modelTools.isEmptyParagraph( para ))
				runs = para.hints;
			else
				runs = para.splitRuns(start,end-start);
			if(runs.length() == 0 && para.isEmpty()){
				runs = para.hints;
			}
			var that = this;
			runs.forEach(function(run){
				that._.applyRecords.push({idx:run.start,len:run.length,target:para,n:[],o:[]});
				that._setModelStyle(run,bRemove);
				if(isCollapsed)
				{
					if(!modelTools.isEmptyParagraph( para ))
						that._recordStyleRun(run);
				}	
			});
		}
		if(!hasReset){
			para.markDirty();
			if(isCollapsed){ // fix 40897
				para.parent&&para.parent.update(true);
			}
		}
	},
	
	/**
	 * The function will select the run to ensure the command status updated.
	 * Then attach selection change event, when the selection changed to other object and the style run is empty, will remove the run.
	 * @param run The run which will be set style.
	 */
	_recordStyleRun: function(run)
	{
		// 1. Select the run to update command status
		var pos = {"obj":run, "index":0};
		setTimeout(function(){
			var sel = pe.lotusEditor.getSelection();
			var curRange = sel.getRanges()[0];
			var newRange = new writer.core.Range(pos, pos, curRange.rootView);
			sel.selectRanges([newRange]);
		}, 10);
		
		// 2. Listen the selection change event. To prepare remove the empty run if no input
		run.isStyleRun = true;	// Set a flag to this run.
		
		var selectionChangeFunc = function()
		{
			var sel = pe.lotusEditor.getSelection();
			var range = sel.getRanges()[0];
			var startModel = range.getStartModel();
			var selRun = startModel.obj;
			if(run.length != 0 || selRun != run)
			{
				delete run.isStyleRun;
				if(run._handle)
				{
					dojo.unsubscribe(run._handle);
					delete run._handle;
				}
				
				// Remove empty run but not for empty paragraph
				if(run.length == 0 && selRun != run)
				{
					var parent = run.parent;
					var hintsContainer = parent && parent.hints;
					if(hintsContainer)
					{
						run.markDelete();
						hintsContainer.remove(run);
						if(hintsContainer.length() == 0)
							parent.fillHintIfEmpty();
						parent.buildRuns(); 
						
						// Defect 49271
						parent.markDirty && parent.markDirty();
						parent.parent && parent.parent.update(true);
					}
				}	
				
				pe.lotusEditor.indicatorManager.drawUserSelections();
			}
		};
		if(!run._handle)
			run._handle = dojo.subscribe(writer.EVENT.SELECTION_CHANGE, null, selectionChangeFunc);
	},
	
	_getRun:function(para,index){
		var t = para.container.getFirst();
		while(t){
			if(t.start<=index && t.start+t.length>index || (t.start+t.length==index && !t.next())){
				return t;				
			}
			t=t.next();
		}
	},
	_applyInlineStyle: function ( ranges, bRemove )
	{
		var range, it, para, msgs = [];
		var updateRoot = null;
		
		for (var i = 0; i < ranges.length; i++) {
			range = ranges[i];
			var startPos, endPos;
			var paras = [];
			// fix 36286: change font properties doesn't work when a textbox is selected
			var range = writer.util.RangeTools.getStyleOperationRange(ranges[i]);
				startPos = range.getStartParaPos().index, endPos = range.getEndParaPos().index;
				it = new writer.common.RangeIterator( range );
				para = null;
				// TODO Select paragraphs in nested table
				while ( para = it.nextParagraph()) {
					if(para.modelType == writer.MODELTYPE.PARAGRAPH)
						paras.push(para);
				}
				if(paras.length == 0)
					continue;
			
			this._.applyRecords = [];
			this._.applyParaRecords=[];
			// Set the first paragraph
			var firstPara = paras[0];
			if(paras.length == 1)
			{
				var isCollapsed = (ranges.length == 1 && range.isCollapsed());
				// Collapsed case will select range to the new created run
				this._applyStyle(firstPara, startPos, endPos, bRemove, isCollapsed);
			}
			else
			{
				this._applyStyle(firstPara, startPos, firstPara.getLength(),bRemove);
				
				// Set the last paragraph
				var lastPara = paras[paras.length - 1];
				this._applyStyle(lastPara, 0, endPos, bRemove);
				
				// Set other paragraphs
				for(var j = 1; j < paras.length - 1; j++)
				{
					para = paras[j];
					this._applyStyle(para, 0, para.getLength(), bRemove);
				}	
			}
				
			if(range.isCollapsed() && firstPara.getLength() != 0) //in a run and it's not empty.so needn't send msg
				continue;
			
			/* DONE:send message.
			 * msg to apply rPr in paragraph.
			 * */
			var mc ;
			if(pe.lotusEditor._shell.getEditMode() == EDITMODE.EDITOR_MODE)
				mc = WRITER.MSGCATEGORY.Content;
			else
				mc = WRITER.MSGCATEGORY.Relation;
			var pacts = dojo.map(
					this._.applyParaRecords,function(item){
						var len = item.n.length; // Only record the last new and the first old.
						item.n[len - 1].type = "pt";	// pt is Paragraph text type
						item.o[0].type = "pt";
						return WRITER.MSG.createSetAttributeAct(item.target,item.n[len - 1],item.o[0]);
			});
			var pmsg = pacts.length > 0 ? WRITER.MSG.createMsg(WRITER.MSGTYPE.Attribute,pacts,mc,false) : null;
			pmsg && msgs.push(pmsg);
			
			if(!range.isCollapsed() || firstPara.text.length == 0){
				var tacts = dojo.map(
						dojo.filter(this._.applyRecords,function(i){return i.p==undefined;}),function(item){
							return WRITER.MSG.createSetTextAttribute(item.idx,item.len,item.target,item.n,item.o);
				});
				var tmsg = tacts.length > 0 ? WRITER.MSG.createMsg(WRITER.MSGTYPE.TextAttribute,tacts,mc,false) : null;
				tmsg && msgs.push(tmsg);
			}
			
			//update parent cell if exists
			var parentCell = writer.util.ModelTools.getAncestor(firstPara, writer.MODELTYPE.CELL);
			parentCell && parentCell.update();
			
			updateRoot = updateRoot || writer.util.ModelTools.getDocument(firstPara);//first.obj.paragraph.parent;
		}
		
		updateRoot && updateRoot.update();
		WRITER.MSG.sendMessage(msgs);
		return;
	},
		
	applyStyle : function(data,bRemove )
	{
		// Get all ranges from the selection.
		var selection = pe.lotusEditor.getSelection();
		var ranges = selection.getRanges();
		if(data) {
			for(var key in this._.definition){
				this._.definition[key]=data;
				if(key.indexOf("color")>-1) bRemove=false;
			}
		}
		selection.store();
		this._applyInlineStyle(ranges, bRemove);
		selection.restoreBeforeUpdate(true);
	}
};

dojo.declare("writer.plugins.Styles",
[writer.plugins.Plugin], {
	getStylesConfig : function(){
		return [
		        {
		        	name: "bold",
		        	style: { 'font-weight':'bold' },
		        	shortcut:  writer.CTRL + 66 /*B*/
		        },
		        {
		        	name: "italic",
		        	style: {'font-style' : 'italic'  },
		        	shortcut:  writer.CTRL + 73 /*i*/
		        },
		        {
		        	name: "underline",
		        	style: { 'u':{"val":"single"} },	
		        	removeStyle : { 'u':{"val":"none"} },	// Remove Style
		        	shortcut:  writer.CTRL + 85 /*u*/
		        },
		        {
		        	name: "strike",
		        	style: {'strike':'1'},
		        	removeStyle : {'strike':'-1'}	// Remove Style
		        },
		        {
		        	name:"ForeColor",
		        	style:{'color':''}
		        },
		        {
		        	name:"HighlightColor",
		        	style:{'background-color':''}
		        },
		        {
		        	name:"superscript",
		        	style:{'vertical-align':'super'},
		        	shortcut:  writer.CTRL + 190 /*.*/
		        },
		        {
		        	name:'subscript',
		        	style:{'vertical-align':'sub'},
		        	shortcut:  writer.CTRL + 188 /*,*/
		        }
//		        {
//		        	name:"heading",
//		        	style:{'styleId':'Normal'}
//		        }
		        ];
	},
	
	init: function() {
		var styleCommand = function( commandDef, removeDef )
		{
			this.style = new writer.style(commandDef, removeDef);
		};

		styleCommand.prototype.checkActive = function(model){
			var styleDef = this.style._.definition;
			var style = model.getComputedStyle();
			if ( !style ){
				return writer.TRISTATE_OFF;
			}
			for (var key in styleDef){
				var isUnderline = isStrike = false;
				if(key == "u")
				{
					key = "text-decoration";
					isUnderline = true;
				}
				else if( key == "strike")
				{
//					transfrom underline and strike to text-decoration.
					key = "text-decoration";
					isStrike = true;
				}
				
				var value = style[key] && dojo.trim(style[key]);
				if (key == "font-weight" && value>=700 ){
					value = "bold";
				}
				var values = value && value.split(" ");
				if(values && values.length > 1){
					if(dojo.some(values,function(item){
						if(isUnderline)
							return item == "underline";
						else if(isStrike)
							return item == "line-through";
						else
							return item === dojo.trim(styleDef[key]);
					})){
						return writer.TRISTATE_ON;
					}
				}
				if(isUnderline)
					return (value == "underline") ? writer.TRISTATE_ON : writer.TRISTATE_OFF;
				else if(isStrike)
					return (value == "line-through")? writer.TRISTATE_ON : writer.TRISTATE_OFF;
				else if(value != dojo.trim(styleDef[key])){
					return writer.TRISTATE_OFF;
				}
			}
			return writer.TRISTATE_ON;
		};
		
		styleCommand.prototype.exec = function(data)
		{
			var state = this.getState();
			if ( state == writer.TRISTATE_ON || data == "autoColor")
				this.style.applyStyle(data,true);
			else if (state == writer.TRISTATE_OFF )
				this.style.applyStyle(data);
			var func = selectionChangeHandler;
			// to Fix 44775: Set B/I/U for an image, then the toolbar status is wrong,
			// reset style toggle buttons's state to make setState always update button state
			pe.lotusEditor.getCommand('bold').setState(undefined);
			pe.lotusEditor.getCommand('italic').setState(undefined);
			pe.lotusEditor.getCommand('underline').setState(undefined);
			pe.lotusEditor.getCommand('strike').setState(undefined);			
			setTimeout(function(){ func(); }, 0);
		};
		
		
		var commands = this.getStylesConfig();
		
		for (var i=0;i<commands.length;i++){
			var command = commands[i];
			this.editor.addCommand( command.name, new styleCommand(command.style, command.removeStyle) , command.shortcut); /*B*/
		}
		var collectState = function(resulted,run){
			var finished = true;
			for(var i in commands){
				if (resulted[i] === true){
					continue;
				}
				finished = false;
				var command = pe.lotusEditor.getCommand(commands[i].name);
				var nextstate = command.checkActive(run);
				if (nextstate != writer.TRISTATE_ON ){
					command.setState(nextstate);
					resulted[i] = true;
				}else{
					//temp state
					resulted [i] = 2;
				}
			}
			return finished;
		};
		
		var selectionChangeHandler = function(){
//			console.log("selectionchange handler is called");
			var selection = pe.lotusEditor.getSelection();
			var ranges = selection.getRanges();
			if(ranges.length == 1 && writer.util.RangeTools.ifContainOnlyOneDrawingObj(ranges[0])){
				for (var i in commands){				
						var command = pe.lotusEditor.getCommand(commands[i].name);
						command.setState(writer.TRISTATE_OFF);
				} 
				return;
			}
			var resulted = [];
			var helperTools = writer.util.HelperTools;
			for ( var i = 0 ; i < ranges.length ; i++ )
			{
				// for style operation, need change range sometimes, for example, if selection is textBox, need reset range to its inner paragraphs to calculate style button state
				var range = writer.util.RangeTools.getStyleOperationRange(ranges[i]);
				var maxParagraphCount = 100;
				var iterator = new writer.common.RangeIterator(range, maxParagraphCount);
				var next;
				var startPos = range.getStartParaPos();
				var isCollapsed = range.isCollapsed();
				var endPos = isCollapsed ? null : range.getEndParaPos();	// isCollapsed will ignore it.
				while(next = iterator.nextModel()){
					var tools = writer.util.ModelTools;
					if(next && next.modelType===writer.MODELTYPE.PARAGRAPH){
						var run = next.container.getFirst();
						while(run)
						{
							if(tools.isLinkOrField(run)){
								var runInLink = run.container.getFirst();
								while(runInLink){
									if(helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos) && true==collectState(resulted,runInLink))
										break;
									runInLink = runInLink.next();
								}
								
							}else if(tools.isImage(run) || tools.isBookMark(run) ){
								if( isCollapsed ){
									var ret = run.paragraph.getInsertionTarget( startPos.index );
									if( ret && ret.follow && true==collectState(resulted,ret.follow) ){
										break;
									}
								}
							}
							else if((helperTools.isInSelection(run, isCollapsed, startPos, endPos)) && true==collectState(resulted,run))
								break;
							run = run.next();
						}
						
					}
					else
					{
						if(tools.isLinkOrField(next)){
							var runInLink = next.container.getFirst();
							while(runInLink){
								if(helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos) && true==collectState(resulted,runInLink))
									break;
								runInLink = runInLink.next();
							}
						}else if(tools.isImage(next) || tools.isBookMark(next) ){
							if( isCollapsed ){
								var ret = next.paragraph.getInsertionTarget( startPos.index );
								if( ret && ret.follow && true==collectState(resulted,ret.follow) ){
									break;
								}
							}
						}else if(helperTools.isInSelection(next, isCollapsed, startPos, endPos) && true==collectState(resulted,next))
							break;
					}
					
				}
			}		
			for (var i in commands){
				if (resulted[i] ==2 ){
					var command = pe.lotusEditor.getCommand(commands[i].name);
					command.setState(writer.TRISTATE_ON);
				}
			}
			
		};
		//register selection change event
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, selectionChangeHandler);
	}
});


