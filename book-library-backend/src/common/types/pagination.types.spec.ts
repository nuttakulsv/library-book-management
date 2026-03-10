import {
  createPaginationMeta,
  fromPaginationQuery,
  parsePaginationParams,
} from './pagination.types';

describe('pagination.types', () => {
  describe('parsePaginationParams', () => {
    it('should parse string query params to numbers', () => {
      const result = parsePaginationParams({
        page: '2',
        limit: '10',
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(result).toEqual({
        page: 2,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should use defaults when params missing', () => {
      const result = parsePaginationParams({});
      expect(result).toEqual({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('should clamp limit to max 100', () => {
      const result = parsePaginationParams({ limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should use desc when sortOrder is not asc', () => {
      const result = parsePaginationParams({ sortOrder: 'desc' });
      expect(result.sortOrder).toBe('desc');
    });
  });

  describe('fromPaginationQuery', () => {
    it('should use defaults for sortBy and sortOrder', () => {
      const result = fromPaginationQuery({ page: 1, limit: 20 });
      expect(result).toEqual({
        page: 1,
        limit: 20,
        search: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('should use custom defaults when provided', () => {
      const result = fromPaginationQuery(
        { page: 2, limit: 10 },
        { sortBy: 'borrowedAt', sortOrder: 'asc' },
      );
      expect(result.sortBy).toBe('borrowedAt');
      expect(result.sortOrder).toBe('asc');
    });

    it('should trim search string', () => {
      const result = fromPaginationQuery({ search: '  test  ' });
      expect(result.search).toBe('test');
    });

    it('should return undefined search for empty string', () => {
      const result = fromPaginationQuery({ search: '   ' });
      expect(result.search).toBeUndefined();
    });
  });

  describe('createPaginationMeta', () => {
    it('should create meta for first page', () => {
      const meta = createPaginationMeta(25, 1, 10);
      expect(meta).toEqual({
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should create meta for last page', () => {
      const meta = createPaginationMeta(25, 3, 10);
      expect(meta).toEqual({
        total: 25,
        page: 3,
        limit: 10,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should handle empty result', () => {
      const meta = createPaginationMeta(0, 1, 20);
      expect(meta.totalPages).toBe(1);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });
  });
});
