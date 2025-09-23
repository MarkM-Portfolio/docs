/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "เอดิเตอร์แบบ Rich text, %1.",

	// ARIA descriptions.
	toolbars	: "แถบเครื่องมือเอดิเตอร์",
	editor	: "เอดิเตอร์แบบ Rich Text",

	// Toolbar buttons without dialogs.
	source			: "ซอร์ส",
	newPage			: "สร้างหน้า",
	save			: "บันทึก",
	preview			: "แสดงตัวอย่าง:",
	cut				: "ตัด",
	copy			: "คัดลอก",
	paste			: "วาง",
	print			: "พิมพ์",
	underline		: "ขีดเส้นใต้",
	bold			: "ตัวหนา",
	italic			: "ตัวเอียง",
	selectAll		: "เลือกทั้งหมด",
	removeFormat	: "ลบรูปแบบ",
	strike			: "ขีดฆ่า",
	subscript		: "ตัวห้อย",
	superscript		: "ตัวยก",
	horizontalrule	: "แทรกเส้นแนวนอน",
	pagebreak		: "แทรกเส้นกั้นหน้า",
	pagebreakAlt		: "เส้นกั้นหน้า",
	unlink			: "ลบลิงก์",
	undo			: "เลิกทำ",
	redo			: "ทำซ้ำ",

	// Common messages and labels.
	common :
	{
		browseServer	: "เบราว์เซอร์เซิร์ฟเวอร์:",
		url				: "URL:",
		protocol		: "โปรโตคอล:",
		upload			: "อัพโหลด:",
		uploadSubmit	: "ส่งไปยังเซิร์ฟเวอร์",
		image			: "แทรกอิมเมจ",
		flash			: "แทรก Flash Movie",
		form			: "แทรกแบบฟอร์ม",
		checkbox		: "แทรกเช็กบ็อกซ์",
		radio			: "แทรกปุ่มวิทยุ",
		textField		: "แทรกฟิลด์ข้อความ",
		textarea		: "แทรกพื้นที่ข้อความ",
		hiddenField		: "แทรกฟิลด์ที่ซ่อน",
		button			: "แทรกปุ่ม",
		select			: "แทรกฟิลด์การเลือก",
		imageButton		: "แทรกปุ่มอิมเมจ",
		notSet			: "<not set>",
		id				: "ไอดี:",
		name			: "ชื่อ:",
		langDir			: "ทิศทางของข้อความ:",
		langDirLtr		: "ซ้ายไปขวา",
		langDirRtl		: "ขวาไปซ้าย",
		langCode		: "โค้ดภาษา:",
		longDescr		: "URL คำอธิบายแบบยาว:",
		cssClass		: "คลาสสไตล์ชีต:",
		advisoryTitle	: "หัวเรื่องการให้คำปรึกษา:",
		cssStyle		: "สไตล์:",
		ok				: "ตกลง",
		cancel			: "ยกเลิก",
		close : "ปิด",
		preview			: "แสดงตัวอย่าง:",
		generalTab		: "ทั่วไป",
		advancedTab		: "ระดับสูง",
		validateNumberFailed	: "ค่านี้ไม่ใช่ตัวเลข",
		confirmNewPage	: "การเปลี่ยนแปลงที่ไม่ได้บันทึกไว้ใดๆ กับเนื้อหานี้จะสูญหาย คุณแน่ใจว่าต้องการโหลดหน้าใหม่หรือไม่?",
		confirmCancel	: "บางอ็อพชันมีการเปลี่ยนแปลง คุณแน่ใจว่าต้องการปิดไดอะล็อกหรือไม่?",
		options : "อ็อพชัน",
		target			: "เป้าหมาย:",
		targetNew		: "หน้าต่างใหม่ (_blank)",
		targetTop		: "หน้าต่างที่อยู่บนสุด (_top)",
		targetSelf		: "หน้าต่างเดียวกัน (_self)",
		targetParent	: "หน้าต่างหลัก (_parent)",
		langDirLTR		: "ซ้ายไปขวา",
		langDirRTL		: "ขวาไปซ้าย",
		styles			: "สไตล์:",
		cssClasses		: "คลาสสไตล์ชีต:",
		width			: "ความกว้าง:",
		height			: "ความสูง:",
		align			: "จัดตำแหน่ง:",
		alignLeft		: "ซ้าย",
		alignRight		: "ขวา",
		alignCenter		: "กึ่งกลาง",
		alignTop		: "ด้านบน",
		alignMiddle		: "กึ่งกลาง",
		alignBottom		: "ด้านล่าง",
		invalidHeight	: "ความสูงต้องเป็นเลขจำนวนเต็มบวก",
		invalidWidth	: "ความกว้างต้องเป็นเลขจำนวนเต็มบวก",
		invalidCssLength	: "ค่าที่ระบุสำหรับฟิลด์ '%1' ต้องเป็นเลขบวกที่มีหรือไม่มีหน่วยวัด CSS ที่ถูกต้อง (px, %, in, cm, mm, em, ex, pt หรือ pc)",
		invalidHtmlLength	: "ค่าที่ระบุสำหรับฟิลด์ '%1' ต้องเป็นเลขบวกที่มีหรือไม่มีหน่วยวัด HTML ที่ถูกต้อง (px หรือ %)",
		invalidInlineStyle	: "ค่าที่ระบุสำหรับลักษณะอินไลน์ต้องประกอบด้วย tuples หนึ่งรายการขึ้นไปที่มีรูปแบบ \"name : value\" และแบ่งแยกด้วยเครื่องหมายอัฒภาค",
		cssLengthTooltip	: "ป้อนตัวเลขสำหรับค่าในหน่วยพิกเซล หรือตัวเลขที่มีหน่วย CSS ที่ถูกต้อง (px, %, in, cm, mm, em, ex, pt หรือ pc)",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\"> ไม่พร้อมใช้งาน</span>"
	},

	contextmenu :
	{
		options : "อ็อพชันเมนูบริบท"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "แทรกอักขระพิเศษ",
		title		: "อักขระพิเศษ",
		options : "อ็อพชันอักขระพิเศษ"
	},

	// Link dialog.
	link :
	{
		toolbar		: "ลิงก์ URL",
		other 		: "<other>",
		menu		: "แก้ไขลิงก์...",
		title		: "ลิงก์",
		info		: "ข้อมูลลิงก์",
		target		: "เป้าหมาย",
		upload		: "อัพโหลด:",
		advanced	: "ระดับสูง",
		type		: "ชนิดลิงก์:",
		toUrl		: "URL",
		toAnchor	: "ลิงก์ไปยังตัวยึดในข้อความ",
		toEmail		: "อีเมล",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "ชื่อเฟรมเป้าหมาย:",
		targetPopupName	: "ชื่อหน้าต่างป็อปอัพ:",
		popupFeatures	: "คุณลักษณะของหน้าต่างป็อปอัพ:",
		popupResizable	: "สามารถปรับขนาดได้",
		popupStatusBar	: "แถบสถานะ",
		popupLocationBar	: "แถบตำแหน่ง",
		popupToolbar	: "แถบเครื่องมือ",
		popupMenuBar	: "แถบเมนู",
		popupFullScreen	: "เต็มหน้าจอ (IE)",
		popupScrollBars	: "แถบเลื่อน",
		popupDependent	: "ความพึ่งพา (Netscape)",
		popupLeft		: "ตำแหน่งซ้าย",
		popupTop		: "ตำแหน่งบน",
		id				: "ไอดี:",
		langDir			: "ทิศทางของข้อความ:",
		langDirLTR		: "ซ้ายไปขวา",
		langDirRTL		: "ขวาไปซ้าย",
		acccessKey		: "คีย์การเข้าถึง:",
		name			: "ชื่อ:",
		langCode		: "โค้ดภาษา:",
		tabIndex		: "ดัชนีแท็บ:",
		advisoryTitle	: "หัวเรื่องการให้คำปรึกษา:",
		advisoryContentType	: "ชนิดเนื้อหาของการให้คำปรึกษา:",
		cssClasses		: "คลาสสไตล์ชีต:",
		charset			: "ชุดอักขระรีซอร์สที่ลิงก์:",
		styles			: "สไตล์:",
		rel			: "ความสัมพันธ์",
		selectAnchor	: "เลือกตัวยึด",
		anchorName		: "ตามชื่อตัวยึด",
		anchorId		: "ตาม Id อิลิเมนต์",
		emailAddress	: "อีเมลแอดเดรส",
		emailSubject	: "หัวเรื่องข้อความ",
		emailBody		: "เนื้อความ",
		noAnchors		: "ไม่มีบุ๊กมาร์กให้ใช้งานในเอกสาร คลิกไอคอน 'แทรกบุ๊กมาร์กเอกสาร' บนแถบเครื่องมือเพื่อเพิ่มบุ๊กมาร์ก",
		noUrl			: "โปรดพิมพ์ URL ลิงก์",
		noEmail			: "โปรดพิมพ์อีเมลแอดเดรส"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "แทรกบุ๊กมาร์กเอกสาร",
		menu		: "แก้ไขบุ๊กมาร์กเอกสาร",
		title		: "บุ๊กมาร์กเอกสาร",
		name		: "ชื่อ:",
		errorName	: "โปรดป้อนชื่อของบุ๊กมาร์กเอกสาร",
		remove		: "ลบบุ๊กมาร์กเอกสาร"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "คุณสมบัติรายการที่มีหมายเลขลำดับ",
		bulletedTitle		: "คุณสมบัติรายการที่มีจุดนำ",
		type				: "ประเภท",
		start				: "เริ่มต้น",
		validateStartNumber				:"ตัวเลขเริ่มต้นของรายการต้องเป็นเลขจำนวนเต็ม",
		circle				: "วงกลม",
		disc				: "ดิสก์",
		square				: "สี่เหลี่ยม",
		none				: "ไม่มี",
		notset				: "<not set>",
		armenian			: "การกำหนดหมายเลขภาษาอาร์เมเนีย",
		georgian			: "การกำหนดหมายเลขภาษาจอร์เจีย (an, ban, gan เป็นต้น)",
		lowerRoman			: "โรมันตัวเล็ก (i, ii, iii, iv, v เป็นต้น)",
		upperRoman			: "โรมันตัวใหญ่ (I, II, III, IV, V เป็นต้น)",
		lowerAlpha			: "อัลฟาตัวเล็ก (a, b, c, d, e เป็นต้น)",
		upperAlpha			: "อัลฟาตัวใหญ่ (A, B, C, D, E เป็นต้น)",
		lowerGreek			: "กรีกตัวเล็ก (alpha, beta, gamma เป็นต้น)",
		decimal				: "ฐานสิบ (1, 2, 3 เป็นต้น)",
		decimalLeadingZero	: "ศูนย์นำฐานสิบ (01, 02, 03 เป็นต้น)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "ค้นหาและแทนที่",
		find				: "ค้นหา",
		replace				: "แทนที่",
		findWhat			: "ค้นหา:",
		replaceWith			: "แทนที่ด้วย:",
		notFoundMsg			: "ไม่พบข้อความที่ระบุ",
		noFindVal			: 'จำเป็นต้องมีข้อความที่จะค้นหา',
		findOptions			: "อ็อพชันการค้นหา",
		matchCase			: "ตรงกับขนาดตัวพิมพ์",
		matchWord			: "ตรงกับคำทั้งหมด",
		matchCyclic			: "ตรงกับ cyclic",
		replaceAll			: "แทนที่ทั้งหมด",
		replaceSuccessMsg	: "%1 ที่เกิดการแทนที่"
	},

	// Table Dialog
	table :
	{
		toolbar		: "แทรกตาราง",
		title		: "ตาราง",
		menu		: "คุณสมบัติตาราง",
		deleteTable	: "ลบตาราง",
		rows		: "แถว:",
		columns		: "คอลัมน์:",
		border		: "ขนาดขอบ:",
		widthPx		: "พิกเซล",
		widthPc		: "เปอร์เซนต์",
		widthUnit	: "หน่วยวัดความกว้าง:",
		cellSpace	: "ช่องว่างระหว่างเซลล์:",
		cellPad		: "การเสริมระหว่างเซลล์:",
		caption		: "คำบรรยายภาพ:",
		summary		: "สรุป:",
		headers		: "ส่วนหัว:",
		headersNone		: "ไม่มี",
		headersColumn	: "คอลัมน์แรก",
		headersRow		: "แถวแรก",
		headersBoth		: "ทั้งสอง",
		invalidRows		: "จำนวนแถวต้องเป็นเลขจำนวนเต็มที่มากกว่าศูนย์",
		invalidCols		: "จำนวนคอลัมน์ต้องเป็นเลขจำนวนเต็มที่มากกว่าศูนย์",
		invalidBorder	: "ขนาดของขอบต้องเป็นตัวเลขบวก",
		invalidWidth	: "ความกว้างของตารางต้องเป็นตัวเลขบวก",
		invalidHeight	: "ความสูงของตารางต้องเป็นตัวเลขบวก",
		invalidCellSpacing	: "ช่องว่างระหว่างเซลล์ต้องเป็นตัวเลขบวก",
		invalidCellPadding	: "การเสริมระหว่างเซลล์ต้องเป็นตัวเลขบวก",

		cell :
		{
			menu			: "เซลล์",
			insertBefore	: "แทรกเซลล์ก่อน",
			insertAfter		: "แทรกเซลล์หลัง",
			deleteCell		: "ลบเซลล์",
			merge			: "ผสานเซลล์",
			mergeRight		: "ผสานด้านขวา",
			mergeDown		: "ผสานด้านล่าง",
			splitHorizontal	: "แบ่งเซลล์ในแนวนอน",
			splitVertical	: "แบ่งเซลล์ในแนวตั้ง",
			title			: "คุณสมบัติเซลล์",
			cellType		: "ชนิดของเซลล์:",
			rowSpan			: "การขยายแถว:",
			colSpan			: "การขยายคอลัมน์:",
			wordWrap		: "การตัดคำ:",
			hAlign			: "การจัดวางในแนวนอน:",
			vAlign			: "การจัดวางในแนวตั้ง:",
			alignBaseline	: "เส้นบรรทัด",
			bgColor			: "สีพื้นหลัง:",
			borderColor		: "สีเส้นขอบ:",
			data			: "ข้อมูล",
			header			: "ส่วนหัว",
			yes				: "ใช่",
			no				: "ไม่ใช่",
			invalidWidth	: "ความกว้างของเซลล์ต้องเป็นตัวเลขบวก",
			invalidHeight	: "ความสูงของเซลล์ต้องเป็นตัวเลขบวก",
			invalidRowSpan	: "การขยายแถวต้องเป็นเลขจำนวนเต็มบวก",
			invalidColSpan	: "การขยายคอลัมน์ต้องเป็นเลขจำนวนเต็มบวก",
			chooseColor : "เลือก"
		},

		row :
		{
			menu			: "แถว",
			insertBefore	: "แทรกแถวก่อน",
			insertAfter		: "แทรกแถวหลัง",
			deleteRow		: "ลบแถว"
		},

		column :
		{
			menu			: "คอลัมน์",
			insertBefore	: "แทรกคอลัมน์ก่อน",
			insertAfter		: "แทรกคอลัมน์หลัง",
			deleteColumn	: "ลบคอลัมน์"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "คุณสมบัติปุ่ม",
		text		: "ข้อความ (ค่า):",
		type		: "ประเภท:",
		typeBtn		: "ปุ่ม",
		typeSbm		: "ส่ง",
		typeRst		: "รีเซ็ต"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "คุณสมบัติเช็กบ็อกซ์",
		radioTitle	: "คุณสมบัติปุ่มวิทยุ",
		value		: "ค่า:",
		selected	: "เลือกแล้ว"
	},

	// Form Dialog.
	form :
	{
		title		: "แทรกแบบฟอร์ม",
		menu		: "คุณสมบัติแบบฟอร์ม",
		action		: "แอ็คชัน:",
		method		: "เมธอด:",
		encoding	: "การเข้ารหัส:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "เลือกคุณสมบัติฟิลด์",
		selectInfo	: "เลือกข้อมูล",
		opAvail		: "อ็อพชันที่มีอยู่",
		value		: "ค่า:",
		size		: "ขนาด:",
		lines		: "บรรทัด",
		chkMulti	: "อนุญาตให้เลือกหลายตำแหน่ง",
		opText		: "ข้อความ:",
		opValue		: "ค่า:",
		btnAdd		: "เพิ่ม",
		btnModify	: "แก้ไข",
		btnUp		: "ขึ้น",
		btnDown		: "ลง",
		btnSetValue : "ตั้งค่าเป็นค่าที่เลือกไว้",
		btnDelete	: "ลบ"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "คุณสมบัติพื้นที่ข้อความ",
		cols		: "คอลัมน์:",
		rows		: "แถว:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "คุณสมบัติฟิลด์ข้อความ",
		name		: "ชื่อ:",
		value		: "ค่า:",
		charWidth	: "ความกว้างของอักขระ:",
		maxChars	: "อักขระสูงสุด:",
		type		: "ประเภท:",
		typeText	: "ข้อความ",
		typePass	: "รหัสผ่าน"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "คุณสมบัติฟิลด์ที่ซ่อนไว้",
		name	: "ชื่อ:",
		value	: "ค่า:"
	},

	// Image Dialog.
	image :
	{
		title		: "อิมเมจ",
		titleButton	: "คุณสมบัติปุ่มอิมเมจ",
		menu		: "คุณสมบัติอิมเมจ...",
		infoTab	: "ข้อมูลอิมเมจ",
		btnUpload	: "ส่งไปยังเซิร์ฟเวอร์",
		upload	: "อัพโหลด",
		alt		: "ข้อความอื่น:",
		lockRatio	: "อัตราส่วนการล็อค",
		resetSize	: "รีเซ็ตขนาด",
		border	: "เส้นขอบ:",
		hSpace	: "ช่องว่างในแนวนอน:",
		vSpace	: "ช่องว่างในแนวตั้ง:",
		alertUrl	: "โปรดพิมพ์ URL ของอิมเมจ",
		linkTab	: "ลิงก์",
		button2Img	: "คุณต้องการแปลงสภาพปุ่มอิมเมจที่เลือกไว้ไปเป็นอิมเมจปกติหรือไม่?",
		img2Button	: "คุณต้องการแปลงสภาพอิมเมจที่เลือกไว้ไปเป็นปุ่มอิมเมจหรือไม่?",
		urlMissing : "URL ต้นทางของอิมเมจหายไป",
		validateBorder : "เส้นขอบต้องเป็นเลขจำนวนเต็มบวก",
		validateHSpace : "ช่องว่างในแนวนอนต้องเป็นเลขจำนวนเต็มบวก",
		validateVSpace : "ช่องว่างในแนวตั้งต้องเป็นเลขจำนวนเต็มบวก"
	},

	// Flash Dialog
	flash :
	{
		properties		: "คุณสมบัติแฟลช",
		propertiesTab	: "คุณสมบัติ",
		title		: "แฟลช",
		chkPlay		: "เล่นอัตโนมัติ",
		chkLoop		: "วนซ้ำ",
		chkMenu		: "เปิดใช้งานเมนูแฟลช",
		chkFull		: "อนุญาตให้ใช้แบบเต็มหน้าจอ",
 		scale		: "มาตราส่วน",
		scaleAll		: "แสดงทั้งหมด",
		scaleNoBorder	: "ไม่มีเส้นขอบ",
		scaleFit		: "พอดี",
		access			: "การเข้าถึงสคริปต์:",
		accessAlways	: "เสมอ",
		accessSameDomain	: "โดเมนเดียวกัน",
		accessNever	: "ไม่เคย",
		alignAbsBottom: "Abs ด้านล่าง",
		alignAbsMiddle: "Abs กึ่งกลาง",
		alignBaseline	: "เส้นบรรทัด",
		alignTextTop	: "ข้อความด้านบน",
		quality		: "คุณภาพ:",
		qualityBest	: "ดีที่สุด",
		qualityHigh	: "สูง",
		qualityAutoHigh	: "สูงแบบอัตโนมัติ",
		qualityMedium	: "กลาง",
		qualityAutoLow	: "ต่ำแบบอัตโนมัติ",
		qualityLow	: "ต่ำ",
		windowModeWindow	: "หน้าต่าง",
		windowModeOpaque	: "ทึบแสง",
		windowModeTransparent	: "โปร่งแสง",
		windowMode	: "โหมดหน้าต่าง:",
		flashvars	: "ตัวแปร:",
		bgcolor	: "สีพื้นหลัง:",
		hSpace	: "ช่องว่างในแนวนอน:",
		vSpace	: "ช่องว่างในแนวตั้ง:",
		validateSrc : "URL ต้องไม่ว่างเปล่า",
		validateHSpace : "ช่องว่างในแนวนอนต้องเป็นเลขจำนวนเต็มบวก",
		validateVSpace : "ช่องว่างในแนวตั้งต้องเป็นเลขจำนวนเต็มบวก"
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "ตรวจสอบการสะกดคำ",
		title			: "ตรวจสอบการสะกดคำ",
		notAvailable	: "เสียใจ แต่เซอร์วิสไม่พร้อมใช้งานในเวลานี้",
		errorLoading	: "เกิดข้อผิดพลาดในการโหลดแอ็พพลิเคชันโฮสต์เซอร์วิส: %s",
		notInDic		: "ไม่ได้อยู่ในพจนานุกรม",
		changeTo		: "เปลี่ยนไปเป็น",
		btnIgnore		: "ข้าม",
		btnIgnoreAll	: "ข้ามทั้งหมด",
		btnReplace		: "แทนที่",
		btnReplaceAll	: "แทนที่ทั้งหมด",
		btnUndo			: "เลิกทำ",
		noSuggestions	: "- ไม่มีข้อแนะนำ -",
		progress		: "การตรวจสอบการสะกดคำอยู่ในระหว่างดำเนินการ...",
		noMispell		: "การตรวจสอบการสะกดคำเสร็จสิ้นแล้ว: ไม่พบการสะกดคำผิด",
		noChanges		: "การตรวจสอบการสะกดคำเสร็จสิ้นแล้ว: ไม่มีคำที่เปลี่ยนแปลง",
		oneChange		: "การตรวจสอบการสะกดคำเสร็จสิ้นแล้ว: มีหนึ่งคำที่เปลี่ยนแปลง",
		manyChanges		: "การตรวจสอบการสะกดคำเสร็จสิ้นแล้ว: มี %1 คำที่เปลี่ยนแปลง",
		ieSpellDownload	: "ไม่ได้ติดตั้งการตรวจสอบการสะกดคำไว้ คุณต้องการดาวน์โหลดเดี๋ยวนี้หรือไม่?"
	},

	smiley :
	{
		toolbar	: "แทรกสัญรูปอารมณ์",
		title	: "อารมณ์",
		options : "อ็อพชันสัญรูปอารมณ์"
	},

	elementsPath :
	{
		eleLabel : "พาธอิลิเมนต์",
		eleTitle : "%1 อิลิเมนต์"
	},

	numberedlist : "รายการกำหนดหมายเลข",
	bulletedlist : "รายการสัญลักษณ์แสดงหัวข้อย่อย",
	indent : "เพิ่มการเยื้อง",
	outdent : "ลดการเยื้อง",

	bidi :
	{
		ltr : "ซ้ายไปขวา",
		rtl : "ขวาไปซ้าย",
	},

	justify :
	{
		left : "จัดตำแหน่งชิดซ้าย",
		center : "จัดตำแหน่งกึ่งกลาง",
		right : "จัดตำแหน่งชิดขวา",
		block : "จัดตำแหน่งอย่างเหมาะสม"
	},

	blockquote : "บล็อกเครื่องหมายคำพูด",

	clipboard :
	{
		title		: "วาง",
		cutError	: "ค่าติดตั้งความปลอดภัยของเบราว์เซอร์ของคุณยับยั้งการตัดแบบอัตโนมัติ ให้ใช้ Ctrl+X บนคีย์บอร์ดของคุณแทน",
		copyError	: "ค่าติดตั้งความปลอดภัยของเบราว์เซอร์ของคุณยับยั้งการคัดลอกแบบอัตโนมัติ ให้ใช้ Ctrl+C บนคีย์บอร์ดของคุณแทน",
		pasteMsg	: "กด Ctrl+V (Cmd+V บน MAC) เพื่อวางด้านล่าง",
		securityMsg	: "ความปลอดภัยของเบราว์เซอร์ของคุณป้องกันการวางจากคลิปบอร์ดโดยตรง",
		pasteArea	: "พื้นที่การวาง"
	},

	pastefromword :
	{
		confirmCleanup	: "ข้อความที่คุณต้องการวางดูเหมือนว่าจะคัดลอกมาจาก Word คุณต้องการล้างรูปแบบก่อนวางหรือไม่?",
		toolbar			: "การวางแบบพิเศษ",
		title			: "การวางแบบพิเศษ",
		error			: "เป็นไปไม่ได้ที่จะล้างข้อมูลที่วางเนื่องจากเกิดข้อผิดพลาดภายใน"
	},

	pasteText :
	{
		button	: "วางเป็นข้อความธรรมดา",
		title	: "วางเป็นข้อความธรรมดา"
	},

	templates :
	{
		button 			: "เท็มเพลต",
		title : "เท็มเพลตเนื้อหา",
		options : "อ็อพชันเท็มเพลต",
		insertOption: "แทนที่เนื้อหาจริง",
		selectPromptMsg: "เลือกเท็มเพลตเพื่อเปิดในเอดิเตอร์",
		emptyListMsg : "(ไม่มีเท็มเพลตที่นิยามไว้)"
	},

	showBlocks : "แสดงบล็อก",

	stylesCombo :
	{
		label		: "สไตล์",
		panelTitle 	: "สไตล์",
		panelTitle1	: "สไตล์บล็อก",
		panelTitle2	: "สไตล์อินไลน์",
		panelTitle3	: "สไตล์อ็อบเจ็กต์"
	},

	format :
	{
		label		: "รูปแบบ",
		panelTitle	: "รูปแบบย่อหน้า",

		tag_p		: "ปกติ",
		tag_pre		: "จัดรูปแบบแล้ว",
		tag_address	: "แอดเดรส",
		tag_h1		: "ส่วนหัวที่ 1",
		tag_h2		: "ส่วนหัวที่ 2",
		tag_h3		: "ส่วนหัวที่ 3",
		tag_h4		: "ส่วนหัวที่ 4",
		tag_h5		: "ส่วนหัวที่ 5",
		tag_h6		: "ส่วนหัวที่ 6",
		tag_div		: "ปกติ (DIV)"
	},

	div :
	{
		title				: "สร้างคอนเทนเนอร์ Div",
		toolbar				: "สร้างคอนเทนเนอร์ Div",
		cssClassInputLabel	: "คลาสสไตล์ชีต",
		styleSelectLabel	: "สไตล์",
		IdInputLabel		: "ไอดี",
		languageCodeInputLabel	: " โค้ดภาษา",
		inlineStyleInputLabel	: "สไตล์อินไลน์",
		advisoryTitleInputLabel	: "หัวเรื่องการให้คำปรึกษา",
		langDirLabel		: "ทิศทางของข้อความ",
		langDirLTRLabel		: "ซ้ายไปขวา",
		langDirRTLLabel		: "ขวาไปซ้าย",
		edit				: "แก้ไข Div",
		remove				: "ถอน Div"
  	},

	iframe :
	{
		title		: "คุณสมบัติ IFrame",
		toolbar		: "แทรก IFrame",
		noUrl		: "โปรดพิมพ์ URL ของ iframe",
		scrolling	: "เปิดใช้งานแถบเลื่อน",
		border		: "แสดงเส้นขอบของเฟรม"
	},

	font :
	{
		label		: "ฟอนต์",
		voiceLabel	: "ฟอนต์",
		panelTitle	: "ชื่อฟอนต์"
	},

	fontSize :
	{
		label		: "ขนาด",
		voiceLabel	: "ขนาดฟอนต์",
		panelTitle	: "ขนาดฟอนต์"
	},

	colorButton :
	{
		textColorTitle	: "สีข้อความ",
		bgColorTitle	: "สีพื้นหลัง",
		panelTitle		: "สี",
		auto			: "แบบอัตโนมัติ",
		more			: "สีเพิ่มเติม..."
	},

	colors :
	{
		"000" : "สีดำ",
		"800000" : "สีน้ำตาลแดง",
		"8B4513" : "สีน้ำตาลส้ม",
		"2F4F4F" : "สีเทาอมน้ำเงินนวลเข้ม",
		"008080" : "สีเขียวหัวเป็ด",
		"000080" : "นาวี",
		"4B0082" : "สีคราม",
		"696969" : "สีเทาเข้ม",
		"B22222" : "สีแดงอิฐ",
		"A52A2A" : "สีน้ำตาล",
		"DAA520" : "สีทองเหลือง",
		"006400" : "สีเขียวเข้ม",
		"40E0D0" : "สีฟ้าขี้นก",
		"0000CD" : "สีน้ำเงินกลาง",
		"800080" : "สีม่วง",
		"808080" : "สีเทา",
		"F00" : "สีแดง",
		"FF8C00" : "สีส้มเข้ม",
		"FFD700" : "สีทอง",
		"008000" : "สีเขียว",
		"0FF" : "สีฟ้าทะเล",
		"00F" : "สีน้ำเงิน",
		"EE82EE" : "สีม่วง",
		"A9A9A9" : "สีเทาทึบ",
		"FFA07A" : "สีเหลืองอ่อน",
		"FFA500" : "สีส้ม",
		"FFFF00" : "สีเหลือง",
		"00FF00" : "สีเขียวมะนาว",
		"AFEEEE" : "สีฟ้าขี้นกจาง",
		"ADD8E6" : "สีน้ำเงินอ่อน",
		"DDA0DD" : "สีม่วงอ่อน",
		"D3D3D3" : "สีเทาอ่อน",
		"FFF0F5" : "สีนมเย็น",
		"FAEBD7" : "สีเนื้อ",
		"FFFFE0" : "สีเหลืองจาง",
		"F0FFF0" : "สีขาวแกมเขียว",
		"F0FFFF" : "สีฟ้าใส",
		"F0F8FF" : "สีฟ้าจาง",
		"E6E6FA" : "สีช่อม่วง",
		"FFF" : "สีขาว"
	},

	scayt :
	{
		title			: "ตรวจสอบการสะกดคำตามที่คุณพิมพ์",
		opera_title		: "ไม่สนับสนุนโดย Opera",
		enable			: "เปิดใช้งาน SCAYT",
		disable			: "ปิดใช้งาน SCAYT",
		about			: "เกี่ยวกับ SCAYT",
		toggle			: "สลัก SCAYT",
		options			: "อ็อพชัน",
		langs			: "ภาษา",
		moreSuggestions	: "ข้อแนะนำเพิ่มเติม",
		ignore			: "ข้าม",
		ignoreAll		: "ข้ามทั้งหมด",
		addWord			: "เพิ่มคำ",
		emptyDic		: "ชื่อพจนานุกรมไม่ควรว่างเปล่า",

		optionsTab		: "อ็อพชัน",
		allCaps			: "ละเว้นคำที่เป็นตัวพิมพ์ใหญ่ทั้งหมด",
		ignoreDomainNames : "ละเว้นชื่อโดเมน",
		mixedCase		: "ละเว้นคำที่มีตัวพิมพ์ใหญ่และเล็กผสมกัน",
		mixedWithDigits	: "ละเว้นคำที่มีตัวเลข",

		languagesTab	: "ภาษา",

		dictionariesTab	: "พจนานุกรม",
		dic_field_name	: "ชื่อพจนานุกรม",
		dic_create		: "สร้าง",
		dic_restore		: "เรียกคืน",
		dic_delete		: "ลบ",
		dic_rename		: "เปลี่ยนชื่อ",
		dic_info		: "พจนานุกรมผู้ใช้เริ่มต้นถูกเก็บไว้ในคุกกี้ อย่างไรก็ตาม คุกกี้ถูกจำกัดขนาดไว้ เมื่อพจนานุกรมผู้ใช้ขยายขนาดจนถึงจุดที่ไม่สามารถเก็บไว้ในคุกกี้ได้ พจนานุกรมอาจถูกเก็บไว้บนเซิร์ฟเวอร์ของเรา เมื่อต้องการเก็บพจนานุกรมส่วนบุคคลบนเซิร์ฟเวอร์ของเรา คุณควรระบุชื่อสำหรับพจนานุกรมของคุณ ถ้าคุณมีพจนานุกรมที่จัดเก็บไว้แล้ว โปรดพิมพ์ชื่อ และคลิกปุ่ม เรียกคืน",

		aboutTab		: "เกี่ยวกับ"
	},

	about :
	{
		title		: "เกี่ยวกับ CKEditor",
		dlgTitle	: "เกี่ยวกับ CKEditor",
		help	: "ทำเครื่องหมายเลือก $1 สำหรับวิธีใช้",
		userGuide : "คู่มือผู้ใช้ CKEditor",
		moreInfo	: "สำหรับข้อมูลเกี่ยวกับการออกไลเซนส์ โปรดเยี่ยมชมเว็บไซต์ของเรา:",
		copy		: "ลิขสิทธิ์ &copy; $1 สงวนสิทธิ์ทั้งหมด"
	},

	maximize : "ขยายให้ใหญ่สุด",
	minimize : "ย่อขนาดเล็กสุด",

	fakeobjects :
	{
		anchor	: "ตัวยึด",
		flash	: "แฟลชแอนนิเมชัน",
		iframe		: "IFrame",
		hiddenfield	: "ฟิลด์ที่ซ่อนไว้",
		unknown	: "อ็อบเจ็กต์ที่ไม่รู้จัก"
	},

	resize : "ลากเพื่อปรับขนาด",

	colordialog :
	{
		title		: "เลือกสี",
		options	:	"อ็อพชันสี",
		highlight	: "ไฮไลต์",
		selected	: "สีที่เลือก",
		clear		: "เคลียร์"
	},

	toolbarCollapse	: "ยุบแถบเครื่องมือ",
	toolbarExpand	: "ขยายแถบเครื่องมือ",

	toolbarGroups :
	{
		document : "เอกสาร",
		clipboard : "คลิปบอร์ด/ยกเลิก",
		editing : "การแก้ไข",
		forms : "แบบฟอร์ม",
		basicstyles : "ลักษณะพื้นฐาน",
		paragraph : "ย่อหน้า",
		links : "ลิงก์",
		insert : "แทรก",
		styles : "สไตล์",
		colors : "สี",
		tools : "เครื่องมือ"
	},

	bidi :
	{
		ltr : "เปลี่ยนเป็นข้อความแบบซ้ายไปขวา",
		rtl : "เปลี่ยนเป็นข้อความแบบขวาไปซ้าย"
	},

	docprops :
	{
		label : "คุณสมบัติเอกสาร",
		title : "คุณสมบัติเอกสาร",
		design : "การออกแบบ",
		meta : "แท็กเมตา",
		chooseColor : "เลือก",
		other : "อื่นๆ...",
		docTitle :	"หัวเรื่องหน้า",
		charset : 	"การเข้ารหัสชุดอักขระ",
		charsetOther : "การเข้ารหัสชุดอักขระอื่น",
		charsetASCII : "ASCII",
		charsetCE : "ภาษายุโรปกลาง",
		charsetCT : "ภาษาจีนดั้งเดิม (Big5)",
		charsetCR : "ภาษา Cyrillic",
		charsetGR : "ภาษากรีก",
		charsetJP : "ภาษาญี่ปุ่น",
		charsetKR : "ภาษาเกาหลี",
		charsetTR : "ภาษาตุรกี",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "ภาษายุโรปตะวันตก",
		docType : "หัวข้อชนิดเอกสาร",
		docTypeOther : "หัวข้อชนิดเอกสารอื่น",
		xhtmlDec : "รวมการประกาศ XHTML",
		bgColor : "สีพื้นหลัง",
		bgImage : "URL ของอิมเมจพื้นหลัง",
		bgFixed : "พื้นหลังที่ไม่สามารถเลื่อนได้ (คงที่)",
		txtColor : "สีข้อความ",
		margin : "ขอบของหน้า",
		marginTop : "ด้านบน",
		marginLeft : "ซ้าย",
		marginRight : "ขวา",
		marginBottom : "ด้านล่าง",
		metaKeywords : "คีย์เวิร์ดการจัดทำดัชนีเอกสาร (แบ่งแยกด้วยเครื่องหมายจุลภาค)",
		metaDescription : "คำอธิบายเอกสาร",
		metaAuthor : "ผู้เขียน",
		metaCopyright : "ลิขสิทธิ์",
		previewHtml : "<p>นี่คือ <strong>ข้อความตัวอย่าง</strong> บางส่วน คุณกำลังใช้งาน <a href=\"javascript:void(0)\">CKEditor</a></p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "นิ้ว",
			widthCm	: "เซนติเมตร",
			widthMm	: "มิลลิเมตร",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "จุด",
			widthPc	: "picas"
		},
		table :
		{
			heightUnit	: "หน่วยวัดความสูง:",
			insertMultipleRows : "แทรกแถว",
			insertMultipleCols : "แทรกคอลัมน์",
			noOfRows : "จำนวนแถว:",
			noOfCols : "จำนวนคอลัมน์:",
			insertPosition : "ตำแหน่ง:",
			insertBefore : "ก่อนหน้า",
			insertAfter : "หลังจาก",
			selectTable : "เลือกตาราง",
			selectRow : "เลือกแถว",
			columnTitle : "คอลัมน์",
			colProps : "คุณสมบัติคอลัมน์",
			invalidColumnWidth	: "ความกว้างของคอลัมน์ต้องเป็นตัวเลขบวก"
		},
		cell :
		{
			title : "เซลล์"
		},
		emoticon :
		{
			angel		: "นางฟ้า",
			angry		: "โกรธ",
			cool		: "ความทันสมัย",
			crying		: "ร้องไห้",
			eyebrow		: "คิ้ว",
			frown		: "หน้าบึ้ง",
			goofy		: "น่าหัวเราะ",
			grin		: "ยิ้มยิงฟัน",
			half		: "แบ่งรับแบ่งสู้",
			idea		: "แนวคิด",
			laughing	: "หัวเราะ",
			laughroll	: "หัวเราะกลิ้ง",
			no			: "ไม่ใช่",
			oops		: "ประหลาดใจ",
			shy			: "อาย",
			smile		: "ยิ้ม",
			tongue		: "ลิ้น",
			wink		: "ขยิบตา",
			yes			: "ใช่"
		},

		menu :
		{
			link	: "แทรกลิงก์",
			list	: "รายการ",
			paste	: "วาง",
			action	: "แอ็คชัน",
			align	: "จัดตำแหน่ง",
			emoticon: "สัญรูปอารมณ์"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "รายการกำหนดหมายเลข",
			bulletedTitle		: "รายการสัญลักษณ์แสดงหัวข้อย่อย"
		},

		// Anchor dialog
		anchor :
		{
			description	: "พิมพ์ชื่อบุ๊กมาร์กที่สื่อความหมาย เช่น 'ส่วนที่ 1.2' หลังการแทรกบุ๊กมาร์ก คลิกไอคอน 'ลิงก์' หรือ 'ลิงก์บุ๊กมาร์กเอกสาร' เพื่อลิงก์ไปยังบุ๊กมาร์กนั้น",
			title		: "ลิงก์บุ๊กมาร์กเอกสาร",
			linkTo		: "ลิงก์ไปยัง:"
		},

		urllink :
		{
			title : "ลิงก์ URL",
			linkText : "ข้อความลิงก์:",
			selectAnchor: "เลือกตัวยึด:",
			nourl: "โปรดป้อน URL ลงในฟิลด์ข้อความ",
			urlhelp: "พิมพ์หรือวาง URL ที่จะเปิดเมื่อผู้ใช้คลิกลิงก์นี้ ตัวอย่างเช่น  http://www.example.com",
			displaytxthelp: "พิมพ์ข้อความที่จะแสดงสำหรับลิงก์",
			openinnew : "เปิดลิงก์ในหน้าต่างใหม่"
		},

		spellchecker :
		{
			title : "ตรวจสอบการสะกดคำ",
			replace : "แทนที่:",
			suggesstion : "ข้อแนะนำ:",
			withLabel : "ด้วย:",
			replaceButton : "แทนที่",
			replaceallButton:"แทนที่ทั้งหมด",
			skipButton:"ข้าม",
			skipallButton: "ข้ามทั้งหมด",
			undochanges: "เลิกทำการเปลี่ยนแปลง",
			complete: "การตรวจสอบการสะกดคำเสร็จสมบูรณ์",
			problem: "ปัญหาในการดึงข้อมูล XML",
			addDictionary: "เพิ่มในพจนานุกรม",
			editDictionary: "แก้ไขพจนานุกรม"
		},

		status :
		{
			keystrokeForHelp: "กด ALT 0 สำหรับวิธีใช้"
		},

		linkdialog :
		{
			label : "ไดอะล็อกลิงก์"
		},

		image :
		{
			previewText : "ข้อความจะโฟลว์ไปรอบอิมเมจที่คุณกำลังเพิ่มดังเช่นในตัวอย่างนี้"
		}
	}

};
