define(function() {

	function LoaderSpinner(){
	
		this.container = null;
		this.element = null;
		this.timeOutId = null;
		this.movement = 1;
		this.c=264;
		// Timeout
		this.timeOut=15; 
		// Step moviments
  	this.i=0;
  	this.o=0;
	
		this.show = function() {

			this.getElement().parentElement.style.display='block';
			
			this.movement = 1;
			this.i = 0;
			this.o = 0;
			this.moveStep();

  	},

  	this.moveStep = function() {

			if (this.movement == 1) {
				if (this.i == this.c) {
					this.movement = 2;
					this.i=this.c;
					this.o=this.c*2;
				}
				else {
				  this.i+=4;
				  this.o+=8;
				  this.getElement().setAttribute('stroke-dasharray',this.i+' '+(this.c-this.i));
				  this.getElement().setAttribute('stroke-dashoffset',this.o)  					
				}
			}
			else {
				if (this.i==this.c) {
					this.movement = 1;
					this.i = 0;
					this.o = 0;
				}
				else {
					this.i-=4;
					this.o+=4;
				  this.getElement().setAttribute('stroke-dasharray',this.i+' '+(this.c-i));
				  this.getElement().setAttribute('stroke-dashoffset',this.o)
				}
			}
			var self = this;
			this.timeOutId = setTimeout(function(){
																				self.moveStep();
																	}, this.timeOut);

  	},

		this.hide = function() {

			this.getElement().parentElement.style.display = 'none';
			if (this.timeOutId) {
				console.log('clear Timeout');
				clearTimeout(this.timeOutId);
				this.timeOutId = null;
			}
			this.getElement().setAttribute('stroke-dasharray','0 264');
			this.getElement().setAttribute('stroke-dashoffset','0');

		}

		this.getElement = function() {

			if (this.element == null) {

				this.container = document.createElement('div');
				this.container.style.position = 'fixed';
				this.container.style.height = '100%';
				this.container.style.width = '100%';
				this.container.style.top = '0';
				this.container.style.left = '0';
				this.container.style.display = 'block';
				this.container.style.background = '#fff';
				this.container.style.opacity = '0.7';
				this.container.style.zIndex = 99999;

				// Create SVG
				this.element=document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				
				// Create Circle
				let c=document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				this.element.setAttribute('width','100');
				this.element.setAttribute('height','100');
				c.setAttribute('viewBox','0 0 100 100');
				c.setAttribute('cx','50');
				c.setAttribute('cy','50');
				c.setAttribute('r','42');
				c.setAttribute('stroke-width','16');
				c.setAttribute('stroke','#000000');
				c.setAttribute('fill','transparent');
				this.element.appendChild(c);
				this.element.style.cssText='position:absolute;left:calc(50% - 50px);top:calc(50% - 50px)';
				
				this.container.appendChild(this.element);
				document.body.appendChild(this.container);

				//document.body.appendChild(this.element);
			}

			return this.element;

		}

	}
	
	return LoaderSpinner;
});
