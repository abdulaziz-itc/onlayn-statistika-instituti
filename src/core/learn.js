/* «Video darslar» module (shared core: used by the learning platform, src/edu, and by every portal variant).
 * Registers a sidebar item (MS.NAV) and the route { page: 'learn', id? }.
 * Screens: platform home («Onlayn statistika instituti»), course page (modules + lessons + results),
 * lesson page (player, version switch, chapters, key points, quiz, transcript), and MyLessons for the cabinet. Progress is stored locally (localStorage, try/catch via MS.store).
 * Videos are plain files next to the page (media/…): no third-party players, no external requests.
 * Lesson texts come from the burned-in Uzbek captions of the videos; other locales are translations
 * (uz-Cyrl and kaa → needsReview, see docs/STATUS.md).
 */
(function () {
  const MS = window.MS;
  const { html, R, useApp, Icon, ICONS, NAV } = MS.ui;
  const { useState, useEffect, useRef } = R;

  ICONS.play = 'M7 4.5v15l12-7.5z';
  ICONS.video = 'M3 6h12v12H3zM15 10l6-3v10l-6-3z';

  /* ---------- UI strings: [uz-Latn, uz-Cyrl, kaa, ru, en] ---------- */
  MS.i18n.extend({
    'nav.learn': ['Onlayn institut', 'Онлайн институт', 'Onlayn institut', 'Онлайн-институт', 'Online institute'],
    'learn.eyebrow': ['Onlayn oʻquv kursi · DEMO', 'Онлайн ўқув курси · DEMO', 'Onlayn oqıw kursı · DEMO', 'Онлайн-курс · DEMO', 'Online course · DEMO'],
    'learn.subtitle': [
      'Statistikani oddiy tilda, qisqa videolar orqali oʻrganing. Har bir dars 5–10 daqiqa.',
      'Статистикани оддий тилда, қисқа видеолар орқали ўрганинг. Ҳар бир дарс 5–10 дақиқа.',
      'Statistikanı ápiwayı tilde, qısqa videolar arqalı úyreniń. Hár bir sabaq 5–10 minut.',
      'Изучайте статистику простым языком в коротких видео. Каждый урок — 5–10 минут.',
      'Learn statistics in plain language through short videos. Each lesson takes 5–10 minutes.',
    ],
    'learn.count': ['{n} ta dars', '{n} та дарс', '{n} sabaq', 'Уроков: {n}', '{n} lessons'],
    'learn.level': ['Boshlangʻich daraja', 'Бошланғич даража', 'Baslanǵısh dáreje', 'Начальный уровень', 'Beginner level'],
    'learn.free': ['Bepul, roʻyxatdan oʻtmasdan', 'Бепул, рўйхатдан ўтмасдан', 'Biypul, dizimnen ótpey', 'Бесплатно, без регистрации', 'Free, no sign-up needed'],
    'learn.lesson': ['{n}-dars', '{n}-дарс', '{n}-sabaq', 'Урок {n}', 'Lesson {n}'],
    'learn.minutes': ['{m} daqiqa', '{m} дақиқа', '{m} minut', '{m} мин', '{m} min'],
    'learn.startHere': ['Shu yerdan boshlang', 'Шу ердан бошланг', 'Usı jerden baslań', 'Начните отсюда', 'Start here'],
    'learn.watch': ['Koʻrish', 'Кўриш', 'Kóriw', 'Смотреть', 'Watch'],
    'learn.continue': ['Davom ettirish', 'Давом эттириш', 'Dawam ettiriw', 'Продолжить', 'Continue'],
    'learn.rewatch': ['Qayta koʻrish', 'Қайта кўриш', 'Qayta kóriw', 'Пересмотреть', 'Watch again'],
    'learn.done': ['Koʻrildi', 'Кўрилди', 'Kórildi', 'Просмотрено', 'Watched'],
    'learn.progress': ['{p}% koʻrildi', '{p}% кўрилди', '{p}% kórildi', 'Просмотрено {p}%', '{p}% watched'],
    'learn.notStarted': ['Hali koʻrilmagan', 'Ҳали кўрилмаган', 'Ele kórilmegen', 'Ещё не просмотрен', 'Not started yet'],
    'learn.soon': ['Tez orada', 'Тез орада', 'Jaqında', 'Скоро', 'Coming soon'],
    'learn.soonTitle': ['Keyingi darslar', 'Кейинги дарслар', 'Keyingi sabaqlar', 'Следующие уроки', 'Upcoming lessons'],
    'learn.soonNote': [
      'Bu darslar hali tayyorlanmoqda. Nomlari namuna sifatida koʻrsatilgan (DEMO).',
      'Бу дарслар ҳали тайёрланмоқда. Номлари намуна сифатида кўрсатилган (DEMO).',
      'Bul sabaqlar ele tayarlanbaqta. Atları úlgi retinde kórsetilgen (DEMO).',
      'Эти уроки ещё готовятся. Названия показаны для примера (DEMO).',
      'These lessons are still being prepared. The titles are examples (DEMO).',
    ],
    'learn.continueTitle': ['Toʻxtagan joyingizdan davom eting', 'Тўхтаган жойингиздан давом этинг', 'Toqtaǵan jerińizden dawam etiń', 'Продолжите с того места, где остановились', 'Pick up where you left off'],
    'learn.back': ['Darslar roʻyxatiga', 'Дарслар рўйхатига', 'Sabaqlar dizimine', 'К списку уроков', 'Back to lessons'],
    'learn.player': ['Video: {title}', 'Видео: {title}', 'Video: {title}', 'Видео: {title}', 'Video: {title}'],
    'learn.version': ['Video varianti', 'Видео варианти', 'Video variantı', 'Вариант видео', 'Video version'],
    'learn.v.light': ['Abdulaziz ovozi · yorugʻ fon', 'Абдулазиз овози · ёруғ фон', 'Abdulaziz dawısı · jaqtı fon', 'Голос Абдулазиза · светлый фон', 'Abdulaziz’s voice · light design'],
    'learn.v.dark': ['Erkak ovozi · qorongʻi fon', 'Эркак овози · қоронғи фон', 'Er adam dawısı · qarańǵı fon', 'Мужской голос · тёмный фон', 'Male voice · dark design'],
    'learn.versionNote': [
      'Ikkala videoda mazmun bir xil, faqat diktor va koʻrinish farq qiladi.',
      'Иккала видеода мазмун бир хил, фақат диктор ва кўриниш фарқ қилади.',
      'Eki videoda da mazmunı birdey, tek diktor hám kórinisi parıq qıladı.',
      'Содержание обоих видео одинаковое, отличаются только диктор и оформление.',
      'Both videos have the same content; only the narrator and the design differ.',
    ],
    'learn.videoLang': [
      'Video oʻzbek tilida, oʻzbekcha subtitrlar videoning ichida. Dars matni pastda.',
      'Видео ўзбек тилида, ўзбекча субтитрлар видеонинг ичида. Дарс матни пастда.',
      'Video ózbek tilinde, ózbekshe subtitrler videonıń ishinde. Sabaq teksti tómende.',
      'Видео на узбекском языке, узбекские субтитры встроены в видео. Перевод текста урока — ниже.',
      'The video is in Uzbek with built-in Uzbek subtitles. A translated transcript is below.',
    ],
    /* ---------- v0.4: standalone learning platform (two video versions, section jumps) ---------- */
    'learn.v1.t': ['1-variant', '1-вариант', '1-variant', 'Вариант 1', 'Version 1'],
    'learn.v1.d': ['Yorugʻ uslub, 1-ovoz', 'Ёруғ услуб, 1-овоз', 'Jaqtı usıl, 1-dawıs', 'Светлый стиль, голос 1', 'Light style, voice 1'],
    'learn.v2.t': ['2-variant', '2-вариант', '2-variant', 'Вариант 2', 'Version 2'],
    'learn.v2.d': ['Qorongʻi uslub, 2-ovoz', 'Қоронғи услуб, 2-овоз', 'Qarańǵı usıl, 2-dawıs', 'Тёмный стиль, голос 2', 'Dark style, voice 2'],
    'learn.vPick': ['Videoni qaysi variantda koʻrasiz?', 'Видеони қайси вариантда кўрасиз?', 'Videonı qaysı variantta kóresiz?', 'В каком варианте смотреть видео?', 'Which version of the video?'],
    'learn.vNow': ['Tanlangan', 'Танланган', 'Tańlanǵan', 'Выбрано', 'Selected'],
    'learn.jump': ['Sahifa boʻlimlari', 'Саҳифа бўлимлари', 'Bet bólimleri', 'Разделы страницы', 'On this page'],
    'learn.jump.ch': ['{n} ta boʻlim', '{n} та бўлим', '{n} bólim', 'Разделов: {n}', '{n} chapters'],
    'learn.jump.quiz': ['{n} ta savol', '{n} та савол', '{n} soraw', 'Вопросов: {n}', '{n} questions'],
    'learn.jump.tr': ['Toʻliq yozuv', 'Тўлиқ ёзув', 'Tolıq jazıw', 'Полный текст', 'Full text'],
    'learn.test': ['Test', 'Тест', 'Test', 'Тест', 'Quiz'],
    'learn.chapters': ['Boʻlimlar', 'Бўлимлар', 'Bólimler', 'Разделы', 'Chapters'],
    'learn.jumpTo': ['«{title}» boʻlimiga oʻtish, {time}', '«{title}» бўлимига ўтиш, {time}', '«{title}» bólimine ótiw, {time}', 'Перейти к разделу «{title}», {time}', 'Go to “{title}”, {time}'],
    'learn.now': ['Hozir', 'Ҳозир', 'Házir', 'Сейчас', 'Now'],
    'learn.transcript': ['Dars matni', 'Дарс матни', 'Sabaq teksti', 'Текст урока', 'Transcript'],
    'learn.transcriptNote': [
      'Matn videodagi yozuvlardan olingan. Ayrim qisqa jumlalar tushib qolgan boʻlishi mumkin.',
      'Матн видеодаги ёзувлардан олинган. Айрим қисқа жумлалар тушиб қолган бўлиши мумкин (таржима текширилмаган).',
      'Tekst videodaǵı jazıwlardan awdarılǵan. Awdarma tekserilmegen (DEMO).',
      'Текст переведён с узбекских субтитров видео. Отдельные короткие фразы могли быть пропущены.',
      'Translated from the video’s Uzbek subtitles. A few short phrases may be missing.',
    ],
    'learn.keyPoints': ['Asosiy fikrlar', 'Асосий фикрлар', 'Tiykarǵı pikirler', 'Главное', 'Key points'],
    'learn.next': ['Keyingi dars', 'Кейинги дарс', 'Keyingi sabaq', 'Следующий урок', 'Next lesson'],
    'learn.lite': [
      'Yengil rejim yoqilgan: internetni tejash uchun video oʻzi yuklanmaydi.',
      'Енгил режим ёқилган: интернетни тежаш учун видео ўзи юкланмайди.',
      'Jeńil rejim qosılǵan: internettı únemlew ushın video ózi júklenbeydi.',
      'Включён облегчённый режим: чтобы сэкономить трафик, видео не загружается само.',
      'Lite mode is on: to save data, the video does not load by itself.',
    ],
    'learn.loadVideo': ['Videoni yuklash va koʻrish ({size})', 'Видеони юклаш ва кўриш ({size})', 'Videonı júklew hám kóriw ({size})', 'Загрузить и смотреть ({size})', 'Load and play ({size})'],
    'learn.mb': ['{n} MB', '{n} МБ', '{n} MB', '{n} МБ', '{n} MB'],
    'learn.error': [
      'Video ochilmadi. Internet aloqasini tekshirib, qayta urinib koʻring.',
      'Видео очилмади. Интернет алоқасини текшириб, қайта уриниб кўринг.',
      'Video ashılmadı. Internet baylanısın tekserip, qayta urınıp kóriń.',
      'Видео не открылось. Проверьте подключение к интернету и попробуйте ещё раз.',
      'The video could not be opened. Check your connection and try again.',
    ],
    'learn.resumed': ['{time} dan davom ettirildi.', '{time} дан давом эттирилди.', '{time} den dawam ettirildi.', 'Продолжено с {time}.', 'Resumed from {time}.'],
    'learn.fromStart': ['Boshidan boshlash', 'Бошидан бошлаш', 'Basınan baslaw', 'Начать сначала', 'Start over'],
    'learn.my': ['Mening darslarim', 'Менинг дарсларим', 'Meniń sabaqlarım', 'Мои уроки', 'My lessons'],
    'learn.myEmpty': ['Hali birorta dars koʻrilmagan.', 'Ҳали бирорта дарс кўрилмаган.', 'Ele hesh bir sabaq kórilmegen.', 'Вы ещё не смотрели уроки.', 'You haven’t watched any lessons yet.'],
    'learn.goLessons': ['Darslarga oʻtish', 'Дарсларга ўтиш', 'Sabaqlarǵa ótiw', 'Перейти к урокам', 'Go to lessons'],
    'learn.localNote': [
      'Qayergacha koʻrganingiz faqat shu brauzerda saqlanadi.',
      'Қаергача кўрганингиз фақат шу браузерда сақланади.',
      'Qay jerge shekem kórgenińiz tek usı brauzerde saqlanadı.',
      'Прогресс сохраняется только в этом браузере.',
      'Your progress is saved in this browser only.',
    ],
    /* ---------- v0.3: platform home, course page, quiz ---------- */
    'learn.brand': ['Onlayn statistika instituti (DEMO)', 'Онлайн статистика институти (DEMO)', 'Onlayn statistika institutı (DEMO)', 'Онлайн-институт статистики (DEMO)', 'Online Institute of Statistics (DEMO)'],
    'learn.tagline': ['Bepul onlayn taʼlim', 'Бепул онлайн таълим', 'Biypul onlayn bilimlendiriw', 'Бесплатное онлайн-обучение', 'Free online learning'],
    'learn.hero.sub': [
      'Statistikani noldan, oddiy tilda oʻrganing: qisqa video, asosiy fikrlar va oʻzingizni sinash uchun test.',
      'Статистикани нолдан, оддий тилда ўрганинг: қисқа видео, асосий фикрлар ва ўзингизни синаш учун тест.',
      'Statistikanı nólden, ápiwayı tilde úyreniń: qısqa video, tiykarǵı pikirler hám ózińizdi sınaw ushın test.',
      'Изучайте статистику с нуля и простым языком: короткое видео, главные мысли и тест для самопроверки.',
      'Learn statistics from scratch in plain language: a short video, key points and a quiz to check yourself.',
    ],
    'learn.start': ['Oʻqishni boshlash', 'Ўқишни бошлаш', 'Oqıwdı baslaw', 'Начать обучение', 'Start learning'],
    'learn.stat.courses': ['Kurslar', 'Курслар', 'Kurslar', 'Курсы', 'Courses'],
    'learn.stat.lessons': ['Darslar', 'Дарслар', 'Sabaqlar', 'Уроки', 'Lessons'],
    'learn.stat.ready': ['Tayyor darslar', 'Тайёр дарслар', 'Tayar sabaqlar', 'Готовые уроки', 'Lessons available'],
    'learn.stat.price': ['Narxi', 'Нархи', 'Bahası', 'Стоимость', 'Price'],
    'learn.stat.free': ['Bepul', 'Бепул', 'Biypul', 'Бесплатно', 'Free'],
    'learn.how.title': ['Qanday ishlaydi?', 'Қандай ишлайди?', 'Qalay isleydi?', 'Как это работает?', 'How it works'],
    'learn.how.1t': ['Videoni koʻring', 'Видеони кўринг', 'Videonı kóriń', 'Посмотрите видео', 'Watch the video'],
    'learn.how.1d': ['5–10 daqiqalik qisqa dars, boʻlimlarga boʻlingan.', '5–10 дақиқалик қисқа дарс, бўлимларга бўлинган.', '5–10 minutlıq qısqa sabaq, bólimlerge bólingen.', 'Короткий урок на 5–10 минут, разбитый на разделы.', 'A short 5–10 minute lesson, split into chapters.'],
    'learn.how.2t': ['Testni yeching', 'Тестни ечинг', 'Testti sheshiń', 'Пройдите тест', 'Take the quiz'],
    'learn.how.2d': ['Har dars oxirida 5 ta savol — javoblar izohi bilan.', 'Ҳар дарс охирида 5 та савол — жавоблар изоҳи билан.', 'Hár sabaq aqırında 5 soraw — juwaplar túsindirmesi menen.', 'В конце каждого урока — 5 вопросов с пояснениями.', 'Five questions after each lesson, with explanations.'],
    'learn.how.3t': ['Natijani kuzating', 'Натижани кузатинг', 'Nátiyjeni baqlań', 'Следите за результатом', 'Track your progress'],
    'learn.how.3d': ['Koʻrilgan darslar va test natijalari kabinetda koʻrinadi.', 'Кўрилган дарслар ва тест натижалари кабинетда кўринади.', 'Kórilgen sabaqlar hám test nátiyjeleri kabinette kórinedi.', 'Просмотренные уроки и результаты тестов видны в кабинете.', 'Watched lessons and quiz results appear in your cabinet.'],
    'learn.course': ['Kurs', 'Курс', 'Kurs', 'Курс', 'Course'],
    'learn.openCourse': ['Kurs dasturini koʻrish', 'Курс дастурини кўриш', 'Kurs baǵdarlamasın kóriw', 'Программа курса', 'View course programme'],
    'learn.module': ['{n}-modul', '{n}-модуль', '{n}-modul', 'Модуль {n}', 'Module {n}'],
    'learn.courseProgress': ['{total} darsdan {done} tasi koʻrildi', '{total} дарсдан {done} таси кўрилди', '{total} sabaqtan {done} kórildi', 'Просмотрено уроков: {done} из {total}', '{done} of {total} lessons watched'],
    'learn.readyNote': [
      'Hozircha tayyor darslar: {ready}. Qolganlari tez orada qoʻshiladi (nomlari namuna, DEMO).',
      'Ҳозирча тайёр дарслар: {ready}. Қолганлари тез орада қўшилади (номлари намуна, DEMO).',
      'Házirshe tayar sabaqlar: {ready}. Qalǵanları jaqında qosıladı (atları úlgi, DEMO).',
      'Сейчас готово уроков: {ready}. Остальные появятся скоро (названия — пример, DEMO).',
      'Lessons available now: {ready}. More are coming soon (titles are examples, DEMO).',
    ],
    'learn.result': ['Mening natijam', 'Менинг натижам', 'Meniń nátiyjem', 'Мой результат', 'My results'],
    'learn.crumb': ['Sahifa yoʻli', 'Саҳифа йўли', 'Bet jolı', 'Навигационная цепочка', 'Breadcrumb'],
    'learn.quiz': ['Oʻzingizni sinang', 'Ўзингизни синанг', 'Ózińizdi sınap kóriń', 'Проверьте себя', 'Check yourself'],
    'learn.quiz.sub': ['5 ta savol. Har birida bitta toʻgʻri javob bor.', '5 та савол. Ҳар бирида битта тўғри жавоб бор.', '5 soraw. Hár birinde bir durıs juwap bar.', '5 вопросов. В каждом один правильный ответ.', 'Five questions. Each has one correct answer.'],
    'learn.quiz.demo': [
      'Savollar namuna sifatida tuzilgan (DEMO), mutaxassis tekshirmagan.',
      'Саволлар намуна сифатида тузилган (DEMO), мутахассис текширмаган.',
      'Sorawlar úlgi retinde dúzilgen (DEMO), qánige tekserip shıqpaǵan.',
      'Вопросы составлены для примера (DEMO) и не проверены экспертом.',
      'The questions are examples (DEMO) and have not been reviewed by an expert.',
    ],
    'learn.quiz.q': ['{n}-savol', '{n}-савол', '{n}-soraw', 'Вопрос {n}', 'Question {n}'],
    'learn.quiz.check': ['Javoblarni tekshirish', 'Жавобларни текшириш', 'Juwaplardı tekseriw', 'Проверить ответы', 'Check answers'],
    'learn.quiz.retry': ['Qayta yechish', 'Қайта ечиш', 'Qayta sheshiw', 'Пройти ещё раз', 'Try again'],
    'learn.quiz.missing': ['Javobsiz savollar: {n}. Barcha savollarga javob bering.', 'Жавобсиз саволлар: {n}. Барча саволларга жавоб беринг.', 'Juwapsız sorawlar: {n}. Barlıq sorawlarǵa juwap beriń.', 'Вопросов без ответа: {n}. Ответьте на все вопросы.', 'Unanswered questions: {n}. Please answer all of them.'],
    'learn.quiz.score': ['Natija: {total} tadan {score} ta toʻgʻri', 'Натижа: {total} тадан {score} та тўғри', 'Nátiyje: {total} den {score} durıs', 'Результат: {score} из {total}', 'Result: {score} out of {total} correct'],
    'learn.quiz.good': ['Ajoyib! Mavzuni yaxshi oʻzlashtirdingiz.', 'Ажойиб! Мавзуни яхши ўзлаштирдингиз.', 'Ájayıp! Temanı jaqsı ózlestirdińiz.', 'Отлично! Вы хорошо усвоили тему.', 'Great! You’ve got it.'],
    'learn.quiz.more': [
      'Yomon emas. Xato javoblar izohini oʻqib, videoning oʻsha qismini qayta koʻring.',
      'Ёмон эмас. Хато жавоблар изоҳини ўқиб, видеонинг ўша қисмини қайта кўринг.',
      'Jaman emes. Qáte juwaplardıń túsindirmesin oqıp, videonıń sol bólimin qayta kóriń.',
      'Неплохо. Прочитайте пояснения к ошибкам и пересмотрите эти части видео.',
      'Not bad. Read the explanations and rewatch those parts of the video.',
    ],
    'learn.quiz.right': ['Toʻgʻri', 'Тўғри', 'Durıs', 'Верно', 'Correct'],
    'learn.quiz.wrong': ['Notoʻgʻri', 'Нотўғри', 'Nadurıs', 'Неверно', 'Incorrect'],
    'learn.quiz.answer': ['Toʻgʻri javob: {a}', 'Тўғри жавоб: {a}', 'Durıs juwap: {a}', 'Правильный ответ: {a}', 'Correct answer: {a}'],
    'learn.quiz.best': ['Test: {total} tadan {score} ta toʻgʻri', 'Тест: {total} тадан {score} та тўғри', 'Test: {total} den {score} durıs', 'Тест: {score} из {total}', 'Quiz: {score} of {total} correct'],
    'learn.quiz.none': ['Test hali yechilmagan', 'Тест ҳали ечилмаган', 'Test ele sheshilmegen', 'Тест ещё не пройден', 'Quiz not taken yet'],
    'learn.quiz.rewatch': ['Videoning shu qismini koʻrish ({time})', 'Видеонинг шу қисмини кўриш ({time})', 'Videonıń usı bólimin kóriw ({time})', 'Смотреть этот фрагмент ({time})', 'Watch this part ({time})'],
    'learn.quiz.go': ['Testga oʻtish', 'Тестга ўтиш', 'Testke ótiw', 'Перейти к тесту', 'Go to the quiz'],
  });

  /* ---------- lesson content ---------- */
  const T = (a) => ({ 'uz-Latn': a[0], 'uz-Cyrl': a[1], kaa: a[2], ru: a[3], en: a[4] });
  const LESSON1_CHAPTERS = [
    {
      t: 0,
      title: ['Kirish', 'Кириш', 'Kirisiw', 'Введение', 'Introduction'],
      text: [
        'Assalomu alaykum, aziz tomoshabinlar! Bugun siz bilan juda qiziq bir fan haqida gaplashamiz. Qaysi fan, deysizmi? Matematikami? Deyarli! Bu statistika — raqamlar orqali dunyoni tushunish ilmi. Raqamlar orqali dunyoni qanday tushunamiz? Keling, birga koʻramiz.',
        'Ассалому алайкум, азиз томошабинлар! Бугун сиз билан жуда қизиқ бир фан ҳақида гаплашамиз. Қайси фан, дейсизми? Математиками? Деярли! Бу статистика — рақамлар орқали дунёни тушуниш илми. Рақамлар орқали дунёни қандай тушунамиз? Келинг, бирга кўрамиз.',
        'Assalawma áleykum, qádirli tamashagóyler! Búgin siz benen júdá qızıqlı bir pán haqqında sóylesemiz. Qaysı pán, deysiz be? Matematika ma? Derlik! Bul — statistika, sanlar arqalı dúnyanı túsiniw ilimi. Sanlar arqalı dúnyanı qalay túsinemiz? Keliń, birge kóreyik.',
        'Здравствуйте, дорогие зрители! Сегодня поговорим об одной очень интересной науке. Какой, спросите вы? О математике? Почти! Это статистика — наука о том, как понимать мир через числа. Как же числа помогают понять мир? Давайте посмотрим вместе.',
        'Hello, dear viewers! Today we’re going to talk about a really interesting science. Which one, you ask? Mathematics? Almost! It’s statistics — the science of understanding the world through numbers. How do numbers help us understand the world? Let’s find out together.',
      ],
    },
    {
      t: 21,
      title: ['Soʻzning kelib chiqishi', 'Сўзнинг келиб чиқиши', 'Sózdiń kelip shıǵıwı', 'Происхождение слова', 'Where the word comes from'],
      text: [
        'Avval soʻzning oʻzidan boshlaylik. Statistika soʻzi lotincha «status», yaʼni holat soʻzidan kelib chiqqan. Italyan tilida «stato» — davlat degani. Chunki dastlab statistika davlat haqidagi maʼlumotlarni yigʻish edi: aholi qancha, hosil qancha, soliq qancha. Bugun esa statistika — maʼlumotni yigʻish, tartiblash, tahlil qilish va undan toʻgʻri xulosa chiqarish fani.',
        'Аввал сўзнинг ўзидан бошлайлик. Статистика сўзи лотинча «status», яъни ҳолат сўзидан келиб чиққан. Итальян тилида «stato» — давлат дегани. Чунки дастлаб статистика давлат ҳақидаги маълумотларни йиғиш эди: аҳоли қанча, ҳосил қанча, солиқ қанча. Бугун эса статистика — маълумотни йиғиш, тартиблаш, таҳлил қилиш ва ундан тўғри хулоса чиқариш фани.',
        'Aldı menen sózdiń ózinen baslayıq. Statistika sózi latınsha «status», yaǵnıy jaǵday sózinen kelip shıqqan. Italyan tilinde «stato» — mámleket degeni. Sebebi dáslep statistika mámleket haqqındaǵı maǵlıwmatlardı jıynaw edi: xalıq qansha, zúráát qansha, salıq qansha. Al búgin statistika — maǵlıwmattı jıynaw, tártiplew, talqılaw hám onnan durıs juwmaq shıǵarıw páni.',
        'Начнём с самого слова. «Статистика» происходит от латинского status — «состояние». По-итальянски stato — «государство». Ведь изначально статистика собирала сведения о государстве: сколько населения, какой урожай, сколько налогов. А сегодня статистика — это наука о сборе, упорядочивании и анализе данных и о том, как делать из них правильные выводы.',
        'Let’s start with the word itself. “Statistics” comes from the Latin status, meaning “condition”. In Italian, stato means “the state”. That’s because statistics originally meant collecting information about the state: how many people, how big the harvest, how much tax. Today statistics is the science of collecting, organizing and analysing data and drawing the right conclusions from it.',
      ],
    },
    {
      t: 43,
      title: ['Statistika hamma joyda', 'Статистика ҳамма жойда', 'Statistika hámme jerde', 'Статистика повсюду', 'Statistics is everywhere'],
      text: [
        'Aslida siz har kuni statistikadan foydalanasiz, faqat buni sezmaysiz. Ob-havo maʼlumotida «ertaga yomgʻir ehtimoli yetmish foiz» deyilsa, bu statistik bashorat. Doʻkon egasi ham har oy hisob qiladi: qaysi mahsulot koʻp sotildi, qaysi biri kam. Shu raqamlar unga nima olib kelishni aytadi. Sport, narxlar, saylovlar, sogʻliq — hammasi raqamlar orqali tushuniladi.',
        'Аслида сиз ҳар куни статистикадан фойдаланасиз, фақат буни сезмайсиз. Об-ҳаво маълумотида «эртага ёмғир эҳтимоли етмиш фоиз» дейилса, бу статистик башорат. Дўкон эгаси ҳам ҳар ой ҳисоб қилади: қайси маҳсулот кўп сотилди, қайси бири кам. Шу рақамлар унга нима олиб келишни айтади. Спорт, нархлар, сайловлар, соғлиқ — ҳаммаси рақамлар орқали тушунилади.',
        'Haqıyqatında siz hár kúni statistikadan paydalanasız, tek bunı sezbeysiz. Hawa rayı maǵlıwmatında «erteń jawın jawıw itimallıǵı jetpis procent» delinse, bul statistikalıq boljaw. Dúkan iyesi de hár ay esap júrgizedi: qaysı ónim kóp satıldı, qaysısı az. Usı sanlar oǵan neni alıp keliw kerekligin aytadı. Sport, bahalar, saylawlar, densawlıq — bári sanlar arqalı túsiniledi.',
        'На самом деле вы пользуетесь статистикой каждый день, просто не замечаете этого. Когда в прогнозе погоды говорят «вероятность дождя завтра — семьдесят процентов», это статистический прогноз. Владелец магазина тоже каждый месяц считает, какой товар продавался хорошо, а какой плохо. Эти цифры подсказывают ему, что закупать. Спорт, цены, выборы, здоровье — всё это мы понимаем через числа.',
        'In fact you use statistics every day without noticing. When the forecast says “a seventy percent chance of rain tomorrow”, that is a statistical prediction. A shop owner also counts every month which products sold well and which didn’t. Those numbers tell them what to stock. Sport, prices, elections, health — we understand all of them through numbers.',
      ],
    },
    {
      t: 67,
      title: ['Toʻplam va tanlanma', 'Тўплам ва танланма', 'Jıynaq hám tańlama', 'Совокупность и выборка', 'Population and sample'],
      text: [
        'Statistikaning eng muhim tushunchalaridan biri — toʻplam va tanlanma. Tasavvur qiling, shahar aholisining fikrini bilmoqchimiz. Hammasidan soʻrash juda qimmat va uzoq. Shuning uchun tasodifiy tanlangan kichik guruhdan soʻraymiz. Bu tanlanma deyiladi. Lekin qirq kishi butun shahar fikrini qanday bildiradi, deysizmi? Agar ular haqiqatan tasodifiy tanlansa, tanlanma toʻplamning kichik nusxasiga oʻxshaydi. Sir — tasodifiylikda. Demak, toʻgʻri tanlansa, kichik guruh ham katta haqiqatni ayta oladi!',
        'Статистиканинг энг муҳим тушунчаларидан бири — тўплам ва танланма. Тасаввур қилинг, шаҳар аҳолисининг фикрини билмоқчимиз. Ҳаммасидан сўраш жуда қиммат ва узоқ. Шунинг учун тасодифий танланган кичик гуруҳдан сўраймиз. Бу танланма дейилади. Лекин қирқ киши бутун шаҳар фикрини қандай билдиради, дейсизми? Агар улар ҳақиқатан тасодифий танланса, танланма тўпламнинг кичик нусхасига ўхшайди. Сир — тасодифийликда. Демак, тўғри танланса, кичик гуруҳ ҳам катта ҳақиқатни айта олади!',
        'Statistikanıń eń zárúr túsiniklerinen biri — jıynaq hám tańlama. Oylap kóriń, qala xalqınıń pikirin bilmekshimiz. Hámmesinen soraw júdá qımbat hám uzaq. Sonlıqtan tosınnan tańlanǵan kishi topardan soraymız. Bul tańlama dep ataladı. Biraq qırıq adam pútkil qalanıń pikirin qalay bildiredi, deysiz be? Eger olar haqıyqattan da tosınnan tańlansa, tańlama jıynaqtıń kishi nusqasına uqsaydı. Sırı — tosınnanlıqta. Demek, durıs tańlansa, kishi topar da úlken haqıyqattı ayta aladı!',
        'Одно из важнейших понятий статистики — генеральная совокупность и выборка. Представьте, что мы хотим узнать мнение жителей города. Опросить всех — слишком дорого и долго. Поэтому мы опрашиваем небольшую случайно отобранную группу. Это и есть выборка. Но как сорок человек могут отражать мнение целого города? Если их действительно выбрали случайно, выборка похожа на уменьшенную копию совокупности. Весь секрет — в случайности. Значит, при правильном отборе даже небольшая группа может рассказать большую правду!',
        'One of the most important ideas in statistics is the population and the sample. Imagine we want to know what a city’s residents think. Asking everyone would be far too expensive and slow. So we ask a small, randomly chosen group. That is called a sample. But how can forty people speak for a whole city? If they really are chosen at random, the sample looks like a small copy of the population. The secret is randomness. So, chosen correctly, even a small group can tell a big truth!',
      ],
    },
    {
      t: 102,
      title: ['Maʼlumot yigʻish', 'Маълумот йиғиш', 'Maǵlıwmat jıynaw', 'Сбор данных', 'Collecting data'],
      text: [
        'Maʼlumot yigʻish — statistikaning poydevori. Soʻrovnoma, roʻyxatga olish, hisobotlar orqali raqamlar toʻplanadi. Har bir qator — bitta kuzatuv, har bir ustun — bitta belgi. Masalan, oila aʼzolari soni yoki daromadi. Maʼlumot qanchalik aniq yigʻilsa, xulosa shunchalik ishonchli boʻladi.',
        'Маълумот йиғиш — статистиканинг пойдевори. Сўровнома, рўйхатга олиш, ҳисоботлар орқали рақамлар тўпланади. Ҳар бир қатор — битта кузатув, ҳар бир устун — битта белги. Масалан, оила аъзолари сони ёки даромади. Маълумот қанчалик аниқ йиғилса, хулоса шунчалик ишончли бўлади.',
        'Maǵlıwmat jıynaw — statistikanıń tiykarı. Sorawnama, dizimge alıw, esabatlar arqalı sanlar jıynaladı. Hár bir qatar — bir baqlaw, hár bir baǵana — bir belgi. Mısalı, shańaraq aǵzalarınıń sanı yamasa dáramatı. Maǵlıwmat qanshelli anıq jıynalsa, juwmaq sonshelli isenimli boladı.',
        'Сбор данных — фундамент статистики. Числа собирают с помощью опросов, переписей и отчётов. Каждая строка — одно наблюдение, каждый столбец — один признак. Например, число членов семьи или её доход. Чем точнее собраны данные, тем надёжнее вывод.',
        'Collecting data is the foundation of statistics. Numbers are gathered through surveys, censuses and reports. Each row is one observation and each column is one variable — for example, the number of family members or their income. The more accurately data is collected, the more reliable the conclusion.',
      ],
    },
    {
      t: 118,
      title: ['Oʻrtacha va mediana', 'Ўртача ва медиана', 'Ortasha hám mediana', 'Среднее и медиана', 'Mean and median'],
      text: [
        'Endi oddiy misol. Yetti nafar xodimning oylik maoshi bor. Hammasini qoʻshib, yettiga boʻlsak, oʻrtacha qiymat chiqadi: qariyb yetti million soʻm. Demak, bu jamoada odatdagi oylik shu atrofda ekan! Endi oxirgi xodim oʻrniga direktorni qoʻyamiz. Uning oyligi sakson million. Voy! Oʻrtacha qiymat birdan oʻn yetti million soʻmga sakrab ketdi! Toʻgʻri. Lekin olti kishi hali ham sakkiz million yoki undan kam oladi. Shuning uchun mediana kerak — bu tartiblangan qatorning aynan oʻrtasidagi qiymat. Mediana yetti million boʻlib qoldi. Bitta katta son uni deyarli oʻzgartirmaydi. Daromad haqida gapirganda koʻpincha mediana ishonchliroq.',
        'Энди оддий мисол. Етти нафар ходимнинг ойлик маоши бор. Ҳаммасини қўшиб, еттига бўлсак, ўртача қиймат чиқади: қарийб етти миллион сўм. Демак, бу жамоада одатдаги ойлик шу атрофда экан! Энди охирги ходим ўрнига директорни қўямиз. Унинг ойлиги саксон миллион. Вой! Ўртача қиймат бирдан ўн етти миллион сўмга сакраб кетди! Тўғри. Лекин олти киши ҳали ҳам саккиз миллион ёки ундан кам олади. Шунинг учун медиана керак — бу тартибланган қаторнинг айнан ўртасидаги қиймат. Медиана етти миллион бўлиб қолди. Битта катта сон уни деярли ўзгартирмайди. Даромад ҳақида гапирганда кўпинча медиана ишончлироқ.',
        'Endi ápiwayı mısal. Jeti xızmetkerdiń aylıq is haqısı bar. Hámmesin qosıp, jetige bólsek, ortasha mánis shıǵadı: shama menen jeti million sum. Demek, bul jámáátte ádettegi aylıq usı átirapta eken! Endi sońǵı xızmetkerdiń ornına direktordı qoyamız. Onıń aylıǵı seksen million. Oy! Ortasha mánis birden on jeti million sumǵa sekirip ketti! Durıs. Biraq altı adam ele de segiz million yamasa onnan az aladı. Sonlıqtan mediana kerek — bul tártiplengen qatardıń dál ortasındaǵı mánis. Mediana jeti million bolıp qaldı. Bir úlken san onı derlik ózgertpeydi. Dáramat haqqında aytqanda kóbinese mediana isenimlirek.',
        'Теперь простой пример. Есть зарплаты семи сотрудников. Сложим их и разделим на семь — получим среднее значение: около семи миллионов сумов. Значит, обычная зарплата в этом коллективе примерно такая! Теперь заменим последнего сотрудника директором. Его зарплата — восемьдесят миллионов. Ого! Среднее сразу подскочило до семнадцати миллионов сумов! Верно. Но шесть человек по-прежнему получают восемь миллионов или меньше. Поэтому нужна медиана — значение ровно посередине упорядоченного ряда. Медиана осталась около семи миллионов. Одно большое число её почти не меняет. Когда речь идёт о доходах, медиана обычно надёжнее.',
        'Now a simple example. We have the monthly salaries of seven employees. Add them up and divide by seven, and we get the mean: about seven million soʻm. So a typical salary in this team is around that! Now let’s replace the last employee with the director, who earns eighty million. Wow! The mean suddenly jumps to seventeen million soʻm! Right. But six people still earn eight million or less. That’s why we need the median — the value exactly in the middle of the sorted list. The median stays at about seven million. One big number hardly changes it. When we talk about income, the median is usually more reliable.',
      ],
    },
    {
      t: 162,
      title: ['Taqsimot', 'Тақсимот', 'Bólistiriliw', 'Распределение', 'Distribution'],
      text: [
        'Agar ming nafar odamning boʻyini oʻlchasak, koʻpchilik oʻrtacha atrofida boʻladi, juda past va juda baland odamlar esa kam. Raqamlarni ustunlarga yigʻsak, qoʻngʻiroqqa oʻxshash shakl paydo boʻladi. Bu normal taqsimot deyiladi. Qiziq! Tabiat oʻzi tartibni yaxshi koʻrar ekan. Taqsimotni bilsak, gʻayrioddiy holatni darrov sezamiz: masalan, sinfdagi barcha baholar birdan keskin oshsa, sababini tekshirish kerak boʻladi.',
        'Агар минг нафар одамнинг бўйини ўлчасак, кўпчилик ўртача атрофида бўлади, жуда паст ва жуда баланд одамлар эса кам. Рақамларни устунларга йиғсак, қўнғироққа ўхшаш шакл пайдо бўлади. Бу нормал тақсимот дейилади. Қизиқ! Табиат ўзи тартибни яхши кўрар экан. Тақсимотни билсак, ғайриоддий ҳолатни дарров сезамиз: масалан, синфдаги барча баҳолар бирдан кескин ошса, сабабини текшириш керак бўлади.',
        'Eger mıń adamnıń boyın ólshesek, kópshiligi ortasha átirapında boladı, al júdá pás hám júdá biyik adamlar az. Sanlardı baǵanalarǵa jıynasaq, qońırawǵa uqsas forma payda boladı. Bul normal bólistiriliw dep ataladı. Qızıq! Tábiyat tártipti jaqsı kóredi eken. Bólistiriliwdi bilsek, ádettegiden tıs jaǵdaydı birden sezemiz: mısalı, klastaǵı barlıq bahalar birden keskin ósse, sebebin tekseriw kerek boladı.',
        'Если измерить рост тысячи человек, большинство окажется около среднего, а очень низких и очень высоких людей будет мало. Если сгруппировать числа в столбцы, получится фигура, похожая на колокол. Это называется нормальным распределением. Интересно! Похоже, сама природа любит порядок. Зная распределение, мы сразу замечаем необычное: например, если все оценки в классе вдруг резко выросли, стоит проверить, почему.',
        'If we measure the height of a thousand people, most will be close to average, and very short or very tall people will be rare. If we group the numbers into bars, a bell-like shape appears. This is called the normal distribution. Interesting! Nature seems to like order. Knowing the distribution, we notice unusual things at once: for example, if every grade in a class suddenly jumps, it’s worth checking why.',
      ],
    },
    {
      t: 188,
      title: ['Grafik hayot qutqargan', 'График ҳаёт қутқарган', 'Grafik ómirdi saqlap qalǵan', 'График, который спас жизни', 'A chart that saved lives'],
      text: [
        'Bir oʻn toʻqqizinchi asr hikoyasi. Qrim urushida hamshira Florens Naytingeyl harbiy kasalxonalardagi oʻlimlarni sanab chiqdi. U koʻpchilik askarlar jarohatdan emas, iflos sharoitdagi yuqumli kasalliklardan halok boʻlayotganini aniqladi. Buni rahbarlarga tushuntirish uchun u gul barglariga oʻxshash maxsus diagramma chizdi. Shu grafikdan keyin kasalxonalarda tozalikka eʼtibor kuchaydi. Uning raqamlari va diagrammasi koʻplab hayotlarni saqlab qolishga yordam berdi. Bu statistika qanchalik kuchli boʻlishining yorqin misoli.',
        'Бир ўн тўққизинчи аср ҳикояси. Қрим урушида ҳамшира Флоренс Найтингейл ҳарбий касалхоналардаги ўлимларни санаб чиқди. У кўпчилик аскарлар жароҳатдан эмас, ифлос шароитдаги юқумли касалликлардан ҳалок бўлаётганини аниқлади. Буни раҳбарларга тушунтириш учун у гул баргларига ўхшаш махсус диаграмма чизди. Шу графикдан кейин касалхоналарда тозаликка эътибор кучайди. Унинг рақамлари ва диаграммаси кўплаб ҳаётларни сақлаб қолишга ёрдам берди. Бу статистика қанчалик кучли бўлишининг ёрқин мисоли.',
        'On toǵızınshı ásirden bir hikaya. Qırım urısında hámshire Florens Naytingeyl áskeriy gospitallardaǵı ólimlerdi sanap shıqtı. Ol kóp áskerlerdiń jaraqattan emes, las sharayattaǵı juqpalı keselliklerden qaytıs bolıp atırǵanın anıqladı. Bunı basshılarǵa túsindiriw ushın ol gúl japıraqlarına uqsas arnawlı diagramma sızdı. Usı grafikten keyin gospitallarda tazalıqqa itibar kúsheydi. Onıń sanları hám diagramması kóp ómirlerdi saqlap qalıwǵa járdem berdi. Bul statistikanıń qanshelli kúshli ekenliginiń anıq mısalı.',
        'История из девятнадцатого века. Во время Крымской войны медсестра Флоренс Найтингейл подсчитала смерти в военных госпиталях. Она выяснила, что большинство солдат погибали не от ранений, а от инфекций из-за антисанитарии. Чтобы объяснить это руководству, она нарисовала особую диаграмму, похожую на лепестки цветка. После этого графика в госпиталях стали уделять больше внимания чистоте. Её цифры и диаграмма помогли спасти множество жизней. Это яркий пример того, какой силой может обладать статистика.',
        'A story from the nineteenth century. During the Crimean War, the nurse Florence Nightingale counted the deaths in military hospitals. She found that most soldiers were dying not from their wounds but from infectious diseases caused by dirty conditions. To explain this to those in charge, she drew a special diagram that looks like flower petals. After that chart, hospitals paid much more attention to cleanliness. Her numbers and her diagram helped save many lives — a vivid example of how powerful statistics can be.',
      ],
    },
    {
      t: 218,
      title: ['Bogʻliqlik ≠ sabab', 'Боғлиқлик ≠ сабаб', 'Baylanıs ≠ sebep', 'Корреляция ≠ причина', 'Correlation ≠ causation'],
      text: [
        'Yozda havo isisa, muzqaymoq savdosi ham oshadi. Nuqtalar deyarli toʻgʻri chiziq boʻylab ketadi. Bu korrelyatsiya, yaʼni bogʻliqlik. Lekin ehtiyot boʻling: bogʻliqlik har doim sabab degani emas. Masalan, yozda muzqaymoq ham, choʻmilish ham koʻpayadi. Lekin muzqaymoq choʻmilishga sabab boʻlmaydi — ikkalasining sababi issiq havo. Yaʼni muzqaymoq koʻp sotilgani uchun havo isimaydi!',
        'Ёзда ҳаво исиса, музқаймоқ савдоси ҳам ошади. Нуқталар деярли тўғри чизиқ бўйлаб кетади. Бу корреляция, яъни боғлиқлик. Лекин эҳтиёт бўлинг: боғлиқлик ҳар доим сабаб дегани эмас. Масалан, ёзда музқаймоқ ҳам, чўмилиш ҳам кўпаяди. Лекин музқаймоқ чўмилишга сабаб бўлмайди — иккаласининг сабаби иссиқ ҳаво. Яъни музқаймоқ кўп сотилгани учун ҳаво исимайди!',
        'Jazda hawa ıssısa, balmuzdaq satıwı da artadı. Noqatlar derlik tuwrı sızıq boylap ketedi. Bul korrelyaciya, yaǵnıy baylanıs. Biraq abaylı bolıń: baylanıs hár dayım sebep degeni emes. Mısalı, jazda balmuzdaq ta, suwǵa túsiw de kóbeyedi. Biraq balmuzdaq suwǵa túsiwge sebep bolmaydı — ekewiniń de sebebi ıssı hawa. Yaǵnıy balmuzdaq kóp satılǵanı ushın hawa ıssımaydı!',
        'Летом, когда жарко, растут и продажи мороженого. Точки выстраиваются почти по прямой. Это корреляция, то есть взаимосвязь. Но будьте осторожны: связь не всегда означает причину. Например, летом становится больше и мороженого, и купающихся. Но мороженое не заставляет людей купаться — у обоих явлений общая причина: жара. И уж точно погода не становится жарче оттого, что продали много мороженого!',
        'In summer, when it gets hot, ice-cream sales go up too. The dots run along an almost straight line. This is correlation — a relationship. But be careful: correlation doesn’t always mean causation. For example, in summer both ice-cream sales and swimming increase. But ice cream doesn’t make people swim — both are caused by the hot weather. And the weather certainly doesn’t get hotter because lots of ice cream was sold!',
      ],
    },
    {
      t: 243,
      title: ['Grafik aldashi mumkin', 'График алдаши мумкин', 'Grafik aldawı múmkin', 'График может обмануть', 'Charts can mislead'],
      text: [
        'Endi bir hiyla. Chapdagi grafikda oʻsish ulkan koʻrinadi, oʻngdagisida esa deyarli sezilmaydi. Ha, faqat chapda oʻq noldan emas, toʻqson sakkizdan boshlangan. Shuning uchun grafikka qaraganda doim oʻqdagi raqamlarni tekshiring.',
        'Энди бир ҳийла. Чапдаги графикда ўсиш улкан кўринади, ўнгдагисида эса деярли сезилмайди. Ҳа, фақат чапда ўқ нолдан эмас, тўқсон саккиздан бошланган. Шунинг учун графикка қараганда доим ўқдаги рақамларни текширинг.',
        'Endi bir ámel. Shep tárepdegi grafikte ósiw úlken bolıp kórinedi, al oń tárepdegide derlik sezilmeydi. Awa, tek shep tárepte kósher nólden emes, toqsan segizden baslanǵan. Sonlıqtan grafikke qaraǵanda dayım kósherdegi sanlardı tekseriń.',
        'А теперь одна уловка. На левом графике рост выглядит огромным, а на правом почти незаметен. Да, только на левом ось начинается не с нуля, а с девяноста восьми. Поэтому, глядя на график, всегда проверяйте числа на оси.',
        'Now a trick. On the left chart the growth looks huge, while on the right it is barely visible. Yes — but on the left the axis starts not at zero but at ninety-eight. So whenever you look at a chart, always check the numbers on the axis.',
      ],
    },
    {
      t: 262,
      title: ['Statistika qarorlar uchun', 'Статистика қарорлар учун', 'Statistika qararlar ushın', 'Статистика для решений', 'Statistics for decisions'],
      text: [
        'Hukumat qayerga maktab qurishni, qaysi tumanga koʻproq shifoxona kerakligini statistikaga qarab hal qiladi. Tadbirkor bozorni, shifokor dori samarasini, oʻqituvchi esa oʻquvchilar natijasini raqamlar orqali tushunadi. Yaxshi statistika — toʻgʻri qarorning asosi. Notoʻgʻri oʻqilgan raqam esa notoʻgʻri qarorga olib keladi. Tadbirkor ham tumandagi aholi oʻsishiga qarab yangi doʻkon ochishni rejalashtiradi.',
        'Ҳукумат қаерга мактаб қуришни, қайси туманга кўпроқ шифохона кераклигини статистикага қараб ҳал қилади. Тадбиркор бозорни, шифокор дори самарасини, ўқитувчи эса ўқувчилар натижасини рақамлар орқали тушунади. Яхши статистика — тўғри қарорнинг асоси. Нотўғри ўқилган рақам эса нотўғри қарорга олиб келади. Тадбиркор ҳам тумандаги аҳоли ўсишига қараб янги дўкон очишни режалаштиради.',
        'Húkimet qay jerge mektep salıwdı, qaysı rayonǵa kóbirek emlewxana kerekligin statistikaǵa qarap sheshedi. Isbilermen bazardı, shıpaker dári nátiyjesin, al muǵallim oqıwshılardıń nátiyjesin sanlar arqalı túsinedi. Jaqsı statistika — durıs qarardıń tiykarı. Nadurıs oqılǵan san bolsa nadurıs qararǵa alıp keledi. Isbilermen de rayondaǵı xalıq ósiwine qarap jańa dúkan ashıwdı rejelestiredi.',
        'Правительство решает, где строить школы и какому району нужно больше больниц, опираясь на статистику. Предприниматель понимает рынок, врач — действие лекарства, а учитель — успехи учеников через числа. Хорошая статистика — основа правильного решения. А неверно прочитанное число ведёт к неверному решению. Предприниматель тоже планирует открыть новый магазин, глядя на рост населения района.',
        'Governments decide where to build schools and which district needs more hospitals by looking at statistics. A business owner understands the market, a doctor the effect of a medicine, and a teacher their pupils’ results — all through numbers. Good statistics are the basis of good decisions, and a misread number leads to a wrong one. A business owner, too, plans a new shop by looking at population growth in the district.',
      ],
    },
    {
      t: 287,
      title: ['Xulosa', 'Хулоса', 'Juwmaq', 'Итоги', 'Summary'],
      text: [
        'Xulosa qilsak: statistika maʼlumot yigʻadi, uni tartiblaydi va bizga dunyoni aniqroq koʻrishga yordam beradi. Esda tuting: raqamlar yolgʻon gapirmaydi, lekin ularni notoʻgʻri oʻqish mumkin. Doim manba va usulni soʻrang. Endi raqamlarga boshqacha qaraysiz, toʻgʻrimi? Videoni oxirigacha koʻrganingiz uchun rahmat. Keyingi darsda koʻrishguncha!',
        'Хулоса қилсак: статистика маълумот йиғади, уни тартиблайди ва бизга дунёни аниқроқ кўришга ёрдам беради. Эсда тутинг: рақамлар ёлғон гапирмайди, лекин уларни нотўғри ўқиш мумкин. Доим манба ва усулни сўранг. Энди рақамларга бошқача қарайсиз, тўғрими? Видеони охиригача кўрганингиз учун раҳмат. Кейинги дарсда кўришгунча!',
        'Juwmaqlap aytqanda: statistika maǵlıwmat jıynaydı, onı tártipleydi hám bizge dúnyanı anıǵıraq kóriwge járdem beredi. Esińizde tutıń: sanlar ótirik aytpaydı, biraq olardı nadurıs oqıw múmkin. Dayım derek hám usıldı sorań. Endi sanlarǵa basqasha qaraysız, solay ma? Videonı aqırına shekem kórgenińiz ushın raxmet. Keyingi sabaqta kórisemiz!',
        'Подведём итог: статистика собирает данные, упорядочивает их и помогает нам точнее видеть мир. Запомните: числа не лгут, но их можно неправильно прочитать. Всегда спрашивайте об источнике и методе. Теперь вы будете смотреть на числа по-другому, правда? Спасибо, что досмотрели видео до конца. До встречи на следующем уроке!',
        'To sum up: statistics collects data, organizes it and helps us see the world more clearly. Remember: numbers don’t lie, but they can be misread. Always ask about the source and the method. You’ll look at numbers differently now, won’t you? Thank you for watching to the end. See you in the next lesson!',
      ],
    },
  ];

  /* ---------- quiz for lesson 1 (demo questions written from the video content; needs expert review) ---------- */
  const Q = (t, q, a, ok, why) => ({ t, q: T(q), a: a.map(T), ok, why: T(why) });
  const LESSON1_QUIZ = [
    Q(21,
      ['«Statistika» soʻzi qaysi soʻzdan kelib chiqqan?', '«Статистика» сўзи қайси сўздан келиб чиққан?', '«Statistika» sózi qaysı sózden kelip shıqqan?', 'От какого слова произошло слово «статистика»?', 'Which word does “statistics” come from?'],
      [
        ['Yunoncha «arifmos» — son', 'Юнонча «арифмос» — сон', 'Grekshe «arifmos» — san', 'Греческое «арифмос» — число', 'Greek “arithmos” — number'],
        ['Lotincha «status» — holat', 'Лотинча «status» — ҳолат', 'Latınsha «status» — jaǵday', 'Латинское «status» — состояние', 'Latin “status” — condition'],
        ['Arabcha «hisob» — sanash', 'Арабча «ҳисоб» — санаш', 'Arabsha «esap» — sanaw', 'Арабское «хисаб» — счёт', 'Arabic “hisab” — counting'],
      ],
      1,
      [
        'Lotincha «status» — holat, italyancha «stato» — davlat. Dastlab statistika davlat haqidagi maʼlumotlarni yigʻgan.',
        'Лотинча «status» — ҳолат, итальянча «stato» — давлат. Дастлаб статистика давлат ҳақидаги маълумотларни йиғган.',
        'Latınsha «status» — jaǵday, italyansha «stato» — mámleket. Dáslep statistika mámleket haqqındaǵı maǵlıwmatlardı jıynaǵan.',
        'Латинское «status» — состояние, итальянское «stato» — государство. Изначально статистика собирала сведения о государстве.',
        'Latin “status” means condition; Italian “stato” means the state. Statistics began as collecting information about the state.',
      ]),
    Q(67,
      ['Butun shahar aholisining fikrini bilish uchun statistikada nima qilinadi?', 'Бутун шаҳар аҳолисининг фикрини билиш учун статистикада нима қилинади?', 'Pútkil qala xalqınıń pikirin biliw ushın statistikada ne isleledi?', 'Что делают в статистике, чтобы узнать мнение жителей целого города?', 'How do statisticians find out what a whole city thinks?'],
      [
        ['Tasodifiy tanlangan kichik guruhdan soʻraladi', 'Тасодифий танланган кичик гуруҳдан сўралади', 'Tosınnan tańlanǵan kishi topardan soraladı', 'Опрашивают небольшую случайно отобранную группу', 'They ask a small, randomly chosen group'],
        ['Faqat tanish odamlardan soʻraladi', 'Фақат таниш одамлардан сўралади', 'Tek tanıs adamlardan soraladı', 'Опрашивают только знакомых', 'They ask only people they know'],
        ['Hech kimdan soʻralmaydi, taxmin qilinadi', 'Ҳеч кимдан сўралмайди, тахмин қилинади', 'Hesh kimnen soralmaydı, shamalanadı', 'Никого не опрашивают, а предполагают', 'They ask no one and simply guess'],
      ],
      0,
      [
        'Tasodifiy tanlangan guruh — tanlanma — butun toʻplamning kichik nusxasiga oʻxshaydi.',
        'Тасодифий танланган гуруҳ — танланма — бутун тўпламнинг кичик нусхасига ўхшайди.',
        'Tosınnan tańlanǵan topar — tańlama — pútkil jıynaqtıń kishi nusqasına uqsaydı.',
        'Случайно отобранная группа — выборка — похожа на уменьшенную копию всей совокупности.',
        'A randomly chosen group — a sample — looks like a small copy of the whole population.',
      ]),
    Q(118,
      ['Jamoaga oyligi juda katta direktor qoʻshildi. Qaysi koʻrsatkich deyarli oʻzgarmaydi?', 'Жамоага ойлиги жуда катта директор қўшилди. Қайси кўрсаткич деярли ўзгармайди?', 'Jámáátke aylıǵı júdá úlken direktor qosıldı. Qaysı kórsetkish derlik ózgermeydi?', 'В коллектив пришёл директор с очень большой зарплатой. Какой показатель почти не изменится?', 'A director with a very high salary joins the team. Which measure hardly changes?'],
      [
        ['Oʻrtacha qiymat', 'Ўртача қиймат', 'Ortasha mánis', 'Среднее значение', 'The mean'],
        ['Ikkalasi ham keskin oshadi', 'Иккаласи ҳам кескин ошади', 'Ekewi de keskin artadı', 'Оба резко вырастут', 'Both rise sharply'],
        ['Mediana', 'Медиана', 'Mediana', 'Медиана', 'The median'],
      ],
      2,
      [
        'Mediana — tartiblangan qatorning oʻrtasidagi qiymat. Bitta katta son uni deyarli oʻzgartirmaydi, oʻrtachani esa keskin oshiradi.',
        'Медиана — тартибланган қаторнинг ўртасидаги қиймат. Битта катта сон уни деярли ўзгартирмайди, ўртачани эса кескин оширади.',
        'Mediana — tártiplengen qatardıń ortasındaǵı mánis. Bir úlken san onı derlik ózgertpeydi, al ortashanı keskin arttıradı.',
        'Медиана — значение в середине упорядоченного ряда. Одно большое число её почти не меняет, а среднее резко увеличивает.',
        'The median is the middle value of the sorted list. One big number hardly moves it, but it pushes the mean up sharply.',
      ]),
    Q(218,
      ['Yozda muzqaymoq savdosi ham, choʻmilish ham koʻpayadi. Qaysi xulosa toʻgʻri?', 'Ёзда музқаймоқ савдоси ҳам, чўмилиш ҳам кўпаяди. Қайси хулоса тўғри?', 'Jazda balmuzdaq satıwı da, suwǵa túsiw de kóbeyedi. Qaysı juwmaq durıs?', 'Летом растут и продажи мороженого, и число купающихся. Какой вывод верный?', 'In summer both ice-cream sales and swimming go up. Which conclusion is right?'],
      [
        ['Muzqaymoq odamlarni choʻmilishga undaydi', 'Музқаймоқ одамларни чўмилишга ундайди', 'Balmuzdaq adamlardı suwǵa túsiwge iytermeleydi', 'Мороженое побуждает людей купаться', 'Ice cream makes people swim'],
        ['Ikkalasining sababi — issiq havo', 'Иккаласининг сабаби — иссиқ ҳаво', 'Ekewiniń de sebebi — ıssı hawa', 'У обоих явлений одна причина — жара', 'Both have the same cause — hot weather'],
        ['Choʻmilish muzqaymoq savdosini oshiradi', 'Чўмилиш музқаймоқ савдосини оширади', 'Suwǵa túsiw balmuzdaq satıwın arttıradı', 'Купание увеличивает продажи мороженого', 'Swimming boosts ice-cream sales'],
      ],
      1,
      [
        'Bogʻliqlik (korrelyatsiya) har doim sabab degani emas: bu yerda ikkalasiga ham issiq havo sabab.',
        'Боғлиқлик (корреляция) ҳар доим сабаб дегани эмас: бу ерда иккаласига ҳам иссиқ ҳаво сабаб.',
        'Baylanıs (korrelyaciya) hár dayım sebep degeni emes: bul jerde ekewine de ıssı hawa sebep.',
        'Связь (корреляция) не всегда означает причину: здесь у обоих явлений общая причина — жара.',
        'Correlation does not always mean causation: here both are caused by the hot weather.',
      ]),
    Q(243,
      ['Grafikda oʻsish juda katta koʻrinsa, avval nimani tekshirish kerak?', 'Графикда ўсиш жуда катта кўринса, аввал нимани текшириш керак?', 'Grafikte ósiw júdá úlken bolıp kórinse, aldı menen neni tekseriw kerek?', 'Если рост на графике выглядит огромным, что нужно проверить в первую очередь?', 'If growth on a chart looks huge, what should you check first?'],
      [
        ['Oʻq qaysi sondan boshlanganini', 'Ўқ қайси сондан бошланганини', 'Kósher qaysı sannan baslanǵanın', 'С какого числа начинается ось', 'Where the axis starts'],
        ['Grafikning rangini', 'Графикнинг рангини', 'Grafiktiń reńin', 'Цвет графика', 'The colour of the chart'],
        ['Ustunlar nechta ekanini', 'Устунлар нечта эканини', 'Baǵanalar neshew ekenin', 'Сколько на нём столбцов', 'How many bars it has'],
      ],
      0,
      [
        'Oʻq noldan emas, masalan 98 dan boshlansa, kichik farq ham ulkan koʻrinadi. Doim oʻqdagi raqamlarni tekshiring.',
        'Ўқ нолдан эмас, масалан 98 дан бошланса, кичик фарқ ҳам улкан кўринади. Доим ўқдаги рақамларни текширинг.',
        'Kósher nólden emes, mısalı 98 den baslansa, kishi parıq ta úlken bolıp kórinedi. Dayım kósherdegi sanlardı tekseriń.',
        'Если ось начинается не с нуля, а, например, с 98, даже небольшая разница выглядит огромной. Всегда проверяйте числа на оси.',
        'If the axis starts at, say, 98 instead of zero, even a small difference looks huge. Always check the numbers on the axis.',
      ]),
  ];

  const LESSONS = [
    {
      id: 'statistika-nima',
      num: 1,
      ready: true,
      duration: 311,
      title: T(['Statistika nima?', 'Статистика нима?', 'Statistika degen ne?', 'Что такое статистика?', 'What is statistics?']),
      desc: T([
        'Soʻzning kelib chiqishi, toʻplam va tanlanma, oʻrtacha va mediana, taqsimot, bogʻliqlik va sabab — barchasi oddiy misollarda.',
        'Сўзнинг келиб чиқиши, тўплам ва танланма, ўртача ва медиана, тақсимот, боғлиқлик ва сабаб — барчаси оддий мисолларда.',
        'Sózdiń kelip shıǵıwı, jıynaq hám tańlama, ortasha hám mediana, bólistiriliw, baylanıs hám sebep — bári ápiwayı mısallarda.',
        'Откуда взялось слово, совокупность и выборка, среднее и медиана, распределение, связь и причина — всё на простых примерах.',
        'Where the word comes from, population and sample, mean and median, distribution, correlation and causation — all with simple examples.',
      ]),
      videos: [
        { id: 'light', label: 'learn.v.light', card: 'learn.v1', src: 'media/statistika-nima-yorugh.mp4', poster: 'media/statistika-nima-yorugh.jpg', mb: 7.5 },
        { id: 'dark', label: 'learn.v.dark', card: 'learn.v2', src: 'media/statistika-nima-qorongi.mp4', poster: 'media/statistika-nima-qorongi.jpg', mb: 9.3 },
      ],
      chapters: LESSON1_CHAPTERS.map((c) => ({ t: c.t, title: T(c.title), text: T(c.text) })),
      quiz: LESSON1_QUIZ,
      keyPoints: [
        T([
          'Statistika — maʼlumotni yigʻish, tartiblash, tahlil qilish va undan toʻgʻri xulosa chiqarish fani.',
          'Статистика — маълумотни йиғиш, тартиблаш, таҳлил қилиш ва ундан тўғри хулоса чиқариш фани.',
          'Statistika — maǵlıwmattı jıynaw, tártiplew, talqılaw hám onnan durıs juwmaq shıǵarıw páni.',
          'Статистика — наука о сборе, упорядочивании и анализе данных и о правильных выводах из них.',
          'Statistics is the science of collecting, organizing and analysing data and drawing sound conclusions.',
        ]),
        T([
          'Toʻgʻri, tasodifiy tanlangan kichik guruh butun aholi haqida ishonchli xulosa beradi.',
          'Тўғри, тасодифий танланган кичик гуруҳ бутун аҳоли ҳақида ишончли хулоса беради.',
          'Durıs, tosınnan tańlanǵan kishi topar pútkil xalıq haqqında isenimli juwmaq beredi.',
          'Правильно и случайно отобранная небольшая группа даёт надёжный вывод обо всём населении.',
          'A small group chosen correctly and at random can tell us reliably about the whole population.',
        ]),
        T([
          'Bitta katta son oʻrtachani buzadi — daromad haqida mediana ishonchliroq.',
          'Битта катта сон ўртачани бузади — даромад ҳақида медиана ишончлироқ.',
          'Bir úlken san ortashanı buzadı — dáramat haqqında mediana isenimlirek.',
          'Одно большое число искажает среднее — для доходов медиана надёжнее.',
          'One big number can distort the mean — for income, the median is more reliable.',
        ]),
        T([
          'Bogʻliqlik sabab degani emas. Grafikda doim oʻqdagi raqamlarni va manbani tekshiring.',
          'Боғлиқлик сабаб дегани эмас. Графикда доим ўқдаги рақамларни ва манбани текширинг.',
          'Baylanıs sebep degeni emes. Grafikte dayım kósherdegi sanlardı hám deregin tekseriń.',
          'Связь — ещё не причина. На графике всегда проверяйте числа на оси и источник.',
          'Correlation is not causation. On any chart, always check the axis numbers and the source.',
        ]),
      ],
    },
    {
      id: 'foiz-va-punkt',
      num: 2,
      title: T(['Foiz va foiz punkti', 'Фоиз ва фоиз пункти', 'Procent hám procent punkti', 'Проценты и процентные пункты', 'Percent vs percentage point']),
    },
    {
      id: 'inflyatsiya',
      num: 3,
      title: T(['Inflyatsiya qanday oʻlchanadi?', 'Инфляция қандай ўлчанади?', 'Inflyaciya qalay ólshenedi?', 'Как измеряют инфляцию?', 'How is inflation measured?']),
    },
    {
      id: 'yaim',
      num: 4,
      title: T(['YaIM nima?', 'ЯИМ нима?', 'JIÓ degen ne?', 'Что такое ВВП?', 'What is GDP?']),
    },
    {
      id: 'royxatga-olish',
      num: 5,
      title: T(['Aholini roʻyxatga olish qanday oʻtadi?', 'Аҳолини рўйхатга олиш қандай ўтади?', 'Xalıqtı dizimge alıw qalay ótedi?', 'Как проходит перепись населения?', 'How does a population census work?']),
    },
    {
      id: 'grafik-oqish',
      num: 6,
      title: T(['Grafik va jadvalni toʻgʻri oʻqish', 'График ва жадвални тўғри ўқиш', 'Grafik hám kesteni durıs oqıw', 'Как правильно читать графики и таблицы', 'Reading charts and tables correctly']),
    },
  ];
  const byId = {};
  LESSONS.forEach((l) => (byId[l.id] = l));

  /* ---------- courses: modules group the lessons (only lesson 1 is real, the rest are sample titles) ---------- */
  const COURSES = [
    {
      id: 'asoslar',
      title: T(['Statistika asoslari', 'Статистика асослари', 'Statistika tiykarları', 'Основы статистики', 'Statistics basics']),
      desc: T([
        'Raqamlarni toʻgʻri oʻqish va tushunishni oʻrgatadigan boshlangʻich kurs: asosiy tushunchalar, iqtisodiy koʻrsatkichlar va maʼlumot bilan ishlash.',
        'Рақамларни тўғри ўқиш ва тушунишни ўргатадиган бошланғич курс: асосий тушунчалар, иқтисодий кўрсаткичлар ва маълумот билан ишлаш.',
        'Sanlardı durıs oqıw hám túsiniwdi úyretetuǵın baslanǵısh kurs: tiykarǵı túsinikler, ekonomikalıq kórsetkishler hám maǵlıwmat penen islew.',
        'Начальный курс о том, как правильно читать и понимать числа: основные понятия, экономические показатели и работа с данными.',
        'A beginner course on reading and understanding numbers: core concepts, economic indicators and working with data.',
      ]),
      modules: [
        { title: T(['Statistika bilan tanishuv', 'Статистика билан танишув', 'Statistika menen tanısıw', 'Знакомство со статистикой', 'Getting to know statistics']), lessons: ['statistika-nima', 'foiz-va-punkt'] },
        { title: T(['Iqtisodiy koʻrsatkichlar', 'Иқтисодий кўрсаткичлар', 'Ekonomikalıq kórsetkishler', 'Экономические показатели', 'Economic indicators']), lessons: ['inflyatsiya', 'yaim'] },
        { title: T(['Maʼlumot bilan ishlash', 'Маълумот билан ишлаш', 'Maǵlıwmat penen islew', 'Работа с данными', 'Working with data']), lessons: ['royxatga-olish', 'grafik-oqish'] },
      ],
    },
  ];
  const courseById = {};
  COURSES.forEach((c) => (courseById[c.id] = c));
  const courseOf = (lessonId) => COURSES.find((c) => c.modules.some((m) => m.lessons.indexOf(lessonId) >= 0)) || COURSES[0];

  /* ---------- progress store (local, shared by all components) ---------- */
  const PKEY = 'mystat.learn.progress';
  let progress = MS.store.get(PKEY, {}) || {};
  const subs = new Set();
  function setProgress(id, patch) {
    const cur = progress[id] || {};
    const next = Object.assign({}, cur, patch);
    if (cur.done) next.done = true; // once watched, stays watched
    progress = Object.assign({}, progress, { [id]: next });
    MS.store.set(PKEY, progress);
    subs.forEach((f) => f(progress));
  }
  function useProgress() {
    const [p, setP] = useState(progress);
    useEffect(() => {
      subs.add(setP);
      setP(progress);
      return () => subs.delete(setP);
    }, []);
    return p;
  }
  function pctOf(pr) {
    if (!pr) return 0;
    if (pr.done) return 100;
    return Math.max(0, Math.min(99, Math.round(pr.pct || 0)));
  }

  MS.learn = { LESSONS, byId, COURSES, courseById, getProgress: () => progress, setProgress };
  MS.dataService = MS.dataService || {};
  MS.dataService.getLessons = () => Promise.resolve(LESSONS); // TODO(backend): replace with a real API call
  MS.dataService.getLesson = (id) => Promise.resolve(byId[id] || null);

  /* ---------- nav registry: after "Hududlar", before "Eʼlonlar" ---------- */
  if (!NAV.some((n) => n.id === 'learn')) {
    const at = NAV.findIndex((n) => n.id === 'releases');
    NAV.splice(at < 0 ? NAV.length : at, 0, { id: 'learn', icon: 'video', key: 'nav.learn', route: { page: 'learn' } });
  }

  /* ---------- helpers ---------- */
  function mmss(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  /* saved choice first, otherwise the video that matches the site theme */
  function defaultVersion(theme) {
    const saved = MS.store.get('mystat.learn.version', null);
    if (saved === 'light' || saved === 'dark') return saved;
    return theme === 'dark' ? 'dark' : 'light';
  }
  function chapterAt(ch, time) {
    let k = 0;
    for (let i = 0; i < ch.length; i++) if (ch[i].t <= time + 0.25) k = i;
    return k;
  }
  function Bar(p) {
    return html`<span className="ml-bar" aria-hidden="true"><span className="ml-bar__fill" style=${{ width: p.pct + '%' }}></span></span>`;
  }
  function ProgressText(p) {
    const { t } = useApp();
    const pct = pctOf(p.pr);
    if (pct >= 100) return html`<span className="ml-state ml-state--done"><${Icon} name="check" size=${16} stroke=${2.4} />${t('learn.done')}</span>`;
    if (pct > 0) return html`<span className="ml-state">${t('learn.progress', { p: pct })}</span>`;
    return html`<span className="ml-state ml-state--muted">${t('learn.notStarted')}</span>`;
  }
  function actionKey(pr) {
    const pct = pctOf(pr);
    return pct >= 100 ? 'learn.rewatch' : pct > 0 ? 'learn.continue' : 'learn.watch';
  }

  /* =====================================================================
   * SHARED BITS — breadcrumb, hero illustration, course numbers
   * ===================================================================== */
  function Crumbs(p) {
    const { t } = useApp();
    return html`<nav className="ml-crumbs" aria-label=${t('learn.crumb')}>
      <ol role="list">
        ${p.items.map((it, i) => {
          const last = i === p.items.length - 1;
          return html`<li key=${i}>
            ${last
              ? html`<span aria-current="page">${it.label}</span>`
              : html`<button type="button" className="ml-crumbs__btn" onClick=${it.onClick}>${it.label}</button><${Icon} name="chevronRight" size=${14} />`}
          </li>`;
        })}
      </ol>
    </nav>`;
  }
  /* decorative only: a bar chart, a trend line and a play button drawn with theme tokens */
  function HeroArt() {
    return html`<svg className="ml-hero__art ms-illus" viewBox="0 0 320 220" aria-hidden="true" focusable="false">
      <rect x="18" y="20" width="284" height="180" rx="16" className="ml-art__card" />
      <line x1="44" y1="168" x2="276" y2="168" className="ml-art__axis" />
      <rect x="56" y="124" width="26" height="44" rx="4" className="ml-art__bar" />
      <rect x="96" y="98" width="26" height="70" rx="4" className="ml-art__bar" />
      <rect x="136" y="110" width="26" height="58" rx="4" className="ml-art__bar" />
      <rect x="176" y="74" width="26" height="94" rx="4" className="ml-art__bar ml-art__bar--hi" />
      <rect x="216" y="88" width="26" height="80" rx="4" className="ml-art__bar" />
      <path d="M52 112 L109 84 L149 96 L189 56 L229 70 L270 44" className="ml-art__line" />
      <circle cx="270" cy="44" r="6" className="ml-art__dot" />
      <circle cx="250" cy="150" r="30" className="ml-art__play" />
      <path d="M242 136 v28 l24 -14 z" className="ml-art__tri" />
    </svg>`;
  }
  function courseStats(course, pr) {
    const lessons = course.modules.reduce((a, m) => a.concat(m.lessons.map((id) => byId[id])), []);
    const ready = lessons.filter((l) => l.ready);
    const done = lessons.filter((l) => pr[l.id] && pr[l.id].done).length;
    let qScore = 0, qTotal = 0, qTaken = 0;
    ready.forEach((l) => {
      const q = pr[l.id] && pr[l.id].quiz;
      if (l.quiz) qTotal += l.quiz.length;
      if (q) {
        qScore += q.score;
        qTaken++;
      }
    });
    return { lessons, ready, done, total: lessons.length, pct: Math.round((done / lessons.length) * 100), qScore, qTotal, qTaken };
  }
  function QuizText(p) {
    const { t } = useApp();
    const q = p.pr && p.pr.quiz;
    if (!q) return html`<span className="ml-state ml-state--muted">${t('learn.quiz.none')}</span>`;
    return html`<span className="ml-state"><${Icon} name="check" size=${16} stroke=${2.4} />${t('learn.quiz.best', { score: q.score, total: q.total })}</span>`;
  }

  /* =====================================================================
   * PLATFORM HOME
   * ===================================================================== */
  function Home() {
    const { t, L, go, theme } = useApp();
    const pr = useProgress();
    const course = COURSES[0];
    const cs = courseStats(course, pr);
    const main = cs.ready.find((l) => pctOf(pr[l.id]) < 100) || cs.ready[0];
    const mp = pr[main.id];
    const pct = pctOf(mp);
    const started = pct > 0 && pct < 100;
    const poster = (main.videos.find((x) => x.id === defaultVersion(theme)) || main.videos[0]).poster;
    const open = () => go('learn', { id: main.id });
    const steps = [
      { icon: 'video', t: 'learn.how.1t', d: 'learn.how.1d' },
      { icon: 'check', t: 'learn.how.2t', d: 'learn.how.2d' },
      { icon: 'chart', t: 'learn.how.3t', d: 'learn.how.3d' },
    ];
    return html`<div className="ml-page ml-home">
      <header className="ml-hero">
        <div className="ml-hero__body">
          <p className="ml-hero__tag"><${Icon} name="book" size=${16} />${t('learn.tagline')}</p>
          <h1 className="ml-title" tabIndex="-1" data-page-title>${t('learn.brand')}</h1>
          <p className="ml-hero__sub">${t('learn.hero.sub')}</p>
          <div className="ml-actions">
            <button type="button" className="ms-btn ms-btn--primary ml-cta" onClick=${open}>
              <${Icon} name="play" size=${18} fill=${true} /><span>${t(started ? 'learn.continue' : pct >= 100 ? 'learn.rewatch' : 'learn.start')}</span>
            </button>
            <button type="button" className="ms-btn ml-cta" onClick=${() => go('learn', { course: course.id })}><${Icon} name="list" size=${18} /><span>${t('learn.openCourse')}</span></button>
          </div>
          <dl className="ml-stats">
            <div><dt>${t('learn.stat.courses')}</dt><dd className="ms-num">${COURSES.length}</dd></div>
            <div><dt>${t('learn.stat.lessons')}</dt><dd className="ms-num">${cs.total}</dd></div>
            <div><dt>${t('learn.stat.ready')}</dt><dd className="ms-num">${cs.ready.length}</dd></div>
            <div><dt>${t('learn.stat.price')}</dt><dd>${t('learn.stat.free')}</dd></div>
          </dl>
        </div>
        <${HeroArt} />
      </header>

      <section className="ml-feature" aria-labelledby="ml-feat-t">
        <div className="ml-feature__media" onClick=${open} aria-hidden="true">
          <img src=${poster} alt="" width="960" height="540" loading="lazy" decoding="async" />
          <span className="ml-playbadge"><${Icon} name="play" size=${30} fill=${true} /></span>
          <span className="ml-dur ms-num">${mmss(main.duration)}</span>
        </div>
        <div className="ml-feature__body">
          <p className="ml-kicker">${started ? t('learn.continueTitle') : t('learn.startHere')} · ${t('learn.lesson', { n: main.num })}</p>
          <h2 id="ml-feat-t" className="ml-feature__title">${L(main.title)}</h2>
          <p className="ml-feature__desc">${L(main.desc)}</p>
          <p className="ml-meta"><span><${Icon} name="clock" size=${16} />${t('learn.minutes', { m: Math.round(main.duration / 60) })}</span><${ProgressText} pr=${mp} /><${QuizText} pr=${mp} /></p>
          ${pct > 0 && html`<${Bar} pct=${pct} />`}
          <div className="ml-actions">
            <button type="button" className="ms-btn ms-btn--primary ml-cta" onClick=${open}>
              <${Icon} name="play" size=${18} fill=${true} /><span>${t(actionKey(mp))}</span><span className="ms-sr">: ${L(main.title)}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="ml-how" aria-labelledby="ml-how-t">
        <h2 id="ml-how-t" className="ml-h2">${t('learn.how.title')}</h2>
        <ol className="ml-steps" role="list">
          ${steps.map(
            (s, i) => html`<li key=${i} className="ml-step">
              <span className="ml-step__ic" aria-hidden="true"><${Icon} name=${s.icon} size=${22} /></span>
              <div className="ml-step__body">
                <h3 className="ml-step__t"><span className="ml-step__n ms-num">${i + 1}.</span> ${t(s.t)}</h3>
                <p>${t(s.d)}</p>
              </div>
            </li>`,
          )}
        </ol>
      </section>

      <section className="ml-courses" aria-labelledby="ml-crs-t">
        <h2 id="ml-crs-t" className="ml-h2">${t('learn.stat.courses')}</h2>
        <article className="ml-box ml-course">
          <div className="ml-course__main">
            <p className="ml-kicker">${t('learn.course')} · ${t('learn.level')} · ${t('learn.count', { n: cs.total })}</p>
            <h3 className="ml-course__title">${L(course.title)}</h3>
            <p>${L(course.desc)}</p>
            <${Bar} pct=${cs.pct} />
            <p className="ml-meta"><span className="ml-state">${t('learn.courseProgress', { done: cs.done, total: cs.total })}</span></p>
          </div>
          <button type="button" className="ms-btn ml-cta" onClick=${() => go('learn', { course: course.id })}>
            <span>${t('learn.openCourse')}</span><span className="ms-sr">: ${L(course.title)}</span><${Icon} name="chevronRight" size=${18} />
          </button>
        </article>
      </section>
      <p className="ml-note ml-note--foot"><${Icon} name="info" size=${16} /><span>${t('learn.localNote')}</span></p>
    </div>`;
  }

  /* =====================================================================
   * COURSE PAGE — modules and lessons
   * ===================================================================== */
  function Course(p) {
    const { t, L, go } = useApp();
    const pr = useProgress();
    const course = p.course;
    const cs = courseStats(course, pr);
    return html`<div className="ml-page ml-course-page">
      <${Crumbs} items=${[{ label: t('nav.learn'), onClick: () => go('learn') }, { label: L(course.title) }]} />
      <header className="ml-head">
        <p className="ml-eyebrow">${t('learn.course')} · ${t('learn.level')}</p>
        <h1 className="ml-title" tabIndex="-1" data-page-title>${L(course.title)}</h1>
        <p className="ml-sub">${L(course.desc)}</p>
      </header>

      <section className="ml-box ml-result" aria-labelledby="ml-res-t">
        <h2 id="ml-res-t" className="ml-h2"><${Icon} name="chart" size=${20} />${t('learn.result')}</h2>
        <${Bar} pct=${cs.pct} />
        <p className="ml-meta">
          <span className="ml-state">${t('learn.courseProgress', { done: cs.done, total: cs.total })}</span>
          ${cs.qTaken
            ? html`<span className="ml-state"><${Icon} name="check" size=${16} stroke=${2.4} />${t('learn.quiz.best', { score: cs.qScore, total: cs.qTotal })}</span>`
            : html`<span className="ml-state ml-state--muted">${t('learn.quiz.none')}</span>`}
        </p>
        <p className="ml-note"><${Icon} name="info" size=${16} /><span>${t('learn.readyNote', { ready: cs.ready.length })}</span></p>
      </section>

      ${course.modules.map(
        (m, mi) => html`<section key=${mi} className="ml-module" aria-labelledby=${'ml-mod-' + mi}>
          <h2 id=${'ml-mod-' + mi} className="ml-h2"><span className="ml-module__n">${t('learn.module', { n: mi + 1 })}</span><span>${L(m.title)}</span></h2>
          <ol className="ml-rows" role="list">
            ${m.lessons.map((id) => {
              const l = byId[id];
              const st = pr[id];
              const done = st && st.done;
              return html`<li key=${id} className=${'ml-row' + (l.ready ? '' : ' is-soon') + (done ? ' is-done' : '')}>
                <span className="ml-row__ic" aria-hidden="true"><${Icon} name=${done ? 'check' : l.ready ? 'play' : 'clock'} size=${18} fill=${!done && l.ready} stroke=${done ? 2.6 : 1.8} /></span>
                <div className="ml-row__main">
                  <p className="ml-card__kicker">${t('learn.lesson', { n: l.num })}${l.ready ? ' · ' + t('learn.minutes', { m: Math.round(l.duration / 60) }) : ''}</p>
                  <h3 className="ml-row__title">${L(l.title)}</h3>
                  ${l.ready
                    ? html`<p className="ml-meta"><${ProgressText} pr=${st} /><${QuizText} pr=${st} /></p>`
                    : html`<span className="ml-tag"><${Icon} name="clock" size=${14} />${t('learn.soon')}</span>`}
                </div>
                ${l.ready &&
                html`<button type="button" className="ms-btn ms-btn--primary" onClick=${() => go('learn', { id })}>
                  <${Icon} name="play" size=${16} fill=${true} /><span>${t(actionKey(st))}</span><span className="ms-sr">: ${L(l.title)}</span>
                </button>`}
              </li>`;
            })}
          </ol>
        </section>`,
      )}
    </div>`;
  }

  /* =====================================================================
   * QUIZ — 5 questions after the lesson
   * ===================================================================== */
  function Quiz(p) {
    const { t, L, announce } = useApp();
    const lesson = p.lesson;
    const qs = lesson.quiz;
    const pr = useProgress();
    const [ans, setAns] = useState({});
    const [checked, setChecked] = useState(false);
    const [err, setErr] = useState('');
    const resRef = useRef(null);
    const score = qs.reduce((n, q, i) => n + (ans[i] === q.ok ? 1 : 0), 0);
    const submit = (e) => {
      e.preventDefault();
      const miss = qs.filter((q, i) => ans[i] == null).length;
      if (miss) {
        setErr(t('learn.quiz.missing', { n: miss }));
        return;
      }
      setErr('');
      setChecked(true);
      const best = (progress[lesson.id] || {}).quiz;
      if (!best || score >= best.score) setProgress(lesson.id, { quiz: { score, total: qs.length, at: new Date().toISOString() } });
      announce(t('learn.quiz.score', { score, total: qs.length }));
      setTimeout(() => resRef.current && resRef.current.focus(), 60);
    };
    const reset = () => {
      setAns({});
      setChecked(false);
      setErr('');
    };
    return html`<section id="ml-quiz" className="ml-box ml-quiz" aria-labelledby="ml-quiz-t">
      <h2 id="ml-quiz-t" className="ml-h2"><${Icon} name="check" size=${20} stroke=${2.4} />${t('learn.quiz')}</h2>
      <p className="ml-note">${t('learn.quiz.sub')} ${t('learn.quiz.demo')}</p>
      <p className="ml-meta"><${QuizText} pr=${pr[lesson.id]} /></p>
      <form className="ml-quiz__form" onSubmit=${submit} noValidate aria-describedby=${err ? 'ml-quiz-err' : undefined}>
        ${qs.map((q, i) => {
          const right = checked && ans[i] === q.ok;
          return html`<fieldset key=${i} className=${'ml-q' + (checked ? (right ? ' is-right' : ' is-wrong') : '')}>
            <legend className="ml-q__legend"><span className="ml-q__n">${t('learn.quiz.q', { n: i + 1 })}</span><span>${L(q.q)}</span></legend>
            <div className="ml-q__opts">
              ${q.a.map((a, j) => {
                const on = ans[i] === j;
                const cls = 'ml-opt' + (on ? ' is-on' : '') + (checked && j === q.ok ? ' is-correct' : '') + (checked && on && j !== q.ok ? ' is-incorrect' : '');
                return html`<label key=${j} className=${cls}>
                  <input type="radio" name=${'ml-q-' + lesson.id + '-' + i} checked=${on} disabled=${checked} onChange=${() => setAns((x) => Object.assign({}, x, { [i]: j }))} />
                  <span className="ml-opt__mark" aria-hidden="true">${checked && j === q.ok ? html`<${Icon} name="check" size=${16} stroke=${3} />` : checked && on ? html`<${Icon} name="close" size=${16} stroke=${3} />` : null}</span>
                  <span className="ml-opt__txt">${L(a)}</span>
                </label>`;
              })}
            </div>
            ${checked &&
            html`<div className="ml-q__res">
              <p><strong className=${right ? 'ml-ok' : 'ml-bad'}><${Icon} name=${right ? 'check' : 'close'} size=${16} stroke=${3} />${t(right ? 'learn.quiz.right' : 'learn.quiz.wrong')}.</strong>${!right ? ' ' + t('learn.quiz.answer', { a: L(q.a[q.ok]) }) + '.' : ''} ${L(q.why)}</p>
              ${!right && html`<button type="button" className="ms-link" onClick=${() => p.seek(q.t)}>${t('learn.quiz.rewatch', { time: mmss(q.t) })}</button>`}
            </div>`}
          </fieldset>`;
        })}
        <p id="ml-quiz-err" className="ml-err" role="alert">${err}</p>
        ${checked &&
        html`<div ref=${resRef} tabIndex="-1" className="ml-quiz__result" role="status">
          <p className="ml-quiz__score ms-num">${t('learn.quiz.score', { score, total: qs.length })}</p>
          <p>${t(score >= Math.ceil(qs.length * 0.8) ? 'learn.quiz.good' : 'learn.quiz.more')}</p>
        </div>`}
        <div className="ml-actions">
          ${checked
            ? html`<button type="button" className="ms-btn ml-cta" onClick=${reset}>${t('learn.quiz.retry')}</button>`
            : html`<button type="submit" className="ms-btn ms-btn--primary ml-cta">${t('learn.quiz.check')}</button>`}
        </div>
      </form>
    </section>`;
  }

  /* =====================================================================
   * PLAYER
   * ===================================================================== */
  function Player(p) {
    const { t, fmt, lite } = useApp();
    const v = p.video;
    const armed = p.armed, setArmed = p.setArmed;
    const [err, setErr] = useState(false);
    const [nonce, setNonce] = useState(0);
    useEffect(() => setErr(false), [v.src]);
    if (!armed)
      return html`<div className="ml-player ml-player--lite">
        <img src=${v.poster} alt="" width="960" height="540" decoding="async" />
        <div className="ml-lite">
          <p>${t('learn.lite')}</p>
          <button type="button" className="ms-btn ms-btn--primary" onClick=${() => setArmed(true)}><${Icon} name="play" size=${18} fill=${true} /><span>${t('learn.loadVideo', { size: t('learn.mb', { n: fmt.num(v.mb, 1) }) })}</span></button>
        </div>
      </div>`;
    if (err)
      return html`<div className="ml-player ml-player--err" role="alert">
        <p>${t('learn.error')}</p>
        <button type="button" className="ms-btn ms-btn--primary" onClick=${() => {
          setErr(false);
          setNonce((n) => n + 1);
        }}>${t('common.retry')}</button>
      </div>`;
    return html`<div className="ml-player">
      <video
        key=${v.src + ':' + nonce}
        ref=${p.videoRef}
        className="ml-video"
        controls
        playsInline
        preload=${lite ? 'auto' : 'metadata'}
        autoPlay=${lite}
        poster=${v.poster}
        aria-label=${p.label}
        onLoadedMetadata=${p.onMeta}
        onTimeUpdate=${p.onTime}
        onPause=${p.onPause}
        onEnded=${p.onEnded}
        onError=${() => setErr(true)}
      >
        <source src=${v.src} type="video/mp4" />
      </video>
    </div>`;
  }

  /* =====================================================================
   * LESSON PAGE
   * ===================================================================== */
  function Lesson(p) {
    const app = useApp();
    const { t, L, go, theme } = app;
    const lesson = byId[p.id];
    const pr = useProgress();
    const videoRef = useRef(null);
    const pending = useRef(null);
    const lastSave = useRef(0);
    const [cur, setCur] = useState(0);
    const [resumed, setResumed] = useState(null);
    const [armed, setArmed] = useState(!app.lite); // lite mode: nothing is downloaded until the user asks
    const [ver, setVer] = useState(() => defaultVersion(theme));
    if (!lesson || !lesson.ready) return html`<${Home} />`;
    const video = lesson.videos.find((x) => x.id === ver) || lesson.videos[0];
    const chapters = lesson.chapters;
    const active = chapterAt(chapters, cur);
    const solo = !!p.solo; // standalone learning platform: one lesson, no course navigation
    const next = solo ? null : LESSONS.find((l) => l.num === lesson.num + 1);
    const jump = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.tagName === 'DETAILS') el.open = true;
      try {
        el.scrollIntoView({ block: 'start', behavior: app.reducedMotion ? 'auto' : 'smooth' });
        const h = el.querySelector('h2');
        if (h) {
          h.setAttribute('tabindex', '-1');
          h.focus({ preventScroll: true });
        }
      } catch (e) {}
    };
    const course = courseOf(lesson.id);

    const save = (el, force) => {
      if (!el || !el.duration) return;
      const now = Date.now();
      if (!force && now - lastSave.current < 4000) return;
      lastSave.current = now;
      setProgress(lesson.id, { pos: el.currentTime, pct: (el.currentTime / el.duration) * 100, at: new Date().toISOString(), ver });
    };
    const onMeta = (e) => {
      const el = e.currentTarget;
      const pend = pending.current;
      pending.current = null;
      if (pend && pend.t != null) el.currentTime = pend.t;
      else {
        const st = progress[lesson.id];
        if (st && !st.done && st.pos > 5 && st.pos < el.duration - 5) {
          el.currentTime = st.pos;
          setResumed(st.pos);
        }
      }
      setCur(el.currentTime);
      if (pend && pend.play) {
        const pr2 = el.play();
        if (pr2 && pr2.catch) pr2.catch(() => {});
      }
    };
    const onTime = (e) => {
      setCur(e.currentTarget.currentTime);
      save(e.currentTarget, false);
    };
    const onPause = (e) => save(e.currentTarget, true);
    const onEnded = () => setProgress(lesson.id, { done: true, pos: 0, pct: 100, at: new Date().toISOString(), ver });

    const seek = (sec) => {
      const el = videoRef.current;
      setResumed(null);
      if (!el) {
        pending.current = { t: sec, play: true };
        setArmed(true);
        return;
      }
      if (el.readyState >= 1) {
        el.currentTime = sec;
        setCur(sec);
        const r = el.play();
        if (r && r.catch) r.catch(() => {});
      } else {
        pending.current = { t: sec, play: true };
        try {
          el.load();
        } catch (e) {}
      }
      try {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'nearest', behavior: app.reducedMotion ? 'auto' : 'smooth' });
      } catch (e) {}
    };
    const switchVer = (id) => {
      if (id === ver) return;
      const el = videoRef.current;
      if (el) pending.current = { t: el.currentTime || 0, play: !el.paused };
      setVer(id);
      MS.store.set('mystat.learn.version', id);
    };

    return html`<div className=${'ml-page ml-lesson-page' + (solo ? ' ml-solo' : '')}>
      ${!solo && html`<${Crumbs} items=${[{ label: t('nav.learn'), onClick: () => go('learn') }, { label: L(course.title), onClick: () => go('learn', { course: course.id }) }, { label: L(lesson.title) }]} />`}
      <header className="ml-head ml-head--lesson">
        <p className="ml-eyebrow">${t('learn.lesson', { n: lesson.num })} · ${t('learn.minutes', { m: Math.round(lesson.duration / 60) })} · ${t('learn.level')}</p>
        <h1 className="ml-title" tabIndex="-1" data-page-title>${L(lesson.title)}</h1>
        <p className="ml-sub">${L(lesson.desc)}</p>
      </header>

      <div className="ml-layout">
        <div className="ml-main">
          <${Player} video=${video} videoRef=${videoRef} armed=${armed} setArmed=${setArmed} label=${t('learn.player', { title: L(lesson.title) })}
            onMeta=${onMeta} onTime=${onTime} onPause=${onPause} onEnded=${onEnded} />
          ${resumed != null &&
          html`<p className="ml-resume" role="status"><span>${t('learn.resumed', { time: mmss(resumed) })}</span>
            <button type="button" className="ms-link" onClick=${() => seek(0)}>${t('learn.fromStart')}</button></p>`}
          <div className="ml-under">
            ${solo
              ? html`<fieldset className="ml-vpick">
                  <legend className="ml-vpick__legend">${t('learn.vPick')}</legend>
                  <div className="ml-vpick__opts">
                    ${lesson.videos.map(
                      (x) => html`<label key=${x.id} className=${'ml-vcard' + (ver === x.id ? ' is-on' : '')}>
                        <input type="radio" name="ml-vpick" value=${x.id} checked=${ver === x.id} onChange=${() => switchVer(x.id)} />
                        <span className="ml-vcard__ic" aria-hidden="true"><${Icon} name="play" size=${18} fill=${true} /></span>
                        <span className="ml-vcard__txt"><strong>${t(x.card + '.t')}</strong><small>${t(x.card + '.d')}</small></span>
                        ${ver === x.id && html`<span className="ml-vcard__now"><${Icon} name="check" size=${14} stroke=${3} />${t('learn.vNow')}</span>`}
                      </label>`,
                    )}
                  </div>
                  <p className="ml-note">${t('learn.versionNote')}</p>
                </fieldset>`
              : html`<${MS.ui.Segmented} id="learn-ver" label=${t('learn.version')} desc=${t('learn.versionNote')} value=${ver} onChange=${switchVer}
                  options=${lesson.videos.map((x) => ({ value: x.id, label: t(x.label) }))} />`}
            ${solo &&
            html`<nav className="ml-jump" aria-label=${t('learn.jump')}>
              <button type="button" className="ml-jump__btn" onClick=${() => jump('ml-chapters')}><${Icon} name="list" size=${20} /><span><strong>${t('learn.chapters')}</strong><small>${t('learn.jump.ch', { n: chapters.length })}</small></span></button>
              ${lesson.quiz && html`<button type="button" className="ml-jump__btn" onClick=${() => jump('ml-quiz')}><${Icon} name="check" size=${20} stroke=${2.4} /><span><strong>${t('learn.test')}</strong><small>${t('learn.jump.quiz', { n: lesson.quiz.length })}</small></span></button>`}
              <button type="button" className="ml-jump__btn" onClick=${() => jump('ml-transcript')}><${Icon} name="file" size=${20} /><span><strong>${t('learn.transcript')}</strong><small>${t('learn.jump.tr')}</small></span></button>
            </nav>`}
            <p className="ml-note"><${Icon} name="globe" size=${16} /><span>${t('learn.videoLang')}</span></p>
            <p className="ml-meta"><${ProgressText} pr=${pr[lesson.id]} /></p>
          </div>
        </div>

        <aside className="ml-side" aria-labelledby="ml-ch-t">
          <div id="ml-chapters" className="ml-box ml-chapters">
            <h2 id="ml-ch-t" className="ml-h2"><${Icon} name="list" size=${20} />${t('learn.chapters')}</h2>
            <ol className="ml-chlist" role="list">
              ${chapters.map(
                (c, i) => html`<li key=${i}>
                  <button type="button" className=${'ml-ch' + (i === active ? ' is-now' : '')} aria-current=${i === active ? 'true' : undefined}
                    aria-label=${t('learn.jumpTo', { title: L(c.title), time: mmss(c.t) })} onClick=${() => seek(c.t)}>
                    <span className="ml-ch__t ms-num">${mmss(c.t)}</span>
                    <span className="ml-ch__name">${L(c.title)}</span>
                  </button>
                </li>`,
              )}
            </ol>
          </div>
          ${next &&
          html`<div className="ml-box ml-next">
            <p className="ml-kicker">${t('learn.next')} · ${t('learn.lesson', { n: next.num })}</p>
            <p className="ml-next__title">${L(next.title)}</p>
            <span className="ml-tag"><${Icon} name="clock" size=${14} />${t('learn.soon')}</span>
          </div>`}
        </aside>

        <div className="ml-rest">
          <section className="ml-box ml-points" aria-labelledby="ml-kp-t">
            <h2 id="ml-kp-t" className="ml-h2"><${Icon} name="lightbulb" size=${20} />${t('learn.keyPoints')}</h2>
            <ul role="list">${lesson.keyPoints.map((k, i) => html`<li key=${i}><${Icon} name="check" size=${18} stroke=${2.4} /><span>${L(k)}</span></li>`)}</ul>
          </section>

          ${lesson.quiz && html`<${Quiz} lesson=${lesson} seek=${seek} />`}

          <details id="ml-transcript" className="ml-box ml-transcript" open>
            <summary><h2 className="ml-h2"><${Icon} name="file" size=${20} />${t('learn.transcript')}</h2></summary>
            <p className="ml-note">${t('learn.transcriptNote')}</p>
            ${chapters.map(
              (c, i) => html`<section key=${i} className=${'ml-tpart' + (i === active ? ' is-now' : '')} aria-labelledby=${'ml-tp-' + i}>
                <h3 id=${'ml-tp-' + i} className="ml-tpart__h">
                  <button type="button" className="ml-time ms-num" aria-label=${t('learn.jumpTo', { title: L(c.title), time: mmss(c.t) })} onClick=${() => seek(c.t)}>${mmss(c.t)}</button>
                  <span>${L(c.title)}</span>
                  ${i === active && cur > 0 && html`<span className="ml-now">${t('learn.now')}</span>`}
                </h3>
                <p>${L(c.text)}</p>
              </section>`,
            )}
          </details>
        </div>

      </div>
    </div>`;
  }

  function LearnPage(p) {
    const { route } = useApp();
    if (p.id) return html`<${Lesson} key=${p.id} id=${p.id} />`;
    if (route.course && courseById[route.course]) return html`<${Course} key=${route.course} course=${courseById[route.course]} />`;
    return html`<${Home} />`;
  }

  /* =====================================================================
   * CABINET BLOCK — «Mening darslarim»
   * ===================================================================== */
  function MyLessons() {
    const { t, L, go, fmt } = useApp();
    const pr = useProgress();
    const list = LESSONS.filter((l) => l.ready && pr[l.id]);
    if (!list.length)
      return html`<div className="ml-my ml-my--empty">
        <p>${t('learn.myEmpty')}</p>
        <button type="button" className="ms-btn" onClick=${() => go('learn')}><${Icon} name="video" size=${18} /><span>${t('learn.goLessons')}</span></button>
      </div>`;
    return html`<div className="ml-my">
      <ul role="list" className="ml-my__list">
        ${list.map((l) => {
          const st = pr[l.id];
          const pct = pctOf(st);
          return html`<li key=${l.id} className="ml-my__item">
            <div className="ml-my__main">
              <strong>${L(l.title)}</strong>
              <small>${t('learn.lesson', { n: l.num })}${st.at ? ' · ' + fmt.date(st.at.slice(0, 10)) : ''}</small>
              <${Bar} pct=${pct} />
              <p className="ml-meta"><${ProgressText} pr=${st} /><${QuizText} pr=${st} /></p>
            </div>
            <button type="button" className="ms-btn ms-btn--sm" onClick=${() => go('learn', { id: l.id })}>
              <${Icon} name="play" size=${16} fill=${true} /><span>${t(actionKey(st))}</span><span className="ms-sr">: ${L(l.title)}</span>
            </button>
          </li>`;
        })}
      </ul>
      <p className="ml-note">${t('learn.localNote')}</p>
    </div>`;
  }

  Object.assign(MS.ui, { LearnPage, MyLessons, LessonPage: Lesson });
})();
