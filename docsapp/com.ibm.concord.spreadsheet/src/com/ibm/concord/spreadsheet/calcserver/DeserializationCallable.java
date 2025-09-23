package com.ibm.concord.spreadsheet.calcserver;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.IOUtils;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.io.Deserializer;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;

/**
 * Callable that deserialize model from zipped media. This will get executed in seprarate thread, and return created model asynchronously.
 */
public class DeserializationCallable implements Callable<Document>
{
  private File zipFile;

  private File draftDir;

//  private static final Method METHOD_LOAD_CHART;

  private static String[] FAKE_HASH = { "", "" };

  private static final Logger LOG = Logger.getLogger(DeserializationCallable.class.getName());

  private List<StyleObject> styleList;//used by serializer
//  static
//  {
//    Method m = null;
//    try
//    {
//      m = Deserializer.class.getDeclaredMethod("loadChart", DraftDescriptor.class);
//      m.setAccessible(true);
//    }
//    catch (Exception e)
//    {
//      LOG.log(Level.WARNING, "failed to initialize loadChart method, chart will not be loaded.", e);
//    }
//
//    METHOD_LOAD_CHART = m;
//  }

  /**
   * Document draft is in zipPath, and need to uncompress to the draftsPath
   * @param zipPath
   * @param draftsPath
   */
  public DeserializationCallable(String zipPath, String draftsPath)
  {
    if(zipPath != null)
      zipFile = new File(zipPath);

    draftDir = new File(draftsPath);
  }
  
  /*
   * Document draft is in draftsPath
   */
  public DeserializationCallable(String draftsPath)
  {
    this(null, draftsPath);
  }

  public Document call() throws Exception
  {
    InputStream contentIn = null, metaIn = null, referenceIn = null, preserveIn = null;

    try
    {
      if(zipFile != null)
      {
        // unzip to /drafts/docId
        File file = new File(draftDir.getAbsolutePath());
        if(!file.exists())
          file.mkdirs();
        ZipUtil.unzip(zipFile.getAbsolutePath(), draftDir.getAbsolutePath());
      }
      Deserializer deserializer = CalcServerUtils.MODEL_IO_FACTORY.createDeserializer();
      contentIn = getInputStream("content.js");
      metaIn = getInputStream("meta.js");
      referenceIn = getInputStream("reference.js");
      preserveIn = getInputStream("preserve.js");
      deserializer.setInputStreams(metaIn, contentIn, referenceIn, preserveIn);
      Document document = deserializer.deserialize();
      styleList = deserializer.getStyleList();

//      DraftDescriptor dd = new DraftDescriptor(draftDir.getAbsolutePath(), FAKE_HASH);
//      METHOD_LOAD_CHART.invoke(deserializer, dd);

      return document;
    }
    finally
    {
      IOUtils.closeQuietly(contentIn);
      IOUtils.closeQuietly(metaIn);
      IOUtils.closeQuietly(referenceIn);
      IOUtils.closeQuietly(preserveIn);
    }
  }

  public List<StyleObject> getStyleList() {
    return styleList;
  }
  
  private InputStream getInputStream(String fileName)
  {
    try
    {
      return new FileInputStream(new File(draftDir, fileName));
    }
    catch (FileNotFoundException e)
    {
      return null;
    }
  }

  public static void main(String[] args) throws Exception
  {
    Document document = new DeserializationCallable("c:/temp/content.zip", "c:/temp/test-content/").call();
    System.out.println(document);
  }
}
