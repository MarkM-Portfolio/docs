/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
define({
        PAGE_BREAK_TEXT: "Quebra de página",
        SECTION_BREAK_TEXT: "Quebra de secção",
        LINE_BREAK_TEXT: "Quebra de linha",
        COLUMN_BREAK_TEXT: "Quebra de coluna",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Lamentamos, mas as imagens só podem ser adicionadas no corpo do texto e em tabelas, e não na localização actual.",
        LOADING: "O conteúdo está a carregar.",
        LOAD_FINISHED: "Carregamento do conteúdo concluído.",
        PAGE_SETUP: "Configuração da página",
        NOTE_INVALIDACTION_FOOTNOTE: "Esta não é uma acção válida para uma nota de rodapé.",
        NOTE_INVALIDACTION_ENDNOTE: "Esta não é uma acção válida para uma nota de fim.",
        PAGENUMBER_OF_TOTALNUMBER: "Página ${0} de ${1}", //page 1 of N
        PAGE_NUMBER: "Página: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Índice",
            update: "Actualizar",
            del: "Eliminar",
            toc: "Índice",
            linkTip: "Faça Ctrl clique para navegar",
            linkTip_Mac: "Faça \u2318 clique para navegar",
            pageNumber: "Apenas número de página",
            entireTable: "Totalidade da tabela"
        },
        link: {
            addlink: "Adicionar ligação",
            gotolink: "Abrir ligação",
            unlink: "Remover ligação",
            editlink: "Editar ligação",
            internalLink: "Ligação interna",
            ctrlLink: "Faça clique+Ctrl para aceder à ligação",
            ctrlLink_Mac: "Faça \u2318 clique para aceder à ligação",
            cannotOpen: " não é possível abrir a partir de ${productName}."
        },
        field: {
            update: "Actualizar campo"
        },
        insertTime: "Inserir hora",
        insertDate: "Inserir data",
        selectDate: "Seleccionar data",
        selectTime: "Seleccionar hora",
        acc_blank: "em branco", // when selection is nothing but space char and empty paragraph
        acc_space: "espaço", // string read out when the cursor is before one space char
        acc_inLink: "na ligação ",
        acc_inField: "no campo ",
        acc_selected: " seleccionado",
        acc_inTable: "na tabela, linha ${0}, coluna ${1} ",
        acc_imageSelected: "imagem seleccionada",
        acc_canvasSelected: "forma seleccionada",
        acc_textboxSelected: "caixa de texto seleccionada",
        ACC_TABLE_TABLESIZE: "Seleccionou ${0} linhas, ${1} colunas",
        ACC_TABLE_MAXSIZE: " O tamanho de tabela máximo suportado é 20*20",
        ACC_headerFooterMode: "modo de edição de rodapé e cabeçalho",
        ACC_EditorMode: "modo de edição de editor",
        ACC_FootnotesMode: "modo de edição de notas de rodapé",
        ACC_EndnotesMode: "modo de edição de notas de fim",
        ACC_uniformTable: "Foi adicionada uma nova linha",
        Acc_column: "coluna  ${0}",
        acc_page: "página  ${0}",
        acc_section: "secção  ${0}",
        acc_spellWarn: "a ortografia está incorrecta",
        acc_outTable: "fora da tabela",
        acc_link: "ligação",
        acc_field: "campo",
        acc_footnote: "nota de rodapé",
        acc_endnote: "nota de fim",
        acc_editor: "Editado por ${0}",
        tablePropertyTitle: "Propriedades da tabela",
        headerTitle: "Cabeçalho",
        footerTitle: "Rodapé",
        firstheaderTitle: "Cabeçalho da primeira página",
        firstfooterTitle: "Rodapé da primeira página",
        evenheaderTitle: "Cabeçalho de página par",
        evenfooterTitle: "Rodapé de página par",
        oddheaderTitle: "Cabeçalho de página ímpar",
        oddfooterTitle: "Rodapé de página ímpar",
        showTableBorder: "Mostrar limites da tabela",
        list_none: "Nenhuma",
        SET_NUMBERING_VALUE: "Definir valor de numeração",
        BIDI_CONTENT_EDITING: "Este documento inclui conteúdo bi-direccional. Para trabalhar correctamente com este documento, active o suporte bi-direccional nas preferências do HCL Connections."
});
