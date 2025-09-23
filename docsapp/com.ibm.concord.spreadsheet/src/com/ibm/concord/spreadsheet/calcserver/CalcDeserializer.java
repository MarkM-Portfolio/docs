package com.ibm.concord.spreadsheet.calcserver;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.IOUtils;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.io.Deserializer;

public class CalcDeserializer
{
  private static final Logger LOG = Logger.getLogger(CalcDeserializer.class.getName());
  
  private File zipFile;
  private File draftDir;
  
  private static final Method METHOD_LOAD_CHART;

  private static String[] FAKE_HASH = { "", "" };

  public CalcDeserializer(String zipPath, String draftsPath)
  {
    zipFile = new File(zipPath);

    draftDir = new File(draftsPath);
  }
  
  static
  {
    Method m = null;
    try
    {
      m = Deserializer.class.getDeclaredMethod("loadChart", DraftDescriptor.class);
      m.setAccessible(true);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to initialize loadChart method, chart will not be loaded.", e);
    }
    METHOD_LOAD_CHART = m;
  }
  
  public Document deserialize() throws Exception
  {
    InputStream contentIn = null, metaIn = null, referenceIn = null, preserveIn = null;
    Document document = null;
    try
    {
      System.out.println("start unzip");
      // unzip to /drafts/docId
      ZipUtil.unzip(zipFile.getAbsolutePath(), draftDir.getAbsolutePath() + "/media");
      Deserializer deserializer = CalcServerUtils.MODEL_IO_FACTORY.createDeserializer();
      contentIn = getInputStream("content.js");
      metaIn = getInputStream("meta.js");
      referenceIn = getInputStream("reference.js");
      preserveIn = getInputStream("preserve.js");
      deserializer.setInputStreams(metaIn, contentIn, referenceIn, preserveIn);
      System.out.println("start deserilize");
      document = deserializer.deserialize();
      System.out.println("end deserilize");
//      DraftDescriptor dd = new DraftDescriptor(draftDir.getAbsolutePath(), FAKE_HASH);
//      METHOD_LOAD_CHART.invoke(deserializer, dd);

    }
    catch(Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      IOUtils.closeQuietly(contentIn);
      IOUtils.closeQuietly(metaIn);
      IOUtils.closeQuietly(referenceIn);
      IOUtils.closeQuietly(preserveIn);
    }
    return document;
  }

  private InputStream getInputStream(String string)
  {
    InputStream in = null;
    try
    {
      File file = new File(draftDir.getAbsolutePath() , "media" + File.separator + string);
      System.out.println(file.getAbsolutePath());
      in = new FileInputStream(file);
    }
    catch (FileNotFoundException e)
    {
      System.out.println("File Not Found");
      return null;
    }
    return in;
  }
  
  public static void main(String[] args) throws Exception
  {
    Document document = new CalcDeserializer("d:/calcserver/content.zip", "d:/calcserver/test-content/").deserialize();
    System.out.println(document);
    document.getVersion().toString();
  }
}
