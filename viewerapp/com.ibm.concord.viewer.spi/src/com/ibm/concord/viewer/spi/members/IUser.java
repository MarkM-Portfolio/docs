/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.members;

import java.util.Set;
import java.util.UUID;

public interface IUser extends IMemberBase
{
  public String FAKE_VERSE_USER_ID = "verseuser";

  public String FAKE_USER_ID = "filesthumbnails";

  public String VERSE_FAKE_USER_ID = "verseattachments";

  public String DEFAULT_ORG_ID = "default_org";

  public String ECM_DEFAULT_USER_ID = "filenetAdmin";
  
  public static final String FAKE_USER_IMG2HTMLADMIN = "img2htmlAdmin";
  
  public static final String ANONYMOUS_USER_ID="anonymous_user";

  public static final IUser ANONYMOUS_USER=new IUser(){

    @Override
    public String getId()
    {
      return ANONYMOUS_USER_ID;
    }

    @Override
    public String getProperty(String key)
    {
      if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
      {
        return DEFAULT_ORG_ID;
      }
      else
      {
        return null;
      }
    }

    @Override
    public void setProperty(String key, String value)
    {
      // TODO Auto-generated method stub
      
    }

    @Override
    public Set<String> listProperties()
    {
      return null;
    }

    @Override
    public IOrg getOrg()
    {
      return null;
    }
    
  };
  
  public static final IUser ECM_DEFAULT_USER = new IUser()
  {

    public void setProperty(String key, String value)
    {
    }

    public Set<String> listProperties()
    {
      return null;
    }

    public String getProperty(String key)
    {
      if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
      {
        return DEFAULT_ORG_ID;
      }
      else
      {
        return null;
      }
    }

    public String getId()
    {
      return ECM_DEFAULT_USER_ID;
    }

    public IOrg getOrg()
    {
      // TODO Auto-generated method stub
      return null;
    }

  };

  public static final IUser FAKE_USER = new IUser()
  {

    public void setProperty(String key, String value)
    {
    }

    public Set<String> listProperties()
    {
      return null;
    }

    public String getProperty(String key)
    {
      if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
      {
        return FAKE_USER_ID;
      }
      else
      {
        return null;
      }
    }

    public String getId()
    {
      return FAKE_USER_ID;
    }

    public IOrg getOrg()
    {
      // TODO Auto-generated method stub
      return null;
    }
  };

  public static final IUser Verse_Fake_User = new IUser()
  {

    @Override
    public String getId()
    {
      return FAKE_VERSE_USER_ID;
    }

    @Override
    public String getProperty(String key)
    {
      if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
      {
        return VERSE_FAKE_USER_ID;
      }
      else if (key.equals(UserProperty.PROP_EMAIL.toString()))
      {
        return FAKE_VERSE_USER_ID + "@verse.com";
      }
      else
      {
        return null;
      }
    }

    @Override
    public void setProperty(String key, String value)
    {
      // TODO Auto-generated method stub

    }

    @Override
    public Set<String> listProperties()
    {
      // TODO Auto-generated method stub
      return null;
    }

    @Override
    public IOrg getOrg()
    {
      // TODO Auto-generated method stub
      return null;
    }

  };

  /**
   * @return an instance of IOrg for the organization the user belong to.
   */
  public IOrg getOrg();
}
