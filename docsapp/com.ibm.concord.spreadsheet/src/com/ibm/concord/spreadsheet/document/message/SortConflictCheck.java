/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import java.util.ArrayList;

import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/* 
 * Sort range vs merge/split cell
 */
public class SortConflictCheck implements ISemanticConflictCheck
{
  private static final String ACTION_TYPE = "sort";
  public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList)
  {
	// check whether the coming message is one sort message
    if(!MessageUtil.isMsgContainAction(jsonMsg, ACTION_TYPE))
      return false;
    boolean ret = false;
    for(int i = 0 ; i < baseJSONMsgList.size(); i++)
    {
        JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
        if (!Transformer.isContentMessage(msg)) 
          continue;
        if (MessageUtil.isMsgContainAction(msg,"merge") || MessageUtil.isMsgContainAction(msg,"split"))
        {
            ret = true;
            break;
        }   
    }
    return ret;
  }

  public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
  {
    // check if there are merge actions
    ArrayList<String> sortRefList = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE);

    ArrayList<String> mergeRefList = new ArrayList<String>();
    for(int i = 0 ; i < baseJSONMsgList.size(); i++)
    {
        JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
        if (!Transformer.isContentMessage(msg)) 
          continue;
        ArrayList<String> tmp = MessageUtil.getRef4Msg(msg,"merge");
        mergeRefList.addAll(tmp);
        tmp = MessageUtil.getRef4Msg(msg,"split");
        mergeRefList.addAll(tmp);
    }

    // translate the refvalue string to token
    ArrayList<Token> sortTokenList = new ArrayList<Token>();
    for(int i = 0; i < sortRefList.size(); i++)      
    {
        Token tk = new Message.Token(sortRefList.get(i), null, null);
        sortTokenList.add(tk);
    }
    ArrayList<Token> mergeTokenList = new ArrayList<Token>();
    for(int i = 0; i < mergeRefList.size(); i++)
    {
        Token tk = new Message.Token(mergeRefList.get(i), null, null);
        mergeTokenList.add(tk);
    }
    for(int i = 0; i < sortTokenList.size(); i++)
    {
        for(int j = 0; j < mergeTokenList.size(); j++)
        {
            if(MessageUtil.isIntersection(sortTokenList.get(i),mergeTokenList.get(j)))
                return TransformResult.CONFLICT;
        }
    }
    return TransformResult.ACCEPT;
  }

}
