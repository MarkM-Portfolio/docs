({
	//actionNew dojo menu
	newName : "Создать",
	newTooltip : "Создать документ",
	WARN_INTERNAL : "После создания файла невозможно изменить права доступа для предоставления общего доступа пользователям, не относящимся к организации.",
	newCommunityInfo : "Участники сообщества могут изменять этот файл.",
  	CANCEL : "Отмена",
  	DOWNLOAD_EMPTY_TITLE : "Невозможно загрузить файл",
  	DOWNLOAD_EMPTY_OK : "Закрыть",
  	DOWNLOAD_EMPTY_CONTENT1 : "Нет опубликованной версии этого файла для загрузки.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Версии можно опубликовать из редактора Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Невозможно загрузить файл",
  	DOWNLOAD_EMPTYVIEW_OK : "Закрыть",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Нет опубликованной версии этого файла для загрузки.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Попросите владельца файла опубликовать версию этого файла.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Загрузить версию",
  	DOWNLOAD_NEWDRAFT_OK : "Загрузить версию",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "Дата последнего изменения: ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Дата последнего изменения: ${date}",	
		TODAY: "Последнее изменение: сегодня в ${time}",	
		YEAR: "Дата последнего изменения: ${date_long}",	
		YESTERDAY:	"Последнее изменение: вчера в ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Обнаружена более новая черновая версия (последнее изменение ${date}).",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Обнаружена более новая черновая версия (последнее изменение ${date}).",	
		TODAY: "Обнаружена более новая черновая версия (последнее изменение сегодня в ${time}).",	
		YEAR: "Обнаружена более новая черновая версия (последнее изменение ${date_long}).",	
		YESTERDAY:	"Обнаружена более новая черновая версия (последнее изменение вчера в ${time})."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Вы действительно хотите загрузить версию, опубликованную ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Вы действительно хотите загрузить версию, опубликованную ${date}?",	
		TODAY: "Вы действительно хотите загрузить версию, опубликованную сегодня в ${time}?",	
		YEAR: "Вы действительно хотите загрузить версию, опубликованную ${date_long}?",	
		YESTERDAY:	"Вы действительно хотите загрузить версию, опубликованную вчера в ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Это последняя загружаемая версия файла Docs. Для получения сведений о наличии более новой версии в формате черновика обратитесь к владельцу файла.",

  	VIEW_FILE_DETAILS_LINK : "Показать сведения о файле",
  	OPEN_THIS_FILE_TIP: "Открыть этот файл",
  
	//newDocument 
	newDocumentName : "Документ",
	newDocumentTooltip : "Создать документ",
	newDocumentDialogTitle : "Создать документ",
	newDocumentDialogContent : "Укажите имя для этого документа без названия.",
	newDocumentDialogBtnOK : "Создать",
	newDocumentDialogBtnOKTitle : "Создать документ",
	newDocumentDialogInitialName : "Безымянный",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003 (*.doc)",
		odt: "Текстовый документ OpenDocument (*.odt)"
  	},
	newDocumentDialogBtnCancel : "Отмена",
	newDocumentDialogNamepre : "*Имя",
	newDocumentDialogDocumentTypePre : "Тип:",
	newDocumentDialogDocumentChangeTypeLink : "Изменить расширение файла по умолчанию",
	newDocumentDialogDupErrMsg : "Найден файл с таким же именем. Укажите другое имя.",
	newDocumentDialogIllegalErrMsg : "${0} является недопустимым заголовком документа. Укажите другой заголовок.",
	newDocumentDialogNoNameErrMsg : "Требуется имя документа.",
	newDocumentDialogNoPermissionErrMsg : "Невозможно создать файл, поскольку вы не обладаете правами редактора. Обратитесь к администратору.",
	newDocumentDialogServerErrMsg : "Сервер Docs недоступен. Обратитесь к администратору сервера и повторите попытку.",
	newDocumentDialogServerErrMsg2 : "Сервер соединений недоступен. Обратитесь к администратору сервера и повторите попытку.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Сделать имя документа короче?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Слишком длинное имя документа.",
	newDialogProblemidErrMsg : "Сообщите об этой неполадке администратору. ",
	newDialogProblemidErrMsg_tip : "Сообщите об этой неполадке администратору. ${shown_action}",
	newDialogProblemidErrMsgShow: "Щелкните, чтобы показать подробные сведения",
	newDialogProblemidErrMsgHide: "Щелкните, чтобы скрыть",
	newDocumentDialogTargetPre: "*Сохранить в:",
	newDocumentDialogTargetCommunity: "Это сообщество",
	newDocumentDialogTargetMyFiles: "Мои файлы",

	//newSpreadsheet 
	newSheetName : "Электронная таблица",
	newSheetTooltip : "Создать электронную таблицу",
	newSheetDialogTitle : "Создать электронную таблицу",
	newSheetDialogBtnOKTitle : "Создать электронную таблицу",
	newSheetDialogInitialName : "Электронная таблица без названия",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003 (*.xls)",
		ods: "Электронная таблица OpenDocument (*.ods)"
  	},

	//newPresentation 
	newPresName : "Презентация",
	newPresTooltip : "Создать презентацию",
	newPresDialogTitle : "Создать презентацию",
	newPresDialogBtnOKTitle : "Создать презентацию",
	newPresDialogInitialName : "Безымянный",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003 (*.ppt)",
		odp: "Презентация OpenDocument (*.odp)"
  	},

	//actionNewFrom
	newFromName : "Создать файл",
	newFromDialogName : "Создать из файла",
	newFromTooltip: "Создать новый файл, используя текущий файл как шаблон",
	newFromDocTip : "Создать документ (файл DOC, DOCX или ODT) из файла шаблона. Эти документы можно изменять онлайн в Docs.",
	newFromSheetTip : "Создать электронную таблицу (файл XLS, XLSX или ODS) из файла шаблона. Эти электронные таблицы можно изменять онлайн в Docs.",
	newFromPresTip : "Создать презентацию (файл PPT, PPTX или ODP) из файла шаблона. Эти презентации можно изменять онлайн в Docs.",

	//actionEdit
	editName : "Редактировать в Docs",
	editTooltip : "Редактировать в Docs",
	editWithDocsDialogTitle : "Начать редактирование при интерактивной работе с Docs?",
	editWithDocsDialogContent1 : "Docs позволяет работать с программой Файлы совместно с другими пользователями одновременно и сразу видеть изменения. Можно также интерактивно работать в автономном режиме.",
	editWithDocsDialogContent2 : "Передавать новые версии документа не требуется. Если все сеансы интерактивного изменения завершены, и работа, и комментарии защищены. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Изменить интерактивно",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Вид",
	viewTooltip : "Предварительно просмотреть файл в браузере",

	//doc too large
	docTooLargeTitle : "Документ слишком большой.",
	docTooLargeDescription : "Документ, который вы желаете редактировать, слишком большой. <br />Убедитесь, что размер файла в формате *.odt, *.doc, <br />или *.docx не превышает 2048 КБ.",
	docTooLargeCancelBtn: "Отмена",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Текущее редактирование: ",
		
	//Sheet title
	sheetTitle0: "Лист1",
	sheetTitle1: "Лист2",
	sheetTitle2: "Лист3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Загрузить как файл Microsoft Office",
	downloadAsPDF: "Загрузить как файл PDF",
	downloadWithUnsavedDraftTitle: "Ожидающий черновик",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "Эта версия может не содержать последних электронных изменений. Для создания и загрузки новой версии нажмите кнопку Сохранить. Для продолжения без сохранения нажмите кнопку Отмена.",
	downloadWithUnsavedDraftReadersDescription: "Эта версия может не содержать последних изменений. Версия загруженного документа будет последней версией, сохраненной редактором документа. Продолжить?",

	//draft tab

	draft_tab_title : "Черновик",
	draft_created : "${0} основан на версии ${1}",
	draft_published : "Последние изменения в черновике опубликованы.",
	draft_beiing_edited : "Этот файл в данный момент редактируется по сети пользователем ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Можно редактировать только файлы, которые являются документами Docs.",
	draft_unpublished_tip : "Существуют изменения черновика, которые не были опубликованы в качестве версии. ${publish_action}",
	draft_save_action_label : "Опубликовать версию",
	draft_not_found : "Для этого файла не существует изменений черновика.",
	draft_latest_edit : "Последнее редактирование:",
	draft_cur_editing : "Текущее редактирование:",
	draft_edit_link : "Правка",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Это файл Docs. Все изменения должны выполняться в интерактивном режиме.",
	nonentitlement_docs_indicator_text: "Этот файл доступен для изменения в интерактивном режиме только после приобретения Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "Опубликовано пользователем ${user} ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Опубликовано пользователем ${user} ${date}",	
		TODAY: "Опубликовано пользователем ${user} сегодня в ${time}",	
		YEAR: "Опубликовано пользователем ${user} ${date_long}",	
		YESTERDAY:	"Опубликовано пользователем ${user} вчера в ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Опубликовано ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Опубликовано ${date}",	
		TODAY: "Опубликовано сегодня в ${time}",	
		YEAR: "Опубликовано ${date_long}",	
		YESTERDAY:	"Опубликовано вчера в ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "Версия опубликована пользователем ${user} ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Версия опубликована пользователем ${user} ${date}",	
		TODAY: "Версия опубликована пользователем ${user} сегодня в ${time}",	
		YEAR: "Версия опубликована пользователем ${user} ${date_long}",	
		YESTERDAY:	"Версия опубликована пользователем ${user} вчера в ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Версия опубликована ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Версия опубликована ${date}.",	
		TODAY: "Версия опубликована сегодня в ${time}",	
		YEAR: "Версия опубликована ${date_long}.",	
		YESTERDAY:	"Версия опубликована вчера в ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "Создано пользователем ${user} ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Создано пользователем ${user} ${date}",	
		TODAY: "Создано пользователем ${user} сегодня в ${time}",	
		YEAR: "Создано пользователем ${user} ${date_long}",	
		YESTERDAY:	"Создано пользователем ${user} вчера в ${time}"
	},
	LABEL_CREATED: {
		DAY: "Создано ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Создано ${date}",	
		TODAY: "Создано сегодня в ${time}",	
		YEAR: "Создано ${date_long}",	
		YESTERDAY:	"Создано вчера в ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "Черновик изменен пользователем ${user} ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Черновик изменен пользователем ${user} ${date}",	
		TODAY: "Черновик изменен пользователем ${user} сегодня в ${time}",	
		YEAR: "Черновик изменен пользователем ${user} ${date_long}",	
		YESTERDAY:	"Черновик изменен пользователем ${user} вчера в ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Черновик изменен ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Черновик изменен ${date}",	
		TODAY: "Черновик изменен сегодня в ${time}",	
		YEAR: "Черновик изменен ${date_long}",	
		YESTERDAY:	"Черновик изменен вчера в ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "Черновик создан пользователем ${user} ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Черновик создан пользователем ${user} ${date}",	
		TODAY: "Черновик создан пользователем ${user} сегодня в ${time}",	
		YEAR: "Черновик создан пользователем ${user} ${date_long}",	
		YESTERDAY:	"Черновик создан пользователем ${user} вчера в ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Черновик создан ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Черновик создан ${date}",	
		TODAY: "Черновик создан сегодня в ${time}",	
		YEAR: "Черновик создан ${date_long}",	
		YESTERDAY:	"Черновик создан вчера в ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Изменено ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Изменено ${date}",	
		TODAY: "Изменено сегодня в ${time}",	
		YEAR: "Изменено ${date_long}",	
		YESTERDAY:	"Изменено вчера в ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Неподдерживаемый браузер",
	unSupporteBrowserContent1: "К сожалению, ваш браузер может неправильно работать с Docs. Для достижения наилучших результатов попробуйте использовать один из следующих поддерживаемых браузеров.",
	unSupporteBrowserContent2: "Конечно, вы можете продолжить работу в своем браузере, однако при этом будут доступны не все функции Docs.",
	unSupporteBrowserContent3: "Больше не показывать это сообщение.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Впервые работаете с программой Файлы и Docs?",
	INTRODUCTION_BOX_BLURB: "Передавайте файлы и предоставляйте к ним общий доступ. Создавайте и изменяйте файлы отдельно или совместно с помощью Docs. Копируйте файлы в папку, отслеживайте изменения в файлах и закрепляйте закладки.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Войти в систему для начала работы с программой Файлы и Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Для добавления файла нажмите кнопку "Передать файлы". Для создания файла Docs нажмите кнопку "Создать".',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Для добавления файла нажмите кнопку Передать файлы. Для создания файла Docs нажмите кнопку Создать.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Закрыть раздел "Вас приветствует программа Файлы и Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Создавайте материалы и работайте над ними с коллегами. Узнайте, каким образом:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Добавить свои файлы.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Приступить к редактированию файла в режиме реального времени, самостоятельно или совместно с другими пользователями.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Передавать и редактировать документы, электронные таблицы и презентации.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Добавить свои файлы{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Приступить к редактированию файла в режиме реального времени, самостоятельно или совместно с другими пользователями.{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Передавать и редактировать документы, электронные таблицы и презентации.{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Параметры страницы",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Ориентация",
	PORTRAIT: "Книжная",
	LANDSCAPE: "Альбомная",	
	MARGINS_LABEL: "Поля",
	TOP: "Сверху:",
	TOP_DESC:"Верхнее поле (см)",
	TOP_DESC2:"Верхнее поле (дюймы)",
	BOTTOM: "Снизу:",
	BOTTOM_DESC:"Нижнее поле (см)",
	BOTTOM_DESC2:"Нижнее поле (дюймы)",
	LEFT: "Слева:",
	LEFT_DESC:"Левое поле (см)",
	LEFT_DESC2:"Левое поле (дюймы)",	
	RIGHT: "Справа:",
	RIGHT_DESC:"Правое поле (см)",
	RIGHT_DESC2:"Правое поле (дюймы)",
	PAPER_FORMAT_LABEL: "Формат бумаги",
	PAPER_SIZE_LABEL: "Размер бумаги:",
	HEIGHT: "Высота:",
	HEIGHT_DESC:"Высота бумаги (см)",
	HEIGHT_DESC2:"Высота бумаги (дюймы)",	
	WIDTH: "Ширина:",
	WIDTH_DESC:"Ширина бумаги (см)",
	WIDTH_DESC2:"Ширина бумаги (дюймы)",
	CM_LABEL: "см",
	LETTER: "Letter",
	LEGAL: "Legal",
	TABLOID: "Tabloid",
	USER: "Пользовательский",
	SIZE1: "Конв. N6 3/4",
	SIZE2: "Конв. Monarch",
	SIZE3: "Конв. N9",
	SIZE4: "Конв. N10",
	SIZE5: "Конв. N11",
	SIZE6: "Конв. N12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai large",
	DISPLAY_OPTION_LABEL: "Параметры отображения",
	HEADER: "Верхний колонтитул",
	HEADER_DESC:"Высота верхнего колонтитула (см)",	
	FOOTER: "Нижний колонтитул",
	FOOTER_DESC:"Высота нижнего колонтитула (см)",
	GRIDLINE: "Линии сетки",
	TAGGED_PDF: "PDF с тегами",
	PAGE_LABEL: "Порядок страниц",
	PAGE_TYPE1: "Сверху вниз, слева направо",
	PAGE_TYPE2: "Слева направо, сверху вниз",
	PAGE_SETUP_INVALID_MSG: "Недопустимый вывод был исправлен в автоматическом режиме. Для получения другого результата введите другое значение.",
	
	//Docs publish message
	service_unavailable_content: "Служба Docs недоступна. Невозможно обработать запрос. Повторите попытку позже или обратитесь к системному администратору.",
	viewaccess_denied_content: "У вас нет прав доступа для просмотра этого файла. Файл должен иметь открытый доступ, либо у вас должен быть личный доступ к файлу.",
	editaccess_denied_content: "Отсутствуют права на изменение этого файла. Вам должен быть предоставлен доступ к Docs, а также вам должен быть предоставлен совместный доступ к файлу, либо права редактора по отношению к этому файлу.",
	doc_notfound_content: "Запрошенный документ был удален или перемещен. Проверьте правильность ссылки.",
	repository_out_of_space_content: "Недостаточно памяти для сохранения нового документа. Удалите другие файлы, чтобы освободить достаточно памяти для сохранения этого документа.",
	fileconnect_denied_content: "Docs не удается подключиться к хранилищу файлов. Повторите попытку позже или обратитесь к системному администратору.",
	convservice_unavailable_content: "Служба преобразования Docs недоступна. Невозможно обработать запрос. Повторите попытку позже или обратитесь к системному администратору.",
	doc_toolarge_content: "Запрошенный документ слишком большой.",
	conversion_timeout_content: "В данный момент преобразование документа займет слишком много времени. Повторите попытку позднее.",
	storageserver_error_content: "Сервер в данный момент недоступен. Невозможно обработать запрос. Повторите попытку позже или обратитесь к системному администратору.",
	server_busy_content:"Повторите запрос через некоторое время.",
	publish_locked_file: "Вы не можете опубликовать этот файл в качестве новой версии, так как он заблокирован, но все ваши материалы автоматически сохранены в черновике.",
	publishErrMsg: "Версия не была опубликована. Возможно, файл был слишком большим или произошел тайм-аут сервера. Повторите попытку или отмените запрос и попросите администратора проверить протокол сервера для определения неполадки.",
	publishErrMsg_Quota_Out: "Недостаточно памяти для публикации новой версии этого документа. Удалите другие файлы, чтобы освободить место для публикации этого документа.",
	publishErrMsg_NoFile: "Не удалось опубликовать документ, так как он был удален другим пользователем.",
	publishErrMsg_NoPermission: "Не удалось опубликовать новую версию, так как у вас нет прав на изменение этого файла. Обратитесь к владельцу файла для получения прав на редактирование и повторите попытку."
		
})

