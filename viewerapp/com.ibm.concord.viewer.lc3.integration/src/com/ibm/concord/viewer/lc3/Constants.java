/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3;

import javax.xml.namespace.QName;

public class Constants
{
  private static final String NS_ATOM = "http://www.w3.org/2005/Atom";
  private static final String NS_TD = "urn:ibm.com/td";
  private static final String NS_SN = "http://www.ibm.com/xmlns/prod/sn";
  private static final String NS_CMIS = "http://docs.oasis-open.org/ns/cmis/core/200908/";
  private static final String NS_LCMIS = "http://www.ibm.com/xmlns/prod/sn/cmis";
  private static final String NS_CMISRA = "http://docs.oasis-open.org/ns/cmis/restatom/200908/";

  private static final String TD_PREFIX = "td";
  private static final String SN_PREFIX = "snx";
  private static final String LCMIS_PREFIX = "lcmis";

  private static final String TD_LABEL_UUID = "uuid";
  private static final String TD_LABEL_VERSION = "versionLabel";
  private static final String TD_LABEL_MODIFIED = "modified";
  private static final String TD_LABEL_MODIFIER = "modifier";
  private static final String TD_LABEL_PERMISSIONS = "permissions";
  private static final String TD_LABEL_LIBTYPE = "libraryType";
  private static final String TD_LABEL_LIBID = "libraryId";
  private static final String USERID = "userid";
  private static final String EMAIL = "email";
  private static final String NAME = "name";
  private static final String ENCRYPT = "encrypt";

  public static QName QNAME_TD_UUID = new QName(NS_TD, TD_LABEL_UUID, TD_PREFIX);
  public static QName QNAME_TD_MODITIED = new QName(NS_TD, TD_LABEL_MODIFIED, TD_PREFIX);
  public static QName QNAME_TD_MODIFIER = new QName(NS_TD, TD_LABEL_MODIFIER, TD_PREFIX);
  public static QName QNAME_TD_PERMISSIONS = new QName(NS_TD, TD_LABEL_PERMISSIONS, TD_PREFIX);
  public static QName QNAME_TD_VERSION_LABEL = new QName(NS_TD, TD_LABEL_VERSION, TD_PREFIX);
  public static QName QNAME_TD_LIBTYPE = new QName(NS_TD, TD_LABEL_LIBTYPE, TD_PREFIX);
  public static QName QNAME_TD_LIBID = new QName(NS_TD, TD_LABEL_LIBID, TD_PREFIX);

  public static QName QNAME_SN_USERID = new QName(NS_SN, USERID, SN_PREFIX);

  public static QName QNAME_ATOM_EMAIL = new QName(NS_ATOM, EMAIL);
  public static QName QNAME_ATOM_NAME = new QName(NS_ATOM, NAME);

  public static QName QNAME_OBJECT = new QName(NS_CMISRA, "object");
  public static QName QNAME_PROPERTIES = new QName(NS_CMIS, "properties");
  public static QName QNAME_ACL = new QName(NS_CMIS, "acl");
  public static QName QNAME_VALUE = new QName(NS_CMIS, "value");
  public static QName QNAME_PERMISSION = new QName(NS_CMIS, "permission");
  public static QName QNAME_PRINCIPAL = new QName(NS_CMIS, "principal");
  public static QName QNAME_PRINCIPAL_ID = new QName(NS_CMIS, "principalId");
  public static QName QNAME_EMAIL = new QName(NS_LCMIS, EMAIL, LCMIS_PREFIX);
  public static QName QNAME_PROPERTY_STRING = new QName(NS_CMIS, "propertyString");
  public static QName QNAME_PROPERTY_ID = new QName(NS_CMIS, "propertyId");
  
  public static QName QNAME_SN_ENCRYPT = new QName(NS_SN, ENCRYPT, SN_PREFIX);
  public static final String LIB_TYPE_PERSONAL = "personalFiles";
  public static final String LIB_TYPE_COMMUNITY = "communityFiles";
  
  public static final String MEMBER_TYPE_USER = "user";
  public static final String MEMBER_TYPE_COMMUNITY = "community";
}
