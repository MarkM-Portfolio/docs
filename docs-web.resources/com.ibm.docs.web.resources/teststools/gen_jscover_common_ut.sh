#!/bin/bash

python run_jscover.py \(?!.*\(nls\).*\)concord/.* jscover-report /concord/tests/common/ut/suite.json.html
