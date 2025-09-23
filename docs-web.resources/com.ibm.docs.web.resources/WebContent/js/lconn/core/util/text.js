/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2009, 2013                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("lconn.core.util.text");
dojo.require("dojo.number");

lconn.core.util.text = {
   CODE_MAP: [
      [0x0080, 1],  // 0x0000 - 0x0080, 1 byte
      [0x0800, 2],  // 0x0080 - 0x0800, 2 bytes
      [0xD800, 3],  // 0x0800 - 0xD800, 3 bytes
      [0xDC00, 4, 0xDC00, 0xDFFF, 2]   // 0xD800 - 0xDC00, 2 bytes, should be followed by a character within 0xDC00, 0xDFFF, another 2 bytes, so 4 bytes
   ],
   /** 
    * This will trim a string @str to a string returnValue whose byte length is not greater than @length, and return this returnValue
    */
   trimToByteLength: function(str, length){
      var ellipsis = "...";
      length = length - ellipsis.length;
      var codeMap = lconn.core.util.text.CODE_MAP;
      if(length<=0)
         return "";
      var i = 0, lastValid = 0, len = str.length;
      var realLen = 0;
      while(i<len){
         if(realLen>=length)
            return str.substring(0, lastValid) + ellipsis;
         var code = str.charCodeAt(i);
         if(code<codeMap[0][0]){
            realLen += codeMap[0][1];
         }else if(code < codeMap[1][0]){
            realLen += codeMap[1][1];
         }else if(code<codeMap[2][0]){
            realLen += codeMap[2][1];
         }else{
            if(i<codeMap[3][0]){
               if(i+1<len){
                  var b = str.charCodeAt(i+1);
                  if(b>=codeMap[3][2] && b<=codeMap[3][3]){
                     realLen+=codeMap[3][1];
                     i++;
                  }else{
                     realLen+=codeMap[3][4]; //invalid character
                  }
               }else{
                  //last character is invalid
                  realLen+=codeMap[3][4];
               }
            }
         }
         i++;
         
         if(realLen==length)
            return str.substring(0, i) + ellipsis;
         else if(realLen>length)
            return str.substring(0, lastValid) + ellipsis;
         lastValid = i;
         
      }
      return str;
   },
   /** 
    * This will return the byte length of a string @str
    */
   getByteLength: function(str){
      var codeMap = lconn.core.util.text.CODE_MAP;
      var i = 0, len = str.length;
      var realLen = 0;
      while(i<len){
         var code = str.charCodeAt(i);
         if(code<codeMap[0][0]){
            realLen += codeMap[0][1];
         }else if(code < codeMap[1][0]){
            realLen += codeMap[1][1];
         }else if(code<codeMap[2][0]){
            realLen += codeMap[2][1];
         }else{
            if(i<codeMap[3][0]){
               if(i+1<len){
                  var b = str.charCodeAt(i+1);
                  if(b>=codeMap[3][2] && b<=codeMap[3][3]){
                     realLen+=codeMap[3][1];
                     i++;
                  }else{
                     realLen+=codeMap[3][4]; //invalid character
                  }
               }else{
                  //last character is invalid
                  realLen+=codeMap[3][4];
               }
            }
         }
         i++;
      }
      return realLen;
   },


   possessive: function(s) {
      if(s && s[s.length-1] != 's')
         s += "'s";
      else
         s += "'";
      return s;
   },
   getExtension: function(s) {
      if (!s) return "";
      var i = s.lastIndexOf(".");
      if (i != -1)
         return s.substring(i+1).toLowerCase();
      return "";
   },
   trimExtension: function(s) {
      if (!s) return "";
      var i = s.lastIndexOf(".");
      if (i != -1)
         return s.substring(0,i);
      return s;
   },
   getFilename: function(s) {
      if (!s) return "";
      var i = s.lastIndexOf("\\");
      var j = s.lastIndexOf("/");
      if (i == j)
         return s;
      i = Math.max(i,j);
      return s.substring(i+1);
   },
   trimToLength: function(s, length, wordLength) {
      if (!s) return "";
      s = lconn.core.util.text.trimEnd(s);
      var ellipsis = "...";
      if (wordLength > 0) {
         var words = s.split(/[\s\u3000]/);
         for (var i=0; i<words.length; i++)
            if (words[i].length > wordLength) {
               var l = s.indexOf(words[i]) + wordLength;
               if (l > length)
                  break;
               return lconn.core.util.text.trimEnd(s.substring(0, l-ellipsis.length)) + ellipsis;
            }
      }
      if (s.length > length)
         s = lconn.core.util.text.trimEnd(s.substring(0, length-ellipsis.length)) + ellipsis;
      return s;
   
   },
   
   trim: function( s ) {
      if (!s) return "";
      var e = /^[\s\u3000]*(.*?)[\s\u3000]*$/.exec(s+"");
      return e ? e[1] : s;
   },
   trimEnd: function( s ) {
      if (!s) return "";
      s += "";
      s = /^(.*?)[\s\u3000]*$/.exec(s)[1];
      return s;
   },   
   parseInt: function(s,def) {
      if (typeof def == "undefined")
         def = 0;
      if (!s)
         return def;
      var a = parseInt(s);
      return isNaN(a) ? def : a;
   },
   parseFloat: function(s,def) {
      if (typeof def == "undefined")
         def = 0;
      if (!s)
         return def;
      var a = parseFloat(s);
      return isNaN(a) ? def : a;
   },
   formatSize: function() {
      var nls, size;
      if (arguments.length == 2) {
         nls = arguments[0];
         size = arguments[1];
      }
      else
         size = arguments[0];
      if (typeof size == "undefined" || size == null || typeof size == "string")
         return size;
      var nls = nls || lconn.core.util.text._SIZE;
      if (!nls)
         throw "Must pass nls to formatSize or set the lconn.share.util.text._SIZE property during init";
      
      if (size > 10*1024*1024*1024)
         return dojo.string.substitute(nls.GB, [dojo.number.format(Math.floor(size*10/(1024*1024*1024))/10)]);
      else if (size >= 1*1024*1024*1024)
         return dojo.string.substitute(nls.GB, [dojo.number.format(Math.floor(size*100/(1024*1024*1024))/100)]);
      else if (size > 100*1024*1024)
         return dojo.string.substitute(nls.MB, [dojo.number.format(Math.floor(size/(1024*1024)))]);
      else if (size > 10*1024*1024)
         return dojo.string.substitute(nls.MB, [dojo.number.format(Math.floor(size*10/(1024*1024))/10)]);
      else if (size >= 1*1024*1024)
         return dojo.string.substitute(nls.MB, [dojo.number.format(Math.floor(size*100/(1024*1024))/100)]);
      else if (size > 1*1024)
         return dojo.string.substitute(nls.KB, [dojo.number.format(Math.floor(size/1024))]);
      return dojo.string.substitute(nls.KB, [dojo.number.format(size > 0 ? 1 : 0)]);
   },
   
   /**
    * Return the length of string, the javascript self-contained attribute "string.length" seems have bug on some special UTF-8 characters
    */
   length: function(s) {
		var ret = 0;
		
		var t = encodeURIComponent(s);
		var idx1 = 0, idx2 = 0;
		while(true) {
			idx2 = t.indexOf('%', idx1);
			if(idx2 == -1) {
				ret += (t.length - idx1);
				break;
			} else {
				ret += (idx2 - idx1);
				
				var topByte = parseInt(t.substr(idx2 + 1, 2), 16);
				if(topByte < 0xC0) {
					ret += 1;
					idx1 = idx2 + 3;
				} else if(topByte >= 0xC0 && topByte < 0xE0) {
					ret += 1;
					idx1 = idx2 + 6;
				} else if(topByte >= 0xE0 && topByte < 0xF0) {
					ret += 1;
					idx1 = idx2 + 9;
				} else if(topByte >= 0xF0 && topByte < 0xF8) {
					ret += 1;
					idx1 = idx2 + 12;
				} else if(topByte >= 0xF8 && topByte < 0xFC) {
					ret += 1;
					idx1 = idx2 + 15;
				} else if(topByte >= 0xFC) {
					ret += 1;
					idx1 = idx2 + 18;
				}
			}
		}
		
		return ret;
   },
   
   /**
    * Return the length of this string if it were converted to UTF-8
    */
   lengthUtf8: function(s) {
      var bytes = 0;
      var length = s.length;
      for (var i=0; i<length; i++) {
         var c = s.charCodeAt(i);
         if (c <= 127)
            bytes++;
         else if (c <= 2047)
            bytes += 2;
         else if (c <= 65535) {
            bytes += 3;
            // surrogate pairs in a character input stream are between D800 and DFFF - 
            // they must be treated as 4 bytes in a UTF-8 stream
            if ((c >> 11) == 27) {
               bytes++;
               i++;
            }
         }
         else
            bytes += 4;
      }
      return bytes;
   },
   
   /** 
    * Return the first index in the string that exceeds the maximum number of UTF-8 bytes 
    * into the string.  Used to trim a string to below a certain length in UTF-8 bytes.
    * 
    * For instance, the string below:
    * 
    *   Bytes:
    *   |--| |-------| |-----------------| |--|
    *   0x30 0xC2 0x80 0xF0 0x90 0x80 0x80 0x32
    * 
    * would return
    * 
    *        max   result 
    *         0     0     
    *         1     1     The first character is one byte, so the index 1 is the end of the string
    *         2     1     The second byte is halfway through the second character, so we cannot include it 
    *         3     3     
    *         4     3
    *         5     3
    *         6     3     
    *         7     4     
    *         8    -1     All characters in the string are included 
    */
   getCharIndexForUtf8Index: function(s, max) {
      var bytes = 0;
      var length = s.length;
      for (var i=0; i<length; i++) {
         var c = s.charCodeAt(i);
         if (c <= 127)
            bytes++;
         else if (c <= 2047)
            bytes += 2;
         else if (c <= 65535) {
            bytes += 3;
            // surrogate pairs in a character input stream are between D800 and DFFF - 
            // they must be treated as 4 bytes in a UTF-8 stream
            if ((c >> 11) == 27) {
               bytes++;
               i++;
            }
         }
         else
            bytes += 4;
         if (bytes > max)
            return i;
      }
      return -1;
   },
   encodeHeaderUtf8: function(s) {
      return "=?UTF-8?Q?"+encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, "=$1")+"?=";   
   },
   
   /**
    * Extracts a unique list of strings from the input list
    * @param slist [list : String] A list of strings
    * @return [list: String] The unique strings 
    */
   uniquifyStringList: function(slist) {
   	var sset = {},
   	    sResList = [];
	   
	   if (slist && slist.length > 0) {
		   // skip empty attray 
		   for (var s in slist)
			   sset[s] = 1;
		   
		   // get keys
		   for (var s in sset)
			   sResList.push(s);
	   }
	   
	   return sResList;
   }
};
