/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.StringReader;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParser;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.draft.IDraftJSONObjectDeserializer;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.message.Transformer;
import com.ibm.concord.spreadsheet.partialload.PartialDeserializer;
import com.ibm.concord.spreadsheet.partialload.reference.NRJSPartialReference;
import com.ibm.concord.spreadsheet.partialload.reference.PartialReference;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkManager;

/**
 * <p>
 * Bridge document session and spreadsheet partial deserialize (partial load) part. Delegates getCurrentState() request from DocumentSession
 * and returns document state JSON.
 * <p>
 * To support client side row partial loading, 2 part of JSON is prepared for 1 request. The second part is assigned to a "chunkId" and is
 * saved per SaveChunkWork, waiting for a 2nd request to response.
 * <p>
 * This caused a defect 40806 that, if a user only send 1 request, a chunk is saved to disk and is never returned so never deleted. This
 * makes server vulnerable. To solve it (a little), chunkId is coded intentionally as {userId}{criteriaSheet}. So one user for one sheet
 * would use one chunk file repeatedly.
 */
public class SpreadsheetDraftDeserializer implements IDraftJSONObjectDeserializer
{
  public static final Logger LOG = Logger.getLogger(SpreadsheetDraftDeserializer.class.getName());

  private JSONObject criteria;

  private JsonFactory jsonFactory;

  private final static String CONTENT_JSON_FILE = "content.js";

  private final static String META_JSON_FILE = "meta.js";

  private final static String REF_JSON_FILE = "reference.js";

  private static final String CRITERIA_SHEET = "sheet";

  private static final boolean ENABLE_JACKSON_DESERIALIZER = true;

  private static final String WM_JNDI_NAME = "java:comp/env/com/ibm/docs/savechunk/workmanager";

  private static WorkManager workManager;

  private static Map<String, SaveChunkWork> saveChunkWorks;
  
  private int maxContentFileSize = 80*1024*1024; // 80MB file size

  static
  {
    try
    {
      saveChunkWorks = new Hashtable<String, SpreadsheetDraftDeserializer.SaveChunkWork>();
      InitialContext context = new InitialContext();
      workManager = (WorkManager) context.lookup(WM_JNDI_NAME);
    }
    catch (Throwable t)
    {
      LOG.log(Level.WARNING, "Cannot initialize SaveChunkWorkManager, use ConcordWorkManager instead, exception message:{0} ",
          t.getMessage());
      workManager = Platform.getWorkManager();
    }
  }

  public SpreadsheetDraftDeserializer(JSONObject criteria, JsonFactory jsonFactory)
  {
    this.criteria = criteria;
    this.jsonFactory = jsonFactory;
  }

  public JSONObject deserialize(DraftDescriptor draftDescriptor) throws Exception
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(SpreadsheetDraftDeserializer.class.getName(), "deserialize", new Object[] { draftDescriptor, criteria });
    }

    Object o = (criteria == null) ? null : criteria.get(ConversionConstant.CHUNK_ID);
    JSONObject result = null;
    InputStream resultInputStream = null;
    File resultFile = null;
    try
    {
      if (o == null)
      {
        result = doDeserialize(draftDescriptor);
      }
      else
      {
        String chunkId = (String) o;
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "got chunkId {0} for draft {1}.", new Object[] { chunkId, draftDescriptor.getDocId() });
        }

        SaveChunkWork work = saveChunkWorks.get(chunkId);

        if (work == null)
        {
          if (LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "save work done, read from disk");
          }

          // job is finished, find job result file
          String tempDir = draftDescriptor.getTempURI(null);
          resultFile = new File(new File(tempDir), chunkId);
          if (resultFile.exists() && resultFile.isFile())
          {
            resultInputStream = new BufferedInputStream(new FileInputStream(resultFile));
            result = JSONObject.parse(resultInputStream);
            if (LOG.isLoggable(Level.FINEST))
            {
              LOG.log(Level.FINEST, "parsed remaining content from file {0} and returned to client.", resultFile);
            }
          }
          else
          {
            LOG.log(Level.WARNING, "job result file {0} not exists for draft {1}, fall to normal deserializer.", new Object[] { resultFile,
                draftDescriptor.getDocId() });
            result = doDeserialize(draftDescriptor);
          }
        }
        else
        {
          // job not finished yet, return the context JSON directly
          if (LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "save chunk work not finished yet, get result JSON from memory.");
          }
          result = work.getChunk();
          // set flag that the job has already been responded, the result file is not needed anymore
          work.stop();
        }
      }
    }
    finally
    {
      if (resultInputStream != null)
      {
        resultInputStream.close();
      }

      if (resultFile != null && resultFile.exists())
      {
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "delete chunk result file {0}.", resultFile);
        }

        resultFile.delete();
      }
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(SpreadsheetDraftDeserializer.class.getName(), "deserialize");
    }

    return result;
  }
  /**
   * check if the file size of content.js exceeds the maximum content size
   */
  private boolean checkContentFileSize(String filename)
  {
    File file = new File(filename);
    return (file.length() < this.maxContentFileSize);
  }

  /**
   * check if file exists. If exists, return 1. Otherwise return 0
   */
  private int checkFileExists(String filename)
  {
    File file = new File(filename);
    if (file.exists())
      return 1;
    else
      return 0;
  }

  /**
   * If the criteria is requesting for the 1st half of document, and there's more content to load, the returning JSONObject contains 1
   * element "chunks", following an JSON array, containing of all chunks of the document.
   */
  private JSONObject doDeserialize(DraftDescriptor draftDescriptor) throws Exception
  {
    JsonParser contentJp = null;
    JSONObject metaObject = null, contentObject = null;
    InputStream contentInputStream = null, referenceInputStream = null, metaInputStream = null;
    File contentFile = null;

    try
    {
      DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);

      JSONArray draftSections = dsm.listDraftSections(draftDescriptor, null);

      // flag, if set to true, don't partial
      boolean isGetFullDocument = (criteria == null || !criteria.containsKey(CRITERIA_SHEET));
      int draftFileNum = 0;
      for (Iterator iterator = draftSections.iterator(); iterator.hasNext();)
      {
        JSONObject section = (JSONObject) iterator.next();
        String relPath = (String) section.get("rel_path");
        if (relPath != null && relPath.contains(File.separator))
        {
          // section relPath is the path that relative to media root, if contains pathSep, means
          // the file is in subdir, we don't want these files
          continue;
        }

        String name = (String) section.get("name");
        // TODO: if name contains recover, continue
        if (CONTENT_JSON_FILE.equals(name))
        {
          int num = checkFileExists((String) section.get("abs_path"));
          draftFileNum += num;
          
          if (num == 1 && !checkContentFileSize((String) section.get("abs_path"))) {
        	  LOG.log(Level.WARNING, "too large content file for draft " + draftDescriptor.getURI());
        	  throw new ConcordException(9999, new JSONObject(), null);
          }
          
          if (isGetFullDocument)
          {
            if (LOG.isLoggable(Level.FINEST))
            {
              LOG.log(Level.FINEST, "getting full content, criteria: {0}", criteria);
            }
            contentInputStream = new FileInputStream((String) section.get("abs_path"));
            contentObject = JSONObject.parse(contentInputStream);
          }
          else
          {
            contentFile = new File((String) section.get("abs_path"));
            contentJp = jsonFactory.createJsonParser(contentFile);
          }
        }
        else if (META_JSON_FILE.equals(name))
        {
          draftFileNum += checkFileExists((String) section.get("abs_path"));
          metaInputStream = new FileInputStream((String) section.get("abs_path"));
          metaObject = JSONObject.parse(metaInputStream);
        }
        else if (REF_JSON_FILE.equals(name))
        {
          if (isGetFullDocument)
          {
            // for getting full document, don't use reference js, do nothing
            ;
          }
          else
          {
            referenceInputStream = new FileInputStream((String) section.get("abs_path"));
          }
        }
        else
        {
          // ignore other files
        }
      }

      JSONObject result = null;

      if (draftFileNum < 2) 
      {
        LOG.log(Level.SEVERE, "meta.js or content.js is not exist for draft " + draftDescriptor.getURI());
        String retjson = "{\"content\":{},\"meta\":{\"sheetsIdArray\":[],\"sheetsArray\":{},\"sheets\":{}}}";
        result = JSONObject.parse(retjson);
        return result;
      }
      if (isGetFullDocument)
      {
        result = new JSONObject();
        result.put(ConversionConstant.META, metaObject);
        result.put(ConversionConstant.CONTENT, contentObject);
      }
      else if (!metaObject.containsKey(ConversionConstant.FILE_VERSION_FIELD) || !ENABLE_JACKSON_DESERIALIZER)
      {
        // TODO should enable it when getCurrentState is back
        LOG.info("old version draft, or configure to disable Jackson deserializer turn to deperated logic");
        result = Transformer.getCurrentState(draftDescriptor.getURI(), new JSONArray(), criteria);
      }
      else
      {
        String ver = (String) metaObject.get(ConversionConstant.FILE_VERSION_FIELD);
        PartialDeserializer deserializer = new PartialDeserializer();
        deserializer.setCriteria(criteria);
        deserializer.setContentJsonParser(contentJp);
        deserializer.setMetaObject(metaObject);
        deserializer.setDocumentVersion(ver);
        if (SpreadsheetConfig.useReferenceJS())
        {
          PartialReference partialReference = new PartialReference(referenceInputStream, jsonFactory);
          deserializer.setPartialReference(partialReference);
          if (partialReference != null)
          {
            partialReference.setPartialDeserializer(deserializer);
          }
        }
        else
        {
          NRJSPartialReference nrjspartialReference = new NRJSPartialReference();
          deserializer.setNRJSPartialReference(nrjspartialReference);
          nrjspartialReference.setPartialDeserializer(deserializer);
        }
        deserializer.setDraftRootUri(draftDescriptor.getURI());
        result = deserializer.deserialize();
        // check if there are more data to go
        Object o = criteria.get(ConversionConstant.STARTROW);
        if (o != null)
        {
          int startRow = ((Number) o).intValue();
          if (startRow == 1 && deserializer.isHasMoreContent())
          {
            // more content to go, request for more
            JSONObject tmpCriteria = new JSONObject();
            String tmpCriteriaSheetId = deserializer.getCriteriaSheetId();
            tmpCriteria.put("sheet", tmpCriteriaSheetId);
            tmpCriteria.put(ConversionConstant.STARTROW, deserializer.getCriteriaEndRow() + 1);
            // reset content jp
            contentJp.close();
            FileInputStream fis = new FileInputStream(contentFile);
            try
            {
              String buffer = IOUtils.toString(fis, "UTF-8");
              JsonParser bufferJp = jsonFactory.createJsonParser(new StringReader(buffer));
              // reset deserializer
              deserializer.reset();
              deserializer.setContentJsonParser(bufferJp);
              deserializer.setCriteria(tmpCriteria);
              deserializer.setMetaObject(metaObject);
              // request for more
              // JSONObject newResult = deserializer.deserialize();

              // schedule job to save newResult to disk
              String userId = (String) criteria.get(MessageConstants.USER_ID);
              String chunkId = userId + tmpCriteriaSheetId;

              // check if there is a work to this specified chunk on-going
              SaveChunkWork work = saveChunkWorks.get(chunkId);
              if (work != null && work.workState != WorkState.CHUNK_WORK_DONE && work.workState != WorkState.CHUNK_IS_USELESS)
              {
            	// if this work is ongoing, replace current workload
            	work.replaceChunk(deserializer);
              }
              else
              {
                File tempDir = new File(draftDescriptor.getTempURI(null));
                File chunkFile = new File(tempDir, chunkId);
                work = new SaveChunkWork(chunkId, deserializer, chunkFile);
                workManager.startWork(work);
              }
              result.put(ConversionConstant.CHUNK_ID, chunkId);
            } 
            finally 
            {
              IOUtils.closeQuietly(fis);
            }
          }
          // else, no more content to go
        }
      }

      return result;
    }
    finally
    {
      if (contentJp != null)
      {
        contentJp.close();
      }
      if (contentInputStream != null)
      {
        contentInputStream.close();
      }
      if (metaInputStream != null)
      {
        metaInputStream.close();
      }
      if (referenceInputStream != null)
      {
        referenceInputStream.close();
      }
    }
  }

  private enum WorkState {
    /**
     * Work is just initialized
     */
    INITIALIZED,
    /**
     * Work is serializing JSON to file, no interrupt.
     */
    CHUNK_SERIALIZING,
    /**
     * The chunk JSON current serializing is useless.
     */
    CHUNK_IS_USELESS,
    /**
     * The work is done. There is no way to change to other states once a work is in this state.
     */
    CHUNK_WORK_DONE
  };

  private class SaveChunkWork implements Work
  {
    private DraftDescriptor draftDescriptor;

    private File chunkFile;

    private JSONObject chunkResult;
    private String chunkId;

    private InterruptibleFileOutputStream fileOut;

    private transient WorkState workState;
    
    private PartialDeserializer deserializer, replacedDeserializer;

    private Object chunkLock;

    public SaveChunkWork(String chunkId, PartialDeserializer deserializer, File chunkFile)
    {
      this.chunkId = chunkId;
      this.chunkResult = null;
      this.chunkFile = chunkFile;
      this.deserializer = deserializer;
      
      saveChunkWorks.put(chunkId, this);

      workState = WorkState.INITIALIZED;

      chunkLock = new Object();
    }

    public void run()
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SpreadsheetDraftDeserializer.SaveChunkWork.class.getName(), "run", new Object[] {});
      }

      if (workState == WorkState.CHUNK_IS_USELESS)
      {
        // already responded, do nothing
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "Save chunk work do nothing since response already made.");
        }

      }
      else
      {
        while (workState == WorkState.INITIALIZED || replacedDeserializer != null)
        {
          // do things for the first time, or send again when replaced chunk is set.
          // check replaced chunk
          workState = WorkState.CHUNK_SERIALIZING;
          
          synchronized (chunkLock)
          {
            if (replacedDeserializer != null)
            {
              deserializer = null;
              try
              {
                chunkResult = replacedDeserializer.deserialize();
              }
              catch (Exception e)
              {
                LOG.log(Level.WARNING, "chunk replacedDeserializer failed, ", e);
              }
              replacedDeserializer = null;
            } else if (deserializer != null){
              try
              {
                chunkResult = deserializer.deserialize();
              }
              catch (Exception e)
              {
                // TODO Auto-generated catch block
                LOG.log(Level.WARNING, "chunk deserializer failed, ", e);
              }
              deserializer = null;
            }
          }

          try
          {
            fileOut = new InterruptibleFileOutputStream(chunkFile);
            chunkResult.serialize(fileOut);
          }
          catch (InterruptedIOException e)
          {
            if (LOG.isLoggable(Level.FINE))
            {
              LOG.log(Level.FINE, "chunk serialization is interruptted.");
            }
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "chunk serialization failed, ", e);
          }
          finally
          {
            IOUtils.closeQuietly(fileOut);

            if (workState == WorkState.CHUNK_IS_USELESS && chunkFile.exists())
            {
              // if main thread asks work to stop, but still the file generated, delete it
              chunkFile.delete();
            }
          }
        }
      }

      saveChunkWorks.remove(chunkId);

      workState = WorkState.CHUNK_WORK_DONE;

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SpreadsheetDraftDeserializer.SaveChunkWork.class.getName(), "run");
      }
    }

    public JSONObject getChunk()
    {
      synchronized (chunkLock)
      {
        if (chunkResult == null) {
          LOG.log(Level.WARNING, "getChunk failed, can not get chunkResult! wrokstate is " + workState);
        }
        return chunkResult;
      }
    }

    public void replaceChunk(PartialDeserializer deserializer)
    {
      synchronized (chunkLock)
      {
        replacedDeserializer = deserializer;
        // try best to stop current serialize process
        stop();
      }
    }

    public void release()
    {
      stop();
    }

    public void stop()
    {
      if (fileOut != null)
      {
        fileOut.isStop = true;
      }

      workState = WorkState.CHUNK_IS_USELESS;
    }
  }

  // An interruptible FileOutputStream that checks its stop flag every time before writing something out
  private class InterruptibleFileOutputStream extends FileOutputStream
  {
    private transient boolean isStop;

    public InterruptibleFileOutputStream(File file) throws FileNotFoundException
    {
      super(file);

      isStop = false;
    }

    @Override
    public void write(int b) throws IOException
    {
      if (isStop)
      {
        throw new InterruptedIOException();
      }

      super.write(b);
    }

    @Override
    public void write(byte[] b) throws IOException
    {
      if (isStop)
      {
        throw new InterruptedIOException();
      }

      super.write(b);
    }

    @Override
    public void write(byte[] b, int off, int len) throws IOException
    {
      if (isStop)
      {
        throw new InterruptedIOException();
      }

      super.write(b, off, len);
    }
  }
}
