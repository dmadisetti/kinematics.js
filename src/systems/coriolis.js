this.Coriolis = function(type){
    var forward = function(system){
        system.Position = function(o, p){

            // Clear Existing setup
            system.V = null;
            system.A = null;

            this.o = o;
            this.p = p;

            this.total = new Vector(p, o);

            system.P = this;
        };

        system.Velocity = function(o,p,w,v){

            this.P = new system.Position(o,p);

            this.w = w;
            this.v = v;

            this.tangential = new Vector(p * w, o + pi/2);
            this.slip = new Vector(v, o);
            this.total = this.tangential.add(this.slip,atan2);

            system.V = this;
        };

        system.Acceleration = function(o,p,w,v,a,ac){

            this.V = new system.Velocity(o,p,w,v);
            this.P = this.V.P;

            this.a = a;
            this.ac = ac;

            this.tangential  = new Vector(p * a, o + pi/2);
            this.centripital = new Vector(-p * w * w, o);
            this.coriolis = new Vector(2*v*w, o + pi/2);
            this.slip = new Vector(ac, o);

            this.total = this.centripital.add(
                this.coriolis.add(
                    this.tangential.add(
                        this.slip,atan2
                    ),atan2
                ),atan2
            );

            system.A = this;
        };
        system.accelerate = function(o,p,w,v,a,ac){new this.Acceleration(o,p,w,v,a,ac); return this.A;};
        return system;
    };

    // Computed from row reduction
    var solve = function(a,b,c,d,A,B){
        var y = (B - (A*c/a))/(d-b*c/a);
        var x = A/a - y*b/a;
        return {"x":x,"y":y};
    };

    var backwards = function(system){
        system.Position = function(o,p){

            // Clear Existing setup
            system.V = null;
            system.A = null;

            this.total = new Vector(p, o);

            system.P = this;
        };

        system.Velocity = function(o,p,V){

            this.P = new system.Position(o,p);
            this.total = V;

            var sol = solve(
                cos(o),-p*sin(o),
                sin(o), p*cos(o),

                // Solution
                V.m * cos(V.o),
                V.m * sin(V.o)
            );

            this.v = sol.x;
            this.w = sol.y;

            system.V = this;
        };

        system.Acceleration = function(o,p,V,A){

            this.V = new system.Velocity(o,p,V);
            this.P = this.V.P;
            this.total = A;

            var v = this.V.v,
                w = this.V.w;

            var sol = solve(
                cos(o),-p*sin(o),
                sin(o), p*cos(o),

                // Solution
                p*w*w*cos(o) + 2*v*w*sin(o) + A.m * cos(A.o),
                p*w*w*sin(o) - 2*v*w*cos(o) + A.m * sin(A.o)
            );

            this.ac = sol.x;
            this.a  = sol.y;

            system.A = this;
            forward(system);
        };
        system.accelerate = function(o,p,V,A){new this.Acceleration(o,p,V,A); return this.A;};
        return system;
    };

    var system = {"backwards":backwards,"forward":forward}[type](this);


    this.animate = function(delta){
        var a,b,c,x,y,h;
        context.clearRect(0, 0, x = context.canvas.width, y = context.canvas.height);
        var system = this,
            offset = new Vector(h=hyp(x,y)/2, tan(y/x)),
            A = offset.add(new Vector(h,system.P.o) , atan2),
            B = offset.add(new Vector(-h,system.P.o), atan2);

        // Line through origin

        // Showing points
        system.point(offset, 3, "#FF0000");
        system.draw(offset, system.P.total, "#00FF00");
        system.point(offset.add(system.P.total), 10, "#0000FF");
        
        system.step(1e-2);
        window.setTimeout(function(){system.animate(delta);}, 12);
    };

    this.step = function(delta){
        if(this.A){
            new this.Acceleration(
                this.P.o + this.V.w  * delta, 
                this.P.p + this.V.v  * delta, 
                this.V.w + this.A.a  * delta, 
                this.V.v + this.A.ac * delta,
                this.A.a,
                this.A.ac
            );
        }else if (this.V){
            new this.Velocity(
                this.P.o + this.V.w  * delta, 
                this.P.p + this.V.v  * delta, 
                this.V.w,
                this.V.v
            );
        }else {
            new this.Position(
                this.P.o,
                this.P.p
            );                
        }
    };
};

// V.m == 36.0555127546398
// V.o == 1.76819188664477 (radians)
// A.m == 773.369252039412
// A.o == 3.05921072299810 (radians)

// v  == 25.0001414260118
// ac == -34.998276464836
// w  == -9.9999901787165
// a  == 7.99984420047665