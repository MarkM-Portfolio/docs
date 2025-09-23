package com.ibm.concord.services.mbean;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.dao.ICustomerCredentialDAO;
import com.ibm.docs.framework.IComponent;

public class CustomerCredentialMgr implements CustomerCredentialMBean
{
  private final Logger LOG = Logger.getLogger(CustomerCredentialMgr.class.getName());
  
  public CustomerCredentialMgr()
  {
    
  }

  @Override
  public boolean addCredential(String customerId, String key, String value)
  {
    IComponent daoComp = Platform.getComponent(DirectoryComponent.COMPONENT_ID);
    ICustomerCredentialDAO ccDAO = (ICustomerCredentialDAO) daoComp.getService(ICustomerCredentialDAO.class);
    try{
      return ccDAO.add(customerId, key, value);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to add credential {0} for {1} !!!!", new Object[] {key, customerId});
    }
    return false;
  }

  @Override
  public boolean updateCredential(String customerId, String key, String value)
  {
    IComponent daoComp = Platform.getComponent(DirectoryComponent.COMPONENT_ID);
    ICustomerCredentialDAO ccDAO = (ICustomerCredentialDAO) daoComp.getService(ICustomerCredentialDAO.class);
    try{
      return ccDAO.update(customerId, key, value);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to update credential {0} for {1} !!!!", new Object[] {key, customerId});
    }
    return false;
  }

  @Override
  public boolean removeCredential(String customerId, String key)
  {
    IComponent daoComp = Platform.getComponent(DirectoryComponent.COMPONENT_ID);
    ICustomerCredentialDAO ccDAO = (ICustomerCredentialDAO) daoComp.getService(ICustomerCredentialDAO.class);
    try{
      return ccDAO.deleteByCustomerByKey(customerId, key);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to delete credential {0} for {1} !!!!", new Object[] {key, customerId});
    }
    return false;
  }

  @Override
  public boolean deleteCredential(String customerId)
  {
    IComponent daoComp = Platform.getComponent(DirectoryComponent.COMPONENT_ID);
    ICustomerCredentialDAO ccDAO = (ICustomerCredentialDAO) daoComp.getService(ICustomerCredentialDAO.class);
    try{
      return ccDAO.deleteByCustomer(customerId);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to delete credential for {0} !!!!", new Object[] {customerId});
    }
    return false;
  }
}
