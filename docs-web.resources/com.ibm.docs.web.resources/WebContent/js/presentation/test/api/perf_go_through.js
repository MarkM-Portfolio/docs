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

dojo.provide("pres.test.api.perf_go_through");

apiTest(function()
{
	var sorter = pe.scene.slideSorter;
	var children = sorter.getChildren();
	var length = children.length;
	var index = 0;
	var goNext = function(dfd)
	{
		sorter.focusNext();
		index++;
		setTimeout(function()
		{
			if (index < length - 1)
				goNext(dfd);
			else
			{
				var dump = pres.perf.dump();
				var initTime = pres.perf.between("data_load_prepare", "editor_render_0");
				var readyTime = pres.perf.between("data_load_prepare", "sorter_render_full");
				var goThroughTime = pres.perf.eclipsed("sorter_render_full");

				expect(1).toBe(1);
				if (dfd)
					dfd.resolve();

				if (window.jasmineWindow)
				{
					setTimeout(function()
					{
						dojo.withGlobal(window.jasmineWindow, function()
						{
							var div = dojo.create("div", {
								style: {
									"fontSize": "11px",
									"fontFamily": 'Monaco, "Lucida Console", monospace',
									"lineHeight": "14px",
									"color": "#333333",
									"margin": "10px"
								}
							}, dojo.body());
							var str = "<hr>";
							str += "<div>Time used for user see the first 5 slides after draft data request send: <b>" + initTime + "</b></div>";
							str += "<div>Time used for user see all slides after draft data request send: <b>" + readyTime + "</b></div>";
							str += "<div>Time used to go through all slides after user see all slides: <b>" + goThroughTime + "</b></div>";
							str += "<p>" + dump.replace(/\n/g, "<br>") + "</p>";
							div.innerHTML = str;
						});
					}, 500);
				}
			}
		}, 100);
	};

	describe("check data stamp when go through the complex file", function()
	{
		it.asyncly("go through slide", function()
		{
			var dfd = new dojo.Deferred();
			var selectThumb = sorter.getCurrentThumb();
			var index = dojo.indexOf(children, selectThumb); // 0
			setTimeout(function()
			{
				goNext(dfd);
			}, 100);
			return dfd;
		}, 60 * 1000);

	});

});