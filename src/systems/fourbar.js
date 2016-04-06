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
        var E = -2*sin(o2);
        var F = k[1] + (k[4] - 1) * cos(o2) + k[5];

        var crunch = function(self, instance, sign){
            var o;
            self[instance]   = {};
            self[instance].o = o = [0, 0, 
                o2, 
                2*atan((-E + sign*sqrt(E*E - 4*D*F))/(2*D)),
                2*atan((-B + sign*sqrt(B*B - 4*A*C))/(2*A))
            ];

            self[instance].A = new Vector(a, o[2]);
            self[instance].B = new Vector(b, o[3]);
        };

        crunch(this, CRSS, 1);
        crunch(this, OPEN, -1);
        system.P = this;
    };

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

            var A = c * sin(o[4]);
            var B = b * sin(o[3]);
            var C = a * a2 * sin(o[2])       +
                    a * sr(w[2]) * cos(o[2]) +
                    b * sr(w[3]) * cos(o[3]) -
                    c * sr(w[4]) * cos(o[4]);
            var D = c * cos(o[4]);
            var E = b * cos(o[3]);
            var F = a * a2 * cos(o[2])       -
                    a * sr(w[2]) * sin(o[2]) -
                    b * sr(w[3]) * sin(o[3]) +
                    c * sr(w[4]) * sin(o[4]);

            self[instance].a = [0,0,
                a2,
                (C*D-A*F)/(A*E-B*D),
                (C*E-B*F)/(A*E-B*D)     
            ];
        };

        this.V = new system.Velocity(o2,w2);
        this.P = this.V.P;

        crunch(this, OPEN);
        crunch(this, CRSS);
        system.A = this;
    };
};
