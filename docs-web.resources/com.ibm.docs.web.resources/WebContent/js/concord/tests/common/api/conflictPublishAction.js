// Prepare a out of date draft (dirty and base version is conflict with latest repository version)
// http://localhost:9080/docs/js/concord/tests/jasmine_api_runner.html?testFiles=testpublish.ods&user=user&password=psw&group=concord.tests.common.api.conflictPublishAction

dojo.provide("concord.tests.common.api.conflictPublishAction");

deferreds.initialOpenOutOfDateDraft(true).addCallback(function() {
	
	var defaultTimeout = 20000; //20s
	
	describe("concord.tests.common.api.conflictPublishAction", function() {		
		
		asyncIt("Show Publish Dialog", function() {
			pe.scene.editor.showPublishDialog();
		}, defaultTimeout);
		
		asyncIt("Verify the draft response 'isvalid' field", function() {			
			var resp = pe.scene.editor.publishDlg.getDraftStatus();			
			expect(resp).toBeDefined();
			//expect(resp).toBeUndefined();
			expect(resp.valid).toBeFalsy();	
			//expect(resp.valid).toBeTruthy();
		}, defaultTimeout);	
		
		asyncIt("Verify the conflict area existing", function() {
			var container = dojo.byId(pe.scene.editor.publishDlg.conflictAreaDiv);
			expect(container).toBeDefined();	
			//expect(container).toBeUndefined();
		}, defaultTimeout);			
				
		asyncIt("Verify the conflict area shown", function() {
			var container = dojo.byId(pe.scene.editor.publishDlg.conflictAreaDiv);
			expect(container.style.display).toNotEqual('none');	
			//expect(container.style.display).toEqual('none');
		}, defaultTimeout);
		
		asyncIt("TODO: Verify the publish action", function() {
//			var container = dojo.byId(pe.scene.editor.publishDlg.conflictAreaDiv);
//			expect(container.style.display).toNotEqual('none');	
//			//expect(container.style.display).toEqual('none');
		}, defaultTimeout);		
		
		asyncIt("Hide Publish Dialog", function() {
			pe.scene.editor.publishDlg.onCancel();
			pe.scene.editor.publishDlg._destroy();			
		}, defaultTimeout);		
						
	});	

	// callback _jasmineDeferred() will make jasmine run
	window._jasmineDeferred.callback();
});
