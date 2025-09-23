package com.ibm.concord.platform.draft;

public enum DraftAction {
  /**
   * IMPORT: newDraft
   * RESTORE: Import from repository and restore 
   * REVRESTOR: restore a revision from revision list in Docs
   */
  AUTOSAVE, IMPORT, STORESECTION, PUBLISH, RESTORE, DISCARD, OFFLINE, SYNC, STARTEDIT, RECEIVEMESSAGE, USERJOIN, USERLEAVE, CLOSE, REVRESTORE
}
