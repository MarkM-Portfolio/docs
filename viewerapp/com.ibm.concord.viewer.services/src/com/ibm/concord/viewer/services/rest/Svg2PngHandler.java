package com.ibm.concord.viewer.services.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.concord.viewer.spi.util.FileUtil;

public class Svg2PngHandler implements PostHandler
{
  class Svg2PngConversionJob implements IConversionJob{

    private String docId;
    private String path;
    
    public Svg2PngConversionJob(String docId, String path){
      this.docId=docId;
      this.path=path;
    }
      
    @Override
    public boolean shouldCancel()
    {
      return false;
    }

    @Override
    public String getJobId()
    {
      return path;
    }

    @Override
    public String getDocumentId()
    {
      return docId;
    }

    @Override
    public String getCurrentType()
    {
      return Constant.STATUS_VIEW;
    }

    @Override
    public void setCurrentType(String currentType)
    {
      // TODO Auto-generated method stub
      
    }

    @Override
    public boolean hasUploadConversion()
    {
      return false;
    }

    /* (non-Javadoc)
     * @see com.ibm.concord.viewer.spi.job.IConversionJob#getJobPriority()
     */
    @Override
    public JOB_PRIORITY_TYPE getJobPriority()
    {
      return JOB_PRIORITY_TYPE.NORMAL;
    }

    @Override
    public void setPassword(String password)
    {
      // TODO Auto-generated method stub
      
    }

    @Override
    public String getPassword()
    {
      // TODO Auto-generated method stub
      return null;
    }
  }
    
  private static final Logger logger = Logger.getLogger(Svg2PngHandler.class.getName());

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1); 
    String docuri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    File convertFolder = null;
    try
    {
      String chartId = request.getParameter("chartId");
      if (chartId == null)
        chartId = "chart";

      response.setContentType("image/png");
      response.setCharacterEncoding("UTF-8");

      String ss = "attachment; filename=\"" + chartId + ".png\"";
      response.setHeader("Content-disposition", ss);
      response.setStatus(HttpServletResponse.SC_OK);

      docEntry = RepositoryServiceUtil.getEntry(user, repoId, docuri, null, false);
      if (docEntry == null)
        return;

      String svg = request.getParameter("svg");
      if (svg == null || svg.length() < 6)
        return;

      ICacheDescriptor desc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);
      File tempFolder = new File(desc.getTempURI(null));
      convertFolder = new File(tempFolder, UUID.randomUUID().toString());
      FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);

      IConversionService conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
          IConversionService.class);

      Map<String, Object> params = new HashMap<String, Object>();
      params.put("svg", svg);
      String lockerFileName = desc.getInternalURI() + File.separator + Constant.VIEWER_JOB_LOCKER;
      params.put(Constant.VIEWER_JOB_LOCKER_KEY, lockerFileName);
      params.put(Constant.VIEWER_SHARED_DATA_NAME, desc.getSharedDataName());
      params.put(Constant.VIEWER_SHARED_DATA_ROOT, desc.getCacheHome());
      String path = convertFolder.getAbsolutePath();
      Svg2PngConversionJob fakeJob=new Svg2PngConversionJob(docEntry.getDocId(), path);
      conversionService.convert(path, "image/svg-xml", "image/png", path, params, false, fakeJob);

      File img = new File(convertFolder, "result.png");
      if (img.exists())
      {
        InputStream in = new FileInputStream(img);
        OutputStream os = response.getOutputStream();
        FileUtil.copyInputStreamToOutputStream(in, os);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "SVG to png failed.", e);
    }
    finally
    {
      if (convertFolder != null)
      {
        FileUtil.cleanDirectory(convertFolder);
        if (!convertFolder.delete())
        {
          logger.log(Level.WARNING, "failed to delete folder " + convertFolder);
        }
      }
    }

  }
}
