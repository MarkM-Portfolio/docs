/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "모든 수식",
	LABEL_FORMULA_LIST: "수식 목록:",
	formula:{
	ABS:{	
	    Syntax:"${0}(숫자)",
	    Disp:"수의 절대값을 리턴합니다."
    },
    ACOS:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 arc cosine을 리턴합니다. 각도는 라디안으로 리턴됩니다."
    },
    ACOSH:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 역 쌍곡선 cosine을 리턴합니다."
    },
    ACOT:{    
    	Syntax:"${0}(숫자)",
        Disp:"숫자의 역 cotangent를 리턴합니다. 각도는 라디안으로 측정됩니다."
    },
    ACOTH:{    
    	Syntax:"${0}(숫자)",
        Disp:"숫자의 역 쌍곡선 cotangent를 리턴합니다."
    },
    ADDRESS:{
         Syntax:"${0}(행${1} 열${1} [abs]${1} [a1]${1} [시트])",
         Disp:"셀에 대한 참조를 텍스트로 리턴합니다.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - 절대",
        		 result : 1
        	 }, {
        		 label : "${0} - 절대 행 / 상대 열",
        		 result : 2
        	 }, {
        		 label : "${0} - 상대 행 / 절대 열",
        		 result : 3
        	 }, {
        		 label : "${0} - 상대",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 스타일",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 스타일",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(논리값 1${1} [논리값 2]${1} ...)",
    	Disp:"모든 인수가 TRUE인 경우 TRUE를 리턴합니다."
    },
    ASIN:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 arc sine을 리턴합니다. 각도는 라디안으로 리턴됩니다."
    },
    ASINH:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 역 쌍곡선 sine을 리턴합니다."
    },
    ATAN:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 arc tangent를 리턴합니다. 각도는 라디안으로 리턴됩니다."
    },
    AVERAGE:{    
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"인수의 평균을 리턴합니다."
    },
    AVERAGEA:{    
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"샘플의 평균 값을 리턴합니다. 텍스트는 0으로 평가됩니다."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(범위${1} 기준${1} [평균 범위])",
    	Disp:"주어진 조건을 충족하는 인수의 평균(산술 평균)을 리턴합니다."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(평균 범위${1} 기준 범위1${1} 기준1${1} ...)",
    	Disp:"다중 조건을 충족하는 인수의 평균(산술 평균)을 리턴합니다."
    },
    ATAN2:{
    	Syntax:"${0}(x_숫자${1} y_숫자)",
    	Disp:"지정된 x 좌표와 y 좌표의 arctangent 또는 역 tangent를 리턴합니다. arctangent는 x 축에서 기점 (0, 0)과 좌표 (x_숫자, y_숫자)인 점을 포함하는 선까지의 각도입니다."
    },
    ATANH:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 역 쌍곡선 tangent를 리턴합니다. 수는 -1과 1 사이의 값(-1과 1 제외)이어야 합니다."
    },
    BASE:{    
    	Syntax:"${0}(숫자${1} 기수${1} [최소 길이])",
    	Disp:"정의된 밑수에 양수를 숫자 시스템에서 텍스트로 변환합니다."
    },
    BIN2DEC:{
    	Syntax:"${0}(숫자)",
    	Disp:"2진수를 10진수로 변환합니다."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"2진수를 16진수로 변환합니다."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"2진수를 8진수로 변환합니다."
    },
    CEILING:{  
    	Syntax: "${0}(숫자${1} 증분)",
    	Disp:"수를 가장 가까운 정수 또는 유의값의 배수로 올림합니다."
    },
    CHAR: {
    	Syntax: "${0}(숫자)",
    	Disp: "숫자로 맵핑되는 문자를 리턴하며, 유니코드 문자 맵에서 문자를 찾습니다. 숫자는 1 - 255 범위입니다."
    },
    CHOOSE: {
    	Syntax: "${0}(지수${1} 값1${1} [값2]${1} ...)",
    	Disp: "색인에 따라 해당 값을 찾아 리턴하며, 최대 30개의 값 중에서 선택할 수 있습니다."
    },
    CODE:{
    	Syntax:"${0}(텍스트)",
    	Disp:"유니코드로 인코딩된 텍스트 문자열에서 첫 문자로 숫자 코드를 리턴합니다."
    },
    COLUMN:{    
    	Syntax:"${0}([참조])",
    	Disp:"참조의 내부 열 수를 리턴합니다."
    },
    COLUMNS:{    
    	Syntax:"${0}(배열)",
    	Disp:"배열 또는 참조의 열 개수를 리턴합니다."
    },
    COMBIN:{
    	Syntax:"${0}(숫자${1} 선택된 숫자)",
    	Disp:"주어진 개수의 항목에 가능한 조합 수를 리턴합니다. ${0}을(를) 사용하여 주어진 개수의 항목에 가능한 총 그룹 수를 판별합니다."
    },
    CONCATENATE:{   
    	Syntax:"${0}(텍스트 1${1} ...)",
    	Disp:"여러 텍스트 문자열을 하나의 문자열로 결합합니다."
    },
    CONVERT:{
    	Syntax:"${0}(숫자${1} 시작 단위${1} 끝 단위)",
    	Disp:"숫자를 한 측정 시스템에서 다른 시스템으로 변환합니다.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - 그램",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - 슬러그",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - 파운드 질량(상용)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (원자 질량 단위)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - 온스 질량(사용)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - 미터",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - 법정 마일",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - 인치",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - 피트",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - 야드",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - 옹스트롬",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - 파이카",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - 년",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - 일",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - 시",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - 분",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - 초",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - 파스칼",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - 대기",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - 수은 밀리미터(토르)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - 뉴턴",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - 다인",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - 파운드 힘",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - 줄",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - 에르그",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT 칼로리",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - 전자볼트",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - 마력시",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - 와트시",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - 풋파운드",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - 열역학 칼로리",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - 마력",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - 와트",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - 테슬라",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - 가우스",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - 섭씨 온도",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - 화씨 온도",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - 켈빈",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - 티스푼",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - 테이블스푼",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - 액량 온스",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - 컵",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - 미국 파인트",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - 영국 파인트",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - 쿼트",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - 갤런",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - 리터",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(숫자)",
    	Disp:"주어진 각도의 cosine을 리턴합니다."
    },
    COSH:{
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 쌍곡선 cosine을 리턴합니다."
    },
    COT:{    
    	Syntax:"${0}(숫자)",
        Disp:"주어진 숫자의 cotangent를 리턴합니다."
    },
    COTH:{    
    	Syntax:"${0}(숫자)",
        Disp:"주어진 숫자의 쌍곡선 cotangent를 리턴합니다."
    },
    COUNT:{   
    	Syntax:"${0}(값1${1} [값2]${1} ...)",
    	Disp:"인수 목록에 있는 수를 계수합니다. 텍스트 항목은 무시됩니다."
    },
    COUNTA:{   
    	Syntax:"${0}(값1${1} [값2]${1} ...)",
    	Disp:"인수 목록에 있는 값을 계수합니다."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(범위)",
    	Disp: "지정된 범위에서 빈 셀을 계수합니다."
    },
    COUNTIF:{
    	Syntax: "${0}(범위${1} 기준)",
    	Disp:"주어진 조건을 충족하는 셀의 수를 계수합니다."
    },
    COUNTIFS:{
    	Syntax: "${0}(기준 범위1${1} 기준1${1} ...)",
    	Disp:"다중 조건을 충족하는 셀의 수를 계수합니다."
    },
    CUMIPMT:{	
	    Syntax:"${0}(이율${1} nper${1} pv${1} 시작 기간${1} 종료 기간${1} 유형)",
	    Disp:"지정된 두 기간 사이에 납입된 누적 이자를 계산합니다."
    },
    CUMPRINC:{	
	    Syntax:"${0}(이율${1} nper${1} pv${1} 시작 기간${1} 종료 기간${1} 유형)",
	    Disp:"지정된 두 기간 사이에 대출에 대해 납입된 누적 원금을 계산합니다."
    }, 
    DATE:{	
	    Syntax:"${0}(년${1} 월${1} 일)",
	    Disp:"제공된 날짜에 대한 내부 번호를 제공합니다."
    },  
    DATEDIF:{	
	    Syntax:"${0}(시작 날짜${1} 종료 날짜${1} 형식)",
	    Disp:"두 날짜 간의 차이를 년, 월 또는 일로 리턴합니다.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - 기간 내의 완전한 연 수입니다.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - 기간 내의 완전한 월 수입니다.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - 기간 내의 일 수입니다.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - 시작 날짜와 종료 날짜의 일의 차이. 월과 연은 무시됩니다.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - 시작 날짜와 종료 날짜의 월의 차이. 연은 무시됩니다.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - 시작 날짜와 종료 날짜의 일의 차이. 연은 무시됩니다.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(텍스트)",
	    Disp:"가능한 날짜 형식의 텍스트에 대한 내부 번호를 리턴합니다."
    }, 
    DAY:{
    	Syntax:"${0}(숫자)",
    	Disp:"지정된 날짜 값의 일을 리턴합니다. 일은 1 - 31 사이의 정수로 리턴됩니다. 음수의 날짜/시간 값을 입력할 수도 있습니다."
    },
    DAYS360:{
    	Syntax:"${0}(시작 날짜${1} 종료 날짜${1} [메소드])",
    	Disp:"360일을 1년으로 하여 두 날짜 사이의 일 수를 계산합니다.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - 미국 (NASD) 메소드",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - 유럽 메소드",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(시작 날짜${1} 종료 날짜${1})",
    	Disp:"두 날짜 간의 일 수를 계산합니다."
    },
    DEC2BIN:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"10진수를 2진수로 변환합니다."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"10진수를 16진수로 변환합니다."
    },
    DEC2OCT:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"10진수를 8진수로 변환합니다."
    },
    DEGREES:{	
	    Syntax:"${0}(각도)",
	    Disp:"라디안을 각도로 변환합니다."
    },
    DISC:{
    	Syntax:"${0}(지불${1} 만기${1} pr${1} 상환${1} [기초])",
    	Disp:"증권의 할인율을 계산합니다."
    }, 
    DOLLAR:{
    	Syntax:"${0}(숫자${1} [10진수])",
    	Disp:"$(달러) 통화 형식을 사용하여 숫자를 텍스트로 변환합니다."
    },
    EDATE:{
    	Syntax:"${0}(시작 날짜${1} 개월)",
    	Disp:"시작 날짜 전후에 표시된 개월 수인 날짜를 나타내는 일련 번호를 리턴합니다."
    },
    EOMONTH:{
    	Syntax:"${0}(시작 날짜${1} 개월)",
    	Disp:"시작 날짜 전후에 표시된 개월 수인 월의 마지막 날 동안 일련 번호를 리턴합니다."
    },
    ERFC:{   
    	Syntax:"${0}(숫자)",
        Disp:"숫자와 무한으로 통합된 보완 오류 함수를 리턴합니다."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(참조)",
    	Disp:"오류 유형에 해당하는 번호를 리턴합니다."
//    		,
//    	Arguments: {
//       	 0 : [{
//       		 label : "${0} - #NULL!",
//       		 result : -1
//       	 }, {
//       		 label : "${0} - #DIV/0!",
//       		 result : -2
//       	 }, {
//       		 label : "${0} - #VALUE!",
//       		 result : -3
//       	 }, {
//       		 label : "${0} - #REF!",
//       		 result : -4
//       	 }, {
//       		 label : "${0} - #NAME?",
//       		 result : -5
//       	 }, {
//       		 label : "${0} - #NUM!",
//       		 result : -6
//       	 }, {
//       		 label : "${0} - #N/A",
//       		 result : -7
//       	 }, {
//       		 label : "${0} - #GETTING_DATA",
//       		 result : -8
//       	 }
//       	 ]
//        }
    },    
    EVEN:{   
    	Syntax:"${0}(숫자)",
    	Disp:"가장 가까운 짝수로 올림된 수를 리턴합니다."
    },
    EXACT:{    
    	Syntax:"${0}(텍스트 1${1} 텍스트 2)",
    	Disp: "두 텍스트 문자열을 비교하고 동일한 경우 TRUE를 리턴합니다. 이 함수는 대소문자를 구분합니다."
    },
    EXP:{    
    	Syntax:"${0}(숫자)",
    	Disp: "제공된 수를 제곱한 e를 리턴합니다."
    },
    FACT:{  
    	Syntax:"${0}(숫자)",
    	Disp:"수의 계승을 계산합니다."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(숫자)",
        Disp:"숫자의 이중 계승을 리턴합니다."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"논리값을 FALSE로 리턴합니다."
    },
    FIND:{   
    	Syntax:"${0}(텍스트 찾기${1} 텍스트${1} [위치])",
    	Disp:"다른 텍스트 내에서 텍스트 문자열을 찾습니다(대소문자 구분)."
    },
    FIXED:{
    	Syntax:"${0}(숫자${1} [10진수]${1} [쉼표_없음])",
    	Disp:"숫자를 10진수의 고정된 자릿수가 있는 텍스트로 형식화합니다.",
    	Arguments: {
    		2 : [{
    			label : "${0} - 쉼표 금지",
    			result : "TRUE"
    		}, {
    			label : "${0} - 쉼표 금지 안함",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(숫자${1} 유의값)",
    	Disp:"수를 가장 가까운 유의값의 배수로 내림합니다."
    },
    FORMULA:{   
    	Syntax:"${0}(참조)",
    	Disp:"수식 셀의 수식을 리턴합니다."
    },
    FREQUENCY:{   
    	Syntax:"${0}(숫자순서목록_데이터${1} 숫자순서목록_바이너리)",
    	Disp:"값을 간격으로 분류한 다음 각 간격 내에 있는 값의 개수를 계산합니다."
    },
    FV:{
    	Syntax:"${0}(이율${1} nper${1} pmt${1} [pv]${1} [유형])",
    	Disp:"고정 금리를 기초로 투자의 미래 가치를 계산합니다."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(원금${1} 스케줄)",
        Disp:"연속 복리를 적용한 후 초기 원금의 미래 가치를 계산합니다."
    },
    GAMMALN:{   
    	Syntax:"${0}(숫자)",
        Disp:"감마 함수의 자연 로그를 리턴합니다."
    },
    GCD:{   
    	Syntax:"${0}(숫자1${1} [숫자 2]${1} ...)",
        Disp:"모든 인수의 최대 공약수를 리턴합니다."
    },
    HEX2BIN:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"16진수를 2진수로 변환합니다."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(숫자)",
    	Disp:"16진수를 10진수로 변환합니다."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"16진수를 8진수로 변환합니다."
    },
    HOUR:{   
    	Syntax:"${0}(숫자)",
    	Disp:"시간 값의 하루(0-23)에 해당하는 시간에 대한 순서 번호를 판별합니다."
    },
    HLOOKUP:{   
    	Syntax:"${0}(검색_기준${1} 배열${1} 지수${1} [정렬됨])",
    	Disp:"아래에 있는 셀을 가로로 검색하고 참조합니다.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 유사하게 일치",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 정확히 일치",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(링크${1} [셀_텍스트])",
    	Disp:"링크에서 참조하는 범위 또는 네트워크 자원을 가리키는 링크를 리턴합니다. 제공되는 경우에는 셀_텍스트(선택사항)를 표시하고, 그렇지 않으면 텍스트로 링크를 표시합니다."
    },    
    IF:{    
    	Syntax:"${0}(테스트${1} [then 값]${1} [otherwise 값])",
    	Disp:"수행할 논리 테스트를 지정합니다."
    },
    IFS:{
    	Syntax:"${0}(테스트1${1} TRUE인 경우 값1${1} ...)",
    	Disp:"하나 이상의 조건을 충족하는지 확인하는 논리 테스트를 실행하고 첫 번째 TRUE 조건에 일치하는 값을 리턴합니다."
    },
    IFERROR:{
    	Syntax:"${0}(값${1} 오류인 경우 값)",
    	Disp:"표현식에 오류가 있을 경우 지정한 값을 리턴합니다. 그렇지 않으면 표현식의 결과를 리턴합니다."
    },
    IFNA:{
    	Syntax:"${0}(값${1} N/A인 경우 값)",
    	Disp:"표현식이 #N/A 오류 값을 리턴할 경우 지정한 값을 리턴합니다. 그렇지 않으면 표현식의 결과를 리턴합니다."
    },
    INDEX:{    
    	Syntax:"${0}(참조${1} 행${1} [열]${1} [범위])",
    	Disp:"정의된 범위에서 셀에 대한 참조를 리턴합니다."
    },
    INDIRECT:{    
    	Syntax:"${0}(참조${1} [참조_스타일])",
    	Disp:"텍스트 양식에 참조된 셀의 컨텐츠를 리턴합니다.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 스타일",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 스타일",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(숫자)",
    	Disp:"수를 가장 가까운 정수로 내림합니다."
    },
    IPMT:{
    	Syntax:"${0}(이율${1} per${1} nper${1} pv${1} [fv]${1} [유형])",
    	Disp:"정기 납입 및 고정 금리를 기초로 투자 기간에 대해 이자 상환 금액을 계산합니다."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(값)",
    	Disp:"참조된 셀이 비어 있는 경우 TRUE를 리턴하고 그렇지 않은 경우 FALSE를 리턴합니다."
    },
    ISERR:{
    	Syntax:"${0}(값)",
    	Disp:"값이 #N/A가 아닌 오류 값인 경우 TRUE를 리턴합니다."
    },
    ISERROR:{
    	Syntax:"${0}(값)",
    	Disp:"값이 오류 값인 경우 TRUE를 리턴합니다."
    },
    ISEVEN:{    
    	Syntax:"${0}(값)",
    	Disp:"값이 짝수인 경우 TRUE를 리턴하고 그렇지 않은 경우 FALSE를 리턴합니다." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(참조)",
    	Disp:"셀이 수식 셀인 경우 TRUE를 리턴합니다."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(값)",
    	Disp:"값에 논리 번호가 포함된 경우 TRUE를 리턴합니다."
    },
    ISNA:{    
    	Syntax:"${0}(값)",
    	Disp:"값이 #N/A인 경우 TRUE를 리턴합니다."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(값)",
    	Disp:"값이 텍스트가 아닌 경우 TRUE를 리턴합니다."
    },
    ISNUMBER:{   
    	Syntax:"${0}(값)",
    	Disp:"값이 숫자인 경우 TRUE를 리턴합니다."
    },
    ISODD:{    
    	Syntax:"${0}(값)",
    	Disp:"값이 홀수인 경우 TRUE를 리턴합니다."
    },
    ISPMT:{
    	Syntax:"${0}(이율${1} per${1} nper${1} pv)",
    	Disp:"투자에 대해 지정된 기간 동안 납입된 이자를 계산합니다."
    }, 
    ISREF:{    
    	Syntax:"${0}(값)",
    	Disp:"값이 참조인 경우 TRUE를 리턴합니다."
    },
    ISTEXT:{    
    	Syntax:"${0}(값)",
    	Disp:"값이 텍스트인 경우 TRUE를 리턴합니다."
    },
    LARGE:{
        Syntax:"${0}(배열${1} n번째_위치)",
    	Disp:"값 세트에서 n번째로 큰 값을 리턴합니다."
    },
    LCM:{   
    	Syntax:"${0}(숫자1${1} [숫자 2]${1} ...)",
        Disp:"목록에 있는 모든 숫자의 최소 공배수를 리턴합니다."
    },
    LEFT:{
        Syntax:"${0}(텍스트${1} [길이])",
    	Disp:"텍스트 시작 부분에서 시작하여 지정된 문자 수를 리턴합니다."
    },
    LEN:{
    	Syntax:"${0}(텍스트)",
    	Disp:"텍스트 문자열의 길이를 리턴합니다."
    },
    LENB:{
    	Syntax:"${0}(텍스트)",
    	Disp:"텍스트 문자열의 바이트 수를 리턴합니다."
    },
    LN:{
    	Syntax:"${0}(숫자)",
    	Disp:"수의 자연 로그를 리턴합니다."
    },
    LOG:{
    	Syntax:"${0}(숫자${1} [밑수])",
    	Disp:"지정된 밑수의 숫자에 대한 로그를 리턴합니다."
    },
    LOG10:{
    	Syntax:"${0}(숫자)",
    	Disp:"밑수 10에 대한 로그를 구합니다."
    },
    LOOKUP:{
    	Syntax: "${0}(검색 기준${1} 검색 벡터${1} [결과_벡터])",
    	Disp:"다른 벡터의 값과 비교하여 벡터의 값을 판별합니다."
    },
    LOWER:{    
    	Syntax:"${0}(텍스트)",
    	Disp:"텍스트를 소문자로 변환합니다."
    },    
    MATCH:{    
    	Syntax: "${0}(검색 기준${1} 검색_배열${1} [유형])",
    	Disp:"값을 비교한 후 배열에서의 위치를 정의합니다.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - 보다 작음",
         		 result : 1
         	 }, {
         		 label : "${0} - 정확히 일치",
         		 result : 0
         	 }, {
         		 label : "${0} - 보다 큼",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"인수 목록에 있는 최대값을 리턴합니다."
    },
    MEDIAN:{    
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"홀수 값을 제공한 경우 중간 값을 리턴하고 그렇지 않은 경우 두 중간 값의 산술 평균을 리턴합니다."
    },
    MID:{    
    	Syntax:"${0}(텍스트${1} 숫자${1} 숫자)",
    	Disp:"텍스트의 부분 텍스트 문자열을 리턴합니다."
    }, 
    MIN:{    
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"인수 목록에 있는 최소값을 리턴합니다."
    },    
    MINUTE:{    
    	Syntax:"${0}(숫자)",
    	Disp:"시간 값의 한 시간(0-59)에 해당하는 분에 대한 순서 번호를 판별합니다."
    },    
    MOD:{    
    	Syntax:"${0}(피제수${1} 제수)",
    	Disp:"피제수를 제수로 나눈 후 나머지를 리턴합니다."
    },
    MODE:{    
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"샘플에서 가장 공통적인 값을 리턴합니다."
    },
    MONTH:{    
    	Syntax:"${0}(숫자)",
    	Disp:"지정된 날짜 값의 월을 리턴합니다. 월은 1 - 12 사이의 정수로 리턴됩니다."
    },
    MROUND:{   
    	Syntax: "${0}(숫자${1} 배수)",
        Disp:"지정한 배수로 반올림한 숫자를 리턴합니다."
    },
    MMULT:{    
    	Syntax:"${0}(배열${1} 배열)",
    	Disp:"배열 곱셈으로, 두 배열의 곱을 리턴합니다."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(숫자1${1} [숫자 2]${1} ...)",
        Disp:"숫자 세트의 다항 계수를 리턴합니다."
    },
    N:{    
    	Syntax:"${0}(값)",
    	Disp:"값을 숫자로 변환합니다."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"오류 값 #N/A를 리턴합니다."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(시작 날짜${1} 종료 날짜${1} [휴일])",
    	Disp:"두 날짜 간의 작업일 수를 리턴합니다."
    },
    NOT:{    
    	Syntax:"${0}(논리값)",
    	Disp:"인수의 값을 반전합니다."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"컴퓨터의 현재 시간을 판별합니다."
    },
    NPV:{   
    	Syntax:"${0}(이율${1} 값 1${1} [값 2]${1} ...)",
        Disp:"일련의 미래 지급금 및 소득과 제공된 할인율을 기준으로 투자의 순현재가치를 계산합니다."
    },
    OCT2BIN:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"8진수를 2진수로 변환합니다."
    },
    OCT2DEC:{
    	Syntax:"${0}(숫자)",
    	Disp:"8진수를 10진수로 변환합니다."
    },
    OCT2HEX:{
    	Syntax:"${0}(숫자${1} [자리])",
    	Disp:"8진수를 16진수로 변환합니다."
    },
    ODD:{    
    	Syntax:"${0}(숫자)",
    	Disp:"가장 가까운 홀수로 반올림합니다. 여기서 \"올림\"은 \"0에서 멀리\"를 의미합니다."
    },
    OFFSET:{
    	Syntax:"${0}(참조${1} 행${1} 열${1} [높이]${1} [너비])",
    	Disp:"셀 또는 셀 범위에 있는 지정된 행과 열 수인 범위에 대한 참조를 리턴합니다."
    },
    OR:{    
    	Syntax:"${0}(논리값 1${1} [논리값 2]${1} ...)",
    	Disp:"하나 이상의 인수가 TRUE인 경우 TRUE를 리턴합니다."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Pi의 근사값을 리턴합니다."
    },
    PMT:{
    	Syntax:"${0}(이율${1} nper${1} pv${1} [fv]${1} [유형])",
    	Disp:"정기 납입 및 고정 금리를 기초로 대출에 대한 납입금을 리턴합니다."
    },
    POWER:{    
    	Syntax:"${0}(밑수${1} 제곱)",
    	Disp:"수를 다른 수로 제곱합니다."
    },
    PPMT:{
    	Syntax:"${0}(이율${1} per${1} nper${1} pv${1} [fv]${1} [유형])",
    	Disp:"정기 납입 및 고정 금리를 기초로 투자 기간에 대해 상환 금액을 계산합니다."
    },
    PRICEDISC:{
    	Syntax:"${0}(지불${1} 만기${1} 할인${1} 상환${1} [기초])",
    	Disp:"할인된 증권의 $100 액면가당 가격을 계산합니다."
    },
    PRICEMAT:{
    	Syntax:"${0}(지불${1} 만기${1} 발행${1} 이율${1} yld${1} [기초])",
    	Disp:"만기일에 이자를 납입하는 증권의 $100 액면가당 가격을 계산합니다."
    },
    PRODUCT:{   
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"인수로 지정된 모든 수를 곱하고 곱을 리턴합니다."
    },
    PROPER:{    
    	Syntax:"${0}(텍스트)",
    	Disp:"텍스트 문자열을 적절한 대/소문자로 변환합니다. 즉, 각 단어의 첫 번째 문자는 대문자로, 다른 모든 문자는 소문자로 변환합니다."
    },
    PV:{
    	Syntax:"${0}(이율${1} nper${1} pmt${1} [fv]${1} [유형])",
    	Disp:"일련의 미래 지급금을 기준으로 투자의 현재 가치를 계산합니다."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(분자${1} 분모)",
        Disp:"숫자를 또다른 숫자로 나눈 결과를 정수까지 잘라서 리턴합니다."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "0 - 1 범위의 난수를 리턴합니다."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(아래${1} 위)",
    	Disp: "지정한 수 사이에서 임의 정수를 리턴합니다."
    },
    RANK:{    
    	Syntax:"${0}(숫자${1} 참조${1} [순서])",
    	Disp: "샘플에 있는 값의 순위를 리턴합니다.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - 내림차순",
          		 result : 0
          	 }, {
          		 label : "${0} - 오름차순",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(지불${1} 만기${1} 투자${1} 할인${1} [기초])",
    	Disp:"전액 투자 증권에 대해 만기일에 받는 금액을 계산합니다."
    }, 
    REPLACE:{    
    	Syntax: "${0}(텍스트${1} 위치${1} 길이${1} 새 텍스트)",
    	Disp:"텍스트 문자열 내의 문자를 다른 텍스트 문자열로 대체합니다."	
    },
    REPT:{    
    	Syntax: "${0}(텍스트${1} 수)",
    	Disp:"텍스트를 지정된 횟수만큼 반복합니다."	
    },
    RIGHT:{
    	Syntax: "${0}(텍스트${1} [숫자])",
    	Disp:"텍스트의 마지막 문자를 리턴합니다."
    },
    RIGHTB:{
    	Syntax: "${0}(텍스트${1} [숫자])",
    	Disp:"텍스트의 마지막 문자를 리턴합니다."
    },
    ROUND:{   
    	Syntax: "${0}(숫자${1} 수)",
    	Disp:"수를 사전 정의된 자릿수로 반올림합니다."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(숫자${1} 수)",
    	Disp:"수를 사전 정의된 자릿수로 내림합니다."
    },
    ROUNDUP:{   
    	Syntax: "${0}(숫자${1} 수)",
    	Disp:"수를 사전 정의된 자릿수로 반올림합니다."
    },
    ROW:{   
    	Syntax:"${0}([참조])",
    	Disp:"참조의 내부 행 번호를 정의합니다."
    },
    ROWS:{   
    	Syntax:"${0}(배열)",
    	Disp:"배열 또는 참조의 행 개수를 리턴합니다."
    },
    RADIANS:{   
    	Syntax:"${0}(각도)",
    	Disp:"도수를 라디안으로 변환합니다."
    },
    ROMAN:{   
    	Syntax:"${0}(숫자${1} [양식])",
    	Disp:"아라비아 숫자를 로마 숫자(텍스트)로 변환합니다.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 일반",
          		 result : 0
          	 }, {
          		 label : "${0} - 더 간략하게",
          		 result : 1
          	 }, {
          		 label : "${0} - 더 간략하게",
          		 result : 2
          	 }, {
          		 label : "${0} - 더 간략하게",
          		 result : 3
          	 }, {
          		 label : "${0} - 간단하게",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(텍스트 찾기${1} 텍스트${1} [위치])",
    	Disp:"다른 텍스트 내에서 하나의 텍스트 값을 검색합니다(대소문자 구분 안함)."
    },  
    SIGN:{    
    	Syntax:"${0}(숫자)",
        Disp:"숫자의 대수 부호를 리턴합니다."
    },
    SIN:{    
    	Syntax:"${0}(숫자)",
    	Disp:"주어진 각도의 sine을 리턴합니다."
    },
    SINH:{    
    	Syntax:"${0}(숫자)",
    	Disp:"숫자의 쌍곡선 sine을 리턴합니다."
    },
    SECOND:{    
    	Syntax:"${0}(숫자)",
    	Disp:"시간 값의 일 분(0-59)에 해당하는 초에 대한 순서 번호를 판별합니다."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} 계수)",
        Disp:"수식에 근거한 멱급수의 합을 리턴합니다."
    },
    SHEET:{   
    	Syntax:"${0}([참조])",
    	Disp:"참조 또는 문자열의 내부 시트 번호를 리턴합니다."
    },
    SMALL:{   
    	Syntax:"${0}(배열${1} n번째_위치)",
    	Disp:"값 세트에서 n번째로 작은 값을 리턴합니다."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(텍스트${1} 이전${1} 새${1} [텍스트])",
    	Disp:"이전 텍스트가 새 텍스트로 대체된 텍스트를 리턴합니다."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(함수${1} 범위${1} ...)",
    	Disp:"스프레드시트에서 부분 합계를 계산합니다.",
    	Arguments: {
    		0 : [{
    			label : "${0} - AVERAGE",
    			result : 1
    		}, {
    			label : "${0} - COUNT",
    			result: 2
    		}, {
    			label : "${0} - COUNTA",
    			result: 3
    		}
    		, {
    			label : "${0} - MAX",
    			result: 4
    		}
    		, {
    			label : "${0} - MIN",
    			result: 5
    		}
    		, {
    			label : "${0} - PRODUCT",
    			result: 6
    		}
    		, {
    			label : "${0} - STDEV",
    			result: 7
    		}
    		, {
    			label : "${0} - STDEVP",
    			result: 8
    		}
    		, {
    			label : "${0} - SUM",
    			result: 9
    		}
    		, {
    			label : "${0} - VAR",
    			result: 10
    		}, {
    			label : "${0} - VARP",
    			result: 11
    		}, {
    			label : "${0} - AVERAGE",
    			result: 101
    		}, {
    			label : "${0} - COUNT",
    			result: 102
    		}, {
    			label : "${0} - COUNTA",
    			result: 103
    		}, {
    			label : "${0} - MAX",
    			result: 104
    		}, {
    			label : "${0} - MIN",
    			result: 105
    		}, {
    			label : "${0} - PRODUCT",
    			result: 106
    		}, {
    			label : "${0} - STDEV",
    			result: 107
    		}, {
    			label : "${0} - STDEVP",
    			result: 108
    		}, {
    			label : "${0} - SUM",
    			result: 109
    		}, {
    			label : "${0} - VAR",
    			result: 110
    		}, {
    			label : "${0} - VARP",
    			result: 111
    		}
    		]
    	}
    },
    SUM:{   
    	Syntax:"${0}(숫자1${1} [숫자 2]${1} ...)",
    	Disp:"모든 인수의 합을 리턴합니다."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(배열 1${1} [배열 2]${1} ...)",
    	Disp:"배열 인수의 곱 합계를 리턴합니다."
    },
    SUMIF:{   
    	Syntax:"${0}(범위${1} 기준${1} [합계 범위])",
    	Disp:"조건을 충족하는 인수의 총계를 구합니다."
    },
    SUMIFS:{
    	Syntax: "${0}(합계 범위${1} 기준 범위1${1} 기준1${1} ...)",
    	Disp:"다중 조건을 충족하는 인수의 총계를 구합니다."
    },
    SQRT:{   
    	Syntax:"${0}(숫자)",
    	Disp:"수의 제곱근을 리턴합니다."
    },
    SQRTPI:{   
    	Syntax:"${0}(숫자)",
        Disp:"(숫자 * pi)의 제곱근을 리턴합니다."
    },
    STDEV:
    {
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"샘플을 기준으로 표준 편차를 계산합니다."
    },
    STDEVP:
    {
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
    	Disp:"전체 모집단을 기준으로 표준 편차를 계산합니다."
    },
    SUMSQ:{
    	Syntax:"${0}(숫자 1${1} [숫자 2]${1} ...)",
        Disp:"목록에 있는 숫자의 제곱의 합을 리턴합니다."
    },
    T:{
    	Syntax:"${0}(텍스트)",
    	Disp:"인수를 텍스트로 변환합니다."
    },
    TAN:{    
    	Syntax:"${0}(숫자)",
        Disp:"주어진 숫자의 tangent를 리턴합니다."
    },
    TANH:{    
    	Syntax:"${0}(숫자)",
        Disp:"주어진 숫자의 쌍곡선 tangent를 리턴합니다."
    },
    TBILLPRICE:{
    	Syntax:"${0}(지불${1} 만기${1} 할인)",
    	Disp:"단기 국채의 $100 액면가당 가격을 계산합니다."
    },
    TEXT:{
    	Syntax:"${0}(값${1} 형식 코드)",
    	Disp:"숫자 형식 코드의 규칙에 따라 값을 텍스트로 변환한 후에 리턴합니다."
    },
    TIME:{   
    	Syntax:"${0}(시${1} 분${1} 초)",
    	Disp:"시, 분, 초의 세부사항에서 시간 값을 판별합니다."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(텍스트)",
	    Disp:"가능한 시간 형식의 텍스트에 대한 내부 번호를 리턴합니다."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"컴퓨터의 현재 날짜를 판별합니다."
    },    
    TRIM:{
    	Syntax:"${0}(텍스트)",
    	Disp:"선행 및 후미 공백을 모두 제거합니다. 내부 공백이 두 개 이상인 기타 시퀀스는 모두 단일 공백으로 대체됩니다."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"논리값 TRUE를 리턴합니다."
    },
    TRUNC:{   
    	Syntax:"${0}(숫자${1} [개수])",
    	Disp:"수의 소수 자리를 자릅니다."
    },
    TYPE:{   
    	Syntax:"${0}(값)",
    	Disp:"값의 데이터 유형을 정의합니다."	
    },
    UPPER:{  
    	Syntax: "${0}(텍스트)",
    	Disp:"텍스트를 대문자로 변환합니다."
    },
    VALUE:{    
    	Syntax: "${0}(텍스트)",
    	Disp:"텍스트 인수를 숫자로 변환합니다."
    },
    VAR:{    
    	Syntax: "${0}(숫자1${1} [숫자2]${1}...)",
    	Disp:"샘플을 기준으로 분산을 추정합니다."
    },
    VARA:{    
    	Syntax: "${0}(숫자1${1} [숫자2]${1}...)",
    	Disp:"숫자, 텍스트 및 논리값을 포함하여 샘플을 기준으로 분산을 추정합니다."
    },
    VARP:{    
    	Syntax: "${0}(숫자1${1} [숫자2]${1}...)",
    	Disp:"전체 모집단을 기준으로 분산을 계산합니다."
    },
    VARPA:{    
    	Syntax: "${0}(숫자1${1} [숫자2]${1}...)",
    	Disp:"숫자, 텍스트 및 논리값을 포함하여 전체 모집단을 기준으로 분산을 계산합니다."
    },
    VLOOKUP:{    
    	Syntax: "${0}(검색 기준${1} 배열${1} 지수${1} [정렬 순서])",
    	Disp:"지정한 셀을 세로로 검색하고 참조합니다.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - 유사하게 일치",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - 정확히 일치",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(숫자${1} [유형])",
    	Disp:"날짜 값에 대한 요일을 정수로 리턴합니다.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 숫자 1(일요일) ~ 7(토요일)",
          		 result : 1
          	 }, {
          		 label : "${0} - 숫자 1(월요일) ~ 7(일요일)",
          		 result : 2
          	 }, {
          		 label : "${0} - 숫자 0(월요일) ~ 6(일요일)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - 숫자 1(월요일) ~ 7(일요일)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - 숫자 1(화요일) ~ 7(월요일)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - 숫자 1(수요일) ~ 7(화요일)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - 숫자 1(목요일) ~ 7(수요일)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - 숫자 1(금요일) ~ 7(목요일)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - 숫자 1(토요일) ~ 7(금요일)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - 숫자 1(일요일) ~ 7(토요일)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(숫자${1} [모드])",
    	Disp:"제공된 날짜에 해당하는 달력 주를 계산합니다.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - 일요일",
          		 result : 1
          	 }, {
          		 label : "${0} - 월요일",
          		 result : 2
          		 /*
          	 }, {
          		 label : "${0} - Monday",
          		 result : 11
          	 }, {
          		 label : "${0} - Tuesday",
          		 result : 12
          	 }, {
          		 label : "${0} - Wednesday",
          		 result : 13
          	 }, {
          		 label : "${0} - Thursday",
          		 result : 14
          	 }, {
          		 label : "${0} - Friday",
          		 result : 15
          	 }, {
          		 label : "${0} - Saturday",
          		 result : 16
          	 }, {
          		 label : "${0} - Sunday",
          		 result : 17
          	 }, {
          		 label : "${0} - Monday",
          		 result : 21
          		 */
          	 }
          	 ]
           }
    },
    WORKDAY:{    
    	Syntax:"${0}(시작 날짜${1} 일${1} [휴일])",
    	Disp:"작업일의 지정된 수 이전 또는 이후 날짜의 일련 번호를 리턴합니다."
    },
    XNPV:{   
    	Syntax:"${0}(이율${1} 값${1} 날짜)",
    	Disp:"현금 흐름 스케줄에 대한 순현재가치를 계산합니다."
    },
    YEAR:{    
    	Syntax:"${0}(숫자)",
    	Disp:"날짜 값의 연도를 정수로 리턴합니다."
    }
}
})

