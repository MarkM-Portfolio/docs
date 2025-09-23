({
	//actionNew dojo menu
	newName : "Novo",
	newTooltip : "Criar um documento",
	WARN_INTERNAL : "Depois que um arquivo é criado, não é possível alterar a permissão para compartilhar com outras pessoas fora de sua organização.",
	newCommunityInfo : "Os membros da comunidade estão aptos a editar este arquivo.",
  	CANCEL : "Cancelar",
  	DOWNLOAD_EMPTY_TITLE : "Não É Possível Fazer Download do Arquivo",
  	DOWNLOAD_EMPTY_OK : "Fechar",
  	DOWNLOAD_EMPTY_CONTENT1 : "Não há nenhuma versão publicada deste arquivo para download.",
  	DOWNLOAD_EMPTY_CONTENT2 : "As versões podem ser publicadas a partir do editor Docs.",
  	DOWNLOAD_EMPTYVIEW_TITLE : "Não É Possível Fazer Download do Arquivo",
  	DOWNLOAD_EMPTYVIEW_OK : "Fechar",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "Não há nenhuma versão publicada deste arquivo para download.",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "Solicite ao proprietário do arquivo para publicar uma versão deste arquivo.",  
  	DOWNLOAD_NEWDRAFT_TITLE : "Fazer Download de uma Versão",
  	DOWNLOAD_NEWDRAFT_OK : "Fazer Download da Versão",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "editado pela última vez em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "editado pela última vez em ${date}",	
		TODAY: "editado pela última hoje às ${time}",	
		YEAR: "editado pela última vez em ${date_long}",	
		YESTERDAY:	"editado pela última ontem às ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "Um rascunho mais novo, editado pela última vez em ${date}, foi detectado.",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Um rascunho mais novo, editado pela última vez em ${date}, foi detectado.",	
		TODAY: "Um rascunho mais novo, editado pela última vez hoje às ${time}, foi detectado.",	
		YEAR: "Um rascunho mais novo, editado pela última vez em ${date_long}, foi detectado.",	
		YESTERDAY:	"Um rascunho mais novo, editado pela última vez ontem às ${time}, foi detectado."
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "Tem certeza de que você deseja continuar a fazer o download da versão que foi publicada em ${date}?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Tem certeza de que você deseja continuar a fazer o download da versão que foi publicada em ${date}?",	
		TODAY: "Tem certeza de que você deseja continuar a fazer o download da versão que foi publicada hoje às ${time}?",	
		YEAR: "Tem certeza de que você deseja continuar a fazer o download da versão que foi publicada em ${date_long}?",	
		YESTERDAY:	"Tem certeza de que você deseja continuar a fazer o download da versão que foi publicada ontem às ${time}?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "Esta é a versão mais recente transferível por download de um arquivo Docs. Para saber se existe uma versão mais recente no formato de rascunho, entre em contato com o proprietário do arquivo.",

  	VIEW_FILE_DETAILS_LINK : "Visualizar Detalhes do Arquivo",
  	OPEN_THIS_FILE_TIP: "Abrir este arquivo",
  
	//newDocument 
	newDocumentName : "Documento",
	newDocumentTooltip : "Novo documento",
	newDocumentDialogTitle : "Novo Documento",
	newDocumentDialogContent : "Forneça um nome para este documento sem título.",
	newDocumentDialogBtnOK : "Criar",
	newDocumentDialogBtnOKTitle : "Criar um documento",
	newDocumentDialogInitialName : "Documento Sem Título",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "Cancelar",
	newDocumentDialogNamepre : "*Nome:",
	newDocumentDialogDocumentTypePre : "Digite:",
	newDocumentDialogDocumentChangeTypeLink : "Alterar extensão do arquivo padrão",
	newDocumentDialogDupErrMsg : "Um nome de arquivo duplicado foi encontrado. Insira um novo nome.",
	newDocumentDialogIllegalErrMsg : "${0} é um título de documento inválido; especifique outro.",
	newDocumentDialogNoNameErrMsg : "O nome do documento é requerido.",
	newDocumentDialogNoPermissionErrMsg : "O arquivo não pode ser criado porque você não tem acesso ao editor. Entre em contato com o administrador.",
	newDocumentDialogServerErrMsg : "O servidor Docs não está disponível. Entre em contato com o administrador do servidor e tente novamente mais tarde.",
	newDocumentDialogServerErrMsg2 : "O servidor do Connections não está disponível. Entre em contato com o administrador do servidor e tente novamente mais tarde.",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "Abreviar o nome do documento?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "O nome do documento é muito longo.",
	newDialogProblemidErrMsg : "Relate este problema ao seu administrador. ",
	newDialogProblemidErrMsg_tip : "Relate este problema ao seu administrador. ${shown_action}",
	newDialogProblemidErrMsgShow: "Clique para mostrar detalhes",
	newDialogProblemidErrMsgHide: "Clique para ocultar",
	newDocumentDialogTargetPre: "*Salvar em:",
	newDocumentDialogTargetCommunity: "Esta Comunidade",
	newDocumentDialogTargetMyFiles: "Meus Arquivos",

	//newSpreadsheet 
	newSheetName : "Planilha",
	newSheetTooltip : "Nova planilha",
	newSheetDialogTitle : "Nova Planilha",
	newSheetDialogBtnOKTitle : "Criar uma planilha",
	newSheetDialogInitialName : "Planilha Sem Título",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "Apresentação",
	newPresTooltip : "Nova apresentação",
	newPresDialogTitle : "Nova Apresentação",
	newPresDialogBtnOKTitle : "Criar uma apresentação",
	newPresDialogInitialName : "Apresentação Sem Título",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "Criar Arquivo",
	newFromDialogName : "Novo do Arquivo",
	newFromTooltip: "Crie um novo arquivo usando este como modelo",
	newFromDocTip : "Crie um documento (arquivo DOC, DOCX ou ODT) a partir de um arquivo de modelo. É possível editar esses documentos online no Docs.",
	newFromSheetTip : "Crie uma planilha (arquivo XLS, XLSX ou ODS) a partir de um arquivo de modelo. É possível editar essas planilhas online no Docs.",
	newFromPresTip : "Crie uma apresentação (arquivo PPT, PPTX ou ODP) a partir de um arquivo de modelo. É possível editar essas apresentações online no Docs.",

	//actionEdit
	editName : "Editar no Docs",
	editTooltip : "Editar no Docs",
	editWithDocsDialogTitle : "Iniciar a edição online com o Docs?",
	editWithDocsDialogContent1 : "O Docs permite que você colabore em Arquivos com outras pessoas ao mesmo tempo e veja as mudanças imediatamente. Também é possível trabalhar online de modo privativo.",
	editWithDocsDialogContent2 : "Não é necessário fazer upload de novas versões de um documento. Se toda a edição for executada online, o trabalho e o comentários serão protegidos. ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "Editar Online",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "Visualizar",
	viewTooltip : "Visualize o arquivo em um navegador",

	//doc too large
	docTooLargeTitle : "O documento é muito grande.",
	docTooLargeDescription : "O documento que você deseja editar é muito grande. <br />Certifique-se de que o tamanho do arquivo no formato *.odt, *.doc <br />ou *.docx não seja maior que 2048 K.",
	docTooLargeCancelBtn: "Cancelar",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "Edição atual: ",
		
	//Sheet title
	sheetTitle0: "Planilha1",
	sheetTitle1: "Planilha2",
	sheetTitle2: "Planilha3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Faça o download como o Formato Microsoft Office",
	downloadAsPDF: "Faça o download como o Formato de Arquivo PDF",
	downloadWithUnsavedDraftTitle: "Rascunho Pendente",
	downloadWithUnsavedDraftReadersOkLabel: "Ok",
	downloadWithUnsavedDraftDescription: "Esta versão pode não conter as edições online mais recentes. Clique em Salvar para criar uma nova versão e fazer download. Clique em Cancelar para continuar sem salvar.",
	downloadWithUnsavedDraftReadersDescription: "Esta versão pode não conter as edições mais recentes. A versão do documento transferido por download será a última versão salva por um editor do documento. Deseja continuar?",

	//draft tab

	draft_tab_title : "Rascunho",
	draft_created : "${0} com base na Versão ${1}",
	draft_published : "As edições mais recentes no rascunho foram publicadas.",
	draft_beiing_edited : "Esse arquivo está sendo atualmente editado na Web por ${user}.",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Somente arquivos que são documentos Docs podem ser editados.",
	draft_unpublished_tip : "Há edições para este rascunho que não foram publicadas como uma versão. ${publish_action}",
	draft_save_action_label : "Publicar uma Versão",
	draft_not_found : "Não há edições de rascunho para esse arquivo.",
	draft_latest_edit : "Edição mais recente:",
	draft_cur_editing : "Edição atual:",
	draft_edit_link : "Editar",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "Este é um arquivo Docs. Todas as edições devem ser feitas online.",
	nonentitlement_docs_indicator_text: "Este arquivo fica disponível para edição online somente se você tiver comprado a autorização do Docs.",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} publicou em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publicou em ${date}",	
		TODAY: "${user} publicou hoje às ${time}",	
		YEAR: "${user} publicou em ${date_long}",	
		YESTERDAY:	"${user} publicou ontem às ${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "Publicado em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Publicado em ${date}",	
		TODAY: "Publicado hoje às ${time}",	
		YEAR: "Publicado em ${date_long}",	
		YESTERDAY:	"Publicado ontem às ${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} publicou a versão em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} publicou a versão em ${date}",	
		TODAY: "${user} publicou a versão hoje às ${time}",	
		YEAR: "${user} publicou a versão em ${date_long}",	
		YESTERDAY:	"${user} publicou a versão ontem às ${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "Versão publicada em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Versão publicada em ${date}",	
		TODAY: "Versão publicada hoje às ${time}",	
		YEAR: "Versão publicada em ${date_long}",	
		YESTERDAY:	"Versão publicada ontem às ${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} criou em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} criou em ${date}",	
		TODAY: "${user} criou hoje às ${time}",	
		YEAR: "${user} criou em ${date_long}",	
		YESTERDAY:	"${user} criou ontem às ${time}"
	},
	LABEL_CREATED: {
		DAY: "Criado em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Criado em ${date}",	
		TODAY: "Criado hoje às ${time}",	
		YEAR: "Criado em ${date_long}",	
		YESTERDAY:	"Criado ontem às ${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} editou o rascunho em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} editou o rascunho em ${date}",	
		TODAY: "${user} editou o rascunho hoje às ${time}",	
		YEAR: "${user} editou o rascunho em ${date_long}",	
		YESTERDAY:	"${user} editou o rascunho ontem às ${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "Rascunho editado em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Rascunho editado em ${date}",	
		TODAY: "Rascunho editado hoje às ${time}",	
		YEAR: "Rascunho editado em ${date_long}",	
		YESTERDAY:	"Rascunho editado ontem às ${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} criou o rascunho em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} criou o rascunho em ${date}",	
		TODAY: "${user} criou o rascunho hoje às ${time}",	
		YEAR: "${user} criou o rascunho em ${date_long}",	
		YESTERDAY:	"${user} criou o rascunho ontem às ${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "Rascunho criado em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Rascunho criado em ${date}",	
		TODAY: "Rascunho criado hoje às ${time}",	
		YEAR: "Rascunho criado em ${date_long}",	
		YESTERDAY:	"Rascunho criado ontem às ${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "Editado em ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "Editado em ${date}",	
		TODAY: "Editado hoje às ${time}",	
		YEAR: "Editado em ${date_long}",	
		YESTERDAY:	"Editado ontem às ${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "Navegador Não Suportado",
	unSupporteBrowserContent1: "Infelizmente seu navegador talvez não funcione adequadamente com o Docs. Para obter melhores resultados, tente um destes navegadores suportados.",
	unSupporteBrowserContent2: "Claro, é possível continuar com seu navegador, mas talvez você não possa experimentar todos os recursos do Docs.",
	unSupporteBrowserContent3: "Não mostrar essa mensagem novamente.",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "Novo nos Arquivos e Docs?",
	INTRODUCTION_BOX_BLURB: "Faça upload e compartilhe seus arquivos. Crie e edite arquivos individualmente ou colaborativamente usando o Docs. Organize os arquivos em pasta, siga os arquivos para controlar as mudanças e retenha seus favoritos.",
	INTRODUCTION_BOX_BLURB_LOG_IN: "Efetue login para começar a usar os Arquivos e o Docs.",
	INTRODUCTION_BOX_BLURB_UPLOAD: 'Clique em "Fazer Upload de Arquivos" para incluir um arquivo. Clique em "Novo" para criar um arquivo com o Docs.',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: 'Clique em Fazer Upload de Arquivos para incluir um arquivo. Clique em Novo para criar um arquivo com o Docs.',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: 'Feche a seção "Bem-vindo aos Arquivos e ao Docs"',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "Crie conteúdo e colabore com os colegas. Saiba como:",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "Inclua seus próprios arquivos.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "Inicie editando online, em tempo real, individualmente ou de forma colaborativa.",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "Faça upload e edite documentos, planilhas ou apresentações.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}Incluir seus próprios arquivos{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}Inicie editando online, em tempo real, individualmente ou de forma colaborativa{1}.",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}Faça upload e edite documentos, planilhas ou apresentações{1}.",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "Configuração de Página",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "Orientação",
	PORTRAIT: "Retrato",
	LANDSCAPE: "Paisagem",	
	MARGINS_LABEL: "Margens",
	TOP: "Parte Superior:",
	TOP_DESC:"Margem superior, em centímetros",
	TOP_DESC2:"Margem superior, em polegadas",
	BOTTOM: "Parte Inferior:",
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
	LEGAL: "Jurídico",
	TABLOID: "Jornal",
	USER: "Usuário",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai; grande",
	DISPLAY_OPTION_LABEL: "Exibir opções",
	HEADER: "Cabeçalho",
	HEADER_DESC:"Altura do cabeçalho, em centímetros",	
	FOOTER: "Rodapé",
	FOOTER_DESC:"Altura do rodapé, em centímetros",
	GRIDLINE: "Linhas de grade",
	TAGGED_PDF: "PDF marcado",
	PAGE_LABEL: "Ordem das páginas",
	PAGE_TYPE1: "Parte superior para inferior e direita",
	PAGE_TYPE2: "Esquerda para direita e para baixo",
	PAGE_SETUP_INVALID_MSG: "A entrada é inválida e foi retificada automaticamente. Tente outro valor se deseja um resultado diferente.",
	
	//Docs publish message
	service_unavailable_content: "O serviço do Docs não está disponível. Sua solicitação não pode ser processada neste momento. Tente novamente mais tarde ou entre em contato com o administrador do sistema.",
	viewaccess_denied_content: "Você não tem permissão para visualizar este arquivo. Ele deve ser tornado público ou ser compartilhado com você.",
	editaccess_denied_content: "Você não tem permissão para editar este arquivo. Deve-se estar autorizado para o Docs e o arquivo deve ser compartilhado com você ou deve-se ter acesso de editor ao arquivo.",
	doc_notfound_content: "O documento que você deseja acessar foi excluído ou movido. Verifique se o link está correto.",
	repository_out_of_space_content: "Não há espaço suficiente para salvar seu novo documento. Remova outros arquivos para liberar espaço suficiente para salvar este documento.",
	fileconnect_denied_content: "O Docs não pode se conectar ao repositório de arquivos. Tente novamente mais tarde ou entre em contato com o administrador do sistema.",
	convservice_unavailable_content: "O serviço de conversão do Docs não está disponível. Sua solicitação não pode ser processada neste momento. Tente novamente mais tarde ou entre em contato com o administrador do sistema.",
	doc_toolarge_content: "O documento que você deseja acessar é muito grande.",
	conversion_timeout_content: "No momento, o documento demora muito para ser convertido. Tente novamente mais tarde.",
	storageserver_error_content: "O servidor está atualmente indisponível. Sua solicitação não pode ser processada neste momento. Tente novamente mais tarde ou entre em contato com o administrador do sistema.",
	server_busy_content:"Aguarde um momento e tente novamente mais tarde.",
	publish_locked_file: "Não é possível publicar este arquivo como uma nova versão porque ele está bloqueado; entretanto, o conteúdo foi salvo automaticamente no rascunho.",
	publishErrMsg: "A versão não foi publicada. O arquivo pode ser muito grande ou o servidor pode ter atingido o tempo limite. Tente novamente ou cancele e solicite ao administrador para verificar o log do servidor para identificar o problema.",
	publishErrMsg_Quota_Out: "Não há espaço suficiente para publicar uma nova versão deste documento. Remova outros arquivos para liberar espaço suficiente para publicar este documento.",
	publishErrMsg_NoFile: "Como este documento foi excluído por outros, a publicação falhou.",
	publishErrMsg_NoPermission: "Falha ao publicar nova versão porque você não tem permissões de editor neste arquivo. Entre em contato com o proprietário do arquivo para obter permissões de editor e tente novamente."
		
})

