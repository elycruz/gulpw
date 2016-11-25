/**
 * Created by edelacruz on 11/19/2014.
 */
$(function () {

    'use strict';

    $('body').append('<h2>Hi, this is example-feature-2\'s script result.</h2>');
    console.log(App.getTemplate('some-template2.0'),
        App.getTemplate('some-template2.2'));
});