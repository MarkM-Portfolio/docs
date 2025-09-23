/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.meta;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.platform.bean.RevisionBean;
import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.revision.IRevision;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.IRevisionStorageAdapter;
import com.ibm.concord.revision.service.DocumentRevisionStorageManager;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class JSONRevisionMetadataAdapter implements IRevisionDAO
{
  private static final Logger LOGGER = Logger.getLogger(JSONRevisionMetadataAdapter.class.getName());

  private String cutomserId = "IBM";

  private static final String META_FILE = "meta.json";

  private static final String META_REVISIONS_KEY = "revisions";

  private static final String META_DOCID_KEY = "docid";

  private static final String META_REPO_KEY = "repository";

  private static final String META_TYPE_KEY = "type";

  private static final String META_MAJORNO_KEY = "majorNo";

  private static final String META_MINORNO_KEY = "minorNo";

  private static final String META_PUBLISH_DATE_KEY = "publishDate";

  private static final String META_MODIFIERS_KEY = "modifiers";
  
  private static final String META_REFERENCE_KEY = "reference";

  private IRevisionService service;
  
  public JSONRevisionMetadataAdapter(IRevisionService service)
  {
    this.service = service;
  }

  public JSONRevisionMetadataAdapter()
  {
  }
  
  public JSONRevisionMetadataAdapter(String customerId)
  {
    this.cutomserId = customerId;
  }
  
  @Override
  public IRevision getRevision(String repoId, String docUri, String revisionNo)
  {
    JSONArray jRevisions = getJSONRevisions(repoId, docUri);
    if (jRevisions != null)
    {
      for (Object jRevision : jRevisions)
      {
        IRevision revision = parseRevision(repoId, docUri, (JSONObject) jRevision);
        if (revision.getRevisionNo().equals(revisionNo))
          return revision;
      }
      return null;
    }
    else
      return null;
  }
  
  public List<IRevision> getAllRevision(String repoId, String docUri)
  {
    return getAllRevision(repoId, docUri, true);
  }

  public List<IRevision> getAllRevision(String repoId, String docUri, boolean includeMinor)
  {
    JSONArray jRevisions = getJSONRevisions(repoId, docUri);
    if (jRevisions != null)
    {
      List<IRevision> revisions = new ArrayList<IRevision>();
      for (Object jRevision : jRevisions)
      {
        IRevision revision = parseRevision(repoId, docUri, (JSONObject) jRevision);
        LOGGER.log(Level.INFO, "getAllRevision: " + revision.toString() + ", publish time: " + revision.getPublishTime());
        if (!includeMinor && !revision.isMajor())
          continue;
        revisions.add(revision);
      }

      Collections.sort(revisions, new Comparator<IRevision>(){

        @Override
        public int compare(IRevision rev1, IRevision rev2)
        {
          int version1 = rev1.getMajorRevisionNo()*10 + rev1.getMinorRevisionNo();
          int version2 = rev2.getMajorRevisionNo()*10 + rev2.getMinorRevisionNo();
          return version1 - version2;
        }
        
      });
      return revisions;
    }
    else
      return null;
  }


  @Override
  public List<IRevision> getAllMinorRevision(String repoId, String docUri, int majorNo)
  {
    JSONArray jRevisions = getJSONRevisions(repoId, docUri);
    
    if (jRevisions != null)
    {
      List<IRevision> revisions = new ArrayList<IRevision>();
      for (Object jRevision : jRevisions)
      {
        IRevision revision = parseRevision(repoId, docUri, (JSONObject) jRevision);
        if ((revision.getMajorRevisionNo() == majorNo) && (revision.getMinorRevisionNo() != 0))
          revisions.add(revision);
      }
      return revisions;
    }
    return null;
  }
  
  @Override
  public boolean addRevision(IRevision revision)
  {
    IRevisionStorageAdapter metaFile = getMetadataFile(revision.getRepository(), revision.getDocUri());
    JSONObject meta = null;
    JSONArray jRevisions = null;
    if (!metaFile.exists())
    {
      meta = new JSONObject();
      meta.put(META_REPO_KEY, revision.getRepository());
      meta.put(META_DOCID_KEY, revision.getDocUri());
      jRevisions = new JSONArray();
    }
    else
    {
      try
      {
        meta = (JSONObject) JSONObject.parse(new AutoCloseInputStream(metaFile.getInputStream()));
      }
      catch (IOException e)
      {
        meta.put(META_REPO_KEY, revision.getRepository());
        meta.put(META_DOCID_KEY, revision.getDocUri());        
        e.printStackTrace();
      }
      jRevisions = (JSONArray)meta.get(META_REVISIONS_KEY);
    }
    JSONObject jRevision = new JSONObject();
    jRevision.put(META_TYPE_KEY, revision.getType());
    jRevision.put(META_MAJORNO_KEY, revision.getMajorRevisionNo() + "");
    jRevision.put(META_MINORNO_KEY, revision.getMinorRevisionNo() + "");
    jRevision.put(META_PUBLISH_DATE_KEY, AtomDate.valueOf(revision.getPublishTime()).getValue());
    if (revision.getReferenceRevision() != null)
      jRevision.put(META_REFERENCE_KEY, revision.getReferenceRevision());
    JSONArray jModifiers = new JSONArray();
    jModifiers.addAll(revision.getModifiers());
    jRevision.put(META_MODIFIERS_KEY, jModifiers);
    jRevisions.add(jRevision);
    meta.put(META_REVISIONS_KEY, jRevisions);
    return storeRevisionsMeta(meta);
  }

  @Override
  public IRevision getLastRevision(String repoId, String docUri)
  {
    List<IRevision> revisions = getAllRevision(repoId, docUri);
    if (revisions != null)
      return revisions.get(revisions.size()-1);
    else
      return null;
  }

  private IRevisionStorageAdapter getMetadataFile(String repoId, String docUri)
  {
    DocumentRevisionStorageManager storageManager = new DocumentRevisionStorageManager(cutomserId, repoId, docUri, service);
    IRevisionStorageAdapter meta = storageManager.getInternalFile(META_FILE);
    return meta;
  }

  private JSONArray getJSONRevisions(String repoId, String docUri)
  {
    IRevisionStorageAdapter meta = getMetadataFile(repoId, docUri);
    if (meta.exists())
    {
      try
      {
        JSONObject objs = (JSONObject) JSONObject.parse(new AutoCloseInputStream(meta.getInputStream()));
        JSONArray jRevisions = (JSONArray) objs.get(META_REVISIONS_KEY);
        return jRevisions;
      }
      catch (IOException e)
      {
        LOGGER.severe("Failed to parse file " + meta.getPath());
        return null;
      }
    }
    return null;
  }

  private IRevision parseRevision(String repoId, String docUri, JSONObject jRevision)
  {
    String sMajorNo = (String) jRevision.get(META_MAJORNO_KEY);
    String sMinorNo = (String) jRevision.get(META_MINORNO_KEY);
    String type = (String) jRevision.get(META_TYPE_KEY);
    String reference = (String)jRevision.get(META_REFERENCE_KEY);
    List<String> modifier = (List<String>) jRevision.get(META_MODIFIERS_KEY);

    int majorNo = Integer.parseInt(sMajorNo);
    int minorNo = (sMinorNo == null) ? 0 :Integer.parseInt(sMinorNo);
    Calendar publishDate = AtomDate.valueOf((String) jRevision.get(META_PUBLISH_DATE_KEY)).getCalendar();
    RevisionBean revision = new RevisionBean(repoId, docUri, majorNo, minorNo, type, reference, publishDate, modifier);
    return revision;
  }

  private boolean storeRevisionsMeta(JSONObject jMeta)
  {
    IRevisionStorageAdapter metaFile = getMetadataFile((String) jMeta.get(META_REPO_KEY), (String) jMeta.get(META_DOCID_KEY));
    try
    {
      if (!metaFile.exists())
        metaFile.createNewFile();
      OutputStream out = metaFile.getOutputStream();
      jMeta.serialize(out, true);
      out.close();
      return true;
    }
    catch (IOException e)
    {
      LOGGER.warning("Failed to store metadata to file " + metaFile.getPath());
      return false;
    }

  }

}
