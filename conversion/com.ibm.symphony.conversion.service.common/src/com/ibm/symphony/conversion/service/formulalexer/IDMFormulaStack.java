/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.formulalexer;

import java.util.Stack;

public class IDMFormulaStack
{
  Stack<IDMFormulaToken> stack_ = new Stack<IDMFormulaToken>();

  void pop()
  {
    if (stack_.size() > 0)
      stack_.pop();
  };

  IDMFormulaToken peek()
  {
    if (stack_.size() > 0)
      return stack_.lastElement();
    return null;
  }

  void push(IDMFormulaToken token)
  {
    stack_.push(token);
  }

  IDMFormulaToken peekAndPop()
  {
    if (stack_.size() > 0)
    {
      IDMFormulaToken ret = stack_.lastElement();
      stack_.pop();
      return ret;
    }
    return null;
  }

}
