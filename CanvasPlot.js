"use strict";

class Vec2 {
    constructor(x,y) {
        this.x = x ? x : 0; 
        this.y = y ? y : 0;
    }

    static Zero() {
        return new Vec2();
    }

    // return a copy of the vector
    clone() {
        return new Vec2(this.x, this.y);
    }

    // somma con un altro vettore e restituisce
    sum(v) {
        if (v.constructor.name === 'Vec2') {
            return new Vec2(this.x+v.x, this.y+v.y);
        } else if (v.constructor.name === 'Number') {
            return new Vec2(this.x + v, this.y + v);
        } else {
            new Error(`Type error: Vec2 or Number required, ${v.constructor.name} found`);
        }
    }
    
    // multiply by a scalar and return
    mul(s) {
        if (s.constructor.name === 'Number') {
            return new Vec2(this.x * s, this.y * s);
        } else {
            new Error(`Type error: Number required, ${s.constructor.name} found`)
        }
    }

    // scale the vector corrdinates and return it
    scale(s) {
        if (s.constructor.name === 'Number') {
            this.x *= s;
            this.y *= s;
        } else {
            new Error(`Type error: Number required, ${s.constructor.name} found`)
        }
        return this;
    }

    /**
     * inspired by the zip function in python
     * Given two arrays of Number builds an
     * array of Vec2
     * 
     * @param {list<Number>} X
     * @param {list<Number>} Y
     */
    static Zip(X, Y) {
        let ans = [];
        if (X.length != Y.length) {
            throw new Error("Argument error: length inconsistency");
        }
        for (let i = 0, N = X.length; i != N; ++i) {
            ans.push(new Vec2(X[i], Y[i]));
        }
        return ans;
    }
}

class Mat2x2 {
    constructor(a11, a12, a21, a22) {
        this.a11 = a11?a11:0; this.a12 = a12?a12:0;
        this.a21 = a21?a21:0; this.a22 = a22?a22:0;
    }

    // return a copy of the matrix
    copy() {
        return new Mat2x2(
            this.a11, this.a12, this.a21, this.a22
        );
    }

    get determinant() {
        return this.a11*this.a22 - this.a12*this.a21;
    }

    get trasposed() {
        new Mat2x2(this.a11, this.a21, this.a12, this.a22);
    }

    get inverse() {
        let det = this.determinant
        if (det == 0) {
            throw new Error("Determinant is 0");
        }
        return new Mat2x2(this.a11, -this.a21, -this.a12, this.a22).scale(1/det);
    }

    static Identity() {
        return new Mat2x2(1, 0, 0, 1);
    }
    
    static Zero() {
        return new Mat2x2(0, 0, 0, 0);
    }

    // rotational matrix
    static Rotational(angle) {
        return new Mat2x2(
            Math.cos(angle),-Math.sin(angle),
            Math.sin(angle), Math.cos(angle)
        );
    }

    // multiply components by a scalar 
    scale(n) {
        this.a11 *= n; this.a12 *= n;
        this.a21 *= n; this.a22 *= n;
        return this;
    }

    // execute calculus
    apply(v) {
        if (v.constructor.name === 'Vec2') {
            return new Vec2(
                this.a11*v.x + this.a12*v.y,
                this.a21*v.x + this.a22*v.y
            );
        } else if (v.constructor.name === 'Mat2x2') {
            return new Mat2x2(
                this.a11*v.a11 + this.a12*v.a21,
                this.a11*v.a12 + this.a12*v.a22,
                this.a21*v.a11 + this.a22*v.a21,
                this.a21*v.a12 + this.a22*v.a22
            );
        } else if (v.constructor.name === 'Number') {
            return new Mat2x2(
                v * this.a11,
                v * this.a12,
                v * this.a21,
                v * this.a22
            );
        } else {
            new Error(`Type error: Vec2 or Mat2x2 required, ${v.constructor.name} found`);
        }
    }

    // sum two matrix
    sum(mat) {
        let ans;
        if (mat.constructor.name === 'Mat2x2') {
            ans = new Mat2x2(
                this.a11 + mat.a11,
                this.a12 + mat.a12,
                this.a21 + mat.a21,
                this.a22 + mat.a22
            );
        } else {
            new Error(`Type error: Mat2x2 required, ${v.constructor.name} found`)
        }
        return ans;
    }
}

/**
 * AffineTransformation
 * combination of translations and rotations
 * Each Affinity can be represented in the form
 * L(v) = Av + v0
 */
class Affinity {
    // get a sequence of Vec2, Mat2x2 and numbers
    // (considered as n*Identity) and transform them
    // in a pair (A,b)
    constructor() {
        let A = Mat2x2.Identity();
        let b = Vec2.Zero();
        for (let el of arguments) {
            if (el.constructor.name === 'Vec2') {
                b = b.sum(el);
            } else if (el.constructor.name === 'Mat2x2') {
                b = el.apply(b);
                A = el.apply(A);
            } else if (el.constructor.name === 'Number') {
                b = Mat2x2.Identity().scale(el).apply(b);
                A = A.apply(el);
            } else {
                new Error(`Type error: Vec2, Mat2x2 or Number required, ${el.constructor.name} found`)
            }
        }
        
        this.A = A; this.b = b;
    }
    
    // apply the Affinity to a vector
    apply(v) {
        let ans;
        if (v.constructor.name === 'Vec2') {
            ans = this.b.sum(this.A.apply(v));
        } else {
            new Error(`Type error: Vec2 required, ${v.constructor.name} found`)
        }
        return ans;
    }
}

/**
 * Represents a rectangle in a 2D plane.
 * It rapresents a rectangle in a plot.
 * 
 */
class Frame {
    /**
     * 
     * @param {Vec2} center
     * @param {Number} w 
     * @param {Number} h 
     * @param {Number} angle 
     * 
     * NOTE: h and w are positive when greater
     * values are, respectively, on top and on
     * right. HTML5 Canvas has NEGATIVE height!
     */
    constructor(center, w, h, angle) {
        if (arguments.length < 3) {
            throw new Error("Migging arguments");
        } else if (center.constructor.name != 'Vec2') {
            new Error(`Type error: Vec2 required, ${center.constructor.name} found`);
        } else if (angle !== 0) {
            throw new Error(`angles pther than 0 are not supported!`);
        }
        this._center = center;
        this._width = w;
        this._height = h;
        this._angle = angle?angle:0;
    }

    /**
     * Return the affinity used to change the coordinates
     * of point in this frame in the frame passed.
     * 
     * WARNING: rotations are not supported!
     *  
     * @param {Frame} f 
     */
    transform(f) {
        if (f.constructor.name === 'Frame') {
            return new Affinity(
                // cancel the "local" affinity
                this._center.mul(-1),
                // rotazione - TODO
                // compressione
                new Mat2x2(
                    1/this._width, 0,
                    0, 1/this._height
                ),
                // dilatazione
                new Mat2x2(
                    f._width, 0,
                    0, f._height
                ),
                // rotazione
                // add the f's affinity
                f._center
            );
        } else {
            new Error(`Type error: Frame required, ${f.constructor.name} found`);
        }
    }
}


/**
 * Simple js class used to plot graphics in canvas
 */
class CanvasPlot {
    constructor(canvas) {
        this._canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this._frame = new Frame(
            new Vec2(), 2, 2, 0
        );

        this.ctx.lineWidth = 1.0;
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
        this.ctx.lineJoin = "round";
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
        this.ctx.lineCap = "round";
    }
    
    get canvas() {
        return this._canvas;
    }

    // return the CanvasRenderingContext2D associated
    // with the canvas
    get context() {
        return this.ctx;
    }

    // get the Frame representing the canvas screen
    get canvasFrame() {
        return new Frame(
            new Vec2(this.ctx.canvas.width, this.ctx.canvas.height).scale(1/2),
            this.ctx.canvas.width, -this.ctx.canvas.height, 0
        );
    }
        
    // get and set the frame representing the
    get frame() {
        return this._frame;
    }

    set frame(f) {
        this._frame = f;
    }

    // clear the canvas
    clear() {
        let context = this.ctx;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    // get a sequence of Vec2 points relatives to this.frame
    // coordinate sistem and translate them in the
    // and return a sequence of points
    scale() {
        let seq;
        if (arguments.length > 1) {
            seq = arguments;
        } else if (arguments.length === 1) {
            if (arguments[0].constructor.name === 'Array') {
                seq = arguments[0];
            } else if (arguments[0].constructor.name === 'Vec2') {
                seq = [arguments[0]];
            } else {
                throw new Error(`Type error: Number required, ${s.constructor.name} found`)
            }
        } else {
            return;
        }

        let trans = this.frame.transform(this.canvasFrame);
        let ans = seq.map(v => trans.apply(v));
        return ans;
    }
        
    // plot a sequence of Vec2
    plot() {
        let seq;
        if (arguments.length > 1) {
            seq = arguments;
        } else if (arguments.length === 1) {
            if (arguments[0].constructor.name === 'Array') {
                seq = arguments[0];
            } else if (arguments[0].constructor.name === 'Vec2') {
                seq = [arguments[0]];
            } else {
                throw new Error(`Type error: Number required, ${s.constructor.name} found`)
            }
        } else {
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(seq[0].x, seq[0].y);
        for (let p of seq) {
            this.ctx.lineTo(p.x, p.y);
        }
        this.ctx.stroke();
    }

    // do exactly what the name suggests
    scaleAndPlot() {
        let p = this.scale(...arguments);
        this.plot(p);
    }
}

