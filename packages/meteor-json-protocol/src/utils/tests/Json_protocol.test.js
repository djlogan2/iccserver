import chai from 'ultimate-chai';

const { expect } = chai;

describe('JsonProtocol', () => {
    describe('#send', () => {
        // Will fail on second run.
        it('should be singleton', () => {
            const Protocol = class TestProtocol extends JsonProtocol {
            };
            const instance1 = new Protocol();
            let thrown = false;
            try {
                const instance2 = new Protocol();
            } catch (e) {
                thrown = true;
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.match(/singleton/);
            }
            expect(thrown).to.be.true();
        });
    });
});
