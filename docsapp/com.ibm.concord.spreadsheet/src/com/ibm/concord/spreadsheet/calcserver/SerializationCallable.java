package com.ibm.concord.spreadsheet.calcserver;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.IOUtils;

import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.io.Serializer;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.json.java.JSONObject;

public class SerializationCallable implements Callable<String>
{
  private static final Logger LOG = Logger.getLogger(SerializationCallable.class.getName());
  
  private static final String[] draftLables = new String[]{"meta.js", "content.js", "reference.js", "preserve.js"};
  
  private static final String LOCK_FILE_NAME = "draft.lck";

  private static final String RESULT_FILE_NAME = "calc.rst";
  //  private File tempDir;
  
  private Document doc;

  private String zipPath;
  
  private String draftPath;
  
  private int seq;
  
  private boolean bFail;
  
  private FileLock draftLck;
  
  private FileChannel lockFileChannel;
  
  private FileOutputStream lockOS;
  
  private List<StyleObject> styleList;
 
  public SerializationCallable(Document doc, String draftsPath, String zipPath)
  {
    this.doc = doc;
    this.draftPath = draftsPath;
//    this.tempDir = new File(draftsPath + File.separator + "temp");
//    if(!tempDir.exists())
//    {
//      if(!tempDir.mkdirs())
//        LOG.log(Level.WARNING, "failed to create temp directory for udpate draft JSON");
//    }
    
    this.zipPath = zipPath; 
    
    //create lock file to prevent the synchronized thread go for the same document serialization
  }
  
  public SerializationCallable(Document doc, String draftsPath)
  {
    this(doc, draftsPath, null);
  }
  
  public void setSerializeInfo(List<StyleObject> list, int seq, boolean bF, boolean bComp)
  {
     styleList = list;
     this.seq = seq;
     this.bFail = bF;
     this.doc.setCalculated(bComp);
  }
  
  private boolean lock() throws IOException
  {
    File draftFile = new File(draftPath, LOCK_FILE_NAME);
    try
    {
      draftFile.createNewFile();
      lockOS = new FileOutputStream(draftFile);
      lockFileChannel = lockOS.getChannel();
      draftLck = lockFileChannel.tryLock();
    }
    catch (OverlappingFileLockException e)
    {
      LOG.log(Level.WARNING, "Lock Failed due to OverlappingFileLockException for doc {0}", draftFile.getPath());
      return false;
    }
    return true;
  }
  
  public void release() throws IOException
  {
    System.out.println("release lock");
    try
    {
      if (draftLck != null)
      {
        draftLck.release();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Release lock file failed.", e);
    }
    finally
    {
      draftLck = null;
    }
    try
    {
      if (lockFileChannel != null)
      {
        lockFileChannel.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Release lock file channel failed.", e);
    }
    finally
    {
      lockFileChannel = null;
    }
    try
    {
      if (lockOS != null)
      {
        lockOS.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Close lock file failed.", e);
    }
    finally
    {
      lockOS = null;
    }
  }

  //return the zip file path
  public String call() throws Exception
  {
    int size = draftLables.length;
    OutputStream[] outs = new OutputStream[size];
    String[] filePaths = new String[size];

    boolean bError = true;
    
    boolean bLock = lock();
    if(!bLock){
      LOG.log(Level.INFO, "write {0} for doc {1} was cancelled due to it has already been locked by other serialization thread.", new Object[]{RESULT_FILE_NAME, draftPath});
      return null;
    }
    synchronized(doc)
    {
      try
      {
        //if the document has been decomposed, the sheets is null
        if(doc.getSheets() == null){
          LOG.log(Level.INFO, "write {0} for doc {1} was cancelled due to it has already been decomposed.", new Object[]{RESULT_FILE_NAME, draftPath});
          return null;
        }
        if(!bFail)
        {
          Serializer serializer = CalcServerUtils.MODEL_IO_FACTORY.createSerializer();
          for (int i = 0; i < size; i++)
          {
            try
            {
              File file = new File(draftPath, draftLables[i]);
              filePaths[i] = file.getPath();
              outs[i] = new FileOutputStream(file);
            }
            catch (FileNotFoundException e)
            {
              outs[i] = null;
            }
          }
          serializer.setOutStreams(outs);
          serializer.setStyleList(styleList);
          serializer.serialize(doc);
    
          bError = false;
          
          if(zipPath != null)
          {
            File zipFolder = new File(zipPath);
            if (!zipFolder.exists())
              zipFolder.mkdirs();
            String zipFilePath = zipPath + File.separator + "content.zip";
            ZipUtil.zip(filePaths, zipFilePath);
            return zipFilePath;
          }
        }
      }
      catch(Exception e)
      {
        bError = true;
        LOG.log(Level.WARNING, "serialization for doc {0} failed.", new Object[]{draftPath});
        throw e;
      }
      finally
      {
        for (int i = 0; i < size; i++)
        {
          IOUtils.closeQuietly(outs[i]);
        }
        release();
        
        //write result.json
        JSONObject result = new JSONObject();
        if(bFail)
        {
          LOG.log(Level.INFO, "Calc status is failed because the calc task has no formula to calc or is over time for doc {0}", draftPath);
          result.put("isSuccess", false);
        }else
          result.put("isSuccess", !bError);
        result.put("seq", String.valueOf(seq));
        OutputStream os = null;
        try
        {
          os = new FileOutputStream(new File(draftPath, RESULT_FILE_NAME)); 
          result.serialize(os);
        }
        catch(IOException e)
        {
          LOG.log(Level.WARNING, "write {0} for doc {1} failed.", new Object[]{RESULT_FILE_NAME, draftPath});
        }
        finally
        {
          IOUtils.closeQuietly(os);
        }
      }
    }
    return draftPath;
  }

  private OutputStream getOutputStream(String fileName)
  {
    try
    {
      return new FileOutputStream(new File(draftPath, fileName));
    }
    catch (FileNotFoundException e)
    {
      return null;
    }
  }
}
