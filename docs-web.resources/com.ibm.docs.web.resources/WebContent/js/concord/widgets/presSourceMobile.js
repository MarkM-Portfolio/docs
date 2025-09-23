dojo.provide("concord.widgets.presSourceMobile");
dojo.require("concord.widgets.presDnDManager");
dojo.require("concord.widgets.presSource");

dojo.declare("concord.widgets.presSourceMobile", [concord.widgets.presSource], {
	constructor: function(){
		//debugger;
		this.enableMltiSelect = false;
		this.enableDrag = false;
		this.startSlide = null;//record where drag start
		this.startSlideNumber = 0;//recored the slidenumber to modify the currentNode for judging which slide dragover
		
		this.timeOutForDrag = null;
		this.onTouchMoveEvent = null;
		this.firstSlidePos = dojo.position(this.node.firstChild);
		this.slideHeight = 106;
		this.slideGap = 15;
	},
	// touch event processors
	onTouchStart: function(e){
		console.log('touch start');
		this.current = e.currentTarget.parentNode;
		if (!this.enableMltiSelect) {
			this.startScrollTop = this.node.scrollTop;
			this.timeOutForDrag = setTimeout(dojo.hitch(this, function(){
				if(!this.timeOutForDrag) return;
				if(this.current.id == this.sorterObj.selectedSlide.parentNode.id && this.node.scrollTop == this.startScrollTop){
					//Clear dnd selection and reset slidesorter multiselects
					for(var i=0; i< this.sorterObj.multiSelectedSlides.length; i++){
						this.sorterObj.deselectSlide(this.sorterObj.multiSelectedSlides[i]);	
				    }
					this.sorterObj.multiSelectedSlides = [];
					this.sorterObj.selectSlide(this.current.childNodes[0]);
					
					this.selectNone();
					this.current.childNodes[0].style.borderColor = "#B0E2FF";
					clearTimeout(this.timeOutForDrag);
					this.timeOutForDrag = null;
				}
			}), 1000);
		}else{
			//register the touchmove event, if moved when enablemultiselect, start drag
			this.onTouchMoveEvent = dojo.connect(this.node, "ontouchmove", this, "onTouchMove");
		}
	},
	onTouchEnd: function(e){
		console.log('touch end');
		if(!this.enableMltiSelect){
			if(this.timeOutForDrag){
				clearTimeout(this.timeOutForDrag);
				this.timeOutForDrag = null;
			}else{
				this.enableMltiSelect = true;
			}
		}else{
			dojo.disconnect(this.onTouchMoveEvent);
			delete this.onTouchMoveEvent;
			dojo.style(this.node,{'overflow':'auto'});
			//only one selected and touch it when enablemultiselect, cancel multiselect
			if(this.current.id in this.selection && this.sorterObj.multiSelectedSlides.length == 1){
				this.enableMltiSelect = false;
				this.current.childNodes[0].style.borderColor = "#CFCFCF";
			}
		}
	},
	
	onTouchMove: function(e){
		console.log('touch move');
		if(this.enableDrag){
			e.preventDefault();
			this.onMouseMove(e);
			return;
		}
		//only on one selected slide can result dragging
		if(!this.enableDrag && (this.current.id in this.selection)){
			//record the message of the slide dragstart, the message will be used in on MouseMove
			this.startSlide = this.current;
			this.startSlideNumber = this.current.lastChild.children[0].innerHTML.substr(0, 1);
			this.current.slideNum = parseInt(this.startSlideNumber);
			this.enableDrag = true;
		}
		
	},
	// mouse event processors
	onMouseDown: function(e){
		console.log('onMouseDown');
		if(this.autoSync){ this.sync(); }
		if(!this.current){ return; }
		//having selected the current already
		if(!this.singular  && !this.enableMltiSelect && (this.current.id in this.selection)){
			this.simpleSelection = true;
			dojo.stopEvent(e);
			return;
		}
		if(this.singular){
			//this.singular?? not used in my work
			if(this.anchor != this.current){
				this.selectNone();
				this.anchor = this.current;
				this._addItemClass(this.anchor, "Anchor");
				this.selection[this.current.id] = 1;
			}
		}else{
			//Multiselect
			if(this.enableMltiSelect){
				//This is used for one scene to prevent the selection being cleared.
				if(this.sorterObj.multiSelectedSlides.length == 1 && this.current.id in this.selection){
					return;
				}
                if(this.anchor == this.current){
					delete this.selection[this.anchor.id];
					this._removeAnchor();
				}else{
					if(this.current.id in this.selection){
						this._removeItemClass(this.current, "Selected");
						delete this.selection[this.current.id];
					}else{
						if(this.anchor){
							this._removeItemClass(this.anchor, "Anchor");
							this._addItemClass(this.anchor, "Selected");
						}
						this.anchor = this.current;
						this._addItemClass(this.current, "Anchor");
						this.selection[this.current.id] = 1;
					}
				}
			}else{
				//single click
				if(!(this.current.id in this.selection)){
					this.selectNone();
					this.anchor = this.current;
					this._addItemClass(this.current, "Anchor");
					this.selection[this.current.id] = 1;
				}
			}
		}
		dojo.stopEvent(e);
	},

	onMouseMove: function(e){
		console.log('mouse move');
		dojo.setContext(window.CKEDITOR.instances.editor1.document.$, window.CKEDITOR.instances.editor1.document);
		if(this.isDragging && this.targetState == "Disabled"){ return; }
		dojo.dnd.Source.superclass.onMouseMove.call(this, e);
		var m = concord.widgets.presdndmanager();
		if(!this.isDragging){
			if( this.isSource ){
				var nodes = this.getSelectedNodes();
				if(nodes.length){
					m.startDrag(this, nodes, this.copyState(false, true));
				}
			}
		}
		if(this.isDragging){
			//scroll and Calculate the mousing over
			if ( e.touches.length > 0 ){
				var offsetHeight = this.slideHeight + this.slideGap;
				var officePrezDiv = this.node;
				var scroll = offsetHeight/4;
				var scrollTop = officePrezDiv.scrollTop;
				var curPos = e.touches[0].clientY;
				var divHeight = parseInt(dojo.style(this.node,'height'));
				s2 = Date.now();
				if(curPos < 0) {
					scrollTop -= scroll;
				}else if(curPos > divHeight){
					scrollTop += scroll;
				}
				var before = this.getCurrentTarget(curPos,scrollTop,offsetHeight);
				if(this.current != this.targetAnchor || before != this.before){
					this._markTargetAnchor(before);
					m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
				}
			}
		}
		dojo.setContext(window, window.document);
		e1 = Date.now();
	},
	
	onOverEvent: function(){
		// summary:
		//		this function is called once, when mouse is over our container
	},
	onOutEvent: function(){
		// summary:
		//		this function is called once, when mouse is out of our container
	},
	
	onDndCancel: function(){
//		jsObjCBridge.log("presSourceMobile-onDndCancel");
		// summary:
		//		topic event processor for /dnd/cancel, called to cancel the DnD operation
		if(this.targetAnchor){
			this._unmarkTargetAnchor();
			this.targetAnchor = null;
		}
		this.before = true;
		this.isDragging = false;
		this.mouseDown = false;
		this._changeState("Source", "");
		this._changeState("Target", "");
		// new temp release 
		//in desktop this will be done onmouseup
		if(this.startSlide){
			this.selectNone();
			this.current = this.startSlide;
			this.anchor = this.current;
			this._addItemClass(this.current, "Anchor");
			this.selection[this.current.id] = 1;
		}
		this.startSlide = null;
		this.enableMltiSelect = false;
		this.enableDrag = false;
		this.startSlideNumber = 0;
		
		this.timeOutForDrag = null;
		if(this.onTouchMoveEvent){
			delete this.onTouchMoveEvent;
			this.onTouchMoveEvent = null;
		}
	},
	/* find out which slide is current cursor position located in,since slidesorter will not be shown in horizontally, so we here just
	 * need to worry about vertical position calculation
	 * curPos current cursor position
	 * scrollTop current scrollbar vertical position
	 * offsetHeight one slide height,slide offsetHeight + margin between 2 slides
	 * return true if should drop before current slide, false vise versa
	*/
	getCurrentTarget: function(curPos,scrollTop,offsetHeight){
		//base on the current cursor postion and first slide position to caculate current target slide and drop position(before/after)
		var startSlidePos = this.slideGap;//distance between 2 slides
		var startPos = startSlidePos - scrollTop;//start position adjust with scroll position
		var change = curPos - startPos;//this time mouse move position change
		var curSlideNum = parseInt(change/offsetHeight) + 1;//current target slide number
		var remain = change%offsetHeight;//position in current slide,use to calculate drop position
		var maxSlideNum = pe.scene.slideSorter.slides.length;
		var before = true;
		var reachBottom;
		if(curSlideNum > maxSlideNum){
			curSlideNum = maxSlideNum;
			reachBottom = true;
		}
		if(this.current.slideNum != curSlideNum){
			this.current = this.current.parentNode.children[curSlideNum-1];
			this.current.slideNum = curSlideNum;
		}
		if(reachBottom)
			before = false;
		else if(remain > parseInt(this.slideHeight/2 + this.slideGap))
			before = false;
		
		return before;
	}
});