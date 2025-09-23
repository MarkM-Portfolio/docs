/**
 * 
 */
dojo.provide("concord.pres.CopyPasteManager");
dojo.require("concord.text.ListUtil");

dojo.requireLocalization("concord.scenes","Scene");
dojo.declare("concord.pres.CopyPasteManager", null, {
	
	_attNameForClipId:null,
	webClipBoard:null,

	constructor: function()
	{
		this._attNameForClipId = "_clipboardid";
	},
	
	getWebClipBoard : function(){
		if(!this.webClipBoard)
			this.webClipBoard = pe.scene.getPresClipBoard();
		return this.webClipBoard;
	},	
	
	updateCopyArea : function(currSel){
    	function genWClipHead(eid, id)
    	{
    		var head = {};
    		head.cid = id;
    		head.eid = eid;
    		return head;
    	};

		try{
			var currRanges = currSel.getRanges();
			
			this.getWebClipBoard();
			this.cleanWebClipBoard();
			
			var rangeInfo = this.getSelRangeInfo(currRanges);
	    	var lstTypes = rangeInfo.listTypes ;
	    	var webClipData;
	
	    	if((lstTypes.length > 0))
	    	{
		    	var c_id = MSGUTIL.getUUID();
	    		var endPath = currSel.getEndElementPath();
	    		var endE = endPath.elements[0];
	    		if(endE.getName() == "br")
	    			endE = endPath.elements[1];

    			endE.setAttribute(this._attNameForClipId,c_id);
    			console.log("<<<<:"+endE.$.outerHTML);
		    	webClipData  = genWClipHead(endE.$.id,c_id);
	
				this.webClipBoard.setData(dojo.toJson(webClipData));
				console.log("DATA:"+dojo.toJson(webClipData));
	    	}  	
		}
		catch(e)
		{
			if(window.g_concordInDebugMode)
				console.log("Execption in updateCopyArea " + e);
			this.cleanWebClipBoard();
		}
	},

	cleanWebClipBoard : function ()
	{
		this.webClipBoard.emptyClipboard();	
		this.cleanWebClipData();
	},

	cleanWebClipData : function ()
	{
//		delete this._classMap;
//		delete this._wClipData;
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
	//===================================================================END 
	//NOT SURE NEED
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
	}
});
(function() {
	if (typeof COPYPASTEMANAGER == "undefined")
		COPYPASTEMANAGER = new concord.pres.CopyPasteManager();
})();