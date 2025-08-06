import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import React from 'react';
import AppleMusicBubble from '../../components/bubbles/AppleMusicBubble';
import { CenteredDecorator } from '../decorators';

// Extend the component props with story-specific controls
type AppleMusicBubbleStoryArgs = React.ComponentProps<
  typeof AppleMusicBubble
> & {
  darkMode?: boolean;
};

const meta: Meta<AppleMusicBubbleStoryArgs> = {
  title: 'Components/AppleMusicBubble',
  component: AppleMusicBubble,
  decorators: [
    CenteredDecorator,
    (Story, context) => {
      // Make reactionType ineffective when hasReaction is false
      if (!context.args.hasReaction) {
        context.args.reactionType = undefined;
      }
      return <Story />;
    },
  ],
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
  argTypes: {
    songId: {
      control: 'text',
    },
    songTitle: {
      control: 'text',
    },
    artistName: {
      control: 'text',
    },
    duration: {
      table: { disable: true },
    },
    isSender: {
      control: 'boolean',
    },
    isLastInGroup: {
      control: 'boolean',
    },
    hasReaction: {
      control: 'boolean',
    },
    reactionType: {
      control: 'select',
      options: ['heart', 'thumbsUp', 'haha', 'doubleExclamation'],
    },
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'Toggle dark mode background for testing',
    },
  },
};

export default meta;
type Story = StoryObj<AppleMusicBubbleStoryArgs>;

// Beastie Boys - Hello Nasty (Search Query)
export const HelloNasty: Story = {
  args: {
    songId: 'search:intergalactic beastie boys',
    songTitle: 'Intergalactic',
    artistName: 'Beastie Boys',
    isSender: false,
    hasReaction: false,
    isLastInGroup: true,
    darkMode: false,
    reactionType: 'thumbsUp',
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Default AppleMusicBubble State**

This shows the basic AppleMusicBubble component as a received message (gray bubble) with:
- Real Apple Music API data fetched from search query
- Album art loaded from Apple Music
- Play button starts in red filled state (unplayed)
- Message tail shown (isLastInGroup: true)
- No reaction attached

**Interactions:**
- Tap play button to start/pause audio preview
- Play button changes to progress ring after first play
- Returns to red filled state after song completes
    `,
  },
};

// Weezer - Blue Album (Search Query)
export const WeezerBlueAlbum: Story = {
  args: {
    songId: 'search:buddy holly weezer',
    songTitle: 'Buddy Holly',
    artistName: 'Weezer',
    isSender: true,
    hasReaction: false,
    isLastInGroup: true,
    darkMode: false,
    reactionType: 'thumbsUp',
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Sent Message Variant**

This shows the AppleMusicBubble as a sent message (blue bubble) demonstrating:
- isSender: true creates blue bubble with white text
- Album art placeholder uses white music note icon on blue background
- Play button and text colors adapt to blue background
- Message appears right-aligned as sender message
    `,
  },
};

// With Reaction (Search Query) - Shows thumbsUp by default
export const WithReaction: Story = {
  args: {
    songId: 'search:paranoid android radiohead',
    songTitle: 'Paranoid Android',
    artistName: 'Radiohead',
    isSender: false,
    hasReaction: true,
    isLastInGroup: true,
    darkMode: false,
    reactionType: 'thumbsUp',
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Message with Reaction**

Demonstrates the AppleMusicBubble with a reaction attachment:
- hasReaction: true adds a thumbsUp reaction by default
- Reaction appears positioned above the message bubble
- Can be changed to other reaction types (heart, haha, doubleExclamation)
- Adds padding to bubble container to accommodate reaction
    `,
  },
};

// Loading State (Invalid ID to trigger loading/fallback)
export const LoadingState: Story = {
  args: {
    songId: 'invalid-song-id',
    songTitle: 'Loading Song...',
    artistName: 'Loading Artist...',
    albumArtUrl:
      'https://via.placeholder.com/100x100/f2f2f2/8e8e93?text=Loading', // Using Colors.gray200/gray900 hex values
    isSender: false,
    hasReaction: false,
    isLastInGroup: true,
    darkMode: false,
    reactionType: 'thumbsUp',
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Loading/Error State**

Shows the component behavior when API calls fail or data is unavailable:
- Invalid songId triggers API error/fallback behavior  
- Loading text displayed while fetching data
- Placeholder album art shown when image fails to load
- Play button disabled during loading state
- Useful for testing error handling and loading states
    `,
  },
};

// With Heart Reaction (Different reaction type)
export const WithHeartReaction: Story = {
  args: {
    songId: 'search:shake it off taylor swift',
    songTitle: 'Shake It Off',
    artistName: 'Taylor Swift',
    isSender: true,
    hasReaction: true,
    reactionType: 'heart',
    isLastInGroup: false,
    darkMode: false,
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Sent Message with Heart Reaction**

Combines sender styling with different reaction type:
- Blue bubble (isSender: true) with heart reaction
- isLastInGroup: false removes message tail
- Shows how reactions work on sent messages
- Demonstrates different reaction types beyond thumbsUp
    `,
  },
};

// Group Message (Search Query)
export const GroupMessage: Story = {
  args: {
    songId: 'search:smells like teen spirit nirvana',
    songTitle: 'Smells Like Teen Spirit',
    artistName: 'Nirvana',
    isSender: false,
    hasReaction: false,
    isLastInGroup: false,
    darkMode: false,
    reactionType: 'thumbsUp',
    onPlay: fn(),
    onPause: fn(),
  },
  parameters: {
    notes: `
**Group Message (No Tail)**

Shows the bubble as part of a message group:
- isLastInGroup: false removes the message tail
- Used when multiple messages from same sender are grouped together
- Creates cleaner visual flow for consecutive messages
- Tail only appears on the final message in a group
    `,
  },
};
