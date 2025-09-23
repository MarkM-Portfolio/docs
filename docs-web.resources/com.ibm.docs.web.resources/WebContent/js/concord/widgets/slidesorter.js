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

/*
 * @slideSorter.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
dojo.provide("concord.widgets.slidesorter");
dojo.require("concord.util.HtmlContent");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.Menu");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.events");
dojo.require("concord.widgets.presDnDManager");
dojo.require("concord.widgets.presSource");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.task.PresTaskHandler");
//wangxum@cn.ibm.com
dojo.require("concord.widgets.notifyTool");
dojo.require("concord.util.emailParser");
dojo.require("concord.widgets.concordDialog");
//contentHandler
dojo.require("concord.widgets.PresContentHandler");
dojo.require("concord.widgets.SlideContent");
dojo.require("concord.widgets.slideSorterContextMenu");
dojo.require("concord.widgets.headerfooter.headerfooterUtil");
dojo.require("dojo.i18n");
dojo.require("concord.util.A11YUtil");

dojo.requireLocalization("concord.widgets","slidesorter");
dojo.requireLocalization("concord.util","a11y");

if(ProfilePool == null){
    ProfilePool = new concord.beans.ProfilePool();
}

dojo.declare("concord.widgets.slidesorter", null, {
    //contentHandler
    contentHandler:null,
    numLoadedSlideBuffer: 6,  //how many slides we want to load as buffer before and after the viewable slides
    _DISP: 0,
    _SLIDE_HEIGHT: null,
     _NUM_SLIDES_IN_VIEW: null,
    _SLIDE_IN_FIRST_POS: null,
    _OFFSETperSLIDE:0,
    _TASKDIVHEIGHT:17, //task div height now defined in css as 17 px, may need to calculate dynamically later on
    prevSc: 0, //previous scroll position, need to be set once
    officePrezDiv: null, // to get handle of office_presentation div that is used over and over by scrolling function to load/unload slide

    //orig Code
    presHtmlContent:null,
    moreHtmlContent:null,
    ckeditorInstanceName:"editor1",
    divContainerId:null,
    slideSorterPageClassName:"PM1_concord", //the name of the class/style for slidesorter slide level (draw_page), to show the sldiein thumbnail style
    ckeditorToolbarContainerId:null,
    contextMenusArray:  [],
    contextMenuStatusArray: [],
    slideSorterContextMenu: null,
    editor:null,
    CKEDITOR:null,
    //for selection: single select and multiselect
    slides: [],
    selectedSlide:null,  //used to send to slide editor when user click on a slide
    selectedSlideId: null,  //only used when contentReset during someone else applying master styles, to hold previously selected slide id before we do contentReset, to get true selected slide id at any given time, please use: this.selectedSlide.id
    multiSelectedSlides: [],   //always at least one item, the selectedSlide, the array is used to contain multiselection
    multiSelectedSlideIds: [],
    //for create footer
    slideSorterToolDivId:"slideSorterToolDiv",
    concordSlideSorterCssUrl: window.contextPath + window.staticRootPath + "/styles/css/presentations/concordslidesorter.css",
    // IE8 doesn't support scaling of images, so we need to load a special CSS
    //listSlideSorterCssUrl: window.contextPath + window.staticRootPath + "/styles/css/presentations/liststyles" + (dojo.isIE && dojo.isIE <= 8 ? '_ie8' : '') + ".css",
    listSlideSorterCssUrl: window.contextPath + window.staticRootPath + "/styles/css/presentations/liststyles.css",
    regExpListSlideSorterCssUrl: new RegExp(window.contextPath + window.staticRootPath + "/styles/css/presentations/liststyles\\w*\.css"),

    //for create new slide
    xmlHttpReq_master:null,
    xmlHttpReq_layout:null,
    masterHtmlDivId: "masterHtmlDiv",
    layoutHtmlDivId:"layoutHtmlDiv",
    messageDivId:"messageDiv",
    slideNumberDivId:"slideNumberDiv",
    slideNumberDiv:null,
    slideSorterToolsId:"slideSorterTools",
    layoutHtmlDocUrl: window.contextPath + window.staticRootPath + "/js/concord/templates/pageLayoutGalleryContent.html",
    supportedLayoutJSONPath: window.contextPath + window.staticRootPath + '/js/concord/widgets/layoutGallery/galleryLayoutIndex.json',
    supportedLayoutArray:null,  //contains associative array of layoutIds, e.g. supportedLayoutArray["ALT1"] = true;
    //for drag and drop
    slideSorterDndSource: null,
    CONTENT_BOX_TITLE_CLASS        : 'cb_title',
    CONTENT_BOX_SUBTITLE_CLASS    : 'cb_subtitle',
    CONTENT_BOX_OUTLINE_CLASS    : 'cb_outline',

    //for task assignment
    presBean:null,
    authUser:null,
    //docAcl:null,

    taskHandler:null,
    //for notification wangxum@cn.ibm.com
    notifyTool:null,
    
    ctxMemLeakHash: [],
    slideCssAppliedCtr: null,
    docStaticRootPath:null,
    newStaticRootPath: null,
    presContentHtmlStrToSync: null,
    // for partial rendering
    initSlideNum: null,
    fetchSlideNum: null,
    intervalSlide: null,
    _getMoreSlideTimer: null,
    _requestMoreHtmlContentTimer: null,
    listBeforeStyleSheet:null,
    oldListBeforeStyleStack:[],// for keep numbering&bullet styles during copy&paste

    newStyle:{},
    delStyle:[],

    // external css from two css files
    officeAutomaticStylesMap:null,
    officeStylesMap:null,   

    // inline css from content.html
    internalCssMap:null,
    
    // for paste process
    currentInPaste:false,
    maxPasteSlidesNum:5,

    //for master
    //currMaster: the first object is to hold name or id of title page master style, the second object is to hold name or id of title/subtitle page master style
    //to be used to query the detail master info stored in master div.
    currMaster:{"masterName":"", "masterPages":[{"name":""},{"name":""}],"masterTemplateDataJSONStr":""},
    currMasterFrameStylesJSON:{"title":"",
                               "subtitle":"",
                               "text_title":"",
                               "text_outline":"",
                               "default_text":"",
                               "default_title":"",
                               "masterStyleCss":"",
                               "footer":"",
                               "datetime":"",
                               "pagenumber":"",
                               "text_footer":"",
                               "text_datetime":"",
                               "text_pagenumber":""},

    saveMasterUrl: window.contextPath+"/SaveTemplateServlet",

    //slide sorter tool Div
    slideSorterToolDivHeight: 20, //20px

    //for cut/copy and paste slides
    slidesToCopy: null,
    PASTE_AFTER: "after",
    PASTE_BEFORE: "before",

    //for DND drag and drop
    isDNDSession: false,
    dndCmdList : [],
    //shortcut keys
    // Events that we care for
    CTRL_A             :        concord.util.events.keypressHandlerEvents_eventAction_CTRL_A,
    CTRL_C             :        concord.util.events.keypressHandlerEvents_eventAction_CTRL_C,
    CTRL_X             :        concord.util.events.keypressHandlerEvents_eventAction_CTRL_X,
    CTRL_V             :        concord.util.events.keypressHandlerEvents_eventAction_CTRL_V,
    CTRL_M            :        concord.util.events.keypressHandlerEvents_eventAction_CTRL_M,
    DELETE            :        concord.util.events.keypressHandlerEvents_eventAction_DELETE,
    BACKSPACE        :        concord.util.events.keypressHandlerEvents_eventAction_BACKSPACE,
    DOWN_ARROW        :        concord.util.events.keypressHandlerEvents_eventAction_DOWN_ARROW,
    UP_ARROW        :        concord.util.events.keypressHandlerEvents_eventAction_UP_ARROW,
    LEFT_ARROW        :        concord.util.events.keypressHandlerEvents_eventAction_LEFT_ARROW,
    PAGE_DOWN        :        concord.util.events.keypressHandlerEvents_eventAction_PAGE_DOWN,
    PAGE_UP            :        concord.util.events.keypressHandlerEvents_eventAction_PAGE_UP,
    RIGHT_ARROW        :        concord.util.events.keypressHandlerEvents_eventAction_RIGHT_ARROW,
    HOME             :        concord.util.events.keypressHandlerEvents_eventAction_HOME,
    END                :        concord.util.events.keypressHandlerEvents_eventAction_END,
    ENTER            :        concord.util.events.keypressHandlerEvents_eventAction_ENTER,
    SHIFT_F10        :        concord.util.events.keypressHandlerEvents_eventAction_SHIFT_F10,
    SORTER_SLIDE_TYPE        : 'sorterSlide',
    userLocks        :    [],
    connectArray    : [],  //41744

    //for co-editing
    currentScene:null,

    isCkeInstanceReady: false,
    showSlideSorter: true,
    //contains localization strings
    STRINGS            	 : null,

    // Slide sorter height based on page format.
    // Currently used by create new slide though free to be used by all.
    slideHeight: 98,  // (px) Default page height based on original 4:3 ratio

    // The variable name of the instance of this class needs to be stored because
    // the row styler needs to call a row styling function that is part of this class.
    // The call is made from the exhibit so it needs a global variable name

    slideSelectedTimeStamp: 0, // this variable is used to determined when to tell the slideEditor to load slide and widgitize content
    slideSelectedSpeed: 500, //in ms if user selects slide faster than this time than do not widgitize content
    slideSelectedTimeout: null, // handle to settimeout for slide selected

    contentLangClassName: null,  // content.html language classname, set in the body tag of content.html when the doc is created the first time

    preScrolltime: null,
    
    maxSlideNum: 300,  // the value is the same as the one in conversion config, should be changed when the conversion config changed.

    constructor: function(divContainerIdStr, ckeditor, presHtmlContent, ckeditorToolbarId, presDocBean, authUser, getFocusComponent, currentScene)
    {
        dojo.subscribe("/dnd/start", null, dojo.hitch(this,this.dndStart));
        dojo.subscribe("/dnd/drop", null, dojo.hitch(this,this.dndDrop));
        dojo.subscribe("/dnd/cancel", null, dojo.hitch(this,this.dndCancel));
        dojo.subscribe("/dnd/drop/after", null, dojo.hitch(this,this.dndDropAfter));
        this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slidesorter");
        this.a11ySTRINGS = dojo.i18n.getLocalization("concord.util","a11y");
        this.presHtmlContent = presHtmlContent;
        this.divContainerId = divContainerIdStr;
        this.presBean = presDocBean;
        this.authUser = authUser;
        this.currentScene = currentScene;
        this.ckeditorToolbarContainerId = ckeditorToolbarId;
        this.CKEDITOR = ckeditor;
        this.getFocusComponent = getFocusComponent;

        //initialize the slide sorter, loading the presentationhtml in a ckeditor instance
        this.initSlideSorter();
        
        //the slideNumberDiv
        if(this.currentScene.sceneInfo.mode == "edit"){
            this.slideNumberDivId = this.currentScene.sideBarSlideSorterPaneId +'_button_title';
            //get a handle of slideNumberDiv
            this.slideNumberDiv = document.getElementById(this.slideNumberDivId);
        }
        console.log("slidesorter:end constructor");
    },

    updateContextMenuOptions: function() {
        var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_updateContextMenuOptions}];
 		dojo.publish(concord.util.events.slideSorterEvents, eventData);
        if(this.slideSorterContextMenu!=null){
            this.slideSorterContextMenu.updateContextMenuOptions();
        }
    },

    deleteFromContextMenusArray: function(slideElem){
        this.contextMenuStatusArray[ slideElem.id]=null;
        delete this.contextMenuStatusArray[ slideElem.id];
    },

    destroyContexMenus: function(){
        if (this.slideSorterContextMenu){
            this.slideSorterContextMenu.destroyRecursive();
            this.slideSorterContextMenu = null;
        }
    },

    updateContextMenu : function(slideElem,menuItemToUpdateId,paramObj,isToHide){
        if(slideElem!=null && menuItemToUpdateId!=null && dojo.trim(menuItemToUpdateId) !=""){
            
            var ctxMenuStatus = this.contextMenuStatusArray[slideElem.id];
            
            if(!ctxMenuStatus){
                this.contextMenuStatusArray[ slideElem.id] = {};
                ctxMenuStatus = this.contextMenuStatusArray[slideElem.id];
            } 
            
            ctxMenuStatus[menuItemToUpdateId] = [];
            if( isToHide == null){
                ctxMenuStatus[menuItemToUpdateId].isToHide = false;
            } else {
                ctxMenuStatus[menuItemToUpdateId].isToHide = isToHide;
            }
            ctxMenuStatus[menuItemToUpdateId].paramObj = paramObj;

            if ( this.selectedSlide.id == slideElem.id && this.slideSorterContextMenu){
                this.slideSorterContextMenu.updateContextMenuItem(menuItemToUpdateId, paramObj, isToHide);
            }
        }
    },

initSlideSorter: function(){

        //getDOCACL
//        this.docAcl = this.getDocAcl();

        //prepare presentation content
        this.prepPresContent(this.presHtmlContent); //setting this.presHtmlContent to a initContentShell

        var slideSorterDiv = document.getElementById(this.divContainerId);
        slideSorterDiv.style.visibility="hidden";
        //slideSorterDiv.style.visibility="visible"; //FOR DEBUG ONLY
        //slideSorterDiv.style.display="none";


        //create slidesorter header div to be put at the toplater
        var slideSorterToolDiv = document.createElement("div");
        slideSorterToolDiv.id=this.slideSorterToolDivId;
        slideSorterToolDiv.setAttribute("class", "slideSorterTool");
        //slideSorterToolDiv.innerHTML="TOOL DIV HERE";
        slideSorterToolDiv.style.visibility="hidden";
        slideSorterDiv.appendChild(slideSorterToolDiv);
        //insert content to slidesorter tool
        this.buildSlideSorterTool();
        //JMT- not used with new sidebar this.connectSlideSorterToolTips();
        slideSorterToolDiv.style.display="none";


        var txtArea = document.createElement("textarea");
        slideSorterDiv.appendChild(txtArea);
        txtArea.value=this.presHtmlContent;
        //set id and name
        txtArea.id = this.ckeditorInstanceName;
        txtArea.name = this.ckeditorInstanceName;

        //create hidden div for master html
        var masterHiddenDiv = document.createElement("div");
        masterHiddenDiv.id=this.masterHtmlDivId;
        masterHiddenDiv.style.visibility="hidden";
        masterHiddenDiv.style.display="none";
        slideSorterDiv.appendChild(masterHiddenDiv);

        //create hidden div for layout html
        var layoutHiddenDiv = document.createElement("div");
        layoutHiddenDiv.id=this.layoutHtmlDivId;
        layoutHiddenDiv.style.visibility="hidden";
        layoutHiddenDiv.style.display="none";
        slideSorterDiv.appendChild(layoutHiddenDiv);
        this.loadForLayout();

        //Temp Div for messages to Users
        var msgDiv = document.createElement("div");
        msgDiv.id=this.messageDivId;
        msgDiv.style.display="none";
        slideSorterDiv.appendChild(msgDiv);
        
        // for partial rendering
        this.initSlideNum = 5;
        this.fetchSlideNum = 10;
        this.intervalSlide = 300;  // in ms

        //instantiating CKEditor
        var divContainerHeight = slideSorterDiv.offsetHeight;
        var ckeditor_height = divContainerHeight;
        if(divContainerHeight == ""){
            ckeditor_height = "0";
        }

        if(divContainerHeight != null && divContainerHeight !=""){
            var divContainerHeightInt = divContainerHeight;
            var slideSorterToolHeight = slideSorterToolDiv.offsetHeight;
            var slideSorterToolDivHeightInt = slideSorterToolHeight;
            ckeditor_height = divContainerHeightInt - slideSorterToolDivHeightInt;
        }



        var remove = 'coediting,contextmenu,clipboard,elementspath,scayt,menubutton,maximize,resize,task,comments,concordtoolbar,messages,menubar,fixedwidthpage, browserresizehandler,dialog,maximize,sourcearea,enterkey,concordscayt,concordfindreplace,showborders,selection';
        var extra = concord.util.editor.getExtraPlugins(true);
        this.editor= this.CKEDITOR.replace(txtArea,
                {
                    height: ckeditor_height,
                    sharedSpaces :
                    {
                        top : this.ckeditorToolbarContainerId
                    },
                    theme: 'presentation',
                    extraPlugins: extra,
                    // Removes the maximize plugin as it's not usable
                    // in a shared toolbar.
                    // Removes the resizer as it's not usable in a
                    // shared elements path.
                    removePlugins : remove,
                    contentsCss: [],
                    resize_enabled: false,
                    fullPage : true,
                    toolbarCanCollapse: false
                    });

        //set up CKEDITOR variables
        this.editor.docBean = this.presBean;
        this.editor.user = this.authUser;
        this.editor.currentScene = this.currentScene;

        //subscribe to events

        dojo.subscribe(concord.util.events.presSceneEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.presSceneEvents_Resize, null, dojo.hitch(this,this.handleSubscriptionEvents_PresScene_Resize));
        dojo.subscribe(concord.util.events.presSceneEvents_Render, null, dojo.hitch(this,this.handleSubscriptionEvents_PresScene_Render));
        dojo.subscribe(concord.util.events.presMenubarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsPresMenuBar));
        dojo.subscribe(concord.util.events.presToolbarEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.slideEditorEvents, null, dojo.hitch(this,this.handleSubscriptionEventsSlideEditor));
        dojo.subscribe(concord.util.events.slideEditorEvents_Focus, null, dojo.hitch(this,this.handleSubscriptionEventsSlideEditor_Focus));
        dojo.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.coeditingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsCoediting));
        //dojo.subscribe(concord.util.events.notificationEvents, null, dojo.hitch(this.notifyTool,this.notifyTool.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.slideShowEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
        dojo.subscribe(concord.util.events.undoRedoEvents, null, dojo.hitch(this,this.handleSubscriptionEventsUndoRedo));
        dojo.subscribe(concord.util.events.commenttingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsCommenting));

        dojo.subscribe(concord.util.events.slideSorterEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForSetFocusEvent));
        dojo.subscribe(concord.util.events.presMenubarEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForLostFocusEvent));
        dojo.subscribe(concord.util.events.presToolbarEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForLostFocusEvent));
        dojo.subscribe(concord.util.events.slideEditorEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForLostFocusEvent));

        dojo.subscribe(concord.util.events.sideBarEvents, null, dojo.hitch(this,this.handleSubscriptionForSideBarEvent));

        this.editor.on('instanceReady',dojo.hitch(this,this.instanceReadyHandle));

        this.editor.on('contentDom',dojo.hitch(this,this.contentDomHandle));        

    },

    contentDomHandle: function() {
        // fix table column widths and row heights (if necessary)
       // this.fixTableStylings();
        // console.profile("pres::contentDom");
        
        var presDiv = dojo.query('.office_presentation', this.editor.document.$);
        if(presDiv!=null && presDiv.length>0){
            if(BidiUtils.isGuiRtl())
            	dojo.attr(presDiv[0], 'dir', 'rtl');

            //check if we have any preventCache links in place and remove them
            //get style elements
            var styleNodeList = concord.util.HtmlContent.getStyleElements(this.editor.document.$);
            var styleElementsArray = [];
            for(var i = 0; i< styleNodeList.length; i++){
                if(!dojo.hasAttr(styleNodeList[i],"cke_temp")){
                    styleElementsArray.push(styleNodeList[i].cloneNode(true));
                }
            }
            //get link elements
            var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$);
            var linkElementsArray = [];
            var isJsTemplateDesignExist = false;
            for(var i = 0; i< linkNodeList.length; i++){
                var href = linkNodeList[i].getAttribute("href");
                var src = linkNodeList[i].getAttribute("src");
                if(href!=null){
                    var concordSlideSorterCssIdx = href.indexOf(this.concordSlideSorterCssUrl);
                    var listSlideSorterCssIdx = this.regExpListSlideSorterCssUrl.test(href);
                    var jsTemplateDesignCssIdx = href.indexOf("/js/concord/widgets/templateDesignGallery/");
                    // D28633: [IE][Regression] Revert to last version font style restored to plain unexpectedly.
                    // Create link reference for slide sorter with preventCache to avoid existed cache impact
                    // The 'href' does not contain '/' so remove in the condition text
                    if(href.indexOf("office_styles.css") != -1){ //if we found the officeStyles.css
                        //linkNodeList[i].href = concord.util.uri.getEditAttUri("office_styles.css") + "?preventCache=" + Math.random();
                    }else if(href.indexOf("office_automatic_styles.css") != -1 ){ //if we found the officeAutomaticStyles.css
                        //linkNodeList[i].href = concord.util.uri.getEditAttUri("office_automatic_styles.css") + "?preventCache=" + Math.random();
                    }else if (href.indexOf("/liststyles.css") != -1 && listSlideSorterCssIdx ==false){
                        //if a liststyles.css but not the same staticRootDoc (valid current css url), remove it, we'll build again later.
                        //remove the listSlideSorterCss
                        dojo.destroy(linkNodeList[i]);
                    }else if(href.indexOf("/concordslidesorter.css") != -1 && concordSlideSorterCssIdx <0 ){
                        //remove the concordslidesorter.css link if it is not the same staticRootDoc (valid current css url)
                        dojo.destroy(linkNodeList[i]);
                    }else if(jsTemplateDesignCssIdx>=0){
                        var idx = href.indexOf("/templateDesignGallery/");
                        var subStrUrlString = href.substring(idx+23);
                        newUrlString = window.contextPath + "/presTemplateDesignGallery/"+ subStrUrlString;
                        linkNodeList[i].setAttribute("href", newUrlString);
                        isJsTemplateDesignExist = true;
                    }

                    if (concordSlideSorterCssIdx < 0 && listSlideSorterCssIdx == false){
                        linkElementsArray.push(linkNodeList[i].cloneNode(true));
                    }

                }else if(src!=null){
                    var concordSlideSorterCssIdx = src.indexOf(this.concordSlideSorterCssUrl);
                    var listSlideSorterCssIdx = this.regExpListSlideSorterCssUrl.test(src);
                    var jsTemplateDesignCssIdx = src.indexOf("/js/concord/widgets/templateDesignGallery/");
                    if(jsTemplateDesignCssIdx>=0){
                        var idx = src.indexOf("/templateDesignGallery/");
                        var subStrUrlString = src.substring(idx+23);
                        newUrlString = window.contextPath + "/presTemplateDesignGallery/"+ subStrUrlString;
                        linkNodeList[i].setAttribute("src", newUrlString);
                        isJsTemplateDesignExist = true;
                    }
                    if (concordSlideSorterCssIdx < 0 && listSlideSorterCssIdx == false){
                        linkElementsArray.push(linkNodeList[i].cloneNode(true));
                    }

                }
            }
            //inject concordslidesorter.css
            concord.util.uri.injectCSS (this.editor.document.$, this.concordSlideSorterCssUrl, false);
            concord.util.uri.injectCSS (this.editor.document.$, this.listSlideSorterCssUrl, false, true);
            PresCKUtil.createListStyleSheetinViewMode(this.editor.document.$);
            
            //cancel out native browser oncontextMenu
            this.editor.document.$.oncontextmenu = function(e) { return false; };
            this.editor.document.$.body.parentNode.oncontextmenu = function(e) { return false; };
            document.body.oncontextmenu = function() { return false; };
            
            // set default font family
            this.editor.document.$.body.style.fontFamily = window.pe.scene.defaultFonts;

            this.officePrezDiv = presDiv[0];
            //hide all the slides until all slide resources are done loading
            presDiv[0].style.visibility = 'hidden'; //TO UNCOMMENT
            //presDiv[0].style.visibility = 'visible'; // FOR DEBUG ONLY
            if(concord.util.browser.isMobile())
            {
            	this.officePrezDiv.style.overflow = "scroll";
            	if(concord.util.browser.isMobileVersionGreaterOrEqual("7.0"))
            	{
            		this.officePrezDiv.style.webkitOverflowScrolling = "auto";
                	setTimeout(dojo.hitch(this,function(){this.officePrezDiv.style.webkitOverflowScrolling = "touch";}), 0);
            	}
            	else
            		this.officePrezDiv.style.webkitOverflowScrolling = "touch";
                var body = this.editor.document.getBody();
            	var padding = 0;
            	if(body)
            	{
            		padding = parseInt(body.getComputedStyle("margin"));
            		this.officePrezDiv.style.padding = padding+"px";
            		body.$.style.margin = "0px";
            	}
            	var divHeight = parseInt(document.getElementById(this.divContainerId).style.height)-2*padding;
            	this.officePrezDiv.style.height = divHeight+"px";
            }

            // wai-aria tags
            var iframe = document.getElementById('cke_' + this.ckeditorInstanceName).getElementsByTagName("iframe")[0];
            if (iframe) {
                dojo.attr(iframe,'title',this.a11ySTRINGS.aria_slide_sorter_label);
            }
            concord.util.A11YUtil.createLabels(this.editor.document.$.body);
            dijit.setWaiRole(presDiv[0],'main');
            dijit.setWaiState(presDiv[0], 'label',this.a11ySTRINGS.aria_slide_sorter_label);

            SYNCMSG.initDocNodes(this.editor.document.$);
            /*
            //defect 9611 - to avoid sending the whole doc as msg everytime first load, we comment out the following (rolling back 8759)
            // defect 8759 - check if there is a need to send content reset to server just in case static root path has change
            if((this.docStaticRootPath != this.newStaticRootPath) || (this.presContentHtmlStrToSync!=null)){
                var msgPairList2 = SYNCMSG.createResetContentMsg(MSGUTIL.msgType.ResetContent, [], null, this.presContentHtmlStrToSync);
                SYNCMSG.sendMessage(msgPairList2, SYNCMSG.NO_LOCAL_SYNC);
                this.presContentHtmlStrToSync = null;
            }
            */
            //send content reset if we need to change templateDesignGallery (master style)'s css url due to old doc or build number
            //defect # 9611 - we move out templateDesignGallery folder to different folder structure, need to update the old occurances
            //still in question do we REALLY need to update it to synch with actual document on server? we always update it on client.
            if(isJsTemplateDesignExist == true){
                var contentHtml = this.getSlideSorterPresContentHtml();

                var msgPairList = SYNCMSG.createResetContentMsg(MSGUTIL.msgType.ResetContent, [], null, contentHtml);
                SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
            }

            // this.refreshSlidesObject(); //populate this.slides object
            this.slides = dojo.query('.draw_page', this.officePrezDiv);  // no need to update the slide number at beginning

            this.calculatePageHeights();
            // this.loadForMaster();
            
            var prevSelectedSlideId = this.selectedSlideId;

            //turn design mode off
            if(dojo.isIE){
                this.editor.document.$.body.contentEditable = false;
            }else{
                this.editor.document.$.designMode = "off";
                this.editor.document.$.body.contentEditable = false;
            }
            dojo.addClass(this.editor.document.$.body,"concord");
            if (CKEDITOR.env.hc)
                dojo.addClass(this.editor.document.$.body,"dijit_a11y");

            // story 13127 - saving the language classname to document and be persistent,
            this.handleContentLanguage();

            this.editor.document.getBody().disableContextMenu();

            //delete any leftover dnd placeholder img
            var dndPosImgs = dojo.query(".dndDropPosBefore, .dndDropPosAfter", this.editor.document.$);
            for(var i=0; i<dndPosImgs.length;i++){
                dojo.destroy(dndPosImgs[i]);
            }

            //if there is a previously selected slide, select the slide (in changed template by other user scenario)
            //else selectedSlide is first slide

            //if there is a previously multiselectedSlides, preserve the multiselected slides by reselecting those with new DOM (in changed template by other user scenario)
            //else, multiselectedSlides is new array and push first slide


            if(prevSelectedSlideId != null){
                this.selectedSlide = this.editor.document.$.getElementById(prevSelectedSlideId);
                if (!this.selectedSlide)
                    this.selectedSlide = this.slides[0];
            }
            else{
                this.selectedSlide = this.slides[0];
            }

            if (typeof this.selectedSlide != "undefined" && this.selectedSlide != null) {
                //add class to selected slide
            	if (!concord.util.browser.isMobile()) {
            		// do not add this class for mobile
                    dojo.addClass(this.selectedSlide,'slideSelected');
            	}

                //load selected slide, so that simulateClick on the selected slide would work, 
                //because we are attaching event on the load
                // this.loadSlideToSorter(this.selectedSlide);
                this.prepareForSlide(this.selectedSlide, 1);
            }

            this.multiSelectedSlides = [];
            if(this.multiSelectedSlideIds != null && this.multiSelectedSlideIds.length>0){
                for(var i=0; i < this.multiSelectedSlideIds.length; i++){
                    var slide = this.editor.document.$.getElementById(this.multiSelectedSlideIds[i]);
                    if(slide!=null){
                        this.multiSelectedSlides.push(slide);
                        //add class to selected slide
                        if (!concord.util.browser.isMobile()) {
                    		// do not add this class for mobile
                        	dojo.addClass(slide,'slideSelected');
                        }
                    }
                }
            }

            if (typeof this.selectedSlide != "undefined" && this.selectedSlide != null)
            {
                var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(this.selectedSlide);
                if(idxInMultiSelectSlides <0){
                    this.multiSelectedSlides.push(this.selectedSlide);
                }
            }
            
            var layoutHtmlDiv = document.getElementById(this.layoutHtmlDivId);

            //send events that slideSorter is ready
            var eventData = [{eventName: concord.util.events.slideSorterEvents_eventName_slideSorterReady,
            	cssFiles:['office_styles.css','office_automatic_styles.css'],
            	styleElements:styleElementsArray,
            	linkElements:linkElementsArray,
            	layoutHtmlDiv:layoutHtmlDiv,
            	editorName:this.ckeditorInstanceName}];
            dojo.publish(concord.util.events.slideSorterEvents, eventData);

            //do something with dojo to work with document content.html
            //1. direct the dojo to work with iframe dom
            //2. create the dnd source and dndItem
            //3. parse

            if(this.isCkeInstanceReady == true){
                var eventData = [{eventName:concord.util.events.slideSorterEvents_eventName_afterContentDom}];
                dojo.publish(concord.util.events.slideSorterEvents, eventData);
            }

            // every 100ms check to see if css has been applied to slide thumbnails
            this.slideCssAppliedCtr = 0;
            var isFromContentReset = !(this.selectedSlide == this.slides[0]);
            setTimeout(dojo.hitch(this, this.checkIfContentLoaded, isFromContentReset), 100);

            this.setScrollEvents(); //setting scroll event
        }

        // move this function to 'slideSorterFinalRendered'
        //this.spellChecker = window.spellcheckerManager.createSpellchecker(this.editor.document.getWindow().$.frameElement, false);
        // console.profileEnd();
        

    },

    createSlideUtilDiv: function(slideElemArray){
        if(slideElemArray == null){
            slideElemArray = this.slides;
        }
        for(var i=0; i< slideElemArray.length; i++){

            var slideWrapper = slideElemArray[i].parentNode;
            var slideUtilDivQueries = dojo.query(".slideUtil", slideWrapper);
            if(slideUtilDivQueries.length<=0){ //create it if it doesn't exist
                var slideUtilDiv = document.createElement("div");
                dojo.addClass(slideUtilDiv, "slideUtil");
                dijit.setWaiState(slideUtilDiv,'hidden','true');
                var slideNumberDiv = document.createElement("div");
                dojo.addClass(slideNumberDiv, "slideNumber");
                slideNumberDiv.innerHTML="1";
                slideUtilDiv.appendChild(slideNumberDiv);
                //create slide transition icon
                var slideTransitionIconDiv = document.createElement("div");
                concord.util.HtmlContent.injectRdomIdsForElement(slideTransitionIconDiv);
                var transitionIcon = this.getTransitionType(slideElemArray[i]);
                dojo.addClass(slideTransitionIconDiv, transitionIcon);
                slideUtilDiv.appendChild(slideTransitionIconDiv);

                slideWrapper.appendChild(slideUtilDiv);
            }
        }
        this.refreshSlidesObject();
    },

    removeSlideUtilDiv: function(slideWrapperArray){
        if(slideWrapperArray!=null){
            for(var i=0; i< slideWrapperArray.length; i++){

                var slideWrapper = slideWrapperArray[i];
                var slideUtilDivQueries = dojo.query(".slideUtil", slideWrapper);
                if(slideUtilDivQueries.length>0){
                    dojo.destroy(slideUtilDivQueries[i]);
                }
            }
        }
    },

    //
    //D41744
    //
    handleDndSrc: function(){
        var presNode= this.officePrezDiv;

        var dndItems = dojo.query('.slideWrapper');
        for (var i=0; i<dndItems.length; i++){
            dojo.addClass(dndItems[i],'dojoDndItem');
        }

        if (typeof presNode != "undefined")
        {
            this.slideSorterDndSource = new concord.widgets.presSource(presNode,{delay:5});
        }
        dojo.parser.parse();
    },

    /*
     * Calculate the page heights based on page format attributes passed
     * in to the draw page elements.  Since there can now be predefined
     * or user defined page sizes, need to accound for these instead of the
     * default 4:3 ratio used previously.
     */
    calculatePageHeights: function()
    {
        // Default pageRatio value 4:3
        var pageRatio = 0.75; // Default pageRatio for a 4:3 presentation

        var pageHeight = "", pageWidth = "";
        //var pageUnits = "", pageOrientation = "";

        if(this.slides != null )
        {
            pageHeight = this.slides[0].getAttribute('pageheight');
            pageWidth = this.slides[0].getAttribute('pagewidth');
            //pageUnits = this.slides[0].getAttribute('pageunits');
            //pageOrientation = this.slides[0].getAttribute('orientation');

            // If pageHeight is not set then put the original 4:3
            // default value for height.  When editor allows this to
            // be set, will need to update.
            if (pageHeight == null)
            {
                pageHeight = 21;  // Default 21cm for a 4:3 presentation
            }
        }

        if (pageHeight != null && pageHeight != "" && pageWidth != null && pageWidth != "")
        {
            pageRatio = concord.util.resizer.getRatio(pageHeight, pageWidth);
        }

        if(this.slides != null && this.slides.length > 0)
        {
            // Original default value for 4:3 page format
            var slideWidth = 130;

            // TODO:  Dynamically grab the slide width.  currently this is
            // a hardcoded value in concordslidesorter.css which has
            // been set here as a constant.  In case this changes would
            // be safer to grab it dynamically.
//        var windowObj = this.editor.document.getWindow().$;
//        var divElement = this.slides[0];
//        if (divElement.currentStyle)
//        {
//            // IE Opera
//            slideWidth = divElement.currentStyle.width;
//        }
//        else
//        {
//            //Firefox
//            if (windowObj.getComputedStyle(divElement,'') != null)
//            {
//                slideWidth = windowObj.getComputedStyle(divElement,'').getPropertyValue('width');
//            }
//        }

            // Set the pageHeight globally
            this.slideHeight = slideWidth * pageRatio;
            
            var fontSize = PresCKUtil.getBasedFontSize(this.slideHeight,pageHeight);

            // Needs to be set per slide inlined on the style to override the
            // PM1_Concord height and font size default values
            for (var i=0; i<this.slides.length; i++)
            {
                this.slides[i].style.height = this.slideHeight + 'px';
                this.slides[i].style.fontSize =  fontSize + 'px';
                //dojo.style(this.slides[i], "fontSize", fontSize);
            }
        }
    },

     /**
     * Update the header footer date and time fields for the slides
     * in the slide sorter.
     *
     * @param slide Slide to update the header footer date time field.  If
     * this is null then all the slides will be updated.
     */
    updateHeaderFooterDateTimeFields: function(slides)
    {
        // If slide passed in process just that slide.  If no slides
        // are passed in then process all slides.

        if (slides != null) {
            concord.widgets.headerfooter.headerfooterUtil.updateHeaderFooterDateTimeFields(slides);
        }
        else
        {
            if(this.slides != null && this.slides.length > 0)
            {
                for (var i=0; i<this.slides.length; i++)
                {
                    concord.widgets.headerfooter.headerfooterUtil.updateHeaderFooterDateTimeFields(this.slides[i]);
                }
            }
        }
    },

    /**
     * Update the page number fields of a slide.  This could include both
     * the header and footer page numbers in a single slide.
     *
     * @param slide A slide element to update
     * @param pageNumber Page number to assign to the slide element.
     */
    updatePageNumberFields: function(slide, pageNumber)
    {
        if (slide != null && pageNumber != null) {
            concord.widgets.headerfooter.headerfooterUtil.updatePageNumber(slide, pageNumber);
        }
    },

    /**
     * Update the page number fields of all slides.  This could include
     * both the header and footer page numbers for each slide.
     *
     * @param slides Slide array for all the slides to update
     */
    updatePageNumberFieldsForAllSlides: function(slides)
    {
        concord.widgets.headerfooter.headerfooterUtil.updatePageNumbers(slides);
    },


    instanceReadyHandle: function()
    {
        this.isCkeInstanceReady = true;

        //send events that slideSorter is ready
        var eventData = [{eventName: concord.util.events.slideSorterEvents_eventName_onCKEInstanceReady,editorName:this.ckeditorInstanceName}];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);
        //Take care of Co-editing
            ///TODO:removing this, unnecessary, the culprit of "addIdToElement" js error
            //load hidden iframe of compared dom tree
            this.editor.on( 'selectionChange', dojo.hitch(this,function()
            {
                concord.util.presToolbarMgr.toggleFontEditButtons('off');
            })
            );
            this.editor.on( 'focus', dojo.hitch(this,function()
                    {
                        concord.util.presToolbarMgr.toggleFontEditButtons('off');
                    })
                );
            this.editor.on( 'contentDirChanged', dojo.hitch(this,function()
                    {
                        concord.util.presToolbarMgr.toggleFontEditButtons('off');
                    })
                );
    },

    checkIfContentLoaded: function(isFromContentReset){
        //if css is applied to slides, go ahead and display the slides
        // this.slideCssAppliedCtr is a failsafe in case for some reason we're not able
        // to get the height and width for a while. We want to make sure the slides are not
        // kept hidden
        // we need to  make sure css has been applied, one way is to check the selected slide border that is set by css class
        if ((this.selectedSlide && this.selectedSlide.offsetWidth
                && this.selectedSlide.offsetHeight
                && this.selectedSlide.offsetWidth > 0 && this.selectedSlide.offsetHeight > 0 && dojo.style(this.selectedSlide, "borderTopWidth") > 0)
                || this.slideCssAppliedCtr > 150) {
            var presDiv = this.officePrezDiv;
            presDiv.style.visibility = 'visible';

            //This is a fix the issue with Safari where the first slide is
            //not visible
            if(dojo.isWebKit){
                var iframe = this.editor.document.getWindow();
                if (iframe){
                    iframe.$.scrollTo(0,0);
                }
            }

            // prepare for slide
            for (var i=1; i < this.slides.length; i++) {
            	this.prepareForSlide(this.slides[i], i+1);
            }
            
            var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_slidesLoaded, 'isFromContentReset':isFromContentReset}];
            dojo.publish(concord.util.events.slideSorterEvents, eventData);
            
            pe.scene.readyToShowTS = (new Date()).getTime();
            var initUI = pe.scene.endInitUITS - pe.scene.beginSceneTS;
            var getContent = pe.scene.getContentTS - pe.scene.beginStageTS;
            var init_get = pe.scene.loadStateTS - pe.scene.beginSceneTS;
            var showSlide = pe.scene.readyToShowTS - pe.scene.loadStateTS;
            console.info("!!!!!! init     UI : " + initUI);
            console.info("!!!!!! get content : " + getContent);
            console.info("!!!!!! init ~~ get : " + init_get);
            console.info("!!!!!! show  slide : " + showSlide);
            
            if(!concord.util.browser.isMobile())
            {
            	pe.scene.initSideBar();
            	var sideBar = dojo.byId("ll_sidebar_div");
            	var rightPanelCell = dojo.byId("rightPanel");
            	rightPanelCell.appendChild(sideBar);
            }
            
            this.checkIfMoreContent();
            
        }else{
            this.slideCssAppliedCtr++;
            // destory slide editor context menu when reloading
            // Actually content is not reloaded into editor when revision
            // because draft which will be reloaded is current doc shown in slide editor
            // so slide editor content will not be updated but its context menu
            // should be distroyed.
            var tempScene = window.pe.scene;
            if (tempScene.isViewDraftMode())
            	tempScene.slideEditor.destroyContextMenu();
            setTimeout(dojo.hitch(this, this.checkIfContentLoaded, isFromContentReset), 100);
        }

    },

    //
    // Publish slides are done loading... this should indicate that all slides are
    // now visible to the user in the slide sorter.
    //
    publishAllSlidesDoneLoading: function(){
    	if(concord.util.browser.isMobile() && !concord.util.mobileUtil.useNativeSlideSorter)
    	{
    		concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"presLoaded", "params":[]}]);
            if(concord.util.browser.isMobileVersionGreaterOrEqual("7.0"))
            {
            	this.officePrezDiv.style.webkitOverflowScrolling = "auto";
                setTimeout(dojo.hitch(this,function(){this.officePrezDiv.style.webkitOverflowScrolling = "touch";}), 0);
            }
        }
    	
        if(window.pe.scene.slideSelectedIdforResetContent){
            this.simulateSlideClickById(window.pe.scene.slideSelectedIdforResetContent);
            window.pe.scene.slideSelectedIdforResetContent = null;
        }else {
            var slideSelected = this.selectedSlide;
            if (slideSelected != null) {
                var slideId = slideSelected.id;
                this.createSlideSelectedMsg(slideId);
            }
        }
        //Defect 14144: for spellcheck to check if the CKEditor is loaded
        this.editor.contentLoaded = true;
        this.requestSlideLockStatus();	//JMT D41481 D40773
        //D22781: New a presentation in concord,menu Format->Properties... should not be enabled
        //24414: [Regression] New a presentation,the "Previous Slide" and "Next Slide" icons in tool bar  should be disabled
//        setTimeout( function()
//        {
            if(window.pe.scene.focusMgr)
                window.pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.SLIDE_SORTER_COMPONENT);
            var presPrevSlidecmd=window.pe.scene.slideSorter.editor.getCommand('presPrevSlide');
            var presNextSlidecmd=window.pe.scene.slideSorter.editor.getCommand('presNextSlide');
 			if (presPrevSlidecmd && presNextSlidecmd) {
 			    
		 		if(window.pe.scene.slideSorter.slides.length==1){
		            presPrevSlidecmd.setState(CKEDITOR.TRISTATE_DISABLED);
		            presNextSlidecmd.setState(CKEDITOR.TRISTATE_DISABLED);
		        }else {
		            var currSlide = window.pe.scene.slideSorter.selectedSlide;
		            if(currSlide == window.pe.scene.slideSorter.slides[0]){
		                presPrevSlidecmd.setState(CKEDITOR.TRISTATE_DISABLED);
		            }
		        }
 			}
 		//D27511: [Regression]Focus lost after click placeholder quickly after load
//        }, 100 );
 			
 		window.pe.scene.disableCommentButton(true);
    },

    buildSlideSorterTool: function(){
        var slideSorterToolDiv = document.getElementById(this.slideSorterToolDivId);

        var tbl = document.createElement('table');
        tbl.style.width = '100%';
        tbl.style.border = '0px';
        tbl.cellPadding = 0;
        tbl.cellSpacing = 0;
        dijit.setWaiRole(tbl,'presentation');

            var tbody = document.createElement('tbody');
                var tr = document.createElement('tr');
                tr.style.width = '100%';
                dijit.setWaiRole(tr,'presentation');

                    var td1 = document.createElement('td');
                        td1.style.width = '60%';
                        dijit.setWaiRole(td1,'presentation');

                        //insert a div for slide number
                        var slideNumberDiv = document.createElement("span");
                        slideNumberDiv.id=this.slideNumberDivId;
                        dojo.addClass(slideNumberDiv,"slideSorterTool");
                        slideNumberDiv.innerHTML=this.STRINGS.slideNumberHere;
                        slideNumberDiv.style.visibility="hidden";
                        if(dojo.isIE){
                            slideNumberDiv.style.styleFloat = 'left';
                        }else{
                            slideNumberDiv.style.cssFloat = 'left';
                        }

                        slideNumberDiv.style.margin = '0px';
                        slideNumberDiv.style.width = '100%';
                        slideNumberDiv.style.textAlign = 'left';
                        td1.appendChild(slideNumberDiv);

                    tr.appendChild(td1);

                    var td2 = document.createElement('td');
                        td2.style.width = '40%';
                        td2.style.textAlign = 'right';
                        dijit.setWaiRole(td2,'presentation');

                        //insert a div for buttons
                        var slideSorterToolsDiv = document.createElement("span");
                        slideSorterToolsDiv.id=this.slideSorterToolsId;
                        slideSorterToolsDiv.style.display = 'none';
                        dojo.addClass(slideSorterToolsDiv,"slideSorterTool");
                        if(dojo.isIE){
                            slideSorterToolsDiv.style.styleFloat = 'right';
                        }else{
                            slideSorterToolsDiv.style.cssFloat = 'right';
                        }

                        slideSorterToolsDiv.style.width = '100%';
                        slideSorterToolsDiv.style.paddingRight = '2px';
                        td2.appendChild(slideSorterToolsDiv);
                        slideSorterToolDiv.style.textAlign = 'right';

                    tr.appendChild(td2);
                tbody.appendChild(tr);
            tbl.appendChild(tbody);
        slideSorterToolDiv.appendChild(tbl);
    },
    //@param fromAction: action that triggers this function call
    simulateSlideClick: function(slide, isToIgnoreCtrlKey, fromAction){
        this.publishSlideSorterInFocus();
        //adjust scrolling to show the selected slide
        if(slide!=null){
        	var slideWrapper = slide.parentNode;
        	if(slideWrapper!=null){
        		var ckslideWrapper = PresCKUtil.ChangeToCKNode(slideWrapper);
        		ckslideWrapper.scrollIntoView(false);
//        		slideWrapper.scrollIntoView(false);
        	}
            //var slideNum = this.getSlideNumber(slide);
            var target = slide;
            target.fromsim = true;
            if(this.editor.document.$.dispatchEvent) { // W3C
                var oEvent = this.editor.document.$.createEvent( "MouseEvents" );
                target.fromAction = fromAction;
                oEvent.initMouseEvent("click", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
                
                target.dispatchEvent( oEvent );
                }
            else if(this.editor.document.$.fireEvent) { // IE
                var eventObj = this.editor.document.$.createEventObject(null);
                eventObj.ignoreCtrlKey = isToIgnoreCtrlKey;  // for some reason in IE ctrl key from ctrl+z, ctr+v, ctrl+m, etc, sticks to this new event
                target.fromAction = fromAction;
                target.fireEvent("onclick",eventObj);
            }
            //target = null;
            //slideWrapper = null;
        }

    },
    simulateSlideClickById: function(slideId, isForce){
        if(slideId!=null){
            var slideElem = this.getSlideById(slideId);
            //if(slideElem != this.selectedSlide || (isForce == true)){
                this.simulateSlideClick(slideElem);
            //}

        }
    },
    simulateOnMouseUp: function(){
        //var target = slide;
        var target = null;
        if(this.editor.document.$.dispatchEvent) { // W3C
            var oEvent = this.editor.document.$.createEvent( "MouseEvents" );
            oEvent.initMouseEvent("mouseup", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
            target.dispatchEvent( oEvent );
            }
        else if(this.editor.document.$.fireEvent) { // IE
            target.fireEvent("onmouseup");
            }
    },

    createSlideWrappers: function(slide){
        if(slide ==null){
            var slideWrappers = dojo.query('.slideWrapper', this.editor.document.$);
            if(slideWrappers !=null && slideWrappers.length <=0){
                var thumbnails = dojo.query('.draw_page', this.editor.document.$);
                for(var i=0; i< thumbnails.length; i++){
                    var slideWrapper = dojo.query(dojo.create("div", null, thumbnails[i],"before"))
                    .addClass("slideWrapper");
                    dijit.setWaiState(thumbnails[i],'hidden','true');
                    slideWrapper[0].appendChild(thumbnails[i]);
                    //concord.util.HtmlContent.injectRdomIdsForElement(slideWrapper[0]);
                }
            }else{ //if existing slidewrappers, clean borders.
                //check if there is any slide without wrapper, add wrapper if necessary, and clean any border setting
                if(slideWrappers !=null && slideWrappers.length >0){
                    //check if any slidewrapper that contains many slides (for some reason this can happen after refresh, the wrapper that was initially there was gone and the slide was appended to another slide's slidewrapper)
                    for(var i=0; i< slideWrappers.length; i++){
                        var childrenSlides = dojo.query(".draw_page", slideWrappers[i]);
                        if(childrenSlides!=null && childrenSlides.length>1){
                            //ignore the first child, the first child is good already
                            var slideWrapperAnchor = slideWrappers[i];
                            for(var j=1; j< childrenSlides.length; j++){
                                var slideElem = childrenSlides[j];
                                var slideWrapper = dojo.query(dojo.create("div", null, slideWrapperAnchor,"after"))
                                .addClass("slideWrapper");
                                dijit.setWaiState(slideElem,'hidden','true');
                                slideWrapper[0].appendChild(slideElem);
                                slideWrapperAnchor = slideWrapper[0];
                            }
                        }

                    }

                    var thumbnails = dojo.query('.draw_page', this.editor.document.$);
                    for(var i=0; i< thumbnails.length; i++){
                        //var prevSibling = thumbnails[i].previousElementSibling;
                        var parentElem = thumbnails[i].parentNode;
                        if(parentElem!=null && !dojo.hasClass(parentElem,"slideWrapper")){
                            var slideWrapper = dojo.query(dojo.create("div", null, thumbnails[i],"before"))
                            .addClass("slideWrapper");
                            dijit.setWaiState(thumbnails[i],'hidden','true');
                            slideWrapper[0].appendChild(thumbnails[i]);
                            //concord.util.HtmlContent.injectRdomIdsForElement(slideWrapper[0]);
                        }
                    }
                    //clean any border setting
                    for(var i=0; i< slideWrappers.length; i++){
                        slideWrappers[i].style.border = "";
                    }
                }

            }

        }else{

                var slideWrapper = dojo.query(dojo.create("div", null, slide,"before"))
                .addClass("slideWrapper");
                dijit.setWaiState(slide,'hidden','true');
                slideWrapper[0].appendChild(slide);
                concord.util.HtmlContent.injectRdomIdsForElement(slideWrapper[0]);

        }
    },
    cancelDnd: function(isLocked){
    	var slide2Select;
        if(this.slideSorterDndSource!=null && this.slideSorterDndSource.isDragging == true){
            dojo.publish("/dnd/cancel");
            concord.widgets.presdndmanager().stopDrag();
            if(isLocked == true){
                this.publishLaunchContentLockDialog();
            }
            this.cleanUpImgDropPosFunc();
            //#2241
            this.disconnectDocForCancelDnd();
            
            //defect 32252  after Dnd cancel, sycn slidesorter and the editor
            slide2Select = this.multiSelectedSlides[0];
            if(slide2Select!=null&&slide2Select!=undefined)
            {
	            this.simulateSlideClick(slide2Select);
	            this.publishSlideSelectedEvent(slide2Select);
            }

        }
    },
    disconnectDocForCancelDnd: function(){
        if(this.documentBodyDnDMouseUpEvt!=null){
            //#2241 - cancel dnd if mouseup in other area
            dojo.disconnect(this.documentBodyDnDMouseUpEvt);
            this.documentBodyDnDMouseUpEvt=null;
        }
        if(this.documentBodyDnDClickEvt!=null){
            //#2241 - cancel dnd if click the doc
            dojo.disconnect(this.documentBodyDnDClickEvt);
            this.documentBodyDnDClickEvt=null;
        }
        if(this.presDivDnDMouseOverEvt !=null){
            dojo.disconnect(this.presDivDnDMouseOverEvt);
            this.presDivDnDMouseOverEvt=null;
        }
        if(this.documentBodyDnDMouseOutEvt!=null){
            //#2241 - cancel dnd if click the doc
            dojo.disconnect(this.documentBodyDnDMouseOutEvt);
            this.documentBodyDnDMouseOutEvtckEvt=null;
        }
    },
    connectDocForCancelDnd:function(){
        //#2241 - cancel dnd if mouseup in other area
        this.disconnectDocForCancelDnd();
        this.documentBodyDnDMouseUpEvt = dojo.connect(document.body, "onmouseup",   dojo.hitch(this, this.cancelDnd));
        this.documentBodyDnDClickEvt = dojo.connect(document, "onclick",   dojo.hitch(this, this.cancelDnd));
        //#2241 - cancel dnd if mouseup in ouside window
        this.documentBodyDnDMouseOutEvt = dojo.connect(document, "onmouseout",   dojo.hitch(this, this.leaveDoc));
    },
    leaveDoc: function (evt){
        //#2241 - cancel dnd if mouseup in ouside window
        if (evt!=null && evt.toElement == null && evt.relatedTarget == null) { //leave window
            if(this.officePrezDiv!=null){
                this.presDivDnDMouseOverEvt = dojo.connect(this.officePrezDiv, "onmousemove",   dojo.hitch(this, this.checkButtonToCancelDnd));
            }
            if(this.documentBodyDnDMouseOutEvt!=null){
                //#2241 - cancel dnd if click the doc
                dojo.disconnect(this.documentBodyDnDMouseOutEvt);
                this.documentBodyDnDMouseOutEvtckEvt=null;
            }
        }
    },
    checkButtonToCancelDnd:function(evt){
        var e = evt;
        if(e.button == 0){ //left button has been released
            this.cancelDnd();
        }
    },
    dndStart : function (params){
        //#2241 - cancel dnd if mouseup in other area
        this.connectDocForCancelDnd();
        var slideToSelect = null;

        //Let's clear out multiselectedSlides and replace with dojo DND selection
        for(var i=0; i< this.multiSelectedSlides.length; i++){
            this.deselectSlide(this.multiSelectedSlides[i]);
        }
        this.multiSelectedSlides = [];
        for (var id in params.selection){
            var wrapper = this.editor.document.$.getElementById(id);
            var slide =this.getSlideFromSlideWrapper(wrapper);
            this.selectSlide(slide);
            if (this.selectedSlide == slide) {
              slideToSelect = slide;
            }
        }
        if (slideToSelect == null)
          slideToSelect = this.multiSelectedSlides[0];
        
        // select the slide when mouse down on moving slide
        // This will help lock current slide and other coeditors
        // cannot move or delete the slide again
        setTimeout(dojo.hitch(this,function(){
          this.publishSlideSelectedEvent(slideToSelect);
        }), 200);
//        var currSlideWrapperClicked = params.current;
//        if(currSlideWrapperClicked!=null){
//            var slideClicked =this.getSlideFromSlideWrapper(currSlideWrapperClicked);
//            if(slideClicked != this.selectedSlide){
//                this.simulateSlideClick(slideClicked);
//            }
//        }
        
        //check if there is locked slide, if so, do not delete anything
        var isHavingLockedSlide = this.isMultiSlidesHaveLockedSlide();
        if(isHavingLockedSlide == true){
        //18079 - reduced the timeout to prevent chances that user can finish dragging before cancelling the dnd
            setTimeout(dojo.hitch(this, this.cancelDnd, true), 5);
            return;
        }else {
            //for future when we need to do anything on dndStart
            this.isDNDSession = true;
            this.dndCmdList= [];

            this.sortMultiSelectedSlides();
            var slidesBeingDropped = this.multiSelectedSlides;
            //Simulate click on the slide the user began the DND
            if(slidesBeingDropped !=null && slidesBeingDropped.length >0){
                for(var i=slidesBeingDropped.length-1; i>=0; i-- ){
                    //load the slides just in case multiselected slides has unloaded content
                    this.loadSlideToSorter(slidesBeingDropped[i]);
                    
                    // Record the dragged slides action.
                    var ckNode = new CKEDITOR.dom.node(slidesBeingDropped[i].parentNode);
                    this.dndCmdList.push( SYNCMSG.createDeleteElementAct(ckNode.getIndex(), 1, ckNode.getParent(), [ckNode], true) );
                }
            }
        }
    },

    getSlideFromSlideWrapper: function(wrapper){
        var slide = dojo.query('.draw_page',wrapper)[0];
        return slide;
    },

    dndDrop : function (params){
        this.isDNDSession = false;
        this.disconnectDocForCancelDnd();
    },

    sortMultiSelectedSlides: function(nodeList,isSlideWrapper){
        var nodeArray = (nodeList!=null)? nodeList: this.multiSelectedSlides;
        if(nodeArray !=null){
            for(var i=0; i<nodeArray.length; i++){
                //re-order the multiselectedslides according to the order of the slides in the slidesorter
                //so it maintains the order of the slidenumber, not the order of the user clicking the slides
                //e.g. user can click slide 5 then slide 4. but when pasting, we want to see slide 4 before slide 5
                nodeArray.sort(dojo.hitch(this, this.sortSlides,isSlideWrapper));
            }
        }
    },

    dndDropAfter : function (params){

        //for future when we need to do anything on dndStart
        this.isDNDSession = false;
        var slideToSelect = null;
        this.disconnectDocForCancelDnd();
        if(params.anchor!=null){
            //console.log("SLIDESORTER:DNDROPAFTER***");
            // jmt may remove var slideWrapperInDrag = params.anchor;

            var slidesBeingDropped = this.multiSelectedSlides;
            if(slidesBeingDropped !=null && slidesBeingDropped.length >0){
                // jmt - coeditfix
                var actPair = this.dndCmdList;
                for(var i=0; i<slidesBeingDropped.length; i++ ){
                    //clone the slideWrapperInDrag
                    var slideWrapperInDragClone = slidesBeingDropped[i].parentNode;
                    //remove slideUtil div so that it is not sent in the message
                    this.removeSlideUtilDiv([slideWrapperInDragClone]);

                    var ckNode = new CKEDITOR.dom.node(slideWrapperInDragClone);
                    actPair.push( SYNCMSG.createInsertElementAct(ckNode.getIndex(), ckNode.getParent(), ckNode, true) );

                    //add back the slideUtil div
                    var slideElemArray = [];
                    slideElemArray.push(slidesBeingDropped[i]);
                    this.createSlideUtilDiv(slideElemArray);

                    if(this.selectedSlide == slidesBeingDropped[i] ){
                        slideToSelect = slidesBeingDropped[i];
                    }
                }
                
                if(actPair.length > 0){
                	var msgPairList = [ SYNCMSG.createMessage(MSGUTIL.msgType.MoveSlide, actPair) ];
                    msgPairList = this.addMoveFlag(msgPairList);
                    //set the msg's has delete and insert same element, for undo processing allowing delete and insert element together in the same msgList
                    msgPairList = SYNCMSG.setHasInsertDeleteSameElementInMsgListFlag(msgPairList, true);
                    SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                }
                if (slideToSelect==null){
                    slideToSelect = this.multiSelectedSlides[0];
                    this.simulateSlideClick(slideToSelect);
                }
            }

            //refresh this.slides
            //this.refreshSlidesObject(); //not needed, it is already called by createSlideUtilDiv

            //display the slidenumber in the slidesorter too
            //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
            this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);
            //console.log('dndDone');
        }

    },

    addMoveFlag: function(msgPairList){
        for (var i=0; i<msgPairList.length; i++){
            var msgPair = msgPairList[i];
            var msgPairSize = msgPair.msg.updates.length;
            for (var j=0; j<msgPairSize; j++){
                msgPair.msg.updates[j].slideMove = true;
                if (msgPair.rMsg.updates[j]!=null) msgPair.rMsg.updates[j].slideMove = true;
            }
        }
        return msgPairList;
    },

    dndCancel : function (){
        //for future when we need to do anything on dndCancel
        this.isDNDSession = false;
        this.dndCmdList=[];
        this.disconnectDocForCancelDnd();
    },
    /*
     //Defect 4562 - using mouseover and mouseout will result:
     //in IE8 only, if mouse enter a content box inside a slide,
     //ie8 generates mouse out (leaving slideElem to content box), so hovering over content boxes inside the slide on the slidesorter
     //would result mouseover-mouseout-mouseover, so user will see flickering of the border
     //since on mouseover we draw the border and mouseout we remove the border
     //solution: do not use mouseover, mouseout, use css hover instead in the concordslidesorter.css
    */
    oncontextmenuFunc: function(evt){
        //alert("oncontextMenu");
        if (evt.type == "contextmenu"){  // don't call if we're doing SHIFT+F10 context menu
            this.handleOnclickEvt(evt);
        }
        //close context menu if any is opened
        dijit.popup.close(this.slideSorterContextMenu);
        var currentTarget = (evt.type == "contextmenu") ? evt.currentTarget : this.selectedSlide;
        this.slideSorterContextMenu.bindContextMenuToSlide(currentTarget);
        //force it to manually open since we have unBound from previous slide
        setTimeout(dojo.hitch(this,this.oncontextmenuFuncInner,evt, currentTarget), 300);

    },
    oncontextmenuFuncInner: function(evt, currentTarget){
        this.slideSorterContextMenu._openMyself({target: currentTarget});
    },
    
    onclickFunc: function (evt) {
        //we don't support ctrl+click to select slide on mac,
        //on mac should use command+click to relect multiple slide
        //console.log("ctrl+onclick event on Mac - do nothing, oncontextmenu should have fired instead");
        if(dojo.isMac == true && evt.ctrlKey == true){ return; };

        try{
            dojo.byId( pe.scene.slideSorterContainerId).focus();
        }catch(e){
        }

        if ( this.slideSorterContextMenu!=null ){
            //close context menu if any is opened
            dijit.popup.close(this.slideSorterContextMenu);
            this.slideSorterContextMenu.bindContextMenuToSlide(evt.currentTarget);
        }
        
        this.handleOnclickEvt(evt);
    },
    
    slideWrapperOnClickFunc: function(evt){
        //close context menu if any is opened
        dijit.popup.close(this.slideSorterContextMenu);
    },
    
    connectEvents:function(slideElem){
        var disconnectArray =[];

        //defect 4562 - commenting out below - not using mouseover
        //disconnectArray.push(dojo.connect(slideElem, 'onmouseover', dojo.hitch(this, this.onmouseoverFunc)));
        //defect 4562 - commenting out below - not using mouseout
        //disconnectArray.push(dojo.connect(slideElem, 'onmouseout', dojo.hitch(this,this.onmouseoutFunc)));

        disconnectArray.push(dojo.connect(slideElem, 'oncontextmenu', dojo.hitch(this,this.oncontextmenuFunc)));

        disconnectArray.push(dojo.connect(slideElem, 'onclick', dojo.hitch(this,this.onclickFunc)));
        //connect slideWrapper onclick event to close context menu
        var slideWrapper = slideElem.parentNode;
        if(slideWrapper!=null){
            disconnectArray.push(dojo.connect(slideWrapper, 'onclick', dojo.hitch(this,this.slideWrapperOnClickFunc)
            ));
        }


        this.connectArray[slideElem.id] = disconnectArray;

    },

    disconnectEvents:function(slideElem){
        //Get disconnect array for slideElem
        var disConnectArray = this.connectArray[slideElem.id];
        if(disConnectArray !=null){
            for (var i=0; i<disConnectArray.length; i++){
                dojo.disconnect(disConnectArray[i]);
            }
            //remove entry from array
            this.connectArray[slideElem.id]=null;
            delete this.connectArray[slideElem.id];
        }
    },
    cleanUpImgDropPosFunc: function(){
        var imgDropPos = dojo.query(".dndDropPosBefore, .dndDropPosAfter", this.editor.document.$);
        imgDropPos.forEach(dojo.destroy);
    },

    handleOnclickEvt:function(evt){
        if(evt == null){ return; }

        //console.log("*(*(*(*(*(*( evt.fromAction:"+evt.currentTarget.fromAction);
        var fromAction = evt.currentTarget.fromAction;
        var fromsim = evt.currentTarget.fromsim;
        evt.currentTarget.fromsim = undefined;
    
        this.publishSlideSorterInFocus();
    
        //clean imgdropPos if any
        dojo.withDoc(this.editor.document.$, dojo.hitch(this, this.cleanUpImgDropPosFunc), null);
        
        // click in read-only mode
        var tempScene = pe.scene;
        if (tempScene.bInReadOnlyMode || tempScene.isViewDraftMode()){
        	// check for clicking on self
        	if (this.selectedSlide == evt.currentTarget)
        		return;

        	// unselect the current
        	this.deselectSlide(this.selectedSlide);
        	// select a new one
        	this.selectedSlide = evt.currentTarget;
            this.selectSlide(this.selectedSlide);
            // publish
            // this.publishSlideSelectedEvent(this.selectedSlide, fromAction);
            tempScene.slideEditor.quickLoadInSlideEditor(this.selectedSlide, false, null);
            // Need update prev or next slide button status in view draft mode
            if (tempScene.isViewDraftMode())
                this.togglePrevNextSlideButtons();
    		return;
    	}
    
        var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(evt.currentTarget);
        //if ctrl key is pressed, for Mac, to multi select press command key (meta key)
        
        var ctrlKeyPressed = (((dojo.isMac !=true && evt.ctrlKey == true)
                                ||(dojo.isMac == true && evt.metaKey == true)) 
                              && evt.ignoreCtrlKey!=true);
        var needUpdateSelection = ((evt.button == 0 && evt.type!="contextmenu")
                                   ||((evt.button == 2||evt.type=="contextmenu")
                                       && idxInMultiSelectSlides<0));

        if (needUpdateSelection){
            if(this.selectedSlide && ctrlKeyPressed){
                //check if evt.currentTarget is in the multiSelect array
                //if the element is already exist in multiselect array, remove it from multiselect
                if( idxInMultiSelectSlides >=0 && this.multiSelectedSlides.length>1){ //do not deselect if it is the only slide selected
                    this.deselectSlide(evt.currentTarget, idxInMultiSelectSlides);
                }
                else {
                    //if it is not, add to multiselect array and set border to 3 px.
                    this.selectSlide(evt.currentTarget);
                }
            }
            //else if shift key is pressed
            else if(this.selectedSlide && evt.shiftKey){
                //check last element in multiSelect array
                var lastSelectedSlide = this.multiSelectedSlides[this.multiSelectedSlides.length -1];
                var lastSelectedSlideNum = this.getSlideNumber(lastSelectedSlide);
                var currSelectedSlide = evt.currentTarget;
                var currSelectedSlideNum = this.getSlideNumber(currSelectedSlide);
        
                if(parseFloat(lastSelectedSlideNum) < parseFloat(currSelectedSlideNum)) {
                    if( idxInMultiSelectSlides >=0 && this.multiSelectedSlides.length>1){ //do not deselect if it is the only slide selected){
                        this.deselectMultiSlides(lastSelectedSlideNum-1, currSelectedSlideNum-1);
                    }else{
                        this.selectMultiSlides(lastSelectedSlideNum-1, currSelectedSlideNum-1);
                    }
                }else if(parseFloat(lastSelectedSlideNum) >= parseFloat(currSelectedSlideNum)){
                    if( idxInMultiSelectSlides >=0 && this.multiSelectedSlides.length>1){ //do not deselect if it is the only slide selected){
                        this.deselectMultiSlides(currSelectedSlideNum-1, lastSelectedSlideNum-1);
                    }else{
                        this.selectMultiSlides(currSelectedSlideNum-1, lastSelectedSlideNum-1);
                    }
                }
            }else {
                if(this.multiSelectedSlides.length>0){
                    for(var j=0; j < this.multiSelectedSlides.length; j++){
                            if(evt.currentTarget!=this.multiSelectedSlides[j])
                            this.deselectSlide(this.multiSelectedSlides[j]);
                    }
                }
                this.multiSelectedSlides = [];
            }
        }
        if ((!ctrlKeyPressed && !evt.shiftKey) || !needUpdateSelection || !this.selectedSlide){
            this.selectedSlide = evt.currentTarget;
    
            this.selectSlide(evt.currentTarget);
            //load this slide first to be published to editor
            //console.log("onClick:loadSlideToSorter:"+ this.selectedSlide.id);
            this.loadSlideToSorter(this.selectedSlide);
            
            //publish event for co-editing
            var mainNode = window.pe.scene.slideEditor.mainNode;
            if (!fromsim && mainNode && (this.selectedSlide.id == mainNode.id)) {
            	console.info("!!! ignore clicking on the current slide !!!");
            	concord.util.browser.isMobile() && concord.util.mobileUtil.clickCurrentSlide(this.selectedSlide);
            } else {
            	this.publishSlideSelectedEvent(this.selectedSlide, fromAction);
            }
            
            //load the slides necessary
            //#6042:to improve page down performance, do not call loadRangeSlidesToSorter when we are doing navigating slides (page down, page up, etc)
            //loadRangeSLidesToSorter already done also by automatic browser scrolling
            //but we need to do loadRangeSLidesToSorter here for other click event for example from single click on slide or from programmatically select slide.
            if(fromAction != this.PAGE_DOWN && fromAction != this.PAGE_UP){
                this.loadRangeSlidesToSorter(this.selectedSlide);
            }
            //display the slidenumber in the slidesorter too
            //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
            this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);
    
            //reset the onLastSlideByKey and onFirstSlideByKey flags - for handling onKeyUp for improving pageDown performance - 6042
            this.isOnLastSlideByKey = false;
            this.isOnFirstSlideByKey = false;


    
            //toggle next/prev slide buttons accordingly.
            
            this.togglePrevNextSlideButtons();
        }    
            
        /* To scroll to show the clicked slide.. need to be refined to avoid jumpiness
        if(evt.currentTarget!=null){
            var slideWrapper = evt.currentTarget.parentNode;
            if(slideWrapper!=null){
                slideWrapper.scrollIntoView(false);
            }
        }
        */
        if(this.currentScene.sceneInfo.mode == "edit"){
            //refresh unassign context menu
            var taskHdl = this.getTaskHdl();
            if(taskHdl)
            	taskHdl.updateCommandState(taskHdl.getSelectedTask());
        }
        evt.currentTarget.fromAction = null;
    },
    togglePrevNextSlideButtons: function() {
        if(this.isFirstSlideSelected()) {
            concord.util.presToolbarMgr.togglePrevSlideButton('off');
        } else {
            concord.util.presToolbarMgr.togglePrevSlideButton('on');
        }

        if(this.isLastSlideSelected()) {
            concord.util.presToolbarMgr.toggleNextSlideButton('off');
        } else {
            concord.util.presToolbarMgr.toggleNextSlideButton('on');
        }
    },
    
    publishSlideSelectedTaskMenu: function(){
        if(this.taskHandler){
            var params = this.taskHandler.getContextMenuParams();
            if(this.slideSorterContextMenu)
            	this.slideSorterContextMenu.updateContextTaskMenu(params);
        }
    },

    /*
     * Presentation tables should specify column widths as a style setting on the
     * TD elements of the 1st row and row heights as a style setting on the TR
     * elements. If either column width or row height is specified as an attribute
     * (which is deprecated in HTML), then we need to clear those settings. Note that
     * these attributes shouldn't be getting set via Concord (unless from a presentation
     * created via an early [prior to ~08/11] drop), but they could be getting set
     * from an imported PPT or ODP file.
     * TS: TODO FIX Coedit message here
     */
    fixTableStylings: function(slideElem,msgPairList) {
        if(msgPairList == null){
            msgPairList = [];
        }
          // if the editor's document isn't loaded yet, can't do anything
          if (!slideElem)
            return msgPairList;
          // imported / converted tables don't have the 'smartTable' class yet,
          // but they do have 'table_table'
          var tables = dojo.query("table.table_table", slideElem);
          // if no tables, then nothing to do
          if (!tables || tables.length == 0)
            return msgPairList;

          var tableUpdated = false;
          for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var defRowHeight = 100 / table.rows.length;
            if ( !dojo.hasClass( table, 'smartTable')){
                var old = dojo.getNodeProp(table, 'class');
                dojo.addClass( table, 'smartTable');
                var act = SYNCMSG.createAttributeAct( table.id,{'class':table.className},null,{'class':old},null);
                msgPairList.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,[act]));
            }
            for (var j = 0; j < table.rows.length; j++) {
              var row = table.rows[j];
              // process / wipe 'height' attributes on the rows first
              var htAttr = dojo.attr( row, 'height' );
              if (htAttr) {
                // height attribute exists, so remove it
                dojo.removeAttr( row, 'height' );
                tableUpdated = true;
                // if height style wasn't set, set it to what we had from the attribute
                // note: for some reason, getting style via dojo.style doesn't work
                var htStyle = CKEDITOR.env.ie ? row.style.getAttribute('height') : row.style.getPropertyValue('height');
                if (!htStyle) {
                  // setting the style via dojo.style works fine
                  dojo.style( row, 'height', htAttr );
                }

              } else {
                // height attribute doesn't exist. do we need to set a default?
                // note: for some reason, getting style via dojo.style doesn't work
                var htStyle = CKEDITOR.env.ie ? row.style.getAttribute('height') : row.style.getPropertyValue('height');
                if (!htStyle) {
                  // setting the style via dojo.style works fine
                  dojo.style( row, 'height', defRowHeight + '%' );
                  tableUpdated = true;
                }
              }

              if(tableUpdated == true){
                //Do coediting by remove and insert the table
            	  msgPairList.push( SYNCMSG.createReplaceNodeMsg(table) );
              }
            }
          }

          // if we updated any table, make sure we trigger a content reset msg, which will
          // cause an update to the underlying content.html
          //TS TODO: need to change this to be NOT reset content
          //need to do table delete and table insert
          /*
          if (tableUpdated) {
            var msgPairList = SYNCMSG.createResetContentMsg(MSGUTIL.msgType.ResetContent, []);
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
          }
          */
          return msgPairList;
        },

    createSpeakerNotes:function() {
        var notesDrawFrame = document.createElement('div');
        dojo.addClass(notesDrawFrame,'draw_frame layoutClass');
        dojo.attr(notesDrawFrame,'presentation_class','notes');
        dojo.attr(notesDrawFrame,'emptyCB_placeholder','true');
        dojo.attr(notesDrawFrame,'text_anchor-type','paragraph');
        dojo.style(notesDrawFrame,{
            'position':'absolute',
            'top': '100%',
            'width': '100%',
            'height':'10%',
            'backgroundColor':'white',
            'borderTop':'2px solid #CCCCCC',
            'borderRight':'0px solid #CCCCCC',
            'borderBottom':'0px solid #CCCCCC',
            'borderLeft':'0px solid #CCCCCC',
            'overflowX':'hidden',
            'overflowY':'scroll'
        });
        var notesDrawText = document.createElement('div');
        dojo.addClass(notesDrawText,'draw_text-box layoutClassSS');
        dojo.style(notesDrawText,{
            'height':'100%',
            'width':'100%',
            'border': '0px solid'
        });
        var notesTable = document.createElement('div');
        dojo.style(notesTable,{
            'display':'table',
            'height':'100%',
            'width':'100%'
        });
        dijit.setWaiRole(notesTable,'presentation');
        var notesTableCell = document.createElement('div');
        dojo.style(notesTableCell,{
            'display':'table-cell',
            'height':'100%',
            'width':'100%'
        });
        dijit.setWaiRole(notesTableCell,'presentation');

        //date-time
        var dateTime = document.createElement('div');
        dojo.addClass(dateTime,'draw_frame');
        dojo.attr(dateTime,'draw_layer',this.BACKGROUND_OBJECTS);
        dojo.attr(dateTime,'draw_text-style-name','MP121');
        dojo.attr(dateTime,'presentation_class','date-time');
        dojo.attr(dateTime,'text_anchor-type','paragraph');
        dojo.attr(dateTime,'text_datetime-format','D4');
        dojo.attr(dateTime,'text_fixed','true');
        dojo.attr(dateTime,'text_locale','en');
        dojo.style(dateTime,{
            'visibility': 'hidden',
            'top': '5.1%',
            'width': '23.296%',
            'height': '6.895%',
            'left': '85%',
            'position': 'absolute',
            'z-index': '515'
        });
        var dateTimeDrawTextBox = document.createElement('div');
       	dojo.addClass(dateTimeDrawTextBox,'draw_text-box');
        dojo.style(dateTimeDrawTextBox,{'height':'100%','width':'100%'});
        dateTime.appendChild(dateTimeDrawTextBox);
        var dateTimeTextNode = window.pe.scene.slideEditor.buildTextNodeContent('');
        dateTimeDrawTextBox.appendChild(dateTimeTextNode);

        //header
        var header = document.createElement('div');
        dojo.addClass(header,'draw_frame');
        dojo.attr(header,'draw_layer',this.BACKGROUND_OBJECTS);
        dojo.attr(header,'draw_text-style-name','MP129');
        dojo.attr(header,'presentation_class','header');
        dojo.attr(header,'text_anchor-type','paragraph');
        dojo.style(header,{
            'visibility': 'hidden',
            'top': '5.1%',
            'width': '23.296%',
            'height': '6.895%',
            'left': '5%',
            'position': 'absolute',
            'z-index': '515'
        });
        var headerDrawTextBox = document.createElement('div');
       	dojo.addClass(headerDrawTextBox,'draw_text-box');
        dojo.style(headerDrawTextBox,{'height':'100%','width':'100%'});
        header.appendChild(headerDrawTextBox);
        var headerTextNode = window.pe.scene.slideEditor.buildTextNodeContent('');
        headerDrawTextBox.appendChild(headerTextNode);

        //footer
        var footer = document.createElement('div');
        dojo.addClass(footer,'draw_frame');
        dojo.attr(footer,'draw_layer',this.BACKGROUND_OBJECTS);
        dojo.attr(footer,'draw_text-style-name','MP129');
        dojo.attr(footer,'presentation_class','footer');
        dojo.attr(footer,'text_anchor-type','paragraph');
        dojo.style(footer,{
            'visibility': 'hidden',
            'top': '85%',
            'width': '23.296%',
            'height': '6.895%',
            'left': '5%',
            'position': 'absolute',
            'z-index': '515'
        });
        var footerDrawTextBox = document.createElement('div');
       	dojo.addClass(footerDrawTextBox,'draw_text-box');
        dojo.style(footerDrawTextBox,{'height':'100%','width':'100%'});
        footer.appendChild(footerDrawTextBox);
        var footerTextNode = window.pe.scene.slideEditor.buildTextNodeContent('');
        footerDrawTextBox.appendChild(footerTextNode);

        //page-number
        var pageNumber = document.createElement('div');
        dojo.addClass(pageNumber,'draw_frame');
        dojo.attr(pageNumber,'draw_layer',this.BACKGROUND_OBJECTS);
        dojo.attr(pageNumber,'draw_text-style-name','MP123');
        dojo.attr(pageNumber,'presentation_class','page-number');
        dojo.attr(pageNumber,'text_anchor-type','paragraph');
        dojo.attr(pageNumber,'page-number-format','4');
        dojo.style(pageNumber,{
            'visibility': 'hidden',
            'top': '85%',
            'width': '23.296%',
            'height': '6.895%',
            'left': '85%',
            'position': 'absolute',
            'z-index': '515'
        });
        var pageNumberDrawTextBox = document.createElement('div');
       	dojo.addClass(pageNumberDrawTextBox,'draw_text-box');
        dojo.style(pageNumberDrawTextBox,{'height':'100%','width':'100%'});
        pageNumber.appendChild(pageNumberDrawTextBox);

        var pageNumberTextNode = window.pe.scene.slideEditor.buildTextNodeContent('');
        pageNumberDrawTextBox.appendChild(pageNumberTextNode);
        dojo.style(notesTableCell, "color", "#000000");
        dojo.style(notesTableCell, "fontSize", "12px");
        dojo.style(notesTableCell, "fontFamily", window.pe.scene.defaultFonts);
        dojo.style(notesTableCell, "backgroundColor", "#FFFFFF");
        dojo.addClass(notesTableCell,'draw_frame_classes defaultMaster_Title');
        var pNode = document.createElement('p');
        dojo.style(pNode, "color", "#000000");
        dojo.style(pNode, "fontSize", "1em");
        dojo.style(pNode, "fontFamily", window.pe.scene.defaultFonts);
        dojo.style(pNode, "backgroundColor", "#FFFFFF");
        dojo.addClass(pNode, "defaultContentText cb_notes");
        var spanNode = document.createElement('span');
        dojo.style(spanNode, "color", "#000000");
        dojo.style(spanNode, "fontSize", "1em");
        dojo.style(spanNode, "fontFamily", window.pe.scene.defaultFonts);
        dojo.style(spanNode, "backgroundColor", "#FFFFFF");
        spanNode.innerHTML = this.STRINGS.layout_clickToAddSpeakerNotes;
        pNode.appendChild(spanNode);
        notesTableCell.appendChild(pNode);
        notesTable.appendChild(notesTableCell);
        notesDrawText.appendChild(notesTable);
        notesDrawFrame.appendChild(dateTime);
        notesDrawFrame.appendChild(header);
        notesDrawFrame.appendChild(footer);
        notesDrawFrame.appendChild(pageNumber);
        notesDrawFrame.appendChild(notesDrawText);
        concord.util.HtmlContent.injectRdomIdsForElement(notesDrawText);
        concord.util.HtmlContent.injectRdomIdsForElement(notesTable);
        concord.util.HtmlContent.injectRdomIdsForElement(notesTableCell);
        concord.util.HtmlContent.injectRdomIdsForElement(pNode);
        concord.util.HtmlContent.injectRdomIdsForElement(notesDrawFrame);
        return notesDrawFrame;
    },
    isSupportedLayout:function(layoutName){
        var result = false;
        if(layoutName != null && this.supportedLayoutArray!=null){
            result = this.supportedLayoutArray[layoutName];
            if(result!=true){
                result = false;
            }
        }
        return result;
    },
    
    isSupportedPlaceholderClass:function(PresType) {
    	if(PresType != null && PresType.length>0)
    	{
        	if((PresType == 'title') || 
    		(PresType == 'subtitle')||
    		(PresType == 'outline')||
    		(PresType == 'graphic')||
    		(PresType == 'date-time')||
    		(PresType == 'page-number')||
    		(PresType == 'footer'))
        		return true;
    	}
    	return false;
    },
    
    //this function is used to update place default text and its relative value
    refreshPlaceHolder:function(_rootNode,bUpdateValue){
    	var rootNode = PresCKUtil.ChangeToCKNode(_rootNode);
    	var queryString = "."+PresConstants.CONTENT_BOX_TITLE_CLASS
    	+",."+PresConstants.CONTENT_BOX_SUBTITLE_CLASS
    	+",."+PresConstants.CONTENT_BOX_OUTLINE_CLASS
    	+",."+PresConstants.CONTENT_BOX_GRAPHIC_CLASS;
		//we should find proper master class for this node
		
    	var defaultTextLines = dojo.query(queryString,rootNode.$);
    	
    	//result is <p> or <ul>/<ol>
    	for(var i=0;i<defaultTextLines.length;i++)
    	{
    		var line = PresCKUtil.ChangeToCKNode(defaultTextLines[i]);
    		var strPlaceHodler = null;
    		if(line.hasClass(PresConstants.CONTENT_BOX_TITLE_CLASS))
    		{
    			strPlaceHodler = this.STRINGS.layout_clickToAddTitle;
    		}else   if(line.hasClass(PresConstants.CONTENT_BOX_SUBTITLE_CLASS))
    		{
    			strPlaceHodler = this.STRINGS.layout_clickToAddText;
    		}else   if(line.hasClass(PresConstants.CONTENT_BOX_OUTLINE_CLASS))
    		{
    			strPlaceHodler = this.STRINGS.layout_clickToAddOutline;
    		}
    		if(line.hasClass(PresConstants.CONTENT_BOX_GRAPHIC_CLASS))
    		{
    			strPlaceHodler = this.STRINGS.layout_doubleClickToAddGraphics;
    		}
    		var spanNodes = dojo.query('span',line.$);
    		var spanNode = PresCKUtil.ChangeToCKNode(spanNodes[0]);
    		if(spanNode)
    		{
    			if( concord.util.browser.isMobile() && concord.util.mobileUtil.disablePresEditing )
    			{
					if (line.$.nodeName.toLowerCase() == "li")
					{
						line.addClass("sys-list-hidden");
					}
    				spanNode.setHtml("");  				
    			}
    			else
    			{
    				spanNode.setHtml(strPlaceHodler);
    			}
    		}
    		
    		if(bUpdateValue)
    		{
        		var masterClass = PresCKUtil.getMasterClass(line,1);
        		if(masterClass)
        		{
        			var tLine = PresCKUtil.setMasterClass(line,masterClass,true);
        			if(tLine)
        				line = tLine;
        		}
            	if(defaultTextLines.length)
            		PresCKUtil.updateRelativeValue(line);
    		}
    	}
    },
    
    /*
     * handle place holder for each slide.
     * @param div is the draw_page divs or slide elem
     */
    handlePlaceHolders:function(div){
        if(div == null) { return; }
            var divToProcess = div;
            var layoutName = dojo.attr(divToProcess, "presentation_presentation-page-layout-name");
            var msgPairs1 = [];

            if(divToProcess!=null && dojo.hasClass(divToProcess, "draw_page")){ //if divToProcess is a slide

                var notesNode = dojo.query('[presentation_class = "notes"]', divToProcess)[0];
                if (notesNode == undefined) {
                    //this should only happen with old presentations.
                    var speakerNotesNode = this.createSpeakerNotes();
                    divToProcess.appendChild(speakerNotesNode);
                } else {
                    var notesDrawText = null;
                    dojo.query(".draw_text-box",notesNode).forEach(function(node, index, arr){
                        if (dojo.attr(node.parentNode,"presentation_class") == "notes") {
                 			notesDrawText = node;
                        }
                    });

                    if (notesDrawText == null) {
                        var drawText = document.createElement('div');
                        dojo.attr(drawText, "class", "draw_text-box");
                        dojo.style(drawText, "width", "100%");
                        dojo.style(drawText, "height", "100%");
                        dijit.setWaiRole(drawText,'textbox');
                        dijit.setWaiState(drawText, 'labelledby', 'P_arialabel_Textbox');
       					dojo.attr(drawText, "tabindex", "0");

                        var drawText1 = document.createElement('div');
                        drawText.appendChild(drawText1);
                        dojo.style(drawText1, "display", "table");
                        dojo.style(drawText1, "height", "100%");
                        dojo.style(drawText1, "width", "100%");
                        dojo.style(drawText1, "tableLayout", "fixed");
                        dijit.setWaiRole(drawText1,'presentation');
                        var drawText2 = document.createElement('div');
                        drawText1.appendChild(drawText2);
                        dojo.attr(drawText2, "class", "draw_frame_classes");
                        dojo.style(drawText2, "display", "table-cell");
                        dojo.style(drawText2, "marginTop", "0pt");
                        dojo.style(drawText2, "marginBottom", "0pt");
                        dojo.style(drawText2, "height", "100%");
                        dojo.style(drawText2, "width", "100%");
                        dojo.style(drawText2, "color", "#000000");
                        dojo.style(drawText2, "fontSize", "12px");
                        dojo.style(drawText2, "fontFamily",window.pe.scene.defaultFonts);
                        dojo.style(drawText2, "backgroundColor","#FFFFFF");
       			        dijit.setWaiRole(drawText2,'presentation');
                        concord.util.HtmlContent.injectRdomIdsForElement(drawText);
                        concord.util.HtmlContent.injectRdomIdsForElement(drawText1);
                        concord.util.HtmlContent.injectRdomIdsForElement(drawText2);
                        notesNode.appendChild(drawText);
                        notesDrawText = drawText;
                    }
                    if (notesDrawText) {
                        var notesDrawFrameClasses = dojo.query(".draw_frame_classes",notesDrawText);
                        //D14832
                        if (notesDrawFrameClasses.length>1){
                            //destroy all the other extra dfc that got added by error
                            for (var i=1; i<notesDrawFrameClasses.length;i++){
                                dojo.destroy(notesDrawFrameClasses[i]);
                            }
                        }
                        notesDrawFrameClasses = notesDrawFrameClasses[0];
                        if (notesDrawFrameClasses) {
                            if (notesDrawFrameClasses.childNodes.length == 0) {
                                //Need to add default text for speaker notes;
                                var pNode = document.createElement('p');
                                dojo.style(pNode, "color", "#000000");
                                dojo.style(pNode, "fontSize", "1em");
                                dojo.style(pNode, "fontFamily", window.pe.scene.defaultFonts);
                                notesDrawFrameClasses.appendChild(pNode);
                                concord.util.HtmlContent.injectRdomIdsForElement(pNode);
                                dojo.addClass(pNode, "defaultContentText cb_notes");
                                var spanNode = document.createElement('span');
                                dojo.style(spanNode, "color", "#000000");
                                dojo.style(spanNode, "fontSize", "1em");
                                dojo.style(spanNode, "fontFamily", window.pe.scene.defaultFonts);
                                notesDrawFrameClasses.childNodes[0].appendChild(spanNode);
                                notesDrawFrameClasses.childNodes[0].childNodes[0].innerHTML = this.STRINGS.layout_clickToAddSpeakerNotes;

                                //make sure the nodes have the correct class names and styles
                                //var attrName = "class";
                                //var layoutClassSSNode = new CKEDITOR.dom.node(notesDrawFrameClasses.parentNode.parentNode);
                                //var oldAttrValue = layoutClassSSNode.getAttribute(attrName);
                                dojo.addClass(notesDrawFrameClasses.parentNode.parentNode, "layoutClassSS");
                                dojo.style(notesDrawFrameClasses.parentNode.parentNode, "border","0px solid");
                                dojo.addClass(notesDrawFrameClasses.parentNode.parentNode.parentNode, "layoutClass");
                                dojo.style(notesDrawFrameClasses, "color", "#000000");
                                dojo.style(notesDrawFrameClasses, "fontSize", "12px");
                                dojo.style(notesDrawFrameClasses, "fontFamily", window.pe.scene.defaultFonts);
                                dojo.style(notesDrawFrameClasses, "backgroundColor", "#FFFFFF");
                                //D16392 make sure notes have no visible border
                                dojo.style(notesDrawFrameClasses, "borderWidth", "0px");
                            } else {
                                //D16392 make sure notes have no visible border
                                if (notesDrawFrameClasses.style.borderWidth == "" || notesDrawFrameClasses.style.borderWidth != "0px") {
                                    dojo.style(notesDrawFrameClasses, "borderWidth", "0px");
                                }
                                if (notesDrawFrameClasses.style.color == "" || notesDrawFrameClasses.style.color != "rgb(0, 0, 0)") {
                                    dojo.style(notesDrawFrameClasses, "color", "#000000");
                                }
                                if (notesDrawFrameClasses.style.fontSize == "" || notesDrawFrameClasses.style.fontSize != "12px") {
                                    dojo.style(notesDrawFrameClasses, "fontSize", "12px");
                                }

                                if (notesDrawFrameClasses.style.fontFamily == "" || notesDrawFrameClasses.style.fontFamily != window.pe.scene.defaultFonts) {
                                    dojo.style(notesDrawFrameClasses, "fontFamily", window.pe.scene.defaultFonts);
                                }

                                dojo.style(notesDrawFrameClasses, "backgroundColor", "#FFFFFF");

                                dojo.query("p,li,span,ul,ol", notesDrawFrameClasses).forEach(function(node, index, arr){
                                    if (node.style.color == "" || node.style.color != "rgb(0, 0, 0)") {
                                        dojo.style(node, "color", "black");
                                    }
                                    if (node.style.fontSize == "" || node.style.fontSize != "12px") {
                                        dojo.style(node, "fontSize", "1em");
                                    }

                                    if (node.style.fontFamily == "" || node.style.fontFamily != window.pe.scene.defaultFonts) {
                                        dojo.style(node, "fontFamily", window.pe.scene.defaultFonts);
                                    }
                                });
                            }
                        }
                    }
                }
            }
            if (BidiUtils.isGuiRtl())
            	dojo.attr(notesDrawFrameClasses.childNodes[0], "dir", "rtl");
            //from ppt conversion, we don't have emptyCB_placeholder attribute for default content boxes.
            //need to find the default content boxes and set them to emptyCB_placeholder true.
            //var drawFrames = dojo.query(".draw_frame",divToProcess );
            var drawFrames = this.getDirectDrawFrameChildren(divToProcess);
            for(var x=0; x<drawFrames.length; x++){
                var drawFrameClasses = dojo.query(".draw_frame_classes", drawFrames[x]);
                if(drawFrameClasses!=null && drawFrameClasses.length>0){
                    for(var j=0; j< drawFrameClasses.length; j++){
                        var children = drawFrameClasses[j].childNodes;
                        if(children!=null && children.length ==1 && children[0].tagName!=null){
                            //handle placeholder in odp
                            if(children[0].tagName.toLowerCase() == "p" && children[0].innerHTML == "" &&
                                    (dojo.attr(drawFrames[x], "presentation_class") == "title"||dojo.attr(drawFrames[x], "presentation_class") == "outline"|| dojo.attr(drawFrames[x], "presentation_class") == "")){
                                //delete the empty p tag
                                msgPairs1 = SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(children[0]),msgPairs1);
                                dojo.destroy(children[0]);
                                //add emptyCB_placeholder to draw_frame
                                dojo.attr(drawFrames[x], "emptyCB_placeholder", "true");
                                dojo.attr(drawFrames[x], "draw_layer", "layout");
                                var newE = new CKEDITOR.dom.node(drawFrames[x]);
                                msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "emptyCB_placeholder", null, msgPairs1,"");
                                msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "draw_layer", null, msgPairs1,"");
                            }else if(children[0].tagName.toLowerCase() == "p"  && dojo.hasClass(children[0], "spacePlaceholder")&& children[0].innerHTML.toLowerCase() == "&nbsp;"){
                                //handleplaceholder in pptx, the p element is the only child of draw_frame_classes and has class spacePlaceholder and it only contains one &nbsp;

                                    //delete the empty p tag
                                    msgPairs1 = SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(children[0]),msgPairs1);
                                    dojo.destroy(children[0]);
                                    //add emptyCB_placeholder to draw_frame
                                    dojo.attr(drawFrames[x], "emptyCB_placeholder", "true");
                                    dojo.attr(drawFrames[x], "draw_layer", "layout");
                                    var newE = new CKEDITOR.dom.node(drawFrames[x]);
                                    msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "emptyCB_placeholder", null, msgPairs1,"");
                                    msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "draw_layer", null, msgPairs1,"");

                            }
                            else if(children[0].tagName.toLowerCase() == "div"  && dojo.hasClass(children[0], "text_list")){
                                //handleplaceholder in ppt, the element under the draw_frame_classes is a "div" and has class text-list
                                //need to further check if this div has only one p element and inside the p element only one span with class "spaceholder" and contains only 1 &nbsp;

                                //check if it only has one p child
                                var pElems = dojo.query("p", children[0]);
                                if(pElems.length == 1){
                                    var spanElems = dojo.query("span", pElems[0]);
                                    if(spanElems.length==1){
                                        var spanElem = spanElems[0];
                                        if(spanElem!=null && dojo.hasClass(spanElem, "spacePlaceholder") && spanElem.innerHTML.toLowerCase() == "&nbsp;"){
                                            //delete the empty div text-list tag
                                            msgPairs1 = SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(children[0]),msgPairs1);
                                            dojo.destroy(children[0]);
                                            //add emptyCB_placeholder to draw_frame
                                            dojo.attr(drawFrames[x], "emptyCB_placeholder", "true");
                                            dojo.attr(drawFrames[x], "draw_layer", "layout");
                                            var newE = new CKEDITOR.dom.node(drawFrames[x]);
                                            msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "emptyCB_placeholder", null, msgPairs1,"");
                                            msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "draw_layer", null, msgPairs1,"");

                                            if(dojo.attr(drawFrames[x], "presentation_class")==null || dojo.attr(drawFrames[x], "presentation_class")==""){
                                                //in ppt, when presentation_class is not set, we assume it is subtitle text.
                                                dojo.attr(drawFrames[x], "presentation_class", "subtitle");
                                                msgPairs1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(drawFrames[x]), "presentation_class", null, msgPairs1,"");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }else if (drawFrameClasses.length==0){//handling ppt presentation_class "object" placeholder where the draw_frame doesn't have any children but it has emptyCB_placeholder ="true"
                    if(dojo.attr(drawFrames[x], "presentation_class") == "object" && dojo.attr(drawFrames[x], "emptyCB_placeholder")=="true" && (drawFrames[x].childNodes== null || (drawFrames[x].childNodes!=null && drawFrames[x].childNodes.length==0) )){ //since we do not handle object type right now, we convert it to "outline"
                        //change the presentation_class to "outline" and add draw_frame_classes here.
                        var slide = drawFrames[x].parentNode;
                        if(slide!=null){
                            var layoutName = dojo.attr(slide, "presentation_presentation-page-layout-name");
                            var masterName = dojo.attr(slide, "draw_master-page-name");
                            var masterPageClass = window.pe.scene.slideSorter.getMasterFrameStyle(masterName, "outline");
                            this.addPlaceHolderContent(drawFrames[x], "outline", layoutName, masterPageClass);

                            //send coedit if the child is successfully created
                            if(drawFrames[x].childNodes!=null && drawFrames[x].childNodes.length>0){
                                //injectID
                                concord.util.HtmlContent.injectRdomIdsForElement(drawFrames[x].childNodes[0]);

                                //set ids for all children elements
                                var children = drawFrames[x].childNodes[0].getElementsByTagName('*');
                                for(var ctr =0; ctr<children.length; ctr++){
                                    //we now need to generate id for span (D47366)
                                    //if(children[ctr].tagName != "span" && children[ctr].tagName != "SPAN"){
                                        concord.util.HtmlContent.injectRdomIdsForElement(children[ctr]);
                                    //}
                                }
                                msgPairs1 = SYNCMSG.createInsertNodeMsgPair(drawFrames[x].childNodes[0], msgPairs1);
                                var oldAttrVal = dojo.attr(drawFrames[x], "presentation_class");
                                dojo.attr(drawFrames[x], "presentation_class", "outline");//change attr presentation_class to outline
                                msgPairs1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(drawFrames[x]), "presentation_class", null, msgPairs1,oldAttrVal );
                                //add layoutClass
                                //Add class layoutClass. Also need to send via coedit to update document
                                var attrName = "class";
                                var newE = new CKEDITOR.dom.node(drawFrames[x]);
                                var oldAttrValue = newE.getAttribute(attrName);
                                dojo.addClass(drawFrames[x],'layoutClass');
                                msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairs1,oldAttrValue);
                                dojo.attr(drawFrames[x], "draw_layer", "layout");
                                msgPairs1 = SYNCMSG.createAttributeMsgPair(newE, "draw_layer", null, msgPairs1,"");
                            }

                        }
                    }
                }
            }
            //Send Coedit msg for inserted tags
            if (msgPairs1!=null && msgPairs1.length > 0){
                //-replace removeUndo
                var addToUndo = false;
                msgPairs1[0] = SYNCMSG.addUndoFlag(msgPairs1[0],addToUndo);

                SYNCMSG.sendMessage(msgPairs1, SYNCMSG.NO_LOCAL_SYNC);
            }

            //get the top and height setting from outline master-page to be used to adjust outline and image placeholder div
            //since we can't rely on value from conversion, it is sometimes not the same height for ALT9 outline and graphics for example.
            //we readjust it in client side
            //get current master info for the style/class to be replaced
            var outlineMasterId = this.currMaster.masterPages[1].name;
            var outlineMasterPageDiv = document.getElementById(outlineMasterId);
            var outlineMasterFramesArray = dojo.query(".draw_frame[presentation_class='outline']",outlineMasterPageDiv);
            var outlineMasterFrame = null;
            var outlineMasterTop = "";
            var outlineMasterHeight = "";
            if(outlineMasterFramesArray.length >0) {
                //always has only one outline in the master page definition. so use the first one
                outlineMasterFrame = outlineMasterFramesArray[0];
            }
            if(outlineMasterFrame !=null){
                outlineMasterTop = outlineMasterFrame.style.top;
                outlineMasterHeight = outlineMasterFrame.style.height;
            }

            var placeHolderFrames = dojo.query("[emptyCB_placeholder='true']", divToProcess);
            for(var i=0; i<placeHolderFrames.length; i++){

                var childDiv = null;

                var presClass = dojo.attr(placeHolderFrames[i],"presentation_class");
                if(presClass!= null && presClass!="" && presClass !="graphic" && presClass !="group"){
                    var childDivs = dojo.query(".draw_text-box", placeHolderFrames[i]);
                    if(childDivs!=null && childDivs.length>0){
                        childDiv = childDivs[0];
                    }
                    var drawFrameClasses = dojo.query(".draw_frame_classes", placeHolderFrames[i]);
                    if(drawFrameClasses!=null ){
                        for(var j=0; j< drawFrameClasses.length; j++){
                            var children = drawFrameClasses[j].childNodes;
                            var msgPairs = null;
                            var createTagForCoedit = false;
                            if(children.length == 0){
                                this.addPlaceHolderContentToDrawFrameClassDiv(drawFrameClasses[j], presClass,layoutName);
                                if(drawFrameClasses[j].id == "" || drawFrameClasses[j].id == undefined){
                                    // [todo] : drawFrameClassDiv is undefined; need to fixit in future
                                	// concord.util.HtmlContent.injectRdomIdsForElement(drawFrameClassDiv);
                                }

                                //set ids for all children elements
                                //console.log(" Before inject id "+drawFrameClasses[j].innerHTML);
                                var children = drawFrameClasses[j].getElementsByTagName('*');
                                for(var ctr =0; ctr<children.length; ctr++){
                                    //we now need to generate id for span (D47366)
                                    //if(children[ctr].tagName != "span" && children[ctr].tagName != "SPAN"){
                                        concord.util.HtmlContent.injectRdomIdsForElement(children[ctr]);
                                    //}
                                }
                                //console.log("After inject id "+drawFrameClasses[j].innerHTML);

                                //Let's loop again for coedit purpose. We had to wait until this point to ensure that all children
                                //nodes have an id from previous loop.
                                var children = drawFrameClasses[j].getElementsByTagName('*');
                                for(var ctr =0; ctr<children.length; ctr++){
                                    if (children[ctr].tagName.toLowerCase() == "p" || children[ctr].tagName.toLowerCase() == "ul"){
                                        //A <p> or a <ul> was added so we need to send coedit code
                                            msgPairs = SYNCMSG.createInsertNodeMsgPair(children[ctr]);
                                    }
                                }

                                //Send Coedit msg for inserted tags
                                if (msgPairs!=null && msgPairs.length > 0){
                                    //-replace removeUndo
                                    var addToUndo = false;
                                    msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],addToUndo);

                                    SYNCMSG.sendMessage(msgPairs, SYNCMSG.NO_LOCAL_SYNC);
                                }

                                //Add class layoutClass. Also need to send via coedit to update document
                                var attrName = "class";
                                var newE = new CKEDITOR.dom.node(placeHolderFrames[i]);
                                var oldAttrValue = newE.getAttribute(attrName);
                                dojo.addClass(placeHolderFrames[i],'layoutClass');
                                var	msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, null,oldAttrValue);

                                //Add class layoutClassSS. Also need to send via coedit to update document
                                if(childDiv!=null){
                                    var attrName = "class";
                                    var newE = new CKEDITOR.dom.node(childDiv);
                                    var oldAttrValue = newE.getAttribute(attrName);
                                    dojo.addClass(childDiv,"layoutClassSS");
                                    msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);
                                }
                                //-replace removeUndo
                                var addToUndo = false;
                                msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);

                                SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                            }
                        }
                    }
                }else if(presClass!= null && (presClass=="graphic" || (presClass == "group" && dojo.hasClass(placeHolderFrames[i], "draw_image")))){ //sometimes from conversion we get presClass graphic right away but sometimes it comes in as group

                    //now the graphic place holder has presentation class set to graphic and emptyCB_placeholder = true and all the styles already there
                    //remove the children of draw_frame
                    var defaultImgElems = dojo.query(".defaultContentImage", placeHolderFrames[i]);
                    if(defaultImgElems==null || defaultImgElems.length==0){
                        var msgPairs2 = [];
                        if(placeHolderFrames[i].children!=null && placeHolderFrames[i].children.length >0){
                            for (var y=0; y<placeHolderFrames[i].children.length; y++){
                                var elem = this.editor.document.getById(placeHolderFrames[i].children[y].id);
                                msgPairs2 = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairs2);
                                dojo.destroy(placeHolderFrames[i].children[y]);
                            }
                        }

                        var placeHolderContent = document.createElement("div");
                        placeHolderContent.className ="imgContainer layoutClassSS";
                        placeHolderFrames[i].appendChild(placeHolderContent);
                        var contentPresClass = "graphic";
                        this.addPlaceHolderContentToDrawFrameClassDiv(placeHolderContent, contentPresClass,layoutName);
                        this.setDivIdWithChildren(placeHolderContent);
                        msgPairs2 = SYNCMSG.createInsertNodeMsgPair(placeHolderContent, msgPairs2);

                        //Add class layoutClass. Also need to send via coedit to update document
                        var attrName = "class";
                        var newE = new CKEDITOR.dom.node(placeHolderFrames[i]);
                        var oldAttrValue = newE.getAttribute(attrName);
                        dojo.addClass(placeHolderFrames[i],'layoutClass');
                        dojo.removeClass(placeHolderFrames[i],'draw_image');

                        //dojo.attr(parent,"emptyCB_placeholder", "true");
                        //dojo.attr(parent,"presentation_class", "graphic");
                        //use outline master class for default font style

                        if(this.currMasterFrameStylesJSON!=null){
                            var masterOutlineClass = this.currMasterFrameStylesJSON.text_outline;
                            var defaultTextStyle = this.currMasterFrameStylesJSON.default_text;
                            if(defaultTextStyle == null || defaultTextStyle==""){
                                //defaultTextStyle = "standard";
                                defaultTextStyle = "";
                            }
                            dojo.addClass(placeHolderFrames[i], defaultTextStyle);
                            dojo.addClass(placeHolderFrames[i], masterOutlineClass);
                        }
                        msgPairs2 = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairs2,oldAttrValue);

                        //clean up the drawFrame div, from unnecessary shape attr
                        if(dojo.hasAttr(placeHolderFrames[i],"ungroupable")){
                            var oldAttrVal = newE.getAttribute("ungroupable");
                            dojo.attr(placeHolderFrames[i],"ungroupable","");
                            msgPairs2 = SYNCMSG.createAttributeMsgPair(newE, "ungroupable", null, msgPairs2,oldAttrVal);
                        }
                        if(dojo.hasAttr(placeHolderFrames[i],"contentboxtype")){
                            var oldAttrVal = newE.getAttribute("contentboxtype");
                            dojo.attr(placeHolderFrames[i],"contentboxtype","");
                            msgPairs2 = SYNCMSG.createAttributeMsgPair(newE, "contentboxtype", null, msgPairs2,oldAttrVal);
                        }
                        if(dojo.attr(placeHolderFrames[i],"presentation_class")!="graphic"){
                            var oldAttrVal = newE.getAttribute("presentation_class");
                            dojo.attr(placeHolderFrames[i],"presentation_class","graphic");
                            msgPairs2 = SYNCMSG.createAttributeMsgPair(newE, "presentation_class", null, msgPairs2,oldAttrVal);
                        }
                        //Send Coedit msg
                        if (msgPairs2!=null && msgPairs2.length > 0){
                            //-replace removeUndo
                            var addToUndo = false;
                            msgPairs2[0] = SYNCMSG.addUndoFlag(msgPairs2[0],addToUndo);

                            SYNCMSG.sendMessage(msgPairs2, SYNCMSG.NO_LOCAL_SYNC);
                        }
                    }

                }
                //adjust the top and height if necessary
                if((presClass == "outline" || presClass == "graphic") && outlineMasterTop.length>0 && outlineMasterHeight.length>0){
                    var slideId = div.id;
                    var numberOfPresClass = dojo.query("#"+slideId+" > [presentation_class='"+presClass+"']", div.parentNode);
                    if(this.supportedLayoutArray[layoutName] == true && (
                            ((layoutName == "ALT1"||layoutName == "ALT1-RTL") && presClass =="outline" && numberOfPresClass.length == 1)||
                            ((layoutName.indexOf("ALT9") != -1||layoutName.indexOf("ALT6") != -1) && presClass =="outline" && numberOfPresClass.length == 1)||
                            ((layoutName.indexOf("ALT9") != -1||layoutName.indexOf("ALT6") != -1) && presClass =="graphic" && numberOfPresClass.length == 1)||
                            ((layoutName == "ALT3"||layoutName == "ALT3-RTL") && presClass =="outline" && numberOfPresClass.length <=2)
                            )){
                        if(placeHolderFrames[i].style.top != outlineMasterTop || placeHolderFrames[i].style.height != outlineMasterHeight){
                            //defect 9474: need to do the following only for layoutName that we recognize
                            //ALT1, ALT9, etc

                            var newE = new CKEDITOR.dom.node(placeHolderFrames[i]);
                            var dataAttr ={};
                            dataAttr.attributeName = 'style';
                            dataAttr.attributeValue ="top:"+outlineMasterTop+";";
                            dataAttr.id = newE.getId();
                            var attrObj = SYNCMSG.getAttrValues(dataAttr,this.getSorterDocument());
                            placeHolderFrames[i].style.top = outlineMasterTop;
                            var msgPairList3 = SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList3);

                            outlineMasterHeight = this.adjustOutlineHeightForFooters(null, drawFrames, outlineMasterHeight, outlineMasterTop);

                            dataAttr.attributeValue ="height:"+outlineMasterHeight+";";
                            attrObj = SYNCMSG.getAttrValues(dataAttr,this.getSorterDocument());
                            placeHolderFrames[i].style.height = outlineMasterHeight;
                            msgPairList3 = SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList3);


                            if (msgPairList3!=null && msgPairList3.length > 0){
                                //-replace removeUndo
                                var addToUndo = false;
                                msgPairList3[0] = SYNCMSG.addUndoFlag(msgPairList3[0],addToUndo);

                                SYNCMSG.sendMessage(msgPairList3, SYNCMSG.NO_LOCAL_SYNC);
                            }
                        }
                    }
                }

                //
                // presentation graphics is back but may not be reliable let 's go with image processing below.
                // Commented out code was removed in #27669
            }
            //for img placeholder converted from odp doesn't have attribute emptyCB_placeholder
            //the only indication that the img is a placeholder is that:
            //(1)the img element is directly under draw_frame element that doesn't have class "backgroundImage"
            //(2) no emptyCB_placeholder at the draw_frame level
            //(3) no presentaton_class attribute set att he draw_frame level (vs. actual image (non place holders has presentation_class set to "graphic")
            //(4) draw_page layout is the layout that contains image e.g. ALT9
            // Commented out code was removed in #27669
    },

    showLayoutDialog:function(){
        //send events that we need to open layout dialog
        var eventData = [{eventName: 'launchSlideLayoutDialog'}];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);
    },
    showDesignDialog:function(){
        //send events that we need to open deesign dialog
        var eventData = [{eventName: 'launchSlideDesignDialog'}];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);

    },
    showSlideTransitionDialog:function(){
        //send events that we need to open deesign dialog
        var eventData = [{eventName: 'launchSlideTransitionDialog'}];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);
    },
    refreshSlidesObject:function(){
        //refresh this.slides
        if(this.officePrezDiv!=null){
            var thumbnails = dojo.query('.draw_page',this.officePrezDiv);
            this.slides = thumbnails;
            //update slideNumber for all slides
            this.updateSlideNumbers();
        }
    },
    updateSlideNumbers: function(){
        if(this.slides!=null){
            for(var i=0; i<this.slides.length; i++){
                var slideNumberDiv = null;
                if (this.slides[i].nextSibling)
                	slideNumberDiv = this.slides[i].nextSibling.firstChild;
                else 
                	slideNumberDiv = this.getSlideNumberDiv(this.slides[i]);
                
                if(slideNumberDiv!=null){
                    //if selected slide's slidenumber is changing, update slide editor too
                    if(this.selectedSlide == this.slides[i] && slideNumberDiv.innerHTML != (i+1)){
                        //publish an event to update slide editor's page number
                        var eventData = [{'eventName':concord.util.events.slideSorterEvents_eventName_selectedSlideNumberUpdated, 'slideNumber':i+1}];
                        dojo.publish(concord.util.events.slideSorterEvents, eventData);
                    }
                    slideNumberDiv.innerHTML = '';//mobile need to clear innerHTML first, or update will fail
                    slideNumberDiv.innerHTML = i+1;
                }
                this.updatePageNumberFields(this.slides[i], i+1);
            }
        }
    },
    getSlideNumberDiv:function(slideElem){
        var slideNumberDiv = null;
        if(slideElem!=null){
            var slideWrapper = slideElem.parentNode;
            var slideNumberDivs = dojo.query('.slideNumber',slideWrapper);
            if(slideNumberDivs.length>0){
                slideNumberDiv = slideNumberDivs[0];
            }
        }
        return slideNumberDiv;
    },
    getAllSlides:function(){
        this.refreshSlidesObject();
        return this.slides;
    },
    getNextSlideOf:function(slideElemWrapper){
        if(slideElemWrapper!=null){
            var nextElem = slideElemWrapper.nextSibling;
            while(nextElem != null){
                if(nextElem.nodeType == 1 && nextElem.className.indexOf("slideWrapper")>=0){
                    return nextElem;
                }
                nextElem = nextElem.nextSibling;
            }
        }
        return null;
    },
    getPreviousSlideOf:function(slideElemWrapper){
        if(slideElemWrapper!=null){
            var prevElem = slideElemWrapper.previousSibling;
            while(prevElem != null){
                if(prevElem.nodeType == 1 && prevElem.className.indexOf("slideWrapper")>=0){
                    return prevElem;
                }
                prevElem = prevElem.previousSibling;
            }
        }
        return null ;
    },
    isElemASlide: function (elem){
        return true;

    },
    getIdxInMultiSelectSlides: function(slideElem){
        for (var k=0; k < this.multiSelectedSlides.length; k++){
            if(this.multiSelectedSlides[k]=== slideElem) {
                return k;
            }
        }
        return -1;
    },
    selectSlide:function(slideElem){
        if (slideElem != null) {
        	// do not show the heavy border, which will trigger redraw on slideSorter
        	if (!concord.util.browser.isMobile()) {
        	  dojo.addClass(slideElem,'slideSelected');
        	}
        }
    
        var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(slideElem);
        if(idxInMultiSelectSlides <0){
            this.multiSelectedSlides.push(slideElem);
            //this.selectedSlide = slideElem;  //This.selectedSlide only set when user single click a slide (the slide that opens in slideEditor)
        }
        this.updateContextMenuOptions();
    },


    //
    //Added for D41744
    //
    handleDeselectSlide: function(slide){
        dojo.removeClass(slide,'slideSelected');
    },

    deselectSlide: function(slideElem, idx) {
        //D41744
        dojo.withDoc(this.editor.document.$, dojo.hitch(this, this.handleDeselectSlide,slideElem), null);
        if(idx!=null && idx >=0) {
            this.multiSelectedSlides.splice(idx, 1);
        }
        /*
        //Example of notification publish event for "showSlide"
         //send events that we need to showSlide
        var slideId = slideElem.id;
        var eventData = [{eventName: concord.util.events.notificationEvents_eventName_showSlide, slideId:slideId}];
        dojo.publish(concord.util.events.notificationEvents, eventData);
        */

    },

    getSlideNumber: function(slideElem) {
        var slideNumber = -1;
        if (slideElem != null) {
            var slideNumberDiv = this.getSlideNumberDiv(slideElem);
                if(slideNumberDiv !=null) {
                    slideNumber = slideNumberDiv.innerHTML;
                } else {
                    var slides = this.getAllSlides();
                    for (var k=0; k < slides.length; k++) {
                        if (slides[k] == slideElem) {
                            slideNumber = k+1;
                            return slideNumber;
                        }
                    }
                }
        }
        return slideNumber;
    },

    getAllSlideNumbers:function(){
        var slideNumbersArray = [];
        var slides = this.getAllSlides();
        for(var i=0; i < slides.length; i++){
            var slideId = slides[i].id;
            var slideNumber = this.getSlideNumber(slides[i]);
            slideNumbersArray[slideId]=slideNumber;
        }
        return slideNumbersArray;
    },
    displaySlideNumber:function(slideElem,div){
        if(div == null){
            div = document.getElementById(this.slideNumberDivId);
        }
        if(slideElem!=null && div!=null){
            var slideNum = this.getSlideNumber(slideElem);
            var allSlides = this.slides;
            if(allSlides == null){
                allSlides = this.getAllSlides();
            }
            var slideTotal = -1;
            if(allSlides!=null){
                slideTotal = allSlides.length;
            }
            //var htmlString = this.STRINGS.slide+" "+slideNum+ " "+this.STRINGS.of+" "+slideTotal;
            var htmlString = this.STRINGS.slideOf;  //slideOf is like: "Slide %SLIDE_NUMBER of %TOTAL_NUM_OF_SLIDE"
            htmlString = dojo.string.substitute(htmlString,[slideNum, slideTotal]);


            div.innerHTML = htmlString;
            if(div.style.visibility !="visible"){
                div.style.visibility = "visible";
            }
            //console.log("slideNumber:"+htmlString);
        }
    },
    selectMultiSlides: function(slideElemStartIdx, slideElemEndIdx){
        if(slideElemStartIdx!=null && slideElemEndIdx !=null && slideElemStartIdx <=slideElemEndIdx) {
            for(var k=slideElemStartIdx; k<=slideElemEndIdx; k++){
                var currSlide = this.slides[k];
                var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(currSlide);
                //if this is not already available in multiSelectedSlides array, select it
                if(idxInMultiSelectSlides<0){
                    this.selectSlide(this.slides[k]);
                }
            }
        }
    },
    deselectMultiSlides: function(slideElemStartIdx, slideElemEndIdx){
        if(slideElemStartIdx!=null && slideElemEndIdx !=null && slideElemStartIdx <=slideElemEndIdx) {
            for(var k=slideElemStartIdx; k<=slideElemEndIdx; k++){
                var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(this.slides[k]);
                this.deselectSlide(this.slides[k],idxInMultiSelectSlides );
            }
        }
    },
    
    /**
     * Move the selected slide
     * @param slideElemWrapper The slide will be moved.
     * @param moveBeforeSilde	   Move the slide before this slide.
     * If the moveBeforeSilde is null will insert the slide to the end
     */
    _moveImpl: function(slideElemWrapper, moveBeforeSilde)
    {
    	var ckNode = new CKEDITOR.dom.node(slideElemWrapper);
         
     	var actPair = [];
        actPair.push( SYNCMSG.createDeleteElementAct(ckNode.getIndex(), 1, ckNode.getParent(), [ckNode], true) );

         //remove slideUtil div so that it is not sent in the message
        this.removeSlideUtilDiv([slideElemWrapper]);

        var slideElemWrapperParent = slideElemWrapper.parentNode;
 		slideElemWrapperParent.insertBefore(slideElemWrapper,moveBeforeSilde);
 		
 		actPair.push( SYNCMSG.createInsertElementAct(ckNode.getIndex(), ckNode.getParent(), ckNode, true) );
        var msgPairList = [ SYNCMSG.createMessage(MSGUTIL.msgType.MoveSlide, actPair) ];
 		
 		msgPairList = this.addMoveFlag(msgPairList);
 		//set the msg's has delete and insert same element, for undo processing allowing delete and insert element together in the same msgList
        msgPairList = SYNCMSG.setHasInsertDeleteSameElementInMsgListFlag(msgPairList, true);
 		SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);

 		//add back the slideUtil div
 		var slideElem = dojo.query(".draw_page", slideElemWrapper)[0];
        this.createSlideUtilDiv([slideElem]);

        //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
        this.displaySlideNumber(slideElem, this.slideNumberDiv);

 		//update slide selected indicator for the other user
 		this.publishSlideSelectedEvent(this.selectedSlide);
    },
    
    moveSlideUp:function(slideElemWrapper){
        if(slideElemWrapper != null){
        	var preSibling = this.getPreviousSlideOf(slideElemWrapper);
        	preSibling && this._moveImpl(slideElemWrapper, preSibling);
        }
    },
    moveSlideDown:function(slideElemWrapper) {
        if(slideElemWrapper != null){   
        	var nextSibling = this.getNextSlideOf(slideElemWrapper);
        	nextSibling && this._moveImpl(slideElemWrapper, nextSibling.nextSibling);
        }
    },

    isSlideLocked: function(slideElemWrapper){
        this.userLocks=[]; // adding this to reset the userLocks object to make sure we get a fresh one every time, this.userLocks is for a slide
        if(!slideElemWrapper)
        	return false;
        // var slide = dojo.query('.draw_page',slideElemWrapper)[0];  // do not call dojo.query
        var slide_id = null;
        if (slideElemWrapper.childNodes.length > 0) {
        	slide_id = slideElemWrapper.childNodes[0].id;
        }
  
        if (!slide_id || slide_id.length == 0)
        	return false;
        
        if (window.pe.scene.isSlideNodeLocked(slide_id)){
            this.userLocks.push(window.pe.scene.getUsersSlideNodeLock(slide_id));
            //this.publishLaunchContentLockDialog(slide.id);
            return true;
        }
        return false;
    },

    getSlideLockedUsers: function(slide){
        var userLocks=[];

        if (slide!=null && window.pe.scene.isSlideNodeLocked(slide.id)){
            userLocks.push(window.pe.scene.getUsersSlideNodeLock(slide.id));
            //this.publishLaunchContentLockDialog(slide.id);
        }
        return userLocks;
    },
    getAllLockingUsersInMultiSelectedSlides: function(){
        var slidesArray = this.multiSelectedSlides;
        var allLockingUsers = [];
        var utilArrayUserId = []; //associative array to help for faster compare userid
        if(slidesArray !=null){
            for(var i=0; i< slidesArray.length; i++){
                var slideUsers = this.getSlideLockedUsers(slidesArray[i]);
                if(slideUsers!=null && slideUsers.length>0){
                    for(var j=0; j<slideUsers[0].length; j++){
                        var userId = slideUsers[0][j].id;
                        if(utilArrayUserId[userId]== null){ //if hasn't captured before
                            utilArrayUserId[userId] = 1;
                            allLockingUsers.push(slideUsers[0][j]);
                        }
                    }
                }
            }
        }
        return allLockingUsers;

    },

    publishLaunchContentLockDialog: function(isSlide){
        if(isSlide == null){
            isSlide = true;
        }
        var allLockingUsers =[];
        if(isSlide == true){
            allLockingUsers = this.getAllLockingUsersInMultiSelectedSlides();
        }else{
            allLockingUsers = window.pe.scene.getMultiSlideContentBoxLockedUsers();
        }
            if(allLockingUsers !=null){
                //get all user ids
                var userIdList = [];
                if(isSlide == true){
                    for ( var i = 0; i <allLockingUsers.length; i++) {
                        userIdList.push(allLockingUsers[i].id);
                    }
                }else{
                    for(var i in allLockingUsers){
                        userIdList.push(allLockingUsers[i].id);
                    }
                }

                //just use the first multiselected slide id, this id is just to determine in processign the launchContentLockDialog if the object is the slide or not
                //doesn't matter if the id passed in as objId is the actual slide locked or not, this is just to determine the msg displayed is for slide vs. slide content object
                var objId = null;

                if(isSlide == true && this.multiSelectedSlides!= null && this.multiSelectedSlides.length>0){
                    objId = this.multiSelectedSlides[0].id;
                }
                var eventData = [{'eventName':concord.util.events.slideSorterEvents_eventName_launchContentLockDialog, 'objId':objId,'userList':userIdList}];
                dojo.publish(concord.util.events.slideSorterEvents, eventData);
            }

    },

    deleteSlideComments: function(slideElemWrapper) {
        dojo.query(".draw_frame", slideElemWrapper).forEach(function(node, index, arr){
            var commentsId = dojo.attr(node,"commentsid");
            if (commentsId  != null) {
     			var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_DeleteComments,'commentsId':commentsId}];
     			dojo.publish(concord.util.events.commenttingEvents, eventData);
            }
        });
    },
    
    undoDeleteSlideComments: function(slideElemWrapper) {
        dojo.query(".draw_frame", slideElemWrapper).forEach(function(node, index, arr){
            var commentsId = dojo.attr(node,"commentsid");
            if (commentsId  != null) {
				var commentsArray = commentsId.split(' ');
				for(var i=0;i<commentsArray.length;i++) {
					concord.widgets.sidebar.CommentsController.publishUndoDeleteEvent(commentsArray[i]);	
				}			
            }
        });
    },

    // jmt - coeditfix
    deleteSlide:function(slideElemWrapper, isFromDeleteSlides, msgPairList) {
        if(msgPairList == null){
            msgPairList = [];
        }
        if (!this.isSlideLocked(slideElemWrapper)){
            if(slideElemWrapper !=null) {
                //To avoid delete comment event send to comment bar, when delete a slide
                //for defect 17620
                this.deleteSlideComments(slideElemWrapper);
                var slideId = null;
                //change selected slide to the next slide if any, otherwise to prev slide
                var slideElemWrapperNextSibling = this.getNextSlideOf(slideElemWrapper);
                var slideElemWrapperPrevSibling = this.getPreviousSlideOf(slideElemWrapper);
                //if this is a call  from deleteSlides function, the deleteSlides will perform the next slide to be clicked,
                //otherwise, perform the next slide to be clicked here
                if(slideElemWrapperNextSibling!=null && isFromDeleteSlides !=true){
                    //select the next slide
                    var nextSlide = dojo.query(".draw_page", slideElemWrapperNextSibling);
                    if(nextSlide.length>0 ){
                        this.simulateSlideClick(nextSlide[0]);
                    }
                }else if (slideElemWrapperPrevSibling!=null && isFromDeleteSlides !=true){
                    //select the prev slide
                    var prevSlide = dojo.query(".draw_page", slideElemWrapperPrevSibling);
                    if(prevSlide.length>0){
                        this.simulateSlideClick(prevSlide[0]);
                    }

                }else {//the only slide is to be deleted
                    //what to do when deleting the only slide?
                }
                if(slideElemWrapperNextSibling!=null || slideElemWrapperPrevSibling!=null){
                    var slideElem = dojo.query(".draw_page", slideElemWrapper);
                    var slideNumber = -1;
                    if(slideElem!=null && slideElem.length>0){
                        //handling task for deleteSlide is pending UX design
                        slideId = slideElem[0].id;
                        this.disconnectEvents(slideElem[0]);
                        slideNumber=this.getSlideNumber(slideElem[0]);
                    }
                    var slideElemWrapperParent = slideElemWrapper.parentNode;
                    var slideElemWrapperId = slideElemWrapper.id;
                    
                    //coediting
                    //this.coeditingSendMsgForDeleteSlide(slideElemWrapperId);
                    if(slideElemWrapperId !=null){
                        var elem = this.editor.document.getById(slideElemWrapperId);
                        // isFromDeleteSlides will be true only in a call in mSlideSorter.jx
                        // To not impact it, keep this var
                        // For other calls, create acts other than message
                        if (isFromDeleteSlides != true)
                            msgPairList =SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                        else
                            msgPairList.push( SYNCMSG.createDeleteElementAct(
                              elem.getIndex(), 1, elem.getParent(), [elem], true) );
                        PresCKUtil.deleteILBeforeStyles(slideElemWrapper);
                        if(isFromDeleteSlides!=true){
                            if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
                            	msgPairList[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
                            	msgPairList[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
            					pe.scene.slideSorter.postListCssStyleMSGList = null;
            					pe.scene.slideSorter.preListCssStyleMSGList = null;
            					PresCKUtil.doUpdateListStyleSheet();
            				}
                            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                        }
                    }
                    //clean up memory leak
                    if(slideNumber!= -1){
                        this.slides[slideNumber-1] = null;
                    }

                    dojo.destroy(slideElemWrapper);
                    this.slides=null;  //will be set in refreshSlidesObject
                    this.selectedSlide =null; //will be set in the deleteSlides by simulatSlideClick
                    this.refreshSlidesObject();

                    //delete from contentObj
                    this.deleteSlideFromContentObj(slideId);

                    //clean up memory leak
                    slideElemWrapperNextSibling = null;
                    slideElemWrapperPrevSibling = null;
                    slideElemWrapper = null;
                    slideElem = null;
                }
            }
        }
        return msgPairList;
    },

    //D41774
    //
    //
    disconnectDNDEvent: function(){
        if (this.slideSorterDndSource!=null && this.slideSorterDndSource.events && this.slideSorterDndSource.events.length>0){
            dojo.forEach(this.slideSorterDndSource.events, dojo.disconnect);
            this.slideSorterDndSource.events= null;
        }
    },

    //D41774
    // Reconnect events for dojo dnd after having deleted slides
    // these events caused slides to be kept in memory
    // Events are originally defined in Container.js and Selector.js
    //
    reconnectDNDEvent: function(){
        var presNode= this.officePrezDiv;
        this.slideSorterDndSource.events = [
                //from Source.js
                dojo.connect(presNode, "onmousedown", this.slideSorterDndSource, "onMouseDown"),
                dojo.connect(presNode, "onmouseup",   this.slideSorterDndSource, "onMouseUp"),
                //from Container.js
                dojo.connect(presNode, "onmouseover", this.slideSorterDndSource, "onMouseOver"),
                dojo.connect(presNode, "onmouseout",  this.slideSorterDndSource, "onMouseOut"),
                // cancel text selection and text dragging
                dojo.connect(presNode, "ondragstart",   this.slideSorterDndSource, "onSelectStart"),
                dojo.connect(presNode, "onselectstart", this.slideSorterDndSource, "onSelectStart")
        ];

    },

    //D41774
    //When deleting slides need to process dnd so slides are not kept in memory
    //
    prepSlideDeleteDNDHandle: function(){
        this.disconnectDNDEvent();
    },

    //D41774
    //When deleting slides need to process dnd so slides are not kept in memory
    //
    postSlideDeleteDNDHandle: function(){
        this.reconnectDNDEvent();
        this.slideSorterDndSource.sync();
    },



    deleteSlides: function(isFromCut){
        //prevent users from deleting a slide when there is only one slide in the presentation or when all slides are selected
        if(this.multiSelectedSlides.length == this.slides.length) {
            return;
        }
        this.refreshSlidesObject();
        var isDeleteAllSlides = false;
        if(this.multiSelectedSlides!=null && (this.multiSelectedSlides.length == this.slides.length)){
            //trying to delete all slides, we need to spare 1 slide (first slide) to remain in the document.
            var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(this.slides[0]);
            this.deselectSlide(this.slides[0], idxInMultiSelectSlides);
            if(isFromCut == true){
                if(this.slidesToCopy!=null && this.slidesToCopy.length>0){
                        this.slidesToCopy.splice(0, 1);
                }
            }
            isDeleteAllSlides = true;
        }

        if(this.multiSelectedSlides!=null && this.multiSelectedSlides.length>0){
            var lastSlideSelectedElemWrapper = this.multiSelectedSlides[this.multiSelectedSlides.length-1].parentNode;
            var slideElemWrapperNextSibling = this.getNextSlideOf(lastSlideSelectedElemWrapper);
            var nextSlide = dojo.query(".draw_page", slideElemWrapperNextSibling);
            var slideElemWrapperPrevSibling = this.getPreviousSlideOf(lastSlideSelectedElemWrapper);
            var prevSlide = dojo.query(".draw_page", slideElemWrapperPrevSibling);

            while(this.isSlideSelected(nextSlide[0])){
                slideElemWrapperNextSibling = this.getNextSlideOf(slideElemWrapperNextSibling);
                nextSlide = dojo.query(".draw_page", slideElemWrapperNextSibling);
            }
            while(this.isSlideSelected(prevSlide[0])){
                slideElemWrapperPrevSibling = this.getPreviousSlideOf(slideElemWrapperPrevSibling);
                prevSlide = dojo.query(".draw_page",slideElemWrapperPrevSibling);
            }

            //delete the slide

            //notification wangxum@cn.ibm.com
            var msg = this.getNotifyTool().createMsgStringfromSlidelist(this.multiSelectedSlides);



            //check if there is locked slide, if so, do not delete anything
            var isHavingLockedSlide = this.isMultiSlidesHaveLockedSlide();
            if(isHavingLockedSlide == true){
                this.publishLaunchContentLockDialog();
                //dojo.byId( pe.scene.slideSorterContainerId).focus();
                return;
            }else {
                //check if there is any slide with task, if so, do not delete anything
                if(this.taskHandler){ 
                	if(this.taskHandler.disableSlidesDelete()){
                		return;
                	}
                }
            }

            //below code delete the unlocked slides
            //and leave the locked slides alone
            //with the above check (slide lock and task), we prevent deleting anything if any of the slides is either locked or has task
            //when the code comes here, we are for sure has all the slides not locked nor have tasks
            //the below code is still save to run, only the part selecting the locked slide would never execute.
            //keeping this code just in case we want to change back to the old behaviour deleting the unlocked slides and leave the locked slides.

            var msgPairList =[];
            // D41744
            this.prepSlideDeleteDNDHandle();
            var cpContent = '';
            var docId = this.presBean.getUri();
            var len = this.multiSelectedSlides.length;
            var slideCount = this.getAllSlides().length;
            
            var isDesktop = !concord.util.browser.isMobile();
            // delete slides from larger to smaller index to make
            // their indexes more understandble(wysiwyw)
            for(var i=len - 1; i >= 0 ; i--){
                var _ss = this.multiSelectedSlides[i];
                if (!this.isSlideLocked(_ss.parentNode)){
                    //load slide to sorter just in case the multiselected slides has unloaded content
                    //if it is unloaded, need to load the slide from contentHandler
                	var cloneSlide = _ss.cloneNode(true);
                	
                	//Mobile app currently does not support cross document copy,
                	//  no need encoding here which is time consuming on mobile.
                	isDesktop && PresListUtil._EnCodingDataForBrowser(cloneSlide);

                	var htmlContent = new CKEDITOR.dom.element(cloneSlide).getOuterHtml();
                    this.loadSlideToSorter(_ss);

                    var idxInMultiSelectSlides = this.getIdxInMultiSelectSlides(_ss);
                    this.deselectSlide(_ss, idxInMultiSelectSlides);
                    this.deleteFromContextMenusArray(_ss);
                    if (this.ctxMemLeakHash[_ss.id]){
                        for(var indx=0; indx< this.ctxMemLeakHash[_ss.id].length; indx++){
                            try{
                                this.ctxMemLeakHash[_ss.id][indx].obj.destroyRecursive();
                            }catch(e){
                            }
                        }
                    }
                    if(this.slideSorterContextMenu!=null && this.selectedSlide == _ss){
                        this.slideSorterContextMenu.unBindDomNode(_ss);
                    }
                    msgPairList = this.deleteSlide(_ss.parentNode, true, msgPairList);
                    // keep copied slide index from smaller to larger
                    cpContent = htmlContent + cpContent;
                }
            }
            this.postSlideDeleteDNDHandle();
            
            //Mobile app currently does not support cross document copy
            //  so no need to push to system clipboard here.
            //  todo: even for desktop, seems no need to do this action in deleteslides.
            if(isFromCut && isDesktop)
            {
                var params = {'content':cpContent,'type':'object','docId': docId};
                pe.scene.clipboard.copy(params);
            }
            
            // Just send one msg for multiple slide deleting
            msgPairList = [ SYNCMSG.createMessage(MSGUTIL.msgType.Element, msgPairList) ];
        //coediting
            PresCKUtil.doUpdateListStyleSheet();
            if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){
                msgPairList[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
                msgPairList[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
                pe.scene.slideSorter.postListCssStyleMSGList = null;
                pe.scene.slideSorter.preListCssStyleMSGList = null;
            }
            // original slide count which will be used in OT
            // to handle all slides are deleted by coeditors in the same time
            msgPairList[0].msg.updates[0].p_osc = slideCount;
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);

            //change selected slide
                if(slideElemWrapperNextSibling!=null ){
                    //select the next slide
                    var nextSlide = dojo.query(".draw_page", slideElemWrapperNextSibling);
                    if(nextSlide.length>0 ){
                    	setTimeout(dojo.hitch(this, this.simulateSlideClick, nextSlide[0]), 100);
//                    	this.simulateSlideClick(nextSlide[0]);
                    }
                }else if (slideElemWrapperPrevSibling!=null ){
                    //select the prev slide
                    var prevSlide = dojo.query(".draw_page", slideElemWrapperPrevSibling);
                    if(prevSlide.length>0){
                    	setTimeout(dojo.hitch(this, this.simulateSlideClick, prevSlide[0]), 100);
//                        this.simulateSlideClick(prevSlide[0]);
                    }

                }else if(isDeleteAllSlides == true) { //if deleting all the slides, we spare the first slide and select it
                	setTimeout(dojo.hitch(this, this.simulateSlideClick, this.slides[0]), 100);
//                    this.simulateSlideClick(this.slides[0]);
                }
            //}
            //notification wangxum@cn.ibm.com
            this.getNotifyTool().addDeletedSlidesNotifyMsg(msg);

        }else if(isDeleteAllSlides == true) { //if deleting all the slides, we spare the first slide and select it
            this.simulateSlideClick(this.slides[0]);
        }
    },
    //
    // Open message dialog
    //
    openDeleteSlidesHasTaskDialog: function(id){
        var tmStamp = new Date().getTime();
        var widgetId= "P_d_DeleteSlideHasTaskMessage";
        var contentId = "P_d_DeleteSlideHasTaskMessage_MainDiv";
        var height = "220";
        var width = "400";
        var top = (document.body.offsetHeight/2)-100;
        var left = (document.body.offsetWidth/2)-200;

        this.lockTaskMessageDialog = new concord.widgets.presentationDialog({
            'id': widgetId,
            'title': this.STRINGS.deleteSlides,
            'content': "<div id='"+contentId+"' style='padding:15px;'> </div>",
            'presDialogHeight': (dojo.isIE)? height :height,
            'presDialogWidth' : width,
            'presDialogTop'   : top,
            'presDialogLeft'  : left,
            'heightUnit':'px',
            'presModal': true,
            'destroyOnClose':true,
            'presDialogButtons' : [{'label':this.STRINGS.ok,'action':dojo.hitch(this,function(){})}]
          });
          this.lockTaskMessageDialog.startup();
          this.lockTaskMessageDialog.show();
          this.lockTaskMessageDialogContent(id,widgetId,contentId);

    },

    //
    // Creates message for lock message dialog content
    //
    lockTaskMessageDialogContent:function(id,widgetId,contentId){
        var dialogContentDiv = dojo.byId(contentId);
        //var users = (userList) ? userList : this.scene.getUsersSlideNodeLock(id);

        var contentStringArray = new Array();
        contentStringArray.push("<p><b>"+this.STRINGS.task.slideToBeDeletedHasTask1+"</b></p><br>");
        contentStringArray.push("<p><b>"+this.STRINGS.task.slideToBeDeletedHasTask2+"</b></p>");
        /*
        contentStringArray.push("<ol>");
        for (var i=0; i<users.length; i++){
            var user = null;
            if(users[i].id!=null){
                user = ProfilePool.getUserProfile(users[i].id).e;
            }else{
                user = ProfilePool.getUserProfile(users[i]).e;
            }
            contentStringArray.push("<li>"+user.disp_name+"&nbsp; &nbsp; "+this.STRINGS.contentLockemail+": <i>"+user.email + "</i></li>");
        }
        contentStringArray.push("</ol>");
        */
        var contentString = contentStringArray.join("");
        dialogContentDiv.innerHTML = contentString;
    },

    isMultiSlidesHaveLockedSlide:function(slideArray){
        var hasLockedSlide = false;
        if(slideArray == null){
            slideArray = this.multiSelectedSlides;
        }
        for(var i=0; i < slideArray.length; i++){
            var _ss = slideArray[i];
            if (this.isSlideLocked(_ss.parentNode)){
                hasLockedSlide = true;
                break;
            }
        }
        return hasLockedSlide;

    },
    
    isSlideSelected: function(slideElem) {
        if (this.multiSelectedSlides!=null && this.multiSelectedSlides.length>0 && slideElem !=null) {
            for (var i=0; i < this.multiSelectedSlides.length; ++i) {
                if (slideElem.id == this.multiSelectedSlides[i].id) {
                    return true;
                }
            }

        }
        return false;

    },

    //set slide elements id with new UUID
    setSlideId:function(slideElem) {
        if (slideElem != null) {
            concord.util.HtmlContent.injectRdomIdsForElement(slideElem);
            slideElem.id = 'slide_'+slideElem.id; // JMT D40996
            //set ids for all children elements
            var children = slideElem.getElementsByTagName('*');
            for(var i =0; i<children.length; i++){
                //we now need to generate id for span (D47366)
                //if(children[i].tagName != "span" && children[i].tagName != "SPAN"){
                // skip BRs
                if ( children[i].tagName.toLowerCase() != "br" ) {
                    concord.util.HtmlContent.injectRdomIdsForElement( children[i] );
                }
            }
            
            // update id/ref for SVG shape, after all the id changed
            var svgNodes = slideElem.getElementsByTagName('svg');
            for (var j=0; j < svgNodes.length; ++j) {
            	concord.util.HtmlContent.checkIdRefForSVGElement(svgNodes[j]);
            }  // end for
        }
    },

    //remove attributes that should not be copied
    removeNewSlideAttributes: function (newSlide){
        var removeAttributes=new Array("commentsId","comments","smil_type","smil_subtype","smil_direction","presentation_transition-speed","smil_fadeColor","presentation_duration");

        for (var i=0; i<removeAttributes.length; i++) {
        dojo.removeAttr(newSlide, removeAttributes[i]);
        }

        return newSlide;
    },

    //Check the footer positions and make sure there is enough padding between footers and outline
    adjustOutlineHeightForFooters: function(outlineNode,drawFrameNodes,outlineHeight, outlineTop) {
        var olHeight = null;
        var olTop = null;
        if(outlineHeight) {
            olHeight = parseFloat(outlineHeight);
        } else if(outlineNode) {
            olHeight = parseFloat(outlineNode.style.height);
        } else
            return null;

        if(outlineTop) {
            olTop = parseFloat(outlineTop);
        } else if(outlineNode) {
            olTop = parseFloat(outlineNode.style.top);
        } else
            return outlineHeight;

        var olBorder = olHeight + olTop;
        var fTop = null;
        for(var adj=0; adj<drawFrameNodes.length ; adj++){
            if(drawFrameNodes[adj].getAttribute !=null && (dojo.hasClass(drawFrameNodes[adj].parentNode,"draw_page") ||
                                                           dojo.hasClass(drawFrameNodes[adj].parentNode,"style_master-page"))) {
                var tTop = parseFloat(drawFrameNodes[adj].style.top);
                var tPresC = drawFrameNodes[adj].getAttribute("presentation_class");
                if(tPresC == "footer" || tPresC == "date-time" || tPresC == "page-number") {
                    if(fTop == null) {
                        fTop = tTop;
                    } else {
                        if(fTop < tTop)
                            fTop = tTop;
                    }
                }
            }
        }

        if(fTop != null) {
            var padding = fTop - olBorder;
            if(padding < 3.2) {
                olHeight = (fTop - 3.2) - olTop;
                if(outlineNode)
                    outlineNode.style.height = olHeight+"%";
            }
        }

        return olHeight + "%";
    },
    
    //Get a content master page (which has title and outline)
    //from all master pages
    _getContentMasterPage:function(slideElemClicked,_masterHtmlDiv)
    {
    	function _IsContentMasterPage(masterPage)
    	{
    		var titles 
    		= dojo.query(".draw_frame[presentation_class='title'][presentation_placeholder='true']", masterPage.$);
    		var outlines 
    		= dojo.query(".draw_frame[presentation_class='outline'][presentation_placeholder='true']", masterPage.$);
    		if(titles.length==1 && (outlines.length>=1))
    			return true;
    		return false;
    	}
    	
    	var masterPageName = slideElemClicked.getAttribute("draw_master-page-name");
    	var presPageLayoutName = slideElemClicked.getAttribute("presentation_presentation-page-layout-name");

    	//current page is title or unsupported layout
    	if(!this.isSupportedLayout(presPageLayoutName)
    		|| presPageLayoutName == "ALT0")
    	{
    		var slideWrapper = PresCKUtil.ChangeToCKNode(slideElemClicked).getParent();
    		while(slideWrapper)
    		{
    			var slide = dojo.query('.draw_page',slideWrapper.$)[0];
    			slide = PresCKUtil.ChangeToCKNode(slide);
    			var layout = slide.getAttribute("presentation_presentation-page-layout-name");
    			if(layout != "ALT0")
    			{
    				var mPageName = slide.getAttribute("draw_master-page-name");
    				var masterPage = PresCKUtil.ChangeToCKNode(document.getElementById(mPageName));
    	    		if(_IsContentMasterPage(masterPage))
    	    			return masterPage;
    			}
    			slideWrapper = slideWrapper.getNext();
    		}
    	}
    	else //supported not title layout, return current master
    	{
        	// if not find right master page, we return click page's master page
    		var masterPage = PresCKUtil.ChangeToCKNode(document.getElementById(masterPageName));
       			return masterPage;
    	}
    	
    	//For other case, search first content master page
    	var masterHtmlDiv = PresCKUtil.ChangeToCKNode(_masterHtmlDiv);
    	var masterPageList = dojo.query(".style_master-page",masterHtmlDiv.$);
    	for(var i=0;i<masterPageList.length;i++)
    	{
    		var masterPage = PresCKUtil.ChangeToCKNode(masterPageList[i]);
    		if(_IsContentMasterPage(masterPage))
    			return masterPage;
    	}
    	
    	//Could not find
    	return null;
    	
    },
    
    _postProcessAfterCreatePage:function(newSlide,slideElemClicked,isToIgnoreCtrlKey,isForPasteFromExtPres)
    {
        //update slide numbers
        //make sure that if the slide was added by insert we copy the footer fields from the clickedSlide
        newSlide = this.updateHeaderFooterFields(newSlide, slideElemClicked, true);//TODO    
        //update the classes of draw_page also to use master class
        this.updateSlideClassToUseMasterClass(newSlide);//TODO

        //set new id
        this.setSlideId(newSlide);
        newSlide.id = newSlide.id;
        //create wrapper for the slide
        this.createSlideWrappers(newSlide);

        //add the new slide after slideElemClicked
        this.insertSlideAfter(newSlide.parentNode,slideElemClicked.parentNode);

        //check if we need to create background image div from css
        //this.checkNcreateBackgroundImageDivFromCss(newSlide, null, null);

        //prepare new slide connect all events
        this.prepareNewSlide(newSlide);

        //refresh this.slides
//        this.refreshSlidesObject();
//        this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);
        this.refreshPlaceHolder(newSlide,true);
        PresCKUtil.copyAllFirstSpanStyleToILBefore(newSlide);
        //co-editing
        var newSlideWrapper = newSlide.parentNode;
        if (!isForPasteFromExtPres)
        	this.coeditingSendMsgForInsertSlide(newSlideWrapper);
        //create the slideUtil div
        var slideArray = [];
        slideArray.push(newSlide);
        this.createSlideUtilDiv(slideArray);

        //select the new slide
        this.simulateSlideClick(newSlide, isToIgnoreCtrlKey);

        this.getNotifyTool().addInsertedSlidesNotifyMsg(newSlide);

        //add to the contentObject
        this.addSlideToContentObj(newSlide);
        this.addBrowserClassToWrapper( newSlide );   
    },
	
	//this function is to build content fot this placeholder textbox according presPageLayoutName
	//Same function reference addPlaceHolderContent //TODO
	_constructDefaultPalceholder:function(divDrawFrame,presClass,layoutName,bOnlyRemoveText)
	{		      
		function _buildContentForPlaceholder(divPlaceholder)
		{
	        if(presClass == "title"){
	            var titleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS+'"><span>this.STRINGS.layout_clickToAddTitle</span><br class="hideInIE"></p>';
	            divPlaceholder.innerHTML = titleHtml ;
	        }
	        else if(presClass == "subtitle"){
	            var subtitleHTML="";
	            if(layoutName == "ALT32"){ //centered text but using presentationClass "subtitle"
	                subtitleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_OUTLINE_CLASS+ ' centerTextAlign"><span>this.STRINGS.layout_clickToAddText2</span><br class="hideInIE"></p>';
	                //this.STRINGS.layout_clickToAddText currently says" double click to add subtitle", we need to add new nls string to say:"double click to add text" for centered text layout
	                //drawFrameClassDiv.style.verticalAlign = "middle";
	                dojo.addClass(divPlaceholder, "centerVerticalAlign");
	            }else{
	                subtitleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS+'"><span>this.STRINGS.layout_clickToAddText</span><br class="hideInIE"></p>';
	            }
	            if(layoutName == "ALT0")//title,subtile
	            {
	            	dojo.style(divPlaceholder,'color','#8B8B8B');
	            	dojo.addClass(divPlaceholder, "centerTextAlign");
	            	dojo.addClass(divPlaceholder, "centerVerticalAlign");
	            }
	            divPlaceholder.innerHTML = subtitleHtml;
	        }
	        else if(presClass == "outline"){
	        	var rtlStyle = (layoutName && layoutName.indexOf("-RTL") != -1) ? 'style="direction: rtl;text-align:right"' : '';
	        	var outlineHtmlStr = '<ul class="text_list" odf_element="text:list"><li ' + rtlStyle + ' class="text_list-item defaultContentText ' + PresConstants.CONTENT_BOX_OUTLINE_CLASS + '"><span>this.STRINGS.layout_clickToAddOutline</span><br class="hideInIE"></li></ul>';
	        	divPlaceholder.innerHTML =outlineHtmlStr ;
	        }
	        else if(presClass == "graphic"){
	            var imgHtmlStr = '<img src="'+window.contextPath + window.staticRootPath + '/images/imgPlaceholder.png" class="defaultContentImage" style="position: absolute; left: 39%; top: 39%; height: 25%; width: 25%;" alt="">';
	            var textStr = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_GRAPHIC_CLASS+'"><span>this.STRINGS.layout_clickToAddText</span><br class="hideInIE"></p>';
	            var contentHtmlStr = '<div style="position: absolute; top: 5%; width: 100%; text-align:center;">'+textStr+'</div>';

	            divPlaceholder.innerHTML = imgHtmlStr + contentHtmlStr;
	        }
	        else if(presClass == "page-number"
	        	||presClass == "date-time" 
	        	||presClass == "footer"
	        	||presClass == "header")
	        {
	        	//Nothing todo
	        	
	        }
	        else {
	        	divPlaceholder.innerHTML = "";
	        }
		};


		//Return the drawframe node
		function _buildPlaceholderDiv(placeHolderContent,_frameClassesArray)
		{			
			if(presClass == 'graphic')
			{
				var children = dojo.query("*", placeHolderContent);
		        for(var x=0; x<children.length; x++){
		            dojo.destroy(children[x]);
		        }
				var vGraphicDiv = document.createElement("div");
				vGraphicDiv.className ="imgContainer layoutClassSS";
				_buildContentForPlaceholder(vGraphicDiv);
				placeHolderContent.appendChild(vGraphicDiv);
			}
			else
			{
				dojo.addClass(placeHolderContent, "layoutClassSS");
		        //clean the text box, remove existing children of the text box if any
				if(bOnlyRemoveText)
				{
					var divDisplayTableCell = dojo.query(".draw_frame_classes", placeHolderContent)[0];
					var children = dojo.query("*", divDisplayTableCell);
			        for(var x=0; x<children.length; x++){
			            dojo.destroy(children[x]);
			        }
			        _buildContentForPlaceholder(divDisplayTableCell);
				}
				else
				{
			        var children = dojo.query("*", placeHolderContent);
			        for(var x=0; x<children.length; x++){
			            dojo.destroy(children[x]);
			        }
			        dojo.addClass(placeHolderContent, "layoutClassSS");
			        placeHolderContent.style.height = "100%";
			        placeHolderContent.style.width = "100%";
			        dijit.setWaiRole(placeHolderContent,'textbox');
			        if(presClass == 'title' || presClass == 'subtitle')
			        	dijit.setWaiState(placeHolderContent, 'labelledby', 'P_arialabel_Textbox');
			        var divDisplayTable = document.createElement("div");
			        divDisplayTable.style.display = "table";
			        divDisplayTable.style.height = "100%";
			        divDisplayTable.style.width = "100%";
			        dijit.setWaiRole(divDisplayTable,'presentation');
			        dojo.attr(divDisplayTable, "tabindex", "0");
		
			        var divDisplayTableCell = document.createElement("div");
			        divDisplayTableCell.style.display = "table-cell";
			        divDisplayTableCell.style.height = "100%";
			        divDisplayTableCell.style.width = "100%";
			        dijit.setWaiRole(divDisplayTableCell,'presentation');
			        dojo.addClass(divDisplayTableCell, "draw_frame_classes ");
			        //remove class from frame level to displayTableCell level div
			        for(var i=0; i< _frameClassesArray.length; i++){
			            if(_frameClassesArray[i]!="draw_frame" && _frameClassesArray[i]!="layoutClass"){
			                dojo.addClass(divDisplayTableCell, _frameClassesArray[i]);
			            }
			        }
			        _buildContentForPlaceholder(divDisplayTableCell);
			        divDisplayTable.appendChild(divDisplayTableCell);
			        placeHolderContent.appendChild(divDisplayTable);
				}
		        if(presClass == "page-number"
		        	||presClass == "date-time" 
		        	||presClass == "footer"
		        	||presClass == "header")
		        	{
		                var frameClassesStr = divDrawFrame.$.className;
		                var frameClassesArray = frameClassesStr.split(" ");
		                for(var i=0; i< frameClassesArray.length; i++){
		                    if(frameClassesArray[i]!="draw_frame" ){
		                        dojo.removeClass(divDrawFrame.$, frameClassesArray[i]);
		                    }
		                }
		                //set frame to hidden for now, currently not supported
		                divDrawFrame.$.style.visibility = "hidden";
		        	}
		        divDrawFrame.$.appendChild(placeHolderContent);
			}
		}; 
		
		//==============

        //remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
        var frameClassesStr = divDrawFrame.$.className;
        var frameClassesArray = frameClassesStr.split(" ");
        for(var i=0; i< frameClassesArray.length; i++){
            if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                dojo.removeClass(divDrawFrame.$, frameClassesArray[i]);
            }
        }
        
        if((divDrawFrame.$.children!=null) && (divDrawFrame.$.children.length >0))
        {
            for (var y=0; y<divDrawFrame.$.children.length; y++){
            	_buildPlaceholderDiv(divDrawFrame.$.children[y],frameClassesArray);
            } 
        }
        else if(presClass == 'graphic')
        {
        	_buildPlaceholderDiv(divDrawFrame.$,frameClassesArray);
        }
	},
	

    //create a new slide after the argument
    //@param isToIgnoreCtrlKey, for the case from ctrl+v, in ie when we do simulate slideclick, ctrl key still sticks, needs to flag it to ignore it.
    createSlide:function (slideElemClicked, isToIgnoreCtrlKey, isForPasteFromExtPres){
        if(slideElemClicked ==null)
        	return;

        if(this.officePrezDiv!=null){
            var allSlides = dojo.query('.draw_page',this.officePrezDiv);
	        if(allSlides != null && allSlides.length >= this.maxSlideNum){
	        	this.showSlideNumCheckMsg();
	        	return;
	        }
        }
        if(this.officePrezDiv == slideElemClicked){
        	slideElemClicked = this.selectedSlide;
        }
        
        var newSlide = slideElemClicked.cloneNode(true);
        newSlide = this.removeNewSlideAttributes(newSlide);
        var tfontsize = newSlide.style.fontSize;
        var theight = newSlide.style.height;          
        dojo.removeAttr(newSlide, 'style');
        //29438: [Regression]New slide can't follow slide's portrait page orientation in slide sorter in sample file
        if(tfontsize && tfontsize.length > 0){
			dojo.style(newSlide,'fontSize',tfontsize);
		}
        if(theight && theight.length > 0){
			dojo.style(newSlide,'height',theight);
		}
        //D36581: Slide number in new slide lost after export
        // dojo.removeAttr(newSlide,'draw_style-name');
        
        var masterPageName = newSlide.getAttribute("draw_master-page-name");
        var masterHtmlDiv = PresCKUtil.ChangeToCKNode(document.getElementById(this.masterHtmlDivId));
        var layoutHtmlDiv = PresCKUtil.ChangeToCKNode(document.getElementById(this.layoutHtmlDivId));
        var masterPageContent = PresCKUtil.ChangeToCKNode(document.getElementById(masterPageName));
        var bCloneEmptySlide = false;
        if(masterHtmlDiv == null || layoutHtmlDiv == null || masterPageContent==null)
        {
        	bCloneEmptySlide = true;
        }
        //Update the layout for new page,default we should use "ALT1", which means it is a "Title-outline" layout
        var presPageLayoutName = newSlide.getAttribute("presentation_presentation-page-layout-name");

        if(presPageLayoutName == "ALT0")
        {
            presPageLayoutName = "ALT1";
            dojo.attr(newSlide, "presentation_presentation-page-layout-name", "ALT1");
            //Get a content master page (which has title and outline)
            var properContentMasterPage = this._getContentMasterPage(slideElemClicked,masterHtmlDiv);
            if(properContentMasterPage)
            {
            	masterPageContent = properContentMasterPage;
                masterPageName = masterPageContent.getAttribute('id');
                newSlide.setAttribute("draw_master-page-name", masterPageName );
            }
        }
      
              
        //Set background image===============================================================
        if(!bCloneEmptySlide)
        {
    		//remove all child
    	    newSlide = newSlide.cloneNode(false);
    	  
    	    var children = masterPageContent.getChildren();
            for(var i=0;i<children.count();i++)
            {
          	    var child = children.getItem(i);
          	    if(child.hasClass && child.hasClass("draw_frame") && child.hasClass("backgroundImage"))
          	    {
          		    var bgImageNode = child.clone(true);
                    bgImageNode.$.className = "draw_frame  backgroundImage";
                    var classNameTemp1 = dojo.trim(child.$.className);
                    var classNameTempArray1 = classNameTemp1.split(" ");
                    if(classNameTempArray1!=null){
                      for(var p=0; p<classNameTempArray1.length; p++){
                          if(classNameTempArray1[p]!="draw_frame" 
                          	&& (classNameTempArray1[p].indexOf("draw_") ==0 || classNameTempArray1[p]== "importedImage")){
                               dojo.addClass(bgImageNode.$,classNameTempArray1[p]);
                          }
                      }
                    }
                    classNameTempArray1=null;

                    //append file name on the image src url
                    //adding file parameter for defect #48341, where browser caches the image by a file currently opened,
                    //but when the same image used in a new file, browser doesn't get it from server again, and fail to load
                    var imgElems = dojo.query("img", bgImageNode.$);
                    for(var l=0; l<imgElems.length; l++){
                      var src1 = dojo.attr(imgElems[l], "src1");
                      if(!src1){
                          src1 =  dojo.attr(imgElems[l], "src");
                      }
                      var src2 = src1+"?file="+this.presBean.getUri();
                      dojo.attr(imgElems[l],"src", src2);
                    }
                    newSlide.appendChild(bgImageNode.$);
          	   }
            }
        }
        else // clone empty placeholder slide
        {
    		dojo.query(".draw_frame",newSlide).forEach(function(node) {
    			if(dojo.hasClass(node,'regard_as_master_obj'
    				||((dojo.attr( node, 'draw_layer') != 'backgroundobjects')
    				  &&(dojo.attr( node, 'draw_layer') != 'backgroundImage')))
    				)
                  dojo.destroy(node);
            });
        }
        
        if (!isForPasteFromExtPres) {
        	//we get the placeholder object from the master
            var placeholders = dojo.query(".draw_frame[presentation_placeholder='true']", bCloneEmptySlide?slideElemClicked:masterPageContent.$);
        	for(var i=0; i<placeholders.length; i++){
        		var plhlder = PresCKUtil.ChangeToCKNode(placeholders[i]);
        		var pressClass = plhlder.getAttribute('presentation_class');
        		if(this.isSupportedPlaceholderClass(pressClass))
        		{
            		var divDrawFrame = plhlder.clone(true);
           		 	divDrawFrame.addClass("layoutClass");
           		 	//update z-index=========
                    var tmpZ = window.pe.scene.slideEditor.maxZindex;
                    if (tmpZ <= 0) tmpZ = 500;	// start from 500 so we have enough room to handle multiple sendtoback
                    tmpZ = parseInt(tmpZ)+5;
                    divDrawFrame.setStyle('zIndex',tmpZ);
                    window.pe.scene.slideEditor.maxZindex = tmpZ;
                    
                    divDrawFrame.setAttribute('draw_layer','layout');
                    this._constructDefaultPalceholder(divDrawFrame,pressClass,presPageLayoutName,bCloneEmptySlide);
                    newSlide.appendChild(divDrawFrame.$);
        		}
        	}
        	
        	var IsDocsLayout = newSlide.getAttribute('docs_layout');
        	if(IsDocsLayout == 'true')
        	{
            	//if the layout is our support layout
            	//we should apply the layout
            	var resultArray = this.getLayoutResultArray(presPageLayoutName);
            	if(resultArray.length || (presPageLayoutName == "blank"))
            		this.applyLayoutToSlide(resultArray, newSlide);
        	}
        }
        
        //make sure if the slide was added by insert new slide that it has default text
        var speakerNotesNode = dojo.query('[presentation_class = "notes"]', newSlide)[0];
        if (speakerNotesNode == undefined) {
            var previousNotes = dojo.query('[presentation_class = "notes"]', slideElemClicked)[0];
            if (previousNotes != undefined) {
                var speakerNotesNode = previousNotes.cloneNode(true);
                var nodeToAdjust = null;
                dojo.query(".draw_text-box",speakerNotesNode).forEach(function(node, index, arr){
                    if (dojo.attr(node.parentNode,"presentation_class") == "notes") {
                        nodeToAdjust = node;
                    }
                });
                nodeToAdjust = dojo.query(".draw_frame_classes", nodeToAdjust)[0];
                nodeToAdjust.innerHTML = '<p class="defaultContentText cb_notes"><span>'+this.STRINGS.layout_clickToAddSpeakerNotes+'</span></p>';
                dojo.addClass(nodeToAdjust.parentNode.parentNode, "layoutClassSS");
                dojo.style(nodeToAdjust.parentNode.parentNode, "border","0px solid");
                dojo.addClass(nodeToAdjust.parentNode.parentNode.parentNode, "layoutClass");
                newSlide.appendChild(speakerNotesNode);
            }
        }
        this._postProcessAfterCreatePage(newSlide, slideElemClicked, isToIgnoreCtrlKey,isForPasteFromExtPres);
        return newSlide;
    },

    applyDojoDND: function(newSlide){
        //apply dojo DND
        dojo.addClass(newSlide.parentNode,'dojoDndItem');
        this.slideSorterDndSource.sync();
    },
 
    prepareNewSlide: function(newSlide){
        if(newSlide!=null){
            dojo.withDoc(this.editor.document.$, dojo.hitch(this, this.applyDojoDND, newSlide));

            //remove selected slide style if any
            this.deselectSlide(newSlide);
            //connect events
            this.connectEvents(newSlide);
            
            // added for mobile
            this.setTransformForMobile(newSlide);
        }

    },
    
    coeditingMsgActsForMultiBoxAttributeChange: function(data,attrObj,msgActs){
        msgActs =(msgActs==null)? []: msgActs;
        if(data!=null && data.attributeName!=null){
            var act = null;
            if ((data.flag) && (data.flag=="Resizing" || data.flag =="ResizingEnd")){
                act = SYNCMSG.createAttributeActForResizing(data.id, attrObj.newAttrValue, attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue,data.flag);
            } else {
                act = SYNCMSG.createAttributeAct(data.id, attrObj.newAttrValue, attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue,data.flag);
            }
            //D14496 Let's filter content
            if (act.act.s){
            	act.act.s = SYNCMSG.filterStyleProperties(act.act.s);
            	act.rAct.s = SYNCMSG.filterStyleProperties(act.rAct.s);
            }
            msgActs.push(act);
        }
        return msgActs;
    },

    // JMT - coeditfix
    coeditingSendMsgForAttributeChange:function(data,attrObj){
        if(data!=null && data.id !=null && data.attributeName!=null){
            //co-edit, send the change and command to other user if any
            //console.log('oldStyleValue :'+attrObj.oldStyleValue,'\nnewStyleValue:'+attrObj.newStyleValue);
            var act = null;
            if ((data.flag) && (data.flag=="Resizing" || data.flag =="ResizingEnd")){
                act = SYNCMSG.createAttributeActForResizing(data.id, attrObj.newAttrValue, attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue,data.flag);

            } else {
                 // jmt fix for D45841
                 var newAttrs={};
                 var oldAttrs={};
                 newAttrs[data.attributeName] = attrObj.newAttrValue;
                 oldAttrs[data.attributeName] = attrObj.oldAttrValue;
                act = SYNCMSG.createAttributeAct(data.id, newAttrs, attrObj.newStyleValue,oldAttrs, attrObj.oldStyleValue,data.flag);
            }
            
            // Merge margin actions together with resize action if data has
            var mergedActs = data.marginMsgActs ? data.marginMsgActs : [];
            mergedActs.push(act);
            
            var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, mergedActs);
            if (typeof data.addToUndo!=undefined && data.addToUndo!=null){
                msgPair = SYNCMSG.addUndoFlag(msgPair,data.addToUndo);
            }
            var msgPairsList = [];
            //D14496 Let's filter content
            var actCount = msgPair.msg.updates.length;
            for (var i = 0; i < actCount; i++) {
                if (msgPair.msg.updates[i].s){
                    msgPair.msg.updates[i].s = SYNCMSG.filterStyleProperties(msgPair.msg.updates[i].s);
                    msgPair.rMsg.updates[i].s = SYNCMSG.filterStyleProperties(msgPair.rMsg.updates[i].s);
                }
            }
            msgPairsList.push(msgPair);
            if(data.sendCoeditMsg)
                SYNCMSG.sendMessage(msgPairsList, SYNCMSG.SYNC_SORTER);
            else { //jmt - need to verify that we can delete this else stmt
                var elem = this.editor.document.getById(data.id);
                //D42851: Z-order is not correct in slide sorter after sent new textbox/Shape  to back
                //MSGUTIL.setStyles function styles will be a object.
                if(typeof(data.attributeValue) == 'string'){
                	var styles = PresCKUtil.getDrawFrameStyle(data.attributeValue);
                	MSGUTIL.setStyles(elem, styles);
                } else {
                	MSGUTIL.setStyles(elem, data.attributeValue);
                }
                //elem.setAttribute(data.attributeName,data.attributeValue); // Handles style and class attributes for IE and FF
                //we can not cover all style info by setAttribute, but
                //we should update value for those existed item, or some
                //fixed info will lost, for defect 21721
                elem = null;
            }

        }
    },

    // jmt - coeditfix
    coeditingSendMsgForInsertSlide:function(newSlideWrapper){
        if(newSlideWrapper !=null && newSlideWrapper.id !=null){
            var msgPairs = SYNCMSG.createInsertNodeMsgPair(newSlideWrapper);
            
			if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
				msgPairs[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
				msgPairs[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
				pe.scene.slideSorter.postListCssStyleMSGList = null;
				pe.scene.slideSorter.preListCssStyleMSGList = null;
			}
			
            SYNCMSG.sendMessage(msgPairs, SYNCMSG.NO_LOCAL_SYNC);
        }
    },

    //jmt - coeditfix
    coeditingSendMsgForDeleteSlide:function(slideWrapperToDeleteId){
        if(slideWrapperToDeleteId !=null){
            var elem = this.editor.document.getById(slideWrapperToDeleteId);
            var msgPairs =SYNCMSG.createDeleteNodeMsgPair(elem);
            SYNCMSG.sendMessage(msgPairs, SYNCMSG.NO_LOCAL_SYNC);
        }
    },

    // jmt - coeditfix
    coeditingSendMsgForInsertFrame:function(newFrame,data){
        if(newFrame !=null && newFrame.id !=null){
            var singleCKMode = window.pe.scene.slideEditor.SINGLE_CK_MODE;
            var tmpRemoveNewBox = false;
            if (data.park && singleCKMode && dojo.hasClass(newFrame,'newBox')){
                dojo.removeClass(newFrame,'newBox');  //remove newBox class so that we do not capture in undo message in singleCKMode
                tmpRemoveNewBox = true;
            }
            var msgPairs = SYNCMSG.createInsertNodeMsgPair(newFrame);

            if (tmpRemoveNewBox){
                dojo.addClass(newFrame,'newBox');  //Restor newBox class
            }

            //let's check undo flag
            if (typeof data.addToUndo !=undefined  && data.addToUndo!=null){
                msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],data.addToUndo);
            }

            //let's check if this is a message from new text box that needs to be parked.
            if (typeof data.park !=undefined  && data.park!=null){
                if (data.park){
                    var editor = CKEDITOR.instances[data.editorName];
                    if (typeof editor.parkedMsgPairList== undefined ||editor.parkedMsgPairList==null ){
                        editor.parkedMsgPairList=[];
                    }
                    for (var i=0; i<msgPairs.length;i++){
                        editor.parkedMsgPairList.push(dojo.clone(msgPairs[i])); //We need to merge the parked list
                    }
                }
            }
            if(pe.scene.slideSorter.bInsertInternalListForPView){
            	//from slideEidor, while paste inernal list in ViewMode 
            	PresCKUtil.doUpdateListStyleSheet();
            	if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
            		msgPairs[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
            		msgPairs[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
            		pe.scene.slideSorter.postListCssStyleMSGList = null;
            		pe.scene.slideSorter.preListCssStyleMSGList = null;
            	}
            	delete pe.scene.slideSorter.bInsertInternalListForPView;
            }
            SYNCMSG.sendMessage(msgPairs, SYNCMSG.NO_LOCAL_SYNC);
        }
    },
    // jmt - coeditfix
    coeditingSendMsgForDeleteFrame:function(frameToDeleteId,data){
        if(frameToDeleteId !=null){
            var elem = this.editor.document.getById(frameToDeleteId);
            var msgPairs =SYNCMSG.createDeleteNodeMsgPair(elem);

            //let's check undo flag
            if (typeof data.addToUndo !=undefined  && data.addToUndo!=null){
                msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],data.addToUndo);
            }
            
            var msg = msgPairs[0].msg;
            var rMsg = msgPairs[0].rMsg;
            msg.elemId = frameToDeleteId;
            rMsg.elemId = frameToDeleteId; 
            
        	PresCKUtil.deleteILBeforeStyles(elem);
        	if(!concord.util.browser.isMobile())
        		PresCKUtil.doUpdateListStyleSheet();
            if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
            	msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
            	rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
				pe.scene.slideSorter.postListCssStyleMSGList = null;
				pe.scene.slideSorter.preListCssStyleMSGList = null;
			}
        	
            SYNCMSG.sendMessage(msgPairs, SYNCMSG.NO_LOCAL_SYNC);
        //PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
        }
    },

    // jmt - coeditfix
    coeditingSendMsgForLayoutApplied:function(slideId, msgPairsList){
        if(msgPairsList == null){
            msgPairsList = [];
        }
        if(slideId !=null){
            //send co-edit message here
            var msg = SYNCMSG.createLayoutAppliedMsg(slideId);
            msgPairsList.push(msg);
            //SYNCMSG.sendMessage(msgPairsList, SYNCMSG.NO_LOCAL_SYNC);
        }
        return msgPairsList;
    },
    insertSlideAfter:function(slideWrapperToInsert, refSlideWrapper, isFromCreateSlide){
        //add the slideWrapperToInsert after refSlideWrapper
        if(slideWrapperToInsert!=null && refSlideWrapper!=null) {
            var refSlideParent = refSlideWrapper.parentNode;
            var refSlideNextSibling = refSlideWrapper.nextSibling;
            if(refSlideNextSibling!=null){
                    refSlideParent.insertBefore(slideWrapperToInsert,refSlideNextSibling);
            } else{
                    refSlideParent.appendChild(slideWrapperToInsert);
            }
        }
    },
    addPlaceHolderContentToDrawFrameClassDiv:function(drawFrameClassDiv, contentPresClass, layoutName){
        if(drawFrameClassDiv !=null) {
            if(contentPresClass == "title"){
                var titleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS+'"><span>'+this.STRINGS.layout_clickToAddTitle+'</span></p>';
                drawFrameClassDiv.innerHTML = titleHtml ;
            }
            else if(contentPresClass == "subtitle"){
                var subtitleHTML="";
                if(layoutName == "ALT32"){ //centered text but using presentationClass "subtitle"
                    subtitleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_OUTLINE_CLASS+ ' centerTextAlign"><span>'+this.STRINGS.layout_clickToAddText2+'</span></p>';
                    //this.STRINGS.layout_clickToAddText currently says" double click to add subtitle", we need to add new nls string to say:"double click to add text" for centered text layout
                    //drawFrameClassDiv.style.verticalAlign = "middle";
                    dojo.addClass(drawFrameClassDiv, "centerVerticalAlign");
                }else{
                    subtitleHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS+'"><span>'+this.STRINGS.layout_clickToAddText+'</span></p>';
                }
                drawFrameClassDiv.innerHTML = subtitleHtml;
            }
            else if(contentPresClass == "outline"){
                // Presentations
                // 4588 - Use correct class name for "circle" (default) bullet--"lst-c"
                // 1st, check if we're using custom list styles (via existence of defaultListStyles object)
            	var outlineHtmlStr = '<ul class="text_list" odf_element="text:list"><li class="text_list-item defaultContentText '+ PresConstants.CONTENT_BOX_OUTLINE_CLASS +'"><span>' + this.STRINGS.layout_clickToAddOutline + '</span></li></ul>';

                drawFrameClassDiv.innerHTML =outlineHtmlStr ;
            }
            else if(contentPresClass == "graphic"){
                var imgHtmlStr = '<img src="'+window.contextPath + window.staticRootPath + '/images/imgPlaceholder.png" class="defaultContentImage" style="position: absolute; left: 39%; top: 39%; height: 25%; width: 25%;" alt="">';
                var contentHtmlStr = '<div class="defaultContentText" style="position: absolute; top: 5%; width: 100%; text-align:center;">'+this.STRINGS.layout_doubleClickToAddGraphics+'</div>';

                drawFrameClassDiv.innerHTML = imgHtmlStr + contentHtmlStr;
            }
            else if(contentPresClass == ""){
                var textBoxHtml = '<p odf_element="text:p" class="defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS+'"><span>'+this.STRINGS.layout_clickToAddText+'</span></p>';
                drawFrameClassDiv.innerHTML = textBoxHtml;
            }
            else {
                drawFrameClassDiv.innerHTML = "";
            }
        }        
    },
    addPlaceHolderContent: function(contentContainerElem, contentPresClass, layoutName, masterPageClass) {
        if(contentPresClass!=null && contentContainerElem!=null){

            var placeHolderContent = null;
            //placeHolderContent.setAttribute("class","placeholder_content");
            //handle masterPageClass that has "_" prefix
            if(masterPageClass!=null && masterPageClass.length>0){
                if(masterPageClass.charAt(0)=="_"){
                    if(masterPageClass.length>1){
                        masterPageClass="u"+masterPageClass.substring(1);
                    }else{
                        masterPageClass="u";
                    }
                }
            }
            if(contentPresClass == "title"){
                if(masterPageClass!=null){
                    placeHolderContent = document.createElement("div");
                    placeHolderContent.className ="draw_text-box layoutClassSS";
                    placeHolderContent.style.height = "100%";
                    placeHolderContent.style.width = "100%";
                    dijit.setWaiRole(placeHolderContent,'textbox');
                    dijit.setWaiState(placeHolderContent, 'labelledby', 'P_arialabel_Textbox');
                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');
                    dojo.attr(divDisplayTable, "tabindex", "0");

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dijit.setWaiRole(divDisplayTableCell,'presentation');
                    dojo.addClass(divDisplayTableCell, "draw_frame_classes "+masterPageClass+"-"+contentPresClass);

                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    placeHolderContent.appendChild(divDisplayTable);
                    contentContainerElem.appendChild(placeHolderContent);
                }
                else{

                    //remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
                    var frameElem = contentContainerElem.parentNode;
                    var frameClassesStr = frameElem.className;
                    var frameClassesArray = frameClassesStr.split(" ");
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                            dojo.removeClass(frameElem, frameClassesArray[i]);
                        }
                    }
                    //clean the text box, remove existing children of the text box if any
                    var children = dojo.query("*", contentContainerElem);
                    for(var x=0; x<children.length; x++){
                        dojo.destroy(children[x]);
                    }
                    dojo.addClass(contentContainerElem, "layoutClassSS");
                    contentContainerElem.style.height = "100%";
                    contentContainerElem.style.width = "100%";
                    dijit.setWaiRole(contentContainerElem,'textbox');
                    dijit.setWaiState(contentContainerElem, 'labelledby', 'P_arialabel_Textbox');
                    dojo.attr(contentContainerElem, "tabindex", "0");

                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                    dijit.setWaiRole(divDisplayTableCell,'presentation');

                    //remove class from frame level to displayTableCell level div
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                            dojo.addClass(divDisplayTableCell, frameClassesArray[i]);
                        }
                    }
                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    contentContainerElem.appendChild(divDisplayTable);
                }

            }else if(contentPresClass == "subtitle"){
                if(masterPageClass!=null){
                    placeHolderContent = document.createElement("div");
                    placeHolderContent.className ="draw_text-box layoutClassSS";
                    placeHolderContent.style.height = "100%";
                    placeHolderContent.style.width = "100%";
                    dijit.setWaiRole(placeHolderContent,'textbox');
                    dijit.setWaiState(placeHolderContent, 'labelledby', 'P_arialabel_Textbox');
                    dojo.attr(placeHolderContent, "tabindex", "0");

                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dijit.setWaiRole(divDisplayTableCell,'presentation');
                    dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                    if(this.currMasterFrameStylesJSON!=null){
                        if(layoutName=="ALT32"){ //centered text but the presentationclass is subtitle
                            //to use outline text because the background we are using outline background.. sometimes subtitle text is white for title page background but in outline background becomes white on white,
                            //so it is safer to use outline text when using outline background
                            var masterOutlineClass = this.currMasterFrameStylesJSON.text_outline;
                            dojo.addClass(divDisplayTableCell, masterOutlineClass);
                        }else{
                            var masterSubtitleClass = this.currMasterFrameStylesJSON.subtitle;
                            dojo.addClass(divDisplayTableCell, masterSubtitleClass);
                            if(masterSubtitleClass == ""){ //#10413, sometimes we don't have subtitle frame in master from ppt, just use title definition then
                                var masterTitleClass = this.currMasterFrameStylesJSON.title;
                                dojo.addClass(divDisplayTableCell, masterTitleClass);
                            }
                        }
                    }

                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    placeHolderContent.appendChild(divDisplayTable);
                    contentContainerElem.appendChild(placeHolderContent);
                }else{
                    //remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
                    var frameElem = contentContainerElem.parentNode;
                    var frameClassesStr = frameElem.className;
                    var frameClassesArray = frameClassesStr.split(" ");
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                            dojo.removeClass(frameElem, frameClassesArray[i]);
                        }
                    }
                    //clean the text box, remove existing children of the text box if any
                    var children = dojo.query("*", contentContainerElem);
                    for(var x=0; x<children.length; x++){
                        dojo.destroy(children[x]);
                    }
                    dojo.addClass(contentContainerElem, "layoutClassSS");
                    contentContainerElem.style.height = "100%";
                    contentContainerElem.style.width = "100%";
                    dijit.setWaiRole(contentContainerElem,'textbox');
                    dijit.setWaiState(contentContainerElem, 'labelledby', 'P_arialabel_Textbox');
                    dojo.attr(contentContainerElem, "tabindex", "0");

                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dijit.setWaiRole(divDisplayTableCell,'presentation');
                    dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                    //remove class from frame level to displayTableCell level div
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                            dojo.addClass(divDisplayTableCell, frameClassesArray[i]);
                        }
                    }
                    if(this.currMasterFrameStylesJSON!=null){
                        if(layoutName=="ALT32"){ //centered text but the presentationclass is subtitle
                            //to use outline text because the background we are using outline background.. sometimes subtitle text is white for title page background but in outline background becomes white on white,
                            //so it is safer to use outline text when using outline background
                            var masterOutlineClass = this.currMasterFrameStylesJSON.text_outline;
                            dojo.addClass(divDisplayTableCell, masterOutlineClass);
                        }else{
                            var masterSubtitleClass = this.currMasterFrameStylesJSON.subtitle;
                            dojo.addClass(divDisplayTableCell, masterSubtitleClass);
                            if(dojo.trim(masterSubtitleClass) == ""){ //#10413, sometimes we don't have subtitle frame in master from ppt, just use title definition then
                                var masterTitleClass = this.currMasterFrameStylesJSON.title;
                                dojo.addClass(divDisplayTableCell, masterTitleClass);
                            }
                        }
                    }
                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    contentContainerElem.appendChild(divDisplayTable);

                }

            }else if(contentPresClass == "outline"){

                if(masterPageClass!=null){
                    placeHolderContent = document.createElement("div");
                    placeHolderContent.className ="draw_text-box layoutClassSS";
                    placeHolderContent.style.height = "100%";
                    placeHolderContent.style.width = "100%";
                    dijit.setWaiRole(placeHolderContent,'textbox');
                    dojo.attr(placeHolderContent, "tabindex", "0");

                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dijit.setWaiRole(divDisplayTableCell,'presentation');

                    dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                    if(this.currMasterFrameStylesJSON!=null){
                        var masterOutlineClass = this.currMasterFrameStylesJSON.text_outline;
                        dojo.addClass(divDisplayTableCell, masterOutlineClass);
                    }
                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    //contentContainerElem.appendChild(divDisplayTable);
                    placeHolderContent.appendChild(divDisplayTable);
                    contentContainerElem.appendChild(placeHolderContent);
                }else{
                    //remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
                    var frameElem = contentContainerElem.parentNode;
                    var frameClassesStr = frameElem.className;
                    var frameClassesArray = frameClassesStr.split(" ");
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame"  && frameClassesArray[i]!="layoutClass"){
                            dojo.removeClass(frameElem, frameClassesArray[i]);
                        }
                    }
                    //clean the text box, remove existing children of the text box if any
                    var children = dojo.query("*", contentContainerElem);
                    for(var x=0; x<children.length; x++){
                        dojo.destroy(children[x]);
                    }
                    dojo.addClass(contentContainerElem, "layoutClassSS");
                    contentContainerElem.style.height = "100%";
                    contentContainerElem.style.width = "100%";
                    dijit.setWaiRole(contentContainerElem,'textbox');
                    dojo.attr(contentContainerElem, "tabindex", "0");

                    var divDisplayTable = document.createElement("div");
                    divDisplayTable.style.display = "table";
                    divDisplayTable.style.height = "100%";
                    divDisplayTable.style.width = "100%";
                    dijit.setWaiRole(divDisplayTable,'presentation');

                    var divDisplayTableCell = document.createElement("div");
                    divDisplayTableCell.style.display = "table-cell";
                    divDisplayTableCell.style.height = "100%";
                    divDisplayTableCell.style.width = "100%";
                    dijit.setWaiRole(divDisplayTableCell,'presentation');
                    dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                    //remove class from frame level to displayTableCell level div
                    for(var i=0; i< frameClassesArray.length; i++){
                        if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                            dojo.addClass(divDisplayTableCell, frameClassesArray[i]);
                        }
                    }
                    this.addPlaceHolderContentToDrawFrameClassDiv(divDisplayTableCell, contentPresClass,layoutName);
                    divDisplayTable.appendChild(divDisplayTableCell);
                    contentContainerElem.appendChild(divDisplayTable);
                }
            }else if(contentPresClass == "graphic"){
                placeHolderContent = document.createElement("div");
                placeHolderContent.className ="imgContainer layoutClassSS";

                //use outline master class for default font style
                if(this.currMasterFrameStylesJSON!=null){
                    var masterOutlineClass = this.currMasterFrameStylesJSON.text_outline;
                    dojo.addClass(contentContainerElem, masterOutlineClass);
                }

                var defaultTextStyle = this.currMasterFrameStylesJSON.default_text;
                if(defaultTextStyle == null || defaultTextStyle==""){
                    defaultTextStyle = "standard";
                }
                if(masterPageClass!=null){
                    dojo.addClass(contentContainerElem, defaultTextStyle);
                }
                /*
                var imgHtmlStr = '<img src="'+window.contextPath + window.staticRootPath + '/images/imgPlaceholder.png" class="defaultContentImage" style="position: absolute; left: 39%; top: 39%; height: 25%; width: 25%;">';
                var contentHtmlStr = '<div class="defaultContentText" style="position: absolute; top: 5%; width: 100%; text-align:center;">'+this.STRINGS.layout_doubleClickToAddGraphics+'</div>';

                placeHolderContent.innerHTML = imgHtmlStr + contentHtmlStr;
                */
                this.addPlaceHolderContentToDrawFrameClassDiv(placeHolderContent, contentPresClass,layoutName);
                contentContainerElem.appendChild(placeHolderContent);
                //contentContainerElem.style.border= "2px solid rgb(232, 232, 232)" ;
            }else if(contentPresClass == "page-number"||contentPresClass == "date-time" ||contentPresClass == "footer"||contentPresClass == "header"){
                //remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
                var frameElem = contentContainerElem.parentNode;
                var frameClassesStr = frameElem.className;
                var frameClassesArray = frameClassesStr.split(" ");
                for(var i=0; i< frameClassesArray.length; i++){
                    if(frameClassesArray[i]!="draw_frame" ){
                        dojo.removeClass(frameElem, frameClassesArray[i]);
                    }
                }
                //set frame to hidden for now, currently not supported
                frameElem.style.visibility = "hidden";

                var divDisplayTable = document.createElement("div");
                divDisplayTable.style.display = "table";
                divDisplayTable.style.height = "100%";
                divDisplayTable.style.width = "100%";
                dijit.setWaiRole(divDisplayTable,'presentation');

                var divDisplayTableCell = document.createElement("div");
                divDisplayTableCell.style.display = "table-cell";
                divDisplayTableCell.style.height = "100%";
                divDisplayTableCell.style.width = "100%";
                dijit.setWaiRole(divDisplayTableCell,'presentation');
                dojo.addClass(divDisplayTableCell, "draw_frame_classes");
                //remove class from frame level to displayTableCell level div
                for(var i=0; i< frameClassesArray.length; i++){
                    if(frameClassesArray[i]!="draw_frame" && frameClassesArray[i]!="layoutClass"){
                        dojo.addClass(divDisplayTableCell, frameClassesArray[i]);
                    }
                }
                var contentContainerElemChildren = contentContainerElem.children;
                if(contentContainerElemChildren!=null){
                    for(var i=0; i< contentContainerElemChildren.length; i++){
                        divDisplayTableCell.appendChild(contentContainerElemChildren[i]);
                    }
                }
                divDisplayTable.appendChild(divDisplayTableCell);
                contentContainerElem.appendChild(divDisplayTable);
            }
            else{
                contentContainerElem.innerHTML = "";
            }
        }

    },

    guessTitlePageAndOutlinePageMasterUsed: function(masterHtmlDiv){
        var masterObj={};

        var titleMasterPageName = null;
        var outlineMasterPageName = null;

        //if there is presentation_layout_name in the slides, investigate what master is used by ALT0 (title page) and what master is used by ALT1 or others
        var titlePageSlides = dojo.query("[presentation_presentation-page-layout-name='ALT0']",this.editor.document.$);
        var outlinePageSlides = dojo.query("[presentation_presentation-page-layout-name='ALT1']",this.editor.document.$);
        //if outlinePageSlides not available, just use any of the slide that has presentation-page-layout-name attribute that is not ALT0.
        var otherPageSlides = dojo.query("[presentation_presentation-page-layout-name]",this.editor.document.$);
        var centeredPageSlides = dojo.query("[presentation_presentation-page-layout-name='ALT32']",this.editor.document.$);

        var subtitleDrawFrames = dojo.query(".draw_frame[presentation_class='subtitle']",this.editor.document.$);
        var outlineDrawFrames = dojo.query(".draw_frame[presentation_class='outline']",this.editor.document.$);

        //try find title page slide using Title only layout
        var titlePageSlides2 = dojo.query("[presentation_presentation-page-layout-name='ALT19']",this.editor.document.$);

        var outlineKeepGuessing = false;

        //get titleMasterPageName
        //try to inspect the slides first
        if(titlePageSlides.length>0){ //if there is a title page slide, just use the first one
            var titlePageSlide = titlePageSlides[0];
            titleMasterPageName = dojo.attr(titlePageSlide, "draw_master-page-name");
        }else if(subtitleDrawFrames.length>0){ //if there is presentation class subtitle, use this slide master page
            var titlePageSlide = subtitleDrawFrames[0].parentNode;
            //sometimes ALT32 (centered text) with drawframe subtitle is used for title page too, but we want to rule out this time, will consider later
            //we want to get the pure title page here so we get the intended subtitle for title page
            if(dojo.attr(titlePageSlide, "presentation_presentation-page-layout-name")!="ALT32"){
                titleMasterPageName = dojo.attr(titlePageSlide, "draw_master-page-name");
            }
        }else if(titlePageSlides2.length>0){ //if there is a title page slide with alt19, just use the first one
            var titlePageSlide = titlePageSlides2[0];
            titleMasterPageName = dojo.attr(titlePageSlide, "draw_master-page-name");
        }else if(centeredPageSlides.length>0){
            var titlePageSlide = centeredPageSlides[0];
            titleMasterPageName = dojo.attr(titlePageSlide, "draw_master-page-name");
        }
        else{ //if there is no clue
            //try use/asume the first slide as title slide if there is no presentation_presentation-page-layout-name attr
            //if it has presentation_presentation-page-layout-name attr meaning it is not title slide (and by this point) the presentation_presentation-page-layout-name attr must be NOT ALT0 or ALT19
            if(this.slides!=null && this.slides.length>0 && !dojo.hasAttr(this.slides[0], "presentation_presentation-page-layout-name")){
                    var titlePageSlide = this.slides[0];
                    titleMasterPageName = dojo.attr(titlePageSlide, "draw_master-page-name");
            }
            else{
                //if there is no ALT0 page layout name defined, e.g. no presentation_presentation-page-layout-name attribute
                //and no clue from the slides,
                //look at master-page and see if it has subtitle master-page
                var subtitlePresClass = dojo.query("[presentation_class='subtitle']" ,masterHtmlDiv);
                if(subtitlePresClass.length>0){
                    for(var k=0; k<subtitlePresClass.length; k++){
                        if(dojo.hasClass(subtitlePresClass[k].parentNode,"style_master-page")){
                            titleMasterPage = subtitlePresClass[k].parentNode;
                            break;
                        }
                    }
                }else{//if still doesn't have it, just use the first master
                    var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
                    if(masterPages.length>0){
                        titleMasterPage = masterPages[0];
                    }
                }
                if(titleMasterPage!=null){
                    titleMasterPageName = titleMasterPage.id;
                }
            }
        }

        if(outlinePageSlides.length>0){
            var outlinePageSlide = outlinePageSlides[0];
            outlineMasterPageName = dojo.attr(outlinePageSlide, "draw_master-page-name");
        }else if(outlineDrawFrames.length>0){
            var outlinePageSlide = outlineDrawFrames[0].parentNode;
            outlineMasterPageName = dojo.attr(outlinePageSlide, "draw_master-page-name");
        }else if(otherPageSlides.length>0){
            for(var m=0; m<otherPageSlides.length; m++){
                var otherPageSlide = otherPageSlides[m];
                if(dojo.attr(otherPageSlide, "presentation_presentation-page-layout-name")!="ALT0" && dojo.attr(otherPageSlide, "presentation_presentation-page-layout-name")!="ALT19"){
                    //if(otherPageSlide.id != this.slides[0].id){ //if this is not the first slide, use it.First slide may be title page so not for outline
                        outlineMasterPageName = dojo.attr(otherPageSlide, "draw_master-page-name");
                        break;
                    //}
                }
            }
        }
        if(outlineMasterPageName == null){
            outlineKeepGuessing = true;
        }
        if(outlineKeepGuessing == true){
            //if there is no clue, just use/asume the second slide as outline slide
            if(this.slides!=null && this.slides.length>1){
                var outlinePageSlide = this.slides[1];
                outlineMasterPageName = dojo.attr(outlinePageSlide, "draw_master-page-name");
            }
            else{
                //if there is no ALT1 page layout name defined, e.g. no presentation_presentation-page-layout-name attribute
                //and no clue from the slides,
                //look at master-page and see if it has subtitle master-page
                var outlinePresClass = dojo.query("[presentation_class='outline']" ,masterHtmlDiv);
                var outlineMasterPage = null;
                if(outlinePresClass.length>0){
                    for(var k=0; k<outlinePresClass.length; k++){
                        if(dojo.hasClass(outlinePresClass[k].parentNode,"style_master-page")){
                            outlineMasterPage = outlinePresClass[k].parentNode;
                            break;
                        }
                    }
                }else{
                    var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
                    if(masterPages.length>1 ){ //use the second masterPage instead
                        outlineMasterPage = masterPages[1];
                    }

                }
                if(outlineMasterPage!=null){
                    outlineMasterPageName =outlineMasterPage.id;
                }
            }
        }

        masterObj.titleMasterPageName = titleMasterPageName;
        masterObj.outlineMasterPageName = outlineMasterPageName;

        return masterObj;
    },

    loadMasterHtml:function (masterDocUrl, masterStyleCSS){
    	console.info("!!!!!! request for master !!!");
        masterDocUrl+= "?bustCache=" + Math.random(); //to prevent cache
        if(window.XMLHttpRequest)
        {// code for all new browsers
            xmlHttpReq_master=new XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        {// code for IE
            xmlHttpReq_master=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlHttpReq_master != null) {
            xmlHttpReq_master.onreadystatechange= dojo.hitch(this,function(masterStyleCssUrl) {
                if (xmlHttpReq_master.readyState==4){
                    if(xmlHttpReq_master.responseText!=null) {
                    	console.info("!!!!!! got master on Client !!!");
                        var masterHtmlStr = xmlHttpReq_master.responseText;
                        // defect 8759 - check if there is a need to update src in master just in case static root path has change
                        //if(this.docStaticRootPath != this.newStaticRootPath){
                            //masterHtmlStr = this._updateStaticRootPathInURL(masterHtmlStr, this.newStaticRootPath, this.docStaticRootPath);
                            //#9611 - templateDesignGallery folder has moved out of js folder, need to update if the file still has the old url
                            var origMasterHtmlStr = masterHtmlStr;
                            masterHtmlStr = this._updateTemplateDesignGalleryUrl(masterHtmlStr);
                            if(origMasterHtmlStr != masterHtmlStr){
                                this.saveMasterToFile(masterHtmlStr);
                            }
                        //}

                        var masterHtmlDiv = document.getElementById(this.masterHtmlDivId);
                        masterHtmlDiv.innerHTML = masterHtmlStr;
                        var titleMasterPage = null;
                        var titleMasterPageName = null;
                        var outlineMasterPage = null;
                        var outlineMasterPageName = null;
                        //update current master info
                        var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
                        if(masterPages!=null){
                            if(masterPages.length ==0){

                            }
                            else if(masterPages.length == 1){
                                titleMasterPage = masterPages[0];
                                titleMasterPageName = titleMasterPage.id;
                                outlineMasterPage = masterPages[0];
                                outlineMasterPageName = outlineMasterPage.id;
                            }

                            else if(masterPages.length == 2 || masterPages.length%2 == 0){
                                //check the first master page if it contains "Subtitle", if it is assign it to titleMasterPage
                                var titleMasterPageFoundInSlide = false;
                                var subtitlePresClass = dojo.query("[presentation_class='subtitle']" ,masterPages[0]);
                                if(subtitlePresClass.length>0){
                                    titleMasterPage = masterPages[0];
                                }else{
                                    subtitlePresClass = dojo.query("[presentation_class='subtitle']" ,masterPages[1]);
                                    if(subtitlePresClass.length>0){
                                        titleMasterPage = masterPages[1];
                                    }
                                }

                                if(titleMasterPage!=null){
                                    titleMasterPageName = titleMasterPage.id;
                                    //check if titleMasterPageName found is really used in slides
                                    var titleSlides = dojo.query("[draw_master-page-name='"+titleMasterPageName+"']", this.editor.document.$);
                                    if(titleSlides.length>0){
                                        titleMasterPageFoundInSlide = true;
                                    }
                                }


                                ////check the first master page if it contains "outline", if it is assign it to titleMasterPage
                                var outlineMasterPageFoundInSlide = false;
                                var outlinePresClass = dojo.query("[presentation_class='outline']" ,masterPages[0]);
                                if(outlinePresClass.length>0){
                                    outlineMasterPage = masterPages[0];
                                }else{
                                    outlinePresClass = dojo.query("[presentation_class='outline']" ,masterPages[1]);
                                    if(outlinePresClass.length>0){
                                        outlineMasterPage = masterPages[1];
                                    }
                                }
                                if(outlineMasterPage!=null){
                                    outlineMasterPageName = outlineMasterPage.id;
                                    //check if titleMasterPageName found is really used in slides
                                    var outlineSlides = dojo.query("[draw_master-page-name='"+outlineMasterPageName+"']", this.editor.document.$);
                                    if(outlineSlides.length>0){
                                        outlineMasterPageFoundInSlide = true;
                                    }
                                }

                                //if one or the other is not found, check whether the slides has the layout we are looking for..
                                //if it doesn't have it meaning the master page may still be valid only is not used yet, we still can use the master page we found
                                if(titleMasterPageFoundInSlide == true && outlineMasterPageFoundInSlide != true){
                                    //look if presClass other than ALT0 exists in document, if it doesn't,we still can use the outlineMasterPage we found
                                    var otherPageSlides = dojo.query("[presentation_presentation-page-layout-name]",this.editor.document.$);
                                    var outlineSlideFound = false;
                                    if(otherPageSlides.length>0){
                                        for(var m=0; m<otherPageSlides.length; m++){
                                            var otherPageSlide = otherPageSlides[m];
                                            if(dojo.attr(otherPageSlide, "presentation_presentation-page-layout-name")!="ALT0"
                                                && dojo.attr(otherPageSlide, "presentation_presentation-page-layout-name")!=""
                                                    && dojo.attr(otherPageSlide, "presentation_presentation-page-layout-name")!=null){
                                                outlineSlideFound = true;
                                                break;
                                            }
                                        }
                                        if(outlineSlideFound ==true){
                                            //if itis found, we need to guess from the slides
                                            var masterObj =this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
                                            if(masterObj!=null){
                                                outlineMasterPageName = masterObj.outlineMasterPageName;

                                            }
                                        }else if(outlineMasterPage!=null){ //if not found, meaning there is no outline related layout used yet, still keep using the one found from master page
                                            outlineMasterPageName = outlineMasterPage.id;
                                        }
                                    }
                                }else if(titleMasterPageFoundInSlide != true && outlineMasterPageFoundInSlide == true){
                                    //look if presClass ALT0 exists in document, if it doesn't,we still can use the outlineMasterPage we found
                                    var titlePageSlides = dojo.query("[presentation_presentation-page-layout-name='ALT0']",this.editor.document.$);
                                    var subtitleDrawFrames = dojo.query(".draw_frame[presentation_class='subtitle']",this.editor.document.$);
                                    var titleSlideFound = false;
                                    if(titlePageSlides.length>0){
                                        titleSlideFound = true;
                                    }
                                    if(titleSlideFound == true){
                                        //if itis found, we need to guess from the slides
                                        var masterObj =this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
                                        if(masterObj!=null){
                                            titleMasterPageName = masterObj.titleMasterPageName;

                                        }
                                    }else if(titleMasterPage!=null){//if not found, meaning there is no outline related layout used yet, still keep using the one found from master page
                                        titleMasterPageName = titleMasterPage.id;
                                    }
                                }
                                else{ //if the both master pages we found from masterpage are not used in the slides, keep guessing or if we haven't found both master pages
                                    var masterObj =this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
                                    if(masterObj!=null){
                                        titleMasterPageName = masterObj.titleMasterPageName;
                                        outlineMasterPageName = masterObj.outlineMasterPageName;

                                    }
                                }

                            }

                            else if(masterPages.length>=2){ //if master pages length is greater than 2 -- confused, no need to rely on master pages but try to look at the slides in the documents
                                var masterObj = this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
                                if(masterObj!=null){
                                    titleMasterPageName = masterObj.titleMasterPageName;
                                    outlineMasterPageName = masterObj.outlineMasterPageName;

                                }

                            }

                        if(titleMasterPageName!=null){
                            this.currMaster.masterPages[0].name = titleMasterPageName;
                        }else{

                            this.currMaster.masterPages[0].name = masterPages[0].id;
                        }
                        if(outlineMasterPageName!=null){
                            this.currMaster.masterPages[1].name = outlineMasterPageName;
                        }else{
                            this.currMaster.masterPages[1].name = masterPages[1].id;
                        }
                        this.currMaster.masterName = this.currMaster.masterPages[0].name;
                        this.currMaster.masterCount = masterPages.length;

                        var styleCss = masterPages[0].getAttribute("masterStyleCss");
                        if(styleCss!=null && styleCss !=""){
                            masterStyleCssUrl = styleCss;
                        }
                        this.currMasterFrameStylesJSON = this.getCurrentMasterStyles(masterStyleCssUrl);
                        this.currMaster.masterTemplateDataJSONStr = dojo.toJson(this.createTemplateDataJsonFromCurrMaster());
                        this.currMasterFrameStylesJSON.currMaster = this.currMaster;
                        //publish event to slide editor for master pages change
                        var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_masterTemplateChange,'currMasterFrameStylesJSON':this.currMasterFrameStylesJSON, 'currMaster':this.currMaster, 'isFromLoadMasterHtml':true}];
                 		dojo.publish(concord.util.events.slideSorterEvents, eventData);
                        var masterStyleDiv = document.getElementById(PresConstants.MASTER_STYLE_MODEL_VALUE);
                        var defModelDiv = document.getElementById(PresConstants.DEFAULT_COMMON_STYLE);
	                        if(masterStyleDiv && (!defModelDiv)) {
	                        	masterStyleDiv = PresCKUtil.ChangeToCKNode(masterStyleDiv);
	                        	var dDiv = CKEDITOR.dom.element.createFromHtml(PresConstants.DEFAULT_COMMON_STYLE_STRING);
	                        	dDiv.moveChildren( masterStyleDiv );
	                        	this.refreshPlaceHolder(this.editor.document.$);
	                        	
	                        	// simulate clicking on current slide to update
	                        	this.simulateSlideClick(this.selectedSlide);
	                        }          
                        }
                    }
                }
            }, masterStyleCSS);
      	xmlHttpReq_master.open("GET", masterDocUrl, true);
      	xmlHttpReq_master.send(null);
    }
},

/*
    loadMasterHtml:function (masterDocUrl, masterStyleCSS){
            if(window.XMLHttpRequest)
  		{// code for all new browsers
        xmlHttpReq_master=new XMLHttpRequest();
  		}
  		else if (window.ActiveXObject)
  		{// code for IE
        xmlHttpReq_master=new ActiveXObject("Microsoft.XMLHTTP");
  		}
  		if (xmlHttpReq_master != null) {
        xmlHttpReq_master.onreadystatechange= dojo.hitch(this,function(masterStyleCssUrl) {
                    if (xmlHttpReq_master.readyState==4){
                        if(xmlHttpReq_master.responseText!=null) {
                            var masterHtmlDiv = document.getElementById(this.masterHtmlDivId);
                            masterHtmlDiv.innerHTML = xmlHttpReq_master.responseText;
                            //update current master info
                            var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
                            if(masterPages!=null && masterPages.length>=2){

                                this.currMaster.masterName = masterPages[0].id;
                                this.currMaster.masterPages[0].name = masterPages[0].id;
                                this.currMaster.masterPages[1].name = masterPages[1].id;
                                var styleCss = masterPages[0].getAttribute("masterStyleCss");
                                if(styleCss!=null && styleCss !=""){
                                    masterStyleCssUrl = styleCss;
                                }
                                this.currMasterFrameStylesJSON = this.getCurrentMasterStyles(masterStyleCssUrl);
                                this.currMaster.masterTemplateDataJSONStr = dojo.toJson(this.createTemplateDataJsonFromCurrMaster());
                                //publish event to slide editor for master pages change
                                var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_masterTemplateChange,'currMasterFrameStylesJSON':this.currMasterFrameStylesJSON, 'currMaster':this.currMaster}];
                         		dojo.publish(concord.util.events.slideSorterEvents, eventData);
                            }
                        }
                    }
        }, masterStyleCSS);
   	  	xmlHttpReq_master.open("GET", masterDocUrl, true);
   	  	xmlHttpReq_master.send(null);
        }
    },
    */
    loadPresLayoutHtml:function (layoutDocUrl){
        if(window.XMLHttpRequest)
  		{// code for all new browsers
        xmlHttpReq_layout=new XMLHttpRequest();
  		}
  		else if (window.ActiveXObject)
  		{// code for IE
        xmlHttpReq_layout=new ActiveXObject("Microsoft.XMLHTTP");
  		}
  		if (xmlHttpReq_layout != null) {
        xmlHttpReq_layout.onreadystatechange= dojo.hitch(this,function() {
                    if (xmlHttpReq_layout.readyState==4){
                        if(xmlHttpReq_layout.responseText!=null) {
                            var layoutHtmlDiv = document.getElementById(this.layoutHtmlDivId);
                            layoutHtmlDiv.innerHTML = xmlHttpReq_layout.responseText;
                        }
                    }
        });
   	  	xmlHttpReq_layout.open("GET", layoutDocUrl, true);
   	  	xmlHttpReq_layout.send(null);
            }
    },
    //domDoc can be set to null if it is called from slidesorter and want to operate on sorter's this.editor.document.$
    //this maybe used for master template change, backgrund url is different.
    checkNcreateBackgroundImageDivFromCss:function(slideElem, domDoc, msgPairList){
        //apply background image div from background Image CSS here
        //so that we already sure all the CSS has been applied and ready to process
        if(msgPairList == null){
            msgPairList = [];
        }
        var bgImgDiv = null;
        var slideArray = [];
        if(slideElem!=null){
            slideArray.push(slideElem);
        }else{
            slideArray  = this.slides;
        }
        var windowDoc = window;
        if(domDoc==null){
            domDoc = this.editor.document.$;
            windowDoc = this.editor.document.getWindow().$;
        }
        for (var i=0; i<slideArray.length; i++)
        {
            var result = concord.util.HtmlContent.addBackgroundImgFromCssToDiv(slideArray [i], windowDoc, domDoc);
            if(result!=null && result.nodeType==1){ //if this is an element, must be the inserted img element
                //add to content dom after adding bgimage from css to div here.
                bgImgDiv =result;
                msgPairList = SYNCMSG.createInsertNodeMsgPair(bgImgDiv,msgPairList);
            }else if(result!=null && result.bgImgCssSrcAbs!=null && result.bgImgCssSrc !=null && result.absSrcDivsArray!=null && result.absSrcDivsArray.length>0){
                var bgImgCssSrcAbs = result.bgImgCssSrcAbs;
                var bgImgCssSrc = result.bgImgCssSrc;
                var bgImageDivsAbs = result.absSrcDivsArray;
                if(bgImageDivsAbs !=null && bgImageDivsAbs.length >0){

                    for(var j=0; j<bgImageDivsAbs.length; j++){
                        var attrName = "src";
                        msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(bgImageDivsAbs[j]), attrName, bgImgCssSrc, msgPairList);
                        bgImageDivsAbs[j].src = bgImgCssSrc;
                    }
                }

            }
        }
        return msgPairList;
    },
    fixOldMasterStylesUrl: function(slideElem, msgPairList){
        if(msgPairList == null){
            msgPairList = [];
        }
        var slideArray = [];
        if(slideElem!=null){
            slideArray.push(slideElem);
        }else{
            slideArray  = this.slides;
        }
        for (var i=0; i<slideArray.length; i++)
        {
            var imgs = dojo.query("img", slideArray[i]);
            for (var j=0; j<imgs.length; j++){
                var src = dojo.attr(imgs[j],'src');
                if (src == null)
                    continue;
                var idxJs = src.indexOf("/js/concord/widgets/templateDesignGallery/");
                if(idxJs>=0){
                    idxJs = src.indexOf("/templateDesignGallery/");
                    var subStrUrlString = src.substring(idxJs+23); //get the str after /templateDesignGallery/
                    newUrlString = window.contextPath + "/presTemplateDesignGallery/"+subStrUrlString;
                    //coedit
                    var attrName = "src";
                    msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(imgs[j]), attrName, newUrlString, msgPairList);
                    imgs[j].src = newUrlString;

                }
            }
        }
        return msgPairList;
    },

    //
    // Convert the left margin of paragraphs and lists from em to %
    //
    fixParagraphMargins: function(slideElem, msgPairList) {
        if(msgPairList == null){
            msgPairList = [];
        }

        var elements = dojo.query('P,UL,OL', slideElem);
        for(var i=0; i < elements.length; i++) {
            var marginLeft = elements[i].style.marginLeft;
            if (marginLeft && marginLeft.indexOf('em') > 0) {
                var attrName = 'style';
                var oldAttrValue = dojo.attr(elements[i], attrName);
                elements[i].style.marginLeft = PresCKUtil.convertMarginEmToPercent(marginLeft);
                msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(elements[i]), attrName, null, msgPairList, oldAttrValue);
            }
        }

        return msgPairList;
    },

    //
    // Handle events from presentationFocusComponent
    //
    handleSubscriptionForSetFocusEvent: function(data){
        this.publishSlideSorterInFocus();
        var focusItem = dojo.byId('slideSorterIconDiv');
        //focusItem.focus();
        if(focusItem!=null){
            dojo.style(focusItem,{'outline':'1px dashed'});
        }
    },

    handleSubscriptionForLostFocusEvent: function(data){
                var focusItem = dojo.byId('slideSorterIconDiv');
                //focusItem.blur();
                if(focusItem!=null){
                    dojo.style(focusItem,{'outline':''});
                }
    },
    //
    // Handle events from pub/sub model
    //
    
    handleSubscriptionEvents_PresScene_Resize : function(data){
        this.setUIDimensions();
    },
    handleSubscriptionEvents_PresScene_Render : function(data){
        try{
            var presDiv = dojo.query('.office_presentation', this.editor.document.$);
            if(presDiv!=null && presDiv.length>0){
                var slideSorterDiv = document.getElementById(this.divContainerId);
                var slideSorterToolDiv = document.getElementById(this.slideSorterToolDivId);
                this.setUIDimensions();
                //apply background image div from background Image CSS here
                //so that we already sure all the CSS has been applied and ready to process
                //var msgPairList = [];
                //msgPairList = this.checkNcreateBackgroundImageDivFromCss(null, null, msgPairList);
                /*
                var bgImgDiv = null;
                for (var i=0; i<this.slides.length; i++)
                {
                    bgImgDiv = concord.util.HtmlContent.addBackgroundImgFromCssToDiv(this.slides[i], this.editor.document.getWindow().$, this.editor.document.$);
                    //add to content dom after adding bgimage from css to div here.
                    if(bgImgDiv!=null){
                        msgPairList = SYNCMSG.createInsertNodeMsgPair(bgImgDiv,msgPairList);
                    }
                }
                */
                //Send Coedit msg for inserted background image div
                /*
                if (msgPairList!=null && msgPairList.length > 0){
                    //-replace removeUndo
                    var addToUndo = false;
                    msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);

                    SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                }
                */
                //publish event for co-editing and slideeditor in toRender event
                //to make sure all the necessary css has been applied and the DOM can be processed
                
                // do not publish event, only load slide from left to right
                // this.publishSlideSelectedEvent(this.selectedSlide);
                window.pe.scene.slideEditor.quickLoadInSlideEditor(this.selectedSlide, false, null);
                
                //check if sidebar is hidden, show it
//            if(this.currentScene.sidebar.isHidden() == true){
//                this.currentScene.toggleSideBar();
//            }
                this.currentScene.showSlideSorter();    //wj
                slideSorterDiv.style.visibility="visible";
                //slideSorterDiv.style.display="block";
                slideSorterToolDiv.style.visibility="visible";
                dojo.byId(this.slideSorterToolsId).style.display = 'block';
                var slideSorterContainerParent = dojo.byId(this.currentScene.slideSorterContainerId);
                slideSorterContainerParent.style.overflow = "hidden";
                var sideBarSlideSorterPane = dojo.byId(this.currentScene.sideBarSlideSorterPaneId);
                sideBarSlideSorterPane.style.overflow = "hidden";
                if(this.currentScene.sceneInfo.mode != "view"){
                	pe.scene.disableCommentButton(true);
                }

                // this.createSlideUtilDiv();  // to create slideUtilDiv in checkIfContentLoaded

                var time =  (new Date()).getTime() - window.pe.scene.loadStateTS;
                console.log("***TORENDER:"+time);

                var eventData = [{eventName: 'slideSorterFinalRendered'}];
                dojo.publish(concord.util.events.slideSorterEvents, eventData);
            }
        }
        catch(e){
            return;
        }
    },
    
    
    handleSubscriptionEvents : function(data){
        if(data!=null){
                if(data.eventName==concord.util.events.slideSorterEvents_eventName_slidesLoaded){
                //this.createSlideUtilDiv();
                //init scroll event
                if(data.isFromContentReset != true){
                    this.initForScrollEvent();  //do not do this if we are processing coedit master style content reset
                }
                
            }
            else if(data.eventName == concord.util.events.slideSorterEvents_eventName_nextPrevSlide) {
                this.handleNextPrevSlideEvent(data);
            }
            else if (data.eventName==concord.util.events.keypressHandlerEvents_eventName_keypressEvent){
            	// ignore keypressEvent in read-only mode or view draft mode
            	var tempScene = pe.scene;
            	if (tempScene.bInReadOnlyMode || tempScene.isViewDraftMode()){
            		return;
            	}

                this.keypressHandle(data);
            }
            else if(data.eventName == concord.util.events.presDocSceneEvents_eventName_docShare){
                //coediting
            }
            else if (data.eventName == concord.util.events.slideShowEvents_eventName_getSlidesForShow){
                this.handleSlideShowRequest();
            }
            else if (data.eventName == concord.util.events.slideShowEvents_eventName_getSlidesForPrint){
                this.handleHtmlPrintRequest();
            }
            else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createNewSlide){
            	var slideEditor = pe.scene.slideEditor;
            	slideEditor && slideEditor.deSelectAll();
                this.createSlide(this.selectedSlide);
            }
            else if (data.eventName==concord.util.events.presToolbarEvents_eventName_slideTransitions){
                this.applySlideTransitions(data.smil_type, data.smil_subtype, data.smil_direction, false);
            }
            else if (data.eventName==concord.util.events.presDocSceneEvents_eventName_userLeft){
                var user = PROCMSG._getUserObject(data.userId);
                this.handleUserLeft(user);
            }
            else if (data.eventName==concord.util.events.presDocSceneEvents_eventName_userJoined || data.eventName==concord.util.events.presDocSceneEvents_eventName_coeditStarted){
                //when coeditStarted we need to call handleUserJoined() as well, because sometimes during the first userJoined event, the coedit hasn't started so slideSelected msg to be sent is not sent out due to session still detects singleMode
                //so we need to call handleUserJoined during coeditStarted as well to make sure slideSelected msg is sent out to other users.
                this.handleUserJoined(data);
            }
            else if(data.eventName==concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset) {
                this.handleCleanupOldContentBeforeReset();
            }
        }

    },
    handleSubscriptionEventsCommenting: function(data){
        if(data.eventName == concord.util.events.commenttingEvents_eventName_commentSelected){
            this.handleCommentSelected(data);
        }
        else if(data.eventName == concord.util.events.commenttingEvents_eventName_commentUnselected){
            this.handleCommentUnselected(data);
        }
        else if(data.eventName == concord.util.events.commenttingEvents_eventName_commentDeleted){
            this.handleCommentDeleted(data);
        }
    },
    handleSubscriptionEventsUndoRedo: function(data){
        if(data.eventName == concord.util.events.undoRedoEvents_eventName_undo){
            this.handleUndoMsg(data);
        }
        else if(data.eventName == concord.util.events.undoRedoEvents_eventName_applyTemplate){
            this.handleUndoApplyTemplate(data);
        }
        else if(data.eventName == concord.util.events.undoRedoEvents_eventName_processMessageInsertSlideWrapper){
            this.handleUndoRedoInserSlideWrapper(data);
        }
        else if(data.eventName == concord.util.events.undoRedoEvents_eventName_processMessageDeleteSlideWrapper){
            this.handleUndoRedoDeleteSlideWrapper(data);
        }
    },
    
    handleSubscriptionEventsSlideEditor_Focus : function(data){
    	this.handleSelfFocusRemoved();
    },
    
    handleSubscriptionEventsSlideEditor : function(data){
        if (data.eventName==concord.util.events.LocalSync_eventName_attributeChange){
            this.handleAttributeChangeFromSlideEditor(data);
        } else if (data.eventName==concord.util.events.LocalSync_eventName_multiBoxAttributeChange){
            this.handleMuliBoxAttributeChangeFromSlideEditor(data);
        }        
        else if(data.eventName == concord.util.events.slideEditorEvents_eventName_layoutConverted){
            this.handleLayoutConvertedToRealDrawFrame(data);
        }
        else if(data.eventName == concord.util.events.slideEditorEvents_eventName_insertNodeFrame){
            this.handleInsertNodeFrameFromSlideEditor(data);
            if(this.spellChecker && this.spellChecker.isAutoScaytEnabled()){
                var nodeList = dojo.query("[id=" + data.node.id + "]",this.spellChecker.document);
                if(nodeList && nodeList.length)
                    this.spellChecker.checkNodes(nodeList[0], nodeList[0], null);
            }
        }
        else if (data.eventName == concord.util.events.slideEditorEvents_eventName_multipleInsertNodeFrame){
            this.handleMultipleInsertNodeFrameFromSlideEditor(data);
            if(this.spellChecker && this.spellChecker.isAutoScaytEnabled()){
                for(var i=0; i<data.nodeList.length; i++)
                {
                    var nodes = dojo.query("[id=" + data.nodeList[i].node.id + "]",this.spellChecker.document);
                    if(nodes && nodes.length)
                        this.spellChecker.checkNodes(nodes[0], nodes[0], null);
                }
            }
        }
        else if (data.eventName == concord.util.events.slideEditorEvents_eventName_multipleDeleteNodeFrame){
            this.handleMultipleDeleteNodeFrameFromSlideEditor(data);
        }
        else if(data.eventName == concord.util.events.slideEditorEvents_eventName_deleteNodeFrame){
            this.handleDeleteNodeFrameFromSlideEditor(data);
        }
        else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createNewSlide){
            var node = this.selectedSlide;
            this.createSlide(node);
        }
        else if (data.eventName==concord.util.events.presMenubarEvents_eventName_deleteSlides){
            this.deleteSlides();
        }
        else if (data.eventName==concord.util.events.slideEditorEvents_eventName_slideTransitionApplied){
            this.applySlideTransitions(data.smil_type, data.smil_subtype, data.smil_direction, data.applyToAll);
        }
        /*
        else if (data.eventName==concord.util.events.slideEditorEvents_eventName_layoutApplied){
            var slideWithNewLayout = data.slideSelected;
            this.applyLayoutToScene(slideWithNewLayout);
        }
        */
        else if (data.eventName==concord.util.events.slideEditorEvents_eventName_applyLayout){
            var resultArray = data.layoutResultArray;
            var presPageLayoutName = 'blank';
            if(resultArray.length>0){
                presPageLayoutName = resultArray[0].layoutName;
            }
            var msgActs = [];
            // process the change layout
            // Just send one rn message to layout application(one or multiple)
            this.applyLayoutForMultiSlidesToScene(presPageLayoutName, null,null, null,resultArray,msgActs);

            //send coedit messages
            if(msgActs!=null && msgActs.length>0){
                //load currently selected slide into the slide Editor
                var currSlide = window.pe.scene.slideSorter.selectedSlide;
                var slideDom = dojo.clone(currSlide);
                //window.pe.scene.slideEditor.quickLoadInSlideEditor(slideDom, true);
                var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_layoutApplied,'slideSelected':slideDom}];
                dojo.publish(concord.util.events.slideSorterEvents, eventData);

                var msg = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs);
                SYNCMSG.sendMessage([msg], SYNCMSG.NO_LOCAL_SYNC);
                dojo.destroy(slideDom);
                slideDom.innerHTML='';
                slideDom = null;
            }
        }
        else if (data.eventName==concord.util.events.slideEditorEvents_eventName_templateDesignApplied){
            this.handleTemplateDesignApplied(data);
        }else if (data.eventName == concord.util.events.slideEditorEvents_eventName_cutSlides){
            this.cutSlides();
        }else if (data.eventName == concord.util.events.slideEditorEvents_eventName_copySlides){
            this.copySlides();
        }
        else if(data.eventName==concord.util.events.slideEditorEvents_eventName_boxEditMode){
            if(!data.editMode && this.spellChecker && this.spellChecker.isAutoScaytEnabled()){// exit edit mode
                var nodeList = dojo.query("[id=" + data.id + "]",this.spellChecker.document);
                if(nodeList && nodeList.length)
                    this.spellChecker.checkNodes(nodeList[0], nodeList[0], null);
            }
        //}else if(data.eventName == concord.util.events.crossComponentEvents_eventName_inFocus && data.componentName==concord.util.events.crossComponentEvents_componentName_SLIDE_EDITOR){
          //  this.handleSelfFocusRemoved();
        }
    },

    handleTemplateDesignApplied: function(data){
        var slideId = data.slideSelected.id;
        var templateData = data.templateData;
        this.applyTemplate(slideId, templateData);
        dojo.destroy(data.slideSelected);
        data.slideSelected = null;
    },
    copyPaste : function()
    {
    	//exit edit mode for current slide.
    	var slideEditor = pe.scene.slideEditor;
    	slideEditor && slideEditor.deSelectAll();
    	
        this.copySlides();
        this.pasteSlides(this.PASTE_AFTER);
    },
    //
    // used to show or hide the speaker notes note
    //
    showHideSlideSorter: function(){
    	var slideSorterDiv = document.getElementById(this.divContainerId);
        if (slideSorterDiv) {
            if (this.showSlideSorter) {
                dojo.style(slideSorterDiv, "display", "");
                concord.util.resizer.performResizeActions(null,250);
            } else {
                dojo.style(slideSorterDiv, "display", "none");
                concord.util.resizer.performResizeActions(null,0);
            }
        } 
    },
    //
    // used to toggle showSlideSorter from true to false
    //
    toggleShowSlideSorter: function(data){
        if (data.forceOpen) {
            if (!this.showSlideSorter) {
                var mi = dijit.byId("P_i_SlideSorter");
                if (mi) {
                    mi._setCheckedAttr(true);
                }
            }
            else {
                return;
            }
        }
        if (this.showSlideSorter) {
            this.showSlideSorter = false;
        } else {
            this.showSlideSorter = true;
        }
        this.showHideSlideSorter();
    },
    handleSubscriptionEventsPresMenuBar : function(data){
        // to ignore keypress in loading or read-only mode or view draft mode
    	var tempScene = pe.scene;
    	if (!tempScene.bLoadFinished || tempScene.bInReadOnlyMode ||
    			tempScene.isViewDraftMode()) {
			return;
		}
        if (data.eventName==concord.util.events.presMenubarEvents_eventName_duplicateSlides){
            this.copyPaste();
        }
        else if (data.eventName==concord.util.events.presMenubarEvents_eventName_PasteObject){
            this.pasteSlides(this.PASTE_AFTER);
        }
        else if (data.eventName==concord.util.events.presMenubarEvents_eventName_deleteSlides){
            this.deleteSlides();
        }
        else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createNewSlide){
            var node = this.selectedSlide;
            this.createSlide(node);
        }
        else if (data.eventName=='selectAllSlides'){
            this.selectAllSlides();
            this.publishSlideSorterInFocus();
            var focusNode = dojo.query('#slideSorterContainer');
			if (focusNode[0]) {
				focusNode = focusNode[0];
				focusNode.focus();
			}
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_showHideSlideSorter){
            this.toggleShowSlideSorter(data);
        }
    },
    
    handleSubscriptionEventsCoediting: function(data){
        if(data.eventName== concord.util.events.coeditingEvents_eventName_processMessageInsertSlide){
            this.handleCoeditInsertSlide(data);
        }
        else if(data.eventName== concord.util.events.coeditingEvents_eventName_processMessageInsertSlideWrapper){
            this.handleCoeditInsertSlideWrapper(data);
        }
        else if(data.eventName == concord.util.events.coeditingEvents_eventName_preProcessMessageDeleteSlide){
            this.handleCoeditPreDeleteSlide(data);
        }
        else if(data.eventName == concord.util.events.coeditingEvents_eventName_processMessageDeleteSlide){
            this.handleCoeditDeleteSlide(data);
        }
        else if(data.eventName == concord.util.events.coeditingEvents_eventName_templateAppliedByOtherUser){
            this.handleTemplateAppliedByOtherUser(data);
        }
        else if(data.eventName == concord.util.events.coeditingEvents_eventName_layoutAppliedByOtherUser){
            this.handleLayoutAppliedByOtherUser(data);
        }
        else if(data.eventName == concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUser){
            this.handleSlideSelectedByOtherUser(data);
        }else if(data.eventName == concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUserRemoved){
            this.handleSlideSelectedByOtherUserRemoved(data);
        }else if(data.eventName == concord.util.events.coeditingEvents_eventName_toggleContentBoxLock){
            if(!data.lockContentBox && this.spellChecker && this.spellChecker.isAutoScaytEnabled())
            {
                var nodeList = dojo.query("[id=" + data.contentBoxId + "]",this.spellChecker.document);
                if(nodeList && nodeList.length)
                    this.spellChecker.checkNodes(nodeList[0], nodeList[0], null);
            }
        }
    },
    handleSlideSorterExpand: function() {
        var slideSorterPaneButton = dijit.byId("sidebar_slidesorter_pane_button");
        if(slideSorterPaneButton!=null){
            if(slideSorterPaneButton.selected == true){
                if(this.selectedSlide!=null && this.selectedSlide.parentNode !=null){
                    var slideWrapper = this.selectedSlide.parentNode;
                    var ckslideWrapper = PresCKUtil.ChangeToCKNode(slideWrapper);
            		ckslideWrapper.scrollIntoView(false);
                }
            }
        }
    },
    
    handleSubscriptionForSideBarEvent:function(data){
        if (data.eventName== concord.util.events.sidebarEditorEvents_eventName_slideSorterExpand) {
            this.handleSlideSorterExpand();
        } else if(data.eventName==concord.util.events.sidebarEditorEvents_eventName_showAllSlides){
            this.showAllSlides();
        } 
    },

    // Send the currently selected slide to users who joined
    createSlideSelectedMsg: function(slideId){
        var msg = SYNCMSG.createActivateSlideSelectedMsg(slideId);
        var msgPairsList = [];
        msgPairsList.push(msg);
        SYNCMSG.sendMessage(msgPairsList, SYNCMSG.NO_LOCAL_SYNC);
    },

    // When another user joins sorter must send to that user  current slide selected
    handleUserJoined: function(){
        var slideSelected = this.selectedSlide;
        if (slideSelected != null) {
            var slideId = slideSelected.id;
            this.createSlideSelectedMsg(slideId);
        }
        this.refreshSlideLockIndicators();
    },

    handleUserLeft: function(user){
        if(user!=null){
            var slideNodeLockedEntries = this.currentScene.getSlideNodeLockedEntryForUser(user);
            if(slideNodeLockedEntries!=null && slideNodeLockedEntries.length>0){
                for(var s=0; s<slideNodeLockedEntries.length; s++){
                    var entry = slideNodeLockedEntries[s];
                    if(entry!=null){
                        var slideId = entry.drawFrameId;
                        if(entry.action == "slideSelected"){
                            var element2 = this.editor.document.$.getElementById(slideId);
                            if(element2 != null){
                                this.removeSlideCoeditIndicator(element2);
                            }
                        } else if (entry.action == "inEdit") {
                            //if we need anything to do here..
                        }
                        this.currentScene.slideNodeLockStatusRemoveEntry(slideId,user);
                    }
                }
            }
        }
    },

    //
    // Sets UI dimensions for slide Editor
    //
    setUIDimensions : function(ev){
        var slidesorterContainerDiv = document.getElementById(this.divContainerId);
        var slidesorterContainerHeight = dojo.getComputedStyle(slidesorterContainerDiv).height;
        var slidesorterContainerWidth = dojo.getComputedStyle(slidesorterContainerDiv).width;
        if(slidesorterContainerHeight !=null && slidesorterContainerHeight!="" && slidesorterContainerWidth !=null && slidesorterContainerWidth !=""){
            //var pxIdx = slidesorterContainerWidth.indexOf("px");
            var slidesorterContainerWidthInt = concord.util.resizer.getIntPropertyStyleValue(slidesorterContainerWidth);
            //pxIdx = slidesorterContainerHeight.indexOf("px");
            var slidesorterContainerHeightInt = concord.util.resizer.getIntPropertyStyleValue(slidesorterContainerHeight);

            //slidesorter tool div
            var slideSorterToolDiv = document.getElementById(this.slideSorterToolDivId);
            var slideSorterToolHeight = slideSorterToolDiv.offsetHeight;
            /*
            if(slideSorterToolHeight!=null){
                pxIdx =slideSorterToolHeight.indexOf("px");
            }
            var slideSorterToolDivHeightInt = slideSorterToolHeight.substring(0, pxIdx);
            */
            if(this.editor!=null && this.editor.resize !=null){
                // Resize editor
                this.editor.resize(slidesorterContainerWidthInt, slidesorterContainerHeightInt - slideSorterToolHeight -0, null, true);
            }
            if(this.officePrezDiv!=null && this.officePrezDiv.style.visibility !="hidden"){
                this.handleResizeWindowForScrolling();
            }
        }

    },

    getDocAcl:function(){
        var response, ioArgs;

        dojo.xhrGet({
            url: concord.util.uri.getDocUri() + '?method=getUserList&permission=edit',
            handleAs: "json",
            handle: function(r, io) {response = r; ioArgs = io;},
            sync: true,
            preventCache:true,
            noStatus: true
        });

        return response;
    },

    showAllSlides:function(){
        //loop thru the slides to find tasks to display
        var allSlides = this.getAllSlides();
        if(allSlides!=null && allSlides.length>0){
            for(var i=0; i<allSlides.length; i++){
                var slideElem = allSlides[i];
                    //mark the slide wrapper display:block
                    slideElem.parentNode.style.display="block";
            }
            //adjust scrolling to show the selected slide
            var slideWrapper = this.selectedSlide.parentNode;
            if(slideWrapper!=null){
            	var ckslideWrapper = PresCKUtil.ChangeToCKNode(slideWrapper);
        		ckslideWrapper.scrollIntoView(false); //scrolling will take care of loading/unloading slides
            }
        }
        /*
        //change button to clicked version and hook to show all slides function
        var showMySlidesImgNode = document.getElementById("showMySlidesIcon");
        showMySlidesImgNode.setAttribute("src",window.contextPath + window.staticRootPath + "/images/myassigned_18_light.png");
        showMySlidesImgNode.setAttribute("alt",this.STRINGS.task.SHOW_MY_ASSIGNMENTS);
        showMySlidesImgNode.onclick=dojo.hitch(this, this.showMyAssignments);
        //this.showMySlidesTooltip.label = "Show slides assigned to me";
        */
    },

    
    //wj
    showComments:function()
    {
//		this.base.commentsBar.createCommentsCmd();
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
            } else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";
        } else if (smil_type == "pushWipe") {
            if (smil_subtype == "fromTop") {
                transitionToUse	= "slideTransitions_pushDown";
            } else if (smil_subtype == "fromRight") {
                transitionToUse	= "slideTransitions_pushLeft";
            } else if (smil_subtype == "fromBottom") {
                transitionToUse	= "slideTransitions_pushUp";
            } else if (smil_subtype == "fromLeft") {
                transitionToUse	= "slideTransitions_pushRight";
            } else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";
        } else if (smil_type == "fade") {
            transitionToUse	= "slideTransitions_fadeSmoothly";
        } else if (smil_type == "barWipe") {
            if (smil_subtype == "topToBottom" && (smil_direction == "none" || smil_direction == "forward")) {
                transitionToUse	= "slideTransitions_wipeDown";
            } else if (smil_subtype == "leftToRight" && (smil_direction == "none" || smil_direction == "forward")) {
                transitionToUse	= "slideTransitions_wipeRight";
            } else if (smil_subtype == "topToBottom" && smil_direction == "reverse") {
                transitionToUse	= "slideTransitions_wipeUp";
            } else if (smil_subtype == "leftToRight" && smil_direction == "reverse") {
                transitionToUse	= "slideTransitions_wipeLeft";
            } else
				//the default transition if the transition is not supported
				transitionToUse	= "slideTransitions_notSupported";
        } else {
            //the default transition if the transition is not supported
            transitionToUse	= "slideTransitions_notSupported";
        }
        return transitionToUse;
    },

        applySlideTransitions: function(smil_type, smil_subtype, smil_direction, applyToAll) {

        var selectedSlides = this.multiSelectedSlides;
        if (applyToAll) {
            this.selectAllSlides();
            selectedSlides = this.multiSelectedSlides;
        }

        var msgActs = new Array();

        for(var ms=0; ms<selectedSlides.length; ms++){
            if (smil_type != 'none') {
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_type", smil_type, msgActs);
                dojo.attr(selectedSlides[ms], "smil_type", smil_type);
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_subtype", smil_subtype, msgActs);
                dojo.attr(selectedSlides[ms], "smil_subtype", smil_subtype);
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_direction", smil_direction, msgActs);
                dojo.attr(selectedSlides[ms], "smil_direction", smil_direction);
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "presentation_transition-speed", "none", msgActs);
                dojo.attr(selectedSlides[ms], "presentation_transition-speed", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_fadeColor", "none", msgActs);
                dojo.attr(selectedSlides[ms], "smil_fadeColor", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "presentation_duration", "none", msgActs);
                dojo.attr(selectedSlides[ms], "presentation_duration", "none");
            } else {
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_type", "none", msgActs);
                dojo.attr(selectedSlides[ms], "smil_type", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_subtype", "none", msgActs);
                dojo.attr(selectedSlides[ms], "smil_subtype", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_direction", "none", msgActs);
                dojo.attr(selectedSlides[ms], "smil_direction", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "presentation_transition-speed", "none", msgActs);
                dojo.attr(selectedSlides[ms], "presentation_transition-speed", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "smil_fadeColor", "none", msgActs);
                dojo.attr(selectedSlides[ms], "smil_fadeColor", "none");
                msgActs = SYNCMSG.createAttributeMsgActs(new CKEDITOR.dom.node(selectedSlides[ms]), "presentation_duration", "none", msgActs);
                dojo.attr(selectedSlides[ms], "presentation_duration", "none");
            }
            var slideWrapper = selectedSlides[ms].parentNode;
            var slideUtilDivQueries = dojo.query(".slideUtil", slideWrapper);
            if(slideUtilDivQueries.length > 0){
                var slideTransitionDivQueries = dojo.query("div", slideUtilDivQueries[0]);
                if(slideTransitionDivQueries.length > 1){
                    var transitionIcon = this.getTransitionType(selectedSlides[ms]);
                    dojo.attr(slideTransitionDivQueries[1], "class", transitionIcon);
                }
            }
        }
        if (msgActs.length > 0) {
            // Just sent one msg for applying slide transition(one or multiple)
            var msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
            SYNCMSG.sendMessage(msgList, SYNCMSG.NO_LOCAL_SYNC);
        }
    },

    applyLayoutToScene: function(slideWithNewLayout, msgPairList, isFromOtherDocForPasteSlides){
        if(msgPairList == null){
            msgPairList = [];
        }

        if(slideWithNewLayout!=null){
            //this.removeSpareBoxes(slideWithNewLayout);
            var slideId = slideWithNewLayout.id;
            var layoutName = slideWithNewLayout.getAttribute("presentation_presentation-page-layout-name");
            var masterName = slideWithNewLayout.getAttribute("draw_master-page-name");
            var slideWithNewLayoutDrawPageClassNames = slideWithNewLayout.className;
            
            if(slideId!=null && slideId!=""){
                var slideElem = this.editor.document.$.getElementById(slideId);
                
                slideElem.setAttribute('docs_layout', 'true');
                msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'docs_layout', 'true', msgPairList);
                this.removeSpareBoxes(slideElem);
                var currLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
                var currMasterName = slideElem.getAttribute("draw_master-page-name");

                //need to send coedit message for presentation_presentation-page-layout-name first before anything else to handle conflict
                //gracefully, since in OT we only detect OT by individual message, OT will be detected for 2 users applying layout at the same time
                //when there is a conflict on setting presentation_presentation-page-layout-name attribute.
                //if we put this msg at the beginning of the msg list for layout, the handle conflict will take care gracefully
                //otherwise, some msgs have already been processed, and the handle conflict on presentation_presentation-page-layout-name attr is not handled gracefully
                if(layoutName!=null && layoutName!=""){
                    // jmt - coeditfix
                    var attrName = "presentation_presentation-page-layout-name";
                    msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, layoutName, msgPairList);
                    slideElem.setAttribute(attrName, layoutName);
                    // jmt - coeditfix
                    if(masterName != currMasterName){
                        var attrName = "draw_master-page-name";
                        msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, masterName, msgPairList);
                        slideElem.setAttribute("draw_master-page-name", masterName);

                    }
                    //update master draw_page classes
                    //first remove both possible draw_page classes
                    var attrName = "class";
                    var oldAttrVal = "";
                    //we need to clean the slideSelected class from oldAttrVal
                    var styleNameTemp1 = dojo.trim(slideElem.className);
                    var styleNameTempArray1 = styleNameTemp1.split(" ");
                    if(styleNameTempArray1!=null){
                        for(var i=0; i<styleNameTempArray1.length; i++){
                            if(styleNameTempArray1[i]!="slideSelected"){
                                oldAttrVal = oldAttrVal + " "+styleNameTempArray1[i];
                            }
                        }
                    }
                    oldAttrVal = dojo.trim(oldAttrVal);

                    dojo.removeClass(slideElem, this.currMasterFrameStylesJSON.draw_page_title + " "+this.currMasterFrameStylesJSON.draw_page_text);
                    //then add the ones from slideWithNewLayout
                    var styleName = "";
                    var styleNameTemp2 = dojo.trim(slideWithNewLayoutDrawPageClassNames);
                    var styleNameTempArray2 = styleNameTemp2.split(" ");
                    if(styleNameTempArray2!=null){
                        for(var i=0; i<styleNameTempArray2.length; i++){
                            if(styleNameTempArray2[i]!="slideEditor" && styleNameTempArray2[i]!="slideSelected"){
                                styleName = styleName + " "+styleNameTempArray2[i];
                            }
                        }
                    }
                    styleName = dojo.trim(styleName);
                    dojo.addClass(slideElem, styleName);
                    var newAttrVal = "";
                    //we need to clean the slideSelected class from oldAttrVal
                    var styleNameTemp3 = dojo.trim(slideElem.className);
                    var styleNameTempArray3 = styleNameTemp3.split(" ");
                    if(styleNameTempArray3!=null){
                        for(var i=0; i<styleNameTempArray3.length; i++){
                            if(styleNameTempArray3[i]!="slideSelected"){
                                newAttrVal = newAttrVal + " "+styleNameTempArray3[i];
                            }
                        }
                    }
                    newAttrVal = dojo.trim(newAttrVal);
                    msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, newAttrVal, msgPairList, oldAttrVal);

                }

                //update the position and size of the slide with the slideWithNewLayout values
                //get all the draw_frame elements and update the style position, left, top, width, height
                var newLayoutDrawFrames = dojo.query(".draw_frame[presentation_placeholder='true']", slideWithNewLayout);
                if(newLayoutDrawFrames!=null){
                    //delete background image if any
                    //change the backgroundImage if any
                    var bgImgDivs = dojo.query(".draw_frame.backgroundImage", slideElem);
                    //delete the current background  to be replaced with background image div from slide editor
                    if(bgImgDivs !=null){
                        for(var p=0; p < bgImgDivs.length; p++){
                            var nodeToDeleteId = bgImgDivs[p].id;
                            //check if this id exist in slideWithNewLayout
                            //for some reason dojo.query using "#" for query id doesn't work with the slideWithNewLayout, may be because it is not attached to any document
                            //so try to loop
                            var IsExistInSlideWithNewLayout = false;
                            var bgFramesInSlideWithNewLayout = dojo.query(".draw_frame.backgroundImage", slideWithNewLayout);
                            for(var y=0; y<bgFramesInSlideWithNewLayout.length; y++){
                                if(bgFramesInSlideWithNewLayout[y].id == nodeToDeleteId){
                                    IsExistInSlideWithNewLayout = true;
                                }
                            }
                            if(IsExistInSlideWithNewLayout == false){
                                var elem = this.editor.document.getById(nodeToDeleteId);
                                // jmt - coeditfix
                                msgPairList = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                                dojo.destroy(bgImgDivs[p]);
                            }
                        }
                    }

                    for(var i = 0; i<newLayoutDrawFrames.length; i++){
                        //if drawFrame exist in slideElem, update the style
                        var frameElem = newLayoutDrawFrames[i];
                        var frameId = frameElem.id;
                        var frameInSlideElem = this.editor.document.$.getElementById(frameId);
                        if(frameInSlideElem!=null){                      	
                            frameInSlideElem.id = frameElem.id;
                            //remove the current draw_frame and replace with the new one
                            var elem = this.editor.document.getById(frameInSlideElem.id);
                            msgPairList =SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                            var nextSibling = frameInSlideElem.nextSibling;
                            dojo.destroy(frameInSlideElem);
                            //then insert the new one
                            var newFrameElem = frameElem.cloneNode(true);
                            if(dojo.isIE){
                                //for some reason in IE, the width and height in draw_text-box element becomes pixels.
                                //need to reset to 100%
                                var drawTextBoxes = dojo.query(".draw_text-box",newFrameElem);
                                if(drawTextBoxes.length>0){
                                    drawTextBoxes[0].style.width = "100%";
                                    drawTextBoxes[0].style.height = "100%";
                                }
                            }
                            if(nextSibling!=null){
                                slideElem.insertBefore(newFrameElem, nextSibling);
                            }else{
                                slideElem.appendChild(newFrameElem);
                            }
                            //coedit insert frame
                            // jmt - coeditfix
                            msgPairList = SYNCMSG.createInsertNodeMsgPair(newFrameElem,msgPairList);                          
                        }
                        //if drawFrame doesn't exist in slideElem, insert the new frame to slideElem
                        else{

                            if(dojo.hasClass(frameElem,"backgroundImage")){
                                var newFrameElem = frameElem.cloneNode(true);
                                if(slideElem.childNodes[i]!=null){
                                    slideElem.insertBefore(newFrameElem, slideElem.childNodes[i]);
                                }else{//if somehow index i node is not available, insert as the first item
                                    slideElem.insertBefore(newFrameElem, slideElem.firstChild);
                                }
                            }else {
                                var newFrameElem = frameElem.cloneNode(true);
                                slideElem.appendChild(newFrameElem);
                            }
                            //coedit insert frame
                            // jmt - coeditfix
                            msgPairList = SYNCMSG.createInsertNodeMsgPair(newFrameElem,msgPairList);
                        }
                    }

                    //delete all the frames that are not in the new layout
                    var slideElemDrawFrames = dojo.query(".draw_frame[presentation_placeholder='true']", slideElem);

                    for(var i = 0; i<slideElemDrawFrames.length; i++){
                        //if drawFrame exist in slideElem, update the style
                        var frameElem = slideElemDrawFrames[i];
                        var frameId = frameElem.id;
                        var prezClass = frameElem.getAttribute("presentation_class");
                        var isBgImageFrame = dojo.hasClass(frameElem, "backgroundImage");
                        var isFrameInNewLayout= false;
                        if(isBgImageFrame == false && prezClass !=null && prezClass !="header" && prezClass !="footer" && prezClass !="date-time" && prezClass !="page-number"){
                            for (var j = 0; j<newLayoutDrawFrames.length; j++){
                                var frameNewLayoutElem = newLayoutDrawFrames[j];
                                var frameNewLayoutId = frameNewLayoutElem.id;
                                if(frameId == frameNewLayoutId){
                                    isFrameInNewLayout = true;
                                    break;
                                }
                            }
                            if(isFrameInNewLayout==false){

                                //coediting
                                // jmt - coeditfix
                                var elem = this.editor.document.getById(frameId);
                                msgPairList =SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                                dojo.destroy(frameElem);
                            }
                        }
                    }

                }

                //check if this is a multislides apply layout
                //if it is, apply layout to all other slide besides slideElem
                if(this.multiSelectedSlides.length >1){
                    var slideArray = new Array();
                    for(var ms=0; ms<this.multiSelectedSlides.length; ms++){
                        if(this.multiSelectedSlides[ms] != slideElem){
                            slideArray.push(this.multiSelectedSlides[ms]);
                        }
                    }
                }

                //set the msg's has delete and insert same element, for undo processing allowing delete and insert element together in the same msgList
                var hasDeIeSameElement = true;
                msgPairList = SYNCMSG.setHasInsertDeleteSameElementInMsgListFlag(msgPairList,hasDeIeSameElement);
                msgPairList = this.coeditingSendMsgForLayoutApplied(slideId, msgPairList);
                this.updateSlideObject(slideElem);
           }
            var tempParent = null;
            if(slideWithNewLayout.parentNode !=null){
                tempParent = slideWithNewLayout.parentNode;
            }
            dojo.destroy(slideWithNewLayout);
            slideWithNewLayout = null;
            if(tempParent!=null){
                dojo.destroy(tempParent);
            }
        }
        return msgPairList;
    },
    removeLayoutPlaceholders:function(slideElem, msgPairList,isFromOtherDocForPasteSlides){
        var layoutPlaceholder = dojo.query('.layoutClass',slideElem);
        if(msgPairList == null){
            msgPairList = new Array();
        }
        for(var i=0; i< layoutPlaceholder.length; i++){
            var frameId = layoutPlaceholder[i].id;
            var elem = this.editor.document.getById(frameId);
            var pclass = elem.getAttribute("presentation_class");
            if(pclass != "notes") {
                if(isFromOtherDocForPasteSlides!=true){
                    //the createNodeDeleteCmd generate an error for the from pasteSlides because backup dom is not having the node yet
                    //coediting
                    msgPairList = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                }
                dojo.destroy(layoutPlaceholder[i]);
            }
        }
        return msgPairList;
    },
    // jmt - Coeditfix
    applyCurrTemplateToSlides:function(slides, msgPairList){
        if(msgPairList==null){
            msgPairList = new Array();
        }
        if(slides!=null && slides.length>0){

            for(var i=0; i< slides.length; i++){
                var slideElem = slides[i];
                var presPageLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
                var tempSlideArray = new Array();
                tempSlideArray.push(slideElem);

                //reuse the applyLayoutForMultiSlidesToScene function to apply layout according to current template
                //only pass in single element array this time.
                msgPairList = this.applyLayoutForMultiSlidesToScene(presPageLayoutName, tempSlideArray,msgPairList, true);

                // jmt - coeditfix
                var attrName = "draw_master-page-name";
                if(presPageLayoutName =="ALT0"){
                    msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, this.currMaster.masterPages[0].name, msgPairList);
                    dojo.attr(slideElem,"draw_master-page-name", this.currMaster.masterPages[0].name);
                } else{
                    msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, this.currMaster.masterPages[1].name, msgPairList);
                    dojo.attr(slideElem,"draw_master-page-name", this.currMaster.masterPages[1].name);
                }
                //update the classes of draw_page also to use master class
                msgPairList = this.updateSlideClassToUseMasterClass(slideElem, msgPairList);

                this.updateSlideObject(slideElem);
            }
        }
        return msgPairList;
    },
    updateSlideClassToUseMasterClass:function(slideElem, msgPairList){
        if(msgPairList==null){
            msgPairList = new Array();
        }
        if(slideElem!=null){
            var presPageLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
            var masterPageName = slideElem.getAttribute("draw_master-page-name");
            var masterDrawPageDiv = masterPageName?document.getElementById(masterPageName):null;
            if(masterDrawPageDiv!=null){
                //jmt - coeditfix
                var masterPageClass = masterDrawPageDiv.className;
                var attrName = "class";
                var newValue =  "draw_page PM1_concord "+masterPageClass.replace(/style_master-page/g,'');
                msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName,newValue, msgPairList);
                //update the classes of draw_page also
                //reset the classname to a clean slate
                slideElem.className = "draw_page PM1_concord";
                //add classes from master
                dojo.addClass(slideElem, masterPageClass);
                //remove unnecessary class from master
                dojo.removeClass(slideElem, "style_master-page");
            }
        }
        return msgPairList;
    },
    // jmt - coeditfix need to verify
    uploadAndUpdateAttachmentUrl:function(slideElem, sourceDocId,cmdList){
        //if from other concord pres, need to upload and update url to images
        //need to see if this is from concord, context is concord
        if(cmdList==null){
            cmdList = new Array();
        }
        if(slideElem!=null){
        var imgs = dojo.query("img", slideElem);
            if(imgs!=null){
                for(var c=0; c<imgs.length; c++){

                    var parentDiv = imgs[c].parentNode;
                    if(!dojo.hasClass(parentDiv, "backgroundImage") && !dojo.hasClass(imgs[c], "defaultContentImage")){ //if this is not a background image
                        var src = dojo.attr(imgs[c],'src');
                        var updatedSrc = src;

                        if (src.indexOf("http") != 0 && src.indexOf("/") != 0) {
                            // A relative URL, check if it starts with "Pictures"
                            //if we know the image is from other ibm docs file, need to upload the image to this file
                            //the way we know it is ibm doc file images, is in the src it starts with: "Pictures/"
                            //meaning the image is stored in the file draft folder under the known Pictures folder
                            var picFolderName = "Pictures/";
                            if(src.indexOf(picFolderName)==0 && sourceDocId !=null){ //if it starts with the picFolderName
                                updatedSrc = "../../"+sourceDocId+"/edit/"+src;
                                var resolvedURL = new dojo._Url(window.location.href, updatedSrc);
                                updatedSrc = resolvedURL.toString(); //this is now absolute url
                            }
                            else if(src.indexOf("data:image")==0){ //handle base64, just return.
                                continue;
                            }

                            else{
                                //now looks like server is putting the copied files not under Pictures, so src="123435546.png"
                                //we need to handle this the same way.
                                updatedSrc = "../../"+sourceDocId+"/edit/"+src;
                                var resolvedURL = new dojo._Url(window.location.href, updatedSrc);
                                updatedSrc = resolvedURL.toString(); //this is now absolute url
                            }

                        }

                        //upload and updated src here , updatedSrc should already contain absolute url here of the source img url
                        var serviceUrl = concord.util.uri.getPasteAttachmentURL();
//                        serviceUrl = concord.main.App.appendSecureToken(serviceUrl);
                        var newSrc = concord.util.uri.getUploadedAttachmentURL(updatedSrc, serviceUrl, imgs[c].id);
                        if(newSrc!= null){
                            //coediting
                            var attrName = "src";
                            cmdList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(imgs[c]), attrName, newSrc, cmdList);

                            dojo.attr(imgs[c],'src',newSrc);
                        }
                    }
                }
            }
        }
        return cmdList;
    },
    /* resolve a url String from master style json template file into a relative path with correct context
    * @param: urlString, a url string from json template file, it may contain relative path like: "../../../../../templateDesignGallery/block/block_styles.css"
     * however, we are going to ignore all the "../" in the path and build from "/templateDesignGallery/.."
     */
    resolveMasterStyleUrl:function(urlString){
        var newUrlString = urlString;
        if(urlString!=null){
            var idxJs = urlString.indexOf("/presTemplateDesignGallery/");
            var idxJs2 = urlString.indexOf("/templateDesignGallery/");
            if(idxJs>=0){
                var subStrUrlString = urlString.substring(idxJs);
                //newUrlString = window.contextPath + window.staticRootPath + subStrUrlString;
                newUrlString = window.contextPath + subStrUrlString;
            }
            if(idxJs2>=0){
                var subStrUrlString = urlString.substring(idxJs+23);
                newUrlString = window.contextPath + "/presTemplateDesignGallery/"+subStrUrlString;
            }

        }
        return newUrlString;
    },
    applyTemplateForEachSlide: function(slideElemIn, templateData, tempDiv, slideWrapperStringArray){
        if(slideWrapperStringArray==null){
            slideWrapperStringArray=[];
        }
        if(slideElemIn!= null && templateData!=null && tempDiv!=null){
            var masterPages = templateData.masterPages;
            if(slideElemIn!=null && slideElemIn.parentNode!=null){
                 var actualSlideElem = slideElemIn;
                 var slideElemId = actualSlideElem.id;
                 var slideContentObj = this.contentHandler.getSlideContent(slideElemId);
                var isSlideLoaded = false;
                if(slideContentObj!=null){
                    isSlideLoaded = slideContentObj.getIsLoaded();
                }
                if(isSlideLoaded == false){
                    var isTemporary = true; //set the flag to just load temporary for applying master style, meaning we don't change the isLoaded flag if isTEmporary is true
                    this.loadSlideToSorter(actualSlideElem, isTemporary);
                }

                //clean spare boxes
                this.removeSpareBoxes(actualSlideElem);

                var slideWrapperClone = actualSlideElem.parentNode.cloneNode(true);
                tempDiv.appendChild(slideWrapperClone);

                var slideElem = dojo.query(".draw_page", slideWrapperClone)[0];

                var slidePageLayout = slideElem.getAttribute("presentation_presentation-page-layout-name");
                //var slideMasterPageName = slideElem.getAttribute("draw_master-page-name");
                var outlineStyle = "";
                //check number of draw_frames object in slideElem that are not background objects (to see if we need to reposition or not)
                //if slide elem has more draw_frames object than the ones from master-page, do not reposition/resize, because we assume
                //user want to keep position and size of objects in slide elem relative to other objects existed in the slide
                //var drawFramesInSlideElem = dojo.query(".draw_frame", slideElem);
                var drawFramesInSlideElem = this.getDirectDrawFrameChildren(slideElem);
                var nonBgImgDrawFramesInSlideElem = [];
                for(var p=0; p<drawFramesInSlideElem.length; p++){
                    if((dojo.attr(drawFramesInSlideElem[p],"draw_layer") == "layout" &&
                       dojo.attr(drawFramesInSlideElem[p],"presentation_class") != "notes") || (dojo.attr(drawFramesInSlideElem[p],"presentation_class") == "graphic")) {
                        nonBgImgDrawFramesInSlideElem.push(drawFramesInSlideElem[p]);
                    }
                }
                var nonBgImageFramesInMasterPage = [];
                if(slidePageLayout == "ALT0"){//if this is a title-subtitle layout, apply masterPages[0]
                     var masterPageName = masterPages[0].name;
                     var masterPageStyle = masterPages[0].style_name;
                     var masterPageLayout = masterPages[0].page_layout_name;
                    //update the mastePageName
                     slideElem.setAttribute("draw_master-page-name", masterPageName);
                     // Defect:39244:can not publish presentation after apply template
                     slideElem.setAttribute("template_style_name", masterPageStyle);
                     //update the class
                     if(masterPageStyle!=null){
                         dojo.addClass(slideElem, masterPageStyle);
                     }
                     if(masterPageLayout!=null){
                         dojo.addClass(slideElem, masterPageLayout);
                     }
                     var frames = masterPages[0].frames;
                     if(frames !=null){
                        //delete the current backgroundImage div if any
                        var backgroundImageDivs = dojo.query(".draw_frame.backgroundImage", slideElem);
                        for(var k=0; k<backgroundImageDivs.length; k++){
                            dojo.destroy(backgroundImageDivs[k]);
                        }

                        //populate nonBgImageFramesInMasterPage
                        for(var j=0; j<frames.length; j++){
                            //var hasBackgroundImageStyle = false;
                            //var styleNames = frames[j].style_name.split(" ");
                            /*for(var sn=0; sn<styleNames.length; sn++){
                                if(styleNames[sn] == "backgroundImage"){
                                    hasBackgroundImageStyle = true;
                                }
                            }*/
                            if(frames[j].used_as == "title" ||frames[j].used_as == "subtitle" ||frames[j].used_as == "outline") {
                                nonBgImageFramesInMasterPage.push(frames[j]);
                            }
                        }
                        for(var j=0; j<frames.length; j++){
                            //nonBgImageFramesInMasterPage.push(frames[j]);
                            if(frames[j].used_as == "backgroundImage"){
                                //take out from nonBgImageFrames array
                                //nonBgImageFramesInMasterPage.pop(frames[j]);
                                //create a div backgroundImage
                                var backgroundImgDiv = dojo.query(dojo.create("div",null, slideElem,"first")).addClass("draw_frame backgroundImage");
                                backgroundImgDiv[0].style.position = "absolute";
                                backgroundImgDiv[0].style.width = frames[j].width;
                                backgroundImgDiv[0].style.height = frames[j].height;
                                backgroundImgDiv[0].style.top = frames[j].top;
                                backgroundImgDiv[0].style.left = frames[j].left;
                                //backgroundImgDiv[0].style.zIndex = "-100";
                                backgroundImgDiv[0].setAttribute("draw_layer", "backgroundobjects");

                                //create image element
                                var imgElem = document.createElement("img");
                                imgElem.src=this.resolveMasterStyleUrl(frames[j].href) + "?file="+this.presBean.getUri();  //adding file parameter for defect #48341, where browser caches the image by a file currently opened, but when the same image used in a new file, browser doesn't get it from server again, and fail to load
                                imgElem.style.width="100%";
                                imgElem.style.height= "100%";

                                //append to backgroundImageDiv
                                backgroundImgDiv[0].appendChild(imgElem);
                                this.setFrameId(backgroundImgDiv[0]);

                            }
                            else if(frames[j].used_as == "title" || frames[j].used_as == "subtitle"){

                                //get current master info for the style/class to be replaced
                                var currMasterId = this.currMaster.masterPages[0].name;
                                var currMasterPageDiv = document.getElementById(currMasterId);
                                var currMasterPageSlideFrames = null;
                                var slideFrames = null;
                                if(frames[j].used_as == "title"){
                                    slideFrames = dojo.query("[presentation_class='title']",slideElem);
                                    currMasterPageSlideFrames = dojo.query("[presentation_class='title']",currMasterPageDiv);
                                }else if(frames[j].used_as == "subtitle"){
                                    slideFrames = dojo.query("[presentation_class='subtitle']",slideElem);
                                    currMasterPageSlideFrames = dojo.query("[presentation_class='subtitle']",currMasterPageDiv);
                                }
                                var style = frames[j].style_name;
                                var width = frames[j].width;
                                var height = frames[j].height;
                                var left = frames[j].left;
                                var top = frames[j].top;
                                var pfs = frames[j].pfs;
                                if(slideFrames!=null && slideFrames.length>0){
                                    for(var x=0; x <slideFrames.length; x++ ){
                                        var slideFrame = slideFrames[x];
                                        var slideFrameClassesDiv = dojo.query(".draw_frame_classes",slideFrame );
                                        if(slideFrameClassesDiv!=null && slideFrameClassesDiv.length>0){
                                            dojo.addClass(slideFrameClassesDiv[0], style);
                                        }
                                        //if the slide elem contains other objects/frames more than what defined in master page
                                        //meaning the slide contains user added objects
                                        //do not resize/reposition
                                        //only do the resize/reposition when the objects in slide elem is not exceeding the number of objects in master page (do not contains user added objects)
                                        //the idea is that if user added more objects to the slide, user already position and size each objects in relative to these other objects
                                        //so we are not repositioning according to master page
                                        if(nonBgImgDrawFramesInSlideElem.length <=nonBgImageFramesInMasterPage.length){
                                            slideFrame.style.width = width;
                                            slideFrame.style.height = height;
                                            slideFrame.style.left = left;
                                            slideFrame.style.top = top;
                                            slideFrame.setAttribute("pfs", pfs);
                                        }
                                    }
                                }

                            } else if(frames[j].used_as == "footer" || frames[j].used_as == "date-time" || frames[j].used_as == "page-number"){
                                var slideFrames = null;
                                if(frames[j].used_as == "footer"){
                                    slideFrames = dojo.query("[presentation_class='footer']",slideElem);
                                }else if(frames[j].used_as == "date-time"){
                                    slideFrames = dojo.query("[presentation_class='date-time']",slideElem);
                                }else if(frames[j].used_as == "page-number"){
                                    slideFrames = dojo.query("[presentation_class='page-number']",slideElem);
                                }
                                var width = frames[j].width;
                                var height = frames[j].height;
                                var left = frames[j].left;
                                var top = frames[j].top;
                                var pfs = frames[j].pfs;
                                var styleClass = frames[j].style_name;
                                if(slideFrames!=null && slideFrames.length>0){
                                    for(var x=0; x <slideFrames.length; x++ ){
                                        var slideFrame = slideFrames[x];
                                        //we want to remove the in-line style for the footer fields
                                        //and we want to add our msaterStyle classes on the text_p nodes
                                        dojo.query(".text_p",slideFrame).forEach(function(node, index, arr){
                                            dojo.addClass(node, styleClass);
                                        });

                                        slideFrame.style.width = width;
                                        slideFrame.style.height = height;
                                        slideFrame.style.left = left;
                                        slideFrame.style.top = top;
                                        slideFrame.setAttribute("pfs", pfs);
                                    }
                                }
                            }
                     	}
                     }
                }else{ //other layouts use the second master page definition
                    var masterPageName = masterPages[1].name;
                    var masterPageStyle = masterPages[1].style_name;
                    var masterPageLayout = masterPages[1].page_layout_name;
                    //update the mastePageName
                     slideElem.setAttribute("draw_master-page-name", masterPageName);
                     slideElem.setAttribute("template_style_name", masterPageStyle);
                     //update the class
                     if(masterPageStyle!=null){
                         dojo.addClass(slideElem, masterPageStyle);
                     }
                     if(masterPageLayout!=null){
                         dojo.addClass(slideElem, masterPageLayout);
                     }
                     var frames = masterPages[1].frames;
                     if(frames !=null){
                         var nonBgImageFramesInMasterPage = [];

                         //delete the current backgroundImage div if any
                        var backgroundImageDivs = dojo.query(".draw_frame.backgroundImage", slideElem);
                        for(var k=0; k<backgroundImageDivs.length; k++){
                            dojo.destroy(backgroundImageDivs[k]);
                        }

                        //populate nonBgImageFramesInMasterPage
                        for(var j=0; j<frames.length; j++){
                            var hasBackgroundImageStyle = false;
                            var styleNames = frames[j].style_name.split(" ");
                            for(var sn=0; sn<styleNames.length; sn++){
                                if(styleNames[sn] == "backgroundImage"){
                                    hasBackgroundImageStyle = true;
                                }
                            }
                            if(frames[j].used_as == "title" ||frames[j].used_as == "subtitle" ||frames[j].used_as == "outline"){
                                nonBgImageFramesInMasterPage.push(frames[j]);
                            }
                        }
                         for(var j=0; j<frames.length; j++){
                             var hasBackgroundImageStyle = false;
                                var styleNames = frames[j].style_name.split(" ");
                                for(var sn=0; sn<styleNames.length; sn++){
                                    if(styleNames[sn] == "backgroundImage"){
                                        hasBackgroundImageStyle = true;
                                    }
                                }
                             if(frames[j].used_as == "backgroundImage" ){
                                //create a div backgroundImage
                                var backgroundImgDiv = dojo.query(dojo.create("div",null, slideElem,"first")).addClass("draw_frame backgroundImage");
                                backgroundImgDiv[0].style.position = "absolute";
                                backgroundImgDiv[0].style.width = frames[j].width;
                                backgroundImgDiv[0].style.height = frames[j].height;
                                backgroundImgDiv[0].style.top = frames[j].top;
                                backgroundImgDiv[0].style.left = frames[j].left;
                                //backgroundImgDiv[0].style.zIndex = "-100";
                                backgroundImgDiv[0].setAttribute("draw_layer", "backgroundobjects");

                                //create image element
                                var imgElem = document.createElement("img");
                                imgElem.src=this.resolveMasterStyleUrl(frames[j].href)  + "?file="+this.presBean.getUri();
                                imgElem.style.width="100%";
                                imgElem.style.height= "100%";

                                //append to backgroundImageDiv
                                backgroundImgDiv[0].appendChild(imgElem);
                                this.setFrameId(backgroundImgDiv[0]);
                            }
                            else if(frames[j].used_as == "title" || frames[j].used_as == "outline"){

                                //get current master info for the style/class to be replaced
                                var currMasterId = this.currMaster.masterPages[1].name;
                                var currMasterPageDiv = document.getElementById(currMasterId);
                                var currMasterPageSlideFrames = null;
                                var pageLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");

                                var slideFrames = null;
                                if(frames[j].used_as == "title"){
                                    slideFrames = dojo.query("[presentation_class='title']",slideElem);
                                    currMasterPageSlideFrames = dojo.query("[presentation_class='title']",currMasterPageDiv);
                                }else if(frames[j].used_as == "outline"){
                                    slideFrames = dojo.query("[presentation_class='outline']",slideElem);
                                    currMasterPageSlideFrames = dojo.query("[presentation_class='outline']",currMasterPageDiv);
                                }
                                var style = frames[j].style_name;
                                var width = frames[j].width;
                                var height = frames[j].height;
                                var left = frames[j].left;
                                var top = frames[j].top;
                                var pfs = frames[j].pfs;
                                outlineStyle = style;
                                if(slideFrames!=null && slideFrames.length>0){
                                    for(var x=0; x <slideFrames.length; x++ ){
                                        var slideFrame = slideFrames[x];
                                        slideFrame.setAttribute("pfs", pfs);
                                        var slideFrameClassesDiv = dojo.query(".draw_frame_classes",slideFrame );
                                        if(slideFrameClassesDiv!=null && slideFrameClassesDiv.length>0){
                                            dojo.addClass(slideFrameClassesDiv[0], style);
                                        }
                                        //adjust position only for title frame, and ALT1 layout outline frame
                                        //for other layouts outline frame position and size are determined by layout not by template
                                        if((pageLayoutName =="ALT1"||pageLayoutName =="ALT1-RTL") && (slideFrame.getAttribute("presentation_class")=="title" ||  slideFrame.getAttribute("presentation_class")=="outline")){
                                            //if the slide elem contains other objects/frames more than what defined in master page
                                            //meaning the slide contains user added objects
                                            //do not resize/reposition
                                            //only do the resize/reposition when the objects in slide elem is not exceeding the number of objects in master page (do not contains user added objects)
                                            //the idea is that if user added more objects to the slide, user already position and size each objects in relative to these other objects
                                            //so we are not repositioning according to master page
                                            //defect 13469 - we reposition title
                                            if((nonBgImgDrawFramesInSlideElem.length <=nonBgImageFramesInMasterPage.length)|| (dojo.attr(slideFrame, "presentation_class")=="title")){
                                                slideFrame.style.width = width;
                                                slideFrame.style.height = height;
                                                slideFrame.style.left = left;
                                                slideFrame.style.top = top;
                                            }
                                        }
                                        //only adjust the height and top position of the title of other layouts
                                        //#11550, need to adjust left and width also.
                                        else if(slideFrame.getAttribute("presentation_class")=="title"){
                                            slideFrame.style.height = height;
                                            slideFrame.style.top = top;
                                            slideFrame.style.left = left;
                                            slideFrame.style.width = width;
                                        }
                                    }

                                }

                            } else if(frames[j].used_as == "footer" || frames[j].used_as == "date-time" || frames[j].used_as == "page-number"){
                                var slideFrames = null;
                                if(frames[j].used_as == "footer"){
                                    slideFrames = dojo.query("[presentation_class='footer']",slideElem);
                                }else if(frames[j].used_as == "date-time"){
                                    slideFrames = dojo.query("[presentation_class='date-time']",slideElem);
                                }else if(frames[j].used_as == "page-number"){
                                    slideFrames = dojo.query("[presentation_class='page-number']",slideElem);
                                }
                                var width = frames[j].width;
                                var height = frames[j].height;
                                var left = frames[j].left;
                                var top = frames[j].top;
                                var pfs = frames[j].pfs;
                                var styleClass = frames[j].style_name;
                                if(slideFrames!=null && slideFrames.length>0){
                                    for(var x=0; x <slideFrames.length; x++ ){
                                        var slideFrame = slideFrames[x];
                                        //we want to remove the in-line style for the footer fields
                                        //and we want to add our msaterStyle classes on the text_p nodes
                                        dojo.query(".text_p",slideFrame).forEach(function(node, index, arr){
                                            dojo.addClass(node, styleClass);
                                        });

                                        slideFrame.style.width = width;
                                        slideFrame.style.height = height;
                                        slideFrame.style.left = left;
                                        slideFrame.style.top = top;
                                        slideFrame.setAttribute("pfs", pfs);
                                    }
                                }
                            }
                         }

                     }
                }
                //add other presentation class and defined as a backgroundImage in the class/style_name, just grab it and append it
                //need to loop from the end of the draw_frame lists from master template data
                 //if other presentation class and defined as a backgroundImage in the class/style_name, just grab it and append it
                for(var j=frames.length-1; j>=0; j--){
                     var hasBackgroundImageStyle = false;
       				var styleNames = frames[j].style_name.split(" ");
       				for(var sn=0; sn<styleNames.length; sn++){
       					if(styleNames[sn] == "backgroundImage"){
       						hasBackgroundImageStyle = true;
       					}
       				}
                     if(hasBackgroundImageStyle == true &&
                             (frames[j].used_as != "backgroundImage" && frames[j].used_as != "title" && frames[j].used_as != "outline" && frames[j].used_as != "subtitle"
                                 && frames[j].used_as != "header" && frames[j].used_as != "footer" && frames[j].used_as != "date-time" && frames[j].used_as != "page-number")){
                         var html = frames[j].html;
                         var element = document.createElement("div");
                         element.innerHTML = html;
                         if(slideElem.firstChild!=null){
                             slideElem.insertBefore(element.firstChild, slideElem.firstChild);
                         }else{
                             slideElem.appendChild(element.firstChild);
                         }

                         dojo.destroy(element);
                     }
       		}

                //add outline style to imgContainer layout placehorder text
                var imgLayoutContainers = dojo.query(".imgContainer", slideElem);
                if(imgLayoutContainers!=null && outlineStyle.length>0){
                    for(var u=0; u<imgLayoutContainers.length; u++){
                        dojo.addClass(imgLayoutContainers[u].parentNode,outlineStyle);
                        //if(  outlineStyle != this.currMasterFrameStylesJSON.text_outline ){
                        if(outlineStyle.indexOf(this.currMasterFrameStylesJSON.text_outline)>=0 ||this.currMasterFrameStylesJSON.text_outline.indexOf(outlineStyle)>=0 ){
                            dojo.removeClass(imgLayoutContainers[u].parentNode, this.currMasterFrameStylesJSON.text_outline);
                        }
                    }
                }

                /*
                //add default text style if any to the header, pagenumber, date-time, and footer frame
                var utilPresClassStringArray = ["header","page-number","date-time","footer"];
                for(var m=0; m<utilPresClassStringArray.length; m++){
                    var utilFrames = dojo.query("[presentation_class='"+utilPresClassStringArray[m]+"']",slideElem);
                    if(utilFrames!=null && utilFrames.length>0){
                        for(var p=0; p<utilFrames.length; p++){
                            var drawFrameClassesDiv = dojo.query(".draw_frame_classes", utilFrames[p]);
                            if(drawFrameClassesDiv!=null && drawFrameClassesDiv.length>0){
                                var pageLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
                                if(pageLayoutName=="ALT0"){
                                    dojo.addClass(drawFrameClassesDiv[0], defaultTitlePageStyle);
                                    dojo.removeClass(drawFrameClassesDiv[0], this.currMasterFrameStylesJSON.default_title);
                                }else{
                                    dojo.addClass(drawFrameClassesDiv[0], defaultTextPageStyle);
                                    dojo.removeClass(drawFrameClassesDiv[0], this.currMasterFrameStylesJSON.default_text);
                                }
                            }
                        }
                    }
                }
                */

                //add default text style if any to the unknown frames (presentation_class is not defined
                /*
                //Defect 9767, sometimes there are slide level style that sets background color
                //may be assigning defaultTExtStyle(retrieved from draw_page style) is not a good idea
                var unknownFrames = new Array();
                var slideFrames = dojo.query(".draw_frame",slideElem);
                for(var p=0; p < slideFrames.length; p++){
                    var presClass = slideFrames[p].getAttribute("presentation_class");
                    if(presClass == null || presClass == ""){
                        unknownFrames.push(slideFrames[p]);
                    }
                }
                if(unknownFrames!=null && unknownFrames.length>0){
                    for(var x=0; x <unknownFrames.length; x++ ){
       				var slideFrame = unknownFrames[x];
       				var defaultTextStyle = slideFrame.parentNode.getAttribute("template_style_name");
       				//add default style to draw_frame_classes div and table
       				var slideFrameClassesDiv = dojo.query(".draw_frame_classes",slideFrame );
       				if(slideFrameClassesDiv!=null && slideFrameClassesDiv.length>0 ){
                                //Defect 9767, sometimes there are slide level style that sets background color
                                //may be assigning defaultTExtStyle(retrieved from draw_page style) is not a good idea
                                //dojo.addClass(slideFrameClassesDiv[0],defaultTextStyle);
       				}
       				var tableElems = dojo.query(".table_table", slideFrame);
       				if(tableElems!=null && tableElems.length>0 ){
       					dojo.addClass(tableElems[0],defaultTextStyle);
       				}

                    }

                }
                */

                var newMasterName = templateData.masterName;
                if(this.currMaster.masterName != newMasterName){
                    this.removeCurrentMasterStyles(slideElem);
                }
                //this.checkNcreateBackgroundImageDivFromCss(slideElem, null, null);

                //reset the actual slide elem with the slideElem from tempDiv
                var slideWrapper = actualSlideElem.parentNode;

                if(slideWrapper!=null){
                    //need to handle destroying the drawPage to handle memory leak
                    this.disconnectEvents(actualSlideElem);
                    dojo.destroy(actualSlideElem);
                    actualSlideElem = null;
                    slideWrapper.innerHTML = slideWrapperClone.innerHTML;
                }
                actualSlideElem = dojo.query(".draw_page", slideWrapper)[0]; //actualSlideElem object was reset by the slideWrapper.innerHTML, need to regain the object
                this.connectEvents(actualSlideElem);
                //unload the slide content, populate back the contentHandler storage
                
                // Update customize font size(inline style or css has font-size)
                // Slide sorter slide base font size
                var fontSizeFor18Pts = dojo.style(actualSlideElem,'fontSize');
                if (fontSizeFor18Pts)
                    fontSizeFor18Pts = PresFontUtil._stripPxFromFontSize(fontSizeFor18Pts);
                dojo.query('span,li,p,ul,ol,table,tr,td', actualSlideElem).forEach(function(node) {
                    var existingFontSize = node.style.fontSize;
                    if(existingFontSize){
                        var ptFontSize = PresFontUtil.getPtFontSize(node);
                        var newEmFontSize = PresFontUtil.getCalcEmFromPt(ptFontSize, [node], fontSizeFor18Pts);
                        if (newEmFontSize && newEmFontSize[0])
                            dojo.style(node, 'fontSize', newEmFontSize[0]);
                    }
                });

                var isReset = false;
                if(isSlideLoaded!=true){ //if it is not loaded before the apply template, unload and reset it
                        isReset = true;
                }
                this.updateSlideObject(actualSlideElem);
                this.unloadSlideFromSorter(actualSlideElem, isReset);

                //remove slide wrapper style (coediting indicator) for the string Array
                dojo.style(slideWrapperClone, {"border": "none"});
                //remove slideUtil div
                var slideWrapperArray = [];
                slideWrapperArray.push(slideWrapperClone);
                this.removeSlideUtilDiv(slideWrapperArray);

                //save the processed slideWrapper to the slideWrapperStringArray
                slideWrapperStringArray[slideElemId]=tempDiv.innerHTML;

                //clean up tempDiv
                dojo.destroy(slideWrapperClone);
                dojo.empty(tempDiv);
             } //end if parentNode!=null
        }//end if everything not null
        return slideWrapperStringArray;
    },
    _applyTemplateContinue: function(tempDiv, templateData, isFromUndo, slideWrapperStringArray){
        if(slideWrapperStringArray==null){
            slideWrapperStringArray=[];
        }
        if(tempDiv!= null && templateData!=null && slideWrapperStringArray!=null){
            //process the rest of the slides.
            var unloadedSlides = this.getUnloadedSlides();
            for(var uls in unloadedSlides){
                slideWrapperStringArray=this.applyTemplateForEachSlide(unloadedSlides[uls], templateData, tempDiv, slideWrapperStringArray);
            }
            //destroy tempDiv - cleanup for memory leak
            document.body.appendChild(tempDiv);

            dojo.destroy(tempDiv);
            if(!isFromUndo){
                //record for undo
                var data = new Object();
      			data.newTemplateDataJSONStr = dojo.toJson(templateData);
      			data.prevTemplateDataJSONStr = this.currMaster.masterTemplateDataJSONStr;
      			SYNCMSG.recordApplyTemplateMessageUndo(data);
            }
            //add template to master hidden div for create new slides
            this.createMasterHtml(templateData);

            //set the slideWrapperStringArray into the correct slides order
            var slideWrapperStringArrayInOrder = this.orderSlidesWrapperStringArray(slideWrapperStringArray);
            var contentHtml = this.getSlideSorterPresContentHtml(slideWrapperStringArrayInOrder);
            slideWrapperStringArray=null;
            //this.currentScene.saveDraft();
            //coediting set reset content message
            //jmt - coedit fix
            //var msgPairList = SYNCMSG.createContentResetMsg('resetContent', []);

            var msgPairList = SYNCMSG.createResetContentMsg(MSGUTIL.msgType.ResetContent, [], null, contentHtml);
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);

            //refresh slides object
            this.refreshSlidesObject();

            //save template master to master.html
            this.saveMasterToFile();
        }
    },
    applyTemplate:function(slideId, templateData, isFromUndo){
        //slideId is used to select the slide after applying template so slide Editor get a refresh
        if(templateData!=null){
            //inject masterStylesCss
            var masterStylesCss = this.resolveMasterStyleUrl(templateData.masterStylecss);
            var prevMasterStylesCss =this.currMasterFrameStylesJSON.masterStyleCss;
            var cssFiles = new Array();
            if((masterStylesCss !=null || masterStylesCss !="") && masterStylesCss != prevMasterStylesCss){
                //#15511 - remove previous first then inject new one
                //if inject first then remove, if we are applying same master style, the injected css is going to be removed.
                if(prevMasterStylesCss!=null){
                    var officeStyleIdx = prevMasterStylesCss.indexOf("office_styles.css");
                    var officeAutoStyleIdx = prevMasterStylesCss.indexOf("office_automatic_styles.css");
                    if(officeStyleIdx<0 && officeAutoStyleIdx<0){
                        //D14414: [Regression][MasterStyle] Font color is not black after switch back to default template.
                        prevMasterStylesCss = concord.util.uri.stripRelativePathInfo(prevMasterStylesCss);
                        concord.util.uri.removeCSS (this.editor.document.$, prevMasterStylesCss);
                    }
                }
                concord.util.uri.injectCSS (this.editor.document.$,masterStylesCss,false);

                //publish css injected event
                cssFiles.push(masterStylesCss);
                var eventData = [{eventName: 'templateApplied',cssFiles:cssFiles,templateData:templateData}];
                dojo.publish(concord.util.events.slideSorterEvents, eventData);
            }
            slideWrapperStringArray=[]; //array to store processed slideWrapper to be used for building the new content html
            //create a tempDiv to temporary put a slideWrapper to be processed outside of the document's dom
            //this is to make dom manipulation to be more efficient
            var tempDiv = document.createElement("div");
            tempDiv.style.display= "none";

            //process selected slide first to let user quickly view the changes
            var slideSelectedCurently = null;

            if(slideId !=null){
                slideSelectedCurrently = this.editor.document.$.getElementById(slideId);
                slideWrapperStringArray=this.applyTemplateForEachSlide(slideSelectedCurrently, templateData, tempDiv,slideWrapperStringArray);
                //because of applyTemplateForEachSlide, it replaces the slide dom node, need to update reference to new object
                slideSelectedCurrently = this.editor.document.$.getElementById(slideId);
                //send slideSelected to slide Editor for faster viewing
                this.simulateSlideClick(slideSelectedCurrently);
            }

            //process loaded slides first to let user view the changes in the viewable slides
            setTimeout(dojo.hitch(this,function() {
                var loadedSlides = this.getLoadedSlides();

                //remove the selected slide since it is already processed above
                delete loadedSlides[slideId];

                for(var ls in loadedSlides){
                    slideWrapperStringArray=this.applyTemplateForEachSlide(loadedSlides[ls], templateData, tempDiv,slideWrapperStringArray);
                }

                //need to continue apply template, the rest of the process should be in set timeout to work around ie so that the simulate slideclick previously to load slide to editor runs first
                //for performance defect where previously in IE for large presentation it took so long to see the changes in the slideEditor
                //ie doesn't quite handle the publish event as asynch, seems like keep waiting for this process to continue then the effect of simulate slide click set before is displayed
                //by setTimout, it forces ie to finish run the simulateSlideClick publishing to slideEditor first then run the rest of the process needed in this apply template function
                this._applyTemplateContinue(tempDiv, templateData, isFromUndo,slideWrapperStringArray);

            }, null), 200);
        }
    },
    /*
    _getAssociativeArraySize: function(myArray) {
        var size = 0, key;
        for (key in myArray) {
            if (myArray.hasOwnProperty(key)) size++;
        }
        return size;
    },
    */

    //@param slideWrapperStringArray is a named array, key is slideId
    orderSlidesWrapperStringArray:function(slideWrapperStringArray){
        var slideWrapperStrInOrder = [];
        if(slideWrapperStringArray!=null){
            var thumbnails = dojo.query(".draw_page", this.getSorterDocument());
            for(var i=0; i<thumbnails.length; i++){
                var slideId = thumbnails[i].id;
                var slideWrapperStr = slideWrapperStringArray[slideId];
                slideWrapperStrInOrder.push(slideWrapperStr);
            }
        }
        return slideWrapperStrInOrder;
    },
    getMasterFrameStyle: function(masterPageId, presentationClassString){

        var styleName = "";
        if(masterPageId !=null && presentationClassString != null &&
                (presentationClassString=='title' ||
                 presentationClassString=='subtitle'||
                 presentationClassString=='outline'||
                 presentationClassString=='footer'||
                 presentationClassString=='page-number'||
                 presentationClassString=='date-time')){
            var currMasterPageDiv = document.getElementById(masterPageId);
            var currMasterPageSlideFrames = null;

         	// D31037 [Chrome29]There is not thumbnail in slide shorter on Chrome29
        	var masterDiv = dojo.byId("masterHtmlDiv");
        	var tmp = dojo.query("#" + masterPageId, masterDiv)[0];
        	currMasterPageSlideFrames = dojo.query("[presentation_class='" + presentationClassString + "']", tmp);
            if(currMasterPageSlideFrames !=null && currMasterPageSlideFrames.length>0){
                var currMasterClassStr = dojo.trim(currMasterPageSlideFrames[0].className);
                var currMasterClassArray = currMasterClassStr.split(" ");
                if(currMasterClassArray!=null){
                    for(var i=1; i<currMasterClassArray.length; i++){ //the first one we want to ignore:"draw_frame"
                        styleName = styleName + " "+currMasterClassArray[i];
                    }
                }
            }
        }else if(masterPageId !=null && presentationClassString != null && presentationClassString == ""){
            var currMasterPageDiv = document.getElementById(masterPageId);
            if(currMasterPageDiv!=null){ //17310, due to weird characters in masterPageId, it may not find it, adding null check to avoid errorring out
                styleName = currMasterPageDiv.getAttribute("style_name");
            }
        }else if(masterPageId !=null && presentationClassString != null && presentationClassString == "draw_page"){
            var currMasterPageDiv = document.getElementById(masterPageId);
            if(currMasterPageDiv!=null){ //17310, due to weird characters in masterPageId, it may not find it, adding null check to avoid errorring out
                var styleNameTemp = dojo.trim(currMasterPageDiv.className);
                var styleNameTempArray = styleNameTemp.split(" ");
                if(styleNameTempArray!=null){
                    for(var i=1; i<styleNameTempArray.length; i++){  //the first one we want to ignore:"style_master-page"
                        styleName = styleName + " "+styleNameTempArray[i];
                    }
                }
            }

        }
        styleName = dojo.trim(styleName);
        return styleName;

    },
    removeCurrentMasterStylesByMasterStylesJSON:function(masterStylesJSONForFrame, slideElem){
        if(masterStylesJSONForFrame!=null){
            if(slideElem==null){
                slideElem = this.editor.document.$;
            }
            var masterStylesClassArray = masterStylesJSONForFrame.split(" ");
            for(var j=0; j<masterStylesClassArray.length; j++){
                var frameStyleDivs = dojo.query("."+masterStylesClassArray[j], slideElem);
                for(var i=0; i<frameStyleDivs.length; i++ ){
                    dojo.removeClass(frameStyleDivs[i],masterStylesClassArray[j]);
                }
            }
        }
    },
    removeCurrentMasterStyles:function(slideElem){
        //all the style we replace during apply templates are stored in this.currMasterFrameStylesJSON
        var slideElemWrapper = null;
        if(slideElem==null){
            slideElem = this.editor.document.$;
            slideElemWrapper = this.editor.document.$;;
        }else{
            slideElemWrapper = slideElem.parentNode;
        }
        //remove the title page title style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.title, slideElem);
        /*
        var masterStylesClassArray = this.currMasterFrameStylesJSON.title.split(" ");
        for(var j=0; j<masterStylesClassArray.length; j++){
            var titleStyleDivs = dojo.query("."+masterStylesClassArray[j], this.editor.document.$);
            for(var i=0; i<titleStyleDivs.length; i++ ){
                dojo.removeClass(titleStyleDivs[i],masterStylesClassArray[j]);
            }
        }
        */

        //remove subtitle style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.subtitle, slideElem);
        /*
        var subtitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.subtitle, this.editor.document.$);
        for(var i=0; i<subtitleStyleDivs.length; i++ ){
            dojo.removeClass(subtitleStyleDivs[i],this.currMasterFrameStylesJSON.subtitle);
        }
        */

        //remove text-title style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_title, slideElem);
        /*
        var textTitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.text_title, this.editor.document.$);
        for(var i=0; i<textTitleStyleDivs.length; i++ ){
            dojo.removeClass(textTitleStyleDivs[i],this.currMasterFrameStylesJSON.text_title);
        }
        */
        //remove text-outline style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_outline, slideElem);
        /*
        var textOutlineStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.text_outline, this.editor.document.$);
        for(var i=0; i<textOutlineStyleDivs.length; i++ ){
            dojo.removeClass(textOutlineStyleDivs[i],this.currMasterFrameStylesJSON.text_outline);
        }
        */
        //remove default title style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.default_title, slideElem);
        /*
        var defaultTitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.default_title, this.editor.document.$);
        for(var i=0; i<defaultTitleStyleDivs.length; i++ ){
            dojo.removeClass(defaultTitleStyleDivs[i],this.currMasterFrameStylesJSON.default_title);
        }
        */
        //remove default text style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.default_text, slideElem);

        //for title frame
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.footer, slideElem);
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.datetime, slideElem);
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.pagenumber, slideElem);

        //do the same for the text frames
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_footer, slideElem);
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_datetime, slideElem);
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_pagenumber, slideElem);


        /*
        var defaultTextStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.default_text, this.editor.document.$);
        for(var i=0; i<defaultTextStyleDivs.length; i++ ){
            dojo.removeClass(defaultTextStyleDivs[i],this.currMasterFrameStylesJSON.default_text);
        }
        */
        //remove draw_page style
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.draw_page_title, slideElemWrapper);
        this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.draw_page_text, slideElemWrapper);

    //****************
    /*
        //remove title style from ALT0 layout
        var presClassString = "title";
        var layoutName = "ALT0";
        this.removeCurrentMasterStyleForPresClass(presClassString, layoutName);
        //remove title style from other layout
        this.removeCurrentMasterStyleForPresClass(presClassString);
        //remove subtitle style
        presClassString = "subtitle";
        this.removeCurrentMasterStyleForPresClass(presClassString);
        //remove outline style
        presClassString = "outline";
        this.removeCurrentMasterStyleForPresClass(presClassString);
        //remove unknown frame style
        presClassString = "";
        this.removeCurrentMasterStyleForPresClass(presClassString);

        //remove styles from draw_page level too
        var drawPages = dojo.query(".draw_page", this.editor.document.$);
        var styleName = this.currMasterFrameStylesJSON.default_text;
        for(var i=0; i < drawPages.length; i++){
            dojo.removeClass(drawPages[i], styleName);
        }
        //remove default text style from everywhere (include <table> and presentation_class attr is null (i.e. custom text box)
        var defaultTextElems = dojo.query("."+styleName, this.editor.document.$);
        for(var i=0; i < defaultTextElems.length; i++){
            dojo.removeClass(defaultTextElems[i], styleName);
        }
        */
        /*
         * commmented out because we don't want to remove original styles that may be used in the slides like MDP52, dp1, etc.
        //remove master style css link from head
        var masterStyleCss = this.currMasterFrameStylesJSON.masterStyleCss;
        var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$);
        if(linkNodeList!=null){
            for(var i = 0; i<linkNodeList.length; i++){
                if(linkNodeList[i].href.indexOf(masterStyleCss)>=0){
                    dojo.destroy(linkNodeList[i]);
                }
            }
        }
        */

    },
    removeCurrentMasterStyleForPresClass: function(presClassString, layoutName){
        var drawFrames = dojo.query("[presentation_class='"+presClassString+"']", this.editor.document.$);
        var styleName = "";
        if(presClassString == "subtitle"){
            styleName = this.currMasterFrameStylesJSON.subtitle;
        }
        else if(presClassString == "outline"){
            styleName = this.currMasterFrameStylesJSON.text_outline;
        }
        else if(presClassString == "title" && layoutName!=null && layoutName == "ALT0"){
            styleName = this.currMasterFrameStylesJSON.title;
        }
        else if(presClassString == "title"){
            styleName = this.currMasterFrameStylesJSON.text_title;
        }
        else if(presClassString == "footer"){
            if(layoutName!=null && layoutName == "ALT0")
                styleName = this.currMasterFrameStylesJSON.footer;
            else
                styleName = this.currMasterFrameStylesJSON.text_footer;
        }
        else if(presClassString == "date-time"){
            if(layoutName!=null && layoutName == "ALT0")
                styleName = this.currMasterFrameStylesJSON.datetime;
            else
                styleName = this.currMasterFrameStylesJSON.text_datetime;
        }
        else if(presClassString == "page-number"){
            if(layoutName!=null && layoutName == "ALT0")
                styleName = this.currMasterFrameStylesJSON.pagenumber;
            else
                styleName = this.currMasterFrameStylesJSON.text_pagenumber;
        }
        else if(presClassString == ""){
            styleName = this.currMasterFrameStylesJSON.default_text;
        }
        for(var i=0; i < drawFrames.length; i++){
            //remove the stylename from div that has draw_frame_classes
            var drawFrameClassesDivs = dojo.query(".draw_frame_classes", drawFrames[i]);
            if(drawFrameClassesDivs !=null && drawFrameClassesDivs.length>0){
                dojo.removeClass(drawFrameClassesDivs[0], styleName);
            }
        }
        //remove it from draw_frame too
        for(var i=0; i < drawFrames.length; i++){
            dojo.removeClass(drawFrames[i], styleName);
        }

    },

    getCurrentMasterStyles:function(masterStyleCss){
        var currMasterStylesJson = {};
        currMasterStylesJson.draw_page_title = "";
        currMasterStylesJson.draw_page_text = "";
        currMasterStylesJson.title = "";
        currMasterStylesJson.subtitle = "";
        currMasterStylesJson.text_title = "";
        currMasterStylesJson.text_outline = "";
        currMasterStylesJson.default_title = "";
        currMasterStylesJson.default_text = "";
        currMasterStylesJson.masterStyleCss = "";
        currMasterStylesJson.footer = "";
        currMasterStylesJson.pagenumber = "";
        currMasterStylesJson.datetime = "";
        currMasterStylesJson.text_footer = "";
        currMasterStylesJson.text_pagenumber = "";
        currMasterStylesJson.text_datetime = "";

        //retrieve from currMasterDiv
        //process title page master first
        var currMasterId = this.currMaster.masterPages[0].name;
        //get title
        var presClassString = "title";
        currMasterStylesJson.title= this.getMasterFrameStyle(currMasterId, presClassString);

        //get subtitle
        var presClassString = "subtitle";
        currMasterStylesJson.subtitle=this.getMasterFrameStyle(currMasterId, presClassString);

        //get footer
        var presClassString = "footer";
        currMasterStylesJson.footer = this.getMasterFrameStyle(currMasterId, presClassString);

        //get date-time
        var presClassString = "date-time";
        currMasterStylesJson.datetime = this.getMasterFrameStyle(currMasterId, presClassString);

        //get page-number
        var presClassString = "page-number";
        currMasterStylesJson.pagenumber = this.getMasterFrameStyle(currMasterId, presClassString);

        //get default title
        var presClassString = "";
        currMasterStylesJson.default_title=this.getMasterFrameStyle(currMasterId, presClassString);
        if(currMasterStylesJson.default_title == null || currMasterStylesJson.default_title == ""){
            currMasterStylesJson.default_title = "standard";
        }
        //get draw_page styles
        var presClassString = "draw_page";
        currMasterStylesJson.draw_page_title=this.getMasterFrameStyle(currMasterId, presClassString);

        //process outline page master
        currMasterId = this.currMaster.masterPages[1].name;
        //get title
        var presClassString = "title";
        currMasterStylesJson.text_title=this.getMasterFrameStyle(currMasterId, presClassString);

        //get outline
        var presClassString = "outline";
        currMasterStylesJson.text_outline=this.getMasterFrameStyle(currMasterId, presClassString);

        //get footer
        var presClassString = "footer";
        currMasterStylesJson.text_footer = this.getMasterFrameStyle(currMasterId, presClassString);

        //get date-time
        var presClassString = "date-time";
        currMasterStylesJson.text_datetime = this.getMasterFrameStyle(currMasterId, presClassString);

        //get page-number
        var presClassString = "page-number";
        currMasterStylesJson.text_pagenumber = this.getMasterFrameStyle(currMasterId, presClassString);

        //get default text
        var presClassString = "";
        currMasterStylesJson.default_text=this.getMasterFrameStyle(currMasterId, presClassString);
        if(currMasterStylesJson.default_text == null || currMasterStylesJson.default_text == ""){
            currMasterStylesJson.default_text = "standard";
        }
        //get draw_page styles
        var presClassString = "draw_page";
        currMasterStylesJson.draw_page_text=this.getMasterFrameStyle(currMasterId, presClassString);

        if(masterStyleCss!=null){
            currMasterStylesJson.masterStyleCss = masterStyleCss;
        }

        return currMasterStylesJson;

    },

    createMasterHtml:function(templateData){
        if(templateData!=null){
            var masterHiddenDiv = document.getElementById(this.masterHtmlDivId);
            var masterPages = templateData.masterPages;
            var masterStyleCss = this.resolveMasterStyleUrl(templateData.masterStylecss);

            //template always contains 2 master pages, 1 for title-subtitle(layout ALT0) page and 1 for title-outline (layout ALT1) page
            if(masterHiddenDiv!=null && masterPages!=null && masterPages.length>0){

                for(var i=masterPages.length-1; i>=0; i--){
                    //create master page div
                    var name = masterPages[i].name;
                    var style_name = masterPages[i].style_name;
                    var page_layout_name = masterPages[i].page_layout_name;
                    var display_name = masterPages[i].display_name;
                    /*
                    //15340, commenting following code,we need to re-create the master page,
                    //to accomodate version changes in master page style that was previously used in document
                    //var divQuery = document.getElementById(name);
                    var divQuery1 = dojo.query("#"+name, masterHiddenDiv);
                    var divQuery = null;
                    if(divQuery1!=null && divQuery1.length>0){
                        divQuery = divQuery1[0];
                    }
                    */
                    var existingMasterPages = dojo.query(".style_master-page", masterHiddenDiv);
                    //15340, commenting the if check, we need to re-create the master page every time,
                    //to accomodate version changes in master page style that was previously used in document
                    //if(divQuery == null){
                        var masterPageDiv = null;
                        if(existingMasterPages!=null && existingMasterPages.length>0){
                            masterPageDiv = dojo.query(dojo.create("div",null, existingMasterPages[0], "before"))
                            .addClass("style_master-page" + " "+page_layout_name+" "+style_name)[0];
                        }else{
                            masterPageDiv = dojo.query(dojo.create("div",null, masterHiddenDiv,"first"))
                                    .addClass("style_master-page" + " "+page_layout_name+" "+style_name)[0];
                        }
                      masterPageDiv.id = name;
                      if(display_name!=null){
                      	masterPageDiv.setAttribute("name", display_name);
                      }
                      masterPageDiv.setAttribute("page_layout_name", page_layout_name);
                      masterPageDiv.setAttribute("style_name", style_name);
                      masterPageDiv.setAttribute("masterStyleCss", masterStyleCss);

                      //create frames
                      var frames = masterPages[i].frames;
                      if(frames!=null && frames.length>0){
                      	for(var j=0; j<frames.length; j++){
                      		var usage = frames[j].used_as;
                      		var frameName = frames[j].name;
                      		var frameStyleName = frames[j].style_name;
                      		var frameTextStyleName = frames[j].text_style_name;
                      		var frameLayer = frames[j].layer;
                      		var frameWidth = frames[j].width;
                      		var frameHeight = frames[j].height;
                      		var frameTop = frames[j].top;
                      		var frameLeft = frames[j].left;
                      		var frameHref = this.resolveMasterStyleUrl(frames[j].href);

                      		//create the draw_frame
                      		var drawFrameDiv = dojo.query(dojo.create("div",null, masterPageDiv,"last")).addClass("draw_frame")[0];
                      		if(frameStyleName !=null && frameStyleName !=""){
                      			dojo.addClass(drawFrameDiv, frameStyleName);
                      		}
                      		if(frameTextStyleName !=null && frameTextStyleName !=""){
                      			dojo.addClass(drawFrameDiv, frameTextStyleName);
                      		}
                      		if(frameName !=null && frameName !=""){
                      			drawFrameDiv.setAttribute("name", frameName);
                      		}
                      		if(usage !=null && usage !=""){

                      			if(usage =="backgroundImage"){
                      				dojo.addClass(drawFrameDiv, "backgroundImage");
                      				//create image element
                                    var imgElem = document.createElement("img");
                                    //imgElem.src=frameHref;
                                    dojo.attr(imgElem, "src1", frameHref);
                                    imgElem.style.width="100%";
                                    imgElem.style.height= "100%";

                                    //append to drawFrameDiv
                                    drawFrameDiv.appendChild(imgElem);
                      			}else{
                      				drawFrameDiv.setAttribute("presentation_class", usage);
                      				drawFrameDiv.setAttribute("emptyCB_placeholder", "true");
                      				var textBoxElem = document.createElement("div");
                      				textBoxElem.className ="draw_text-box";
                      				textBoxElem.setAttribute("odf_element","draw_text-box");
                      				//append to drawFrameDiv
                                    drawFrameDiv.appendChild(textBoxElem);
                      			}
                      		}
                      		if(frameLayer !=null && frameLayer !=""){
                      			drawFrameDiv.setAttribute("draw_layer", frameLayer);
                      		}
                      		drawFrameDiv.style.position="absolute";
                      		if(frameWidth !=null && frameWidth !=""){
                      			drawFrameDiv.style.width=frameWidth;
                      		}
                      		if(frameHeight !=null && frameHeight !=""){
                      			drawFrameDiv.style.height=frameHeight;
                      		}
                      		if(frameTop !=null && frameTop !=""){
                      			drawFrameDiv.style.top=frameTop;
                      		}
                      		if(frameLeft !=null && frameLeft !=""){
                      			drawFrameDiv.style.left=frameLeft;
                      		}
                      	}
                      }
                      /*
                     //15340, commenting following code, we need to re-create the master page,
                    //to accomodate version changes in master page style that was previously used in document
                    }//if divQuery is null
                    else if(divQuery!=null){ //if the master page exist
                        var parent = divQuery.parentNode;
                        if(existingMasterPages!=null && existingMasterPages.length>0){
                            parent.insertBefore(divQuery, existingMasterPages[0]);
                        }else {
                            parent.append(divQuery);
                        }

                    }
                    */
                    //remove the previous master pages from masterHtml hidden div here, remove the ones that we recognize in gallery, but keep the ones we don't
                    var prevMasterPageName = this.currMaster.masterName;
                    if(prevMasterPageName!=null){
                        prevMasterPageName=prevMasterPageName.toLowerCase();
                    }
                    var prevMasterPage0 = this.currMaster.masterPages[0].name;
                    var prevMasterPage1 = this.currMaster.masterPages[1].name;
                    if(window.pe.scene.templateDesignGalleryIdArray!=null && (window.pe.scene.templateDesignGalleryIdArray[prevMasterPageName] !=null)){//exists in master style gallery){
                        var masterPageId = prevMasterPage0;
                        var newMasterPage = "";
                        for(var m=0; m<=1; m++){
                            if(m == 0){
                                masterPageId = prevMasterPage0;
                                newMasterPage = masterPages[m].name;
                            }else if(m==1){
                                masterPageId = prevMasterPage1;
                                newMasterPage = masterPages[m].name;
                            }

                            //remove from hiddenDiv
                            if(masterPageId != newMasterPage){ //#15511 only remove if it is not the same
                                var masterPageNodeToRemove = document.getElementById(masterPageId);
                                if(masterPageNodeToRemove!=null){
                                    dojo.destroy(masterPageNodeToRemove);
                                }
                            }
                        }

                    }


                }
                if(masterPages!=null && masterPages.length>=2){

                    this.currMaster.masterName = masterPages[0].name;
                    this.currMaster.masterPages[0].name = masterPages[0].name;
                    this.currMaster.masterPages[1].name = masterPages[1].name;
                    this.currMaster.masterTemplateDataJSONStr = dojo.toJson(templateData);
                    var masterStylesCss = templateData.masterStylecss;
                    this.currMasterFrameStylesJSON = this.getCurrentMasterStyles(masterStylesCss);
                    this.currMasterFrameStylesJSON.currMaster = this.currMaster;
                    //get style elements
                    var styleNodeList = concord.util.HtmlContent.getStyleElements(this.editor.document.$);
                    var styleElementsArray = new Array();
                    for(var i = 0; i< styleNodeList.length; i++){
                        styleElementsArray.push(styleNodeList[i].cloneNode(true));
                    }
                    //get link elements
                    var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$);
                    var linkElementsArray = new Array();
                    for(var i = 0; i< linkNodeList.length; i++){
                        var href = linkNodeList[i].getAttribute("href");
                        var concordSlideSorterCssIdx = href.indexOf(this.concordSlideSorterCssUrl);
                        var listSlideSorterCssIdx = this.regExpListSlideSorterCssUrl.test(href);
                        if (concordSlideSorterCssIdx < 0 && listSlideSorterCssIdx == false){
                            linkElementsArray.push(linkNodeList[i].cloneNode(true));
                        }
                    }
                    //publish event to slide editor for master pages change
                    var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_masterTemplateChange,'currMasterFrameStylesJSON':this.currMasterFrameStylesJSON, 'styleElements':styleElementsArray,'linkElements':linkElementsArray,'currMaster':this.currMaster}];
             		dojo.publish(concord.util.events.slideSorterEvents, eventData);

                }

            }
        }
    },
    saveMasterToFile:function(sData){
        var saveMasterUrlWithParam = this.saveMasterUrl+"?docUri="+this.presBean.getUri()+"&repoId="+this.presBean.getRepository()+"&ownerId="+this.presBean.getOwner();
        if(sData == null){
            var masterHtmlDiv = document.getElementById(this.masterHtmlDivId);
            //var sData = new Object();
            sData = masterHtmlDiv.innerHTML;
        }
        dojo.xhrPost({
            url: saveMasterUrlWithParam,
            handleAs: "json",
            handle: function(r, io){
            },
            sync: false,
            contentType: "text/plain",
            postData: sData
        });
    },
    createTemplateDataJsonFromCurrMaster:function(){
        var templateData = null;
        //get the top master names
        var titlePageMasterName = this.currMaster.masterPages[0].name;
        var textPageMasterName = this.currMaster.masterPages[1].name;

        var titleMasterDrawPageDiv = document.getElementById(titlePageMasterName);
        var	textMasterDrawPageDiv = document.getElementById(textPageMasterName);

        if(titleMasterDrawPageDiv !=null && textMasterDrawPageDiv!=null){
            templateData = new Object();
            templateData. masterName = titleMasterDrawPageDiv.id;
            templateData.masterStylecss = dojo.attr(titleMasterDrawPageDiv, "masterstylecss");
            if(templateData.masterStylecss==null || templateData.masterStylecss==""){
                templateData.masterStylecss = this.currMasterFrameStylesJSON.masterStyleCss;
            }
            templateData.masterPages = new Array();
            var titleMasterPage = new Object();
            titleMasterPage.name = titleMasterDrawPageDiv.id;
            titleMasterPage.page_layout_name = dojo.attr(titleMasterDrawPageDiv, "page_layout_name");
            titleMasterPage.style_name = dojo.attr(titleMasterDrawPageDiv, "style_name");
            var titleMasterPageClassNames = this.getMasterFrameStyle(titlePageMasterName, "draw_page");
            titleMasterPage.style_name = dojo.trim(titleMasterPage.style_name+ " "+titleMasterPageClassNames);

            var titleMasterPageFrames = dojo.query(".draw_frame",titleMasterDrawPageDiv);
            titleMasterPage.frames = this.getMasterFramesJsonForMasterPage(titleMasterPageFrames);
            templateData.masterPages.push(titleMasterPage);

            var textMasterPage = new Object();
            textMasterPage.name = textMasterDrawPageDiv.id;
            textMasterPage.page_layout_name = dojo.attr(textMasterDrawPageDiv, "page_layout_name");
            textMasterPage.style_name = dojo.attr(textMasterDrawPageDiv, "style_name");
            var textMasterPageClassNames = this.getMasterFrameStyle(textPageMasterName, "draw_page");
            textMasterPage.style_name = dojo.trim(textMasterPage.style_name+ " "+textMasterPageClassNames);

            var textMasterPageFrames = dojo.query(".draw_frame",textMasterDrawPageDiv);
            textMasterPage.frames = this.getMasterFramesJsonForMasterPage(textMasterPageFrames);
            templateData.masterPages.push(textMasterPage);
        }

        return templateData;
    },
    //parameter masterPageFrames, an array of frame elements within a master page
    getMasterFramesJsonForMasterPage:function(masterPageFrames){
        var masterPageFramesJsonArray = new Array();
        if(masterPageFrames!=null ){
            for(var i=0; i<masterPageFrames.length; i++){
                var presClass = dojo.attr(masterPageFrames[i], "presentation_class");
                var dataNode = masterPageFrames[i].children[0];
                var frame = new Object();
                if( (presClass == null || presClass =="") &&
                    dojo.hasClass(masterPageFrames[i], "backgroundImage") &&
                    !( ( (dataNode) && (dojo.hasClass(dataNode, 'draw_text-box') || dojo.attr(dataNode,'odf_element')=='draw_text-box')))){

                    frame.used_as = "backgroundImage";
                    frame.href = "";
                    if(masterPageFrames[i].firstChild !=null){
                        if(dojo.hasAttr(masterPageFrames[i].firstChild,"src")) {
                            frame.href = dojo.attr(masterPageFrames[i].firstChild,"src");
                        } else if(dojo.hasAttr(masterPageFrames[i].firstChild,"src1")) {
                            frame.href = dojo.attr(masterPageFrames[i].firstChild,"src1");
                        }
                    }
                }else{
                    frame.used_as = presClass;
                    frame.emptyCB_placeholder= dojo.attr(masterPageFrames[i],"emptyCB_placeholder");
                    if(frame.emptyCB_placeholder== null ||frame.emptyCB_placeholder==""){
                        frame.emptyCB_placeholder=true;
                    }
                }
                frame.name = "";
                var frameClone = masterPageFrames[i].cloneNode(true);
                dojo.removeClass(frameClone, "draw_frame");
                frame.style_name = frameClone.className;
                dojo.destroy(frameClone);
                frame.layer = "backgroundobjects";
                frame.top = masterPageFrames[i].style.top;
                frame.left = masterPageFrames[i].style.left;
                frame.width = masterPageFrames[i].style.width;
                frame.height = masterPageFrames[i].style.height;
                var tempNode  = new CKEDITOR.dom.node(masterPageFrames[i]);
                frame.html = tempNode.getOuterHtml();
                tempNode = null;
                masterPageFramesJsonArray.push(frame);
            }
        }
        return masterPageFramesJsonArray;
    },
    selectAllSlides:function(){
    	var gotoSelected = pe.scene.slideSorter.selectedSlide;
        this.refreshSlidesObject();
        //this.slides contains all the slides now ('draw_page')
        if(this.slides!=null && this.slides.length >0){
            for(var i=0; i < this.slides.length; i++){
                this.selectSlide(this.slides[i]);
            }
        }
        if(this.currentScene.sceneInfo.mode == "edit"){
            var taskHdl = this.getTaskHdl();
            if(taskHdl)
            	taskHdl.updateCommandState(taskHdl.getSelectedTask());
        }
        var slideWrapper = gotoSelected.parentNode;
    	if(slideWrapper != null){
    		var ckslideWrapper = PresCKUtil.ChangeToCKNode(slideWrapper);
    		ckslideWrapper.scrollIntoView(false);
    	}
    },
    sortSlides:function(isSlideWrapper,slideA, slideB){
        if(slideA !=null && slideB !=null){
            var slideNumberA = this.getSlideNumber((isSlideWrapper!=null) ? slideA.firstChild :slideA );
            var slideNumberB = this.getSlideNumber((isSlideWrapper!=null) ? slideB.firstChild :slideB );
            return (slideNumberA - slideNumberB); //causes an array to be sorted numerically and ascending
        }else{
            return 0; //no sort performed
        }
    },
    
 // keep the listBeforeStyleStack items for cut and paste
    preserveListBeforeStylesCss : function() {
    	window.pe.scene.slideSorter.oldListBeforeStyleStack = [];
    	for ( var listStyleName in pe.scene.slideSorter.listBeforeStyleStack )
    	{
    		var listStyleContent = pe.scene.slideSorter.listBeforeStyleStack[ listStyleName ];
    		window.pe.scene.slideSorter.oldListBeforeStyleStack[listStyleName] = listStyleContent;
    	}
    },

    
    removeUnSupportImageForCopySlide: function(slideToPaste){
    	var drawFrames = slideToPaste.getElementsByClassName('importedImage draw_frame');
    	//here we will paste all tables in the clipboard data
    	for(var t = 0; t < drawFrames.length; t++){
    		var dfc = drawFrames.item(t);
    		var divPlaceholder = dfc.getElementsByClassName('placeholder');
    		if(divPlaceholder.length >0 && divPlaceholder[0].nodeName.toLowerCase() == 'div')
    			dojo.addClass(dfc,'removeThisNode');
    	}
    	dojo.query('.removeThisNode',slideToPaste).forEach(dojo.destroy);
    },
    
    //
    // Returns false if clipboard did not copy slides and true if copy is successful
    //
    copySlides: function() {
        var clipBoard = window.pe.scene.getPresClipBoard();
        var clipBoardData ={'identifiers':[],'data':[]};

        var cpContent = '';
        var isDesktop = !concord.util.browser.isMobile();
        
        window.pe.scene.slideSorter.preserveListBeforeStylesCss();
        if(this.multiSelectedSlides){
            //re-order the multiselectedslides according to the order of the slides in the slidesorter
            //so it maintains the order of the slidenumber, not the order of the user clicking the slides
            //e.g. user can click slide 5 then slide 4. but when pasting, we want to see slide 4 before slide 5
            this.sortMultiSelectedSlides(); //jmt D46480
            var docId = this.presBean.getUri();
            for(var i=0; i<this.multiSelectedSlides.length; i++){
                this.loadSlideToSorter(this.multiSelectedSlides[i]);
                PresCKUtil.updateIdForAllSpans(this.multiSelectedSlides[i]);
                var cloneSlide = this.multiSelectedSlides[i].cloneNode(true);
                this.removeUnSupportImageForCopySlide(cloneSlide);
        		if(!pe.keepIndicator){
        			cloneSlide = concord.util.presCopyPasteUtil.removeIndicatorForCopy(cloneSlide).$;
        		}
                if(this.spellChecker)
                    this.spellChecker.resetOneNode(cloneSlide, true);
                clipBoardData.identifiers.push(this.SORTER_SLIDE_TYPE);
                clipBoardData.data.push({'html':new CKEDITOR.dom.element(cloneSlide).getOuterHtml(),'docUUID':docId});
                isDesktop && PresListUtil._EnCodingDataForBrowser(cloneSlide);
                var htmlContent = new CKEDITOR.dom.element(cloneSlide).getOuterHtml();
                cpContent += htmlContent;
            }
            var params = {'content':cpContent,'type':'object', 'docId':docId};
            //Even for mobile still need call .copy here, 
            //  to set the _clipboard_id as '*docs_pres_object*'
            pe.scene.clipboard.copy(params);
            return clipBoard.setData(dojo.toJson(clipBoardData));
        }
        return false;
    },

    removeCommentAttributes: function(slideToPaste){
        dojo.query(".draw_frame", slideToPaste).forEach(function(node, index, arr){
            if (dojo.attr(node,"commentsid")) {
                dojo.removeAttr(node, "commentsid");
                dojo.removeAttr(node, "comments");
            }
        });
        return slideToPaste;
    },

    updatePageSizeAttributes: function(slideToPaste){
        var pageHeight = dojo.attr(dojo.byId('slideEditorContainer').children[0], 'pageheight');
        var pageWidth = dojo.attr(dojo.byId('slideEditorContainer').children[0], 'pagewidth');
        dojo.attr(slideToPaste, "pageheight",pageHeight);
        dojo.attr(slideToPaste, "pagewidth",pageWidth);

        slideToPaste.style.height = this.slideHeight + 'px';

        //IE returns "null" for dojo.attr at times
        if (pageHeight && pageHeight != "null") {
            var fontSize = PresCKUtil.getBasedFontSize(this.slideHeight, pageHeight);
            slideToPaste.style.fontSize = fontSize + 'px';
        }
        return slideToPaste;
    },

    updateHeaderFooterFields: function(slideToPaste, slideRefWrapper, creatingSlide) {
        //15090, need to accept array: footer, date time and pagenumbers sometime appears more than one in the slides
        var slideFooter = [];
        var slideDateTime = [];
        var slidePageNumber = [];
        var copyFrames = dojo.query(".draw_frame", slideRefWrapper);
        if(copyFrames != null){
            for(var i=0; i<copyFrames.length ; i++){
                var presClass = copyFrames[i].getAttribute("presentation_class");
                if(presClass != null && dojo.hasClass(copyFrames[i].parentNode,"draw_page")) {
                    if(presClass == "footer") {
                        //slideFooter = dojo.clone(copyFrames[i]);
                        slideFooter.push(dojo.clone(copyFrames[i]));
                    } else if (presClass == "date-time") {
                        slideDateTime.push(dojo.clone(copyFrames[i]));
                    } else if (presClass == "page-number") {
                        slidePageNumber.push(dojo.clone(copyFrames[i]));
                    }
                }
            }
        }

        dojo.query('[presentation_class = "footer"]', slideToPaste).forEach(function(node, index, arr){
            if (dojo.hasClass(node.parentNode,"draw_page")) {
                dojo.destroy(node);
            }
        });

        var textFixed =null;
        var textDateTimeFormat = null;
        var textLocale = null;
        var referenceSlide = slideToPaste;

        // If a slide is being created then the header and footer information
        // needs to be pulled from the selectedSlide to preserve.  If pasted,
        // the information needs to be preserved from the copied slide.
        if (creatingSlide) {
            referenceSlide = slideRefWrapper;
        }

        dojo.query('[presentation_class = "date-time"]', referenceSlide).forEach(function(node, index, arr){
            if (dojo.hasClass(node.parentNode,"draw_page")) {
                textFixed = dojo.attr(node, "text_fixed");
                textDateTimeFormat = dojo.attr(node, "text_datetime-format");
                textLocale = dojo.attr(node, "text_locale");
            }
        });

        dojo.query('[presentation_class = "date-time"]', slideToPaste).forEach(function(node, index, arr){
            if (dojo.hasClass(node.parentNode,"draw_page")) {
                dojo.destroy(node);
            }
        });


        dojo.query('[presentation_class = "page-number"]', slideToPaste).forEach(function(node, index, arr){
            if (dojo.hasClass(node.parentNode,"draw_page")) {
                dojo.destroy(node);
            }
        });

        //if(slideFooter != null || slideDateTime != null || slidePageNumber != null) {
        if(slideFooter.length >0 || slideDateTime.length >0 || slidePageNumber.length >0) {
            var showOnTitleSlide = dojo.attr(referenceSlide, 'show-on-title');
            var referencePageNumber = this.getSlideNumber(referenceSlide);

            // Special case for first slide.  If first slide then on insert
            // need to check if the footer, datetime and page number should be
            // shown.  If show-on-title is false then need to determine
            // whether the inserted slide should show the footers
            if (referencePageNumber == "1" && showOnTitleSlide != "true")
            {
                // Grab the second slide footer information
                var nextSlideWrapper = this.getNextSlideOf(referenceSlide.parentNode);
                if(nextSlideWrapper!=null){
                    var nextSlide = nextSlideWrapper.firstChild;
                    slideFooter = [];
                    slideDateTime = [];
                    slidePageNumber = [];
                    var copyNextSlideFrames = dojo.query(".draw_frame", nextSlide);
                    if(copyNextSlideFrames != null){
                        for(var i=0; i<copyNextSlideFrames.length ; i++){
                            var presClass = copyNextSlideFrames[i].getAttribute("presentation_class");
                            if(presClass != null && dojo.hasClass(copyNextSlideFrames[i].parentNode,"draw_page")) {
                                if(presClass == "footer") {
                                    slideFooter.push(dojo.clone(copyNextSlideFrames[i]));
                                    dojo.style(slideFooter[slideFooter.length-1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
                                } else if (presClass == "date-time") {
                                    slideDateTime.push(dojo.clone(copyNextSlideFrames[i]));
                                    dojo.style(slideDateTime[slideDateTime.length-1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
                                } else if (presClass == "page-number") {
                                    slidePageNumber.push(dojo.clone(copyNextSlideFrames[i]));
                                    dojo.style(slidePageNumber[slidePageNumber.length-1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
                                }
                            }
                        }
                    }
                }
            }

            for(var i=0; i<slideFooter.length ; i++){
                slideToPaste.appendChild(slideFooter[i]);
            }

            for(var i=0; i<slideDateTime.length ; i++){
                //preserve date-time format before append
                dojo.attr(slideDateTime[i],'text_datetime-format',textDateTimeFormat);
                dojo.attr(slideDateTime[i],'text_fixed',textFixed);
                dojo.attr(slideDateTime[i],'text_locale',textLocale);
                slideToPaste.appendChild(slideDateTime[i]);
            }

            for(var i=0; i<slidePageNumber.length ; i++){
                slideToPaste.appendChild(slidePageNumber[i]);
            }
        }

        //update date time field of headers and footer for newly pasted slide
        this.updateHeaderFooterDateTimeFields(slideToPaste);

        return slideToPaste;
    },
    
    removeMergeTableForPasteSlide: function(slideToPaste){
    	var tables = slideToPaste.getElementsByTagName('table');
    	//here we will paste all tables in the clipboard data
    	for(var t = 0; t < tables.length; t++){
    		var table = tables.item(t);
    		if(PresTableUtil.isMergeCell(table)){
    			dojo.addClass(table.parentElement,'removeThisNode');
    		}
    	}
    	dojo.query('.removeThisNode',slideToPaste).forEach(dojo.destroy);
    },
    //@param isToIgnoreCtrlKey, for the case from ctrl+v, in ie when we do simulate slideclick, ctrl key still sticks, needs to flag it to ignore it.
    pasteSlides: function(afterOrBefore, isToIgnoreCtrlKey){
        var clipBoard = window.pe.scene.getPresClipBoard();
        var clipBoardData = dojo.fromJson(clipBoard.getData());

        //D14866: Disable copy/paste of slides and slide objects across presentations
        if (!(clipBoardData && clipBoardData.data && clipBoardData.data[0] && clipBoardData.data[0].docUUID == window.pe.scene.session.uri)){
            return;
        }

        this.slidesToCopy = (clipBoardData) ? clipBoardData.data : [];
        
        var typeArray = (clipBoardData) ? clipBoardData.identifiers :[];
        // jmt - coeditfix
        var msgPairList = [];
        var lastSlide =null;

        //notification wangxum@cn.ibm.com
        var slidelist = new Array();

        if(afterOrBefore!= null && (afterOrBefore.toLowerCase() == this.PASTE_AFTER ||afterOrBefore.toLowerCase() == this.PASTE_BEFORE) && (typeArray.length > 0 && typeArray[0]==this.SORTER_SLIDE_TYPE)){
        	if(this.officePrezDiv!=null){
    	        var allSlides = dojo.query('.draw_page',this.officePrezDiv);
    	        if(allSlides && this.slidesToCopy && (allSlides.length + this.slidesToCopy.length) > this.maxSlideNum ){
    	        	this.showSlideNumCheckMsg();
    	        	return;
    	        }
            }
            this.publishSlideSorterInFocus();
            if(this.multiSelectedSlides !=null && this.multiSelectedSlides.length >0 &&  this.slidesToCopy !=null && this.slidesToCopy.length >0 ){
                if(afterOrBefore.toLowerCase() == this.PASTE_AFTER){
                    //append pasted slides to last selected slide
                    var slideRefWrapper = this.multiSelectedSlides[this.multiSelectedSlides.length-1].parentNode;
                    for(var i=0; i<this.slidesToCopy.length; i++){
                        var slideToPaste = lastSlide = CKEDITOR.dom.element.createFromHtml(this.slidesToCopy[i].html).$;
                        slideToPaste = this.removeCommentAttributes(slideToPaste);
                		if(!pe.keepIndicator){
                			slideToPaste = concord.util.presCopyPasteUtil.removeIndicatorForCopy(slideToPaste).$;
                			slideToPaste = concord.util.presCopyPasteUtil.addIndicatorForPaste(slideToPaste).$;
                		}
                        slideToPaste = this.updatePageSizeAttributes(slideToPaste);
                        //slideToPaste = this.updateHeaderFooterFields(slideToPaste, slideRefWrapper);
                        this.removeMergeTableForPasteSlide(slideToPaste);
                        this.updateHeaderFooterDateTimeFields(slideToPaste);
                        //slideToPaste.id = slideToPaste.id+i;
                        this.setSlideId(slideToPaste);
                        //should do dup listBeforeStyleClass after ID changed.
                        PresCKUtil.duplicateListBeforeStyleInSlide(slideToPaste);
                        //create wrapper for the slide
                        this.createSlideWrappers(slideToPaste);
                        this.addBrowserClassToWrapper(slideToPaste);
                        this.insertSlideAfter(slideToPaste.parentNode, slideRefWrapper);

                        //prepare slide connect events
                        this.prepareNewSlide(slideToPaste);
                        //refresh this.slides
                        this.refreshSlidesObject();
                        slideRefWrapper = slideToPaste.parentNode;

                        //if it is from other document (check doc id from clipboard data
                        //apply template if the target document uses different template
                        var docSourceId = this.slidesToCopy[i].docUUID;
                        var currDocId = this.presBean.getUri();
                        if(docSourceId != currDocId){
                            var slideArray = new Array();
                            slideArray.push(slideToPaste);
                            this.applyCurrTemplateToSlides(slideArray);

                            //if from other concord pres, need to upload and update url to images
                            //need to see if this is from concord, context is concord
                            this.uploadAndUpdateAttachmentUrl(slideToPaste, docSourceId);
                        }
                        //co-editing
                        //this.coeditingSendMsgForInsertSlide(slideRefWrapper);
                        if(slideRefWrapper !=null && slideRefWrapper.id !=null){
                            msgPairList = SYNCMSG.createInsertNodeMsgPair(slideRefWrapper,msgPairList);
                        }
                        //this.simulateSlideClick(slideToPaste);

                        //notification wangxum@cn.ibm.com
                        slidelist.push(slideToPaste);

                        //add to slide content object
                        this.addSlideToContentObj(slideToPaste);
                    }
                    //notification wangxum@cn.ibm.com
                    this.getNotifyTool().addInsertedSlidesNotifyMsg(slidelist);
                    this.spellCheckSlides(slidelist);
                    //D21725 [MasterStyle] sldNum in textbox is not updated after duplicate the slide
                    this.updatePageNumberFieldsForAllSlides(this.slides);
                }

                else if(afterOrBefore.toLowerCase() == this.PASTE_BEFORE){
                    //append pasted slides to last selected slide
                    var slideRefWrapper = this.multiSelectedSlides[this.multiSelectedSlides.length-1].parentNode;

                    for(var i=0; i<this.slidesToCopy.length; i++){
                        var slideToPaste = lastSlide = CKEDITOR.dom.element.createFromHtml(this.slidesToCopy[i].html).$;
                        slideToPaste = this.removeCommentAttributes(slideToPaste);
                		if(!pe.keepIndicator){
                			slideToPaste = concord.util.presCopyPasteUtil.removeIndicatorForCopy(slideToPaste).$;
                			slideToPaste = concord.util.presCopyPasteUtil.addIndicatorForPaste(slideToPaste).$;
                		}
                        slideToPaste = this.updatePageSizeAttributes(slideToPaste);
                        //slideToPaste = this.updateHeaderFooterFields(slideToPaste, slideRefWrapper);
                        this.updateHeaderFooterDateTimeFields(slideToPaste);
                        //slideToPaste.id = slideToPaste.id+i;
                        this.setSlideId(slideToPaste);
                        
                        PresCKUtil.duplicateListBeforeStyleInSlide(slideToPaste);

                        if(i==0){
                            //create wrapper for the slide
                            this.createSlideWrappers(slideToPaste);
                            var slideToPasteWrapper = slideToPaste.parentNode;
                            var slideRefWrapperParent = slideRefWrapper.parentNode;
                            slideRefWrapperParent.insertBefore(slideToPasteWrapper,slideRefWrapper);
                        }else {
                            //create wrapper for the slide
                            this.createSlideWrappers(slideToPaste);
                            this.insertSlideAfter(slideToPaste.parentNode, slideRefWrapper);
                        }
                        this.addBrowserClassToWrapper(slideToPaste);


                        //prepare slide connect events
                        this.prepareNewSlide(slideToPaste);
                        //refresh this.slides
                        this.refreshSlidesObject();

                        slideRefWrapper = slideToPaste.parentNode;

                        //apply template if the target document uses different template
                        var docSourceId = this.slidesToCopy[i].docUUID;
                        var currDocId = this.presBean.getUri();
                        if(docSourceId != currDocId){
                            //var slideMasterPageName = slideToPaste.getAttribute("draw_master-page-name");
                            var slidePageLayout = slideToPaste.getAttribute("presentation_presentation-page-layout-name");
                            var currTemplateMasterPageName = "";
                            if(slidePageLayout == "ALT0"){
                                currTemplateMasterPageName = this.currMaster.masterPages[0].name;
                            }else {
                                currTemplateMasterPageName = this.currMaster.masterPages[1].name;
                            }
                            //if(currTemplateMasterPageName!=slideMasterPageName ){
                                var slideArray = new Array();
                                slideArray.push(slideToPaste);
                                this.applyCurrTemplateToSlides(slideArray);
                            //}
                            //if from other concord pres, need to upload and update url to images
                            //need to see if this is from concord, context is concord
                            this.uploadAndUpdateAttachmentUrl(slideToPaste, docSourceId);
                        }
                        //co-editing
                        //this.coeditingSendMsgForInsertSlide(slideRefWrapper);
                        if(slideRefWrapper !=null && slideRefWrapper.id !=null){
                            msgPairList = SYNCMSG.createInsertNodeMsgPair(slideRefWrapper,msgPairList);
                        }
                        //this.simulateSlideClick(slideToPaste);

                        //notification wangxum@cn.ibm.com
                        slidelist.push(slideToPaste);

                        //add to slide content object
                        this.addSlideToContentObj(slideToPaste);
                    }

                    //notification wangxum@cn.ibm.com
                    this.getNotifyTool().addInsertedSlidesNotifyMsg(slidelist);
                    this.spellCheckSlides(slidelist);
                    //update page numbers here
                    //D21725 [MasterStyle] sldNum in textbox is not updated after duplicate the slide
                    this.updatePageNumberFieldsForAllSlides(this.slides);
                }

            }
            PresCKUtil.doUpdateListStyleSheet();
            if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){
				//msgPairs[0].msg.updates[1]&msgPairs[0].rMsg.updates[1] at here is a IE message.
            	msgPairList[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
            	msgPairList[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
				pe.scene.slideSorter.postListCssStyleMSGList = null;
				pe.scene.slideSorter.preListCssStyleMSGList = null;
			}
            
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);

            //create the slideUtil div
            this.createSlideUtilDiv(slidelist);

            // Update the slide number display
            //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
            this.displaySlideNumber(lastSlide, this.slideNumberDiv);

            this.simulateSlideClick(lastSlide,isToIgnoreCtrlKey);
            this.scrolling();

        }

    },
    cutSlides: function() {
        //prevent users from deleting slide when all slides be selected
        if(this.multiSelectedSlides.length == this.slides.length) {
            return;
        }
        if (this.copySlides()){ //jmt- 41913
            var isFromCut = true;
            //remove the slides
            this.deleteSlides(isFromCut);
        }
    },

    selectPreviousSlide: function(fromAction){
        var currSlide = this.selectedSlide;
        var prevSlideWrapper = this.getPreviousSlideOf(currSlide.parentNode);
        if(prevSlideWrapper!=null){
            var prevSlide = dojo.query(".draw_page",prevSlideWrapper);
            if (prevSlide != null && prevSlide.length>0) {
                this.simulateSlideClick(prevSlide[0], null, fromAction);
            }

        }
    },
    //@param fromAction, action that triggered this function call, e.g. page_down
    selectNextSlide: function(fromAction){
        var currSlide = this.selectedSlide;
        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%SLIDE:"+slideNumber+"%%%%%%%%%%%%%%%%%%%%%%");
        /*
        var nextSlideIdx = slideNumber; //nextSlideIdx = slideNumber-1 +1.. meaning slideNumber

        if(nextSlideIdx < this.slides.length){
            var nextSlide = this.slides[nextSlideIdx];
            this.simulateSlideClick(nextSlide, null, fromAction);
        }
        */

        var nextSlideWrapper = this.getNextSlideOf(currSlide.parentNode);
        if(nextSlideWrapper!=null){
            var nextSlide = dojo.query(".draw_page",nextSlideWrapper);
            if (nextSlide != null && nextSlide.length>0) {
                //console.log("****SLIDESORTER:SELECTNEXTSLIDE");
                this.simulateSlideClick(nextSlide[0],null, fromAction);
            }
        }
    },
    isFirstSlideSelected: function() {
        
        if(this.selectedSlide.id == this.slides[0].id)
            return true;
        else
            return false;
    },
    isLastSlideSelected: function() {
        if(this.selectedSlide.id == this.slides[this.slides.length-1].id)
            return true;
        else
            return false;
    },
    selectFirstSlide: function(){
        this.refreshSlidesObject();
        var firstSlide = this.slides[0];
        //this.loadSlideToSorter(firstSlide);
        this.simulateSlideClick(firstSlide);
    },
    selectLastSlide: function(){
        this.refreshSlidesObject();
        var lastSlide = this.slides[this.slides.length-1];
        //this.loadSlideToSorter(lastSlide);
        this.simulateSlideClick(lastSlide);
    },

    // Publish Slide Sorter is in focus
    //
    publishSlideSorterInFocus: function(){
 		//var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':concord.util.events.crossComponentEvents_componentName_SLIDE_SORTER}];
 		//dojo.publish(concord.util.events.slideSorterEvents, eventData);
	dojo.publish(concord.util.events.slideSorterEvents_Focus, null);
    },

    handleNextPrevSlideEvent: function(data) {
        if (data.eventAction == "prevSlide") {
            if(!this.isFirstSlideSelected()) {
                this.selectPreviousSlide(data.fromAction);
            }
        }
        else if (data.eventAction == "nextSlide" ){
            if(!this.isLastSlideSelected()) {
                this.selectNextSlide(data.fromAction);
            }
        }
    },

    keypressHandle:function(data){
        if (data.eventAction==this.CTRL_V) {
            var isToIgnoreCtrlKey = true; // for IE doesn't get rid of ctrl key pressed here in the simulateSlideClick
            this.pasteSlides(this.PASTE_AFTER,isToIgnoreCtrlKey);
        } else if ( data.eventAction==this.CTRL_M){
            //New slide event should not need focus on the slide sorter
            var node = this.selectedSlide;
            var isToIgnoreCtrlKey = true; // for IE doesn't get rid of ctrl key pressed here in the simulateSlideClick
            if ( this.getFocusComponent() == concord.util.events.SLIDE_SORTER_COMPONENT){
                this.createSlide(node,isToIgnoreCtrlKey);
                // If slide sorter was already in focus leave it in focus after creating slide
                this.publishSlideSorterInFocus();
            } else {
                this.createSlide(node,isToIgnoreCtrlKey);
            }
        } else if (data.eventAction==this.PAGE_UP){
            //this.selectPreviousSlide();
            data.eventAction = "prevSlide";
            data.fromAction = this.PAGE_UP;
            this.handleNextPrevSlideEvent(data);
        } else if (data.eventAction==this.PAGE_DOWN ){
            //this.selectNextSlide();
            //console.log("****SLIDESORTER:PAGE_DOWN");

            data.eventAction = "nextSlide";
            data.fromAction = this.PAGE_DOWN;
            this.handleNextPrevSlideEvent(data);

        } else if (data.eventAction==this.HOME){
            this.selectFirstSlide();
            //this.publishSlideSorterInFocus();
        } else if (data.eventAction==this.END){
            this.selectLastSlide();
            //this.publishSlideSorterInFocus();
        } else if (this.getFocusComponent() == concord.util.events.SLIDE_SORTER_COMPONENT){
            var e = data.e;
             if (data.eventAction==this.DELETE || data.eventAction==this.BACKSPACE) {
                 this.deleteSlides();
             } else if (data.eventAction==this.CTRL_A){
                 this.selectAllSlides();
             } else if (data.eventAction==this.DOWN_ARROW || data.eventAction==this.PAGE_DOWN || data.eventAction==this.RIGHT_ARROW){
                // this.selectNextSlide();
                //D15026 do not go into edit mode if context menu is up
                if (window.pe.scene.isCtxMenuUp() || window.pe.scene.isCtxMenuUp(this.editor.document.$)){
                    return;
                }
                data.eventAction = "nextSlide";
                data.fromAction = this.PAGE_DOWN;
                this.handleNextPrevSlideEvent(data);
             } else if (data.eventAction==this.UP_ARROW || data.eventAction==this.PAGE_UP || data.eventAction==this.LEFT_ARROW){
                 //this.selectPreviousSlide();
                 data.eventAction = "prevSlide";
                 data.fromAction = this.PAGE_UP;
                 this.handleNextPrevSlideEvent(data);
             } else if (data.eventAction==this.ENTER){
            	 var slideEditor = pe.scene.slideEditor;
             	 slideEditor && slideEditor.deSelectAll();
                 this.createSlide(this.selectedSlide);
             } else if (data.eventAction==this.SHIFT_F10){
                 this.oncontextmenuFunc(data.e);
             }
        } else if (data.eventAction==this.DOWN_ARROW || data.eventAction==this.RIGHT_ARROW ){
            //D15026 do not go into edit mode if context menu is up
            if (window.pe.scene.isCtxMenuUp() || window.pe.scene.isCtxMenuUp(this.editor.document.$)){
                return;
            }
            // Go to the next slide if no object is selected in the slide editor
            if ( pe.scene.slideEditor.getIndxBoxSelected() == null  && this.getFocusComponent() != concord.util.events.PRES_TOOLBAR_COMPONENT){
                //this.selectNextSlide();
                data.eventAction = "nextSlide";
                data.fromAction = this.PAGE_DOWN;
                this.handleNextPrevSlideEvent(data);
                //this.publishSlideSorterInFocus();
            }
        } else if (data.eventAction==this.UP_ARROW || data.eventAction==this.LEFT_ARROW){
            //D15026 do not go into edit mode if context menu is up
            if (window.pe.scene.isCtxMenuUp() || window.pe.scene.isCtxMenuUp(this.editor.document.$)){
                return;
            }
            // Go to the previous slide if no object is selected in the slide editor
            if ( pe.scene.slideEditor.getIndxBoxSelected() == null && this.getFocusComponent() != concord.util.events.PRES_TOOLBAR_COMPONENT){
                //this.selectPreviousSlide();
                data.eventAction = "prevSlide";
                data.fromAction = this.PAGE_UP;
                this.handleNextPrevSlideEvent(data);
                //this.publishSlideSorterInFocus();
            }
        }
    },

    handleMuliBoxAttributeChangeFromSlideEditor: function(data){
        if(data!=null && data.ObjList !=null){
            // Merge margin actions together with resize action if data has
            var msgActs = data.marginMsgActs ? data.marginMsgActs : [];
            for (var i =0; i<data.ObjList.length; i++){
                var obj = data.ObjList[i];
                var attrObj = SYNCMSG.getAttrValues(obj.data,this.editor.document.$);
                var elem = this.editor.document.getById(obj.data.id);
                msgActs = this.coeditingMsgActsForMultiBoxAttributeChange(obj.data,attrObj,msgActs);
                //D14496 Let's filter content
                if (msgActs.length > 0 &&  msgActs[msgActs.length-1].act.s){
                	msgActs[msgActs.length-1].act.s = SYNCMSG.filterStyleProperties(msgActs[msgActs.length-1].act.s);
                	msgActs[msgActs.length-1].rAct.s = SYNCMSG.filterStyleProperties(msgActs[msgActs.length-1].rAct.s);
                }
            }
            // send one coediting msg for multiple
            // content box moving
            if (msgActs.length>0) {
                var msg = [ SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs) ];
                SYNCMSG.sendMessage(msg, SYNCMSG.SYNC_SORTER);
            }
        }
    },

    handleAttributeChangeFromSlideEditor: function(data){
        if(this.editor && data!=null && data.id !=null && data.attributeName!=null && data.attributeValue !=null){
            //let's ensure that node still exists in sorter
            var node = dojo.query("#"+data.id,this.editor.document.$.body);
            if (node.length>0){
                var attrObj = SYNCMSG.getAttrValues(data,this.editor.document.$);
                if (data.oldStyleValue) {
                    attrObj.oldStyleValue = data.oldStyleValue;
                }
                var elem = this.editor.document.getById(data.id);
                //send coedit
                this.coeditingSendMsgForAttributeChange(data,attrObj);
                elem = null;
            }
            node = null;
        }
    },
    
    handleCoeditInsertSlide:function(data){
        if(data!=null){
            if(data.slideElemWrapper !=null){
                var slideElemWrapper = data.slideElemWrapper;
                var nextSlideWrapper = data.nextSlideWrapper;
                var slideParent = data.slideParent;
                var slideElems = dojo.query(".draw_page", slideElemWrapper);
                if(slideElems!=null && slideElems.length>0){
                    var slideElem = slideElems[0];
                    //this.createSlideWrappers(slideElem);
                    //var slideElemWrapper = slideElem.parentNode;
                    if(slideParent!=null){
                        slideParent.insertBefore(slideElemWrapper,nextSlideWrapper);
                        this.prepareNewSlide(slideElem);
                        //refresh this.slides
                        this.refreshSlidesObject();
                    }
                }

            }
        }
    },
    handleCoeditInsertSlideWrapper:function(data){
        if(data!=null){
            if(data.slideElemWrapper !=null){
                var slideElemWrapper = data.slideElemWrapper;
                var slideParent = data.slideWrapperParent;
                var slideElems = dojo.query(".draw_page", slideElemWrapper);
                this.undoDeleteSlideComments(slideElemWrapper);
                if(slideElems!=null && slideElems.length>0){
                    var slideElem = slideElems[0];
                    //this.createSlideWrappers(slideElem);
                    //var slideElemWrapper = slideElem.parentNode;
                    if(slideParent!=null){
                        //slideParent.insertBefore(slideElemWrapper,nextSlideWrapper);
                        this.prepareNewSlide(slideElem);
                        /*
                        //refresh this.slides
                        this.refreshSlidesObject();
                        //display the slidenumber in the slidesorter too
                        var selectedSlideId = this.selectedSlide.id;
                        var currentSelectedSlide = this.editor.document.getById(this.selectedSlide.id);
                        if (currentSelectedSlide !=null){
                            this.selectedSlide =currentSelectedSlide.$;
                            var slideNumberDiv = document.getElementById(this.slideNumberDivId);
                            this.displaySlideNumber(this.selectedSlide, slideNumberDiv);
                            this.selectSlide(this.selectedSlide);
                        }
                        */
                        this.removeDndInsertImgs(data.slideElemWrapper);
                        //create the slideUtil div
                        var slideArray = [];
                        slideArray.push(slideElem);
                        this.createSlideUtilDiv(slideArray);

                        // add a coediting-rollback condition here
                        if(data.isFromUndo == true || data.isRollBack == true){
                            this.simulateSlideClick(slideElem);
                        }

                        //display the slidenumber in the slidesorter too
                        if (this.selectedSlide) {
                          var selectedSlideId = this.selectedSlide.id;
                          var currentSelectedSlide = this.editor.document.getById(this.selectedSlide.id);
                          if (currentSelectedSlide !=null){
                              this.selectedSlide =currentSelectedSlide.$;
                              //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
                              this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);
                              this.selectSlide(this.selectedSlide);
                          }
                        }

                        // Update date time fields
                        //this.updateHeaderFooterDateTimeFields(slideElem);
                        this.addSlideToContentObj(slideElem);
                        var isFromCoedit = true;
                        this.scrolling(null, true);
                        //refresh user slide coediting indicator
                        //for some reason if IE or Safari user create a slide
                        //the slideSelected event is processed first before the slide is created here
                        //then the slideSelected event fails to add border to the new slide
                        //so not after process the slide, we make sure to refresh coediting indicator just in case
                        //there was slideSelected msg is already processed before the slide is created and we missed it
                        this.refreshSlideLockIndicators();

                        // add browser-specific class to slide wrapper.
                        // this class should NOT be coedited!
                        this.addBrowserClassToWrapper( slideElem );
                    }
                }
            }
        }
    },
    handleUndoRedoInserSlideWrapper:function(data){
        if(data!=null){
            if(data.slideElemWrapper !=null){
                var slideElems = dojo.query(".draw_page", data.slideElemWrapper);
                if(slideElems!=null && slideElems.length>0){
                    var slideElem = slideElems[0];
                    if(data.isFromUndo == true){
                        if(this.selectedSlide.id != slideElem.id){
                            var slideElemInEditorDoc = this.editor.document.$.getElementById(slideElem.id);
                            this.simulateSlideClick(slideElemInEditorDoc);
                        }else{
                            //do it twice to get it selected
                            //if it already selected do it once desect it, twice to select it
                            var slideElemInEditorDoc = this.editor.document.$.getElementById(slideElem.id);
                            if(!dojo.hasClass(slideElemInEditorDoc,"slideSelected")){
                                this.simulateSlideClick(slideElemInEditorDoc);
                                //this.simulateSlideClick(slideElemInEditorDoc);
                            }else{//this is already selected, just need to republish the selected event
                                this.publishSlideSelectedEvent( slideElemInEditorDoc);
                            }
                        }

                        //create the slideUtil div
                        var slideArray = [];
                        slideArray.push(this.selectedSlide);
                        this.createSlideUtilDiv(slideArray);

                        //refresh this.slides
                        //this.refreshSlidesObject(); //already done in createSlideUtilDiv
                        //display the slidenumber in the slidesorter too
                        //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
                        this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);

                        //Delete dndInsertBar imgs
                        this.removeDndInsertImgs(data.slideElemWrapper);
                    }
                }
            }
        }
    },
    // jmt - coeditfix need verify.. this function may be obsolete
    removeDndInsertImgs: function(slideWrapper, msgPairList){
        if(msgPairList == null){
            msgPairList = new Array();
        }
        if(slideWrapper!=null){
            var insertDndImgs = dojo.query("dndDropPosBefore dndDropPosAfter", slideWrapper);
            for(var j=0; j<insertDndImgs.length; j++){
                //send coediting
                var elem = this.editor.document.getById(drawFrameChildId);
                msgPairList = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
                dojo.destroy(insertDndImgs[j]);
            }
        }
        return msgPairList;

    },

    /* JMT - Commenting this out we should no longer need this function
    handleUndoRedoDeleteSlideWrapper:function(data){
        if(data!=null){
            this.refreshSlidesObject();
            if(data.nextSlideWrapperId!=null){
                //if id == "" , select the last slide
                var nextSlideWrapperId = data.nextSlideWrapperId;
                var nextSlide = null;
                if(nextSlideWrapperId == ""){
                    nextSlide = this.slides[this.slides.length-1];
                }else {
                    var nextSlideWrapper = this.editor.document.$.getElementById(nextSlideWrapperId);
                    if(nextSlideWrapper!=null){
                        nextSlide = nextSlideWrapper.firstChild;
                    }
                }
                if(data.isFromUndo == true){
                    //check if the selectedSlide is still in the document
                    var selectedSlide =this.editor.document.$.getElementById(this.selectedSlide.id);
                    if(selectedSlide == null && nextSlide !=null){
                            this.simulateSlideClick(nextSlide);
                    }
                }
            }
        }
    },
    */

    handleMultipleInsertNodeFrameFromSlideEditor:function(data, noNeedToSendMsg){
        if(data!=null && data.nodeList!=null){
            var msgPairList = [];
            //objList.push({'node':newNode,'parentId': parentNode.id,'siblingId': siblingNode.id});

            for (var i=0; i< data.nodeList.length;i++){
                var obj = data.nodeList[i];
                var element = obj.node;
                var parentId = obj.parentId;
                var prevSiblingId = obj.siblingId; //previous sibling id
                var parentElem = this.editor.document.$.getElementById(parentId);
                //var prevSibling = this.editor.document.$.getElementById(prevSiblingId);
                if(parentElem == null){
                    console.log("Trying to insert an orphan frame, not a valid slide element, not processed.");
                    return;
                }
                if(element.id == null || element.id == ""){
                    this.setFrameId(element);
                }
                parentElem.appendChild(element);
                //build message list
                msgPairList = SYNCMSG.createInsertNodeMsgPair(element,msgPairList);

            }
            if (msgPairList.length>0 && !noNeedToSendMsg){
            	PresCKUtil.doUpdateListStyleSheet();
                if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
                	msgPairList[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
                	msgPairList[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
    				pe.scene.slideSorter.postListCssStyleMSGList = null;
    				pe.scene.slideSorter.preListCssStyleMSGList = null;
    			}            	
            	SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
            }
            return msgPairList;
        }
    },

    handleDeleteNodeFrameFromSlideEditor:function(data){
        if(data!=null && data.node!=null && data.parentId !=null){
            var elementId = data.node;
            var element = this.editor.document.$.getElementById(elementId);
            var parentId = data.parentId;
            var parentElem = this.editor.document.$.getElementById(parentId);
            if(parentElem !=null){
                //process send coedit msg
                this.coeditingSendMsgForDeleteFrame(elementId,data);
                dojo.destroy(element);
            }
        }
    },
    
    handleMultipleDeleteNodeFrameFromSlideEditor: function(data){
        if(data!=null && data.nodeList!=null){
            var msgActs = [];
            // objList.push({'node':this.CONTENT_BOX_ARRAY[i].mainNode.id,'parentId':this.mainNode.id});
            for (var i=0; i< data.nodeList.length;i++){
                var obj = data.nodeList[i];
                var elementId = obj.node;
                var element = this.editor.document.$.getElementById(elementId);
                var parentId = obj.parentId;
                var parentElem = this.editor.document.$.getElementById(parentId);
                //var prevSibling = this.editor.document.$.getElementById(prevSiblingId);
                if(parentElem !=null){
                    //process send coedit msg
                    //this.coeditingSendMsgForDeleteFrame(elementId);
                    var elem = this.editor.document.getById(elementId);
                    var actPair = SYNCMSG.createDeleteElementAct(elem.getIndex(), 1, elem.getParent(), [elem], true);
                    msgActs.push(actPair);
                    PresCKUtil.deleteILBeforeStyles(elem);
                    //parentElem.removeChild(element);
                }
            }
            if (msgActs.length>0){
            	PresCKUtil.doUpdateListStyleSheet();
            	// Just send one message when deleting multiple content box
                var msg = [ SYNCMSG.createMessage(MSGUTIL.msgType.Element, msgActs) ];
                if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){				
                	msg[0].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
                	msg[0].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
    				pe.scene.slideSorter.postListCssStyleMSGList = null;
    				pe.scene.slideSorter.preListCssStyleMSGList = null;
    			}
                SYNCMSG.sendMessage(msg, SYNCMSG.SYNC_SORTER);
            }
        }
    },

    handleInsertNodeFrameFromSlideEditor:function(data){
        if(data!=null && data.node!=null){
            var element = data.node;
            var parentId = data.parentId;
            var prevSiblingId = data.siblingId; //previous sibling id
            var parentElem = this.editor.document.$.getElementById(parentId);
            //var prevSibling = this.editor.document.$.getElementById(prevSiblingId);
            if(parentElem == null){
                console.log("Trying to insert an orphan frame, not a valid slide element, not processed.");
                return;
            }
            if(parentElem!=null){
                if(element.id == null || element.id == ""){
                    this.setFrameId(element);
                }
                
                //If sorter already has the div node, then replace it.
                var isTable = (dojo.attr(data.node, "presentation_class") == "table");
                var toAppend = true;
                if(isTable){
                	var sorterDoc = PROCMSG._getSorterDocument();
                	var dupNode = dojo.byId(element.id, sorterDoc);
                	var oldTopV = null, oldLeftV = null;
                	if(dupNode){
                		var oldTopV = dupNode.style.top;
                		var oldLeftV = dupNode.style.left;
                		dojo.destroy(dupNode);//remove existing one
                		dojo.removeClass(element, "resizableContainerSelected"); 
                		parentElem.appendChild(element); //append the new one
                		element.style.top = oldTopV;
                		element.style.left = oldLeftV;
                		toAppend = false;
                	}
                }
                
                if(toAppend){
                	parentElem.appendChild(element); //append the new one
                }
                
                //for insert a new table, we don't create insert DF node message here but after the whole process is done
                if(!isTable){
                	//process send coedit msg
                	this.coeditingSendMsgForInsertFrame(element,data);
                }
            }
        }
    },
    //set slide elements id with new UUID
    setFrameId:function(frameElem){
        if(frameElem!=null){
            concord.util.HtmlContent.injectRdomIdsForElement(frameElem);
            //set ids for all children elements
            var children = frameElem.getElementsByTagName('*');
            for(var i =0; i<children.length; i++){
                concord.util.HtmlContent.injectRdomIdsForElement(children[i]);
            }
        }
    },
    //set slide elements id with new UUID
    setDivIdWithChildren:function(divElem){
        if(divElem!=null){
            this.setFrameId(divElem);
        }
    },
 
    //
    // Removes user slide locks except for lock on elemId. If elemId is null then it removes all locks for this user.
    // Also removes dotted line border on slides when lock is released on a slide
    //
    removeUserLock: function(user,elemId){
        var slideNodeLockedEntries = this.currentScene.getSlideNodeLockedEntryForUser(user);
        if(slideNodeLockedEntries!=null && slideNodeLockedEntries.length>0){
            for(var s=0; s<slideNodeLockedEntries.length; s++){
                var entry = slideNodeLockedEntries[s];
                if(entry.action == "slideSelected"){
                    var slideId = entry.drawFrameId;
                    if(slideId != elemId){
                        var element2 = this.editor.document.$.getElementById(slideId);
                        if(element2 != null){
                            this.removeSlideCoeditIndicator(element2);
                            this.currentScene.slideNodeLockStatusRemoveEntry(slideId,user);
                        }
                    }
                }
            }
        }
    },

    /*
     * @param user object that we want to skip, in the case we call this after we processed one user (e.g. when handleSlideSelectedByOtherUser)
     */
    refreshSlideLockIndicators: function(userIn){
        //get users who have lock
        var users  = window['pe'].scene.getUsersFromLockArray();
        for (var userId in users){

            var slideNodeLockEntriesByThisUser = window['pe'].scene.getSlideNodeLockedEntryForUser(users[userId]);
            if(slideNodeLockEntriesByThisUser!=null && slideNodeLockEntriesByThisUser.length>0){
                for(var i=0; i< slideNodeLockEntriesByThisUser.length; i++){
                    var action= slideNodeLockEntriesByThisUser[i].action;
                    var drawFrameId = slideNodeLockEntriesByThisUser[i].drawFrameId;
                    var user = slideNodeLockEntriesByThisUser[i].user;
                    if((userIn==null || user!=userIn) && action == "slideSelected"){
                        var element = this.editor.document.$.getElementById(drawFrameId);
                        this.updateCoeditSlideIndicator(userId, element);

                    }
                }
            }
        }

    },

    requestSlideLockStatus: function(){
        //get users who have lock
        var msg = SYNCMSG.createRequestLockStatusMsg();
        var msgPairsList = [];
        msgPairsList.push(msg);
        SYNCMSG.sendMessage(msgPairsList, SYNCMSG.NO_LOCAL_SYNC);
    },
    handleSlideSelectedByOtherUserRemoved:function(data){
        if(data!=null && data.slideId!=null){
            var sorterDoc = this.getSorterDocument();
            if(sorterDoc!=null){
                var element = sorterDoc.getElementById(data.slideId);
                // 33891: [Co-editing] User delete multi slides and undo, there is no indicator on co-editor's sorter.
                if(element && dojo.hasClass(element, "draw_page")){ //if it is a slide
                    this.removeSlideCoeditIndicator(element);
                }
            }
        }
    },
    removeSlideCoeditIndicator:function(slideElem){
        if(slideElem!=null){
            var slideWrapper = slideElem.parentNode;
            if(slideWrapper!=null){
                slideWrapper.style.border = "";
            }
        }
    },

    //D16739 make sure a coediting users content box locks are removed when they select a slide
    handleRemoveUserContentBoxLocks: function(user) {
        if(user!=null){
            var slideNodeLockedEntries = this.currentScene.getSlideNodeLockedEntryForUser(user);
            if(slideNodeLockedEntries!=null && slideNodeLockedEntries.length>0){
                for(var s=0; s<slideNodeLockedEntries.length; s++){
                    var entry = slideNodeLockedEntries[s];
                    if(entry!=null){
                        var slideId = entry.drawFrameId;
                        //if the user has a content box lock then remove it
                        //when a user selects a slide they should not have any
                        //content boxes in edit mode
                        if (entry.action == "inEdit") {
                            //console.info(entry);
                            this.currentScene.slideNodeLockStatusRemoveEntry(entry.drawFrameId,user);
                        }
                    }
                }
            }
        }
    },

    handleSlideSelectedByOtherUser:function(data){
        if(data!=null && data.msg !=null && data.msg.user!=null && data.msg.action == "slideSelected"){
            var elemId = data.msg.drawFrameId;
            var element = this.editor.document.$.getElementById(elemId);
            var user = data.msg.user;
            var userId = user.id;
            console.info("slideSelectedByUser:"+ userId);
            
            // no need to remove locks. the edit mode will be exited when refresh the page
            // the clean work will be found in function this.handleUserLeft

            // D16739
            // this.handleRemoveUserContentBoxLocks(user);
            
            this.updateCoeditSlideIndicator(userId, element);
            if(elemId!=null){
                this.removeUserLock(user,elemId);
                //refresh other user's slide indicator here
                this.refreshSlideLockIndicators(user);

            }
        }

    },
    updateCoeditSlideIndicator:function(userId, element){
        if(userId!=null && element!=null){
        	try{
        		var color = pe.scene.getEditorStore().getEditorById(userId).getEditorColor();
        		color && (element.parentNode.style.border = "3px dotted "+color);
        	}catch (e){
        	}
        }
    },

    handleCoeditPreDeleteSlide:function(data){
        var slideElemWrapper = this.editor.document.$.getElementById(data.slideWrapperDeletedId);
        if(slideElemWrapper !=null) {
            //To avoid delete comment event send to comment bar, when delete a slide
            //for defect 17620
            this.deleteSlideComments(slideElemWrapper);
            var slideElem = this.editor.document.$.getElementById(data.slideDeletedId);
            if (slideElem != null){
                this.disconnectEvents(slideElem);
            }
//            this.slides=null;  //will be set in refreshSlidesObject
            this.prepSlideDeleteDNDHandle();
        }
        slideElemWrapper = null;
        slideElem = null;
    },

    handleCoeditDeleteSlide:function(data){
        if(data!=null){
            //refresh this.slides
            this.refreshSlidesObject();
            //if id == "" , select the last slide
            var nextSlideWrapperId = (data.nextSlideWrapperId==null)? "" : data.nextSlideWrapperId;
            var nextSlide = null;
            if(nextSlideWrapperId == ""){
                nextSlide = this.slides[this.slides.length-1];
            }else {
                var nextSlideWrapper = this.editor.document.$.getElementById(nextSlideWrapperId);
                if(nextSlideWrapper!=null){
                    nextSlide = nextSlideWrapper.firstChild;
                }else {
                    nextSlide = this.slides[this.slides.length-1];
                }
            }
            if(nextSlide !=null){
                var slideDeletedId = data.slideDeletedId;
                // add a coediting roll-back flag condition here
                // and with similar handling like undo
                if(data.isFromUndo == true || data.isRollBack == true){
                    //check if the selectedSlide is still in the document, is this part of the deletedSlide
                    var selectedSlide =this.editor.document.$.getElementById(this.selectedSlide.id);
                    if(selectedSlide == null && nextSlide !=null){
                            var isToIgnoreCtrlKey = true;//isToIgnoreCtrlKey, for the case from ctrl+z, in ie when we do simulate slideclick, ctrl key still sticks, needs to flag it to ignore it.
                            this.simulateSlideClick(nextSlide, isToIgnoreCtrlKey);
                    }

                }else if(slideDeletedId!=null && slideDeletedId !=""){
                    var selectNextOnDelete = (data.selectNextOnDelete!=null)? data.selectNextOnDelete: true;

                    if(nextSlide !=null && this.selectedSlide && this.selectedSlide.id == slideDeletedId && selectNextOnDelete){ //if the deleted slide is the selected slide
                        this.simulateSlideClick(nextSlide);
                    }
                }

                this.postSlideDeleteDNDHandle();

                //display the slidenumber in the slidesorter too
                //var slideNumberDiv = document.getElementById(this.slideNumberDivId);
                this.displaySlideNumber(this.selectedSlide, this.slideNumberDiv);

                //delete from contentObject
                this.deleteSlideFromContentObj(slideDeletedId);
                var isFromCoedit=true;
                this.scrolling(null,isFromCoedit);
            }

        }
    },

    handleTemplateAppliedByOtherUser:function(data){
        if(data!=null && data.msg !=null && data.msg.newTemplateCss!=null &&data.msg.oldTemplateCss!=null && data.msg.action == "templateApplied"){
            var oldTemplateCss = data.msg.oldTemplateCss;
            if(oldTemplateCss!=null && oldTemplateCss.length>0){
                //D14414: [Regression][MasterStyle] Font color is not black after switch back to default template.
                oldTemplateCss = concord.util.uri.stripRelativePathInfo(oldTemplateCss);
                concord.util.uri.removeCSS(document,oldTemplateCss);
            }
        }
    },
    handleLayoutAppliedByOtherUser:function(data){
        if(data!=null && data.slideId != null) {
            var slideElem = this.editor.document.$.getElementById(slideId);
            if(slideElem!=null && this.selectedSlide == slideElem){
            //publish a apply layout message for slideEditor to refresh layout
            var eventData = [{'eventName': concord.util.events.slideSorterEvents_eventName_layoutAppliedFromCoediting,'slideSelected':slideElem}];
     		dojo.publish(concord.util.events.slideSorterEvents, eventData);
            }

        }
    }
    //wangxum@cn.ibm.com
    ,getSlideElementById:function( slideId ){
        var slides = this.getAllSlides();
        for(var i=0; i < slides.length; i++){
            if( slideId == slides[i].id )
                return slides[i];
        }
        return null;
    }
    ,showSlide:function( slideIdToShow ){
        var slideToShow = this.editor.document.$.getElementById(slideIdToShow);
        this.simulateSlideClick(slideToShow);
    },

    handleCommentSelected: function (data)
    {
        if(data!=null && data.eventName == concord.util.events.commenttingEvents_eventName_commentSelected){
            var selectedCommentId = data.commentsId;
            var sca = pe.scene.slideSorter.contentHandler.slideContentArray;
            var frame = null;
            var slideId = null;
            for(var i=0;i<sca.length;i++){
            	var slide = sca[i];
            	var sContent = slide.slideInnerHtml;
            	if (sContent) {
        			var ckNode = new CKEDITOR.dom.element('div', this.editor.document );	
        			if (ckNode) {
        				ckNode.setHtml(sContent);
        				frame = dojo.query("[commentsId*='" + selectedCommentId +"']",ckNode.$)[0];
        				if(frame)
        				{
        					ckNode.remove();
        					slideId = slide.slideId;
        					break;
        				}
        			}
        			ckNode.remove();
        		}
            }
            
            if(slideId)
            {
                if (!(!concord.util.browser.isMobile() && slideId == pe.scene.getSlideSelectedId())){
                	this.simulateSlideClickById(slideId);
                } else {
                	delete pe.incommentsSelected;
                	pe.scene.slideEditor.deSelectAll();
                }
                var eventData = [ {
                    'eventName' : concord.util.events.slideSorterEvents_eventName_commentSelectedInSlideOpened,
                    'commentsId' : selectedCommentId
                } ];
                dojo.publish(
                        concord.util.events.slideSorterEvents,
                        eventData);
            } else {  //D13306 handle orphan comments.
                window.pe.scene.slideEditor.deSelectAll();
            }
        }
    },
    handleCommentUnselected: function (data)
    {
        if(data!=null && data.eventName == concord.util.events.commenttingEvents_eventName_commentUnselected){
            var unselectedCommentId = data.commentsId;

                var eventData = [ {
                    'eventName' : concord.util.events.slideSorterEvents_eventName_commentUnselectedInSlideOpened,
                    'commentsId' : unselectedCommentId
                } ];
                dojo.publish(
                        concord.util.events.slideSorterEvents,
                        eventData);

        }
    },
    //jmt - coeditfix
    handleCommentDeleted: function (data) {
        if(data!=null && data.eventName == "commentDeleted") {
            var selectedCommentId = data.commentsId;

            //using separate msgList to send special comment message
            //and using session.sendMessage vs SYNCMSG.sendMessage due to there is no reversed message for this special
            //comment message, and not having the rMsg throws error if using SYNCMSG.sendMessage (defect 46863)
            // append comments content message in the message queue

            var sess = window.pe.scene.session;
            var msgCMTS = sess.createMessage();
            msgCMTS.type = "comments";
            msgCMTS.action = "delete";
            msgCMTS.id = selectedCommentId;
            var msgList  = [];
            msgList.push(msgCMTS);
            pe.scene.session.sendMessage(msgList);

            //handle removing comments link from frame
            var frame = dojo.query("[commentsId*='" + selectedCommentId +"']",this.editor.document.$)[0];
            if(frame) {
                var commentsId = dojo.attr(frame,'commentsId');
                if(commentsId != null) {
                    var array = commentsId.split(' ');
                    var newCommentsId = '';
                    var msgPairList = new Array();
                    for( var i = 0; i<array.length;i++) {
                        if(selectedCommentId == array[i])
                            continue;
                        newCommentsId += array[i] + ' ';
                    }
                    newCommentsId = dojo.trim(newCommentsId);
                    if(frame != null) {
                        if(newCommentsId == null || newCommentsId == '') {
                            // jmt - coeditfix
                            var attrName = "comments";
                            msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(frame), attrName, 'false', msgPairList);
                            dojo.attr(frame,'comments','false');

                            var attrName = "commentsId";
                            msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(frame), attrName, ' ', msgPairList);	//For TP3 due to minimalizing changes, need to be a space not an empty string so that the code in createAttributeMsgPair can evaluate correctly, in that function the empty string was treated as if no value, so the original attribute value was used instead
                            dojo.attr(frame,'commentsId',' ');
                        } else {
                            // jmt - coeditfix
                            var attrName = "commentsId";
                            msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(frame), attrName, newCommentsId, msgPairList);
                            dojo.attr(frame,'commentsId',newCommentsId);
                        }

                        //Add delete comment icon
                        var msgPair = SYNCMSG.deleteCommentMsg(frame.id, selectedCommentId);
                        msgPairList.push(msgPair);

                        //publish message to delete icon in editor
                        var eventData = [{
                            'eventName': concord.util.events.slideSorterEvents_eventName_deleteCommentIcon,
                            'drawFrameId':frame.id,
                            'commentId': selectedCommentId
                        }];
                        dojo.publish(concord.util.events.slideSorterEvents, eventData);

                        //SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
                        //-replace removeUndo
                        //comment doesn't support undo
                        var addToUndo = false;
                        msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);

                        SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_CANVUS);
                    }
                }
            }

            // 15079 show slide level comments on desktop
//            var slideEditor = window.pe.scene.slideEditor;
//            if (slideEditor)
//                slideEditor.handleDelSlideComment(selectedCommentId);
        }
    },

    // jmt - coeditfix
    handleLayoutConvertedToRealDrawFrame:function(data){
        var msgPairList = new Array();
        if(data!=null && data.dataNodeId!=null){
            var boxElem = this.editor.document.$.getElementById(data.dataNodeId);
            if(boxElem!=null){
            ////
                var nodes = dojo.query('.defaultContentText',boxElem);
                for (var i=0; i< nodes.length; i++){
                    var attrName = "class";
                    var newE = new CKEDITOR.dom.node(nodes[i]);
                    var oldAttrValue = newE.getAttribute(attrName);
                    dojo.removeClass(nodes[i],'defaultContentText title subtitle outline');
                    msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);
                }

                var attrName = "class";
                var newE = new CKEDITOR.dom.node(boxElem);
                var oldAttrValue = newE.getAttribute(attrName);
                dojo.removeClass(boxElem,'layoutClassSS');
                msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);

                var attrName = "class";
                var newE = new CKEDITOR.dom.node(boxElem.parentNode);
                var oldAttrValue = newE.getAttribute(attrName);
                dojo.removeClass(boxElem.parentNode,'layoutClass');
                msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);


                var attrName = "emptyCB_placeholder";
                msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(boxElem.parentNode), attrName, 'false', msgPairList);
                dojo.attr(boxElem.parentNode,'emptyCB_placeholder','false');

            }
        }else if(data!=null && data.drawFrameID!=null){
            var drawFrameId = data.drawFrameID;
            var drawFrame = this.editor.document.$.getElementById(drawFrameId);
            var presClass = drawFrame.getAttribute("presentation_class");
            var newDrawFrame = data.drawFrameNode;
            if(presClass == "graphic" && newDrawFrame !=null && drawFrame!=null){
                //delete the current draw frame children
                var drawFrameChildren = drawFrame.children;
                for(var i=0; i < drawFrameChildren.length; i++){
                    var drawFrameChildId = drawFrameChildren[i].id;

                    // jmt - coeditfix
                    var elem = this.editor.document.getById(drawFrameChildId);
                    msgPairList  = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);

                    dojo.destroy(drawFrameChildren[i]);
                }
                //add children from new draw frame
                //var newDrawFrameChildren = newDrawFrame.children;
                //for(var i=0; i < newDrawFrameChildren.length; i++){
                    var newDrawFrameChild = dojo.query('.contentBoxDataNode',newDrawFrame)[0];
                    var newDrawFrameChildId = newDrawFrameChild.id;
                    var newDrawFrameChildClone = dojo.clone(newDrawFrameChild);
                    drawFrame.appendChild(newDrawFrameChildClone);
                    //jmt - coedit fix
                    msgPairList = SYNCMSG.createInsertNodeMsgPair(newDrawFrameChildClone,msgPairList);
                //}


                var attrName = "class";
                var newE = new CKEDITOR.dom.node(drawFrame);
                var oldAttrValue = newE.getAttribute(attrName);
                dojo.removeClass(drawFrame,'layoutClass');
                msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);


                var attrName = "emptyCB_placeholder";
                msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(drawFrame), attrName, 'false', msgPairList);
                dojo.attr(drawFrame,'emptyCB_placeholder','false');
            }
        }
        SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
    },

    extractStyleElements: function() {
        var styleElementsArray = new Array();
        var styleNodeList = concord.util.HtmlContent.getStyleElements(this.editor.document.$);
        var fragment = null;
        for(var i = 0; i< styleNodeList.length; i++){
            if(styleNodeList[i].outerHTML.indexOf('list_before_style') <0){
                styleElementsArray.push(styleNodeList[i].cloneNode(true));
            } else {
                fragment = styleNodeList[i].cloneNode(false);
            }
        }
        //43098: [B2B][Regression]The list symbol size display small in slide show
        if(fragment){  //add list_before_style , in slideShow.js will use styleElementsArray[i].innerHTML;
            for ( var listStyleName in pe.scene.slideSorter.listBeforeStyleStack ){
                var ruleName = '.' +listStyleName+':before';
                if(dojo.isIE || dojo.isWebKit) 
                    ruleName = '.' +listStyleName+'::before';
                var ruleContent =  pe.scene.slideSorter.listBeforeStyleStack[ listStyleName ];
                var rule = ruleName + ' {' +ruleContent +'}';
                var rules = this.editor.document.$.createTextNode(rule);
                fragment.appendChild(rules);
            }
            styleElementsArray.push(fragment);
        }
        return styleElementsArray;
    },

    extractLinkElements: function() {
        var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$);
        var linkElementsArray = new Array();
        for(var i = 0; i< linkNodeList.length; i++){
            var href = linkNodeList[i].getAttribute("href");
            var concordSlideSorterCssIdx = href.indexOf(this.concordSlideSorterCssUrl);
            var listSlideSorterCssIdx = this.regExpListSlideSorterCssUrl.test(href);
            if (concordSlideSorterCssIdx < 0 && listSlideSorterCssIdx == false){
                linkElementsArray.push(linkNodeList[i].cloneNode(true));
            }
        }
        return linkElementsArray;
    },

    handleHtmlPrintRequest:function() {
        var styleElementsArray = this.extractStyleElements();
        var linkElementsArray = this.extractLinkElements();
        var slidesHtml = this.getAllSlidesContentHTML();
        var eventData = [{
                eventName: concord.util.events.slideSorterEvents_eventName_presHtmlPrintData,
                slides:slidesHtml,
                linkElements:linkElementsArray,
                styleElements:styleElementsArray,
                currSelectedSlideNumber: this.getSlideNumber(this.selectedSlide)
            }];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);
    },
    handleSlideShowRequest:function() {
        //var slides = this.getAllSlides();
        var styleElementsArray = this.extractStyleElements();//new Array();
        var linkElementsArray = this.extractLinkElements();
        var slidesHtml = this.getAllSlidesContentHTML();
        var eventData = [{
                eventName: concord.util.events.slideSorterEvents_eventName_slideShowData,
                slides:slidesHtml,
                linkElements:linkElementsArray,
                styleElements:styleElementsArray,
                currSelectedSlideNumber: this.getSlideNumber(this.selectedSlide)
            }];
        dojo.publish(concord.util.events.slideSorterEvents, eventData);
    },
    handleUndoMsg:function(data){
        if(data!=null && data.slideId!=null){
            var slide = this.editor.document.$.getElementById(data.slideId);
            if(slide!=null){
                this.simulateSlideClick(slide);
            }
        }
    },
    handleUndoApplyTemplate:function(data){
        if(data!=null && data.msg.templateData!=null && data.msg.action == "applyTemplate"){

            var templateDataJSON = dojo.fromJson(data.msg.templateData);
            var isFromUndo = true;
            this.applyTemplate(this.selectedSlide.id, templateDataJSON, isFromUndo);
        }
    },

    //concord.util.events.slideSorterEvents_eventName_cleanupOldContentBeforeReset
    handleCleanupOldContentBeforeReset:function() {
        var contentBox = window.pe.scene.getContentBoxCurrentlyInEditMode();
        if(contentBox != null && contentBox.isEditModeOn()) {
            contentBox.toggleEditMode(false);
        }

        if(this.selectedSlide != null){
            this.selectedSlideId = this.selectedSlide.id;
        }

        this.multiSelectedSlideIds = new Array();
        if(this.multiSelectedSlides!=null && this.multiSelectedSlides.length>0){
            for(var i=0; i < this.multiSelectedSlides.length; i++){
                this.multiSelectedSlideIds.push(this.multiSelectedSlides[i].id);
            }
        }

        //destroy old contextmenus
        this.destroyContexMenus();
    },

    //@param fromAction is the action that generate the publishSlideSelectedEvent call
    //can be onclick, etc
    publishSlideSelectedEvent:function(slideElem, fromAction){
        //cancel slide nav timeout
        window.pe.scene.slideEditor.clearSlideNavSetTimeout();
        var eventDataWidgTrue = {'eventName': 'slideSelected','slideSelected':slideElem,'isWidgitizeImmediately':false, 'fromAction':fromAction};
        window.pe.scene.slideEditor.handleSlideSelectedEvent(eventDataWidgTrue);
        dojo.publish(concord.util.events.slideSorterEvents, [eventDataWidgTrue]);
    },

    //Defect 39382: [Co-editing] [OT]: Async occur when user1 change text property to bold and user2 change text to other property
    //Called by PresDocScene
    getEditor: function()
    {
        return this.editor;
    },
    addEditor : function(editorId){
        if (!pe.scene.getEditorStore().exists(editorId)){
            var editor = {};
            var userBean = ProfilePool.getUserProfile(editorId);
            editor.userId = userBean.getId();
            editor.orgId = userBean.getOrgId();
            editor.displayName = userBean.getName();

            pe.scene.getEditorStore().add(new concord.beans.EditorItem(editor));
        }

    },

    refreshEditorIfNeeded : function(editorId){
        if (!pe.scene.getEditorStore().exists(editorId)){
            pe.scene.getEditorStore().refresh();
        }
    },

    spellCheckSlides: function(slides)
    {
        if(this.spellChecker && this.spellChecker.isAutoScaytEnabled()){
            for(var i=0; i<slides.length; i++)
            {
                this.spellChecker.checkNodes(slides[i], slides[i], null);
            }
        }
    },

    //
    // disconnectAllEvents
    //
    disconnectAllEvents: function(){
        var thumbnails = dojo.query('.draw_page', this.editor.document.$);

        for (var i=0; i<thumbnails.length; i++)
        {
            this.disconnectEvents(thumbnails[i]);
        }
    },

    //
    // For cleaning up nulls essential variables so nodes can be destroyed freely
    //
    nullifyVariables: function(){
        this.connectArray = null;
        this.presHtmlContent =null;
        this.ckeditorInstanceName =null;
        this.divContainerId =null;
        this.slideSorterPageClassName=null;
        this.ckeditorToolbarContainerId=null;
        this.contextMenusArray =null;
        this.editor=null;
        this.CKEDITOR=null;
        this.slides=null;
        this.selectedSlide=null;
        this.multiSelectedSlides=null;
        this.slideSorterToolDivId=null;
        this.concordSlideSorterCssUrl=null;
        this.listSlideSorterCssUrl=null;
        this.xmlHttpReq_master=null;
        this.xmlHttpReq_layout=null;
        this.masterHtmlDivId=null;
        this.layoutHtmlDivId=null;
        this.messageDivId=null;
        this.slideNumberDivId=null;
        this.slideSorterToolsId=null;
        this.layoutHtmlDocUrl=null;
        this.slideSorterDndSource=null;
        this.presBean=null;
        this.authUser=null;
//        this.docAcl=null;
        this.taskHandler=null;
        this.notifyTool=null;
        this.currMaster=null;
        this.currMasterFrameStylesJSON=null;
        this.saveMasterUrl=null;
        this.slideSorterToolDivHeight=null;
        this.slidesToCopy=null;
        this.PASTE_AFTER=null;
        this.PASTE_BEFORE=null;
        this.isDNDSession=null;
        this.dndCmdList=null;
        this.userLocks	=null;
        this.connectArray	=null;
        this.currentScene=null;
        this.isCkeInstanceReady=null;
        this.STRINGS=null;
        this.documentBodyDnDMouseUpEvt=null;
        this.documentBodyDnDMouseOutEvt=null;
        this.presDivDnDMouseOverEvt =null;
        this.documentBodyDnDClickEvt = null;
    },

    initVariables: function() {
        this.listBeforeStyleSheet = null;
        // clear partial loading timers
        this.stopPartialLoading();
        // TODO(lijiany)
        // Destroy other props if needed or after coediting reloading
        // new slide content will be appended after old content due to sorter is old one
    },

    //
    // delete slides when unloading the application
    //
    deleteSlidesForUnLoad: function(){
        this.prepSlideDeleteDNDHandle();
        this.multiSelectedSlides=null;
        for(var i=0; i < this.slides.length; i++){
            var _ss = this.slides[i];
            this.deleteFromContextMenusArray(_ss);
            if (this.ctxMemLeakHash[_ss.id]) {
                for(var indx=0; indx< this.ctxMemLeakHash[_ss.id].length; indx++){
                    try{
                        this.ctxMemLeakHash[_ss.id][indx].obj.destroyRecursive();
                    }catch(e){
                    }
                }
            }
            this.disconnectEvents(_ss);
            dojo.destroy(_ss.parentNode);
            this.slides=null;
            this.selectedSlide =null;
            this.refreshSlidesObject();
            i=i-1;
        }
    },

    //
    // Destroy Sorter
    //
    destroySlideSorter: function(){
        this.deleteSlidesForUnLoad();
        console.log('slideSorter:destroySlideSorter','begin...');
        // Need cleanup slidesorter reference first in the spellchecker
        if (this.spellChecker) {
            try{
                this.spellChecker.removeAllNodes();
                this.spellChecker = null;
            }catch(e){
            }
        }

        // 1 disconnect events
        this.disconnectAllEvents();

        // 2 Nullify variables
        this.nullifyVariables();
        console.log('slideSorter:destroySlideSorter','end...');
    },
    
    cleanContent: function(){
        // Need cleanup slidesorter reference first in the spellchecker
        if (this.spellChecker) {
            try{
                this.spellChecker.removeAllNodes();
                this.spellChecker = null;
            }catch(e){
            }
        }

        // 2 init vars
        this.initVariables();
    },

    //******* Slide sorter performance ************
    prepPresContent:function(presContentHtmlStr){
        var contentHtml = presContentHtmlStr ? presContentHtmlStr : this.presHtmlContent;

        if(contentHtml){
            /* #9611 - no need to update static root path this way, moving out master styles files so it is not affected by static root path
            //here to update the src Url replacing old staticrootpath with current staticrootpath
            this.docStaticRootPath = this._getStaticRootPathFromAttr(presContentHtmlStr);
            //Code was removed by #27400  */
            this.contentHandler = new concord.widgets.PresContentHandler(contentHtml, this.initSlideNum);
            if(this.contentHandler!=null){
                this.presHtmlContent = this.contentHandler.createInitContentShellHtml(contentHtml);
            } else {
                //TODO: Critical error, should log and exit the editor
                this.presHtmlContent = '';
            }
        }
    },

    /*defect 8759
     * needs to update url in content.html that contains old/previous build number (staticRootpath)
     * just in case the server keeps a different build number in the url
     */
     /*#9611 - no need to update static root path this way, moving out master styles files to other location that is not affected by static root path/build number
     //Code was removed by #27400  */

    //to update old version of templateDesignGallery location
    _updateTemplateDesignGalleryUrl: function(htmlStr){
        if(htmlStr!=null && htmlStr.indexOf("/js/concord/widgets/templateDesignGallery/")>=0){
            htmlStr = htmlStr.replace(/src\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'src="'+window.contextPath + "/presTemplateDesignGallery/");
            htmlStr = htmlStr.replace(/src\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "src='"+window.contextPath + "/presTemplateDesignGallery/");
            htmlStr = htmlStr.replace(/src1\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'src1="'+window.contextPath + "/presTemplateDesignGallery/");
            htmlStr = htmlStr.replace(/src1\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "src1='"+window.contextPath + "/presTemplateDesignGallery/");
            htmlStr = htmlStr.replace(/masterstylecss\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'masterstylecss="'+window.contextPath + "/presTemplateDesignGallery/");
            htmlStr = htmlStr.replace(/masterstylecss\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "masterstylecss='"+window.contextPath + "/presTemplateDesignGallery/");
        }
        return htmlStr;
    },

    /* #9611 - no need to update static root path this way, moving out master styles files to other location that is not affected by static root path/build number
    _updateStaticRootPathInURL: function(presContentHtmlStr, newStaticRootPath, docStaticRootPath){
     //Code was removed by #27400  */
    getSlideById:function(slideId){
        if(this.getSorterDocument()!=null){
            return this.getSorterDocument().getElementById(slideId);
        }
        return null;
    },

    loadRangeSlidesToSorter:function(slideElemClicked) {
    	// for mobile
    	if (concord.util.browser.isMobile()) {
    		// do not swap slide for mobile
    		// in order to scroll smothly in slideSorter
    	    return;
    	}
        var slideIdsToLoad = this.getSlideIdsToLoad(slideElemClicked);
        
        var slideIdsToUnload = [];
        if (this.contentHandler != null) {
        	slideIdsToUnload = this.contentHandler.getSlideIdsOfLoadedSlides();
            
            // in "currLoadedSlideIds", in "slideIdsToLoad" --- loaded, ignore
            // in "currLoadedSlideIds", not in "slideIdsToLoad" --- to unload
            // not in "currLoadedSlideIds", in "slideIdsToLoad" --- to load
            for (var i=0; i < slideIdsToLoad.length; ++i) {
            	if (slideIdsToLoad[i] == "")
            		continue;
            	var bLoaded=false;
            	for (var j=0; j < slideIdsToUnload.length; ++j) {
            		if (slideIdsToUnload[j] == "")
            			continue;
            		
            		if (slideIdsToLoad[i] == slideIdsToUnload[j]) {
            			bLoaded = true;
            			slideIdsToUnload[j] = "";  // no need to unload
            		}
            	}  // end for j
            	if(bLoaded)// loaded, please ignore
            		slideIdsToLoad[i] = "";      // no need to load
            }  // end for i
        }  // end if
        
        // to load
        for (var i=0; i < slideIdsToLoad.length; ++i) {
        	if (slideIdsToLoad[i] == "")
        		continue;
        	
            this.loadSlideToSorter(this.getSlideById(slideIdsToLoad[i]));
        } 

        // to unload
        for (var j=0; j < slideIdsToUnload.length; ++j) {
        	if (slideIdsToUnload[j] == "")
        		continue;
        	
            this.unloadSlideFromSorter(this.getSlideById(slideIdsToUnload[j]));
        }
    },
    /*
     * Get the ids of the slide to load
     *  besides the slides in viewable area in slidesorter, we also want to load this.numLoadedSlideBuffer slides above the first slide viewable and this.numLoadedSlideBuffer slides below the last slide viewable
     *	by default load all the slides
     * @param slideElemClicked, to allow the function to calculate slide Ids to Load based on certain slide,
     * if null, just use the scrollbar calculation to determin which slide to laod
     */

    getSlideIdsToLoad:function(slideElemClicked) {
        var startNum, endNum, i;
        var slideIdToLoad = [];
        this.numLoadedSlideBuffer = this._NUM_SLIDES_IN_VIEW;
        if(slideElemClicked!=null){
            //we want to always load half of the this.numLoadedSlide above the current clicked slide and half below the current clicked slide
            var slideNumber = this.getSlideNumber(slideElemClicked);
            startNum = parseInt(slideNumber) - parseInt(this.numLoadedSlideBuffer);
            endNum = parseInt(slideNumber) + parseInt(this._NUM_SLIDES_IN_VIEW) +parseInt(this.numLoadedSlideBuffer);
        }else{
            var numSlidesInViewInt = parseInt(this._NUM_SLIDES_IN_VIEW);
            var firstSlideNumInViewInt = parseInt(this._SLIDE_IN_FIRST_POS);
            startNum = 0;
            endNum = this.slides.length;
            if(typeof(numSlidesInViewInt)=="number" && typeof(firstSlideNumInViewInt)=="number"){
                //this.refreshSlidesObject(); //no need to call every time, to improve performance..#6042, relying that this.slides is kept up to date by every other operation that modifies it
                startNum = firstSlideNumInViewInt - this.numLoadedSlideBuffer;
                endNum =firstSlideNumInViewInt + numSlidesInViewInt -1 + this.numLoadedSlideBuffer;  //(firstSlideNumInViewInt + numSlidesInViewInt -1) is the last slide in view number, then we add 6 more slides
            }
        }

        if(startNum<1){
            startNum = 1;
        }
        if(endNum>this.slides.length){
            endNum = this.slides.length;
        }
        //from the startNum to endNum range, push the slideIds to array
        for(i=startNum-1; i<endNum; i++){
            // slideIdToLoad[this.slides[i].id] = true;  // to use dense array to improve performance
        	slideIdToLoad.push(this.slides[i].id);
        }

        return slideIdToLoad;
    },
    /*
     * look at PresContentHandler and see out of the current loaded slides, given the slideIdsToLoad,
     * which ones to unload
     * @param slide ids to load based on slideElemClicked, retrieved from function this.getSlideIdsToLoad()
     */

    getSlideIdsToUnload: function(slideIdsToLoad) {
        var slideIdToUnload = [];
        if(this.contentHandler!=null && slideIdsToLoad!=null){
            var currLoadedSlideIds = this.contentHandler.getSlideIdsOfLoadedSlides();
            //compare with slideIdsToLoad, and get the one that doesn't match
            for(var i=0; i < currLoadedSlideIds.length; ++i) {
            	var inLoad = false;
            	for (var j=0; j < slideIdsToLoad.length; ++j) {
            		if (currLoadedSlideIds[i] == slideIdsToLoad[j]) {
            			inLoad = true;
            			break;
            		}
            	}  // end for j
            	
                if (!inLoad) {
                    slideIdToUnload.push(currLoadedSlideIds[i]);
                }
            }  // end for i
        }
        return slideIdToUnload;
    },

    isSlideLoaded: function(slideElem){
        var isSlideLoaded = null;
        if(slideElem!=null && this.contentHandler!=null){
            var slideId = slideElem.id;
            if(slideId!=null){
                var slideContentObj = this.contentHandler.getSlideContent(slideId);
                if(slideContentObj!=null){
                    isSlideLoaded = slideContentObj.getIsLoaded();
                }
            }

        }
        return isSlideLoaded;
    },
    //just in case the slideUtil made it to inside the slide
    //temporary as a patch, we clean it out when we load the slide
    cleanSlideUtil:function(slideElem, msgPairList){
        if(slideElem!=null){
            if(msgPairList == null){
                msgPairList = new Array();
            }
            var slideUtils = dojo.query(".slideUtil", slideElem);
            for(var i=0; i<slideUtils.length; i++){
                msgPairList = SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(slideUtils[i]),msgPairList);
                dojo.destroy(slideUtils[i]);
            }
            if (msgPairList!=null && msgPairList.length > 0){
                //removeUndo
                var addToUndo = false;
//            msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
//
//            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);

                //save the modified content back to the contentHandler
                this.updateSlideObject(slideElem);
            }
        }
    },
    /*
     * load slide content from the contentHandler storage to slidesorter
     * @param slideElem to load
     * @param isTemporary, the flag to just load temporary for applying master style, meaning we don't change the isLoaded flag if isTEmporary is true
     */
    loadSlideToSorter: function(slideElem, isTemporary){
        if((slideElem == null || this.contentHandler == null || slideElem.id == null)){ return; }
        var slideId = slideElem.id;

        var slideContentObj = this.contentHandler.getSlideContent(slideId);
        if(slideContentObj == null) {return;}
        
        if(slideContentObj.getIsLoaded()){ return; }

        dojo.empty(slideElem);
        slideElem.innerHTML = slideContentObj.getSlideInnerHtml();

        if(slideContentObj.getWasLoaded() == false){
            //handlePlaceholder here
            this.handlePlaceHolders(slideElem);
    
            var msgPairList = [];
            //substitute default content text with NLS Strings, this we don't want to coedit
            this.substituteDefaultTitleSubtitleTextWithNLS(slideElem);
            //fix table stylings
            msgPairList =this.fixTableStylings(slideElem,  msgPairList);
            //check and create background image div if it was set from css
            //msgPairList = this.checkNcreateBackgroundImageDivFromCss(slideElem, null, msgPairList);
            //fix paragraph margins, convert em to %
            msgPairList = this.fixParagraphMargins(slideElem,  msgPairList);
            //fix old master styles url
            msgPairList = this.fixOldMasterStylesUrl(slideElem, msgPairList);
    
            //do spell check
            var slideList = [];
            slideList.push(slideElem);
            this.spellCheckSlides(slideList);
    
            //save the modified content back to the contentHandler
            this.updateSlideObject(slideElem);
            //D28782: There is a  message said that  "There are edits to this draft that have not been published as a version." even there is not change for the file.
//            //Send Coedit msg for inserted background image div
//            if (msgPairList!=null && msgPairList.length > 0){
//                //-replace removeUndo
//                var addToUndo = false;
//                msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
//    
//                SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
//            }
    
            slideContentObj.setWasLoaded(true);
    
            // add browser-specific class to slide wrapper.
            // this class should NOT be coedited!
            this.addBrowserClassToWrapper( slideElem );
        }
        
        // to show it
        slideElem.style.visibility = 'visible';
        
        if(isTemporary != true){  //if is temporary meaning it is going to be unloaded right after loaded, so don't bother change the following
            slideContentObj.setIsLoaded(true);
        }
        this.disableAnchorInSorter(slideElem);
        this.cleanSlideUtil(slideElem);
        this.updateHeaderFooterDateTimeFields(slideElem);
        this.updatePageNumberFields(slideElem, this.getSlideNumber(slideElem));
    },


    loadSlideIdToSorter: function(slideId){
        if(slideId !=null){
            var slideElem = this.getSlideById(slideId);
            if(slideElem!=null){
                this.loadSlideToSorter(slideElem);
            }
        }
    },
    disableAnchorInSorter:function(slideElem){
        if(slideElem!=null){
            var textAnchors = dojo.query('a', slideElem);
            for (var j=0; j < textAnchors.length; j++){
                textAnchors[j].onclick = function() {return false; };
            }
        }
    },
    substituteDefaultTitleSubtitleTextWithNLS: function(slideElem, msgPairList){
        if(msgPairList == null){
            msgPairList = [];
        }
        //check on class newPresTitle and newPresSubtitle here if exists, update the content to use nls
        var newPresTitles = dojo.query(".newPresTitle", slideElem);
        if(newPresTitles!=null && newPresTitles.length>0){
            for(var j=0; j<newPresTitles.length; j++) {

                var sibling = newPresTitles[j].nextSibling;
                var parent = newPresTitles[j].parentNode;
                var newPresTitleClone = dojo.clone(newPresTitles[j]);
                //the first child of the newPresTitle element is a span and this span innerhtml that needs to be changed
                var span = newPresTitleClone.firstChild;
                if(span!=null){
                    //coedit a innerHTML change should use delete and insert element.. so, we delete it first, then insert it with the new innerHTML
                    msgPairList =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(newPresTitles[j]),msgPairList);
                    dojo.destroy(newPresTitles[j]);
                    span.innerHTML = this.STRINGS.layout_clickToAddTitle;
                    dojo.removeClass(newPresTitleClone,"newPresTitle");
                    if(sibling!=null && parent!=null){
                        parent.insertBefore(newPresTitleClone,sibling);
                    } else{
                        parent.appendChild(newPresTitleClone);
                    }
                    msgPairList = SYNCMSG.createInsertNodeMsgPair(newPresTitleClone,msgPairList);

                }
            }
        }
        var newPresSubtitles = dojo.query(".newPresSubtitle", slideElem);
        if(newPresSubtitles!=null && newPresSubtitles.length>0){
            for(var j=0; j<newPresSubtitles.length; j++) {
                //the first child of the newPresSubtitles element is a span and this span innerhtml that needs to be changed
                var sibling = newPresSubtitles[j].nextSibling;
                var parent = newPresSubtitles[j].parentNode;
                var newPresSubtitleClone = dojo.clone(newPresSubtitles[j]);
                //the first child of the newPresTitle element is a span and this span innerhtml that needs to be changed
                var span = newPresSubtitleClone.firstChild;
                if(span!=null){
                    //coedit a innerHTML change should use delete and insert element.. so, we delete it first, then insert it with the new innerHTML
                    msgPairList =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(newPresSubtitles[j]),msgPairList);
                    dojo.destroy(newPresSubtitles[j]);
                    span.innerHTML = this.STRINGS.layout_clickToAddText;
                    dojo.removeClass(newPresSubtitleClone,"newPresSubtitle");
                    if(sibling!=null && parent!=null){
                        parent.insertBefore(newPresSubtitleClone,sibling);
                    } else{
                        parent.appendChild(newPresSubtitleClone);
                    }
                    msgPairList = SYNCMSG.createInsertNodeMsgPair(newPresSubtitleClone,msgPairList);
                }
            }
        }
        var newSpeakerNotes = dojo.query(".newSpeakerNotes", slideElem);
        if(newSpeakerNotes!=null && newSpeakerNotes.length>0){
            for(var j=0; j<newSpeakerNotes.length; j++) {
                //the first child of the newSpeakerNotes element is a span and this span innerhtml that needs to be changed
                //var span = newSpeakerNotes[j].firstChild;
                //structure was updated to has the newSpeakerNotes class on the span instead of the p
                //the newSpeakerNots[j] is a span and this span innerhtml that needs to be changed

                //for speakernotes, newSpeakerNotes[j] is a span,but we need to coedit on p level which is the parent
                var parent = newSpeakerNotes[j].parentNode;
                if(parent!=null){
                    var parentSibling = parent.nextSibling;
                    var parentParent = parent.parentNode;
                    var newPresSpeakerNoteParentClone = dojo.clone(parent);

                    var span = newPresSpeakerNoteParentClone.firstChild;;
                    if(span!=null){
                        //coedit a innerHTML change should use delete and insert element.. so, we delete it first, then insert it with the new innerHTML
                        msgPairList =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(parent),msgPairList);
                        dojo.destroy(parent);
                        span.innerHTML = this.STRINGS.layout_clickToAddSpeakerNotes;
                        dojo.removeClass(span,"newSpeakerNotes");
                        if(parentSibling!=null && parentParent!=null){
                            parentParent.insertBefore(newPresSpeakerNoteParentClone,parentSibling);
                        } else{
                            parentParent.appendChild(newPresSpeakerNoteParentClone);
                        }
                        msgPairList = SYNCMSG.createInsertNodeMsgPair(newPresSpeakerNoteParentClone,msgPairList);
                    }
                }

            }
        }
        return msgPairList;
    },

    /*
     * To unload slide content from slidesorter to content handler storage
     * @param slideElem to unload
     * @param isReset, if set to false, we don't reset the slidesorter innerHtml of this slide to empty (leave the slide content in sorter)
     *                 by default it is reset, unless specified isReset is false
     */
    unloadSlideFromSorter: function(slideElem, isReset){
        if(slideElem!=null){
            var slideId = slideElem.id;
            if(slideId!=null){
                var slideContentObj = this.contentHandler.getSlideContent(slideId);
                if(slideContentObj!=null){
                    var isSlideLoaded = slideContentObj.getIsLoaded();
                    if(isSlideLoaded == true){
                        //save the slideWrapperHtml to the slideContentObj
                        // var slideInnerHtml= this.getSlideInnerHtml(slideElem);
                        slideContentObj.setSlideInnerHtml(slideElem.innerHTML);
                    }
                    if(isReset!=false){
                        if (!this.isSlideSelected(slideElem) && !this.isSlideLocked(slideElem.parentNode)){
                            // reset empty the slide elem content //to release memory
                            // this.resetEmptySlideElemInnerHtml(slideElem);  // it calls "dojo.empty"
                        	dojo.empty(slideElem);
                        	
                        	// to hide it
                        	slideElem.style.visibility = 'hidden';

                            // set isLoaded to false
                            slideContentObj.setIsLoaded(false);
                        }
                    }
                }
            }
        }

    },

    /**
     * Adds a browser-specific class (if not already there) to the specified slide.
     *
     * @param slideElem
     */
    addBrowserClassToWrapper: function( slideElem ) {
        // find the slide wrapper
        var sw = slideElem,
            swPattern = /\s*slideWrapper\s*/;
        while (sw) {
            if (swPattern.test( sw.className ))
                break;
            sw = sw.parentElement;
        }
        if (!sw)
            return;

        var classes = [];
        if (dojo.isIE) {
            classes.push('iess');
            var ver = Math.floor(dojo.isIE);
            // special class for IE8.
            if (ver == 8)
                classes.push('ie8ss');
        }
        if (dojo.isMozilla)
            classes.push('geckoss');
        if (dojo.isWebKit)
            classes.push('webkitss');
        if (dojo.isSafari)
            classes.push('safariss');
        if (dojo.isChrome)
            classes.push('chromess');
        if (dojo.isOpera)
            classes.push('operass');

        for (var i = 0; i < classes.length; i++) {
            var clsRE = new RegExp('/\s*' + classes[i] + '\s*/');
            if (!clsRE.test( sw.className )) {
                sw.className += ' ' + classes[i];
            }
        }
    },

    //for some reason draw_frame_classes div can contain text node with "\n" that interferes with co-editing code when the code tries to delete an element as firstChild, but get this text node instead
    cleanSlideDiv: function(slideElem){
        if(slideElem!=null){
            this.removeNewLineTextNodeChildren(slideElem);
        }
    },
    removeNewLineTextNodeChildren: function(parentDiv){
        if(parentDiv!=null){
            var length = parentDiv.childNodes.length;
            for(var i=0; i< length; i++){
                var childNode = parentDiv.childNodes[i];
                if(childNode.nodeType == 3 && childNode.nodeValue == "\n"){
                    parentDiv.removeChild(childNode);
                    i--;
                    length--;
                }else if(childNode.nodeType == 1){
                    this.removeNewLineTextNodeChildren(childNode);
                }
            }
        }

    },

    updateSrcUrlWithCurrStaticRootPath: function(slideElem, msgPairList){
        if(msgPairList == null){
            msgPairList = [];
        }
        if(slideElem!=null){

        }
        return msgPairList;
    },

    updateSlideObject: function(slideElem){
        if(slideElem!=null){
            var slideId = slideElem.id;
            if(slideId!=null){
                var slideContentObj = this.contentHandler.getSlideContent(slideId);
                if(slideContentObj!=null){
                    //var isSlideLoaded = slideContentObj.getIsLoaded();
                    //save the slideWrapperHtml to the slideContentObj
                    // var slideInnerHtml= this.getSlideInnerHtml(slideElem);
                    slideContentObj.setSlideInnerHtml(slideElem.innerHTML);
                }
            }
        }
    },

    resetEmptySlideElemInnerHtml: function(slideElem){
        if(slideElem!=null){
            dojo.empty(slideElem);
        }
    },

    getSlideWrapperOuterHtml:function(slideElem, isRemoveSlideUtil){
        var slideWrapperOuterHtml = null;
        if(slideElem!=null && slideElem.parentNode!=null){
            // to get slideWrapperHtml
            var tempDiv = document.createElement("div");
            tempDiv.style.display = "none";

            var slideWrapperClone = slideElem.parentNode.cloneNode(true);
            tempDiv.appendChild(slideWrapperClone);
            dojo.style(slideWrapperClone, {"border": "none"}); //remove the coediting indicator border color
            if(isRemoveSlideUtil == true){
                var slideWrapperArray = [];
                slideWrapperArray.push(slideWrapperClone);
                this.removeSlideUtilDiv(slideWrapperArray);
            }
            slideWrapperOuterHtml = tempDiv.innerHTML;


            //cleanup for memory leak
            //clean up tempDiv
            dojo.destroy(slideWrapperClone);
            document.body.appendChild(tempDiv);
            dojo.destroy(tempDiv);
        }
        return slideWrapperOuterHtml;
    },

    getSlideInnerHtml:function(slideElem){
        var slideInnerHtml = null;
        if(slideElem!=null){
            slideInnerHtml = slideElem.innerHTML;
        }
        return slideInnerHtml;
    },
  	getListBeforeStyleSheetInSorter : function()
  	{
  		if(!this.listBeforeStyleSheet)
  			this.listBeforeStyleSheet = PresCKUtil.getListBeforeStyleSheet(this.getSorterDocument());
  		return this.listBeforeStyleSheet;
  	},
    getSorterDocument: function(){
        return this.editor.document.$;
    },
    /*
     * get the document innerHTML of the current sorter state
     * this include empty shells if there is empty shells
     * to get full content with all slide content. use this.getSlideSorterPresContentHtml()
     */
    getSorterDocumentContent:function(){
        var content;
        if(this.getSorterDocument()!=null){
            content=this.getSorterDocument().documentElement.innerHTML;
        }
        return content;
    },
    updateSorterSlidesObject:function(slideNumber, newSlideElem){
        if(slideNumber>0 && slideNumber<=this.slides.length){
            this.slides[slideNumber-1] = newSlideElem;
        }

    },
    setScrollEvents: function() {
    	if(concord.util.browser.isMobile())
    		this.connectArray['onscroll']=dojo.connect(this.officePrezDiv,'onscroll',dojo.hitch(this, this.scrolling));
    	else
    		this.connectArray['onscroll']=dojo.connect(this.editor.document.getWindow().$,'onscroll',dojo.hitch(this, this.scrolling));
    },
    initForScrollEvent: function(){

        if(this.officePrezDiv!=null){
            //var body = this.getSorterDocument().body;
            var officePrezDiv = this.officePrezDiv;
            // check rect for offDiv
            var offDivRect = officePrezDiv.getBoundingClientRect();
            if (offDivRect.top==0 && offDivRect.left==0 && offDivRect.bottom==0 && offDivRect.right==0)
            	return;
            
            this.prevSc= offDivRect.top;
            var firstSlideWrapper = this.slides[0].parentNode;
            var officePrezDivHeight = dojo.style(this.officePrezDiv, "height");

            this.SLIDE_MARGINS =  (parseFloat(dojo.style(firstSlideWrapper,"marginTop")) + parseFloat(dojo.style(firstSlideWrapper,"marginBottom")));
            this._SLIDE_HEIGHT = (firstSlideWrapper.getBoundingClientRect().bottom - firstSlideWrapper.getBoundingClientRect().top) +this.SLIDE_MARGINS;
            //check if the slide[0] has tasks.. we need to substract the task height if this slide has task, because we want a true slideWrapper height without tasks
            var taskDivs = dojo.query(".taskContainer",firstSlideWrapper );
            if(taskDivs.length>0){
                var taskDivHeight = dojo.style(taskDivs[0], "height");
                this._SLIDE_HEIGHT = this._SLIDE_HEIGHT -taskDivHeight;
            }
            this._NUM_SLIDES_IN_VIEW = Math.ceil((parseFloat(dojo.style(this.editor.container.$, "height")))/(this._SLIDE_HEIGHT +this.SLIDE_MARGINS)) +1; //add one as buffer
            var offset = ((this._SLIDE_HEIGHT * this.slides.length)- officePrezDivHeight); //for some reason there is a significant difference between total height of all slides and the height of officePrezDiv(the slides container)
            this._OFFSETperSLIDE = offset/this.slides.length;  //calculate the offset for each slide, we need to add this offset to the slideWrapper height when calculating estimate slide height
            this.scrolling();
        }
    },
    handleResizeWindowForScrolling: function(){
        //defect 9504, where the editor container height is 0 only when collapsing sidebar
        //in IE, sidebar will leave white blank area while slidesorter is hidden
        //in the case that sidebar is being collapsed, the container height would be 0, then we don't need to do scrolling.
        if(dojo.style(this.editor.container.$, "height")>0){
            //adjust the number of slides in view
            this._NUM_SLIDES_IN_VIEW = Math.ceil((parseFloat(dojo.style(this.editor.container.$, "height")))/(this._SLIDE_HEIGHT +this.SLIDE_MARGINS)) +1; //add one as buffer
            this.scrolling();
        }

    },

    scrolling: function (e, isFromCoedit){
    	if (isFromCoedit)
    		if (!window.g_noimprove && !window.g_scrolling) return;
    	
    	var tstart = new Date();
    	
        //console.log("Scrolling..");
        if(this.officePrezDiv!=null){
            var officePrezDiv = this.officePrezDiv;
            if(concord.util.browser.isMobile())
            	this._DISP = this.officePrezDiv.scrollTop;
            else
            	this._DISP = this.prevSc - officePrezDiv.getBoundingClientRect().top - window.document.body.scrollTop;
            //sc.innerHTML = "<ul><li> Your window scroll pos is "+window.document.body.scrollTop+"</li><li>sorterContent.getBoundingClientRect "+sorterContent.getBoundingClientRect().top +"</li><li>Displacement is "+_DISP +"</li></ul>";
            this.getSlideInFirstPosition();

            //focus on the sorter container only if ll_sidebar_bc_node and ll_sidebar_div are being displayed
            var sideBarBCNode = dojo.byId("ll_sidebar_bc_node");
            var sideBarNode = dojo.byId("ll_sidebar_div");
            // In coediting mode, sometimes sideBarBCNode and sideBarNode will be null
            // So move "isFromCoedit !=true" condition before them
            if (isFromCoedit !=true &&
                sideBarBCNode && sideBarBCNode.style.display != "none" &&
                sideBarNode && sideBarNode.style.display != "none") {
                if(dojo.isSafari && !concord.util.browser.isMobile())
                	pe.scene.clipboard.focusClipboardContainer();
                else
                	dojo.byId(pe.scene.slideSorterContainerId).focus();
            }
            if(isFromCoedit !=true){
                if((this.preScrolltime==null)|| (this.preScrolltime && (new Date().getTime() - this.preScrolltime) > 2000)){
                    this.publishSlideSorterInFocus();
                    this.preScrolltime = new Date().getTime();
                }
            }
        }
        
		var tend = new Date();
		console.log("slidesorter.scrolling: " + (tend.getTime() - tstart.getTime()));
    },

    getSlideInFirstPosition: function(){

        var tempSlideInFirstPos = parseFloat(this._DISP / this._SLIDE_HEIGHT);
        var dispOffset = (tempSlideInFirstPos * this._OFFSETperSLIDE );
        this._SLIDE_IN_FIRST_POS = parseFloat((this._DISP + dispOffset)/ this._SLIDE_HEIGHT); //temporary get slide in first pos, assuming there is no task div height to consider
        //console.log("SLIDE_IN_FIRSTPOS(1):***"+this._SLIDE_IN_FIRST_POS);
        //to calculate the true slide in first position considering any task div height
        var slideRangeHeight = this.getSlideRangeHeight(0, this._SLIDE_IN_FIRST_POS-1);  // get total height of all slides previous to slide in first pos
        //console.log("slideRangeHeight:***"+slideRangeHeight);
        var diffHeight = slideRangeHeight - (this._DISP+dispOffset); // get the difference of the total height of previous slides (including task divs if any) with the displacement (estimate height without any task div)
        //console.log("diffHeight:***"+diffHeight);
        var newFirstSlideIdx = this.getAdjustedFirstSlide(this._SLIDE_IN_FIRST_POS, diffHeight);  //get how many number of slides can fit in the diffHeight, and get the new first slide index
        this._SLIDE_IN_FIRST_POS = newFirstSlideIdx;  // setting slide in first position to the new first slide index
        //console.log("SLIDE_IN_FIRSTPOS(2):***"+this._SLIDE_IN_FIRST_POS);
        //this.printSlidesNumInView();  //for debug only
        this.loadRangeSlidesToSorter();

    },
    printSlidesNumInView: function(){
        var str= "";
        for (var i=0; i< parseInt(this._NUM_SLIDES_IN_VIEW);i++){
            //viewNode.innerHTML	+= (parseInt(_SLIDE_IN_FIRST_POS)+i) +"     ";
            str +=(parseInt(this._SLIDE_IN_FIRST_POS)+i+1+" ");
        }
        //console.log("SlidesInView:***"+str);
    },
    getAdjustedFirstSlide:function(currFirstSlideIdx, diffHeight){
        var totalHeight = 0;
        var newFirstSlideIdx = currFirstSlideIdx;
        var startIdx = parseInt(currFirstSlideIdx-1); //we want to get the slide previous to the currFirstSlideIdx
        for(var i=startIdx; i>=0; i--){
            var slideElem = this.slides[startIdx];
            if(slideElem != null){
                var slideWrapper = slideElem.parentNode;
                var slideWrapperHeight = this.getSlideWrapperHeight(slideWrapper);
                totalHeight += slideWrapperHeight+this._OFFSETperSLIDE ;
                if(totalHeight>=diffHeight){
                    newFirstSlideIdx = i;
                    break;
                }
            }
        }
        return newFirstSlideIdx;

    },
    getSlideWrapperHeight: function(slideWrapper){
        var slideWrapperHeight = 0;
        if(slideWrapper!=null){
            slideWrapperHeight = (slideWrapper.getBoundingClientRect().bottom - slideWrapper.getBoundingClientRect().top) +this.SLIDE_MARGINS;
        }
        return slideWrapperHeight;
    },
    /*
     * slideIdx1 has to be the smaller number than slideIdx2
     */
    getSlideRangeHeight: function(slideIdx1,slideIdx2){
        var height = 0;
        if(slideIdx1 !=null && slideIdx2 !=null && parseFloat(slideIdx1) >=0 && parseFloat(slideIdx2) >=0 && parseFloat(slideIdx1)< parseFloat(slideIdx2)){
            for(var i=parseInt(slideIdx1); i<= parseInt(slideIdx2); i++){
                var slideElem = this.slides[i];
                if(slideElem!=null){
                    var slideWrapper = slideElem.parentNode;
                    var slideWrapperHeight = this.getSlideWrapperHeight(slideWrapper);
                    height+=slideWrapperHeight+this._OFFSETperSLIDE ;
                }

            }
        }
        return height;
    },

    addSlideToContentObj:function(newSlideElem){
        if(newSlideElem!=null){
            // var slideContentHtmlStr = this.getSlideInnerHtml(newSlideElem);
            // var slideId = newSlideElem.id;
            if(this.contentHandler!=null){
                // var isLoaded = true;
                this.contentHandler.addSlideContent(newSlideElem.innerHTML, newSlideElem.id, true);
            }
        }
    },
    deleteSlideFromContentObj:function(slideId){
        if(slideId!=null){
            if(this.contentHandler!=null){
                this.contentHandler.deleteSlideContent(slideId);

            }
        }
    },
    updateSlideObjectsForLoadedSlides: function(){
        if(this.contentHandler!=null){
            var slideLoadedIds = this.contentHandler.getSlideIdsOfLoadedSlides();
            for(var i=0; i<slideLoadedIds.length; i++ ){
                var slideElem = this.getSlideById(slideLoadedIds[i]);
                this.updateSlideObject(slideElem);
            }

        }
    },
    //returned named array, key is slide Id
    getLoadedSlides: function(){
        var array = [];
        if(this.contentHandler!=null){
            var slideLoadedIds = this.contentHandler.getSlideIdsOfLoadedSlides();
            for(var i=0; i<slideLoadedIds.length; i++ ){
                var slideElem = this.getSlideById(slideLoadedIds[i]);
                array[slideElem.id] = slideElem;
            }
        }
        return array;
    },
    //returned named array, key is slide Id
    getUnloadedSlides: function(loadedSlidesArray){
        var array = [];
        if(loadedSlidesArray == null){
            loadedSlidesArray = this.getLoadedSlides();
        }
        for(var i=0; i<this.slides.length; i++){
            if(loadedSlidesArray[this.slides[i].id] == null){ //if not in the loadedSLidesArray
                array[this.slides[i].id] = this.slides[i];
            }
        }
        return array;
    },
    getAllSlidesContentHTML: function(){
        var slides = this.getAllSlides();
        var slidesContentHtmlArray = [];
        if(this.contentHandler!=null){
                /*
                //update all the slide objects for the loaded slides first, making sure the slide objects has latest content
                this.updateSlideObjectsForLoadedSlides();
                */
                for(var i=0; i<slides.length; i++){
                    var slideElem = slides[i];

                    //load each slide then save the slideWrapper innerHtml string in the slideWrapperArray
                    var isSlideLoaded = this.isSlideLoaded(slideElem);

                    this.loadSlideToSorter(slideElem, true);

                    if (dojo.isIE && i==0) {
                        // defect 5980: in IE the content of the first slide's wrapper can get corrupted
                        var tempWrapperDiv = document.createElement('div');
                        var slideClone = dojo.clone(slideElem);
                        tempWrapperDiv.appendChild(slideClone);
                        slidesContentHtmlArray.push(tempWrapperDiv.innerHTML);
                        // clean up to avoid memory leaks
                        dojo.destroy(slideClone);
                        slideClone = null;
                        document.body.appendChild(tempWrapperDiv);
                        dojo.destroy(tempWrapperDiv);
                        tempWrapperDiv = null;
                    } else {
                        var slideWrapper = slideElem.parentNode;
                        var slideHtml = slideWrapper.innerHTML;
                        slidesContentHtmlArray.push(slideHtml);
                    }

                    //then unload to save memory
                    var isReset = false;
                    if(isSlideLoaded!=true){
                        isReset = true;
                    }
                    this.unloadSlideFromSorter(slideElem, isReset);
                }
        }
        return slidesContentHtmlArray;
    },
    removeSpareBoxes:function(slideElem){
        if(slideElem!=null){
            var spareBoxes = dojo.query(".isSpare", slideElem);
            for(var i=0; i<spareBoxes.length; i++){
                dojo.destroy(spareBoxes[i]);
            }
        }
    },
    /*
     * Build the latest content html from slide wrapper from sorter but content from slideContent
     * @param slideWrapperHtmlStringArray, the slideWrapper html string to be put together as the content of the content.html,has to be in the correct order
     * if it is null, the function will get the current slideWrapperHTML from sorter and slideContent
     * if it is provided, will use the one provided (e.g. in the case for applyTemplate/master styles)
     */
    getSlideSorterPresContentHtml:function(slideWrapperHtmlStringArray){
        var slides = this.getAllSlides();
        var slideWrapperArray = slideWrapperHtmlStringArray;
        var sorterContentHtml = "";
        if(this.contentHandler!=null){
            if(slideWrapperArray == null){
                slideWrapperArray = [];
                /*
                //update all the slide objects for the loaded slides first, making sure the slide objects has latest content
                this.updateSlideObjectsForLoadedSlides();  //we don't need it we trust what's in slidesorter is the latest, when we loadSlideToSorter and
                //the slide is already loaded, we do not load from slideContentObject
                */

                for(var i=0; i<slides.length; i++){
                    var slideElem = slides[i];
                    slideElem.removeAttribute('liststyle');
                    //load each slide then save the slideWrapper innerHtml string in the slideWrapperArray
                    var isSlideLoaded = this.isSlideLoaded(slideElem);
                    var isTemporary = true;
                    this.loadSlideToSorter(slideElem, isTemporary);
                    this.removeSpareBoxes(slideElem);
                    var isRemoveSlideUtil = true;
                    var slideWrapperHtml = this.getSlideWrapperOuterHtml(slideElem, isRemoveSlideUtil);
                    slideWrapperArray.push(slideWrapperHtml);

                    //then unload to save memory
                    var isReset = false;
                    if(isSlideLoaded!=true){
                        isReset = true;
                    }
                    this.unloadSlideFromSorter(slideElem, isReset);

                }
            }
            //using base content html from sorterDoc.innerHTML, we build content string by adding from slideWrapperArray strings retrieved in above process
            var tempContentHtml =  '<html>'+this.getSorterDocumentContent()+ '</html>';

            sorterContentHtml = '<html>';
            sorterContentHtml += this.contentHandler._getHeadTag(tempContentHtml);
            //sorterContentHtml += '<head></head>';
            //sorterContentHtml +=concord.util.HtmlContent.getHeadContent(tempContentHtml);
            sorterContentHtml += this.contentHandler._getBodyTag(tempContentHtml);
            sorterContentHtml += this.contentHandler._getOfficePresentationTag(tempContentHtml);
            for ( var i = 0; i < slideWrapperArray.length ; i++){
                sorterContentHtml += slideWrapperArray[i];
            }
            sorterContentHtml += '</div>';  //end div for office_presentation div
            sorterContentHtml += this.contentHandler._getTempStoreContent(tempContentHtml);
            sorterContentHtml += '</body></html>';
        }
        return sorterContentHtml;
    },

    getContentAsArray:function(drawFrameElem){
        var contentArray= [];
        var currLayoutFamily = dojo.attr(drawFrameElem,"presentation_class");

        var drawFrameClassesElem = dojo.query(".draw_frame_classes",drawFrameElem)[0];
        if(drawFrameClassesElem!=null){
            //var children = dojo.query('*', drawFrameClassesElem);
            var children = drawFrameClassesElem.childNodes;
            for(var i=0; i< children.length; i++){

                //try to get either <p> or <li>
                var tagName = children[i].tagName;
                if(tagName!=null){

                    if(children[i].tagName.toLowerCase() == "p"){
                        var content = children[i].innerHTML;
                        //clean unnecessary chars
                        //content.replace(/&nbsp;/gi, "");
                        contentArray.push(content);
                    }else if(children[i].tagName.toLowerCase() == "ul" || children[i].tagName.toLowerCase() == "ol"){
                        var liElems = dojo.query('li', children[i]);
                        for(var j=0; j< liElems.length; j++){
                            var content = liElems[j].innerHTML;
                            //clean up un-necessary nested ul and ol, since all the li(s) under this ul already captured in the liElems var above, to avoid processing redundancy
                            var tempElem = document.createElement("div");
                            tempElem.style.display = "none";
                            document.body.appendChild(tempElem);
                            tempElem.innerHTML = content;
                            var ulElems = dojo.query("ul", tempElem);
                            for(var k=0; k< ulElems.length; k++){
                                dojo.destroy(ulElems[k]);
                            }
                            var olElems = dojo.query("ol", tempElem);
                            for(var k=0; k< olElems.length; k++){
                                dojo.destroy(olElems[k]);
                            }
                            content = tempElem.innerHTML; //the content is now clean from redundant li(s)
                            dojo.destroy(tempElem);
                            //clean unnecessary chars
                            //content.replace(/&nbsp;/gi, "");
                            contentArray.push(content);
                        }
                    }
                    //need to handle ppt strange subtitle structure.. under draw_frame_classes, it has div of class text-list, under that it has div of class text-list-header, under that there is <p>
                    else if(children[i].tagName.toLowerCase() == "div" && dojo.hasClass(children[i], "text_list") && children[i].firstChild!=null && dojo.hasClass(children[i].firstChild, "text_list-header")){
                        var tlChildren = children[i].firstChild.childNodes;
                        for(var k=0; k< tlChildren.length; k++){
                            var tlTagName = tlChildren[k].tagName;
                            if(tlTagName!=null){
                                if(tlChildren[k].tagName.toLowerCase() == "p"){
                                    var content = tlChildren[k].innerHTML;
                                    //clean unnecessary chars
                                    //content.replace(/&nbsp;/gi, "");
                                    contentArray.push(content);
                                }else if(tlChildren[k].tagName.toLowerCase() == "ul" || tlChildren[k].tagName.toLowerCase() == "ol"){
                                    var liElems = dojo.query('li', tlChildren[k]);
                                    for(var j=0; j< liElems.length; j++){
                                        var content = liElems[j].innerHTML;
                                        //clean up un-necessary nested ul and ol, since all the li(s) under this ul already captured in the liElems var above, to avoid processing redundancy
                                        var tempElem = document.createElement("div");
                                        tempElem.style.display = "none";
                                        document.body.appendChild(tempElem);
                                        tempElem.innerHTML = content;
                                        var ulElems = dojo.query("ul", tempElem);
                                        for(var k=0; k< ulElems.length; k++){
                                            dojo.destroy(ulElems[k]);
                                        }
                                        var olElems = dojo.query("ol", tempElem);
                                        for(var k=0; k< olElems.length; k++){
                                            dojo.destroy(olElems[k]);
                                        }
                                        content = tempElem.innerHTML; //the content is now clean from redundant li(s)
                                        dojo.destroy(tempElem);
                                        //clean unnecessary chars
                                        //content.replace(/&nbsp;/gi, "");
                                        contentArray.push(content);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return contentArray;
    },
    //copied from slideEditor
    updateODPClasses: function(drawFrameElem, slideElem, sameDoc, currMasterName){
        // Add needed Classes
        if (sameDoc == null) sameDoc = true;
        if (currMasterName == null) currMasterName = "";

        var sameStyle = (currMasterName == this.currMasterFrameStylesJSON.currMaster.masterName) ? true : false;
        var layoutFamily = dojo.attr(drawFrameElem,"presentation_class");
        var layoutName = dojo.attr(slideElem,'presentation_presentation-page-layout-name');
        var masterTextStyle =null;
        var contentBoxDataNode = null;
        var contentBoxDataNodes = dojo.query('.contentBoxDataNode', drawFrameElem);
        if(contentBoxDataNodes!=null && contentBoxDataNodes.length>0){
            contentBoxDataNode = contentBoxDataNodes[0];
        }
        if(contentBoxDataNode!=null){
            if (layoutFamily=='outline'){
                    dojo.addClass(contentBoxDataNode,'draw_text-box');
                    masterTextStyle = this.currMasterFrameStylesJSON.text_outline;
                    if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
                        var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
                        if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
                        dojo.addClass(drawFrameClassDiv,masterTextStyle);
                    }
            } else if (layoutFamily == 'title'){
                if (layoutName=='ALT0'){
                    masterTextStyle = this.currMasterFrameStylesJSON.title;
                } else{
                    masterTextStyle = this.currMasterFrameStylesJSON.text_title;
                }
                dojo.addClass(contentBoxDataNode,'draw_text-box');
                if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
                    var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
                    if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
                    dojo.addClass(drawFrameClassDiv,masterTextStyle);
                }
            } else if (layoutFamily == 'subtitle'){
                dojo.addClass(contentBoxDataNode,'draw_text-box');
                masterTextStyle =this.currMasterFrameStylesJSON.subtitle;
                var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
                if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
                if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
                    dojo.addClass(drawFrameClassDiv,masterTextStyle);
                }else{
                    masterTextStyle =this.currMasterFrameStylesJSON.text_outline;
                    if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
                        dojo.addClass(drawFrameClassDiv,masterTextStyle);
                    }else{
                        masterTextStyle =this.currMasterFrameStylesJSON.default_text;
                    }
                }
            } else { // Assume it is simple text box
                var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
                if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
                if (layoutName =='ALT0')
                    dojo.addClass(drawFrameClassDiv,this.currMasterFrameStylesJSON.default_title);
                else
                    dojo.addClass(drawFrameClassDiv,this.currMasterFrameStylesJSON.default_text);
            }
        }
    },
    transformUlToPElem:function(ul){
        var tempDiv = document.createElement('div');
        tempDiv.id = "ulToPElemTempDiv";
        if(ul!=null){
            var liNodes = dojo.query("li", ul);
            for(var i=0; i<liNodes.length; i++){
                var liElem = liNodes[i];
                var p = document.createElement('p');
                var content = liElem.innerHTML;//.replace(/&nbsp;/gi, "");
                p.innerHTML = content;
                concord.util.HtmlContent.injectRdomIdsForElement(p);
                tempDiv.appendChild(p);
            }
        }
        return tempDiv;
    },
    transformPtoLiElem:function(pElem){
        var li = document.createElement('li');
        if(pElem!=null){
            var liCName = null;
            dojo.addClass(li, 'text_list-item'); // for conversion
            var content = pElem.innerHTML;//.replace(/&nbsp;/gi, "");
            var ln = MSGUTIL.getPureText( CKEDITOR.dom.element.createFromHtml( content ) );
            ln = ln.replace(/\s/g, '');
            // if using custom list class and there's non-empty data
            if ( liCName && ln != '' )
                dojo.addClass( li, liCName );
            // if using custom list class and there's empty data
            else if (liCName && ln == '' )
                dojo.style( li, 'display', 'block' );

            li.innerHTML = content;

            dojo.attr(li,'p_text_style-name','');
            dojo.attr(li,'text_p','true');
        }
        return li;

    },
    /*
     * param tempElem is the container that will hold the result
     */
    getOutlineFormat: function(tempElem, dfcChildren, drawFrameElem){

        /*
        var tempElem = document.createElement("div");
        tempElem.style.display = "none";
        document.body.appendChild(tempElem);
        */
        if(tempElem!=null){
            if(dfcChildren== null ){
                var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
                dfcChildren =  drawFrameClassDiv.children;
            }
            var ul = null;
            var afterExistinListFound = false;
            for(var i=0; i < dfcChildren.length; i++){
                if(dfcChildren[i].tagName.toLowerCase() == "p"){
                    if(dojo.attr(dfcChildren[i], "p_psv")== "true"){
                        var tempDFCChld = dojo.clone(dfcChildren[i]);
                        tempElem.appendChild(tempDFCChld);
                        tempDFCChld = null;
                    }else{
                        if(i == 0 || afterExistinListFound == true){
                            ul = document.createElement("ul");
                            afterExistinListFound = false;
                        }

                        var tempDFCChld = dojo.clone(dfcChildren[i]);
                        var li = this.transformPtoLiElem(tempDFCChld);
                        tempDFCChld = null;
                        if(ul!=null){
                            ul.appendChild(li);
                        }
                        if(i == dfcChildren.length-1){
                            tempElem.appendChild(ul);
                        }
                    }
                }
                if(dfcChildren[i].tagName.toLowerCase() == "ul"||dfcChildren[i].tagName.toLowerCase() == "ol"){
                    //append to div/finish up the previous ul created
                    if(ul!=null && ul.children!=null && ul.children.length>0){
                        tempElem.appendChild(ul);
                    }
                    var tempDFCChld = dojo.clone(dfcChildren[i]);
                    tempElem.appendChild(tempDFCChld);
                    tempDFCChld = null;
                    afterExistinListFound = true;
                }
            }
        }
    },
    //get class names string excluding class names to ignore given in param
    getClassNames:function(node, classNameToIgnoreArray){
        var styleName = "";
        if(node!=null){
            var classNames = dojo.trim(node.className);
            var classNamesArray = classNames.split(" ");
            if(classNamesArray!=null){
                for(var i=0; i<classNamesArray.length; i++){
                    var ignore = false;
                    if(classNameToIgnoreArray!=null){
                        for(var j=0; j<classNameToIgnoreArray.length; j++){
                            if(classNamesArray[i] == classNameToIgnoreArray[j]){
                                ignore = true;
                                break;
                            }
                        }
                    }
                    if(ignore == false){
                        styleName = styleName + " "+classNamesArray[i];
                    }
                }
            }
            styleName = dojo.trim(styleName);
        }
        return styleName;
    },

    transformLayoutFamily:function(slideElem, drawFrameElem, newLayoutFamily, newLayoutName){
        if(newLayoutFamily!=null && drawFrameElem !=null && slideElem!=null){
            //get the actual text from this text box
            var content = "";
            var contentArray = this.getContentAsArray(drawFrameElem);
            var masterTextStyle = "";
            var currLayoutFamily = dojo.attr(drawFrameElem,"presentation_class");
            if(currLayoutFamily == "outline"){
                masterTextStyle = this.currMasterFrameStylesJSON.text_outline;
            }else if(currLayoutFamily == "subtitle"){
                masterTextStyle = this.currMasterFrameStylesJSON.subtitle;
            }

            //preserve classes from the current layout family
            var classNamesToPreserve = "";
            //preserve the classnames and styles from the draw_frame_classes element
            var drawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
            if(drawFrameClassDiv!=null){
                var frameClassesStr = drawFrameClassDiv.className;
                var frameClassesArray = frameClassesStr.split(" ");
                for(var i=0; i< frameClassesArray.length; i++){
                    if(frameClassesArray[i]!="draw_frame_classes" && masterTextStyle.indexOf(frameClassesArray[i])<0){
                        classNamesToPreserve = classNamesToPreserve+" "+frameClassesArray[i];
                    }
                }
            }
            classNamesToPreserve = dojo.trim(classNamesToPreserve);

            //preserve inline styles from the current draw frame classes element
            var styleToPreserve= dojo.attr(drawFrameClassDiv, "style");

            var contentBoxDataNodes = dojo.query('.draw_text-box', drawFrameElem);
            var contentBoxDataNode = null;
            if(contentBoxDataNodes!=null && contentBoxDataNodes.length>0){
                contentBoxDataNode = contentBoxDataNodes[0];
            }

            //delete the existing content of this text box
            //buildTextNodeContent with new layoutfamily
            if(currLayoutFamily != "outline" && newLayoutFamily == "outline"){
                //check to see if the content has li items, need to preserve flag so we can get back to it

                if(contentBoxDataNode!=null){
                    var liNodes = dojo.query("li", contentBoxDataNode);
                    for(var i=0; i < liNodes.length; i++){
                        var li = liNodes[i];
                        if(dojo.style(li, "listStyleType") != "none" && dojo.style(li, "listStyleType")!=""){
                            dojo.attr(li, "lst_psv","true");
                        }
                        if(dojo.hasAttr(li,"li_class") && dojo.attr(li, "li_class") !=null && dojo.attr(li, "li_class") !=""){ //if there is something to set list lststyle
                            dojo.addClass(li, dojo.attr(li, "li_class"));
                        }
                        if(dojo.hasAttr(li,"li_style")&& dojo.attr(li, "li_style") !=null ){ //if there is something to set list style
                            li.setAttribute("style",dojo.attr(li, "li_style"));
                        }

                        //if from center layout changing to layout, remove the text align center
                        if(dojo.attr(slideElem, "presentation_presentation-page-layout-name") == "ALT32" ){
                            dojo.removeClass(li, "centerTextAlign");
                        }
                    }

                    var pNodes = dojo.query("p", contentBoxDataNode);
                    for(var i=0; i < pNodes.length; i++){
                        var p = pNodes[i];
                        //if from center layout changing to layout, remove the vertical align center
                        if(dojo.attr(slideElem, "presentation_presentation-page-layout-name") == "ALT32" ){
                            dojo.removeClass(p, "centerTextAlign");
                        }
                        if(dojo.hasAttr(p,"p_style")&& dojo.attr(p, "p_style") !=null ){ //if there is something to set list style
                            p.setAttribute("style",dojo.attr(p, "p_style"));
                        }
                    }

                    var tempElem = document.createElement("div");
                    tempElem.style.display = "none";
                    document.body.appendChild(tempElem);

                    var dfcChildren = drawFrameClassDiv.children;
                    if(dfcChildren.length>0 && dfcChildren[0].tagName.toLowerCase() == "div" && dojo.hasClass(dfcChildren[0], "text_list") && dfcChildren[0].firstChild!=null && dojo.hasClass(dfcChildren[0].firstChild, "text_list-header")){
                        var tlChildren = dfcChildren[0].firstChild.childNodes;
                        this.getOutlineFormat(tempElem,dfcChildren, drawFrameElem);
                    }else{

                        this.getOutlineFormat(tempElem, dfcChildren, drawFrameElem);
                    }
                    dojo.empty(drawFrameClassDiv);
                    drawFrameClassDiv.innerHTML = tempElem.innerHTML;
                    dojo.destroy(tempElem);
                    dojo.attr(drawFrameElem,'presentation_class', newLayoutFamily); //reset the presentation_class to the intended layout obj
                    this.updateODPClasses(drawFrameElem, slideElem);

                    //need to setId for mainNode children (currently have no ids) but keep the mainNode Id
                    //capture the mainNode id to be reset back
                    var drawFrameId = drawFrameElem.id;
                    this.setFrameId(drawFrameElem); //assign new ids for draw_frame and children
                    drawFrameElem.id = drawFrameId; //reset back id to the previous id, but now we have all children with ids.
                }


            }else if(currLayoutFamily == "outline" && newLayoutFamily =="subtitle"){
                var pNodes = dojo.query("p", contentBoxDataNode);
                for(var i=0; i < pNodes.length; i++){
                    var p = pNodes[i];
                    dojo.attr(p, "p_style", p.getAttribute("style"));
                    if(!dojo.hasAttr(p, "p_psv")){
                        dojo.attr(p, "p_psv","true");
                    }
                }
                for(var b=0; b<2; b++){  //do the loop 2 times, first to process "ul" them second to process "ol"
                    var queryItem = "ul";
                    if(b==1){
                        queryItem= "ol";
                    }
                    var ulNodes = dojo.query(queryItem, contentBoxDataNode);
                    for(var j=0; j < ulNodes.length; j++){
                        var liNodes = dojo.query("li", ulNodes[j]);
                        if(liNodes.length>0 && dojo.attr(liNodes[0], "text_p")=="true"){
                            //transform li elems to p elem
                            var tempDiv = this.transformUlToPElem(ulNodes[j]);
                            var parent = ulNodes[j].parentNode;
                            if(parent!=null && tempDiv!=null){
                                var pElems = dojo.query("p", tempDiv);
                                for(var m=0; m < pElems.length; m++){
                                    parent.insertBefore(pElems[m], ulNodes[j]);
                                }
                                dojo.destroy(ulNodes[j]);
                                dojo.destroy(tempDiv);
                            }

                        }else{
                            var liNodes = dojo.query("li", ulNodes[j]);
                            for(var i=0; i < liNodes.length; i++){
                                var li = liNodes[i];
                                //preserve style attribute
                                dojo.attr(li, "li_style", li.getAttribute("style"));
                                if(dojo.attr(li, "lst_psv") !="true"){

                                    //set listStyle to none to not showing the bullet
                                    dojo.style(li, "listStyle", "none");
                                }
                                //remove the list class just in case the css class is the one that renders the bullet image
                                var classNameToIgnore = [];
                                classNameToIgnore.push("text_list-item");
                                var liClassNamesToPreserve = this.getClassNames(li, classNameToIgnore);
                                if(liClassNamesToPreserve.length>0){
                                    dojo.attr(li, "li_class", liClassNamesToPreserve);
                                    //remove the classNamesPreserved
                                    dojo.removeClass(li, liClassNamesToPreserve);
                                }

                            }
                        }
                    }
                }

                /*
                var liNodes = dojo.query("li", contentBoxDataNode);
                for(var i=0; i < liNodes.length; i++){
                    var li = liNodes[i];
                    //preserve style attribute
                    dojo.attr(li, "li_style", li.getAttribute("style"));
                    if(dojo.attr(li, "lst_psv") !="true"){

                        //set listStyle to none to not showing the bullet
                        dojo.style(li, "listStyle", "none");
                    }
                    //remove the list class just in case the css class is the one that renders the bullet image
                    var classNameToIgnore = [];
                    classNameToIgnore.push("text_list-item");
                    var liClassNamesToPreserve = this.getClassNames(li, classNameToIgnore);
                    if(liClassNamesToPreserve.length>0){
                        dojo.attr(li, "li_class", liClassNamesToPreserve);
                        //remove the classNamesPreserved
                        dojo.removeClass(li, liClassNamesToPreserve);
                    }

                }
                */

                dojo.attr(drawFrameElem,'presentation_class', newLayoutFamily); //reset the presentation_class to the intended layout obj
                this.updateODPClasses(drawFrameElem, slideElem);
                //need to setId for mainNode children (currently have no ids) but keep the mainNode Id
                //capture the mainNode id to be reset back
                var drawFrameId = drawFrameElem.id;
                this.setFrameId(drawFrameElem); //assign new ids for draw_frame and children
                drawFrameElem.id = drawFrameId; //reset back id to the previous id, but now we have all children with ids.
            }else if(currLayoutFamily == "outline" && (newLayoutFamily =="" || newLayoutFamily == null)){
                var liNodes = dojo.query("li", contentBoxDataNode);
                for(var i=0; i < liNodes.length; i++){
                    var li = liNodes[i];
                    //preserve style attribute
                    dojo.attr(li, "li_style", li.getAttribute("style"));
                    if(dojo.attr(li, "lst_psv") !="true"){

                        //set listStyle to none to not showing the bullet
                        dojo.style(li, "listStyle", "none");

                    }
                    //preserve style attribute
                    dojo.attr(li, "li_style", li.getAttribute("style"));
                    //remove the list class just in case the css class is the one that renders the bullet image
                    var classNameToIgnore = [];
                    classNameToIgnore.push("text_list-item");
                    var liClassNamesToPreserve = this.getClassNames(li, classNameToIgnore);
                    if(liClassNamesToPreserve.length>0){
                        dojo.attr(li, "li_class", liClassNamesToPreserve);
                        //remove the classNamesPreserved
                        dojo.removeClass(li, liClassNamesToPreserve);
                    }

                }
                var pNodes = dojo.query("p", contentBoxDataNode);
                for(var i=0; i < pNodes.length; i++){
                    var p = pNodes[i];
                    if(!dojo.hasAttr(p, "p_psv")){
                        dojo.attr(p, "p_psv","true");
                    }
                }

                dojo.attr(drawFrameElem,'presentation_class', newLayoutFamily); //reset the presentation_class to the intended layout obj
                this.updateODPClasses(drawFrameElem, slideElem);
                //need to setId for mainNode children (currently have no ids) but keep the mainNode Id
                //capture the mainNode id to be reset back
                var drawFrameId = drawFrameElem.id;
                this.setFrameId(drawFrameElem); //assign new ids for draw_frame and children
                drawFrameElem.id = drawFrameId; //reset back id to the previous id, but now we have all children with ids.
            }

            //adding the preserve classnames and styles
            var newDrawFrameClassDiv = dojo.query('.draw_frame_classes',drawFrameElem)[0];
            if(classNamesToPreserve.length>0){
                dojo.addClass( newDrawFrameClassDiv , classNamesToPreserve);
                if(dojo.attr(slideElem, "presentation_presentation-page-layout-name") == "ALT32" && currLayoutFamily == "subtitle" && newLayoutFamily == "outline"){
                    dojo.removeClass(newDrawFrameClassDiv, "centerVerticalAlign");
                }
            }
            if(styleToPreserve.length>0){
                dojo.attr(newDrawFrameClassDiv, "style", styleToPreserve);
            }

        }
    },
    //
    // Remove layout objects from current slide. For ex when switching between layouts we need to clean up
    //
    removeLayoutBoxes: function(slideElem){
        if(slideElem!=null){
            var layoutBoxes = dojo.query('.layoutClass',slideElem);
            for(var i=0; i< layoutBoxes.length; i++){
                var box =layoutBoxes[i];
                if(dojo.attr(box, "presentation_class")!="notes"){
                    dojo.destroy(box);
                }
            }
        }
    },
        
    //
    // Apply selected layout to a slide
    // here we don't care about creating msgs for coediting
    applyLayoutToSlide: function(resultArray, slideElem, isFromOtherDocForPasteSlides,needUpdateListStyle){
        if(slideElem==null){
        	 return slideElem;
        }
        if(resultArray == null){
            resultArray = [];
        }

        //Update new layout info at draw page level (slideEditor level)
        var presPageLayoutName = (resultArray.length>0)?resultArray[0].layoutName:"blank";
        dojo.attr(slideElem,'presentation_presentation-page-layout-name',presPageLayoutName);
        dojo.attr(slideElem,'docs_layout','true');
        //Here it want to remove all empty placeholders
        if(isFromOtherDocForPasteSlides !=true){
        	var queryString = "."+PresConstants.CONTENT_BOX_TITLE_CLASS
        	+",."+PresConstants.CONTENT_BOX_SUBTITLE_CLASS
        	+",."+PresConstants.CONTENT_BOX_OUTLINE_CLASS
        	+",."+PresConstants.CONTENT_BOX_GRAPHIC_CLASS;
    		
        	var defaultTextLines = dojo.query(queryString,slideElem);
        	for(var i=0;i<defaultTextLines.length;i++)
        	{
        		var line = PresCKUtil.ChangeToCKNode(defaultTextLines[i]);
        		//find the drawframe
        		var drawFrame = line;
        		while(drawFrame)
        		{
        			if(drawFrame.hasClass('draw_frame'))
        				break;
        			drawFrame = drawFrame.getParent();
        		}
        		if(drawFrame)
        			dojo.destroy(drawFrame.$);
        	}
        }
        
        var masterPageName = dojo.attr(slideElem,'draw_master-page-name');
        var masterPageContent = PresCKUtil.ChangeToCKNode(document.getElementById(masterPageName));
        
        //loop through all the objects in the array and check against current slide
        for (var i=0; i<resultArray.length; i++){
            var layoutObj = resultArray[i];
            var presClass = layoutObj.type;
            //Check whether we could find such layoutobject in current slide
            var slideDrawFrames = dojo.query(".draw_frame[presentation_class='"+presClass+"'][presentation_placeholder='true']", slideElem);
            var presentObj = null;
            for (var j=0; j<slideDrawFrames.length; j++){
                var obj = PresCKUtil.ChangeToCKNode(slideDrawFrames[j]);
                if(obj.hasClass('deploied'))
                	continue;
                presentObj = obj;
                obj.addClass('deploied');
                break;
            }
            
         	//we need build the layout object according to targte presentation type
            if(!presentObj)
            {
            	var contentContainerOrig = null;
            	//first find this placeholder from master page
            	if(masterPageContent)
            	{
                    var masterPlaceholders = dojo.query(".draw_frame[presentation_class='"+presClass+"'][presentation_placeholder='true']", masterPageContent.$);
                    if(masterPlaceholders.length)//we use the first object from master page placeholder
                    	contentContainerOrig = masterPlaceholders[0];
            	}
            	
            	var bNewedLayoutObj = false;
            	//could not find from master page, we try to find from layout data
            	if(!contentContainerOrig)
            	{
                    var presPageLayoutContent = document.getElementById(presPageLayoutName);
                    if(presPageLayoutContent!=null){
                        var contentContainers = dojo.query(".draw_frame[presentation_class='"+presClass+"'][presentation_placeholder='true']", presPageLayoutContent);
                        if(contentContainers!=null && contentContainers.length>0){
                        	var contentContainerOrig = contentContainers[0];//in case of not found
                            //try to found "the one" in layout page
                        	if(contentContainers.length>1){
                                for(var y=0; y<contentContainers.length; y++){
                                    var cc = contentContainers[y];
                                    if(cc.style.top == layoutObj.top 
                                    		&& cc.style.left == layoutObj.left 
                                    		&& cc.style.height == layoutObj.height 
                                    		&& cc.style.width == layoutObj.width){
                                        contentContainerOrig = cc;
                                        bNewedLayoutObj = true;                                      
                                        break;
                                    }
                                }
                            }
                        }
                    }
            	}

                
                if(contentContainerOrig)
                {
     	       		 var divDrawFrame = PresCKUtil.ChangeToCKNode(contentContainerOrig.cloneNode(true));
    	    		 divDrawFrame.addClass("layoutClass");
    	    		 //TODO : we should check master page to see whether it has index support
    	    		 //if not, we should not add this attribute
//    	    		 var index = parseInt(layoutObj.index);
//            		 if(index!=0)
//            		 {
//            			 divDrawFrame.setAttribute('presentation_placeholder_index',index);
//            		 }
    	    		            		 
    	    		 //update z-index=========
    	             var tmpZ = window.pe.scene.slideEditor.maxZindex;
    	             if (tmpZ <= 0) tmpZ = 500;	// start from 500 so we have enough room to handle multiple sendtoback
    	             tmpZ = parseInt(tmpZ)+5;
    	             divDrawFrame.setStyle('zIndex',tmpZ);
    	             window.pe.scene.slideEditor.maxZindex = tmpZ;
    	             divDrawFrame.setAttribute('draw_layer','layout');
    	             this._constructDefaultPalceholder(divDrawFrame,presClass,presPageLayoutName);
    	             this.setFrameId(divDrawFrame.$);
    	             slideElem.appendChild(divDrawFrame.$);
    	             divDrawFrame.addClass('deploied');
    	            if(bNewedLayoutObj)
    	            {
    	            	dojo.query('p,li',divDrawFrame.$).forEach(function(node){	
    	            		dojo.addClass(node,'default_'+presClass+'_style');
    	            		if(PresCKUtil.checkNodeName(node,'li'))
    	            		{
    	            			dojo.addClass(node,'lst-c');
    	            		}
    					});
    	            }
    	             
    	             presentObj = divDrawFrame;
                }

            }
            if(presentObj)
            {
                //Update position
                var pos = {'top':layoutObj.top,'left':layoutObj.left,'height':layoutObj.height, 'width':layoutObj.width};
                if(dojo.attr(presentObj.$,'presentation_class') == "graphic" 
                	|| dojo.attr(presentObj.$,'presentation_class') == "group") {
                    //adjust the position ONLY according to layout position, we don't want to resize the image
    	                dojo.style(presentObj.$,{
    	        			'top' : pos.top,
    	        			'left': pos.left,
    	        			'position':'absolute'
    	        		});
                 } else {
                    //adjust the size and position according to layout position
    	                dojo.style(presentObj.$,{
    	        			'top' : pos.top,
    	        			'left': pos.left,
    	        			'height': pos.height,
    	        			'width': pos.width,
    	        			'position':'absolute'
    	        		});
                 }
            }
            else
            {
            	console.error('we found one missing presentation object:'+presClass+' in layout : '+ presPageLayoutName);
            }

            
        }
        //clean up temp flag
        dojo.query(".deploied", slideElem).forEach(function(node){	
        	dojo.removeClass(node,'deploied');
		});
        
        //here we just need to build the new slide with new layout
        //the following things leave this.applyLayout to take.
        ////////////////////////////////////////////////////////////////////
        this.refreshPlaceHolder(slideElem,true);
        PresCKUtil.updateRelativeValue(slideElem);
        needUpdateListStyle && PresCKUtil.copyAllFirstSpanStyleToILBefore(slideElem,['font-size']);
        return slideElem;
        
    },
    
    getLayoutResultArray: function(layoutName){
        var resultArray = [];
        if( layoutName !=null && layoutName.length>0 && this.isSupportedLayout(layoutName)){
			var presPageLayoutContent = document.getElementById(layoutName);
            if(presPageLayoutContent!=null){
                var objectBoxArray = dojo.query(".draw_frame[presentation_placeholder='true']", presPageLayoutContent);
                if(objectBoxArray!=null && objectBoxArray.length>0){
                	var outlineIndex = 1;
                	for (var i=0; i< objectBoxArray.length; i++){
	                  	 var index = 0;
 	                  	 var presType = dojo.attr(objectBoxArray[i],'presentation_class');
 	                  	 if(!this.isSupportedPlaceholderClass(presType))
 	                  		presType = 'outline';
 	                  	 if((layoutName == "ALT3"||layoutName == "ALT3-RTL")&&(presType == 'outline'))//Two outline
 	                  	{
 	                  		 index = outlineIndex;
 	                  		 outlineIndex++;
 	                  	}
 	                       resultArray.push({
 	                              'type': presType,
 	                              'top' :  objectBoxArray[i].style.top,
 	                              'left' : objectBoxArray[i].style.left,
 	                              'height' : objectBoxArray[i].style.height,
 	                              'width' : objectBoxArray[i].style.width,
 	                              'layoutName':layoutName,
 	                              'index' : index
 	                       });
 	                   	
                	}      	                
                }
            }
        }
  	  return resultArray;
    },
    applyLayoutForMultiSlidesToScene:function(presPageLayoutName, slideArray,msgPairList, isFromOtherDocForPasteSlides, resultArray, msgActs){
        if(slideArray == null){
            slideArray = this.multiSelectedSlides;
        }
        if(resultArray == null){
            resultArray = this.getLayoutResultArray(presPageLayoutName);
        }
        
        if(resultArray == null || slideArray==null || presPageLayoutName== null || presPageLayoutName=="")
        	return msgPairList;
        
        if(isFromOtherDocForPasteSlides!=true){
            // defect 16324  change contentboxlock check to slidelock check to prevent strange behaviors when other users is
        	//               viewing or working on the slide.
        	//var isContentLocked = window.pe.scene.isMultiSlideHasContentBoxLocked(slideArray);
        	var isContentLocked = this.isMultiSlidesHaveLockedSlide();
            if(isContentLocked == true){
                //prevent layout change and shows a message operation is not allowed if there is a content box locked
                var isSlide = true;
                this.publishLaunchContentLockDialog(isSlide);
                return msgPairList;
            }
        }
        
        if (!msgActs) msgActs = [];
                
        for(var i=0; i< slideArray.length; i++){
            var slideElem = slideArray[i];
            //load slide from slidesorter just in case multiselected slides have unloaded content
            this.loadSlideToSorter(slideElem);
            // get the slide wrapper. If draw page is sent, undo cannot work well
            // create rn message de act
            var ckSlideWrapperElem = new CKEDITOR.dom.node(slideElem.parentNode);
            msgActs.push(SYNCMSG.createDeleteElementAct(
                ckSlideWrapperElem.getIndex(), 1, ckSlideWrapperElem.getParent(), [ckSlideWrapperElem], true));
            var newSlideElem = dojo.clone(slideElem);
            this.applyLayoutToSlide(resultArray, newSlideElem, isFromOtherDocForPasteSlides,true);
            msgPairList = this.applyLayoutToScene(newSlideElem, msgPairList, isFromOtherDocForPasteSlides);
            this.updateSlideObject(slideElem);
            // create rn message de act
            ckSlideWrapperElem = new CKEDITOR.dom.node(slideElem.parentNode);
            msgActs.push(SYNCMSG.createInsertElementAct(
                ckSlideWrapperElem.getIndex(), ckSlideWrapperElem.getParent(), ckSlideWrapperElem, true, true));
        }
                
        return msgPairList;
    },
    //get drawFrames that are direct children of slide element (first level children of slide elem)
    //excludes drawFrames in deeper levels like inside shapes or speaker notes etc
    getDirectDrawFrameChildren:function(slideElem){
        var children = [];
        if(slideElem!=null){
            var parent = slideElem.parentNode;
            children = dojo.query(".draw_page > .draw_frame", parent);
        }
        console.log("drawFrames:"+children.length);
        return children;
    },
    onKeyUp: function(e){

        // summary:
        //event processor for onkeyup, watching for page_down, page_up, arrow keys,
        // keys to handle slide navigation
        // e: Event
        //keyboard event
        //console.log("handleOnKeyUp");
        //33 pageUp, 34 pagedown, 37 left arrow, 39 right arrow, 38 up arrow, 40 down arrow
        if(e.keyCode == 33 || e.keyCode == 34 || e.keyCode == 37 ||e.keyCode == 39 ||e.keyCode == 38 || e.keyCode == 40      ){ //page up/pageDown
            //widgitize slideEditor
                if(window.pe.scene.slideEditor.slideSelectedTimeOut!=null){
                    //console.log("onKeyUp-clearTimeOut1");
                    clearTimeout(window.pe.scene.slideEditor.slideSelectedTimeOut);
                    //window.pe.scene.hideErrorMessage(); //when we set the timeout, we show info message about slide being prepared
                    window.pe.scene.slideEditor.hidePreparingSlideMsg();
                }

                if(this.selectedSlide != this.slides[this.slides.length-1]){
                    this.isOnLastSlideByKey = false;
                }else if(this.selectedSlide != this.slides[0]){
                    this.isOnFirstSlideByKey = false;
                }
                var slideDom = dojo.clone(this.selectedSlide);
                var slideInEditorId = window.pe.scene.slideEditor.mainNode.id;
                var isWidgitized = dojo.attr(window.pe.scene.slideEditor.mainNode, "isWidgitized");
                if(isWidgitized != true && ((this.isOnLastSlideByKey != true && (e.keyCode == 34 || e.keyCode == 39 || e.keyCode == 40)) || (this.isOnFirstSlideByKey != true && (e.keyCode == 33 || e.keyCode == 37 || e.keyCode == 38)))){ //if this is page down/up on the slide that is not currently in the slide Editor widgitized
                        //window.pe.scene.slideEditor.loadSlideInEditor(slideDom,false,slideInEditorId); //using false flag for the widgitizeImmediately Flag for using setTimeoutWidgitize so we have time to cancel it for pagedown performance 6042
                        if(window.pe.scene.slideEditor.loadSlideTimeout!=null){
                            clearTimeout(window.pe.scene.slideEditor.loadSlideTimeout);
                            //window.pe.scene.hideErrorMessage(); //when we set the timeout, we show info message about slide being prepared, now we cancel the timeout, need to clear it
                            window.pe.scene.slideEditor.hidePreparingSlideMsg();
                            //console.log("onKeyUp-clearTimeOutLoadSlide");
                        }
                        var timeOutVal = 5;

                        //need to see how many objects to be widgitized and adjust the widgitize timer
                          var drawFrameObjects = this.getDirectDrawFrameChildren(slideDom);
                          if(drawFrameObjects!=null && drawFrameObjects.length >= 100){
                              console.log ("too many objects");
                              timeOutVal = 500;
                              window.pe.scene.slideEditor.hidePreparingSlideMsg();
                              window.pe.scene.slideEditor.showPreparingSlideMsg();
                          }

                        window.pe.scene.slideEditor.loadSlideTimeout = setTimeout(dojo.hitch(window.pe.scene.slideEditor,window.pe.scene.slideEditor.loadSlideInEditor,slideDom,true,slideInEditorId),timeOutVal);

                    if((e.keyCode == 34 || e.keyCode == 39 || e.keyCode == 40)&& this.selectedSlide == this.slides[this.slides.length-1]){
                        this.isOnLastSlideByKey = true;
                        this.isOnFirstSlideByKey = false;
                    }else if((e.keyCode == 33 || e.keyCode == 37 || e.keyCode == 38)&& this.selectedSlide == this.slides[0]){
                        this.isOnFirstSlideByKey = true;
                        this.isOnLastSlideByKey = false;
                    }else{
                        this.isOnFirstSlideByKey = false;
                        this.isOnLastSlideByKey = false;
                    }
                }
                slideDom = null;
        }
    },

    getSupportedLayout: function(){

        this.supportedLayoutArray = [];
        var galleryLayoutIndex = new concord.widgets.layoutGallery.galleryLayoutIndex();
        if(galleryLayoutIndex.templates !=null)	{
            for(var i=0; i < galleryLayoutIndex.templates.length; i++){
                if(galleryLayoutIndex.templates[i].template!=null){
                    var layoutId = galleryLayoutIndex.templates[i].template.id;
                    //15496 - layout Id from galleryLayoutIndex template has sufffix "_layout_id"
                    //need to strip it out
                    var idx = layoutId.indexOf("_layout_id");
                    var trueId = layoutId;
                    if(idx>=0){
                        trueId = layoutId.substring(0, idx);
                    }
                    this.supportedLayoutArray[trueId] = true;
                }
            }
        }

        /*
            var referrer= this;
            try
            {
                var xhrArgs =
                    {

                        url: this.supportedLayoutJSONPath,
                        handleAs: 'json',
                        load: dojo.hitch(this, function(data) {
                                this.supportedLayoutArray=[];
                                if(data.templates !=null)	{
                                    for(var i=0; i < data.templates.length; i++){
                                        if(data.templates[i].template!=null){
                                            this.supportedLayoutArray[data.templates[i].template.id] = true;
                                        }
                                    }
                                }
                        }),
                        error: function(error)
                        {
                            if(window.g_concordInDebugMode)
                            {
                                console.log('***********************');
                                console.log('Slidesorter > Error received while loading supported layout');
                                console.log(error);
                                console.log('***********************');
                            }
                        }
                    }

                if(window.g_concordInDebugMode)
                {
                    console.log('***********************');
                    console.log('Slidesorter > Sending request to load supported layout');
                    console.log('***********************');
                }

                var xhrCall = dojo.xhrGet(xhrArgs);
            }
            catch(e)
            {
                if(window.g_concordInDebugMode)
                {
                    console.log('***********************');
                    console.log('Slidesorter > Error while loading supported layout');
                    console.log(e);
                    console.log('***********************');
                }
            }
        */
    },
    handleSelfFocusRemoved:function(){
        if(this.multiSelectedSlides!=null && this.selectedSlide!=null){
            for(var i=0; i<this.multiSelectedSlides.length; i++){
                if(this.multiSelectedSlides[i].id != this.selectedSlide.id){
                    //deselect if this is not the selected slide in the slide editor
                    //remove multiselection if any
                    this.deselectSlide(this.multiSelectedSlides[i],i);
                    i--;
                }
            }
        }
    },
    setContentDefaultFonts: function(){
        if(this.contentLangClassName!=null){
            if (this.contentLangClassName == "lotusJapanese") {
                window.pe.scene.defaultFonts = "MS PMincho, MS PGothic, Apple Gothic, Arial, Verdana, sans-serif";
            } else if (this.contentLangClassName =="lotusKorean") {
                window.pe.scene.defaultFonts = "'Gulim','GulimChe',Arial, Helvetica, sans-serif";
            }

            /*
             //The following to get the current content font-family doesn't work for the first slide where
             //the first slide is already loaded and browser hasn't apply the correct css so speakerNodes is using window.pe.scene.defaultFonts still contains old value
            var body = this.editor.document.$.body;
            window.pe.scene.defaultFonts = dojo.getComputedStyle(body).fontFamily;
            body = null;
            */
        }
    },
    handleContentLanguage: function(){
        // Following code for story 6483
        // story 13127 - saving the language classname to document and be persistent,
        //even when browser locale has changed, document content language stays the same as it is originally created
        this.contentLangClassName= null;
        var body = this.editor.document.$.body;
        if(dojo.hasClass(body, "langclass_pending")){ //if it is a new document..
            //only add className for language when it is a new document which has indication of langclass_pending
            var oldClass = body.getAttribute("class");
            var langClassName = concord.util.HtmlContent.addI18nClassToBody(body);
            if(langClassName!=null){
                dojo.removeClass(body, "langclass_pending");
                //add the classname to slideEditor div also to ensure consistency of slidesorter and slide editor
                var slideEditorContainer = dojo.byId("slideEditorContainer");
                dojo.addClass(slideEditorContainer, langClassName);
                this.contentLangClassName = langClassName;
                //send co-edit to save into doc
                var newClass = body.getAttribute("class");
                var msgPairList = [];
                var act = SYNCMSG.createAttributeAct(body.id,{"class":newClass}, null, {"class":oldClass}, null );
                var msg = SYNCMSG.createMessage( MSGUTIL.msgType.Attribute ,[act]);
                msgPairList.push(msg);
                // Don't set Undo
                var addToUndo = false;
                msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
                SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
            }
        }
        else{ //if it is not a new document, we need to grab the language class from body and apply the same to slideEditor
            var classname = new concord.i18n.ClassName();
            if(classname){
                var allPossibleClassNames = classname.getAllLangClass();
                for(var z=0; z<allPossibleClassNames.length; z++){
                    var cn = allPossibleClassNames[z];
                    if(cn!=null && dojo.hasClass(body, cn)){
                        //add the classname to slideEditor div also to ensure consistency of slidesorter and slide editor
                        var slideEditorContainer = dojo.byId("slideEditorContainer");
                        dojo.addClass(slideEditorContainer, cn);
                        this.contentLangClassName =cn;
                    }
                }
                //for imported doc that doesn't have language class set
                if(this.contentLangClassName == null){
                    //add the classname to slideEditor div also to ensure consistency of slidesorter and slide editor
                    var slideEditorContainer = dojo.byId("slideEditorContainer");
                    dojo.addClass(slideEditorContainer, "lotusDefault");
                }
            }
        }
        this.setContentDefaultFonts();
        body = null;
    },

    getNotifyTool: function() {
        if (this.notifyTool == null)
            this.notifyTool = new concord.widgets.notifyTool(this,this.currentScene);
        return this.notifyTool;
    },
    
    loadForMaster: function() {
        if (this.presBean != null) {
            var masterHTMLUrl = concord.util.uri.getEditAttUri("master.html");
            var masterStyleUrl = concord.util.uri.getEditAttUri("office_styles.css");
            if (masterStyleUrl != null) {
                var paramIdx = masterStyleUrl.indexOf("?");
                if (paramIdx >= 0) {
                    masterStyleUrl = masterStyleUrl.substring(0, paramIdx);
                }
            }
          
            this.loadMasterHtml(masterHTMLUrl, masterStyleUrl);
        }
    },
    
    loadForLayout: function() {
        //load presentation layout html
        //var layoutHTMLUrl=concord.util.uri.getEditAttUri("presentation_layout.html");
        this.loadPresLayoutHtml(this.layoutHtmlDocUrl);
        this.getSupportedLayout();
    },
    
    registerEventForSlides: function() {
    	//add events
        //moved to load slide to sorter
        //connect keyup to the document, so we process keyup event, for improving pagedown/pageup performance
        //to just widgitize only when keyup after pagedown/pageup, etc
        dojo.connect(document, "onkeyup",dojo.hitch(this, this.onKeyUp));
        
        this.slideSorterContextMenu = new concord.widgets.slideSorterContextMenu();
        this.slideSorterContextMenu.initialize(this, this.slides[0]);

        for (var i=0; i<this.slides.length; i++) {
            this.connectEvents(this.slides[i]);
            this.deselectSlide(this.slides[i]);
            // set all draw-page <div>'s to be hidden for jaws - otherwise jaws will try to read the contents in the slide sorter
            dijit.setWaiState(this.slides[i], 'hidden', 'true');
        }
    },

    getTaskHdl: function(){
        return this.taskHandler;
    },
    //in IE, after loaded to CKEDITOR the taskEntryImg div doesn't have children, it should have nbsp; as children so the image set in css would show
    fixTaskEntryImg:function(){
        var taskEntryImgDivs = dojo.query(".taskEntryImg", this.getSorterDocument());
        for(var i=0; i<taskEntryImgDivs.length; i++){
            if(taskEntryImgDivs[i].innerHTML == ""){
                taskEntryImgDivs[i].innerHTML = "&nbsp;";
            }
        }
    },         
    processForTask: function() {
        //process tasks related
        if (this.currentScene.sceneInfo.mode == "edit" && this.currentScene.bAssignment) {
            //fix taskEntryImg div for ie
            if (CKEDITOR.env.ie) {
                this.fixTaskEntryImg();
            }
            this.taskHandler = new concord.task.PresTaskHandler(this.editor, this.currentScene.bean, this);
        }

        //loadTasks
        if (this.taskHandler && (this.currentScene.sceneInfo.mode == "edit")) {
            this.taskHandler.loadTasks(this.currentScene.bean);
        }
    },
    
	createUtilAndTransDiv:function(slideElement, slideNum){
        // slide num : slideNum
        var slideUtilDiv = document.createElement("div");
        dojo.addClass(slideUtilDiv, "slideUtil");
        dijit.setWaiState(slideUtilDiv, 'hidden', 'true');

        var slideNumberDiv = document.createElement("div");
        dojo.addClass(slideNumberDiv, "slideNumber");
        slideNumberDiv.innerHTML = slideNum;
        slideUtilDiv.appendChild(slideNumberDiv);
        
        //create slide transition icon
        var slideTransitionIconDiv = document.createElement("div");
        concord.util.HtmlContent.injectRdomIdsForElement(slideTransitionIconDiv);
        var transitionIcon = this.getTransitionType(slideElement);
        dojo.addClass(slideTransitionIconDiv, transitionIcon);
        slideUtilDiv.appendChild(slideTransitionIconDiv);

        var slideWrapper = slideElement.parentNode;
        slideWrapper.appendChild(slideUtilDiv);
		
	},
	
	setTransformForMobile: function(slideElement) {
	  // check
	  if (!concord.util.browser.isMobile())
		  return false;

	  if (!slideElement)
		  return false;
	  
	  var slideWrapper = slideElement.parentNode;
	  if (!slideWrapper)
		  return false;
	  
	  // set style
	  dojo.style(slideWrapper, "WebkitTransform", "translate3d(0, 0, 0)");  // -webkit-transform
	  return true;
	},
	
	prepareForSlide: function(slideElement, slideNum) {
		if (slideNum > 1) {
			this.deselectSlide(slideElement);
		}
		
        this.createUtilAndTransDiv(slideElement, slideNum);
        // load to sorter
    	var slideId = slideElement.id;
    	var slideContentObj = this.contentHandler.getSlideContent(slideId);
    	if (slideContentObj == null) {
    		return;
    	}
 
    	slideElement.innerHTML = slideContentObj.getSlideInnerHtml();
    	this.handlePlaceHolders(slideElement);
    	
    	var msgPairList = [];
        //substitute default content text with NLS Strings, this we don't want to coedit
        this.substituteDefaultTitleSubtitleTextWithNLS(slideElement);
        //fix table stylings
        msgPairList =this.fixTableStylings(slideElement,  msgPairList);
        //check and create background image div if it was set from css
       // msgPairList = this.checkNcreateBackgroundImageDivFromCss(slideElement, null, msgPairList);
        //fix paragraph margins, convert em to %
        msgPairList = this.fixParagraphMargins(slideElement,  msgPairList);
        //fix old master styles url
        msgPairList = this.fixOldMasterStylesUrl(slideElement, msgPairList);
        
        //save the modified content back to the contentHandler
        this.updateSlideObject(slideElement);
        //D28782: There is a  message said that  "There are edits to this draft that have not been published as a version." even there is not change for the file.
//        //Send Coedit msg for inserted background image div
//        if (msgPairList!=null && msgPairList.length > 0){
//            //-replace removeUndo
//            var addToUndo = false;
//            msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0], addToUndo);
//
//            SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
//        }

        slideContentObj.setWasLoaded(true);
        slideContentObj.setIsLoaded(true);

        // add browser-specific class to slide wrapper.
        // this class should NOT be coedited!
        this.addBrowserClassToWrapper(slideElement);
        this.setTransformForMobile(slideElement);
        //D28375: [Regression][Coedit]Have number in slide after cut slide at the same time
        this.cleanSlideUtil(slideElement);
        this.disableAnchorInSorter(slideElement);
        this.updateHeaderFooterDateTimeFields(slideElement);
        this.updatePageNumberFields(slideElement, slideNum);
        try{
        	this.refreshPlaceHolder(slideElement);
        }catch (evt){
   	       	console.log("=======>pe.scene.slideSorter.refreshPlaceHolder:error="+evt);
   	    }
        // regist for onClick event
        var disconnectArray = [];
        disconnectArray.push(dojo.connect(slideElement, 'onclick', dojo.hitch(this,this.onclickFunc)));
        this.connectArray[slideElement.id] = disconnectArray;
        
        
	},
	
	getMoreSlide: function(start, end, inc) {
		this._getMoreSlideTimer = null;
		// get out of the timer
		if (start > end) {
		  // check for more html contemt
		  if (pe.scene.chunkId != null) {
			  if (this.moreHtmlContent == null){
				  if(!this._getMoreSlideTimer)
					  this._getMoreSlideTimer = setTimeout(dojo.hitch(this, this.getMoreSlide, start, end, inc), this.intervalSlide);
			    return;
			  }
			  
			  pe.scene.chunkId = null;
			  if (this.moreHtmlContent == "failed") {
			    return;
			  }
			  
			  // console.info("!!! to render more content !!!");
			  var newStart = end + 1;
			  var newEnd = this.contentHandler.addMoreContentHtml(this.moreHtmlContent);
			  if (newEnd > end) {
				  if(!this._getMoreSlideTimer)
					  this._getMoreSlideTimer = setTimeout(dojo.hitch(this, this.getMoreSlide, newStart, newEnd, inc), this.intervalSlide);
			  }
			  return;
			  
		  } else {
		    pe.scene.disableUIForReadOnlyMode(false);
		    this.postContentLoaded();
		    return;
		  }
		}
		
		// check
		var end_this = start + inc - 1;
		if (end_this > end)
			end_this = end;
		else if (inc == 0)
			end_this = end;
		
		this.contentHandler.createSlideContent(start, end_this);
		var moreContent = this.contentHandler._getHtmlContentForSlide(start, end_this);
		if ((moreContent != null) && (moreContent.length > 0)) {
			// finished on server side; memory issue on iOS7
			// moreContent = moreContent.replace(/[\r\n]*/ig,'');
			
			// append 
			dojo.place(moreContent, this.officePrezDiv.lastChild, "after");
			moreContent = null;
			
			// deal with each slide
			var from_m = this.slides.length;
			this.slides = dojo.query('.draw_page', this.officePrezDiv);
			var end_n = this.slides.length;

			var styleHeight = this.slides[0].style.height;
			var styleFontSize = this.slides[0].style.fontSize;
			
			for (var i=from_m; i < end_n; i++) {
				this.slides[i].style.height = styleHeight;
				this.slides[i].style.fontSize = styleFontSize;
				
				this.prepareForSlide(this.slides[i], i+1);
	        }  // end for
		}
		
		// go on
		var new_start = end_this + 1;
		if(!this._getMoreSlideTimer)
			this._getMoreSlideTimer = setTimeout(dojo.hitch(this, this.getMoreSlide, new_start, end, inc), this.intervalSlide);
	},
	
	getMoreHtmlContent: function(state) {
		// get more html content
		pe.scene.getMoreContentTS = (new Date()).getTime();
		console.info("!!!!!! more content.html : after the first package - " + (pe.scene.getMoreContentTS - pe.scene.getContentTS));
		console.info("!!!!!! more content.html : time - " + (pe.scene.getMoreContentTS - pe.scene.requestMoreContentTS));
			
		var status = state.content.status;
		console.info("!!!!!! more content.html : status - " + status);
		
		if (status == "OK") {
			this.moreHtmlContent = state.content.html;
			var contentSize = state.content.html.length / 1024;
			
  			console.info("!!!!!! more content.html : size(in K byte): " + contentSize);
  			console.info("!!!!!! more content.html : srcfrom - " + state.content.srcfrom);
		} else {
			this.moreHtmlContent = "failed";
		}
	},

	requestMoreHtmlContent: function() {
		this._requestMoreHtmlContentTimer = null;
		// request for more html content
		pe.scene.requestMoreContentTS = (new Date()).getTime();
		var criteria ={"inPartial":true, "chunkId":pe.scene.chunkId};
		pe.scene.session.getPartial(dojo.hitch(this, this.getMoreHtmlContent), criteria);
	},
	/**
	 * When apply reset content message should stop the partial loading process.
	 */
	stopPartialLoading: function()
	{
		console.info(" === stop partial loading ===");
		window.needBreak = true;
		pe.scene.chunkId = null;
		if(this._getMoreSlideTimer)
		{
			clearTimeout(this._getMoreSlideTimer);
			this._getMoreSlideTimer = null;
		}
		if(this._requestMoreHtmlContentTimer)
		{
			clearTimeout(this._requestMoreHtmlContentTimer);
			this._requestMoreHtmlContentTimer = null;
		}
		
		this.moreHtmlContent = null;
	},
	
    checkIfMoreContent: function() {
    	var hasMoreHtmlContent = false;
    	
    	// request for more html
    	if (pe.scene.chunkId != null) {
    		if(!this._requestMoreHtmlContentTimer)
    			this._requestMoreHtmlContentTimer = setTimeout(dojo.hitch(this, this.requestMoreHtmlContent), 100);
    		hasMoreHtmlContent = true;
    	}
    	
    	// render slide
    	var info = this.contentHandler.hasMoreSlide();
    	if (info[0] == 1) {
    		var start = info[1];
    		var end = info[2];
    		var inc = this.fetchSlideNum;
    		
    		pe.scene.disableUIForReadOnlyMode(true);
    		if(!this._getMoreSlideTimer)
    			this._getMoreSlideTimer = setTimeout(dojo.hitch(this, this.getMoreSlide, start, end, inc), this.intervalSlide);
    		return;
    	}
    	
    	if (hasMoreHtmlContent) {
    		var end = info[2];
    		var start = end + 1;
    		var inc = this.fetchSlideNum;
    		
    		pe.scene.disableUIForReadOnlyMode(true);
    		if(!this._getMoreSlideTimer)
    			this._getMoreSlideTimer = setTimeout(dojo.hitch(this, this.getMoreSlide, start, end, inc), this.intervalSlide);
    		return;
    	} else {
    	    
    		this.postContentLoaded();
    	}
    },
        
    cleanRedundantString: function() {
    	// clean redundant string
    	var rsCounter = 0;
    	
    	if (this.presHtmlContent) {
    		rsCounter += this.presHtmlContent.length;
    		this.presHtmlContent = null;
    	}
    	if (this.moreHtmlContent) {
    		rsCounter += this.moreHtmlContent.length;
    		this.moreHtmlContent = null;
    	}
    	if (this.contentHandler) {
    		rsCounter += this.contentHandler.cleanRedundantString();
    	}
    	
    	console.info(">>> redundant string size (in K byte): " + rsCounter/1024);
    },

    parseCss: function() {
        var url= 'office_automatic_styles.css';
        var theEditor = window.pe.scene.slideEditor;
        var cssNode = theEditor.injectCssStyle(url);
        if (cssNode) {
            this.officeAutomaticStylesMap =
                PresCKUtil.parseExternalCss(cssNode);
        }

        url= 'office_styles.css';
        cssNode = theEditor.injectCssStyle(url);
        if (cssNode) {
            this.officeStylesMap =
                PresCKUtil.parseExternalCss(cssNode);
        }

        this.internalCssMap =
            PresCKUtil.parseInternalCss(theEditor.inLineStyles[0]);
    },

    postContentLoaded: function() {
    	this.cleanRedundantString();
    	var isMobile = concord.util.browser.isMobile();
    	
    	// load for master
    	this.loadForMaster();
    	
    	// register for keyup
    	dojo.connect(document, "onkeyup",dojo.hitch(this, this.onKeyUp));
    	
    	// create spellChecker
    	this.spellChecker = window.spellcheckerManager.createSpellchecker(this.editor.document.getWindow().$.frameElement, false, true);
    	var autoScayt = this.spellChecker.isAutoScaytEnabled();
    
        // loop for each slide
        for (var i=0; i<this.slides.length; i++) {
            // register for event
        	var disconnectArray = this.connectArray[this.slides[i].id];  
        	if (!isMobile) {
        		disconnectArray.push(dojo.connect(this.slides[i], 'oncontextmenu', dojo.hitch(this,this.oncontextmenuFunc)));
        		disconnectArray.push(dojo.connect(this.slides[i].parentNode, 'onclick', dojo.hitch(this,this.slideWrapperOnClickFunc)));
        	}
            
            
            // set all draw-page <div>'s to be hidden for jaws - otherwise jaws will try to read the contents in the slide sorter
            dijit.setWaiState(this.slides[i], 'hidden', 'true');
            
            // dnd
            dojo.addClass(this.slides[i].parentNode, 'dojoDndItem');
            
            // spell check
            if (autoScayt) {
            	this.spellChecker.checkNodes(this.slides[i], this.slides[i], null);
            }
        }

    	this.processForTask();

     	// dojo.withDoc(this.editor.document.$, dojo.hitch(this,this.handleDndSrc), null);
        this.slideSorterDndSource = new concord.widgets.presSource(this.officePrezDiv, {delay:5});
        
        // contextMenu on slidesorter
        if (isMobile) {
        	this.slideSorterContextMenu = null;
        } else {
        	this.slideSorterContextMenu = new concord.widgets.slideSorterContextMenu();
        	if (this.slideSorterContextMenu != null) {
        		this.slideSorterContextMenu.initialize(this, this.slides[0]);
        		//initialize slide sorter context menu
        		this.slideSorterContextMenu.bindContextMenuToSlide( this.selectedSlide );
        	}
        }
    	
        // add contextMenu on slideEditor in non view mode
    	if (!isMobile && !window.pe.scene.isViewDraftMode())
    		window.pe.scene.slideEditor.addContextMenu();
        
        // set flag for loadfinished
    	pe.scene.bLoadFinished = true;

    	// parse 2 css files into map instead of loading them all
    	this.parseCss();

    	// to enable "share"/"comment" button
    	!isMobile && pe.scene.disableShareCommentButton(false);

    	// user join
    	pe.scene.dealWithUserJoinInLoading();

    	// need to widgitize the selected slide before apply co-editing message
    	var slideId = window.pe.scene.slideEditor.mainNode.id;
    	window.pe.scene.slideEditor.loadSlideInEditor(this.selectedSlide, true, slideId);
    	pe.scene.dealWithCemsgInLoading();

    	// publish selected slide after co-editing
    	this.publishAllSlidesDoneLoading();
    	pe.scene.bCommandIgnored = false;
    },
    
    showSlideNumCheckMsg:function(){
    	//#42084 if total slide number is greater than certain number, needs to show warning message to the user
    	var msgStr = this.STRINGS.slides_toolarge_warning;
        var numCheckMsg = dojo.string.substitute(msgStr, [this.maxSlideNum]);
		window.pe.scene.showWarningMessage(numCheckMsg, 10000); //show message with interval time 10 sec for msg expiration, message will be hidden as soon as widgitized finished or timeout is cleared
    },
    
    showPastedSlideNumCheckMsg:function(){
    	var msgStr = this.STRINGS.slides_paste_toolarge_warning;
        var numCheckMsg = dojo.string.substitute(msgStr, [this.maxPasteSlidesNum]);
		window.pe.scene.showWarningMessage(numCheckMsg, 10000); //show message with interval time 10 sec for msg expiration, message will be hidden as soon as widgitized finished or timeout is cleared
    },
    
    showPasteMsg:function(){
    	window.pe.scene.showWarningMessage(this.STRINGS.slides_paste_warning, 10000);
    },
    
    hidePasteMsg:function(){
    	window.pe.scene.hideErrorMessage();
    }
});
