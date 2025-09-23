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
    "dojo/dom-geometry",
    "dojo/dom",
    "dojo/_base/declare",
    "dojo/fx",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/string",
    "dojo/i18n!writer/ui/dialog/nls/FindReplaceDlg",
    "dojo/topic",
    "writer/common/tools",
    "concord/editor/CharEquivalence",
    "concord/util/dialogs",
    "writer/constants",
    "writer/core/Range",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/ui/dialog/NewFindReplaceDlg",
    "writer/util/ModelTools",
    "dijit/registry"
], function(dojoGeo, dom, declare, fx, domStyle, langModule, has, dojoString, i18nFindReplaceDlg, topic, tools, CharEquivalence, dialogs, constants, Range, msgCenter, Plugin, NewFindReplaceDlg, ModelTools, registry) {

    var FindReplace = declare("writer.plugins.FindReplace", Plugin, {
        init: function() {
            var nls = i18nFindReplaceDlg;

            var kmpPartMatchArray = function(targetStr) {
                var aPartMatchTable = [];
                var tmpCompareLen = 0;
                var tmpPartMatchVal = 0;
                var prefix, suffix;
                for (var i = 0, j = targetStr.length; i < j; i++) {
                    if (i == 0) {
                        aPartMatchTable[i] = 0;
                        continue;
                    }
                    tmpCompareLen = i;
                    tmpPartMatchVal = 0;
                    for (; tmpCompareLen > 0; tmpCompareLen--) {
                        prefix = targetStr.substr(0, tmpCompareLen);
                        suffix = targetStr.substr(i - tmpCompareLen + 1, tmpCompareLen);
                        if (prefix == suffix) {
                            tmpPartMatchVal = prefix.length;
                            break;
                        }
                    }
                    aPartMatchTable[i] = tmpPartMatchVal;
                }
                return aPartMatchTable;
            };
            var kmpFinder = function(para, sourceStr, targetStr) {
                var sourceArray = [];
                var cloneSourceStr = sourceStr;
                sourceStr = "";
                var targetLength = targetStr.length;
                for (var l = 0; l < cloneSourceStr.length; l++) {
                    var decomposedChar = finder.charEQ.decompose_latin(cloneSourceStr.charAt(l));
                    if (finder.lang.indexOf('ja') != -1) {
                        decomposedChar = finder.charEQ.decompose_ja(decomposedChar);
                    }
                    sourceArray.push(decomposedChar);
                    sourceStr += decomposedChar;
                }
                targetStr = finder.charEQ.decompose_latin(targetStr);
                if (finder.lang.indexOf('ja') != -1) {
                    targetStr = finder.charEQ.decompose_ja(targetStr);
                }

                var results = [];
                var partMatchValue = kmpPartMatchArray(targetStr);
                var i, j, m, n;
                n = targetStr.length;
                for (i = 0, j = sourceStr.length; i <= j - n; i++) {
                    for (var m = 0; m < n; m++) {
                        if (targetStr.charAt(m) != sourceStr.charAt(i + m)) {
                            if ((m > 0) && (partMatchValue[m - 1] > 0)) {
                                i += (m - partMatchValue[m - 1] - 1);
                            }
                            break;
                        }
                    }
                    if (m == n) {
                        var start = 0,
                            preLength = 0;
                        while (sourceArray[start]) {
                            if (preLength + sourceArray[start].length >= (i + 1)) {
                                break;
                            }
                            preLength += sourceArray[start].length;
                            start++;
                        }
                        results.push({
                            'start': start,
                            'end': start + targetLength
                        });
                    }
                }
                delete sourceArray;
                var newResults = [],
                    result = null;
                for (var k = 0; k < results.length; k++) {
                    result = results[k];
                    if (newResults.length == 0 || (result.start >= newResults[newResults.length - 1].end))
                        newResults.push({
                            'start': result.start,
                            'end': result.end
                        });

                }
                return newResults;
            };
            /*
             * Get all the paragraphs in the doc, the first child is current focus paragraph
             */
            var normalizeAllParas = function() {
                var para, idx = 0,
                    doc = pe.lotusEditor.document;
                var range = finder.sel.getRanges()[0]; // Current range
                var startRange = range.getStartParaPos();
                if (!startRange)
                    para = doc.firstChild();
                else {
                    para = startRange.obj;
                    idx = startRange.index;
                }
                if (para.doc != doc)
                    doc = para.doc;
                var context = {};
                context['curPara'] = para;
                if (doc.modelType == constants.MODELTYPE.HEADERFOOTER) {
                    context['view'] = range.rootView;
                    finder.views = para.getAllViews();
                } else
                    context['view'] = pe.lotusEditor.layoutEngine.rootView; //	TODO Need check Header/footer
                // Sort all paragraphs
                var allParas = doc.getParagraphs();
                var curParaIndex = allParas.indexOf(para);
                context['preParaIndex'] = allParas.length - curParaIndex;
                if (curParaIndex > 0) {
                    var prefixObj = allParas.splice(0, curParaIndex);
                    allParas = allParas.concat(prefixObj);
                }

                context['paras'] = allParas;
                context['idx'] = idx;
                return context;
            };
            /*
             * get the match count before current focus match word in the same focus paragraph
             * only for the first searched paragraph has the move value
             */
            var getMoveValue = function(models, startIdx) {
                var moveValue = 0;
                for (var i = 0; i < models.length; i++) {
                    if (models[i].start >= startIdx) {
                        moveValue = i;
                        break;
                    }
                    if (models[i].start < startIdx && i == models.length - 1)
                        moveValue = models.length;
                }
                return moveValue;
            };
            /*
             * Find and return the match models in the paragraph
             */
            var getModelsFromPara = function(para, targetStr, matchCase, matchWord, view) {
                var sourceStr = para.getVisibleText();
                para.clearMatchModels();
                if (!matchCase) {
                	var preSourceStr = sourceStr;
                    sourceStr = sourceStr.toLowerCase();
                    // fix 45950
                    if (has("chrome") && sourceStr.length != preSourceStr.length) { // do matchCase find
                        sourceStr = preSourceStr;
                    } else {
                        targetStr = targetStr.toLowerCase();
                    }
                }
                var results = kmpFinder(para, sourceStr, targetStr);
                var isBreak = tools.isWordBreak;
                // Find match words
                var findResult = [],
                    result;
                for (var i = 0; i < results.length; i++) {
                    result = results[i];
                    if (!matchWord || ((result.start == 0 || isBreak(sourceStr, result.start - 1)) && (sourceStr.length == result.end || isBreak(sourceStr, result.end)))) {
                        findResult.push({
                            'para': para,
                            'start': para.getFullIndex(result.start),
                            'end': para.getFullIndex(result.end),
                            'view': view
                        }); //normalize run range by focus start index
                        para.pushFindResultModels(finder, findResult[findResult.length - 1]);
                    }
                }

                return findResult;
            };
            var modelToRange = function(model) {
                var start = {
                    "obj": model.para,
                    "index": model.start
                };
                var end = {
                    "obj": model.para,
                    "index": model.end
                };
                return new Range(start, end, model.view);
            };
            var modelsToRanges = function(models) {
                var ranges = [];
                var model = null,
                    start, end, curPageNum;
                if (finder.views) {
                    for (var ownerId in finder.views) {
                        for (var i = 0; i < models.length; i++) {
                            model = {}, model.para = models[i].para, model.start = models[i].start, model.end = models[i].end;
                            var len = finder.views[ownerId].len ? finder.views[ownerId].len : finder.views[ownerId].length();
                            for (var j = 0; j < len; j++) {
                                model.view = finder.views[ownerId].getByIndex(j);
                                ranges.push(modelToRange(model));
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < models.length; i++) {
                        model = models[i];
                        ranges.push(modelToRange(model));
                    }
                }
                return ranges;
            };
            /*
             * 1.toggle the focus index
             * 2.fix the match ranges if the replaced match ranges has content on navigate
             */
            var fixRangeForNavigation = function(direction) {
                if (direction == DIRECTION_PRE) {
                    if (finder.focusIndex == 0 && finder.replacedMatchModels.length > 0) {
                        var tempArray = [];
                        tempArray.push(finder.replacedMatchModels.pop());
                        tempArray = tempArray.concat(finder.matchModels);
                        finder.matchModels = tempArray;
                        tempArray = [];
                        finder.focusIndex = 1;
                    }
                    if (finder.focusIndex == -1)
                        finder.focusIndex = finder.matchModels.length;
                    finder.focusIndex -= 1;
                    if (finder.focusIndex < 0)
                        finder.focusIndex = 0;
                } else {
                    if (finder.replacedMatchModels.length > 0) {
                        finder.replacedMatchModels.push(finder.matchModels.shift());
                        finder.focusIndex = -1;
                    }
                    if (finder.focusIndex == finder.matchModels.length)
                        finder.focusIndex = -1;
                    finder.focusIndex += 1;
                    if (finder.focusIndex > finder.matchModels.length - 1)
                        finder.focusIndex = finder.matchModels.length - 1;
                }
            };
            /*
             * Fix the range for replace case for the first paragraph
             * 1. replace the 'unReplaced' ranges in the match ranges by refreshed ranges when the ranges before the 'unReplaced' ranges at the start paragraph is replacing.
             * 2. replace the 'replaced' ranges in the replaced match ranges by refreshed ranges when  the ranges before the 'replaced' ranges at the start paragraph is replacing.
             */
            var fixModelAfterReplace = function(ranges, replaces, currModel, idx) {

                if (finder.focusIndex + finder.matchBeforeFocus < finder.matchModels.length) {
                    // focus in the paragraph which order is not moved
                    finder.matchBeforeFocus += finder.focusIndex;
                } else {
                    // focus in the paragpah which order is moved
                    finder.matchBeforeFocus = (finder.matchBeforeFocus + finder.focusIndex) % finder.matchModels.length;
                }
                var tempArray = finder.matchModels.splice(finder.focusIndex);
                tempArray = tempArray.concat(finder.matchModels);
                while (tempArray.length > 0) {
                    if (tempArray[0].para.id != currModel.para.id ||
                        tempArray[0].start < idx)
                        break;
                    else
                        tempArray.shift();
                }

                finder.matchModels = ranges.concat(tempArray);

                // For replace
                if (finder.matchModels.length == 0) {
                    finder.state = FINISHFIND;
                    while (finder.replacedMatchModels.length > 0) {
                        if (finder.replacedMatchModels[0].para.id == currModel.para.id &&
                            finder.replacedMatchModels[0].start > idx)
                            finder.replacedMatchModels.shift();
                        else
                            break;
                    }
                    finder.replacedMatchModels = replaces.concat(finder.replacedMatchModels);
                }
            };
            /*
             * re-find the word in each paragraph when press replace button
             */
            var refindInPara = function(currModel, text, matchCase, matchWord, idx, length) {
                var currPara = currModel.para;
                var view = currModel.view;
                // get all match models in the paragraph
                var models = getModelsFromPara(currPara, text, matchCase, matchWord, view);
                //Get the refreshed 'replaced' ranges in the replaced match ranges when  the ranges before the 'replaced' ranges at the same paragraph has been replaced.
                var replaces = [];
                if (finder.replacedMatchModels.length > 0 &&
                    finder.replacedMatchModels[0].para.id == currModel.para.id &&
                    idx < finder.replacedMatchModels[0].start + finder.newText.length - length) {
                    replaces = models.splice(models.length - finder.replacedBoundaryCount);
                }
                // appends contains all the match ranges in the new text, it should be append to replaceMatchRanges directly
                var appends = [];
                while (models.length > 0) {
                    if (models[0].start < idx)
                        models.shift();
                    else if (models[0].start >= idx &&
                        models[0].start < idx + finder.newText.length)
                        appends.push(models.shift());
                    else
                        break;
                }
                if (finder.replacedMatchModels.length == 0)
                    finder.replacedBoundaryCount = models.length + 1;
                finder.replacedMatchModels = finder.replacedMatchModels.concat(appends);

                fixModelAfterReplace(models, replaces, currModel, idx);
                finder.focusIndex = 0;
            };
            /*
             * This function will initial the find/replace variables after replace the last range in the match ranges
             * The replacedMatchModels will be copied to matchRanges
             */
            var handleReplaceFinished = function() {
                if (finder.state == FINISHFIND) {
                    topic.publish(constants.EVENT.SHOWTOTALNUM, finder.focusIndex, finder.matchBeforeFocus, finder.matchModels.length);

                    if (finder.replacedMatchModels.length > 0) {
                        finder.matchModels = finder.replacedMatchModels;
                        finder.replacedMatchModels = [];
                        finder.state = KMP_MATCHED;
                        finder.focusIndex = -1;
                    } else
                        finder.state = KMP_NOTFOUND;
                    finder.sel && finder.sel.removeHighlight();
                    finder.alert(nls.finishSearch);
                    finder.isReplacing = false;
                    return FINISHFIND;
                }
            };
            var getMatchModels = function(targetStr, matchCase, matchWord) {
                //get match array
                //normalize all paragraphs in the document
                var objs = normalizeAllParas();
                var startIdx = objs.idx;
                var preParaIndex = objs.preParaIndex;
                var matchBeforeFocus = 0;
                var models = [],
                    moveValue = 0,
                    ranges = [];
                for (var j = 0; j < objs.paras.length; j++) {
                    try {
                        //								 models = models.concat(getModelsFromPara(objs.paras[j],targetStr,matchCase,matchWord,objs.view));
                        var subModels = getModelsFromPara(objs.paras[j], targetStr, matchCase, matchWord, objs.view);
                        for (var i = 0; i < subModels.length; i++) {
                            models.push(subModels[i]);
                        }
                        if (j >= preParaIndex) {
                            matchBeforeFocus += subModels.length;
                        }
                        if (startIdx > 0) {
                            if (objs.curPara.id == objs.paras[j].id)
                                moveValue = getMoveValue(models, startIdx);
                            startIdx = 0;
                            matchBeforeFocus += moveValue;
                        }
                    } catch (e) {
                        console.warn('search word in paragraph has error,' + e);
                    }
                }
                if (matchBeforeFocus == models.length) {
                    matchBeforeFocus = 0;
                }

                if (moveValue > 0 && models.length > 1) {
                    var newModels = models.splice(moveValue);
                    models = newModels.concat(models);
                }

                //create ranges for each of match models
                return {
                    "models": models,
                    "matchBeforeFocus": matchBeforeFocus
                };
            };
            var clearParaMatchModels = function(models) {
                var para;
                for (var i = 0; i < models.length; i++) {
                    para = models[i].para;
                    para.clearMatchModels();
                }
            };
            var KMP_NOSTARTTOMATCH = 0,
                KMP_NOTFOUND = 1,
                KMP_MATCHED = 2,
                FINISHFIND = 3,
                DIRECTION_PRE = 'pre',
                DIRECTION_NEXT = 'next',
                INITVALUE = -2; // Not start find yet.
            FINDWITHOUTNAVIGATOR = -3;
            var finder = {

                focusIndex: INITVALUE,
                matchModels: [], // all the finded match ranges
                lang: g_locale || navigator.userLanguage || navigator.language,
                state: KMP_NOSTARTTOMATCH,
                sel: null,
                range: null,
                charEQ: new CharEquivalence,
                lang: g_locale || navigator.userLanguage || navigator.language,
                text: null,
                matchCase: false,
                matchWord: false,
                highlightAll: false,
                newText: null,
                replacedMatchModels: [], // all the finded match ranges in the replaced new text.
                replacedBoundaryCount: 0, // the count all the replaced ranges after the start postion at the started paragraph
                views: null,
                find: function(targetStr, matchCase, matchWord, highlightAll, scroll) {
                    if (this.text && (this.text != targetStr || this.matchCase != matchCase || this.matchWord != matchWord))
                        this.clear();
                    if (this.state == KMP_NOTFOUND)
                        return;
                    else if (this.state == KMP_NOSTARTTOMATCH) {
                        this.text = targetStr;
                        this.matchCase = matchCase;
                        this.matchWord = matchWord;
                        this.highlightAll = highlightAll;
                        //get all matched ranges according the parameters
                        var matchResult = getMatchModels(targetStr, matchCase, matchWord);
                        this.matchModels = matchResult.models;
                        this.matchBeforeFocus = matchResult.matchBeforeFocus;
                        topic.publish(constants.EVENT.SHOWTOTALNUM, this.focusIndex, this.matchBeforeFocus, this.matchModels.length);
                        if (this.matchModels.length == 0) {
                            this.state = KMP_NOTFOUND;
                            return;
                        }
                        this.state = KMP_MATCHED;
                        //set focus for current range
                        this.focusIndex = 0;
                        this.highlight(highlightAll, scroll, true);
                    }
                    delete pe.lotusEditor.findTimer;

                },
                navigate: function(direction, highlightAll) {
                    this.highlightAll = highlightAll;
                    if (this.state == KMP_NOTFOUND)
                        return;
                    fixRangeForNavigation(direction); // Will change focus Index.
                    if (this.focusIndex < 0)
                        finder.focusIndex = 0;
                    range = modelToRange(this.matchModels[this.focusIndex]);
                    this.sel.destroy();
                    this.sel.addRanges(range);
                    this.sel.scrollIntoView();
                    this.sel.selectRanges([range], true);
                    if (!highlightAll)
                        this.sel.highlightRanges([range]);
                    topic.publish(constants.EVENT.SHOWTOTALNUM, this.focusIndex, this.matchBeforeFocus, this.matchModels.length);;
                },
                clear: function() {
                    if (finder.sel)
                        finder.sel.removeHighlight();
                    clearParaMatchModels(finder.matchModels);
                    clearParaMatchModels(finder.replacedMatchModels);
                    finder.matchModels = [];
                    finder.replacedMatchModels = [];
                    finder.focusIndex = INITVALUE;
                    finder.state = KMP_NOSTARTTOMATCH;
                    finder.text = null;
                    finder.newText = null;
                    finder.matchCase = false;
                    finder.matchWord = false;
                    finder.replacedBoundaryCount = 0;
                    finder.views = null;
                },
                highlight: function(highlightAll, scroll, bNotFocus) {
                    this.highlightAll = highlightAll;
                    if (highlightAll && finder.replacedMatchModels.length > 0) {
                        finder.focusIndex += finder.replacedMatchModels.length;
                        finder.replacedMatchModels = finder.replacedMatchModels.concat(finder.matchModels);
                        finder.matchModels = finder.replacedMatchModels;
                        finder.replacedMatchModels = [];
                    }
                    if (finder.matchModels.length == 0) {
                        this.sel.removeHighlight();
                        return;
                    }
                    var highlights = [];
                    var range;
                    var focusIndex = this.focusIndex == FINDWITHOUTNAVIGATOR ? 0 : this.focusIndex;

                    if (highlightAll) {
                        highlights = modelsToRanges(this.matchModels.slice(0));
                        range = highlights[focusIndex];
                    } else {
                        range = modelToRange(this.matchModels[focusIndex]);
                        highlights = [range];
                    }
                    if (range) {
                        if (scroll) {
                            this.sel.destroy();
                            this.sel.addRanges(range);
                            this.sel.scrollIntoView();
                        }
                        if (!bNotFocus) {
                            this.sel.selectRanges([range], true);
                        } else
                            this.focusIndex = FINDWITHOUTNAVIGATOR;
                        this.sel.highlightRanges(highlights, range);
                    }

                },
                alert: function(msg) {
                    var callback = function() {
                        topic.publish(constants.EVENT.FOCUSBACKFINDDLG);
                    };
                    dialogs.alert(msg, callback, {
                        "editorFocusNotback": true
                    });
                },
                /**
                 * Record how much replacement occurred toward one replacing.
                 */
                replaceCounter: 0,

                /**
                 * Record how much action toward one replacing.
                 */
                msgList: [],
                replace: function(newStr, matchCase, matchWord) {
                    topic.publish(constants.EVENT.GROUPCHANGE_START);
                    pe.lotusEditor.isReplacing = true;
                    //replace text in current selected range
                    this.newText = newStr;
                    var currModel = this.matchModels[this.focusIndex];
                    var idx = currModel.start;
                    var length = currModel.end - currModel.start;
                    if (this.newText.length == 0)
                        pe.lotusEditor.getShell().deleteText();
                    else
                        pe.lotusEditor.getShell().insertText(this.newText, true);

                    // request spell check
                    topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, currModel.para, newStr, currModel.start, true);
                    topic.publish(constants.EVENT.GROUPCHANGE_END);

                    // strip the replaced range from current models
                    refindInPara(currModel, this.text, matchCase, matchWord, idx, length);
                    //restore the replacedMatchModels to matchRanges when replaced all the file.
                    if (handleReplaceFinished() == FINISHFIND)
                        return;

                    //highlight the models and move cursor to next range
                    var range = modelToRange(this.matchModels[0]);
                    this.sel.destroy();
                    this.sel.addRanges(range);
                    this.sel.scrollIntoView();
                    this.sel.selectRanges([range], true);
                    this.sel.highlightRanges([range]);
                    pe.lotusEditor.isReplacing = false;
                    topic.publish(constants.EVENT.SHOWTOTALNUM, this.focusIndex, this.matchBeforeFocus, this.matchModels.length);
                },
                replaceAll: function(newStr, matchCase, matchWord) {
                    finder.sel && finder.sel.removeHighlight();
                    pe.lotusEditor.isReplacingAll = true;
                    msgCenter.beginRecord();
                    try {
                        topic.publish(constants.EVENT.GROUPCHANGE_START);
                        //sort the matchModels
                        while (this.matchModels[this.matchModels.length - 1].para.id == this.matchModels[0].para.id &&
                            this.matchModels[0].start > this.matchModels[this.matchModels.length - 1].start) {
                            this.matchModels.push(this.matchModels.shift());
                        }
                        this.sel.destroy();
                        this.sel.addRanges(modelToRange(this.matchModels[0]));
                        var paraId = this.matchModels[0].para.id;
                        var models, totalCount = this.matchModels.length;
                        while (this.matchModels.length > 0) {
                            try {
                                var shiftCount = -1;
                                //replace text in current selected range
                                this.newText = newStr;
                                if (this.newText.length == 0)
                                    pe.lotusEditor.getShell().deleteText();
                                else
                                    pe.lotusEditor.getShell().insertText(this.newText, true);

                                var para = this.matchModels[0].para;
                                var view = this.matchModels[0].view;
                                var startindex = this.matchModels[0].start;
                                // get all match models in the paragraph
                                models = getModelsFromPara(para, this.text, matchCase, matchWord, view);
                                //re-push the new un-replaced models to matchModels
                                while (this.matchModels.length > 0 &&
                                    paraId == this.matchModels[0].para.id) {
                                    this.matchModels.shift();
                                    shiftCount += 1;
                                }
                                for (var i = 0; i < shiftCount; i++)
                                    this.matchModels.push(models[models.length - shiftCount + i]);

                                // request spell check
                                if (shiftCount == 0) {
                                    topic.publish(constants.EVENT.REQUESTSPELLCHECKONPARA, para, newStr, startindex, true);
                                }

                                if (this.matchModels.length > 0) {
                                    paraId = this.matchModels[0].para.id;
                                    this.sel.destroy();
                                    this.sel.addRanges(modelToRange(this.matchModels[0]));
                                }
                            } catch (e) {
                                console.log("replace has error :" + e);
                            }
                        }
                        this.clear();
                        pe.lotusEditor.isReplacingAll = false;
                        if (BidiUtils.isArabicLocale())
                            totalCount = BidiUtils.convertArabicToHindi(totalCount + "");

                        var info = dojoString.substitute(nls.replaceSuccessMsg, {
                            'replacedCount': totalCount
                        });
                        this.alert(info);
                        topic.publish(constants.EVENT.SHOWTOTALNUM, this.focusIndex, this.matchBeforeFocus, this.matchModels.length);
                        topic.publish(constants.EVENT.GROUPCHANGE_END);
                    } catch (e) {

                    }
                    msgCenter.endRecord();

                }
            };


            var local_finder = {
                changeHighlightByReplace: false,
                editAreaChangedHandler: null,
                findForEditAreaChanged: function() {
                    finder.clear();
                    this.find_hdl();
                },
                resize_hdl: function() {
                    var editFrame = dom.byId("editorFrame");
                    if (!this.show) {
                        domStyle.set(editFrame, "height", "100%");
                    } else {
                        var mainHeight = domStyle.get("mainNode", "height");
                        var height = dojoGeo.getMarginBox(dom.byId("lotus_editor_floating_finder")).h;
                        var editHeight = mainHeight - height;
                        domStyle.set(editFrame, "height", editHeight + "px");
                    }
                    pe.lotusEditor.onEditorResized();
                },
                onshow_hdl: function() {
                    this.show = true;
                    this.resize_hdl();
                    fx.wipeIn({
                        node: dom.byId("lotus_editor_floating_finder")
                    }).play();
                    this.editAreaChangedHandler = topic.subscribe(constants.EVENT.EDITAREACHANGED, langModule.hitch(this, this.findForEditAreaChanged)),
                        finder.sel = pe.lotusEditor.getSelection();
                    var range = finder.sel.getRanges()[0];
                    var contents = "";
                    if (ModelTools.isValidSel4Find())
                        contents = range.extractContents();
                    var findValue;
                    this.input.focus();
                    this.setDefaultValue(false, "find");
                    if (contents && contents.length > 0 && contents[0].c != this.input.value) {
                        findValue = contents[0].c;
                        findValue = findValue.trim();
                        this.input.value = findValue;
                    } else
                        findValue = this.input.value;
                    if (!findValue || findValue.length == 0) {
                        finder.clear();
                        return;
                    }
                    finder.find(findValue, false, false, true, false);
                },
                onload_hdl: function() {
                    //alert ("onload event");
                    this.input.focus();
                },
                onhide_hdl: function() {
                    if (this.changeHighlightByReplace) {
                        this.changeHighlightByReplace = false;
                    }
                    finder.clear();
                    clearTimeout(pe.lotusEditor.findTimer);
                    delete pe.lotusEditor.findTimer;
                    if (this.editAreaChangedHandler) {
                        this.editAreaChangedHandler.remove();
                        this.editAreaChangedHandler = null;
                    }
                    this.show = false;
                    this.resize_hdl();
                    pe.lotusEditor.focus();
                },
                navigate_hdl: function(direction) {
                    if (!this.input.value || this.input.value.length == 0 || this.isDefaultFindValue) {
                        finder.clear();
                        finder.alert(nls.noFindVal);
                        return;
                    }
                    if (finder.state == KMP_NOTFOUND) {
                        finder.alert(nls.notFoundMsg);
                        return;
                    }
                    if (finder.state == KMP_NOSTARTTOMATCH) {
                        finder.find(this.input.value, registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"), true, true);
                        if (finder.state == KMP_NOTFOUND) {
                            finder.alert(nls.notFoundMsg);
                            return;
                        }
                        return;
                    }
                    //							if(finder.focusIndex != FINDWITHOUTNAVIGATOR && finder.matchModels.length + finder.replacedMatchModels.length == 1)
                    //								return;

                    if (finder.focusIndex == FINDWITHOUTNAVIGATOR) {
                        if (direction == DIRECTION_NEXT)
                            finder.focusIndex = -1;
                        else
                            finder.focusIndex = finder.matchModels.length;
                    } else if (finder.replacedMatchModels.length == 0 && direction == DIRECTION_PRE) {
                        if (finder.focusIndex == 0) {
                            finder.focusIndex = finder.matchModels.length;
                            finder.alert(nls.searchToBeginning);
                            return;
                        } else if (finder.focusIndex < 0)
                            finder.focusIndex = finder.matchModels.length - 1;

                    } else if (direction == DIRECTION_NEXT) {
                        finder.matchModels = finder.matchModels.concat(finder.replacedMatchModels);
                        finder.replacedMatchModels = [];
                        if (finder.focusIndex == finder.matchModels.length - 1) {
                            finder.focusIndex = -1;
                            finder.alert(nls.finishSearch);
                            return;
                        } else if (finder.focusIndex > finder.matchModels.length - 1)
                            finder.focusIndex = 0;
                    }
                    finder.navigate(direction, true);
                },
                find_hdl: function(findForCheckBox) {
                    if (!this.input || ((findForCheckBox && !findForCheckBox.find) && this.input.value == finder.text))
                        return;
                    finder.clear();
                    var findTimeLapse = 600;
                    if (!this.input.value || this.input.value.length == 0) {
                        topic.publish(constants.EVENT.SHOWTOTALNUM, finder.focusIndex, finder.matchBeforeFocus, -1); // clear the totol num text
                        return;
                    } else
                        (findTimeLapse - 150 * this.input.value.length) >= 0 ? (findTimeLapse - 150 * this.input.value.length) : 0;
                    if (pe.lotusEditor.findTimer)
                        clearTimeout(pe.lotusEditor.findTimer);
                    pe.lotusEditor.findTimer = setTimeout(langModule.hitch(finder, finder.find, this.input.value,
                        registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"), true,
                        true), findTimeLapse);
                },
                highlight_hdl: function() {
                    if (finder.state == KMP_NOSTARTTOMATCH) {
                        if (!this.input.value || this.input.value.length == 0) {
                            finder.clear();
                            finder.alert(nls.noFindVal);
                            return;
                        }
                        finder.find(this.input.value, registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"), true, true);
                        if (finder.state == KMP_NOTFOUND) {
                            finder.alert(nls.notFoundMsg);
                            return;
                        }
                        return;
                    }

                    if (finder.focusIndex == -1)
                        finder.focusIndex = finder.matchModels.length - 1;
                    if (finder.focusIndex == finder.matchModels.length)
                        finder.focusIndex = 0;
                    finder.highlight(true, true);
                },
                replace_hdl: function() {

                    if (!this.input.value || this.input.value.length == 0 || this.isDefaultFindValue) {
                        finder.clear();
                        finder.alert(nls.noFindVal);
                        return;
                    }
                    if (finder.state == KMP_NOTFOUND) {
                        finder.alert(nls.notFoundMsg);
                        return;
                    }
                    if (finder.focusIndex == FINDWITHOUTNAVIGATOR) {
                        return this.navigate_hdl(DIRECTION_NEXT);
                    }
                    if (finder.focusIndex == -1) {
                        finder.navigate(DIRECTION_PRE, false);
                        return;
                    } else if (finder.focusIndex == finder.matchModels.length) {
                        finder.navigate(DIRECTION_NEXT, false);
                        return;
                    }

                    finder.highlight(false, true);
                    this.changeHighlightByReplace = true;

                    try {
                        var replaceWord = this.replaceInput.value;
                        if (this.isDefaultReplaceValue)
                            replaceWord = "";
                        finder.replace(replaceWord, registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"));

                    } catch (e) {
                        console.log('replace has error :' + e);
                    }
                },
                replaceall_hdl: function() {
                    if (!this.input.value || this.input.value.length == 0 || this.isDefaultFindValue) {
                        finder.clear();
                        finder.alert(nls.noFindVal);
                        return;
                    }
                    if (finder.state == KMP_NOSTARTTOMATCH) {

                        finder.find(this.input.value, registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"), true, true);
                        if (finder.state == KMP_NOTFOUND) {
                            finder.alert(nls.notFoundMsg);
                            return;
                        }
                        return;
                    } else {
                        if (finder.state == KMP_NOTFOUND) {
                            finder.alert(nls.notFoundMsg);
                            return;
                        }
                        if (finder.focusIndex == FINDWITHOUTNAVIGATOR) {
                            finder.focusIndex = 0;
                        }
                        this.changeHighlightByReplace = true;
                        var replaceWord = this.replaceInput.value;
                        if (this.isDefaultReplaceValue)
                            replaceWord = "";
                        finder.replaceAll(replaceWord, registry.byId("D_t_MatchCase").get("checked"), registry.byId("D_t_MatchWord").get("checked"));
                    }
                }
            };
            this.editor.addCommand('find', {
                exec: function() {
                    NewFindReplaceDlg.show("find", local_finder);
                }
            }, constants.KEYS.CTRL + 70); // Ctrl + F

            this.editor.addCommand('replace', {
                exec: function() {
                    NewFindReplaceDlg.show("replace", local_finder);
                }
            }, constants.KEYS.CTRL + 82); //Ctrl + R
        }
    });
    return FindReplace;
});
