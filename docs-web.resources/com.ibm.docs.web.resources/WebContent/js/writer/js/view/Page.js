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
define([
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/has",
    "dojo/query",
    "dojo/_base/array",
    "dojo/_base/declare",
    "writer/common/Space",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Settings",
    "writer/msg/msgCenter",
    "writer/util/SectionTools",
    "writer/util/ViewTools",
    "writer/view/AbstractView",
    "writer/view/Body",
    "writer/view/Footer",
    "writer/view/Header",
    "writer/model/HFType"
], function(domConstruct, domStyle, domClass, has, query, array, declare, Space, Container, tools, constants, Settings, msgCenter, SectionTools, ViewTools, AbstractView, Body, Footer, Header, HFType) {

    var Page = declare("writer.view.Page", null, {
    	constructor: function(doc, section, previousPage) {
	        var secTools = SectionTools;
	        var setting = pe.lotusEditor.setting;
	        this.section = section;
	        this._pageSize = section.pageSize;
	        this._pageMargin = section.pageMargin;
	        //define this page's left position to make the page at the center of document
	        this.updateLeftAttr(doc);
	
	        this.parent = doc;
	        this.container = new Container(this);
	        var left = this._pageMargin.left;
	        var bodywidth = this._pageSize.w - this._pageMargin.left - this._pageMargin.right;
	        this.bodywidth = bodywidth;
	        this.pageNumber = 1;
	
	        // is first page?
	        this.isFirstPage = !(previousPage && (previousPage.section == this.section));
	        this.isDiffFirstPage = section.firstDifferent && this.isFirstPage;
	
	        // is even page?
	        this.isEvenPage = false;
	        this.isOddPage = false;
	
	        if (previousPage && !isNaN(previousPage.pageNumber)) {
	            this.pageNumber = parseInt(previousPage.pageNumber) + 1;
	        }
	
	        if (setting.isDiffOddEvenPages()) {
	            this.isEvenPage = (this.pageNumber % 2 == 0);
	            this.isOddPage = (this.pageNumber % 2 == 1);
	        }
	
	        // get linked header/footer section
	        var linkedSecOfFirstPageHeader = section;
	        var linkedSecOfFirstPageFooter = section;
	        var linkedSecOfDefaultHeader = section;
	        var linkedSecOfDefaultFooter = section;
	        var linkedSecOfEvenHeader = section;
	        var linkedSecOfEvenFooter = section;
	
	        // get first page header/footer section
	        if (this.isDiffFirstPage) {
	            linkedSecOfFirstPageHeader = secTools.getHFSectionLinkedTo(section, HFType.FIRST_HEADER);
	            linkedSecOfFirstPageFooter = secTools.getHFSectionLinkedTo(section, HFType.FIRST_FOOTER);
	        }
	
	        // get default page header/footer section
	        linkedSecOfDefaultHeader = secTools.getHFSectionLinkedTo(section, HFType.DEFAULT_HEADER);
	        linkedSecOfDefaultFooter = secTools.getHFSectionLinkedTo(section, HFType.DEFAULT_FOOTER);
	
	        // get even header/footer section
	        if (this.isEvenPage) {
	            linkedSecOfEvenHeader = secTools.getHFSectionLinkedTo(section, HFType.EVEN_HEADER);
	            linkedSecOfEvenFooter = secTools.getHFSectionLinkedTo(section, HFType.EVEN_FOOTER);
	        }
	
	        // get right header/footer
	        var thisHeader, thisFooter;
	        if (this.isDiffFirstPage) {
	            thisHeader = linkedSecOfFirstPageHeader.firstHeader;
	            thisFooter = linkedSecOfFirstPageFooter.firstFooter;
	        } else if (this.isEvenPage) {
	            thisHeader = linkedSecOfEvenHeader.evenHeader;
	            thisFooter = linkedSecOfEvenFooter.evenFooter;
	        } else {
	            thisHeader = linkedSecOfDefaultHeader.defaultHeader;
	            thisFooter = linkedSecOfDefaultFooter.defaultFooter;
	        }
	        
	    	if (pe.scene.isNote())
	    	{
	    		thisHeader = thisFooter = null;
	    	}
	
	        // create header/footer
	        if (thisHeader) {
	            var headerModel = doc.relations.getHeaderFooterById(thisHeader);
	            if (headerModel) {
	                var headerMinH = section.getHeaderMinH();
	                var headerSpace = new Space(bodywidth, headerMinH);
	                this._header = new Header(this, headerModel, headerSpace, left);
	                this._header.layout();
	            }
	        }
	        if (thisFooter) {
	            var footerModel = doc.relations.getHeaderFooterById(thisFooter);
	            if (footerModel) {
	                var footerMinH = section.getFooterMinH();
	                var footerSpace = new Space(bodywidth, footerMinH);
	                this._footer = new Footer(this, footerModel, footerSpace, left);
	                this._footer.layout();
	            }
	
	        }
	
	        if (this._footer) {
	            if (this._header)
	                this._header._updateAnchor();
	        }
    	}
    });

    Page.prototype = {
        pageNumber: 0,
        section: null,
        _pageSize: null,
        _pageMargin: null,
        _header: null,
        _footer: null,
        _topLeftBorderDom: null,
        _topRightBorderDom: null,
        _bottomLeftBorderDom: null,
        _bottomRightBorderDom: null,
        _borderWidth: 24,
        left: 0,
        top: 0,
        offset:0,
        initTop: function() {
            var top;
            if (this._header) {
                top = Math.max(this._pageMargin.header + this._header.getHeight(), this._pageMargin.top);
            } else {
                top = this._pageMargin.top;
            }
            return top;
        },
        initHeight: function() {
            var bodyheight;
            var top =  this.initTop();
            if (this._footer) {
                bodyheight = this._pageSize.h - top - Math.max(this._footer.getHeight(), this._pageMargin.bottom);
            } else {
                bodyheight = this._pageSize.h - top - this._pageMargin.bottom;
            }
            return bodyheight;
        },
        updatePageNumber: function() {
            var previousPage = this.previous();
            if (previousPage)
                this.pageNumber = parseInt(previousPage.pageNumber) + 1;
            else
                this.pageNumber = 1;
        },
        getBottom: function() {
            return this.top + this._pageSize.h;
        },
        getWidth: function() {
            return this._pageSize.w;
        },
        getHeight: function() {
            return this._pageSize.h;
        },
        /**
         * 
         * @param body is the used height before body
         * @returns used Height
         */
       getUsedHeightBeforeBody: function(body){
            var h = 0;
            var current = this.getFirstBody();
            var currentSection = null;
            while(current && current.section && current != body){
                 if(current.getSection() != currentSection) {
                    h += current.getHeight(); 
                     currentSection = current.getSection();
                 }
                current = this.container.next(current);
            }
            return h;
        },
        isEmptySection: function(section){
            var currentBody = this.container.getFirst();
            var empty = true;
            while(currentBody && empty){
                if(currentBody.getSection() == section){
                    empty = empty && currentBody.isEmpty();
                }
                currentBody = this.container.next(currentBody);
            }
            return empty;
        },
        deleteEmptySection : function(section){
            var currentBody = this.container.getFirst();
            while(currentBody){
                var nextBody = this.container.next(currentBody);
                if(currentBody.getSection() == section){
                    this.container.remove(currentBody);
                }
                currentBody = nextBody;
            }
        },
        getBodyWidth: function() {
            return this.bodywidth;
        },
        getViewType: function() {
            return 'page.Page';
        },
        getLastBody: function() {
            return this.container.getLast();
        },
        getFirstBody: function() {
            return this.container.getFirst();
        },
        getPreviousBody: function(currentbody) {
            return this.container.prev(currentbody);
        },
        getNextBody: function(currentbody) {
            return this.container.next(currentbody);
        },
        isDeleted: function() {
            return this._deleted;
        },
        destroy: function() {
            this._deleted = true;
            this.destroyHeaderFooter();
        },
        destroyHeaderFooter: function() {
            // release header/footer
            this._header && this._header.destroy();
            this._footer && this._footer.destroy();
        },
        isEmpty: function() {
            var firstBody = this.getFirstBody();
            while (firstBody) {
                if (!firstBody.isEmpty()) {
                    return false;
                }
                firstBody = this.getNextBody(firstBody);
            }
            return true;
        },
        isFirstContent: function(view) {
            var firstBody = this.getFirstBody();
            while (firstBody) {
                if (!firstBody.textArea.isEmpty()) {
                    var firstContentView = firstBody.textArea.container.getFirst();
                    if(firstContentView.model != view.model)
                        return false;
                }
                firstBody = this.getNextBody(firstBody);
            }
            return true;
        },
        getContainer: function() {
            return this.container;
        },
        getContentLeft: function() {
            return this.left;
        },
        getContentTop: function() {
            return this.top;
        },
        addBodies: function (section, top, height) {
            if (!section)
                console.log("section could not be null");
            top =  top || this.initTop();
            height = height || this.initHeight();   
            var bodywidth = section.pageSize.w - section.pageMargin.left - section.pageMargin.right;
            var left = section.pageMargin.left;
            if (section.cols && section.getColsNum() > 1) {
                var colarray = section.cols.col;
                var defaultspace = tools.toPxValue(section.cols.space);
                bodywidth = (bodywidth - (section.getColsNum() - 1) * defaultspace) / section.getColsNum();
                var nonEqualWidth = section.cols.equalWidth == "0";
                for (var i = 0; i < section.getColsNum(); i++) {
                    var width, currentSpace;
                    if (colarray && colarray[i]) {
                        width = tools.toPxValue(colarray[i].w);
                        currentSpace = tools.toPxValue(colarray[i].space);
                    }
                    if (!nonEqualWidth || !width || width == 0) {
                        width = bodywidth;
                    }

                    if (!currentSpace || currentSpace == 0) {
                        currentSpace = defaultspace;
                    }
                    var space = new Space(width, height);
                    if (section.isRtlSection()) {
                        if (i == 0) {
                        	currentSpace = 0;
                        	left = section.pageSize.w - section.pageMargin.right - width;
                        }
                    }
                    else if (i == section.getColsNum() - 1)
                        currentSpace = 0;

                    var body = new Body(this, space, left, top, section, true, currentSpace);
                    left = section.isRtlSection() ? left - (width + currentSpace) : left + width + currentSpace;
                    this.container.append(body);
                }
            } else {
                var space = new Space(bodywidth, height);
                var body = new Body(this, space, left, top, section);
                this.container.append(body);
            }

        },
        /**
         * 
         * @param x
         * @param y
         * @returns header,footer or body
         */
        getEditorArea: function(x, y) {
            var body = this.container.getFirst();
            var nextbody = body;
            while (nextbody) {
                var anchor = nextbody.getAnchorObject(x - body.left, y - body.top);
                if (anchor && ViewTools.isTextBox(anchor))
                    return anchor;
                nextbody = this.container.next(nextbody);
            }
            nextbody = body;
            // one page may have multiple sections 
            while(nextbody && nextbody.getTop() < y){
                body = nextbody;
                nextbody = this.container.next(body);
            }
            var prevBody;
            var isRtl = (body.section.isRtlSection() && body.section.getColsNum() > 1);
            while(body && (!isRtl && body.getLeft() >= x) || (isRtl && body.getLeft() + body.domNode.offsetWidth < x)){
                prevBody = this.container.prev(body);
                if(prevBody && prevBody.section == body.section)
                    body = prevBody;
                else break;
            }
            if (!body) {
                return null;
            }
            if (pe.lotusEditor.isHeaderFooterEditing()) {
                var inHeader = false;
                if (this._header && (this._header.contentHeight + this._header.top >= y || body.top > y)) {
                    inHeader = true;
                }
                if (inHeader) {
                    //select from header
                    return this._header;
                } else if (this._footer && y > (body.top + body.getHeight())) {
                    //select from footer
                    return this._footer;
                }
            }
            return body.getEditorArea(x - body.left, y - body.top);

        },
        isPointInHeaderFooter: function(x, y) {
            var body = this.container.getFirst();
            var nextbody = body;
            while (nextbody) {
                var anchor = nextbody.getAnchorObject(x - body.left, y - body.top);
                if (anchor && ViewTools.isTextBox(anchor))
                    return null;
                nextbody = this.container.next(nextbody);
            }
            nextbody = this.container.next(body);
            while (nextbody && nextbody.left < x) {
                body = nextbody;
                nextbody = this.container.next(nextbody);
            }
            if (!body) {
                return null;
            }
            var firstBody = this.container.getFirst();
            var lastBody = this.container.getLast();
            var ret = {};
            ret.page = this;
            //the top of the page
            if (y < firstBody.top) {
                //select from header
                ret.bHeader = true;
                ret.headerfooter = this._header;
                return ret;
            } else if (y > (lastBody.top + lastBody.getHeight())) { // this bottom of the page
                //select from footer
                ret.bHeader = false;
                ret.headerfooter = this._footer;
                return ret;
            }
            return null;
        },
        getElementPath: function(x, y, path, options) {
            var body = this.container.getFirst();
            var nextbody = this.container.next(body);
            while(nextbody && nextbody.getTop() < y){
                body = nextbody;
                nextbody = this.container.next(body);
            }
            var prevBody;
            var isRtl = (body.section.isRtlSection() && body.section.getColsNum() > 1);
            while(body && (!isRtl && body.getLeft() >= x) || (isRtl && body.getLeft() + body.domNode.offsetWidth < x)){
                prevBody = this.container.prev(body);
                if(prevBody && prevBody.section == body.section)
                    body = prevBody;
                else break;
            }
            
            if (!body) {
                return null;
            }
            if (pe.lotusEditor.isHeaderFooterEditing()) {
                var inHeader = true;
                if (this._header && !this._footer)
                    inHeader = true;
                else if (!this._header && this._footer)
                    inHeader = false;
                else {
                    if (y <= this.getHeight() * 0.5)
                        inHeader = true;
                    else
                        inHeader = false;
                }

                if (inHeader) {
                    //select from header
                    return this._header.getElementPath(x - this._header.left, y - this._header.getContentTopToPage(), path, options);
                } else if (this._footer) {
                    //select from footer
                    return this._footer.getElementPath(x - this._footer.left, y - this._footer.getContentTopToPage(), path, options);
                }
                return null;
            }

            return body.getElementPath(x - body.left, y - body.top, path, options);

        },
        getHeaderType: function() {
            if (this.isDiffFirstPage)
                return HFType.FIRST_HEADER;
            else if (this.isEvenPage)
                return HFType.EVEN_HEADER;
            else
                return HFType.DEFAULT_HEADER;
        },
        getFooterType: function() {
            if (this.isDiffFirstPage)
                return HFType.FIRST_FOOTER;
            else if (this.isEvenPage)
                return HFType.EVEN_FOOTER;
            else
                return HFType.DEFAULT_FOOTER;
        },
        getHeader: function() {
            return this._header;
        },
        getFooter: function() {
            return this._footer;
        },
        getSection: function() {
            return this.section;
        },
        notifyUpdate: function(view, type) {
            if (!this.getParent().notifyUpdate) {
                console.error("notifyUpdate is need");
                return;
            }
            this.getParent().notifyUpdate(view, type);
        },

        _updatePageBorder: function() {
            if (!this._topLeftBorderDom) {
                var baseStyle = "position:absolute; z-index:-20001; width:" + this._borderWidth + "px;";
                var heightStyle = " height:" + this._borderWidth + "px;";

                var borderStyle = "1px solid #ADADAD;";
                var topBorder = "border-top:" + borderStyle;
                var leftBorder = "border-left:" + borderStyle;
                var rightBorder = "border-right:" + borderStyle;
                var bottomBorder = "border-bottom:" + borderStyle;

                var topPos = "top:" + (this._pageMargin.top - this._borderWidth) + "px;";
                var leftPos = "left:" + (this._pageMargin.left - this._borderWidth) + "px;";
                var rightPos = "left:" + (this._pageSize.w - this._pageMargin.right) + "px;";
                var bottomPos = "top:" + (this._pageSize.h - this._pageMargin.bottom) + "px;";

                var height = Math.min(this._borderWidth, this._pageMargin.bottom);
                this._topLeftBorderDom = domConstruct.create("div", {
                        "style": baseStyle + heightStyle + topPos + leftPos + rightBorder + bottomBorder
                    },
                    this.domNode);
                this._topRightBorderDom = domConstruct.create("div", {
                        "style": baseStyle + heightStyle + topPos + rightPos + leftBorder + bottomBorder
                    },
                    this.domNode);
                this._bottomLeftBorderDom = domConstruct.create("div", {
                        "style": baseStyle + "height:" + height + "px;" + leftPos + bottomPos + topBorder + rightBorder
                    },
                    this.domNode);
                this._bottomRightBorderDom = domConstruct.create("div", {
                        "style": baseStyle + "height:" + height + "px;" + rightPos + bottomPos + topBorder + leftBorder
                    },
                    this.domNode);
            }

            //		var displayTop = this._header ? "none": "";
            //		this._topLeftBorderDom.style.display = displayTop;
            //		this._topRightBorderDom.style.display = displayTop;
            //		
            //		var displayBottom = this._footer ? "none": "";
            //		this._bottomLeftBorderDom.style.display = displayBottom;
            //		this._bottomRightBorderDom.style.display = displayBottom;
        },

        // Defect 43776, IE browser's problem. 
        refreshImageDom: function() {
            if (!this.domNode)
                return;
            if (!this.domNode.firstChild) // Empty dom. It's a page frame.
                return;

            var zIndex, img;
            var imgs = this.domNode.getElementsByTagName("img");
            for (var i = 0; i < imgs.length; i++) {
                img = imgs.item(i);
                zIndex = domStyle.get(img, "zIndex");
                if (zIndex == "auto")
                    zIndex = domStyle.get(img.parentElement, "zIndex");

                if (zIndex == "auto" || isNaN(zIndex))
                    continue;

                domStyle.set(img, "zIndex", zIndex + 1);
                domStyle.set(img, "zIndex", zIndex);
            }
        },
        renderFrame: function() {
            if (has("ie") == 9)
                return null;

            var cssStyle = "left:" + this.left + "px; top:" + this.top + "px;width:" + this._pageSize.w + "px;height:" + this._pageSize.h + "px;  position: absolute;";
            if (this.domNode) {
                this.domNode.style.cssText = cssStyle;
                return;
            }

            var pageNode = domConstruct.create("div", {
                "class": "paging",
                "style": cssStyle
            });
            this.domNode = pageNode;
    		if (pe.scene.isNote())
    			this.domNode.style.height = "auto";
    		else
    			this.domNode.style.overflow = "hidden";

            return this.domNode;
        },

        //TODO: update header/footer or update page size
        render: function() {
        	var bNote = pe.scene.isNote();
            var cssStyle = "left:" + this.left + "px; top:" + this.top + "px;width:" + this._pageSize.w + "px;height:" + this._pageSize.h + "px;  position: absolute;";
            if (this.domNode) {
                //page is already there, so we update the style value
                this.domNode.style.cssText = cssStyle;

            } else {
                var pageNode = domConstruct.create("div", {
                    "class": "paging",
                    "style": cssStyle
                });
                this.domNode = pageNode;
            }
            
    		if (this._header && !this._header.domNode && !bNote)
    			this.domNode.appendChild(this._header.render());

    		if (this._footer && !this._footer.domNode && !bNote)
    			this.domNode.appendChild(this._footer.render());
    		
    		if (!bNote)
    			this._updatePageBorder();

            var param = this.container.getFirst();
            while (param) {
                if (param.isDirtyDOM() || !param.domNode) {
                    var childNode = param.render();
                    if (!childNode.parentNode || childNode.parentNode != this.domNode) {
                        this.domNode.appendChild(childNode);
                    }
                }
                param = this.container.next(param);
            }
    		if (bNote)
    			this.domNode.style.height = "auto";
    		else
    			this.domNode.style.overflow = "hidden";	

            this.updateBodyColLines();
            return this.domNode;
        },
        
        updateBodyColLines: function()
        {
            var bodies = query(".body.forColumnsNeedSep", this.domNode);
            var prevSecId = null;
            var bodiesGroup = [];
            var currentSecGroup = [];
            array.forEach(bodies, function(body){
                var secId = body.getAttribute("name");
                if (prevSecId)
                {
                    if (secId == prevSecId) 
                    {
                    }
                    else
                    {
                        currentSecGroup = [];
                        bodiesGroup.push(currentSecGroup);
                    }
                }
                else
                {
                    currentSecGroup = [];
                    bodiesGroup.push(currentSecGroup);
                }
                currentSecGroup.push(body);  
                prevSecId = secId;
            });
            
            array.forEach(bodiesGroup, function(group){
                for (var i = group.length - 1; i > 0; i --)
                {
                    var body = group[i];
                    var prevBody = group[i-1];
                    var hasContent = query(".line", body).length > 0
                    if (!hasContent)
                    {
                        var spaceNode = query(".bodylineSpace", prevBody)[0];
                        if (spaceNode)
                            spaceNode.style.display = "none";
                    }
                    else
                    {
                        break;
                    }
                }
            })
        },

        // release dom node
        releaseDom: function() {
            if (this.domNode) {
                this._header && this._header.releaseDom();
                this._footer && this._footer.releaseDom();

                var param = this.container.getFirst();
                while (param) {
                    param.releaseDom();
                    param = this.container.next(param);
                }
                this.domNode.innerHTML = "";
            }

            //		if (this.parentNode)
            //		{
            //			this.parentNode.removeChild(this.domNode);
            //			this.parentNode = null;
            //		}
            //		
            this.domNode = null;
        },

        /**
         * insertHeaderFooter, and then layout
         * @returns the header/footer view item
         */
        insertHeaderFooter: function(msgList, headerFooterID, isHeader) {
            var setting = pe.lotusEditor.setting;
            var section = this.section;
            var oldSectJson = section.toJson();
            var insertFirstPage = this.isDiffFirstPage && section.firstDifferent;
            var insertEvenPage = setting.isDiffOddEvenPages() && this.isEvenPage;
            if (insertFirstPage) {
                if (isHeader) {
                    section.firstHeader = headerFooterID;
                } else {
                    section.firstFooter = headerFooterID;
                }
            } else if (insertEvenPage) {
                if (isHeader) {
                    section.evenHeader = headerFooterID;
                } else {
                    section.evenFooter = headerFooterID;
                }

            } else {
                if (isHeader) {
                    section.defaultHeader = headerFooterID;
                } else {
                    section.defaultFooter = headerFooterID;
                }
            }
            var actPair = msgCenter.createReplaceKeyAct(section.getId(), oldSectJson, section.toJson(), constants.KEYPATH.Section);
            var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
            msgList.push(msg);
            var doc = this.parent;
            var model = doc.relations.getHeaderFooterById(headerFooterID);
            var bodywidth = this._pageSize.w - this._pageMargin.left - this._pageMargin.right;
            var left = this._pageMargin.left;
            var insert = function(currPage) {
                if (isHeader) {
                    if (currPage._header) {
                        console.log("already has a header!!!");
                        return;
                    }
                    var headerSpace = new Space(bodywidth, currPage._pageMargin.top - currPage._pageMargin.header);
                    currPage._header = new Header(currPage, model, headerSpace, left);
                    currPage._header.layout(true);
                    return currPage._header;
                } else {
                    if (currPage._footer) {
                        console.log("already has a footer!!!");
                        return;
                    }
                    var footerSpace = new Space(bodywidth, currPage._pageMargin.bottom - currPage._pageMargin.footer);
                    currPage._footer = new Footer(currPage, model, footerSpace, left);
                    currPage._footer.layout(true);
                    return currPage._footer;
                }
            };

            var processPage = function(currPage) {

                if (insertEvenPage) {
                    if (currPage.isEvenPage) {
                        //insert header or footer for this even page
                        return insert(currPage);
                    }
                } else {
                    //insert default header/footer
                    if (setting.isDiffOddEvenPages() && currPage.isEventPage || section.firstDifferent && currPage.isDiffFirstPage) {
                        //do nothing
                    } else {
                        return insert(currPage);
                    }
                }
            };


            // create header/footer from first page to last in this section
            var firstPageInSection = this;
            var pageIt = firstPageInSection;
            var docView = pe.lotusEditor.layoutEngine.rootView;
            while (pageIt) {
                firstPageInSection = pageIt;
                pageIt = docView.prePage(pageIt, true);
            }

            var ret = null;

            if (!insertFirstPage) {
                pageIt = firstPageInSection;
                while (pageIt) {
                    var newHD = processPage(pageIt);

                    if (pageIt === this)
                        ret = newHD;

                    pageIt = docView.nextPage(pageIt, true);
                }
            } else {
                ret = insert(this);
            }

            return ret;
        },
        endWithPageBreak: function() {
            var firstBody = this.getFirstBody();
            while (firstBody) {
                if (firstBody._endsWithPageBreak()) {
                    return true;
                }
                firstBody = this.getNextBody(firstBody);
            }
            return false;
        },
        updateLeftAttr: function(doc) {
        	var oldLeft = this.left;
            var scale = pe.lotusEditor.getScale();
            this.left = Math.ceil(scale * (doc.docCenter - (this._pageSize.w / 2)));
            var editorLeft = pe.scene.getEditorLeft(true);
            if (this.left + editorLeft < 0) {
                this.left = -editorLeft;
            }

            if(pe.scene.isShowNaviPanel && pe.scene.isShowNaviPanel()) {
            	var nw = pe.scene.getNaviPanelWidth && pe.scene.getNaviPanelWidth();
            	if(nw){
                	if(BidiUtils.isGuiRtl()){
                		var pw = this._pageSize.w;
                		var ml = pe.scene.editorWidth - nw - 15 - pw - editorLeft;
                		if(this.left > ml)
                			this.left = ml;
                	} else {
                    	if(this.left + editorLeft < (nw / scale)) {
                    		this.left = (nw / scale) - editorLeft;
                    	}
                	}
            	}
            }
            if(oldLeft == this.left)
            	return false;
            return true;
        }
    };
    tools.extend(Page.prototype, new AbstractView());
    return Page;
});
