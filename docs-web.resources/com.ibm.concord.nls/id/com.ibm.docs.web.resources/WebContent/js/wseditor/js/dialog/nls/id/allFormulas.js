/*
 * Do not translate 'result' field of Arguments, like 
 * 	result : 1
 * 	result : "TRUE"
 * 	result : "\"ug\""
 * Do not translate formula error code like #NAME?, #NULL!, they all starts with #
 * 
 * */
({
	titleDialog: "Semua Formula",
	LABEL_FORMULA_LIST: "Daftar formula:",
	formula:{
	ABS:{	
	    Syntax:"${0}(bilangan)",
	    Disp:"Mengembalikan nilai mutlak suatu bilangan."
    },
    ACOS:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan arka kosinus suatu bilangan. Sudut dikembalikan dalam radian."
    },
    ACOSH:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan kosinus hiperbolik terbalik dari suatu bilangan."
    },
    ACOT:{    
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan kotangen terbalik dari suatu bilangan. Sudut diukur dalam radian."
    },
    ACOTH:{    
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan kotangen hiperbolik terbalik dari suatu bilangan."
    },
    ADDRESS:{
         Syntax:"${0}(baris${1} kolom${1} [abs]${1} [a1]${1} [lembar])",
         Disp:"Mengembalikan referensi ke sel sebagai teks.",
         Arguments: {
        	 2 : [{
        		 label : "${0} - Absolut",
        		 result : 1
        	 }, {
        		 label : "${0} - Baris absolut / Kolom relatif",
        		 result : 2
        	 }, {
        		 label : "${0} - Baris relatif / Kolom absolut",
        		 result : 3
        	 }, {
        		 label : "${0} - Relatif",
        		 result : 4
        	 }
        	 ],
        	 
        	 3 : [{
        		 label : "${0} - gaya R1C1",
        		 result : 0
        	 }, {
        		 label: "${0} - gaya A1",
        		 result : 1
        	 }
        	 ]
         }
    },
    AND:{    
    	Syntax:"${0}(nilai logis 1${1} [nilai logis 2]${1} ...)",
    	Disp:"Mengembalikan TRUE jika semua argumen TRUE."
    },
    ASIN:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan arka sinus suatu bilangan. Sudut dikembalikan dalam radian."
    },
    ASINH:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan sinus hiperbolik terbalik dari suatu bilangan."
    },
    ATAN:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan arka tangen suatu bilangan. Sudut dikembalikan dalam radian."
    },
    AVERAGE:{    
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai rata-rata argumen."
    },
    AVERAGEA:{    
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai rata-rata untuk suatu sampel. Teks dievaluasi sebagai nol."
    },
    AVERAGEIF:{    
    	Syntax:"${0}(rentang${1} kriteria${1} [rentang_rata-rata])",
    	Disp:"Mengembalikan rata-rata (rata-rata aritmetika) dari argumen yang memenuhi syarat yang diberikan."
    },
    AVERAGEIFS:{    
    	Syntax: "${0}(rentang_rata-rata${1} rentang_kriteria1${1} kriteria1${1} ...)",
    	Disp:"Mengembalikan rata-rata (rata-rata aritmetika) dari argumen yang memenuhi syarat ganda."
    },
    ATAN2:{
    	Syntax:"${0}(x_num${1} y_num)",
    	Disp:"Mengembalikan arka tangen, atau terbalik tangen, dari koordinat x dan y yang ditentukan. Arka tangen adalah sudut dari sumbu x ke garis yang terdapat yang asli (0,0) dan titik dengan koordinat (x_ang, y_ang)."
    },
    ATANH:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan tangen hiperbolik terbalik dari suatu bilangan. Bilangan harus berada di antara -1 dan 1 (tidak termasuk -1 dan 1)."
    },
    BASE:{    
    	Syntax:"${0}(bilangan${1} radiks${1} [panjang minimum])",
    	Disp:"Mengonversi bilangan bulat positif ke teks dari sistem bilangan ke basis yang ditentukan."
    },
    BIN2DEC:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengonversi bilangan biner ke bilangan desimal."
    }, 
    BIN2HEX:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan biner ke bilangan heksadesimal."
    }, 
    BIN2OCT:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan biner ke bilangan oktal."
    },
    CEILING:{  
    	Syntax: "${0}(bilangan${1} inkremental)",
    	Disp:"Membulatkan angka ke bilangan bulat terdekat atau kelipatan signifikan."
    },
    CHAR: {
    	Syntax: "${0}(angka)",
    	Disp: "Mengembalikan karakter yang dipetakan oleh angka. Ini menemukan karakter pada peta karakter Unicode. Angka antara 1 dan 255."
    },
    CHOOSE: {
    	Syntax: "${0}(indeks${1} nilai1${1} [nilai2]${1} ...)",
    	Disp: "Mencari dan mengembalikan nilai yang berkaitan sesuai dengan indeks. Ini dapat MEMILIH dari hingga 30 nilai."
    },
    CODE:{
    	Syntax:"${0}(teks)",
    	Disp:"Mengembalikan kode numerik untuk karakter pertama pada string teks yang dikodekan pada Unicode"
    },
    COLUMN:{    
    	Syntax:"${0}([referensi])",
    	Disp:"Mengembalikan bilangan kolom internal dari referensi."
    },
    COLUMNS:{    
    	Syntax:"${0}(array)",
    	Disp:"Mengembalikan bilangan kolom pada array atau referensi."
    },
    COMBIN:{
    	Syntax:"${0}(bilangan${1} bilangan_dipilih)",
    	Disp:"Mengembalikan bilangan kombinasi untuk bilangan yang ditentukan dari suatu item. Gunakan ${0} untuk menentukan jumlah total yang mungkin untuk bilangan yang ditentukan dari item."
    },
    CONCATENATE:{   
    	Syntax:"${0}(teks 1${1} ...)",
    	Disp:"Menggabungkan beberapa string teks menjadi satu string."
    },
    CONVERT:{
    	Syntax:"${0}(bilangan${1} dari_unit${1} ke_unit)",
    	Disp:"Mengonversi bilangan dari satu sistem pengukuran ke yang lainnya.",
    	Arguments: {
       	 1 : [{
       		 label : "${0} - Gram",
       		 result : "\"g\""
       	 }, {
       		 label : "${0} - Slug",
       		 result : "\"sg\""
       	 }, {
       		 label : "${0} - Massa Pound (avoirdupois)",
       		 result : "\"lbm\""
       	 }, {
       		 label : "${0} - U (satuan massa atom)",
       		 result : "\"u\""
       	 }, {
       		 label : "${0} - Massa Ounce (avoirdupois)",
       		 result : "\"ozm\""
       	 }, {
       		 label : "${0} - Meter",
       		 result : "\"m\""
       	 }, {
       		 label : "${0} - Mil Darat",
       		 result : "\"mi\""
       	 }, {
       		 label : "${0} - Inci",
       		 result : "\"in\""
       	 }, {
       		 label : "${0} - Kaki",
       		 result : "\"ft\""
       	 }, {
       		 label : "${0} - Yard",
       		 result : "\"yd\""
       	 }, {
       		 label : "${0} - Angstrom",
       		 result : "\"ang\""
       	 }, {
       		 label : "${0} - pika",
       		 result : "\"pica\""
       	 }, {
       		 label : "${0} - Tahun",
       		 result : "\"yr\""
       	 }, {
       		 label : "${0} - Hari",
       		 result : "\"day\""
       	 }, {
       		 label : "${0} - Jam",
       		 result : "\"hr\""
       	 }, {
       		 label : "${0} - Menit",
       		 result : "\"mn\""
       	 }, {
       		 label : "${0} - Detik",
       		 result : "\"sec\""
       	 }, {
       		 label : "${0} - Pascal",
       		 result : "\"Pa\""
       	 }, {
       		 label : "${0} - Atmosfer",
       		 result : "\"atm\""
       	 }, {
       		 label : "${0} - milimeter Merkuri (Torr)",
       		 result : "\"mmHg\""
       	 }, {
       		 label : "${0} - Newton",
       		 result : "\"N\""
       	 }, {
       		 label : "${0} - Dyne",
       		 result : "\"dyn\""
       	 }, {
       		 label : "${0} - gaya Pound",
       		 result : "\"lbf\""
       	 }, {
       		 label : "${0} - Joule",
       		 result : "\"J\""
       	 }, {
       		 label : "${0} - Erg",
       		 result : "\"e\""
       	 }, {
       		 label : "${0} - kalori IT",
       		 result : "\"cal\""
       	 }, {
       		 label : "${0} - Elektronvolt",
       		 result : "\"eV\""
       	 }, {
       		 label : "${0} - Tenaga kuda-jam",
       		 result : "\"HPh\""
       	 }, {
       		 label : "${0} - Watt-jam",
       		 result : "\"Wh\""
       	 }, {
       		 label : "${0} - Kaki-pound",
       		 result : "\"flb\""
       	 }, {
       		 label : "${0} - BTU",
       		 result : "\"BTU\""
       	 }, {
       		 label : "${0} - Kalori Termodinamika",
       		 result : "\"c\""
       	 }, {
       		 label : "${0} - Tenaga kuda",
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
       		 label : "${0} - Derajat Celsius",
       		 result : "\"C\""
       	 }, {
       		 label : "${0} - Derajat Fahrenheit",
       		 result : "\"F\""
       	 }, {
       		 label : "${0} - Kelvin",
       		 result : "\"K\""
       	 }, {
       		 label : "${0} - Sendok teh",
       		 result : "\"tsp\""
       	 }, {
       		 label : "${0} - Sendok makan",
       		 result : "\"tbs\""
       	 }, {
       		 label : "${0} - Ounce cairan",
       		 result : "\"oz\""
       	 }, {
       		 label : "${0} - Cup",
       		 result : "\"cup\""
       	 }, {
       		 label : "${0} - pint (U.S.)",
       		 result : "\"us_pt\""
       	 }, {
       		 label : "${0} - pint (U.K.)",
       		 result : "\"uk_pt\""
       	 }, {
       		 label : "${0} - Quart",
       		 result : "\"qt\""
       	 }, {
       		 label : "${0} - Gallon",
       		 result : "\"gal\""
       	 }, {
       		 label : "${0} - Liter",
       		 result : "\"I\""
       	 }
       	 ],
       	 2 : 1	//SAME WITH 2
        }
    },
    COS:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan kosinus dari sudut yang ditentukan."
    },
    COSH:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan kosinus hiperbolik dari suatu bilangan."
    },
    COT:{    
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan kotangen dari bilangan yang ditentukan."
    },
    COTH:{    
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan kotangen hiperbolik dari bilangan yang ditentukan."
    },
    COUNT:{   
    	Syntax:"${0}(nilai1${1} [nilai2]${1} ...)",
    	Disp:"Menghitung berapa banyak bilangan yang terdapat dalam daftar argumen. Entri teks diabaikan."
    },
    COUNTA:{   
    	Syntax:"${0}(nilai1${1} [nilai2]${1} ...)",
    	Disp:"Menghitung berapa banyak nilai yang terdapat dalam daftar argumen."
    },
    COUNTBLANK:{   
    	Syntax:"${0}(rentang)",
    	Disp: "Menghitung sel kosong pada rentang yang ditentukan."
    },
    COUNTIF:{
    	Syntax: "${0}(rentang${1} kriteria)",
    	Disp:"Menghitung jumlah sel yang memenuhi syarat yang diberikan."
    },
    COUNTIFS:{
    	Syntax: "${0}(rentang_kriteria1${1} kriteria1${1} ...)",
    	Disp:"Menghitung jumlah sel yang memenuhi syarat ganda."
    },
    CUMIPMT:{	
	    Syntax:"${0}(tarif${1} nper${1} pv${1} periode_mulai${1} periode_akhir${1} tipe)",
	    Disp:"Menghitung bunga kumulatif yang dibayarkan di antara dua periode yang ditentukan."
    },
    CUMPRINC:{	
	    Syntax:"${0}(tarif${1} nper${1} pv${1} periode_mulai${1} periode_akhir${1} tipe)",
	    Disp:"Menghitung pokok kumulatif yang dibayarkan pada pinjaman, di antara dua periode yang ditentukan."
    }, 
    DATE:{	
	    Syntax:"${0}(tahun${1} bulan${1} hari)",
	    Disp:"Memberikan bilangan internal untuk tanggal yang ditentukan."
    },  
    DATEDIF:{	
	    Syntax:"${0}(tanggal mulai${1} tanggal berakhir${1} format)",
	    Disp:"Mengembalikan perubahan dalam tahun, bulan, atau hari antara dua tanggal.",
	    Arguments: {
	    	2 : [{
	    		label: "${0} - Jumlah seluruh tahun dalam periode.",
	    		result: "\"Y\""
	    	}, {
	    		label: "${0} - Jumlah seluruh bulan dalam periode.",
	    		result: "\"M\""
	    	}, {
	    		label: "${0} - Jumlah hari dalam periode.",
	    		result: "\"D\""
	    	}, {
	    		label: "${0} - Jumlah hari antara tanggal_mulai dan tanggal_berakhir, mengabaikan bulan dan tahun.",
	    		result: "\"MD\""
	    	}, {
	    		label: "${0} - Jumlah bulan antara tanggal_mulai dan tanggal_berakhir, mengabaikan tahun.",
	    		result: "\"YM\""
	    	}, {
	    		label: "${0} - Jumlah hari antara tanggal_mulai dan tanggal_berakhir, mengabaikan tahun.",
	    		result: "\"YD\""
	    	}
	    	]
	    }
    },  
    DATEVALUE:{	
	    Syntax:"${0}(teks)",
	    Disp:"Mengembalikan bilangan internal untuk teks yang memiliki format tanggal yang mungkin."
    }, 
    DAY:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan hari nilai tanggal yang ditentukan. Hari dikembalikan sebagai bilangan bulat antara 1 dan 31. Anda juga dapat memasukkan nilai tanggal/waktu negatif."
    },
    DAYS360:{
    	Syntax:"${0}(tanggal_mulai${1} tanggal_berakhir${1} [metode])",
    	Disp:"Menghitung jumlah hari antara dua tanggal berdasarkan tahun dengan 360 hari.",
    	Arguments: {
       	 2 : [{
       		 label : "${0} - metode U.S. (NASD)",
       		 result : "FALSE"
       	 }, {
       		 label : "${0} - metode Eropa",
       		 result : "TRUE"
       	 }
       	 ]
        }
    },
    DAYS:{
    	Syntax:"${0}(tanggal_mulai${1} tanggal_berakhir${1}",
    	Disp:"Menghitung jumlah hari antara dua tanggal."
    },
    DEC2BIN:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan desimal ke bilangan biner."
    }, 
    DEC2HEX:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan desimal ke bilangan heksadesimal."
    },
    DEC2OCT:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan desimal ke bilangan oktal."
    },
    DEGREES:{	
	    Syntax:"${0}(sudut)",
	    Disp:"Mengonversi radian ke derajat."
    },
    DISC:{
    	Syntax:"${0}(penyelesaian${1} jatuh tempo${1} pr${1} tebusan${1} [basis])",
    	Disp:"Menghitung tarif diskon untuk sekuritas."
    }, 
    DOLLAR:{
    	Syntax:"${0}(bilangan${1} [desimal])",
    	Disp:"Mengonversi bilangan ke teks, menggunakan format mata uang $ (dolar)."
    },
    EDATE:{
    	Syntax:"${0}(tanggal_mulai${1} bulan)",
    	Disp:"Mengembalikan nomor seri yang mewakili data yang menunjukkan angka bulan sebelum atau setelah tanggal_mulai "
    },
    EOMONTH:{
    	Syntax:"${0}(tanggal_mulai${1} bulan)",
    	Disp:"Mengembalikan nomor seri untuk hari terakhir bulan tersebut yang menunjukkan angka bulan sebelum atau setelah tanggal_mulai"
    },
    ERFC:{   
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan fungsi kesalahan komplementer, terintegrasi antara suatu bilangan dan tidak terbatas."
    },
    "ERROR.TYPE":{    
    	Syntax:"${0}(referensi)",
    	Disp:"Mengembalikan bilangan yang berhubungan ke jenis kesalahan."
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
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan bilangan yang dibulatkan ke atas ke bilangan bulat genap terdekat."
    },
    EXACT:{    
    	Syntax:"${0}(teks 1${1} teks 2)",
    	Disp: "Membandingkan dua rangkaian teks dan mengembalikan BENAR jika identik. Fungsi ini sensitif-huruf besar."
    },
    EXP:{    
    	Syntax:"${0}(angka)",
    	Disp: "Mengembalikan e yang memangkatkan bilangan yang ditentukan."
    },
    FACT:{  
    	Syntax:"${0}(angka)",
    	Disp:"Menghitung faktorial sebuah bilangan."
    },
    FACTDOUBLE:{  
    	Syntax:"${0}(angka)",
        Disp:"Mengembalikan faktorial ganda dari suatu bilangan."
    },
    FALSE:{
    	Syntax:"${0}()",
    	Disp:"Mengembalikan nilai logis sebagai FALSE."
    },
    FIND:{   
    	Syntax:"${0}(teks yang ditemukan${1} teks${1} [posisi])",
    	Disp:"Mencari string teks dalam teks lain (sensitif-huruf besar)."
    },
    FIXED:{
    	Syntax:"${0}(bilangan${1} [desimal]${1} [tanpa_koma])",
    	Disp:"Memformat bilangan sebagai teks dalam bilangan desimal yang ditetapkan.",
    	Arguments: {
    		2 : [{
    			label : "${0} - menghilangkan koma",
    			result : "TRUE"
    		}, {
    			label : "${0} - tidak menghilangkan koma",
    			result: "FALSE" 
    		}
    		]
    	}
    },
    FLOOR:{   
    	Syntax:"${0}(bilangan${1} signifikan)",
    	Disp:"Membulatkan bilangan ke bawah ke kelipatan signifikansi terdekat."
    },
    FORMULA:{   
    	Syntax:"${0}(referensi)",
    	Disp:"Mengembalikan formula dari sel formula."
    },
    FREQUENCY:{   
    	Syntax:"${0}(NumberSequenceList_data${1} NumberSequenceList_bin)",
    	Disp:"Mengategorikan nilai-nilai ke interval dan menghitung bilangan nilai pada tiap-tiap interval."
    },
    FV:{
    	Syntax:"${0}(tarif${1} nper${1} pmt${1} [pv]${1} [tipe])",
    	Disp:"Menghitung nilai investasi di masa depan berdasarkan tingkat bunga tetap."
    },
    FVSCHEDULE:{    
    	Syntax:"${0}(pokok${1} jadwal)",
        Disp:"Menghitung nilai pokok awal di masa depan, setelah menerapkan deret tingkat bunga majemuk."
    },
    GAMMALN:{   
    	Syntax:"${0}(angka)",
        Disp:"Mengembalikan logaritma natural dari fungsi gamma."
    },
    GCD:{   
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
        Disp:"Mengembalikan faktor persekutuan terbesar dari semua argumen."
    },
    HEX2BIN:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan heksadesimal ke bilangan biner."
    }, 
    HEX2DEC:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengonversi bilangan heksadesimal ke bilangan desimal."
    }, 
    HEX2OCT:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan heksadesimal ke bilangan oktal."
    },
    HOUR:{   
    	Syntax:"${0}(angka)",
    	Disp:"Menentukan jumlah berurut jam dalam sehari (0-23) untuk nilai waktu."
    },
    HLOOKUP:{   
    	Syntax:"${0}(kriteria_pencarian${1} array${1} Indeks${1} [diurutkan])",
    	Disp:"Pencarian horizontal dan referensi ke sel yang terletak di bawah.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Hampir cocok",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Sama dengan",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    HYPERLINK:{    
    	Syntax:"${0}(tautan${1} [teks_sel])",
    	Disp:"Mengembalikan tautan yang mengarah ke sumber jaringan atau ke rentang yang dirujuk oleh tautan. Menampilkan teks_sel (opsional) apabila tersedia; atau, menampilkan tautan sebagai teks."
    },    
    IF:{    
    	Syntax:"${0}(uji${1} [nilai_kemudian]${1} [nilai_lainnya])",
    	Disp:"Menentukan uji logis yang akan dilakukan."
    },
    IFS:{
    	Syntax:"${0}(tes1${1} nilai_jika_benar1${1} ...)",
    	Disp:"Menjalankan tes logika untuk memeriksa apakah satu atau lebih syarat terpenuhi dan mengembalikan nilai yang cocok dengan syarat TRUE pertama."
    },
    IFERROR:{
    	Syntax:"${0}(nilai${1} nilai_jika_salah)",
    	Disp:"Mengembalikan nilai yang Anda tentukan jika pernyataan salah. Jika tidak, mengembalikan hasil dari pernyataan."
    },
    IFNA:{
    	Syntax:"${0}(nilai${1} nilai_jika_na)",
    	Disp:"Mengembalikan nilai yang Anda tentukan jika pernyataan mengembalikan nilai kesalahan #N/A. Jika tidak, mengembalikan hasil dari pernyataan."
    },
    INDEX:{    
    	Syntax:"${0}(referensi${1} baris${1} [kolom]${1} [rentang])",
    	Disp:"Mengembalikan referensi ke sel dari rentang yang ditetapkan."
    },
    INDIRECT:{    
    	Syntax:"${0}(ref${1} [gaya_ref])",
    	Disp:"Mengembalikan konten sel yang direferensikan dalam bentuk teks.",
    	Arguments: {
         	 1 : [{
         		 label : "${0} - gaya R1C1",
         		 result : "FALSE"
         	 }, {
         		 label : "${0} - gaya A1",
         		 result : "TRUE"
         	 }
         	 ]
          }
    }, 
    INT:{    
    	Syntax:"${0}(angka)",
    	Disp:"Membulatkan bilangan ke bawah ke bilangan bulat terdekat."
    },
    IPMT:{
    	Syntax:"${0}(tarif${1} per${1} nper${1} pv${1} [fv]${1} [tipe])",
    	Disp:"Menghitung jumlah pembayaran kembali bunga selama periode untuk investasi berdasarkan pembayaran rutin dan tarif bunga tetap."
    }, 
    ISBLANK:{   
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika sel yang direferensikan kosong, jika tidak maka mengembalikan FALSE."
    },
    ISERR:{
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai tersebut adalah nilai salah tidak sama dengan #N/A."
    },
    ISERROR:{
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai adalah nilai salah."
    },
    ISEVEN:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai genap, jika tidak maka mengembalikan FALSE." 
    },
    ISFORMULA:{    
    	Syntax:"${0}(referensi)",
    	Disp:"Mengembalikan TRUE jika sel adalah sel formula."
    },
    ISLOGICAL:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai terdiri dari bilangan logis."
    },
    ISNA:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai sama dengan #N/A."
    },  
    ISNONTEXT:{   
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan benar jika nilai bukan teks."
    },
    ISNUMBER:{   
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai adalah bilangan."
    },
    ISODD:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai adalah bilangan bulat ganjil."
    },
    ISPMT:{
    	Syntax:"${0}(tarif${1} per${1} nper${1} pv)",
    	Disp:"Menghitung bunga yang dibayarkan selama periode yang ditetapkan untuk suatu investasi."
    }, 
    ISREF:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai adalah referensi."
    },
    ISTEXT:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengembalikan TRUE jika nilai adalah teks."
    },
    LARGE:{
        Syntax:"${0}(array${1} posisi_nth)",
    	Disp:"Mengembalikan nilai terbesar dari set nilai."
    },
    LCM:{   
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
        Disp:"Mengembalikan kelipatan persekutuan terkecil dari semua bilangan dalam daftar."
    },
    LEFT:{
        Syntax:"${0}(teks${1} [panjang])",
    	Disp:"Mengembalikan bilangan yang ditentukan dari karakter dari awal teks."
    },
    LEN:{
    	Syntax:"${0}(teks)",
    	Disp:"Mengembalikan panjang rangkaian teks."
    },
    LENB:{
    	Syntax:"${0}(teks)",
    	Disp:"Mengembalikan jumlah bita dari rangkaian teks."
    },
    LN:{
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan logaritma natural dari suatu bilangan."
    },
    LOG:{
    	Syntax:"${0}(bilangan${1} [dasar])",
    	Disp:"Mengembalikan logaritma suatu bilangan pada basis yang ditentukan."
    },
    LOG10:{
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan logaritma basis-10 dari suatu bilangan."
    },
    LOOKUP:{
    	Syntax: "${0}(kriteria pencarian${1} vektor pencarian${1} [vektor_hasil])",
    	Disp:"Menentukan nilai dalam suatu vektor dengan perbandingan terhadap nilai-nilai vektor."
    },
    LOWER:{    
    	Syntax:"${0}(teks)",
    	Disp:"Mengonversi teks ke huruf kecil."
    },    
    MATCH:{    
    	Syntax: "${0}(kriteria pencarian${1} lookup_array${1} [tipe])",
    	Disp:"Menetapkan posisi pada array setelah membandingkan nilai.",
    	Arguments: {
         	 2 : [{
         		 label : "${0} - Kurang dari",
         		 result : 1
         	 }, {
         		 label : "${0} - Sama dengan",
         		 result : 0
         	 }, {
         		 label : "${0} - Lebih besar dari",
         		 result : -1
         	 }
         	 ]
          }
    },
    MAX:{   
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai maksimum pada daftar argumen."
    },
    MEDIAN:{    
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai tengah, jika ditetapkan bilangan ganjil dari nilai-nilai. Atau, mengembalikan rata-rata aritmetika dari dua nilai tengah."
    },
    MID:{    
    	Syntax:"${0}(teks${1} bilangan${1} bilangan)",
    	Disp:"Mengembalikan rangkaian teks parsial dari suatu teks."
    }, 
    MIN:{    
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai minimum pada daftar argumen."
    },    
    MINUTE:{    
    	Syntax:"${0}(angka)",
    	Disp:"Menentukan jumlah berurut untuk menit dalam satu jam (0-59) untuk nilai waktu."
    },    
    MOD:{    
    	Syntax:"${0}(bilangan_dibagi${1} pembagi)",
    	Disp:"Mengembalikan sisa hasil pembagian bilangan yang dibagi oleh pembaginya."
    },
    MODE:{    
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan nilai sampel yang paling sering muncul."
    },
    MONTH:{    
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan bulan untuk nilai tanggal yang ditetapkan. Bulan tersebut dikembalikan sebagai bilangan bulat antara 1 dan 12."
    },
    MROUND:{   
    	Syntax: "${0}(bilangan${1} kelipatan)",
        Disp:"Mengembalikan bilangan yang dibulatkan ke kelipatan yang ditentukan."
    },
    MMULT:{    
    	Syntax:"${0}(array${1} array)",
    	Disp:"Mengalikan array. Mengembalikan produk dua array."
    },
    MULTINOMIAL:{   
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
        Disp:"Mengembalikan koefisien multinomial dari serangkaian bilangan."
    },
    N:{    
    	Syntax:"${0}(nilai)",
    	Disp:"Mengonversi nilai ke bilangan."
    },    
    NA:{    
    	Syntax:"${0}()",
    	Disp:"Mengembalikan nilai salah #N/A."
    },
    NETWORKDAYS:{    
    	Syntax:"${0}(tanggal mulai${1} tanggal berakhir${1} [hari libur])",
    	Disp:"Mengembalikan jumlah hari kerja antara dua tanggal."
    },
    NOT:{    
    	Syntax:"${0}(nilai logis)",
    	Disp:"Membalikkan nilai argumen."
    },
    NOW:{    
    	Syntax:"${0}()",
    	Disp:"Menentukan waktu komputer saat ini."
    },
    NPV:{   
    	Syntax:"${0}(tarif${1} nilai 1${1} [nilai 2]${1} ...)",
        Disp:"Menghitung nilai kini bersih dari suatu investasi, berdasarkan tarif diskon yang diberikan, dan deret pendapatan dan pembayaran di masa depan."
    },
    OCT2BIN:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan oktal ke bilangan biner."
    },
    OCT2DEC:{
    	Syntax:"${0}(angka)",
    	Disp:"Mengonversi bilangan oktal ke bilangan desimal."
    },
    OCT2HEX:{
    	Syntax:"${0}(bilangan${1} [tempat])",
    	Disp:"Mengonversi bilangan oktal ke bilangan heksadesimal."
    },
    ODD:{    
    	Syntax:"${0}(angka)",
    	Disp:"Membulatkan bilangan ke atas ke bilangan ganjil terdekat, di mana \"atas\" berarti \"jauh dari 0\"."
    },
    OFFSET:{
    	Syntax:"${0}(referensi${1} baris${1} kolom${1} [tinggi]${1} [lebar])",
    	Disp:"Mengembalikan referensi ke rentang yang merupakan jumlah baris dan kolom yang ditentukan dari sel atau rentang sel."
    },
    OR:{    
    	Syntax:"${0}(nilai logis 1${1} [nilai logis 2]${1} ...)",
    	Disp:"Mengembalikan TRUE jika setidaknya satu argumen TRUE."
    },
    PI:{    
    	Syntax:"${0}()",
    	Disp:"Mengembalikan nilai pendekatan Pi."
    },
    PMT:{
    	Syntax:"${0}(tarif${1} nper${1} pv${1} [fv]${1} [tipe])",
    	Disp:"Mengembalikan pembayaran untuk pinjaman berdasarkan pembayaran rutin dan tarif bunga tetap."
    },
    POWER:{    
    	Syntax:"${0}(basis${1} pangkat)",
    	Disp:"Memangkatkan bilangan dengan bilangan lainnya."
    },
    PPMT:{
    	Syntax:"${0}(tarif${1} per${1} nper${1} pv${1} [fv]${1} [tipe])",
    	Disp:"Menghitung jumlah pembayaran kembali selama periode untuk investasi berdasarkan pembayaran rutin dan tarif bunga tetap."
    },
    PRICEDISC:{
    	Syntax:"${0}(penyelesaian${1} jatuh tempo${1} diskon${1} tebusan${1} [basis])",
    	Disp:"Menghitung harga per $100 nilai nominal sekuritas yang didiskon."
    },
    PRICEMAT:{
    	Syntax:"${0}(penyelesaian${1} jatuh tempo${1} penerbitan${1} tarif${1} yld${1} [basis])",
    	Disp:"Menghitung harga per $100 nilai nominal sekuritas yang membayar bunga pada jatuh tempo."
    },
    PRODUCT:{   
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengalikan seluruh bilangan yang diberikan sebagai argumen dan mengembalikan hasil kalinya."
    },
    PROPER:{    
    	Syntax:"${0}(teks)",
    	Disp:"Mengonversi rangkaian teks ke bentuk huruf yang sesuai, huruf pertama dari setiap kata berupa huruf besar dan sisanya huruf kecil."
    },
    PV:{
    	Syntax:"${0}(tarif${1} nper${1} pmt${1} [fv]${1} [tipe])",
    	Disp:"Menghitung nilai kini suatu investasi, berdasarkan deret pembayaran di masa depan."
    }, 
    QUOTIENT:{    
    	Syntax:"${0}(pembilang${1} penyebut)",
        Disp:"Mengembalikan hasil bilangan yang dibagi oleh bilangan lain, dipotong menjadi integer."
    },
    RAND:{
    	Syntax:"${0}()",
    	Disp: "Mengembalikan bilangan acak antara 0 dan 1."
    },
    RANDBETWEEN:{    
    	Syntax:"${0}(bawah${1} atas)",
    	Disp: "Mengembalikan bilangan bulat acak antara bilangan yang Anda tentukan."
    },
    RANK:{    
    	Syntax:"${0}(bilangan${1} ref${1} [urutan])",
    	Disp: "Mengembalikan peringkat nilai dalam sampel.",
    	Arguments: {
          	 2 : [{
          		 label : "${0} - Urutkan menurun",
          		 result : 0
          	 }, {
          		 label : "${0} - Urutkan naik",
          		 result : 1
          	 }
          	 ]
           }
    },
    RECEIVED:{
    	Syntax:"${0}(penyelesaian${1} jatuh tempo${1} investasi${1} diskon${1} [basis])",
    	Disp:"Menghitung jumlah yang diterima pada jatuh tempo untuk sekuritas yang diinvestasikan seluruhnya."
    }, 
    REPLACE:{    
    	Syntax: "${0}(teks${1} posisi${1} panjang${1} teks baru)",
    	Disp:"Mengganti karakter dalam string teks dengan string teks yang berbeda."	
    },
    REPT:{    
    	Syntax: "${0}(teks${1} hitungan)",
    	Disp:"Mengulangi teks sebanyak bilangan yang diberikan."	
    },
    RIGHT:{
    	Syntax: "${0}(teks${1} [jumlah])",
    	Disp:"Mengembalikan karakter terakhir atau karakter teks."
    },
    RIGHTB:{
    	Syntax: "${0}(teks${1} [jumlah])",
    	Disp:"Mengembalikan karakter terakhir atau karakter teks."
    },
    ROUND:{   
    	Syntax: "${0}(bilangan${1} jumlah)",
    	Disp:"Membulatkan bilangan ke akurasi yang ditentukan sebelumnya."
    },
    ROUNDDOWN:{   
    	Syntax: "${0}(bilangan${1} jumlah)",
    	Disp:"Membulatkan bilangan ke bawah ke akurasi yang ditentukan sebelumnya."
    },
    ROUNDUP:{   
    	Syntax: "${0}(bilangan${1} jumlah)",
    	Disp:"Membulatkan bilangan ke atas ke akurasi yang ditentukan sebelumnya."
    },
    ROW:{   
    	Syntax:"${0}([referensi])",
    	Disp:"Menentukan bilangan baris internal dari referensi."
    },
    ROWS:{   
    	Syntax:"${0}(array)",
    	Disp:"Mengembalikan bilangan baris pada array atau referensi."
    },
    RADIANS:{   
    	Syntax:"${0}(sudut)",
    	Disp:"Mengubah derajat ke radian."
    },
    ROMAN:{   
    	Syntax:"${0}(bilangan${1} [bentuk])",
    	Disp:"Mengubah bilangan arab ke romawi, sebagai teks.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Klasik",
          		 result : 0
          	 }, {
          		 label : "${0} - Lebih singkat",
          		 result : 1
          	 }, {
          		 label : "${0} - Lebih singkat",
          		 result : 2
          	 }, {
          		 label : "${0} - Lebih singkat",
          		 result : 3
          	 }, {
          		 label : "${0} - Disederhanakan",
          		 result : 4
          	 }
          	 ]
           }
    },
    SEARCH:{   
    	Syntax:"${0}(teks yang ditemukan${1} teks${1} [posisi])",
    	Disp:"Mencari satu nilai teks dalam teks lainnya (tidak sensitif huruf besar)."
    },  
    SIGN:{    
    	Syntax:"${0}(bilangan)",
        Disp:"Mengembalikan tanda aljabar dari suatu bilangan."
    },
    SIN:{    
    	Syntax:"${0}(bilangan)",
    	Disp:"Mengembalikan sinus sudut yang ditentukan."
    },
    SINH:{    
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan sinus hiperbolik suatu bilangan."
    },
    SECOND:{    
    	Syntax:"${0}(angka)",
    	Disp:"Menentukan bilangan berurut untuk detik dalam menit (0-59) untuk nilai waktu."
    },
    SERIESSUM:{    
    	Syntax:"${0}(x${1} n${1} m${1} koefisien)",
        Disp:"Mengembalikan jumlah deret pangkat pada formula."
    },
    SHEET:{   
    	Syntax:"${0}([referensi])",
    	Disp:"Mengembalikan bilangan lembar internal dari referensi atau string."
    },
    SMALL:{   
    	Syntax:"${0}(array${1} posisi_nth)",
    	Disp:"Mengembalikan nilai terkecil dari set nilai."
    },
    SUBSTITUTE:{   
    	Syntax:"${0}(teks${1} lama${1} baru${1} [yang mana])",
    	Disp:"Mengembalikan teks di mana teks lama digantikan dengan teks baru."
    },
    SUBTOTAL:{   
    	Syntax:"${0}(fungsi${1} rentang${1} ...)",
    	Disp:"Menghitung subtotal dalam spreadsheet.",
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
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Mengembalikan jumlah semua argumen."
    },
    SUMPRODUCT:{   
    	Syntax:"${0}(array 1${1} [array 2]${1} ...)",
    	Disp:"Mengembalikan jumlah produk argumen array."
    },
    SUMIF:{   
    	Syntax:"${0}(rentang${1} kriteria${1} [jumlah rentang])",
    	Disp:"Menjumlahkan argumen yang memenuhi syarat."
    },
    SUMIFS:{
    	Syntax: "${0}(rentang_jumlah${1} rentang_kriteria1${1} kriteria1${1} ...)",
    	Disp:"Menjumlahkan argumen yang memenuhi syarat ganda."
    },
    SQRT:{   
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan akar kuadrat suatu bilangan."
    },
    SQRTPI:{   
    	Syntax:"${0}(angka)",
        Disp:"Mengembalikan akar kuadrat dari (bilangan * pi)."
    },
    STDEV:
    {
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Menghitung deviasi standar berdasarkan sampel."
    },
    STDEVP:
    {
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
    	Disp:"Menghitung deviasi standar berdasarkan keseluruhan populasi."
    },
    SUMSQ:{
    	Syntax:"${0}(nilai 1${1} [nilai 2]${1} ...)",
        Disp:"Mengembalikan jumlah kuadrat dari bilangan dalam daftar."
    },
    T:{
    	Syntax:"${0}(teks)",
    	Disp:"Mengonversi argumennya ke teks."
    },
    TAN:{    
    	Syntax:"${0}(angka)",
        Disp:"Mengembalikan tangen dari bilangan yang ditentukan."
    },
    TANH:{    
    	Syntax:"${0}(angka)",
        Disp:"Mengembalikan tangen hiperbolik dari bilangan yang ditentukan."
    },
    TBILLPRICE:{
    	Syntax:"${0}(penyelesaian${1} jatuh tempo${1} diskon)",
    	Disp:"Menghitung harga per $100 nilai nominal untuk surat Perbendaharaan."
    },
    TEXT:{
    	Syntax:"${0}(nilai${1} kodeformat)",
    	Disp:"Mengonversi nilai ke teks berdasarkan kaidah kode format bilangan dan mengembalikannya."
    },
    TIME:{   
    	Syntax:"${0}(jam${1} menit${1} detik)",
    	Disp:"Menentukan nilai waktu dari rincian jam, menit dan detik."
    },
    TIMEVALUE:{	
	    Syntax:"${0}(teks)",
	    Disp:"Mengembalikan jumlah internal untuk teks yang memiliki format waktu yang mungkin."
    }, 
    TODAY:{   
    	Syntax:"${0}()",
    	Disp:"Menentukan tanggal komputer saat ini."
    },    
    TRIM:{
    	Syntax:"${0}(teks)",
    	Disp:"Menghapus semua ruang utama dan yang mengikuti. Setiap rangkaian lain dari 2 atau lebih ruang dalam digantikan dengan satu ruang."
    },
    TRUE:{   
    	Syntax:"${0}()",
    	Disp:"Mengembalikan nilai logis TRUE."
    },
    TRUNC:{   
    	Syntax:"${0}(bilangan${1} [jumlah])",
    	Disp:"Mengurangi tempat desimal suatu bilangan."
    },
    TYPE:{   
    	Syntax:"${0}(nilai)",
    	Disp:"Menentukan jenis data dari suatu nilai."	
    },
    UPPER:{  
    	Syntax: "${0}(teks)",
    	Disp:"Mengonversi teks ke huruf besar."
    },
    VALUE:{    
    	Syntax: "${0}(teks)",
    	Disp:"Mengonversi argumen teks ke bilangan."
    },
    VAR:{    
    	Syntax: "${0}(nilai1${1} [nilai2]${1}...)",
    	Disp:"Memperkirakan variansi berdasarkan sampel."
    },
    VARA:{    
    	Syntax: "${0}(nilai1${1} [nilai2]${1}...)",
    	Disp:"Memperkirakan variansi berdasarkan sampel, termasuk bilangan, teks, dan nilai logis."
    },
    VARP:{    
    	Syntax: "${0}(nilai1${1} [nilai2]${1}...)",
    	Disp:"Menghitung variansi berdasarkan keseluruhan populasi."
    },
    VARPA:{    
    	Syntax: "${0}(nilai1${1} [nilai2]${1}...)",
    	Disp:"Menghitung variansi berdasarkan keseluruhan populasi, termasuk bilangan, teks, nilai logis."
    },
    VLOOKUP:{    
    	Syntax: "${0}(kriteria pencarian${1} array${1} indeks${1} [urutan])",
    	Disp:"Pencarian vertikal dan referensi ke sel yang ditunjuk.",
    	Arguments: {
          	 3 : [{
          		 label : "${0} - Hampir cocok",
          		 result : "TRUE"
          	 }, {
          		 label : "${0} - Sama dengan",
          		 result : "FALSE"
          	 }
          	 ]
           }
    },
    WEEKDAY:{    
    	Syntax:"${0}(bilangan${1} [tipe])",
    	Disp:"Mengembalikan hari dalam satu minggu untuk nilai tanggal sebagai suatu bilangan bulat.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Nomor 1 (Minggu) sampai 7 (Sabtu)",
          		 result : 1
          	 }, {
          		 label : "${0} - Nomor 1 (Senin) sampai 7 (Minggu)",
          		 result : 2
          	 }, {
          		 label : "${0} - Nomor 0 (Senin) sampai 6 (Minggu)",
          		 result : 3
          	 }
          	, {
         		 label : "${0} - Nomor 1 (Senin) sampai 7 (Minggu)",
         		 result : 11
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Selasa) sampai 7 (Senin)",
         		 result : 12
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Rabu) sampai 7 (Selasa)",
         		 result : 13
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Kamis) sampai 7 (Rabu)",
         		 result : 14
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Jumat) sampai 7 (Kamis)",
         		 result : 15
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Sabtu) sampai 7 (Jumat)",
         		 result : 16
         	 }
          	, {
         		 label : "${0} - Nomor 1 (Minggu) sampai 7 (Sabtu)",
         		 result : 17
         	 }
          	 ]
           }
    },
    WEEKNUM:{    
    	Syntax:"${0}(bilangan${1} [mode])",
    	Disp:"Menghitung minggu kalender yang berhubungan dengan tanggal yang ditentukan.",
    	Arguments: {
          	 1 : [{
          		 label : "${0} - Minggu",
          		 result : 1
          	 }, {
          		 label : "${0} - Senin",
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
    	Syntax:"${0}(tanggal mulai${1} hari${1} [hari libur])",
    	Disp:"Mengembalikan nomor seri tanggal sebelum atau setelah nomor yang ditentukan dari hari kerja."
    },
    XNPV:{   
    	Syntax:"${0}(tarif${1} nilai${1} tanggal)",
    	Disp:"Menghitung nilai kini bersih untuk jadwal arus kas."
    },
    YEAR:{    
    	Syntax:"${0}(angka)",
    	Disp:"Mengembalikan tahun nilai tanggal sebagai suatu bilangan bulat."
    }
}
})

