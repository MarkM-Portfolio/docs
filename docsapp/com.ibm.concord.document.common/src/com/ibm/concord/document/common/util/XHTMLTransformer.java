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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.concord.platform.util.JTidyUtil;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author qins@cn.ibm.com
 * 
 */
public class XHTMLTransformer
{
  public static final String CMD_RESETCONTENT = "resetContent";
  
  public static final String TEXT_DOCUMENT = "text";
  public static final String PRES_DOCUMENT = "pres";
  
  public final static String CHUNK_ID = "chunkId";

  private static final Logger LOG = Logger.getLogger(XHTMLTransformer.class.getName());


  /**
   * transform a message based on a message list, for XHTML operational transformation
   * 
   * @param msg
   *          message to be transformed
   * @param baseMsgList
   *          base message list
   * @return TRUE if message need to be rejected
   */
  public static TransformResult transformMessage(JSONObject msg, JSONArray baseMsgList, JSONObject context)
  {
    //JSONArray filteredList = findRelatedMsg(msg, baseMsgList);
    JSONArray filteredList = baseMsgList;

    TransformResult conflict = TransformResult.ACCEPT;
//    if (filteredList.size() > 0)
    	conflict = transform(msg, filteredList, context);

      return conflict;
  }

  /**
   * Apply a list of editing messages to XHTML model
   * 
   * @param msgList
   *          message list need to be applied to XHTML model
   * @param is
   *          input stream for base XHTML document
   * @param os
   *          output stream for result XHTML document
   * @throws IOException
   */
  public static void flushMessage(JSONArray msgList, InputStream is, OutputStream os, String caller) throws IOException
  {
    int msgLen = msgList.size();
    if (msgLen == 0)
    {
      FileUtil.copyInputStreamToOutputStream(is, os);
    }
    else
    {
      // FIXME: JTidy has memory leak issue, cannot be used as a static variable
      // have to clean tidy each time it was used.
      Tidy tidy = JTidyUtil.getTidy();

      Document dom = loadDom(tidy, is);
//      if (caller.equals("TextDocumentService"))
//        ListUtil.updateDocument(dom);
      int count = 0;
      while (count < msgLen)
      {
        JSONObject msg = (JSONObject) msgList.get(count);
        count++;
        // filter out lock operations
        if (isLockMsg(msg)) 
        	continue;
        try
        {
          dom = applyMsgToDOM(tidy, msg, dom);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "==Apply message error: ", e);
        }
      }
      msgList.clear();
      MsgListLog.cleanMsgList();
      // flush
      writeDom(tidy, dom, os);
    }
  }

  private static boolean getBooleanByType(JSONObject json, String type)
  {
    Object o = json.get(type);
    return (o != null) ? ((Boolean) o).booleanValue() : false;
  }

  private static boolean isLockMsg(JSONObject msg)
  {
    return getBooleanByType(msg, MessageConstants.IS_ASCONTROL_MSG);
  }

  // check whether it is object content change message on locked object
  private static boolean isConflictMsg(JSONObject msg, JSONObject context)
  {
    boolean ret = false;
    String elementId = MessageHelper.getStringByType(msg, "elemId");
    if (elementId == null) return ret;
    String clientId = MessageHelper.getStringByType(msg, MessageConstants.CLIENT_ID);
    String id = (String) context.get(elementId);
    if (id != null && !clientId.equalsIgnoreCase(id)) // this object is locked but someone else changes it
      ret = true;

    return ret;
  }

  private static TransformResult transformLockMsg(JSONObject msg, JSONObject context, boolean bOT)
  {
    TransformResult conflict = TransformResult.ACCEPT;
    String clientId = MessageHelper.getStringByType(msg, MessageConstants.CLIENT_ID);
    String elementId = MessageHelper.getStringByType(msg, "elemId");
    boolean editMode = getBooleanByType(msg, "editMode");
    boolean bExist = context.containsKey(elementId);

    if (!bOT)
    {
      if (editMode)
      {    	 
        if (!bExist) {
          // in presentation, one user can only lock one object, clean existing ones if necessary
          Iterator iter = context.entrySet().iterator();
          while (iter.hasNext()) {
            java.util.Map.Entry entry = (java.util.Map.Entry) iter.next();
            String id = (String) entry.getValue();
            if (clientId.equalsIgnoreCase(id)) {
              // remove it
              iter.remove();
            }
          }

          context.put(elementId, clientId);
        }
      }
      else
      {
        if (bExist)
          context.remove(elementId);
      }
    }
    else
    {
      // update the client id if there doesn't have conflict or
      // detect whether there has any conflict
      String id = (String) context.get(elementId); // lock owner
      if (editMode)
      {
        if (!bExist) {
          // in presentation, one user can only lock one object, clean existing ones if necessary
          Iterator iter = context.entrySet().iterator();
          while (iter.hasNext()) {
            java.util.Map.Entry entry = (java.util.Map.Entry) iter.next();
            String id2 = (String) entry.getValue();
            if (clientId.equalsIgnoreCase(id2)) {
              // remove it
              iter.remove();
            }
          }

          context.put(elementId, clientId);
        } else
        {
          // if other co-edit user tries to lock the same object, ignore its lock operation
          if (id != null && !clientId.equalsIgnoreCase(id))
            conflict = TransformResult.IGNORE;
        }
      }
      else // unlock event
      {
        if (bExist)
        {
          // only remove it if the unlock operation is sent by lock owner
          if (clientId.equalsIgnoreCase(id))
            context.remove(elementId);
          else if (id != null)
            // if other co-edit tries to lock the same object, do nothing, then unlock, ignore its unlock operation as well
            conflict = TransformResult.IGNORE;
        }
        else
          conflict = TransformResult.IGNORE;
      }
    }

    return conflict;
  }
  
  private static TransformResult transformComments(JSONObject msg, JSONArray baseMsgList)
  {
    if (!MessageHelper.is4AddWarningComment(msg))
      return TransformResult.ACCEPT;

    int length = baseMsgList.size();
    for (int index = 0; index < length; index++)
    {
      JSONObject baseMsg = (JSONObject) baseMsgList.get(index);
      String baseType = MessageHelper.getType(baseMsg);
      if (MessageHelper.COMMENTS.equals(baseType))
      {
        if (MessageHelper.is4AddWarningComment(baseMsg))
        {
          return TransformResult.CONFLICT;
        }
      }
    }
    return TransformResult.ACCEPT;
  }
  
  private static TransformResult transform(JSONObject msg, JSONArray baseMsgList, JSONObject context)
  {
    int length = baseMsgList.size();
    boolean isPres = false;
    if (context != null) {
      String docType = (String)context.get("documentType");
      if (null != docType && docType.equalsIgnoreCase("pres"))
    	  isPres = true;
      // presentation only
      if (isLockMsg(msg))
        return transformLockMsg(msg, context, length != 0);
      if (length != 0) {
        // reject content change operation on the locked object by other user if any
        if (isConflictMsg(msg, context))
          return TransformResult.CONFLICT;
      }
    }

    OTService ot = OTService.getInstance();
    boolean isRejected = false;
    String type = MessageHelper.getType(msg);
    if (MessageHelper.COMMENTS.equals(type))
    {
      return transformComments(msg, baseMsgList);
    }
    List<Operation> ops = MessageHelper.getOperations(msg);//only read/write msg once for transform process
    boolean bTransformed = false;
    for (int index = 0; index < length; index++)
    {
      JSONObject baseMsg = (JSONObject) baseMsgList.get(index);
      String baseType = MessageHelper.getType(baseMsg);
      // type = MessageHelper.getType(msg);

      List<Operation> baseOps = MessageHelper.getTransOperations(baseMsg);
      if (baseOps == null)
        baseOps = MessageHelper.getOperations(baseMsg);
      String baseClientId = (String) baseMsg.get("client_id");
      String msgCliengId = (String) msg.get("client_id");
      if (baseClientId.equals(msgCliengId))
      {
        if (baseType.equalsIgnoreCase(MessageHelper.SPLIT) || baseType.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = transformAppendAction(baseOps, ops, type);
          if (isRejected)
            return TransformResult.CONFLICT;
          MessageHelper.setTransOperations(baseMsg, baseOps);
        }
        continue;
      }
      
      if (!baseClientId.equals(msgCliengId) && ((baseType.equalsIgnoreCase(MessageHelper.RESET_CONTENT) && "yes".equals(baseMsg.get("failover"))) 
          || (baseType.equalsIgnoreCase(CMD_RESETCONTENT) && "yes".equals(baseMsg.get("failover")))
          || (type.equalsIgnoreCase(MessageHelper.RESET_CONTENT) && "yes".equals(msg.get("failover")))
          || (type.equalsIgnoreCase(CMD_RESETCONTENT) && "yes".equals(msg.get("failover")))
          ))
      {
        msg.put(MessageConstants.CONTROL_TYPE, MessageConstants.CONTROL_TYPE_RELOAD);
      }
      
      if(baseType.equalsIgnoreCase(CMD_RESETCONTENT) && type.equalsIgnoreCase(CMD_RESETCONTENT))
    	  return TransformResult.CONFLICT;
      
      if(MessageHelper.getType(baseMsg).equalsIgnoreCase(MessageHelper.OUTLINE)){
    	  return TransformResult.CONFLICT;
      }
      if (!(MessageHelper.getType(baseMsg).equalsIgnoreCase(MessageHelper.TABLE) &&  MessageHelper.getType(msg).equalsIgnoreCase(MessageHelper.TABLE))){
        if(!checkRelated(baseOps, ops))
        {
          if(!(isPres && checkPresRNandA(baseOps, ops)))
            continue;  
        }
      }
      bTransformed = true;
      //check conflict when table operations include moving row/column up/down 
      if((!baseType.equalsIgnoreCase(MessageHelper.TABLE) && type.equalsIgnoreCase(MessageHelper.TABLE)) || (baseType.equalsIgnoreCase(MessageHelper.TABLE) && !type.equalsIgnoreCase(MessageHelper.TABLE)))
      {
        isRejected = ot.checkTableConfilict(baseOps,ops,baseType.equalsIgnoreCase(MessageHelper.TABLE));
        if(isRejected)
          return TransformResult.CONFLICT;
      }
      
      if( baseType.equalsIgnoreCase(MessageHelper.TOC) && type.equalsIgnoreCase(MessageHelper.TOC))
        return TransformResult.CONFLICT; 
      else
      { //for OT
        if( baseType.equalsIgnoreCase(MessageHelper.TOC) )
          baseType = MessageHelper.ELEMENT;
        if( type.equalsIgnoreCase(MessageHelper.TOC) )
          type = MessageHelper.ELEMENT;
      }
      
      if (baseType.equalsIgnoreCase(MessageHelper.TEXT))
      {
        if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
          isRejected = ot.transTextText(baseOps,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
          isRejected = ot.transTextStyle(baseOps,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.ELEMENT)|| type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
        {
          //isRejected = ot.checkTargetConflict(baseOps,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
        {
          isRejected = ot.checkTextAttrConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkTextSplitConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkTextJoinConflict(baseOps,ops,true);
        }
      }
      else if (baseType.equalsIgnoreCase(MessageHelper.ELEMENT) ||
        baseType.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
        baseType.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
        // Text document will set "context" as null
        // Pres/Sheet document will set "context" as a JsonObject including empty object
        // But Sheet document will not call this transformer
        // So can use not null "context" to indicate Pres document
        if (!isPres) {  // text document
          if (type.equalsIgnoreCase(MessageHelper.ELEMENT) ||
            type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
            type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
            if (baseType.equalsIgnoreCase(MessageHelper.REPLACE_NODE) && type.equalsIgnoreCase(MessageHelper.REPLACE_NODE))
            {
              isRejected = ot.checkReplaceConflict(baseOps,ops);
              if (isRejected)
                return TransformResult.CONFLICT;
              isRejected =ot.transReplaceReplace(baseOps, ops);
            } else if (baseType.equalsIgnoreCase(MessageHelper.ELEMENT) && (type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)))
            {
              isRejected = ot.transElementReplace(baseOps, ops);
            }
            else if ((baseType.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || baseType.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))&& type.equalsIgnoreCase(MessageHelper.ELEMENT))
            {
              isRejected = ot.transElementReplace(ops, baseOps);
            }
            else if (baseType.equalsIgnoreCase(MessageHelper.MOVE_SLIDE) && type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
            {
              isRejected = ot.transMoveMove(ops, baseOps);
            }
            else if (type.equalsIgnoreCase(MessageHelper.ELEMENT) && isBaseOperationPresTasked(baseOps))
            {
              isRejected = ot.checkPresTaskConflict(baseOps, ops);
            }
            else
            {
              isRejected = ot.transElementElement(baseOps, ops);
            }
           }
          else if(type.equalsIgnoreCase(MessageHelper.TABLE))
          {
              isRejected = ot.transElementElement(baseOps,ops);
          }
          else if (type.equalsIgnoreCase(MessageHelper.TEXT))
          {
            //isRejected = ot.checkTargetConflict(baseOps,ops,true);
          }
          else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
          {
            isRejected = ot.checkTargetConflict(baseOps,ops,true);
          }
          else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
          {
            isRejected = ot.checkTargetAttrConflict(baseOps,ops,true);
          }
          else if ( type.equalsIgnoreCase(MessageHelper.TASK))
          {
            isRejected = ot.transElementTask(baseOps, ops);
          }
          else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
          {
            isRejected = ot.checkElementSplitConflict(baseOps,ops,true);
          }
          else if(type.equalsIgnoreCase(MessageHelper.JOIN))
          {
            isRejected = ot.checkElementJoinConflict(baseOps,ops,true);
          }
//          else if(type.equalsIgnoreCase(MessageHelper.LIST)){
//            isRejected= ot.checkListConflict(ops, baseOps);
//          }
        } else {  // Pres document
          if (type.equalsIgnoreCase(MessageHelper.ELEMENT) ||
            type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
            type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
            if (baseType.equalsIgnoreCase(MessageHelper.REPLACE_NODE)) {
              if (type.equalsIgnoreCase(MessageHelper.ELEMENT)) {
                isRejected = ot.checkPresReplaceElement(baseOps, ops);
              } else if (type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
                type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
                isRejected = ot.checkPresReplaceReplace(baseOps, ops);
              }
            } else if (baseType.equalsIgnoreCase(MessageHelper.ELEMENT)) {
              if (type.equalsIgnoreCase(MessageHelper.ELEMENT)) {
                isRejected = ot.transPresElementElement(baseOps, ops);
              } else if (type.equalsIgnoreCase(MessageHelper.REPLACE_NODE)) {
                isRejected = ot.checkPresReplaceElement(ops, baseOps);
              }else if (type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
                isRejected = ot.checkPresElementMove(baseOps, ops, true);
              }
            } else if (baseType.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
              if (type.equalsIgnoreCase(MessageHelper.ELEMENT)) {
                isRejected = ot.checkPresElementMove(ops, baseOps, false);
              } else if (type.equalsIgnoreCase(MessageHelper.REPLACE_NODE)) {
                isRejected = ot.checkPresReplaceReplace(baseOps, ops);
              } else if (type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
                isRejected = ot.checkPresSlideMove(baseOps, ops);
              }
            } else if (isBaseOperationPresTasked(baseOps)) {
              if (type.equalsIgnoreCase(MessageHelper.ELEMENT)) {
                isRejected = ot.checkPresTaskConflict(baseOps, ops);
              }
            }
            // if (isRejected)
              // LOG.log(Level.WARNING, "Message is rejected by " + baseType + " and " + type);
          }
          else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE)) {
            if (baseType.equalsIgnoreCase(MessageHelper.ELEMENT)) {
              isRejected = ot.checkPresAttrElement(ops, baseOps);
            } else if (baseType.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
              baseType.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
              isRejected = ot.checkPresAttrReplace(ops, baseOps);
            }
            // if (isRejected)
              // LOG.log(Level.WARNING, "Message is rejected by checkTargetAttrConflict1");
          }
          else if ( type.equalsIgnoreCase(MessageHelper.TASK)) {
            isRejected = ot.transElementTask(baseOps, ops);
          }
        }
      }
      else if (baseType.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
      {
        if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
          isRejected = ot.transStyleStyle(baseOps,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
        	isRejected = ot.transStyleText(baseOps,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.ELEMENT)|| type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
        {
        	isRejected = ot.checkTargetConflict(baseOps,ops,false);
        }
        else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkStyleSplitConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkStyleJoinConflict(baseOps,ops,true);
        }
      }
      else if (baseType.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
      {
        if (!isPres) {  // text document
          if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
          {
            isRejected = ot.transAttrAttr(baseOps,ops);
          }
          else if (type.equalsIgnoreCase(MessageHelper.ELEMENT) || type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
          {
            isRejected = ot.checkTargetAttrConflict(baseOps,ops,false);
          }
          else if (type.equalsIgnoreCase(MessageHelper.TEXT))
          {
            isRejected = ot.checkTextAttrConflict(baseOps,ops,false);
          }
          else if(type.equalsIgnoreCase(MessageHelper.JOIN))
          {
            isRejected = ot.checkTargetConflict(baseOps,ops,false);
          }
          else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
          {
            isRejected = ot.checkSplitAttrConflict(baseOps,ops,false);
          }
        } else {  // Pres document
          if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE)) {
            // Still use original text document logic
            isRejected = ot.transAttrAttr(baseOps,ops);
          } else if (type.equalsIgnoreCase(MessageHelper.ELEMENT)) {
            isRejected = ot.checkPresAttrElement(baseOps,ops);
          } else if (type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) ||
            type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE)) {
            isRejected = ot.checkPresAttrReplace(baseOps,ops);
          }
          // if (isRejected)
            // LOG.log(Level.WARNING, "Message is rejected by " + baseType + " and " + type);
        }
      }
      else if ( baseType.equalsIgnoreCase(MessageHelper.TASK))
      {
    	  if (type.equalsIgnoreCase(MessageHelper.ELEMENT) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.SPLIT) || type.equalsIgnoreCase(MessageHelper.JOIN) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
    	  {
    		  isRejected = ot.transTaskElement(baseOps, ops);
          }
          else if (type.equalsIgnoreCase(MessageHelper.TASK))
    	  {
    		  isRejected = ot.transTaskTask(baseOps, ops);
    	  }
      }
      else if (baseType.equalsIgnoreCase(MessageHelper.TABLE) )
      {
        if(	type.equalsIgnoreCase(MessageHelper.TABLE) )
      	{
      	  isRejected = MessageHelper.getData(baseMsg).equalsIgnoreCase(MessageHelper.getData(msg));
      	}
      	else if(type.equalsIgnoreCase(MessageHelper.ELEMENT) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
      	{
            isRejected = ot.transElementElement(baseOps,ops);
      	}
      	else if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
         	//isRejected = ot.checkTargetConflict(baseOps,ops,true);
        }
      	else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
        	isRejected = ot.checkTargetConflict(baseOps,ops,true);
        }
        else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
        {
        	isRejected = ot.checkTargetAttrConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkElementSplitConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkElementJoinConflict(baseOps,ops,true);
        }
      }
      else if(baseType.equalsIgnoreCase(MessageHelper.SPLIT))
      {
        if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
          isRejected = ot.checkTextSplitConflict(baseOps,ops,false);
        }
        else if(type.equalsIgnoreCase(MessageHelper.ELEMENT) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
        {
          isRejected = ot.checkElementSplitConflict(baseOps,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
          isRejected = ot.checkStyleSplitConflict(baseOps,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
        {
          isRejected = ot.checkSplitAttrConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkSplitSplitConflict(baseOps,ops);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkSplitJoinConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.TASK))
        {
          isRejected = ot.transElementTask(baseOps, ops);
        }
//        else if(type.equalsIgnoreCase(MessageHelper.LIST)){
//        	isRejected= ot.checkListConflict(ops, baseOps);
//        }
      }
      else if(baseType.equalsIgnoreCase(MessageHelper.JOIN))
      {
        if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
          isRejected = ot.checkTextJoinConflict(baseOps,ops,false);
        }
        else if(type.equalsIgnoreCase(MessageHelper.ELEMENT) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE) || type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.MOVE_SLIDE))
        {
          isRejected = ot.checkElementJoinConflict(baseOps,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
          isRejected = ot.checkStyleJoinConflict(baseOps,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
        {
          isRejected = ot.checkTargetConflict(baseOps,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkSplitJoinConflict(baseOps,ops,false);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkJoinJoinConflict(baseOps,ops);
        }
        else if(type.equalsIgnoreCase(MessageHelper.TASK))
        {
          isRejected = ot.transElementTask(baseOps, ops);
        }
//        else if(type.equalsIgnoreCase(MessageHelper.LIST)){
//        	isRejected= ot.checkListConflict(ops, baseOps);
//        }
      }
      else if(baseType.equalsIgnoreCase(MessageHelper.RESET_CONTENT) || baseType.equalsIgnoreCase(CMD_RESETCONTENT))
      {
    	  // Reject other messages
    	  isRejected = true;
      }
//      else if(baseType.equalsIgnoreCase(MessageHelper.LIST)){
//    	  if(type.equalsIgnoreCase(MessageHelper.ELEMENT)
//    			  ||type.equalsIgnoreCase(MessageHelper.REPLACE_NODE)
//    			  ||type.equalsIgnoreCase(MessageHelper.SPLIT)
//    			  ||type.equalsIgnoreCase(MessageHelper.JOIN)){
//    		  isRejected = ot.checkListConflict(baseOps, ops);
//    	  }
//      }
      
      if (isRejected) {
        // LOG.log(Level.WARNING, "baseMsg" + baseMsg.toString());
        // LOG.log(Level.WARNING, "currentMsg" + msg.toString());
        return TransformResult.CONFLICT;
      }
      MessageHelper.setTransOperations(baseMsg, baseOps);
    }
    if(bTransformed)
      MessageHelper.setOperations(msg, ops);
    return TransformResult.ACCEPT;

  }

  private static boolean checkPresRNandA(List<Operation> baseOps, List<Operation> ops)
  {
    OTService ot = OTService.getInstance();
    boolean conflict = ot.checkPresAttrElement(baseOps, ops) || ot.checkPresAttrElement(ops, baseOps);
    return conflict;
  }

  private static boolean isBaseOperationPresTasked(List<Operation> baseOps)
  {
    for (int i = 0; i < baseOps.size(); i++)
    {
      Operation baseOp = baseOps.get(i);
      if (baseOp instanceof InsertElementOperation)
      {
        InsertElementOperation baseIEOp = (InsertElementOperation) baseOp;
        if (baseIEOp.getPresIsNodeATask())
        {
          return true;
        }
      }
    }
    return false;
  }
  private static boolean transformAppendAction(List<Operation>baseOps,List<Operation>ops,String type){
    boolean isRejected=false;
    OTService ot = OTService.getInstance();
    List<Operation> appendOperationList = new ArrayList<Operation>();
    for(Operation operation : baseOps){
        if(operation.isAppend){
            appendOperationList.add(operation);
        }
    }
    if(appendOperationList.size()==0){
        return isRejected;
    }
    for( Operation operation: appendOperationList){
        List<Operation> tempList = new ArrayList<Operation>();
        tempList.add(operation);
        if(!checkRelated(tempList, ops)){
          continue;
        }
        if(type.equalsIgnoreCase(MessageHelper.SPLIT))
        {
          isRejected = ot.checkTextSplitConflict(tempList,ops,true);
        }
        else if(type.equalsIgnoreCase(MessageHelper.JOIN))
        {
          isRejected = ot.checkTextJoinConflict(tempList,ops,true);
        }else if (type.equalsIgnoreCase(MessageHelper.TEXT))
        {
          isRejected = ot.transTextText(tempList,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.INLINE_STYLE))
        {
          isRejected = ot.transTextStyle(tempList,ops);
        }
        else if (type.equalsIgnoreCase(MessageHelper.ELEMENT)|| type.equalsIgnoreCase(MessageHelper.TABLE) || type.equalsIgnoreCase(MessageHelper.REPLACE_NODE))
        {
          //isRejected = ot.checkTargetConflict(tempList,ops,false);
        }
        else if (type.equalsIgnoreCase(MessageHelper.BLOCK_STYLE))
        {
          isRejected = ot.checkTextAttrConflict(tempList,ops,true);
        }
    }
    return isRejected;
  }
  private static boolean checkRelated(List<Operation> ops1, List<Operation> ops2){
    List<String> target1 = MessageHelper.getTargetNodes(ops1);
    List<String> target2 = MessageHelper.getTargetNodes(ops2);
    if(target1 == null || target2 == null)
      return false;
    
    if (target1.size() == 0 || target2.size() == 0)
      return false;
    for (int i = 0; i < target1.size(); i++)
    {
      for (int j = 0; j < target2.size(); j++)
      {
        if (target1.get(i).equalsIgnoreCase(target2.get(j)))
          return true;
      }
    }
    
//    if (MessageHelper.getType(msg1).equalsIgnoreCase(MessageHelper.TABLE) && 
//            MessageHelper.getType(msg2).equalsIgnoreCase(MessageHelper.TABLE) )
//    {
//        return true;//same smarttable
//    }

    return false;
  }
  private static boolean checkRelated(JSONObject msg1, JSONObject msg2)
  {
    // check target nodes of all actions
    List<String> target1 = MessageHelper.getTargetNodes(msg1);
    List<String> target2 = MessageHelper.getTargetNodes(msg2);
    if (target1.size() == 0 || target2.size() == 0)
      return false;
    for (int i = 0; i < target1.size(); i++)
    {
      for (int j = 0; j < target2.size(); j++)
      {
        if (target1.get(i).equalsIgnoreCase(target2.get(j)))
          return true;
      }
    }
    
    if (MessageHelper.getType(msg1).equalsIgnoreCase(MessageHelper.TABLE) && 
    		MessageHelper.getType(msg2).equalsIgnoreCase(MessageHelper.TABLE) )
    {
    	return true;//same smarttable
    }

    return false;
  }
/*
  private static JSONArray findRelatedMsg(JSONObject msg, JSONArray baseMsgList)
  {
	JSONArray msgList = new JSONArray();

    for (int i = 0; i < baseMsgList.size(); i++)
    {
      JSONObject compareMsg = (JSONObject) baseMsgList.get(i);
      boolean isRelated = checkRelated(msg, compareMsg);
      if (isRelated)
        msgList.add(compareMsg);
    }
    return msgList;
  }
*/
  private static Document loadDom(Tidy tidy, InputStream is)
  {
    Document dom = tidy.parseDOM(is, null);
    return dom;
  }

  private static void writeDom(Tidy tidy, Document dom, OutputStream os)
  {
	   tidy.pprint(dom, os);
  }
  
  public static void filterAttribute(Node node)
  {
    if (node instanceof Element)
    {
      Element e = (Element) node;
      /* data-cke-expando is a runtime attribute, should not be saved */
      e.removeAttribute("data-cke-expando");

      Node child = e.getFirstChild();
      while (child != null)
      {
        filterAttribute(child);
        child = child.getNextSibling();
      }
    }
    return;
  }
  
  private static Document applyMsgToDOM(Tidy tidy, JSONObject msg, Document dom) throws UnsupportedEncodingException
  {
    //TODO, add new operation for special message
	// Document content reset message has been renamed to MessageHelper.RESET_CONTENT .
    if (MessageHelper.getType(msg) != null && MessageHelper.getType(msg).equalsIgnoreCase(CMD_RESETCONTENT))
    {
      try
      {
        String data = MessageHelper.getData(msg);
        StringBuilder sb = new StringBuilder();
        boolean processed = ACFUtil.process(data, sb);
        if(processed) {
          LOG.warning("==found suspicious content: " + data);
        }
        data = sb.toString();
//        if (ACFUtil.suspiciousHtml(data))
//        {
//          LOG.warning("malicious html fragment detected in reset content message.");
//          return dom;
//        }

        // flush new content
        File tempFile = File.createTempFile("concord", null);
        FileOutputStream fos = new FileOutputStream(tempFile);
        byte[] buf = data.getBytes("UTF-8");
        fos.write(buf);
        fos.close();
        FileInputStream fis = new FileInputStream(tempFile);
        // load dom again;
        dom = loadDom(tidy, fis);
        filterAttribute(dom.getDocumentElement());
        fis.close();
        tempFile.delete();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Error writing file, ", e);
      }
      return dom;
    }

    List<Operation> ops = MessageHelper.getOperations(msg);
    // *temp code*, handle atom message only
    if (ops == null || ops.size() == 0)
      return dom;
    
    InsertPos insertPos=null;
    for (int opIndex = 0; opIndex < ops.size(); opIndex++)
    {
      Operation op = ops.get(opIndex);
      if(insertPos!=null&&(op instanceof InsertTextOperation))
      {
    	  ((InsertTextOperation)op).setInsertPos(insertPos);
    	  insertPos=null;
      }
      
      String type = op.getType();
      if(type.equals(Operation.INSERT_TEXT))
      {
        List<InsertTextData> cnts = ((InsertTextOperation)op).getContents(); 
        for (int i = 0; i < cnts.size(); i++)
        {
          InsertTextData data = cnts.get(i);
          String text = data.getContent();
          if (ACFUtil.suspiciousHtml(text))
          {
            LOG.warning("malicious html fragment detected in insert text message. ");
            return dom;
          }
        }
      }
      else if(type.equals(Operation.INSERT_ELEMENT))
      {
        String text = ((InsertElementOperation)op).getContent();
//        if (ACFUtil.suspiciousHtml(text))
//        {
//          LOG.warning("malicious html fragment detected in insert element message. ");
//          return dom;
//        }
      }     
      else if(type.equals(Operation.SET_INLINE_STYLE) )
      {
        Data data = ((InlineStyleOperation)op).getData();
        if( data.checkSuspicious() )
        {
          LOG.warning("malicious attribute fragment detected in inline style message. ");
          return dom;
        }
      }
      else if(type.equals(Operation.SET_BLOCK_STYLE))
      {
        Data data = ((BlockStyleOperation)op).getData();
        if(data.checkSuspicious())
        {
          LOG.warning("malicious attribute fragment detected in attribute message. " );
          return dom;
        }
      }
      
      try
      {
    	  MsgListLog.pushMsg(msg);
        //op.apply(tidy, dom);
        //long pre = System.nanoTime();
    	Document applyDom = op.apply(dom, tidy);
    	//long delta = System.nanoTime() - pre;
    	// The dom has been changed, for reset content operation
    	if(applyDom != dom )
    		return applyDom;
      }
      catch (Exception e)
      {
    	  String errmessage = "==Apply message error:";
    	  LOG.log(Level.WARNING, errmessage, e);
      }
      if(insertPos==null&&(op instanceof DeleteTextOperation)&&((DeleteTextOperation)op).getInsertPos()!=null)
      {
   		insertPos=((DeleteTextOperation)op).getInsertPos();
      }
    }
    return dom;
  }
  
  public static void getSection(JSONArray msgList, InputStream is, OutputStream os, String sectionId, String masterDoc)
  {
    Tidy tidy = JTidyUtil.getTidy();
    Document dom = loadDom(tidy, is);
    while (msgList.size() > 0)
    {
      JSONObject msg = (JSONObject) msgList.remove(0);
      try
      {
        dom = applyMsgToDOM(tidy, msg, dom);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "==Apply message error in Section" , e);
      }
    }
    MsgListLog.cleanMsgList();
    NodeList heads = dom.getElementsByTagName("head");
    int headNum = heads.getLength();
    for (int i = 0; i < headNum; i++)
    {
      Element head = (Element)heads.item(i);
      NodeList links = head.getElementsByTagName("link");
      int linkNum = links.getLength();
      if (linkNum > 0)
      { // defect 41525, copy the links into fragment document
        Element newHead = (Element)head.cloneNode(false);
        for (int j = 0; j< linkNum; j++)
        {
          Element link = (Element)links.item(j);
          if (link.getAttribute("type").equalsIgnoreCase("text/css"))
            newHead.appendChild(link.cloneNode(true));
        }
        tidy.pprint(newHead, os);
      }
    }
    
    // flush section node
    Element e = dom.getDocumentElement();
    
    // create a body element
    NodeList bodies = e.getElementsByTagName("body");
    int bodyNum = bodies.getLength();
    if (bodyNum !=0)
    {
      Element body = (Element)bodies.item(0).cloneNode(false);
      NamedNodeMap attrs = body.getAttributes();
      int attrNum = attrs.getLength();
      for (int k = attrNum-1; k >= 0; k--)
      {
        String attrName = attrs.item(k).getNodeName();
        // defect 43279
        // the style class must be copied 
        // or else the style of the private document is incorrect
        if (!attrName.equalsIgnoreCase("class"))
          body.removeAttribute(attrName);
        else
        {
          String classStr = body.getAttribute("class");
          String[] classes = classStr.split(" ");
          String styleClass = null;
          for (int m = 0; m < classes.length; m++)
          {
            String className = classes[m];
            if (className.startsWith("concord_Doc_Style_"))
            {
              styleClass = className;
              break;
            }
          }
          if (styleClass != null)
            body.setAttribute(attrName, styleClass);
          else
            body.removeAttribute(attrName);
        }
      }
      body.setAttribute("taskid", sectionId);
      if (masterDoc != null)
        body.setAttribute("masterdoc", masterDoc);
      List<Element> elements = XHTMLDomUtil.getElementsbyClass(e, "reference");
      // insert new node
      for (int i = 0; i < elements.size(); i++)
      {
        Element element = elements.get(i);
        String task_id = element.getAttribute("task_id");
        if (task_id != null && task_id.equalsIgnoreCase(sectionId))
        {
          // remove comments icon
          if (!filterElement(element, false, true, false))
          {
            Node nextNode = element.getFirstChild();
            while (nextNode != null)
            {
              Node node = nextNode;
              nextNode = node.getNextSibling();
              //tidy.pprint(node, os);
              body.appendChild(node.cloneNode(true));
            }        
          }
          break;
        }
      }     
      tidy.pprint(body, os);
    }   
  }
  
  public static boolean filterElement(Node oNode, boolean bReassignId, boolean bFilterComment, boolean bFilterTask, String type){
	if (type == null)
     type = TEXT_DOCUMENT;
    else if (!type.equals(PRES_DOCUMENT))
      type = TEXT_DOCUMENT;
    if (oNode.getNodeType() != Node.ELEMENT_NODE){
    	return false;
    }
   
    Element element = (Element) oNode;

    if (bFilterTask){
      if (type.equals(TEXT_DOCUMENT)){
        if (element.getTagName().equalsIgnoreCase("fieldset")){
          Element fieldset = element;
          Element reference = (Element) fieldset.getLastChild().getPreviousSibling();
          Node node = reference.getFirstChild();
          if (node != null){
            Node parent = fieldset.getParentNode();
            while (node != null)
            {
                Node next = node.getNextSibling();
                if (!filterElement(node, bReassignId, bFilterComment, bFilterTask))
                  reference.removeChild(node);
                parent.insertBefore(node, fieldset);
                node = next;
            }
            parent.removeChild(fieldset);
          }
 
          return true; // removed
        }
      }
        else if (type.equals(PRES_DOCUMENT)){
        	//remove div with class contains "taskContainer"
        	Element divElement = element;
        	String classValue = "taskContainer";
            // only compare if the attribute existing
            if (XHTMLDomUtil.hasAttribute(element, "class") || XHTMLDomUtil.hasAttribute(element, "id")){
            	if((null != element.getAttribute("class") && element.getAttribute("class").indexOf(classValue)>=0)){
            		Node parent = divElement.getParentNode();
            		parent.removeChild(element);
            		return true;
            	}
            }
        }
      }
    
    if (bFilterComment){
      if (type.equals(TEXT_DOCUMENT))
      {
        if (XHTMLDomUtil.hasAttribute(element, "commentid"))
        {
          if (element.getTagName().equalsIgnoreCase("IMG")){
            element.getParentNode().removeChild(element);
            return true; // removed
          }
          else
            element.removeAttribute("commentid");
        }
      }
      else if (type.equals(PRES_DOCUMENT))
      {
        if (XHTMLDomUtil.hasAttribute(element, "commentsid"))
        {
          element.removeAttribute("commentsid");
        }
        if (XHTMLDomUtil.hasAttribute(element, "comments"))
        {
          element.removeAttribute("comments");
        }
      }
    }
    
    if (bReassignId){
      if (element.hasAttribute("id"))
        element.setAttribute("id", UUID.randomUUID().toString());
    }
    
    if (element.hasChildNodes())
    {
      Node node = element.getFirstChild();
      while (node != null)
      {
        Node nextNode = node.getNextSibling();
        filterElement(node, bReassignId, bFilterComment, bFilterTask, type);
        node = nextNode;
      }
    }
    
    return false;    
  }
  
  // return if this node is filtered
  public static boolean filterElement(Node oNode, boolean bReassignId, boolean bFilterComment, boolean bFilterTask){   
    return filterElement(oNode, bReassignId, bFilterComment, bFilterTask, TEXT_DOCUMENT);
  }

}
