/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.deployment;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * 
 * Usage: java -classpath {db2 driver location};com.ibm.docs.deployment.jar \
 *        com.ibm.docs.deployment.TestDBConnection {hostname} {port} {user name} {password} {db name}
 * 
 */
public class TestDBConnection
{
  public static void main(String[] args)
  {
    // args list: hostname,port,username,password,dbname
    if (args.length < 5)
    {
      System.out.println("Failed:Invalid parameters for TestDBConnection");
      return;
    }
    String dbHost = args[0];
    String dbPort = args[1];
    String dbUser = args[2];
    String dbPWD = args[3];
    String dbName = args[4];
    try
    {
      Class.forName("com.ibm.db2.jcc.DB2Driver");
      String url = "jdbc:db2://" + dbHost + ":" + dbPort + "/" + dbName;
      Connection conn = DriverManager.getConnection(url, dbUser, dbPWD);
    }
    catch (ClassNotFoundException e)
    {
      System.out.print("Failed:" + e + "\nPlease check the DB2 driver location");
      return;
    }
    catch (Exception e)
    {
      System.out.print("Failed:" + e);
      return;
    }

    System.out.print("Successful:DB2 configuration valid");
    return;
  }
}
