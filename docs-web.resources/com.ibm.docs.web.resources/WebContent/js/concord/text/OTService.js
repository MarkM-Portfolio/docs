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

dojo.provide("concord.text.OTService");
dojo.require("concord.text.MsgUtil");

dojo.declare("concord.text.OTService", null, {
	
	findRelatedMsg : function(msg,list)
	{
		var baseList = new Array();
		for (var i=0;i<list.length;i++)
		{
			var localMsg = list[i];
			if ( this.checkRelated(msg,localMsg) )
				baseList.push(localMsg);
		}
		return baseList;		
	},
	
	getTargetNodes : function(msg)
	{
		var nodes = [];
		if (msg.updates != null)
		{
			for (var j=0;j<msg.updates.length;j++)
			{
		        var op = msg.updates[j];
				if (op.tid != null)
		        	nodes.push(op.tid);
				//for two special case, extra id
		        if (op.t == MSGUTIL.actType.deleteElement)
		        {
		          nodes = nodes.concat(op.elist);
		        }
		        if (op.t == MSGUTIL.actType.setAttributes)
		        {
		          nodes.push(op.bid);
		        }
		        if (op.t == MSGUTIL.actType.deleteTask)
		        {
		          nodes.push(op.rid);
		        }	        
			}
		}
		return nodes;
	},
	
	checkRelated : function(msg,localMsg)
	{
		if((msg.type == MSGUTIL.msgType.ResetContent || msg.type == MSGUTIL.msgType.presResetContent) && msg.type == localMsg.type)
			return true;
		
		var nodes1 = this.getTargetNodes(msg);
		var nodes2 = this.getTargetNodes(localMsg);
		if (nodes1.length == 0 || nodes2.length == 0)
			return false;
		for (var i = 0; i < nodes1.length; i++)
	    {
	      for (var j = 0; j < nodes2.length; j++)
	      {
	        if (nodes1[i] == nodes2[j])
	          return true;
	      }
	    }
	    if (msg.type == MSGUTIL.msgType.Table && localMsg.type == MSGUTIL.msgType.Table )
	    {
	    	return true;
	    }
		
	    return false;
	},
	
  _isSameObjId : function(opId, baseOpId) {
    if (!opId || !baseOpId) {
      return false;
    }
    if (opId !== baseOpId) {
      return false;
    } else {
      return true;
    }
  },
  
  _checkPresIEDEConflict : function(baseOp, op) {
    if (!baseOp || !op) {
      return false;
    }
    if (baseOp.p_isnasw) {
      if (op.p_isnasw) {
        return this._isSameObjId(op.p_sid, baseOp.p_sid);
      } else if (op.p_isnad) {
        return this._isSameObjId(op.p_sid, baseOp.p_sid);
      } else if (op.p_tt) {
        return this._isSameObjId(op.p_sid, baseOp.p_sid);
      }
    } else if (baseOp.p_isnad) {
      if (op.p_isnasw) {
        return this._isSameObjId(op.p_sid, baseOp.p_sid);
      } else if (op.p_isnad) {
        return this._isSameObjId(op.p_nid, baseOp.p_nid);
      } else if (op.p_tt) {
        return this._isSameObjId(op.p_cid, baseOp.p_nid);
      }
    } else if (baseOp.p_tt) {
      if (op.p_isnasw) {
        return this._isSameObjId(op.p_sid, baseOp.p_sid);
      } else if (op.p_isnad) {
        return this._isSameObjId(op.p_nid, baseOp.p_cid);
      } else if (op.p_tt) {
        // For table, rn operation node can be td or tbody
        // So cannot use parent id to avoid conflict. Just use content box id
        return this._isSameObjId(op.p_cid, baseOp.p_cid);
      }
    }
    
    return false;
  },

  transform : function(msg,localList,isFromUndo)
  {
    //var baseList = this.findRelatedMsg(msg,localList);
    var baseList= localList;
    
    var type = msg.type;
    var ops = msg.updates;//only read/write msg once for transform process
    var isRejected = false;
    
    for (var index = 0; index < baseList.length; index++)
    {
      var baseMsg = baseList[index];
      var baseOps = baseMsg.updates;
      if(!this.checkRelated(msg, baseMsg))
      {
    	  if(!((pe.scene.docType == 'pres') && this.checkPresRNandA(baseOps, ops)))
    	  continue;
      }
      
      var baseType = baseMsg.type;
      type = msg.type;
      
     
        
      if(baseType == MSGUTIL.msgType.OUTLINE){
        return true;
      } 
      if((baseType != MSGUTIL.msgType.Table && type == MSGUTIL.msgType.Table) || (baseType == MSGUTIL.msgType.Table && type != MSGUTIL.msgType.Table))
      {
        isRejected = this.checkTableConflict(baseOps,ops,baseType == MSGUTIL.msgType.Table);
          if (isRejected)
            return baseMsg;
      }
      //toc	      
      if( baseType == MSGUTIL.msgType.Toc && type == MSGUTIL.msgType.Toc )
        isRejected = true;
      else
      {
        if( baseType == MSGUTIL.msgType.Toc ) baseType = MSGUTIL.msgType.Element;
        if( type == MSGUTIL.msgType.Toc ) type = MSGUTIL.msgType.Element;
      }

      if (baseType == MSGUTIL.msgType.Text)
      {
        if (type == MSGUTIL.msgType.Text)
        {
          isRejected = this.transTextText(baseOps,ops,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.InlineStyle)
        {
          isRejected = this.transTextStyle(baseOps,ops);
        }
        else if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.Table || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)
        {
          //isRejected = this.checkTargetConflict(baseOps,ops,false);
        }
        else if (type == MSGUTIL.msgType.Attribute)
        {
          isRejected = this.checkTextAttrConflict(baseOps,ops,true);
        }
        else if (type == MSGUTIL.msgType.Split)
        {
          isRejected = this.checkTextSplitConflict(baseOps,ops,true,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.Join)
        {
          isRejected = this.checkTextJoinConflict(baseOps,ops,true,isFromUndo);
        }
      }
      else if (baseType == MSGUTIL.msgType.Element || baseType == MSGUTIL.msgType.ReplaceNode || baseType == MSGUTIL.msgType.MoveSlide)
      {
        if (pe.scene.docType !== 'pres') {
          if (type == MSGUTIL.msgType.Element || type== MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)
          {
            if (baseType == MSGUTIL.msgType.ReplaceNode && type == MSGUTIL.msgType.ReplaceNode)
            {
              isRejected = this.checkReplaceConflict(baseOps,ops);
              if (isRejected)
              {
                if(!isFromUndo)
                  return baseMsg;
                else
                {
                  msg.updates = [];
                  return msg;
                }
              }else{
                isRejected= this.transReplaceReplace(baseOps,ops,isFromUndo);
              }
            }else if (baseType == MSGUTIL.msgType.Element && (type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)){
              isRejected = this.transElementReplace(baseOps,ops,isFromUndo);
            }else if((baseType == MSGUTIL.msgType.ReplaceNode || baseType == MSGUTIL.msgType.MoveSlide)&& type == MSGUTIL.msgType.Element){
              isRejected = this.transElementReplace(ops,baseOps,isFromUndo);
            }
            else if(baseType == MSGUTIL.msgType.MoveSlide && type == MSGUTIL.msgType.MoveSlide){
	        	  isRejected = this.transMoveSlideMoveSlide(baseOps,ops,isFromUndo);
            }
            else if(type == MSGUTIL.msgType.Element && this.isBaseOperationPresTasked(baseOps)){
               isRejected = this.checkPresTaskConflict(baseOps,ops);
            }
            else{
              isRejected = this.transElementElement(baseOps,ops,isFromUndo);
            }
          }
          else if(type == MSGUTIL.msgType.Table)
          {
            isRejected = this.transElementElement(baseOps,ops,isFromUndo);
          }
          else if (type == MSGUTIL.msgType.Text)
          {
            //isRejected = this.checkTargetConflict(baseOps,ops,true);
            //deleteElement + deleteText OT with (deleteElement + deleteText)'s undo message
            // Base message is delete element
            // Incoming message is insert text message
            // Transform the incoming message to empty message in undo scenario.
            if(isFromUndo)
            {
              for (var i = 0; i < baseOps.length; i++)
              {
                var baseOp = baseOps[i];
                if (baseOp.t == MSGUTIL.actType.deleteElement)
                {
                  for (var j = 0; j < ops.length; j++)
                  {
                    var op = ops[j];
                    if(op.t == MSGUTIL.actType.insertText && this._checkKeyOnList(op.tid,baseOp.elist) && baseOp.len > 0)
                    {//#47023,we don't need to empty text message when incoming de message is empty
                      //(len == 0 means this de message is empty)
                      op.idx = 0;
                      op.len = 0;
                      op.cnt = [];
                    }
                  }
                }
              }
            }

          }
          else if (type == MSGUTIL.msgType.InlineStyle)
          {
            isRejected = this.checkTargetConflict(baseOps,ops,true);
          }
          else if (type == MSGUTIL.msgType.Attribute)
          {
            isRejected = this.checkTargetAttrConflict(baseOps,ops,true);
          }
          else if( type == MSGUTIL.msgType.Task )
          {
            isRejected = this.transElementTask(baseOps, ops);
          }
          else if (type == MSGUTIL.msgType.Split)
          {
              isRejected = this.checkElementSplitConflict(baseOps,ops,true,isFromUndo);
          }
          else if (type == MSGUTIL.msgType.Join)
          {
              isRejected = this.checkElementJoinConflict(baseOps,ops,true,isFromUndo);
          }
          else if(type==MSGUTIL.msgType.List){

            isRejected= this.checkListConflict(ops,baseOps);
          }
        } else {  // Pres document
          if (type == MSGUTIL.msgType.Element || type== MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide) {
            if (baseType == MSGUTIL.msgType.ReplaceNode) {
              if (type == MSGUTIL.msgType.Element) {
                isRejected = this.checkPresReplaceElement(baseOps, ops);
              } else if (type== MSGUTIL.msgType.ReplaceNode ||
                type == MSGUTIL.msgType.MoveSlide) {
                isRejected = this.checkPresReplaceReplace(baseOps, ops);
                if (isRejected) {
                  // console.log("Message is rejected by " + baseType + " and " + type);
                  // console.log("baseMsg:", dojo.toJson(baseMsg));
                  // console.log("currentMsg:", dojo.toJson(msg));
                  if(!isFromUndo)
                    return baseMsg;
                  else
                  {
                    msg.updates = [];
                    return msg;
                  }
                }
              }
            } else if (baseType == MSGUTIL.msgType.Element){
              if (type == MSGUTIL.msgType.Element) {
                isRejected = this.transPresElementElement(baseOps, ops, isFromUndo);
              } else if (type == MSGUTIL.msgType.ReplaceNode) {
                isRejected = this.checkPresReplaceElement(ops, baseOps);
              }else if (type == MSGUTIL.msgType.MoveSlide) {
                isRejected = this.checkPresElementMove(baseOps, ops, true);
              }
            } else if(baseType == MSGUTIL.msgType.MoveSlide){
              if (type == MSGUTIL.msgType.Element) {
                isRejected = this.checkPresElementMove(ops, baseOps, false);
              } else if (type == MSGUTIL.msgType.ReplaceNode) {
                isRejected = this.checkPresReplaceReplace(baseOps, ops);
              } else if (type == MSGUTIL.msgType.MoveSlide) {
                isRejected = this.checkPresSlideMove(baseOps, ops);
              }
            } else if(this.isBaseOperationPresTasked(baseOps)){
              if (type == MSGUTIL.msgType.Element)
               isRejected = this.checkPresTaskConflict(baseOps,ops);
            }
            // if (isRejected)
              // console.log("Message is rejected by " + baseType + " and " + type);
          } else if (type == MSGUTIL.msgType.Attribute) {
            if (baseType == MSGUTIL.msgType.Element) {
              isRejected = this.checkPresAttrElement(ops, baseOps);
            } else if (baseType == MSGUTIL.msgType.ReplaceNode ||
              baseType == MSGUTIL.msgType.MoveSlide) {
              isRejected = this.checkPresAttrReplace(ops, baseOps);
            }
            // if (isRejected)
              // console.log("Message is rejected by " + baseType + " and " + type);
          } else if( type == MSGUTIL.msgType.Task ) {
            isRejected = this.transElementTask(baseOps, ops);
          }
        }
      }
      else if (baseType == MSGUTIL.msgType.InlineStyle)
      {
        if (type== MSGUTIL.msgType.InlineStyle)
        {
          isRejected = this.transStyleStyle(baseOps,ops);
        }
        else if (type == MSGUTIL.msgType.Text)
        {
        	isRejected = this.transStyleText(baseOps,ops);
        }
        else if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.Table || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)
        {
        	isRejected = this.checkTargetConflict(baseOps,ops,false);
        }
        else if (type == MSGUTIL.msgType.Split)
        {
        	isRejected = this.checkStyleSplitConflict(baseOps,ops,true,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.Join)
        {
          isRejected = this.checkStyleJoinConflict(baseOps,ops,true,isFromUndo);
        }
      }
      else if (baseType == MSGUTIL.msgType.Attribute)
      {
        if (pe.scene.docType !== 'pres') {
          if (type == MSGUTIL.msgType.Attribute)
          {
            isRejected = this.transAttrAttr(baseOps,ops);
          }
          else if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.Table || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)
          {
            isRejected = this.checkTargetAttrConflict(baseOps,ops,false);
          }
          else if (type == MSGUTIL.msgType.Text)
          {
            isRejected = this.checkTextAttrConflict(baseOps,ops,false);
          }
          else if(type == MSGUTIL.msgType.Join)
          {
            isRejected = this.checkTargetConflict(baseOps,ops,false);
          }
          else if(type == MSGUTIL.msgType.Split)
          {
            isRejected = this.checkSplitAttrConflict(baseOps,ops,false);
          }
        } else {  // pres document
          if (type == MSGUTIL.msgType.Attribute) {
            isRejected = this.transPresAttrAttr(baseOps,ops);
          } else if (type == MSGUTIL.msgType.Element) {
            isRejected = this.checkPresAttrElement(baseOps,ops);
          } else if (type == MSGUTIL.msgType.ReplaceNode ||
            type == MSGUTIL.msgType.MoveSlide) {
            isRejected = this.checkPresAttrReplace(baseOps,ops);
          }
          // if (isRejected)
            // console.log("Message is rejected by " + baseType + " and " + type);
        }
      }
      else if (baseType == MSGUTIL.msgType.Task )
      {
        if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.Split || type == MSGUTIL.msgType.Join || type == MSGUTIL.msgType.MoveSlide)
        {
          isRejected = this.transTaskElement(baseOps, ops);
        } else if ( type == MSGUTIL.msgType.Task )
        {
          isRejected = this.transTaskTask(baseOps, ops);
        }
      }
      else if (baseType == MSGUTIL.msgType.Table)
      {
        if (type== MSGUTIL.msgType.Table)
        {
          isRejected = (msg.data == baseMsg.data);
        }
        else if(type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.MoveSlide)
        {
        	isRejected = this.transElementElement(baseOps,ops,isFromUndo);
        }
        else if(type == MSGUTIL.msgType.Text)
        {
        //	isRejected = this.checkTargetConflict(baseOps,ops,true);
        }
        else if (type == MSGUTIL.msgType.InlineStyle)
        {
          isRejected = this.checkTargetConflict(baseOps,ops,true);
        }
        else if (type == MSGUTIL.msgType.Attribute)
        {
        	isRejected = this.checkTargetAttrConflict(baseOps,ops,true);
        }
        else if(type == MSGUTIL.msgType.Split)
        {
        	isRejected = this.checkElementSplitConflict(baseOps,ops,true,isFromUndo);
        }
        else if(type == MSGUTIL.msgType.Join)
        {
        	isRejected = this.checkElementJoinConflict(baseOps,ops,true,isFromUndo);
        }
      }
      else if(baseType == MSGUTIL.msgType.Split)
      {
        if (type == MSGUTIL.msgType.Text)
        {
          isRejected = this.checkTextSplitConflict(baseOps,ops,false,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.Table || type == MSGUTIL.msgType.MoveSlide)
        {
          isRejected = this.checkElementSplitConflict(baseOps,ops,false,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.InlineStyle)
        {
          isRejected = this.checkStyleSplitConflict(baseOps,ops,false,isFromUndo);
        }
          else if(type == MSGUTIL.msgType.Split)
          {
            if(isFromUndo && this.isTheSameSplitJoinMsg(baseOps,ops))
              msg.updates = [];
            else
              isRejected = this.checkSplitSplitConflict(baseOps,ops,isFromUndo);
          }
          else if(type == MSGUTIL.msgType.Join)
          {
            isRejected = this.checkSplitJoinConflict(baseOps,ops,true,isFromUndo);
          }
          else if (type == MSGUTIL.msgType.Task )
          {
            isRejected = this.transElementTask(baseOps, ops);
          }
          else if(type==MSGUTIL.msgType.List){
            
            isRejected= this.checkListConflict(ops,baseOps);
          }
          else if (type == MSGUTIL.msgType.Attribute)
          {
            isRejected = this.checkSplitAttrConflict(baseOps,ops,true);
          }
      }
      else if (baseType == MSGUTIL.msgType.Join)
      {
        if (type == MSGUTIL.msgType.Text)
        {
          isRejected = this.checkTextJoinConflict(baseOps,ops,false,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.Element || type == MSGUTIL.msgType.ReplaceNode || type == MSGUTIL.msgType.Table || type == MSGUTIL.msgType.MoveSlide)
        {
          isRejected = this.checkElementJoinConflict(baseOps,ops,false,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.InlineStyle)
        {
          isRejected = this.checkStyleJoinConflict(baseOps,ops,false,isFromUndo);
        }
        else if (type == MSGUTIL.msgType.Attribute)
          {
            isRejected = this.checkTargetConflict(baseOps,ops,true);
          }
          else if(type == MSGUTIL.msgType.Split)
          {
            isRejected = this.checkSplitJoinConflict(baseOps,ops,false,isFromUndo);
          }
          else if(type == MSGUTIL.msgType.Join)
          {
            if(isFromUndo && this.isTheSameSplitJoinMsg(baseOps,ops))
              msg.updates = [];
            else
              isRejected = this.checkJoinJoinConflict(baseOps,ops,isFromUndo);
          }
          else if (type == MSGUTIL.msgType.Task )
          {
            isRejected = this.transElementTask(baseOps, ops);
          }
          else if(type==MSGUTIL.msgType.List){

            isRejected= this.checkListConflict(ops,baseOps);
          }
      }
      else if(baseType == MSGUTIL.msgType.ResetContent || baseType == MSGUTIL.msgType.presResetContent)
      {
        if(baseType == type)
          isRejected = true;
        else if(!isFromUndo)
        {
          // Empty the message
          msg.updates = [];
          msg.data = '';
        }
      }
      else if(type == MSGUTIL.msgType.ResetContent || type == MSGUTIL.msgType.presResetContent)
      {
       // Reject local message when receive reset content message.
        isRejected = true;
      }
      else if(baseType==MSGUTIL.msgType.List){
        if(type==MSGUTIL.msgType.Element
            ||type==MSGUTIL.msgType.ReplaceNode
            ||type==MSGUTIL.msgType.Split
            ||type==MSGUTIL.msgType.Join
            ||type == MSGUTIL.msgType.MoveSlide)
        {

          isRejected= this.checkListConflict(baseOps,ops);
        }
      }
      if(MSGUTIL.isMsgOT(msg,baseMsg) && isFromUndo)
        msg.ot = true;
      if (isRejected) {
        // console.log("baseMsg:", dojo.toJson(baseMsg));
        // console.log("currentMsg:", dojo.toJson(msg));
        return baseMsg;
      }
    }
    return null;
  },

  transTextText : function(baseOps, ops,isFromUndo)
  {
	var actType = MSGUTIL.actType;
	var baseLen=baseOps.length;
	for (var i = 0; i< baseLen; i++)
    {
      var baseOp = baseOps[i];
      //defect 46118
      var len = ops.length;
      for (var j=0; j< len; j++)
      {
        var op = ops[j];
        if (baseOp.t == actType.insertText)
        {
          if (op.t == actType.insertText)
          {
            this._transInsertInsertText(baseOp,op,isFromUndo);
          }
          else if (op.t == actType.deleteText)
          {
            var newOp = this._transInsertDeleteText(baseOp,op);
            if (newOp != null && !isFromUndo) {
				ops.push(newOp);
			}
          }
        }
        else if (baseOp.t == actType.deleteText)
        {
          if (op.t == actType.insertText)
          {
        	  var newOp=this._transDeleteInsertText(baseOp,op);
			  // Add new op to base message except undo/redo
			  if(!isFromUndo && newOp!=null){
			  	baseOps.push(newOp);
			  }
          }
          else if (op.t == actType.deleteText)
          {
        	  this._transDeleteDeleteText(baseOp,op);
          }          
        }
      }     
    }
    return false;
  },
  
  isBaseOperationPresTasked : function(baseOps)
  {
    if (!baseOps) {
        return false;
    }
  	var actType = MSGUTIL.actType;
  	for (var i = 0; i< baseOps.length; i++)
  	{
  		var baseOp = baseOps[i];
  		if (baseOp.t == actType.insertElement && baseOp.p_isnat == "true"){
  			return true;
  		}
  	}
  	return false;  	 
  },
    
  checkPresTaskConflict : function(baseOps, ops)
  { 	
	if (!baseOps || !ops) {
          return false;
	}
  	var actType = MSGUTIL.actType;
  	for (var i = 0; i< baseOps.length; i++)
  	{
  		var baseOp = baseOps[i];
  		if (baseOp.t == actType.insertElement && baseOp.p_isnat == "true"){
  			for (var j=0; j< ops.length; j++)
  			{
  				var op = ops[j];
  				if(op.p_isnat == "true" && baseOp.tid == op.tid && op.t == actType.insertElement ){
  						return true;
  				}       		       	 		
  			}
  		}      	     
  	} 
  	return false; 	
  },
  
  transPresElementElement : function(baseOps, ops, isFromUndo) {
    var conflict = false;
    var checked = false;
	if (!baseOps || !ops) {
		return false;
	}
    var actType = MSGUTIL.actType;
    for (var i = 0; i< baseOps.length; i++) {
      var baseOp = baseOps[i];
      for (var j=0; j< ops.length; j++) {
        var op = ops[j];
        // not delete or insert element in the same container
        if(baseOp.tid != op.tid)
          continue;
        if (baseOp.t == actType.insertElement) {
          if (op.t == actType.insertElement) {
            if (baseOp.p_isnasw && op.p_isnasw)
              this._transInsertInsertElement(baseOp, op, isFromUndo);
            // others no conflicts
          } else if (op.t == actType.deleteElement) {
            if (baseOp.p_isnasw && op.p_isnasw)
              this._transPresInsertDeleteSlideElem(baseOp, op);
            else if (baseOp.p_isnad && op.p_isnasw) {
              conflict = this._checkPresIEDEConflict(baseOp, op);
              if (conflict) return conflict;
            }
            // others no conflicts
          }
        } else if (baseOp.t == actType.deleteElement) {
          if (op.t == actType.insertElement) {
            if (baseOp.p_isnasw && op.p_isnasw)
              this._transPresDeleteInsertSlideElem(baseOp, op);
            else if (baseOp.p_isnasw && op.p_isnad) {
              conflict = this._checkPresIEDEConflict(baseOp, op);
              if (conflict) return conflict;
            }
            // others no conflicts
          } else if (op.t == actType.deleteElement) {
            if (baseOp.p_isnasw && op.p_isnasw) {
              if (!checked) {
                conflict = this._checkPresAllSlidesDeleted(baseOps, ops);
                if (conflict) return conflict;
                checked = true;
              }
//              conflict = this._transPresDeleteDeleteSlideElem(baseOp, op);
              if (conflict) return conflict;
              //check if both ops are slide wrappers (p_isnasw is true)
              //meaning both baseOp and Op are trying to delete slides
              //if both try to delete slides, we need to check if this is going to delete all the slides in slidesorter
              //need to handle this scenario so that slidesorter would never be with 0 slide.
              //PROCMSG.checkNHandleDeleteOnlySlide(baseOp);
            } else {
              conflict = this._checkPresIEDEConflict(baseOp, op);
              if (conflict) return conflict;
            }
          }
        }
      }
    }
    return conflict;
  },

  transElementElement : function(baseOps, ops,isFromUndo)
  {
	var actType = MSGUTIL.actType;
	for (var i = 0; i< baseOps.length; i++)
    {
      var baseOp = baseOps[i];
      
      
      for (var j=0; j< ops.length; j++)
      {
        var op = ops[j];
        if(baseOp.tid != op.tid)
        	continue;
        if (baseOp.t == actType.insertElement)
        {
          if (op.t == actType.insertElement)
          {
            this._transInsertInsertElement(baseOp,op,isFromUndo);
          }
          else if (op.t == actType.deleteElement)
          {
            var newOp = this._transInsertDeleteElement(baseOp,op);
            if (newOp != null)
              ops.push(newOp);//add new operation created on OT
          }
        }
        else if (baseOp.t == actType.deleteElement)
        {
          if (op.t == actType.insertElement)
          {
            this._transDeleteInsertElement(baseOp,op);
          }
          else if (op.t == actType.deleteElement)
          {
            this._transDeleteDeleteElement(baseOp,op);
            //check if both ops are slide wrappers (p_isnasw is true)
            //meaning both baseOp and Op are trying to delete slides
            //if both try to delete slides, we need to check if this is going to delete all the slides in slidesorter
            //need to handle this scenario so that slidesorter would never be with 0 slide.
            if(op.p_isnasw == true && baseOp.p_isnasw == true){ //if both deleting slide wrapper
            	PROCMSG.checkNHandleDeleteOnlySlide(baseOp);
            }
          }
        }
      }     
    }
    return false;
  },
  
  checkPresElementMove : function(baseOps, ops, isElementEarlier) {
    var conflict = false;
    if (!baseOps || !ops) {
      return false;
    }
    for (var i = 0; i < baseOps.length; i++) {
      var baseOp = baseOps[i];
      if (baseOp.p_isnad) {
        for (var j = 0; j < ops.length; j++) {
          var op = ops[j];
          conflict = this._checkPresIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      } else if (baseOp.p_isnasw) {
        return this.checkPresSlideMove(baseOps, ops);
      }
    }
    return conflict;
  },

  /**
   * The function was only used for presentation move slide.
   * @param baseOps
   * @param ops
   * @param isFromUndo
   * @returns
   */
  transMoveSlideMoveSlide: function(baseOps, ops, isFromUndo)
  {
	// Get deleted slides
	var actType = MSGUTIL.actType;
	var baseSlides = {};
	for (var i = 0; i < baseOps.length; i++)
	{
	  var baseOp = baseOps[i];
	  if(baseOp.t == actType.deleteElement && baseOp.p_nid != null)
		  baseSlides[baseOp.p_nid] = 1;
	}
	// Check if deleted slides action has same slide id
	for(var i = 0; i < ops.length; i++)
	{
		var op = baseOps[i];
		if(op.t == actType.deleteElement && op.p_nid != null && baseSlides[op.p_nid])
			return true;
	}      
	  
	 return this.transElementElement(baseOps, ops, isFromUndo);
  },
  
  transTaskElement : function( baseOps, ops) 
  {
	  var isReject = false;
	  var actType = MSGUTIL.actType;
	  for (var i = 0; i< baseOps.length; i++)
	    {
	      var baseOp = baseOps[i];
	      if ( baseOp.t == actType.insertTask)
	      {
		      for (var j=0; j< ops.length; j++)
		      {
		        var op = ops[j];
		      
				if (op.t == actType.insertElement)
				{
					isReject = this._transInsertTaskInsertElement( baseOp, op);
					if ( isReject)
						return isReject;
				}  
				if (op.t == actType.deleteElement)
				{
					isReject = this._transInsertTaskDeleteElement( baseOp, op);
					if ( isReject )
						return isReject;
				}
			    
		      }     
	      }
		  if ( baseOp.t == actType.deleteTask)
	      {
		      for (var j=0; j< ops.length; j++)
		      {
		        var op = ops[j];
		      
				if (op.t == actType.insertElement)
				{
					isReject = this._transDeleteTaskInsertElement( baseOp, op);
					if ( isReject)
						return isReject;
				}  
				if (op.t == actType.deleteElement)
				{
					isReject = this._transDeleteTaskDeleteElement( baseOp, op);
					if ( isReject )
						return isReject;
				}
			    
		      }     
	      }
	    }
	  return isReject;
  },
  transElementTask :function(baseOps, ops) 
  {
	var isReject = false;
	var actType = MSGUTIL.actType;
	for (var i = 0; i < baseOps.length; i++) {
		var baseOp = baseOps[i];
		for (var j = 0; j < ops.length; j++) {
			var op = ops[j];
			if (op.t == actType.insertTask) {	
				if (baseOp.t == actType.insertElement) {
					isReject = this._transInsertElementInsertTask( baseOp,op);
					if (isReject)
						return isReject;
				}
				if (baseOp.t == actType.deleteElement) {
					isReject = this._transDeleteElementInsertTask(baseOp,op);
					if (isReject)
						return isReject;
				}
			}
			if ( op.t == actType.deleteTask ) {
				if (baseOp.t == actType.insertElement) {
					isReject = this._transInsertElementDeleteTask( baseOp,op);
					if (isReject)
						return isReject;
				}
				if (baseOp.t == actType.deleteElement) {
					isReject = this._transDeleteElementDeleteTask(baseOp,op);
					if (isReject)
						return isReject;
				}
			}
		}
	}
	return isReject;
  },
  transTaskTask : function (baseOps,  ops) 
  {
	var isReject = false;
	var actType = MSGUTIL.actType;
	for (var i = 0; i < baseOps.length; i++) {
		var baseOp = baseOps[i];
		for (var j = 0; j < ops.length; j++) {
			var op = ops[j];
			if (op.t == actType.insertTask ) {
				if (baseOp.t == actType.insertTask) {
					isReject = this._transInsertTaskInsertTask( baseOp,op);
					if (isReject)
						return isReject;
				}
				if (baseOp.t == actType.deleteTask ) {
					this._transDeleteTaskInsertTask( baseOp, op);
				}
			}
			if ( op.t == actType.deleteTask ) {
				if (baseOp.t == actType.insertTask ) {
					this._transInsertTaskDeleteTask(  baseOp, op);
				}
				if (baseOp.t == actType.deleteTask) {
					this._transDeleteTaskDeleteTask( baseOp, op);
				}
			}
		}
	}
	return isReject;
  },
  transTextStyle : function(baseOps, ops)
  {
	var actType = MSGUTIL.actType;
	for (var i = 0; i< baseOps.length; i++)
    {
      var baseOp = baseOps[i];
      
      
      for (var j=0; j< ops.length; j++)
      {
        var op = ops[j];
        if (baseOp.t == actType.insertText)
        {
          var newOp = this._transInsertStyle(baseOp,op);
          if (newOp != null)
            ops.push(newOp);//add new operation created on OT
        }
        else if (baseOp.t == actType.deleteText)
        {
          this._transDeleteStyle(baseOp,op);
        }
      }     
    }    
    return false;
  },
  
  transStyleStyle : function(baseOps,ops)
  {
    for (var i = 0; i< baseOps.length; i++)
    {
      var baseOp = baseOps[i];     
      
      for (var j=0; j< ops.length; j++)
      {
        var op = ops[j];
        var rejected = this._transStyleStyle(baseOp,op);
        if (rejected)
          return rejected;
      }     
    }
    return false;
  },
  
  _checkPresAttrWithIEDEConflict: function(bsOp, op) {
    if (!bsOp || !op) {
        return false;
    }
    // op can be ie or de
    if (op.p_isnasw) {
      // if bsOp for slide, compare two slide id
      // if bsOp for object, also compare slide id
      var bsOpSlideId = bsOp.p_sid;
      var opSlideId = op.p_sid;
      if (bsOpSlideId && opSlideId && 
        bsOpSlideId == opSlideId)
        return true;
    } else if (op.p_isnad) {
      // if bsOp for slide, slide id will be null, no conflict
      // if bsOp for object, also compare content box id
      var bsOpContentBoxId = bsOp.p_cid;
      // For element message, cannot get content box id by getPresContentBoxId
      // because it is only for messages inner content box
      var opContentBoxId = op.p_nid;
      if (bsOpContentBoxId && opContentBoxId &&
        bsOpContentBoxId == opContentBoxId)
        return true;
    } else if (op.p_tt) {
      var bsOpContentBoxId = bsOp.p_cid;
      var opContentBoxId = op.p_cid;
      if (bsOpContentBoxId && opContentBoxId &&
        bsOpContentBoxId == opContentBoxId)
        return true;
    }
    
    return false;
  },
  checkPresRNandA : function(baseOps, ops) {
	  var conflict = false; 
      if (!baseOps || !ops) {
        return false;
      }
	  conflict = this.checkPresAttrElement(baseOps, ops) || this.checkPresAttrElement(ops, baseOps);
	  return conflict;
  },
  
  checkPresAttrElement : function(baseOps, ops) {
    var actType = MSGUTIL.actType;
    var conflict = false;
    if (!baseOps || !ops) {
      return false;
    }
    for (var i = 0; i< baseOps.length; i++) {
      var baseOp = baseOps[i];
      for (var j = 0; j< ops.length; j++) {
        var op = ops[j];
        if (baseOp.t == actType.setAttributes && op.t == actType.deleteElement) {
          conflict = this._checkPresAttrWithIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  },
  
  checkPresAttrReplace : function(baseOps, ops) {
    var actType = MSGUTIL.actType;
    var conflict = false;
    if (!baseOps || !ops) {
      return false;
    }
    for (var i = 0; i< baseOps.length; i++) {
      var baseOp = baseOps[i];
      for (var j = 0; j< ops.length; j++) {
        var op = ops[j];
        if (baseOp.t == actType.setAttributes) {
          conflict = this._checkPresAttrWithIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  },
  
  transAttrAttr : function(baseOps, ops)
  {
    for (var i = 0; i< baseOps.length; i++)
    {
      var baseOp = baseOps[i];     
      
      for (var j=0; j< ops.length; j++)
      {
        var op = ops[j];
        var rejected = this._transAttrAttr(baseOp,op);
        if (rejected)
          return rejected;
      }     
    }    
    return false;
  },
  
  transPresAttrAttr : function(baseOps, ops)
  {
    if (!baseOps || !ops) {
      return false;
    }
    for (var i = 0; i< baseOps.length; i++)
    {
      var baseOp = baseOps[i];     
      
      for (var j=0; j< ops.length; j++)
      {
        var op = ops[j];
        var rejected = this._transAttrAttr(baseOp, op, true);
        if (rejected)
          return rejected;
      }     
    }    
    return false;
  },
  
  getMaxMinIndex : function(ops) {
    var min = 0, max = 0;
    if (ops.length == 0)
      return null;
    for (var i = 0; i < ops.length; i++) {
      var index = ops[i].idx;
      if ( i == 0) {
        min = index;
        max = index;
      } else {
        if (index < min)
          min = index;
        if (index > max)
          max = index;
      }
    }
    return {
      'min': min,
      'max': max
    };
  },
  
  checkPresSlideMove : function(baseOps, ops) {
    if (!baseOps || !ops) {
      return false;
    }
    var baseOpsMinMaxIndexes = this.getMaxMinIndex(baseOps);
    var opsMinMaxIndexes = this.getMaxMinIndex(ops);
    if (baseOpsMinMaxIndexes == null || opsMinMaxIndexes == null)
      return false;
    // intersection will cause conflict
    if (!(baseOpsMinMaxIndexes.max < opsMinMaxIndexes.min ||
      baseOpsMinMaxIndexes.min > opsMinMaxIndexes.max)) {
      return true;
    }

    return false;
  },

  transElementReplace:function(baseOps,ops,isFromUndo){
	var delta = 0;
	var delCnt = 0;
	var delIndex = -1;
	var tid = null;
	var actType = MSGUTIL.actType;
    for (var i=0;i< ops.length;i++)
    {
      /*
       * only check the delete element and insert element operation for the replace transformation.
       */
      var op = ops[i];
      if (op.t ==actType.deleteElement )
      {
        var dellen = op.len;
        var delIdx = op.idx;
        if(delIndex==-1){
        	delIndex = delIdx;
        }
        if (delIdx < delIndex)
        {
          delIndex = delIdx;
        }
        delCnt += dellen;
        delta = delta - dellen;
      }else if (op.t == actType.insertElement)
      {
        delta = delta + 1;
      }else{
    	  continue;
      }
      if (tid == null)
      {
        tid = op.tid;
      }
      else if (op.tid!=tid)
      {
        return true;
      }
    }
    for (var i = 0; i < baseOps.length; i++)
    {
      var baseOp = baseOps[i];
      if (baseOp.tid != tid)
      {
        continue;
      }
      if (baseOp.t == actType.insertElement)
      {
       
        if (baseOp.idx > delIndex && baseOp.idx < delCnt + delIndex)
        {
          return true;
        }
        var ret = this._transInsertElementReplace(baseOp, ops, delta, delIndex);       
        delIndex += ret;
      }
      else if (baseOp.t == actType.deleteElement )
      {
        
        if (baseOp.idx+ baseOp.len <= delIndex || baseOp.idx >= delCnt + delIndex)
        {
          var r = this._transDeleteElementReplace(baseOp, ops, delta, delIndex);
          delIndex = delIndex - r;
        }
        else
        {
          return true;
        }

      }
    }
    return false;
  },
  transReplaceReplace:function(baseOps,ops,isFromUndo){
	  var len =0;
	  var idx=0;
	  var actType = MSGUTIL.actType;
	  var tid = null;
	  for (var i=0;i< baseOps.length;i++){
		  if(baseOps[i].t != actType.deleteElement && baseOps[i].t!= actType.insertElement){
			  continue;
		  }
		  if (tid==null){
			  tid = baseOps[i].tid;
		  }
		  else if (tid!= baseOps[i].tid) {
			  return true;
		  }
		  
		  if(baseOps[i].t== actType.insertElement){
			  len = len+ 1;
		  }
		  if (baseOps[i].t == actType.deleteElement){
			  len = len - baseOps[i].len;
			  if (baseOps[i].idx>idx){
				  idx= baseOps[i].idx;
			  }
		  }
	  }
	  if (len ==0){
		  return false;
	  }
	  for (var i=0;i< ops.length;i++){
		  if(ops[i].t != actType.deleteElement && ops[i].t!= actType.insertElement){
			  continue;
		  }
		  if (ops[i].tid!=tid){
			  return false;
		  }
	  }
	  for (var i=0;i< ops.length;i++){
		  if(ops[i].t== actType.insertElement||ops[i].t== actType.deleteElement){
			  if(ops[i].idx > idx)
				  ops[i].idx=ops[i].idx+len;
		  }
	  }
	  return false;
  },
  checkTextSplitConflict : function(baseOps,ops,textBase,isFromUndo)
  {
	  var actType = MSGUTIL.actType;
	  var baseOp,op,i,j,newOp,rejected;
	  var ieOp = null,tempOp = null;
	  var targetOps = textBase?ops:baseOps;
	  for(i = targetOps.length-1; i >= 0; i--)
	  {
	     if(targetOps[i].t == actType.insertElement)
	     {
	       ieOp = targetOps[i];
	       break;
	     }
	  }
	  //get the operation created by OT
	  if(isFromUndo)
	  {
		  for(i = 0; i < ops.length; i++)
		  {
			  if(ops[i].isOTAdded)
			  {
				  tempOp = ops[i];
				  break;
			  }
		  }
	  }
	  if(textBase)
	  {
		var opsLength = ops.length;
		for (i = 0; i< baseOps.length; i++)
	    {
	      baseOp = baseOps[i];
	      for (j=0; j< opsLength; j++)
	      {
	        op = ops[j];
	        if(baseOp.tid != op.tid || (isFromUndo && (baseOp.isOTAdded || op.isOTAdded)))
	            continue;
	        if (op.t == actType.deleteText)
	        {
	        	//if the index of insert or delete text operation is larger than that of split operation,
	            //we move the new added text or deleted text to/from the string of split operation.
	        	if (baseOp.t == actType.insertText)
		        {
	        		newOp = this._transInsertSplitText(baseOp,op,ieOp,tempOp,isFromUndo);
	        		if (newOp != null)
	        		{
	        			newOp.isOTAdded = true;
	        			ops.push(newOp);//add new operation created on OT
	        			if(!isFromUndo)
	        				baseOps[i]= dojo.clone(newOp);
	        		}
		        }
	        	else if (baseOp.t == actType.deleteText)
		        {
	        		var baseIdx = baseOp.idx;
	        		var baseLen = baseOp.len;
	                
	        		var idx = op.idx;
	        		var len = op.len;
	                
	        		if (baseIdx < idx && idx < baseIdx + baseLen)
	                {
	                  return true;
	                } 
	        		newOp = this._transDeleteSplitText(baseOp,op,ieOp,tempOp);
	        		if (newOp != null)
	        		{
	        			newOp.isOTAdded = true;
	        			ops.push(newOp);//add new operation created on OT
	        			if(!isFromUndo)
							baseOps[i]= dojo.clone(newOp);
	        		}
		        }
	        }
	      }     
	    }
	  }
	  else
	  {
		  var baseOpsLength = baseOps.length;
		  for (i = 0; i< baseOpsLength; i++)
		  {
		      baseOp = baseOps[i];
		      for (j=0; j< ops.length; j++)
		      {
		        op = ops[j];
		        if(baseOp.tid != op.tid || (isFromUndo && (baseOp.isOTAdded || op.isOTAdded)))
		            continue;
		        if (baseOp.t == actType.deleteText)
		        {
		          if (op.t == actType.insertText)
		          {
		        	  newOp = this._transSplitInsertText(baseOp,ieOp,op);
		        	  if (!isFromUndo && newOp != null) {
					  	newOp.isOTAdded = true;
						baseOps.push(newOp);
					  }
		          }
		          else if (op.t == actType.deleteText)
		          {
		        	  rejected = this._transSplitDeleteText(baseOp,ieOp,op, isFromUndo);
		        	 if (rejected)
		                  return rejected;
		          }          
		        }
		      }     
		  }
	  }
	  return false;
  },
  
  checkElementSplitConflict : function(baseOps, ops,elementBase,isFromUndo)
  {
	if(this.checkSplitJoinTargetConflict(baseOps,ops))
	      return true;
	var actType = MSGUTIL.actType;
	var baseOp,op,i,j,newOp;
	if(elementBase) //base message is element
    {
      for (i = 0; i< baseOps.length; i++)
      {
        baseOp = baseOps[i];
        for (j=0; j< ops.length; j++)
        {
          op = ops[j];
          if(baseOp.tid != op.tid )
	            continue;

          if (op.t == actType.insertElement)
          { 
            if (baseOp.t == actType.insertElement)
            {
            	this._transInsertSplitElement(baseOp,op);
            }
            else if (baseOp.t == actType.deleteElement)
            {
            	this._transDeleteInsertElement(baseOp,op);
            }
          }
        }     
      }
    }
    else
    {
      var tempOp = null;
      //get the operation created by OT
	  if(isFromUndo)
	  {
		  for(i = 0; i < ops.length; i++)
		  {
			  if(ops[i].isOTAdded)
			  {
				  tempOp = ops[i];
				  break;
			  }
		  }
	  }
      for (i = 0; i< baseOps.length; i++)
      {
        baseOp = baseOps[i];
        for (j=0; j< ops.length; j++)
        {
          op = ops[j];
          if(baseOp.tid != op.tid || (isFromUndo && (baseOp.isOTAdded || op.isOTAdded)))
	            continue;
          if (baseOp.t == actType.insertElement)
          {
            if (op.t == actType.insertElement)
            {
            	//here baseOp is split,we call it instead of _transInsertInsertElement to avoid changing index in the following case:
            	//initial:<p>123456</p>
            	//user A insert a page break between 3 and 4 to split the paragraph
            	//then user B delete the break
            	//then user A undo/redo, user B undo/redo
            	//when user B redo, the index of operation have changed wrong if we call _transInsertInsertElement.
            	if(isFromUndo)
            		this._transInsertSplitElement(baseOp,op);
            	else
            		this._transSplitInsertElement(baseOp,op);
            }
            else if (op.t == actType.deleteElement)
            {
            	newOp = this._transInsertDeleteElement(baseOp,op,tempOp);
                if (newOp != null)
                {
                	newOp.isOTAdded = true;
                	ops.push(newOp);//add new operation created on OT
                }
            }          
          }
        }     
      }
    }
    return false;
  },
  
  checkElementJoinConflict : function(baseOps, ops,elementBase,isFromUndo)
  {
	  if(this.checkSplitJoinTargetConflict(baseOps,ops))
	      return true;
	  	var actType = MSGUTIL.actType;
		var baseOp,op,i,j,newOp;
		if(elementBase) //base message is element
	    {
			var tempOp = null;
		    //get the operation created by OT
			if(isFromUndo)
			{
				for(i = 0; i < ops.length; i++)
				{
					if(ops[i].isOTAdded)
					{
						tempOp = ops[i];
						break;
					}
				}
		    }
		  for (i = 0; i< baseOps.length; i++)
	      {
	        baseOp = baseOps[i];
	        for (j=0; j< ops.length; j++)
	        {
	          op = ops[j];
	          if(baseOp.tid != op.tid || (isFromUndo && (baseOp.isOTAdded || op.isOTAdded)))
		            continue;

	          if (op.t == actType.deleteElement)
	          { 
	            if (baseOp.t == actType.insertElement)
	            {
	            	newOp = this._transInsertDeleteElement(baseOp,op,tempOp);
	                if (newOp != null)
	                {
	                	newOp.isOTAdded = true;
	                	ops.push(newOp);//add new operation created on OT
	                }
	            }
	            else if (baseOp.t == actType.deleteElement)
	            {
	            	this._transDeleteDeleteElement(baseOp,op);
	            }
	          }
	        }     
	      }
	    }
	    else
	    {
	      for (i = 0; i< baseOps.length; i++)
	      {
	        baseOp = baseOps[i];
	        for (j=0; j< ops.length; j++)
	        {
	          op = ops[j];
	          if(baseOp.tid != op.tid )
		            continue;
	          if (baseOp.t == actType.deleteElement)
	          {
	            if (op.t == actType.insertElement)
	            {
	            	this._transDeleteInsertElement(baseOp,op);
	            }
	            else if (op.t == actType.deleteElement)
	            {
	            	this._transDeleteDeleteElement(baseOp,op);
	            }          
	          }
	        }     
	      }
	    }
	    return false;
	  },
  
  checkTextJoinConflict : function(baseOps,ops,textBase,isFromUndo)
  {
	  var actType = MSGUTIL.actType;
	  var baseOp,op,i,j,newOp,rejected;
	  if(textBase)
	  {
		var opsLength = ops.length;
		for (i = 0; i< baseOps.length; i++)
	    {
	      baseOp = baseOps[i];
	      for (j=0; j< opsLength; j++)
	      {
	        op = ops[j];
	        if(isFromUndo && (baseOp.isOTAdded || op.isOTAdded||op.isAppend))
	            continue;
			if( op.isOTAdded||op.isAppend){
					continue;
			}	
	        if (op.t == actType.insertText)
	        {
	        	if (baseOp.t == actType.insertText)
		        {
	        		newOp = this._transInsertJoinText(baseOp,op,baseOp.tid == op.tid);
	        		if (newOp != null)
	        		{
	        			newOp.isOTAdded = true;
	        		   	ops.push(newOp);//add new operation created on OT
	        		   	if(!isFromUndo)
	        				baseOps[i]= dojo.clone(newOp);
	        		}
		        }
	        	else if (baseOp.t == actType.deleteText)
		        {
	        		newOp = this._transDeleteJoinText(baseOp,op,baseOp.tid == op.tid);
	        		if(newOp != null)
	        		{
	        			newOp.isOTAdded = true;
	        			ops.push(newOp);
						if(!isFromUndo)
	        				baseOps[i]= dojo.clone(newOp);
	        		}
		        }     
		    }
	      }     
	    }
	  }
	  else
	  {
		  var baseOpsLength = baseOps.length;
		  for (i = 0; i< baseOpsLength; i++)
		  {
		      baseOp = baseOps[i];
		      for (j=0; j< ops.length; j++)
		      {
		        op = ops[j];
		        if(isFromUndo && (baseOp.isOTAdded || op.isOTAdded||op.isAppend))
		            continue;
				if( op.isOTAdded||op.isAppend){
					continue;
				}	
		        if (baseOp.t == actType.insertText)
		        {
		          if (op.t == actType.insertText)
		          {
		        	  rejected = this._transJoinInsertText(baseOp,op,baseOp.tid == op.tid);
		        	  if(rejected)
		        		  return true;
		          }
		          else if (op.t == actType.deleteText)
		          {
		        	  rejected = this._transJoinDeleteText(baseOp,op,baseOp.tid == op.tid);
		        	  if(rejected)
		        		  return true;
		          }          
		        }	
		      }     
		  }
	  }
	  return false;
  },
  
  checkStyleSplitConflict : function(baseOps,ops,styleBase,isFromUndo)
  {
	var actType = MSGUTIL.actType;
	var opsSize = ops.length;
	var baseOp,op,i,j,baseIdx,baseLen,idx,len,newOp,element;
	var ieOp = null,tempOp = null;
	var targetOps = styleBase?ops:baseOps;
	for(i = targetOps.length-1; i >= 0; i--)
	{
	   if(targetOps[i].t == actType.insertElement)
	   {
	     ieOp = targetOps[i];
	     break;
	   }
	}
	//get the operation created by OT
	if(isFromUndo)
	{
		for(i = 0; i < ops.length; i++)
		{
			if(ops[i].isOTAdded)
			{
				tempOp = ops[i];
				break;
			}
		}
	}
	for (i = 0; i< baseOps.length; i++)
	{
	   baseOp = baseOps[i];
	   for (j=0; j< opsSize; j++)
	   {
	      op = ops[j];
	      if(baseOp.tid != op.tid || isFromUndo && (baseOp.isOTAdded || op.isOTAdded))
		      continue;
	      if (baseOp.t == actType.deleteText)
	      {
	        if (op.t == actType.setStyle || op.t == actType.removeStyle)
	        {
	          baseIdx = baseOp.idx;
	          idx = op.i;
	          len = op.l;
	          if(idx+len <= baseIdx)
	        	  return false;
	          //idx+len > baseIdx
	          element = CKEDITOR.dom.element.createFromHtml(ieOp.s);
	          if(idx > baseIdx)
	          {
	        	  op.tid = element.getAttribute('id');
	        	  op.i = idx-baseIdx;
	          }
	          else //idx <= baseIdx
	          {
	              //if the new created Operation has existed,continue the loop
	        	  if(tempOp && tempOp.tid == element.getAttribute('id') && tempOp.i == 0 && tempOp.l == idx+len-baseIdx)
	            	continue;
	              op.l = baseIdx - idx;
	        	  newOp = {};
	              newOp.tid = element.getAttribute('id');
	              newOp.t = op.t;
	              newOp.i = 0;
	              newOp.l = idx+len-baseIdx;
	              op.e && (newOp.e = op.e);
	              op.s && (newOp.s = op.s);
	              op.a && (newOp.a = op.a);
	              newOp.isOTAdded = true;
	              ops.push(newOp);
	          }
	        }  
	     }
	     else if(baseOp.t == actType.setStyle || baseOp.t == actType.removeStyle)
	     {
	    	 if(op.t == actType.deleteText)
	    	 {
	    		 baseIdx = baseOp.i;
	    		 baseLen = baseOp.l;
	    		 idx = op.idx;
	    		 if(baseIdx+baseLen <= idx)
	    			 return false;
	    		 // baseIdx+baseLen > idx
	    		 //if the new created Operation has existed,continue the loop
	    		 if(tempOp)
	             {
	            	  if(baseIdx > idx && tempOp.tid == element.getAttribute('id') && tempOp.i == baseIdx-idx && tempOp.l == baseLen)
	            		  continue;
	            	  else if(baseIdx <= idx && tempOp.tid == element.getAttribute('id') && tempOp.i == 0 && tempOp.l == baseIdx+baseLen-idx)
	            		  continue;
	             }
	    		 newOp = {};
    			 element = CKEDITOR.dom.element.createFromHtml(ieOp.s);
	             newOp.tid = element.getAttribute('id');
	             newOp.t = baseOp.t;
	             baseOp.e && (newOp.e = baseOp.e);
	             baseOp.s && (newOp.s = baseOp.s);
	             baseOp.a && (newOp.a = baseOp.a);
	    		 if(baseIdx > idx)
	    		 {
	    			 newOp.i = baseIdx-idx;
	                 newOp.l = baseLen;
	    		 }
	    		 else
	    		 {
	    			 newOp.i = 0;
		             newOp.l = baseIdx+baseLen-idx;
	    		 }
	    		 newOp.isOTAdded = true;
	    		 ops.push(newOp);
	    	 }
	     } 
	  }  
	}
	return false;
  },
  
  checkStyleJoinConflict : function(baseOps,ops,styleBase,isFromUndo)
  {
	  var actType = MSGUTIL.actType;
      var opsSize = ops.length;
      var baseOp,op,i,j,newOp,baseIdx,baseLen,idx,len;
      var tempOp = null;
      //get the operation created by OT
  	  if(isFromUndo)
  	  {
  		  for(i = 0; i < ops.length; i++)
  		  {
  			if(ops[i].isOTAdded)
  			{
  				tempOp = ops[i];
  				break;
  			}
  		  }
  	  }
      for (i = 0; i< baseOps.length; i++)
	  {
		baseOp = baseOps[i];
		for (j=0; j< opsSize; j++)
		{
			op = ops[j];
			if(baseOp.tid == op.tid || isFromUndo && (baseOp.isOTAdded || op.isOTAdded))
			      continue;
			if (baseOp.t == actType.insertText || isFromUndo && (baseOp.isOTAdded || op.isOTAdded))
			{
				if (op.t == actType.setStyle || op.t == actType.removeStyle)
				{
					baseIdx = baseOp.idx;
					idx = op.i;
					op.tid = baseOp.tid;
					op.i = idx+baseIdx;
				}  
			}
			else if(baseOp.t == actType.setStyle || baseOp.t == actType.removeStyle)
			{
				if(op.t == actType.insertText)
				{
					baseIdx = baseOp.i;
					baseLen = baseOp.l;
					idx = op.idx;
					//if the new created Operation has existed,continue the loop
		            if(tempOp && tempOp.tid == op.tid && tempOp.i == idx+baseIdx && tempOp.l == baseLen)
		            	continue;
					newOp = {};
					newOp.tid = op.tid;
					newOp.t = baseOp.t;
					newOp.l = baseLen;
					newOp.i = idx+baseIdx;
					baseOp.s && (newOp.s = baseOp.s);
					baseOp.e && (newOp.e = baseOp.e);
					baseOp.a && (newOp.a = baseOp.a);
					newOp.isOTAdded = true;
					ops.push(newOp);
				}
			}
		}     
	}
    return false;
  },
  
  checkSplitSplitConflict : function(baseOps,ops,isFromUndo)
  {
	if(!isFromUndo)
	{
		if(this.checkSplitJoinTargetConflict(baseOps,ops))
			return true;
	}
    
    var actType = MSGUTIL.actType;
    for (var i = 0; i< baseOps.length; i++)
    {
       var baseOp = baseOps[i];
       for (var j=0; j< ops.length; j++)
       {
         var op = ops[j];
         if(baseOp.tid != op.tid)
           continue;
          if (baseOp.t == actType.insertElement)
          {
            if (op.t == actType.insertElement)
            {
            	this._transInsertSplitElement(baseOp,op);
            }  
          }
        }     
    }
    return false;
  },
  
  checkSplitJoinConflict : function(baseOps,ops,splitBase,isFromUndo)
  {
	if(!isFromUndo)
	{
	  if(this.checkSplitJoinTargetConflict(baseOps,ops))
		  return true;
	}
    var tempOp = null;
    //get the operation created by OT
	if(isFromUndo)
	{
		for(var i = 0; i < ops.length; i++)
		{
			if(ops[i].isOTAdded)
			{
				tempOp = ops[i];
				break;
			}
		}
	}
    var actType = MSGUTIL.actType;
    for (i = 0; i< baseOps.length; i++)
    {
       var baseOp = baseOps[i];
       for (var j=0; j< ops.length; j++)
       {
         var op = ops[j];
         if(baseOp.tid != op.tid || isFromUndo && (baseOp.isOTAdded || op.isOTAdded))
           continue;
         if(splitBase)
         {
            var ieOp = null;
       	    for(var x = baseOps.length-1; x >= 0; x--)
       	    {
       	     if(baseOps[x].t == actType.insertElement)
       	     {
       	       ieOp = baseOps[x];
       	       break;
       	     }
       	   }
           if (baseOp.t == actType.insertElement)
           {
             if(op.t == actType.deleteElement)
             {
               var newOp = this._transInsertDeleteElement(baseOp,op,tempOp);
               if (newOp != null)
               {
            	   newOp.isOTAdded = true;
            	   ops.push(newOp);//add new operation created on OT
               }
             }
           }
           else if(baseOp.t == actType.deleteText)
           {
        	   if(op.t == actType.insertText)
        	   {
        		   this._transSplitInsertText(baseOp, ieOp, op);
        	   }
           }
         }
         else
         {
           if (baseOp.t == actType.deleteElement)
           {
             if(op.t == actType.insertElement)
             {
               this._transDeleteInsertElement(baseOp,op);
             }
           }
           else if(baseOp.t == actType.insertText)
           {
        	 if(op.t == actType.deleteText)
        	 {
        		 this._transJoinDeleteText(baseOp, op, baseOp.tid == op.tid);
        	 }
           }
         }
       }     
    }
    
    return false;
  },
  
  checkJoinJoinConflict : function(baseOps, ops,isFromUndo)
  {
    //check whether is conflict or not when doing OT
	if(!isFromUndo)
    {
    	if(this.checkSplitJoinTargetConflict(baseOps,ops))
    		return true;
    }
	var tempOp = null;
    //get the operation created by OT
	if(isFromUndo)
	{
		for(var i = 0; i < ops.length; i++)
		{
			if(ops[i].isOTAdded)
			{
				tempOp = ops[i];
				break;
			}
		}
	}
    
    var actType = MSGUTIL.actType;
    var newOp,baseOp,op;
    var opsLength = ops.length;
    for (i = 0; i< baseOps.length; i++)
    {
       baseOp = baseOps[i];
       for (var j=0; j< opsLength; j++)
       {
         op = ops[j];
         //we do not do OT again with the new added operation via OT
         if(isFromUndo && (baseOp.isOTAdded || op.isOTAdded))
	           continue;
         //the initial:
         //<p>123456</p>
         //<p>7</p>
         //user A do split 123/456 and the result will be:
         //<p>123</p>
         //<p>456</p>
         //<p>7</p>
         //user B do join via pressing delete key at the end of the second para, we will do OT between operation of B
         //and undo operation of A
         if(isFromUndo && baseOp.t == actType.insertText && op.t == actType.insertText)
         {
        	 //get the delete element action from Join message
        	 var deOp;
        	 for(var n = 0; n < opsLength; n++)
        	 {
        		 if(ops[n].t == actType.deleteElement)
        		 {
        			 deOp = ops[n];
        			 break;
        		 }
        	 }
        	 //only the target of one join's it action in the elist of the other Join,then execute the following code
        	 if(deOp && this._checkKeyOnList(baseOp.tid,deOp.elist))
        	 {
        		 newOp = this._transInsertJoinText(baseOp,op,baseOp.tid == op.tid,tempOp);
        		 if (newOp != null)
        		 {
        			 newOp.isOTAdded = true;
        			 ops.push(newOp);//add new operation created on OT
        		 }
        	 }
         }
         else if(baseOp.t == actType.deleteElement && op.t == actType.deleteElement && baseOp.tid == op.tid)
         {
        	 this._transDeleteDeleteElement(baseOp,op);
         }
       }     
    }
    return false;
  },
  
  checkPresReplaceReplace : function(baseOps, ops) {
    if (!baseOps || !ops) {
      return false;
    }
    var conflict = false;
    for (var i = 0; i< baseOps.length; i++) {
      var baseOp = baseOps[i];
      for (var j = 0; j< ops.length; j++) {
        var op = ops[j];
        conflict = this._checkPresIEDEConflict(baseOp, op);
        if (conflict) return conflict;
      }
    }
    return conflict;
  },
  
  checkPresReplaceElement : function(baseOps, ops) {
    if (!baseOps || !ops) {
      return false;
    }
    var actType = MSGUTIL.actType;
    var conflict = false;
    for (var i = 0; i< baseOps.length; i++) {
      var baseOp = baseOps[i];
      for (var j = 0; j< ops.length; j++) {
        var op = ops[j];
        if (op.t == actType.deleteElement) {
          conflict = this._checkPresIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  },

  
  checkReplaceConflict : function(baseOps, ops)
  {
	var actType = MSGUTIL.actType;
	baseIdx=-1;
	baseLen=0;
	opIdx=-1;
	opLen=0;
	for (var i = 0; i< baseOps.length; i++)
    {
		if( baseOps[i].t ==MSGUTIL.actType.deleteElement){
			if(baseIdx==-1){
				baseIdx = baseOps[i].idx;
			}else if ( baseIdx > baseOps[i].idx){
				baseIdx = baseOps[i].idx;
			}
			baseLen = baseLen+ baseOps[i].len;
		}
		
    }
	for (var i =0;i< ops.length;i++){
		if(ops[i].t==MSGUTIL.actType.deleteElement){
			if (opIdx==-1){
				opIdx = ops[i].idx;
			}else if( opIdx > ops[i].idx ){
				opIdx = ops[i].idx;
			}
			opLen = opLen+ ops[i].len;
		}
		
	}
	if (baseIdx == opIdx){
		return true;
	}
	if(baseIdx > opIdx && baseIdx < opIdx + opLen  ){
		return true;
	}
	if ( opIdx > baseIdx && opIdx < baseIdx + baseLen ){
		return true;
	}
    return false;
  },
  
  checkTableConflict : function(baseOps, ops, tableBase)
  {
	  var isReplace = false;
	  var targetOps = null;
	  if(tableBase)
	    targetOps = baseOps;
	  else
	    targetOps = ops;
	  for(var i=0;i<targetOps.length-1;i++)
	  {
	     if(targetOps[i].t == MSGUTIL.actType.deleteElement &&  targetOps[i+1].t == MSGUTIL.actType.insertElement)
	     {
	        isReplace = true;
	        break;
	     } 
	  }
	  if(isReplace)
	    return this.checkTargetConflict(baseOps, ops, tableBase);
	    
	  return false;
  },
  
  isTheSameSplitJoinMsg : function(baseOps,ops)
  {
	  if(baseOps.length != ops.length)
		  return false;
	  for(var x=0;x<baseOps.length;x++)
	  {
	    var isIncluded = false;
	    for(var y=0;y<ops.length;y++)
	    {
	    	if(baseOps[x].tid == ops[y].tid && baseOps[x].idx == ops[y].idx)
	        {
	    		isIncluded = true;
	        	break;
	        }
	    }
	    if(!isIncluded)
	    	return false;
	  }
	  
	  return true;
  },
  checkSplitJoinTargetConflict : function(baseOps, ops)
  {
	for (var i = 0; i< baseOps.length; i++)
    {
       var baseOp = baseOps[i];
       for (var j=0; j< ops.length; j++)
       {
         var op = ops[j];
         if (baseOp.t == MSGUTIL.actType.deleteText)
         {
           if((op.t == MSGUTIL.actType.deleteText || op.t == MSGUTIL.actType.insertText) && baseOp.tid == op.tid)
               return true;
           else if(op.t == MSGUTIL.actType.deleteElement)
           {
        	   var inList = this._checkKeyOnList(baseOp.tid,op.elist);
        	   if (inList)
        		   return true;
           }
         }         
         else if (baseOp.t == MSGUTIL.actType.insertText)
         {
             if((op.t == MSGUTIL.actType.insertText || op.t == MSGUTIL.actType.deleteText) && baseOp.tid == op.tid)
               return true;
             else if(op.t == MSGUTIL.actType.deleteElement)
             {
            	inList = this._checkKeyOnList(baseOp.tid,op.elist);
                if (inList)
                  return true;
             }
         }
         else if(baseOp.t == MSGUTIL.actType.deleteElement && (op.t == MSGUTIL.actType.insertText || op.t == MSGUTIL.actType.deleteText))
         {
        	 inList = this._checkKeyOnList(op.tid,baseOp.elist);
             if (inList)
               return true;
         }
       }     
    }
    return false;
  },

  
  checkTargetConflict : function(baseOps, ops, elementBase)
  {
    if (elementBase)//base message is element
    {
      for (var i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        if (baseOp.t == MSGUTIL.actType.deleteElement)
        {
          for (var j = 0; j < ops.length; j++)
          {
            var op = ops[j];
            var inList = this._checkKeyOnList(op.tid,baseOp.elist);
            if (inList)
              return true;
          }
        }
      }
    }
    else//incoming message is element
    {
      for (i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        for (j = 0; j < ops.length; j++)
        {
          op = ops[j];
          if (op.t == MSGUTIL.actType.deleteElement)
          {
            inList = this._checkKeyOnList(baseOp.tid,op.elist);
            if (inList)
              return true;
          }
        }
      }      
    }
    return false;   
  },

  checkSplitAttrConflict : function(baseOps,ops,elementBase)
  {
    if (elementBase)//base message is element
    {
      for (var i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        if (baseOp.t == MSGUTIL.actType.insertElement)
        {
          for (var j = 0; j < ops.length; j++)
          {
            var op = ops[j];
            var inList = (baseOp.s.indexOf("id="+"\""+op.bid+"\"") > 0);
            if (inList)
              return true;
          }
        }
      }      
    }
    else//incoming message is element
    {
      for (i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        for (j = 0; j < ops.length; j++)
        {
          op = ops[j];
          if (op.t == MSGUTIL.actType.insertElement)
          {
            inList = (op.s.indexOf("id="+"\""+baseOp.bid+"\"") > 0);
            if (inList)
              return true;
          }
        }
      }      
    }
    return false;
  },
  
  checkTargetAttrConflict : function(baseOps, ops, elementBase)
  {
    if (elementBase)//base message is element
    {
      for (var i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        if (baseOp.t == MSGUTIL.actType.deleteElement)
        {
          for (var j = 0; j < ops.length; j++)
          {
            var op = ops[j];
            var inList = this._checkKeyOnList(op.bid,baseOp.elist);
            if (inList)
              return true;
          }
        }
      }      
    }
    else//incoming message is element
    {
      for (i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        for (j = 0; j < ops.length; j++)
        {
          op = ops[j];
          if (op.t == MSGUTIL.actType.deleteElement)
          {
            inList = this._checkKeyOnList(baseOp.bid,op.elist);
            if (inList)
              return true;
          }
        }
      }      
    }
    return false;
  },
  
 checkTextAttrConflict : function(baseOps, ops, textBase)
  {
    if (textBase)//base message is text
    {
      for (var i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        if (baseOp.t == MSGUTIL.actType.deleteText)
        {
          for (var j = 0; j < ops.length; j++)
          {
            var inRange = this._checkKeyOnRange(ops[j],baseOp);
            if (inRange)
              return true;
          }
        } else if ( baseOp.t == MSGUTIL.actType.insertText)
        {
          for (var j = 0; j < ops.length; j++)
          {
          	var op = ops[j];
            if (op.bid == baseOp.tid && baseOp.idx <= op.idx)
		        op.idx = op.idx + baseOp.len;
		   }	
        }
      }        
    }
    else//incoming message is text
    {
      for (i = 0; i < baseOps.length; i++)
      {
        var baseOp = baseOps[i];
        for (j = 0; j < ops.length; j++)
        {
          var op = ops[j];
          if (op.t == MSGUTIL.actType.deleteText)
          {
              inRange = this._checkKeyOnRange(baseOp,op);
              if (inRange)
                return true;
          } else if (op.t == MSGUTIL.actType.insertText )
          {
          	  if ( op.tid == baseOp.bid && op.idx <= baseOp.idx)
					baseOp.idx = baseOp.idx + op.len;          	  		
          	  	
          }
        }
      }       
    }
    return false;
  },
  
  checkListConflict:function(listOps,ops){
	  for(var i=0;i< listOps.length;i++){
		  var listOp = listOps[i];
		  var lid = listOp.lid;
		  if(lid==null||lid==""||lid==undefined){
			  continue;
		  }
		  for(var j=0;j<ops.length;j++){
			  var op =ops[i];
			  if(op.t==MSGUTIL.actType.deleteElement){
				var elist = op.elist;
				for(var k=0;k<elist.length;k++){
					if(elist[k]==lid){
						return true;  
					}					
				}
				
			  }
		  }
	  }
	  return false;
  },
  
  transStyleText : function(baseOps, ops)
  {
    //TODO for case of redo insert text and set style, a simple solution might be
    //append the style msg to undo redo msg list
    //Not support for R1
    return false;
  },
  
  _transInsertInsertText : function(baseOp, op,isFromUndo)
  {     
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
       
    if (idx > baseIdx || (idx == baseIdx && isFromUndo))
    {
      idx += baseLen;
      op.idx = idx;
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += len;
      baseOp.idx = baseIdx;
    }   
  },
  _transInsertDeleteText : function(baseOp, op)
  {
    var newOp = null;
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
       
    if (idx >= baseIdx )
    {
      idx += baseLen;
      op.idx = idx;
    }
    else
    {
      if (idx + len > baseIdx)//split the delete into two operation
      {
        op.len = baseIdx-idx;
        
        newOp = {};		
        newOp.tid = op.tid;
        newOp.t = MSGUTIL.actType.deleteText;
        //newOp.idx = idx;
		newOp.idx = idx+baseLen; 
        newOp.len = len-baseIdx+idx;
        
        baseOp.idx = idx;
      }
      else
      {
        baseIdx -= len;
        baseOp.idx = baseIdx;
      }
    } 
    return newOp;
  },
  
 _transDeleteDeleteText : function(baseOp,op)
  {
  	
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
    if ( idx <= baseIdx )
    {
      if ( idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.len = baseIdx - idx;
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          op.len = len - baseLen;
        }
      }
      else//idx+len<baseIdx
        baseOp.idx = baseIdx - len;    
    }
    else //if ( idx > baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.idx = baseIdx;
          if (idx + len < baseIdx + baseLen)
          {
            op.len = 0;
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.len = idx + len - baseIdx - baseLen;
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.idx = idx - baseLen;
        }
    }
  },

  _transDeleteInsertText : function(baseOp, op)
  {
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
       
    if ( idx > baseIdx )
    {
      if (idx < baseIdx + baseLen)
      {
        op.idx = baseIdx;
		
		var newOp = {};		
        newOp.tid = baseOp.tid;
        newOp.t = MSGUTIL.actType.deleteText;
        //newOp.idx = idx;
		newOp.idx = baseIdx+len; 
        newOp.len = baseLen-idx+baseIdx;
		baseOp.len= idx-baseIdx;
		return newOp;
      }
      else //if (idx > baseIdx + baseLen)
      {
        op.idx = idx - baseLen;
      }
    }
    else
    {
      baseOp.idx = baseIdx+len;
    }
    return null;
  },

  _transInsertInsertElement : function(baseOp, op,isFromUndo)
  {     
    var baseIdx = baseOp.idx;
    
    var idx = op.idx;
       
    if (idx > baseIdx || (idx == baseIdx && isFromUndo))
    {
      idx += 1;
      op.idx = idx;
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += 1;
      baseOp.idx = baseIdx;
    }   
  },
  
  _transPresInsertDeleteSlideElem : function(
    baseOp, op) {
    if (!baseOp || !op) {
        return false;
    }
    var baseIdx = baseOp.idx;
    var idx = op.idx;
       
    if (idx >= baseIdx ) {
      idx += 1;
      op.idx = idx;
    } else {
      baseIdx -= 1;
      baseOp.idx = baseIdx;
    }
  },

  _transInsertDeleteElement : function(baseOp, op, otAddedOp)
  {   
    var newOp = null;
    var baseIdx = baseOp.idx;
    
    var idx = op.idx;
    var len = op.len;
    
    if (idx >= baseIdx )
    {
      idx += 1;
      op.idx = idx;
    }
    else
    {
      if (idx + len > baseIdx)//split the delete into two operation
      {
         //if the new created operation has existed, just return;
    	 if(otAddedOp && otAddedOp.tid == op.tid && otAddedOp.idx == idx && otAddedOp.len == len-baseIdx+idx)
        	return null;
    	op.len = baseIdx-idx;
        
        newOp = {};		
        newOp.tid = op.tid;
        newOp.t = MSGUTIL.actType.deleteElement;
        newOp.idx = idx;
        newOp.len = len-baseIdx+idx;  
        
        baseOp.idx = idx;
      }
      else
      {
        baseIdx -= len;
        baseOp.idx = baseIdx;
      }
    }   
    return newOp;
  },
  
  _checkPresAllSlidesDeleted : function(baseOps, ops) {
    if (!baseOps || !ops) {
        return false;
    }
    var indexes = [];
    var baseOpsSlideCount = 0, opsSlideCount = 0;
    for (var i = 0; i< baseOps.length; i++) {
      if (0 == i)
        baseOpsSlideCount = baseOps[i].p_osc;
      indexes.push(baseOps[i].p_nid);
    }
    for (var j = 0; j< ops.length; j++) {
      if (0 == j)
        opsSlideCount = ops[j].p_osc;
      var index = ops[j].p_nid;
      // the same slide will be deleted
      if (-1 !== indexes.indexOf(index))
        return true;
      else
        indexes.push(index);
    }
    // All slide will be deleted
    if (baseOpsSlideCount == opsSlideCount) {
      return baseOpsSlideCount == indexes.length;
    }
    return false;
  },
  
  _transPresDeleteDeleteSlideElem : function(baseOp, op)
  {
    if (!baseOp || !op) {
        return false;
    }
    var baseIdx = baseOp.idx;
    var idx = op.idx;
    
    if ( idx < baseIdx ) {
      baseOp.idx = baseIdx - 1;
    } else if (idx == baseIdx) {  // conflict
      // no need adjust index
      return true;
    } else {
      op.idx = idx - 1;
    }
    return false;
  },

  _transDeleteDeleteElement : function(baseOp, op)
  {
	  
	var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
    
    if ( idx <= baseIdx )
    {
      if ( idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.len = baseIdx - idx;
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          //we just ot same element at same index
          if(idx != baseIdx || (idx == baseIdx && len == baseLen && baseOp.elist[0] == op.elist[0]))
          	op.len = len - baseLen;
        }
      }
      else//idx+len<baseIdx
        baseOp.idx = baseIdx - len;    
    }
    else //if ( idx > baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.idx = baseIdx;
          if (idx + len < baseIdx + baseLen)
          {
            op.len = 0;
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.len = idx + len - baseIdx - baseLen;
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.idx = idx - baseLen;
        }
    }
  },

  _transPresDeleteInsertSlideElem : function(baseOp, op) {
    if (!baseOp || !op) {
      return false;
    }
    var baseIdx = baseOp.idx;
    var idx = op.idx;
    if ( idx > baseIdx ) {
      op.idx = idx - 1;
    } else {
      baseOp.idx = baseIdx + 1;
    }
  },

  _transDeleteInsertElement : function(baseOp, op)
  {
	var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
       
    if ( idx > baseIdx )
    {
      if (idx <= baseIdx + baseLen )
      {
        op.idx = baseIdx;
      }
      else //if (idx > baseIdx + baseLen)
      {
        op.idx = idx - baseLen;
      }
    }
    else
    {
      baseOp.idx = baseIdx+1;
    }
    
  },
  _transInsertElementReplace:function(baseOp,ops,delta, delIndex){
	var baseIndex = baseOp.idx;
    var actType = MSGUTIL.actType;
    if (baseIndex <= delIndex)
    {
      for (var i=0;i< ops.length;i++)
      {
    	var op = ops[i];
        if (op.t==actType.insertElement||op.t==actType.deleteElement)
        {
          op.idx = op.idx+1;
        }
      }
      return 1;
    }
    else
    {
      baseOp.idx = baseOp.idx+ delta;
      return 0;
    }
  },
  _transDeleteElementReplace:function(baseOp,ops,delta,delIndex){
	var baseIndex = baseOp.idx;
	var baselen = baseOp.len;
	var actType = MSGUTIL.actType;
    if (baseIndex +baselen<= delIndex)
    {
      for ( var i=0;i< ops.length;i++)
      {
    	var op = ops[i];
        if (op.t==actType.insertElement||op.t==actType.deleteElement)
        {
          op.idx = op.idx - baselen;
        }
      }
      return baselen;
    }
    else
    {
      baseOp.idx = baseOp.idx + delta;
    }
    return 0;
  },
  _transInsertSplitElement : function(baseOp, op)
  {     
    var baseIdx = baseOp.idx;
    
    var idx = op.idx;
       
    if (idx > baseIdx)//make sure split is before insert when their index is the same
    {
      idx += 1;
      op.idx = idx;
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += 1;
      baseOp.idx = baseIdx;
    }   
  },
  _transSplitInsertElement : function(baseOp,op)
  {
	  var baseIdx = baseOp.idx;
	  var idx = op.idx;
	  if(idx >= baseIdx)
	  {
		  idx += 1;
		  op.idx = idx;
	  }
	  else
	  {
		  baseIdx += 1;
	      baseOp.idx = baseIdx;
	  }
  },
  _transInsertTaskInsertElement : function( baseOp, op)
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  if (idx > baseIdx) {
		  if ( idx < baseIdx + baseLen) {
				  return true; //reject
		  } else {
			  op.idx =  idx - baseLen + 1;
		  }
	  } else { //transform base msg, set trans operation back
		  baseOp.idx = baseIdx+1;
	  }
	  return false;
  },
  _transInsertTaskDeleteElement : function( baseOp, op)
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if (idx >= baseIdx) {
		  if ( idx < baseIdx + baseLen) {
				  return true; // reject
		  } else {
			  op.idx =  idx - baseLen + 1;
		  }
	  } else {
		  if ( baseIdx < (idx + len)) {
			  return true; //reject
		  } else {
			  baseOp.idx = baseIdx-len;
		  }
	  }
	  return false;
  },
  _transDeleteTaskInsertElement : function( baseOp, op)
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  if (baseOp.tid == op.tid)
	  {
	  if (idx > baseIdx) {
		  op.idx =  idx + baseLen - 1;
	  } else { //transform base msg, set trans operation back
		  baseOp.idx = baseIdx+1;
	  }
	  }
	  if (baseOp.rid == op.tid)
	  {
	  	op.tid = baseOp.tid;
	  	op.idx = idx+baseIdx;
	  }	
	  return false;
  },
  _transDeleteTaskDeleteElement : function ( baseOp, op)
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if ( baseOp.tid == op.tid)
	  {
	  if (idx > baseIdx) {
		  op.idx =  idx + baseLen - 1;
	  } else {
		  baseOp.idx = baseIdx - len;
	  }
	  }
	  if (baseOp.rid == op.tid)
	  {
	  	op.tid = baseOp.tid;
	  	op.idx = idx+baseIdx;
	  }
	  return false;
  },
  _transInsertElementInsertTask : function ( baseOp,  op)
  {
	  var baseIdx = baseOp.idx;
	  var idx = op.idx;
	  var len = op.len;
	  if (idx >= baseIdx) {
		  op.idx = idx+1;
	  } else {
		  if ( baseIdx < idx+len) {
			return true; //reject
		  } else {
			baseOp.idx = baseIdx-len+1;
		  }
	  }
	  return false;
  },
  _transDeleteElementInsertTask : function ( baseOp, op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if (idx >= baseIdx) {
		  if ( idx < baseIdx + baseLen) {
			  return true; // reject
		  } else {
			  op.idx =  idx - baseLen;
		  }
	  } else {
		  if ( baseIdx < (idx + len)) {
			  return true; //reject
		  } else {
			  baseOp.idx = baseIdx-len + 1;
		  }
	  }
	  return false;
  },
  _transInsertElementDeleteTask : function ( baseOp, op)
  {
	  var baseIdx = baseOp.idx;
	  var idx = op.idx;
	  var len = op.len;
	  if ( baseOp.tid == op.tid)
	  {
	  if (idx >= baseIdx) {
		  op.idx = idx+1;
	  } else {
		  baseOp.idx = baseIdx+len-1;
	  }
	  }
	  if ( baseOp.tid == op.rid)
	  {
	  	 baseOp.tid = op.tid;
	  	 baseOp.idx = idx+baseIdx;
	  }
	  return false;
  },
  _transDeleteElementDeleteTask : function ( baseOp,  op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if (baseOp.tid == op.tid)
	  {
		  if (idx > baseIdx) {
			  op.idx =  idx - baseLen;
		  } else {
			  baseOp.idx = baseIdx + len - 1;
		  }
	  }
	  if ( baseOp.tid == op.rid)
	  {
	  	 baseOp.tid = op.tid;
	  	 baseOp.idx = idx+baseIdx;
	  }
	  return false;
  },
  _transInsertTaskInsertTask : function ( baseOp, op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if (idx >= baseIdx) {
		  if ( idx <= baseIdx + baseLen) {
			  return true; // reject
		  } else {
			  op.idx =  idx - baseLen + 1;
		  }
	  } else {
		  if ( baseIdx <= (idx + len)) {
			  return true; //reject
		  } else {
			  baseOp.idx = baseIdx-len + 1;
		  }
	  }
	  return false;
  },
  _transInsertTaskDeleteTask : function( baseOp, op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if ( idx > baseIdx)
	  {
		  op.idx = idx - baseLen + 1;
	  } else {
		  baseOp.idx = baseIdx+len-1;
	  }
	  return false;
  },
  _transDeleteTaskInsertTask : function( baseOp, op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if ( idx > baseIdx)
	  {
		  op.idx =  idx+baseLen-1;
	  } else {
		  baseOp.idx = baseIdx-len+1;
	  }
	  return false;
  },
  _transDeleteTaskDeleteTask : function( baseOp, op )
  {
	  var baseIdx = baseOp.idx;
	  var baseLen = baseOp.len;
	  var idx = op.idx;
	  var len = op.len;
	  if ( idx > baseIdx)
	  {
		  op.idx =  idx+baseLen-1;
	  } else {
		  baseOp.idx = baseIdx+len-1;
	  }
	  return false;
  },
  _transDeleteStyle : function(baseOp, op)
  {
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.i;
    var len = op.l;
       
    if ( idx <= baseIdx)
    {
      if (idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.l = baseIdx - idx;
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          op.l = len - baseLen;
        }
      }
    }
    else //if ( idx >= baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.i = baseIdx;
          if (idx + len < baseIdx + baseLen)
          {
            op.l = 0;
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.l = idx + len - baseIdx - baseLen;
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.i = idx - baseLen;
        }
    }
    return false;
  },

  _transInsertStyle : function( baseOp, op)
  {
    var newOp = null;
    
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.i;
    var len = op.l;    
    
     if ( baseIdx > idx && baseIdx <= idx+len)//here is =, for append case
     {
         op.l = len + baseLen;
     }
     else if ( baseIdx <= idx )//#39002 
     {
     	 op.i += baseLen;
     }
      //TODO, mode == 1, replace case
    
    return newOp;
  },
  
  _transStyleStyle : function(baseOp, op)
  {
    var baseIdx = baseOp.i;
    var baseLen = baseOp.l;
    var basetag = ( baseOp.e ) ? dojo.trim(baseOp.e): "";
    
    var idx = op.i;
    var len = op.l;   
    var tag = ( op.e )? dojo.trim(op.e):"";
    if ((idx >= baseIdx && idx < baseIdx+baseLen) || (baseIdx >= idx && baseIdx < idx+len))
    {     
      if( basetag != 'span' && basetag !='' && basetag == tag )//#38534
      	return true;
      if ( this._checkKeyOnMap(baseOp.s, op.s) )
        return true;
      if (this._checkKeyOnMap(baseOp.a, op.a))
        return true;
    }   
    return false;
  },
  
  _checkKeyOnMap : function(obj1, obj2, noEdit)
  {
	for (var attr1 in obj1) 
	{
	  for( var attr2 in obj2 )
	  {
		// PresCKUtil.editFlag attr will not be recorded in undo stack
		// cannot be roll back when conflict happen
		// And its value is always true if having this attr so ignore this attr
		// and do not take it as an conflict
		if ((attr1 == attr2) && !(noEdit && (attr1 == 'is_edited'))) {
			return true;
		}
      }
    }
    return false;
  },
 
  _transAttrAttr : function(baseOp, op, noEdit)
  {
    if (baseOp.tid == op.tid)
    { 
	    if ( this._checkKeyOnMap(baseOp.s, op.s) )
	      return true;
	    if (this._checkKeyOnMap(baseOp.a, op.a, noEdit))
	      return true;  
    }
    return false;
  },
  
  _transInsertSplitText : function(baseOp,op,ieOp,otAddedOp,isFromUndo)
  {
      var newOp = null;
      var baseIdx = baseOp.idx;
      var baseLen = baseOp.len;
      
      var idx = op.idx;
      var len = op.len;
      
      if(idx > baseIdx || (idx == baseIdx && !isFromUndo))
      {
    	  op.idx = idx + baseLen;
      }
      else
      {
    	var element = CKEDITOR.dom.element.createFromHtml(ieOp.s);
    	//it the new created operation has existed, just return;
    	if(otAddedOp && otAddedOp.tid == element.getAttribute('id') && otAddedOp.idx == baseIdx-idx && otAddedOp.cnt == baseOp.cnt)
    		return null;
    	op.len = len+baseLen;
        newOp = {};		
        newOp.tid = element.getAttribute('id');
        newOp.t = MSGUTIL.actType.insertText;
        newOp.idx = baseIdx-idx;
        newOp.len = baseLen;
        newOp.cnt = baseOp.cnt;
//        baseOp.tid = element.getAttribute('id');
//        baseOp.idx = baseIdx-idx;
      }
      
      return newOp;
  },
  
  _transDeleteSplitText : function(baseOp,op,ieOp,otAddedOp)
  {
	  var newOp = null;
      var baseIdx = baseOp.idx;
      var baseLen = baseOp.len;
      
      var idx = op.idx;
      var len = op.len;
      
      if(idx > baseIdx)
      {
    	  // when idx < baseIdx + baseLen, we have refused one of the operation before calling this function.
          // so here the condition is equal to idx >= baseIdx + baseLen
    	  op.idx = idx - baseLen;
      }
      else //idx + len >= baseIdx + baseLen
      {
    	var element = CKEDITOR.dom.element.createFromHtml(ieOp.s);
    	//it the new created operation has existed, just return;
      	if(otAddedOp && otAddedOp.tid == element.getAttribute('id') && otAddedOp.idx == baseIdx-idx && otAddedOp.len == baseLen)
      		return null;
    	op.len = len-baseLen;
        newOp = {};
        newOp.tid = element.getAttribute('id');
        newOp.t = MSGUTIL.actType.deleteText;
        newOp.idx = baseIdx-idx;
        newOp.len = baseLen;
//        baseOp.tid = element.getAttribute('id');
//        baseOp.idx = baseIdx-idx;
      }
	  return newOp;
  },
  
  _transSplitInsertText : function(dtBaseOp,ieBaseOp,op)
  {
      var baseIdx = dtBaseOp.idx;
      var baseLen = dtBaseOp.len;
      
      var idx = op.idx;
      var len = op.len;
      
	  if( idx > baseIdx )
	  {
	      dtBaseOp.len = len+baseLen;
	      var element = CKEDITOR.dom.element.createFromHtml(ieBaseOp.s);
	      op.tid = element.getAttribute('id');
	      op.idx = idx-baseIdx;		  		  
		  var newOp = {};		
          newOp.tid = element.getAttribute('id');
          newOp.t = MSGUTIL.actType.insertText;
          newOp.idx = idx-baseIdx;
          newOp.len = len;
          newOp.cnt = op.cnt;
		  return newOp;
	  }
	  else
	  {
		  dtBaseOp.idx = baseIdx+len;
	  }
	  return null;
  },
  
  _transSplitDeleteText : function(dtBaseOp,ieBaseOp,op, isFromUndo)
  {
	  var newOp = null;
	  var baseIdx = dtBaseOp.idx;
      var baseLen = dtBaseOp.len;
      
      var idx = op.idx;
      var len = op.len;
      
      if( idx >= baseIdx )//baseIdx + baseLen >= idx + len
      {
    	  if(isFromUndo)
    		  op.len = 0;	// #43514
    	  else
          {
    		// #46874
    		//dtBaseOp.len = baseLen - len;
	        var element = CKEDITOR.dom.element.createFromHtml(ieBaseOp.s);
	        op.tid = element.getAttribute('id');
	        op.idx = idx-baseIdx;
          }
      }
      else
      {
        if (baseIdx < idx + len)//baseIdx + baseLen >= idx + len
        {
            return true;
        }
        else //if (baseIdx >= idx + len)
        {
        	dtBaseOp.idx = baseIdx - len;
        }
      }
      return false;
  },
  
  _transInsertJoinText : function(baseOp,op,sameTarget,otAddedOp)
  {
    var newOp = null;
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
       
    if(sameTarget)//in join operation, baseIdx <= idx
    {
    	op.idx = idx+baseLen;
    }
    else//move the added string to the join target
    {
      if(otAddedOp && otAddedOp.tid == op.tid && otAddedOp.idx == baseIdx+idx && otAddedOp.len == baseLen)
    	  return null;
      newOp = {};
      newOp.tid = op.tid;
      newOp.t = MSGUTIL.actType.insertText;
      newOp.idx = baseIdx+idx;
      newOp.len = baseLen;
      newOp.cnt = baseOp.cnt;
//      baseOp.tid = op.tid;
//      baseOp.idx = baseIdx+idx;
    }  
    return newOp;
  },
  
  _transDeleteJoinText : function(baseOp,op,sameTarget)
  {
    var newOp = null;
    var baseIdx = baseOp.idx;
    var baseLen = baseOp.len;
    
    var idx = op.idx;
    var len = op.len;
       
    if(sameTarget) //idx >= baseidx + baseLen
    {
      op.idx = idx - baseLen;
    }
    else
    {
      newOp = {};
      newOp.tid = op.tid;
      newOp.t = MSGUTIL.actType.deleteText;
      newOp.idx = baseIdx+idx;
      newOp.len = baseLen;
//      baseOp.tid = op.tid;
//      baseOp.idx = baseIdx+idx;
    }
    return newOp;
  },
  
  _transJoinInsertText : function(baseOp,op,sameTarget)
  {
    var baseIdx = baseOp.idx;
    var idx = op.idx;
    var len = op.len;
    
    if(!sameTarget)
    {
      op.tid = baseOp.tid;
      op.idx = baseIdx+idx;
    }
    
    return false;
  },
  
  _transJoinDeleteText : function(baseOp,op,sameTarget)
  {
    var baseIdx = baseOp.idx;
    var idx = op.idx;
    var len = op.len;
    
    if(!sameTarget)
    {
      op.tid = baseOp.tid;
      op.idx = baseIdx+idx;
    }
    
    return false;
  },
  
  _checkKeyOnList : function(target, list)
  {
    for (var i=0;i<list.length;i++)
    {
      if (target == list[i])
        return true;
    }
    return false;
  },
  
  _checkKeyOnRange : function(op1, op2)
  {
    if (!op1.isb && op1.bid == op2.tid)
    {
      if (op1.idx >= op2.idx && op1.idx +op1.len <=op2.idx +op2.len)
        return true;
    }
    return false;
  }
  
});

(function(){	
	if(typeof OTSERVICE == "undefined")
		OTSERVICE = new concord.text.OTService();	
})();