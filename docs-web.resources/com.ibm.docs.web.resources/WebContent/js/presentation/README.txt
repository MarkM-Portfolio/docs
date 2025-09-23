=== CODE FORMATTER ===
	* please use pref-js-formatter.xml in eclipse javascript editor formatter. 
	* use Ctrl+Shift+F to format your javascript code.
	
=== RUN UT ===
	* http://localhost:9080/docs/static/js/presentation/test/ut/runner_model.html
	* http://localhost:9080/docs/static/js/presentation/test/ut/runner_edit_engine.html

=== API TEST ===
	* http://localhost:9080/docs/static/js/concord/tests/jasmine_api_runner.html?group=delete_slide&testFiles=tt2.odp
	* http://localhost:9080/docs/static/js/concord/tests/jasmine_api_runner.html?group=perf_go_through&testFiles=cbc4.odp

=== HOW TO DEBUG ===
	* Append "pv=2" in the URL to use the new version of presentation.
	* pv=1 points to the old version

=== CODE STRUCTURE ===
	* Basically all client side changes are located in /js/presentation directory.
	* Some css, images files are copied from its old place.

=== Model ===
	* Currently our model is a simple JSON model, and can be parsed in Client Slide or Server Side(default)
	* PresentationDocumentService.java & Html2Json.java will parse the html into json in server side.
	* pres.model.documentParser will parse html into json in Client Side.
	* You can change to use client side parsing in Scene.js::staged, update its criteria to use format: html
	* For partial load, please refer to pres.loader.PartialLoader, you can also update its criteria to use format: html
	* When in partial loading, the app will make a transparent cover on everything blocks user actions.
	
	== pres.model.Document (id/slides/styles/customValues/listBeforeStyles)
	
	* one instance only: pres.scene.doc
	
	* listBeforeStyles is a map with id as a key
	* for example: "body_id_1839e0d87ab9043": "font-size:1.77em !important;font-family:Arial !important;"
	* hub will listen to its change, and refresh css in the header "#body_id_1839e0d87ab9043:before : font-size:1.77em"
	
	* customValues is also a map, its value is also a map
	* for example : {"ML_New_25_20Presentation_outline_1": {abs-list-margin-left: "692", abs-min-label-width: "692"}}
	
	== pres.model.Slide (id/wrapperId/w/h/elements/meta) (meta is the attributes in Slide node)
	== pres.model.Element (id/content/isNotes/w/h/l/t/z/meta/family) (content is the inner html of the element, family is the content type)
	
	
=== Data Flow ===
	* pres.Scene is the root entrance, it will load data and initialize the pres.Hub to be a master controller.
	* pres.Scene will handle lock information, send data loaded event to Sorter.
	* The whole UI layout is very simple
		--------------------------------
		|			Banner     		    |
		--------------------------------
		|			Menubar	   		    |
		---------------------------------
		|  			Toolbar    	    	|
		---------------------------------
		| Sorter| SlideEditor  | Sidebar |
		|       | NotesEditor  |         |
		---------------------------------
	* Please note  'pres.widget.Editor = SlideEditor + NotesEditor'
	* When window resize, the app will take all parts into consideration, resize it correctly.
	
=== Sorter & Thumbnail ===
 	* Sorter listen to /data/loaded event to build the thumbnail widget in it.
 	* (1) Manager the selection, send /sorter/selection event out.
 	* (2) Build dnd function for re-order, and move slides.
 	* (3) Construct the context menu
 	* (4) Swap in/out capability
 	* (5) Delete slides
 	* Sorter is not more than a UI, every action like move/delete will send event out like "/sorter/to/delete", 
 and hub will listen to that, and dispatch to SlideOptHandler to deal with it, update model, send co-edit message.
 	* Sorter will also listen model's change, do its own UI update if necessary, like "/slide/deleted"
 
=== Editor ===
	* Editor listen to "/thumbnail/selected" to initial its UI both for SlideEditor and NotesEditor.
	* SlideEditor listen to mouse/key event and model change events to update itself.
	* SlideEditor will widgetilize all contentbox with pres.editor.Box class.
	 
=== Box ===
	* Each box have 3 status, IDLE(0), SELECTED(1), EDITING(2)
	* When user click the inside of box, it will goto EDITING status, the domNode of this box will become contentEditable
	
=== The commands system, MenuBar & Toolbar ===
	* All context menu, menubar and toolbar shares one Commands model (pe.scene.hub.commandsModel)
	* Menu, toolbar is inited through the config file located in /js/presentation/config.
	* You can enable, disable some items in the commands model, and the UI either in context menu or menubar or toolbar will get notified.
	* All click on menu/toolbar goes to CommandHandler to process.
	
=== Message publish/receive ===
	* There are mainly 2 classes, pres.msg.Publisher and pres.msg.Receiver.
	* It was splitted into many parts, like PublisherSlideShow, PublisherAttr, each file cover a part of the whole class.
	* pe.scene.msgPublisher is the only one instance of pres.msg.Publisher, you should use it for all msg sending.
	* pe.scene.msgReceiver is the only one instance of pres.msg.Receiver, you should use it for all msg sending.

=== Slide Show ===
	* Basically Side Show does not change code from old stream.
	
=== Copy paste rule ===
	* for copy objects <div class="draw_frame"></div>
		(1)the copy html data in system clipboard will be:
			<div class="presCopyPaste" _docUUID="(current document file name)" id="">
				<div class="draw_frame"></div>
				<div class="draw_frame"></div>
				... ...
			</div>
		(2)the copy json data in local storage will be:
		    {
		    	id : xxx,
				_docUUID: docUUId,
				_copyType: "copyObjects", //copy 1 or more objects on slides
				arr: [element, element, ....]
			}
	* for copy slides <div class="draw_page"></div>
		(1)the copy html data in system clipboard will be:
		(2)the copy json data in local storage will be:
		
	* the paste rule
		Step1: get system clipboard html data, justify the class="presCopyPaste"
			(1) if have, it's copied from presentation file, then get the json data fro local storage and then paste according to _copyType;
			(2) if not have, it's copied from outer application, then paste as from external;
		Step2: parser data and then paste accordingly
			(1) if copied from presentation file, then get the attribute _docUUID, if same with current, 
			then paste internal same pres file, else paste from external presentation file;(here need to investigate whether need to separate the 2 process)
			(2) if paste from exteranl app, need to fix the paste data, and then insert into current file
	
	* ut case: pres.test.ut.utils.ut_copypasteutil