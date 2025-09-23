/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/Tooltip",
    "dojo/aspect",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/string",
    "dojo/date/locale",
    "writer/global",
    "writer/track/trackChange",
    "writer/ui/sidebar/TrackChangeTimeTooltip",
    "dojo/i18n!writer/nls/track"
],
    function (_Widget, _Templated, Tooltip, aspect, lang, declare, array, domConstruct, domClass, domAttr, on, string, dateLocale, g, trackChange, TrackChangeTimeTooltip, nls) {

        var Chooser = declare("writer.ui.sidebar.TrackChangeTimeChooser", [_Widget, _Templated], {

            templateString: "<div class='track_change_time_chooser'></div>",

            selectDotIndex: -1,

            buildRendering: function () {
                this.nls = nls;
                var today = new Date();
                today.setHours(0); today.setMinutes(0); today.setSeconds(0);
                this.lastVisitDay = (today.getTime() - trackChange.lastVisitTime) / (1000 * 60 * 60 * 24);
                this.createDay = (today.getTime() - trackChange.createTime) / (1000 * 60 * 60 * 24);
                console.info(this.lastVisitDay + " " + this.createDay);
                this.inherited(arguments);
            },

            _buildDot: function (extraClasses, color) {
                var dotWrapper = domConstruct.create("div", { className: "dotWrapper " + extraClasses || "", tabindex: 0, id: extraClasses || ""});
                var tooltip = this.getTooltipDesc(dotWrapper);
                domAttr.set(dotWrapper, "tooltip", tooltip);
                if (tooltip != "")
                	domAttr.set(dotWrapper, "aria-label", tooltip + ". " + this.nls.panel_dot_aria_label);
                domConstruct.create("div", { className: "dot " + "dot_" + color}, dotWrapper);
                return dotWrapper;
            },

            _builLine: function () {
                return domConstruct.create("div", { className: "line" });
            },

            getStartTime: function (dot) {
                if (!dot)
                    return 0;

                if (domClass.contains(dot, "dot_all"))
                    return 0;

                if (domClass.contains(dot, "dot_last"))
                    return trackChange.lastVisitTime;

                var date = new Date();
                date.setHours(0); 
                date.setMinutes(0); 
                date.setSeconds(0);

                if (domClass.contains(dot, "dot_7days"))
                    date.setDate(date.getDate() - 7);
                else if (domClass.contains(dot, "dot_30days"))
                    date.setDate(date.getDate() - 30);

                return date.getTime();
            },

            getDesc: function (dot) {
                if (!dot)
                    return nls.panel_time_today;
                if (domClass.contains(dot, "dot_today"))
                    return nls.panel_time_today;
                if (domClass.contains(dot, "dot_7days"))
                    return nls.panel_time_7days;
                if (domClass.contains(dot, "dot_30days"))
                    return nls.panel_time_30days;
                if (domClass.contains(dot, "dot_all"))
                    return nls.panel_time_all;
                if (domClass.contains(dot, "dot_last"))
                    return nls.panel_time_last;
            },

            getTooltipDesc: function (dot) {
                if (!dot)
                    return nls.panel_slider_today;
                if (domClass.contains(dot, "dot_now"))
                    return "";
                if (domClass.contains(dot, "dot_today"))
                    return nls.panel_slider_today;
                if (domClass.contains(dot, "dot_7days")) {
                    if (BidiUtils.isArabicLocale())
                    	return BidiUtils.convertArabicToHindi(nls.panel_slider_7days);
                    else
                        return (BidiUtils.isBidiOn() ? (BidiUtils.RLE + nls.panel_slider_7days) : nls.panel_slider_7days);
                }
                if (domClass.contains(dot, "dot_30days")) {
                    if (BidiUtils.isArabicLocale())
                    	return BidiUtils.convertArabicToHindi(nls.panel_slider_30days);
                    else
                        return (BidiUtils.isBidiOn() ? (BidiUtils.RLE + nls.panel_slider_30days) : nls.panel_slider_30days);
                }
                if (domClass.contains(dot, "dot_all"))
                {
                	return nls.panel_slider_show_all;
//                     var time = dateLocale.format(new Date(trackChange.createTime), {
//                        selector: "date",
//                        formatLength: "short"
//                    });
//                    return string.substitute(nls.panel_slider_all, [time]);
                }
                if (domClass.contains(dot, "dot_last")) {
                    var time = dateLocale.format(new Date(trackChange.lastVisitTime), {
                        selector: "date",
                        formatLength: "short"
                    });
                    if (BidiUtils.isArabicLocale()) {
                    	time = BidiUtils.RLE + BidiUtils.adjustArabicDate(time) + BidiUtils.PDF;
                    }

                    var ret = string.substitute(nls.panel_slider_last, [time]);
                    if (BidiUtils.isBidiOn()) {
                        ret = BidiUtils.RLE + ret;					
                    }					
                    return ret;
                }
            },

            onChange: function (time, desc, showAll) {
                // stub to be connected.
            },

            reset: function() {
            	this.setSelectDotIndex(this.defaultIndex);
            },

            setSelectDotIndex: function (index) {
                if (index == 0)
                    return;
                if (this.selectDotIndex == index)
                    return;
                this.selectDotIndex = index;
                this.lines.forEach(function (line, lineIndex) {
                    if (lineIndex < index)
                        domClass.add(line, "selected");
                    else
                        domClass.remove(line, "selected");
                });
                this.dots.forEach(lang.hitch(this, function (dot, dotIndex) {
                	var tooltip = this.getTooltipDesc(dot);
                    if (dotIndex == index) {
                        domClass.add(dot, "selected");
                    	domAttr.set(dot, "aria-label", tooltip + ". " + this.nls.panel_dot_aria_label + " selected");
        				dijit.Tooltip.hide(dot);
                    }
                    else {
                        domClass.remove(dot, "selected");
                        domAttr.set(dot, "aria-label", tooltip + ". " + this.nls.panel_dot_aria_label);
                    }

                    if (dotIndex < index)
                        domClass.add(dot, "covered");
                    else
                        domClass.remove(dot, "covered");
                }));
                var dot = this.dots[this.selectDotIndex];
                var showAll = dot && domClass.contains(dot, "dot_all");
                
                this.onChange(this.getStartTime(dot), this.getDesc(dot), showAll);
                this.showTooltip(dot);
            },
			
			isLastVisitSelected: function(){
            	return (this.getSelectedDotType() == "lastvisit");
            },

            getSelectedDotType: function() {
            	var dot = this.dots[this.selectDotIndex];
            	if(!dot)
            		return "today";
                if (domClass.contains(dot, "dot_today"))
                    return "today";
                if (domClass.contains(dot, "dot_7days"))
                    return "7days";
                if (domClass.contains(dot, "dot_30days"))
                    return "30days";
                if (domClass.contains(dot, "dot_last"))
                	return "lastvisit";
                if (domClass.contains(dot, "dot_all"))
                	return "all";

            	return "today"; 
            },

            buildDotsLines: function () {
                // today, 7 days, 30 days, all.
                // [0, - 10%, - lastVisit - 20%, - 40%, - 100%]
                var has7days = this.createDay > 6;
                var has30days = this.createDay > 30;
                
                // lastVisitTime may be 0, first time logged in.
                var needLast = ((!trackChange.isNewUserTrackSession) && (trackChange.lastVisitTime > 0));
                var now = this._buildDot("dot_now", "now");
                var today = this._buildDot("dot_today", "blue");
                var _7days = this._buildDot("dot_7days", "blue");
                var _30days = this._buildDot("dot_30days", "blue");
                var alldays = this._buildDot("dot_all", "blue");
                var lastday = this._buildDot("dot_last", "red");

                var coords = [];
                var defaultIndex = 1;
                if (!needLast) {
                    coords = [0, 10];
                    this.dots = [now, today];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(today);
                    if (has7days) {
                        coords.push(40);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                    	defaultIndex ++;
                    }
                    if (has30days) {
                        coords.push(65);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                    	defaultIndex ++;
                    }
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                	defaultIndex ++;
                } else if (this.lastVisitDay <= 0) {
                    coords = [0, 10, 20];
                    this.dots = [now, lastday, today];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(lastday);
                    this.domNode.appendChild(today);
                    if (has7days) {
                        coords.push(40);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                    }
                    if (has30days) {
                        coords.push(65);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                    }
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                } else if (this.lastVisitDay <= 1) {
                    coords = [0, 10, 20];
                    defaultIndex = 2;
                    this.dots = [now, today, lastday];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(today);
                    this.domNode.appendChild(lastday);
                    if (has7days) {
                        coords.push(40);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                    }
                    if (has30days) {
                        coords.push(65);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                    }
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                } else if (this.lastVisitDay <= 7) {
                    coords = [0, 10, 25];
                    defaultIndex = 2;
                    this.dots = [now, today, lastday];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(today);
                    this.domNode.appendChild(lastday);
                    if (has7days) {
                        coords.push(40);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                    }
                    if (has30days) {
                        coords.push(65);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                    }
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                } else if (this.lastVisitDay <= 30) {
                    coords = [0, 10];
                    defaultIndex = 2;
                    this.dots = [now, today];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(today);
                    if (has7days) {
                        coords.push(30);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                        defaultIndex ++;
                    }
                    coords.push(50);
                    this.dots.push(lastday);
                    this.domNode.appendChild(lastday);
                    if (has30days) {
                        coords.push(70);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                    }
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                } else {
                    coords = [0, 10];
                    defaultIndex = 2;
                    this.dots = [now, today];
                    this.domNode.appendChild(now);
                    this.domNode.appendChild(today);
                    if (has7days) {
                        coords.push(30);
                        this.dots.push(_7days);
                        this.domNode.appendChild(_7days);
                        defaultIndex ++;
                    }
                    if (has30days) {
                        coords.push(50);
                        this.dots.push(_30days);
                        this.domNode.appendChild(_30days);
                        defaultIndex ++;
                    }
                    coords.push(70);
                    this.dots.push(lastday);
                    this.domNode.appendChild(lastday);
                    coords.push(100);
                    this.dots.push(alldays);
                    this.domNode.appendChild(alldays);
                }
                this.defaultIndex = defaultIndex;
                var am = 0;
                var len = coords.length;
                for (var x = 0; x < len - 1; x++) {
                    var line = this._builLine();
                    this.domNode.appendChild(line);
                    var width = coords[x + 1] - coords[x];
                    line.style.width = width + "%";
                    if (BidiUtils.isGuiRtl())
                    	line.style.right = am + "%";
                    else
                    	line.style.left = am + "%";
                    this.lines.push(line);
                    am += width;
                    if (BidiUtils.isGuiRtl())
                    	this.dots[x].style.right = coords[x] + "%";
                    else
                    	this.dots[x].style.left = coords[x] + "%";
                }
                if (BidiUtils.isGuiRtl())
                	this.dots[len - 1].style.right = coords[len - 1] + "%";
                else
                	this.dots[len - 1].style.left = coords[len - 1] + "%";
                var me = this;
                array.forEach(this.dots, function (dot, i) {
                    on(dot, "click", function () {
                        me.setSelectDotIndex(i);
                    });
                    on(dot, "keydown", function (e) {
                    	e = e || window.event;
                 		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
                 			me.setSelectDotIndex(i);
                 		}
                        
                    });
                });
            },
            
            setDijitTooltip: function() {
            	if (!this.dots)
            		return;
            	for (var i = 0; i < this.dots.length; ++i) {
            		dojo.connect(this.dots[i], "onfocus", dojo.hitch(this, function(evt){
            			var tooltip = domAttr.get(evt.target, "tooltip");
            			if (tooltip != "" && !domClass.contains(evt.target, "selected"))
            				dijit.Tooltip.show(tooltip, evt.target, ["below"]);
        			}));
                	dojo.connect(this.dots[i], "onblur", dojo.hitch(this, function(evt){
        				dijit.Tooltip.hide(evt.target);
        			}));
                	dojo.connect(this.dots[i], "onmouseenter", dojo.hitch(this, function(evt){
                		var target = evt.target;
                		if (!domClass.contains(evt.target, "dotWrapper") && domClass.contains(evt.target, "dot"))
                			target = evt.target.parentNode;
            			var tooltip = domAttr.get(target, "tooltip");
            			if (tooltip != "" && !domClass.contains(target, "selected"))
            				dijit.Tooltip.show(tooltip, target, ["below"]);
        			}));
                	dojo.connect(this.dots[i], "onmouseleave", dojo.hitch(this, function(evt){
                		var target = evt.target;
                		if (!domClass.contains(evt.target, "dotWrapper") && domClass.contains(evt.target, "dot"))
                			target = evt.target.parentNode;
        				dijit.Tooltip.hide(target);
        			}));
            	}
            },

            refreshTooltip: function () {
                var dot = this.dots[this.selectDotIndex];
                if (dot)
                    this.showTooltip(dot);
            },

            showTooltip: function (dot) {
                if (!dot)
                    return;
                if (this._tooltip)
                    this._tooltip.destroy();
                this._tooltip = new TrackChangeTimeTooltip({ title: this.getTooltipDesc(dot), colorClass: (domClass.contains(dot, "dot_last") ? "red" : "blue") });
                this._currentHoverDot = dot;
                this._tooltip.show(this.domNode, dot);
            },

            hideTooltip: function () {
                if (this._tooltip)
                    this._tooltip.destroy();
            },

            postCreate: function () {
                this.inherited(arguments);
                this.dots = [];
                this.lines = [];
                this.buildDotsLines();
            }

        });
        return Chooser;
    });
