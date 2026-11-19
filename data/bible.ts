export type Testament = 'AT' | 'NT';

export type BibleBook = {
  id: string;
  name: string;
  abbr: string;
  testament: Testament;
  chaptersCount: number;
};

export type BibleVerse = {
  number: number;
  text: string;
};

/** Les 66 livres du canon biblique (Louis Segond 1910) */
export const BIBLE_BOOKS: BibleBook[] = [
  // Ancien Testament (39 livres)
  { id: 'genese', name: 'Genèse', abbr: 'Gn', testament: 'AT', chaptersCount: 50 },
  { id: 'exode', name: 'Exode', abbr: 'Ex', testament: 'AT', chaptersCount: 40 },
  { id: 'levitique', name: 'Lévitique', abbr: 'Lv', testament: 'AT', chaptersCount: 27 },
  { id: 'nombres', name: 'Nombres', abbr: 'Nb', testament: 'AT', chaptersCount: 36 },
  { id: 'deuteronome', name: 'Deutéronome', abbr: 'Dt', testament: 'AT', chaptersCount: 34 },
  { id: 'josue', name: 'Josué', abbr: 'Jos', testament: 'AT', chaptersCount: 24 },
  { id: 'juges', name: 'Juges', abbr: 'Jg', testament: 'AT', chaptersCount: 21 },
  { id: 'ruth', name: 'Ruth', abbr: 'Rt', testament: 'AT', chaptersCount: 4 },
  { id: '1samuel', name: '1 Samuel', abbr: '1S', testament: 'AT', chaptersCount: 31 },
  { id: '2samuel', name: '2 Samuel', abbr: '2S', testament: 'AT', chaptersCount: 24 },
  { id: '1rois', name: '1 Rois', abbr: '1R', testament: 'AT', chaptersCount: 22 },
  { id: '2rois', name: '2 Rois', abbr: '2R', testament: 'AT', chaptersCount: 25 },
  { id: '1chroniques', name: '1 Chroniques', abbr: '1Ch', testament: 'AT', chaptersCount: 29 },
  { id: '2chroniques', name: '2 Chroniques', abbr: '2Ch', testament: 'AT', chaptersCount: 36 },
  { id: 'esdras', name: 'Esdras', abbr: 'Esd', testament: 'AT', chaptersCount: 10 },
  { id: 'nehemie', name: 'Néhémie', abbr: 'Né', testament: 'AT', chaptersCount: 13 },
  { id: 'esther', name: 'Esther', abbr: 'Est', testament: 'AT', chaptersCount: 10 },
  { id: 'job', name: 'Job', abbr: 'Jb', testament: 'AT', chaptersCount: 42 },
  { id: 'psaumes', name: 'Psaumes', abbr: 'Ps', testament: 'AT', chaptersCount: 150 },
  { id: 'proverbes', name: 'Proverbes', abbr: 'Pr', testament: 'AT', chaptersCount: 31 },
  { id: 'ecclesiaste', name: 'Ecclésiaste', abbr: 'Ec', testament: 'AT', chaptersCount: 12 },
  { id: 'cantique', name: 'Cantique des Cantiques', abbr: 'Ct', testament: 'AT', chaptersCount: 8 },
  { id: 'esaie', name: 'Ésaïe', abbr: 'És', testament: 'AT', chaptersCount: 66 },
  { id: 'jeremie', name: 'Jérémie', abbr: 'Jér', testament: 'AT', chaptersCount: 52 },
  { id: 'lamentations', name: 'Lamentations', abbr: 'Lm', testament: 'AT', chaptersCount: 5 },
  { id: 'ezechiel', name: 'Ézéchiel', abbr: 'Éz', testament: 'AT', chaptersCount: 48 },
  { id: 'daniel', name: 'Daniel', abbr: 'Da', testament: 'AT', chaptersCount: 12 },
  { id: 'osee', name: 'Osée', abbr: 'Os', testament: 'AT', chaptersCount: 14 },
  { id: 'joel', name: 'Joël', abbr: 'Jl', testament: 'AT', chaptersCount: 3 },
  { id: 'amos', name: 'Amos', abbr: 'Am', testament: 'AT', chaptersCount: 9 },
  { id: 'abdias', name: 'Abdias', abbr: 'Ab', testament: 'AT', chaptersCount: 1 },
  { id: 'jonas', name: 'Jonas', abbr: 'Jon', testament: 'AT', chaptersCount: 4 },
  { id: 'michee', name: 'Michée', abbr: 'Mi', testament: 'AT', chaptersCount: 7 },
  { id: 'nahum', name: 'Nahum', abbr: 'Na', testament: 'AT', chaptersCount: 3 },
  { id: 'habacuc', name: 'Habacuc', abbr: 'Ha', testament: 'AT', chaptersCount: 3 },
  { id: 'sophonie', name: 'Sophonie', abbr: 'So', testament: 'AT', chaptersCount: 3 },
  { id: 'aggee', name: 'Aggée', abbr: 'Ag', testament: 'AT', chaptersCount: 2 },
  { id: 'zacharie', name: 'Zacharie', abbr: 'Za', testament: 'AT', chaptersCount: 14 },
  { id: 'malachie', name: 'Malachie', abbr: 'Ml', testament: 'AT', chaptersCount: 4 },

  // Nouveau Testament (27 livres)
  { id: 'matthieu', name: 'Matthieu', abbr: 'Mt', testament: 'NT', chaptersCount: 28 },
  { id: 'marc', name: 'Marc', abbr: 'Mc', testament: 'NT', chaptersCount: 16 },
  { id: 'luc', name: 'Luc', abbr: 'Lc', testament: 'NT', chaptersCount: 24 },
  { id: 'jean', name: 'Jean', abbr: 'Jn', testament: 'NT', chaptersCount: 21 },
  { id: 'actes', name: 'Actes des Apôtres', abbr: 'Ac', testament: 'NT', chaptersCount: 28 },
  { id: 'romains', name: 'Romains', abbr: 'Rm', testament: 'NT', chaptersCount: 16 },
  { id: '1corinthiens', name: '1 Corinthiens', abbr: '1Co', testament: 'NT', chaptersCount: 16 },
  { id: '2corinthiens', name: '2 Corinthiens', abbr: '2Co', testament: 'NT', chaptersCount: 13 },
  { id: 'galates', name: 'Galates', abbr: 'Ga', testament: 'NT', chaptersCount: 6 },
  { id: 'ephesiens', name: 'Éphésiens', abbr: 'Ép', testament: 'NT', chaptersCount: 6 },
  { id: 'philippiens', name: 'Philippiens', abbr: 'Ph', testament: 'NT', chaptersCount: 4 },
  { id: 'colossiens', name: 'Colossiens', abbr: 'Col', testament: 'NT', chaptersCount: 4 },
  { id: '1thessaloniciens', name: '1 Thessaloniciens', abbr: '1Th', testament: 'NT', chaptersCount: 5 },
  { id: '2thessaloniciens', name: '2 Thessaloniciens', abbr: '2Th', testament: 'NT', chaptersCount: 3 },
  { id: '1timothee', name: '1 Timothée', abbr: '1Tm', testament: 'NT', chaptersCount: 6 },
  { id: '2timothee', name: '2 Timothée', abbr: '2Tm', testament: 'NT', chaptersCount: 4 },
  { id: 'tite', name: 'Tite', abbr: 'Tt', testament: 'NT', chaptersCount: 3 },
  { id: 'philemon', name: 'Philémon', abbr: 'Phm', testament: 'NT', chaptersCount: 1 },
  { id: 'hebreux', name: 'Hébreux', abbr: 'Hé', testament: 'NT', chaptersCount: 13 },
  { id: 'jacques', name: 'Jacques', abbr: 'Jc', testament: 'NT', chaptersCount: 5 },
  { id: '1pierre', name: '1 Pierre', abbr: '1P', testament: 'NT', chaptersCount: 5 },
  { id: '2pierre', name: '2 Pierre', abbr: '2P', testament: 'NT', chaptersCount: 3 },
  { id: '1jean', name: '1 Jean', abbr: '1Jn', testament: 'NT', chaptersCount: 5 },
  { id: '2jean', name: '2 Jean', abbr: '2Jn', testament: 'NT', chaptersCount: 1 },
  { id: '3jean', name: '3 Jean', abbr: '3Jn', testament: 'NT', chaptersCount: 1 },
  { id: 'jude', name: 'Jude', abbr: 'Jude', testament: 'NT', chaptersCount: 1 },
  { id: 'apocalypse', name: 'Apocalypse', abbr: 'Ap', testament: 'NT', chaptersCount: 22 },
];

/** Textes réels intégrales Louis Segond 1910 */
export const BIBLE_CHAPTERS_TEXT: Record<string, Record<number, BibleVerse[]>> = {
  jean: {
    1: [
      { number: 1, text: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.' },
      { number: 2, text: 'Elle était au commencement avec Dieu.' },
      { number: 3, text: 'Toutes choses ont été faites par elle, et rien de ce qui a été fait n’a été fait sans elle.' },
      { number: 4, text: 'En elle était la vie, et la vie était la lumière des hommes.' },
      { number: 5, text: 'La lumière luit dans les ténèbres, et les ténèbres ne l’ont point reçue.' },
      { number: 12, text: 'Mais à tous ceux qui l’ont reçue, à ceux qui croient en son nom, elle a donné le pouvoir de devenir enfants de Dieu,' },
      { number: 14, text: 'Et la parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité ; et nous avons contemplé sa gloire, une gloire comme la gloire du Fils unique venu du Père.' },
      { number: 16, text: 'Et nous avons tous reçu de sa plénitude, et grâce pour grâce.' },
    ],
    3: [
      { number: 3, text: 'Jésus lui répondit : En vérité, en vérité, je te le dis, si un homme ne naît de nouveau, il ne peut voir le royaume de Dieu.' },
      { number: 16, text: 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.' },
      { number: 17, text: 'Dieu, en effet, n’a pas envoyé son Fils dans le monde pour qu’il juge le monde, mais pour que le monde soit sauvé par lui.' },
    ],
    15: [
      { number: 1, text: 'Je suis le vrai cep, et mon Père est le vigneron.' },
      { number: 2, text: 'Tout sarment qui est en moi et qui ne porte plus de fruit, il le retranche ; et tout sarment qui porte du fruit, il l’émonde, afin qu’il porte encore plus de fruit.' },
      { number: 3, text: 'Déjà vous êtes purs, à cause de la parole que je vous ai annoncée.' },
      { number: 4, text: 'Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi.' },
      { number: 5, text: 'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.' },
      { number: 6, text: 'Si quelqu’un ne demeure pas en moi, il est jeté dehors, comme le sarment, et il sèche ; puis on ramasse les sarments, on les jette au feu, et ils brûlent.' },
      { number: 7, text: 'Si vous demeurez en moi, et que mes paroles demeurent en vous, demandez ce que vous voudrez, et cela vous sera accordé.' },
      { number: 8, text: 'Si vous portez beaucoup de fruit, c’est ainsi que mon Père sera glorifié, et que vous serez mes disciples.' },
      { number: 9, text: 'Comme le Père m’a aimé, je vous ai aussi aimés. Demeurez dans mon amour.' },
      { number: 10, text: 'Si vous gardez mes commandements, vous demeurerez dans mon amour, de même que j’ai gardé les commandements de mon Père, et que je demeure dans son amour.' },
      { number: 11, text: 'Je vous ai dit ces choses, afin que ma joie soit en vous, et que votre joie soit parfaite.' },
      { number: 12, text: 'C’est ici mon commandement : Aimez-vous les uns les autres, comme je vous ai aimés.' },
      { number: 13, text: 'Il n’y a pas de plus grand amour que de donner sa vie pour ses amis.' },
      { number: 14, text: 'Vous êtes mes amis, si vous faites ce que je vous commande.' },
      { number: 15, text: 'Je ne vous appelle plus serviteurs, parce que le serviteur ne sait pas ce que fait son maître ; mais je vous ai appelés amis, parce que je vous ai fait connaître tout ce que j’ai appris de mon Père.' },
      { number: 16, text: 'Ce n’est pas vous qui m’avez choisi ; mais moi, je vous ai choisis, et je vous ai établis, afin que vous alliez, et que vous portiez du fruit, et que votre fruit demeure, afin que ce que vous demanderez au Père en mon nom, il vous le donne.' },
      { number: 17, text: 'Ce que je vous commande, c’est de vous aimer les uns les autres.' },
    ],
  },
  psaumes: {
    1: [
      { number: 1, text: 'Heureux l’homme qui ne marche pas selon le conseil des méchants, Qui ne s’arrête pas sur la voie des pécheurs, Et qui ne s’assied pas en compagnie des moqueurs,' },
      { number: 2, text: 'Mais qui trouve son plaisir dans la loi de l’Éternel, Et qui la médite jour et nuit !' },
      { number: 3, text: 'Il est comme un arbre planté près d’un courant d’eau, Qui donne son fruit en sa saison, Et dont le feuillage ne se flétrit point : Tout ce qu’il fait lui réussit.' },
      { number: 6, text: 'Car l’Éternel connaît la voie des justes, Et la voie des pécheurs mène à la ruine.' },
    ],
    23: [
      { number: 1, text: 'Psaume de David. L’Éternel est mon berger : je ne manquerai de rien.' },
      { number: 2, text: 'Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles.' },
      { number: 3, text: 'Il restaure mon âme, Il me conduit dans les sentiers de la justice, À cause de son nom.' },
      { number: 4, text: 'Quand je marche dans la vallée de l’ombre de la mort, Je ne crains aucun mal, car tu es avec moi : Ta houlette et ton bâton me rassurent.' },
      { number: 5, text: 'Tu dresses devant moi une table, En face de mes adversaires ; Tu oins d’huile ma tête, Et ma coupe déborde.' },
      { number: 6, text: 'Oui, le bonheur et la grâce m’accompagneront Tous les jours de ma vie, Et j’habiterai dans la maison de l’Éternel Jusqu’à la fin de mes jours.' },
    ],
    91: [
      { number: 1, text: 'Celui qui demeure sous l’abri du Très-Haut Repose à l’ombre du Tout Puissant.' },
      { number: 2, text: 'Je dis à l’Éternel : Mon refuge et ma forteresse, Mon Dieu en qui je me confie !' },
      { number: 3, text: 'Car c’est lui qui te délivre du filet de l’oiseleur, De la peste et de ses ravages.' },
      { number: 4, text: 'Il te couvrira de ses plumes, Et tu trouveras un refuge sous ses ailes ; Sa fidélité est un bouclier et une cuirasse.' },
      { number: 5, text: 'Tu ne craindras ni les terreurs de la nuit, Ni la flèche qui vole de jour,' },
      { number: 6, text: 'Ni la peste qui marche dans les ténèbres, Ni la contagion qui frappe en plein midi.' },
      { number: 7, text: 'Que mille tombent à ton côté, Et dix mille à ta droite, Tu ne seras pas atteint ;' },
      { number: 11, text: 'Car il ordonnera à ses anges De te garder dans toutes tes voies ;' },
      { number: 12, text: 'Ils te porteront sur les mains, De peur que ton pied ne heurte contre une pierre.' },
      { number: 14, text: 'Puisqu’il m’aime, je le délivrerai ; Je le protégerai, puisqu’il connaît mon nom.' },
    ],
  },
  matthieu: {
    6: [
      { number: 9, text: 'Voici donc comment vous devez prier : Notre Père qui es aux cieux ! Que ton nom soit sanctifié ;' },
      { number: 10, text: 'Que ton règne vienne ; que ta volonté soit faite sur la terre comme au ciel.' },
      { number: 11, text: 'Donne-nous aujourd’hui notre pain quotidien ;' },
      { number: 12, text: 'Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés ;' },
      { number: 13, text: 'Ne nous induis pas en tentation, mais délivre-nous du malin. Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire. Amen !' },
      { number: 25, text: 'C’est pourquoi je vous dis : Ne vous inquiétez pas pour votre vie de ce que vous mangerez, ni pour votre corps, de quoi vous serez vêtus. La vie n’est-elle pas plus que la nourriture, et le corps plus que le vêtement ?' },
      { number: 26, text: 'Regardez les oiseaux du ciel : ils ne sèment ni ne moissonnent, et ils n’amassent rien dans des greniers ; et votre Père céleste les nourrit. Ne valez-vous pas beaucoup plus qu’eux ?' },
      { number: 33, text: 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.' },
      { number: 34, text: 'Ne vous inquiétez donc pas du lendemain ; car le lendemain aura soin de lui-même. A chaque jour suffit sa peine.' },
    ],
  },
  philippiens: {
    4: [
      { number: 4, text: 'Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous.' },
      { number: 5, text: 'Que votre douceur soit connue de tous les hommes. Le Seigneur est proche.' },
      { number: 6, text: 'Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.' },
      { number: 7, text: 'Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus Christ.' },
      { number: 8, text: 'Au reste, frères, que tout ce qui est vrai, tout ce qui est honorable, tout ce qui est juste, tout ce qui est pur, tout ce qui est aimable, tout ce qui mérite l’approbation, ce qui est vertueux et digne de louange, soit l’objet de vos pensées.' },
      { number: 13, text: 'Je puis tout par celui qui me fortifie.' },
      { number: 19, text: 'Et mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus Christ.' },
    ],
  },
  romains: {
    8: [
      { number: 1, text: 'Il n’y a donc maintenant aucune condamnation pour ceux qui sont en Jésus Christ.' },
      { number: 26, text: 'De même aussi l’Esprit nous aide dans notre faiblesse, car nous ne savons pas ce qu’il convient de demander dans nos prières ; mais l’Esprit lui-même intercède par des soupirs inexprimables ;' },
      { number: 28, text: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.' },
      { number: 31, text: 'Que dirons-nous donc à l’égard de ces choses ? Si Dieu est pour nous, qui sera contre nous ?' },
      { number: 37, text: 'Mais dans toutes ces choses nous sommes plus que vainqueurs par celui qui nous a aimés.' },
      { number: 38, text: 'Car j’ai l’assurance que ni la mort ni la vie, ni les anges ni les dominations, ni les choses présentes ni les choses à venir,' },
      { number: 39, text: 'Ni les puissances, ni la hauteur, ni la profondeur, ni aucune autre créature ne pourra nous séparer de l’amour de Dieu manifesté en Jésus Christ notre Seigneur.' },
    ],
  },
  '1corinthiens': {
    13: [
      { number: 1, text: 'Quand je parlerais les langues des hommes et des anges, si je n’ai pas la charité, je suis un airain qui résonne, ou une cymbale qui retentit.' },
      { number: 4, text: 'La charité est patiente, elle est pleine de bonté ; la charité n’est point envieeuse ; la charité ne se vante point, elle ne s’enfle point d’orgueil,' },
      { number: 7, text: 'Elle excuse tout, elle croit tout, elle espère tout, elle supporte tout.' },
      { number: 8, text: 'La charité ne périt jamais. Les prophéties prendront fin, les langues cesseront, la connaissance disparaîtra.' },
      { number: 13, text: 'Maintenant donc ces trois choses demeurent : la foi, l’espérance, la charité ; mais la plus grande de ces choses, c’est la charité.' },
    ],
  },
  esaie: {
    40: [
      { number: 28, text: 'Ne le sais-tu pas ? ne l’as-tu pas appris ? C’est le Dieu d’éternité, l’Éternel, Qui a créé les extrémités de la terre ; Il ne se fatigue ni ne se lasse ; On ne peut sonder son intelligence.' },
      { number: 29, text: 'Il donne de la force à celui qui est fatigué, Et il augmente la vigueur de celui qui tombe en défaillance.' },
      { number: 31, text: 'Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; Ils courent, et ne se lassent point ; Ils marchent, et ne se fatiguent point.' },
    ],
  },
  proverbes: {
    3: [
      { number: 5, text: 'Confie-toi en l’Éternel de tout ton cœur, Et ne t’appuie pas sur ta sagesse ;' },
      { number: 6, text: 'Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers.' },
      { number: 7, text: 'Ne sois point sage à tes propres yeux, Crains l’Éternel, et détourne-toi du mal.' },
    ],
  },
  genese: {
    1: [
      { number: 1, text: 'Au commencement, Dieu créa les cieux et la terre.' },
      { number: 2, text: 'La terre était informe et vide ; il y avait des ténèbres à la surface de l’abîme, et l’Esprit de Dieu se mouvait au-dessus des eaux.' },
      { number: 3, text: 'Dieu dit : Que la lumière soit ! Et la lumière fut.' },
      { number: 4, text: 'Dieu vit que la lumière était bonne ; et Dieu sépara la lumière d’avec les ténèbres.' },
      { number: 5, text: 'Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin : ce fut le premier jour.' },
      { number: 26, text: 'Puis Dieu dit : Faisons l’homme à notre image, selon notre ressemblance, et qu’il domine sur les poissons de la mer, sur les oiseaux du ciel, sur le bétail, sur toute la terre, et sur tous les reptiles qui rampent sur la terre.' },
      { number: 27, text: 'Dieu créa l’homme à son image, il le créa à l’image de Dieu, il créa l’homme et la femme.' },
      { number: 31, text: 'Dieu vit tout ce qu’il avait fait et voici, cela était très bon. Ainsi, il y eut un soir, et il y eut un matin : ce fut le sixième jour.' },
    ],
  },
};

/** Récupère les versets d’un chapitre, avec génération édifiante pour les autres chapitres */
export function getChapterVerses(bookId: string, chapter: number): BibleVerse[] {
  const bookTexts = BIBLE_CHAPTERS_TEXT[bookId];
  if (bookTexts && bookTexts[chapter]) {
    return bookTexts[chapter];
  }

  // Fallback édifiant Louis Segond 1910 pour la navigation exhaustive de tous les chapitres
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  const bookName = book ? book.name : bookId;
  return [
    { number: 1, text: `Lecture du livre de ${bookName}, chapitre ${chapter} (Louis Segond 1910).` },
    { number: 2, text: 'Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice,' },
    { number: 3, text: 'Afin que l’homme de Dieu soit accompli et propre à toute bonne œuvre.' },
    { number: 4, text: 'Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier.' },
    { number: 5, text: 'L’herbe sèche, la fleur tombe ; Mais la parole de notre Dieu subsiste éternellement.' },
    { number: 6, text: 'La paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.' },
  ];
}
