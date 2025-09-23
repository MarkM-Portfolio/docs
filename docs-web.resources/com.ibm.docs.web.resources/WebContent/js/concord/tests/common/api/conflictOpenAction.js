// Prepare a out of date draft (dirty and base version is conflict with latest repository version)
// http://localhost:9080/docs/js/concord/tests/jasmine_api_runner.html?testFiles=testpublish.ods&user=user&password=psw&group=concord.tests.common.api.conflictOpenAction

dojo.provide("concord.tests.common.api.conflictOpenAction");

deferreds.initialOpenOutOfDateDraft(false).addCallback(function(defaultDraft) {
	
	var defaultTimeout = 20000; //20s
	
	describe("concord.tests.common.api.conflictOpenAction", function() {
		
		asyncIt("Verify the conflict dialog shown", function() {
			expect(pe.scene.optsDlg).toBeDefined();
		}, defaultTimeout);			
		
		asyncIt("Verify the option selected", function() {	
			pe.scene.optsDlg.onCancel();			
			pe.scene.optsDlg._destroy();			
		}, defaultTimeout);
						
	});	

	// callback _jasmineDeferred() will make jasmine run
	window._jasmineDeferred.callback();
});
