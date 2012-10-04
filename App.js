Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
    	{
    		xtype: 'container',
    		layout: 'hbox',
    		items: [
			   //  {
			   //  	xtype: 'combobox',
			   //  	fieldLabel: 'Day Range',
			   //  	itemId: 'rangeSelector',
			   //  	displayField: 'label',
			   //  	valueField: 'value',
			   //  	value: 7,
			   //  	width: 400,
			   //  	store: Ext.create('Ext.data.Store', {
			   //  		fields: ['label', 'value'],
			   //  		data: [{
			   //  			label: '1 Day',
			   //  			value: 1
			   //  		},
			   //  		{
			   //  			label: '7 Days',
			   //  			value: 7
			   //  		},
						// {
			   //  			label: '30 Days',
			   //  			value: 30
			   //  		},
			   //  		{
			   //  			label: '90 Days',
			   //  			value: 90
			   //  		}]
			   //  	}),
			   //  	style: {marginRight: '6px'}
			   //  },
			   	{
			    	xtype: 'rallyslider',
			    	fieldLabel: 'Day Range',
			    	itemId: 'rangeSelector',
			    	value: 7,
			    	width: 400,
			    	increment: 1,
			    	minValue: 1,
			    	maxValue: 180,
			    	style: {marginRight: '6px'}
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
		        	],
		        	
		        }
    		]
    	},
    	{
    		xtype: 'container',
    		layout: 'hbox',
    		items: [
			    {
			    	xtype: 'rallycombobox',
			    	fieldLabel: 'Build Definition',
			    	itemId: 'buildDefinitionSelector',
			    	width: 400,
			    	storeConfig: {
			    		autoLoad: true,
			    		model: 'BuildDefinition'
			    	},
			    	style: {marginRight: '6px'}
			    },
		        {
		        	xtype: 'fieldcontainer',
		        	fieldLabel: 'Build Duration',
		        	defaultType: 'checkboxfield',
		        	items: [
		        		{
			            	name      : 'buildDurationCheckbox',
			            	inputValue: '1',
			            	itemId:      'buildDurationCheckbox',
			            }
		        	]
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
            fetch: ['CreationDate', 'Number', 'Status', 'Changesets', 'Changes', 'Duration'],
            limit: Infinity,
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
    	var daysAgo = this.down('#rangeSelector').getValue(),
    		today = new Date();
    		startDate = Rally.util.DateTime.add(today, 'day', 0 - daysAgo),
    		startIso = Rally.util.DateTime.toIsoString(startDate, false),
    		endIso = Rally.util.DateTime.toIsoString(today, false);

        var query = Ext.create('Rally.data.QueryFilter', {
            property: 'BuildDefinition',
            operator: '=',
            value: this.down('#buildDefinitionSelector').getValue()
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
    		groupByTime = this.down('#optGroupByTime').getValue(),
    		showDuration = this.down('#buildDurationCheckbox').getValue();

    	store.each(function(item) {
    		var color = item.get('Status') === 'SUCCESS' ? '#07C600' : '#FF0000',
    			dataPoint = {
	    			y: showDuration ? item.get('Duration') : item.get('Changesets').length,
	    			color: color,
	    			borderColor: color,
	    			ref: item.get('_ref'),
	    			tooltip: item.get('Number') + '<br />' + item.get('CreationDate') + '<br />Changesets: ' + item.get('Changesets').length.toString() +
	    				'<br />Total Changes: ' + this._getNumChangesForBuild(item).toString() +
	    				'<br />Build Duration: ' + item.get('Duration') + " minutes"
	    		};

    		if (groupByTime) {
    			dataPoint.x = item.get('CreationDate'); 
    		}
    		data.push(dataPoint);
    	}, this);

    	if (this.buildChart) {
    		this.remove(this.buildChart);
    	}

		this.buildChart = this.add(this._getChartConfig(series, groupByTime, showDuration));
		this.setLoading(false);
    },

    _getNumChangesForBuild: function(item) {

    	var changes = 0;
    	Ext.each(item.get('Changesets'), function(cset){
    		changes += cset.Changes.length;
    	});

    	return changes;
    },

    _getChartConfig: function(series, groupByTime, showDuration) {
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
                      text: showDuration ? 'Build Time (min)' : '# of Changesets'
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
    	this.down('#buildDefinitionSelector').getStore().on('load', this._onBuildDefinitionLoad, this);
   	},

   	_onBuildDefinitionLoad: function() {
    	this._loadBuildStore();
    	this.down('#rangeSelector').on('changecomplete', this._loadBuildStore, this);
    	this.down('#optGroupByTime').on('change', this._loadBuildStore, this);
    	this.down('#buildDurationCheckbox').on('change', this._loadBuildStore, this);
    	this.down('#buildDefinitionSelector').on('change', this._loadBuildStore, this);
    	Rally.environment.getMessageBus().subscribe('daysSinceBuild', function(elapsed_days) {
    			console.log("Days ago from build action board: ", elapsed_days);
    			this.down('#rangeSelector').setValue(elapsed_days);
    			this._loadBuildStore();
    		}, this);    	
    }

});

