package com.ibm.concord.writer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.json.java.JSONObject;
/**
 * 
 * @author xuezhiy@cn.ibm.com
 *
 */
public class WriterDocumentModel
{
  public final static String CONTENT_FILE = "content.json";

  public final static String STYLES_FILE = "styles.json";

  public final static String NUMBERING_FILE = "numbering.json";

  public final static String SETTINGS_FILE = "settings.json";
  
  public final static String RELATIONS_FILE = "relations.json";
  
  public final static String META_FILE = "meta.json";
  
  public final static String NSDEF_FILE = "nsDef.json";
  
  public final static String PGSETTINGS_FILE = "page-settings.js";

  private DraftDescriptor draftDesc = null;

  private String docUri = null;
  
  private JSONObject content = null;
  
  private JSONObject styles = null;
  
  private JSONObject numbering = null;
  
  private JSONObject settings = null;
  
  private JSONObject relations = null;
  
  private JSONObject pgSettings = null;
  
  private JSONObject meta = null;
  private WriterDraftSerializer serializer = new WriterDraftSerializer();

  public WriterDocumentModel(DraftDescriptor draftDesc)
  {
    this.draftDesc = draftDesc;
    this.docUri = draftDesc.getURI();
  }

  public WriterDocumentModel(String uri)
  {
    this.docUri = uri;
  }

  public JSONObject getContent()
  {
    if (null == this.content)
      this.content = loadJson(this.docUri + File.separator + CONTENT_FILE);
    return this.content;
  }

  public JSONObject getStyles()
  {
    if (null == this.styles)
      this.styles = loadJson(this.docUri + File.separator + STYLES_FILE);
    return this.styles;
  }

  public JSONObject getNumbering()
  {
    if (null == this.numbering)
      this.numbering = loadJson(this.docUri + File.separator + NUMBERING_FILE);
    if (null == this.numbering)
      this.numbering = new JSONObject();

    return this.numbering;
  }

  public JSONObject getSettings()
  {
    if (null == this.settings)
      this.settings = loadJson(this.docUri + File.separator + SETTINGS_FILE);
    return this.settings;
  }

  public JSONObject getRelations()
  {
    if (null == this.relations)
      this.relations = loadJson(this.docUri + File.separator + RELATIONS_FILE);
    return this.relations;
  }

  public JSONObject getFootnotes()
  {
    if (null == this.relations)
      this.relations = loadJson(this.docUri + File.separator + RELATIONS_FILE);
    return this.relations;
  }

  public JSONObject getEndnotes()
  {
    if (null == this.relations)
      this.relations = loadJson(this.docUri + File.separator + RELATIONS_FILE);
    return this.relations;
  }

  public JSONObject getMeta()
  {
    if (null == this.meta)
      this.meta = loadJson(this.docUri + File.separator + META_FILE);
    if (null == this.meta)
      this.meta = new JSONObject();
    return this.meta;
  }

  public JSONObject getPageSettings()
  {
    if (null == this.pgSettings)
      this.pgSettings = loadJson(this.docUri + File.separator + PGSETTINGS_FILE);
    if (null == this.pgSettings)
      this.pgSettings = new JSONObject();
    return this.pgSettings;
  }

  /**
   * Write the json content to json file
   * @throws Exception 
   * @throws DraftDataAccessException 
   * @throws DraftStorageAccessException 
   */
  public void toJson() throws DraftStorageAccessException, DraftDataAccessException, Exception
  {
    DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager();
    updateTrackState(dsm);

    DraftSection ds = new DraftSection(CONTENT_FILE);
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), content);
    
    ds = new DraftSection(STYLES_FILE);
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), styles);
    
    ds = new DraftSection(NUMBERING_FILE);
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), numbering);
    
    ds = new DraftSection(SETTINGS_FILE);
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), settings);
    
    ds = new DraftSection(RELATIONS_FILE);
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), relations);
    
    if(meta != null && !meta.isEmpty()){
    	ds = new DraftSection(META_FILE);
    	writeJson(dsm.getSectionDescriptor(draftDesc, ds), meta);
    }
  }

  private static JSONObject loadJson(String uri)
  {
    JSONObject json = null;
    File file = new File(uri);
    // TODO if no json file, need create it.
    if (!file.exists())
      return null;
    try
    {
      FileInputStream fin = new FileInputStream(file);
      json = JSONObject.parse(fin);
      fin.close();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return json;
  }
  
  private void writeJson(SectionDescriptor sd, JSONObject obj) throws Exception
  {
    if(obj == null)
      return;
    DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);    
    dsm.storeSectionAsJSONObject(sd, obj,  serializer);
  }
  
  private void updateTrackState(DraftStorageManager dsm) throws DraftStorageAccessException, DraftDataAccessException, Exception
  {
    if(this.content == null || this.content.isEmpty())
      return;
    String sContent = this.content.toString();
    String regStr = "(\"t\":\"ins\"|\"t\":\"del\")";
    Pattern pat = Pattern.compile(regStr, Pattern.CASE_INSENSITIVE);
    Matcher mat = pat.matcher(sContent);
    boolean hasTrack = mat.find();

    DraftSection ds = new DraftSection(PGSETTINGS_FILE);
    if(pgSettings == null)
      getPageSettings();
    pgSettings.put("hasTrack", Boolean.valueOf(hasTrack));
    writeJson(dsm.getSectionDescriptor(draftDesc, ds), pgSettings);      
  }
}
