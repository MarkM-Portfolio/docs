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

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.StringTokenizer;

import org.apache.commons.lang.StringUtils;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ODFPathIntepreter
{

  public double getMax_x()
  {
    return max_x;
  }

  public double getMax_y()
  {
    return max_y;
  }

  public double getMin_x()
  {
    return min_x;
  }

  public double getMin_y()
  {
    return min_y;
  }

  private Point prevPoint;

  private char prevCommand;

  private Character prevSVGCommand;

  private double max_x = 0;

  private double max_y = 0;

  private double min_x = 0;

  private double min_y = 0;

  public ODFPathIntepreter()
  {

  }

  public Map<String, String> parse(List<String> commands)
  {
    Map<String, String> map = new LinkedHashMap<String, String>();
    StringBuilder buf = new StringBuilder(64);
    String fill = null;
    for (String command : commands)
    {

      if (command.length() == 1)
      {
        char currCommand = command.charAt(0);
        switch (currCommand)
          {
            case 'N' :
            {
              map.put(buf.toString().trim(), fill);
              fill = null;
              buf = new StringBuilder(64);
              prevSVGCommand = null;
              break;
            }
            case 'Z' :
            {
              buf.append(currCommand);
              break;
            }
            case 'F' :
            {
              fill = ODFConstants.HTML_VALUE_NONE;
              break;
            }
            default:
              break;
          }
        prevCommand = currCommand;
        continue;
      }
      StringTokenizer tokens = new StringTokenizer(command);

      String token = tokens.nextToken();
      if (token.length() == 1 && StringUtils.isAlpha(token))
      {

        char c = token.charAt(0);

        switch (c)
          {
            case 'M' :
            case 'L' :
            case 'C' :
            case 'Q' :
            {
              int index = command.indexOf(c);
              String sparameters = command.substring(index + 2);
              String[] parameters = sparameters.split(" ");

              for (int i = 0; i < parameters.length / 2; i++)
              {
                int x = Integer.parseInt(parameters[2 * i]);
                int y = Integer.parseInt(parameters[2 * i + 1]);
                prevPoint = new Point(x, y);
                if (x > max_x)
                  max_x = x;
                if (x < min_x)
                  min_x = x;
                if (y > max_y)
                  max_y = y;
                if (y < min_y)
                  min_y = y;
              }
              buf.append(command);
              prevCommand = c;
              break;
            }
            case 'A' :
            {
              buf.append(parseACommand(command, c));
              break;
            }
            case 'S' :
            {
              prevCommand = c;
              break;
            }
            case 'F' :
            {
              prevCommand = c;
              fill = "none";
              break;
            }
            case 'B' :
            {
              buf.append(parseBCommand(command, c));
              break;
            }
            case 'T' :
            {
              buf.append(parseTCommand(command, c));
              break;
            }
            case 'V' :
            case 'W' :
            {
              buf.append(parseVWCommand(command, c));
              break;
            }
            case 'Z' :
            {
              buf.append(command);
              prevCommand = c;
              break;
            }
            case 'U' :
            {
              buf.append(parseUCommand(command, c));
              break;
            }
            case 'X' :
            {
              buf.append(parseXCommand(command, c));
              break;
            }
            case 'Y' :
            {
              buf.append(parseYCommand(command, c));
              break;
            }
            case 'N' :
            {
              map.put(buf.toString().trim(), fill);
              fill = null;
              buf = new StringBuilder(64);
              prevCommand = c;
              break;
            }
            default:
              buf.append(token);
              break;
          }
      }
    }

    // Note: There are problems with ODP files generated by prior versions of Symphony where the paths are not correctly terminated. The
    // following code handles those cases since Symphony will not go back and fix up bad syntax.
    if (prevCommand != 'N')
    {
      String path = buf.toString().trim();
      if (path.length() > 1)
      {
        map.put(path, fill);
      }
    }

    return map;
  }

  public void setViewBox(String viewbox)
  {
    String[] viewBoxs = viewbox.split(" ");
    min_x = Double.parseDouble(viewBoxs[0]);
    min_y = Double.parseDouble(viewBoxs[1]);
    max_x = Double.parseDouble(viewBoxs[2]);
    max_y = Double.parseDouble(viewBoxs[3]);
  }

  private String parseACommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");

    Queue<Point> queue = new LinkedList<Point>();
    for (int i = 0; i < parameters.length / 2; i++)
    {
      int x = Integer.parseInt(parameters[2 * i]);
      int y = Integer.parseInt(parameters[2 * i + 1]);
      Point point = new Point(x, y);
      queue.add(point);
    }

    Point boxPoint1 = queue.poll();
    Point boxPoint2 = queue.poll();
    Point startPoint = queue.poll();
    Point endPoint = queue.poll();

    char sweepFlag = '0';
    char arcFlag = '0';
    while (boxPoint1 != null)
    {
      int rx = Math.abs((boxPoint2.getX() - boxPoint1.getX()) / 2);
      int ry = Math.abs((boxPoint2.getY() - boxPoint1.getY()) / 2);

      int start_x = startPoint.getX();
      int start_y = startPoint.getY();

      int end_x = endPoint.getX();
      int end_y = endPoint.getY();
      if(start_x > rx && start_y> ry && end_x<rx && end_y>ry && start_y<end_y)
    	  arcFlag = '1';
      if (prevCommand != 'A' && prevCommand != 'M' && prevCommand != 'L')
      {
        buf.append('M').append(' ');
        buf.append(start_x).append(' ');
        buf.append(start_y).append(' ');
      }
      else
      {
        buf.append('L').append(' ');
        buf.append(start_x).append(' ');
        buf.append(start_y).append(' ');
      }
      buf.append('A').append(' ');
      buf.append(rx).append(' ');
      buf.append(ry).append(' ');
      buf.append(0).append(' ');
      buf.append(arcFlag).append(' ');
      buf.append(sweepFlag).append(' ');
      buf.append(end_x).append(' ');
      buf.append(end_y).append(' ');
      this.prevPoint = endPoint;
      boxPoint1 = queue.poll();
      boxPoint2 = queue.poll();
      startPoint = queue.poll();
      endPoint = queue.poll();
      prevCommand = c;
      prevSVGCommand = 'A';
    }
    return buf.toString();
  }

  private String parseBCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");

    Queue<Point> queque = new LinkedList<Point>();
    for (int i = 0; i < parameters.length / 2; i++)
    {
      Point point = new Point(Integer.parseInt(parameters[2 * i]), Integer.parseInt(parameters[2 * i + 1]));
      queque.add(point);
    }

    Point boxPoint1 = queque.poll();
    Point boxPoint2 = queque.poll();
    Point startPoint = queque.poll();
    Point endPoint = queque.poll();

    char sweepFlag = '0';
    while (boxPoint1 != null)
    {

      int rx = Math.abs((boxPoint2.getX() - boxPoint1.getX()) / 2);
      int ry = Math.abs((boxPoint2.getY() - boxPoint1.getY()) / 2);
      int cx = (boxPoint2.getX() + boxPoint1.getX()) / 2;
      int cy = (boxPoint2.getY() + boxPoint1.getY()) / 2;
      Point cPoint = new Point(cx, cy);

      double startAngle = DrawingUtil.getAngle(cPoint, startPoint);
      double endAngle = DrawingUtil.getAngle(cPoint, endPoint);
      int start_x = (int) (cx + rx * Math.cos(startAngle));
      int start_y = (int) (cy + ry * Math.sin(startAngle));

      int end_x = (int) (cx + rx * Math.cos(endAngle));
      int end_y = (int) (cy + ry * Math.sin(endAngle));

      buf.append('M').append(' ');
      buf.append(start_x).append(' ');
      buf.append(start_y).append(' ');

      buf.append('A').append(' ');
      buf.append(rx).append(' ');
      buf.append(ry).append(' ');
      buf.append(0).append(' ');
      buf.append(0).append(' ');
      buf.append(sweepFlag).append(' ');
      buf.append(end_x).append(' ');
      buf.append(end_y).append(' ');
      this.prevPoint = endPoint;
      boxPoint1 = queque.poll();
      boxPoint2 = queque.poll();
      startPoint = queque.poll();
      endPoint = queque.poll();
    }
    prevCommand = c;
    return buf.toString();
  }

  private String parseTCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");
    for (int i = 0; i < parameters.length / 6; i++)
    {
      int x = Integer.parseInt(parameters[6 * i]);
      int y = Integer.parseInt(parameters[6 * i + 1]);
      int w = Integer.parseInt(parameters[6 * i + 2]);
      int h = Integer.parseInt(parameters[6 * i + 3]);
      
      double start_angle = Double.parseDouble(parameters[6 * i + 4]);
      if (Math.abs(start_angle) > 360)
        start_angle %= 360;

      // End angle parsing
      double end_angle = Double.parseDouble(parameters[6 * i + 5]);
      if (Math.abs(end_angle) > 360)
      {
        end_angle %= 360;
        if (end_angle == 0 && start_angle == 0)
          end_angle = 360;
      }

      start_angle = start_angle * Math.PI / 180;
      end_angle = end_angle * Math.PI / 180;
      
      double arc = Math.abs(end_angle - start_angle);
      int start_X = (int) (x + w * Math.cos(start_angle));
      int start_Y = (int) (y + h * Math.sin(start_angle));
      buf.append("M ");
      buf.append(start_X);
      buf.append(' ');
      buf.append(start_Y);
      double intermediate_end_angle = 0.0;
      while (arc > 0)
      {

        buf.append("A ");
        buf.append(w);
        buf.append(' ');
        buf.append(h);
        buf.append(" 0 0 0 ");

        if (arc > Math.PI)
          intermediate_end_angle = start_angle + Math.PI;
        buf.append((int) (w * (Math.cos(intermediate_end_angle) - Math.cos(start_angle))));
        buf.append(' ');
        buf.append((int) (h * (Math.sin(intermediate_end_angle) - Math.sin(start_angle))));

        arc = arc - Math.PI;
        start_angle = intermediate_end_angle;
        intermediate_end_angle = end_angle;
      }
    }
    prevCommand = c;
    return buf.toString();
  }

  private String parseUCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");
    for (int i = 0; i < parameters.length / 6; i++)
    {
      int x = Integer.parseInt(parameters[6 * i]);
      int y = Integer.parseInt(parameters[6 * i + 1]);
      int w = Integer.parseInt(parameters[6 * i + 2]);
      int h = Integer.parseInt(parameters[6 * i + 3]);
      double start_angle = Double.parseDouble(parameters[6 * i + 4]);
      if (Math.abs(start_angle) > 360)
        start_angle %= 360;

      // End angle parsing
      double end_angle = Double.parseDouble(parameters[6 * i + 5]);
      if (Math.abs(end_angle) > 360)
      {
        end_angle %= 360;
        if (end_angle == 0 && start_angle == 0)
          end_angle = 360;
      }

      start_angle = start_angle * Math.PI / 180;
      end_angle = end_angle * Math.PI / 180;

      double arc = Math.abs(end_angle - start_angle);
      int start_X = (int) (x + w * Math.cos(start_angle));
      int start_Y = (int) (y + h * Math.sin(start_angle));
      buf.append("M ");
      buf.append(start_X);
      buf.append(' ');
      buf.append(start_Y);
      if (x + w > max_x)
        max_x = x + w;
      if (x - w < min_x)
        min_x = x - w;
      if (y + h > max_y)
        max_y = y + h;
      if (y - h < min_y)
        min_y = y - h;
      double intermediate_end_angle = 0.0;
      while (arc > 0)
      {

        buf.append("A ");
        buf.append(w);
        buf.append(' ');
        buf.append(h);
        buf.append(" 0 0 0 ");

        if (arc > Math.PI)
          intermediate_end_angle = start_angle + Math.PI;
        double end_X = start_X + w * (Math.cos(intermediate_end_angle) - Math.cos(start_angle));
        double end_Y = start_Y + w * (Math.sin(intermediate_end_angle) - Math.sin(start_angle));
        buf.append((int) (end_X)).append(' ');
        buf.append((int) (end_Y)).append(" ");

        arc = arc - Math.PI;
        start_angle = intermediate_end_angle;
        intermediate_end_angle = end_angle;
        start_X = (int) end_X;
        start_Y = (int) end_Y;
      }
    }
    prevCommand = c;
    return buf.toString();
  }

  private String parseVWCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");

    Queue<Point> queque = new LinkedList<Point>();
    for (int i = 0; i < parameters.length / 2; i++)
    {
      Point point = new Point(Integer.parseInt(parameters[2 * i]), Integer.parseInt(parameters[2 * i + 1]));
      queque.add(point);
    }

    Point boxPoint1 = queque.poll();
    Point boxPoint2 = queque.poll();
    Point startPoint = queque.poll();
    Point endPoint = queque.poll();

    char sweepFlag = '1';
    while (boxPoint1 != null)
    {
      int box1_x = boxPoint1.getX();
      int box1_y = boxPoint1.getY();
      int rx = Math.abs((boxPoint2.getX() - box1_x) / 2);
      int ry = Math.abs((boxPoint2.getY() - box1_y) / 2);
      int cx = (boxPoint2.getX() + boxPoint1.getX()) / 2;
      int cy = (boxPoint2.getY() + boxPoint1.getY()) / 2;
      Point cPoint = new Point(cx, cy);

      double startAngle = DrawingUtil.getAngle(cPoint, startPoint);
      double endAngle = DrawingUtil.getAngle(cPoint, endPoint);
      int start_x = startPoint.getX();
      int start_y = startPoint.getY();
      if (startAngle == Math.PI)
      {
        start_x = (int) Math.ceil(cx + rx * Math.cos(startAngle));
        start_y = (int) Math.ceil(cy + ry * Math.sin(startAngle));
      }
      int end_x = endPoint.getX();
      int end_y = endPoint.getY();
      if (endAngle == 0)
      {
        end_x = (int) (cx + rx * Math.cos(endAngle));
        end_y = (int) (cy + ry * Math.sin(endAngle));
      }
      if ((prevSVGCommand != null && prevSVGCommand.charValue() == 'A') || (prevCommand == 'B' || prevCommand == 'L'))
      {
        buf.append('L').append(' ');
        buf.append(start_x).append(' ');
        buf.append(start_y).append(' ');
      }
      else if (prevSVGCommand == null || (prevCommand != 'W' && prevCommand != 'M'))
      {
        buf.append('M').append(' ');
        buf.append(start_x).append(' ');
        buf.append(start_y).append(' ');
      }

      buf.append('A').append(' ');
      buf.append(rx).append(' ');
      buf.append(ry).append(' ');
      buf.append(0).append(' ');
      double realEnd = DrawingUtil.getRealAngle(endAngle);
      double realStart = DrawingUtil.getRealAngle(startAngle);
      double arc = 0.0;
      if ((realEnd > realStart))
        arc = 2 * Math.PI - (realEnd - realStart);
      else
        arc = realEnd - realStart;
      if (Math.abs(arc) > Math.PI)
        buf.append(1).append(' ');
      else
        buf.append(0).append(' ');
      buf.append(sweepFlag).append(' ');
      buf.append(end_x).append(' ');
      buf.append(end_y).append(' ');
      this.prevPoint = endPoint;
      boxPoint1 = queque.poll();
      boxPoint2 = queque.poll();
      startPoint = queque.poll();
      endPoint = queque.poll();
      prevSVGCommand = 'A';
    }
    prevCommand = c;
    return buf.toString();
  }

  private String parseXCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");

    Queue<Point> queue = new LinkedList<Point>();
    for (int i = 0; i < parameters.length / 2; i++)
    {
      Point point = new Point(Integer.parseInt(parameters[2 * i]), Integer.parseInt(parameters[2 * i + 1]));
      queue.add(point);
    }
    char sweepFlag = '1';
    int i = 1;
    while (!queue.isEmpty())
    {
      Point currPoint = (Point) queue.poll();

      int delta_x = currPoint.getX() - prevPoint.getX();
      int delta_y = currPoint.getY() - prevPoint.getY();
      int h = Math.abs(delta_y);
      int w = Math.abs(delta_x);
      boolean clockwise = false;
      if ((delta_x * delta_y > 0 && i % 2 == 1) || (delta_x * delta_y < 0 && i % 2 == 0))
        clockwise = true;
      if (clockwise)
        sweepFlag = '1';
      else
        sweepFlag = '0';
      i++;
      buf.append('A').append(' ');
      buf.append(w).append(' ');
      buf.append(h).append(' ');
      buf.append(0).append(' ');
      buf.append(0).append(' ');
      buf.append(sweepFlag).append(' ');
      buf.append(currPoint);
      prevPoint = currPoint;
    }
    prevCommand = c;
    return buf.toString();
  }

  private String parseYCommand(String command, char c)
  {
    StringBuilder buf = new StringBuilder(16);
    int index = command.indexOf(c);
    String sparameters = command.substring(index + 2);
    String[] parameters = sparameters.split(" ");

    Queue<Point> queue = new LinkedList<Point>();
    for (int i = 0; i < parameters.length / 2; i++)
    {
      Point point = new Point(Integer.parseInt(parameters[2 * i]), Integer.parseInt(parameters[2 * i + 1]));
      queue.add(point);
    }
    char sweepFlag = '1';
    int i = 1;
    while (!queue.isEmpty())
    {
      Point currPoint = (Point) queue.poll();

      int delta_x = currPoint.getX() - prevPoint.getX();
      int delta_y = currPoint.getY() - prevPoint.getY();
      int h = Math.abs(delta_y);
      int w = Math.abs(delta_x);
      boolean clockwise = false;
      if ((delta_x * delta_y < 0 && i % 2 == 1) || (delta_x * delta_y > 0 && i % 2 == 0))
        clockwise = true;

      if (clockwise)
        sweepFlag = '1';
      else
        sweepFlag = '0';
      i++;
      buf.append('A').append(' ');
      buf.append(w).append(' ');
      buf.append(h).append(' ');
      buf.append(0).append(' ');
      buf.append(0).append(' ');
      buf.append(sweepFlag).append(' ');
      buf.append(currPoint);
      prevPoint = currPoint;
    }
    prevCommand = c;
    return buf.toString();
  }
}
