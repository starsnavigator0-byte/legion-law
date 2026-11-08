// НЕ ВКЛЮЧАТЬ совместно с отслеживанием клика: приведёт к повторным Lead.
// Это только опциональный пример для учёта ПОДТВЕРЖДЁННЫХ заявок.
/**
 * Дополнение к СУЩЕСТВУЮЩЕМУ Google Apps Script — НЕ заменяет doPost(e).
 * В настройках проекта / Script properties задайте KEITARO_POSTBACK_URL
 * значением URL из Keitaro -> Настройки -> Postback URL.
 * Не помещайте этот URL или ключ в код публичного сайта!
 *
 * В существующем doPost(e):
 *   const subid = (e.parameter.subid || '').trim();
 *   // Здесь — ваша существующая проверка, затем запись в Google Sheets.
 *   // Сохраните subid в отдельном столбце вместе с остальными данными.
 *   // ПОСЛЕ успешного appendRow(...) вызовите:
 *   sendKeitaroLead_(subid, String(Utilities.getUuid()));
 *
 * Если нужен устойчивый повтор при ошибке postback, сохраняйте tid и
 * статус отправки в таблице и реализуйте очередь/повтор на сервере.
 */
function sendKeitaroLead_(subid, transactionId) {
  if (!/^[a-zA-Z0-9._-]{1,128}$/.test(subid || '')) return;
  var base = PropertiesService.getScriptProperties().getProperty('KEITARO_POSTBACK_URL');
  if (!base) {
    console.error('KEITARO_POSTBACK_URL is not configured');
    return;
  }
  // Сохраняем существующие query-параметры секретного Postback URL.
  var separator = base.indexOf('?') === -1 ? '?' : '&';
  var url = base + separator + 'subid=' + encodeURIComponent(subid) +
    '&status=lead&tid=' + encodeURIComponent(transactionId);
  try {
    var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      console.error('Keitaro postback HTTP ' + response.getResponseCode());
    }
  } catch (error) {
    console.error('Keitaro postback failed: ' + String(error));
  }
}
