
/*
 * smart-slider-test
 *
 * Copyright (c) 2019 Alexander Pivovarov aka bladerunner2020, contributors
 * Licensed under the MIT license.
 */

/* global IR, SmartSlider, createColorGradient, createColorArray */

_Debug = IR.Log;    // eslint-disable-line no-undef

var slider = new SmartSlider(IR.GetPage('Main').GetItem('Slider'));
slider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel'))
    .setGradientColors(createColorGradient(0xFF00FF, 0x00FFFF, 100))
    .setAnimation(1000, IR.TWEEN_SINE_IN_OUT)
    //.setAutoUpdate(500)
    .watchFeedback('Global.MyValue', 500)
    .update();


var gradient = createColorGradient(0x0000FF, 0x00FFFF, 11);
gradient = gradient.concat(createColorGradient(0x00FFFF, 0x00FF00, 7));
gradient = gradient.concat(createColorGradient(0x00FF00, 0xFFFF00, 7));
gradient = gradient.concat(createColorGradient(0xFFFF00, 0xFF0000, 15));

var tempSlider = new SmartSlider(IR.GetPage('Main').GetItem('Slider2'));
tempSlider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel2'))
    .setAnimation(1000, IR.TWEEN_CIRC_OUT, 1000)
    .setValueItemLimits(260)
    .setGradientColors(gradient)
    .update();



var vSlider = new SmartSlider(IR.GetPage('Main').GetItem('VSlider'));
vSlider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabelH'))
    .setGradientColors(createColorGradient(0xFF00FF, 0x00FFFF, 100))
    .setAnimation(1000, IR.TWEEN_SINE_IN_OUT, 2000)
    .update();


var circularSlider = new SmartSlider(IR.GetPage('Main').GetItem('CircularLevel'));
circularSlider
    .setValueItem(IR.GetPage('Main').GetItem('CValueLabel'))
    .setGradientColors(createColorGradient(0xFF00FF, 0x00FFFF, 100))
    // .setValueItemLimits(45, 315)
    .setAnimation(2000, IR.TWEEN_SINE_IN_OUT, 1500)
    .update();


gradient = createColorArray([50, 70, 75], [0xFFFFFF, 0x00FF00, 0xFF0000]);
var circularSlider2 = new SmartSlider(IR.GetPage('Main').GetItem('CircularLevel2'));
circularSlider2
    .setValueItem(IR.GetPage('Main').GetItem('CValueLabel2'))
    .setGradientColors(gradient)
    .setAnimation(1000, IR.TWEEN_SINE_IN_OUT, 3500)
    .update();



// eslint-disable-next-line no-unused-vars
function animate() {
    slider.updateX();
    tempSlider.updateX();
    vSlider.updateX();
    circularSlider.updateX();
    circularSlider2.updateX();
}

function set0() {   // eslint-disable-line no-unused-vars
    tempSlider.updateX(0, tempSlider.getValue(), true);
}

function set10() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(10, tempSlider.getValue(), true);
}

function set20() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(20, tempSlider.getValue(), true);
}

function set30() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(30, tempSlider.getValue(), true);
}

function set40() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(40, tempSlider.getValue(), true);
}

// IR.SetInterval(10000, function() {
//     tempSlider.freezeValueItem(!tempSlider.freezedValueItem);
//     slider.freezeValueItem(!slider.freezedValueItem);   
// });
