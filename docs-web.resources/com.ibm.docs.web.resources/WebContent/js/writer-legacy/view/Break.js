dojo.provide("writer.view.Break");
dojo.require("writer.view.Run");
dojo.declare("writer.view.Break",[writer.view.Run],
{
	PAGETYPE : {
		PAGE:"page",
		LINE:"textWrapping",
		COLUMN:"column"
	},
	w:0,
	h:0,
	type:null,
	constructor: function(model,ownerId, start,len) {
		this.type = model.br && model.br.type || this.PAGETYPE.LINE;
		this.init(start, len);
	},
	getViewType: function(){
		if (this.type == this.PAGETYPE.PAGE){
			return "text.PageBreak";
		}
		return 'text.LineBreak';
	},
	getChildPosition:function(idx){
		var pos = this.inherited(arguments);		
		pos.x =  this.getLeft() + (0 == idx ? 0 : this.getWidth());
		return pos;
	},
	layout:function(line){
		//get height,width as simple run
		this.inherited(arguments);
		if (this.type == this.PAGETYPE.PAGE){
			this.w = line.w + line.paddingLeft - line.offsetX;
			if (this.w<50){
				this.w = 50;
			}
		}
	},
	canSplit: function() {
		return false;
	},
	canFit:function(w,h){
		return true;
	},
	isSpace: function(){
		return true;
	},
	getText:function(){
		return "";
	},
	render:function(){
		if(!this.domNode ||this.dirty){
			delete this.dirty;
			var w =this.w;
			if (this.type == this.PAGETYPE.PAGE){
				this.domNode = dojo.create("div", {
					"class": this.type+'break',
					"style": "width:"+w+"px;"
				});
			}else{
//				this.domNode = dojo.create("div", {
//					"class": this.type+'break',
//					"style": "width:0px;height:0px;display:none;"
//				});
				this.domNode = dojo.create("div",{"class":"carriageNode " + this.type+'break'});
				var enterCharNode = document.createTextNode("\u2193");
				this.domNode.appendChild(enterCharNode);
			}
			
		}else if(this.type == this.PAGETYPE.PAGE){
			this.domNode.style.cssText = "width:"+this.w+"px;";
		}
		
		return this.domNode;
	},
	getElementPath:function(x,y,h,path,options){
		var index = 0, fixedX = 0;
		if( this.type != this.PAGETYPE.LINE ){
		//#36296
			index = x < this.getWidth() * 0.5 ? 0 : 1;
			fixedX = this.getWidth();
		}
		
		var run={"delX":fixedX-x,"delY":(h-this.h)-y,"index":index,"offsetX":fixedX,"lineH":h,"h":this.h};
		path.push(run);
	}
}
);