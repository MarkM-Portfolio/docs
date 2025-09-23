package com.ibm.concord.viewer.admin.mbean;

public interface Image2HtmlConversionMBean
{
  public void schedule();

  public void updateSettings(Integer requestInteval, Boolean cleanImgCache);

  public void updateDebugSettings(Integer printFrequency, Integer stopIdx);

}
