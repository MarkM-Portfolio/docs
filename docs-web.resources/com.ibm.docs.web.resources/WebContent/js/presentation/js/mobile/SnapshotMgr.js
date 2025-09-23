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

 
 dojo.provide("pres.mobile.SnapshotMgr");
 dojo.require("pres.mobile.mobileUtilAdapter");
 
 dojo.declare("pres.mobile.SnapshotMgr",null,{
	 
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
	 
	 constructor:function(){
		 this.dirtySlides = [];
		 this.slidesorter = pe.scene.slideSorter;
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
			this._updateDirtySlideIdx(sIdx, 1); // plus 1
			this._addDirtySlide(sIdx, "u", transitionName, bShow);
		}
	 },
	 /**
	  * update all dirtySlide's sIdx
	  * @param sIdx
	  */
	 deleteSlide:function(sIdx,bNotUIChange){
		 return;
		 if(!bNotUIChange)
			 concord.util.mobileUtil.delSlide(sIdx);
		 this._updateDirtySlideIdx(sIdx, -1); // minus 1 
	 },
	 
	 moveSlide:function(sIdx,eIdx){
		return;
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
		var sId = pe.scene.doc.slides[sIdx].wrapperId;
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
		//var thumbContent = pe.scene.slideSorter.getChildren()[sIdx].content;
		//this._normalizeSlideSize(thumbContent);
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
		 var sh = slide.clientHeight;
		 if(sh > this.getSorterClientHeight()){
			 var sw = slide.clientWidth;
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
			 var firstThumb = pe.scene.slideSorter.getChildren()[0];
			 var firstThumbContent = firstThumb.content;
			 this.sPointX = dojo.position(firstThumbContent).x;
		 }
		 return this.sPointX;
	 },
	 
	 getSPointY:function(){
		 if(this.sPointY == null){
			var firstThumb = pe.scene.slideSorter.getChildren()[0];
			var firstThumbContent = firstThumb.content;
			this.sPointY = dojo.position(firstThumbContent).y;
		 }
		 return this.sPointY;
	 },
	 
	 getSlideWidth:function(){
		 if(this.sWidth == null){
			 var firstThumb = pe.scene.slideSorter.getChildren()[0];
			 var firstThumbContent = firstThumb.content;
			 this.sWidth = dojo.style(firstThumbContent, "width");
		 }
		 return this.sWidth;
	 },
	 
	 getSlideHeight:function(){
		 if(this.sHeight == null){
			 var firstThumb = pe.scene.slideSorter.getChildren()[0];
			 var firstThumbContent = firstThumb.content;
			 this.sHeight = dojo.style(firstThumbContent, "height");
		 }
		 return this.sHeight;
	 },
	 
	 getCntRow:function(){
		 var firstThumb = pe.scene.slideSorter.getChildren()[0];
		 var height = firstThumb.domNode.clientHeight;
		 var outerHeight = pe.scene.slideSorter.domNode.clientHeight;
		 return Math.floor(outerHeight/height);
	 },
	 
	 getCntCol:function(){
		return 1;
	 },
	 
	 getCntMax:function(){
		 if(this.cntMax == null){
			 this.cntMax = this.getCntCol()*this.getCntRow();
		 }
		 return this.cntMax;
	 },
	 
	 getSorterClientHeight:function(){
		if(this.sorterClientHeight == 0){
			this.sorterClientHeight = pe.scene.slideSorter.domNode.clientHeight;
		} 
		return this.sorterClientHeight;
	 },
	 
	 getSorterClientWidth:function(){
		if(this.sorterClientWidth == 0){
			this.sorterClientWidth = pe.scene.slideSorter.domNode.clientWidth;
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
			 this.showSlide(item.sIdx);
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
		 var msg = dojo.toJson(message);
		 return msg;
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
			setTimeout(dojo.hitch(this,this.preStart),1);
		 }else{
			 setTimeout(dojo.hitch(this,this.notifyFinish),1);
		 }
	 },
	 
	 notifyFinish: function()
	 {
		dojo.publish("/pres/snapshot/finish", []); 
	 },
	 /**
	  * reset all slide to snapshot
	  */
	 reset:function(){		 
		 for(var len = pe.scene.doc.slides.length - 1;len>=0;len--){
			 this.updateSlide(len, true);
		 }
		 
		 setTimeout(dojo.hitch(this,this.preStart),1);
	 },
	 hideSlide:function(sIdx){
		if(sIdx >= 0)
		{
			 var thumbnail = pe.scene.slideSorter.getChildren()[sIdx];
			 thumbnail.domNode.style.display = "none";
		}
	 },
	 
	 showSlide:function(sIdx){
		if(sIdx >= 0)
		{
			 var thumbnail = pe.scene.slideSorter.getChildren()[sIdx];
			 thumbnail.showDom();
			 thumbnail.domNode.style.display = "";
		}
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
 