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
    "dojo/_base/lang",
    "writer/common/tools",
    "writer/model/prop/NotesProperty",
    "writer/model/HFType"
], function(lang, tools, NotesProperty, HFType) {

    var Section = function(sectJSON) {
        this.init(sectJSON);
    };
    Section.prototype = {

        _clean: function() {
            this.firstDifferent = null;
            this.defaultHeader = null;
            this.defaultFooter = null;
            this.firstHeader = null;
            this.firstFooter = null;
            this.evenHeader = null;
            this.evenFooter = null;
            this.pageSize = null;
            this.pageMargin = null;
            this.cols = null;
            this.id = null;
            this.type = null;
            this.origPageSize = null;
            this.origPageMargin = null;
            this.pgNumType = null;
        },

        //get from settings
        init: function(sectJSON) {
            this._clean(); // For apply message to clean data

            if (!sectJSON)
                return;

            this.firstDifferent = sectJSON.titlePg;
            this.defaultHeader = sectJSON.dh;
            this.firstHeader = sectJSON.fh;
            this.evenHeader = sectJSON.eh;
            this.defaultFooter = sectJSON.df;
            this.firstFooter = sectJSON.ff;
            this.evenFooter = sectJSON.ef;
            this.pageSize = lang.clone(sectJSON.pgSz);
            this.pageMargin = lang.clone(sectJSON.pgMar);
            
            // store an orig value to keep the orig unit to prevent loss of accuracy.
            this.origPageSize = lang.clone(sectJSON.pgSz);
            this.origPageMargin = lang.clone(sectJSON.pgMar);
            
            this.id = sectJSON.id;
            this.type = sectJSON.type && sectJSON.type.val || null;
            this.cols = lang.clone(sectJSON.cols);
            
            // generate a default space.
            if (!this.cols)
                this.cols = {};
            if (!this.cols.space)
                this.cols.space = "36pt";
                
            this.direction = sectJSON.bidi;

            for (var x in this.pageMargin) {
                if (!this.pageMargin[x]) {
                    continue;
                }
                if (!isNaN(this.pageMargin[x])) {
                    this.pageMargin[x] = this.pageMargin[x] + "pt";
                }
                this.pageMargin[x] = Math.abs(tools.toPxValue(this.pageMargin[x]));
            }

            if (!this.pageMargin.header)
                this.pageMargin.header = 0;

            if (!this.pageMargin.footer)
                this.pageMargin.footer = 0;

            for (var x in this.pageSize) {
                if (!this.pageSize[x]) {
                    continue;
                }
                if ("orient" != x && "code" != x) {
                    if (!isNaN(this.pageSize[x]))
                        this.pageSize[x] = this.pageSize[x] + "pt";

                    this.pageSize[x] = tools.toPxValue(this.pageSize[x]);
                }
            }
            if (sectJSON.footnotePr) {
                this.footnotePr = new NotesProperty(sectJSON.footnotePr);
            }
            if (sectJSON.endnotePr) {
                this.endnotePr = new NotesProperty(sectJSON.endnotePr);
            }
            if (sectJSON.pgNumType) {
                this.pgNumType = lang.clone(sectJSON.pgNumType);
            }
        },
        isRtlSection: function () {
            return (this.direction && (!this.direction.val || (this.direction.val != "0" && this.direction.val != "lr-tb")));
        },
        getWidth: function () {
            var width = this.pageSize.w - this.pageMargin.left - this.pageMargin.right;
            if (!this.cols || this.getColsNum() <= 1 || !this.getColsNum())
                return width;
            else {
                var defaultspace = tools.toPxValue(this.cols.space);
                var colarray = this.cols.col;
                var nonEqualWidth = this.cols.equalWidth == "0";
                if (!nonEqualWidth) {
                    width = width - (this.getColsNum() - 1) * defaultspace;
                    return width;
                }
                var defaultWidth = (width - (this.getColsNum() - 1) * defaultspace) / this.getColsNum();
                width = 0;
                for (var i = 0; i < this.getColsNum(); i++) {
                    var columnWidth;
                    if (colarray && colarray[i]) {
                        columnWidth = tools.toPxValue(colarray[i].w);
                    }
                    if (!columnWidth || columnWidth == 0) {
                        columnWidth = defaultWidth;
                    }
                    width += columnWidth;
                }
            }
            return width;
        },
        //	getJSONPath: function(){
        //		return ['sects',{id:this.id}];
        //	},
        setId: function(id) {
            this.id = id;
        },
        getId: function() {
            return this.id;
        },
        setType: function (type) {
            this.type = type;
        },
        getType: function () {
            return this.type;
        },
        getHeaderFooterByType: function(hfType) {
            switch (hfType) {
                case HFType.FIRST_HEADER:
                    return this.firstHeader;
                    break;
                case HFType.FIRST_FOOTER:
                    return this.firstFooter;
                    break;
                case HFType.DEFAULT_HEADER:
                    return this.defaultHeader;
                    break;
                case HFType.DEFAULT_FOOTER:
                    return this.defaultFooter;
                    break;
                case HFType.EVEN_HEADER:
                    return this.evenHeader;
                    break;
                case HFType.EVEN_FOOTER:
                    return this.evenFooter;
                    break;
            }
        },
        setHeaderFooterByType: function(hfType, headerfooter) {
            switch (hfType) {
                case HFType.FIRST_HEADER:
                    this.firstHeader = headerfooter;
                    break;
                case HFType.FIRST_FOOTER:
                    this.firstFooter = headerfooter;
                    break;
                case HFType.DEFAULT_HEADER:
                    this.defaultHeader = headerfooter;
                    break;
                case HFType.DEFAULT_FOOTER:
                    this.defaultFooter = headerfooter;
                    break;
                case HFType.EVEN_HEADER:
                    this.evenHeader = headerfooter;
                    break;
                case HFType.EVEN_FOOTER:
                    this.evenFooter = headerfooter;
                    break;
            }
        },
        getHeaderMinH: function() {
            return this.pageMargin.top - this.pageMargin.header;
        },
        getFooterMinH: function() {
            return this.pageMargin.bottom - this.pageMargin.footer;
        },
        getEndnotePr: function() {
            return this.endnotePr;
        },
        getFootnotePr: function() {
            return this.footnotePr;
        },
        toJson: function() {
            var sectJSON = {
                "t": "sectPr"
            };
            this.firstDifferent && (sectJSON.titlePg = this.firstDifferent);
            this.direction && (sectJSON.bidi = this.direction);
            this.defaultHeader && (sectJSON.dh = this.defaultHeader);
            this.firstHeader && (sectJSON.fh = this.firstHeader);
            this.evenHeader && (sectJSON.eh = this.evenHeader);
            this.defaultFooter && (sectJSON.df = this.defaultFooter);
            this.firstFooter && (sectJSON.ff = this.firstFooter);
            this.evenFooter && (sectJSON.ef = this.evenFooter);
            sectJSON.id = this.id ? this.id : "";
            this.cols && (sectJSON.cols = lang.clone(this.cols));
            if(this.type){
                sectJSON.type = { val: this.getType() };
            }
            sectJSON.pgMar = {};
            sectJSON.pgSz = {};
            if (this.endnotePr) {
                sectJSON.endnotePr = this.endnotePr.toJson();
            }
            if (this.footnotePr) {
                sectJSON.footnotePr = this.footnotePr.toJson();
            }
            
            if (this.origPageMargin)
            	sectJSON.pgMar = lang.clone(this.origPageMargin);
            else
        	{
            	for (var x in this.pageMargin) {
                  sectJSON.pgMar[x] = tools.toPtValue(this.pageMargin[x] + 'px') + 'pt';
                }
        	}
            
            if (this.origPageSize)
            	sectJSON.pgSz = lang.clone(this.origPageSize);
            else
			{
	            for (var x in this.pageSize) {
	                if ("orient" != x && "code" != x)
	                    sectJSON.pgSz[x] = tools.toPtValue(this.pageSize[x] + 'px') + 'pt';
	                else
	                    sectJSON.pgSz[x] = this.pageSize[x];
	            }
			}
            return sectJSON;
        },
        clone: function() {
            var newSect = new Section();

            newSect.firstDifferent = lang.clone(this.firstDifferent);
            /*  note! the header/footer is only the reference of the header/footer, so it cannot be simplely copied!
            newSect.defaultHeader 	= this.defaultHeader;
            newSect.firstHeader 	= this.firstHeader;
            newSect.evenHeader 		= this.evenHeader;
            newSect.defaultFooter	= this.defaultFooter;
            newSect.firstFooter		= this.firstFooter;
            newSect.evenFooter		= this.evenFooter;
            */
            newSect.id = this.id;
            newSect.cols = lang.clone(this.cols);
            newSect.pageMargin = {};
            newSect.pageSize = {};
            newSect.type = this.type;

            if (this.origPageMargin)
            	newSect.origPageMargin = lang.clone(this.origPageMargin);
            
            if (this.origPageSize)
            	newSect.origPageSize = lang.clone(this.origPageSize);
            
            if (this.direction)
            	newSect.direction = lang.clone(this.direction);
            
            for (var x in this.pageMargin) {
                newSect.pageMargin[x] = this.pageMargin[x];
            }

            for (var x in this.pageSize) {
                newSect.pageSize[x] = this.pageSize[x];
            }
            if (this.footnotePr) {
                newSect.footnotePr = new NotesProperty(this.footnotePr.toJson());
            }
            if (this.endnotePr) {
                newSect.endnotePr = new NotesProperty(this.endnotePr.toJson());
            }

            return newSect;
        },
        setColsNum: function(num){
            // we onnly support set cols width equal 
            this.setEqualWidth(true);
            if(num == 1){
                if(this.cols)
                    delete this.cols.num;
            }
            else{
                if(this.cols)
                    this.cols.num = num.toString();
                else{
                    this.createCols();
                    //default
                    this.cols.space = "36pt";
                    this.cols.num = num.toString();
                }
            }
        },
        setEqualWidth: function(equal){
            if(equal){
                if(this.cols && this.cols.equalWidth){
                    delete this.cols.equalWidth
                }
            }
        },
        getEqualWidth: function() {
            if (this.cols && this.cols.equalWidth) {
                if (this.cols.equalWidth == "0")
                    return false;
                else return true;
            }
            return true;
        },
        getColsNum : function(){
            if(!this.cols || this.cols && !this.cols.num)
                return 1;
            return  parseInt(this.cols.num);
        },
        getColArr: function(){
            if(this.cols)
                return this.cols.col;
        },
        removeColArray: function(){
            if(this.cols) 
                delete this.cols.col ;
        },
        createCols: function(){
            this.cols = {};
        },
        setColsSep: function(hasSep)
        {
            if(this.cols){
                if (hasSep)
                    this.cols.sep = "1";  
                else
                    delete this.cols.sep;
            }else{
                if(hasSep){
                    this.createCols();
                    this.cols.sep = "1";
                }
            }
        },
        needSep: function()
        {
        	return this.cols && this.cols.sep == "1";
        },
        isContinuous: function() {     
           return this.getType() == "continuous" ;     
        },
        isHeaderFooterNull: function() {
            return !this.defaultHeader && !this.defaultFooter &&
                !this.firstHeader && !this.firstFooter &&
                !this.evenHeader && !this.evenFooter;
        },
        setHeaderFooterFromSect: function(sect) {
            this.firstDifferent = sect.firstDifferent;
            this.defaultHeader = sect.defaultHeader;
            this.defaultFooter = sect.defaultFooter;
            this.firstHeader = sect.firstHeader;
            this.firstFooter = sect.firstFooter;
            this.evenHeader = sect.evenHeader;
            this.evenFooter = sect.evenFooter;
        }
    };
    return Section;
});
