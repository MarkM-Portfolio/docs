/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.filetype;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.logging.Logger;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.filesystem.NPOIFSFileSystem;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.poi.poifs.crypt.Decryptor;

public class OOXMLPwdDetector
{
  private static final int BUFFER = 1024;

  private static Logger log = Logger.getLogger(OOXMLPwdDetector.class.getName());

  public static boolean isPwdProtected(File sourceFile)
  {
    MSOfficeOLEDetector detect = new MSOfficeOLEDetector();
    return detect.isMSOfficeEncrypt(sourceFile);
  }
  
  public static boolean decryptOOXML(File encryptedFile, String password) throws IOException, GeneralSecurityException
  {
    if (password == null || password.isEmpty())
    {
      return false;
    }
    NPOIFSFileSystem filesystem = new NPOIFSFileSystem(encryptedFile);
    EncryptionInfo info = new EncryptionInfo(filesystem);
    Decryptor d = Decryptor.getInstance(info);

    if (!d.verifyPassword(password))
    {
      return false;
    }

    InputStream dataStream = d.getDataStream(filesystem);
    File decryptedFile = new File(encryptedFile.getAbsolutePath() + "decrypted");
    FileUtils.copyInputStreamToFile(dataStream, decryptedFile);
    IOUtils.closeQuietly(dataStream);

    filesystem.close();
    FileUtils.forceDelete(encryptedFile);
    FileUtils.moveFile(decryptedFile, encryptedFile);

    return true;
  }
}