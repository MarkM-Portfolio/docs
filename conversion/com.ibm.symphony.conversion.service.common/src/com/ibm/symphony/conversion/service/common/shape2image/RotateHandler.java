/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

public class RotateHandler implements FuncHandler
{

  public String process(String expr)
  {
    return String.valueOf((-1)*Double.parseDouble((String) (expr)) * 180 / Math.PI);
  }

}
