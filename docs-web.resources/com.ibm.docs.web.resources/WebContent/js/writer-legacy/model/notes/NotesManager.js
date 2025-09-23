dojo.provide("writer.model.notes.NotesManager");
writer.model.notes.NotesManager = function(){
	pe.lotusEditor.editorHandlers.push( dojo.subscribe(writer.EVENT.UPDATEFNREFERID,this,"updatenotesReferSeqId") );
	pe.lotusEditor.editorHandlers.push( dojo.subscribe(writer.EVENT.BEGINUPDATEDOCMODEL,this,"beginRecord") );
	pe.lotusEditor.editorHandlers.push( dojo.subscribe(writer.EVENT.ENDUPDATEDOCMODEL,this,"endRecord") );
	this.fnPreservedInfo = [];
	this.enPreservedInfo = [];
	this.fnRecyle = {};
	this.enRecyle = {};
	this.endNoteChange = false;
	this.footnotes = [];
	this.endnotes = [];
};
writer.model.notes.NotesManager.prototype={
	byId:function(id){
		for(var i=0;i< this.footnotes.length;i++){
			if(!this.footnotes[i].byId){
				console.error("the function byId must be implement!");
				continue;
			}
			var ret = this.footnotes[i].byId(id);
			if(ret){
				return ret;
			}
		}
		for(var i=0;i< this.endnotes.length;i++){
			if(!this.endnotes[i].byId){
				console.error("the function byId must be implement!");
				continue;
			}
			var ret = this.endnotes[i].byId(id);
			if(ret){
				return ret;
			}
		}
	},
	createFootNotes:function(footJson){
		if(footJson&&footJson.length>0){
			this.footnotes = [];
			for(var i=0;i<footJson.length;i++){
				var fn = new writer.model.notes.FootNote(footJson[i]);
				if(fn.type&&fn.type.length>0){
					this.fnPreservedInfo.push(fn);
				}else{
					this.footnotes.push(fn);
				}				
			}
		}
		return this.footnotes;
	},
	createEndNotes:function(endJson){
		if(endJson&&endJson.length>0){
			this.endnotes = [];
			for(var i=0;i<endJson.length;i++){
				var en = new writer.model.notes.EndNote(endJson[i]);
				if(en.type&&en.type.length>0){
					this.enPreservedInfo.push(en);
				}else{
					this.endnotes.push(en);
				}
				
			}
		}
		return this.footnotes;
	},
	restoreNotes:function(refer,note,isFootnote){
		if(isFootnote){
			var exist = this.getFootNoteById(refer.getId());
			var notes = this.footnotes;
			var insertFn = this.insertFootnote;
			var preserveLen = this.fnPreservedInfo.length;
		}else{
			var exist = this.getEndNoteById(refer.getId());
			var notes = this.endnotes;
			var insertFn = this.insertEndnote;
			var preserveLen = this.enPreservedInfo.length;
		}
		var index = this._getnotesReferIndex(refer, notes);
		var id = index+1;
		note.setSeqId(id);
		refer.setSeqId(id);
		if(exist){
//			exist.setSeqId(id);
//			refer.setReferFn(exist);
//			exist.setReferer(refer);
		}else{
			refer.setReferFn(note);
			note.setReferer(refer);
		}	
		if(	!exist){
			insertFn.apply(this,[note,index+preserveLen,true]);
		}		
		return true;
	},
	getFootNoteById:function(fId){
		if(this.footnotes){
			for(var i=0;i< this.footnotes.length;i++){
				var fn = this.footnotes[i];
				if(fn.getId()==fId){
					return fn;
				}
			}
		}
		return null;
	},
	getEndNoteById:function(eId){
		if(this.endnotes){
			for(var i=0;i< this.endnotes.length;i++){
				var en = this.endnotes[i];
				if(en.getId()==eId){
					return en;
				}
			}
		}
		return null;
	},
	getFnIndex:function(fn){
		return this.footnotes.indexOf(fn)+this.fnPreservedInfo.length;
	},
	getEnIndex:function(endnote){
		return this.endnotes.indexOf(endnote)+this.enPreservedInfo.length;
	},
	getFootnotesByIndex:function(index){
		index = index - this.fnPreservedInfo.length;
		if(index<0){
			return null;
		}
		return this.footnotes[index];
	},
	getEndnotesByIndex:function(index){
		index = index - this.enPreservedInfo.length;
		if(index<0){
			return null;
		}
		return this.endnotes[index];
	},
	getAllEndNoteView:function(){
		if(!this.endnotes||this.endnotes.length==0){
			return null;
		}
		var c = new common.Container(this);
		for(var i=0;i< this.endnotes.length;i++){
			var en = this.endnotes[i];
			var view = en.getMergedView();
			view&&c.append(view);
		}
		return c;
	},
	getEndNoteViewInSect:function(sect){
		if(!this.endnotes||this.endnotes.length==0){
			return null;
		}
		var c = new common.Container(this);
		for(var i=0;i< this.endnotes.length;i++){
			var en = this.endnotes[i];
			var firstView = en.getFirstView();
			var refer = firstView.getReferer();
			var page = refer&&writer.util.ViewTools.getPage(refer);
			if(page&&page.getSection()==sect){
				c.append(en.getMergedView());
			}
		}
		return c;
	},
	bindingRefer:function(fnRefer,guard){
		if(guard==writer.util.ViewTools.isRFootnote){
			var notes = this.footnotes;
			var notesRecyle = this.fnRecyle;
			var insertFn = this.insertFootnote;
			var preserveLen = this.fnPreservedInfo.length;
		}else{
			var notes = this.endnotes;
			var notesRecyle = this.enRecyle;
			var insertFn = this.insertEndnote;
			var preserveLen = this.enPreservedInfo.length;
		}
		if(notes&&notes.length>0){
			for(var i=0;i< notes.length;i++){
				var fn = notes[i];
				if(fn.getId()==fnRefer.getId()){
					var id = i+1;
					fn.setSeqId(id);
					fnRefer.setSeqId(id);
					fn.setReferer(fnRefer);
					return true;
				}				
			}			
		}
//		if(fnRefer.getId()){
//			var fn = notesRecyle[fnRefer.getId()];
//			if(fn){
//				fn.setReferer(fnRefer);
//				var index = this._getnotesReferIndex(fnRefer,notes);
//				var id = index+1;
//				fn.setSeqId(id);
//				fn.resetView();
//				fnRefer.setSeqId(id);
//				insertFn.apply(this,[fn,index+preserveLen,true,true]);
//				return true;
//			}				
//		}else{
			console.error("something error for the footnotes");
			return false;
//		}
		
	},
	updatenotesReferSeqId:function(){
		if(this.footnotes&&this.footnotes.length>0){
			for(var i=0;i< this.footnotes.length;i++){
				var fn = this.footnotes[i];
				var id = i+1;
				fn.updateSeqId(id);
			}
		}
		if(this.endnotes&&this.endnotes.length>0){
			for(var i=0;i< this.endnotes.length;i++){
				var en = this.endnotes[i];
				var id = i+1;
				en.updateSeqId(id);
			}
		}
	},
	beginRecord:function(){
		this.updatenotesReferSeqId();
	},
	endRecord:function(){
		
	},
	_getFnIndexByRefer:function(fnRefer){
		for(var i=0;i< this.footnotes.length;i++){
			var myRefer = this.footnotes[i].getReferer();
			if(myRefer&&(myRefer==fnRefer||myRefer==fnRefer.model)){
				return i;
			}
		}
	},
	_getEnIndexByRefer:function(enRefer){
		for(var i=0;i< this.endnotes.length;i++){
			var myRefer = this.endnotes[i].getReferer();
			if(myRefer&&(myRefer==enRefer||myRefer==enRefer.model)){
				return i;
			}
		}
	},
	deleteEndnotesByRefer:function(enRefer,sendMessage){
		var index = this._getEnIndexByRefer(enRefer);
		console.info("delete the endnotes ferfer:"+index);
		var en = this.endnotes[index];
		if(sendMessage){
			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createDeleteElementAct( en )],WRITER.MSGCATEGORY.Endnotes ) );			
		}
		this.recordChangedEndnotes(en);
		this.endnotes.splice(index, 1);
		this.enRecyle[en.id] = en;
		en.releaseRefer();
	},
	deleteFootnoteByRefer:function(fnRefer,sendMessage){
		var index = this._getFnIndexByRefer(fnRefer);
		console.info("delete the footnotes ferfer:"+index);
		var fn = this.footnotes[index];
		if(sendMessage){
			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createDeleteElementAct( fn )],WRITER.MSGCATEGORY.Footnotes ) );			
		}
		this.footnotes.splice(index, 1);
		this.fnRecyle[fn.id] = fn;
		fn.releaseRefer();
	},
	insertFootnote:function(fn,index,sendMessage){
		for(var i=0; i< this.footnotes.length;i++){
			if(this.footnotes[i].getId()==fn.getId()){
				return;
			}
		}
		this.footnotes.splice(index-this.fnPreservedInfo.length, 0, fn);
		delete this.fnRecyle[fn.getId()];
		if(sendMessage){
			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( fn )],WRITER.MSGCATEGORY.Footnotes ) );		
		}
		
	},
	insertEndnote:function(en,index,sendMessage){
		for(var i=0; i< this.endnotes.length;i++){
			if(this.endnotes[i].getId()==en.getId()){
				return;
			}
		}
		this.endnotes.splice(index-this.enPreservedInfo.length, 0, en);
		delete this.enRecyle[en.getId()];
		if(sendMessage){
			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( en )],WRITER.MSGCATEGORY.Endnotes ) );		
		}
		this.recordChangedEndnotes(en);
	},
	deleteFootnote:function(index,sendMessage){
//		if(sendMessage){
//			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createDeleteElementAct( fn )],WRITER.MSGCATEGORY.Footnotes ) );			
//		}
//		this.footnotes.splice(index-this.fnPreservedInfo.length,1);
	},
	deleteEndnote:function(index,sendMessage){
//		if(sendMessage){
//			WRITER.MSG.sendNotesMessage( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createDeleteElementAct( fn )],WRITER.MSGCATEGORY.Endnotes ) );			
//		}
//		this.endnotes.splice(index-this.fnPreservedInfo.length,1);
	},
	_getnotesReferIndex:function(fnRefer,notes){
		fnRefer = fnRefer.model||fnRefer;
		var referPara = writer.util.ModelTools.getParagraph(fnRefer);
		var referParaPath = writer.util.ModelTools.getParagraphPath(referPara);
		var index = notes.length;
		for(var i=0;i< notes.length;i++){
			var fn = notes[i].getReferer();
			if(!fn ){
				return i;
			}
			fn = fn.model||fn;
			var para = writer.util.ModelTools.getParagraph(fn);
			var paraPath = writer.util.ModelTools.getParagraphPath(para);
			var compareRet = common.tools.arrayCompare(referParaPath, paraPath);
			if(compareRet>0){
				continue;
			}else if(compareRet==0){
				while(fn&&fn.parent==referPara&&fn.start<fnRefer.start){
					i++;
					fn = notes[i];
					fn = fn&&(fn.getReferer());
					fn = fn&&(fn.model||fn);
				}
				index = i;
				break;
			}else{
				index = i;
				break;
			}
		}
		return index;
	},
	_getReferPage:function(footnote){
		var refer  = footnote.getReferer();
		var viewers = refer&&refer.getAllViews();
		if(viewers){
			var firstView = viewers.rootView.getFirst();
			return writer.util.ViewTools.getPage(firstView);
		}
	},
	indexOfCurrentSect:function(footnote,isfootnote){
		if(isfootnote){
			var notes = this.footnotes;
		}else{
			var notes = this.endnotes;
		}
		var page =this._getReferPage(footnote);
		if(!page){
			return 0;
		}
		var sect = page.getSection();
		var prevSect = sect;
		var currentIdx = notes.indexOf(footnote);
		var prevfootnote = footnote;
		var firstFootnote = footnote;
		while(currentIdx>0 ){
			currentIdx--;
			prevfootnote = notes[currentIdx];
			var page = this._getReferPage(prevfootnote);
			if(!page){
				return 0;
			}
			prevSect = page.getSection();
			if(prevSect == sect){
				firstFootnote = prevfootnote;
			}else{
				break;
			}
		}
		return footnote.getSeqId()-firstFootnote.getSeqId()+1;
	},
	nextNote:function(note,isFootnote){
		if(isFootnote){
			var index = this.footnotes.indexOf(note);
			return this.footnotes[index+1];
		}else{
			var index = this.endnotes.indexOf(note);
			return this.endnotes[index+1];
		}
	},
	previousNote:function(note,isFootnote){
		if(isFootnote){
			var index = this.footnotes.indexOf(note);
			return this.footnotes[index-1];
		}else{
			var index = this.endnotes.indexOf(note);
			return this.endnotes[index-1];
		}
	},
	recordChangedEndnotes:function(endnote){
		var endnotePr = pe.lotusEditor.setting.getEndnotePr();
		if(endnotePr&&!endnotePr.isEndSect()){
			this.endNoteChange = true;
		}
	},
	updateChangedNotes:function(){
		if(this.footnotes&&this.footnotes.length>0){
			for(var i=0;i< this.footnotes.length;i++){
				var fn = this.footnotes[i];
				if(fn.needToUpdate()){
					fn.update(true);
					delete fn._toupdate;
				}
			}
		}
		if(this.endnotes&&this.endnotes.length>0){
			for(var i=0;i< this.endnotes.length;i++){
				var en = this.endnotes[i];
				if(en.needToUpdate()){
					en.update(true);
					delete en._toupdate;
				}
			}
		}
	}
};