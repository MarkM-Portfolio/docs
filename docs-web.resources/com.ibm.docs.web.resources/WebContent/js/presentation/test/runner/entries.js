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

dojo.provide("pres.test.runner.entries");

(function(runner, app){	
	function FireworkDeferred(deferred) {
		// summary: returns a wrapped deferred, which behaves just like fireworks,
		//		which means it can be fired as expected the first time;
		//		any later ignition will be dismissed with no side- or counter-effect.
		if (!deferred) {
			return ;
		}		
		var _fired = false;
		
		var _callbacks = [];
		_callbacks.push(function(){
			//deferred is not fired yet
			if (deferred.fired === -1){
				deferred.callback();
			}
		});
		
		this.fired = function() {
			return _fired;
		};
		
		this.addCallback = function(f){
			_callbacks.push(f);
			_fired = false;
		};
		
		this.callback = function(){
			if (_fired) {
				return ;
			}
			
			_fired = true;
			var len = _callbacks.length;
			for (var i=0; i<len; i++) {
				(_callbacks.pop())();
			}
		};
	};
	
	// ot: how many OT followers are prepared
	// otc: how many actors are involved in this OT step
	// oth: the order current actor in the OT step
	//		oth === -1	non-OT step
	//		oth === otc	OT viewer
	var stage = {
			coeditors: null,
			
			type: "_cue_",
			cursor: -1,
			ot: 0,
			otc: 0,
			oth: -1,
			
			tapper: null,
			actor: null,
			
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
				// "wiretap" is to be called before any message is loaded, (after app.pe.base.reset())
				//		to intercept the cue messages and discard them after necessary processing.
				// 
				// Cue messages are sent from app.pe.scene.session.sendMessage();
				//		intercepted at app.pe.scene.processMessage().
				var pm = app.pe.scene.processMessage;
				var messages = [];
				var otSignal = 0;
				
				app.pe.scene.processMessage = function(m) {
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
						"cursor": cursor,
						"actor": this.actor
				};
				if (flavors) {
					for (var f in flavors) {
						message[f] = flavors[f];
					};
				}
				
				app.pe.scene.session.sendMessage(message);
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
			stage.wiretap();
			stage.coeditors = c;
		}
	};
	
	runner.apiTest = function(f) {
		var def = new dojo.Deferred();
		
		if (stage.isCoeditingAct()) {
			def.addCallback(function() {
				var interval = setInterval(function() {
					// app.pe.scene.coedit is a boolean status, true for co-editing
					// participantList tells all the editors online from the view of current editor;
					//		although another editor can be getting on board.
					if (app.pe.scene.coedit &&
						app.pe.scene.session.participantList.length === stage.coeditors.length)
					{
						clearInterval(interval);
						f();
						jasmine.getEnv().execute();
					}
				}, 1000);
			});
		} else {
			def.addCallback(function() {
				f();
//				jasmine.getEnv().execute();
			});
		}
		def.callback();
//		deferreds.documentLoad(def);
	};
	
	runner.actBy = function(/* string */ actor) {
		// summary: to formulate a co-editing API test, with or without OT.
		//  Param:
		//		actor	A string understood as a name telling who is running this API test.
		var deferred = new dojo.Deferred();
		
		var lines = [];
		var cursor = -1;
		var terminator = null;
		
		var _people = null;
		var _line = null;		
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
						_run();
					}
				} else {
					_run();
				}
			});
			
			stitch.addErrback(function(e) {
				deferred.errback(e);
			});

			var stitchOnce = new FireworkDeferred(stitch);
			var line = lines[cursor];
			
			var readLine = function(def) {
				def.nextStep = def.callback;
				
				deferreds.updateUI(def);
				deferreds.scroll(def);
				deferreds.updateSheet(def);
				deferreds.hideSheet(def);
				deferreds.documentLoad(def);
				
				line(def);
				
				deferreds.initialize().addCallback(function() {
					stage.wiretap();
		    		deferreds.documentLoad(def);
		    	});
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
				
				var stakeout = new FireworkDeferred(new dojo.Deferred().addCallback(function() {
					deferreds.awaitTaskManager(stitchOnce, app.pe.taskMan.Priority.VisibleFormulaCalculation);
				}));
				if (stage.isOtViewer()) {
					if (cursor <= stage.cursor) {
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
								var def = new FireworkDeferred(new dojo.Deferred().addCallback(function() {
									readLine(stitchOnce);
								}));
								stage.tapper = def;
							}
						} catch (e) {
							stitch.errback(e);
						}
					}, 0);
				} else { // Script runner is OT follower
					setTimeout(function() {
						try {
							var def = new dojo.Deferred();
							def.addCallback(function() {
								readLine(stitchOnce);
							});
							stage.tapper = new FireworkDeferred(def);
							stage.cueLine(cursor);
						} catch (e) {
							stitch.errback(e);
						}
					}, 0);
				}
			} else { // Entering a non-OT step				
				if (dojo.indexOf(line.by, actor) === -1) {
					var stakeout = new FireworkDeferred(new dojo.Deferred().addCallback(function() {
						deferreds.awaitTaskManager(stitchOnce, app.pe.taskMan.Priority.VisibleFormulaCalculation);
					}));
					
					if (cursor <= stage.cursor) {
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
					}, 0);
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
			step: function(pace) {
				var f, people;
				
				if (typeof pace === "function"){
					f = pace;
				} else {
					f = pace.line;
					people = pace.by;
				}
				
				if (typeof f === "function") {
					_line = f;
				} else {
					return self;
				}
				
				_people = [];
				if (people == null) {
					_people.push(actor);
				} else if (people instanceof Array) {
					_people = people;
				} else {
					_people.push(people);
				}
				_line.by = _people;
				
				if (_otFlag) {
					_otStep.push(_line);
				} else {
					lines.push(_line);
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
				_run();
				return deferred;
			}
		};

		return self;
	};
	
})(window, window.app);