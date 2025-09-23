define({
        clipboard: {
            pasteTableToTableError: "Невозможно создать или вставить таблицу внутри другой таблицы.",
            securityMsg: "У приложения нет доступа к буферу обмена: доступ запрещен в параметрах защиты браузера.  Для вставки данных из буфера обмена в это поле нажмите Ctrl+V, затем OK.",
            pasteMaxMsg: "Слишком большой размер фрагмента, который требуется вставить.",
            cutError: 'Автоматическое копирование запрещено в настройках безопасности браузера. Используйте сочетание клавиш Ctrl+X.',
            copyError: 'Автоматическое копирование запрещено в настройках безопасности браузера. Используйте сочетание клавиш Ctrl+C.',
            pasteError: "У приложения нет доступа к буферу обмена: доступ запрещен в параметрах защиты браузера. Используйте сочетание клавиш Ctrl+V.",
            cutErrorOnMac: 'Автоматическое копирование запрещено в настройках безопасности браузера. Используйте сочетание клавиш \u2318X.',
            copyErrorOnMac: 'Автоматическое копирование запрещено в настройках безопасности браузера. Используйте сочетание клавиш \u2318C.',
            pasteErrorOnMac: "У приложения нет доступа к буферу обмена: доступ запрещен в параметрах защиты браузера. Используйте сочетание клавиш \u2318V."
        },
        coediting: {
            exitTitle: "Выход из режима одновременного редактирования",
            offlineTitle: "Сетевая неполадка",
            reloadTitle: "Неполадка синхронизации",
            firstTab: "Первая вкладка",
            connectMsg: "Нажмите кнопку ${0} для повторного соединения или ${1} - для обновления.",
            exitMsg: "Нажмите кнопку Выход, чтобы выйти из режима одновременного редактирования, или кнопку Режим просмотра, чтобы переключиться на режим только для чтения (READ ONLY).",
            lockMsg: "Редактор будет заблокирован, чтобы не допустить потери данных.",
            connectLabel: "Соединить",
            exitLabel: "Выход",
            reloadLabel: "Перезагрузить",
            viewLabel: "Режим просмотра",
            viweAlert: "Заменитель для режима Только просмотр",
            forbiddenInput: "Ввод текста запрещен, поскольку выделенный элемент содержит задачу.",
            taskLockMsg: "${0} работает над этим разделом в частном порядке. Ваши изменения будут заменены при возврате в документ работы, выполненной в частном порядке."
        },
        comments:
        {
            commentLabel: "Добавить комментарий",
            deleteComment: "Удалить комментарий",
            showComment: "Показать комментарии",
            hoverText: "Комментарий"
        },
        concordhelp:
        {
            about: "Содержание справки"
        },

        concordpresentations:
        {
            newSlide: "Создать слайд",
            addImage: "Вставить изображение",
            slideShow: "Начать демонстрацию",
            addTextBox: "Добавить текстовое поле",
            addPresComments: "Добавить комментарий",
            ctxMenuSmartTable: "Добавить таблицу",
            slideTemplate: "Главный стиль",
            slideLayout: "Макет слайда",
            saveAsDraft: "Сохранить"
        },

        concordrestyler:
        {
            toolbarRestylePrevious: "Предыдущий стиль",
            toolbarRestyleNext: "Следующий стиль"
        },

        concordsave:
        {
            concordsaveLabel: "Сохранить документ",
            concordpublishLabel: "Опубликовать версию",
            publishOkLabel: "Опубликовать",
            checkinLabel: "Вернуть",
			yesLabel: "Да"
        },

        concordtemplates:
        {
            toolbarTemplates: "Шаблоны",
            dlgLabelDefaultSearchbarValue: "Поиск",
            dlgLabelInitSearchResults: "Результаты: 5 шаблонов",
            dlgLabelResults: "Результаты: ",
            dlgLabelTemplates: " шаблонов",
            dlgLabelShow: "Показать: ",
            dlgLabelAll: " Все ",
            dlgLabelDoc: "Документы",
            dlgLabelST: "Таблицы",
            dlgLabelSections: "Разделы",
            dlgLabelSeperator: " | ",
            dlgLabelDone: " Готово ",
            dlgLabelCancel: " Отмена ",
            dlgInsertSectionError: "Невозможно вставить раздел, так как выделенный фрагмент находится внутри таблицы.",
            dlgLabelDataError: "В данный момент невозможно получить шаблоны. Повторите запрос через некоторое время.",
            dlgTitle: "Шаблоны",
            dlgLabelLoading: "Загрузка...",
            RESULTS_TOTAL_TEMPLATES: "Результаты: ${0} шаблонов",
            template0:
            {
                title: "Факс",
                description: ""
            },
            template1:
            {
                title: "Счет",
                description: ""
            },
            template2:
            {
                title: "Памятка",
                description: ""
            },
            template3:
            {
                title: "Letter",
                description: ""
            },
            template4:
            {
                title: "Резюме",
                description: ""
            },
            template5:
            {
                title: "Бланк сотрудника",
                description: ""
            },
            template6:
            {
                title: "Бланк компании",
                description: ""
            },
            template7:
            {
                title: "Бланк личного письма",
                description: ""
            },
            template8:
            {
                title: "Бланк научной статьи",
                description: ""
            },
            template9:
            {
                title: "Ссылки",
                description: ""
            }
        },
        deletekey:
        {
            forbiddenCopy: "Невозможно скопировать выделенный фрагмент, поскольку он содержит задачу или комментарии",
            forbiddenCut: "Невозможно вырезать выделенный фрагмент, поскольку он содержит задачу",
            forbiddenDelete: "Невозможно удалить выделенный фрагмент, поскольку он содержит задачу."
        },
        dialogmessage:
        {
            title: "Сообщение",
            dlgTitle: "Сообщение",
            validate: "проверить",
            dialogMessage: "Место для сообщения"
        },

        increasefont:
        {
            fail: "Невозможно увеличить или уменьшить размер шрифта. Он достиг максимального или минимального значения."
        },

        list:
        {
            disableMutliRangeSel: "Невозможно добавить номер или маркер элемента списка к строке, содержащей переносы. Добавьте номер или маркер к каждой подстроке отдельно.",
            disableBullet: "В селектор задач нельзя добавить номер или маркер элемента списка. Выберите текст, не наживая кнопку Действия, затем добавьте номер или маркер элемента списка."
        },

        listPanel:
        {
            continuelabel: "Продолжить список",
            restartlabel: "Начать список заново"
        },
        liststyles:
        {
            // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
            titles:
            {
                numeric: "Нумерация",
                bullets: "Маркеры",
                multilevel: "Многоуровневые списки"  // for both numeric and bullet lists
            },
            numeric:
            {
                numeric1: "Арабские цифры 1",
                numeric2: "Арабские цифры 2",
                numericParen: "Арабские цифры со скобкой",
                numericLeadingZero: "Арабские цифры с незначащим нулем",
                upperAlpha: "Прописные буквы",
                upperAlphaParen: "Прописные буквы со скобкой",
                lowerAlpha: "Строчные буквы",
                lowerAlphaParen: "Строчные буквы со скобкой",
                upperRoman: "Прописные римские цифры",
                lowerRoman: "Строчные римские цифры",
                japanese1: "Японские цифры 1",
                japanese2: "Японские цифры 2"
            },
            multilevelNumeric:
            {
                numeric: "Арабские цифры",
                tieredNumbers: "Арабские цифры ярусами",
                alphaNumeric: "Буква-арабская цифра",
                numericRoman: "Арабская цифра-римская цифра",
                numericArrows: "Арабская цифра / нисходящие стрелки",
                alphaNumericBullet: "Буква-арабская цифра / маркер",
                alphaRoman: "Буква-римская цифра",
                lowerAlphaSquares: "Строчная буква / квадраты",
                upperRomanArrows: "Прописная римская цифра / стрелки"
            },
            bullets:
            {
                circle: "Круг",
                cutOutSquare: "Незакрашенный квадрат",
                rightArrow: "Стрелка вправо",
                diamond: "Ромб",
                doubleArrow: "Двусторонняя стрелка",
                asterisk: "Звездочка",
                thinArrow: "Тонкая стрелка",
                checkMark: "Галочка",
                plusSign: "Знак плюс",
                // TODO - captions for image bullets
                //      - using image titles as starting point
                //        (see images in story 42428 in pre-2012 RTC repository)
                imgBlueCube: "Синий куб",
                imgBlackSquare: "Черный квадрат",
                imgBlueAbstract: "Синяя абстракция",
                imgLeaf: "Лист",
                imgSilver: "Серебряный круг",
                imgRedArrow: "Красная стрелка",
                imgBlackArrow: "Черная стрелка",
                imgPurpleArrow: "Пурпурная стрелка",
                imgGreenCheck: "Зеленая галочка",
                imgRedX: "Красный крестик",
                imgGreenFlag: "Зеленый флаг",
                imgRedFlag: "Красный флаг",
                imgStar: "Звезда"
            },
            multilevelBullets:
            {
                numeric: "Арабские цифры",
                tieredNumbers: "Арабские цифры ярусами",
                lowerAlpha: "Строчные буквы",
                alphaRoman: "Буква-римская цифра",
                lowerRoman: "Строчные римские цифры",
                upperRoman: "Прописные римские цифры",
                dirArrows: "Направленные стрелки",
                descCircles: "Нисходящие круги",
                descSquares: "Нисходящие квадраты"
            }
        },

        presComments:
        {
            addPresComments: "Добавить комментарий"
        },

        publish:
        {
            publishLabel: "Сохранить документ в Моих файлах",
            publishDocument: "Сохранить документ в Моих файлах",
            publishDocumentWaitMessage: "Дождитесь сохранения документа в Моих файлах.",
            documentPublished: "Документ сохранен в Моих файлах"
        },

        smarttables:
        {
            toolbarAddST: "Добавить таблицу",
            toolbarDelSTRow: "Удалить строку",
            toolbarDelSTCol: "Удалить столбец",
            toolbarDelST: "Удалить таблицу",
            toolbarChgSTStyle: "Изменить стиль таблицы",
            toolbarMoveSTRowUp: "Переместить строку вверх",
            toolbarMoveSTRowDown: "Переместить строку вниз",
            toolbarMoveSTColBefore: "Переместить столбец перед",
            toolbarMoveSTColAfter: "Переместить столбец после",
            toolbarSortSTColAsc: "Сортировать по возрастанию",
            toolbarSortSTColDesc: "Сортировать по убыванию",
            toolbarResizeSTCols: "Изменить ширину столбцов",
            toolbarMakeHeaderRow: "Создать заголовок",
            toolbarMakeNonHeaderRow: "Создать элемент без заголовка",
            toolbarMakeHeaderCol: "Создать заголовок",
            toolbarMakeNonHeaderCol: "Создать элемент без заголовка",
            toolbarToggleFacetSelection: "Создать категорию в режиме просмотра",
            ctxMenuSmartTable: "Таблица",
            ctxMenuTableProperties: "Свойства таблицы...",
            ctxMenuTableCellProperties: "Свойства ячейки...",
            ctxMenuDeleteST: "Удалить",
            ctxMenuChgSTStyle: "Изменить стиль",
            ctxMenuShowCaption: "Показать название",
            ctxMenuHideCaption: "Скрыть название",
            ctxMenuResizeST: "Изменение размера",
            ctxMenuResizeColumnsST: "Изменить ширину столбцов",
            ctxMenuSTRow: "Строка",
            ctxMenuAddSTRowAbv: "Вставить строку перед",
            ctxMenuAddSTRowBlw: "Вставить строку после",
            ctxMenuMoveSTRowUp: "Переместить строку выше",
            ctxMenuMoveSTRowDown: "Переместить строку ниже",
            ctxMenuDelSTRow: "Удалить",
            ctxMenuSTCol: "Столбец",
            ctxMenuAddSTColBfr: "Вставить столбец перед",
            ctxMenuAddSTColAft: "Вставить столбец после",
            ctxMenuMoveSTColBefore: "Переместить столбец влево",
            ctxMenuMoveSTColAfter: "Переместить столбец вправо",
            ctxMenuDelSTCol: "Удалить",
            ctxMenuSortSTColAsc: "Сортировать по возрастанию",
            ctxMenuSortSTColDesc: "Сортировать по убыванию",
            ctxMenuShowAllFacets: "Показать категории",
            ctxMenuHideAllFacets: "Скрыть категории",
            ctxMenuSTCell: "Ячейка",
            ctxMenuMergeCells: "Объединить ячейки",
            ctxMenuMergeDown: "Объединить с ячейкой ниже",
            ctxMenuVerSplit: "Разбить по вертикали",
            ctxMenuHorSplit: "Разбить по горизонтали",
            ctxMenuAlignTextLeft: "Выровнять по левому краю",
            ctxMenuAlignTextCenter: "Выровнять по центру",
            ctxMenuAlignTextRight: "Выровнять по правому краю",
            ctxMenuClearSTCellContent: "Удалить содержимое",
            ctxMenuMakeHeaderRow: "Использовать выбранную строку как заголовок",
            ctxMenuMakeNonHeaderRow: "Удалить стиль заголовка",
            ctxMenuMakeHeaderCol: "Использовать выбранный столбец как заголовок",
            ctxMenuMakeNonHeaderCol: "Удалить стиль заголовка",
            msgCannotInsertRowBeforeHeader: "Перед заголовком нельзя вставить новую строку.",
            msgCannotInsertCoBeforeHeader: "Перед заголовком нельзя вставить новый столбец.",
            msgCannotMoveHeaderRow: "Невозможно переместить строку заголовка.",
            dlgTitleSTProperties: "Свойства таблицы",
            dlgTitleAddST: "Добавить таблицу",
            dlgLabelSTName: "Имя таблицы:",
            dlgLabelSTType: "Выберите тип заголовка",
            dlgLabelSTRows: "Число строк",
            dlgLabelSTCols: "Число столбцов",
            dlgLabelSTTemplate: "Использовать шаблон",
            dlgMsgValidationRowsMax: "Введите значение от 1 до 200.",
            dlgMsgValidationColsMax: "Введите значение от 1 до 25.",
            dlgMsgValidation: "Значение должно быть целым положительным числом",
            dlgLabelSTInstruction: "Укажите число строк и столбцов. Максимальное значение для строк равно 200, а для столбцов - 25."
        },
        task: {
            titleAssign: "Присвоить раздел",
            ctxMenuTask: "Присвоить",
            ctxMenuCreateTask: "Присвоить раздел",
            ctxMenuDeleteTask: "Удалить",
            ctxMenuClearTask: "Очистить присвоения",
            ctxMenuHideTask: "Скрыть все",
            ctxMenuShowTask: "Показать все"
        },
        tablestyles: {
            tableStylesToolbarLabel: "Изменить стиль таблицы",
            styleTableHeading: "Стиль таблицы",
            recommendedTableHeading: "Рекомендуемый",
            tableStylesGalleryHeading: "Галерея",
            customHeading: "Пользовательский",
            customTableHeading: "Пользовательская таблица",
            customTableCustomizeATable: "Настроить таблицу",
            customTableStyleATable: "Задать стиль таблицы",
            customTableAddATable: "Добавить таблицу",
            customTableSelectTableGrid: "Выбрать сетку таблицы",
            customTableSelectColorScheme: "Выбрать цветовую схему",
            customTableHeader: "Верхний колонтитул",
            customTableBanding: "Чередование",
            customTableSummary: "Итоги",
            customTableBorders: "Границы",
            customTableBackground: "Фон",
            tableStylePlain: "Простой",
            tableStyleBlueStyle: "Голубой стиль",
            tableStyleRedTint: "Красный оттенок",
            tableStyleBlueHeader: "Голубой заголовок",
            tableStyleDarkGrayHeaderFooter: "Темно-серый верхний колонтитул / нижний колонтитул",
            tableStyleLightGrayRows: "Светло-серые строки",
            tableStyleDarkGrayRows: "Темно-серые строки",
            tableStyleBlueTint: "Голубой оттенок",
            tableStyleRedHeader: "Красный заголовок",
            tableStyleGreenHeaderFooter: "Зеленый верхний колонтитул / нижний колонтитул",
            tableStylePlainRows: "Простые строки",
            tableStyleGrayTint: "Серый оттенок",
            tableStyleGreenTint: "Зеленый оттенок",
            tableStyleGreenHeader: "Зеленый заголовок",
            tableStyleRedHeaderFooter: "Красный верхний колонтитул / нижний колонтитул",
            tableStyleGreenStyle: "Зеленый стиль",
            tableStylePurpleTint: "Пурпурный оттенок",
            tableStyleBlackHeader: "Черный заголовок",
            tableStylePurpleHeader: "Пурпурный заголовок",
            tableStyleLightBlueHeaderFooter: "Светло-синий верхний колонтитул / нижний колонтитул"
        },
        toc: {
            title: "Оглавление",
            update: "Обновить",
            del: "Удалить",
            toc: "Оглавление",
            linkTip: "Нажмите Ctrl для перехода",
            pageNumber: "Только номер страницы",
            entireTable: "Вся таблица"
        },
        link: {
            gotolink: "Перейти по ссылке",
            unlink: "Удалить ссылку",
            editlink: "Изменить ссылку"
        },
        field: {
            update: "Обновить поле"
        },
        undo: {
            undoTip: "Отменить",
            redoTip: "Повторить"
        },
        wysiwygarea: {
            failedPasteActions: "Не удалось выполнить вставку. ${productName} не может скопировать и вставить изображения из другого приложения.  Для использования изображения передайте его в ${productName}. ",
            filteredPasteActions: "Не удалось выполнить вставку. Для того чтобы изображение было доступно с другого веб-сайта, загрузите изображение на свой локальный компьютер, а затем передайте файл изображения в ${productName}."
        }
})

