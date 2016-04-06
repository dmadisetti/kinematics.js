var System = function(){
    this.connected = {};
};
System.prototype = {
    Position: function(){},
    Velocity: function(){},
    Acceleration: function(){},

    draw: function(offset, link, color){
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(offset.x, offset.y);
        context.lineTo(offset.x + link.x, offset.y + link.y);
        context.stroke();
    },
    connect: function(start, end, color){
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    },

    animate: function(instance, delta){
        var a,b,c,x,y;
        context.clearRect(0, 0, x = context.canvas.width, y = context.canvas.height);
        var system = this,
            offset = new Vector(hyp(x,y)/2, tan(y/x)); // TODO: remove arbitrary offset


        // Expand to more than 4 bar
        system.draw(a = offset, system.P[instance].A, "#FF0000");
        system.draw(b = a.add(system.P[instance].A), system.P[instance].B, "#00FF00");
        
        // Final displayed link in FourBar
        if(system.connected){
            system.connect(c = b.add(system.P[instance].B), offset.add(new Vector(system.link[1], 0)), "#0000FF");
        } else {}

        system.step(1e-2, instance);
        window.setTimeout(function(){system.animate(instance,delta);}, 10);
    },

    step: function(delta, instance){
        if(this.A){
            new this.Acceleration(
                this.P[instance].o[2] + this.V[instance].w[2] * delta, 
                this.V[instance].w[2] + this.A[instance].a[2] * delta, 
                this.A[instance].a[2]
            );
        }else if (this.V){
            new this.Velocity(
                this.P[instance].o[2] + this.V[instance].w[2] * delta, 
                this.V[instance].w[2]
            );
        }else {
            new this.Position(
                this.P[instance].o[2]
            );                
        }
    }
};