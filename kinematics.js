var Kinematics = function(context){
    var sin  = Math.sin;
    var cos  = Math.cos;
    var atan = Math.atan;
    var asin = Math.asin;
    var sqrt = Math.sqrt;
    var pi   = Math.PI;
    var hyp  = Math.hypot;
    var sr   = function(x){return x*x};

    var OPEN = "open";
    var CRSS = "crossed";

    // helpers
    var k = this;
    k.rad = function(deg){
        return 2*pi*(deg/360);
    }
    k.attach = function(module){
        module.prototype = System.prototype;
        this[name] = module;
    }

    var Vector = function(m, o){
        this.m = m;
        this.o = o;
        this.x = m * cos(o);
        this.y = m * sin(o);
        var V = this;
        this.add = function(v){
            var x,y;
            return new Vector(hyp(x = V.x + v.x, y = V.y + v.y), atan(y/x));
        }
    }

    var System = function(){
        this.connected;
        this.system;
    }
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
            var system = this;        
            context.clearRect(0, 0, canvas.width, canvas.height);
            var a,b,c,offset = new Vector(500, k.rad(45)); // TODO: remove arbitrary offset

            // Expand to more than 4 bar
            system.draw(a = offset, system.P[instance].A, "#FF0000");
            system.draw(b = a.add(system.P[instance].A), system.P[instance].B, "#00FF00");
            
            // Final displayed link in FourBar
            if(system.connected){
                system.connect(c = b.add(system.P[instance].B), offset.add(new Vector(system.link[1], 0)), "#0000FF");
            } else {

            }

            system.step(1e-2, instance);
            window.setTimeout(function(){system.animate(instance,delta)}, 10);
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
    }

    var load = function(path){
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = path;
        document.body.appendChild(js);
    }


    this.FourBar = function(a,b,c,d){
        var system = this;

        this.link = [0,d,a,b,c];
        this.connected = true;

        this.Position = function(o2){
            // Clear exisiting setup
            system.V = null;
            system.A = null;

            var k = [
                0,
                d/a, 
                d/c, 
                (a*a - b*b + c*c + d*d)/(2*a*c),
                d/b,
                (c*c - d*d - a*a - b*b)/(2*a*b)
            ];

            var A = cos(o2) - k[1] - k[2] * cos(o2) + k[3];
            var B = -2*sin(o2);
            var C = k[1] - (k[2] + 1) * cos(o2) + k[3];
            var D = cos(o2) - k[1] + k[4] * cos(o2) + k[5];
            var E = -2*sin(o2)
            var F = k[1] + (k[4] - 1) * cos(o2) + k[5];

            var crunch = function(self, instance, sign){
                var o;
                self[instance]   = {}
                self[instance].o = o = [0, 0, 
                    o2, 
                    2*atan((-E + sign*sqrt(E*E - 4*D*F))/(2*D)),
                    2*atan((-B + sign*sqrt(B*B - 4*A*C))/(2*A))
                ];

                self[instance].A = new Vector(a, o[2]);
                self[instance].B = new Vector(b, o[3]);
            }

            crunch(this, CRSS, 1);
            crunch(this, OPEN, -1);
            system.P = this;
        }

        this.Velocity = function(o2,w2){

            var crunch = function(self, instance){
                var w,
                    o = self.P[instance].o;

                self[instance] = {};
                self[instance].w = w = [0,0,
                    w2,
                    a*w2/b * sin(o[4] - o[2])/sin(o[3] - o[4]),
                    a*w2/c * sin(o[2] - o[3])/sin(o[4] - o[3])
                ];

                self[instance].A = new Vector(a,w[2]);
                self[instance].B = new Vector(c,w[4]);
            }

            this.P = new system.Position(o2);
            crunch(this, CRSS);
            crunch(this, OPEN);
            system.V = this;
        }

        this.Acceleration = function(o2,w2,a2){

            var crunch = function(self, instance){
                self[instance] = {}
                var o = self.P[instance].o,
                    w = self.V[instance].w;

                var A = c * sin(o[4]);
                var B = b * sin(o[3]);
                var C = a * a2 * sin(o[2]) 
                        + a * sr(w[2]) * cos(o[2]) 
                        + b * sr(w[3]) * cos(o[3]) 
                        - c * sr(w[4]) * cos(o[4]);
                var D = c * cos(o[4]);
                var E = b * cos(o[3]);
                var F = a * a2 * cos(o[2]) 
                        - a * sr(w[2]) * sin(o[2]) 
                        - b * sr(w[3]) * sin(o[3]) 
                        + c * sr(w[4]) * sin(o[4]);

                self[instance].a = [0,0,
                    a2,
                    (C*D-A*F)/(A*E-B*D),
                    (C*E-B*F)/(A*E-B*D)     
                ];
            }

            this.V = new system.Velocity(o2,w2);
            this.P = this.V.P;

            crunch(this, OPEN);
            crunch(this, CRSS);
            system.A = this;
        }
    }
    this.FourBar.prototype = System.prototype;

    this.CrankSlide = function(a,b,c){
        var system = this;
        this.Position = function(o2){

            // Clear Existing setup
            system.V = null;
            system.A = null;

            var crunch = function(self, instance, offset, sign){
                var o;
                self[instance] = {};
                self[instance].o= o = [0,0,
                    o2,
                    asin(sign * (a*sin(o2)-c)/b) + offset
                ]
                self[instance].A = new Vector(a, o[2]);
                self[instance].B = new Vector(b, o[3] + pi);
            }

            crunch(this, CRSS,  0, 1);
            crunch(this, OPEN, pi, -1);
            system.P = this;
        }

        this.Velocity = function(o2,w2){

            var crunch = function(self, instance){
                var w,
                    o = self.P[instance].o;

                self[instance] = {};
                self[instance].w = w = [0,0,
                    w2,
                    w2 * a/b * cos(o[2])/cos(o[3])
                ];

                self[instance].A = new Vector(a,w[2]);
            }

            this.P = new system.Position(o2);
            crunch(this, CRSS);
            crunch(this, OPEN);
            system.V = this;
        }

        this.Acceleration = function(o2,w2,a2){

            var crunch = function(self, instance){
                self[instance] = {}
                var o = self.P[instance].o,
                    w = self.V[instance].w;

                self[instance].a = [0,0,
                    a2,
                    (a*a2*cos(o[2]) - a*sr(w[2])*sin(o[2]) + b*sr(w[3])*sin(o[3])) / (b*cos(o[3]))
                ];
            }

            this.V = new system.Velocity(o2,w2);
            this.P = this.V.P;

            crunch(this, CRSS);
            crunch(this, OPEN);
            system.A = this;
        }
    }
    this.CrankSlide.prototype = System.prototype;
}