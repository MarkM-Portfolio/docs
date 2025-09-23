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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/has",
    "dojo/string",
    "dojo/topic",
    "writer/config/config",
    "concord/widgets/InsertImageDlg",
    "dojo/i18n!concord/widgets/nls/InsertImageDlg",
    "writer/plugins/Plugin",
    "writer/constants",
    "writer/model/text/Image",
    "writer/util/RangeTools",
    "writer/util/ViewTools",
    "writer/track/trackChange"
], function(declare, lang, domConstruct, domAttr, on, has, dojoString, topic, config, InsertImageDlg, i18nInsertImage, Plugin, constants, Image, RangeTools, ViewTools, trackChange) {

    var InsertImage = declare("writer.plugins.InsertImage", Plugin, {
        onSelectionChange: function() {
            var viewTools = ViewTools;
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];
            if (!range)
                return;
            var startView = range.getStartView();
            var startViewObj = startView && startView.obj;

            // is in Textbox with non-text horizonal align. or in just words
            var bInNonHorizonalTextbox = false;
            var bInJustwordsTextbox = false;
            if (startViewObj) {
                var textbox = ViewTools.getTextBox(startViewObj);
                if (textbox) {
                    bInNonHorizonalTextbox = !textbox.model.isHorz();
                    bInJustwordsTextbox = textbox.model.isJustWords();
                }
            }

            var toc_plugin = this.editor.getPlugin("Toc");
            var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
            var field_plugin = this.editor.getPlugin("Field");
            var field_disable = field_plugin && field_plugin.ifInField();

            var disable = bInNonHorizonalTextbox || bInJustwordsTextbox || toc_disable || field_disable;
            this.editor.getCommand('insertImage').setState((!disable) ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_DISABLED);
            this.editor.getCommand('uploadimage').setState((!disable) ? constants.CMDSTATE.TRISTATE_OFF : constants.CMDSTATE.TRISTATE_HIDDEN);
        },
        
    	_getFileExtension: function(filename){
    		if (!filename)
    			return "";
    		var pos = filename.lastIndexOf('.');
    		if(pos < 0) return filename;
    		else return filename.substring(pos+1);
    	},
        
    	_isValidImageType: function(value){
    		var ext = this._getFileExtension(value.toLowerCase());
    		var regExp = /^(jpg|jpeg|gif|png|bmp)$/
    		return ext.match(regExp);
    	},
    	
        uploadImageWithFiles: function (files) {
            var nls = i18nInsertImage;
            var self = this;
            
            var unsupported = false;
            var largeFile = false;
            var isValid = function () {
                for (var index = 0, len = files.length; index < len; index++) {
                	var file = files[index];
                    if (file.type.indexOf('image') === -1 || !file.name || !self._isValidImageType(file.name)) {
                        unsupported = true;
                        return false;
                    }
                    if (file.size > g_maxImgSize * 1024) {
                        largeFile = true;
                        return false;
                    }
                }
                return true;
            };
            if (isValid()) {
            } else {
                if (unsupported) {
                    pe.scene.showWarningMessage(nls.invalidImageType, 2000);
                } else if (largeFile) {
                    pe.scene.showErrorMessage(dojoString.substitute(nls.maxSize,[g_maxImgSize]),2000);
                }
                return;
            }
            
            var uploadURL = config.filebrowserImageUploadUrl;
            if (!self._dragDropUploadForm) {
                var form = self._dragDropUploadForm = domConstruct.create('form', {
                    name: "gridDragDropUploadForm",
                    style: {
                        position: "absolute",
                        top: "-1000px",
                        left: "-1000px"
                    }
                }, document.body);
                domAttr.set(form, {"enctype": "multipart/form-data"});
                form.action = uploadURL;
            }
            var uploadFormData = new FormData(self._dragDropUploadForm);
            for (var i = 0, len = files.length; i < len; i++) {
                uploadFormData.append("files", files[i]);
            }
            pe.scene.showWarningMessage(nls.loading);
            
            if (has("safari")) {
                var xhr = new XMLHttpRequest();
                var requestHeader = {headers: {}};
                concord.main.App.addCsrfToken(requestHeader);
                xhr.open('POST', uploadURL, true);
                var headers = requestHeader.headers;
                for(var hdr in headers){
                    if(headers[hdr]){
                        //Only add header if it has a value. This allows for instance, skipping
                        //insertion of X-Requested-With by specifying empty value.
                        xhr.setRequestHeader(hdr, headers[hdr]);
                    }
                }
                xhr.onload = function(ev) {
                // Handling logic omitted
                    var success;
                    if (xhr.status < 300) {
                        try {
                            success = self.uploadResponseHandler(xhr.responseText);
                        } catch (e) {success = false;}
                    }
                    if (!success) {
                        self.uploadRequestError();
                    }
                };
                xhr.onerror = function () {
                    self.uploadRequestError();
                };
                xhr.send(uploadFormData);
                return;
            }
            var dfd = dojo.xhrPost({
                url: uploadURL,
                handleAs: "text",
                contentType: null,
                sync: false,
                postData: uploadFormData
            });
            dfd.addCallback(lang.hitch(this, this.uploadResponseHandler));
            dfd.addErrback(function() {self.uploadRequestError();});
        },
            
        uploadRequestError: function () {
            pe.scene.hideErrorMessage();
            var nls = i18nInsertImage;
            var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 + '<br>' + nls.insertImageErrorP3 ;		        
            pe.scene.showErrorMessage(insertImageErrorMsg,10000);
        },

        uploadResponseHandler: function (data) {
            var nls = i18nInsertImage;
            pe.scene.hideErrorMessage();
            var fileUrlFromServer;
            var errorMessage;
            
            var header = '<html><body><textarea>';
            var tail = '</textarea></body></html>';
            var jsonString = data.slice(data.indexOf(header) + header.length, data.lastIndexOf(tail));
            var json = JSON.parse(jsonString);
            if (json.attachments && json.attachments.length>0) {
                fileUrlFromServer = json.attachments[0].url;
                errorMessage = json.attachments[0].msg;
            }
            if (errorMessage) {
                if(errorMessage == 'insert_image_server_error') {
                    var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
                                            + '<br>' + nls.insertImageErrorP3 ;		        
                    pe.scene.showErrorMessage(insertImageErrorMsg,10000);	
                } else {
                    pe.scene.showErrorMessage(dojoString.substitute(nls.maxSize,[errorMessage]),2000);
                }
                return false;
            }
            if (!fileUrlFromServer ) {
                var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
                                        + '<br>' + nls.insertImageErrorP3 ;		        
                pe.scene.showErrorMessage(insertImageErrorMsg, 10000);
                return false;
            }
            this.editor.execCommand("insertImage", [fileUrlFromServer]);
            return true;
        },
            
        init: function() {
            var lotusEditor = this.editor;

            var local_dialog = {
                _uploadUrl: config.filebrowserImageUploadUrl,
                editor: lotusEditor,
                onshow_hdl: function() {
                    //lockSelection( this.editor, true );
                    //				var input = dojo.byId('C_d_InsertImageInputFile');
                    //				if(dojo.isMac)
                    //				{
                    //					input.setAttribute('size',43);
                    //				}else
                    //					input.setAttribute('size',55);
                },
                onhide_hdl: function() {
                    //lockSelection( this.editor, false );
                },

                _callback: function(url, loadingTimer) {
                    lotusEditor.execCommand("insertImage", [url, loadingTimer]);
                }
            };

            var openInsertImageDlgCommand = {
                exec: function() {
                    //				local_dialog._uploadUrl = writer.config.config.filebrowserImageUploadUrl;
                    InsertImageDlg.show(local_dialog);
                }
            };

            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.onSelectionChange));

            var insertImage = {
                /*
                 * @param args[0]:url
                 * @param args[1]:loadingTimer
                 * @param args[2]:finish callback
                 */
                exec: function(args) {
                    // 1. Create Image Json
                    var url = encodeURI(decodeURI(args[0]));
                    var element = domConstruct.create('img', {
                        'src': url
                    });
                    var selection = pe.lotusEditor.getSelection();
                    if (!selection) {
                        return;
                    }
                    var ranges = selection.getRanges();
                    if (!ranges) {
                        return;
                    }
                    if (!RangeTools.canDo(ranges)) {
                        /*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
                        return;
                    }
                    var onLoad = function(event) {
                        //					if( event )
                        //						event.removeListener();

                        var selection = lotusEditor.getSelection();
                        var range = selection.getRanges()[0];
                        var views = ["page.Body", 'page.Header', 'page.Footer'];
                        var bodyView = ViewTools.getParentViewByType(range._start.obj, views);
                        var bodySize = ViewTools.getSize(bodyView);

                        var width = element.width;
                        var scale = 1.0;
                        if (bodySize.w < element.width) {
                            scale = bodySize.w / element.width;
                            width = bodySize.w;
                        }

                        var width = ((width * 0.75) / 72) * 2.54 + "cm";
                        var height = ((element.height * 0.75 * scale) / 72) * 2.54 + "cm";

                        var imageObj = new Image();
                        imageObj.width = width;
                        imageObj.height = height;
                        imageObj.url = url;
                        imageObj.noChangeAspect = "1";

                        if( trackChange.isOn())
                       		imageObj.ch = [trackChange.createChange("ins")];

                        // 2. Insert to shell
                        var cnt = {};
                        cnt.c = "\u0001";
                        cnt.fmt = [imageObj.toJson()];

                        lotusEditor.getShell().insertInlineObj(cnt);
                        var loadingTimer = args[1];
                        if (loadingTimer != null) {
                            clearTimeout(loadingTimer);
                            loadingTimer = null;
                        }
                        pe.scene.hideErrorMessage();

                        // 3. finish callback
                        var callback = args[2];
                        if (callback != null)
                            callback();
                    };

                    if (element.width && element.height)
                        onLoad(null);
                    else
                        on(element, "load", onLoad);
                }
            };

            /*
             * open insertImage dialogue
             */
            lotusEditor.addCommand("uploadimage", openInsertImageDlgCommand);

            /*
             * @param args[0]:url
             * @param args[1]:loadingTimer
             */
            lotusEditor.addCommand("insertImage", insertImage);
        }
    });
    return InsertImage;
});
