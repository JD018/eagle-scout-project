var picker, lastValue;

function insideRect(x, y, w, h) { return mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h; }

function ColorPicker(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s;
    
    this.hue = 0;
    this.saturation = 100;
    this.brightness = 100;
    
    this.mouseMode = 0;
    
    this.display = function(quality) {
        colorMode(HSB, 360, 100, 100);
        push();
            translate(this.x, this.y);
            
            noStroke();
            var s = this.s/quality;
            var s2 = 100/quality;
            for (var i = 0; i < quality; i++) {
                for (var j = 0; j < quality; j++) {
                    fill(this.hue, i*s2, 100-j*s2);
                    // stroke(0, i, 100-j);
                    rect(s*i, s*j, s, s);
                }
            }
            
            var s3 = 360/quality;
            for (var i = 0; i < quality; i++) {
                fill(360-i*s3, 100, 100);
                rect(this.s+this.s/16, i*s, this.s/10, s);
            }
            
        colorMode(RGB, 255);
        
            noFill();
            stroke(50);
            strokeWeight(2);
            rect(0, 0, this.s, this.s, 1); 
            rect(this.s+this.s/16, 0, this.s/10, this.s, 1); 
            
            stroke(255);
            ellipse(this.saturation*this.s/100, (100-this.brightness)*this.s/100, 10, 10);
            
            fill(50);
            stroke(100);
            strokeWeight(1.4);
            translate(this.s, (360-this.hue)*this.s/360);
            triangle(this.s/16, 0, this.s/32, (this.s/32), this.s/32, -this.s/32);
            translate(this.s/10+this.s/16+this.s/64, 0);
            triangle(0, 0, this.s/32, (this.s/32), this.s/32, -this.s/32);
            
        pop();
        
        if (mouseIsPressed && this.mouseMode === 0) {
            if (insideRect(this.x, this.y, this.s, this.s)) {
                this.mouseMode = 1;
            } else if (insideRect(this.x+this.s+this.s/16, this.y, this.s/10, this.s)) {
                this.mouseMode = 2;
            }
        } else if (!mouseIsPressed) {
            this.mouseMode = 0;
        }
        
        if (this.mouseMode === 1) {
            var s4 = 100/this.s;
            this.saturation = (mouseX - this.x)*s4;
            this.brightness = 100-(mouseY - this.y)*s4;
            this.saturation = constrain(this.saturation, 0, 100);
            this.brightness = constrain(this.brightness, 0, 100);
        } else if (this.mouseMode === 2) {
            this.hue = 360-(mouseY-this.y)*360/this.s;
            this.hue = constrain(this.hue, 0, 360);
        }
    };
    
    this.getHSB = function() {
        return [this.hue, this.saturation, this.brightness];
    };
    
    this.setHSB = function(h, s, b) {
        this.hue = constrain(h, 0, 360);
        this.saturation = constrain(s, 0, 100);
        this.brightness = constrain(b, 0, 100);
    };
    
    this.getRGB = function() {
        var r, g, b, i, f, p, q, t;
        var h = this.hue/360;
        var s = this.saturation/100;
        var v = this.brightness/100;
        
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    };
    
    this.setRGB = function(r, g, b) {
        r = constrain(r, 0, 255);
        g = constrain(g, 0, 255);
        b = constrain(b, 0, 255);
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;
    
        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }
    
        this.hue = constrain(360*h, 0, 360);
        this.saturation = constrain(100*s, 0, 100);
        this.brightness = constrain(100*v, 0, 100);
    };
    
    this.setHex = function(hex) {
        this.setRGB(parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4), 16));
    };
    
    this.getHex = function() {
        var clr = this.getRGB();
        return clr[0].toString(16).padStart(2, '0') + clr[1].toString(16).padStart(2, '0')  + clr[2].toString(16).padStart(2, '0');
    };
    
    this.getCMYK = function() {
        var r, g, b;
        var clr = this.getRGB();
        r = clr[0]; g = clr[1]; b = clr[2];
        
        var c = 1 - (r / 255);
        var m = 1 - (g / 255);
        var y = 1 - (b / 255);
        var k = Math.min(c, Math.min(m, y));
        
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
        
        c = Math.round(c * 10000) / 100;
        m = Math.round(m * 10000) / 100;
        y = Math.round(y * 10000) / 100;
        k = Math.round(k * 10000) / 100;
        
        
        c = isNaN(c) ? 0 : c;
        m = isNaN(m) ? 0 : m;
        y = isNaN(y) ? 0 : y;
        k = isNaN(k) ? 0 : k;
        
        return [c,m,y,k];
    };
    
    this.setCMYK = function(c, m, y, k){
        c = (c / 100);
        m = (m / 100);
        y = (y / 100);
        k = (k / 100);
        
        c = c * (1 - k) + k;
        m = m * (1 - k) + k;
        y = y * (1 - k) + k;
        
        var r = 1 - c;
        var g = 1 - m;
        var b = 1 - y;
        
        r = Math.round(255 * r);
        g = Math.round(255 * g);
        b = Math.round(255 * b);
        
        this.setRGB(r, g, b);
    };
    
    this.getColor = function() {
        var clr = this.getRGB();
        return color(clr[0], clr[1], clr[2]);
    };
}

var justChanged = false;

function updateColors() {
    const rgb = [document.getElementById("rgbR").value, document.getElementById("rgbG").value, document.getElementById("rgbB").value];

    if (rgb[0] == "" || rgb[1] == "" || rgb[2] == "") {
        return;
    }

    const int_rgb = [parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10)];
    picker.setRGB(int_rgb[0], int_rgb[1], int_rgb[2]);
    document.getElementById("swatch").style.backgroundColor = `rgb(${int_rgb[0]}, ${int_rgb[1]}, ${int_rgb[2]})`;
    justChanged = true;

}

function setup() { 
    const canvas = createCanvas(200, 200);
    canvas.parent("color-picker");

    picker = new ColorPicker(12.5, 30, 150);
    lastValue = picker.getRGB();

    document.getElementById("rgbR").addEventListener('input', updateColors);
    document.getElementById("rgbG").addEventListener('input', updateColors);
    document.getElementById("rgbB").addEventListener('input', updateColors);
}


draw = function() {
    colorMode(RGB, 0, 255);
    const rgb = [document.getElementById("rgbR"), document.getElementById("rgbG"), document.getElementById("rgbB")];

    const currentValue = picker.getRGB();

    if (!justChanged && (currentValue[0] != lastValue[0] || currentValue[1] != lastValue[1] || currentValue[2] != lastValue[2])) {
        rgb[0].value = lastValue[0];
        rgb[1].value = lastValue[1];
        rgb[2].value = lastValue[2];

        document.getElementById("swatch").style.backgroundColor = `rgb(${lastValue[0]}, ${lastValue[1]}, ${lastValue[2]})`;
    } 

    justChanged = false;
    lastValue = currentValue;
    background(240);

    colorMode(HSB, 0, 100);
    picker.display(100);
};



