/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Tüm Formüller",
	LABEL_FORMULA_LIST: "Formül listesi:",
	formula:{
	ABS:{	
	    Syntax:"${0}(sayı)",
	    Disp:"Bir sayının gerçek değerini döndürür."
    },
    ACOS:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının ark kosinüsünü döndürür. Açı radyan cinsinden döndürülür."
    },
    ACOSH:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının hiperbolik kosinüsünü döndürür."
    },
    ACOT:{    
    	Syntax:"${0}(sayı)",
        Disp:"Bir sayının ters kotanjantını döndürür. Açı radyan cinsinden ölçülür."
    },
    ACOTH:{    
    	Syntax:"${0}(sayı)",
        Disp:"Bir sayının ters hiperbolik kotanjantını döndürür."
    },
    ADDRESS:{
         Syntax:"${0}(satır${1} sütun${1} [abs]${1} [a1]${1} [sayfa])",
         Disp:"Metin olarak bir hücre başvurusunu döndürür.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Mutlak",
        		 result : 1
        	 }, {
        		 label : "${0} - Mutlak satır / Göreli sütun",
        		 result : 2
        	 }, {
        		 label : "${0} - Göreli satır / Mutlak sütun",
        		 result : 3
        	 }, {
        		 label : "${0} - Göreli",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - R1C1 stili",
        		 result : 0
        	 }, {
        		 label: "${0} - A1 stili",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(mantıksal değer 1${1} [mantıksal değer 2]${1} ...)",
    	Disp:"Tüm değişkenler TRUE ise TRUE değerini döndürür."
    },
    ASIN:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının ark sinüsünü döndürür. Açı radyan cinsinden döndürülür."
    },
    ASINH:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının ters hiperbolik sinüsünü döndürür."
    },
    ATAN:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının ark tanjantını döndürür. Açı radyan cinsinden döndürülür."
    },
    AVERAGE:{    
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Değişkenlerin ortalamasını döndürür."
    },
    AVERAGEA:{    
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Örneğe ilişkin ortalama değeri döndürür. Metin sıfır olarak değerlendirilir."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(aralık${1} ölçüt${1} [ortalama_aralık])",
    	Disp:"Verilen koşula uygun bağımsız değişkenlerin ortalamasını (aritmetik ortalama) döndürür."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(ortalama_aralık${1} ölçüt_aralığı${1} ölçüt1${1} ...)",
    	Disp:"Birden çok koşula uygun bağımsız değişkenlerin ortalamasını (aritmetik ortalama) döndürür."
    },
    ATAN2:{
    	Syntax:"${0}(x_say${1} y_say)",
    	Disp:"Belirtilen x- ve y- koordinatlarının ters tanjant ya da ark tanjantını döndürür. Ters tanjant, başlangıç noktasını (0,0) ve koordinatları olan bir noktayı (x_say, y_say) içeren bir çizgiye x ekseninden giden açıdır."
    },
    ATANH:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının hiperbolik ark tanjantını döndürür. Sayı, -1 ile 1 (-1 ve 1 dışında) arasında olmalıdır."
    },
    BASE:{    
    	Syntax:"${0}(sayı${1} radix${1} [minimum uzunluk])",
    	Disp:"Pozitif bir tamsayıyı sayı sisteminden, tanımlanan tabana göre metne dönüştürür."
    },
    BIN2DEC:{
    	Syntax:"${0}(sayı)",
    	Disp:"İkili bir sayıyı ondalık bir sayıya dönüştürür."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"İkili bir sayıyı on altılı bir sayıya dönüştürür."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"İkili bir sayıyı sekizli bir sayıya dönüştürür."
    },
    CEILING:{  
    	Syntax: "${0}(sayı${1} artım)",
    	Disp:"Bir sayıyı en yakın tamsayıya ya da anlamlı üst katına yuvarlar."
    },
    CHAR: {
    	Syntax: "${0}(sayı)",
    	Disp: "Sayıyla eşlenen bir karakteri döndürür. Unicode karakter eşleminde karakteri bulur. Sayı 1 ve 255 arasındadır."
    },
    CHOOSE: {
    	Syntax: "${0}(dizin${1} değer1${1} [değer2]${1} ...)",
    	Disp: "Dizine göre karşılık gelen değeri bulur ve döndürür. En çok 30 değer SEÇEBİLİR."
    },
    CODE:{
    	Syntax:"${0}(metin)",
    	Disp:"Unicode olarak kodlanmış bir metin dizesi içindeki ilk karakter için sayısal bir kod döndürür."
    },
    COLUMN:{    
    	Syntax:"${0}([başvuru])",
    	Disp:"Bir başvurunun iç sütun numarasını döndürür."
    },
    COLUMNS:{    
    	Syntax:"${0}(dizi)",
    	Disp:"Bir dizi veya başvurudaki sütun sayısını döndürür."
    },
    COMBIN:{
    	Syntax:"${0}(sayı${1} seçilen_sayı)",
    	Disp:"Belirli sayıda öğe kombinasyonu sayısını döndürür. Belirli sayıdaki öğeler için toplam olası grup sayısını belirlemek için ${0} kullanın."
    },
    CONCATENATE:{   
    	Syntax:"${0}(metin 1${1} ...)",
    	Disp:"Birkaç metin dizesini tek bir dizede birleştirir."
    },
    CONVERT:{
    	Syntax:"${0}(sayı${1} birimden${1} birime)",
    	Disp:"Bir sayıyı bir ölçüm sisteminden diğerine dönüştürür.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Pound kütle (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (atomik kütle birimi)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Ons kütle (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Metre",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Kara mili",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - İnç",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Ayak",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yarda",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pica",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Yıl",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Gün",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Saat",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Dakika",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Saniye",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atomosfer",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimetre civa (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - Pound kuvveti",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - IT kalori",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Beygir gücü-saat",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-saat",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Ayak-pound",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Termodinamik kalori",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Beygir gücü",
       		 result : "\"HP\""
       	 }, {
       		 label : "${0} - Watt",
       		 result : "\"W\""
       	 }, {
       		 label : "${0} - Tesla",
       		 result : "\"T\""
       	 }, {
       		 label : "${0} - Gauss",
       		 result : "\"ga\""
       	 }, {
       		 label : "${0} - Selsius Derece",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Fahrenheit Derece",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Çay Kaşığı",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Yemek Kaşığı",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Sıvı ons",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Fincan",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - U.S. pint",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - U.K. pint",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Kuart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Galon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Litre",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(sayı)",
    	Disp:"Açının kosinüsünü döndürür."
    },
    COSH:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının hiperbolik kosinüsünü döndürür."
    },
    COT:{    
    	Syntax:"${0}(sayı)",
        Disp:"Verilen sayının kotanjantını döndürür."
    },
    COTH:{    
    	Syntax:"${0}(sayı)",
        Disp:"Verilen sayının hiperbolik kotanjantını döndürür."
    },
    COUNT:{   
    	Syntax:"${0}(değer1${1} [değer2]${1} ...)",
    	Disp:"Bağımsız değişkenler listesinde kaç sayı olduğunu sayar. Metin girdileri yoksayılır."
    },
    COUNTA:{   
    	Syntax:"${0}(değer1${1} [değer2]${1} ...)",
    	Disp:"Bağımsız değişkenler listesinde kaç değer olduğunu sayar."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(aralık)",
    	Disp: "Belirli bir aralıktaki boş hücreleri sayar."
    },
    COUNTIF:{
    	Syntax: "${0}(aralık${1} ölçüt)",
    	Disp:"Verilen koşula uygun hücrelerin sayısını döndürür."
    },
    COUNTIFS:{
    	Syntax: "${0}(ölçüt_aralığı1${1} ölçüt1${1} ...)",
    	Disp:"Birden çok koşula uygun hücrelerin sayısını döndürür."
    },
    CUMIPMT:{	
	    Syntax:"${0}(oran${1} dönem_sayısı${1} bugünkü_değer${1} başlangıç_dönemi${1} bitiş_dönemi${1} tip)",
	    Disp:"Belirtilen iki dönem arasında ödenen birikimli faizi hesaplar."
    },
    CUMPRINC:{	
	    Syntax:"${0}(oran${1} dönem_sayısı${1} bugünkü_değer${1} başlangıç_dönemi${1} bitiş_dönemi${1} tip)",
	    Disp:"Belirtilen iki dönem arasında, bir kredi için ödenen birikimli ana parayı hesaplar."
    }, 
    DATE:{	
	    Syntax:"${0}(yıl${1} ay${1} gün)",
	    Disp:"Verilen tarihe ilişkin bir iç sayı sağlar."
    },  
    DATEDIF:{	
	    Syntax:"${0}(başlangıç tarihi${1} bitiş tarihi${1} biçim)",
	    Disp:"İki tarih arasındaki farkı yıl, ay ya da gün olarak döndürür.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Dönem içindeki tam yıl sayısı.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Dönem içindeki tam ay sayısı.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Dönem içindeki gün sayısı.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Ay ve yıllar dikkate alınmaksızın, başlangıç_tarihi ve bitiş_tarihi arasındaki gün sayısı.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Yıllar dikkate alınmaksızın, başlangıç_tarihi ve bitiş_tarihi arasındaki ay sayısı.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Yıllar dikkate alınmaksızın, başlangıç_tarihi ve bitiş_tarihi arasındaki gün sayısı.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(metin)",
	    Disp:"Olası tarih biçimine sahip metin için bir tamsayı döndürür."
    }, 
    DAY:{
    	Syntax:"${0}(sayı)",
    	Disp:"Belirli tarih değerindeki günü döndürür. Gün, 1 - 31 arasındaki bir tamsayı olarak döndürülür. Eksi değerde tarih/saat değeri de girebilirsiniz."
    },
    DAYS360:{
    	Syntax:"${0}(başlangıç_tarihi${1} bitiş_tarihi${1} [yöntem])",
    	Disp:"360 günlük yıl bazında iki tarih arasındaki gün sayısını hesaplar.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - ABD (NASD) yöntemi",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - Avrupa yöntemi",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(başlama_tarihi${1} bitiş_tarihi${1})",
    	Disp:"İki tarih arasındaki gün sayısını hesaplar."
    },
    DEC2BIN:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"Ondalık bir sayıyı ikili bir sayıya dönüştürür."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"Ondalık bir sayıyı on altılı bir sayıya dönüştürür."
    },
    DEC2OCT:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"Ondalık bir sayıyı sekizli bir sayıya dönüştürür."
    },
    DEGREES:{	
	    Syntax:"${0}(açı)",
	    Disp:"Radyon değerini dereceye dönüştürür."
    },
    DISC:{
    	Syntax:"${0}(takas${1} vade${1} fiyat${1} itfa${1} [taban])",
    	Disp:"Bir menkul değerin indirim oranını hesaplar."
    }, 
    DOLLAR:{
    	Syntax:"${0}(sayı${1} [ondalık])",
    	Disp:"$ (dolar) para birimi biçimini kullanarak bir sayıyı metne dönüştürür."
    },
    EDATE:{
    	Syntax:"${0}(başlama_tarihi${1} ay)",
    	Disp:"Başlama tarihinden önce veya sonraki belirtilen ay sayına denk gelen tarihi temsil eden dizisel numarayı verir. "
    },
    EOMONTH:{
    	Syntax:"${0}(başlama_tarihi${1} ay)",
    	Disp:"Başlama tarihinden önce veya sonraki belirtilen ay sayısına denk gelen ayın son gününün dizisel numarasını verir."
    },
    ERFC:{   
    	Syntax:"${0}(sayı)",
        Disp:"Bir sayı ve sonsuzluk arasında bütünleştirilmiş, tamamlayıcı hata işlevini döndürür."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(başvuru)",
    	Disp:"Bir hata türüne karşılık gelen bir sayı döndürür."
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
    	Syntax:"${0}(sayı)",
    	Disp:"En yakın tamsayıya yuvarlanan bir sayıyı döndürür."
    },
    EXACT:{    
    	Syntax:"${0}(metin 1${1} metin 2)",
    	Disp: "İki metin dizesini karşılaştırır ve aynıysa TRUE değerini döndürür. Bu işlev, büyük/küçük harfe duyarlıdır."
    },
    EXP:{    
    	Syntax:"${0}(sayı)",
    	Disp: "Verilen sayı kadar yükseltilmiş bir sayı döndürür."
    },
    FACT:{  
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının faktöryelini hesaplar."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(sayı)",
        Disp:"Bir sayının çift faktöryelini döndürür."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"FALSE olarak mantıksal değer döndürür."
    },
    FIND:{   
    	Syntax:"${0}(find metin${1} metin${1} [konum])",
    	Disp:"Başka bir metinde (büyük/küçük harf duyarlı) metnin dizesini arar."
    },
    FIXED:{
    	Syntax:"${0}(sayı${1} [ondalık]${1} [no_commas])",
    	Disp:"Sabit sayıdaki ondalıkla bir sayıyı metin olarak biçimlendirir.",
    	Arguments: {
    		2 : [{
    			label : "${0} - virgülleri önle",
    			result : "TRUE"
    		}, {
    			label : "${0} - virgülleri önleme",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(sayı${1} anlam)",
    	Disp:"Sayıyı aşağıya doğru en yakın anlamlı katına yuvarlar."
    },
    FORMULA:{   
    	Syntax:"${0}(başvuru)",
    	Disp:"Formül hücresinin formülünü verir."
    },
    FREQUENCY:{   
    	Syntax:"${0}(SayıSıraListesi_verileri${1} SayıSıraListesi_sepetleri)",
    	Disp:"Değerleri aralıklar halinde sınıflandırır ve her arlıktaki değer sayısını sayar."
    },
    FV:{
    	Syntax:"${0}(oran${1} dönem_sayısı${1} ödeme${1} [bugünkü_değer]${1} [tip])",
    	Disp:"Sabit bir faiz oranına dayalı olarak bir yatırımın gelecek değerini hesaplar."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(ana_para${1} zaman_çizelgesi)",
        Disp:"Başlangıçtaki ana paranın, bir dizi bileşik faiz oranı uygulandıktan sonraki gelecek değerini hesaplar."
    },
    GAMMALN:{   
    	Syntax:"${0}(sayı)",
        Disp:"Gama işlevinin doğal logaritmasını döndürür."
    },
    GCD:{   
    	Syntax:"${0}(sayı1${1} [sayı 2]${1} ...)",
        Disp:"Tüm bağımsız değişkenlerin en büyük ortak bölenini verir."
    },
    HEX2BIN:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"On altılı bir sayıyı ikili bir sayıya dönüştürür."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(sayı)",
    	Disp:"On altılı bir sayıyı ondalık bir sayıya dönüştürür."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"On altılı bir sayıyı sekizli bir sayıya dönüştürür."
    },
    HOUR:{   
    	Syntax:"${0}(sayı)",
    	Disp:"Saat değeri için günün saatine karşılık gelen ardışık sayıyı (0-23) belirler."
    },
    HLOOKUP:{   
    	Syntax:"${0}(arama_ölçütü${1} dizi${1} Dizin${1} [sıralı])",
    	Disp:"Altta yer alan hücrelere başvuru ile yatay arama yapar.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Yaklaşık eşleşme",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Tam eşleşme",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(bağlantı${1} [hücre_metni])",
    	Disp:"Bir ağ kaynağını gösteren bağlantıyı ya da bağlantının başvurduğu bir aralığı getirir. Sağlanmışsa hücre_metni değerini (isteğe bağlı) görüntüler, aksi halde bağlantıyı metin olarak görüntüler."
    },    
    IF:{    
    	Syntax:"${0}(test${1} [then_değeri]${1} [otherwise_değeri])",
    	Disp:"Gerçekleştirilecek mantık testini belirtir."
    },
    IFS:{
    	Syntax:"${0}(test1${1} value_if_true1${1} ...)",
    	Disp:"Bir veya daha fazla koşulun karşılanıp karşılanmadığını denetlemek için mantıksal testler yürütür ve ilk TRUE koşuluyla eşleşen değeri döndürür."
    },
    IFERROR:{
    	Syntax:"${0}(değer${1} value_if_error)",
    	Disp:"İfade bir hataysa belirttiğiniz değeri döndürür. Tersi durumda, ifadenin sonucunu döndürür."
    },
    IFNA:{
    	Syntax:"${0}(değer${1} value_if_na)",
    	Disp:"İfade #N/A hata değerini verirse, belirttiğiniz değeri döndürür. Tersi durumda, ifadenin sonucunu döndürür."
    },
    INDEX:{    
    	Syntax:"${0}(başvuru${1} satır${1} [sütun]${1} [aralık])",
    	Disp:"Tanımlı aralıktan bir hücreye bir başvuru döndürür."
    },
    INDIRECT:{    
    	Syntax:"${0}(başv${1} [başv_stili])",
    	Disp:"Metin biçiminde başvurulan bir hücrenin içeriğini döndürür.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - R1C1 stili",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - A1 stili",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Sayıyı aşağıya doğru en yakın tamsayıya yuvarlar."
    },
    IPMT:{
    	Syntax:"${0}(oran${1} yüzde${1} dönem_sayısı${1} bugünkü_değer${1} [gelecek_değer]${1} [tip])",
    	Disp:"Düzenli ödemelere ve bir sabit faiz oranına dayalı olarak bir döneme ilişkin faiz yeniden ödeme tutarını hesaplar."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(değer)",
    	Disp:"Başvurulan hücre boşsa TRUE, aksi halde FALSE değerini döndürür."
    },
    ISERR:{
    	Syntax:"${0}(değer)",
    	Disp:"Değer #N/A değerine eşit olmayan bir hata değeriyse TRUE döndürür."
    },
    ISERROR:{
    	Syntax:"${0}(değer)",
    	Disp:"Değer, bir hata değeri ise sonuç TRUE olur."
    },
    ISEVEN:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer bir çift sayıysa TRUE, değilse FALSE değerini döndürür." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(başvuru)",
    	Disp:"Hücre bir formül hücresi ise sonuç TRUE olur."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer bir mantıklı sayı taşıyorsa TRUE değerini döndürür."
    },
    ISNA:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer #N/A ise TRUE döndürür."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(değer)",
    	Disp:"Değer metin değilse true döndürür."
    },
    ISNUMBER:{   
    	Syntax:"${0}(değer)",
    	Disp:"Değer sayı ise TRUE döndürür."
    },
    ISODD:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer bir tek tamsayı ise TRUE değerini döndürür."
    },
    ISPMT:{
    	Syntax:"${0}(oran${1} yüzde${1} dönem_sayısı${1} bugünkü_değer)",
    	Disp:"Bir yatırım için belirli bir dönem boyunca ödenen faizi hesaplar."
    }, 
    ISREF:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer bir başvuruysa TRUE döndürür."
    },
    ISTEXT:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değer metin ise TRUE döndürür."
    },
    LARGE:{
        Syntax:"${0}(dizi${1} n._pozisyon)",
    	Disp:"Değerler kümesinden n. en büyük değeri döndürür."
    },
    LCM:{   
    	Syntax:"${0}(sayı1${1} [sayı 2]${1} ...)",
        Disp:"Listedeki tüm sayıların en küçük ortak çarpanını verir."
    },
    LEFT:{
        Syntax:"${0}(metin${1} [uzunluk])",
    	Disp:"Metnin başından itibaren belirtilen sayıda karakteri döndürür."
    },
    LEN:{
    	Syntax:"${0}(metin)",
    	Disp:"Bir metin dizesinin uzunluğunu döndürür."
    },
    LENB:{
    	Syntax:"${0}(metin)",
    	Disp:"Bir metin dizesinin bayt sayısını döndürür."
    },
    LN:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının doğal logaritmasını döndürür."
    },
    LOG:{
    	Syntax:"${0}(sayı${1} [temel])",
    	Disp:"Belirtilen tabanda sayının logaritmasını döndürür."
    },
    LOG10:{
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının 10 tabanındaki algoritmasını döndürür."
    },
    LOOKUP:{
    	Syntax: "${0}(arama ölçütü${1} arama vektörü${1} [sonuç_vektörü])",
    	Disp:"Başka bir vektördeki değerlerle karşılaştırarak bir vektördeki değeri belirler."
    },
    LOWER:{    
    	Syntax:"${0}(metin)",
    	Disp:"Metni küçük harfe dönüştürür."
    },    
    MATCH:{    
    	Syntax: "${0}(arama ölçütü${1} arama_dizesi${1} [tip])",
    	Disp:"Değerleri karşılaştırdıktan sonra dizide bir konum tanımlar.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Daha düşük",
         		 result : 1
         	 }, {
         		 label : "${0} - Tam eşleşme",
         		 result : 0
         	 }, {
         		 label : "${0} - Daha yüksek",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Bir bağımsız değişkenler listesindeki en yüksek değeri döndürür."
    },
    MEDIAN:{    
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Bir tek sayı verilirse ortadaki değeri döndürür. Aksi takdirde, ortadaki iki değerin aritmetik ortalamasını döndürür."
    },
    MID:{    
    	Syntax:"${0}(metin${1} sayı${1} sayı)",
    	Disp:"Metnin kısmi bir metin dizesini döndürür."
    }, 
    MIN:{    
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Bir bağımsız değişkenler listesindeki en düşük değeri döndürür."
    },    
    MINUTE:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Saat değeri için saatin dakikasına ilişkin ardışık sayıyı (0-59) belirler."
    },    
    MOD:{    
    	Syntax:"${0}(bölünen_sayı${1} bölen sayı)",
    	Disp:"Bölünen sayı bölen sayıya bölündüğünde kalanı döndürür."
    },
    MODE:{    
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Örnekte en çok kullanılan değeri döndürür."
    },
    MONTH:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Belirli tarih değerindeki ayı döndürür. Ay, 1-12 arasındaki bir tamsayı olarak döndürülür."
    },
    MROUND:{   
    	Syntax: "${0}(sayı${1} kat)",
        Disp:"Bir sayıyı belirli bir kata yuvarlanmış olarak verir."
    },
    MMULT:{    
    	Syntax:"${0}(dizi${1} dizi)",
    	Disp:"Dizi çarpımı. İki dizinin çarpımını döndürür."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(sayı1${1} [sayı 2]${1} ...)",
        Disp:"Bir sayı kümesinin çokterimli katsayısını verir."
    },
    N:{    
    	Syntax:"${0}(değer)",
    	Disp:"Değeri sayıya dönüştürür."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"#N/A hata değerini döndürür."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(başlangıç tarihi${1} bitiş tarihi${1} [tatiller])",
    	Disp:"İki tarih arasındaki iş günlerinin sayıyı döndürür."
    },
    NOT:{    
    	Syntax:"${0}(mantıksal değer)",
    	Disp:"Bağımsız değişkenin değerini tersine çevirir."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Bilgisayarın geçerli saatini belirler."
    },
    NPV:{   
    	Syntax:"${0}(oran${1} değer 1${1} [değer 2]${1} ...)",
        Disp:"Sağlanan indirim oranına ve sonraki bir dizi ödeme ve gelire dayalı olarak, bir yatırımın bugünkü net değerini hesaplar."
    },
    OCT2BIN:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"Sekizli bir sayıyı ikili bir sayıya dönüştürür."
    },
    OCT2DEC:{
    	Syntax:"${0}(sayı)",
    	Disp:"Sekizli bir sayıyı ondalık bir sayıya dönüştürür."
    },
    OCT2HEX:{
    	Syntax:"${0}(sayı${1} [basamak])",
    	Disp:"Sekizli bir sayıyı on altılı bir sayıya dönüştürür."
    },
    ODD:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayıyı üstteki en yakın çift tamsayıya yuvarlar; burada \"üst\", \"0'dan uzak\" anlamına gelir."
    },
    OFFSET:{
    	Syntax:"${0}(başvuru${1} satırlar${1} sütunlar${1} [yükseklik${1} [genişlik])",
    	Disp:"Bir hücre veya hücreler aralığındaki belirtilen sayıda satır ve sütuna denk gelen bir aralığa başvuru döndürür."
    },
    OR:{    
    	Syntax:"${0}(mantıksal değer 1${1} [mantıksal değer 2]${1} ...)",
    	Disp:"En az bir değişken TRUE ise, TRUE değerini döndürür."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Pi için yaklaşık değeri döndürür."
    },
    PMT:{
    	Syntax:"${0}(oran${1} dönem_sayısı${1} bugünkü_değer${1} [gelecek_değer]${1} [tip])",
    	Disp:"Düzenli ödemelere ve sabit bir faiz oranına dayalı olarak bir krediye ilişkin ödemeyi döndürür."
    },
    POWER:{    
    	Syntax:"${0}(taban${1} kuvvet)",
    	Disp:"Bir sayıyı başka bir sayının kuvvetine çıkarır."
    },
    PPMT:{
    	Syntax:"${0}(oran${1} yüzde${1} dönem_sayısı${1} bugünkü_değer${1} [gelecek_değer]${1} [tip])",
    	Disp:"Düzenli ödemelere ve bir sabit faiz oranına dayalı olarak bir döneme ilişkin yeniden ödeme tutarını hesaplar."
    },
    PRICEDISC:{
    	Syntax:"${0}(takas${1} vade${1} indirim${1} itfa${1} [taban])",
    	Disp:"İndirimli bir menkul değerin, her 100 TL'lik nominal değeri başına fiyatını hesaplar."
    },
    PRICEMAT:{
    	Syntax:"${0}(takas${1} vade${1} çıkış${1} oran${1} getiri${1} [taban])",
    	Disp:"Vadesinde faiz ödeyen bir menkul değerin, her 100 TL'lik nominal değeri başına fiyatını hesaplar."
    },
    PRODUCT:{   
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Değişkenler olarak verilen tüm sayıları çarpar ve çarpım sonucunu döndürür."
    },
    PROPER:{    
    	Syntax:"${0}(metin)",
    	Disp:"Metin dizesindeki her sözcüğün ilk harfini büyük harfe, diğer tüm harfleri de küçük harfe dönüştürür."
    },
    PV:{
    	Syntax:"${0}(oran${1} dönem_sayısı${1} ödeme${1} [gelecek_değer]${1} [tip])",
    	Disp:"Sonraki bir dizi ödemeye dayalı olarak, bir yatırımın bugünkü değerini hesaplar."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(pay${1} payda)",
        Disp:"Bir sayının başka bir sayıya bölümünü, bir tamsayıya indirgenmiş olarak verir."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "0 ile 1 arasında rasgele bir sayı döndürür."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(taban${1} üst)",
    	Disp: "Belirttiğiniz sayılar arasında rastgele bir tamsayı döndürür."
    },
    RANK:{    
    	Syntax:"${0}(sayı${1} başv${1} [sıra])",
    	Disp: "Örnekteki değerin sıralamasını döndürür.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Azalan",
          		 result : 0
          	 }, {
          		 label : "${0} - Artan",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(takas${1} vade${1} yatırım${1} indirim${1} [taban])",
    	Disp:"Tam olarak yatırılmış bir menkul değerin vadesinde alınan tutarı hesaplar."
    }, 
    REPLACE:{    
    	Syntax: "${0}(metin${1} konum${1} uzunluk${1} yeni metin)",
    	Disp:"Bir metin dizesindeki karakterleri başka bir metin dizesiyle değiştirir."	
    },
    REPT:{    
    	Syntax: "${0}(metin${1} sayı)",
    	Disp:"Metni verilen sayı kadar yineler."	
    },
    RIGHT:{
    	Syntax: "${0}(metin${1} [sayı])",
    	Disp:"En son karakteri ya da metin karakterlerini döndürür."
    },
    RIGHTB:{
    	Syntax: "${0}(metin${1} [sayı])",
    	Disp:"En son karakteri ya da metin karakterlerini döndürür."
    },
    ROUND:{   
    	Syntax: "${0}(rakam${1} sayı)",
    	Disp:"Bir rakamı önceden belirtilen bir doğruluğa yuvarlar."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(rakam${1} sayı)",
    	Disp:"Bir rakamı önceden tanımlanan bir doğruluğa yuvarlar (alta doğru)."
    },
    ROUNDUP:{   
    	Syntax: "${0}(rakam${1} sayı)",
    	Disp:"Bir rakamı önceden tanımlanan bir doğruluğa yuvarlar (üste doğru)."
    },
    ROW:{   
    	Syntax:"${0}([başvuru])",
    	Disp:"Başvurunun iç satır sayısını tanımlar."
    },
    ROWS:{   
    	Syntax:"${0}(dizi)",
    	Disp:"Dizi ya da başvurudaki satır sayısını döndürür."
    },
    RADIANS:{   
    	Syntax:"${0}(açı)",
    	Disp:"Dereceyi radyana dönüştürür."
    },
    ROMAN:{   
    	Syntax:"${0}(sayı${1} [form])",
    	Disp:"Normal rakamları metin olarak roma rakamına dönüştürür.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasik",
          		 result : 0
          	 }, {
          		 label : "${0} - Daha kısa",
          		 result : 1
          	 }, {
          		 label : "${0} - Daha kısa",
          		 result : 2
          	 }, {
          		 label : "${0} - Daha kısa",
          		 result : 3
          	 }, {
          		 label : "${0} - Basitleştirilmiş",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(find metin${1} metin${1} [konum])",
    	Disp:"Başka bir metnin içinde bir metin değeri arar (büyük/küçük harf duyarlı değildir)."
    },  
    SIGN:{    
    	Syntax:"${0}(sayı)",
        Disp:"Bir sayının cebirsel işaretini verir."
    },
    SIN:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Verilen açının sinüsünü döndürür."
    },
    SINH:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Bir sayının hiperbolik sinüsünü döndürür."
    },
    SECOND:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Saat değeri için dakikanın saniyesine ilişkin ardışık sayıyı (0-59) belirler."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} katsayıları)",
        Disp:"Formüle dayalı olarak bir kuvvet serisinin toplamını verir."
    },
    SHEET:{   
    	Syntax:"${0}([başvuru])",
    	Disp:"Başvuru ya da dizenin iç sayfa numarasını verir."
    },
    SMALL:{   
    	Syntax:"${0}(dizi${1} n._pozisyon)",
    	Disp:"Değerler kümesinden n. en küçük değeri döndürür."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(metin${1} eski${1} yeni${1} [hangisi])",
    	Disp:"Eski metnin yeni metinle değiştirildiği metni döndürür."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(işlev${1} aralık${1} ...)",
    	Disp:"Elektronik sayfadaki alt toplamları hesaplar.",
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
    	Syntax:"${0}(sayı1${1} [sayı 2]${1} ...)",
    	Disp:"Tüm bağımsız değişkenlerin toplamını verir."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(dizi 1${1} [dizi 2]${1} ...)",
    	Disp:"Dizi değişkenleri ürünlerinin toplamını döndürür."
    },
    SUMIF:{   
    	Syntax:"${0}(aralık${1} ölçüt${1} [toplam aralık])",
    	Disp:"Koşullara uyan değişkenlerin toplamını alır."
    },
    SUMIFS:{
    	Syntax: "${0}(toplam_aralığı${1} ölçüt_aralığı1${1} ölçüt1${1} ...)",
    	Disp:"Birden çok koşula uyan bağımsız değişkenleri toplar."
    },
    SQRT:{   
    	Syntax:"${0}(sayı)",
    	Disp:"Sayının kare kökünü döndürür."
    },
    SQRTPI:{   
    	Syntax:"${0}(sayı)",
        Disp:"(sayı * pi) sonucunun kare kökünü verir."
    },
    STDEV:
    {
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Örneğe dayalı olarak standart sapmayı hesaplar."
    },
    STDEVP:
    {
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
    	Disp:"Toplama dayalı olarak standart sapmayı hesaplar."
    },
    SUMSQ:{
    	Syntax:"${0}(sayı 1${1} [sayı 2]${1} ...)",
        Disp:"Listedeki sayıların karelerinin toplamını verir."
    },
    T:{
    	Syntax:"${0}(metin)",
    	Disp:"Bağımsız değişkenlerini metne dönüştürür."
    },
    TAN:{    
    	Syntax:"${0}(sayı)",
        Disp:"Verilen sayının tanjantını döndürür."
    },
    TANH:{    
    	Syntax:"${0}(sayı)",
        Disp:"Verilen sayının hiperbolik tanjantını verir."
    },
    TBILLPRICE:{
    	Syntax:"${0}(takas${1} vade${1} indirim)",
    	Disp:"Bir hazine bonosunun, her 100 TL'lik nominal değeri başına fiyatını hesaplar."
    },
    TEXT:{
    	Syntax:"${0}(değer${1} biçimkodu)",
    	Disp:"Değeri, sayı biçimi kodunun kurallarına göre metne dönüştürür ve o metni döndürür."
    },
    TIME:{   
    	Syntax:"${0}(saat${1} dakika${1} saniye)",
    	Disp:"Saat, dakika ve saniye ayrıntılarından bir saat değerini belirler."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(metin)",
	    Disp:"Olası saat biçimine sahip metin için bir tamsayı döndürür."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Bilgisayarın geçerli tarihini belirler."
    },    
    TRIM:{
    	Syntax:"${0}(metin)",
    	Disp:"Baştaki ve sondaki tüm boşlukları kaldırır. Diğer 2 veya daha fazla ardışık boşluklar tek bir boşlukla değiştirilir."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"TRUE mantıksal değeri döndürür."
    },
    TRUNC:{   
    	Syntax:"${0}(rakam${1} [sayı])",
    	Disp:"Sayının, ondalık basamaklarını keser."
    },
    TYPE:{   
    	Syntax:"${0}(değer)",
    	Disp:"Değerin veri türünü tanımlar."	
    },
    UPPER:{  
    	Syntax: "${0}(metin)",
    	Disp:"Metin içindeki tüm harfleri büyük harflere dönüştürür."
    },
    VALUE:{    
    	Syntax: "${0}(metin)",
    	Disp:"Bir metin bağımsız değişkenini sayıya dönüştürür."
    },
    VAR:{    
    	Syntax: "${0}(sayı1${1} [sayı2]${1}...)",
    	Disp:"Bir örneğe dayalı olarak tahmini sapmayı hesaplar."
    },
    VARA:{    
    	Syntax: "${0}(sayı1${1} [sayı2]${1}...)",
    	Disp:"Bir örneğe dayalı olarak, sayılar, metin ve mantıksal değerler dahil, tahmini sapmayı hesaplar."
    },
    VARP:{    
    	Syntax: "${0}(sayı1${1} [sayı2]${1}...)",
    	Disp:"Toplam popülasyona dayalı olarak tahmini sapmayı hesaplar."
    },
    VARPA:{    
    	Syntax: "${0}(sayı1${1} [sayı2]${1}...)",
    	Disp:"Toplam popülasyona dayalı olarak, sayılar, metin ve mantıksal değerler dahil, tahmini sapmayı hesaplar."
    },
    VLOOKUP:{    
    	Syntax: "${0}(arama ölçütü${1} dizi${1} dizin${1} [sıralama düzeni])",
    	Disp:"Belirtilen hücrelere başvuru ve dikey arama.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Yaklaşık eşleşme",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Tam eşleşme",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(sayı${1} [tür])",
    	Disp:"Tarih değeri için haftanın bir gününü tamsayı olarak döndürür.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Sayı 1 (Pazar) - 7 (Cumartesi)",
          		 result : 1
          	 }, {
          		 label : "${0} - Sayı 1 (Pazartesi) - 7 (Pazar)",
          		 result : 2
          	 }, {
          		 label : "${0} - Sayı 0 (Pazartesi) - 6 (Pazar)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Sayı 1 (Pazartesi) - 7 (Pazar)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Salı) - 7 (Pazartesi)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Çarşamba) - 7 (Salı)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Perşembe) - 7 (Çarşamba)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Cuma) - 7 (Perşembe)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Cumartesi) - 7 (Cuma)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Sayı 1 (Pazar) - 7 (Cumartesi)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(sayı${1} [mod])",
    	Disp:"Verilen tarihe karşılık gelen takvim haftasını hesaplar.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Pazar",
          		 result : 1
          	 }, {
          		 label : "${0} - Pazartesi",
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
    	Syntax:"${0}(başlangıç tarihi${1} gün${1} [tatiller])",
    	Disp:"Belirli bir sayıdaki iş gününden önce veya sonra tarihin seri numarasını döndürür."
    },
    XNPV:{   
    	Syntax:"${0}(oran${1} değerler${1} tarihler)",
    	Disp:"Bir nakit akışı zaman çizelgesi için bugünkü net değeri hesaplar."
    },
    YEAR:{    
    	Syntax:"${0}(sayı)",
    	Disp:"Tarih değerine göre yılı tamsayı olarak bulur."
    }
}
})

