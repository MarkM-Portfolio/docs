({
	//actionNew dojo menu
	newName : "Novo",
	newTooltip : "Criar um documento",
	WARN_INTERNAL : "Após a criação de um ficheiro, não é possível alterar a permissão para partilhar o mesmo com outras pessoas que não pertencem à sua organização.",
	newCommunityInfo : "Os membros da comunidade podem editar este ficheiro.",
  	CANCEL : "Cancelar",
  	DOWNLOAD_EMPTY_TITLE : "Não é possível descarregar o ficheiro",
  	DOWNLOAD_EMPTY_OK : "Fechar",
  	DOWNLOAD_EMPTY_CONTENT1 : "Não existe qualquer versão publicada deste ficheiro para transferência.",
  	DOWNLOAD_EMPTY_CONTENT2 : "É possível publicar versões a partir do editor do Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Não é possível descarregar o ficheiro",
  	DOWNLOAD_EMPTYVIEW_OK : "Fechar",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Não existe qualquer versão publicada deste ficheiro para transferência.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Solicite ao proprietário do ficheiro que publique uma versão deste ficheiro.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Descarregar uma versão",
  	DOWNLOAD_NEWDRAFT_OK : "Descarregar versão",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "editado pela última vez ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "editado pela última vez em ${date}",	
		TODAY: "editado pela última vez hoje às ${time}",	
		YEAR: "editado pela última vez em ${date_long}",	
		YESTERDAY:	"editado pela última vez ontem às ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Um rascunho mais recente, editado pela última vez ${date}, foi detectado.",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Um rascunho mais recente, editado pela última vez em ${date}, foi detectado.",	
		TODAY: "Um rascunho mais recente, editado pela última vez hoje às ${time}, foi detectado.",	
		YEAR: "Um rascunho mais recente, editado pela última vez em ${date_long}, foi detectado.",	
		YESTERDAY:	"Um rascunho mais recente, editado pela última vez ontem às ${time}, foi detectado."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Tem a certeza de que pretende continuar a descarregar a versão que foi publicada ${date}?",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Tem a certeza de que pretende continuar a descarregar a versão que foi publicada em ${date}?",	
		TODAY: "Tem a certeza de que pretende continuar a descarregar a versão que foi publicada hoje às ${time}?",	
		YEAR: "Tem a certeza de que pretende continuar a descarregar a versão que foi publicada em ${date_long}?",	
		YESTERDAY:	"Tem a certeza de que pretende continuar a descarregar a versão que foi publicada ontem às ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Trata-se da versão descarregável mais recente de um ficheiro do Docs. Para saber se existe uma versão mais recente em formato de rascunho, contacte o proprietário do ficheiro.",

  	VIEW_FILE_DETAILS_LINK : "Ver detalhes do ficheiro",
  	OPEN_THIS_FILE_TIP: "Abrir este ficheiro",
  
	//newDocument 
	newDocumentName : "Documento",
	newDocumentTooltip : "Novo documento",
	newDocumentDialogTitle : "Novo documento",
	newDocumentDialogContent : "Forneça um nome para este documento sem título.",
	newDocumentDialogBtnOK : "Criar",
	newDocumentDialogBtnOKTitle : "Criar um documento",
	newDocumentDialogInitialName : "Documento sem título",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "Texto do OpenDocument(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Cancelar",
	newDocumentDialogNamepre : "*Nome:",
	newDocumentDialogDocumentTypePre : "Tipo:",
	newDocumentDialogDocumentChangeTypeLink : "Alterar extensão do ficheiro predefinida",
	newDocumentDialogDupErrMsg : "Foi encontrado um nome de ficheiro duplicado. Introduza um novo nome.",
	newDocumentDialogIllegalErrMsg : "${0} é um título de documento não permitido. Especifique outro título.",
	newDocumentDialogNoNameErrMsg : "O nome do documento é requerido.",
	newDocumentDialogNoPermissionErrMsg : "Não é possível criar o ficheiro, uma vez que não dispõe de acesso de editor. Contacte o administrador.",
	newDocumentDialogServerErrMsg : "O servidor do Docs não está disponível. Contacte o administrador do servidor e tente novamente mais tarde.",
	newDocumentDialogServerErrMsg2 : "O servidor do Connections não está disponível. Contacte o administrador do servidor e tente novamente mais tarde.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Abreviar o nome do documento?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "O nome do documento é demasiado longo.",
	newDialogProblemidErrMsg : "Comunique este problema ao seu administrador. ",
	newDialogProblemidErrMsg_tip : "Comunique este problema ao seu administrador. ${shown_action}",
	newDialogProblemidErrMsgShow: "Fazer clique para mostrar detalhes",
	newDialogProblemidErrMsgHide: "Fazer clique para ocultar",
	newDocumentDialogTargetPre: "*Guardar em:",
	newDocumentDialogTargetCommunity: "Esta Comunidade",
	newDocumentDialogTargetMyFiles: "Os meus ficheiros",

	//newSpreadsheet 
	newSheetName : "Folha de cálculo",
	newSheetTooltip : "Nova folha de cálculo",
	newSheetDialogTitle : "Nova folha de cálculo",
	newSheetDialogBtnOKTitle : "Criar uma folha de cálculo",
	newSheetDialogInitialName : "Folha de cálculo sem título",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "Folha de cálculo do OpenDocument(*.ods)"
  	},

	//newPresentation 
	newPresName : "Apresentação",
	newPresTooltip : "Nova apresentação",
	newPresDialogTitle : "Nova apresentação",
	newPresDialogBtnOKTitle : "Criar uma apresentação",
	newPresDialogInitialName : "Apresentação sem título",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "Apresentação do OpenDocument(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Criar ficheiro",
	newFromDialogName : "Novo a partir do ficheiro",
	newFromTooltip: "Criar um novo ficheiro utilizando este ficheiro como modelo",
	newFromDocTip : "Crie um documento (ficheiro DOC, DOCX ou ODT) a partir de um ficheiro modelo. Pode editar estes documentos online no Docs.",
	newFromSheetTip : "Crie uma folha de cálculo (ficheiro XLS, XLSX ou ODS) a partir de um ficheiro modelo. Pode editar estas folhas de cálculo online no Docs.",
	newFromPresTip : "Crie uma apresentação (ficheiro PPT, PPTX ou ODP) a partir de um ficheiro modelo. Pode editar estas apresentações online no Docs.",

	//actionEdit
	editName : "Editar no Docs",
	editTooltip : "Editar no Docs",
	editWithDocsDialogTitle : "Iniciar a edição online com o Docs?",
	editWithDocsDialogContent1 : "O Docs permite colaborar nos Ficheiros com outras pessoas em simultâneo, bem como visualizar as alterações de imediato. Também pode trabalhar online em privado.",
	editWithDocsDialogContent2 : "Não é necessário transferir novas versões de um documento. Se todas as edições forem efectuadas online, o seu trabalho e comentários estão protegidos. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Editar online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Ver",
	viewTooltip : "Pré-visualizar o ficheiro num navegador",

	//doc too large
	docTooLargeTitle : "Documento demasiado grande",
	docTooLargeDescription : "O documento que pretende editar é demasiado grande. <br />Certifique-se de que o tamanho do ficheiro no formato *.odt, *.doc <br />ou *.docx não é superior a 2048 K.",
	docTooLargeCancelBtn: "Cancelar",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Edição actual: ",
		
	//Sheet title
	sheetTitle0: "Folha1",
	sheetTitle1: "Folha2",
	sheetTitle2: "Folha3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Descarregar como formato do Microsoft Office",
	downloadAsPDF: "Descarregar como ficheiro PDF",
	downloadWithUnsavedDraftTitle: "Rascunho pendente",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "Esta versão pode não conter as últimas edições online. Faça clique em Guardar para criar uma nova versão e descarregar. Faça clique em Cancelar para continuar sem guardar.",
	downloadWithUnsavedDraftReadersDescription: "Esta versão pode não conter as últimas edições. A versão do documento descarregado irá corresponder à última versão guardada por um editor do documento. Pretende continuar?",

	//draft tab

	draft_tab_title : "Rascunho",
	draft_created : "${0} baseado na versão ${1}",
	draft_published : "As últimas edições efectuadas ao rascunho foram publicadas.",
	draft_beiing_edited : "Este ficheiro está a ser editado na Web por ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Apenas os ficheiros que são documentos do Docs podem ser editados.",
	draft_unpublished_tip : "Existem edições efectuadas a este rascunho que não foram publicadas como versão. ${publish_action}",
	draft_save_action_label : "Publicar uma versão",
	draft_not_found : "Não existem edições de rascunho para este ficheiro.",
	draft_latest_edit : "Última edição:",
	draft_cur_editing : "Edição actual:",
	draft_edit_link : "Editar",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Trata-se de um ficheiro do Docs. Todas as edições têm de ser efectuadas online.",
	nonentitlement_docs_indicator_text: "Este ficheiro está disponível para edição online apenas se tiver adquirido uma autorização de utilização do Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} publicou em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "${user} publicou em ${date}",	
		TODAY: "${user} publicou hoje às ${time}",	
		YEAR: "${user} publicou em ${date_long}",	
		YESTERDAY:	"${user} publicou ontem às ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publicou em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Publicou em ${date}",	
		TODAY: "Publicou hoje às ${time}",	
		YEAR: "Publicou em ${date_long}",	
		YESTERDAY:	"Publicou ontem às ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} publicou a versão em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "${user} publicou a versão em ${date}",	
		TODAY: "${user} publicou a versão hoje às ${time}",	
		YEAR: "${user} publicou a versão em ${date_long}",	
		YESTERDAY:	"${user} publicou a versão ontem às ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Versão publicada ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Versão publicada ${date}",	
		TODAY: "Versão publicada hoje às ${time}",	
		YEAR: "Versão publicada em ${date_long}",	
		YESTERDAY:	"Versão publicada ontem às ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} criou em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "${user} criou em ${date}",	
		TODAY: "${user} criou hoje às ${time}",	
		YEAR: "${user} criou em ${date_long}",	
		YESTERDAY:	"${user} criou ontem às ${time}"
	},
	LABEL_CREATED: {
		DAY: "Criou em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Criou em ${date}",	
		TODAY: "Criou hoje às ${time}",	
		YEAR: "Criou em ${date_long}",	
		YESTERDAY:	"Criou ontem às ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} editou o rascunho em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "${user} editou o rascunho em ${date}",	
		TODAY: "${user} editou o rascunho hoje às ${time}",	
		YEAR: "${user} editou o rascunho em ${date_long}",	
		YESTERDAY:	"${user} editou o rascunho ontem às ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Rascunho editado em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Rascunho editado em ${date}",	
		TODAY: "Rascunho editado hoje às ${time}",	
		YEAR: "Rascunho editado em ${date_long}",	
		YESTERDAY:	"Rascunho editado ontem às ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} criou o rascunho em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "${user} criou o rascunho em ${date}",	
		TODAY: "${user} criou o rascunho hoje às ${time}",	
		YEAR: "${user} criou o rascunho em ${date_long}",	
		YESTERDAY:	"${user} criou o rascunho ontem às ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Rascunho criado em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Rascunho criado em ${date}",	
		TODAY: "Rascunho criado hoje às ${time}",	
		YEAR: "Rascunho criado em ${date_long}",	
		YESTERDAY:	"Rascunho criado ontem às ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Editou em ${date}",	
		FULL: "${date_long} às ${time_long}",	
		MONTH: "Editou em ${date}",	
		TODAY: "Editou hoje às ${time}",	
		YEAR: "Editou em ${date_long}",	
		YESTERDAY:	"Editou ontem às ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Navegador não suportado",
	unSupporteBrowserContent1: "Lamentamos, mas o navegador poderá não funcionar correctamente com o Docs. Para obter os melhores resultados, experimente utilizar um destes navegadores suportados.",
	unSupporteBrowserContent2: "Pode continuar a utilizar o seu navegador, mas dessa forma não irá tirar todo o partido das funcionalidades do Docs.",
	unSupporteBrowserContent3: "Não voltar a apresentar esta mensagem.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Novo nos Ficheiros e no Docs?",
	INTRODUCTION_BOX_BLURB: "Transfira e partilhe os seus ficheiros. Crie e edite ficheiros individualmente ou em colaboração utilizando o Docs. Organize ficheiros numa pasta, acompanhe ficheiros para registar alterações e marque os seus favoritos.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Inicie sessão para começar a utilizar o Ficheiros e o Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Faça clique em "Transferir ficheiros" para adicionar um ficheiro. Faça clique em "Novo" para criar um ficheiro no Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Faça clique em Transferir ficheiros para adicionar um ficheiro. Faça clique em Novo para criar um ficheiro no Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Feche a secção "Bem-vindo aos Ficheiros e ao Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Crie e colabore em conteúdo com colegas. Fique a saber como:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Adicionar os seus próprios ficheiros.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Iniciar a edição online, em tempo real, individualmente ou colaborativamente.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Transferir e editar documentos, folhas de cálculo ou apresentações.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Adicionar os seus próprios ficheiros{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Iniciar a edição online, em tempo real, individualmente ou em colaboração{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Transferir e editar documentos, folhas de cálculo ou apresentações{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Configuração da página",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientação",
	PORTRAIT: "Vertical",
	LANDSCAPE: "Horizontal",	
	MARGINS_LABEL: "Margens",
	TOP: "Superior:",
	TOP_DESC:"Margem superior, em centímetros",
	TOP_DESC2:"Margem superior, em polegadas",
	BOTTOM: "Inferior:",
	BOTTOM_DESC:"Margem inferior, em centímetros",
	BOTTOM_DESC2:"Margem inferior, em polegadas",
	LEFT: "Esquerda:",
	LEFT_DESC:"Margem esquerda, em centímetros",
	LEFT_DESC2:"Margem esquerda, em polegadas",	
	RIGHT: "Direita:",
	RIGHT_DESC:"Margem direita, em centímetros",
	RIGHT_DESC2:"Margem direita, em polegadas",
	PAPER_FORMAT_LABEL: "Formato do papel",
	PAPER_SIZE_LABEL: "Tamanho do papel:",
	HEIGHT: "Altura:",
	HEIGHT_DESC:"Altura do papel, em centímetros",
	HEIGHT_DESC2:"Altura do papel, em polegadas",	
	WIDTH: "Largura:",
	WIDTH_DESC:"Largura do papel, em centímetros",
	WIDTH_DESC2:"Largura do papel, em polegadas",
	CM_LABEL: "cm",
	LETTER: "Carta",
	LEGAL: "Legal",
	TABLOID: "Tablóide",
	USER: "Utilizador",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai grande",
	DISPLAY_OPTION_LABEL: "Opções de apresentação",
	HEADER: "Cabeçalho",
	HEADER_DESC:"Altura do cabeçalho, em centímetros",	
	FOOTER: "Rodapé",
	FOOTER_DESC:"Altura do rodapé, em centímetros",
	GRIDLINE: "Linhas da grelha",
	TAGGED_PDF: "PDF com etiquetas",
	PAGE_LABEL: "Ordem das páginas",
	PAGE_TYPE1: "De cima para baixo, depois à direita",
	PAGE_TYPE2: "Da esquerda para a direita, depois para baixo",
	PAGE_SETUP_INVALID_MSG: "A entrada de dados não é válida e foi rectificada automaticamente. Experimente outro valor, caso pretende um resultado diferente.",
	
	//Docs publish message
	service_unavailable_content: "O serviço do Docs não está disponível. Neste momento, não é possível processar o seu pedido. Tente novamente mais tarde ou contacte o administrador do sistema.",
	viewaccess_denied_content: "Não tem permissão para visualizar este ficheiro. O ficheiro tem de ser público ou partilhado consigo.",
	editaccess_denied_content: "Não tem permissão para editar este ficheiro. É necessário ter uma autorização de utilização para o Docs e o ficheiro tem de estar partilhado consigo ou é necessário ter acesso de editor ao ficheiro.",
	doc_notfound_content: "O documento ao qual pretende aceder foi eliminado ou movido. Verifique se a ligação está correcta.",
	repository_out_of_space_content: "Não tem espaço suficiente para guardar o novo documento. Remova outros ficheiros para obter espaço suficiente para guardar este documento.",
	fileconnect_denied_content: "O Docs não pode estabelecer ligação ao repositório de ficheiros. Tente novamente mais tarde ou contacte o administrador do sistema.",
	convservice_unavailable_content: "O serviço de conversão do Docs não está disponível. Neste momento, não é possível processar o seu pedido. Tente novamente mais tarde ou contacte o administrador do sistema.",
	doc_toolarge_content: "O documento ao qual pretende aceder é demasiado grande.",
	conversion_timeout_content: "Neste momento, a conversão do documento está a demorar demasiado tempo. Tente novamente mais tarde.",
	storageserver_error_content: "O servidor encontra-se indisponível. Neste momento, não é possível processar o seu pedido. Tente novamente mais tarde ou contacte o administrador do sistema.",
	server_busy_content:"Aguarde um momento e tente novamente mais tarde.",
	publish_locked_file: "Não é possível publicar este ficheiro como uma nova versão, uma vez que o mesmo está bloqueado, contudo, o conteúdo é guardado automaticamente no rascunho.",
	publishErrMsg: "A versão não foi publicada. O ficheiro poderá ser demasiado grande ou o servidor poderá ter excedido o tempo limite. Tente novamente ou cancele e solicite que o administrador verifique o registo do servidor para identificar o problema.",
	publishErrMsg_Quota_Out: "Não existe espaço suficiente para publicar uma nova versão deste documento. Remova outros ficheiros para obter espaço suficiente para publicar este documento.",
	publishErrMsg_NoFile: "Ocorreu uma falha na publicação, uma vez que este documento foi eliminado por outras pessoas.",
	publishErrMsg_NoPermission: "Falha ao publicar a nova versão, uma vez que não tem permissões de editor neste ficheiro. Contacte o proprietário do ficheiro para obter permissões de editor e tente novamente."
		
})

