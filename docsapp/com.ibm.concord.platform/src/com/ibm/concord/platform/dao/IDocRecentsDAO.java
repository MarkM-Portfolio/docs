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

public interface IDocRecentsDAO
{
    public boolean add(String userId, String repoId, String docId);

    public boolean delete(String userId, String repoId, String docId);

    public boolean trim(String userId);

    public String[] get(String userId);

    public int count(String userId);
}
