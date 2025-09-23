/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.journal;

public class JournalHelper
{
  /* JOURNAL for IBM Docs is implemented per close relevant other repositories
   * like Connection Files, FiletNet or potential integration with like iNotes, WCM
   * */
  public enum Action{
    CREATE,
    PUBLISH,
    IMPORT,
    EXPORT,
  }
  
  public enum Outcome{
    SUCCESS,
    FAILURE,
  }
  
  public enum Component {
    DOCS_EDITOR,
    DOCS_REPOSITORY, /*Renamed to repository rather than LotusLIVE because that is not the only repostory for IBM Docs*/
  }
  public enum Objective {
    FILE,
    FOLDER,
    COMMUNITY,
  }

  public static class Actor
  {
    private final String email;

    private final String id;

    private final String customerId;

    private final String subscriberId;

    public String getEmail()
    {
      return email;
    }

    public String getId()
    {
      return id;
    }

    public String getCustomerId()
    {
      return customerId;
    }

    public String getSubscriberId()
    {
      return subscriberId;
    }

    public Actor(String email, String id, String customerId)
    {
      this(email, id, customerId, id);
    }

    public Actor(String email, String id, String customerId, String subscriberId)
    {
      this.email = email;
      this.id = id;
      this.customerId = customerId;
      this.subscriberId = subscriberId;
    }
    public String toString()
    {
      StringBuilder sb = new StringBuilder();
      //sb.append(this.email);
      sb.append("(id=");
      sb.append(getId());
      sb.append(", subscriberId=");
      sb.append(getId());
      sb.append(")");
      return sb.toString();
    }
    
  }

  public static class Entity
  {
    private final Objective type;

    private final String name;

    private final String id;

    private final String customerId;

    public Objective getType()
    {
      return type;
    }
    
    public String getName()
    {
      return name;
    }
    
    public String getId()
    {
      return id;
    }
    
    public String getCustomerId()
    {
      return customerId;
    }

    public Entity(Objective type, String name, String id, String customerId)
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
      sb.append(getType());
      sb.append(", id=");
      sb.append(getId());
      sb.append(", name=");
      sb.append(getName());
      sb.append(", customerId=");
      sb.append(getCustomerId());
      sb.append(")");
      return sb.toString();
    }
  }
}
