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

CKEDITOR.plugins.setLang( 'task', 'ru',{
	task :
	{
	   titleAssign:'Присвоить раздел',
	   creatingTaskAsTODO:'Обработка... Присвоение создается в качестве задачи в приложении Операции',
	   updatingTask:'Обработка... Присвоение обновляется в приложении Операции',
	   creatingFragment: 'Обработка... Для этого раздела создается личный документ',
	   updatingMaster: 'Обработка... Раздел обновляется в основном документе',
	   cannotAccessActivity:'Не удается обратиться к Операциям для записи вашего присвоения..',
	   notMemberofActivity: 'Не удается обратиться к Операциям для записи вашего присвоения. Вы не можете быть участником этой Операции.',
	   taskAlreadyRemoved:'Задача этого документа была удалена',
	   writeSection:'Опишите задачу, которую требуется выполнить с разделом.',
	   writeSectionDynamicSection:'Опишите задачу, которую требуется выполнить с разделом.',
	   assignTask:'Присвоить',
	   cancelTask:'Отмена',
	   ctxMenuTask: 'Задача',
	   ctxMenuCreateTask: 'Присвоить раздел',
	   ctxMenuDeleteTask: 'Удалить',
	   ctxMenuHideTask: 'Скрыть все',
	   ctxMenuShowTask: 'Показать все',
	   dlgTaskDeleteTitle: 'Удалить раздел',
	   dlgTaskCreateTitle: 'Присвоить раздел',	    
	   dlgTaskCreateSectionMode: 'Задача присвоена:',	    
	   dlgTaskCreateWriteSection: 'Записать этот раздел',	    
	   dlgTaskCreateReviewSection: 'Проверить этот раздел',
	   dlgTaskCreateAssignee: 'Кому присвоить раздел:',
	   dlgTaskCreateDescription: 'Описание',
	   dlgTaskCreateInValidMessage: 'Пользователь не определен как Редактор;<br />Сначала разрешите совместное использование с пользователем с ролью Редактор.',
	   dlgTaskCreateWarningMessage: 'Для того чтобы пользователям можно было присваивать задачи, необходимо сначала определить <br />этих пользователей как \"Редакторов\" документа в папке \"Мои файлы\".',
	   assignmentAlreadyExist:'Выбранная область уже присвоена. ',
	   write:'Запись',
	   writeDesc:'Запись ${0}: ${1}',
	   review:'Проверить',
	   reviewDesc:'Проверка ${0}: ${1}',
	   reworkDesc:'Переделать ${0}: ${1}',
	   writeCompleteDesc: 'Раздел ${0} записан ${1}',
	   reviewCompleteDesc: 'Раздел ${0} проверен ${1}',
	   workingPrivateDesc: 'Работа в частном порядке над ${0} для ${1}',
	   done:'Готово',
	   actions: 'Действия',
	   currentUserSectionAssigned:'Для вас выполнено присвоение ${0} этого раздела',
	   workPrivately:'Работать в частном порядке',
	   currentUserWorkingPrivately : 'Вы работаете над этим разделом в частном порядке',
	   gotoPrivateDocument:'Перейти к личному документу',
	   somebody:'Кто-то',
	   cannotGetAssigneeName:"Невозможно получить имя уполномоченного, вы не можете быть участником этой операции",
	   userSectionAssigned:'${0} присвоен объекту ${1} этого раздела',
	   userWorkingPrivately: '${0} работает над этим разделом в частном порядке',
	   emptyDocTitle:'Черновик без названия',
	   changeOverride:'Ваши изменения будут переопределены владельцем задачи.',
	   onlyAssignerDeleteTask: 'Присвоение, которое не отмечено как завершенное, может удалить только его владелец. ',
	   actionBtnEdit:'Изменить присвоение',
	   actionBtnRemove:'Удалить присвоение',
	   actionBtnAbout:'Сведения об этом разделе',
	   actionBtnMarkComplete:'Пометить как завершенную',
	   actionBtnWorkPrivately:'Работать в частном порядке',
	   actionBtnApprove:'Утвердить этот раздел',
	   actionBtnGotoPrivate:'Перейти к личному документу',
	   actionBtnRework:'Требуется переработка'
	}
});
