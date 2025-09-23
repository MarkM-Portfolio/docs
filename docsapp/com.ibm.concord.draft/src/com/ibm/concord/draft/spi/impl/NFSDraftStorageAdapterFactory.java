/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.spi.impl;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.concord.spi.draft.IDraftStorageAdapterFactory;
import com.ibm.concord.spi.util.IStorageAdapter;

public class NFSDraftStorageAdapterFactory implements IDraftStorageAdapterFactory
{
  private static final Logger LOGGER = Logger.getLogger(NFSDraftStorageAdapterFactory.class.getName());

  public IStorageAdapter newDraftAdapter(String pathname, Class<?> aClass)
  {
    try
    {
      IDraftStorageAdapter draftFile = (IDraftStorageAdapter) Class.forName(aClass.getName()).newInstance();
      draftFile.init(pathname);
      return draftFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    return null;
  }

  public IStorageAdapter newDraftAdapter(String parent, String child, Class<?> aClass)
  {
    try
    {
      IDraftStorageAdapter draftFile = (IDraftStorageAdapter) Class.forName(aClass.getName()).newInstance();
      draftFile.init(parent, child);
      return draftFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    return null;
  }

  public IStorageAdapter newDraftAdapter(IDraftStorageAdapter parent, String child, Class<?> aClass)
  {
    try
    {
      IDraftStorageAdapter draftFile = (IDraftStorageAdapter) Class.forName(aClass.getName()).newInstance();
      draftFile.init(parent, child);
      return draftFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize IDraftStorageAdapter implementation.", e);
    }
    return null;
  }

  public IDraftStorageAdapter newDraftAdapter(String pathname)
  {
    IDraftStorageAdapter draftFile = new NFSDraftStorageAdapter();
    draftFile.init(pathname);
    return draftFile;
  }

  public IDraftStorageAdapter newDraftAdapter(String parent, String child)
  {
    IDraftStorageAdapter draftFile = new NFSDraftStorageAdapter();
    draftFile.init(parent, child);
    return draftFile;
  }

  public IDraftStorageAdapter newDraftAdapter(IDraftStorageAdapter parent, String child)
  {
    IDraftStorageAdapter draftFile = new NFSDraftStorageAdapter();
    draftFile.init(parent, child);
    return draftFile;
  }

}
