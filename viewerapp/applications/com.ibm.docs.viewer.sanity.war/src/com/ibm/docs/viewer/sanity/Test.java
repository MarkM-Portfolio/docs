package com.ibm.docs.viewer.sanity;

import java.net.MalformedURLException;
import java.net.URL;

public class Test
{

  /**
   * @param args
   */
  public static void main(String[] args)
  {
    try
    {
      URL url = new URL("http://localhost/conversion/t");
      System.out.println(url.getHost());
      System.out.println(url.getPort());
      System.out.println(url.getPath());
    }
    catch (MalformedURLException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

}
