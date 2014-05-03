/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

function topology(){
    var nodeArr = new Array(),nodesD3 = new Array(),linksD3 = new Array(),nodesLabels = new Array(), linksLabels = new Array();
    var loadedD3 = false;
    var id;
    var graph,node,link,nodeLabel,linkLabel,force,forceLabel,tooltipText;
    this.loadD3=function(id){
        var image=false;
        width=$("#"+id).width();
        height=$("#"+id).height();
        var linkDistance=60,charge=-300;
        if(linksD3.length>nodesD3.length){
            linkDistance=170;
        }
        //Adding links for second force to hold labels
        for(var i=0;i<nodesD3.length;i++){
            linksLabels.push({source:nodesLabels[i*2],
                              target:nodesLabels[i*2+1],
                              weight:1});
           }
        var svg = d3.select("#"+id).append('svg')
                  .attr("width",$("#"+id).width())
                  .attr("height",$("#"+id).height());

        force = d3.layout.force()
                    .nodes(nodesD3)
                    .links(linksD3)
                    .size([width,height])
                    .linkDistance(linkDistance)
                    .friction(0.8)
                    .charge(charge)
                    .gravity(0.07)
                    .on("tick",function(){return tick(id);})
                    .start();
        forceLabel = d3.layout.force()
                     .nodes(nodesLabels)
                     .links(linksLabels)
                     .size([width,height])
                     .friction(0.09)
                     .linkDistance(5)
                     .charge(-300)
                     .gravity(0)
                     .linkStrength(0.8)
                     .start();
        var drag = force.drag().on("dragstart",dragstart);
        link = svg.selectAll("line.link")
        		  .data(force.links())
        		  .enter()
        		  .append("line")
        		  .attr("class","link")
        		  .style("stroke","transparent")
        		  .style("stroke-width",6.0)
        		  //.on("mouseover",mouseoverLink)
        		  //.on("mouseout", mouseout)
        		  .on("click",clickLink);
        link.call(d3.helper.tooltip()
                	  .text(function (eve) {
                      tooltipText = mouseoverLink(eve);
                      return tooltipText;
                      })).on('mouseover',function(e){
                      		});
        linkTransperant = svg.selectAll("line.trans")
                .data(force.links())
                .enter()
                .append("line")
                .attr("class","trans")
                .style("stroke",function(d){return d['lineColor'];})
                .style("stroke-width",function(d){return d['width'];})
                //.on("mouseover",mouseoverLink)
                //.on("mouseout", mouseout)
                .on("click",clickLink);
        linkTransperant.call(d3.helper.tooltip()
                .text(function (eve) {
                    tooltipText = mouseoverLink(eve);
                    return tooltipText;
                })).on('mouseover',function(e){
                });
        if(image){
            node = svg.selectAll(".node")
                      .data(force.nodes())
                      .enter().append("g")
                      .attr("class","node")
                      .call(drag);
            node.append("image")
                //.attr("xlink:href","/img/juniper-networks-icon.png")
                .attr("x",-8)
                .attr("y",-8)
                .attr("width",20)
                .attr("height",20)
        } else {
            node = svg.selectAll("path")
                      .data(force.nodes())
                      .enter()
                      .append("path")
                      .attr("fill",function(d){
                                    if(!d.selected)
                                        return "#CCE6FF";
                                    else
                                        return "#96CEF6";})
                      .attr("transform",function(d){
                                return "translate("+d.x+","+d.y+")";
                            })
                      .attr("d",d3.svg.symbol()
                                      .size(function(d){return d.size;})
                                      .type(function(d){return d.shape;}))
                       //.on("mouseover", mouseoverNode)
                      //.on("mouseout", mouseout)
                      .on("click",click)
                      .call(drag);
       }
       node.call(d3.helper.tooltip()
                .text(function (eve) {
                    tooltipText = mouseoverNode(eve);
                    return tooltipText;
                })).on('mouseover',function(e){
                });
       linkLabel = svg.selectAll("line.label")
                      .data(forceLabel.links());
       nodeLabel = svg.selectAll("g")
                      .data(forceLabel.nodes())
                      .enter()
                      .append("g");
      nodeLabel.append("circle").attr('r',0);
      nodeLabel.append("text").text(function(d,i){
                                        return i%2==0?"":d.node.name;
                                    }).style("fill", "#555").style("font-family", "Arial").style("font-size", '12px');
    }
    this.addNode_d3=function(configData){
        var node={};
        $.extend(node,{id:configData['id'],name:configData['name'],shape:configData['shape'],size:configData['size'],
                       selected:configData['selected'],display_name:configData['display_name'],vm_count:configData['vm_count'],
                       fip_count:configData['fip_count'],in_bytes:configData['in_bytes'],out_bytes:configData['out_bytes'],
                       out_tpkts:configData['out_tpkts'],in_tpkts:configData['in_tpkts']});
        nodesD3.push(node);
        nodesLabels.push({node:node});
        nodesLabels.push({node:node});
    }
    this.addLink_d3=function(configData){
        var link={};
        for(var i=0;i<nodesD3.length;i++){
            if(configData['src'] == nodesD3[i]['id'])
                link['source'] = nodesD3[i];
            else if(configData['dst'] == nodesD3[i]['id'])
                link['target'] = nodesD3[i];
        }
        $.extend(link,{more_attributes:configData['more_attributes'],width:configData['width'],toolTip:configData['toolTip'],
                       lineColor:configData['lineColor'],packets:configData['packets'],bytes:configData['bytes'],
                       tooltipTitle:configData['tooltipTitle'],error:configData['error'],loss:configData['loss'],orgDest:configData['orgDest'],
                       orgSrc:configData['orgSrc'],partialConnected:configData['partialConnected'],dir:configData['dir']});
        linksD3.push(link);
    }
    var updateNode = function(d) {
        this.attr("transform", function(d) {
            d.x=Math.max(20, Math.min(width - 20, d.x));
            d.y=Math.max(20, Math.min(height - 20, d.y));
            return "translate("+d.x+"," +d.y+ ")";
        });
    }
    var updateLink = function() {
            this.attr("x1", function(d) {
                return d.source.x;
            }).attr("y1", function(d) {
                return d.source.y;
            }).attr("x2", function(d) {
                return d.target.x;
            }).attr("y2", function(d) {
                return d.target.y;
            });
        }
    var tick=function(id){
          forceLabel.start();
          if(!loadedD3){
          if(force.alpha()<0.06){
            loadedD3=true;
            $("#"+id).show();}
          else
            $("#"+id).hide();}
          if(force.alpha()<=0.001){
                force.stop();
          }
          node.call(updateNode);
          nodeLabel.each(function(d, i) {
          if(i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
          } else {
                if(this.childNodes[1] != null) {
                    var b = this.childNodes[1].getBoundingClientRect();
                    var diffX = d.x-d.node.x;
                    var diffY = d.y-d.node.y;
                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);
                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    var shiftY =10;
                    this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
          }
          });
          nodeLabel.call(updateNode);
          link.call(updateLink);
          linkTransperant.call(updateLink);
          linkLabel.call(updateLink);
    }
    function dragstart(d){
        d.fixed=true;
        $('.qtip').remove();
    }
 }
function mouseoverNode(e) {
    //if(d3.select(this)[0][0].__data__.shape=='circle')//To avoid the curosr change on service instance as because not clickable
    var highlightLinks = false;
    var obj = {},opacity = 0.25,data = [];
    //var elementData = d3.select(this)[0][0].__data__;
    var elementData = e;
    $.extend(obj,{name : elementData['id'],vm_count : elementData['vm_count'],fip_count : elementData['fip_count'],
        display_name : elementData['display_name'],in_bytes : elementData['in_bytes'],out_bytes : elementData['out_bytes'],
        out_tpkts : elementData['out_tpkts'],in_tpkts : elementData['in_tpkts']});
    if(elementData['shape'] == 'circle') {
    	if(!isCurrentNode(elementData['id'])) {
	        d3.selectAll('path').style("cursor",function(d){
	            return d['id'] == elementData['id'] ? 'pointer' : "";
	        });
    	}
        data.push({lbl:'',value:obj['display_name']});
        if(obj['in_tpkts'] != '-')
             data.push({lbl:'In',value:obj['in_tpkts']+" pkts/"+obj['in_bytes']});
        else 
             data.push({lbl:'In',value:obj['in_tpkts']+" /"+obj['in_bytes']});
        if(obj['out_tpkts'] != '-')
            data.push({lbl:'Out',value:obj['out_tpkts']+" pkts/"+obj['out_bytes']});
        else
             data.push({lbl:'Out',value:obj['out_tpkts']+" /"+obj['out_bytes']});
         data.push({lbl:'Instances',value:obj['vm_count']});
         if(obj['fip_count']!=0)
         data.push({lbl:'Floating IP\'s',value:obj['fip_count']});
    } else if (elementData['shape'] == 'square') {
       data.push({lbl:'',value:obj['display_name']});
       data.push({lbl:'Instances',value:obj['vm_count']});
    }   
    if(highlightLinks) {
        d3.selectAll('line').style("opacity",function(d){
            if(d['source'] != undefined && d['target'] != undefined) {
                return d['source']['id'] === obj['name'] || d['target']['id'] === obj['name'] || d['orgSrc'] === obj['name'] || d['orgDest'] === obj['name'] ? 1 :opacity;}
        })
    }
    return contrail.getTemplate4Id('title-lblval-tooltip-template_new')(data);
}
function mouseoverLink(eve) {
    //if(d3.select(this)[0][0].__data__.source.shape=='circle' && d3.select(this)[0][0].__data__.target.shape=='circle'){
    //d3.select(this).style("cursor","pointer");
    var data = [],partial_msg = "";
    //var elementData = d3.select(this)[0][0].__data__;
    var elementData = eve;
    d3.selectAll('line').style('cursor',function(d){
        if(d['source'] != undefined && d['target'] != undefined) {
            return d['source']['id'] == elementData['source']['id'] && d['target']['id'] == elementData['target']['id'] ? 'pointer' : "";
        }
    });
    if(elementData.error=='Other link marked as unidirectional, attach policy'|| elementData.error=="Other link marked as bidirectional, attach policy")
        partial_msg="Link partially connected";
    if(elementData.more_attributes!=undefined && elementData.more_attributes.in_stats!=undefined
            && elementData.more_attributes.out_stats!=undefined && elementData.more_attributes.out_stats.length>0
            && elementData.more_attributes.in_stats.length>0){
    var in_stats=elementData.more_attributes.in_stats;
    var out_stats=elementData.more_attributes.out_stats;
    var src=elementData.orgSrc;
    var dst=elementData.orgDest;
    var loss=elementData.loss;
    /*if(loss.diff && loss.loss_percent>0) commented the percentage loss code for while 
        data.push({lbl:"Link",value:"Packet Loss % "+loss.loss_percent});
    else*/
    data.push({lbl:"Link",value:"Traffic Details"});
    if(partial_msg!="")
        data.push({lbl:"",value:partial_msg})
    for(var i=0;i<in_stats.length;i++) {
        if(src==in_stats[i].src && dst==in_stats[i].dst){
           data.push({lbl:"Link",value:in_stats[i].src.split(':').pop()+" --- "+in_stats[i].dst.split(':').pop()});
           data.push({lbl:"In",value:in_stats[i].pkts+" pkts/"+formatBytes(in_stats[i].bytes)});
              for(var j=0;j<out_stats.length;j++){
                  if(src==out_stats[j].src && dst==out_stats[j].dst){
                     data.push({lbl:"Out",value:out_stats[j].pkts+" pkts/"+formatBytes(out_stats[i].bytes)});
                  }
              }
        }else if(src==in_stats[i].dst && dst==in_stats[i].src){
            data.push({lbl:"Link",value:in_stats[i].src.split(':').pop()+" --- "+in_stats[i].dst.split(':').pop()});
            data.push({lbl:"In",value:in_stats[i].pkts+" pkts/"+formatBytes(in_stats[i].bytes)});
            for(var j=0;j<out_stats.length;j++){
                 if(src==out_stats[j].dst && dst==out_stats[j].src){
                        data.push({lbl:"Out",value:out_stats[j].pkts+" pkts/"+formatBytes(out_stats[i].bytes)});
                    }
            }
       }
      }
    } else if(elementData.more_attributes==undefined ||elementData.more_attributes.in_stats==undefined 
            || elementData.more_attributes.out_stats == undefined ) {
        var src=elementData.orgSrc.split(':').pop();
        var dst=elementData.orgDest.split(':').pop();
        data.push({lbl:"Link",value:"Traffic Details"});
        if(partial_msg!="")
            data.push({lbl:"",value:partial_msg})
        if(elementData.dir=='bi'){
            data.push({lbl:"Link",value:src+" --- "+dst});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});
            data.push({lbl:"Link",value:dst+" --- "+src});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});
        } else if(elementData.dir=='uni') {
            data.push({lbl:"Link",value:src+" --- "+dst});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});
        }
    } else if(elementData.more_attributes!=undefined && elementData.more_attributes.in_stats!=undefined 
            && elementData.more_attributes.out_stats!=undefined && elementData.more_attributes.in_stats.length==0
            && elementData.more_attributes.out_stats.length==0) {
        var src=elementData.orgSrc.split(':').pop();
        var dst=elementData.orgDest.split(':').pop();
        data.push({lbl:"Link",value:"Traffic Details"});
        if(partial_msg!="")
            data.push({lbl:"",value:partial_msg})
        if(elementData.dir=='bi'){
            data.push({lbl:"Link",value:src+" --- "+dst});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});
            data.push({lbl:"Link",value:dst+" --- "+src});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});}
        else if(elementData.dir=='uni'){
            data.push({lbl:"Link",value:src+" --- "+dst});
            data.push({lbl:"In",value:"0 pkts/0 B"});
            data.push({lbl:"Out",value:"0 pkts/0 B"});
        }
    }
    return contrail.getTemplate4Id('title-lblval-tooltip-template_new')(data);
}
 function click(){
	//To support IE we are removing the toltip on click using setimeout
	setTimeout(function() {$('.chart-tooltip').remove()},100);
    var elementData = d3.select(this)[0][0].__data__;
    if(elementData['shape'] == 'circle' && !isCurrentNode(elementData['id']))
         layoutHandler.setURLHashParams({fqName:elementData['id']},{p:'mon_net_networks',merge:false});
 }
 function clickLink(){
	//To support IE we are removing the toltip on click using setimeout  
	setTimeout(function() {$('.chart-tooltip').remove()},100);
    //if(d3.select(this)[0][0].__data__.source.shape=='circle' && d3.select(this)[0][0].__data__.target.shape=='circle')
    var elementData = d3.select(this)[0][0].__data__;
    layoutHandler.setURLHashParams({fqName:elementData['orgDest'],srcVN:elementData['orgSrc']},{p:'mon_net_networks',merge:false});
 }
 function isCurrentNode(id) {
     var result = false;
     if(layoutHandler.getURLHashParams()['fqName'] == id)
         result = true;
     return result;
 }
 




