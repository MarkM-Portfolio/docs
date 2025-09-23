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
dojo.provide("html.widgets.PagePicker");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.NumberTextBox");
dojo.require("viewer.widgets.PageControlWidget");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("viewer.widgets", "PagePicker");

dojo.declare(
	"html.widgets.PagePicker",
	[dijit._Widget, dijit._Templated],
	{
		templateString: dojo.cache("html.widgets", "templates/PagePicker.html"),
		pageNum: 0,
		currentPage: 0,
		widgetsInTemplate: true,
		
		postMixInProperties: function(){
			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "PagePicker");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		postCreate: function(){
			this.setPageNum(this.pageNum);
			this.connect(this.pageInput.focusNode, "onkeydown", dojo.hitch(this, this._enterPage));
			this.updateCurrentPage(this.currentPage, true);
			//dojo.subscribe(viewer.util.Events.PAGE_INFO_UPDATED, this, this._onPageInfoUpdated);
			//dojo.subscribe(viewer.util.Events.PAGE_SELECTED, this, this._onPageSelected);
			this.inherited(arguments);
		},
		
		setPageNum: function(num){
			var bUpdated = (this.pageNum != num);
			this.pageNum = num;
			this.textPageNum.innerHTML = num;
			this.pageInput.focusNode.size = (num + "").length;
			dojo.mixin(this.pageInput.constraints, {min: 1, max: this.pageNum});
			if (this.pageNum == 0){
				this.pagePrevImg.attr('disabled', true);
				this.pageNextImg.attr('disabled', true);
			} else if (bUpdated){
				this.updateCurrentPage(this.currentPage, true);
			}
		},
		
		setCurrentPage: function(num){
			if (this.updateCurrentPage(num))
				if (this.viewManager && this.viewManager.setCurrentPage)
					this.viewManager.setCurrentPage(num);
		},
		
		updateCurrentPage: function(num, bForceUpdate){
			if (num < 1 || num > this.pageNum)
				return false;
			if ((num != this.currentPage) || bForceUpdate){
				this.currentPage = num;
				//this.pageInput.value = num;
				this.pageInput.setValue(num);
				if (num == 1){
					this.pagePrevImg.attr('disabled', true);
				}else if (this.pageNum > 1){
					this.pagePrevImg.attr('disabled', false);
				}else{ // pageNum <= 1
					this.pagePrevImg.attr('disabled', true);
				}
				
				if (num == this.pageNum){
					this.pageNextImg.attr('disabled', true);
				}else if (this.pageNum > 1){
					this.pageNextImg.attr('disabled', false);
				}else{// pageNum <= 1
					this.pageNextImg.attr('disabled', true);
				}
								
				return true;
			}
			return false;
		},
		
		_onPrevSelect: function(){
			if (this.currentPage > 1)
				this.setCurrentPage(this.currentPage - 1);
		},
		
		_onNextSelect: function(){
			if (this.currentPage < this.pageNum)
				this.setCurrentPage(this.currentPage + 1);
		},
		
		_onPageSelected: function(i){
			this.updateCurrentPage(i);
		},
		
		_onPageInfoUpdated: function(pageNum){
			this.setPageNum(pageNum);
		},
		
		_enterPage: function(e){
			if (e.keyCode == dojo.keys.ENTER){
				//var num = Number(this.pageInput.value);
				var num = this.pageInput.getValue();
				if (num){
					this.setCurrentPage(num);
				}
				// on ie, after ENTER key, the previous button will get focus,
				// which causes the page jump to the previous page.
				// not sure why. (defect 4187)
				e.preventDefault();
			}
				
		}
		
	});