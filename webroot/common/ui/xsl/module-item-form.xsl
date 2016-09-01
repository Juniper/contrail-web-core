<?xml version="1.0" encoding="UTF-8"?>
<!-- Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <xsl:for-each select="*/*">
            <xsl:variable name="reqname" select="name(.)"/>
            <xsl:variable name="hide">
                <xsl:choose>
                    <xsl:when test="position() != 1">
                        <xsl:text>hide</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>show</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <div id="section-{$reqname}" class="section-content {$hide}">
                <div class="row-fluid margin-0-0-5">
                    <div class="widget-box transparent">
                        <div class="widget-header">
                            <p class="smaller" data-action="widget-collapse">
                                <xsl:value-of select="$reqname"/>
                            </p>
                        </div>
                        <div class="widget-body">
                            <div class="widget-main padding-4">
                                <div class="section-content">
                                    <form id="form-{$reqname}">
                                        <xsl:choose>
                                            <xsl:when test="attribute::type[.='sandesh']">
                                                <xsl:apply-templates select="@type[.='sandesh']" mode="rlist"/>
                                            </xsl:when>
                                        </xsl:choose>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="@type[.='sandesh']" mode="rlist">
        <xsl:variable name="reqx" select="name(..)"/>
        <xsl:for-each select="../*">
            <xsl:call-template name="rlist-sandesh"/>
        </xsl:for-each>
        <div class="row-fluid margin-0-0-5 control-group">
            <div class="display-inline-block margin-0-10-0-0 controls">
                <button type="button" class="sandesh-button btn btn-small btn-primary" data-xmlname="{$reqx}"> Submit
                </button>
            </div>
        </div>
    </xsl:template>

    <xsl:template name="rlist-sandesh">
        <div class="row-fluid margin-0-0-5">
            <div class="span6">
                <div class="row-fluid form-label">
                    <label><xsl:value-of select="name()"/> (<xsl:value-of select="@type"/>)</label>
                </div>
                <div class="row-fluid form-element">
                    <xsl:variable name="varx" select="name(.)"/>
                    <input name="{$varx}" class="span12" placeholder="Enter value"/>
                    <span class="help-block red" data-bind="visible: errors().select_error, text: errors().select_error" style="display: none;">false</span>
                </div>
            </div>
        </div>
    </xsl:template>
</xsl:stylesheet>
