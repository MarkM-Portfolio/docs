/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.tasks;

import java.io.File;
import java.io.IOException;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.json.java.JSONObject;

public class MigrationTaskContext
{
  private String draftHome;

  private String workHome;

  private String taskName;

  private String ext;

  private long priority;

  private String repoId;

  private String customerId;

  private String modifierId;

  public MigrationTaskContext(String draftHome, String workHome, String taskName, String customerId, String repoId, String modifier,
      String ext, long priority)
  {
    this.draftHome = draftHome;
    this.workHome = workHome;
    this.taskName = taskName;
    this.priority = priority;
    this.customerId = customerId;
    this.modifierId = modifier;
    this.repoId = repoId;
    this.ext = ext;
  }

  public String getDraftHome()
  {
    return draftHome;
  }

  public String getWorkHome()
  {
    return workHome;
  }

  public String getTaskName()
  {
    return taskName;
  }

  public long getPriority()
  {
    return priority;
  }

  public String getExtension()
  {
    return ext;
  }

  public String getRepoId()
  {
    return repoId;
  }

  public String getModifier()
  {
    return modifierId;
  }

  public String getCustomerId()
  {
    return customerId;
  }

  public String toString()
  {
    JSONObject json = new JSONObject();
    json.put("draftHome", getDraftHome());
    json.put("workHome", getWorkHome());
    json.put("task", getTaskName());
    json.put("customerId", getCustomerId());
    json.put("modifier", getModifier());
    json.put("repository", getRepoId());
    json.put("ext", getExtension());
    String jsonStr = json.toString();
    if (jsonStr != null)
    {
      String str = jsonStr.replaceAll("\n", "");
      return str;
    }
    return jsonStr;
  }

  public static MigrationTaskContext fromString(String str)
  {
    try
    {
      JSONObject json = JSONObject.parse(str);
      return new MigrationTaskContext((String) json.get("draftHome"), (String) json.get("workHome"), (String) json.get("task"),
          (String) json.get("customerId"), (String) json.get("repository"), (String) json.get("modifier"), (String) json.get("ext"), 0);
    }
    catch (IOException e)
    {
      return null;
    }
  }

  public IDocumentEntry getDocumentEntry()
  {
    final File draftHome = new File(getDraftHome());
    IDocumentEntry docEntry = null;
    if (draftHome.exists())
    {
      docEntry = new MigrationDocumentEntry(this, draftHome);
    }
    return docEntry;
  }

  private static class MigrationDocumentEntry extends AbstractDocumentEntry
  {

    private File draftHome;

    private MigrationTaskContext context;

    private String mime;

    public MigrationDocumentEntry(final MigrationTaskContext context, final File draftHome)
    {
      String ext = context.getExtension().toLowerCase();
      this.mime = Platform.getMimeType("." + ext);
      this.context = context;
      this.draftHome = draftHome;
    }

    @Override
    public String getDocUri()
    {
      return draftHome.getName();
    }

    @Override
    public String getDocId()
    {
      return getDocUri();
    }

    @Override
    public String getMimeType()
    {
      return mime;
    }

    @Override
    public String getTitle()
    {
      return "content";
    }

    @Override
    public String getTitleWithExtension()
    {
      return this.getTitle() + "." + this.getExtension();
    }

    @Override
    public String getRepository()
    {
      return context.getRepoId();
    }

    @Override
    public String getExtension()
    {
      return context.getExtension();
    }

    @Override
    public String[] getCreator()
    {
      String[] creator = new String[4];
      creator[0] = context.getModifier();
      creator[1] = null;
      creator[2] = null;
      creator[3] = context.getCustomerId();
      return creator;
    }
  }
}
