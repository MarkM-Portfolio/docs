define({
        clipboard: {
            pasteTableToTableError: "No puede crear o pegar una tabla dentro de otra tabla.",
            securityMsg: "Debido a los valores de seguridad del navegador, la aplicación no puede acceder al portapapeles.  Para acceder a su portapapeles, escriba Ctrl+V para pegar el contenido en este campo y, a continuación, pulse Aceptar.",
            pasteMaxMsg: "El tamaño del contenido que desea pegar es demasiado grande.",
            cutError: 'Los valores de seguridad del navegador impiden copiar automáticamente. En su lugar, utilice Ctrl+X en el teclado.',
            copyError: 'Los valores de seguridad del navegador impiden copiar automáticamente. En su lugar, utilice Ctrl+C en el teclado.',
            pasteError: "Debido a los valores de seguridad del navegador, la aplicación no puede acceder al portapapeles. En su lugar, utilice Ctrl+V en el teclado.",
            cutErrorOnMac: 'Los valores de seguridad del navegador impiden copiar automáticamente. En su lugar, utilice \u2318X en el teclado.',
            copyErrorOnMac: 'Los valores de seguridad del navegador impiden copiar automáticamente. En su lugar, utilice \u2318C en el teclado.',
            pasteErrorOnMac: "Debido a los valores de seguridad del navegador, la aplicación no puede acceder al portapapeles. En su lugar, utilice \u2318V en el teclado."
        },
        coediting: {
            exitTitle: "Salir de coedición",
            offlineTitle: "Problema de red",
            reloadTitle: "Problema de sincronización",
            firstTab: "Primer tabulador",
            connectMsg: "Pulse el botón ${0} para volver a conectarse, o ${1} para renovar.",
            exitMsg: "Pulse Salir para salir de la modalidad de coedición, o pulse la modalidad de Visualización para cambiar a la modalidad de SÓLO LECTURA.",
            lockMsg: "El editor se bloqueará para impedir que se pierdan datos.",
            connectLabel: "Unir",
            exitLabel: "Salir",
            reloadLabel: "Recargar",
            viewLabel: "Modalidad de vista",
            viweAlert: "MARCADOR DE POSICIÓN para la modalidad de sólo VISUALIZACIÓN",
            forbiddenInput: "No puede entrar texto porque la selección contiene una tarea.",
            taskLockMsg: "${0} está trabajando de forma privada en esta sección. Los cambios se sobrescriben cuando el trabajo de forma privada se envía de nuevo al documento."
        },
        comments:
        {
            commentLabel: "Añadir un comentario",
            deleteComment: "Suprimir comentario",
            showComment: "Mostrar comentario",
            hoverText: "Comentario"
        },
        concordhelp:
        {
            about: "Contenido de Ayuda"
        },

        concordpresentations:
        {
            newSlide: "Nueva diapositiva",
            addImage: "Insertar imagen",
            slideShow: "Iniciar presentación de diapositivas",
            addTextBox: "Añadir cuadro de texto",
            addPresComments: "Añadir un comentario",
            ctxMenuSmartTable: "Añadir tabla",
            slideTemplate: "Estilos maestros",
            slideLayout: "Diseño de diapositiva",
            saveAsDraft: "Guardar"
        },

        concordrestyler:
        {
            toolbarRestylePrevious: "Estilo anterior",
            toolbarRestyleNext: "Estilo siguiente"
        },

        concordsave:
        {
            concordsaveLabel: "Guardar el documento",
            concordpublishLabel: "Publicar una versión",
            publishOkLabel: "Publicar",
            checkinLabel: "Incorporar",
			yesLabel: "Sí"
        },

        concordtemplates:
        {
            toolbarTemplates: "Plantillas",
            dlgLabelDefaultSearchbarValue: "Buscar",
            dlgLabelInitSearchResults: "Resultados: 5 plantillas",
            dlgLabelResults: "Resultados: ",
            dlgLabelTemplates: " plantillas",
            dlgLabelShow: "Mostrar: ",
            dlgLabelAll: " Todo ",
            dlgLabelDoc: "Documentos",
            dlgLabelST: "Tablas",
            dlgLabelSections: "Secciones",
            dlgLabelSeperator: " | ",
            dlgLabelDone: " Hecho ",
            dlgLabelCancel: " Cancelar ",
            dlgInsertSectionError: "No puede insertar una sección porque la selección está dentro de una tabla.",
            dlgLabelDataError: "No se pueden recuperar plantillas en este momento. Vuelva a intentarlo más tarde.",
            dlgTitle: "Plantillas",
            dlgLabelLoading: "Cargando...",
            RESULTS_TOTAL_TEMPLATES: "Resultados: ${0} plantillas",
            template0:
            {
                title: "Fax",
                description: ""
            },
            template1:
            {
                title: "Factura",
                description: ""
            },
            template2:
            {
                title: "Memorándum",
                description: ""
            },
            template3:
            {
                title: "Carta",
                description: ""
            },
            template4:
            {
                title: "Currículum Vitae",
                description: ""
            },
            template5:
            {
                title: "Membrete de empleado",
                description: ""
            },
            template6:
            {
                title: "Membrete de empresa",
                description: ""
            },
            template7:
            {
                title: "Membrete personal",
                description: ""
            },
            template8:
            {
                title: "Membrete de informe de investigación",
                description: ""
            },
            template9:
            {
                title: "Referencias",
                description: ""
            }
        },
        deletekey:
        {
            forbiddenCopy: "No puede copiar el contenido porque la selección contiene tareas o comentarios",
            forbiddenCut: "No puede cortar el contenido porque la selección contiene una tarea",
            forbiddenDelete: "No puede suprimir el contenido porque la selección contiene una tarea."
        },
        dialogmessage:
        {
            title: "Mensaje",
            dlgTitle: "Mensaje",
            validate: "validar",
            dialogMessage: "Mensaje de diálogo aquí"
        },

        increasefont:
        {
            fail: "No puede seguir aumentando o disminuyendo el tamaño de font. Ha alcanzado el valor máximo o mínimo."
        },

        list:
        {
            disableMutliRangeSel: "No puede añadir números ni viñetas a líneas discontinuas en una operación. Intente añadir los números o las viñetas a las líneas de uno a uno.",
            disableBullet: "No puede añadir números ni viñetas al selector de tareas. Intente seleccionar el botón Acciones y, a continuación, añada los números o las viñetas."
        },

        listPanel:
        {
            continuelabel: "Continuar lista",
            restartlabel: "Reiniciar lista"
        },
        liststyles:
        {
            // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
            titles:
            {
                numeric: "Numeración",
                bullets: "Viñetas",
                multilevel: "Listas de varios niveles"  // for both numeric and bullet lists
            },
            numeric:
            {
                numeric1: "Numérico 1",
                numeric2: "Numérico 2",
                numericParen: "Paréntesis numérico",
                numericLeadingZero: "Cero inicial numérico",
                upperAlpha: "Alfabético mayúsculas",
                upperAlphaParen: "Paréntesis alfabético mayúscula",
                lowerAlpha: "Alfabético minúsculas",
                lowerAlphaParen: "Paréntesis alfabético minúscula",
                upperRoman: "Romanos en mayúsculas",
                lowerRoman: "Romanos en minúsculas",
                japanese1: "Numérico japonés 1",
                japanese2: "Numérico japonés 2"
            },
            multilevelNumeric:
            {
                numeric: "Numérico",
                tieredNumbers: "Números en niveles",
                alphaNumeric: "Alfanumérico",
                numericRoman: "Romano numérico",
                numericArrows: "Flechas numéricas / descendentes",
                alphaNumericBullet: "Alfanumérico / viñeta",
                alphaRoman: "Romano alfabético",
                lowerAlphaSquares: "Alfabético / cuadrados en minúsculas",
                upperRomanArrows: "Romano / flechas en mayúsculas"
            },
            bullets:
            {
                circle: "Círculo",
                cutOutSquare: "Cuadrado cortado",
                rightArrow: "Flecha derecha",
                diamond: "Rombo",
                doubleArrow: "Doble flecha",
                asterisk: "Asterisco",
                thinArrow: "Flecha delgada",
                checkMark: "Marca de selección",
                plusSign: "Signo más",
                // TODO - captions for image bullets
                //      - using image titles as starting point
                //        (see images in story 42428 in pre-2012 RTC repository)
                imgBlueCube: "Cubo azul",
                imgBlackSquare: "Cuadrado negro",
                imgBlueAbstract: "Resumen azul",
                imgLeaf: "Hoja",
                imgSilver: "Círculo plateado",
                imgRedArrow: "Flecha roja",
                imgBlackArrow: "Flecha negra",
                imgPurpleArrow: "Flecha púrpura",
                imgGreenCheck: "Marca de selección verde",
                imgRedX: "X roja",
                imgGreenFlag: "Bandera verde",
                imgRedFlag: "Bandera roja",
                imgStar: "Estrella"
            },
            multilevelBullets:
            {
                numeric: "Numérico",
                tieredNumbers: "Números en niveles",
                lowerAlpha: "Alfabético minúsculas",
                alphaRoman: "Romano alfabético",
                lowerRoman: "Romanos en minúsculas",
                upperRoman: "Romanos en mayúsculas",
                dirArrows: "Flechas direccionales",
                descCircles: "Círculos descendentes",
                descSquares: "Cuadrados descendentes"
            }
        },

        presComments:
        {
            addPresComments: "Añadir un comentario"
        },

        publish:
        {
            publishLabel: "Guardar documento en Mis archivos",
            publishDocument: "Guardar documento en Mis archivos",
            publishDocumentWaitMessage: "Espere mientras se guarda el documento en Mis archivos.",
            documentPublished: "Documento guardado en Mis archivos"
        },

        smarttables:
        {
            toolbarAddST: "Añadir tabla",
            toolbarDelSTRow: "Suprimir fila",
            toolbarDelSTCol: "Suprimir columna",
            toolbarDelST: "Suprimir tabla",
            toolbarChgSTStyle: "Cambiar estilo de tabla",
            toolbarMoveSTRowUp: "Mover fila arriba",
            toolbarMoveSTRowDown: "Mover fila abajo",
            toolbarMoveSTColBefore: "Mover columna después",
            toolbarMoveSTColAfter: "Mover columna antes",
            toolbarSortSTColAsc: "Orden ascendente",
            toolbarSortSTColDesc: "Orden descendente",
            toolbarResizeSTCols: "Redimensionar columnas",
            toolbarMakeHeaderRow: "Convertir en cabecera",
            toolbarMakeNonHeaderRow: "Convertir en no cabecera",
            toolbarMakeHeaderCol: "Convertir en cabecera",
            toolbarMakeNonHeaderCol: "Convertir en no cabecera",
            toolbarToggleFacetSelection: "Generar categoría en modo de visualización",
            ctxMenuSmartTable: "Tabla",
            ctxMenuTableProperties: "Propiedades de tabla...",
            ctxMenuTableCellProperties: "Propiedades de celda...",
            ctxMenuDeleteST: "Suprimir",
            ctxMenuChgSTStyle: "Cambiar estilo",
            ctxMenuShowCaption: "Mostrar título",
            ctxMenuHideCaption: "Ocultar título",
            ctxMenuResizeST: "Redimensionar",
            ctxMenuResizeColumnsST: "Redimensionar columnas",
            ctxMenuSTRow: "Fila",
            ctxMenuAddSTRowAbv: "Insertar fila antes",
            ctxMenuAddSTRowBlw: "Insertar fila después",
            ctxMenuMoveSTRowUp: "Subir fila",
            ctxMenuMoveSTRowDown: "Bajar fila",
            ctxMenuDelSTRow: "Suprimir",
            ctxMenuSTCol: "Columna",
            ctxMenuAddSTColBfr: "Insertar columna antes",
            ctxMenuAddSTColAft: "Insertar columna después",
            ctxMenuMoveSTColBefore: "Mover columna a la izquierda",
            ctxMenuMoveSTColAfter: "Mover columna a la derecha",
            ctxMenuDelSTCol: "Suprimir",
            ctxMenuSortSTColAsc: "Orden ascendente",
            ctxMenuSortSTColDesc: "Orden descendente",
            ctxMenuShowAllFacets: "Mostrar categorías",
            ctxMenuHideAllFacets: "Ocultar categorías",
            ctxMenuSTCell: "Celda",
            ctxMenuMergeCells: "Combinar celdas",
            ctxMenuMergeDown: "Fusionar con celda de debajo",
            ctxMenuVerSplit: "Dividir verticalmente",
            ctxMenuHorSplit: "Dividir horizontalmente",
            ctxMenuAlignTextLeft: "Alinear izquierda",
            ctxMenuAlignTextCenter: "Alinear centro",
            ctxMenuAlignTextRight: "Alinear derecha",
            ctxMenuClearSTCellContent: "Borrar contenido",
            ctxMenuMakeHeaderRow: "Utilizar fila seleccionada como cabecera",
            ctxMenuMakeNonHeaderRow: "Eliminar estilo de cabecera",
            ctxMenuMakeHeaderCol: "Utilizar columna seleccionada como cabecera",
            ctxMenuMakeNonHeaderCol: "Eliminar estilo de cabecera",
            msgCannotInsertRowBeforeHeader: "No se puede insertar una fila nueva antes de la cabecera",
            msgCannotInsertCoBeforeHeader: "No se puede insertar una columna nueva antes de la cabecera",
            msgCannotMoveHeaderRow: "La fila de la cabecera no se puede desplazar",
            dlgTitleSTProperties: "Propiedades de tabla",
            dlgTitleAddST: "Añadir una tabla",
            dlgLabelSTName: "Nombre de tabla:",
            dlgLabelSTType: "Seleccionar tipo de cabecera",
            dlgLabelSTRows: "Número de filas",
            dlgLabelSTCols: "Número de columnas",
            dlgLabelSTTemplate: "Utilizar plantilla",
            dlgMsgValidationRowsMax: "Especifique un número entre el 1 y el 200.",
            dlgMsgValidationColsMax: "Especifique un número entre el 1 y el 25.",
            dlgMsgValidation: "El valor debe ser un entero positivo",
            dlgLabelSTInstruction: "Especifique el número de filas y columnas. El valor máximo es de 200 para filas y de 25 para columnas."
        },
        task: {
            titleAssign: "Asignar sección",
            ctxMenuTask: "Asignar",
            ctxMenuCreateTask: "Asignar una sección",
            ctxMenuDeleteTask: "Suprimir",
            ctxMenuClearTask: "Borrar asignaciones",
            ctxMenuHideTask: "Ocultar todo",
            ctxMenuShowTask: "Mostrar todo"
        },
        tablestyles: {
            tableStylesToolbarLabel: "Cambiar estilo de tabla",
            styleTableHeading: "Tabla de estilo",
            recommendedTableHeading: "Recomendada",
            tableStylesGalleryHeading: "Galería",
            customHeading: "Personalizada",
            customTableHeading: "Tabla personalizada",
            customTableCustomizeATable: "Personalizar una tabla",
            customTableStyleATable: "Dar estilo a una tabla",
            customTableAddATable: "Añadir una tabla",
            customTableSelectTableGrid: "Seleccionar cuadrícula de tabla",
            customTableSelectColorScheme: "Seleccionar combinación de colores",
            customTableHeader: "Cabecera",
            customTableBanding: "Categorización",
            customTableSummary: "Resumen",
            customTableBorders: "Bordes",
            customTableBackground: "Fondo",
            tableStylePlain: "Sin formato",
            tableStyleBlueStyle: "Estilo azul",
            tableStyleRedTint: "Tono rojo",
            tableStyleBlueHeader: "Cabecera azul",
            tableStyleDarkGrayHeaderFooter: "Cabecera/pie de página gris oscuro",
            tableStyleLightGrayRows: "Filas gris claro",
            tableStyleDarkGrayRows: "Filas gris oscuro",
            tableStyleBlueTint: "Tono azul",
            tableStyleRedHeader: "Cabecera roja",
            tableStyleGreenHeaderFooter: "Cabecera/pie de página verde",
            tableStylePlainRows: "Filas sin formato",
            tableStyleGrayTint: "Tono gris",
            tableStyleGreenTint: "Tono verde",
            tableStyleGreenHeader: "Cabecera verde",
            tableStyleRedHeaderFooter: "Cabecera/pie de página rojo",
            tableStyleGreenStyle: "Estilo verde",
            tableStylePurpleTint: "Tono púrpura",
            tableStyleBlackHeader: "Cabecera negra",
            tableStylePurpleHeader: "Cabecera púrpura",
            tableStyleLightBlueHeaderFooter: "Cabecera/pie de página azul claro"
        },
        toc: {
            title: "Índice de contenido",
            update: "Actualizar",
            del: "Suprimir",
            toc: "Índice de contenido",
            linkTip: "Pulse Control para navegar",
            pageNumber: "Sólo número de página",
            entireTable: "Toda la tabla"
        },
        link: {
            gotolink: "Ir a enlace",
            unlink: "Eliminar enlace",
            editlink: "Editar enlace"
        },
        field: {
            update: "Actualizar campo"
        },
        undo: {
            undoTip: "Deshacer",
            redoTip: "Rehacer"
        },
        wysiwygarea: {
            failedPasteActions: "No se ha podido pegar. ${productName} no puede copiar y pegar imágenes desde otra aplicación.  Suba el archivo de imagen a ${productName} para utilizar la imagen allí. ",
            filteredPasteActions: "No se ha podido pegar. Para que la imagen esté disponible desde otro sitio web, descargue la imagen a su sistema local y, a continuación, cargue el archivo de imagen en ${productName}."
        }
})

