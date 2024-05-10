import { timeout } from './util'

export class AsynchronousCache {
  private cache: Map<string, Progress> = new Map()

  async get(key: string, valueCalculation: () => Promise<string>): Promise<string> {
    if (! this.cache.has(key)) {
      this.cache.set(key, new ProgressBusy())
      return new Promise((resolve, reject) => {
        valueCalculation().then((value) => {
          this.cache.set(key, new ProgressDone(value))
          resolve(value)
        }).catch((e) => {
          this.cache.set(key, new ProgressError(e))
          reject(e)
        })
      })
    } else {
      return this.getValueBeingCalculated(key)
    }
  }

  async getValueBeingCalculated(key: string): Promise<string> {
    const progress: Progress = this.cache.get(key)!
    if (progress.state === CalculationState.BUSY) {
      await timeout(1000)
      return this.getValueBeingCalculated(key)
    } else {
      return new Promise((resolve, reject) => {
        if (progress.state === CalculationState.DONE) {
          resolve((progress as ProgressDone).result)
        } else if (progress.state === CalculationState.ERROR) {
          reject((progress as ProgressError).error)
        } else {
          throw new Error('Cannot happen - case already caught')
        }
      })
    }
  }
}

enum CalculationState {
  BUSY,
  DONE,
  ERROR
}

interface Progress {
  readonly state: CalculationState
}

class ProgressBusy implements Progress {
  get state() {
    return CalculationState.BUSY
  }
}

class ProgressDone implements Progress {
  constructor(
    readonly result: string
  ) {}

  get state() {
    return CalculationState.DONE
  }
}

class ProgressError implements Progress {
  constructor(
    readonly error: any
  ) {}

  get state() {
    return CalculationState.ERROR
  }
}