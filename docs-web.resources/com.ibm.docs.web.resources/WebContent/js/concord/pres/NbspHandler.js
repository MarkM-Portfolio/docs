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

dojo.provide("concord.pres.NbspHandler");
dojo.declare("concord.pres.NbspHandler", null, {
	contentBox:null,
	constructor:function(contentBox){
		this.contentBox = contentBox;
	},
	/**
	 * The below function is to add '&nbsp' to a blank content box 
	 * when user press 'Enter' key to identify if it's a default content box
	 */
	addNbsp: function() {
		var body= this.contentBox.editor.document.getBody().$;
	    var drawFrameClassNode = dojo.query(".draw_frame_classes",body)[0];		
		if(drawFrameClassNode){
			if((drawFrameClassNode.childNodes).length==1){
				var contentNode=drawFrameClassNode.firstChild;//p or ul
				if((contentNode.childNodes).length==1){
					var node=contentNode.firstChild;//span or li
					var textContent=node.textContent;//firefox
					if(CKEDITOR.env.ie){
						if(node.nodeName.toLowerCase()=='li')
							node=node.firstChild;
						    var textContent=node.innerText;
						}
						if(textContent == ''||textContent=='\xa0'){
							node.innerHTML = '&nbsp';
						}
					}else{
						var hasTxt = false;
						for(var i=0;i<(contentNode.childNodes).length;i++){
							var node=contentNode.childNodes[i];//span or li
							var textContent=node.textContent;//firefox
							if(CKEDITOR.env.ie){
							   	if(node.nodeName.toLowerCase()=='li')
							    	node=node.firstChild;
							        var textContent=node.innerText;
							    }
							hasTxt = hasTxt?hasTxt:this.hasTxt(textContent,true);
						}
						if(!hasTxt)
							contentNode.childNodes[0].innerHTML = '&nbsp';
						}
			    	}
			}
	},
	/**
	 * Below function is to check if it's a content box with text.
	 */
	checkTxtBox: function(node){
		var hasTxt = false;
		if(node.type == CKEDITOR.NODE_TEXT || node.is('li'))
			return true;
		else{
			if(node.getChildCount() > 0)
			{
				if(this.checkTxtBox(node.getFirst()))
				{
					if(node.getFirst().type == CKEDITOR.NODE_TEXT){
						var parentNode = node.getParent();
						var count = 0;
						for(var i=0;i<parentNode.getChildCount();i++){
							if(parentNode.getChild(i).type != CKEDITOR.NODE_TEXT)
								for(var j=0;j<parentNode.getChild(i).getChildCount();j++){
									var child = parentNode.getChild(i).getChild(j);
									if(child){
										if(child.type == CKEDITOR.NODE_TEXT)
										{
											count += child.$.parentNode.innerHTML.length;
											var childTxt = child.getText();
											hasTxt = hasTxt?hasTxt:this.hasTxt(childTxt,true);
										}
									}
								}
							else{
								var child = parentNode.getChild(i);
								if(child){
									count += child.$.parentNode.innerHTML.length;
									var childTxt = child.getText();
									hasTxt = hasTxt?hasTxt:this.hasTxt(childTxt,true);
								}
							}
						}
						return hasTxt||	count>6;
					}else
						return true;
				}
			}else{
				for(var j=0; j<node.getParent().getChildCount();j++){
					hasTxt = hasTxt?hasTxt:this.hasTxt(node.getParent().getChild(j),true);
				}
				return hasTxt;
			}
		}
	},
	/**
	 * The below function is to check if it's a blank text node
	 */
	hasTxt:function(childTxt){
		var hasTxt = false;
		for(var i=0;i<childTxt.length;i++){
			if(childTxt.substring(i,i+1) !=''&&
			   childTxt.substring(i,i+1) != ' '&&
			   childTxt.substring(i,i+1) != '\xa0' && childTxt.charCodeAt(i) !='8203')
				hasTxt = true;	
		}
		
		return hasTxt;
	},
	/**
	 * The below function is to get the last text node of the parent node
	 */
	getTextNode:function(node,handler){
		if(node.type == CKEDITOR.NODE_TEXT && node.$.textContent!='')
			return node;
		else{
			if(node.type != CKEDITOR.NODE_TEXT && node.getChildCount() > 0)
				return handler.getTextNode(node.getLast(), handler);
			else
			{
				var parent,index;
				if(node.type != CKEDITOR.NODE_TEXT && node.is('span'))
				{
					parent = node.getParent();
					index = node.getIndex();
				}else{
					var parent = node.getParent().getParent();
					var index = node.getParent().getIndex();	
				}
				if(index>0)
				{	
					if(parent.getChild(index-1).type != CKEDITOR.NODE_TEXT && node.$.textContent!='')
						return parent.getChild(index-1);
					return handler.getTextNode(parent.getChild(index-1), handler);
				}
			}
		}
	}
});