package com.ibm.concord.viewer.services.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;

import com.ibm.concord.spreadsheet.common.utils.StreamBuilder;

public class EncryptionStreamer implements StreamBuilder
{
  private IDocumentEntry docEntry;
  UserBean user;
  
  public EncryptionStreamer(IDocumentEntry docEntry, UserBean user)
  {
    this.docEntry = docEntry;
    this.user = user;
  }
  
  public InputStream getInputStream(File f)
  {
    InputStream is = null;
    try
    {
      is = new FileInputStream(f);
    }
    catch (FileNotFoundException e)
    {
    }
    if (is == null)
      return null;
    else
      return ViewerUtil.getEncryptStream(is, docEntry, user, Encryptor.EncryptionMode.DECRYPTION);
  }
  
  public InputStream getInputStream(String path)
  {
    return getInputStream(new File(path));
  }
}