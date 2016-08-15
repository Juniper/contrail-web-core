/*
 * Copyright (c) 2016 Juniper Networks, Inc.
 * All rights reserved.
 */

define(['underscore'], function (_) {
    var HelpHandler = function() {
        var $ = window.jQuery || null;
        if($ == null) return;

        var defaults = {
            include_all: true,
            icon_1: 'fa fa-question',
            icon_2: 'fa fa-lightbulb-o',
            base: '',
            code_highlight: (!!window.Rainbow ? 'rainbow' : (!!window.Prism ? 'prism' : null)),

            add_panels: true,
            panel_content_selector: '.info-section',
            panel_content_title: '.info-title',

            section_url: getSectionUrl,
            before_enable: beforeEnableHelp,
            after_disable: afterDisableHelp
        };

        this.settings = $.extend({}, defaults);

        var $base = this.settings['base'];
        var ie_fix = document.all && !window.atob;//ie9 and below need a little fix

        var section_start = {};
        var section_end = {};
        var section_rect = {};
        var section_count = 0;

        var created = false;
        var active = false;

        var self = this, _ = this;
        var ovfx = '';
        var help_container = null;

        var body_h, body_w;

        var captureFocus = function() {
            if(!help_container) return;
            var scroll = -1;
            //like bootstrap modal
            $(document)
                .off('focusin.ace.help') //remove any previously attached handler
                .on('focusin.ace.help', function (e) {
                    // if (!( help_container[0] == e.target || $.contains(help_container[0], e.target) )) {
                    //     help_container.focus();
                    // }

                    if(e.target == document && scroll > -1) {
                        //when window regains focus and container is focused, it scrolls to bottom
                        //so we put it back to its place
                        $('body,html').scrollTop(scroll);
                        scroll = -1;
                    }
                })

            $(window).on('blur.ace.help', function(){
                scroll = $(window).scrollTop();
            });
        }

        var releaseFocus = function() {
            $(document).off('focusin.ace.help');
            $(window).off('blur.ace.help');
        }

        this.toggle = function() {
            if(active) {
                self.disable();
            }
            else {
                self.enable();
            }
        }

        this.enable = function() {
            if(active) return;
            if(typeof _.settings.before_enable === 'function' && _.settings.before_enable.call(self) === false) return;
            active = true;
            $('.page-help-backdrop, .page-help-section').removeClass('hidden');
            ovfx = document.body.style.overflowX;
            document.body.style.overflowX = 'hidden';//hide body:overflow-x
            display_help_sections();
            captureFocus();
            if(typeof _.settings.after_enable === 'function') _.settings.after_enable.call(self);
        }

        this.disable = function() {
            if(!active) return;
            if(typeof _.settings.before_disable === 'function' && _.settings.before_disable.call(self)) return;
            active = false;
            $('.page-help-backdrop, .page-help-section').addClass('hidden');

            document.body.style.overflowX = ovfx;//restore body:overflow-x
            releaseFocus();
            if(typeof _.settings.after_disable === 'function') _.settings.after_disable.call(self);
        }

        this.is_active = function() {
            return active;
        };

        this.show_section_help = function(section) {
            launch_help_modal(section, true);
        };

        this.init = function() {
            if( created ) return;

            help_container =
                $('<div id="page-help-container" class="page-help-container" tabindex="-1" />')
                    .appendTo('body');

            help_container.append('<div class="page-help-backdrop hidden" />')

            //update to correct position and size
            $(window).on('resize.onpage_help', function() {
                if(!active) return;
                display_help_sections();

                if( help_modal != null && help_modal.hasClass('in') ) {
                    setBodyHeight();
                    disableBodyScroll();
                }
            });

            created = true;
        };

        this.init();//create once at first

        this.update_sections = function() {
            save_sections(true);//reset sections, maybe because of new elements and comments inserted into DOM
        };

        function display_help_sections() {
            if(!active) return;

            save_sections();//finds comments and relevant help sections

            body_h = document.body.scrollHeight - 2;
            body_w = document.body.scrollWidth - 2;

            //we first calculate all positions
            //because if we calculate one position and then make changes to DOM,
            //next position calculation will become slow on Webkit, because it tries to re-calculate layout changes and things
            //i.e. we batch call all and save offsets and scrollWidth, etc and then use them later in highlight_section
            //Firefox doesn't have such issue
            for(var name in section_start) {
                if(section_start.hasOwnProperty(name)) {
                    save_section_offset(name);
                }
            }
            for(var name in section_start) {
                if(section_start.hasOwnProperty(name)) {
                    highlight_section(name);
                }
            }
        }

        //finds comments and relevant help sections
        function save_sections(reset) {
            if( !(reset === true || section_count == 0) ) return;//no need to re-calculate sections, then return
            if(reset === true) help_container.find('.page-help-section').remove();

            section_start = {};
            section_end = {};
            section_count = 0;

            var count1 = 0, count2 = 0;

            //find all relevant elements
            var domElements = $('*').contents().filter(function(){ return this.nodeType == 1 /*1=element node*/ });
            var divEle = domElements.filter(function(){ return (this.nodeName == "DIV" || this.nodeName == "LI")});
            var flag = 0;
            $(divEle).each(function() {
                //there is a help
                if (this.dataset) {
                    if (this.dataset.help) {
                        var helpUrl = this.dataset.help;
                        var trimmedUrl = helpUrl.trim();
                        //the help url is not blank
                        if (trimmedUrl != "") {
                            flag = 1; //meaning atleast one helpSection is found
                            section_start[trimmedUrl] = this;
                        }
                    }
                }
            });

            if (flag == 0) {
                $(".page-help-toggle-container").hide();
            }
            if (flag == 1) {
                $(".page-help-toggle-container").show();
            }
        }

        function save_section_offset(name) {
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

        function highlight_section(name) {
            if( !(name in section_rect) || !help_container ) return;

            //div is the highlighted box above each section
            var div = help_container.find('.page-help-section[data-section="'+name+'"]').eq(0);
            if(div.length == 0)	{
                div = $('<a class="page-help-section" href="#" />').appendTo(help_container);
                if(ie_fix) div.append('<span class="ie-hover-fix" />');

                if(_.settings.icon_1) div.append('<i class="help-icon-1 '+_.settings.icon_1+'"></i>');
                if(_.settings.icon_2) div.append('<i class="help-icon-2 pull-right '+_.settings.icon_2+'"></i>');

                div.attr('data-section', name);

                div.on('click', function(e) {
                    e.preventDefault();
                    launch_help_modal(name);
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

        var nav_list = [];
        var nav_pos = -1;
        var mbody = null;
        var maxh = 0;
        var help_modal = null;

        //disable body scroll, when modal content has no scrollbars or reached end of scrolling
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

        function launch_help_modal(section_name, save_to_list) {

            //check if it is an external url
            if (section_name.match(/www/)) {
                window.open(section_name);
            }

            else {

                if (typeof _.settings.section_url === 'function') url = _.settings.section_url.call(self, section_name);

                $.ajax({url: url, dataType: 'text'})
                    .done(function (result) {
                        //find the title for this dialog by looking for a tag that has data-id attribute
                        var title = '', excerpt = '';

                        title = $(result)[3].innerHTML;

                        cowu.createModal({
                            'modalId': 'helpModal', 'className': 'modal modal-840', 'title': title, 'body': result
                        });

                    })
                    .fail(function () {
                        help_modal.find('.modal-title').find('.fa-spin').remove().end().find('.hidden').children().unwrap();
                    });
            }//end of else - means it is internal link and modal is needed
        }//launch_help_modal

        $(document).on('click', '.help-more', function(e) {
            e.preventDefault();
            var href = $(this).attr('href');
            launch_help_modal(href);
        });
    };

    function beforeEnableHelp() {
        $('#btn-scroll-up').css('z-index', 1000000);//bring btn-scroll-up  higher , to be over our help area

        //now disable fixed navbar, which automatically disabled fixes sidebar and breadcrumbs
        try {
            ace.settingFunction.navbar_fixed(null, false, false);
        } catch (ex) {
        }
    };

    function afterDisableHelp() {
        $('#btn-scroll-up').css('z-index', '');
    };

    function getSectionUrl(section_name) {
        return '/docs/' + section_name + '.html';
    };

    return HelpHandler;
});