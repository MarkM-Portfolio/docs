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
    "dojo/dom",
    "dojo/dom-style",
    "dojo/has",
    "dojo/topic",
    "writer/constants",
    "writer/common/tools",
    "concord/util/browser"
], function(lang, dom, domStyle, has, topic, constants, tools, browser) {

    //var G_FRE_CHARS = [];
    var MeasureText = {
        _fontMeasureCache: {},
        _charMeasureCache: {},
        _charCache: {},
        _wordCache: {},
        _preMeasureCache: {},
        _fontKeys: ['font-family', 'font-size', 'font-style', 'font-weight'], // No affected key "color", "background-color", "text-decoration"
        //  context2d: null,
        textMeasureFrame: null,
        textMeasure: null,
        init: function() {
            if (_beforeHandler) {
                _beforeHandler.remove();
                _beforeHandler = null;
            }
            // Measure text in iframe avoid impact by body css.
            var data =
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                '<body style="width:100%"><div id="textMeasure"></div></body>' +
                '</html>';
            this.textMeasureFrame = dom.byId("measureFrame");
            var doc = this.textMeasureFrame.contentWindow.document;
            doc.open();
            doc.write(data);
            doc.close();

            this.textMeasure = dom.byId("textMeasure", doc);
            //this.test();

            topic.subscribe(constants.EVENT.PREMEASURE, lang.hitch(this, this._preMeasureImpl));
            // Record word count and measure count.
            //      window.totalLen =0;
            //      window.wordLen = [];
        },

        cleanCache: function() {
            this._wordCache = {};
            this._preMeasureCache = {};
        },

        test: function() {
            this.testImp(1000, 2);
            this.testImp(400, 5);
            this.testImp(200, 10);
            this.testImp(100, 20);
            this.testImp(50, 40);
            this.testImp(25, 80);
            this.testImp(20, 100);
            this.testImp(10, 200);
            this.testImp(5, 400);
            this.testImp(2, 1000);
            this.testImp(1, 2000);
        },

        testImp: function(cnt, strCnt) {
            var str = "";
            for (var i = 0; i < strCnt; i++) {
                str += '<div style="display:inline-block;' + '">' + "hello" + i + '</div>';;
            }
            this.textMeasure.innerHTML = str;
            var child;
            var t1 = new Date();
            var val;
            for (var i = 0; i < cnt; i++) {
                this.textMeasure.innerHTML = str;
                var el = this.textMeasure.firstChild;
                while (el) {
                    val = el.offsetWidth;
                    el = el.nextSibling;
                }
            }

            var t2 = new Date();

            this.textMeasure.innerHTML = str;
            var t22 = new Date();
            for (var i = 0; i < cnt; i++) {
                this.textMeasure.innerHTML = str;
                var el = this.textMeasure.firstChild;
                while (el) {
                    val = el.getBoundingClientRect().width;
                    el = el.nextSibling;
                }
            }
            var t3 = new Date();

            console.info("==== cnt is: " + cnt + " str cnt: " + strCnt + ". Offset time is: " + (t2 - t1) + "ms. " + " Bound time is: " + (t3 - t22) + "ms.");
        },
        getCSSStr: function(font) {
            var verticalAlign = font['vertical-align'];
            if (verticalAlign == "super" || verticalAlign == "sub") {
                var fontsize = tools.transformFontSize(font);
            }

            var cssStr = "",
                key;
            for (var i = 0; i < this._fontKeys.length; i++) {
                key = this._fontKeys[i];
                if (font[key]) {
                    if (key == 'font-size' && fontsize)
                        cssStr += "font-size:" + fontsize + ";";
                    else if (key == 'font-family'){
                    	var val = font[key];
                    	val = val.replace(/\"/gm, '&quot;');
                    	cssStr += key + ":" + val + ";";
                    }
                    else
                        cssStr += key + ":" + font[key] + ";";
                }
            }

            return cssStr;
        },

        _enlargeFrame: function() {
            if (this._enlarged)
                return;

            domStyle.set(this.textMeasureFrame, "width", "1000000px");
            this._enlarged = true;

            var that = this;
            setTimeout(function() {
                that._enlarged = false;
                domStyle.set(that.textMeasureFrame, "width", "100px");
            }, 200);
        },

        measureTextRun: function(text, font, byWord) {
            this._enlargeFrame();
            //      return this.measureTextRun_byRun(text, font, byWord);
            var r = this.measureTextRun_byWord(text, font, byWord);
            //      return this.measureTextRun_byChar(text, font, byWord);
            return r;
        },

        preMeasureText: function(text, font) {
            var cssStr = typeof(font) == "string" ? font : this.getCSSStr(font);
            var preMeasureCache = this._preMeasureCache[cssStr] = this._preMeasureCache[cssStr] || {};
            var measuredCache = this._wordCache[cssStr] = this._wordCache[cssStr] || {};

            // Break run to word
            var splitChar = "\u00a0";
            var prefix = "~"; // var cache = {}, cache["watch"] will get a function.
            var words = text.split(splitChar);
            var word, keyWord;
            for (var i = 0; i < words.length; i++) {
                word = words[i];
                if (word.length == 0)
                    continue;

                keyWord = prefix + word;
                if (!preMeasureCache[keyWord] && !measuredCache[keyWord])
                    preMeasureCache[keyWord] = word;
            }

            // Split char
            keyWord = prefix + splitChar;
            if (!preMeasureCache[keyWord] && !measuredCache[keyWord])
                preMeasureCache[keyWord] = splitChar;
        },
        /**
         * Measure text by word
         * @param text
         * @param font
         * @param byWord
         * @returns {___anonymous2154_2175}
         */
        _getRunSize: function(text, css) {
            this.textMeasure.innerHTML = '<span style="' + css + '">' + text + '</span>';
            var child = this.textMeasure.firstChild;
            var rect = child.getBoundingClientRect();
            return {
                "w": rect.width,
                "h": rect.height
            };
        },
        measureTextRun_byRun: function(text, font, byWord) {
            var size;

            var cssStr = typeof(font) == "string" ? font : this.getCSSStr(font);
            if (text.length == 1) {
                var cache = this._charCache[cssStr] = this._charCache[cssStr] || {};
                size = cache[text];
                if (!size) {
                    size = this._getRunSize(text, cssStr);
                    cache[text] = size;
                }
            } else
                size = this._getRunSize(text, cssStr);

            return size;
        },

        // TODO move to Worker.
        _preMeasureImpl: function() {
            this._enlargeFrame();
            var start = new Date();
            var measureSpan = "";
            var allWords = [],
                wordStyle = [];
            var words, word, key;
            for (var styleStr in this._preMeasureCache) {
                words = this._preMeasureCache[styleStr];
                for (key in words) {
                    word = words[key];

                    if ((has("ie") || has("trident")) && (word.indexOf('\u3000') == 0 || word.lastIndexOf('\u3000') == word.length - 1)) { // Defect 50250
                        continue; // Don't cache Japanese space character.
                    }

                    allWords.push(word); // Record the word
                    wordStyle.push(styleStr); // Record the word's style
                    measureSpan += '<div style="display:inline-block; white-space: nowrap;' + styleStr + '">' + word.replace(/&/g, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;") + '</div>';
                }
            }

            this.textMeasure.innerHTML = measureSpan;
            var child = this.textMeasure.firstChild;
            var i = 0,
                cacheStyle = null;
            var prefix = "~";
            while (child) {
                rect = child.getBoundingClientRect();

                cacheStyle = this._wordCache[wordStyle[i]];
                cacheStyle[prefix + allWords[i]] = rect.width;
                if (!cacheStyle.height)
                    cacheStyle.height = rect.height > 1 ? rect.height - 1 : rect.height;

                i++;
                child = child.nextSibling;
            }

            var end = new Date();
            //      console.info("Pre layout word count:" + allWords.length + " measure time is: " + (end-start) + "ms.");

            // Clean the prepare measured word
            this._preMeasureCache = {};
        },

        measureHTMLWidth: function(html, css) {
            var measureNode = '<div style="display:inline-block; white-space: nowrap;' + css + '">' + html + '</div>';
            this.textMeasure.innerHTML = measureNode;
            var child = this.textMeasure.firstChild;
            var rect = child.getBoundingClientRect();
            return rect.width;
        },

        _getWordArraySize: function(words, css, cache) {
            //      window.wordLen.push(words.toString());
            //      window.totalLen += words.length;
            var span = "";
            var fixArray = [];
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                var prefix = '',
                    postfix = '';
                if ((has("ie") || has("trident")) && (word.indexOf('\u3000') == 0 || word.lastIndexOf('\u3000') == word.length - 1)) { // Defect 50250
                    // Add prefix and postfix for measure Japanese space character.
                    prefix = '.';
                    postfix = '.';
                    fixArray[i] = true;
                }
                span += '<div style="display:inline-block; white-space: nowrap;' + css + '">' + prefix + '<span>' + word.replace(/&/g, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;") + '</span>' + postfix + '</div>';
            }
            //          span += '<div style="display:inline-block;' + css + '">' + words[i] +'</div>';

            var idx = 0;
            var sizeArray = [],
                rect = null,
                height = 0;
            this.textMeasure.innerHTML = span;
            var child = this.textMeasure.firstChild;
            while (child) {
                var measureNode = child.firstChild;
                if ((has("ie") || has("trident")) && fixArray[idx])
                    measureNode = measureNode.nextSibling;

                rect = measureNode.getBoundingClientRect();
                sizeArray.push(rect.width);
                if (height == 0)
                    height = rect.height > 1 ? rect.height - 1 : rect.height;
                child = child.nextSibling;
                idx++;
            }
            cache.height = cache.height || height;
            return sizeArray;
        },

        /**
         * Measure text by word
         * @param text
         * @param font
         * @param byWord
         * @returns {___anonymous2154_2175}
         */
        measureTextRun_byWord: function(text, font, byWord) {
            var width = 0;
            var cssStr = typeof(font) == "string" ? font : this.getCSSStr(font);
            var cache = this._wordCache[cssStr] = this._wordCache[cssStr] || {};

            // Break run to word
            var splitChar = "\u00a0";
            var prefix = "~"; // var cache = {}, cache["watch"] will get a function.
            var words = null;

            // Defect 39291 for safari, Defect 38452 for IE9 
            // TODO Should consider perfromance on Safari and Mobile. 
            words = (browser.isMobile() || has("safari") || has("ie") <= 9) ? [text] : text.split(splitChar);
            var dupWordCnt = {},
                noCacheWords = [],
                word, cacheWidth, keyWord;
            for (var i = 0; i < words.length; i++) {
                word = words[i];
                if (word.length == 0)
                    continue;

                keyWord = prefix + word;
                cacheWidth = cache[keyWord];
                if (!cacheWidth) {
                    if (dupWordCnt[keyWord])
                        dupWordCnt[keyWord] += 1;
                    else {
                        noCacheWords.push(word);
                        dupWordCnt[keyWord] = 1;
                    }
                    continue;
                }

                width += cacheWidth;
            }

            // Split char
            if (words.length > 1) {
                keyWord = prefix + splitChar;
                cacheWidth = cache[keyWord];
                if (!cacheWidth) {
                    dupWordCnt[keyWord] = words.length - 1;
                    noCacheWords.push(splitChar);
                } else {
                    width += cacheWidth * (words.length - 1);
                }
            }

            if (noCacheWords.length > 0) {
                var wordSizes = this._getWordArraySize(noCacheWords, cssStr, cache);
                var wordWidth = null,
                    word;
                for (var i = 0; i < noCacheWords.length; i++) {
                    wordWidth = wordSizes[i];
                    word = noCacheWords[i];
                    keyWord = prefix + word;
                    cache[keyWord] = wordWidth;
                    width += (wordWidth * dupWordCnt[keyWord]);
                }
            }

            return {
                "w": width,
                "h": cache.height
            };
        },

        _getCharArraySize: function(text, css) {
            var span = "";
            for (var i = 0; i < text.length; i++)
                span += '<span style="' + css + '">' + text[i] + '</span>';

            var sizeArray = [],
                rect;
            this.textMeasure.innerHTML = span;
            var child = this.textMeasure.firstChild;
            while (child) {
                rect = child.getBoundingClientRect();
                sizeArray.push({
                    "w": rect.width,
                    "h": rect.height
                });
                child = child.nextSibling;
            }
            return sizeArray;
        },

        // This function is quicker 10% than measureTextRun2 on FF for Alice100.docx file. 
        measureTextRun_byChar: function(text, font, byWord) {
            var width = 0,
                height = 0;
            var cssStr = typeof(font) == "string" ? font : this.getCSSStr(font);
            var cache = this._charCache[cssStr] = this._charCache[cssStr] || {};
            var dupTextCnt = {},
                noCacheText = "",
                ch, cacheObj;
            for (var i = 0; i < text.length; i++) {
                ch = text[i];
                cacheObj = cache[ch];
                if (!cacheObj) {
                    if (!dupTextCnt[ch]) {
                        noCacheText += ch;
                        dupTextCnt[ch] = 1;
                    } else
                        dupTextCnt[ch] += 1;
                    continue;
                }
                width += cacheObj.w;
                height = Math.max(cacheObj.h, height);
            }

            if (noCacheText.length > 0) {
                var textSizes = this._getCharArraySize(noCacheText, cssStr);
                var size, ch;
                for (var i = 0; i < noCacheText.length; i++) {
                    size = textSizes[i];
                    ch = noCacheText[i];
                    cache[ch] = size;
                    width += (size.w * dupTextCnt[ch]);
                    height = Math.max(size.h, height);
                }
            }
            return {
                "w": width,
                "h": height
            };
        },


        _getCharSize: function(ch, css) {
            var textMeasure = this.textMeasure;
            var span = '<span style="' + css + '">' + ch + '</span>';
            textMeasure.innerHTML = span;
            var rect = textMeasure.firstChild.getBoundingClientRect();
            return {
                "w": rect.width,
                "h": rect.height
            };
        },

        measureCharsWidth: function(text, cssStr) {
            var sizeArray = [],
                len = text.length,
                cache = this._charCache[cssStr] = this._charCache[cssStr] || {};
            for (var i = 0, ch; i < len; i++) {
                ch = text[i];
                if (!cache[ch])
                    cache[ch] = this._getCharSize(ch, cssStr);
                sizeArray.push({
                    "w": cache[ch].w
                });
            }
            return sizeArray;
        },

        measureTextRun2: function(text, font, byWord) {
            var width = 0,
                height = 0;
            var cssStr = typeof(font) == "string" ? font : this.getCSSStr(font);
            var cache = this._charCache[cssStr] = this._charCache[cssStr] || {};
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (!cache[ch])
                    cache[ch] = this._getCharSize(ch, cssStr);
                width += cache[ch].w;
                height = Math.max(cache[ch].h, height);
            }
            return {
                "w": width,
                "h": height
            };
        },


        _measureFontHeight: function(css) {
            //      this.textMeasure.innerHTML ='<span style="' + css + '">Q</span>';
            this.textMeasure.innerHTML = '<div style="display:inline-block; white-space: nowrap;' + css + '">' + "Q" + '</div>'; //;'<span style="' + css + '">Q</span>';
            var rect = this.textMeasure.getBoundingClientRect();

            return rect.height;
        },

        measureTextRun_bak: function(text, font, byWord) {

                //store original font-size
                var fontSize = font['font-size'];

                var textTransform = font['text-transform'];
                if (!textTransform || textTransform == 'none') {
                    textTransform = font['font-variant'];
                }

                if (textTransform != null && textTransform != 'none' && textTransform != 'capitalize') {
                    if (textTransform == "uppercase") {
                        text = text && text.toUpperCase();
                    } else if (textTransform == "lowercase") {
                        text = text && text.toLowerCase();
                    } else if (textTransform == "small-caps") {
                        //small-caps should have the same size with normal text
                        //              text = text.toLowerCase();
                        //              font['font-size'] =  parseInt(font['font-size'] ,10)*0.8+"px";
                    }
                }

                var verticalAlign = font['vertical-align'];
                if (verticalAlign == "super" || verticalAlign == "sub") {
                    var fontsize = tools.transformFontSize(font);
                }


                var width = 0;
                var height = 0;

                var css = "";
                if (font['font-style']) {
                    css = css + font['font-style'] + " ";
                }
                if (font['font-weight']) {
                    css = css + font['font-weight'] + " ";
                }
                if (font['font-size']) {
                    if (fontsize)
                        css = css + fontsize + " ";
                    else
                        css = css + font['font-size'] + " ";
                } else {
                    console.log("font-size is lost!");
                }
                if (font['font-family']) {
                    css = css + font['font-family'];
                } else {
                    console.log("font-family is lost!");
                }

                var measure = this;
                height = measure._fontMeasureCache[css];
                if (!height) {
                    height = measure._measureFontHeight(css);
                    measure._fontMeasureCache[css] = height;
                }


                if (!text || text.length == 0) {
                    return {
                        "w": width,
                        "h": height
                    };
                }


                var charCache;

                charCache = measure._charMeasureCache[css];
                if (!charCache) {
                    charCache = measure._charMeasureCache[css] = [];
                }

                var letterSpace = parseInt(font['letter-spacing']) || 0;
                var context = this.context2d;

                var measureChar = function(ch, noCache) {
                    var charWidth = charCache[ch];
                    if (!charWidth) {
                        var tm = context.measureText(ch);
                        if (noCache) {
                            charWidth = tm.width;
                        } else {
                            charWidth = charCache[ch] = tm.width;
                        }

                    }
                    width += (charWidth + letterSpace);
                };
                //      if (context) {

                context.font = css;

                if (byWord) {
                    if ((has("ie") || has("trident"))) {
                        //TODO: avoid using cache for long text
                        //since measureText in IE is not accurate, I measure all text together
                        measureChar(text, true);
                    } else {
                        //preindex is start of word
                        var preindex = 0;
                        var ch;
                        for (var i = 0; i < text.length; i++) {
                            var code = text.charCodeAt(i);
                            if (code == 160 || code == 32 || code > 0x2100) {
                                //' ' or other unicode character
                                if (i > preindex) {
                                    //calculate from preindex to i-1, then calculate i
                                    ch = text.substr(preindex, i - preindex);
                                    measureChar(ch);
                                }
                                preindex = i + 1;
                                ch = text[i];
                            } else {
                                //char in a word, continue to the end of word
                                continue;
                            }

                            measureChar(ch);
                        }

                        if (preindex < text.length) {
                            //calculate from preindex to end of text
                            ch = text.substr(preindex, text.length - preindex);
                            measureChar(ch);
                        }
                    }

                } else {
                    for (var i = 0; i < text.length; i++) {
                        var ch = text[i];

                        measureChar(ch);
                    }
                }
                //      } else {
                //          //IE8 or other non-HTML5 browser code
                //          var textMeasure = this.textMeasure;
                //          var l = text.length;
                //          var unknownText = [];
                //          var unknown = false;
                //          var ch, chcode;
                //
                //          for (var i = 0; i < l; i++) {
                //              chcode = text.charCodeAt(i);
                //              if (chcode == 32) {
                //                  //' ' to nbsp
                //                  chcode = 160;
                //              }
                //              var charWidth = charCache[chcode];
                //              if (!charWidth) {
                //                  unknown = true;
                //                  if (unknownText[chcode]) {
                //                      unknownText[chcode]++;
                //                  } else {
                //                      unknownText[chcode] = 1;
                //                  }
                //
                //                  //                  var span = '<span style=\'' + css + '\'>' + ch.replace(' ','&nbsp;') + '</span>';
                //                  //                  spanHTML = 
                //                  //                   textMeasure.innerHTML = span;
                //                  //                   charWidth =  charCache[ch] = textMeasure.firstChild.offsetWidth;
                //              } else {
                //                  width += (charWidth);
                //              }
                //
                //          }
                //
                //          //TODO: calulate all chars in one time
                //          if (unknown) {
                //              var spanall = '<span>';
                //
                //              if (G_FRE_CHARS.length == 0) {
                //                  G_FRE_CHARS.push('\u00a0');
                //                  G_FRE_CHARS.push(',');
                //                  G_FRE_CHARS.push('.');
                //                  //0-9
                //                  for (var i = 48; i < 58; i++) {
                //                      G_FRE_CHARS.push(String.fromCharCode(i));
                //
                //                  }
                //                  //letters
                //                  for (var i = 65; i < 91; i++) {
                //                      G_FRE_CHARS.push(String.fromCharCode(i));
                //
                //                  }
                //
                //                  for (var i = 97; i < 123; i++) {
                //                      G_FRE_CHARS.push(String.fromCharCode(i));
                //
                //                  }
                //              }
                //
                //              var spanallEle;
                //              for (var chcode in unknownText) {
                //                  if (chcode == 160) {
                //                      ch = '&nbsp;';
                //                  } else {
                //                      ch = String.fromCharCode(chcode);
                //                  }
                //                  spanall = spanall + '<span>' + ch + '</span>';
                //              }
                //              if (!charCache[48]) {
                //                  //if only char code 48 is not measured, we can say that no char is measured
                //                  for (var i = 0; i < G_FRE_CHARS.length; i++) {
                //                      var ch = G_FRE_CHARS[i];
                //                      var chcode = ch.charCodeAt(0);
                //
                //                      if (!unknownText[chcode]) {
                //                          spanall = spanall + '<span>' + ch + '</span>';
                //                      }
                //
                //                  }
                //              }
                //
                //              spanall = spanall + '</span>';
                //              textMeasure.innerHTML = spanall;
                //              spanallEle = textMeasure.firstChild;
                //              spanallEle.style.cssText = css;
                //
                //              var ele = spanallEle.firstChild;
                //              while (ele) {
                //                  ch = ele.innerText;
                //                  chcode = ch.charCodeAt(0);
                //                  var fn3 = function() {
                //                      return ele.offsetWidth;
                //                  };
                //                  var charWidth = fn3();
                //                  if (chcode == 32) {
                //                      chcode = 160;
                //                  }
                //
                //                  if (unknownText[chcode]) {
                //                      width = width + charWidth * unknownText[chcode];
                //                  }
                //
                //                  charCache[chcode] = charWidth;
                //                  ele = ele.nextSibling;
                //              }
                //
                //          }
                //
                //          width = width + letterSpace * l;
                //      }
                var size = {
                    "w": width,
                    "h": height
                };
                font['font-size'] = fontSize;
                return size;
            }
            //  getStyleStr:function(font){
            //      var str = "";
            //      for(var n in font){
            //          str += n+":"+font[n]+";";
            //      }
            //      return str;
            //  }
    };

    var _beforeHandler = topic.subscribe(constants.EVENT.BEFORE_LOAD, lang.hitch(MeasureText, MeasureText.init));

    return MeasureText;
});
