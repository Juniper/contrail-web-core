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

  // a private method to generate unified tabsIdMap key
  function generatePanelId(elID) {
    return elID + "-tab";
  }

  var TabsView = ContrailView.extend({
    selectors: {
      tabEdit: ".contrail-tab-link-list .tab-edit-btn",
      linkList: ".contrail-tab-link-list",
      addBlock: ".contrail-tab-link-list .tab-add",
      editTitle: ".contrail-tab-link-list .tab-add .title-edit",
      editTitleInput: ".contrail-tab-link-list .tab-add .title-edit > input",
      addLink: ".contrail-tab-link-list .tab-add .link",
    },

    events: {
      "click .contrail-tab-link-list .tab-add .link": "_onClickAdd",
      "click .contrail-tab-link-list .contrail-tab-link-icon-remove": "_onClickRemove",
      "click .contrail-tab-link-list .tab-menu .title-save": "_onEdit",
      "keypress .contrail-tab-link-list .tab-menu .title-updated": "_onKeyPressedToEdit",
      "blur .contrail-tab-link-list .tab-add .title-edit > input": "_onAdd",
      "keypress .contrail-tab-link-list .tab-add .title-edit > input": "_onKeyPressedToAdd",
    },

    render: function() {
      var self = this,
          viewConfig = self.attributes.viewConfig,
          elId = self.attributes.elementId,
          tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
          tabHashUrlObj = window.layoutHandler.getURLHashParams().tab,
          activeTab = contrail.handleIfNull(viewConfig.active, 0);

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
          tabConfig._rendered = false
        } else {
          self.renderTab(tabConfig);
        }
      });

      self.$("#" + elId).contrailTabs({
        active: activeTab,
        activate: function(event, ui) {
          var panelId = ($(ui.newPanel[0]).attr("id")),
              tabIndex = ui.newTab.index(),
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
          var panelId = $(ui.newPanel[0]).attr("id");
          var tab = self.tabs[ui.newTab.index()];

          if (!tab._rendered) relf.renderTab(tab);
        },

        create: function(event, ui) {
          var panelId = $(ui.panel[0]).attr("id");
          var tab = self.tabs[ui.tab.index()];

          if (!tab._rendered) relf.renderTab(tab);
        },

        theme: viewConfig.theme,
      });
    },

    _initTabMenu: function(tab) {
      var tabMenuTemplate = contrail.getTemplate4Id(cowc.TMPL_TAB_MENU_VIEW),
          $tabEdit = this.$("#" + tab.elementId + "-tab-link").siblings(this.selectors.tabEdit);

      $tabEdit.on("shown.bs.popover", this._onPopoverShow);
      $tabEdit.popover({
        placement: "bottom",
        trigger: "click",
        html: true,
        content: function() {
          return tabMenuTemplate(tab.title);
        },
      });
    },

    removeTab: function(tabIndex) {
      var self = this,
          elId = self.attributes.elementId,
          tabConfig = (contrail.checkIfExist(self.tabs[tabIndex].tabConfig) ? self.tabs[tabIndex].tabConfig : null);

      if ($.isArray(tabIndex)) {
        for (var i = 0; i < tabIndex.length; i++) {
          self.removeTab(tabIndex[i]);
        }
        return;
      }

      var panelId = self.$("#" + elId + " li:eq(" + tabIndex + ")").attr("aria-controls");

      self.$("#" + elId + " li:eq(" + tabIndex + ")").remove();
      $("#" + panelId).remove();

      self.tabs.splice(tabIndex, 1);

      self.$("#" + elId).data("contrailTabs").refresh();

      if (self.tabs.length === 0 && !self.attributes.viewConfig.extendable) {
        self.$("#" + elId).hide();
      }

      if (tabConfig !== null && contrail.checkIfFunction(tabConfig.onRemoveTab)) {
        tabConfig.onRemoveTab();
      }
    },

    renderTab: function(tab, onAllViewsRenderComplete) {
      var self = this,
          elId = self.attributes.elementId,
          validation = self.attributes.validation,
          lockEditingByDefault = self.attributes.lockEditingByDefault,
          modelMap = self.modelMap,
          childElId = tab[cowc.KEY_ELEMENT_ID];
      tab._rendered = true;

      self.$("#" + elId).show();

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
          tabLength = self.tabs.length,
          activateTabIndex;

      self.modelMap = modelMap;

      _.each(tabViewConfigs, function(tabConfig) {
        var tabIndex = _.findIndex(self.tabs, function (tab) { tab.elementId === tabConfig.elementId })

        if (tabIndex >= 0) {
          // activate existing tab
          self.$("#" + elId).data("contrailTabs").activateTab(tabIndex);
        } else {
          self.$(self.selectors.linkList).append(tabLinkTemplate([tabConfig]));
          self.$("#" + elId).append(tabContentTemplate([tabConfig]));
          self.$("#" + elId).data("contrailTabs").refresh();

          self.tabs.push(tabConfig);
          if (contrail.checkIfKeyExistInObject(true, tabConfig, "tabConfig.renderOnActivate") && tabConfig.tabConfig.renderOnActivate === true) {
            tabConfig._rendered = false;
            // TODO - onAllViewsRenderComplete should be called when rendered
          } else {
            self.renderTab(tabConfig, onAllViewsRenderComplete);
          }

          tabLength++;

          if (activateTab === true) {
            activateTabIndex = tabLength - 1;
          } else if (_.isNumber(activateTab)) {
            activateTabIndex = activateTab;
          }
          if (!_.isUndefined(activateTabIndex)) {
            self.$("#" + elId).data("contrailTabs").activateTab(activateTabIndex);
          }
        }
      });
    },

    _onKeyPressedToEdit: function (e) {
      var self = this;
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
        var newTitle = self.$(".title-updated").val();
        if (newTitle !== tab.title && newTitle) {
          var tabLink = $li.find("#" + tab.elementId + "-tab-link");
          tabLink.html(newTitle);
          tab.title = newTitle;
        }
        if (self.tabs[tabIndex].tabConfig.onEdit) {
          proceed = self.tabs[tabIndex].tabConfig.onEdit.bind(self.tabs[tabIndex], newTitle)();
        }
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
      if (!self.$(self.selectors.editTitle).is(':visible')) return;
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
      var $popoverTrigger = $(event.currentTarget),
          $popover = $popoverTrigger.siblings(".popover");

      $popover.attr("tabindex", -1).focus();
    }
  });

  return TabsView;
});
