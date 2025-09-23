dojo.provide("writer.plugins.PluginsLoader");
dojo.require("writer.plugins.Save");
dojo.require("writer.plugins.Text");
dojo.require("writer.plugins.Styles");
dojo.require("writer.plugins.Cursor");
dojo.require("writer.plugins.Comments");
dojo.require("writer.plugins.SelectAll");
dojo.require("writer.plugins.Table");
dojo.require("writer.plugins.TableResizer");
dojo.require("writer.plugins.Font");
dojo.require("writer.plugins.DeleteKey");
dojo.require("writer.plugins.EnterKey");
dojo.require("writer.plugins.EscapeKey");
dojo.require("writer.plugins.ContextMenu");
dojo.require("writer.plugins.Clipboard");
dojo.require("writer.plugins.UndoManager");
dojo.require("writer.plugins.list");
dojo.require("writer.plugins.InsertHeaderFooter");
dojo.require("writer.plugins.HeaderFooter");
dojo.require("writer.plugins.InsertImage");
dojo.require("writer.plugins.Link");
dojo.require("writer.plugins.Field");
dojo.require("writer.plugins.Toc");
dojo.require("writer.plugins.Image");
dojo.require("writer.plugins.PageBreak");
dojo.require("writer.plugins.SectionBreak");
dojo.require("writer.plugins.Heading");
dojo.require("writer.plugins.ParagraphProperties");
dojo.require("writer.plugins.Indent");
dojo.require("writer.plugins.TabKey");
dojo.require("writer.plugins.FindReplace");
dojo.require("writer.plugins.SpellCheck");
dojo.require("writer.plugins.MobileInit");
dojo.require("concord.util.browser");
dojo.require("writer.plugins.Footnotes");
dojo.require("writer.plugins.Endnotes");
dojo.require("writer.plugins.Indicator");
dojo.require("writer.plugins.CarriageReturn");
dojo.require("writer.plugins.ShortCutKeyHandler");
dojo.require("writer.plugins.Task");
dojo.require("writer.plugins.FootEndNotes");
dojo.require("writer.plugins.SpecialChar");
dojo.require("writer.plugins.ImageProperty");
dojo.require("writer.plugins.TextBoxProperty");
dojo.require("writer.plugins.Zoom");
dojo.require("writer.plugins.FormatPainter");
dojo.require("writer.plugins.BookMark");
// TODO Need add plugin dependency mechanism. Like many command depend on context menu plugin.

dojo.declare("writer.plugins.PluginsLoader", null, {
	
	_controllernames : ["ContextMenu","Save", "Text", "Styles","Cursor","Task","Comments","Table","TableResizer" ,"Font", "DeleteKey","EnterKey","EscapeKey","Clipboard", 
	                    "UndoManager", "list", "InsertHeaderFooter", "HeaderFooter", "PageBreak", "SectionBreak", "InsertImage", "Link",
						"Field","Toc","Image", "ParagraphProperties", "Heading","Indent", "TabKey","SelectAll", "FindReplace","Footnotes",
						"Endnotes", "SpellCheck","Indicator", "CarriageReturn", "ShortCutKeyHandler","FootEndNotes", "SpecialChar",
						"ImageProperty","TextBoxProperty","Zoom","FormatPainter","BookMark"
	                    ],
	_packageName: "writer.plugins.",
	_controllers: null,
	_editor: null,
	_disable4View:["ContextMenu","TableResizer","ImageProperty"],
	constructor: function(editor) {
		if (!editor){
			throw("create plugins, editor can't be null!");
		}
		this._editor = editor;
		this._controllers = {};
	},
	/**
	 * get plugin
	 * @param name
	 * @returns
	 */
	getPlugin: function( name ){
		return this._controllers[name];
	},
	
	loadAll: function(onlyRead){
		var docEditor = this._editor;
		var createParam = {
			editor: docEditor
		};
		if(concord.util.browser.isMobile())
			this._controllernames.push("MobileInit");
        for( var i in this._controllernames )
        {
        	if(onlyRead &&this._disable4View.indexOf(this._controllernames[i])>=0){
        		continue;
        	}
        	
        	var name = this._controllernames [i];
        	var controller = null;
        	var classObj = dojo.getObject(this._packageName + name);
        	if (classObj) {
        		controller = new classObj(createParam);
        		if (controller){
        			this._controllers[name] = controller;
        		}
        	}
        	if (!controller){
        		console.log("WARING: controller "+ name + " not loaded!!");
        	}
        }
        var methods = [ 'init', 'afterInit' ];
		for ( var m = 0 ; m < methods.length ; m++ )
		{
			 for( var i in this._controllers )
		     {
		     	var controller = this._controllers[i];
		       	if (controller && controller[ methods[ m ] ]){
		       		controller[ methods[ m ] ]();
		       	}
		     }
		}
			
	}
	
});