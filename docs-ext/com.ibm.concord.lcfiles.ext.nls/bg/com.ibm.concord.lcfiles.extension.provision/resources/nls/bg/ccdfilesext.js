({
	//actionNew dojo menu
	newName : "Нов",
	newTooltip : "Създаване на документ",
	WARN_INTERNAL : "Щом даден файл бъде създаден, не е възможно да промените позволението за споделяне с други извън Вашата организация.",
	newCommunityInfo : "Членове на общността могат да редактират този файл.",
  	CANCEL : "Отказ",
  	DOWNLOAD_EMPTY_TITLE : "Файлът не може да се изтегли",
  	DOWNLOAD_EMPTY_OK : "Затваряне",
  	DOWNLOAD_EMPTY_CONTENT1 : "Няма публикувана версия на този файл за изтегляне.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Версиите могат да бъдат публикувани от редактора на Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Файлът не може да се изтегли",
  	DOWNLOAD_EMPTYVIEW_OK : "Затваряне",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Няма публикувана версия на този файл за изтегляне.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Помолете собственика на файла да публикува версия на този файл.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Изтегляне на версия",
  	DOWNLOAD_NEWDRAFT_OK : "Изтегли версия",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "последна редакция на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "последна редакция на ${date}",	
		TODAY: "последна редакция днес в ${time}",	
		YEAR: "последна редакция на ${date_long}",	
		YESTERDAY:	"последна редакция вчера в ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Открита е по-нова чернова, последно редактирана на ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Открита е по-нова чернова, последно редактирана на ${date}.",	
		TODAY: "Открита е по-нова чернова, последно редактирана днес в ${time}.",	
		YEAR: "Открита е по-нова чернова, последно редактирана на ${date_long}.",	
		YESTERDAY:	"Открита е по-нова чернова, последно редактирана вчера в ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Наистина ли желаете да продължите с изтеглянето на версията, публикувана на ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Наистина ли желаете да продължите с изтеглянето на версията, публикувана на ${date}?",	
		TODAY: "Наистина ли желаете да продължите с изтеглянето на версията, публикувана днес в ${time}?",	
		YEAR: "Наистина ли желаете да продължите с изтеглянето на версията, публикувана на ${date_long}?",	
		YESTERDAY:	"Наистина ли желаете да продължите с изтеглянето на версията, публикувана вчера в ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Това е последната версия за изтегляне като Docs файл. За да узнаете дали съществува по-късна версия във формат на чернова, свържете се със собственика на файла.",

  	VIEW_FILE_DETAILS_LINK : "Преглед на подробности за файл",
  	OPEN_THIS_FILE_TIP: "Отваряне на този файл",
  
	//newDocument 
	newDocumentName : "Документ",
	newDocumentTooltip : "Нов документ",
	newDocumentDialogTitle : "Нов документ",
	newDocumentDialogContent : "Дайте име на този неозаглавен документ.",
	newDocumentDialogBtnOK : "Създаване",
	newDocumentDialogBtnOKTitle : "Създаване на документ",
	newDocumentDialogInitialName : "Неозаглавен документ",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Отказ",
	newDocumentDialogNamepre : "*Име:",
	newDocumentDialogDocumentTypePre : "Тип:",
	newDocumentDialogDocumentChangeTypeLink : "Промяна на стандартно файлово разширение",
	newDocumentDialogDupErrMsg : "Намерено е дублирано име на файл. Въведете ново име.",
	newDocumentDialogIllegalErrMsg : "${0} е незаконно заглавие на документ, моля укажете друго.",
	newDocumentDialogNoNameErrMsg : "Изисква се име на документ.",
	newDocumentDialogNoPermissionErrMsg : "Файлът не може да се създадете, защото нямате достъп на редактор. Свържете се с администратор.",
	newDocumentDialogServerErrMsg : "Сървърът на Docs не е достъпен. Свържете се с администратора на сървъра и опитайте отново по-късно.",
	newDocumentDialogServerErrMsg2 : "Сървърът на Connections не е достъпен. Свържете се с администратора на сървъра и опитайте отново по-късно.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Съкращаване на името на документа?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "Името на документа е твърде дълго.",
	newDialogProblemidErrMsg : "Докладвайте този проблем на Вашия администратор. ",
	newDialogProblemidErrMsg_tip : "Докладвайте този проблем на Вашия администратор. ${shown_action}",
	newDialogProblemidErrMsgShow: "Щракнете, за да се покажат подробности",
	newDialogProblemidErrMsgHide: "Щракнете за скриване",
	newDocumentDialogTargetPre: "*Запазване към:",
	newDocumentDialogTargetCommunity: "Тази общност",
	newDocumentDialogTargetMyFiles: "Моите файлове",

	//newSpreadsheet 
	newSheetName : "Електронна таблица",
	newSheetTooltip : "Нова електронна таблица",
	newSheetDialogTitle : "Нова електронна таблица",
	newSheetDialogBtnOKTitle : "Създаване на електронна таблица",
	newSheetDialogInitialName : "Неозаглавена електронна таблица",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Презентация",
	newPresTooltip : "Нова презентация",
	newPresDialogTitle : "Нова презентация",
	newPresDialogBtnOKTitle : "Създаване на презентация",
	newPresDialogInitialName : "Неозаглавена презентация",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Създаване на файл",
	newFromDialogName : "Ново от Файл",
	newFromTooltip: "Създаване на нов файл, като се използва този файл за шаблон",
	newFromDocTip : "Създаване на документ (DOC, DOCX или ODT файл) от шаблонен файл. Можете да редактирате тези документи онлайн в Docs.",
	newFromSheetTip : "Създаване на електронна таблица (XLS, XLSX или ODS файл) от шаблонен файл. Можете да редактирате тези електронни таблици онлайн в Docs.",
	newFromPresTip : "Създаване на презентация (PPT, PPTX или ODP файл) от шаблонен файл. Можете да редактирате тези презентации онлайн в Docs.",

	//actionEdit
	editName : "Редактиране в Docs",
	editTooltip : "Редактиране в Docs",
	editWithDocsDialogTitle : "Стартиране на редактирането онлайн с Docs?",
	editWithDocsDialogContent1 : "Docs Ви позволява да си сътрудничите в Files с други лица по едно и също време и да виждате промените незабавно. Можете да работите също така онлайн и скрито.",
	editWithDocsDialogContent2 : "Не е необходимо да качвате нови версии на документ. Ако цялото редактиране се прави онлайн, Вашата работа и коментарите са защитени. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Редактиране онлайн",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Преглед",
	viewTooltip : "Предварителен преглед на файл в браузър",

	//doc too large
	docTooLargeTitle : "Документът е твърде голям.",
	docTooLargeDescription : "Документът, който искате да редактирате, е твърде голям. <br />Уверете се, че размерът на файла във формат *.odt, *.doc, <br />или *.docx не е по-голям от 2048 K.",
	docTooLargeCancelBtn: "Отказ",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Текущо редактиране: ",
		
	//Sheet title
	sheetTitle0: "Sheet1",
	sheetTitle1: "Sheet2",
	sheetTitle2: "Sheet3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Изтегляне като Microsoft Office формат",
	downloadAsPDF: "Изтегляне като PDF файл",
	downloadWithUnsavedDraftTitle: "Изключителна чернова",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "Тази версия може да не съдържа последните онлайн редакции. Щракнете върху Записване, за да създадете нова версия и да я изтеглите. Щракнете върху Отказ, за да продължите без запазване.",
	downloadWithUnsavedDraftReadersDescription: "Тази версия може да не съдържа последните редакции. Версията на изтегления документ ще бъде последната запазена версия от редактор на документа. Желаете ли да продължите?",

	//draft tab

	draft_tab_title : "Чернова",
	draft_created : "${0} въз основа на Версия ${1}",
	draft_published : "Последните редакции в черновата са публикувани.",
	draft_beiing_edited : "Този файл в момента се редактира в мрежата от ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Могат да бъдат редактирани само файловете, които представляват Docs документи.",
	draft_unpublished_tip : "Има редакции на тази чернова, които не са публикувани като версия. ${publish_action}",
	draft_save_action_label : "Публикуване на версия",
	draft_not_found : "Няма редакции на чернова за този файл.",
	draft_latest_edit : "Последна редакция:",
	draft_cur_editing : "Текущо редактиране:",
	draft_edit_link : "Редактиране",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Това е Docs файл. Всички редакции трябва да се направят онлайн.",
	nonentitlement_docs_indicator_text: "Този файл е достъпен онлайн за редактиране само ако сте закупили упълномощаване за Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} публикува на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} публикува на ${date}",	
		TODAY: "${user} публикува днес в ${time}",	
		YEAR: "${user} публикува на ${date_long}",	
		YESTERDAY:	"${user} публикува вчера в ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Публикувано на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Публикувано на ${date}",	
		TODAY: "Публикувано днес в ${time}",	
		YEAR: "Публикувано на ${date_long}",	
		YESTERDAY:	"Публикувано вчера в ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} публикува версия на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} публикува версия на ${date}",	
		TODAY: "${user} публикува версия днес в ${time}",	
		YEAR: "${user} публикува версия на ${date_long}",	
		YESTERDAY:	"${user} публикува версия вчера в ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Публикувана версия на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Публикувана версия на ${date}",	
		TODAY: "Публикувана версия днес в ${time}",	
		YEAR: "Публикувана версия на ${date_long}",	
		YESTERDAY:	"Публикувана версия вчера в ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} създаде на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} създаде на ${date}",	
		TODAY: "${user} създаде днес в ${time}",	
		YEAR: "${user} създаде на ${date_long}",	
		YESTERDAY:	"${user} създаде вчера в ${time}"
	},
	LABEL_CREATED: {
		DAY: "Създадено на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Създадено на ${date}",	
		TODAY: "Създадено днес в ${time}",	
		YEAR: "Създадено на ${date_long}",	
		YESTERDAY:	"Създадено вчера в ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} редактира чернова на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} редактира чернова на ${date}",	
		TODAY: "${user} редактира чернова днес в ${time}",	
		YEAR: "${user} редактира чернова на ${date_long}",	
		YESTERDAY:	"${user} редактира чернова вчера в ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Редактирана чернова на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Редактирана чернова на ${date}",	
		TODAY: "Редактирана чернова днес в ${time}",	
		YEAR: "Редактирана чернова на ${date_long}",	
		YESTERDAY:	"Редактирана чернова вчера в ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} създаде чернова на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} създаде чернова на ${date}",	
		TODAY: "${user} създаде чернова днес в ${time}",	
		YEAR: "${user} създаде чернова на ${date_long}",	
		YESTERDAY:	"${user} създаде чернова вчера в ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Създадена чернова на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Създадена чернова на ${date}",	
		TODAY: "Създадена чернова днес в ${time}",	
		YEAR: "Създадена чернова на ${date_long}",	
		YESTERDAY:	"Създадена чернова вчера в ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Редактирано на ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Редактирано на ${date}",	
		TODAY: "Редактирано днес в ${time}",	
		YEAR: "Редактирано на ${date_long}",	
		YESTERDAY:	"Редактирано вчера в ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Неподдържан браузър",
	unSupporteBrowserContent1: "Съжаляваме, но Вашият браузър не може да работи правилно с Docs. За най-добри резултати, опитайте се да използвате един от тези поддържани браузъри.",
	unSupporteBrowserContent2: "Разбира се, можете да продължите със своя браузър, но е възможно да нямате възможността да се ползвате от всички характеристики на Docs.",
	unSupporteBrowserContent3: "Не ми показвай отново това съобщение.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Нови сте в Files и Docs?",
	INTRODUCTION_BOX_BLURB: "Качете и споделете Вашите файлове. Създаване и редактиране на файлове индивидуално или в сътрудничество посредством Docs. Организирайте файлове в папка, следвайте файлове, за да проследявате промените и закачете Вашите предпочитани.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Влезте, за да започнете да използвате Files и Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Щракнете върху "Качване на файлове", за да добавите файл. Щракнете върху "Нов", за да създадете файл с Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Щракнете върху Качване на файлове, за да добавите файл. Щракнете върху Нов, за да създадете файл с Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Затворете раздел "Добре дошли в Files и Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Създайте и работете съвместно по съдържание с колеги. Научете как да:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Добавяте свои собствени файлове.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Започнете да редактирате онлайн, в реално време, индивидуално или съвместно.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Качвате и редактирате документи, електронни таблици или презентации.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Добавяте свои собствени файлове{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Стартирате редактиране онлайн в реално време, индивидуално или съвместно{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Качвате и редактирате на документи, електронни таблици или презентации{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Настройка на страница",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Ориентация",
	PORTRAIT: "Портрет",
	LANDSCAPE: "Пейзаж",	
	MARGINS_LABEL: "Полета",
	TOP: "Горе:",
	TOP_DESC:"Горно поле, в сантиметри",
	TOP_DESC2:"Горно поле, в инчове",
	BOTTOM: "Долна част:",
	BOTTOM_DESC:"Долно поле, в сантиметри",
	BOTTOM_DESC2:"Долно поле, в инчове",
	LEFT: "Ляво:",
	LEFT_DESC:"Ляво поле, в сантиметри",
	LEFT_DESC2:"Ляво поле, в инчове",	
	RIGHT: "Дясно:",
	RIGHT_DESC:"Дясно поле, в сантиметри",
	RIGHT_DESC2:"Дясно поле, в инчове",
	PAPER_FORMAT_LABEL: "Формат на хартия",
	PAPER_SIZE_LABEL: "Размер на хартия:",
	HEIGHT: "Височина:",
	HEIGHT_DESC:"Височина на хартия, в сантиметри",
	HEIGHT_DESC2:"Височина на хартия, в инчове",	
	WIDTH: "Ширина:",
	WIDTH_DESC:"Ширина на хартия, в сантиметри",
	WIDTH_DESC2:"Ширина на хартия, в инчове",
	CM_LABEL: "cm",
	LETTER: "Буква",
	LEGAL: "Правен",
	TABLOID: "Таблоид",
	USER: "Потребител",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai large",
	DISPLAY_OPTION_LABEL: "Опции за показване",
	HEADER: "Заглавна част",
	HEADER_DESC:"Височина на заглавна част, в сантиметри",	
	FOOTER: "Долен колонтитул",
	FOOTER_DESC:"Височина на долен колонтитул, в сантиметри",
	GRIDLINE: "Линии на мрежа",
	TAGGED_PDF: "PDF с етикет",
	PAGE_LABEL: "Ред на страница",
	PAGE_TYPE1: "Отгоре надолу, след това надясно",
	PAGE_TYPE2: "От ляво надясно, след това надолу",
	PAGE_SETUP_INVALID_MSG: "Въведената информация е невалидна и е отстранена автоматично. Опитайте друга стойност, ако искате друг резултат.",
	
	//Docs publish message
	service_unavailable_content: "Услугата Docs не е достъпна. Вашата заявка не може да се обработи в този момент. Опитайте отново по-късно или се свържете със системния администратор.",
	viewaccess_denied_content: "Нямате разрешение да видите този файл. Файлът трябва да бъде направен публичен или трябва да се сподели с Вас.",
	editaccess_denied_content: "Нямате разрешение да редактирате този файл. Трябва да имате права за Docs, а файлът трябва да бъде споделен с Вас или трябва да имате права на редактор за файла.",
	doc_notfound_content: "Документът, до който искате да осъществите достъп, е изтрит или преместен. Проверете дали връзката е правилна.",
	repository_out_of_space_content: "Нямате достатъчно пространство, за да запазите Вашия нов документ. Премахнете други файлове, за да освободите достатъчно пространство, за да запазите този документ.",
	fileconnect_denied_content: "Docs не може да се свърже с хранилището за файлове. Опитайте отново по-късно или се свържете със системния администратор.",
	convservice_unavailable_content: "Услугата по преобразуване на Docs не е достъпна. Вашата заявка не може да се обработи в този момент. Опитайте отново по-късно или се свържете със системния администратор.",
	doc_toolarge_content: "Документът, до който искате да осъществите достъп, е твърде голям.",
	conversion_timeout_content: "Към този момент, документът се преобразува за прекалено много време. Опитайте отново по-късно.",
	storageserver_error_content: "Сървърът понастоящем е недостъпен. Вашата заявка не може да се обработи в този момент. Опитайте отново по-късно или се свържете със системния администратор.",
	server_busy_content:"Изчакайте известно време и опитайте отново по-късно.",
	publish_locked_file: "Не можете да публикувате този файл като нова версия, защото е заключен, Вашето съдържание обаче автоматично се запазва в черновата.",
	publishErrMsg: "Версията не е публикувана. Файлът може да е твърде голям или сървърът да е в режим на таймаут. Опитайте отново или откажете и помолете Вашия администратор да провери сървърния журнал, за да определи проблема.",
	publishErrMsg_Quota_Out: "Няма достатъчно пространство, за да се публикува нова версия на този документ. Премахнете други файлове, за да освободите достатъчно пространство, за да публикувате този документ.",
	publishErrMsg_NoFile: "Тъй като този документ е изтрит от други, публикуването е неуспешно.",
	publishErrMsg_NoPermission: "Неуспешно публикуване на нова версия, защото нямате позволения на редактор в този файл. Свържете се със собственика на файла, за да получите позволения на редактор и опитайте отново."
		
})

