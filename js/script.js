/* Cineko cart - only shows on movie store page */
document.addEventListener('DOMContentLoaded', function () {
    var KEY = 'cineko-cart';
    var cart = [];

    try {
        var saved = JSON.parse(localStorage.getItem(KEY));
        if (Array.isArray(saved)) cart = saved;
    } catch (e) {}

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    }

    function money(n) {
        return '₱' + Number(n).toLocaleString('en-PH');
    }

    function getPrice(str) {
        return Number(String(str).replace(/[^\d.]/g, '')) || 0;
    }

    function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // toast
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translate(-50%,20px);background:#E50914;color:#fff;padding:10px 18px;border-radius:8px;opacity:0;transition:all .3s;z-index:3000;pointer-events:none';
    document.body.appendChild(toast);
    var tTimer;
    function flash(msg) {
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%,0)';
        clearTimeout(tTimer);
        tTimer = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%,20px)';
        }, 1800);
    }

    // nav cart badge (all pages)
    var nav = document.querySelector('header nav ul');
    var badge = null;
    if (nav) {
        var li = document.createElement('li');
        li.innerHTML = '<a href="#" id="cart-toggle">Cart <span class="cart-count" style="background:#E50914;color:#fff;border-radius:999px;padding:1px 8px;font-size:.8rem;margin-left:4px">0</span></a>';
        nav.appendChild(li);
        badge = li.querySelector('.cart-count');

        // highlight current page
        var page = location.pathname.split('/').pop() || 'index.html';
        nav.querySelectorAll('a[href]').forEach(function (a) {
            if (decodeURIComponent(a.getAttribute('href')) === decodeURIComponent(page)) {
                a.style.textDecoration = 'underline';
                a.style.fontWeight = '700';
            }
        });
    }

    function updateBadge() {
        var qty = 0;
        for (var i = 0; i < cart.length; i++) qty += cart[i].qty;
        if (badge) badge.textContent = qty;
    }

    // only build the cart section on the store page
    var isStore = document.querySelectorAll('.add-to-cart').length > 0;
    var list, totalEl;

    if (isStore) {
        var css = document.createElement('style');
        css.textContent = '.cineko-cart{max-width:1100px;margin:40px auto 60px;padding:0 20px;color:#F5F5F7}.cineko-cart h2{font-size:1.5rem;margin-bottom:18px;border-bottom:1px solid rgba(245,245,247,.15);padding-bottom:10px}.cineko-empty{text-align:center;color:#A1A1AA;padding:30px 0}.cineko-item{display:flex;gap:16px;align-items:center;background:#1C1C25;padding:14px 16px;border-radius:10px;margin-bottom:12px}.cineko-item img{width:70px;height:70px;object-fit:contain;background:#0B0B0F;border-radius:8px}.cineko-info{flex:1}.cineko-name{font-weight:600;margin-bottom:4px}.cineko-price{color:#E50914;font-weight:700}.cineko-qty{display:flex;align-items:center;gap:10px;margin-top:8px}.cineko-qty button{width:28px;height:28px;border:none;border-radius:4px;background:#2c2c38;color:#fff;cursor:pointer}.cineko-remove{background:none;border:none;color:#A1A1AA;cursor:pointer;font-size:.85rem;text-decoration:underline;margin-left:8px}.cineko-foot{margin-top:20px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-top:16px;border-top:1px solid rgba(245,245,247,.15)}.cineko-total{font-size:1.25rem;font-weight:700}.cineko-foot button{padding:10px 22px;border:none;border-radius:6px;cursor:pointer;font-size:.95rem}.cineko-check{background:#E50914;color:#fff}.cineko-clear{background:#2c2c38;color:#F5F5F7}';
        document.head.appendChild(css);

        var section = document.createElement('section');
        section.className = 'cineko-cart';
        section.id = 'cineko-cart';
        section.innerHTML = '<h2>Your Cart</h2><div class="cineko-list"></div><div class="cineko-foot"><div class="cineko-total">Total: <span class="cineko-val">₱0</span></div><div><button class="cineko-check">Checkout</button> <button class="cineko-clear">Clear Cart</button></div></div>';

        var footer = document.querySelector('footer');
        if (footer) footer.parentNode.insertBefore(section, footer);
        else document.body.appendChild(section);

        list = section.querySelector('.cineko-list');
        totalEl = section.querySelector('.cineko-val');

        // nav cart scrolls to section
        if (nav) {
            document.getElementById('cart-toggle').addEventListener('click', function (e) {
                e.preventDefault();
                section.scrollIntoView({ behavior: 'smooth' });
            });
        }

        function draw() {
            if (cart.length === 0) {
                list.innerHTML = '<p class="cineko-empty">Your cart is empty.</p>';
            } else {
                var html = '';
                for (var i = 0; i < cart.length; i++) {
                    var it = cart[i];
                    html += '<div class="cineko-item" data-i="' + i + '"><img src="' + esc(it.img) + '" alt=""><div class="cineko-info"><div class="cineko-name">' + esc(it.name) + '</div><div class="cineko-price">' + money(it.price) + '</div><div class="cineko-qty"><button data-a="dec">−</button><span>' + it.qty + '</span><button data-a="inc">+</button><button class="cineko-remove" data-a="rm">Remove</button></div></div></div>';
                }
                list.innerHTML = html;
            }
            var total = 0, qty = 0;
            for (var j = 0; j < cart.length; j++) {
                total += cart[j].price * cart[j].qty;
                qty += cart[j].qty;
            }
            totalEl.textContent = money(total);
            if (badge) badge.textContent = qty;
            save();
        }

        list.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-a]');
            if (!btn) return;
            var i = +btn.closest('.cineko-item').dataset.i;
            var a = btn.dataset.a;
            if (a === 'inc') cart[i].qty++;
            if (a === 'dec') cart[i].qty--;
            if (a === 'rm' || cart[i].qty <= 0) cart.splice(i, 1);
            draw();
        });

        section.querySelector('.cineko-clear').onclick = function () {
            cart = [];
            draw();
        };

        section.querySelector('.cineko-check').onclick = function () {
            if (!cart.length) return flash('Your cart is empty');
            var total = 0;
            for (var i = 0; i < cart.length; i++) total += cart[i].price * cart[i].qty;
            alert('Thank you for your order! Total: ' + money(total));
            cart = [];
            draw();
        };

        // add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var card = this.closest('.merch-card');
                if (!card) return;
                var name = card.querySelector('.merch-name').textContent.trim();
                var price = getPrice(card.querySelector('.merch-price').textContent);
                var img = card.querySelector('.merch-img img').getAttribute('src');

                var found = null;
                for (var i = 0; i < cart.length; i++) {
                    if (cart[i].name === name) { found = cart[i]; break; }
                }
                if (found) found.qty++;
                else cart.push({ name: name, price: price, img: img, qty: 1 });

                draw();
                flash(name + ' added to cart');
            });
        });

        draw();
    } else {
        // just update the badge on other pages
        updateBadge();
        if (nav) {
            document.getElementById('cart-toggle').addEventListener('click', function (e) {
                e.preventDefault();
                // optional: go to store page
                // location.href = 'movie store.html';
            });
        }
    }
});