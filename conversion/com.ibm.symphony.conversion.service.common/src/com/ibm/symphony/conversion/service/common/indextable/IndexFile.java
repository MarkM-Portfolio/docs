/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.indextable;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;

public class IndexFile
{
  private String draftFolderPath = null;

  private Map<String, String> indexTableBuffer = null;
  private Map<String, List<String>> htmlIdMap = null;
  private Map<String, List<String>> xmlIdMap = null;
  
  private boolean loadXmlIdMap = false;

  Logger LOG = Logger.getLogger(IndexFile.class.getName());
  
  private void readLine(String line)
  {
    StringTokenizer st = new StringTokenizer(line, ",");
    int tokenNumber = 0;
    String s = "";
    String xmlid = "";
    String htmlid = "";
    String mappingRule = "";
    while (st.hasMoreTokens())
    {
      tokenNumber++;
      s = st.nextToken();
      switch (tokenNumber)
        {
          case 1 :
            xmlid = s;
            break;
          case 2 :
            htmlid = s;
            break;
          case 3 :
            mappingRule = s;
            break;
          default:
            break;
        }
    }
    indexTableBuffer.put(xmlid + "," + htmlid, mappingRule);
    IndexUtil.addIntoHtmlIdMap(htmlid, xmlid, htmlIdMap);

    if (this.loadXmlIdMap)
      IndexUtil.addIntoXmlIdMap(htmlid, xmlid, xmlIdMap);
  }

  public IndexFile(String draftFolderPath, Map<String, String> indexTableBuffer)
  {
    this.draftFolderPath = draftFolderPath;
    this.indexTableBuffer = indexTableBuffer;
  }

  public IndexFile(String draftFolderPath, Map<String, String> indexTableBuffer, boolean loadXmlIdMap)
  {
    this.draftFolderPath = draftFolderPath;
    this.indexTableBuffer = indexTableBuffer;
    this.loadXmlIdMap = loadXmlIdMap;
  }

  public IndexFile(String draftFolderPath, Map<String, String> indexTableBuffer, Map<String, List<String>> htmlIdMap)
  {
    this.draftFolderPath = draftFolderPath;
    this.indexTableBuffer = indexTableBuffer;
    this.htmlIdMap = htmlIdMap;
  }

  public void load() throws IOException
  {
    BufferedReader br = null;
    String strLine = "";
    int lineNumber = 0;
    if (htmlIdMap == null)
      htmlIdMap = new HashMap<String, List<String>>();

    if (this.loadXmlIdMap && xmlIdMap == null)
      xmlIdMap = new HashMap<String, List<String>>();

    try
    {
      br = new BufferedReader(new FileReader(draftFolderPath + File.separator + IndexUtil.INDEXFILE_NAME));
      while ((strLine = br.readLine()) != null)
      {
        lineNumber++;
        readLine(strLine);
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "Index file is not found while loading,", e);
      throw e;
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO exception while loading index file,", e);
      throw e;
    }
    finally
    {
      try
      {
        br.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IO Exception while close the index file stream,", e);
        throw e;
      }
    }
  }

  public Map<String, List<String>> getXmlIdMap()
  {
    return this.xmlIdMap;
  }

  public Map<String, List<String>> getHtmlIdMap()
  {
    return this.htmlIdMap;
  }

  public File save(OdfDocument odfDoc) throws Exception
  {
    saveIndexFile();
    return saveOdfDraft(odfDoc);
  }

  private void saveIndexFile() throws Exception
  {
    StringBuffer buf = new StringBuffer();
    Iterator<Entry<String, String>> iter = indexTableBuffer.entrySet().iterator();
    while (iter.hasNext())
    {
      Entry<String, String> entry = iter.next();
      buf.append(entry.getKey());
      buf.append(",");
      buf.append(entry.getValue());
      buf.append("\r\n");
    }
    BufferedOutputStream bufOS = null;
    try
    {
      bufOS = new BufferedOutputStream(new FileOutputStream(new File(draftFolderPath + File.separator + IndexUtil.INDEXFILE_NAME)));
      bufOS.write(buf.toString().getBytes());
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "Index file is not found while saving,", e);
      throw e;
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO exception while saving index file," + e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Index file save exception:", e);
      throw e;
    }
    finally
    {
      if (bufOS != null)
      {
        try
        {
          bufOS.flush();
          bufOS.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "IO exception to flush and close index file stream while saving,", e);
          throw e;
        }
      }
    }
  }

  private File saveOdfDraft(OdfDocument odfDoc) throws Exception
  {
    if (odfDoc != null)
    {
      OutputStream bos = null;
      try
      {
        LOG.log(Level.FINEST, "starting to save ODFDRAFT .....");
        File odfdraft = new File(draftFolderPath + File.separator + IndexUtil.ODFDRAFT_NAME);
        bos = new BufferedOutputStream(new FileOutputStream(odfdraft), 128 << 10);
        odfDoc.save(bos);
        LOG.log(Level.FINEST, "end to save ODFDRAFT");
        return odfdraft;
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.SEVERE, "odfdraft file is not found while saving,", e);
        throw e;
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IO exception while saving odfdraft file," + e);
        throw e;
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Exception while saving odfdraft file,", e);
        throw e;
      }
      finally
      {
        if (bos != null)
        {
          try
          {
            bos.flush();
            bos.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.SEVERE, "IO exception while flush and close odfdraft file," + e);
            throw e;
          }
        }
      }
    }
    return null;
  }

  public boolean exists()
  {
    return new File(draftFolderPath + File.separator + IndexUtil.INDEXFILE_NAME).exists();
  }
}
