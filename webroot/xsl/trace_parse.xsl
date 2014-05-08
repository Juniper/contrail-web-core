<!--
 Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" doctype-public="-//W3C//DTD HTML 4.0 Transitional//EN"/>
    <xsl:variable name="snhreq" select="/child::node()/@type"/>

    <xsl:template match="*">
    </xsl:template>

    <xsl:template match="text()">
    </xsl:template>
    <xsl:template match="@*">
    </xsl:template>

    <xsl:template match="/">

        <table class="sandesh">
            <xsl:for-each select="*">
                <xsl:choose>
                    <xsl:when test="attribute::type[.='sandesh']">
                        <tr>
                            <td>
                                <xsl:apply-templates select="attribute::type[.='sandesh']"/>
                            </td>
                        </tr>
                    </xsl:when>
                    <xsl:otherwise>
                        <tr>
                            <td>
                                <xsl:apply-templates select="attribute::type[.='slist']"/>
                            </td>
                        </tr>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
        </table>
    </xsl:template>

    <xsl:template match="@type[.='slist']">
        <table class="sandesh">
            <xsl:for-each select="../*">
                <xsl:choose>
                    <xsl:when test="@type = 'sandesh'">
                        <tr>
                            <th align="left">

                                <xsl:value-of select="name()"/>

                            </th>
                        </tr>
                        <tr>
                            <td>
                                <xsl:apply-templates select="@type[.='sandesh']"/>
                            </td>
                        </tr>
                    </xsl:when>
                </xsl:choose>
            </xsl:for-each>
        </table>
    </xsl:template>


    <xsl:template match="element">

        <tr>
            <td style="color:blue">
                <xsl:value-of select="."/>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="@type[.='list']">
        <xsl:for-each select="../*">
            <xsl:choose>
                <xsl:when test="@type = 'struct'">
                    <xsl:apply-templates select="@type[.='struct']"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select="element"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>


    <xsl:template match="@type[.='struct']">
        <xsl:choose>
            <xsl:when test="name(..) = 'list'">
                <xsl:for-each select="../*[position() =1]">
                    <tr>
                        <xsl:for-each select="*">
                            <th align="left">
                                <xsl:value-of select="name()"/>
                            </th>
                        </xsl:for-each>
                    </tr>
                </xsl:for-each>
                <xsl:for-each select="../*">
                    <tr>
                        <xsl:for-each select="*">

                            <xsl:choose>
                                <xsl:when test="@type[.='struct'] | @type[.='list']">

                                    <xsl:variable name="tbname" select="name()"/>
                                    <xsl:variable name="count" select="position()"/>
                                    <xsl:variable name="num">
                                        <xsl:number/>
                                    </xsl:variable>
                                    <td>
                                        <div data-collapse="accordion persist">
                                            <h5>
                                                <xsl:value-of select="name()"/>
                                            </h5>
                                            <table class="sandesh" id="{generate-id()}-{$tbname}-{$count}">
                                                <!--KKK-->
                                                <xsl:apply-templates select="@type"/>
                                            </table>
                                        </div>
                                    </td>

                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:apply-templates select="@type"/>
                                </xsl:otherwise>
                            </xsl:choose>

                        </xsl:for-each>
                    </tr>
                </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
                <xsl:for-each select="../*">
                    <xsl:for-each select="*">
                        <tr>
                            <td width="15%">
                                <xsl:value-of select="name()"/>
                            </td>
                            <xsl:choose>
                                <xsl:when test="@type[.='struct'] | @type[.='list']">


                                    <xsl:variable name="tbname" select="name()"/>
                                    <xsl:variable name="count" select="position()"/>
                                    <xsl:variable name="num">
                                        <xsl:number/>
                                    </xsl:variable>
                                    <td>
                                        <div data-collapse="accordion persist">
                                            <table id="{generate-id()}-{$tbname}-{$count}" class="sandesh">
                                                <xsl:apply-templates select="@type"/>
                                            </table>
                                        </div>
                                    </td>

                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:apply-templates select="@type"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </tr>
                    </xsl:for-each>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <xsl:template match="@type[.='sandesh']">
        <table class="sandesh">
            <xsl:choose>
                <xsl:when test="(../../@type = 'slist')">
                    <tr>
                        <xsl:for-each select="../*">
                            <th align="left">
                                <xsl:value-of select="name()"/>
                            </th>
                        </xsl:for-each>
                    </tr>
                    <tr>
                        <xsl:for-each select="../*">

                            <xsl:choose>
                                <xsl:when test="@type[.='struct'] | @type[.='list']">
                                    <td>
                                        <table class="sandesh">
                                            <!--NNN-->
                                            <xsl:apply-templates select="@type[.='struct'] | @type[.='list']"/>
                                        </table>
                                    </td>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:apply-templates select="@type"/>
                                </xsl:otherwise>
                            </xsl:choose>

                        </xsl:for-each>
                    </tr>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:for-each select="../*">
                        <xsl:choose>
                            <xsl:when test="@type[.='struct'] | @type[.='list']">

                                <tr>
                                    <td>
                                        <!--div data-collapse="accordion persist"-->
                                        <div>
                                            <!--h4><xsl:value-of select="name()"/></h4--><!--OOO-->
                                            <table class="sandesh">
                                                <xsl:apply-templates select="@type[.='struct']"/>
                                                <xsl:apply-templates select="@type[.='list']"/>
                                            </table>
                                        </div>
                                    </td>
                                </tr>

                            </xsl:when>
                            <xsl:otherwise>
                                <tr>
                                    <td width="15%">
                                        <xsl:value-of select="name()"/>
                                    </td>
                                    <xsl:apply-templates select="@type"/>
                                </tr>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </xsl:otherwise>
            </xsl:choose>
        </table>
    </xsl:template>


    <xsl:template match="@type">
        <xsl:choose>
            <xsl:when test="../@link">
                <xsl:variable name="linkx" select="../@link"/>
                <xsl:variable name="valuex" select=".."/>
                <td style="color:blue">
                    <a href="Snh_{$linkx}?x={$valuex}">
                        <xsl:value-of select=".."/>
                    </a>
                </td>
            </xsl:when>
            <xsl:otherwise>

                <td style="color:blue">
                    <xsl:value-of select=".."/>
                </td>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
