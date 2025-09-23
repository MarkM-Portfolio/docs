package com.ibm.docs.sanity.check;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.exception.SanityCheckException;

public interface ISanityCheckPoint
{
  public void setUp() throws SanityCheckException;

  public void doCheck() throws SanityCheckException;

  public void tearDown() throws SanityCheckException;

  public SanityCheckPointItem report();
}
