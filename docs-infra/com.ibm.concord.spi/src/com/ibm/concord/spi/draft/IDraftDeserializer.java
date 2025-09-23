package com.ibm.concord.spi.draft;

import com.ibm.concord.spi.beans.DraftDescriptor;

/**
 * For customized deserializing of a draft media.
 */
public interface IDraftDeserializer
{
  public Object deserialize(DraftDescriptor draftDescriptor) throws Exception;
}
