<!-- Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.  -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:import href="params.xsl"/>
	<xsl:import href="common.xsl"/>

	<!--set the doc type publice tp -//W3C//DTD HTML 4.0 Transitional//EN.-->
	<xsl:output method="html" indent="yes" doctype-public="-//W3C//DTD HTML 4.0 Transitional//EN"/>
	
	<xsl:variable name="snhreq" select="/child::node()/@type"/>
	
	<xsl:template match="*"/>
	<xsl:template match="text()"/>
	<xsl:template match="@*"/>
	
	<xsl:template match="/">
		<div>
			<xsl:choose>
				<xsl:when test="$snhreq = 'rlist'">
					<xsl:call-template name="output-header"/>
					<xsl:call-template name="main-container"/>
				</xsl:when>
			</xsl:choose>
			<!-- Processing of individual sandesh -->
			<xsl:for-each select="*">
				<xsl:choose>
					<xsl:when test="attribute::type[.='sandesh']">
						<xsl:call-template name="output_sandesh_formatting"/>
					</xsl:when>
					<!-- Suppress rlist as it has been handled already and using to create first page. i.e ToC page -->
					<xsl:when test="attribute::type[.='rlist']"/>
					<!-- Handling of slist -->
					<xsl:otherwise>
						<xsl:call-template name="output_slist_formatting"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>
		</div>
	</xsl:template>

	<xsl:template match="@type[.='slist']">
		<table>
			<xsl:for-each select="../*">
				<xsl:choose>
					<xsl:when test="@type = 'sandesh'">
						<tr>
							<td>
								<div class="widget-header grid-widget-header">
									<h4 class="grid-header-text smaller blue" data-action="collapse">
										<xsl:value-of select="name()"/>
									</h4>
								</div>
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
						<input type="text" class="span3" name="{$vary}"/>
					</td>
				</tr>
			</xsl:when>
			<xsl:otherwise>
				<tr>
					<td>
						<xsl:value-of select="."/>
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
									<xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>) </xsl:if>
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
													<table class="{concat('table_', count(./ancestor-or-self::*[@type[.='struct'] | @type[.='list']]))}">
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
                                                    <div class="td-cell">
                                                        <table class="{concat('table_', count(./ancestor-or-self::*[@type[.='struct'] | @type[.='list']]))}">
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
									<xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>) </xsl:if>
								</td>
								<xsl:choose>
									<xsl:when test="@type[.='struct'] | @type[.='list']">
										<xsl:choose>
											<xsl:when test="$snhreq = 'rlist'">
												<td>
													<table class="{concat('table_', count(./ancestor-or-self::*[@type[.='struct'] | @type[.='list']]))}">
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
														<div class="widget-header grid-widget-header">
															<h5 class="grid-header-text smaller blue" data-action="collapse">
																	<xsl:value-of select="name()"/>
															</h5>
														</div>
														<table id="{generate-id()}-{$tbname}-{$count}">
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
				<table>
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
											<table class="{concat('table_', count(./ancestor-or-self::*[@type[.='struct'] | @type[.='list']]))}">
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
				<xsl:choose>
					<xsl:when test="../*">
						<xsl:for-each select="../*">
							<xsl:choose>
								<xsl:when test="@type[.='struct'] | @type[.='list']">
									<div class="widget-header grid-widget-header">
										<h4 class="grid-header-text smaller blue" data-action="collapse">
											<xsl:value-of select="name()"/>
											<xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>) </xsl:if>
										</h4>
									</div>
									<table>
										<tbody>
											<tr>
												<td>
													<table class="{concat('table_', count(./ancestor-or-self::*[@type[.='struct'] | @type[.='list']]))}">
														<xsl:apply-templates select="@type[.='struct']"/>
														<xsl:apply-templates select="@type[.='list']"/>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="local-name(.) = 'more'"/>
										<xsl:otherwise>
											<tr>
												<td>
													<xsl:value-of select="name()"/>
													<xsl:if test="$snhreq = 'rlist'">(<xsl:value-of select="@type"/>) </xsl:if>
												</td>
												<xsl:apply-templates select="@type"/>
											</tr>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:call-template name="output_no_data_found"/>
					</xsl:otherwise>
				</xsl:choose>
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
					<xsl:choose>
						<xsl:when test="$valuex != ''">
							<div class="td-cell">
								<a href="#" class="inline-link" data-link="{$linkx}" x="{$valuex}" >
									<xsl:choose>
										<xsl:when test="$link_title != ''">
											<xsl:value-of select="$link_title"/>
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select=".."/>
										</xsl:otherwise>
									</xsl:choose>
								</a>
							</div>
						</xsl:when>
					</xsl:choose>
				</td>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="$snhreq = 'rlist'">
						<xsl:variable name="varx" select="name(..)"/>
						<input type="text" class="span3" name="{$varx}"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:variable name="fieldValue" select=".."/>
						<xsl:variable name="fieldName" select="name(..)"/>
						<xsl:variable name="fieldLength" select="string-length($fieldValue)"/>
						<td>
							<xsl:choose>
								<xsl:when test="$fieldLength = 0"> - </xsl:when>
								<xsl:when test="$fieldLength > 300">
									<xsl:variable name="accordionID" select="generate-id(.)"/>
									<xsl:variable name="tbname" select="name()"/>
									<xsl:variable name="count" select="position()"/>
									<div class="td-cell">
                                        <xsl:copy-of select="$fieldValue"/>
                                    </div>
								</xsl:when>
								<xsl:otherwise>
									<div class="td-cell"><xsl:copy-of select="$fieldValue"/></div>
								</xsl:otherwise>
							</xsl:choose>
						</td>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
