dojo.provide("websheet.test.performance.utils");

(function(runner) {
	runner.perfutils = {};

	runner.perfutils.ihsrequest = function(num) {

		var separator = "|";
		var total = num || 15;
		var currentno = 1;
		var results = {};
		var lastTrophyTime = null;

		var browser = dojo.isIE ? "IE" : (dojo.isFF ? "FF" : "Other");

		this.start = function() {
			lastTrophyTime = new Date().getTime();
		};

		this.request = function(transname) {
			var time = new Date().getTime();
			var lapse = lastTrophyTime ? (time - lastTrophyTime) : 0;

			console.log(currentno+":"+transname + ": " + lapse);

			if (!results[transname]) {
				results[transname] = [];
			}
			results[transname].push(lapse);
			lastTrophyTime = time;
		};

		this.post = function(id) {
			return dojo.xhrPost({
				url : id,
				postData : {
					//					time : this.time,
					//					browser : this.browser
				}
			});
		};

		this.finish = function() {
			if (currentno === total) {
				for (var i in results) {
					this.post("/apitest/APIServlet?type=sheet&browser=" + browser + "&transname=" + i + "&resptime=" + results[i].join(separator));
				}
				currentno = 1;
				results = {};
				return true;

			} else {
				currentno++;
				return false;
			}
		};
	};

})(window);

