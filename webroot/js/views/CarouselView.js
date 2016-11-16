/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore', 'contrail-view', 'widget-configmanager'], function(_, ContrailView, widgetConfigManager){
    var CarouselView = ContrailView.extend({
        render: function(){
            var self = this,
                viewConfig = self.attributes.viewConfig,
                carouselTemplate = contrail.getTemplate4Id("carousal-view-template");

            self.viewList = viewConfig.pages;
            self.viewPlaceHolder = {};
            self.prevIndex = 0;
            self.prevTitle = null,
            self.currIndex = 0;
            self.nextTitle = null,
            self.lastIndex = viewConfig.pages.length;

            self.$el.html(carouselTemplate({pages:self.viewList}));
            self.viewPlaceHolder = self.$el.find(".carousel-content");
            activateView(self, self.currIndex, false);
            if(self.lastIndex === 1){
                self.$el.find(".carousel-control-cover-left").hide();
                self.$el.find(".carousel-control-cover-right").hide();
                self.$el.find(".carousel-indicators").hide();
            }
        },

        clickHandler: function(ev){
            var self = this,
                currReq = ev.target.id;

            if(currReq === 'prev' || currReq === 'next'){
                self.slide(null, currReq);
            }else{
                self.slide(parseInt(currReq), null);
            }
        },

        showPageTitle: function(ev){
            var self = this,
                currReq = ev.target.id;

            hideTitleCover(self.$el);
            if(currReq === 'prev' && self.prevTitle){
                self.$el.find(".carousel-control-cover-left-story").css('display','block');
                self.$el.find(".carousel-control-cover-left-story").css('display','-webkit-box');
                self.$el.find(".carousel-control-cover-left").addClass('carousel-control-cover-height');
            }else if(currReq === 'next' && self.nextTitle){
                self.$el.find(".carousel-control-cover-right-story").css('display','block');
                self.$el.find(".carousel-control-cover-right-story").css('display','-webkit-box');
                self.$el.find(".carousel-control-cover-right").addClass('carousel-control-cover-height');
            }
        },

        hidePageTitle: function(ev){
            var self = this,
            currReq = ev.target.id;
            hideTitleCover(self.$el);
        },

        slide: function(index, direction){
            var self = this;

            if(direction && !index){
                if(direction === 'prev'){
                    self.currIndex = self.currIndex - 1;
                    if(self.currIndex < 0){
                        self.currIndex = self.lastIndex - 1;
                    }
                }else{
                    self.currIndex = self.currIndex + 1;
                    if(self.currIndex >= self.lastIndex){
                        self.currIndex = 0;
                    }
                }
            }else{
                if(index < self.currIndex){
                    direction = 'prev';
                }else{
                    direction = 'next';
                }
                self.currIndex = index;
            }
            hideTitleCover(self.$el);
            if(self.prevIndex != self.currIndex){
                activateView(self, self.currIndex, true, direction);
            }
        },

        events: {
            'click .custom-carousel-control-left': 'clickHandler',
            'click .custom-carousel-control-right': 'clickHandler',
            'click .carousel-indicators li': 'clickHandler',
            'mouseenter .carousel-control-cover': 'showPageTitle',
            'mouseenter .carousel-inner': 'hidePageTitle'
        }
    });

    function activateView(self, index, doAnimate, direction){
        var page = self.viewList[index].page,
            model = ifNull(self.viewList[index].model, '');

        toggleCarouselIndicator(self.currIndex, self.prevIndex);
        setTitleCover(self, index);
        if(!doAnimate){
           renderView(self, page, model);
        }else{
            var slideDirection = ['left','right'];

            if(direction === 'prev')
                slideDirection = ['right','left'];

            $("div.carousel-content").hide("slide", { direction: slideDirection[0] }, 800, function() {
                self.$el.find(".carousel-content").remove();
                self.$el.find(".carousel-inner").append($('<div class="carousel-content">'));
                $("div.carousel-content").show("slide", { direction: slideDirection[1] }, 300, function(){
                    renderView(self, page, model);
                });
            });
        }
    }

    function renderView(self, page, model){
        if(self.widCfg && Object.keys(self.widCfg).length > 0){
            page.viewConfig.movedWidgetCfg = $.extend({}, self.widCfg);
            self.widCfg = {};
        }else if(!self.widCfg || Object.keys(self.widCfg).length === 0){
            page.viewConfig.movedWidgetCfg = null;
        }
        self.renderView4Config(self.$el.find('.carousel-content'),  model, page, null, null, null, function(){
            self.prevIndex = self.currIndex;
            if(self.lastIndex > 1){
                var grid = self.$el.find('.grid-stack').data('grid-stack-instance');
                self.$el.find('.grid-stack').on('dragstart', function(event, ui){
                    gridStackDragHandler(event, ui, grid, self)
                });
            }
           /* self.$el.find('.grid-stack').on('dragstop', function(event, ui){
                console.log("DONE DROPPING");
            });*/
            /*if(self.draggedChild && Object.keys(self.draggedChild).length > 0){
                //self.draggedChild._grid = grid;
                grid.addWidget(self.draggedChild);
                grid._updateContainerHeight();
                grid.endUpdate();

                //var node= $(self.draggedChild).data('_gridstack_node');
                //node._grid = grid;
                //grid.grid.beginUpdate(node);
                //grid._updateContainerHeight();
                //grid._triggerChangeEvent();
                //grid.endUpdate();
                self.draggedChild = null;
                var el = $(self.draggedChild);
                el.selector = "";
                el.context = null;
                grid.addWidget(el)
            }*/
            /*grid.container.draggable({
                accept: ".grid-stack-item",
                //tolerance: 'pointer',
                start: function( event, ui ) {
                    console.log("**** DRAG!!!");
                    console.log(ui,'\n', ui.position);
                }
            });
            grid.container.droppable({
                accept: ".grid-stack-item",
                //tolerance: 'pointer',
                drop: function( event, ui ) {
                    console.log("**** DROPPED!!!");
                    return false;
                }
           });*/
        });
    }

    function toggleCarouselIndicator(index, prevIndex){
        $(".carousel-indicators li#"+prevIndex).removeClass('active');
        $(".carousel-indicators li#"+index).addClass('active');
    }

    function hideTitleCover(el){
        el.find(".carousel-control-cover-left").removeClass('carousel-control-cover-height');
        el.find(".carousel-control-cover-right").removeClass('carousel-control-cover-height');
        el.find(".carousel-control-cover-left-story").hide();
        el.find(".carousel-control-cover-right-story").hide();
    }

    function setTitleCover(self, currIndex){
        if(self.lastIndex === 1){
            self.prevTitle = self.viewList[currIndex].title;
            right = self.viewList[currIndex].title;
        }else if(self.lastIndex === 2){
            if(currIndex === 0){
                self.prevTitle = getTitle(self.viewList[currIndex + 1].page);
                self.nextTitle = self.prevTitle;
            }else{
                self.prevTitle = getTitle(self.viewList[currIndex - 1].page);
                self.nextTitle = self.prevTitle;
            }
        }else{
            if(currIndex === 0){
                self.prevTitle = getTitle(self.viewList[self.lastIndex - 1].page);
                self.nextTitle = getTitle(self.viewList[currIndex + 1].page);
            }else if(currIndex === (self.lastIndex - 1)){
                self.prevTitle = getTitle(self.viewList[currIndex - 1].page);
                self.nextTitle = getTitle(self.viewList[0].page);
            }else{
                self.prevTitle = getTitle(self.viewList[currIndex - 1].page);
                self.nextTitle = getTitle(self.viewList[currIndex + 1].page);
            }
        }
        self.$el.find(".carousel-control-cover-left-story").html(self.prevTitle);
        self.$el.find(".carousel-control-cover-right-story").html(self.nextTitle);
    }

    function getTitle(view){
        var viewType = view.view,
            title = null;

        switch(viewType){
            case 'GridStackView': {
                title = getGridStackViewTitles(view.viewConfig);
                break;
            }
        }

        return title;
    }

    function getGridStackViewTitles(viewConfig) {
        var widgetCfgList;
        if(localStorage.getItem(viewConfig['elementId']) != null) {
            var serializedData = localStorage.getItem(viewConfig['elementId']);
            widgetCfgList = JSON.parse(serializedData);
        }
        var title = [],
            lstIdx = 0,
            listArr = ifNull(widgetCfgList,viewConfig.widgetCfgList);
            lstLen = listArr.length;
        for(lstIdx = 0; lstIdx < lstLen; lstIdx++){
            var currWidgetCfg = widgetConfigManager.get(listArr[lstIdx]['id'])();
            if(getValueByJsonPath(currWidgetCfg,'itemAttr;title',null))
                title.push(currWidgetCfg.itemAttr.title);
        }
        return title.toString().split(',').join('<br>');
    }

    function gridStackDragHandler(event, ui, grid, self){
        var element = event.target,
            containerLeft = self.$el.find(".carousel-inner").offset().left,
            containerRight = containerLeft + self.$el.find(".carousel-inner").outerWidth();

        $('.grid-stack-item').on('drag', function(event, ui){
            var link =  $(this),
                position = link.position(),
                elLeft = position.left,
                elRight = $(window).width() - elLeft - link.width(),
                changeAndAdd = function(widget, dir){
                    self.widCfg = $(widget).data('data-cfg');
                    grid.gridStack.removeWidget(widget);
                    grid.saveGrid();
                    self.slide(null, dir);
                };

            console.log(
                    ' UI LEFT POSITION: ',  elLeft, 
                    ' UI RIGHT POSITION: ', elRight);

            if(elLeft < -40){
                changeAndAdd(this,'prev');
            }

            if(elRight <= 10){
                changeAndAdd(this,'next');
            }
        });
    }

    return CarouselView;
});
//http://alangunning.github.io/gridstack.js/demo/multiple-grids.html
//http://troolee.github.io/gridstack.js/demo/two.html