package com.ibm.concord.viewer.services.api;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.services.util.FileSizeLimit;
import com.ibm.json.java.JSONObject;

public class ListHandler implements GetHandler
{

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    // FIXME allow users to pass repository value
    String repoId = ViewerConfig.RepositoryType.FILES.getId();
    String method = request.getParameter("method");
    String userAgent = request.getHeader("User-Agent");
    JSONObject filstypeJson = new JSONObject();
    if ("fileType".equalsIgnoreCase(method))
    {
      for (String ext : FormatUtil.EXT2MIMETYPE.keySet())
      {
        String mime = FormatUtil.EXT2MIMETYPE.get(ext);
        String maxSize;
        if (DocumentTypeUtils.isHTML(mime, repoId) && !ViewerUtil.isIE8(userAgent))
        {
          maxSize = FileSizeLimit.getHTMLViewMaxSize(mime);
        }
        else
        {
          maxSize = FileSizeLimit.getImageViewMaxSize(mime);
        }

        filstypeJson.put(ext, maxSize);
      }
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);
      filstypeJson.serialize(response.getWriter());
      return;
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

  }
}
