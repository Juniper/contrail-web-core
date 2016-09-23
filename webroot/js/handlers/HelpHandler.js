/*
 * Copyright (c) 2016 Juniper Networks, Inc.
 * All rights reserved.
 */

define(["lodash"], function (_) {
    var HelpHandler = function() {
        var $ = window.jQuery || null;
        if($ === null) return;

        var self = this;

        self.settings = {
            icon: "fa fa-question",
            section_url: getSectionUrl
        };

        var ie_fix = document.all && !window.atob;//ie9 and below need a little fix

        var section_start = {}, section_rect = {},
            section_count = 0;

        var created = false, active = false;

        var ovfx = "";
        var help_container = null,
            helpAvailable = false,
            helpHashMap = ["query_flow_series"];

        var mbody = null;
        var maxh = 0;
        var help_modal = null;

        this.toggle = function() {
            if(active) {
                self.disable();
            } else {
                self.enable();
            }
        };

        this.enable = function() {
            if (active) {
                return;
            }

            if (enableHelpSections()) {
                $(".page-help-backdrop, .page-help-section").removeClass("hidden");
                ovfx = document.body.style.overflowX;
                document.body.style.overflowX = 'hidden';//hide body:overflow-x
                captureFocus();
                $("#page-help-toggle-btn").parent().addClass('active');
            }
        };

        this.disable = function() {
            if (!active) {
                return;
            }

            active = false;
            $(".page-help-backdrop, .page-help-section").addClass("hidden");
            $("#page-help-toggle-btn").parent().removeClass("active");
            document.body.style.overflowX = ovfx;//restore body:overflow-x
            releaseFocus();
        };

        this.init = function() {
            if( created ) {
                return;
            }

            displayPageHelpLink();

            help_container =
                $('<div id="page-help-container" class="page-help-container" tabindex="-1" />')
                    .appendTo("body");

            help_container.append('<div class="page-help-backdrop hidden" />');

            // update to correct position and size
            $(window).on("resize.onpage_help", function() {
                if(!active) return;

                if (enableHelpSections()) {
                    if (!_.isNull(help_modal) && help_modal.hasClass("in")) {
                        setBodyHeight();
                        disableBodyScroll();
                    }
                }
            });

            created = true;

            $(document).on('click', "#page-help-toggle-btn", function (event) {
                event.preventDefault();
                self.toggle();
            });

            $(document).on('click', '.page-help-backdrop', function(e) {
                if (this.hidden == false) {
                    self.disable();
                }
            });

            $(window).on("hashchange", function () {
                displayPageHelpLink();
            });
        };

        function captureFocus() {
            if(!help_container) return;
            var scroll = -1;
            //like bootstrap modal
            $(document)
                .off('focusin.ace.help') //remove any previously attached handler
                .on('focusin.ace.help', function (e) {

                    if(e.target == document && scroll > -1) {
                        //when window regains focus and container is focused, it scrolls to bottom
                        //so we put it back to its place
                        $('body,html').scrollTop(scroll);
                        scroll = -1;
                    }
                });

            $(window).on('blur.ace.help', function(){
                scroll = $(window).scrollTop();
            });
        }

        function releaseFocus() {
            $(document).off('focusin.ace.help');
            $(window).off('blur.ace.help');
        }

        function enableHelpSections() {
            saveSections();

            if (helpAvailable === true) {
                active = true;
                displayHelpSections();
                return true;
            } else {
                return false;
            }
        }

        function displayHelpSections() {
            if (!active) {
                return;
            }

            for (var name in section_start) {
                if (section_start.hasOwnProperty(name)) {
                    saveSectionOffset(name);
                }
            }
            for (var name in section_start) {
                if (section_start.hasOwnProperty(name)) {
                    highlightSection(name);
                }
            }

        }

        function saveSections(reset) {
            if( !(reset === true || section_count == 0) ) {
                return;
            }
            if(reset === true) {
                help_container.find('.page-help-section').remove();
            }

            section_start = {};
            section_count = 0;

            //find all relevant elements
            var domElements = $('*').contents().filter(function(){ return this.nodeType == 1 /*1=element node*/ });
            var divEle = domElements.filter(function(){ return (this.nodeName == "DIV" || this.nodeName == "LI")});

            helpAvailable = false;

            $(divEle).each(function() {
                if (this.dataset && this.dataset.help && this.dataset.help.trim() !== "") {
                    section_start[this.dataset.help.trim()] = this;
                    helpAvailable = true;
                }
            });
        }

        function displayPageHelpLink() {
            var currentHash = cowhu.getState();

            if (_.indexOf(helpHashMap, currentHash.p) >= 0) {
                $("#page-help").showElement();
            } else {
                $("#page-help").hideElement();
            }
        }

        function saveSectionOffset(name) {
            if( !(name in section_start) ) return;

            var x1, y1, width, height;
            var ele = section_start[name];

            var eleOffset = $(ele).offset();

            x1 = eleOffset.left;
            y1 = eleOffset.top;
            width = ele.offsetWidth;
            height = ele.offsetHeight;

            section_rect[name] = {
                'left': x1,
                'top': y1,
                'width': width,
                'height': height
            }
        }

        function highlightSection(name) {
            if( !(name in section_rect) || !help_container ) return;

            //div is the highlighted box above each section
            var div = help_container.find('.page-help-section[data-section="'+name+'"]').eq(0);
            if(div.length == 0)	{
                div = $('<a class="page-help-section" href="#" />').appendTo(help_container);
                if(ie_fix) div.append('<span class="ie-hover-fix" />');

                if(self.settings.icon) div.append('<i class="help-icon-1 '+self.settings.icon+'"></i>');

                div.attr('data-section', name);

                div.on('click', function(e) {
                    e.preventDefault();
                    launchHelpModal(name);
                });
            }

            var rect = section_rect[name];
            if(rect['is_hidden'] === true) {
                div.addClass('hidden');
                return;
            }

            div.css({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            });


            div.removeClass('hidden');
            div.removeClass('help-section-small help-section-smaller');
            if(rect.height < 55 || rect.width < 55) {
                div.addClass('help-section-smaller');
            }
            else if(rect.height < 75 || rect.width < 75) {
                div.addClass('help-section-small');
            }
        }

        function disableBodyScroll() {
            if (!mbody) return;

            var body = mbody[0];
            var disableScroll = body.scrollHeight <= body.clientHeight;

            //mousewheel library available?
            var mousewheel_event = !!$.event.special.mousewheel ? 'mousewheel.ace.help' : 'mousewheel.ace.help DOMMouseScroll.ace.help';

            mbody.parent()
                .off(mousewheel_event)
                .on(mousewheel_event, function(event) {
                    if(disableScroll) event.preventDefault();
                    else {
                        event.deltaY = event.deltaY || 0;
                        var delta = (event.deltaY > 0 || event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) ? 1 : -1

                        if(delta == -1 && body.scrollTop + body.clientHeight >= body.scrollHeight) event.preventDefault();
                        else if(delta == 1 && body.scrollTop <= 0) event.preventDefault();
                    }
                });
        }

        function setBodyHeight() {
            if (!mbody) return;

            var diff = parseInt(help_modal.find('.modal-dialog').css('margin-top'));
            diff = diff + 110 + parseInt(diff / 2);
            maxh = parseInt( $(window).innerHeight() - diff + 40 );
            mbody.css({'max-height': maxh});
        }

        function launchHelpModal(section_name) {
            var url;

            //check if it is an external url
            if (section_name.match(/www/)) {
                window.open(section_name);
            } else {

                if (typeof self.settings.section_url === 'function') {
                    url = self.settings.section_url.call(self, section_name);
                }

                $.ajax({url: url, dataType: 'text'})
                    .done(function (result) {
                        //find the title for this dialog by looking for a tag that has data-id attribute
                        var title = $(result)[3].innerHTML;

                        cowu.createModal({
                            'modalId': 'helpModal', 'className': 'modal modal-840', 'title': title, 'body': result
                        });

                    })
                    .fail(function () {
                        help_modal.find('.modal-title').find('.fa-spin').remove().end().find('.hidden').children().unwrap();
                    });
            }
        }

        function getSectionUrl(section_name) {
            return '/docs/' + section_name + '.html';
        }
    };

    return new HelpHandler();
});
