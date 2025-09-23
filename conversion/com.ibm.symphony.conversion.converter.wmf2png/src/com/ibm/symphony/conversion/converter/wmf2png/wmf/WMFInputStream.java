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

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd.WMFCommandFactory;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.ICommandFactory;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class WMFInputStream extends MetaInputStream
{
  private static final int SIZE = 512;
  Logger log = Logger.getLogger(WMFInputStream.class.getName());
  private boolean foundEOFCommand = false;
  
  public WMFInputStream(InputStream in, ICommandFactory commandFactory)
  {
    super(in, commandFactory);
  }
  public WMFInputStream(InputStream in)
  {
    this(in, new WMFCommandFactory());
  }
  

  @Override
  protected CommandID readCommandID() throws IOException
  {
    if( foundEOFCommand )
      return null;
    
    WMFCommandID id = new WMFCommandID();
    
    id.size = readDWORD();
    id.func = readWORD();
    
    if( id.func == 0 ) // EOF Command
    {
      foundEOFCommand = true;
    }
    
    return id;
  }

  @Override
  public MetaHeader readHeader() throws IOException
  {
    WMFHeader header = new WMFHeader();
    int nl = readInt();

    header.placeableWMF = (nl == 0x9ac6cdd7);
    if( header.placeableWMF )
    {
      
      int hwmf = readWORD();
      header.left = readShort();
      header.top = readShort();
      header.right = readShort();
      header.bottom = readShort();
      int nInch = readWORD();
      // bypass the reserved and checksum
      skip(6);
      header.fileType = readWORD();
      header.headerSize = readWORD();
    }
    else
    {
     
      header.headerSize = (nl & 0xffff0000) >>> 16;
      header.fileType = nl & 0xffff;

      if (!(header.fileType == 1 && header.headerSize == 9))
      {
        return null;
      }

      header.left = 0;
      header.right = SIZE;
      header.top = 0;
      header.bottom = SIZE;
    }
    header.setWidth( header.right - header.left );
    header.setHeight(header.bottom - header.top);
    
    
  
    header.version = readWORD();
    header.fileSize = readWORD() | (readWORD() << 16 );
    
    header.numOfObj = readWORD();
    header.maxRec = readInt();
    header.numOfParams = readWORD();
    
    return header;
  }

}
