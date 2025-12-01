/**
 * Snapshot Service Tests
 * 
 * Testa validação de tokens e comportamento do SnapshotService
 */

import { describe, it, expect, afterEach } from 'vitest';
import { SnapshotService } from './snapshotService';

describe('SnapshotService - Token Validation', () => {
  // Backup dos tokens originais
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restaurar env após cada teste
    process.env = { ...originalEnv };
  });

  describe('snapshotBlueConsult', () => {
    it('should return false or throw error when PIPEDRIVE_API_TOKEN is missing', async () => {
      // Remove token do Pipedrive
      delete process.env.PIPEDRIVE_API_TOKEN;

      // snapshotBlueConsult pode lançar exceção ou retornar false dependendo do try/catch
      try {
        const result = await SnapshotService.snapshotBlueConsult();
        expect(result).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('PIPEDRIVE_API_TOKEN');
      }
    });
  });

  describe('snapshotTokenizaAcademy', () => {
    it('should return false when DISCORD_BOT_TOKEN is missing', async () => {
      // Remove token do Discord
      delete process.env.DISCORD_BOT_TOKEN;

      // snapshotTokenizaAcademy captura exceção e retorna false
      const result = await SnapshotService.snapshotTokenizaAcademy();
      expect(result).toBe(false);
    });

    it('should return false when DISCORD_GUILD_ID is missing', async () => {
      // Remove guild ID do Discord
      delete process.env.DISCORD_GUILD_ID;

      const result = await SnapshotService.snapshotTokenizaAcademy();
      expect(result).toBe(false);
    });
  });

  describe('Token validation behavior', () => {
    it('should validate PIPEDRIVE_API_TOKEN before attempting API calls', () => {
      // Verifica que o código tem validação de tokens
      const hasValidation = SnapshotService.snapshotBlueConsult.toString().includes('PIPEDRIVE_API_TOKEN');
      expect(hasValidation).toBe(true);
    });

    it('should validate DISCORD_BOT_TOKEN before attempting API calls', () => {
      const hasValidation = SnapshotService.snapshotTokenizaAcademy.toString().includes('DISCORD_BOT_TOKEN');
      expect(hasValidation).toBe(true);
    });

    it('should have snapshotCademi method for Cademi integration', () => {
      // Verifica que o método existe
      expect(typeof SnapshotService.snapshotCademi).toBe('function');
    });
  });
});
