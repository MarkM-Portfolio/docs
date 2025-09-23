#!/bin/bash

python run_jscover.py \(?!.*\(nls\).*\)wseditor/js/.* jscover-report /wseditor/test/ut/suite.json.html
