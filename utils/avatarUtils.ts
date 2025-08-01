// Avatar utility functions using DiceBear API
export const generateAvatarUrl = (name: string, size: number = 100): string => {
  // Use DiceBear's avatars API with initials style
  const encodedName = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedName}&size=${size}&backgroundColor=007AFF&textColor=ffffff`;
};

// Fallback avatar with initials
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateAvatarUrlWithStyle = (
  name: string,
  style: 'initials' | 'bottts' | 'avataaars' | 'big-ears' = 'initials',
  size: number = 100
): string => {
  const encodedName = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedName}&size=${size}`;
};
