/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.service;

import java.util.concurrent.Callable;

import com.ibm.docs.housekeeping.bean.HouseKeepingResult;

public interface IHouseKeepingService extends Callable<HouseKeepingResult>
{
  String SNAPSHOT_READABLE_TAG = "readable.tag";

  public String getServiceId();
}
