export const WRITING_PROMPTS_B1 = [
  {
    type: 'Email',
    icon: '💬',
    desc: 'Responde de forma interactiva siguiendo las indicaciones del mensaje',
    prompts: [
      {
        id: 'b1_w_email_1',
        title: 'Holiday Plans',
        task: `Read this email from your English friend Chris.

From: Chris
Subject: Holiday plans!
"I'm so glad our exams are finished! Tell me about your plans for the summer. Where are you going to go? Who are you going with? What do you want to do there?"

Write an email to Chris answering all the questions.
Write about 100 words.`,
        tips: ['Usa un saludo informal y cercano: Hi Chris, / Dear Chris,', 'Responde obligatoriamente a las tres preguntas del mensaje', 'Usa estructuras de futuro sencillas: I\'m going to go to..., I\'m travelling with...']
      },
      {
        id: 'b1_w_email_2',
        title: 'Birthday Party Invitation',
        task: `Read this email from your classmate Alex.

From: Alex
Subject: My Birthday Party!
"I'm having a party next Saturday afternoon at my house! Can you come? Would you prefer a barbecue in the garden or a pizza party inside? Let me know if you need a ride."

Write an email to Alex.
Write about 100 words.`,
        tips: ['Acepta la invitación mostrando entusiasmo: I\'d love to come!', 'Elige claramente una de las dos opciones propuestas', 'Usa conectores sencillos para unir tus ideas: because, so, but']
      },
      {
        id: 'b1_w_email_3',
        title: 'New Sports Club',
        task: `Read this email from your school friend Taylor.

From: Taylor
Subject: Sports Club
"Our school wants to start a new sports club next month. Which sport do you think is best for students? How often should we practice? Do you want to join it with me?"

Write an email to Taylor.
Write about 100 words.`,
        tips: ['Expresa tu opinión directamente: I think... / In my opinion...', 'Propón una frecuencia de tiempo clara: twice a week, on Mondays', 'Despídete con una frase amistosa: See you soon! / Best, [Your Name]']
      }
    ]
  },
  {
    type: 'Article',
    icon: '📰',
    desc: 'Escribe para una revista o web escolar con tono personal y entretenido',
    prompts: [
      {
        id: 'b1_w_article_1',
        title: 'My Favourite Hobby',
        task: `You see this notice on an international student website.

Articles wanted!
MY FAVOURITE HOBBY
What is your favourite hobby? Why did you start doing it and how often do you practice? Is it expensive?
Write an article answering these questions.

Write about 100 words.`,
        tips: ['Pon un título corto y llamativo al principio', 'Intenta captar la atención del lector con una pregunta: Do you have a favourite hobby?', 'Usa adjetivos descriptivos de nivel B1: exciting, relaxing, active, fun']
      },
      {
        id: 'b1_w_article_2',
        title: 'The Best Place to Live',
        task: `You see this notice in an English magazine for teenagers.

Articles wanted!
THE PERFECT PLACE
Where is the best town or city to live in your country? What can young people do there? Explain why you like it so much.
Write an article for our magazine.

Write about 100 words.`,
        tips: ['Describe el lugar usando frases claras de localización: It is located in..., It is near...', 'Usa verbos modales de posibilidad y consejo: You can visit, You should see', 'Organiza el contenido dividiéndolo en dos o tres párrafos cortos']
      },
      {
        id: 'b1_w_article_3',
        title: 'Keeping Fit and Healthy',
        task: `You see this notice on your school noticeboard.

Articles wanted!
HEALTHY LIVING
Is it easy for teenagers to stay healthy nowadays? What type of food and exercise are best for young people? Give your advice!
Write an article answering these questions.

Write about 100 words.`,
        tips: ['Usa verbos modales de recomendación: should, shouldn\'t', 'Utiliza vocabulario variado sobre comida y deportes de nivel B1', 'Termina con una conclusión breve o un mensaje de ánimo al lector']
      }
    ]
  },
  {
    type: 'Story',
    icon: '📖',
    desc: 'Crea una narración que continúe y dé sentido a la frase inicial obligatoria',
    prompts: [
      {
        id: 'b1_w_story_1',
        title: 'The Unexpected Message',
        task: `Your English teacher has asked you to write a story. Your story must begin with this sentence:

"As soon as I turned on my mobile phone, I saw a very strange message."

Write your story.
Write about 100 words.`,
        tips: ['Escribe la historia en primera persona ("I") porque así empieza la frase obligatoria', 'Usa los tiempos del pasado correctamente: past simple, past continuous y past perfect', 'Añade adverbios de tiempo para secuenciar las acciones: suddenly, then, after that, in the end']
      },
      {
        id: 'b1_w_story_2',
        title: 'A Great Day Out',
        task: `Your English teacher has asked you to write a story. Your story must begin with this sentence:

"When the train arrived at the station, Sam felt very excited."

Write your story.
Write about 100 words.`,
        tips: ['Escribe la historia en tercera persona ("he/she/they") ya que el protagonista es Sam', 'Describe brevemente cómo se siente el personaje o qué ve al bajar del tren', 'Asegúrate de que la historia tenga un principio, un nudo y un desenlace claro']
      },
      {
        id: 'b1_w_story_3',
        title: 'Lost in the City',
        task: `Your English teacher has asked you to write a story. Your story must begin with this sentence:

"I looked at the map, but I realized I was in the wrong place."

Write your story.
Write about 100 words.`,
        tips: ['Plantea un pequeño problema (estar perdido) y cuenta cómo se resolvió', 'Usa conectores temporales para dar fluidez: while, as soon as, when', 'Controla el número de palabras para no alargarte demasiado en la descripción']
      }
    ]
  },
  {
    type: 'Review',
    icon: '⭐',
    desc: 'Evalúa un producto cultural o lugar dando tu opinión y recomendación',
    prompts: [
      {
        id: 'b1_w_review_1',
        title: 'A Movie Review',
        task: `You see this notice on an English website for students.

Reviews wanted!
A MOVIE I LOVE
Write a review of a film you watched recently. What is the story about? Why did you enjoy it? Who do you recommend it to?

Write your review.
Write about 100 words.`,
        tips: ['Menciona el género cinematográfico al principio: comedy, action film, sci-fi, horror', 'Usa adjetivos de opinión: entertaining, interesting, excellent, brilliant', 'No cuentes el final de la película para no arruinar la sorpresa (no spoilers)']
      },
      {
        id: 'b1_w_review_2',
        title: 'Great Places to Eat',
        task: `Write a review of a restaurant or café you visited recently for a local tourist guide website. 
Describe the type of food they serve, what the place looks like, and explain why you recommend it.

Write your review.
Write about 100 words.`,
        tips: ['Usa vocabulario sobre comida y servicio: delicious, tasty, friendly staff, fast service', 'Menciona si el precio es adecuado: cheap, expensive, reasonable price', 'Termina recomendando el lugar de forma directa: If you love pizza, you must go there!']
      },
      {
        id: 'b1_w_review_3',
        title: 'A Good Book',
        task: `Your teacher has asked you to write a review of a book you have read recently for the school library blog. 
Say what the book is about and explain why you think other students would enjoy reading it.

Write your review.
Write about 100 words.`,
        tips: ['Resume la trama principal en una o dos frases sin dar demasiados detalles', 'Usa la estructura condicional: If you like adventure stories, you will love this book', 'Menciona el nombre del autor o de los personajes principales si los recuerdas']
      }
    ]
  }
];