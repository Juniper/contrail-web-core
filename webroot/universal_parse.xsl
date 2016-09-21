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
        <html>
            <head>
                <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
                <link href="common/ui/css/style.css" rel="stylesheet" type="text/css"/>

                <script type="text/javascript">
			    	<![CDATA[
			    		function getProxyURL(){
							var params =  (decodeURIComponent(document.URL)).split('?')[1].split('&');
							//alert('params='+params);
			   				var currProxyURL,proxyURL;
			   				for(var i = 0; i < params.length ; i++){
			   				//alert(params[i]);
			   					if(params[i].search('proxyURL') != -1){
			   						currProxyURL = params[i].split('=')[1];
			   					}
			   				} 
			   				//alert('currProxyURL='+currProxyURL);
			   				var parts = currProxyURL.split('//');
			   				var type = parts[0];
			   				var hostPort = parts[1].split('/')[0];
			   				proxyURL = type + '//' + hostPort;
			   				return proxyURL;
						};
						
			   			function setURL(req){
			   				var proxyURL = getProxyURL();
							document.getElementById('proxyURL_' + req).value=proxyURL + '/Snh_' + req  ;
							//alert(document.getElementById('proxyURL_' + req).value);
							return true;
						};
						
						function onLinkClick(params){
							//alert(params);
							var proxyURL = getProxyURL();
							//alert('proxyURL ='+proxyURL);
							window.location.href = '/proxy?proxyURL=' + proxyURL + '/' + params;
						};
						]]>
					
	   			</script>
                <title>HTTP Introspect</title>
            </head>
            <body>
                <nav class="navbar navbar-inverse navbar-fixed-top">
                    <div class="container-fluid">
                        <div class="navbar-header">
                            <a class="navbar-brand" href="#">Contrail</a>
                        </div>
                        <div id="navbar" class="collapse navbar-collapse pull-right">
                            <ul class="nav navbar-nav">
                                <li>
                                    <a href="javascript:collapseAll();">Collapse</a>
                                </li>
                                <li>
                                    <a href="javascript:expandAll();">Expand</a>
                                </li>
                                <li>
                                    <a href="javascript:wrap();">Wrap</a>
                                </li>
                                <li>
                                    <a href="javascript:noWrap();">NoWrap</a>
                                </li>
                            </ul>
                        </div><!--/.nav-collapse -->
                    </div>
                </nav>
                <div class="page-content container-fluid">
                        <xsl:choose>
                            <xsl:when test="$snhreq = 'rlist'">
                                <div class="row">
                                    <h3 class="col-xs-12 center">
                                        <xsl:for-each select="*">
                                            <span class="first-cap offset6 center">
                                                <xsl:value-of select="name()"/> Introspect
                                            </span>
                                        </xsl:for-each>
                                    </h3>
                                </div>
                                <div class="row">
                                    <div class="col-xs-3">
                                        <ul class="nav nav-list sidenav col-xs-12">
                                            <xsl:for-each select="*">
                                                <xsl:for-each select="*">
                                                    <xsl:variable name="reqname" select="name()"/>
                                                    <li>
                                                        <a href="#Snh_{$reqname}" title="{$reqname}">
                                                            <xsl:value-of select="$reqname"/>
                                                        </a>
                                                    </li>
                                                </xsl:for-each>
                                            </xsl:for-each>
                                        </ul>
                                    </div>
                                    <div class="col-xs-9">
                                        <xsl:variable name="reqname" select="name()"/>
                                        <section id="Snh_{$reqname}">
                                            <xsl:for-each select="*">
                                                <xsl:choose>
                                                    <xsl:when test="attribute::type[.='rlist']">
                                                        <xsl:apply-templates select="attribute::type[.='rlist']"/>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                        </section>
                                    </div>
                                </div>
                            </xsl:when>
                        </xsl:choose>

                        <xsl:for-each select="*">
                            <xsl:choose>
                                <xsl:when test="attribute::type[.='sandesh']">
                                    <h4>
                                        <xsl:value-of select="name()"/>
                                    </h4>
                                    <table class="table table-bordered table-condensed" border="1">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <xsl:apply-templates select="attribute::type[.='sandesh']"/>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </xsl:when>
                                <xsl:when test="attribute::type[.='rlist']">

                                </xsl:when>
                                <xsl:otherwise>
                                    <table class="table table-bordered table-condensed" border="1">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <xsl:apply-templates select="attribute::type[.='slist']"/>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:for-each>

                </div>

                <script src="/assets/jquery/js/jquery.min.js"></script>
                <script src="/assets/bootstrap/js/bootstrap.js"></script>
                <script src="/assets/jquery/js/jquery.dataTables.min.js"></script>
                <script src="js/introspect-util.js"></script>

            </body>
        </html>
    </xsl:template>


    <xsl:template match="@type[.='rlist']">
        <xsl:for-each select="../*">
            <xsl:choose>
                <xsl:when test="@type = 'sandesh'">
                    <xsl:variable name="reqx" select="name(.)"/>
                    <div id="Snh_{$reqx}" style="padding-top: 50px;">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <xsl:value-of select="name()"/>
                            </div>
                            <div class="panel-body">
                                <form class="form-vertical" action="proxy" method="get">
                                    <xsl:apply-templates select="@type[.='sandesh']"/>
                                    <input id="proxyURL_{$reqx}" type="hidden" value="" name="proxyURL"></input>
                                    <button type="submit" class="btn btn-sm btn-primary" onclick="setURL('{$reqx}');">Send</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </xsl:when>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>
    

    <xsl:template match="@type[.='slist']">
        <table class="table table-bordered table-condensed" border="1">
            <xsl:for-each select="../*">
                <xsl:choose>
                    <xsl:when test="@type = 'sandesh'">
                        <tr>
                            <td>
                                <h4>
                                    <xsl:value-of select="name()"/>
                                </h4>
                            </td>
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
        <xsl:choose>
            <xsl:when test="$snhreq = 'rlist'">
                <xsl:variable name="vary" select="name(..)"/>
                <tr>
                    <td style="color:blue">
                        <input type="text" class="col-xs-3" name="{$vary}"/>
                    </td>
                </tr>
            </xsl:when>
            <xsl:otherwise>
                <tr>
                    <td> 
                        <pre>
                            <xsl:value-of select="."/>
                        </pre>
                    </td>
                </tr>
            </xsl:otherwise>
        </xsl:choose>
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
                <thead>
                    <xsl:for-each select="../*[position() =1]">
                        <tr>
                            <xsl:for-each select="*">
                                <th>
                                    <xsl:value-of select="name()"/>
                                    <xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>)
                                    </xsl:if>
                                </th>
                            </xsl:for-each>
                        </tr>
                    </xsl:for-each>
                </thead>
                <tbody>
                    <xsl:for-each select="../*">
                        <tr>
                            <xsl:for-each select="*">

                                <xsl:choose>
                                    <xsl:when test="@type[.='struct'] | @type[.='list']">
                                        <xsl:choose>
                                            <xsl:when test="$snhreq = 'rlist'">
                                                <td>
                                                    <table class="table table-bordered table-condensed" border="1">
                                                        <xsl:apply-templates select="@type"/>
                                                    </table>
                                                </td>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <xsl:variable name="accordionID" select="generate-id(.)"/>
                                                <xsl:variable name="tbname" select="name()"/>
                                                <xsl:variable name="count" select="position()"/>
                                                <xsl:variable name="num">
                                                    <xsl:number/>
                                                </xsl:variable>
                                                <td>
                                                    <div class="accordion" id="accordion-parent">
                                                        <div class="accordion-heading">
                                                            <a class="accordion-toggle" data-toggle="collapse" href="#{$accordionID}-{$tbname}-{$count}">
                                                                <xsl:value-of select="name()"/>
                                                            </a>
                                                        </div>
                                                        <div id="{$accordionID}-{$tbname}-{$count}" class="accordion-body collapse in">
                                                            <div class="accordion-inner">
                                                                <table class="table table-bordered table-condensed" border="1">
                                                                    <!--KKK-->
                                                                    <xsl:apply-templates select="@type"/>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </xsl:otherwise>
                                        </xsl:choose>

                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:apply-templates select="@type"/>
                                    </xsl:otherwise>
                                </xsl:choose>

                            </xsl:for-each>
                        </tr>
                    </xsl:for-each>
                </tbody>

            </xsl:when>
            <xsl:otherwise>

                <tbody>
                    <xsl:for-each select="../*">
                        <xsl:for-each select="*">
                            <tr>
                                <td>
                                    <xsl:value-of select="name()"/>
                                    <xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>)
                                    </xsl:if>
                                </td>
                                <xsl:choose>
                                    <xsl:when test="@type[.='struct'] | @type[.='list']">
                                        <xsl:choose>
                                            <xsl:when test="$snhreq = 'rlist'">
                                                <td>
                                                    <table class="table table-bordered table-condensed" border="1">
                                                        <xsl:apply-templates select="@type"/>
                                                    </table>
                                                </td>
                                            </xsl:when>
                                            <xsl:otherwise>
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
                                                        <table id="{generate-id()}-{$tbname}-{$count}" class="table table-bordered table-condensed" border="1">
                                                            <xsl:apply-templates select="@type"/>
                                                        </table>
                                                    </div>
                                                </td>
                                            </xsl:otherwise>
                                        </xsl:choose>

                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:apply-templates select="@type"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </tr>
                        </xsl:for-each>
                    </xsl:for-each>
                </tbody>

            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <xsl:template match="@type[.='sandesh']">

        <xsl:choose>
            <!--xsl:when test="(../../@type = 'slist') or (../../@type = 'rlist')"-->
            <xsl:when test="(../../@type = 'slist')">
                <table class="table table-bordered table-condensed" border="1">
                    <thead>
                        <tr>
                            <xsl:for-each select="../*">
                                <th>
                                    <xsl:value-of select="name()"/>
                                </th>
                            </xsl:for-each>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <xsl:for-each select="../*">

                                <xsl:choose>
                                    <xsl:when test="@type[.='struct'] | @type[.='list']">
                                        <td>
                                            <table class="table table-bordered table-condensed" border="1">
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
                    </tbody>
                </table>
            </xsl:when>
            <xsl:otherwise>
                <xsl:for-each select="../*">
                    <xsl:choose>
                        <xsl:when test="@type[.='struct'] | @type[.='list']">
                            <h4>
                                <xsl:value-of select="name()"/>
                                <xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>)
                                </xsl:if>
                            </h4>
                            <table class="table table-bordered table-condensed" border="1">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table border="1" class="table table-bordered table-condensed">
                                                <!--div data-collapse="accordion persist"-->
                                                <!--h4><xsl:value-of select="name()"/></h4--><!--OOO-->
                                                <xsl:apply-templates select="@type[.='struct']"/>
                                                <xsl:apply-templates select="@type[.='list']"/>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:if test="$snhreq = 'rlist'">
                                <div class="form-group">
                                    <xsl:variable name="varx" select="name(..)"/>
                                    <label for="{$varx}">
                                        <xsl:value-of select="$varx"/> (<xsl:value-of select="@type"/>)
                                    </label>
                                <xsl:apply-templates select="@type"/>
                                </div>
                            </xsl:if>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <xsl:template match="@type">
        <xsl:choose>
            <xsl:when test="../@link">
                <xsl:variable name="linkx" select="../@link"/>
                <xsl:variable name="valuex" select=".."/>
                <xsl:variable name="link_title" select="../@link_title"/>
                <td style="color:blue">
                    <pre>
                        <xsl:choose>
                            <xsl:when test="$valuex != ''">
                                <a href="#" onclick="onLinkClick('Snh_{$linkx}?x={$valuex}');">
                                    <xsl:choose>
                                        <xsl:when test="$link_title != ''">
                                            <xsl:value-of select="$link_title" />
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select=".." />
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </a>
                            </xsl:when>
                        </xsl:choose>
                    </pre>
                </td>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="$snhreq = 'rlist'">
                        <xsl:variable name="varx" select="name(..)"/>
                        <input type="text" class="form-control" name="{$varx}"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="fieldValue" select=".."/>
                        <xsl:variable name="fieldName" select="name(..)"/>
                        <xsl:variable name="fieldLength" select="string-length($fieldValue)"/>
                        <td>
                            <xsl:choose>
                                <xsl:when test="$fieldLength = 0">
                                    -
                                </xsl:when>
                                <xsl:when test="$fieldLength > 300">
                                    <xsl:variable name="accordionID" select="generate-id(.)"/>
                                    <xsl:variable name="tbname" select="name()"/>
                                    <xsl:variable name="count" select="position()"/>
                                    <div class="accordion" id="accordion-parent">
                                        <div class="accordion-heading">
                                            <a class="accordion-toggle" data-toggle="collapse" href="#{$accordionID}-{$tbname}-{$count}">
                                                <xsl:value-of select="$fieldName"/>
                                            </a>
                                        </div>
                                        <div id="{$accordionID}-{$tbname}-{$count}" class="accordion-body collapse in">
                                            <div class="accordion-inner">
                                                <pre>
                                                    <xsl:copy-of select="$fieldValue" />
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </xsl:when>
                                <xsl:otherwise>
                                    <pre>
                                        <xsl:copy-of select="$fieldValue" />
                                    </pre>
                                </xsl:otherwise>
                            </xsl:choose>
                        </td>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
