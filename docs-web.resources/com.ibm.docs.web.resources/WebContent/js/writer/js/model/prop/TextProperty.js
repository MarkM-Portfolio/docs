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
    "writer/model/Model",
    "writer/model/prop/Property",
    "writer/util/FontTools"
], function(lang, tools, Model, Property, FontTools) {

    var preserveObj = "preserve";

    var TextProperty = function(json, options) {
        // Use this attribute to record back up attribute before normalize. So that it's easy to return it from this attribute.
        // Also use to do merge.
    	if(options) {
    		if(options.fromStyles)
    			this.keepAllFonts = true;
    		else if(options.txtUnType){
    			this.txtUnType = options.txtUnType;
    			this.owner = options.owner;
    		}
    	}

        if (json) {
            if (json[preserveObj]) {
                this.preserve = json[preserveObj];
                delete json[preserveObj];
            }
            this.fromJson(json);
        } else {
            this._decoration = {};
            this.style = {};
            if (!this.keepAllFonts) {
            	var mFonts = this.getMergedRFonts();
            	if(mFonts)
            		this._updateFontFamily(mFonts);
            }
        }
    };

    TextProperty.prototype = {
        /**
         * Compare the font priority which defined in rFonts
         * Font priority is ascii > HAnsi > eastAsia > cs
         */
        _fontPriority: {
            "ascii": 0,
            "hAnsi": 1,
            "eastAsia": 2,
            "cs": 3
        },
        _fontTypes: ["ascii","hAnsi","eastAsia","cs"],
        _textDeco: "text-decoration",

        fromJson: function(json) {
            this.style = json;

            //add style Id 
            this.styleId = json.styleId;
            this._decoration = {};
            delete json.styleId;
            this._normalize();
        },

        // a font name maybe an array "Simsun,宋体", now we only get the first.
        _getFirstFontname: function(fontName) {
            if (!fontName)
                return fontName;

            if ((typeof fontName) == "string")
                return fontName.split(',')[0];
            else
                return fontName;
        },

        _reOrderFonts: function(rFonts){
        	var nFonts = [];
        	if(this.isCs) {
        		nFonts.push("cs");
        		return nFonts;
        	}
        	
        	if(this.txtUnType == "ascii") {
        		var fth = this.txtUnType + "Theme";
        		var ff = ((rFonts[fth] || rFonts[this.txtUnType])? this.txtUnType : "");
        		if(ff) {
        			nFonts.push(ff);
            		return nFonts;
        		}
        	}

        	var fHint = rFonts.hint;
        	if(fHint) {
        		if(fHint == "default")
        			fHint = "hAnsi";
        		nFonts.push("hint");
        	} else if(this.txtUnType) {
        		var fth = this.txtUnType + "Theme";
        		var ff = ((rFonts[fth] || rFonts[this.txtUnType])? this.txtUnType : "");
        		if(ff){
        			nFonts.push(ff);
        			return nFonts;        			
        		}
        	}

        	for(var i=0;i<this._fontTypes.length;i++){
        		var f = this._fontTypes[i];
        		var fth = f + ((f=="cs")?"theme":"Theme");
        		var ff = ((rFonts[fth] || rFonts[f])? f : "");
        		if(ff){
            		if(fHint && fHint == f){
            			nFonts.shift();
            			nFonts.unshift(ff);
            		} else {
            			nFonts.push(ff);
            		}        			
        		}
        	}

        	return nFonts;
        },

        _updateFontFamily: function(rFonts) {
        	if (!rFonts)
        	{
        		delete this.style["font-family"];
        		return;
        	}

            var font = this._extractFont(rFonts);
            if (font)
                this.style["font-family"] = FontTools.normalizeFontName(font);
            else
                delete this.style["font-family"];
        },

        _getFontFamily: function(refStyle) {
        	if(refStyle["font-family"])
        		return refStyle["font-family"];
        	if (!refStyle.rFonts)
        		return;

        	var font = this._extractFont(refStyle.rFonts);
            return (font ? FontTools.normalizeFontName(font) : null);
        },

        _extractFont: function(rFonts) {
        	var oFontNames = this._reOrderFonts(rFonts);
            var hint = (oFontNames.indexOf("hint") == 0) && rFonts.hint;
            if(hint == "default")
            	hint = "hAnsi";
            var font = this._getFirstFontname(hint);
            if (!font) {
            	font = this.getFontByHint(rFonts, "", oFontNames);
            } else if(this._fontTypes.indexOf(hint)>=0) {
            	font = this.getFontByHint(rFonts, hint);
            	if(!font && !(this.owner && this.owner.isNumDef)) {
            		var pStyle = this.owner && this.owner.getMergedTextProperty && this.owner.getMergedTextProperty();
            		font = pStyle && (pStyle != "empty" )&& pStyle.getFontByHint("", hint);
            		if(!font){
                        var docDStyle = pe.lotusEditor.styles && pe.lotusEditor.styles.getDocDefaultStyle();
                        font = docDStyle && docDStyle._textProperty 
                        		&& docDStyle._textProperty.getFontByHint("", hint);	
            		}
            	}
            }
        	return font;
        },

        _updateFont: function(rFonts) {
        	if (rFonts)
        	{
	        	for(var key in rFonts){
	        		rFonts[key] = this._getFirstFontname(rFonts[key]);
	        	}
	        	this.style.rFonts = rFonts;
        	}
        	this._updateFontFamily(rFonts);
        },

        _normalize: function() {
        	var isCs = (this.preserve && this.preserve.cs);
        	if(isCs) {
        		if(isCs.val == undefined)
        			this.isCs = true;
        		else if (isCs.val == "1" || isCs.val == "true" || isCs.val == "on")
        			this.isCs = true;
        		delete this.preserve.cs;
        	}

            var s = this.style;
            // Underline
            if (s.u) {
                if (s.u.val && s.u.val != "none")
                    s[this._textDeco] = "underline";
                this._decoration.u = s.u;
                delete s.u;
            }

            // Line through
            var bStrike = false;
            if (s.strike) {
                if (s.strike != "-1") {
                    bStrike = true;
                    if (s[this._textDeco])
                        s[this._textDeco] += " line-through";
                    else
                        s[this._textDeco] = "line-through";
                }
                this._decoration.strike = s.strike;
                delete s.strike;
            }
            if (s.dstrike && !bStrike) {
                // Treat the dstrike as strike
                if (s.dstrike != "-1") {
                    if (s[this._textDeco])
                        s[this._textDeco] += " line-through";
                    else
                        s[this._textDeco] = "line-through";
                }
                this._decoration.strike = s.dstrike;
                delete s.dstrike;
            }

            // Font family
            if (!this.keepAllFonts) {
            	if(!(!s.rFonts && s["font-family"])){
                	var mFonts = this.getMergedRFonts(s.rFonts);
                	if(mFonts)
                		this._updateFontFamily(mFonts);
            	}
           		if(s.rFonts && !(this.owner && this.owner.isNumDef))
           			delete s.rFonts;
            }

            // Spell check and Grammar language
            if (s.lang)
                delete s.lang;

            // Text shading
            if (s.shd) {
                if (!s["background-color"]) //highlight : background-color
                {
                    if (s.shd.fill == "FFFFFF" && s.shd.val == "pct15") //character shading, only have one style,to color:D9D9D9
                        this.style["background-color"] = "#D9D9D9";
                    else //shading
                        this.style["background-color"] = "#" + s.shd.fill;
                }
                delete s.shd;
            }

            // Text border
            if (s.bdr) {
                this.border = s.bdr;
                delete s.bdr;
            }
        },

        /**
         * Only clone the real HTML style
         */
        _cloneStyle: function() {
            var jsonData = {};
            var s = this.style;
            for (var name in s)
                jsonData[name] = s[name];

            if (this.styleId)
                jsonData.styleId = this.styleId;

            if (this.border)
                jsonData.bdr = lang.clone(this.border);
            return jsonData;
        },

        /**
         * Return the original JSON data.
         * @returns {___jsonData0}
         */
        toJson: function() {
            var jsonData = this._cloneStyle();

            for (var k in this._decoration)
                jsonData[k] = this._decoration[k];

            var kf = "font-family";
            if (jsonData[kf] && !jsonData.rFonts) {
            	var fn = this._getFirstFontname(jsonData[kf]);
                jsonData.rFonts = {
                    "ascii": fn,
                    "hAnsi": fn,
                    "eastAsia": fn
                };
            }
            delete jsonData[kf];

            delete jsonData[this._textDeco];
            if (tools.isEmpty(jsonData)) {
                return undefined;
            }
            return jsonData;
        },

        clone: function(newTxtOps) {
            //return dojo.clone(this);
            //var j = dojo.clone(this.style);	// Replace dojo.clone for Performance reason
            return new TextProperty(this.toJson(), (newTxtOps || {"fromStyles":true}));
        },

        getStyleId: function() {
            return this.styleId;
        },
        getBorder: function() {
            return this.border;
        },

        equalStyle: function(destProp) {
            if (!destProp || this.type != destProp.type)
                return false;

            var srcStyle = this.style,
                destStyle = destProp.style;
            for (var item in srcStyle) {
                if (item != preserveObj && srcStyle[item] != destStyle[item])
                    return false;
            }
            for (var item in destStyle) {
                if (item != preserveObj && srcStyle[item] != destStyle[item])
                    return false;
            }

            if (this.styleId != destProp.styleId)
                return false;

            return true;
        },
        _updateDecoration: function() {
            var s = this.style;
            delete s[this._textDeco];

            var dec = this._decoration;
            if (dec.u) {
                if (dec.u.val != "none")
                    s[this._textDeco] = "underline";
            }

            if (dec.strike) {
                if (dec.strike != "-1") {
                    if (s[this._textDeco])
                        s[this._textDeco] += " line-through";
                    else
                        s[this._textDeco] = "line-through";
                }
            }
        },

        setStyle: function(styleDef, bRemove) {
            for (var key in styleDef) {
                if (bRemove) {
                    if (key === "strike") {
                        this._decoration.strike = styleDef["strike"];
                        this._updateDecoration();
                    } else if (key === "u") {
                    	delete this.style[this._textDeco];
                        this._decoration.u = {"val":"none"};
                        this._updateDecoration();
                    } else if (key === "font-weight")
                        this.style[key] = "normal";
                    else if (key === "font-style")
                        this.style[key] = "normal";
                    else if (key == "rFonts")
                        delete this.style["font-family"];
                    else if (key == "vertical-align")
                    	this.style[key] = "baseline";
                    else
                        delete this.style[key];
                } else {
                    if (key === "bdr") {
                        if (this.border)
                            this.border = null;
                        else {
                            this.border = styleDef[key];
                            this.style['bdr'] = styleDef[key];
                        }
                    } else if (key === "u") {
                        this._decoration.u = styleDef["u"];
                        this._updateDecoration();
                    } else if (key === "strike") {
                        this._decoration.strike = styleDef["strike"];
                        this._updateDecoration();
                    } else if (key == "rFonts") {
                        this._updateFont(styleDef[key]);
                    } else
                        this.style[key] = styleDef[key];
                }
            }
            //this.style[styleName] = value;
        },
        /**
         * background color
         * @returns
         */
        getBackgroundColor: function() {
            return this.style["background-color"];
        },
        getStyle: function(type) {
            var retStyle = this._cloneStyle();
            if (this.styleId) {
                var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                if (refStyle) {
                    refStyle.addReferer(this);
                    var des = refStyle.getMergedTextProperty();
                    if (des && des != "empty") {
                        if (!this._decoration.strike && des._decoration.strike)
                            this._decoration.strike = des._decoration.strike;
                        var desStyle = des.getStyle();
                        if(type && type == "TOC")
                        {
                        	if(desStyle["color"])
                        		delete desStyle.color;
                        	if(desStyle[this._textDeco])
                        		delete desStyle[this._textDeco];                 	
                        }
                        this._mergeStyle(desStyle, retStyle, this);
                    }
                }
            }

            return retStyle;
        },

        /**
         * Only use it to create message
         */
        getUnderline: function() {
            var underline = {};
            underline["u"] = this._decoration.u || "";
            return underline;
        },

        /**
         * Only use it to create message
         */
        getStrike: function() {
            var strike = {};
            strike["strike"] = this._decoration.strike || "";
            return strike;
        },

        /**
         * Only use it to create message
         */
        getJsonRFonts: function() {
            var font = {};
            font.rFonts = this.getRFonts();
            if(!font.rFonts) {
            	var ff = this.style["font-family"];
	            font.rFonts = {
		                "ascii": ff,
		                "hAnsi": ff,
		                "eastAsia": ff
		            };
            }
            return font;
        },

        getRFonts: function() {
        	return this.style && this.style.rFonts;
        },

        getFontByHint: function(rFonts, hint, fallbk){
        	if(!hint && !fallbk) return "";
        	if(fallbk && fallbk.length==0)
        		return "";
        	if(!rFonts)
        		rFonts =  this.getRFonts();

            var type = this._getFirstFontname(hint);
            var fLst = fallbk || [type];
            var font = "";
            if(rFonts){
            	for(var i=0; i<fLst.length;i++){
            		var fName = fLst[i];
            		var fTheme = fName + ((fName == "cs")? "theme" : "Theme");
            		var themeFont = rFonts[fTheme];
            		if(themeFont){
                        var rel = pe.lotusEditor.relations;
                        var theme = rel && rel.getTheme();
                        if(hint)
                        	font = theme && theme.getThemeFontByHint(themeFont, fName);
                        else
                        	font = theme && theme.getThemeFont(themeFont);
            		} else if (rFonts[fName]) {
            			font = this._getFirstFontname(rFonts[fName]);
            		}

            		if(font)
            			break;
            	}
            }
            return font;
        },

        getComputedStyle: function(parentTextProp) {
            var retStyle = this.getStyle();
            if (parentTextProp && parentTextProp != "empty")
                this._mergeStyle(parentTextProp.getStyle(), retStyle, this);

            if(!retStyle["font-family"] && retStyle.rFonts){
            	var font = this._getFontFamily(retStyle);
            	font && (retStyle["font-family"] = font);
            }

            var docDStyle = pe.lotusEditor.styles.getDocDefaultStyle();
            if(docDStyle && docDStyle._textProperty) {
            	if(!retStyle["font-family"])
            		retStyle["font-family"] = docDStyle._textProperty.getFontByHint("", this.txtUnType || "ascii");
            	this._mergeStyle(docDStyle._textProperty.getStyle(), retStyle);
            	delete retStyle.rFonts;
            }
            return retStyle;
        },

        /**
         * Merge srcStyle style into destStyle
         * @param srcStyle Source style
         * @param destStyle Destination style
         * @param destTextProperty The destination text property object. Use it merge underline and line-through attribute
         * @return destStyle
         */
        _mergeStyle: function(srcStyle, destStyle, destTextProperty) {
            var destVal;
            for (var item in srcStyle) {
                destVal = destStyle[item] || "";
                if (item == "rFonts" && srcStyle[item]){
                	destStyle[item] = this.getMergedRFonts((destStyle[item] || {}), srcStyle[item] );
                } else if (item == "text-decoration") {
                    var srcVal = srcStyle[item];
                    if (destVal != srcVal) {
                        // Destination include source.
                        if (destVal.indexOf(srcVal) != -1)
                            continue;

                        if (srcVal.indexOf(destVal) != -1)
                            destVal = srcVal;
                        else
                            destVal += (destVal.length > 0 ? " " : "") + srcVal;

                        var cleaned = false;
                        if (destTextProperty && destTextProperty._decoration.u && destTextProperty._decoration.u.val == "none") {
                            destVal = destVal.replace(/underline/g, "");
                            cleaned = true;
                        }

                        if (destTextProperty && destTextProperty._decoration.strike == "-1") {
                            destVal = destVal.replace(/line-through/g, "");
                            cleaned = true;
                        }

                        cleaned && (destVal = destVal.replace(/ /g, ""));
                        destStyle[item] = destVal;
                    }
                } else if (destVal == undefined || destVal == "")
                    destStyle[item] = srcStyle[item];
            }

            return destStyle;
        },
        
        getMergedRFonts: function(rFonts, parentRFonts) {
        	var ret = rFonts || {};
        	if(!parentRFonts) {
            	var ownerStyle = this.owner && this.owner.getMergedTextProperty && this.owner.getMergedTextProperty();
            	parentRFonts = ownerStyle && ownerStyle.style && ownerStyle.style.rFonts;
        	}
        	var mKeys = [];
        	if(parentRFonts) {
        		for(var key in parentRFonts) {
    				if(!ret[key]){
    					var idx = key.toLocaleLowerCase().indexOf("theme");
    					if(idx>0){
    						if(!ret[key.substr(0, idx)])
    							mKeys.push(key);
    					} else if (!(ret[key+"Theme"] || ret[key+"theme"]))
    						mKeys.push(key);
    				}
    			}

        		for(var i=0;i<mKeys.length;i++){
        			var key = mKeys[i];
        			ret[key] = parentRFonts[key];
        		}
        	}
        	return ret;
        },

        /**
         * Merge current object to the destination text property object.
         * @param destProp
         * @param needClone
         * @returns
         */
        merge: function(destProp, needClone, newTxtOps) {
        	if(newTxtOps && !newTxtOps.txtUnType) {
        		newTxtOps = {};
        		newTxtOps.txtUnType = destProp.txtUnType;
        		newTxtOps.owner = destProp.owner;
        	}
            destProp = needClone ? destProp.clone(newTxtOps) : (destProp || this.clone());
            var srcStyle = this.styleId ? this.getStyle() : this.style;
            this._mergeStyle(srcStyle, destProp.style, destProp);
            return destProp;
        },

        filterStyle: function(styleDef, parentTextProp) {
        	var pStyle = parentTextProp && (parentTextProp != "empty") && parentTextProp.getStyle();
            for (var key in styleDef) {
            	var val = this.style[key];
            	var pVal = pStyle[key];
                if (key === "vertical-align" && val == pVal)
                	 this.style[key] = "";
            }
        },

        clearInlineStyle: function() {
            this.style = {};
            if(this.preserve)
            	delete this.preserve;
        },
        clear: function() {
            this.style = {};
            this.styleId = null;
        }
    };
    tools.extend(TextProperty.prototype, new Model());

    return TextProperty;
});
