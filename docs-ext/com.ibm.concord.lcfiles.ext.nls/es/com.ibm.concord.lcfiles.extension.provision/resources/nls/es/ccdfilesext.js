({
	//actionNew dojo menu
	newName : "Nuevo",
	newTooltip : "Crear un documento",
	WARN_INTERNAL : "Una vez que se haya creado un archivo, no se puede cambiar el permiso para compartirlo con otros usuarios externos a la organización.",
	newCommunityInfo : "Los miembros de la comunidad pueden editar este archivo.",
  	CANCEL : "Cancelar",
  	DOWNLOAD_EMPTY_TITLE : "No se puede descargar el archivo",
  	DOWNLOAD_EMPTY_OK : "Cerrar",
  	DOWNLOAD_EMPTY_CONTENT1 : "No existe ninguna versión publicada de este archivo que pueda descargar.",
  	DOWNLOAD_EMPTY_CONTENT2 : "Las versiones se pueden publicar desde el editor de Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "No se puede descargar el archivo",
  	DOWNLOAD_EMPTYVIEW_OK : "Cerrar",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "No existe ninguna versión publicada de este archivo que pueda descargar.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Pida al propietario del archivo que publique una versión de este archivo.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Descargar una versión",
  	DOWNLOAD_NEWDRAFT_OK : "Descargar versión",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "editado por última vez el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "editado por última vez el ${date}",	
		TODAY: "editado por última vez hoy a las ${time}",	
		YEAR: "editado por última vez el ${date_long}",	
		YESTERDAY:	"editado por última vez ayer a las ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Se ha detectado un borrador más nuevo, editado por última vez el ${date}.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Se ha detectado un borrador más nuevo, editado por última vez el ${date}.",	
		TODAY: "Se ha detectado un borrador más nuevo, editado por última vez hoy a las ${time}.",	
		YEAR: "Se ha detectado un borrador más nuevo, editado por última vez el ${date_long}.",	
		YESTERDAY:	"Se ha detectado un borrador más nuevo, editado por última vez ayer a las ${time}."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "¿Está seguro de que desea continuar con la descarga de la versión publicada el ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "¿Está seguro de que desea continuar con la descarga de la versión publicada el ${date}?",	
		TODAY: "¿Está seguro de que desea continuar con la descarga de la versión publicada hoy a las ${time}?",	
		YEAR: "¿Está seguro de que desea continuar con la descarga de la versión publicada el ${date_long}?",	
		YESTERDAY:	"¿Está seguro de que desea continuar con la descarga de la versión publicada ayer a las ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Esta es la última versión descargable de un archivo de Docs. Para saber si existe una versión más reciente en formato borrador, póngase en contacto con el propietario del archivo.",

  	VIEW_FILE_DETAILS_LINK : "Ver detalles de archivo",
  	OPEN_THIS_FILE_TIP: "Abrir este archivo",
  
	//newDocument 
	newDocumentName : "Documento",
	newDocumentTooltip : "Nuevo documento",
	newDocumentDialogTitle : "Nuevo documento",
	newDocumentDialogContent : "Proporcionar un nombre para este documento sin título.",
	newDocumentDialogBtnOK : "Crear",
	newDocumentDialogBtnOKTitle : "Crear un documento",
	newDocumentDialogInitialName : "Documento sin título",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Cancelar",
	newDocumentDialogNamepre : "*Nombre:",
	newDocumentDialogDocumentTypePre : "Tipo:",
	newDocumentDialogDocumentChangeTypeLink : "Cambiar extensión de archivo predeterminado",
	newDocumentDialogDupErrMsg : "Se ha encontrado un nombre de archivo duplicado. Especifique un nombre nuevo.",
	newDocumentDialogIllegalErrMsg : "${0} es un título de documento no permitido, especifique otro.",
	newDocumentDialogNoNameErrMsg : "El nombre del documento es obligatorio.",
	newDocumentDialogNoPermissionErrMsg : "El archivo no se puede crear porque no tiene acceso de editor. Póngase en contacto con el administrador.",
	newDocumentDialogServerErrMsg : "El servidor de Docs no está disponible. Póngase en contacto con el administrador del servidor e inténtelo de nuevo más tarde.",
	newDocumentDialogServerErrMsg2 : "El servidor de Connections no está disponible. Póngase en contacto con el administrador del servidor e inténtelo de nuevo más tarde.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "¿Desea acortar el nombre de documento?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "El nombre de documento es demasiado largo.",
	newDialogProblemidErrMsg : "Informe de este problema al administrador. ",
	newDialogProblemidErrMsg_tip : "Informe de este problema al administrador. ${shown_action}",
	newDialogProblemidErrMsgShow: "Pulsar para mostrar detalles",
	newDialogProblemidErrMsgHide: "Pulsar para ocultar",
	newDocumentDialogTargetPre: "*Guardar en:",
	newDocumentDialogTargetCommunity: "Esta comunidad",
	newDocumentDialogTargetMyFiles: "Mis archivos",

	//newSpreadsheet 
	newSheetName : "Hoja de cálculo",
	newSheetTooltip : "Nueva hoja de cálculo",
	newSheetDialogTitle : "Nueva hoja de cálculo",
	newSheetDialogBtnOKTitle : "Crear una hoja de cálculo",
	newSheetDialogInitialName : "Hoja de cálculo sin título",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Presentación",
	newPresTooltip : "Nueva presentación",
	newPresDialogTitle : "Nueva presentación",
	newPresDialogBtnOKTitle : "Crear una presentación",
	newPresDialogInitialName : "Presentación sin título",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Crear archivo",
	newFromDialogName : "Nuevo a partir de archivo",
	newFromTooltip: "Crear un archivo nuevo utilizando este archivo como plantilla",
	newFromDocTip : "Crear un documento (archivo DOC,DOCX u ODT) a partir de un archivo de plantilla. Puede editar estos documentos en línea en Docs.",
	newFromSheetTip : "Crear una hoja de cálculo (archivo XLS, XLSX u ODS) a partir de un archivo de plantilla. Puede editar estas hojas de cálculo en línea en Docs.",
	newFromPresTip : "Crear una presentación (archivo PPT, PPTX u ODP) a partir de un archivo de plantilla. Puede editar estas presentaciones en línea en Docs.",

	//actionEdit
	editName : "Editar en Docs",
	editTooltip : "Editar en Docs",
	editWithDocsDialogTitle : "¿Desea empezar a editar en línea con Docs?",
	editWithDocsDialogContent1 : "Docs le permite colaborar en Archivos con otras personas al mismo tiempo y ver los cambios inmediatamente. Asimismo puede trabajar en línea de forma privada.",
	editWithDocsDialogContent2 : "No necesita cargar nuevas versiones de un documento. Si realiza toda la edición en línea, su trabajo y comentarios estarán protegidos. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Editar en línea",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Ver",
	viewTooltip : "Vista previa del archivo en un navegador",

	//doc too large
	docTooLargeTitle : "El documento es demasiado grande.",
	docTooLargeDescription : "El documento que desea editar es demasiado grande. <br />Asegúrese de que el tamaño del archivo en formato *.odt, *.doc, <br />o *.docx no sea superior a 2048 K.",
	docTooLargeCancelBtn: "Cancelar",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Edición actual: ",
		
	//Sheet title
	sheetTitle0: "Hoja1",
	sheetTitle1: "Hoja2",
	sheetTitle2: "Hoja3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Descargar en formato de Microsoft Office",
	downloadAsPDF: "Descargar como archivo PDF",
	downloadWithUnsavedDraftTitle: "Borrador saliente",
	downloadWithUnsavedDraftReadersOkLabel: "Aceptar",
	downloadWithUnsavedDraftDescription: "Es posible que esta versión no contenga los últimos cambios. Pulse guardar para crear una versión nueva y descargarla. Pulse cancelar para continuar sin guardar los cambios.",
	downloadWithUnsavedDraftReadersDescription: "Es posible que esta versión no contenga los últimos cambios. La versión del documento descargado es la última versión que ha guardado el editor del documento. ¿Desea continuar?",

	//draft tab

	draft_tab_title : "Borrador",
	draft_created : "${0} basado en la Versión ${1}",
	draft_published : "Se han publicado las últimas ediciones del borrador.",
	draft_beiing_edited : "Este archivo lo está editando en la web ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Sólo se pueden editar los archivos que sean documentos de Docs.",
	draft_unpublished_tip : "Hay ediciones de este borrador que no se han publicado como una versión. ${publish_action}",
	draft_save_action_label : "Publicar una versión",
	draft_not_found : "No hay ediciones de borrador para este archivo.",
	draft_latest_edit : "Última edición:",
	draft_cur_editing : "Edición actual:",
	draft_edit_link : "Editar",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Este archivo es de Docs. Todas las ediciones deben realizarse en línea.",
	nonentitlement_docs_indicator_text: "Este archivo esta disponible para editarse en línea solo si ha adquirido una titularidad de Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} ha publicado a las ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} ha publicado a las ${date}",	
		TODAY: "${user} ha publicado hoy a las ${time}",	
		YEAR: "${user} ha publicado el ${date_long}",	
		YESTERDAY:	"${user} publicó ayer a las ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publicado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Publicado el ${date}",	
		TODAY: "Publicado hoy a las ${time}",	
		YEAR: "Publicado el ${date_long}",	
		YESTERDAY:	"Publicado ayer a las ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} ha publicado una versión el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} ha publicado una versión el ${date}",	
		TODAY: "${user} ha publicado una versión hoy a las ${time}",	
		YEAR: "${user} ha publicado una versión el ${date_long}",	
		YESTERDAY:	"${user} publicó una versión ayer a las ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Versión publicada el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Versión publicada el ${date}",	
		TODAY: "Versión publicada hoy a las ${time}",	
		YEAR: "Versión publicada el ${date_long}",	
		YESTERDAY:	"Versión publicada ayer a las ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} creado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} creado el ${date}",	
		TODAY: "${user} creado hoy a las ${time}",	
		YEAR: "${user} creado el ${date_long}",	
		YESTERDAY:	"${user} creado ayer a las ${time}"
	},
	LABEL_CREATED: {
		DAY: "Creado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Creado el ${date}",	
		TODAY: "Creado hoy a las ${time}",	
		YEAR: "Creado el ${date_long}",	
		YESTERDAY:	"Creado ayer a las ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} ha editado un borrador a las ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} ha editado un borrador a las ${date}",	
		TODAY: "${user} ha editado un borrador hoy a las ${time}",	
		YEAR: "${user} ha editado un borrador a las ${date_long}",	
		YESTERDAY:	"${user} editó un borrador ayer a las ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Borrador editado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Borrador editado el ${date}",	
		TODAY: "Borrador editado a las ${time}",	
		YEAR: "Borrador editado el ${date_long}",	
		YESTERDAY:	"Borrador editado ayer a las ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} ha creado un borrador el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} ha creado un borrador el ${date}",	
		TODAY: "${user} ha creado un borrador hoy a las ${time}",	
		YEAR: "${user} ha creado un borrador el ${date_long}",	
		YESTERDAY:	"${user} creó un borrador ayer a las ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Borrador creado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Borrador creado el ${date}",	
		TODAY: "Borrador creado hoy a las ${time}",	
		YEAR: "Borrador creado el ${date_long}",	
		YESTERDAY:	"Borrador creado ayer a las ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Editado el ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Editado el ${date}",	
		TODAY: "Editado hoy a las ${time}",	
		YEAR: "Editado el ${date_long}",	
		YESTERDAY:	"Editado ayer a las ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Explorador no admitido",
	unSupporteBrowserContent1: "Es posible que el navegador no funcione correctamente con Docs. Para obtener mejores resultados, intente utilizar uno de estos navegadores soportados.",
	unSupporteBrowserContent2: "Por supuesto, puede continuar con su navegador, pero no experimentará todas las características de Docs.",
	unSupporteBrowserContent3: "No volver a mostrar este mensaje de nuevo.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "¿Es la primera vez que utiliza Archivos y Docs?",
	INTRODUCTION_BOX_BLURB: "Cargue y comparta sus archivos. Cree y edite archivos individualmente o de forma colaborativa utilizando Docs. Organice los archivos en la carpeta, realice un seguimiento de los cambios realizados en los archivos y marque sus favoritos.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Inicie sesión para empezar a utilizar Archivos y Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Pulse "Cargar archivos" para añadir un archivo. Pulse "Nuevo" para crear un archivo con Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Pulse Cargar archivos para añadir un archivo. Pulse Nuevo para crear un archivo con Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Cierre la sección "Bienvenido a Archivos y Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Crear contenido y colaborar con compañeros. Lo puede hacer siguiendo estos pasos:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Añada sus propios archivos.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Empiece a editar en línea, en tiempo real, de manera individual o en colaboración.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Cargue y edite documentos, hojas de cálculo y presentaciones.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Añada sus propios archivos{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Empiece a editar en línea, en tiempo real, de manera individual o en colaboración{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Cargue y edite documentos, hojas de cálculo y presentaciones{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Configuración de la página",
	PAGE_SETUP_BTN_OK: "Aceptar",
	ORIENTATION_LABEL: "Orientación",
	PORTRAIT: "Orientación vertical",
	LANDSCAPE: "Orientación horizontal",	
	MARGINS_LABEL: "Márgenes",
	TOP: "Arriba:",
	TOP_DESC:"Margen superior, en centímetros",
	TOP_DESC2:"Margen superior, en pulgadas",
	BOTTOM: "Abajo:",
	BOTTOM_DESC:"Margen inferior, en centímetros",
	BOTTOM_DESC2:"Margen inferior, en pulgadas",
	LEFT: "Izquierda:",
	LEFT_DESC:"Margen izquierdo, en centímetros",
	LEFT_DESC2:"Margen izquierdo, en pulgadas",	
	RIGHT: "Derecha:",
	RIGHT_DESC:"Margen derecho, en centímetros",
	RIGHT_DESC2:"Margen derecho, en pulgadas",
	PAPER_FORMAT_LABEL: "Formato de papel",
	PAPER_SIZE_LABEL: "Tamaño de papel:",
	HEIGHT: "Altura:",
	HEIGHT_DESC:"Altura del papel, en centímetros",
	HEIGHT_DESC2:"Altura del papel, en pulgadas",	
	WIDTH: "Anchura:",
	WIDTH_DESC:"Anchura del papel, en centímetros",
	WIDTH_DESC2:"Anchura del papel, en pulgadas",
	CM_LABEL: "cm",
	LETTER: "Carta",
	LEGAL: "Legal",
	TABLOID: "Tabloide",
	USER: "Usuario",
	SIZE1: "Sobre núm. 6 3/4",
	SIZE2: "Sobre Monarch",
	SIZE3: "Sobre núm. 9",
	SIZE4: "Sobre núm. 10",
	SIZE5: "Sobre núm. 11",
	SIZE6: "Sobre núm. 12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai grande",
	DISPLAY_OPTION_LABEL: "Opciones de visualización",
	HEADER: "Cabecera",
	HEADER_DESC:"Altura de cabecera, en centímetros",	
	FOOTER: "Pie de página",
	FOOTER_DESC:"Altura de pie de página, en centímetros",
	GRIDLINE: "Líneas de cuadrícula",
	TAGGED_PDF: "PDF con etiquetas",
	PAGE_LABEL: "Orden de páginas",
	PAGE_TYPE1: "De arriba abajo, luego a la derecha",
	PAGE_TYPE2: "De izquierda a derecha, luego abajo",
	PAGE_SETUP_INVALID_MSG: "La entrada no es válida y se ha rectificado automáticamente. Inténtelo con otro valor si desea obtener otro resultado.",
	
	//Docs publish message
	service_unavailable_content: "El servicio de Docs no está disponible. Su solicitud no se puede procesar en este momento. Inténtelo de nuevo más tarde o póngase en contacto con el administrador del sistema.",
	viewaccess_denied_content: "No tiene permiso para ver este archivo. El archivo debe ser público o poder compartirlo.",
	editaccess_denied_content: "No tiene permiso para editar el archivo. Docs le debe proporcionar acceso para poder compartirlo o tener acceso de editor al archivo.",
	doc_notfound_content: "El documento al que desea acceder se ha suprimido o movido. Compruebe que el enlace es correcto.",
	repository_out_of_space_content: "No tiene espacio suficiente para guardar el nuevo documento. Elimine otros archivos para liberar el espacio suficiente para guardar este documento.",
	fileconnect_denied_content: "Docs no puede conectarse al repositorio de archivos. Inténtelo de nuevo más tarde o póngase en contacto con el administrador del sistema.",
	convservice_unavailable_content: "El servicio de conversión de Docs no está disponible. Su solicitud no se puede procesar en este momento. Inténtelo de nuevo más tarde o póngase en contacto con el administrador del sistema.",
	doc_toolarge_content: "El documento al que desea acceder es demasiado grande.",
	conversion_timeout_content: "En este momento, el documento tarda demasiado en convertirse. Vuelva a intentarlo más tarde.",
	storageserver_error_content: "El servidor no está disponible en este momento. Su solicitud no se puede procesar en este momento. Inténtelo de nuevo más tarde o póngase en contacto con el administrador del sistema.",
	server_busy_content:"Espere un rato y vuelva a intentarlo más tarde.",
	publish_locked_file: "No puede publicar este archivo como una nueva versión porque está bloqueado. No obstante, el contenido se guarda automáticamente en el borrador.",
	publishErrMsg: "La versión no se ha publicado. Es posible que el archivo sea demasiado largo, o que el servidor haya agotar tiempo de espera. Vuelva a intentarlo, o cancele y pida al administrador que compruebe el registro del servidor para identificar el problema.",
	publishErrMsg_Quota_Out: "No hay suficiente espacio para publicar una versión nueva de este documento. Elimine otros archivos para publicar el espacio suficiente para guardar este documento.",
	publishErrMsg_NoFile: "Debido a que este documento ha sido suprimido por otros usuarios, la publicación ha fallado.",
	publishErrMsg_NoPermission: "No se ha podido publicar una versión nueva porque no tiene permisos de editor en este archivo. Póngase en contacto con el propietario del archivo para obtener permisos de editor y vuelva a intentarlo."
		
})

