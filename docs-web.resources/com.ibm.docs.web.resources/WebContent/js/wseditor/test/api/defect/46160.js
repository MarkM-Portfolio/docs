sample(null);

describe('defect with function Value', function() {
	it.asyncly('fills function value', function() {
		return actBy().step(function() {
			actions.focus('A1').editCell('=VALUE(IF(TRUE,3,5))');
		}).step(function(s) {
			expect.ui().cell('A1').value(3);
			s.step();
		}).end();
	});
});