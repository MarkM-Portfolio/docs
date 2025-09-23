package com.ibm.docs.api.rest.sample.handlers;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.ibm.docs.api.rest.sample.util.FileUtil;
import com.ibm.docs.api.rest.sample.util.RequestParser;
import com.ibm.docs.api.rest.sample.util.MimeTypeUtil;
import com.ibm.json.java.JSONObject;

public class DocumentContentHandler implements GetHandler, PostHandler
{

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    RequestParser parser = new RequestParser(request);
    String docId = parser.getDocId();

    ServletContext context = request.getSession().getServletContext();
    
    String filePath = context.getRealPath("/WEB-INF/samples/" + docId);
    String metaFilePath = filePath + ".meta";
    String mime = MimeTypeUtil.MIME_TYPE_MAP.getContentType(filePath);
    FileUtil file = new FileUtil(filePath, metaFilePath);

    InputStream is = file.getContentStream();
    if(is != null)
    {
      response.setContentType(mime);
      response.setHeader("Content-disposition", "filename=" + docId);
      response.setStatus(HttpServletResponse.SC_OK);

      BufferedInputStream bis = new BufferedInputStream(is);
      ServletOutputStream out = response.getOutputStream();
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = bis.read(data)) > 0)
      {
        out.write(data, 0, numRead);
      }
      bis.close();
      out.close();
    }
    else
    {
      response.sendError(HttpServletResponse.SC_NO_CONTENT);
    }
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {    
    RequestParser parser = new RequestParser(request);
    String docId = parser.getDocId();

    ServletContext context = request.getSession().getServletContext();
    
    String filePath = context.getRealPath("/WEB-INF/samples/" + docId);
    String metaFilePath = filePath + ".meta";
    FileUtil file = new FileUtil(filePath, metaFilePath);
    JSONObject obj = null;
    
    DiskFileItemFactory factory = new DiskFileItemFactory();       
    File repository = (File) context.getAttribute("javax.servlet.context.tempdir");
    factory.setRepository(repository);
    ServletFileUpload upload = new ServletFileUpload(factory);   
    upload.setSizeMax(204800000);
    List<FileItem> items = upload.parseRequest(request);   
    Iterator<FileItem> iter = items.iterator();
    while (iter.hasNext()) {
        FileItem item = iter.next();
        if (item.isFormField()) {
          String name = item.getFieldName();
          String value = item.getString();
        } else {
          String fieldName = item.getFieldName();
          String fileName = item.getName();
          String contentType = item.getContentType();
          boolean isInMemory = item.isInMemory();
          long sizeInBytes = item.getSize();          
          InputStream uploadedStream = item.getInputStream();
          obj = file.setContentStream(uploadedStream);
          uploadedStream.close();
          break;
        }
    }    
        
    if(obj != null)
    {
      response.setContentType("text/x-json");
      response.setCharacterEncoding("UTF-8");
      obj.serialize(response.getWriter());
    }
    else
    {
      response.sendError(HttpServletResponse.SC_NO_CONTENT);
    }
  }

}
