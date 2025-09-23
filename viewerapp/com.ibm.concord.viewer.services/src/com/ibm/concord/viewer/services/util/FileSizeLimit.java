package com.ibm.concord.viewer.services.util;

import java.util.logging.Logger;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.HTMLViewConfig;
import com.ibm.concord.viewer.config.PresConfig;
import com.ibm.concord.viewer.config.TextConfig;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.json.java.JSONObject;

public class FileSizeLimit
{
  static Logger LOG = Logger.getLogger(FileSizeLimit.class.getName());

  public static boolean belowMinSize(long mediaSize, String mime)
  {
    LOG.entering(FileSizeLimit.class.getName(), "belowMinSize", new Object[] { mediaSize, mime });

    boolean res = LimitsUtil
        .exceedLimits(mediaSize, Platform.getViewerConfig().getSubConfig(ConfigConstants.FILE_SIZE_THRESHOLD_KEY), mime);

    LOG.exiting(FileSizeLimit.class.getName(), "belowMinSize", res);
    return !res;
  }

  public static boolean exceedMaxSize(long mediaSize, String mime, String repoId)
  {
    LOG.entering(FileSizeLimit.class.getName(), "exceedMaxSize", new Object[] { mediaSize, mime, repoId });
    String maxSize = getMaxSize(mime, repoId);
    boolean isExceedLimits = LimitsUtil.exceedLimits(mediaSize, maxSize);

    LOG.exiting(FileSizeLimit.class.getName(), "exceedMaxSize", isExceedLimits);
    return isExceedLimits;
  }

  public static boolean exceedMaxImageSize(long mediaSize, String mime)
  {
    LOG.entering(FileSizeLimit.class.getName(), "exceedMaxImageSize", new Object[] { mediaSize, mime });
    String maxSize = getImageViewMaxSize(mime);
    boolean isExceedLimits = LimitsUtil.exceedLimits(mediaSize, maxSize);

    LOG.exiting(FileSizeLimit.class.getName(), "exceedMaxImageSize", isExceedLimits);
    return isExceedLimits;
  }

  public static boolean exceedMaxHTMLSize(long mediaSize, String mime)
  {
    LOG.entering(FileSizeLimit.class.getName(), "exceedMaxHTMLSize", new Object[] { mediaSize, mime });
    String maxSize = getHTMLViewMaxSize(mime);
    boolean isExceedLimits = LimitsUtil.exceedLimits(mediaSize, maxSize);

    LOG.exiting(FileSizeLimit.class.getName(), "exceedMaxHTMLSize", isExceedLimits);
    return isExceedLimits;
  }

  public static String getImageViewMaxSize(String mime)
  {
    LOG.entering(FileSizeLimit.class.getName(), "getImageViewMaxSize", mime);
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(mime);

    String maxSize = "";
    JSONObject limits = (JSONObject) docSrv.getConfigs().get("limits");
    if (limits != null)
    {
      maxSize = (String) limits.get("max-size");
    }
    LOG.entering(FileSizeLimit.class.getName(), "getImageViewMaxSize", maxSize);
    return maxSize;

  }

  public static String getHTMLViewMaxSize(String mime)
  {
    LOG.entering(FileSizeLimit.class.getName(), "getHTMLViewMaxSize", mime);
    String steType = DocumentTypeUtils.getStellentType(mime);
    boolean isPres = DocumentTypeUtils.PRESENTATION.equalsIgnoreCase(steType);
    boolean isText = DocumentTypeUtils.TEXT.equalsIgnoreCase(steType);

    String maxSize = "";
    maxSize = isPres ? PresConfig.getMaxSize() : (isText ? TextConfig.getMaxSize() : HTMLViewConfig.getMaxSize());
    LOG.entering(FileSizeLimit.class.getName(), "getHTMLViewMaxSize", maxSize);
    return maxSize;

  }

  public static String getMaxSize(String mime, String repoId)
  {
    LOG.entering(FileSizeLimit.class.getName(), "getMaxSize", mime);

    String maxSize = "";
    if (DocumentTypeUtils.isHTML(mime, repoId))
    {
      maxSize = getHTMLViewMaxSize(mime);
    }
    else
    {
      maxSize = getImageViewMaxSize(mime);
    }
    LOG.entering(FileSizeLimit.class.getName(), "getMaxSize", maxSize);
    return maxSize;

  }
}
