/**
 * Filename: wav-test.ts
 * Author: rnunez
 * Date: 04/10/2019
 * Description: testing wav encoder
 */

import * as fs from 'fs';
import tsPromise from 'ts-promise';
import * as WavDecoder from 'wav-decoder';
import * as WavEncoder from 'wav-encoder';
// import { complex as fft } from 'fft';
// import { default as ft } from 'fourier-transform';

const readFile = (filepath: string) => {
  return new tsPromise((resolve, reject) => {
    fs.readFile(filepath, (err: any, buffer: {} | PromiseLike<{}> | undefined) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
};

readFile('NCAYA2.wav')
  .then((buffer) => {
    return WavDecoder.decode(buffer);
  })
  .then((audioData) => {
    // console.log("ampliando 30%");
    const size = 20000;

    for (let i = 0; i < 10; i = i + 1) {
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
      .then((buffer: any) => {
        fs.writeFileSync('newsulky.wav', Buffer.from(buffer));
      });

  })
  .catch(() => console.log('Error al cargar el archivo'));
