JPE.declare('EaselRenderer', {

	superclass: JPE.Renderer,

	constructor: function(stage){
		JPE.EaselRenderer.superclass.prototype.constructor.apply(this, arguments);
		this.stage = stage;
		this.registerMap('RectangleParticle', JPE.RectangleParticle, new JPE.EaselRenderer.RectangleParticleDelegate(this));
		this.registerMap('CircleParticle', JPE.CircleParticle, new JPE.EaselRenderer.CircleParticleDelegate(this));
		this.registerMap('WheelParticle', JPE.WheelParticle, new JPE.EaselRenderer.WheelParticleDelegate(this));
		this.registerMap('SpringConstraintParticle', JPE.SpringConstraintParticle, new JPE.EaselRenderer.SpringConstraintParticleDelegate(this));
		this.registerMap('SpringConstraint', JPE.SpringConstraint, new JPE.EaselRenderer.SpringConstraintDelegate(this));
	}
});
JPE.declare('EaselRenderer.AbstractDelegate', {
	
	constructor: function(renderer){
		this.renderer = renderer;
		this.stage = renderer.stage;
	},

	initSelf: function(item){
		var sprite = new Container(),
			shape = new Shape();
		sprite.addChild(shape);
		if(!item.getVisible()){
			sprite.visible = false;
		}
		this.stage.addChild(sprite);
		item.set('sprite', sprite);
		item.set('shape', shape);
		this.drawShape(item);
	},
	cleanup: function(item){
		this.stage.removeChild(sprite);
	},
	drawShape: function(item){
	},
	setVisible: function(item){
		var sprite = item.get('sprite');
		if(sprite){
			sprite.visible = item.getVisible();
		}
	},
	render: function(item){
	}
});
JPE.declare('EaselRenderer.RectangleParticleDelegate', {

	superclass: JPE.EaselRenderer.AbstractDelegate,
	
	drawShape: function(item){
		var shape = item.get('shape'), 
			g = shape.graphics,
			w = item.getExtents()[0] * 2,
			h = item.getExtents()[1] * 2;
			shape.x = - w/2;
			shape.y =  - h/2;
			g.clear();
			if(item.lineThickness){
				g.setStrokeStyle(item.lineThickness)
				g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
			}
			g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
			g.drawRect(0, 0, w, h);
			g.endFill();
	},
	render: function(item){
		var sprite = item.get('sprite'),
			x = item.curr.x,
			y = item.curr.y,
			w = item.getExtents()[0] * 2,
			h = item.getExtents()[1] * 2,
			r = item.getAngle();

		if(sprite){
			sprite.rotation = r;
			sprite.x = x ;
			sprite.y = y;
		}
	}
});



JPE.declare('EaselRenderer.CircleParticleDelegate', {
	superclass: JPE.EaselRenderer.AbstractDelegate,

	drawShape: function(item){
		var r = item.getRadius(),
			shape = item.get('shape'),
			g = shape.graphics;

		g.clear();
		if(item.lineThickness){
			g.setStrokeStyle(item.lineThickness)
			g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
		}
		g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
		g.drawCircle(0, 0, r);
		g.endFill();
	},
	render: function(item){
		var x = item.curr.x,
			y = item.curr.y,
			sprite = item.get('sprite');
		sprite.x = x;
		sprite.y = y;
	}
});

JPE.declare('EaselRenderer.WheelParticleDelegate', {
	superclass: JPE.EaselRenderer.AbstractDelegate,
	
	drawShape: function(item){
		
		var r = item.getRadius(),
			shape = item.get('shape'),
			g = shape.graphics;
		
		g.clear();
		if(item.lineThickness){
			g.setStrokeStyle(item.lineThickness);
			g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
		}
		g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
		g.drawCircle(0, 0, r);
		
		g.setStrokeStyle(1);
		g.beginStroke(Graphics.getRGB(0xffffff-item.lineColor));
		g.moveTo(-r, 0);
		g.lineTo(r, 0);
		g.moveTo(0, -r);
		g.lineTo(0, r);
		g.endFill();
	},
	render: function(item){
		var x = item.curr.x,
			y = item.curr.y,
			r = item.getAngle(),
			sprite = item.get('sprite');	
		sprite.rotation = r;
		sprite.x = x;
		sprite.y = y;

	}
});

JPE.declare('EaselRenderer.SpringConstraintParticleDelegate', {
	superclass: JPE.EaselRenderer.AbstractDelegate,

	initSelf: function(item){
		var inner = new Container(),
			shape = new Shape(),
			parent = item.parent,
			parentSprite = parent.get('sprite');
		if(!parentSprite){
			parentSprite = new Container();
			parent.set('sprite', parentSprite);
		}
		item.set('sprite', inner);
		item.set('shape', shape);
		if(!item.getVisible()){
			sprite.visible = false;
		}
		inner.addChild(shape);
		parentSprite.addChild(inner);
		this.drawShape(item);
		this.stage.addChild(parentSprite);
	},
	cleanup: function(item){
		var parent = item.parent;
		this.stage.removeChild(parent.get('sprite'));
	},
	drawShape: function(item){
		var shape = item.get('shape'), 
			 g = shape.graphics,
			 parent = item.parent,
			 c = parent.getCenter(),
			 w = parent.getCurrLength() * item.getRectScale(),
			 h = item.getRectHeight();
			
			
			g.clear();
			if(parent.lineThickness){
				g.setStrokeStyle(parent.lineThickness);
				g.beginStroke(Graphics.getRGB(parent.lineColor, parent.lineAlpha));
			}
			g.beginFill(Graphics.getRGB(parent.fillColor, parent.fillAlpha));
			g.drawRect(-w/2, -h/2, w, h);
			g.endFill();
	},
	render: function(item){
		
		var parent = item.parent,
			c = parent.getCenter(),
			s = item.get('sprite'),
			shape = item.get('shape');

		s.x = c.x ;
		s.y =  c.y ;
		if (item.scaleToLength) {
			s.width = parent.getCurrLength() * item.getRectScale();
		}
		s.rotation = parent.getAngle();
		

	}
});

JPE.declare('EaselRenderer.SpringConstraintDelegate', {
	superclass: JPE.EaselRenderer.AbstractDelegate,
	initSelf: function(item){
	},
	cleanup: function(item){
		var sprite = item.get('sprite');
		if(sprite){
			this.stage.removeChild(sprite);
		}
	},
	initShape: function(item){
		var sprite = new Container(),
			shape = new Shape();
		
		item.set('sprite', sprite);
		item.set('shape', shape);
		sprite.addChild(shape);
		this.stage.addChild(sprite);
	},
	drawShape: function(item){

		var shape = item.get('shape'), 
			 g = shape.graphics,
			p1 = item.p1,
			p2 = item.p2;

		g.clear();
		if(item.lineThickness){
			g.setStrokeStyle(item.lineThickness);
			g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
		}
		g.moveTo(p1.getPx(), p1.getPy());
		g.lineTo(p2.getPx(), p2.getPy());	
		g.endFill();
	},
	render: function(item){
		if (item.getCollidable()) {
			item.scp.paint();
		}else{
			if(!item.get('shape')){
				this.initShape(item);
			}
			this.drawShape(item);
		}
	}
});