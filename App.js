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
        	fieldLabel: 'Group By Time',
        	defaultType: 'checkboxfield',
        	items: [
        		{
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
            fetch: ['CreationDate', 'Number', 'Status', 'Changesets', 'Changes'],
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
    	var daysAgo = this.down('#rangeSelector').getValue().rb,
    		today = new Date();
    		startDate = Rally.util.DateTime.add(today, 'day', 0 - daysAgo),
    		startIso = Rally.util.DateTime.toIsoString(startDate, false),
    		endIso = Rally.util.DateTime.toIsoString(today, false);


        var query = Ext.create('Rally.data.QueryFilter', {
            property: 'BuildDefinition',
            operator: '=',
            value: '/builddefinition/6035424766' //PacSystems Mainline Build Definition
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

    	store.each(function(item) {
    		var color = item.get('Status') === 'SUCCESS' ? '#07C600' : '#FF0000',
    			dataPoint = {
	    			y: item.get('Changesets').length,
	    			color: color,
	    			borderColor: color,
	    			ref: item.get('_ref'),
	    			tooltip: item.get('Number') + '<br />' + item.get('CreationDate') + '<br />Changesets: ' + item.get('Changesets').length.toString() +
	    				'<br />Total Changes: ' + this._getNumChangesForBuild(item).toString()
	    		};

    		if (groupByTime) {
    			dataPoint.x = item.get('CreationDate'); 
    		}
    		data.push(dataPoint);
    	}, this);

    	if (this.buildChart) {
    		this.remove(this.buildChart);
    	}

		this.buildChart = this.add(this._getChartConfig(series, groupByTime));
		this.setLoading(false);
    },

    _getNumChangesForBuild: function(item) {

    	var changes = 0;
    	Ext.each(item.get('Changesets'), function(cset){
    		changes += cset.Changes.length;
    	});

    	return changes;
    },

    _getChartConfig: function(series, groupByTime) {
	    return {
          xtype: 'rallychart',
          height: 400,
          chartConfig: {
              chart: {
              	type: 'column'
              },
              tooltip: {
              formatter: function() {
              		return this.point.tooltip;
              	}
              },
              legend: {enabled: false},
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
                      },
                      labels: {
                      	enabled: groupByTime
                      }
                  }
              ],
              yAxis: {
                  title: {
                      text: 'Changesets'
                  }
              },
              plotOptions: {
              	series: {
                  cursor: 'pointer',
                  	point: {
                        events: {
                            click: function() {
                                Rally.environment.getMessageBus().publish('buildSelected', this.ref);
                            }
                        }
                    }
                }
              }
          }
      }
    },

    _onAfterRender: function() {
    	this._loadBuildStore();
    	this.down('#rangeSelector').on('change', this._onRangeSelectorChange, this);
    	this.down('#optGroupByTime').on('change', this._onOptionsChange, this);
    },

    _onRangeSelectorChange: function() {
    	this._loadBuildStore();
    },

	_onOptionsChange: function(){
		this._loadBuildStore();
	}

});

