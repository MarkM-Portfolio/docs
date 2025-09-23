/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "Editor de texto enriquecido, %1.",

	// ARIA descriptions.
	toolbars	: "Editor de barras de herramientas",
	editor	: "Editor de texto enriquecido",

	// Toolbar buttons without dialogs.
	source			: "Origen",
	newPage			: "Página nueva",
	save			: "Guardar",
	preview			: "Vista previa:",
	cut				: "Cortar",
	copy			: "Copiar",
	paste			: "Pegar",
	print			: "Imprimir",
	underline		: "Subrayado",
	bold			: "Negrita",
	italic			: "Cursiva",
	selectAll		: "Seleccionar todo",
	removeFormat	: "Eliminar formato",
	strike			: "Tachado",
	subscript		: "Subíndice",
	superscript		: "Superíndice",
	horizontalrule	: "Insertar línea horizontal",
	pagebreak		: "Insertar salto de página",
	pagebreakAlt		: "Salto de página",
	unlink			: "Eliminar enlace",
	undo			: "Deshacer",
	redo			: "Rehacer",

	// Common messages and labels.
	common :
	{
		browseServer	: "Servidor de navegador:",
		url				: "URL:",
		protocol		: "Protocolo:",
		upload			: "Subir:",
		uploadSubmit	: "Enviar al servidor",
		image			: "Insertar imagen",
		flash			: "Insertar película de flash",
		form			: "Insertar formulario",
		checkbox		: "Insertar recuadro de selección",
		radio			: "Insertar botón de selección",
		textField		: "Insertar campo de texto",
		textarea		: "Insertar área de texto",
		hiddenField		: "Insertar campo oculto",
		button			: "Insertar botón",
		select			: "Insertar campo de selección",
		imageButton		: "Insertar botón de imagen",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Nombre:",
		langDir			: "Dirección del texto: ",
		langDirLtr		: "De izquierda a derecha",
		langDirRtl		: "De derecha a izquierda",
		langCode		: "Código de idioma:",
		longDescr		: "URL de descripción detallada:",
		cssClass		: "Clases de hoja de estilos:",
		advisoryTitle	: "Título consultivo:",
		cssStyle		: "Estilo:",
		ok				: "Aceptar",
		cancel			: "Cancelar",
		close : "Cerrar",
		preview			: "Vista previa:",
		generalTab		: "General",
		advancedTab		: "Opciones avanzadas",
		validateNumberFailed	: "Este valor no es un número.",
		confirmNewPage	: "Todos los cambios no guardados en este contenido se perderán. ¿Está seguro de que desea cargar una nueva página?",
		confirmCancel	: "Alguna de las opciones han cambiado. ¿Está seguro de que desea cerrar el diálogo?",
		options : "Opciones",
		target			: "Destino:",
		targetNew		: "Nueva ventana (_blank)",
		targetTop		: "Ventana más alta (_top)",
		targetSelf		: "Misma ventana (_self)",
		targetParent	: "Ventana padre (_parent)",
		langDirLTR		: "De izquierda a derecha",
		langDirRTL		: "De derecha a izquierda",
		styles			: "Estilo:",
		cssClasses		: "Clases de hoja de estilos:",
		width			: "Anchura:",
		height			: "Altura:",
		align			: "Alinear:",
		alignLeft		: "Izquierda",
		alignRight		: "Derecha",
		alignCenter		: "Centro",
		alignTop		: "Arriba",
		alignMiddle		: "Medio",
		alignBottom		: "Abajo",
		invalidHeight	: "La altura debe ser un número entero positivo.",
		invalidWidth	: "La anchura debe ser un número entero positivo.",
		invalidCssLength	: "El valor especificado para el campo '%1' debe ser un número positivo con o sin una unidad de medida CSS válida (px, %, in, cm, mm, em, ex, pt o pc).",
		invalidHtmlLength	: "El valor especificado para el campo '%1' debe ser un número positivo con o sin una unidad de medida HTML (px o %).",
		invalidInlineStyle	: "El valor especificado para el estilo en línea debe estar formado por uno o varios tuples con el formato de \"name : value\", separado por puntos y comas.",
		cssLengthTooltip	: "Escriba un número para un valor en píxeles o un número con una unidad CSS válida (px, %, in, cm, mm, em, ex, pt o pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, no disponible</span>"
	},

	contextmenu :
	{
		options : "Opciones de menú de contexto"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Insertar carácter especial",
		title		: "Símbolo",
		options : "Opciones de carácter especial"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Enlace de URL",
		other 		: "<other>",
		menu		: "Editar enlace...",
		title		: "Enlace",
		info		: "Información de enlace",
		target		: "Destino",
		upload		: "Subir:",
		advanced	: "Opciones avanzadas",
		type		: "Tipo de enlace:",
		toUrl		: "URL",
		toAnchor	: "Enlazar con ancla en el texto",
		toEmail		: "Correo electrónico",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nombre de marco de destino:",
		targetPopupName	: "Nombre de ventana emergente:",
		popupFeatures	: "Características de ventana emergente:",
		popupResizable	: "Redimensionable",
		popupStatusBar	: "Barra de estado",
		popupLocationBar	: "Barra de ubicación",
		popupToolbar	: "Barra de herramientas",
		popupMenuBar	: "Barra de menús",
		popupFullScreen	: "Pantalla completa (IE)",
		popupScrollBars	: "Barras de desplazamiento",
		popupDependent	: "Dependiente (Netscape)",
		popupLeft		: "Posición izquierda",
		popupTop		: "Posición superior",
		id				: "Id:",
		langDir			: "Dirección del texto: ",
		langDirLTR		: "De izquierda a derecha",
		langDirRTL		: "De derecha a izquierda",
		acccessKey		: "Clave de acceso:",
		name			: "Nombre:",
		langCode		: "Código de idioma:",
		tabIndex		: "Índice de separadores:",
		advisoryTitle	: "Título consultivo:",
		advisoryContentType	: "Tipo de contenido consultivo:",
		cssClasses		: "Clases de hoja de estilos:",
		charset			: "Juego de caracteres de recursos enlazados:",
		styles			: "Estilo:",
		rel			: "Relación",
		selectAnchor	: "Seleccionar un ancla",
		anchorName		: "Por nombre de ancla",
		anchorId		: "Por ID de elemento",
		emailAddress	: "Dirección de correo electrónico",
		emailSubject	: "Asunto del mensaje",
		emailBody		: "Cuerpo del mensaje",
		noAnchors		: "Sin marcadores disponibles en el documento. Pulse el icono 'Insertar marcador del documento' de la barra de herramientas para añadir uno.",
		noUrl			: "Escriba el URL de enlace",
		noEmail			: "Escriba la dirección de correo electrónico"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Insertar un marcador de documento",
		menu		: "Editar un marcador de documento",
		title		: "Marcador de documentos",
		name		: "Nombre:",
		errorName	: "Escriba un nombre para el marcador de documentos",
		remove		: "Eliminar un marcador de documentos"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Propiedades de lista numerada",
		bulletedTitle		: "Propiedades de lista con viñetas",
		type				: "Tipo",
		start				: "Inicio",
		validateStartNumber				:"El número de inicio de lista debe ser un número entero.",
		circle				: "Círculo",
		disc				: "Disco",
		square				: "Cuadrado",
		none				: "Ninguna",
		notset				: "<not set>",
		armenian			: "Numeración armenia",
		georgian			: "Numeración georgiana (an, ban, gan, etc.)",
		lowerRoman			: "Numeración romana en minúsculas (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Numeración romana en mayúsculas (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Orden alfabético en minúsculas (a, b, c, d, e, etc.)",
		upperAlpha			: "Orden alfabético en mayúsculas (A, B, C, D, E, etc.)",
		lowerGreek			: "Alfabeto griego en minúsculas (alfa, beta, gamma, etc.)",
		decimal				: "Numeración decimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Numeración decimal con cero inicial (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Buscar y sustituir",
		find				: "Buscar",
		replace				: "Sustituir",
		findWhat			: "Buscar:",
		replaceWith			: "Sustituir por:",
		notFoundMsg			: "No se ha encontrado el texto específico.",
		noFindVal			: 'El texto que desea buscar es obligatorio.',
		findOptions			: "Opciones de búsqueda",
		matchCase			: "Coincidir mayúsculas y minúsculas",
		matchWord			: "Coincidir sólo palabra completa",
		matchCyclic			: "Coincidencia cíclica",
		replaceAll			: "Sustituir todo",
		replaceSuccessMsg	: "Se han sustituido %1 apariciones."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Insertar tabla",
		title		: "Tabla",
		menu		: "Propiedades de tabla",
		deleteTable	: "Suprimir tabla",
		rows		: "Filas:",
		columns		: "Columnas:",
		border		: "Tamaño de marco:",
		widthPx		: "Píxeles",
		widthPc		: "porcentaje",
		widthUnit	: "Unidad de anchura:",
		cellSpace	: "Espaciado de celda:",
		cellPad		: "Relleno de celda:",
		caption		: "Título:",
		summary		: "Resumen:",
		headers		: "Cabeceras:",
		headersNone		: "Ninguna",
		headersColumn	: "Primera columna",
		headersRow		: "Primera fila",
		headersBoth		: "Ambas",
		invalidRows		: "El número de filas debe ser un número entero mayor que cero.",
		invalidCols		: "El número de columnas debe ser un número entero mayor que cero.",
		invalidBorder	: "El tamaño de marco debe ser un número positivo.",
		invalidWidth	: "La anchura de tabla debe ser un número positivo.",
		invalidHeight	: "La altura de tabla debe ser un número positivo.",
		invalidCellSpacing	: "El espaciado de celda debe ser un número positivo.",
		invalidCellPadding	: "El relleno de celda debe ser un número positivo.",

		cell :
		{
			menu			: "Celda",
			insertBefore	: "Insertar celda antes",
			insertAfter		: "Insertar celda después",
			deleteCell		: "Suprimir celdas",
			merge			: "Fusionar celdas",
			mergeRight		: "Fusionar derecha",
			mergeDown		: "Fusionar abajo",
			splitHorizontal	: "Dividir celda horizontalmente",
			splitVertical	: "Dividir celda verticalmente",
			title			: "Propiedades de celda",
			cellType		: "Tipo de celda:",
			rowSpan			: "Distribución de filas:",
			colSpan			: "Distribución de columnas:",
			wordWrap		: "Ajuste de línea:",
			hAlign			: "Alineación horizontal:",
			vAlign			: "Alineación vertical:",
			alignBaseline	: "Línea base",
			bgColor			: "Color de fondo:",
			borderColor		: "Color del marco:",
			data			: "Datos",
			header			: "Cabecera",
			yes				: "Sí",
			no				: "No",
			invalidWidth	: "La anchura de celda debe ser un número positivo.",
			invalidHeight	: "La altura de celda debe ser un número positivo.",
			invalidRowSpan	: "La distribución de celdas debe ser un número entero positivo.",
			invalidColSpan	: "La distribución de columnas debe ser un número entero positivo.",
			chooseColor : "Elegir"
		},

		row :
		{
			menu			: "Fila",
			insertBefore	: "Insertar fila antes",
			insertAfter		: "Insertar fila después",
			deleteRow		: "Suprimir filas"
		},

		column :
		{
			menu			: "Columna",
			insertBefore	: "Insertar columna antes",
			insertAfter		: "Insertar columna después",
			deleteColumn	: "Suprimir columnas"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Propiedades del botón",
		text		: "Texto (valor):",
		type		: "Tipo:",
		typeBtn		: "Botón",
		typeSbm		: "Enviar",
		typeRst		: "Restablecer"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Propiedades del recuadro de selección",
		radioTitle	: "Propiedades del botón de selección",
		value		: "Valor:",
		selected	: "Seleccionado"
	},

	// Form Dialog.
	form :
	{
		title		: "Insertar formulario",
		menu		: "Propiedades de formulario",
		action		: "Acción:",
		method		: "Método:",
		encoding	: "Codificación:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Seleccionar propiedades de campo",
		selectInfo	: "Seleccionar información",
		opAvail		: "Opciones disponibles",
		value		: "Valor:",
		size		: "Tamaño:",
		lines		: "líneas",
		chkMulti	: "Permitir varias selecciones",
		opText		: "Texto:",
		opValue		: "Valor:",
		btnAdd		: "Añadir",
		btnModify	: "Modificar",
		btnUp		: "Arriba",
		btnDown		: "Abajo",
		btnSetValue : "Establecer como valor seleccionado",
		btnDelete	: "Suprimir"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Propiedades de área de texto",
		cols		: "Columnas:",
		rows		: "Filas:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Propiedades de campo de texto",
		name		: "Nombre:",
		value		: "Valor:",
		charWidth	: "Anchura de caracteres:",
		maxChars	: "Número máximo de caracteres:",
		type		: "Tipo:",
		typeText	: "Texto",
		typePass	: "Contraseña"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Propiedades de campo oculto",
		name	: "Nombre:",
		value	: "Valor:"
	},

	// Image Dialog.
	image :
	{
		title		: "Imagen",
		titleButton	: "Propiedades del botón de imagen",
		menu		: "Propiedades de imagen...",
		infoTab	: "Información de la imagen",
		btnUpload	: "Enviar al servidor",
		upload	: "Subir",
		alt		: "Texto alternativo:",
		lockRatio	: "Bloquear proporción",
		resetSize	: "Restablecer tamaño",
		border	: "Marco:",
		hSpace	: "Espacio horizontal:",
		vSpace	: "Espacio vertical:",
		alertUrl	: "Escriba el URL de imagen",
		linkTab	: "Enlace",
		button2Img	: "¿Desea transformar el botón de imagen seleccionado en una imagen simple?",
		img2Button	: "¿Desea transformar la imagen seleccionada en un botón de imagen?",
		urlMissing : "Falta el URL de origen de imagen.",
		validateBorder : "El borde debe ser un número entero positivo.",
		validateHSpace : "El espacio horizontal debe ser un número entero positivo.",
		validateVSpace : "El espacio vertical debe ser un número entero positivo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Propiedades de flash",
		propertiesTab	: "Propiedades",
		title		: "Intermitente",
		chkPlay		: "Reproducción automática",
		chkLoop		: "Bucle",
		chkMenu		: "Habilitar menú de flash",
		chkFull		: "Permitir pantalla completa",
 		scale		: "Escala:",
		scaleAll		: "Mostrar todo",
		scaleNoBorder	: "Sin marco",
		scaleFit		: "Ajuste exacto",
		access			: "Acceso de script:",
		accessAlways	: "Siempre",
		accessSameDomain	: "Mismo dominio",
		accessNever	: "Nunca",
		alignAbsBottom: "Abs abajo",
		alignAbsMiddle: "Abs medio",
		alignBaseline	: "Línea base",
		alignTextTop	: "Texto parte superior",
		quality		: "Calidad:",
		qualityBest	: "Mejor",
		qualityHigh	: "Alta",
		qualityAutoHigh	: "Alta automática",
		qualityMedium	: "Media",
		qualityAutoLow	: "Baja automática",
		qualityLow	: "Baja",
		windowModeWindow	: "Ventana",
		windowModeOpaque	: "Opaca",
		windowModeTransparent	: "Transparente",
		windowMode	: "Modalidad de ventana:",
		flashvars	: "Variables:",
		bgcolor	: "Color de fondo:",
		hSpace	: "Espacio horizontal:",
		vSpace	: "Espacio vertical:",
		validateSrc : "URL no debe estar vacío.",
		validateHSpace : "El espacio horizontal debe ser un número entero positivo.",
		validateVSpace : "El espacio vertical debe ser un número entero positivo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Corrección ortográfica",
		title			: "Comprobar ortografía",
		notAvailable	: "Lo sentimos pero el servicio ahora no está disponible.",
		errorLoading	: "Error al cargar el host de servicio de aplicación: %s.",
		notInDic		: "No está en diccionario",
		changeTo		: "Cambiar por",
		btnIgnore		: "Ignorar",
		btnIgnoreAll	: "Ignorar todo",
		btnReplace		: "Sustituir",
		btnReplaceAll	: "Sustituir todo",
		btnUndo			: "Deshacer",
		noSuggestions	: "- Sin sugerencias -",
		progress		: "Comprobar ortografía en curso...",
		noMispell		: "La comprobación ortográfica ha finalizado: no se ha encontrado ningún error ortográfico",
		noChanges		: "La comprobación ortográfica ha finalizado: no ha cambiado ninguna palabra.",
		oneChange		: "La comprobación ortográfica ha finalizado: ha cambiado una palabra.",
		manyChanges		: "La comprobación ortográfica ha finalizado: %1 palabras cambiadas.",
		ieSpellDownload	: "Corrector ortográfico no instalado. ¿Desea bajarlo ahora?"
	},

	smiley :
	{
		toolbar	: "Insertar emoticono",
		title	: "Emoticonos",
		options : "Opciones de emoticono"
	},

	elementsPath :
	{
		eleLabel : "Vía de acceso de elementos",
		eleTitle : "%1 elemento"
	},

	numberedlist : "Lista numerada",
	bulletedlist : "Lista con viñetas",
	indent : "Aumentar sangría",
	outdent : "Reducir sangría",

	bidi :
	{
		ltr : "De izquierda a derecha",
		rtl : "De derecha a izquierda",
	},

	justify :
	{
		left : "Alinear izquierda",
		center : "Alinear centro",
		right : "Alinear derecha",
		block : "Alineación justificada"
	},

	blockquote : "Cita en bloque",

	clipboard :
	{
		title		: "Pegar",
		cutError	: "Los valores de seguridad del nageador impiden cortar automáticamente. En su lugar, utilice Ctrl+X en el teclado.",
		copyError	: "Los valores de seguridad del navegador impiden copiar automáticamente. En su lugar, utilice Ctrl+C en el teclado.",
		pasteMsg	: "Pulse Control+V (Cmd+V en MAC) para pegar más abajo.",
		securityMsg	: "La seguridad de su navegador impide copiar directamente desde el portapapeles.",
		pasteArea	: "Pegar área"
	},

	pastefromword :
	{
		confirmCleanup	: "El texto que desea pegar parece que se ha copiado de Word. ¿Desea borrarlo antes de pegar?",
		toolbar			: "Pegado especial",
		title			: "Pegado especial",
		error			: "No fue posible borrar los datos pegados debido a un error interno"
	},

	pasteText :
	{
		button	: "Pegar como texto sin formato",
		title	: "Pegar como texto sin formato"
	},

	templates :
	{
		button 			: "Plantillas",
		title : "Plantillas de contenido",
		options : "Opciones de plantilla",
		insertOption: "Sustituir contenido actual",
		selectPromptMsg: "Seleccione la plantilla que desea abrir en el editor",
		emptyListMsg : "(No se ha definido ninguna plantilla)"
	},

	showBlocks : "Mostrar bloques",

	stylesCombo :
	{
		label		: "Estilos",
		panelTitle 	: "Estilos",
		panelTitle1	: "Estilos de bloque",
		panelTitle2	: "Estilos en línea",
		panelTitle3	: "Estilos de objeto"
	},

	format :
	{
		label		: "Formato",
		panelTitle	: "Formato de párrafo",

		tag_p		: "Normal",
		tag_pre		: "Formateado",
		tag_address	: "Dirección",
		tag_h1		: "Cabecera 1",
		tag_h2		: "Cabecera 2",
		tag_h3		: "Cabecera 3",
		tag_h4		: "Cabecera 4",
		tag_h5		: "Cabecera 5",
		tag_h6		: "Cabecera 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Crear contenedor Div",
		toolbar				: "Crear contenedor Div",
		cssClassInputLabel	: "Clases de hoja de estilo",
		styleSelectLabel	: "Estilo",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Código de idioma",
		inlineStyleInputLabel	: "Estilo en línea",
		advisoryTitleInputLabel	: "Título consultivo",
		langDirLabel		: "Dirección del texto",
		langDirLTRLabel		: "De izquierda a derecha",
		langDirRTLLabel		: "De derecha a izquierda",
		edit				: "Editar Div",
		remove				: "Eliminar Div"
  	},

	iframe :
	{
		title		: "Propiedades IFrame",
		toolbar		: "Insertar IFrame",
		noUrl		: "Escriba el URL de iframe",
		scrolling	: "Habilitar las barras de desplazamiento",
		border		: "Mostrar el borde del marco"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Nombre de font"
	},

	fontSize :
	{
		label		: "Tamaño",
		voiceLabel	: "Tamaño de font",
		panelTitle	: "Tamaño de font"
	},

	colorButton :
	{
		textColorTitle	: "Color de texto",
		bgColorTitle	: "Color de fondo",
		panelTitle		: "Colores",
		auto			: "Automático",
		more			: "Más colores..."
	},

	colors :
	{
		"000" : "Negro",
		"800000" : "Granate",
		"8B4513" : "Marrón medio",
		"2F4F4F" : "Gris pizarra oscuro",
		"008080" : "Azul verde",
		"000080" : "Azul marino",
		"4B0082" : "Añil",
		"696969" : "Gris oscuro",
		"B22222" : "Rojo ladrillo",
		"A52A2A" : "Marrón",
		"DAA520" : "Oro vivo",
		"006400" : "Verde oscuro",
		"40E0D0" : "Turquesa",
		"0000CD" : "Azul medio",
		"800080" : "Púrpura",
		"808080" : "Gris",
		"F00" : "Rojo",
		"FF8C00" : "Naranja oscuro",
		"FFD700" : "Dorado",
		"008000" : "Verde",
		"0FF" : "Cian",
		"00F" : "Azul",
		"EE82EE" : "Violeta",
		"A9A9A9" : "Gris apagado",
		"FFA07A" : "Salmón claro",
		"FFA500" : "Naranja",
		"FFFF00" : "Amarillo",
		"00FF00" : "Lima",
		"AFEEEE" : "Turquesa pálido",
		"ADD8E6" : "Azul claro",
		"DDA0DD" : "Ciruela",
		"D3D3D3" : "Gris claro",
		"FFF0F5" : "Lavanda",
		"FAEBD7" : "Blanco antiguo",
		"FFFFE0" : "Amarillo claro",
		"F0FFF0" : "Melón",
		"F0FFFF" : "Celeste",
		"F0F8FF" : "Cian azul",
		"E6E6FA" : "Lavanda",
		"FFF" : "Blanco"
	},

	scayt :
	{
		title			: "Revisión ortográfica a medida que escribe",
		opera_title		: "No soportado por Opera",
		enable			: "Habilitar SCAYT",
		disable			: "Inhabilitar SCAYT",
		about			: "Acerca de SCAYT",
		toggle			: "Conmutar SCAYT",
		options			: "Opciones",
		langs			: "Idiomas",
		moreSuggestions	: "Más sugerencias",
		ignore			: "Ignorar",
		ignoreAll		: "Ignorar todo",
		addWord			: "Añadir palabra",
		emptyDic		: "El nombre de diccionario no debe estar vacío.",

		optionsTab		: "Opciones",
		allCaps			: "Ignorar palabras sólo en mayúsculas",
		ignoreDomainNames : "Ignorar nombres de dominio",
		mixedCase		: "Ignorar palabras que combinan mayúsculas y minúsculas",
		mixedWithDigits	: "Ignorar palabras con números",

		languagesTab	: "Idiomas",

		dictionariesTab	: "Diccionarios",
		dic_field_name	: "Nombre de diccionario",
		dic_create		: "Crear",
		dic_restore		: "Restaurar",
		dic_delete		: "Suprimir",
		dic_rename		: "Renombrar",
		dic_info		: "Inicialmente el diccionario del usuario se almacena en una cookie, pero las cookies tienen un tamaño limitado. Cuando el diccionario del usuario crece hasta un punto en el cual ya no puede almacenarse en una cookie, debe almacenarse en nuestro servidor. Para almacenar su diccionario personal en nuestro servidor, debe especificar un nombre para su diccionario. Si ya dispone de un diccionario almacenado, escriba su nombre y pulse el botón Restaurar.",

		aboutTab		: "Acerca de"
	},

	about :
	{
		title		: "Acerca de CKEditor",
		dlgTitle	: "Acerca de CKEditor",
		help	: "Compruebe $1 para obtener ayuda.",
		userGuide : "Guía del usuario de CKEditor",
		moreInfo	: "Para obtener información sobre licencia, visite nuestro sitio web:",
		copy		: "Copyright &copy; $1. Reservados todos los derechos."
	},

	maximize : "Maximizar",
	minimize : "Minimizar",

	fakeobjects :
	{
		anchor	: "Ancla",
		flash	: "Animación flash",
		iframe		: "Trama de información",
		hiddenfield	: "Campo oculto",
		unknown	: "Objeto desconocido"
	},

	resize : "Arrastrar para redimensionar",

	colordialog :
	{
		title		: "Seleccionar color",
		options	:	"Opciones de color",
		highlight	: "Resaltar",
		selected	: "Color seleccionado",
		clear		: "Borrar"
	},

	toolbarCollapse	: "Contraer barra de herramientas",
	toolbarExpand	: "Expandir barra de herramientas",

	toolbarGroups :
	{
		document : "Documento",
		clipboard : "Portapapeles/Deshacer",
		editing : "Editar",
		forms : "Formularios",
		basicstyles : "Estilos básicos",
		paragraph : "Párrafo",
		links : "Enlaces",
		insert : "Insertar",
		styles : "Estilos",
		colors : "Colores",
		tools : "Herramientas"
	},

	bidi :
	{
		ltr : "Cambiar la dirección del texto de izquierda a derecha",
		rtl : "Cambiar la dirección del texto de derecha a izquierda"
	},

	docprops :
	{
		label : "Propiedades del documento",
		title : "Propiedades del documento",
		design : "Diseño",
		meta : "Metacódigos",
		chooseColor : "Elegir",
		other : "Otros...",
		docTitle :	"Título de página",
		charset : 	"Codificación de juego de caracteres",
		charsetOther : "Otra codificación de juego de caracteres",
		charsetASCII : "ASCII",
		charsetCE : "Centroeuropeo",
		charsetCT : "Chino tradicional (Big5)",
		charsetCR : "Cirílico",
		charsetGR : "Griego",
		charsetJP : "Japonés",
		charsetKR : "Coreano",
		charsetTR : "Turco",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europeo occidental",
		docType : "Cabecera de tipo de documento",
		docTypeOther : "Otra cabecera de tipo de documento",
		xhtmlDec : "Incluir declaraciones XHTML",
		bgColor : "Color de fondo",
		bgImage : "URL de la imagen de fondo",
		bgFixed : "Fondo no de despliegue (fijado)",
		txtColor : "Color de texto",
		margin : "Márgenes de la página",
		marginTop : "Arriba",
		marginLeft : "Izquierda",
		marginRight : "Derecha",
		marginBottom : "Abajo",
		metaKeywords : "Palabras clave de indexación de documentos (separadas por comas)",
		metaDescription : "Descripción del documento",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Este es algún <strong>texto de ejemplo</strong>. Está utilizando <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "pulgadas",
			widthCm	: "centímetros",
			widthMm	: "milímetros",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "puntos",
			widthPc	: "picas"
		},
		table :
		{
			heightUnit	: "Unidad de altura:",
			insertMultipleRows : "Insertar filas",
			insertMultipleCols : "Insertar columnas",
			noOfRows : "Número de filas:",
			noOfCols : "Número de columnas:",
			insertPosition : "Posición:",
			insertBefore : "Antes",
			insertAfter : "Después",
			selectTable : "Seleccionar tabla",
			selectRow : "Seleccionar fila",
			columnTitle : "Columna",
			colProps : "Propiedades de columna",
			invalidColumnWidth	: "La anchura de columna debe ser un número positivo."
		},
		cell :
		{
			title : "Celda"
		},
		emoticon :
		{
			angel		: "Ángel",
			angry		: "Enfadado",
			cool		: "Tranquilo",
			crying		: "Llorón",
			eyebrow		: "Sorprendido",
			frown		: "Ceño fruncido",
			goofy		: "Bobo",
			grin		: "Sonrisa",
			half		: "Mitad",
			idea		: "Idea",
			laughing	: "Sonrisa",
			laughroll	: "Risa",
			no			: "No",
			oops		: "Uy",
			shy			: "Tímido",
			smile		: "Sonrisa",
			tongue		: "Lengua fuera",
			wink		: "Guiño",
			yes			: "Sí"
		},

		menu :
		{
			link	: "Insertar enlace",
			list	: "Lista",
			paste	: "Pegar",
			action	: "Acción",
			align	: "Alinear",
			emoticon: "Emoticono"
		},

		iframe :
		{
			title	: "Trama de información"
		},

		list:
		{
			numberedTitle		: "Lista numerada",
			bulletedTitle		: "Lista con viñetas"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Escriba un nombre de marcador descriptivo como, por ejemplo, 'Sección 1.2' y, una vez que inserte el marcador, pulse el icono 'Enlace' o 'Enlace de marcador de documento' para enlazar a él.",
			title		: "Enlace de marcador de documento",
			linkTo		: "Enlazar a:"
		},

		urllink :
		{
			title : "Enlace de URL",
			linkText : "Texto de enlace:",
			selectAnchor: "Seleccionar un ancla:",
			nourl: "Escriba un URL en el campo de texto.",
			urlhelp: "Escriba o pegue un URL que se abrirá cuando los usuarios pulsen este enlace, por ejemplo, http://www.example.com.",
			displaytxthelp: "Escriba el texto que se visualiza para este enlace.",
			openinnew : "Abrir enlace en nueva ventana"
		},

		spellchecker :
		{
			title : "Comprobar ortografía",
			replace : "Sustituir:",
			suggesstion : "Sugerencias:",
			withLabel : "por:",
			replaceButton : "Sustituir",
			replaceallButton:"Sustituir todo",
			skipButton:"Omitir",
			skipallButton: "Saltar todo",
			undochanges: "Deshacer cambios",
			complete: "Se ha completado la comprobación ortográfica",
			problem: "Problema al recuperar datos XML",
			addDictionary: "Añadir a diccionario",
			editDictionary: "Editar diccionario"
		},

		status :
		{
			keystrokeForHelp: "Pulse ALT 0 para obtener ayuda"
		},

		linkdialog :
		{
			label : "Enlazar diálogo"
		},

		image :
		{
			previewText : "El texto se moverá por la imagen que está añadiendo, como en este ejemplo."
		}
	}

};
