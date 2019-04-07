/*
 * smart-slider
 *
 * Copyright (c) 2019 Alexander Pivovarov aka bladerunner2020, contributors
 * Licensed under the MIT license.
 */

/* global IR */

/**
 * 
 * @param {object} item - slider item
 */
function SmartSlider(item) {        // eslint-disable-line no-unused-vars
    var that = this;
    this.slider = item;
    this.sliderType = this.slider ? this.slider.Type : 0;
    this.direction = (this.sliderType == IR.ITEM_LEVEL) ? this.slider.Direction : 0;

    this.disableUpdateOnWatch = false;

    /**
     * Set value label item that is moved together with slider
     * @param {object} item - value label item 
     * @param {boolean} [freeze] - freeze movement of value item
     */
    this.setValueItem = function(item, freeze) {
        this.valueLabel = item;

        if (this.valueLabel && this.slider) {
            switch (this.sliderType) {
            case IR.ITEM_LEVEL:
                this.valueLabelOffset = this.direction ? 
                    (this.valueLabel.X - this.slider.Width - this.slider.X) : 
                    this.slider.Height - this.valueLabel.Height - (this.slider.Y - this.valueLabel.Y - this.valueLabel.Height);
                break;
            case IR.ITEM_CIRCLE_LEVEL:
                this.valueLabelRadius = 
                        Math.sqrt(Math.pow(this.slider.X + this.slider.Width/2 - item.X - item.Width/2, 2) + 
                        Math.pow(this.slider.Y + this.slider.Height/2 - item.Y - item.Height/2, 2));
                this.valueLabelOffset =  Math.asin((item.X + item.Width/2 - this.slider.X - this.slider.Width/2)/ this.valueLabelRadius);  
                    
                this.valueLabelOffset -= this.slider.MaxAngle*Math.PI/180;
                break;
                    
            default:        
            }
        }
        this.freezedValueItem = freeze;
        return this;
    };

    /**
     * Freeze movement of value item
     * @param {boolean} freeze
     */
    this.freezeValueItem = function(freeze) {
        this.freezedValueItem = freeze;
        return this;
    };

    /**
     * Set min and max limits for value label positions
     * @param {number} min - minimal X to move value label, if undefined - no limit
     * @param {number} max - maximal X to move value label, if undefined - no limit
     */
    this.setValueItemLimits = function(min, max) {
        this.min = min;
        this.max = max;

        if (this.sliderType == IR.ITEM_CIRCLE_LEVEL) {
            if (this.min != undefined) {
                this.min = (this.min - 360) * Math.PI/180;
            }
            if (this.max != undefined) {
                this.max = (this.max - 360) * Math.PI/180;
            }
        }

        return this;
    };

    /**
     * Set gradient colors. The slider changes the color accordingly to the gradient.
     * @param {array} gradient - gradient array of colors created with createColorGradient
     */
    this.setGradientColors = function(gradient) {
        if (this.slider) {
            var state = this.slider.GetState(1);
            this.alphaChannel = ((this.sliderType == IR.ITEM_CIRCLE_LEVEL) ? state.BorderColor : state.Color) & 0xFF;
        }
        this.gradient = gradient;
        return this;
    };

    /**
     * @param {number} time - time in ms that is required for animation the entire slider to 100%
     *                        factual time depends on the slider value - if slider value is min then 
     *                        there is no animation at all
     * @param {number} [type] - type of formula calculation (see IR.Tween), IR.TWEEN_LINEAR - default
     * @param {number} [delay] - delay in ms to start animation
     */
    this.setAnimation = function(time, type, delay) {
        if (type == undefined) {
            type = IR.TWEEN_LINEAR;
        }
        this.animationTime = time;
        this.animationType = type;
        this.animationDelay = delay;
        return this;
    };

    /**
     * Set value of slider and update
     * @param {number} value - slider value
     * @param {boolean} animate - if animate updateX is called to draw the animation
     */
    this.setValue = function(value, animate) {
        if (animate) { 
            this.updateX(value);
        } else {
            if (this.slider) { this.slider.Value = value; }
            this.update();
        }
        return this;
    };

    /**
     * @returns {number} - slider value
     */
    this.getValue = function() {
        return this.slider ? this.slider.Value : undefined;
    };

    /**
     * Set slider auto update
     * @param {number} pollTime - polling time in ms, 0 to turn auto update off
     */
    this.setAutoUpdate = function(pollTime) {
        if (this.autoUpdateTimer) {
            IR.ClearInterval(this.autoUpdateTimer);
            this.autoUpdateTimer = null;
        }

        if (!pollTime) { return; }

        IR.SetInterval(pollTime, function(){
            if (!that.animationTimer) {
                that.update();
            }
        });

        return this;
    };

    /**
     * watch feedback and change slider to the new value with animation
     * @param {string} feedback - feedback to watch
     * @param {number} polltime - pollint time (if not set use setAutoUpdate)
     */
    this.watchFeedback = function(feedback, polltime) {
        if (this.autoUpdateTimer && polltime) {
            IR.ClearInterval(this.autoUpdateTimer);
            this.autoUpdateTimer = null;
        }

        this.watchedFeedback = feedback;

        if (!feedback) {
            return this;
        }

        var arr = feedback.split('.');
        if (arr.length === 3 && arr[0] === 'Drivers') {
            var driver = IR.GetDevice(arr[1]);
            if (driver) {
                IR.AddListener(IR.EVENT_TAG_CHANGE, driver, function(tag, value) {
                    if (tag === arr[2]) {
                        autoUpdate(value);      
                    }
                });
                return this;
            }
            // If driver is not found run standard algorithm with setInterval...
        }

        if (polltime) {
            IR.SetInterval(polltime, autoUpdate);
        }

        return this;
    };

    function autoUpdate(val) {
        if (that.animationActive) {
            // If watchFeedback is used on a driver the new value could come during animation 
            // and without this line it will not be set!
            that.stopAnimation();
        }

        if ((!that.animationActive) && that.slider && !that.disableUpdateOnWatch) {
            var newValue = val;
            if (typeof val === 'undefined' && that.watchedFeedback) {
                newValue = IR.GetVariable(that.watchedFeedback);
            }
            var oldValue = that.slider.Value;

            if (newValue == undefined || oldValue != newValue) {
                that.updateX(newValue, oldValue);
            }
        }
    }

    this.getMinValue = function() {
        return this.slider ? (this.sliderType == IR.ITEM_CIRCLE_LEVEL) ? this.slider.MinValue : this.slider.Min : 0;
    };

    this.getMaxValue = function() {
        return this.slider ? (this.sliderType == IR.ITEM_CIRCLE_LEVEL) ? this.slider.MaxValue : this.slider.Max : 0;
    };

    /**
     * Update value item, value item position and slider color
     */
    this.update = function() {
        function calculateXY(value, direction, slider, label, offset, min, max) {
            var maxValue = slider.Max;
            var minValue = slider.Min;
            var xy = direction ? slider.X : slider.Y;
            var range = direction ? slider.Width : slider.Height;
            var delta = (maxValue <= minValue) ? range : Math.floor(range/(maxValue - minValue) * (value - minValue));
            var newXY = xy + (direction ? delta : -delta);
            newXY += offset;

            if (min) {
                newXY = (newXY > min) ? newXY : min;
            }

            if (max) {
                newXY = (newXY < max) ? newXY : max;
            }
            var coordinate = {};

            if (direction) {
                coordinate.x = newXY;
                coordinate.y = label.Y;
            } else  {
                coordinate.y = newXY;
                coordinate.x = label.X;
            }

            return coordinate;
        }

        function calculateXYCircular(value, slider, label, radius, offset, min, max) {
            var minAngle = slider.MinAngle;
            var maxAngle = slider.MaxAngle;
            var maxValue = slider.MaxValue;
            var minValue = slider.MinValue;
            var angle = maxValue == minValue ? 0 : (value - minValue)/(maxValue - minValue) * (maxAngle - minAngle) + minAngle; 
            angle = angle * Math.PI/180; // degrees to radians

            angle += offset;

            if (min != undefined) {
                angle = angle < min ? min : angle;
            }

            if (max != undefined) {
                angle = angle > max ? max : angle;
            }



            var xCenter = slider.X + slider.Width/2;
            var yCenter = slider.Y + slider.Height/2;

            var coordinate = {};
            coordinate.x = xCenter + radius * Math.sin(angle) - label.Width/2;
            coordinate.y = yCenter - radius * Math.cos(angle) - label.Height/2;

            return coordinate;
        }

        var value = this.slider ? this.slider.Value : null;
        
        if (this.valueLabel) {
            this.valueLabel.Value = value;
            if (this.slider && !this.freezedValueItem) {

                var coordinate;

                if (this.sliderType == IR.ITEM_LEVEL) {
                    coordinate = calculateXY(value, this.direction, this.slider, this.valueLabel, this.valueLabelOffset, this.min, this.max);
                } else {
                    coordinate = calculateXYCircular(value, this.slider, this.valueLabel, this.valueLabelRadius, this.valueLabelOffset, this.min, this.max);
                }
                this.valueLabel.X = coordinate.x;
                this.valueLabel.Y = coordinate.y;
            }
        }

        if (this.gradient && this.gradient.length && this.slider) {
            var index = Math.floor(value - this.getMinValue());
            index = index < 0 ? 0 : index >= this.gradient.length ? this.gradient.length - 1 : index;
            var colorArr = this.gradient[index];
            var color = colorArr[0] * Math.pow(256, 3) + colorArr[1] * Math.pow(256, 2) + colorArr[2] * Math.pow(256, 1) + this.alphaChannel; 
            var state = this.slider.GetState(1);

            if (this.sliderType == IR.ITEM_CIRCLE_LEVEL) {
                state.BorderColor = color;
            } else {
                state.Color = color;
            }
        }

        return this;
    };

    /**
     * Update with animation from startValue to newValue value. UpdateX without arguments animates slide bar
     * from Min to the current value
     * @param {number} [newValue] - if newValue is not set then animate to the current value
     * @param {number} [startValue] - if startValue is not set min value is used
     * @param {boolean} [noDelay] - force animation without update even if animationDelay is set
     */
    this.updateX = function(newValue, startValue, noDelay) {
        if (newValue === undefined && this.slider) { newValue = this.slider.Value; }
        if (startValue === undefined && this.slider) { startValue = this.getMinValue(); }
        if (!this.animationTime) { 
            this.setValue(newValue);
            return; 
        }

        var animationData = {};
        animationData.startValue = startValue;
        animationData.endValue = newValue;
        animationData.duration = this.animationTime;

        this.startAnimation(animationData, noDelay ? null : this.animationDelay);

        return this;
    };

    /**
     * @param {number} elapsed - period of time in ms passed from the previous tick
     * @this {animationData, slider}
     */
    this.onTick = function(elapsed) {
        var slider = this.slider;
        var animationData = this.animationData;
        animationData.current += elapsed;
        var value = IR.Tween(slider.animationType, animationData.current, animationData.startValue, 
            (animationData.endValue - animationData.startValue), animationData.duration);       

        if (animationData.current >= animationData.duration) {
            slider.stopAnimation();
            slider.setValue(animationData.endValue);
        } else {
            slider.setValue(value);
        }
    };

    /**
     * Start animation
     * @param {object} animationData
     */
    this.startAnimation = function(animationData, delay) {
        if (delay) {
            IR.SetTimeout(delay, function() {
                that.startAnimation(animationData);
            });
            return;
        }


        if (this.animationActive) { this.stopAnimation(); }

        animationData.current = 0;
        this.animationActive = true;
        IR.AddListener(IR.EVENT_WORK, 0, this.onTick, {animationData:  animationData, slider: this});
    };

    /**
     * Stop animation
     */
    this.stopAnimation = function() {
        this.animationActive = false;
        IR.RemoveListener(IR.EVENT_WORK, 0, this.onTick);
    };


    IR.AddListener(IR.EVENT_MOUSE_MOVE, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_ITEM_PRESS, this.slider, function() {
        that.disableUpdateOnWatch = true;
        that.update();
    });
    IR.AddListener(IR.EVENT_ITEM_RELEASE, this.slider, function() {
        that.disableUpdateOnWatch = false;
    });

    IR.AddListener(IR.EVENT_TOUCH_DOWN, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_TOUCH_MOVE, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_ITEM_SHOW, this.slider, function() { 
        that.disableUpdateOnWatch = false;
        var value = that.watchedFeedback ? IR.GetVariable(that.watchedFeedback) : that.slider.Value;
        // var value = this.slider.Value;
        that.slider.Value = that.getMinValue();
        that.update(); // is necessary to update the current status of label
        that.updateX(value); 
    });
}

SmartSlider.colorToColorArray = function(color) {
    var result = [];
    result[0] = (color >> 16) & 0xFF;
    result[1] = (color >> 8) & 0xFF;
    result[2] = color & 0xFF;

    return result;
};

/**
 * Create color gradient between two colors with specified number of steps
 * 
 * @param {number | array} color1
 * @param {number | array} color2 
 * @param {number} steps 
 */
function createColorGradient (color1, color2, steps) {           // eslint-disable-line 
    // Returns a single rgb color interpolation between given rgb color
    // based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
    function interpolateColor(color1, color2, factor) {
        if (arguments.length < 3) { 
            factor = 0.5; 
        }
        var result = color1.slice(0);   // In Iridium slice() without arguments work incorrectly
        for (var i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return result;
    }

    if (steps <= 1) {
        return [];
    }

    var factor = 1 / (steps - 1); 
    var gradient = [];

    var colorArr1 = (typeof color1 != 'number') ? colorArr1 : SmartSlider.colorToColorArray(color1);
    var colorArr2 = (typeof color2 != 'number') ? colorArr1 : SmartSlider.colorToColorArray(color2);


    for(var i = 0; i < steps; i++) {
        gradient.push(interpolateColor(colorArr1, colorArr2, factor * i));
    }

    return gradient;
}

/**
 * Create color array that has colorArray[0] for values less than valueArray[0], etc.
 * Dimension of valueArray and colorArray should be the same
 *  
 * @param {array} values valueArray - array of values
 * @param {array} colors colorArray - array of colors
 * @returns {array}
 */
function createColorArray (valueArray, colorArray) { // eslint-disable-line 
    if (!valueArray || !colorArray) { return; }

    var gradient = [];

    var index1 = 0;
    var index2 = 0;

    while (index1 < valueArray.length && index1 < colorArray.length) {
        if (index2 >= valueArray[index1]) {
            index1++;
        } else {
            var color = colorArray[index1];
            gradient.push(SmartSlider.colorToColorArray(color));
            index2++;
        }
    }

    return gradient;
}
