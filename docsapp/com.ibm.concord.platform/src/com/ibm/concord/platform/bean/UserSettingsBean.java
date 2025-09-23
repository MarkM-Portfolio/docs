/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.bean;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IUserPreferenceDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.SettingsProperty;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author huoqif UserSettingsBean.prefix + SettingsProperty.SETTINGS_PROP_* is the property key in database
 */
public class UserSettingsBean
{

  private UserBean user;

  private String docType;

  private String prefix;

  private String toolbar;

  private String sidebar;

  private String feature;
  private HashMap<String, String> exfeatures = null;

  private String panel;

  private String assignment;

  private String indicator;

  private String showcarriagereturn;
  
  private String showbookmark;
  
  private String shownavipanel;
  
  public String getShowbookmark(){
	  return showbookmark;
  }

  public String getShownavipanel(){
    return shownavipanel;
  }

  public void setShowbookmark( String showbookmark ){
	  this.showbookmark = showbookmark;
  }

  public void setShownavipanel( String shownavipanel ){
    this.shownavipanel = shownavipanel;
  }

  public String getShowcarriagereturn()
  {
    return showcarriagereturn;
  }

  public void setShowcarriagereturn(String showcarriagereturn)
  {
    this.showcarriagereturn = showcarriagereturn;
  }

  private String autocomplete;

  private String fixedwidth;

  private String formula;

  private String autospellcheck;

  private String showunsupportedfeature; // "yes" or "no"

  private String showwelcome; // "yes" or "no"

  private String fileformat; // "ms" or "odf"

  public UserSettingsBean(UserBean user, String docType)
  {
    this.user = user;
    this.docType = docType;
    this.prefix = this.docType + "_";

    this.toolbar = "basic";
    this.sidebar = "open";
    this.panel = ""; // don't set it on server as prez have different value with doc
    this.assignment = "yes";
    this.indicator = "no";
    this.autocomplete = "yes";
    this.fixedwidth = "yes";
    this.formula = "show";
    this.autospellcheck = "no";
    this.showunsupportedfeature = "yes";
    this.showwelcome = "yes";
    this.fileformat = "ms";
    this.feature = "show";
    this.exfeatures = new HashMap<String, String>();
    this.showbookmark = "yes";
    this.shownavipanel = "no";
    
    this.init();
  }

  public void init()
  {
    IUserPreferenceDAO prefDAO = (IUserPreferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IUserPreferenceDAO.class);

    try
    {
      HashMap<String, UserPreferenceBean> map = prefDAO.getAllById(this.user.getId());

      UserPreferenceBean propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_TOOLBAR.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.toolbar = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SIDEBAR.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.sidebar = propBean.getProp_value();
      }
      
      // ex feature show/hide, for cr release support
      // workaround, any better to get the latest records for CR versions? 
      String fe_prefix = this.prefix + SettingsProperty.SETTINGS_PROP_FEATURE.toString();
      String curVersion = ConcordUtil.getVersion();
      String fe_key_cur = fe_prefix + curVersion;
      int idx = curVersion.lastIndexOf('.');
      if ( idx > 0) {
        fe_prefix += curVersion.substring(0, idx);
      }
      
      Iterator<Entry<String, UserPreferenceBean>> iter = map.entrySet().iterator();
      while (iter.hasNext()) {
        Entry<String, UserPreferenceBean> entry = (Entry<String, UserPreferenceBean>) iter.next();
        String key = entry.getKey();
        if (key.startsWith(fe_prefix) && !key.endsWith(fe_key_cur)) {
          this.exfeatures.put(key.substring(this.prefix.length()), entry.getValue().getProp_value());
        }
      }
      propBean = map.get(fe_key_cur);
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.feature = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_DEAFULT_PANEL.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.panel = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SHOW_ASSIGNMENT.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.assignment = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SHOW_INDICATOR.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.indicator = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SHOW_CARRIAGE_RETURN.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.showcarriagereturn = propBean.getProp_value();
      }
      
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SHOW_BOOKMARK.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.showbookmark = propBean.getProp_value();
      }

      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_SHOW_NAVIPANEL.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.shownavipanel = propBean.getProp_value();
      }

      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_AUTO_COMPLETE.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.autocomplete = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_FIXED_WIDTH.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.fixedwidth = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_FORMULA.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.formula = propBean.getProp_value();
      }
      propBean = map.get(this.prefix + SettingsProperty.SETTINGS_PROP_AUTO_SPELLCHECK.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.autospellcheck = propBean.getProp_value();
      }
      // Here do not add this.prefix: 'show unsupported feature' property is functional across 3 editors.
      // See 'setShowUnsupportedFeature' in 'Settings.js' for the setter of this property.
      propBean = map.get(SettingsProperty.SETTINGS_PROP_SHOW_UNSUPPORTED_FEATURE.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.showunsupportedfeature = propBean.getProp_value();
      }
      propBean = map.get(SettingsProperty.SETTINGS_PROP_SHOW_WELCOME.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.showwelcome = propBean.getProp_value();
      }
      propBean = map.get(SettingsProperty.SETTINGS_PROP_FILE_FORMAT.toString());
      if (propBean != null && propBean.getProp_value().length() > 0)
      {
        this.fileformat = propBean.getProp_value();
      }
    }
    catch (Exception e)
    {// dose not matter if no settings got
      e.printStackTrace();
    }

  }

  public String getDocType()
  {
    return this.docType;
  }

  public String getToolbar()
  {
    return this.toolbar;
  }

  public String getSidebar()
  {
    return this.sidebar;
  }

  public String getFeature()
  {
    return this.feature;
  }

  public String getDeafultPanel()
  {
    return this.panel;
  }

  public String getShowAssignment()
  {
    return this.assignment;
  }

  public String getShowIndicator()
  {
    return this.indicator;
  }

  public String getFixedWidth()
  {
    return this.fixedwidth;
  }

  public String getFormula()
  {
    return this.formula;
  }

  public String getAutoSpellCheck()
  {
    return this.autospellcheck;
  }

  public String getShowUnsupportedFeature()
  {
    return this.showunsupportedfeature;
  }

  public String getShowWelcome()
  {
    return this.showwelcome;
  }

  public String getFileFormat()
  {
    return this.fileformat;
  }

  public void setDocType(String s)
  {
    this.docType = s;
    this.prefix = this.docType + "_";
  }

  public void setToolbar(String s)
  {
    this.toolbar = s;
  }

  public void setSidebar(String s)
  {
    this.sidebar = s;
  }

  public void setFeature(String s)
  {
    this.feature = s;
  }

  public void setDeafultPanel(String s)
  {
    this.panel = s;
  }

  public void setShowAssignment(String s)
  {
    this.assignment = s;
  }

  public void setShowIndicator(String s)
  {
    this.indicator = s;
  }

  public void setFixedWidth(String s)
  {
    this.fixedwidth = s;
  }

  public void setFormula(String s)
  {
    this.formula = s;
  }

  public void setAutoSpellCheck(String s)
  {
    this.autospellcheck = s;
  }

  public void setShowUnsupportedFeature(String s)
  {
    this.showunsupportedfeature = s;
  }

  public void setShowWelcome(String s)
  {
    this.showwelcome = s;
  }

  public void setFileFormat(String s)
  {
    this.fileformat = s;
  }

  public String getAutocomplete()
  {
    return autocomplete;
  }

  public void setAutocomplete(String autocomplete)
  {
    this.autocomplete = autocomplete;
  }

  public JSONObject toJson()
  {
    JSONObject json = new JSONObject();

    json.put(SettingsProperty.SETTINGS_PROP_TOOLBAR.toString(), this.toolbar);
    json.put(SettingsProperty.SETTINGS_PROP_SIDEBAR.toString(), this.sidebar);
    json.put(SettingsProperty.SETTINGS_PROP_FEATURE.toString()+ ConcordUtil.getVersion(), this.feature);
    if (this.exfeatures.size() > 0) {
      Iterator<Entry<String, String>> iter = this.exfeatures.entrySet().iterator();
      while (iter.hasNext()) {
        Entry<String, String> entry = (Entry<String, String>) iter.next();
        json.put(entry.getKey(), entry.getValue());
      }
    }
    json.put(SettingsProperty.SETTINGS_PROP_DEAFULT_PANEL.toString(), this.panel);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_ASSIGNMENT.toString(), this.assignment);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_INDICATOR.toString(), this.indicator);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_CARRIAGE_RETURN.toString(), this.showcarriagereturn);
    json.put(SettingsProperty.SETTINGS_PROP_AUTO_COMPLETE.toString(), this.autocomplete);
    json.put(SettingsProperty.SETTINGS_PROP_FIXED_WIDTH.toString(), this.fixedwidth);
    json.put(SettingsProperty.SETTINGS_PROP_FORMULA.toString(), this.formula);
    json.put(SettingsProperty.SETTINGS_PROP_AUTO_SPELLCHECK.toString(), this.autospellcheck);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_UNSUPPORTED_FEATURE.toString(), this.showunsupportedfeature);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_WELCOME.toString(), this.showwelcome);
    json.put(SettingsProperty.SETTINGS_PROP_FILE_FORMAT.toString(), this.fileformat);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_BOOKMARK.toString(), this.showbookmark);
    json.put(SettingsProperty.SETTINGS_PROP_SHOW_NAVIPANEL.toString(), this.shownavipanel);
    return json;
  }
}
