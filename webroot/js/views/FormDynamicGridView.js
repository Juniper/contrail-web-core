/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/grid.editors',
    'js/grid.formatters'
], function (_, Backbone) {
    //TODO: Make it generic for any kind of form edit.
    var FormDynamicGridView = Backbone.View.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                model = this.model,
                elId = this.attributes.elementId,
                columns = viewConfig.elementConfig.columns,
                options = viewConfig.elementConfig.options,
                data = model.getValueByPath(viewConfig.modelAttributePath),
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = this.attributes.lockEditingByDefault;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }

            this.model.initLockAttr(path, lockEditingByDefault);

            var grid,
                defaultDataItem = {},
                defaultOptions = {
                    editable: true,
                    enableAddRow: true,
                    enableCellNavigation: true,
                    asyncEditorLoading: false,
                    autoEdit: false,
                    autoHeight: true,
                    rowHeight: 30
                };

            $.each(columns, function (columnKey, columnValue) {
                defaultDataItem[columnValue.field] = contrail.checkIfExist(columnValue.defaultValue) ? columnValue.defaultValue : null;
            });
            //TODO dirty fix added to avoid adding the plus and minus icon repeatedly on opening the modal multiple times
            var iconMinusAdded = false;
            var iconPlusAdded = false;
            $.each(columns,function(i,d){
                if(d.id == 'icon-minus')
                    iconMinusAdded = true;
                if(d.id == 'icon-plus')
                    iconPlusAdded = true;
            });
            if(!iconMinusAdded){
                columns.push({
                    id: 'icon-minus',
                    field: "",
                    name: '',
                    cssClass: '',
                    rerenderOnResize: false,
                    formatter: function (r, c, v, cd, dc) {
                        return '<i class="row-remove icon-minus grey" data-row=' + r + '></i>'
                    },
                    width: 20,
                    maxWidth: 20,
                    resizable: false,
                    sortable: false
                });
            }
            if(!iconPlusAdded){
                columns.push({
                    id: 'icon-plus',
                    field: "",
                    name: '',
                    cssClass: '',
                    rerenderOnResize: false,
                    formatter: function (r, c, v, cd, dc) {
                        return '<i class="row-add icon-plus grey" data-row=' + r + '></i>'
                    },
                    width: 20,
                    maxWidth: 20,
                    resizable: false,
                    sortable: false
                });
            }

            options = $.extend(true, {}, defaultOptions, options);

            grid = new Slick.Grid('#' + elId, data, columns, options);

            grid.gotoCell(data.length, 0, true);

            $('#' + elId).data('contrailDynamicgrid', {
                _grid: grid
            })

            grid.onAddNewRow.subscribe(function (e, args) {
                var thisGrid = $('#' + elId).data('contrailDynamicgrid')._grid;
                if(contrail.checkIfExist(args.item[options.uniqueColumn]) && args.item[options.uniqueColumn] != '') {
                    var item = $.extend(true, {}, defaultDataItem, args.item);

                    thisGrid.invalidateRow(data.length);
                    data.push(item);
                    thisGrid.updateRowCount();
                    thisGrid.render();
//                    thisGrid.gotoCell(data.length, 0, true);
                } else {
                    thisGrid.invalidateRow(data.length);
                    thisGrid.render();
                }
            });

            grid.onActiveCellChanged.subscribe(function (e, args) {
                if (contrail.checkIfFunction(options.events.onUpdate)) {
                    options.events.onUpdate();
                }
            });

            $('#' + elId).addClass('contrail-grid contrail-grid-editable');

            $('#' + elId)
                .off('click', 'i.row-add')
                .on('click', 'i.row-add', function() {
                    var rowIndex = $(this).data('row'),
                        thisGrid = $('#' + elId).data('contrailDynamicgrid')._grid;

                    data.splice((rowIndex + 1), 0, $.extend(true, {}, defaultDataItem));
                    thisGrid.setData(data);
                    thisGrid.gotoCell((rowIndex + 1), 0, true);
                });

            $('#' + elId)
                .off('click', 'i.row-remove')
                .on('click', 'i.row-remove', function() {
                    var rowIndex = $(this).data('row'),
                        thisGrid = $('#' + elId).data('contrailDynamicgrid')._grid;

                    data.splice(rowIndex, 1);
                    thisGrid.setData(data);

                    if (contrail.checkIfFunction(options.events.onUpdate)) {
                        options.events.onUpdate();
                    }
                });

        }
    });

    return FormDynamicGridView;
});