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
define([
    "dojo/_base/declare"
], function(declare) {

    var TableTempleStyles = declare("writer.model.TableTempleStyles", null, {
        templateJson: {
            "TableNormal": {
                "default": "1",
                "name": "Normal Table",
                "semiHidden": "1",
                "styleId": "TableNormal",
                "t": "style",
                "tblPr": {
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    }
                },
                "type": "table",
                "uiPriority": "99",
                "unhideWhenUsed": "1"
            },

            "Plain": {
                "basedOn": "TableNormal",
                "name": "Plain",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "Plain",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",


                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                    "t": "tblStylePr",

                    "tcPr": {
                        "shd": {
                            "color": "auto",
                            "fill": "FFFFFF",
                            "val": "clear"
                        }
                    },
                    "type": "band1Vert"
                }, {
                    "t": "tblStylePr",

                    "tcPr": {
                        "shd": {
                            "color": "auto",
                            "fill": "FFFFFF",
                            "val": "clear"
                        }
                    },
                    "type": "band1Horz"
                }],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },

            "PlainRow": {
                "basedOn": "TableNormal",
                "name": "PlainRow",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "PlainRow",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "val": "none"
                        },
                        "left": {
                            "val": "none"
                        },
                        "right": {
                            "val": "none"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "LightGrayRows": {
                "basedOn": "TableNormal",
                "name": "LightGrayRows",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "LightGrayRows",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "val": "none"
                        },
                        "left": {
                            "val": "none"
                        },
                        "right": {
                            "val": "none"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "DDDDDD",


                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "DDDDDD",


                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",


                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "RedHeader": {
                "basedOn": "TableNormal",
                "name": "RedHeader",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "RedHeader",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "330000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "330000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "330000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "330000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "990000",


                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "330000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "330000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "330000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "999999",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "BlueHeader": {
                "basedOn": "TableNormal",
                "name": "BlueHeader",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "BlueHeader",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "000066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "003366",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "000066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "000066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "000066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "6699CC",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "99CCFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "GreenHeader": {
                "basedOn": "TableNormal",
                "name": "GreenHeader",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "GreenHeader",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "009900",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "009900",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "009900",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "009900",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "669933",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "009900",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "009900",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "009900",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "PurpleHeader": {
                "basedOn": "TableNormal",
                "name": "PurpleHeader",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "PurpleHeader",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "330066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "330066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "330066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "330066",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "663366",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "330066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "330066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "330066",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "CC99CC",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFCCFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "BlackHeader": {
                "basedOn": "TableNormal",
                "name": "BlackHeader",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "BlackHeader",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "1C1C1C",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "000000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "000000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "000000",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },

            "DarkGrayHF": {
                "basedOn": "TableNormal",
                "name": "DarkGrayHF",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "DarkGrayHF",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "val": "none"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "666666",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    }, {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "lastRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FFFFFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "GreenHF": {
                "basedOn": "TableNormal",
                "name": "GreenHF",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "GreenHF",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "val": "none"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "669900",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    }, {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CC66",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "lastRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },

            "RedHF": {
                "basedOn": "TableNormal",
                "name": "RedHF",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "RedHF",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "val": "none"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FF3333",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    }, {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FF6666",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "lastRow"
                    },

                    {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "LightBlueHF": {
                "basedOn": "TableNormal",
                "name": "LightBlueHF",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "LightBlueHF",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "val": "none"
                        },
                        "insideH": {
                            "val": "none"
                        },
                        "insideV": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "333333",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "val": "none"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "669999",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "firstRow"
                    }, {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CCCC",
                                "val": "clear"
                            },
                            "tcBorders": {
                                "top": {
                                    "val": "none"
                                },
                                "left": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "right": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                },
                                "bottom": {
                                    "color": "333333",
                                    "space": "0",
                                    "sz": "0.75pt",
                                    "val": "single"
                                }
                            }
                        },
                        "type": "lastRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "B2B2B2",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "DDDDDD",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "BlueStyle": {
                "basedOn": "TableNormal",
                "name": "BlueStyle",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "BlueStyle",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "336666",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "336666",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "336666",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },

            "DarkGray": {
                "basedOn": "TableNormal",
                "name": "DarkGray",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "DarkGray",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "666666",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "666666",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "666666",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "GreenStyle": {
                "basedOn": "TableNormal",
                "name": "GreenStyle",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00DC27C1"
                },
                "styleId": "GreenStyle",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "FFFFFF",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "669933",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "669933",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "669933",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },

            "RedTint": {
                "basedOn": "TableNormal",
                "name": "RedTint",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00870575"
                },
                "styleId": "RedTint",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstCol"
                    }, {
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "lastCol"
                    }, {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FF9999",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "FF9999",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "BlueTint": {
                "basedOn": "TableNormal",
                "name": "BlueTint",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00870575"
                },
                "styleId": "BlueTint",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CCFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CCFF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "GreenTint": {
                "basedOn": "TableNormal",
                "name": "GreenTint",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00870575"
                },
                "styleId": "GreenTint",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CC99",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "99CC99",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "GrayTint": {
                "basedOn": "TableNormal",
                "name": "GrayTint",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00870575"
                },
                "styleId": "GrayTint",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",
                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "DDDDDD",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "DDDDDD",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            },
            "PurpleTint": {
                "basedOn": "TableNormal",
                "name": "PurpleTint",
                "pPr": {
                    "space": {
                        "after": "0pt",
                        "line": "1",
                        "lineRule": "auto"
                    }
                },
                "rsid": {
                    "val": "00870575"
                },
                "styleId": "PurpleTint",
                "t": "style",
                "tblPr": {
                    "tblBorders": {
                        "bottom": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideH": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "insideV": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "left": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "right": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        },
                        "top": {
                            "color": "000000",
                            "space": "0",
                            "sz": "1pt",
                            "val": "single"
                        }
                    },
                    "tblCellMar": {
                        "bottom": {
                            "type": "dxa",
                            "w": "0"
                        },
                        "left": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "right": {
                            "type": "dxa",
                            "w": "108"
                        },
                        "top": {
                            "type": "dxa",
                            "w": "0"
                        }
                    },
                    "tblInd": {
                        "type": "dxa",
                        "w": "0"
                    },
                    "tblStyleColBandSize": {
                        "val": "1"
                    },
                    "tblStyleRowBandSize": {
                        "val": "1"
                    }
                },
                "tblStylePrs": [{
                        "rPr": {
                            "font-weight": "bold",
                            "preserve": {
                                "bCs": "1"
                            }
                        },
                        "t": "tblStylePr",
                        "type": "firstRow"
                    },

                    {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "CC99FF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Vert"
                    }, {
                        "t": "tblStylePr",

                        "tcPr": {
                            "shd": {
                                "color": "auto",
                                "fill": "CC99FF",
                                "val": "clear"
                            }
                        },
                        "type": "band1Horz"
                    }
                ],
                "tcPr": {
                    "shd": {
                        "color": "auto",
                        "fill": "FFFFFF",
                        "val": "clear"
                    }
                },
                "type": "table",
                "uiPriority": "67"
            }

        }

    });



    return TableTempleStyles;
});
