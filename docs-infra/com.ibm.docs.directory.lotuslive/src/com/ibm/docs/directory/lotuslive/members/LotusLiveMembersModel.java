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

import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.framework.ComponentRegistry;

public class LotusLiveMembersModel implements IMembersModel
{

	public IOrg getOrg(String orgId)
	{
		ISubscriberDAO dao = (ISubscriberDAO)ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
		List<String> subscribers = dao.getByCustomerId(orgId);
		if (subscribers.isEmpty())
		{
			return null;
		}
		else
		{
			return new LotusLiveOrgImpl(orgId, null);
		}
	}

	public IOrg createOrg(String orgId, Map<String, String> properties)
	{
		// Cannot create org
		return null;
	}

	public void removeOrg(IOrg org)
	{
		// Cannot remove org
	}

	public List<IOrg> listOrgs()
	{
		// TODO Auto-generated method stub
		return null;
	}

}
