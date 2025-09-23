define([
	"writer/constants",
	"writer/controller/IndicatorManager"
], function (constants, IndicatorManager) {

	describe("writer.test.ut.indicator.manager", function() {
	
		it("indicator manager", function() {
	
			var mgr = new IndicatorManager();
			var user1 = {
				id : "1",
				getId : function() {
					return "1"
				}
			};
			var range = {
				startParaId : "id_001",
				endParaId : "id_001",
				startParaIndex : 1,
				endParaIndex : 2
			}
	
			mgr.updateUserSelections("1", constants.MSGCATEGORY.Content,
					true, [ range ])
			var orphan = mgr.userSelections["1"].orphan;
			expect(orphan).toEqual(true)
			mgr.updateUserSelections("1", constants.Content, false,
					[ range ]);
			var orphan = mgr.userSelections["1"].orphan;
			expect(orphan).toEqual(false);
	
			mgr.drawUserSelectionsDelayed();
			mgr.drawUserSelections();
	
			mgr.clearUserSelections();
			expect(mgr.userSelections.length).toEqual(0);
			mgr.drawUserSelections();
		});
	
	});

});