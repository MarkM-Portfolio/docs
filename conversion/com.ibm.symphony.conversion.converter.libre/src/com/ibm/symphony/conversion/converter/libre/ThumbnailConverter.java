/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.awt.Dimension;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;

import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ThumbnailConverter
{

  private static final Logger log = Logger.getLogger(ThumbnailConverter.class.getName());

  private static final String CLASS_NAME = ThumbnailConverter.class.getName();

  public static enum ThumbnailRequestType {
    UPLOAD_NEW_DOCUMENT, VIEW_DOCUMENT, GENERATE_THUMBNAILS
  }

  public static String FULLIMAGE_DIR = "pictures";

  public static String THUMBNAILSERVICE_DIR = "thumbnailService";

  public static final String CACHE_DIR_TEMPPREVIEW = "preview";

  public static final String CACHE_DIR_CCMPREVIEW = "ccm_preview";

  public static final String SMALL_THUMBNAIL_WIDTH_KEY = "smallthumbnailwidth";

  public static final String SMALL_THUMBNAIL_HEIGHT_KEY = "smallthumbnailheight";

  public static final String MEDIUM_THUMBNAIL_WIDTH_KEY = "mediumthumbnailwidth";

  public static final String MEDIUM_THUMBNAIL_HEIGHT_KEY = "mediumthumbnailheight";

  public static final String LARGE_THUMBNAIL_WIDTH_KEY = "largethumbnailwidth";

  public static final String LARGE_THUMBNAIL_HEIGHT_KEY = "largethumbnailheight";

  public static final String THUMBNAILS_CROPIMAGE_KEY = "cropimage";

  public static final int PRIMARY_MAX_SLOT = 1024;

  public static final int SECONDARY_MAX_SLOT = 1024;

  private static final String THUMBNAILSERVICE_FILENAME = "ThumbnailService";

  private static final long THUMBNAILSERVICE_FAILOVER_INTERVAL = 150 * 1000;

  private static final String SIZE_JSON = "size.json";

  private static final String SOFTWARE_MODE = "software_mode";

  private static int SMALL_THUMBNAIL_WIDTH = 100;

  private static int SMALL_THUMBNAIL_HEIGHT = 75;

  private static int MEDIUM_THUMBNAIL_WIDTH = 250;

  private static int MEDIUM_THUMBNAIL_HEIGHT = 188;

  private static int LARGE_THUMBNAIL_WIDTH = 500;

  private static int LARGE_THUMBNAIL_HEIGHT = 375;

  private static HttpClient httpClient;

  private static String viewerURL;

  private static String s2sToken;

  private static String code;

  private static String j2cAlias;

  private boolean isSpreadsheet = false;

  private File firstImg = null;

  private File targetPath = null;

  private String filePrefix = "";

  private String fileExt = "";

  private String docId;

  private String lastModified;

  private String repoId;

  private boolean inotesRequest;

  private ThumbnailRequestType thumbnailRequest;

  private File thumbSrvDir;

  private String userId;

  private static boolean isCloud;
  
  private String thumbnailPostUserEmail;
  
  private String communityId;

  private void init(File srcFile, Map properties)
  {
    log.entering(CLASS_NAME, "init", new Object[] { srcFile.getAbsolutePath() });
    firstImg = srcFile;
    setProperties(properties);
    log.exiting(CLASS_NAME, "init");
  }

  static
  {
    isCloud = isSmartCloud();
  }

  private static boolean isSmartCloud()
  {
    String softwareMode = (String) ConversionConfig.getInstance().getConfig(SOFTWARE_MODE);
    if (softwareMode == null)
    {
      log.log(Level.SEVERE, "Unable to get software_mode");
    }
    if (softwareMode != null && softwareMode.trim().equalsIgnoreCase("sc"))
    {
      return true;
    }
    return false;
  }

  private void setProperties(Map parameters)
  {
    if (filePrefix.isEmpty())
    {
      String picName = (String) parameters.get("title");
      filePrefix = picName != null ? picName : "image";
    }
    if (fileExt.isEmpty())
    {
      String oid = (String) parameters.get(com.ibm.symphony.conversion.converter.libre.Constants.OUTPUTIDKEY);
      fileExt = "." + oid.substring(3).toLowerCase();
    }
    if (fileExt.equals(".jpeg"))
      fileExt = ".jpg";
    String realTarget = (String) parameters.remove("thumbnailFolder");
    if (realTarget != null)
    {
      thumbSrvDir = new File(realTarget);
    }
    else
    {
      log.severe("Cannot find valid thumbSrvDir.");
      throw new IllegalStateException("Cannot find valid thumbSrvDir.");
    }
    String smallThumbnailWidth = (String) parameters.remove(SMALL_THUMBNAIL_WIDTH_KEY);
    if (smallThumbnailWidth != null)
    {
      SMALL_THUMBNAIL_WIDTH = Integer.parseInt(smallThumbnailWidth);
      log.fine("Using passed small thumbnail width: " + SMALL_THUMBNAIL_WIDTH);
    }
    else
    {
      log.fine("Using default small thumbnail width: " + SMALL_THUMBNAIL_WIDTH);
    }

    String samllThumbnailHeight = (String) parameters.remove(SMALL_THUMBNAIL_HEIGHT_KEY);
    if (samllThumbnailHeight != null)
    {
      SMALL_THUMBNAIL_HEIGHT = Integer.parseInt(samllThumbnailHeight);
      log.fine("Using passed small thumbnail height: " + SMALL_THUMBNAIL_HEIGHT);
    }
    else
    {
      log.fine("Using default small thumbnail height: " + SMALL_THUMBNAIL_HEIGHT);
    }

    String mediumThumbnailWidth = (String) parameters.remove(MEDIUM_THUMBNAIL_WIDTH_KEY);
    if (mediumThumbnailWidth != null)
    {
      MEDIUM_THUMBNAIL_WIDTH = Integer.parseInt(mediumThumbnailWidth);
      log.fine("Using passed medium thumbnail width: " + MEDIUM_THUMBNAIL_WIDTH);
    }
    else
    {
      log.fine("Using default medium thumbnail width: " + MEDIUM_THUMBNAIL_WIDTH);
    }

    String mediumThumbnailHeight = (String) parameters.remove(MEDIUM_THUMBNAIL_HEIGHT_KEY);
    if (mediumThumbnailHeight != null)
    {
      MEDIUM_THUMBNAIL_HEIGHT = Integer.parseInt(mediumThumbnailHeight);
      log.fine("Using passed medium thumbnail height: " + MEDIUM_THUMBNAIL_HEIGHT);
    }
    else
    {
      log.fine("Using default medium thumbnail height: " + MEDIUM_THUMBNAIL_HEIGHT);
    }

    String largeThumbnailWidth = (String) parameters.remove(LARGE_THUMBNAIL_WIDTH_KEY);
    if (largeThumbnailWidth != null)
    {
      LARGE_THUMBNAIL_WIDTH = Integer.parseInt(largeThumbnailWidth);
      log.fine("Using passed large thumbnail width: " + LARGE_THUMBNAIL_WIDTH);
    }
    else
    {
      log.fine("Using default large thumbnail width: " + LARGE_THUMBNAIL_WIDTH);
    }

    String largeThumbnailHeight = (String) parameters.remove(LARGE_THUMBNAIL_HEIGHT_KEY);
    if (largeThumbnailHeight != null)
    {
      LARGE_THUMBNAIL_HEIGHT = Integer.parseInt(largeThumbnailHeight);
      log.fine("Using passed large thumbnail height: " + LARGE_THUMBNAIL_HEIGHT);
    }
    else
    {
      log.fine("Using default large thumbnail height: " + LARGE_THUMBNAIL_HEIGHT);
    }

    String srcMIME = (String) parameters.get("sourceMIMEType");
    if (Util.isSpreadSheetFile(srcMIME))
    {
      isSpreadsheet = true;
    }
    else if ("application/gif".equals(srcMIME))
    {
      String value = (String) parameters.remove(THUMBNAILS_CROPIMAGE_KEY);
      isSpreadsheet = Boolean.valueOf(value);
    }

    String value = (String) parameters.remove("inotesRequest");
    if (value != null)
    {
      inotesRequest = Boolean.valueOf(value);
    }
    String v = (String) parameters.remove("thumbSrvReq");
    if (v != null)
    {
      thumbnailRequest = ThumbnailRequestType.valueOf(v);
    }
    docId = (String) parameters.remove("docId");
    lastModified = (String) parameters.remove("lastModified");
    userId = (String) parameters.remove("userId");
    repoId = (String) parameters.remove("repoId");
    thumbnailPostUserEmail = (String) parameters.remove("thumbnailPostUserEmail");
    communityId = (String) parameters.remove("communityId");
  }

  public static String[] hash(String docUri)
  {
    String[] result = new String[2];
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(docUri.getBytes());
      BigInteger[] modAndRemainder = new BigInteger(rawMD5).abs().divideAndRemainder(BigInteger.valueOf(PRIMARY_MAX_SLOT));
      result[1] = modAndRemainder[0].abs().remainder(BigInteger.valueOf(SECONDARY_MAX_SLOT)).toString();
      result[0] = modAndRemainder[1].toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      log.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
      throw new IllegalArgumentException(e);
    }

    log.log(Level.FINEST, "Primary Hash of DOC [" + docUri + "]: " + result[0]);
    log.log(Level.FINEST, "Secondary Hash of DOC [" + docUri + "]: " + result[1]);

    return result;
  }

  public ThumbnailConverter(File sourceFile, Map parameters)
  {
    init(sourceFile, parameters);
  }

  public ThumbnailConverter(File sourceFile, String filePrefix, String fileExt, Map parameters)
  {
    this.filePrefix = filePrefix;
    this.fileExt = fileExt;
    init(sourceFile, parameters);
  }

  private void generateThumbnails() throws DownsizeException, IOException, InterruptedException
  {
    if (firstImg.exists())
    {
      generateThumbnailsImpl(firstImg);
    }
  }

  public void generateThumbnails(File srcImg, File target)
  {
    if (repoId.equalsIgnoreCase("mail") || repoId.equalsIgnoreCase("vsfiles") || repoId.equalsIgnoreCase("external.rest")
        || repoId.equalsIgnoreCase("external.cmis") || repoId.equalsIgnoreCase("tempstorage"))
    {
      return;
    }

    File sizeJson = new File(thumbSrvDir, SIZE_JSON);
    thumbSrvDir.list();
    if (sizeJson.exists())
    {
      log.log(Level.FINER, "Thumbnails already existed. sizeJson path=" + sizeJson.getAbsolutePath());
      return;
    }

    try
    {
      generateThumbnailsImpl(srcImg);
    }
    catch (DownsizeException e)
    {
      log.log(Level.SEVERE, "Failed to generate thumbnails. DocId: {0} LastModified: {1} Error: {2}",
          new Object[] { docId, lastModified, e.getMessage() });
    }
    catch (IOException e)
    {
      log.log(Level.SEVERE, "Failed to generate thumbnails. DocId: {0} LastModified: {1} Error: {2}",
          new Object[] { docId, lastModified, e.getMessage() });
    }
    catch (InterruptedException e)
    {
      log.log(Level.SEVERE, "Failed to generate thumbnails. DocId: {0} LastModified: {1} Error: {2}",
          new Object[] { docId, lastModified, e.getMessage() });
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to generate thumbnails. DocId: {0} LastModified: {1} Error: {2}",
          new Object[] { docId, lastModified, e.getMessage() });
    }
  }

  private void generateThumbnailsImpl(File srcImg) throws DownsizeException, IOException, InterruptedException
  {
    if (inotesRequest || !aquireLock())
    {
      log.log(Level.FINER, "Generate thumbnail request was rejected. inotesRequest=" + inotesRequest);
      return;
    }
    int sHeight = generateSmallThumbnail(srcImg);
    int mHeight = generateMediumThumbnail(srcImg);
    int lHeight = generateLargelThumbnail(srcImg);
    generateSizeJson(new Dimension(100, sHeight), new Dimension(250, mHeight), new Dimension(500, lHeight), fileExt);
    notifyThumbnailDone(repoId, docId, lastModified, userId);
  }

  private boolean aquireLock()
  {
    if (thumbnailRequest == ThumbnailRequestType.GENERATE_THUMBNAILS)
    {
      log.log(Level.FINER, "Already aquired thumbnail lock. request=" + thumbnailRequest.name());
      return true;
    }
    if (!thumbSrvDir.exists())
    {
      thumbSrvDir.mkdirs();
    }
    File thumbSrvLock = new File(thumbSrvDir, THUMBNAILSERVICE_FILENAME);
    if (thumbSrvLock.exists())
    {
      boolean isFailover = new Date().getTime() - thumbSrvLock.lastModified() > THUMBNAILSERVICE_FAILOVER_INTERVAL;
      if (isFailover)
      {
        thumbSrvLock.delete();
        log.log(
            Level.WARNING,
            "Aquire lock for thumbnail service, failover occurred, and the time is passed 150s, will re-generate now. DocId: {0} LastModified: {1}",
            new Object[] { docId, lastModified });
      }
      else
      {
        log.log(Level.WARNING, "Thumbnail service is running on another node, this request will be ignored. DocId: {0} LastModified: {1}",
            new Object[] { docId, lastModified });
        return false;
      }
    }
    try
    {
      if (!thumbSrvLock.createNewFile())
      {
        log.log(Level.WARNING, "Create thumbnail service lock failed. DocId: {0} LastModified: {1}", new Object[] { docId, lastModified });
        return false;
      }
    }
    catch (IOException e)
    {
      log.log(Level.WARNING, "Create thumbnail service lock failed. DocId: {0} LastModified: {1}", new Object[] { docId, lastModified });
      return false;
    }
    log.log(Level.INFO, "Aquired thumbnail service lock successfully. DocId: {0} LastModified: {1}", new Object[] { docId, lastModified });
    return true;
  }

  public int generateSmallThumbnail(File next) throws DownsizeException, IOException, InterruptedException
  {
    return generateThumbnail(next, SMALL_THUMBNAIL_WIDTH, SMALL_THUMBNAIL_HEIGHT, "ts");
  }

  public int generateMediumThumbnail(File next) throws DownsizeException, IOException, InterruptedException
  {
    return generateThumbnail(next, MEDIUM_THUMBNAIL_WIDTH, MEDIUM_THUMBNAIL_HEIGHT, "tm");
  }

  public int generateLargelThumbnail(File next) throws DownsizeException, IOException, InterruptedException
  {
    return generateThumbnail(next, LARGE_THUMBNAIL_WIDTH, LARGE_THUMBNAIL_HEIGHT, "tl");
  }

  private int generateThumbnail(File next, int width, int height, String namePrfix) throws DownsizeException, IOException,
      InterruptedException
  {
    String localThumbnail = new File(next.getParentFile(), namePrfix + "_" + next.getName()).getAbsolutePath();
    Image image = new Image(next.getAbsolutePath());
    int w = image.getWidth();
    int h = image.getHeight();
    Dimension imgSize = checkImageSize(w, h);

    if (isSpreadsheet)
    {
      // crop image, starting from the left-upper corner (20, 60)
      if (w >= h)
      {
        Util.downSize(next.getAbsolutePath(), localThumbnail, null, 60, 60, width, height, Util.DOWNSIZE_GRAPHICS2D);
      }
      else
      {
        Util.downSize(next.getAbsolutePath(), localThumbnail, null, 60, 60, height, width, Util.DOWNSIZE_GRAPHICS2D);
      }
    }
    else
    {
      // scale image
      if (w >= h)
      {
        height = (imgSize.width > 0) ? (int) ((width * imgSize.height) / imgSize.width) : width;
        Util.downSize(next.getAbsolutePath(), localThumbnail, null, -1, -1, width, height, Util.DOWNSIZE_SCALE_INSTANCE);
      }
      else
      {
        height = (imgSize.width > 0) ? (int) ((width * imgSize.width) / imgSize.height) : width;
        Util.downSize(next.getAbsolutePath(), localThumbnail, null, -1, -1, height, width, Util.DOWNSIZE_SCALE_INSTANCE);
      }

    }

    // copy thumbnails
    File nfsThumbnail = new File(thumbSrvDir, namePrfix + "_" + filePrefix + fileExt);
    NFSFileUtil.nfs_copyFileToFile(new File(localThumbnail), nfsThumbnail.getAbsoluteFile(), NFSFileUtil.NFS_RETRY_SECONDS);
    return height;
  }

  public void generateSizeJson(Dimension small, Dimension medium, Dimension large, String fileExtension) throws IOException
  {
    OutputStream outputStream = null;

    StringBuffer JSON = new StringBuffer("{\"small\":{\"w\":").append(small.width).append(",\"h\":").append(small.height)
        .append("}, \"medium\":{\"w\":").append(medium.width).append(",\"h\":").append(medium.height).append("},\"large\":{\"w\":")
        .append(large.width).append(",\"h\":").append(large.height).append("}, \"format\":\"").append(fileExt).append("\"}");
    JSONObject sizeJson = JSONObject.parse(JSON.toString());
    try
    {
      File json = new File(thumbSrvDir, SIZE_JSON);
      outputStream = new FileOutputStream(json);
      sizeJson.serialize(outputStream);
    }
    catch (IOException e)
    {
      log.log(Level.SEVERE, "Error when create size.json  at {0} {1}" + new Object[] { targetPath, e });
      throw e;
    }
    finally
    {
      if (outputStream != null)
      {
        try
        {
          outputStream.close();
        }
        catch (IOException e)
        {
          log.log(Level.WARNING, "Close size.json Failed during Preparation. {0} {1}", new Object[] { sizeJson, e });
          throw e;
        }
      }
    }
  }

  private File getThumbnailCacheDir(File target)
  {
    File media = target.getParentFile();
    // for failover case, rendition manager changes "pictures" into
    // "pictures1".
    // Thumbnail dir needs the correspondingchange
    File nfsPicture = targetPath;
    String thumbSrvDirName = THUMBNAILSERVICE_DIR;
    try
    {
      String lastChars = nfsPicture.getName().substring(FULLIMAGE_DIR.length());
      Integer.parseInt(lastChars);
      thumbSrvDirName += lastChars;
      log.info("Using none default thumbnail service dir: " + thumbSrvDirName);
    }
    catch (Exception e)
    {
      ;
    }
    return new File(media, thumbSrvDirName);
  }

  public Dimension checkImageSize(int w, int h)
  {
    Dimension size = new Dimension(w, h);
    if (w > 0 && h > 0)
    {
      return size;
    }

    if (fileExt.equalsIgnoreCase("ppt") || fileExt.equalsIgnoreCase("pptx") || fileExt.equalsIgnoreCase("odp"))
    {
      // The ratio is 1024 * 768
      int DEFAULT_WIDTH = 1024;
      int DEFAULT_HEIGHT = 768;
      size.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      return size;
    }

    if (fileExt.equalsIgnoreCase("ppt") || fileExt.equalsIgnoreCase("pptx") || fileExt.equalsIgnoreCase("odp"))
    {
      // The ratio is 1024 * 768
      int DEFAULT_WIDTH = 1024;
      int DEFAULT_HEIGHT = 768;
      size.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      return size;
    }

    if (fileExt.equalsIgnoreCase("xls") || fileExt.equalsIgnoreCase("xlsx") || fileExt.equalsIgnoreCase("ods"))
    {
      // The ratio is 3541 * 1094
      int DEFAULT_WIDTH = 3541;
      int DEFAULT_HEIGHT = 1094;
      size.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      return size;
    }

    if (fileExt.equalsIgnoreCase("doc") || fileExt.equalsIgnoreCase("docx") || fileExt.equalsIgnoreCase("odt")
        || fileExt.equalsIgnoreCase("pdf"))
    {
      // The ratio is 1024 * 1325
      int DEFAULT_WIDTH = 1024;
      int DEFAULT_HEIGHT = 1325;
      size.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      return size;
    }

    size.setSize(1024, 768);
    return size;
  }

  public ConversionResult convert(File sourceFile, File targetFolder)
  {
    ConversionResult result = new ConversionResult();
    try
    {
      long jobStart = System.currentTimeMillis();
      generateThumbnails();
      result.setSucceed(true);
      result.setConvertedFile(targetFolder);
      long jobEnd = System.currentTimeMillis();
      log.log(Level.FINE, "STJOB thumbnail service cost " + (jobEnd - jobStart) + "ms and the sourcefile is " + sourceFile);
    }
    catch (DownsizeException e)
    {
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    catch (IOException e)
    {
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    catch (InterruptedException e)
    {
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }

    return result;
  }

  private static HttpClient createHttpClient(URL url, String j2cAlias, boolean isSmartCloud)
  {
    if (httpClient == null)
    {
      if (isCloud)
      {
        HttpClientCreator httpClientCreator = new HttpClientCreator();
        httpClient = httpClientCreator.create();
      }
      else
      {
        httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
        ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
      }
    }
    return httpClient;
  }

  public void notifyThumbnailDone(String repoId, String docId, String lastMod, String actorId)
  {
    boolean succ = false;
    if (viewerURL == null)
    {
      try
      {
        JSONObject topology = (JSONObject) ConversionService.getInstance().getConfig("topology");
        viewerURL = (String) topology.get("viewer");
        viewerURL = viewerURL + "/thumbnail";
        log.info("Viewer URL is set to be " + viewerURL);
      }
      catch (Exception e)
      {
        log.warning("Failed to get Viewer URL.  " + e.getMessage());
        viewerURL = null;
        return;
      }
    }

    if (s2sToken == null)
    {
      s2sToken = (String) ConversionService.getInstance().getConfig("token");
      code = new BASE64Encoder().encode(s2sToken.getBytes());
    }

    if (j2cAlias == null)
    {
      j2cAlias = (String) ConversionService.getInstance().getConfig("viewer_j2c_alias");
    }

    URL url = null;
    try
    {
      url = new URL(viewerURL);
    }
    catch (MalformedURLException e)
    {
      log.warning("Invalid viewer url. " + viewerURL + "Error: " + e.getLocalizedMessage());
    }

    httpClient = createHttpClient(url, j2cAlias, isCloud);

    if (httpClient == null)
    {
      log.warning("Failed to initialize http client.");
      return;
    }

    PostMethod request = new PostMethod(viewerURL);
    try
    {
      List<NameValuePair> parameters = new ArrayList<NameValuePair>();
      parameters.add(new NameValuePair("docid", docId));
      parameters.add(new NameValuePair("last_mod", lastMod));
      parameters.add(new NameValuePair("repoId", repoId));
      
      parameters.add(new NameValuePair("thumbnailPostUserEmail", thumbnailPostUserEmail));
      parameters.add(new NameValuePair("communityId",communityId));
      
      NameValuePair[] paras = new NameValuePair[parameters.size()];
      paras = parameters.toArray(paras);
      request.setQueryString(paras);

      if (isCloud)
      {
        request.setRequestHeader("s2stoken", s2sToken);// non-encoded
      }
      else
      {
        request.setRequestHeader("s2stoken", code); // encoded
      }
      request.setRequestHeader("onBehalfOf", actorId);

      int code = httpClient.executeMethod(request);
      
      Header responseHeaders = request.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null)
      {
        String responseID = responseHeaders.getValue();
        log.fine(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", viewerURL))
            .toString());
      }
      
      if (code == 400 || code == 500 || code == 403)
      {
        log.log(Level.WARNING, "Failed to call back to Viewer.  Doc id: " + docId + ".  Status code: " + code);
      }
      else
      {
        log.log(Level.INFO, "Sent callback to Viewer.  Doc id: " + docId + ".  Status code: " + code);
        succ = true;
      }

    }
    catch (IOException e)
    {
      log.warning("Failed to call back to Viewer.  Doc id: " + docId + ".  " + e.getMessage());
    }
    finally
    {
      if (request != null)
      {
        request.releaseConnection();
      }
      if (!succ)
      {
        FileUtil.cleanDirectory(thumbSrvDir.getParentFile());
      }
    }
  }
}
