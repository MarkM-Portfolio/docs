dojo.provide("writer.view.text.RFootNoteView");
dojo.require("writer.model.text.RFootNote");
dojo.require("writer.view.Run");
/**
 * Foot Note mark in content. it may be a super or sub number.
 * */
dojo.declare("writer.view.text.RFootNoteView",[writer.view.Run],{
	constructor:function(model){
		if(!model) return;
		this.model = model;
		this.init();
//		this.start = this.model.start||0;
//		this.len = this.model.length||this.model.len||0;
//		this.seq = model.seq;
		dojo.subscribe(writer.EVENT.INSERTSECTION,this,this._handleInsertSect);
		dojo.subscribe(writer.EVENT.DELETESECTION,this,this._handleDeleteSect);		
	},
	getViewType:function(){
		return "text.RFootNote";
	},
	getSeqId:function(){
		return this.model.seqId;
	},
	setSeqId:function(id){
		this.model.setSeqId(id);
	},
	getId:function(){
		return this.model.id;
	},
	getStyle:function(){
		return this.model.getStyle();
	},
	setReferFn:function(fn){
		this.model.setReferFn(fn);
	},
	getReferFn:function(){
		return this.model.getReferFn();
	},
	canSplit: function(w,h, forceFit) {
		return false;
	},
	getElementPath:function(x,y,h,path,options){
		var index;
		var fixedX;
		if(x>this.w/2){
			index = 1;
			fixedX = this.w;
		}else{
			index = 0;
			fixedX = 0;
		}
		var run={"delX":fixedX-x,"delY":(h-this.h)-y,"index":index,"offsetX":fixedX,"lineH":h,"h":this.h};
		path.push(run);
	},
	getChildPosition:function(idx){
		var x = this.getLeft();
		var y = this.getTop();
		var isItalic = this.getComputedStyle()["font-style"] == "italic";
		if (idx == 0){
			return {'x':x,'y':y, "italic":isItalic};
		}else{
			return {'x':x+this.w,'y':y, "italic":isItalic};
		}		
	},
	getText:function(parent){
		return this._getText(this.getSeqId(),parent);
	},
	_getCurrentNotePr:function(parent){
		if(!this.parent){
			var page = writer.util.ViewTools.getPage(parent);
		}else{
			var page = writer.util.ViewTools.getPage(this);
		}		
		var sect = page&&page.getSection();
		return sect&&sect.getFootnotePr();
	},
	_getCurrentSectIdx:function(){
		var page = writer.util.ViewTools.getPage(this);
		var sect = page&&page.getSection();
		return sect&&pe.lotusEditor.setting.getSectionIndex(sect.id)||-1;
	},
	_getGNotePr:function(){
		return  pe.lotusEditor.setting.getFootnotePr();
	},
	_getText:function(seqId,parent){
		seqId = parseInt(seqId);
		var gNotePr = this._getGNotePr();
		var currentNotePr = this._getCurrentNotePr(parent);
		var format = currentNotePr&&currentNotePr.getFormat()||gNotePr&&gNotePr.getFormat();
		var start = 1;
		if(currentNotePr){
			start = currentNotePr.getStart();
		}else if(gNotePr){
			start = gNotePr.getStart();
		}
		if(currentNotePr&&currentNotePr.isRestart()){
			var referFn = this.getReferFn();
			if(!referFn){
				referFn = writer.util.ModelTools.getNotes(this.model);
			}
			if(referFn){
				seqId = pe.lotusEditor.relations.notesManager.indexOfCurrentSect(referFn,this.getViewType()=="text.RFootNote");
			}			
		}
		var index = seqId+start-1;
		if(format && index>0){
			return format.getValue(index).toString();
		}else{
			return index.toString();
		}
	},
	_wrapSpanForSuperSub:function(){
		var style = this.getComputedStyle();
		var wrapSpan = dojo.create("span", {
			"class": "run "
		});
		dojo.removeAttr(wrapSpan,'style');
		dojo.style(wrapSpan,"fontSize",style['font-size']);
		wrapSpan.appendChild(this.domNode);
		return wrapSpan;
	},
	render:function(){
		var strMargin = this._calLeftMarginCssStyle();
		this.domNode=  dojo.create("span", {
			"class": "run footnoteRefer "+this.getCSSStyle(),
			"style": (this.getStyleStr() + strMargin)
		});
		this.updateSeqId(this.getSeqId());
		return this._wrapSpanForSuperSub();
	},
	updateSeqId:function(id){
		var text = this._getText(id);
		if (dojo.isIE && dojo.isIE < 9) {
			this.domNode.innerText = text;
		} else {
			this.domNode.textContent = text;
		}
	},
	_handleInsertSect:function(index){
		var currIdx = this._getCurrentSectIdx();
		if(currIdx==-1){
			return ;
		}
		if(currIdx==index){
			this.markRelayout();
			var para = writer.util.ViewTools.getParagraph(this);
			if(para && !para.isDeleted()){
				para.model.markReset();
			}
			if(!this.getReferFn()){
				var referFn = writer.util.ModelTools.getNotes(this.model);
				referFn&&referFn.toBeUpdate();
			}
		}
	},
	_handleDeleteSect:function(index){
		var currIdx = this._getCurrentSectIdx();
		if(currIdx==-1){
			return ;
		}
		if(index==currIdx||index+1==currIdx){
			this.markRelayout();
			var para = writer.util.ViewTools.getParagraph(this);
			if(para && !para.isDeleted()){
				para.model.markReset();
			}
			if(!this.getReferFn()){
				var referFn = writer.util.ModelTools.getNotes(this.model);
				referFn&&referFn.toBeUpdate();
			}
		}
	}
	
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.RFOOTNOTE]=writer.view.text.RFootNoteView;