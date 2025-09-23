/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.provisioning;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.bss.json.JSONException;
import com.ibm.bss.json.JSONObject;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.dao.IUserPreferenceDAO;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.entitlement.util.EntitlementUtil;
import com.ibm.docs.framework.IComponent;
import com.ibm.wdp.bss.provisioning.Protocol;
import com.ibm.wdp.bss.provisioning.service.ProvisioningServiceEndPointBase;

public class ConcordProvisioningEndPoint extends ProvisioningServiceEndPointBase
{
  private static final Logger LOG = Logger.getLogger(ConcordProvisioningEndPoint.class.getName());

  private static final ISubscriberDAO SUBSCRIBER_DAO;  

  static
  {
    IComponent dirComp = Platform.getComponent(DirectoryComponent.COMPONENT_ID);
    SUBSCRIBER_DAO = (ISubscriberDAO) dirComp.getService(ISubscriberDAO.class);
  }

  /***************************************************************************
   * 
   * Customer EndPoints
   * 
   ***************************************************************************/

  public JSONObject addCustomer(String phase, String customerId, JSONObject profile) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "addCustomer", new Object[] { phase, customerId });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber customer = SUBSCRIBER_DAO.getSubscriber(customerId, Subscriber.TYPE_ORG);
      if (customer == null)
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "addCustomer", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("Customer Already Existed");
        LOG.log(Level.WARNING, "AddCustomer Failed, Customer {0} Already Existed.", customerId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "addCustomer", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject customerObj = (JSONObject) profile.get("Customer");
      JSONObject orgObj = (JSONObject) customerObj.get("Organization");
      String orgName = (String) orgObj.get("OrgName");
      String orgEmail = orgObj.has("EmailAddress") ? (String) orgObj.get("EmailAddress") : "";
      String customerState = (String) customerObj.get("CustomerState");
      Subscriber customer = new Subscriber(customerId, customerId, Subscriber.TYPE_ORG, EntitlementUtil.DEFAULT_LOCALE, orgName, orgEmail,
          customerState, EntitlementLevel.NONE.toString());
      if (SUBSCRIBER_DAO.addSubscriber(customer))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "addCustomer", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO addSubscriber Failed");
        LOG.log(Level.WARNING, "AddCustomer Failed, DAO addSubscriber Failed. {0}", customerId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "addCustomer", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "addCustomer", null);
    return null;
  }

  public JSONObject syncCustomer(String phase, String customerId, JSONObject profile, String orderId, String isSyncMessage)
      throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", new Object[] { phase, customerId, orderId,
        isSyncMessage });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      JSONObject result = Protocol.createOperationSuccess();
      LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", result);
      return result;
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject customerObj = (JSONObject) profile.get("Customer");
      JSONObject orgObj = (JSONObject) customerObj.get("Organization");
      String orgName = (String) orgObj.get("OrgName");
      String orgEmail = orgObj.has("EmailAddress") ? (String) orgObj.get("EmailAddress") : "";
      String customerState = (String) customerObj.get("CustomerState");

      if (SUBSCRIBER_DAO.getSubscriber(customerId, Subscriber.TYPE_ORG) == null)
      {
        Subscriber customer = new Subscriber(customerId, customerId, Subscriber.TYPE_ORG, EntitlementUtil.DEFAULT_LOCALE, orgName,
            orgEmail, customerState, EntitlementLevel.NONE.toString());
        if (SUBSCRIBER_DAO.addSubscriber(customer))
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationFailure("DAO addSubscriber Failed");
          LOG.log(Level.WARNING, "SyncCustomer Failed, DAO addSubscriber Failed. {0}", customerId);
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", result);
          return result;
        }
      }
      else
      {
        Subscriber customer = new Subscriber(customerId, customerId, Subscriber.TYPE_ORG, EntitlementUtil.DEFAULT_LOCALE, orgName,
            orgEmail, customerState, null);
        if (SUBSCRIBER_DAO.updateSubscriber(customer))
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationFailure("DAO updateSubscriber Failed");
          LOG.log(Level.WARNING, "SyncCustomer Failed, DAO updateSubscriber Failed. {0}", customerId);
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", result);
          return result;
        }
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncCustomer", null);
    return null;
  }

  public JSONObject changeCustomerProfile(String phase, String customerId, JSONObject profile) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", new Object[] { phase, customerId });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber customer = SUBSCRIBER_DAO.getSubscriber(customerId, Subscriber.TYPE_ORG);
      if (customer == null)
      {
        JSONObject result = Protocol.createOperationFailure("Customer Not Existed");
        LOG.log(Level.WARNING, "ChangeCustomerProfile Failed, Customer {0} Not Existed.", customerId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject customerObj = (JSONObject) profile.get("Customer");
      JSONObject orgObj = (JSONObject) customerObj.get("Organization");
      String orgName = (String) orgObj.get("OrgName");
      String orgEmail = orgObj.has("EmailAddress") ? (String) orgObj.get("EmailAddress") : "";
      String customerState = (String) customerObj.get("CustomerState");
      Subscriber customer = new Subscriber(customerId, customerId, Subscriber.TYPE_ORG, EntitlementUtil.DEFAULT_LOCALE, orgName, orgEmail,
          customerState, null);
      if (SUBSCRIBER_DAO.updateSubscriber(customer))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO updateSubscriber Failed");
        LOG.log(Level.WARNING, "ChangeCustomerProfile Failed, DAO updateSubscriber Failed. {0}", customerId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeCustomerProfile", null);
    return null;
  }

  public JSONObject removeCustomer(String phase, String customerId) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", new Object[] { phase, customerId });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber customer = SUBSCRIBER_DAO.getSubscriber(customerId, Subscriber.TYPE_ORG);
      if (customer == null)
      {
        /*
         * Do NOT discard below codes, may need them be restored later.
         * 
         * According to BSS WIKI, we should return a Failure in this case.
         */
//        JSONObject result = Protocol.createOperationFailure("Customer Not Existed");
//        LOG.log(Level.WARNING, "RemoveCustomer Failed, Customer {0} Not Existed.", customerId);
        LOG.log(Level.INFO, "RemoveCustomer, Customer {0} Not Existed.", customerId);
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", result);
        return result;
      }
      else
      {
        int subscriberCount = SUBSCRIBER_DAO.getSubscriberCountByCustID(customerId);
        if (subscriberCount > 1)
        {
          JSONObject result = Protocol.createOperationFailure("Subscriber(s) Existed");
          LOG.log(Level.WARNING, "RemoveCustomer Failed, {0} Subscriber(s) Existed.", customerId);
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", result);
          return result;
        }
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      if (SUBSCRIBER_DAO.removeSubscriber(customerId, Subscriber.TYPE_ORG))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO removeSubscriber Failed");
        LOG.log(Level.WARNING, "RemoveCustomer Failed, DAO removeSubscriber Failed. {0}", customerId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "removeCustomer", null);
    return null;
  }



  /***************************************************************************
   * 
   * Subscriber EndPoints
   * 
   ***************************************************************************/

  public JSONObject entitleSubscriber(String phase, String customerId, String subscriberId, JSONObject profile, JSONObject quotas,
      JSONObject seatAttributes) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", new Object[] { phase, customerId, subscriberId,
        quotas, seatAttributes });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber subscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER);
      if (subscriber == null)
      {
        Subscriber customer = SUBSCRIBER_DAO.getSubscriber(customerId, Subscriber.TYPE_ORG);
        if (customer == null)
        {
          JSONObject result = Protocol.createOperationFailure("Customer Not Existed");
          LOG.log(Level.WARNING, "EntitleSubscriber Failed, Customer {0} Not Existed.", subscriberId);
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", result);
          return result;
        }
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("Subscriber Already Existed");
        LOG.log(Level.WARNING, "EntitleSubscriber Failed, Subscriber {0} Already Existed.", subscriberId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject subscriberObj = profile.getJSONObject("Subscriber");
      JSONObject personObj = subscriberObj.getJSONObject("Person");
      String subscriberName = personObj.getString("DisplayName");
      String subscriberEmail = personObj.getString("EmailAddress");
      String subscriberLocale = personObj.getString("LanguagePreference");
      String subscriberState = subscriberObj.getString("SubscriberState");
      String subscriberEntitlement = (String) (quotas.has(EntitlementUtil.DEFAULT_ENTITLEMENT) ? EntitlementUtil.to(quotas
          .get(EntitlementUtil.DEFAULT_ENTITLEMENT)) : EntitlementLevel.NONE.toString());
      Subscriber subscriber = new Subscriber(subscriberId, customerId, Subscriber.TYPE_USER, subscriberLocale, subscriberName,
          subscriberEmail, subscriberState, subscriberEntitlement);
      if (SUBSCRIBER_DAO.addSubscriber(subscriber))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO addSubscriber Failed");
        LOG.log(Level.WARNING, "EntitleSubscriber Failed, DAO addSubscriber Failed. {0} {1} {2}", new Object[] { subscriberId, quotas,
            seatAttributes });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "entitleSubscriber", null);
    return null;
  }

  public JSONObject changeSubscriberProfile(String phase, String customerId, String subscriberId, JSONObject profile,
      JSONObject seatAttributes) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", new Object[] { phase, customerId, subscriberId,
        seatAttributes });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber subscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER);
      if (subscriber == null)
      {
        JSONObject result = Protocol.createOperationFailure("Subscriber Not Existed");
        LOG.log(Level.WARNING, "ChangeSubscriberProfile Failed, Subscriber {0} Not Existed.", subscriberId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject subscriberObj = profile.getJSONObject("Subscriber");
      JSONObject personObj = subscriberObj.getJSONObject("Person");
      String subscriberName = personObj.getString("DisplayName");
      String subscriberEmail = personObj.getString("EmailAddress");
      String subscriberLocale = personObj.getString("LanguagePreference");
      String subscriberState = subscriberObj.getString("SubscriberState");
      Subscriber customer = new Subscriber(subscriberId, customerId, Subscriber.TYPE_USER, subscriberLocale, subscriberName,
          subscriberEmail, subscriberState, null);
      if (SUBSCRIBER_DAO.updateSubscriber(customer))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", result);
        return result;        
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO updateSubscriber Failed");
        LOG.log(Level.WARNING, "ChangeSubscriberProfile Failed, DAO updateSubscriber Failed. {0} {1}", new Object[] { subscriberId,
            seatAttributes });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberProfile", null);
    return null;
  }

  public JSONObject changeSubscriberQuota(String phase, String customerId, String subscriberId, JSONObject quotas, JSONObject seatAttributes)
      throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", new Object[] { phase, customerId, subscriberId,
        seatAttributes });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber subscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER);
      if (subscriber == null)
      {
        JSONObject result = Protocol.createOperationFailure("Subscriber Not Existed");
        LOG.log(Level.WARNING, "ChangeSubscriberQuota Failed, Subscriber {0} Not Existed.", subscriberId);
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      String subscriberEntitlement = (String) (quotas.has(EntitlementUtil.DEFAULT_ENTITLEMENT) ? EntitlementUtil.to(quotas
          .get(EntitlementUtil.DEFAULT_ENTITLEMENT)) : EntitlementLevel.NONE.toString());
      Subscriber subscriber = new Subscriber(subscriberId, customerId, Subscriber.TYPE_USER, null, null, null, null, subscriberEntitlement);
      if (SUBSCRIBER_DAO.updateSubscriberEntitlement(subscriber))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO updateSubscriberEntitlement Failed");
        LOG.log(Level.WARNING, "ChangeSubscriberQuota Failed, DAO updateSubscriberEntitlement Failed. {0} {1}", new Object[] { quotas,
            seatAttributes });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberQuota", null);
    return null;
  }

  public JSONObject syncSubscriber(String phase, String customerId, String subscriberId, JSONObject profile, JSONObject quotas,
      JSONObject seatAttributes, String seatId, String subscriptionId, String newSubscriptionId, String invitedBy, String orderId,
      String isSyncMessage) throws JSONException
  {
    LOG.entering(
        ConcordProvisioningEndPoint.class.getName(),
        "syncSubscriber",
        new Object[] {
            phase,
            customerId,
            subscriberId,
            " LanguagePreference : "
                + (profile != null ? ((profile.getJSONObject("Subscriber") != null && profile.getJSONObject("Subscriber").has(
                    "LanguagePreference")) ? profile.getJSONObject("Subscriber").has("LanguagePreference") : "") : ""),
            " quotas : " + quotas, seatAttributes, seatId, subscriptionId, newSubscriptionId, invitedBy, orderId, isSyncMessage });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      JSONObject result = Protocol.createOperationSuccess();
      LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", result);
      return result;
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      JSONObject subscriberObj = profile.getJSONObject("Subscriber");
      JSONObject personObj = subscriberObj.getJSONObject("Person");
      String subscriberName = personObj.getString("DisplayName");
      String subscriberEmail = personObj.getString("EmailAddress");
      String subscriberLocale = personObj.getString("LanguagePreference");
      String subscriberState = subscriberObj.getString("SubscriberState");
      String subscriberEntitlement = (String) (quotas.has(EntitlementUtil.DEFAULT_ENTITLEMENT) ? EntitlementUtil.to(quotas
          .get(EntitlementUtil.DEFAULT_ENTITLEMENT)) : EntitlementLevel.NONE.toString());
      if (SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER) == null)
      {
        Subscriber subscriber = new Subscriber(subscriberId, customerId, Subscriber.TYPE_USER, subscriberLocale, subscriberName,
            subscriberEmail, subscriberState, subscriberEntitlement);
        if (SUBSCRIBER_DAO.addSubscriber(subscriber))
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationFailure("DAO addSubscriber Failed");
          LOG.log(Level.WARNING, "SyncSubscriber Failed, DAO addSubscriber Failed. {0} {1} {2}", new Object[] { subscriberId, quotas,
              seatAttributes });
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", result);
          return result;
        }
      }
      else
      {
        Subscriber subscriber = new Subscriber(subscriberId, customerId, Subscriber.TYPE_USER, subscriberLocale, subscriberName,
            subscriberEmail, subscriberState, subscriberEntitlement);
        if (SUBSCRIBER_DAO.updateSubscriber(subscriber))
        {
          JSONObject result = Protocol.createOperationSuccess();
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", result);
          return result;
        }
        else
        {
          JSONObject result = Protocol.createOperationFailure("DAO updateSubscriber Failed");
          LOG.log(Level.WARNING, "SyncSubscriber Failed, DAO updateSubscriber Failed. {0} {1} {2}", new Object[] { subscriberId, quotas,
              seatAttributes });
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", result);
          return result;
        }
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "syncSubscriber", null);
    return null;
  }

  public JSONObject changeSubscriberCustomer(String phase, String oldCustomerId, String subscriberId, String newCustomerId, JSONObject quotas,
      JSONObject seatAttributes) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", new Object[] { phase, oldCustomerId, subscriberId,
      newCustomerId, quotas, seatAttributes });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber oldSubscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER, oldCustomerId);
      if (oldSubscriber == null)
      {
        JSONObject result = Protocol.createOperationFailure("Subscriber Not Existed");
        LOG.log(Level.WARNING, "ChangeSubscriberCustomer Failed, Subscriber {0} for Customer {1} Not Existed.", new Object[] {
            subscriberId, oldCustomerId });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
        return result;
      }
      else
      {
        Subscriber customer = SUBSCRIBER_DAO.getSubscriber(newCustomerId, Subscriber.TYPE_ORG);
        if (customer == null)
        {
          JSONObject result = Protocol.createOperationFailure("New Customer Not Existed");
          LOG.log(Level.WARNING, "ChangeSubscriberCustomer Failed, New Customer {0} Not Existed.", newCustomerId);
          LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
          return result;
        }
        else
        {
          Subscriber newSubscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER, newCustomerId);
          if (newSubscriber == null)
          {
            JSONObject result = Protocol.createOperationSuccess();
            LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
            return result;
          }
          else
          {
            JSONObject result = Protocol.createOperationFailure("Subscriber Already Existed");
            LOG.log(Level.WARNING, "ChangeSubscriberCustomer Failed, Subscriber {0} for Customer {1} Already Existed.", new Object[] {
                subscriberId, newCustomerId });
            LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
            return result;
          }
        }
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      Subscriber subscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER, oldCustomerId);
      subscriber.setCustomerId(newCustomerId);
      if (SUBSCRIBER_DAO.updateSubscriber(subscriber))
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO updateSubscriber Failed");
        LOG.log(Level.WARNING, "ChangeSubscriberCustomer Failed, DAO updateSubscriber Failed. {0} {1} {2}", new Object[] { oldCustomerId,
            subscriberId, newCustomerId });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "changeSubscriberCustomer", null);
    return null;
  }

  public JSONObject revokeSubscriber(String phase, String customerId, String subscriberId, String assignTo) throws JSONException
  {
    LOG.entering(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", new Object[] { phase, customerId });

    if (Protocol.PH_PREPARE.equals(phase))
    {
      Subscriber subscriber = SUBSCRIBER_DAO.getSubscriber(subscriberId, Subscriber.TYPE_USER);
      if (subscriber == null)
      {
        /*
         * Do NOT discard below codes, may need them be restored later.
         * 
         * According to BSS WIKI, we should return a Failure in this case, however, the UT in SHIM expect a Success return.
         */
//        JSONObject result = Protocol.createOperationFailure("Subscriber Not Existed");
//        LOG.log(Level.WARNING, "RevokeSubscriber Failed, Subscriber {0} Not Existed.", subscriberId);
        LOG.log(Level.INFO, "RevokeSubscriber, Subscriber {0} Not Existed.", subscriberId);
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", result);
        return result;
      }
    }
    else if (Protocol.PH_EXECUTE.equals(phase))
    {
      if (SUBSCRIBER_DAO.removeSubscriber(subscriberId, Subscriber.TYPE_USER))
      {
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        if (assignTo == null)
        {
          IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) daoComp.getService(IDocumentEditorsDAO.class);
          docEditorsDAO.removeEditor(subscriberId);
        }
        else
        {
          IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) daoComp.getService(IDocumentEditorsDAO.class);
          docEditorsDAO.updateEditor(subscriberId, assignTo);
        }

        IUserPreferenceDAO userPrefDAO = (IUserPreferenceDAO) daoComp.getService(IUserPreferenceDAO.class);
        userPrefDAO.delete(subscriberId);

        JSONObject result = Protocol.createOperationSuccess();
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", result);
        return result;
      }
      else
      {
        JSONObject result = Protocol.createOperationFailure("DAO removeSubscriber Failed");
        LOG.log(Level.WARNING, "RevokeSubscriber Failed, DAO removeSubscriber Failed. {0} {1}", new Object[] { customerId, subscriberId });
        LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", result);
        return result;
      }
    }
    else
    {
      ;
    }

    LOG.exiting(ConcordProvisioningEndPoint.class.getName(), "revokeSubscriber", null);
    return null;
  }
}
