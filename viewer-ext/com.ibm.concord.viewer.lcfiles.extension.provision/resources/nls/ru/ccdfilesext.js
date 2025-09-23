({
	//actionNew dojo menu
	newName : "Создать",
	newTooltip : "Создать документ",

	//newDocument 
	newDocumentName : "Документ",
	newDocumentTooltip : "Создать документ",
	newDocumentDialogTitle : "Создать документ",
	newDocumentDialogContent : "Укажите новое имя для этого черновика без названия",
	newDocumentDialogBtnOK : "Создать",
	newDocumentDialogBtnOKTitle : "Создать документ",
	newDocumentDialogBtnCancel : "Отмена",
	newDocumentDialogNamepre : "Имя (*)",
	newDocumentDialogInitialName : "Безымянный",
	newDocumentDialogDupErrMsg : "Найден файл с таким же именем. Укажите другое имя.",
	newDocumentDialogIllegalErrMsg : "${0} является недопустимым заголовком документа. Укажите другой заголовок.",


	//newSpreadsheet 
	newSheetName : "Электронная таблица",
	newSheetTooltip : "Создать электронную таблицу",
	newSheetDialogTitle : "Создать электронную таблицу",
	newSheetDialogBtnOKTitle : "Создать электронную таблицу",
	newSheetDialogInitialName : "Электронная таблица без названия",

	//newPresentation 
	newPresName : "Презентация",
	newPresTooltip : "Создать презентацию",
	newPresDialogTitle : "Создать презентацию",
	newPresDialogBtnOKTitle : "Создать презентацию",
	newPresDialogInitialName : "Безымянный",

	//actionNewFrom
	newFromName : "Создать файл",
	newFromTooltip: "Создать новый файл, используя текущий файл как шаблон",
	newFromDocTip : "Создать документ, используя текущий файл как шаблон.",
	newFromSheetTip : "Создать электронную таблицу, используя текущий файл как шаблон.",

	//actionEdit
	editName : "Правка",
	editTooltip : "Правка",

	//actionView
	viewName : "Просмотр",
	viewTooltip : "Предварительно просмотреть файл в браузере",
	VIEW_EMPTYVIEW_TITLE : "Не удается просмотреть файл",
	VIEW_EMPTYVIEW_OK : "Закрыть",
	VIEW_EMPTYVIEW_CONTENT1 : "Опубликованная версия этого файла недоступна для просмотра.",
	VIEW_EMPTYVIEW_CONTENT2 : "Чтобы версию файла можно было просмотреть, владелец файла должен опубликовать его версию.",    

	//doc too large
	docTooLargeTitle : "Документ слишком большой.",
	docTooLargeDescription : "Документ, который вы желаете редактировать, слишком большой. <br />Убедитесь, что размер файла в формате *.odt, *.doc, <br />или *.docx не превышает 2048 КБ.",
	docTooLargeCancelBtn: "Отмена",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Текущее редактирование: ",
		
	//Sheet title
	sheetTitle0: "Лист 1",
	sheetTitle1: "Лист 2",
	sheetTitle2: "Лист 3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Загрузить в формате Microsoft Office",
	downloadAsPDF: "Загрузить в формате PDF",
	//draft tab

	draft_tab_title : "Черновик",
	draft_created : "${0} на основе версии ${1}",
	draft_beiing_edited : "Этот файл в данный момент редактируется по сети пользователем ${user}.",
	draft_editor_valid : "Работать с черновиком разрешено только редакторам файла.",
	draft_doctype_valid : "Для редактирования доступны только документы HCL Docs.",
	draft_unpublished_tip : "Существуют черновики, которые не были сохранены как версии.",
	draft_save_action_label : "Сохранить",
	draft_not_found : "Для этого файла не существует изменений черновика.",
	draft_latest_edit : "Последнее редактирование:",
	draft_cur_editing : "Текущее редактирование:",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "Этот браузер не поддерживается",
	unSupporteBrowserContent: "Выбранный браузер не поддерживается. Воспользуйтесь другим браузером."
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})
