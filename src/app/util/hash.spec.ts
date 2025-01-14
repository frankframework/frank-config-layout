import { inject } from '@angular/core'
import { sha256 } from './hash'

describe('Hashing', () => {
  it('Same string produces same hash', (done) => {
    hashAll(['aap', 'aap']).then((hashes) => {
      expect(hashes).toHaveSize(1)
      done()
    })
  })

  it('No hash collision', (done) => {
    let inputs: string[] = ['aap', 'aaap', 'aapp']
    for (let i = 0; i < 10; ++i) {
      inputs.push(`aap${i}`)
    }
    const numInputs = inputs.length
    expect(numInputs).toEqual(13)
    hashAll(inputs).then((hashes) => {
      expect(hashes).toHaveSize(numInputs)
      done()
    })
  })
})

async function hashAll(inputs: string[]): Promise<Set<string>> {
  let result = new Set<string>()
  await Promise.all(inputs.map((input) => sha256(input))).then((hashes) => {
    hashes.forEach(hash => {
      result.add(hash)
    })
  })
  return result
}
