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
    "dojo/query",
    "dojo/i18n!writer/nls/lang",
    "dojo/dom-attr",
    "dojo/_base/lang",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/on",
    "dojo/topic",
    "dijit/_Templated",
    "dijit/_Widget",
    "concord/util/BidiUtils",
    "dijit/registry",
    "dijit/focus"
], function(keys, query, i18nlang, domAttr, lang, i18nmenubar, declare, domClass, on, topic, _Templated, _Widget, BidiUtilsModule, registry, focusUtils) {

    var ListStyle = declare("writer.ui.widget.ListStyle", [_Widget, _Templated], {
        templates: {
            liststyle: {
                templateString: '<div class="hello_class"><table role ="presentation" cellspacing="0" cellpadding="0"><thead></thead><tbody><tr><td class="leftMost topMost"><ul class="circle" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td class="topMost"><ul class="square" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr><tr><td class="leftMost"><ul class="upper-roman" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr><tr><td class="leftMost"><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr></tbody></table><div></div></div>'
            },
            bulletList: {
                templateString: '<div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0" class="bulletList"><tbody><tr><td id="bullet_0" class="leftMost topMost"><p style="margin:0px; padding:0px;text-align: center;font-size: 9pt;">None</p></td><td id="bullet_1" class="topMost"><p><span>&#8226;</span></p></td><td id="bullet_2" class="topMost" > <p><span>&#9830;</span></p></td></tr><tr><td id="bullet_3" class="leftMost"><p><span >■</span></p></td><td id="bullet_4"><p><span > &#43;</span></p></td><td id="bullet_5"><p><span style="font-family:wingdings;">\uF076</span></p></td></tr><tr><td id="bullet_6" class="leftMost"><p><span>►</span></p></td><td id="bullet_7"><p><span >✔</span></p></td><td id="bullet_8"><p><span>➔</span></p></td></tr></tbody></table></div>'
            },
            numberList: {
                templateString: ' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="numbering_0" class="leftMost topMost" ><p><span>None</span></p></td><td id="numbering_1" class="topMost"><ul ><li>A.<span></span></li><li>B.<span></span></li><li>C.<span></span></li></ul></td><td id="numbering_2" class="topMost"><ul class="upper-alpha"><li>a.<span></span></li><li>b.<span></span></li><li>c.<span></span></li></ul></td></tr><tr><td id="numbering_3" class="leftMost"><ul><li>a)<span></span></li><li>b)<span></span></li><li>c)<span></span></li></ul></td><td id="numbering_4" ><ul><li>1.<span></span></li><li>2.<span></span></li><li>3.<span></span></li></ul></td><td id="numbering_5" ><ul ><li>1)<span></span></li><li>2)<span></span></li><li>3)<span></span></li></ul></td></tr><tr><td id="numbering_6" class="leftMost"><ul><li>1b<span></span></li><li>2b<span></span></li><li>3b<span></span></li></ul></td><td id="numbering_7" ><ul><li>I.<span></span></li><li>II.<span></span></li><li>III.<span></span></li></ul></td><td id="numbering_8" ><ul><li>i.<span></span></li><li>ii.<span></span></li><li>iii.<span></span></li></ul></td></tr></tbody></table></div>',
                templateStringArabic: ' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="numbering_0" class="leftMost topMost" ><p><span>None</span></p></td><td id="numbering_1" class="topMost"><ul ><li>A.<span></span></li><li>B.<span></span></li><li>C.<span></span></li></ul></td><td id="numbering_2" class="topMost"><ul class="upper-alpha"><li>a.<span></span></li><li>b.<span></span></li><li>c.<span></span></li></ul></td></tr><tr><td id="numbering_3" class="leftMost"><ul><li>a)<span></span></li><li>b)<span></span></li><li>c)<span></span></li></ul></td><td id="numbering_4" ><ul><li>1.<span></span></li><li>2.<span></span></li><li>3.<span></span></li></ul></td><td id="numbering_5" ><ul ><li>1)<span></span></li><li>2)<span></span></li><li>3)<span></span></li></ul></td></tr><tr><td id="numbering_6" class="leftMost"><ul><li>1b<span></span></li><li>2b<span></span></li><li>3b<span></span></li></ul></td><td id="numbering_7" ><ul><li>I.<span></span></li><li>II.<span></span></li><li>III.<span></span></li></ul></td><td id="numbering_8" ><ul><li>i.<span></span></li><li>ii.<span></span></li><li>iii.<span></span></li></ul></td></tr><tr><td id="numbering_9" ><ul><li>&#1633;.<span></span></li><li>&#1634;.<span></span></li><li>&#1635;.<span></span></li></ul></td><td id="numbering_10" ><ul><li>&#1633;)<span></span></li><li>&#1634;)<span></span></li><li>&#1635;)<span></span></li></ul></td></tr></tbody></table></div>'
            },
            multilevelList: {
                templateString: ' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="multiLevel_0" class="leftMost topMost" ><p><span>None</span></p></td><td  id="multiLevel_1" class="topMost"><ul class="upper-alpha"><li><span class="single-line">1<span></span></span><ul class="indent-first"><li><span class="single-line">1.1<span></span></span><ul class="indent-second"><li><span class="single-line">1.1.1<span></span></span></li></ul></li></ul></li></ul></td><td  id="multiLevel_2" class="topMost"><ul class="upper-alpha noindent-fix"><li><span class="single-line">1.<span></span></span><span class="single-line">1.1.<span></span></span><span class="single-line  noindent-fix">1.1.1.<span></span></span></li></ul></td></tr><tr><td id="multiLevel_3" class="leftMost"><ul class="lower-roman" ><li><span class="single-line">I.<span></span></span><ul class="indent-first"><li><span class="single-line">A.<span></span></span><ul class="indent-second"><li><span class="single-line">1.<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_4"><ul class="upper-roman"><li><span class="single-line">I. ${heading1}<span></span></span><ul class="indent-first"><li><span class="single-line">A. ${heading2}<span></span></span><ul class="indent-second"><li><span class="single-line">1. ${heading3}<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_5"><ul class="decimal noindent-fix"><li><span class="single-line">1 ${heading1}<span></span></span><span class="single-line">1.1 ${heading2}<span></span></span><span class="single-line">1.1.1 ${heading3}<span></span></span></li></ul></td></tr></tbody></table></div> ',
                templateStringArabic: ' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="multiLevel_0" class="leftMost topMost" ><p><span>None</span></p></td><td  id="multiLevel_1" class="topMost"><ul class="upper-alpha"><li><span class="single-line">1<span></span></span><ul class="indent-first"><li><span class="single-line">1.1<span></span></span><ul class="indent-second"><li><span class="single-line">1.1.1<span></span></span></li></ul></li></ul></li></ul></td><td  id="multiLevel_2" class="topMost"><ul class="upper-alpha noindent-fix"><li><span class="single-line">1.<span></span></span><span class="single-line">1.1.<span></span></span><span class="single-line  noindent-fix">1.1.1.<span></span></span></li></ul></td></tr><tr><td id="multiLevel_3" class="leftMost"><ul class="lower-roman" ><li><span class="single-line">I.<span></span></span><ul class="indent-first"><li><span class="single-line">A.<span></span></span><ul class="indent-second"><li><span class="single-line">1.<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_4"><ul class="upper-roman"><li><span class="single-line">I. ${heading1}<span></span></span><ul class="indent-first"><li><span class="single-line">A. ${heading2}<span></span></span><ul class="indent-second"><li><span class="single-line">1. ${heading3}<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_5"><ul class="decimal noindent-fix"><li><span class="single-line">1 ${heading1}<span></span></span><span class="single-line">1.1 ${heading2}<span></span></span><span class="single-line">1.1.1 ${heading3}<span></span></span></li></ul></td></tr><tr><td  id="multiLevel_6" class="topMost"><ul class="upper-alpha"><li><span class="single-line">&#1633;<span></span></span><ul class="indent-first"><li><span class="single-line">&#1633;.&#1633;<span></span></span><ul class="indent-second"><li><span class="single-line">&#1633;.&#1633;.&#1633;<span></span></span></li></ul></li></ul></li></ul></td><td  id="multiLevel_7" class="topMost"><ul class="upper-alpha noindent-fix"><li><span class="single-line">&#1633;.<span></span></span><span class="single-line">&#1633;.&#1633;.<span></span></span><span class="single-line  noindent-fix">&#1633;.&#1633;.&#1633;.<span></span></span></li></ul></td><td id="multiLevel_8" class="leftMost"><ul class="lower-roman" ><li><span class="single-line">I.<span></span></span><ul class="indent-first"><li><span class="single-line">A.<span></span></span><ul class="indent-second"><li><span class="single-line">&#1633;.<span></span></span></li></ul></li></ul></li></ul></td></tr><tr><td id="multiLevel_9"><ul class="upper-roman"><li><span class="single-line">I. ${headingArabic1}<span></span></span><ul class="indent-first"><li><span class="single-line">A. ${headingArabic2}<span></span></span><ul class="indent-second"><li><span class="single-line">&#1633;. ${headingArabic3}<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_10"><ul class="decimal noindent-fix"><li><span class="single-line">&#1633; ${headingArabic1}<span></span></span><span class="single-line">&#1633;.&#1633; ${headingArabic2}<span></span></span><span class="single-line">&#1633;.&#1633;.&#1633; ${headingArabic3}<span></span></span></li></ul></td></tr></tbody></table></div> '
            }
        },
        type: "liststyle",
        templateString: '',
        cells: null,
        focusIndex: 0,
        focusNode: null,
        containerNode: null,
        defaultTimeout: 500,
        timeoutChangeRate: 0.90,
        tabIndex: "0",
        listMap: {
            "bullet": ['none', 'circle', 'diamond', 'square', 'plus', 'fourDiamond', 'rightArrow', 'checkMark', 'thinArrow'],
            "numbering": ['none', 'upperLetter', 'lowerLetter', 'lowerLetterParenthesis', 'decimal', 'decimalParenthesis', 'decimalB', 'upperRoman', 'lowerRoman', 'decimalArabic', 'decimalArabicParenthesis'],
            "multiLevel": ['none', 'mulNum1', 'mulNum2', 'upperRoman', 'romanHeading', 'numHeading', 'mulNumArabic1', 'mulNumArabic2', 'upperRomanArabic', 'romanHeadingArabic', 'numHeadingArabic']
        },
        defaultNumberingsIndex: {
            "none": 0,
            "upperLetter": 1,
            "lowerLetter": 2,
            "lowerLetterParenthesis": 3,
            "decimal": 4,
            "decimalParenthesis": 5,
            "decimalB": 6,
            "upperRoman": 7,
            "lowerRoman": 8,
            "decimalArabic": 9,
            "decimalArabicParenthesis": 10
        },
        defaultBulletsIndex: {
            "none": 0,
            "circle": 1,
            "diamond": 2,
            "square": 3,
            "plus": 4,
            "fourDiamond": 5,
            "rightArrow": 6,
            "checkMark": 7,
            "thinArrow": 8
        },
        getIndex: function(type, isNumbering) {
            if (isNumbering)
                return this.defaultNumberingsIndex[type];
            else
                return this.defaultBulletsIndex[type];
        },
        constructor: function() {},
        postMixInProperties: function() {
            var nls = i18nlang;
            var noneStr = nls.list_none;

            if (BidiUtils.isArabicLocale() && (this.type == "numberList" || this.type == "multilevelList"))
            	this.templateString = this.templates[this.type].templateStringArabic.replace("None", noneStr);
            else
            	this.templateString = this.templates[this.type].templateString.replace("None", noneStr);

            var menuNls = i18nmenubar;
            this.heading1 = menuNls.formatMenu_Heading1;
            this.heading2 = menuNls.formatMenu_Heading2;
            this.heading3 = menuNls.formatMenu_Heading3;
            if (BidiUtils.isArabicLocale()) {
            	this.headingArabic1 = BidiUtils.convertArabicToHindi(menuNls.formatMenu_Heading1);
            	this.headingArabic2 = BidiUtils.convertArabicToHindi(menuNls.formatMenu_Heading2);
            	this.headingArabic3 = BidiUtils.convertArabicToHindi(menuNls.formatMenu_Heading3);
            }
        },
        buildRendering: function() {
            this.inherited(arguments);
        },
        postCreate: function() {
            this.inherited(arguments);
            if (!this.containerNode) return;
            this.cells = query("td", this.containerNode)
                .onmouseover(lang.hitch(this, this.onMouseOver))
                .onmouseout(lang.hitch(this, this.onMouseOut))
                .onclick(lang.hitch(this, this.onClick));

            var keyIncrementMap = {
                UP_ARROW: -3,
                // The down key the index is increase by the x dimension.
                DOWN_ARROW: 3,
                // Right and left move the index by 1.
                RIGHT_ARROW: this.isLeftToRight() ? 1 : -1,
                LEFT_ARROW: this.isLeftToRight() ? -1 : 1
            };

            on(this.containerNode, "keypress", lang.hitch(this, function(evt) {
                if (evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE || evt.charCode == keys.TAB || evt.keyCode == keys.TAB)
                    return;

                var navKey = false;
                for (var key in keyIncrementMap) {
                    var charOrCode = keys[key];
                    if (charOrCode == evt.charCode || charOrCode == evt.keyCode) {
                        var increment = keyIncrementMap[key];
                        this._navigateByKey(increment);
                        navKey = true;
                        break;
                    }
                }
                if (!navKey) {
                    if (evt.charCode == keys.SPACE || evt.keyCode == keys.SPACE || evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER) {
                        //press space, enter
                        this.changeList();
                    }
                }

                evt.preventDefault(), evt.stopPropagation();
            }));
            this._setCurrent(this.cells[0]);
        },
        _navigateByKey: function(increment) {
            if (!increment) return;
            var newIndex = this.focusIndex + increment;
            if (newIndex < 0 || newIndex >= this.cells.length) return;

            this._setCurrent(this.cells[newIndex]);
            setTimeout(lang.hitch(this, "focus"), 0);
            this.focusIndex = newIndex;
        },
        _setCurrent: function(node) {
            this.focusNode && this.changeStyle(this.focusNode, true);
            this.focusNode = node;
            this.changeStyle(this.focusNode, false);
            if (node)
                domAttr.set(node, "tabIndex", this.tabIndex);
            this.announceSelection();
        },
        focus: function() {
            focusUtils.focus(this.focusNode);
        },
        announceSelection: function() {
            var targetNode = this.focusNode;
            if (targetNode) {
                var ids = targetNode.id.split('_');
                var style = this.listMap[ids[0]][ids[1]];
                pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(style);
            }
        },
        onOpen: function() {
            this.inherited(arguments);
            if (window.BidiUtils.isBidiOn()) {
                if (registry.byId("D_t_Direction").iconClass == "cke_button_bidirtl" && (this.type == "numberList" || this.type == "multilevelList"))
                    domClass.add(this.domNode, 'rtl');
                else
                    domClass.remove(this.domNode, 'rtl');
            }
            if (this.type == "multilevelList") {
                var romanOutline = this.cells[this.cells.length - 2];
                var numOutline = this.cells[this.cells.length - 1];

                if (pe.lotusEditor.isContentEditing()) {
                    domClass.remove(romanOutline, 'DisabledItem');
                    domClass.remove(numOutline, 'DisabledItem');
                } else {
                    // Disable heading outline item
                    domClass.add(romanOutline, 'DisabledItem');
                    domClass.add(numOutline, 'DisabledItem');
                }
                this.announceSelection();
            }
        },
        onMouseOver: function(evt) {
            this.changeStyle(evt.target, false);
        },
        onMouseOut: function(evt) {
            this.changeStyle(evt.target, true);
        },
        onChange: function( /*===== value =====*/ ) {
            // summary:
            //		Callback when a cell is selected.
            // value: String
            //		Value corresponding to cell.
        },
        changeList: function() {
            var targetNode = this.focusNode;
            var ids = targetNode.id.split('_');
            this.focusIndex = parseInt(ids[1]);
            var style = this.listMap[ids[0]][ids[1]];

            if (this.type == "multilevelList" && !pe.lotusEditor.isContentEditing()) {
                if (domClass.contains(targetNode, "DisabledItem"))
                    return;
                //			if(style == "romanHeading" || style == "numHeading")
                //				return;
            }

            this.onChange();


            // TODO ugly method to record the click type.
            // Use a event to notify is better.
            pe.lotusEditor["default" + ids[0]] = style;

            pe.lotusEditor.execCommand(ids[0], {
                "numbering": style,
                "onOff": false
            });
        },

        onClick: function(evt) {
            var targetNode = this.getTargetNode(evt.target);
            this._setCurrent(targetNode);

            this.changeList();
        },
        changeStyle: function(node, isRemove) {
            var target = this.getTargetNode(node),
                helperLeft = this.getHelperNodeLeft(target),
                helperTop = this.getHelperNodeTop(target);
            if (isRemove) {
                domClass.remove(target, 'ItemHover');
                if (helperLeft) domClass.remove(helperLeft, 'ItemHoverHelperLeft');
                else domClass.remove(target, 'ItemHoverLeft');
                if (helperTop) domClass.remove(helperTop, 'ItemHoverHelperTop');
                else domClass.remove(target, 'ItemHoverTop');
            } else {
                domClass.add(target, 'ItemHover');
                if (helperLeft) domClass.add(helperLeft, 'ItemHoverHelperLeft');
                else domClass.add(target, 'ItemHoverLeft');
                if (helperTop) domClass.add(helperTop, 'ItemHoverHelperTop');
                else domClass.add(target, 'ItemHoverTop');
            }
        },
        getTargetNode: function(n /* node the mouse over on */ ) {
            while (n && "TD" !== n.tagName.toUpperCase()) {
                n = n && n.parentNode;
            }
            return n;
        },
        getHelperNodeLeft: function(target /* target td element */ ) {
            if (!target) return null;
            var prevTd = target.previousSibling;
            if (prevTd)
                return prevTd;
            else
                return null;
        },
        getHelperNodeTop: function(target /* target td element */ ) {
            if (!target)
                return null;
            var tmp = target,
                idx = 0;
            while (tmp.previousSibling) {
                tmp = tmp.previousSibling;
                idx++;
            }
            var prevTr = tmp.parentNode.previousSibling;
            /* not the first row of the table */
            if (prevTr) {
                return prevTr.children[idx];
            } else
                return null;
        }
    });
    return ListStyle;
});
