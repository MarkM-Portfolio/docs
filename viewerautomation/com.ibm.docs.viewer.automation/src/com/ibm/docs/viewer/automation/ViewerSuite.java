package com.ibm.docs.viewer.automation;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

import com.ibm.docs.viewer.automation.cases.ConversionTest;

@RunWith(Suite.class)
@SuiteClasses ({ConversionTest.class})
public class ViewerSuite {

}
