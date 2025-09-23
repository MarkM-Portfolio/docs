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

dojo.provide("websheet.TaskManager");

websheet.TaskManager = {
		// auto start the scheduler once tasks are added,
		// if set to false, client need to call start to make the list running
		// AUTO_START: false,
		// if set to true, any exceptions thrown from task functions will stop scheduler
		// from running and cleans the task list
		BREAK_ON_ERROR: false,
		// priority definitations, note that the task priority could be an integer between [0, 100], the smaller, the higher.
		// but it would be better if using these pre-defined constants.
		
		/*===== predefined task priorities =====*/
		Priority: {
			// initial load
			LoadDocument: 5,
			// for postLoadDocument task
			PostLoadDocument: 6,
			// for processPendingMessage after document is all load
			PostLoadProcessMessage: 7,
//			UpdateLevel1Cache: 9, // should give a high priority, cause they are dirty data, would cause error 
			// user operations 
			UserOperation: 10,
			// undo action 
			UndoRedo: 11,
			// publish message to server
			PublishMessage: 40,
			// undo action transform
			TransformAction: 41,
			// batch "sendNotify4SetRange" for delete undo events
			BatchSendNotify: 48,
			// Base execCommand tasks
			BaseCommands: 49,
			// default priority
			Normal: 50,
			// trivial actions, priority not higher than TRIVIAL will not block session from receiving message
			Trivial: 80,
			// getPartial request to server
			GetPartial: 85,
			// DeleteGrid UI action, usually leads to a GetPartial
			DeleteGrid: 86,
			// pending Base.execCommand() call due to document loading/partial-loading,
			// this must be lower then GetPartial to not prevent GetPartial from executing
			PendingBaseCommands: 87,
			// priorities used for PCM, higher then silence formula calculation
			VisibleFormulaCalculation: 88,
			// Priorities used for silence formula calculation
			HighFormulaCalculation: 89,
			FormulaCalculation: 90,
			CFCalculation: 91,
//			BuildLevel1Cache: 95,
//			BuildLevel2Cache: 96,
			GarbageCollection: 100
		},
		
		// flag to check if any tasks are running in TaskManager 
		_isRunning: false,
		// flag to check if any tasks are pausing and waiting to resume in TaskManager, no tasks are running
		// if _isRunning == false && _isPausing == false, TaskManager is empty.
		_isPausing: false,
		// head pointer for task list
		_head: null,
		// current running taskDef in async mode
		_current: null,
		// current pending taskDef in async mode
		_pending: null,
		// sync execute all functions
		_bSync: false,
		// an array of [low, high], when sync() is called, only tasks between [low, high] is called
		_syncPriority: null,
		
		/**
		 * Add a task to the task queue. Returns an taskDef object.
		 * When a task is added to task queue, it is waiting for executing. The taskDef's isRunning property is false, isPending
		 * property is false, pendingSetTimeout property is null.
		 * When it is the task's turn to be run, in async mode, there will be a setTimeout() to pend the task execution in async mode. 
		 * The task's pendingSetTimeout is set to the handle returned by setTimeout. In sync mode, the task will not be pending. It will get
		 * run directly.
		 * When the task is actually running, the isRunning property is true, the pendingSetTimeout is null.
		 * There is always only one task that goes through waiting -> pending -> running cycle.
		 * The task is removed from the queue when it is done running, before calling next task.
		 * The task queue always keeps ordered.
		 * Tasks also have level, which indicates sub-task relationship. If call addTask() when a task is running, the added task would be a sub-task
		 * of the running task. The added task level would be the running task's level plus 1. It will be placed after the running task, in the order
		 * of ascending level and ascending priority, before the first task that has the level smaller than the added task's level. The task that is
		 * right after the added task would be the first task that is the same level, or the level above the running task. So, the sub-tasks of a task
		 * would run before the task that is the same level, or the above level of the parent task.
		 * 
		 * @param scope  object, required
		 * 		Scope that task function hitches to.
		 * @param task   string, required
		 * 		Task function name. Must be a defined function in scope.
		 * @param args   array, required
		 * 		Arguments for the task function.
		 * @param priority		integer [1, 100]
		 * 		Task priority. The smaller, the higher. Caller is recommended to use predefined tasks in TaskManager.Priority.
		 * 		Default to Priority.Normal.
		 * @param isPaused      boolean
		 * 		If the task is paused. Default to false.
		 * @param interval		integer
		 * 		Interval of the setTimeout() that executes the task.
		 * @param comparator	function
		 * 		A function to be called against every other tasks that already in TaskManager. Definition:
		 * 		/ integer / function (sourceTaskDef, targetTaskDef)
		 * 		Parameters:
		 * 			sourceTaskDef: the taskDef about this adding task.
		 * 			targetTaskDef: the taskDef already pending in TaskManager.
		 * 		Returns:
		 * 			An integer, must be -1, 0 or 1.
		 * 			-1: Remove targetTaskDef after pending this adding taskDef to TaskManager. Continue the comparing.
		 * 			 0: Do nothing. Continue the comparing.
		 * 			 1: Stop comparing. Don't pend this adding taskDef to TaskManager.
		 *  @returns taskDef	dojo.Deferred
		 *  	The returning object is an instance of dojo.Deferred. It can be used for caller to register task callbacks
		 *  	or error handlers. Callbacks or error handlers will be called with an object as parameter, as:
		 *  		taskDef: the task definition itself
		 *  		result: for callbacks, the returned value from task function
		 *  		error: for errbacks, the error occurred
		 * 		This function also returns null if task is not added due to invalid task, or task is cancelled by comparator.
		 *  	The returning dojo.Deferred is extended with following properties and functions.
		 *  	Properties:
		 *  		scope: as in parameter
		 *  		task: as in parameter
		 *  		args: as in parameter
		 *  		level: integer >= 0, indicates sub-task relationship. 
		 *  		priority: as in parameter
		 *  		isPaused: as in parameter
		 *  		interval: as in parameter
		 *  		isRunning: boolean
		 *  			If the task is running.
		 *  		pendingSetTimeout: setTimeout() handle
		 *  			In async mode, after setTimeout() is triggered, this property holds the handle
		 * 		Private properties:
		 * 			_f: function
		 * 				Decorated task function that be called in TaskManager.
		 * 			_prev: taskDef
		 * 				Previous pointer in queue
		 * 			_next: taskDef
		 * 				Next pointer in queue
		 *  	Functions:
		 *  	
		 */
		addTask: function(scope, task, args, priority, isPaused, interval, comparator) {
			var taskDef = this._makeTaskDef(scope, task, args, priority, isPaused, interval);
			if (taskDef == null) {
				return;
			}
			
			this._addTask(taskDef, comparator);
			
			return taskDef;
		},

		/**
		 * Add a task as root, refer to addTask() for details.
		 */
		addRootTask: function(scope, task, args, priority, isPaused, interval, comparator) {
			return this.addTaskWithDeltaLevel(scope, task, args, priority, isPaused, interval, comparator,
					/* a sufficient large negative delta to make the new level < 0, 4294967295 is  2^32 - 1*/ -4294967295);
		},
		
		/**
		 * Add a task with a delta level against current level, refer to addTask() for details.
		 * The deltaLevel gives the new task a customized level corresponding to the current task level. The deltaLevel is an any integer.
		 * If there's no current level, the deltaLevel is ignored and new level will take the root level.
		 * If there's a current level, the new level would be (_current.level + deltaLevel). Thus, a deltaLevel of 0 would create a sibling task
		 * of the current task. A deltaLevel of 1 would create an ordinary child task. if (_current.level + deltaLevel) < 0, then the level would be 0
		 * and the new task would be created as root.
		 * @param scope  object, required
		 * 		Scope that task function hitches to.
		 * @param task   string, required
		 * 		Task function name. Must be a defined function in scope.
		 * @param args   array, required
		 * 		Arguments for the task function.
		 * @param priority		integer [1, 100]
		 * 		Task priority. The smaller, the higher. Caller is recommended to use predefined tasks in TaskManager.Priority.
		 * 		Default to Priority.Normal.
		 * @param isPaused | deltaLevel    boolean | integer
		 * 		isPaused as in addTask(), if is a boolean, the signature definition is as addTask(), plus deltaLevel as the last parameter
		 * 		OR, could be deltaLevel as described above, in this case, other parameters are not needed and set as default
		 * @param interval    integer
		 * @param comparator  function
		 * @param deltaLevel  integer
		 *      valid iff 5th paramter is isPaused (boolean)
		 */
		addTaskWithDeltaLevel: function(scope, task, args, priority) {
			var taskDef;
			if (typeof (arguments[4]) == "number") {
				// the 5th argument is number, which is meant to be deltaLevel
				taskDef = this._makeTaskDef(scope, task, args, priority, /* isPaused and interval */ false, 0, arguments[4]);
			} else {
				var isParsed = arguments[4];
				var interval = arguments[5];
				var deltaLevel = arguments[7];
				taskDef = this._makeTaskDef(scope, task, args, priority, isParsed, interval, deltaLevel);
			}
			if (taskDef == null) {
				return;
			}
			
			this._addTask(taskDef, arguments[6]);
			
			return taskDef;
		},

		
		/**
		 * Starts task execution. Multiple calls are safe.
		 */
		start: function() {
			if (this._isRunning) {
				// has already started running
				return;
			} else {
				if (this._head != null) {
					// queue is not empty
					this._isRunning = true;
					this._callNext();
				}
			}
		},
		
		/**
		 * Call all functions in the list in current timer. Call with CAUTION that this may cause stopscript in **bad** browsers.
		 * If low and high is passed, only task that priority is between [low, high] is executed. If not passed,
		 * all is executed. If only low is passed, [low, low] is executed.
		 */
		sync: function(low, high) {
			if (this._isRunning) {
				if (low == null) {
					low = 1;
					high = 100;
				}
				if (high == null) {
					high = low;
				}
				this._bSync = true;
				this._syncPriority = [low, high];
				// if TaskManager is running another task, i.e. sync() is called from another task, sync() would move this._current
				// record the old current and resume later after sync() done.
				// since _callNext() would skip the running task, which is _current task, we are safe here 
				var oldCurrent = this._current;
				this._callNext();
				this._syncPriority = null;
				this._bSync = false;
				this._current = oldCurrent;
				if (this._current != null || (this._pending != null && this._pending._pendingSetTimeout != null)) {
					// if task is in running, or task is still in pending, do nothing and let next task go
					;
				} else {
					// else, the pending task might be cleared durning sync(), _callNext() to resume
					this._callNext();
				}
			}
			
		},
		
		/**
		 * Protect the incoming function as defined in taskDef to keep it in order with the tasks in TaskManager.
		 * If the TaskManager is in running, and protect() is not called from TaskManager, we need to pend the task in appropriate
		 * position in TaskManager.
		 * Since TaskManager only adds the task when it is not calling from a running task, the protected task can only be added as root(level 0).
		 * Returns:
		 * 		taskDef: function is pending and will be executed later, returns created taskDef
		 * 		null: function is not pending, caller is safe to execute the function immediately.
		 */
		protect: function(scope, task, arrArgs, priority, isPaused, comparator) {
			if (this._current != null && this._current._pted) {
				// it is calling from task manager, go ahead to execute it
				return null;
			} else {
				// not calling from task manager, protect it by adding it to task list, if any higher priority task is running
				priority = priority || this.Priority.Normal;
				if (this.hasNext(priority)) {
					// current task need to be protected in another task, create it
					var t = this.addTask(scope, task, arrArgs, priority, isPaused, 0, comparator);
					// mark task as a task made from protect
					t._pted = true;
					return t;
				} else {
					// no task pending ahead for running, go ahead to execute
					return null;
				}
			}
		},
		
		/**
		 * Check if TaskManager has any task waiting for running, higher than or equals to priority.
		 * This directly returns result of isRunning(priority, true)
		 */
		hasNext: function(priority) {
			return this.isRunning(priority, true);
		},
		
		/**
		 * See if TaskManager is running. If parameter priority is passed, test if any active task higher than (including) the priority is in queue.
		 * @param priority				integer [1, 100], required
		 * 		Only return true if the task is equal or higher than the priority.
		 * @param excludeRunning		boolean, optional, default to false
		 * 		If should exclude the task that is already running in the queue.
		 */
		isRunning: function(priority, excludeRunning) {
			if (this._isRunning) {
				var task = this._head;
				while (task != null) {
					if (excludeRunning && task.isRunning) {
						task = task._next;
						continue;
					}
					
					if (!task.isPaused) {
						if (priority != null) {
							if (task.priority <= priority) {
								return true;
							} else {
								// continue to iterate
								;
							}
						} else {
							// priority is not set and we met a task not paused, we are running
							return true;
						}		
					}
					// else, a task is paused, continue to iterate
					task = task._next;
				}
				// all task is pausing, return false
				return false;
			} else {
				return false;
			}
		},
		
		removeTasks: function(low, high) {
			if (low == null) {
				low = 1;
				high = 100;
			}
			if (high == null) {
				high = low;
			}
			this._forEach(function(t) {
				var p = t.priority;
				if (!t.isRunning && p >= low && p <= high) {
					// if task is not running, and task priority in [low, high]
					t.isPaused = true;
					if (t.pendingSetTimeout != null) {
						clearTimeout(t.pendingSetTimeout);
						t.pendingSetTimeout = null;
					}
					// console.info(" removeTasks  : ", t.task, " ",  t.level," ", t.priority);
					t.remove();
				}
			});
			if (this._isRunning) {
				this._callNext();
			}
		},
		/**
		 * Pause tasks that priority between [low, high].
		 * If low and high are passed, tasks priority between [low, high] is paused, but not for task that already in running.
		 * If low not passed, all tasks are paused.
		 * If high not passed, only tasks priority equal to low is paused.
		 */
		pause: function(low, high) {
			if (low == null) {
				low = 1;
				high = 100;
			}
			if (high == null) {
				high = low;
			}
			this._forEach(function(t) {
				var p = t.priority;
				if (!t.isRunning && p >= low && p <= high) {
					// if task is not running, and task priority in [low, high]
					t.isPaused = true;
					if (t.pendingSetTimeout != null) {
						clearTimeout(t.pendingSetTimeout);
						t.pendingSetTimeout = null;
					}
				}
			});
			if (this._isRunning) {
				this._callNext();
			}
		},
		
		/**
		 * Resume tasks that priority between [low, high].
		 * If low and high are passed, paused tasks priority between [low, high] is resumed.
		 * If low not passed, all paused tasks are resumed.
		 * If high not passed, only tasks priority equal to low is resumed.
		 */
		resume: function(low, high) {
			if (low == null) {
				low = 1;
				high = 100;
			}
			if (high == null) {
				high = low;
			}
			this._forEach(function(t) {
				var p = t.priority;
				if (t.isPaused && p >= low && p <= high) {
					t.isPaused = false;
				}
			});
			if (this._isPausing) {
				// reset pausing and running flag
				this._isPausing = false;
				this._isRunning = true;
			}
			if (this._pending && this._pending.pendingSetTimeout) {
				clearTimeout(this._pending.pendingSetTimeout);
				this._pending.pendingSetTimeout = null;
			}
			this._callNext();
		},
		
		resumeOnTopic: function(topic) {
			dojo.publish(topic);
		},
		
		/**
		 * Get a list of tasks that priority between [low, high].
		 * If low and high are passed, paused tasks priority between [low, high] is returned.
		 * If low not passed, all paused tasks are returned.
		 * If high not passed, only tasks priority equal to low is returned.
		 */
		getTasksByPriority: function(low, high) {
			if (low == null) {
				low = 1;
				high = 100;
			}
			if (high == null) {
				high = low;
			}
			var list = [];
			this._forEach(function(t) {
				var p = t.priority;
				if (p >= low && p <= high) {
					list.push(t);
				}
			});
			return list;
		},
		
		// Called internally to add a taskDef to the task queue. For paramters, refer to addTask()
		_addTask: function(taskDef, comparator) {
			if (this._head == null) {
				this._head = taskDef;
				taskDef._next = null;
				taskDef._prev = null;
				return taskDef;
			}
			
			// find correct location for incoming taskDef, from _head
			// current task
			var t = this._head;
			// previous task
			var p = null;
			// current priority
			var priority = taskDef.priority;
			// added task level
			var level = taskDef.level;
			// task cancelled by comparator
			var bCancelled = false;
			
			if (level > 0) {
				// adding task has a deeper level, add after current task
				t = this._current._next;
				p = this._current;
			}
			
			// search start from t to find a position to add the new task
			while (t != null) {
				if (level == 0) {
					// adding root task
					if (t.level > 0) {
						// bypass any sub-tasks
						p = t;
						t = t._next;
						continue;
					}
					if (t.priority > priority) {
						// hit t that has a lower priority, end search
						break;
					}
				} else {
					// adding sub task with level "level", the new task is added after _current,
					// we search down from _current, stop on a task that has a higher level (smaller number) than "level"
					if (t.level < level) {
						// hit t that has a higher level than the new task, end search
						break;
					}
					// else, t is one of the subtasks of current running task
					if (t.level == level && t.priority > priority) {
						break;
					}
				}
				
				if (comparator && t.level == level && t.priority == priority) {
					// current task is passing tasks that with the same priority at the same level, use comparator
					var ret = comparator(taskDef, t);
					if (ret == -1) {
						// remove t from task list
						// console.info("remove t: ", t.task," ", t.level," ", t.priority);
						t.remove();
						if (!t.isRunning && t.pendingSetTimeout != null) {
							// task is in pending mode, and is cancelled, clear its timeout
							clearTimeout(t.pendingSetTimeout);
							t.pendingSetTimeout = null;
						}
						t = null;
					} else if (ret == 1) {
						// cancel adding this task
						bCancelled = true;
						break;
					} else {
						// do nothing
					}
				}
				if (t == null) {
					// t is removed
					if (p == null) {
						// the removed t is previously the head in TaskManager, now the new t should be the new head,
						// if it exists
						t = this._head;
					} else {
						t = p._next;
					}
				} else {
					p = t;
					t = t._next;
				}
			}
			
			if (bCancelled) {
				return;
			}
			
			if (t == null) {
				// searched all over the list, append it to p ( p -> taskDef )
				if (p == null) {
					// TaskManager is empty now
					this._head = taskDef;
					taskDef._next = null;
					taskDef._prev = null;
				} else {
					p._next = taskDef;
					taskDef._next = null;
					taskDef._prev = p;
				}
			} else {
				// make list as p -> taskDef -> t
				if (p == null) {
					// _head -> taskDef -> t
					this._head = taskDef;
					taskDef._next = t;
					taskDef._prev = null;
					t._prev = taskDef;
				} else {
					p._next = taskDef;
					taskDef._next = t;
					t._prev = taskDef;
					taskDef._prev = p;
				}
			}
			if (this._isPausing && !this._isRunning && !taskDef.isPaused) {
				// all task is pausing, added an active task, start() to make the task run
				this.start();
			}
			
			// we need to re-select running task, before that,
			// clear current pending if has
			if (this._pending != null && this._pending.pendingSetTimeout != null) {
				clearTimeout(this._pending.pendingSetTimeout);
				this._pending.pendingSetTimeout = null;
				this._pending = null;
			}

			this._callNext();
		},
		
		// Find next task to run, the next task is the task that,
		// 		1, not pausing
		//		2, if is in sync mode, task priority in range of sync priority
		// If no runnable task left, clear() if TaskManager is empty, or set isPausing flag if all tasks are paused
		_callNext: function() {
			if (!this._isRunning && !this._isPausing) {
				return;
			}
			
			// start from head to find next task to run
			var task = this._head;
			if (task == null) {
				// task queue is empty, clean() it
				this._clean();
				return;
			}
			
			// find next task that is not paused, or, in sync mode, find next task that priority in the range
			// of this._syncPriority
			var bHasPaused = false;
			var bHasTaskLeft = false;
			while (task != null) {
				if (task.isPaused) {
					// paused task, skip this and do nothing
					bHasPaused = true;
				} else {
					if (this._bSync) {
						// sync executing, see if task in priority range, and is not running, since running task will
						// finish in this execution flow
						var priority = task.priority;
						if (!task.isRunning && priority >= this._syncPriority[0] && priority <= this._syncPriority[1]) {
							// got it
							break;
						} else {
							bHasTaskLeft = true;
						}
					} else {
						break;
					}
				}
				task = task._next;
			}
			
			if (task == null) {
				if (this._bSync) {
					// sync executing 
					if (bHasTaskLeft) {
						// other tasks runnable waiting in list, do nothing and return,
						return;
					}
				}
				if (bHasPaused) {
					// all others are paused
					this._isPausing = true;
					this._isRunning = false;
					return;
				}
				// never here
				console.warn("WARNING, TaskManager in wrong state, ", this);
				return;
			}
			
			// keep task in queue, going to execute it
			if (this._bSync) {
				if (task.pendingSetTimeout != null) {
					// task is already pending, clear it
					clearTimeout(task.pendingSetTimeout);
					task.pendingSetTimeout = null;
				}
				task._f();
			} else {
				// only execute task if the task is not pending and not running
				if (task.pendingSetTimeout == null && !task.isRunning) {
					// if, for any case, another task, different than the task now selected is pending, must
					// clearTimeout() of the task since we can't have more than 1 task pending
					if (this._pending != null && this._pending != task && this._pending.pendingSetTimeout != null) {
						clearTimeout(this._pending.pendingSetTimeout);
						this._pending.pendingSetTimeout = null;
					}
					// if task is already set to running, or is pending to be running, do not re-run the task
 					task.pendingSetTimeout = setTimeout(task._f, task.interval);
					this._pending = task;
				}
			}
		},
		
		_clean: function() {
			this._isRunning = false;
			this._isPausing = false;
			if (this._pending != null) {
				clearTimeout(this._pending.pendingSetTimeout);
				this._pending = null;
			}
			// clean lists
			while (this._head != null) {
				var t = this._head;
				this._head = t._next;
				t = null;
			}
		},
		
		/*
		 * taskDef properties and functions
		 */
		_taskDef: {
			_prev: null,
			_next: null,
			_removed: null,
			_done: null,
			isRunning: null,
			pendingSetTimeout: null,
			/**
			 * removes this task from queue 
			 */
			remove: function() {
				if (this._removed) {
					// task already removed
					return;
				}
				var prev = this._prev;
				var next = this._next;
				var tm = websheet.TaskManager;
				if (prev == null) {
					// taskDef is the head
					tm._head = next;
					if (next != null) {
						next._prev = null;
					}
				} else {
					prev._next = next;
					if (next != null) {
						next._prev = prev;
					}
				}
				this._prev = null;
				this._next = null;
				this._removed = true;
				if (this.pendingSetTimeout != null) {
					// this task has already been setTimeout, clear it and resume taskManager
					clearTimeout(this.pendingSetTimeout);
					this.pendingSetTimeout = null;
					tm._pending = null;
					if (tm._isRunning) {
						tm._callNext();
					}
				}
			},
			/**
			 * topic if need resume on the specified topic, write it, otherwise set it to null
			 * @param topic
			 */
			pause: function(topic) {
				this.isPaused = true;
				if (this.pendingSetTimeout != null) {
					clearTimeout(this.pendingSetTimeout);
					this.pendingSetTimeout = null;
				}
				if(topic){
					var t = this;
					var h = dojo.subscribe(topic, function() {
						// subscribe once
						if (h) {
							dojo.unsubscribe(h);
						}
						t.resume();
					});
				}
			},
			
			resume: function() {
				this.isPaused = false;
				var tm = websheet.TaskManager;
				if (tm._isPausing) {
					// reset pausing and running flag
					tm._isPausing = false;
					tm._isRunning = true;
				}
				if (tm._pending && tm._pending.pendingSetTimeout) {
					clearTimeout(tm._pending.pendingSetTimeout);
					tm._pending.pendingSetTimeout = null;
				}
				tm._callNext();
			},
			/**
			 * Re-set task's priority. This function will re-locate the task in TaskManager to make the task queue in order.
			 * If the priority in parameter equals the task's origin priority, no changes are made.
			 * If the task is already pending for running, it will clearTimeout() of itself.
			 * @param priority integer, [1, 100]
			 * 		the new priority
			 */
			setPriority: function(priority) {
				if (/* task is still valid */ (!this._removed && !this._done) && !this.isRunning && this.priority != priority) {
					var bClearPending = false;
					if (this.pendingSetTimeout != null) {
						clearTimeout(this.pendingSetTimeout);
						this.pendingSetTimeout = null;
						bClearPending = true;
					}
					this.remove();
					// reset removed flag and set it back
					this._removed = false;
					this._next = null;
					this._prev = null;
					this.priority = priority;
					websheet.TaskManager._addTask(this);
					if (bClearPending) {
						// a pending task is removed, TaskManager execuate inturuppted, restart
						websheet.TaskManager._callNext();
					}
				}
			}
		},
		
		// Make up a taskDef structure by providing arguments.
		_makeTaskDef: function(scope, task, args, priority, isPaused, interval, deltaLevel) {
			var f = scope[task];
			if (f == null) {
				console.warn("task function ", task, " in scope ", scope, " not found.");
				return;
			}

			var taskDef = {
				scope: scope,
				task: task,
				args: args ? dojo._toArray(args) : []
			};
			if (priority != undefined) {
				taskDef.priority = priority;
			} else {
				taskDef.priority = this.Priority.Normal;
			}
			if (isPaused) {
				taskDef.isPaused = true;
			}
			if (interval == null) {
				taskDef.interval = 0;
			} else {
				taskDef.interval = interval;
			}			
			// level
			if (this._current) {
				// consider deltaLevel
				if (deltaLevel != null) {
					taskDef.level = Math.max(0, this._current.level + deltaLevel);
				} else {
					taskDef.level = this._current.level + 1;
				}
			} else {
				taskDef.level = 0;
			}
			
			taskDef = dojo.mixin(new dojo.Deferred(), this._taskDef, taskDef);
			taskDef._removed = false;
			taskDef.isRunning = false;
			taskDef._done = false;
			
			// hitch task function to taskDef.scope
			var hitched = this._hitch(scope, f, taskDef.args);
			// decorate func to chain each other
			taskDef._f = dojo.hitch(this, function() {
				var o = {};
				o.taskDef = taskDef;
				var bHasError = false;
				taskDef.isRunning = true;
				taskDef.pendingSetTimeout = null;
				try {
					this._current = taskDef;
					o.result = hitched();
					taskDef.callback(o);
				} catch (e) {
					console.error("error in task function,", e);
					o.error = e;
					bHasError = true;
					taskDef.errback(o);
				} finally {
					this._current = null;
					taskDef.isRunning = false;
					taskDef._done = true;
					taskDef.remove();
					if (bHasError) {
						// execution is broken by error
						if (this.BREAK_ON_ERROR) {
							// stop execution
							this._clean();
						} else {
							// ignore the error
							this._callNext();
						}
					} else {
						this._callNext();
					}
				}
			});
			
			return taskDef;
		},
		
		// hitch f to scope, used internally
		_hitch: function(scope, f, arrArgs) {
			return function() {
				return f.apply(scope, arrArgs ? arrArgs : []);
			};
		},

		// For each task, do something
		// Parameter f is a function,
		//		f: / boolean / function(taskDef)
		//			Parameter: taskDef, the taskDef in TaskManager
		//			Returns:	false to stop iteration, otherwise (including null, i.e. don't return anything) to continue the iteration
		_forEach: function(f) {
			var t = this._head;
			while (t != null) {
				if (f(t) == false) {
					break;
				}
				t = t._next;
			}
		},

		// Print all tasks in console, the function had a g_DEBUG guard, 
		// target for debug use.
	_printAllTasks: function() {
		if (window.g_DEBUG) {
			this._forEach(function(t) {
				console.log("task name, ", t.task, ", scope, ", t.scope, ", args, ", t.args, ", level, ", t.level, ", priority, ", t.priority, ", overall, ", t);
			});
		}
	},
	
	waitors: [],
	waitForComplete: function(deferred, priority, interval) {
		// summary: wait for task manager to complete and resolve the deferred provided, or the deferred returned if no deferred is provided.
		// 		This function will create an interval to periodically check if task manager is complete. This function will clear previous
		//		interval if any. Note, this will make previous deferred failed to resolve if so.
		deferred = deferred || new dojo.Deferred();
		var tm = websheet.TaskManager;
		tm.waitors.push(deferred);
		
		if (tm.waitingInterval) {
			clearInterval(tm.waitingInterval);
			tm.waitingInterval = null;
		}
		
		tm.waitingInterval = setInterval(function() {
			if (!tm.isRunning(priority)) {
				clearInterval(tm.waitingInterval);
				tm.waitingInterval = null;
				
				for (var l = tm.waitors.length; l > 0; l --)
					(tm.waitors.pop()).callback();
			}
		}, interval);
		
		return deferred;
	}
};