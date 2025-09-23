/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.sidebar.Mentions");

dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets.sidebar","Comments");

dojo.declare('concord.widgets.sidebar.Mentions', [dijit._Widget,dijit._Templated], {
	textarea: null,
	widget: null,
	timer: null,
	gObj: null,
	li_Index: 1,
	connectArray: [],
	connectLiArray:[],
	nls: null,
	isBidi: false,
	items: null,
	singleMatched: false,
	cachedMentionList: [], //cached mention list
	pageNumber:10, // showing users in each page
	startIndex:1, //global index for navigating
	prevId: 'prevBtnId_',//previous button id prefix
	nextId: 'nextBtnId_',//next button id prefix
	hintId: 'hintId_',//hint message id prefix
	maxLimit: 100, //max limitation of fetched data
	actualLimit: 0, //actual number returned from server side
	isPaged: false, //showing mention dialog page by page,
	isUpShown: false, //showing mention dialog above comment dialog
	
	templateString: dojo.cache("concord", "templates/Mentions.html"),
	constructor: function(args){
		this.textarea = args.textarea;
		this.widget = args.widget;
		this.isBidi = BidiUtils.isBidiOn();	
	},
	
	postCreate: function(){	
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");
		this.connectArray.push(dojo.connect(this.textarea, "onkeydown", dojo.hitch(this, this._keyHandler)));
		this.connectArray.push(dojo.connect(this.textarea, "onclick", dojo.hitch(this, this._keyHandler))); 
		dijit.setWaiState(this.mentionsNode,'label', this.nls.jawsMentionHint);	
		this.prevId = this.prevId + new Date().getTime();
		this.nextId = this.nextId + new Date().getTime();
		this.hintId = this.hintId + new Date().getTime();
	},
	
    _keyHandler: function(e){
    	var _key = e.keyCode || e.charCode;
    	var styles = dojo.style(this.userListNode,"display");
    	var isV = styles =="none" ? false : true;
    	if(isV && (_key==dojo.keys.ENTER || (_key==dojo.keys.SPACE && this.singleMatched) || _key==dojo.keys.UP_ARROW 
    			|| _key==dojo.keys.DOWN_ARROW || _key==dojo.keys.ESCAPE)){
        	this.mentionsSelect(this.textarea,_key);
        	dojo.stopEvent(e);        	
        	if(_key == dojo.keys.ESCAPE){ 
        		window.setTimeout(
        			dojo.hitch(this, function(){
        				var _rangeData = this.getCursor(this.textarea);        					
        				this.setCursor(this.textarea, _rangeData); 					 
        			}),200);          	
        	}        	
        	return false;
    	}else{
        	if(this.timer !== null){
            	clearTimeout(this.timer);
        	}     	
        	this.timer = setTimeout(dojo.hitch(this, function(){                   	
            	this.drawTextarea(this.textarea);
           	 	this.getMentionsAt(this.textarea);
        	}),300);
    	}            
	},
	
	_clean: function(){
		dojo.style(this.userListNode,"display","none");
		dojo.empty(this.atNode);
		this.cachedMentionList = [];
	},
	
	//To show a clean mention widget
	show: function(){
		dojo.style(this.mentionsNode,"display", "block");
		this._clean();
	},
	//To hide mention widget
	hide: function(){
		dojo.style(this.mentionsNode,"display", "none");
		this.hideMentionDlg();
		dojo.empty(this.atNode);
	},
	//To get the mentioned user list
	getMentionList: function(){
		return this.cachedMentionList;
	},

	getCursor: function(textarea) {   
        var rangeData={
            start: 0,   
            end: 0,   
            text: ""
        };                       
        textarea.focus();
        if (textarea.setSelectionRange) { //W3C
            rangeData.start= textarea.selectionStart;
            rangeData.end = textarea.selectionEnd;
            rangeData.text = textarea.value.substring(0, rangeData.end);
        } else if (document.selection) { //IE
            var i, oS = document.selection.createRange(), oR = document.body.createTextRange();
            oR.moveToElementText(textarea);

            rangeData.text = oS.text;
            rangeData.bookmark = oS.getBookmark();

            for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i ++) {
                if (textarea.value.charAt(i) == '\n') {
                    i ++;
                }
            }
            rangeData.start = i;
            rangeData.end = rangeData.text.length + rangeData.start;
            rangeData.text = textarea.value.substring(0,i);   
        }
        return rangeData;
    },
    
    setCursor: function(textarea, rangeData) {
        textarea.focus();
        if (textarea.setSelectionRange) { //W3C
            textarea.setSelectionRange(rangeData.start, rangeData.end);
        } else if (textarea.createTextRange) { //IE
            var oR = textarea.createTextRange();
            if(textarea.value.length === rangeData.start) {
                oR.collapse(false);
                oR.select();
            } else {
                oR.moveToBookmark(rangeData.bookmark);
                oR.select();
            }
        }
    },

    addMention: function(txtData,Object) {
        var oValue,atPos,nStart,nEnd,nValue,st,sR;
        var textarea = Object.textarea;
        
        this.setCursor(textarea, Object.rangeData);
        oValue = textarea.value;
        atPos = parseInt(Object.pos) - parseInt(Object.len);
        var userStr = "";
        if (this.isBidi)
        	userStr = BidiUtils.addOverrideUCC("@" + BidiUtils.addEmbeddingUCC(txtData), "ltr");
        else
        	userStr = "@" +txtData;
        		
        nValue = oValue.substring(0,atPos) + userStr + " " + oValue.substring(Object.rangeData.end);
        nStart = nEnd = atPos + txtData.length +2;
        
        if (this.isBidi)
        	nStart = nEnd = nStart+4;
        
        st = textarea.scrollTop;
        textarea.value = nValue;
        if(this.widget){   	
        	this.widget.updateRemainLabel(textarea);
        }
        // after assignment, scrollTop is 0, reset scrollTop
        if(textarea.scrollTop != st) {
            textarea.scrollTop = st;
        }
        if (textarea.setSelectionRange) { // W3C
            textarea.setSelectionRange(nStart, nEnd);
        } else if (textarea.createTextRange) { 
            oValue = oValue.substring(Object.rangeData.end);
            st = oValue.replace(/\n/g,'').length;
            sR = document.selection.createRange();
            sR.moveEnd("character", -st);
            sR.select();
        }
    }, 

    getMentionsAt: function(textarea) {
         var _rangeData = this.getCursor(textarea);
         var k, _value;
         k=_value=_rangeData.text;
         
         var matched = "";
         var lastPos = _value.lastIndexOf("@");
         if(lastPos != -1){
        	 matched = _value.substring(lastPos+1, _value.length);
         }
         
         var _reg=/@[^@\s]{0,30}$/g;//To match 1~30 letters after @, no service provided after that 
         if(_value.indexOf("@")>= 0 && ( _value.match(_reg))) {
             var _postion=_rangeData.start;
             var _oValue = "@" + matched;
             if( _value.match(_reg) != null)          	 
            	 _oValue=_value.match(_reg)[0];//Find the last matched data in the given value
             var _AT={};// Store decorated data information for the text input 
             if(_oValue==="@"){
                 _AT['m'] = "";
                 _AT['l'] = _value.slice(0, -1).replace(/\n/g,'<br>'); //Letters before @  
                 _AT['r'] = '';//Letters after @ 
                 _AT['pos']=_postion;//Position of the curser 
                 _AT['len']=1;//The distance between @ and the curser
                 _AT['rangeData']=_rangeData;
                 _AT['textarea']=textarea;
                 this.showMentionDlg(_AT, dojo.hitch(this, this._loadDataHandler, _AT));
             }else if((/^@[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(_oValue) && !/\s/.test(_oValue))) {   
                 _AT['m'] = _oValue.slice(1);//User input letter. For example @li liwei, it is "liwei"
                 _AT['l'] = _value.slice(0, -_oValue.length).replace(/\n/g,'<br>'); //Letters before @   
                 _AT['r'] = k.slice(_postion - _oValue.length+1, k.length);//Letters after @ 
                 _AT['pos']=_postion;//Position of the curser 
                 _AT['len']=_oValue.length;//The distance between @ and the curser
                 _AT['rangeData']=_rangeData;
                 _AT['textarea']=textarea;
                 this.showMentionDlg(_AT, dojo.hitch(this, this._loadDataHandler, _AT));
             } else {
                 this.hideMentionDlg();
             }   
         } else {
             this.hideMentionDlg();
         }   
     },
     
	 drawTextarea: function(textarea){
        var node = dojo.getComputedStyle(textarea);
        var pl = node.paddingLeft;
        var pt = node.paddingTop;
         var _left= textarea.offsetLeft + parseInt(pl) + "px";   
         var _top= textarea.offsetTop + parseInt(pt) +"px";
         var _width= textarea.clientWidth +"px";  
         var _height= textarea.clientHeight +"px";
         var _lineHeight= dojo.style(textarea,"lineHeight")+"px";
         var Tstyle="lineHeight:"+_lineHeight+ ";width:"+_width+";height:"+
         (textarea.clientHeight -dojo.style(textarea,"lineHeight")+"px")+";left:"+_left+";top:"+_top;
         dojo.attr(this.atNode, "style", Tstyle);
     },
     
     //Utility method, which is used to know whether the input matches one of user name or not.
     isFullMatched: function(matched) {
    	 var list = this.items;				
    	 if (list && list.length > 0){
    		 for (var i=0; i<list.length;i++) {
    			 var name = list[i].name;
    			 var lname = name.toLowerCase();
    			 if(lname == matched){
    				 return true;
    			 }					 
    		 }
    	 }
    	 return false;
     },
     
     //To load mention data asynchronously 
     _loadDataHandler: function(obj, response, ioArgs){
    	 if (response instanceof Error) {
    		 console.log('Mention.js: Cannnot get editors from server');
    	 }
    	 if (this._checkObsoleted(this.textarea, obj.m)) return;
    	 var mItems = response ? response.items: [];
    	 if(mItems){
    		 var filtered = [];
    		 for(var f=0; f< mItems.length; f++){
    			 var item = mItems[f];
    			 if(item.member != null){
    				 filtered.push(item);
    			 }
    		 }
    		 this.items = filtered;
    		 //To check whether to apply paging technology 
    		 this.isPaged = filtered.length > this.pageNumber;
    		 this.actualLimit = filtered.length;
    		 if (this.items.length > 0){
    			 var counter = 0;
    			 var theName = null;
    			 var html = "<ul>"+ "<li class='title'>"+ this.nls.mentions +"</li>";
    			 if (this.isPaged) {   				 
    				 html += "<li tabindex='0' class='liprev hidden'> " +
    				 		"<a id= "+ this.prevId +" style='text-decoration: none;' class='btn prev' tabindex='0'" +
    				 		" role='button' title='"+ this.nls.prevBtn +"'>"+ this.nls.prevBtn +"</a></li>";
    			 }
    			 for (var i=0; i< this.items.length; i++) {
    				 var id = this.items[i].userid;
    				 var email = this.items[i].member;
    				 var name = this.items[i].name;
    				 if(name == null){
    					 var emailparts = email.split("@");
    					 name = emailparts[0];
    					 this.items[i].name = name;					 
    				 }			 
    				 var lname = name.toLowerCase();
    				 var lobjm = (obj.m).toLowerCase();
    				 if(obj.m !== "cache" && lname.indexOf(lobjm) == -1) continue;					
    				 if (this.isBidi)
    					 name = BidiUtils.addEmbeddingUCC(name);
    				 //escape xml for name and email
    				 name = concord.util.acf.escapeXml(name, true);
    				 email = concord.util.acf.escapeXml(email, true);
    				 var str = name+" &lt;"+email+"&gt;";
    				 if (this.isBidi)
    					 str = BidiUtils.addOverrideUCC(str,"ltr");
    				 html += "<li tabindex='0' value="+id+">" + str + "</li>";	
    				 counter ++;
    				 theName = lobjm;
    				 if(counter>= this.pageNumber) break;
    			 }
    			 var mentionHint = dojo.string.substitute(this.nls.mentionHint, [1, this.pageNumber, this.actualLimit]);
    			 if (this.isPaged) {
    				 html += "<li tabindex='0' class='linext'> <a id= "+ this.nextId +" style='text-decoration: none;' class='btn next' tabindex='0' " +
    				 		"role='button' title='"+ this.nls.nextBtn +"'>"+this.nls.nextBtn+"</a></li>";
    				 html += "<li class='lifooter' id="+ this.hintId +">"+mentionHint+"</li>";
    			 }else {
    				 mentionHint = dojo.string.substitute(this.nls.mentionHint, [1, this.actualLimit, this.actualLimit]);
    				 html += "<li class='lifooter' id="+ this.hintId +">"+mentionHint+"</li>";
    			 }
    			 html += "</ul>";
    			 if(counter == 0){
    				 html = "<ul>"+ "<li class='title'>"+ this.nls.noMentions +"</li></ul>";					
    			 } 
    			 this.singleMatched = (counter == 1 && this.isFullMatched(theName));
    			 this.buidMentionDlg(html,obj);
    			 return;
    		 } 
    		 
    	 }else{
    		 console.log('Mention.js: Cannnot get editors from server');
    	 }  
    	 this.hideMentionDlg();
     },
     
     //fetch user list from cached user store
     _fetchItems: function(obj){
    	 var counter = 0;
    	 var startArrayIndex = this.startIndex -1;
    	 for (var i=startArrayIndex; i< this.items.length; i++) {
    		 var id = this.items[i].userid;
    		 var email = this.items[i].member;
    		 var name = this.items[i].name;
    		 if(name == null){
    			 var emailparts = email.split("@");
    			 name = emailparts[0];
    			 this.items[i].name = name;					 
    		 }			 
    		 var lname = name.toLowerCase();
    		 var lobjm = (obj.m).toLowerCase();
    		 if(obj.m !== "cache" && lname.indexOf(lobjm) == -1) continue; //for local usage					
    		 if (this.isBidi)
    			 name = BidiUtils.addEmbeddingUCC(name);
			 //escape xml for name and email
			 name = concord.util.acf.escapeXml(name, true);
			 email = concord.util.acf.escapeXml(email, true);    		 
    		 var str = name+" &lt;"+email+"&gt;";
    		 if (this.isBidi)
    			 str = BidiUtils.addOverrideUCC(str,"ltr");
    		 var dataIndex = 3 + counter; //ignore li.title and li.prevous
    		 var lielem = dojo.query("li:nth-child("+dataIndex+")", this.userListNode)[0];
    		 if(lielem){
    			 lielem.innerHTML = str; 
    			 lielem.getAttribute("value", id);
    		 }			
    		 counter ++;
    		 theName = lobjm;
    		 if(counter>= this.pageNumber) break;
    	 }
    	 //Deal with items in the last page
    	 if(counter < this.pageNumber){
    		 for(var i = counter; i< this.pageNumber; i++){
    			 var dataIndex = 3 + i;//ignore li.title and li.prevous
    			 var lielem = dojo.query("li:nth-child("+dataIndex+")", this.userListNode)[0];
    			 dojo.addClass(lielem, "hidden");
    		 }
    	 }else {
    		 //if any hidden li element, display it in mention widget
    		 var hiddenli = this._filterNodes(dojo.query(".hidden",this.userListNode));
    		 if(hiddenli){
    			 hiddenli.forEach(dojo.hitch(this, function(editor){ dojo.removeClass(editor, "hidden");}));
    		 }
    	 }
    	 this._dynamicTop(obj);
    	 return counter;
     },
    
     _checkObsoleted: function(textarea, keyword) {
         var _rangeData = this.getCursor(textarea);
         var _value=_rangeData.text;
         
         var lastPos = _value.lastIndexOf("@");
         if(lastPos != -1){
        	 var matched = _value.substring(lastPos+1, _value.length);
        	 if(matched == keyword){
        		 return false;
        	 }
         }
         return true;
     },
     
     showMentionDlg : function(obj, handler){
    	 var url = concord.util.uri.getDocUri() + '?method=getUserList&permission=edit&';
    	 var isCommentExternal = window.g_isCommentExternal;
    	 var externalPrefix ="?";
    	 var params = "name=" + encodeURIComponent(obj.m) + "&maxlimit="+ this.maxLimit;
    	 if(isCommentExternal){
    		 var tmp = concord.util.uri.getAtUsersUri();
    		 if(tmp != "")
    			 url = tmp + externalPrefix + params;
    	 }else{
    		 url += params;	 
    	 }
    	 
    	 dojo.xhrGet({
    		 url: url,
    		 timeout: 6000,
    		 handleAs: "json",
    		 handle: handler,
    		 sync: false,
    		 preventCache: true,
    		 noStatus: true
    	 });				
     },
     
     //Create tip,set tip's position  
     buidMentionDlg : function(html, obj) {
    	 this.userListNode.innerHTML = html;
         var _left, _top, Ttop, citeOfs,
         _string = "<span>"+obj['l']+"</span>"+"<cite>@</cite>"+"<span>"+obj['r']+"</span>";
         this.atNode.innerHTML = _string ;
         citeOfs = dojo.query('cite', this.atNode)[0];
         _left= citeOfs.offsetLeft+ 10; //10px padding 
         var lineHeight = parseInt(dojo.style(this.atNode,"lineHeight"));
         _top = citeOfs.offsetTop + lineHeight;
         _top += this.textarea.offsetTop;
         Ttop =  parseInt(this.textarea.offsetTop + dojo.style(obj.textarea,"height"));
         if(_top > Ttop) {
             _top = Ttop;
         }
      
         if (this.isBidi && this.textarea.dir == 'rtl'){
        	 _left = this.textarea.offsetWidth - _left;
         }
         //Following code snippet is only for Comments.
         if(this.widget && this.widget.PopupNode) {
        	 var bHeight = concord.util.browser.getBrowserHeight();  //brower's height
        	 var _dlgTop = parseInt(dojo.style(this.widget.PopupNode, "top")); //249px ->249
        	 var _mHeight = 266; // 20px * (10 + title + next + footer) 
        	 if(!this.isPaged){ // not paged, to caculate the height due to the displayed data
        		 var len = this.items.length;
        		 _mHeight = 20 * (len +2) + 6; // 20px * (items + title + footer) + dv
        	 }
        	 if(bHeight - _dlgTop - _top < (_mHeight + 20)){ //prev button is caculated
        		 _top = _top - lineHeight - _mHeight;
        		 var titleNode = dojo.query("li.title", this.userListNode)[0];
        		 var footerNode = dojo.byId(this.hintId);
        		 dojo.place(footerNode, titleNode,"before");
        		 dojo.addClass(titleNode, "titledown");
        		 dojo.addClass(footerNode,"footerup");   
        		 var lastNode = dojo.query("li:last-child",this.userListNode)[0];
        		 dojo.place(titleNode, lastNode,"after");
        		 this.isUpShown = true;
        	 }
         }
 		          
         dojo.style(this.userListNode,{	
        	 "display":"block",
        	 "left":_left +"px",
        	 "top":_top +"px"
         });		 
         var querySelector = this.isPaged ? 3:2; 
         var defaultOn = dojo.query("li:nth-child("+ querySelector +")",this.userListNode)[0];
         if(defaultOn)
        	 dojo.addClass(defaultOn,"on");
         this._regMentionsEvents(obj);
         this.gObj = obj;
         dijit.setWaiRole(this.mentionsNode,'alert');
     },
     
     //To caculate top for mention widget after fetching items.
     _dynamicTop: function(obj){
    	 //if it is not mention widget in Comments, just return.
    	 if(this.widget && this.widget.PopupNode){  			 
    		 var citeOfs = dojo.query('cite', this.atNode)[0];
    		 var lineHeight = parseInt(dojo.style(this.atNode,"lineHeight"));
    		 var _top = citeOfs.offsetTop + lineHeight;
    		 _top += this.textarea.offsetTop;
    		 var Ttop =  parseInt(this.textarea.offsetTop + dojo.style(obj.textarea,"height"));
    		 if(_top > Ttop) {
    			 _top = Ttop;
    		 }
    		 //brower's height
    		 var bHeight = concord.util.browser.getBrowserHeight();
 			 var _dlgTop = parseInt(dojo.style(this.widget.PopupNode, "top")); //249px ->249
 			 var _mHeight = this.userListNode.clientHeight;
 			 if(bHeight - _dlgTop - _top < _mHeight || this.isUpShown){
 				 _top = _top - lineHeight - _mHeight; 
 			 }
 			 dojo.style(this.userListNode,{	"top":_top +"px"});
 		 }
     },
     
     hideMentionDlg: function() {
         var users = dojo.byId(this.userListNode);
         dojo.style(users,"display","none");
         this.li_Index = 0;
         this.startIndex = 1; //clean paging index state
         this.isPaged = false; //clean paging state
         this.isUpShown = false; //by default, showing mention dialog below Comments dialog
         for(var i=0; i<this.connectLiArray.length; i++){
             dojo.disconnect(this.connectLiArray[i]);
         }
     },
     //keyboard events handler for navigating mention user list page by page.
     mentionsSelect : function(textarea, key){
    	 dojo.removeAttr(this.mentionsNode,'role');  
 		 var prev = dojo.byId(this.prevId);
		 var next = dojo.byId(this.nextId);    	 
		 var onli = dojo.query(".on",this.userListNode)[0];                     
         var li = this._filterNodes(dojo.query("li", this.userListNode));
         var _len= li.length ;
         switch(key) {
             case dojo.keys.RIGHT_ARROW:
             case dojo.keys.DOWN_ARROW:
                 this.li_Index++;
                 if(this.li_Index > _len-1) {
                	 var nextCount = this._fetchNextItems(prev, next, this.gObj);
                	 if(nextCount == 0 && this.isPaged){
                		 this.li_Index--; //don't move
                		 break;
                	 }else{
                		 this.li_Index=0; //move to the first item in next page
                	 }
                 }
                 //If next li element is in hidden status, don't move
                 if(dojo.hasClass(li[this.li_Index], "hidden")){
                	 this.li_Index --;
                	 break;
                 }
                 this._selectMentionItem(li, onli);
                 break;
             case dojo.keys.LEFT_ARROW:    
             case dojo.keys.UP_ARROW:                      
                 this.li_Index--;   
                 if(this.li_Index<0) {   
                	 var prevCount = this._fetchPreviousItems(prev, next, this.gObj);
                	 if(prevCount == 0 && this.isPaged){
                		 this.li_Index++; // don't move
                		 break;
                	 }else{
                		 this.li_Index=_len-1; //move to the last item in previous page               		 
                	 }             	 
                 }   
                 this._selectMentionItem(li, onli);
                 break;
             case dojo.keys.PAGE_UP:
            	 var prevCount = this._fetchPreviousItems(prev, next, this.gObj);
            	 if(prevCount == 0 && this.isPaged){
            		 break;
            	 }else{
            		 this.li_Index= 0; //move to the first item in previous page               		 
            	 }             	   
                 this._selectMentionItem(li, onli);
                 break;
             case dojo.keys.PAGE_DOWN:
            	 var prevCount = this._fetchNextItems(prev, next, this.gObj);
            	 if(prevCount == 0 && this.isPaged){//don't move
            		 break;
            	 }else{
            		 this.li_Index = 0; //focus on the first item
            	 }
                 this._selectMentionItem(li, onli);           	 
            	 break;
             case dojo.keys.ENTER:
             case dojo.keys.SPACE:
                 var editor = dojo.query(".on",this.userListNode)[0];
                 var data = editor.innerHTML;
                 if (this.isBidi)
                 	data = BidiUtils.removeUCC(data);
                 var kIndex = data.indexOf(" &lt;");
                 data = data.substring(0,kIndex);
                 this.addMention(data, this.gObj);
                 this._cacheMentionData(editor, data);
                 this.hideMentionDlg();
                 break;
             case dojo.keys.ESCAPE:
            	 this.hideMentionDlg();
            	 this.textarea.focus();
             default:   
         };                        
     },
     
     //select the item with given index and apply css 'on'
     _selectMentionItem: function(li, onli){
         if(onli) { dojo.removeClass(onli,"on");}               	
         var selectedItem = li[this.li_Index];
         dojo.addClass(selectedItem,"on");
         selectedItem.scrollIntoView(false);
         selectedItem.focus();
         this._jawSupport(selectedItem);     	 
     },
     
     // onkeydown event handler for previous button and next button     
     _onKeyDown: function(obj, e){
    	 e = e || window.event;
    	 var key = (e.keyCode ? e.keyCode : e.which);
    	 if(key == 115 && (e.ctrlKey || e.metaKey)){
    		 if (e.preventDefault) 
    			 e.preventDefault();
    		 return;
    	 }            
    	 if (e.altKey || e.ctrlKey || e.metaKey) return;
    	 if (e.keyCode != dojo.keys.ENTER && e.keyCode != dojo.keys.SPACE) return;   
    	 this._onclick(obj, e);
     },
     // onclick event handler for previous button and next button
     _onclick: function(obj, event){
    	 var target = event.target;
    	 if (target == null) 
    		 target = event.srcElement; 
    	 var prev = dojo.byId(this.prevId);
    	 var next = dojo.byId(this.nextId);
    	 if(target == prev){
    		 this._fetchPreviousItems(prev, next, obj);
    	 }else if(target == next){
    		 this._fetchNextItems(prev, next, obj);
    	 } 
    	 dojo.stopEvent(event);	
     },
     
     _fetchPreviousItems: function(prev, next, obj){
    	 //It is the first item, no previous items any more
    	 if(this.startIndex == 1 || prev == null || next == null || obj == null) 
    		 return 0;
    	 this.startIndex -= this.pageNumber;
    	 if(this.startIndex == 1){
    		 dojo.addClass(prev.parentNode, "hidden");
    	 }else {
    		 dojo.removeClass(prev.parentNode, "hidden");
    	 }
    	 dojo.removeClass(next.parentNode, "hidden");	
    	 this._updateWarningHint();
    	 return this._fetchItems(obj);
     }, 
     
     _fetchNextItems: function(prev, next, obj){
    	 //It is in the last page, no next page any more
    	 if(this.startIndex >= this.actualLimit - this.pageNumber || prev == null || next == null || obj == null) 
    		 return 0;
    	 this.startIndex += this.pageNumber;
    	 if(this.startIndex >= this.actualLimit - this.pageNumber){
    		 dojo.addClass(next.parentNode,"hidden");
    	 }else {
    		 dojo.removeClass(next.parentNode, "hidden");
    	 }
    	 dojo.removeClass(prev.parentNode, "hidden");
    	 this._updateWarningHint();
    	 return this._fetchItems(obj);
     },
     
     
     //get the warning hint node and update its content accordingly
     _updateWarningHint: function(){
    	 var lsindex = this.startIndex;
    	 var lendIndex = this.startIndex + this.pageNumber -1;
    	 var lactualLimit = this.actualLimit;
    	 if(lendIndex > lactualLimit) {
    		 lendIndex = lactualLimit;
    	 }
    	 var hintNode = dojo.byId(this.hintId);
    	 hintNode.innerHTML = dojo.string.substitute(this.nls.mentionHint, [lsindex, lendIndex, lactualLimit]);
     },
     
     //To record selected mention user list
     _cacheMentionData: function(editor, data){
    	 var userid = editor.getAttribute("value");
    	 var mention = {};
    	 mention.userid = userid;
    	 mention.name = data;
    	 this.cachedMentionList.push(mention);
    	 //cache in this document category
    	 concord.widgets.sidebar.PopupCommentsCacher.setCachedMention(mention);
     },
     
     _jawSupport: function(selectedItem) {  
    	 this._filterNodes(dojo.query("li", this.userListNode)).forEach(dojo.hitch(this, function(editor){    		 
    		 if(selectedItem == editor){
    			 dijit.setWaiState(editor,'live', 'assertive');
    			 dijit.setWaiState(editor,'atomic', 'true');
    			 dijit.setWaiState(editor,'label',this.nls.jawsMentionSelected);
    			 dijit.setWaiRole(editor,'alert');
    		 }else{
    			 dijit.removeWaiState(editor,'live');
    			 dijit.removeWaiState(editor,'atomic');
    			 dijit.removeWaiState(editor,'label');
    			 dojo.removeAttr(editor,'role');    	
    		 }
    	 }));
     },
     //Utility method, which is used to filter liprev, linext, lifooter and title ul.li elements.
     _filterNodes: function(linodes){
  		var filtered = [];
 		for(var i=0; i<linodes.length; i++){
 			if(!dojo.hasClass(linodes[i], "liprev") && !dojo.hasClass(linodes[i], "linext") 
 					&& !dojo.hasClass(linodes[i], "lifooter") && !dojo.hasClass(linodes[i],"title")){
 				filtered.push(linodes[i]);
 			}
 		}
 		return filtered;
     },
     //Utility method, which is used to filter lifooter for none paging mentions
     _filterFooterNode: function(linodes){
   		var filtered = [];
  		for(var i=0; i<linodes.length; i++){
  			if(!dojo.hasClass(linodes[i], "lifooter")){
  				filtered.push(linodes[i]);
  			}
  		}
  		return filtered;
      },     
     //Utility method, which is used to get the index for the selected item in item list.
     _getOnIndex: function(li, onli){
    	 for(var index=0; index<li.length; index++){
    		 if(li[index] == onli){
    			 return index;
    		 }
    	 }
     },
     
     _regMentionsEvents : function(obj) {   
    	 //no event for the first li.title element
    	 this._regNoneClickEvent(dojo.query("li:first-child",this.userListNode)[0]); 		
    	 //no event for the last hint warning element
    	 this._regNoneClickEvent(dojo.query("li:last-child",this.userListNode)[0]); 
     	 if(this.isPaged){
     		var prev = dojo.byId(this.prevId);
     		var next = dojo.byId(this.nextId);
     		if(prev && next){ //register events for previous button and next button
     			this.connectLiArray.push(dojo.connect(prev, "onkeydown", dojo.hitch(this, this._onKeyDown, obj)));
     			this.connectLiArray.push(dojo.connect(next, "onkeydown", dojo.hitch(this, this._onKeyDown, obj)));	     	
     			this.connectLiArray.push(dojo.connect(prev.parentNode, "onclick", dojo.hitch(this, this._onclick, obj)));	
     			this.connectLiArray.push(dojo.connect(next.parentNode, "onclick", dojo.hitch(this, this._onclick, obj)));	
     		}
     		//register common events for element li without the first one (li.title), li.prev, li.next and li.hint
     		var linodes = dojo.query("li:not(:first-child)", this.userListNode);
     		this._regCommonEvent(this._filterNodes(linodes), obj);
     	}else{
     		//register common events for element li without the first one (li.title) and filter the last one
     		var linodes = dojo.query("li:not(:first-child)", this.userListNode);
     		this._regCommonEvent(this._filterFooterNode(linodes), obj);
     	}
     },
     
     _regNoneClickEvent: function(node){
    	 this.connectLiArray.push(dojo.connect(node, "onclick", dojo.hitch(this, function(e){
    		 dojo.stopEvent(e);
    	 })));    	 
     },
     
     //register common events for selected user list
     _regCommonEvent: function(userList, obj){
    	 userList.forEach(dojo.hitch(this, function(editor){
    		 this.connectLiArray.push(dojo.connect(editor, "onclick", dojo.hitch(this, function(){
    			 var data = editor.innerHTML;
    			 if (this.isBidi)
    				 data = BidiUtils.removeUCC(data);
    			 var kIndex = data.indexOf(" &lt;");
    			 data = data.substring(0,kIndex);     		 	
    			 this.addMention(data, obj);
    			 this._cacheMentionData(editor, data);     		 	
    			 this.hideMentionDlg();
    			 return false;                  		 	
    		 })));
    		 this.connectLiArray.push(dojo.connect(editor, "onkeydown", dojo.hitch(this, function(e){
    			 var _key = e.keyCode || e.charCode;
    			 if(_key==dojo.keys.ENTER || _key==dojo.keys.SPACE || _key==dojo.keys.UP_ARROW || _key==dojo.keys.DOWN_ARROW 
    					 || _key==dojo.keys.PAGE_UP || _key==dojo.keys.PAGE_DOWN || _key==dojo.keys.RIGHT_ARROW || _key==dojo.keys.LEFT_ARROW ){
    				 this.mentionsSelect(this.textarea,_key);
    				 dojo.stopEvent(e);
    			 }
    		 })));  			
    		 this.connectLiArray.push(dojo.connect(editor, "onmouseover", dojo.hitch(this, function(){
    			 var lion= dojo.query(".on",this.userListNode)[0];
    			 if(lion){dojo.removeClass(lion,"on");}
    			 dojo.addClass(editor,"on");
    			 var li = this._filterNodes(dojo.query("li", this.userListNode));
    			 this.li_Index = this._getOnIndex(li, editor);
    			 editor.focus();
    		 })));
    		 this.connectLiArray.push(dojo.connect(editor, "onmouseout", dojo.hitch(this, function(){
    			 dojo.removeClass(editor,"on");
    		 })));
    		 //connectArray.push(dojo.connect(editor, "onfocus", dojo.hitch(this, this.mouseOverEffect, index)));
    		 //connectArray.push(dojo.connect(editor, "onblur", dojo.hitch(this, this.mouseOutEffect, index)));                		 
    	 }));
     }
});
