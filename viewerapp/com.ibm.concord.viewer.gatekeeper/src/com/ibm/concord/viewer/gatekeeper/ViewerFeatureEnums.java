package com.ibm.concord.viewer.gatekeeper;

import com.ibm.lotus.apollo.gatekeeper.FeatureEnum;

public enum ViewerFeatureEnums implements FeatureEnum {

  VIEWER_POSTMESSAGE_FEATURE("Post message to Connections container while viewer conversion failed.", false, true),
  
  HTML_VIEWER_FEATURE("Use html viewer feature.", false, true);

  private String description;

  private boolean enabled;

  private boolean global;

  ViewerFeatureEnums(String description, boolean enabled, boolean global)
  {
    this.description = description;
    this.enabled = enabled;
    this.global = global;
  }

  @Override
  public String getDescription()
  {
    return this.description;
  }

  @Override
  public boolean isEnabled()
  {
    return this.enabled;
  }

  @Override
  public boolean isGlobal()
  {
    return this.global;
  }
}