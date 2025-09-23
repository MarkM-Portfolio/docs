dojo.provide("mobile.util.MobileScroller");
dojo.declare("mobile.util.MobileScroller",null,{
	startY: null,
	startX: null,
	hasScroller: true,
	canScrollX: true,
	canScrollY: true,
	_scrollerX: null,
	_scrollerY: null,
	SCROLLER_WIDTH: 2,
	SCROLLER_HEIGHT: 2,
	constructor: function(hasScroller){
		this.hasScroller = hasScroller?true:false;
	},
	destroy: function(){
		this._scrollerX && dojo.destroy(this._scrollerX);
		this._scrollerY && dojo.destroy(this._scrollerY);
		this._scrollerX = null;
		this._scrollerY = null;
	},
	// let’s set the starting point when someone first touches
	touchstart: function(m,e){
		this.canScrollY = (m.scrollHeight <= m.clientHeight)?false:true;
		this.canScrollX = (m.scrollWidth <= m.clientWidth)?false:true;
		if(this.hasScroller){
			var pos = dojo.position(m);
			if(this.canScrollY && !this._scrollerY){
				this._scrollerY = dojo.create("div",{"class":"files_scrollbar","style":{
						width: this.SCROLLER_WIDTH+"px",
						height: (m.clientHeight/m.scrollHeight)*m.clientHeight+"px",
						position: "absolute",
						left: pos.x+m.clientWidth+"px",
						top: pos.y+(m.scrollTop/m.scrollHeight)*m.clientHeight+"px"
				}},dojo.doc.body);
			}
			if(this.canscrollX && !this._scrollerX){
				this._scrollerX = dojo.create("div",{"class":"files_scrollbar","style":{
						height: this.SCROLLER_HEIGHT+"px",
						width: (m.clientWidth/m.scrollWidth)*m.clientWidth+"px",
						position: "absolute",
						left: pos.x+(m.scrollLeft/m.scrollWidth)*m.clientWidth+"px",
						top: pos.y+m.clientHeight+"px"
				}},dojo.doc.body);
			}
		}
		this._scrollerY && dojo.style(this._scrollerY,"display","block");
		this._scrollerX && dojo.style(this._scrollerX,"display","block");
		this.startY = e.touches[0].pageY;
	    this.startX = e.touches[0].pageX;
	},
	// calls repeatedly while the user’s finger is moving
	touchmove: function(m,e){
		// override the touch event’s normal functionality
        e.preventDefault();
	    var touches = e.touches[0];
	    var pos = dojo.position(m);
	    // y-axis
	    if(this.canScrollY){
	    	var touchMovedY = this.startY - touches.pageY;
		    this.startY = touches.pageY; // reset startY for the next call
		    m.scrollTop = m.scrollTop + touchMovedY;
		    dojo.style(this._scrollerY,"top",pos.y+(m.scrollTop/m.scrollHeight)*m.clientHeight+"px");
	    }
	    
	    // x-axis
	    if(this.canScrollX){
	    	var touchMovedX = this.startX - touches.pageX;
		    this.startX = touches.pageX; // reset startX for the next call
		    m.scrollLeft = m.scrollLeft + touchMovedX;
		    dojo.style(this._scrollerX,"left",pos.x+(m.scrollLeft/m.scrollWidth)*m.clientWidth+"px");
	    }
	    
	},
	touchend: function(m,e){
		this._scrollerY && dojo.style(this._scrollerY,"display","none");
		this._scrollerX && dojo.style(this._scrollerX,"display","none");
	},
	//when scroll next time , the scrollers should be repainted
	resize: function(){
		this.destroy();
	},
	initMobileScroll: function(ele){
		if(!ele){
			return;
		}
		var mobileScrollArea = dojo.isString(ele)?document.getElementById(ele):ele;
		dojo.connect(mobileScrollArea,'ontouchstart',dojo.hitch(this,this.touchstart,mobileScrollArea));
		dojo.connect(mobileScrollArea,'ontouchmove',dojo.hitch(this,this.touchmove,mobileScrollArea));
		dojo.connect(mobileScrollArea,'ontouchend',dojo.hitch(this,this.touchend,mobileScrollArea));
	},

	initMobileScrollByCss: function(ele){
		if(!ele)
			return ;
		var mobileScrollArea = dojo.isString(ele)?document.getElementById(ele):ele;
		dojo.style(mobileScrollArea,"-webkit-overflow-scrolling","touch");
		dojo.style(mobileScrollArea,"overflow","auto");
	}
});
