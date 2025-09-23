/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("html.htmlview");

dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ToggleButton");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dojo.cookie");
dojo.require("dojox.html.metrics");          
dojo.require("dojo.string");
dojo.require("dojo.number");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojo.i18n");

dojo.require("dijit.ToolbarSeparator");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.CheckedMenuItem");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit._base.window");
dojo.require("dijit._base.wai");
dojo.require("dijit.typematic");
dojo.require("dijit._base.typematic");
dojo.require("dijit._base");
dojo.require("dijit._base.sniff");
dojo.require("dijit._base.scroll");
dojo.require("dijit._base.popup");
dojo.require("dijit._base.place");
dojo.require("dijit._base.focus");
dojo.require("dijit._base.place");
dojo.require("dijit.WidgetSet");
dojo.require("dojo.selector.acme");

dojo.require("html.main.App");
dojo.require("html.scenes.AbstractScene");
dojo.require("html.scenes.PresDocScene");
dojo.require("html.scenes.TextDocScene");
dojo.require("html.widgets.SlideSorter");
dojo.require("html.widgets.SlideShow");
dojo.require("html.widgets.PagePicker");
dojo.require("html.widgets.LoadingPage");
dojo.require("html.widgets.Zoomer");

dojo.require("viewer.scenes.ErrorScene");
dojo.require("viewer.util.browser");
dojo.require("viewer.util.Events");
dojo.require("viewer.util.uri");
dojo.require("viewer.util.BidiUtils");
dojo.require("viewer.widgets.viewerDialog");
dojo.require("viewer.widgets.CommonDialog");
dojo.require("viewer.widgets.MessageBox");
dojo.require("viewer.widgets.ConfirmBox");
dojo.require("viewer.widgets.FloatBox");
dojo.require("viewer.widgets.ViewerMessage");
dojo.require("viewer.widgets.LotusTextButton");

dojo.require("viewer.beans.PageInfo");
dojo.require("viewer.beans.Event");
dojo.require("viewer.beans.Document");
dojo.require("viewer.beans.ImageInfo");
dojo.require("viewer.widgets.ViewerToolbar");

dojo.requireLocalization("viewer.scenes", "Scene");
dojo.requireLocalization("viewer.widgets", "PagePicker");
dojo.requireLocalization("viewer.widgets", "Zoomer");
dojo.requireLocalization("viewer.widgets","SlideShow");
dojo.requireLocalization("viewer.widgets", "ViewerMessage");

