/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("html.widgets.SlideSorter");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("viewer.util.Events");

dojo.declare(
	"html.widgets.SlideSorter",
	[dijit._Widget, dijit._Templated],
	{
		size: 0,
		slides: [],
		tabIndex: 0, 
		
		viewManager: null,
		selectedIndex:-1,
		templateString:
		'<div class="dijit" dojoAttachPoint="thumbnailContainer"  tabIndex="${tabIndex}" style="overflow-y:scroll;height:100%" dojoAttachEvent="onscroll: _onScroll,">' +
		'</div>',

		
		postCreate: function(){
			dojo.subscribe(viewer.util.Events.PAGE_SELECTED, this, this._onPageSelected);
			this.inherited(arguments);
		},
		
		createContent: function(start){
			var slideWraper;
			if (!start)
				start = 1;
			for (var i = start; i <= this.size; i++){
				//imgWidth = imgHeight= this.thumbWidth;
				slideWraper = dojo.create('div', {id:'slideWraper_'+i,
					onclick: dojo.hitch(this, this._onThumbnailClicked, i),
					onmouseover: dojo.hitch(this, this._onMouseOver, i),
					onmouseout: dojo.hitch(this, this._onMouseOut, i)
					}, this.thumbnailContainer);
				dojo.addClass(slideWraper,'slideWrapper geckoss dojoDndItem dojoDndItemAnchor');
			}
			this.thumbnailContainer.scrollTop=0;
			this.calculateCurrentPage();
		},

		//Load the slides {1....index}
		loadSlides: function(index){
			for(var i=1;i<=index;i++)
			{
				var slideWrapper=dojo.byId('slideWraper_'+i);
				var slideUtilDivQueries = dojo.query(".slideUtil", slideWrapper);
				if(slideUtilDivQueries.length<=0)
				{
					slideWrapper.innerHTML=this.slides[i-1];
					//add id
					var slideUtilDiv = document.createElement("div");
	                dojo.addClass(slideUtilDiv, "slideUtil");
	                dijit.setWaiState(slideUtilDiv,'hidden','true');
	                var slideNumberDiv = document.createElement("div");
	                dojo.addClass(slideNumberDiv, "slideNumber");
	                slideNumberDiv.innerHTML=i;
	                slideUtilDiv.appendChild(slideNumberDiv);
//	                var slideTransitionIconDiv = document.createElement("div");
//	                var transitionIcon = this.getTransitionType(slideWrapper.children[0]);
//	                dojo.addClass(slideTransitionIconDiv, transitionIcon);
//	                slideUtilDiv.appendChild(slideTransitionIconDiv);
	                slideWrapper.appendChild(slideUtilDiv);
				}
			}
		},
		
		getPageStartOffset: function(i){
			if (i<=1)
				return 0;
			else
				return 100*(i-1) + (15+6) * i-3; // 12 selected margin.
		},
		
		getPageEndOffset: function(i){
			if (i < 1)
				return 0;
			else
				return 100*i + (15+6) * i + 12; // 12 selected margin.
		},
		
		//Calc the current page.
		calculateCurrentPage: function(){			
			if (this.size == 0)
				return;
			var scrollTop = this.thumbnailContainer.scrollTop;
			var containerHeight = this.thumbnailContainer.offsetHeight;
			for(var i=this.size;i>0;i--)
			{
				var currentPageEndOffset = this.getPageEndOffset(i);
				var currentPageStartOffset = this.getPageStartOffset(i); 
				//all slides height is less than container height,load them all.
				if(scrollTop+containerHeight>=currentPageEndOffset)
				{
					this.loadSlides(i);
					break;
				}
				if(scrollTop+containerHeight>=currentPageStartOffset&&scrollTop+containerHeight<=currentPageEndOffset)
				{
					this.loadSlides(i);
					break;
				}
			}
		},
		
	    getTransitionType: function(slide){
	        var smil_type = dojo.attr(slide, 'smil_type');
	        var smil_subtype = dojo.attr(slide, 'smil_subtype');
	        var smil_direction = dojo.attr(slide, 'smil_direction');
	        if (smil_direction == null) {
	            smil_direction = "none";
	        }

	        if (smil_type == "none") {
	            smil_type = null;
	        }

	        var transitionToUse = "slideTransitions_none";

	        if(!smil_type){
	            return transitionToUse;
	        }

	        if (smil_type == "slideWipe") {
	            if (smil_subtype == "fromTop") {
	                transitionToUse	= "slideTransitions_coverDown";
	            } else if (smil_subtype == "fromRight") {
	                transitionToUse	= "slideTransitions_coverLeft";
	            } else if (smil_subtype == "fromBottom") {
	                transitionToUse	= "slideTransitions_coverUp";
	            } else if (smil_subtype == "fromLeft") {
	                transitionToUse	= "slideTransitions_coverRight";
	            }
	        } else if (smil_type == "pushWipe") {
	            if (smil_subtype == "fromTop") {
	                transitionToUse	= "slideTransitions_pushDown";
	            } else if (smil_subtype == "fromRight") {
	                transitionToUse	= "slideTransitions_pushLeft";
	            } else if (smil_subtype == "fromBottom") {
	                transitionToUse	= "slideTransitions_pushUp";
	            } else if (smil_subtype == "fromLeft") {
	                transitionToUse	= "slideTransitions_pushRight";
	            }
	        } else if (smil_type == "fade") {
	            transitionToUse	= "slideTransitions_fadeSmoothly";
	        } else if (smil_type == "barWipe") {
	            if (smil_subtype == "topToBottom" && smil_direction == "none") {
	                transitionToUse	= "slideTransitions_wipeDown";
	            } else if (smil_subtype == "leftToRight" && smil_direction == "none") {
	                transitionToUse	= "slideTransitions_wipeRight";
	            } else if (smil_subtype == "topToBottom" && smil_direction == "reverse") {
	                transitionToUse	= "slideTransitions_wipeUp";
	            } else if (smil_subtype == "leftToRight" && smil_direction == "reverse") {
	                transitionToUse	= "slideTransitions_wipeLeft";
	            }
	        } else {
	            transitionToUse	= "slideTransitions_notSupported";
	        }
	        return transitionToUse;
	    },
		updatePage:function(index)
		{
			if(index-1==this.selectedIndex)
				return;
			
			this.loadSlides(index);
			if(this.selectedIndex>=0){
				var currentWrapper=dojo.byId('slideWraper_'+(this.selectedIndex+1));
				var currentSlide=dojo.query(".draw_page",currentWrapper)[0];
				dojo.removeClass(currentSlide,'slideSelected');
			}
			var updateSlideContainer=dojo.byId('slideWraper_'+index);
			var updateSlide=dojo.query(".draw_page",updateSlideContainer)[0];
			this.selectedIndex=index-1;
			var con=dojo.byId("normalView");
			//var content=dojo.clone(updateSlide);
			dojo.addClass(updateSlide,'slideSelected');
			var slides_pages=dojo.query(".draw_page",con);
			for(var i=0;i<slides_pages.length;i++)
			{
				con.removeChild(slides_pages[i]);
			}
			//con.appendChild(content);
			con.innerHTML=this.slides[this.selectedIndex].replace(/id=\"/ig,"id=\"ve_");
			var content=dojo.query(".draw_page",con)[0];
			dojo.style(content,'border','1px solid #000000');
			dojo.style(content,'cursor','default');
			dojo.style(content,'overflow','visible');
			dojo.forEach(content.children, function(child){
				if(dojo.getAttr(child,'presentation_class')=='notes')
				{
					dojo.style(child,'display','none');
				}
			});
			this.viewManager.setUIDimensions();
			//whether to call scrollIntoView
			
			var scrollTop = this.thumbnailContainer.scrollTop;
			var containerHeight = this.thumbnailContainer.offsetHeight;
			var currentPageEndOffset = this.getPageEndOffset(index);
			var currentPageStartOffset = this.getPageStartOffset(index); 
			if(scrollTop+containerHeight<=currentPageEndOffset)
			{
				this.thumbnailContainer.children[index-1].scrollIntoView(false);
			}
			else if(currentPageStartOffset<scrollTop)
			{
				this.thumbnailContainer.children[index-1].scrollIntoView(true);
			}
		},
		_onThumbnailClicked: function(i,e){
			//this.updatePage(i);
			this.viewManager.setCurrentPage(i);
			e.preventDefault();
		},
		_onScroll: function(){
			this.calculateCurrentPage();
		},
		_onPageSelected: function(i){
			this.updatePage(i);
			console.log("Selected Page "+this.selectedIndex);
		}
	});