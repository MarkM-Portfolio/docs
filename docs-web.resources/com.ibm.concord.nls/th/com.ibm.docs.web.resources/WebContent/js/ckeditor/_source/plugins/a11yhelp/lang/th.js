/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

CKEDITOR.plugins.setLang( "a11yhelp", "en",
{

	// When translating all fields in accessibilityHelp object, do not translate anything with the form ${xxx}
	accessibilityHelp :
	{
		title : "คำแนะนำเกี่ยวกับการเข้าถึงได้",
		contents : "เนื้อหาวิธีใช้ เมื่อต้องการปิดไดอะล็อกนี้ ให้กด ESC",
		legend :
		[
			{
				name : "ทั่วไป",
				items :
				[
					{
						name : "แถบเครื่องมือเอดิเตอร์",
						legend:
							"กด ${toolbarFocus} เพื่อนำทางไปยังแถบเครื่องมือ " +
							"ย้ายไปยังกลุ่มแถบเครื่องมือถัดไปและก่อนหน้านี้โดยใช้ TAB และ SHIFT-TAB " +
							"ย้ายไปยังปุ่มแถบเครื่องมือถัดไปและก่อนหน้านี้โดยใช้ RIGHT ARROW หรือ LEFT ARROW " +
							"กด SPACE หรือ ENTER เพื่อเรียกใช้ปุ่มแถบเครื่องมือ"
					},

					{
						name : "ไดอะล็อกเอดิเตอร์",
						legend :
							"ภายในไดอะล็อก กด TAB เพื่อนำทางไปยังฟิลด์ไดอะล็อกถัดไป กด SHIFT + TAB เพื่อย้ายไปยังฟิลด์ก่อนหน้านี้ กด ENTER เพื่อส่งไดอะล็อก กด ESC เพื่อยกเลิกไดอะล็อก " +
							"สำหรับไดอะล็อกที่มีหน้าแท็บหลายหน้า กด ALT + F10 เพื่อนำทางไปยังรายการแท็บ " +
							"จากนั้น ย้ายไปยังแท็บถัดไปโดยใช้ TAB หรือ RIGHT ARROW " +
							"ย้ายไปยังแท็บก่อนหน้านี้โดยใช้ SHIFT + TAB หรือ LEFT ARROW " +
							"กด SPACE หรือ ENTER เพื่อเลือกหน้าแท็บ"
					},

					{
						name : "เมนูบริบทเอดิเตอร์",
						legend :
							"กด ${contextMenu} หรือ APPLICATION KEY เพื่อเปิดเมนูบริบท " +
							"จากนั้น ย้ายไปยังอ็อพชันเมนูถัดไปโดยใช้ TAB หรือ DOWN ARROW " +
							"ย้ายไปยังอ็อพชันก่อนหน้านี้โดยใช้  SHIFT+TAB หรือ UP ARROW " +
							"กด SPACE หรือ ENTER เพื่อเลือกอ็อพชันเมนู " +
							"เปิดเมนูย่อยของอ็อพชันปัจจุบันโดยใช้ SPACE หรือ ENTER หรือ RIGHT ARROW " +
							"ย้อนกลับไปยังไอเท็มเมนูพาเรนต์โดยใช้ ESC หรือ LEFT ARROW " +
							"ปิดเมนูบริบทโดยใช้ ESC"
					},

					{
						name : "บ็อกซ์รายการเอดิเตอร์",
						legend :
							"ภายในบ็อกซ์รายการ ย้ายไปยังไอเท็มรายการถัดไปโดยใช้ TAB หรือ DOWN ARROW " +
							"ย้ายไปยังไอเท็มรายการก่อนหน้านี้โดยใช้ SHIFT + TAB หรือ UP ARROW " +
							"กด SPACE หรือ ENTER เพื่อเลือกอ็อพชันรายการ " +
							"กด ESC เพื่อปิดบ็อกซ์รายการ"
					},

					{
						name : "แถบพาธอิลิเมนต์เอดิเตอร์ (ถ้ามีอยู่*)",
						legend :
							"กด ${elementsPathFocus} เพื่อนำทางไปยังแถบพาธอิลิเมนต์ " +
							"ย้ายไปยังปุ่มอิลิเมนต์ถัดไปโดยใช้ TAB หรือ RIGHT ARROW " +
							"ย้ายไปยังปุ่มก่อนหน้านี้โดยใช้ SHIFT+TAB หรือ LEFT ARROW " +
							"กด SPACE หรือ ENTER เพื่อเลือกอิลิเมนต์ในเอดิเตอร์"
					}
				]
			},
			{
				name : "คำสั่ง",
				items :
				[
					{
						name : "คำสั่งยกเลิก",
						legend : "กด ${undo}"
					},
					{
						name : "คำสั่งทำซ้ำ",
						legend : "กด ${redo}"
					},
					{
						name : "คำสั่งตัวหนา",
						legend : "กด ${bold}"
					},
					{
						name : "คำสั่งตัวเอน",
						legend : "กด ${italic}"
					},
					{
						name : "คำสั่งขีดเส้นใต้",
						legend : "กด ${underline}"
					},
					{
						name : "คำสั่งลิงก์",
						legend : "กด ${link}"
					},
					{
						name : "คำสั่งยุบแถบเครื่องมือ (ถ้ามีอยู่*)",
						legend : "กด ${toolbarCollapse}"
					},
					{
						name : "วิธีใช้การเข้าถึงได้",
						legend : "กด ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "หมายเหตุ",
						legend : "* บางคุณลักษณะสามารถปิดใช้งานโดยผู้ดูแลระบบของคุณ"
					}
				]
			}
		]
	}

});
