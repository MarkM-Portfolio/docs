/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

public class ThreadConfig
{
  private static ThreadLocal<String> t_requestID = new ThreadLocal<String>();

  private static ThreadLocal<String> t_responseID = new ThreadLocal<String>();

  public String resquestID;

  public String responseID;

  /**
   * @return the resquestID
   */
  public static String getRequestID()
  {
    return t_requestID.get();
  }

  /**
   * @param requestID
   *          the resquestID to set
   */
  public static void setRequestID(String requestID)
  {
    t_requestID.set(requestID);
  }

  /**
   * @return the responseID
   */
  public static String getResponseID()
  {
    return t_responseID.get();
  }

  /**
   * @param responseID
   *          the responseID to set
   */
  public static void setResponseID(String responseID)
  {
    t_responseID.set(responseID);
  }

  public static void remove()
  {
    t_requestID.remove();
    t_responseID.remove();
  }

}
