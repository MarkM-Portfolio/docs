package com.ibm.docs.common.util;

public class Time
{
  private long start;

  public Time()
  {
    this.start = System.currentTimeMillis();
  }
  
  public long ellapse()
  {
    return System.currentTimeMillis() - this.start;
  }
}
