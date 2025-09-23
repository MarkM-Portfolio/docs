/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.xml.sax.InputSource;

public class XMLLocator
{
  private RandomAccessFile raf;

  static final int PAGE_SIZE = 4096;
  
  private String basePath;
  
  private static final Logger LOG = Logger.getLogger(XMLLocator.class.getName());

  public XMLLocator(String baseURI, InputStream in)
  {
    try
    {
      this.basePath = baseURI + File.separator + "content.tmp";
      File tmp = new File(basePath);
      if (!tmp.exists())
        tmp.createNewFile();
      FileOutputStream os = new FileOutputStream(tmp);
      byte[] buf = new byte[PAGE_SIZE];
      int r = 0;
      // let npe happen if one of the streams is null
      while ((r = in.read(buf, 0, PAGE_SIZE)) > -1)
      {
        os.write(buf, 0, r);
      }
      os.close();
      // free the references
      in = null;
      os = null;
      raf = new RandomAccessFile(tmp, "r");
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.INFO, "file not found ", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "IO error", e);
    }
  }

  public String locateByOffset(long offset, int len)
  {
    try
    {
      raf.seek(offset - 1);
      byte[] b = new byte[len];
      raf.read(b);

      String sb = new String(b, "utf-8");
      InputSource source = new InputSource(new StringReader(sb));
      source.setEncoding("UTF-8");
      return sb;
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "IO error", e);
    }
    return null;
  }
  
  void close()
  {
    try
    {
      raf.close();
      File file = new File(basePath);
      file.delete();
    }
    catch (IOException e)
    {
      LOG.log(Level.INFO, "IO error", e);
    }
  }
}
