/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.concord_pres");

dojo.registerModulePath("pres", "../presentation/js");

dojo.require("concord.dijit_extra");
dojo.require("concord.main.App");
dojo.require("concord.net.Session");
dojo.require("pres.bootstrap");
dojo.require("concord.main.Settings");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.beans.Participant");
dojo.require("concord.beans.Task");
dojo.require("concord.beans.TaskAction");
dojo.require("concord.beans.TaskService");
dojo.require("concord.util.beta");
dojo.require("concord.i18n.Collation");
dojo.require("concord.i18n.ClassName");	
dojo.require("concord.widgets.SaveDialog");
dojo.require("concord.widgets.PreferencesDialog");
dojo.require("concord.widgets.shareDocument");
dojo.require("concord.widgets.sidebar.SideBar");
dojo.require("concord.widgets.print.presPrintToPdf");
dojo.require("concord.widgets.ProfileTypeAhead");
dojo.require("concord.widgets.EncryptPwdValidatorDlg");
dojo.require("concord.widgets.DraftConflictOptsDlg");
dojo.require("pres.api");

dojo.require("dojox.html.entities");
dojo.require("dijit.Tooltip");
dojo.require("dijit.Dialog");	
dojo.require("dijit.TitlePane");
dojo.require("dijit.MenuBar");
dojo.require("dijit.MenuBarItem");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuSeparator");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.InlineEditBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.TextBox");