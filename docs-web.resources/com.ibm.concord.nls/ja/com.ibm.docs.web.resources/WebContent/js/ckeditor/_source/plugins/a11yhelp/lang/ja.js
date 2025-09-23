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
		title : "アクセス支援機能の使用方法",
		contents : "ヘルプ・コンテンツ。このダイアログを閉じるには ESC キーを押します。",
		legend :
		[
			{
				name : "一般",
				items :
				[
					{
						name : "エディターのツールバー",
						legend:
							"${toolbarFocus} を押すと、ツールバーに移動します。" +
							"次のツールバー・グループに移動するには TAB キーを使用し、前のツールバー・グループに移動するには SHIFT+TAB キーを使用します。" +
							"次のツールバー・ボタンに移動するには 右矢印キーを使用し、前のツールバー・ボタンに移動するには左矢印キーを使用します。" +
							"SPACE キーまたは ENTER キーを押すと、ツールバー・ボタンがアクティブになります。"
					},

					{
						name : "エディターのダイアログ",
						legend :
							"ダイアログの中で TAB キーを押すと、次のダイアログ・フィールドに移動し、SHIFT+TAB キーを押すと、前のフィールドに移動します。ダイアログを送信するには、ENTER キーを押します。ダイアログをキャンセルするには、ESC キーを押します。" +
							"複数のタブ・ページがあるダイアログで ALT+F10 キーを押すと、タブ・リストに移動します。" +
							"次のタブに移動するには、TAB キーまたは右矢印キーを使用します。" +
							"前のタブに移動するには、SHIFT+TAB キーまたは左矢印キーを使用します。" +
							"タブ・ページを選択するには、SPACE キーまたは ENTER キーを押します。"
					},

					{
						name : "エディターのコンテキスト・メニュー",
						legend :
							"${contextMenu} またはアプリケーション・キーを押すと、コンテキスト・メニューが開きます。" +
							"次のメニュー・オプションに移動するには、TAB キーまたは下矢印キーを使用します。" +
							"前のオプションに移動するには、SHIFT+TAB キーまたは上矢印キーを使用します。" +
							"メニュー・オプションを選択するには、SPACE キーまたは ENTER キーを押します。" +
							"現在のオプションのサブメニューを開くには、SPACE キーまたは ENTER キーまたは右矢印キーを使用します。" +
							"親メニュー項目に戻るには、ESC キーまたは左矢印キーを使用します。" +
							"コンテキスト・メニューを閉じるには、ESC キーを使用します。"
					},

					{
						name : "エディターのリスト・ボックス",
						legend :
							"リスト・ボックスの中で次のリスト項目に移動するには、TAB キーまたは下矢印キーを使用します。" +
							"前のリスト項目に移動するには、SHIFT+TAB キーまたは上矢印キーを使用します。" +
							"リスト・オプションを選択するには、SPACE キーまたは ENTER キーを押します。" +
							"リスト・ボックスを閉じるには、ESC キーを押します。"
					},

					{
						name : "エディターのエレメント・パス・バー (使用可能な場合*)",
						legend :
							"${elementsPathFocus} を押すと、エレメント・パス・バーに移動します。" +
							"次のエレメント・ボタンに移動するには、TAB キーまたは右矢印キーを使用します。" +
							"前のボタンに移動するには、SHIFT+TAB キーまたは左矢印キーを使用します。" +
							"エディター内のエレメントを選択するには、SPACE キーまたは ENTER キーを押します。"
					}
				]
			},
			{
				name : "コマンド",
				items :
				[
					{
						name : " 取り消しコマンド",
						legend : "${undo} を押します"
					},
					{
						name : " やり直しコマンド",
						legend : "${redo} を押します"
					},
					{
						name : " 太字コマンド",
						legend : "${bold} を押します"
					},
					{
						name : " イタリック・コマンド",
						legend : "${italic} を押します"
					},
					{
						name : " 下線コマンド",
						legend : "${underline} を押します"
					},
					{
						name : " リンク・コマンド",
						legend : "${link} を押します"
					},
					{
						name : "ツールバー省略表示コマンド (使用可能な場合*)",
						legend : "${toolbarCollapse} を押します"
					},
					{
						name : " アクセス支援機能のヘルプ",
						legend : "${a11yHelp} を押します"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "注",
						legend : "* 管理者により、一部の機能が使用不可に設定されている可能性があります。"
					}
				]
			}
		]
	}

});
