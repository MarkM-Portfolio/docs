/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.common.formulalexer;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken.ErrorTokenType;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken.LexTokenType;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken.TokenSubtype;
import com.ibm.concord.spreadsheet.partialload.PartialDeserializer;

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
