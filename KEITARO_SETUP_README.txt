LEGION — KEITARO CLICK LEAD: ИНСТРУКЦИЯ
========================================

ЧТО ИЗМЕНЕНО
- Lead = один клик по кнопке «Отправить заявку» для данного subid
  (даже если форма заполнена не полностью). Это НЕ подтверждённая заявка.
- После успешного HTTP-ответа от Cloudflare (2xx) отметка записывается в
  sessionStorage. После 424/503/502/сетевого сбоя новый клик повторяет запрос.
- Пока запрос выполняется, повторный клик не дублирует его.
- Форма и интеграция с Google Apps Script визуально и функционально сохранены.
- Старый Meta Pixel и его файлы полностью удалены.
- В Keitaro не отправляются имя, телефон или другие поля формы, только subid.

КАК ОПУБЛИКОВАТЬ
1. Загрузить содержимое архива в корень GitHub-репозитория LEGION.
2. В GitHub УДАЛИТЬ из репозитория старые файлы
   js/cookie-consent.js, META_PIXEL_README.txt и
   KEITARO_APPS_SCRIPT_EXAMPLE.gs (GitHub Upload files сам их не удалит).
3. Cloudflare Pages: Build command 'exit 0', Build output directory '.';
   functions/api/lead-click.js расположен в корне репозитория.
4. Cloudflare Pages -> Settings -> Variables and secrets -> Production:
   KEITARO_POSTBACK_URL = полный HTTPS postback URL из Keitaro с
   subid=REPLACE&status=lead. Хранить как Secret; не добавлять в GitHub.
   Нужен новый Production deployment после изменения секрета.
5. В тесте открыть кампанию Keitaro, убедиться в subid в адресной строке,
   затем нажать кнопку. В DevTools -> Network -> All увидеть
   POST /api/lead-click; 204 = Keitaro ответил успешным HTTP-кодом.
   Затем проверить саму конверсию в отчётах Keitaro.

ДИАГНОСТИКА
- 424: Keitaro ответил HTTP-ошибкой. В Cloudflare Function Real-time Logs
  есть запись 'LEGION lead-click: Keitaro returned HTTP NNN'.
- 503: либо нет секрета, либо проблема соединения с Keitaro.
  При сбое fetch в логах будет 'LEGION lead-click: Keitaro fetch failed'.
- 502 со стандартной HTML-страницей Cloudflare: проверить edge/origin,
  правила Cloudflare и функцию; это не обязательно ответ приложения.
- 400: пустой/некорректный subid.
- 403: запрос с другого Origin.
- При отсутствии запроса: проверить наличие subid, консоль браузера,
  правильный путь js/script.js и запись sessionStorage с ключом
  legion_lead_button_<subid>.
- Любой HTTP 2xx означает лишь доставленный postback, не гарантию
  правильной записи конверсии. Проверять Keitaro -> отчёты.

ВАЖНЫЕ ОГРАНИЧЕНИЯ
- Если сервер Keitaro принял конверсию, но ответ потерян, повторная
  попытка может создать дубликат. Для устойчивой дедупликации нужна
  отдельная серверная система с подтверждением и хранением событий.
- Кнопка на пустой форме считается попыткой, а не заявкой. Для рекламных
  оптимизаций рекомендуется отдельный показатель подтверждённых заявок.
- Открытый endpoint можно злоупотреблять: нужны антиспам и rate limits.
- Не отправлять одновременно Lead postback из Apps Script, иначе дубли.
- Не использовать разные посадочные страницы для рекламных модераторов
  и обычных пользователей.
