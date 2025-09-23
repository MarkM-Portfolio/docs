/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.feature.FeatureDlg");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.feature","feature");

dojo.declare('concord.feature.FeatureDlg', [dijit._Widget,dijit._Templated], {
	nls: null,
	featureIDs: null,
	fIndex: 0,
    fNumber: 1,
    isConn:true,
    featureVers: null,
    
    lightPrefix: "_light_id_",

	templateString: dojo.cache("concord", "templates/feature.html"),
	
	constructor: function(args){
		this.featureIDs = args.featureIDs;
		this.lightPrefix += new Date().getTime();
		this.lightPrefix += "_";
		this.nls = dojo.i18n.getLocalization("concord.feature","feature");
		this.isConn = concord.util.uri.isLCFilesDocument();
		this.featureVers = args.featureVers;
	},		
	
	postCreate: function(){	
		this.inherited(arguments);
		this._createContent();
	},
	
	show: function(index){		
		setTimeout(
			dojo.hitch(this, function(){
				this._show(index);
				this.setFocus();
			}),
			200
		);	
	},
	
	_show: function(index) {
		dojo.removeClass(this.FeaturesNode,"hidden");
		if(index)
			this.fIndex = index;
		else 
			this.fIndex = 0;
		this._display(this.fIndex);
		this._accFeatureWidget(this.fIndex);		
	},
	
	isShown: function(){
		return !dojo.hasClass(this.FeaturesNode, "hidden");
	},
	
	_createContent: function(){	
		this.fNumber = this.featureIDs.length;
		if (BidiUtils.isGuiRtl())
			dojo.attr(this.lightNode, 'dir', 'rtl');
		
		var index = 0;
		for(var i=0; i<this.featureIDs.length; i++){
			var id = this.featureIDs[i];
			
			if (id == "TEXT_TRACK_CHANGE" && !(window.g_docTrackEnabled && pe.authenticatedUser.getId() == window.DOC_SCENE.ownerId)) {
				continue;
			}
			
			var container = dojo.create("div", {id : id}, this.featureNode);
			var className = (index == 0)? "fcontent" : "fcontent hidden";
			dojo.addClass(container,className);
			
			var node = dojo.create("div", null, container);
			node.innerHTML = this._getTitle(id);
			dojo.addClass(node,"ftitle");			
			node = dojo.create("div", null, container);
			node.innerHTML = this._getDesc(id);	
			dojo.addClass(node,"fdesc");
			//create lights accordingly
			this._createLight(index);		
			index++;
		}
		if(this.featureIDs.length > 1){
			dojo.removeClass(this.footerNode,"hidden");
			this._accButtons(this.presNode, this.nls.PREV);
			this._accButtons(this.nextNode, this.nls.NEXT);
		}else if(this.featureIDs.length == 1){
			var descNode = dojo.query(".fdesc", this.FeaturesNode)[0];
			if(descNode)
				dojo.style(descNode,"paddingBottom","5px");
		}
		this._accButtons(this.cancelNode, this.nls.DELETE);
	},
	
	_isHC : function() {
		return dojo.hasClass(dojo.body(), "dj_a11y");
	},
	
	_accFeatureWidget: function(index){
		var id = this.featureIDs[index];
		var title = this._getTitle(id);
		var desc = this._getDesc(id);
		dijit.setWaiState(this.FeaturesNode,'label', title +"\n"+ desc);
	},
	
	_accButtons: function(node, content){
		dojo.attr(node,"aria-label",content);
		dojo.attr(node,"title",content);
		dojo.attr(node,"alt",content);
		
		var accNode = dojo.query(".ll_commmon_images_alttext", node)[0];
		if(accNode){
			var accPNode = null;
			if(node == this.presNode){
				if(this._isHC()){					
					dojo.style(this.leftArrow, "display", "none");
				}
				accNode.innerHTML = "◄";
				accPNode = this.leftArrow;
			}else if(node == this.nextNode){
				accNode.innerHTML = "►";
				accPNode = this.rightArrow;
			}else if(node == this.cancelNode){
				accNode.innerHTML = "X";
				accPNode = this.cancel;			
			}			 
			if(accPNode && this._isHC()){
				dojo.attr(accPNode,"class", "");
			}
		}
	},
	
	_createLight: function(index){
		var id = this.lightPrefix + index;
		var light = dojo.create("div", {id: id}, this.lightNode);
		var lightClass = (index == 0)? "lightOn" : "lightOff";
		dojo.addClass(light,lightClass);
		var hLight = dojo.create("div", null, light);
		dojo.addClass(hLight, "ll_commmon_images_alttext");
		hLight.innerHTML = (index == 0)? "Ο" : "x" ;
				
		var boxWidth = dojo.style(this.FeaturesNode,"width");
		var n = this.fNumber;
		var dw = (n % 2 == 1) ? 4 : 0;
		var lWidth = boxWidth/2 - Math.ceil((n-1)/2)* 8 - 15*(n-1)/2 - dw + index*23;
		
		dojo.style(light, BidiUtils.isGuiRtl() ? "marginRight" : "marginLeft", lWidth+"px");
		dojo.style(light, "marginTop", "-8px");
	},
	
	_getTitle: function(featureID){
		var hasTP = this.nls[featureID +"_TITLE_TP"] != undefined;
		var titleKey = this.isConn ? (featureID +"_TITLE") : (hasTP ? (featureID +"_TITLE_TP") : (featureID +"_TITLE"));
		return this.nls[titleKey];
	},
	
	_getDesc: function(featureID){
		var hasTP = this.nls[featureID +"_DESC_TP"] != undefined;
		var baseDescKey = featureID + "_DESC";
		var versSurffix = "";
		dojo.forEach(this.featureVers, function(version) {
			versSurffix = version.replace(/[^\d]+/g, '_');
			if (this.nls[baseDescKey + versSurffix] != undefined) {
				baseDescKey = baseDescKey + versSurffix;
				return false;
			}
		}, this);
		var descKey = this.isConn ? baseDescKey : (hasTP ? (featureID +"_DESC_TP"): baseDescKey);
		if(this.nls[descKey]){
			return dojo.string.substitute(this.nls[descKey], {'productName': concord.util.strings.getProdName()});
		}else {
			var index = 1;
			var desc = this._getTPDescLiteral(featureID, index) ;
			var result = "";
			while(desc){
				index ++;
				var msg = this._getTPDescLiteral(featureID, index);
				result += desc + (msg ? "<br>" : "");				
				desc = msg;
			}
			return result;
		}	
	},
	//Features for Third Party integration may use different literals. 
	_getTPDescLiteral: function(featureID, index){
		if(this.isConn){
			return this.nls[featureID + "_DESC_" + index];
		}else {			
			var hasTP = this.nls[featureID + "_DESC_TP_" + index] != undefined;
			return hasTP ? this.nls[featureID + "_DESC_TP_" + index] : this.nls[featureID + "_DESC_" + index];
		}
	},
	
	_next: function(){
		if(this.fIndex == this.fNumber -1){
			return;	
		} 			
		concord.feature.FeatureController.afterShown( this.featureIDs[this.fIndex]);
		if (this.featureIDs[this.fIndex+1] == "TEXT_TRACK_CHANGE" && !(window.g_docTrackEnabled && pe.authenticatedUser.getId() == window.DOC_SCENE.ownerId))
			this._display(this.fIndex + 2);
		else
			this._display(this.fIndex + 1);
	},
	
	_previous: function(){
		if(this.fIndex == 0){
			return;	
		}		
		concord.feature.FeatureController.afterShown(this.featureIDs[this.fIndex]);
		if (this.featureIDs[this.fIndex-1] == "TEXT_TRACK_CHANGE" && !(window.g_docTrackEnabled && pe.authenticatedUser.getId() == window.DOC_SCENE.ownerId))
			this._display(this.fIndex - 2);
		else
			this._display(this.fIndex - 1);
	},
	
	_display: function(index){
		this._btnStatus(index);
		
		this._hideAll();
		this._lightOffAll();
		this._showByIndex(index);
		this._lightOn(index);
		this._accFeatureWidget(index);
		var featureId = this.featureIDs[index];
		this._locate(featureId);
		
		this.fIndex = index;
	},
	//To show a feature by its index in the features array
	_showByIndex : function(index){
		var id = this.featureIDs[index];
		var node = dojo.byId(id);
		if(node){			
			dojo.removeClass(node, "hidden");
		}		
	},
	//To hide a feature by its index in the features array
	_hideByIndex : function(index){
		var id = this.featureIDs[index];
		var node = dojo.byId(id);
		if(node){			
			dojo.addClass(node, "hidden");
		}		
	},
	
	_hideAll : function(){
		for(var i=0; i<this.featureIDs.length; i++){
			var id = this.featureIDs[i];
			var node = dojo.byId(id);
			if(node && !dojo.hasClass(node, "hidden")){							
				dojo.addClass(node, "hidden");
			}		
		}
	},
	
	_btnStatus: function(index){
		if(this._isHC()){
			if(index == 0){
				dojo.style(this.leftArrow, "display", "none");
				dojo.style(this.rightArrow, "display", "block");
			}else if(index == (this.fNumber -1)){
				dojo.style(this.leftArrow, "display", "block");
				dojo.style(this.rightArrow, "display", "none");
			}else{
				dojo.style(this.leftArrow, "display", "block");
				dojo.style(this.rightArrow, "display", "block");
			}			
			return;
		}
		if(index == 0){
//			dojo.removeClass(this.leftArrow, "feature-leftArrow");
//			dojo.addClass(this.leftArrow, "feature-leftDisabled");
//			dojo.removeClass(this.rightArrow, "feature-rightDisabled");
//			dojo.addClass(this.rightArrow, "feature-rightArrow");
			
			dojo.addClass(this.presNode, "hidden");
			dojo.removeClass(this.nextNode, "hidden");
			if(this.fNumber > 1)
				this.nextNode.focus();
			else
				this.cancelNode.focus();
		}else if(index == (this.fNumber -1)){
//			dojo.removeClass(this.leftArrow, "feature-leftDisabled");
//			dojo.addClass(this.leftArrow, "feature-leftArrow");
//			dojo.removeClass(this.rightArrow, "feature-rightArrow");
//			dojo.addClass(this.rightArrow, "feature-rightDisabled");
			
			dojo.removeClass(this.presNode, "hidden");
			dojo.addClass(this.nextNode, "hidden");
			this.cancelNode.focus();
		}else{
			dojo.removeClass(this.leftArrow, "feature-leftDisabled");
			dojo.addClass(this.leftArrow, "feature-leftArrow");
			dojo.removeClass(this.rightArrow, "feature-rightDisabled");
			dojo.addClass(this.rightArrow, "feature-rightArrow");
			
			dojo.removeClass(this.presNode, "hidden");
			dojo.removeClass(this.nextNode, "hidden");
		}
	},
	
	_lightOn: function(index) {
		var id = this.lightPrefix + index;
		var node = dojo.byId(id);
		if(node){			
			dojo.removeClass(node, "lightOff");
			dojo.addClass(node, "lightOn");
			var allyNode = dojo.query(".ll_commmon_images_alttext", node)[0];
			if(allyNode){
				allyNode.innerHTML = "Ο";
			}
		}				
	},
	
	_lightOff: function(index) {
		var id = this.lightPrefix + index;
		var node = dojo.byId(id);
		if(node){			
			dojo.removeClass(node, "lightOn");
			dojo.addClass(node, "lightOff");
			var allyNode = dojo.query(".ll_commmon_images_alttext", node)[0];
			if(allyNode){
				allyNode.innerHTML = "x";
			}			
		}				
	},
	
	_lightOffAll: function() {
		for(var i=0; i<this.featureIDs.length; i++){
			var id = this.lightPrefix + i;
			var node = dojo.byId(id);
			if(node){			
				if(dojo.hasClass(node, "lightOn"))
					dojo.removeClass(node, "lightOn");
				if(!dojo.hasClass(node, "lightOff"))
					dojo.addClass(node, "lightOff");
				var allyNode = dojo.query(".ll_commmon_images_alttext", node)[0];
				if(allyNode){
					allyNode.innerHTML = "x";
				}			
			}
		}
	},
	
	setFocus: function(){
		if(pe.scene.docType == "pres"){
			pe.scene.setFocusComponent('dialogs');
		}
		var node = this.FeaturesNode;
		setTimeout(
			function(){
				 if(node) node.focus();	
			}, 500);
	},
	
	 //Calculate the feature dialog's position
	_locate: function(featureID){
 
		var pos = concord.feature.FeatureController.getPosition(featureID);
		if(!pos) return;

		var x = pos.x;
		var y = pos.y;
		
		var isMenued = (pos.m == undefined) ? false : true; // menu, left arrow icon
		var isCentreed = (pos.c == undefined) ? false : true;
		var isRight = (pos.r != undefined) || (BidiUtils.isGuiRtl() && isMenued);
		var isLeft = pos.l;
		var isArrowTopRight = (pos.tr == undefined) ? false : true; // top arrow located in top-right of the rect
		
		var bWidth = 251; //box's width
		var bHeight = this.FeaturesNode.clientHeight; //box's height
		var dev = 5; //5px deviation
		
		var arrowLeft = 20;
		var arrowTop =  bHeight *(1-0.618)-18;
		var left = (BidiUtils.isGuiRtl() || isArrowTopRight) ? x - bWidth : x;
		var top = y;
			
		if(isMenued){			
			if(y > arrowTop){
				top = y - arrowTop;
			}else if(y < arrowTop){
				arrowTop = y;
				top = dev;
			}	
		}else {
			if(left > arrowLeft){
				if (BidiUtils.isGuiRtl() || isArrowTopRight) {
					left += arrowLeft;
					arrowLeft = bWidth - 2*arrowLeft;
				} else {
					left = x - arrowLeft;
				}
			}else {
				arrowLeft = (BidiUtils.isGuiRtl() || isArrowTopRight) ? x - arrowLeft : x;
				left = dev;
			}			
		}
		
		if(isCentreed){
			left = x - bWidth /2;
			top = y - bHeight/2;
		}
		
		dojo.style(this.FeaturesNode,"left",left +"px");
		dojo.style(this.FeaturesNode,"top",top +"px");
		
		var arrowup = (isMenued || isRight || isLeft) ? false : true;
		var arrowdown = false;
		var arrowleft = (isMenued && !BidiUtils.isGuiRtl()) || isLeft;
		var arrowright = isRight ? true : false;
		if(isCentreed){
			arrowup = false;
			arrowleft = false;
			arrowright = false;
		}
		//default - the golden ratio
		var locdata = (isMenued || isLeft) ? (arrowTop +"px") : (arrowLeft +"px");
		
		this._locateArrow(arrowup, arrowdown, arrowleft, arrowright, locdata);
	},
	
	_locateArrow: function(arrowup, arrowdown, arrowleft, arrowright, locdata){
		dojo.attr(this.arrowNode,"src",contextPath + window.staticRootPath + '/images/blank.gif');
		dojo.removeAttr(this.arrowNode,"style");
		dojo.removeAttr(this.arrowNode,"class");
		dojo.removeAttr(this.allyArrowNode,"style");
		var locDv = this._isHC()? "-13px" :"-11px";
		if(arrowup){
			this._styleArrow("arrowup", "top", "left", locdata, "▲", locDv);
		}else if(arrowdown){		
			this._styleArrow("arrowdown", "bottom", "left", locdata, "▼", locDv);
		}else if(arrowleft){
			locDv = "-11px";
			this._styleArrow("arrowleft", "left", "top", locdata, "◄", locDv);
		}else if(arrowright){
			locDv = "-11px";
			this._styleArrow("arrowright", "right", "top", locdata, "►", locDv);
		}else{
			this.allyArrowNode.innerHTML= "";
		}
		dojo.attr(this.arrowNode,'alt','');	
	},
	
	_styleArrow: function(className, direction, loctype, locdata, value, locDv){		
		dojo.addClass(this.arrowNode, className);
		dojo.style(this.arrowNode, direction, locDv);
		dojo.style(this.arrowNode, loctype, locdata);
		this.allyArrowNode.innerHTML = value;
		dojo.style(this.allyArrowNode, direction, locDv);
		dojo.style(this.allyArrowNode, loctype, locdata);		
	},
	
	_close: function(){
		dojo.addClass(this.FeaturesNode,"hidden");
		this._lightOff(this.fIndex);
		if(typeof pe != 'undefined'){
			setTimeout( dojo.hitch(pe.scene, pe.scene.setFocus), 0 );
		}
		var fVersion = concord.feature.FeatureController.getFeatureSettingKey();
		var FEATURE_HIDE = 2;
		pe && pe.settings && pe.settings.setShowNewFeature(FEATURE_HIDE, this.featureVers);		
	},
	
	_onKeyDown: function(e){
		e = e || window.event;
		var key = (e.keyCode ? e.keyCode : e.which);
		if(key == 115 && (e.ctrlKey || e.metaKey)){
			if (e.preventDefault) e.preventDefault();
			return;
		}      
		
		if (key != dojo.keys.TAB)
			dojo.stopEvent(e);
		
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		var isEscape = (key == dojo.keys.ESCAPE);
		var isEnterKeys = (key == dojo.keys.ENTER || key == dojo.keys.SPACE);
		var isPrevKeys = (key == dojo.keys.UP_ARROW || key == dojo.keys.LEFT_ARROW);
		var isNextKeys = (key == dojo.keys.DOWN_ARROW || key == dojo.keys.RIGHT_ARROW);
		var isTabKey = (key == dojo.keys.TAB);
		
		if(!isEscape && !isEnterKeys && !isPrevKeys && !isNextKeys && !isTabKey)
			return;
		
		var target = e.target;
		if (target == null) 
			target = e.srcElement;
		if(isEnterKeys){
			if(target == this.cancelNode || dojo.isDescendant(target, this.cancelNode)){
				this._close();
			}else if(target == this.presNode || dojo.isDescendant(target, this.presNode)){
				this._previous();
			}else if(target == this.nextNode || dojo.isDescendant(target, this.nextNode)){
				this._next();
			}
			return;
		}
		else if (isTabKey)
		{ // keep tab event within the dialog
			if((target == this.cancelNode || dojo.isDescendant(target, this.cancelNode)) && e.shiftKey){
				this.nextNode.focus();
				e.stopPropagation();
				e.preventDefault();
			}else if((target == this.nextNode || dojo.isDescendant(target, this.nextNode)) && !e.shiftKey){
				this.cancelNode.focus();
				e.stopPropagation();
				e.preventDefault();
			}
		}		
		if (target == this.FeaturesNode || dojo.isDescendant(target, this.FeaturesNode)){
			if(isEscape){
				this._close();
			}else if(isPrevKeys){
				this._previous();
			}else if(isNextKeys){
				this._next();
			}
		}
	},
	
	_onclick: function(event){
		var target = event.target;
		if (target == null) 
			target = event.srcElement; 
		if(target == this.cancelNode || dojo.isDescendant(target, this.cancelNode)){
			this._close();
		}else if(target == this.presNode || dojo.isDescendant(target, this.presNode)){
			this._previous();
		}else if(target == this.nextNode || dojo.isDescendant(target, this.nextNode)){
			this._next();
		}
	},
	
	_onBlur: function(by){
		concord.feature.FeatureController.afterShown( this.featureIDs[this.fIndex]);
		this.inherited(arguments);
		if(!dojo.hasClass(this.FeaturesNode, "hidden")){
			dojo.addClass(this.FeaturesNode, "hidden");
			this._lightOff(this.fIndex);
		} 
	}
});