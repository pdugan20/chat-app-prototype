import { formatArtworkUrl } from '../music';

describe('formatArtworkUrl', () => {
  it('fills Apple artwork template dimensions', () => {
    expect(
      formatArtworkUrl(
        'https://is1-ssl.mzstatic.com/image/thumb/example/{w}x{h}bb.{f}'
      )
    ).toBe('https://is1-ssl.mzstatic.com/image/thumb/example/200x200bb.jpg');
  });

  it('normalizes an existing Apple artwork size', () => {
    expect(
      formatArtworkUrl(
        'https://is1-ssl.mzstatic.com/image/thumb/example/100x100bb.jpg'
      )
    ).toBe('https://is1-ssl.mzstatic.com/image/thumb/example/200x200bb.jpg');
  });

  it('keeps an already usable URL unchanged', () => {
    const url = 'https://example.com/artwork.jpg';
    expect(formatArtworkUrl(url)).toBe(url);
  });

  it('keeps an empty URL empty', () => {
    expect(formatArtworkUrl('')).toBe('');
  });
});
