dojo.provide("writer.msg.MessageHandler");

dojo.declare("writer.msg.MessageHandler",null,{
	isManipulatingTbl: false,
	
	receiveMessage : function(msg)
	{
		// 1.Transform message in sendoutList
		this._transform(msg);	
		// 2 apply message to editor
		dojo.publish(writer.EVENT.GROUPCHANGE_START);
		this.processMessage(msg);
		dojo.publish(writer.EVENT.GROUPCHANGE_END);
		// 3. Transform Undo/Redo message
		pe.lotusEditor.undoManager.transform(msg);
	},
	/**
	 * call by UndoManager
	 * before undo/redp
	 */
	beginAction: function(){
		this.cursorRanges = null;
	},
	/**
	 * call by UndoManager
	 * after undo/redo
	 */
	endAction: function(){
		if( this.cursorRanges ){
			this.mergeRanges();
			pe.lotusEditor.getSelection().selectRangesBeforeUpdate( this.cursorRanges );
			this.cursorRanges = null;
		}
	},
	
	_transform : function(msg)
	{
		var sess = pe.scene.session;
		// if message in waitingList isn't conflict with others, then the message will be OT on server, 
		// so we should clone the waitingList here, or else the message will be OT twice.
		var localList = sess.sendoutList.concat(sess.waitingList);
		if(localList.length > 0)
		{				
			var conflictMsg = WRITER.OTSERVICE.transform(msg,localList);
			if( conflictMsg )
			{
				//1 show error message
				var nls = dojo.i18n.getLocalization("concord.scenes","Scene");
				pe.scene.showWarningMessage(nls.conflictMsg,5000);
				
				//remove message on sendoutlist
				var index = -1;
				for (var i=0; i<sess.sendoutList.length; i++)
				{
					if (sess.sendoutList[i].client_seq == conflictMsg.client_seq)
					{
						index = i;
						break;
					}
				}
				if (index != -1)
					sess.sendoutList.splice( index, sess.sendoutList.length - index );

				//remove message on waiting list
				sess.waitingList = [];
				//send resolve conflict message to server
				var newmsg = sess.createMessage();
				newmsg.resolve_conflict= "true";
				sess.sendMessage([newmsg]);	
				
				//2 roll back local change
				var isReload= pe.lotusEditor.undoManager.rollback(conflictMsg);
				if(isReload){
					throw "reload for local conflict";
				}
			}	
		}
	},
	
	/**
	 * merge all ranges
	 */
	mergeRanges: function(){
		
		if( !this.cursorRanges || this.cursorRanges.length <= 1  )
			return;
		var range = this.cursorRanges[0], start, end, tools = writer.util.ModelTools;
		
		var obj1 = range.getStartModel().obj,
			idx1 = range.getStartModel().index,
			obj2 = range.getEndModel().obj,
			idx2 = range.getEndModel().index;
		
		for( var i = 1; i < this.cursorRanges.length; i++ ){
			range = this.cursorRanges[i];
			start = range.getStartModel();
			end  = range.getEndModel();
			
			if( tools.compare( obj1, idx1, start.obj, start.index ) > 0 ){
			// start in minimum
				obj1 = start.obj;
				idx1 = start.index;
			}
			
			if( tools.compare( obj2, idx2, end.obj, end.index ) < 0 ){
			// end is maximum
				obj2 = end.obj;
				idx2 = end.index;
			}
		}
		this.cursorRanges = [ new writer.core.Range({"obj": obj1, "index": idx1}, {"obj":obj2,"index":idx2}, this.rootView )];
	},
	
	_checkRangeConflict: function( obj, idx ){
		var range;
		if( this.cursorRanges && this.cursorRanges.length == 1 ){
			range = this.cursorRanges[0];
			if( range.isCollapsed() ){
				return;
			}
		}
		var bConflict = false;
		var id = obj && obj.id;
		if( !id )
			return;
		
		for( var i =0 ; i< this.cursorRanges.length && !bConflict; i++ ){
			range = this.cursorRanges[i];
			var startId = range.start_id.obj;
			var endId = range.end_id.obj;
			
			if( id && ( id == startId || id == endId )){
				bConflict = true;
			}
		}
		if( bConflict ){
			range = this.cursorRanges[0];
			range.end_id = range.start_id;
			this.cursorRanges = [range];
		}
	},
	/**
	 * add range for undo/redo
	 * @param obj1
	 * @param idx1
	 * @param obj2
	 * @param idx2
	 */
	addCursorRange: function( obj1, idx1, obj2, idx2 )
	{
		try{
		if( !this.isFromUndoRedo ){
			this._checkRangeConflict( obj1, idx1 );
			if( obj2 != obj1 )
				this._checkRangeConflict(obj2, idx2);
			return;
		}
		if( obj1 == null )
			return;
		if( obj2 == null)
		{
			obj2 = obj1;
			idx2 = idx1;
		}
		//prepare before add range 
		var tools = writer.util.ModelTools, compareResult = tools.compare(  obj1, idx1, obj2, idx2  );
		if(  compareResult > 0 )
		{//pos1 should <= pos2
			var tmp = obj1;
			obj1 = obj2;
			obj2 = tmp;
			
			tmp = idx1;
			idx1 = idx2;
			idx2 = tmp;
		}
		if( this.cursorRanges == null )
			this.cursorRanges = [];
		
		//and range
		var range, start, end, ranges =  this.cursorRanges, 
			newRange = new writer.core.Range({"obj": obj1, "index": idx1}, {"obj":obj2,"index":idx2}, this.rootView);
			
		for( var j=0; j< ranges.length; j++ ){
			range = ranges[j];
			start =  range.getStartModel();
			end = range.getEndModel();
			if( obj2 == obj1 && start.obj == obj1 && end.obj == obj1 
					&& tools.compare( obj1, idx1, start.obj, start.index ) >= 0
					&& tools.compare( obj1, idx1, end.obj, end.index )< 0 ){
					// if two range have overlap
					//replace with new range
					 ranges[j] = newRange; 
					 return;
			}
		}
		//do not deal with it
		ranges.push( newRange );
		}
		catch(e){
			console.error("addCursorRange exception: " + e);
		}
	},
	
	setCursorEditPosition: function( obj, bStart, bMerge )
	{
		try{
		if( !this.isFromUndoRedo ){
			//check collapsed
			this._checkRangeConflict(obj, 0);
		}
		else {
			if( !bMerge ){
				var range = new writer.core.Range({"obj": obj, "index": 0}, {"obj":obj,"index":0},this.rootView);
				( bStart ) ? range.moveToEditStart( obj ) :  range.moveToEditEnd( obj );
				this.cursorRanges = [ range ];
			}
			else{
				this.addCursorRange( obj, 0, obj, writer.util.ModelTools.getLength(obj));
			}
		}
		}
		catch(e){
			console.error("Exception in setCursorEditPosition:" + e);
		}
	},
	
	processMessage: function(msg, isFromUndoRedo, lastMsg )
	{
		var editor = pe.lotusEditor;
		var doc = editor.document;
		var msgModel = null;
		this.isFromUndoRedo = isFromUndoRedo;
		var msgCat = WRITER.MSGCATEGORY, msgType = WRITER.MSGTYPE, actType = WRITER.ACTTYPE;
		
		var target;
		switch(msg.mc)
		{
		case msgCat.Style:
			msgModel = editor.styles;
			break;
		case msgCat.List:
			msgModel = editor.number;
			break;
		case msgCat.Setting:
			msgModel = editor.setting;
			break;
		case msgCat.Relation:
			msgModel = editor.relations;
			break;
		case msgCat.Footnotes:
		case msgCat.Endnotes:
			msgModel = editor.relations;
			break;
		default:
			msgModel = doc;
			break;
		}
		
		var selection = pe.lotusEditor.getSelection();
		
		selection.store( msg );
		this.cmdId = msg.cmdId;
		var ranges = selection.getRanges();
		this.rootView = ranges.length > 0 ? ranges[0].rootView : null;
		if( !this.isFromUndoRedo ){
			this.cursorRanges = ranges;
		}
		var updateRoot = null;
		for(var i = 0; i < msg.updates.length; i++)
		{	
			//var isManipulated = false;
			var act = msg.updates[i];
			if (msg.type == msgType.Selection)
			{
				if (act.t == actType.SelectionChanged)
				{
					// console.info("----Selection Changed received " + msg.orphan);
					pe.lotusEditor.indicatorManager.updateUserSelections(msg.user_id, msg.mc, msg.orphan, act.ranges);
				}
			}
			else if (msg.mc == msgCat.Style)
			{
				if(msg.type == msgType.Style)
				{
					if(act.t == actType.AddStyle)
						act.c && pe.lotusEditor.createStyle(act.styleId, act.c);
					else if(act.t == actType.SetAttribute)
					{
						var styleAtt = act.st;
						if(styleAtt)
						{
							var styleId = act.styleId;
							if(!styleId)
								return;
							
							var type = styleAtt.type;
							if(!type) return;
							if(type == "numPr")
							{
								var style = pe.lotusEditor.getRefStyle(styleId);
								style && style.setList(styleAtt.numId, styleAtt.ilvl);
//								style && style.updateReferers();
								setTimeout(function(){
									style && style.updateReferers();
								}, 0);
							}
						}	
	
					}
				}	
			}
			else if(msg.type == msgType.KeyMessage)
			{
				// KeyMessage will use different model to handle message.	
				switch(act.t)
				{
				case actType.InsertKey:
					if(msgModel.insertRelation)
						msgModel.insertRelation(act.k, act.c);
					else
						console.error("Can't find the msgModel.insertRelation function.");
					break;
				case actType.DeleteKey:
					if(msgModel.deleteRelation)
						msgModel.deleteRelation(act.k);
					else
						console.error("Can't find the msgModel.deleteRelation function.");
					break;
				case actType.ReplaceKey:
					this.replaceKeyHandler(msgModel, act, isFromUndoRedo);
					break;
				case actType.InsertArray:
					if(act.path=="comments"){
						if(msgModel.insertComment){
							msgModel.insertComment(act.k, act.c);
						}
					}
					break;
				case actType.DeleteArray:
					if(act.path=="comments"){
						if(msgModel.delComment){
							msgModel.delComment(act.k);
						}
					}
					break;
				default:
					throw "KeyMessage include illeagle message action!";
						
				}
			}
			else if(msg.type == msgType.List){
				switch(act.t){
				case actType.AddList:
					// Check if the editor has the numbering first. Avoid add twice for undo/redo or message from other clients.
					if( !editor.number.getAbsNum(act.nid) )
					{
						var abstractNum = new writer.model.abstractNum(act.cnt);
						editor.number.addList(act.nid,act.aid,abstractNum);
						var imgs = act.imgs;
						if( imgs ){
							for(var id in imgs){
								editor.number.addImg( id, imgs[id]);
							}
						}
					}
					break;
				case actType.IndentList:
					this.indentList(pe.lotusEditor.lists, act);
					break;
				case actType.ChangeType:
					this.changeNumbering(pe.lotusEditor.lists, act);
					break;
				case actType.ChangeStart:
					this.changeStart(pe.lotusEditor.lists, act);
					break;
				}
			}
			else if(msg.type == msgType.Task){
				if (pe.lotusEditor.getTaskHdl())
					pe.lotusEditor.getTaskHdl().processMessage(act);
			}
			else if(msg.type == msgType.Section){
				switch(act.t)
				{
					case actType.InsertSection:
						this.insertSection(msgModel,act);
						break;
					case actType.DeleteSection:
						this.deleteSection(msgModel,act);
						break;
				}
			}
			else if(msg.type == msgType.Setting){
				var setting = pe.lotusEditor.setting;
				var sectTools = writer.util.SectionTools;
				if (!setting)
					console.log("msg handler in setting: cannot find setting.");

				switch(act.t)
				{
					case WRITER.ACTTYPE.AddEvenOdd:
						if (!sectTools.isHFDiffOddEvenPages())
							sectTools.setHFOddEvenPages();
						break;
					case WRITER.ACTTYPE.RemoveEvenOdd:
						if (sectTools.isHFDiffOddEvenPages())
							sectTools.setHFOddEvenPages();
						break;
				}
			}
			
			if(act.tid=="footnotes"||act.tid=="endnotes"){
				target = msgModel.byId(act.tid);
				switch(act.t)
				{
				case actType.InsertElement:
					if(act.tid=="footnotes"){
						var m = new writer.model.notes.FootNote(act.cnt);
						target.insertFootnote(m, act.idx);
						break ;
					}	
					if(act.tid=="endnotes"){
						var m = new writer.model.notes.EndNote(act.cnt);
						target.insertEndnote(m, act.idx);
						break ;
					}	
				case actType.DeleteElement:
					if(act.idx < 0)	// The idx change to transformed to -1.
						break;
					if(act.tid=="footnotes"){
						target.deleteFootnote(act.idx);
						this.deleteNote();
						break ;
					}	
					if(act.tid=="endnotes"){
						target.deleteEndnote(act.idx);
						this.deleteNote();
						break ;
					}
				}
				
			}else if (msgModel == doc || msgModel == editor.relations){
				//for document content and header,footer, footnote, endnote
				if (act.t == actType.UpdateComment) {
					msgModel.updateComment(act.tid, act.idx, act.k, act.v);					
					continue;
				}
				if(!act.tid)
					continue;
				target = msgModel.byId(act.tid);
				if(!target)
					continue;
				updateRoot = updateRoot || target.parent;

				switch(act.t)
				{
				case actType.InsertText:
					this.insertText(target, act);
					break;
				case actType.DeleteText:
					this.deleteText(target, act);
					break;
				case actType.InsertElement:
					updateRoot = target;
					this.insertElement(target, act);
					break;
				case actType.DeleteElement:
					updateRoot = target;
					if(act.idx >= 0)	// The index can be transformed to -1. For delete & delete element. 
						this.deleteElement(target, act);
					break;
				case actType.SetAttribute:
					this.setAttribute(target, act);
					break;
				case actType.SetTextAttribute:
					this.setTextAttribute(target, act);
					break;
				case actType.DeleteSection:
					this.deleteSection(msgModel,act);
					break;
				case actType.InsertSection:
					this.insertSection(msgModel,act);
					break;
				case actType.AddComment:
					this.addComment(target,act);
					break;
				case actType.SetParaTask:
					this.SetParaTask(target, act);
					break;
				case actType.SetTableTask:
					this.SetParaTask(target, act);
					break;	
				case actType.InsertRow:
					this.insertRow(target,act);
					break;
				case actType.DeleteRow:
					this.deleteRow(target,act);
					break;
				case actType.InsertColumn:
					this.insertColumn(target, act);
					break;
				case actType.DeleteColumn:
					this.deleteColumn(target, act);
					break;
				case actType.MergeCells:
					this.mergeCells(target,act);
					break;
				case actType.SplitCells:
					this.splitCells(target,act);
					break;
				}
			}
		}
		
		// The header footer message need update from update root
		if(updateRoot){
			if( updateRoot.modelType != "toc")
				updateRoot && updateRoot.update && updateRoot.update();	// TODO need profile			
		}
		
//		if( isFromUndoRedo && this.cursorRanges && lastMsg ){
//			this.mergeRanges();
//			editor.getSelection().selectRangesBeforeUpdate( this.cursorRanges );
//		}else 
		if( !isFromUndoRedo ){
			// Defect 39362.  When apply message changed the range, then user insert text will get old range.
			if( this.cursorRanges && this.cursorRanges != selection.getRanges())
				selection.selectRangesBeforeUpdate( this.cursorRanges );
			selection.restoreBeforeUpdate();
		}
		
		doc.update(); //only document can update now
		pe.lotusEditor.updateManager.update();
	},
	
	indentList: function(lists,act)
	{
		var list = lists[act.nid];
		var changedValue = common.tools.toPtValue(act.cnt.leftChange);
		var numDefinitions = list.absNum.getNumDefinition();
		dojo.forEach(numDefinitions,function(lvl){
			var pPr = lvl.getParaProperty();
			oldLeftValue = pPr.getIndentLeft();
			pPr.setIndentLeft(oldLeftValue + changedValue + "pt");
			pPr.getMessage();
		});
		
		list.reset();
	},
	
	changeNumbering:function(lists,act){
		var list = lists[act.nid];
		
		var defStr = "";
		if(act.cnt.numFmt)
			defStr += '"numFmt":{"val":"' + act.cnt.numFmt + '"}';
		if(act.cnt.lvlText)
		{
			if(defStr.length > 0) defStr += ',';
			defStr += '"lvlText":{"val":"' + act.cnt.lvlText + '"}';
		}
		if(act.cnt.lvlPicBulletId)
		{
			if(defStr.length > 0) defStr += ',';
			defStr += '"lvlPicBulletId":{"val":"' + act.cnt.lvlPicBulletId + '"}';
		}
		
		if(act.cnt.lvlJc)
		{
			if(defStr.length > 0) defStr += ',';
			defStr += '"lvlJc":{"val":"' + act.cnt.lvlJc + '"}';
		}	
		
		var numDefJson = JSON.parse("{" + defStr + "}");
		var numDefintion = new writer.model.numberingDefinition(numDefJson);
		
		if(act.cnt.rPr)
			numDefintion.rPr = dojo.clone(act.cnt.rPr);
		
		list.changeListStyle(numDefintion ,act.lvl);
	},
	
	changeStart: function(lists,act){
		var list = lists[act.nid];
		list.setNumberingStart(act.cnt.val, act.lvl);
	},
	
	setAttribute:function(target,act){
		
		var styleAtt = act.st;
		if(styleAtt) 
		{
			var type = styleAtt.type;
			if(!type) return;
			if(type == "backgroundColor")
			{
				target.setBackgroundColor(styleAtt.backgroundColor || 'none');// keep same with the method getAlign in ParagraphProperty.js
			}
			else if(type == "align")
			{
				target.setAlignment(styleAtt.align || 'left');// keep same with the method getAlign in ParagraphProperty.js
			}
			else if(type == "pageBreakBefore")
			{
				target.setPageBreakBefore(styleAtt.pageBreakBefore);
			}
			else if(type == "keepLines")
			{
				target.setKeepLines(styleAtt.keepLines);
			}
			else if(type == "widowControl")
			{
				target.setWidowControl(styleAtt.widowControl);
			}
			else if(type == "direction")
			{
				target.setDirection(styleAtt.direction||'none');
			}
			else if(type == "border")
			{
				target.setBorder(styleAtt.border||'none');
			}
			else if(type == "linespacing")
			{
				target.setLineSpacing(styleAtt.line||'none', styleAtt.lineRule||'none');
			}
			else if( type =="space")
			{
				if( styleAtt.before ){
					target.directProperty.setSpaceBefore( styleAtt.before );
					target.markDirty();
				}
				if( styleAtt.after ){
					target.directProperty.setSpaceAfter( styleAtt.after );
					target.markDirty();
				}
			}
			else if(type == "style")
			{
				if(!styleAtt.styleId || styleAtt.styleId == "none")
					target.removeStyle(target.styleId);
				else
					target.addStyle(styleAtt.styleId);
			}
			else if(type == "indent")
			{
				if(styleAtt.specialvalue || styleAtt.specialvalue == 0)
					target.setIndentSpecialTypeValue(styleAtt.specialkey, styleAtt.specialvalue);
				
				if(styleAtt.left || styleAtt.left == 0)
					target.setIndent(styleAtt.left, true);	// From undo
			}
			else if(type == "indentRight")
			{
				target.setIndentRight(styleAtt.right);
			}
			else if(type == 'numPr')
			{
				var list = target.list;
				if((styleAtt.numId == "") || ( styleAtt.numId && (styleAtt.numId == 'none')))// || styleAtt.numId == -1 ))
					target.removeList( styleAtt.numId == "none" );
				else if(!styleAtt.numId)
					target.setListLevel( styleAtt.ilvl,true);
				else
				{
					target.setList( styleAtt.numId, styleAtt.ilvl);
					list = target.list;
				}
			}
			else if(type == "pt")// pt is Paragraph text property.
			{
				var prop = target.paraTextProperty; 
				if(prop)
				{
					prop.fromJson( dojo.clone(styleAtt.s||{}) );
					if(target.isList())
						target.markReset();
					if( target.text ==""){
					//empty paragraph
						target.hints.forEach( function( hint ){
							var textProp = hint.textProperty;
							if( textProp ){
								textProp.fromJson( dojo.clone(styleAtt.s||{}) );
								hint.markDirty();
							}
						});
						target.markDirty();
					}
				}
				
			}else if(type == "cellColor"){
				target.changeStyle(styleAtt.t, styleAtt.v);
			}else if(type == "cnSt"){
				target.changeCSSStyleByValue(styleAtt.v);
				target.markReset();
				target.update();
//				console.log("set condition style");
			}else if(type == "secId"){
				// update insert new section
				var views = target.getRelativeViews("rootView");
				var paraView = views && views.getFirst();
			
				if (styleAtt.secId)
				{
					target.setSectionId(styleAtt.secId);
					if (paraView)
						dojo.publish(writer.EVENT.UPDATEINSERTSECTION,[paraView, styleAtt.secId]);
				}
				else
				{
					// remove section
					var originSecId = target.directProperty.getSectId();
					target.setSectionId(null);
					if (paraView)
						dojo.publish(writer.EVENT.UPDATEDELETESECTION,[paraView, originSecId]);
				}
			}
		}
		var attr = act.at;
		var cursorNoMerge = false;
		if( attr )
		{
			if( target.modelType == writer.MODELTYPE.LINK && ( attr.src || attr.anchor )) {
				(attr.src || attr.src == "") && ( target.src = attr.src );
				(attr.anchor || attr.anchor == "")&& ( target.anchor = attr.anchor );
				
				target.markDirty();
				target.paragraph.markDirty();
			}
			else if(writer.util.ModelTools.isImage(target))
			{
				// transform
				if (attr.transform)
				{
					if (attr.transform.anchor)
						target.setAnchor(attr.transform.anchor);
					else if (attr.transform.inline)
						target.setInline(attr.transform.inline);
				}
			
				// size
				if (attr.size)
					target.setSize(attr.size);
				
				// Description
				if(attr.descr)
					target.setDescription(attr.descr);
					
				// wrap type
				if (attr.wrapType)
					target.setAnchorWrapType(attr.wrapType);
				
				// square wrap text
				if (target.modelType == writer.MODELTYPE.SQIMAGE && attr.wrapText)
					target.setWrapText(attr.wrapText);
			}
			else if(writer.util.ModelTools.isTextBox(target))
			{
				if (attr.size)
					target.setSize(attr.size.extent, attr.size.spAutoFit, attr.size.autoWrap);
				
				if (target.modelType == writer.MODELTYPE.SQTXBX && attr.wrapText)
					target.setWrapText(attr.wrapText);
			}
			else if (writer.util.ModelTools.isCanvas(target))
			{
				if (attr.size)
					target.setSize(attr.size);
			}
			else if(target.modelType == writer.MODELTYPE.TABLE
					||target.modelType == writer.MODELTYPE.CELL
					||target.modelType == writer.MODELTYPE.ROW){
				console.log("TO DO : change attr of table...");
				cursorNoMerge = true;
				if(attr.rowSpan){
					target.markRowSpanChanged(attr.rowSpan);		
				}
					
				if(attr.colSpan){
					target.markColSpanChanged(attr.colSpan);
				}
					
				if(attr.cols && target.modelType == writer.MODELTYPE.TABLE){
					target.changeCols(attr.cols);
				}
				if(attr.rowH && target.modelType == writer.MODELTYPE.ROW){
					this.resizeHeight(target, attr.rowH);
				}
				if(attr.tblHeader && target.modelType == writer.MODELTYPE.ROW){
					this.setRepeatHead(target, attr.tblHeader);
				}
				if(attr.border && target.modelType == writer.MODELTYPE.CELL ){
					this.changeCellBorder(target, attr.border);
					// this.setCursorEditPosition( target, true );
				}
			}
			else if( writer.util.ModelTools.isBookMark( target ) && attr.name ){
				target.name = attr.name;
				target.markDirty();
				target.paragraph.markDirty();
			}
		}
		
		this.setCursorEditPosition( target, true, type != "indent" && type != "indentRight" && type != "align" && type != 'numPr'&& !cursorNoMerge);
	},
	setTextAttribute:function(target,act){
	//set style
		if(act.len == 0)	// OT with delete element will change length to 0.
			return;
		var runs;
		if(writer.util.ModelTools.isEmptyParagraph( target ))
			runs = target.hints;
		else
			runs = target.splitRuns(act.idx,  act.len );
		runs.forEach(function(run){
			run.setStyle( act.st );
		});
		this.addCursorRange( target, act.idx, target, act.idx + act.len );
		//merge runs if need 
		target.markDirty();
	},
	SetParaTask:function(target,act){
		//set taskid
		target.setTask(act.taskId);
		//target.markDirty();
	},
	insertSection: function(msgModel, act) {
		var setting = pe.lotusEditor.setting;
		if (!setting)
			console.log("msg handler insert section: cannot find setting.");

		var sect = new writer.model.Section(act.cnt);
		setting.insertSection(sect, act.idx);
	},
	
	deleteSection: function(msgModel, act) {
		pe.lotusEditor.setting.deleteSection(act.tid);
	},

	addComment:function(target,act){
		if(act.len == 0 && !act.cpid && !act.rid)
			return;
		
		if (!act.cpid)
			pe.lotusEditor.relations.commentService.addComment2ParaModel(target,act.cid,act.idx,act.idx+act.len, act.rid);
		var xcomment = pe.lotusEditor.relations.commentService.getXCommentItem(act.cid);
		
		if (xcomment.getItemCount() <= 0)
			return;

		// then to sync with comment sidebar,
		// here should call pe.scene.getSession().commentsProxy.msgReceived() with action="add" or "append" to sync the comments in sidebar
		var item = xcomment.getItem(0);
		var msg = {};

		if (!act.cpid) { // parent comment
			msg.isCtrl = true;
			msg.type = "comments";
			msg.action = "add";
			msg.id = act.cid;
			msg.index = xcomment.index;
			msg.data = xcomment;
			
			var msgList = [];
			msgList.push(msg);
			//pe.scene.session.sendMessage(msgList);
			pe.scene.getSession().commentsProxy.msgReceived(msg);
			
		//	this.addCursorRange( target, act.idx, target, act.idx + act.len );
			target.markDirty();
		} else { // append comment
			msg.isCtrl = true;
			msg.type = "comments";
			msg.action = "append";
			msg.id = act.cpid;
			msg.data = item;
			
			var msgList = [];
			msgList.push(msg);
			//pe.scene.session.sendMessage(msgList);
			pe.scene.getSession().commentsProxy.msgReceived(msg);
		}
	},
	insertText: function(target, act)
	{
		if(act.len == 0 && act.cnt.c && act.cnt.c.length > 0)	// OT with delete element will change length to 0.
			return;
		target.insertRichText(dojo.clone(act.cnt), act.idx);
		if( this.cmdId == "undo_enter"|| this.cmdId == "undo_pagebreak" || this.cmdId == "deleteKey" || this.cmdId == "backSpace")
		//merge paragraphs
			this.addCursorRange( target, act.idx );
		else if( this.cmdId =="undo_deleteAtCursor" )
			this.addCursorRange( target, act.idx );
		else if( this.cmdId =="undo_backSpace" )
			this.addCursorRange( target, act.idx + act.cnt.c.length );
		else if( act.cnt.c.length > 0 )
			this.addCursorRange( target, act.idx, target, act.idx + act.cnt.c.length );
	},
	
	deleteText: function(target, act)
	{
		if( act.oid && act.len == 0){
			var obj = target.byId( act.oid );
			if( obj ){
				target.removeObject(obj);
				target.markDirty();
			}
			
		}
		else{
			target.deleteText(act.idx, act.len);
			if( act.len > 0 )
				this.addCursorRange( target, act.idx );
		}
	},
	
	deleteElement: function( target, act ){
		var index = act.idx;
		var element = target.getByIndex(index), obj;
		if(!element)
			return;
		
		try{
			if( this.cmdId == "undo_enter" ||  this.cmdId =="deleteAtCursor" ){
				obj = target.previousChild( element );
				if( obj )
					this.setCursorEditPosition( obj, false );
			}
			else{
				obj = target.nextChild( element );
				if( obj ){
					this.setCursorEditPosition( obj, true );
				}
				else
				{
					obj = target.previousChild( element );
					if( obj )
						this.setCursorEditPosition( obj, false );
				}
			}
		}
		catch(e)
		{
			console.error("Set cursor position error in delete element: " + e);
		}
		target.remove(element);
	},
	
	insertElement: function( target, act )
	{
		try
		{
			var m = g_modelFactory.createModel(dojo.clone(act.cnt), target);
			var container = target.container;
			var index = 0;
			index = act.idx;
			if(index < 0 )
				return;
			
			var obj = container.getByIndex( index );
			
			if(target.insertBefore){
				if (!obj)
				{
					// defect 44657, when insert to the end of doc, we should reset the last para to reset the line space.
					var lastObj = container.getLast();
					if (lastObj && writer.util.ModelTools.isParagraph(lastObj))
						lastObj.markReset();
				}

				target.insertBefore( m, obj);
				
				// Defect 48135, reference from Enter key
				var mTool = writer.util.ModelTools;
				// Reset next paragraph
				if(mTool.isParagraph(obj) && mTool.isParagraph(m))
					obj.markReset();
				
				// Reset previous paragraph
				var next = mTool.getPrev( m, null, false );
				if(mTool.isParagraph(next))
					next.markReset();
				
				if( this.cmdId == "undo_deleteKey"){
					this.addCursorRange( m, 0, m, writer.util.ModelTools.getLength(m));
				}
				else if( target.modelType == writer.MODELTYPE.TOC ){
				//update toc
					this.addCursorRange( target, 0, target, writer.util.ModelTools.getLength(target));
				}
				else
					this.setCursorEditPosition( m, true );
			}else{
				console.error('target.insertBefore must be a function');
			}
		}
		catch( e )
		{
			console.error('wrong insertElement msg: ' + e);
		}
		
	},

	replaceKeyHandler: function(msgModel, act, isFromUndoRedo)
	{
		var path = act.path;
		if (!path){
			console.log("why no path?");
			return;
		}
		
		if(path == WRITER.KEYPATH.Section)
		{
			var targetSection = msgModel.getSection(act.k);
			if(targetSection)
			{
				var oldContentWidth = targetSection.pageSize.w - targetSection.pageMargin.left - targetSection.pageMargin.right;
				var oldColNum = targetSection.cols && targetSection.cols.num || 1;

				targetSection.init(act.c);

				var newContentWidth = targetSection.pageSize.w - targetSection.pageMargin.left - targetSection.pageMargin.right;
				var newColNum = targetSection.cols && targetSection.cols.num || 1;
				var relayoutBlock = oldContentWidth != newContentWidth || oldColNum != newColNum;

				//update the render
				if(path == WRITER.KEYPATH.Section && (act.c.pgMar || act.c.pgSz ))
				{
					// check cursor range
					try
					{
						var page = null;
						var selection = pe.lotusEditor.getSelection();
						if (selection){
							var ranges = selection.getRanges();
							var range = ranges && ranges[0];
							if (range){
								var startView = range.getStartView();
								if (startView)
								{
									if (startView.obj){
										startView = startView.obj;
									}
									vTools = writer.util.ViewTools;
									page = vTools.getPage(startView);
								}
							}
						}

						if (!page)
						{
							var scrollTop = pe.lotusEditor.getScrollPosition();
							page = pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
						}

						var that = this;
						var enterEditor = function()
						{
							pe.lotusEditor.undoManager.enterUndoRedo();	// Avoid send message.
							
							editShell.enterEditorMode(null, x, y);
							
							pe.lotusEditor.undoManager.exitUndoRedo();
							
							editShell.endSelect(null, x, y);
							that.cursorRanges = null;
							that.rootView = pe.lotusEditor.layoutEngine.rootView;
						};


						if (page)
						{
							var editShell = pe.lotusEditor.getShell();
							var x = page.getLeft();
							var y = page.getTop();
							var header = page.getHeader();
							var footer = page.getFooter();
							var headerType = page.getHeaderType();
							var footerType = page.getFooterType();

							var targetHeader = targetSection.getHeaderFooterByType(headerType);
							var targetFooter = targetSection.getHeaderFooterByType(footerType);

							if(isFromUndoRedo || pe.lotusEditor.isHeaderFooterEditing()){
								if (header && !targetHeader || footer && !targetFooter)
								{
									//console.log("message section enterEditorMode:x=" + x + ",y=" + y);
									enterEditor();
								}
								else if (!header && targetHeader)
								{
									writer.util.SectionTools.updateHFSelection(true, page.pageNumber);
								}
								else if (!footer && targetFooter)
								{
									writer.util.SectionTools.updateHFSelection(false, page.pageNumber);
								}
								else
								{
									console.log("!!!! not sec edit mode when apply section undo/redo msg");
								}
							}

							var selection = pe.lotusEditor.getSelection();
							var ranges = selection.getRanges();
							var range = ranges && ranges[0];
							if (range)
							{
								var sMod = range.getStartModel();
								var eMod = range.getEndModel();
								this.addCursorRange(sMod.obj, sMod.index, eMod.obj, eMod.index);
							}
						}
					}
					catch(e)
					{
						console.error("error in section replaceKeyHandler():" + e);
					}

					// update linked sections
					var setting = pe.lotusEditor.setting;
					for (var i = 0; i < setting.getSectionLength(); ++i)
					{
						var changedSec = setting.getSectionByIndex(i);
						var rootView = pe.lotusEditor.layoutEngine.rootView;
						if (rootView && rootView.updateSection){
							rootView.updateSection(changedSec, relayoutBlock);
						}
					}
				}
			}	
		}
	},
	insertRow:function( table, act ){
		var newRow = new writer.model.table.Row(act.cnt,table);
		var fixCells = act.fc;
		var target = null;
		var idx = act.idx-1;
		if(idx>=0){
			target = table.rows.getByIndex(idx);
		}
		table.insertRow(newRow,target,fixCells);
		table.update(true);
		this.setCursorEditPosition( newRow, true );
	},
	deleteRow:function( table, act ){
		var fixCells = act.fc;
		var target = null;
		var idx = act.idx;
		target = table.rows.getByIndex(idx);
		var cursorRow = target.next()||target.previous();
		table.deleteRow(target,fixCells);
		table.update();
		this.setCursorEditPosition( cursorRow, true );
	},
	_getCursorCell:function(colIdx,table){
		var sel = pe.lotusEditor.getSelection();
		var rowIdx = 0;	
		var tableMatrix = table.getTableMatrix();
		if(sel){
			var range = sel.getRanges()[0];
			var cursorRow = writer.util.ModelTools.getRow(range.getStartModel().obj);
			if(cursorRow && cursorRow.parent == table){
				rowIdx = cursorRow.getRowIdx();						
			}
		}
		return tableMatrix.getCell(rowIdx,colIdx)||tableMatrix.getCell(rowIdx,colIdx-1)||tableMatrix.getCell(rowIdx,colIdx+1);	
	},
	insertColumn:function(table,act){
		var idx = act.idx;
		var cells = act.cnt;
		var fixCells = act.fc;
		table.insertColumn(idx,cells,fixCells);
		table.update(true);
		var cursorObj = this._getCursorCell(idx,table)||table;
		this.setCursorEditPosition( cursorObj, true );
	},
	deleteColumn:function(table,act){
		var idx = act.idx;
		var cells = act.cnt;
		var fixCells = act.fc;
		table.deleteColumn(idx,cells,fixCells);
		table.update(true);
		var cursorObj = this._getCursorCell(idx,table)||table;
		this.setCursorEditPosition( cursorObj, true );
	},
	mergeCells:function(table,act){
		var startColIdx = act.sc;
		var startRowIdx = act.sr;
		var newRowSpan = act.nr;
		var newColSpan = act.nc;
		table.mergeCell(startColIdx,startRowIdx,newRowSpan,newColSpan);
		table.update();
		var tableMatrix = table.getTableMatrix();
		var cursorCell = tableMatrix.getCell(startRowIdx,startColIdx)||table;
		this.setCursorEditPosition( cursorCell, true );
	},
	splitCells:function(table,act){
		var startColIdx = act.sc;
		var startRowIdx = act.sr;
		var newRowSpan = act.nr;
		var newColSpan = act.nc;
		var cells = act.cnt;
		table.splitCell(startColIdx,startRowIdx,newRowSpan,newColSpan,cells);
		table.update();
		var tableMatrix = table.getTableMatrix();
		var cursorCell = tableMatrix.getCell(startRowIdx,startColIdx)||table;
		this.setCursorEditPosition( cursorCell, true );
	},
	resizeHeight:function(row,value){
		var newH = Math.round(common.tools.toPxValue(value));
		row.setHeight(newH);
		var table = row.parent;
		table.update();
	},
	changeCellBorder:function(cell,border){
		var pro = cell.getProperty();
		pro.initBorder(border);
		delete pro._borderCache;
		cell.clearAllCache && cell.clearAllCache();
		cell.markCheckBorder && cell.markCheckBorder();
		var relatedCells = cell.getTable().getTableMatrix().fixBorderMatrix();
		dojo.forEach(relatedCells,function(rCell){
			rCell.clearAllCache && rCell.clearAllCache();
			rCell.markCheckBorder && rCell.markCheckBorder();
			rCell.update();
		});
		cell.update();
	},
	setRepeatHead:function(row,value){
		row.setTblHeaderRepeat(value);
	},
	deleteNote:function(){
		var shell = layoutEngine.editor.getShell();
		var mode = shell.getEditMode();
		var sel = pe.lotusEditor.getShell().getSelection();
		var target = null;
		if(mode == EDITMODE.FOOTNOTE_MODE || mode== EDITMODE.ENDNOTE_MODE){
			var range = this.cursorRanges[0];
			var startView = range.getStartView();
			var page = writer.util.ViewTools.getPage(startView.obj);
			if(!page){
				return;
			}
			var body = page.getLastBody();
			var c = body.textArea && body.textArea.getContainer();
			if(c && c.length()>0 ){
				target = c.getFirst().model;
			}else{
				target = writer.util.ModelTools.getFirstChild( layoutEngine.rootModel, writer.util.ModelTools.isParagraph,true );
			}
			var range =  new writer.core.Range( {obj:{}}, {obj:{}});
			writer.util.RangeTools.selectToEditStart(range, target);
			range.collapse(true);
			this.cursorRanges = [range];
		}
		
	}
});

(function(){	
	if(typeof WRITER == "undefined")
		WRITER = {};
	if(typeof WRITER.MSG_HANDLER == 'undefined')
		WRITER.MSG_HANDLER = new writer.msg.MessageHandler();	
})();