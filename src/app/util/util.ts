// This can be done in a more concise way, see StackOverflow:
// https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
// However, the syntax applied there does not look so clear.
export function getRange(start: number, endNotIncluded: number): number[] {
  if (endNotIncluded < start) {
    throw new Error(`Cannot generate range if end = ${endNotIncluded} < start = ${start}`)
  }
  let result: number[] = []
  for(let i = start; i < endNotIncluded; ++i) {
    result.push(i)
  }
  return result
}

export function roundedMedian(arg: number[]): number {
  if (arg.length == 0) {
    throw new Error('Cannot calculate median of empty list')
  }
  // If no sort function is provided, numbers are sorted by their string representation
  const argSorted = [ ... arg].sort((a, b) => a - b)
  if (argSorted.length % 2 === 0) {
    const lengthOfFirstHalf = argSorted.length / 2
    const firstIndexForMedian = lengthOfFirstHalf - 1
    return Math.floor( ( argSorted[firstIndexForMedian] + argSorted[firstIndexForMedian + 1] ) / 2)
  } else {
    const numItemsBeforeMid = (argSorted.length - 1) / 2
    const mid = numItemsBeforeMid
    return argSorted[mid]
  }
}

export function sortedUniqNumbers(arg: number[]) {
  const argSorted = [... arg].sort((a, b) => a - b)
  const result: number[] = []
  argSorted.forEach(n => {
    // The internet documents that you can index arrays with negative
    // indexes to count from the end of the array.
    // The unit tests failed when I tried to apply that here.
    if ( (result.length == 0) || (n !== result[result.length - 1])) {
      result.push(n)
    }
  })
  return result
}

export function rotateToSwapItems<T>(target: T[], posFrom: number, posTo: number): number[] {
  const result = getRotateToSwapPermutation(target.length, posFrom, posTo)
  const newlyOrdered = new Array(target.length)
  result.forEach((movedToIndex, originalIndex) => {
    newlyOrdered[movedToIndex] = target[originalIndex]
  })
  newlyOrdered.forEach((value, index) => target[index] = value)
  return result
}

function getRotateToSwapPermutation(numItems: number, indexFrom: number, indexTo: number): number[] {
  if ( (indexFrom >= numItems) || (indexTo >= numItems) ) {
    throw Error(`getRotateToSwapPermutation() cannot rotate ${indexFrom} to ${indexTo} because there are only ${numItems} items`)
  }
  let indexes = getRange(0, numItems)
  // To get the permutation, we have to permute the indexes
  // the reversed way. Check the tests to understand this.
  doRotateToSwapItems(indexes, indexTo, indexFrom)
  return indexes
}

export function doRotateToSwapItems<T>(target: T[], posFrom: number, posTo: number) {
  const carry: T = target[posFrom]
  if (posFrom < posTo) {
    for (let index = posFrom + 1; index <= posTo; ++index) {
      target[index - 1] = target[index]
    }  
  } else if (posFrom > posTo) {
    for(let index = posFrom - 1; index >= posTo; --index) {
      target[index + 1] = target[index]
    }  
  }
  target[posTo] = carry
}

export function escapeHtml(s: string): string {
  return s.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
} 
