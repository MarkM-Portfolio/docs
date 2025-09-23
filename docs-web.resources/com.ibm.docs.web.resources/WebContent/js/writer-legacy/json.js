dojo.provide("writer.json");

dojo.require("writer.config.config");

dojo.require("writer.controller.Editor");
dojo.require("writer.controller.LayoutEngine");
dojo.require("writer.common.MeasureText");

dojo.require("writer.common.Container");
dojo.require("writer.common.SubContainer");
dojo.require("writer.common.Space");
dojo.require("writer.common.tools");

dojo.require("writer.model.Model");
dojo.require("writer.model.Hints");
dojo.require("writer.model.Document");
dojo.require("writer.model.Paragraph");
dojo.require("writer.model.style.Style");
dojo.require("writer.model.list");
dojo.require("writer.model.table.Table");
dojo.require("writer.model.Toc");

dojo.require("writer.model.text.Run");
dojo.require("writer.model.text.Hint");
dojo.require("writer.model.text.TextRun");
dojo.require("writer.model.text.Image");
dojo.require("writer.model.text.TextBox");
dojo.require("writer.model.text.Canvas");
dojo.require("writer.model.text.Link");
dojo.require("writer.model.text.Field");
dojo.require("writer.model.text.RFootNote");
dojo.require("writer.model.text.REndNote");
dojo.require("writer.model.text.PageNumberRun");
dojo.require("writer.model.text.BookMark");
dojo.require("writer.model.text.AltContent");

dojo.require("writer.model.prop.Property");
dojo.require("writer.model.prop.LinkProperty");
dojo.require("writer.model.prop.ParagraphProperty");
dojo.require("writer.model.prop.TabProperty");
dojo.require("writer.model.prop.TextProperty");
dojo.require("writer.model.TableTempleStyles");
dojo.require("writer.model.Factory");

dojo.require("writer.view.AbstractView");
dojo.require("writer.view.Document");
dojo.require("writer.view.text.TextArea");
dojo.require("writer.view.Line");
dojo.require("writer.view.Page");
dojo.require("writer.view.update.TableViewUpdate");
dojo.require("writer.view.table.TableView");
dojo.require("writer.view.update.RowViewUpdate");
dojo.require("writer.view.table.RowView");
dojo.require("writer.view.update.tools");
dojo.require("writer.view.update.CellViewUpdate");
dojo.require("writer.view.table.CellView");
dojo.require("writer.view.Paragraph");
dojo.require("writer.view.TocView");
dojo.require("writer.view.Run");
dojo.require("writer.view.RunCollection");
dojo.require("writer.view.notes.FootNoteView");
dojo.require("writer.view.notes.EndNoteView");
dojo.require("writer.view.text.RFootNoteView");
dojo.require("writer.view.text.REndNoteView");
dojo.require("writer.view.Tab");
dojo.require("writer.view.Alignment");
dojo.require("writer.view.Break");
dojo.require("writer.view.PageNumber");
dojo.require("writer.view.BookMark");

dojo.require("writer.view.ImageView");
dojo.require("writer.view.AnchorView.FloatImageView");
dojo.require("writer.view.AnchorView.SquareImageView");
dojo.require("writer.view.AnchorView.TBImageView");
dojo.require("writer.view.AnchorView.SimpleImageView");

dojo.require("writer.view.AbstractCanvas");
dojo.require("writer.view.InLineCanvas");
dojo.require("writer.view.AnchorView.AnchorCanvas");
dojo.require("writer.view.AnchorView.FLCanvas");
dojo.require("writer.view.AnchorView.SQCanvas");
dojo.require("writer.view.AnchorView.TBCanvas");
dojo.require("writer.view.AnchorView.SimpleCanvas");

dojo.require("writer.msg.Message");
dojo.require("writer.msg.MessageHelper");
dojo.require("writer.msg.MessageHandler");
dojo.require("writer.view.InLineTextBox");
dojo.require("writer.view.AnchorView.TBTextBox");
dojo.require("writer.view.AnchorView.FLTextBox");
dojo.require("writer.view.AnchorView.SQTextBox");
dojo.require("writer.view.AnchorView.SimpleTextBox");

dojo.require("writer.ui.widget.PageInfo");