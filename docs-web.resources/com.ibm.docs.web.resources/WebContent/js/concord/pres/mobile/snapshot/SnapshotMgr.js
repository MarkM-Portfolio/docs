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

 
 dojo.provide("concord.pres.mobile.snapshot.SnapshotMgr");
 dojo.require("concord.util.mobileUtil");
 dojo.declare("concord.pres.mobile.snapshot.SnapshotMgr",null,{
	 
	 sWidth:null,		// each slide width default
	 sHeight:null,		// each slide height default
	 sPointX:null,		// the start X of capture area
	 sPointY:null,		// the start Y of capture area
	 cntRow:null,
	 cntCol:null,
	 cntMax:null,
	 slideSorterContainer:null,
	 dirtySlides:null,			// all slides are dirty at the loading and each updated slide will be set dirty.Sort it before use it.
	 slidesorter:null,
	 totalSlidesNum:null,		// TODO: get total number of document event partial load.
	 _uptSlideTimer:null,		// for slide update e.g. textbox move,resize and kick preSnapshot.
	 							// stop snapshot when keyboard show up
	 							// stop snapshot when UI interaction.
	 sorterClientHeight:0,
	 sorterClientWidth:0,
	 constructor:function(slidesorter){
		 this.slidesorter = slidesorter;
		 this.slideSorterContainer = dojo.byId(slidesorter.currentScene.slideSorterContainerId);
		 this.dirtySlides = [];
		 // events
		 //dojo.subscribe(concord.util.events.slideSorterEvents,null,dojo.hitch(this,this.handleSubscriptionEventsForSorter));
	 },
	 
	 startUptSlideTimer:function(interval){
		 clearTimeout(this._uptSlideTimer);
		 this._uptSlideTimer = setTimeout(dojo.hitch(this,this.preStart),interval);
	 },
	 stopUptSlideTimer:function(){
		 clearTimeout(this._uptSlideTimer);
	 },
	 /**
	  * 
	  * @param sIdx 0 base
	  * @param bShow
	  */
	 updateSlide:function(sIdx,bShow){			 
		 if(sIdx>=0){
			 this._addDirtySlide(sIdx, "u", null, bShow);
		 }
	 },
	 /**
	  * insertSlide is a special kind of update.
	  * we need to keep syn between js slides array and native slides array in real time.
	  * and the each slide update can not be blocked and do it delay for better performance. 
	  * @param sIdx 0 base
	  * @param bShow
	  */
	 insertSlide:function(sIdx,transitionName,bShow,bNotUIChange){
		if(sIdx>=0){
			if(!bNotUIChange)
	    		concord.util.mobileUtil.insSlide(sIdx);
			console.log("insert slide:"+sIdx);
			this._updateDirtySlideIdx(sIdx, 1); // plus 1
			this._addDirtySlide(sIdx, "u", transitionName, bShow);
		}
	 },
	 /**
	  * update all dirtySlide's sIdx
	  * @param sIdx
	  */
	 deleteSlide:function(sIdx,bNotUIChange){
		 if(!bNotUIChange)
			 concord.util.mobileUtil.delSlide(sIdx);
		 this._updateDirtySlideIdx(sIdx, -1); // minus 1 
	 },
	 
	 moveSlide:function(sIdx,eIdx){
       	this.deleteSlide(sIdx,true);
        this.insertSlide(eIdx,null,true,true);
	 },
	 /**
	  * when add new slide or delete on slide,
	  * need to update all sIdx which stored in dirty slide array
	  * @param sIdx
	  * @param offset 1 means insert a slide, -1 means delete a slide
	  */
	 _updateDirtySlideIdx:function(sIdx,offset){
		for(var i=0;i<this.dirtySlides.length;i++){
			var item = this.dirtySlides[i];
			if(item.sIdx > sIdx){
				item.sIdx = item.sIdx + offset;
			}else if (item.sIdx == sIdx){
				if(offset>0)
					item.sIdx = item.sIdx + offset;
				else if(offset<0)
					this.dirtySlides.splice(i, 1);
			}else{
				break;
			} 
		}		 
	 },
	 
	 getDirtyLength:function(){
		return this.dirtySlides.length; 
	 },
	 /**
	  * base 0
	  * Keep the dirty slide array always as a sort array.
	  * and the length 
	  * @param sNum
	  */
	 _addDirtySlide:function(sIdx,action,transitionName,bShow){
		//console.log("add dirty idx:"+sIdx);
		// insertion sort
		var len = this.dirtySlides.length;
		var first = this.dirtySlides[0];
		var last = this.dirtySlides[len - 1];
		var sId = this.slidesorter.getIdbyIdx(sIdx);
		var bDone = false;
		if(len == 0 || sIdx < last.sIdx){ // just need push it
			var item ={
					sIdx:sIdx,
					sId:sId,
					sTs:transitionName,
					act:action
			};
			this.dirtySlides.push(item);
		}else if(sIdx > first.sIdx){ // need concat it.
			var item ={
					sIdx:sIdx,
					sId:sId,
					sTs:transitionName,
					act:action
			};
			var tmpArray = [item];
			this.dirtySlides = tmpArray.concat(this.dirtySlides);
		}else if(sIdx == last.sIdx){ // equal, need replace it
			last.act = action;
			last.sId = sId;
		}else if(sIdx == first.sIdx){
			first.act = action;
			first.sId = sId;
		}else{
			var tmpArray = [];
			for(var i=0;i<len;i++){
				var item = this.dirtySlides[i];
				if(item.sIdx>sIdx || bDone == true)
					tmpArray.push(item);
				else if(item.sIdx<sIdx){
					var newItem ={
							sIdx:sIdx,
							sId:sId,
							sTs:transitionName,
							act:action
					};
					tmpArray.push(newItem);
					tmpArray.push(item);
					bDone = true;
				}else if(item.sIdx == sIdx){ // just need replace it and break out.
					item.act = action;
					item.sId = sId;
					tmpArray = this.dirtySlides;
					break;
				}
			}
			this.dirtySlides = tmpArray;
		}
		
		this._normalizeSlideSize(this.slidesorter.slides[sIdx]);
		if(bShow){
			this.showSlide(sIdx);
		}
	 },
	 
	 /**
	  * in the case the slide's height has exceed the screen, 
	  * we need zoom it.
	  * @param slide
	  */
	 _normalizeSlideSize:function(slide){
		 var sh = slide.offsetHeight;
		 if(sh > this.getSorterClientHeight()){
			 var sw = slide.offsetWidth;
			 var ratio = sh/sw;
			 var sHeight = this.getSorterClientHeight();
			 var sWidth = sHeight*sw/sh;
			 dojo.style(slide,'width',sWidth + 'px');
			 dojo.style(slide,'height',sHeight + 'px');
		 }
	 },
	 
	 _removeDirtySlide:function(sIdx,bHide){
		for(var i in this.dirtySlides){
			var slide  = this.dirtySlides[i];
			if(slide.sIdx == sIdx)
				this.dirtySlides.splice(i, 1);
		} 
		if(bHide){
			this.hideSlide(sIdx);
		} 
	 },
	
	 /**
	  * we can't get the wrapper div's position directly from the iframe.
	  * @returns
	  */
	 getSPointX:function(){
		 if(this.sPointX == null){
			 this.sPointX = this.slideSorterContainer.getBoundingClientRect().left 
			 	+ this.slidesorter.slides[0].getBoundingClientRect().left;
		 }
		 return this.sPointX;
	 },
	 
	 getSPointY:function(){
		 if(this.sPointY == null){
			this.sPointY = this.slideSorterContainer.getBoundingClientRect().top  
				+ this.slidesorter.slides[0].getBoundingClientRect().top;
		 }
		 return this.sPointY;
	 },
	 
	 getSlideWidth:function(){
		 if(this.sWidth == null){
			 var firstSlide = this.slidesorter.slides[0];
			 this.sWidth = dojo.style(firstSlide,'width');
		 }
		 return this.sWidth;
	 },
	 
	 getSlideHeight:function(){
		 if(this.sHeight == null){
			 var firstSlide = this.slidesorter.slides[0];
			 this.sHeight = dojo.style(firstSlide,'height');
		 }
		 return this.sHeight;
	 },
	 
	 getCntRow:function(){
		 //if(this.cntRow == null){
			 /**
			  * .presMobile div.office_presentation {
    				height: 600px;
					}
				when the first slide represent the height of presDiv has not been init so that 
				we hard code here
			  */
			this.cntRow = Math.floor(this.slidesorter.officePrezDiv.parentNode.clientHeight/this.getSlideHeight());
			//this.cntRow = Math.floor(600/this.getSlideHeight());
		 //}
		 return this.cntRow;
	 },
	 
	 getCntCol:function(){
		if(this.cntCol == null){
			this.cntCol = Math.floor(this.getSorterClientWidth()/this.getSlideWidth());
		} 
		return this.cntCol;
	 },
	 
	 getCntMax:function(){
		 //if(this.cntMax == null){
			 this.cntMax = this.getCntCol()*this.getCntRow();
		 //}
		 return this.cntMax;
	 },
	 
	 getSorterClientHeight:function(){
		if(this.sorterClientHeight == 0){
			this.sorterClientHeight = this.slidesorter.officePrezDiv.parentNode.clientHeight;
		} 
		return this.sorterClientHeight;
	 },
	 
	 getSorterClientWidth:function(){
		if(this.sorterClientWidth == 0){
			this.sorterClientWidth = this.slidesorter.officePrezDiv.parentNode.clientWidth;
		} 
		return this.sorterClientWidth;
	 },
	 handleSubscriptionEventsForSorter:function(e){
		 if(e.eventName == concord.util.events.slideSorterEvents_eventName_slidesLoaded){
			console.log("slideSorterEvents_eventName_slidesLoaded");
			this.preStart();
		 }
	 },
	 /**
	  * to notify Native to snpashot and the start function will be called 
	  */
	 preStart:function(){
		 clearTimeout(this._uptSlideTimer);
		 concord.util.mobileUtil.snapPreStart();
		 
		 // below for test
		 //if(concord.util.browser.isMobile() == true && _isMobile == false){
			 //console.log("start to snapshot");
			 //var message = this.start();
			 //this.finish(message);
		 //}
	 },
	 /**
	  * For syn:
	  * After snapPreStart event Native will call this to do snapshot.
	  * And it returns how many slides in Sorter need to be snapshot,
	  * 
	  * Message:
	  * {dirty:[{act:"n",sIdx:2,sId:"abc3232"}...],h:100,w:100,sx:10,sy:10,cntr:3,cntc:5]}
	  */
	 start:function(){
		 var dirtySlides = [];
		 var slideIds = [];
		 var maxSnapCnt = this.getCntMax();

		 for(var i=0,len=this.dirtySlides.length;i<len&&i<maxSnapCnt;i++){
			 var item = this.dirtySlides.pop();
			 dirtySlides.push(item);
			 //this.showSlide(item.sIdx);
		 }
		 
		 var message = {
				 h:this.getSlideHeight(),
				 w:this.getSlideWidth(),
				 sx:this.getSPointX(),
				 sy:this.getSPointY(),
				 cntr:this.getCntRow(),
				 cntc:this.getCntCol(),
				 dirty:dirtySlides
		 };
		 //console.log(message);
		 return dojo.toJson(message);
	 },
	 /**
	  * When Native snapshot finished, js sorter need to hide the slides.
	  * And do snapshot until all Slides finished.
	  */
	 finish:function(message,bRetry){
		 var msg;
		 try{
			 msg = dojo.fromJson(message);
		 }catch(e){
			 msg = message; 
		 }
		 var dirtySlides = msg.dirty;
		 for(var i = 0,len = dirtySlides.length;i<len;i++){
			 if(bRetry){
				 this._addDirtySlide(dirtySlides[i].sIdx, dirtySlides[i].act, false);
			 }else
				 this.hideSlide(dirtySlides[i].sIdx);
		 }
		 if(this.dirtySlides.length>0){
			 this.preStart();
			//setTimeout(dojo.hitch(this,this.preStart()),1000);
		 }else{
			 
		 }
	 },
	 /**
	  * reset all slide to snapshot
	  */
	 reset:function(){		 
		 for(var len = this.slidesorter.slides.length - 1;len>=0;len--){
			 this.updateSlide(len, true);
		 }
		 
		 this.preStart();
	 },
	 hideSlide:function(sIdx){
		 if(sIdx >= 0)
			 dojo.style(this.slidesorter.slides[sIdx],'display','none');
	 },
	 showSlide:function(sIdx){
		 if(sIdx >= 0)
			 dojo.style(this.slidesorter.slides[sIdx],'display','');
	 },
	 /**
	  * Native tableViewCell touch to notify js Sorter's handleOnclickEvt event to switch slide. 
	  */
	 slideTouch:function(sIdx){
	 	if(sIdx != null){
	 		//TODO: update dirty slide if the click slide is dirty.
	 		var event = {
	 				currentTarget:this.slidesorter.slides[sIdx]
	 		};
	 		this.slidesorter.handleOnclickEvt(event);
	 	}
		 
	 }
 });
 