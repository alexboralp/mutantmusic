"use strict";
/**
 * Filename: wavfilemanager.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Carga y guarda archivos .wav
 */
exports.__esModule = true;
var fs = require("fs");
var WavDecoder = require("wav-decoder");
var WavEncoder = require("wav-encoder");
var WavFileManager = /** @class */ (function () {
    function WavFileManager() {
    }
    WavFileManager.readWAV = function (filepath) {
        var buffer = WavFileManager.read(filepath);
        return WavDecoder.decode.sync(buffer);
    };
    WavFileManager.writeWAV = function (filepath, audioData) {
        var buffer = WavEncoder.encode.sync(audioData);
        fs.writeFileSync(filepath, Buffer.from(buffer));
    };
    WavFileManager.read = function (filepath) {
        return fs.readFileSync(filepath);
    };
    return WavFileManager;
}());
exports.WavFileManager = WavFileManager;
