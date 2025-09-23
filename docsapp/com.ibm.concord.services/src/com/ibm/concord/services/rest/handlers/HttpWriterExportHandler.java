package com.ibm.concord.services.rest.handlers;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;

public class HttpWriterExportHandler implements PostHandler
{
  private static final byte[] UTF8_HEADER = new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String documentURI = pathMatcher.group(2);
    String exName = pathMatcher.group(3);
    String fileExt = exName.substring(exName.lastIndexOf("."));
    // make sure to find document entry
    UserBean caller = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    IDocumentEntry entry = DocumentEntryUtil.getEntry(caller, repoId, documentURI, true);

    String content = request.getParameter("excontent");

    byte[] contentBytes = content.getBytes("utf-8");
    InputStream contentIn = new ByteArrayInputStream(contentBytes);

    OutputStream respOut = response.getOutputStream();

    // serve content out, write response headers
    // content length needs + 3 for UTF8_HEADER
    if (contentBytes.length > 0)
    {
      response.setContentLength(contentBytes.length + 3);
    }
    else
    {
      response.setContentLength(0);
    }

    response.setContentType(Platform.getMimeType(fileExt));
    response.setCharacterEncoding("UTF-8");
    response.setHeader("Content-Disposition", "attachment;filename=\"" + new String(exName.getBytes("UTF-8"), "ISO-8859-1") + "\"");


    response.setHeader("X-Content-Type-Options", "nosniff");
//    HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
    JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
    // has to be SC_OK or IE and CHROME don't download the attachment
    response.setStatus(HttpServletResponse.SC_OK);

    // write content
    if (contentBytes.length > 0)
    {
      // write utf-8 header
      respOut.write(UTF8_HEADER);
    }
    FileUtil.copyInputStreamToOutputStream(contentIn, respOut);

    if (entry != null)
    {
      // write export csv journal
      JournalHelper.Actor actor = new JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId());
      JournalHelper.Entity jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, entry.getTitleWithExtension(), entry.getDocId(),
          caller.getCustomerId());
      IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
          IJournalAdapter.class);
      journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.EXPORT, jnl_obj,
          JournalHelper.Outcome.SUCCESS).build());
    }
  }
}
