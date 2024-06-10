/*
   Copyright 2024 WeAreFrank!

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { timeout } from './util'

export class AsynchronousCache<T> {
  private cache: Map<string, Progress> = new Map()

  getSortedKeys(): string[] {
    return [ ... this.cache.keys() ].sort()
  }

  async get(key: string, valueCalculation: () => Promise<T>): Promise<T> {
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

  private async getValueBeingCalculated(key: string): Promise<T> {
    let progress: Progress = this.cache.get(key)!
    while (progress.state === CalculationState.BUSY) {
      await timeout(500)
      progress = this.cache.get(key)!
    }
    return this.getCalculatedValue(key)
  }

  private getCalculatedValue(key: string): T {
    if ((! this.cache.has(key))) {
      throw new Error(`Expected that cache has value for key ${key}`)
    }
    const progress: Progress = this.cache.get(key)!
    if (progress.state === CalculationState.BUSY) {
      throw new Error(`Expected that calculation for key ${key} was done`)
    } else if(progress.state === CalculationState.DONE) {
      return (progress as ProgressDone<T>).result
    } else {
      throw (progress as ProgressError).error
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

class ProgressDone<T> implements Progress {
  constructor(
    readonly result: T
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