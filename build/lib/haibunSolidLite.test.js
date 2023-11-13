import haibunSolidLite from './haibunSolidLite.js';
describe('test haibunSolidLite lib ', () => {
    it('passes', () => {
        expect(haibunSolidLite('passes').ok).toBe(true);
    });
    it('fails', () => {
        expect(haibunSolidLite('fails')?.ok).toBe(false);
    });
});
//# sourceMappingURL=haibunSolidLite.test.js.map