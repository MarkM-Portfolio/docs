dojo.provide("writer.tests.UTcases.table.cellBorder.widget");
dojo.require("dojo.on");
dojo.require("writer.ui.widget.CellBorder");

describe('writer.tests.UTcases.table.cellBorder.widget', function() {

	var loadTestData = function(){
		pe.lotusEditor.execCommand = function(){};
	};

	var widget;

	beforeEach(function() {
		loadTestData();
		widget = new writer.ui.widget.CellBorder();
		jasmine.Clock.useMock();
	});

	afterEach(function() {
		jasmine.Clock.tick(3000);
		widget.destroy();
		widget = null;
	});

	it('widget init', function() {
		widget.focus();
		expect(widget.rangePanel.types).toEqual(["clear", "all", "inner", "horizontal", "vertical", "outer", "left", "top", "right", "bottom"]);
		expect(widget.typePicker.getValue()).toEqual("solid");
		expect(widget.widthPicker.getValue()).toEqual(1);
		expect(widget.colorBtn.getValue()).toEqual("000000");
		expect(widget._currentFocus).toEqual(widget.rangePanel);
		// set disable
		widget.widthPicker.set('disabled',true);
		expect(widget.widthPicker.disabled).toBeTruthy();
		widget.widthPicker.set('disabled',false);
		expect(widget.widthPicker.disabled).toBeFalsy();
	});

	it('Move focus by TAB', function() {
		widget.focus();
		var key = {keyCode:dojo.keys.TAB};
		spyOn(dojo,"stopEvent");
		// TAB
		expect(widget._currentFocus).toEqual(widget.rangePanel);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.widthPicker);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.typePicker);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.colorBtn);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.rangePanel);
		//shift + TAB
		key.shiftKey = true;
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.colorBtn);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.typePicker);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.widthPicker);
		widget._onKeyDown(key);
		expect(widget._currentFocus).toEqual(widget.rangePanel);
	});

	it('Select border range by arrow',function(){
		var rangePanel = widget.rangePanel;
		spyOn(dojo,"stopEvent");
		// up
		var key = {keyCode:dojo.keys.UP_ARROW};
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("outer");
		// shift + up
		key.shiftKey = true;
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("clear");
		// down
		key.shiftKey = false;
		key = {keyCode:dojo.keys.DOWN_ARROW};
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("outer");
		//shift + down
		key.shiftKey = true;
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("clear");
		// left
		key.shiftKey = false;
		key = {keyCode:dojo.keys.LEFT_ARROW};
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("bottom");
		// shift + left
		key.shiftKey = true;
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("clear");
		// right
		key.shiftKey = false;
		key = {keyCode:dojo.keys.RIGHT_ARROW};
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("all");
		// shift + right
		key.shiftKey = true;
		rangePanel._onKeyDown(key);
		expect(rangePanel.get("value")).toEqual("clear");
		//Enter
		spyOn(pe.lotusEditor,"execCommand");
		key = {keyCode:dojo.keys.ENTER};
		rangePanel._onKeyDown(key);
	});

	it('Change border range',function(){
		var rangePanel = widget.rangePanel;
		spyOn(rangePanel,"onChange");
		// click
		spyOn(dojo,"stopEvent");
		rangePanel._onClick(1,null);
		expect(rangePanel.onChange).toHaveBeenCalled();
		// Space
		rangePanel.selectNode(2);
		key = {keyCode:dojo.keys.SPACE};
		rangePanel._onKeyDown(key);
		expect(rangePanel.onChange).toHaveBeenCalled();
	});

	it("border width popup should work well in IE",function() {
		var widthPicker = widget.widthPicker;
		dojo.isIE = true;
		widthPicker.openDropDown();
		dojo.on.emit(widthPicker.dropDown.domNode.parentNode,"scroll",{});
		widthPicker.closeDropDown();
		dojo.isIE = false;
		widthPicker.closeDropDown();
	});

	it('Select border width in popup by keyboard', function() {
		var widthPicker = widget.widthPicker;
		widthPicker.openDropDown();
		spyOn(dojo,"stopEvent");
		spyOn(widthPicker,"onChange");
		var key = {keyCode:dojo.keys.UP_ARROW,
			stopPropagation:function(){}};
		expect(widthPicker.get('value'))
			.toEqual(1);
		// Up
		widthPicker._onInputKeyDown(key);
		expect(widthPicker.get('value'))
			.toEqual(0.75);
		// down
		key.keyCode = dojo.keys.DOWN_ARROW;
		widthPicker._onInputKeyDown(key);
		expect(widthPicker.get('value'))
			.toEqual(1);
		// left
		key.keyCode = dojo.keys.LEFT_ARROW;
		widthPicker._onInputKeyDown(key);
		expect(widthPicker.get('value'))
			.toEqual(1);
		// right
		key.keyCode = dojo.keys.RIGHT_ARROW;
		widthPicker._onInputKeyDown(key);
		expect(widthPicker.get('value'))
			.toEqual(1);
		//ESCAPE
		key.keyCode = dojo.keys.ESCAPE;
		widthPicker._onInputKeyDown(key);

		expect(widthPicker.onChange).not.toHaveBeenCalled();
		//ENTER
		key.keyCode = dojo.keys.ENTER;
		widthPicker._onInputKeyDown(key);
	});
	
	it('Change border width limited',function(){
		var widthPicker = widget.widthPicker;
		widthPicker.set("value",6);
		widthPicker.setLimited(true);
		expect(widthPicker.get("value")).toEqual(3);
	});

	it('Change border width in popup by mouse',function(){
		var widthPicker = widget.widthPicker;
		spyOn(widthPicker,'onChange');
		widthPicker.openDropDown();
		var item = widthPicker.dropDown.getChildren()[2];
		widthPicker._onDropDownMouseDown();
		widthPicker._clickItem(item);
		expect(widthPicker.onChange).toHaveBeenCalled();
		widthPicker.closeDropDown();
	});

	it('Change border width in input box',function(){
		var widthPicker = widget.widthPicker;
		spyOn(widthPicker,'onChange');
		widthPicker.inputNode.value = "3pt";
		widthPicker._onInputChange();
		widthPicker.dropDownClosed();
		expect(widthPicker.onChange).toHaveBeenCalledWith(3);
	});

	it('Change border width in right by keyboard',function(){
		var widthPicker = widget.widthPicker;
		spyOn(dojo,"stopEvent");
		// right
		var key = {keyCode:dojo.keys.RIGHT_ARROW};
		// down is disabled
		// fontSizeDown is disabled
		widthPicker._onButtonKeyDown(key);
		widthPicker.focus("end");
		// fontSizeUp is diabled
		widthPicker.set('value',6);
		widthPicker._onButtonKeyDown(key);
		widthPicker.focus("end");
		expect(widthPicker.fontSizeUpDisabled).toBeTruthy();
		// both up & down is diabled
		widthPicker.fontSizeUpDisabled = true;
		widthPicker.fontSizeDownDisabled = true;
		widthPicker._onButtonKeyDown(key);
		widthPicker.focus("end");
		widthPicker.set('value',3);
		// select button & move back
		key.keyCode = dojo.keys.LEFT_ARROW;
		widthPicker._onUpArrowKeyDown(key);
		widthPicker._onButtonKeyDown(key);
		// down
		key.keyCode = dojo.keys.DOWN_ARROW;
		widthPicker._onUpArrowKeyDown(key);
		// select button & move back
		key.keyCode = dojo.keys.LEFT_ARROW;
		widthPicker._onDownArrowKeyDown(key);
		widthPicker._onButtonKeyDown(key);
		// up
		key.keyCode = dojo.keys.UP_ARROW;
		widthPicker._onDownArrowKeyDown(key);
		spyOn(widthPicker,'onChange');
		key.keyCode = dojo.keys.ENTER;
		// ENTER in up
		dojo.on.emit(widthPicker.fontSizeUpWrapper,"keydown",key);
		expect(widthPicker.onChange).toHaveBeenCalledWith(4.5);		
		// ENTER in down
		dojo.on.emit(widthPicker.fontSizeDownWrapper,"keydown",key);
		expect(widthPicker.onChange).toHaveBeenCalledWith(3);
	});

	it('border width mouse inputs',function(){
		var widthPicker = widget.widthPicker;
		widthPicker.set('value',3);
		spyOn(widthPicker,'onChange');
		dojo.on.emit(widthPicker.fontSizeUpWrapper,"mousedown",{});
		expect(widthPicker.onChange).toHaveBeenCalledWith(4.5);
		dojo.on.emit(widthPicker.fontSizeDownWrapper,"mousedown",{});
		expect(widthPicker.onChange).toHaveBeenCalledWith(3);

		// fontSizeUpDown should stop the default mouse event
		spyOn(dojo,"stopEvent");
		dojo.on.emit(widthPicker.fontSizeUpDown,"mousedown",{});
		expect(dojo.stopEvent).toHaveBeenCalled();
		dojo.on.emit(widthPicker.fontSizeUpDown,"click",{});
		expect(dojo.stopEvent).toHaveBeenCalled();

		// if the widget is opened, it couldn't be click
		widthPicker._opened = true;
		widthPicker.__onClick();
		widthPicker.disabled = true;
		widthPicker._onInputMouseDown({});
		expect(dojo.stopEvent).toHaveBeenCalled();
	});

	it('border type popup should work well in IE',function(){
		var typePicker = widget.typePicker;
		dojo.isIE = true;
		typePicker.openDropDown();
		dojo.on.emit(typePicker.dropDown.domNode.parentNode,"scroll",{});
		typePicker.closeDropDown();
		dojo.isIE = false;
		typePicker.closeDropDown();
	});

	it('Select border type by keyboard',function(){
		var typePicker = widget.typePicker;
		dojo.isIE = true;
		typePicker.openDropDown();
		dojo.isIE = false;
		dojo.on.emit(typePicker.dropDown.domNode.parentNode,"scroll",{});
		typePicker.closeDropDown();
		typePicker.openDropDown();
		spyOn(typePicker,"onChange");
		var buttonNode = typePicker._buttonNode;
		// Left
		var key = {
			keyCode:dojo.keys.LEFT_ARROW
		};
		dojo.on.emit(buttonNode,"keydown",key);
		// Right
		key.keyCode = dojo.keys.RIGHT_ARROW;
		dojo.on.emit(buttonNode,"keydown",key);
		// Up
		key.keyCode = dojo.keys.UP_ARROW;
		dojo.on.emit(buttonNode,"keydown",key);
		// Escape
		key.keyCode = dojo.keys.ESCAPE;
		dojo.on.emit(buttonNode,"keydown",key);
		expect(typePicker.onChange).not.toHaveBeenCalled();

		typePicker.openDropDown();
		// down
		key.keyCode = dojo.keys.DOWN_ARROW;
		dojo.on.emit(buttonNode,"keydown",key);
		// Enter
		key.keyCode = dojo.keys.ENTER;
		dojo.on.emit(buttonNode,"keydown",key);
		expect(typePicker.onChange).toHaveBeenCalled();
	});

	it('Change border type', function() {
		var typePicker = widget.typePicker;
		spyOn(typePicker,"onChange");
		var item = typePicker.dropDown.getChildren()[2];
		typePicker._onMouseDown(item);
		typePicker.dropDownClosed();
		expect(typePicker.onChange).toHaveBeenCalled();
	});

	it('Change color',function(){
		var colorBtn = widget.colorBtn;
		spyOn(colorBtn,"onChange");
		colorBtn.toggleDropDown();
		colorBtn.dropDown._selectedCell = 0;
		colorBtn.dropDown.onChange('autoColor');
		colorBtn.closeDropDown();
		expect(colorBtn.onChange).toHaveBeenCalled();
		colorBtn._color = "auto";
		colorBtn.toggleDropDown();
		colorBtn.dropDown.onChange('#000000');
		expect(colorBtn.get('value')).toEqual('000000');
		colorBtn.closeDropDown();
		colorBtn._color = "undefined color";
		colorBtn.toggleDropDown();
		colorBtn.closeDropDown();
	});
});