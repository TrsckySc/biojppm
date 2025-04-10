/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * version: 1.11.0
 * https://github.com/wenzhixin/bootstrap-table/
 */

/*!
 * 基于源码修改
 * @author ZhouHuan
 * @version 2021-06-04
 * --------------------------------------------------
 * 1.后台分页时前台删除最后一页所有数据refresh刷新后无数据问题
 * 2.新增表格头自动居中适配问题
 * 3.新增columns 列 class:'action' 样式适配图标按钮
 * 4.修改点击toolbar 视图切换 -->浮动提示框特效
 * 5.修改记住我选择实例组 删除BUG问题
 * 6.修复压缩源码增加源码可读性
 * 7.新增表格行title提示
 * 8.新增id 对象标识,修复页面多表格 回调函数问题
 * 9.修复表格行title提示列转义显示问题
 * 10.修复页面同时多个表格属性firstLoad=false 异常情况
 * 11.优化加载样式
 * 12.新增columns[{field:'user.name',fieldSort:'u.name'}]  fieldSort属性 支持排序名称与返回字段名称不一致
 * 13.新增showCheckNumber 属性是否显示多选勾选总数
 * 14.新增设置表格高度支持函数
 * --------------------------------------------------
 */
(function ($) {
    'use strict';

    // TOOLS DEFINITION
    // ======================

    var cachedWidth = null;

    // it only does '%s', and return '' when arguments are undefined
    var sprintf = function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    var getPropertyFromOther = function (list, from, to, value) {
        var result = '';
        $.each(list, function (i, item) {
            if (item[from] === value) {
                result = item[to];
                return false;
            }
            return true;
        });
        return result;
    };

    var getFieldIndex = function (columns, field) {
        var index = -1;

        $.each(columns, function (i, column) {
            if (column.field === field) {
                index = i;
                return false;
            }
            return true;
        });
        return index;
    };
    //TODO J2eeFAST 修复隐藏列下标问题
    // http://jsfiddle.net/wenyi/47nz7ez9/3/
    var setFieldIndex = function (columns) {
        var i, j, k,
            totalCol = 0, //总列
            flag = []; // 每个表头单位格标志

        for (i = 0; i < columns[0].length; i++) {
            //console.log(columns[0][i].visible);
            //totalCol +=((typeof columns[0][i].visible === 'undefined' || columns[0][i].visible) ? (columns[0][i].colspan || 1) : 0);
            totalCol += columns[0][i].colspan || 1;
        }
        //循环表头
        for (i = 0; i < columns.length; i++) {
            flag[i] = [];
            for (j = 0; j < totalCol; j++) {
                flag[i][j] = false;
            }
        }

        for (i = 0; i < columns.length; i++) {
            for (j = 0; j < columns[i].length; j++) {
                //debugger;
                var r = columns[i][j],
                    rowspan = r.rowspan || 1, //合并行
                    colspan = r.colspan || 1, //合并列

                    index = $.inArray(false, flag[i]);
                //TODO 复杂表头 列有隐藏 直接剔除
                if(typeof r.visible != 'undefined' && !r.visible && columns.length > 1) continue;
                if (colspan === 1) {
                    r.fieldIndex = index;
                    // when field is undefined, use index instead
                    if (typeof r.field === 'undefined') {
                        r.field = index;
                    }
                }

                for (k = 0; k < rowspan; k++) {
                    flag[i + k][index] = true;
                }
                for (k = 0; k < colspan; k++) {
                    flag[i][index + k] = true;
                }
            }
        }
    };

    var getScrollBarWidth = function () {
        if (cachedWidth === null) {
            var inner = $('<p/>').addClass('fixed-table-scroll-inner'),
                outer = $('<div/>').addClass('fixed-table-scroll-outer'),
                w1, w2;

            outer.append(inner);
            $('body').append(outer);

            w1 = inner[0].offsetWidth;
            outer.css('overflow', 'scroll');
            w2 = inner[0].offsetWidth;

            if (w1 === w2) {
                w2 = outer[0].clientWidth;
            }

            outer.remove();
            cachedWidth = w1 - w2;
        }
        return cachedWidth;
    };

    var calculateObjectValue = function (self, name, args, defaultValue) {
        var func = name;
        if (typeof name === 'string') {
            // support obj.func1.func2
            var names = name.split('.');

            if (names.length > 1) {
                func = window;
                $.each(names, function (i, f) {
                    func = func[f];
                });
            } else {
                func = window[name];
            }
        }
        if (typeof func === 'object') {
            return func;
        }
        if (typeof func === 'function') {
            return func.apply(self, args);
        }
        if (!func && typeof name === 'string' && sprintf.apply(this, [name].concat(args))) {
            return sprintf.apply(this, [name].concat(args));
        }
        return defaultValue;
    };

    var compareObjects = function (objectA, objectB, compareLength) {
        // Create arrays of property names
        var objectAProperties = Object.getOwnPropertyNames(objectA),
            objectBProperties = Object.getOwnPropertyNames(objectB),
            propName = '';

        if (compareLength) {
            // If number of properties is different, objects are not equivalent
            if (objectAProperties.length !== objectBProperties.length) {
                return false;
            }
        }

        for (var i = 0; i < objectAProperties.length; i++) {
            propName = objectAProperties[i];

            // If the property is not in the object B properties, continue with the next property
            if ($.inArray(propName, objectBProperties) > -1) {
                // If values of same property are not equal, objects are not equivalent
                if (objectA[propName] !== objectB[propName]) {
                    return false;
                }
            }
        }

        // If we made it this far, objects are considered equivalent
        return true;
    };

    var escapeHTML = function (text) {
        if (typeof text === 'string') {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/`/g, '&#x60;');
        }
        return text;
    };

    var getRealHeight = function ($el) {
        var height = 0;
        $el.children().each(function () {
            if (height < $(this).outerHeight(true)) {
                height = $(this).outerHeight(true);
            }
        });
        return height;
    };

    var getRealDataAttr = function (dataAttr) {
        for (var attr in dataAttr) {
            var auxAttr = attr.split(/(?=[A-Z])/).join('-').toLowerCase();
            if (auxAttr !== attr) {
                dataAttr[auxAttr] = dataAttr[attr];
                delete dataAttr[attr];
            }
        }

        return dataAttr;
    };

    var getItemField = function (item, field, escape) {
        var value = item;

        if (typeof field !== 'string' || item.hasOwnProperty(field)) {
            return escape ? escapeHTML(item[field]) : item[field];
        }
        var props = field.split('.');
        for (var p in props) {
            value = value && value[props[p]];
        }
        return escape ? escapeHTML(value) : value;
    };

    var isIEBrowser = function () {
        return !!(navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));
    };

    var objectKeys = function () {
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
        if (!Object.keys) {
            Object.keys = (function() {
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function(obj) {
                    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                        throw new TypeError('Object.keys called on non-object');
                    }

                    var result = [], prop, i;

                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }

                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }());
        }
    };

    // BOOTSTRAP TABLE CLASS DEFINITION
    // ======================

    var BootstrapTable = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.$el_ = this.$el.clone();
        this.timeoutId_ = 0;
        this.timeoutFooter_ = 0;

        this.init();
    };

    BootstrapTable.DEFAULTS = {
        id: '',
        classes: 'table table-hover',
        locale: undefined,
        height: undefined,
        undefinedText: '-',
        emptyText:"-",
        sortName: undefined,
        sortOrder: 'asc',
        sortStable: false,
        striped: false,
        columns: [[]],
        data: [],
        dataField: 'rows',
        method: 'get',
        url: undefined,
        ajax: undefined,
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        ajaxOptions: {},
        queryParams: function (params) {
            return params;
        },
        queryParamsType: 'limit', // undefined
        responseHandler: function (res) {
            return res;
        },
        pagination: false,
        firstLoad: true,
        isFixedColumn: false,
        onlyInfoPagination: false,
        showCheckNumber: false, //显示表格勾选数量
        sidePagination: 'client', // client or server
        totalRows: 0, // server side need to set
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50, 100],
        paginationHAlign: 'right', //right, left
        paginationVAlign: 'bottom', //bottom, top, both
        paginationDetailHAlign: 'left', //right, left
        paginationPreText: '&lsaquo;',
        paginationNextText: '&rsaquo;',
        search: false,
        searchOnEnterKey: false,
        strictSearch: false,
        searchAlign: 'right',
        selectItemName: 'btSelectItem',
        showHeader: true,
        subtotalShowFooter: false, // 小计
        rowTotal: undefined, //小计个数
        subtotalRowStyle: undefined,
        totalShowFooter: false, //合计
        totalFooterHeight: undefined, //合计高度
        totalFooterRowStyle: undefined, //合计行样式
        showColumns: false,
        showSearch: false,
        showPageGo: false,
        exportData: undefined,
        showPaginationSwitch: false,
        showRefresh: false,
        showBorder: false,
        showToggle: false,
        showExport: false,
        buttonsAlign: 'right',
        smartDisplay: true,
        escape: false,
        minimumCountColumns: 1,
        idField: undefined,
        uniqueId: undefined,
        cardView: false,
        detailView: false,
        detailFormatter: function (index, row) {
            return '';
        },
        // 自定义表格
        showCustomView: false,
        customViewFormatter: function(data){
            return '';
        },
        // ----------
        trimOnSearch: true,
        clickToSelect: false,
        singleSelect: false,
        toolbar: undefined,
        toolbarAlign: 'left',
        checkboxHeader: true,
        sortable: true,
        silentSort: true,
        maintainSelected: false,
        searchTimeOut: 500,
        searchText: '',
        iconSize: undefined,
        buttonsClass: 'default',
        iconsPrefix: 'glyphicon', // glyphicon of fa (font awesome)
        icons: {
            search: "glyphicon-search",
            paginationSwitchDown: 'glyphicon-collapse-down icon-chevron-down',
            paginationSwitchUp: 'glyphicon-collapse-up icon-chevron-up',
            refresh: 'glyphicon-refresh icon-refresh',
            toggle: 'glyphicon-list-alt icon-list-alt',
            exportIcon: 'glyphicon-export',
            cardView: 'glyphicon glyphicon-random',
            columns: 'glyphicon-th icon-th',
            detailOpen: 'glyphicon-plus icon-plus',
            detailClose: 'glyphicon-minus icon-minus'
        },

        customSearch: $.noop,

        customSort: $.noop,

        rowStyle: function (row, index) {
            return {};
        },

        rowAttributes: function (row, index) {
            return {};
        },

        subtotalFooterStyle: function (row, index) {
            return {};
        },

        totalFooterStyle: function (row, index){
            return {};
        },

        onAll: function (name, args) {
            return false;
        },
        onClickCell: function (field, value, row, $element) {
            return false;
        },
        onDblClickCell: function (field, value, row, $element) {
            return false;
        },
        onClickRow: function (item, $element) {
            return false;
        },
        onDblClickRow: function (item, $element) {
            return false;
        },
        onSort: function (name, order) {
            return false;
        },
        onCheck: function (row) {
            return false;
        },
        onUncheck: function (row) {
            return false;
        },
        onCheckAll: function (rows) {
            return false;
        },
        onUncheckAll: function (rows) {
            return false;
        },
        onCheckSome: function (rows) {
            return false;
        },
        onUncheckSome: function (rows) {
            return false;
        },
        onLoadSuccess: function (data) {
            return false;
        },
        onLoadError: function (status) {
            return false;
        },
        onColumnSwitch: function (field, checked) {
            return false;
        },
        onPageChange: function (number, size) {
            return false;
        },
        onSearch: function (text) {
            return false;
        },
        onToggle: function (cardView) {
            return false;
        },
        onPreBody: function (data) {
            return false;
        },
        onPostBody: function () {
            return false;
        },
        onPostHeader: function () {
            return false;
        },
        onExpandRow: function (index, row, $detail) {
            return false;
        },
        onCollapseRow: function (index, row) {
            return false;
        },
        onRefreshOptions: function (options) {
            return false;
        },
        onRefresh: function (params) {
            return false;
        },
        onResetView: function () {
            return false;
        }
    };

    BootstrapTable.LOCALES = {};

    BootstrapTable.LOCALES['en-US'] = BootstrapTable.LOCALES.en = {
        formatLoadingMessage: function () {
            return 'Loading, please wait';
        },
        formatRecordsPerPage: function (pageNumber) {
            return sprintf('%s rows per page', pageNumber);
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            return sprintf('Showing %s to %s of %s rows', pageFrom, pageTo, totalRows);
        },
        formatPageGo: function () {
            return 'Jump';
        },
        formatDetailPagination: function (totalRows) {
            return sprintf('Showing %s rows', totalRows);
        },
        formatCheckNumber: function (number) {
            return sprintf('Total number of checks :%s', number);
        },
        formatSearch: function () {
            return 'Search';
        },
        formatNoMatches: function () {
            return 'No matching records found';
        },
        formatPaginationSwitch: function () {
            return 'Hide/Show pagination';
        },
        formatRefresh: function () {
            return 'Refresh';
        },
        formatToggle: function () {
            return 'Toggle';
        },
        formatExport: function () {
            return 'Export';
        },
        formatCardView: function () {
            return 'Switch';
        },
        formatColumns: function () {
            return 'Columns';
        },
        formatAllRows: function () {
            return 'All';
        }
    };

    $.extend(BootstrapTable.DEFAULTS, BootstrapTable.LOCALES['en-US']);

    BootstrapTable.COLUMN_DEFAULTS = {
        radio: false,
        checkbox: false,
        checkboxEnabled: true,
        field: undefined,
        title: undefined,
        titleTooltip: undefined,
        'class': undefined,
        align: undefined, // left, right, center
        halign: undefined, // left, right, center
        style: undefined,  // 字段头 -style
        falign: undefined, // left, right, center
        valign: undefined, // top, middle, bottom
        width: undefined,
        sortable: false,
        subtotalFootColspan: undefined, //底部统计列合并数量
        order: 'asc', // asc, desc
        visible: true,
        switchable: true,
        clickToSelect: true,
        formatter: undefined,
        subtotalFooterFormatter: undefined, //小计函数
        totalFooterFormatter: undefined, //合计函数
        events: undefined,
        sorter: undefined,
        sortName: undefined,
        cellStyle: undefined,
        searchable: true,
        searchFormatter: true,
        cardVisible: true
    };

    BootstrapTable.EVENTS = {
        'all.bs.table': 'onAll',
        'click-cell.bs.table': 'onClickCell',
        'dbl-click-cell.bs.table': 'onDblClickCell',
        'click-row.bs.table': 'onClickRow',
        'dbl-click-row.bs.table': 'onDblClickRow',
        'sort.bs.table': 'onSort',
        'check.bs.table': 'onCheck',
        'uncheck.bs.table': 'onUncheck',
        'check-all.bs.table': 'onCheckAll',
        'uncheck-all.bs.table': 'onUncheckAll',
        'check-some.bs.table': 'onCheckSome',
        'uncheck-some.bs.table': 'onUncheckSome',
        'load-success.bs.table': 'onLoadSuccess',
        'load-error.bs.table': 'onLoadError',
        'column-switch.bs.table': 'onColumnSwitch',
        'page-change.bs.table': 'onPageChange',
        'search.bs.table': 'onSearch',
        'toggle.bs.table': 'onToggle',
        'pre-body.bs.table': 'onPreBody',
        'post-body.bs.table': 'onPostBody',
        'post-header.bs.table': 'onPostHeader',
        'expand-row.bs.table': 'onExpandRow',
        'collapse-row.bs.table': 'onCollapseRow',
        'refresh-options.bs.table': 'onRefreshOptions',
        'reset-view.bs.table': 'onResetView',
        'refresh.bs.table': 'onRefresh'
    };

    BootstrapTable.prototype.init = function () {
        this.initLocale();
        this.initContainer();
        this.initTable();
        this.initHeader();
        this.initData();
        this.initFooter();
        this.initToolbar();
        this.initPagination();
        this.initBody();
        this.initSearchText();
        this.initServer();
    };

    BootstrapTable.prototype.initLocale = function () {
        if (this.options.locale) {
            var parts = this.options.locale.split(/-|_/);
            parts[0].toLowerCase();
            if (parts[1]) parts[1].toUpperCase();
            if ($.fn.bootstrapTable.locales[this.options.locale]) {
                // locale as requested
                $.extend(this.options, $.fn.bootstrapTable.locales[this.options.locale]);
            } else if ($.fn.bootstrapTable.locales[parts.join('-')]) {
                // locale with sep set to - (in case original was specified with _)
                $.extend(this.options, $.fn.bootstrapTable.locales[parts.join('-')]);
            } else if ($.fn.bootstrapTable.locales[parts[0]]) {
                // short locale language code (i.e. 'en')
                $.extend(this.options, $.fn.bootstrapTable.locales[parts[0]]);
            }
        }
    };

    BootstrapTable.prototype.initContainer = function () {
        //TODO 调整加载等待动画位置适配 冻结列
        this.$container = $([
            '<div class="bootstrap-table">',
            '<div class="fixed-table-toolbar"></div>',
            this.options.paginationVAlign === 'top' || this.options.paginationVAlign === 'both' ?
                '<div class="fixed-table-pagination" style="clear: both;"></div>' :
                '',
            '<div class="fixed-table-container">',
            '<div class="fixed-table-header"><table></table></div>',
            '<div class="fixed-table-loading">',
            '<span class="loading-wrap">',
            '<span class="loading-text" style="font-size: 13px;">',
            this.options.formatLoadingMessage(),
            '</span>',
            '<span class="animation-wrap">',
            '<span class="animation-dot"></span>',
            '</span>',
            '</span>',
            '</div>',
            '<div class="fixed-table-body">',
            '</div>',
            this.options.showCustomView === true ? '<div class="fixed-table-custom-view"></div>' : '',
            '<div class="fixed-table-footer">',
            '<table><tr></tr></table>',
            '</div>',
            this.options.paginationVAlign === 'bottom' || this.options.paginationVAlign === 'both' ?
                '<div class="fixed-table-pagination"></div>' :
                '',
            '</div>',
            '</div>'
        ].join(''));
        this.$container.insertAfter(this.$el);
        this.$tableContainer = this.$container.find('.fixed-table-container');
        this.$tableHeader = this.$container.find('.fixed-table-header');
        this.$tableBody = this.$container.find('.fixed-table-body');
        this.$tableLoading = this.$container.find('.fixed-table-loading');
        this.$tableFooter = this.$container.find('.fixed-table-footer');
        this.$toolbar = this.$container.find('.fixed-table-toolbar');
        this.$pagination = this.$container.find('.fixed-table-pagination');
        if(this.options.showCustomView === true){
            this.$customView = this.$container.find('.fixed-table-custom-view');
            this.$tableBody.hide();
            this.__custom = true;
        }else{
            this.__custom = false;
        }
        this.$tableBody.append(this.$el);
        this.$container.after('<div class="clearfix"></div>');

        this.$el.addClass(this.options.classes);
        if (this.options.striped) {
            this.$el.addClass('table-striped');
        }
        if(this.options.height){
            //TODO 兼容高度函数化
            if(typeof this.options.height == 'function' ){
                var h = calculateObjectValue(this.options, this.options.height, this.options, '');
                this.$container.css('height',h + 'px');
            }else{
                this.$container.css('height',this.options.height + 'px');
            }
            //如果是设置高度设置表格相对位置
            this.$tableBody.css('position','relative');
            if(this.options.showCustomView) this.$customView.css('position','relative');
        }
        if ($.inArray('table-no-bordered', this.options.classes.split(' ')) !== -1) {
            this.$tableContainer.addClass('table-no-bordered');
        }
    };

    BootstrapTable.prototype.initTable = function () {
        var that = this,
            columns = [],
            data = [];

        this.$header = this.$el.find('>thead');
        if (!this.$header.length) {
            this.$header = $('<thead></thead>').appendTo(this.$el);
        }
        this.$header.find('tr').each(function () {
            var column = [];

            $(this).find('th').each(function () {
                // Fix #2014 - getFieldIndex and elsewhere assume this is string, causes issues if not
                if (typeof $(this).data('field') !== 'undefined') {
                    $(this).data('field', $(this).data('field') + '');
                }
                column.push($.extend({}, {
                    title: $(this).html(),
                    'class': $(this).attr('class'),
                    titleTooltip: $(this).attr('title'),
                    rowspan: $(this).attr('rowspan') ? +$(this).attr('rowspan') : undefined,
                    colspan: $(this).attr('colspan') ? +$(this).attr('colspan') : undefined
                }, $(this).data()));
            });
            columns.push(column);
        });
        if (!$.isArray(this.options.columns[0])) {
            this.options.columns = [this.options.columns];
        }
        this.options.columns = $.extend(true, [], columns, this.options.columns);
        this.columns = [];
        setFieldIndex(this.options.columns);
        $.each(this.options.columns, function (i, columns) {

            $.each(columns, function (j, column) {
                column = $.extend({}, BootstrapTable.COLUMN_DEFAULTS, column);

                if (typeof column.fieldIndex !== 'undefined') {
                    that.columns[column.fieldIndex] = column;
                }
                that.options.columns[i][j] = column;
            });
        });
        // if options.data is setting, do not process tbody data
        if (this.options.data.length) {
            return;
        }
        var m = [];
        this.$el.find('>tbody>tr').each(function (y) {
            var row = {};

            // save tr's id, class and data-* attributes
            row._id = $(this).attr('id');
            row._class = $(this).attr('class');
            row._data = getRealDataAttr($(this).data());

            $(this).find('>td').each(function (x) {
                var $this = $(this),
                    cspan = +$this.attr('colspan') || 1,
                    rspan = +$this.attr('rowspan') || 1,
                    tx, ty;

                for (; m[y] && m[y][x]; x++); //skip already occupied cells in current row

                for (tx = x; tx < x + cspan; tx++) { //mark matrix elements occupied by current cell with true
                    for (ty = y; ty < y + rspan; ty++) {
                        if (!m[ty]) { //fill missing rows
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }

                var field = that.columns[x].field;

                row[field] = $(this).html();
                // save td's id, class and data-* attributes
                row['_' + field + '_id'] = $(this).attr('id');
                row['_' + field + '_class'] = $(this).attr('class');
                row['_' + field + '_rowspan'] = $(this).attr('rowspan');
                row['_' + field + '_colspan'] = $(this).attr('colspan');
                row['_' + field + '_title'] = $(this).attr('title');
                row['_' + field + '_data' ] = getRealDataAttr($(this).data());
            });
            data.push(row);
        });
        this.options.data = data;
        if (data.length) this.fromHtml = true;
    };

    /**
     * 初始化表头
     */
    BootstrapTable.prototype.initHeader = function () {
        var that = this,
            visibleColumns = {},
            html = [], pywh = 0;

        this.header = {
            fields: [],
            styles: [],
            classes: [],
            formatters: [],
            events: [],
            sorters: [],
            sortNames: [],
            cellStyles: [],
            searchables: [],
            sorts:[]
        };

        //
        //循环options.columns 组建表头
        $.each(this.options.columns, function (i, columns) {
            html.push('<tr>');

            if (i === 0 && !that.options.cardView && that.options.detailView) {
                html.push(sprintf('<th class="detail" rowspan="%s"><div class="fht-cell"></div></th>',
                    that.options.columns.length));
            }

            $.each(columns, function (j, column) {
                var text = '',
                    halign = '', // header align style
                    align = '', // body align style
                    style = '',
                    class_ = sprintf(' class="%s"', column['class']),
                    order = that.options.sortOrder || column.order,
                    unitWidth = 'px',
                    sort = '',
                    width = column.width;

                //如果表格列项宽度为字符串- 则转换成百分比占比宽度
                if (column.width !== undefined && (!that.options.cardView)) {
                    if (typeof column.width === 'string') {
                        if (column.width.indexOf('%') !== -1) {
                            unitWidth = '%';
                        }
                    }
                }
                if (column.width && typeof column.width === 'string') {
                    width = column.width.replace('%', '').replace('px', '');
                }
                //--------------------------------------------
                if(column.width &&  Object.prototype.toString.apply(column.width) == '[object Number]'){
                    pywh += column.width;
                }
                sort = (column.fieldSort != undefined && column.fieldSort) ? column.fieldSort : '';
                halign = sprintf('text-align: %s; ', column.halign ? column.halign : column.align);
                align = sprintf('text-align: %s; ', column.align);
                //设置头部行颜色
                style = sprintf('vertical-align: %s; ', column.valign);
                style += sprintf('width: %s; ', (column.checkbox || column.radio) && !width ?
                    '36px' : (width ? width + unitWidth : undefined));
                //设置复杂表头合并列数据居中
                style += column.rowspan ? 'vertical-align: inherit; ':'';

                if (typeof column.fieldIndex !== 'undefined'
                    || typeof column.visible != 'undefined') {
                    that.header.fields[column.fieldIndex] = column.field;
                    that.header.styles[column.fieldIndex] = align + style;
                    that.header.classes[column.fieldIndex] = class_;
                    that.header.formatters[column.fieldIndex] = column.formatter;
                    that.header.events[column.fieldIndex] = column.events;
                    that.header.sorters[column.fieldIndex] = column.sorter;
                    that.header.sortNames[column.fieldIndex] = column.sortName;
                    that.header.cellStyles[column.fieldIndex] = column.cellStyle;
                    that.header.searchables[column.fieldIndex] = column.searchable;
                    that.header.sorts[column.fieldIndex] = sort;

                    if (!column.visible) {
                        return;
                    }

                    if (that.options.cardView && (!column.cardVisible)) {
                        return;
                    }

                    visibleColumns[column.field] = column;
                }

                style += column.style ? (new RegExp(';' + "$").test(column.style )? column.style: column.style+';'): '';

                html.push('<th' + sprintf(' title="%s"', column.titleTooltip),
                    column.checkbox || column.radio ?
                        sprintf(' class="bs-checkbox %s"', column['class'] || '') :
                        class_,
                    sprintf(' style="%s"', halign + style),
                    sprintf(' rowspan="%s"', column.rowspan),
                    sprintf(' colspan="%s"', column.colspan),
                    sprintf(' data-field="%s"', column.field),
                    sort.length > 0 ? sprintf(' data-sort="%s"', sort): '',
                    "tabindex='0'",
                    '>');

                html.push(sprintf('<div class="th-inner %s">', that.options.sortable && column.sortable ?
                    'sortable both' : ''));

                text = column.title;

                if (column.checkbox) {
                    if (!that.options.singleSelect && that.options.checkboxHeader) {
                        text = '<input name="btSelectAll" type="checkbox" />';
                    }
                    that.header.stateField = column.field;
                }
                if (column.radio) {
                    text = '';
                    that.header.stateField = column.field;
                    that.options.singleSelect = true;
                }

                if(!column.radio && !column.checkbox){
                    that.header.stateField = '__STATE__';
                }

                html.push(text);
                html.push('</div>');
                html.push('<div class="fht-cell"></div>');
                html.push('</div>');
                html.push('</th>');
            });
            html.push('</tr>');
        });

        this._$pywh = pywh;
        //TODO J2eeFAST 2021年07月08日15:47:27 表格列过多,根据表头列宽固定表格宽度
        //fix: 设置了固定宽度但是宽度没有达到窗体最大值就不设置
        if(pywh!=0 && this.options.isFixedColumn){
            if(pywh > this.$tableContainer.outerWidth()){
                this.$el.width(pywh + 'px');
                //设置显示滚动条overflow:scroll
                this.$tableBody.css('overflow-x','scroll');
            }
            this.$el.css('max-width', 'inherit');
            // this.$tableHeader.css({'overflow-y':'scroll'});
        }

        this.$header.html(html.join(''));
        this.$header.find('th[data-field]').each(function (i) {
            $(this).data(visibleColumns[$(this).data('field')]);
        });
        this.$container.off('click', '.th-inner').on('click', '.th-inner', function (event) {
            var target = $(this);

            if (that.options.detailView) {
                if (target.closest('.bootstrap-table')[0] !== that.$container[0])
                    return false;
            }

            if (that.options.sortable && target.parent().data().sortable) {
                that.onSort(event);
            }
        });

        this.$header.children().children().off('keypress').on('keypress', function (event) {
            if (that.options.sortable && $(this).data().sortable) {
                var code = event.keyCode || event.which;
                if (code == 13) { //Enter keycode
                    that.onSort(event);
                }
            }
        });

        $(window).off('resize.bootstrap-table');
        if (!this.options.showHeader || this.options.cardView) {
            this.$header.hide();
            //this.$tableHeader.hide();
            this.$tableLoading.css('top', 0);
        } else {
            this.$header.show();
            //this.$tableHeader.show();
            this.$tableLoading.css('top', this.$header.outerHeight() + 1);
            // Assign the correct sortable arrow
            // 表头设置排序箭头
            this.getCaret();
            //设置监听事件
            $(window).on('resize.bootstrap-table', $.proxy(this.resetWidth, this));
        }

        this.$selectAll = this.$header.find('[name="btSelectAll"]');
        this.$selectAll.off('click').on('click', function () {
            var checked = $(this).prop('checked');
            that[checked ? 'checkAll' : 'uncheckAll']();


            that.updateSelected();
        });



    };

    BootstrapTable.prototype.initFooter = function () {
        if (!this.options.totalShowFooter || this.options.cardView) {
            this.$tableFooter.hide();
        } else {
            this.$tableFooter.show();
        }
    };

    /**
     * @param data
     * @param type: append / prepend
     */
    BootstrapTable.prototype.initData = function (data, type) {
        if (type === 'append') {
            this.data = this.data.concat(data);
        } else if (type === 'prepend') {
            this.data = [].concat(data).concat(this.data);
        } else {
            this.data = data || this.options.data;
        }

        // Fix #839 Records deleted when adding new row on filtered table
        if (type === 'append') {
            this.options.data = this.options.data.concat(data);
        } else if (type === 'prepend') {
            this.options.data = [].concat(data).concat(this.options.data);
        } else {
            this.options.data = this.data;
        }

        if (this.options.sidePagination === 'server') {
            return;
        }
        this.initSort();
    };

    BootstrapTable.prototype.initSort = function () {
        var that = this,
            name = this.options.sortName,
            order = this.options.sortOrder === 'desc' ? -1 : 1,
            index = $.inArray(this.options.sortName, this.header.fields);

        if (this.options.customSort !== $.noop) {
            this.options.customSort.apply(this, [this.options.sortName, this.options.sortOrder]);
            return;
        }

        if (index !== -1) {
            if (this.options.sortStable) {
                $.each(this.data, function (i, row) {
                    if (!row.hasOwnProperty('_position')) row._position = i;
                });
            }

            this.data.sort(function (a, b) {
                if (that.header.sortNames[index]) {
                    name = that.header.sortNames[index];
                }
                var aa = getItemField(a, name, that.options.escape),
                    bb = getItemField(b, name, that.options.escape),
                    value = calculateObjectValue(that.header, that.header.sorters[index], [aa, bb]);

                if (value !== undefined) {
                    return order * value;
                }

                // Fix #161: undefined or null string sort bug.
                if (aa === undefined || aa === null) {
                    aa = '';
                }
                if (bb === undefined || bb === null) {
                    bb = '';
                }

                if (that.options.sortStable && aa === bb) {
                    aa = a._position;
                    bb = b._position;
                }

                // IF both values are numeric, do a numeric comparison
                if ($.isNumeric(aa) && $.isNumeric(bb)) {
                    // Convert numerical values form string to float.
                    aa = parseFloat(aa);
                    bb = parseFloat(bb);
                    if (aa < bb) {
                        return order * -1;
                    }
                    return order;
                }

                if (aa === bb) {
                    return 0;
                }

                // If value is not a string, convert to string
                if (typeof aa !== 'string') {
                    aa = aa.toString();
                }

                if (aa.localeCompare(bb) === -1) {
                    return order * -1;
                }

                return order;
            });
        }
    };

    BootstrapTable.prototype.onSort = function (event) {
        var $this = event.type === "keypress" ? $(event.currentTarget) : $(event.currentTarget).parent(),
            $this_ = this.$header.find('th').eq($this.index());

        this.$header.add(this.$header_).find('span.order').remove();

        if (this.options.sortName === $this.data('field')) {
            this.options.sortOrder = this.options.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // this.options.sortName = $this.data('field');
            // this.options.sortOrder = $this.data('order') === 'asc' ? 'desc' : 'asc';
            if(typeof $this.data('sort') != "undefined" ){
                this.options.sortName = $this.data('sort');
            }else{
                this.options.sortName = $this.data('field');
            }
            this.options.sortOrder = $this.data('order') === 'asc' ? 'desc' : 'asc';
        }
        this.trigger('sort', this.options.sortName, this.options.sortOrder);

        $this.add($this_).data('order', this.options.sortOrder);

        // Assign the correct sortable arrow
        this.getCaret();

        if (this.options.sidePagination === 'server') {
            this.initServer(this.options.silentSort);
            return;
        }

        this.initSort();
        this.initBody();
    };

    /**
     * 初始化表格工具栏
     */
    BootstrapTable.prototype.initToolbar = function () {
        var that = this,
            html = [],
            timeoutId = 0,
            $keepOpen,
            $search,
            switchableCount = 0;

        if (this.$toolbar.find('.bs-bars').children().length) {
            $('body').append($(this.options.toolbar));
        }

        this.$toolbar.html('');

        //TODO this.options.showToolbar false 不显示
        if(!this.options.showToolbar){
            return;
        }


        if (typeof this.options.toolbar === 'string' || typeof this.options.toolbar === 'object') {
            $(sprintf('<div class="bs-bars pull-%s"></div>', this.options.toolbarAlign))
                .appendTo(this.$toolbar)
                .append($(this.options.toolbar).css('display',''));
        }

        // showColumns, showToggle, showRefresh
        html = [sprintf('<div class="columns columns-%s btn-group pull-%s">',
            this.options.buttonsAlign, this.options.buttonsAlign)];

        if (typeof this.options.icons === 'string') {
            this.options.icons = calculateObjectValue(null, this.options.icons);
        }

        //导出
        //glyphicon glyphicon-export
        if (this.options.showExport) {
            html.push(sprintf('<button class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                '" type="button" name="export" title="%s">',
                this.options.formatExport()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.exportIcon),
                '</button>');
        }

        if(this.options.showCustomView){
            //glyphicon glyphicon-random
            html.push(sprintf('<button class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                '" type="button" name="customView" title="%s">',
                this.options.formatCardView()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.cardView),
                '</button>');
        }

        if (this.options.showSearch) {
            html.push(sprintf('<button class="btn' +
                sprintf(" btn-%s", this.options.buttonsClass) +
                sprintf(" btn-%s", this.options.iconSize) +
                '" type="button" name="showSearch" title="%s">',
                this.options.formatSearch()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.search), "</button>")
        }

        if (this.options.showPaginationSwitch) {
            html.push(sprintf('<button class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                '" type="button" name="paginationSwitch" title="%s">',
                this.options.formatPaginationSwitch()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.paginationSwitchDown),
                '</button>');
        }

        if (this.options.showRefresh) {
            html.push(sprintf('<button class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                '" type="button" name="refresh" title="%s">',
                this.options.formatRefresh()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.refresh),
                '</button>');
        }

        if (!this.options.showCustomView && this.options.showToggle) {
            html.push(sprintf('<button class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                '" type="button" name="toggle" title="%s">',
                this.options.formatToggle()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.toggle),
                '</button>');
        }

        //TODO 是否隐藏列下拉工具 如果是复杂表头不显示
        if (!this.options.showCustomView &&
            this.options.showColumns && this.options.columns.length == 1) {
            html.push(sprintf('<div class="keep-open btn-group" title="%s">',
                this.options.formatColumns()),
                '<button type="button" class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                ' dropdown-toggle" data-toggle="dropdown">',
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.columns),
                ' <span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu" role="menu">');
            $.each(this.columns, function (i, column) {
                if (column.radio || column.checkbox) {
                    return;
                }

                if (that.options.cardView && !column.cardVisible) {
                    return;
                }

                var checked = column.visible ? ' checked="checked"' : '';

                if (column.switchable) {
                    html.push(sprintf('<li>' +
                        '<label><input type="checkbox" data-field="%s" value="%s"%s> %s</label>' +
                        '</li>', column.field, i, checked, column.title));
                    switchableCount++;
                }
            });
            html.push('</ul>',
                '</div>');
        }

        html.push('</div>');

        // Fix #188: this.showToolbar is for extensions
        if (this.showToolbar || html.length > 2) {
            this.$toolbar.append(html.join(''));
        }


        //导出事件
        if (this.options.showExport) {
            this.$toolbar.find('button[name="export"]')
                .off('click').on('click', function () {
                if(typeof that.options.exportData == "function"){
                    calculateObjectValue(that.options, that.options.exportData, [], '');
                }
            });
        }

        if (this.options.showPaginationSwitch) {
            this.$toolbar.find('button[name="paginationSwitch"]')
                .off('click').on('click', $.proxy(this.togglePagination, this));
        }

        if (this.options.showRefresh) {
            this.$toolbar.find('button[name="refresh"]')
                .off('click').on('click', $.proxy(this.refresh, this));
        }

        if (this.options.showCustomView) {
            this.$toolbar.find('button[name="customView"]')
                .off('click').on('click', function () {
                that.__cardView();
            });
        }

        if(!this.options.showCustomView && this.options.showCustomView){
            this.$toolbar.find('button[name="toggle"]')
                .off('click').on('click', function () {
                that.toggleView();
            });
        }

        if (this.options.showSearch) {
            this.$toolbar.find('button[name="showSearch"]').off("click").on("click", function () {
                $(this).parents(".select-table").siblings().slideToggle()
            })
        }

        if (!this.options.showCustomView && this.options.showColumns) {
            $keepOpen = this.$toolbar.find('.keep-open');

            if (switchableCount <= this.options.minimumCountColumns) {
                $keepOpen.find('input').prop('disabled', true);
            }

            $keepOpen.find('li').off('click').on('click', function (event) {
                event.stopImmediatePropagation();
            });
            $keepOpen.find('input').off('click').on('click', function () {
                var $this = $(this);

                that.toggleColumn($(this).val(), $this.prop('checked'), false);
                that.trigger('column-switch', $(this).data('field'), $this.prop('checked'));
            });
        }

        if (this.options.search) {
            html = [];
            html.push(
                '<div class="pull-' + this.options.searchAlign + ' search">',
                sprintf('<input class="form-control' +
                    sprintf(' input-%s', this.options.iconSize) +
                    '" type="text" placeholder="%s">',
                    this.options.formatSearch()),
                '</div>');

            this.$toolbar.append(html.join(''));
            $search = this.$toolbar.find('.search input');
            $search.off('keyup drop').on('keyup drop', function (event) {
                if (that.options.searchOnEnterKey && event.keyCode !== 13) {
                    return;
                }

                if ($.inArray(event.keyCode, [37, 38, 39, 40]) > -1) {
                    return;
                }

                clearTimeout(timeoutId); // doesn't matter if it's 0
                timeoutId = setTimeout(function () {
                    that.onSearch(event);
                }, that.options.searchTimeOut);
            });

            if (isIEBrowser()) {
                $search.off('mouseup').on('mouseup', function (event) {
                    clearTimeout(timeoutId); // doesn't matter if it's 0
                    timeoutId = setTimeout(function () {
                        that.onSearch(event);
                    }, that.options.searchTimeOut);
                });
            }
        }
    };

    BootstrapTable.prototype.onSearch = function (event) {
        var text = $.trim($(event.currentTarget).val());

        // trim search input
        if (this.options.trimOnSearch && $(event.currentTarget).val() !== text) {
            $(event.currentTarget).val(text);
        }

        if (text === this.searchText) {
            return;
        }
        this.searchText = text;
        this.options.searchText = text;

        this.options.pageNumber = 1;
        this.initSearch();
        this.updatePagination();
        this.trigger('search', text);
    };

    BootstrapTable.prototype.initSearch = function () {
        var that = this;

        if (this.options.sidePagination !== 'server') {
            if (this.options.customSearch !== $.noop) {
                this.options.customSearch.apply(this, [this.searchText]);
                return;
            }

            var s = this.searchText && (this.options.escape ?
                escapeHTML(this.searchText) : this.searchText).toLowerCase();
            var f = $.isEmptyObject(this.filterColumns) ? null : this.filterColumns;

            // Check filter
            this.data = f ? $.grep(this.options.data, function (item, i) {
                for (var key in f) {
                    if ($.isArray(f[key]) && $.inArray(item[key], f[key]) === -1 ||
                        item[key] !== f[key]) {
                        return false;
                    }
                }
                return true;
            }) : this.options.data;

            this.data = s ? $.grep(this.data, function (item, i) {
                for (var j = 0; j < that.header.fields.length; j++) {

                    if (!that.header.searchables[j]) {
                        continue;
                    }

                    var key = $.isNumeric(that.header.fields[j]) ? parseInt(that.header.fields[j], 10) : that.header.fields[j];
                    var column = that.columns[getFieldIndex(that.columns, key)];
                    var value;

                    if (typeof key === 'string') {
                        value = item;
                        var props = key.split('.');
                        for (var prop_index = 0; prop_index < props.length; prop_index++) {
                            value = value[props[prop_index]];
                        }

                        // Fix #142: respect searchForamtter boolean
                        if (column && column.searchFormatter) {
                            value = calculateObjectValue(column,
                                that.header.formatters[j], [value, item, i], value);
                        }
                    } else {
                        value = item[key];
                    }

                    if (typeof value === 'string' || typeof value === 'number') {
                        if (that.options.strictSearch) {
                            if ((value + '').toLowerCase() === s) {
                                return true;
                            }
                        } else {
                            if ((value + '').toLowerCase().indexOf(s) !== -1) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }) : this.data;
        }
    };

    //初始化分页条
    BootstrapTable.prototype.initPagination = function () {
        if (!this.options.pagination) {
            this.$pagination.hide();
            return;
        } else {
            this.$pagination.show();
        }

        var that = this,
            html = [],
            $allSelected = false,
            i, from, to,
            $pageList,
            $first, $pre,
            $next, $last,
            $number,
            data = this.getData(),
            pageList = this.options.pageList;

        if (this.options.sidePagination !== 'server') {
            this.options.totalRows = data.length;
        }

        this.totalPages = 0;
        if (this.options.totalRows) {
            if (this.options.pageSize === this.options.formatAllRows()) {
                this.options.pageSize = this.options.totalRows;
                $allSelected = true;
            } else if (this.options.pageSize === this.options.totalRows) {
                // Fix #667 Table with pagination,
                // multiple pages and a search that matches to one page throws exception
                var pageLst = typeof this.options.pageList === 'string' ?
                    this.options.pageList.replace('[', '').replace(']', '')
                        .replace(/ /g, '').toLowerCase().split(',') : this.options.pageList;
                if ($.inArray(this.options.formatAllRows().toLowerCase(), pageLst)  > -1) {
                    $allSelected = true;
                }
            }

            this.totalPages = ~~((this.options.totalRows - 1) / this.options.pageSize) + 1;

            this.options.totalPages = this.totalPages;
        }
        if (this.totalPages > 0 && this.options.pageNumber > this.totalPages) {
            this.options.pageNumber = this.totalPages;
        }

        this.pageFrom = (this.options.pageNumber - 1) * this.options.pageSize + 1;
        this.pageTo = this.options.pageNumber * this.options.pageSize;
        if (this.pageTo > this.options.totalRows) {
            this.pageTo = this.options.totalRows;
        }

        html.push(
            '<div class="pull-' + this.options.paginationDetailHAlign + ' pagination-detail">',
            '<span class="pagination-info">',
            this.options.onlyInfoPagination ? this.options.formatDetailPagination(this.options.totalRows) :
                this.options.formatShowingRows(this.pageFrom, this.pageTo, this.options.totalRows),
            '</span>');

        if (!this.options.onlyInfoPagination) {
            html.push('<span class="page-list">');

            var pageNumber = [
                sprintf('<span class="btn-group %s">',
                    this.options.paginationVAlign === 'top' || this.options.paginationVAlign === 'both' ?
                        'dropdown' : 'dropup'),
                '<button type="button" class="btn' +
                sprintf(' btn-%s', this.options.buttonsClass) +
                sprintf(' btn-%s', this.options.iconSize) +
                ' dropdown-toggle" data-toggle="dropdown">',
                '<span class="page-size">',
                $allSelected ? this.options.formatAllRows() : this.options.pageSize,
                '</span>',
                ' <span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu" role="menu">'
            ];

            if (typeof this.options.pageList === 'string') {
                var list = this.options.pageList.replace('[', '').replace(']', '')
                    .replace(/ /g, '').split(',');

                pageList = [];
                $.each(list, function (i, value) {
                    pageList.push(value.toUpperCase() === that.options.formatAllRows().toUpperCase() ?
                        that.options.formatAllRows() : +value);
                });
            }

            $.each(pageList, function (i, page) {
                if (!that.options.smartDisplay || i === 0 || pageList[i - 1] <= that.options.totalRows) {
                    var active;
                    if ($allSelected) {
                        active = page === that.options.formatAllRows() ? ' class="active"' : '';
                    } else {
                        active = page === that.options.pageSize ? ' class="active"' : '';
                    }
                    pageNumber.push(sprintf('<li%s><a href="javascript:void(0)">%s</a></li>', active, page));
                }
            });
            pageNumber.push('</ul></span>');

            html.push(this.options.formatRecordsPerPage(pageNumber.join('')));

            html.push('</span>');

            //显示勾选总记录数量
            if(this.options.showCheckNumber){
                html.push('<span class="check-numer"></span>')
            }

            html.push('</div>',
                '<div class="pull-' + this.options.paginationHAlign + ' pagination">',
                '<ul class="pagination' + sprintf(' pagination-%s', this.options.iconSize) + '">',
                '<li class="page-pre"><a href="javascript:void(0)">' + this.options.paginationPreText + '</a></li>');

            if (this.totalPages < 5) {
                from = 1;
                to = this.totalPages;
            } else {
                from = this.options.pageNumber - 2;
                to = from + 4;
                if (from < 1) {
                    from = 1;
                    to = 5;
                }
                if (to > this.totalPages) {
                    to = this.totalPages;
                    from = to - 4;
                }
            }

            if (this.totalPages >= 6) {
                if (this.options.pageNumber >= 3) {
                    html.push('<li class="page-first' + (1 === this.options.pageNumber ? ' active' : '') + '">',
                        '<a href="javascript:void(0)">', 1, '</a>',
                        '</li>');

                    from++;
                }

                if (this.options.pageNumber >= 4) {
                    if (this.options.pageNumber == 4 || this.totalPages == 6 || this.totalPages == 7) {
                        from--;
                    } else {
                        html.push('<li class="page-first-separator disabled">',
                            '<a href="javascript:void(0)">...</a>',
                            '</li>');
                    }

                    to--;
                }
            }

            if (this.totalPages >= 7) {
                if (this.options.pageNumber >= (this.totalPages - 2)) {
                    from--;
                }
            }

            if (this.totalPages == 6) {
                if (this.options.pageNumber >= (this.totalPages - 2)) {
                    to++;
                }
            } else if (this.totalPages >= 7) {
                if (this.totalPages == 7 || this.options.pageNumber >= (this.totalPages - 3)) {
                    to++;
                }
            }

            for (i = from; i <= to; i++) {
                html.push('<li class="page-number' + (i === this.options.pageNumber ? ' active' : '') + '">',
                    '<a href="javascript:void(0)">', i, '</a>',
                    '</li>');
            }

            if (this.totalPages >= 8) {
                if (this.options.pageNumber <= (this.totalPages - 4)) {
                    html.push('<li class="page-last-separator disabled">',
                        '<a href="javascript:void(0)">...</a>',
                        '</li>');
                }
            }

            if (this.totalPages >= 6) {
                if (this.options.pageNumber <= (this.totalPages - 3)) {
                    html.push('<li class="page-last' + (this.totalPages === this.options.pageNumber ? ' active' : '') + '">',
                        '<a href="javascript:void(0)">', this.totalPages, '</a>',
                        '</li>');
                }
            }

            html.push(
                '<li class="page-next"><a href="javascript:void(0)">' + this.options.paginationNextText + '</a></li>',
                '</ul>',
                '</div>');
        }else{
            //显示勾选总记录数量
            if(this.options.showCheckNumber){
                html.push('<span class="check-numer"></span>')
            }
            html.push('</div>');
        }

        this.$pagination.html(html.join(''));

        if (!this.options.onlyInfoPagination) {
            $pageList = this.$pagination.find('.page-list a');
            $first = this.$pagination.find('.page-first');
            $pre = this.$pagination.find('.page-pre');
            $next = this.$pagination.find('.page-next');
            $last = this.$pagination.find('.page-last');
            $number = this.$pagination.find('.page-number');

            if (this.options.smartDisplay) {
                if (this.totalPages <= 1) {
                    this.$pagination.find('div.pagination').hide();
                }
                if (pageList.length < 2 || this.options.totalRows <= pageList[0]) {
                    this.$pagination.find('span.page-list').hide();
                }

                // when data is empty, hide the pagination
                this.$pagination[this.getData().length ? 'show' : 'hide']();
            }
            if ($allSelected) {
                this.options.pageSize = this.options.formatAllRows();
            }
            $pageList.off('click').on('click', $.proxy(this.onPageListChange, this));
            $first.off('click').on('click', $.proxy(this.onPageFirst, this));
            $pre.off('click').on('click', $.proxy(this.onPagePre, this));
            $next.off('click').on('click', $.proxy(this.onPageNext, this));
            $last.off('click').on('click', $.proxy(this.onPageLast, this));
            $number.off('click').on('click', $.proxy(this.onPageNumber, this));
        }

        //TODO 修复跳转指定页
        if (this.options.showPageGo) {
            var pagination = that.$pagination.find("ul.pagination"),
                pagego = pagination.find("li.pageGo");
            if (!pagego.length) {
                pagego = $(['<li class="pageGo">', sprintf('<input type="text" class="form-control" value="%s">', this.options.pageNumber), '<button class="btn' + sprintf(" btn-%s", this.options.buttonsClass) + sprintf(" btn-%s", this.options.iconSize) + '" title="' + this.options.formatPageGo() + '" ' + ' type="button">' + this.options.formatPageGo(), "</button>", "</li>"].join("")).appendTo(pagination);
                pagego.find("button").click(function() {
                    var flag = parseInt(pagego.find("input").val()) || 1;
                    if (flag < 1 || flag > that.options.totalPages) {
                        flag = 1
                    }
                    that.selectPage(flag)
                })
            }
        }
    };

    BootstrapTable.prototype.updatePagination = function (event) {
        // Fix #171: IE disabled button can be clicked bug.
        if (event && $(event.currentTarget).hasClass('disabled')) {
            return;
        }

        if (!this.options.maintainSelected) {
            this.resetRows();
        }

        this.initPagination();
        if (this.options.sidePagination === 'server') {
            this.initServer();
        } else {
            this.initBody();
        }

        this.trigger('page-change', this.options.pageNumber, this.options.pageSize);
    };

    BootstrapTable.prototype.onPageListChange = function (event) {
        var $this = $(event.currentTarget);

        $this.parent().addClass('active').siblings().removeClass('active');
        this.options.pageSize = $this.text().toUpperCase() === this.options.formatAllRows().toUpperCase() ?
            this.options.formatAllRows() : +$this.text();
        this.$toolbar.find('.page-size').text(this.options.pageSize);

        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageFirst = function (event) {
        this.options.pageNumber = 1;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPagePre = function (event) {
        if ((this.options.pageNumber - 1) === 0) {
            this.options.pageNumber = this.options.totalPages;
        } else {
            this.options.pageNumber--;
        }
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageNext = function (event) {
        if ((this.options.pageNumber + 1) > this.options.totalPages) {
            this.options.pageNumber = 1;
        } else {
            this.options.pageNumber++;
        }
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageLast = function (event) {
        this.options.pageNumber = this.totalPages;
        this.updatePagination(event);
    };

    BootstrapTable.prototype.onPageNumber = function (event) {
        if (this.options.pageNumber === +$(event.currentTarget).text()) {
            return;
        }
        this.options.pageNumber = +$(event.currentTarget).text();
        this.updatePagination(event);
    };

    BootstrapTable.prototype.initBody = function (fixedScroll) {
        var that = this,
            html = [],
            data = this.getData();
        this.trigger('pre-body', data);

        this.$body = this.$el.find('>tbody');

        if (!this.$body.length) {
            this.$body = $('<tbody></tbody>').appendTo(this.$el);
        }

        //Fix #389 Bootstrap-table-flatJSON is not working

        if (!this.options.pagination || this.options.sidePagination === 'server') {
            this.pageFrom = 1;
            this.pageTo = data.length;
        }

        // if ( true ) {
        //     var key,
        //         item = {},
        //         style = {},
        //         csses = [],
        //         data_ = '',
        //         attributes = {},
        //         htmlAttributes = [];
        //
        //     //style = calculateObjectValue(this.options, this.options.rowStyle, [item, i], style);
        //
        //     if(typeof style == "undefined"){
        //         style = {};
        //     }else{
        //         if (style && style.css) {
        //             for (key in style.css) {
        //                 csses.push(key + ': ' + style.css[key]);
        //             }
        //         }
        //     }
        //     csses.push('height: auto')
        //     // csses.push('display: none')
        //     var trCss = csses.length > 0 ? sprintf(' style="%s"', csses.join('; ')) : '';
        //     html.push('<tr',
        //         sprintf('%s', trCss),
        //         sprintf(' class="%s"', 'firstrow'),
        //         sprintf('%s', data_),
        //         '>'
        //     );
        //
        //
        //     if (!this.options.cardView && this.options.detailView) {
        //         html.push('<td>',
        //             '<a class="detail-icon" href="javascript:">',
        //             sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.detailOpen),
        //             '</a>',
        //             '</td>');
        //     }
        //
        //     $.each(this.header.fields, function (j, field) {
        //
        //         var text = '',
        //             value = '',
        //             type = '',
        //             cellStyle = {},
        //             id_ = '',
        //             class_ = that.header.classes[j],
        //             data_ = '',
        //             rowspan_ = '',
        //             colspan_ = '',
        //             title_ = '',
        //             column = that.columns[j];
        //         if (that.fromHtml && typeof value === 'undefined') {
        //             return;
        //         }
        //         if (!column.visible) {
        //             return;
        //         }
        //         if (that.options.cardView && !column.cardVisible) {
        //             return;
        //         }
        //
        //         // style = sprintf('style="%s"', csses.concat(that.header.styles[j]).join('; '));
        //         var _tt = [];
        //         _tt.push('height: 0px');
        //         _tt.push('line-height: initial');
        //         _tt.push('width: '+column.width + 'px');
        //         style = sprintf('style="%s"',  _tt.concat().join('; '));
        //
        //         // handle td's id and class
        //         // if (item['_' + field + '_id']) {
        //         //     id_ = sprintf(' id="%s"', item['_' + field + '_id']);
        //         // }
        //         // if (item['_' + field + '_class']) {
        //         //     class_ = sprintf(' class="%s"', item['_' + field + '_class']);
        //         // }
        //         // if (item['_' + field + '_rowspan']) {
        //         //     rowspan_ = sprintf(' rowspan="%s"', item['_' + field + '_rowspan']);
        //         // }
        //         // if (item['_' + field + '_colspan']) {
        //         //     colspan_ = sprintf(' colspan="%s"', item['_' + field + '_colspan']);
        //         // }
        //         // if (item['_' + field + '_title']) {
        //         //     title_ = sprintf(' title="%s"', item['_' + field + '_title']);
        //         // }
        //
        //         // cellStyle = calculateObjectValue(that.header,
        //         //     that.header.cellStyles[j], [value, item, i, field], cellStyle);
        //         // if (typeof cellStyle !="undefined" && cellStyle.classes) {
        //         //     class_ = sprintf(' class="%s"', cellStyle.classes);
        //         // }
        //         // if (typeof cellStyle !="undefined" && cellStyle.css) {
        //         //     var csses_ = [];
        //         //     for (var key in cellStyle.css) {
        //         //         csses_.push(key + ': ' + cellStyle.css[key]);
        //         //     }
        //         //     csses_.push('height: 0px');
        //         //     style = sprintf('style="%s"', csses_.concat(that.header.styles[j]).join('; '));
        //         // }
        //
        //         // value = calculateObjectValue(column,
        //         //     that.header.formatters[j], [value, item, i], value);
        //
        //         //TODO 扩增表格行titel提示 修复转义问题
        //         // if(title_ === ""){
        //         //     var tp = getItemField(item, field, that.options.escape);
        //         //     if(field && tp && tp.length > 0){
        //         //         var reg = /<[^>]+>/g;
        //         //         if(reg.test(value)){
        //         //             if($(value).is('span')){
        //         //                 var txt = $(value).html();
        //         //                 title_ = sprintf(' title="%s"', txt);
        //         //             }
        //         //         }else{
        //         //             title_ = sprintf(' title="%s"', value);
        //         //         }
        //         //     }
        //         // }
        //
        //         // if (item['_' + field + '_data'] && !$.isEmptyObject(item['_' + field + '_data'])) {
        //         //     $.each(item['_' + field + '_data'], function (k, v) {
        //         //         // ignore data-index
        //         //         if (k === 'index') {
        //         //             return;
        //         //         }
        //         //         data_ += sprintf(' data-%s="%s"', k, v);
        //         //     });
        //         // }
        //
        //         // 源码自带 如果数据为 null 或者 undefined 显示 undefinedText
        //         value = "";
        //
        //         text = that.options.cardView ? ['<div class="card-view">', that.options.showHeader ? sprintf('<span class="title" %s>%s</span>', style,
        //             getPropertyFromOther(that.columns, 'field', 'title', field)) : '',
        //             //sprintf('<span class="value">%s</span>', value),
        //             sprintf('<span %s>%s</span>', (class_===''?'class="value"':class_),value),
        //             '</div>'
        //         ].join('') : [sprintf('<td%s %s %s %s %s %s %s>',
        //             id_, class_, style, data_, rowspan_, colspan_, title_),
        //             value,
        //             '</td>'
        //         ].join('');
        //
        //         // Hide empty data on Card view when smartDisplay is set to true.
        //         if (that.options.cardView && that.options.smartDisplay && value === '') {
        //             // Should set a placeholder for event binding correct fieldIndex
        //             text = '<div class="card-view"></div>';
        //         }
        //
        //         html.push(text);
        //     });
        //
        //     html.push('</tr>');
        // }

        for (var i = this.pageFrom - 1; i < this.pageTo; i++) {
            var key,
                item = data[i],
                style = {},
                csses = [],
                data_ = '',
                attributes = {},
                htmlAttributes = [];

            style = calculateObjectValue(this.options, this.options.rowStyle, [item, i], style);

            if(typeof style == "undefined"){
                style = {};
            }else{
                if (style && style.css) {
                    for (key in style.css) {
                        csses.push(key + ': ' + style.css[key]);
                    }
                }
            }

            attributes = calculateObjectValue(this.options,
                this.options.rowAttributes, [item, i], attributes);

            if (attributes) {
                for (key in attributes) {
                    htmlAttributes.push(sprintf('%s="%s"', key, escapeHTML(attributes[key])));
                }
            }

            if (item._data && !$.isEmptyObject(item._data)) {
                $.each(item._data, function (k, v) {
                    // ignore data-index
                    if (k === 'index') {
                        return;
                    }
                    data_ += sprintf(' data-%s="%s"', k, v);
                });
            }
            var trCss = csses.length > 0 ? sprintf(' style="%s"', csses.join('; ')) : '';
            html.push('<tr',
                sprintf(' %s', htmlAttributes.join(' ')),
                sprintf('%s', trCss),
                sprintf(' id="%s"', $.isArray(item) ? undefined : item._id),
                sprintf(' class="%s"', style.classes || ($.isArray(item) ? undefined : item._class)),
                sprintf(' data-index="%s"', i),
                sprintf(' data-uniqueid="%s"', item[this.options.uniqueId]),
                sprintf('%s', data_),
                '>'
            );

            if (this.options.cardView) {
                html.push(sprintf('<td colspan="%s"><div class="card-views">', this.header.fields.length));
            }

            if (!this.options.cardView && this.options.detailView) {
                html.push('<td>',
                    '<a class="detail-icon" href="javascript:">',
                    sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.detailOpen),
                    '</a>',
                    '</td>');
            }
            $.each(this.header.fields, function (j, field) {

                var text = '',
                    value = getItemField(item, field, that.options.escape),
                    type = '',
                    cellStyle = {},
                    id_ = '',
                    class_ = that.header.classes[j],
                    data_ = '',
                    rowspan_ = '',
                    colspan_ = '',
                    title_ = '',
                    column = that.columns[j];
                if (that.fromHtml && typeof value === 'undefined') {
                    return;
                }
                if (!column.visible) {
                    return;
                }
                if (that.options.cardView && !column.cardVisible) {
                    return;
                }

                // style = sprintf('style="%s"', csses.concat(that.header.styles[j]).join('; '));
                var _tt = [];
                style = sprintf('style="%s"',  _tt.concat(that.header.styles[j]).join('; '));

                // handle td's id and class
                if (item['_' + field + '_id']) {
                    id_ = sprintf(' id="%s"', item['_' + field + '_id']);
                }
                if (item['_' + field + '_class']) {
                    class_ = sprintf(' class="%s"', item['_' + field + '_class']);
                }
                if (item['_' + field + '_rowspan']) {
                    rowspan_ = sprintf(' rowspan="%s"', item['_' + field + '_rowspan']);
                }
                if (item['_' + field + '_colspan']) {
                    colspan_ = sprintf(' colspan="%s"', item['_' + field + '_colspan']);
                }
                if (item['_' + field + '_title']) {
                    title_ = sprintf(' title="%s"', item['_' + field + '_title']);
                }

                cellStyle = calculateObjectValue(that.header,
                    that.header.cellStyles[j], [value, item, i, field], cellStyle);
                if (typeof cellStyle !="undefined" && cellStyle.classes) {
                    class_ = sprintf(' class="%s"', cellStyle.classes);
                }
                if (typeof cellStyle !="undefined" && cellStyle.css) {
                    var csses_ = [];
                    for (var key in cellStyle.css) {
                        csses_.push(key + ': ' + cellStyle.css[key]);
                    }
                    style = sprintf('style="%s"', csses_.concat(that.header.styles[j]).join('; '));
                }

                value = calculateObjectValue(column,
                    that.header.formatters[j], [value, item, i], value);

                //TODO 扩增表格行titel提示 修复转义问题
                if(title_ === ""){
                    var tp = getItemField(item, field, that.options.escape);
                    if(field && tp && tp.length > 0){
                        var reg = /<[^>]+>/g;
                        if(reg.test(value)){
                            if($(value).is('span')){
                                var txt = $(value).html();
                                title_ = sprintf(' title="%s"', txt);
                            }
                        }else{
                            title_ = sprintf(' title="%s"', value);
                        }
                    }
                }

                if (item['_' + field + '_data'] && !$.isEmptyObject(item['_' + field + '_data'])) {
                    $.each(item['_' + field + '_data'], function (k, v) {
                        // ignore data-index
                        if (k === 'index') {
                            return;
                        }
                        data_ += sprintf(' data-%s="%s"', k, v);
                    });
                }

                if (column.checkbox || column.radio) {
                    type = column.checkbox ? 'checkbox' : type;
                    type = column.radio ? 'radio' : type;
                    text = [sprintf(that.options.cardView ?
                        '<div class="card-view %s">' : '<td class="bs-checkbox %s">', column['class'] || ''),
                        '<input' +
                        sprintf(' data-index="%s"', i) +
                        sprintf(' name="%s"', that.options.selectItemName) +
                        sprintf(' type="%s"', type) +
                        sprintf(' value="%s"', item[that.options.idField]) +
                        sprintf(' checked="%s"', value === true ||
                        (value && value.checked) ? 'checked' : undefined) +
                        sprintf(' disabled="%s"', !column.checkboxEnabled ||
                        (value && value.disabled) ? 'disabled' : undefined) +
                        ' />',
                        that.header.formatters[j] && typeof value === 'string' ? value : '',
                        that.options.cardView ? '</div>' : '</td>'
                    ].join('');

                    item[that.header.stateField] = value === true || (value && value.checked);
                } else {
                    // 源码自带 如果数据为 null 或者 undefined 显示 undefinedText
                    value = typeof value === 'undefined' || value === null ?
                        that.options.undefinedText : value;

                    //TODO 扩增如果数据为""空 则显示设置字符
                    value = value === "" ? that.options.emptyText : value;



                    text = that.options.cardView ? ['<div class="card-view">',
                        that.options.showHeader ? sprintf('<span class="title" %s>%s</span>', style,
                            getPropertyFromOther(that.columns, 'field', 'title', field)) : '',
                        //sprintf('<span class="value">%s</span>', value),
                        sprintf('<span %s>%s</span>', (class_===''?'class="value"':class_),value),
                        '</div>'
                    ].join('') : [sprintf('<td%s %s %s %s %s %s %s>',
                        id_, class_, style, data_, rowspan_, colspan_, title_),
                        value,
                        '</td>'
                    ].join('');

                    // Hide empty data on Card view when smartDisplay is set to true.
                    if (that.options.cardView && that.options.smartDisplay && value === '') {
                        // Should set a placeholder for event binding correct fieldIndex
                        text = '<div class="card-view"></div>';
                    }
                }
                html.push(text);
            });

            if (this.options.cardView) {
                html.push('</div></td>');
            }

            html.push('</tr>');
        }

        // show no records
        if (!html.length) {
            // 如果没有数据
            html.push('<tr class="no-records-found">',
                sprintf('<td colspan="%s">%s</td>',
                    this.$header.find('th').length, this.options.formatNoMatches()),
                '</tr>');
            // 如果有统计则更新 border-bottom-width: 0px;
            this.$el.css({'height':'100%','border-bottom-width':'0px'});
            this.$tableBody.css('background-color','rgb(249 249 249)');
        }else{
            this.$el.css('height','');
            this.$el.css('border-bottom-width','');
            this.$tableBody.css('background-color','');
        }

        this.$body.html(html.join(''));

        //
        if(this.options.showCustomView === true
            && data.length > 0){
            var __view = calculateObjectValue(this, this.options.customViewFormatter, [data], '');
            this.$customView.html(__view);
        }

        if (!fixedScroll) {
            this.scrollTo(0);
        }

        // click to select by column
        this.$body.find('> tr[data-index] > td').off('click dblclick').on('click dblclick', function (e) {
            var $td = $(this),
                $tr = $td.parent(),
                item = that.data[$tr.data('index')],
                index = $td[0].cellIndex,
                fields = that.getVisibleFields(),
                field = fields[that.options.detailView && !that.options.cardView ? index - 1 : index],
                column = that.columns[getFieldIndex(that.columns, field)],
                value = getItemField(item, field, that.options.escape);
            // if(that.options.fixedColumns){
            //     $("#"+that.options.id+"-left-fixed-body-columns").find('tbody').find('tr[data-index="'+$tr.data('index')+'"]')
            //         .children(".bs-checkbox").find("input[name=btSelectItem]").trigger("click");
            // }else{
            if ($td.find('.detail-icon').length) {
                return;
            }
            //console.log('-->>>>column:',e.type);
            // console.log('-->>>>item:',e.type === 'click' && that.options.clickToSelect && column.clickToSelect);
            that.trigger(e.type === 'click' ? 'click-cell' : 'dbl-click-cell', field, value, item, $td);
            that.trigger(e.type === 'click' ? 'click-row' : 'dbl-click-row', item, $tr, field);

            // if click to select - then trigger the checkbox/radio click
            if (e.type === 'click' && that.options.clickToSelect && column.clickToSelect) {
                var $selectItem = $tr.find(sprintf('[name="%s"]', that.options.selectItemName));
                if ($selectItem.length) {
                    $selectItem[0].click(); // #144: .trigger('click') bug
                }else{
                    //单击选择 首列无单选或者多选
                    if(that.options.singleSelect){
                        that.$body.find('> tr[data-index]').each(function(){
                            if($(this).data('index') == $tr.data('index')){
                                $(this).addClass('selected');
                                that.data[$(this).data('index')][that.header.stateField] = true;
                            }else{
                                $(this).removeClass('selected');
                                that.data[$(this).data('index')][that.header.stateField] = false;
                            }
                        })
                    }
                }
            }
            // }
        });

        this.$body.find('> tr[data-index] > td > .detail-icon').off('click').on('click', function () {
            var $this = $(this),
                $tr = $this.parent().parent(),
                index = $tr.data('index'),
                row = data[index]; // Fix #980 Detail view, when searching, returns wrong row

            // remove and update
            if ($tr.next().is('tr.detail-view')) {
                $this.find('i').attr('class', sprintf('%s %s', that.options.iconsPrefix, that.options.icons.detailOpen));
                $tr.next().remove();
                that.trigger('collapse-row', index, row);
            } else {
                $this.find('i').attr('class', sprintf('%s %s', that.options.iconsPrefix, that.options.icons.detailClose));
                $tr.after(sprintf('<tr class="detail-view"><td colspan="%s"></td></tr>', $tr.find('td').length));
                var $element = $tr.next().find('td');
                var content = calculateObjectValue(that.options, that.options.detailFormatter, [index, row, $element], '');
                if($element.length === 1) {
                    $element.append(content);
                }
                that.trigger('expand-row', index, row, $element);
            }
            //that.resetView();
        });

        // 行多选单选事件
        this.$selectItem = this.$body.find(sprintf('[name="%s"]', this.options.selectItemName));

        this.$selectItem.off('click').on('click', function (event) {

            event.stopImmediatePropagation();

            var $this = $(this),
                checked = $this.prop('checked'),
                row = that.data[$this.data('index')];

            if (that.options.maintainSelected && $(this).is(':radio')) {
                $.each(that.options.data, function (i, row) {
                    row[that.header.stateField] = false;
                });
            }

            //是否冻结右侧
            if(that.options.rightFixedColumns && that.$rightfixedBody){
                var index = $(this).data('index');
                if (that.options.singleSelect) {
                    that.$rightfixedBody.find('tr').each(function () {
                        $(this).removeClass('selected');
                    })
                    that.$rightfixedBody.find('tr[data-index="'+index+'"]').each(function () {
                        $(this).addClass('selected');
                    })
                }else{
                    that.$rightfixedBody.find('tr[data-index="'+index+'"]').each(function () {
                        checked  ? $(this).addClass('selected') : $(this).removeClass('selected');
                    })
                }
            }

            //冻结左侧
            if(that.options.fixedColumns){
                var index = $(this).data('index');
                $this.parent().parent('tr[data-index="'+index+'"]').toggleClass("selected");
                that.$body.find('tr[data-index="'+index+'"]').children(".bs-checkbox").find("input[name=btSelectItem]").prop('checked', checked);
            }

            row[that.header.stateField] = checked;

            if (that.options.singleSelect) {
                that.$selectItem.not(this).each(function () {
                    that.data[$(this).data('index')][that.header.stateField] = false;
                });
                that.$selectItem.filter(':checked').not(this).prop('checked', false);
            }

            that.updateSelected();
            that.trigger(checked ? 'check' : 'uncheck', row, $this);


            // 允许其他监听
            //event.stopImmediatePropagation();
            //
            // var $this = $(this),
            //     checked = $this.prop('checked'),
            //     row = that.data[$this.data('index')];
            //
            // if ($(this).is(':radio') || that.options.singleSelect) {
            //     $.each(that.options.data, function (i, row) {
            //         row[that.header.stateField] = false;
            //     });
            // }
            //
            // row[that.header.stateField] = checked;
            //
            // if (that.options.singleSelect) {
            //     that.$selectItem.not(this).each(function () {
            //         that.data[$(this).data('index')][that.header.stateField] = false;
            //     });
            //     that.$selectItem.filter(':checked').not(this).prop('checked', false);
            // }
            //
            // that.updateSelected();
            // that.trigger(checked ? 'check' : 'uncheck', row, $this);


            // //勾选点击事件
            // event.stopImmediatePropagation();
            // var $this = $(this),
            //     checked = $this.prop('checked'),
            //     index = $this.data('index'),
            //     row = that.data[$this.data('index')];
            //
            // if(that.options.fixedColumns){
            //     //冻结点击事件
            //     //var index = $this.data('index');
            //     // checked? that.$body.find('tr[data-index="'+index+'"]').addClass('selected'): that.$body.find('tr[data-index="'+index+'"]').removeClass('selected');
            //     // console.log("----"+that.$body.find('tr[data-index="'+index+'"]').children(".bs-checkbox").html());
            //     // if(that.options.rightFixedColumns){
            //     //     that.$rightfixedBody.find('tr[data-index="'+index+'"]').each(function () {
            //     //         checked  ? $(this).addClass('selected') : $(this).removeClass('selected');
            //     //     })
            //     // }
            //
            //
            //     $this.parent().parent('tr[data-index="'+index+'"]').toggleClass("selected");
            //     that.$body.find('tr[data-index="'+index+'"]').children(".bs-checkbox").find("input[name=btSelectItem]").prop('checked', checked);
            //
            //     if (that.options.maintainSelected && $(this).is(':radio')) {
            //         $.each(that.options.data, function (i, row) {
            //             row[that.header.stateField] = false;
            //         });
            //     }
            //
            //     row[that.header.stateField] = checked;
            //
            //     // //只能选一个
            //     if (that.options.singleSelect) {
            //         that.$selectItem.not(this).each(function () {
            //             that.data[$(this).data('index')][that.header.stateField] = false;
            //         });
            //         that.$selectItem.filter(':checked').not(this).prop('checked', false);
            //     }
            //
            //     that.updateSelected();
            //     that.trigger(checked ? 'check' : 'uncheck', row, that.$body.find('tr[data-index="'+index+'"]').children(".bs-checkbox"));
            //     // checked? that.$body.find('tr[data-index="'+index+'"]').addClass('selected'): that.$body.find('tr[data-index="'+index+'"]').removeClass('selected');
            // }else{
            //
            // }
            //
            //
            // if (that.options.maintainSelected && $(this).is(':radio')) {
            //     $.each(that.options.data, function (i, row) {
            //         row[that.header.stateField] = false;
            //     });
            // }
            //
            // row[that.header.stateField] = checked;
            //
            // if (that.options.singleSelect) {
            //     that.$selectItem.not(this).each(function () {
            //         that.data[$(this).data('index')][that.header.stateField] = false;
            //     });
            //     that.$selectItem.filter(':checked').not(this).prop('checked', false);
            // }
            //
            // that.updateSelected();
            // that.trigger(checked ? 'check' : 'uncheck', row, $this);

        });

        $.each(this.header.events, function (i, events) {
            if (!events) {
                return;
            }
            // fix bug, if events is defined with namespace
            if (typeof events === 'string') {
                events = calculateObjectValue(null, events);
            }

            var field = that.header.fields[i],
                fieldIndex = $.inArray(field, that.getVisibleFields());

            if (that.options.detailView && !that.options.cardView) {
                fieldIndex += 1;
            }

            for (var key in events) {
                that.$body.find('>tr:not(.no-records-found)').each(function () {
                    var $tr = $(this),
                        $td = $tr.find(that.options.cardView ? '.card-view' : 'td').eq(fieldIndex),
                        index = key.indexOf(' '),
                        name = key.substring(0, index),
                        el = key.substring(index + 1),
                        func = events[key];

                    $td.find(el).off(name).on(name, function (e) {
                        var index = $tr.data('index'),
                            row = that.data[index],
                            value = row[field];

                        func.apply(this, [e, value, row, index]);
                    });
                });
            }
        });

        this.updateSelected();

        // if(data.length == 0) return;

        this.resetView();

        //TODO 监听窗体变化重置表格大小
        if($(document.body).width() != 0 && $(document.body).height() != 0){
            this.__win_width = $(document.body).width();
            this.__win_height = $(document.body).height();
        }

        this.__view_flge = '0';

        //TODO 监听窗体变化重置表格大小
        this.$tableBodyResizeWidth = this.$el.width();

        this.$el.off('resize').on('resize',function(){

            if($(this).width() == 0 ||
                that.$tableBodyResizeWidth == $(this).width() ||
                this.__view_flge == '2' ){
                return;
            }

            that.$tableBodyResizeWidth = $(this).width();

            this.__view_flge = '1';

            //重置视图
            setTimeout(function(){
                that.resetView();
                this.__view_flge = '0';
            }, 100);

        });


        $(document.body).off('resize').on('resize',function(){

            var w = $(document.body).width();
            var h = $(document.body).height();

            //窗口因为动画没变化不中断重置大小
            if((w ==0 && h ==0) || (that.__win_width == w
                && that.__win_height == h) || this.__view_flge == '1'){
                return;
            }

            this.__view_flge == '2'

            that.__win_width = $(document.body).width();
            that.__win_height = $(document.body).height();
            //重置视图
            setTimeout(function(){
                that.resetView();
                this.__view_flge = '0';
            }, 100);

        });

        this.trigger('post-body', data);
    };

    BootstrapTable.prototype.initServer = function (silent, query, url) {
        var that = this,
            data = {},
            params = {
                searchText: this.searchText,
                sortName: this.options.sortName,
                sortOrder: this.options.sortOrder
            },
            request;

        if (this.options.pagination) {
            params.pageSize = this.options.pageSize === this.options.formatAllRows() ?
                this.options.totalRows : this.options.pageSize;
            params.pageNumber = this.options.pageNumber;
        }

        if (!this.options.firstLoad && !_isFirstLoad.includes(this.options.id)) {

            //设置复杂表头表格添加边框
            if(this.options.showBorder && _isFirstLoad.length == 0){
                //首次
                var h = $("head"), borderStyle = [];
                borderStyle.push('<style type=\'text/css\'>');
                borderStyle.push('.fixed-table-container {border: 1px solid #e7eaec!important;}');
                borderStyle.push('.table>thead>tr>th,');
                borderStyle.push('.table>tbody>tr>th, .table>tfoot>tr>th, .table>thead>tr>td,');
                borderStyle.push('.table>tbody>tr>td, .table>tfoot>tr>td {border-right: 1px solid #e7eaec!important;}');
                borderStyle.push(' .fixed-table-footer .table>tbody>tr>td, .fixed-table-footer.table>tfoot>tr>td {border-right: 0px !important;}');
                borderStyle.push('.table-striped table thead {background-color: #f5f5f6 !important;}');
                borderStyle.push('</style>');
                h.append(borderStyle.join(''));
            }
            _isFirstLoad.push(this.options.id);
            return
        }

        if(this.options.showBorder && _isFirstLoad.length == 0){
            //
            _isFirstLoad.push(this.options.id + "_sb");
            var h = $("head"), borderStyle = [];
            borderStyle.push('<style type=\'text/css\'>');
            borderStyle.push('.fixed-table-container {border: 1px solid #e7eaec!important;}');
            borderStyle.push('.table>thead>tr>th,');
            borderStyle.push('.table>tbody>tr>th, .table>tfoot>tr>th, .table>thead>tr>td,');
            borderStyle.push(' .table>tbody>tr>td, .table>tfoot>tr>td {border-right: 1px solid #e7eaec!important;}');
            borderStyle.push(' .fixed-table-footer .table>tbody>tr>td, .fixed-table-footer.table>tfoot>tr>td {border-right: 0px !important;;}');
            borderStyle.push(' .table-striped table thead {background-color: #f5f5f6 !important;}');
            borderStyle.push('</style>');
            h.append(borderStyle.join(''));
        }

        if (!(url || this.options.url) && !this.options.ajax) {
            that.$tableLoading.hide();
            return;
        }

        if (this.options.queryParamsType === 'limit') {
            params = {
                search: params.searchText,
                sort: params.sortName,
                order: params.sortOrder
            };

            if (this.options.pagination) {
                params.offset = this.options.pageSize === this.options.formatAllRows() ?
                    0 : this.options.pageSize * (this.options.pageNumber - 1);
                params.limit = this.options.pageSize === this.options.formatAllRows() ?
                    this.options.totalRows : this.options.pageSize;
            }
        }

        if (!($.isEmptyObject(this.filterColumnsPartial))) {
            params.filter = JSON.stringify(this.filterColumnsPartial, null);
        }

        data = calculateObjectValue(this.options, this.options.queryParams, [params], data);

        $.extend(data, query || {});

        // false to stop request
        if (data === false) {
            return;
        }
        if (!silent) {
            //TODO 冻结列扩展
            // if(this.options.fixedColumns){
            //     if($("#"+this.options.id + "-left-fixed-table-columns")){
            //         $("#"+this.options.id + "-left-fixed-table-columns").hide();
            //     }
            // }
            // if(this.options.rightFixedColumns){
            //     if($("#"+this.options.id + "-right-fixed-table-columns")){
            //         $("#"+this.options.id + "-right-fixed-table-columns").hide();
            //     }
            // }
            this.$tableLoading.show();
        }
        request = $.extend({}, calculateObjectValue(null, this.options.ajaxOptions), {
            type: this.options.method,
            url:  url || this.options.url,
            data: this.options.contentType === 'application/json' && this.options.method === 'post' ?
                JSON.stringify(data) : data,
            cache: this.options.cache,
            contentType: this.options.contentType,
            dataType: this.options.dataType,
            success: function (res) {

                /**TODO:2020-03-09 新加的代码,处理页码错误问题开始*/
                if(opt.common.isNotEmpty(res.data) && opt.common.isNotEmpty(res.data.totalCount)){
                    if(that.options.pagination &&(res.code==='00000') && (res.data.totalCount>0) && (res.data.list.length === 0)){//总记录数大于0,但当前页记录数为0,则此时页码超过了最大页码误
                        that.options.pageNumber = Math.ceil(res.data.totalCount/that.options.pageSize);//最后一页(总页数)
                        that.initServer();
                        return;
                    }
                }
                var temp = res;
                res = calculateObjectValue(that.options, that.options.responseHandler, [res], res);
                if(res === temp){
                    if(opt.common.isNotEmpty(res.data)){
                        if(opt.common.isNotEmpty(res.data.totalCount)){
                            res = { rows: res.data.list, total: res.data.totalCount };
                        }else{
                            res = { rows: res.data, total: res.data.length };
                        }
                    }else{
                        res = {rows:[],total:0};
                    }
                }
                that.load(res);
                that.trigger('load-success', res);
                that.$tableLoading.hide();
            },
            error: function (xhr, textStatus) {
                try{
                    opt.error(JSON.parse(xhr.responseText).msg || xhr.responseText );
                    that.trigger('load-error', JSON.parse(xhr.responseText).msg || xhr.responseText, xhr);
                    that.$tableLoading.hide();
                }catch(e){
                    that.trigger('load-error', '交易异常');
                    that.$tableLoading.hide();
                }

            }
        });
        if($('meta[name="csrf-token"]').attr("content")){
            request = $.extend(request,{headers: {
                    "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content") || ''
                }});
        }
        if (this.options.ajax) {
            calculateObjectValue(this, this.options.ajax, [request], null);
        } else {
            if (this._xhr && this._xhr.readyState !== 4) {
                this._xhr.abort();
            }
            this._xhr = $.ajax(request);
        }
    };

    BootstrapTable.prototype.initSearchText = function () {
        if (this.options.search) {
            if (this.options.searchText !== '') {
                var $search = this.$toolbar.find('.search input');
                $search.val(this.options.searchText);
                this.onSearch({currentTarget: $search});
            }
        }
    };

    BootstrapTable.prototype.getCaret = function () {
        var that = this;

        $.each(this.$header.find('th'), function (i, th) {
            //fix: 排序字段与查询显示字段不一致问题
            var field = typeof $(th).data('sort') != "undefined" ? $(th).data('sort') : $(th).data('field');
            $(th).find('.sortable').removeClass('desc asc').addClass(field === that.options.sortName ? that.options.sortOrder : 'both');
        });
    };

    BootstrapTable.prototype.updateSelected = function () {
        var that = this;
        var checkAll = this.$selectItem.filter(':enabled').length &&
            this.$selectItem.filter(':enabled').length ===
            this.$selectItem.filter(':enabled').filter(':checked').length;

        this.$selectAll.add(this.$selectAll_).prop('checked', checkAll);


        this.$selectItem.each(function () {
            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected');
            if($(this).attr('disabled') != 'disabled'){
                //TODO fix: 冻结左边全选显示异常问题
                if (that.options.rightFixedColumns && that.$rightfixedBody) {
                    // that.$rightfixedBody.find('tr').each(function () {
                    //     if($(this).data('index') != '-99999'){
                    //         checked  ? $(this).addClass('selected') : $(this).removeClass('selected');
                    //     }
                    // })
                    that.$rightfixedBody.find('tr[data-index="'+$(this).closest('tr').data('index')+'"]')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected');
                }
            }
        });
    };

    BootstrapTable.prototype.updateRows = function () {
        var that = this;

        this.$selectItem.each(function () {
            that.data[$(this).data('index')][that.header.stateField] = $(this).prop('checked');
        });
    };

    BootstrapTable.prototype.resetRows = function () {
        var that = this;

        $.each(this.data, function (i, row) {
            that.$selectAll.prop('checked', false);
            that.$selectItem.prop('checked', false);
            if (that.header.stateField) {
                row[that.header.stateField] = false;
            }
        });
    };

    BootstrapTable.prototype.trigger = function (name) {

        var args = Array.prototype.slice.call(arguments, 1);

        name += '.bs.table';
        this.options[BootstrapTable.EVENTS[name]].apply(this.options, args);
        this.$el.trigger($.Event(name), args);

        this.options.onAll(name, args);
        this.$el.trigger($.Event('all.bs.table'), [name, args]);
    };

    BootstrapTable.prototype.resetHeader = function () {
        // fix #61: the hidden table reset header bug.
        // fix bug: get $el.css('width') error sometime (height = 500)
        clearTimeout(this.timeoutId_);
        this.timeoutId_ = setTimeout($.proxy(this.fitHeader, this), this.$el.is(':hidden') ? 500 : 0);
    };

    BootstrapTable.prototype.fitHeader = function () {
        var that = this,
            fixedBody,
            scrollWidth,
            focused,
            focusedTemp;

        if (that.$el.is(':hidden')) {
            that.timeoutId_ = setTimeout($.proxy(that.fitHeader, that), 100);
            return;
        }
        fixedBody = this.$tableBody.get(0);

        //TODO 固定高度表头适配问题
        scrollWidth = fixedBody.scrollWidth > fixedBody.clientWidth &&
        fixedBody.scrollHeight > fixedBody.clientHeight + this.$header.outerHeight() ?
            getScrollBarWidth() : 0;
        //scrollWidth = getScrollBarWidth();

        this.$el.css('margin-top', -this.$header.outerHeight());

        focused = $(':focus');
        if (focused.length > 0) {
            var $th = focused.parents('th');
            if ($th.length > 0) {
                var dataField = $th.attr('data-field');
                if (dataField !== undefined) {
                    var $headerTh = this.$header.find("[data-field='" + dataField + "']");
                    if ($headerTh.length > 0) {
                        $headerTh.find(":input").addClass("focus-temp");
                    }
                }
            }
        }

        this.$header_ = this.$header.clone(true, true);

        this.$selectAll_ = this.$header_.find('[name="btSelectAll"]');
        if(this.$tableBody.height() < this.$el.find('>tbody').outerHeight()){
            this.$tableHeader.css({'margin-right':'10px'});
            if(this.options.totalShowFooter){
                this.$tableFooter.css({'margin-right':'10px'});
            }
        }else{
            this.$tableHeader.css({'margin-right':''});
            if(this.options.totalShowFooter){
                this.$tableFooter.css({'margin-right':''});
            }
        }
        // if(scrollWidth > 0){
        //     // this.$tableHeader.css({'overflow-y':'scroll'});
        //     this.$tableHeader.css({'margin-right':'10px'});
        //     if(this.options.totalShowFooter){
        //         this.$tableFooter.css({'margin-right':'10px'});
        //     }
        // }

        // this.$tableHeader.css({'margin-right':'10px'});
        // if(this.options.totalShowFooter){
        //     this.$tableFooter.css({'margin-right':'10px'});
        // }

        this.$tableHeader
            //     .css({
            //     'margin-right': scrollWidth
            // })
            .find('table')
            .css({'max-width':'inherit','width': this.$el.outerWidth()})
            .html('').attr('class', this.$el.attr('class'))
            .append(this.$header_);

        focusedTemp = $('.focus-temp:visible:eq(0)');
        if (focusedTemp.length > 0) {
            focusedTemp.focus();
            this.$header.find('.focus-temp').removeClass('focus-temp');
        }

        // fix bug: $.data() is not working as expected after $.append()
        this.$header.find('th[data-field]').each(function (i) {
            that.$header_.find(sprintf('th[data-field="%s"]', $(this).data('field'))).data($(this).data());
        });

        var visibleFields = this.getVisibleFields(),
            $ths = this.$header_.find('th');

        this.$body.find('>tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this),
                index = i;
            //console.log(index);
            if (that.options.detailView && !that.options.cardView) {
                if (i === 0) {
                    that.$header_.find('th.detail').find('.fht-cell').width($this.innerWidth());
                }
                index = i - 1;
            }

            var $th = that.$header_.find(sprintf('th[data-field="%s"]', visibleFields[index]));
            //console.log($th.length);
            // if ($th.length > 1) {
            //     $th = $($ths[$this[0].cellIndex]);
            // }
            // console.log($this.innerWidth());
            // console.log($this.outerWidth()-1);
            // if (i === 0) {
            //     $th.find('.fht-cell').width($this.innerWidth()+ 0.8);
            // }else{
            //     $th.find('.fht-cell').width($this.innerWidth());
            // }
            $th.find('.fht-cell').width($this.innerWidth());
        });


        //TODO: fix 初始化定位问题
        that.$tableHeader.scrollLeft(this.$tableBody.scrollLeft());

        // horizontal scroll event
        // TODO: it's probably better improving the layout than binding to scroll event
        // TDDO: 不移除防止插件设置失效问题
        this.$tableBody.on('scroll', function () {

            that.$tableHeader.scrollLeft($(this).scrollLeft());
            //新增滚动样式
            if(that.options.fixedColumns && that.$fixedBody){
                if($(this).scrollLeft() == 0){
                    that.$fixedBody.removeClass('shadow');
                }else{
                    that.$fixedBody.addClass('shadow');
                }
            }
            //暂时不滑动
            // if (that.options.totalShowFooter && !that.options.cardView) {
            //     that.$tableFooter.scrollLeft($(this).scrollLeft());
            // }

        });

        that.trigger('post-header');

    };

    BootstrapTable.prototype.resetFooter = function () {
        var that = this,
            data = that.getData(),
            colspan = 0,
            html = [];
        // console.log('data:',data);
        if(data && data.length == 0){
            if(this.options.totalShowFooter){
                if(this.$tableFooter &&
                    this.$tableFooter.find('table>tbody>tr') &&
                    this.$tableFooter.find('table>tbody>tr').find('td').length > 0){
                    // console.log(this.$tableFooter.find('table>tbody>tr').find('td[data-field="__index"]').html());
                    $.each(this.columns, function (i, column) {
                        if(typeof column.totalFooterFormatter == 'function'){
                            var value = calculateObjectValue(column, column.totalFooterFormatter, [data], '') || '';
                            that.$tableFooter.find('table>tbody>tr').find("td[data-field='"+column.field+"']").empty().html(value);
                        }
                    })
                }
            }
            return;
        }

        if (this.options.cardView || (!this.options.subtotalShowFooter && !this.options.totalShowFooter)) { //do nothing
            return;
        }

        if (!this.options.cardView && this.options.detailView) {
            html.push('<td><div class="th-inner">&nbsp;</div><div class="fht-cell"></div></td>');
        }

        if(this.$body.find('tr:last').data('index') == '-99999'){
            return;
        }

        if(this.options.subtotalShowFooter){
            if(typeof this.options.rowTotal === 'function'){
                for (var _k = this.pageFrom - 1; _k < this.pageTo; _k++) {
                    var  item = data[_k], rowTotal;
                    rowTotal = calculateObjectValue(this.options, this.options.rowTotal, [data,item, _k], '');
                    if(rowTotal === true || rowTotal === 'true'){
                        html = [];
                        colspan = 0;
                        $.each(this.columns, function (i, column) {
                            var key,
                                falign = '', // footer align style
                                valign = '',
                                pywh = 0,
                                csses = [],
                                style = {},
                                class_ = sprintf(' class="%s"', column['class']),
                                unitWidth = 'px',
                                width = column.width;

                            //如果表格列项宽度为字符串- 则转换成百分比占比宽度
                            if (column.width !== undefined && (!that.options.cardView)) {
                                if (typeof column.width === 'string') {
                                    if (column.width.indexOf('%') !== -1) {
                                        unitWidth = '%';
                                    }
                                }
                            }
                            if (column.width && typeof column.width === 'string') {
                                width = column.width.replace('%', '').replace('px', '');
                            }
                            //--------------------------------------------
                            //--------------------------------------------
                            if(column.width &&  Object.prototype.toString.apply(column.width) == '[object Number]'){
                                pywh += column.width;
                            }
                            var widthpx = sprintf('width: %s; ', (column.checkbox || column.radio) && !width ?
                                '36px' : (width ? width + unitWidth : undefined));

                            if (!column.visible) {
                                colspan++;
                                return;
                            }

                            if (that.options.cardView && (!column.cardVisible)) {
                                return;
                            }

                            falign = sprintf('text-align: %s; ', column.falign ? column.falign : column.align);
                            valign = sprintf('vertical-align: %s; ', column.valign);
                            style = calculateObjectValue(column, that.options.subtotalFooterStyle, [column,item,_k],'');
                            if (style && style.css) {
                                for (key in style.css) {
                                    csses.push(key + ': ' + style.css[key]);
                                }
                            }
                            var flag = false;

                            if(column.subtotalFootColspan){
                                colspan = colspan + column.subtotalFootColspan;
                                flag = true;
                            }
                            if(flag){
                                html.push('<td', class_,sprintf(' title="%s"',column.title) ,sprintf(' style="%s"', falign + valign + widthpx + csses.concat().join('; ')),sprintf('colspan="%s"',column.subtotalFootColspan), '>');
                                html.push(calculateObjectValue(column, column.subtotalFooterFormatter, [data,item,_k], '') || '');//&nbsp;
                                html.push('</div>');
                                html.push('</td>');
                            }else{
                                if(i >= colspan){
                                    html.push('<td', class_,sprintf(' title="%s"',column.title), sprintf(' style="%s"', falign + valign + widthpx + csses.concat().join('; ')), '>');
                                    html.push(calculateObjectValue(column, column.subtotalFooterFormatter, [data,item,_k], '') || '');//&nbsp;
                                    html.push('</div>');
                                    html.push('</td>');
                                    colspan++
                                }
                            }
                        });
                        var _tr = [],__csses=[],__key;
                        _tr.push('<tr data-index="-99999" class="_subtotal"');
                        var __style = calculateObjectValue(this.options, this.options.subtotalRowStyle, [data,item,_k], '');
                        if (__style && __style.css) {
                            for (__key in __style.css) {
                                __csses.push(__key + ': ' + __style.css[__key]);
                            }
                        }
                        _tr.push(sprintf(' style="%s"',__csses.concat().join('; ')));
                        _tr.push('></tr>');
                        this.$body.find('tr[data-index="'+_k+'"]').after($(_tr.join('')).append(html.join('')));
                    }
                }
            }
            else{
                html = [];
                $.each(this.columns, function (i, column) {
                    var key,
                        falign = '', // footer align style
                        valign = '',
                        pywh = 0,
                        csses = [],
                        style = {},
                        class_ = sprintf(' class="%s"', column['class']),
                        unitWidth = 'px',
                        width = column.width;

                    //如果表格列项宽度为字符串- 则转换成百分比占比宽度
                    if (column.width !== undefined && (!that.options.cardView)) {
                        if (typeof column.width === 'string') {
                            if (column.width.indexOf('%') !== -1) {
                                unitWidth = '%';
                            }
                        }
                    }
                    if (column.width && typeof column.width === 'string') {
                        width = column.width.replace('%', '').replace('px', '');
                    }
                    //--------------------------------------------
                    //--------------------------------------------
                    if(column.width &&  Object.prototype.toString.apply(column.width) == '[object Number]'){
                        pywh += column.width;
                    }
                    var widthpx = sprintf('width: %s; ', (column.checkbox || column.radio) && !width ?
                        '36px' : (width ? width + unitWidth : undefined));

                    if (!column.visible) {
                        colspan++;
                        return;
                    }

                    if (that.options.cardView && (!column.cardVisible)) {
                        return;
                    }

                    falign = sprintf('text-align: %s; ', column.falign ? column.falign : column.align);
                    valign = sprintf('vertical-align: %s; ', column.valign);
                    style = calculateObjectValue(column, that.options.subtotalFooterStyle, [column],'');
                    if (style && style.css) {
                        for (key in style.css) {
                            csses.push(key + ': ' + style.css[key]);
                        }
                    }
                    var flag = false;

                    if(column.subtotalFootColspan){
                        colspan = colspan + column.subtotalFootColspan;
                        flag = true;
                    }
                    if(flag){
                        html.push('<td', class_,sprintf(' title="%s"',column.title) ,sprintf(' style="%s"', falign + valign + widthpx + csses.concat().join('; ')),sprintf('colspan="%s"',column.subtotalFootColspan), '>');
                        html.push(calculateObjectValue(column, column.subtotalFooterFormatter, [data], '') || '');//&nbsp;
                        html.push('</div>');
                        html.push('</td>');
                    }else{
                        if(i >= colspan){
                            html.push('<td', class_,sprintf(' title="%s"',column.title), sprintf(' style="%s"', falign + valign + widthpx + csses.concat().join('; ')), '>');
                            html.push(calculateObjectValue(column, column.subtotalFooterFormatter, [data], '') || '');//&nbsp;
                            html.push('</div>');
                            html.push('</td>');
                            colspan++
                        }
                    }
                });

                var _tr = [],__csses=[], __key;
                _tr.push('<tr data-index="-99999" class="_subtotal"');
                var __style = calculateObjectValue(this.options, this.options.subtotalRowStyle, [data], '');
                if (__style && __style.css) {
                    for (__key in __style.css) {
                        __csses.push(__key + ': ' + __style.css[__key]);
                    }
                }
                _tr.push(sprintf(' style="%s"',__csses.concat().join('; ')));
                _tr.push('></tr>');
                this.$body.find('tr:last').after($(_tr.join('')).append(html.join('')));
            }
            this.$body.find('tr:last').after($('<tr data-index="-99999"></tr>').append('<td colspan="'+colspan+'" style="padding: 4px"></td>'));
        }

        if(this.options.totalShowFooter){
            html = [];
            colspan = 0;
            $.each(this.columns, function (i, column) {
                var key,
                    falign = '', // footer align style
                    valign = '',
                    pywh = 0,
                    csses = [],
                    style = {},
                    class_ = sprintf(' class="%s"', column['class']),
                    unitWidth = 'px',
                    width = column.width;
                //如果表格列项宽度为字符串- 则转换成百分比占比宽度
                if (column.width !== undefined && (!that.options.cardView)) {
                    if (typeof column.width === 'string') {
                        if (column.width.indexOf('%') !== -1) {
                            unitWidth = '%';
                        }
                    }
                }
                if (column.width && typeof column.width === 'string') {
                    width = column.width.replace('%', '').replace('px', '');
                }
                //--------------------------------------------
                //--------------------------------------------
                if(column.width &&  Object.prototype.toString.apply(column.width) == '[object Number]'){
                    pywh += column.width;
                }
                var widthpx = sprintf('width: %s; ', (column.checkbox || column.radio) && !width ?
                    '36px' : (width ? width + unitWidth : undefined));

                if (!column.visible) {
                    colspan++;
                    return;
                }

                if (that.options.cardView && (!column.cardVisible)) {
                    return;
                }

                falign = sprintf('text-align: %s; ', column.falign ? column.falign : column.align);
                valign = sprintf('vertical-align: %s; ', column.valign);
                style = calculateObjectValue(column, that.options.totalFooterStyle, [column],'');
                if (style && style.css) {
                    for (key in style.css) {
                        csses.push(key + ': ' + style.css[key]);
                    }
                }
                var flag = false;

                if(column.totalFootColspan){
                    colspan = colspan + column.totalFootColspan;
                    flag = true;

                }
                if(flag){
                    var _width = 0;

                    that.$body.find('>tr:first-child:not(.no-records-found) > *').each(function (k) {
                        if( i<= k && k < colspan){
                            var $this = $(this);
                            _width += $this.innerWidth();
                        }
                    });
                    _width = "width:" + _width + "px;"
                    html.push('<td', class_,sprintf(' title="%s"',column.title) , ' data-field="'+column.field+'"',sprintf(' style="%s"', falign + valign + _width + csses.concat().join('; ')),sprintf('colspan="%s"',column.totalFootColspan), '>');
                    html.push(calculateObjectValue(column, column.totalFooterFormatter, [data], '') || '');//&nbsp;
                    html.push('</td>');
                }else{
                    if(i >= colspan){
                        html.push('<td', class_,' data-field="'+column.field+'"', sprintf(' style="%s"', falign + valign  + csses.concat().join('; ')), '>');
                        html.push(calculateObjectValue(column, column.totalFooterFormatter, [data], '') || '');//&nbsp;
                        html.push('</td>');
                        colspan++
                    }
                }

            });

            var __style = calculateObjectValue(this.options, this.options.totalFooterRowStyle, [data], ''),__csses=[],__key;
            if (__style && __style.css) {
                for (__key in __style.css) {
                    __csses.push(__key + ': ' + __style.css[__key]);
                }
            }
            this.$tableFooter.find('tr').attr('style',__csses.concat().join('; ')).html(html.join(''));
            this.$tableFooter.show();
            clearTimeout(this.timeoutFooter_);
            this.timeoutFooter_ = setTimeout($.proxy(this.fitFooter, this),
                this.$el.is(':hidden') ? 100 : 0);
        }
    };

    BootstrapTable.prototype.fitFooter = function () {
        var that = this,
            $footerTd,
            elWidth = '100%',
            fheight,
            scrollWidth;

        clearTimeout(this.timeoutFooter_);
        if (this.$el.is(':hidden')) {
            this.timeoutFooter_ = setTimeout($.proxy(this.fitFooter, this), 100);
            return;
        }

        // elWidth = this.$el.css('width');
        // scrollWidth = elWidth > this.$tableBody.width() ? getScrollBarWidth() : 0;
        fheight = that.options.totalFooterHeight ? that.options.totalFooterHeight + 'px': '35px';
        this.$tableFooter.css({
            'margin-right': scrollWidth
        }).find('table').css({'width':elWidth,'max-width':'inherit','height': fheight,'table-layout':'fixed'})
            .attr('class', 'table');

        $footerTd = this.$tableFooter.find('td');

        this.$body.find('>tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this);
            $footerTd.eq(i).find('.fht-cell').width($this.innerWidth());
        });

        //this.horizontalScroll();
    };

    BootstrapTable.prototype.toggleColumn = function (index, checked, needUpdate) {
        if (index === -1) {
            return;
        }
        this.columns[index].visible = checked;
        this.initHeader();
        this.initSearch();
        this.initPagination();
        this.initBody();

        if (!this.options.showCustomView &&
            this.options.showColumns) {
            var $items = this.$toolbar.find('.keep-open input').prop('disabled', false);

            if (needUpdate) {
                $items.filter(sprintf('[value="%s"]', index)).prop('checked', checked);
            }

            if ($items.filter(':checked').length <= this.options.minimumCountColumns) {
                $items.filter(':checked').prop('disabled', true);
            }
        }
    };

    //TODO: 新增多选勾选显示总数方法
    BootstrapTable.prototype.setCheckNumer = function(num){
        this.$pagination.find('.check-numer').empty().append('<span style="font-weight: bold">'+this.options.formatCheckNumber(' '+num)+'</span>');
    }

    BootstrapTable.prototype.toggleRow = function (index, uniqueId, visible) {
        if (index === -1) {
            return;
        }

        this.$body.find(typeof index !== 'undefined' ?
            sprintf('tr[data-index="%s"]', index) :
            sprintf('tr[data-uniqueid="%s"]', uniqueId))
            [visible ? 'show' : 'hide']();
    };

    BootstrapTable.prototype.getVisibleFields = function () {
        var that = this,
            visibleFields = [];

        $.each(this.header.fields, function (j, field) {
            var column = that.columns[getFieldIndex(that.columns, field)];

            if (!column.visible) {
                return;
            }
            visibleFields.push(field);
        });
        return visibleFields;
    };

    // PUBLIC FUNCTION DEFINITION
    // =======================

    BootstrapTable.prototype.resetView = function (params) {
        var padding = 0;

        if (params && params.height) {
            this.options.height = params.height;
        }

        this.$selectAll.prop('checked', this.$selectItem.length > 0 &&
            this.$selectItem.length === this.$selectItem.filter(':checked').length);

        if (this.options.height) {
            var h;
            if(typeof this.options.height == 'function' ){
                h = calculateObjectValue(this.options, this.options.height, this.options, '');
            }else{
                h = this.options.height;
            }
            var toolbarHeight = getRealHeight(this.$toolbar),
                paginationHeight = getRealHeight(this.$pagination),
                height = h - toolbarHeight - paginationHeight;
            //重置表格高度
            this.$container.css('height', h + 'px');
            this.$tableContainer.css('height', height + 'px');
            // console.log("--->>>>this.options.height:" + this.options.height);
            // console.log("--->>>>height:" + height);
            // this.$el.css('height',this.options.height + 'px');
            //.css('overflow-y', 'hidden');
        }

        if (this.options.cardView) {
            //TODO 表格列表冻结清除 宽度
            if (this.options.fixedColumns || this.options.rightFixedColumns) {
                this.$el.removeAttr("style");
            }
            this.$el.css('margin-top', '0');
            this.$tableContainer.css('padding-bottom', '0');
            this.$tableFooter.hide();
            return;
        }

        if (!this.__custom && this.options.showHeader && this.options.height) {
            this.$tableHeader.show();
            this.resetHeader();
            padding += this.$header.outerHeight();
        } else {
            this.$tableHeader.hide();
            this.trigger('post-header');
        }

        if (this.options.subtotalShowFooter
            || this.options.totalShowFooter) {
            this.resetFooter();
            if (this.options.height && this.options.totalShowFooter) {
                if(this.options.totalFooterHeight != undefined){
                    padding += this.options.totalFooterHeight + 1;
                }else{
                    padding += 35 + 1;
                }
            }
        }

        // Assign the correct sortable arrow
        this.getCaret();
        this.$tableContainer.css('padding-bottom', padding + 'px');
        this.trigger('reset-view');

    };

    BootstrapTable.prototype.getData = function (useCurrentPage) {
        return (this.searchText || !$.isEmptyObject(this.filterColumns) || !$.isEmptyObject(this.filterColumnsPartial)) ?
            (useCurrentPage ? this.data.slice(this.pageFrom - 1, this.pageTo) : this.data) :
            (useCurrentPage ? this.options.data.slice(this.pageFrom - 1, this.pageTo) : this.options.data);
    };

    BootstrapTable.prototype.load = function (data) {
        var fixedScroll = false;

        // #431: support pagination
        if (this.options.sidePagination === 'server') {
            this.options.totalRows = data.total;
            fixedScroll = data.fixedScroll;
            data = data[this.options.dataField];
        } else if (!$.isArray(data)) { // support fixedScroll
            fixedScroll = data.fixedScroll;
            data = data.data;
        }

        this.initData(data);
        this.initSearch();
        this.initPagination();
        this.initBody(fixedScroll);
    };

    BootstrapTable.prototype.append = function (data) {
        this.initData(data, 'append');
        this.initSearch();
        this.initPagination();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.prepend = function (data) {
        this.initData(data, 'prepend');
        this.initSearch();
        this.initPagination();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.remove = function (params) {
        var len = this.options.data.length,
            i, row;

        if (!params.hasOwnProperty('field') || !params.hasOwnProperty('values')) {
            return;
        }

        for (i = len - 1; i >= 0; i--) {
            row = this.options.data[i];

            if (!row.hasOwnProperty(params.field)) {
                continue;
            }
            if ($.inArray(row[params.field], params.values) !== -1) {
                this.options.data.splice(i, 1);
            }
        }

        if (len === this.options.data.length) {
            return;
        }
        this.initSearch();
        this.initPagination();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.removeAll = function () {
        if (this.options.data.length > 0) {
            this.options.data.splice(0, this.options.data.length);
            this.initSearch();
            this.initPagination();
            this.initBody(true);
        }
    };

    BootstrapTable.prototype.getRowByUniqueId = function (id) {
        var uniqueId = this.options.uniqueId,
            len = this.options.data.length,
            dataRow = null,
            i, row, rowUniqueId;

        for (i = len - 1; i >= 0; i--) {
            row = this.options.data[i];

            if (row.hasOwnProperty(uniqueId)) { // uniqueId is a column
                rowUniqueId = row[uniqueId];
            } else if(row._data.hasOwnProperty(uniqueId)) { // uniqueId is a row data property
                rowUniqueId = row._data[uniqueId];
            } else {
                continue;
            }

            if (typeof rowUniqueId === 'string') {
                id = id.toString();
            } else if (typeof rowUniqueId === 'number') {
                if ((Number(rowUniqueId) === rowUniqueId) && (rowUniqueId % 1 === 0)) {
                    id = parseInt(id);
                } else if ((rowUniqueId === Number(rowUniqueId)) && (rowUniqueId !== 0)) {
                    id = parseFloat(id);
                }
            }

            if (rowUniqueId === id) {
                dataRow = row;
                break;
            }
        }

        return dataRow;
    };

    BootstrapTable.prototype.removeByUniqueId = function (id) {
        var len = this.options.data.length,
            row = this.getRowByUniqueId(id);

        if (row) {
            this.options.data.splice(this.options.data.indexOf(row), 1);
        }

        if (len === this.options.data.length) {
            return;
        }

        this.initSearch();
        this.initPagination();
        this.initBody(true);
    };

    BootstrapTable.prototype.updateByUniqueId = function (params) {
        var that = this;
        var allParams = $.isArray(params) ? params : [ params ];

        $.each(allParams, function(i, params) {
            var rowId;

            if (!params.hasOwnProperty('id') || !params.hasOwnProperty('row')) {
                return;
            }

            rowId = $.inArray(that.getRowByUniqueId(params.id), that.options.data);

            if (rowId === -1) {
                return;
            }
            $.extend(that.options.data[rowId], params.row);
        });

        this.initSearch();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.insertRow = function (params,callback) {
        if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
            return;
        }
        this.data.splice(params.index, 0, params.row);
        this.initSearch();
        this.initPagination();
        this.initSort();
        this.initBody(true);
        if(typeof callback == "function"){
            calculateObjectValue(this, callback, [params.row], '');
        }
    };

    BootstrapTable.prototype.updateRow = function (params) {
        var that = this;
        var allParams = $.isArray(params) ? params : [ params ];

        $.each(allParams, function(i, params) {
            if (!params.hasOwnProperty('index') || !params.hasOwnProperty('row')) {
                return;
            }
            $.extend(that.options.data[params.index], params.row);
        });

        this.initSearch();
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.showRow = function (params) {
        if (!params.hasOwnProperty('index') && !params.hasOwnProperty('uniqueId')) {
            return;
        }
        this.toggleRow(params.index, params.uniqueId, true);
    };

    BootstrapTable.prototype.hideRow = function (params) {
        if (!params.hasOwnProperty('index') && !params.hasOwnProperty('uniqueId')) {
            return;
        }
        this.toggleRow(params.index, params.uniqueId, false);
    };

    BootstrapTable.prototype.getRowsHidden = function (show) {
        var rows = $(this.$body[0]).children().filter(':hidden'),
            i = 0;
        if (show) {
            for (; i < rows.length; i++) {
                $(rows[i]).show();
            }
        }
        return rows;
    };

    BootstrapTable.prototype.mergeCells = function (options) {
        var row = options.index,
            col = $.inArray(options.field, this.getVisibleFields()),
            rowspan = options.rowspan || 1,
            colspan = options.colspan || 1,
            i, j,
            $tr = this.$body.find('>tr'),
            $td;

        if (this.options.detailView && !this.options.cardView) {
            col += 1;
        }

        $td = $tr.eq(row).find('>td').eq(col);

        if (row < 0 || col < 0 || row >= this.data.length) {
            return;
        }

        for (i = row; i < row + rowspan; i++) {
            for (j = col; j < col + colspan; j++) {
                $tr.eq(i).find('>td').eq(j).hide();
            }
        }

        $td.attr('rowspan', rowspan).attr('colspan', colspan).show();
    };

    BootstrapTable.prototype.updateCell = function (params) {
        if (!params.hasOwnProperty('index') ||
            !params.hasOwnProperty('field') ||
            !params.hasOwnProperty('value')) {
            return;
        }
        this.data[params.index][params.field] = params.value;

        if (params.reinit === false) {
            return;
        }
        this.initSort();
        this.initBody(true);
    };

    BootstrapTable.prototype.getOptions = function () {
        return this.options;
    };

    BootstrapTable.prototype.getSelections = function () {
        var that = this;

        return $.grep(this.options.data, function (row) {
            return row[that.header.stateField];
        });
    };

    BootstrapTable.prototype.getAllSelections = function () {
        var that = this;

        return $.grep(this.options.data, function (row) {
            return row[that.header.stateField];
        });
    };

    BootstrapTable.prototype.checkAll = function () {
        this.checkAll_(true);
    };

    BootstrapTable.prototype.uncheckAll = function () {
        this.checkAll_(false);
    };

    BootstrapTable.prototype.checkInvert = function () {
        var that = this;
        var rows = that.$selectItem.filter(':enabled');
        var checked = rows.filter(':checked');
        rows.each(function() {
            $(this).prop('checked', !$(this).prop('checked'));
        });
        that.updateRows();
        that.updateSelected();
        that.trigger('uncheck-some', checked);
        checked = that.getSelections();
        that.trigger('check-some', checked);
    };

    BootstrapTable.prototype.checkAll_ = function (checked) {
        var rows;
        if (!checked) {
            rows = this.getSelections();
        }
        this.$selectAll.add(this.$selectAll_).prop('checked', checked);
        this.$selectItem.filter(':enabled').prop('checked', checked);
        this.updateRows();
        if (checked) {
            rows = this.getSelections();
        }
        this.trigger(checked ? 'check-all' : 'uncheck-all', rows);
    };

    BootstrapTable.prototype.check = function (index) {
        this.check_(true, index);
    };

    BootstrapTable.prototype.uncheck = function (index) {
        this.check_(false, index);
    };

    BootstrapTable.prototype.check_ = function (checked, index) {
        var $el = this.$selectItem.filter(sprintf('[data-index="%s"]', index)).prop('checked', checked);
        this.data[index][this.header.stateField] = checked;
        this.updateSelected();
        this.trigger(checked ? 'check' : 'uncheck', this.data[index], $el);
    };

    BootstrapTable.prototype.checkBy = function (obj) {
        this.checkBy_(true, obj);
    };

    BootstrapTable.prototype.uncheckBy = function (obj) {
        this.checkBy_(false, obj);
    };

    BootstrapTable.prototype.checkBy_ = function (checked, obj) {
        if (!obj.hasOwnProperty('field') || !obj.hasOwnProperty('values')) {
            return;
        }

        var that = this,
            rows = [];
        $.each(this.options.data, function (index, row) {
            if (!row.hasOwnProperty(obj.field)) {
                return false;
            }
            if ($.inArray(row[obj.field], obj.values) !== -1) {
                var $el = that.$selectItem.filter(':enabled')
                    .filter(sprintf('[data-index="%s"]', index)).prop('checked', checked);
                row[that.header.stateField] = checked;
                rows.push(row);
                that.trigger(checked ? 'check' : 'uncheck', row, $el);
            }
        });
        this.updateSelected();
        this.trigger(checked ? 'check-some' : 'uncheck-some', rows);
    };

    BootstrapTable.prototype.destroy = function () {
        this.$el.insertBefore(this.$container);
        $(this.options.toolbar).insertBefore(this.$el);
        this.$container.next().remove();
        this.$container.remove();
        this.$el.html(this.$el_.html())
            .css('margin-top', '0')
            .attr('class', this.$el_.attr('class') || ''); // reset the class
    };

    BootstrapTable.prototype.showLoading = function () {
        this.$tableLoading.show();
    };

    BootstrapTable.prototype.hideLoading = function () {
        this.$tableLoading.hide();
    };

    BootstrapTable.prototype.togglePagination = function () {
        this.options.pagination = !this.options.pagination;
        var button = this.$toolbar.find('button[name="paginationSwitch"] i');
        if (this.options.pagination) {
            button.attr("class", this.options.iconsPrefix + " " + this.options.icons.paginationSwitchDown);
        } else {
            button.attr("class", this.options.iconsPrefix + " " + this.options.icons.paginationSwitchUp);
        }
        this.updatePagination();
    };

    BootstrapTable.prototype.refresh = function (params) {
        if (params && params.url) {
            this.options.pageNumber = 1;
        }
        this.initServer(params && params.silent,
            params && params.query, params && params.url);
        this.trigger('refresh', params);
    };

    BootstrapTable.prototype.resetWidth = function () {
        if (this.options.showHeader && this.options.height) {
            this.fitHeader();
        }
        if (this.options.subtotalShowFooter) {
            this.fitFooter();
        }
    };

    BootstrapTable.prototype.showColumn = function (field) {
        this.toggleColumn(getFieldIndex(this.columns, field), true, true);
    };

    BootstrapTable.prototype.hideColumn = function (field) {
        this.toggleColumn(getFieldIndex(this.columns, field), false, true);
    };

    BootstrapTable.prototype.getHiddenColumns = function () {
        return $.grep(this.columns, function (column) {
            return !column.visible;
        });
    };

    BootstrapTable.prototype.getVisibleColumns = function () {
        return $.grep(this.columns, function (column) {
            return column.visible;
        });
    };

    BootstrapTable.prototype.toggleAllColumns = function (visible) {
        $.each(this.columns, function (i, column) {
            this.columns[i].visible = visible;
        });

        this.initHeader();
        this.initSearch();
        this.initPagination();
        this.initBody();
        if (!this.options.showCustomView &&
            this.options.showColumns) {
            var $items = this.$toolbar.find('.keep-open input').prop('disabled', false);

            if ($items.filter(':checked').length <= this.options.minimumCountColumns) {
                $items.filter(':checked').prop('disabled', true);
            }
        }
    };

    BootstrapTable.prototype.showAllColumns = function () {
        this.toggleAllColumns(true);
    };

    BootstrapTable.prototype.hideAllColumns = function () {
        this.toggleAllColumns(false);
    };

    BootstrapTable.prototype.filterBy = function (columns) {
        this.filterColumns = $.isEmptyObject(columns) ? {} : columns;
        this.options.pageNumber = 1;
        this.initSearch();
        this.updatePagination();
    };

    BootstrapTable.prototype.scrollTo = function (value) {
        if (typeof value === 'string') {
            value = value === 'bottom' ? this.$tableBody[0].scrollHeight : 0;
        }
        if (typeof value === 'number') {
            this.$tableBody.scrollTop(value);
        }
        if (typeof value === 'undefined') {
            return this.$tableBody.scrollTop();
        }
    };

    BootstrapTable.prototype.getScrollPosition = function () {
        return this.scrollTo();
    };

    BootstrapTable.prototype.selectPage = function (page) {
        if (page > 0 && page <= this.options.totalPages) {
            this.options.pageNumber = page;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.prevPage = function () {
        if (this.options.pageNumber > 1) {
            this.options.pageNumber--;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.nextPage = function () {
        if (this.options.pageNumber < this.options.totalPages) {
            this.options.pageNumber++;
            this.updatePagination();
        }
    };

    BootstrapTable.prototype.toggleView = function () {
        this.options.cardView = !this.options.cardView;
        this.initHeader();
        // Fixed remove toolbar when click cardView button.
        //that.initToolbar();
        this.initBody();

        //TODO 浮动提示框特效
        $("[data-toggle='tooltip']").tooltip();
        $('[data-toggle="popover"]').popover();

        this.trigger('toggle', this.options.cardView);
    };


    BootstrapTable.prototype.__cardView = function () {

        this.__custom = !this.__custom;
        if(this.__custom){
            this.$tableHeader.hide();
            this.$tableBody.hide();
            this.$customView.fadeIn(500);
        }else{
            this.$customView.hide();
            this.$tableHeader.show();
            this.$tableBody.fadeIn(500);
        }
    };


    BootstrapTable.prototype.refreshOptions = function (options) {
        //If the objects are equivalent then avoid the call of destroy / init methods
        if (compareObjects(this.options, options, true)) {
            return;
        }
        this.options = $.extend(this.options, options);
        this.trigger('refresh-options', this.options);
        this.destroy();
        this.init();
    };

    BootstrapTable.prototype.resetSearch = function (text) {
        var $search = this.$toolbar.find('.search input');
        $search.val(text || '');
        this.onSearch({currentTarget: $search});
    };

    BootstrapTable.prototype.expandRow_ = function (expand, index) {
        var $tr = this.$body.find(sprintf('> tr[data-index="%s"]', index));
        if ($tr.next().is('tr.detail-view') === (expand ? false : true)) {
            $tr.find('> td > .detail-icon').click();
        }
    };

    BootstrapTable.prototype.expandRow = function (index) {
        this.expandRow_(true, index);
    };

    BootstrapTable.prototype.collapseRow = function (index) {
        this.expandRow_(false, index);
    };

    BootstrapTable.prototype.expandAllRows = function (isSubTable) {
        if (isSubTable) {
            var $tr = this.$body.find(sprintf('> tr[data-index="%s"]', 0)),
                that = this,
                detailIcon = null,
                executeInterval = false,
                idInterval = -1;

            if (!$tr.next().is('tr.detail-view')) {
                $tr.find('> td > .detail-icon').click();
                executeInterval = true;
            } else if (!$tr.next().next().is('tr.detail-view')) {
                $tr.next().find(".detail-icon").click();
                executeInterval = true;
            }

            if (executeInterval) {
                try {
                    idInterval = setInterval(function () {
                        detailIcon = that.$body.find("tr.detail-view").last().find(".detail-icon");
                        if (detailIcon.length > 0) {
                            detailIcon.click();
                        } else {
                            clearInterval(idInterval);
                        }
                    }, 1);
                } catch (ex) {
                    clearInterval(idInterval);
                }
            }
        } else {
            var trs = this.$body.children();
            for (var i = 0; i < trs.length; i++) {
                this.expandRow_(true, $(trs[i]).data("index"));
            }
        }
    };

    BootstrapTable.prototype.collapseAllRows = function (isSubTable) {
        if (isSubTable) {
            this.expandRow_(false, 0);
        } else {
            var trs = this.$body.children();
            for (var i = 0; i < trs.length; i++) {
                this.expandRow_(false, $(trs[i]).data("index"));
            }
        }
    };

    BootstrapTable.prototype.updateFormatText = function (name, text) {
        if (this.options[sprintf('format%s', name)]) {
            if (typeof text === 'string') {
                this.options[sprintf('format%s', name)] = function () {
                    return text;
                };
            } else if (typeof text === 'function') {
                this.options[sprintf('format%s', name)] = text;
            }
        }
        this.initToolbar();
        this.initPagination();
        this.initBody();
    };

    // BOOTSTRAP TABLE PLUGIN DEFINITION
    // =======================

    var allowedMethods = [
        'getOptions',
        'getSelections', 'getAllSelections', 'getData',
        'load', 'append', 'prepend', 'remove', 'removeAll',
        'insertRow', 'updateRow', 'updateCell', 'updateByUniqueId', 'removeByUniqueId',
        'getRowByUniqueId', 'showRow', 'hideRow', 'getRowsHidden',
        'mergeCells',
        'checkAll', 'uncheckAll', 'checkInvert',
        'check', 'uncheck',
        'checkBy', 'uncheckBy',
        'refresh',
        'resetView','setCheckNumer',
        'resetWidth',
        'destroy',
        'showLoading', 'hideLoading',
        'showColumn', 'hideColumn', 'getHiddenColumns', 'getVisibleColumns',
        'showAllColumns', 'hideAllColumns',
        'filterBy',
        'scrollTo',
        'getScrollPosition',
        'selectPage', 'prevPage', 'nextPage',
        'togglePagination',
        'toggleView',
        'refreshOptions',
        'resetSearch',
        'expandRow', 'collapseRow', 'expandAllRows', 'collapseAllRows',
        'updateFormatText'
    ];

    $.fn.bootstrapTable = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var $this = $(this),
                data = $this.data('bootstrap.table'),
                options = $.extend({}, BootstrapTable.DEFAULTS, $this.data(),
                    typeof option === 'object' && option);
            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw new Error("Unknown method: " + option);
                }

                if (!data) {
                    return;
                }

                value = data[option].apply(data, args);

                if (option === 'destroy') {
                    $this.removeData('bootstrap.table');
                }
            }

            if (!data) {
                $this.data('bootstrap.table', (data = new BootstrapTable(this, options)));
            }
        });
        return typeof value === 'undefined' ? this : value;
    };

    $.fn.bootstrapTable.Constructor = BootstrapTable;
    $.fn.bootstrapTable.defaults = BootstrapTable.DEFAULTS;
    $.fn.bootstrapTable.columnDefaults = BootstrapTable.COLUMN_DEFAULTS;
    $.fn.bootstrapTable.locales = BootstrapTable.LOCALES;
    $.fn.bootstrapTable.methods = allowedMethods;
    $.fn.bootstrapTable.utils = {
        sprintf: sprintf,
        getFieldIndex: getFieldIndex,
        compareObjects: compareObjects,
        calculateObjectValue: calculateObjectValue,
        getItemField: getItemField,
        objectKeys: objectKeys,
        isIEBrowser: isIEBrowser
    };

    // BOOTSTRAP TABLE INIT
    // =======================

    $(function () {
        $('[data-toggle="table"]').bootstrapTable();
    });
})(jQuery);

var TABLE_EVENTS = "all.bs.table click-cell.bs.table dbl-click-cell.bs.table click-row.bs.table dbl-click-row.bs.table sort.bs.table check.bs.table uncheck.bs.table onUncheck check-all.bs.table uncheck-all.bs.table check-some.bs.table uncheck-some.bs.table load-success.bs.table load-error.bs.table column-switch.bs.table page-change.bs.table search.bs.table toggle.bs.table show-search.bs.table expand-row.bs.table collapse-row.bs.table refresh-options.bs.table reset-view.bs.table refresh.bs.table";
var _isFirstLoad = [];
//TODO 修改记住我删除BUG
var union = function (b, a,k) {
    if ($.isArray(a)) {
        $.each(a, function (c, d) {
            if(opt.common.isPrimitive(d)){ //判断是否
                if ($.inArray(d, b) == -1) {
                    b[b.length] = d
                }
            }else{
                if(b.length === 0){
                    b[b.length] = d
                }else{
                    if(!array_isf(b,d,k)){
                        b[b.length] = d
                    }
                }
            }
        })
    } else {
        if(b.length === 0){
            b[b.length] = a
        }else{
            if(!array_isf(b,a,k)){
                b[b.length] = a
            }
        }
    }
    return b
};
var difference = function (c, b,k) {
    if ($.isArray(b)) { //是否是数组
        $.each(b, function (e, f) {
            if(opt.common.isPrimitive(f)){
                var d = $.inArray(f, c); //搜索指定的值,并返回其索引值
                if (d != -1) {
                    c.splice(d, 1)
                }
            }else{
                array_diff(c,f,k);
            }
        })
    } else {
        array_diff(c,b,k);
    }
    return c
};
var array_diff = function(a, b,c) {
    for (var j = 0; j < a.length; j++) {
        if(opt.common.getJsonValue(a[j],c) === opt.common.getJsonValue(b,c)){
            a.splice(j, 1);
            j = j - 1;
        }
    }
    return a;
}
var array_isf = function(a, b,c) {
    var f = false;
    for (var j = 0; j < a.length; j++) {
        if(opt.common.getJsonValue(a[j],c) === opt.common.getJsonValue(b,c)){
            f = true;
        }
    }
    return f;
}
var _ = {
    "union": union,
    "difference": difference
};

//监听div大小变化
(function($, h, c) {
    var a = $([]),
        e = $.resize = $.extend($.resize, {}),
        i,
        k = "setTimeout",
        j = "resize",
        d = j + "-special-event",
        b = "delay",
        f = "throttleWindow";
    e[b] = 250;
    e[f] = true;
    $.event.special[j] = {
        setup: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {
                w: l.width(),
                h: l.height()
            });
            if (a.length === 1) {
                g();
            }
        },
        teardown: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
                clearTimeout(i);
            }
        },
        add: function(l) {
            if (!e[f] && this[k]) {
                return false;
            }
            var n;
            function m(s, o, p) {
                var q = $(this),
                    r = $.data(this, d);
                r.w = o !== c ? o: q.width();
                r.h = p !== c ? p: q.height();
                n.apply(this, arguments);
            }
            if ($.isFunction(l)) {
                n = l;
                return m;
            } else {
                n = l.handler;
                l.handler = m;
            }
        }
    };
    function g() {
        i = h[k](function() {
                a.each(function() {
                    var n = $(this),
                        m = n.width(),
                        l = n.height(),
                        o = $.data(this, d);
                    if (m !== o.w || l !== o.h) {
                        n.trigger(j, [o.w = m, o.h = l]);
                    }
                });
                g();
            },
            e[b]);
    }
})(jQuery, this);