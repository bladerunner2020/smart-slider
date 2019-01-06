
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
    .setGradientColors(createColorGradient(0xFF00FF, 0x00FFFF, 100))
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
    .update();

