import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import React from 'react';
import VinylRecordBubble from '../../components/bubbles/VinylRecordBubble';
import { CenteredDecorator } from '../decorators';
import { VinylRecordMessage } from '../../types/message';

// Extend the component props with story-specific controls
type VinylRecordBubbleStoryArgs = {
  message: VinylRecordMessage;
  darkMode?: boolean;
};

const meta: Meta<VinylRecordBubbleStoryArgs> = {
  title: 'Components/VinylRecordBubble',
  component: VinylRecordBubble,
  decorators: [
    CenteredDecorator,
    (Story, context) => {
      // Make reactionType ineffective when hasReaction is false
      if (!context.args.message.hasReaction) {
        context.args.message.reactionType = undefined;
      }
      return <Story />;
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
  argTypes: {
    message: {
      control: 'object',
    },
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'Toggle dark mode background for testing',
    },
  },
};

export default meta;
type Story = StoryObj<VinylRecordBubbleStoryArgs>;

// Olivia Rodrigo - Love is Embarrassing
export const LoveIsEmbarrassing: Story = {
  args: {
    message: {
      id: 'vinyl-1',
      type: 'vinylRecord',
      songId: 'search:love is embarrassing olivia rodrigo',
      songTitle: 'love is embarrassing',
      artistName: 'Olivia Rodrigo',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Olivia Rodrigo - Love is Embarrassing**

This shows the VinylRecordBubble component as a received message with:
- Real Apple Music API data fetched from search query
- Album art displayed as vinyl record label
- Spinning animation when playing
- Scrubbing capability by dragging the vinyl
- Dynamic colors from album artwork
- Smooth progress animation on play button

**Interactions:**
- Tap play button to start/pause audio preview
- Drag vinyl record to scrub through the song
- Progress ring animates smoothly during playback
- Vinyl spins at 33⅓ RPM when playing
    `,
  },
};

// The Beatles - Hey Jude (Classic Vinyl)
export const HeyJude: Story = {
  args: {
    message: {
      id: 'vinyl-2',
      type: 'vinylRecord',
      songId: 'search:hey jude beatles',
      songTitle: 'Hey Jude',
      artistName: 'The Beatles',
      text: '',
      isSender: true,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**The Beatles - Classic Vinyl (Sent)**

Shows the VinylRecordBubble as a sent message (blue bubble) demonstrating:
- isSender: true creates blue bubble variant
- Classic vinyl aesthetic with The Beatles
- Album art from Apple Music API
- Text colors adapt to blue background
- Message appears right-aligned as sender message
    `,
  },
};

// Pink Floyd - Wish You Were Here
export const WishYouWereHere: Story = {
  args: {
    message: {
      id: 'vinyl-3',
      type: 'vinylRecord',
      songId: 'search:wish you were here pink floyd',
      songTitle: 'Wish You Were Here',
      artistName: 'Pink Floyd',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: true,
      reactionType: 'heart',
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Pink Floyd with Heart Reaction**

Demonstrates the VinylRecordBubble with a reaction attachment:
- hasReaction: true adds a heart reaction
- Classic prog rock vinyl aesthetic
- Dynamic colors from album artwork
- Shows how reactions work with vinyl bubbles
    `,
  },
};

// Fleetwood Mac - Dreams
export const Dreams: Story = {
  args: {
    message: {
      id: 'vinyl-4',
      type: 'vinylRecord',
      songId: 'search:dreams fleetwood mac',
      songTitle: 'Dreams',
      artistName: 'Fleetwood Mac',
      text: '',
      isSender: true,
      timestamp: new Date().toISOString(),
      hasReaction: true,
      reactionType: 'thumbsUp',
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Fleetwood Mac - Sent with Reaction**

Combines sender styling with reaction:
- Blue bubble (isSender: true) with thumbsUp reaction
- Classic 70s rock vinyl
- Dynamic colors adapt to Rumours album art
- Demonstrates different reaction types
    `,
  },
};

// Daft Punk - Get Lucky
export const GetLucky: Story = {
  args: {
    message: {
      id: 'vinyl-5',
      type: 'vinylRecord',
      songId: 'search:get lucky daft punk',
      songTitle: 'Get Lucky',
      artistName: 'Daft Punk',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: true,
    },
    darkMode: true,
  },
  parameters: {
    notes: `
**Daft Punk - Modern Electronic**

Shows vinyl bubble with modern electronic music:
- Dynamic colors from Random Access Memories album
- Dark mode enabled for testing
- Electronic music on vinyl aesthetic
- Demonstrates genre versatility of the component
    `,
  },
};

// Taylor Swift - Anti-Hero
export const AntiHero: Story = {
  args: {
    message: {
      id: 'vinyl-6',
      type: 'vinylRecord',
      songId: 'search:anti hero taylor swift',
      songTitle: 'Anti-Hero',
      artistName: 'Taylor Swift',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: true,
      reactionType: 'haha',
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Taylor Swift - Modern Pop Vinyl**

Contemporary pop on vinyl format:
- Midnights album artwork as vinyl label
- Haha reaction demonstrates humor response
- Dynamic purple/blue colors from album
- Shows modern music in classic format
    `,
  },
};

// Billie Eilish - bad guy
export const BadGuy: Story = {
  args: {
    message: {
      id: 'vinyl-7',
      type: 'vinylRecord',
      songId: 'search:bad guy billie eilish',
      songTitle: 'bad guy',
      artistName: 'Billie Eilish',
      text: '',
      isSender: true,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: true,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Billie Eilish - Alternative Pop**

Modern alternative pop aesthetic:
- Neon green dynamic colors from album art
- Sent message (blue bubble variant)
- Contemporary artist on vinyl format
- Demonstrates color adaptation system
    `,
  },
};

// Loading State (Invalid ID)
export const LoadingState: Story = {
  args: {
    message: {
      id: 'vinyl-loading',
      type: 'vinylRecord',
      songId: 'invalid-song-id',
      songTitle: 'Loading...',
      artistName: 'Loading...',
      albumArtUrl: 'https://via.placeholder.com/100x100/f2f2f2/8e8e93?text=Loading',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: false,
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Loading/Error State**

Shows the component behavior when API calls fail or data is unavailable:
- Invalid songId triggers loading state
- Loading text displayed while fetching data
- Placeholder album art on vinyl
- Play button disabled during loading
- Useful for testing error handling
    `,
  },
};

// Custom Colors Example
export const CustomColors: Story = {
  args: {
    message: {
      id: 'vinyl-custom',
      type: 'vinylRecord',
      songId: 'search:bohemian rhapsody queen',
      songTitle: 'Bohemian Rhapsody',
      artistName: 'Queen',
      text: '',
      isSender: false,
      timestamp: new Date().toISOString(),
      hasReaction: false,
      useDynamicColors: true,
      colors: {
        bgColor: '#2C1810',
        textColor1: '#FFD700',
        textColor2: '#FFA500',
        textColor3: '#FF8C00',
        textColor4: '#FF6347',
      },
    },
    darkMode: false,
  },
  parameters: {
    notes: `
**Custom Color Override**

Demonstrates custom color system:
- Manual color override for specific aesthetic
- Gold and orange theme for Queen
- Shows how to customize beyond API colors
- Useful for branded or themed experiences
    `,
  },
};