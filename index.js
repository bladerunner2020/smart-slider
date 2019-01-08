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

    this.labelFactor = 1;

    /**
     * Set value label item that is moved together with slider
     * @param {object} item - value label item 
     */
    this.setValueItem = function(item) {
        this.valueLabel = item;
        this.valueLabelOffsetX = this.valueLabel.X - this.slider.Width - this.slider.X;
        return this;
    };

    /**
     * Set min and max limits for value label positions
     * @param {number} min - minimal X to move value label, if undefined - no limit
     * @param {number} max - maximal X to move value label, if undefined - no limit
     */
    this.setLabelLimits = function(min, max) {
        this.minX = min;
        this.maxX = max;
        return this;
    };

    /**
     * Set gradient colors. The slider changes the color accordingly to the gradient.
     * @param {array} gradient - gradient array of colors created with createColorGradient
     */
    this.setGradientColors = function(gradient) {
        var state = this.slider.GetState(1);
        this.alphaChannel = state.Color & 0xFF;
        this.gradient = gradient;
        return this;
    };

    /**
     * @param {number} time - time in ms that is required for animation the entire slider to 100%
     *                        factual time depends on the slider value - if slider value is min then 
     *                        there is no animation at all
     * @param {number} type - type of formula calculation (see IR.Tween), IR.TWEEN_LINEAR - default
     */
    this.setAnimation = function(time, type) {
        if (type == undefined) {
            type = IR.TWEEN_LINEAR;
        }
        this.animationTime = time;
        this.animationType = type;
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
            this.slider.Value = value;
            this.update();
        }
        return this;
    };

    /**
     * @returns {number} - slider value
     */
    this.getValue = function() {
        return this.slider.Value;
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
     * Update value item, value item position and slider color
     */
    this.update = function() {
        var x = this.slider.X;

        var width = this.slider.Width;
        var value = this.slider.Value;
        var maxValue = this.slider.Max;  
        var minValue = this.slider.Min;   

        var newX = x + Math.floor(width/maxValue * value);
        newX += that.valueLabelOffsetX;

        if (this.minX) {
            newX = (newX > this.minX) ? newX : this.minX;
        }

        if (this.maxX) {
            newX = (newX < this.maxX) ? newX : this.maxX;
        }
         
        if (that.valueLabel) {
            this.valueLabel.Value = value;
            this.valueLabel.X = newX;
        }

        if (this.gradient) {
            var index = Math.floor(value - minValue);
            index = index < 0 ? 0 : index >= this.gradient.length ? this.gradient.length - 1 : index;
            var colorArr = this.gradient[index];
            var color = colorArr[0] * Math.pow(256, 3) + colorArr[1] * Math.pow(256, 2) + colorArr[2] * Math.pow(256, 1) + this.alphaChannel; 
            var state = this.slider.GetState(1);
            state.Color = color;
        }

        return this;
    };

    /**
     * Update with animation from startValue to newValue value. UpdateX without arguments animates slide bar
     * from Min to the current value
     * @param {number} [newValue] - if newValue is not set then animate to the current value
     * @param {number} [startValue] - if startValue is not set min value is used
     */
    this.updateX = function(newValue, startValue) {
        if (newValue == undefined) { newValue = this.slider.Value; }
        if (startValue == undefined) { startValue = this.slider.Min; }
        if (this.animationTime == undefined) { 
            this.setValue(newValue);
            return; 
        }

        var animationData = {};
        animationData.startValue = startValue;
        animationData.endValue = newValue;
        animationData.duration = this.animationTime;

        this.startAnimation(animationData);
    };

    /**
     * @param {number} elapsed - period of time in ms passed from the previous tick
     * @this {animationData, slider}
     */
    this.onTick = function(elapsed) {
        var slider = this.slider;
        var animationData = this.animationData;
        animationData.current += elapsed;
        var duration = animationData.duration;
        var value = 0;

        if (animationData.endValue > animationData.startValue) {
            value = IR.Tween(slider.animationType, animationData.current, 0, animationData.endValue - animationData.startValue, duration);       
            value += animationData.startValue;
        } else {
            value = IR.Tween(slider.animationType, animationData.current, 0, animationData.startValue - animationData.endValue, duration); 
            value = animationData.startValue - value;
        }

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
    this.startAnimation = function(animationData) {
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
    IR.AddListener(IR.EVENT_ITEM_PRESS, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_TOUCH_DOWN, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_TOUCH_MOVE, this.slider, this.update, this);
    IR.AddListener(IR.EVENT_ITEM_SHOW, this.slider, function() { this.updateX(); }, this);
}


/**
 * Create color gradient between two colors with specified number of steps
 * 
 * @param {number | array} color1
 * @param {number | array} color2 
 * @param {number} steps 
 */
function createColorGradient(color1, color2, steps) {           // eslint-disable-line 
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

    function colorToColorArray(color) {
        var result = [];
        result[0] = (color >> 16) & 0xFF;
        result[1] = (color >> 8) & 0xFF;
        result[2] = color & 0xFF;

        return result;
    }

    if (steps <= 1) {
        return [];
    }

    var factor = 1 / (steps - 1); 
    var gradient = [];

    var colorArr1 = (typeof color1 != 'number') ? colorArr1 : colorToColorArray(color1);
    var colorArr2 = (typeof color2 != 'number') ? colorArr1 : colorToColorArray(color2);


    for(var i = 0; i < steps; i++) {
        gradient.push(interpolateColor(colorArr1, colorArr2, factor * i));
    }

    return gradient;
}
