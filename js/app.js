
(function () {
  "use strict";

  var DATA = null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  var money = function (n) { return "\u20A6" + Number(n).toLocaleString("en-NG"); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c];
    });
  };

  /* product images */
  var PHOTOS = {
    1:  "images/products/p1.jpg",
    2:  "images/products/p2.jpg",
    3:  "images/products/p3.jpg",
    4:  "images/products/p4.jpg",
    5:  "images/products/p5.jpg",
    6:  "images/products/p6.jpg",
    7:  "images/products/p7.jpg",
    8:  "images/products/p8.jpg",
    9:  "images/products/p9.jpg",
    10: "images/products/p10.jpg",
    11: "images/products/p11.jpg",
    12: "images/products/p12.jpg",
    13: "images/products/p13.jpg",
    14: "images/products/p14.jpg",
    15: "images/products/p15.jpg"
  };

  /* tech images */
  var TECH_PHOTOS = {
    "Mechanical":        "images/tech/tech-mechanical.jpg",
    "Quartz":            "images/tech/tech-quartz.jpg",
    "Solar / Eco-Drive": "images/tech/tech-solar.jpg",
    "Smart":             "images/tech/tech-smart.jpg",
    "Sapphire Crystal":  "images/tech/tech-sapphire.jpg",
    "Water Resistance":  "images/tech/tech-water.jpg"
  };

  /* store images */
  var STORE_PHOTOS = {
    "Lagos":         "images/stores/store-lagos.jpg",
    "Abuja":         "images/stores/store-abuja.jpg",
    "Port Harcourt": "images/stores/store-ph.jpg",
    "Kano":          "images/stores/store-kano.jpg"
  };

  /* load data */
  function loadData() {
    if (window.fetch && location.protocol !== "file:") {
      return fetch("data/products.json")
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .catch(function () { return window.WATCH_DATA; });
    }
    return Promise.resolve(window.WATCH_DATA);
  }

  /* card template */
  function card(p) {
    var src = PHOTOS[p.id];
    return '<article class="card" tabindex="0" data-id="' + p.id + '">' +
      '<div class="img">' +
        (src
          ? '<img src="' + src + '" alt="' + esc(p.name) + '" loading="lazy"><div class="img-overlay"></div>'
          : '<div class="img-placeholder">&#8987;</div>') +
        '<span class="cat-badge">' + esc(p.category) + '</span>' +
      '</div>' +
      '<div class="info">' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<div class="brand-l">' + esc(p.brand) + '</div>' +
        '<div class="price">' + money(p.price) + '</div>' +
        '<button class="quick-view" tabindex="-1" aria-hidden="true">Quick View &rarr;</button>' +
      '</div>' +
    '</article>';
  }

  function bindCards(container) {
    $$(".card", container).forEach(function (c) {
      var open = function () { openProduct(+c.dataset.id); };
      c.addEventListener("click", open);
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  }

  /* modals */
  function showModal(el) {
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { el.classList.add("fade"); });
    document.body.style.overflow = "hidden";
  }
  function hideModal(el) {
    el.classList.remove("fade");
    setTimeout(function () {
      el.classList.remove("open");
      el.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 300);
  }

  function openProduct(id) {
    var p = DATA.products.find(function (x) { return x.id === id; });
    if (!p) return;
    var src = PHOTOS[p.id];
    $("#mImg").innerHTML = src
      ? '<img src="' + src + '" alt="' + esc(p.name) + '">'
      : '<div style="height:320px;display:flex;align-items:center;justify-content:center;font-size:5rem">&#8987;</div>';
    $("#mCat").textContent = p.category;
    $("#mTitle").textContent = p.name;
    $("#mBrand").textContent = "by " + p.brand;
    $("#mDesc").textContent = p.desc;
    $("#mSpecs").innerHTML = Object.keys(p.specs).map(function (k) {
      return "<tr><td>" + esc(k) + "</td><td>" + esc(p.specs[k]) + "</td></tr>";
    }).join("");
    $("#mPrice").textContent = money(p.price);
    showModal($("#modal"));
  }

  /* scroll spy */
  function initScrollSpy() {
    var sections = $$("section[id]");
    var navLinks = $$(".menu a");

    function onScroll() {
      var scrollY = window.scrollY + 120;
      var current = sections.length ? sections[0].id : "";
      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollY) current = sec.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* burger menu */
  function initBurger() {
    $("#burger").addEventListener("click", function () {
      var open = $("#menu").classList.toggle("open");
      this.setAttribute("aria-expanded", String(open));
    });
    $$(".menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        $("#menu").classList.remove("open");
        $("#burger").setAttribute("aria-expanded", "false");
      });
    });
  }

  /* products */
  var activeCat = "All";

  function renderProducts() {
    var list = activeCat === "All"
      ? DATA.products
      : DATA.products.filter(function (p) { return p.category === activeCat; });
    $("#productGrid").innerHTML = list.map(card).join("");
    $("#productCount").textContent =
      list.length + " item" + (list.length === 1 ? "" : "s") +
      (activeCat === "All" ? " across all product lines" : " in " + activeCat);
    bindCards($("#productGrid"));
  }

  function renderFilters() {
    var cats = ["All"].concat(DATA.categories);
    $("#categoryFilters").innerHTML = cats.map(function (c) {
      return '<button class="chip' + (c === activeCat ? " active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    $$(".chip", $("#categoryFilters")).forEach(function (b) {
      b.addEventListener("click", function () {
        activeCat = b.dataset.cat;
        $$(".chip", $("#categoryFilters")).forEach(function (x) { x.classList.toggle("active", x === b); });
        var grid = $("#productGrid");
        grid.style.opacity = "0";
        setTimeout(function () {
          renderProducts();
          grid.style.transition = "opacity .3s";
          grid.style.opacity = "1";
        }, 200);
      });
    });
    $("#productGrid").style.transition = "opacity .3s";
  }

  /* technology */
  function renderTech() {
    $("#techGrid").innerHTML = DATA.technology.map(function (t) {
      var img = TECH_PHOTOS[t.title];
      return '<div class="card tech-card">' +
        (img ? '<div class="tech-card-img"><img src="' + img + '" alt="' + esc(t.title) + '" loading="lazy"></div>' : '') +
        '<div class="tech-card-inner">' +
          '<div class="tech-icon">' + t.icon + '</div>' +
          '<h3>' + esc(t.title) + '</h3>' +
          '<p>' + esc(t.text) + '</p>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  /* store locator */
  function haversine(a, b, c, d) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (c - a) * rad, dLon = (d - b) * rad;
    var x = Math.sin(dLat/2)*Math.sin(dLat/2) +
             Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function nearestStore(lat, lng) {
    return DATA.stores.reduce(function (best, s) {
      var d = haversine(lat, lng, s.lat, s.lng);
      return (!best || d < best.d) ? { s: s, d: d } : best;
    }, null);
  }
  function renderStores(nearestCity) {
    $("#storeGrid").innerHTML = DATA.stores.map(function (s) {
      var photo = STORE_PHOTOS[s.city] || "";
      return '<div class="card store-card' + (s.city === nearestCity ? " nearest" : "") + '">' +
        (photo ? '<div class="store-photo"><img src="' + photo + '" alt="' + esc(s.city) + '" loading="lazy"></div>' : '') +
        '<div class="store-info">' +
          '<h3>' + esc(s.city) + (s.city === nearestCity ? " &#11088;" : "") + '</h3>' +
          '<p>&#128205; ' + esc(s.address) + '</p>' +
          '<p>&#128222; ' + esc(s.phone) + '</p>' +
          '<p>&#128337; ' + esc(s.hours) + '</p>' +
          '<a class="maps-link" href="https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent(s.address) + '" target="_blank" rel="noopener">Open in Maps &#8599;</a>' +
        '</div>' +
      '</div>';
    }).join("");
  }
  function initStoreLocator() {
    renderStores();
    $("#nearestBtn").addEventListener("click", function () {
      var msg = $("#nearestMsg");
      if (!navigator.geolocation) { msg.textContent = "Geolocation is not supported by your browser."; return; }
      msg.textContent = "Locating you\u2026";
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var n = nearestStore(pos.coords.latitude, pos.coords.longitude);
          msg.textContent = "Nearest store: " + n.s.city + " (about " + Math.round(n.d) + " km away).";
          renderStores(n.s.city);
        },
        function () {
          msg.textContent = "Could not get your location \u2014 please allow location access or choose a store below.";
        }
      );
    });
  }

  /* price list */
  function renderPrices() {
    var q = $("#priceSearch").value.toLowerCase().trim();
    var cat = $("#priceCat").value, sort = $("#priceSort").value;
    var list = DATA.products.filter(function (p) {
      return (!cat || p.category === cat) &&
             (!q || (p.name + " " + p.brand).toLowerCase().indexOf(q) > -1);
    });
    list.sort(function (a, b) {
      if (sort === "low")  return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    $("#priceTable tbody").innerHTML = list.length
      ? list.map(function (p, i) {
          return '<tr data-id="' + p.id + '">' +
            '<td>' + (i+1) + '</td>' +
            '<td><strong>' + esc(p.name) + '</strong></td>' +
            '<td>' + esc(p.brand) + '</td>' +
            '<td>' + esc(p.category) + '</td>' +
            '<td class="num">' + money(p.price) + '</td>' +
          '</tr>';
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;padding:24px;color:#999">No watches match your search.</td></tr>';
    $$("#priceTable tbody tr[data-id]").forEach(function (tr) {
      tr.addEventListener("click", function () { openProduct(+tr.dataset.id); });
    });
  }
  function initPrices() {
    $("#priceCat").innerHTML += DATA.categories.map(function (c) {
      return "<option>" + esc(c) + "</option>";
    }).join("");
    ["input", "change"].forEach(function (ev) {
      $("#priceSearch").addEventListener(ev, renderPrices);
      $("#priceCat").addEventListener(ev, renderPrices);
      $("#priceSort").addEventListener(ev, renderPrices);
    });
    renderPrices();
  }

  /* gallery */
  function initGallery() {
    $("#galleryGrid").innerHTML = DATA.products.map(function (p) {
      var src = PHOTOS[p.id];
      return '<div class="g" tabindex="0" data-id="' + p.id + '">' +
        (src
          ? '<img src="' + src + '" alt="' + esc(p.name) + '" loading="lazy">'
          : '<div style="height:210px;display:flex;align-items:center;justify-content:center;font-size:3rem">&#8987;</div>') +
        '<div class="g-cap">' + esc(p.name) + '</div>' +
      '</div>';
    }).join("");
    $$(".g", $("#galleryGrid")).forEach(function (g) {
      var doOpen = function () {
        var p = DATA.products.find(function (x) { return x.id === +g.dataset.id; });
        var src = PHOTOS[p.id];
        $("#lightImg").innerHTML = src
          ? '<img src="' + src + '" alt="' + esc(p.name) + '">'
          : '<div style="padding:40px;font-size:5rem;text-align:center">&#8987;</div>';
        $("#lightCap").textContent = p.name + " \u2014 " + p.brand;
        showModal($("#lightbox"));
      };
      g.addEventListener("click", doOpen);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") doOpen(); });
    });
  }

  /* faq */
  function initFAQ() {
    $("#faqList").innerHTML = DATA.faq.map(function (f) {
      return '<div class="faq-item">' +
        '<button class="faq-q" aria-expanded="false">' +
          '<span>' + esc(f.q) + '</span>' +
          '<i class="faq-icon" aria-hidden="true">+</i>' +
        '</button>' +
        '<div class="faq-a"><p>' + esc(f.a) + '</p></div>' +
      '</div>';
    }).join("");
    $$(".faq-q").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = b.parentNode;
        var open = item.classList.toggle("open");
        b.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* forms */
  function validateForm(form, msgEl, okText) {
    var ok = true;
    $$("input[required],select[required],textarea[required]", form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    msgEl.className = "form-msg " + (ok ? "ok" : "err");
    msgEl.textContent = ok ? okText : "Please fill in all required fields correctly.";
    if (ok) form.reset();
  }
  function initForms() {
    $("#repairForm").addEventListener("submit", function (e) {
      e.preventDefault();
      validateForm(this, $("#repairMsg"), "Request received! We\u2019ll email you within 24 hours.");
    });
    $("#contactForm").addEventListener("submit", function (e) {
      e.preventDefault();
      validateForm(this, $("#contactMsg"), "Message sent \u2014 thank you for contacting Alberto Watch Company!");
    });
  }

  /* sitemap */
  function initSitemap() {
    var pages = [
      ["home","Home"],["products","Products",true],
      ["technology","Technology"],["store","Store Locator"],
      ["prices","Price List"],["gallery","Gallery"],
      ["support","Support"],["about","About Us"],["contact","Contact Us"]
    ];
    $("#sitemapList").innerHTML = pages.map(function (p) {
      var sub = p[2]
        ? "<ul>" + DATA.categories.map(function (c) {
            return '<li><a href="#products">' + esc(c) + "</a></li>";
          }).join("") + "</ul>"
        : "";
      return '<li><a href="#' + p[0] + '">' + p[1] + "</a>" + sub + "</li>";
    }).join("");
  }

  /* analog clock */
  function initHeroClock() {
    var el = $("#heroClock");
    if (!el) return;

  /* SVG tick marks */
    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 114 114");
    svg.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;border-radius:50%");
    svg.setAttribute("aria-hidden","true");
    for (var i = 0; i < 60; i++) {
      var major = (i % 5 === 0);
      var ang = i * 6 * Math.PI / 180;
      var r1 = major ? 46 : 50, r2 = 54, cx = 57, cy = 57;
      var ln = document.createElementNS("http://www.w3.org/2000/svg","line");
      ln.setAttribute("x1", cx + r1 * Math.sin(ang));
      ln.setAttribute("y1", cy - r1 * Math.cos(ang));
      ln.setAttribute("x2", cx + r2 * Math.sin(ang));
      ln.setAttribute("y2", cy - r2 * Math.cos(ang));
      ln.setAttribute("stroke", major ? "#c9a84c" : "rgba(201,168,76,.35)");
      ln.setAttribute("stroke-width", major ? "2.2" : "1");
      svg.appendChild(ln);
    }
    el.appendChild(svg);

    var h = $(".h", el), m = $(".m", el), s = $(".s", el);
    function tick() {
      var d = new Date(), sec = d.getSeconds(), min = d.getMinutes() + sec/60, hr = (d.getHours()%12) + min/60;
      h.style.transform = "rotate(" + (hr * 30) + "deg)";
      m.style.transform = "rotate(" + (min * 6) + "deg)";
      s.style.transform = "rotate(" + (sec * 6) + "deg)";
    }
    tick(); setInterval(tick, 1000);
  }

  /* visitors */
  function initVisitors() {
    var count = 1250;
    try {
      count = parseInt(localStorage.getItem("alberto_visitors") || "1250", 10) || 1250;
      if (!sessionStorage.getItem("alberto_counted")) {
        count++;
        localStorage.setItem("alberto_visitors", String(count));
        sessionStorage.setItem("alberto_counted", "1");
      }
    } catch (e) { count++; }
    $("#visitorCount").textContent = count.toLocaleString("en-US");
  }

  /* ticker */
  var locText = "Detecting location\u2026";
  function initTicker() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    if (tz) locText = "Time zone: " + tz;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var n = nearestStore(pos.coords.latitude, pos.coords.longitude);
          locText = "Your location: " + pos.coords.latitude.toFixed(3) + ", " +
            pos.coords.longitude.toFixed(3) + " | Nearest store: " + n.s.city;
        },
        function () { locText = (tz ? "Time zone: " + tz : "") + " (location access denied)"; },
        { timeout: 8000 }
      );
    }
    function update() {
      var d = new Date();
      $("#tickerText").textContent =
        "\u231A  Alberto Watch Company  \u2014  " +
        d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" }) +
        "   \u2022   " + d.toLocaleTimeString() +
        "   \u2022   " + locText +
        "   \u2022   Free engraving on every watch this month!   \u2022   " +
        "Stores in Lagos \u2022 Abuja \u2022 Port Harcourt \u2022 Kano   \u00A0\u00A0\u00A0";
    }
    update(); setInterval(update, 1000);
  }

  /* modal events */
  function initModals() {
    $("#modalClose").addEventListener("click", function () { hideModal($("#modal")); });
    $("#lightClose").addEventListener("click", function () { hideModal($("#lightbox")); });
    $$(".modal").forEach(function (m) {
      m.addEventListener("click", function (e) { if (e.target === m) hideModal(m); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") $$(".modal.open").forEach(hideModal);
    });
  }

  /* init */
  loadData().then(function (d) {
    DATA = d;
    renderFilters();
    renderProducts();
    renderTech();
    initStoreLocator();
    initPrices();
    initGallery();
    initFAQ();
    initForms();
    initSitemap();
    initHeroClock();
    initVisitors();
    initTicker();
    initModals();
    initScrollSpy();
    initBurger();
  }).catch(function (err) {
    document.body.insertAdjacentHTML("afterbegin",
      '<p style="padding:20px;background:#c0392b;color:#fff;font-weight:bold">Data failed to load: ' + esc(String(err)) + '</p>'
    );
  });

})();
