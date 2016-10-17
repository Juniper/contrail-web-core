/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore', 'contrail-view'], function(_, ContrailView){
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
                self.$el.find(".carousel-control-cover-left-story").show();
                self.$el.find(".carousel-control-cover-left").addClass('carousel-control-cover-height');
            }else if(self.nextTitle){
                self.$el.find(".carousel-control-cover-right-story").show();
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
            self.renderView4Config(self.viewPlaceHolder,  model, page);
        }else{
            var slideDirection = ['left','right'];

            if(direction === 'prev')
                slideDirection = ['right','left'];

            $("div.carousel-content").hide("slide", { direction: slideDirection[0] }, 800, function() {
                self.$el.find(".carousel-content").remove();
                self.$el.find(".carousel-inner").append($('<div class="carousel-content">'));
                $("div.carousel-content").show("slide", { direction: slideDirection[1] }, 300, function(){
                   self.renderView4Config(self.$el.find('.carousel-content'),  model, page, null, null, null, function(){
                       self.prevIndex = self.currIndex;
                   });
                });
            });
        }
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
                self.prevTitle = getTitle(self.viewList[currIndex + 1].page);//self.viewList[currIndex + 1].title;
                self.nextTitle = self.prevTitle;
            }else{
                self.prevTitle = getTitle(self.viewList[currIndex - 1].page);//self.viewList[currIndex - 1].title;
                self.nextTitle = self.prevTitle;
            }
        }else{
            if(currIndex === 0){
                self.prevTitle = getTitle(self.viewList[self.lastIndex - 1].page);//self.viewList[self.lastIndex - 1].title;
                self.nextTitle = getTitle(self.viewList[currIndex + 1].page);//self.viewList[currIndex + 1].title;
            }else if(currIndex === (self.lastIndex - 1)){
                self.prevTitle = getTitle(self.viewList[currIndex - 1].page);//self.viewList[currIndex - 1].title;
                self.nextTitle = getTitle(self.viewList[0].page);//self.viewList[0].title;
            }else{
                self.prevTitle = getTitle(self.viewList[currIndex + 1].page);//self.viewList[currIndex + 1].title;
                self.nextTitle = getTitle(self.viewList[currIndex - 1].page);//self.viewList[currIndex - 1].title;
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
                title = getGridStackViewTitles(view.viewConfig.widgetCfgList);
                break;
            }
        }

        return title;
    }

    function getGridStackViewTitles(listArr){
        var title = [],
            lstIdx = 0,
            lstLen = listArr.length;
        for(lstIdx = 0; lstIdx < lstLen; lstIdx++){
            if(getValueByJsonPath(listArr[lstIdx],'itemAttr;title',null))
                title.push(listArr[lstIdx].itemAttr.title);
        }
        return title.toString().split(',').join(', ');
    }

    return CarouselView;
});