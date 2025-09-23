/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.dao;
import com.ibm.concord.platform.bean.DocActivityBean;

public interface IDocActivityDAO
{
    public boolean add(DocActivityBean bean);
    public boolean update(String repo, String uri, String act_id);
    public boolean deleteByRepoAndUri(String repo, String uri);
    public boolean deleteByActId(String act_id);
    public DocActivityBean getByRepoAndUri(String repo, String uri);
}
