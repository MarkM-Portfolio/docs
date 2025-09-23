dojo.provide("writer.tests.include");

writer.view = {};

dojo.require("writer.tests.wrapper.editor");

dojo.require("writer.common.Container");
dojo.require("writer.model.Model");
dojo.require("writer.model.update.Block");
dojo.require("writer.common.tools");
dojo.require("writer.model.list");
dojo.require("writer.model.Document");
dojo.require("writer.model.text.AltContent");
dojo.require("writer.model.text.Canvas");
dojo.require("writer.model.text.Run");
dojo.require("writer.model.text.TextRun");
dojo.require("writer.model.text.Image");
dojo.require("writer.model.Hints");
dojo.require("writer.model.text.Link");
dojo.require("writer.model.text.Field");
dojo.require("writer.model.text.BookMark");
dojo.require("writer.model.text.TextBox");
dojo.require("writer.model.Toc");
dojo.require("writer.model.Paragraph");
dojo.require("writer.model.prop.Property");
dojo.require("writer.model.prop.TextProperty");
dojo.require("writer.model.prop.ParagraphProperty");

//dojo.require("writer.tests.Util");

//for message
dojo.require("writer.tests.wrapper.session");
dojo.require("writer.msg.Message");
dojo.require("writer.msg.MessageHandler");


//dojo.require("writer.tests.includeAPI");
//dojo.require("writer.tests.includeUT");

//paraView


dojo.require("writer.view.AbstractView");
dojo.require("writer.view.Document");
dojo.require("writer.view.Page");
dojo.require("writer.view.Body");
dojo.require("writer.view.Run");
dojo.require("writer.view.ImageView");
dojo.require("writer.view.AnchorView.FloatImageView");
dojo.require("writer.view.AnchorView.AnchorTextBox");
dojo.require("writer.view.AnchorView.FLTextBox");
dojo.require("writer.view.Paragraph");
dojo.require("writer.view.update.BlockView");
dojo.require("writer.view.update.BlockContainerView");
dojo.require("writer.view.text.TextArea");
dojo.require("writer.view.SpaceBlock");
dojo.require("writer.view.Line");
dojo.require("writer.view.RunCollection");
dojo.require("writer.view.BookMark");

dojo.require("concord.i18n.LineBreak");
dojo.require("concord.util.BidiUtils");

dojo.require("writer.common.MeasureText");
dojo.require("writer.common.Space");
dojo.require("writer.common.tools");


//dojo.require("writer.view.table.TableBase");
// dojo.require("writer.view.SpaceBlock");







dojo.require("writer.view.update.TableViewUpdate");
dojo.require("writer.view.table.TableView");
dojo.require("writer.view.update.RowViewUpdate");
dojo.require("writer.view.table.RowView");
dojo.require("writer.view.update.CellViewUpdate");
dojo.require("writer.view.table.CellView");


