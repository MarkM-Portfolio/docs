package com.ibm.concord.writer.message;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.writer.LogPurify;
import com.ibm.concord.writer.WriterDocumentModel;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author xuezhiy@cn.ibm.com
 * 
 */
public class Transformer
{
  private static final Logger LOG = Logger.getLogger(Transformer.class.getName());

  public static void flushMessage(DraftDescriptor draftDes, JSONArray msgList) throws Exception
  {
    if (msgList.size() == 0)
    {
      return;
    }

    WriterDocumentModel model = applyMessage(new WriterDocumentModel(draftDes), msgList);
    if (model != null)
      model.toJson();
  }

  public static WriterDocumentModel applyMessage(WriterDocumentModel docModel, JSONArray msgList)
  {
    while (msgList.size() > 0)
    {
      JSONObject msg = (JSONObject) msgList.remove(0);
      String msgCategory = MessageUtil.getMsgCategory(msg);

      JSONObject contentObj = null;
      if (MessageUtil.CATEGORY_STYLE.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getStyles();
      else if (MessageUtil.CATEGORY_LIST.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getNumbering();
      else if (MessageUtil.CATEGORY_SETTING.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getSettings();
      else if (MessageUtil.CATEGORY_RELATION.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getRelations();
      else if (MessageUtil.CATEGORY_FOOTNOTES.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getFootnotes();
      else if (MessageUtil.CATEGORY_ENDNOTES.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getEndnotes();
      else if(MessageUtil.CATEGORY_META.equalsIgnoreCase(msgCategory))
        contentObj = docModel.getMeta();
      else
        contentObj = docModel.getContent();

      // TODO Apply reset content message.
      
      if (contentObj == null)
      {
        LOG.log(Level.SEVERE, "==Apply message error: The orig JSON object is null for msg cate: " + msgCategory);
      }
      
      List<Operation> ops = MessageUtil.getOperations(msg);

      if (ops == null || ops.size() == 0)
        continue;

      for (int opIndex = 0; opIndex < ops.size(); opIndex++)
      {
        Operation op = ops.get(opIndex);

        try
        {
          op.apply(contentObj);
        }
        catch (Exception e)
        {
        	String msgString = (msg != null) ? LogPurify.purify(msg) : " null";
            LOG.log(Level.SEVERE, "==Apply message error: " + "opIndex: " + opIndex + " msg:\n" +  msgString, e);
        }
      }
    }

    return docModel;
  }
}
