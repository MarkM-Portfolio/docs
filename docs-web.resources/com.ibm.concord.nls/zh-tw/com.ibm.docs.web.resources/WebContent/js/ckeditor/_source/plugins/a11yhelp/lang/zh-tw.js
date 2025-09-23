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
		title : "協助工具指示",
		contents : "說明內容。若要關閉此對話框，請按 ESC 鍵。",
		legend :
		[
			{
				name : "一般",
				items :
				[
					{
						name : "編輯器工具列",
						legend:
							"按 ${toolbarFocus} 可導覽至工具列。" +
							"使用 TAB 和 SHIFT-TAB 鍵可移至下一個和上一個工具列群組。" +
							"使用右移鍵或左移鍵可移至下一個或上一個工具列按鈕。" +
							"按空格鍵或 Enter 鍵可啟動工具列按鈕。"
					},

					{
						name : "編輯器對話框",
						legend :
							"在對話框內，按 TAB 鍵可導覽至下一個對話框欄位，按 SHIFT + TAB 鍵可移至上一個欄位，按 ENTER 鍵可提交對話框，按 ESC 鍵可取消對話框。" +
							"如果對話框有多個標籤頁，按 ALT + F10 鍵可導覽至標籤清單。" +
							"接著可使用 TAB 或右移鍵移至下一個標籤。" +
							"使用 SHIFT + TAB 或左移鍵可移至上一個標籤。" +
							"按空格鍵或 Enter 鍵可選取標籤頁。"
					},

					{
						name : "編輯器快速功能表",
						legend :
							"按 ${contextMenu} 或應用程式鍵可開啟快速功能表。" +
							"接著使用 TAB 或下移鍵移至下一個功能表選項。" +
							"使用 SHIFT+TAB 或上移鍵可移至上一個選項。" +
							"按空格鍵或 Enter 鍵可選取功能表選項。" +
							"使用空格鍵、Enter 鍵或右移鍵可開啟現行選項的子功能表。" +
							"使用 ESC 或左移鍵可回到上層功能表項目。" +
							"使用 ESC 鍵可關閉快速功能表。"
					},

					{
						name : "編輯器清單框",
						legend :
							"在清單框內，使用 TAB 或下移鍵可移至下一個清單項目。" +
							"使用 SHIFT + TAB 或上移鍵可移至上一個清單項目。" +
							"按空格鍵或 Enter 鍵可選取清單選項。" +
							"按 Esc 鍵可關閉清單框。"
					},

					{
						name : "編輯器元素路徑列（如果可用*）",
						legend :
							"按 ${elementsPathFocus} 可導覽至元素路徑列。" +
							"使用 TAB 或右移鍵可移至下一個元素按鈕。" +
							"使用 SHIFT+TAB 或左移鍵可移至上一個按鈕。" +
							"按空格鍵或 Enter 鍵可選取編輯器中的元素。"
					}
				]
			},
			{
				name : "指令",
				items :
				[
					{
						name : " 復原指令",
						legend : "按 ${undo}"
					},
					{
						name : " 重做指令",
						legend : "按 ${redo}"
					},
					{
						name : " 粗體指令",
						legend : "按 ${bold}"
					},
					{
						name : " 斜體指令",
						legend : "按 ${italic}"
					},
					{
						name : " 底線指令",
						legend : "按 ${underline}"
					},
					{
						name : " 鏈結指令",
						legend : "按 ${link}"
					},
					{
						name : " 工具列收合指令（如果可用*）",
						legend : "按 ${toolbarCollapse}"
					},
					{
						name : " 協助工具說明",
						legend : "按 ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "附註",
						legend : "* 您的管理者可能會停用某些特性。"
					}
				]
			}
		]
	}

});
