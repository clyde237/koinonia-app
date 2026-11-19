import { homeImages } from './home';

export type BreakfastFormat = 'video' | 'text' | 'both';

export type BreakfastItem = {
  id: string;
  title: string;
  date: string;
  formattedDate: string;
  duration: string;
  readTime: string;
  format: BreakfastFormat;
  image: any;
  scriptureRef: string;
  scriptureText: string;
  author: string;
  tags: string[];
  summary: string;
  text: string;
  prayer: string;
  videoDurationSeconds: number;
};

export const allBreakfasts: BreakfastItem[] = [
  {
    id: 'peace',
    title: 'La paix au milieu du bruit',
    date: 'Aujourd’hui, 19 nov.',
    formattedDate: 'Jeudi 19 novembre 2026',
    duration: '12 min',
    readTime: '6 min de lecture',
    format: 'both',
    image: homeImages.dawn,
    scriptureRef: 'Jean 15.4-5',
    scriptureText: '« Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi. »',
    author: 'Pasteur Selwyn',
    tags: ['Paix', 'Communion', 'Silence'],
    summary: 'Apprendre à faire silence dans un quotidien bruyant pour entendre le murmure de la présence divine.',
    text: `Au milieu des sollicitations incessantes, des notifications et des urgences du quotidien, notre esprit peut facilement devenir encombré. Nous courons après le temps, nous inquiétons pour le lendemain, et nous oublions la source même de notre paix.

Jésus nous adresse cette invitation fondamentale : « Demeurez en moi ». Demeurer n’est pas un effort anxieux, c’est une posture de repos intérieur. C’est choisir, même pendant quelques minutes au lever du jour, de déposer nos fardeaux et de nous rappeler que nous ne sommes pas seuls.

La paix que le Seigneur communique ne dépend pas de l’absence de problèmes extérieurs. Elle naît de l’assurance de sa présence constante à nos côtés. Dès aujourd’hui, lorsque vous sentirez l’agitation monter, prenez une profonde inspiration, fermez les yeux un court instant et redites dans votre cœur : « Seigneur, je demeure en toi ».`,
    prayer: `Seigneur, je dépose entre tes mains toutes les agitations de cette journée. Remplis mon esprit de ta sainte paix et apprends-moi à demeurer attaché à toi en chaque circonstance. Amen.`,
    videoDurationSeconds: 735,
  },
  {
    id: 'rest',
    title: 'Le repos véritable en Dieu',
    date: 'Hier, 18 nov.',
    formattedDate: 'Mercredi 18 novembre 2026',
    duration: '8 min',
    readTime: '5 min de lecture',
    format: 'both',
    image: homeImages.rest,
    scriptureRef: 'Matthieu 11.28-30',
    scriptureText: '« Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. Prenez mon joug sur vous et recevez mes instructions... »',
    author: 'Frère Philippe',
    tags: ['Repos', 'Fardeau', 'Confiance'],
    summary: 'Décharger son cœur devant le Père pour recevoir un renouvellement intérieur.',
    text: `Le monde nous pousse constamment à la performance et à l’autosuffisance. Mais Dieu sait combien nos cœurs peuvent être fatigués et accablés sous le poids des responsabilités.

Prendre du repos en Dieu, ce n’est pas simplement dormir ou cesser ses activités professionnelles. C’est relâcher la tension spirituelle, accepter que nous ne pouvons pas tout contrôler et remettre le gouvernail de nos vies entre ses mains aimantes.

Son joug est doux et son fardeau léger parce qu’Il porte l’essentiel avec nous. Abandonnez-lui vos inquiétudes ce matin.`,
    prayer: `Père céleste, je viens à toi avec ma fatigue et mes soucis. Merci de porter ce qui m’écrase et d’accorder à mon âme le repos véritable dont elle a besoin. Amen.`,
    videoDurationSeconds: 510,
  },
  {
    id: 'faith',
    title: 'Marcher par la foi, un pas après l’autre',
    date: '17 nov. 2026',
    formattedDate: 'Mardi 17 novembre 2026',
    duration: '10 min',
    readTime: '4 min de lecture',
    format: 'both',
    image: homeImages.bible,
    scriptureRef: '2 Corinthiens 5.7',
    scriptureText: '« Car nous marchons par la foi et non par la vue. »',
    author: 'Équipe Koinonia',
    tags: ['Foi', 'Direction', 'Confiance'],
    summary: 'Comment avancer avec assurance lorsque le chemin à venir n’est pas encore totalement tracé.',
    text: `La foi ne consiste pas à connaître toutes les étapes du voyage à l’avance, mais à faire confiance au Guide. Quand nous attendons d’avoir toutes les certitudes humaines pour avancer, nous restons immobiles.

Marcher par la foi exige de poser un pas même dans le brouillard, avec la conviction que la Parole de Dieu est une lampe à nos pieds et une lumière sur notre sentier.

Chaque petit acte d’obéissance, chaque parole d’encouragement donnée, chaque choix d’intégrité est une démonstration concrète de votre foi vivante.`,
    prayer: `Seigneur, fortifie ma foi. Quand mes yeux physiques ne voient pas d’issue, ouvre les yeux de mon cœur pour contempler ta fidélité infaillible. Amen.`,
    videoDurationSeconds: 620,
  },
  {
    id: 'morning',
    title: 'Un nouveau matin, de nouvelles bontés',
    date: '16 nov. 2026',
    formattedDate: 'Lundi 16 novembre 2026',
    duration: '7 min',
    readTime: '4 min de lecture',
    format: 'both',
    image: homeImages.dawn,
    scriptureRef: 'Lamentations 3.22-23',
    scriptureText: '« Les bontés de l’Éternel ne sont point épuisées, ses compassions ne sont point à leur terme ; elles se renouvellent chaque matin. O que ta fidélité est grande ! »',
    author: 'Sœur Claire',
    tags: ['Grâce', 'Nouveau départ', 'Reconnaissance'],
    summary: 'Saisir la grâce d’un nouveau départ sans regarder aux échecs de la veille.',
    text: `Peu importe ce qui s’est passé hier, les erreurs commises ou les déceptions vécues : ce matin est une page blanche offerte par la grâce de Dieu.

Les compassions du Seigneur ne s’épuisent jamais. Elles sont fraîches à l’aube de chaque nouvelle journée. Vous n’avez pas à traîner la culpabilité ou le découragement du passé.

Accueillez ce matin avec un cantique de louange dans votre cœur, car Dieu prépare de bonnes œuvres pour vous aujourd’hui.`,
    prayer: `Merci, Seigneur, pour tes bontés renouvelées en ce jour. Je reçois ton pardon, ta grâce et ton souffle de vie pour avancer avec joie et espérance. Amen.`,
    videoDurationSeconds: 440,
  },
  {
    id: 'shepherd',
    title: 'L’Éternel est mon berger : je ne manque de rien',
    date: '15 nov. 2026',
    formattedDate: 'Dimanche 15 novembre 2026',
    duration: '14 min',
    readTime: '6 min de lecture',
    format: 'both',
    image: homeImages.prayer,
    scriptureRef: 'Psaume 23.1-3',
    scriptureText: '« L’Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles. Il restaure mon âme... »',
    author: 'Pasteur Selwyn',
    tags: ['Protection', 'Berger', 'Provision'],
    summary: 'Méditation profonde sur la providence divine et la restauration de notre être intérieur.',
    text: `Dans un monde obsédé par le manque et la peur de l’avenir, David proclame avec assurance : « Je ne manquerai de rien ». Cette certitude ne venait pas d’un compte en banque rempli, mais de la nature même de son Berger.

Le bon Berger sait exactement de quoi sa brebis a besoin : des eaux paisibles pour étancher sa soif, des verts pâturages pour se nourrir, et sa houlette pour la protéger des prédateurs.

Faites confiance à sa conduite bienveillante. Même si vous devez traverser la vallée de l’ombre de la mort, sa présence vous rassure.`,
    prayer: `Mon bon Berger, merci de veiller sur moi avec tant de tendresse. Tu combles mes besoins profonds et tu restaures mon âme. Je choisis de te suivre en toute sécurité. Amen.`,
    videoDurationSeconds: 840,
  },
  {
    id: 'anxiety',
    title: 'Transformer l’inquiétude en prière',
    date: '13 nov. 2026',
    formattedDate: 'Vendredi 13 novembre 2026',
    duration: '11 min',
    readTime: '5 min de lecture',
    format: 'both',
    image: homeImages.candle,
    scriptureRef: 'Philippiens 4.6-7',
    scriptureText: '« Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs... »',
    author: 'Frère Philippe',
    tags: ['Inquiétude', 'Prière', 'Sérénité'],
    summary: 'L’antidote biblique à l’anxiété : la supplication mêlée de reconnaissance sincère.',
    text: `L’inquiétude est comme une chaise à bascule : elle nous donne du mouvement, mais elle ne nous mène nulle part. Pire encore, elle draine notre énergie spirituelle.

L’apôtre Paul nous montre l’antidote : transformer chaque sujet d’angoisse en sujet de prière. Au lieu de ressasser les scénarios catastrophe dans notre tête, parlons-en au Père.

Et n’oublions pas les actions de grâces : remercier Dieu pour ce qu’Il a déjà fait nous donne la certitude qu’Il agira encore.`,
    prayer: `Seigneur Jésus, chaque fois que l’anxiété tente de s’emparer de mes pensées, je choisis de te la remettre. Garde mon cœur et mes pensées dans ta paix inébranlable. Amen.`,
    videoDurationSeconds: 670,
  },
  {
    id: 'strength',
    title: 'Renouveler sa force dans le lieu secret',
    date: '10 nov. 2026',
    formattedDate: 'Mardi 10 novembre 2026',
    duration: '9 min',
    readTime: '5 min de lecture',
    format: 'both',
    image: homeImages.rest,
    scriptureRef: 'Ésaïe 40.29-31',
    scriptureText: '« Il donne de la force à celui qui est fatigué, et il augmente la vigueur de celui qui tombe en défaillance... Mais ceux qui se confient en l’Éternel renouvellent leur force. »',
    author: 'Sœur Claire',
    tags: ['Force', 'Lieu secret', 'Persévérance'],
    summary: 'Comment s’élever au-dessus des tempêtes comme l’aigle en s’attendant patiemment à Dieu.',
    text: `Même les jeunes gens se fatiguent et les héros chancellent, nous rappelle le prophète Ésaïe. La force humaine a ses limites physiologiques et psychologiques.

Ceux qui s’attendent à l’Éternel découvrent une source d’énergie surnaturelle. Comme l’aigle qui déploie ses ailes pour profiter des courants ascendants de la tempête sans battre désespérément des ailes, nous pouvons nous élever portés par le Saint-Esprit.

Le lieu secret de la prière est le centre de recharge de notre âme. Prenez ce temps chaque matin.`,
    prayer: `Saint-Esprit, souffle sur ma vie. Quand mes forces faiblissent, ranime ma vigueur et apprends-moi à m’élever dans les hauteurs de ta présence. Amen.`,
    videoDurationSeconds: 580,
  },
  {
    id: 'love',
    title: 'Demeurer dans l’amour parfait du Père',
    date: '7 nov. 2026',
    formattedDate: 'Samedi 7 novembre 2026',
    duration: '13 min',
    readTime: '6 min de lecture',
    format: 'both',
    image: homeImages.community,
    scriptureRef: '1 Jean 4.18-19',
    scriptureText: '« La crainte n’est pas dans l’amour, mais l’amour parfait bannit la crainte... Pour nous, nous l’aimons, parce qu’il nous a aimés le premier. »',
    author: 'Pasteur Selwyn',
    tags: ['Amour', 'Liberté', 'Communion'],
    summary: 'Chasser toute peur du jugement en s’enracinant dans l’amour inconditionnel du Christ.',
    text: `Tant de chrétiens vivent encore sous une atmosphère de crainte : peur d’échouer, peur de déplaire, peur de ne pas être assez pieux.

Pourtant, la Bonne Nouvelle affirme que l’amour parfait de Dieu bannit toute crainte. Nous ne servons pas un maître sévère et distant, mais un Père aimant qui a donné son Fils unique par amour pour nous.

Lorsque vous réalisez à quel point vous êtes profondément aimé, vous êtes libre d’aimer à votre tour ceux qui vous entourent sans attendre de retour.`,
    prayer: `Père, enracine-moi dans ton amour parfait. Que toute peur soit chassée de mon cœur afin que je puisse refléter ta bonté et ta bienveillance autour de moi. Amen.`,
    videoDurationSeconds: 790,
  },
];

export const dailyFeaturedBreakfast = allBreakfasts[0];
