/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.util.HashMap;
import java.util.Stack;
import java.util.Set;

import com.ibm.symphony.conversion.service.common.ConversionContext;

/**
 * Class that is used to track properties that change within a hierarchy. It uses
 * a stack to implement the changing properties. Properties created in each level
 * are accessible at each new level. When a new level is pushed on the stack any 
 * properties created on that level override the old property info. When the current
 * level is popped off the stack, the old values are restored.
 *
 */
public class StackableProperties 
{
    public enum Type { CSS, ELEMENT };
    
    /**
     * Convenience routine that will create a new stack level in the context.
     * 
     * @param context
     */
    static public void pushInContext(ConversionContext context)
    {
      if (context == null)
        return;
      
      StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
      
      if (sp != null)
        sp.push();
    }

    /**
     * Convenience routine that will remove a level from the stack.
     * 
     * @param context
     */
    static public void popInContext(ConversionContext context)
    {
      if (context == null)
        return;
      
      StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
      
      if (sp != null)
        sp.pop();
    }
    
    public StackableProperties()
    { 
        stack = new Stack<Properties>();
    }
    
    static public class StringProperty
    {
      /**
       * Create a new string property - this should really only be created by the interal
       * code. Create a property with a value, info (any kind of info for internal purposes),
       * and a type - example, CSS property, element attribute, etc.
       * 
       * @param val
       * @param cstyleName
       * @param ctype
       */
        public StringProperty(String val, String cinfo, Type ctype)
        {
            old = null;
            cur = val;
            type = ctype;
            info = cinfo;
        }
        
        public String getValue()
        {
            return cur;
        }

        public String toString()
        {
            return getValue();
        }

        public Type getType()
        {
            return type;
        }
        
        /**
         * Get some generic implementation dependend information about
         * this particular string property value.
         * @return info
         */
        public String getInfo()
        {
            return info;
        }
        
        StringProperty old;
        String cur;
        String info;
        Type type;
    }
    
    static public class Properties
    {
        public Properties()
        {
            props = new HashMap<String, StringProperty>();
        }
        
        public HashMap<String,StringProperty> getMap()
        {
            return props;
        }
        
        HashMap<String,StringProperty> props;
    }
    
    public void push()
    {
        current = new Properties();
        stack.push(current);
    }
    
    /**
     * Add a property on to the stack. Any old properties are overridden - but
     * properties from the previous stack level are 
     * @param key
     * @param val
     * @param type
     * @param style
     */
    public void addProperty(String key, String val, Type type, String style)
    {
        if (current == null)
        {
            return;
        }
        
        StringProperty sp = current.props.get(key);
        StringProperty spnew = new StringProperty(val, style, type);
        
        // only keep a copy of the old value the first time a value is created
        // on this level. After, overwrite the old value with the new value.
        if (sp == null)
        {
            spnew.old = globalMap.get(key);
        }
        else
        {
            spnew.old = sp.old;
        }
        
        current.props.put(key, spnew);
        globalMap.put(key, spnew);
    }
    
    /**
     * Get the StringProperty from the global stack associated with key. If
     * no such property is found, an empty StringProperty is returned.
     * 
     * @param key
     * @return
     */
    public StringProperty getValue(String key)
    {
      StringProperty rvalue = globalMap.get(key);
      if (rvalue == null)
        rvalue = new StringProperty(null,null,null);

      return rvalue; 
    }
    
    public Properties getCurrent()
    {
        return current;
    }
    
    public void pop()
    {
        if (stack.empty())
            return;
        
        Set<String> keyset = current.props.keySet();
        
        for (String key : keyset)
        {
            StringProperty sp = current.props.get(key);
            globalMap.put(key, sp.old);
        }
        
        stack.pop();
        
        if (!stack.empty())
          current = stack.peek();
        else
          current = null;
    }
    
    Properties current;
    Stack<Properties> stack;
    HashMap<String,StringProperty> globalMap = new HashMap<String,StringProperty>();
}
