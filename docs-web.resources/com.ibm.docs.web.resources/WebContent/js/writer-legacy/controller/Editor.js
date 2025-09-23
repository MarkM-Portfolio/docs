dojo.provide("writer.controller.Editor");
window.controller={};
window.common={};
window.model = {};
window.view = {};
dojo.require("writer.controller.EditShell");
dojo.require("writer.plugins.PluginsLoader");
dojo.require("writer.core.Command");
dojo.require("concord.util.browser");
dojo.require("dojox.html.metrics");
dojo.requireLocalization("writer","lang");

controller.Editor= function(){
	this._viewModel = pe.scene.isHTMLViewMode();
	this.init();
};

controller.Editor.fontResizeState = 1;

controller.Editor.prototype = {
	//Shell
	_shell : null,
	_commands : [],
	editorHandlers: [],
	dropdwonState:{"color": "auto", "backgroundColor": "auto"},
	defaultStyle: {},	// Define the editor predefined default style definition. The default style will be defined in other plugins.
	styleIndex : 1,	// Only use for generate css.
	_pluginsLoader: null,
	_scale : 1,
	padding: 10,
	/**
	 * List of keystrokes associated to commands. Each entry points to the
	 * command to be executed.
	 * @type Object
	 * @example
	 */
	_keystrokes : {},
	_viewModel:false,
	_enableCommand:['find',"left", "to_left", "left_ctrl", "to_left_ctrl", "right", "to_right", "right_ctrl", "to_right_ctrl",
	                "up", "to_up", "down", "to_down", "pageup", "pagedown", "to_pageup", "to_pagedown",
	                "home", "to_home", "home_ctrl", "to_home_ctrl", "end", "end_ctrl", "to_end", "to_end_ctrl","copy","selectAll"],
	init:function(){
		this._css = ["/styles/css/writer/writer.css"];
		this._keystrokes = {};
		this.lists = {};	// Record all lists
		this.getEditorDIV();
		
		this.renderPlaceholder();
		
		dojox.html.metrics.initOnFontResize();

		var handler = dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, this._regEvent);
		this.editorHandlers.push(handler);
		
		this._pluginsLoader = new writer.plugins.PluginsLoader(this);
		this._pluginsLoader.loadAll(this._viewModel);
		if(this._viewModel){
			var publish = dojo.publish;
			dojo.publish = function(topic,args){
				/*
				if(topic == writer.EVENT.SELECTION_CHANGE){
					return;
				}
				*/
				publish(topic,args);
			};
		}
		
		pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));
	},
	getScale: function(){
		return this._scale;
	},
	setScale: function(scale){
		this._scale = scale;
	},
	isReadOnly:function(){
		return this._viewModel;
	},
	_regEvent: function(){
		// Load document in editor will trigger this event one time
		// After Render to register the zoom change event.
		dojo.connect(dojox.html.metrics, "onFontResize", this, "textSizeChanged");
	},
	textSizeChanged:function(){
		controller.Editor.fontResizeState++;
		
		// Clean measure text cache.
		common.MeasureText.cleanCache();
		
		this.getSelection().updateSelection();
	},
	
	isHeaderFooterEditing: function(){
		var mode = this._shell&&this._shell.getEditMode();
		return (mode == EDITMODE.HEADER_FOOTER_MODE);
	},
	isFootnoteEditing: function(){
		var mode = this._shell&&this._shell.getEditMode();
		return (mode == EDITMODE.FOOTNOTE_MODE);
	},
	isEndnoteEditing:function(){
		var mode = this._shell&&this._shell.getEditMode();
		return (mode == EDITMODE.ENDNOTE_MODE);
	},
	isContentEditing:function(){
		var mode = this._shell.getEditMode();
		return (mode == EDITMODE.EDITOR_MODE);
	},
	setData: function( json ){
	//content, setting, relations, style, numbering are in json
		if (!json.setting){
			console.log("WARNING:setting is null");
			json.setting = {};
		}
		if (!json.numbering){
			console.log("WARNING:numbering is null");
			json.numbering = {};
		}
		
		if (!json.relations){
			console.log("WARNING:relations is null");
			json.relations = {};
		}
		if (!json.content){
			throw "ERROR: content is null!!";
		}
		
		if (!json.style){
			console.log("WARNING:style is null");
			json.style = {};
		}
		
		this.source = json;
	},
	
	getEditorDIV:function(){
		if (!this._editorDiv){
			if(concord.util.browser.contentInIframe())
			{
				var cssString = '<style type="text/css"></style>';
				var data =
					'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
					'<html xmlns="http://www.w3.org/1999/xhtml"><head>' + cssString +
					'</head>' +
					'<body id="editorBody" class="bodyClass"><div id="editor" class="writer" style="position:absolute; left:0px; padding:' + this.padding + 'px"></div></body>'+
					'</html>';
				var doc = dojo.byId("editorFrame").contentWindow.document; 
				doc.open();
				doc.write( data );
				doc.close();
				if (pe.scene.isViewCompactMode()) {
                    dojo.style(doc.body, 'background', 'none transparent');
                 }
				this._editorDiv = dojo.byId("editor", doc);	
				
				var head = doc.getElementsByTagName("head")[0];
				dojo.forEach(this._css, function(css){
					 dojo.create("link", {
						className : "ckstyle",
						type: "text/css",
						rel: "stylesheet",
						href: contextPath + staticRootPath + css
					}, head);
				});
				dojo.create("link", {
					className : "ckstyle",
					type: "text/css",
					rel: "stylesheet",
					href: contextPath + staticRootPath+'/js/dijit/themes/oneui30/oneui30.css'
				}, head);
			}
			else		
			{
				var data ='<div id="editor" class="writer" style="position:absolute; left:0px; padding:' + this.padding + 'px"></div>';
				var doc = dojo.byId("editorFrame"); 
				doc.innerHTML = data;
				this._editorDiv = dojo.byId("editor");
			}
		}
		return this._editorDiv;
	},
	
	/**
	 * The function will render a place holder after editor was created.
	 */
	renderPlaceholder: function()
	{
		var nls = dojo.i18n.getLocalization("writer","lang");
		pe.scene.showWarningMessage( nls.LOADING );
		
		var left = pe.scene.getEditorLeft();
		this.placeHolderNode = dojo.create("div", {
			"class": "document editingBody",
			"style":"position: absolute; left: "+ left +"px; height:1122px"
		});

		var pageNode = dojo.create("div", {
			"class":"paging",
			"style":"left: -12.0px; top: 0px; width: 794px; height: 1122px; position: absolute;"
		}, this.placeHolderNode);
		
		dojo.create("div", {"style":"position: absolute; z-index: -20001; width: 24px; height: 24px; top: 72px; left: 96px; border-right: 1px solid  #ADADAD; border-bottom: 1px solid #ADADAD;"}, pageNode);
		dojo.create("div", {"style":"position: absolute; z-index: -20001; width: 24px; height: 24px; top: 72px; left: 673.733px; border-left: 1px solid #ADADAD; border-bottom: 1px solid #ADADAD;"}, pageNode);
		dojo.create("div", {"style":"position: absolute; z-index: -20001; width: 24px; height: 24px; left: 96px; top: 1026.53px; border-top: 1px solid #ADADAD; border-right: 1px solid #ADADAD;"}, pageNode);
		dojo.create("div", {"style":"position: absolute; z-index: -20001; width: 24px; height: 24px; left: 673.733px; top: 1026.53px; border-top: 1px solid #ADADAD; border-left: 1px solid #ADADAD;"}, pageNode);
		
		var editorDiv = this.getEditorDIV();
		editorDiv.appendChild(this.placeHolderNode);
	},
	
	removePlaceHolder: function()
	{
		if(this.placeHolderNode)
		{
			var parent = this.placeHolderNode.parentNode;
			parent && parent.removeChild(this.placeHolderNode);
			this.placeHolderNode = null;
		}	
	},
	
	getEditorDoc:function(){
		if(!this._editorDoc){
			var doc = concord.util.browser.getEditAreaDocument();
			this._editorDoc=doc;
		}
		return this._editorDoc;
	},
	focus: function(){
		this._shell.focus();
//		var inputIframe = dojo.query("iframe.inputWrapper")[0];
//		inputIframe&&inputIframe.focus();
	},
	startEngine:function(){
//		console.groupCollapsed && console.groupCollapsed("========== Open document process. =============");
//		var begin = new Date();
		if(!this.layoutEngine){
			this.layoutEngine = new controller.LayoutEngine(this);
			window.layoutEngine= this.layoutEngine;
			layoutEngine.start();
			//
			this._shell = new writer.controller.EditShell();
			this._shell.connect( this );
		}
		else{
			// Reload
			this._cleanState();
			layoutEngine.start();
		}
//		var end = new Date();
//		console.info("Total time:" + (end-begin));
//		console.groupEnd && console.groupEnd();
	},
	/**
	 * reset the layout and render .
	 */
	reset:function(){
		var node = this.getEditorDIV();
		var cursor = node.childNodes[1];
		var editorNode = node.childNodes[0];
		node.removeChild(editorNode);
		node.removeChild(cursor);
		this.layoutEngine.layoutDocument();
		this.layoutEngine.renderDocument();
		node.appendChild(cursor);
	},
	getSelection: function(){
		return this._shell.getSelection();
	},
	getSelectedParagraph: function(maxCount)
	{
		var paras = [];
		var selection = this.getSelection();
		if (!selection){
			return paras;
		}
		var ranges = selection.getRanges();
		if (!ranges){
			return paras;
		}
		for (var i = 0; i < ranges.length; i++) {
			var range = ranges[i];
			if( range && writer.util.RangeTools.ifContainOnlyOneTextBox(range)){
				paras = paras.concat(range.startModel.obj.getParagraphs());
			}else{
				var it = new writer.common.RangeIterator( range, maxCount );
				var para = null;
				// TODO Select paragraphs in table
				while ( para = it.nextParagraph()) {
					if(para.modelType == writer.MODELTYPE.PARAGRAPH)
						paras.push(para);
				}
			}
			
		}
		return paras;
	},
	getShell: function()
	{
		return this._shell;
	},
	/**
	 * 
	 * @param commandName
	 * @param data
	 * @returns true for success; false for failure
	 */
	execCommand : function( commandName, data )
	{
		var command = this.getCommand( commandName );

		var returnValue = false;
		if ( command && (command.state != writer.TRISTATE_DISABLED && command.state != writer.TRISTATE_HIDDEN ))
		{
			try {
				dojo.publish(writer.EVENT.BEFORE_EXECCOMMAND,[commandName]);
				
				returnValue = command.execute(data);
			} catch (e) {
				var errorData = "Execute command: " + commandName
						+ " throw exception: " + e;
				console.error(errorData);
				// var evalFn = function($$$$){return(eval($$$$))};
				// concord.text.tools.printExceptionStack("Exception when
				// execute a command: "+ commandName + ' ' + e,evalFn);
				// returnValue = false;
				this.sendLog(errorData, command.isCritical);
			}
		}

		return returnValue;
	},
	
	/**
	 * The arguments can be 
	 * 		Object : Model	
	 * 		String : Object ID
	 * 		Null :  Current selected object
	 */
	printModel: function(model)
	{
		var obj = null;
		if(!model)
		{
			var paras = this.getSelectedParagraph();
			obj = paras.length > 0 ? paras[0] : null;
		}	
		else if(typeof model == "string")
		{
			obj = this.document.byId(model);
		}	
		else if(typeof model == "object")
		{
			obj = model;
		}
		
		if(obj)
		{
			window.debugModel = obj;
			if(obj.modelType == writer.MODELTYPE.PARAGRAPH)
				console.info(dojo.toJson(obj.toJson( undefined, undefined, true)));
			else
				console.info(dojo.toJson(obj.toJson()));
		}	
	},
	
	/**
	 * The arguments can be 
	 * 		Object : Model
	 * 		String : Object ID
	 * 		Null :  Current selected object
	 */
	printView: function(model)
	{
		
	},
	
	/**
	 * Sent client log to server.
	 * @param logData
	 * @param isCritical is true will force client reload
	 */
	sendLog: function(logData, isCritical)
	{
//		var sel = this._getFakeSelection();
//		logData += ". \n With selection:" + sel;
		
		var logMsg = WRITER.MSG.sendLogMessage(logData);
		var session = pe.scene.session;
		if(isCritical)
		{
			var inArray = function(arr, obj)
			{
				for(var i=0; i<arr.length; i++)
				{
					if(arr[i] == obj)
						return true;
				}	
			};
			
			// Force send to server.
			var sendFunc = function()
			{
				var sendSuccess = true;
				if(inArray(session.sendoutList, logMsg) || inArray(session.waitingList, logMsg))
					sendSuccess = false;
				
				if(sendSuccess)
					session.reload();
				else{
					concord.net.Sender.send();
					setTimeout(function(){
						sendFunc();
					}, 500);
				}
			};
			
			sendFunc();
		}
	},

	/**
	 * Adds a command definition to the document.
	 * @param {String} commandName The indentifier name of the command.
	 * @param commandDef the command definition, should have exec function
	 * @param keyCombine the short cut key for this command, optional
	 * @example
	 * var styleCommand = function( style )
		{
			this.style = new writer.style(style);
		};
		styleCommand.prototype.exec = function( )
		{
		};
	 * editor.addCommand( 'bold', new styleCommand({ 'font-weight':'bold' }));
	 */
	addCommand : function(commandName, commandDef, keyCombine)
	{
		this._commands[commandName] = new writer.core.Command(this, commandDef, commandName);
		if(this._viewModel && this._enableCommand.indexOf(commandName)<0){
			this._commands[commandName].disable();
		}
		if (keyCombine){
			this.setKeyStroke(keyCombine, commandName);
		}
		
	},
	/**
	 * Gets one of the registered commands. Note that, after registering a
	 * command definition with addCommand, it is transformed internally
	 * into an instance of {@link writer,core.Command}, which will be then
	 * returned by this function.
	 * @param {String} commandName The name of the command to be returned.
	 * This is the same used to register the command with addCommand.
	 * @returns {writer.core.Command} The command object identified by the
	 * provided name.
	 */
	getCommand : function(commandName)
	{
		return this._commands[ commandName ];
	},
	
	setKeyStroke: function (keyCombine, commandName){
		if (!keyCombine || !commandName){
			throw "keycombine and commandName can't be null when setting keystroke";
		}
		this._keystrokes[keyCombine] = commandName;
	},
	/**
	 * Get the one of the registered command by the key combination. 
	 * @param keyCombination The key combination.
	 * @returns {writer.core.Command} The command object which connected with key combination
	 * 
	 */
	getKeyStroke: function(keyCombine){
		return this._keystrokes[keyCombine];
	},
	
	
	prepareEditor: function() {
		
	},
	getDomDocument: function(){
		if(!this.domDocument)
			this.domDocument = dojo.query('div.document',this._editorDiv )[0].ownerDocument;
		return this.domDocument;
	},
	//End
	
	onEditorResized: function(){
		this._viewWidth = null;
		this._viewHeight = null;
		this.cleanScrollCache();
	},
	
	/*
	 * get view height
	 */
	getViewHeight: function(){
		if(!this._viewHeight){
			if (concord.util.browser.isMobile()) {
				this._viewHeight = window.innerHeight;
			}
			else {
				var doc = this.getDomDocument();
				this._viewHeight = doc.documentElement.clientHeight;
			}
		}
		return this._viewHeight;
	},
	
	getViewWidth: function(){
		if(!this._viewWidth){
			var doc = this.getDomDocument();
			this._viewWidth = doc.documentElement.clientWidth;
		}
		return this._viewWidth;
	},
	
	/*
	 * get Window
	 */
	getWindow: function(){
		var doc = this.getDomDocument();
		return doc.parentWindow || doc.defaultView;
	},
	/*
	 * get scroll pos
	 */
	getScrollPosition: function(){
		if(concord.util.browser.isMobile())
			return document.body.scrollTop;
		
		if(this._scrollTop || this._scrollTop == 0)
			return this._scrollTop;
		
		var doc = this.getDomDocument();
		if(dojo.isWebKit)
			this._scrollTop = doc.body.scrollTop;
		else
			this._scrollTop = doc.documentElement.scrollTop;
		return this._scrollTop;
	},
	
	getScrollPositionH: function(){
		if(concord.util.browser.isMobile())
			return document.body.scrollLeft;
		if(this._scrollLeft || this._scrollLeft == 0)
			return this._scrollLeft;
		
		var doc = this.getDomDocument();
		if(dojo.isWebKit)
			this._scrollLeft = doc.body.scrollLeft;
		else
			this._scrollLeft = doc.documentElement.scrollLeft;
		
		return this._scrollLeft;
	},
	
	addStyelReferer:function(styleId,referer){
		var style = this.getRefStyle(styleId);
		style&&style.addReferer(referer);
	},
	getRefStyle:function(id){
		return this.styles&& this.styles.getStyle(id);
	},
	getDefaultTextStyle: function()
	{
		return this.styles&&this.styles.getDefaultTextStyle();
	},
	getDefaultParagraphStyle: function()
	{
		return this.styles&&this.styles.getDefaultParagraphStyle();
	},
	getDefaultListStyle: function()
	{
		return this.styles&&this.styles.getDefaultListStyle();
	},
	getDefaultTableStyle: function()
	{
		return this.styles&&this.styles.getDefaultTableStyle();
	},
	
	createStyle:  function(styleName, jsonData)
	{
		var msg = null; 
		var refStyle = this.getRefStyle(styleName);
		if(!refStyle)
		{
			jsonData = jsonData || this.defaultStyle[styleName];
			if(!jsonData)
				throw "The style " + styleName + " no default json data.";
//			var style = new writer.model.style.Style( dojo.clone(jsonData),styleName );
			var style = this.styles.createStyle(dojo.clone(jsonData), styleName);
			this.styles.addStyle(styleName, style);
			msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Style,  [WRITER.MSG.createAddStyleAct( styleName, jsonData )] ,WRITER.MSGCATEGORY.Style );
		}
		return msg;
	},

	cleanScrollCache: function()
	{
		this._scrollTop = null;
		this._scrollLeft = null;
	},
	
	_clearSubDomnode: function()
	{
		if (!this._editorDiv)
			return;

		var i = 0;
		while (i < this._editorDiv.childNodes.length)
		{
			var child = this._editorDiv.childNodes[i];

			if (child.className.indexOf("document editingBody") >= 0)
			{
				// only remove editingBody nodes
				this._editorDiv.removeChild(child);
			}
			else
			{
				++i;
			}
		}
	},

	_cleanState: function()
	{
		this.updateManager.clear();
		
		window._IDCache.cleanCache();
		
		pe.lotusEditor.undoManager.reset();
		
		this.lists = {};
		
		this._viewHeight = null;
		this._viewWidth = null;
		this.domDocument = null;

		this._clearSubDomnode();
		this.cleanScrollCache();
	},
	/**
	 * The function will reset all status.
	 * When the content changed will 
	 */
	restoreState: function()
	{
		for(var i=0; i < this.editorHandlers.length; i++)
			dojo.unsubscribe(this.editorHandlers[i]);
		
		this.editorHandlers = [];
		
		this._cleanState();
	},
	/**
	 * get plugin for call
	 */
	getPlugin: function( name ){
		return this._pluginsLoader.getPlugin(name);
	}
	
};