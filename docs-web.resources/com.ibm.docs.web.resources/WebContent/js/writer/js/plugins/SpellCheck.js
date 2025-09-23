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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/topic",
    "writer/constants",
    "concord/spellcheck/scaytservice",
    "writer/core/Range",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "dojo/i18n!concord/spellcheck/nls/spellcheckUI",
    "dijit/Menu",
    "dijit/MenuItem",
    "dojo/_base/xhr"
], function(array, declare, lang, dom, topic, constants, scaytservice, Range, msgCenter, Plugin, i18nspellcheckUI, Menu, MenuItem, xhr) {

    var SpellCheck = declare("writer.plugins.SpellCheck", Plugin, {
        init: function() {
            if (typeof window.spellcheckerManager == 'undefined') {
                console.warn("no spellcheckerManager found");
                return;
            }

            if (typeof spellcheckerManager != 'undefined') {
                lang.mixin(spellcheckerManager, {
                    createTextSpellChecker: function(node, editor, bPublishStatus) {
                        var spellchecker = null;
                        if (typeof node == 'undefined') {
                            console.warn("createSpellckecker: no node specified");
                        } else if (!spellcheckerManager.bServiceAvailable) {
                            console.warn("createSpellchecker: service in unavailable");
                        } else {
                            node = dom.byId(node);
                            if (!node) {
                                console.info("createSpellckecker: node is null");
                                return;
                            }
                            spellchecker = node.spellchecker;

                            if (spellchecker == null) {
                                var mainDoc = null;
                                if (node.nodeName.toUpperCase() == "IFRAME") {
                                    mainDoc = node.contentWindow.document;
                                } else {
                                    mainDoc = node.ownerDocument;
                                }

                                if (typeof mainDoc.spellchecker == 'undefined') {
                                    //spellchecker = new concord.spellcheck.scaytservice( mainDoc, false );
                                    spellchecker = new concord.spellcheck.writerscaytservice(mainDoc, false);
                                    spellchecker.init(editor);
                                    spellchecker.autoScaytEnabled = false;
                                }

                                spellchecker = mainDoc.spellchecker; // writer doc need editor
                                spellchecker.setPublishStatus(bPublishStatus);
                            }
                        }

                        return spellchecker;
                    },

                    getPreviousSep: function(text, pos) {
                        var new_pos = pos;

                        if (new_pos <= 0) return 0;
                        if (new_pos > text.length) new_pos = text.length;
                        var regex = window.spellcheckerManager.getSeperatorReg();

                        while (new_pos > 0) {
                            if (regex.test(text.charAt(new_pos)) && new_pos < pos) {
                                new_pos++;
                                break;
                            }
                            new_pos--;
                        }

                        return new_pos;
                    },

                    getNextSep: function(text, pos) {
                        if (pos >= text.length) return text.length;

                        if (pos < 0) pos = 0;
                        var regex = window.spellcheckerManager.getSeperatorReg();
                        while (pos < text.length) {
                            if (regex.test(text.charAt(pos++)))
                                break;
                        }
                        return pos;
                    },

                    /* 
                     * Remove the marked miswords in the range, includes the partially intersected one 
                     */
                    removeMiswordsInRange: function(misWords, range_start, range_end) {
                        var ret = false;
                        if (!lang.isArray(misWords) || misWords.length == 0) return ret;
                        if (range_start >= range_end) return ret;
                        var delidx_start = 0,
                            delidx_end = 0;
                        for (var i = 0; i < misWords.length; i++) {
                            var misw_start = misWords[i].index;
                            var misw_end = misw_start + misWords[i].word.length;
                            if (misw_end <= range_start || misw_start >= range_end) continue;
                            // then delete all mis-words index in this range
                            if (delidx_end == 0) delidx_start = i;
                            delidx_end++;
                        }

                        if (delidx_end > 0) {
                            misWords.splice(delidx_start, delidx_end);
                            ret = true;
                        }

                        return ret;
                    },

                    /*
                     *  merge two mis-words array into a single one. 
                     *  second one --> first one
                     *  Assume there is no intersected ranges and only continous ranges 
                     */
                    mergeTwoMiswordsArray: function(miswords, miswords2) {
                        if (!lang.isArray(miswords2)) return;
                        var i = 0;
                        for (; i < miswords.length; i++)
                            if (miswords[i].index > miswords2[0].index) break;

                        for (var j = 0; j < miswords2.length; j++)
                            miswords.splice(i + j, 0, miswords2[j]);
                    }
                });
            }

            var editor = this.editor;

            var checker = window.spellcheckerManager.createTextSpellChecker("editorFrame", editor, true); // on editor doc

            topic.subscribe(constants.EVENT.LOAD_READY, lang.hitch(checker, checker.onLoadReady));

            return;
        }
    });

    declare("concord.spellcheck.writerscaytservice", scaytservice, {
        _REQUEST_TEXTLEN: 1200,
        _MAX_REQUEST_TEXTLEN: 2000,
        _CHECK_INTERVAL: 150, // 150ms
        _SHORT_CHECK_INTERVAL: 10, // 10ms
        _LONG_CHECK_INTERVAL: 250, // 10ms

        init: function(editor) {
            this._editor = editor;
            this.subscriptionEventhandlers = [];
            this._scDocumentTimer = null;
            this._scParaArray = [];
            this.nls = i18nspellcheckUI;

            this.__correctall_submenu = null;

            this.subscribeToEvents(editor);
        },

        // overload parent func
        _enableScaytImpl: function(enable, prev_state) {
            try {
                if (this.document == null) {
                    console.warn("no document specified");
                } else {
                    if (enable) {
                        this.addScStyle(); //dojo.addClass(this.document.body, "concordscEnabled");
                        if (this.serviceAvailable) {
                            //this.doSpellCheck();
                            //if (this.editable_nodes.length > 0)
                            this.connectEvents();
                        }
                        if (enable != prev_state)
                            this.doSpellCheckOnDocument();
                    } else {
                        this._clearSCDocumentTimer();
                        this.removeScStyle(); //dojo.removeClass(this.document.body, "concordscEnabled");
                        this.disableSpellCheck();
                        this.disconnectEvents();
                    }
                }
            } catch (e) {
                console.log('_enableScaytImpl, error:' + e);
            }

            this._clearInstanceTimer();
        },

        onLoadReady: function() {
            if (this.isLoadReady == true) {
                //console.log("!!!Already loaded?");
                return;
            }

            this.isLoadReady = true; // mark it after load ready

            var ctx = this._editor.ContextMenu;
            if (ctx && ctx.addListener) {
                ctx.addListener(lang.hitch(this, "onContextMenu"));
                ctx.addCloseListener(lang.hitch(this, "onContextMenuClose"));
            }

            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            this.enableAutoScayt(true);
        },

        // overload parent func
        spellcheckLangChanged: function(newlang) {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            // force to check the whole document again
            this.doSpellCheckOnDocument();
        },

        // stop the SC interval and clear the request queue
        _clearSCDocumentTimer: function() {
            clearInterval(this._scDocumentTimer);
            this._scDocumentTimer = null;
            this._scParaArray = [];
        },

        _collectAllPara: function(para, data) {
            if (para.getVisibleText() && para.getVisibleText().length /*&& para.text != "\r"*/ ) {
                if (para.scdata) { // reset scdata to force to check the whole paragraph
                    para.scdata.scrange_start = -1;
                    para.scdata.scrange_end = -1;
                }
                data.para_array.push(para);
            }
            if (!para.scdata) {
                para.scdata = {}; // mark this paragraph as checked
            }
        },

        doSpellCheckOnDocument: function() {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled() ||
                !this.isLoadReady)
                return;

            var data = {
                para_array: []
            };
            this._traverseDocumentParagraph(lang.hitch(this, this._collectAllPara), data);

            this._scParaArray = this._scParaArray.concat(data.para_array);

            if (this._scDocumentTimer == null)
                this._scDocumentTimer = setInterval(lang.hitch(this, this._checkInterval), this._CHECK_INTERVAL);
        },

        _checkInterval: function() {
            var array_len = this._scParaArray.length;
            if (array_len > 0) {
                if (this._scParaArray[0] == null) {
                    this._scParaArray.shift();
                    return;
                }
                var len_s = 0;
                var sc_paras = [];
                var sc_text = "";

                while (len_s < this._REQUEST_TEXTLEN && array_len > 0) {
                    var para = this._scParaArray[0];
                    if (para && para.getVisibleText().length > 0) {
                        var sc_start = (para.scdata && para.scdata.scrange_start > 0) ?
                            para.scdata.scrange_start : 0,
                            sc_end = (para.scdata && para.scdata.scrange_end > 0 &&
                                para.scdata.scrange_end < para.getVisibleText().length) ?
                            para.scdata.scrange_end : para.getVisibleText().length;
                        sc_start = spellcheckerManager.getPreviousSep(para.getVisibleText(), sc_start);
                        sc_end = spellcheckerManager.getNextSep(para.getVisibleText(), sc_end);
                        var thislen = sc_end - sc_start;

                        if (thislen >= this._REQUEST_TEXTLEN && len_s > 0)
                            break;
                        else {
                            this._scParaArray.shift();
                            array_len--;
                            if (!para.scdata) para.scdata = {};

                            if (thislen > 0) {
                                if (!sc_text) {
                                    len_s += thislen;
                                    sc_text += para.getVisibleText().substring(sc_start, sc_end);
                                } else {
                                    len_s += thislen + 1;
                                    sc_text += '\r' + para.getVisibleText().substring(sc_start, sc_end);
                                }
                                para.scdata.checking = {};
                                para.scdata.checking.start = sc_start;
                                para.scdata.checking.end = sc_end;
                                para.scdata.checking.state = 0;
                                sc_paras.push({
                                    para: para,
                                    range: para.scdata.checking
                                });
                            }
                        }
                    } else if (para) {
                        para.scdata = {}; // mark this paragraph as checked
                        this._scParaArray.shift();
                        array_len--;
                    }
                }

                if (sc_paras.length == 0 || sc_text.length == 0)
                    return;

                // if too long text, more wait time for several requests
                if (sc_text.length > this._MAX_REQUEST_TEXTLEN)
                    for (var i = (sc_text.length - this._REQUEST_TEXTLEN); i > 0; i -= this._REQUEST_TEXTLEN)
                        this._scParaArray.unshift(null);

                if (array_len == 0) {
                    clearInterval(this._scDocumentTimer);
                    this._scDocumentTimer = null;
                }

                //setTimeout(dojo.hitch(this,this._requestCheck, sc_paras, sc_text), 0);
                this._requestCheck(sc_paras, sc_text, true);
            } else {
                clearInterval(this._scDocumentTimer);
                this._scDocumentTimer = null;
            }
        },

        _traverseAParagraph: function(para, cb, data) {
            cb(para, data);
            // traverse obj attached to this paragraph, such as txbox ...
            var child = para.firstChild();
            while (child) {
                if (child.modelType == constants.MODELTYPE.TXBX || child.modelType == constants.MODELTYPE.FLTXBX ||
                    child.modelType == constants.MODELTYPE.SQTXBX || child.modelType == constants.MODELTYPE.TBTXBX ||
                    child.modelType == constants.MODELTYPE.RFOOTNOTE || child.modelType == constants.MODELTYPE.RENDNOTE) {
                    var grandchild = child.firstChild();
                    while (grandchild) {
                        if (grandchild.modelType == constants.MODELTYPE.PARAGRAPH)
                            this._traverseAParagraph(grandchild, cb, data);
                        grandchild = child.nextChild(grandchild);
                    }
                }
                child = para.nextChild(child);
            }
        },

        _traverseTableParagraph: function(table, cb, data) {
            table.rows.forEach(lang.hitch(this, function(row) {
                row.cells.forEach(lang.hitch(this, function(cell) {
                    cell.container.forEach(lang.hitch(this, function(obj) {
                        if (obj.modelType == constants.MODELTYPE.PARAGRAPH)
                            this._traverseAParagraph(obj, cb, data);
                    }));
                }));
            }));
        },

        /*
         * traverse the whole document, not including: TOC
         * 
         */
        _traverseDocumentParagraph: function(cb, data) {
            if (typeof cb != 'function') return;

            // loop to add spellchecker for every loaded Paragraphs 
            var documentmodel = this._editor.layoutEngine.rootModel;
            var child = documentmodel.firstChild();
            while (child) {
                if (child.modelType == constants.MODELTYPE.PARAGRAPH) {
                    this._traverseAParagraph(child, cb, data);
                } else if (child.modelType == constants.MODELTYPE.TABLE) {
                    this._traverseTableParagraph(child, cb, data);
                }
                child = documentmodel.nextChild(child);
            }

            // relations
            var rels = this._editor.relations;
            if (rels) {
                // header, footer
                if (rels._relations) {
                    for (var key in rels._relations) {
                        if (rels._relations.hasOwnProperty(key)) {
                            var relobj = rels._relations[key];
                            if (relobj.modelType == constants.MODELTYPE.HEADERFOOTER) {
                                var relchild = relobj.firstChild();
                                while (relchild) {
                                    if (relchild.modelType == constants.MODELTYPE.PARAGRAPH) {
                                        this._traverseAParagraph(relchild, cb, data);
                                    }
                                    relchild = relobj.nextChild(relchild);
                                }
                            }
                        }
                    }
                }

                // footnotes, endnotes
                if (rels.notesManager) {
                    var props = ["footnotes", "endnotes"];
                    var that = this;
                    array.forEach(props, function(prop) {
                        var notes = rels.notesManager[prop];
                        if (notes) {
                            array.forEach(notes, function(note) {
                                var notechild = note.firstChild();
                                while (notechild) {
                                    if (notechild.modelType == constants.MODELTYPE.PARAGRAPH) {
                                        that._traverseAParagraph(notechild, cb, data);
                                    }
                                    notechild = note.nextChild(notechild);
                                }
                            });
                        }
                    });
                }
            }
        },

        // for new paragraph
        doSpellcheckOnNewParagraph: function(para) {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            // don't run spell check on toc paragraph
            if (para.parent && para.parent.modelType == constants.MODELTYPE.TOC)
                return;

            if (para.getVisibleText().length > 0)
                this._enqueueARequest(para, !this.needBatchCheck());
            else
                para.scdata = {}; // do nothing more
        },

        _hasSepatatorInString: function(text) {
            var len = text.length;
            if (len <= 0)
                return false;
            // consider all separators
            var regex = window.spellcheckerManager.getSeperatorReg();
            for (var i = 0; i < len; i++)
                if (regex.test(text.charAt(i))) return true;

            return false;
        },

        // for adding text, run spell check on a para range
        doSpellcheckOnParagraphRange: function(para, text, index, bforce) {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            if (para.modelType != constants.MODELTYPE.PARAGRAPH) return;
            if (para.scdata && text != null && (typeof text != 'undefined') &&
                para.getVisibleText() && para.getVisibleText().length) {
                // do nothing if not mandatory or not a separator
                if (typeof bforce == 'undefined' && text.length == 0) return;
                if (bforce === false && !this.needBatchCheck()) return;

                // when editing, only separator will trigger spellcheck
                if (!this.needBatchCheck() && !this._hasSepatatorInString(text) && bforce != true)
                    return;

                if (typeof para.scdata.scrange_start == 'undefined' || para.scdata.scrange_start < 0)
                    para.scdata.scrange_start = index;
                if (!para.scdata.scrange_end || // need scan next word too 
                    (index + text.length > para.scdata.scrange_end))
                    para.scdata.scrange_end = index + text.length;

                // when editing, we need a quick response, so don't put into sc queue.
                if (!this.needBatchCheck())
                    setTimeout(lang.hitch(this, this.checkText, para), this._SHORT_CHECK_INTERVAL);
                else
                    this._enqueueARequest(para, !this.needBatchCheck());
            }
        },

        // put a request on the header
        _enqueueARequest: function(para, btriggertimer) {
            var i = this._scParaArray.length;
            for (; i > 0; i--) {
                if (this._scParaArray[i - 1] == para) {
                    break;
                }
            }
            if (i <= 0) this._scParaArray.unshift(para);
            if (this._scDocumentTimer == null && (typeof btriggertimer == 'undefined' || btriggertimer == true))
                this._scDocumentTimer = setInterval(lang.hitch(this, this._checkInterval), this._LONG_CHECK_INTERVAL);
        },

        /*
         * run spell check on text marked between scrange_start and scrange_end  
         */
        checkText: function(para) {
            // if spell check is disabled after the setTimeout() call,
            // Do nothing any more.
            if (!para || !window.spellcheckerManager ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            // clear need spell check flag. After that, any modification on
            // paragraph will reset the flag again.
            if (!para.scdata) para.scdata = {};
            var scdata = para.scdata;
            var sc_start = scdata.scrange_start || 0;
            var sc_end = scdata.scrange_end || -1;
            if (sc_start < 0) sc_start = 0;
            if (sc_end < 0) sc_end = para.getVisibleText().length;
            // reset the range info in paragraph
            scdata.scrange_start = -1;
            scdata.scrange_end = -1;

            var strText = para.getVisibleText();
            sc_start = spellcheckerManager.getPreviousSep(strText, sc_start);
            sc_end = spellcheckerManager.getNextSep(strText, sc_end);
            if (sc_start > 0 || sc_end < strText.length)
                strText = strText.substring(sc_start, sc_end);

            if (strText && strText.length) {
                var paras = [];
                para.scdata.checking = {};
                para.scdata.checking.start = sc_start;
                para.scdata.checking.end = sc_end;
                para.scdata.checking.state = 0;
                paras.push({
                    para: para,
                    range: para.scdata.checking
                });
                //setTimeout(dojo.hitch(this, this._requestCheck, paras, strText), 0);
                this._requestCheck(paras, strText);
            }
        },

        _requestCheck: function(paras, strText, bReqFromQueue) {
            if (strText && strText.length) {
                var scRequest = {
                    spellChecker: this,
                    paragraphs: paras,
                    requeueifchanged: bReqFromQueue
                };

                var request = {
                    //				context : scRequest,
                    url: spellcheckerManager.backendServiceURL + "/" + spellcheckerManager.lang,
                    content: {
                        text: strText,
                        suggestions: 0,
                        format: "json"
                    },
                    handleAs: "json",
                    sync: false,
                    timeout: 10000, // execute error when timeout
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                    },
                    load: function(data) {
                        var items = data.items;
                        var regMiss = null;
                        var sRegMiss = "";
                        var newmisWords = [];

                        if (items instanceof Array) {
                            if (items.length) {
                                for (var i in items) {
                                    if (items[i].type != 'Spelling' /*'RepeatedWord'*/ ) continue;
                                    var word = items[i].word;
                                    // var type = items[i].type;
                                    var bIndex = items[i].beginIndex;

                                    var wArray = word.split(/\s+/); // the word returned from server contains space?? why? and any other separator?

                                    if (lang.isString(wArray)) {
                                        if (wArray.lengh && !spellcheckerManager.isSkipWord(wArray)) {
                                            var code = wArray.charCodeAt(0);
                                            if (!spellcheckerManager.isWordBoundaryChar(code)) {
                                                var misword = {
                                                    word: wArray,
                                                    index: bIndex
                                                };
                                                newmisWords.push(misword);
                                            }
                                        }
                                    } else if (lang.isArray(wArray)) {
                                        for (var k = 0; k < wArray.length; k++) {
                                            var aWord = wArray[k];
                                            if (aWord.length === 1) // ignore word length 1 items
                                                continue;
                                            if (aWord.length && !spellcheckerManager.isSkipWord(aWord)) {
                                                var code = aWord.charCodeAt(0);
                                                if (!spellcheckerManager.isWordBoundaryChar(code)) {
                                                    var misword = {
                                                        word: aWord,
                                                        index: bIndex
                                                    };
                                                    newmisWords.push(misword);
                                                    bIndex += (aWord.length + 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        var arlen = scRequest.paragraphs.length;
                        var thisindex = 0;
                        var checked_misw_index = 0;
                        for (var it = 0; it < arlen; it++) {
                            var para = scRequest.paragraphs[it].para;
                            var range = scRequest.paragraphs[it].range;
                            var sc_start = range.start;
                            var sc_end = range.end;
                            var checked_txtlen = sc_end - sc_start;

                            var newmisword_para = [];
                            var miswords_len = newmisWords.length;
                            for (; checked_misw_index < miswords_len; checked_misw_index++) {
                                if (newmisWords[checked_misw_index].index > (thisindex + checked_txtlen))
                                    break;
                                var w_start = newmisWords[checked_misw_index].index + sc_start - thisindex;
                                var hint = para.byIndex(para.getFullIndex(w_start), false);
                                // dont mark the word when it is link text
                                if (hint && hint.modelType == constants.MODELTYPE.LINK && w_start >= hint.start &&
                                    (hint.start + hint.length) >= (w_start + newmisWords[checked_misw_index].word.length))
                                    continue;
                                newmisWords[checked_misw_index].index = w_start;
                                newmisword_para.push(newmisWords[checked_misw_index]);
                            };

                            if (para) {
                                var needupdate = false;
                                var scdata = para.scdata;
                                if (scdata) {
                                    // check if para changed after sending out a sc request, then it needs
                                    // to requeue the para sc request back to _scParaArray again
                                    if (scRequest.paragraphs[it].range.state == 1 && (sc_end > sc_start) && scRequest.requeueifchanged) {
                                        // merge the range back to para.scdata at first
                                        if (para.scdata.scrange_start == undefined ||
                                            para.scdata.scrange_start == -1 ||
                                            sc_start < para.scdata.scrange_start)
                                            para.scdata.scrange_start = sc_start;
                                        if (para.scdata.scrange_end == undefined ||
                                            para.scdata.scrange_end == -1 ||
                                            sc_end > para.scdata.scrange_end)
                                            para.scdata.scrange_end = sc_end;
                                        _enqueueARequest(para);
                                        continue;
                                    } else {
                                        // reset scrange
                                        scdata.scrange_start = -1;
                                        scdata.scrange_end = -1;
                                        delete para.scdata.checking;
                                    }

                                    if (scdata.misWords && scdata.misWords.length)
                                        scdata.prevMisWords = scdata.misWords.slice(0);

                                    if (spellcheckerManager.removeMiswordsInRange(scdata.misWords,
                                            sc_start, sc_end))
                                        needupdate = true;
                                } else
                                    scdata = para.scdata = {};

                                // then to merge the check result with previous one
                                if (para && newmisword_para.length > 0) {
                                    if (!scdata.misWords) scdata.misWords = [];
                                    spellcheckerManager.mergeTwoMiswordsArray(scdata.misWords, newmisword_para);
                                    needupdate = true;
                                }
                                // fire to set object spell check attributes and update view
                                if (((scdata.misWords && scdata.misWords.length > 0) ||
                                        (scdata.prevMisWords && scdata.prevMisWords.length > 0)) && needupdate)
                                    scRequest.spellChecker._markMisspellForRequest(para);
                            }

                            thisindex += checked_txtlen + 1;
                        }
                    },

                    error: function(err, ioargs) {
                        scRequest.paragraphs.forEach(function(item) {
                            if (item.para.scdata && item.para.scdata.checking)
                                delete item.para.scdata.checking;
                        });
                        console.log("error happens when do spell check: " + err);
                        if (ioargs.xhr.status == 404) {
                            console.log("spell check service is unavailable.");
                            spellcheckerManager.setServiceAvailable(false);
                        }

                        scRequest.spellChecker._clearSCDocumentTimer();
                    }
                };
                xhr.get(request);
            }
        },

        connectEvents: function() {
            if (this.subscriptionEventhandlers.length == 0) {
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.REQUESTSPELLCHECKONPARA, lang.hitch(this, this.doSpellcheckOnParagraphRange)));
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.CREATEDNEWPARA, lang.hitch(this, this.doSpellcheckOnNewParagraph)));
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.GROUPCHANGE_START, lang.hitch(this, this.doBatchCheckStart)));
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.GROUPCHANGE_END, lang.hitch(this, this.doBatchCheckEnd)));
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.LEFTMOUSEDOWN, lang.hitch(this, lang.hitch(this, "onMouseDown"))));
                this.subscriptionEventhandlers.push(topic.subscribe(constants.EVENT.CURSORCOMMAND, lang.hitch(this, lang.hitch(this, "onCursorCommand"))));
            }
        },

        disconnectEvents: function() {
            array.forEach(this.subscriptionEventhandlers, function(e){e.remove()});
            var len = this.subscriptionEventhandlers.length;
            this.subscriptionEventhandlers.splice(0, len);
        },

        // The batch check state, all sc requests will be put into queue.
        // Only when exits this state, the check interval will be started.
        // This state is mostly for undo/redo/msg/rollback. 
        needBatchCheck: function() {
            return !!this.needBatchCheckState;
        },

        doBatchCheckStart: function() {
            this.needBatchCheckState = true;
        },

        doBatchCheckEnd: function() {
            this.needBatchCheckState = false;
            if (this._scDocumentTimer == null && this._scParaArray.length > 0)
                this._scDocumentTimer = setInterval(lang.hitch(this, this._checkInterval), this._LONG_CHECK_INTERVAL);
        },

        onMouseDown: function(EditorWindow) {
            var editshell = EditorWindow._shell;
            var sel = editshell.getSelection();
            var range = sel.getRanges()[0];
            if (!range) return;

            var endmodel = range.getEndParaPos();
            if (endmodel) {
                var endindex = endmodel.index;
                var para = endmodel.obj;
                if (para && para.scdata && typeof para.scdata.scrange_start != 'undefined' && para.scdata.scrange_start >= 0) {
                    if (!para.scdata.scrange_end || endindex > para.scdata.scrange_end)
                        para.scdata.scrange_end = endindex;
                    // need longer time out, or there is cursor display problem. why?
                    setTimeout(lang.hitch(this, this.checkText, para), this._CHECK_INTERVAL);
                }
            }
        },

        onCursorCommand: function(cmd, lastrange) {
            if (!lastrange) return;
            var endmodel = lastrange.getEndParaPos();
            if (!endmodel) return;
            var endindex = endmodel.index;
            var para = endmodel.obj;
            if (para && para.scdata && typeof para.scdata.scrange_start != 'undefined' && para.scdata.scrange_start >= 0) {
                if (!para.scdata.scrange_end || endindex > para.scdata.scrange_end)
                    para.scdata.scrange_end = endindex;
                setTimeout(lang.hitch(this, this.checkText, para), this._SHORT_CHECK_INTERVAL);
            }
        },

        onContextMenu: function(target, selection, x, y) {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;

            var ranges = this._editor.getShell().getSelection().getRanges();
            var range = ranges[0];
            if (ranges.length != 1 || !range) return {};

            /*
             * do nothing when there are multi-sel or selection length > 0
             */
            var start_pos = range.getStartView();
            var end_pos = range.getEndView();
            if (start_pos.obj != end_pos.obj || end_pos.index != start_pos.index) return {};

            var parapos = range.getEndParaPos();
            var index = parapos.index;

            if (!parapos.obj || parapos.obj.modelType != constants.MODELTYPE.PARAGRAPH) return {};

            var amisword = this.getMisWordByIndex(parapos.obj, index);
            if (!amisword || amisword.word.length <= 0) return {};

            // clear all sc menu items at fisrt
            var ctx = this._editor.ContextMenu;
            ctx.removeMenuItems("scsug_ctxmenu");

            var suggestions = spellcheckerManager.getSuggestions(amisword.word);

            var scsug_context = {
                sc_inst: this,
                parapos: parapos,
                //sugglist : suggestions,
                misword: amisword
            };

            var cmds_nosugg = {
                label: this.nls.noSuggestion,
                group: 'sc_suggestion',
                order: 'spellcheck',
                name: 'sc_nosug',
                onClick: function() {
                    // do nothing but need change focus back to editor explicitly.
                    pe.lotusEditor.getShell().focus();
                },
                type: "scsug_ctxmenu"
            };

            var cmds_correctall = {
                label: this.nls.correctall,
                group: 'sc_suggestion',
                order: 'spellcheck',
                name: 'sc_correctall',
                onClick: function() {
                    // do nothing
                },
                type: "scsug_ctxmenu"
            };

            var cmds = {
                sc_ignore: {
                    label: this.nls.ignore,
                    group: 'sc_action',
                    order: 'spellcheck',
                    name: 'sc_ignore',
                    onClick: lang.hitch(scsug_context, this.onSuggestionIgnoreWord),
                    type: "scsug_ctxmenu"
                },
                sc_skipall: {
                    label: this.nls.skip_all,
                    group: 'sc_action',
                    order: 'spellcheck',
                    name: 'sc_skipall',
                    onClick: lang.hitch(scsug_context, this.onSuggestionSkipall),
                    type: "scsug_ctxmenu"
                }
            };
            var ret = {
                sc_ignore: false,
                sc_skipall: false
            };

            if (!suggestions || suggestions.length == 0) {
                cmds[cmds_nosugg.name] = cmds_nosugg;
                ret[cmds_nosugg.name] = false;
            } else {

                // add correct-all top-level menu item
                cmds[cmds_correctall.name] = cmds_correctall;
                this.__correctall_submenu = new Menu();
                ret[cmds_correctall.name] = {
                    subWidget: this.__correctall_submenu
                };

                var scsug_context0 = null;
                suggestions.forEach(lang.hitch(this, function(sugg) {
                    if (sugg.length > 0) {
                        scsug_context0 = {
                            sc_inst: this,
                            parapos: parapos,
                            //sugglist : suggestions,
                            misword: amisword,
                            sugg: sugg,
                            rootview: range.getRootView()
                        };
                        var name = "sc_sugg_" + sugg;
                        var cmds_suggword_templ = {
                            label: sugg,
                            group: 'sc_suggestion',
                            order: 'spellcheck',
                            name: name,
                            onClick: lang.hitch(scsug_context0, this.onSuggestionWord),
                            type: "scsug_ctxmenu"
                        };
                        cmds[name] = cmds_suggword_templ;
                        ret[name] = false;

                        // correct-all sub menu
                        var newId = "D_sccorrectall_" + sugg;
                        this.__correctall_submenu.addChild(new MenuItem({
                            id: newId,
                            label: sugg,
                            onClick: lang.hitch(scsug_context0, this.onCorrectAll)
                        }));
                    }
                }));
            }

            for (var k in cmds)
                ctx.addMenuItem(cmds[k].name, cmds[k]);

            return ret;
        },

        onContextMenuClose: function() {
            // clear all sc menu items at fisrt
            var ctx = this._editor.ContextMenu;
            ctx.removeMenuItems("scsug_ctxmenu");
            // the sub menus are in fact deleted by prior ContextMenu.removeMenuItems() call
            this.__correctall_submenu = null;
        },

        // Correct a mis-spelled word in all paragraphs under a root view.
        // document, header or footer have different root view, so no impact on each other
        onCorrectAll: function() {
            //console.log("correct all : " + this.misword);

            var shell = pe.lotusEditor.getShell();
            var sel = shell.getSelection();

            var csr_pos = {
                index: this.parapos.obj.getFullIndex(this.misword.index + this.misword.word.length),
                obj: this.parapos.obj
            };

            msgCenter.beginRecord();
            try {

                topic.publish(constants.EVENT.GROUPCHANGE_START);

                //var data = {misword: this.misword, para_array:[]};
                var amisword = {
                    index: this.misword.index,
                    word: this.misword.word
                };
                var suggword = this.sugg;
                var csr_rootview = this.rootview;
                var len_delta = suggword.length - this.misword.word.length;
                this.sc_inst._traverseDocumentParagraph(function(para, data) {
                    if (!para.getVisibleText() || para.getVisibleText().length <= 0)
                        return;
                    if (!para.scdata || !para.scdata.misWords || para.scdata.misWords.length == 0)
                        return;

                    for (var i = para.scdata.misWords.length; i > 0; i--) {
                        if (para.scdata.misWords[i - 1].word == amisword.word) {
                            var v_sindex = para.scdata.misWords[i - 1].index;
                            var sindex = para.getFullIndex(v_sindex);
                            var start = {
                                index: sindex + 1,
                                obj: para
                            };
                            var end = {
                                index: para.getFullIndex(v_sindex + amisword.word.length),
                                obj: para
                            };
                            var range = new Range(start, end, csr_rootview);
                            if (range.getEndView()) {
                                sel.destroy();
                                sel.select(range.getStartView(), range.getEndView());
                                shell.insertText(suggword);

                                // finally delete first char
                                range = new Range({
                                    obj: para,
                                    index: sindex
                                }, {
                                    obj: para,
                                    index: sindex + 1
                                }, csr_rootview);
                                sel.select(range.getStartView(), range.getEndView());
                                shell.deleteText();

                                if (para == csr_pos.obj && start.index <= csr_pos.index) {
                                    csr_pos.index += len_delta;
                                }
                            }
                        }
                    }
                });

                topic.publish(constants.EVENT.GROUPCHANGE_END);

            } catch (e) {}
            msgCenter.endRecord();

            // restore the cursor pos
            sel.select(csr_pos, csr_pos);

            // need change focus back to editor explicitly.
            pe.lotusEditor.getShell().focus();
        },

        // it's context is a scsug_request
        onSuggestionWord: function(data) {
            //console.log("sc: correct a word!");
            var para = this.parapos.obj;
            if (para)
                setTimeout(lang.hitch(this.sc_inst, this.sc_inst.correctOneMisWord, para, this.misword, this.sugg, this.rootview), 0);
            // need change focus back to editor explicitly.
            pe.lotusEditor.getShell().focus();
        },

        // it's context is a scsug_request
        onSuggestionIgnoreWord: function() {
            // need change focus back to editor explicitly.
            pe.lotusEditor.getShell().focus();
            var para = this.parapos.obj;
            if (para)
                setTimeout(lang.hitch(this.sc_inst, this.sc_inst.ignoreOneMisWord, para, this.misword), 0);
            //console.log("sc: ignore a word!");
        },

        // it's context is a scsug_request
        onSuggestionSkipall: function() {
            // need change focus back to editor explicitly.
            pe.lotusEditor.getShell().focus();
            // console.log("sc: skip all!");
            if (this.misword.word.length > 0)
                window.spellcheckerManager.addSkipWord(this.misword.word);
            setTimeout(lang.hitch(this.sc_inst, this.sc_inst.ignoreOneMisWordForAllPara, this.misword), 0);
        },

        /*
         *  functions on paragraph
         */
        _markMisspellByRanges: function(para, miswords) {
            var ret = false;
            if (!miswords || miswords.length <= 0) return ret;
            var run = para.container.getFirst();
            while (run && run.modelType != constants.MODELTYPE.TEXT)
                run = para.container.next(run);
            for (var mis_idx = 0; mis_idx < miswords.length; mis_idx++) {
                if (!run) return ret;
                var trynextrun = 1;
                var misword_visible_start = miswords[mis_idx].index;
                var misword_visible_len = miswords[mis_idx].word.length;
                var misword_start = para.getFullIndex(misword_visible_start);
                var misword_len = para.getFullIndex(misword_visible_len + misword_visible_start) - misword_start;
                while (run && trynextrun) {
                    trynextrun = 0;
                    if ((typeof run.start != 'undefined') && !(run.start >= (misword_start + misword_len)) &&
                        !((run.start + run.length) < (misword_start + 1))) {
                        // in range
                        run.markDirty();
                        ret = true;
                    }
                    if ((typeof run.start == 'undefined') || (misword_start + misword_len) > (run.start + run.length)) {
                        trynextrun = 1;
                        run = para.container.next(run);
                    }
                }
            }
            return ret;
        },

        _resetSelectionAndUpdateView: function(para) {
            var sel = pe.lotusEditor.getShell().getSelection();
            var ranges = sel.getRanges();
            var changed = false;
            for (var range_it = 0; range_it < ranges.length; range_it++) {
                var range = ranges[range_it];
                var sparapos = range.getStartParaPos();
                var eparapos = range.getEndParaPos();

                if ((sparapos && sparapos.obj == para) || (eparapos && eparapos.obj == para)) {
                    changed = true;
                    range.resetView();
                }
            }

            para.markDirty();
            para.parent.update();
            pe.lotusEditor.layoutEngine.editor.updateManager.update();
            changed && sel.resetStartEndObj();
        },

        /* 
         * Mark misspell checked content for view update 
         */
        _markMisspellForRequest: function(para) {
            //console.log("to mark misspell words!");
            var scdata = para.scdata;
            if (!scdata || !lang.isArray(scdata.misWords) ||
                (scdata.misWords.length <= 0 && !(scdata.prevMisWords && scdata.prevMisWords.length > 0)))
                return;

            /* try to mark model textruns in range as dirty one, so it can re-layout run views */
            var needUpdateView = this._markMisspellByRanges(para, scdata.misWords);

            // then mark with old index/words so to clear last marks
            var needUpdateView2 = this._markMisspellByRanges(para, scdata.prevMisWords);
            scdata.prevMisWords = [];

            // request to refresh the view
            if (needUpdateView || needUpdateView2)
                this._resetSelectionAndUpdateView(para);
        },

        getMisWordByIndex: function(para, index) {
            if (!para.scdata || !para.scdata.misWords || !para.scdata.misWords.length) return null;
            for (var i = 0; i < para.scdata.misWords.length; i++) {
                var mis_item = para.scdata.misWords[i];
                var end = mis_item.word.length + mis_item.index;
                if (mis_item.index <= index && end >= index) {
                    return para.scdata.misWords[i];
                }
            }
            return null;
        },

        // to correct a word
        correctOneMisWord: function(para, misword, suggword, rootview) {
            // console.log(misword + "-->" + suggword);
            var v_sindex = misword.index;
            var sindex = para.getFullIndex(v_sindex);
            var start = {
                obj: para,
                index: sindex + 1
            };
            var end = {
                obj: para,
                index: para.getFullIndex(v_sindex + misword.word.length)
            };
            var range = new Range(start, end, rootview);
            if (range.getEndView()) {
                msgCenter.beginRecord();
                try {

                    topic.publish(constants.EVENT.GROUPCHANGE_START);

                    // select from start run to end run
                    // to keep text format, it must insert after the first character, then
                    // to delete the first character again.
                    var shell = pe.lotusEditor.getShell();
                    var sel = shell.getSelection();
                    sel.select(range.getStartView(), range.getEndView());
                    shell.insertText(suggword);

                    // then delete first char
                    range = new Range({
                        obj: para,
                        index: sindex
                    }, {
                        obj: para,
                        index: sindex + 1
                    }, rootview);
                    sel.select(range.getStartView(), range.getEndView());
                    shell.deleteText();

                    var topos = {
                        obj: para,
                        index: sindex + suggword.length
                    };
                    sel.select(topos, topos);

                    topic.publish(constants.EVENT.GROUPCHANGE_END);

                } catch (e) {}
                msgCenter.endRecord();
            }
        },

        // to ignore one word in a paragraph
        ignoreOneMisWord: function(para, misword) {
            if (!misword.word.length || !para.scdata || !para.scdata.misWords || !para.scdata.misWords.length) return;

            // find the item and to update it
            var i = 0;
            for (; i < para.scdata.misWords.length; i++) {
                if (misword.index == para.scdata.misWords[i].index && misword.word == para.scdata.misWords[i].word)
                    break;
                else if (para.scdata.misWords[i].index > misword.index)
                    return;
            }

            if (i < para.scdata.misWords.length) {
                var ignore_miswords = [];
                ignore_miswords.push(para.scdata.misWords[i]);
                para.scdata.misWords.splice(i, 1); // remove the item

                this._markMisspellByRanges(para, ignore_miswords);
                this._resetSelectionAndUpdateView(para);
            }
        },

        // to skip a misword in all paragraphs 
        ignoreOneMisWordForAllPara: function(amisword) {
            var data = {
                count: 1,
                misword: amisword
            };
            var that = this;
            this._traverseDocumentParagraph(function(para, data) {
                if (!para.getVisibleText() || para.getVisibleText().length <= 0)
                    return;
                if (!para.scdata || !para.scdata.misWords || para.scdata.misWords.length == 0)
                    return;

                // setTimeout(function(para, amisword){
                para.scdata.prevMisWords = [];
                var ignore_miswords = [];
                for (var i = para.scdata.misWords.length; i > 0; i--) {
                    if (para.scdata.misWords[i - 1].word == amisword.word) {
                        ignore_miswords.unshift(para.scdata.misWords[i - 1]);
                        para.scdata.misWords.splice(i - 1, 1); // remove this item
                    }
                }
                if (ignore_miswords.length > 0) {
                    that._markMisspellByRanges(para, ignore_miswords);
                    that._resetSelectionAndUpdateView(para);
                }
            }, data);
        },


        // message handle
        subscribeToEvents: function(editor) {
            topic.subscribe("concordsc::scaytEnabledInfo", lang.hitch(this, lang.hitch(this, this.handleSpellCheckEnabled)));
            topic.subscribe("concordsc::scaytFinishedInfo", lang.hitch(this, lang.hitch(this, this.handleSpellCheckFinished)));
            topic.subscribe("concordsc::autoScaytEnabledInfo", lang.hitch(this, lang.hitch(this, this.handleAutoSpellCheckEnabled)));
        },

        handleSpellCheckEnabled: function(enabled) {
            if (enabled) {
                pe.scene.showWarningMessage(this.nls.ongoing, 10000); // a longer interval here, will switch to spellcheck finish msg		
            }
        },

        handleSpellCheckFinished: function(finished) {
            //	    if(finished){
            //			pe.scene.showInfoMessage(this.nls.finished, 5000);
            //		}		
        },

        handleAutoSpellCheckEnabled: function(enabled) {
            if (enabled) {
                pe.scene.showInfoMessage(this.nls.autoenabled, 5000);
            } else {
                pe.scene.hideErrorMessage();
            }
        }
    });
    return SpellCheck;
});
