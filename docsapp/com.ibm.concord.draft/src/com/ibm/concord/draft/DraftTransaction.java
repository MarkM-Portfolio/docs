/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.concord.draft;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.exception.DraftTransactionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.concord.spi.draft.IDraftStorageAdapterFactory;
import com.ibm.docs.framework.IComponent;

/**
 * This class is used to write draft files in transaction, so that can keep the draft data integrity.
 * Write the draft files into a temporary folder, then move these files into real draft folder.
 * 
 */
public class DraftTransaction
{
  private static final Logger LOG = Logger.getLogger(DraftTransaction.class.getName());
  
  // BEGIN_STATE presents that transaction has begun.
  public final static int BEGIN_STATE = 0;
  // COMMITTING_STATE presents transaction was committing.
  public final static int COMMITTING_STATE = 1;
  // COMMITTED_STATE presents transaction was committed.
  public final static int COMMITTED_STATE = 2;
  
  public final static String BEGIN_STATE_FILE = "tstate.0";
  public final static String COMMITTING_STATE_FILE = "tstate.1";
  public final static String COMMITTED_STATE_FILE = "tstate.2";
  
  private DraftDescriptor draftDescriptor;
  private String transRootURI;
  private String transDraftURI;
  
  /**
   * 
   * @param draftDescriptor
   */
  public DraftTransaction(DraftDescriptor draftDescriptor)
  {
    this.transDraftURI = draftDescriptor.getTransInternalURI();
    this.transRootURI = new File(transDraftURI).getParent();
    this.draftDescriptor = draftDescriptor;
  }
  
  /**
   * Create the transaction temporary directories.
   * 
   */
  private void prepareDirectory()
  {
    File transDraftDir = new File(transDraftURI);
    if (!transDraftDir.exists())
    {
      transDraftDir.mkdirs();
    }
  }
  
  /**
   * Get the transaction state according to the state file in transaction temporary folder.
   * 
   * @return transaction state, please refer the definition of BEGIN_STATE, COMMITTING_STATE and COMMITTED_STATE.
   */
  private int getTransactionState() throws Exception
  {
    try
    {
      File beginStateFile = new File(transRootURI, BEGIN_STATE_FILE);
      File committingStateFile = new File(transRootURI, COMMITTING_STATE_FILE);
      File committedStateFile = new File(transRootURI, COMMITTED_STATE_FILE);
      if (committedStateFile.exists())
      {
        return COMMITTED_STATE;
      }
      else if (beginStateFile.exists())
      {
        return BEGIN_STATE;
      }
      else if (committingStateFile.exists())
      {
        return COMMITTING_STATE;
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exceptions happen while getting the state of transaction " + toString() + ".", ex);
      throw ex;
    }
    
    return COMMITTED_STATE;
  }
  
  /**
   * Change current state to BEGIN_STATE.
   * 
   * @throws DraftTransactionException
   */
  private void toBeginState() throws Exception
  {
    LOG.entering(DraftTransaction.class.getName(), "toBeginState", toString());
    try
    {
      prepareDirectory();
      
      File beginStateFile = new File(transRootURI, BEGIN_STATE_FILE);
      File committingStateFile = new File(transRootURI, COMMITTING_STATE_FILE);
      File committedStateFile = new File(transRootURI, COMMITTED_STATE_FILE);
      boolean beginStateExist = beginStateFile.exists();
      boolean committingStateExist = committingStateFile.exists();
      boolean committedStateExist = committedStateFile.exists();
      
      if (committingStateExist)
      {
        if (!committingStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", committingStateFile);
        }
      }
      if (committedStateExist && beginStateExist)
      {
        if (!committedStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", committedStateFile);
        }
      }
      else if (committedStateExist && !beginStateExist)
      {
        if (!committedStateFile.renameTo(beginStateFile))
        {
          LOG.log(Level.WARNING, "Can not rename state file {0} to file {1}.", new Object[]{committedStateFile, beginStateFile});
        }
      }
      else if (!committedStateExist && !beginStateExist)
      {
        beginStateFile.createNewFile();
      }
      if (!beginStateFile.exists())
      {
        throw new IOException("Can not change to begin state, because failed to create or rename the state file.");
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exceptions happen while changing state to BEGIN_STATE for transaction " + toString() + ".", ex);
      throw ex;
    }
    LOG.exiting(DraftTransaction.class.getName(), "toBeginState");
  }
  
  /**
   * 
   * @throws DraftTransactionException
   */
  private void toCommittingState() throws Exception
  {
    LOG.entering(DraftTransaction.class.getName(), "toCommittingState", toString());
    try
    {
      prepareDirectory();
      
      File beginStateFile = new File(transRootURI, BEGIN_STATE_FILE);
      File committingStateFile = new File(transRootURI, COMMITTING_STATE_FILE);
      File committedStateFile = new File(transRootURI, COMMITTED_STATE_FILE);
      boolean beginStateExist = beginStateFile.exists();
      boolean committingStateExist = committingStateFile.exists();
      boolean committedStateExist = committedStateFile.exists();
      
      if (committedStateExist)
      {
        if (!committedStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", committedStateFile);
        }
      }
      if (beginStateExist && committingStateExist)
      {
        if (!beginStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", beginStateFile);
        }
      }
      else if (beginStateExist && !committingStateExist)
      {
        if (!beginStateFile.renameTo(committingStateFile))
        {
          LOG.log(Level.WARNING, "Can not rename state file {0} to file {1}.", new Object[]{beginStateFile, committingStateFile});
        }
      }
      else if (!beginStateExist && !committingStateExist)
      {
        committingStateFile.createNewFile();
      }
      
      if (!committingStateFile.exists())
      {
        throw new IOException("Can not create or rename to the committing state file.");
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exceptions happen while changing state to COMMITTING_STATE for transaction " + toString() + ".", ex);
      throw ex;
    }
    LOG.exiting(DraftTransaction.class.getName(), "toCommittingState");
  }
  
  /**
   * 
   * @throws DraftTransactionException
   */
  private void toCommittedState() throws Exception
  {
    LOG.entering(DraftTransaction.class.getName(), "toCommittedState", toString());
    try
    {
      prepareDirectory();
      
      File beginStateFile = new File(transRootURI, BEGIN_STATE_FILE);
      File committingStateFile = new File(transRootURI, COMMITTING_STATE_FILE);
      File committedStateFile = new File(transRootURI, COMMITTED_STATE_FILE);
      boolean beginStateExist = beginStateFile.exists();
      boolean committingStateExist = committingStateFile.exists();
      boolean committedStateExist = committedStateFile.exists();
      
      if (beginStateExist)
      {
        if (!beginStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", beginStateFile);
        }
      }
      if (committingStateExist && committedStateExist)
      {
        if (!committingStateFile.delete())
        {
          LOG.log(Level.WARNING, "Can not delete state file {0}.", committingStateFile);
        }
      }
      else if (committingStateExist && !committedStateExist)
      {
        if (!committingStateFile.renameTo(committedStateFile))
        {
          LOG.log(Level.WARNING, "Can not rename state file {0} to file {1}.", new Object[]{committingStateFile, committedStateFile});
        }
      }
      else if (!committingStateExist && !committedStateExist)
      {
        committedStateFile.createNewFile();
      }
      
      if (!committedStateFile.exists())
      {
        throw new IOException("Can not create or rename to the committed state file.");
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exceptions happen while changing state to COMMITTED_STATE for transaction " + toString() + ".", ex);
      throw ex;
    }
    LOG.exiting(DraftTransaction.class.getName(), "toCommittedState");
  }
  
  /**
   * Begin the transaction: Create the state file and set flag 'inTransacting' in DraftDescriptor to true.
   * 
   * @throws DraftTransactionException
   */
  public void begin() throws DraftTransactionException
  {
    LOG.entering(DraftTransaction.class.getName(), "begin", toString());
    try
    {
      // Check the previous transaction state firstly.
      check();
      
      toBeginState();
      
      this.draftDescriptor.setInTransacting(true);
    }
    catch (DraftTransactionException ex)
    {
      throw ex;
    }
    catch (Exception ex)
    {
      throw new DraftTransactionException("Exception happens while beginning the transaction " + toString() + ".", ex);
    }
    LOG.exiting(DraftTransaction.class.getName(), "begin");
  }
  
  public void commit() throws DraftTransactionException
  {
    commit(null);
  }
  
  /**
   * Commit the transaction: Move the temporary files to real draft directory.
   * 
   * @throws DraftTransactionException
   */
  public void commit(DraftActionEvent event) throws DraftTransactionException
  {
    LOG.entering(DraftTransaction.class.getName(), "commit", toString());
    try
    {
      toCommittingState();
      
      if (event != null)
        DraftStorageManager.getDraftStorageManager().notifyListener(event);
      
      IComponent draftComp = Platform.getComponent(DraftComponent.COMPONENT_ID);
      IDraftStorageAdapterFactory storageAdapterFactory = (IDraftStorageAdapterFactory) draftComp
          .getService(IDraftStorageAdapterFactory.class);

      IDraftStorageAdapter transStorage = storageAdapterFactory.newDraftAdapter(transDraftURI);
      if (transStorage != null)
      {
        transStorage.moveTo(draftDescriptor.getInternalURI());
      }
      
      // Change the transaction status.
      toCommittedState();
    }
    catch (Exception ex)
    {
      throw new DraftTransactionException("Exception happens while committing transaction " + toString() + ".", ex);
    }
    finally
    {
      this.draftDescriptor.setInTransacting(false);
    }
    LOG.exiting(DraftTransaction.class.getName(), "commit");
  }
  
  /**
   * Roll back the transaction: If the transaction state is BEGIN_STATE, then delete the temporary files.
   * 
   * @throws DraftTransactionException
   */
  public void rollback() throws DraftTransactionException
  {
    LOG.entering(DraftTransaction.class.getName(), "rollback", toString());
    int state = -1;
    try
    {
      state = getTransactionState();
      if (state == BEGIN_STATE)
      {
        LOG.log(Level.FINEST, "Roll back the transaction {0}.", toString());
        
        IComponent draftComp = Platform.getComponent(DraftComponent.COMPONENT_ID);
        IDraftStorageAdapterFactory storageAdapterFactory = (IDraftStorageAdapterFactory) draftComp
            .getService(IDraftStorageAdapterFactory.class);

        IDraftStorageAdapter transStorage = storageAdapterFactory.newDraftAdapter(transDraftURI);
        if (transStorage.exists())
        {
          transStorage.clean();
        }
        
        // Change the transaction state.
        toCommittedState();
      }
    }
    catch (Exception ex)
    {
      throw new DraftTransactionException("Exception happens while rolling back the transaction " + toString() + ".", ex);
    }
    finally
    {
      this.draftDescriptor.setInTransacting(false);
    }
    LOG.exiting(DraftTransaction.class.getName(), "rollback", new Integer(state));
  }
  
  /**
   * Check the transaction state: If the state is BEGIN_STATE, then remove all the temporary files in transaction folder; If the state
   * is COMMITTING_STATE, continue to commit the temporary files to real draft folder; If the state is COMMITTED_STATE, then do nothing.
   * 
   * @return
   * @throws DraftTransactionException
   */
  public int check() throws DraftTransactionException
  {
    LOG.entering(DraftTransaction.class.getName(), "check", toString());
    int state = -1;
    try
    {
      state = getTransactionState();
      if (state == BEGIN_STATE)
      {
        rollback();
      }
      else if (state == COMMITTING_STATE)
      {
        commit();
      }
    }
    catch (Exception ex)
    {
      throw new DraftTransactionException("Exception happens while checking the last transaction " + toString() + ".", ex);
    }
    LOG.exiting(DraftTransaction.class.getName(), "check", new Integer(state));
    return state;
  }
  
  /*
   * (non-Javadoc)
   * @see java.lang.Object#toString()
   */
  public String toString()
  {
    return this.transDraftURI;
  }
}
