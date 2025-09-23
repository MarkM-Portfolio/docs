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

import java.sql.DriverManager;

/**
 * 
 * Usage: java -classpath {db2 driver location};com.ibm.docs.deployment.jar \
 *        com.ibm.docs.deployment.OracleDatasourceConnectoin {hostname} {port} {user name} {password} {db name}
 * 
 */
public class OracleDatasourceConnectoin
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
      Class.forName("oracle.jdbc.driver.OracleDriver").newInstance();
      //Oracle URL pattern: jdbc:oracle:thin:@9.110.83.109:1521:idocs
      String jdbcURL = "jdbc:oracle:thin:@" +dbHost+ ":" + dbPort +":"+ dbName;

      DriverManager.getConnection(jdbcURL,dbUser,dbPWD);
    }
    catch (ClassNotFoundException e)
    {
      System.out.print("Failed:" + e + "\nPlease check the Oracle driver location");
      return;
    }
    catch (Exception e)
    {
      System.out.print("Failed:" + e);
      return;
    }

    System.out.print("Successful for Oracle test connection!");
    return;
  }
}
