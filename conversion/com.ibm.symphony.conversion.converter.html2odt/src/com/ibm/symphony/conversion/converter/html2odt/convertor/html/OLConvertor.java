/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;


public class OLConvertor extends GeneralListConvertor
{
  public OLConvertor()
  {
    super(new ListStyle.Type[]{new ListStyle.Type(),new ListStyle.Type("lst-la"),new ListStyle.Type("lst-lr"),new ListStyle.Type(),new ListStyle.Type("lst-la"),new ListStyle.Type("lst-lr"),new ListStyle.Type(),new ListStyle.Type("lst-la"),new ListStyle.Type("lst-lr"), new ListStyle.Type()});
  }
}
