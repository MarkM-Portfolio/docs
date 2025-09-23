/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm;

import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;

public class SVMHeader extends MetaHeader
{ 
  public int stmCompressMode;
  public int mnVersion;
  public int mnTotalSize;
  public int version;
  public int totalSize;
  public int meUnit;
  public int offsetX;
  public int offsetY;
  public float scaleX;
  public float scaleY;
  public byte mbSimple;
  public int recordCnt;
  
}
