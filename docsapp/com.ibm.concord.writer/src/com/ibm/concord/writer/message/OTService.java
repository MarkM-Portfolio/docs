package com.ibm.concord.writer.message;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.writer.message.impl.AddComment;
import com.ibm.concord.writer.message.impl.ApplyStyle;
import com.ibm.concord.writer.message.impl.ArrayOperation;
import com.ibm.concord.writer.message.impl.DeleteElement;
import com.ibm.concord.writer.message.impl.DeleteText;
import com.ibm.concord.writer.message.impl.InsertElement;
import com.ibm.concord.writer.message.impl.InsertText;
import com.ibm.concord.writer.message.impl.KeyOperation;
import com.ibm.concord.writer.message.impl.SetAttribute;
import com.ibm.concord.writer.message.impl.SetList;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class OTService
{
//  private static final OTService _instance = new OTService();

  private static final Logger LOG = Logger.getLogger(OTService.class.getName());
  
  private static void Error(String msg)
  {
    LOG.log( Level.WARNING, "Wrong message Type in OT: " + msg);
  }
  
  public static TransformResult transform(JSONObject msg, JSONArray baseMsgList)
  {
    boolean bRejected = false;
    
    String msgCategory = MessageUtil.getMsgCategory(msg);
    for(int index = 0; index < baseMsgList.size(); index++)
    {
      JSONObject baseMsg = (JSONObject)baseMsgList.get(index);
      String baseMsgCategory = MessageUtil.getMsgCategory(baseMsg);
      // Different message category
      if(msgCategory == null || !msgCategory.equals(baseMsgCategory))
        continue;
      
      String baseMsgType = MessageUtil.getMsgType(baseMsg);
      
//      List<Operation> baseOps = MessageUtil.getOperations(baseMsg);
      // TODO 1. Check reset content message.
      
      if(MessageUtil.MESSAGE_TEXT.equals(baseMsgType))
        bRejected = transTextMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_ELEMENT.equals(baseMsgType))
        bRejected = transElementMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_ATTRIBUTE.equals(baseMsgType))
        bRejected = transAttributeMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(baseMsgType))
        bRejected = transTextAttributeMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_TABLE.equals(baseMsgType))
        bRejected = transTableMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_TEXTCOMMENT.equals(baseMsgType))
        bRejected = transTextCommentMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_LIST.equals(baseMsgType))
        bRejected = transListMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_SECTION.equals(baseMsgType))
        bRejected = transSectionMsg(baseMsg, msg);
//      else if(MessageUtil.MESSAGE_STYLE.equals(baseMsgType))
//        isRejected = transStyleMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_KEY.equals(baseMsgType))
        bRejected = transKeyMsg(baseMsg, msg);
      else if(MessageUtil.MESSAGE_SETTING.equals(baseMsgType))
        bRejected = transSettingMsg(baseMsg, msg);
      
      if (bRejected)
        return TransformResult.CONFLICT;
    }
    
    return TransformResult.ACCEPT;
  }

  /**
   * Get the targetId from operations
   * @param ops
   * @return
   */
  private static List<String> getTargetIds(List<Operation>ops)
  {
    List<String> nodes = new ArrayList<String>();
    
    for(int i = 0; i < ops.size(); i++)
    {
      Operation op = ops.get(i);
      String target = op.getTarget();
      if(target != null)
        nodes.add(target);
    }
    return nodes;
  }
  
  /**
   * Check if these operations is related.
   * @param ops1
   * @param ops2
   * @return
   */
  private static boolean isRelated(List<Operation>ops1, List<Operation>ops2)
  {
    List<String>target1 = getTargetIds(ops1);
    List<String>target2 = getTargetIds(ops2);
    if(target1 == null || target2 == null) 
      return false;
    
    if(target1.size() == 0 || target2.size() == 0)
      return false;
    
    for(int i = 0; i < target1.size(); i++)
    {
      for(int j = 0; j < target2.size(); j++)
        if(target1.get(i).equalsIgnoreCase(target2.get(j)))
          return true;
    }
    
    return false;
  }
  
  /**
   * Transform Text Message & Text Message
   * @param baseOps Action type: InsertText, DeleteText
   * @param ops Action type: InsertText, DeleteText
   * @return
   */
  private static boolean _transTextText(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseOpType = baseOp.getType();
      
      // The ops's size will be changed
      boolean bSkipNewOp = false;
      for (int j = 0; j < ops.size(); j++)
      {
        if(bSkipNewOp)
        {
          bSkipNewOp = false;
          continue;
        }
        Operation op = ops.get(j);
        String opType = op.getType();
        if (Operation.INSERT_TEXT.equalsIgnoreCase(baseOpType))
        {
          InsertText itBaseOp = ((InsertText)baseOp);
          int baseIdx = itBaseOp.getIndex();
          int baseLen = itBaseOp.getLength();
          if(Operation.INSERT_TEXT.equalsIgnoreCase(opType))
          {
            // Case 1: InsertText & InsertText
            InsertText itOp = (InsertText)op;
            int idx = itOp.getIndex();
            int len = itOp.getLength();
            
            if (idx >= baseIdx )//(idx == baseIdx)ab ba issue,first in, first insert,reversed behavior on client
              itOp.setIndex(idx + baseLen);
            else //transform base msg, set trans operation back
              itBaseOp.setIndex(baseIdx + len);
          }
          else if (Operation.DELETE_TEXT.equalsIgnoreCase(opType))
          {
           // Case 2: InsertText & DeleteText
            DeleteText dtOp = (DeleteText)op;
            int idx = dtOp.getIndex();
            int len = dtOp.getLength();
            
            if (idx >= baseIdx )
              dtOp.setIndex(idx + baseLen);
            else
            {
              if (idx + len > baseIdx)//split the delete into two operation
              {
                dtOp.setLength(baseIdx-idx);
                
                DeleteText newDeleteOp = new DeleteText();
                newDeleteOp.setTarget(dtOp.getTarget());
                newDeleteOp.setType(Operation.DELETE_TEXT);
                newDeleteOp.setIndex(idx + baseLen);
                newDeleteOp.setLength(len - baseIdx + idx);
                newDeleteOp.setAppend(true);
                
                ops.add(j + 1, newDeleteOp);
                bSkipNewOp = true;
              }
              else
                itBaseOp.setIndex(baseIdx - len);
            }
          }
          else
            Error("Not text message1");
        }
        else if (Operation.DELETE_TEXT.equalsIgnoreCase(baseOpType))
        {
          DeleteText dtBaseOp = (DeleteText)baseOp;
          int baseIdx = dtBaseOp.getIndex();
          int baseLen = dtBaseOp.getLength();
          if(Operation.INSERT_TEXT.equalsIgnoreCase(opType))
          {
            // Case 3 DeleteText & InsertText
            InsertText itOp = (InsertText)op;
            int idx = itOp.getIndex();
            int len = itOp.getLength();
            
            if ( idx > baseIdx )
            {
              if (idx <= baseIdx + baseLen)
                itOp.setIndex(baseIdx);
              else //if (idx > baseIdx + baseLen)
                itOp.setIndex(idx - baseLen);
            }
            else
              dtBaseOp.setIndex(baseIdx+len);
          }
          else if (Operation.DELETE_TEXT.equalsIgnoreCase(opType))
          {
            // Case 4 DeleteText & DeleteText
            DeleteText dtOp = (DeleteText)op;
            int idx = dtOp.getIndex();
            int len = dtOp.getLength();
            
            if ( idx <= baseIdx )
            {
              if ( idx + len > baseIdx)
              {
                if (idx + len < baseIdx + baseLen)
                  dtOp.setLength(baseIdx - idx);
                else //if (idx + len >= baseIdx + baseLen)
                  dtOp.setLength(len - baseLen);
              }
              else//idx+len<baseIdx
                dtBaseOp.setIndex(baseIdx - len);    
            }
            else //if ( idx > baseIdx )
            {
                if (idx < baseIdx + baseLen)
                {
                  dtOp.setIndex(baseIdx);
                  if (idx + len < baseIdx + baseLen)
                    dtOp.setLength(0);
                  else //if (idx + len >= baseIdx + baseLen)
                    dtOp.setLength(idx + len - baseIdx - baseLen);
                }
                else //if (idx >= baseIdx + baseLen)
                  dtOp.setIndex(idx - baseLen);
            }
          }
          else
            Error("Not text message2");
        }
        else
          Error("Not text message3");
      }
    }
    return false;
  }
  
  /**
   * Transform Text Message & TextAttribute Message
   * @param baseOps Action type: InsertText, DeleteText
   * @param ops Action type: SetTextAttribute
   * @return
   */
  private static boolean _transTextTextAttribute(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseOpType = baseOp.getType();
      
       // The ops's size will be changed
      boolean bSkipNewOp = false;
      for (int j = 0; j < ops.size(); j++)
      {
        if(bSkipNewOp)
        {
          bSkipNewOp = false;
          continue;
        }
        Operation op = ops.get(j);
        String opType = op.getType();

        if(!Operation.SET_TEXT_ATTRIBUTE.equalsIgnoreCase(opType))
          Error("Not Text attribute message.");
        
        ApplyStyle styleOp = (ApplyStyle)op;
        int idx = styleOp.getIndex();
        int len = styleOp.getLength();
        
        if (Operation.INSERT_TEXT.equalsIgnoreCase(baseOpType))
        {
          InsertText itBaseOp = (InsertText)baseOp;
          int baseIdx = itBaseOp.getIndex();
          int baseLen = itBaseOp.getLength();
          
          if ( baseIdx > idx && baseIdx <= idx+len && len > 0)//here is =, for append case
          {
            ApplyStyle newStyleOp = new ApplyStyle();
            newStyleOp.setIndex(baseIdx + baseLen);
            newStyleOp.setLength(len - (baseIdx - idx));
            newStyleOp.setStyles((JSONObject)MessageUtil.deepCopy(styleOp.getStyles()));
            newStyleOp.setTarget(styleOp.getTarget());
            newStyleOp.setType(styleOp.getType());
            newStyleOp.setForAttr(styleOp.isForAttr());
            newStyleOp.setAttrs((JSONObject)MessageUtil.deepCopy(styleOp.getAttrs()));
            ops.add(j + 1, newStyleOp);
            styleOp.setLength(baseIdx - idx);
            bSkipNewOp = true;
          }
          else if( baseIdx <= idx)//#39002 
            styleOp.setIndex(idx + baseLen);
        }
        else if(Operation.DELETE_TEXT.equalsIgnoreCase(baseOpType))
        {
          DeleteText dtBaseOp = (DeleteText)baseOp;
          int baseIdx = dtBaseOp.getIndex();
          int baseLen = dtBaseOp.getLength();

          if ( idx <= baseIdx)
          {
            if (idx + len > baseIdx)
            {
              if (idx + len < baseIdx + baseLen)
                styleOp.setLength(baseIdx - idx);
              else //if (idx + len >= baseIdx + baseLen)
                styleOp.setLength(len - baseLen);
            }
          }
          else //if ( idx >= baseIdx )
          {
              if (idx < baseIdx + baseLen)
              {
                styleOp.setIndex(baseIdx);
                if (idx + len < baseIdx + baseLen)
                {
                  styleOp.setLength(0);
                }
                else //if (idx + len >= baseIdx + baseLen)
                {
                  styleOp.setLength(idx + len - baseIdx - baseLen);
                }
              }
              else //if (idx >= baseIdx + baseLen)
              {
                styleOp.setIndex(idx - baseLen);
              }
          }
        }
        else
          Error("Not text message4");
      }
    }
    
    return false;
  }
  
  /**
   * Transform Text Message & TextComment Message
   * @param baseOps Action type: InsertText, DeleteText
   * @param ops Action type: AddComment, DelComment
   * @return
   * 
   * Same with Text and TextAttribute
   */
  private static boolean _transTextTextComment(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseOpType = baseOp.getType();
      
      int opSize = ops.size();  // The ops's size will be changed
      for (int j = 0; j < opSize; j++)
      {
        Operation op = ops.get(j);
        String opType = op.getType();
        if(Operation.DEL_COMMENT.equalsIgnoreCase(opType))
          continue;
        else if(Operation.ADD_COMMENT.equalsIgnoreCase(opType))
        {
          // Case 1: InsertText & AddComment
          AddComment addComOp = (AddComment)op;
          int idx = addComOp.getIndex();
          int len = addComOp.getLength();
          
          if (Operation.INSERT_TEXT.equalsIgnoreCase(baseOpType))
          {
            InsertText itBaseOp = ((InsertText)baseOp);
            int baseIdx = itBaseOp.getIndex();
            int baseLen = itBaseOp.getLength();
            
            if ( baseIdx > idx && baseIdx < idx+len)//Comments should not append.
              addComOp.setLength(len + baseLen);
            else if( baseIdx <= idx)//#39002 
              addComOp.setIndex(idx + baseLen);
          }
          else if(Operation.DELETE_TEXT.equalsIgnoreCase(baseOpType))
          {
            DeleteText dtBaseOp = (DeleteText)baseOp;
            int baseIdx = dtBaseOp.getIndex();
            int baseLen = dtBaseOp.getLength();
            
            if ( idx <= baseIdx)
            {
              if (idx + len > baseIdx)
              {
                if (idx + len < baseIdx + baseLen)
                  addComOp.setLength(baseIdx - idx);
                else //if (idx + len >= baseIdx + baseLen)
                  addComOp.setLength(len - baseLen);
              }
            }
            else //if ( idx >= baseIdx )
            {
                if (idx < baseIdx + baseLen)
                {
                  addComOp.setIndex(baseIdx);
                  if (idx + len < baseIdx + baseLen)
                  {
                    addComOp.setLength(0);
                  }
                  else //if (idx + len >= baseIdx + baseLen)
                  {
                    addComOp.setLength(idx + len - baseIdx - baseLen);
                  }
                }
                else //if (idx >= baseIdx + baseLen)
                {
                  addComOp.setIndex(idx - baseLen);
                }
            }
          }
          else
            Error("Not text message in _transTextTextComment");
        }
        else
          Error("Not Comment message in _transTextTextComment");
      }
    }
    return false;
  }
  
  /**
   * MESSAGE_TEXT
   * OT Message:    MESSAGE_TEXT, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   * NonOT Message: MESSAGE_ELEMENT, MESSAGE_ATTRIBUTE, MESSAGE_TABLE
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transTextMsg(JSONObject baseMsg, JSONObject msg)
  {
    boolean bReject = false;
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_TEXT.equals(msgType) 
        || MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(msgType)
        || MessageUtil.MESSAGE_TEXTCOMMENT.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      if(!isRelated(baseOps, ops)) 
        return false;
      
      if(MessageUtil.MESSAGE_TEXT.equals(msgType))
        bReject = _transTextText(baseOps, ops);
      else if(MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(msgType))
        bReject = _transTextTextAttribute(baseOps, ops);
      else if(MessageUtil.MESSAGE_TEXTCOMMENT.equals(msgType))
        bReject = _transTextTextComment(baseOps, ops);
      
      if(!bReject){
        MessageUtil.setTransOperations(baseMsg, baseOps);
        MessageUtil.setOperations(msg, ops);
      }
    }
    
    return bReject;
  }
  
  /**
   * Transform Element Message / Table Message & Element Message / Table Message
   * @param baseOps Action type: InsertElement, DeleteElement
   * @param ops Action type: InsertElement, DeleteElement
   *             
   * Table Ops Action Type: SetAttribute, InsertRow, DeleteRow, InsertColumn, DeleteColumn, MergeCells, SplitCells       
   * @return
   */
  private static boolean _transElementElement(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseOpType = baseOp.getType();
      String baseTarget = baseOp.getTarget();
      
      for(int j = 0; j < ops.size(); j++)
      {
        Operation op = ops.get(j);
        if(!baseTarget.equals(op.getTarget()))
          continue;
        
        String opType = op.getType();
        if(Operation.INSERT_ELEMENT.equalsIgnoreCase(baseOpType))
        {
          InsertElement ieBaseOp = (InsertElement) baseOp;
          int baseIdx = ieBaseOp.getIndex();
          if(Operation.INSERT_ELEMENT.equalsIgnoreCase(opType))
          {
            InsertElement ieOp = (InsertElement)op;
            int idx = ieOp.getIndex();
            
            if(idx >= baseIdx)  //(idx == baseIdx)ab ba issue,first in, first insert,reversed behavior on client
              ieOp.setIndex(idx + 1);
            else //transform base msg, set trans operation back
              ieBaseOp.setIndex(baseIdx + 1);
          }
          else if(Operation.DELETE_ELEMENT.equalsIgnoreCase(opType))
          {
            DeleteElement deOp = (DeleteElement)op;
            int idx = deOp.getIndex();
            if(idx < 0)
              continue;
            
            if (idx >= baseIdx )
              deOp.setIndex(idx + 1);
            else
              ieBaseOp.setIndex(baseIdx - 1);
          }
        }
        else if(Operation.DELETE_ELEMENT.equalsIgnoreCase(baseOpType))
        {
          DeleteElement deBaseOp = (DeleteElement)baseOp;
          int baseIdx = deBaseOp.getIndex();
          if(baseIdx < 0)
            break;
          
          if(Operation.INSERT_ELEMENT.equalsIgnoreCase(opType))
          {
            InsertElement ieOp = (InsertElement)op;
            int idx = ieOp.getIndex();
            
            if(idx > baseIdx)
              ieOp.setIndex(idx -1);
            else if(idx == baseIdx)
              ; // No change
            else
              deBaseOp.setIndex(baseIdx + 1);
          }
          else if(Operation.DELETE_ELEMENT.equalsIgnoreCase(opType))
          {
            DeleteElement deOp = (DeleteElement)op;
            int idx = deOp.getIndex();
            if(idx < 0)
              continue;
            
            if(idx < baseIdx)
             deBaseOp.setIndex(baseIdx - 1);
            else if(idx == baseIdx)  // Delete same element
            {
              deOp.setIndex( -1 );  // Set the index to -1.
              deBaseOp.setIndex( -1 );  // Change base OP also so avoid OT with other insert element
            }
            else
              deOp.setIndex(idx - 1);
          }
        }
      }
    }
  
    return false;
  }
  
  /**
   * MESSAGE_ELEMENT
   * OT Message:    MESSAGE_ELEMENT, MESSAGE_TABLE 
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transElementMsg(JSONObject baseMsg, JSONObject msg)
  {
    boolean bReject = false;
    String msgType = MessageUtil.getMsgType(msg);
    
    List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
    List<Operation> ops = MessageUtil.getOperations(msg);
    
    if(MessageUtil.MESSAGE_ELEMENT.equals(msgType)
        || MessageUtil.MESSAGE_TABLE.equals(msgType))
    {
      bReject = _transElementElement(baseOps, ops);
      if(!bReject){
        MessageUtil.setTransOperations(baseMsg, baseOps);
        MessageUtil.setOperations(msg, ops);
        }
    }
    else if(MessageUtil.MESSAGE_TEXT.equals(msgType) ||
        MessageUtil.MESSAGE_ATTRIBUTE.equals(msgType) ||
        MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(msgType) ||
        MessageUtil.MESSAGE_TEXTCOMMENT.equals(msgType) ){
      boolean opChanged = false;
      for(int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        String baseOpType = baseOp.getType();
        if(!Operation.DELETE_ELEMENT.equalsIgnoreCase(baseOpType))
          continue;
        String baseTarget = baseOp.getTarget();
        
        for(int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          if(!baseTarget.equals(op.getTarget()))
            continue;
          String opType = op.getType();
          if(Operation.INSERT_TEXT.equalsIgnoreCase(opType))
          {
            ((InsertText)op).setLength(0);
            opChanged = true;
          }
          else if(Operation.SET_ATTRIBUTE.equalsIgnoreCase(opType))
          {
            ((SetAttribute)op).setAttributes(null);
            ((SetAttribute)op).setStyles(null);
            opChanged = true;
          }
          else if(Operation.SET_TEXT_ATTRIBUTE.equalsIgnoreCase(opType))
          {
            ((ApplyStyle)op).setLength(0);
            opChanged = true;
          }
          else if(Operation.ADD_COMMENT.equalsIgnoreCase(opType))
          {
            ((AddComment)op).setLength(0);
            ((AddComment)op).setPid(null);
            opChanged = true;
          }
        }
      }
      if(opChanged)
        MessageUtil.setOperations(msg, ops);
    }
    
    return bReject;
  }

  private static boolean _checkKeyOnJson(JSONObject obj1, JSONObject obj2)
  {
    if(obj1 == null || obj2 == null)
      return false;
    
    Set<?> keySet = obj1.keySet();
    Iterator<?> iterator = keySet.iterator();
    String key;
    while (iterator.hasNext())
    {
      key = (String) iterator.next();
      if(obj2.containsKey(key))
        return true;
    }
    
    return false;
  }
  
  /**
   * Transform Attribute Message & Attribute Message
   * @param baseOps Action type: SetAttribute
   * @param ops Action type: SetAttribute
   *             
   * @return
   */
  private static boolean _transAttributeAttribute(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseTarget = baseOp.getTarget();
      String baseOpType = baseOp.getType();
      if(!Operation.SET_ATTRIBUTE.equalsIgnoreCase(baseOpType))
      {
        Error("Wrong base Operation type:" + baseOpType + " in SetAttribute Message when OT _transAttributeAttribute.");
        continue;
      }
      
      SetAttribute saBaseOp = (SetAttribute)baseOp;
      JSONObject baseStyles = saBaseOp.getStyles();
      JSONObject baseAtts = saBaseOp.getAttributes();
      
      for(int j = 0; j < ops.size(); j++)
      {
        Operation op = ops.get(j);
        if(!baseTarget.equals(op.getTarget()))
          continue;
        
        if(!Operation.SET_ATTRIBUTE.equalsIgnoreCase(op.getType()))
        {
          Error("Wrong incoming Operation type:" + op.getType() + " in SetAttribute Message when OT _transAttributeAttribute.");
          continue;
        }
        
        SetAttribute saOp = (SetAttribute)op;
        if(_checkKeyOnJson(baseStyles, saOp.getStyles()))
          return true;
        
        if(_checkKeyOnJson(baseAtts, saOp.getAttributes()))
          return true;
      }
    }
    
    return false;
  }
  
  /**
   * MESSAGE_ATTRIBUTE
   * OT Message:    MESSAGE_ATTRIBUTE
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transAttributeMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_ATTRIBUTE.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      
      // Base Operation and Operation will not change. 
      return _transAttributeAttribute(baseOps, ops);
    }
    
    return false;
  }
  
  /**
   * Transform TextAttribute Message & TextAttribute Message
   * @param baseOps Action type: SetAttribute
   * @param ops Action type: SetAttribute
   *             
   * @return
   */
  private static boolean _transTextAttributeTextAttribute(List<Operation>baseOps, List<Operation>ops)
  {
    for(int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      String baseTarget = baseOp.getTarget();
      String baseOpType = baseOp.getType();
      if(!Operation.SET_TEXT_ATTRIBUTE.equalsIgnoreCase(baseOpType))
      {
        Error("Wrong base Operation type:" + baseOpType + " in SetTextAttribute Message when OT _transTextAttributeTextAttribute.");
        continue;
      }
      
      ApplyStyle asBaseOp = (ApplyStyle)baseOp;
      JSONObject baseStyles = asBaseOp.getStyles();
      int baseIdx = asBaseOp.getIndex();
      int baseLen = asBaseOp.getLength();
      
      for(int j = 0; j < ops.size(); j++)
      {
        Operation op = ops.get(j);
        if(!baseTarget.equals(op.getTarget()))
          continue;
        
        if(!Operation.SET_TEXT_ATTRIBUTE.equalsIgnoreCase(op.getType()))
        {
          Error("Wrong incoming Operation type:" + op.getType() + " in SetTextAttribute Message when OT _transTextAttributeTextAttribute.");
          continue;
        }
        
        ApplyStyle asOp = (ApplyStyle)op;
        int idx = asOp.getIndex();
        int len = asOp.getLength();
        if((idx >= baseIdx && idx <= baseIdx + baseLen) || (baseIdx >= idx && baseIdx <= idx + len))
        {
          if(_checkKeyOnJson(baseStyles, asOp.getStyles()))
            return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * MESSAGE_TEXT_ATTRIBUTE
   * OT Message:    MESSAGE_TEXT_ATTRIBUTE
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ATTRIBUTE, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transTextAttributeMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(msgType) || MessageUtil.MESSAGE_TEXT.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      
      if(MessageUtil.MESSAGE_TEXT_ATTRIBUTE.equals(msgType))
        return _transTextAttributeTextAttribute(baseOps, ops);
    }
    
    return false;
  }
  
  /**
   * MESSAGE_TABLE
   * OT Message:    MESSAGE_ELEMENT, MESSAGE_TABLE
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transTableMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_ELEMENT.equals(msgType) || MessageUtil.MESSAGE_TABLE.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      if(MessageUtil.MESSAGE_TABLE.equals(msgType))
      {
        for(int i = 0; i < baseOps.size(); i++)
        {
          Operation baseOp = baseOps.get(i);
          String baseTarget = baseOp.getTableTarget();
          if(baseTarget == null) 
            continue;
          for(int j = 0; j < ops.size(); j++)
          {
           Operation op = ops.get(i);
           if(baseTarget.equalsIgnoreCase(op.getTableTarget()))
             return true;
          }
        }
      }
      else
      {
        boolean  bResult = _transElementElement(baseOps, ops);
        if(bResult)
          return true;
        else
        {
          MessageUtil.setTransOperations(baseMsg, baseOps);
          MessageUtil.setOperations(msg, ops);
        }
      }
    }
    
    
    
    return false;
  }
  
  /**
   * MESSAGE_TEXTCOMMENT
   * OT Message:    MESSAGE_TEXT
   * NonOT Message: MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transTextCommentMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_TEXT.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      for(int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = ops.get(i);
        if(Operation.ADD_COMMENT.equalsIgnoreCase(baseOp.getType()))
        {  
          AddComment acBaseOp = (AddComment)baseOp;
          int baseIdx = acBaseOp.getIndex();
          int baseLen = acBaseOp.getLength();
          String baseTarget = acBaseOp.getTarget();
          for(int j = 0; j < ops.size(); j++)
          {
            Operation op = ops.get(j);
            if(Operation.INSERT_TEXT.equalsIgnoreCase(op.getType()))
            {
              InsertText itOp = (InsertText)op;
              int idx = itOp.getIndex();
              int len = itOp.getLength();
              
              if(!baseTarget.equalsIgnoreCase(itOp.getTarget()))
                continue;
              
              if(idx < baseIdx)
                acBaseOp.setIndex(baseIdx + len);
//              else if(idx < baseIdx + baseLen)  // Insert text conflict with set comments.
//                return true;
            }
            else if(Operation.DELETE_TEXT.equalsIgnoreCase(op.getType()))
            {
              DeleteText dtOp = (DeleteText)op;
              int idx = dtOp.getIndex();
              int len = dtOp.getLength();
              
              if(!baseTarget.equalsIgnoreCase(dtOp.getTarget()))
                continue;
              
              if(idx < baseIdx)
              {
                if(idx + len > baseIdx)
                {
                  acBaseOp.setIndex(idx);
                  int newLen = baseLen + baseIdx - idx;
                  if(newLen < 0)
                    newLen = 0;
                  acBaseOp.setLength(newLen);
                }
                else
                {
                  acBaseOp.setIndex(baseIdx - len);
                }
              }
              else if(idx < baseIdx + baseLen)
              {
                int newLen = 0;
                if(idx + len < baseIdx + baseLen)
                  newLen = baseLen - len;
                else
                  newLen = idx - baseIdx;
                acBaseOp.setLength(newLen);
              }
            }
          }
        }
      }
      
      MessageUtil.setTransOperations(baseMsg, baseOps);
    }
    
    return false;
  }
  
  /**
   * MESSAGE_LIST
   * OT Message:    MESSAGE_LIST
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transListMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_LIST.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      for(int i = 0; i < baseOps.size(); i++)
      {
        SetList baseOp = (SetList)baseOps.get(i);
        String baseNumId = baseOp.getNumId();
        
        for(int j = 0; j < ops.size(); j++)
        {
          SetList op = (SetList)ops.get(j);
          if(baseNumId.equalsIgnoreCase(op.getNumId()))
            return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * MESSAGE_SECTION
   * OT Message:    MESSAGE_SECTION
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_STYLE, MESSAGE_KEY, MESSAGE_SETTING 
   */
  private static boolean transSectionMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if (MessageUtil.MESSAGE_SECTION.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      for(int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        String baseType = baseOp.getType();
        
        String baseTarget = null;
        if(Operation.INSERT_SECTION.equalsIgnoreCase(baseType) || Operation.DEL_SECTION.equalsIgnoreCase(baseType))
          baseTarget = baseOp.getTarget();
        else
          continue;
        
        for(int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          String opType = op.getType();
          
          if(Operation.INSERT_SECTION.equalsIgnoreCase(opType) || Operation.DEL_SECTION.equalsIgnoreCase(opType))
          {
            if(baseTarget.equalsIgnoreCase(op.getTarget()))
              return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * MESSAGE_STYLE
   * OT Message:    MESSAGE_STYLE
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_KEY, MESSAGE_SETTING 
   */
//  private static boolean transStyleMsg(JSONObject baseMsg, JSONObject msg)
//  {
////    String msgType = MessageUtil.getMsgType(msg);
////    if(MessageUtil.MESSAGE_STYLE.equals(msgType))
////    {
////      
////    }
//    // Add style with same style Id will override it. 
//    return false;
//  }
  
  /**
   * MESSAGE_KEY
   * OT Message:    MESSAGE_KEY
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_SETTING 
   */
  private static boolean transKeyMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_KEY.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      for(int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        String baseType = baseOp.getType();
        String keyId = null;
        String arrayKeyId = null;
        if(Operation.INSERT_KEY.equalsIgnoreCase(baseType)
          || Operation.DELETE_KEY.equalsIgnoreCase(baseType)
          || Operation.REPLACE_KEY.equalsIgnoreCase(baseType))
        {
          keyId = ((KeyOperation)baseOp).getKeyId();
        }
        else if(Operation.DELETE_ARRAY.equalsIgnoreCase(baseType)
            || Operation.INSERT_ARRAY.equalsIgnoreCase(baseType))
        {
          arrayKeyId = ((ArrayOperation)baseOp).getKeyId();
        }
        
        for(int j = 0; j < ops.size(); j++)
        {
          Operation op = ops.get(j);
          String opType = op.getType();
          if(keyId != null && (Operation.INSERT_KEY.equalsIgnoreCase(opType)
                                || Operation.DELETE_KEY.equalsIgnoreCase(opType)
                                || Operation.REPLACE_KEY.equalsIgnoreCase(opType)))
            {
              String opKeyId = ((KeyOperation)op).getKeyId();
              if(keyId.equalsIgnoreCase(opKeyId))
                return true;
            }
          else if(arrayKeyId != null && (Operation.DELETE_ARRAY.equalsIgnoreCase(opType)
                                        || Operation.INSERT_ARRAY.equalsIgnoreCase(opType)))
          {
            String opArrayKeyId = ((ArrayOperation)op).getKeyId();
            if(arrayKeyId.equalsIgnoreCase(opArrayKeyId))
              return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * MESSAGE_SETTING
   * OT Message:    MESSAGE_SETTING
   * NonOT Message: MESSAGE_TEXT, MESSAGE_ELEMENT, MESSAGE_TABLE, MESSAGE_ATTRIBUTE, MESSAGE_TEXT_ATTRIBUTE, MESSAGE_TEXTCOMMENT
   *                MESSAGE_LIST, MESSAGE_SECTION, MESSAGE_STYLE, MESSAGE_KEY
   */
  private static boolean transSettingMsg(JSONObject baseMsg, JSONObject msg)
  {
    String msgType = MessageUtil.getMsgType(msg);
    if(MessageUtil.MESSAGE_SETTING.equals(msgType))
    {
      List<Operation> baseOps = MessageUtil.getTransOperatoins(baseMsg);
      List<Operation> ops = MessageUtil.getOperations(msg);
      for(int i = 0; i < baseOps.size(); i++)
      {
        Operation baseOp = baseOps.get(i);
        String baseType = baseOp.getType();
        if(Operation.ADD_EVEN_ODD.equalsIgnoreCase(baseType) || Operation.DEL_SECTION.equalsIgnoreCase(baseType))
        {  
          for(int j = 0; j < ops.size(); j++)
          {
            Operation op = ops.get(j);
            String opType = op.getType();
            
            if(Operation.ADD_EVEN_ODD.equalsIgnoreCase(opType) || Operation.DEL_SECTION.equalsIgnoreCase(opType))
              return true;
          }
        }
      }
    }
    
    return false;
  }
}
