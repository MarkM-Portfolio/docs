package com.ibm.docs.sanity.exception;

import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;

public class SanityCheckException extends Exception
{
  private static final long serialVersionUID = -6472559883384007392L;

  public SanityCheckException(AbstractCheckPoint checlPoint, SanityCheckPointItem checlPointItem, Class<?> type, String phrase, int index)
  {
    super(type.getSimpleName() + "@" + phrase + "@" + index);

    checlPointItem.setResult(CheckResult.RESULT_FAILED(checlPoint.getFormatMime()));
    checlPointItem.getResult().compile(checlPointItem.getErrorMessage(type, phrase, index, null));
  }

  public SanityCheckException(AbstractCheckPoint checlPoint, SanityCheckPointItem checlPointItem, Class<?> type, String phrase, int index,
      Object[] params)
  {
    super(type.getSimpleName() + "@" + phrase + "@" + index);

    checlPointItem.setResult(CheckResult.RESULT_FAILED(checlPoint.getFormatMime()));
    checlPointItem.getResult().compile(checlPointItem.getErrorMessage(type, phrase, index, params));
  }

  public SanityCheckException(AbstractCheckPoint checlPoint, SanityCheckPointItem checlPointItem, Class<?> type, String phrase,
      Throwable exp)
  {
    super(type.getSimpleName() + "@" + phrase, exp);

    checlPointItem.setResult(CheckResult.RESULT_FAILED(checlPoint.getFormatMime()));
    checlPointItem.getResult().compile(exp.getMessage());
  }
}
