#!/bin/bash

python run_jscover.py \(?!.*\(nls\).*\)writer/js/.* jscover-report /writer/test/ut/suite.json.html
