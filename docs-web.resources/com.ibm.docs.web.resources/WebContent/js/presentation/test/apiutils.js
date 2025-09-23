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

dojo.provide("pres.test.utils.apiutils");

/**
 * Launcher script for spreadsheet API tests.
 */

dojo.registerModulePath("concord", "../concord");
dojo.registerModulePath("pres", "../presentation/js");
dojo.registerModulePath("pres.test", "../presentation/test");

dojo.require("concord.tests.aspect");

(function()
{
	var params = getReqParams();
	var group = params["group"];
	var sampleMode = params["sampleMode"];
	var bSlave = (params["slave"] == "true");

	var known = ["group", "sampleMode", "slave"];

	if (bSlave)
	{
		dojo.addOnLoad(function()
		{
			dojo.subscribe("/app/ready", function()
			{
				window.opener.slaveReady();
			});
		});
	}
	else
	{
		// add util functions according to sample modes
		switch (sampleMode)
		{
			case "slaveSwitchable":
				var testFiles = params["testFiles"].split(",");
				var repoId = DOC_SCENE.repository;
				// default timeout for a single action
				window.switchSlave = function(index, deferred)
				{
					// summary: switch slave window for a sample. If first called, open a slave window with designate sample.
					// the function will block, in jasmine context, using waitFor(), till the slave window is ready.
					// parameters: index of the provided sample file. 0 being the one opened in main iframe. So the number start from 1, pointing
					// to the 2nd sample provided,
					// timeout being the timeout waiting for the slave to open, default to 10000 ms.
					var url = ["/docs/app/doc/", repoId, "/", testFiles[index], "/edit/content", "?group=", group, "&slave=true"].join("");

					for ( var ft in params)
					{
						if (dojo.indexof(known, ft) === -1)
						{
							url += "&" + ft + "=" + params[ft];
						}
					}

					deferred = deferred || new dojo.Deferred();

					window.slaveReady = function()
					{
						deferred.callback();
					};

					if (window.slaveWindow == null)
					{
						window.slaveWindow = window.open(url);
					}
					else
					{
						window.slaveWindow.location.href = url;
					}

					return deferred;
				};

				break;
			default:
				break;
		}

		if (group == null)
		{
			console.error("no API test group provided, nothing to do.");
		}
		else
		{
			if (group.indexOf("concord.tests") == 0)
			{
				dojo.require(group);
			}
			else
			{
				dojo.require("pres.test.api." + group);
			}
		}
	}

})();