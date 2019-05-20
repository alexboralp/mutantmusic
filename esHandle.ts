/**
 * Filename: utils.ts
 * Author: aborbon
 * Date: 04/10/2019
 * Description: Clase para el manejo de consultas a ElasticSearch.
 */

const client = require('./esconnection.js');

export class esHandle {

  public static async esSearch(): Promise<any> {
    return await new Promise<any>((resolve, reject) => {
      resolve(client.search({
        index: "song",
        type: "part",
        body: {
          "aggs": {
            "byType": {
              "terms":{
                "field":"type",
                "size": 100000
              }
            }
          }
        }
      }));
    });
  }

  public static async esBulkSong(dnaSong: number[]): Promise<any> {
    const bulk: any[] = this.esPrepareBulkData(dnaSong);
    return await new Promise<any>((resolve, reject) => {
      resolve(this.esIndexall(bulk))
    });
  }

  public static async esIndexall(madebulk: any): Promise<any> {
    return await new Promise<any>((resolve, reject) => {
      resolve(client.bulk({
        maxRetries: 5,
        index: 'song',
        type: 'part',
        body: madebulk
      }))
    });
  }

  public static esPrepareBulkData(dnaSong: number[]): any[] {
    const bulk: any[] = [];

    for (let pos = 0; pos < dnaSong.length; pos = pos + 1) {
      bulk.push({
        index: { _index: 'song', _type: 'part', _id: pos }
      },{
        type: dnaSong[pos]
      });
    }

    return bulk;
  }

  public static async esCreateIndex(): Promise<any> {
    return await new Promise<any>((resolve, reject) =>
      resolve(client.indices.create({ index: 'song' }))
    );
  }

  public static async esDeleteIndex(): Promise<any> {
    return await new Promise<any>((resolve, reject) =>
      resolve(client.indices.delete({ index: 'song' }))
    );
  }

}
