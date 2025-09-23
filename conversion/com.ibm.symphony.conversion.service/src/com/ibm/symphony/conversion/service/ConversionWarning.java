/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service;

import java.util.Map;


public class ConversionWarning {
	
	private String fetureID;
	
	private String description;
	
	private String location;
	
	private boolean isPreserved;
	
	private Map parameters;
	
	public ConversionWarning(){
	}
	
	public ConversionWarning(String featureID){
		this(featureID, false, null, null);
	}
	
	public ConversionWarning(String featureID, boolean isPreserved){
		this(featureID, isPreserved, null, null);
	}
	
	public ConversionWarning(String featureID, boolean isPreserved, String location){
		this(featureID, isPreserved, location, null);
	}
	
	public ConversionWarning(String featureID, boolean isPreserved, String location, String description) {
		this(featureID, isPreserved, location, description, null);
	}

    public ConversionWarning(String fetureID, boolean isPreserved, String location, String description, Map parameters) {
      super();
      this.fetureID = fetureID;
      this.isPreserved = isPreserved;
      this.location = location;
      this.description = description;
      this.parameters = parameters;
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
	
	/**
	 * @return the parameters map
	 */
	public Map getParameters()
	{
	  return parameters;
	}
	
	/**
	 * set the parameters map
	 * @param parameters
	 */
	public void setParameters(Map parameters)
	{
	  this.parameters = parameters;
	}
}
