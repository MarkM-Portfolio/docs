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
dojo.require("concord.util.BidiUtils");

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
			dojo.subscribe("/thumbnail/selected", this, this._onPresPageInfoUpdated);
			this.inherited(arguments);
		},
		
		_onPresPageInfoUpdated: function(widget){
			var slide = widget.slide;
			var index = dojo.indexOf(pe.scene.doc.slides, slide) + 1;
			this.setCurrentPage(index);			
		},
		
		setPageNum: function(num){
			var bUpdated = (this.pageNum != num);
			this.pageNum = num;
			this.totalPageNum.innerHTML = num;
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
				this.curPageNum.innerHTML = num;								
				return true;
			}
			return false;
		},
		
		position: function(){
			var cwidth = dojo.style(document.body, 'width');
			var wwidth = dojo.marginBox(this.domNode).w;
			var mleft = (cwidth-wwidth)/2;
			if (BidiUtils.isGuiRtl())
				this.domNode.style.right = mleft + 'px';
			else
				this.domNode.style.left= mleft + 'px';
		}
		
	});