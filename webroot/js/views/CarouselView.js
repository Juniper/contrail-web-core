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
            self.currIndex = 0;
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
            if(self.prevIndex != self.currIndex){
                activateView(self, self.currIndex, true, direction);
            }
        },

        events: {
            'click .custom-carousel-control-left': 'clickHandler',
            'click .custom-carousel-control-right': 'clickHandler',
            'click .carousel-indicators li': 'clickHandler'
        }
    });

    function activateView(self, index, doAnimate, direction){
        var page = self.viewList[index].page,
            model = ifNull(self.viewList[index].model, '');

        toggleCarouselIndicator(self.currIndex, self.prevIndex);
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

    return CarouselView;
});