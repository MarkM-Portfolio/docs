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
 * @presSource.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presSource");
dojo.require("concord.widgets.presDnDManager");

dojo.declare("concord.widgets.presSource", [dojo.dnd.Source], {
	constructor: function(){
		//debugger;
		this.sorterObj = window.pe.scene.slideSorter;
	},
	sorterObj: null,
	copyState: function(keyPressed, self){
		// summary:
		//		Returns true if we need to copy items, false to move.
		//		It is separated to be overwritten dynamically, if needed.
		// keyPressed: Boolean
		//		the "copy" key was pressed
		// self: Boolean?
		//		optional flag that means that we are about to drop on itself
		
		// to disable copy/paste in D&D
		return false;
		
		if(keyPressed){ return true; }
		if(arguments.length < 2){
			self = this == concord.widgets.presdndmanager().target;
		}
		if(self){
			if(this.copyOnly){
				return this.selfCopy;
			}
		}else{
			return this.copyOnly;
		}
		return false;	// Boolean
	},
	
	
	getSelectedNodes: function(){
		// summary:
		//		returns a list (an array) of selected nodes
		var t = new dojo.NodeList();
		var e = dojo.dnd._empty;
		for(var i in this.selection){
			if(i in e){ continue; }
			t.push(dojo.byId(i));
		}
		var isSlideWrapper =true;
		this.sorterObj.sortMultiSelectedSlides(t,isSlideWrapper);
		return t;	// NodeList
	},

	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove
		// e: Event
		//		mouse event
		//console.log("***presSource:onMouseMove:this.current:"+this.current);
		if(this.isDragging && this.targetState == "Disabled"){ 
			return; 
		}
		dojo.setContext(window.CKEDITOR.instances.editor1.document.$.window, window.CKEDITOR.instances.editor1.document.$);
		
		dojo.dnd.Source.superclass.onMouseMove.call(this, e);
		var m = concord.widgets.presdndmanager();
		if(!this.isDragging){
			if(this.mouseDown && this.isSource &&
					(Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay)){
				
				var count = 0;
				for(var x in this.selection)
				{
					if(this.selection[x] === 1)
						count ++;
				}
				
				var myselectCount = 0;
				dojo.forEach(this.sorterObj.multiSelectedSlides, dojo.hitch(this, function(s)
				{
					var id = s.parentNode.id;
					if(this.selection[id])
						myselectCount ++;
				}));
				
				if(myselectCount == count)
				{
					this.selection = {};
					dojo.forEach(this.sorterObj.multiSelectedSlides, dojo.hitch(this, function(s)
					{
						var id = s.parentNode.id;
						this.selection[id] = 1;
					}));
				}
				
				console.log("***presSource:onMouseMove:this.getSelectedNodes:"+this.getSelectedNodes());
				var nodes = this.getSelectedNodes();
				if(nodes.length){
					m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e), true));
				}
			}
		}
		if(this.isDragging){
			// calculate before/after
			var before = false;
			if(this.current){
				if(!this.targetBox || this.targetAnchor != this.current){
					this.targetBox = dojo.position(this.current, true);
				}
				if(this.horizontal){
					before = (e.pageX - this.targetBox.x) < (this.targetBox.w / 2);
				}else{
					before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
				}
			}
			if(this.current != this.targetAnchor || before != this.before){
				this._markTargetAnchor(before);
				console.log("**PresSource:onMouseMove:isDragging after markTargetAnchor");
				m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
				console.log("**PresSource:onMouseMove:isDragging after m.candrop");
			}
			
			if(dojo.isIE)
			{
				// IE11
				m.onMouseMove(e);
			}
		}
		dojo.setContext(window, window.document);
		
	},
	
	onMouseUp: function(e)
	{
		this.inherited(arguments);
		if(dojo.isIE)
		{
			// IE11
			var m = concord.widgets.presdndmanager();
			m.onMouseUp(e);
		}
	},
	
	// topic event processors
	onDndSourceOver: function(source){
		// summary:
		//		topic event processor for /dnd/source/over, called when detected a current source
		// source: Object
		//		the source which has the mouse over it
		//console.log("**PresSource:onDndSourceOver:start");
		if(this != source){
			this.mouseDown = false;
			if(this.targetAnchor){
				this._unmarkTargetAnchor();
			}
		}else if(this.isDragging){
			var m = concord.widgets.presdndmanager();
			m.canDrop(this.targetState != "Disabled" && (!this.current || m.source != this || !(this.current.id in this.selection)));
		}
		//console.log("**PresSource:onDndSourceOver:end");
	},
	
	onDndStart: function(source, nodes, copy){
		// summary:
		//		topic event processor for /dnd/start, called to initiate the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		if(this.autoSync){ this.sync(); }
		if(this.isSource){
			this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		var accepted = this.accept && this.checkAcceptance(source, nodes);
		this._changeState("Target", accepted ? "" : "Disabled");
		if(this == source){
			concord.widgets.presdndmanager().overSource(this);
		}
		this.isDragging = true;
	},
	onDndDrop: function(source, nodes, copy, target){
		// summary:
		//		topic event processor for /dnd/drop, called to finish the DnD operation
		// source: Object
		//		the source which provides items
		// nodes: Array
		//		the list of transferred items
		// copy: Boolean
		//		copy items, if true, move items otherwise
		// target: Object
		//		the target which accepts items
		console.log("presSource:onDndDrop")
		if(this == target){
			// this one is for us => move nodes!
			this.onDrop(source, nodes, copy);
			var params = [source, nodes, copy];
			dojo.publish("/dnd/drop/after", params);
		}
		this.onDndCancel();
	},
	// utilities
	onOverEvent: function(){
		// summary:
		//		this function is called once, when mouse is over our container
		//console.log("**PresSource:onOverEvent:start");
		dojo.dnd.Source.superclass.onOverEvent.call(this);
		concord.widgets.presdndmanager().overSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOver();
		}
		//console.log("**PresSource:onOverEvent:end");
	},
	
	onOutEvent: function(){
		// summary:
		//		this function is called once, when mouse is out of our container
		//console.log("**PresSource:onOutEvent:start");
		dojo.dnd.Source.superclass.onOutEvent.call(this);
		concord.widgets.presdndmanager().outSource(this);
		if(this.isDragging && this.targetState != "Disabled"){
			this.onDraggingOut();
		}
		//console.log("**PresSource:onOutEvent:end");
	},
	_markTargetAnchor: function(before){
		// summary:
		//		assigns a class to the current target anchor based on "before" status
		// before: Boolean
		//		insert before, if true, after otherwise
		dojo.setContext(window.CKEDITOR.instances.editor1.document.$.window, window.CKEDITOR.instances.editor1.document.$);
		if(this.current == this.targetAnchor && this.before == before){ return; }
		if(this.targetAnchor){
			this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
			var imgDropPos = dojo.query(this.before ? ".dndDropPosBefore" : ".dndDropPosAfter");
			//console.log("***presSource:marktargetAnchor: imgDropPos:"+imgDropPos.length);
			imgDropPos.forEach(dojo.destroy);
			imgDropPos = dojo.query(this.before ? ".dndDropPosBefore" : ".dndDropPosAfter");
			//console.log("***presSource:imgDropPos:"+imgDropPos.length);
		}
		this.targetAnchor = this.current;
		this.targetBox = null;
		this.before = before;
		if(this.targetAnchor){
			this._addItemClass(this.targetAnchor, this.before ? "Before" : "After");
			//create an image for drop position
			var imgDropPos=dojo.create("img",{src: window.contextPath + window.staticRootPath + "/images/insertLocation.png"},this.current);
			dojo.addClass(imgDropPos,this.before ? "dndDropPosBefore" : "dndDropPosAfter");
		}
		//console.log("***presSource:marktargetAnchor: before dojo to window doc");
		dojo.setContext(window, window.document);
		//console.log("**PresSource:markTargetAnchor:end");
	},
	_unmarkTargetAnchor: function(){
		// summary:
		//		removes a class of the current target anchor based on "before" status
		dojo.setContext(window.CKEDITOR.instances.editor1.document.$.window, window.CKEDITOR.instances.editor1.document.$);
		if(!this.targetAnchor){ return; }
		this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		var imgDropPos = dojo.query(this.before ? ".dndDropPosBefore" : ".dndDropPosAfter");
		//console.log("***presSource:unmarkTargetAnchor: imgDropPos:"+imgDropPos.length);
		imgDropPos.forEach(dojo.destroy);
		imgDropPos = dojo.query(this.before ? ".dndDropPosBefore" : ".dndDropPosAfter");
		//console.log("***presSource:after Destroy: imgDropPos:"+imgDropPos.length);
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
		dojo.setContext(window, window.document);
		//console.log("**PresSource:_unmarkTargetAnchor:end");
	}
	
});
