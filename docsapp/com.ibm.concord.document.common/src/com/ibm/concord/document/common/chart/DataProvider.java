/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.chart;

import com.ibm.json.java.JSONArray;

public abstract class DataProvider {

	private String dataSource;
	
	public String getDataSource() {
		return dataSource;
	}

	public void setDataSource(String dataSource) {
		this.dataSource = dataSource;
	}

	public abstract DataSequence createDataSequence(String addr);
	public abstract DataSequence createDataSequence(JSONArray pts);
}
