(function () {
  "use strict";

  var C = (window.KEEP_IN_TOUCH || {}).contacts || {};
  var ICONS = window.KEEP_IN_TOUCH_ICONS || {};

  function trim(s) { return String(s == null ? "" : s).trim(); }
  function handle(s) { return trim(s).replace(/^@/, ""); }
  function digits(s) { return trim(s).replace(/\D/g, ""); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  // Each platform: how to read its config, what to show, what to copy, where to link.
  var PLATFORMS = {
    wechat: {
      name: "WeChat", zh: "微信", brand: "#07C160",
      ok: function (c) { return handle(c.id) || trim(c.qr); },
      show: function (c) { return handle(c.id) || "Tap for QR code · 点开扫码"; },
      copy: function (c) { return handle(c.id); }
    },
    email: {
      name: "Email", zh: "邮箱", brand: "#1d47c4",
      ok: function (c) { return trim(c.address); },
      show: function (c) { return trim(c.address); },
      copy: function (c) { return trim(c.address); },
      href: function (c) { return "mailto:" + trim(c.address); }
    },
    linkedin: {
      name: "LinkedIn", zh: "领英", brand: "#0A66C2",
      ok: function (c) { return handle(c.slug); },
      show: function (c) { return "in/" + handle(c.slug); },
      copy: function (c) { return "https://www.linkedin.com/in/" + handle(c.slug) + "/"; },
      href: function (c) { return "https://www.linkedin.com/in/" + handle(c.slug) + "/"; }
    },
    whatsapp: {
      name: "WhatsApp", brand: "#25D366",
      ok: function (c) { return digits(c.number); },
      show: function (c) { return trim(c.number); },
      copy: function (c) { return trim(c.number); },
      href: function (c) { return "https://wa.me/" + digits(c.number); }
    },
    telegram: {
      name: "Telegram", brand: "#26A5E4",
      ok: function (c) { return handle(c.username); },
      show: function (c) { return "@" + handle(c.username); },
      copy: function (c) { return "@" + handle(c.username); },
      href: function (c) { return "https://t.me/" + handle(c.username); }
    },
    instagram: {
      name: "Instagram",
      brand: "linear-gradient(45deg, #FFB347 0%, #F56040 35%, #E1306C 65%, #833AB4 100%)",
      ok: function (c) { return handle(c.username); },
      show: function (c) { return "@" + handle(c.username); },
      copy: function (c) { return "@" + handle(c.username); },
      href: function (c) { return "https://www.instagram.com/" + handle(c.username) + "/"; }
    },
    x: {
      name: "X", zh: "推特", brand: "#111111",
      ok: function (c) { return handle(c.username); },
      show: function (c) { return "@" + handle(c.username); },
      copy: function (c) { return "https://x.com/" + handle(c.username); },
      href: function (c) { return "https://x.com/" + handle(c.username); }
    },
    github: {
      name: "GitHub", brand: "#24292F",
      ok: function (c) { return handle(c.username); },
      show: function (c) { return handle(c.username); },
      copy: function (c) { return "https://github.com/" + handle(c.username); },
      href: function (c) { return "https://github.com/" + handle(c.username); }
    }
  };

  var COPY_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.6"/>' +
    '<path d="M15.5 8.5V6.6A2.6 2.6 0 0 0 12.9 4H6.6A2.6 2.6 0 0 0 4 6.6v6.3a2.6 2.6 0 0 0 2.6 2.6h1.9"/></svg>';
  var CHEVRON = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg>';

  /* ---------- contact cards ---------- */
  var list = document.getElementById("contacts");
  var n = 0;

  Object.keys(C).forEach(function (key) {
    var p = PLATFORMS[key], c = C[key];
    if (!p || !c || !p.ok(c)) return;

    var label = '<span class="label">' + p.name +
      (p.zh ? ' <span class="label-zh" lang="zh-CN">' + p.zh + "</span>" : "") + "</span>";
    var inner =
      '<span class="tile">' + (ICONS[key] || "") + "</span>" +
      '<span class="meta">' + label + '<span class="handle">' + esc(p.show(c)) + "</span></span>" +
      CHEVRON;

    var main = p.href
      ? '<a class="contact-main" href="' + esc(p.href(c)) + '"' +
        (key === "email" ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + inner + "</a>"
      : '<button class="contact-main" type="button">' + inner + "</button>";

    var copyText = p.copy(c);
    var li = document.createElement("li");
    li.className = "contact";
    li.style.setProperty("--brand", p.brand);
    li.style.setProperty("--i", n++);
    li.innerHTML = main + (copyText
      ? '<button class="copy" type="button" aria-label="Copy ' + p.name + ' · 复制">' + COPY_ICON + "</button>"
      : "");

    if (copyText) li.querySelector(".copy").addEventListener("click", function () { copy(copyText); });
    if (key === "wechat") li.querySelector(".contact-main").addEventListener("click", function () { openWeChat(c); });
    list.appendChild(li);
  });

  /* ---------- WeChat: QR dialog when an image is set, otherwise copy the ID ---------- */
  var dialog = document.getElementById("qr-dialog");

  function openWeChat(c) {
    var id = handle(c.id), qr = trim(c.qr);
    if (!qr || !dialog || typeof dialog.showModal !== "function") {
      if (qr) { window.open(qr, "_blank", "noopener"); return; }
      copy(id, "WeChat ID copied! · 微信号已复制！\nSearch it in WeChat · 去微信搜索添加");
      return;
    }
    document.getElementById("qr-img").src = qr;
    document.getElementById("qr-save").href = qr;
    document.getElementById("qr-id").textContent = id;
    document.getElementById("qr-id-row").hidden = !id;
    var copyBtn = document.getElementById("qr-copy");
    copyBtn.hidden = !id;
    copyBtn.onclick = function () { copy(id); };
    dialog.showModal();
  }

  if (dialog) {
    document.getElementById("qr-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------- copy + toast ---------- */
  function copy(text, message) {
    var ok = function () { toast(message || "Copied! · 已复制！"); };
    var fail = function () { toast("Couldn't copy · 复制失败\nLong-press to select · 请长按选择"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, function () { (legacyCopy(text) ? ok : fail)(); });
    } else {
      (legacyCopy(text) ? ok : fail)();
    }
  }

  // WeChat's in-app browser and older WebViews often lack the async clipboard API.
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var done = false;
    try { done = document.execCommand("copy"); } catch (e) { done = false; }
    document.body.removeChild(ta);
    return done;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
})();
