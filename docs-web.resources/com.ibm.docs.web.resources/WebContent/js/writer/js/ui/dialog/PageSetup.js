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
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/_base/declare",
    "dojo/data/ItemFileReadStore",
    "dojo/dom",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/i18n!writer/ui/dialog/nls/PageSetup",
    "dojo/number",
    "dojo/on",
    "dojo/query",
    "dijit/Dialog",
    "dijit/Tooltip",
    "dijit/form/ComboBox",
    "concord/util/BidiUtils",
    "concord/util/unit",
    "writer/common/tools",
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/util/ViewTools",
    "dijit/_base/wai"
], function(domConstruct, lang, windowModule, declare, ItemFileReadStore, dom, domAttr, domClass, domStyle, i18nPageSetup, number, on, query, Dialog, Tooltip, ComboBox, BidiUtilsModule, unitModule, tools, constants, msgCenter, ViewTools, wai) {

	// FIXME BOB, concordDialog
    var PageSetup = declare("writer.ui.dialog.PageSetup", concord.widgets.concordDialog, {
        sizeNamesArray: null,
        sizeHeightArray: null,
        sizeWidthArray: null,
        defaultMargin: null,

        sizeCombox: null,

        PAGE_MODE1: true,
        PAGE_MODE2: false,
        CURRENT_PAGE_MODE: true,
        metric: true,
        unit: null,
        allowedUnit: null,

        PORTRAIT_MODE: true,
        LANDSCAPE_MODE: false,
        CURRENT_MODE: true,

        SIZE_COUNT: 26,
        sizeList: null,
        nls: null,

        tooltip_id: null,
        locale: null,
        ID: {
            //0: height
            //1: width
            //2: top
            //3: bottom
            //4: left
            //5: right
            h: 0,
            w: 1,
            t: 2,
            b: 3,
            l: 4,
            r: 5
        },
        cur_value: new Array(),



        constructor: function() {},

        _cur_section: null,

        setDialogID: function() {
            // Overridden
            this.dialogId = "D_d_PageSetup";
            this.portraitRadioID = "D_d_Portrait";
            this.landscapeRadioID = "D_d_Landscape";
            this.sizeComboxID = "D_d_PageSetSize";
            this.heightFieldID = "D_d_PageSetHeight";
            this.widthFieldID = "D_d_PageSetWidth";

            this.topFieldID = "D_d_PageSetTop";
            this.bottomFieldID = "D_d_PageSetBottom";
            this.leftFieldID = "D_d_PageSetLeft";
            this.rightFieldID = "D_d_PageSetRight";
            return;
        },
        calcWidth: function() {
            return "480px";
        },
        loadLocalArrays: function() {
            this.sizeNamesArray = new Array("A3", "A4", "A5", "B4 (ISO)", "B5 (ISO)",
                "B6 (ISO)", "B4 (JIS)", "B5 (JIS)", "B6 (JIS)",
                this.nls.LETTER, this.nls.LEGAL, this.nls.TABLOID,
                "C4", "C5", "C6", "C6/5", "DL", this.nls.SIZE1, this.nls.SIZE2,
                this.nls.SIZE3, this.nls.SIZE4, this.nls.SIZE5, this.nls.SIZE6,
                this.nls.SIZE7, this.nls.SIZE8, this.nls.SIZE9);
            this.sizeWidthArray = new Array("29.70", "21.00", "14.80", "25.00", "17.60",
                "12.50", "25.70", "18.20", "12.80", "21.59",
                "21.59", "27.96", "22.90", "16.20",
                "11.40", "11.40", "11.00", "9.21", "9.84",
                "9.84", "10.48", "11.43", "12.07", "18.40",
                "13.00", "14.00");
            this.sizeHeightArray = new Array("42.00", "29.70", "21.00", "35.30",
                "25.00", "17.60", "36.40", "25.70",
                "18.20", "27.94", "35.57", "43.13",
                "32.40", "22.90", "16.20",
                "22.70", "22.00", "16.51", "19.05",
                "22.54", "24.13", "26.35", "27.94",
                "26.00", "18.40", "20.30");

            this.defaultMargin = this.formatNumber("2.00");
            if (!this.metric) {
                this.sizeWidthArray = this._cmToInchArray(this.sizeWidthArray);
                this.sizeHeightArray = this._cmToInchArray(this.sizeHeightArray);
                this.defaultMargin = this.formatNumber(unitModule.CmToIn("2.00"));
            }

            this.setLocale();
        },

        createContent: function(contentDiv) {
            this.nls = i18nPageSetup;

            /*Initialize unit and allowedUnit */
            this.metric = unitModule.isMeticUnit();
            if (!this.unit) {
                this.unit = this.metric ? this.nls.CM_LABEL : '"';
            }
            if (!this.allowedUnit) {
                this.allowedUnit = {
                    'cm': this.nls.CM_LABEL,
                    'in': '"'
                };
            }

            this.loadLocalArrays();
            /*create layout table*/
            var layoutTable = domConstruct.create('table', null, contentDiv);
            wai.setWaiRole(layoutTable, 'presentation');
            var layoutTbody = domConstruct.create('tbody', null, layoutTable);
            var all = domConstruct.create('tr', null, layoutTbody);
            var leftTD = domConstruct.create('td', null, all);
            var rightTD = domConstruct.create('td', null, all);
            var left = domConstruct.create('div', null, leftTD);
            var right = domConstruct.create('div', null, rightTD);
            //		var layoutTR0TD1 = dojo.create('div', null, left);
            var layoutTR0TD2 = domConstruct.create('div', null, right);
            var layoutTR1TD1 = domConstruct.create('fieldset', null, left);
            var layoutTR1TD2 = domConstruct.create('div', null, right);
            var layoutTR2TD1 = domConstruct.create('div', null, left);
            var layoutTR2TD2 = domConstruct.create('div', null, right);
            var layoutTR3TD1 = domConstruct.create('div', null, left);
            var layoutTR3TD2 = domConstruct.create('div', null, right);
            var layoutTR4TD1 = domConstruct.create('div', null, left);
            var layoutTR4TD2 = domConstruct.create('div', null, right);
            var layoutTR5TD1 = domConstruct.create('div', null, left);
            var layoutTR5TD2 = domConstruct.create('div', null, right);

            //		dojo.addClass(layoutTR0TD1,"sigleDiv");
            domClass.add(layoutTR0TD2, "sigleDiv");
            domClass.add(layoutTR1TD1, "sigleDiv");
            domClass.add(layoutTR1TD2, "sigleDiv");
            domClass.add(layoutTR2TD1, "sigleDiv");
            domClass.add(layoutTR2TD2, "sigleDiv");
            domClass.add(layoutTR3TD1, "sigleDiv");
            domClass.add(layoutTR3TD2, "sigleDiv");
            domClass.add(layoutTR4TD1, "sigleDiv");
            domClass.add(layoutTR4TD2, "sigleDiv");
            domClass.add(layoutTR5TD1, "sigleDiv");
            domClass.add(layoutTR5TD2, "sigleDiv");


            domClass.add(layoutTable, "printSpreadsheetTable");
            domClass.add(leftTD, "leftDiv");
            domClass.add(rightTD, "rightDiv");
            /* Orientation Div*/
            var layoutTR0TD1 = domConstruct.create('legend', null, layoutTR1TD1);
            domClass.add(layoutTR0TD1, "sigleDiv");
            var orientationLabel = this.createDivLabel(layoutTR0TD1, this.nls.ORIENTATION_LABEL, "printSpreadSheetDivLabel");
            var layoutTR1TD1Div = domConstruct.create('div', null, layoutTR1TD1);
            domClass.add(layoutTR1TD1Div, "sigleDiv");
            var radio2 = this.createInputWithType(layoutTR1TD1Div, 'taskType', this.portraitRadioID, 'radio', this.PORTRAIT_MODE, true);
            var label2 = this.createNestLabel(layoutTR1TD1Div, this.nls.PORTRAIT, this.portraitRadioID);
            var radio1 = this.createInputWithType(layoutTR1TD1Div, 'taskType', this.landscapeRadioID, 'radio', this.LANDSCAPE_MODE, false);
            var label1 = this.createNestLabel(layoutTR1TD1Div, this.nls.LANDSCAPE, this.landscapeRadioID);
            on(radio1, "click", lang.hitch(this, "changeOrientationMode", this.LANDSCAPE_MODE));
            on(radio2, "click", lang.hitch(this, "changeOrientationMode", this.PORTRAIT_MODE));
            var radio2Node = dom.byId(this.portraitRadioID);
            wai.setWaiState(radio2Node, 'label', this.nls.ORIENTATION_LABEL + ' ' + this.nls.PORTRAIT);
            var radio1Node = dom.byId(this.landscapeRadioID);
            wai.setWaiState(radio1Node, 'label', this.nls.ORIENTATION_LABEL + ' ' + this.nls.LANDSCAPE);

            var paperFormatLabel = this.createDivLabel(layoutTR2TD1, this.nls.PAPER_FORMAT_LABEL, "printSpreadSheetDivLabel");
            var sizeLabel = this.createDivLabel(layoutTR3TD1, this.nls.PAPER_SIZE_LABEL, "printSpreadsheetLabel");

            if (window.BidiUtils.isGuiRtl()) {
                for (var i = 0; i < this.sizeNamesArray.length; i++) {
                    this.sizeNamesArray[i] = window.BidiUtils.LRE + this.sizeNamesArray[i];
                }
            }
            var storeData = {
                identifier: 'id',
                label: 'name',
                items: [{
                    id: 0,
                    name: this.sizeNamesArray[0]
                }, {
                    id: 1,
                    name: this.sizeNamesArray[1]
                }, {
                    id: 2,
                    name: this.sizeNamesArray[2]
                }, {
                    id: 3,
                    name: this.sizeNamesArray[3]
                }, {
                    id: 4,
                    name: this.sizeNamesArray[4]
                }, {
                    id: 5,
                    name: this.sizeNamesArray[5]
                }, {
                    id: 6,
                    name: this.sizeNamesArray[6]
                }, {
                    id: 7,
                    name: this.sizeNamesArray[7]
                }, {
                    id: 8,
                    name: this.sizeNamesArray[8]
                }, {
                    id: 9,
                    name: this.sizeNamesArray[9]
                }, {
                    id: 10,
                    name: this.sizeNamesArray[10]
                }, {
                    id: 11,
                    name: this.sizeNamesArray[11]
                }, {
                    id: 12,
                    name: this.sizeNamesArray[12]
                }, {
                    id: 13,
                    name: this.sizeNamesArray[13]
                }, {
                    id: 14,
                    name: this.sizeNamesArray[14]
                }, {
                    id: 15,
                    name: this.sizeNamesArray[15]
                }, {
                    id: 16,
                    name: this.sizeNamesArray[16]
                }, {
                    id: 17,
                    name: this.sizeNamesArray[17]
                }, {
                    id: 18,
                    name: this.sizeNamesArray[18]
                }, {
                    id: 19,
                    name: this.sizeNamesArray[19]
                }, {
                    id: 20,
                    name: this.sizeNamesArray[20]
                }, {
                    id: 21,
                    name: this.sizeNamesArray[21]
                }, {
                    id: 22,
                    name: this.sizeNamesArray[22]
                }, {
                    id: 23,
                    name: this.sizeNamesArray[23]
                }, {
                    id: 24,
                    name: this.sizeNamesArray[24]
                }, {
                    id: 25,
                    name: this.sizeNamesArray[25]
                }]
            };

            var nameStore = new ItemFileReadStore({
                data: storeData
            });
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            var sizeCombox = new ComboBox({
                id: this.sizeComboxID,
                name: "fontname",
                value: this.sizeNamesArray[1],
                store: nameStore,
                style: "width:100px;height:20px",
                searchAttr: "name",
                dir: dirAttr
            });
            this.sizeCombox = sizeCombox;
            domStyle.set(sizeCombox._buttonNode, "display", "block");
            on(sizeCombox, "Change", lang.hitch(this, "changeStatus"));
            layoutTR3TD1.appendChild(sizeCombox.domNode);
            var fontNameInput = dom.byId(this.sizeComboxID);
            domStyle.set(fontNameInput, {
                "height": "18px",
                "fontSize": "10pt"
            });
            var outerCombo = dom.byId("widget_" + this.sizeComboxID);
            domStyle.set(outerCombo, {
                "border": "1px solid grey"
            });
            query('.dijitButtonNode', sizeCombox.domNode).forEach(function(node, index, array) {
                domStyle.set(node, {
                    "padding": "0px",
                    "height": "18px"
                });
            });
            wai.setWaiState(sizeCombox.focusNode, 'label', this.nls.PAPER_FORMAT_LABEL + ' ' + this.nls.PAPER_SIZE_LABEL);
            /*width & height*/
            var heightLabel = this.createDivLabel(layoutTR4TD1, this.nls.HEIGHT, "printSpreadsheetLabel");
            var heightTextField = this.createInputWithType(layoutTR4TD1, 'heighttext', this.heightFieldID, 'text', this.sizeHeightArray[1], null);
            //		this.createCMLabel(layoutTR4TD1);
            var widthLabel = this.createDivLabel(layoutTR5TD1, this.nls.WIDTH, "printSpreadsheetLabel");
            var widthTextField = this.createInputWithType(layoutTR5TD1, 'widthtext', this.widthFieldID, 'text', this.sizeWidthArray[1], null);
            var node = dom.byId(this.heightFieldID);
            wai.setWaiState(node, 'label', this.nls.PAPER_FORMAT_LABEL + ' ' + (this.metric ? this.nls.HEIGHT_DESC : this.nls.HEIGHT_DESC2));
            node = dom.byId(this.widthFieldID);
            wai.setWaiState(node, 'label', this.nls.PAPER_FORMAT_LABEL + ' ' + (this.metric ? this.nls.WIDTH_DESC : this.nls.WIDTH_DESC2));
            //		this.createCMLabel(layoutTR5TD1);
            on(widthTextField, "change", lang.hitch(this, "checkValue", this.widthFieldID));
            on(heightTextField, "change", lang.hitch(this, "checkValue", this.heightFieldID));

            /*Margins Div*/
            var marginsLabel = this.createDivLabel(layoutTR0TD2, this.nls.MARGINS_LABEL, "printSpreadSheetDivLabel");

            /*margin top */
            var topLabel = this.createDivLabel(layoutTR1TD2, this.nls.TOP, "printSpreadsheetLabel");
            var topTextField = this.createInputWithType(layoutTR1TD2, 'toptext', this.topFieldID, 'text', this.defaultMargin, null);
            //		this.createCMLabel(layoutTR1TD2);
            node = dom.byId(this.topFieldID);
            wai.setWaiState(node, 'label', this.metric ? this.nls.TOP_DESC : this.nls.TOP_DESC2);
            /*margin bottom*/
            var bottomLabel = this.createDivLabel(layoutTR2TD2, this.nls.BOTTOM, "printSpreadsheetLabel");
            var bottomTextField = this.createInputWithType(layoutTR2TD2, 'bottomtext', this.bottomFieldID, 'text', this.defaultMargin, null);
            //		this.createCMLabel(layoutTR2TD2);
            node = dom.byId(this.bottomFieldID);
            wai.setWaiState(node, 'label', this.metric ? this.nls.BOTTOM_DESC : this.nls.BOTTOM_DESC2);
            /*margin left*/
            var leftLabel = this.createDivLabel(layoutTR3TD2, this.nls.LEFT, "printSpreadsheetLabel");
            var leftTextField = this.createInputWithType(layoutTR3TD2, 'lefttext', this.leftFieldID, 'text', this.defaultMargin, null);
            //		this.createCMLabel(layoutTR3TD2);
            node = dom.byId(this.leftFieldID);
            wai.setWaiState(node, 'label', this.metric ? this.nls.LEFT_DESC : this.nls.LEFT_DESC2);
            /* margin right*/
            var rightLabel = this.createDivLabel(layoutTR4TD2, this.nls.RIGHT, "printSpreadsheetLabel");
            var rightTextField = this.createInputWithType(layoutTR4TD2, 'righttext', this.rightFieldID, 'text', this.defaultMargin, null);
            //		this.createCMLabel(layoutTR4TD2);
            node = dom.byId(this.rightFieldID);
            wai.setWaiState(node, 'label', this.metric ? this.nls.RIGHT_DESC : this.nls.RIGHT_DESC2);
            on(topTextField, "change", lang.hitch(this, "checkValue", this.topFieldID));
            on(bottomTextField, "change", lang.hitch(this, "checkValue", this.bottomFieldID));
            on(leftTextField, "change", lang.hitch(this, "checkValue", this.leftFieldID));
            on(rightTextField, "change", lang.hitch(this, "checkValue", this.rightFieldID));


            this.loadPageSetup();
            this.storeCurrentValue();
        },
        //	createCMLabel: function(parentNode)
        //	{
        //		var temp=dojo.create('label',null,parentNode);
        //		temp.appendChild(dojo.doc.createTextNode(this.nls.CM_LABEL));
        //		dojo.addClass(temp,"printSpreadSheetCMLabel");
        //	},
        createDivLabel: function(parentNode, textValue, cssName) {
            var temp = domConstruct.create('label', null, parentNode);
            temp.appendChild(windowModule.doc.createTextNode(textValue));
            domClass.add(temp, cssName);
            return temp;
        },

        createNestLabel: function(parentNode, textValue, nestId) {
            var temp = domConstruct.create('label', null, parentNode);
            if (nestId == this.pageM2RadioID) {
                temp.id = "label3";
            }
            if (nestId == this.pageM1RadioID) {
                temp.id = "label4";
            }
            domAttr.set(temp, "for", nestId);
            temp.appendChild(windowModule.doc.createTextNode(textValue));
            return temp;
        },
        createInputWithType: function(parentNode, objname, objid, objtype, objvalue, objchecked) {
            var ret = null;
            ret = document.createElement("input");
            ret.name = objname;
            ret.type = objtype;
            ret.id = objid;
            parentNode.appendChild(ret);
            if (objvalue)
                ret.value = objvalue;
            if (objchecked)
                ret.checked = objchecked;

            switch (objtype) {
                case 'radio':
                    domClass.add(ret, "printSpreadsheetRadio");
                    break;
                case 'text':
                    domClass.add(ret, "printSpreadsheetText");
                    break;
                case 'checkbox':
                    domClass.add(ret, "printSpreadsheetSelect");
                    break;
                    defalut:
                        return null;
            }
            return ret;
        },

        showMessage: function(id) {
            // looks like dead code
        },
        hideMessage: function(id) {
            // looks like dead code
        },

        changeOrientationMode: function(mode) {
            if (this.CURRENT_MODE != mode) {
                var objh = dom.byId(this.heightFieldID);
                var objw = dom.byId(this.widthFieldID);
                var temp = objh.value;
                objh.value = objw.value;
                objw.value = temp;
                this.exchangeMargin(mode == this.LANDSCAPE_MODE);
                this.checkValue(this.bottomFieldID);
                this.checkValue(this.rightFieldID);
                this.CURRENT_MODE = mode;
                var portraitRadio = dom.byId(this.portraitRadioID);
                var landscapeRadio = dom.byId(this.landscapeRadioID);
                if (mode == this.LANDSCAPE_MODE) {
                    landscapeRadio.checked = true;
                    portraitRadio.checked = false;
                } else if (mode == this.PORTRAIT_MODE) {
                    portraitRadio.checked = true;
                    landscapeRadio.checked = false;
                }
            }

        },
        exchangeMargin: function(clockWise) {
            var objT = dom.byId(this.topFieldID);
            var objR = dom.byId(this.rightFieldID);
            var objB = dom.byId(this.bottomFieldID);
            var objL = dom.byId(this.leftFieldID);
            if (clockWise) {
                var values = [objL.value, objT.value, objR.value, objB.value];
            } else {
                var values = [objR.value, objB.value, objL.value, objT.value];
            }
            objT.value = values[0];
            objR.value = values[1];
            objB.value = values[2];
            objL.value = values[3];
        },
        checkScope: function(id) {
            var h = unitModule.parseValue((dom.byId(this.heightFieldID).value), this.allowedUnit);
            var w = unitModule.parseValue((dom.byId(this.widthFieldID).value), this.allowedUnit);
            var t = unitModule.parseValue((dom.byId(this.topFieldID).value), this.allowedUnit);
            var b = unitModule.parseValue((dom.byId(this.bottomFieldID).value), this.allowedUnit);
            var l = unitModule.parseValue((dom.byId(this.leftFieldID).value), this.allowedUnit);
            var r = unitModule.parseValue((dom.byId(this.rightFieldID).value), this.allowedUnit);
            var obj = dom.byId(id);
            var v = unitModule.parseValue(obj.value, this.allowedUnit);
            var temp = v;
            var outScope = false;
            var maxLimit = 300.00;
            var oldwidth = tools.PxToCm(this._cur_section.pageSize.w);
            var dv1 = 2;
            var dv2 = 0.5;
            var msg = this.nls.INVALID_MSG;
            if (!this.metric) {
                maxLimit = unitModule.CmToIn(maxLimit);
                dv1 = unitModule.CmToIn(dv1);
                dv2 = unitModule.CmToIn(dv2);
            }
            switch (id) {
                case this.heightFieldID:
                    if (h > maxLimit) {
                        temp = maxLimit;
                        outScope = true;
                    }
                    if (temp < t + b + dv1) {
                        temp = t + b + dv1;
                        outScope = true;
                    }
                    break;
                case this.widthFieldID:
                    if (w > maxLimit) {
                        temp = maxLimit;
                        outScope = true;
                    }
                    if (temp < l + r + dv2) {
                        temp = l + r + dv2;
                        outScope = true;
                    }
                    break;
                case this.topFieldID: //top

                    if (t < 0) {
                        temp = 0.00;
                        outScope = true;
                    }
                    if (temp > h - b - dv1) {
                        temp = h - b - dv1;
                        outScope = true;
                    }
                    if (temp < 0) {
                        temp = 0.00;
                        outScope = true;
                        this.checkScope(this.bottomFieldID);
                    }
                    break;
                case this.bottomFieldID: //bottom
                    if (b < 0) {
                        temp = 0.00;
                        outScope = true;
                    }
                    if (temp > h - t - dv1) {
                        temp = h - t - dv1;
                        outScope = true;
                    }
                    if (temp < 0) {
                        temp = 0.00;
                        outScope = true;
                        this.checkScope(this.topFieldID);
                    }
                    break;
                case this.leftFieldID: //left
                    if (l < 0) {
                        temp = 0.00;
                        outScope = true;
                    }
                    if (temp > w - r - dv2) {
                        temp = w - r - dv2;
                        outScope = true;
                    }
                    if (temp < 0) {
                        temp = 0.00;
                        outScope = true;
                        this.checkScope(this.rightFieldID);
                    }
                    break;
                case this.rightFieldID: //right
                    if (r < 0) {
                        temp = 0.00;
                        outScope = true;
                    }
                    if (temp > w - l - dv2) {
                        temp = w - l - dv2;
                        outScope = true;
                    }
                    if (temp < 0) {
                        temp = 0.00;
                        outScope = true;
                        this.checkScope(this.leftFieldID);
                    }
                    break;
                default:
                    break;
            }
            if (outScope)
            {
                this.setWarningMsg(msg);
                this.clearWarnigMsgTimer = setTimeout(lang.hitch(this, function() {
                    this.setWarningMsg('');
                }), 5000);
            }
            else
            	this.setWarningMsg("");
            obj.value = this.formatNumber(temp);
           
        },
        setWarningMsg: function(msg) {
        	if (this.clearWarnigMsgTimer)
        		clearTimeout(this.clearWarnigMsgTimer);
            // unique warning message ID in concord system
            var msgId = this.warnMsgID + this.dialogId;
            var msgDiv = dom.byId(msgId);
            if (msgDiv) {
                msgDiv.style.cssText = "width:40em;word-wrap:break-word";
            }

            this.inherited(arguments);
        },
        getPreValue: function(id) {
            switch (id) {
                case this.heightFieldID:
                    return this.cur_value[this.ID.h];
                case this.widthFieldID:
                    return this.cur_value[this.ID.w];
                case this.topFieldID:
                    return this.cur_value[this.ID.t];
                case this.bottomFieldID:
                    return this.cur_value[this.ID.b];
                case this.leftFieldID:
                    return this.cur_value[this.ID.l];
                case this.rightFieldID:
                    return this.cur_value[this.ID.r];
            }
        },
        checkValue: function(id) {
            var obj = dom.byId(id);
            if (!this.checkInput(id)) {
                this.setWarningMsg(this.nls.INVALID_MSG);
                obj.value = this.formatNumber(this.getPreValue(id));
                this.clearWarnigMsgTimer = setTimeout(lang.hitch(this, function() {
                    this.setWarningMsg('');
                }), 5000);
            } else {
                this.checkScope(id);
            }

            if (id == this.widthFieldID || id == this.heightFieldID) {
                var h = unitModule.parseValue((dom.byId(this.heightFieldID).value), this.allowedUnit);
                var w = unitModule.parseValue((dom.byId(this.widthFieldID).value), this.allowedUnit);
                var index = -1;
                var combox = dom.byId(this.sizeComboxID);
                var portraitRadio = dom.byId(this.portraitRadioID);
                var landscapeRadio = dom.byId(this.landscapeRadioID);
                if (h >= w) {
                    landscapeRadio.checked = false;
                    portraitRadio.checked = true;
                    this.CURRENT_MODE = this.PORTRAIT_MODE;
                } else {
                    landscapeRadio.checked = true;
                    portraitRadio.checked = false;
                    this.CURRENT_MODE = this.LANDSCAPE_MODE;
                }
                for (i = 0; i < this.SIZE_COUNT; i++) {
                    if (Math.abs(h - this.sizeHeightArray[i]) < 0.5 && Math.abs(w - this.sizeWidthArray[i]) < 0.5) {
                        index = i;
                        this.sizeCombox.setValue(this.sizeNamesArray[i]);
                        //combox.value=this.sizeNamesArray[i];
                        var landscapeRadio = dom.byId(this.landscapeRadioID);
                        landscapeRadio.checked = false;
                        portraitRadio.checked = true;
                        this.CURRENT_MODE = this.PORTRAIT_MODE;
                        break;
                    } else if (Math.abs(w - this.sizeHeightArray[i]) < 0.5 && Math.abs(h - this.sizeWidthArray[i]) < 0.5) {
                        index = i;
                        this.sizeCombox.setValue(this.sizeNamesArray[i]);
                        //combox.value=this.sizeNamesArray[i];

                        landscapeRadio.checked = true;
                        var portraitRadio = dom.byId(this.portraitRadioID);
                        portraitRadio.checked = false;
                        this.CURRENT_MODE = this.LANDSCAPE_MODE;
                        break;
                    }
                }
                if (index == -1) {
                    this.sizeCombox.setValue(this.nls.USER);
                    //combox.value=this.nls.USER;
                }
            }

        },
        checkInput: function(id) {
            var value = unitModule.parseValue(dom.byId(id).value, this.allowedUnit);
            if (isNaN(value) || value < 0) {
                return false;
            } else {
                return true;
            }
        },
        _toCmValue: function(num) {
            //		var unit = concord.util.unit.isMeticUnit() ? 'cm' : 'in';
            if (unitModule.isMeticUnit())
                return num;
            else
                return unitModule.toCmValue(num + 'in');
        },

        updateSection: function() {
            //store current selection
            var selection = pe.lotusEditor.getSelection();
            if (selection) {
                selection.store();
            }
            var msgs = [];
            //var oldTarget = dojo.clone(this._cur_section);
            var oldSectJson = this._cur_section.toJson();
            var oldContentWidth = this._cur_section.pageSize.w - this._cur_section.pageMargin.left - this._cur_section.pageMargin.right;        
            var oldColNum = this._cur_section.getColsNum();
            // update Continuous Section
            var setting = pe.lotusEditor.setting;
            var oldSectionWidth = this._cur_section.pageSize.w;
            var oldSectionHeight = this._cur_section.pageSize.h;
            
            if (!this.canUpdateColumns())
        	{
        		this.setWarningMsg(this.nls.INVALID_WIDTH_FOR_COLUMNS);
        		this.clearWarnigMsgTimer = setTimeout(lang.hitch(this, function() {
                	this.setWarningMsg('');
            	}), 5000);
        		return true;
        	}
            var newPageHeight = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.h]));
            var newPageWidth = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.w]));
            var prevSection = setting.getPreSection(this._cur_section);
            var currentSection = this._cur_section;
            var nextSection =  setting.getNextSection(currentSection);
            // if pagesize of section has been changed and if it's continuous type section we need reset its type to Next page
            if(currentSection.isContinuous() && prevSection){
                if(prevSection.pageSize.w != newPageWidth || prevSection.pageSize.h != newPageHeight){
                    currentSection.setType(null);
                    this._cur_section.type = null;
                }
            }
            if(nextSection && nextSection.isContinuous()){
               if(nextSection.pageSize.w != newPageWidth || nextSection.pageSize.h != newPageHeight){
                    var oldNextSectionJson = nextSection.toJson();
                    nextSection.setType(null);
                    var actPair = msgCenter.createReplaceKeyAct(nextSection.getId(),oldNextSectionJson, nextSection.toJson(), constants.KEYPATH.Section);
                    msgs.push(actPair);
                }
            }
            this._cur_section.pageSize.h = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.h]));
            this._cur_section.pageSize.w = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.w]));
            delete this._cur_section.origPageSize;
            
            if (this._cur_section.pageSize.w > this._cur_section.pageSize.h)
                this._cur_section.pageSize.orient = "landscape";
            else
                delete this._cur_section.pageSize.orient;
            
            this._cur_section.pageMargin.top = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.t]));
            this._cur_section.pageMargin.bottom = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.b]));
            this._cur_section.pageMargin.left = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.l]));
            this._cur_section.pageMargin.right = tools.CmToPx(this._toCmValue(this.cur_value[this.ID.r]));
            delete this._cur_section.origPageMargin;
            
            var newContentWidth = this._cur_section.pageSize.w - this._cur_section.pageMargin.left - this._cur_section.pageMargin.right;
            var newColNum = this._cur_section.getColsNum();
            var relayoutBlock = oldContentWidth != newContentWidth || oldColNum != newColNum;
            //send co-editing messages
            var actPair = msgCenter.createReplaceKeyAct(this._cur_section.getId(), oldSectJson, this._cur_section.toJson(), constants.KEYPATH.Section);
            msgs.push(actPair);
            var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, msgs, constants.MSGCATEGORY.Setting);
            pe.lotusEditor.layoutEngine.rootView.updateSection(this._cur_section, relayoutBlock);
            msgCenter.sendMessage([msg]);
            if (selection) {
                selection.restoreBeforeUpdate();
                selection.scrollIntoView();
            }
        },
        onOk: function() {
            try {
                this.storeCurrentValue();
                var failed = this.updateSection();
                if (failed)
                	return false;
            } catch (e) {
                console.error("error occurred when apply page setup:" + e);
            }
            return true;
        },
        canUpdateColumns: function () {
            var length = this._cur_section.cols;
            //cm as unit
            
            var newWidth = tools.CmToPx(this._toCmValue(unitModule.parseValue((dom.byId(this.widthFieldID).value), this.allowedUnit)));
            var newL = tools.CmToPx(this._toCmValue(unitModule.parseValue((dom.byId(this.leftFieldID).value), this.allowedUnit)));
            var newR = tools.CmToPx(this._toCmValue(unitModule.parseValue((dom.byId(this.rightFieldID).value), this.allowedUnit)));
            var oldL =  this._cur_section.pageMargin.left;
            var oldR = this._cur_section.pageMargin.right;
            // the original width
            var oldContentW, newContentW;
            //0.5 inch 1.27 cm selfdefined
            var minColumnWidth = tools.CmToPx(1.27);
            // we only need to check non-equal colomns
            var nonEqualWidth = this._cur_section.cols.equalWidth == "0";
            if (nonEqualWidth) {
                var colArray = this._cur_section.cols.col;
                var w = 0;
                for (var i = 0; i < this._cur_section.getColsNum() && colArray; i++) {
                    var width, currentSpace;
                    if (colArray && colArray[i]) {
                        width = tools.toPxValue(colArray[i].w);
                        currentSpace = tools.toPxValue(colArray[i].space);
                    }
                    w = w + width + currentSpace;
                }
                oldContentW = w;
            } else {
                oldContentW = this._cur_section.pageSize.w - oldL -oldR;
            }
            newContentW = newWidth - newL - newR;
            if (Math.abs(oldContentW - newContentW) > 2) {
            	var colsSpace = tools.toPxValue(this._cur_section.cols.space);
                var scaleRate = newContentW / oldContentW;
                if (nonEqualWidth) {
                    var colArray = this._cur_section.cols.col;
                    var newcolArray = [];
                    for (var i = 0; i < this._cur_section.getColsNum() && colArray; i++) {
                        var width, currentSpace;
                        if (colArray && colArray[i]) {
                            width = tools.toPxValue(colArray[i].w) * scaleRate;
                            currentSpace = tools.toPxValue(colArray[i].space) * scaleRate;
                            if (width < minColumnWidth)
                                return false;
                        }
                        var col = {
                            t: "col"
                        };
                        var nw =  tools.PxToPt(width).toFixed(3);
                        var ns = tools.PxToPt(currentSpace).toFixed(3);
                        if (nw != 0)
                            col.w = nw + "pt";
                        if (ns != 0)
                            col.space = ns + "pt";
                        newcolArray.push(col);
                    }
                    this._cur_section.cols.col = newcolArray;
                } else {
                    var num = this._cur_section.getColsNum();
                    var newspace = colsSpace * scaleRate;
                    var width = (newContentW - (num - 1) * newspace) / num;
                    if (width < minColumnWidth)
                        return false;
                }
                this._cur_section.cols.space = tools.PxToPt(colsSpace * scaleRate).toFixed(3) + "pt";
            }
            return true;
        },
        storeCurrentValue: function() {
            this.cur_value[this.ID.h] = unitModule.parseValue(dom.byId(this.heightFieldID).value, this.allowedUnit);
            this.cur_value[this.ID.w] = unitModule.parseValue(dom.byId(this.widthFieldID).value, this.allowedUnit);
            this.cur_value[this.ID.t] = unitModule.parseValue(dom.byId(this.topFieldID).value, this.allowedUnit);
            this.cur_value[this.ID.b] = unitModule.parseValue(dom.byId(this.bottomFieldID).value, this.allowedUnit);
            this.cur_value[this.ID.l] = unitModule.parseValue(dom.byId(this.leftFieldID).value, this.allowedUnit);
            this.cur_value[this.ID.r] = unitModule.parseValue(dom.byId(this.rightFieldID).value, this.allowedUnit);

        },
        setPreValue: function() {
            dom.byId(this.heightFieldID).value = this.formatNumber(this.cur_value[this.ID.h]);
            dom.byId(this.widthFieldID).value = this.formatNumber(this.cur_value[this.ID.w]);
            dom.byId(this.topFieldID).value = this.formatNumber(this.cur_value[this.ID.t]);
            dom.byId(this.bottomFieldID).value = this.formatNumber(this.cur_value[this.ID.b]);
            dom.byId(this.leftFieldID).value = this.formatNumber(this.cur_value[this.ID.l]);
            dom.byId(this.rightFieldID).value = this.formatNumber(this.cur_value[this.ID.r]);
        },
        formatNumber: function(num, noUnit) {
            var ret = num;
            if (typeof(ret) == "string") {
                ret = num.replace(",", ".");
            }
            ret = number.format(ret, {
                pattern: "#.00",
                locale: this.locale
            });
            if (!noUnit)
                ret += " " + this.unit;

            return ret;
        },
        reset: function() {
            var ori_locale = this.locale;
            this.setLocale();
            this.loadPageSetup();
            this.setPreValue();
            //reset paper size and mode from the size
            this.checkValue(this.heightFieldID);
        },
        onCancel: function(editor) {
            this.setPreValue();
            return true;
        },
        setLocale: function() {
            //		this.locale= pe.scene.getLocale();
            //		if(this.locale==null)
            //		{
            this.locale = pe.scene.locale || g_locale;
            //		}
            for (var i = 0; i < 27; i++) {
                if (i != 12) {
                    this.sizeWidthArray[i] = this.formatNumber(this.sizeWidthArray[i], true);;
                    this.sizeHeightArray[i] = this.formatNumber(this.sizeHeightArray[i], true);;
                }
            }
        },

        _formatValue: function(num) {
            if (unitModule.isMeticUnit())
                return num;
            else
                return unitModule.CmToIn(num);
        },
        loadPageSetup: function() {
            var setting = pe.lotusEditor.setting;
            if (!setting) {
                //TODO: error control
                throw "document setting is lost!!!";
            }
            var section = null;

            //get selection to get current section
            var selection = pe.lotusEditor.getSelection();
            if (selection) {
                var ranges = selection.getRanges();
                var range = ranges && ranges[0];
                if (range) {
                    var firstView = range.getStartView();
                    if (firstView) {
                        var body = ViewTools.getBody(firstView.obj);
                        section = body && body.getSection();
                    }
                }
            }

            if (!section) {
                //try to use the first section
                section = setting.getFirstSection();
            }

            if (!section) {
                throw "section not found for current selection!";
            }

            this._cur_section = section;
            //get paper size from document setting
            this.cur_value[this.ID.h] = tools.PxToCm(this._formatValue(section.pageSize.h));
            this.cur_value[this.ID.w] = tools.PxToCm(this._formatValue(section.pageSize.w));
            this.cur_value[this.ID.t] = tools.PxToCm(this._formatValue(section.pageMargin.top));
            this.cur_value[this.ID.b] = tools.PxToCm(this._formatValue(section.pageMargin.bottom));
            this.cur_value[this.ID.l] = tools.PxToCm(this._formatValue(section.pageMargin.left));
            this.cur_value[this.ID.r] = tools.PxToCm(this._formatValue(section.pageMargin.right));
        },

        getIndex: function(val) {
            for (var i = 0; i < this.sizeNamesArray.length; i++) {
                if (val == this.sizeNamesArray[i]) {
                    return i;
                    break;
                }
            }
            return -1;
        },
        changeStatus: function() {
            var index = this.getIndex(dom.byId(this.sizeComboxID).value);
            if (index == -1) {
                this.checkValue(this.widthFieldID);
                return;
            }
            var width = dom.byId(this.widthFieldID);
            var height = dom.byId(this.heightFieldID);
            if (index >= 0 && index < this.SIZE_COUNT) {
                if (index != 12 && this.CURRENT_MODE == this.PORTRAIT_MODE) {
                    width.value = this.formatNumber(this.sizeWidthArray[index]);
                    height.value = this.formatNumber(this.sizeHeightArray[index]);

                } else if (index != 12 && this.CURRENT_MODE == this.LANDSCAPE_MODE) {
                    height.value = this.formatNumber(this.sizeWidthArray[index]);
                    width.value = this.formatNumber(this.sizeHeightArray[index]);

                }
                this.checkValue(this.bottomFieldID);
                this.checkValue(this.rightFieldID);
            }
        },

        //Below funtion is to convert cm array to inch array
        _cmToInchArray: function(cmArray) {
            var inArray = new Array();
            for (var index = 0; index < cmArray.length; index++) {
                inArray.push(this._cmToFormatInch(cmArray[index]));
            }
            return inArray;
        },

        _cmToFormatInch: function(num) {
            var ret = num;
            if (ret == "User") {
                return ret;
            } else {
                ret = num / 2.54;
            }
            ret = number.format(ret, {
                pattern: "#.00",
                locale: pe.scene.locale || g_locale
            });
            return ret;
        }

    });

    return PageSetup;
});
