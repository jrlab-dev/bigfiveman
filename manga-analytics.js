/*!
 * ビッグファイブマンV - GA4イベント計測（全ページ共通）
 *
 * GA4初期化(gtag config)は各HTMLにベタ書き済み。このスクリプトは
 * ユーザー操作（CTAクリック等）をGA4イベントとして追加送信するだけ。
 *
 * 計測対象:
 *   1. cta_click      : 診断サイト(bigfive.jr-genius.jp)へのCTAクリック（最重要コンバージョン）
 *   2. navigate_next  : 次のエピソードへの遷移
 *   3. outbound_click : その他の外部リンク
 *
 * ページ識別は <body data-page="manga_list|ep1|ep2"> で行う。
 * 診断CTAのURLに含まれる ?from=xxx パラメータも from_param として記録する。
 */
(function () {
  'use strict';
  if (typeof gtag !== 'function') return; // GA4未読み込み時は安全のため何もしない

  var pageId = (document.body && document.body.getAttribute('data-page')) || 'unknown';
  var thisHost = window.location.hostname;

  function safeURL(href) {
    try { return new URL(href, window.location.href); } catch (e) { return null; }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || !a.href) return;

    var url = safeURL(a.href);
    if (!url) return;

    // 1) 診断サイトへのCTA（最重要コンバージョン）
    if (url.hostname.indexOf('bigfive.jr-genius.jp') !== -1) {
      var from = url.searchParams.get('from') || pageId;
      gtag('event', 'cta_click', {
        source_page: pageId,
        from_param: from,
        link_text: (a.textContent || '').trim().slice(0, 50)
      });
      return;
    }

    // 2) 同一サイト内の別エピソード遷移（.html への内部リンク）
    if (url.hostname === thisHost && /\.html?$/.test(url.pathname)) {
      gtag('event', 'navigate_episode', {
        source_page: pageId,
        target: url.pathname
      });
      return;
    }

    // 3) その他の外部リンク
    if (url.hostname && url.hostname !== thisHost && /^https?:/.test(url.protocol)) {
      gtag('event', 'outbound_click', {
        source_page: pageId,
        target_host: url.hostname
      });
    }
  }, true);
})();
