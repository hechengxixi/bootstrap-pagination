# bootstrap-pagination
this is a pager plugin that is based on bootstrap's pagination 

## featrue
    1.set pageSize per page
    2.set the number of pager to display
    3.load local data or remote data
    4.listen remote load event and data load event

## API
### configuration
        pageSize: [Number], default 1
        serverPagination:[Boolean], default false
        autoLoad:[Boolean], default true
        data:[Array || Object], this is used to be loadData's param, if autoLoad is true
        url:[String], if url is not set and autoLoad is true, loadData could be executed
        dataField: [String], default '', which field data selection is in ajax response; if value is '',data is in the root
        totalCountField: [String], default 'totalCount',which field totalCount is in data selection
        totalPagesField: [String], default 'totalPages',which field totalPages is in data selection;this is not required
        displayNumber: [Number], default 5, how many page is displayed in the pager

### method
        load:params[option, isFireLoadEvent]
        loadData:params[data]
        loadPage:params[page]
        updatePagersView
        destroy

### event
        'loadSuccess.bs.pagination'
        'loadError.bs.pagination'
        'loadDataEnd.bs.pagination'
        'clickPage.bs.pagination'
        'clickPrevious.bs.pagination'
        'clickNext.bs.pagination'
        'clickMore.bs.pagination'

