rem usage: put this bat in the directory of JsExpr.g then run it.
rem usage: it will merge these 6 js files into the one.

del LexerParser.js
del FormulaLexerParser.js
rem for %%f in (js*.js) do type %%f >> 
for %%f in (JSExprLexer.js JSExprParser.js ) do type %%f >> LexerParser.js
echo dojo.provide("parser.FormulaLexerParser"); >> FormulaLexerParser.js
for %%f in (JsFormulaParserLexer.js JsFormulaParserParser.js JsFormulaCommaParserLexer.js JsFormulaCommaParserParser.js) do type %%f >> FormulaLexerParser.js

                                                   
..\..\..\buildtools\nodejs\node.exe ..\..\..\buildtools\uglifyjs\Uglifyjs-1.3.5\bin\uglifyjs --ascii --overwrite LexerParser.js
..\..\..\buildtools\nodejs\node.exe ..\..\..\buildtools\uglifyjs\Uglifyjs-1.3.5\bin\uglifyjs --ascii --overwrite FormulaLexerParser.js
rem java -jar ../../../buildtools/yuicompressor-2.4.7.jar LexerParser.js -o LexerParser.js
rem java -jar ../../../buildtools/yuicompressor-2.4.7.jar FormulaLexerParser.js -o FormulaLexerParser.js
echo window.JsFormulaParserLexer = JsFormulaParserLexer, window.JsFormulaParserParser = JsFormulaParserParser, window.JsFormulaCommaParserLexer = JsFormulaCommaParserLexer, window.JsFormulaCommaParserParser = JsFormulaCommaParserParser >> FormulaLexerParser.js

pause