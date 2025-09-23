<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <application id="Application_ID" version="1.4" xmlns="http://java.sun.com/xml/ns/j2ee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/application_1_4.xsd">
			<display-name>IBMConversionSanity</display-name>
			<module id="Module_1349753226343">
				<web>
					<web-uri>com.ibm.docs.sanity.war</web-uri>
					<context-root>sanity</context-root>
				</web>
			</module>
		</application>
    </xsl:template>
</xsl:stylesheet>