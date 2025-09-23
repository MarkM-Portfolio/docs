/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf;

import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;

public class WMFHeader extends MetaHeader
{
  boolean placeableWMF;
  
  int left;
  int top;
  int right;
  int bottom;
  
  
  int fileType;
  int headerSize;
  
  int version;
  int fileSize;
  int numOfObj;
  int maxRec;
  int numOfParams;
  
  
  public int getNumOfObj()
  {
    return numOfObj;
  }
  
  
}
