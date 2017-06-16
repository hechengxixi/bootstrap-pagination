(function($){
	'use strict';

	//辅助函数
	var templateFormatter = function (tpl, data) {
		return tpl.replace(/{(.*?)}/ig, function (match, key) {
			return data[key]
		})
	}

	var emptyFn = function () {}


	var BootstrapPagination = function (el, options) {
		this.options = $.extend({}, BootstrapPagination.DEFAULTS, typeof options === 'object' && options)
		$.extend(this, this.options)
		this.$el = $(el);
		// this.$el_ = this.$el.clone();

		this.init();
	}

	BootstrapPagination.DEFAULTS = {
		pageSize: 1,
		currentPage:0,
		totalCount: 0,
		totalPages: 0,
		serverPagination: false,
		autoLoad:true,
		data: null,
		url: '',
		dataField: 'data',
		totalCountField: 'totalCount',
		totalPagesField: 'totalPages',
		currentPage: 1,
		displayNumber: 5,
		previousTemplate:'<li data-function="-1"><a aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>',
		disabledPreviousTemplate:'<li class="disabled" data-function="-1"><a aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>',
		nextTemplate:'<li data-function="1"><a aria-label="Next" ><span aria-hidden="true">&raquo;</span></a></li>',
		disabledNextTemplate:'<li class="disabled" data-function="1"><a aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>',
		activePagerTemplate: '<li class="active" data-page="{page}"><a href="javascript:;">{page}</a></li>',
		pagerTemplate: '<li data-page="{page}"><a href="javascript:;">{page}</a></li>',
		moreTemplate: '<li class="more"><a href="javascript:;">...</a></li>',
		/*
			参数依次为：this, 响应数据
		*/
		onLoadSuccess:emptyFn,
		/*
			参数依次为：this
		*/
		onLoadError:emptyFn,
		/*
			参数依次为：this, 数据
		*/
		onLoadDataEnd:emptyFn,
		/*
			参数依次为：this, page
		*/
		onClickPage:emptyFn,
		onClickPrevious:emptyFn,
		onClickNext:emptyFn,
		onClickMore:emptyFn
	}

	BootstrapPagination.EVENTS = {
		'loadSuccess.bs.pagination': 'onLoadSuccess',
		'loadError.bs.pagination': 'onLoadError',
		'loadDataEnd.bs.pagination': 'onLoadDataEnd',
		'clickPage.bs.pagination': 'onClickPage',
		'clickPrevious.bs.pagination': 'onClickPrevious',
		'clickNext.bs.pagination': 'onClickNext',
		'clickMore.bs.pagination': 'onClickMore'
	}

	BootstrapPagination.prototype.bindEvent = function(){
		var me = this
		me.$el.on('click','li[data-page]', function () {
			var page = Number($(this).data('page'))
			me.trigger('clickPage', this, page)
			me.loadPage(page)
		})
		me.$el.on('click','li[data-function]', function () {
			if($(this).hasClass('disabled')){
				return false
			}
			var diff = Number($(this).data('function')),
				page =  me.currentPage + diff;
			me.trigger('clickPage', this, page)
			me.loadPage(page)
		})
	}

	BootstrapPagination.prototype.offEvent = function () {
		this.$el.off('click')
	}

	BootstrapPagination.prototype.trigger = function (name) {
        var args = Array.prototype.slice.call(arguments, 1);

        name += '.bs.pagination';
        this[BootstrapPagination.EVENTS[name]].apply(this.options, args);
        this.$el.trigger($.Event(name), args);
    };

	BootstrapPagination.prototype.init = function () {
		this.options = Object.assign(this.options, this.getDataOptions());
		//绑定事件
		this.bindEvent()
		//获取数据
		if(this.autoLoad){
			if (this.data) {
				this.loadData(this.data)
			} else {
				this.load()
			}
		}
	}

	BootstrapPagination.prototype.getDataOptions = function () {
		var dataOptions = Object.create(this.$el.data());
		return dataOptions
	}

	BootstrapPagination.prototype.generatePagers = function () {
		var mark = '',
			startPage = 1,
			endPage;
		mark += this.currentPage === 1 ? this.disabledPreviousTemplate : this.previousTemplate
		startPage = (startPage = this.currentPage-Math.floor(this.displayNumber/2))>0 ? startPage : 1
		endPage = (endPage = this.currentPage+Math.floor(this.displayNumber/2))<=this.totalPages? endPage : this.totalPages
		if (startPage>1){
			mark += (templateFormatter(this.pagerTemplate, {page:1}))
		}
		if (startPage>2){
			mark += this.moreTemplate
		}
		for (var p = startPage; p<=endPage; p++) {
			mark += (templateFormatter( this.currentPage === p ? this.activePagerTemplate : this.pagerTemplate, {page:p}))
		}

		if(this.totalPages > endPage+1){
			mark += this.moreTemplate
		}
		if(this.totalPages > endPage){
			mark += (templateFormatter(this.pagerTemplate, {page:this.totalPages}))
		}
		mark += this.currentPage === this.totalPages ? this.disabledNextTemplate : this.nextTemplate
		return mark
	}

	BootstrapPagination.prototype.load = function (option, isFireLoadEvent) {
		var me = this,
			option = option || {},
			isFireLoadEvent = isFireLoadEvent === undefined ? true : isFireLoadEvent,
			requestOption = {
				url: option.url || me.url,
				type: option.method || 'GET',
				data:option.params,
				success: function (res) {
					res = JSON.parse(res)
					option.success && option.success()
					me.loadData(me.dataField ? res[me.dataField] : res)
					isFireLoadEvent && me.trigger('loadSuccess', me, res)
				},
				error: function (res) {
					option.error && option.error()
					isFireLoadEvent && me.trigger('loadError', me)
				}
			}

		if(option.method && option.method.toUpperCase() === 'POST'){
			requestOption.type = 'POST'
			requestOption.contentType = 'application/json'
			requestOption.data = JSON.stringify(option.params)
		}

		$.ajax(requestOption);
	}

	BootstrapPagination.prototype.loadData = function (data) {
		data && (this.data = data) 
		if (this.serverPagination) {
			this.totalCount = this.data[this.totalCountField]
			this.totalPages = this.data[this.totalPagesField]
			if (this.totalPages === undefined) {
				this.totalPages = Math.ceil(this.totalCount / this.pageSize)
			}
		} else {
			this.data = this.data instanceof Array ? this.data : []
			this.totalCount = this.data.length
			this.totalPages = Math.ceil(this.totalCount / this.pageSize)
		}
		this.updatePagersView()
		this.trigger('loadDataEnd',this,this.data)
	}

	BootstrapPagination.prototype.loadPage = function (page) {
		var me = this
		if(me.url){
			me.load({
				params: {
					page:page
				},
				success: function () {
					me.currentPage = page
				}
			})
		} else {
			me.currentPage = page
			me.loadData()
		}
		
	}

	BootstrapPagination.prototype.updatePagersView = function () {
		var html = this.generatePagers()
		this.$el.empty()
		this.$el.append($(html))
	}
	BootstrapPagination.prototype.destroy = function () {
		this.offEvent()
	} 
	$.fn.bootstrapPagination = function (option) {
		var value,
			args = Array.prototype.slice.call(arguments, 1)

		this.each(function () {
			var $this = $(this),
				bootstrapPagination = $this.data('bootstrap.pagination')

			//如果第一个参数是一个String
			if (typeof option === 'string'){
				if (bootstrapPagination[option] === undefined ) {
                    throw new Error("Unknown method or property: " + option);
                }

                if (!bootstrapPagination) {
                    return;
                }
                value = bootstrapPagination[option].apply(bootstrapPagination, args);

                if (option === 'destroy') {
                    $this.removeData('bootstrap.pagination');
                }
			}

			if (!bootstrapPagination) {
                $this.data('bootstrap.pagination', (bootstrapPagination = new BootstrapPagination(this, option)));
            }
		})

		return typeof value === 'undefined' ? this : value;
	}

	$.fn.bootstrapPagination.Constructor = BootstrapPagination;
    $.fn.bootstrapPagination.defaults = BootstrapPagination.DEFAULTS;


})(jQuery)