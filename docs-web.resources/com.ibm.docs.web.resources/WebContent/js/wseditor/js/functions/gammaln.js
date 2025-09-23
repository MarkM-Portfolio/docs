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

dojo.provide("websheet.functions.gammaln");

dojo.declare("websheet.functions.gammaln", websheet.functions.FormulaBase, {

	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	_gammaln: function(x){
		if(x == 1 || x == 2)
			return 0;
		
		var p = [0.99999999999999709182,
		         57.156235665862923517,
		         -59.597960355475491248,
		         14.136097974741747174,
		         -0.49191381609762019978,
		         0.33994649984811888699e-4,
		         0.46523628927048575665e-4,
		         -0.98374475304879564677e-4,
		         0.15808870322491248884e-3,
		         -0.21026444172410488319e-3,
		         0.21743961811521264320e-3,
		         -0.16431810653676389022e-3,
		         0.84418223983852743293e-4,
		         -0.26190838401581408670e-4,
		         0.36899182659531622704e-5];
		var g = 607/128;
		var a = p[0];
	    for(var i = p.length - 1; i > 0; --i) a += p[i] / (x + i);
	    var t = x + g + 0.5;
	    return .5*Math.log(2*Math.PI)+(x+.5)*Math.log(t)-t+Math.log(a)-Math.log(x);
	},
	
	/*number*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		if(parm <= 0)
			throw websheet.Constant.ERRORCODE["504"];
		return this._gammaln(parm);
	}
	
});