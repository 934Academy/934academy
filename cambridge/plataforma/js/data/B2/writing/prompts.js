export const WRITING_PROMPTS_B2 = [
  {
    type: 'Essay',
    icon: '📝',
    desc: 'Argumenta sobre un tema con dos puntos de vista',
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
        tips: ['Usa conectores de contraste: however, on the other hand, whereas', 'Da tu opinión en la conclusión con: In my view, I believe that...', 'Evita repetir las mismas palabras — usa sinónimos']
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
        tips: ['Estructura clara: introducción, punto a favor, punto en contra, conclusión', 'Usa: It is argued that... / Supporters of this view claim that...', 'Cierra con una opinión clara y justificada']
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
        tips: ['Incluye ejemplos concretos para apoyar tus argumentos', 'Usa: In contrast to previous generations... / Unlike their parents...', 'No olvides hacer referencia a los dos puntos del enunciado']
      }
    ]
  },
  {
    type: 'Article',
    icon: '📰',
    desc: 'Escribe para una revista con tono personal y atractivo',
    prompts: [
      {
        id: 'b2_w_article_1',
        title: 'Technology That Changed My Life',
        task: `A student magazine is looking for articles about technology that has changed your life.

Write an article describing a piece of technology and explaining how it has affected you.

Your article should be interesting and engaging for other students.

Write 140–190 words.`,
        tips: ['Empieza con una pregunta o frase impactante para captar la atención', 'Usa un tono personal — puedes usar "I" y "you"', 'Añade un título llamativo a tu artículo']
      },
      {
        id: 'b2_w_article_2',
        title: 'A Hidden Gem',
        task: `Write an article for an international student magazine about an interesting place in your country that tourists rarely visit.

Describe the place, explain why it is special and say why more people should visit it.

Write 140–190 words.`,
        tips: ['Usa lenguaje descriptivo: vivid adjectives, sensory details', 'Incluye por qué el lugar es especial o poco conocido', 'Termina con una recomendación directa al lector']
      },
      {
        id: 'b2_w_article_3',
        title: 'Things I Wish I\'d Known Sooner',
        task: `A magazine is running a series called 'Things I Wish I'd Known Sooner'.

Write an article about something important you have learned and how it changed the way you think or behave.

Write 140–190 words.`,
        tips: ['Sé personal y honesto — los mejores artículos son auténticos', 'Usa narrativa: describe cuándo/cómo aprendiste la lección', 'Conecta tu experiencia con algo universal que los lectores puedan identificar']
      }
    ]
  },
  {
    type: 'Review',
    icon: '⭐',
    desc: 'Evalúa una película, libro o lugar con criterio',
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
        tips: ['No cuentes el final — evita los spoilers', 'Usa lenguaje evaluativo: outstanding, disappointing, gripping, predictable', 'Dirígete al lector: "If you enjoy thrillers, this is the film for you."']
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
        tips: ['Incluye detalles sensoriales: taste, smell, atmosphere', 'Sé equilibrado — menciona tanto lo positivo como lo negativo', 'Termina con una recomendación clara']
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
        tips: ['Menciona el género: thriller, romance, science fiction, biography...', 'Compara con otros libros si es útil: "Unlike most novels of this type..."', 'Usa comillas para citar frases memorables del libro']
      }
    ]
  },
  {
    type: 'Report',
    icon: '📊',
    desc: 'Escribe de forma formal con secciones y recomendaciones',
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
        tips: ['Usa subtítulos: Introduction, Current Situation, Recommendations', 'Tono formal y objetivo — evita opiniones personales excesivas', 'Usa el pasivo: "It has been suggested that... / Students were asked..."']
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
        tips: ['Sé específico con tus recomendaciones: "The council should invest in..."', 'Usa lenguaje formal: Furthermore, In addition, It is recommended that...', 'Incluye datos o ejemplos para apoyar tus sugerencias']
      },
      {
        id: 'b2_w_report_3',
        title: 'Student Free Time',
        task: `Your teacher has asked you to write a report on the most popular ways students in your school spend their free time, and to suggest how the school could better support these activities.

Write 140–190 words.`,
        tips: ['Estructura en secciones claras con subtítulos', 'Presenta los datos de forma objetiva antes de hacer recomendaciones', 'Termina con una conclusión breve que resuma tus sugerencias']
      }
    ]
  },
  {
    type: 'Formal Letter / Email',
    icon: '✉️',
    desc: 'Escribe con tono formal para un propósito concreto',
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
        tips: ['Empieza con: Dear Sir/Madam, y termina con: Yours faithfully,', 'Usa frases formales de petición: I would be grateful if you could...', 'Organiza en párrafos según los tres puntos del enunciado']
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
        tips: ['Tono firme pero educado — no uses lenguaje agresivo', 'Usa: I am writing to complain about... / I would like to request...', 'Sé específico sobre lo que quieres: refund, replacement, apology']
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
        tips: ['Empieza con: Dear Editor,', 'Cita el artículo: "In your recent article, it was suggested that..."', 'Usa lenguaje persuasivo: It is important to consider... / In reality...']
      }
    ]
  },
  {
    type: 'Informal Letter / Email',
    icon: '💬',
    desc: 'Escribe a un amigo con tono natural y cercano',
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
        tips: ['Usa un saludo informal: Hi [name]! / Hey!', 'Incluye lenguaje coloquial: It was absolutely amazing! / I couldn\'t believe it when...', 'Termina de forma amistosa: Can\'t wait to hear from you! / Write back soon!']
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
        tips: ['Sé específico y personal: "You have to try the food at..."', 'Usa imperativos amistosos: Make sure you visit... / Don\'t miss...', 'Añade tu propia experiencia para hacer el email más auténtico']
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
        tips: ['Empieza reconociendo la situación de tu amigo: "I totally understand why you\'re unsure..."', 'Usa lenguaje de consejo: If I were you... / Have you thought about...?', 'Sé honesto pero comprensivo — es un email a un amigo']
      }
    ]
  }
];