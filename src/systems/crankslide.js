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
            ];
            self[instance].A = new Vector(a, o[2]);
            self[instance].B = new Vector(b, o[3] + pi);
        };

        crunch(this, CRSS,  0, 1);
        crunch(this, OPEN, pi, -1);
        system.P = this;
    };

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
        };

        this.P = new system.Position(o2);
        crunch(this, CRSS);
        crunch(this, OPEN);
        system.V = this;
    };

    this.Acceleration = function(o2,w2,a2){

        var crunch = function(self, instance){
            self[instance] = {};
            var o = self.P[instance].o,
                w = self.V[instance].w;

            self[instance].a = [0,0,
                a2,
                (a*a2*cos(o[2]) - a*sr(w[2])*sin(o[2]) + b*sr(w[3])*sin(o[3])) / (b*cos(o[3]))
            ];
        };

        this.V = new system.Velocity(o2,w2);
        this.P = this.V.P;

        crunch(this, CRSS);
        crunch(this, OPEN);
        system.A = this;
    };
};