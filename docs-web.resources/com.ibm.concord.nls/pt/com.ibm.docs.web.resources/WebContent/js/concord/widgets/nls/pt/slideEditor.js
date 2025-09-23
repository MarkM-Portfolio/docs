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
	ctxMenu_createSlide: 	"Criar diapositivo",
	ctxMenu_renameSlide: 	"Mudar o nome do diapositivo",
	ctxMenu_deleteSlide: 	"Eliminar diapositivo",
	ctxMenu_selectAll: 	 	"Seleccionar tudo",
	ctxMenu_createTextBox: 	"Adicionar caixa de texto",
	ctxMenu_addImage:	 	"Adicionar uma imagem",		
	ctxMenu_createTable: 	"Criar tabela",
	ctxMenu_slideTransition: "Transições de diapositivos",
	ctxMenu_slideTransitionTitle: "Seleccionar uma transição",
	ctxMenu_slideLayout: 	"Esquema de diapositivo",
	ctxMenu_slideTemplates: "Estilos de modelo global",
	ctxMenu_paste: 	 		"Colar",
	ctxMenu_autoFix: 		"Correcção automática",
		
	imageDialog: {	
		titleInsert:		"Inserir imagem",
		insertImageBtn:		"Inserir",							
		URL:				"URL:",
		uploadFromURL:		"Imagem da Web",
		imageGallery:		"Galeria de imagens",
		uploadAnImageFile:	"Imagem do ficheiro",
		uploadImageFileTitle: "Especificar uma imagem a transferir a partir de ficheiro",
		insertImageErrorP1: "Não é possível inserir a imagem no documento.",
		insertImageErrorP2: "Existe um problema no servidor, tal como espaço em disco insuficiente.",
		insertImageErrorP3: "Solicite que o administrador verifique o registo do servidor para identificar o problema."
	},
	
	concordGallery:{
		results:		"Resultados: ${0}",
		show:			"Mostrar:",
		all	:			"Tudo",
		images:			"Imagens",
		pictures: 		"Fotografias",
		arrows: 		"Setas",
		bullets: 		"Marcas",
		computer: 		"Computador",
		diagram: 		"Diagrama",
		education: 		"Educação",
		environment: 	"Ambiente",
		finance: 		"Finanças",
		people: 		"Pessoas",
		shape: 			"Formas",
		symbol: 		"Símbolos",
		transportation:	"Transportes",
		table:			"Tabelas",
		search:			"Procurar",
		loading:		"A carregar..."
	},
	
	contentLockTitle: "Mensagem de bloqueio de conteúdo",
	contentLockMsg :  "Não é possível executar a operação em alguns dos objectos seleccionados, uma vez que estes objectos estão a ser utilizados pelo(s) seguinte(s) utilizador(es):",
	contentLockemail: "endereço de correio electrónico",
	
	warningforRotatedShape: "Não é possível realizar a operação em alguns dos objectos seleccionados, uma vez que estes objectos são objectos rodados.",
	
	cannotCreateShapesTitle: "Não é possível criar formas",
	cannotCreateShapesMessage: "O ${productName} não suporta a criação de formas em versões do Internet Explorer inferiores a 9. Para criar formas, utilize um navegador diferente.",
	cannotShowShapesTitle: "Não é possível mostrar formas",

	slidesInUse:"Diapositivos em utilização",
	slidesInUseAll: "Não é possível executar a operação nos diapositivos seleccionados, uma vez que alguns destes diapositivos estão a ser utilizados pelos seguintes utilizadores:",
	slidesInUseSome: "Não é possível executar a operação em alguns dos diapositivos seleccionados, uma vez que estes diapositivos estão a ser utilizados pelos seguintes utilizadores:",
	
	contentInUse:"Conteúdo em utilização",
	contentInUseAll:"Não é possível executar a operação no conteúdo do diapositivo seleccionado, uma vez que algum conteúdo do diapositivo está a ser utilizado pelos seguintes utilizadores:",
	contentInUseSome:"Não é possível executar a operação em algum do conteúdo do diapositivo seleccionado, uma vez que o conteúdo está a ser utilizado pelos seguintes utilizadores:",
		
	undoContentNotAvailable: "Não foi possível anular, uma vez que o conteúdo já não está disponível.",
	redoContentNotAvailable: "Não foi possível refazer, uma vez que o conteúdo já não está disponível.",
	undoContentAlreadyExist: "Não foi possível anular, uma vez que o conteúdo já existe." ,
	redoContentAlreadyExist: "Não foi possível refazer, uma vez que o conteúdo já existe.",
	
	preventTemplateChange:"Diapositivos em utilização",
	preventTemplateChangeMsg: "Não é possível alterar o estilo de modelo global enquanto existir outro utilizador a editar a apresentação.",
	
	createTblTitle: 	"Criar uma tabela",
	createTblLabel: 	"Introduza o número de linhas e colunas. O valor máximo é 10.",
	createTblNumRows: "Número de linhas",
	createTblNumCols: "Número de colunas",
	createTblErrMsg:  "Certifique-se de que o valor é um número inteiro positivo, não está em branco e não é superior a 10.",

	insertTblRowTitle: 	"Inserir linhas",
	insertTblRowNumberOfRows: 	"Número de linhas:",
	insertTblRowNumberPosition: 	"Posição:",
	insertTblRowAbove: 	"Acima",
	insertTblRowBelow: 	"Abaixo",
	
	insertTblColTitle: 	"Inserir colunas",
	insertTblColNumberOfCols: 	"Número de colunas:",
	insertTblColNumberPosition: 	"Posição:",
	insertTblColBefore: "Antes",
	insertTblColAfter: 	"Depois",
	
	insertVoicePosition: "Posição",
	
 	defaultText_newBox2: "Faça duplo clique para adicionar o texto",	
	defaultText_newBox: "Faça clique para adicionar texto",
	defaultText_speakerNotesBox: "Faça clique para adicionar notas",
	
	cannotAddComment_Title: "Não é possível adicionar comentário",
	cannotAddComment_Content: "O conteúdo não pode ser anexado a esta caixa de conteúdo ou a este diapositivo. A caixa de conteúdo ou o diapositivo apenas pode suportar um máximo de ${0} comentários. ",
	
	invalidImageType: "Este tipo de imagem não é actualmente suportado. Converta a imagem num ficheiro .bmp, .jpg, .jpeg, .gif ou .png e tente novamente.",
	
	error_unableToDestroyTABContentsInDialog: "Não é possível eliminar o conteúdo dos SEPARADORES na caixa de diálogo",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Cancelar",
	preparingSlide: "A preparar o diapositivo para edição",
	
	slideCommentClose: "Fechar comentário",
	slideCommentDone: "Concluído",
	slideCommentPrev: "Anterior",
	slideCommentNext: "Seguinte"
})

