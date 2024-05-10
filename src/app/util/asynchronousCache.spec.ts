import { AsynchronousCache } from "./asynchronousCache";

const ERROR_MSG = 'Simulating error in value calculation'

var numCalculations = 0

describe('AsynchronousCache', () => {
  beforeEach(() => {
    numCalculations = 0
  })

  it('No duplicate calculations', (done) => {
    const instance = new AsynchronousCache()
    const v1Promise: Promise<string> = instance.get('aap', () => calculateValue('value', 500))
    const v2Promise: Promise<string> = instance.get('aap', () => calculateValue('value', 500))
    Promise.all([v1Promise, v2Promise]).then(values => {
      expect(values.length).toEqual(2)
      expect(values[0]).toEqual('value')
      expect(values[1]).toEqual('value')
      expect(numCalculations).toEqual(1)
      done()
    })
  })

  it('No duplicate calculation when calculation throws error', (done) => {
    const instance = new AsynchronousCache()
    let caught1 = false
    let caught2 = false
    const v1Promise: Promise<string> = instance.get('aap', () => generateError(500))
    const v2Promise: Promise<string> = instance.get('aap', () => generateError(500))
    Promise.all([
      v1Promise.then(() => {
        console.log('Unexpectedly called then handler of promise 1')
      })
      .catch(e1 => {
        caught1 = true
        expect((e1 as Error).message).toEqual(ERROR_MSG)
      }),
      v2Promise.then(() => {
        console.log('Unexpectedly called then handler of promise 2')
      }).catch((e2) => {
        caught2 = true
        expect((e2 as Error).message).toEqual(ERROR_MSG)
      })
    ]).then(() => {}).then(() => {
      expect(caught1).toEqual(true)
      expect(caught2).toEqual(true)
      expect(numCalculations).toEqual(1)
      done()
    })
  })
})

async function calculateValue(value: string, time: number): Promise<string> {
  return new Promise((resolve, _) => {
    ++numCalculations
    setTimeout(() => resolve(value), time)
  })
}

async function generateError(time: number): Promise<string> {
  return new Promise((_, reject) => {
    ++numCalculations
    setTimeout(() => reject(new Error(ERROR_MSG)), time)
  })
}