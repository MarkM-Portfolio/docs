/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.indextable;

import java.util.Random;

public class DOMIdGenerator
{
    private static Random random;
  
    static
    {
      random = new Random();
      random.setSeed(System.currentTimeMillis());
    }
  
    public static String generate()
    {
      return generate("id_");
    }
    public static String generate(String baseId)
    {
      long rid = 0;
      rid = System.currentTimeMillis() + random.nextInt();
      return baseId + Long.toHexString(rid);
    }
}