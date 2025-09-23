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

/*
 * @presDnDManager.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presDnDManager");
dojo.require("dojo.dnd.Manager");

dojo.declare("concord.widgets.presDnDManager", [dojo.dnd.Manager], {
	constructor: function(){
		//debugger;
	},
	startDrag: function(source, nodes, copy){
		// summary:
		//		called to initiate the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		//console.log('presDnDManager: startDrag','******************* Setting dojo.doc to CKEDITOR Iframe *****************');
		dojo.setContext(window.CKEDITOR.instances.editor1.document.$.window, window.CKEDITOR.instances.editor1.document.$);
		
		this.source = source;
		this.nodes  = nodes;
		this.copy   = Boolean(copy); // normalizing to true boolean
		//console.log('presDnDManager: startDrag','***beforeMakeAvatar**');
		//console.log('presDnDManager: startDrag:nodes[0]'+this.nodes[0]);
		this.avatar = this.makeAvatar();
		//console.log('presDnDManager: startDrag','***afterMakeAvatar**');
		dojo.body().appendChild(this.avatar.node);
		var slide = dojo.query('.PM1_concord',this.avatar.node)[0];
	
		this.events = [
			dojo.connect(dojo.doc, "onmousemove", this, "onMouseMove"),
			dojo.connect(dojo.doc, "onmouseup",   this, "onMouseUp"),
			//For the floating micro pic when dragging
			dojo.connect(dojo.doc, "ontouchmove",   this, "onMouseMove"),
			//For putting the dragged node down
			dojo.connect(dojo.doc, "ontouchend",   this, "onMouseUp"),
			//dojo.connect(dojo.doc, "onkeydown",   this, "onKeyDown"),
			dojo.connect(dojo.doc, "onkeyup",     this, "onKeyUp"),
			// cancel text selection and text dragging
			dojo.connect(dojo.doc, "ondragstart",   dojo.stopEvent),
			dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent)
		];
		var c = "dojoDnd" + (copy ? "Copy" : "Move");
		dojo.addClass(dojo.body(), c);
		var aNode;
		if(slide!=null && this.avatar!=null && (aNode = this.avatar.node) !=null){
			var top,left;
			if(!concord.util.browser.isMobile()){
				top = slide.offsetTop;
				left = slide.offsetLeft;
			}else{
				top = source.firstSlidePos.y;
				left = source.firstSlidePos.x;
			}
			dojo.style(aNode,{
				'top':top,
				'left':left
			});	
		}
		dojo.publish("/dnd/start", [source, nodes, this.copy]);
	},
	
	canDrop: function(flag){
		// summary:
		//		called to notify if the current target can accept items
		var canDropFlag = Boolean(this.target && flag);
		if(this.canDropFlag != canDropFlag){
			this.canDropFlag = canDropFlag;
			this.avatar.update();
		}
	},
	/*
	stopDrag: function(){
		// summary:
		//		stop the DnD in progress
		dojo.removeClass(dojo.body(), "dojoDndCopy");
		dojo.removeClass(dojo.body(), "dojoDndMove");
		dojo.forEach(this.events, dojo.disconnect);
		this.events = [];
		this.avatar.destroy();
		this.avatar = null;
		this.source = this.target = null;
		this.nodes = [];
	},
	*/
	makeAvatar: function(){
		// summary:
		//		makes the avatar; it is separate to be overwritten dynamically, if needed
		return new dojo.dnd.Avatar(this);
	},

	stopDrag: function(){
		// summary:
		//		stop the DnD in progress
		//console.log("**PresDnDManager:stopDrag:start");
		dojo.removeClass(dojo.body(), "dojoDndCopy");
		dojo.removeClass(dojo.body(), "dojoDndMove");
		dojo.forEach(this.events, dojo.disconnect);
		this.events = [];
		if(this.avatar!=null){
			this.avatar.destroy();
		}
		this.avatar = null;
		this.source = this.target = null;
		this.nodes = [];
		
		// RESETTING DOJO DOC BACK TO MAIN WINDOW
		//console.log('presDnDManager: stopDrag','******************* Setting dojo.doc to Main Window *****************');
		dojo.setContext(window, window.document);
		//console.log("**PresDnDManager:stopDrag:end");
	}	
	
	
});
	
	//concord.widgets._presdndmanager:
	//The manager singleton variable. Can be overwritten if needed.
	concord.widgets._presdndmanager = null;
	
	concord.widgets.presdndmanager = function(){
		// summary:
		//		Returns the current DnD manager.  Creates one if it is not created yet.
		if(!concord.widgets._presdndmanager){
			concord.widgets._presdndmanager = new concord.widgets.presDnDManager();
		}
		return concord.widgets._presdndmanager;	// Object
	};

