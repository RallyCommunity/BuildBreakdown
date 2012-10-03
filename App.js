Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        this._getBuildStore();
    },

    _getBuildStore: function() {
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
        // var build_start = Rally.util.DateTime.toIsoString( this.start_date_picker.getValue(), false);
        // var build_end = Rally.util.DateTime.toIsoString( Rally.util.DateTime.add( this.end_date_picker.getValue(), "day", 1 ), false);
        // var build_message = this.text_picker.getValue();
        
        // console.log( "start,end,message", build_start, build_end, build_message );
        
        // var query = Ext.create('Rally.data.QueryFilter', {
        //     property: 'CreationDate',
        //     operator: '>=',
        //     value: build_start
        // } );
        
        // query = query.and( Ext.create( 'Rally.data.QueryFilter', {
        //         property: 'CreationDate',
        //         operator: '<=',
        //         value: build_end
        // }) );
        
        // if ( build_message && build_message.trim !== "" ) {
        //     query = query.and( Ext.create( 'Rally.data.QueryFilter', {
        //         property: 'Number',
        //         operator: 'contains',
        //         value: build_message
        //     }) );
            
        // }

        var query = Ext.create('Rally.data.QueryFilter', {
            property: 'BuildDefinition',
            operator: '=',
            value: '/slm/webservice/1.37/builddefinition/6035424766' //PacSystems Mainline Build Definition
        } );

        return query;
    },

    _showChart: function(store) {
    	var series = {
    		name: 'Changeset Counts',
    		data: []
    	},
    		data = series.data;

    	store.each(function(item) {
    		data.push({
    			y: item.get('Changesets').length,
    			borderColor: item.get('Status') === 'SUCCESS' ? '#07C600' : '#FF0000'
    		});
    	});
    	console.log('store transformed!');

		this.add(this._getChartConfig(series));
    },

    _getChartConfig: function(series) {
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
    }
});
