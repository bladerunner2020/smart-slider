
/*
 * smart-slider-test
 *
 * Copyright (c) 2019 Alexander Pivovarov aka bladerunner2020, contributors
 * Licensed under the MIT license.
 */

/* global IR, SmartSlider, createColorGradient */

var slider = new SmartSlider(IR.GetPage('Main').GetItem('Slider'));
slider
    .setValueItem(IR.GetPage('Main').GetItem('ValueLabel'))
    .setLimits(315)
    .setGradientColors(createColorGradient(0xFF0000, 0x00FF00, 100))
    .setAutoUpdate(500)
    .update();


// eslint-disable-next-line no-unused-vars
function setMaximum() {
    slider.setValue(100);
}    

// eslint-disable-next-line no-unused-vars
function setMinimum() {
    slider.setValue(0);
}
