java.exe -cp utils/js.jar -jar utils/JSCover-all.jar -ws --port=8080 --document-root=../WebContent/js --only-instrument-reg=(?!.*(nls).*)writer/.* --report-dir=jscover-report
