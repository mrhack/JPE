/*!
 * @revision:
 */
/*
 * @author: <a href="zhengxie.lj@taobao.com">zhengxie</a>
 * @version:1-0-0
 */
YUI.add('jpe-abstract-particle', function(Y) {
	
	var Vector = Y.Vector;

	var AbstractParticle = function(x, y, isFixed, mass, elasticity, friction){
		
			this.interval = new Interval(0,0);
			
			this.curr = new Vector(x, y);
			this.prev = new Vector(x, y);
			this.samp = new Vector();
			this.temp = new Vector();
			this.fixed = isFixed;
			
			this.forces = new Vector();
			this.collision = new Collision(new Vector(), new Vector());
			this.collidable = true;
			
			this.mass = mass;
			this.elasticity = elasticity;
			this.friction = friction;
			
			this.setStyle();
			
			this._center = new Vector();
			this.multisample = 0;
	}

	Y.extend(AbstractParticle , Y.AbstractItem, {
		
		/**
		 * The mass of the particle. Valid values are greater than zero. By default, all particles
		 * have a mass of 1. The mass property has no relation to the size of the particle.
		 * 
		 * @throws ArgumentError ArgumentError if the mass is set less than zero. 
		 */
		getMass: function () {
			return this._mass; 
		},
		
		
		/**
		 * @private
		 */
		setMass: function(m) {
			if (m <= 0) throw new Error("mass may not be set <= 0"); 
			this._mass = m;
			this._invMass = 1 / _mass;
		},
	
		
		/**
		 * The elasticity of the particle. Standard values are between 0 and 1. 
		 * The higher the value, the greater the elasticity.
		 * 
		 * <p>
		 * During collisions the elasticity values are combined. If one particle's
		 * elasticity is set to 0.4 and the other is set to 0.4 then the collision will
		 * be have a total elasticity of 0.8. The result will be the same if one particle
		 * has an elasticity of 0 and the other 0.8.
		 * </p>
		 * 
		 * <p>
		 * Setting the elasticity to greater than 1 (of a single particle, or in a combined
		 * collision) will cause particles to bounce with energy greater than naturally 
		 * possible.
		 * </p>
		 */ 

		
		
		/**
		 * Returns A Vector of the current location of the particle
		 */	
		getCenter: function () {
			this._center.setTo(this.getPx(), this.getPy())
			return this._center;
		},
		
				
		/**
		 * The surface friction of the particle. Values must be in the range of 0 to 1.
		 * 
		 * <p>
		 * 0 is no friction (slippery), 1 is full friction (sticky).
		 * </p>
		 * 
		 * <p>
		 * During collisions, the friction values are summed, but are clamped between 1 and 0.
		 * For example, If two particles have 0.7 as their surface friction, then the resulting
		 * friction between the two particles will be 1 (full friction).
		 * </p>
		 * 
		 * <p>
		 * In the current release, only dynamic friction is calculated. Static friction
		 * is planned for a later release.
		 * </p>
		 *
		 * <p>
		 * There is a bug in the current release where colliding non-fixed particles with friction
		 * greater than 0 will behave erratically. A workaround is to only set the friction of
		 * fixed particles.
		 * </p>
		 * @throws ArgumentError ArgumentError if the friction is set less than zero or greater than 1
		 */	
		getFriction: function () {
			return this._friction; 
		}
	
		
		/**
		 * @private
		 */
		setFriction: function (f):void {
			if (f < 0 || f > 1) throw new Error("Legal friction must be >= 0 and <=1");
			this._friction = f;
		}
		

		
		
		/**
		 * The position of the particle. Getting the position of the particle is useful
		 * for drawing it or testing it for some custom purpose. 
		 * 
		 * <p>
		 * When you get the <code>position</code> of a particle you are given a copy of the current
		 * location. Because of this you cannot change the position of a particle by
		 * altering the <code>x</code> and <code>y</code> components of the Vector you have retrieved from the position property.
		 * You have to do something instead like: <code> position = new Vector(100,100)</code>, or
		 * you can use the <code>px</code> and <code>py</code> properties instead.
		 * </p>
		 * 
		 * <p>
		 * You can alter the position of a particle three ways: change its position, set
		 * its velocity, or apply a force to it. Setting the position of a non-fixed particle
		 * is not the same as setting its fixed property to true. A particle held in place by 
		 * its position will behave as if it's attached there by a 0 length spring constraint. 
		 * </p>
		 */
		getPosition: function () {
			return new Vector(this.curr.x, this.curr.y);
		}
		
		
		/**
		 * @private
		 */
 		setPosition: function (p) {
			this.curr.copy(p);
			this.prev.copy(p);
		},

	
		/**
		 * The x position of this particle
		 */
		getPx: function () {
			return this.curr.x;
		},

		
		/**
		 * @private
		 */
		setPx: function(x) {
			this.curr.x = x;
			this.prev.x = x;	
		},


		/**
		 * The y position of this particle
		 */
		getPy: function() {
			return this.curr.y;
		},


		/**
		 * @private
		 */
		setPy: function(y) {
			this.curr.y = y;
			this.prev.y = y;	
		},


		/**
		 * The velocity of the particle. If you need to change the motion of a particle, 
		 * you should either use this property, or one of the addForce methods. Generally,
		 * the addForce methods are best for slowly altering the motion. The velocity property
		 * is good for instantaneously setting the velocity, e.g., for projectiles.
		 * 
		 */
		getVelocity: function () {
			return this.curr.minus(this.prev);
		},
		
		
		/**
		 * @private
		 */	
		setVelocity: function (v) {
			this.prev = this.curr.minus(v);	
		},
		
		
		
		/**
		 * Assigns a DisplayObject to be used when painting this particle.
		 */ 
		setDisplay:function (d, offsetX, offsetY, rotation) {
			this.displayObject = d;
			this.displayObjectRotation = rotation || 0;
			this.displayObjectOffset = new Vector(offsetX, offsetY);
		},
		
		
		/**
		 * Adds a force to the particle. The mass of the particle is taken into 
		 * account when using this method, so it is useful for adding forces 
		 * that simulate effects like wind. Particles with larger masses will
		 * not be affected as greatly as those with smaller masses. Note that the
		 * size (not to be confused with mass) of the particle has no effect 
		 * on its physical behavior with respect to forces.
		 * 
		 * @param f A Vector represeting the force added.
		 */ 
		addForce: function(f) {
			this.forces.plusEquals(f.mult(this.invMass));
		},
		
		
		/**
		 * Adds a 'massless' force to the particle. The mass of the particle is 
		 * not taken into account when using this method, so it is useful for
		 * adding forces that simulate effects like gravity. Particles with 
		 * larger masses will be affected the same as those with smaller masses.
		 *
		 * @param f A Vector represeting the force added.
		 */ 	
		addMasslessForce: function(f) {
			this.forces.plusEquals(f);
		},
		
			
		/**
		 * The <code>update()</code> method is called automatically during the
		 * APEngine.step() cycle. This method integrates the particle.
		 */
		update: function(dt2) {
			
			if (this.fixed) return;
			
			// global forces
			this.addForce(JPE.force);
			this.addMasslessForce(JPE.masslessForce);
	
			// integrate
			this.temp.copy(curr);
			
			var nv = this.getVelocity().plus(this.forces.multEquals(dt2));
			this.curr.plusEquals(nv.multEquals(JPE.damping));
			this.prev.copy(this.temp);

			// clear the forces
			this.forces.setTo(0,0);
		},
		
		initDisplay: function() {
			this.displayObject.setX(displayObjectOffset.x);
			this.displayObject.setY(displayObjectOffset.y);
			this.displayObject.setRotation(this.displayObjectRotation);
		},
		
		getComponents: function(collisionNormal) {
			var vel = this.velocity;
			var vdotn = collisionNormal.dot(vel);
			this.collision.vn = collisionNormal.mult(vdotn);
			this.collision.vt = vel.minus(this.collision.vn);	
			return this.collision;
		},
	
	
		resolveCollision: function(mtd, vel) {
			this.curr.plusEquals(mtd);
			this.setVelocity (vel);
		},
		
		getInvMass:function() {
			return (this.fixed) ? 0 : this._invMass; 
		}

	});

	Y.AbstractParticle = AbstractParticle;

}, '1.0.0' ,{requires:['jpe-abstract-item', 'jpe-verctor', 'jpe-interval', 'jpe']});
