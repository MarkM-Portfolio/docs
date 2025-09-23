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

    var insertDate = declare("writer.ui.widget.insertDate", concordDialog, {
        dateNamesArray: null,
        dateCodesArray: null,

        dateNow: null,

        CURRENT_DATE: null,
        CURRENT_DATE_FORMAT: null,

        FORMAT_COUNT: 2,

        dateList: null,
        locale: null,

        dialogId: null,

        DateFormatCode: {
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
            "yM": {
                dateCategory: "dateFormatItem-yM"
            },
            "yQ": {
                dateCategory: "dateFormatItem-yQ"
            },
            "yyQ": {
                dateCategory: "dateFormatItem-yyQ"
            },
            "MMMEd": {
                dateCategory: "dateFormatItem-MMMEd"
            },
            "yQQQ": {
                dateCategory: "dateFormatItem-yQQQ"
            },
            "MMM": {
                dateCategory: "dateFormatItem-MMM"
            },
            "y": {
                dateCategory: "dateFormatItem-y"
            },
            "yMMM": {
                dateCategory: "dateFormatItem-yMMM"
            },
            "EEEd": {
                dateCategory: "dateFormatItem-EEEd"
            },
            "yMMMM": {
                dateCategory: "dateFormatItem-yMMMM"
            },
            "MMMMEd": {
                dateCategory: "dateFormatItem-MMMMEd"
            },
            "MMMd": {
                dateCategory: "dateFormatItem-MMMd"
            },
            "MMMMd": {
                dateCategory: "dateFormatItem-MMMMd"
            },
            "M": {
                dateCategory: "dateFormatItem-M"
            },
            "MEd": {
                dateCategory: "dateFormatItem-MEd"
            },
            "yMMMEd": {
                dateCategory: "dateFormatItem-yMMMEd"
            },
            "Md": {
                dateCategory: "dateFormatItem-Md"
            },
            "yMEd": {
                dateCategory: "dateFormatItem-yMEd"
            },
            "d": {
                dateCategory: "dateFormatItem-d"
            }
        },

        constructor: function() {},
        calcWidth: function() {
            return "480px";
        },

        setDialogID: function() {
            this.dialogId = "C_d_InsertDateDialog";
        },

        initDateArrays: function() {
            this.dateNow = new Date();
            if (date.isBuddistLocale()) {
                this.dateNow = new buddhistDate(this.dateNow);
            }
            this.dateCodesArray = new Array("short", "medium", "long", "full");
            this.FORMAT_COUNT = this.dateCodesArray.length;
            this.dateNamesArray = new Array(this.FORMAT_COUNT);

            for (var i = 0; i < this.FORMAT_COUNT; i++) {
                this.dateNamesArray[i] = this.formatDate(this.dateNow, this.dateCodesArray[i]);
            }
            this.setLocale();
        },

        createContent: function(contentDiv) {
            this.initDateArrays();
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

            var dateCombox = domConstruct.create('select', null, layoutTR0TD1);
            this.dateList = dateCombox;
            var nls = i18nlang;
            domAttr.set(dateCombox, {
                "id": "C_d_InsertDateDialogdateCombox",
                "size": 10,
                "role": "listbox",
                "title": nls.selectDate,
                "aria-label": nls.selectDate
            });

            for (var index = 0; index < this.FORMAT_COUNT; index++) {
                var opt = document.createElement('option');
                opt.text = this.dateNamesArray[index];
                domAttr.set(opt, {
                    "role": "option"
                });
                domAttr.set(opt, {
                    "title": this.dateNamesArray[index]
                });
                domAttr.set(opt, {
                    "aria-label": this.dateNamesArray[index]
                });

                if ((has("ie") || has("trident"))) {
                    dateCombox.add(opt);
                } else {
                    dateCombox.add(opt, null);
                }
            }
            domAttr.set(dateCombox.options[0], {
                "selected": "selected"
            });
            domAttr.set(dateCombox, {
                "style": "width:400px;"
            });
            on(dateCombox, "change", lang.hitch(this, this.onSelected));
            on(dateCombox, "keyup", lang.hitch(this, this.onSelected));
            this.setDefaultValue();
        },

        /*Methods begins here*/
        onSelected: function(e) {
            var index = this.dateList.selectedIndex;
            this.CURRENT_DATE = this.dateNamesArray[index];
            this.CURRENT_DATE_FORMAT = this.dateCodesArray[index];
            if (e.keyCode == keys.ENTER) {
                if (this.onOk(this.editor))
                    this.hide();
            }
        },

        onOk: function(editor) {
            this.insertSelectedDate(editor);
            return true;
        },
        reset: function() {
            this.initDateArrays();
            var element = dom.byId("C_d_InsertDateDialogdateCombox");
            var eSize = element.length;
            for (var index = 0; index < eSize; index++) {
                element.remove(0);
            }

            for (var index = 0; index < this.FORMAT_COUNT; index++) {
                var opt = document.createElement('option');
                opt.text = this.dateNamesArray[index];
                domAttr.set(opt, {
                    "role": "option"
                });
                domAttr.set(opt, {
                    "title": this.dateNamesArray[index]
                });
                domAttr.set(opt, {
                    "aria-label": this.dateNamesArray[index]
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
            return true;
        },

        setDefaultValue: function() {
            this.CURRENT_DATE = this.dateNamesArray[0];
            this.CURRENT_DATE_FORMAT = this.dateCodesArray[0];
        },

        insertSelectedDate: function(editor) {
            var format = this.getFormatPatten(this.CURRENT_DATE_FORMAT);
            format && editor.execCommand('insertDate', format);
        },

        /*string*/
        formatDate: function(showString, /*format*/ format) {
            var rawDate = showString;

            try {
                try {
                    var options = {};
                    var pattern = this.DateFormatCode[format];
                    if (pattern) {
                        lang.mixin(options, pattern);
                        if (format.indexOf("dateTime") == -1) //for dateTime, the selector should be null
                            options.selector = "date";
                    } else {
                        options.datePattern = format;
                        options.selector = "date";
                    }
                    options.locale = this.locale;
                    showString = dateLocale.format(rawDate, options);
                } catch (e) {
                    showString = dateLocale.format(rawDate, {
                        selector: "date"
                    });
                    console.log(e);
                }
            } catch (e) {
                return showString;
            }

            if (BidiUtils.isArabicLocale()) {
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
                    var pattern = this.DateFormatCode[format];
                    if (pattern) {
                        lang.mixin(options, pattern);
                        if (format.indexOf("dateTime") == -1) //for dateTime, the selector should be null
                            options.selector = "date";
                    } else {
                        options.datePattern = format;
                        options.selector = "date";
                    }
                    options.locale = this.locale;
                    formatPatten = localeModule.getFormatPatten(options);
                } catch (e) {
                    console.log(e);
                }
            } catch (e) {

            }

            return formatPatten;
        },

        setLocale: function() {
            this.locale = pe.scene.locale || g_locale;
        }
    });

    return insertDate;
});
