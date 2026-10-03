/**
 * Database module tests
 */
import { describe, it, expect, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { getDatabase, setDatabase } from '../src/main/db-instance';

/**
 * Test suite for database functions
 */
describe('database', () => {
  afterEach(() => {
    setDatabase(null);
  });

  /**
   * Test that getDatabase returns the instance after being set
   */
  it('gets the database instance after being set', () => {
    const mockDb = {} as unknown as Database.Database;
    setDatabase(mockDb);
    const db = getDatabase();
    expect(db).toBe(mockDb);
  });

  /**
   * Test that getDatabase throws when database is not set
   */
  it('throws when getting database before being set', () => {
    expect(() => getDatabase()).toThrow('Database has not been initialised');
  });

  /**
   * Test that setDatabase sets a custom database instance
   */
  it('sets a custom database instance', () => {
    const mockDb = {} as unknown as Database.Database;
    setDatabase(mockDb);
    const db = getDatabase();
    expect(db).toBe(mockDb);
  });

  /**
   * Test that setDatabase clears the database when set to null
   */
  it('clears the database when set to null', () => {
    const mockDb = {} as unknown as Database.Database;
    setDatabase(mockDb);
    setDatabase(null);
    expect(() => getDatabase()).toThrow('Database has not been initialised');
  });

  /**
   * Test that getDatabase returns the same instance when set once
   */
  it('returns the same instance when set once', () => {
    const mockDb = {} as unknown as Database.Database;
    setDatabase(mockDb);
    const first = getDatabase();
    const second = getDatabase();
    expect(first).toBe(second);
  });
});
