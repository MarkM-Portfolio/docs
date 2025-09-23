/**
 * 
 */
dojo.provide("writer.ui.widget.TablePicker");

dojo.declare("writer.ui.widget.TablePicker",[dijit._Widget, dijit._Templated],{
	templateString: dojo.cache("writer.ui.widget", "templates/TablePicker.html"),
	unhighlightedNode:null,
	highlightedNode:null,
	statusNode:null,
	catcherNode:null,
	cellSize:18,
	defaultDimension:8,
	maxDimension:20,
	constructor:function(){
		// TODO  The table picker image need redesign by UX designer, because the image was referenced from Google Docs
		pe.scene.addResizeListener(dojo.hitch(this,this.reset));
	},
	focus:function(){
		dijit.focus(this.highlightedNode);
	},
	postMixInProperties:function(){
		this.setPositive();
	},
	buildRendering:function(){
		this.inherited(arguments);
	},
	onOpen: function(){
		this.inherited(arguments);		
		this.setPositive(true);
	},
	onClose:function(){
		this.reset();
		this.updateAll();
	},
	postCreate:function(){
		this.inherited(arguments);
		//init
		this.setStatus();
		this.setContainerNodeStyle();
		this.setCatcherNodeStyle();
		this.updateHighLightedStyle();
		this.updateUnHighLightedStyle();
		this.bindEvent();
	},
	onChange: function(/*===== value =====*/){
		// summary:
		//		Callback when a cell is selected.
		// value: String
		//		Value corresponding to cell.
	},
	_createTable: function(){
		var row = this.rowCount, col = this.colCount;
		this.reset();
		this.updateAll();
		
		this.onChange();
		setTimeout(function(){
			pe.lotusEditor.execCommand("createTable",[row, col]);
		}, 0);
	},
	
	bindEvent:function(){
		dojo.connect(this.containerNode,"onclick",this, "_createTable");
		dojo.connect(this.containerNode,"onkeydown",this,function(e){
			switch(e.keyCode){
				case 37:this.colCount-=1;break;
				case 38:this.rowCount-=1;break;
				case 40:this.rowCount+=1;break;
				case 39:this.colCount+=1;break;
				case 13:
				case 32:
					this._createTable();
					dojo.stopEvent(e);
					return;
				default: return null;
			}
			this.updateAll(true);
			dojo.stopEvent(e);
		});
	},
	updateAll:function(bAnnounce){
		this.setPositive(bAnnounce);
		this.setStatus();
		this.updateHighLightedStyle();
		this.updateUnHighLightedStyle();
	},
	reset:function(){
		//reset all status.
		this.colCount=1;
		this.rowCount=1;
		delete this.containerOffsetLeft ;
		delete this.containerOffsetTop;
	},
	setStatus:function(){
		this.statusNode.innerHTML = this.rowCount + " x " + this.colCount;
	},
	setPositive:function(bAnnounce){
		if(!this.nls)
			this.nls = dojo.i18n.getLocalization("writer","lang");
		this.rowCount = this.rowCount || 1;
		this.colCount = this.colCount || 1;

		var reachedMax = false;
		if(this.rowCount>this.maxDimension){
			this.rowCount = this.maxDimension;
			reachedMax = true;
		}
		if( this.colCount>this.maxDimension){
			this.colCount = this.maxDimension;
			reachedMax = true;
		}
		if(bAnnounce){
			var accStr = dojo.string.substitute(this.nls.ACC_TABLE_TABLESIZE,[this.rowCount, this.colCount]);
			if(reachedMax){
				accStr =  this.nls.ACC_TABLE_MAXSIZE;
			}	
			pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(accStr);
		}
		
	},
	loadContainerOffset:function(){
		if(!this.containerOffsetLeft || !this.containerOffsetTop){
			var pop = this.domNode.parentNode;
			var left = pop && pop.style["left"];
			var top = pop && pop.style["top"];
			if(!left || !top){
				console.error("position error.");
			}
			this.containerOffsetLeft = Number(left.replace("px",""));
			this.containerOffsetTop = Number(top.replace("px",""));
		}
	},
	setContainerNodeStyle:function(){
		dojo.style(this.containerNode,"width",this.defaultDimension+"em");
	},
	setCatcherNodeStyle:function(){
		dojo.style(this.catcherNode,{"width":this.maxDimension+"em","height":this.maxDimension+"em"});
	},
	updateHighLightedStyle:function(){
		dojo.style(this.highlightedNode,{"width":this.colCount+"em","height":this.rowCount+"em"});
	},
	updateUnHighLightedStyle:function(){
		var deltaWithRowMax = (this.maxDimension - this.rowCount) && 1;
		var deltaWithColMax = (this.maxDimension - this.colCount) && 1;
		if(this.rowCount>=this.defaultDimension-1){
			dojo.style(this.unhighlightedNode,"height",this.rowCount+deltaWithRowMax+"em");
		}else{
			dojo.style(this.unhighlightedNode,"height", this.defaultDimension+"em");
		}
		if(this.colCount>=this.defaultDimension-1){
			dojo.style(this.containerNode,"width",this.colCount+deltaWithColMax+"em");
			dojo.style(this.unhighlightedNode,"width",this.colCount+deltaWithColMax+"em");
		}else{
			dojo.style(this.containerNode,"width",this.defaultDimension+"em");
			dojo.style(this.unhighlightedNode,"width",this.defaultDimension+"em");
		}
	},
	onMouseMove:function(e){
		this.loadContainerOffset();
		var actualX = e.clientX - this.containerOffsetLeft - Number (this.containerNode.style.paddingLeft.replace("px",""));
		var actualY = e.clientY - this.containerOffsetTop - Number(this.containerNode.style.paddingTop.replace("px",""));
		
		this.colCount = Math.ceil(actualX/this.cellSize);
		this.rowCount = Math.ceil(actualY/this.cellSize);
		
		this.updateAll();
	}
});
