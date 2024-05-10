import { AsynchronousCache } from "./asynchronousCache";

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
})

async function calculateValue(value: string, time: number): Promise<string> {
  return new Promise((resolve, _) => {
    ++numCalculations
    setTimeout(() => resolve(value), time)
  })
}