package com.ibm.docs.common.util;

import java.util.Stack;
import java.util.HashMap;

class Node
{
  private int frequency;

  private boolean isLeaf;

  private Node left;

  private Node right;

  private Integer value;

  public int getFrequency()
  {
    if (!isLeaf && frequency == -1)
      frequency = left.getFrequency() + right.getFrequency();

    return frequency;
  }

  public Integer getValue()
  {
    return value;
  }

  public Node getLeft()
  {
    return left;
  }

  public Node getRight()
  {
    return right;
  }

  public Node(int v, int f)
  {
    frequency = f;
    value = v;
    left = null;
    right = null;
    isLeaf = true;
  }

  public Node(Node L, Node R)
  {
    value = 0x000;
    frequency = -1;
    left = L;
    right = R;
    isLeaf = false;
  }

  public void generateEncodeMap(String path, HashMap<Integer, String> map)
  {
    if (isLeaf)
    {
      map.put(value, path);
    }
    else
    {
      left.generateEncodeMap(path + '0', map);
      right.generateEncodeMap(path + '1', map);
    }
  }

  public void generateDecodeMap(String path, HashMap<String, Integer> map)
  {
    if (isLeaf)
    {
      map.put(path, value);
    }
    else
    {
      left.generateDecodeMap(path + '0', map);
      right.generateDecodeMap(path + '1', map);
    }
  }
}

public class HuffmanTree
{
  private static int[][] array = {
      // {0x7F,0},
      // {0x00,0},
      // {0x01,0},
      // {0x02,0},
      // {0x03,0},
      // {0x04,0},
      // {0x05,0},
      // {0x06,0},
      // {0x07,0},
      // {0x08,0},
      // {0x0B,0},
      // {0x0C,0},
      // {0x0E,0},
      // {0x0F,0},
      // {0x10,0},
      // {0x11,0},
      // {0x12,0},
      // {0x13,0},
      // {0x14,0},
      // {0x15,0},
      // {0x16,0},
      // {0x17,0},
      // {0x18,0},
      // {0x19,0},
      // {0x1A,0},
      // {0x1B,0},
      // {0x1C,0},
      // {0x1D,0},
      // {0x1E,0},
      // {0x1F,0},
      { 0x20, 1 },
      { 0x3E, 2 },
      { 0x28, 4 },
      { 0x3C, 4 },
      // {0x7D,10000},
      { 0x7B, 7 },
      { 0x5B, 10 },
      { 0x5D, 10 },
      // {0x60,12},
      { 0x29, 12 }, { 0x5C, 12 }, { 0x26, 13 }, { 0x3A, 14 }, { 0x3D, 14 }, { 0x7E, 15 }, { 0x25, 17 }, { 0x3B, 20 }, { 0x3F, 20 },
      { 0x2B, 23 }, { 0x2F, 31 }, { 0x23, 85 }, { 0x5F, 123 }, { 0x58, 142 }, { 0x51, 147 }, { 0x5A, 170 }, { 0x56, 236 }, { 0x40, 239 },
      { 0x2A, 242 }, { 0x59, 255 }, { 0x21, 307 }, { 0x57, 320 }, { 0x55, 350 }, { 0x4A, 363 }, { 0x46, 417 }, { 0x4B, 461 },
      { 0x47, 497 }, { 0x48, 544 }, { 0x43, 661 }, { 0x44, 698 }, { 0x49, 709 }, { 0x4F, 729 }, { 0x50, 737 }, { 0x4E, 748 },
      { 0x4C, 776 }, { 0x4D, 782 }, { 0x54, 801 }, { 0x42, 807 }, { 0x52, 848 },
      { 0x45, 970 },
      { 0x53, 1081 },
      { 0x41, 1305 },
      { 0x71, 3461 },
      { 0x78, 5733 },
      { 0x7A, 6326 },
      { 0x76, 8336 },
      { 0x6A, 8367 },
      // {0x7D,10000},
      // {0x7B,10000},
      { 0x77, 12449 }, { 0x66, 12476 }, { 0x79, 15248 }, { 0x37, 16210 }, { 0x38, 16626 }, { 0x36, 17565 }, { 0x39, 17956 },
      { 0x67, 18533 }, { 0x35, 18858 }, { 0x34, 19427 }, { 0x6B, 19683 }, { 0x2E, 20000 }, { 0x75, 21019 }, { 0x62, 22915 },
      { 0x68, 24132 }, { 0x33, 24334 }, { 0x70, 24558 }, { 0x63, 25728 }, { 0x30, 27438 }, { 0x64, 27640 },
      { 0x6D, 29991 },
      { 0x32, 31231 },
      { 0x6C, 37772 },
      { 0x74, 38739 },
      // {0x0A,40000},
      // {0x09,40000},
      // {0x0D,40000},
      // {0x2C,40000},
      { 0x31, 43505 }, { 0x6E, 45690 }, { 0x73, 46107 }, { 0x69, 46973 }, { 0x72, 49603 }, { 0x6F, 51700 }, { 0x65, 70925 },
      { 0x61, 75277 }, { 0x27, 100000 }, { 0x22, 100000 }, { 0x7C, 150000 }, { 0x2D, 150000 },
      // {0x24,200000},
      { 0x5E, 200000 },
  // {0x3A,200000}
  };

  private Stack<Node> nodes = new Stack<Node>();

  private Node root = null;

  private HashMap<Integer, String> EncodeMap = null;

  private HashMap<String, Integer> DecodeMap = null;

  static private HuffmanTree singleton = null;

  private HuffmanTree()
  {

    for (int i = array.length - 1; i >= 0; i--)
    {
      nodes.push(new Node(array[i][0], array[i][1]));
    }
    // System.out.println(nodes.size());
    while (nodes.size() >= 2)
    {
      Node sub = new Node(nodes.pop(), nodes.pop());
      if (nodes.size() == 0)
      {
        nodes.push(sub);
        break;
      }
      for (int j = nodes.size() - 1; j >= 0; j--)
      {
        if (nodes.get(j).getFrequency() > sub.getFrequency())
        {
          nodes.insertElementAt(sub, j + 1);
          break;
        }
        else if (j == 0)
          nodes.insertElementAt(sub, 0);
      }
    }
    // System.out.println(nodes.size());
    root = nodes.size() > 0 ? nodes.pop() : null;
  }

  static public HashMap<Integer, String> getEncodeMap()
  {
    if (singleton == null)
      singleton = new HuffmanTree();
    // System.out.println("huffmantree.getEncodeMap");
    // System.out.println(root);
    if (singleton.EncodeMap == null && singleton.root != null)
    {
      // System.out.println("huffmantree.getEncodeMap");
      singleton.EncodeMap = new HashMap<Integer, String>();
      singleton.root.generateEncodeMap("", singleton.EncodeMap);

      // System.out.println(EncodeMap);
    }
    return singleton.EncodeMap;
  }

  static public HashMap<String, Integer> getDecodeMap()
  {
    if (singleton == null)
      singleton = new HuffmanTree();
    if (singleton.DecodeMap == null && singleton.root != null)
    {
      singleton.DecodeMap = new HashMap<String, Integer>();
      singleton.root.generateDecodeMap("", singleton.DecodeMap);
    }
    return singleton.DecodeMap;
  }
}
