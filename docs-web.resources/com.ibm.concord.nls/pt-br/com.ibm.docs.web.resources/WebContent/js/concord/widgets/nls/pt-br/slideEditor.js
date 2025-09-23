/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

({
	ctxMenu_createSlide: 	"Criar Slide",
	ctxMenu_renameSlide: 	"Renomear Slide",
	ctxMenu_deleteSlide: 	"Excluir Slide",
	ctxMenu_selectAll: 	 	"Selecionar Tudo",
	ctxMenu_createTextBox: 	"Incluir Caixa de Texto",
	ctxMenu_addImage:	 	"Incluir uma Imagem",		
	ctxMenu_createTable: 	"Criar Tabela",
	ctxMenu_slideTransition: "Transições do Slide",
	ctxMenu_slideTransitionTitle: "Selecione uma Transição",
	ctxMenu_slideLayout: 	"Layout do Slide",
	ctxMenu_slideTemplates: "Estilos Principais",
	ctxMenu_paste: 	 		"Colar",
	ctxMenu_autoFix: 		"Correção Automática",
		
	imageDialog: {	
		titleInsert:		"Inserir Imagem",
		insertImageBtn:		"Inserir",							
		URL:				"URL:",
		uploadFromURL:		"Imagem da Web",
		imageGallery:		"Galeria de Imagens",
		uploadAnImageFile:	"Imagem do Arquivo",
		uploadImageFileTitle: "Especificar a imagem para upload do arquivo",
		insertImageErrorP1: "A imagem não pode ser inserida no documento.",
		insertImageErrorP2: "Há um problema no servidor, como espaço insuficiente no disco.",
		insertImageErrorP3: "Solicite ao administrador que verifique o log do servidor para identificar o problema."
	},
	
	concordGallery:{
		results:		"Resultados: ${0}",
		show:			"Mostrar:",
		all	:			"Todos",
		images:			"Imagens",
		pictures: 		"Figuras",
		arrows: 		"Setas",
		bullets: 		"Marcadores",
		computer: 		"Computador",
		diagram: 		"Diagrama",
		education: 		"Formação",
		environment: 	"Ambiente",
		finance: 		"Finanças",
		people: 		"Pessoas",
		shape: 			"Formas",
		symbol: 		"Símbolos",
		transportation:	"Transporte",
		table:			"Tabelas",
		search:			"Pesquisar",
		loading:		"Carregando..."
	},
	
	contentLockTitle: "Mensagem de Bloqueio de Conteúdo",
	contentLockMsg :  "A operação em um ou mais objetos selecionados não pode ser executada porque esses objetos estão no momento sendo usados pelo(s) seguinte(s) usuário(s):",
	contentLockemail: "e-mail",
	
	warningforRotatedShape: "A operação em alguns dos objetos selecionados não pode ser executada uma vez que estes objetos são objetos rotacionados.",
	
	cannotCreateShapesTitle: "Não É Possível Criar Formas",
	cannotCreateShapesMessage: "O ${productName} não suporta criação de formato em versões do Internet Explorer inferiores a 9. Para criar formatos, use um navegador diferente.",
	cannotShowShapesTitle: "Não É Possível Mostrar Formas",

	slidesInUse:"Slides em Uso",
	slidesInUseAll: "A operação não pode ser executada nos slides selecionados porque alguns desses slides estão atualmente sendo usados pelos seguintes usuários:",
	slidesInUseSome: "A operação não pode ser executada nos slides selecionados porque esses slides estão atualmente sendo usados pelos seguintes usuários:",
	
	contentInUse:"Conteúdo em Uso",
	contentInUseAll:"A operação não pode ser executada no conteúdo do slide selecionado porque alguns conteúdos do slide estão atualmente sendo usados pelos seguintes usuários:",
	contentInUseSome:"A operação não pode ser executada em alguns conteúdos do slide selecionado porque esses conteúdos estão atualmente sendo usados pelos seguintes usuários:",
		
	undoContentNotAvailable: "Não foi possível desfazer porque o conteúdo não está mais disponível.",
	redoContentNotAvailable: "Não foi possível refazer porque o conteúdo não está mais disponível.",
	undoContentAlreadyExist: "Não foi possível desfazer porque o conteúdo já existe." ,
	redoContentAlreadyExist: "Não foi possível refazer porque o conteúdo já existe.",
	
	preventTemplateChange:"Slides em Uso",
	preventTemplateChangeMsg: "O estilo principal não poderá ser alterado enquanto houver outro usuário editando a apresentação.",
	
	createTblTitle: 	"Criar uma Tabela",
	createTblLabel: 	"Insira o número de linhas e colunas. O valor máximo é 10.",
	createTblNumRows: "Número de Linhas",
	createTblNumCols: "Número de Colunas",
	createTblErrMsg:  "Certifique-se de que o valor seja um número inteiro positivo, não esteja em branco e não seja superior a 10.",

	insertTblRowTitle: 	"Inserir Linhas",
	insertTblRowNumberOfRows: 	"Número de Linhas:",
	insertTblRowNumberPosition: 	"Posição:",
	insertTblRowAbove: 	"Acima",
	insertTblRowBelow: 	"Abaixo",
	
	insertTblColTitle: 	"Inserir Colunas",
	insertTblColNumberOfCols: 	"Número de Colunas:",
	insertTblColNumberPosition: 	"Posição:",
	insertTblColBefore: "Antes",
	insertTblColAfter: 	"Depois",
	
	insertVoicePosition: "Posição",
	
 	defaultText_newBox2: "Clique duas vezes para incluir um texto",	
	defaultText_newBox: "Clique para incluir texto",
	defaultText_speakerNotesBox: "Clique para incluir notas",
	
	cannotAddComment_Title: "Não é possível incluir comentário",
	cannotAddComment_Content: "Os comentários não podem ser anexados nesta caixa de conteúdo ou este slide. A caixa de conteúdo ou slide suporta somente um máximo de ${0} comentários. ",
	
	invalidImageType: "Esse tipo de imagem não é atualmente suportado. Converta a imagem em .bmp, .jpg, .jpeg, .gif ou .png e tente novamente.",
	
	error_unableToDestroyTABContentsInDialog: "Não é possível destruir o conteúdo da GUIA no diálogo",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Cancelar",
	preparingSlide: "Preparando o slide para edição",
	
	slideCommentClose: "Fechar Comentário",
	slideCommentDone: "Concluído",
	slideCommentPrev: "Anterior",
	slideCommentNext: "Avançar"
})

