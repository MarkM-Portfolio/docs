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
dojo.provide("concord.pres.mobile.mSlideSorterOpt");

dojo.declare("concord.pres.mobile.mSlideSorterOpt", null, {
	
	slidesorter:null,
	snapshotMgr:null,
	constructor:function(slidesorter,snapshotMgr){
		this.slidesorter = slidesorter;
		this.snapshotMgr = snapshotMgr;
	},
	
	
	handleOnclickEvt:function(evt){
		if(evt!=null){
			var fromAction = evt.currentTarget.fromAction;
			var isSSOpenContextMenu = false;
			this.slidesorter.publishSlideSorterInFocus();	
			
			//clean imgdropPos if any
			dojo.withDoc(this.slidesorter.editor.document.$, dojo.hitch(this.slidesorter, this.slidesorter.cleanUpImgDropPosFunc), null);	

			if (this.slidesorter.selectedSlide && evt.enableMltiSelect ) {
				
			}else{
				this.slidesorter.multiSelectedSlides = []; // reset
				if(evt.button == 0 && evt.type == "contextmenu"){
					isSSOpenContextMenu = true;
				}
				this.slidesorter.selectedSlide = evt.currentTarget;
				this.slidesorter.selectSlide(evt.currentTarget); // assign the this.multiSelectedSlides
				this.slidesorter.publishSlideSelectedEvent(this.slidesorter.selectedSlide, fromAction);
				
				//reset the onLastSlideByKey and onFirstSlideByKey flags - for handling onKeyUp for improving pageDown performance - 6042
				this.slidesorter.isOnLastSlideByKey = false;
				this.slidesorter.isOnFirstSlideByKey = false;
	
				
				//toggle next/prev slide buttons accordingly.
				//this.slidesorter.togglePrevNextSlideButtons();			
			}
			evt.currentTarget.fromAction = null;
		}
	},
	/**************call by Native sorter Start***************/
	deleteSlides: function(isFromCut,startIdx){
		 var isHavingLockedSlide = this.slidesorter.isMultiSlidesHaveLockedSlide();
         if(isHavingLockedSlide == true){
             this.slidesorter.publishLaunchContentLockDialog();
             return false;
         }
		 if(this.slidesorter.multiSelectedSlides ==null || this.slidesorter.multiSelectedSlides.length == this.slidesorter.slides.length) {
		     return false;
		 }
         this.showSelectedSlides(); // display the delete slide for undo data
         var delIdx = this.slidesorter.getIdxbyId(this.slidesorter.multiSelectedSlides[0].id,startIdx);
         // enhance the logic
         var lenBefore = this.slidesorter.slides.length;
		 this.slidesorter.deleteSlides(isFromCut);
		 var lenAfter = this.slidesorter.slides.length;
		 if(lenBefore === lenAfter){
			 return false;
		 }else{
			 this.snapshotMgr.deleteSlide(delIdx,true); // update dirty slide
			 return true;
		 }
	},
	
	cutSlides: function(startIdx) {
		if(this.slidesorter.multiSelectedSlides ==null || this.slidesorter.multiSelectedSlides.length == this.slidesorter.slides.length) {
		    return false;
		}
		var idx = this.slidesorter.getIdxbyId(this.slidesorter.multiSelectedSlides[0].id,startIdx);
		this.snapshotMgr.updateSlide(idx,true);
        if (this.slidesorter.copySlides()){ //jmt- 41913
            var isFromCut = true;
            //remove the slides
            return this.deleteSlides(isFromCut);
        }
		return false;
	},
    copySlides: function(startIdx) {
    	if(this.slidesorter.multiSelectedSlides ==null) {
		    return false;
		}
    	var idx = this.slidesorter.getIdxbyId(this.slidesorter.multiSelectedSlides[0].id,startIdx);
    	this.snapshotMgr.updateSlide(idx,true);
    	var rs = this.slidesorter.copySlides(); 
    	return rs;
    },
    pasteSlides: function(startIdx){
    	if(this.slidesorter.multiSelectedSlides ==null) {
		    return false;
		}
    	var idx = this.slidesorter.getIdxbyId(this.slidesorter.multiSelectedSlides[0].id,startIdx);
    	var lenBefore = this.slidesorter.slides.length;
    	this.slidesorter.pasteSlides(this.slidesorter.PASTE_AFTER); // multiSelectedSlides changed
    	var lenAfter = this.slidesorter.slides.length;
    	if(lenBefore === lenAfter)
    		return false;
    	else{
    		//TODO: use native copy/paste for better performance
    		this.snapshotMgr.insertSlide(idx+1,null,true);
    		this.snapshotMgr.preStart();
			return true;
    	}
    },
	dupSlide:function(startIdx){
		// the dom will be copied so that need let the dom display.
		// need check whether it's already dirty slide,if it is,shouldn't display it.
		// so set the dirty slide 
		if(this.slidesorter.multiSelectedSlides ==null) {
		    return "";
		}
		var idx = this.slidesorter.getIdxbyId(this.slidesorter.multiSelectedSlides[0].id,startIdx);
		this.snapshotMgr.updateSlide(idx,true);
		var lenBefore = this.slidesorter.slides.length;
		this.slidesorter.copyPaste(); // selected slide changed
		var lenAfter = this.slidesorter.slides.length;
		// check whether it's success.
		if(lenBefore === lenAfter)
			return "";
		else{
			this.snapshotMgr.updateSlide(idx+1,true);
			return this.slidesorter.slides[idx + 1].id;
		}
	},
	/**************call by Native sorter End***************/
	showSelectedSlides:function(){
		if(this.slidesorter.multiSelectedSlides !=null){
			 for(var i=0,len=this.slidesorter.multiSelectedSlides.length; i<len; i++){
				 dojo.style(this.slidesorter.multiSelectedSlides[i],'display','');
			 }
		}
	},
	hideSelectedSlides:function(){
		if(this.slidesorter.multiSelectedSlides !=null){
			 for(var i=0,len=this.slidesorter.multiSelectedSlides.length; i<len; i++){
				 dojo.style(this.slidesorter.multiSelectedSlides[i],'display','none');
			 }
		}
	},
	dndStart : function (params){
		// get the selected slides
		for(var i=0; i< this.slidesorter.multiSelectedSlides.length; i++){
            this.slidesorter.deselectSlide(this.slidesorter.multiSelectedSlides[i]);
        }
		this.slidesorter.multiSelectedSlides = [];
    	for(var i in params.sSlides){
    		var slide = params.sSlides[i];
    		this.slidesorter.selectSlide(slide);
    	}
		// check whether it's locked.
	    //check if there is locked slide, if so, do not delete anything
	    var isHavingLockedSlide = this.slidesorter.isMultiSlidesHaveLockedSlide();
	    if(isHavingLockedSlide == true){
	    //18079 - reduced the timeout to prevent chances that user can finish dragging before cancelling the dnd
	    	this.slidesorter.publishLaunchContentLockDialog();
	        setTimeout(dojo.hitch(this.slidesorter, this.slidesorter.cancelDnd, true), 5);
	        return false;
	    }else {
	        //for future when we need to do anything on dndStart
	        //this.isDNDSession = true;
	    	this.slidesorter.dndCmdList= [];
	
	        //this.sortMultiSelectedSlides();
	        var slidesBeingDropped = this.slidesorter.multiSelectedSlides;
	        //Simulate click on the slide the user began the DND
	        if(slidesBeingDropped !=null && slidesBeingDropped.length >0){
	            for(var i=slidesBeingDropped.length-1; i>=0; i-- ){
	                //load the slides just in case multiselected slides has unloaded content
	                //this.loadSlideToSorter(slidesBeingDropped[i]);
	                //clone the slideWrapperInDrag
	                var slideWrapperInDragClone = slidesBeingDropped[i].parentNode;
	                // jmt - coeditfix
	                var useElemId = true; // tells other clients to use element id instead of child index when deleting node. (DND causes child index to be incorrect and unreliable in other clients)
	                this.slidesorter.dndCmdList =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(slideWrapperInDragClone),this.slidesorter.dndCmdList,useElemId);
	
	            }
	        }
	        return true;
	   }
	},
	
    dndDrop : function (sIdx,eIdx,size){
        this.slidesorter.isDNDSession = false;
        //this.disconnectDocForCancelDnd();
        // update the dom tree
        
        var sNode = this.slidesorter.slides[sIdx].parentNode;
        var eNode = this.slidesorter.slides[eIdx].parentNode;
        if(sIdx < eIdx){
        	dojo.place(sNode,eNode,'after');
        }else if(sIdx > eIdx)
        	dojo.place(sNode,eNode,'before');
    	// update the slides in slidesorter
        this.slidesorter.refreshSlidesObject();
        this.snapshotMgr.moveSlide(sIdx,eIdx);
    },
    dndCancel : function (){
    	this.slidesorter.isDNDSession = false;
    	this.slidesorter.dndCmdList=[];
        //this.disconnectDocForCancelDnd();
    },
    dndDropAfter : function (){
    	this.slidesorter.isDNDSession = false;
        var slideToSelect = null;

            var slidesBeingDropped = this.slidesorter.multiSelectedSlides;
            if(slidesBeingDropped !=null && slidesBeingDropped.length >0){
                // jmt - coeditfix
                var msgPairList = this.slidesorter.dndCmdList;
                for(var i=0; i<slidesBeingDropped.length; i++ ){
                    //clone the slideWrapperInDrag
                    var slideWrapperInDragClone = slidesBeingDropped[i].parentNode;

                    // jmt - coeditfix
                    var useElemId = true; // tells other clients to use element id instead of child index when deleting node. (DND causes child index to be incorrect and unreliable in other clients)
                    msgPairList =SYNCMSG.createInsertNodeMsgPair(slideWrapperInDragClone,msgPairList);

                    this.slidesorter.refreshSlidesObject();
                    
                    if(this.slidesorter.selectedSlide == slidesBeingDropped[i] ){
                        slideToSelect = slidesBeingDropped[i];
                    }
                }
                if(msgPairList.length>0){
                    msgPairList = this.slidesorter.addMoveFlag(msgPairList);
                    //set the msg's has delete and insert same element, for undo processing allowing delete and insert element together in the same msgList
                    var hasDeIeSameElement = true;
                    msgPairList = SYNCMSG.setHasInsertDeleteSameElementInMsgListFlag(msgPairList,hasDeIeSameElement);
                    SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                }
                if (slideToSelect==null){
                    slideToSelect = this.slidesorter.multiSelectedSlides[0];
                    this.slidesorter.simulateSlideClick(slideToSelect);
                }
                
                if (slideToSelect != null) {
                    var slideId = slideToSelect.id;
                    this.slidesorter.createSlideSelectedMsg(slideId);
                }
//                setTimeout(dojo.hitch(this.slidesorter,function(){
//                    //publish slide selected event
//                    this.slidesorter.publishSlideSelectedEvent(slideToSelect);
//                }), 200);
            }
    }
	
});