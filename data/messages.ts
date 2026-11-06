import {
  Message,
  TextMessage,
  AppleMusicMessage,
  VinylRecordMessage,
} from '../types/message';

const textMessage = (
  id: string,
  text: string,
  isSender: boolean,
  timestamp: string,
  reactionType?: NonNullable<TextMessage['reactionType']>
): TextMessage => ({
  id,
  text,
  isSender,
  timestamp,
  type: 'text',
  ...(reactionType ? { hasReaction: true, reactionType } : {}),
});

type GroupParticipant = Pick<TextMessage, 'senderName' | 'senderAvatar'>;

const groupTextMessage = (
  id: string,
  text: string,
  timestamp: string,
  participant: GroupParticipant,
  reactionType?: NonNullable<TextMessage['reactionType']>
): TextMessage => ({
  ...textMessage(id, text, false, timestamp, reactionType),
  ...participant,
});

const groupParticipants = {
  gus: {
    senderName: 'Gus Kelly',
    senderAvatar: require('../assets/profile-photos/Gus.png'),
  },
  loraine: {
    senderName: 'Loraine Turner',
    senderAvatar: require('../assets/profile-photos/Loraine.png'),
  },
  rachelle: {
    senderName: 'Rachelle Bowers',
    senderAvatar: require('../assets/profile-photos/Rachelle.png'),
  },
  will: {
    senderName: 'Will Fleming',
    senderAvatar: require('../assets/profile-photos/Will.png'),
  },
} satisfies Record<string, GroupParticipant>;

// Ruth conversation about horror movie
const conversation1: Message[] = [
  {
    id: '1',
    text: 'Yo! Have you seen the trailer for that new horror movie Sinners? It looks insane!',
    isSender: true,
    timestamp: 'Monday 2:14 PM',
    hasReaction: true,
    reactionType: 'heart',
    type: 'text',
  },
  {
    id: '2',
    text: "Yeah, I've been seeing ads for it everywhere. The reviews are saying it's terrifying.",
    isSender: false,
    timestamp: '2:15 PM',
    type: 'text',
  },
  {
    id: '3',
    text: "I really want to see it, but I don't want to go alone.",
    isSender: false,
    timestamp: '2:15 PM',
    type: 'text',
  },
  {
    id: '4',
    text: "We should totally go together! I've been wanting to check it out too.",
    isSender: true,
    timestamp: '2:16 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
    type: 'text',
  },
  {
    id: '5',
    text: 'When are you free? I could do this weekend?',
    isSender: true,
    timestamp: '2:16 PM',
    type: 'text',
  },
  {
    id: '6',
    text: 'This weekend works for me! Saturday night maybe? I heard the AMC on 5th has recliner seats now.',
    isSender: false,
    timestamp: '2:17 PM',
    type: 'text',
  },
  {
    id: '7',
    text: 'Saturday night is perfect! Let me check the showtimes...',
    isSender: true,
    timestamp: '2:18 PM',
    type: 'text',
  },
  {
    id: '8',
    text: 'Looks like they have a 7:30 and a 10:15 showing. Which one do you prefer?',
    isSender: true,
    timestamp: '2:18 PM',
    type: 'text',
  },
  {
    id: '9',
    text: "I'm cool with either, but the later one might be creepier.",
    isSender: true,
    timestamp: '2:18 PM',
    type: 'text',
  },
  {
    id: '10',
    text: "Let's do the 7:30! I have brunch plans on Sunday so I don't want to be out too late.",
    isSender: false,
    timestamp: '2:19 PM',
    type: 'text',
  },
  {
    id: '11',
    text: "Should we grab dinner before? There's that new taco place next to the theater!",
    isSender: false,
    timestamp: '2:19 PM',
    type: 'text',
  },
  {
    id: '12',
    text: "Dinner before sounds great! I've been wanting to try that taco place. Meet at 6?",
    isSender: true,
    timestamp: '2:20 PM',
    type: 'text',
  },
  {
    id: '13',
    text: "Perfect. 6pm at Taco Loco, then 7:30 for Sinners. I'll probably be hiding behind my popcorn the whole time.",
    isSender: false,
    timestamp: '2:21 PM',
    hasReaction: true,
    reactionType: 'haha',
    type: 'text',
  },
  {
    id: '13a',
    text: 'Do you want the aisle seats in case one of us needs a strategic exit?',
    isSender: false,
    timestamp: '2:21 PM',
    type: 'text',
  },
  {
    id: '13b',
    text: 'Middle seats. If we are doing this, we are committing to the full experience.',
    isSender: true,
    timestamp: '2:21 PM',
    type: 'text',
  },
  {
    id: '13c',
    text: 'Bold choice. I am holding you responsible when I cannot sleep afterward.',
    isSender: false,
    timestamp: '2:21 PM',
    type: 'text',
  },
  {
    id: '14',
    text: "Don't worry, I'll protect you from the fictional demons. I'll book the tickets tonight so we're guaranteed good seats.",
    isSender: true,
    timestamp: '2:21 PM',
    type: 'text',
  },
  {
    id: '15',
    text: "You're the best! Can't wait for Saturday. This movie better be as scary as everyone says it is!",
    isSender: false,
    timestamp: '2:22 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
    type: 'text',
  },
];

// Will Fleming conversation about Beastie Boys
const conversation2: Message[] = [
  {
    id: '1',
    text: 'Dude, have you heard the new Beastie Boys documentary on Apple TV+?',
    isSender: false,
    timestamp: 'Monday 11:30 AM',
    type: 'text',
  },
  {
    id: '2',
    text: 'Yeah! Beastie Boys Story, right? Spike Jonze directed it. So good!',
    isSender: true,
    timestamp: '11:32 AM',
    type: 'text',
  },
  {
    id: '3',
    text: 'The part about Adam Yauch had me tearing up man',
    isSender: false,
    timestamp: '11:33 AM',
    hasReaction: true,
    reactionType: 'heart',
    type: 'text',
  },
  {
    id: '4',
    text: 'For real. MCA was such a legend. His evolution from party rapper to Buddhist activist was incredible',
    isSender: true,
    timestamp: '11:35 AM',
    type: 'text',
  },
  {
    id: '5',
    text: 'Speaking of legends, this track still goes so hard',
    isSender: false,
    timestamp: '11:36 AM',
    type: 'text',
  },
  {
    id: '7',
    text: 'Intergalactic, planetary. Still impossible not to sing along.',
    isSender: true,
    timestamp: '11:37 AM',
    hasReaction: true,
    reactionType: 'haha',
    type: 'text',
  },
  {
    id: '8',
    text: 'That robot dance in the music video is iconic',
    isSender: true,
    timestamp: '11:37 AM',
    type: 'text',
  },
  {
    id: '9',
    text: 'The whole Hello Nasty album is fire. Literally no skips',
    isSender: false,
    timestamp: '11:38 AM',
    type: 'text',
  },
  {
    id: '10',
    text: "Facts! Body Movin', Remote Control, Three MCs and One DJ... all bangers",
    isSender: true,
    timestamp: '11:39 AM',
    type: 'text',
  },
  {
    id: '11',
    text: 'Did you see them live before MCA passed?',
    isSender: false,
    timestamp: '11:40 AM',
    type: 'text',
  },
  {
    id: '12',
    text: "Yeah, caught them at Bonnaroo 2009. One of the best shows I've ever been to",
    isSender: true,
    timestamp: '11:42 AM',
    hasReaction: true,
    reactionType: 'thumbsUp',
    type: 'text',
  },
  {
    id: '13',
    text: 'So jealous! I was too young back then. At least we got the documentary',
    isSender: false,
    timestamp: '11:43 AM',
    type: 'text',
  },
  {
    id: '13a',
    text: 'Check this out though - this track is timeless',
    isSender: false,
    timestamp: '11:44 AM',
    type: 'text',
  },
  {
    id: '13b',
    text: 'Intergalactic',
    isSender: false,
    timestamp: '11:44 AM',
    type: 'appleMusic',
    songId: 'search:intergalactic beastie boys', // Use search to find the correct ID
  } as AppleMusicMessage,
  {
    id: '13c',
    text: 'The production still sounds like it arrived from another planet.',
    isSender: true,
    timestamp: '11:44 AM',
    type: 'text',
  },
  {
    id: '13d',
    text: 'And somehow the video looks better every time I watch it.',
    isSender: false,
    timestamp: '11:44 AM',
    type: 'text',
  },
  {
    id: '14',
    text: 'True. And their music lives forever. Three dudes who changed hip-hop forever',
    isSender: true,
    timestamp: '11:45 AM',
    type: 'text',
  },
];

// Tina conversation about Sabrina Carpenter's new album
const conversation3: Message[] = [
  {
    id: '1',
    text: "Have you listened to Sabrina Carpenter's new album yet?",
    isSender: false,
    timestamp: 'Tuesday 3:45 PM',
    type: 'text',
  },
  {
    id: '2',
    text: "Man's Best Friend? Not yet! Is it good?",
    isSender: true,
    timestamp: '3:46 PM',
    type: 'text',
  },
  {
    id: '3',
    text: 'It is excellent. She really outdid herself with this one.',
    isSender: false,
    timestamp: '3:47 PM',
    hasReaction: true,
    reactionType: 'heart',
    type: 'text',
  },
  {
    id: '4',
    text: 'The production is insane and her vocals have never been better',
    isSender: false,
    timestamp: '3:47 PM',
    type: 'text',
  },
  {
    id: '5',
    text: 'The whole album has this perfect mix of pop rock and her signature wit',
    isSender: false,
    timestamp: '3:48 PM',
    type: 'text',
  },
  {
    id: '6',
    text: "I'm obsessed with how she's evolved from her earlier stuff",
    isSender: true,
    timestamp: '3:49 PM',
    type: 'text',
  },
  {
    id: '7',
    text: 'From Disney to this... what a journey',
    isSender: true,
    timestamp: '3:49 PM',
    type: 'text',
  },
  {
    id: '8',
    text: "Exactly! She's really found her sound. The album is so cohesive but every track stands out",
    isSender: false,
    timestamp: '3:50 PM',
    type: 'text',
  },
  {
    id: '9',
    text: 'Have you seen the visuals for the tour? They look incredible.',
    isSender: false,
    timestamp: '3:51 PM',
    type: 'text',
  },
  {
    id: '10',
    text: 'No way! Is she coming to our city?',
    isSender: true,
    timestamp: '3:52 PM',
    type: 'text',
  },
  {
    id: '11',
    text: 'June 15th at the arena. We should absolutely go.',
    isSender: false,
    timestamp: '3:53 PM',
    type: 'text',
  },
  {
    id: '12',
    text: "I'm so down! Let's get tickets as soon as they drop",
    isSender: true,
    timestamp: '3:54 PM',
    type: 'text',
  },
  {
    id: '13',
    text: 'Wait let me send you my favorite track from the album',
    isSender: false,
    timestamp: '3:55 PM',
    type: 'text',
  },
  {
    id: '14',
    text: 'House Tour',
    isSender: false,
    timestamp: '3:55 PM',
    type: 'vinylRecord',
    songId: 'search:house tour sabrina carpenter',
  } as VinylRecordMessage,
  {
    id: '15',
    text: 'This is so good. The guitar riffs are amazing.',
    isSender: true,
    timestamp: '3:57 PM',
    hasReaction: true,
    reactionType: 'thumbsUp',
    type: 'text',
  },
  {
    id: '16',
    text: 'Exactly. And the lyrics are so clever.',
    isSender: false,
    timestamp: '3:58 PM',
    type: 'text',
  },
  {
    id: '16a',
    text: 'I have already replayed it twice, and I keep noticing little production details.',
    isSender: true,
    timestamp: '3:58 PM',
    type: 'text',
  },
  {
    id: '17',
    text: "Man's Best Friend really is the album of the year",
    isSender: false,
    timestamp: '3:58 PM',
    type: 'text',
  },
];

// Loraine and Gus making coffee plans
const conversation4: Message[] = [
  textMessage(
    '1',
    'Are we still trying to get coffee this week?',
    true,
    'Wednesday 9:04 AM'
  ),
  groupTextMessage(
    '2',
    'I can do tomorrow afternoon.',
    '9:05 AM',
    groupParticipants.loraine
  ),
  groupTextMessage(
    '3',
    'Same here. Any time after 1 works.',
    '9:05 AM',
    groupParticipants.gus
  ),
  textMessage(
    '4',
    'How about Juniper at 2? It is usually quiet on Thursdays.',
    true,
    '9:06 AM'
  ),
  groupTextMessage(
    '5',
    'That is the place on Main, right?',
    '9:06 AM',
    groupParticipants.loraine
  ),
  groupTextMessage(
    '6',
    'Works for me. I have wanted to try it.',
    '9:07 AM',
    groupParticipants.gus
  ),
  textMessage('7', 'Perfect. I will grab us a table.', true, '9:08 AM'),
  groupTextMessage(
    '8',
    'Great, see you both then.',
    '9:08 AM',
    groupParticipants.loraine,
    'heart'
  ),
  groupTextMessage(
    '8a',
    'Are either of you bringing a laptop, or are we pretending this is social?',
    '9:10 AM',
    groupParticipants.loraine
  ),
  textMessage('8b', 'Strictly social. No spreadsheets.', true, '9:11 AM'),
  groupTextMessage(
    '8c',
    'Good, because I refuse to discuss budgets over coffee.',
    '9:12 AM',
    groupParticipants.loraine
  ),
  groupTextMessage(
    '8d',
    'That rule feels aimed at me.',
    '9:12 AM',
    groupParticipants.gus
  ),
  textMessage('8e', 'It is absolutely aimed at you.', true, '9:13 AM', 'haha'),
  groupTextMessage(
    '8f',
    'I might be ten minutes late. I have a call that ends at 1:45.',
    '12:54 PM',
    groupParticipants.loraine
  ),
  textMessage(
    '8g',
    'No problem. We can order while we wait.',
    true,
    '12:57 PM'
  ),
  groupTextMessage(
    '8h',
    'Can someone save the seat by the window?',
    '1:02 PM',
    groupParticipants.gus
  ),
  textMessage('8i', 'Already planning on it.', true, '1:04 PM'),
  groupTextMessage(
    '9',
    "Hey! Just checking if we're still good for coffee tomorrow at 2? That new place on Main St...",
    '1:18 PM',
    groupParticipants.loraine
  ),
];

// Gus looking for the tools he lent out
const conversation5: Message[] = [
  textMessage(
    '1',
    'Do you still have my socket set?',
    false,
    'Wednesday 10:58 AM'
  ),
  textMessage('2', 'I returned it last weekend.', true, '10:59 AM'),
  textMessage('3', 'You returned an empty case.', false, '11:01 AM'),
  textMessage(
    '4',
    'The sockets are in the blue bin next to the workbench.',
    true,
    '11:03 AM'
  ),
  textMessage(
    '5',
    'Why would you put them in a different container?',
    false,
    '11:05 AM'
  ),
  textMessage(
    '6',
    'Because your case would not close once I organized them by size.',
    true,
    '11:07 AM'
  ),
  textMessage('6a', 'That sentence makes no sense.', false, '11:09 AM'),
  textMessage('6b', 'It made sense at the time.', true, '11:10 AM'),
  textMessage(
    '6c',
    'I have checked every blue bin in the garage.',
    false,
    '11:13 AM'
  ),
  textMessage(
    '6d',
    'Including the one under the drop cloth?',
    true,
    '11:14 AM'
  ),
  textMessage('6e', 'There is a drop cloth?', false, '11:15 AM'),
  textMessage(
    '6f',
    'Behind the folding chairs. I sent you a photo last week.',
    true,
    '11:17 AM'
  ),
  textMessage('6g', 'You sent a photo of a dark corner.', false, '11:19 AM'),
  textMessage('6h', 'The arrow was very clear.', true, '11:20 AM'),
  textMessage(
    '6i',
    'I thought the arrow was pointing at the chairs.',
    false,
    '11:22 AM'
  ),
  textMessage('6j', 'Move the chairs, Gus.', true, '11:23 AM'),
  textMessage(
    '7',
    "Found them. You labeled the bin 'miscellaneous.'",
    false,
    '11:40 AM',
    'haha'
  ),
  textMessage('8', 'Dude you are a real piece of work, haha', true, '11:42 AM'),
];

// Rachelle and Will catching up after a long stretch
const conversation6: Message[] = [
  groupTextMessage(
    '1',
    'It has been way too long since all three of us were in one place.',
    'Monday 8:41 AM',
    groupParticipants.rachelle
  ),
  textMessage('2', 'Seriously. When is everyone around?', true, '8:43 AM'),
  groupTextMessage(
    '3',
    'I am back next Friday and staying through Sunday.',
    '8:45 AM',
    groupParticipants.will
  ),
  groupTextMessage(
    '4',
    'Friday night could work for me.',
    '8:46 AM',
    groupParticipants.rachelle
  ),
  textMessage(
    '5',
    'Should we keep it easy and order food at my place?',
    true,
    '8:48 AM'
  ),
  groupTextMessage(
    '6',
    'Yes. I will bring a bottle of wine.',
    '8:49 AM',
    groupParticipants.will
  ),
  groupTextMessage(
    '7',
    'I can bring dessert.',
    '8:50 AM',
    groupParticipants.rachelle,
    'thumbsUp'
  ),
  textMessage(
    '7a',
    'Do we want to invite anyone else or keep it small?',
    true,
    '8:52 AM'
  ),
  groupTextMessage(
    '7b',
    'Keep it small. I want actual time to talk.',
    '8:53 AM',
    groupParticipants.will
  ),
  groupTextMessage(
    '7c',
    'Agreed. Three people is perfect.',
    '8:54 AM',
    groupParticipants.rachelle
  ),
  textMessage('7d', 'What should we order?', true, '8:56 AM'),
  groupTextMessage(
    '7e',
    'The Thai place we used to get after work is still open.',
    '8:57 AM',
    groupParticipants.will
  ),
  groupTextMessage(
    '7f',
    'I still think about their noodles.',
    '8:58 AM',
    groupParticipants.rachelle
  ),
  textMessage(
    '7g',
    'Thai it is. I will place the order Friday.',
    true,
    '9:00 AM'
  ),
  groupTextMessage(
    '7h',
    'I found that old playlist from the road trip.',
    '9:12 AM',
    groupParticipants.will
  ),
  textMessage('7i', 'You have to play it.', true, '9:13 AM'),
  groupTextMessage(
    '7j',
    'Only if nobody complains about the first three songs.',
    '9:14 AM',
    groupParticipants.rachelle,
    'haha'
  ),
  groupTextMessage(
    '8',
    "Just wanted to catch up and chat, it's been a while since we talked.",
    '10:27 AM',
    groupParticipants.will
  ),
];

// Arlie sharing a surprising moment from work
const conversation7: Message[] = [
  textMessage(
    '1',
    'Remember the client who kept changing the brief?',
    false,
    'Tuesday 4:52 PM'
  ),
  textMessage(
    '2',
    'The one who wanted six different launches?',
    true,
    '4:53 PM'
  ),
  textMessage('3', 'That is the one.', false, '4:54 PM'),
  textMessage(
    '4',
    'He told the whole room today that the original idea was his.',
    false,
    '4:55 PM'
  ),
  textMessage('5', 'You are kidding.', true, '4:56 PM'),
  textMessage(
    '6',
    'Not even a little. Maya pulled up the first deck with my name on it.',
    false,
    '4:58 PM'
  ),
  textMessage('7', 'Good. I hope everyone saw it.', true, '4:59 PM', 'heart'),
  textMessage(
    '7a',
    'The room went completely silent while she searched for the file.',
    false,
    '5:00 PM'
  ),
  textMessage('7b', 'How did he react when it came up?', true, '5:02 PM'),
  textMessage(
    '7c',
    'He said he meant that he had inspired the direction.',
    false,
    '5:04 PM'
  ),
  textMessage(
    '7d',
    'That is an unbelievable recovery attempt.',
    true,
    '5:06 PM'
  ),
  textMessage(
    '7e',
    'Then Maya showed the comments where he had called the idea too risky.',
    false,
    '5:08 PM'
  ),
  textMessage('7f', 'Please tell me someone said something.', true, '5:10 PM'),
  textMessage(
    '7g',
    'Our director asked him to let me finish presenting my work.',
    false,
    '5:12 PM',
    'thumbsUp'
  ),
  textMessage(
    '7h',
    'Good. That is exactly what needed to happen.',
    true,
    '5:14 PM'
  ),
  textMessage(
    '7i',
    'Afterward three people came over to tell me they noticed the pattern too.',
    false,
    '5:18 PM'
  ),
  textMessage(
    '7j',
    'I am relieved, but I am still processing the confidence it took to say that out loud.',
    false,
    '5:22 PM'
  ),
  textMessage('8', 'Can you even believe he said that?', false, '5:24 PM'),
];

// Amelia coordinating dinner
const conversation8: Message[] = [
  textMessage(
    '1',
    'Are you around at all next week?',
    false,
    'Tuesday 6:20 PM'
  ),
  textMessage('2', 'Mostly. Monday is the only bad night.', true, '6:22 PM'),
  textMessage('3', 'Perfect. I owe you dinner.', false, '6:23 PM'),
  textMessage(
    '4',
    'You do not owe me anything, but I accept.',
    true,
    '6:24 PM'
  ),
  textMessage(
    '5',
    'There is a small Italian place near the park I want to try.',
    false,
    '6:25 PM'
  ),
  textMessage('6', 'That sounds great.', true, '6:26 PM', 'thumbsUp'),
  textMessage(
    '6a',
    'They make the pasta in the front window, which sold me immediately.',
    false,
    '6:28 PM'
  ),
  textMessage('6b', 'That is a very convincing detail.', true, '6:30 PM'),
  textMessage(
    '6c',
    'The menu is small: a few pastas, roast chicken, and tiramisu.',
    false,
    '6:32 PM'
  ),
  textMessage('6d', 'I am already voting for tiramisu.', true, '6:34 PM'),
  textMessage('6e', 'Naturally. Wednesday or Thursday?', false, '6:36 PM'),
  textMessage(
    '6f',
    'Thursday would be better. I can get away from work by seven.',
    true,
    '6:38 PM'
  ),
  textMessage(
    '6g',
    'I will see if they have a table at 7:30.',
    false,
    '6:41 PM'
  ),
  textMessage('6h', 'Perfect. Want to meet there?', true, '6:43 PM'),
  textMessage(
    '6i',
    'Yes, unless you want to walk over from the park.',
    false,
    '6:46 PM'
  ),
  textMessage(
    '6j',
    'A walk sounds good. I have been sitting at my desk all week.',
    true,
    '6:49 PM'
  ),
  textMessage(
    '6k',
    'Great. I will make the reservation and send you the confirmation.',
    false,
    '6:52 PM'
  ),
  textMessage(
    '7',
    'Down to grab dinner next week? How does Wed or Thur sound?',
    false,
    '6:54 PM'
  ),
];

// Loraine checking in from the neighborhood
const conversation9: Message[] = [
  textMessage(
    '1',
    'Did the construction crew finally clear your street?',
    false,
    'Sunday 8:12 AM'
  ),
  textMessage(
    '2',
    'Mostly. One truck is still blocking the corner.',
    true,
    '8:14 AM'
  ),
  textMessage(
    '3',
    'They started at six over here. Nobody was happy about it.',
    false,
    '8:16 AM'
  ),
  textMessage('4', 'At least they are almost finished.', true, '8:17 AM'),
  textMessage(
    '5',
    'I spoke too soon. They just unloaded another machine.',
    false,
    '8:36 AM'
  ),
  textMessage('6', 'Of course they did.', true, '8:37 AM', 'haha'),
  textMessage(
    '6a',
    'It is enormous and they are trying to turn it around in the intersection.',
    false,
    '8:39 AM'
  ),
  textMessage('6b', 'That sounds promising.', true, '8:40 AM'),
  textMessage(
    '6c',
    'A guy in a bathrobe just came outside to direct traffic.',
    false,
    '8:42 AM'
  ),
  textMessage('6d', 'Does he work with them?', true, '8:43 AM'),
  textMessage('6e', 'Absolutely not.', false, '8:44 AM'),
  textMessage(
    '6f',
    'He brought his own orange flashlight and everything.',
    false,
    '8:46 AM'
  ),
  textMessage('6g', 'I need to see this.', true, '8:47 AM'),
  textMessage(
    '6h',
    'Now the crew is actually listening to him.',
    false,
    '8:50 AM'
  ),
  textMessage('6i', 'Maybe he has found his calling.', true, '8:52 AM', 'haha'),
  textMessage(
    '6j',
    'He just stopped a city bus so the machine could back up.',
    false,
    '8:56 AM'
  ),
  textMessage(
    '6k',
    'The bus driver looks as confused as I am.',
    false,
    '8:58 AM'
  ),
  textMessage(
    '7',
    'You are never gonna believe what I just saw outside',
    true,
    '9:00 AM'
  ),
];

// Hollis trying to track down a missing phone
const conversation10: Message[] = [
  textMessage(
    '1',
    'Thanks again for the ride home last night.',
    false,
    'Saturday 10:03 AM'
  ),
  textMessage(
    '2',
    'Anytime. Did you make your train this morning?',
    true,
    '10:05 AM'
  ),
  textMessage('3', 'Barely. I left the house in a rush.', false, '10:06 AM'),
  textMessage(
    '4',
    'I found your water bottle in the back seat.',
    true,
    '10:08 AM'
  ),
  textMessage('5', 'That tracks. Can you hang onto it?', false, '10:09 AM'),
  textMessage('6', 'Already put it by the front door.', true, '10:10 AM'),
  textMessage(
    '6a',
    'Thank you. I am clearly falling apart.',
    false,
    '10:12 AM'
  ),
  textMessage('6b', 'You were tired. It happens.', true, '10:14 AM'),
  textMessage(
    '6c',
    'I cannot find the ticket confirmation for tonight either.',
    false,
    '10:17 AM'
  ),
  textMessage('6d', 'Search the venue name in your email.', true, '10:18 AM'),
  textMessage(
    '6e',
    'Found it. Apparently I bought the tickets at one in the morning.',
    false,
    '10:21 AM'
  ),
  textMessage('6f', 'That explains several things.', true, '10:22 AM', 'haha'),
  textMessage(
    '6g',
    'Wait, I was going to call the restaurant and now I cannot find my phone.',
    false,
    '10:25 AM'
  ),
  textMessage('6h', 'Did you check your jacket?', true, '10:27 AM'),
  textMessage('6i', 'Both pockets are empty.', false, '10:30 AM'),
  textMessage('6j', 'I will go look in the car.', true, '10:31 AM'),
  textMessage(
    '6k',
    'I have checked the kitchen, the bedroom, and every bag I own.',
    false,
    '10:34 AM'
  ),
  textMessage('7', 'Hey did I leave my phone in your car?', false, '10:36 AM'),
];

// August arriving after a delayed flight
const conversation11: Message[] = [
  textMessage(
    '1',
    'I am heading to the airport now. Send me your gate when you land.',
    true,
    'Friday 3:02 PM'
  ),
  textMessage('2', 'Will do. We are still on time for now.', false, '3:05 PM'),
  textMessage('3', 'I should be there around 5:30.', true, '3:07 PM'),
  textMessage(
    '4',
    'They just pushed us back twenty minutes.',
    false,
    '3:48 PM'
  ),
  textMessage('5', 'No problem. I will wait in the cell lot.', true, '3:49 PM'),
  textMessage('6', 'We finally landed.', false, '5:56 PM', 'thumbsUp'),
  textMessage('7', 'Great. I am ten minutes from arrivals.', true, '5:57 PM'),
  textMessage(
    '7a',
    'The jet bridge is taking forever, but at least we are at the gate.',
    false,
    '6:00 PM'
  ),
  textMessage('7b', 'No rush. Traffic is barely moving here.', true, '6:02 PM'),
  textMessage('7c', 'They moved our bags to carousel six.', false, '6:05 PM'),
  textMessage('7d', 'I will circle toward that terminal.', true, '6:07 PM'),
  textMessage(
    '7e',
    'Mine is the black suitcase with the yellow strap.',
    false,
    '6:09 PM'
  ),
  textMessage('7f', 'I remember. Text me when you have it.', true, '6:11 PM'),
  textMessage(
    '7g',
    'Still waiting. Half the flight is staring at an empty belt.',
    false,
    '6:16 PM'
  ),
  textMessage('7h', 'Airport timing remains undefeated.', true, '6:18 PM'),
  textMessage(
    '7i',
    'There it is. I am heading toward door four now.',
    false,
    '6:23 PM',
    'thumbsUp'
  ),
  textMessage('7j', 'Perfect. I am two cars from the curb.', true, '6:25 PM'),
  textMessage(
    '8',
    "My flight was delayed a bit, but I'm finally here. Will grab my luggage and see you soon.",
    false,
    '6:27 PM'
  ),
];

// Rachelle getting an unexpected message
const conversation12: Message[] = [
  textMessage(
    '1',
    'Do you remember Evan from the old office?',
    false,
    'Thursday 7:31 PM'
  ),
  textMessage('2', 'Of course. Why?', true, '7:32 PM'),
  textMessage('3', 'He followed me again this morning.', false, '7:33 PM'),
  textMessage('4', 'After three years?', true, '7:34 PM'),
  textMessage(
    '5',
    'Exactly. I assumed it was accidental, so I ignored it.',
    false,
    '7:35 PM'
  ),
  textMessage('6', 'That sounds reasonable.', true, '7:36 PM'),
  textMessage(
    '7',
    'Apparently it was not accidental.',
    false,
    '7:39 PM',
    'doubleExclamation'
  ),
  textMessage('7a', 'He sent a full paragraph.', false, '7:42 PM'),
  textMessage('7b', 'What does he want?', true, '7:43 PM'),
  textMessage(
    '7c',
    'He says he found an old notebook with ideas from our team.',
    false,
    '7:45 PM'
  ),
  textMessage('7d', 'That is a strange reason to reach out.', true, '7:47 PM'),
  textMessage(
    '7e',
    'It gets stranger. He wants to meet for coffee and return it in person.',
    false,
    '7:50 PM'
  ),
  textMessage('7f', 'Did you ask him to mail it?', true, '7:52 PM'),
  textMessage(
    '7g',
    'Yes. He ignored that part and suggested Saturday morning.',
    false,
    '7:55 PM'
  ),
  textMessage('7h', 'You do not owe him a meeting.', true, '7:57 PM', 'heart'),
  textMessage(
    '7i',
    'I know. I am mostly stunned that he still has anything from that office.',
    false,
    '8:01 PM'
  ),
  textMessage(
    '7j',
    'I am going to respond tomorrow when this feels less bizarre.',
    false,
    '8:04 PM'
  ),
  textMessage(
    '8',
    'Dude you are never gonna guess who just texted me...',
    false,
    '8:06 PM'
  ),
];

export const allConversations = [
  { id: 0, name: 'Ruth Acosta', messages: conversation1 },
  { id: 2, name: 'Loraine & Gus', messages: conversation4 },
  { id: 3, name: 'Will Fleming', messages: conversation2 },
  { id: 4, name: 'Gus Kelly', messages: conversation5 },
  { id: 5, name: 'Rachelle & Will', messages: conversation6 },
  { id: 1, name: 'Tina Hayes', messages: conversation3 },
  { id: 7, name: 'Arlie Conway', messages: conversation7 },
  { id: 8, name: 'Amelia Boyer', messages: conversation8 },
  { id: 9, name: 'Loraine Turner', messages: conversation9 },
  { id: 10, name: 'Hollis Lawson', messages: conversation10 },
  { id: 11, name: 'August James', messages: conversation11 },
  { id: 12, name: 'Rachelle Bowers', messages: conversation12 },
];
