var Kinematics = function(context){
    var sin   = Math.sin;
    var cos   = Math.cos;
    var tan   = Math.tan;
    var atan  = Math.atan;
    var atan2 = Math.atan2;
    var asin  = Math.asin;
    var sqrt  = Math.sqrt;
    var pi    = Math.PI;
    var hyp   = Math.hypot || function(a,b){return sqrt(a*a+b*b);};
    var sr    = function(x){return x*x;};

    var OPEN = "open";
    var CRSS = "crossed";


    // helpers
    var k = this;
    k.rad = function(deg){
        return 2*pi*(deg/360);
    };
    k.attach = function(module){
        module.prototype = System.prototype;
        this[name] = module;
    };

// Etc..
