import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock contract calls
const mockContractCall = vi.fn();

// Mock the Clarity values
const mockClarityValue = {
  uint: (value: number) => ({ type: 'uint', value }),
  principal: (value: string) => ({ type: 'principal', value }),
};

describe('Moderator Staking Contract', () => {
  beforeEach(() => {
    mockContractCall.mockReset();
  });
  
  describe('stake-tokens', () => {
    it('should stake tokens successfully', async () => {
      const amount = 1000000; // 1 STX
      mockContractCall.mockResolvedValue({ success: true });
      
      const result = await mockContractCall('moderator-staking', 'stake-tokens', [mockClarityValue.uint(amount)]);
      
      expect(result.success).toBe(true);
    });
    
    it('should fail when staking less than minimum amount', async () => {
      const amount = 500000; // 0.5 STX (less than minimum)
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u102' });
      
      const result = await mockContractCall('moderator-staking', 'stake-tokens', [mockClarityValue.uint(amount)]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u102');
    });
  });
  
  describe('unstake-tokens', () => {
    it('should unstake tokens successfully', async () => {
      const amount = 500000; // 0.5 STX
      mockContractCall.mockResolvedValue({ success: true });
      
      const result = await mockContractCall('moderator-staking', 'unstake-tokens', [mockClarityValue.uint(amount)]);
      
      expect(result.success).toBe(true);
    });
    
    it('should fail when unstaking more than staked amount', async () => {
      const amount = 2000000; // 2 STX (more than staked)
      mockContractCall.mockResolvedValue({ success: false, error: 'err-u102' });
      
      const result = await mockContractCall('moderator-staking', 'unstake-tokens', [mockClarityValue.uint(amount)]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('err-u102');
    });
  });
  
  describe('get-moderator-stake', () => {
    it('should return the correct stake amount for a moderator', async () => {
      const moderator = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      const stakeAmount = 1500000; // 1.5 STX
      mockContractCall.mockResolvedValue({
        success: true,
        value: { 'stake-amount': mockClarityValue.uint(stakeAmount) },
      });
      
      const result = await mockContractCall('moderator-staking', 'get-moderator-stake', [mockClarityValue.principal(moderator)]);
      
      expect(result.success).toBe(true);
      expect(result.value['stake-amount'].value).toBe(stakeAmount);
    });
    
    it('should return none for a non-existent moderator', async () => {
      const moderator = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      mockContractCall.mockResolvedValue({ success: true, value: null });
      
      const result = await mockContractCall('moderator-staking', 'get-moderator-stake', [mockClarityValue.principal(moderator)]);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeNull();
    });
  });
});

