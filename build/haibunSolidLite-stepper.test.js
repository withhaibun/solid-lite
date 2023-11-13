import { testWithDefaults } from '@haibun/core/build/lib/test/lib.js';
import haibunSolidLite from './haibunSolidLite-stepper.js';
describe('haibunSolidLite test', () => {
    it('passes', async () => {
        const feature = { path: '/features/test.feature', content: `your test phrase passes` };
        const result = await testWithDefaults([feature], [haibunSolidLite]);
        expect(result.ok).toBe(true);
    });
    it('fails', async () => {
        const feature = { path: '/features/test.feature', content: `your test phrase fails` };
        const result = await testWithDefaults([feature], [haibunSolidLite]);
        expect(result.ok).toBe(false);
    });
});
//# sourceMappingURL=haibunSolidLite-stepper.test.js.map