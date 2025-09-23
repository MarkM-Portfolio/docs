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

dojo.provide("concord.text.CopyPasteUtil");
dojo.requireLocalization("concord.scenes","Scene");
dojo.declare("concord.text.CopyPasteUtil", null, {

	_attNameForClipId:null,
	webClipBoard:null,
	listPrefix:null,

	constructor: function()
	{
		this._attNameForClipId = "_clipboardid";
	},

	getWebClipBoard : function(){
		if(!this.webClipBoard)
			this.webClipBoard = pe.scene.getDocClipBoard();
		return this.webClipBoard;
	},	

	updateCopyArea : function(currSel){
    	function genWClipHead(eid, id, link)
    	{
    		var head = {};
    		head.cid = id;
    		head.eid = eid;
    		head.cssHref = link;
    		return head;
    	};

		try{
			var curDoc = pe.lotusEditor.document;
			var currRanges = currSel.getRanges();
			
			this.getWebClipBoard();
			this.cleanWebClipBoard();
			
			var rangeInfo = this.getSelRangeInfo(currRanges);
	    	var cssString = this.getAllCSS(rangeInfo.classes);
	    	var lstTypes = rangeInfo.listTypes ;
	    	var webClipData;
	
	    	if(cssString || (lstTypes.length > 0))
	    	{
		    	var c_id = MSGUTIL.getUUID();
	    		var endPath = currSel.getEndElementPath();
	    		var endE = endPath.elements[0];
	    		if(endE.getName() == "br")
	    			endE = endPath.elements[1];

    			endE.setAttribute(this._attNameForClipId,c_id);

		    	var styleLink = curDoc.$.URL.substring(0,curDoc.$.URL.lastIndexOf('/')+1) + "style.css";
	
		    	webClipData  = genWClipHead(endE.$.id,c_id,styleLink);
		    	if(cssString)	    	
		    		webClipData.styles = cssString;
		    	if(lstTypes.length > 0)
		    		webClipData.lsttypes = lstTypes;
	
				this.webClipBoard.setData(dojo.toJson(webClipData));
	    	}  	
		}
		catch(e)
		{
			if(window.g_concordInDebugMode)
				console.log("Execption in updateCopyArea " + e);
			this.cleanWebClipBoard();
		}
	},

	getSelRangeInfo : function(selRanges){

		var selRange = selRanges[0];
		var rangeStartN = selRange.getBoundaryNodes().startNode;
		var rangeEndN = selRange.getBoundaryNodes().endNode;

		return this.getRangeWholeInfo(rangeStartN,rangeEndN);
	},

	getRangeWholeInfo : function(startNode,endNode){
		var result = {};
		result.classes = [];
		result.listTypes = {};
		result.listTypes.length = 0;

		var curNode = this.getFirstLeaf(startNode);	

		var parentBlock = startNode.getCommonAncestor(endNode);
		while(curNode)
		{
			//get node className
			this.getRangeNodeInfo(curNode, result);

			if(curNode.equals(endNode))
				break;

			if(curNode.hasNext())
			{
				curNode = this.getFirstLeaf(curNode.getNext());
			}
			else
				curNode = curNode.getParent();
		}

		while(curNode && !curNode.equals(parentBlock))
		{
			curNode = curNode.getParent();

			this.getRangeNodeInfo(curNode, result);
		}

		this.getParentBlockInfo(parentBlock,result);

		return result;
	},

	getRangeNodeInfo : function(curNode,result){
		var className = this.getNodeCopyClass(curNode,result.classes);
		if(className)
			result.classes.push(className);

		if(MSGUTIL.isList(curNode))
		{
			var header = this.updateListTypeStyle(curNode); 
			this.putNodeListType(curNode,result.listTypes, header);
		}
	},

	getParentBlockInfo : function(parentBlock,result){

		if(MSGUTIL.isInBullet(parentBlock))
		{
			var allParents = new CKEDITOR.dom.elementPath(parentBlock).elements;
			for(var i=0;i<allParents.length;i++)
			{
				if(allParents[i].getName() == 'body')
					break;

				if(MSGUTIL.isList(allParents[i]))
					this.updateListTypeStyle(allParents[i]);
			}

			var liNode = MSGUTIL.getBulletParent(parentBlock);
			var className = this.getNodeCopyClass(liNode,result.classes);
			if(className)
				result.classes.push(className);

			var topLstNode = this._getTopList(liNode);
			this.putNodeListType(topLstNode,result.listTypes);
		}
	},

	_getTopList : function(curNode){
		var topHeader;
		if(MSGUTIL.isBullet(curNode))
			topHeader = curNode;

		var parent = curNode.getParent();
		while(parent)
		{
			if(MSGUTIL.isBullet(parent))
			{
				topHeader = parent;
				parent = parent.getParent();
			}
			else
				break;
		}
		return topHeader;
	},

	isInArray : function(arr,input){

		if(input && arr && arr.length>0)
		{
			if(dojo.indexOf(arr,input) >=0)
				return true;
		}
		return false;
	},

	getFirstLeaf : function(node)
	{
		while(node.type == CKEDITOR.NODE_ELEMENT && node.getFirst())			
		{
			node = node.getFirst();
		}

		return node;
	},

	getNodeCopyClass : function(node,classes){
		var lstClass;
		if(node.type == CKEDITOR.NODE_ELEMENT && MSGUTIL.isBullet(node))
		{
			lstClass = MSGUTIL.getListClass(node);
			var itemClass;
			if(MSGUTIL.isListItem(node))
				lstClass = node.getAttribute("_list") || lstClass;
		}
		lstClass = this.getListCommonClass(lstClass);
		if(lstClass && !this.isInArray(classes, lstClass))
			return lstClass;

		return;
	},

	putNodeListType : function(node,listTypes, header){
		if(!node || !MSGUTIL.isList(node))	return;

		var listHeader = header || LISTUTIL.getHeaderList(node);
		var className = MSGUTIL.getListClass(listHeader);
		var nType;
		var nStarts;
		
		if(listTypes[className]) return;

		if(!listTypes[className])
		{
			nType = listHeader.getAttribute("types");

			if(!nType && LISTUTIL.isNativeBulletClass(className))
			{
				// Get default outline
				var outlineInfo = LISTUTIL.getDefaultOutline(listHeader.is("ol"));
				nType = LISTUTIL.writeOutlineInfo(null, outlineInfo);
			}

			nStarts = listHeader.getAttribute("starts");

			if(!nType && !nStarts)
				return;

			listTypes[className] = [nType,nStarts];
			listTypes.length ++;
		}

		if(className.length>6 && className.indexOf("-",5)!=-1)
		{
			var oBullet = LISTUTIL.getOriginBulletOfRestarted(listHeader);
			if(oBullet)
				this.putNodeListType(oBullet,listTypes);
			else
			{
				var oName = 'lst' + className.substring(className.indexOf("-",5));
				if(!listTypes[oName])
					listTypes[oName] = [nType,nStarts];
			}
		}
	},

	getNodeClasses : function(parentNode,noChild){
		var classes = [];
		if(parentNode.type == CKEDITOR.NODE_ELEMENT)
		{
			var className = parentNode.$.className;
			if(className)
				classes.push(className);
			
			if(noChild)
				return classes;
			
			var childs = parentNode.getChildren();
			if(childs && childs.count()>0)
			{
				for(var i=0;i<childs.count();i++)
				{					
					var childClasses = this.getNodeClasses(childs.getItem(i));
					classes = classes.concat(childClasses);
				}
			}	
		}
		return classes;
	},

	getAllCSS : function(classNames){
    	var cssString;
    	if(classNames && (classNames.length > 0))
    	{
    		var matchedCSSRules = this.getCSSRules(classNames,pe.lotusEditor.document);
    		if(matchedCSSRules && (matchedCSSRules.length > 0))
    			cssString = this.genMatchCSSJson(classNames,matchedCSSRules);
    	}
    	return cssString;
	},

	getPastedStyleSheets : function(curDoc){
	   var results=[];	
	   var allStyleSheets = curDoc.$.styleSheets;
	   if (allStyleSheets) 
	   {
	      for (var i=0; i<allStyleSheets.length; i++) 
	      { 
	         var styleSheet = allStyleSheets[i];
	         if(!styleSheet.href)	 
	         {
	        	 var styleNode = (styleSheet.ownerNode)?styleSheet.ownerNode:styleSheet.owningElement;
	             var styleTypeAttr = styleNode.getAttribute("s_type");
	             if(styleTypeAttr && styleTypeAttr=="pastedStyle")
	            	 results.push(styleNode);
	         }
	      }
	   }
	   return results;
	},

	getMergedPastedStyleSheet : function(curDoc){
		   var allStyleSheets = curDoc.$.styleSheets;
		   if (allStyleSheets) 
		   {
		      for (var i=0; i<allStyleSheets.length; i++) 
		      { 
		         var styleSheet = allStyleSheets[i];
		         if(!styleSheet.href)
		         {
		        	 var styleNode = (styleSheet.ownerNode)?styleSheet.ownerNode:styleSheet.owningElement;
		             var styleTypeAttr = styleNode.getAttribute("s_type");
		             if(styleTypeAttr && styleTypeAttr=="mergedPastedStyle")
		            	 return styleSheet;
		         }
		      }
		   }
		   return;
		},

	getImportStyleSheet : function(curDoc){
	   var allStyleSheets = curDoc.$.styleSheets;
	   if (allStyleSheets) 
	   {
	      for (var i=0; i<allStyleSheets.length; i++) 
	      { 
	         var styleSheet = allStyleSheets[i];
	         if(styleSheet.href && (styleSheet.href.indexOf('/style.css') > 0))
	        	 return styleSheet;
	      }		   
	   }		
	   return;
	},

	getCSSRules : function(ruleNames,curDoc) {
		function isSearchedRule(cssRule,ruleNames)	{
			   var curRuleName = cssRule.selectorText.toLowerCase();
			   for(var i=0; i<ruleNames.length; i++)
			   {
				   var ruleName=ruleNames[i].toLowerCase(); 
				   if(curRuleName.indexOf('.'+ ruleName +'_') > 0)
					   return true;
			   }
			   return false;	   
			};

		function isSearchedSheet(sheetNode,ruleNames)	{
		   var curRuleName = sheetNode.getAttribute("lst_name");
		   for(var i=0; i<ruleNames.length; i++)
		   {
			   var ruleName=ruleNames[i].toLowerCase();
			   if(curRuleName.toLowerCase()==ruleName)
				   return true;
		   }
		   return false;
		};

		function getMatchedRules()
		{
			var result = [];
			if(styleSheet)
			{
				 var i=0;
				 var cssRule;
				 do {
				    if (styleSheet.cssRules)
				        cssRule = styleSheet.cssRules[i];
				    else
				        cssRule = styleSheet.rules[i];    
				
				    if (cssRule && isSearchedRule(cssRule,ruleNames))                       
				    	result.push(cssRule);

				    i++;
				 } while (cssRule);	
			}
			return result;
		};

		var styleSheet = this.getImportStyleSheet(curDoc);
		var result = getMatchedRules(styleSheet);

		styleSheet = this.getMergedPastedStyleSheet(curDoc);
		result = result.concat(getMatchedRules(styleSheet));

		var pastedStyles = this.getPastedStyleSheets(curDoc);
		if(pastedStyles && pastedStyles.length>0)
		{
			for(var i=0;i<pastedStyles.length;i++)
			{
				if(isSearchedSheet(pastedStyles[i],ruleNames))
					result.push(pastedStyles[i]);
			}
		}

		return result;
	},

	genMatchCSSJson : function(classNames,matchedCSSRules){
		function getRuleCSSText(rule){

			var filterIECSSText = function(rule){
				var cssText = rule.cssText;
				var cssSelector = rule.selectorText
										.replace(/::/g,':') ;
				return cssSelector + cssText.substring(cssText.indexOf("{"));
			};
			
			var filterWebKitCSSText = function(rule){
				var curCssText = rule.cssText;
				if(!rule.style.content)
					return curCssText;

				var contentValue = rule.style.content;
				var i1 = contentValue.indexOf("attr(values)");
				if(i1<0)
					return curCssText;

				contentValue = contentValue.replace(/,/ig,"");

				curCssText = curCssText.replace(/content:[^;]*;/,"content:"+contentValue+";");	
				return curCssText;
			};

			var cssText = "";			
			if(rule.cssText)
			{
				if(CKEDITOR.env.webkit)
					cssText = filterWebKitCSSText(rule);
				else
					cssText = filterIECSSText(rule);
			}
			else
			{
				cssText = rule.selectorText;
				cssText += '{';
				cssText += rule.style.cssText;
				cssText += '}';
			}
			return cssText;
		};

		var allStyles = [];
		for(var j=0;j<classNames.length;j++)
		{	
			var styleName = classNames[j];
			var styles = {};
			var cssString = "";
			var href="";

			for(var i=0;i<matchedCSSRules.length;i++)
			{
				if(matchedCSSRules[i].sheet)
				{
					var cssName = matchedCSSRules[i].getAttribute("lst_name").toLowerCase();
					if(cssName == styleName.toLowerCase())
					{
						cssString = matchedCSSRules[i].innerHTML;
						break;
					}
				}
				else
				{
	    			var cssName = matchedCSSRules[i].selectorText;
	    			if(cssName.toLowerCase().indexOf('.'+ styleName.toLowerCase()) > 0)
	    				cssString += getRuleCSSText(matchedCSSRules[i]);					
				}
			}
			if(cssString)
			{
				styles.name = styleName;
				styles.style = cssString;				
				allStyles.push(styles);
			}
		}		
		return allStyles;
	},

	cleanWebClipBoard : function ()
	{
		this.webClipBoard.emptyClipboard();	
		this.cleanWebClipData();
	},

	cleanWebClipData : function ()
	{
		delete this._classMap;
		delete this._wClipData;
	},

	verifyWebClipBoard : function(pasteHtml){
		if(!this.webClipBoard)
			return;

		var webClipData = this.webClipBoard.getData();
		if(webClipData)
		{
			var clipId;
			var clipIdIndex = webClipData.indexOf("cid\":");
			if(clipIdIndex>0)
			{
				clipIdIndex += 6;
				clipId = webClipData.substring(clipIdIndex,webClipData.indexOf("\"",clipIdIndex));
				var attrStr = this._attNameForClipId + "=\"";
				attrStr += clipId;
				attrStr += "\"";
				if(pasteHtml && pasteHtml.toLowerCase().indexOf(attrStr.toLowerCase())>0)
				{
					if(this._wClipData && this._wClipData.cid != clipId)
						this.cleanWebClipData();
					return;
				}
			}

//			var eIdIndex = webClipData.indexOf("eid=");
			this.cleanWebClipBoard();

			if(window.g_concordInDebugMode)
				console.log("Can not find the matching clipboard id '"+ clipId +"' , clear web clipboard.");			
		}
	},

	getAllListStyleNames : function(){
		var curDoc = pe.lotusEditor.document; 
		var result = this.getAllListRuleNames(this.getImportStyleSheet(curDoc));
		var merged = this.getAllListRuleNames(this.getMergedPastedStyleSheet(curDoc));
		result = result.concat(merged);

		var pastedSheets = this.getPastedStyleSheets(curDoc);
		if(pastedSheets && pastedSheets.length>0)
		{
			for(var i=0;i<pastedSheets.length;i++)
			{
				var curSheet = pastedSheets[i];
		        var listName = curSheet.getAttribute("lst_name");
		        result.push(listName.toLowerCase());
			}
		}
		return result;
	},

	getAllListRuleNames : function(curSheet){
		var result = [];
		if(curSheet)
		{
			var cssRules = (curSheet.cssRules)?curSheet.cssRules:curSheet.rules;
			
			for (var i=0;i<cssRules.length;i++)
			{
				var cssRule = cssRules[i];
				var curRuleName = cssRule.selectorText.toLowerCase();
				var listRuleIndex = curRuleName.indexOf("ol.");
				if(listRuleIndex >= 0)
				{
					var listRuleName = curRuleName.substring(listRuleIndex + 3,curRuleName.indexOf("_",listRuleIndex));
					if(!this.isInArray(result,listRuleName))
						result.push(listRuleName);
				}				
			}
		}
		return result;
	},

	checkDupType : function(styleName,style,cssHref,count){

		 function isSameStyleRules(rule1,rule2){

			if(!rule2 || rule1.length != rule2.length)
				return false;

			for(var i=0;i<rule1.length;i++)
			{
				var ruleName = rule1[i].selectorText;
				var rule1Style = rule1[i].style;
				
				var rule2Style = rule2.style[ruleName];
				if(!rule2Style || (rule1Style.key.length != rule2Style.key.length))
					return false;

				for(var j=0;j<rule1Style.key.length;j++)
				{
					var key = rule1Style.key[j];
					var value = rule1Style.value[j];
					
					var index = dojo.indexOf(rule2Style.key,key);
					if(index <0 || value!= rule2Style.value[index])
						return false;
				}
			}
			
			return true;
		};

	 function getCompareRules(style,type){
		var getStyleArrayJson = function(cssText){
			var result = {};
			var cssStyles = cssText.toLowerCase().split(";");
			if(cssStyles && cssStyles.length > 0)
			{
				result.key = [];
				result.value = [];

				for(var i=0;i<cssStyles.length;i++)
				{
					var curStyle = cssStyles[i];
					var splitIndex = curStyle.indexOf(":");
					if(splitIndex > 0)
					{
						var key = dojo.trim(curStyle.substring(0,splitIndex));
						result.key.push(key);
						result.value.push(dojo.trim(curStyle.substring(splitIndex + 1)));					
					}		
				}
			}
			return result;
		
		};

		var getCompareRuleOne = function(cssString){
			var result = [];
			var nameStart = 0;
			var start = cssString.indexOf("{");
			var end;

			while(start > 0)
			{
				var rule = {};

				end = cssString.indexOf("}",start);

				var selTexts = cssString.substring(nameStart,start).toLowerCase().split(",");			
				var cssText = cssString.substring(start + 1,end);
				var ruleStyle = getStyleArrayJson(cssText);

				for(var j=0;j<selTexts.length;j++)
				{
					var sText = dojo.trim(selTexts[j]);

					if(sText)
					{
						rule.selectorText = sText;
						rule.style = ruleStyle;
						result.push(rule);
					}
				}

				start = cssString.indexOf("{",end);
				nameStart = end + 1;
			}
			return result;
		};

		var getCompareRuleTwo = function(style){

			var result = {};
			var count = 0;
			result.style = {};
			for(var i=0;i<style.length;i++)
			{
				var selTexts = style[i].selectorText.toLowerCase().split(",");
				var styleString = "";
				if(style[i].cssText)
				{
					var cssText =  style[i].cssText;
					styleString = cssText.substring(cssText.indexOf("{") + 1,cssText.indexOf("}"));
				}
				else
					styleString = style[i].style.cssText;

				var ruleStyle = getStyleArrayJson(styleString);

				for(var j=0;j<selTexts.length;j++)
				{
					var sText = dojo.trim(selTexts[j]);

					if(sText){
						count++;
						result.style[sText]= ruleStyle;
					}
				}
			}
			result.length = count;
			return result;
		};

		var getCompareRuleThree = function(cssString){
			var result = {};
			var nameStart = 0;
			var start = cssString.indexOf("{");
			var end;
			var count = 0;
			result.style = {};

			while(start > 0)
			{			
				end = cssString.indexOf("}",start);

				var selTexts = cssString.substring(nameStart,start).toLowerCase().split(",");
				var cssText = cssString.substring(start + 1,end);
				var ruleStyle = getStyleArrayJson(cssText);

				for(var j=0;j<selTexts.length;j++)
				{
					var sText = dojo.trim(selTexts[j]);

					if(sText)
					{
						count++;
						result.style[sText]= ruleStyle;
					}
				}

				start = cssString.indexOf("{",end);
				nameStart = end + 1;
			}
			result.length = count;
			return result;
		};

		if(style)
		{
			if(type == 0)
			{
				return getCompareRuleOne(style);				
			}
			else if(style.length > 0 && !style[0].sheet)
			{
				return getCompareRuleTwo(style);
			}
			else if(style.length == 1)
			{
				return getCompareRuleThree(style[0].innerHTML);;			
			}
		}

		return;
	};

		var pastedStyles = this.getPastedStyleSheets(pe.lotusEditor.document);
		if(pastedStyles && pastedStyles.length > 0)
		{
			for(var i=0;i<pastedStyles.length;i++)
			{
				if(pastedStyles[i].getAttribute("s_href") == cssHref && pastedStyles[i].getAttribute("s_name") == styleName)
				{
					var pastedName = pastedStyles[i].getAttribute("lst_name");
					if( pastedName == styleName)
						return ['all'];
					else
						return ['pasted',pastedName];
				}
			}
		}

		var allListStyleNames = this.getAllListStyleNames();
		if(allListStyleNames && allListStyleNames.length >0 && this.isInArray(allListStyleNames,styleName.toLowerCase()))
		{
			var s1 = getCompareRules(style,0);
			var s2 = getCompareRules(this.getCSSRules([styleName], pe.lotusEditor.document),1);
			if(isSameStyleRules(s1,s2))
				return ['all'];
			
			var newStyleName = this.getNextListStyleName(allListStyleNames,count);	
			return ['name',newStyleName];
		}
		return ['none'];
	},

	getNextListStyleName : function(allListStyleNames,count){
		function getListNumber(name)
		{
			var pattern=/[0-9]+$/;
			return name.match(pattern);
		};

		function getUserOrder(){
			var participants = pe.scene.session.participantList;
			if(participants && participants.length>1)
			{
				for(var i=0;i<participants.length;i++)
				{
					if(pe.scene.authUser.getId() == pe.scene.session.participantList[i].user.getId())
						return i+1;
				}
			}
			return 1;
		};

		if(!this.listPrefix)
			this.listPrefix = "DocP" + getUserOrder();

		var namePrefix = this.listPrefix + "L";

		if(allListStyleNames && allListStyleNames.length > 0)
		{
			var n1 = getListNumber(allListStyleNames[0]);
			for(var i=1;i<allListStyleNames.length;i++)
			{
				var n2 = getListNumber(allListStyleNames[i]);
				n1 = Math.max(n1,n2);
			}
		}
		return (n1)?(namePrefix + (n1 + 1 + count)):(namePrefix + (1 + count));
	},

	getWClipItems : function(){
		
		if(!this._wClipData)
		{
			if(!this.webClipBoard)
				this.getWebClipBoard();

			var webClipDataString = this.webClipBoard.getData();	
			if(!webClipDataString)
				return;

			this._wClipData = dojo.fromJson(webClipDataString);
		}
		
		//if same document return;
		var cssHref = this._wClipData.cssHref;

		var curDocURL = pe.lotusEditor.document.$.URL;
		var curHref = curDocURL.substring(0,curDocURL.lastIndexOf('/')+1) + "style.css";
		if(cssHref == curHref)
			return;
		
		return this.getAllPastedWClipItems(this._wClipData);
	},

	getAllPastedWClipItems : function(){
		function updateWClipListCSSName(styleName,newStyleName,curStyle){
			var pattStr = "/"+"\\."+ styleName + "_/gm";
			var updatedStyle = curStyle.style.replace(eval(pattStr),"."+newStyleName+"_");
			curStyle.style = updatedStyle;
		};

		var allItems = {};
		allItems.lstStyles = {};
		allItems.lstTypes = {};
		allItems.cssHref = this._wClipData.cssHref;

		if(this._wClipData.styles)
		{
			var count = 0;
			var names = [];
			var newStyleNameCount = 0;
			for(var i=0;i<this._wClipData.styles.length;i++)
			{
				var lstStyleItem = {};
				
				var curStyle = this._wClipData.styles[i];
				var styleName = curStyle.name;

				var dupType = this.checkDupType(styleName,curStyle.style,allItems.cssHref,newStyleNameCount);

				lstStyleItem.dupType = dupType[0];

				if( lstStyleItem.dupType == 'name')
				{
					newStyleNameCount++;
					lstStyleItem.newName = dupType[1];
					updateWClipListCSSName(styleName,dupType[1],curStyle);
					lstStyleItem.style = curStyle.style;
					lstStyleItem.used = 0;
				}
				else if(lstStyleItem.dupType == 'none')
				{
					lstStyleItem.style = curStyle.style;
					lstStyleItem.used = 0;
				}
				else if(lstStyleItem.dupType == 'pasted')
				{
					lstStyleItem.newName = dupType[1];
				}

				if(lstStyleItem)
				{
					count++;
					if(curStyle.s_name)
						lstStyleItem.s_name = curStyle.s_name;
					allItems.lstStyles[styleName] = lstStyleItem;
					names.push(styleName);				
				}

			}
			allItems.lstStyles["length"] = count;
			allItems.lstStyles["names"] = names;
		}

		this._classMap = this._wClipData.lsttypes;
		allItems.lstTypes = this._wClipData.lsttypes;

		return allItems;
	},

	fixLstNodeAttr : function(thisElement,wClipData){
		
		function setNodeTypes(node,listCommonClass)
		{
			var listClass = 'lst-' + listCommonClass;
			if(!classMap[listClass])
			{
				var oClass = getLstOldName(wClipData,listCommonClass);
				if(oClass) listClass = 'lst-' + oClass;
			}

			if(classMap[listClass])
			{
				var types = classMap[listClass];
				
				var nodeTypesAttr = node.getAttribute("types");
				var nodeStartsAttr = node.getAttribute("starts");

				if(types[0] && !nodeTypesAttr)
					node.setAttribute("types",types[0]);
				if(types[1] && !nodeStartsAttr)
					node.setAttribute("starts",types[1]);
			}
		};

		function genFixedClass(node,listClass)
		{
			var next = node.getNext();
			while(next && MSGUTIL.isListItem(next))
			{
				var itemClass = LISTUTIL.getListClass(next);
				if(itemClass)
				{
					var itemLevel = parseInt(itemClass.substring(itemClass.lastIndexOf("_")+1));
					itemLevel = (itemLevel>2)?itemLevel-1:1;
					return cls + "_" + itemLevel;
				}
				next = next.getNext();
			}
			return cls + "_1";
		};

		function getLstOldName(wClipData,name)
		{
			if(wClipData && wClipData.lstStyles)
			{
				for(var i=0;i<wClipData.lstStyles.length;i++)
				{
					var oName = wClipData.lstStyles.names[i];
					var nName = (wClipData.lstStyles[oName] && wClipData.lstStyles[oName].newName)?wClipData.lstStyles[oName].newName:"";
					if(nName && nName==name) return oName;
				}
			}
			return;
		};

		if(!wClipData)
		{
			//copy paste from external application
			if(!this.webClipBoard || !this.webClipBoard.getData())
				this.fixTypesFromStandard(thisElement);
			return;
		}
		else if(wClipData.lstTypes.length < 1)
			return;

		var classMap = this._classMap;

		var topHeader = this._getTopList(thisElement);		
		var nClassAttr = thisElement.getAttribute("class");
		var nListAttr = MSGUTIL.isListItem(thisElement)?thisElement.getAttribute("_list"):null;
		var listClass = nListAttr || LISTUTIL.getListClass2(nClassAttr);

		if(topHeader)
		{
			if(listClass)
			{
				if(MSGUTIL.isList(topHeader))
				{
					var cls = this.getListCommonClass(listClass);
					listClass = 'lst-' + cls;
					
					var tListClass = LISTUTIL.getListClass(topHeader);
					if(!LISTUTIL.isNativeBulletClass(listClass))
					{
						if(!tListClass)
							LISTUTIL.setListClass(topHeader, listClass);
						else if(tListClass != listClass)
							listClass = tListClass;

						var firstLi = topHeader.getFirst();
						//if the firstLi's first child is ol, then this li should not contains list class
						//Fixed the missing class for partially selection issue
						if(firstLi && MSGUTIL.isListItem(firstLi) && !LISTUTIL.getListClass(firstLi))
						{
							var firstChild = firstLi.getFirst();
							if (!firstChild || !MSGUTIL.isList(firstChild))
							{
								var itemClass = genFixedClass(firstLi,cls);
								LISTUTIL.setListClass(firstLi, itemClass);
							}
						}
					}
				}
				setNodeTypes(topHeader, this.getListCommonClass(listClass));
			}
			
			if(!nClassAttr && MSGUTIL.isListItem(thisElement))
			{
				var firstChild = thisElement.getFirst();
				if (!firstChild || !MSGUTIL.isList(firstChild))
				{
					var previous = thisElement.getPrevious();
					if(previous)
					{
						
						nClassAttr = LISTUTIL.getListClass(previous);
						if(nClassAttr) 
						{
							var cls = this.getListCommonClass(nClassAttr);
							var itemClass = genFixedClass(thisElement,cls);
							LISTUTIL.setListClass(thisElement, itemClass);
						}
					}
				}
			}
			return;
		}
		setNodeTypes(thisElement, this.getListCommonClass(listClass));
	},

	updateNodeLstClass : function(thisElement,wClipData){
		function getNodeLstClass(thisElement,lstClasses){		
			var classAttr = thisElement.getAttribute("class");
			var _listAttr = thisElement.getAttribute("_list");

			if(classAttr)
			{
				var classArr = classAttr.split(" ");
				for(var i = 0;i<classArr.length;i++)
				{
					var idex = classArr[i].lastIndexOf("_");
					if(idex>0)
					{
						var tName = classArr[i].substring(0,idex);
						if(COPYPASTEUTIL.isInArray(lstClasses,tName))
							return tName;
					}
				}
			}

			if(_listAttr)
			{
				var idex = _listAttr.lastIndexOf("_");
				if(idex>0)
				{
					var tName = _listAttr.substring(0,idex);
					if(COPYPASTEUTIL.isInArray(lstClasses,tName))
						return tName;
				}
			}

			return;
		};

		var curLst = getNodeLstClass(thisElement,wClipData.lstStyles.names);
		if(curLst)
		{
			var lstType = wClipData.lstStyles[curLst].dupType;
			if(lstType == 'name' || lstType == 'pasted')
			{
				var newName = wClipData.lstStyles[curLst].newName;
				var classAttr = thisElement.getAttribute("class");
				if(classAttr)
				{
					classAttr = classAttr.replace(eval("/"+curLst+"/gm"),newName);
					thisElement.setAttribute("class",classAttr);
				}

				var _listAttr = thisElement.getAttribute("_list");
				if(_listAttr)
				{
					_listAttr = _listAttr.replace(curLst,newName);
					thisElement.setAttribute("_list",_listAttr);
				}
			}

			if(lstType == 'name' || lstType == 'none')
				wClipData.lstStyles[curLst].used = 1;
		}
	},

	afterWClipFixup : function(wClipData,dataHtml){
		function removeWebClipId(dataHtml){
			var pattern = eval("/<.*\\s" + this._attNameForClipId + "=\"[^\"]*\"/g");
			var s1 = pattern.exec(dataHtml);
			if(s1)
			{
				var i1 = pattern.lastIndex;
				var i2 = dataHtml.lastIndexOf(" ",i1-1);
				dataHtml = dataHtml.substring(0,i2) + dataHtml.substring(i1);
			}

			return dataHtml;
		};

		//insert styles:
		if(wClipData.lstStyles.length > 0)
		{
			var styles = [];
			styles.push(wClipData.cssHref);

			for(var i=0;i<wClipData.lstStyles.length;i++)
			{
				var lstName = wClipData.lstStyles.names[i];
				var lstType = wClipData.lstStyles[lstName].dupType;
				var used = wClipData.lstStyles[lstName].used;
				if((used > 0) && (lstType == 'name' || lstType == 'none'))
					styles.push(lstName);
			}

			if(styles.length > 1)
				this.insertStyleElements(styles,wClipData.lstStyles);			
		}

		dataHtml = removeWebClipId( "<fromwclip/>" + dataHtml );
		return dataHtml;
	},

	insertStyleElements : function(names,styles){
		var curDoc = pe.lotusEditor.document;
		var acts = [];
		var sList = "";
		var s_href; 
		if(names && names.length>1)
		{
			s_href = names[0];
			for(var i=1;i<names.length;i++)
			{
				var sName = names[i];
				
				var curStyle = styles[sName];
				if(!curStyle)
					continue;
				
				var styleContent = curStyle.style;
				var name = sName;
				if(curStyle.newName)
					name = curStyle.newName;

				var styleAttr = {};
				styleAttr["s_type"] = "pastedStyle";
				styleAttr["type"] = "text/css";
				styleAttr["lst_name"] = name;
				styleAttr["s_name"] = sName;
				styleAttr["s_href"] = s_href;

				var newStyleNode = curDoc.createElement('style',{attributes : styleAttr});
				MSGUTIL.generateID(newStyleNode);
				try
				{
					newStyleNode.$.innerHTML = styleContent;
				}
				catch(error)
				{
					newStyleNode.$.styleSheet.cssText = styleContent;
				}				
				
				curDoc.getHead().append(newStyleNode);

				var act = SYNCMSG.createInsertStyleElementAct(newStyleNode.getIndex(), newStyleNode.getParent(), newStyleNode);
				acts.push(act);
				sList +=(styleAttr["s_name"] + ":" + styleAttr["lst_name"]) + ";";
			}

			if(acts.length>0)
			{				
				var msg = SYNCMSG.createMessage(MSGUTIL.msgType.StyleElement, acts);
				SYNCMSG.sendMessage([msg]);
				pe.lotusEditor.removeUndo();	// Don't record insert style in head action.
				var serverUrl = pe.scene.session.url + "/usp";
				this.updateStringPool(serverUrl,s_href,sList);
			}
		}
	},

	filterFromWClip : function(data){
		if(data.length > 12 )
		{
			if(data.substring(0,12) == '<fromwclip/>')
				data = data.substring(12);
			else if(data.substring(0,11) == '<fromwclip>')
				data = data.substring(11,data.length-12);
		}
		return data;
	},

	updateStringPool : function(servletUrl,s_href,content){
  		if(servletUrl != null && content !=null){
  			var data = new Object();
			data.s_href = s_href;
			data.content = content;
  			var sData = dojo.toJson(data);
  			if(window.g_concordInDebugMode)
				console.log('paste preserved odf string pool: submitting paste string pool request to server...');
			dojo.xhrPost({
  				url: servletUrl,
  				handleAs: "json",
  				load: function(r, io) {
  					response = r; 
  					ioArgs = io;
  				},
  				error: function(error,io) {
  					console.log('An error occurred:' + error);
  				},
  				sync: true,
  				contentType: "text/plain",
  				postData: sData
  			});
  		}//end if
  	},//end

	updateListTypeStyle : function(curNode)	{
		var header = LISTUTIL.getHeaderList(curNode);
		var lst = LISTUTIL.getStandardListType(LISTUTIL.getListType(curNode, header),curNode);
		if(!lst) return header;
		if(CKEDITOR.env.ie)
		{
			var newAttr = 'list-style-type:' + lst +';';
			var cssText = curNode.$.style.cssText;
			if(!cssText) cssText = '';
			if(cssText.length ==0)
				cssText = newAttr;
			else if( cssText.substring(cssText.length-1)!=';' )
				cssText += ';' + newAttr;
			else
				cssText += newAttr;
			curNode.$.style.cssText = cssText;
		}
		else
			curNode.$.style.listStyleType = lst;
		
		return header;
	},

	getListCommonClass : function (lstclass){
		if(!lstclass) return;
		var index = 0;
		if( lstclass.length>4 && lstclass.indexOf('lst-') != -1)
			return lstclass.substring(4);
		else if((index = lstclass.indexOf('_')) != -1)
			return lstclass.substring(0,lstclass.lastIndexOf("_"));
		
		return lstclass;
	},

	getListTag: function(listClass){
		var classMap = this._classMap;
		if(!classMap) return "ul";

		var getTypes = function(lstclass)
		{
			lstclass = COPYPASTEUTIL.getListCommonClass(lstclass);			
			return classMap[lstclass] || ""; 
		};

		var types= getTypes(listClass);
		var infos = LISTUTIL.getOutlineInfo(types);

		if(infos.length == 0) return 'ul';

		var level = 0, index;
		if( (index = listClass.indexOf('_')) != -1)
			level = parseInt(listClass.substring(index + 1)) || 0;

		if(level) level = level - 1;

		if(level >= infos.length)
			level = infos.length - 1;

		return infos[level][2];	
	},

	getNodeOutlineType : function (node,level){
		var nListType;
		if(node.is('li'))
		{
			if(node.$.style.listStyleType)
				nListType = LISTUTIL.getConcordListType(node.$.style.listStyleType);
			else
			{
				var cls = LISTUTIL.getListClass(node);
				if(cls && LISTUTIL.isNativeBulletClass(cls))
					nListType = [cls,'1',getBulletTagByClass(cls)];
			}
		}
		else
		{
			if(node.$.style.listStyleType)
				nListType = LISTUTIL.getConcordListType(node.$.style.listStyleType);
			else {
				// defect 28586, we should get the first element node
				var firstElement = node.getFirst();
				while( firstElement && firstElement.type != CKEDITOR.NODE_ELEMENT )
				{
					firstElement = firstElement.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT );
				}
				
				if ( firstElement )
				{
					nListType = this.getNodeOutlineType( firstElement );
				}
			}
			
			if(!nListType)
				nListType = this.getDefaultLevelInfo(node,level);
		}
		return nListType;
	},

	getDefaultLevelInfo : function (node,level,complete){
		if(!complete)
		{
			if(!level)
				level = 0;
			else if(level>9)
				level = 9;

			return LISTUTIL.getDefaultOutline(node.is('ol'))[level];
		}
		else
			return LISTUTIL.getDefaultOutline(node.is('ol'));
	},

	fixTypesFromStandard : function(inputNode){
		if(MSGUTIL.isListItem(inputNode))
		{
			var parent = inputNode.getParent();
			var isParentBullet = MSGUTIL.isBullet(parent);
			if(MSGUTIL.isBullet(parent))
			{
				if(inputNode.$.style.listStyleType && !parent.$.style.listStyleType)
					parent.$.style.listStyleType = inputNode.$.style.listStyleType;
				inputNode.$.style.listStyleType = '';
			}			
		}
	},
	
	removeLstPClass : function(inputNode){
		if(inputNode.hasAttribute("style") && inputNode.hasAttribute('class'))
		{
			if(inputNode.is('span'))
				inputNode.removeAttribute('class');
			else
			{
				var classes = inputNode.getAttribute("class").split(' ');
				var cls;
				var regx = /[A-Za-z0-9_]+(_[0-9]+)+(\s|$)|lst-[a-zA-Z0-9_\-]+/g;
				for( i =0; i< classes.length; i++ )
				{
					cls = dojo.trim(classes[i]);
					if(cls && cls!='cssHeading' && !cls.match(regx))
						inputNode.removeClass(cls);
				}				
			}
		}
	}
});
(function() {
	if (typeof COPYPASTEUTIL == "undefined")
		COPYPASTEUTIL = new concord.text.CopyPasteUtil();
})();
