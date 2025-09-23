package com.ibm.symphony.conversion.service.common.util;

public class EncodingUtil
{
  private static final byte BASE64_MAP[] = { 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
    0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
    0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36,
    0x37, 0x38, 0x39, 0x2b, 0x2f, };
  
  public static String BASE64Encode(String src)
  {
    char[] srcChars = src.toCharArray();
    short[] srcBytes = new short[srcChars.length * 2];
    int index = 0;

    // First, break the 2 byte chars into single bytes.
    for (int i = 0; i < srcChars.length; i++)
    {
      srcBytes[index++] = (short) (srcChars[i] >> 8);
      srcBytes[index++] = (short) (srcChars[i] & 0xff);
    }

    // Determine the size of the output string.
    int newLength = srcBytes.length * 4 / 3;
    if (newLength % 4 != 0)
      newLength = (1 + (newLength / 4)) * 4;

    char[] destChars = new char[newLength];
    index = 0;
    int i = 0;

    // Encode the bytes 3 at a time, by shifting them to unique positions within an int and calling encode().
    for (; i + 2 < srcBytes.length; i += 3, index += 4)
      encode((int) srcBytes[i] << 16 | (int) srcBytes[i + 1] << 8 | (int) srcBytes[i + 2], destChars, index);

    // Handle any bytes left over, that didn't hit on a 3 byte boundary.
    switch (srcBytes.length % 3)
      {
        case 1 :
        {
          encode((int) srcBytes[i] << 16, destChars, index);
          index += 2;
          destChars[index++] = 0x3d; // '=' character
          destChars[index++] = 0x3d; // '=' character
          break;
        }
        case 2 :
        {
          encode((int) srcBytes[i] << 16 | (int) srcBytes[i + 1] << 8, destChars, index);
          index += 3;
          destChars[index++] = 0x3d; // '=' character
          break;
        }
      }

    return new String(destChars);
  }

  private static void encode(int val, char[] dest, int index)
  {
    dest[index] = (char) BASE64_MAP[(val & 0xfc0000) >> 18];
    dest[index + 1] = (char) BASE64_MAP[(val & 0x3f000) >> 12];
    dest[index + 2] = (char) BASE64_MAP[(val & 0xfc0) >> 6];
    dest[index + 3] = (char) BASE64_MAP[(val & 0x3f)];
  }
}
