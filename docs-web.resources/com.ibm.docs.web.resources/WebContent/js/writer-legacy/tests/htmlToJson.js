dojo.provide("writer.tests.htmlToJson");
dojo.require("writer.filter.html.htmlparser");
dojo.require("writer.filter.html.fragment");
if( !common ) var common = {};
if( !common.tools ) common.tools={};

if( !writer.filter ) writer.filter = {};
if( !writer.filter.html ) writer.filter.html = {};

doh.register("htmlToJsonTests",[
 function testHtmlParser(){
	 
	 var html = "<p><a>test Html Parser </a></p>";
	
	 var parser = new writer.htmlParser(); 
	 var tags = [],text;
	 parser.onTagOpen = function( tagName ){
		 tags.push(tagName);
	 };
	 parser.onText = function(string){
		 console.log(string);
		 text = string;
	 };
	 parser.parse(html);
	 doh.assertTrue(tags[0]=="p");
	 doh.assertTrue(tags[1]=="a");
	 doh.assertTrue(text=="test Html Parser ");
 },
 function testHtmlFragment(){
	
	 var html = "<p><a>test Html Parser </a></p>";
	 var fragment = new writer.htmlParser.fragment();
	 fragment.fromHtml(html, true );
	 
 }
]);