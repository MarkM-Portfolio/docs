package com.ibm.concord.viewer.gatekeeper;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

import com.ibm.lotus.apollo.gatekeeper.Gatekeeper;

public class ViewerGatekeeper
{
  private static final Logger LOG = Logger.getLogger(ViewerGatekeeper.class.getName());

  public static final String appName = "Viewer";

  static
  {
    List featureList = Arrays.asList(ViewerFeatureEnums.values());
    Gatekeeper.initialize(appName, featureList);
    Gatekeeper.setFeatureEnabled(appName, ViewerFeatureEnums.HTML_VIEWER_FEATURE, false, null);
    Gatekeeper.setFeatureEnabled(appName, ViewerFeatureEnums.VIEWER_POSTMESSAGE_FEATURE, false, null);
    LOG.info("Viewer gatekeeper settings was set to zookeeper.");
  }

  public static boolean isHTMLViewerEnabled()
  {
    return Gatekeeper.isFeatureEnabled(ViewerFeatureEnums.HTML_VIEWER_FEATURE, null, null, null, null);
  }

  public static boolean isPostMessageEnabled()
  {
    return Gatekeeper.isFeatureEnabled(ViewerFeatureEnums.VIEWER_POSTMESSAGE_FEATURE, null, null, null, null);
  }
}
