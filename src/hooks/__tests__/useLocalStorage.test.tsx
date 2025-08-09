import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('reads and writes to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'init'));

    expect(result.current[0]).toBe('init');

    act(() => {
      result.current[1]('next');
    });

    expect(result.current[0]).toBe('next');
    expect(window.localStorage.getItem('key')).toBe(JSON.stringify('next'));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('init');
  });
});