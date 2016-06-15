<?xml version="1.0" encoding="UTF-8"?>
<!-- Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <!-- This module is designed for supplying static text in the XSLT -->
    <xsl:param name="text-to-expand" select="'Click here to expand'"/><xsl:param name="no-data-found-text" select="'No data found!'"/>

    <!-- Header static content -->

    <xsl:param name="collapse-text" select="'Collapse'"/>
    <xsl:param name="expand-text" select="'Expand'"/>
    <xsl:param name="wrap-text" select="'Wrap'"/>
    <xsl:param name="no-wrap-text" select="'NoWrap'"/>
</xsl:stylesheet>
