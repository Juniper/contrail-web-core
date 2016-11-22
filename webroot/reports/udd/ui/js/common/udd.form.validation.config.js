/**
 * TODOs: 
 *      1. the type normalizers (normalizeDataType, normalizeTableType) are used
 *         to infer a proper tag/label that can be understood by the validation engine.
 *         Untimately such info should be carried by the data entry, rather than unreliably inferred.
 */

define([
    "lodash",
    "text!core-basedir/reports/udd/config/default.config.json"
], function(_, defaultConfigString) {
    var defaultConfigJSON = JSON.parse(defaultConfigString),
        unifiedDataTypes = {
            LOGGABLE: {
                NORMAL: "loggable.normal",
                OBJECT: "loggable.object"
            },
            PLOTTABLE: "plottable",
        }, shouldIgnore = {
            "T": true,
            "T=": true
        }, isCompatibleAggregator = {
            "sum": true,
            "avg": true,
            "min": true,
            "max": true,
            "count": true
        }, isDirty = {
            "sport": true,
            "dport": true
        };

    /**
     * combine two rules and return the combination.
     *
     * @param  {object} rule1 rule description
     * @param  {object} rule2 rule description
     * @return {object}       combined rule description
     */
    function combine(rule1, rule2) { // eslint-disable-line
        var compatible1 = isCompatibleRule(rule1),
            compatible2 = isCompatibleRule(rule2);

        if (compatible1 && compatible2) {
            rule1 = normalizeRule(rule1);
            rule2 = normalizeRule(rule2);
            return rule1.concat(rule2);
        } else if (compatible1) {
            return normalizeRule(rule1);
        } else if (compatible2) {
            return normalizeRule(rule2);
        } else {
            return {};
        }
    }

    /**
     * check if the rule is in a format described by Backbone.validation
     * @param  {object}  rule rule description
     * @return {boolean}
     */
    function isCompatibleRule(rule) {
        return _.isArray(rule) || _.isFunction(rule) || _.isPlainObject(rule);
    }

    /**
     * convert all acceptable rule descritpion format to array-like.
     * The array format is the easiest to merge properly.
     *
     * @param  {object} rule rule description
     * @return {object}      normalized rule description in form of array
     */
    function normalizeRule(rule) {
        if (_.isFunction(rule)) {
            return [{
                fn: rule
            }];
        } else if (_.isPlainObject(rule)) {
            return [rule];
        } else {
            return rule;
        }
    }

    /**
     * a factory method that generates a data type normalizer based on a map of raw data type's meta
     * @param  {object} dataMetaMap a map, which provides meta of each raw data type
     * @return {function}           a data type normalizer
     */
    function getDataTypeNormalizer(dataMetaMap) {
        var regexPattern = /(.+)\((.+)\)/gi,
            // generate a plottable data type dictionary
            plottableDataTypes = _.reduce(dataMetaMap, function(validTypes, dataMeta, rawDataType) {
                regexPattern.lastIndex = 0;

                var extracted = regexPattern.exec(rawDataType),
                    aggregateType = extracted && extracted[1].toLowerCase(),
                    nonAggregateCore = extracted && extracted[2];

                if (isCompatibleAggregator[aggregateType]
                    && nonAggregateCore
                    && !shouldIgnore[nonAggregateCore]) {
                    validTypes[rawDataType] = unifiedDataTypes.PLOTTABLE;
                    validTypes[nonAggregateCore] = unifiedDataTypes.PLOTTABLE;
                }

                return validTypes;
            }, {});

        return function(rawDataType) {
            return plottableDataTypes[rawDataType] || rawDataType;
        };
    }

    /**
     * data type mapper for table_type field
     * @param  {string} string one field value
     * @return {string}        unified data type string
     */
    function normalizeTableType(string) {
        switch (string) {
            case "LOG":
                return unifiedDataTypes.LOGGABLE.NORMAL;
            case "OBJECT":
                return unifiedDataTypes.LOGGABLE.OBJECT;
            default: // unhandled string will be returned as is
                return string;
        }
    }

    /**
     * A error string generater
     * @param  {string} subject   string as subject
     * @param  {string} predicate string as verb
     * @param  {string} object    string as object
     * @return {string}           composed error message for a field
     */
    function getFieldErrorMsg(subject, predicate, object) {
        return [subject, predicate, "selection of", object, "field(s)"].join(" ");
    }

    /**
     * Gets the validation schema.
     *
     * @param      {object}  rawConfig  The raw configuration
     * @return     {object}  The validation schema.
     */
    function getValidationSchema(rawConfig) {
        return _.mapValues(rawConfig.contentViews, function(visualizationConfig) {
            return visualizationConfig.validations;
        });
    }

    /**
     * Return an array of labels calculated by default.config.json and the array of field type.
     *
     * @param      {array/string}  fieldTypes  The field type(s)
     * @return     {array}                     The calculated label array
     */
    function convertToLabel(fieldTypes) {
        fieldTypes = [].concat(fieldTypes);
        
        return _.map(fieldTypes, function(fieldType) {
            var fieldTypeConfig = defaultConfigJSON.contentViews[fieldType]
                                || defaultConfigJSON.dataSources[fieldType];

            return fieldTypeConfig ? fieldTypeConfig.label : null;
        });
    }

    /**
     * This is the object that describes what validations rules should be applied to any fields in the query form.
     *
     * @type {object}
     */
    var viewRequiredFormInfo = getValidationSchema(defaultConfigJSON);

    /**
     * A validator core. Determines if the value has all required DB fields.
     *
     * @param      {string}    value               The value passed by Backbone Validation library
     * @param      {string}    attr                The attribute name passed by Backbone Validation library
     * @param      {object}    metrics             A configuration object that provides necessary info for the core,
     *                                             it can have a preprocessor to sanitize the raw value for the dataTypeNormalizer.
     * @param      {function}  dataTypeNormalizer  A data type normalizer that converts various data types to more generic data types.
     * @return     {string}                        Empty string if the field has all required fields, error message otherwise.
     */
    function hasAllRequiredDBFields(value, attr, metrics, dataTypeNormalizer) { // eslint-disable-line
        var key = metrics.key,
            target = metrics.target,
            attrRequirements = _.get(viewRequiredFormInfo, [key, target, attr]);

        if (attrRequirements) {
            var requiredFieldTypes = _.uniq(attrRequirements.requiredFieldTypes || ""),
                rejectedFieldTypes = _.uniq(attrRequirements.rejectedFieldTypes || ""),
                selectedFieldValues = value ? value.split(", ") : [],
                selectedTypes = _.uniq(_.map(selectedFieldValues, function(fieldName) {
                    return dataTypeNormalizer(metrics.preprocess(fieldName));
                })),
                isRejected = _.partial(_.partialRight(_.includes, null), rejectedFieldTypes);

            if (_.some(selectedTypes, isRejected)) { // if selected types is rejected by rule of the key
                return getFieldErrorMsg(convertToLabel(key)[0], "rejects", rejectedFieldTypes.join(", "));
            } else {
                var neededFieldTypes = _.difference(requiredFieldTypes, selectedTypes);
                if (neededFieldTypes.length !== 0) { // if selected types don't cover all types required by rule of the key
                    return getFieldErrorMsg(convertToLabel(key)[0], "requires", neededFieldTypes.join(", "));
                }
            }
        } else {
            return "";
        }
    }

    /**
     * A validator core. Determines if the where clause must be used to specify selected unclear/dirty colums.
     *
     * @param      {string}  value    The value passed by Backbone Validation library
     * @param      {string}  attr     The attribute name passed by Backbone Validation library
     * @param      {object}  metrics  A configuration object that provides necessary info for the core.
     * @return     {string}           Empty string if the field has all required fields, error message otherwise.
     */
    function shouldUseWhereAsGroupBy(value, attr, metrics) {
        var key = metrics.key,
            target = metrics.target,
            attrRequirements = _.get(viewRequiredFormInfo, [key, target, attr]);

        if (attrRequirements) {
            if (attrRequirements.requiredByDirtyColumns) {
                var selectedDirtyColumns = metrics.preprocess();

                selectedDirtyColumns = _.takeWhile(selectedDirtyColumns, function(column) {
                    return _.isEmpty(value) || value.replace(" = ", "=").indexOf(column + "=") === -1;
                });

                if (value.indexOf(") OR (") !== -1) {
                    return getFieldErrorMsg(convertToLabel(key)[0], "rejects usage of OR for sanitizing");
                } else if (!_.isEmpty(selectedDirtyColumns)) {
                    return getFieldErrorMsg(convertToLabel(key)[0], "requires where-clause-sanitized", selectedDirtyColumns.join(", "));
                }
            }
        }

        return "";
    }

    return {
        /**
         * This is a rulesets created for query form validation in UDD widget.
         *
         * @type {object}
         */
        UDDQueryConfigValidations: {
            runQueryValidation: { // this ruleset ID follows core-constants/KEY_RUN_QUERY_VALIDATION
                select: {
                    fn: function(value, attr, computedState) { // eslint-disable-line
                        if (computedState.ui_added_parameters) {
                            var metrics = {
                                    target: computedState.dataSrcType,
                                    key: computedState.visualType,
                                    preprocess: function(fieldName) {
                                        return !shouldIgnore[fieldName] ? fieldName : "";
                                    }
                                },
                                columnMetaMap = computedState.ui_added_parameters.table_schema_column_names_map;

                            return hasAllRequiredDBFields(value, attr, metrics, getDataTypeNormalizer(columnMetaMap));
                        }
                    }
                },
                table_type: {
                    fn: function(value, attr, computedState) { // eslint-disable-line
                        var metrics = {
                            target: computedState.dataSrcType,
                            key: computedState.visualType,
                            preprocess: function(fieldName) {
                                return fieldName;
                            }
                        };

                        return hasAllRequiredDBFields(value, attr, metrics, normalizeTableType);
                    }
                },
                where: {
                    fn: function(value, attr, computedState) { // eslint-disable-line
                        if (computedState.ui_added_parameters) {
                            var columnMetaMap = computedState.ui_added_parameters.table_schema_column_names_map,
                                dirtyColumns = _.keys(_.pick(columnMetaMap, function(value) {
                                    return value.datatype === "string" // In general, string columns are used to
                                                                       // selectively group data entries
                                        || value.datatype === "ipaddr" // For FlowSeriesTable, "sourceip" and "destip"
                                                                       // use a data type other than string
                                        || isDirty[value.name];        // For other columns that can't be determined by
                                                                       // data type, create a dictionary. Such as for
                                                                       // "sport" and "vport" in FlowSeriesTable
                                })),
                                metrics = {
                                    target: computedState.dataSrcType,
                                    key: computedState.visualType,
                                    preprocess: function() {
                                        return _.intersection(
                                                dirtyColumns,
                                                computedState.select.replace(/\s+/g, "").split(",")
                                            );
                                    }
                                };

                            return shouldUseWhereAsGroupBy(value, attr, metrics);
                        }
                    }
                }
            }
        },
        /**
         * Combine two Backbone.validation rulesets into one.
         * A rulesets will strictly follow a two level data structure enforced by ContrailModel.
         * The structure is as:
         *     rulesetsID {
         *         rulesetID: {
         *             field1: ...
         *             field2: ...
         *             ...
         *         }
         *         ...
         *     }
         *
         * @param  {object} rulesets1 rulesets description object
         * @param  {object} rulesets2 rulesets description object
         * @return {object}           combined rulesets with each rule normalized in a form of [{validator1, msg1}, {validator2, msg2}, ...]
         */
        mixValidationRules: function(rulesets1, rulesets2) {
            var combinedValidations = {};

            // find all common rulesets of rulesets1 and rulesets2, then combine them
            _.forEach(rulesets1, function(ruleset, rulesetName) {
                if (!combinedValidations[rulesetName]) {
                    combinedValidations[rulesetName] = {};
                }

                // find all common rules under current ruleset and combine them
                _.forEach(ruleset, function(rule, formProperty) {
                    combinedValidations[rulesetName][formProperty] = combine(rule, _.get(rulesets2, [rulesetName, formProperty], []));
                });

                // find all rules that are unique to rulesets2 and clone it onto combinedValidations
                _.forEach(rulesets2[rulesetName], function(rule, formProperty) {
                    if (!_.has(combinedValidations, [rulesetName, formProperty])) {
                        combinedValidations[rulesetName][formProperty] = combine(rule, []);
                    }
                });
            });

            // find all rulesets that are unique to rulesets2 and clone it onto combinedValidations
            _.forEach(rulesets2, function(ruleset, rulesetName) {
                if (!combinedValidations[rulesetName]) {
                    combinedValidations[rulesetName] = _.cloneDeep(ruleset);
                }
            });

            return combinedValidations;
        },
        /**
         * A filter that returns the plottable fields in format of concatenated string.
         *
         * @param      {string}    srcString        The source string
         * @param      {object}    columnSchemaMap  A dictionary that describes the meta info of each field/column
         * @param      {string}    delimiter        The delimiter used by srcString. By default, it's ", ".
         * @return     {string}                     A string concatenating filtered plottable fields/columns with delimiter
         */
        getPlottableFields: function(srcString, columnSchemaMap, delimiter) {
            delimiter = delimiter || ", ";

            var dataTypeNormalizer = getDataTypeNormalizer(columnSchemaMap),
                srcArr = srcString.split(delimiter),
                plottableFieldArr = _.filter(srcArr, function(column) {
                    return dataTypeNormalizer(column) === unifiedDataTypes.PLOTTABLE;
                });

            return plottableFieldArr.join(delimiter);
        }
    };
});
