dojo.provide("writer.controller.LayoutEngine");
dojo.require("writer.model.Settings");
dojo.require("writer.model.Relations");
dojo.require("writer.model.Numbering");
dojo.require("writer.model.style.Styles");
dojo.require("writer.controller.UpdateManager");
dojo.require("writer.controller.IndicatorManager");

if (!controller){
	controller = {};
}
controller.LayoutEngine = function(editor){
	this.editor = editor;
	this.init();
};
controller.LayoutEngine.prototype={
	init:function(){
		this.initEnv();
	},
	start:function(){
		dojo.publish(writer.EVENT.BEFORE_LOAD);
//		console.profile("Load");
//		var t1 = new Date();
		this.loadDocument();
//		console.profileEnd();
//		console.profile("layout");
//		var t2 = new Date();
		this.layoutDocument();
//		var t3 = new Date();
		this.renderDocument();
//		var t4 = new Date();
//		console.info("load time: "+(t2-t1));
//		console.info("layout time: "+(t3-t2));
//		console.info("render time: "+(t4-t3));
		
		setTimeout(function(){
			dojo.publish(writer.EVENT.FIRSTTIME_RENDERED);
		}, 200);
		
//		console.profileEnd();
/*		if(!this.editor.inPartialLoading)
		{
			setTimeout(function(){
				dojo.publish(writer.EVENT.LOAD_READY);
			},0);
		}
*/	
	},
	initEnv:function(){
		//double check IE11 because dojo.isIE doesn't work with IE11
		if(!dojo.isIE)
			dojo.isIE = common.tools.isIE11();
	},
	loadDocument:function(){
		// Use this flag to check if style has load finished. 
		// Avoid other place waiting the STYLE_LOADED event.
		this.styleLoaded = false;
		var docJson = this.editor.source;
		this.editor.indicatorManager = new writer.controller.IndicatorManager();
		this.editor.relations = new writer.model.Relations(docJson.relations);
		this.editor.number = new writer.model.Numbering(docJson.numbering);		
		this.editor.styles = new writer.model.style.Styles(docJson.style);		
		this.editor.styles.createCSSStyle();
		dojo.publish(writer.EVENT.STYLE_LOADED);
		
		this.editor.setting = new writer.model.Settings(docJson.setting);
		
		concord.util.browser.isMobile() && concord.util.mobileUtil.viewport.init(this.editor.setting.getMaxSectionPageWidth()+20);
		this.editor.updateManager = new writer.controller.UpdateManager();
		this.editor.relations.loadContent();
		this.editor.document = this.rootModel = new writer.model.Document(docJson.content, this);
		this.styleLoaded = true;
		this.editor.source = null;
	},
	layoutDocument:function(){
		this.rootView = this.rootModel.preLayout("rootView");
		dojo.subscribe(writer.EVENT.UPDATEDELETESECTION,this.rootView,"deleteSection");
		dojo.subscribe(writer.EVENT.UPDATEINSERTSECTION,this.rootView,"insertSection");
		dojo.publish(writer.EVENT.PREMEASURE);
		this.rootView.layout(null,null,true);
	},
	renderDocument:function(){
		this.rootView.render();
		if(this.rootView.pages.length()==0){
			this.rootView.addPage();
		}
		
		this.editor.removePlaceHolder();
	},
	partialLayout:function(){
		var len = 4;
		var totalLen = this._getDataSouceLen();
		for(var i=0;i< totalLen;i=i+len){
			var e = this._getPartialDataSource(i, len);
			this.rootModel.append(e);
		}
	},
	_getPartialDataSource:function(begin, len){
		var ret = [];
		for(var i=0;i<len&&i<this._getDataSouceLen();i++){
			ret.push(this.editor.source.content[i]);
		}
		return ret;
	},
	_getDataSouceLen:function(){
		return this.editor.source.content.length;
	}
};
