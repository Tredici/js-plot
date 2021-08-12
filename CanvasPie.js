/**
 * Classes and function to plot pie charts
 */

// JS names of colors
const COLORS = [
    "black",
    "silver",
    "gray",
    "white",
    "maroon",
    "red",
    "purple",
    "fuchsia",
    "green",
    "lime",
    "olive",
    "yellow",
    "navy",
    "blue",
    "teal",
    "aqua",
];

function randomColor() {
    return '#' + Math.floor(Math.random()*Math.pow(2,24)).toString(16);
}

class PieSlice {
    constructor(name, weight, color) {
        if (weight <= 0) {
            throw new Error("Value error: weight must be positive");
        }
        this._name = name;
        this._weight = weight;
        this._color = color === undefined ? randomColor() : color;
    }

    get weight() {
        return this._weight;
    }

    get color() {
        return this._color;
    }

    clone() {
        return new PieSlice(this._name, this._weight, this._color);
    }
}

class CanvasPie {
    constructor(canvas) {
        this._canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // pie chart radius
        this._radius = 0.9*Math.min(canvas.width,canvas.height)/2;
    }

    get canvas() {
        return this._canvas;
    }

    // return the CanvasRenderingContext2D associated
    // with the canvas
    get context() {
        return this.ctx;
    }

    // clear the canvas
    clear() {
        let context = this.ctx;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    get radius() {
        return this._radius;
    }
    
    // get the center of the canvas
    get center() {
        return {
            x: this.ctx.canvas.width  / 2,
            y: this.ctx.canvas.height / 2
        };
    }

    // check arguments and move in a 
    checkArguments() {
        let seq;
        if (arguments.length > 1) {
            seq = Array.from(arguments);
        } else if (arguments.length === 1) {
            if (Array.isArray(arguments[0].constructor.name)) {
                seq = arguments[0];
            } else if (arguments[0].constructor.name === 'PieSlice') {
                seq = [arguments[0]];
            } else {
                throw new Error(`Type error: PieSlice required, ${s.constructor.name} found`)
            }
        } else {
            return [];
        }

        let total = seq.reduce((tot, item) => item.weight + tot, 0);
        let ans = seq.map(item => {
            let copy = item.clone();
            copy.percentage = copy.weight / total;
            return copy;
        })

        return ans;
    }

    // plot all chart
    plot() {
        const data = this.checkArguments(...arguments);
        const ctx = this.context;
        const PI2 = 2 * Math.PI;
        const backup_fillstyle = ctx.fillStyle;
        const c = this.center;
        const r = this.radius;

        let startAngle = 0;
        let endAngle;

        // for each slice of the pie
        for (let slice of data) {
            endAngle = startAngle + slice.percentage * PI2;

            ctx.fillStyle = slice.color;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.arc(c.x, c.y, r, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            startAngle = endAngle;
        }

        ctx.fillStyle = backup_fillstyle;
    }

}


