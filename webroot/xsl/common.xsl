<?xml version="1.0" encoding="UTF-8"?>
<!-- Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
   
   <!-- 
   - This module contains common templates used in the contrail theme
   -->
   
    <!-- Processing of individual sandesh -->
    <!-- When you click on Send button then sandesh needs to be printed in below format -->
    <xsl:template name="output_sandesh_formatting">
        <div class="contrail-grid contrail-introspect-grid">
            <div class="grid-header">
                <div class="widget-header grid-widget-header">
                    <h4 class="grid-header-text smaller blue" data-action="collapse">
                        <xsl:value-of select="name()"/>
                    </h4>
                    <div class="widget-toolbar pull-right">
                        <a class="widget-toolbar-icon selected" data-action="wrap">Wrap</a>
                    </div>
                    <div class="widget-toolbar pull-right">
                        <a class="widget-toolbar-icon" data-action="no-wrap">NoWrap</a>
                    </div>
                </div>
            </div>
            <div class="grid-body ui-widget">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <xsl:apply-templates select="attribute::type[.='sandesh']"/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </xsl:template>
    
    <!-- Handling of slist -->
    <xsl:template name="output_slist_formatting">
        <div class="contrail-grid contrail-introspect-grid">
            <div class="grid-header">
                <div class="widget-header grid-widget-header">
                    <h4 class="grid-header-text smaller blue" data-action="collapse">
                        <xsl:value-of select="name()"/>
                    </h4>
                    <div class="widget-toolbar pull-right">
                        <a class="widget-toolbar-icon selected" data-action="wrap">Wrap</a>
                    </div>
                    <div class="widget-toolbar pull-right">
                        <a class="widget-toolbar-icon" data-action="no-wrap">NoWrap</a>
                    </div>
                </div>
            </div>
            <div class="grid-body ui-widget">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <xsl:apply-templates select="attribute::type[.='slist']"/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </xsl:template>
    
    <xsl:template name="output_no_data_found">
        <table class="table_1">
            <tbody>
                <tr>
                    <td>
                        <div align="center" class="introspect_no_data_found">
                            <b>
                                <xsl:value-of select="$no-data-found-text"/>
                            </b>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>			
    </xsl:template>
</xsl:stylesheet>
