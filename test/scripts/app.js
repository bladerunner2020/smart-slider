
/*
 * smart-slider-test
 *
 * Copyright (c) 2019 Alexander Pivovarov aka bladerunner2020, contributors
 * Licensed under the MIT license.
 */

/* global IR, SmartSlider, createColorGradient */

_Debug = IR.Log;    // eslint-disable-line no-undef

var slider = new SmartSlider(IR.GetPage('Main').GetItem('Slider'));
slider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel'))
    .setGradientColors(createColorGradient(0xFF00FF, 0x00FFFF, 100))
    .setAnimation(1000, IR.TWEEN_SINE_IN_OUT)
    .setAutoUpdate(500)
    .update();


var gradient = createColorGradient(0x0000FF, 0x00FFFF, 11);
gradient = gradient.concat(createColorGradient(0x00FFFF, 0x00FF00, 7));
gradient = gradient.concat(createColorGradient(0x00FF00, 0xFFFF00, 7));
gradient = gradient.concat(createColorGradient(0xFFFF00, 0xFF0000, 15));

var tempSlider = new SmartSlider(IR.GetPage('Main').GetItem('Slider2'));
tempSlider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel2'))
    .setLabelLimits(260)
    .setGradientColors(gradient)
    .setAnimation(1000, IR.TWEEN_CIRC_OUT)
    .update();

// eslint-disable-next-line no-unused-vars
function animate() {
    slider.updateX();
    tempSlider.updateX();
}

function set0() {   // eslint-disable-line no-unused-vars
    tempSlider.updateX(0, tempSlider.getValue());
}

function set10() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(10, tempSlider.getValue());
}

function set20() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(20, tempSlider.getValue());
}

function set30() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(30, tempSlider.getValue());
}

function set40() {  // eslint-disable-line no-unused-vars
    tempSlider.updateX(40, tempSlider.getValue());
}
