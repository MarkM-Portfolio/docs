package com.ibm.concord.spreadsheet.calcserver;

import org.codehaus.jackson.JsonFactory;

import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory;

public final class CalcServerUtils
{
  public static final JsonFactory JSON_FACTORY;

  public static final ModelIOFactory MODEL_IO_FACTORY;

  static
  {
    JSON_FACTORY = new JsonFactory();

    try
    {
      MODEL_IO_FACTORY = new ModelIOFactory(JSON_FACTORY);
    }
    catch (Exception e)
    {
      throw new Error("ModelIOFactory failed to start.", e);
    }
  }
}
