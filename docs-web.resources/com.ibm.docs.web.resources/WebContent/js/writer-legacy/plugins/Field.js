dojo.provide("writer.plugins.Field");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.ui.widget.insertDate");
dojo.require("writer.ui.widget.insertTime");

dojo.declare( "writer.plugins.Field", [writer.plugins.Plugin], {
	ifInField: function()
	{
		return this.getSelectedField(true) ? true : false;
	},
	getSelectedField: function(notCheckSupported){
		var	selection = this.editor.getSelection(),
		ranges = selection.getRanges();
		if( ranges.length == 1 )
		{
			var range = ranges[0];
			var hint = range.getCommonAncestor( true );
			if( hint && hint.length && hint.modelType && hint.modelType == writer.MODELTYPE.FIELD && (notCheckSupported || hint.isSupported()))
				return hint;
		}
	},
	init: function() {
			var editor = this.editor;
			var nls = dojo.i18n.getLocalization("concord.scenes","Scene");
			var instr_pageNumber = " PAGE   \\* MERGEFORMAT ";
			var instr_pageTotalNumbers = " NUMPAGES \\* MERGEFORMAT ";
			var that = this;
			var tools = writer.util.ModelTools;
			
			function getObject( m )
			{
				var toc =  writer.util.ModelTools.getParent( m,writer.MODELTYPE.TOC);
				if( toc )
					return toc;
				if( tools.isInlineObject(m))
					return m;
				
				var txbx = tools.getParent( m, tools.isTextBox);
				if( txbx )
					return txbx;
				
				return null;
			};
			
			/**
			 * story 20432
			 */
			dojo.subscribe(writer.EVENT.BEFORE_SELECT, this, function( ranges ){
			if( ranges.length == 1 )
			{
				var range = ranges[0], start = range.getStartModel(), end = range.getEndModel();
				if(!start||!end){
					return ;
				}
				var startIndex = start.index;
				var startModel = start.obj;
				
				var endIndex = end.index;
				var endModel = end.obj;
				
				var swap = writer.util.RangeTools.isNeedSwap( range );
				var startO = getObject(  startModel ), endO = getObject( endModel );
				if( startO != endO || (startO == endO && startO && startO.isWaterMarker))
				{
					if(  startO )
					{
						startModel = (swap) ?  startO.lastChild(): startO.firstChild();
						if( tools.isTextBox( startO ))
							range.setStartModel( startO, (swap)? 1: 0  );
						else 
							range.setStartModel( startModel,(swap)? startModel.length : 0  );
					
					}
						
					if( endO )
					{
						endModel = endO.firstChild() ? ((swap) ? endO.firstChild() : endO.lastChild()) : endO;
						if( !endModel || tools.isTextBox( endO ))
							range.setEndModel( endO, (swap)? 0: 1  );
						else
							range.setEndModel( endModel,(swap)? 0: endModel.length );
					}
				}
				
			}
		});
			
			function focusOut( )
			{
				if( editor.focusFieldNodes )
				{
					for( var i = 0; i< editor.focusFieldNodes.length; i++ )
						dojo.style( editor.focusFieldNodes[i],{"background":""});
					editor.focusFieldNodes = null;
				}
			}
		
			dojo.subscribe(writer.EVENT.DOMCREATED, this, function( m, domNode, run, arg ){
			if(arg.fieldObj != null && !arg.fieldObj.isTOCStart())
			{
			//connect click event
				function focusIn(e){
					console.log( "focus in field");
					focusOut();
					dojo.style( domNode,{"background":"#999"});
					editor.focusFieldNodes = [];
					editor.focusFieldNodes.push( domNode );
				};
				
				dojo.connect( domNode, "onclick", null, focusIn );
			}
		});
			
			var selectionChangeHandler = function(){
				var selection = pe.lotusEditor.getSelection();
				var ranges = selection.getRanges();
				var resulted = [];
				focusOut();
				for ( var i = 0 ; i < ranges.length ; i++ )
				{
					var range = ranges[i];
					var maxParagraphCount = 100;
					var iterator = new writer.common.RangeIterator(range, maxParagraphCount);
					var next;
					var maxCheckObj = 1000;
					while((next = iterator.next()) && maxCheckObj > 0){
						maxCheckObj--;
						var field = writer.util.ModelTools.getField(next);
						if( field && !field._highlighted && !field.isTOCStart() )
						{
							if( !editor.focusFieldNodes )
								editor.focusFieldNodes = [];
							
							resulted.push(field);
							field._highlighted = true;
							
							var runs = field.container;
							runs && runs.forEach(function(run){
								var rootViews = run.getAllViews();
								for(var ownerId in rootViews){
									var views = rootViews[ownerId];
									var v = views.getFirst();
									while(v){
										if( v.domNode )
										{
											dojo.style( v.domNode,{"background":"#999"});
											editor.focusFieldNodes.push(v.domNode);
										}
										v = views.next(v);
									}			
								}
							});
						}
					}
				}
				
				for(var i = 0; i < resulted.length; i++)
					resulted[i]._highlighted = false;
				
				var toc_plugin = pe.lotusEditor.getPlugin("Toc");
				var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
				var nState = toc_disable ? writer.TRISTATE_DISABLED : writer.TRISTATE_OFF;
				pe.lotusEditor.getCommand("insertTime").setState( nState );
				pe.lotusEditor.getCommand("insertDate").setState( nState );
				pe.lotusEditor.getCommand("insertTotalPageNumber").setState( nState );
				pe.lotusEditor.getCommand("insertPageNumber").setState( nState );
			};
			dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, selectionChangeHandler);
		
		var createFieldJSON = function( start , instrText){
			var text = "#";//pageNumber+"";
			var len = text.length;
			return {
					"fmt" : [ {
						"style" : {},
						"rt" : "rPr",
						"s" : start,
						"l" : len
					} ],
					"id" : WRITER.MSG_HELPER.getUUID(),
					"fld" : writer.util.ModelTools.createFieldInstrTextJson( instrText, start ),
					"rt" : "fld",
					"c" : text,
					"s": start,
					"l": len
				};
			
		};
		/**
		 * update selected field
		 */
		var updateCommand = 
		{
			exec: function()
			{
				var field = that.getSelectedField();
				var parent = field && field.parent;
				if( parent && parent.getStyleId()== "TableofFigures" )
				{ //update table of figures
					dojo.publish( writer.EVENT.UPDATE_REFERENCE,["TableofFigures"] );
				}
				else if( field ){
					field.update( true, true);
				}
			}
		};
		editor.addCommand("updateField", updateCommand );
		
		function insertRuns( array, position)
		{
			WRITER.MSG.beginRecord();
			try{
				var msgs = [], msg, sel = editor.getSelection(),actPair,
					ranges = sel.getRanges(),range = ranges[0]
					paraPos = range.getStartParaPos();
				if(!writer.util.RangeTools.canDo(ranges)){
					/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
					return;
				}
				if( !range.isCollapsed()){
					 msgs = range.deleteContents(true,true);
					 paraPos = range.getStartParaPos();
				}
				
				var p = paraPos.obj, idx = paraPos.index, runJson;
				
				var messageCategory;
				var bAlignmentRight = false;
				//if position is top/bottom, need get position in header/footer
				if(position == "Top"){
					var header = writer.util.ViewTools.getPage(range._start.obj).getHeader();
					if(!header){
						writer.util.SectionTools.insertHeaderFooter( writer.util.ViewTools.getPage(range._start.obj), true);
						header = writer.util.ViewTools.getPage(range._start.obj).getHeader();
					}
					// switch to headerfooter edit mode
					pe.lotusEditor.getShell().moveToHeaderFooter(header);
					range.setRootView(header);
					//reassign value to variable p and idx
					p = header.model.lastChild();
					idx  = p.getLength();
					if(!writer.util.ModelTools.isEmptyParagraph(p)){
						var newPara = p.split(idx, msgs);
						p.parent.insertAfter(newPara,p);
						msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );							
						p = newPara;
						idx = 0;
					}
					bAlignmentRight = true;
					messageCategory = WRITER.MSGCATEGORY.Relation;
				}else if(position =="Bottom"){
					var footer = writer.util.ViewTools.getPage(range._start.obj).getFooter();
					if(!footer){
						writer.util.SectionTools.insertHeaderFooter( writer.util.ViewTools.getPage(range._start.obj), false);
						footer = writer.util.ViewTools.getPage(range._start.obj).getFooter();
					}
					pe.lotusEditor.getShell().moveToHeaderFooter(footer);
					range.setRootView(footer);
					//reassign value to variable p and idx
					p = footer.model.lastChild();
					idx  = p.getLength();
					if(!writer.util.ModelTools.isEmptyParagraph(p)){
						var newPara = p.split(idx, msgs);
						p.parent.insertAfter(newPara,p);
						msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );							
						p = newPara;
						idx = 0;
					}
					bAlignmentRight = true;
					messageCategory = WRITER.MSGCATEGORY.Relation;
				}
				var ret = p.getInsertionTarget(idx);
				var hint = ret.follow;
				
				for ( var i = 0; i< array.length; i ++){
					if( array[i].text ){ //create text run
						var text = array[i].text, len = text.length;
						p.insertText( text, idx);
						actPair = WRITER.MSG.createInsertTextAct(idx, len, p);
						msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair], messageCategory);
						msg && msgs.push( msg );
						idx += len;
					}
					else if( array[i].field ){ //create field
						runJson = createFieldJSON( idx, array[i].field ,messageCategory ? true: false);
						if( runJson ){
							if(  hint && hint.textProperty){
								//follow styles
								var styles = hint.textProperty.toJson() || {};
								for (var key in styles){
									if( key != "styleId")
										runJson.fmt[0].style[key] = styles[key];
								}
							}
							p.insertRichText( runJson, idx );
							actPair = WRITER.MSG.createInsertTextAct(runJson.s, runJson.l, p);
							msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair], messageCategory);
							msg && msgs.push( msg );
							idx += runJson.l;
						}
					}
				}

				if (bAlignmentRight)
				{
					msg = p.setAlignment("right");
					msg && msgs.push( msg );
				}
				
				WRITER.MSG.sendMessage( msgs );
				p.parent.update();
				range.setStartModel(p, idx);
				range.collapse( true );
				sel.selectRangesBeforeUpdate([range]);
			}
			catch( e ){
				console.error ( "error in Field plugin: " + e.message );
			}
			
			WRITER.MSG.endRecord();
		};
		
		/**
		 * create field and send message
		 * @param instrText
		 * @returns
		 */
		var createFieldFunc = function( instrText ){
			return insertRuns([{ 'field': instrText }]);
		};
		
		var createPageNumberFunc = function(instrText, position){
			return insertRuns([{ 'field': instrText }], position);
		};
		//insert page number field command
		var insertPageNumberCommand = 
		{
				exec: function(param)
				{
					var position = param && param.position;
					createPageNumberFunc(instr_pageNumber, position);
				}
		};
		editor.addCommand("insertPageNumber", insertPageNumberCommand );
		
		var insertTotalPageNumberCommand = 
		{//"Page 1 of N"
			exec: function()
			{
				var nls = dojo.i18n.getLocalization("writer","lang"),textArray = [];
				var list = nls.PAGENUMBER_OF_TOTALNUMBER.replace("${0}","%${0}%").replace("${1}","%${1}%").split("%");
				for( var i = 0; i< list.length; i++ )
				{
					switch(list[i])
					{
					case "${0}":
						textArray.push({'field':instr_pageNumber});
						break;
					case "${1}":
						textArray.push({'field':instr_pageTotalNumbers});
						break;
					default:
						{ //text 
							var str = list[i];
							str.length && textArray.push({'text':str});
						}
					}
				}
				insertRuns( textArray );
			}
		};
		editor.addCommand("insertTotalPageNumber", insertTotalPageNumberCommand );
		
		var insertDateCommand = 
		{
			exec: function( dateFormat )
			{
				if( !dateFormat )
				{
					if( !this.insertDateDialog ){
						var nls = dojo.i18n.getLocalization("writer","lang");
			    		this.insertDateDialog = new writer.ui.widget.insertDate(editor, nls.insertDate );
					}
			    	this.insertDateDialog.show();
				}
				else if ( dojo.isString( dateFormat ))
				{
					createFieldFunc( " DATE \\@ \""+ dateFormat.replace(/\bEEEE\b/,"dddd").replace(/\by\b/,"yyyy") + "\" " );
				}
				//createFieldFunc(" DATE \\@ \"M/d/yyyy\" ");
			}
		};
		editor.addCommand("insertDate", insertDateCommand );
		
		var insertTimeCommand = 
		{
			exec: function( format )
			{
				if( !format )
				{
					if( !this.insertTimeDialog ){
						var nls = dojo.i18n.getLocalization("writer","lang");
						this.insertTimeDialog = new writer.ui.widget.insertTime(editor,nls.insertTime );
					}
			    	this.insertTimeDialog.show();
				}
				else if ( dojo.isString( format ))
				{
					createFieldFunc( " DATE \\@ \""+ format + "\" " );
				}
			}
		};
		editor.addCommand("insertTime", insertTimeCommand );
		//context menu
		var nls = dojo.i18n.getLocalization("writer","lang");
		 
		var cmds ={
				updateField:
				{
					label : nls.field.update,
					commandID : 'updateField',
					group : 'field',
					order : 'updateField',
					name  : 'updateField'
				}
		};
		
		var ctx = this.editor.ContextMenu;
		if(ctx && ctx.addMenuItem){
			for(var k in cmds)
				ctx.addMenuItem(cmds[k].name,cmds[k]);
		}
		if(ctx && ctx.addListener) ctx.addListener(function(target,selection){
			var field = that.getSelectedField();
			if( field )
				return {
					updateField: false
				};
			else
				return {};
		});
		
	}});