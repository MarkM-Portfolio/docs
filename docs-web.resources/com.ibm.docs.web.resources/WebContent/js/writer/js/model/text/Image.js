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
    "dojo/has",
    "dojo/_base/Color",
    "dojo/_base/lang",
    "writer/util/ModelTools",
    "writer/track/trackChange",
    "writer/model/prop/TextProperty",
    "writer/constants",
    "writer/common/tools",
    "writer/model/Model",
    "writer/model/text/Hint",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/model/text/ImageBorderType"
], function(has, dojoColor, lang, ModelTools, trackChange, TextProperty, constants, tools, Model, Hint, msgCenter, msgHelper, ImageBorderType) {

    /**
     * Sample JSON
     * {
    	"id": "imageId",
        "rt": "img",
        "style": {
            "preserve": {
                "noProof": "1"
            }
        },
        "inline": {
            "distT": "0emu",
            "distB": "0emu",
            "distL": "0emu",
            "distR": "0emu",
            "extent": {  },
            "effectExtent": {},
            "docPr": {},
            "graphicData": {
                "pic": {
                    "src": "image1.png",
                    "spPr": {
                        "xfrm": {
                            "off": {
                                "x": "0",
                                "y": "0"
                            },
                            "ext": {
                                "cx": "2926207emu",
                                "cy": "1828800emu"
                            }
                        },
                        "prstGeom": {
                            "prst": "rect",
                            "avLst": { }
                        },
                        "ln": {
                            "w": "25400emu",
                            "solidFill": {
                                "schemeClr": {
                                    "val": "tx1"
                                }
                            }
                        }
                    }
                }
            }
        },
        "s": "3",
        "l": "1"
    }, 
	
    Anchor Image:
    		{
    			"rt": "rPr",
    			"style": {
    				"preserve": {
    					
    				}
    			},
    			"anchor": {
    				"distT": "0emu",
    				"distB": "0emu",
    				"distL": "114300emu",
    				"distR": "114300emu",
    				"simplePos": "0",
    				"relativeHeight": "251659264emu",
    				"behindDoc": "1",
    				"locked": "0",
    				"layoutInCell": "1",
    				"allowOverlap": "0",
    				"simplePos": {
    					"x": "0",
    					"y": "0"
    				},
    				"positionH": {
    					"relativeFrom": "column",
    					"posOffset": "1775460emu"
    				},
    				"positionV": {
    					"relativeFrom": "paragraph",
    					"posOffset": "45085emu"
    				},
    				"extent": {
    					"cx": "1075055emu",
    					"cy": "804545emu"
    				},
    				"effectExtent": {
    					"l": "0emu",
    					"t": "0emu",
    					"r": "0emu",
    					"b": "0emu"
    				},
    				"wrapNone": {
    					
    				},
    				"docPr": {
    					"id": "3",
    					"name": "Picture 3"
    				},
    				"graphicData": {
    					"pic": {
    						"src": "Pictures/image1.jpeg",
    						"spPr": {
    							"bwMode": "auto",
    							"xfrm": {
    								"off": {
    									"x": "0",
    									"y": "0"
    								},
    								"ext": {
    									"cx": "1075055emu",
    									"cy": "804545emu"
    								}
    							},
    							"prstGeom": {
    								"prst": "rect",
    								"avLst": {
    									
    								}
    							},
    							"noFill": {
    								
    							}
    						}
    					},
    					"a": "http://schemas.openxmlformats.org/drawingml/2006/main"
    				}
    			},
    			"rt": "img",
    			"id": "id_0288010690408942",
    			"s": "0",
    			"l": "1"
    		},
     *	
     *
     *
     Picture bullet sample
     
     "pict":{
        src:"Picture/image1.gif",	// Valid attribute
        size: {width: "10pt", height: "10pt"}, // Valid attribute
        shape: {},
        shapeType:{}
     }
     *
     *
    // Image text content is \u0001
     */

    var Image = function(json, owner, simpleStruct) {
        if (!owner) {
            //console.error("The text run must have a parent!");
        }
        this.paragraph = owner ? (owner.paragraph || owner) : null;
        this.parent = owner;
        this.comment_selected = false;
        this.clist = [];
        this.deleted = false;
        var cs = pe.lotusEditor.relations.commentService;
        cs.trySetComment(this, json, owner ? false : true);
        // use Style should removed after import change attributes into style object.
        this.fromJson(json, simpleStruct);
        this.textProperty = new TextProperty(json && json.style);
    };
    Image.prototype = {
        modelType: constants.MODELTYPE.IMAGE,
        isChart: false,
        isSmartArt: false,
        isInline: false,
        distant: null,
        effectExtent: null,
        url: null,
        WRAP: {
            //before text or after text
            wrapNone: constants.MODELTYPE.FLIMAGE,
            wrapSquare: constants.MODELTYPE.SQIMAGE,
            wrapTopAndBottom: constants.MODELTYPE.TBIMAGE
                //wrapTight: ,	// todo
                //wrapThrough: ,	// todo
        },
        addViewerCallBack: function(view) {

        },
        importBorder: function(spr) {
            if (spr && spr.ln) {
                // border
                this.border = {};

                // width
                this.border.width = spr.ln.w || "0emu";
                if (!isNaN(this.border.width))
                    this.border.width += "emu";

                // border dash value
                /*
                	dash (Dash)
                	dashDot (Dash Dot)
                	dot (Dot)
                	lgDash (Large Dash)
                	lgDashDot (Large Dash Dot)
                	lgDashDotDot (Large Dash Dot Dot)
                	solid (Solid)
                	sysDash (System Dash)
                	sysDashDot (System Dash Dot)
                	sysDashDotDot (System Dash Dot Dot)
                	sysDot (System Dot)
                */
                this.border.prstDash = spr.ln.prstDash && spr.ln.prstDash.val;

                // Compound Line Type
                /*
                	dbl (Double Lines) Double lines of equal width
                	sng (Single Line) Single line: one normal width
                	thickThin (Thick Thin Double Lines) Double lines: one thick, one thin
                	thinThick (Thin Thick Double Lines) Double lines: one thin, one thick
                	tri (Thin Thick Thin Triple Lines) Three lines: thin, thick, thin
                */
                this.border.cmpd = spr.ln.cmpd;

                // noFill,,gradFill
                if (spr.ln.solidFill) {
                    var solid = spr.ln.solidFill;

                    // solidFill
                    this.border.type = ImageBorderType.SOLID;

                    // first get border color from theme
                    if (solid.schemeClr) {
                        var rel = pe.lotusEditor.relations;
                        this.border.color = solid.schemeClr.val && rel && rel.getSchemeColor(solid.schemeClr.val) || "#000000";
                        this.border.alpha = solid.schemeClr && solid.schemeClr.alpha && solid.schemeClr.alpha.val;
                    } else if (solid.srgbClr) {
                        this.border.color = solid.srgbClr;
                        this.border.alpha = solid.preserve && solid.preserve.srgbClr && solid.preserve.srgbClr.alpha && solid.preserve.srgbClr.alpha.val;
                    } else
                        this.border.color = "#000000";
                } else if (spr.ln.gradFill) {
                    // gradFill, note now treat the gradFill as solidFill
                    this.border.type = ImageBorderType.SOLID;
                    var grad = spr.ln.gradFill;
                    if (grad.gsLst && grad.gsLst.gs) {
                        if (grad.gsLst.gs.schemeClr) {
                            var rel = pe.lotusEditor.relations;
                            this.border.color = grad.gsLst.gs.schemeClr.val && rel && rel.getSchemeColor(grad.gsLst.gs.schemeClr.val) || "#000000";
                            this.border.alpha = grad.gsLst.gs.schemeClr && grad.gsLst.gs.schemeClr.alpha && grad.gsLst.gs.schemeClr.alpha.val;
                        } else if (grad.gsLst.gs.srgbClr) {
                            this.border.color = grad.gsLst.gs.srgbClr;
                            this.border.alpha = grad.gsLst.gs.preserve && grad.gsLst.gs.preserve.srgbClr && grad.gsLst.gs.preserve.srgbClr.alpha && grad.gsLst.gs.preserve.srgbClr.alpha.val;
                        } else
                            this.border.color = "#000000";
                    } else {
                        this.border.color = "#000000"
                    }
                } else {
                    // noFill
                    this.border.type = ImageBorderType.NONE;
                }

                this.borderColor = this._getBorderColor();
            }
        },
        exportBorder: function() {
            if (!this.border)
                return;

            var spr = {};
            spr.ln = {};
            spr.ln.w = this.border.width;
            spr.ln.solidFill = {};
            spr.ln.solidFill.srgbClr = this.border.color;

            return spr;
        },
        fromJson: function(json, simpleStruct) {
            if (json) {
                this.json = json; // original json

                this.offX_off = "0emu";
                this.offY_off = "0emu";
                this.extX_off = "0emu";
                this.extY_off = "0emu";
                this.rot = 0;

                this.ch = json.ch;

                /*
	    		if(json.cl&&json.cl.length>0) {
	        		this.clist = json.cl.concat();
	        		pe.lotusEditor.relations.commentService.insertCmtTextRun(this);
	        	}*/
                this.start = json.s && parseInt(json.s); // TODO remove the parseInt after conversion changed.
                this.length = 1;
                this.id = json.id || msgHelper.getUUID();
                var graphic = json.inline || json.anchor;
                if (simpleStruct) {
                    this.simpleStruct = simpleStruct;
                    this.modelType = constants.MODELTYPE.SIMPLEIMAGE;
                    this.t = json.t;
                    this.relativeHeight = json.relativeHeight;

                    this.url = this.filterExtSrc(json.src);
                    this.spProperty = json && json.spPr;
                    this.description = json && json.nvPicPr && json.nvPicPr.cNvPr && json.nvPicPr.cNvPr.descr;
                    if (this.spProperty) {
                        var xfrm = this.spProperty && this.spProperty.xfrm;

                        // position
                        this.offX = xfrm && xfrm.off && xfrm.off.x || "0emu";
                        this.offY = xfrm && xfrm.off && xfrm.off.y || "0emu";

                        // size
                        this.extX = xfrm && xfrm.ext && xfrm.ext.cx || "0emu";
                        this.extY = xfrm && xfrm.ext && xfrm.ext.cy || "0emu";

                        this.rot = xfrm && xfrm.rot ? parseFloat(xfrm.rot) : 0;
                    }
                } else if (json.pict) {
                    this.isBulletPic = true;
                    this.isInline = true;
                    this.distant = {};
                    this.distant.left = "0emu";
                    this.distant.right = "0emu";
                    this.distant.top = "0emu";
                    this.distant.bottom = "0emu";
                    this.effectExtent = {};

                    this.url = this.filterExtSrc(json.pict.src); //"Pictures/image1.gif";
                    // Predefined the default max picture bullet size is 15 px; 
                    var width = height = tools.toCmValue("15px");
                    if (json.pict.size) {
                        width = tools.toCmValue(json.pict.size.width) || width;
                        height = tools.toCmValue(json.pict.size.height) || height;
                    }
                    this.width = width + "cm";
                    this.height = height + "cm";

                    // Use it convert it back to json.
                    this._pictJson = json;
                } else if (graphic) {
                    this.isInline = (graphic == json.inline);
                    this.distant = {};
                    this.distant.left = graphic.distL || "0emu";
                    this.distant.right = graphic.distR || "0emu";
                    this.distant.top = graphic.distT || "0emu";
                    this.distant.bottom = graphic.distB || "0emu";
                    this.layoutInCell = graphic.layoutInCell;

                    this.effectExtent = {};
                    if (graphic.effectExtent) {
                        this.effectExtent.left = graphic.effectExtent.l || "0emu";
                        this.effectExtent.right = graphic.effectExtent.r || "0emu";
                        this.effectExtent.top = graphic.effectExtent.t_t || "0emu";
                        this.effectExtent.bottom = graphic.effectExtent.b || "0emu";
                    }

                    // Image size
                    this.width = graphic.extent.cx || "0emu"; // EMU unit
                    this.height = graphic.extent.cy || "0emu"; // EMU unit

                    this.noChangeAspect = graphic.cNvGraphicFramePr &&
                        graphic.cNvGraphicFramePr.graphicFrameLocks &&
                        graphic.cNvGraphicFramePr.graphicFrameLocks.noChangeAspect;

                    this.description = graphic.docPr && graphic.docPr.descr; // Image alternative text
                    this.src = graphic.docPr && graphic.docPr.hlinkClick && graphic.docPr.hlinkClick.src;

                    this.hidden = graphic.docPr && graphic.docPr.hidden;

                    if (graphic.graphicData.pic) {
                        this.url = this.filterExtSrc(graphic.graphicData.pic.src); // Image source path
                        var spr = graphic.graphicData.pic.spPr;
                        this.importBorder(spr);
                    } else if (graphic.graphicData.chart) {
                        this.isChart = true;
                        this.url = graphic.graphicData.chart.src;
                    } else if (graphic.graphicData.smartart) {
                        this.isSmartArt = true;
                        this.url = graphic.graphicData.smartart.src;
                    }
                }
                // TODO For Anchor image
                if (graphic && graphic == json.anchor) {
                    //change model type to anchor Image.
                    this.relativeHeight = graphic.relativeHeight;
                    this.behindDoc = graphic.behindDoc;

                    //all other images are square wrapped
                    this.modelType = this.WRAP.wrapSquare;
                    for (var key in this.WRAP) {
                        if (graphic[key]) {
                            this.modelType = this.WRAP[key];
                            this[key] = graphic[key];
                            break;
                        }
                    }
                    /* temp code
                     * for the wrap type cannot support wrapTight & wrapThrough, convert them to wrapSquare.
                     * todo: support wrapTight & wrapThrough.
                     */
                    if (graphic["wrapTight"])
                        this["wrapSquare"] = graphic["wrapTight"];
                    else if (graphic["wrapThrough"])
                        this["wrapSquare"] = graphic["wrapThrough"];

                    // get percentage position
                    if (graphic.AlternateContent) {
                        if (lang.isArray(graphic.AlternateContent)) {
                            for (var k = 0; k < graphic.AlternateContent.length; ++k) {
                                var choice = graphic.AlternateContent[k].Choice;
                                if (choice) {
                                    if (choice.positionH)
                                        this.pctPositionH = choice.positionH;

                                    if (choice.positionV)
                                        this.pctPositionV = choice.positionV;
                                }
                            }
                        } else {
                            var choice = graphic.AlternateContent.Choice;
                            if (choice) {
                                if (choice.positionH)
                                    this.pctPositionH = choice.positionH;

                                if (choice.positionV)
                                    this.pctPositionV = choice.positionV;
                            }
                        }
                    }

                    this.positionH = graphic.positionH;
                    this.positionV = graphic.positionV;
                    this.sizeRelH = graphic.sizeRelH;
                    this.sizeRelV = graphic.sizeRelV;
                }
            } else {
                this.start = -1;
                this.length = 1;
                this.isInline = true;

                // Image size
                this.width = "0emu"; // EMU unit
                this.height = "0emu"; // EMU unit
                this.id = msgHelper.getUUID();
            }

        },

        islayoutInCell: function() {
            return this.layoutInCell == "1";
        },

        _initSolidFill: function(sFill, solidFill) {
            if (solidFill.srgbClr) {
                sFill.color = solidFill.srgbClr;
                sFill.alpha = solidFill.preserve && solidFill.preserve.srgbClr && solidFill.preserve.srgbClr.alpha && solidFill.preserve.srgbClr.alpha.val;
            } else if (solidFill.prstClr) {
                sFill.color = solidFill.prstClr;
                sFill.alpha = solidFill.preserve && solidFill.preserve.prstClr && solidFill.preserve.prstClr.alpha && solidFill.preserve.prstClr.alpha.val;
            }

            sFill.schemeClr = {};
            sFill.schemeClr.val = solidFill.schemeClr && solidFill.schemeClr.val;
            sFill.schemeClr.alpha = solidFill.schemeClr && solidFill.schemeClr.alpha && solidFill.schemeClr.alpha.val;
        },

        _initBgSolidFillColor: function(solidFill) {
            this.solidFill = {};
            this._initSolidFill(this.solidFill, solidFill);
        },

        _initBgNoFillColor: function() {
            this.noFill = {};
        },

        _initRefSolidFill: function(fillRef) {
            this.fillRef = {};
            this._initSolidFill(this.fillRef, fillRef);
        },

        _composeCssColor: function(color, a) {
            var alpha = 1;
            if (a != null && a != undefined && !isNaN(a))
                alpha = parseInt(a, 10) / 100000;

            var color = new dojoColor(color);
            color.a = alpha;
            var cssColor = color.toCss(true);
            return cssColor;
        },

        _getBgColor: function() {
            if (this.solidFill) {
                if (this.solidFill.color) {
                    var cssColor = this._composeCssColor(this.solidFill.color, this.solidFill.alpha);
                    return cssColor;
                } else if (this.solidFill.schemeClr.val) {
                    var rel = pe.lotusEditor.relations;
                    var color = rel && rel.getSchemeColor(this.solidFill.schemeClr.val);
                    if (color) {
                        var cssColor = this._composeCssColor(color, this.solidFill.schemeClr.alpha);
                        return cssColor;
                    }
                }
            } else if (this.noFill) {
                return "rgba(1,1,1,0)";
            }

            // refFill
            if (this.fillRef) {
                if (this.fillRef.color) {
                    var cssColor = this._composeCssColor(this.fillRef.color, this.fillRef.alpha);
                    return cssColor;
                } else if (this.fillRef.schemeClr.val) {
                    var rel = pe.lotusEditor.relations;
                    var color = rel && rel.getSchemeColor(this.fillRef.schemeClr.val);
                    if (color) {
                        var cssColor = this._composeCssColor(color, this.fillRef.schemeClr.alpha);
                        return cssColor;
                    }
                }
            }

            return null;
        },

        _getBorderColor: function() {
            if (this.border.color) {
                var cssColor = this._composeCssColor(this.border.color, this.border.alpha);
                return cssColor;
            }
        },

        toJson: function(index, length) {
            if (this.isBulletPic && this._pictJson)
                return this._pictJson;

            if (this.simpleStruct) {
                var simpleJson = lang.clone(this.json);

                simpleJson.id = this.id;
                simpleJson.t = this.t;
                simpleJson.src = this.url;
                if (this.offX) {
                    simpleJson.spPr = simpleJson.spPr ? simpleJson.spPr : {};
                    simpleJson.spPr.xfrm = simpleJson.spPr.xfrm ? simpleJson.spPr.xfrm : {};
                    var xfrm = simpleJson.spPr.xfrm;
                    xfrm.off = xfrm.off ? xfrm.off : {};
                    xfrm.off.x = this.offX;
                    xfrm.off.y = this.offY;
                    xfrm.ext = xfrm.ext ? xfrm.ext : {};
                    xfrm.ext.cx = this.extX;
                    xfrm.ext.cy = this.extY;
                }
                if (this.description) {
                    simpleJson.nvPicPr = simpleJson.nvPicPr ? simpleJson.nvPicPr : {};
                    simpleJson.nvPicPr.cNvPr = simpleJson.nvPicPr.cNvPr ? simpleJson.nvPicPr.cNvPr : {};
                    simpleJson.nvPicPr.cNvPr.descr = this.description;
                }
                
                if (this.ch && this.ch.length)
                	simpleJson["ch"] = lang.clone(this.ch);
                
                if (this.rParagraph && this.rParagraph.ch && this.rParagraph != this.paragraph) {
                    // run in block group, should append ch from real paragraph
                	simpleJson["ch"] = simpleJson["ch"] ? simpleJson["ch"].concat(this.rParagraph.ch) : lange.clone(this.rParagraph.ch);
                }

                return simpleJson;
            }

            var jsonData = this.json ? lang.clone(this.json) : {};
            jsonData.style = this.textProperty.toJson();
            jsonData.rt = this.isSmartArt ? constants.RUNMODEL.SMARTART : constants.RUNMODEL.IMAGE;
            jsonData.s = "" + (index || this.start);
            jsonData.l = "" + (length || this.length);
            jsonData.id = this.id;
            if (this.ch && this.ch.length)
                jsonData["ch"] = this.ch;
            
            if (this.rParagraph && this.rParagraph.ch && this.rParagraph != this.paragraph) {
                // run in block group, should append ch from real paragraph
                jsonData["ch"] = jsonData["ch"] ? jsonData["ch"].concat(this.rParagraph.ch) : this.rParagraph.ch;
            }
            
            var graphic = null;

            if (this.isInline) {
                jsonData.inline = jsonData.inline ? jsonData.inline : {};
                graphic = jsonData.inline;
            } else {
                jsonData.anchor = jsonData.anchor ? jsonData.anchor : {};
                graphic = jsonData.anchor;
            }

            graphic.relativeHeight = this.relativeHeight;
            graphic.behindDoc = this.behindDoc;

            if (this.distant) {
                graphic.distL = this.distant.left;
                graphic.distR = this.distant.right;
                graphic.distT = this.distant.top;
                graphic.distB = this.distant.bottom;
            }
            if (this.effectExtent) {
                graphic.effectExtent = graphic.effectExtent ? graphic.effectExtent : {};
                graphic.effectExtent.l = this.effectExtent.left;
                graphic.effectExtent.r = this.effectExtent.right;
                graphic.effectExtent.t_t = this.effectExtent.top;
                graphic.effectExtent.b = this.effectExtent.bottom;
            }

            graphic.extent = graphic.extent ? graphic.extent : {};
            graphic.extent.cx = this.width;
            graphic.extent.cy = this.height;

            if (this.description) {
                graphic.docPr = graphic.docPr ? graphic.docPr : {};
                graphic.docPr.descr = this.description;
                graphic.docPr.hidden = this.hidden;
            }
            if (this.src) {
                graphic.docPr = graphic.docPr ? graphic.docPr : {};
                graphic.docPr.hlinkClick = graphic.docPr.hlinkClick || {};
                graphic.docPr.hlinkClick.src = this.src;
            }

            graphic.graphicData = graphic.graphicData ? graphic.graphicData : {};
            if (this.isChart) {
                graphic.graphicData.chart = graphic.graphicData.chart ? graphic.graphicData.chart : {};
                graphic.graphicData.chart.src = this.url;
            } else if (this.isSmartArt) {
                graphic.graphicData.smartart = graphic.graphicData.smartart ? graphic.graphicData.smartart : {};
                graphic.graphicData.smartart.src = this.url;
            } else {
                graphic.graphicData.pic = graphic.graphicData.pic ? graphic.graphicData.pic : {};
                graphic.graphicData.pic.src = this.url;
            }
            //		graphic.graphicData.pic.src = this.url.substring("Pictures/".length, this.url.length);
            if (this.noChangeAspect) {
                graphic.cNvGraphicFramePr = graphic.cNvGraphicFramePr ? graphic.cNvGraphicFramePr : {};
                graphic.cNvGraphicFramePr.graphicFrameLocks = graphic.cNvGraphicFramePr.graphicFrameLocks ? graphic.cNvGraphicFramePr.graphicFrameLocks : {};
                graphic.cNvGraphicFramePr.graphicFrameLocks.noChangeAspect = this.noChangeAspect;
            }

            //if(this.border)
            //{
            //	graphic.graphicData.pic.spPr = this.exportBorder();
            //}

            delete graphic["wrapTight"];
            delete graphic["wrapThrough"];
            for (key in this.WRAP) {
                if (this[key])
                    graphic[key] = this[key];
            }

            if (this.positionH) graphic.positionH = this.positionH;
            if (this.positionV) graphic.positionV = this.positionV;

            if (this.clist && this.clist.length > 0) {
                jsonData.cl = [];
                jsonData.cl = this.clist.concat();
            }
            return jsonData;
        },
        equalStyle: function(destProp) {
            return false;
        },
        getPctPositionH: function() {
            if (!this.pctPositionH || !this.pctPositionH.pctPosHOffset || !this.pctPositionH.pctPosHOffset.ele_text)
                return -1;

            var pct = parseInt(this.pctPositionH.pctPosHOffset.ele_text);
            if (pct < 0)
                return -1;

            return (pct / 100000);
        },
        getPctPositionV: function() {
            if (!this.pctPositionV || !this.pctPositionV.pctPosVOffset || !this.pctPositionV.pctPosVOffset.ele_text)
                return -1;

            var pct = parseInt(this.pctPositionV.pctPosVOffset.ele_text);
            if (pct < 0)
                return -1;

            return (pct / 100000);
        },
        /**
         * Move the property
         * @param index
         * @param len
         */
        move: function(index, len, container) {
            if (this.start >= index)
                this.start += len;
        },
        /**
         * Remove the property from the index with length
         * @param index
         * @param len
         */
        removeTextLength: function(index, len, container) {
            var inTrack = trackChange.isOn() && ModelTools.isTrackable(this);
            if (this.start >= index) {
                var delta = index + len - this.start;

                if (delta > 0) {
                    if (!inTrack) {
                        container.remove(this);
                        this.deleted = true;
                        if (this.modelType != constants.MODELTYPE.IMAGE)
                            this.paragraph.AnchorObjCount -= 1;
                    } else {
                        return this.markDeleteChange();
                    }
                } else {
                    if (!inTrack) {
                        this.start -= len;
                        this.markDirty();
                    }
                }
            }
        },

        mark: function(tag) {
            if (tag == "inserted")
                delete this.deleted;
            this[tag] = true;
        },
        markDirty: function() {
            this.dirty = true;
        },
        markInsert: function() {
            delete this.deleted;
            this.inserted = true;
        },
        markDelete: function() {
            this.deleted = true;
        },
        /**
         * return the split right part
         * @param idx
         * @param len
         * @returns
         */
        split: function(idx, len) {
            if (idx == this.start)
                return this;
            else
                return null;
        },
        setStyle: function(styleDef, bRemove) {
            this.textProperty.setStyle(styleDef, bRemove);
            this.markDirty();
        },
        getCSSStyle: function() {
            var str = "";
            var cs = pe.lotusEditor.relations.commentService;
            str += cs.getCSSString(this.clist, true);
            return str;
        },
        createRun: function(reset) {
            if (!this.paragraph)
                return null;
            if (this.modelType.toLowerCase().indexOf('image') == -1)
                this.paragraph.AnchorObjCount += 1;
            return this;
        },

        setDescription: function(desc) {
            this.description = desc;
        },

        // set size
        setSize: function(newSz) {
            this.width = newSz.cx;
            this.height = newSz.cy;

            // update
            this.updateAll();
        },

        // set wrap text
        setWrapText: function(wrapText) {
            if (this.wrapSquare) {
                this.wrapSquare.wrapText = wrapText;

                // update view
                var views = this.getRelativeViews("rootView");
                var view = views && views.getFirst();
                if (view)
                    view._resizeUpdate();
            } else
                console.log('warning!set wrap text error, model.wrapSquare not exist.');
        },

        // set wrap type
        _setWrapType: function(wrapType, wrapText, behindDoc) {
            // set model type
            this.modelType = this.WRAP[wrapType];

            for (var key in this.WRAP) {
                // set wrap
                if (key == wrapType) {
                    if (!this[key])
                        this[key] = {};
                } else {
                    if (this[key])
                        delete this[key];
                }
            }

            // set square image wrap text
            if ("wrapSquare" == wrapType) {
                this.wrapSquare = {};
                this.wrapSquare.wrapText = wrapText;
            }

            // set float image behindDoc
            if ("wrapNone" == wrapType) {
                this.behindDoc = behindDoc;
            }
        },
        updateAll: function() {
            this.broadcast("releaseBodySpace");
            this.markDirty();
            var paragraph = ModelTools.getParagraph(this);
            if (paragraph) {
                paragraph.markDirty();
                paragraph.parent.update();
            }
        },
        setInline: function(inline) {
            // release body space
            this.broadcast("releaseBodySpace");

            // modify model
            this.modelType = constants.MODELTYPE.IMAGE;
            this.isInline = true;

            // update view
            this.updateAll();
        },
        setAnchor: function(anchor) {
            this.isInline = false;

            var wrapType, wrapText = null;

            for (var key in this.WRAP)
                if (anchor[key])
                    wrapType = key;

            wrapText = anchor["wrapSquare"] && anchor["wrapSquare"].wrapText;

            this._setWrapType(wrapType, wrapText, anchor.behindDoc);

            this.positionH = {};
            this.positionH.relativeFrom = anchor.positionH.relativeFrom;
            this.positionH.posOffset = anchor.positionH.posOffset;
            this.positionH.align = anchor.positionH.align;
            this.positionV = {};
            this.positionV.relativeFrom = anchor.positionV.relativeFrom;
            this.positionV.posOffset = anchor.positionV.posOffset;
            this.positionV.align = anchor.positionV.align;

            // update view
            this.updateAll();
        },
        setAnchorWrapType: function(newWrap) {
            // release body space
            this.broadcast("releaseBodySpace");

            var wrapType, wrapText = null;

            for (var key in this.WRAP)
                if (newWrap[key])
                    wrapType = key;

            wrapText = newWrap["wrapSquare"] && newWrap["wrapSquare"].wrapText;

            this._setWrapType(wrapType, wrapText, newWrap.behindDoc);

            // update view
            this.updateAll();
        },

       setUrl: function(src) {
            this.url = src;
            // update
            this.updateAll();
       },

        // change anchor to inline
        changeAnchorToInline: function() {
            if (this.isInline)
                return;

            // release body space
            this.broadcast("releaseBodySpace");

            var jsonOld = {
                "anchor": this.toJson().anchor
            };

            // modify model
            this.modelType = constants.MODELTYPE.IMAGE;
            this.isInline = true;

            // update view
            this.updateAll();

            var jsonNew = {
                "inline": this.toJson().inline
            };

            // send msg
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                'transform': jsonNew
            }, {
                'transform': jsonOld
            })]);
            msgCenter.sendMessage([msg]);
        },

        changeUrl: function(src) {
            this.setUrl(src);
            // send msg
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                'url': src
            }, {
                'url': this.url
            })]);
            pe.lotusEditor.undoManager.ignoreUndo(true);
            msgCenter.sendMessage([msg]);
            pe.lotusEditor.undoManager.ignoreUndo(false);
        },

        // change inline to anchor
        changeInlineToAnchor: function(wrapType, wrapText, behindDoc) {
            if (!this.isInline)
                return;

            var jsonOld = {
                "inline": this.toJson().inline
            };

            // modify model
            this.isInline = false;

            this._setWrapType(wrapType, wrapText, behindDoc);

            var hOffset = 0;
            var vOffset = 0;

            var views = this.getRelativeViews("rootView");
            var view = views && views.getFirst();
            if (view) {
                var offset = view.getOffsetToPara();
                hOffset = offset.x;
                vOffset = offset.y;
            }

            this.positionH = {};
            this.positionH.relativeFrom = "column";
            this.positionH.posOffset = tools.PxToCm(hOffset) + "cm";
            this.positionV = {};
            this.positionV.relativeFrom = "paragraph";
            this.positionV.posOffset = tools.PxToCm(vOffset) + "cm";

            // update view
            this.updateAll();

            var jsonNew = {
                "anchor": this.toJson().anchor
            };

            // send msg
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                'transform': jsonNew
            }, {
                'transform': jsonOld
            })]);
            msgCenter.sendMessage([msg]);
        },

        // change anchor wrap type
        changeAnchorWraptype: function(wrapType, wrapText, behindDoc) {
            if (this.isInline)
                return;

            // release body space
            this.broadcast("releaseBodySpace");

            var oldWrap = {};
            for (var key in this.WRAP) {
                if (this[key])
                    oldWrap[key] = this[key];
            }
            oldWrap.behindDoc = this.behindDoc;

            // modify model
            this._setWrapType(wrapType, wrapText, behindDoc);

            // update view
            this.updateAll();

            var newWrap = {};
            for (var key in this.WRAP) {
                if (this[key])
                    newWrap[key] = this[key];
            }
            newWrap.behindDoc = this.behindDoc;

            // send msg
            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this, null, null, {
                'wrapType': newWrap
            }, {
                'wrapType': oldWrap
            })]);
            msgCenter.sendMessage([msg]);
        },
        getStyleId: function() {
            return null;
        },
        getCh: function() {
            if (!has("trackGroup"))
                return Model.prototype.getCh.apply(this);
            if (!this.rParagraph || !this.rParagraph.ch || this.rParagraph.ch.length == 0)
                return this.ch;
            var realCh = this.ch || [];
            realCh = realCh.concat(this.rParagraph.ch);
            return realCh;
        },
        filterExtSrc: function(src) {
        	if(pe.lotusEditor.document && src && src.match(/^https?:\/\//)) {
        		var unProssedExtUrl = pe.lotusEditor.document.unProssedExtUrl;
        		var extUri = tools.base64EncodeUri(src);
//        		console.log("extUri: " + extUri + " " + src);
        		if(unProssedExtUrl){
        			for(var key in unProssedExtUrl) {
        				if(key == extUri){
        					curUrl = unProssedExtUrl[key];
        					if(curUrl.status == "complete")
        						src = curUrl.newSrc;
        					else if (curUrl.status == "loading")
        						curUrl.img = this;
//        					console.log("unProssedExtUrl: " + key + " " + src);
        					break;
        				}
//        				console.log("unProssedExtUrl: " + key);
        			}
        		}
        	}
        	return src;
        }
    };

    tools.extend(Image.prototype, new Model());
    tools.extend(Image.prototype, new Hint());
    return Image;
});
