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

dojo.provide("concord.customDownload");

dojo.require("lconn.share.bean.File");

dojo.require("concord.global");
dojo.require("concord.customDownloadAction");
dojo.require["lconn.core.config.features"];

(function() {
	// apply your download action, only applies to files, not versions
	lconn.share.config.downloadFile = {
		_isEmpty : function() {
			return 0 == this.file.getSize();
		},

		_isPromptNewDraft : function() {
			this._getUpdateTime();
			var isNewer = this.latestDraftUpdate && this.latestFileUpdate && this.isDirty && this.isSameVersion;
			return isNewer && (concord.global.isEditor(this.file) || concord.global.isOwner(this.file, this.app));
		},

		_getUpdateTime : function() {
			// get publish date
			this.latestFileUpdate = this.file.getUpdated();
			var userID = this.app.getAuthenticatedUserId();
			// get draft save date
			var chkurl = concord.global.getDocDraftURL(this.file);
			var resp, ioArgs;
			concord.global.xhrGet({
				url : chkurl,
				filesUserId : userID,
				handleAs : "json",
				preventCache : true,
				handle : function(r, io) {
					resp = r;
					ioArgs = io;
				},
				sync : true
			});
			if (resp instanceof Error) {
				// do nothing, keep old data.
				return;
			}
			this.latestDraftUpdate = lconn.share.util.misc.date.convertAtomDate(resp.modified);
			this.isDirty = resp.dirty;
			this.isSameVersion = (resp.base_version == this.file.getVersionLabel());
			// fix the clock doesn't syn issue
			if(this.isDirty && (dojo.date.compare(this.latestDraftUpdate, this.latestFileUpdate) < 0)){
				this.latestDraftUpdate = this.latestFileUpdate;
			}			
		},

		doDownload : function() {
			window.open(this.file.getUrlDownload(), "_self");
		},

		isValid : function(file, opt) {
			if (lconn.core.config && lconn.core.config.features && lconn.core.config.features("fileviewer-detailspage")) {
				   return false;
			}
			var isValid = concord.global.isIBMDocFile(file);
			if (isValid && 0 == file.getSize()) { // _isEmpty()
			    isValid = false;	// to trigger custom download in lconn.files.action.DownloadFile
			}
			if(isValid && concord.global.showConcordEntry() && opt && opt.isIcon && opt.a){
				opt.a.title = concord.global.nls.OPEN_THIS_FILE_TIP;
				var imgElement = opt.a.firstChild;
				if(imgElement){
					// add tip message
					imgElement.title = concord.global.nls.OPEN_THIS_FILE_TIP;
					imgElement.alt = concord.global.nls.OPEN_THIS_FILE_TIP;
				}
			}
			return isValid;
		},

		execute : function(file, opt) {
			if (!file) {
				console.log("The file object to download is null");
				return false; // do nothing.
			}
			var self = lconn.share.config.downloadFile;
			self.app = this.app = opt.app || this.app;
			self.file = this.file = file;
			if (concord.global.showConcordEntry() && opt.isIcon && file.declaredClass == "lconn.share.bean.File") {
				var fid = file.getId();
				var wname = concord.global.hashWinNameFromId(fid);
//				window.open(glb_concord_url_wnd_open + "/api/docsvr/lcfiles/" + fid + "/editorview", wname);
				window.open(glb_concord_url_wnd_open + "/app/doc/lcfiles/" + fid + "/editorview/content", wname);				
			} else {
				self.latestFileUpdate = null;
				self.latestDraftUpdate = null;
				self.isDirty = null;
				self.isSameVersion = null;
				if (self._isEmpty()) {
					if (concord.global.isEditor(this.file) || concord.global.isOwner(this.file, this.app)) {
						new concord.customDownloadAction(opt.app, null, {
							hideCancel : true,
							DOWNLOAD_TITLE : concord.global.nls.DOWNLOAD_EMPTY_TITLE,
							OkTitle : concord.global.nls.DOWNLOAD_EMPTY_OK,
							OK : concord.global.nls.DOWNLOAD_EMPTY_OK,
							sentence1 : concord.global.nls.DOWNLOAD_EMPTY_CONTENT1,
							sentence2 : concord.global.nls.DOWNLOAD_EMPTY_CONTENT2
						}).execute(file);
					} else if (concord.global.isReader(this.file)) {
						new concord.customDownloadAction(opt.app, null, {
							hideCancel : true,
							DOWNLOAD_TITLE : concord.global.nls.DOWNLOAD_EMPTYVIEW_TITLE,
							OkTitle : concord.global.nls.DOWNLOAD_EMPTYVIEW_OK,
							OK : concord.global.nls.DOWNLOAD_EMPTYVIEW_OK,
							sentence1 : concord.global.nls.DOWNLOAD_EMPTYVIEW_CONTENT1,
							sentence2 : concord.global.nls.DOWNLOAD_EMPTYVIEW_CONTENT2
						}).execute(file);
					} else {
						// do nothing
					}
				} else if (concord.global.showConcordEntry()) {
					if(self._isPromptNewDraft()){
						var draftStrings = concord.global.nls.DOWNLOAD_NEWDRAFT_CONTENT1;
						var df1 = new lconn.share.util.DateFormat(self.latestDraftUpdate);
						var formated_draft_content = df1.formatByAge(draftStrings);

						var versionStrings = concord.global.nls.DOWNLOAD_NEWDRAFT_CONTENT2;
						var df2 = new lconn.share.util.DateFormat(self.latestFileUpdate);
						var formated_version_content = df2.formatByAge(versionStrings);

						new concord.customDownloadAction(opt.app, null, {
							hideCancel : false,
							DOWNLOAD_TITLE : concord.global.nls.DOWNLOAD_NEWDRAFT_TITLE,
							OkTitle : concord.global.nls.DOWNLOAD_NEWDRAFT_OK,
							OK : concord.global.nls.DOWNLOAD_NEWDRAFT_OK,
							sentence1 : formated_draft_content,
							sentence2 : formated_version_content
						    }).execute(file, {
						       windowOpenCommand : self.doDownload
					    });
				   } else {
					   self.doDownload();
				   }
			   } else {
				   var versionStrings = concord.global.nls.DOWNLOAD_NEWDRAFT_CONTENT2;
				   var df2 = new lconn.share.util.DateFormat(this.file.getUpdated());
				   var formated_version_content = df2.formatByAge(versionStrings);
				   new concord.customDownloadAction(opt.app, null, {
						hideCancel : false,
						DOWNLOAD_TITLE : concord.global.nls.DOWNLOAD_NEWDRAFT_TITLE,
						OkTitle : concord.global.nls.DOWNLOAD_NEWDRAFT_OK,
						OK : concord.global.nls.DOWNLOAD_NEWDRAFT_OK,
						sentence1 : concord.global.nls.DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT,
						sentence2 : formated_version_content
					    }).execute(file, {
					       windowOpenCommand : self.doDownload
				   });
			   }
			}
		}
	// optional below
	/*
	 * getName: function(file, opt){ return "Download"; }, getTooltip:
	 * function(file, opt){ return "Download this file"; }
	 */
	}
})();
