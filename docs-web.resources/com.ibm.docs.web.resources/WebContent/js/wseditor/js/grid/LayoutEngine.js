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

dojo.provide("websheet.grid.LayoutEngine");
dojo.require("concord.i18n.WordBreakIterator");
dojo.require("concord.i18n.LineBreak");

// Module:
//		websheet/canvas/LayoutEngine
// Description:
//		The module is designed as a singleton to provide text measure utilities.
//		It can measure, clip, wrap texts with an off-screen canvas node.
//		Get a layout engine instance with websheet.CanvasGrid.LayoutEngine.getInstance().

websheet.grid.LayoutEngine = (function () {
	var 
		_G_DEBUG = false,
		_bundle,
		instance,
		initialize = function () {
			var canvas = dojo.create('canvas', {className : 'canvas-measure-node'}, dojo.body(), 'last'),
				context = canvas.getContext('2d'),
				wordBreak = new concord.i18n.WordBreakIterator(""),
				lineBreaker = concord.i18n.LineBreak;
			wordBreak.reset = function (str) {
				this._str = str;
				this._class = [];
			};
			return {
				_canvas		:	canvas,				//local, for faster access
				_context	:	context,			//...
				_lineBreak	:	lineBreaker,		//...
				_wordBreak	:	wordBreak,
				_breakHeight:	null,				//Stop fragment text iteration when lines height reach this;
				_default	:	null,				//The default font state, we can get this from document model.
				_cache		:	{},					//The width for number and signs, key is the width of the ESIGN (character 'E');
				/*
				 * Here is a structural sample, the context font state should contain these factors.
				 * _default	:	{			
				 * 		fontSize : '13px',				//size in pixels, String
				 * 		fontFamily: ['Arial'],			//a string or an array of strings of the font family name
				 * 		fontColor:	null,				//string like "#000000" (black as default)
				 * 		fontStyle:	null,				//italic? default not.
				 * 		fontWeight:	null				//bold ? default null(that means 'normal').
				 * },
				 */

				clipText: function(text, width, /*==optional==*/font) {
					// summary:
					//		Clip the string with the given width and return the clip index of the text and the clipped text.
					// text:	String
					// width:	Number, pixels
					// font:	Optional
					// returns:
					//		{
					//			position: number, the clip index
					//			text: string, the clipped substring of the original text
					//			clipWidth: width of the text content
					//		}
					if (!text || !width || width <= 0) {
						return { position: 0, text: '', clipWidth: 0 };
					}
					if (font != null) {
						this.state(font);
					}
					var ctx = this._context;
					var total = ctx.measureText(text).width;
					//no need to clip.
					if (total <= width)	{
						return { position: text.length, text: text };
					}
					var strbuf = '', 
						len = text.length,
						current = 0, 
						srgtLead, 
						from = 0, 
						to = parseInt(width / (total / len)),
						c = text.charCodeAt(to);//code point
					
					if ((((c)&0xfffff800) == 0xd800) && !(((c)&0x400)==0)) {
						//it's a surrogate code point, and it's not the lead
						//see concord.i18n.utf for more details.
						to += 1;
					}
					strbuf = text.substring(from, to);
					current = ctx.measureText(strbuf).width;
	
					if (current == width || (width > current && width - current < 3)) {
						//a magic 3 to improve performance, no need to find another character, 3px is not an enough space for any character.
						return { position: to, text: strbuf, clipWidth: current };
					}
					var increase = (current > width) ? false : true;
					var delta, backtracing;
					for (; from > -1 && to <= len;) {
						if (to <= 0 && !increase)
							//it has decreased to empty string, directly return '';
							return { position: 0, text: '', clipWidth: 0};
						delta = increase ? 1  : -1;
						to += delta;
						if (to > 0) {
							c = text.charCodeAt(to);
							if ((((c)&0xfffff800) == 0xd800) && !(((c)&0x400)==0))
								to += delta;
						}
						strbuf = text.substring(from, to);
						if (backtracing) {
							return { position: to, text: strbuf, clipWidth: current };
						}
						current = ctx.measureText(strbuf).width;
						if (current == width || (!increase && current < width) || (increase && (current < width && width - current < 3))) {
							return { position: to,text: strbuf, clipWidth: current };
						} else if (increase && current > width) {
							//take a step back...
							backtracing = true;
							increase = false;
							continue;
						}
					}
					return { position: text.length, text: text, clipWidth: current };
				},
				
				fragmentText: function (text, maxWidth, /*==optional==*/font) {
					// summary:
					//		Text wrapping, breaks the given text into lines with the given width under the given font state.
					// text:	String,
					//		This is the text string for wrap.
					// maxWidth:	Number,
					//		This is the width of the text box.
					// font:	Object,
					//		This can be ignored if there's no state change, giving this means a context state change before wrap calculation.
					//		You can also make the change with the call of engine.state(font);
					// returns:
					//		array of lines, together with array of widths
					if (font != null) {
						this.state(font);
					}
					var 
						ctx = this._context,
						width = ctx.measureText(text).width;
					if (width < maxWidth) {
						// can be fully displayed, return directly.
						return {
							lines: [text],
							widths: [width]
						};
					}
					if (!maxWidth || maxWidth <= 0) {
						var _charWidth = ctx.measureText('A').width;
						return {
							lines : (text || "").split(""),
							widths: (Array((text || "").length).join().split(",").map(function () {return this.width;}, {width : _charWidth}))
						};
					}
					var 
						outOfRange = false,
						lines = [],
						widths = [],
						len = text.length,
						from = to = 0,						//the start/end position of the word
						wordBrker = this._wordBreak,
						lineBrker = this._lineBreak,
						average = (maxWidth / (width / len)) | 0,
						substr,								//current string that under measure
						currentWidth,						//width of current string
						backtracing = false,
						lineBrk,							//possible line break position
						wordBrk,							//word boundary
						forceFit;							//the word is longer than the max width.
					
					wordBrker.reset(text);
					
					if (_G_DEBUG) {
						this.measureWidth.count = 0;
						this.fragmentText.count = 0;
					}
					to = wordBrker.nextBoundary(average);
					substr = text.substring(from, to);
					
					while (from < len) {
						if (_G_DEBUG) {
							this.fragmentText.count++;
						}
						if (this._breakHeight != null && lines.length * /*minimum height*/12 > this._breakHeight) {
							outOfRange = true;
							break;
						}
						currentWidth = ctx.measureText(substr).width;
						if (currentWidth <= maxWidth) {
							if (backtracing) {
								lines.push(substr);
								widths.push(currentWidth);
								from = to;
								to = Math.min(from + average, len);
								backtracing = false;
							} else {
								//increase the words
								wordBrk = wordBrker.nextBoundary(to);
								if (wordBrk > to) {
									to = wordBrk;
								} else {
									lines.push(substr);
									widths.push(currentWidth);
									from = to;
									to = Math.min(from + average, len);
								}
							}
							if (from < len) {
								substr = text.substring(from, to);
							} else {
								break;
							}
						} else {
							//search back
							backtracing = true;
							lineBrk = lineBrker.findLineBreak(substr, substr.length - 1);
							if (lineBrk <= 0) {
								//can not find a line break opptunity, clip the string.
								forceFit = this.clipText(substr, maxWidth);
								if (forceFit.position == 0 && substr.length > 0) {
									//not enough space for even one character,
									lines.push(substr.substring(0,1));
									widths.push(ctx.measureText(substr.substring(0,1).width));
									from++;
									to = Math.min(from + average, len);
								} else {
									lines.push(forceFit.text);
									widths.push(forceFit.clipWidth);
									from = from + forceFit.position;
									to = Math.min(from + average, len);
								}
								backtracing = false;
							} else {
								to = from + lineBrk;
							}
							substr = text.substring(from, to);
						}
					};
					if (_G_DEBUG) {
						var average = this.measureWidth.count / lines.length;
						if (average > 1) {
							console.info("Fragment text main loop run for ", this.fragmentText.count, " times.");
							console.info("They're breaked into ", lines.length, " lines. That's ", average, " measures for one line on average.");
							console.info("Details\n\tText:",text,"\n\twidth:", maxWidth, "\n\tfont:", this._context.font);
						}
					}
					return {
						lines: lines,
						widths: widths,
						beyond : outOfRange
					};
				},
				
				measureWidth: function (text, /*==optional==*/font) {
					// summary:
					//		Return the width for the given text.
					// text: String
					// font: Optional, Object
					//		Refer to the "default font state" for more info about font components.
					if (_G_DEBUG) {
						this.measureWidth.count == null ?
								this.measureWidth.count = 0 : this.measureWidth.count++;
					}
					if (font != null) 
						return this.state(font).measureWidth(text);
					else
						return this._context.measureText(text || "").width;
				},
				
				measureHeight: function (text, width, /*==optional==*/font) {
					// summary:
					//		Use the line height directly for render, you can call this if you want to make it precise.
				},
				
				reloadDefaultState: function () {
					// summary:
					//		The default font style will not change after load, or we have to reload it from model.
					_bundle = null;
				},
				
				roundNumber: function (numberString, widthLimit, indent, optionalContext, fontInfo, locale) {
					// summary:
					//		Used for the "General Number Format" (Numbers without explicit formats), follow the rules of Excel;
					//		The default number format that Excel applies when you type a number. 
					//		For the most part, numbers that are formatted with the General format are displayed just the way you type them. 
					//		However, if the cell is not wide enough to show the entire number, the General format rounds the numbers with decimals. 
					//		The General number format also uses scientific (exponential) notation for large numbers (12 or more digits).
					// number, widthLimit:
					//		Mandatory argument, 'numberString' should be a STRING type;
					// number, indent:
					//		Mandatory, the rule for indent:
					//		Rule 1. Width(number string) + Indent < widthLimit, turned the number string to "#" (according to widthLimit);
					//		Rule 2. Width + Indent < widthLimit, and Indent == 0, normal round;
					// fontObj & optionalContext:
					//		It's optional.
					// returns:
					//		String of the rounded result, like "1.234", "2.345E-10", ......
					//		If there're not enough space to construct a meaningful result, will return multiple "#".
					var _ctx = optionalContext || this._context;
					if (fontInfo != null) {
						if (typeof fontInfo == 'string') {
							_ctx.font = fontInfo;
						} else {
							_ctx.font = this._toFontString(dojo.mixin({}, this._default, fontInfo));
						} 
					}
					var indentWidth = indent || 0;
					var initialWidth = _ctx.measureText(numberString).width;
					if (initialWidth <= widthLimit - indentWidth) {
						// the number can be fully displayed; directly return the result;
						return numberString;
					}
					if (!_bundle) {
						_bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
					}
					var ESIGN = _ctx.measureText("E").width;
					var decimal = _bundle["decimal"];
					var DP; 	//'.' decimal Point;
					var RP; 	//'#' replacement
					var PLUS; 	//'+/-' SIGN 
					var NUMBER; //'0-9' 
					var _cache = this._cache[ESIGN];
					if (_cache) {
						NUMBER = _cache.NUMBER;
						PLUS = _cache.PLUS;
						DP = _cache.DP;
						RP = _cache.RP;
					} else {
						_cache = this._cache[ESIGN] = {};
						PLUS = _cache.PLUS = _ctx.measureText("+").width;
						NUMBER = _cache.NUMBER = _ctx.measureText("0").width;
						DP = _cache.DP = _ctx.measureText(decimal).width;
						RP = _cache.RP = _ctx.measureText("#").width;
					}
					var widthLeft = widthLimit;
					if (widthLeft < NUMBER || widthLeft < PLUS) {
						// width too small for even a single number;
						return "";
					}
					if (initialWidth + indentWidth > widthLimit && indentWidth > 0) {
						// if there're not enough space for the indented number, return "###";
						return (new Array(parseInt(widthLimit / RP) + 1).join("#"));
					}
					widthLeft -= indentWidth;
					// else (indentWidth == 0, and not enough space), need to round the number then....
					// convert negative number to positive;
					var negative = (numberString.substring(0, 1) == '-');
					var numstr;
					if (negative) {
						numstr = numberString.substring(1);
						widthLeft -= PLUS;
					} else {
						numstr = numberString;
					}
					var integral, fraction, exponent;
					var dpIndex = numstr.indexOf(decimal);
					var esIndex = numstr.indexOf('E');
					if (esIndex < 0) {
						integral = (dpIndex < 0) ? numstr : numstr.substring(0, dpIndex);
						fraction = (dpIndex < 0) ? '' : numstr.substring(dpIndex + 1);
						var integralWidth = integral.length * NUMBER;
						if (integralWidth > widthLeft) {
							var numstr = Number(integral + '.' + fraction).toExponential().toUpperCase();
							var parts = numstr.split(/E[+-]/);
							if (parts[1] && parts[1].length == 1) {
								// convert E+8 to E+08
								parts[1] = '0' + parts[1];
								numstr = parts.join(numstr.substr(-3, 2));
							}
							dpIndex = numstr.indexOf('.');
							esIndex = numstr.indexOf('E');
						}
					}
					if (dpIndex < 0) {
						if (esIndex < 0) {
							integral = numstr;
							fraction = exponent = "";
						} else {
							integral = numstr.substring(0, esIndex);
							exponent = numstr.substring(esIndex);
						}
					} else {
						integral = numstr.substring(0, dpIndex);
						if (esIndex < 0) {
							fraction = numstr.substring(dpIndex + 1);
							exponent = "";
						} else {
							fraction = numstr.substring(dpIndex + 1, esIndex);
							exponent = numstr.substring(esIndex);
						}
					}
					if (exponent) {
						widthLeft -= (ESIGN + PLUS + (exponent.length - 2) * NUMBER);
						if (widthLeft >= (DP + 2 * NUMBER)) {
							widthLeft -= DP;
							var sig_count = (widthLeft / NUMBER) | 0;
							var pre = Number(integral + "." + fraction).toFixed(sig_count - 1).replace(/\.0+$/, '');
							var parts = pre.split('.');
							integral = parts[0];
							fraction = parts[1] || "";
						} else if (widthLeft >= (NUMBER)) {
							integral = Number(integral + "." + fraction).toFixed(0);
							fraction = "";
						} else {
							return (new Array(parseInt(widthLimit / RP) + 1).join("#"));
						}
					} else {
						var integralWidth = integral.length * NUMBER;
						widthLeft -= integralWidth;
						if (widthLeft >= (DP + NUMBER) && fraction.length > 0) {
							widthLeft -= DP;
							var sig_count = (widthLeft / NUMBER) | 0;
							var prefraction = fraction.substring(0, sig_count);
							var leading_zeros = fraction.match(/^0+/, '');
							leading_zeros = leading_zeros ? leading_zeros[0] : "";
							var carry = fraction.substring(sig_count, sig_count + 1);
							if (carry > '4') {
								prefraction = String(Number(prefraction) + 1);
								if (prefraction.length + leading_zeros.length > sig_count) {
									if (leading_zeros.length > 0) {
										leading_zeros = leading_zeros.substring(0, leading_zeros.length - 1);
										fraction = leading_zeros + prefraction;
									} else {
										fraction = "";
										integral = String(Number(integral) + 1);
									}
								} else {
									fraction = leading_zeros + prefraction;
								}
							} else {
								fraction = prefraction;
							}
						} else if (widthLeft > -1){
							var carry = fraction.substring(0, 1);
							if (carry > '4') {
								integral = String(Number(integral) + 1);
							}
							fraction = "";
						} else {
							return (new Array(parseInt(widthLimit / RP) + 1).join("#"));
						}
					}
					fraction = fraction.replace(/0+$/, '');
					var result = integral;
					if (fraction) {
						result += decimal + fraction;
					}
					if (exponent) {
						result += exponent;
					}
					if (negative) {
						result = '-' + result;
					}
					return result;
				},
				
				state: function (args) {
					// summary:
					//		Change the canvas context with the given arguments. 
					//		Should avoid unnecessary canvas state changes for performance improvement.
					// args:	Object
					//	|	The given font state, it may contains 'fontSize', 'fontFamily', 'fontColor', 'fontColor', 'fontStyle', 'fontWeight'
					//	|	at least one of them.
					//	|	If you're giving a null for args, the layout engine will restore to the default state.
					// returns:
					//		Return self reference to make chaining calls.
					if (this._default == null) {
						this._initialDefaultState();
					}
					if (args == null) {
						// restore to default context
						this._context.restore();
						this._context.save();
					} else {
						if (typeof args == 'string') {
							this._context.font = args;
						} else {
							this._context.font = this._toFontString(dojo.mixin({}, this._default, args));
						}
					}
					return this;
				},
				
				setBreakCondition: function (limit) {
					// summary:
					//		You can set a limit height as the break condition to prevent the layout engine from trapping in long long string wrap calculation;
					if (limit > 0) {
						this._breakHeight = limit;
					} else {
						this._breakHeight = null;
					}
					return this;
				},
				
				_initialDefaultState: function () {
					// load default font style from model, 
					var 
						style = websheet.style.DefaultStyleCode,
						sc = websheet.Constant.Style,
						size = style.getAttr(sc.SIZE),
						family = style.getAttr(sc.FONTNAME),
						color = style.getAttr(sc.COLOR),
						italic = style.getAttr(sc.ITALIC),
						bold = style.getAttr(sc.BOLD),
						sizeInPx = Math.round(size * websheet.Utils.getPtPxRatio()) + "px",
						ctx = this._context;
					this._default = {
						fontSize : sizeInPx,
						fontFamily : family,
						fontColor : color,
						fontStyle : italic,
						fontWeight : bold
					};
					ctx.font = this._toFontString(this._default);
//					ctx.fillStyle = color || "#000000";
					this._context.save();
				},
				
				_toFontString: function (font) {
					// convert font object to a font string, the font string can be assigned to the canvas font attribute.
					var fontstr = '';
					(font.fontWeight) && (fontstr += "bold ");
					(font.italic) && (fontstr += "italic ");
					fontstr += (font.fontSize + " ") || "13px ";
					fontstr += (font.fontFamily) || "Arial";
					return fontstr;
				}
			};
		};
	return {
		getInstance: function () {
			if (instance == null) {
				instance = initialize();
			}
			return instance;
		}
		,
		
		performanceTest: function () {
			var engine = this.getInstance();
			var testString = "原锟斤拷锟解：习锟斤拷平锟斤拷迎锟斤拷式锟较斤拷锟斤拷锟斤拷锟斤拷印锟斤拷系锟斤拷战锟斤拷锟斤拷锟斤拷锟饺拷锟接帮拷锟� 锟斤拷锟斤拷锟斤拷锟铰碉拷锟斤拷9锟斤拷18锟秸碉拷(锟斤拷锟斤拷 锟斤拷朔) 锟斤拷锟节★拷";
			var t1 = new Date();
			var times = 10000;
			for (var i = 0; i < times; i++) {
				engine.fragmentText(testString, (Math.random() * 200  | 0));
			}
			var t2 = new Date();
			console.info("Measure ", times, " times, cost ", (t2-t1), "ms. \nAverage:", (t2-t1)/times, "ms/measure.");
		},
		
		roundNumberPerfTest: function () {
			var engine = this.getInstance();
			var test_cases = [];
			test_cases.push({
				num : "1234.56789",
				width : 55
			});
			test_cases.push({
				num : "123457E+11",
				width : 60
			});
			test_cases.push({
				num : "0.011999712",
				width : 60
			});
			var counting = 0;
			var times = 100000;
			console.time("Round number performance test");
			var t0 = new Date();
			var _case;
			var editor = websheet.model.ModelHelper.getEditor();
			var locale = editor.scene.getLocale();
			while (counting < times) {
				_case = test_cases[counting % 3];
				engine.roundNumber(_case.num, _case.width, null, null, loacle);
				counting++;
			}
			console.timeEnd("Round number performance test");
			var t1 = new Date();
			console.info("That is ", (t1 - t0) / times, "ms for each number on average;");
		}
	};
})();