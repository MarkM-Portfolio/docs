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
	"dojo/_base/declare",
	"concord/util/browser",
	"writer/plugins/PluginsListBase",
	"writer/plugins/BookMark",
	"writer/plugins/Field",	
    "writer/plugins/Comments",
    "writer/plugins/FootEndNotes",
    "writer/plugins/Footnotes",
    "writer/plugins/Endnotes",    
    "writer/plugins/SectionBreak",  
    "writer/plugins/CarriageReturn",
    "writer/plugins/InsertHeaderFooter",
    "writer/plugins/HeaderFooter",
    "writer/plugins/SpellCheck",
    "writer/plugins/Task",
    "writer/plugins/TextBoxProperty",
    "writer/plugins/Toc",
    "writer/plugins/Print",
    "writer/plugins/PrintHTML",
    "writer/plugins/Columns",
    "writer/plugins/Navigation",
    "writer/plugins/MobileInit"
], function(declare, browser, PluginsListBase, BookMark, Field, Comments, FootEndNotes, Footnotes, Endnotes, SectionBreak, CarriageReturn, InsertHeaderFooter, HeaderFooter, SpellCheck, Task, TextBoxProperty, Toc, Print, PrintHTML, Columns, Navigation, MobileInit) {
    var PluginsListExt = declare("writer.plugins.PluginsListExt", PluginsListBase, {
        constructor: function(editor) {
        	this._controllernames = ["BookMark", "Field", "Comments",
        	                         "FootEndNotes", "Footnotes",   "Endnotes",      	                         
        	                         "SectionBreak", "CarriageReturn", 
        	                         "InsertHeaderFooter", "HeaderFooter", 
        	                         "SpellCheck", "Task",
        	                         "TextBoxProperty", "Toc", "Print", "PrintHTML", "Columns", "Navigation"];

            this._classList = [ BookMark, Field, Comments, 
                              FootEndNotes, Footnotes, Endnotes, 
                              SectionBreak, CarriageReturn, 
                              InsertHeaderFooter, HeaderFooter, 
                              SpellCheck, Task,
                              TextBoxProperty, Toc, Print, PrintHTML, Columns, Navigation
                  ],

        	this._editor = editor;
            this._controllers = {};
            if (browser.isMobile()) {
                this._controllernames.push("MobileInit");
                this._classList.push(MobileInit);
            }
        }
    });

    return PluginsListExt;
});
