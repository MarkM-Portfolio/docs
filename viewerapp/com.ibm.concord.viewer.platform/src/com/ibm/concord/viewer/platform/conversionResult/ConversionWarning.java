/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversionResult;

public class ConversionWarning {
	
	private String fetureID;
	
	private String description;
	
	private String location;
	
	private boolean isPreserved;
	
	public ConversionWarning(){
	}
	
	public ConversionWarning(String fetureID){
		this(fetureID, false, null, null);
	}
	
	public ConversionWarning(String fetureID, boolean isPreserved){
		this(fetureID, isPreserved, null, null);
	}
	
	public ConversionWarning(String fetureID, boolean isPreserved, String location){
		this(fetureID, isPreserved, location, null);
	}
	
	public ConversionWarning(String fetureID, boolean isPreserved, String location, String description) {
		super();
		this.fetureID = fetureID;
		this.isPreserved = isPreserved;
		this.location = location;
		this.description = description;
	}

	/**
	 * @return the fetureID
	 */
	public String getFetureID() {
		return fetureID;
	}

	/**
	 * @param fetureID the fetureID to set
	 */
	public void setFetureID(String fetureID) {
		this.fetureID = fetureID;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the location
	 */
	public String getLocation() {
		return location;
	}

	/**
	 * @param location the location to set
	 */
	public void setLocation(String location) {
		this.location = location;
	}
	/**
	 * @return the isPreserved
	 */
	public boolean isPreserved() {
		return isPreserved;
	}

	/**
	 * @param isPreserved the isPreserved to set
	 */
	public void setPreserved(boolean isPreserved) {
		this.isPreserved = isPreserved;
	}
}
