/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

CKEDITOR.plugins.setLang( 'task', 'ja',{
	task :
	{
	   titleAssign:'セクションの割り当て',
	   creatingTaskAsTODO:'処理中です... 割り当てを、[アクティビティ] アプリケーションで To Do 項目として作成しています',
	   updatingTask:'処理中です... 割り当てを、[アクティビティ] アプリケーションで更新しています',
	   creatingFragment: '処理中です... この選択内容について非公開文書を作成しています',
	   updatingMaster: '処理中です... このセクションをメイン文書内で更新しています',
	   cannotAccessActivity:'割り当てを記録するために [アクティビティ] にアクセスできません..',
	   notMemberofActivity: '割り当てを記録するために [アクティビティ] にアクセスできません。このアクティビティのメンバでない可能性があります',
	   taskAlreadyRemoved:'この文書のタスクが削除されました',
	   writeSection:'このセクションで実行させるタスクを記述します。',
	   writeSectionDynamicSection:'このセクションで実行させるタスクを記述します。',
	   assignTask:'割り当て',
	   cancelTask:'キャンセル',
	   ctxMenuTask: 'タスク',
	   ctxMenuCreateTask: 'セクションの割り当て',
	   ctxMenuDeleteTask: '削除',
	   ctxMenuHideTask: 'すべて非表示',
	   ctxMenuShowTask: 'すべて表示',
	   dlgTaskDeleteTitle: 'セクションの削除',
	   dlgTaskCreateTitle: 'セクションの割り当て',	    
	   dlgTaskCreateSectionMode: '割り当てられたタスク:',	    
	   dlgTaskCreateWriteSection: 'このセクションに書き込む',	    
	   dlgTaskCreateReviewSection: 'このセクションをレビューする',
	   dlgTaskCreateAssignee: 'セクションを割り当てるユーザー:',
	   dlgTaskCreateDescription: '説明',
	   dlgTaskCreateInValidMessage: 'ユーザーが編集者として定義されていません。<br />まず編集者として定義してユーザーを共有相手としてください。',
	   dlgTaskCreateWarningMessage: 'ユーザーにタスクを割り当てるためには、その前にユーザーを「マイファイル」内の<br />文書の「編集者」として定義する必要があります。',
	   assignmentAlreadyExist:'選択された領域は以前に割り当てられています。',
	   write:'書き込み',
	   writeDesc:'${0} の書き込み: ${1}',
	   review:'レビュー',
	   reviewDesc:'${0} のレビュー: ${1}',
	   reworkDesc:'${0} の再作業: ${1}',
	   writeCompleteDesc: 'セクション ${0} は ${1} によって書き込まれました',
	   reviewCompleteDesc: 'セクション ${0} は ${1} によってレビューされました',
	   workingPrivateDesc: '${0} に対して ${1} が非公開で作業しています',
	   done:'完了',
	   actions: 'アクション',
	   currentUserSectionAssigned:'このセクションに対する ${0} が割り当てられています',
	   workPrivately:'非公開で作業',
	   currentUserWorkingPrivately : 'このセクションに対して、非公開で作業しています',
	   gotoPrivateDocument:'非公開文書へ移動',
	   somebody:'別のユーザー',
	   cannotGetAssigneeName:"割り当てられているユーザーの名前を取得できません。アクティビティのメンバでない可能性があります",
	   userSectionAssigned:'${0} に、このセクションに対する ${1} が割り当てられています',
	   userWorkingPrivately: '${0} は、このセクションに対して非公開で作業しています',
	   emptyDocTitle:'無題のドラフト',
	   changeOverride:'変更内容はタスクの所有者によってオーバーライドされます。',
	   onlyAssignerDeleteTask: '完了としてマークされていないこの割り当てを削除することはできません。割り当てを行ったユーザーだけが削除することができます。',
	   actionBtnEdit:'割り当ての編集',
	   actionBtnRemove:'割り当ての削除',
	   actionBtnAbout:'このセクションについて',
	   actionBtnMarkComplete:'完了としてマーク',
	   actionBtnWorkPrivately:'非公開で作業',
	   actionBtnApprove:'このセクションを承認',
	   actionBtnGotoPrivate:'非公開文書へ移動',
	   actionBtnRework:'再作業が必要'
	}
});
