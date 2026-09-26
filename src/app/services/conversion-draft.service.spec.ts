import { ConversionDraftService } from './conversion-draft.service';

describe('ConversionDraftService', () => {
  const service = new ConversionDraftService();
  it('restores a pending file only once for the same account', async () => {
    const file = new File(['sample'], 'planning.png', { type: 'image/png' });
    await service.save('owner', [file]);
    const restored = await service.take('owner');
    expect(restored.length).toBe(1);
    expect(restored[0].name).toBe('planning.png');
    expect(await restored[0].text()).toBe('sample');
    expect(await service.take('owner')).toEqual([]);
  });

  it('never exposes the previous account file to another account', async () => {
    await service.save('owner', [new File(['private'], 'private.png')]);
    expect(await service.take('someone-else')).toEqual([]);
    expect(await service.take('owner')).toEqual([]);
  });

  it('discards an expired checkout draft', async () => {
    const now = Date.now();
    const clock = spyOn(Date, 'now').and.returnValue(now);
    await service.save('owner', [new File(['old'], 'old.png')]);
    clock.and.returnValue(now + 60 * 60 * 1000 + 1);
    expect(await service.take('owner')).toEqual([]);
  });
});
