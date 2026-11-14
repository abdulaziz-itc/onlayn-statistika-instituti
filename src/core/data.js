/* my.stat — mock data + dataService (demo).
 * All numbers are MOCK: deterministic (seeded), plausible orders of magnitude, NOT official statistics.
 * Shape follows docs/05-mock-data.md so a real API can replace dataService without UI changes.
 */
(function () {
  const MS = (window.MS = window.MS || {});
  const L = (uzl, uzc, kaa, ru, en) => ({ 'uz-Latn': uzl, 'uz-Cyrl': uzc, kaa: kaa, ru: ru, en: en });

  /* ---------- regions (14) — col/row = position on the schematic tile map ---------- */
  const REGIONS = [
    { id: 'UZ-QR', name: L('Qoraqalpogʻiston Respublikasi', 'Қорақалпоғистон Республикаси', 'Qaraqalpaqstan Respublikası', 'Республика Каракалпакстан', 'Republic of Karakalpakstan'), short: L('Qoraqalpogʻiston', 'Қорақалпоғистон', 'Qaraqalpaqstan', 'Каракалпакстан', 'Karakalpakstan'), abbr: L('QR', 'ҚР', 'QR', 'РК', 'KR'), pop: 2.0, col: 0, row: 0 },
    { id: 'UZ-XO', name: L('Xorazm viloyati', 'Хоразм вилояти', 'Xorezm wálayatı', 'Хорезмская область', 'Khorezm Region'), short: L('Xorazm', 'Хоразм', 'Xorezm', 'Хорезм', 'Khorezm'), abbr: L('XO', 'ХО', 'XO', 'ХО', 'KH'), pop: 1.98, col: 1, row: 1 },
    { id: 'UZ-NW', name: L('Navoiy viloyati', 'Навоий вилояти', 'Nawayı wálayatı', 'Навоийская область', 'Navoi Region'), short: L('Navoiy', 'Навоий', 'Nawayı', 'Навои', 'Navoi'), abbr: L('NV', 'НВ', 'NV', 'НВ', 'NV'), pop: 1.07, col: 2, row: 0 },
    { id: 'UZ-BU', name: L('Buxoro viloyati', 'Бухоро вилояти', 'Buxara wálayatı', 'Бухарская область', 'Bukhara Region'), short: L('Buxoro', 'Бухоро', 'Buxara', 'Бухара', 'Bukhara'), abbr: L('BU', 'БУ', 'BU', 'БУ', 'BU'), pop: 2.03, col: 2, row: 1 },
    { id: 'UZ-SA', name: L('Samarqand viloyati', 'Самарқанд вилояти', 'Samarqand wálayatı', 'Самаркандская область', 'Samarkand Region'), short: L('Samarqand', 'Самарқанд', 'Samarqand', 'Самарканд', 'Samarkand'), abbr: L('SA', 'СА', 'SA', 'СА', 'SA'), pop: 4.19, col: 3, row: 1 },
    { id: 'UZ-QA', name: L('Qashqadaryo viloyati', 'Қашқадарё вилояти', 'Qashqadárya wálayatı', 'Кашкадарьинская область', 'Kashkadarya Region'), short: L('Qashqadaryo', 'Қашқадарё', 'Qashqadárya', 'Кашкадарья', 'Kashkadarya'), abbr: L('QA', 'ҚА', 'QA', 'КА', 'KA'), pop: 3.74, col: 3, row: 2 },
    { id: 'UZ-SU', name: L('Surxondaryo viloyati', 'Сурхондарё вилояти', 'Surxandárya wálayatı', 'Сурхандарьинская область', 'Surkhandarya Region'), short: L('Surxondaryo', 'Сурхондарё', 'Surxandárya', 'Сурхандарья', 'Surkhandarya'), abbr: L('SU', 'СУ', 'SU', 'СУ', 'SU'), pop: 2.94, col: 4, row: 2 },
    { id: 'UZ-JI', name: L('Jizzax viloyati', 'Жиззах вилояти', 'Jizzaq wálayatı', 'Джизакская область', 'Jizzakh Region'), short: L('Jizzax', 'Жиззах', 'Jizzaq', 'Джизак', 'Jizzakh'), abbr: L('JI', 'ЖИ', 'JI', 'ДЖ', 'JI'), pop: 1.5, col: 4, row: 0 },
    { id: 'UZ-SI', name: L('Sirdaryo viloyati', 'Сирдарё вилояти', 'Sırdárya wálayatı', 'Сырдарьинская область', 'Syrdarya Region'), short: L('Sirdaryo', 'Сирдарё', 'Sırdárya', 'Сырдарья', 'Syrdarya'), abbr: L('SI', 'СИ', 'SI', 'СЫ', 'SY'), pop: 0.92, col: 4, row: 1 },
    { id: 'UZ-TK', name: L('Toshkent shahri', 'Тошкент шаҳри', 'Tashkent qalası', 'город Ташкент', 'Tashkent City'), short: L('Toshkent sh.', 'Тошкент ш.', 'Tashkent q.', 'г. Ташкент', 'Tashkent City'), abbr: L('TSh', 'ТШ', 'TQ', 'ТГ', 'TC'), pop: 3.1, col: 5, row: 0 },
    { id: 'UZ-TO', name: L('Toshkent viloyati', 'Тошкент вилояти', 'Tashkent wálayatı', 'Ташкентская область', 'Tashkent Region'), short: L('Toshkent v.', 'Тошкент в.', 'Tashkent w.', 'Ташкентская обл.', 'Tashkent Reg.'), abbr: L('TV', 'ТВ', 'TW', 'ТО', 'TR'), pop: 3.0, col: 6, row: 0 },
    { id: 'UZ-NG', name: L('Namangan viloyati', 'Наманган вилояти', 'Namangan wálayatı', 'Наманганская область', 'Namangan Region'), short: L('Namangan', 'Наманган', 'Namangan', 'Наманган', 'Namangan'), abbr: L('NA', 'НА', 'NA', 'НА', 'NA'), pop: 3.0, col: 7, row: 0 },
    { id: 'UZ-FA', name: L('Fargʻona viloyati', 'Фарғона вилояти', 'Ferǵana wálayatı', 'Ферганская область', 'Fergana Region'), short: L('Fargʻona', 'Фарғона', 'Ferǵana', 'Фергана', 'Fergana'), abbr: L('FA', 'ФА', 'FE', 'ФЕ', 'FE'), pop: 4.0, col: 6, row: 1 },
    { id: 'UZ-AN', name: L('Andijon viloyati', 'Андижон вилояти', 'Ándijan wálayatı', 'Андижанская область', 'Andijan Region'), short: L('Andijon', 'Андижон', 'Ándijan', 'Андижан', 'Andijan'), abbr: L('AN', 'АН', 'ÁN', 'АН', 'AN'), pop: 3.4, col: 7, row: 1 },
  ];
  const POP_TOTAL = REGIONS.reduce((s, r) => s + r.pop, 0);

  /* ---------- units ---------- */
  const U = {
    pct: L('%', '%', '%', '%', '%'),
    mlnPeople: L('mln kishi', 'млн киши', 'mln adam', 'млн человек', 'million people'),
    thPeople: L('ming kishi', 'минг киши', 'mıń adam', 'тыс. человек', 'thousand people'),
    trlnSum: L('trln soʻm', 'трлн сўм', 'trln sum', 'трлн сум', 'UZS trillion'),
    mlnSum: L('mln soʻm', 'млн сўм', 'mln sum', 'млн сум', 'UZS million'),
    thSum: L('ming soʻm', 'минг сўм', 'mıń sum', 'тыс. сум', 'UZS thousand'),
    mlnUsd: L('mln AQSh dollari', 'млн АҚШ доллари', 'mln AQSh dolları', 'млн долл. США', 'USD million'),
    thTon: L('ming tonna', 'минг тонна', 'mıń tonna', 'тыс. тонн', 'thousand tonnes'),
  };

  const CATEGORIES = {
    demography: L('Demografiya', 'Демография', 'Demografiya', 'Демография', 'Demography'),
    gdp: L('Yalpi ichki mahsulot', 'Ялпи ички маҳсулот', 'Jalpı ishki ónim', 'Валовой внутренний продукт', 'Gross domestic product'),
    prices: L('Narxlar va inflyatsiya', 'Нархлар ва инфляция', 'Bahalar hám inflyaciya', 'Цены и инфляция', 'Prices and inflation'),
    labour: L('Mehnat bozori', 'Меҳнат бозори', 'Miynet bazarı', 'Рынок труда', 'Labour market'),
    trade: L('Tashqi savdo', 'Ташқи савдо', 'Sırtqı sawda', 'Внешняя торговля', 'Foreign trade'),
    industry: L('Sanoat', 'Саноат', 'Sanaat', 'Промышленность', 'Industry'),
    agriculture: L('Qishloq xoʻjaligi', 'Қишлоқ хўжалиги', 'Awıl xojalıǵı', 'Сельское хозяйство', 'Agriculture'),
    construction: L('Qurilish', 'Қурилиш', 'Qurılıs', 'Строительство', 'Construction'),
    retail: L('Chakana savdo', 'Чакана савдо', 'Usaq sawda', 'Розничная торговля', 'Retail trade'),
    services: L('Xizmatlar', 'Хизматлар', 'Xızmetler', 'Услуги', 'Services'),
    investment: L('Investitsiyalar', 'Инвестициялар', 'Investiciyalar', 'Инвестиции', 'Investment'),
  };

  const METHOD = {
    demography: L('Aholi roʻyxati va FHDYo (fuqarolik holati dalolatnomalari) maʼlumotlari asosida yil boshiga hisoblanadi.', 'Аҳоли рўйхати ва ФҲДЁ маълумотлари асосида йил бошига ҳисобланади.', 'Xalıq dizimi hám PHAJ maǵlıwmatları tiykarında jıl basına esaplanadı.', 'Рассчитывается на начало года по данным переписи и ЗАГС.', 'Calculated for the start of the year from census and civil registry data.'),
    gdp: L('BMTning Milliy hisoblar tizimi (SNA 2008) boʻyicha, ishlab chiqarish usulida hisoblanadi.', 'БМТнинг Миллий ҳисоблар тизими (SNA 2008) бўйича, ишлаб чиқариш усулида ҳисобланади.', 'BMShtıń Milliy esaplar sisteması (SNA 2008) boyınsha, óndiris usılında esaplanadı.', 'Рассчитывается производственным методом по Системе национальных счетов ООН (СНС 2008).', 'Calculated with the production approach under the UN System of National Accounts (SNA 2008).'),
    prices: L('Isteʼmol narxlari indeksi har oy 14 hududdagi tovar va xizmatlar savatchasi narxlari asosida hisoblanadi.', 'Истеъмол нархлари индекси ҳар ой 14 ҳудуддаги товар ва хизматлар саватчаси нархлари асосида ҳисобланади.', 'Tutınıw bahaları indeksi hár ay 14 aymaqtaǵı tovar hám xızmetler sebeti bahaları tiykarında esaplanadı.', 'Индекс потребительских цен рассчитывается ежемесячно по ценам корзины товаров и услуг в 14 регионах.', 'The consumer price index is calculated monthly from the prices of a basket of goods and services in 14 regions.'),
    labour: L('Uy xoʻjaliklari oʻrtasida oʻtkaziladigan ishchi kuchi tanlama tadqiqoti (XMT taʼriflari) asosida.', 'Уй хўжаликлари ўртасида ўтказиладиган ишчи кучи танлама тадқиқоти (ХМТ таърифлари) асосида.', 'Úy xojalıqları arasında ótkeriletuǵın jumısshı kúshi tańlama izertlewi (XMSh táriypleri) tiykarında.', 'По выборочному обследованию рабочей силы домохозяйств (определения МОТ).', 'Based on the household labour force survey (ILO definitions).'),
    trade: L('Bojxona deklaratsiyalari va xizmatlar savdosi hisobotlari asosida, AQSh dollarida.', 'Божхона декларациялари ва хизматлар савдоси ҳисоботлари асосида, АҚШ долларида.', 'Bajıxana deklaraciyaları hám xızmetler sawdası esabatları tiykarında, AQSh dollarında.', 'По таможенным декларациям и отчётам о торговле услугами, в долларах США.', 'Based on customs declarations and services trade reports, in US dollars.'),
    industry: L('Sanoat korxonalarining oylik hisobotlari asosida, solishtirma narxlarda.', 'Саноат корхоналарининг ойлик ҳисоботлари асосида, солиштирма нархларда.', 'Sanaat kárxanalarınıń aylıq esabatları tiykarında, salıstırmalı bahalarda.', 'По ежемесячной отчётности промышленных предприятий, в сопоставимых ценах.', 'Based on monthly reports of industrial enterprises, at constant prices.'),
    agriculture: L('Qishloq xoʻjaligi korxonalari, fermer va dehqon xoʻjaliklari hisobotlari asosida.', 'Қишлоқ хўжалиги корхоналари, фермер ва деҳқон хўжаликлари ҳисоботлари асосида.', 'Awıl xojalıǵı kárxanaları, fermer hám diyqan xojalıqları esabatları tiykarında.', 'По отчётам сельхозпредприятий, фермерских и дехканских хозяйств.', 'Based on reports of agricultural enterprises, farms and household plots.'),
    construction: L('Qurilish tashkilotlari bajargan ishlar hajmi, joriy narxlarda.', 'Қурилиш ташкилотлари бажарган ишлар ҳажми, жорий нархларда.', 'Qurılıs shólkemleri orınlaǵan jumıslar kólemi, ámeldegi bahalarda.', 'Объём работ, выполненных строительными организациями, в текущих ценах.', 'Volume of work done by construction organizations, at current prices.'),
    retail: L('Chakana savdo korxonalari va bozorlar hisobotlari asosida, joriy narxlarda.', 'Чакана савдо корхоналари ва бозорлар ҳисоботлари асосида, жорий нархларда.', 'Usaq sawda kárxanaları hám bazarlar esabatları tiykarında, ámeldegi bahalarda.', 'По отчётам предприятий розничной торговли и рынков, в текущих ценах.', 'Based on reports of retailers and markets, at current prices.'),
    services: L('Bozor xizmatlari koʻrsatuvchi korxonalar hisobotlari asosida, joriy narxlarda.', 'Бозор хизматлари кўрсатувчи корхоналар ҳисоботлари асосида, жорий нархларда.', 'Bazar xızmetlerin kórsetiwshi kárxanalar esabatları tiykarında, ámeldegi bahalarda.', 'По отчётам предприятий, оказывающих рыночные услуги, в текущих ценах.', 'Based on reports of market service providers, at current prices.'),
    investment: L('Asosiy kapitalga kiritilgan investitsiyalar, barcha moliyalash manbalari boʻyicha.', 'Асосий капиталга киритилган инвестициялар, барча молиялаш манбалари бўйича.', 'Tiykarǵı kapitalǵa kirgizilgen investiciyalar, barlıq qarjılandırıw dárekleri boyınsha.', 'Инвестиции в основной капитал по всем источникам финансирования.', 'Investment in fixed capital from all funding sources.'),
  };
  const SOURCE = L('Statistika agentligi (DEMO) — shartli maʼlumotlar', 'Статистика агентлиги (DEMO) — шартли маълумотлар', 'Statistika agentligi (DEMO) — shártli maǵlıwmatlar', 'Агентство статистики (DEMO) — условные данные', 'Statistics Agency (DEMO) — mock data');

  /* ---------- indicator definitions ----------
   * gen: start/end value over the series, noise (fraction), season amplitude (fraction)
   * regional: 'sum' (split by population) | 'rate' (around national value) | null
   * good: 'up' | 'down' | 'neutral' — which direction is favourable (colour + text)
   */
  const DEF = [
    ['population', 'demography', 'A', 'mlnPeople', 2, 'neutral', 'sum', [31.6, 37.5, 0.002, 0],
      L('Aholi soni', 'Аҳоли сони', 'Xalıq sanı', 'Численность населения', 'Population'),
      L('Yil boshida mamlakatda doimiy yashovchi odamlar soni.', 'Йил бошида мамлакатда доимий яшовчи одамлар сони.', 'Jıl basında elde turaqlı jasaytuǵın adamlar sanı.', 'Сколько человек постоянно живёт в стране на начало года.', 'How many people permanently live in the country at the start of the year.')],
    ['births', 'demography', 'A', 'thPeople', 1, 'neutral', 'sum', [700, 930, 0.02, 0],
      L('Tugʻilganlar soni', 'Туғилганлар сони', 'Tuwılǵanlar sanı', 'Число родившихся', 'Live births'),
      L('Bir yil ichida tugʻilgan chaqaloqlar soni.', 'Бир йил ичида туғилган чақалоқлар сони.', 'Bir jıl ishinde tuwılǵan náresteler sanı.', 'Сколько детей родилось за год.', 'How many babies were born during the year.')],
    ['deaths', 'demography', 'A', 'thPeople', 1, 'down', 'sum', [155, 172, 0.03, 0],
      L('Vafot etganlar soni', 'Вафот этганлар сони', 'Qaytıs bolǵanlar sanı', 'Число умерших', 'Deaths'),
      L('Bir yil ichida vafot etgan odamlar soni.', 'Бир йил ичида вафот этган одамлар сони.', 'Bir jıl ishinde qaytıs bolǵan adamlar sanı.', 'Сколько человек умерло за год.', 'How many people died during the year.')],
    ['migration', 'demography', 'A', 'thPeople', 1, 'up', null, [-14, -6, 0.15, 0],
      L('Migratsiya saldosi', 'Миграция сальдоси', 'Migraciya saldosı', 'Миграционное сальдо', 'Net migration'),
      L('Kelganlar va ketganlar farqi. Manfiy son — ketganlar koʻproq degani.', 'Келганлар ва кетганлар фарқи. Манфий сон — кетганлар кўпроқ дегани.', 'Kelgenler hám ketkenler parqı. Minus san — ketkenler kóbirek degeni.', 'Разница между прибывшими и выбывшими. Минус — уехало больше, чем приехало.', 'Arrivals minus departures. A negative number means more people left than arrived.')],
    ['gdp', 'gdp', 'A', 'trlnSum', 1, 'up', null, [255, 1460, 0.01, 0],
      L('Yalpi ichki mahsulot (YaIM)', 'Ялпи ички маҳсулот (ЯИМ)', 'Jalpı ishki ónim (JIÓ)', 'Валовой внутренний продукт (ВВП)', 'Gross domestic product (GDP)'),
      L('Bir yilda mamlakatda ishlab chiqarilgan barcha tovar va xizmatlarning umumiy qiymati.', 'Бир йилда мамлакатда ишлаб чиқарилган барча товар ва хизматларнинг умумий қиймати.', 'Bir jılda elde islep shıǵarılǵan barlıq tovar hám xızmetlerdiń ulıwma bahası.', 'Стоимость всех товаров и услуг, произведённых в стране за год.', 'The total value of all goods and services produced in the country in a year.')],
    ['gdp-growth', 'gdp', 'Q', 'pct', 1, 'up', null, [5.4, 6.8, 0.06, 0.03],
      L('YaIMning real oʻsishi', 'ЯИМнинг реал ўсиши', 'JIÓniń real ósiwi', 'Реальный рост ВВП', 'Real GDP growth'),
      L('Iqtisodiyot bir yil oldingiga nisbatan qancha oʻsgani, narx oʻzgarishini hisobga olmagan holda.', 'Иқтисодиёт бир йил олдингига нисбатан қанча ўсгани, нарх ўзгаришини ҳисобга олмаган ҳолда.', 'Ekonomika bir jıl aldınǵıǵa salıstırǵanda qansha ósken, baha ózgerisin esapqa almaǵan halda.', 'На сколько выросла экономика за год без учёта роста цен.', 'How much the economy grew compared with a year earlier, excluding price changes.')],
    ['gdp-pc', 'gdp', 'A', 'mlnSum', 1, 'up', 'rate', [8.0, 38.9, 0.01, 0],
      L('Aholi jon boshiga YaIM', 'Аҳоли жон бошига ЯИМ', 'Xalıq jan basına JIÓ', 'ВВП на душу населения', 'GDP per capita'),
      L('YaIMni aholi soniga boʻlganda bir kishiga toʻgʻri keladigan qiymat.', 'ЯИМни аҳоли сонига бўлганда бир кишига тўғри келадиган қиймат.', 'JIÓni xalıq sanına bólgende bir adamǵa tuwra keletuǵın mánis.', 'ВВП, разделённый на численность населения.', 'GDP divided by the number of people.')],
    ['cpi', 'prices', 'M', 'pct', 1, 'down', 'rate', [10.4, 7.6, 0.04, 0.02],
      L('Inflyatsiya (ISI, yillik)', 'Инфляция (ИНИ, йиллик)', 'Inflyaciya (TBI, jıllıq)', 'Инфляция (ИПЦ, годовая)', 'Inflation (CPI, annual)'),
      L('Narxlar bir yil ichida oʻrtacha qancha oshgani. 8% — bir yil oldin 100 soʻm turgan narsa endi 108 soʻm degani.', 'Нархлар бир йил ичида ўртача қанча ошгани. 8% — бир йил олдин 100 сўм турган нарса энди 108 сўм дегани.', 'Bahalar bir jıl ishinde ortasha qansha ósken. 8% — bir jıl aldın 100 sum turǵan nárse endi 108 sum degeni.', 'Насколько в среднем выросли цены за год. 8% — то, что год назад стоило 100 сумов, теперь стоит 108.', 'How much prices rose on average over a year. 8% means something that cost 100 soʻm a year ago now costs 108.')],
    ['cpi-food', 'prices', 'M', 'pct', 1, 'down', null, [12.1, 8.3, 0.06, 0.04],
      L('Oziq-ovqat narxlari', 'Озиқ-овқат нархлари', 'Azıq-awqat bahaları', 'Цены на продовольствие', 'Food prices'),
      L('Oziq-ovqat mahsulotlari narxlarining yillik oʻsishi.', 'Озиқ-овқат маҳсулотлари нархларининг йиллик ўсиши.', 'Azıq-awqat ónimleri bahalarınıń jıllıq ósiwi.', 'Годовой рост цен на продукты питания.', 'Annual change in food prices.')],
    ['cpi-nonfood', 'prices', 'M', 'pct', 1, 'down', null, [9.2, 6.4, 0.05, 0.01],
      L('Nooziq-ovqat tovarlari narxlari', 'Ноозиқ-овқат товарлари нархлари', 'Azıq-awqat emes tovarlar bahaları', 'Цены на непродовольственные товары', 'Non-food prices'),
      L('Kiyim, maishiy texnika, yoqilgʻi kabi tovarlar narxlarining yillik oʻsishi.', 'Кийим, маиший техника, ёқилғи каби товарлар нархларининг йиллик ўсиши.', 'Kiyim, turmıslıq texnika, janılǵı sıyaqlı tovarlar bahalarınıń jıllıq ósiwi.', 'Годовой рост цен на одежду, технику, топливо и другие товары.', 'Annual change in prices of clothing, appliances, fuel and other goods.')],
    ['cpi-services', 'prices', 'M', 'pct', 1, 'down', null, [9.8, 8.1, 0.05, 0.01],
      L('Xizmatlar narxlari', 'Хизматлар нархлари', 'Xızmetler bahaları', 'Цены на услуги', 'Service prices'),
      L('Kommunal, transport, taʼlim kabi xizmatlar narxlarining yillik oʻsishi.', 'Коммунал, транспорт, таълим каби хизматлар нархларининг йиллик ўсиши.', 'Kommunal, transport, bilimlendiriw sıyaqlı xızmetler bahalarınıń jıllıq ósiwi.', 'Годовой рост цен на коммунальные, транспортные, образовательные и другие услуги.', 'Annual change in prices of utilities, transport, education and other services.')],
    ['employment', 'labour', 'Q', 'thPeople', 1, 'up', 'sum', [13540, 14620, 0.004, 0.01],
      L('Band aholi', 'Банд аҳоли', 'Jumıs penen bánt xalıq', 'Занятое население', 'Employed population'),
      L('Ish bilan band boʻlgan odamlar soni, norasmiy sektor bilan birga.', 'Иш билан банд бўлган одамлар сони, норасмий сектор билан бирга.', 'Jumıs penen bánt adamlar sanı, beyrásmiy sektor menen birge.', 'Сколько людей работает, включая неформальный сектор.', 'How many people have work, including the informal sector.')],
    ['unemployment', 'labour', 'Q', 'pct', 1, 'down', 'rate', [9.6, 5.4, 0.02, 0.02],
      L('Ishsizlik darajasi', 'Ишсизлик даражаси', 'Jumıssızlıq dárejesi', 'Уровень безработицы', 'Unemployment rate'),
      L('Ish qidirayotgan, lekin ish topa olmayotganlar ulushi. 6% — 100 kishidan 6 tasi ish qidirmoqda.', 'Иш қидираётган, лекин иш топа олмаётганлар улуши. 6% — 100 кишидан 6 таси иш қидирмоқда.', 'Jumıs izlep atırǵan, biraq jumıs taba almay atırǵanlar úlesi. 6% — 100 adamnan 6 jumıs izlemekte.', 'Доля тех, кто ищет работу, но не может найти. 6% — 6 человек из 100 ищут работу.', 'The share of people looking for work who cannot find it. 6% means 6 in 100 are job-seeking.')],
    ['wage', 'labour', 'Q', 'thSum', 0, 'up', 'rate', [3150, 6850, 0.015, 0.04],
      L('Oʻrtacha oylik ish haqi', 'Ўртача ойлик иш ҳақи', 'Ortasha aylıq miynet haqı', 'Средняя месячная зарплата', 'Average monthly wage'),
      L('Bir xodimga toʻgʻri keladigan oʻrtacha hisoblangan ish haqi, soliqlar ushlanishidan oldin.', 'Бир ходимга тўғри келадиган ўртача ҳисобланган иш ҳақи, солиқлар ушланишидан олдин.', 'Bir xızmetkerge tuwra keletuǵın ortasha esaplanǵan miynet haqı, salıqlar ustalmastan aldın.', 'Средняя начисленная зарплата одного работника до вычета налогов.', 'The average gross wage per employee, before taxes.')],
    ['exports', 'trade', 'Q', 'mlnUsd', 0, 'up', null, [3600, 8100, 0.05, 0.06],
      L('Eksport', 'Экспорт', 'Eksport', 'Экспорт', 'Exports'),
      L('Chet elga sotilgan tovar va xizmatlar qiymati.', 'Чет элга сотилган товар ва хизматлар қиймати.', 'Shet elge satılǵan tovar hám xızmetler bahası.', 'Стоимость товаров и услуг, проданных за рубеж.', 'The value of goods and services sold abroad.')],
    ['imports', 'trade', 'Q', 'mlnUsd', 0, 'neutral', null, [5400, 10600, 0.04, 0.05],
      L('Import', 'Импорт', 'Import', 'Импорт', 'Imports'),
      L('Chet eldan sotib olingan tovar va xizmatlar qiymati.', 'Чет элдан сотиб олинган товар ва хизматлар қиймати.', 'Shet elden satıp alınǵan tovar hám xızmetler bahası.', 'Стоимость товаров и услуг, купленных за рубежом.', 'The value of goods and services bought from abroad.')],
    ['trade-balance', 'trade', 'Q', 'mlnUsd', 0, 'up', null, null,
      L('Tashqi savdo saldosi', 'Ташқи савдо сальдоси', 'Sırtqı sawda saldosı', 'Сальдо внешней торговли', 'Trade balance'),
      L('Eksport va import farqi. Manfiy son — sotganimizdan koʻproq sotib olganimizni bildiradi.', 'Экспорт ва импорт фарқи. Манфий сон — сотганимиздан кўпроқ сотиб олганимизни билдиради.', 'Eksport hám import parqı. Minus san — satqanımızdan kóbirek satıp alǵanımızdı bildiredi.', 'Разница экспорта и импорта. Минус — купили больше, чем продали.', 'Exports minus imports. A negative number means we bought more than we sold.')],
    ['industry', 'industry', 'M', 'pct', 1, 'up', 'rate', [5.2, 6.6, 0.12, 0.05],
      L('Sanoat ishlab chiqarishining oʻsishi', 'Саноат ишлаб чиқаришининг ўсиши', 'Sanaat óndirisiniń ósiwi', 'Рост промышленного производства', 'Industrial production growth'),
      L('Zavod va fabrikalar bir yil oldingiga nisbatan qancha koʻp mahsulot ishlab chiqargani.', 'Завод ва фабрикалар бир йил олдингига нисбатан қанча кўп маҳсулот ишлаб чиқаргани.', 'Zavod hám fabrikalar bir jıl aldınǵıǵa salıstırǵanda qansha kóp ónim islep shıǵarǵan.', 'Насколько больше продукции выпустили заводы и фабрики, чем год назад.', 'How much more factories produced than a year earlier.')],
    ['agriculture', 'agriculture', 'A', 'trlnSum', 1, 'up', 'sum', [92, 465, 0.02, 0],
      L('Qishloq xoʻjaligi mahsulotlari', 'Қишлоқ хўжалиги маҳсулотлари', 'Awıl xojalıǵı ónimleri', 'Продукция сельского хозяйства', 'Agricultural output'),
      L('Dehqonchilik va chorvachilik mahsulotlarining umumiy qiymati.', 'Деҳқончилик ва чорвачилик маҳсулотларининг умумий қиймати.', 'Diyqanshılıq hám sharwashılıq ónimleriniń ulıwma bahası.', 'Общая стоимость продукции растениеводства и животноводства.', 'The total value of crop and livestock production.')],
    ['grain', 'agriculture', 'A', 'thTon', 0, 'up', null, [7300, 8250, 0.03, 0],
      L('Gʻalla yetishtirish', 'Ғалла етиштириш', 'Dán jetistiriw', 'Производство зерна', 'Grain production'),
      L('Bugʻdoy va boshqa donli ekinlar hosili.', 'Буғдой ва бошқа донли экинлар ҳосили.', 'Biyday hám basqa dánli egin ónimi.', 'Урожай пшеницы и других зерновых.', 'The harvest of wheat and other grains.')],
    ['cotton', 'agriculture', 'A', 'thTon', 0, 'neutral', null, [2950, 3650, 0.04, 0],
      L('Paxta yetishtirish', 'Пахта етиштириш', 'Paxta jetistiriw', 'Производство хлопка', 'Cotton production'),
      L('Terib olingan paxta xomashyosi hajmi.', 'Териб олинган пахта хомашёси ҳажми.', 'Terip alınǵan paxta shiyki zatı kólemi.', 'Объём собранного хлопка-сырца.', 'The volume of raw cotton harvested.')],
    ['meat', 'agriculture', 'A', 'thTon', 0, 'up', null, [2380, 2920, 0.01, 0],
      L('Goʻsht ishlab chiqarish (chorvachilik)', 'Гўшт ишлаб чиқариш (чорвачилик)', 'Gósh óndiris (sharwashılıq)', 'Производство мяса (животноводство)', 'Meat production (livestock)'),
      L('Soʻyilgan chorva va parranda goʻshti, tirik vaznda.', 'Сўйилган чорва ва парранда гўшти, тирик вазнда.', 'Soyılǵan mal hám qus góshi, tiri salmaqta.', 'Мясо скота и птицы в живом весе.', 'Meat from livestock and poultry, live weight.')],
    ['construction', 'construction', 'Q', 'trlnSum', 1, 'up', null, [19.5, 46.0, 0.04, 0.15],
      L('Qurilish ishlari hajmi', 'Қурилиш ишлари ҳажми', 'Qurılıs jumısları kólemi', 'Объём строительных работ', 'Construction output'),
      L('Bir chorakda bajarilgan qurilish ishlarining qiymati.', 'Бир чоракда бажарилган қурилиш ишларининг қиймати.', 'Bir sherekte orınlanǵan qurılıs jumıslarınıń bahası.', 'Стоимость строительных работ за квартал.', 'The value of construction work done in a quarter.')],
    ['retail', 'retail', 'Q', 'trlnSum', 1, 'up', null, [52, 112, 0.02, 0.06],
      L('Chakana savdo aylanmasi', 'Чакана савдо айланмаси', 'Usaq sawda aylanbası', 'Оборот розничной торговли', 'Retail trade turnover'),
      L('Doʻkon va bozorlarda aholiga sotilgan tovarlar qiymati.', 'Дўкон ва бозорларда аҳолига сотилган товарлар қиймати.', 'Dúkan hám bazarlarda xalıqqa satılǵan tovarlar bahası.', 'Стоимость товаров, проданных населению в магазинах и на рынках.', 'The value of goods sold to people in shops and markets.')],
    ['services', 'services', 'Q', 'trlnSum', 1, 'up', null, [71, 162, 0.02, 0.05],
      L('Bozor xizmatlari hajmi', 'Бозор хизматлари ҳажми', 'Bazar xızmetleri kólemi', 'Объём рыночных услуг', 'Market services output'),
      L('Aloqa, transport, moliya, turizm va boshqa pullik xizmatlar qiymati.', 'Алоқа, транспорт, молия, туризм ва бошқа пуллик хизматлар қиймати.', 'Baylanıs, transport, qarjı, turizm hám basqa haqılı xızmetler bahası.', 'Стоимость услуг связи, транспорта, финансов, туризма и других платных услуг.', 'The value of telecom, transport, finance, tourism and other paid services.')],
    ['investment', 'investment', 'Q', 'trlnSum', 1, 'up', null, [48, 121, 0.05, 0.12],
      L('Asosiy kapitalga investitsiyalar', 'Асосий капиталга инвестициялар', 'Tiykarǵı kapitalǵa investiciyalar', 'Инвестиции в основной капитал', 'Fixed capital investment'),
      L('Yangi binolar, yoʻllar, uskunalarga sarflangan mablagʻlar.', 'Янги бинолар, йўллар, ускуналарга сарфланган маблағлар.', 'Jańa imaratlar, jollar, úskenelerge jumsalǵan qarjılar.', 'Средства, вложенные в новые здания, дороги и оборудование.', 'Money spent on new buildings, roads and equipment.')],
  ];

  /* ---------- seeded PRNG ---------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seedStr) {
    let a = hash(seedStr);
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- periods ---------- */
  function periodsFor(freq) {
    const out = [];
    if (freq === 'M') {
      for (let y = 2021; y <= 2026; y++) for (let m = 1; m <= 12; m++) {
        if (y === 2026 && m > 9) break;
        out.push(y + '-' + String(m).padStart(2, '0'));
      }
    } else if (freq === 'Q') {
      for (let y = 2021; y <= 2026; y++) for (let q = 1; q <= 4; q++) {
        if (y === 2026 && q > 3) break;
        out.push(y + '-Q' + q);
      }
    } else for (let y = 2016; y <= 2025; y++) out.push(String(y));
    return out;
  }
  function seasonIndex(period) {
    if (/-Q\d$/.test(period)) return (+period.slice(-1) - 1) / 4;
    if (/-\d\d$/.test(period)) return (+period.slice(-2) - 1) / 12;
    return 0;
  }

  /* ---------- release dates (deterministic per indicator) ---------- */
  function releaseDates(id, freq) {
    const r = rng('rel-' + id);
    const d = 3 + Math.floor(r() * 20);
    if (freq === 'M') return { last: '2026-10-' + String(Math.min(d + 5, 28)).padStart(2, '0'), next: '2026-11-' + String(Math.min(d + 3, 28)).padStart(2, '0') };
    if (freq === 'Q') return { last: '2026-10-' + String(Math.min(d + 2, 30)).padStart(2, '0'), next: '2027-01-' + String(Math.min(d + 8, 30)).padStart(2, '0') };
    return { last: '2026-0' + (2 + Math.floor(r() * 3)) + '-' + String(Math.min(d + 1, 28)).padStart(2, '0'), next: (r() > 0.6 ? '2026-12-' : '2027-02-') + String(Math.min(d + 4, 28)).padStart(2, '0') };
  }

  /* ---------- build indicators & observations ---------- */
  const INDICATORS = [];
  const OBS = {}; // id -> { regionId -> [{period, value, status}] }

  DEF.forEach((d, i) => {
    const [id, category, freq, unitKey, decimals, good, regional, gen, name, description] = d;
    const rel = releaseDates(id, freq);
    INDICATORS.push({
      id,
      code: 'UZ.' + category.toUpperCase().slice(0, 4) + '.' + String(i + 1).padStart(3, '0'),
      category,
      categoryName: CATEGORIES[category],
      name,
      description,
      unit: U[unitKey],
      unitKind: unitKey === 'pct' ? 'pct' : 'level',
      decimals,
      good,
      regional,
      frequency: freq,
      lastUpdated: rel.last,
      nextRelease: rel.next,
      methodology: METHOD[category],
      source: SOURCE,
    });
  });

  function genSeries(ind, gen, regionId, factor) {
    const periods = periodsFor(ind.frequency);
    const r = rng(ind.id + '|' + regionId);
    const [start, end, noise, season] = gen;
    const n = periods.length;
    return periods.map((p, k) => {
      const t = n === 1 ? 1 : k / (n - 1);
      let v = start + (end - start) * (0.15 * t + 0.85 * t * t * (3 - 2 * t) * 0.6 + 0.4 * t * 0.85);
      v *= 1 + Math.sin(seasonIndex(p) * Math.PI * 2) * season;
      v *= 1 + (r() - 0.5) * 2 * noise;
      v *= factor;
      const pow = Math.pow(10, ind.decimals);
      return { period: p, value: Math.round(v * pow) / pow, status: k === n - 1 ? 'provisional' : undefined };
    });
  }

  INDICATORS.forEach((ind, i) => {
    const gen = DEF[i][7];
    OBS[ind.id] = {};
    if (!gen) return; // derived later
    OBS[ind.id].UZ = genSeries(ind, gen, 'UZ', 1);
    if (ind.regional) {
      REGIONS.forEach((reg) => {
        let factor;
        if (ind.regional === 'sum') factor = reg.pop / POP_TOTAL;
        else {
          const rr = rng(ind.id + '#' + reg.id);
          factor = 1 + (rr() - 0.5) * (ind.id === 'gdp-pc' ? 1.1 : 0.45);
          if (ind.id === 'gdp-pc' && reg.id === 'UZ-TK') factor = 2.6;
          if (ind.id === 'wage' && reg.id === 'UZ-TK') factor = 1.55;
        }
        OBS[ind.id][reg.id] = genSeries(ind, gen, reg.id, factor);
      });
    }
  });
  // derived: trade balance = exports - imports
  OBS['trade-balance'].UZ = OBS.exports.UZ.map((o, k) => ({ period: o.period, value: Math.round(o.value - OBS.imports.UZ[k].value), status: o.status }));

  const HEADLINE_IDS = ['population', 'gdp-growth', 'cpi', 'unemployment', 'wage', 'exports', 'industry', 'investment'];
  const POPULAR_IDS = ['cpi', 'wage', 'population', 'unemployment'];
  const RELATED = {
    demography: ['population', 'births', 'deaths', 'migration'],
    gdp: ['gdp', 'gdp-growth', 'gdp-pc', 'investment'],
    prices: ['cpi', 'cpi-food', 'cpi-nonfood', 'cpi-services'],
    labour: ['employment', 'unemployment', 'wage'],
    trade: ['exports', 'imports', 'trade-balance'],
    industry: ['industry', 'gdp-growth', 'investment'],
    agriculture: ['agriculture', 'grain', 'cotton', 'meat'],
    construction: ['construction', 'investment', 'gdp-growth'],
    retail: ['retail', 'cpi', 'wage'],
    services: ['services', 'retail', 'gdp-growth'],
    investment: ['investment', 'construction', 'gdp'],
  };

  /* ---------- dataService (async, simulated latency + optional failures) ---------- */
  const cfg = { latency: [120, 380], failRate: 0 };
  function delay(val) {
    const ms = cfg.latency[0] + Math.random() * (cfg.latency[1] - cfg.latency[0]);
    return new Promise((res, rej) =>
      setTimeout(() => {
        if (Math.random() < cfg.failRate) rej(new Error('mock-network-error'));
        else res(val);
      }, ms),
    );
  }
  const byId = {};
  INDICATORS.forEach((x) => (byId[x.id] = x));

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[ʻʼ'‘’`]/g, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ı/g, 'i');
  }

  const dataService = {
    config: cfg,
    getIndicators: () => delay(INDICATORS.slice()),
    getIndicator: (id) => delay(byId[id] || null),
    getIndicatorSync: (id) => byId[id] || null,
    getObservations: (id, opts) => {
      opts = opts || {};
      const region = opts.regionId || 'UZ';
      const series = (OBS[id] && OBS[id][region]) || [];
      const from = opts.from, to = opts.to;
      return delay(series.filter((o) => (!from || o.period >= from) && (!to || o.period <= to)).map((o) => Object.assign({ indicatorId: id, regionId: region }, o)));
    },
    getObservationsSync: (id, regionId) => ((OBS[id] && OBS[id][regionId || 'UZ']) || []).slice(),
    getRegional: (id, period) => {
      const ind = byId[id];
      if (!ind || !ind.regional) return delay([]);
      return delay(
        REGIONS.map((reg) => {
          const s = OBS[id][reg.id];
          const o = period ? s.find((x) => x.period === period) : s[s.length - 1];
          return { regionId: reg.id, period: o ? o.period : null, value: o ? o.value : null };
        }),
      );
    },
    getReleases: () =>
      delay({
        latest: INDICATORS.slice().sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1)).slice(0, 6).map((i) => ({ indicatorId: i.id, date: i.lastUpdated })),
        upcoming: INDICATORS.filter((i) => i.nextRelease >= '2026-11-02').sort((a, b) => (a.nextRelease > b.nextRelease ? 1 : -1)).slice(0, 6).map((i) => ({ indicatorId: i.id, date: i.nextRelease })),
      }),
    search: (q, locale) => {
      const n = norm(q).trim();
      if (!n) return delay([]);
      const res = INDICATORS.filter((i) => {
        const hay = [i.name[locale], i.name['uz-Latn'], i.name.en, i.name.ru, i.categoryName[locale], i.description[locale], i.code].map(norm).join(' | ');
        return n.split(/\s+/).every((w) => hay.indexOf(w) >= 0);
      });
      return delay(res.slice(0, 8));
    },
    searchSync: (q, locale) => {
      const n = norm(q).trim();
      if (!n) return [];
      return INDICATORS.filter((i) => {
        const hay = [i.name[locale], i.name['uz-Latn'], i.name.en, i.name.ru, i.categoryName[locale], i.code].map(norm).join(' | ');
        return n.split(/\s+/).every((w) => hay.indexOf(w) >= 0);
      }).slice(0, 8);
    },
  };

  MS.data = { REGIONS, INDICATORS, CATEGORIES, UNITS: U, HEADLINE_IDS, POPULAR_IDS, RELATED, periodsFor, byId, rng };
  MS.dataService = dataService;
})();
