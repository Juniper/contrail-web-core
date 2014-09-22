/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

joint = $.extend(true, joint, {shapes: {contrail: {}}, layout: {contrail: {}}});

var IMAGE_MAP = {
    'virtual-network': 'vpn',
    'network-policy': 'policy',
    'service-instance-l2': 'l2',
    'service-instance-analyzer': 'analyzer',
    'service-instance-firewall': 'firewall',
    'service-instance-nat': 'nat',
    'service-instance-lb': 'lb',
    'service-instance': 'nat',
    'security-group': 'sg',
    'floating-ip': 'fip',
    'network-ipam': 'ipam',
    'router': 'router',
    'virtual-machine': 'vm'
};

var contextMenuConfig =  {
	VirtualNetwork: function(element, jointConfig){
		var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
			jointElementFullName = viewElement.attributes.nodeDetails['name'].split(':'),
			items = {
				configure: {
					name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Virtual Network</span>',
					callback: function(key, options) {
						setCookie('domain',jointElementFullName[0]);
						setCookie('project',jointElementFullName[1]);
						loadFeature({p:'config_net_vn'});
	                }
				}
			};
		
		if(!$(element).hasClassSVG('ZoomedElement')){
			items.view = {
				name: '<i class="icon-external-link"></i><span class="margin-0-5">View Virtual Network</span>',
				callback: function(key, options) {
                    loadFeature({p:'mon_net_networks',q:{fqName:viewElement['attributes']['nodeDetails']['name']}});
                }
			};
		}
		
		return {items: items};
	},
	NetworkPolicy: function(element, jointConfig){
		return {
			items: {
				configure: {
					name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network Policy</span>',
					callback: function(key, options) {
						loadFeature({p:'config_net_policies'});
	                }
				}
			}
		};
	},
	NetworkIPAM: function(element, jointConfig){
		return {
			items: {
				configure: {
					name: '<i class="icon-cog"></i><span class="margin-0-5">Configure Network IPAM</span>',
					callback: function(key, options) {
						loadFeature({p:'config_net_ipam'});
	                }
				}
			}
		};
	},
	link: function(element, jointConfig){
		var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
			viewElementDetails = viewElement.attributes.linkDetails,
			sourceName = viewElementDetails['src'].split(':')[2],
			targetName = viewElementDetails['dst'].split(':')[2];
		
		var viewListMenu = {
			items: {
				trafficFromSource2Target: {
					name: '<i class="icon-long-arrow-right"></i><span class="margin-0-5">View Traffic from ' + sourceName + ' to ' + targetName + '</span>',
					callback: function(key, options) {
						loadFeature({p:'mon_net_networks',q:{fqName:viewElementDetails['dst'],srcVN: viewElementDetails['src']}});
			        }
				}
			}
		};
		
		if(viewElementDetails.dir == 'bi'){
			viewListMenu.items.trafficFromTarget2Source = {
				name: '<i class="icon-long-arrow-left"></i><span class="margin-0-5">View Traffic from ' + targetName + ' to ' + sourceName + '</span>',
				callback: function(key, options) {
					loadFeature({p:'mon_net_networks',q:{fqName:viewElementDetails['src'],srcVN: viewElementDetails['dst']}});
				}
			};
		}
		
		return viewListMenu;
	}
};

var tooltipConfig = {
		VirtualNetwork: {
			title: function(element, jointConfig){
				return 'Virtual Network';
				return ;
			},
			content: function(element, jointConfig){
				var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
					tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
				
				return tooltipContent([{lbl:'Name', value: viewElement.attributes.nodeDetails['name']},
				                       {lbl:'in', value: viewElement.attributes.nodeDetails.more_attr.in_tpkts + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.in_bytes)},
				                       {lbl:'out', value: viewElement.attributes.nodeDetails.more_attr.out_tpkts + ' packets / ' + formatBytes(viewElement.attributes.nodeDetails.more_attr.out_bytes)},
				                       {lbl:'Instances', value: viewElement.attributes.nodeDetails.more_attr.vm_cnt}]);
				
			}
		},
		NetworkPolicy: {
			title: function(element, jointConfig){
				return 'Network Policy';
			},
			content: function(element, jointConfig){
				var viewElement = jointConfig.configGraph.getCell(element.attr('model-id')),
					tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
				
				return tooltipContent([{lbl:'Name', value: viewElement.attributes.nodeDetails['fq_name']}]);
			}
		},
		SecurityGroup: {
			title: function(element, jointConfig){
				return 'Security Group';
			},
			content: function(element, jointConfig){
				var viewElement = jointConfig.configGraph.getCell(element.attr('model-id')),
				tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
			
				return tooltipContent([{lbl:'Name', value: viewElement.attributes.nodeDetails['fq_name']}]);
			}
		},
		NetworkIPAM: {
			title: function(element, jointConfig){
				return 'Network IPAM';
			},
			content: function(element, jointConfig){
				var viewElement = jointConfig.configGraph.getCell(element.attr('model-id')),
				tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
			
				return tooltipContent([{lbl:'Name', value: viewElement.attributes.nodeDetails['fq_name']}]);
			}
		},
		link: {
			title: function(element, jointConfig){
				return 'Traffic Details';
			},
			content: function(element, jointConfig){
				var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
					tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
					viewElementDetails = viewElement.attributes.linkDetails;
				
				var data = [],
					partial_msg = "";
			    if(viewElementDetails.error == 'Other link marked as unidirectional, attach policy' || viewElementDetails.error == "Other link marked as bidirectional, attach policy")
			        partial_msg = "Link partially connected";
			    if(viewElementDetails.more_attributes!=undefined && viewElementDetails.more_attributes.in_stats!=undefined
			            && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.out_stats.length > 0
			            && viewElementDetails.more_attributes.in_stats.length > 0){
			    var in_stats = viewElementDetails.more_attributes.in_stats;
			    var out_stats = viewElementDetails.more_attributes.out_stats;
			    var src = viewElementDetails.src;
			    var dst = viewElementDetails.dst;
			    var loss = viewElementDetails.loss;
			    /*if(loss.diff && loss.loss_percent>0) commented the percentage loss code for while 
			        data.push({lbl:"Link",value:"Packet Loss % "+loss.loss_percent});
			    else*/
			    if(partial_msg != "")
			        data.push({lbl:"",value:partial_msg});
			    for(var i=0;i<in_stats.length;i++) {
			        if(src==in_stats[i].src && dst==in_stats[i].dst){
			           data.push({lbl:"Link",value:in_stats[i].src.split(':').pop()+" --- "+in_stats[i].dst.split(':').pop()});
			           data.push({lbl:"In",value:in_stats[i].pkts+" pkts / "+formatBytes(in_stats[i].bytes)});
			              for(var j=0;j<out_stats.length;j++){
			                  if(src==out_stats[j].src && dst==out_stats[j].dst){
			                     data.push({lbl:"Out",value:out_stats[j].pkts+" pkts / "+formatBytes(out_stats[i].bytes)});
			                  }
			              }
			        }else if(src==in_stats[i].dst && dst==in_stats[i].src){
			            data.push({lbl:"Link",value:in_stats[i].src.split(':').pop()+" --- "+in_stats[i].dst.split(':').pop()});
			            data.push({lbl:"In",value:in_stats[i].pkts+" pkts / "+formatBytes(in_stats[i].bytes)});
			            for(var j=0;j<out_stats.length;j++){
			                 if(src==out_stats[j].dst && dst==out_stats[j].src){
			                        data.push({lbl:"Out",value:out_stats[j].pkts+" pkts / "+formatBytes(out_stats[i].bytes)});
			                    }
			            }
			       }
			      }
			    } else if(viewElementDetails.more_attributes==undefined ||viewElementDetails.more_attributes.in_stats==undefined 
			            || viewElementDetails.more_attributes.out_stats == undefined ) {
			        var src=viewElementDetails.src.split(':').pop();
			        var dst=viewElementDetails.dst.split(':').pop();
			        if(partial_msg!="")
			            data.push({lbl:"",value:partial_msg});
			        if(viewElementDetails.dir=='bi'){
			            data.push({lbl:"Link",value:src+" --- "+dst});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});
			            data.push({lbl:"Link",value:dst+" --- "+src});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});
			        } else if(viewElementDetails.dir=='uni') {
			            data.push({lbl:"Link",value:src+" --- "+dst});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});
			        }
			    } else if(viewElementDetails.more_attributes!=undefined && viewElementDetails.more_attributes.in_stats!=undefined 
			            && viewElementDetails.more_attributes.out_stats!=undefined && viewElementDetails.more_attributes.in_stats.length==0
			            && viewElementDetails.more_attributes.out_stats.length==0) {
			        var src=viewElementDetails.src.split(':').pop();
			        var dst=viewElementDetails.dst.split(':').pop();
			        if(partial_msg!="")
			            data.push({lbl:"",value:partial_msg});
			        if(viewElementDetails.dir=='bi'){
			            data.push({lbl:"Link",value:src+" --- "+dst});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});
			            data.push({lbl:"Link",value:dst+" --- "+src});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});}
			        else if(viewElementDetails.dir=='uni'){
			            data.push({lbl:"Link",value:src+" --- "+dst});
			            data.push({lbl:"In",value:"0 pkts / 0 B"});
			            data.push({lbl:"Out",value:"0 pkts / 0 B"});
			        }
			    }
				
				return tooltipContent(data);
			}
		}
	};

var GRAPH_MARGIN = 35;

var VM_GRAPH_OPTIONS = {
    regularVMSize: {width: 25, height: 20, margin: 25},
    minVMSize: {width: 15, height: 15},
    externalRectRatio: {width: 8, height: 4},
    internalRectRatio: {width: 5, height: 2},
    minInternalRect: {width: 150, height: 60},
    marginRatio: {width:1.6, height:1 }
};

function ContrailElement(type, options) {
    var contrailElement;
    switch (type) {
        case 'virtual-network':
            contrailElement = new joint.shapes.contrail.VirtualNetwork(options);
            break;
        case 'service-instance':
            contrailElement = new joint.shapes.contrail.ServiceInstance(options);
            break;
        case 'network-policy':
            contrailElement = new joint.shapes.contrail.NetworkPolicy(options);
            break;
        case 'security-group':
            contrailElement = new joint.shapes.contrail.SecurityGroup(options);
            break;
        case 'network-ipam':
            contrailElement = new joint.shapes.contrail.NetworkIPAM(options);
            break;
        case 'router':
            contrailElement = new joint.shapes.contrail.LogicalRouter(options);
            break;
        case 'collection-element':
            contrailElement = new joint.shapes.contrail.CollectionElement(options);
            break;
        case 'virtual-machine':
            contrailElement = new joint.shapes.contrail.VirtualMachine(options);
            break;
        case 'link':
            contrailElement = new joint.shapes.contrail.Link(options);
            break;

        default:
            contrailElement = new joint.shapes.contrail.Element(options);
    }
    return contrailElement;
}

function drawVisualization(config) {
    var url = config.url;
    $.getJSON(url, function (response) {
    	setTimeout(function(){
    		var data = formatData4BiDirVisualization(response),
	        	jointConfig = renderVisualization(config, data);

	        $.contextMenu('destroy', 'g');
            $.contextMenu({
	            selector: 'g',
	            position: function(opt, x, y){
	            	opt.$menu.css({top: y + 5, left: x + 5});
	            },
                build: function($trigger, e){
                	if(!$trigger.hasClassSVG('element')){
                		$trigger = $trigger.parentsSVG('g.element');
                		if($trigger.length > 0){
                			$trigger = $($trigger[0]);
                		}
                	}
                	var contextMenuItems = false;
                    if(contrail.checkIfExist($trigger)){
	                	$.each(contextMenuConfig, function(keyConfig, valueConfig){
	                        if($trigger.hasClassSVG(keyConfig)){
	                            contextMenuItems = valueConfig($trigger, jointConfig);
		            			$('g.' + keyConfig).popover('hide');
	                            return false;
	                        }
	                    });
                    }
                    return contextMenuItems;
                }
            });

            $.each(tooltipConfig, function(keyConfig, valueConfig){
	    		$('g.' + keyConfig).popover({
	        		trigger: 'hover',
	        		html: true,
	        		delay: { show: 200, hide: 10 },
	        		title: function(){
	        			return valueConfig.title($(this), jointConfig);
	        		},
	        		content: function(){
	        			return valueConfig.content($(this), jointConfig);
	        		},
	        		container: $('body')
	        	});
	    	});
    	}, 500);
    });
}

function renderVisualization(config, data) {
	$(config.selectorId).parent().find('.topology-visualization-loading').remove();
    var selectorId = config.selectorId,
        configSelectorId = selectorId + '-config-elements',
        connectedSelectorId = selectorId + '-connected-elements',
        connectedElements = data['connectedElements'],
        configElements = data['configElements'],
        nodes = data['nodes'], links = data['links'],
        newGraphSize;

    var configGraph = new joint.dia.Graph,
	    configPaper = new joint.dia.Paper({
	        el: $(configSelectorId),
	        model: configGraph,
	        width: 150,
	        height: data.configSVGHeight,
	        linkView: joint.shapes.contrail.LinkView
	    }),
	    connectedGraph = new joint.dia.Graph,
        connectedPaper = new joint.dia.Paper({
            el: $(connectedSelectorId),
            model: connectedGraph,
            linkView: joint.shapes.contrail.LinkView
        });

    configGraph.addCells(configElements);
    connectedGraph.addCells(connectedElements);
    
    var jointObject = {
	    	configGraph: configGraph,
	    	configPaper: configPaper,
	    	connectedGraph: connectedGraph,
	    	connectedPaper: connectedPaper
	    };
    
    if(config.fqName.split(':').length > 2){
    	return renderZoomedVisualization4VN(selectorId, jointObject, {config:config, data:data});
    }
    
    newGraphSize = joint.layout.contrail.DirectedGraph.layout(connectedGraph, getForceFitOptions(null, null, nodes, links));
    connectedPaper.setDimensions((($(selectorId).width() > newGraphSize.width) ? $(selectorId).width() : newGraphSize.width) + GRAPH_MARGIN, newGraphSize.height + GRAPH_MARGIN, 1);
    
    $(connectedSelectorId).data('actual-size', newGraphSize);
    $(connectedSelectorId).data('offset', {x: 0, y: 0});
    $(selectorId).data('joint-object', jointObject);
    
    setTopologyHeight(selectorId, false);
    initConnectedGraphEvents(selectorId, jointObject, {config:config, data:data});
    initPanZoom4ConnectedGraph(selectorId);
    
    return jointObject;
}

function renderZoomedVisualization4VN(selectorId, jointObject, params){
	var forceFitOptions = getForceFitOptions("LR", 50),
    	config = params.config,
    	data = params.data,
    	domainName = config.fqName.split(':')[0],
    	projectName = config.fqName.split(':')[1],
    	dblClickedElement = jointObject.connectedGraph.getCell(data.elementMap.node[config.fqName]),
    	dblClickedElementId = dblClickedElement.id,
        neighbors = jointObject.connectedGraph.getNeighbors(dblClickedElement),
        neighborLinks = jointObject.connectedGraph.getConnectedLinks(dblClickedElement),
        srcVNDetails = dblClickedElement.attributes.nodeDetails,
        options = getZoomedVMSize($(selectorId).height(), $(selectorId).width(), srcVNDetails),
        currentZoomedElement = createCloudZoomedNodeElement(dblClickedElement['attributes']['nodeDetails'], {width: options['widthZoomedElement'], height: options['heightZoomedElement']}),
        newGraphSize;
    
    for (var i = 0; i < neighborLinks.length; i++) {
        if (dblClickedElementId == neighborLinks[i]['attributes']['source']['id']) {
            neighborLinks[i]['attributes']['source']['id'] = currentZoomedElement.id;
        } else if (dblClickedElementId == neighborLinks[i]['attributes']['target']['id']) {
            neighborLinks[i]['attributes']['target']['id'] = currentZoomedElement.id;
        }
    }
    jointObject.connectedGraph.clear();
    var zoomedGraph = new joint.dia.Graph(),
        connectedSelectorId = selectorId + "-connected-elements";
    
    $(connectedSelectorId).html('');
    var connectedPaper = new joint.dia.Paper({
    	el: $(connectedSelectorId),
    	interactive: false,
        gridSize: 1,
        model: zoomedGraph,
        perpendicularLinks: true,
        linkView: joint.shapes.contrail.LinkView
    });
    zoomedGraph.addCell(currentZoomedElement);
    zoomedGraph.addCells(neighbors);
    zoomedGraph.addCells(neighborLinks);

    newGraphSize = joint.layout.contrail.DirectedGraph.layout(zoomedGraph, forceFitOptions);

    connectedPaper.setDimensions((($(selectorId).width() > newGraphSize.width) ? $(selectorId).width() : newGraphSize.width) + GRAPH_MARGIN, newGraphSize.height + GRAPH_MARGIN, 1);
    
    createVMGraph(zoomedGraph, currentZoomedElement, options);
	currentZoomedElement.toBack();

    $('#topology-breadcrumb').append('<div id="topology-project-link" class="breadcrumb-item" title="' + projectName + '"> \
    		<p class="breadcrumb-item-text" >' + projectName + '</p> \
    		<img class="breadcrumb-item-image" src="/img/icons/tenent.png"> \
    	</div>').show();
    
    $('#topology-project-link').on('click', function(){
    	loadFeature({p:'mon_net_projects',q:{fqName: domainName + ':' + projectName}});
    });

    jointObject.connectedGraph = zoomedGraph;
    jointObject.connectedPaper = connectedPaper;
    
    $(connectedSelectorId).data('actual-size', newGraphSize);
    $(connectedSelectorId).data('offset', {x: 0, y: 0});
    $(selectorId).data('joint-object', jointObject);
    setTopologyHeight(selectorId, false);

	highlightSelectedElementForZoomedElement(selectorId, jointObject, {config:config, data:data});

    initConnectedGraphEventsForZoomedElement(selectorId, jointObject, {config:config, data:data});
    initConnectedGraphEvents(selectorId, jointObject, {config:config, data:data});
    initPanZoom4ConnectedGraph(selectorId);
    
    return jointObject;
}

function getZoomedVMSize(availableHeight, availableWidth, srcVNDetails) {
    /*
    var maxExternalRectHeight = .8 * availableHeight,
        maxExternalRectWidth = maxExternalRectHeight * (VM_GRAPH_OPTIONS.externalRectRatio['width'] / VM_GRAPH_OPTIONS.externalRectRatio['height']);
    */

    var maxExternalRectWidth = .8 * availableWidth,
        maxExternalRectHeight = maxExternalRectWidth * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['width']);

    var maxInternalRectWidth = (VM_GRAPH_OPTIONS.internalRectRatio['width'] / VM_GRAPH_OPTIONS.externalRectRatio['width']) * maxExternalRectWidth,
        maxInternalRectHeight = (VM_GRAPH_OPTIONS.internalRectRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['height']) * maxExternalRectHeight,
        maxInternalRectArea = maxInternalRectHeight * maxInternalRectWidth;

    var noOfVMs = srcVNDetails.more_attr.vm_cnt,
    	VMHeight = VM_GRAPH_OPTIONS.regularVMSize['height'],
        VMWidth = VM_GRAPH_OPTIONS.regularVMSize['width'],
        vmMargin = VM_GRAPH_OPTIONS.regularVMSize['margin'],
        widthNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.width + vmMargin,
        heightNeededForVM = VM_GRAPH_OPTIONS.regularVMSize.height + vmMargin,
        areaPerVM = widthNeededForVM * heightNeededForVM,
        actualAreaNeededForVMs = areaPerVM * noOfVMs,
        vmPerRow;

    var returnObj = {
        'VMHeight': VMHeight,
        'VMWidth': VMWidth,
        'VMMargin': vmMargin
    },
    internalRectangleWidth, internalRectangleHeight, noOfVMsToDraw;

    if (actualAreaNeededForVMs > maxInternalRectArea) {
        noOfVMsToDraw = Math.floor(maxInternalRectArea / areaPerVM);
        // Show the more link in the cloud if required
        returnObj['showMoreLink'] = true;
        vmPerRow = Math.ceil(maxInternalRectWidth / widthNeededForVM);
        internalRectangleWidth = maxInternalRectWidth;
        internalRectangleHeight = maxInternalRectHeight;
    } else {
        internalRectangleHeight = maxInternalRectHeight * Math.sqrt(actualAreaNeededForVMs/maxInternalRectArea) ;
        internalRectangleWidth = maxInternalRectWidth * Math.sqrt(actualAreaNeededForVMs/maxInternalRectArea);
        internalRectangleHeight = internalRectangleHeight < VM_GRAPH_OPTIONS.minInternalRect['height'] ? VM_GRAPH_OPTIONS.minInternalRect['height'] : internalRectangleHeight;
        internalRectangleWidth = internalRectangleWidth < VM_GRAPH_OPTIONS.minInternalRect['width'] ? VM_GRAPH_OPTIONS.minInternalRect['width'] : internalRectangleWidth;
        noOfVMsToDraw = noOfVMs;
        vmPerRow = Math.ceil(internalRectangleWidth / widthNeededForVM);
    }

    vmPerRow = (vmPerRow == 0) ? 1 : vmPerRow;
    returnObj['vmPerRow'] = vmPerRow;

    if(noOfVMsToDraw % vmPerRow != 0) {
        var rows = Math.ceil((noOfVMsToDraw/vmPerRow)/2);
        if(noOfVMs > (2 * rows * vmPerRow)) {
            noOfVMsToDraw = (2 * rows * vmPerRow);
        } else {
            noOfVMsToDraw = noOfVMs;
        }
    }

    returnObj['noOfVMsToDraw'] = noOfVMsToDraw;
    returnObj['widthZoomedElement'] = Math.floor(internalRectangleWidth * (VM_GRAPH_OPTIONS.externalRectRatio['width'] / VM_GRAPH_OPTIONS.internalRectRatio['width']));
    returnObj['heightZoomedElement'] = Math.floor(internalRectangleHeight * (VM_GRAPH_OPTIONS.externalRectRatio['height'] / VM_GRAPH_OPTIONS.internalRectRatio['height']));
    returnObj['vmList'] = srcVNDetails.more_attr.virtualmachine_list;
    returnObj['srcVNDetails'] = srcVNDetails;
    
    return returnObj;
}

function createVMGraph(connectedVMGraph, currentZoomedElement, options) {
	 var xOrigin = currentZoomedElement['attributes']['position']['x'] + (options['widthZoomedElement'] * (VM_GRAPH_OPTIONS.marginRatio['width'] / VM_GRAPH_OPTIONS.externalRectRatio['width'])),
	 	yOrigin = currentZoomedElement['attributes']['position']['y'] + (options['heightZoomedElement'] * (VM_GRAPH_OPTIONS.marginRatio['height'] / VM_GRAPH_OPTIONS.externalRectRatio['height'])),
    	vmWidth = options['VMWidth'],
        vmHeight = options['VMHeight'],
        vmMargin = options['VMMargin'],
        xSeparation = vmWidth + vmMargin,
        ySeparation = vmHeight + vmMargin,
        vmPerRow = options['vmPerRow'], vmNodes = [],
        vmGraphElements = [], centerLines = [],
        vmNode, vmLink,
        vmList = options['vmList'];

    var centerLineHeight = 0.1,
        xFactor = 0, yFactor = -1, lineCounter = 0,
        vmLength = options['noOfVMsToDraw'];

    for (var i = 0; i < vmLength; i++) {
        if (i % vmPerRow == 0) {
            xFactor = 0;
            yFactor++;
            if (((i / vmPerRow)) % 2 == 0) {
                var centerLineY = yOrigin + (ySeparation * yFactor) + vmHeight + (vmMargin) / 2 + yFactor * centerLineHeight;
                var centerLine = new joint.shapes.basic.Rect({
                	type: 'VirtualMachineLink',
                    position: { x: xOrigin - (vmMargin / 2), y: centerLineY},
                    size: { width: (xSeparation) * ((vmLength < vmPerRow) ? vmLength : vmPerRow), height: centerLineHeight},
                    attrs: { rect: { fill: '#637939', stroke: '#637939' }}
                });
                centerLines.push(centerLine);
                vmGraphElements.push(centerLine);
                lineCounter++;
            }
        }
        vmNode = createVirtualMachine(xOrigin + (xSeparation * xFactor), yOrigin + ((ySeparation + centerLineHeight) * yFactor), vmList[i], options['srcVNDetails']);
        xFactor++;
        vmNodes.push(vmNode);
        vmGraphElements.push(vmNode);
    }

    var centerLineCounter = -1, rowCounter = 0,
        nodeLinkY, centerLineLinkY;

    for (var j = 0; j < vmNodes.length; j++) {
        var node = vmNodes[j];
        if (j % vmPerRow == 0) {
            rowCounter++;
            if (((j / vmPerRow)) % 2 == 0) {
                centerLineCounter++;
            }
        }
        var nodeY = node['attributes']['position']['y'],
            nodeX = node['attributes']['position']['x'];
        if (rowCounter % 2 == 0) {
            nodeLinkY = nodeY;
            centerLineLinkY = nodeY - vmMargin / 2;
        } else {
            nodeLinkY = nodeY + vmHeight;
            centerLineLinkY = nodeLinkY + vmMargin / 2;
        }
        vmLink = createVMLink(vmNodes[j], centerLines[centerLineCounter], [
                {x: nodeX + (vmWidth / 2), y: centerLineLinkY},
                {x: nodeX + (vmWidth / 2), y: nodeLinkY}
            ]
        );
        vmGraphElements.push(vmLink);
    }

//    setTimeout(function(){
//	    $.each(vmGraphElements, function(vmGraphElementKey, vmGraphElementValue){
//    		currentZoomedElement.embed(vmGraphElementValue);
//    	});
//	    
//	},500);
//    
//    connectedVMGraph.on('change:position', function(cell) {
//
//        var parentId = cell.get('parent');
//        if (!parentId) return;
//
//        var parent = graph.getCell(parentId);
//        var parentBbox = parent.getBBox();
//        var cellBbox = cell.getBBox();
//
//        if (parentBbox.containsPoint(cellBbox.origin()) &&
//            parentBbox.containsPoint(cellBbox.topRight()) &&
//            parentBbox.containsPoint(cellBbox.corner()) &&
//            parentBbox.containsPoint(cellBbox.bottomLeft())) {
//
//            // All the four corners of the child are inside
//            // the parent area.
//            return;
//        }
//
//        // Revert the child position.
//        cell.set('position', cell.previous('position'));
//    });
    
    connectedVMGraph.addCells(vmGraphElements);

    function createVirtualMachine(x, y, node, srcVNDetails) {
        var nodeType = 'virtual-machine',
            element, options;
        
        options = {position: { x: x, y: y }, 
        			size: { width: vmWidth, height: vmHeight}, 
        			font: {
        				iconClass: 'icon-contrail-virtual-machine font-size-20'
        			},
        			nodeDetails: {
        				fqName: node,
        				srcVNDetails: srcVNDetails
        			}
        		};
        element = new ContrailElement(nodeType, options);
        return element;
    };

    function createVMLink(source, target, breakpoints) {
        var vmLink = new joint.dia.Link({
        	type: 'VirtualMachineLink',
            markup: [
                '<path class="connection" stroke="black"></path>',
                '<g class="labels"></g>'
            ].join(''),
            attrs: {
                '.connection': {
                    'stroke': '#637939',
                    'stroke-width': 2
                }
            },
            source: { id: source.id},
            target: { id: target.id},
            // vertices: breakpoints, // TODO - Get rid of this once the links stay perpendicular
            router: { name: 'orthogonal' },
        });
        return vmLink;
    };
}

function getForceFitOptions(rankDir, separation, nodes, links) {
    var forceFitOptions = { setLinkVertices: false, edgeSep: 1, nodeSep: 50, rankSep: 50, rankDir: "LR" };
    if (rankDir == null) {
        rankDir = (nodes.length > 12 || (3 * (links.length) < nodes.length)) ? 'TB' : 'LR';
    }
    forceFitOptions['rankDir'] = rankDir;
    if (separation != null) {
        forceFitOptions['nodeSep'] = separation;
        forceFitOptions['rankSep'] = separation;
    }
    return forceFitOptions;
}

function replaceElementInGraph(paper, graph, oldElement, newElement) {
    var connectedLinks = graph.getConnectedLinks(oldElement),
        oldElementId = oldElement['id'],
        zoomedElements, zoomedLinks;
    for (var i = 0; i < connectedLinks.length; i++) {
        var link = graph.getCell(connectedLinks[i].id);
        var newLink = link.clone();
        if (newLink['attributes']['source']['id'] == oldElementId) {
            newLink['attributes']['source']['id'] = newElement.id;
        } else {
            newLink['attributes']['target']['id'] = newElement.id;
        }
        graph.addCell(newLink);
        link.remove();
    }
    if (oldElement['collection']) {
        zoomedElements = paper['zoomedElements'];
        for (var j = 0; zoomedElements != null && j < zoomedElements.length; j++) {
            zoomedElements[j].remove();
        }
        zoomedLinks = paper['zoomedLinks'];
        for (var j = 0; zoomedLinks != null && j < zoomedLinks.length; j++) {
            zoomedLinks[j].remove();
        }
        oldElement.remove();
    } else {
        oldElement.remove();
    }
}

function formatData4BiDirVisualization(response, config) {
    var elementMap = {
    		node: {},
    		link: {}
    	}, 
    	configElements = [], connectedElements = [],
        nodes = response['nodes'],
        links = response['links'],
        collections = {},
        configData = response['configData'],
        configSVGHeight = 0;
    createNodes4ConfigData(configData, nodes, collections);
    configSVGHeight = createCollectionElements(collections, configElements, elementMap);
    createNodeElements(nodes, connectedElements, elementMap, config);
    createLinkElements(links, connectedElements, elementMap);
    return {connectedElements: connectedElements, configElements: configElements, elementMap: elementMap, nodes: nodes, links: links, configSVGHeight: configSVGHeight};
}

function createNodes4ConfigData(configData, nodes, collections) {
    var networkPolicys = configData['network-policys'],
        securityGroups = configData['security-groups'],
        networkIPAMS = configData['network-ipams'],
        name, i;

    if (networkPolicys != null && networkPolicys.length > 0) {
    	var font = {
	        	iconClass: 'icon-contrail-network-policy'
	        };
        collections.networkPolicys = {name: 'Network Policies', node_type: 'collection-element', nodes: []};
        for (i = 0; networkPolicys != null && i < networkPolicys.length; i++) {
            name = networkPolicys[i]['fq_name'].join(':');
            collections.networkPolicys.nodes.push({name: name, node_type: 'network-policy', nodeDetails: networkPolicys[i], font: font});
        }
    }

    if (securityGroups != null && securityGroups.length > 0) {
    	var font = {
	        	iconClass: 'icon-contrail-security-group'
	        };
        collections.securityGroups = {name: 'Security Groups', node_type: 'collection-element', nodes: []};
        for (i = 0; securityGroups != null && i < securityGroups.length; i++) {
            name = securityGroups[i]['fq_name'].join(':');
            collections.securityGroups.nodes.push({name: name, node_type: 'security-group', nodeDetails: securityGroups[i], font: font});
        }
    }

    if (networkIPAMS != null && networkIPAMS.length > 0) {
        collections.networkIPAMS = {name: 'Network IPAMS', node_type: 'collection-element', nodes: []};
        for (i = 0; networkIPAMS != null && i < networkIPAMS.length; i++) {
            name = networkIPAMS[i]['fq_name'].join(':');
            collections.networkIPAMS.nodes.push({name: name, node_type: 'network-ipam', nodeDetails: networkIPAMS[i]});
        }
    }
}

function createNodeElements(nodes, elements, elementMap, config) {
    var newElement, nodeName;
    for (var i = 0; i < nodes.length; i++) {
        newElement = createNodeElement(nodes[i], config);
        nodeName = nodes[i]['name'];
        elements.push(newElement);
        elementMap.node[nodeName] = newElement.id;
    }
}

function createNodeElement(node, config) {
    var nodeName = node['name'],
        nodeType = node['node_type'],
        width = (config != null && config.width != null) ? config.width : 40,
        height = (config != null && config.height != null) ? config.height : 40,
        imageLink, element, options, imageName;

    imageName = getImageName(node);
    imageLink = '/img/icons/' + imageName;
    options = {
    		attrs: { 
    			image: {
    				'xlink:href': imageLink, 
    				width: width, 
    				height: height
    			},
    			text: {
    				text: contrail.truncateText(nodeName.split(":")[2],20)
    			}
    		}, 
    		size: { 
    			width: width, 
    			height: height
    		}, 
    		nodeDetails: node,
    		font: {
    			iconClass: 'icon-contrail-' + nodeType
    		}
    	};
    element = new ContrailElement(nodeType, options);
    return element;
}

function createCloudZoomedNodeElement(nodeDetails, config) {
    var factor = 1;
    var currentZoomedElement = new joint.shapes.contrail.ZoomedCloudElement({
        size: { width: config.width * factor, height: config.height * factor},
        attrs: {
            rect: { width: config.width * factor, height: config.height * factor},
            text: {
                text: (nodeDetails['more_attr']['vm_cnt'] == 0) ? "No VM's available" : contrail.truncateText(nodeDetails['name'].split(":")[2],50),
                'ref-x': .5,
                'ref-y': (nodeDetails['more_attr']['vm_cnt'] == 0) ? 65 : -20
            }
        }
    });
    currentZoomedElement['attributes']['nodeDetails'] = nodeDetails;
    return currentZoomedElement;
}

function createCollectionElements(collections, elements, elementMap) {
    var elementDimension = {
        width: 37,
        height: 37,
        marginLeft: 17,
        marginRight: 17,
        marginTop: 10,
        marginBottom: 0,
        firstRowMarginTop: 10
    };
    var collectionPositionX = 10,
        collectionPositionY = 20,
        width = 0,
        height = 0;
    $.each(collections, function (collectionKey, collectionValue) {
        var nodeRows = 1;
        collectionPositionX = 0,
        collectionPositionY += height,
            width = (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight) * collectionValue.nodes.length;
        height = nodeRows * (elementDimension.width + elementDimension.marginTop + elementDimension.marginBottom) + elementDimension.marginTop + elementDimension.marginBottom + elementDimension.firstRowMarginTop;
        var options = {
            position: { 
            	x: collectionPositionX, 
            	y: collectionPositionY 
            },
            attrs: { 
            	rect: { 
            		width: width, 
            		height: height 
            	},
            	text: {
            		text: collectionValue.name
            	}
            }
        };

        var collectionElement = new ContrailElement(collectionValue.node_type, options);
        elements.push(collectionElement);
        elementMap.node[collectionValue.name] = collectionElement.id;

        var collectionNodePositionX = 0,
        	collectionNodePositionY = 0;
        
        $.each(collectionValue.nodes, function (collectionNodeKey, collectionNodeValue) {
            collectionNodePositionX = collectionPositionX + (collectionNodeKey % 2) * (elementDimension.width + elementDimension.marginLeft + elementDimension.marginRight)
            	+ elementDimension.marginLeft;
            collectionNodePositionY = elementDimension.firstRowMarginTop + (collectionPositionY + height * parseInt(collectionNodeKey / 2));
            
            var nodeName = collectionNodeValue['name'],
                nodeType = collectionNodeValue['node_type'],
                imageName = getImageName(collectionNodeValue),
                imageLink = '/img/icons/' + imageName,
                options = {
                    position: { 
                    	x: collectionNodePositionX, 
                    	y: collectionNodePositionY 
                    },
                    attrs: { 
                    	image: {
                    		'xlink:href': imageLink, 
                    		width: elementDimension.width, 
                    		height: elementDimension.height
                    	},
                    	text: {
                    		text: contrail.truncateText(nodeName.split(":")[2],15)
                    	}
                    },
                    nodeDetails: collectionNodeValue.nodeDetails,
                    font: collectionNodeValue.font
                },
                element = new ContrailElement(nodeType, options);
            
            collectionElement.embed(element);
            elements.push(element);
            elementMap.node[nodeName] = element.id;
        });
        
        collectionPositionY = collectionNodePositionY;
    });
    
    return collectionPositionY + elementDimension.height + elementDimension.firstRowMarginTop;
}

function createLinkElements(links, elements, elementMap) {
    for (var i = 0; i < links.length; i++) {
        var sInstances = links[i] ['service_inst'],
            dir = links[i]['dir'],
            options, link;

        if (sInstances == null || sInstances.length == 0) {
            options = {
                sourceId: elementMap.node[links[i]['src']],
                targetId: elementMap.node[links[i]['dst']],
                direction: dir,
                linkType: 'bi',
                linkDetails: links[i]
            };
            link = new ContrailElement('link', options);
            elements.push(link);
        } else {
            options = { 
            		direction: dir, 
            		linkType: 'bi',
            		linkDetails: links[i]
            	};
            for (var j = 0; j < sInstances.length; j++) {
                if (j == 0) {
                    options['sourceId'] = elementMap.node[links[i]['src']];
                    options['targetId'] = elementMap.node[sInstances[j]['name']];
                } else {
                    options['sourceId'] = elementMap.node[sInstances[j - 1]['name']];
                    options['targetId'] = elementMap.node[sInstances[j]['name']];
                }
                link = new ContrailElement('link', options);
                elements.push(link);
            }
            options['sourceId'] = elementMap.node[sInstances[j - 1]['name']];
            options['targetId'] = elementMap.node[links[i]['dst']];
            link = new ContrailElement('link', options);
            elements.push(link);
        }
        elementMap.link[link.attributes.linkDetails.src + '<->' + link.attributes.linkDetails.dst] = link.id;
        if(link.attributes.linkDetails.dir == 'bi'){
            elementMap.link[link.attributes.linkDetails.dst + '<->' + link.attributes.linkDetails.src] = link.id;
        }
    }
}

function getImageName(node) {
    var nodeStatus = node['status'],
        serviceType = node['service_type'],
        nodeType = node['node_type'],
        imageName;

    nodeType = (serviceType != null) ? (nodeType + '-' + serviceType) : nodeType;
    imageName = IMAGE_MAP[nodeType];

    if (imageName == null) {
        imageName = 'opencontrail-icon.png';
    } else if (nodeStatus == 'Deleted') {
        imageName += '-deleted.png';
    } else {
        imageName += '.png';
    }
    return imageName;
};

function highlightElementsToFaint(elementObjects){
	$.each(elementObjects, function(elementObjectKey, elementObjectValue){
		$(elementObjectValue).removeClass('elementSelectedHighlighted').addClass('faintHighlighted');
	});
};

function highlightSVGElementsToFaint(elementObjects){
	$.each(elementObjects, function(elementObjectKey, elementObjectValue){
		$(elementObjectValue).removeClassSVG('elementSelectedHighlighted').addClassSVG('faintHighlighted');
	});
};

function highlightSelectedElements(elementObjects){
	$.each(elementObjects, function(elementObjectKey, elementObjectValue){
		$(elementObjectValue).addClass('elementSelectedHighlighted')
	});
};

function highlightSelectedSVGElements(elementObjects){
	$.each(elementObjects, function(elementObjectKey, elementObjectValue){
		$(elementObjectValue).addClassSVG('elementSelectedHighlighted');
	});
};

function highlightSelectedElementForZoomedElement(selectorId, jointObject, params){
	highlightElementsToFaint([
   		$(selectorId + '-connected-elements').find('div.font-element')
   	]);
	
	highlightSVGElementsToFaint([
		$(selectorId + '-connected-elements').find('g.element'),
		$(selectorId + '-connected-elements').find('g.link')
	]);
	
	highlightSelectedSVGElements([$('g.ZoomedElement')]);
	if(params.config.focusedElement == 'VirtualNetwork'){
		highlightSelectedElements([$('div.VirtualMachine')]);
		highlightSelectedSVGElements([$('g.VirtualMachine'),$('.VirtualMachineLink')]);
	}
	else if(params.config.focusedElement == 'VirtualMachine'){
		var graphElements = jointObject.connectedGraph.getElements(),
			vmFqName = params.config.vmFqName;
		
		$.each(graphElements, function(graphElementKey, graphElementValue){
			if(graphElementValue.attributes.type == 'contrail.VirtualMachine' && graphElementValue.attributes.nodeDetails.fqName == vmFqName){
				var modelId = graphElementValue.id;
					vmLinks = jointObject.connectedGraph.getConnectedLinks(graphElementValue);
				
				$('g.VirtualNetwork').find('rect').addClassSVG('faintHighlighted').removeClassSVG('elementSelectedHighlighted');
				$('g[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
				$('div.font-element[font-element-model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
				
				$.each(vmLinks, function(vmLinkKey, vmLinkValue){
					$('g.link[model-id="' + vmLinkValue.id + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
				});
			}
		});
	}
}

function initConnectedGraphEventsForZoomedElement(selectorId, jointObject, params){
    jointObject.connectedPaper.on('blank:pointerdblclick', function (evt, x, y) {
        var fqName = params['config']['fqName'],
            fqNameArray = fqName.split(':');
        loadFeature({p:'mon_net_projects',q:{fqName:fqNameArray[0]+':'+fqNameArray[1]}});
    });
}

function initConnectedGraphEvents(selectorId, jointObject, params) {
	jointObject.connectedPaper.on('blank:pointerdblclick', function (evt, x, y) {
		$('div.font-element').removeClass('elementSelectedHighlighted').removeClass('faintHighlighted');
    	$('g.element').removeClassSVG('elementSelectedHighlighted').removeClassSVG('faintHighlighted');
    	$('g.link').removeClassSVG('elementSelectedHighlighted').removeClassSVG('faintHighlighted');
	});
	
	jointObject.connectedPaper.on("cell:pointerdblclick", function (cellView, evt, x, y) {
    	var dblClickedElement = cellView.model,
    		elementType = dblClickedElement['attributes']['type'];
    	
    	switch(elementType) {
			case 'contrail.VirtualNetwork':
				loadFeature({p:'mon_net_networks',q:{fqName:dblClickedElement['attributes']['nodeDetails']['name']}});
				$('g.VirtualNetwork').popover('hide');
			break;
			case 'link':
				var modelId = dblClickedElement.id;
				
				highlightElementsToFaint([
              		$(selectorId + '-connected-elements').find('div.font-element')
              	]);
				
				highlightSVGElementsToFaint([
               		$(selectorId + '-connected-elements').find('g.element'),
               		$(selectorId + '-connected-elements').find('g.link'),
               	]);
				
	        	$('g.link[model-id="' + modelId + '"]').removeClassSVG('faintHighlighted').addClassSVG('elementSelectedHighlighted');
	        	
	        	var graph = jointObject.connectedGraph,
					targetElement = graph.getCell(dblClickedElement['attributes']['target']['id']),
					sourceElement = graph.getCell(dblClickedElement['attributes']['source']['id']);
				
				loadVisualizationTab({
					container: '#topology-visualization-tabs',
					type: "connected-network",
					context: "connected-nw",
					sourceElement: sourceElement,
					targetElement: targetElement,
					fqName: targetElement['attributes']['nodeDetails']['name'],
					selfElement: dblClickedElement
				});
				
			break;
			case 'contrail.VirtualMachine':
				var srcVN = dblClickedElement.attributes.nodeDetails.srcVNDetails.name;
				loadFeature({
					p:'mon_net_instances',
					q:{
						fqName:dblClickedElement['attributes']['nodeDetails']['fqName'],
						srcVN: srcVN.split(':')[2] + ' (' + srcVN.split(':')[1] + ')'
					}
				});
				$('g.VirtualMachine').popover('hide');
			break;
			
    	}
    	
    });

    jointObject.connectedPaper.on('blank:pointerdblclick', function (evt, x, y) {
    	var fqName = params['config']['fqName'],
	        fqNameArray = fqName.split(':');
    		loadFeature({p:'mon_net_projects',q:{fqName:fqNameArray[0]+':'+fqNameArray[1]}});
    	
        var zoomedElementId = jointObject.connectedPaper['zoomedElementId'],
            newGraphSize;

        if (zoomedElementId != null) {
            jointObject.connectedPaper.scale(1, 1);
            clearZoomedElement(jointObject.connectedGraph, jointObject.connectedPaper);
            newGraphSize = joint.layout.contrail.DirectedGraph.layout(jointObject.connectedGraph, forceFitOptions);
            jointObject.connectedPaper.setDimensions(newGraphSize.width + GRAPH_MARGIN, newGraphSize.height + GRAPH_MARGIN, 1);
        }
    });

    $(selectorId + " text").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });

    $(selectorId + " image").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });

    $(selectorId + " polygon").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });
    $(selectorId + " path").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });
    $(selectorId + " rect").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });
    $(selectorId + " .font-element").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        jointObject.connectedPaper.pointerdown(e);
    });

    if(params.config.focusedElement == 'Project'){
    	//TODO - Disabled mouse actions on Network Policy as the data is not available from back-end
	    setTimeout(function(){
	    	$(selectorId).find('.NetworkPolicy').on('mouseout', function(e){
	    		$('g.element').removeClassSVG('dimHighlighted').removeClassSVG('elementHighlighted');
	        	$('div.font-element').removeClass('dimHighlighted').removeClass('elementHighlighted');
	    		$('g.link').removeClassSVG('dimHighlighted').removeClassSVG('elementHighlighted');
	    		
	    		var graphLinks = jointObject.connectedGraph.getLinks();
	        	$.each(graphLinks, function(graphLinkKey, graphLinkValue){
	        		var linkElement = jointObject.connectedGraph.getCell(graphLinkValue.id);
	        		linkElement.attr({
	        			'.connection': { stroke: '#333'},
	    				'.marker-source': { stroke: '#333', fill: '#333'},
	    				'.marker-target': { stroke: '#333', fill: '#333'}
	    			});
	        	});
	        });
	    	
	    	var elementMap = params.data.elementMap;
		    $(selectorId+'-config-elements').find('g.NetworkPolicy').each(function(){
		    	var viewElement = jointObject.configGraph.getCell($(this).attr('model-id')),
		    		policyRules = viewElement.attributes.nodeDetails.network_policy_entries.policy_rule,
		    		highlightedElements = {
		    			nodes: [],
		    			links: []
		    		};
		    	
		    	$(this).on('mouseover', function(e){
		        	$('div.font-element').addClass('dimHighlighted');
		        	$('g.element').addClassSVG('dimHighlighted');
		        	$('g.link').addClassSVG('dimHighlighted');
		    		
		        	$(this).removeClassSVG('dimHighlighted').addClassSVG('elementHighlighted');
		        	$('div[font-element-model-id="' + $(this).attr('model-id') + '"]').removeClass('dimHighlighted').addClass('elementHighlighted');
		        	
		        	$.each(policyRules, function(policyRuleKey, policyRuleValue){
			    		var sourceNode = policyRuleValue.src_addresses[0],
			    			destinationNode = policyRuleValue.dst_addresses[0];
			    		
			    		$.each(sourceNode, function(sourceNodeKey, sourceNodeValue){
			    			if(contrail.checkIfExist(sourceNodeValue)){
			    				highlightedElements.nodes.push(sourceNodeValue);
			    				highlightedElements.links.push(destinationNode[sourceNodeKey] + '<->' + sourceNodeValue);
			    			}
			    		});
			    		$.each(destinationNode, function(destinationNodeKey, destinationNodeValue){
			    			if(contrail.checkIfExist(destinationNodeValue)){
			    				highlightedElements.nodes.push(destinationNodeValue);
			    			}
			    		});
	
			    		highlightedElements.nodes = $.unique(highlightedElements.nodes);
			    		$.each(highlightedElements.nodes, function(nodeKey, nodeValue){;
			    			var nodeElement = jointObject.connectedGraph.getCell(elementMap.node[nodeValue]);
			    			$('g[model-id="' + nodeElement.id + '"]').addClassSVG('elementHighlighted');
			    			$('div[font-element-model-id="' + nodeElement.id + '"]').addClass('elementHighlighted');
			    		});
			    		
			    		if(policyRuleValue.action_list.simple_action == 'pass'){
			    			highlightedElements.links = $.unique(highlightedElements.links);
				    		$.each(highlightedElements.links, function(linkKey, linkValue){
				    			var nodeElement = jointObject.connectedGraph.getCell(elementMap.link[linkValue]);
				    			$('g[model-id="' + nodeElement.id + '"]').addClassSVG('elementHighlighted');
				    			nodeElement.attr({
				    				'.connection': { stroke: '#498AB9'},
				    				'.marker-source': { stroke: '#498AB9', fill: '#498AB9'},
				    				'.marker-target': { stroke: '#498AB9', fill: '#498AB9'}
				    			});
				    		});
			    		}
			    	});
		    	});
		    });
	    },1000);
    }
}

function clearZoomedElement(graph, paper) {
    var zoomedElementId = paper['zoomedElementId'],
        zoomedElement, lastClickedElement;

    zoomedElement = graph.getCell(zoomedElementId);
    lastClickedElement = createNodeElement(zoomedElement['attributes']['nodeDetails']);
    graph.addCell(lastClickedElement);
    replaceElementInGraph(paper, graph, zoomedElement, lastClickedElement);
    paper['zoomedElementId'] = null;
    paper['zoomedElements'] = null;
    paper['zoomedLinks'] = null;
}

function initPanZoom4ConnectedGraph(elementId) {
	var configSelectorId = elementId + '-config-elements',
    	connectedSelectorId = elementId + '-connected-elements';
	
	$(connectedSelectorId).panzoom({
    	$zoomIn: $(elementId).find(".zoom-in"),
        $zoomOut: $(elementId).find(".zoom-out"),
        $reset: $(elementId).find(".zoom-reset")
    });
    
    $(configSelectorId).panzoom({
    	disableZoom: true
    });
};

function resizeWidget(self, elementId) {
	$(self).find('i').toggleClass('icon-resize-full-down').toggleClass('icon-resize-small');
    setTopologyHeight(elementId, true);
}

function setTopologyHeight(selectorId) {
	/*
	 * svgHeight[s], topologyHeight[t], minHeight[m]
	 * t < m     = m
	 * s < m < t = m
	 * m < s < t = s
	 * m < t < s = t
	 */
	
	var resizeFlag = ($(selectorId).parents('.visualization-container').find('.icon-resize-small').is(':visible')),
		tabHeight = resizeFlag ? 155 : 435,
		minHeight = 300,
		topologyHeight = window.innerHeight - tabHeight,
		svgHeight = Math.max($(selectorId + '-connected-elements').data('actual-size').height, $(selectorId + '-config-elements svg').attr('height')),
	    elementHeight = resizeFlag ? topologyHeight : ((topologyHeight < minHeight) ? minHeight : ((svgHeight < topologyHeight) ? ((svgHeight < minHeight) ? minHeight : svgHeight) : topologyHeight));
	
	$(selectorId).parent().height(elementHeight);
    $(selectorId).find('.col1').height(elementHeight);
    $(selectorId + '-connected-elements svg').attr('height',elementHeight);
	$(selectorId).parent().css('width', '100%');
	
	translateGraphElements(selectorId);
};

function translateGraphElements(selectorId){
	var connectedGraphSize = $(selectorId + '-connected-elements').data('actual-size'),
		oldOffset = $(selectorId + '-connected-elements').data('offset'),
		offset = {
    		x: ($(selectorId).find('.col1').width() > connectedGraphSize.width) ? ($(selectorId).find('.col1').width() - connectedGraphSize.width - GRAPH_MARGIN) / 2 : 0,
    		y: ($(selectorId).find('.col1').height() > connectedGraphSize.height) ? ($(selectorId).find('.col1').height() - connectedGraphSize.height - GRAPH_MARGIN) / 2 : 0
    	},
    	connectedGraph = $(selectorId).data('joint-object').connectedGraph,
    	elements = connectedGraph.getElements(),
    	links = connectedGraph.getLinks();
	$(selectorId + '-connected-elements').data('offset', offset);	
		
	$.each(elements, function(elementKey, elementValue){
		elementValue.translate(offset.x - oldOffset.x, offset.y - oldOffset.y);
	});

}

function removeCell(options) {
    var collection = this.collection;
    if (collection) {
        collection.trigger('batch:start');
    }
    // First, unembed this cell from its parent cell if there is one.
    var parentCellId = this.get('parent');
    if (parentCellId) {

        var parentCell = this.collection && this.collection.get(parentCellId);
        if (parentCell)
            parentCell.unembed(this);
    }
    _.invoke(this.getEmbeddedCells(), 'remove', options);
    this.trigger('remove', this, this.collection, options);
    if (collection) {
        collection.trigger('batch:stop');
    }
};

function drawTestProjectVisualization(config) {
    $.getJSON('/examples/data/project3.json', function (response) {
        var data = formatData4BiDirVisualization(response);
        renderVisualization(config, data);
    });
}

joint.shapes.contrail.ImageElement = joint.shapes.basic.Generic.extend({
    markup: '<image/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.ImageElement',
        attrs: {
            text: {
                'style': 'font-size: 20px;',
                'ref-x': .5,
                'ref-y': -10,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'image',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults),

    remove: removeCell
});

joint.shapes.contrail.CollectionElement = joint.shapes.basic.Rect.extend({
    markup: '<rect><image/></rect>',
    defaults: joint.util.deepSupplement({
        type: 'contrail.CollectionElement',
        attrs: {
            rect: { rx: 0, ry: 0, 'stroke-width': '0.8px', stroke: '#fff', 'stroke-dasharray': '10,3', fill: 'none' }
        }
    }, joint.shapes.basic.Rect.prototype.defaults)
});

joint.shapes.contrail.FontElement = joint.shapes.basic.Rect.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.FontElement',
        size: { width: 35, height: 35 },
        attrs: {
            rect: { stroke: 0, 'fill-opacity': 0, width: 40, height: 40},
            text: {
            	'ref-y': -8,
                'x-alignment': 'middle',
                'y-alignment': 'middle',
                'ref': 'rect',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }
    }, joint.shapes.basic.Rect.prototype.defaults)
});

joint.shapes.contrail.FontElementView = joint.dia.ElementView.extend({
	template: function(elementProperty){
		return [
		    '<div class="font-element ' + elementProperty.model.attributes.type.split('.').join(' ') + '" font-element-model-id="' + elementProperty.model.id + '">',
	        '<i class="' + elementProperty.model.attributes.font.iconClass + '"/>',
	        '</div>'
	    ].join('');
	},
    initialize: function () {
    	_.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.$box = $(_.template(this.template(this))());
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        this.updateBox();
    },
    render: function () {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
        return this;
    },
    updateBox: function () {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'});
    }
});


//joint.shapes.contrail.VirtualNetwork = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.VirtualNetwork'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

joint.shapes.contrail.VirtualNetwork = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="VirtualNetwork"/></g></g>',
    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualNetwork'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.VirtualNetworkView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualNetworkView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});


//joint.shapes.contrail.VirtualMachine = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.VirtualMachine'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

joint.shapes.contrail.VirtualMachine = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="VirtualMachine"/></g></g>',
    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualMachine'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.VirtualMachineView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualMachineView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});

joint.shapes.contrail.ServiceInstance = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="ServiceInstance"/></g></g>',
    defaults: joint.util.deepSupplement({
        type: 'contrail.ServiceInstance'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.ServiceInstanceView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.ServiceInstanceView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});


//joint.shapes.contrail.ServiceInstance = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.ServiceInstance'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

//joint.shapes.contrail.NetworkPolicy = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.NetworkPolicy'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

joint.shapes.contrail.NetworkPolicy = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="NetworkPolicy"/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.NetworkPolicy'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.NetworkPolicyView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.NetworkPolicyView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});

//joint.shapes.contrail.SecurityGroup = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.SecurityGroup'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

joint.shapes.contrail.SecurityGroup = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="SecurityGroup"/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.SecurityGroup'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.SecurityGroupView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.SecurityGroupView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});

joint.shapes.contrail.NetworkIPAM = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.NetworkIPAM'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.LogicalRouter = joint.shapes.contrail.FontElement.extend({
    markup: '<g class="rotatable"><text/><g class="scalable"><rect class="LogicalRouter"/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.LogicalRouter'
    }, joint.shapes.contrail.FontElement.prototype.defaults)
});

joint.shapes.contrail.LogicalRouterView = joint.shapes.contrail.FontElementView.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.LogicalRouterView'
    }, joint.shapes.contrail.FontElementView.prototype.defaults)
});

//joint.shapes.contrail.LogicalRouter = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.LogicalRouter'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

joint.shapes.contrail.Element = joint.dia.Element.extend({
    markup: '<polygon class="outer"/><polygon class="inner"/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.Element',
        size: { width: 30, height: 30 },
        attrs: {
            '.outer': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15,0 30,15 15,30 0,15'
            },
            '.inner': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15, 3 27,15 15,27 3,15',
                display: 'none'
            },
            text: {
                'font-size': 12,
                'ref-x': .5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.contrail.ZoomedCloudElement = joint.shapes.basic.Rect.extend({
    markup: '<rect/><text/>',
    defaults: joint.util.deepSupplement({
        type: 'contrail.ZoomedElement.VirtualNetwork',
        attrs: {
            rect: { rx: 0, ry: 0, 'stroke-width': 2, stroke: '#637939', 'stroke-dasharray': '6,3', fill: '#fff' },
            text: {
                'ref-x': 0.01,
                'ref-y': 5,
                'y-alignment': 'top',
                'x-alignment': 'left',
                'text-anchor': 'middle',
                'ref': 'rect',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }
    }, joint.shapes.basic.Rect.prototype.defaults),
    remove: removeCell
});

joint.shapes.contrail.ZoomedElement = joint.shapes.basic.Rect.extend({
    markup: '<rect/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.ZoomedElement',
        attrs: {
            text: {
                'ref-x': 0.01,
                'ref-y': 5,
                'y-alignment': 'top',
                'x-alignment': 'left',
                'text-anchor': 'left',
                'ref': 'rect',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }
    }, joint.shapes.basic.Rect.prototype.defaults),
    remove: removeCell
});

joint.shapes.contrail.Element = joint.dia.Element.extend({
    markup: '<polygon class="outer"/><polygon class="inner"/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.Element',
        size: { width: 30, height: 30 },
        attrs: {
            '.outer': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15,0 30,15 15,30 0,15'
            },
            '.inner': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15, 3 27,15 15,27 3,15',
                display: 'none'
            },
            text: {
                'font-size': 12,
                'ref-x': .5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.contrail.LinkView = joint.dia.LinkView.extend({
	// Overriding mouse events to doing nothing
	startListening: function() {}
});

joint.shapes.contrail.Link = function (options) {
    var linkConfig = {
        markup: [
            '<path class="connection"></path>',
            '<path class="marker-source" fill="#333" stroke="#333" />',
            '<path class="marker-target" fill="#333" stroke="#333" />',
            '<path class="connection-wrap" fill="#333" stroke="#333" />'
        ].join(''),
        source: { id: options.sourceId },
        target: { id: options.targetId },
        smooth: true,
        attrs: {
            '.connection': {
                'stroke': '#333'
            },
            '.connection-wrap': {
                'stroke': '#333'
            }
        },
        linkDetails: options.linkDetails
    }, link;

    if (options['linkType'] == 'bi') {
        if (options.direction == 'bi') {
            linkConfig['attrs']['.marker-source'] = { fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z' };
            linkConfig['attrs']['.marker-target'] = { fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z' };
        } else if (options.direction == 'uni') {
            linkConfig['attrs']['.marker-target'] = { fill: '#e80015', stroke: '#e80015', d: 'M 6 0 L 0 3 L 6 6 z' };
            linkConfig['attrs']['.connection']['stroke'] = '#e80015';
            linkConfig['attrs']['.connection']['stroke-width'] = 1;
            linkConfig['attrs']['.connection']['stroke-dasharray'] = '4 4';
        }
    } else {
        linkConfig['attrs']['.marker-target'] = { fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z' };
    }

    link = new joint.dia.Link(linkConfig);
    return link;
};

joint.layout.contrail.DirectedGraph = $.extend(true, joint.layout.DirectedGraph, {
    layout: function (graph, opt) {

        opt = opt || {};

        var inputGraph = this._prepareData(graph);
        var runner = dagre.layout();

        if (opt.debugLevel) {
            runner.debugLevel(opt.debugLevel);
        }
        if (opt.rankDir) {
            runner.rankDir(opt.rankDir);
        }
        if (opt.rankSep) {
            runner.rankSep(opt.rankSep);
        }
        if (opt.edgeSep) {
            runner.edgeSep(opt.edgeSep);
        }
        if (opt.nodeSep) {
            runner.nodeSep(opt.nodeSep);
        }

        var layoutGraph = runner.run(inputGraph);

        layoutGraph.eachNode(function (u, value) {
            if (!value.dummy) {
                graph.get('cells').get(u).set('position', {
                    x: value.x + GRAPH_MARGIN - value.width / 2,
                    y: value.y + GRAPH_MARGIN - value.height / 2
                });
            }
        });

        if (opt.setLinkVertices) {

            layoutGraph.eachEdge(function (e, u, v, value) {
                var link = graph.get('cells').get(e);
                if (link) {
                    graph.get('cells').get(e).set('vertices', value.points);
                }
            });
        }
        return { width: layoutGraph.graph().width, height: layoutGraph.graph().height };
    }
});
