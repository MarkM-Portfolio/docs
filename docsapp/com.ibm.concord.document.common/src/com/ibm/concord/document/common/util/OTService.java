/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Element;

import com.ibm.concord.platform.util.JTidyUtil;

public class OTService
{
  private static final OTService _instance = new OTService();
  
  private static final Logger LOG = Logger.getLogger(OTService.class.getName());
  
  public static OTService getInstance()
  {
    return _instance;
  }
  
  //private OT functions
  
  private void transInsertInsertText(InsertTextOperation baseOp, InsertTextOperation op)
  {     
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
       
    if (idx >= baseIdx )//(idx == baseIdx)ab ba issue,first in, first insert,reversed behavior on client
    {
      idx += baseLen;
      op.setIndex(idx);
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += len;
      baseOp.setIndex(baseIdx);
    }   
  }
  private DeleteTextOperation transInsertDeleteText(InsertTextOperation baseOp, DeleteTextOperation op)
  {
    DeleteTextOperation newOp = null;
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
       
    if (idx >= baseIdx )
    {
      idx += baseLen;
      op.setIndex(idx);
    }
    else
    {
      if (idx + len > baseIdx)//split the delete into two operation
      {
        op.setLength(baseIdx-idx);
        
        newOp = new DeleteTextOperation();
        newOp.setTarget(op.getTarget());
        newOp.setType(Operation.DELETE_TEXT);
        //newOp.setIndex(idx); 
        newOp.setIndex(idx + baseLen);
        newOp.setLength(len-baseIdx+idx);
        
        baseOp.setIndex(idx);
//        ops.add(newOp);
      }
      else
      {
        baseIdx -= len;
        baseOp.setIndex(baseIdx);
      }
    } 
    return newOp;
  }
  
  private boolean transDeleteDeleteText(DeleteTextOperation baseOp, DeleteTextOperation op)
  {
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
       
    if ( idx <= baseIdx )
    {
      if ( idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.setLength(baseIdx - idx);
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          op.setLength(len - baseLen);
        }
      }
      else//idx+len<baseIdx
        baseOp.setIndex(baseIdx - len);    
    }
    else //if ( idx > baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.setIndex(baseIdx);
          if (idx + len < baseIdx + baseLen)
          {
            op.setLength(0);
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.setLength(idx + len - baseIdx - baseLen);
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.setIndex(idx - baseLen);
        }
    }
    return false;
  }

  private void transDeleteInsertText(DeleteTextOperation baseOp, InsertTextOperation op)
  {
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
       
    if ( idx > baseIdx )
    {
      if (idx <= baseIdx + baseLen)
      {
        op.setIndex(baseIdx);
      }
      else //if (idx > baseIdx + baseLen)
      {
        op.setIndex(idx - baseLen);
      }
    }
    else
    {
      baseOp.setIndex(baseIdx+len);
    }
    
  }

  private void transInsertInsertElement(InsertElementOperation baseOp, InsertElementOperation op)
  {     
    int baseIdx = baseOp.getIndex();
    
    int idx = op.getIndex();
       
    if (idx >= baseIdx )//(idx == baseIdx)ab ba issue,first in, first insert,reversed behavior on client
    {
      idx += 1;
      op.setIndex(idx);
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += 1;
      baseOp.setIndex(baseIdx);
    }   
  }
  
  private int transInsertElementReplace(InsertElementOperation baseOp, List<Operation> ops, int delta, int delIndex, int delCnt)
  {
    int baseIndex = baseOp.getIndex();
    if (baseIndex <= delIndex)
    {
      for (Operation op : ops)
      {
        if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
        {
          InsertElementOperation insertOp = (InsertElementOperation) op;
          insertOp.setIndex(insertOp.getIndex() + 1);
        }
        else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
        {
          DeleteElementOperation delOp = (DeleteElementOperation) op;
          delOp.setIndex(delOp.getIndex() + 1);
        }
      }
      return 1;
    }
    else
    {
      baseOp.setIndex(baseOp.getIndex() + delta);
      return 0;
    }
  }
  private int transDeleteElementReplace(DeleteElementOperation baseOp, List<Operation> ops, int delta, int delIndex, int delCnt)
  {
    int baseIndex = baseOp.getIndex();
    int baselen = baseOp.getLength();
    if (baseIndex +baselen<= delIndex)
    {
      for (Operation op : ops)
      {
        if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
        {
          InsertElementOperation insertOp = (InsertElementOperation) op;
          insertOp.setIndex(insertOp.getIndex() - baselen);
        }
        else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
        {
          DeleteElementOperation delOp = (DeleteElementOperation) op;
          delOp.setIndex(delOp.getIndex() - baselen);
        }
      }
      return baselen;
    }
    else
    {
      baseOp.setIndex(baseOp.getIndex() + delta);
    }
    return 0;
  }
  
  private void transPresInsertDeleteSlideElem(
    InsertElementOperation baseOp, DeleteElementOperation op) {
    int baseIdx = baseOp.getIndex();
    int idx = op.getIndex();
       
    if (idx >= baseIdx ) {
      idx += 1;
      op.setIndex(idx);
    } else {
      baseIdx -= 1;
      baseOp.setIndex(baseIdx);
    }
  }
  
  private DeleteElementOperation transInsertDeleteElement(InsertElementOperation baseOp, DeleteElementOperation op)
  {   
    DeleteElementOperation newOp = null;
    int baseIdx = baseOp.getIndex();
    
    int idx = op.getIndex();
    int len = op.getLength();
       
    if (idx >= baseIdx )
    {
      idx += 1;
      op.setIndex(idx);
    }
    else
    {
      if (idx + len > baseIdx)//split the delete into two operation
      {
        op.setLength(baseIdx-idx);
        
        newOp = new DeleteElementOperation();
        newOp.setTarget(op.getTarget());
        newOp.setType(Operation.DELETE_ELEMENT);
        newOp.setIndex(idx);
        newOp.setLength(len-baseIdx+idx);
        
        baseOp.setIndex(idx);
      }
      else
      {
        baseIdx -= len;
        baseOp.setIndex(baseIdx);
      }
    }   
    return newOp;
  }
  
  private boolean checkPresAllSlidesDeleted(List<Operation> baseOps, List<Operation> ops) {
    List<String> indexes = new ArrayList<String>();
    int baseOpsSlideCount = 0, opsSlideCount = 0;
    for (int i = 0; i< baseOps.size(); i++) {
      DeleteElementOperation baseOp = (DeleteElementOperation)baseOps.get(i);
      if (0 == i)
        baseOpsSlideCount = baseOp.getPresOrigSlideCount();
      indexes.add(baseOp.getPresNodeId());
    }
    for (int i = 0; i< ops.size(); i++) {
      DeleteElementOperation op = (DeleteElementOperation)ops.get(i);
      if (0 == i)
        opsSlideCount = op.getPresOrigSlideCount();
      String presNodeId = op.getPresNodeId();
      // the same slide will be deleted
      if (indexes.contains(presNodeId)) {
        return true;
      }
      else
        indexes.add(presNodeId);
    }
    // All slide will be deleted
    if (baseOpsSlideCount == opsSlideCount) {
      return baseOpsSlideCount == indexes.size();
    }
    return false;
  }
  
  private boolean transPresDeleteDeleteSlideElem(DeleteElementOperation baseOp, DeleteElementOperation op)
  {    
    int baseIdx = baseOp.getIndex();
    int idx = op.getIndex();
    
    if ( idx < baseIdx ) {
      baseOp.setIndex(baseIdx - 1);
    } else if (idx == baseIdx) {  // conflict
      // no need adjust index
      return true;
    } else {
      op.setIndex(idx - 1);
    }
    return false;
  }
  
  private boolean transDeleteDeleteElement(DeleteElementOperation baseOp, DeleteElementOperation op)
  {    
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
    
    if ( idx <= baseIdx )
    {
      if ( idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.setLength(baseIdx - idx);
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          //we just ot same element at same index
          if(idx != baseIdx || (idx == baseIdx && len == baseLen && baseOp.getList().get(0).equals(op.getList().get(0))))
        	op.setLength(len - baseLen);
        }
      }
      else//idx+len<baseIdx
        baseOp.setIndex(baseIdx - len);    
    }
    else //if ( idx > baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.setIndex(baseIdx);
          if (idx + len < baseIdx + baseLen)
          {
            op.setLength(0);
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.setLength(idx + len - baseIdx - baseLen);
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.setIndex(idx - baseLen);
        }
    }
    return false;
  }
  
  private void transPresDeleteInsertSlideElem(
    DeleteElementOperation baseOp, InsertElementOperation op) {
    int baseIdx = baseOp.getIndex();
    int idx = op.getIndex();
    if ( idx > baseIdx ) {
      op.setIndex(idx - 1);
    } else {
      baseOp.setIndex(baseIdx + 1);
    }
  }

  private void transDeleteInsertElement(DeleteElementOperation baseOp, InsertElementOperation op)
  {
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
       
    if ( idx > baseIdx )
    {
      if (idx <= baseIdx + baseLen)
      {
        op.setIndex(baseIdx);
      }
      else //if (idx > baseIdx + baseLen)
      {
        op.setIndex(idx - baseLen);
      }
    }
    else
    {
      baseOp.setIndex(baseIdx+1);
    }
    
  }
  
  private void transInsertSplitElement(InsertElementOperation baseOp, InsertElementOperation op)
  {   
    int baseIdx = baseOp.getIndex();
    
    int idx = op.getIndex();
       
    if (idx > baseIdx )//make sure split is before insert when their index is the same
    {
      idx += 1;
      op.setIndex(idx);
    }
    else//transform base msg, set trans operation back
    {
      baseIdx += 1;
      baseOp.setIndex(baseIdx);
    }   
  }
  private boolean transInsertTaskInsertElement(TaskOperation baseOp, InsertElementOperation op)
  {

	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
    if (idx > baseIdx)
    {
      if (idx < baseIdx + baseLen)
      {
			  return true; //reject
      }
      else
      {
			  op.setIndex( idx - baseLen + 1);
		  }
    }
    else
    { // transform base msg, set trans operation back
		  baseOp.setIndex(baseIdx+1);
	  }
	  return false;
  }
  private boolean transInsertTaskDeleteElement(TaskOperation baseOp, DeleteElementOperation op)
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (idx >= baseIdx)
    {
      if (idx < baseIdx + baseLen)
      {
			  return true; // reject
      }
      else
      {
			  op.setIndex( idx - baseLen + 1);
		  }
    }
    else
    {
      if (baseIdx < (idx + len))
      {
			  return true; //reject
      }
      else
      {
			  baseOp.setIndex(baseIdx-len);
		  }
	  }
	  return false;
  }
  
  private boolean transDeleteTaskInsertElement(TaskOperation baseOp, InsertElementOperation op)
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
    if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
    {
      if (idx > baseIdx)
      {
		  op.setIndex( idx + baseLen - 1);
      }
      else
      { // transform base msg, set trans operation back
		  baseOp.setIndex(baseIdx+1);
	  }
    }
    if (baseOp.getRefId().equalsIgnoreCase(op.getTarget()))
    {
      op.setTarget(baseOp.getTarget());
      op.setIndex(baseIdx+idx);
    }
	  return false;
  }
  private boolean transDeleteTaskDeleteElement(TaskOperation baseOp, DeleteElementOperation op)
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
    {
      if (idx > baseIdx)
      {
		  op.setIndex( idx + baseLen - 1);
      }
      else
      {
		  baseOp.setIndex(baseIdx - len);
	  }
    }
    if (baseOp.getRefId().equalsIgnoreCase(op.getTarget()))
    {
      op.setTarget(baseOp.getTarget());
      op.setIndex(baseIdx+idx);
    }
	  return false;
  }
  
  
  private boolean transInsertElementInsertTask(InsertElementOperation baseOp, TaskOperation op)
  {
	  int baseIdx = baseOp.getIndex();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (idx >= baseIdx)
    {
		  op.setIndex(idx+1);
    }
    else
    {
      if (baseIdx < idx + len)
      {
			  return true; //reject
      }
      else
      {
			  baseOp.setIndex(baseIdx-len+1);
		  }
	  }
	  return false;
  }
  private boolean transDeleteElementInsertTask(DeleteElementOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (idx >= baseIdx)
    {
      if (idx < baseIdx + baseLen)
      {
			  return true; // reject
      }
      else
      {
			  op.setIndex( idx - baseLen);
		  }
    }
    else
    {
      if (baseIdx < (idx + len))
      {
			  return true; //reject
      }
      else
      {
			  baseOp.setIndex(baseIdx-len + 1);
		  }
	  }
	  return false;
  }
  
  private boolean transInsertElementDeleteTask(InsertElementOperation baseOp, TaskOperation op)
  {
	  int baseIdx = baseOp.getIndex();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
    {
      if (idx >= baseIdx)
      {
		  op.setIndex(idx+1);
      }
      else
      {
		  baseOp.setIndex(baseIdx+len-1);
	  }
    }
    if (baseOp.getTarget().equalsIgnoreCase(op.getRefId()))
    {
      baseOp.setTarget(op.getTarget());
      baseOp.setIndex(baseIdx+idx);
    }
	  return false;
  }
  private boolean transDeleteElementDeleteTask(DeleteElementOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
    {
      if (idx > baseIdx)
      {
		  op.setIndex( idx - baseLen);
      }
      else
      {
		  baseOp.setIndex(baseIdx + len - 1);
	  }
    }
    if (baseOp.getTarget().equalsIgnoreCase(op.getRefId()))
    {
      baseOp.setTarget(op.getTarget());
      baseOp.setIndex(baseIdx+idx);
    }
	  return false;
  }
  
  private boolean transInsertTaskInsertTask(TaskOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
    if (idx >= baseIdx)
    {
      if (idx <= baseIdx + baseLen)
      {
			  return true; // reject
      }
      else
      {
			  op.setIndex( idx - baseLen + 1);
		  }
    }
    else
    {
      if (baseIdx <= (idx + len))
      {
			  return true; //reject
      }
      else
      {
			  baseOp.setIndex(baseIdx-len + 1);
      }
	}
	  return false;
  }
  private boolean transInsertTaskDeleteTask(TaskOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
	  if ( idx > baseIdx)
	  {
		  op.setIndex(idx - baseLen + 1);
	  }
	  else
      {
		  baseOp.setIndex( baseIdx+len-1);
      }
	  return false;
  }
  private boolean transDeleteTaskInsertTask(TaskOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
	  if ( idx > baseIdx)
	  {
		  op.setIndex( idx+baseLen-1);
	  }
      else
      {
		  baseOp.setIndex(baseIdx-len+1);
      }
	  return false;
  }
  private boolean transDeleteTaskDeleteTask(TaskOperation baseOp, TaskOperation op )
  {
	  int baseIdx = baseOp.getIndex();
	  int baseLen = baseOp.getLength();
	  int idx = op.getIndex();
	  int len = op.getLength();
	  if ( idx > baseIdx)
	  {
		  op.setIndex( idx+baseLen-1);
	  }
      else
      {
		  baseOp.setIndex(baseIdx+len-1);
	  }
	  return false;
  }  
  private boolean transDeleteStyle(DeleteTextOperation baseOp, InlineStyleOperation op)
  {
	  
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getOffset();
       
    if ( idx <= baseIdx)
    {
      if (idx + len > baseIdx)
      {
        if (idx + len < baseIdx + baseLen)
        {
          op.setOffset(baseIdx - idx);
        }
        else //if (idx + len >= baseIdx + baseLen)
        {
          op.setOffset(len - baseLen);
        }
      }
    }
    else //if ( idx >= baseIdx )
    {
        if (idx < baseIdx + baseLen)
        {
          op.setIndex(baseIdx);
          if (idx + len < baseIdx + baseLen)
          {
            op.setOffset(0);
          }
          else //if (idx + len >= baseIdx + baseLen)
          {
            op.setOffset(idx + len - baseIdx - baseLen);
          }
        }
        else //if (idx >= baseIdx + baseLen)
        {
          op.setIndex(idx - baseLen);
        }
    }
    return false;
  }

  private InlineStyleOperation transInsertStyle(InsertTextOperation baseOp, InlineStyleOperation op)
  {
    InlineStyleOperation newOp = null;
    
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getOffset();    
    
    //check insert pos.
    //int mode = baseOp.getInsertMode();
    
    //1 break insertion, the style operation will be broken into two
/*    if (mode == -1)
    {
      if ( baseIdx > idx && baseIdx < idx+len)
      {
          op.setOffset(baseIdx - idx);
          newOp = new InlineStyleOperation();
          newOp.setTarget(op.getTarget());
          newOp.setType(op.getType());
          newOp.setIndex(baseIdx+baseLen);
          newOp.setOffset(idx + len - baseIdx);
      }
    }
    //2 append insertion, expand the scope of set style
    else
*/  
    if ( baseIdx > idx && baseIdx <= idx+len)//here is =, for append case
    {
          op.setOffset(len + baseLen);
          if(LOG.isLoggable(Level.FINER ))
          {
            LOG.finer("Inline style operation's offset is modiefed to " + op.getOffset() ); 
          }
    }
    else if( baseIdx <= idx)//#39002 
    {
        op.setIndex( idx + baseLen );
        if(LOG.isLoggable(Level.FINER ))
        {
          LOG.finer("Inline style operation's index is modiefed to " + op.getIndex() ); 
        }
    }
    //TODO, mode == 1, replace case
    
    return newOp;
  }
  
  private boolean transStyleStyle(InlineStyleOperation baseOp, InlineStyleOperation op)
  {
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getOffset();
    
    int idx = op.getIndex();
    int len = op.getOffset();   
    
    HTMLAttributes baseAttr = ((StyleData) baseOp.getData()).attributes;
    HTMLAttributes attr = ((StyleData) op.getData()).attributes;
    
    if ((idx >= baseIdx && idx < baseIdx+baseLen) || (baseIdx >= idx && baseIdx < idx+len))
    {     
      if (!baseAttr.blockTag.equals(XHTMLDomUtil.SPAN_TAG) && baseAttr.blockTag.equals(attr.blockTag))
      {
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("Inline style operation is rejected: tag = < " + attr.blockTag + " >");
        }
        return true; // #38534
      }
      if ( checkKeyOnMap(baseAttr.styles, attr.styles) )
        return true;
      if (checkKeyOnMap(baseAttr.attributes, attr.attributes))
        return true;
    }   
    return false;
  }
  
  private boolean checkKeyOnMap(HashMap<String, String> map1, HashMap<String, String> map2)
  {
    Iterator<Map.Entry<String, String>> iter1 = map1.entrySet().iterator();
    while (iter1.hasNext()) {
      
      Map.Entry<String, String> entry1 = (Map.Entry<String, String>) iter1.next();
      String attr1 = entry1.getKey().toString();
      
      Iterator<Map.Entry<String, String>> iter2 = map2.entrySet().iterator();
      while (iter2.hasNext()) {
        
        Map.Entry<String, String> entry2 = (Map.Entry<String, String>) iter2.next();
        String attr2 = entry2.getKey().toString();
        
        if (attr1.equalsIgnoreCase(attr2))
        {
//          if (attr1.equalsIgnoreCase("text-decoration"))
//          {
//            if (entry1.getValue().equalsIgnoreCase(entry2.getValue()))
//                return true;
//          }
//          else
            return true;
        }
      }
    }
    return false;
  }
 
  private boolean transAttrAttr(BlockStyleOperation baseOp, BlockStyleOperation op)
  {
    HTMLAttributes baseAttr = ((BlockStyleData) baseOp.getData()).attributes;
    HTMLAttributes attr = ((BlockStyleData) op.getData()).attributes;
    if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
    {
      if ( checkKeyOnMap(baseAttr.styles, attr.styles) )
        return true;
      if (checkKeyOnMap(baseAttr.attributes, attr.attributes))
        return true;
    }
    return false;
  }
  
  private InsertTextOperation transInsertSplitText(InsertTextOperation baseOp,DeleteTextOperation op, InsertElementOperation ieOp)
  {
    InsertTextOperation newOp = null;
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
    
    if(idx >= baseIdx)
    {
        op.setIndex(idx+baseLen);
    }
    else
    {
      op.setLength(len+baseLen);
      Tidy tidy = JTidyUtil.getTidy();
      Element element = (Element)XHTMLDomUtil.parseString(tidy, ieOp.getContent(), false);
      newOp = new InsertTextOperation();
      newOp.setTarget(element.getAttribute("id"));
      newOp.setType(Operation.INSERT_TEXT);
      newOp.setIndex(baseIdx-idx);
      newOp.setLength(baseLen);
      newOp.setContents(baseOp.getContents());
      baseOp.setTarget(element.getAttribute("id"));
      baseOp.setIndex(baseIdx-idx);
    }
    return newOp;
  }
  
  private DeleteTextOperation transDeleteSplitText(DeleteTextOperation baseOp,DeleteTextOperation op,InsertElementOperation ieOp)
  {
    DeleteTextOperation newOp = null;
    int baseIdx = baseOp.getIndex();
    int baseLen = baseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
    
    if(idx > baseIdx)
    {
       // when idx < baseIdx + baseLen, we have refused one of the operation before calling this function.
      // so here the condition is equal to idx >= baseIdx + baseLen
        op.setIndex(idx - baseLen);
    }
    else //idx + len >= baseIdx + baseLen
    {
      op.setLength(len-baseLen);
      newOp = new DeleteTextOperation();
      Tidy tidy = JTidyUtil.getTidy();
      Element element = (Element)XHTMLDomUtil.parseString(tidy, ieOp.getContent(), false);
      newOp.setTarget(element.getAttribute("id"));
      newOp.setType(Operation.DELETE_TEXT);
      newOp.setIndex(baseIdx - idx);
      newOp.setLength(baseLen);
      baseOp.setTarget(element.getAttribute("id"));
      baseOp.setIndex(baseIdx - idx);
    }
  
    return newOp;
  }
  
  private boolean transSplitInsertText(DeleteTextOperation dtBaseOp,InsertElementOperation ieBaseOp,InsertTextOperation op )
  {
    int baseIdx = dtBaseOp.getIndex();
    int baseLen = dtBaseOp.getLength();
    
    int idx = op.getIndex();
    int len = op.getLength();
   
    if( idx > baseIdx )
    {
      dtBaseOp.setLength(len+baseLen);
      Tidy tidy = JTidyUtil.getTidy();
      Element element = (Element)XHTMLDomUtil.parseString(tidy, ieBaseOp.getContent(), false);
      op.setTarget(element.getAttribute("id"));
      op.setIndex(idx-baseIdx);
    }
    else
    {
      dtBaseOp.setIndex(baseIdx+len);
    }
   
    return false;
  }
  
 private boolean transSplitDeleteText(DeleteTextOperation dtBaseOp,InsertElementOperation ieBaseOp ,DeleteTextOperation op)
 {
   int baseIdx = dtBaseOp.getIndex();
   int baseLen = dtBaseOp.getLength();
   
   int idx = op.getIndex();
   int len = op.getLength();
   
   if( idx >= baseIdx )//baseIdx + baseLen >= idx + len
   {
     dtBaseOp.setLength(baseLen-len);
     Tidy tidy = JTidyUtil.getTidy();
     Element element = (Element)XHTMLDomUtil.parseString(tidy, ieBaseOp.getContent(), false);
     op.setTarget(element.getAttribute("id"));
     op.setIndex(idx - baseIdx);
       //op.setLength(0);
   }
   else
   {
     if (baseIdx < idx + len)//baseIdx + baseLen >= idx + len
     {
         return true;
     }
     else //if (baseIdx >= idx + len)
     {
       dtBaseOp.setIndex(baseIdx - len);
     }
   }
   return false;
 }
 
 private InsertTextOperation transInsertJoinText(InsertTextOperation baseOp,InsertTextOperation op,boolean sameTarget)
 {
   InsertTextOperation newOp = null;
   int baseIdx = baseOp.getIndex();
   int baseLen = baseOp.getLength();
   
   int idx = op.getIndex();
      
   if(sameTarget)//in join operation, baseIdx <= idx
   {
     op.setIndex(idx+baseLen);
   }
   else//move the added string to the join target
   {
     newOp = new InsertTextOperation();
     newOp.setTarget(op.getTarget());
     newOp.setType(Operation.INSERT_TEXT);
     newOp.setIndex(baseIdx+idx);
     newOp.setLength(baseLen);
     newOp.setContents(baseOp.getContents());
     baseOp.setTarget(op.getTarget());
     baseOp.setIndex(baseIdx+idx);
   }  
   return newOp;
 }
 
 private DeleteTextOperation transDeleteJoinText(DeleteTextOperation baseOp,InsertTextOperation op,boolean sameTarget)
 {
   DeleteTextOperation newOp = null;
   int baseIdx = baseOp.getIndex();
   int baseLen = baseOp.getLength();
   
   int idx = op.getIndex();
      
   if(sameTarget) //idx >= baseidx + baseLen
   {
     op.setIndex(idx - baseLen);
   }
   else
   {
     newOp = new DeleteTextOperation();
     newOp.setTarget(op.getTarget());
     newOp.setType(Operation.DELETE_TEXT);
     newOp.setIndex(baseIdx+idx);
     newOp.setLength(baseLen);
     baseOp.setTarget(op.getTarget());
     baseOp.setIndex(baseIdx+idx);
   }
   
   return newOp;
 }
 
 private boolean transJoinInsertText (InsertTextOperation baseOp,InsertTextOperation op,boolean sameTarget)
 {
   int baseIdx = baseOp.getIndex();
   int idx = op.getIndex();
   int len = op.getLength();
   
   if(sameTarget) //idx <= baseIdx
   {
     baseOp.setIndex(baseIdx+len);
   }
   else
   {
     op.setTarget(baseOp.getTarget());
     op.setIndex(baseIdx+idx);
   }
   
   return false;
 }
 
 private boolean transJoinDeleteText(InsertTextOperation baseOp,DeleteTextOperation op,boolean sameTarget)
 {
   int baseIdx = baseOp.getIndex();
   int idx = op.getIndex();
   int len = op.getLength();
   
   if(sameTarget) // idx <= baseIdx
   {
     baseOp.setIndex(baseIdx-len);
   }
   else
   {
     op.setTarget(baseOp.getTarget());
     op.setIndex(baseIdx+idx);
   }
   
   return false;
 }
 


  private boolean checkKeyOnList(String target, List<String> list)
  {
    for (int i = 0; i < list.size(); i++)
    {
      if (target.equalsIgnoreCase(list.get(i)))
        return true;
    }
    return false;
  }

  private boolean checkKeyOnRange(BlockStyleOperation op1, DeleteTextOperation op2)
  {
    if (!op1.isBlock() && op1.getBlockId().equalsIgnoreCase(op2.getTarget()))
    {
      if (op1.getIndex() >= op2.getIndex() && op1.getIndex() + op1.getLength() <= op2.getIndex() + op2.getLength())
        return true;
    }
    return false;
  }
  
  //public OT api
 
  public boolean transTextText(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      //defect 46118
      int lenth =  ops.size();
      for (int j=0; j< lenth; j++)
      {
        Operation op = ops.get(j);
        if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
        {
          if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          {
            transInsertInsertText((InsertTextOperation)baseOp,(InsertTextOperation)op);
          }
          else if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          {
            DeleteTextOperation newOp = transInsertDeleteText((InsertTextOperation)baseOp,(DeleteTextOperation)op);            
            if (newOp != null){
              newOp.setAppend(true);
              ops.add(newOp);//add new operation created on OT
            }
          }
        }
        else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
        {
          if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          {
            transDeleteInsertText((DeleteTextOperation)baseOp,(InsertTextOperation)op);
          }
          else if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          {
            transDeleteDeleteText((DeleteTextOperation)baseOp,(DeleteTextOperation)op);
          }          
        }
      }     
    }
    return false;
  }
  
  public boolean transPresElementElement(List<Operation> baseOps, List<Operation> ops) {
    boolean conflict = false;
    boolean checked = false;
    for (int i = 0; i< baseOps.size(); i++) {
      Operation baseOp = baseOps.get(i);
      for (int j=0; j< ops.size(); j++) {
        Operation op = ops.get(j);
        // not delete or insert element in the same container
        if(!baseOp.getTarget().equals(op.getTarget()))
          continue;
        if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
          InsertElementOperation ieBaseOp = (InsertElementOperation)baseOp;
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
            InsertElementOperation ieOp = (InsertElementOperation)op;
            if (ieBaseOp.getPresIsNodeASlideWrapper() && ieOp.getPresIsNodeASlideWrapper())
              transInsertInsertElement(ieBaseOp, ieOp);
            // others no conflicts
          } else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
            DeleteElementOperation deOp = (DeleteElementOperation)op;
            if (ieBaseOp.getPresIsNodeASlideWrapper() && deOp.getPresIsNodeASlideWrapper())
              transPresInsertDeleteSlideElem(ieBaseOp, deOp);
            else if (ieBaseOp.getPresIsNodeADrawFrame() && deOp.getPresIsNodeASlideWrapper()) {
              conflict = this.checkPresIEDEConflict(ieBaseOp, deOp);
              if (conflict) return conflict;
            }
            // others no conflicts
          }
        } else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
          DeleteElementOperation deBaseOp = (DeleteElementOperation)baseOp;
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
            InsertElementOperation ieOp = (InsertElementOperation)op;
            if (deBaseOp.getPresIsNodeASlideWrapper() && ieOp.getPresIsNodeASlideWrapper())
              transPresDeleteInsertSlideElem(deBaseOp, ieOp);
            else if (deBaseOp.getPresIsNodeASlideWrapper() && ieOp.getPresIsNodeADrawFrame()) {
              conflict = this.checkPresIEDEConflict(deBaseOp, ieOp);
              if (conflict) return conflict;
            }
            // others no conflicts
          } else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
            DeleteElementOperation deOp = (DeleteElementOperation)op;
            if (deBaseOp.getPresIsNodeASlideWrapper() && deOp.getPresIsNodeASlideWrapper()) {
              if (!checked) {
                conflict = checkPresAllSlidesDeleted(baseOps, ops);
                if (conflict) return conflict;
                checked = true;
              }
//              conflict = transPresDeleteDeleteSlideElem(deBaseOp, deOp);
              if (conflict) return conflict;
            } else {
              conflict = checkPresIEDEConflict(deBaseOp, deOp);
              if (conflict) return conflict;
            }
          }
        }
      }
    }
    return conflict;
  }

  public boolean transElementElement(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      
      
      for (int j=0; j< ops.size(); j++)
      {
        Operation op = ops.get(j);
        if(!baseOp.getTarget().equals(op.getTarget()))
          continue;
        if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
        {
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          {
            transInsertInsertElement((InsertElementOperation)baseOp,(InsertElementOperation)op);
          }
          else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            DeleteElementOperation newOp = transInsertDeleteElement((InsertElementOperation)baseOp,(DeleteElementOperation)op);            
            if (newOp != null){
              newOp.setAppend(true);
              ops.add(newOp);//add new operation created on OT
            }
          }
        }
        else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
        {
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          {
            transDeleteInsertElement((DeleteElementOperation)baseOp,(InsertElementOperation)op);
          }
          else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            transDeleteDeleteElement((DeleteElementOperation)baseOp,(DeleteElementOperation)op);
          }
        }
      }     
    }
    return false;
  }
  
  public boolean checkPresElementMove(List<Operation> baseOps, List<Operation> ops, boolean isElementEarlier) {
    boolean conflict = false;
    for (Operation baseOp : baseOps) {
      String baseType = baseOp.getType();
      boolean isBaseSlideWrapper = false;
      boolean isBaseDrawFrame = false;
      if (baseType.equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
        InsertElementOperation ieBaseOp = (InsertElementOperation)baseOp;
        isBaseSlideWrapper = ieBaseOp.getPresIsNodeASlideWrapper();
        isBaseDrawFrame = ieBaseOp.getPresIsNodeADrawFrame();
      } else if (baseType.equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
        DeleteElementOperation deBaseOp = (DeleteElementOperation)baseOp;
        isBaseSlideWrapper = deBaseOp.getPresIsNodeASlideWrapper();
        isBaseDrawFrame = deBaseOp.getPresIsNodeADrawFrame();
      }
      if (isBaseDrawFrame) {
        for (Operation op:ops) {
          conflict = this.checkPresIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      } else if (isBaseSlideWrapper) {
        return this.checkPresSlideMove(baseOps, ops);
      }
    }
    return conflict;
  }
  
  public boolean transMoveMove(List<Operation> baseOps, List<Operation> ops)
  {
	  String val = "found";
	  HashMap<String, String> removedSlides = new HashMap<String, String>();
	  for(int i = 0; i < baseOps.size(); i++)
	  {
		  Operation baseOp = baseOps.get(i);
		  if ( baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
		  {
			  String pId = ((DeleteElementOperation)baseOp).getPresNodeId();
			  if(pId != null && pId != "")
				  removedSlides.put(pId, val);
		  }
	  }
	  
	  for(int i = 0; i < ops.size(); i++)
	  {
		  Operation op = ops.get(i);
		  if ( op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
		  {
			  String pId = ((DeleteElementOperation)op).getPresNodeId();
			  if(pId != null && pId != "")
			  {
				  if(val.endsWith( removedSlides.get(pId)) )
					  return true;
			  }
		  }
	  }
	  
	  return this.transElementElement(baseOps,ops);
  }
  
  public boolean transTaskElement(List<Operation> baseOps, List<Operation> ops) 
  {
	  boolean isReject = false;
	  for (int i = 0; i< baseOps.size(); i++)
	    {
	      Operation baseOp = baseOps.get(i);
	      if ( baseOp.getType().equalsIgnoreCase(Operation.INSERT_TASK))
	      {
		      for (int j=0; j< ops.size(); j++)
		      {
		        Operation op = ops.get(j);
		        if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
		        {
			        if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
			        {
			        	isReject = transInsertTaskInsertElement((TaskOperation) baseOp, (InsertElementOperation)op);
			        	if ( isReject)
			        		return isReject;
			        }  
			        if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
			        {
			            isReject = transInsertTaskDeleteElement((TaskOperation) baseOp, (DeleteElementOperation)op);
			            if ( isReject )
			            	return isReject;
			        }
			     }
		      }     
	      }
	      if ( baseOp.getType().equalsIgnoreCase(Operation.DELETE_TASK))
	      {
	    	  for (int j=0; j< ops.size(); j++)
		      {
		        Operation op = ops.get(j);
		        if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
		        {
			        if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
			        {
			        	isReject = transDeleteTaskInsertElement((TaskOperation) baseOp, (InsertElementOperation)op);
			        	if ( isReject)
			        		return isReject;
			        }  
			        if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
			        {
			            isReject = transDeleteTaskDeleteElement((TaskOperation) baseOp, (DeleteElementOperation)op);
			            if ( isReject )
			            	return isReject;
			        }
			     }
		      }     
	      }
	    }
	  return isReject;
  }

  public boolean checkPresTaskConflict(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      if ( baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {        
        if (baseOp instanceof InsertElementOperation)
        {
          InsertElementOperation baseIEOp = (InsertElementOperation) baseOp;
          if (baseIEOp.getPresIsNodeATask())
          {
            for (int j = 0; j < ops.size(); j++)
            {
              Operation op = ops.get(j);
              if ( op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
              {                
                if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
                {
                  if (op instanceof InsertElementOperation)
                  {
                    InsertElementOperation ieOp = (InsertElementOperation) op;
                    if (ieOp.getPresIsNodeATask())
                    {
                      return true;                  
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return false;
  }
  
  public boolean transElementTask(List<Operation> baseOps, List<Operation> ops) 
  {
	  boolean isReject = false;
	  for (int i = 0; i< baseOps.size(); i++)
	    {
	      Operation baseOp = baseOps.get(i);
	      if ( baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
	      {
		      for (int j=0; j< ops.size(); j++)
		      {
		        Operation op = ops.get(j);
		        if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
		        {
			        if (op.getType().equalsIgnoreCase(Operation.INSERT_TASK))
			        {
			        	isReject = transInsertElementInsertTask( (InsertElementOperation)baseOp, (TaskOperation)op);
			        	if ( isReject)
			        		return isReject;
			        }  
			        if (op.getType().equalsIgnoreCase(Operation.DELETE_TASK))
			        {
			            isReject = transInsertElementDeleteTask((InsertElementOperation) baseOp, (TaskOperation)op);
			            if ( isReject )
			            	return isReject;
			        }
			     }
		      }     
	      }
	      if ( baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
	      {
	    	  for (int j=0; j< ops.size(); j++)
		      {
		        Operation op = ops.get(j);
		        if (baseOp.getTarget().equalsIgnoreCase(op.getTarget()))
		        {
			        if (op.getType().equalsIgnoreCase(Operation.INSERT_TASK))
			        {
			        	isReject = transDeleteElementInsertTask((DeleteElementOperation) baseOp, (TaskOperation)op);
			        	if ( isReject)
			        		return isReject;
			        }  
			        if (op.getType().equalsIgnoreCase(Operation.DELETE_TASK))
			        {
			            isReject = transDeleteElementDeleteTask((DeleteElementOperation) baseOp, (TaskOperation)op);
			            if ( isReject )
			            	return isReject;
			        }
			     }
		      }     
	      }
	    }
	  return isReject;
  }
  
  public boolean transTaskTask(List<Operation> baseOps, List<Operation> ops) 
  {
	boolean isReject = false;
	for (int i = 0; i < baseOps.size(); i++) {
		Operation baseOp = baseOps.get(i);
		for (int j = 0; j < ops.size(); j++) {
			Operation op = ops.get(j);
			if (op.getType().equalsIgnoreCase(Operation.INSERT_TASK)) {
				if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TASK)) {
					isReject = transInsertTaskInsertTask( (TaskOperation) baseOp,(TaskOperation) op);
					if (isReject)
						return isReject;
				}
				if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TASK)) {
					transDeleteTaskInsertTask((TaskOperation) baseOp,(TaskOperation) op);
				}
			}
			if ( op.getType().equalsIgnoreCase(Operation.DELETE_TASK)) {
				if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TASK)) {
					transInsertTaskDeleteTask( (TaskOperation) baseOp,(TaskOperation) op);
				}
				if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TASK)) {
					transDeleteTaskDeleteTask((TaskOperation) baseOp,(TaskOperation) op);
				}
			}
		}
	}
	return isReject;
  }
  
  public boolean transTextStyle(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      
      
      for (int j=0; j< ops.size(); j++)
      {
        Operation op = ops.get(j);
        if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
        {
          InlineStyleOperation newOp = transInsertStyle((InsertTextOperation)baseOp,(InlineStyleOperation)op);          
          if (newOp != null){
        	newOp.setAppend(true);  
            ops.add(newOp);//add new operation created on OT
          }
        }
        else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
        {
          transDeleteStyle((DeleteTextOperation)baseOp,(InlineStyleOperation)op);
        }
      }     
    }    
    return false;
  }
  
  public boolean transStyleStyle(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);     
      
      for (int j=0; j< ops.size(); j++)
      {
        Operation op = ops.get(j);
        boolean rejected = transStyleStyle((InlineStyleOperation)baseOp,(InlineStyleOperation)op);
        if (rejected)
          return rejected;
      }     
    }    
    return false;
  }
  
  public class PresElementType {
    public boolean isDrawFrame;
    public boolean isSlideWrapper;
    public boolean isTextTyping;
    public String presNodeId;
    public String parentId;
    public String presSlideId;
    public String presContentBoxId;
    public boolean isIE;
    public boolean isDE;

    public PresElementType() {
      isDrawFrame = false;
      isSlideWrapper = false;
      isTextTyping = false;
      presNodeId = null;
      parentId = null;
      presSlideId = null;
      presContentBoxId = null;
      isIE = false;
      isDE = false;
    }
  };
  
  private PresElementType getPresElementType(Operation op) {
    PresElementType eType = new PresElementType();
    String type = op.getType();
    if (type.equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
      DeleteElementOperation deleteOp = (DeleteElementOperation)op;
      eType.isDrawFrame = deleteOp.getPresIsNodeADrawFrame();
      eType.isSlideWrapper = deleteOp.getPresIsNodeASlideWrapper();
      eType.isTextTyping = deleteOp.getPresTextTyping();
      eType.presNodeId = deleteOp.getPresNodeId();
      eType.parentId = deleteOp.getParentId();
      eType.presSlideId = deleteOp.getPresSlideId();
      eType.presContentBoxId = deleteOp.getPresContentBoxId();
      eType.isIE = true;
    } else if (type.equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
      InsertElementOperation insertOp = (InsertElementOperation)op;
      eType.isDrawFrame = insertOp.getPresIsNodeADrawFrame();
      eType.isSlideWrapper = insertOp.getPresIsNodeASlideWrapper();
      eType.isTextTyping = insertOp.getPresTextTyping();
      eType.presNodeId = insertOp.getPresNodeId();
      eType.parentId = insertOp.getParentId();
      eType.presSlideId = insertOp.getPresSlideId();
      eType.presContentBoxId = insertOp.getPresContentBoxId();
      eType.isDE = true;
    }
    return eType;
  }
  
  private boolean isSameObjId(String opId, String baseOpId) {
    if (opId == null || baseOpId == null) {
      return false;
    }

    if (!opId.equalsIgnoreCase(baseOpId)) {
      return false;
    } else {
      return true;
    }
  }
  
  private boolean checkPresIEDEConflict(Operation baseOp, Operation op) {
    PresElementType baseElemType = getPresElementType(baseOp);
    PresElementType elemType = getPresElementType(op);
    if (baseElemType.isSlideWrapper) {
      if (elemType.isSlideWrapper) {
        return isSameObjId(elemType.presSlideId, baseElemType.presSlideId);
      } else if (elemType.isDrawFrame) {
        return isSameObjId(elemType.presSlideId, baseElemType.presSlideId);
      } else if (elemType.isTextTyping) {
        return isSameObjId(elemType.presSlideId, baseElemType.presSlideId);
      }
    } else if (baseElemType.isDrawFrame) {
      if (elemType.isSlideWrapper) {
        return isSameObjId(elemType.presSlideId, baseElemType.presSlideId);
      } else if (elemType.isDrawFrame) {
        return isSameObjId(elemType.presNodeId, baseElemType.presNodeId);
      } else if (elemType.isTextTyping) {
        return isSameObjId(elemType.presContentBoxId, baseElemType.presNodeId);
      }
    } else if (baseElemType.isTextTyping) {
      if (elemType.isSlideWrapper) {
        return isSameObjId(elemType.presSlideId, baseElemType.presSlideId);
      } else if (elemType.isDrawFrame) {
        return isSameObjId(elemType.presNodeId, baseElemType.presContentBoxId);
      } else if (elemType.isTextTyping) {
        // For table, rn operation node can be td or tbody
        // So cannot use parent id to avoid conflict. Just use content box id
        return isSameObjId(elemType.presContentBoxId, baseElemType.presContentBoxId);
      }
    }
    
    return false;
  }
  
  public boolean checkPresReplaceReplace(List<Operation> baseOps, List<Operation> ops) {
    boolean conflict = false;
    for (Operation baseOp:baseOps) {
      for (Operation op:ops) {
        conflict = checkPresIEDEConflict(baseOp, op);
        if (conflict) return conflict;
      }
    }
    return conflict;
  }
  
  public boolean checkPresReplaceElement(List<Operation> baseOps, List<Operation> ops) {
    boolean conflict = false;
    for (Operation baseOp:baseOps) {
      for (Operation op:ops) {
        String type = op.getType();
        if (type.equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
          conflict = checkPresIEDEConflict(baseOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  }

  public boolean checkReplaceConflict(List<Operation> baseOps, List<Operation> ops)
  {
    int  baseIndex =-1;
    int  opIndex=-1;
    int  baseDel=0;
    int  opDel=0;
    for (Operation baseop:baseOps){
      if( baseop.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)){
        if(baseIndex==-1){
          baseIndex =((DeleteElementOperation)baseop).getIndex();
        }else if(baseIndex >((DeleteElementOperation)baseop).getIndex()){
          baseIndex =((DeleteElementOperation)baseop).getIndex();
        }
        baseDel =baseDel+ ((DeleteElementOperation)baseop).getLength();
      }      
    }
    for (Operation op:ops){
      if( op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)){
        if(opIndex==-1){
          opIndex =((DeleteElementOperation)op).getIndex();
        }else if(opIndex > ((DeleteElementOperation)op).getIndex()){
          opIndex =((DeleteElementOperation)op).getIndex();
        }
        opDel =opDel+ ((DeleteElementOperation)op).getLength();
      }      
    }
    if( baseIndex== opIndex){
      return true;
    }
    if(baseIndex>opIndex && baseIndex<opIndex+opDel){
      return true;
    }
    if(opIndex>baseIndex && opIndex<baseIndex+baseDel){
      return true;
    }
    return false;
  }
  
  private boolean checkPresAttrWithIEDEConflict(BlockStyleOperation bsOp, Operation op) {
    // op can be ie or de
    PresElementType opType = getPresElementType(op);
    if (opType.isSlideWrapper) {
      // if bsOp for slide, compare two slide id
      // if bsOp for object, also compare slide id
      String bsOpSlideId = bsOp.getPresSlideId();
      String opSlideId = opType.presSlideId;
      if (bsOpSlideId != null && opSlideId != null && 
        bsOpSlideId.equalsIgnoreCase(opSlideId))
        return true;
    } else if (opType.isDrawFrame) {
      // if bsOp for slide, slide id will be null, no conflict
      // if bsOp for object, also compare content box id
      String bsOpContentBoxId = bsOp.getPresContentBoxId();
      // For element message, cannot get content box id by getPresContentBoxId
      // because it is only for messages inner content box
      String opContentBoxId = opType.presNodeId;
      if (bsOpContentBoxId != null && opContentBoxId != null &&
        bsOpContentBoxId.equalsIgnoreCase(opContentBoxId))
        return true;
    } else if (opType.isTextTyping) {
      String bsOpContentBoxId = bsOp.getPresContentBoxId();
      String opContentBoxId = opType.presContentBoxId;
      if (bsOpContentBoxId != null && opContentBoxId != null &&
        bsOpContentBoxId.equalsIgnoreCase(opContentBoxId))
        return true;
    }
    
    return false;
  }

  // Attr can be for slide, object or p
  // Element can be for slide or object
  public boolean checkPresAttrElement(List<Operation> baseOps, List<Operation> ops) {
    boolean conflict = false;
    for (Operation baseOp:baseOps) {
      String baseType = baseOp.getType();
      for (Operation op:ops) {
        String type = op.getType();
        if (baseType.equalsIgnoreCase(Operation.SET_BLOCK_STYLE) &&
          type.equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
          BlockStyleOperation bsOp = (BlockStyleOperation)baseOp;
          conflict = checkPresAttrWithIEDEConflict(bsOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  }
  
  public boolean checkPresAttrReplace(List<Operation> baseOps, List<Operation> ops) {
    boolean conflict = false;
    for (Operation baseOp:baseOps) {
      String baseType = baseOp.getType();
      for (Operation op:ops) {
        if (baseType.equalsIgnoreCase(Operation.SET_BLOCK_STYLE)) {
          BlockStyleOperation bsOp = (BlockStyleOperation)baseOp;
          conflict = checkPresAttrWithIEDEConflict(bsOp, op);
          if (conflict) return conflict;
        }
      }
    }
    return conflict;
  }
  
  public boolean transAttrAttr(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);     
      
      for (int j=0; j< ops.size(); j++)
      {
        Operation op = ops.get(j);
        boolean rejected = transAttrAttr((BlockStyleOperation)baseOp,(BlockStyleOperation)op);
        if (rejected)
          return rejected;
      }     
    }    
    return false;
  }
  
  private List<Integer> getMaxMinIndex(List<Operation> ops) {
    List<Integer> minMax = new ArrayList<Integer>();
    int min = 0, max = 0;
    if (ops.size() == 0)
      return null;
    for (int i = 0; i < ops.size(); i++) {
      Operation op = ops.get(i);
      String type = op.getType();
      if (type.equalsIgnoreCase(Operation.INSERT_ELEMENT)) {
        InsertElementOperation ieOp = (InsertElementOperation)op;
        int index = ieOp.getIndex();
        if ( i == 0) {
          min = index;
          max = index;
        } else {
          if (index < min)
            min = index;
          if (index > max)
            max = index;
        }
      } else if (type.equalsIgnoreCase(Operation.DELETE_ELEMENT)) {
        DeleteElementOperation deOp = (DeleteElementOperation)op;
        int index = deOp.getIndex();
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
    }
    minMax.add(min);
    minMax.add(max);
    return minMax;
  }
  
  public boolean checkPresSlideMove(List<Operation> baseOps, List<Operation> ops) {
    List<Integer> baseOpsMinMaxIndexes = this.getMaxMinIndex(baseOps);
    List<Integer> opsMinMaxIndexes = this.getMaxMinIndex(ops);
    if (baseOpsMinMaxIndexes == null || opsMinMaxIndexes == null)
      return false;
    
    int baseOpsMinIndex = baseOpsMinMaxIndexes.get(0).intValue();
    int baseOpsMaxIndex = baseOpsMinMaxIndexes.get(1).intValue();
    int opsMinIndex = opsMinMaxIndexes.get(0).intValue();
    int opsMaxIndex = opsMinMaxIndexes.get(1).intValue();
    
    // intersection will cause conflict
    if (!(baseOpsMaxIndex < opsMinIndex || baseOpsMinIndex > opsMaxIndex)) {
      return true;
    }

    return false;
  }
  
  public boolean transElementReplace(List<Operation> baseOps, List<Operation> ops)
  {
    int delta = 0;
    int delCnt = 0;
    int delIndex = Integer.MAX_VALUE;
    String tid = null;
    for (Operation op : ops)
    {
      /*
       * only check the delete element and insert element operation for the replace transformation.
       */
     
      if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT) )
      {
        int dellen = ((DeleteElementOperation) op).getLength();
        int delIdx = ((DeleteElementOperation) op).getIndex();
        if (delIdx < delIndex)
        {
          delIndex = delIdx;
        }
        delCnt += dellen;
        delta = delta - dellen;
      }else  if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {
        delta = delta + 1;
      }else{
        continue;
      }
      if (tid == null)
      {
        tid = op.getTarget();
      }
      else if (!op.getTarget().equalsIgnoreCase(tid))
      {
        return true;
      }
    }
    for (int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      if (!baseOp.getTarget().equalsIgnoreCase(tid))
      {
        continue;
      }
      if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {
        InsertElementOperation insertOp = (InsertElementOperation) baseOp;
        if (insertOp.getIndex() > delIndex && insertOp.getIndex() < delCnt + delIndex)
        {
          return true;
        }
        int ret = transInsertElementReplace(insertOp, ops, delta, delIndex, delCnt);       
        delIndex += ret;
      }
      else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
      {
        DeleteElementOperation delOp = (DeleteElementOperation) baseOp;
        if (delOp.getIndex() + delOp.getLength() <= delIndex || delOp.getIndex() >= delCnt + delIndex)
        {
          int r = transDeleteElementReplace(delOp, ops, delta, delIndex, delCnt);
          delIndex = delIndex - r;
        }
        else
        {
          return true;
        }

      }
    }
    return false;
  }
  public boolean transReplaceReplace(List<Operation> baseOps, List<Operation> ops){
    int len =0;
    int idx =0;
    String tid =null;
    for (Operation baseOp : baseOps){
      /*
       * only check the delete element and insert element operation for the replace transformation. 
       */
      if(!baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)&&!baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)){
       continue;
      }
      if(tid==null){
        tid = baseOp.getTarget();
      }else if (!baseOp.getTarget().equalsIgnoreCase(tid)){
        return true;
      }
      if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)){
        int dellen = ((DeleteElementOperation)baseOp).getLength();
        int delIdx = ((DeleteElementOperation)baseOp).getIndex();
        if(delIdx>idx){
          idx= delIdx;
        }
        len = len - dellen;
      }
      if(baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)){
//        int inIdx = ((InsertElementOperation)baseOp).getIndex();
//        if(inIdx>idx){
//          idx= inIdx;
//        }
        len = len + 1;
      }
    }
    if(len==0){
      return false;
    }
    for ( Operation op:ops){
      if(!op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)&&!op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)){
        continue;
       }
      if (!op.getTarget().equalsIgnoreCase(tid)){
        return false;
      }
    }
    for ( Operation op:ops){
      if(op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT)){
        int inIdx = ((InsertElementOperation)op).getIndex();
        if(inIdx>idx){
          ((InsertElementOperation)op).setIndex(inIdx+len);
        }
      }
      if(op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)){
        int inIdx = ((DeleteElementOperation)op).getIndex();
        if(inIdx>idx){
          ((DeleteElementOperation)op).setIndex(inIdx+len);
        }
      }
    }
    return false;
  }
  public boolean checkTableConfilict(List<Operation> baseOps,List<Operation> ops, boolean tableBase)
  {
    boolean isReplace = false;
    List<Operation> targetOps = null;
    if(tableBase)
      targetOps = baseOps;
    else
      targetOps = ops;
    for(int i=0;i<targetOps.size()-1;i++)
    {
      if(targetOps.get(i).getType().equalsIgnoreCase(Operation.DELETE_ELEMENT) &&  targetOps.get(i+1).getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {
        isReplace = true;
        break;
      } 
    }
    if(isReplace)
      return this.checkTargetConflict(baseOps, ops, tableBase);
    
    return false;
  }
  
  public boolean checkSplitJoinTargetConflict(List<Operation> baseOps, List<Operation> ops)
  {
    for (int i = 0; i< baseOps.size(); i++)
    {
       Operation baseOp = baseOps.get(i);
       for (int j=0; j< ops.size(); j++)
       {
         Operation op = ops.get(j);
         if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
         {
           if((op.getType().equalsIgnoreCase(Operation.INSERT_TEXT) || op.getType().equalsIgnoreCase(Operation.DELETE_TEXT)) && baseOp.getTarget().equals(op.getTarget()))
               return true;
           else if(op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
           {
              boolean inList = checkKeyOnList(baseOp.getTarget(), ((DeleteElementOperation) op).getList());
              if (inList)
                return true;
           }
         }         
         else if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
         {
             if((op.getType().equalsIgnoreCase(Operation.DELETE_TEXT) || op.getType().equalsIgnoreCase(Operation.INSERT_TEXT)) && baseOp.getTarget().equals(op.getTarget()))
               return true;
             else if(op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
             {
                boolean inList = checkKeyOnList(baseOp.getTarget(), ((DeleteElementOperation) op).getList());
                if (inList)
                  return true;
             }
         }
         else if(baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT) && (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT) || op.getType().equalsIgnoreCase(Operation.INSERT_TEXT)))
         {
             boolean inList = checkKeyOnList(op.getTarget(), ((DeleteElementOperation) baseOp).getList());
             if (inList)
               return true;
         }
       }     
    }
    return false;
  }

  public boolean checkSplitAttrConflict(List<Operation> baseOps, List<Operation> ops, boolean elementBase)
  {
    if (elementBase)// base message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
        {
          for (int j = 0; j < ops.size(); j++)
          {
            Operation op = ops.get(j);
            boolean inList = ((InsertElementOperation) baseOp).getContent().contains("id="+"\""+op.getTarget()+"\"");
            if (inList)
              return true;
          }
        }
      }
    }
    else// incoming message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          {
            boolean inList = ((InsertElementOperation) op).getContent().contains("id="+"\""+baseOp.getTarget()+"\"");
            if (inList)
              return true;
          }
        }
      }
    }
    return false;    
  }
  
  public boolean checkTargetConflict(List<Operation> baseOps, List<Operation> ops, boolean elementBase)
  {
    if (elementBase)// base message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
        {
          for (int j = 0; j < ops.size(); j++)
          {
            Operation op = ops.get(j);
            boolean inList = checkKeyOnList(op.getTarget(), ((DeleteElementOperation) baseOp).getList());
            if (inList)
              return true;
          }
        }
      }
    }
    else// incoming message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            boolean inList = checkKeyOnList(baseOp.getTarget(), ((DeleteElementOperation) op).getList());
            if (inList)
              return true;
          }
        }
      }
    }
    return false;
  }

  public boolean checkTargetAttrConflict(List<Operation> baseOps, List<Operation> ops, boolean elementBase)
  {
    if (elementBase)// base message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
        {
          for (int j = 0; j < ops.size(); j++)
          {
            BlockStyleOperation op = (BlockStyleOperation) ops.get(j);
            boolean inList = checkKeyOnList(op.getBlockId(), ((DeleteElementOperation) baseOp).getList());
            if (inList)
              return true;
          }
        }
      }
    }
    else// incoming message is element
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
//    	if(!baseOps.get(i).getType().equals(Operation.BLOCK_ID))
//    	{
//    	  continue;
//    	}
    	BlockStyleOperation baseOp = (BlockStyleOperation) baseOps.get(i);
        for (int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            boolean inList = checkKeyOnList(baseOp.getBlockId(), ((DeleteElementOperation) op).getList());
            if (inList)
              return true;
          }
        }
      }
    }
    return false;
  }

  public boolean checkTextAttrConflict(List<Operation> baseOps, List<Operation> ops, boolean textBase)
  {
    if (textBase)// base message is text
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
        {
          for (int j = 0; j < ops.size(); j++)
          {
            boolean inRange = checkKeyOnRange((BlockStyleOperation) ops.get(j), (DeleteTextOperation) baseOp);
            if (inRange)
              return true;
          }
        } else if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
        {
          for (int j = 0; j < ops.size(); j++)
          {
            BlockStyleOperation op = (BlockStyleOperation) ops.get(j);
            int bIdx = ((InsertTextOperation) baseOp).getIndex();
            int bLen = ((InsertTextOperation) baseOp).getLength();
            int idx = op.getIndex();
            if (bIdx <= idx)
              op.setIndex(idx + bLen);
          }
        }
      }
    }
    else // incoming message is text
    {
      for (int i = 0; i < baseOps.size(); i++)
      {
        BlockStyleOperation baseOp = (BlockStyleOperation) baseOps.get(i);
        for (int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          {
            boolean inRange = checkKeyOnRange((BlockStyleOperation) baseOp, (DeleteTextOperation) op);
            if (inRange)
              return true;
          } else if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          {
              int bIdx = baseOp.getIndex();
              int idx = ((InsertTextOperation) op).getIndex();
              int len = ((InsertTextOperation) op).getLength();
              if (idx <= bIdx)
                baseOp.setIndex(bIdx + len);
          }
        }
      }
    }
    return false;
  }
  
  public boolean checkTextSplitConflict(List<Operation> baseOps, List<Operation> ops,boolean textBase)
  {
    InsertElementOperation ieOp = null;
    List<Operation> targetOps = textBase?ops:baseOps;
    for(int i = targetOps.size()-1; i >= 0; i--)
    {
      if(targetOps.get(i).getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {
        ieOp = (InsertElementOperation)targetOps.get(i);
        break;
      }
    }
    if(textBase) //base message is text
    {
      int opsSize = ops.size();
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< opsSize; j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if(op.isAppend()){
            continue;
          }
          if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          { 
            if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
            {
              //if the index of insert or delete text operation is larger than that of split operation,
              //we move the new added text or deleted text to the string of split operation.
              InsertTextOperation newOp = transInsertSplitText((InsertTextOperation)baseOp,(DeleteTextOperation)op,ieOp);              
              if (newOp != null){
            	newOp.setAppend(true);
                ops.add(newOp);//add new operation created on OT
              }
            }
            else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
            {
   
              int baseIdx = ((DeleteTextOperation)baseOp).getIndex();
              int baseLen = ((DeleteTextOperation)baseOp).getLength();
              
              int idx = ((DeleteTextOperation)op).getIndex();
              
              if (baseIdx < idx && idx < baseIdx + baseLen)
              {
                return true;
              } 
              DeleteTextOperation newOp = transDeleteSplitText((DeleteTextOperation)baseOp,(DeleteTextOperation)op,ieOp);
              
              if (newOp != null){
            	 newOp.setAppend(true);
                ops.add(newOp);//add new operation created on OT
              }
            }
          }
        }     
      }
    }
    else
    {
      int baseOpsSize = baseOps.size();
      for (int i = 0; i< baseOpsSize; i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(op.isAppend()){
            continue;
          }
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          {
            if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
            {
              boolean rejected = transSplitInsertText((DeleteTextOperation)baseOp,ieOp,(InsertTextOperation)op);
              if (rejected)
                return rejected;
            }
            else if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
            {
              boolean rejected = transSplitDeleteText((DeleteTextOperation) baseOp,ieOp,(DeleteTextOperation)op);
              if (rejected)
                return rejected;
            }          
          }
        }     
      }
    }
    return false;
  }
  
  public boolean checkElementSplitConflict(List<Operation> baseOps, List<Operation> ops,boolean elementBase)
  {
    if(checkSplitJoinTargetConflict(baseOps,ops))
      return true;
    if(elementBase) //base message is element
    {
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          { 
            if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
            {
              transInsertSplitElement((InsertElementOperation)baseOp,(InsertElementOperation)op);
            }
            else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
            {
              transDeleteInsertElement((DeleteElementOperation)baseOp,(InsertElementOperation)op);
            }
          }
        }     
      }
    }
    else
    {
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          {
            if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
            {
              transInsertInsertElement((InsertElementOperation)baseOp,(InsertElementOperation)op);
            }
            else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
            {
              DeleteElementOperation newOp = transInsertDeleteElement((InsertElementOperation)baseOp,(DeleteElementOperation)op);
              
              if (newOp != null){
            	newOp.setAppend(true);
                ops.add(newOp);//add new operation created on OT
              }
            }          
          }
        }     
      }
    }
    return false;
  }
  
  public boolean checkElementJoinConflict(List<Operation> baseOps, List<Operation> ops,boolean elementBase)
  {
    if(checkSplitJoinTargetConflict(baseOps,ops))
      return true;
    if(elementBase) //base message is element
    {
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          { 
            if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
            {
              DeleteElementOperation newOp = transInsertDeleteElement((InsertElementOperation)baseOp,(DeleteElementOperation)op);
              
              if (newOp != null){
            	newOp.setAppend(true);
                ops.add(newOp);//add new operation created on OT
              }
            }
            else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
            {
              transDeleteDeleteElement((DeleteElementOperation)baseOp,(DeleteElementOperation)op);
            }
          }
        }     
      }
    }
    else
    {
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
            {
              transDeleteInsertElement((DeleteElementOperation)baseOp,(InsertElementOperation)op);
            }
            else if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
            {
              transDeleteDeleteElement((DeleteElementOperation)baseOp,(DeleteElementOperation)op);
            }          
          }
        }     
      }
    }
    return false;
  }
  public boolean  checkTextJoinConflict(List<Operation> baseOps, List<Operation> ops,boolean textBase)
  {
    if(textBase) //base message is text
    {
      int opsSize = ops.size();
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< opsSize; j++)
        {
          Operation op = ops.get(j);
          if(op.isAppend()){
            continue;
          }
          if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          { 
             if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
             {
               InsertTextOperation newOp =  transInsertJoinText((InsertTextOperation)baseOp,(InsertTextOperation)op,baseOp.getTarget().equalsIgnoreCase(op.getTarget()));
               
               if(newOp != null){
            	 newOp.setAppend(true);
                 ops.add(newOp);//add new operation created on OT
               }
             }
             else if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
             {
               DeleteTextOperation newOp = transDeleteJoinText((DeleteTextOperation)baseOp,(InsertTextOperation)op,baseOp.getTarget().equalsIgnoreCase(op.getTarget()));    
              
               if(newOp != null){
            	 newOp.setAppend(true);
                 ops.add(newOp);//add new operation created on OT
               }
             }
          }
        }     
      }
    }
    else
    {
      int baseOpsSize = baseOps.size();
      for (int i = 0; i< baseOpsSize; i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(op.isAppend()){
            continue;
          }
          if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          {
            if (op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
            {
              boolean rejected = transJoinInsertText((InsertTextOperation)baseOp,(InsertTextOperation)op,baseOp.getTarget().equalsIgnoreCase(op.getTarget()));
              if(rejected)
                return true;
            }
            else if (op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
            {
              boolean rejected = transJoinDeleteText((InsertTextOperation)baseOp,(DeleteTextOperation)op,baseOp.getTarget().equalsIgnoreCase(op.getTarget()));
              if(rejected)
                return true;
            }          
          }
        }     
      }
    }
    return false;
  }
  
  public boolean checkStyleSplitConflict(List<Operation> baseOps, List<Operation> ops,boolean styleBase)
  {
    InsertElementOperation ieOp = null;
    List<Operation> targetOps = styleBase?ops:baseOps;
    for(int i = targetOps.size()-1; i >= 0; i--)
    {
      if(targetOps.get(i).getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
      {
        ieOp = (InsertElementOperation)targetOps.get(i);
        break;
      }
    }
    int opsSize = ops.size();
      for (int i = 0; i< baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        for (int j=0; j< opsSize; j++)
        {
          Operation op = ops.get(j);
          if(!baseOp.getTarget().equals(op.getTarget()))
            continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
          {
            if (op.getType().equalsIgnoreCase(Operation.SET_INLINE_STYLE) || op.getType().equalsIgnoreCase(Operation.REMOVE_INLINE_STYLE))
            {
              int baseIdx = ((DeleteTextOperation)baseOp).getIndex();
              int idx = ((InlineStyleOperation)op).getIndex();
              int offset = ((InlineStyleOperation)op).getOffset();
              if(idx+offset <= baseIdx)
                return false;
              //idx+offset > baseIdx
              Tidy tidy = JTidyUtil.getTidy();
              Element element = (Element)XHTMLDomUtil.parseString(tidy, ieOp.getContent(), false);
              if(idx > baseIdx)
              {
                ((InlineStyleOperation)op).setTarget(element.getAttribute("id"));
                ((InlineStyleOperation)op).setIndex(idx-baseIdx);
              }
              else //idx <= baseIdx
              {
                ((InlineStyleOperation)op).setOffset(baseIdx-idx);
                InlineStyleOperation newOp = new InlineStyleOperation();
                newOp.setTarget(element.getAttribute("id"));
                newOp.setType(op.getType());
                newOp.setData(((InlineStyleOperation)op).getData());
                newOp.setOffset(idx+offset-baseIdx);
                newOp.setIndex(0);
                ops.add(newOp);
              }
            }  
          }
          else if(baseOp.getType().equalsIgnoreCase(Operation.SET_INLINE_STYLE) || baseOp.getType().equalsIgnoreCase(Operation.REMOVE_INLINE_STYLE))
          {
             if(op.getType().equalsIgnoreCase(Operation.DELETE_TEXT))
             {
               int baseIdx = ((InlineStyleOperation)baseOp).getIndex();
               int offset = ((InlineStyleOperation)baseOp).getOffset();
               int idx = ((DeleteTextOperation)op).getIndex();
               if(baseIdx+offset <= idx)
                 return false;
               //baseIdx+offset > idx
               InlineStyleOperation newOp = new InlineStyleOperation();
               Tidy tidy = JTidyUtil.getTidy();
               Element element = (Element)XHTMLDomUtil.parseString(tidy, ieOp.getContent(), false);
               newOp.setTarget(element.getAttribute("id"));
               newOp.setType(baseOp.getType());
               newOp.setData(((InlineStyleOperation)baseOp).getData());
               if(baseIdx > idx)
               {
                 newOp.setIndex(baseIdx-idx);
                 newOp.setOffset(offset);
               }
               else //baseIdx <= idx
               {
                 newOp.setIndex(0);
                 newOp.setOffset(baseIdx+offset-idx);
               }
               ops.add(newOp);
             }
          }
        }     
      }
    return false;
  }
  
  public boolean checkStyleJoinConflict(List<Operation> baseOps, List<Operation> ops,boolean styleBase)
  {
    int opsSize = ops.size();
    for (int i = 0; i< baseOps.size(); i++)
    {
       Operation baseOp = baseOps.get(i);
       for (int j=0; j< opsSize; j++)
       {
         Operation op = ops.get(j);
         if(baseOp.getTarget().equals(op.getTarget()))
           continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
          {
            if (op.getType().equalsIgnoreCase(Operation.SET_INLINE_STYLE) || op.getType().equalsIgnoreCase(Operation.REMOVE_INLINE_STYLE))
            {
              int baseIdx = ((InsertTextOperation)baseOp).getIndex();
              int idx = ((InlineStyleOperation)op).getIndex();
              op.setTarget(baseOp.getTarget());
              ((InlineStyleOperation)op).setIndex(idx+baseIdx);
            }  
          }
          else if(baseOp.getType().equalsIgnoreCase(Operation.SET_INLINE_STYLE) || baseOp.getType().equalsIgnoreCase(Operation.REMOVE_INLINE_STYLE))
          {
            if(op.getType().equalsIgnoreCase(Operation.INSERT_TEXT))
            {
              int baseIdx = ((InlineStyleOperation)baseOp).getIndex();
              int offset = ((InlineStyleOperation)baseOp).getOffset();
              int idx = ((InsertTextOperation)op).getIndex();
              InlineStyleOperation newOp = new InlineStyleOperation();
              newOp.setType(baseOp.getType());
              newOp.setTarget(op.getTarget());
              newOp.setData(((InlineStyleOperation)baseOp).getData());
              newOp.setOffset(offset);
              newOp.setIndex(idx+baseIdx);
              ops.add(newOp);
            }
          }
        }     
      }
    return false;
  }
  
  public boolean checkSplitSplitConflict(List<Operation> baseOps, List<Operation> ops)
  {
    if(checkSplitJoinTargetConflict(baseOps,ops))
      return true;
    for (int i = 0; i< baseOps.size(); i++)
    {
       Operation baseOp = baseOps.get(i);
       for (int j=0; j< ops.size(); j++)
       {
         Operation op = ops.get(j);
         if(!baseOp.getTarget().equals(op.getTarget()))
           continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
          {
            if (op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
            {
              transInsertSplitElement((InsertElementOperation)baseOp,(InsertElementOperation)op);
            }  
          }
       }     
    }
    return false;
  }
  
  public boolean checkSplitJoinConflict(List<Operation> baseOps, List<Operation> ops,boolean splitBase)
  {
    if(checkSplitJoinTargetConflict(baseOps,ops))
      return true;
    
    for (int i = 0; i< baseOps.size(); i++)
    {
       Operation baseOp = baseOps.get(i);
       for (int j=0; j< ops.size(); j++)
       {
         Operation op = ops.get(j);
         if(!baseOp.getTarget().equals(op.getTarget()))
           continue;
         if(splitBase)
         {
           if (baseOp.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
           {
             if(op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
             {
               DeleteElementOperation newOp = transInsertDeleteElement((InsertElementOperation)baseOp,(DeleteElementOperation)op);               
               if (newOp != null){
                 newOp.setAppend(true);
                 ops.add(newOp);//add new operation created on OT
                 }
             }
           }
         }
         else
         {
           if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
           {
             if(op.getType().equalsIgnoreCase(Operation.INSERT_ELEMENT))
             {
               transDeleteInsertElement((DeleteElementOperation)baseOp,(InsertElementOperation)op);
             }
           }
         }
       }     
    }
    
    return false;
  }
  
  public boolean checkJoinJoinConflict(List<Operation> baseOps, List<Operation> ops)
  {
    if(checkSplitJoinTargetConflict(baseOps,ops))
      return true;
    for (int i = 0; i< baseOps.size(); i++)
    {
       Operation baseOp = baseOps.get(i);
       for (int j=0; j< ops.size(); j++)
       {
         Operation op = ops.get(j);
         if(!baseOp.getTarget().equals(op.getTarget()))
           continue;
          if (baseOp.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
            {
              transDeleteDeleteElement((DeleteElementOperation)baseOp,(DeleteElementOperation)op);
            }
          }
       }     
    }
    return false;
  }
  public boolean checkListConflict(List<Operation> listOps,List<Operation> ops){
//	  for(int i=0;i< listOps.size();i++){
//		  UpdateListValueOperation listop=(UpdateListValueOperation) listOps.get(i);
//		  String listTid = listop.getListItemId();
//		  String targetId = listop.getTarget();
//		  if((listTid==null||listTid.length()==0)&&(targetId==null || targetId.length()==0)){
//			  continue;
//		  }
//		  for(int j=0;j<ops.size();j++){
//			  Operation op= ops.get(j);
//			  if(op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT)){
//				  DeleteElementOperation dop=(DeleteElementOperation)op;
//				  List<String> elist=dop.getList();
//				  if(elist.contains(listTid)||elist.contains(targetId)){
//					  return true;
//				  }
//			  }
//		  }
//		  
//	  }
	  return false;
  }
  public boolean transStyleText(List<Operation> baseOps, List<Operation> ops)
  {
    // TODO for case of redo insert text and set style, a simple solution might be
    // append the style msg to undo redo msg list
    // Not support for R1
    return false;
  }
}
