INSERT INTO languages (id, "name", flag) 
VALUES
('en', 'english', '🇬🇧'),
('de', 'german', '🇩🇪'),
('fr', 'french', '🇫🇷'),
('es', 'spanish', '🇪🇸'),
('nl', 'dutch', '🇳🇱'),
('it', 'italian', '🇮🇹'),
('pt', 'portuguese', '🇵🇹'),
('ro', 'romanian', '🇷🇴'),
('se', 'swedish', '🇸🇪'),
('tr', 'turkish', '🇹🇷');


INSERT INTO users (username, password_hash, email, known_language_id, learn_language_id, verified)
VALUES
('Eamon', '$2b$10$YAV5Q1EJQOOxcmtDmFJyi.rQR99hIowQZKEkcqz47L7REvn0EePDS', 'eamon@example.com', 'de', 'en', true),
('Dana', '$2a$10$UVTYPTdo1W/U5cBhkX6s9.T7d5QLzXvNTLS00BGJ2jUcW/MxvFCqO', 'dana@example.com', 'en', 'fr', false);


INSERT INTO texts (user_id, language_id, title, body, ts_config) 
VALUES
(1, 'en', 'The Little Match Girl',
'It was so terribly cold. Snow was falling, and it was almost dark. Evening came on, the last evening of the year. In the cold and gloom a poor little girl, bareheaded and barefoot, was walking through the streets. Of course when she had left her house she''d had slippers on, but what good had they been? They were very big slippers, way too big for her, for they belonged to her mother. The little girl had lost them running across the road, where two carriages had rattled by terribly fast. One slipper she''d not been able to find again, and a boy had run off with the other, saying he could use it very well as a cradle some day when he had children of his own. And so the little girl walked on her naked feet, which were quite red and blue with the cold. In an old apron she carried several packages of matches, and she held a box of them in her hand. No one had bought any from her all day long, and no one had given her a cent.
Shivering with cold and hunger, she crept along, a picture of misery, poor little girl! The snowflakes fell on her long fair hair, which hung in pretty curls over her neck. In all the windows lights were shining, and there was a wonderful smell of roast goose, for it was New Year''s eve. Yes, she thought of that!
In a corner formed by two houses, one of which projected farther out into the street than the other, she sat down and drew up her little feet under her. She was getting colder and colder, but did not dare to go home, for she had sold no matches, nor earned a single cent, and her father would surely beat her. Besides, it was cold at home, for they had nothing over them but a roof through which the wind whistled even though the biggest cracks had been stuffed with straw and rags.',
(SELECT "name" FROM languages AS l WHERE l.id = 'en')::regconfig),
(2, 'fr', 'Dans la « bibliothèque » de l’artiste zimbabwéen Kudzanai Chiurai',
'Lorsque la commissaire Marie Ann Yemsi a commencé à réfléchir à son exposition « Ubuntu, un rêve lucide », qui se tient au Palais de Tokyo à Paris, le nom de Kudzanai Chiurai était en haut de sa liste. Parce que le jeune artiste zimbabwéen « est dans l’audace et la complexité », précise-t-elle. Parce qu’il sait aussi creuser dans les replis de l’histoire pour faire émerger des récits oubliés et les « contre-mémoires ». Né en 1981, un an après l’indépendance de son pays, dans une famille très politisée, Kudzanai Chiurai a fait de l’histoire et des luttes coloniales la matière première d’une œuvre qui se décline dans des peintures, des photos et des films expérimentaux. Partant du constat que les archives du continent sont négligées et d’un accès difficile, il s’est mis à chiner depuis cinq ans les modestes reliques de la résistance à l’occupant britannique.',
(SELECT "name" FROM languages AS l WHERE l.id = 'fr')::regconfig);


INSERT INTO words (language_id, word, ts_config)
VALUES
('en', 'of course', 'english'),
('en', 'hunger', 'english'),
('en', 'across the road', 'english'),
('en', 'all day long', 'english'),
('en', 'snowflakes', 'english'),
('en', 'roast goose', 'english'),
('en', 'bareheaded', 'english'),
('en', 'rattled by', 'english'),
('en', 'carriages', 'english'),
('en', 'New Year''s eve', 'english');


INSERT INTO translations (word_id, target_language_id, translation)
VALUES
(1, 'de', 'natürlich'),
(1, 'de', 'klar doch'),
(2, 'de', 'Hunger'),
(3, 'de', 'gegenüber'),
(3, 'de', 'über die Straße'),
(4, 'de', 'den ganzen Tag'),
(5, 'de', 'Schneeflocken'),
(6, 'de', 'Gänsebraten'),
(7, 'de', 'barhäuptig'),
(8, 'de', 'vorbeigeklappert'),
(9, 'de', 'Wagen'),
(10, 'de', 'Silvester'),
(1, 'fr', 'bien sûr'),
(2, 'fr', 'faim'),
(3, 'fr', 'à travers la route'),
(4, 'fr', 'toute la journée'),
(5, 'fr', 'flocons de neige'),
(6, 'fr', 'oie rôtie'),
(7, 'fr', 'tête nue'),
(8, 'fr', 'ébranlé par'),
(9, 'fr', 'chariots'),
(10, 'fr', 'Réveillon de Nouvel an'),
(8, 'de', 'vorbeigescheppert'),
(8, 'de', 'vorbeigaloppiert');


INSERT INTO users_words (user_id, word_id, word_status, created_at, updated_at)
VALUES
(1, 1, 'learning', '2025-12-01 10:00:00+00', '2025-12-01 10:00:00+00'),
(1, 3, 'familiar', '2025-12-01 10:05:00+00', '2025-12-15 14:30:00+00'),
(1, 5, 'learned',  '2025-12-01 10:10:00+00', '2026-01-10 09:00:00+00'),
(1, 6, 'familiar', '2025-12-01 10:15:00+00', '2025-12-20 11:00:00+00'),
(1, 7, 'familiar', '2025-12-01 10:20:00+00', '2025-12-18 16:45:00+00'),
(1, 8, 'learned',  '2025-12-02 09:00:00+00', '2026-01-05 13:00:00+00'),
(1, 9, 'learning', '2025-12-02 09:05:00+00', '2025-12-02 09:05:00+00'),
(2, 2, 'learning', '2025-12-03 08:00:00+00', '2025-12-03 08:00:00+00'),
(2, 4, 'learned',  '2025-12-03 08:05:00+00', '2026-01-20 10:30:00+00'),
(2, 6, 'learning', '2025-12-03 08:10:00+00', '2025-12-03 08:10:00+00'),
(2, 8, 'familiar', '2025-12-03 08:15:00+00', '2025-12-25 12:00:00+00'),
(2, 10, 'learning', '2025-12-03 08:20:00+00', '2025-12-03 08:20:00+00');


INSERT INTO users_translations (user_id, translation_id, context)
VALUES
(1, 1, 'the streets. Of course when she had left'),
(1, 5, 'lost them running across the road, where two carriages'),
(1, 8, 'context from another text'),
(1, 16, 'any from her all day long, and no one had'),
(1, 10, 'two carriages had rattled by terribly fast.'),
(1, 23, 'two brass bands had rattled by terribly fast.'),
(1, 24, 'two horses had rattled by terribly fast.'),
(2, 5, 'lost them running across the road, where two carriages'),
(2, 18, ''),
(2, 10, 'two carriages had rattled by terribly fast.');


INSERT INTO webdictionaries (source_language_id, target_language_id, name, url)
VALUES
('en', 'de', 'WordReference.com Englisch - Deutsch', 'https://www.wordreference.com/ende'),
('de', 'en', 'WordReference.com German - English', 'https://www.wordreference.com/deen'),
('en', 'fr', 'WordReference.com Anglais - Francais', 'https://www.wordreference.com/enfr'),
('fr', 'en', 'WordReference.com French - English', 'https://www.wordreference.com/fren'),
('en', 'es', 'WordReference.com Inglés - Espanol', 'https://www.wordreference.com/enes'),
('es', 'en', 'WordReference.com Spanish - English', 'https://www.wordreference.com/esen'),
('en', 'nl', 'WordReference.com Engels - Nederlands', 'https://www.wordreference.com/ennl'),
('nl', 'en', 'WordReference.com Dutch - English', 'https://www.wordreference.com/nlen'),
('en', 'it', 'WordReference.com Inglese - Italiano', 'https://www.wordreference.com/enit'),
('it', 'en', 'WordReference.com Italian - English', 'https://www.wordreference.com/iten'),
('en', 'pt', 'WordReference.com Inglês - Português', 'https://www.wordreference.com/enpt'),
('pt', 'en', 'WordReference.com Portuguese - English', 'https://www.wordreference.com/pten'),
('en', 'ro', 'WordReference.com Englez - Român', 'https://www.wordreference.com/enro'),
('ro', 'en', 'WordReference.com Romanian - English', 'https://www.wordreference.com/roen'),
('en', 'se', 'WordReference.com Engelsk - Svenska', 'https://www.wordreference.com/ensv'),
('se', 'en', 'WordReference.com Swedish - English', 'https://www.wordreference.com/sven'),
('en', 'tr', 'WordReference.com İngilizce - Türkçe', 'https://www.wordreference.com/entr'),
('tr', 'en', 'WordReference.com Turkish - English', 'https://www.wordreference.com/tren'),
('fr', 'es', 'WordReference.com French - Spanish', 'https://www.wordreference.com/fres'),
('es', 'fr', 'WordReference.com Spanish - French', 'https://www.wordreference.com/esfr'),
('it', 'es', 'WordReference.com Italian - Spanish', 'https://www.wordreference.com/ites'),
('es', 'it', 'WordReference.com Spanish - Italian', 'https://www.wordreference.com/esit'),
('pt', 'es', 'WordReference.com Portuguese - Spanish', 'https://www.wordreference.com/ptes'),
('es', 'pt', 'WordReference.com Spanish - Portuguese', 'https://www.wordreference.com/espt'),
('de', 'es', 'WordReference.com German - Spanish', 'https://www.wordreference.com/dees'),
('es', 'de', 'WordReference.com Spanisch - Deutsch', 'https://www.wordreference.com/esde');


INSERT INTO match_girl (language_id, title, body) 
VALUES
('en', 'The Little Match Girl', 
'It was so terribly cold. Snow was falling, and it was almost dark. Evening came on, the last evening of the year. In the cold and gloom a poor little girl, bareheaded and barefoot, was walking through the streets. Of course when she had left her house she''d had slippers on, but what good had they been? They were very big slippers, way too big for her, for they belonged to her mother. The little girl had lost them running across the road, where two carriages had rattled by terribly fast. One slipper she''d not been able to find again, and a boy had run off with the other, saying he could use it very well as a cradle some day when he had children of his own. And so the little girl walked on her naked feet, which were quite red and blue with the cold. In an old apron she carried several packages of matches, and she held a box of them in her hand. No one had bought any from her all day long, and no one had given her a cent.
Shivering with cold and hunger, she crept along, a picture of misery, poor little girl! The snowflakes fell on her long fair hair, which hung in pretty curls over her neck. In all the windows lights were shining, and there was a wonderful smell of roast goose, for it was New Year''s eve. Yes, she thought of that!
In a corner formed by two houses, one of which projected farther out into the street than the other, she sat down and drew up her little feet under her. She was getting colder and colder, but did not dare to go home, for she had sold no matches, nor earned a single cent, and her father would surely beat her. Besides, it was cold at home, for they had nothing over them but a roof through which the wind whistled even though the biggest cracks had been stuffed with straw and rags.'),

('de', 'Das kleine Mädchen mit den Schwefelhölzern', 
'Es war fürchterlich kalt; es schneite und begann dunkler Abend zu werden, es war der letzte Abend im Jahre, Neujahrsabend! In dieser Kälte und in dieser Finsternis ging ein kleines, armes Mädchen mit bloßem Kopfe und nackten Füßen auf der Straße. Sie hatte freilich Pantoffeln gehabt, als sie vom Hause wegging, aber was half das! Es waren sehr große Pantoffeln, ihre Mutter hatte sie zuletzt getragen, so groß waren sie, diese verlor die Kleine, als sie sich beeilte, über die Straße zu gelangen, indem zwei Wagen gewaltig schnell daher jagten. Der eine Pantoffel war nicht wieder zu finden und mit dem andern lief ein Knabe davon, der sagte, er könne ihn als Wiege benutzen, wenn er selbst einmal Kinder bekomme.
Da ging nun das arme Mädchen auf den bloßen, kleinen Füßen, die ganz rot und blau vor Kälte waren. In einer alten Schürze hielt sie eine Menge Schwefelhölzer und ein Bund trug sie in der Hand. Niemand hatte ihr während des ganzen Tages etwas abgekauft, niemand hatte ihr auch nur einen Dreier geschenkt; hungrig und halberfroren schlich sie einher und sah sehr gedrückt aus, die arme Kleine! Die Schneeflocken fielen in ihr langes, gelbes Haar, welches sich schön über den Hals lockte, aber an Pracht dachte sie freilich nicht.
In einem Winkel zwischen zwei Häusern – das eine sprang etwas weiter in die Straße vor, als das andere – da setzte sie sich und kauerte sich zusammen. Die kleinen Füße hatte sie fest angezogen, aber es fror sie noch mehr, und sie wagte nicht nach Hause zu gehen, denn sie hatte ja keine Schwefelhölzer verkauft, nicht einen einzigen Dreier erhalten. Ihr Vater würde sie schlagen, und kalt war es daheim auch, sie hatten nur das Dach gerade über sich und da pfiff der Wind herein, obgleich Stroh und Lappen zwischen die größten Spalten gestopft waren.'),

('fr', 'La petite fille aux allumettes',
'Il faisait effroyablement froid; il neigeait depuis le matin; il faisait déjà sombre; le soir approchait, le soir du dernier jour de l''année. Au milieu des rafales, par ce froid glacial, une pauvre petite fille marchait dans la rue: elle n''avait rien sur la tête, elle était pieds nus. Lorsqu''elle était sortie de chez elle le matin, elle avait eu de vieilles pantoufles beaucoup trop grandes pour elle. Aussi les perdit-elle lorsqu''elle eut à se sauver devant une file de voitures; les voitures passées, elle chercha après ses chaussures; un méchant gamin s''enfuyait emportant en riant l''une des pantoufles; l''autre avait été entièrement écrasée.
Voilà la malheureuse enfant n''ayant plus rien pour abriter ses pauvres petits petons. Dans son vieux tablier, elle portait des allumettes: elle en tenait à la main un paquet. Mais, ce jour, la veille du nouvel an, tout le monde était affairé; par cet affreux temps, personne ne s''arrêtait pour considérer l''air suppliant de la petite qui faisait pitié. La journée finissait, et elle n''avait pas encore vendu un seul paquet d''allumettes. Tremblante de froid et de faim, elle se traînait de rue en rue.
Des flocons de neige couvraient sa longue chevelure blonde. De toutes les fenêtres brillaient des lumières: de presque toutes les maisons sortait une délicieuse odeur, celle de l''oie, qu''on rôtissait pour le festin du soir: c''était la Saint-Sylvestre. Cela, oui, cela lui faisait arrêter ses pas errants.
Enfin, après avoir une dernière fois offert en vain son paquet d''allumettes, l''enfant aperçoit une encoignure entre deux maisons, dont l''une dépassait un peu l''autre. Harassée, elle s''y assied et s''y blottit, tirant à elle ses petits pieds: mais elle grelotte et frissonne encore plus qu''avant et cependant elle n''ose rentrer chez elle. Elle n''y rapporterait pas la plus petite monnaie, et son père la battrait.'),

('es', 'La niña de los fósforos',
'¡Qué frío hacía!; nevaba y comenzaba a oscurecer; era la última noche del año, la noche de San Silvestre. Bajo aquel frío y en aquella oscuridad, pasaba por la calle una pobre niña, descalza y con la cabeza descubierta. Verdad es que al salir de su casa llevaba zapatillas, pero, ¡de qué le sirvieron! Eran unas zapatillas que su madre había llevado últimamente, y a la pequeña le venían tan grandes, que las perdió al cruzar corriendo la calle para librarse de dos coches que venían a toda velocidad. Una de las zapatillas no hubo medio de encontrarla, y la otra se la había puesto un mozalbete, que dijo que la haría servir de cuna el día que tuviese hijos.
Y así la pobrecilla andaba descalza con los desnudos piececitos completamente amoratados por el frío. En un viejo delantal llevaba un puñado de fósforos, y un paquete en una mano. En todo el santo día nadie le había comprado nada, ni le había dado un mísero chelín; volvíase a su casa hambrienta y medio helada, ¡y parecía tan abatida, la pobrecilla! Los copos de nieve caían sobre su largo cabello rubio, cuyos hermosos rizos le cubrían el cuello; pero no estaba ella para presumir.
En un ángulo que formaban dos casas -una más saliente que la otra-, se sentó en el suelo y se acurrucó hecha un ovillo. Encogía los piececitos todo lo posible, pero el frío la iba invadiendo, y, por otra parte, no se atrevía a volver a casa, pues no había vendido ni un fósforo, ni recogido un triste céntimo. Su padre le pegaría, además de que en casa hacía frío también; sólo los cobijaba el tejado, y el viento entraba por todas partes, pese a la paja y los trapos con que habían procurado tapar las rendijas.'),

('it', 'La piccina dei fiammiferi',
'Faceva un freddo terribile, nevicava e calava la sera - l’ultima sera dell’anno, per l’appunto, la sera di San Silvestro. In quel freddo, in quel buio, una povera bambinetta girava per le vie, a capo scoperto, a piedi nudi. Veramente, quand’era uscita di casa, aveva certe babbucce; ma a che le eran servite? Erano grandi grandi - prima erano appartenute a sua madre, - e così larghe e sgangherate, che la bimba le aveva perdute, traversando in fretta la via, per iscansare due carrozze, che s’incrociavano con tanta furia... Una non s’era più trovata, e l’altra se l’era presa un monello, dicendo che ne avrebbe fatto una culla per il suo primo figliuolo.
E così la bambina camminava coi piccoli piedi nudi, fatti rossi e turchini dal freddo: aveva nel vecchio grembiale una quantità di fiammiferi, e ne teneva in mano un pacchetto. In tutta la giornata, non era riuscita a venderne uno; nessuno le aveva dato un soldo; aveva tanta fame, tanto freddo, e un visetto patito e sgomento, povera creaturina... I fiocchi di neve le cadevano sui lunghi capelli biondi, sparsi in bei riccioli sul collo; ma essa non pensava davvero ai riccioli! Tutte le finestre scintillavano di lumi; per le strade si spandeva un buon odorino d’arrosto; era la vigilia del capo d’anno: a questo pensava.
Nell’angolo formato da due case, di cui l’una sporgeva innanzi sulla strada, sedette abbandonandosi, rannicchiandosi tutta, tirandosi sotto le povere gambine. Il freddo la prendeva sempre più, ma non osava tornare a casa: riportava tutti i fiammiferi e nemmeno un soldino. Il babbo l’avrebbe certo picchiata; e, del resto, forse che non faceva freddo anche a casa? Abitavano proprio sotto il tetto, ed il vento ci soffiava tagliente, sebbene le fessure più larghe fossero turate, alla meglio, con paglia e cenci.'),

('pt', 'A Pequena Vendedora de Fósforos',
'Que frio tão atroz! Caía a neve, e a noite vinha por cima. Era dia de Natal. No meio do frio e da escuridão, uma pobre menina passou pela rua com a cabeça e os pés descobertos.
É verdade que tinha sapatos quando saíra de casa; mas não lhe serviram por muito tempo. Eram uns tênis enormes que sua mãe já havia usado: tão grandes, que a menina os perdeu quando atravessou a rua correndo, para que as carruagens que iam em direções opostas não lhe atropelassem.
A menina caminhava, pois, com os pezinhos descalços, que estavam vermelhos e azuis de frio. Levava no avental algumas dúzias de caixas de fósforos e tinha na mão uma delas como amostra. Era um péssimo dia: nenhum comprador havia aparecido, e, por conseqüência, a menina não havia ganho nem um centavo. Tinha muita fome, muito frio e um aspecto miserável. Pobre menina! Os flocos de neve caíam sobre seus longos cabelos loiros, que se esparramavam em lindos caracóis sobre o pescoço; porém, não pensava nos seus cabelos. Via a agitação das luzes através das janelas; sentia o cheiro dos assados por todas as partes. Era dia de Natal, e nesta festa pensava a infeliz menina.
Sentou-se em uma pracinha, e se acomodou em um cantinho entre duas casas. O frio se apoderava dela, e inchava seus membros; mas não se atrevia a aparecer em sua casa; voltava com todos os fósforos e sem nenhuma moeda. Sua madrasta a maltrataria, e, além disso, na sua casa também fazia muito frio. Viviam debaixo do telhado, a casa não tinha teto, e o vento ali soprava com fúria, mesmo que as aberturas maiores haviam sido cobertas com palha e trapos velhos.'),

('se', 'Flickan med svavelstickorna',
'Det var så förskräckligt kallt. Det snöade och kvällens mörker sänkte sig över staden. Det var också den sista kvällen på året. Nyårsaftonen. I denna köld och mörker gick en liten fattig flicka på gatan. Hon hade bart huvud och nakna fötter. Då hon gick hemifrån hade hon haft tofflor på sig. Men inte hade det hjälpt. Det var hennes mors stora tofflor. De var så stora att hon tappade dem när hon skyndade sig över gatan. Den ena toffeln kunde hon inte hitta. Den andra sprang en pojke bort med. Han sa att han kunde använda den till vagga då han själv skulle få barn.
Där gick nu den lilla flickan på de nakna små fötterna röda och blå av köld. I ett gammalt förkläde hade hon svavelstickor, och en bunt bar hon i handen. Det var ingen som hade köpt något av henne under hela dagen. Hon var hungrig och frusen. Där gick hon och såg så förtvivlad ut, den lilla stackaren. Snöflingorna föll i hennes långa, gula hår, som lockade sig så vackert kring nacken, men den prydnaden tänkte hon inte på. Ut från alla fönster lyste ljusen, och så luktade det så gott av gåsstek där ute på gatan; det var ju nyårsafton, ja, det tänkte hon på.
Borta i ett hörn mellan två hus, det ena sköt litet längre fram på gatan än det andra, satte hon sig och kröp i hop; de små benen hade hon dragit upp under sig, men hon frös nu ännu mer och hem vågade hon inte gå; hon hade ju inte sålt några svavelstickor, inte fått en enda slant, hennes far skulle slå henne, och kallt var det även där hemma; de bodde under bara taket, och där ven vinden in, trots att halm och trasor var instoppade i de största springorna.'),

('tr', 'Kibritçi Kız Masalı',
'Korkunç bir soğuk vardı; kar yağıyordu ve akşam karanlığı bastırmak üzereydi. Yılın son gecesiydi, yani yılbaşı gecesi. Bu soğukta, bu karanlıkta, küçük bir kız çocuğu, başı açık halde ve yalınayak yürüyordu sokakta. Aslında evden çıkarken ayaklarına terlik giymişti ama bunlar bir işe yaramamıştı! Ayağına çok büyük geliyorlardı, bunlar eskiden annesinin giydiği terliklerdi. Öyle büyüktüler ki, küçük kız sokakta karşıdan karşıya geçerken, doludizgin giden iki araba üzerine doğru gelince, telaştan terlikler ayağından çıkıvermiş ve kaybolmuştu. Birini bulamamış, diğerini de bir oğlan alıp kaçmış, kaçarken de, ilerde bir çocuğu olursa terliği beşik yerine kullanacağını söylemişti.
İşte bu yüzden kızcağız soğuktan morarmış bir halde ayakları çıplak, öylece ilerliyordu sokakta. Eski önlüğünde bir sürü kibrit vardı, kibritlerin bir kısmını da elinde tutuyordu. Gün boyu hiç kimse bir tanecik bile kibrit satın almamış, kimse beş kuruş vermemişti ona. Zavallı küçük kız, karnı acıkmış, soğuktan donmuş halde karların içinde yürüyordu. Yılgın ve ürkmüş görünüyordu. Bukle bukle ensesine dökülen, uzun sapsarı saçlarına lapa lapa kar yağıyordu, ama onun bu güzelliği düşünecek hali yoktu hiç. Bütün pencerelerde ışıklar parlıyor ve sokaklara nefis kaz kızartması kokuları yayılıyordu. “Öyle ya, bu gece yılbaşı gecesi,” diye düşündü.
Biri hafifçe sokağa doğru taşmış iki evin arasındaki bir köşeye büzülüp oturdu. Küçük ayaklarını altına toplayarak oturmuştu, ama yine de gittikçe daha çok üşüyordu. Buna rağmen eve gitmeye cesaret edemiyordu, çünkü bir tane olsun kibrit satamamış, beş kuruş bile kazanamamıştı. Babasının kızacağını düşünmüştü küçük prenses, hem zaten ev de burası kadar soğuktu. Ev dedikleri sadece bir çatı altıydı, koca koca delikleri samanlarla, paçavralarla tıkadıkları halde, gene de bıçak gibi kesen bir rüzgâr doluyordu içeri.'),

('ro', 'Fetita cu chibrituri',
'Era un ger grozav; ningea si incepuse a innopta: era ajunul Anului Nou. Pe frigul acela si pe intunericul acela, mergea pe strada o biata fetita cu capul gol, si cu picioarele goale. Avusese ea doar niste papuci cand plecase de-acasa, dar nu-i folosisera mult: erau niste papuci mari, pe care mama ei ii rupsese aproape, si erau asa de largi pentru ea, incat mititica-i pierdu grabindu-se sa treaca o strada, unde cat p-aci era sa fie strivita intre doua trasuri. Unul din papuci nici nu-l mai gasise, iar celalalt il luase un baiat care zicea ca vrea sa faca din el leagan pentru copilul lui, cand o avea si el unul.
Fetita mergea cu picioarele ei goale, rosii-vinete de frig; si-n sortul ei vechi tinea strans un vraf de cutii cu chibrituri si mai avea si-n mana o cutie. Fusese o zi rea pentru dansa si nimeni nu-i cumparase in ziua aceea nimic, si n-avea prin urmare nici un ban; si-i era foame si frig tare. Biata fetita! Fulgii de zapada cadeau pe parul ei lung si balai, care se incretea frumos pe langa ceafa, dar nu se gandea ea acum la parul ei cret. Luminile straluceau pe la ferestre, miros de fripturi se raspandea in strada; era ajunul Anului Nou, iata la ce se gandea ea.
Se opri si se ghemui intr-un colt dintre doua case, din care una iesea in strada mai mult ca cealalta. Isi stranse piciorusele sub dansa. Frigul o patrundea din ce in ce mai mult, si totusi nu-i venea sa se duca acasa; aducea inapoi toate chibriturile, si nici un banut macar. Tatal sau are s-o bata; si afara de asta, si acasa nu era tot asa de frig? Ei locuiau tocmai sub acoperis si vantul sufla in voie, cu toate ca fusesera astupate crapaturile cele mari cu paie si cu trente vechi.'),

('nl', 'Het meisje met de zwavelstokjes',
'Het was afschuwelijk koud, het sneeuwde en het begon donker te worden. Het was ook de laatste avond van het jaar, oudejaarsavond. In die kou en in dat donker liep er op straat een arm, klein meisje, zonder muts en op blote voeten. Ze had wel pantoffels aangehad toen ze van huis ging, maar dat hielp niet veel: het waren heel grote pantoffels, haar moeder had ze het laatst gedragen, zo groot waren ze, en het meisje had ze bij het oversteken verloren, toen er twee rijtuigen vreselijk hard voorbijvlogen. De ene pantoffel was niet te vinden en met de andere ging er een jongen vandoor: hij zei dat hij hem als wieg kon gebruiken als hij later kinderen kreeg.
Daar liep dat meisje dus op haar blote voetjes, die rood en blauw zagen van de kou. In een oud schort had ze een heleboel zwavelstokjes en één bosje hield ze in haar hand. Niemand had nog iets van haar gekocht, de hele dag niet. Niemand had haar ook maar een stuivertje gegeven. Hongerig en koud liep ze daar en ze zag er zo zielig uit, dat arme stakkerdje! De sneeuwvlokken vielen in haar lange, blonde haar, dat zo mooi in haar nek krulde, maar aan dat soort dingen dacht ze echt niet. Uit alle ramen scheen licht naar buiten en het rook overal zo lekker naar gebraden gans; het was immers oudejaarsavond en daar dacht ze wel aan.
In een hoekje tussen twee huizen, waarvan het ene een beetje vooruitstak, ging ze in elkaar gedoken zitten. Haar beentjes trok ze onder zich op, maar ze kreeg het nog kouder, en naar huis durfde ze niet, want ze had geen zwavelstokjes verkocht en ook geen stuivertje gekregen. Haar vader zou haar slaan en thuis was het trouwens ook koud. Ze woonden vlak onder het dak en daar blies de wind doorheen, ook al waren de ergste kieren met stro en oude lappen dichtgestopt.');


INSERT INTO reading_progress (user_id, text_id, page_start_word_index)
VALUES (1, 1, 42);

