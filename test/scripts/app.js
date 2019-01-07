
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
    .setAnimation(500)
    .setAutoUpdate(500)
    .update();


var gradient = createColorGradient(0x0000FF, 0x00FFFF, 11);
gradient = gradient.concat(createColorGradient(0x00FFFF, 0x00FF00, 7));
gradient = gradient.concat(createColorGradient(0x00FF00, 0xFFFF00, 7));
gradient = gradient.concat(createColorGradient(0xFFFF00, 0xFF0000, 15));

var slider2 = new SmartSlider(IR.GetPage('Main').GetItem('Slider2'));
slider2
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel2'))
    .setLabelLimits(260)
    .setGradientColors(gradient)
    .setAnimation(500)
    .update();

// eslint-disable-next-line no-unused-vars
function animate() {
    slider.updateX();
    slider2.updateX();
}

function set0() {   // eslint-disable-line no-unused-vars
    slider2.updateX(0, slider2.getValue());
}

function set10() {  // eslint-disable-line no-unused-vars
    slider2.updateX(10, slider2.getValue());
}

function set20() {  // eslint-disable-line no-unused-vars
    slider2.updateX(20, slider2.getValue());
}

function set30() {  // eslint-disable-line no-unused-vars
    slider2.updateX(30, slider2.getValue());
}

function set40() {  // eslint-disable-line no-unused-vars
    slider2.updateX(40, slider2.getValue());
}
