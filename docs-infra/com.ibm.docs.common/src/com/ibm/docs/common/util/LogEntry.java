/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;


/**
 * @author linfeng_li
 *
 */
public class LogEntry
{
  private String docId;

  private String requestID;

  private String responseID;

  private String msg;

  public LogEntry(String requestID, String msg)
  {
    this(null, requestID, null, msg);
  }

  public LogEntry(String requestID, String responseID, String msg)
  {
    this(null, requestID, responseID, msg);
  }

  public LogEntry(String docId, String requestID, String responseID, String msg)
  {
    this.docId = docId;
    this.requestID = requestID;
    this.responseID = responseID;
    this.msg = msg;
  }

  /*
   * (non-Javadoc)
   *
   * @see java.lang.Object#toString()
   */
  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("Request on HCL Docs Component : ");

    if (docId != null)
    {
      sb.append(" operation on document ");
      sb.append(docId);
    }

    if (requestID != null)
    {
      sb.append(" request ");
      sb.append(this.requestID);
    }

    if (responseID != null)
    {
      sb.append(" response ");
      sb.append(this.responseID);
    }

    if (msg != null && msg.length() > 0)
    {
      sb.append(" with information {");
      sb.append(msg);
      sb.append("}");
    }

    return sb.toString();
  }

}
