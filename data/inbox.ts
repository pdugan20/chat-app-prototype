export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: number;
  isGroup?: boolean;
  groupAvatars?: number[];
}

export const mockChats: ChatItem[] = [
  {
    id: '0',
    name: 'Ruth Acosta',
    lastMessage:
      "You're the best! Can't wait for Saturday. This movie better be as scary as everyone says it is!",
    timestamp: '2:45 PM',
    unread: true,
    avatar: require('../assets/profile-photos/Ruth.png'),
  },
  {
    id: '2',
    name: 'Loraine & Gus',
    lastMessage:
      "Hey! Just checking if we're still good for coffee tomorrow at 2? That new place on Main St...",
    timestamp: '1:18 PM',
    unread: false,
    isGroup: true,
    groupAvatars: [
      require('../assets/profile-photos/Loraine.png'),
      require('../assets/profile-photos/Gus.png'),
    ],
  },
  {
    id: '3',
    name: 'Will Fleming',
    lastMessage:
      'You: True. And their music lives forever. Three dudes who changed hip-hop forever',
    timestamp: '12:55 PM',
    unread: false,
    avatar: require('../assets/profile-photos/Will.png'),
  },
  {
    id: '4',
    name: 'Gus Kelly',
    lastMessage: 'You: Dude you are a real piece of work, haha',
    timestamp: '11:42 AM',
    unread: false,
    avatar: require('../assets/profile-photos/Gus.png'),
  },
  {
    id: '5',
    name: 'Rachelle & Will',
    lastMessage:
      "Just wanted to catch up and chat, it's been a while since we talked.",
    timestamp: '10:27 AM',
    unread: false,
    isGroup: true,
    groupAvatars: [
      require('../assets/profile-photos/Rachelle.png'),
      require('../assets/profile-photos/Will.png'),
    ],
  },
  {
    id: '6',
    name: 'Tina Hayes',
    lastMessage:
      "This is Tina from Dr. Miller's office confirming your dental appointment for Thursday at 9:1...",
    timestamp: '9:15 AM',
    unread: false,
    avatar: require('../assets/profile-photos/Tina.png'),
  },
  {
    id: '7',
    name: 'Arlie Conway',
    lastMessage: 'Can you even believe he said that?',
    timestamp: 'Yesterday',
    unread: false,
    avatar: require('../assets/profile-photos/Arlie.png'),
  },
  {
    id: '8',
    name: 'Amelia Boyer',
    lastMessage: 'Down to grab dinner next week? How does Wed or Thur sound?',
    timestamp: 'Yesterday',
    unread: false,
    avatar: require('../assets/profile-photos/Amelia.png'),
  },
  {
    id: '9',
    name: 'Loraine Turner',
    lastMessage: 'You: You are never gonna believe what I just saw outside',
    timestamp: 'Sunday',
    unread: false,
    avatar: require('../assets/profile-photos/Loraine.png'),
  },
  {
    id: '10',
    name: 'Hollis Lawson',
    lastMessage: 'Hey did I leave my phone in your car?',
    timestamp: 'Saturday',
    unread: false,
    avatar: require('../assets/profile-photos/Hollis.png'),
  },
  {
    id: '11',
    name: 'August James',
    lastMessage:
      "My last Flight Flight was delayed a bit but I'm finally here. Will grab my luggage and see y...",
    timestamp: 'Friday',
    unread: false,
    avatar: require('../assets/profile-photos/August.png'),
  },
  {
    id: '12',
    name: 'Rachelle Bowers',
    lastMessage: 'Dude you are never gonna guess who just texted me...',
    timestamp: 'Thursday',
    unread: true,
    avatar: require('../assets/profile-photos/Rachelle.png'),
  },
];
