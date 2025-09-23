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
dojo.provide("viewer.widgets.PageIndicator");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("viewer.widgets.PageControlWidget");
dojo.require("viewer.util.BidiUtils");
dojo.requireLocalization("viewer.widgets", "PagePicker");

dojo.declare(
	"viewer.widgets.PageIndicator",
	[viewer.widgets.PageControlWidget, dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("viewer.widgets", "templates/PageIndicator.html"),
		pageNum: 0,
		currentPage: 0,
		widgetsInTemplate: true,
		
		hide: function(){
			var fadeArgs = {
			        node: this.domNode,
			        duration: 1000,
			      };
			dojo.fadeOut(fadeArgs).play();
		},
		
		show: function(){
			var indicator=this.domNode;
			dojo.fadeIn({ node: indicator}).play();	
		},

		postMixInProperties: function(){
			var _nlsResources = dojo.i18n.getLocalization("viewer.scenes", "Scene");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		postCreate: function(){
			/**
			 * Defect 47695: Update pageNum and currentPage are async process. When setPageNum(1) is firstly being called, pageNum may
			 * still 0 and failed the validation check.
			 */
			if(this.pageNum<1){
				this.pageNum = 1;
			}
			this.setPageNum(this.pageNum);
			dojo.subscribe(viewer.util.Events.PAGE_INFO_UPDATED, this, this._onPageInfoUpdated);
			this.inherited(arguments);
		},

		setPageNum: function(num){
			var bUpdated = (this.pageNum != num);
			this.pageNum = num;
			this.totalPageNum.innerHTML = num;
//			dojo.mixin(this.pageInput.constraints, {min: 1, max: this.pageNum});
//			if (this.pageNum == 0){
//				this.pagePrevImg.attr('disabled', true);
//				this.pageNextImg.attr('disabled', true);
//			} else if (bUpdated){
//				this.updateCurrentPage(this.currentPage, true);
//			}
		},
		
		_onPageSelected: function(i){
			this.updateCurrentPage(i);
		},
		
		setCurrentPage: function(num){
			if (this.updateCurrentPage(num))
				this.notifyPageSelected(num);
		},
		
		updateCurrentPage: function(num, bForceUpdate){
			if (num < 1 || num > this.pageNum)
				return false;
			if ((num != this.currentPage) || bForceUpdate){
				this.currentPage = num;
				//this.pageInput.value = num;
//				this.pageInput.setValue(num);
				this.curPageNum.innerHTML = num;
//				if (num == 1){
//					this.pagePrevImg.attr('disabled', true);
//				}else if (this.pageNum > 1){
//					this.pagePrevImg.attr('disabled', false);
//				}else{ // pageNum <= 1
//					this.pagePrevImg.attr('disabled', true);
//				}
				
//				if (num == this.pageNum){
//					this.pageNextImg.attr('disabled', true);
//				}else if (this.pageNum > 1){
//					this.pageNextImg.attr('disabled', false);
//				}else{// pageNum <= 1
//					this.pageNextImg.attr('disabled', true);
//				}
				
				return true;
			}
			return false;
		},
		
		_onPageInfoUpdated: function(pageNum){
			this.setPageNum(pageNum);
			//console.log("page updated. + " + pageNum);
		},
		
		position: function(){
			var box = dojo.byId('continuousView');
			var l = dojo.marginBox(box).w, left = 0;
			if (this.viewManager && typeof this.viewManager.getClientAreaPos == "function" ) {
				left = this.viewManager.getClientAreaPos().x-this.domNode.clientWidth/2;
			} else {
				var table = box.childNodes[0];
				var w = table.clientWidth;
				left = (l-w)/2 + w + 20;
			}
			if (l - left - 20 < this.domNode.clientWidth) { // this is for sheet compact mode
				left = l - this.domNode.clientWidth - 60;
			}
			if (BidiUtils.isGuiRtl())
				this.domNode.style.right = left + 'px';
			else
				this.domNode.style.left = left + 'px';
		}
	});