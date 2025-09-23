package com.ibm.concord.services.rest.handlers;

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

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;

public class Svg2PngHandler implements PostHandler
{
  private static final Logger LOG = Logger.getLogger(Svg2PngHandler.class.getName());
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
	UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
	// String docuri =  request.getParameter("docuri");  
	// String repoId = request.getParameter("repoId"); 
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1); 
    String docuri = pathMatcher.group(2);

	
	IDocumentEntry docEntry = null;
	File convertFolder = null;    
    try
    {
      String chartId = request.getParameter("chartId");
      if(chartId==null)
        chartId = "chart";
      
      response.setContentType("image/png");
      response.setCharacterEncoding("UTF-8");
      
      String ss = "attachment; filename=\"" + chartId + ".png\"";
      response.setHeader("Content-disposition", ss);
      response.setStatus(HttpServletResponse.SC_OK);
      
      docEntry = DocumentEntryUtil.getEntry(user, repoId, docuri, false);
      if(docEntry==null)
    	  return;
      
      String svg = request.getParameter("svg");
      if(svg==null || svg.length()<6)
    	  return;
      
      DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(user, docEntry);
      File draftTempFolder = new File(draftDesc.getTempURI(null));
      convertFolder = new File(draftTempFolder, UUID.randomUUID().toString());
      FileUtil.nfs_mkdir(convertFolder, FileUtil.NFS_RETRY_SECONDS);
      
      IConversionService conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
    	        IConversionService.class);
      
      Map<String, Object> params = new HashMap<String, Object>();
      params.put("svg", svg);
      String path = convertFolder.getAbsolutePath();
      String resultPath = conversionService.convert(path, "image/svg-xml", "image/png", path, params);
      
      InputStream in = new FileInputStream(resultPath);
      OutputStream os = response.getOutputStream();
      FileUtil.copyInputStreamToOutputStream(in, os);
    }
    catch (Exception e)
    {
    	LOG.log(Level.WARNING, "SVG to png failed.", e);
    }
    finally
    {
      if(convertFolder!=null)
      {
    	  FileUtil.cleanDirectory(convertFolder);
          if(!convertFolder.delete())
          {
            LOG.log(Level.WARNING, "failed to delete folder " + convertFolder);
          }
      }
    }
  }
}
