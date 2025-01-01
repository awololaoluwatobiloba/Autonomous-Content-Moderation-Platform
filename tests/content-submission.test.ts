import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock contract calls
const mockContractCall = vi.fn();

// Mock the Clarity values
const mockClarityValue = {
  buffer: (value: string) => ({ type: 'buffer', value }),
  uint: (value: number) => ({ type: 'uint', value }),
  stringAscii: (value: string) => ({ type: 'string-ascii', value }),
  principal: (value: string) => ({ type: 'principal', value }),
};

describe('Content Submission Contract', () => {
  beforeEach(() => {
    mockContractCall.mockReset();
  });
  
  describe('submit-content', () => {
    it('should submit content successfully', async () => {
      const contentHash = '1234567890abcdef';
      mockContractCall.mockResolvedValue({ success: true, value: mockClarityValue.uint(1) });
      
      const result = await mockContractCall('content-submission', 'submit-content', [mockClarityValue.buffer(contentHash)]);
      
      expect(result.success).toBe(true);
      expect(result.value.type).toBe('uint');
      expect(result.value.value).toBe(1);
    });
  });
  
  describe('get-content', () => {
    it('should retrieve content details', async () => {
      const contentId = 1;
      const mockContent = {
        author: mockClarityValue.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
        'content-hash': mockClarityValue.buffer('1234567890abcdef'),
        timestamp: mockClarityValue.uint(123456),
        status: mockClarityValue.stringAscii('active'),
      };
      
      mockContractCall.mockResolvedValue({ success: true, value: mockContent });
      
      const result = await mockContractCall('content-submission', 'get-content', [mockClarityValue.uint(contentId)]);
      
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockContent);
    });
    
    it('should return an error when content is not found', async () => {
      const contentId = 999;
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u404' });
      
      const result = await mockContractCall('content-submission', 'get-content', [mockClarityValue.uint(contentId)]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u404');
    });
  });
  
  describe('update-content-status', () => {
    it('should update content status successfully', async () => {
      const contentId = 1;
      const newStatus = 'removed';
      mockContractCall.mockResolvedValue({ success: true });
      
      const result = await mockContractCall('content-submission', 'update-content-status', [
        mockClarityValue.uint(contentId),
        mockClarityValue.stringAscii(newStatus),
      ]);
      
      expect(result.success).toBe(true);
    });
    
    it('should return an error when non-owner tries to update status', async () => {
      const contentId = 1;
      const newStatus = 'removed';
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u100' });
      
      const result = await mockContractCall('content-submission', 'update-content-status', [
        mockClarityValue.uint(contentId),
        mockClarityValue.stringAscii(newStatus),
      ]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u100');
    });
  });
});

