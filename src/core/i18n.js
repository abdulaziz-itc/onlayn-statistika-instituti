/* my.stat — shared i18n dictionary (demo).
 * Format: key -> [uz-Latn, uz-Cyrl, kaa, ru, en]  (order = MS.LOCALES)
 * uz-Latn uses ʻ (U+02BB) in oʻ/gʻ and ʼ (U+02BC) for tutuq belgisi — never ASCII '.
 * kaa (Karakalpak) and uz-Cyrl strings are drafts: needsReview = true (see docs/STATUS.md).
 * Variants add their own keys with MS.i18n.extend({...}) in the same format.
 */
(function () {
  const MS = (window.MS = window.MS || {});
  MS.LOCALES = ['uz-Latn', 'uz-Cyrl', 'kaa', 'ru', 'en'];
  MS.LOCALE_META = {
    'uz-Latn': { native: 'Oʻzbekcha', code: 'UZ', htmlLang: 'uz-Latn', needsReview: false },
    'uz-Cyrl': { native: 'Ўзбекча', code: 'ЎЗ', htmlLang: 'uz-Cyrl', needsReview: true },
    kaa: { native: 'Qaraqalpaqsha', code: 'QQ', htmlLang: 'kaa', needsReview: true },
    ru: { native: 'Русский', code: 'RU', htmlLang: 'ru', needsReview: false },
    en: { native: 'English', code: 'EN', htmlLang: 'en', needsReview: false },
  };

  const D = {
    /* ---------- brand / global ---------- */
    'app.name': ['my.stat', 'my.stat', 'my.stat', 'my.stat', 'my.stat'],
    'org.name': ['Statistika agentligi (DEMO)', 'Статистика агентлиги (DEMO)', 'Statistika agentligi (DEMO)', 'Агентство статистики (DEMO)', 'Statistics Agency (DEMO)'],
    'app.tagline': ['Oʻzbekiston ochiq statistika portali', 'Ўзбекистон очиқ статистика портали', 'Ózbekstan ashıq statistika portalı', 'Открытый портал статистики Узбекистана', 'Open statistics portal of Uzbekistan'],
    'demo.label': ['DEMO · Prototip · Maʼlumotlar shartli (mock)', 'DEMO · Прототип · Маълумотлар шартли (mock)', 'DEMO · Prototip · Maǵlıwmatlar shártli (mock)', 'DEMO · Прототип · Данные условные (mock)', 'DEMO · Prototype · Mock data'],
    'demo.short': ['DEMO', 'DEMO', 'DEMO', 'DEMO', 'DEMO'],
    'demo.notOfficial': ['Raqamlar shartli, rasmiy statistika emas.', 'Рақамлар шартли, расмий статистика эмас.', 'Sanlar shártli, rásmiy statistika emes.', 'Цифры условные и не являются официальной статистикой.', 'Figures are mock values, not official statistics.'],
    'skip': ['Asosiy mazmunga oʻtish', 'Асосий мазмунга ўтиш', 'Tiykarǵı mazmunǵa ótiw', 'Перейти к основному содержанию', 'Skip to main content'],
    'logo.alt': ['my.stat logotipi (vaqtinchalik)', 'my.stat логотипи (вақтинчалик)', 'my.stat logotipi (waqıtsha)', 'Логотип my.stat (временный)', 'my.stat logo (placeholder)'],

    /* ---------- navigation ---------- */
    'nav.label': ['Asosiy menyu', 'Асосий меню', 'Tiykarǵı menyu', 'Главное меню', 'Main menu'],
    'nav.home': ['Bosh sahifa', 'Бош саҳифа', 'Bas bet', 'Главная', 'Home'],
    'nav.indicators': ['Koʻrsatkichlar', 'Кўрсаткичлар', 'Kórsetkishler', 'Показатели', 'Indicators'],
    'nav.regions': ['Hududlar', 'Ҳудудлар', 'Aymaqlar', 'Регионы', 'Regions'],
    'nav.releases': ['Press-relizlar', 'Пресс-релизлар', 'Press-relizler', 'Пресс-релизы', 'Press releases'],
    'nav.calendar': ['Eʼlonlar taqvimi', 'Эълонлар тақвими', 'Járiyalaw kalendarı', 'Календарь публикаций', 'Release calendar'],
    'nav.publications': ['Nashrlar', 'Нашрлар', 'Basılımlar', 'Публикации', 'Publications'],
    'nav.about': ['Biz haqimizda', 'Биз ҳақимизда', 'Biz haqqımızda', 'О нас', 'About'],
    'nav.settings': ['Sozlamalar', 'Созламалар', 'Sazlawlar', 'Настройки', 'Settings'],
    'nav.cabinet': ['Shaxsiy kabinet', 'Шахсий кабинет', 'Jeke kabinet', 'Личный кабинет', 'Personal cabinet'],
    'nav.menu': ['Menyu', 'Меню', 'Menyu', 'Меню', 'Menu'],
    'nav.openMenu': ['Menyuni ochish', 'Менюни очиш', 'Menyunı ashıw', 'Открыть меню', 'Open menu'],
    'nav.closeMenu': ['Menyuni yopish', 'Менюни ёпиш', 'Menyunı jabıw', 'Закрыть меню', 'Close menu'],
    'nav.collapse': ['Menyuni yigʻish', 'Менюни йиғиш', 'Menyunı jıynaw', 'Свернуть меню', 'Collapse menu'],
    'nav.expand': ['Menyuni yoyish', 'Менюни ёйиш', 'Menyunı jayıw', 'Развернуть меню', 'Expand menu'],
    'nav.more': ['Yana', 'Яна', 'Jáne', 'Ещё', 'More'],
    'nav.bottom': ['Tezkor menyu', 'Тезкор меню', 'Tez menyu', 'Быстрое меню', 'Quick menu'],

    /* ---------- search ---------- */
    'search.label': ['Qidirish', 'Қидириш', 'Izlew', 'Поиск', 'Search'],
    'search.placeholder': ['Koʻrsatkichni qidiring, masalan: inflyatsiya', 'Кўрсаткични қидиринг, масалан: инфляция', 'Kórsetkishti izleń, mısalı: inflyaciya', 'Найдите показатель, например: инфляция', 'Search an indicator, e.g. inflation'],
    'search.noResults': ['Hech narsa topilmadi. Boshqa soʻz bilan urinib koʻring.', 'Ҳеч нарса топилмади. Бошқа сўз билан уриниб кўринг.', 'Hesh nárse tabılmadı. Basqa sóz benen urınıp kóriń.', 'Ничего не найдено. Попробуйте другое слово.', 'Nothing found. Try another word.'],
    'search.results': ['{n} ta natija', '{n} та натижа', '{n} nátiyje', 'Результатов: {n}', '{n} results'],
    'search.popular': ['Koʻp qidiriladi', 'Кўп қидирилади', 'Kóp izlenedi', 'Часто ищут', 'Popular searches'],
    'search.submit': ['Topish', 'Топиш', 'Tabıw', 'Найти', 'Find'],

    /* ---------- language ---------- */
    'lang.label': ['Til', 'Тил', 'Til', 'Язык', 'Language'],
    'lang.choose': ['Tilni tanlang', 'Тилни танланг', 'Tildi tańlań', 'Выберите язык', 'Choose language'],
    'lang.changed': ['Til oʻzgartirildi: {name}', 'Тил ўзгартирилди: {name}', 'Til ózgertildi: {name}', 'Язык изменён: {name}', 'Language changed: {name}'],

    /* ---------- theme ---------- */
    'theme.label': ['Koʻrinish', 'Кўриниш', 'Kórinis', 'Оформление', 'Appearance'],
    'theme.toggle': ['Koʻrinishni almashtirish', 'Кўринишни алмаштириш', 'Kórinisti almastırıw', 'Сменить оформление', 'Change appearance'],
    'theme.system': ['Tizim boʻyicha', 'Тизим бўйича', 'Sistema boyınsha', 'Как в системе', 'System'],
    'theme.light': ['Yorugʻ', 'Ёруғ', 'Jaqtı', 'Светлая', 'Light'],
    'theme.dark': ['Qorongʻi', 'Қоронғи', 'Qarańǵı', 'Тёмная', 'Dark'],
    'theme.hc': ['Yuqori kontrast', 'Юқори контраст', 'Joqarı kontrast', 'Высокий контраст', 'High contrast'],
    'theme.current': ['Hozirgi koʻrinish: {name}', 'Ҳозирги кўриниш: {name}', 'Házirgi kórinis: {name}', 'Текущее оформление: {name}', 'Current appearance: {name}'],
    'accent.label': ['Asosiy rang', 'Асосий ранг', 'Tiykarǵı reń', 'Основной цвет', 'Accent colour'],
    'accent.blue': ['Moviy', 'Мовий', 'Kók', 'Синий', 'Blue'],
    'accent.green': ['Yashil', 'Яшил', 'Jasıl', 'Зелёный', 'Green'],

    /* ---------- low vision ---------- */
    'lv.button': ['Koʻzi ojizlar uchun', 'Кўзи ожизлар учун', 'Kóriwi tómenler ushın', 'Для слабовидящих', 'Low vision'],
    'lv.title': ['Koʻzi ojizlar rejimi', 'Кўзи ожизлар режими', 'Kóriwi tómenler rejimi', 'Режим для слабовидящих', 'Low-vision mode'],
    'lv.enabled': ['Rejimni yoqish', 'Режимни ёқиш', 'Rejimdi qosıw', 'Включить режим', 'Turn on the mode'],
    'lv.fontSize': ['Shrift oʻlchami', 'Шрифт ўлчами', 'Shrift ólshemi', 'Размер шрифта', 'Text size'],
    'lv.scheme': ['Rang sxemasi', 'Ранг схемаси', 'Reń sxeması', 'Цветовая схема', 'Colour scheme'],
    'lv.scheme.normal': ['Oddiy', 'Оддий', 'Ápiwayı', 'Обычная', 'Normal'],
    'lv.scheme.hc': ['Yuqori kontrast', 'Юқори контраст', 'Joqarı kontrast', 'Высокий контраст', 'High contrast'],
    'lv.scheme.gray': ['Kulrang', 'Кулранг', 'Kúlreń', 'Оттенки серого', 'Greyscale'],
    'lv.images': ['Rasmlar', 'Расмлар', 'Súwretler', 'Изображения', 'Images'],
    'lv.images.show': ['Koʻrsatish', 'Кўрсатиш', 'Kórsetiw', 'Показывать', 'Show'],
    'lv.images.hide': ['Yashirish', 'Яшириш', 'Jasırıw', 'Скрывать', 'Hide'],
    'lv.spacing': ['Harf va qator oraligʻi', 'Ҳарф ва қатор оралиғи', 'Hárip hám qatar aralıǵı', 'Интервал букв и строк', 'Letter and line spacing'],
    'lv.spacing.normal': ['Oddiy', 'Оддий', 'Ápiwayı', 'Обычный', 'Normal'],
    'lv.spacing.wide': ['Kengaytirilgan', 'Кенгайтирилган', 'Keńeytilgen', 'Увеличенный', 'Increased'],
    'lv.simple': ['Soddalashtirilgan koʻrinish', 'Соддалаштирилган кўриниш', 'Ápiwayılastırılǵan kórinis', 'Упрощённый вид', 'Simplified layout'],
    'lv.simple.desc': ['Bir ustun; grafiklar oʻrniga jadval va matn', 'Бир устун; графиклар ўрнига жадвал ва матн', 'Bir baǵana; grafikler ornına keste hám tekst', 'Одна колонка; вместо графиков таблицы и текст', 'One column; tables and text instead of charts'],
    'lv.reset': ['Asl holiga qaytarish', 'Асл ҳолига қайтариш', 'Dáslepki halına qaytarıw', 'Сбросить', 'Reset'],
    'lv.on': ['Koʻzi ojizlar rejimi yoqildi', 'Кўзи ожизлар режими ёқилди', 'Kóriwi tómenler rejimi qosıldı', 'Режим для слабовидящих включён', 'Low-vision mode on'],
    'lv.off': ['Koʻzi ojizlar rejimi oʻchirildi', 'Кўзи ожизлар режими ўчирилди', 'Kóriwi tómenler rejimi óshirildi', 'Режим для слабовидящих выключен', 'Low-vision mode off'],

    /* ---------- formats, lite, density ---------- */
    'fmt.title': ['Raqam va sana', 'Рақам ва сана', 'San hám sáne', 'Числа и даты', 'Numbers and dates'],
    'fmt.number': ['Raqam formati', 'Рақам формати', 'San formatı', 'Формат чисел', 'Number format'],
    'fmt.date': ['Sana formati', 'Сана формати', 'Sáne formatı', 'Формат даты', 'Date format'],
    'lite.label': ['Yengil rejim', 'Енгил режим', 'Jeńil rejim', 'Облегчённый режим', 'Lite mode'],
    'lite.auto': ['Avtomatik', 'Автоматик', 'Avtomatik', 'Автоматически', 'Automatic'],
    'lite.on': ['Doim yoqilgan', 'Доим ёқилган', 'Hámme waqıt qosılǵan', 'Всегда включён', 'Always on'],
    'lite.off': ['Oʻchirilgan', 'Ўчирилган', 'Óshirilgen', 'Выключен', 'Off'],
    'lite.desc': ['Sekin internet va oddiy telefonlar uchun: grafiklar soddaroq, animatsiyasiz.', 'Секин интернет ва оддий телефонлар учун: графиклар соддароқ, анимациясиз.', 'Áste internet hám ápiwayı telefonlar ushın: grafikler ápiwayıraq, animaciyasız.', 'Для медленного интернета и простых телефонов: простые графики, без анимации.', 'For slow internet and basic phones: simpler charts, no animation.'],
    'lite.active': ['Yengil rejim', 'Енгил режим', 'Jeńil rejim', 'Облегчённый режим', 'Lite mode'],
    'lite.autoReason': ['Sekin aloqa yoki tejash rejimi aniqlandi', 'Секин алоқа ёки тежаш режими аниқланди', 'Áste baylanıs yamasa únemlew rejimi anıqlandı', 'Обнаружена медленная сеть или режим экономии', 'Slow network or data saver detected'],
    'density.label': ['Zichlik', 'Зичлик', 'Tıǵızlıq', 'Плотность', 'Density'],
    'density.comfortable': ['Qulay', 'Қулай', 'Qolaylı', 'Удобная', 'Comfortable'],
    'density.compact': ['Ixcham', 'Ихчам', 'Iqsham', 'Компактная', 'Compact'],

    /* ---------- common ---------- */
    'common.loading': ['Yuklanmoqda…', 'Юкланмоқда…', 'Júklenbekte…', 'Загрузка…', 'Loading…'],
    'common.error': ['Maʼlumotlarni yuklab boʻlmadi. Internetni tekshirib, qayta urinib koʻring.', 'Маълумотларни юклаб бўлмади. Интернетни текшириб, қайта уриниб кўринг.', 'Maǵlıwmatlardı júklep bolmadı. Internetti tekserip, qayta urınıp kóriń.', 'Не удалось загрузить данные. Проверьте интернет и попробуйте ещё раз.', 'Could not load the data. Check your connection and try again.'],
    'common.retry': ['Qayta urinish', 'Қайта уриниш', 'Qayta urınıw', 'Повторить', 'Try again'],
    'common.empty': ['Bu tanlov uchun maʼlumot yoʻq.', 'Бу танлов учун маълумот йўқ.', 'Bul tańlaw ushın maǵlıwmat joq.', 'Для этого выбора нет данных.', 'No data for this selection.'],
    'common.close': ['Yopish', 'Ёпиш', 'Jabıw', 'Закрыть', 'Close'],
    'common.save': ['Saqlash', 'Сақлаш', 'Saqlaw', 'Сохранить', 'Save'],
    'common.saved': ['Saqlandi', 'Сақланди', 'Saqlandı', 'Сохранено', 'Saved'],
    'common.cancel': ['Bekor qilish', 'Бекор қилиш', 'Biykarlaw', 'Отмена', 'Cancel'],
    'common.back': ['Orqaga', 'Орқага', 'Artqa', 'Назад', 'Back'],
    'common.seeAll': ['Hammasini koʻrish', 'Ҳаммасини кўриш', 'Barlıǵın kóriw', 'Смотреть все', 'See all'],
    'common.open': ['Ochish', 'Очиш', 'Ashıw', 'Открыть', 'Open'],
    'common.more': ['Batafsil', 'Батафсил', 'Tolıǵıraq', 'Подробнее', 'Details'],
    'common.updated': ['Yangilangan: {date}', 'Янгиланган: {date}', 'Jańalanǵan: {date}', 'Обновлено: {date}', 'Updated: {date}'],
    'common.nextRelease': ['Keyingi eʼlon: {date}', 'Кейинги эълон: {date}', 'Keyingi járiyalaw: {date}', 'Следующая публикация: {date}', 'Next release: {date}'],
    'common.source': ['Manba', 'Манба', 'Derek', 'Источник', 'Source'],
    'common.methodology': ['Metodologiya', 'Методология', 'Metodologiya', 'Методология', 'Methodology'],
    'common.unit': ['Oʻlchov birligi', 'Ўлчов бирлиги', 'Ólshew birligi', 'Единица измерения', 'Unit'],
    'common.period': ['Davr', 'Давр', 'Dáwir', 'Период', 'Period'],
    'common.region': ['Hudud', 'Ҳудуд', 'Aymaq', 'Регион', 'Region'],
    'common.value': ['Qiymat', 'Қиймат', 'Mánis', 'Значение', 'Value'],
    'common.change': ['Oʻzgarish', 'Ўзгариш', 'Ózgeris', 'Изменение', 'Change'],
    'common.country': ['Oʻzbekiston', 'Ўзбекистон', 'Ózbekstan', 'Узбекистан', 'Uzbekistan'],
    'common.frequency': ['Davriylik', 'Даврийлик', 'Dáwirlilik', 'Периодичность', 'Frequency'],
    'common.yes': ['Ha', 'Ҳа', 'Awa', 'Да', 'Yes'],
    'common.no': ['Yoʻq', 'Йўқ', 'Joq', 'Нет', 'No'],
    'common.comingSoon.title': ['Bu boʻlim keyingi bosqichda', 'Бу бўлим кейинги босқичда', 'Bul bólim keyingi basqıshta', 'Этот раздел — на следующем этапе', 'This section comes in a later phase'],
    'common.comingSoon.desc': ['Bu demo hozircha faqat Bosh sahifani koʻrsatadi. Qolgan sahifalar keyingi bosqichda.', 'Бу демо ҳозирча фақат Бош саҳифани кўрсатади. Қолган саҳифалар кейинги босқичда.', 'Bul demo házirshe tek Bas betti kórsetedi. Qalǵan betler keyingi basqıshta.', 'Это демо пока показывает только главную страницу. Остальные страницы — на следующем этапе.', 'This demo shows only the home page for now. The other pages come in a later phase.'],
    'common.toHome': ['Bosh sahifaga qaytish', 'Бош саҳифага қайтиш', 'Bas betke qaytıw', 'На главную', 'Back to home'],
    'common.mock': ['mock', 'mock', 'mock', 'mock', 'mock'],
    'common.provisional': ['dastlabki', 'дастлабки', 'dáslepki', 'предварительно', 'provisional'],

    /* ---------- change ---------- */
    'change.up': ['oshdi', 'ошди', 'arttı', 'рост', 'up'],
    'change.down': ['kamaydi', 'камайди', 'kemeydi', 'снижение', 'down'],
    'change.flat': ['oʻzgarmadi', 'ўзгармади', 'ózgermedi', 'без изменений', 'no change'],
    'change.pp': ['punkt', 'пункт', 'punkt', 'п. п.', 'pp'],
    'change.vsPrev': ['oldingi davrga nisbatan', 'олдинги даврга нисбатан', 'aldınǵı dáwirge salıstırǵanda', 'к предыдущему периоду', 'vs previous period'],
    'change.good': ['ijobiy', 'ижобий', 'unamlı', 'положительно', 'favourable'],
    'change.bad': ['salbiy', 'салбий', 'unamsız', 'отрицательно', 'unfavourable'],

    /* ---------- home ---------- */
    'home.title': ['Oʻzbekiston raqamlarda', 'Ўзбекистон рақамларда', 'Ózbekstan sanlarda', 'Узбекистан в цифрах', 'Uzbekistan in figures'],
    'home.subtitle': ['Eng muhim koʻrsatkichlar bir sahifada. Qolgani chap menyuda.', 'Энг муҳим кўрсаткичлар бир саҳифада. Қолгани чап менюда.', 'Eń áhmiyetli kórsetkishler bir bette. Qalǵanı shep menyuda.', 'Главные показатели на одной странице. Остальное — в меню слева.', 'The key figures on one page. Everything else is in the left menu.'],
    'home.headline': ['Asosiy koʻrsatkichlar', 'Асосий кўрсаткичлар', 'Tiykarǵı kórsetkishler', 'Основные показатели', 'Key indicators'],
    'home.latest': ['Soʻnggi eʼlonlar', 'Сўнгги эълонлар', 'Sońǵı járiyalawlar', 'Последние публикации', 'Latest releases'],
    'home.upcoming': ['Yaqin eʼlonlar', 'Яқин эълонлар', 'Jaqın járiyalawlar', 'Ближайшие публикации', 'Upcoming releases'],
    'home.searchTitle': ['Qaysi raqam kerak?', 'Қайси рақам керак?', 'Qaysı san kerek?', 'Какая цифра вам нужна?', 'What figure do you need?'],
    'home.published': ['Eʼlon qilindi', 'Эълон қилинди', 'Járiyalandı', 'Опубликовано', 'Published'],
    'home.scheduled': ['Rejada', 'Режада', 'Rejede', 'Запланировано', 'Scheduled'],

    /* ---------- indicator page ---------- */
    'ind.chart': ['Grafik', 'График', 'Grafik', 'График', 'Chart'],
    'ind.table': ['Jadval', 'Жадвал', 'Keste', 'Таблица', 'Table'],
    'ind.map': ['Xarita', 'Харита', 'Karta', 'Карта', 'Map'],
    'ind.viewAs': ['Koʻrinish turi', 'Кўриниш тури', 'Kórinis túri', 'Вид', 'View as'],
    'ind.line': ['Chiziqli', 'Чизиқли', 'Sızıqlı', 'Линия', 'Line'],
    'ind.bar': ['Ustunli', 'Устунли', 'Baǵanalı', 'Столбцы', 'Bars'],
    'ind.chartType': ['Grafik turi', 'График тури', 'Grafik túri', 'Тип графика', 'Chart type'],
    'ind.filters': ['Filtrlar', 'Фильтрлар', 'Filtrler', 'Фильтры', 'Filters'],
    'ind.periodFrom': ['Davr boshi', 'Давр боши', 'Dáwir bası', 'Начало периода', 'From'],
    'ind.periodTo': ['Davr oxiri', 'Давр охири', 'Dáwir aqırı', 'Конец периода', 'To'],
    'ind.regionAll': ['Butun mamlakat', 'Бутун мамлакат', 'Pútkil el', 'Вся страна', 'Whole country'],
    'ind.whatMeans': ['Bu nima degani?', 'Бу нима дегани?', 'Bul ne degeni?', 'Что это значит?', 'What does this mean?'],
    'ind.summaryTitle': ['Qisqacha', 'Қисқача', 'Qısqasha', 'Кратко', 'In short'],
    'ind.summary': ['{period}: {name} — {value}. {changeText}.', '{period}: {name} — {value}. {changeText}.', '{period}: {name} — {value}. {changeText}.', '{period}: {name} — {value}. {changeText}.', '{period}: {name} — {value}. {changeText}.'],
    'ind.summaryRange': ['{from} – {to} davrida eng yuqori qiymat {max} ({maxPeriod}), eng past qiymat {min} ({minPeriod}).', '{from} – {to} даврида энг юқори қиймат {max} ({maxPeriod}), энг паст қиймат {min} ({minPeriod}).', '{from} – {to} dáwirinde eń joqarı mánis {max} ({maxPeriod}), eń tómen mánis {min} ({minPeriod}).', 'За период {from} – {to} максимум {max} ({maxPeriod}), минимум {min} ({minPeriod}).', 'From {from} to {to} the highest value was {max} ({maxPeriod}) and the lowest {min} ({minPeriod}).'],
    'ind.regionsTitle': ['Hududlar boʻyicha, {period}', 'Ҳудудлар бўйича, {period}', 'Aymaqlar boyınsha, {period}', 'По регионам, {period}', 'By region, {period}'],
    'ind.mapNote': ['Sxematik xarita: har bir katak bitta hudud. Rang qanchalik kuchli boʻlsa, qiymat shunchalik yuqori. Katakni bossangiz, oʻsha hudud tanlanadi.', 'Схематик харита: ҳар бир катак битта ҳудуд. Ранг қанчалик кучли бўлса, қиймат шунчалик юқори. Катакни боссангиз, ўша ҳудуд танланади.', 'Sxematik karta: hár bir katak bir aymaq. Reń qanshama kúshli bolsa, mánis sonshama joqarı. Katakti bassańız, sol aymaq tańlanadı.', 'Схематичная карта: каждая клетка — один регион. Чем насыщеннее цвет, тем выше значение. Нажмите на клетку, чтобы выбрать регион.', 'Schematic map: each tile is one region. The stronger the colour, the higher the value. Select a tile to choose that region.'],
    'ind.mapLegendLow': ['past', 'паст', 'tómen', 'ниже', 'lower'],
    'ind.mapLegendHigh': ['yuqori', 'юқори', 'joqarı', 'выше', 'higher'],
    'ind.noRegional': ['Bu koʻrsatkich hududlar boʻyicha eʼlon qilinmaydi.', 'Бу кўрсаткич ҳудудлар бўйича эълон қилинмайди.', 'Bul kórsetkish aymaqlar boyınsha járiyalanbaydı.', 'Этот показатель не публикуется по регионам.', 'This indicator is not published by region.'],
    'ind.download': ['Yuklab olish', 'Юклаб олиш', 'Júklep alıw', 'Скачать', 'Download'],
    'ind.downloadHint': ['Tanlangan davr va hudud boʻyicha', 'Танланган давр ва ҳудуд бўйича', 'Tańlanǵan dáwir hám aymaq boyınsha', 'С учётом выбранного периода и региона', 'For the selected period and region'],
    'ind.downloadDone': ['Fayl tayyor: {file}', 'Файл тайёр: {file}', 'Fayl tayar: {file}', 'Файл готов: {file}', 'File ready: {file}'],
    'ind.downloadDeclined': ['Yuklab olish bekor qilindi', 'Юклаб олиш бекор қилинди', 'Júklep alıw biykarlandı', 'Скачивание отменено', 'Download cancelled'],
    'ind.downloadUnavailable': ['Bu oynada yuklab olish ishlamaydi', 'Бу ойнада юклаб олиш ишламайди', 'Bul aynada júklep alıw islemeydi', 'В этом окне скачивание недоступно', 'Downloads are not available in this view'],
    'ind.pdfNote': ['PDF demo uchun: bitta sahifali hisobot', 'PDF демо учун: битта саҳифали ҳисобот', 'PDF demo ushın: bir betlik esabat', 'PDF для демо: отчёт на одну страницу', 'Demo PDF: one-page report'],
    'ind.share': ['Havolani ulashish', 'Ҳаволани улашиш', 'Siltemeni bólisiw', 'Поделиться ссылкой', 'Share link'],
    'ind.shareCopied': ['Havola nusxalandi', 'Ҳавола нусхаланди', 'Silteme kóshirildi', 'Ссылка скопирована', 'Link copied'],
    'ind.shareFallback': ['Havolani belgilab, nusxa oling', 'Ҳаволани белгилаб, нусха олинг', 'Siltemeni belgilep, kóshirip alıń', 'Выделите ссылку и скопируйте', 'Select the link and copy it'],
    'ind.saveIt': ['Saqlanganlarga qoʻshish', 'Сақланганларга қўшиш', 'Saqlanǵanlarǵa qosıw', 'Добавить в сохранённые', 'Save to my list'],
    'ind.savedIt': ['Saqlanganlarda', 'Сақланганларда', 'Saqlanǵanlarda', 'В сохранённых', 'Saved'],
    'ind.savedToast': ['Shaxsiy kabinetga saqlandi', 'Шахсий кабинетга сақланди', 'Jeke kabinetke saqlandı', 'Сохранено в личном кабинете', 'Saved to your cabinet'],
    'ind.unsavedToast': ['Saqlanganlardan olib tashlandi', 'Сақланганлардан олиб ташланди', 'Saqlanǵanlardan alıp taslandı', 'Удалено из сохранённых', 'Removed from saved'],
    'ind.needLoginSave': ['Saqlash uchun avval kiring', 'Сақлаш учун аввал киринг', 'Saqlaw ushın aldın kiriń', 'Чтобы сохранить, войдите', 'Sign in to save'],
    'ind.related': ['Bogʻliq koʻrsatkichlar', 'Боғлиқ кўрсаткичлар', 'Baylanıslı kórsetkishler', 'Связанные показатели', 'Related indicators'],
    'ind.latest': ['Soʻnggi qiymat', 'Сўнгги қиймат', 'Sońǵı mánis', 'Последнее значение', 'Latest value'],
    'ind.prev': ['Oldingi davr', 'Олдинги давр', 'Aldınǵı dáwir', 'Предыдущий период', 'Previous period'],
    'ind.notFound': ['Koʻrsatkich topilmadi', 'Кўрсаткич топилмади', 'Kórsetkish tabılmadı', 'Показатель не найден', 'Indicator not found'],
    'ind.chartAria': ['{name} grafigi. Matnli tavsif va jadval shu yerda.', '{name} графиги. Матнли тавсиф ва жадвал шу ерда.', '{name} grafigi. Tekstli táriyp hám keste usı jerde.', 'График: {name}. Текстовое описание и таблица — рядом.', 'Chart: {name}. Text summary and table are next to it.'],
    'ind.tableCaption': ['{name}, {unit}', '{name}, {unit}', '{name}, {unit}', '{name}, {unit}', '{name}, {unit}'],
    'ind.code': ['Kod', 'Код', 'Kod', 'Код', 'Code'],
    'freq.M': ['Oylik', 'Ойлик', 'Aylıq', 'Ежемесячно', 'Monthly'],
    'freq.Q': ['Choraklik', 'Чораклик', 'Shereklik', 'Ежеквартально', 'Quarterly'],
    'freq.A': ['Yillik', 'Йиллик', 'Jıllıq', 'Ежегодно', 'Annual'],
    'period.quarter': ['{y}-yil {q}-chorak', '{y} йил {q}-чорак', '{y}-jıl {q}-sherek', '{q} кв. {y}', 'Q{q} {y}'],
    'period.year': ['{y}-yil', '{y} йил', '{y}-jıl', '{y} г.', '{y}'],
    'period.month': ['{y}-yil {m}', '{m} {y}', '{y}-jıl {m}', '{m} {y}', '{m} {y}'],

    /* ---------- auth ---------- */
    'auth.login': ['OneID orqali kirish (demo)', 'OneID орқали кириш (демо)', 'OneID arqalı kiriw (demo)', 'Войти через OneID (демо)', 'Sign in with OneID (demo)'],
    'auth.loginShort': ['Kirish', 'Кириш', 'Kiriw', 'Войти', 'Sign in'],
    'auth.logout': ['Chiqish', 'Чиқиш', 'Shıǵıw', 'Выйти', 'Sign out'],
    'auth.pickRole': ['Demo uchun rolni tanlang', 'Демо учун ролни танланг', 'Demo ushın roldi tańlań', 'Выберите роль для демо', 'Choose a demo role'],
    'auth.pickRoleDesc': ['Haqiqiy OneID ulanmagan. Shaxsiy maʼlumot (JSHSHIR, pasport) soʻralmaydi.', 'Ҳақиқий OneID уланмаган. Шахсий маълумот (ЖШШИР, паспорт) сўралмайди.', 'Haqıyqıy OneID qosılmaǵan. Jeke maǵlıwmat (JSHSHIR, pasport) soralmaydı.', 'Настоящий OneID не подключён. Личные данные (ПИНФЛ, паспорт) не запрашиваются.', 'Real OneID is not connected. No personal data (PINFL, passport) is requested.'],
    'auth.continue': ['Davom etish', 'Давом этиш', 'Dawam etiw', 'Продолжить', 'Continue'],
    'auth.loggedAs': ['{name} sifatida kirdingiz', '{name} сифатида кирдингиз', '{name} retinde kirdińiz', 'Вы вошли как {name}', 'Signed in as {name}'],
    'auth.loggedOut': ['Tizimdan chiqdingiz', 'Тизимдан чиқдингиз', 'Sistemadan shıqtıńız', 'Вы вышли из системы', 'You have signed out'],
    'auth.guest': ['Mehmon', 'Меҳмон', 'Miyman', 'Гость', 'Guest'],
    'auth.needLogin': ['Kabinetdan foydalanish uchun kiring', 'Кабинетдан фойдаланиш учун киринг', 'Kabinetten paydalanıw ushın kiriń', 'Войдите, чтобы пользоваться кабинетом', 'Sign in to use the cabinet'],
    'auth.needLoginDesc': ['Saqlangan koʻrsatkichlar, yuklab olishlar tarixi va bildirishnomalar shu yerda boʻladi.', 'Сақланган кўрсаткичлар, юклаб олишлар тарихи ва билдиришномалар шу ерда бўлади.', 'Saqlanǵan kórsetkishler, júklep alıwlar tariyxı hám xabarlamalar usı jerde boladı.', 'Здесь будут сохранённые показатели, история скачиваний и уведомления.', 'Saved indicators, download history and notifications will be here.'],
    'auth.signingIn': ['Kirilmoqda…', 'Кирилмоқда…', 'Kirilmekte…', 'Вход…', 'Signing in…'],
    'role.label': ['Rol', 'Рол', 'Rol', 'Роль', 'Role'],
    'role.citizen': ['Fuqaro', 'Фуқаро', 'Puqara', 'Гражданин', 'Citizen'],
    'role.org': ['Tashkilot', 'Ташкилот', 'Shólkem', 'Организация', 'Organization'],
    'role.staff': ['Agentlik xodimi', 'Агентлик ходими', 'Agentlik xızmetkeri', 'Сотрудник агентства', 'Agency staff'],
    'role.citizen.desc': ['Saqlangan koʻrsatkichlar, yuklab olishlar, bildirishnomalar', 'Сақланган кўрсаткичлар, юклаб олишлар, билдиришномалар', 'Saqlanǵan kórsetkishler, júklep alıwlar, xabarlamalar', 'Сохранённые показатели, скачивания, уведомления', 'Saved indicators, downloads, notifications'],
    'role.org.desc': ['Fuqaro imkoniyatlari + tashkilot profili', 'Фуқаро имкониятлари + ташкилот профили', 'Puqara múmkinshilikleri + shólkem profili', 'Возможности гражданина + профиль организации', 'Citizen features + organization profile'],
    'role.staff.desc': ['Fuqaro imkoniyatlari + kontentni oldindan koʻrish', 'Фуқаро имкониятлари + контентни олдиндан кўриш', 'Puqara múmkinshilikleri + kontentti aldınnan kóriw', 'Возможности гражданина + предпросмотр контента', 'Citizen features + content preview'],

    /* ---------- settings / profile / cabinet ---------- */
    'settings.title': ['Sozlamalar', 'Созламалар', 'Sazlawlar', 'Настройки', 'Settings'],
    'settings.subtitle': ['Til, koʻrinish, maxsus imkoniyatlar va profil', 'Тил, кўриниш, махсус имкониятлар ва профил', 'Til, kórinis, arnawlı múmkinshilikler hám profil', 'Язык, оформление, специальные возможности и профиль', 'Language, appearance, accessibility and profile'],
    'settings.appearance': ['Til va koʻrinish', 'Тил ва кўриниш', 'Til hám kórinis', 'Язык и оформление', 'Language and appearance'],
    'settings.access': ['Maxsus imkoniyatlar', 'Махсус имкониятлар', 'Arnawlı múmkinshilikler', 'Специальные возможности', 'Accessibility'],
    'settings.performance': ['Tezlik', 'Тезлик', 'Tezlik', 'Скорость', 'Performance'],
    'settings.savedToast': ['Sozlama saqlandi', 'Созлама сақланди', 'Sazlaw saqlandı', 'Настройка сохранена', 'Setting saved'],
    'profile.title': ['Profil', 'Профил', 'Profil', 'Профиль', 'Profile'],
    'profile.edit': ['Profilni tahrirlash', 'Профилни таҳрирлаш', 'Profildi ózgertiw', 'Редактировать профиль', 'Edit profile'],
    'profile.name': ['Ism-sharif', 'Исм-шариф', 'Atı-familiyası', 'Имя и фамилия', 'Full name'],
    'profile.email': ['Elektron pochta', 'Электрон почта', 'Elektron pochta', 'Электронная почта', 'Email'],
    'profile.phone': ['Telefon', 'Телефон', 'Telefon', 'Телефон', 'Phone'],
    'profile.id': ['Demo ID', 'Демо ID', 'Demo ID', 'Демо-ID', 'Demo ID'],
    'profile.fake': ['Barcha maʼlumotlar soxta (demo).', 'Барча маълумотлар сохта (демо).', 'Barlıq maǵlıwmatlar jalǵan (demo).', 'Все данные вымышленные (демо).', 'All data here is fake (demo).'],
    'profile.err.name': ['Ism-sharifni kiriting (kamida 3 ta harf).', 'Исм-шарифни киритинг (камида 3 та ҳарф).', 'Atı-familiyasın kirgiziń (keminde 3 hárip).', 'Введите имя и фамилию (минимум 3 буквы).', 'Enter your full name (at least 3 letters).'],
    'profile.err.email': ['Elektron pochta notoʻgʻri. Masalan: ism@example.uz', 'Электрон почта нотўғри. Масалан: ism@example.uz', 'Elektron pochta qáte. Mısalı: ism@example.uz', 'Неверный адрес почты. Пример: ism@example.uz', 'The email address is not valid. Example: ism@example.uz'],
    'profile.err.phone': ['Telefon +998 XX XXX XX XX koʻrinishida boʻlsin.', 'Телефон +998 XX XXX XX XX кўринишида бўлсин.', 'Telefon +998 XX XXX XX XX túrinde bolsın.', 'Телефон в формате +998 XX XXX XX XX.', 'Use the format +998 XX XXX XX XX.'],
    'profile.err.summary': ['Formada {n} ta xato bor. Iltimos, tuzating.', 'Формада {n} та хато бор. Илтимос, тузатинг.', 'Formada {n} qáte bar. Ótinish, dúzetiń.', 'В форме ошибок: {n}. Исправьте, пожалуйста.', 'The form has {n} errors. Please fix them.'],
    'profile.saved': ['Profil saqlandi', 'Профил сақланди', 'Profil saqlandı', 'Профиль сохранён', 'Profile saved'],
    'cab.title': ['Shaxsiy kabinet', 'Шахсий кабинет', 'Jeke kabinet', 'Личный кабинет', 'Personal cabinet'],
    'cab.saved': ['Saqlangan koʻrsatkichlar', 'Сақланган кўрсаткичлар', 'Saqlanǵan kórsetkishler', 'Сохранённые показатели', 'Saved indicators'],
    'cab.savedEmpty': ['Hali hech narsa saqlanmagan. Koʻrsatkich sahifasida «Saqlanganlarga qoʻshish» tugmasini bosing.', 'Ҳали ҳеч нарса сақланмаган. Кўрсаткич саҳифасида «Сақланганларга қўшиш» тугмасини босинг.', 'Ele hesh nárse saqlanbaǵan. Kórsetkish betinde «Saqlanǵanlarǵa qosıw» túymesin basıń.', 'Пока ничего не сохранено. Нажмите «Добавить в сохранённые» на странице показателя.', 'Nothing saved yet. Press “Save to my list” on an indicator page.'],
    'cab.history': ['Yuklab olishlar tarixi', 'Юклаб олишлар тарихи', 'Júklep alıwlar tariyxı', 'История скачиваний', 'Download history'],
    'cab.historyEmpty': ['Hali hech narsa yuklab olinmagan.', 'Ҳали ҳеч нарса юклаб олинмаган.', 'Ele hesh nárse júklep alınbaǵan.', 'Скачиваний пока нет.', 'No downloads yet.'],
    'cab.notifications': ['Bildirishnomalar', 'Билдиришномалар', 'Xabarlamalar', 'Уведомления', 'Notifications'],
    'cab.notif.release': ['«{name}» boʻyicha yangi maʼlumot eʼlon qilindi', '«{name}» бўйича янги маълумот эълон қилинди', '«{name}» boyınsha jańa maǵlıwmat járiyalandı', 'Опубликованы новые данные: «{name}»', 'New data published: “{name}”'],
    'cab.notif.next': ['«{name}» keyingi eʼloni: {date}', '«{name}» кейинги эълони: {date}', '«{name}» keyingi járiyalawı: {date}', 'Следующая публикация «{name}»: {date}', 'Next release of “{name}”: {date}'],
    'cab.notif.welcome': ['my.stat demo versiyasiga xush kelibsiz', 'my.stat демо версиясига хуш келибсиз', 'my.stat demo versiyasına xosh keldińiz', 'Добро пожаловать в демо-версию my.stat', 'Welcome to the my.stat demo'],
    'cab.remove': ['Olib tashlash', 'Олиб ташлаш', 'Alıp taslaw', 'Удалить', 'Remove'],
    'cab.org': ['Tashkilot profili', 'Ташкилот профили', 'Shólkem profili', 'Профиль организации', 'Organization profile'],
    'cab.org.name': ['Tashkilot nomi', 'Ташкилот номи', 'Shólkem atı', 'Название организации', 'Organization name'],
    'cab.org.nameValue': ['«Namuna Savdo» MChJ (demo)', '«Намуна Савдо» МЧЖ (демо)', '«Namuna Savdo» JShJ (demo)', 'ООО «Намуна Савдо» (демо)', 'Namuna Savdo LLC (demo)'],
    'cab.org.tin': ['STIR (demo)', 'СТИР (демо)', 'STIR (demo)', 'ИНН (демо)', 'TIN (demo)'],
    'cab.org.activity': ['Faoliyat turi', 'Фаолият тури', 'Xızmet túri', 'Вид деятельности', 'Activity'],
    'cab.org.activityValue': ['Chakana savdo', 'Чакана савдо', 'Usaq sawda', 'Розничная торговля', 'Retail trade'],
    'cab.org.later': ['Statistik hisobot topshirish — keyingi bosqichda', 'Статистик ҳисобот топшириш — кейинги босқичда', 'Statistikalıq esabat tapsırıw — keyingi basqıshta', 'Сдача статистической отчётности — на следующем этапе', 'Statistical report submission — later phase'],
    'cab.staff': ['Kontentni oldindan koʻrish (demo)', 'Контентни олдиндан кўриш (демо)', 'Kontentti aldınnan kóriw (demo)', 'Предпросмотр контента (демо)', 'Content preview (demo)'],
    'cab.staff.desc': ['Eʼlon qilinishidan oldin press-relizlar shunday koʻrinadi.', 'Эълон қилинишидан олдин пресс-релизлар шундай кўринади.', 'Járiyalanbastan aldın press-relizler usınday kórinedi.', 'Так пресс-релизы выглядят до публикации.', 'This is how press releases look before publication.'],
    'cab.staff.draft': ['Qoralama', 'Қоралама', 'Qaralama', 'Черновик', 'Draft'],
    'cab.staff.scheduled': ['Rejalashtirilgan', 'Режалаштирилган', 'Rejelestirilgen', 'Запланировано', 'Scheduled'],
    'cab.staff.later': ['Nashr qilish vositalari — keyingi bosqichda', 'Нашр қилиш воситалари — кейинги босқичда', 'Basıp shıǵarıw quralları — keyingi basqıshta', 'Инструменты публикации — на следующем этапе', 'Publishing tools — later phase'],
    'cab.welcome': ['Xush kelibsiz, {name}', 'Хуш келибсиз, {name}', 'Xosh keldińiz, {name}', 'Добро пожаловать, {name}', 'Welcome, {name}'],

    /* ---------- feedback & footer ---------- */
    'feedback.button': ['Fikr bildirish', 'Фикр билдириш', 'Pikir bildiriw', 'Оставить отзыв', 'Give feedback'],
    'feedback.title': ['Demo haqida fikringiz', 'Демо ҳақида фикрингиз', 'Demo haqqında pikirińiz', 'Ваш отзыв о демо', 'Your feedback on the demo'],
    'feedback.label': ['Nima yoqdi yoki nima tushunarsiz boʻldi?', 'Нима ёқди ёки нима тушунарсиз бўлди?', 'Ne unadı yamasa ne túsiniksiz boldı?', 'Что понравилось или что было непонятно?', 'What did you like or find unclear?'],
    'feedback.send': ['Yuborish', 'Юбориш', 'Jiberiw', 'Отправить', 'Send'],
    'feedback.thanks': ['Rahmat! (Demo: fikr hech qayerga yuborilmaydi.)', 'Раҳмат! (Демо: фикр ҳеч қаерга юборилмайди.)', 'Raxmet! (Demo: pikir hesh jerge jiberilmeydi.)', 'Спасибо! (Демо: отзыв никуда не отправляется.)', 'Thank you! (Demo: feedback is not sent anywhere.)'],
    'feedback.err': ['Kamida bir necha soʻz yozing.', 'Камида бир неча сўз ёзинг.', 'Keminde bir neshe sóz jazıń.', 'Напишите хотя бы несколько слов.', 'Please write at least a few words.'],
    'footer.rights': ['© 2026 my.stat · Prototip', '© 2026 my.stat · Прототип', '© 2026 my.stat · Prototip', '© 2026 my.stat · Прототип', '© 2026 my.stat · Prototype'],
    'footer.a11y': ['Maxsus imkoniyatlar bayonoti', 'Махсус имкониятлар баёноти', 'Arnawlı múmkinshilikler bayanatı', 'Заявление о доступности', 'Accessibility statement'],
    'footer.openData': ['Ochiq maʼlumotlar', 'Очиқ маълумотлар', 'Ashıq maǵlıwmatlar', 'Открытые данные', 'Open data'],

    /* ---------- gallery shell ---------- */
    'gallery.title': ['my.stat dizayn variantlari', 'my.stat дизайн вариантлари', 'my.stat dizayn variantları', 'Варианты дизайна my.stat', 'my.stat design variants'],
    'gallery.choose': ['Variantni tanlang', 'Вариантни танланг', 'Variantti tańlań', 'Выберите вариант', 'Choose a variant'],
    'gallery.compare': ['Solishtirish', 'Солиштириш', 'Salıstırıw', 'Сравнение', 'Compare'],
    'gallery.screen': ['Ekran', 'Экран', 'Ekran', 'Экран', 'Screen'],
    'gallery.hide': ['Panelni yashirish', 'Панелни яшириш', 'Paneldi jasırıw', 'Скрыть панель', 'Hide panel'],
    'gallery.show': ['Variantlar paneli', 'Вариантлар панели', 'Variantlar paneli', 'Панель вариантов', 'Variants panel'],
    'gallery.idea': ['Gʻoya', 'Ғоя', 'Ideya', 'Идея', 'Idea'],
    'gallery.strengths': ['Kuchli tomoni', 'Кучли томони', 'Kúshli tárepi', 'Сильные стороны', 'Strengths'],
    'gallery.weaknesses': ['Zaif tomoni', 'Заиф томони', 'Hálsiz tárepi', 'Слабые стороны', 'Weaknesses'],
    'gallery.bestFor': ['Kim uchun', 'Ким учун', 'Kim ushın', 'Для кого', 'Best for'],
    'gallery.variant': ['Variant', 'Вариант', 'Variant', 'Вариант', 'Variant'],
    'gallery.qa': ['Tarjima tekshiruvi: {missing} ta kalit yetishmaydi', 'Таржима текшируви: {missing} та калит етишмайди', 'Awdarma tekseriwi: {missing} gilt jetispeydi', 'Проверка перевода: не хватает ключей: {missing}', 'Translation check: {missing} keys missing'],
  };

  MS.MONTHS = {
    'uz-Latn': ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
    'uz-Cyrl': ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    kaa: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
    ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  MS.MONTHS_SHORT = {
    'uz-Latn': ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    'uz-Cyrl': ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    kaa: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  /* Genitive month names for long dates ("2 ноября 2026") */
  MS.MONTHS_GEN = {
    'uz-Latn': MS.MONTHS['uz-Latn'],
    'uz-Cyrl': MS.MONTHS['uz-Cyrl'],
    kaa: MS.MONTHS.kaa,
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    en: MS.MONTHS.en,
  };
  /* Large-number short forms */
  MS.SHORT_UNITS = {
    mln: ['mln', 'млн', 'mln', 'млн', 'M'],
    mlrd: ['mlrd', 'млрд', 'mlrd', 'млрд', 'bn'],
  };

  /* Keys allowed to be identical across locales (brand, codes, templates). */
  const SAME_OK = new Set(['app.name', 'demo.short', 'common.mock', 'ind.summary', 'ind.tableCaption']);

  const dict = {};
  function extend(entries) {
    Object.keys(entries).forEach((k) => {
      dict[k] = entries[k];
    });
  }
  extend(D);

  function idx(locale) {
    const i = MS.LOCALES.indexOf(locale);
    return i < 0 ? 0 : i;
  }
  function translate(locale, key, params) {
    const row = dict[key];
    let s;
    if (!row) {
      s = key; // visible on purpose so a missing key is caught in review
      if (!translate._warned[key]) {
        translate._warned[key] = 1;
        console.warn('[i18n] missing key', key);
      }
    } else s = row[idx(locale)] || row[0];
    if (params) s = s.replace(/\{(\w+)\}/g, (m, p) => (params[p] !== undefined ? params[p] : m));
    return s;
  }
  translate._warned = {};

  /* Completeness check: every key has 5 non-empty strings; uz-Latn/kaa contain no ASCII or curly apostrophes. */
  function check() {
    const missing = [];
    const badApostrophe = [];
    const sameAsEn = [];
    Object.keys(dict).forEach((k) => {
      const row = dict[k];
      if (!Array.isArray(row) || row.length !== 5 || row.some((s) => typeof s !== 'string' || !s.trim())) missing.push(k);
      else {
        if (/['‘’`]/.test(row[0]) || /['‘’`]/.test(row[2])) badApostrophe.push(k);
        if (!SAME_OK.has(k) && row[0] === row[4] && !/^[\d\W]*$/.test(row[0])) sameAsEn.push(k);
      }
    });
    return { total: Object.keys(dict).length, missing, badApostrophe, sameAsEn };
  }

  MS.i18n = { dict, extend, translate, check, idx };
})();
