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
import java.util.logging.Logger;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;

import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONObject;

public class ResetContentOperation extends Operation {

	private static final Logger LOG = Logger.getLogger(ResetContentOperation.class.getName());
	
	private String data; 
	private Document applyDom = null;
	@Override
	public void apply(Tidy tidy, Document dom) throws Exception {
		if (ACFUtil.suspiciousHtml(data))
		{
			LOG.warning("malicious html fragment detected: " + data);
			return ;
		}

		// flush new content
		File tempFile = null;
		FileOutputStream fos = null;
		FileInputStream fis = null;
		try
		{
			tempFile = File.createTempFile("concord", null);
			fos = new FileOutputStream(tempFile);
			byte[] buf = data.getBytes("UTF-8");
			fos.write(buf);
			fis = new FileInputStream(tempFile);
			// load dom again;
			dom = tidy.parseDOM(fis, null);
			XHTMLTransformer.filterAttribute(dom.getDocumentElement());
			
			this.applyDom = dom;
		}
		catch(Exception e)
		{
			
		}
		finally{
			if(fos != null)
				fos.close();
			if(fis != null)
				fis.close();
			if(tempFile != null)
				tempFile.delete();
		}
	}

  @Override
  public boolean read(JSONObject update)
  {
	  try{
		  setType(update.get(TYPE).toString());
		  setTarget("");
		  setContent(MessageHelper.getData(update));
		  return true;
	  }
	  catch(Exception e)
	  {
		  return false;
	  }
  }

  @Override
  public JSONObject write()
  {
	// Don't need to generate Reset content message in server side
	JSONObject update = new JSONObject();

    update.put(TYPE, getType());
    update.put(TARGET, getTarget());
    update.put(MessageHelper.DATA, this.data);
    return update;
  }
  
  protected Document getApplyDom()
  {
	  return this.applyDom;
  }
  
  public void setContent(String cnt)
  {
    StringBuilder sb = new StringBuilder();
    boolean processed = ACFUtil.process(cnt, sb);
    if(processed) {
      LOG.warning("==found suspicious content: " + cnt);
    }
	this.data = sb.toString();
  }

  public String getContent()
  {
	  return this.data;
  }
}
