import { Message } from '../types/message';

export const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Yo! Have you seen the trailer for that new horror movie Sinners? It looks insane!',
    isSender: true,
    timestamp: 'Monday 2:14 PM',
    hasReaction: true,
    reactionType: 'heart',
  },
  {
    id: '2',
    text: "OMG yes! I've been seeing ads for it everywhere. The reviews are saying it's terrifying.",
    isSender: false,
    timestamp: '2:15 PM',
  },
  {
    id: '3',
    text: "I really want to see it but I don't want to go alone 😂",
    isSender: false,
    timestamp: '2:15 PM',
  },
  {
    id: '4',
    text: "We should totally go together! I've been wanting to check it out too.",
    isSender: true,
    timestamp: '2:16 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
  },
  {
    id: '5',
    text: 'When are you free? I could do this weekend?',
    isSender: true,
    timestamp: '2:16 PM',
  },
  {
    id: '6',
    text: 'This weekend works for me! Saturday night maybe? I heard the AMC on 5th has recliner seats now.',
    isSender: false,
    timestamp: '2:17 PM',
  },
  {
    id: '7',
    text: 'Saturday night is perfect! Let me check the showtimes...',
    isSender: true,
    timestamp: '2:18 PM',
  },
  {
    id: '8',
    text: 'Looks like they have a 7:30 and a 10:15 showing. Which one do you prefer?',
    isSender: true,
    timestamp: '2:18 PM',
  },
  {
    id: '9',
    text: "I'm cool with either, but the later one might be creepier 🎬",
    isSender: true,
    timestamp: '2:18 PM',
  },
  {
    id: '10',
    text: "Let's do the 7:30! I have brunch plans on Sunday so I don't want to be out too late.",
    isSender: false,
    timestamp: '2:19 PM',
  },
  {
    id: '11',
    text: "Should we grab dinner before? There's that new taco place next to the theater!",
    isSender: false,
    timestamp: '2:19 PM',
  },
  {
    id: '12',
    text: "Dinner before sounds great! I've been wanting to try that taco place. Meet at 6?",
    isSender: true,
    timestamp: '2:20 PM',
  },
  {
    id: '13',
    text: "Perfect! 6pm at Taco Loco, then 7:30 for Sinners. I'm so excited but I'll probably be hiding behind my popcorn the whole time 🙈",
    isSender: false,
    timestamp: '2:21 PM',
    hasReaction: true,
    reactionType: 'haha',
  },
  {
    id: '14',
    text: "Haha don't worry, I'll be there to protect you from the fictional demons 😄 I'll book the tickets online tonight so we're guaranteed good seats!",
    isSender: true,
    timestamp: '2:21 PM',
  },
  {
    id: '15',
    text: "You're the best! Can't wait for Saturday. This movie better be as scary as everyone says it is!",
    isSender: false,
    timestamp: '2:22 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
  },
];

export const conversation2: Message[] = [
  {
    id: '1',
    text: 'Hey! How was your weekend?',
    isSender: false,
    timestamp: 'Monday 10:30 AM',
  },
  {
    id: '2',
    text: 'It was great! I went hiking with some friends. The weather was perfect!',
    isSender: true,
    timestamp: '10:32 AM',
    hasReaction: true,
    reactionType: 'heart',
  },
  {
    id: '3',
    text: 'That sounds amazing! Where did you go?',
    isSender: false,
    timestamp: '10:33 AM',
  },
  {
    id: '4',
    text: 'We went to Eagle Mountain. The views were incredible!',
    isSender: true,
    timestamp: '10:35 AM',
  },
  {
    id: '5',
    text: 'I need to check that out sometime. Do you have any photos?',
    isSender: false,
    timestamp: '10:36 AM',
  },
  {
    id: '6',
    text: 'Yes! I took tons. Let me send you some of the best ones.',
    isSender: true,
    timestamp: '10:37 AM',
  },
];

export const conversation3: Message[] = [
  {
    id: '1',
    text: 'Did you finish the project we discussed last week?',
    isSender: false,
    timestamp: 'Monday 3:45 PM',
  },
  {
    id: '2',
    text: 'Almost done! I just need to review the final section.',
    isSender: true,
    timestamp: '3:47 PM',
  },
  {
    id: '3',
    text: 'Great! Can you send it over by tomorrow?',
    isSender: false,
    timestamp: '3:48 PM',
  },
  {
    id: '4',
    text: 'Absolutely! I should have it ready by this evening.',
    isSender: true,
    timestamp: '3:50 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
  },
  {
    id: '5',
    text: 'Perfect. Thanks for your hard work on this!',
    isSender: false,
    timestamp: '3:51 PM',
  },
];

export const conversation4: Message[] = [
  {
    id: '1',
    text: 'Happy birthday! 🎉',
    isSender: false,
    timestamp: 'Monday 9:00 AM',
    hasReaction: true,
    reactionType: 'heart',
  },
  {
    id: '2',
    text: 'Thank you so much! 😊',
    isSender: true,
    timestamp: '9:02 AM',
  },
  {
    id: '3',
    text: 'Are you doing anything special to celebrate?',
    isSender: false,
    timestamp: '9:03 AM',
  },
  {
    id: '4',
    text: 'Just dinner with family tonight, but I might go out with friends this weekend!',
    isSender: true,
    timestamp: '9:05 AM',
  },
  {
    id: '5',
    text: 'That sounds perfect! Have a wonderful day! 🎂',
    isSender: false,
    timestamp: '9:06 AM',
    hasReaction: true,
    reactionType: 'doubleExclamation',
  },
];

export const allConversations = [
  { id: 0, name: 'Ruth', messages: initialMessages },
  { id: 1, name: 'Sarah', messages: conversation2 },
  { id: 2, name: 'Mike', messages: conversation3 },
  { id: 3, name: 'Emma', messages: conversation4 },
];
