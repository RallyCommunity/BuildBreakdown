Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
		{
			itemId: 'rangeSelector',
	        xtype: 'radiogroup',
	        fieldLabel: 'Day Range',
	        items: [
	            { boxLabel: '1', name: 'rb', inputValue: 1 },
	            { boxLabel: '7', name: 'rb', inputValue: 7, checked: true},
	            { boxLabel: '30', name: 'rb', inputValue: 30 },
	            { boxLabel: '90', name: 'rb', inputValue: 90 }
	        ]
	    },
        {
        	xtype: 'fieldcontainer',
        	fieldLabel: 'Options',
        	defaultType: 'checkboxfield',
        	items: [
        		{
	 				boxLabel  : 'GroupByTime',
	            	name      : 'groupByTimeCheckbox',
	            	inputValue: '1',
	            	itemId:      'optGroupByTime',
	            }
        	]
        }
    ],

    launch: function() {
        this.on('afterrender', this._onAfterRender, this);
    },

    _loadBuildStore: function() {
    	this.setLoading(true);

        return Ext.create('Rally.data.WsapiDataStore', {
            model: 'Build',
            autoLoad: true,
            fetch: true,
            sorters: [{
                property: 'CreationDate',
                direction: 'DESC'
              }],
            filters: this._getFilters(),
            listeners: {
                load: this._showChart,
                scope: this
            } 
        });
    },

    _getFilters: function() {
    	var daysAgo = this.getComponent('rangeSelector').getValue().rb,
    		today = new Date();
    		startDate = Rally.util.DateTime.add(today, 'day', 0 - daysAgo),
    		startIso = Rally.util.DateTime.toIsoString(startDate, false),
    		endIso = Rally.util.DateTime.toIsoString(today, false);


        var query = Ext.create('Rally.data.QueryFilter', {
            property: 'BuildDefinition',
            operator: '=',
            value: '/slm/webservice/1.37/builddefinition/6035424766' //PacSystems Mainline Build Definition
        } );
        
        query = query.and(Ext.create('Rally.data.QueryFilter', {
            property: 'CreationDate',
            operator: '>=',
            value: startIso
        } ));
        
        query = query.and( Ext.create( 'Rally.data.QueryFilter', {
                property: 'CreationDate',
                operator: '<=',
                value: endIso
        }) );

        return query;
    },

    _showChart: function(store) {
    	var series = {
    		name: 'Changeset Counts',
    		data: []
    	},
    		data = series.data,
    		groupByTime = this.down('#optGroupByTime').getValue();

		console.log(this.down('#optGroupByTime').getValue());

    	store.each(function(item) {
    		var dataPoint = {
    			y: item.get('Changesets').length,
    			borderColor: item.get('Status') === 'SUCCESS' ? '#07C600' : '#FF0000'
    		};
    		if (groupByTime) {
    			dataPoint.x = item.get('CreationDate'); 
    		}
    		data.push(dataPoint);
    	});

    	if (this.buildChart) {
    		this.remove(this.buildChart);
    	}

		this.buildChart = this.add(this._getChartConfig(series, groupByTime));
		this.setLoading(false);
    },

    _getChartConfig: function(series, groupByTime) {
	    return {
          xtype: 'rallychart',
          height: 400,
          chartConfig: {
              chart: {
              	type: 'column'
              },
              series: [series],
              title: {
                  text: 'Build Breakdown',
                  align: 'center'
              },
              xAxis: [
                  {
                  	  type: groupByTime ? 'datetime' : 'linear',
                      title: {
                          text: 'Build'
                      }
                  }
              ],
              yAxis: {
                  title: {
                      text: 'Changesets'
                  }
              }
          }
      }
    },

    _onAfterRender: function() {
    	this._loadBuildStore();
    	this.getComponent('rangeSelector').on('change', this._onRangeSelectorChange, this);
    	this.down('#optGroupByTime').on('change', this._onOptionsChange, this);
    },

    _onRangeSelectorChange: function() {
    	this._loadBuildStore();
    },

	_onOptionsChange: function(){
		this._loadBuildStore();
	}

});

