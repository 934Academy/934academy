export const WRITING_PROMPTS_B2 = [
  {
    type: 'Essay',
    icon: '📝',
    desc: 'Argument a topic from two different perspectives',
    prompts: [
      {
        id: 'b2_w_essay_1',
        title: 'Social Media & Communication',
        task: `Some people think that social media has made communication between people worse, not better. Others believe it has brought people closer together.
        
Write an essay discussing both views and giving your own opinion.

In your essay you should:
• discuss the negative effects of social media on communication
• discuss the positive effects of social media on communication
• give your own opinion

Write 140–190 words.`,
        tips: ['Use contrastive connectors: however, on the other hand, whereas', 'Give your opinion in the conclusion with: In my view, I believe that...', 'Avoid repeating the same words — use synonyms']
      },
      {
        id: 'b2_w_essay_2',
        title: 'Mobile Phones in Schools',
        task: `It has been suggested that schools should ban the use of mobile phones during lessons. Do you agree?

Write an essay giving your opinion.

In your essay you should:
• explain the reasons for banning phones
• explain the arguments against a ban
• give your own opinion with reasons

Write 140–190 words.`,
        tips: ['Clear structure: introduction, point in favor, point against, conclusion', 'Use: It is argued that... / Supporters of this view claim that...', 'End with a clear and justified opinion']
      },
      {
        id: 'b2_w_essay_3',
        title: 'Opportunities for Young People',
        task: `Many people believe that young people today have fewer opportunities than previous generations. Do you agree?

In your essay you should:
• discuss opportunities in education and employment
• consider other factors such as technology and globalisation
• give your own conclusion

Write 140–190 words.`,
        tips: ['Include concrete examples to support your arguments', 'Use: In contrast to previous generations... / Unlike their parents...', 'Don\'t forget to refer to both points of the prompt']
      }
    ]
  },
  {
    type: 'Article',
    icon: '📰',
    desc: 'Write for a magazine with a personal and engaging tone',
    prompts: [
      {
        id: 'b2_w_article_1',
        title: 'Technology That Changed My Life',
        task: `A student magazine is looking for articles about technology that has changed your life.

Write an article describing a piece of technology and explaining how it has affected you.

Your article should be interesting and engaging for other students.

Write 140–190 words.`,
        tips: ['Start with a question or striking sentence to capture attention', 'Use a personal tone — you can use "I" and "you"', 'Add an engaging title to your article']
      },
      {
        id: 'b2_w_article_2',
        title: 'A Hidden Gem',
        task: `Write an article for an international student magazine about an interesting place in your country that tourists rarely visit.

Describe the place, explain why it is special and say why more people should visit it.

Write 140–190 words.`,
        tips: ['Use descriptive language: vivid adjectives, sensory details', 'Include why the place is special or little known', 'End with a direct recommendation to the reader']
      },
      {
        id: 'b2_w_article_3',
        title: 'Things I Wish I\'d Known Sooner',
        task: `A magazine is running a series called 'Things I Wish I'd Known Sooner'.

Write an article about something important you have learned and how it changed the way you think or behave.

Write 140–190 words.`,
        tips: ['Be personal and honest — the best articles are authentic', 'Use narrative: describe when/how you learned the lesson', 'Connect your experience with something universal that readers can relate to']
      }
    ]
  },
  {
    type: 'Review',
    icon: '⭐',
    desc: 'Grade something you have experienced and give recommendations',
    prompts: [
      {
        id: 'b2_w_review_1',
        title: 'Film Review',
        task: `Write a review of a film you have seen recently for your school website.

In your review you should:
• briefly describe what the film is about
• explain what you liked (and disliked) about it
• say whether you would recommend it and to whom

Write 140–190 words.`,
        tips: ['No reveal the ending — avoid spoilers', 'Use evaluative language: outstanding, disappointing, gripping, predictable', 'Address the reader: "If you enjoy thrillers, this is the film for you."']
      },
      {
        id: 'b2_w_review_2',
        title: 'Restaurant Review',
        task: `You recently visited a restaurant for a special occasion. Write a review for a travel website.

In your review describe:
• the food and drinks
• the atmosphere and service
• whether you would recommend it

Write 140–190 words.`,
        tips: ['Include sensory details: taste, smell, atmosphere', 'Be balanced — mention both positive and negative aspects', 'End with a clear recommendation']
      },
      {
        id: 'b2_w_review_3',
        title: 'Book Review',
        task: `Write a review of a book you have read for your school magazine.

In your review you should:
• say what the book is about without revealing too much
• explain what makes it special or interesting
• say whether other students should read it

Write 140–190 words.`,
        tips: ['Mention the genre: thriller, romance, science fiction, biography...', 'Compare with other books if useful: "Unlike most novels of this type..."', 'Use quotation marks to cite memorable quotes from the book']
      }
    ]
  },
  {
    type: 'Report',
    icon: '📊',
    desc: 'Write formally with sections and recommendations',
    prompts: [
      {
        id: 'b2_w_report_1',
        title: 'School Facilities',
        task: `Your school director has asked you to write a report on the sports and leisure facilities available to students.

In your report you should:
• describe what facilities are currently available
• identify any problems or limitations
• make recommendations for improvement

Write 140–190 words.`,
        tips: ['Use section headings: Introduction, Current Situation, Recommendations', 'Formal and objective tone — avoid excessive personal opinions', 'Use the passive voice: "It has been suggested that... / Students were asked..."']
      },
      {
        id: 'b2_w_report_2',
        title: 'Improving Your Town for Tourists',
        task: `A local council has asked young people to write a report on how their town could be made more attractive to visitors.

In your report you should:
• describe the current situation
• identify what is missing or could be improved
• suggest specific changes with reasons

Write 140–190 words.`,
        tips: ['Be specific with your recommendations: "The council should invest in..."', 'Use formal language: Furthermore, In addition, It is recommended that...', 'Include data or examples to support your suggestions']
      },
      {
        id: 'b2_w_report_3',
        title: 'Student Free Time',
        task: `Your teacher has asked you to write a report on the most popular ways students in your school spend their free time, and to suggest how the school could better support these activities.

Write 140–190 words.`,
        tips: ['Structure in clear sections with headings', 'Present the data objectively before making recommendations', 'End with a brief conclusion that summarizes your suggestions']
      }
    ]
  },
  {
    type: 'Formal Letter / Email',
    icon: '✉️',
    desc: 'Write formally for a specific purpose',
    prompts: [
      {
        id: 'b2_w_formal_1',
        title: 'Language Course Enquiry',
        task: `You saw an advertisement for a summer language course abroad. Write a letter to the school asking for more information.

In your letter you should ask about:
• the accommodation options available
• the activities and excursions included
• the total cost and payment options

Write 140–190 words.`,
        tips: ['Start with: Dear Sir/Madam, and end with: Yours faithfully,', 'Use formal request phrases: I would be grateful if you could...', 'Organize into paragraphs based on the three points of the prompt']
      },
      {
        id: 'b2_w_formal_2',
        title: 'Complaint Email',
        task: `You recently bought a product online that arrived damaged. Write an email to the company.

In your email you should:
• explain what you ordered and what the problem is
• describe the inconvenience this has caused
• say clearly what you would like the company to do

Write 140–190 words.`,
        tips: ['Be firm but polite — don\'t use aggressive language', 'Use: I am writing to complain about... / I would like to request...', 'Be specific about what you want: refund, replacement, apology']
      },
      {
        id: 'b2_w_formal_3',
        title: 'Letter to a Newspaper',
        task: `Write a letter to the editor of a newspaper responding to an article that claimed teenagers spend too much time online.

In your letter you should:
• express your opinion on the claim
• give two or three examples to support your view
• suggest a more balanced perspective

Write 140–190 words.`,
        tips: ['Start with: Dear Editor,', 'Cite the article: "In your recent article, it was suggested that..."', 'Use persuasive language: It is important to consider... / In reality...']
      }
    ]
  },
  {
    type: 'Informal Letter / Email',
    icon: '💬',
    desc: 'Write to a friend with a natural and friendly tone',
    prompts: [
      {
        id: 'b2_w_informal_1',
        title: 'School Trip',
        task: `You have just returned from a school trip abroad. Write an email to an English-speaking friend telling them about it.

In your email you should:
• describe where you went and what you did
• explain what you enjoyed most (and least)
• say how the experience affected you

Write 140–190 words.`,
        tips: ['Use an informal greeting: Hi [name]! / Hey!', 'Include colloquial language: It was absolutely amazing! / I couldn\'t believe it when...', 'End in a friendly way: Can\'t wait to hear from you! / Write back soon!']
      },
      {
        id: 'b2_w_informal_2',
        title: 'Visit to Your Town',
        task: `An English-speaking friend is planning to visit your town for a week. Write an email giving them advice.

In your email include:
• what to see and do
• where to eat and what to try
• any practical tips (transport, weather, customs)

Write 140–190 words.`,
        tips: ['Be specific and personal: "You have to try the food at..."', 'Use friendly imperatives: Make sure you visit... / Don\'t miss...', 'Add your own experience to make the email more authentic']
      },
      {
        id: 'b2_w_informal_3',
        title: 'Gap Year Advice',
        task: `Your English friend has asked for your advice about whether to take a gap year before university. Write an email giving your opinion.

In your email you should:
• give your opinion clearly
• explain the reasons for and against a gap year
• make a final recommendation

Write 140–190 words.`,
        tips: ['Start by acknowledging your friend\'s situation: "I totally understand why you\'re unsure..."', 'Use advice-giving language: If I were you... / Have you thought about...?', 'Be honest but understanding — this is an email to a friend']
      }
    ]
  }
];