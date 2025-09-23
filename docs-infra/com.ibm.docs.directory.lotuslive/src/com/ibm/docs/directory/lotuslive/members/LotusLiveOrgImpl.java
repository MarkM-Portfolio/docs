/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.lotuslive.members;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.framework.ComponentRegistry;

public class LotusLiveOrgImpl implements IOrg
{
	private String id;
	private HashMap<String, String> properties = new HashMap<String, String>();
	
	public LotusLiveOrgImpl(String id, Map<String, String> properties)
	{
		this.id = id;
		if (properties != null && !properties.isEmpty())
		{
			this.properties.putAll(properties);
		}
	}

	public String getId()
	{
		return this.id;
	}

	public String getProperty(String key)
	{
		return this.properties.get(key);
	}

	public void setProperty(String key, String value)
	{
		this.properties.put(key, value);
	}

	public Set<String> listProperties()
	{
		return this.properties.keySet();
	}

	public IUser getUser(String userId)
	{
		ISubscriberDAO dao = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
		Map<String, String> userProperties = dao.getById(userId);
		
		if (userProperties.isEmpty())
		{
			return null;
		}
		return new LotusLiveUserImpl(userId, userProperties);
	}

	public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value)
	{
		ISubscriberDAO dao = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
		String column = this.userPropertyToColumnName(prop);
		
		if (column != null)
		{
			List<String> subscriberIds = dao.searchByColumnExactMatch(column, value);
			return this.loadUsers(subscriberIds);
		}
		
		return null;
	}

	public List<IUser> getUsersByPropertySubString(UserProperty prop,
			String value)
	{
		ISubscriberDAO dao = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
		String column = this.userPropertyToColumnName(prop);
		
		if (column != null)
		{
			List<String> subscriberIds = dao.searchByColumnSubString(column, value);
			return this.loadUsers(subscriberIds);
		}
		
		return null;
	}

	public IUser createUser(String userId, Map<String, String> properties)
	{
		// Cannot create user
		return null;
	}

	public void removeUser(IUser user)
	{
		// Cannot remove user
	}

	private String userPropertyToColumnName(UserProperty property)
	{
		String column = null;
		
		switch (property)
		{
		case PROP_CUSTOMERID:
		case PROP_ORGID:
		case PROP_REPOID:
			column = ISubscriberDAO.COL_CUSTOMER_ID;
			break;
		case PROP_DISPLAYNAME:
			column = ISubscriberDAO.COL_DISPLAY_NAME;
			break;
		case PROP_EMAIL:
			column = ISubscriberDAO.COL_EMAIL;
			break;
		default:
			break;
		}
		
		return column;
	}
	
	private List<IUser> loadUsers(List<String> userIds)
	{
		ISubscriberDAO dao = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
		List<IUser> users = new ArrayList<IUser>();
		for (String userId : userIds)
		{
			Map<String, String> properties = dao.getById(userId);
			LotusLiveUserImpl user = new LotusLiveUserImpl(userId, properties);
			users.add(user);
		}
		
		return users;
	}
}
