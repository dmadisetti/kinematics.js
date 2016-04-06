var Vector = function(m, o){
    this.m = m;
    this.o = o;
    this.x = m * cos(o);
    this.y = m * sin(o);
    var V = this;
};
Vector.prototype.add = function(v,at){
    var x,y,aT = at || function(a,b){return atan(a/b);};
    return new Vector(hyp(x = this.x + v.x, y = this.y + v.y), aT(y,x));
};
Vector.prototype.sub = function(v,at){
    var x,y,atan = at || function(a,b){return atan(a/b);};
    return new Vector(hyp(x = this.x - v.x, y = this.y - v.y), aT(y,x));
};

this.Vector = Vector;