dojo.provide("websheet.tests.ut.model.ut_image_upload_dragdrop");

describe("websheet.tests.ut.widget.ut_image_upload_dragdrop", function()
{
	websheet.Constant.init();
	// mock object, editor
	var editor = {
			getDocumentObj: function () {
				return {
					getAreaManager: function () {
						return {};
					}
				};
			},
			scene: {
				hideErrorMessage: function () {
				},
				showErrorMessage: function () {
				}
			},
			getImageHdl: function () {
				return handler;
			}
	};
	var handler = new websheet.widget.ImageHandler(editor);
	
	// mock
	dojo.setObject("pe.scene.showWarningMessage", function () {
	});
	dojo.setObject("concord.util.uri.getEditAttRootUri", function () {
		return "MockedServerUrlForImageUpload";
	});
	dojo.setObject("pe.scene.isHTMLViewMode", function () {
		return false;
	});
	dojo.setObject("concord.main.App.addCsrfToken", function () {
		return "";
	});
	beforeEach(function() {
		handler.insertImage = function () {
			return;
		};
	});
	
	afterEach(function() {
	});
	
	it("Create Image handler", function() {
		// moke data
		expect(handler).toBeTruthy();
	});
	
	it("Upload image with files", function() {
		// moke data
		//uploadImageWithFiles
		var files = {
		};
		handler.uploadImageWithFiles(files);
	});
	
	it("Upload image with files, safari", function() {
		// moke data
		//uploadImageWithFiles
		var files = {};
		dojo.setObject("dojo.isSafari", true);
		handler.uploadImageWithFiles(files);
	});
	
	//
	it("Upload image base64 string", function() {
		// moke data
		//uploadImageBase64
		var file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAADhAAAAQ4C" +
				"AIAAADdV+B4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAP" +
				"+lSURBVHhe7P3ldxxJtveP9l/xnJk586z76q57f/fMzBmGM4cGG2a6p2GaudvQZmZmZoFRTCWoEqtKzMwsGWTJstCSLLAY7t6xIyMjo0qyZMvdnp7c67NyRUbu2BEZsbNUtr6KfME000wzzTTTTDPNNNNMM80000wzzTTTTHt" +
				"+rG96pm96umd6umtqunNqqn1q+v7UVOvkVMvEZPPEJBxbxifagNHxTmBkrHtkrOvRSPejka6h4a7B4Y7" +
				"+R+0PB+/39rd09zZ1PLjZ2tHQ0t7Y0g7H2jut1bdaqm42AxUNd8sb7pbVN5XU3C6puVNUdbMAqLyZX9mYW9aQW1afXVqfVVKXXVKXWVybXlybVlSTWlidVgTUphbWpBRUpxbgMSW/OrmgCsmrShEUMPJ1UgsYUBA41Ti3UmqerBXg3ErU6G5Sq2SioCoJyNdJLGBAQcBqHPkScPq4GnsBAwqCxa5JEBQwHleTWFQDDaHgKKpOLK5NLq1PKWtIK29Mq7jpTGr5N0NKmQaUCVHzNVBqINmZEiSJIQqPoVgnUaaocW4cMoUSBY12QX5jgpH4PI3cxjiNWCDHQEx2AxEL5HBEpU6WTrRMJhKVWY9kEHVApEJ6rTM2Iq1GYCVSZaqBCCBFULUwkiuJ8NkRPjKKz2OJSHbqmoO3wMA7wjsVk8DmiuaNZhJnOLsxFsjRV42vo7S49oKbrimcH8ZWCUA" +
				"+oGWOMyKX8vRRuQQTzCnHVOgGs1nuOecVppOA5RUipZmAJZtzmvG84tlFuEwtXinSD90UB0o/NesqBUoOzAclzRQUZwWtXz4SK6SWlF22x1BtS0GsyVWcpEogIpHhqCDCJUQlA3xMFkA4Is2nHQ";
		handler.uploadImageBase64(file);
	});
	
	it("Upload image with files, success", function() {
		// moke data
		//uploadImageWithFiles
		var data = "<html><body><textarea>{\"attachments\":[{\"name\":\"Pictures\/1445364740154.GIF\",\"url\":\"Pictures\/1445364740154.GIF\"}]}</textarea></body></html>";
		handler.uploadResponseHalde(data);
	});
});