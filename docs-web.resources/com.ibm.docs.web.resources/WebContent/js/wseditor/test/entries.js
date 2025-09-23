dojo.provide("websheet.test.entries");

(function(runner){	
	// ot: how many OT followers are prepared
	// otc: how many actors are involved in this OT step
	// oth: the order current actor in the OT step
	//		oth === -1	non-OT step
	//		oth === otc	OT viewer
	var stage = {
			coeditors: null,
			
			type: "_cue_",
			cursor: -1,
			lap: 0,
			lapLen: 0,
			ot: 0,
			otc: 0,
			oth: -1,
			
			tapper: null,
			actor: null,
			
			isFastForward: function(c) {
				return (this.lap * this.lapLen + c <= this.cursor);
			},
			
			isCoeditingAct: function() {
				return this.coeditors != null;
			},
			
			reset: function() {
				this.ot = 0;
				this.otc = 0;
				this.oth = -1;
			},
			populate: function(p) {
				this.otc = p;
			},
			order: function(o) {
				this.oth = o;
			},

			isOt: function() {
				return !(this.oth === -1);
			},
			isOtViewer: function() {
				return this.oth === this.otc;
			},
			isOtStarter: function() {
				return this.oth === 0;
			},
			isOtFollower: function() {
				return 	!this.isOtStarter() &&
						!this.isOtViewer();
			},
			
			readyAsOtStarter: function() {
				return this.isOtStarter() && this.ot === this.otc - 1;
			},
			readyAsOtFollower: function(p) {
				return 	this.isOtFollower() &&
						this.oth === p;
			},
			
			anotherOtFollowerHasBeenPrepared: function() {
				this.ot ++;
			},
			
			isOtSignal: function(message) {
				return (message.updates &&
						message.updates[0] &&
						message.updates[0].action != websheet.Constant.Event.LOCK &&
						message.updates[0].action != websheet.Constant.Event.RELEASE);
			},
			
			informTapper: function() {
				if (this.tapper) {
					this.tapper.callback();
				}
			},
			
			wiretap: function() {
				// summary: The cue messages ({type: "_cue_"}) cause clients to reload,
				// 		if dispatched to spreadsheet because they are just "stowaways".
				// "wiretap" is to be called before any message is loaded, 
				//		to intercept the cue messages and discard them 
				//		after necessary processing.
				// 
				// Cue messages are sent from runner.app.pe.scene.session.sendMessage();
				//		intercepted at runner.app.pe.scene.processMessage().
				var pm = runner.app.pe.scene.processMessage;
				var messages = [];
				var otSignal = 0;
				
				runner.app.pe.scene.processMessage = function(m) {
					console.info(m);
					if (m.type === stage.type) {					
						if (m.cursor > stage.cursor) {
							stage.cursor = m.cursor;
							
							if (!stage.isOt()) {
								stage.informTapper(m);
							}
						}
						
						if (m.cursor === stage.cursor) {
							stage.anotherOtFollowerHasBeenPrepared();
						}
						
						if (stage.isOt() && stage.readyAsOtStarter()) {
							stage.informTapper(m);	
						}
					} else {
						if (stage.isOt() && stage.isOtFollower()) {
							messages.push(m);
							if (stage.isOtSignal(m)) {
								otSignal ++;
							}
							
							if (stage.readyAsOtFollower(otSignal)) {
								stage.informTapper(m);
								
								for (var i = messages.length; i > 0; i--) {
									pm.call(this, messages.shift());
								}
								otSignal = 0;
							}
						} else {
							pm.apply(this, arguments);
						}
					}
				};
			},
			
			cueLine: function(cursor, flavors) {
				if (!this.isCoeditingAct()) {
					return ;
				}
				
				var message = {
						"type": this.type,
						"cursor": this.lap * this.lapLen + cursor,
						"actor": this.actor
				};
				if (flavors) {
					for (var f in flavors) {
						message[f] = flavors[f];
					};
				}
				console.info(message);
				runner.app.pe.scene.session.sendMessage(message);
			}
	};
	
	/*
	 * It accepts an array such as ["Amy", "Bob", "Chloe"]
	 * 
	 * A > Amy
	 * B > Bob
	 * C > Chloe
	 * D > Dan
	 * E > Emma
	 * F > Frank
	 * G > Glen
	 * H > Helen
	 * I > Ivy
	 * J > Joey
	 * L > Lily
	 * M > Mike
	 * N > Nicholas
	 */
	runner.coeditors = function(c) {
		if (c instanceof Array) {
			installWiretap();
			stage.coeditors = c;
		}
	};
	
	var installWiretap = function() {
		var interval = setInterval(function() {
			if (runner.app &&
				runner.app.pe &&
				runner.app.pe.scene &&
				runner.app.pe.scene.processMessage)
			{
				console.info("install tapper");
				clearInterval(interval);
				stage.wiretap();
			}
		});
	};
	
	var bloomJasmine = function() {
		if (stage.isCoeditingAct()) {
			var def = deferreds.coedit(null, stage.coeditors.length);
			def.addCallback(function() {
				jasmine.getEnv().execute();
			});
		} else {
			jasmine.getEnv().execute();
		}
	};
	
	runner.dojo.addOnLoad(function() {
		var def = new dojo.Deferred();
		def.addCallback(function() {
			if (runner.beforeAll.def) {
				runner.beforeAll.def().addCallback(function() {
					bloomJasmine();
				});
			} else {
				bloomJasmine();
			}
		});

		deferreds.init(def);
	});
	
	// @deprecated
	runner.test = function(f) {
		f();
	};
	
	runner.sample = function(file) {
		console.info("sample: " + file);
		if (file != null) {
			beforeAll(function() {
				return deferreds.doc();
			});
		} else {
			beforeAll(function() {
				return deferreds.fallback(null, deferreds.doc, 2000);
			});
		}
	};
	
	runner.beforeAll = function(func) {
		runner.beforeAll.def = func;
	};
	
	runner.afterAll = function(func) {
		jasmine.afterAll = func;
	};
	
	runner.actBy = function(/* string */ actor) {
		// summary: to formulate a co-editing API test, with or without OT.
		//  Param:
		//		actor	A string understood as a name telling who is running this API test.
		var deferred = new dojo.Deferred();
		
		var lines = [];
		var cursor = -1;
		var terminator = null;
		
		var _otFlag = false;
		var _otStep = null;
		
		stage.actor = actor;
		
		var _run = function() {
			if (cursor < lines.length -1) {
				cursor ++;
			}
			if (cursor < 0) {
				deferred.callback(true);
				return ;
			}
			
			var stitch = new dojo.Deferred();
			stitch.addCallback(function() {
				stage.reset();
			});
			stitch.addCallback(function(m) {
				if (cursor === lines.length - 1) {
					if (terminator == null || terminator()) {
						deferred.callback(true);
					} else {
						cursor = -1;
						stage.lap ++;
						_run();
					}
				} else {
					_run();
				}
			});
			
			stitch.addErrback(function(e) {
				deferred.errback(e);
			});

			var stitchOnce = new utils.Firework(stitch);
			var line = lines[cursor];
			
			var readLine = function(def) {
				// step() is called to step right after the function is complete
				def.step = function() {
					if (runner.Env.mode === "API") {
						deferreds.task(def);
					} else {
						def.callback();
					}
				};
				
				def.reload = function(wait, ms) {
					var url = runner.app.location.href;
					runner.app.close();
					
					setTimeout(function() {
						if (stage.isCoeditingAct()) {
							installWiretap();
						}
						runner.app = runner.open(url);
						deferreds.initialize().addCallback(function() {
							if (ms) {
								deferreds.fallback(def, wait, ms);
							} else {
								wait.call(deferreds, def);
							}
						});
					}, 2000);
				};
				
				if (line.wait) {
					line.wait.call(deferreds, def);
				} else {
					deferreds.loadDocument(def);
					deferreds.updateUI(def);
					deferreds.endScroll(def);
					deferreds.showSheet(def);
				}
				line(def);
			};
			// Entering an OT step
			if (line instanceof Array) {
				var otStep = line;
				if (otStep.length <= 1) {
					stitchOnce.callback();
				}
				line = null;
				var order = 0;
				for (; order < otStep.length; order ++) {
					if (dojo.indexOf(otStep[order].by, actor) !== -1) {
						line = otStep[order];
						break;
					}
				}
				stage.populate(otStep.length);
				stage.order(order);
				
				var stakeout = new utils.Firework(new dojo.Deferred()
								.addCallback(function() {
					deferreds.task(stitchOnce);
				}));
				if (stage.isOtViewer()) {
					if (stage.isFastForward(cursor)) {
						stakeout.callback();
					} else {
						stage.tapper = stakeout;
					}
				} else if (stage.isOtStarter()) {
					setTimeout(function() {
						try {
							if (stage.readyAsOtStarter())	{
								readLine(stitchOnce);
							} else {
								var def = new utils.Firework(new dojo.Deferred()
										.addCallback(function() {
									readLine(stitchOnce);
								}));
								stage.tapper = def;
							}
						} catch (e) {
							stitch.errback(e);
						}
					});
				} else { // Script runner is OT follower
					setTimeout(function() {
						try {
							var def = new dojo.Deferred();
							def.addCallback(function() {
								readLine(stitchOnce);
							});
							stage.tapper = new utils.Firework(def);
							stage.cueLine(cursor);
						} catch (e) {
							stitch.errback(e);
						}
					});
				}
			} else { // Entering a non-OT step				
				if (dojo.indexOf(line.by, actor) === -1) {
					var stakeout = new utils.Firework(new dojo.Deferred()
								.addCallback(function() {
						deferreds.task(stitchOnce);
					}));
					
					if (stage.isFastForward(cursor)) {
						stakeout.callback();
					} else {
						stage.tapper = stakeout;
					}
				} else {
					setTimeout(function() {
						try {
							stitchOnce.addCallback(function() {
								stage.cueLine(cursor);
							});
							readLine(stitchOnce);
						} catch (e) {
							stitch.errback(e);
						}
					});
				}
			}
		};
			
		var self = {
			otBegin: function(){
				_otFlag = true;
				_otStep = [];
				return self;
			},
			otEnd: function() {
				_otFlag = false;
				lines.push(_otStep);
				return self;
			},
			xstep: function() {
				return self;
			},
			step: function(pace) {
				var f;
				
				if (typeof pace === "function"){
					f = pace;
				} else {
					f = pace.line;
					f.by = pace.by;
					f.wait = pace.wait;
				}
				
				if (!(f.by instanceof Array)) {
					f.by = [f.by];
				}
				
				if (_otFlag) {
					_otStep.push(f);
				} else {
					lines.push(f);
				}
				return self;
			},
			end: function() {
				_run();
				return deferred;
			},
			repeatUntil: function(f) {
				if (typeof f === "function") {
					terminator = f;
				}
				stage.lapLen = lines.length;
				_run();
				return deferred;
			}
		};
		
		return self;
	};
	
})(window);