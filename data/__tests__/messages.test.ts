import { mockChats } from '../inbox';
import { allConversations } from '../messages';

describe('seeded conversations', () => {
  it('provides a populated thread for every inbox row', () => {
    mockChats.forEach(chat => {
      const conversation = allConversations.find(
        candidate => candidate.id.toString() === chat.id
      );

      expect(conversation?.name).toBe(chat.name);
      const minimumMessageCount = chat.name === 'Will Fleming' ? 17 : 18;
      expect(conversation?.messages.length).toBeGreaterThanOrEqual(
        minimumMessageCount
      );
    });
  });

  it('keeps emoji out of message text while allowing reactions', () => {
    const inlineEmoji = /\p{Extended_Pictographic}/u;

    allConversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        expect(message.text).not.toMatch(inlineEmoji);
        if ('caption' in message && message.caption) {
          expect(message.caption).not.toMatch(inlineEmoji);
        }
      });
    });

    expect(
      allConversations.some(conversation =>
        conversation.messages.some(message => message.hasReaction)
      )
    ).toBe(true);
  });

  it('identifies every incoming participant in group threads', () => {
    mockChats
      .filter(chat => chat.isGroup)
      .forEach(chat => {
        const conversation = allConversations.find(
          candidate => candidate.id.toString() === chat.id
        );

        conversation?.messages
          .filter(message => !message.isSender)
          .forEach(message => {
            expect(message.senderName).toBeTruthy();
            expect(message.senderAvatar).toBeTruthy();
          });
      });
  });
});
