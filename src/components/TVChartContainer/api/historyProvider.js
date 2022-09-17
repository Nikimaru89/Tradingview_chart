import { gql, GraphQLClient } from 'graphql-request'
const strmEndpoint = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2'
export const strmClient = new GraphQLClient(strmEndpoint)
const WRAPPER_SYMBOL = ['ETH', 'BNB', 'WBNB', 'USDT', 'USDC', 'DAI']


const rp = require("request-promise").defaults({ json: true });

const api_root = "https://min-api.cryptocompare.com";
const history = {};

export default {
  history: history,

  getBars: async (symbolInfo, resolution, from, to, first, limit) => {

    // let graph = []
    // let graphRes = []
    // let pair = '0x3c50bef8518f9ed98f9e0d66db3d2340421a3801'
    // let block
    // // customProvider.on('block', (blockNumber) => {
    // // 	// setBlock(blockNumber)
    // // 	block = blockNumber
    // // })

    // // if (pair && block > 0) {
    // if (pair) {
    //   console.log('about to call gql')
    //   const query = gql`{
    //     swaps(orderBy: timestamp, orderDirection: desc, timestamp_gt: 1519136000, where: {pair: "${pair}"}) {
    //       id
    //       timestamp
    //       pair {
    //         token0 {
    //           id
    //           derivedBNB
    //           derivedUSD
    //           symbol
    //         }
    //         token1 {
    //           id
    //           derivedBNB
    //           derivedUSD
    //           symbol
    //         }
    //       }
    //       from
    //       amount0In
    //       amount1In
    //       amount0Out
    //       amount1Out
    //       amountUSD
    //     }
    //   }`
    //   try {
    //     await strmClient.request(query).then((response) => {
    //       if (response['swaps'].length > 0) {
    //         let val = [...response['swaps']]
    //         for (let i = 0; i < val.length; i++) {
    //           if (WRAPPER_SYMBOL.includes(val[i]['pair']['token0']['symbol'])) {
    //             [val[i]['amount0In'], val[i]['amount1In'], val[i]['amount0Out'], val[i]['amount1Out'], val[i]['pair']['token0'], val[i]['pair']['token1']] =
    //               [val[i]['amount1In'], val[i]['amount0In'], val[i]['amount1Out'], val[i]['amount0Out'], val[i]['pair']['token1'], val[i]['pair']['token0']]
    //           }
    //         }
    //         let startPoint = Math.floor(Number(val[val.length - 1]['timestamp']) / 900)
    //         var data = { time: 0, open: 0, low: Number.POSITIVE_INFINITY, high: 0, close: 0, volume: 0 }
    //         for (let i = val.length - 1; i >= 0; i--) {
    //           const price = Number(val[i]['amountUSD']) / Number(Number(val[i]['amount0Out']) <= 0 ? val[i]['amount0In'] : val[i]['amount0Out'])
    //           if (Number(val[i]['timestamp']) <= (startPoint + 1) * 900) {
    //             data = {
    //               ...data,
    //               time: startPoint * 900,
    //               open: data.open !== 0 ? data.open : price,
    //               low: data.low <= price ? data.low : price,
    //               high: data.high >= price ? data.high : price,
    //               close: price,
    //               volume: 0,
    //             }
    //           } else {
    //             graph.push(data)
    //             startPoint = startPoint + 1
    //             data = { ...data, time: 0, open: data.close, low: data.close, high: data.close, close: 0, volume: 0 }
    //             data = {
    //               ...data,
    //               time: startPoint * 900,
    //               open: data.open !== 0 ? data.open : price,
    //               low: data.low <= price ? data.low : price,
    //               high: data.high >= price ? data.high : price,
    //               close: price,
    //               volume: 0,
    //             }
    //           }
    //         }
    //         if (data.time !== 0) {
    //           graph.push(data)
    //         }

    //         graph[graph.length - 1] = ({
    //           time: graph[graph.length - 1].time, // TradingView requires bar time in ms
    //           low: graph[graph.length - 1].low,
    //           high: graph[graph.length - 1].high,
    //           open: graph[graph.length - 1].open,
    //           close: graph[graph.length - 1].close,
    //           volume: graph[graph.length - 1].volume,
    //           isBarClosed: false,
    //           isLastBar: true
    //         })
    //         graphRes = graph

    //       }
    //     })
    //   } catch (error) {
    //     console.log("graphql error:", error)
    //   }

    //   return {
    //     'data': graphRes
    //   }
    // }




    const split_symbol = symbolInfo.name.split(/[:/]/);
    const url =
      resolution === "D"
        ? "/data/histoday"
        : resolution >= 60
          ? "/data/histohour"
          : "/data/histominute";
    const qs = {
      e: split_symbol[0],
      fsym: split_symbol[1],
      tsym: split_symbol[2],
      toTs: to ? to : "",
      limit: limit ? limit : 2000,
    };

    const data = await rp({
      url: `${api_root}${url}?api_key=e9302bec5ed1485221fa014314c366782bd9cb5b436999c4833d862554ce1771`,
      qs,
    });
    if (data.Response && data.Response === "Error") {
      console.log("CryptoCompare API error:", data.Message);
      return [];
    }
    if (data.Data.length) {
      console.log(
        `Actually returned: ${new Date(
          data.TimeFrom * 1000
        ).toISOString()} - ${new Date(data.TimeTo * 1000).toISOString()}`
      );
      const bars = data.Data.map((el) => {
        return {
          time: el.time * 1000,
          low: el.low,
          high: el.high,
          open: el.open,
          close: el.close,
          volume: el.volumefrom,
        };
      });
      if (first) {
        const lastBar = bars[bars.length - 1];
        history[symbolInfo.name] = { lastBar: lastBar };
      }
      return bars;
    } else {
      return [];
    }
  },
};
