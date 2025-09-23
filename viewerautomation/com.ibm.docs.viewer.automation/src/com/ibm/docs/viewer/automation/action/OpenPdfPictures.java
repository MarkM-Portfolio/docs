package com.ibm.docs.viewer.automation.action;

import java.awt.Image;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;

/**
 * 
 * @author wangyixin
 * 
 */

public class OpenPdfPictures extends AbstractAction
{

  private String url;

  private boolean exists;

  private static final Logger logger = Logger.getLogger(OpenPdfPictures.class.getName());

  public OpenPdfPictures(HttpClient client, Server server, String url)
  {
    super(client, server, RequestType.HTTP_GET);
    this.url = url;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {

  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    File temp = new File(System.getProperty("java.io.tmpdir"));
    File imageFile = new File(temp, "pdf_test_image.png");
    OutputStream out = null;
    InputStream in = null;
    try
    {
      in = data.getInputStream();
      out = new BufferedOutputStream(new FileOutputStream(imageFile));
      byte[] buffer = new byte[1024];
      int numRead;
      while ((numRead = in.read(buffer)) != -1)
      {
        out.write(buffer, 0, numRead);

      }
      in.close();
      out.close();

      Image img = ImageIO.read(imageFile);
      if (img == null)
        exists = false;
      else
        exists = true;
    }
    catch (Exception e)
    {
      exists = false;
      logger.log(Level.SEVERE, "Get pdf image error.Exception: ", e);
    }

  }

  @Override
  protected String getURI()
  {
    return url;
  }

  @Override
  public Object getData()
  {
    return exists;
  }

}
