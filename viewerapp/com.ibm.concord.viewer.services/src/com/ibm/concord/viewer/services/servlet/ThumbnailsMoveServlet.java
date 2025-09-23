package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.nio.channels.FileChannel;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Scanner;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ThumbnailsMoveServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final Logger LOG = Logger.getLogger(ThumbnailsMoveServlet.class.getName());

  private static final String LOCK_FILE_NAME = "ThumbnailService";

  public static final String PREVIEW = "preview";

  private static final String LARGE_THUMBNAIL_NAME = "tl_image";

  private static final String S2S_METHOD_LIVE = "conn_live";

  private static final String USER_AGENT = "User-Agent";

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String docId = request.getParameter("docid");
    String lastMod = request.getParameter("last_mod");
    String repoId = request.getParameter("repoId");
    String thumbnailPostUserEmail = request.getParameter("thumbnailPostUserEmail");
    String communityId = request.getParameter("communityId");

    if (repoId == null || repoId.isEmpty())
    {
      LOG.log(Level.WARNING,
          "Failed to move thumbnails due to invalid repoId. Please check the conversion build which may need to be upgraded to the latest one.");
      return;
    }

    ThumbnailDescriptor desp = new ThumbnailDescriptor(docId, lastMod, repoId);

    boolean notACviewer = ViewerConfig.getInstance().isOnpremise() || ViewerConfig.getInstance().getIsVerseEnv();
    if (repoId.equals(RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID) && notACviewer)// lcfiles of onpremise or viewernext viewer
    {
      StringBuffer msg = new StringBuffer("Post thumbnail to Files start. docId:");
      msg.append(docId).append("; lastMod:").append(lastMod).append("; repoId").append(repoId).append("; communityId:").append(communityId);
      LOG.log(Level.INFO, msg.toString());
      FileFilter thumbnalFilter = new FileFilter()
      {
        public boolean accept(File file)
        {
          if (file.getName().contains(LARGE_THUMBNAIL_NAME))
          {
            return true;
          }
          return false;
        }
      };
      File[] thumbnails = new File(desp.getThumbnailServiceURI()).listFiles(thumbnalFilter);
      if (thumbnails.length > 0)
      {
        Thread moveThread = new Thread(new MoveThumbnailRun(thumbnailPostUserEmail, communityId, docId, thumbnails, desp));
        moveThread.start();
      }
      else
      {
        LOG.log(Level.SEVERE, "Can not find thumbnail " + thumbnails[0].getAbsolutePath());
      }
      LOG.log(Level.INFO, "Post thumbnail to Files finished. docId:" + docId + "; lastMod:" + lastMod + "; repoId:" + repoId);
      return;
    }
    else if (repoId.equals(RepositoryServiceUtil.TOSCANA_REPO_ID) || repoId.equals(RepositoryServiceUtil.SANITY_REPO_ID))
    {
      IRepositoryAdapter repository = RepositoryServiceUtil.getRepositoryAdapter(repoId);

      try
      {
        String code = request.getParameter("userCode");
        URLConfig.setRequestCode(code);
        repository.setThumbnail(null, docId, lastMod);
      }
      catch (RepositoryAccessException e)
      {
        LOG.log(Level.WARNING, "RepositoryAccessException occurred when thumbnails call back : " + docId, e);
      }
    }
    else
    // ecm and lcfiles of acviewer
    {
      if (repoId.equals(RepositoryServiceUtil.ECM_FILES_REPO_ID))
      {
        File dest = new File(desp.getThumbnailServiceURI());
        if (dest.exists())
        {
          cleanTempFiles(dest);
        }
        return;
      }
      String filesThumbnailsHome = new StringBuffer()
          .append(
              RepositoryServiceUtil
                  .getRepositoryFilesPath(ViewerConfig.getInstance().isLocalEnv() ? RepositoryServiceUtil.LOCALTEST_FILES_REPO_ID : repoId))
          .append(File.separator).append(PREVIEW).toString();
      String[] hash = ViewerUtil.hash(docId);
      File dest = new File(new File(new File(new File(filesThumbnailsHome, hash[0]), hash[1]), docId), lastMod);
      if (!dest.exists())
      {
        dest.mkdirs();
      }
      moveThumbnails(new File(desp.getThumbnailServiceURI()), dest);
    }

  }

  @Override
  /**
   * For sanity check
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setStatus(HttpServletResponse.SC_OK);
  }

  private void moveThumbnails(File srcDir, File destDir)
  {
    long start = System.currentTimeMillis();
    LOG.entering(ThumbnailsMoveServlet.class.getName(), "moveThumbnails",
        new Object[] { srcDir.getAbsolutePath(), destDir.getAbsolutePath() });

    File[] files = srcDir.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        return name.endsWith(".jpg") || name.endsWith(".png") || name.startsWith("size");
      }
    });
    boolean succ = true;
    if (files == null)
    {
      LOG.log(Level.WARNING, "There is no thumbnails need to be move. Source files are NOT existed!");
      return;
    }
    for (File file : files)
    {
      LOG.fine(file.getAbsolutePath());

      File target = new File(destDir, file.getName());
      if (!target.exists())
      {
        try
        {
          target.createNewFile();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Error occurred when creating file: " + target.getAbsolutePath(), e);
        }
      }
      FileInputStream fis = null;
      FileOutputStream fos = null;
      FileChannel fic = null;
      FileChannel foc = null;
      try
      {
        long p = 0, dp, size;
        fos = new FileOutputStream(target);
        fis = new FileInputStream(file);
        fic = fis.getChannel();
        foc = fos.getChannel();
        size = fic.size();
        while ((dp = foc.transferFrom(fic, p, size)) > 0)
        {
          p += dp;
        }
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.WARNING,
            "Copy file failed.  From: " + file.getAbsolutePath() + ".  To: " + target.getAbsolutePath() + ".  " + e.getMessage());
        succ = false;
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING,
            "Copy file failed.  From: " + file.getAbsolutePath() + ".  To: " + target.getAbsolutePath() + ".  " + e.getMessage());
        succ = false;
      }
      finally
      {
        if (fic != null)
        {
          try
          {
            fic.close();
          }
          catch (IOException e)
          {
            LOG.warning(e.getMessage());
          }
        }
        if (foc != null)
        {
          try
          {
            foc.close();
          }
          catch (IOException e)
          {
            LOG.warning(e.getMessage());
          }
        }
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            LOG.warning(e.getMessage());
          }
        }
        if (fos != null)
        {
          try
          {
            fos.close();
          }
          catch (IOException e)
          {
            LOG.warning(e.getMessage());
          }
        }
      }
    }
    if (succ)
    {
      FileUtil.cleanDirectory(srcDir.getParentFile());
      LOG.info(new StringBuffer("Successfully copied thumbnails from ").append(srcDir.getAbsolutePath()).append(" to ")
          .append(destDir.getAbsolutePath()).toString());
    }
    else
    {
      FileUtil.removeDirectory(destDir);
      File lockFile = new File(srcDir, LOCK_FILE_NAME);
      if (lockFile.exists())
      {
        if (!lockFile.delete())
        {
          LOG.warning("Failed to delete thumbnail lock file: " + lockFile.getAbsolutePath());
        }
      }
      if (files.length > 0)
      {
        LOG.info(new StringBuffer("Failed to copy thumbnails from ").append(srcDir.getAbsolutePath()).append(" to ")
            .append(destDir.getAbsolutePath()).toString());
      }
    }
    LOG.exiting(ThumbnailsMoveServlet.class.getName(), "moveThumbnails", new Object[] { srcDir.getAbsolutePath(),
        destDir.getAbsolutePath(), new Long(System.currentTimeMillis() - start) });
  }

  private void purgeFiles(File[] files)
  {
    if (files == null)
      return;
    for (int i = 0; i < files.length; i++)
    {
      boolean b = false;
      File f = files[i];
      LOG.info("prepare to purge: " + f.getAbsolutePath());
      if (f.isDirectory())
      {
        FileUtil.cleanDirectory(f);
      }

      b = f.delete();
      if (!b)
      {
        LOG.log(Level.WARNING, "Failed removing temp file: {0}", f.getAbsolutePath());
      }
      else
      {
        LOG.log(Level.INFO, "Successfully removed temp file: {0}", f.getAbsolutePath());
      }
    }
  }

  private void cleanTempFiles(File tempDir)
  {
    LOG.info("Clean conversion results. PATH=" + tempDir.getParentFile().getAbsolutePath());
    File[] tempImgFiles = tempDir.getParentFile().listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        if (dir.isDirectory())
        {
          return !name.equals(ICacheDescriptor.THUMBNAIL_FOLDER_NAME);
        }
        return true;
      }

    });

    purgeFiles(tempImgFiles);

    LOG.info("Clean lock and status files. PATH=" + tempDir.getAbsolutePath());
    File[] tempStatusFiles = tempDir.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        return !name.endsWith(".jpg") && !name.endsWith(".png") && !name.startsWith("size");
      }

    });
    purgeFiles(tempStatusFiles);
  }

  private HttpClient getHttpClient(JSONObject config)
  {
    if (S2S_METHOD_LIVE.equals(config.get("s2s_method")))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      return httpClientCreator.create();
    }
    else
    {
      return ServerToServerHttpClientFactory.INSTANCE.getHttpClient((String) config.get("j2c_alias"));
    }
  }

  protected void setRequestHeaders(JSONObject config, HttpMethod requestMethod, HttpMethod responseMethod, String userEmail)
  {
    requestMethod.setRequestHeader(USER_AGENT, ViewerUtil.getUserAgent("Files"));
    if (S2S_METHOD_LIVE.equals(config.get("s2s_method")))
    {
      requestMethod.setRequestHeader("s2stoken", (String) config.get("s2s_token"));
      requestMethod.setRequestHeader("onBehalfOf", userEmail);
    }
    else
    {
      // only need admin role
      requestMethod.setRequestHeader("X-LConn-RunAs", "useremail=" + userEmail
          + ",excludeRole=widget-admin, excludeRole=global-moderator, excludeRole=search-admin, excludeRole=app-connector");
      if (responseMethod != null)
      {
        String nonceCookie = "", jSessionCookie = "", ltpaCookie = "";
        try
        {
          // SONATA client can not handle the cookies Files return, so we need to add the cookies to the
          // second request manually.
          nonceCookie = responseMethod.getResponseHeader("Set-Cookie").getValue();
          int index = nonceCookie.indexOf("JSESSIONID");
          jSessionCookie = nonceCookie.substring(index, nonceCookie.indexOf(";", index));
          ltpaCookie = responseMethod.getRequestHeader("Cookie").getValue();
          requestMethod.setRequestHeader("Cookie", jSessionCookie + "; " + ltpaCookie);
        }
        catch (Exception e)
        {
          StringBuffer cookie = new StringBuffer("nonceCookie:");
          cookie.append(nonceCookie);
          cookie.append(";jSessionCookie:");
          cookie.append(jSessionCookie);
          cookie.append(";ltpaCookie:");
          cookie.append(ltpaCookie);
          LOG.warning("Failed to set cookies to post thumbnail request." + cookie.toString());
        }
      }
    }
    requestMethod.setRequestHeader("X-LConn-RunAs-For", "application");
  }

  private String getNonceURL(JSONObject config)
  {
    String fileUrl = (String) config.get("server_url");
    StringBuffer ret = new StringBuffer(fileUrl);
    if (fileUrl.endsWith("/"))
    {
      ret.append("basic/api/nonce");
    }
    else
    {
      ret.append("/basic/api/nonce");
    }
    return ret.toString();
  }

  private String getPostURL(JSONObject config, String communityId, String docId, String nonce)
  {
    if (StringUtils.isNotBlank(communityId) && communityId != "null")
      return getCommunityPostThumbnailURL(config, communityId, docId, nonce);
    else
      return getPostThumbnailURL(config, docId, nonce);
  }

  private String getPostThumbnailURL(JSONObject config, String docId, String nonce)
  {
    String fileUrl = (String) config.get("server_url");
    StringBuffer ret = new StringBuffer(fileUrl);
    if (fileUrl.endsWith("/"))
    {
      ret.append("basic/api/myuserlibrary/document/" + docId + "/feed?renditionKind=renditionTemplate&nonce=" + nonce);
    }
    else
    {
      ret.append("/basic/api/myuserlibrary/document/" + docId + "/feed?renditionKind=renditionTemplate&nonce=" + nonce);
    }
    return ret.toString();
  }

  private String getCommunityPostThumbnailURL(JSONObject config, String communityId, String docId, String nonce)
  {
    String fileUrl = (String) config.get("server_url");
    StringBuffer ret = new StringBuffer(fileUrl);
    if (fileUrl.endsWith("/"))
    {
      ret.append("basic/api/communitylibrary/" + communityId + "/document/" + docId + "/feed?renditionKind=renditionTemplate&nonce="
          + nonce);
    }
    else
    {
      ret.append("/basic/api/communitylibrary/" + communityId + "/document/" + docId + "/feed?renditionKind=renditionTemplate&nonce="
          + nonce);
    }
    return ret.toString();
  }

  private void logResponse(HttpMethod method, int statusCode)
  {
    if (!LOG.isLoggable(Level.FINE))
      return;
    LOG.log(Level.FINE, "Post thumbnail to Files with following request http headers");
    Header[] headers = method.getRequestHeaders();
    for (Header header : headers)
    {
      LOG.log(Level.FINE, header.getName() + "==" + header.getValue());
    }
    LOG.log(Level.FINE, "Post thumbnail to Files with following response http headers");
    headers = method.getResponseHeaders();
    for (Header header : headers)
    {
      LOG.log(Level.FINE, header.getName() + "==" + header.getValue());
    }
    LOG.log(Level.FINE, "HTTP return code: " + statusCode);
  }

  class MoveThumbnailRun implements Runnable
  {
    private String thumbnailPostUserEmail;

    private String communityId;

    private String docId;

    private File[] thumbnails;

    private ThumbnailDescriptor desp;

    public MoveThumbnailRun(String thumbnailPostUserEmail, String communityId, String docId, File[] thumbnails, ThumbnailDescriptor desp)
    {
      this.thumbnailPostUserEmail = thumbnailPostUserEmail;
      this.communityId = communityId;
      this.docId = docId;
      this.thumbnails = thumbnails;
      this.desp = desp;
    }

    @Override
    public void run()
    {
      try
      {
        IRepositoryAdapter repository = RepositoryServiceUtil.getRepositoryAdapter(RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID);
        JSONObject config = repository.getRepositoryConfig();
        if (config == null)
        {
          LOG.warning("Post thumbnail failed, please check Files respositry config");
          return;
        }
        HttpClient client = getHttpClient(config);
        GetMethod getMethod = new GetMethod(getNonceURL(config));
        setRequestHeaders(config, getMethod, null, thumbnailPostUserEmail);
        int ret = client.executeMethod(getMethod);
        String nonce = getMethod.getResponseBodyAsString();
        logResponse(getMethod, ret);

        String filesURL = getPostURL(config, communityId, docId, nonce);
        LOG.log(Level.FINE, "Post thumbnail URL:" + filesURL);
        PostMethod postMethod = new PostMethod(filesURL);
        Part[] parts = new Part[] { new FilePart("file", thumbnails[0]) };
        postMethod.setRequestEntity(new MultipartRequestEntity(parts, postMethod.getParams()));
        setRequestHeaders(config, postMethod, getMethod, thumbnailPostUserEmail);
        postMethod.setRequestHeader("X-Update-Nonce", nonce);
        ret = client.executeMethod(postMethod);
        logResponse(postMethod, ret);
        if (ret == HttpStatus.SC_CREATED || ret == HttpStatus.SC_OK)
        {
          // Clean thumbnail cache folder and keep the result files return.
          //Related to DOCS-476 Viewerapp does not succesfully post generated to thumbnails to Files when doing bulk thumbnail generation
          //If we found "errorMessage" string in result file, we are not writing this result file in preview directory
          File workFolder = new File(desp.getThumbnailServiceURI()).getParentFile();
          FileUtil.cleanDirectory(workFolder);
          InputStream is = postMethod.getResponseBodyAsStream(); 
          Scanner s = new Scanner(is).useDelimiter("\\A");
          String resultfile = s.hasNext() ? s.next() : "";
          if(!resultfile.contains("errorMessage")){ 
            is = new ByteArrayInputStream(resultfile.getBytes());
            FileUtil.copyInputStreamToDir(is, workFolder, "result");
            LOG.log(Level.FINE, "Clean thumbnail folder and create result.");
          } 
        }
        else
        {
          LOG.log(Level.WARNING,
              "Failed to post thumbnail to Files, pls check acViewer NFS response result. The response status code is {0}",
              new Object[] { ret });
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to post thumbnail to Files through http", e);
      }
    }
  }
}
