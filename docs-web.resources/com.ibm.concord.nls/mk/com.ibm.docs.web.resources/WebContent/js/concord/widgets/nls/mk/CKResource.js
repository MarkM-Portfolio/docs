define({root:({	
	clipboard:{
		pasteTableToTableError 	: "Не може да се создаде или залепи табела во друга табела.",
		securityMsg	: "Поради поставките за безбедност на прегледувачот, апликацијата нема пристап до складот.  За да пристапите до складот, стиснете Ctrl+V за да ја залепите содржината во ова поле и потоа кликнете ОК.",
		pasteMaxMsg : "Содржината што сакате да ја залепите е премногу голема.",
		cutError	: 'Поставките за безбедност на прегледувачот спречуваат автоматско копирање. Наместо тоа, користете Ctrl+X од тастатурата.',
		copyError	: 'Поставките за безбедност на прегледувачот спречуваат автоматско копирање. Наместо тоа, користете Ctrl+C од тастатурата.',
		pasteError  : "Поради поставките за безбедност на прегледувачот, апликацијата нема пристап до складот. Наместо тоа, користете Ctrl+V од тастатурата.",
		cutErrorOnMac: 'Поставките за безбедност на прегледувачот спречуваат автоматско копирање. Наместо тоа, користете \u2318X од тастатурата.',
		copyErrorOnMac: 'Поставките за безбедност на прегледувачот спречуваат автоматско копирање. Наместо тоа, користете \u2318C од тастатурата.',
		pasteErrorOnMac: "Поради поставките за безбедност на прегледувачот, апликацијата нема пристап до складот. Наместо тоа, користете \u2318V од тастатурата."
	},
	coediting:{
		exitTitle:"Излези од заедничко уредување",
		offlineTitle:"Проблем со мрежата",
		reloadTitle : "Проблем со синхронизација",
		firstTab : "Прва картичка",
		connectMsg: "Кликнете на копчето ${0} за повторно да се поврзете или ${1} за да освежите.",
		exitMsg:"Кликнете Излези, за да излезете од режим на заедничко уредување или кликнете режим на приказ, за да префрлите во режим САМО ЗА ЧИТАЊЕ.",
		lockMsg:"Уредникот ќе биде заклучен за да се спречи губење податоци.",
		connectLabel:"Поврзи",
		exitLabel:"Излези",
		reloadLabel : "Вчитај повторно",
		viewLabel:"Режим на приказ",
		viweAlert:"РЕЗЕРВИРАНО МЕСТО за режим само за ПРИКАЗ",
		forbiddenInput:"Не може да внесете текст бидејќи изборот содржи задача.",
		taskLockMsg: "${0} работи приватно на овој дел. Измените се пребришуваат кога приватната работа се поднесува назад до документот."
	},
	comments :
	{
		commentLabel : "Додај коментар",
		deleteComment : "Избриши коментар",
		showComment : "Прикажи коментар",
		hoverText		: "Коментар"
	},
	concordhelp :
	{
		about : "Содржина во Помош"
	},
	
	concordpresentations:
	{
		newSlide: "Нов слајд",
		addImage: "Вметни слика",
		slideShow: "Започни приказ на слајд",
		addTextBox: "Додај текстуално поле",
		addPresComments: "Додај коментар",
		ctxMenuSmartTable : "Додај табела",
		slideTemplate : "Главни стилови",
		slideLayout : "Распоред на слајдови",
		saveAsDraft : "Зачувај"
	},
	
	concordrestyler:
	{
		toolbarRestylePrevious: "Претходен стил",
		toolbarRestyleNext: "Следен стил"
	},
	
	concordsave :
	{
		concordsaveLabel : "Зачувај го документот",
		concordpublishLabel : "Објави верзија",
		publishOkLabel: "Објави",
		checkinLabel: "Најави се"
	},
	
	concordtemplates :
	{
		toolbarTemplates : "Шаблони",
		dlgLabelDefaultSearchbarValue : "Пребарај",
		dlgLabelInitSearchResults : "Резултати: 5 шаблони",
		dlgLabelResults : "Резултати: ",
		dlgLabelTemplates : " шаблони",
		dlgLabelShow : "Покажи: ",
		dlgLabelAll : " Сите ",
		dlgLabelDoc : "Документи",
		dlgLabelST : "Табели",
		dlgLabelSections : "Делови",
		dlgLabelSeperator : " | ", 
		dlgLabelDone : " Готово ", 
		dlgLabelCancel : " Откажи ",
		dlgInsertSectionError : "Не можете да вметнете дел бидејќи означеното е внатре во табела.",
		dlgLabelDataError : "Во моментов не може да се вчитаат шаблоните. Обидете се повторно подоцна.",
		dlgTitle: "Шаблони",
		dlgLabelLoading: "Вчитување...",
		RESULTS_TOTAL_TEMPLATES: "Резултати: ${0} шаблони",
		template0 :
		{
			title : "Факс",
			description : ""
		},
		template1 :
		{
			title : "Фактура",
			description : ""
		},
		template2 :
		{
			title : "Потсетник",
			description : ""
		},
		template3 : 
		{
			title : "Писмо",
			description : ""
		},
		template4 :
		{
			title : "Продолжи",
			description : ""
		},
		template5 :
		{
			title : "Заглавие на писмо на вработен",
			description : ""
		},
		template6 :
		{
			title : "Заглавие на писмо на фирма",
			description : ""
		},
		template7 : 
		{
			title : "Лично заглавие на писмо",
			description : ""
		},
		template8 :
		{
			title : "Заглавие на писмо",
			description : ""
		},
		template9 :
		{
			title : "Референци",
			description : ""
		}
	},
	deletekey :
	{
	   forbiddenCopy: "Не може да ја копирате содржината бидејќи изборот содржи задача или коментари",
	   forbiddenCut: "Не може да ја отсечете содржината бидејќи изборот содржи задача",
	   forbiddenDelete: "Не може да ја избришете содржината бидејќи изборот содржи задача."
	},
	dialogmessage:
	{
		title : "Порака",
		dlgTitle : "Порака",
		validate : "потврди",
		dialogMessage : "Порака за дијалог тука"
	},
	
	increasefont :
	{
		fail: "Не може да продолжите да го зголемувате и намалувате фонтот. Ја достигна максималната или минималната вредност."
	},
	
	list :
	{
		disableMutliRangeSel : "Не можете да додавате броеви или знаци за подредување неповрзани линии во една операција. Обидете се да додадете броеви или знаци за подредување на линиите една по една.",
		disableBullet : "Не можете да додавате броеви или знаци за подредување на избирачот на задачи. Обидете се да означите текст без да го означите копчето Дејства, а потоа додадете броеви или знаци за подредување."
	},
	
	listPanel :
	{
		continuelabel : "Продолжи список",
		restartlabel : "Рестартирај список"
	},
	liststyles :
	{
	    // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
	    titles :
	    {
	        numeric : "Нумерирање",
	        bullets : "Знаци за подредување",
	        multilevel : "Списоци со повеќе нивоа"  // for both numeric and bullet lists
	    },
	    numeric :
	    {
	        numeric1 : "Нумерички 1",
	        numeric2 : "Нумерички 2",
	        numericParen : "Нумерички со заграда",
	        numericLeadingZero : "Нумерички започнувајќи од нула",
	        upperAlpha : "Големи букви",
	        upperAlphaParen : "Големи букви со заграда",
	        lowerAlpha : "Мали букви",
	        lowerAlphaParen : "Мали букви со заграда",
	        upperRoman : "Големи римски броеви",
	        lowerRoman : "Мали римски броеви",
	        japanese1 : "Јапонски броеви 1",
	        japanese2 : "Јапонски броеви 2"
	    },
	    multilevelNumeric :
	    {
	        numeric : "Нумерички",
	        tieredNumbers : "Слоевити броеви",
	        alphaNumeric : "Алфа-нумерички",
	        numericRoman : "Нумерички-римски",
	        numericArrows : "Нумерички / стрелки за надолен редослед",
	        alphaNumericBullet : "Алфа-нумерички / знак за подредување",
	        alphaRoman : "Алфа-римски",
	        lowerAlphaSquares : "Мали-алфа / квадрати",
	        upperRomanArrows : "Големи-римски / стрелки"
	    },
	    bullets :
	    {
	        circle : "Круг",
	        cutOutSquare : "Отсечен квадрат",
	        rightArrow : "Десна стрелка",
	        diamond : "Ромб",
	        doubleArrow : "Двојна стрелка",
	        asterisk : "Ѕвездичка",
	        thinArrow : "Тенка стрелка",
	        checkMark : "Знак за штиклирање",
	        plusSign : "Знак за плус",
	        // TODO - captions for image bullets
	        //      - using image titles as starting point
	        //        (see images in story 42428 in pre-2012 RTC repository)
	        imgBlueCube : "Сина коцка",
	        imgBlackSquare : "Црн квадрат",
	        imgBlueAbstract : "Син извадок",
	        imgLeaf : "Лист",
	        imgSilver : "Сребрен круг",
	        imgRedArrow : "Црвена стрелка",
	        imgBlackArrow : "Црна стрелка",
	        imgPurpleArrow : "Пурпурна стрелка",
	        imgGreenCheck : "Зелен знак за штиклирање",
	        imgRedX : "Црвен Х",
	        imgGreenFlag : "Зелено знаме",
	        imgRedFlag : "Црвено знаме",
	        imgStar : "Ѕвезда"
	    },
	    multilevelBullets :
	    {
	        numeric : "Нумерички",
	        tieredNumbers : "Слоевити броеви",
	        lowerAlpha : "Мали букви",
	        alphaRoman : "Алфа-римски",
	        lowerRoman : "Мали римски",
	        upperRoman : "Големи римски",
	        dirArrows : "Стрелки за насока",
	        descCircles : "Кругови во надолен редослед",
	        descSquares : "Квадрати во надолен редослед"
	    }
	},
	
	presComments :
	{
		addPresComments : "Додај коментар"
	},

	publish:
	{
		publishLabel : "Зачувај документ во Мои датотеки",
		publishDocument: "Зачувај документ во Мои датотеки",
		publishDocumentWaitMessage: "Почекајте додека документот се зачувува во Мои датотеки.",
		documentPublished: "Документот се зачува во Мои датотеки"
	},
	
	smarttables :
	{
	   toolbarAddST: "Додај табела",
	   toolbarDelSTRow: "Избриши ред",
	   toolbarDelSTCol: "Избриши колона",
	   toolbarDelST: "Избриши табела",
	   toolbarChgSTStyle: "Промени стил на табела",
	   toolbarMoveSTRowUp: "Премести ред горе",
	   toolbarMoveSTRowDown: "Премести ред долу",
	   toolbarMoveSTColBefore: "Премести колона пред",
	   toolbarMoveSTColAfter: "Премести колона после",
	   toolbarSortSTColAsc: "Сортирај по нагорен редослед",
	   toolbarSortSTColDesc: "Сортирај по надолен редослед",
	   toolbarResizeSTCols: "Промени големина на колони",
	   toolbarMakeHeaderRow: "Направи заглавие",
	   toolbarMakeNonHeaderRow: "Направи без заглавие",
	   toolbarMakeHeaderCol: "Направи заглавие",
	   toolbarMakeNonHeaderCol: "Направи без заглавие",
	   toolbarToggleFacetSelection: "Генерирај категорија во режим на приказ",
	   ctxMenuSmartTable: "Табела",
	   ctxMenuTableProperties: "Својства на табела...",
	   ctxMenuTableCellProperties: "Својства на ќелија...",
	   ctxMenuDeleteST: "Избриши",
	   ctxMenuChgSTStyle: "Промени стил",
	   ctxMenuShowCaption: "Покажи опис",
	   ctxMenuHideCaption: "Сокриј опис",
	   ctxMenuResizeST: "Промени големина",
	   ctxMenuResizeColumnsST: "Промени големина на колони",
	   ctxMenuSTRow: "Ред",
	   ctxMenuAddSTRowAbv: "Вметни ред горе",
	   ctxMenuAddSTRowBlw: "Вметни ред долу",
	   ctxMenuMoveSTRowUp: "Премести ред нагоре",
	   ctxMenuMoveSTRowDown: "Премести ред надолу",
	   ctxMenuDelSTRow: "Избриши",
	   ctxMenuSTCol: "Колона",
	   ctxMenuAddSTColBfr: "Вметни колона пред",
	   ctxMenuAddSTColAft: "Вметни колона после",  
	   ctxMenuMoveSTColBefore: "Премести колона лево",
	   ctxMenuMoveSTColAfter: "Премести колона десно",
	   ctxMenuDelSTCol: "Избриши",
	   ctxMenuSortSTColAsc: "Сортирај по нагорен редослед",
	   ctxMenuSortSTColDesc: "Сортирај по надолен редослед",
	   ctxMenuShowAllFacets: "Покажи категории",
	   ctxMenuHideAllFacets: "Сокриј категории",
	   ctxMenuSTCell: "Ќелија",
	   ctxMenuMergeCells: "Спои ќелии",
	   ctxMenuMergeDown: "Спои со ќелии подолу",
	   ctxMenuVerSplit: "Подели вертикално",
	   ctxMenuHorSplit: "Подели хоризонтално",
	   ctxMenuAlignTextLeft: "Порамни налево",
	   ctxMenuAlignTextCenter: "Порамни централно",
	   ctxMenuAlignTextRight: "Порамни надесно",
	   ctxMenuClearSTCellContent: "Исчисти содржина",
	   ctxMenuMakeHeaderRow: "Користете означен ред како заглавие",
	   ctxMenuMakeNonHeaderRow: "Отстрани стил на наслов",
	   ctxMenuMakeHeaderCol: "Користете означена колона како заглавие",
	   ctxMenuMakeNonHeaderCol: "Отстрани стил на наслов",
	   msgCannotInsertRowBeforeHeader: "Не може да се вметне нов ред пред заглавието.",
	   msgCannotInsertCoBeforeHeader: "Не може да се вметне нова колона пред заглавието.",
	   msgCannotMoveHeaderRow: "Редот на заглавието не може да се премести.",
	   dlgTitleSTProperties: "Својства на табела",
	   dlgTitleAddST: "Додај табела",
	   dlgLabelSTName: "Име на табела:",
	   dlgLabelSTType: "Избери тип на заглавие",
	   dlgLabelSTRows: "Број на редови",
	   dlgLabelSTCols: "Број на колони",
	   dlgLabelSTTemplate: "Користи шаблон",
	   dlgMsgValidationRowsMax:"Внесете број помеѓу 1 и 200.",
	   dlgMsgValidationColsMax:"Внесете број помеѓу 1 и 25.",
	   dlgMsgValidation:"Вредноста мора да биде позитивен цел број",
	   dlgLabelSTInstruction: "Внесете го бројот на редови и колони. Максималната вредност е 200 за редови и 25 за колони."
	},	
	task :{
	   titleAssign:"Додели дел",
	   ctxMenuTask: "Додели",
	   ctxMenuCreateTask: "Додели дел",
	   ctxMenuDeleteTask: "Избриши",
	   ctxMenuClearTask: "Исчисти задачи",	   
	   ctxMenuHideTask: "Сокриј ги сите",
	   ctxMenuShowTask: "Покажи ги сите"
	},
	tablestyles :{
	   tableStylesToolbarLabel: "Промени стил на табела",
	   styleTableHeading: "Стил на табела",
	   recommendedTableHeading: "Препорачано",
	   tableStylesGalleryHeading: "Галерија",
	   customHeading: "Прилагодено",
	   customTableHeading: "Прилагодена табела",
	   customTableCustomizeATable: "Прилагоди табела",
	   customTableStyleATable: "Стилизирај табела",
	   customTableAddATable: "Додај табела",
	   customTableSelectTableGrid: "Избери решетка на табела",
	   customTableSelectColorScheme: "Избери шема на бои",
	   customTableHeader: "Заглавие",
	   customTableBanding: "Пруги",
	   customTableSummary: "Резиме",
	   customTableBorders: "Рабови",
	   customTableBackground: "Заднина",
	   tableStylePlain: "Обичен текст",
	   tableStyleBlueStyle: "Сино",
	   tableStyleRedTint: "Црвен тон на боја",
	   tableStyleBlueHeader: "Сино заглавие",
	   tableStyleDarkGrayHeaderFooter: "Темно сиво заглавие/подножје",
	   tableStyleLightGrayRows: "Светло сиви редови",
	   tableStyleDarkGrayRows: "Темно сиви редови",
	   tableStyleBlueTint: "Син тон на боја",
	   tableStyleRedHeader: "Црвено заглавие",
	   tableStyleGreenHeaderFooter: "Зелено заглавие/подножје",
	   tableStylePlainRows: "Обични редови",
	   tableStyleGrayTint: "Зелен тон на боја",
	   tableStyleGreenTint: "Зелен тон на боја",
	   tableStyleGreenHeader: "Зелено заглавие",
	   tableStyleRedHeaderFooter: "Црвено заглавие/подножје",
	   tableStyleGreenStyle: "Зелен стил",
	   tableStylePurpleTint: "Пурпурен тон на боја",
	   tableStyleBlackHeader: "Црно заглавие",
	   tableStylePurpleHeader: "Пурпурно заглавие",
	   tableStyleLightBlueHeaderFooter: "Светло сино заглавие/подножје"
	},
	toc:{
		title : "Содржина",
		update: "Ажурирај",
		del: "Избриши",
		toc: "Содржина",
		linkTip: "Кликнете Ctrl за навигација",
		pageNumber: "Само број на страница",
		entireTable: "Целосна табела"
	},
	link:{
		gotolink: "Оди до врска",
		unlink	: "Отстрани врска",
		editlink: "Уреди врска"
	},
	field:{
		update: "Ажурирај поле"
	},
	undo:{
		undoTip : "Врати",
		redoTip : "Повтори"
	},
	wysiwygarea:{
		failedPasteActions : "Неуспешно лепење. ${productName} не може да копира и лепи слики од друга апликација.  Поставете ја датотеката на сликата на ${productName} за да ја користите сликата таму. ",
		filteredPasteActions : "Неуспешно лепење. За да се направи сликата достапна од друга веб-локација, преземете ја на вашиот компјутер и потоа поставете ја датотеката со слика на ${productName}."
	}
})})

