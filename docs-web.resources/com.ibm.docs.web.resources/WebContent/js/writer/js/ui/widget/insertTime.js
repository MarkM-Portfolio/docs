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
    "dojo/keys",
    "dojo/dom-attr",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/on",
    "dijit/Dialog",
    "dijit/Tooltip",
    "concord/i18n/locale",
    "concord/util/date",
    "concord/widgets/concordDialog",
    "dojo/i18n!writer/nls/lang",
    "dojox/date/buddhist/Date"
], function(keys, domAttr, declare, lang, dateLocale, dom, domClass, domConstruct, has, on, Dialog, Tooltip, localeModule, date, concordDialog, i18nlang, buddhistDate) {

    var insertTime = declare("writer.ui.widget.insertTime", concordDialog, {
        timeNamesArray: null,
        timeCodesArray: null,

        dateNow: null,
        CURRENT_TIME: null,
        CURRENT_TIME_FORMAT: null,

        FORMAT_COUNT: 2,

        timeList: null,
        locale: null,

        dialogId: null,

        TimeFormatCode: {
            "short": {
                formatName: "short",
                formatLength: "short"
            },
            "medium": {
                formatName: "medium",
                formatLength: "medium"
            },
            "long": {
                formatName: "long",
                formatLength: "long"
            },
            "full": {
                formatName: "full",
                formatLength: "full"
            },
            "Hm": {
                timeCategory: "dateFormatItem-Hm"
            },
            "Hms": {
                timeCategory: "dateFormatItem-Hms"
            },
            "ms": {
                timeCategory: "dateFormatItem-ms"
            },
            "hm": {
                timeCategory: "dateFormatItem-hm"
            },
            "HHmmss": {
                timeCategory: "dateFormatItem-HHmmss"
            },
            "H": {
                timeCategory: "dateFormatItem-H"
            },
            "hms": {
                timeCategory: "dateFormatItem-hms"
            },
            "HHmm": {
                timeCategory: "dateFormatItem-HHmm"
            },
            //date-time format
            "dateTimeShort": {
                dateCategory: "dateFormat-short",
                timeCategory: "timeFormat-short",
                formatLength: "short"
            },
            "dateTimeMedium": {
                dateCategory: "dateFormat-medium",
                timeCategory: "timeFormat-medium",
                formatLength: "medium"
            },
            "dateTimeLong": {
                dateCategory: "dateFormat-long",
                timeCategory: "timeFormat-long",
                formatLength: "long"
            },
            "dateTimeLong2": {
                dateCategory: "dateFormat-long",
                timeCategory: "timeFormat-medium",
                formatLength: "long"
            }

        },

        constructor: function() {},
        calcWidth: function() {
            return "480px";
        },

        setDialogID: function() {
            this.dialogId = "C_d_InsertTimeDialog";
        },

        initTimeArrays: function() {
            this.dateNow = new Date();
            if (date.isBuddistLocale()) {
                this.dateNow = new buddhistDate(this.dateNow);
            }
            this.timeCodesArray = new Array("short", "medium",
                "dateTimeShort", "dateTimeMedium", "dateTimeLong2");
            this.FORMAT_COUNT = this.timeCodesArray.length;
            this.timeNamesArray = new Array(this.FORMAT_COUNT);

            for (var i = 0; i < this.FORMAT_COUNT; i++) {
                this.timeNamesArray[i] = this.formatTime(this.dateNow, this.timeCodesArray[i]);
            }
            this.setLocale();
        },

        createContent: function(contentDiv) {
            this.initTimeArrays();
            /*create layout table*/
            var layoutTable = domConstruct.create('table', null, contentDiv);
            var layoutTbody = domConstruct.create('tbody', null, layoutTable);
            var all = domConstruct.create('tr', null, layoutTbody);
            var tdArea = domConstruct.create('td', null, all);
            var div = domConstruct.create('div', null, tdArea);
            var layoutTR0TD1 = domConstruct.create('div', null, div);
            domClass.add(layoutTR0TD1, "sigleDiv");
            domClass.add(layoutTable, "printSpreadsheetTable");
            domClass.add(div, "sigleDiv");
            domAttr.set(layoutTable, {
                "role": "presentation"
            });

            var timeCombox = domConstruct.create('select', null, layoutTR0TD1);
            this.timeList = timeCombox;
            var nls = i18nlang;
            domAttr.set(timeCombox, {
                "id": "C_d_InsertTimeDialogTimeCombox",
                "size": 10,
                "role": "listbox",
                "title": nls.selectTime,
                "aria-label": nls.selectTime
            });

            for (var index = 0; index < this.FORMAT_COUNT; index++) {
                var opt = document.createElement('option');
                opt.text = this.timeNamesArray[index];
                domAttr.set(opt, {
                    "role": "option"
                });
                domAttr.set(opt, {
                    "title": this.timeNamesArray[index]
                });
                domAttr.set(opt, {
                    "aria-label": this.timeNamesArray[index]
                });

                if ((has("ie") || has("trident"))) {
                    timeCombox.add(opt);
                } else {
                    timeCombox.add(opt, null);
                }
            }
            domAttr.set(timeCombox.options[0], {
                "selected": "selected"
            });
            domAttr.set(timeCombox, {
                "style": "width:400px;"
            });
            on(timeCombox, "change", lang.hitch(this, this.onSelected));
            on(timeCombox, "keyup", lang.hitch(this, this.onSelected));
        },

        /*Methods begins here*/
        onSelected: function(e) {
            var index = this.timeList.selectedIndex;
            this.CURRENT_TIME = this.timeNamesArray[index];;
            this.CURRENT_TIME_FORMAT = this.timeCodesArray[index];
            if (e.keyCode == keys.ENTER) {
                if (this.onOk(this.editor))
                    this.hide();
            }
        },

        onOk: function(editor) {
            this.insertSelectedTime(editor);
            return true;
        },
        reset: function() {
            this.initTimeArrays();
            var element = dom.byId("C_d_InsertTimeDialogTimeCombox");
            var eSize = element.length;
            for (var index = 0; index < eSize; index++) {
                element.remove(0);
            }

            for (var index = 0; index < this.FORMAT_COUNT; index++) {
                var opt = document.createElement('option');
                opt.text = this.timeNamesArray[index];
                domAttr.set(opt, {
                    "role": "option"
                });
                domAttr.set(opt, {
                    "title": this.timeNamesArray[index]
                });
                domAttr.set(opt, {
                    "aria-label": this.timeNamesArray[index]
                });

                if ((has("ie") || has("trident"))) {
                    element.add(opt);
                } else {
                    element.add(opt, null);
                }
            }
            domAttr.set(element.options[0], {
                "selected": "selected"
            });
            this.setDefaultValue();

        },
        onCancel: function(editor) {
            var noHeaderFooter = pe.scene.headerfooter == null || pe.scene.headerfooter.currentArea == "text";
            if (!noHeaderFooter) {
                this.dialog.refocus = false;
                this.dialog.disconnect(this.focusHdl);
                this.focusHdl = null;
                pe.scene.headerfooter.setCursor();
            }
            return true;
        },

        setDefaultValue: function() {
            this.CURRENT_TIME = this.timeNamesArray[0];
            this.CURRENT_TIME_FORMAT = this.timeCodesArray[0];
        },

        insertSelectedTime: function(editor) {
            var format = this.getFormatPatten(this.CURRENT_TIME_FORMAT);
            format && editor.execCommand('insertTime', format);
        },

        /*string*/
        formatTime: function(showString, /*format*/ format) {
            var rawDate = showString;

            try {
                try {

                    var options = {};
                    var pattern = this.TimeFormatCode[format];
                    if (pattern) {
                        lang.mixin(options, pattern);
                        if (format.indexOf("dateTime") == -1) //for dateTime, the selector should be null
                            options.selector = "time";
                    } else {
                        options.timePattern = format;
                        options.selector = "time";
                    }
                    options.locale = this.locale;

                    if (format.indexOf("dateTime") == 0)
                        options.selector = "dateTime";
                    showString = dateLocale.format(rawDate, options);
                } catch (e) {
                    showString = dateLocale.format(rawDate, {
                        selector: "time"
                    });
                    console.log(e);
                }
            } catch (e) {
                return showString;
            }
            if(BidiUtils.isArabicLocale()) {
            	showString = BidiUtils.adjustArabicDate(showString);
            }

            return showString;
        },

        /*string*/
        getFormatPatten: function( /*format*/ format) {
            var formatPatten;
            try {
                try {
                    var options = {};
                    var pattern = this.TimeFormatCode[format];
                    if (pattern) {
                        lang.mixin(options, pattern);
                        if (format.indexOf("dateTime") == -1) //for dateTime, the selector should be null
                            options.selector = "time";
                    } else {
                        options.timePattern = format;
                        options.selector = "time";
                    }
                    options.locale = this.locale;

                    if (format.indexOf("dateTime") == 0)
                        options.selector = "dateTime";

                    formatPatten = localeModule.getFormatPatten(options);
                } catch (e) {
                    console.log(e);
                }
            } catch (e) {
                console.log(e);
            }
            var textList = formatPatten.split("'");
            for (var i = 0; i < textList.length; i = i + 2) {
                //for case 
                // "MMMM d, y 'at' h:mm:ss a"
                textList[i] = textList[i].replace("a", "am/pm").replace(/y+/g, "yyyy");
            }
            return textList.join("'");
        },

        setLocale: function() {
            this.locale = pe.scene.locale || g_locale;
        }
    });

    return insertTime;
});
