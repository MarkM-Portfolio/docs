dojo.provide("writer.plugins.Link");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.ui.widget.LinkPanel");
dojo.require("concord.util.acf");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.strings");
dojo.requireLocalization("writer.ui.widget","BookmarkDlg");

dojo.declare( "writer.plugins.Link", [writer.plugins.Plugin], {
	init: function() {
		var lotusEditor = this.editor;
		var editor = this.editor;
		var nls = dojo.i18n.getLocalization("writer","lang");;
		var linkPlugin = this;
		//default hyperlink style
		this.editor.defaultStyle['Hyperlink'] = {
				"type" : "character",
				"name" : "Hyperlink",
				"basedOn" : "DefaultParagraphFont",
				"uiPriority" : "99",
				"unhideWhenUsed" : "1",
				"rsid" : "00A242CD",
				"rPr" : {
					"color" : "#0000FF",
					"u" : {
						"val" : "single"
					}
				}
		};
		
		
		var emailRegex = /^mailto:([^?]+)(?:\?(.+))?$/,
		emailSubjectRegex = /subject=([^;?:@&=$,\/]*)/,
		emailBodyRegex = /body=([^;?:@&=$,\/]*)/,
		urlRegex = /^(?!javascript)((?:http|https|ftp|news):\/\/){1}(.*)$/,
		selectableTargets = /^(_(?:self|top|parent|blank|popup))$/,
		encodedEmailLinkRegex = /^javascript:void\(location\.href='mailto:'\+String\.fromCharCode\(([^)]+)\)(?:\+'(.*)')?\)$/,
		functionCallProtectedEmailLinkRegex = /^javascript:([^(]+)\(([^)]+)\)$/;

		var popupRegex =
			/\s*window.open\(\s*this\.href\s*,\s*(?:'([^']*)'|null)\s*,\s*'([^']*)'\s*\)\s*;\s*return\s*false;*\s*/;
		var popupFeaturesRegex = /(?:^|,)([^=]+)=(\d+|yes|no)/gi;
	
		var emailProtection = ( editor && editor.config && editor.config.emailProtection ) || '';

		// Compile the protection function pattern.
		if( emailProtection && emailProtection != 'encode' )
		{
			var compiledProtectionFunction = {};

			emailProtection.replace( /^([^(]+)\(([^)]+)\)$/, function( match, funcName, params )
			{
				compiledProtectionFunction.name = funcName;
				compiledProtectionFunction.params = [];
				params.replace( /[^,\s]+/g, function( param )
				{
					compiledProtectionFunction.params.push( param );
				} );
			} );
		}
		
		var parseLink = function( link )
		{
			var href = link.src,
				emailMatch,
				urlMatch,
				retval = {};

			if ( href && ( urlMatch = href.match( urlRegex ) ) )
			{
				retval.type = 'website';
				retval.link = href;
			}
			else if ( link.anchor ){
				retval.type = "bookmark";
				retval.anchor = link.anchor;
			}
			// Protected email link as encoded string.
			else if ( !emailProtection || emailProtection == 'encode' )
			{
				if( emailProtection == 'encode' )
				{
					href = href.replace( encodedEmailLinkRegex,
							function ( match, protectedAddress, rest )
							{
								return 'mailto:' +
								       String.fromCharCode.apply( String, protectedAddress.split( ',' ) ) +
								       ( rest && unescapeSingleQuote( rest ) );
							} );
				}

				emailMatch = href && href.match( emailRegex );

				if( emailMatch )
				{
//					var subjectMatch = href.match( emailSubjectRegex ),
//						bodyMatch = href.match( emailBodyRegex );
					var mailSub = '?subject=';
					retval.type = 'email';
					var email = retval;
					email.link = emailMatch[ 1 ];
					
					if(href.indexOf(mailSub)>0)
						email.subject = href.substr(href.indexOf(mailSub)+mailSub.length);
//					subjectMatch && ( email.subject =  subjectMatch[ 1 ] );
//					bodyMatch && ( email.text = decodeURIComponent( bodyMatch[ 1 ] ) );
				}
			}
			// Protected email link as function call.
			else if( emailProtection )
			{
				href.replace( functionCallProtectedEmailLinkRegex, function( match, funcName, funcArgs )
				{
					if( funcName == compiledProtectionFunction.name )
					{
						retval.type = 'email';
						var email = {};

						var paramRegex = /[^,\s]+/g,
							paramQuoteRegex = /(^')|('$)/g,
							paramsMatch = funcArgs.match( paramRegex ),
							paramsMatchLength = paramsMatch.length,
							paramName,
							paramVal;

						for ( var i = 0; i < paramsMatchLength; i++ )
						{
							paramVal = decodeURIComponent( unescapeSingleQuote( paramsMatch[ i ].replace( paramQuoteRegex, '' ) ) );
							paramName = compiledProtectionFunction.params[ i ].toLowerCase();
							email[ paramName ] = paramVal;
						}
						email.link = [ email.name, email.domain ].join( '@' );
					}
				} );
			}
			
				
			retval.selectedElement = link;
			return retval;
		};
		
		function getSelectedLink( selection )
		{
			selection = selection || editor.getSelection(),
			ranges = selection.getRanges();
			if( ranges.length == 1 ){
				if(ranges[0].getStartModel().obj == ranges[0].getEndModel().obj  && writer.util.ModelTools.isImage(ranges[0].getStartModel().obj)){
					if(ranges[0].getStartModel().obj.parent.modelType == writer.MODELTYPE.LINK)// if the selection is image and its parent is hyperlink
						return ranges[0].getStartModel().obj.parent;
				}	
				var selectedObj = ranges[0].getSelectedObject();
				if( selectedObj && selectedObj.src )
					return selectedObj;
				return ranges[0].getCommonAncestor( true, writer.MODELTYPE.LINK );
			}
				
		};
		
		/**
		 * Select whole if current selection is in a link
		 * @returns
		 */
		function selectLinkIfExist(isGetLink)
		{
			var link = getSelectedLink();
			if(!isGetLink && link )
			{
				var	selection = editor.getSelection(),
				range = selection.getRanges()[0];
				range.setStart( link.parent, link.start );
				range.setEnd( link.parent, link.start + link.length );
				selection.selectRanges( [range]);
			}
			return link;
		}
		
		var createLinkHint = function( json, src, anchor, msgs )
		{
			var linkJson = {};
			linkJson.fmt = json.fmt;
			var fmts = linkJson.fmt;
			var bTrackAuthor = pe.scene.isTrackAuthor();
			var author = pe.scene.getCurrUserId();
			for(var i = 0; i < fmts.length; i++)
			{ //merge link styles
				fmts[i].style = fmts[i].style ||{};
				fmts[i].style.styleId = "Hyperlink";
				var msg = editor.createStyle( "Hyperlink");
				if(bTrackAuthor)
					fmts[i].e_a = author;
				msg && msgs.push( msg );
			}
			src && ( linkJson.src = src );
			anchor && ( linkJson.anchor = anchor );
			linkJson.id = WRITER.MSG_HELPER.getUUID();
			linkJson.c = json.c;
			linkJson.rt = writer.model.text.Run.LINK_Run;
			return linkJson;
		};
		
		var insertLink = function( json, p, idx1, idx2 , msgs )
		{
			p.insertRichText( json, idx1 );
			var actPair = WRITER.MSG.createInsertTextAct(idx1, idx2 - idx1, p);
			msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
			msg && msgs.push( msg );
		};
		
		var createLink = function( range, msgs, src, anchor)
		{
			var selectedObj = range.getSelectedObject();
			if( selectedObj && selectedObj.modelType == writer.MODELTYPE.IMAGE ){
				var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute,  [WRITER.MSG.createSetAttributeAct( selectedObj,null,null,{'src':src },{'src': selectedObj.src } )] );
				msgs.push( msg );
				if( src )
					selectedObj.src = src;
				else
					selectedObj.anchor = anchor;
				setTitle( selectedObj, src || anchor );
				return;
			}
			var start = range.getStartParaPos();
			var end = range.getEndParaPos();
			var startModel = start.obj;
			var endModel = end.obj;
			var startIndex = start.index;
			var endIndex = end.index;
			
			var it = new writer.common.RangeIterator( range );
			var c = it.nextBlock(),next;
			var contents = [], idx1, idx2;
			while( c ){
				next = it.nextBlock();
				if( c.modelType == writer.MODELTYPE.PARAGRAPH )
				{
					idx1 = 0;
					
					if( c == startModel )
						idx1 = startIndex;
					else 
						idx1 = 0;
					if( c == endModel )
						idx2 = endIndex;
					else 
						idx2 = c.text.length;
					
					if( idx1 != idx2 )
					{ //create Link for part of the paragraph
						var cnt = createLinkHint( c.toJson( idx1, idx2 - idx1 ),src, anchor, msgs );
						WRITER.MSG.addDeleteMsg( c,idx1, idx2, msgs);
						c.deleteText( idx1, idx2 - idx1  );
						insertLink( cnt, c, idx1, idx2 , msgs );
						// reset selection range
						var para = range.getStartParaPos().obj;
						range.setStart(para, idx1 );
						range.setEnd( para, idx2 );
						editor.getSelection().selectRangesBeforeUpdate( [range]);
					}
				}
				//update
				c.parent.update();
				//end
				c = next;
				
			}
		};
		
		
		function setTitle( hint, linkHref ){
			var tips = linkHref;
			if(  linkHref == "" || ( linkHref.indexOf("#")==0 ) )
				tips = nls.link.internalLink;
			
			var allViews = hint.getAllViews();
			var rtlPrefix = BidiUtils.isGuiRtl() ? BidiUtils.RLE : "";
			var linkStr = dojo.isMac ? nls.link.ctrlLink_Mac : nls.link.ctrlLink;
			for(var ownerId in allViews){
				var viewers = allViews[ownerId];
				if(!viewers)
					continue;
				viewers.forEach(function(view){
					if(view.domNode)
						dojo.attr(view.domNode, "title", tips + "\n" + rtlPrefix + linkStr);
					view.handleLinkField && view.handleLinkField();
				});
			}
		}
		
		function trimLink(linkHref){
			var spacePos = linkHref.indexOf(" ");
			if(spacePos > 0){
				var prefix = "//";
				var protocalIdx = linkHref.indexOf(prefix);
				if(protocalIdx > 0)
				{
					// Prefix length is 2;
					var slashIdx = linkHref.indexOf("/", protocalIdx + 2);
					if(slashIdx < 0)
					{
						linkHref = linkHref.replace(/\ /g, "");	// Trim space
					}	
					else if(slashIdx > 0 && spacePos < slashIdx)	
					{
						// Space after slash is ok.
						var protocalPart = linkHref.substr(0, protocalIdx + 2);
						var domainPart = linkHref.substr(protocalIdx + 2, slashIdx);
						var pathPart = linkHref.substr(slashIdx);
						
						domainPart = domainPart.replace(/\ /g, "");
						linkHref = protocalPart + domainPart + pathPart;
					}	
				}	
			}
			return linkHref;
		}
		
		/**
		 * implementation of creating link
		 * @param linkHref
		 * @param link
		 * @displayText The text will be displayed in document.  
		 */
		function insertLinkImpl(  linkHref, link, displayText, anchor )
		{
			var selection = editor.getSelection();
			
			linkHref = linkHref && trimLink(linkHref);
			
			displayText = displayText || linkHref || anchor;
			if ( !link && ( linkHref || anchor ) )
			{
				// Create element if current selection is collapsed.
				var ranges = selection.getRanges(),
					range = ranges[0].clone();

				if (BidiUtils.isBidiOn() && range && range.startModel.obj.paragraph) {
					var paraProperty = range.startModel.obj.paragraph.directProperty;
					var isRtlPara = paraProperty && (paraProperty.getDirection() == "rtl");
					var isTextDirRtl = BidiUtils.getResolvedTextDir(displayText) == "rtl";
					if (isTextDirRtl ^ isRtlPara) {
						displayText = BidiUtils.doTransform(displayText); //preserve direction
					}
					var insulationgMark = isRtlPara ? BidiUtils.RLM : BidiUtils.LRM;
					displayText = insulationgMark + displayText + insulationgMark; //ensure insulation
				}
					
				WRITER.MSG.beginRecord();
				try
				{
					var isEmpty = (ranges.length == 1 && range.isCollapsed());
					var msgs =[];
					if ( !isEmpty )
					{
						//extract contents, and create message
						createLink( range, msgs, linkHref, anchor );
					}
					else
					{//create link element with text of linkHref.
						var json = {'c': displayText };
						var start = range.getStartParaPos();
						var idx1 = start.index;
						var len = displayText.length;
						// get the follow run and init style attrs
						var followRun = start.obj.getInsertionTarget(idx1).follow;
						var style = {};
						if(followRun){
							// get the textRun which style should be followed
							if(followRun.modelType == writer.MODELTYPE.LINK){
								followRun =  followRun.hints.getLast();
							}
							if(followRun.textProperty)
								style = followRun.textProperty.toJson();
						}
						if(style){
							if( style.color )
								delete style.color;
							if( style.u )
								delete style.u;
						}
						
						json.fmt=  [ {
							"style" : style,
							"rt" : "rPr",
							"s" : idx1,
							"l" : len
						} ];
						
						var cnt = createLinkHint( json, linkHref, anchor, msgs ); 
						var para = start.obj;
						insertLink( cnt, para, idx1, idx1+len , msgs );
						
						range.setStart( para, idx1 );
						range.setEnd( para, idx1+len );
						selection.selectRangesBeforeUpdate( [range]);
						para.parent.update();
						pe.lotusEditor.updateManager.update();
						
					}
					WRITER.MSG.sendMessage( msgs );
				}
				catch( e ){
					console.error ( "error in link plugin: " + e.message );
				}
				
				WRITER.MSG.endRecord();
				/////
			}
			else
			{
				// We're only editing an existing link, so just overwrite the attributes.
				var element = link;
				if( element.src != linkHref || element.anchor != anchor )
				{
					var oldAttr = {}, newAttr = {};
					
					if( element.src != linkHref && (element.src || linkHref)) {
						linkHref = linkHref || "";
						oldAttr = {'src': element.src ||""};
						newAttr = {'src':linkHref };
						element.src = linkHref;
					}
					if( element.anchor != anchor && (element.anchor || anchor)){
						anchor = anchor || "";
						oldAttr['anchor'] = element.anchor || "";
						newAttr['anchor'] = anchor;
						element.anchor = anchor;
					}
					
					var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute,  [WRITER.MSG.createSetAttributeAct( element,null,null,newAttr,oldAttr )] );
					WRITER.MSG.sendMessage( [msg] );

					if( element.modelType ==  writer.MODELTYPE.IMAGE)
						setTitle( element, linkHref || anchor );
					// Update the link tips by update dom tree.
					else if(element.hints && element.hints.length() > 0)
					{
						element.hints.forEach(function(hint){
							setTitle( hint, linkHref || anchor  );
						}); 
					}	
				}
				
			}
		}
		var onOk = function( data )
		{
			var linkHref, displayText, anchor;

			// Compose the URL.
			switch ( data.type || 'url' )
			{
				case 'website':
					var url = data.link;
					var protocol =  'http://';
					linkHref = ( url.indexOf( "://" ) >= 0 ) ? url : protocol + url;
					displayText = data.text || linkHref;
					break;
				case 'bookmark':
					anchor = data.anchor;
					displayText = data.text || anchor;
					break;
				case 'email':

					var linkHref,
						address = data.link;

					switch( emailProtection )
					{
						case '' :
						case 'encode' :
						{
							var subject = data.subject || '' ,
								body = '';
							displayText =  data.text || '' ;

							// Build the e-mail parameters first.
							var argList = [];
							subject && argList.push( 'subject=' + subject );
							body && argList.push( 'body=' + body );
							argList = argList.length ? '?' + argList.join( '&' ) : '';

							if ( emailProtection == 'encode' )
							{
								linkHref = [ 'javascript:void(location.href=\'mailto:\'+',
											 protectEmailAddressAsEncodedString( address ) ];
								// parameters are optional.
								argList && linkHref.push( '+\'', escapeSingleQuote( argList ), '\'' );

								linkHref.push( ')' );
							}
							else
								linkHref = [ 'mailto:', address, argList ];

							//displayText = address;
							linkHref = linkHref.join("");
							break;
						}
						default :
						{
							// Separating name and domain.
							var nameAndDomain = address.split( '@', 2 );
							email.name = nameAndDomain[ 0 ];
							email.domain = nameAndDomain[ 1 ];

							linkHref = [ 'javascript:', protectEmailLinkAsFunction( email ) ];
							displayText = address;
							linkHref = linkHref.join("");
						}
					}

					break;
			}
			
			insertLinkImpl( linkHref, data.selectedElement, displayText, anchor );
		};
		//get current link info
		var getLinkInfo = function()
		{
				var isGetLinkInfo = true;
				var link = selectLinkIfExist(isGetLinkInfo);
				if( link )
					return parseLink( link );
				else 
					return {};
		};
		
		var createLinkCommand = 
		{
			exec: function( args )
			{
				if( args && args[0] && dojo.isString( args[0]))
				{//create link directly
					var url = encodeURI(decodeURI( args[0] ));
					var link = selectLinkIfExist();
					insertLinkImpl(  url, link );
				}
				else
				{
					var fromMouseClick = args && args[0] && args[0].target;
					if( args && args[0] && args[0].target ){
						if( linkPlugin.linkPanel  && linkPlugin.linkPanel.isShow() ){
							linkPlugin.linkPanel.close();
							return;
						}
					}
					if( !linkPlugin.linkPanel ){
						this.linkDiv = dojo.create("div", {style: {position:"absolute","z-index":900, "top": "-2000px", "left": "-2000px"}}, dojo.body());
						var div = dojo.create("div", {}, this.linkDiv);
						editor.popupPanel = linkPlugin.linkPanel = new writer.ui.widget.LinkPanel( 
						{
							onRemove : function()
							{
								if( this.selectedElement ){
									editor.execCommand("unlink" );
								}
								this.close();
							},				
							onDone: function( data )
							{
								onOk( data );
								this.close();
								editor.focus();
							},
							openLink: function()
							{
								
							}
						} , div );
					}
					linkPlugin.linkPanel.initData( getLinkInfo());
					
					var selection = editor.getSelection();
					selection.scrollIntoView();
					
					linkPlugin.linkPanel.show(fromMouseClick);
					
//					var pos = {eventname: concord.util.events.comments_queryposition, filled:false};
//					concord.util.events.publish(concord.util.events.comments_queryposition, [pos]);
//					if ( pos.filled){
//						var top = pos.y;
//						var left = pos.x;
//						if( isNaN(top) || isNaN(left )){
//							 var selelection = editor.getSelection();
//							 var line = writer.util.ModelTools.getLineFromSelection( selection );
//							 if( line ){
//								top = line.getTop() + dojo.byId("mainNode").offsetTop;
//								left = line.getLeft();
//								top -= pe.lotusEditor.getScrollPosition();
//								left -= pe.lotusEditor.getScrollPositionH();
//							 }
//							 else {
//								 console.error("wrong position!!");
//								 return;
//							 }
//						}
//						top += 20;
//						
//						var wnd = concord.util.browser.isMobile() ? window : editor.getWindow();
//						var viewHeight = editor.getViewHeight();
//						if( top + panelHeight > viewHeight ){
//							wnd.scroll(0,  top + panelHeight - viewHeight );
//						}
//						
//						if( top+ panelHeight +wnd.document.body.scrollTop > wnd.document.body.scrollHeight )
//							top = wnd.document.body.scrollHeight - ( panelHeight +wnd.document.body.scrollTop );
//						this.linkDiv.style.top = ( top + 20 ) + "px";
//						this.linkDiv.style.left = left + "px";
//					}
				}
			}
		};
		
		var openLinkCommand = 
		{
			exec: function(){
				//console.log("openLinkCommand");
				var link = getSelectedLink();
				if( link )
					dojo.publish( writer.EVENT.OPENLINK,[link]);
				else
					console.error("no link selected!");
			}
		};
		
		var removeLinkCommand = 
		{
			exec: function(){
				var link = getSelectedLink();
				if( link.modelType == writer.MODELTYPE.IMAGE && link.src ){
					var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute,  [WRITER.MSG.createSetAttributeAct( link,null,null,{'src':"" },{'src': link.src } )] );
					delete link.src;
					WRITER.MSG.sendMessage( [msg] );
					setTitle( link, "" );
				}
				else if( link )
				{//remove link 
					var msgs=[],msg, idx1 = link.start, idx2 = idx1 + link.length;
					//create text json inside link
					var json = link.toJson();
					json.src = null;
					json.id = null;
					json.rt = writer.model.text.Run.TEXT_Run;	
					var para =  writer.util.ModelTools.getParagraph(link);
					json.c =para.text.substring(idx1, idx2);
					var fmts = json.fmt;
					if( fmts ){
						for(var i = 0; i < fmts.length; i++)
						{ //merge link styles	
							if(!fmts[i].style)
								continue;
							if( fmts[i].style.styleId == "Hyperlink" ||
									fmts[i].style.styleId == "Internet_20_link"	)//odt file
								delete fmts[i].style.styleId;
							if( fmts[i].style.color == "#0000FF" )
								delete fmts[i].style.color;
							if( fmts[i].style.u &&  fmts[i].style.u.val=="single" )
								delete fmts[i].style.u;
						}
						
					}
					//end
					
					WRITER.MSG.addDeleteMsg( para,idx1, idx2, msgs);
					para.removeHint(link);
					
					para.insertRichText( json, link.start );
					var actPair = WRITER.MSG.createInsertTextAct( idx1, idx2 - idx1, para);
					msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
					msg && msgs.push( msg );
					WRITER.MSG.sendMessage( msgs );
					para.doc.update();
					
				}
				else
					console.error("no link selected!");
			}
		};
		
		lotusEditor.addCommand("link", createLinkCommand, writer.CTRL + 75 /*ctrl+k*/);
		lotusEditor.addCommand("openlink", openLinkCommand);
		lotusEditor.addCommand("unlink", removeLinkCommand);
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
		var cmds ={
				addlink:
				{
					label : nls.link.addlink || "",
					commandID : 'link',
					group : 'link',
					order : 'addlink',
					name  : 'addlink'
				},
				gotolink:
				{
					label : nls.link.gotolink,
					commandID : 'openlink',
					group : 'link',
					order : 'openlink',
					name  : 'gotolink'
				},
				
				link :
				{
					label : nls.link.editlink,
					commandID : 'link',
					group : 'link',
					order : 'link',
					name  : 'link'
				},

				unlink :
				{
					label : nls.link.unlink,
					commandID : 'unlink',
					group : 'link',
					order : 'unlink',
					name  : 'unlink'
				}
		};
		
		var ctx = this.editor.ContextMenu;
		if(ctx && ctx.addMenuItem){
			for(var k in cmds)
				ctx.addMenuItem(cmds[k].name,cmds[k]);
		}
		if(ctx && ctx.addListener) ctx.addListener(function(target,selection){
			var link = getSelectedLink();
			if( link )
			{
				var isInToc = writer.util.ModelTools.isInToc( link );
				if( !isInToc )
					return {
						gotolink: false,
						link: false,
						unlink: false
					};
				else
					return {
						gotolink: false
					};
			}
			else
				return {
				addlink: false
			};
		});
		
		var getExternalHref = function(m){
			var href = m.src;
			if(!href && m.parent && m.modelType != writer.MODELTYPE.FIELD)
				href = m.parent.src;
			
			if( href && href != "" && ( href.indexOf("#")!=0 ) )
				return href;
			else
				return null;
		};
		
		dojo.subscribe(writer.EVENT.DOMCREATED, this, function( model, domNode, view, arg ){
			if(arg.linkObj != null)	
			{
				//connect click event
				function openlink( e ){
					if(pe.scene.isHTMLViewMode() || e.ctrlKey || ( dojo.isMac && e.metaKey )){
						//move cursor...
						if( ( arg.linkObj.src && arg.linkObj.src!="" ) || arg.linkObj.anchor ){
							var offsetX = e.clientX;
							var offsetY = e.clientY;
							var target = e.target || e.srcElement;
							var editShell = pe.lotusEditor.getShell();
							editShell.beginSelect(target, offsetX, offsetY );
							editShell.endSelect(target, offsetX, offsetY );
						}
						dojo.publish( writer.EVENT.OPENLINK,[arg.linkObj] );
				    }
					else{
						setTimeout( function (){
							var sel = pe.lotusEditor.getSelection();
							
							var ranges = sel.getRanges();
							if( !ranges[0].isCollapsed() )// Collapsed case.
								return;
							
							var link = getSelectedLink( sel );
							if( link ){
								linkPlugin.onSelectionChange();
								if( pe.lotusEditor.getCommand('link').state != writer.TRISTATE_DISABLED ){
									editor.execCommand("link", [e]);
								}
							}
						}, 50 );
					}
					linkPlugin.linkPanel && linkPlugin.linkPanel.close();
//					else if( !e.altKey ){
//						linkPlugin.onSelectionChange();
//						if( pe.lotusEditor.getCommand('link').state != writer.TRISTATE_DISABLED ){
//							editor.execCommand("link", [e]);
//						}
//					}
				};

				var href = getExternalHref(arg.linkObj);
				var tips = "", canOpen = true;
				var rtlPrefix = BidiUtils.isGuiRtl() ? BidiUtils.RLE : "";
				var linkStr = dojo.isMac ? nls.link.ctrlLink_Mac : nls.link.ctrlLink;
				if(!href)
				{
					if(pe.scene.isHTMLViewMode())
						tips = nls.link.internalLink;
					else
						tips = nls.link.internalLink + "\n" + rtlPrefix + linkStr;
				}
				else if(href.indexOf("file:///") == 0)
				{
					tips = href.substr(8, href.length) + dojo.string.substitute(nls.link.cannotOpen, { 'productName' : concord.util.strings.getProdName()});
					canOpen = false;
				}
				else if(pe.scene.isHTMLViewMode())
					tips = href; 
				else
					tips = href + "\n" + rtlPrefix + linkStr;

				if (domNode.openLinkConnect)
					dojo.disconnect(domNode.openLinkConnect);
				
				if (canOpen)
					domNode.openLinkConnect = dojo.connect( domNode, "onclick", null, openlink );

				dojo.addClass(domNode, "hasLink");
				dojo.attr(domNode, "title", tips);
			}
		});
		
		dojo.subscribe(writer.EVENT.LEFTMOUSEDOWN, this, function( editWin, e ){
			
			linkPlugin.linkPanel && linkPlugin.linkPanel.close();
		});
		
		dojo.subscribe(writer.EVENT.OPENLINK, this, function( m, name ){
			var href = m.src, anchor = name || m.anchor || m.name;
			
			if( m.modelType == writer.MODELTYPE.FIELD ){
				var instr = m.getInstrText();
				anchor = instr && instr.t.match(/\s*PAGEREF\s+(\w+)\s+/i)[1];
			}
			else if( !href && !anchor && m.parent ){
				m = m.parent;
				href = m.src;
				anchor = m.anchor|| m.name;
			}
			
			if( href && href != "" && ( href.indexOf("#")!=0 ) )
			{
				if (concord.util.acf.suspiciousAttribute("href", href) || concord.util.acf.suspiciousHtml(href) )
					return;
				if (href.indexOf("file:///") == 0)
					return;
				
				if(concord.util.browser.isMobile())
					concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"openLink", "params":[href]}]);
				else
					window.open(href);
			}
			else if( anchor )
			{
				var bm = writer.util.ModelTools.getBookMark( anchor );
				if( bm ){
					var doc = writer.util.ModelTools.getDocument( bm ), rootView, page;
					switch( doc.modelType ){
					case writer.MODELTYPE.DOCUMENT:
						editor.getShell().enterEditorMode();
						break;
					case writer.MODELTYPE.HEADERFOOTER:
						var currenView = editor.getSelection().getRanges()[0].getStartView().obj;
						page = writer.util.ViewTools.getPage( currenView );
						var rootView = ( doc.hfType == "hdr" ) ? page.getHeader(): page.getFooter();
						try{
							editor.getShell().moveToHeaderFooter( rootView, false, true );
							selection.scrollIntoView();
						}
						catch( e ){
							console.log("catch exception!!");
						}
						break;
					case writer.MODELTYPE.FOOTNOTE:
					//maybe future support
						break;
						
					}
					//#37876
					var next = bm.next();
					
					while( next && (!writer.util.ModelTools.isRun(next) || writer.util.ModelTools.isBookMark(next) || next.br ))
					{
						next = next.next();
					}
					var index = next ? next.start: bm.paragraph.text.length ;
					
					var pos = next ? {"obj": next, "index": 0 } : {"obj": bm.parent, "index": index };
					var range = new writer.core.Range( pos, pos, rootView );
					if( page && !range.getStartView() ){
						var toPage = page;
						if( toPage = page.previous() ){
							rootView = ( doc.hfType == "hdr" ) ? toPage.getHeader(): toPage.getFooter();
							range = new writer.core.Range( pos, pos, rootView );
						}
						if( page && !range.getStartView() ){
							if( toPage = page.next()){
								rootView = ( doc.hfType == "hdr" ) ? toPage.getHeader(): toPage.getFooter();
								range = new writer.core.Range( pos, pos, rootView );
							}
						}
					}
					var selection = editor.getSelection();
					selection.selectRanges([range]);
					
					selection.scrollIntoView();
					selection.AnnounceSelection("link");
				}
				else
				{
					var firstHint = m.hints.getFirst();
					var viewers = firstHint && firstHint.getAllViews();
					var lastView;
					for( viewId in viewers ){
						lastView = viewers[ viewId ];
					}
					var linkView = lastView && lastView.getFirst();
					if( linkView && linkView.domNode ){
						
						 var nls = dojo.i18n.getLocalization("writer.ui.widget","BookmarkDlg");
						 var line = writer.util.ViewTools.getLine( linkView );
						 if( line ){
							var top = line.getTop() + dojo.byId("mainNode").offsetTop;
							var left = line.getLeft() + linkView.getLeft();
							top -= pe.lotusEditor.getScrollPosition();
							left -= pe.lotusEditor.getScrollPositionH();
							var rect = {"x":left+200,"y":top,"w":0,"h":0};
							dijit.Tooltip.show( nls.bookmarkNotExist, rect, [ "above-centered", "below-centered" ] );
							setTimeout( function(){
								dijit.Tooltip.hide( rect );
							},1000);							
						 }
					}
				}
			}
		});
	},
	onSelectionChange: function(){		
		pe.lotusEditor.getCommand('link').setState(writer.TRISTATE_OFF);
	 	var	selection = this.editor.getSelection();
		var ranges = selection.getRanges();
		var linkDisabled = false;
		if( ranges.length == 1 )
		{
			var range = ranges[0];
			if(range &&writer.util.RangeTools.ifContainOnlyOneTextBox(range))
			{
				pe.lotusEditor.getCommand('link').setState(writer.TRISTATE_DISABLED);
				linkDisabled = true;
			}
			else
			{
				var toc_plugin = this.editor.getPlugin("Toc");
				var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
				if(toc_disable)
				{					
					pe.lotusEditor.getCommand('link').setState(writer.TRISTATE_DISABLED);
					linkDisabled = true;
				}
			}
		}

		if(!linkDisabled)
		{
			var table_plugin = this.editor.getPlugin("Table");
			var tState = table_plugin && table_plugin.getStateBySel(selection);
			if(tState && tState.canMergeCells) pe.lotusEditor.getCommand('link').setState(writer.TRISTATE_DISABLED);
		}
	}
});