import { CrossingsCounterOneReferenceLayer } from './linesCrossFastAlgorithm';

describe('Test counting line crosses', () => {
  it('When max refs from first target node then counted correctly', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [0, 5]},
      {id: "Noot", connections: [0, 1]}
    ])
    expect(instance.numReferenceNodes).toEqual(6)
  })

  it('When max refs from second target node then counted correctly', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [0, 1]},
      {id: "Noot", connections: [0, 5]}
    ])
    expect(instance.numReferenceNodes).toEqual(6)
  })

  it('When two lines cross then one crossing counted', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [1]},
      {id: "Noot", connections: [0]}
    ])
    expect(instance.count()).toEqual(1)
  })

  it('When two lines do not cross then zero crossing counted', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [0]},
      {id: "Noot", connections: [1]}
    ])
    expect(instance.count()).toEqual(0)
  })

  it('When one of the lines cross then one crossing counted', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [3]},
      {id: "Noot", connections: [1, 5]}
    ])
    expect(instance.count()).toEqual(1)
  })

  it('When extra line points to new node to the right then no extra crossings', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [3]},
      {id: "Noot", connections: [1, 5]},
      {id: 'Mies', connections: [6]}
    ])
    expect(instance.count()).toEqual(1)
  })

  it('When extra line points to last touched right node then no extra crossings', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [3]},
      {id: "Noot", connections: [1, 5]},
      {id: 'Mies', connections: [5]}
    ])
    expect(instance.count()).toEqual(1)
  })

  it('When extra line points before one touched node then one extra crossing', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [3]},
      {id: "Noot", connections: [1, 5]},
      {id: 'Mies', connections: [4]}
    ])
    expect(instance.count()).toEqual(2)
  })

  it('When extra line points before two touched nodes then two extra crossing', () => {
    let instance = new CrossingsCounterOneReferenceLayer([
      {id: "Aap", connections: [3]},
      {id: "Noot", connections: [1, 5]},
      {id: 'Mies', connections: [2]}
    ])
    expect(instance.count()).toEqual(3)
  })

})