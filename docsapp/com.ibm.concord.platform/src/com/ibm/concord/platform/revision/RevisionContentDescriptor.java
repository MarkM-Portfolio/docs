/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.revision;

import com.ibm.json.java.JSONArray;

public class RevisionContentDescriptor
{
  private RevisionDescriptor rd;
  private String basepath;
  private int baseMinorNo;
  private JSONArray deltaList;
 
  public RevisionContentDescriptor(RevisionDescriptor rd, String basepath, int baseMinorNo, JSONArray delta)
  {
    this.rd = rd;
    this.basepath = basepath;
    this.baseMinorNo = baseMinorNo;
    this.deltaList = delta;
  }  
  
  public RevisionDescriptor getRevisionDescriptor()
  {
    return rd;
  }

  public String getBasepath()
  {
    return basepath;
  }

  public int getBaseRevisionNo()
  {
    return baseMinorNo;
  }
  
  public JSONArray getDelta()
  {
    return deltaList;
  }

}
