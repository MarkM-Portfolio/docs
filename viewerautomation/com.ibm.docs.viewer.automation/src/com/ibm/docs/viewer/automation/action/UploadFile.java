package com.ibm.docs.viewer.automation.action;

import java.io.File;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.FileEntity;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.util.EncodingHelper;
import com.ibm.docs.viewer.automation.util.FileUtil;

/**
 * @author niebomin
 * 
 */
public class UploadFile extends AbstractAction
{
  private String userId;

  private File file;

  private String fileId;

  private static final String FILE_ID_STARTS = "<td:uuid>";

  private static final String FILE_ID_ENDS = "</td:uuid>";

  private static final int successCode = 201;

  public UploadFile(HttpClient client, Server server, String userId, File f)
  {
    super(client, server, RequestType.HTTP_POST, successCode);
    this.userId = userId;
    this.file = f;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    String name = file.getName();
    String ext = name.substring(name.lastIndexOf(".") + 1);
    String uploadName = getFileName(ext);

    request.setHeader("Slug", EncodingHelper.encodeHeader(uploadName));

    ((HttpPost) request).setEntity(new FileEntity(file/* , ContentType.create(mimeType, "UTF-8") */));
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);

    // TODO change to regEx
    String ret = data.getDataAsString();
    int start = ret.indexOf(FILE_ID_STARTS);
    int end = ret.indexOf(FILE_ID_ENDS);
    if (end > start)
    {
      fileId = ret.substring(start + FILE_ID_STARTS.length(), end);
    }
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/files/form/api/userlibrary/").append(userId)
        .append("/feed?objectTypeId=00000000-00000-0000-0001-00000000000000&isExternal=false&propagate=false").toString();
  }

  private String getFileName(String ext)
  {
    return new StringBuffer("viewer_automation_").append(System.currentTimeMillis()).append(".").append(ext).toString();
  }

  @Override
  public String getData()
  {
    return fileId;
  }

  public static void main(String[] args)
  {
    // UploadFile uf = new UploadFile();
    // String name = "ab.odt";
    // String ext = name.substring(name.lastIndexOf(".") + 1);
    // String uploadName = uf.getFileName(ext);
    // assertEquals(true, uploadName.indexOf(".odt")>=0);

    // Pattern pattern = Pattern.compile("<td:uuid>/w*</td:uuid>");
    String s = FileUtil.readFile("d:/viewer/dev/main/com.ibm.docs.viewer.automation/src/com/ibm/docs/viewer/automation/action/entry.txt");
    int i1 = s.indexOf("<td:uuid>");
    int i2 = s.indexOf("</td:uuid>");
    String s2 = s.substring(i1 + "<td:uuid>".length(), i2);
    System.out.println(s2);
  }

}
