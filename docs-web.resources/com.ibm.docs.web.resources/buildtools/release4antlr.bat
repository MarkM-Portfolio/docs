@rem java yuicompressor-2.4.7.jar LexerParser.js & FormulaLexerParser.js

md %1
java -jar buildtools\yuicompressor-2.4.7.jar %2 -o %3
java -jar buildtools\yuicompressor-2.4.7.jar %4 -o %5
