/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.util;

/*
 * This class is used by the ContentConvertUtil.flattenElement method
 * It basically builds a list of this class which contains an odfelement and level.
 * The level is the level of heirarchy and a way to determine and odfelements parent.
 * For instance, if the element is of level 3 or n, its parent is the preceding element 
 * in the list whose level is 2 or n-1.
 */

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;

public class OdfLevelElement {
	private OdfElement element;	
	private int level;
	
	public OdfLevelElement(OdfElement e, int l) {
		this.element = e;
		this.level = l;
	}

	public OdfLevelElement(OdfFileDom contentDom, String name, int level) {
	      this.element = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(name), name);
	      this.level = level;
	}
	
	public int getLevel() {
		return level;
	}

	public void setLevel(int level) {
		this.level = level;
	}

	public OdfElement getElement() {
		return element;
	}

	public void setElement(OdfElement element) {
		this.element = element;
	}

	
}
