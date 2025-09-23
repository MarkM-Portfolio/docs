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

import com.ibm.json.java.JSONObject;

/**
 * @author wangxum@cn.ibm.com
 * 
 */
public interface Data
{
  public void read(JSONObject ob);

  public void write(JSONObject ob);
  
  public boolean checkSuspicious();
}