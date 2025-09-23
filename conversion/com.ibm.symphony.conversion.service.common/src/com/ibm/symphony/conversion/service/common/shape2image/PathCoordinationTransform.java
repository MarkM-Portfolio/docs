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
import java.util.Map;

public class PathCoordinationTransform
{
  // Internal class for storing the max/min values for a curve.
  private class MaxMin
  {
    int max;

    int min;

    MaxMin()
    {
      max = 0;
      min = 0;
    }

    public int getMax()
    {
      return max;
    }

    public void setMax(double max)
    {
      this.max = Math.round((float) max);
    }

    public int getMin()
    {
      return min;
    }

    public void setMin(double min)
    {
      this.min = Math.round((float) min);
    }
  }

  private String path;

  private boolean isClosed;

  private boolean isFirstMovePara = true;

  private int position;

  private Point prevPoint;

  private Point prevControlPoint;

  private TOKEN prevCommand;

  private TOKEN prevOperation;

  private int ivInitialX;

  private int ivInitialY;

  private int ivMinX;

  private int ivMaxX;

  private int ivMinY;

  private int ivMaxY;

  private Map<String, TOKEN> keyTokens = new HashMap<String, TOKEN>();

  public enum TOKEN {
    move, horizontal, vertical, curve, smooth, line, closepath, parameter, error, end
  };

  private String keyWords[] = new String[] { "m", "h", "v", "c", "s", "l", "z" };

  private TOKEN currentToken;

  private Object tokenValue;

  public PathCoordinationTransform()
  {
    for (int i = 0; i < keyWords.length; i++)
    {
      keyTokens.put(keyWords[i], TOKEN.values()[i]);
    }
  }

  public PathCoordinationTransform(String path)
  {
    this.path = path;
    ivInitialX = 0;
    ivInitialY = 0;
  }

  public void transform()
  {

  }

  /**
   * parse an SVG string to handle the different commands
   * 
   * @param path
   *          from ODF document
   * @return SVG path used to draw shape in HTML
   */
  public String parse(String path)
  {
    this.path = path;
    currentToken = this.nextToken();
    StringBuilder buf = new StringBuilder(path.length());
    while (currentToken != TOKEN.end)
    {
      if (currentToken == null)
        break;
      else if (currentToken == TOKEN.move)
      {
        buf = handleMoveCommand(buf);
        prevOperation = TOKEN.move;
      }
      else if (currentToken == TOKEN.horizontal)
      {
        buf = handleHorizontalCommand(buf);
        prevOperation = TOKEN.horizontal;
      }
      else if (currentToken == TOKEN.vertical)
      {
        buf.append(handleVerticalCommand());
        prevOperation = TOKEN.vertical;
      }
      else if (currentToken == TOKEN.curve)
      {
        buf = handleCurveCommand(buf);
        prevOperation = TOKEN.curve;
      }
      else if (currentToken == TOKEN.smooth)
      {
        buf = handleSmoothCommand(buf);
        prevOperation = TOKEN.smooth;
      }
      else if (currentToken == TOKEN.line)
      {
        buf = handleLineCommand(buf);
        prevOperation = TOKEN.line;
      }
      else if (currentToken == TOKEN.closepath)
      {
        buf.append(handleClosePathCommand());
        prevOperation = TOKEN.closepath;
      }
    }
    return buf.toString().trim();
  }

  private StringBuilder handleHorizontalCommand(StringBuilder buf)
  {
    prevCommand = currentToken;
    buf.append(this.tokenValue).append(' ');
    while (true)
    {
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;
      int delta_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(this.tokenValue.toString()).append(' ');
      prevPoint = new Point(prevPoint.getX() + delta_x, prevPoint.getY());
      if (prevPoint.getX() > ivMaxX)
        ivMaxX = prevPoint.getX();
      else if (prevPoint.getX() < ivMinX)
        ivMinX = prevPoint.getX();
      prevCommand = currentToken;
    }
    return buf;
  }

  private StringBuilder handleMoveCommand(StringBuilder buf)
  {
    buf.append(this.tokenValue).append(' ');
    while (true)
    {
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;
      int x = Integer.parseInt(this.tokenValue.toString());
      currentToken = this.nextToken();
      int y = Integer.parseInt(this.tokenValue.toString());
      if (isFirstMovePara)
      {
        ivInitialX = x;
        ivInitialY = y;
        x = 0;
        y = 0;
        buf.append(x).append(' ');
        buf.append(y).append(' ');
        prevPoint = new Point(x, y);
        isFirstMovePara = false;
      }
      else
      {
        Point currPoint = new Point(prevPoint.getX() + x, prevPoint.getY() + y);
        if (currPoint.getX() > ivMaxX)
          ivMaxX = currPoint.getX();
        else if (currPoint.getX() < ivMinX)
          ivMinX = currPoint.getX();
        if (prevCommand == TOKEN.closepath)
        {
          buf.append(currPoint.getX()).append(' ');
          buf.append(currPoint.getY()).append(' ');
        }
        else
        {
          buf.append(x).append(' ');
          buf.append(y).append(' ');
        }

        if (currPoint.getY() > ivMaxY)
          ivMaxY = currPoint.getY();
        else if (currPoint.getY() < ivMinY)
          ivMinY = currPoint.getY();
        prevPoint = currPoint;
      }
      prevCommand = currentToken;
    }
    return buf;
  }

  private String handleVerticalCommand()
  {
    StringBuilder buf = new StringBuilder(16);
    prevCommand = currentToken;
    Object command = this.tokenValue;
    buf.append(command).append(' ');
    while (true)
    {
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;

      int delta_y = Integer.parseInt(this.tokenValue.toString());
      if (delta_y == 0)
        continue;
      buf.append(delta_y).append(' ');
      Point currPoint = new Point(prevPoint.getX(), prevPoint.getY() + delta_y);
      if (currPoint.getY() > ivMaxY)
        ivMaxY = currPoint.getY();
      if (currPoint.getY() < ivMinY)
        ivMinY = currPoint.getY();
      prevCommand = currentToken;
      prevPoint = currPoint;
    }
    String fullCommand = buf.toString();
    if (fullCommand.trim().length() == 1)
      return "";
    return fullCommand;
  }

  /**
   * This is a cubic Bezier curve. We need to calculate the min max values of the arc.
   * 
   * @return curve command string
   */
  private StringBuilder handleCurveCommand(StringBuilder buf)
  {
    prevCommand = currentToken;
    buf.append(this.tokenValue).append(' ');
    while (true)
    {
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;

      int c1_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(c1_x).append(' ');
      currentToken = this.nextToken();
      int c1_y = Integer.parseInt(this.tokenValue.toString());
      buf.append(c1_y).append(' ');
      currentToken = this.nextToken();
      int c2_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(c2_x).append(' ');
      currentToken = this.nextToken();
      int c2_y = Integer.parseInt(this.tokenValue.toString());
      buf.append(c2_y).append(' ');
      currentToken = this.nextToken();
      int end_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(end_x).append(' ');
      currentToken = this.nextToken();
      int end_y = Integer.parseInt(this.tokenValue.toString());
      buf.append(end_y).append(' ');

      // Calculate the maximum and minimum values X values for the curve
      MaxMin mX = calculateMaxMin(prevPoint.getX(), prevPoint.getX() + c1_x, prevPoint.getX() + c2_x, prevPoint.getX() + end_x);
      if (mX.getMax() > ivMaxX)
        ivMaxX = mX.getMax();
      if (mX.getMin() < ivMinX)
        ivMinX = mX.getMin();
      // Calculate the maximum and minimum values Y values for the curve
      MaxMin mY = calculateMaxMin(prevPoint.getY(), prevPoint.getY() + c1_y, prevPoint.getY() + c2_y, prevPoint.getY() + end_y);
      if (mY.getMax() > ivMaxY)
        ivMaxY = mY.getMax();
      if (mY.getMin() < ivMinY)
        ivMinY = mY.getMin();

      // The previous control point which is used in a "smooth" bezier curve
      prevControlPoint = new Point(prevPoint.getX() + c2_x, prevPoint.getY() + c2_y);
      prevPoint = new Point(prevPoint.getX() + end_x, prevPoint.getY() + end_y);
      prevCommand = currentToken;
    }
    return buf;
  }

  /**
   * returns the max/min of a curve
   * 
   * @param p0
   *          beginning point of curve
   * @param p1
   *          first control point of curve
   * @param p2
   *          second control point of curve
   * @param p3
   *          curve end point
   * @return max and min values
   * 
   *         The explicit formula of the curve is: B(t)=(1-t)^3* p0 + 3(1-t)^2 * p1 +3(1-t)t^2 * p2 + t^3 * p3 for t in [0,1].
   * 
   */
  private MaxMin calculateMaxMin(int p0, int p1, int p2, int p3)
  {
    MaxMin m = new MaxMin();
    boolean firstTime = true;

    for (int i = 1; i <= 200; i++)
    {
      double t = i / 200.0;
      double c1 = ((Math.pow(1 - t, 3))) * p0;
      double c2 = c1 + 3 * (Math.pow(1 - t, 2)) * t * p1;
      double c3 = c2 + 3 * (1 - t) * Math.pow(t, 2) * p2;
      double c4 = c3 + (Math.pow(t, 3)) * p3;
      if (firstTime)
      {
        firstTime = false;
        m.setMax(c4);
        m.setMin(c4);
      }
      else
      {
        if (c4 < m.getMin())
          m.setMin(c4);
        if (c4 > m.getMax())
          m.setMax(c4);
      }
    }
    return m;
  }

  /**
   * handles the calculation of max min of a Smooth Bezier Curve
   * 
   * @return SVG used to generate it
   * 
   *         Then your second point in the short hand is the terminating point for the length of the curve the shorthand represents. If we
   *         are to translate your paths into both full length versions we would have:
   * 
   *         M X0,Y0 C X1,Y1 X2,Y2 X3,Y3 M X3,Y3 C XR,YR X4,Y4 X5,Y5
   * 
   *         Where XR, YR is the reflection of the last control point of the previous curve about the first point of the current curve. XR,
   *         YR is just the reflection of P2 about P3 so:
   * 
   *         XR = 2*X3 - X2 and YR = 2*Y3 - Y2
   */
  private StringBuilder handleSmoothCommand(StringBuilder buf)
  {
    boolean prevCommandIsCurve = false;
    int c1_x = 0;
    int c1_y = 0;
    int previousC2_x = 0;
    int previousC2_y = 0;
    prevCommand = currentToken;
    buf.append(this.tokenValue).append(' ');
    while (true)
    {
      if (prevOperation == TOKEN.curve || prevOperation == TOKEN.smooth)
      {
        previousC2_x = prevControlPoint.getX();
        previousC2_y = prevControlPoint.getY();
        prevCommandIsCurve = true;
      }
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;

      int c2_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(c2_x).append(' ');
      currentToken = this.nextToken();
      int c2_y = Integer.parseInt(this.tokenValue.toString());
      buf.append(c2_y).append(' ');
      currentToken = this.nextToken();
      int end_x = Integer.parseInt(this.tokenValue.toString());
      buf.append(end_x).append(' ');
      currentToken = this.nextToken();
      int end_y = Integer.parseInt(this.tokenValue.toString());
      buf.append(end_y).append(' ');
      int maxX, minX, maxY, minY;
      if (prevCommandIsCurve)
      {
        c1_x = 2 * prevPoint.getX() - previousC2_x;
        c1_y = 2 * prevPoint.getY() - previousC2_y;
        MaxMin mX = this.calculateMaxMin(prevPoint.getX(), c1_x, prevPoint.getX() + c2_x, prevPoint.getX() + end_x);
        MaxMin mY = this.calculateMaxMin(prevPoint.getY(), c1_y, prevPoint.getY() + c2_y, prevPoint.getY() + end_y);
        maxX = mX.getMax();
        minX = mX.getMin();
        maxY = mY.getMax();
        minY = mY.getMin();
      }
      else
      {
        maxX = Math.max(c2_x, end_x);
        minX = Math.min(c2_x, end_x);
        maxY = Math.max(c2_y, end_y);
        minY = Math.min(c2_y, end_y);
      }
      if (maxX > ivMaxX)
        ivMaxX = maxX;
      if (minX < ivMinX)
        ivMinX = minX;
      if (maxY > ivMaxY)
        ivMaxY = maxY;
      if (minY < ivMinY)
        ivMinY = minY;
      prevControlPoint = new Point(prevPoint.getX() + c2_x, prevPoint.getY() + c2_y);
      prevPoint = new Point(prevPoint.getX() + end_x, prevPoint.getY() + end_y);
      prevCommand = currentToken;
    }
    return buf;
  }

  private StringBuilder handleLineCommand(StringBuilder buf)
  {
    prevCommand = currentToken;
    buf.append(this.tokenValue).append(' ');
    while (true)
    {
      currentToken = this.nextToken();
      if (currentToken != TOKEN.parameter)
        break;
      int x = Integer.parseInt(this.tokenValue.toString());
      buf.append(x).append(' ');
      currentToken = this.nextToken();
      int y = Integer.parseInt(this.tokenValue.toString());
      buf.append(y).append(' ');
      int currX = prevPoint.getX() + x;
      int currY = prevPoint.getY() + y;

      Point currPoint = new Point(currX, currY);

      if (currX > ivMaxX)
        ivMaxX = currX;
      else if (currX < ivMinX)
        ivMinX = currX;
      if (currY > ivMaxY)
        ivMaxY = currY;
      else if (currY < ivMinY)
        ivMinY = currY;
      prevCommand = currentToken;
      prevPoint = currPoint;
    }
    return buf;
  }

  private String handleClosePathCommand()
  {
    prevCommand = currentToken;
    String command = this.tokenValue.toString();
    currentToken = this.nextToken();
    isClosed = true;
    return command;
  }

  public TOKEN nextToken()
  {
    StringBuilder buffer = new StringBuilder(16);
    int ch = read();
    while (ch != 0)
    {
      if (Character.isWhitespace(ch))
      {
        ch = read();
        continue;
      }
      else if (Character.isLetter(ch))
      {
        buffer.append((char) ch);
        // ch = read();
        // while (Character.isLetter(ch))
        // {
        // buffer.append((char) ch);
        // ch = read();
        // }
        // unread();
        tokenValue = buffer.toString();
        buffer.setLength(0);
        return keyTokens.get(tokenValue);
      }
      else if (Character.isDigit(ch))
      {
        buffer.append((char) ch);
        ch = read();
        while (Character.isDigit(ch))
        {
          buffer.append((char) ch);
          ch = read();
        }
        if (ch != 0)
          unread();
        tokenValue = buffer.toString();
        buffer.setLength(0);
        return TOKEN.parameter;
      }
      else if (ch == '-')
      {
        buffer.append((char) ch);
        ch = read();
        while (Character.isDigit(ch))
        {
          buffer.append((char) ch);
          ch = read();
        }
        if (ch != 0)
          unread();
        tokenValue = buffer.toString();
        buffer.setLength(0);
        return TOKEN.parameter;
      }
      else
        return TOKEN.error;
    }
    return TOKEN.end;
  }

  private int read()
  {
    if (position > path.length() - 1)
      return 0;
    return path.charAt(position++);
  }

  private void unread()
  {
    position--;

  }

  public int getMinXCoordinate()
  {
    return ivMinX;
  }

  public int getMinYCoordinate()
  {
    return ivMinY;
  }

  public int getMaxXCoordinate()
  {
    return ivMaxX;
  }

  public int getMaxYCoordinate()
  {
    return ivMaxY;
  }

  public double getInitialOffsetX()
  {
    return Math.abs((double) this.ivInitialX) / 1000;
  }

  public void setInitialOffsetX(int initialX)
  {
    this.ivInitialX = initialX;
  }

  public double getInitialOffsetY()
  {
    return Math.abs((double) this.ivInitialY) / 1000;
  }

  public void setInitialOffsetY(int initialY)
  {
    this.ivInitialY = initialY;
  }

  public double width()
  {
    double actualWidth = ivMaxX - ivMinX;
    return actualWidth / 1000;
  }

  public double height()
  {
    double actualHeight = ivMaxY - ivMinY;
    return actualHeight / 1000;
  }

  public double leftOffset()
  {
    if (ivMinX < 0)
    {
      double r_x = Math.min(0, prevPoint.getX());
      return Math.abs(ivMinX - r_x) / 1000;
    }
    else
      return 0.0;
  }

  public double topOffset()
  {
    if (ivMinY < 0)
    {
      double r_y = Math.min(0, prevPoint.getY());
      return Math.abs(ivMinY - r_y) / 1000;
    }
    else
      return 0.0;
  }

  public boolean isClosed()
  {
    return isClosed;
  }
}
