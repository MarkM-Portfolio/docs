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

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.svm2png.svm.cmd.SVMCommandFactory;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.ICommandFactory;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SVMInputStream extends MetaInputStream
{
  Logger log = Logger.getLogger(SVMInputStream.class.getName());
  
  public SVMInputStream(InputStream in, ICommandFactory commandFactory)
  {
    super(in, commandFactory);
  }
  public SVMInputStream(InputStream in)
  {
    this(in, new SVMCommandFactory());
  }
  
  @Override
  protected CommandID readCommandID() throws IOException
  {
    SVMCommandID id = new SVMCommandID();
    
    id.func = readWORD();
    id.version = readWORD();
    id.size = readInt();
    
    return id;
  }

  @Override
  public MetaHeader readHeader() throws IOException
  {
    SVMHeader header = new SVMHeader();
    
    byte[] aCode = new byte[6];
    read(aCode);
    String aCodeStr = new String(aCode);
    if (!aCodeStr.equals("VCLMTF"))
    {
      return null;
    }
    
    header.mnVersion = readWORD();
    header.mnTotalSize = readInt();
    header.stmCompressMode = readInt();
    
    header.version = readWORD();
    header.totalSize = readInt();
    header.meUnit = readWORD();
    int originX = readInt();
    int originY = readInt();
    header.offsetX = -originX;
    header.offsetY = -originY;
    int tmp1, tmp2;
    tmp1 = readInt();
    tmp2 = readInt();
    header.scaleX = (float) tmp1 / (float) tmp2;
    tmp1 = readInt();
    tmp2 = readInt();
    header.scaleY = (float) tmp1 / (float) tmp2;
    byte[] temp = new byte[1];
    read(temp);
    header.mbSimple = temp[0];
    
    header.setWidth(readInt());
    header.setHeight(readInt());
    header.recordCnt = readInt();
    
    return header;
  }

}
