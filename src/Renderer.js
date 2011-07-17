JPE.declare('Renderer', {
	constructor: function(){
		this._items = {};
		this._delegates = {};
	},
	registerMap:function(type, itemCls, delegate){
		this._items[type] = itemCls;
		this._delegates[type] = delegate;
	},
	getParticleClass: function(type){
		return this._items[type];
	},
	getDelegateClass: function(type){
		return this._delegates[type];
	},
	findDelegateByParticle: function(item){
		var ic = item.constructor,
			ps = this._items,
			ds = this._delegates;
		while(ic.superclass){
			for(var prop in ps){
				if(ps[prop] === ic){
					return ds[prop]
				}
			}
			ic = ic.superclass; 
		}
		return null;
	},
	getRenderDelegate: function(item){
		var rd = item.get('renderDelegate');
		if(rd == undefined){
			rd = this.findDelegateByParticle(item)
			item.set('delegateClass', rd);
		}
		return rd;
	},
	initSelf: function(item){
		var rd = this.getRenderDelegate(item);
		rd && rd.initSelf(item);
	},
	cleanup: function(item){
		var rd = this.getRenderDelegate(item);
		rd && rd.cleanup(item);
	},
	render: function(item){
		var rd = this.getRenderDelegate(item);
		rd && rd.render(item);
	},
	setVisible: function(item){
		var rd = this.getRenderDelegate(item);
		rd && rd.setVisible(item);
	}
});