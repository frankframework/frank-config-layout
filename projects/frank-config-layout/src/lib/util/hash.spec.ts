import { sha256 } from './hash';

describe('Hashing', () => {
  it('Same string produces same hash', async () => {
    const hashes = await hashAll(['aap', 'aap']);
    expect(hashes).lengthOf(1);
  });

  it('No hash collision', async () => {
    const inputs: string[] = ['aap', 'aaap', 'aapp'];
    for (let i = 0; i < 10; ++i) {
      inputs.push(`aap${i}`);
    }
    const numInputs = inputs.length;
    expect(numInputs).toEqual(13);
    const hashes = await hashAll(inputs);
    expect(hashes).lengthOf(numInputs);
  });
});

async function hashAll(inputs: string[]): Promise<Set<string>> {
  const result = new Set<string>();
  await Promise.all(inputs.map((input) => sha256(input))).then((hashes) => {
    for (const hash of hashes) {
      result.add(hash);
    }
  });
  return result;
}
