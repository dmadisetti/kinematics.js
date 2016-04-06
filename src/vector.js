    var Vector = function(m, o){
        this.m = m;
        this.o = o;
        this.x = m * cos(o);
        this.y = m * sin(o);
        var V = this;
        this.add = function(v){
            var x,y;
            return new Vector(hyp(x = V.x + v.x, y = V.y + v.y), atan(y/x));
        };
    };