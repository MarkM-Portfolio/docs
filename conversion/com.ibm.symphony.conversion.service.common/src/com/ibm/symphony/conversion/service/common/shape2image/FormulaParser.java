/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.service.common.shape2image;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.ListIterator;
import java.util.Stack;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.dom.element.draw.DrawEnhancedGeometryElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawEquationElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * 
 * The aim of the algorithm is two parse a formula string and get the result. The principle is : 1. Parse the formula expression and convert
 * it to reverse polish notation string. Eg. a+b*c --> a b c * + 2. Parse the RPN string, if is number then push to stack, if it is operator
 * then pop numbers from stack , calculate the result and push result to stack 3. Because one formula may reference other formulas, use
 * recursion to do this. Use a class to record the formula name, formula value and a processed sign.
 */
public class FormulaParser
{
  private static final String CLASS = FormulaParser.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  static final String firstLevel = "+ -";

  static final String secondLevel = "* /";

  static final String thirdLevel = "@ sin cos tan atan abs sqrt atan2 min max if";

  static final String FUNCTION = "?f";

  private static final String ABS = "abs";

  private static final String SQRT = "sqrt";

  private static final String SIN = "sin";

  private static final String COS = "cos";

  private static final String TAN = "tan";

  private static final String ATAN = "atan";

  private static final String AT = "@";

  private static final String ADD = "+";

  private static final String SUBTRACT = "-";

  private static final String MULTIPLY = "*";

  private static final String DIVIDE = "/";

  private static final String MIN = "min";

  private static final String MAX = "max";

  private static final String ATAN2 = "atan2";

  private static final String IF_OP = "if";

  private static final int ABS_TYPE = 1;

  private static final int SQRT_TYPE = 2;

  private static final int SIN_TYPE = 3;

  private static final int COS_TYPE = 4;

  private static final int TAN_TYPE = 5;

  private static final int ATAN_TYPE = 6;

  private static final int AT_TYPE = 7;

  private static final int ADD_TYPE = 101;

  private static final int SUBTRACT_TYPE = 102;

  private static final int MULTIPLY_TYPE = 103;

  private static final int DIVIDE_TYPE = 104;

  private static final int MIN_TYPE = 105;

  private static final int MAX_TYPE = 106;

  private static final int ATAN2_TYPE = 107;

  private static final int IF_OP_TYPE = 201;

  // Default Initial Capacity for the Token Separators HashSet
  private static final int OPERATORS_MAP_CAPACITY = (int) (15 * 1.33) + 1;

  private static final HashMap<String, Integer> cvOperatorMap = new HashMap<String, Integer>(OPERATORS_MAP_CAPACITY);
  static
  {
    cvOperatorMap.put(ABS, ABS_TYPE);
    cvOperatorMap.put(SQRT, SQRT_TYPE);
    cvOperatorMap.put(AT, AT_TYPE);
    cvOperatorMap.put(SIN, SIN_TYPE);
    cvOperatorMap.put(COS, COS_TYPE);
    cvOperatorMap.put(TAN, TAN_TYPE);
    cvOperatorMap.put(ATAN, ATAN_TYPE);
    cvOperatorMap.put(ADD, ADD_TYPE);
    cvOperatorMap.put(SUBTRACT, SUBTRACT_TYPE);
    cvOperatorMap.put(MULTIPLY, MULTIPLY_TYPE);
    cvOperatorMap.put(DIVIDE, DIVIDE_TYPE);
    cvOperatorMap.put(MIN, MIN_TYPE);
    cvOperatorMap.put(MAX, MAX_TYPE);
    cvOperatorMap.put(ATAN2, ATAN2_TYPE);
    cvOperatorMap.put(IF_OP, IF_OP_TYPE);
  }

  private static final String OPEN_PARENTHESIS = "(";

  private static final String CLOSE_PARENTHESIS = ")";

  private static final String COMMA = ",";

  // Default Initial Capacity for the Token Separators HashSet
  private static final int TOKEN_SEPARATORS_SET_CAPACITY = (int) (3 * 1.33) + 1;

  private static final HashSet<String> cvTokenSeparators = new HashSet<String>(TOKEN_SEPARATORS_SET_CAPACITY);
  static
  {
    cvTokenSeparators.add(OPEN_PARENTHESIS);
    cvTokenSeparators.add(CLOSE_PARENTHESIS);
    cvTokenSeparators.add(COMMA);
  }

  private class OpType
  {
    private static final int UNARY_MAXIMUM = 99;

    private static final int BINARY_MAXIMUM = 199;

    public String op;

    public int type;

    public boolean isOperator = true;

    public boolean isUnary = false;

    public boolean isBinary = false;

    public boolean isTernary = false;

    public OpType(String op)
    {
      this.op = op;
      this.type = getOperatorType();
      if (this.type == 0)
      {
        this.isOperator = false;
      }
      else
      {
        if (this.type <= UNARY_MAXIMUM)
        {
          this.isUnary = true;
        }
        else if (this.type <= BINARY_MAXIMUM)
        {
          this.isBinary = true;
        }
        else
        {
          this.isTernary = true;
        }
      }
    }

    /**
     * Determine the operator type for a string
     * 
     * @return int Operator Type (or 0 if not an operator)
     */
    public int getOperatorType()
    {
      Integer value = cvOperatorMap.get(op);
      if (value != null)
      {
        return value;
      }
      else
        return 0;
    }
  }

  private class Packet
  {
    public String formulaStr;

    public double value;

    public boolean sign;

    public Packet()
    {
      formulaStr = "";
      value = 0;
      sign = false;
    }
  }

  private Map<String, Packet> functionPac;

  private Map<String, Double> constants;

  /**
   * HIDE DEFAULT CONSTRUCTOR
   */
  @SuppressWarnings("unused")
  private FormulaParser()
  {
  }

  /**
   * Constructor
   * 
   * @param srcthe
   *          string(expression) to calculate
   */
  public FormulaParser(Node domNode)
  {
    if (domNode instanceof DrawEnhancedGeometryElement)
    {
      DrawEnhancedGeometryElement degeNode = (DrawEnhancedGeometryElement) domNode;
      // put all the constant value in Map of constants
      constants = new HashMap<String, Double>();
      constants.put("pi", Math.PI);
      if (degeNode.hasAttribute("draw:path-stretchpoint-x"))
        constants.put("x", degeNode.getDrawPathStretchpointXAttribute());
      if (degeNode.hasAttribute("draw:path-stretchpoint-y"))
        constants.put("y", degeNode.getDrawPathStretchpointYAttribute());
      if (degeNode.hasAttribute("draw:modifiers"))
      {
        String modifiers = degeNode.getDrawModifiersAttribute();
        String modifier[] = modifiers.split(" ");
        for (int i = 0; i < modifier.length; i++)
        {
          constants.put("$" + String.valueOf(i), Double.parseDouble(modifier[i]));
        }
      }
      if (degeNode.hasAttribute("svg:viewBox"))
      { // svg:viewbox(left, top, right, bottom)
        String viewboxValues = degeNode.getSvgViewBoxAttribute();
        String value[] = viewboxValues.split(" ");
        for (int i = 0; i < value.length; i++)
        {
          switch (i)
            {
              case 0 :
                constants.put("left", Double.parseDouble(value[0]));
                break;
              case 1 :
                constants.put("top", Double.parseDouble(value[1]));
                break;
              case 2 :
                constants.put("right", Double.parseDouble(value[2]));
                constants.put("width", Math.abs(Double.parseDouble(value[2]) - Double.parseDouble(value[0])));
                break;
              case 3 :
                constants.put("bottom", Double.parseDouble(value[3]));
                constants.put("height", Math.abs(Double.parseDouble(value[3]) - Double.parseDouble(value[1])));
                break;
            }
        }
      }
      else
      {
        constants.put("left", 0.0);
        constants.put("top", 0.0);
        constants.put("right", 21600.0);
        constants.put("width", 21600.0);
        constants.put("bottom", 21600.0);
        constants.put("height", 21600.0);
      }

      // Put all the formulas that used in Map of functionPac
      NodeList children = degeNode.getChildNodes();
      functionPac = new HashMap<String, Packet>();
      for (int i = 0; i < children.getLength(); i++)
      {
        Node child = children.item(i);
        if (child instanceof DrawEquationElement)
        {
          DrawEquationElement childElement = (DrawEquationElement) child;
          Packet forPack = new Packet();
          forPack.formulaStr = childElement.getDrawFormulaAttribute();
          functionPac.put(childElement.getDrawNameAttribute(), forPack);
        }
      }
    }
  }

  /**
   * Calculate the formula
   * 
   * @param fName
   *          : formula name
   * @return the value of the formula
   */
  public double getResult(String fName)
  {
    Packet tempack = functionPac.get(fName);
    if (tempack == null)
      return 0;
    else
    {
      if (tempack.sign == true)
        return tempack.value;
      else
      {
        tempack.value = parseFormula(tempack.formulaStr);
        tempack.sign = true;
        return tempack.value;
      }
    }
  }

  /**
   * Determine if a string is a formula name
   * 
   * @param fName
   *          :the string need to judge
   * @return true if fName is a formula name, or false
   */
  private boolean isFunctionName(String fName)
  {
    if (fName.length() <= FUNCTION.length())
      return false;

    int index = fName.indexOf(FUNCTION);
    if (index >= 0)
    {
      index += FUNCTION.length();
      try
      {
        Integer.parseInt(fName.substring(index));
        return true;
      }
      catch (NumberFormatException e)
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  }

  /**
   * Calculate the string to get the result
   * 
   * @param formula
   *          : the formula expression
   * @return(double)result
   */
  private double parseFormula(String formula)
  {
    double result = 0;
    try
    {
      String src = preHandle(formula);
      String postfix = getRPN(src);
      Stack<Object> stk = new Stack<Object>();
      String parts[] = postfix.split(" ");
      for (int i = 0; i < parts.length; i++)
      {
        String tmp = parts[i];
        OpType opType = new OpType(tmp);
        if (!opType.isOperator)
        {
          stk.push(parts[i]);
        }
        else if (opType.isUnary)
        {
          double a = getRealValue(stk.pop());
          result = unaryCalculation(a, opType);
          stk.push(result);
        }
        else if (opType.isBinary)
        {
          double b = getRealValue(stk.pop());
          double a = getRealValue(stk.pop());
          result = binaryCalculation(a, b, opType);
          stk.push(result);
        }
        else if (opType.isTernary)
        {
          double c = getRealValue(stk.pop());
          double b = getRealValue(stk.pop());
          double a = getRealValue(stk.pop());
          result = ternaryCalculation(a, b, c, opType);
          stk.push(result);
        }
      }
      result = getRealValue(stk.pop());

    }
    catch (Exception e)
    {
      LOG.warning("Non-valid formula detected = " + formula);
    }
    return result;
  }

  public double getRealValue(Object stackValue)
  {
    if (stackValue instanceof Double)
    {
      return (Double) stackValue;
    }

    String sv = (String) stackValue;

    Double value = constants.get(sv);

    if (value != null)
      return value;

    if (isFunctionName(sv))
      return getResult(sv.substring(1));
    try
    {
      if (sv.length() < 1)
      {
        LOG.warning("Formula has a empty value.  This is likely due to a Symphony conversion issue.");
        return 0;
      }
      return Double.parseDouble(sv);
    }
    catch (Exception e)
    {
      LOG.warning("Formula has a non-valid value = " + sv);
      return 0;
    }
  }

  /**
   * Calculate unary function, abs | sin | cos | sqrt | tan | atan
   * 
   * @param a
   *          : number 1
   * @param op
   *          : the operator
   * @return
   */
  private double unaryCalculation(double a, OpType op)
  {
    double value = 0;
    switch (op.type)
      {
        case ABS_TYPE :
          value = Math.abs(a);
          break;
        case SQRT_TYPE :
          value = Math.sqrt(a);
          break;
        case SIN_TYPE :
          value = Math.sin(a);
          break;
        case COS_TYPE :
          value = Math.cos(a);
          break;
        case TAN_TYPE :
          value = Math.tan(a);
          break;
        case ATAN_TYPE :
          value = Math.atan(a);
          break;
        case AT_TYPE :
          value = a * (-1);
          break;
      }

    return value;
  }

  /**
   * Calculate binary function, + | - | * | / | min | max |atan2
   * 
   * @param a
   *          : number 1
   * @param b
   *          : number 2
   * @param op
   *          : the operator
   * @return(double)(a op b)
   */
  private double binaryCalculation(double a, double b, OpType op)
  {
    double value = 0;
    switch (op.type)
      {
        case ADD_TYPE :
          value = a + b;
          break;
        case SUBTRACT_TYPE :
          value = a - b;
          break;
        case MULTIPLY_TYPE :
          value = a * b;
          break;
        case DIVIDE_TYPE :
          if (b == 0)
            value = 0;
          else
            value = a / b;
          break;
        case MIN_TYPE :
          value = a < b ? a : b;
          break;
        case MAX_TYPE :
          value = a > b ? a : b;
          break;
        case ATAN2_TYPE :
          value = Math.atan2(a, b);
          break;
      }

    return value;
  }

  /**
   * Calculate ternary function, if
   * 
   * @param a
   *          : number 1
   * @param b
   *          : number 2
   * @param c
   *          : number 3
   * @param op
   *          : the operator
   * @return the value of if(a, b, b)
   */
  private double ternaryCalculation(double a, double b, double c, OpType op)
  {
    double value = 0;
    switch (op.type)
      {
        case IF_OP_TYPE :
          if (a > 0)
            value = b;
          else
            value = c;
          break;
      }
    return value;
  }

  /**
   * Determine the priority of two operators
   * 
   * @param opa
   *          : operator 1
   * @param opb
   *          : operator 2
   * @return true if the priority of a is not lower than b
   */
  private boolean isPriorThan(String opa, String opb)
  {
    int levela = levelOfOp(opa);
    int levelb = levelOfOp(opb);
    if (levela >= levelb)
      return true;
    else
      return false;
  }

  /**
   * Get the priority of a operator
   * 
   * @param op
   *          : operator 1
   * @return priority level
   */
  private int levelOfOp(String op)
  {
    if (firstLevel.indexOf(op) >= 0)
      return 1;
    else if (secondLevel.indexOf(op) >= 0)
      return 2;
    else if (thirdLevel.indexOf(op) >= 0)
      return 3;
    else
      return 0;
  }

  /**
   * Pre-handle input stream 1. replace unary function '-' with '@' 2. remove unary function '+' 3. remove all blank space
   * 
   * @param src
   *          initial string
   * @return replace the '-' with '@'
   */
  private String preHandle(String src)
  {
    // remove all the white space in the formula
    String formula = src.replaceAll(" ", "");
    if (formula.length() > 0 && formula.charAt(0) == '-')
    {
      formula = formula.substring(1);
      formula = AT + formula;
    }
    if (formula.length() > 0 && formula.charAt(0) == '+')
    {
      formula = formula.substring(1);
    }
    for (int i = 0; i + 1 < formula.length();)
    {
      char pre = formula.charAt(i++);
      char curr = formula.charAt(i);
      if ((pre == '(' && curr == '-') || (pre == ',' && curr == '-'))
      {
        formula = formula.substring(0, i) + AT + formula.substring(i + 1);
      }
      if ((pre == '(' && curr == '+'))
        formula = formula.substring(0, i) + formula.substring(i + 1);
    }
    return formula;
  }

  /**
   * Convert the string to reverse polish notation string
   * 
   * @param src
   *          : the initial formula string
   * @return reverse polish notation string
   */
  private String getRPN(String src)
  {
    Stack<String> opStk = new Stack<String>();
    StringBuilder postfix = new StringBuilder(16);
    int i = 0;
    while (i < src.length())
    {
      if (Character.isDigit(src.charAt(i)) || src.charAt(i) == ('.'))
      {
        do
        {
          postfix.append(src.charAt(i++));
        }
        while ((i < src.length()) && (Character.isDigit(src.charAt(i)) || src.charAt(i) == ('.')));
        postfix.append(" ");
      }
      else
      {
        String token = "";

        boolean isTokenSeparator = false;
        boolean isConstant = false;
        boolean isOperator = false;
        boolean isFunctionName = false;

        do
        {
          token += src.charAt(i++);

          // End the Loop if the Token is a Token Separator
          if (cvTokenSeparators.contains(token))
          {
            isTokenSeparator = true;
            break;
          }

          // End the Loop if the Token is a Constant
          if (constants.containsKey(token))
          {
            isConstant = true;
            break;
          }

          // End the Loop if the Token is an Operator or Function Name
          // but not if the including the next character in the name would also be an Operator or Function Name
          if (i < src.length())
          {
            String nextPossibleToken = token + src.charAt(i);
            if (!isOperator(nextPossibleToken) && (isOperator(token)))
            {
              isOperator = true;
              break;
            }
            if (!isFunctionName(nextPossibleToken) && (isFunctionName(token)))
            {
              isFunctionName = true;
              break;
            }
          }
          else
          {
            if (isOperator(token))
            {
              isOperator = true;
              break;
            }
            if (isFunctionName(token))
            {
              isFunctionName = true;
              break;
            }
          }
        }
        while (i < src.length());

        if (isTokenSeparator)
        {
          if (token.equals(OPEN_PARENTHESIS))
            opStk.push(OPEN_PARENTHESIS);
          else if (token.equals(CLOSE_PARENTHESIS))
          {
            while (!opStk.peek().equals(OPEN_PARENTHESIS))
            {
              String tmp = (String) opStk.pop();
              postfix.append(tmp);
              postfix.append(" ");
            }
            opStk.pop(); // pop "("
          }
          else if (token.equals(COMMA))
          {
            if (opStk.peek().equals(AT))
              postfix.append(opStk.pop() + " ");
          }
        }
        else if (isConstant || isFunctionName)
        {
          postfix.append(token);
          postfix.append(" ");
        }
        else if (isOperator)
        {
          while ((!opStk.empty()) && (!opStk.peek().equals(OPEN_PARENTHESIS)) && isPriorThan(opStk.peek(), token))
          {// the former one is hight ,then pop up
            postfix.append(opStk.pop() + " ");
          }
          opStk.push(token.toString());
        }
        else
          return "0";
      }
    }
    ListIterator<String> it = opStk.listIterator(opStk.size());
    while (it.hasPrevious())
      postfix.append(it.previous() + " ");
    return postfix.toString();
  }

  public void finalize()
  {
    clear();
  }

  public void clear()
  {
    functionPac.clear();
    constants.clear();
    functionPac = null;
    constants = null;
  }

  /**
   * Determine if a string is an operator
   * 
   * @param op
   *          : the string to judge
   * @return true if op is an operator otherwise return false
   */
  private boolean isOperator(String op)
  {
    Integer value = cvOperatorMap.get(op);
    if (value != null)
    {
      return true;
    }
    else
      return false;
  }

}