import { authPreviewPort } from './auth-preview.utils';
import { environment as production } from '../../environments/environment.prod';

describe('local authentication isolation', () => {
  const demo = {
    production: false,
    firebase: { projectId: 'demo-photocalia-preview' },
    authEmulatorPort: 9099,
  };
  it('connects only the explicit demo environment to the emulator', () => {
    expect(authPreviewPort(demo)).toBe(9099);
    expect(authPreviewPort({ production: false, firebase: demo.firebase })).toBeNull();
  });
  it('never activates test authentication for production builds or real projects', () => {
    expect(authPreviewPort({ ...demo, production: true })).toBeNull();
    expect(authPreviewPort({ ...demo, firebase: { projectId: 'image-to-ics' } })).toBeNull();
    expect(authPreviewPort(production)).toBeNull();
  });
  it('rejects unusable emulator ports', () => {
    for (const authEmulatorPort of [0, -1, 65536, 1.5]) {
      expect(authPreviewPort({ ...demo, authEmulatorPort })).toBeNull();
    }
  });
});
