import { AsynchronousCache } from './asynchronous-cache';

const ERROR_MSG = 'Simulating error in value calculation';

let numCalculations = 0;

describe('AsynchronousCache', () => {
  beforeEach(() => {
    numCalculations = 0;
  });

  it('No duplicate calculations', (done) => {
    const instance = new AsynchronousCache<TestValue>();
    const v1Promise: Promise<TestValue> = instance.get('aap', () => calculateValue('value', true, 500));
    const v2Promise: Promise<TestValue> = instance.get('aap', () => calculateValue('value', true, 500));
    Promise.all([v1Promise, v2Promise]).then((values) => {
      expect(values.length).toEqual(2);
      expect(values[0].stringField).toEqual('value');
      expect(values[0].booleanField).toEqual(true);
      expect(values[1].stringField).toEqual('value');
      expect(values[1].booleanField).toEqual(true);
      expect(numCalculations).toEqual(1);
      done();
    });
  });

  it('No duplicate calculation when calculation throws error', (done) => {
    const instance = new AsynchronousCache<string>();
    let caught1 = false;
    let caught2 = false;
    const v1Promise: Promise<string> = instance.get('aap', () => generateError(500));
    const v2Promise: Promise<string> = instance.get('aap', () => generateError(500));
    Promise.all([
      v1Promise
        .then(() => {
          console.log('Unexpectedly called then handler of promise 1');
        })
        .catch((error) => {
          caught1 = true;
          expect((error as Error).message).toEqual(ERROR_MSG);
        }),
      v2Promise
        .then(() => {
          console.log('Unexpectedly called then handler of promise 2');
        })
        .catch((error) => {
          caught2 = true;
          expect((error as Error).message).toEqual(ERROR_MSG);
        }),
    ])
      .then(() => {})
      .then(() => {
        expect(caught1).toEqual(true);
        expect(caught2).toEqual(true);
        expect(numCalculations).toEqual(1);
        done();
      });
  });
});

async function calculateValue(stringValue: string, boolValue: boolean, time: number): Promise<TestValue> {
  return new Promise((resolve) => {
    ++numCalculations;
    setTimeout(() => resolve(new TestValue(stringValue, boolValue)), time);
  });
}

async function generateError(time: number): Promise<string> {
  return new Promise((_, reject) => {
    ++numCalculations;
    setTimeout(() => reject(new Error(ERROR_MSG)), time);
  });
}

class TestValue {
  constructor(
    readonly stringField: string,
    readonly booleanField: boolean,
  ) {}
}
