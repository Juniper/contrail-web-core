/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  "lodash",
  "contrail-view",
], function(_, ContrailView) {
  var BSPopoverClass = "popover",
    BSPopoverSelector = "." + BSPopoverClass;

  // A global focusout event handler used by TabView's popover
  // This will only be registered once, since each module will only be loaded once
  $(document).on("focusout.tabview.popover", BSPopoverSelector, function(event) {
    var $from = $(event.target),
      $to = $(event.relatedTarget),
      $popover = $from.hasClass(BSPopoverClass) ? $from : $from.closest(BSPopoverSelector);

    if (!$to || (!$to.hasClass(BSPopoverClass) && $to.closest(BSPopoverSelector).length === 0)) {
      var popoverDataObj = $popover.data("bs.popover");
      if (_.isEmpty(popoverDataObj)) return;
      var $trigger = popoverDataObj.$element;

      if (!$to.is($trigger)) {
        $trigger.popover("hide");
        // A hot fix due to known Bootstrap Popover issue,
        // More info: https://github.com/twbs/bootstrap/issues/16732
        popoverDataObj.inState.click = false;
      }
    }
  });

  var TabsView = ContrailView.extend({
    selectors: {
      tabEdit: ".contrail-tab-link-list .tab-edit-btn",
      linkList: ".contrail-tab-link-list",
      addBlock: ".contrail-tab-link-list .tab-add",
      editTitle: ".contrail-tab-link-list .tab-add .title-edit",
      editTitleInput: ".contrail-tab-link-list .tab-add .title-edit > input",
      addLink: ".contrail-tab-link-list .tab-add .link",
      titleEdit: ".popover .tab-menu input.title-updated",
      tabPanel: ".ui-tabs-panel",
    },

    events: {
      "click .contrail-tab-link-list .tab-add .link": "_onClickAdd",
      "click .contrail-tab-link-list .contrail-tab-link-icon-remove": "_onClickRemove",
      "click .contrail-tab-link-list .tab-menu .title-save": "_onEdit",
      "keypress .contrail-tab-link-list .tab-menu .title-updated": "_onKeyPressedToEdit",
      "blur .contrail-tab-link-list .tab-add .title-edit > input": "_onAdd",
      "keypress .contrail-tab-link-list .tab-add .title-edit > input": "_onKeyPressedToAdd",
    },

    initialize: function () {
      /**
       * Note: Current TabsView implementation keeps the same elementId for the container.
       * Todo: cleanup the TabsView implementation. Remove duplicate elementId. styles
       */
      this.selectors.tabs = "#" + this.attributes.elementId;
    },

    render: function() {
      var self = this,
        viewConfig = self.attributes.viewConfig,
        elId = self.attributes.elementId,
        tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
        tabHashUrlObj = window.layoutHandler.getURLHashParams().tab,
        activeTab = contrail.handleIfNull(viewConfig.active, 0);

      // Array of tab view configs
      self.tabs = viewConfig.tabs;
      self.activateTimeout = null;

      self.$el.html(tabsTemplate({
        elementId: elId,
        tabs: self.tabs,
        extraLinks: viewConfig.extra_links,
        extendable: viewConfig.extendable,
        editable: viewConfig.editable,
      }));

      $.each(self.tabs, function(tabIndex, tabConfig) {
        /*
         * Setting activeTab if set in the URL params
         */
        if (contrail.checkIfExist(tabHashUrlObj) &&
          contrail.checkIfExist(tabHashUrlObj[elId]) &&
            tabHashUrlObj[elId] === tabConfig[cowc.KEY_ELEMENT_ID]) {
              activeTab = tabIndex;
            }

        if (contrail.checkIfKeyExistInObject(true, tabConfig, "tabConfig.renderOnActivate")
          && tabConfig.tabConfig.renderOnActivate === true) {
            tabConfig._rendered = false;
          } else {
            self.renderTab(tabConfig);
          }
      });

      $(self.selectors.tabs).contrailTabs({
        active: activeTab,
        activate: function(event, ui) {
          var tabIndex = ui.newTab.index(),
            tabHashUrlObj = {};

            /*
             * Execute activate if defined in viewConfig or tabConfig
             */
          if (_.isFunction(viewConfig.activate)) {
            // TODO bind activate function with current tab
            // current element will be available as "this" context
            viewConfig.activate(event, ui);
          }

          if (contrail.checkIfExist(self.tabs[tabIndex].tabConfig)
            && _.isFunction(self.tabs[tabIndex].tabConfig.activate)) {
              self.tabs[tabIndex].tabConfig.activate(event, ui);
            }

            /*
             * Setting activeTab to the url on activate
             */

          if (self.activateTimeout !== null) {
            clearTimeout(self.activateTimeout);
          }

          self.activateTimeout = setTimeout(function() {
            if (contrail.checkIfExist(self.tabs[tabIndex])
              && contrail.checkIfExist(self.tabs[tabIndex].elementId)) {
                tabHashUrlObj[elId] = self.tabs[tabIndex].elementId;
              }
            window.layoutHandler.setURLHashParams({ tab: tabHashUrlObj }, { triggerHashChange: false });

            self.activateTimeout = null;
          }, 300);
        },

        beforeActivate: function(event, ui) {
          var tab = self.tabs[ui.newTab.index()];

          if (!tab._rendered) self.renderTab(tab);
        },

        create: function(event, ui) {
          var tab = self.tabs[ui.tab.index()];

          if (!tab._rendered) self.renderTab(tab);
        },

        theme: viewConfig.theme,
      });

    },

    _initTabMenu: function(tab) {
      var self = this;
      var tabMenuTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_MENU_VIEW),
        $tabEdit = this.$("#" + tab.elementId + "-tab-link").siblings(this.selectors.tabEdit);

      $tabEdit.on("shown.bs.popover", this._onPopoverShow.bind(self));
      $tabEdit.popover({
        placement: "bottom",
        trigger: "click",
        html: true,
        content: function() {
          return tabMenuTemplate(tab.title);
        },
      });
    },

    getTabIndex: function(id) {
      var self = this;
      var $li = self.$("li[aria-controls=" + id + "]");
      return $li.index();
    },

    removeTab: function(tabIndex) {
      var self = this;
      var elId = self.attributes.elementId;
      var tab = self.tabs[tabIndex];
      if (!tab) return;

      if ($.isArray(tabIndex)) {
        for (var i = 0; i < tabIndex.length; i++) {
          self.removeTab(tabIndex[i]);
        }
        return;
      }

      var panelId = self.$("#" + elId + " li:eq(" + tabIndex + ")").attr("aria-controls");

      self.$(self.selectors.tabs + " li:eq(" + tabIndex + ")").remove();
      $("#" + panelId).remove();
      self.tabs.splice(tabIndex, 1);
      self.$(self.selectors.tabs).data("contrailTabs").refresh();

      if (self.tabs.length === 0 && !self.attributes.viewConfig.extendable) {
        self.$(self.selectors.tabs).hide();
      }

      if (tab.tabConfig && contrail.checkIfFunction(tab.tabConfig.onRemoveTab)) {
        tab.tabConfig.onRemoveTab();
      }
    },

    renderTab: function(tab, onAllViewsRenderComplete) {
      var self = this,
        validation = self.attributes.validation,
        lockEditingByDefault = self.attributes.lockEditingByDefault,
        modelMap = self.modelMap,
        childElId = tab[cowc.KEY_ELEMENT_ID];
      tab._rendered = true;

      self.$(self.selectors.tabs).show();

      self.renderView4Config(self.$("#" + childElId), tab.model || self.model, tab,
        validation, lockEditingByDefault, modelMap,
        function(renderedBackboneView) {
          self._initTabMenu(tab);
          if (_.isFunction(onAllViewsRenderComplete)) {
            onAllViewsRenderComplete(renderedBackboneView);
          }
        });
    },

    renderNewTab: function(elId, tabViewConfigs, activateTab, modelMap, onAllViewsRenderComplete) {
      var self = this,
        tabLinkTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_LINK_VIEW),
        tabContentTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_CONTENT_VIEW),
        newIndex = self.tabs.length,
        activateTabIndex,
        tabsRefreshed = false;

      self.modelMap = modelMap;

      _.each(tabViewConfigs, function(tabViewConfig) {
        var tabIndex = _.findIndex(self.tabs, function (tab) { return tab.elementId === tabViewConfig.elementId; });

        if (tabIndex >= 0) {
          // activate existing tab
          self.$(self.selectors.tabs).data("contrailTabs").activateTab(tabIndex);
        } else {
          self.$(self.selectors.linkList).append(tabLinkTemplate([tabViewConfig]));
          self.$(self.selectors.tabs).append(tabContentTemplate([tabViewConfig]));
          self.tabs.push(tabViewConfig);

          if (tabViewConfig.tabConfig != null && tabViewConfig.tabConfig.editable) {
            newIndex = _.sortedIndex(_.without(self.tabs, tabViewConfig), tabViewConfig, self._tabSortIteratee);
            tabsRefreshed = self.moveTab(self.tabs.length - 1, newIndex);
          }
          if (!tabsRefreshed) self.$(self.selectors.tabs).data("contrailTabs").refresh();

          if (contrail.checkIfKeyExistInObject(true, tabViewConfig, "tabConfig.renderOnActivate") &&
            tabViewConfig.tabConfig.renderOnActivate === true) {
              tabViewConfig._rendered = false;
              // TODO - onAllViewsRenderComplete should be called when rendered
            } else {
              self.renderTab(tabViewConfig, onAllViewsRenderComplete);
            }

          if (activateTab === true) {
            activateTabIndex = newIndex;
          } else if (_.isNumber(activateTab)) {
            activateTabIndex = activateTab;
          }
          if (!_.isUndefined(activateTabIndex)) {
            self.$(self.selectors.tabs).data("contrailTabs").activateTab(activateTabIndex);
          }
        }
      });
    },
    // Move tab by indexes
    moveTab: function (from, to) {
      var self = this;
      if (from === to) return false;

      var links = self.$(self.selectors.linkList + " li");
      links.detach();
      var panels = self.$(self.selectors.tabs + "> div");
      links.splice(to, 0, links.splice(from, 1)[0]);
      panels.splice(to, 0, panels.splice(from, 1)[0]);
      panels.detach();
      self.$(self.selectors.linkList).append(links);
      self.$(self.selectors.tabs).append(panels);

      self.tabs.splice(to, 0, self.tabs.splice(from, 1)[0]);
      self.$(self.selectors.tabs).data("contrailTabs").refresh();
      return true;
    },

    _onKeyPressedToEdit: function (e) {
      if (e.keyCode === 13) this._onEdit(e);
    },

    _onEdit: function(event) {
      var self = this,
        $li = $(event.target).closest("li"),
        tabIndex = $li.index(),
        proceed = true,
        tab = self.tabs[tabIndex];

      if (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) && tab.tabConfig.editable === true) {
        $li.find(".tab-edit-btn").popover("hide");
        var newTitle = self.$(self.selectors.titleEdit).val();
        if (newTitle !== tab.title && newTitle) {
          var tabLink = $li.find("#" + tab.elementId + "-tab-link");
          tabLink.html(newTitle);
          tab.title = newTitle;
        }
        if (self.tabs[tabIndex].tabConfig.onEdit) {
          proceed = self.tabs[tabIndex].tabConfig.onEdit.bind(self.tabs[tabIndex], newTitle)();
        }
        self.moveTab(tabIndex, _.sortedIndex(_.without(self.tabs, tab), tab, self._tabSortIteratee));
        if (!newTitle && proceed) {
          self.removeTab(tabIndex);
        }
      }
    },

    _onClickRemove: function() {
      var self = this,
        $li = $(event.target).closest("li"),
        tabIndex = $li.index(),
        proceed = true;

      if (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) && self.tabs[tabIndex].tabConfig.removable === true) {
        if (self.tabs[tabIndex].tabConfig.onRemove) {
          proceed = self.tabs[tabIndex].tabConfig.onRemove.bind(self.tabs[tabIndex])();
        }
      }
      if (proceed) {
        self.removeTab(tabIndex);
      }
    },

    _onClickAdd: function() {
      var self = this;
      self.$(self.selectors.addLink).hide();
      self.$(self.selectors.editTitle).show();
      self.$(self.selectors.editTitleInput).focus();
    },

    _onAdd: function() {
      var self = this;
      if (!self.$(self.selectors.editTitle).is(":visible")) return;
      var title = self.$(self.selectors.editTitleInput).val();

      self.$(self.selectors.editTitle).hide();
      self.$(self.selectors.addLink).show();
      var addBlock = self.$(self.selectors.addBlock).detach();

      if (!self.attributes.viewConfig.onAdd) {
        throw new Error("specify onAdd function for extendable tabs");
      }
      if (title) {
        self.attributes.viewConfig.onAdd.bind(self)(title);
      }
      setTimeout(function() {
        self.$(self.selectors.linkList).append(addBlock);
      });
    },

    _onKeyPressedToAdd: function (e) {
      if (e.keyCode === 13) this._onAdd();
    },

    _onPopoverShow: function(event) {
      var self = this;
      var $popoverTrigger = $(event.currentTarget),
        $popover = $popoverTrigger.siblings(".popover");

      $popover.attr("tabindex", -1).focus();
      self.$(self.selectors.titleEdit).focus();
    },

    _tabSortIteratee: function (tab) {
      return tab.title.toLowerCase();
    },
  });

  return TabsView;
});
