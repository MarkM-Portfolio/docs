package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;

import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.json.java.JSONObject;

public class HTMLCacheDescriptor extends CacheDescriptor
{
  private static final Logger logger = Logger.getLogger(HTMLCacheDescriptor.class.getName());

  public HTMLCacheDescriptor(UserBean user, IDocumentEntry docEntry)
  {
    this.userId = user.getId();
    this.customId = user.getCustomerId();
    this.moreToHash = Arrays.asList(new String[] { "HTML" });
    initLocalCache(docEntry);
  }

  @Override
  public boolean isValid()
  {
    logger.entering(HTMLCacheDescriptor.class.getName(), "isValid", cacheURI);

    boolean ret = metaFileValid(new File(getInternalURI(), ICacheDescriptor.CACHE_META_FILE_LABEL));

    logger.exiting(HTMLCacheDescriptor.class.getName(), "isValid", ret);
    return ret;
  }

  @Override
  public boolean accessible()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public ViewContext getViewContext()
  {
    return ViewContext.VIEW_HTML_NON_SS;
  }

  @Override
  public boolean checkPasswordHash(String password)
  {
    logger.info("Checking password hash in cache...");
    String passwordHashJsonPath = getHtmlURI() + File.separator + "password_hash.json";
    logger.info("passwordHashJsonPath: " + passwordHashJsonPath);
    File passwordHashJsonFile = new File(passwordHashJsonPath);
    if (!FileUtil.exists(passwordHashJsonFile))
    {
      logger.info(passwordHashJsonPath + " does not exist. checkPasswordHash return false");
      return false;
    }
    String result;
    try
    {
      result = FileUtil.nfs_readFileAsString(passwordHashJsonFile, FileUtil.NFS_RETRY_SECONDS);
      logger.info(passwordHashJsonPath + " content reading done.");
      JSONObject metaJson = JSONObject.parse(result);
      logger.info(passwordHashJsonPath + " content parsing done.");
      String savedPasswordHash = (String) metaJson.get("PasswordHash");
      if (savedPasswordHash == null || savedPasswordHash.equals(DigestUtils.md5Hex(password)))
      {
        logger.info("password checked checkPasswordHash return ture");
        return true;
      }
    }
    catch (IOException e)
    {
      logger.log(Level.INFO, "Can not check password hash in cache. " + e.getMessage());
    }
    return false;
  }

  @Override
  public boolean isPasswordHashExist()
  {
    logger.info("Checking whether password hash in cache exsits or not...");
    String passwordHashJsonPath = getHtmlURI() + File.separator + "password_hash.json";
    logger.info("passwordHashJsonPath: " + passwordHashJsonPath);
    File passwordHashJsonFile = new File(passwordHashJsonPath);
    if (!FileUtil.exists(passwordHashJsonFile))
    {
      logger.info(passwordHashJsonPath + " does not exist. isPasswordHashExist return false");
      return false;
    } 
    logger.info(passwordHashJsonPath + " does exist. go on check the content.");
    String result;
    try
    {
      result = FileUtil.nfs_readFileAsString(passwordHashJsonFile, FileUtil.NFS_RETRY_SECONDS);
      logger.info(passwordHashJsonPath + " content reading done.");
      JSONObject passwordHashJson = JSONObject.parse(result);
      logger.info(passwordHashJsonPath + " content parsing done.");
      String savedPasswordHash = (String) passwordHashJson.get("PasswordHash");
      if (savedPasswordHash != null)
      {
        logger.info("savedPasswordHash not null, isPasswordHashExist return true");
        return true;
      }
      logger.info("savedPasswordHash is null, isPasswordHashExist return false");
    }
    catch (IOException e)
    {
      logger.log(Level.INFO, "Can not read password hash in cache. " + e.getMessage());
      return true;
    }
    return false;
  }
}
