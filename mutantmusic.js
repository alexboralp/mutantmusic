"use strict";
/**
 * Filename: wav-test.ts
 * Author: rnunez
 * Date: 04/10/2019
 * Description: testing wav encoder
 */
exports.__esModule = true;
var fs = require("fs");
var ts_promise_1 = require("ts-promise");
var WavDecoder = require("wav-decoder");
var WavEncoder = require("wav-encoder");
// import { complex as fft } from 'fft';
// import { default as ft } from 'fourier-transform';
var readFile = function (filepath) {
    return new ts_promise_1["default"](function (resolve, reject) {
        fs.readFile(filepath, function (err, buffer) {
            if (err) {
                return reject(err);
            }
            return resolve(buffer);
        });
    });
};
readFile('NCAYA2.wav')
    .then(function (buffer) {
    return WavDecoder.decode(buffer);
})
    .then(function (audioData) {
    // console.log("ampliando 30%");
    var size = 20000;
    for (var i = 0; i < 10; i = i + 1) {
        console.log(audioData.channelData[0][i]);
        console.log(audioData.channelData[1][i]);
        console.log('*******************');
    }
    // for(var i=0; i<audioData.channelData[0].length; i++) {
    //   audioData.channelData[1][i]+=audioData.channelData[0][i];
    //   audioData.channelData[0][i]*=20;
    //   audioData.channelData[0][i]+=0.000000259254;
    // }
    /*for(var i=44100*5; i<44100*10; i++) {
      audioData.channelData[0][i-44100*5] = audioData.channelData[0][i];
    }*/
    /*for(var i=44100*11; i<44100*16; i++) {
      audioData.channelData[0][i+44100*6] = audioData.channelData[0][i];
    }*/
    console.log('writing...');
    WavEncoder.encode(audioData)
        .then(function (buffer) {
        fs.writeFileSync('newsulky.wav', Buffer.from(buffer));
    });
})["catch"](function () { return console.log('Error al cargar el archivo'); });
