'use strict';
const STORY_EN = {
  "meet": {
    "chapter": 1,
    "time": "A meeting through the box",
    "title": "Start with a real question.",
    "start": "home",
    "welcome": {
      "leo": "Let someone discover one small corner of the world you love.",
      "julian": "A photograph you want to talk about is enough to begin."
    },
    "needs": {
      "leo": "Saturday afternoon in Tokyo. Some architecture, then time to sit and swap photographs.",
      "julian": "I'm free Saturday afternoon. A daytime café sounds good. I'll bring the photo."
    },
    "options": [
      [
        "Architecture, then photographs",
        "Saturday afternoon · Tokyo",
        "Look at a few buildings in daylight, then sit and swap photos. Route, opening information and costs to be confirmed."
      ],
      [
        "A drink and a song",
        "Saturday afternoon · A public café",
        "Each bring a photograph and a song. Café and costs to be confirmed."
      ]
    ],
    "memory": {
      "leo": "She stops to look at the shadows of buildings too.",
      "julian": "He really wanted to know what I was listening to when I took that photo."
    },
    "memoryTitle": "The shadow looked like a piano",
    "scenarios": {
      "leo": [
        {
          "key": "book",
          "text": "I want to ask about her architecture photo, but I'm afraid I'll sound too serious.",
          "reply": "You notice light and shadows in your staircase photos too. Start with the photo she chose to share: what does that shadow remind you of, and what was she listening to? That's more you than a perfect opening line.",
          "draft": "meet-hello"
        }
      ],
      "julian": [
        {
          "key": "begin",
          "text": "I'd love to talk about that photograph, but maybe he was only being polite.",
          "reply": "Start with what you remember: Kino in your headphones, and why you stood there for so long. The story behind a photograph can be an easier beginning than explaining yourself.",
          "draft": "meet-reply"
        }
      ]
    },
    "lines": [
      {
        "id": "meet-hello",
        "by": "leo",
        "label": "Ask about the shadow",
        "text": "The shadow in your photo looks like piano keys. What were you listening to?"
      },
      {
        "id": "meet-reply",
        "by": "julian",
        "after": "meet-hello",
        "label": "Follow that curiosity",
        "text": "Kino. I stood there for ages. No one's ever asked me that."
      },
      {
        "id": "meet-invite",
        "by": "leo",
        "after": "meet-reply",
        "label": "Invite her to keep talking about photographs",
        "text": "I listen to them too. Coffee on Saturday? I'll bring my staircase photo."
      },
      {
        "id": "meet-yes",
        "by": "julian",
        "after": "meet-invite",
        "label": "Say yes to meeting",
        "text": "Okay. Bring the photo."
      }
    ]
  },
  "date": {
    "chapter": 2,
    "time": "Growing closer",
    "start": "chat",
    "welcome": {
      "leo": "You can want to see her again and want to feel more at ease this time.",
      "julian": "How could you leave room for a conversation on your next date?"
    },
    "needs": {
      "leo": "Something small in New York this Saturday? I'd like time to talk.",
      "julian": "I'm in. A gallery sounds good. Nothing too packed, with room for a conversation."
    },
    "options": [
      [
        "A small exhibition and an unfinished story",
        "Saturday afternoon · New York",
        "Choose an art space, then leave time to sit. Exhibition, opening information and costs to be confirmed."
      ],
      [
        "Records and an unhurried conversation",
        "Saturday afternoon · Choose a place together",
        "Each pick a song to share, then find time to talk. Volume, listening arrangements and costs to be confirmed."
      ]
    ],
    "memory": {
      "leo": "This time, I finally got to the end of that story.",
      "julian": "We didn't have to fill every silence to feel close."
    },
    "memoryTitle": "Enough time for the whole story",
    "scenarios": {
      "leo": [
        {
          "key": "longing",
          "text": "I want to see her again. Last time I spent the whole night saying, 'What?'",
          "reply": "You like the kind of evening where Knives Out ends and the conversation about the clues keeps going. Leave room for that: we could look for a gallery, then somewhere to sit. I can turn that pace into a suggestion on her side.",
          "hint": {
            "subtle": "Let the conversation be the exciting part this time. Find something to look at together, without another stop to rush to. Bring a song you love, and tell her why you wanted her to hear it.",
            "direct": "Look for somewhere you can hear each other. A gallery could be a starting point, with time afterwards for the story Chloe didn't get to finish.",
            "meaning": "Allow 'somewhere quiet, with time to talk this time' to help Sarah shape this invitation.",
            "keep": "My worries about not hearing, my nerves and the rest of my private conversation.",
            "summary": "For this date: quiet, unhurried and with time to talk.",
            "source": "Based on interests you both chose to share and Chloe's quiet, unhurried preference authorised only for this invitation. Her private words are not included."
          }
        },
        {
          "key": "heart",
          "text": "How much does she like me right now?",
          "heart": true
        }
      ],
      "julian": [
        {
          "key": "invite",
          "text": "I'd love to take her to a gig. But last time we barely got to talk.",
          "reply": "You love giving someone a new song to discover. Keep that thought. We could look for a gallery and let a painting start the conversation. If she shares her favourite films or exhibitions too, we can build on those.",
          "draft": "date-invite"
        },
        {
          "key": "heart",
          "text": "Is she looking forward to it as much as I am?",
          "heart": true
        },
        {
          "key": "stay",
          "text": "At that jazz record stall, I wished Chloe would stay a little longer. I kept looking at the sleeves because I didn't know how to ask.",
          "reply": "It sounds like you wanted a little more time beside her. You don't need to turn it into a grand confession. One record, and the story of why you love it, can be a lovely place to linger.",
          "partnerHint": "Next time you come across a record stall, leave a little room to linger. Ask Sarah to pick a jazz record and tell you when she first heard it. You could say, 'I'm not in a hurry — show me another one.'"
        }
      ]
    },
    "lines": [
      {
        "id": "date-share",
        "by": "julian",
        "label": "Tell her I want to share more",
        "text": "I want you to know the little things I don't always say. Shall we share our Vibes?"
      },
      {
        "id": "date-share-yes",
        "by": "leo",
        "after": "date-share",
        "label": "Tell her I'd like to share mine too",
        "text": "I'd like that. I'll turn mine on too."
      },
      {
        "id": "date-invite",
        "by": "julian",
        "after": "date-share-yes",
        "label": "Send the invitation myself",
        "text": "Are you free on Saturday? I'd like to hear the rest of that story properly."
      },
      {
        "id": "date-yes",
        "by": "leo",
        "after": "date-invite",
        "label": "Tell her I'd like that too",
        "text": "Yes. Don't let me change the subject this time. And tell me about that song."
      }
    ]
  },
  "daily": {
    "chapter": 3,
    "time": "Life together",
    "start": "chat",
    "welcome": {
      "leo": "An ordinary week can still have time to sit down together.",
      "julian": "A day off doesn't need to become another shift. How would you like to spend a little time with her?"
    },
    "needs": {
      "leo": "I'd like to sit down for dinner on Friday, without rushing out or only talking about chores.",
      "julian": "I'd like simple food on Friday, leaving our time for sitting together."
    },
    "options": [
      [
        "Simple dinner, with time to sit",
        "Friday evening · At home",
        "Keep dinner simple and choose a song each. Leave the evening for a conversation."
      ],
      [
        "Twenty minutes outside",
        "Friday evening · If you both feel like it",
        "Walk near home in London and stop when something catches your eye. Route and weather to be confirmed."
      ]
    ],
    "memory": {
      "leo": "Tonight, I finally felt like telling that little story that wasn't about chores.",
      "julian": "I like leaving time for her, without rushing to the next thing."
    },
    "memoryTitle": "A little time for each other",
    "scenarios": {
      "leo": [
        {
          "key": "fresh",
          "text": "Lately, our main conversation seems to be, 'Who's washing up?'",
          "reply": "You love the small, kind moments in Paddington 2. Friday doesn't need to be a big occasion either. Eat something simple, tell a story that isn't about chores, then see if you feel like a film.",
          "hint": {
            "subtle": "Don't turn the kitchen into another shift tonight. Make something simple, put on a song you like, then sit down. Hear a story from her that isn't about washing up.",
            "direct": "Invite Emma to an evening with less to do: a simple meal, time to talk, then decide together whether to put on a film.",
            "meaning": "Allow 'a little relaxed time together this week' to help Arjun suggest one small plan.",
            "keep": "My private feelings about our recent routines and anything else I've shared here.",
            "summary": "For this plan: relaxed, little preparation, and time together.",
            "source": "Based on Emma's preference authorised only for this small plan. Her work, location and private words have not been accessed."
          }
        }
      ],
      "julian": [
        {
          "key": "care",
          "text": "I really don't want to cook a feast on my day off. But I'd love a proper evening with her.",
          "reply": "You like putting music on at home. Start with a song, keep the food simple, and sit beside her. If she feels like a film too, your favourite Notting Hill could be an option.",
          "draft": "daily-invite"
        },
        {
          "key": "photograph",
          "text": "There's a photograph on our shelf that I love. I wish Emma would ask why I always stop to look at it. I don't quite know how to bring it up.",
          "reply": "Wanting her to notice a small part of your world makes sense. Keep the story close; it doesn't need a special occasion. If you're still working through the argument, make room for the apology and listening first.",
          "partnerHint": "When you're both ready for an ordinary moment together, choose one photograph on the shelf and ask Arjun, 'What's a detail in this one that I might have missed?' Let his answer lead, with no need to turn it into a bigger conversation."
        }
      ]
    },
    "lines": [
      {
        "id": "daily-invite",
        "by": "julian",
        "label": "Make a little time in an ordinary evening",
        "text": "Something simple at home on Friday? You pick the music, I'll cook. Then we can actually sit down."
      },
      {
        "id": "daily-yes",
        "by": "leo",
        "after": "daily-invite",
        "label": "Choose the evening together",
        "text": "Yes. Leave the plates afterwards. I have something funny to tell you."
      }
    ]
  },
  "repair": {
    "chapter": 3,
    "time": "After an argument",
    "start": "chat",
    "welcome": {
      "leo": "You can still be angry and take time to say what you need.",
      "julian": "Take responsibility for what you said, then ask whether she wants to listen."
    },
    "history": [
      {
        "from": "leo",
        "text": "I'd saved Paddington 2 for us. Tea afterwards, like we said. Were you still coming home?"
      },
      {
        "from": "julian",
        "text": "The restaurant ran late. I wanted to surprise you with a Notting Hill sort of night."
      },
      {
        "from": "leo",
        "text": "I didn't need a big entrance. I needed one text so I knew whether to wait."
      },
      {
        "from": "julian",
        "text": "Then don't wait next time."
      }
    ],
    "needs": {
      "leo": "At nine, please listen first. Later, I'd like tea and somewhere to browse slowly. Small kindnesses matter more than a surprise.",
      "julian": "I'll listen at nine and text when work changes. Afterwards, we could choose a bookshop walk together. No surprise itinerary."
    },
    "agreement": "When plans change, text first. Ask before changing a quiet evening into a surprise, and leave room to say not tonight.",
    "options": [
      [
        "Tea, then a bookshop wander",
        "After the conversation · A time you both choose",
        "A little everyday care and a little romance. Browse a bookshop together, then share what caught your eye over tea. Opening hours need checking."
      ],
      [
        "A familiar film and simple supper",
        "Another evening · At home",
        "After you've talked, choose one of your favourite films together. Keep supper simple and pause when someone wants to talk. Resting instead is fine."
      ]
    ],
    "memory": {
      "leo": "He remembered the tea, not a grand entrance. I could tell him why waiting hurt.",
      "julian": "A bookshop wander can wait. Being romantic starts with sending the message."
    },
    "memoryTitle": "Next time, I'll let you know",
    "scenarios": {
      "leo": [
        {
          "key": "hurt",
          "text": "The bit I love in Paddington 2 is people noticing little things. Tonight I would've settled for a text.",
          "reply": "That tells me what matters: being remembered in the small choices. Tell him what waiting felt like. A film can wait until you want company.",
          "pause": true,
          "hint": {
            "subtle": "Before planning a romantic surprise, listen to what waiting felt like. Later, ask about tea and a bookshop wander. Let the small kindness come first.",
            "direct": "Emma is open to talking later, but still needs space. Apologise for the missing message and your reply. Listen before asking about another evening together.",
            "meaning": "Allow 'I need space now and am open to talking later' to help Arjun approach this conversation. This does not mean forgiveness.",
            "keep": "The exact words I used when hurt, details of my feelings and the rest of my private conversation.",
            "summary": "For this conversation: space first, then ask about a time to talk. This does not mean the conflict is resolved.",
            "source": "Based on Emma's need for space and willingness to talk later, authorised only for this conversation. It does not infer that she is calm or has forgiven."
          }
        }
      ],
      "julian": [
        {
          "key": "sorry",
          "text": "I went for the grand romantic gesture and forgot one ordinary message. Then I snapped at her.",
          "reply": "You love Notting Hill's brave romantic leaps. Tonight, make a smaller one: own the silence and that hurtful reply. Listen before suggesting anything.",
          "draft": "repair-sorry"
        },
        {
          "key": "photograph",
          "text": "I love that photo of the little bookshop window we found. I wish Emma would ask why I always stop to look at it.",
          "reply": "You remember the unexpected discovery; she values someone noticing the little things. There's a conversation there. First, give the apology and her feelings enough room.",
          "partnerHint": "When you're both ready for an ordinary moment together, choose one photograph on the shelf and ask Arjun, 'What's a detail in this one that I might have missed?' Let his answer lead, with no need to turn it into a bigger conversation.",
          "bridgeAfter": "repair-agree"
        }
      ]
    },
    "lines": [
      {
        "id": "repair-sorry",
        "by": "julian",
        "label": "Take responsibility and apologise myself",
        "text": "The restaurant ran late. I didn't text, then snapped at you. My romantic surprise doesn't excuse that. I'm sorry."
      },
      {
        "id": "repair-listen",
        "by": "leo",
        "after": "repair-sorry",
        "label": "Agree to talk while keeping time for myself",
        "text": "I like the little kindnesses in Paddington 2. Tonight, that meant one message. At nine, can you just listen?"
      },
      {
        "id": "repair-ask",
        "by": "julian",
        "after": "repair-listen",
        "label": "Offer a change I can be responsible for",
        "text": "Yes. Next time, I'll text first. When you're ready, how about tea and a bookshop wander? No surprise itinerary."
      },
      {
        "id": "repair-agree",
        "by": "leo",
        "after": "repair-ask",
        "label": "Agree on a change without declaring everything fixed",
        "text": "Tea and a bookshop sound like us. Let's keep that promise, though. I still need tonight to talk."
      }
    ]
  },
  "lifetime": {
    "chapter": 4,
    "time": "Fifteen years together",
    "start": "memory",
    "welcome": {
      "leo": "Which small moment from those fifteen years has stayed with you?",
      "julian": "An anniversary can be easy too. How would you like to spend this one?"
    },
    "needs": {
      "leo": "I'd like a Saturday walk with time to talk, like the feeling I love in Before Sunrise. Bring one old photo; no packed itinerary.",
      "julian": "Walter Mitty still makes me want to notice somewhere new. This Saturday, one nearby corner, my camera, and time to sit with Leo."
    },
    "options": [
      [
        "Noodles, an old photo, and the next story",
        "Saturday · At home",
        "Revisit the cardboard-box dinner with takeaway noodles and an old photograph. Put on a song you both remember, then tell the story behind it."
      ],
      [
        "One new corner, with time to talk",
        "Saturday afternoon · Wellington",
        "Leo brings a question; Julian brings his camera. Take a short harbour walk, stop at one unfamiliar detail, then eat somewhere nearby. Check weather and access."
      ]
    ],
    "memory": {
      "leo": "I brought a question; he found a patch of harbour light. Fifteen years, and I still like seeing what catches his eye.",
      "julian": "I put the camera down for his story. We found somewhere new without rushing through the afternoon."
    },
    "memoryTitle": "Fifteen years, still discovering",
    "scenarios": {
      "leo": [
        {
          "key": "proposal",
          "text": "I want our fifteenth anniversary to feel thoughtful. Just not like an annual report.",
          "reply": "Your Before Sunrise kind of romance has room for a wandering conversation. Start with the cardboard-box photo, then ask what he remembers differently. Leave tomorrow's discovery to him.",
          "prepare": true
        },
        {
          "key": "ordinary",
          "text": "I don't need our Saturdays to be perfect. Even if dinner goes wrong, I'd like Julian to know I'm happy just being there with him.",
          "reply": "Your favourite walking-and-talking feeling doesn't need a perfect destination. Leave room for his camera, your conversation, and a meal that can go slightly wrong.",
          "partnerHint": "Leave Saturday a little unfinished. Bring your camera, ask Leo a question you haven't asked lately, and make something simple together. If dinner goes wrong, order takeaway."
        }
      ],
      "julian": [
        {
          "key": "expect",
          "text": "I'd like a quiet anniversary. I really don't feel like travelling far this week.",
          "reply": "The Secret Life of Walter Mitty leaves you wanting to notice more. That can be one nearby corner, not a long trip. Bring the camera; leave time for his story.",
          "draft": "life-yes",
          "hint": {
            "subtle": "Leave some space in the plan this time. Bring an old photo and find somewhere close to sit. You've photographed so many windows and corners; there may be one whose story you haven't told him yet.",
            "direct": "Keep this anniversary close and unhurried. Bring the moving-day photo, then leave a little room to notice a corner you've both walked past before.",
            "meaning": "Allow 'quiet, with little travelling for this anniversary' to help Leo prepare this one occasion.",
            "keep": "Work, health and spending details, and the rest of my private conversation.",
            "summary": "For this anniversary: quiet, little travelling, simple time together.",
            "source": "Based on Julian's preference authorised only for this anniversary. Old photographs must be chosen separately by the person sharing them."
          }
        }
      ]
    },
    "lines": [
      {
        "id": "life-boxes",
        "by": "julian",
        "label": "Remember dinner on the boxes",
        "text": "Found our moving-day photo. Before Sunrise was playing; dinner was balanced on those boxes."
      },
      {
        "id": "life-table",
        "by": "leo",
        "after": "life-boxes",
        "label": "Pick up a shared memory",
        "text": "Then came The Secret Life of Walter Mitty. I wanted a conversation; you packed a camera and called it an expedition."
      },
      {
        "id": "life-tease",
        "by": "julian",
        "after": "life-table",
        "label": "Correct one detail with a smile",
        "text": "We reached the next street. You talked until our takeaway went cold. I got one excellent photo of it."
      },
      {
        "id": "life-years",
        "by": "leo",
        "after": "life-tease",
        "label": "Say what fifteen years means",
        "text": "Fifteen years, and I still like that deal. Saturday: your camera, my questions, and food we actually eat warm."
      },
      {
        "id": "life-invite",
        "by": "leo",
        "after": "life-years",
        "label": "Invite him to celebrate together",
        "text": "Saturday, just us? One nearby corner we haven't noticed, then somewhere to sit and talk."
      },
      {
        "id": "life-yes",
        "by": "julian",
        "after": "life-invite",
        "label": "Share the anticipation and the pace I'd like",
        "text": "Yes. I'll bring the camera and the food. You bring one of those questions that turns into three hours."
      }
    ],
    "historyMemories": [
      [
        "The first time we stayed by the sea until dark",
        "After Before Sunrise, we tried a short walk by the harbour. One question became an evening. Julian took one photo, then put the camera away."
      ],
      [
        "Dinner on cardboard boxes",
        "Before Sunrise played beside takeaway noodles on our moving boxes. Julian added The Secret Life of Walter Mitty to next week's list. We still remember whose noodles went cold."
      ],
      [
        "A travel agreement",
        "After watching Walter Mitty together, Julian wanted every detour. Leo wanted time to talk. We settled on one new stop, a shared song, and room to linger."
      ]
    ]
  },
  "older": {
    "chapter": 4,
    "time": "After the anniversary",
    "start": "chat",
    "welcome": {
      "leo": "The thing you want to keep today might simply be a joke.",
      "julian": "You can still choose the next small plan together."
    },
    "needs": {
      "leo": "Tomorrow, a short walk and a long conversation. One nearby discovery is enough; I'd rather hear his story than fill the afternoon.",
      "julian": "I'll bring the camera and something to eat. One new corner, then somewhere to sit. This expedition can stay close to home."
    },
    "options": [
      [
        "A camera, a question, and one new corner",
        "Tomorrow afternoon · Choose a short route together",
        "Julian chooses something to photograph; Leo asks what drew him to it. Leave time to listen. Route, weather and access need checking."
      ],
      [
        "The photo, the song, and supper",
        "Tomorrow afternoon · At home",
        "Choose one photograph and a song from a shared evening. Recreate the simple meal, then tell each other the detail you remember differently."
      ]
    ],
    "memory": {
      "leo": "I still want to show him the little places we walk past every day.",
      "julian": "In our sixteenth year, I'm still looking forward to our next afternoon together."
    },
    "memoryTitle": "Another small thing to do together",
    "scenarios": {
      "leo": [
        {
          "key": "old",
          "text": "Looking through those photos, I still seem to be taking pictures of windows and corners.",
          "reply": "That's how you notice the world. Tomorrow doesn't need a landmark. Find one nearby corner you haven't explored, and let him show you a detail he notices too.",
          "draft": "older-answer"
        }
      ],
      "julian": [
        {
          "key": "old",
          "text": "I'd like to go out and sit somewhere again tomorrow. Bring some food, and my book.",
          "reply": "You like taking a book along and leaving time for an unexpected stop. Keep that part tomorrow: bring the book and something to eat, then choose where to go together.",
          "draft": "older-question"
        }
      ]
    },
    "lines": [
      {
        "id": "older-question",
        "by": "julian",
        "label": "Notice something in the old photos",
        "text": "All these photos, and you're still taking pictures of windows."
      },
      {
        "id": "older-answer",
        "by": "leo",
        "after": "older-question",
        "label": "Add something with a smile",
        "text": "And corners. There's usually something good around the next one."
      },
      {
        "id": "older-invite",
        "by": "julian",
        "after": "older-answer",
        "label": "Leave room for the next invitation",
        "text": "Shall we find a new one tomorrow? I'll bring my book and some food."
      },
      {
        "id": "older-yes",
        "by": "leo",
        "after": "older-invite",
        "label": "Choose the next small thing together",
        "text": "Yes. No rushing. Your turn to choose the corner."
      }
    ]
  }
};
