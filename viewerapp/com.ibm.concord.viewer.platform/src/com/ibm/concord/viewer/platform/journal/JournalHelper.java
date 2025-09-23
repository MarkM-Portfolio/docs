/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.journal;

public class JournalHelper
{
  public enum Action{
    CREATE,
    UPDATE,
    DELETE,
    DISCARD,
    PUBLISH,
    EXPORT,
    VIEW,
    LOGIN,
    LOGOUT,
    SHARE,
    RESET,
    PASSWORD,
    OTHER
  }
  
  public enum Outcome{
    SUCCESS,
    FAILURE,
    ERROR,
    PENDING,
    UNKNOWN,
  }
  
  public enum Component {
    EDITOR,
    VIEWER,
    LOTUSLIVE,
    USERPREFERENCE,
    DATABASE,
    CONVERT,
    TASK,
    COMMENT,
    SUCURITY,
    FAKEBSS,
    LOGIN,
    OTHER
    
  }

  public static class Actor
  {
    private final String email;

    private final String id;

    private final String subscriberId;

    public Actor(String email, String subscriberId, String id)
    {
      this.email = email;
      this.id = id;
      this.subscriberId = subscriberId;
    }

    public String toString()
    {
      StringBuilder sb = new StringBuilder();
      sb.append(this.id);
      sb.append(" (subscriberId=");
      sb.append(this.subscriberId);
      sb.append(")");
      return sb.toString();
    }
  }

  public static class Entity
  {
    private final String type;

    private final String name;

    private final String id;

    private final String customerId;

    public Entity(String type, String name, String id, String customerId)
    {
      this.type = type;
      this.name = name;
      this.id = id;
      this.customerId = customerId;
    }

    public String toString()
    {
      StringBuilder sb = new StringBuilder();
      sb.append("(type=");
      sb.append(this.type);
      sb.append(", id=");
      sb.append(this.id);
      sb.append(", name=");
      sb.append(this.name);
      sb.append(", customerId=");
      sb.append(this.customerId);
      sb.append(")");
      return sb.toString();
    }
  }

}
