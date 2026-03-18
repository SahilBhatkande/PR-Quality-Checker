import githubService from '../services/github.service.js';

// Basic sanity tests
describe('GitHub Service', () => {
    it('should be defined', () => {
        expect(githubService).toBeDefined();
    });
});
