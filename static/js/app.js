/**
 * CHAI'S GRILL
 * Premium Motion + Mobile Experience Engine
 */

document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initCustomCursor();
    initSmokeEmberCanvas();
    setupMenuFilters();
    initGSAPAnimations();
    initHeaderScroll();
    initMobileNavigation();
    initBookingModal();
    initTilt();
    initSmoothScroll();
    initPromoVideoWidget();
});


/* =========================================================
   0b. PAGE PRELOADER
   ========================================================= */

function initPreloader() {
    const preloader = document.getElementById("pagePreloader");
    if (!preloader) return;

    const hide = () => {
        preloader.classList.add("is-hidden");
        // fully remove from flow after the fade-out finishes
        setTimeout(() => preloader.remove(), 650);
    };

    if (document.readyState === "complete") {
        hide();
    } else {
        window.addEventListener("load", hide);
    }
}


/* =========================================================
   1. CUSTOM MAGNETIC CURSOR
   ========================================================= */

function initCustomCursor() {

    const dot = document.querySelector(".custom-cursor-dot");
    const outline = document.querySelector(".custom-cursor-outline");

    // Disable completely on touch/mobile devices
    if (
        !dot ||
        !outline ||
        window.innerWidth < 1024 ||
        window.matchMedia("(pointer: coarse)").matches
    ) {
        if (dot) dot.style.display = "none";
        if (outline) outline.style.display = "none";
        return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        dot.style.transform =
            `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function animateOutline() {

        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;

        outline.style.transform =
            `translate3d(${outlineX}px, ${outlineY}px, 0)`;

        requestAnimationFrame(animateOutline);
    }

    animateOutline();

    const hoverables = document.querySelectorAll(
        "a, button, input, select, textarea, .luxury-glass-card"
    );

    hoverables.forEach((el) => {

        el.addEventListener("mouseenter", () => {

            outline.style.width = "65px";
            outline.style.height = "65px";
            outline.style.borderColor = "#d4af37";
            outline.style.backgroundColor =
                "rgba(212,175,55,0.12)";
        });

        el.addEventListener("mouseleave", () => {

            outline.style.width = "40px";
            outline.style.height = "40px";
            outline.style.borderColor =
                "rgba(212,175,55,0.4)";
            outline.style.backgroundColor = "transparent";
        });
    });
}


/* =========================================================
   2. SMOKE / EMBER CANVAS
   ========================================================= */

function initSmokeEmberCanvas() {

    const canvas = document.getElementById("smokeCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    let mouse = {
        x: width / 2,
        y: height / 2,
        moved: false
    };

    window.addEventListener("resize", () => {

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;
    });

    // Mouse interaction only on desktop
    if (window.innerWidth >= 768) {

        window.addEventListener("mousemove", (e) => {

            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.moved = true;
        });
    }


    class Particle {

        constructor() {
            this.reset(true);
        }

        reset(initial = false) {

            this.x = Math.random() * width;

            this.y = initial
                ? Math.random() * height
                : height + 20;

            this.radius =
                Math.random() * 2.8 + 0.6;

            this.speedY =
                Math.random() * 0.9 + 0.3;

            this.speedX =
                (Math.random() - 0.5) * 0.6;

            this.opacity =
                Math.random() * 0.75 + 0.2;

            this.isEmber =
                Math.random() > 0.35;

            this.color = this.isEmber
                ? (
                    Math.random() > 0.5
                        ? "#D4AF37"
                        : "#F97316"
                )
                : "#94A3B8";

            this.wobble =
                Math.random() * Math.PI * 2;

            this.wobbleSpeed =
                Math.random() * 0.03 + 0.01;
        }

        update() {

            this.y -= this.speedY;

            this.wobble += this.wobbleSpeed;

            this.x +=
                this.speedX +
                Math.sin(this.wobble) * 0.4;

            if (
                mouse.moved &&
                window.innerWidth >= 768
            ) {

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;

                const dist =
                    Math.sqrt(dx * dx + dy * dy);

                if (dist < 150 && dist > 0) {

                    const force =
                        (150 - dist) / 150;

                    this.x -=
                        (dx / dist) *
                        force *
                        3;

                    this.y -=
                        (dy / dist) *
                        force *
                        3;
                }
            }

            if (
                this.y < -20 ||
                this.x < -20 ||
                this.x > width + 20
            ) {
                this.reset();
            }
        }

        draw() {

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = this.color;

            ctx.globalAlpha = this.opacity;

            if (this.isEmber) {

                ctx.shadowBlur = 14;
                ctx.shadowColor = this.color;

            } else {

                ctx.shadowBlur = 4;
                ctx.shadowColor =
                    "rgba(255,255,255,0.1)";
            }

            ctx.fill();

            ctx.globalAlpha = 1;
        }
    }


    // Fewer particles on mobile
    const particleCount =
        window.innerWidth < 768 ? 28 : 65;

    const particles =
        Array.from(
            { length: particleCount },
            () => new Particle()
        );


    function render() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        particles.forEach((particle) => {

            particle.update();
            particle.draw();

        });

        requestAnimationFrame(render);
    }

    render();
}


/* =========================================================
   3. MENU AJAX + 3D COVERFLOW
   ========================================================= */

function setupMenuFilters() {

    const tabs =
        document.querySelectorAll(".category-pill");

    const searchInput =
        document.getElementById("menuSearch");

    const menuGrid =
        document.getElementById("menuGrid");

    const menuDots =
        document.getElementById("menuDots");

    const prevBtn =
        document.getElementById("menuPrev");

    const nextBtn =
        document.getElementById("menuNext");

    const menuEmpty =
        document.getElementById("menuEmpty");

    const menuLoading =
        document.getElementById("menuLoading");

    const categoryLabel =
        document.getElementById("menuCategoryLabel");

    const coverflowTitle =
        document.getElementById("menuCoverflowTitle");

    const activeName =
        document.getElementById("menuActiveName");

    const activeCategory =
        document.getElementById("menuActiveCategory");

    const activeDescription =
        document.getElementById("menuActiveDescription");

    const activePrice =
        document.getElementById("menuActivePrice");

    const activeOrder =
        document.getElementById("menuActiveOrder");

    const searchClear =
        document.getElementById("menuSearchClear");


    if (!menuGrid) return;


    /* =====================================================
       STATE
    ====================================================== */

    let menuItems = [];

    let activeIndex = 0;

    let currentCategory = "all";

    let currentQuery = "";

    let showingAll = false;

    let touchStartX = null;

    let touchStartY = null;


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function safeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value == null ? "" : String(value);

        return div.innerHTML;

    }


    /* =====================================================
       BUILD SPICE INDICATOR
    ====================================================== */

    function buildSpiceHTML(level) {

        const spice =
            Number(level || 0);

        if (!spice) {

            return `
                <span class="cf-menu-card__spice">
                    Mild & Aromatic
                </span>
            `;

        }


        let flames = "";

        for (
            let i = 0;
            i < spice;
            i++
        ) {

            flames += `
                <i class="fa-solid fa-fire"></i>
            `;

        }


        return `
            <span class="cf-menu-card__spice cf-menu-card__spice--hot">
                ${flames}
            </span>
        `;

    }


    /* =====================================================
       BUILD DIET BADGE
    ====================================================== */

    function buildDietBadge(item) {

        if (item.is_veg) {

            return `
                <span class="cf-menu-card__diet cf-menu-card__diet--veg">
                    <i class="fa-solid fa-leaf"></i>
                    VEG
                </span>
            `;

        }


        return `
            <span class="cf-menu-card__diet cf-menu-card__diet--nonveg">
                <i class="fa-solid fa-drumstick-bite"></i>
                NON-VEG
            </span>
        `;

    }
/* =====================================================
   HOMEPAGE MENU CARD
   IMAGE + ITEM NAME ONLY
====================================================== */

function createCard(item, index) {

    const card = document.createElement("button");

    card.type = "button";

    card.className = "cf-menu-card";

    card.setAttribute("role", "listitem");

    card.setAttribute(
        "aria-label",
        item.name || "Menu item"
    );

    card.dataset.menuIndex = String(index);


    const image =
        item.image || "";


    card.innerHTML = `

        <span class="cf-menu-card__image-wrap">

            <img
                class="cf-menu-card__image"
                src="${safeHTML(image)}"
                alt="${safeHTML(item.name || "Menu item")}"
                loading="lazy"
            >

            <span
                class="cf-menu-card__overlay"
                aria-hidden="true">
            </span>

            <span
                class="cf-menu-card__sheen"
                aria-hidden="true">
            </span>


            <span class="cf-menu-card__caption">

                <span class="cf-menu-card__name">
                    ${safeHTML(item.name || "Menu item")}
                </span>

            </span>

        </span>

    `;


    card.addEventListener(
        "click",
        function () {

            const clickedIndex =
                Number(
                    this.dataset.menuIndex
                );


            if (
                clickedIndex === activeIndex
            ) {
                return;
            }


            setActive(clickedIndex);

        }
    );


    return card;
}
/* =====================================================
   RENDER CARDS
====================================================== */

function renderCards() {

    menuGrid.innerHTML = "";

    /*
     * Homepage may not have menuDots.
     * Menu page does.
     * So only access it when it exists.
     */
    if (menuDots) {
        menuDots.innerHTML = "";
    }


    if (!menuItems.length) {

        menuGrid.classList.add(
            "cf-menu-track--empty"
        );

        if (menuEmpty) {

            menuEmpty.classList.remove(
                "hidden"
            );

        }

        updateDetail(null);

        return;
    }


    menuGrid.classList.remove(
        "cf-menu-track--empty"
    );


    if (menuEmpty) {

        menuEmpty.classList.add(
            "hidden"
        );

    }


    menuItems.forEach(
        (item, index) => {

            const card =
                createCard(
                    item,
                    index
                );

            menuGrid.appendChild(card);

        }
    );


    /*
     * Only create dots when the
     * dots container exists.
     */
    if (menuDots) {
        createDots();
    }


    activeIndex =
        Math.min(
            activeIndex,
            menuItems.length - 1
        );


    renderCoverflow();

}


    /* =====================================================
       CREATE DOTS
    ====================================================== */

    function createDots() {

        menuItems.forEach(
            (item, index) => {

                const dot =
                    document.createElement(
                        "button"
                    );

                dot.type = "button";

                dot.className =
                    "cf-menu-dot";

                dot.setAttribute(
                    "role",
                    "tab"
                );

                dot.setAttribute(
                    "aria-label",
                    `Go to ${item.name}`
                );


                dot.addEventListener(
                    "click",
                    () => {

                        setActive(index);

                    }
                );


                menuDots.appendChild(dot);

            }
        );

    }


    /* =====================================================
       GET CARD SPACING
    ====================================================== */

    function getSpacing() {

        const root =
            getComputedStyle(
                document.documentElement
            );


        const cssSpacing =
            parseFloat(
                root.getPropertyValue(
                    "--cf-menu-spacing"
                )
            );


        if (
            Number.isFinite(cssSpacing) &&
            cssSpacing > 0
        ) {

            return cssSpacing;

        }


        if (
            window.innerWidth < 640
        ) {

            return 150;

        }


        if (
            window.innerWidth < 1024
        ) {

            return 190;

        }


        return 250;

    }


    /* =====================================================
       RENDER 3D POSITIONS
    ====================================================== */

    function renderCoverflow() {

        const cards =
            Array.from(
                menuGrid.querySelectorAll(
                    ".cf-menu-card"
                )
            );


        const dots =
        menuDots
            ? Array.from(
                menuDots.querySelectorAll(
                    ".cf-menu-dot"
                )
            )
        : [];


        const spacing =
            getSpacing();


        cards.forEach(
            (card, index) => {

                const offset =
                    index - activeIndex;

                const abs =
                    Math.abs(offset);


                card.classList.toggle(
                    "is-active",
                    offset === 0
                );


                /*
                 * Hide cards that are too far
                 * away from the active card.
                 */

                if (abs > 4) {

                    card.style.opacity = "0";

                    card.style.pointerEvents =
                        "none";

                    card.style.zIndex = "0";

                    card.style.transform =
                        `
                        translateX(${offset * spacing}px)
                        translateZ(-500px)
                        rotateY(${offset > 0 ? -18 : 18}deg)
                        scale(.55)
                        `;

                    return;

                }


                /*
                 * Active card
                 */

                const scale =
                    offset === 0
                        ? 1
                        : Math.max(
                            0.62,
                            1 - abs * 0.13
                        );


                /*
                 * Rotation
                 */

                const rotate =
                    offset === 0
                        ? 0
                        : offset > 0
                            ? -15
                            : 15;


                /*
                 * Depth
                 */

                const translateZ =
                    offset === 0
                        ? 0
                        : -(abs * 100);


                /*
                 * Opacity
                 */

                const opacity =
                    offset === 0
                        ? 1
                        : Math.max(
                            0.25,
                            1 - abs * 0.24
                        );


                card.style.opacity =
                    String(opacity);


                card.style.pointerEvents =
                    "auto";


                card.style.zIndex =
                    String(
                        100 - abs
                    );


                card.style.transform =
                    `
                    translateX(${offset * spacing}px)
                    translateZ(${translateZ}px)
                    rotateY(${rotate}deg)
                    scale(${scale})
                    `;

            }
        );


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "is-active",
                    index === activeIndex
                );

            }
        );


        updateDetail(
            menuItems[activeIndex]
        );

    }


    /* =====================================================
       SET ACTIVE CARD
    ====================================================== */

    function setActive(index) {

        if (!menuItems.length) {
            return;
        }


        activeIndex =
            Math.max(
                0,
                Math.min(
                    menuItems.length - 1,
                    index
                )
            );


        renderCoverflow();

    }


    /* =====================================================
       PREVIOUS
    ====================================================== */

    function previousItem() {

        if (!menuItems.length) {
            return;
        }


        /*
         * Loop from first → last
         */

        if (activeIndex <= 0) {

            setActive(
                menuItems.length - 1
            );

            return;

        }


        setActive(
            activeIndex - 1
        );

    }


    /* =====================================================
       NEXT
    ====================================================== */

    function nextItem() {

        if (!menuItems.length) {
            return;
        }


        /*
         * Loop from last → first
         */

        if (
            activeIndex >=
            menuItems.length - 1
        ) {

            setActive(0);

            return;

        }


        setActive(
            activeIndex + 1
        );

    }


    /* =====================================================
       ACTIVE ITEM INFORMATION
    ====================================================== */

    function updateDetail(item) {

        if (!item) {

            if (activeName) {

                activeName.textContent =
                    "No menu items";

            }

            if (activeDescription) {

                activeDescription.textContent =
                    "Try another category or search.";

            }

            if (activePrice) {

                activePrice.textContent =
                    "₹0";

            }

            return;

        }


        if (activeName) {

            activeName.textContent =
                item.name || "";

        }


        if (activeCategory) {

            activeCategory.textContent =
                (
                    item.category ||
                    "CHAI GRILL"
                ).toUpperCase();

        }


        if (activeDescription) {

            activeDescription.textContent =
                item.desc ||
                "A signature Chai Grill favourite.";

        }


        if (activePrice) {

            activePrice.textContent =
                `₹${item.price}`;

        }


        if (activeOrder) {

            activeOrder.onclick =
                () => {

                    quickOrderWhatsApp(
                        item.name
                    );

                };

        }

    }


    /* =====================================================
       UPDATE CATEGORY TITLE
    ====================================================== */

    function updateCategoryHeading(
        category,
        itemCount
    ) {

        let title =
            "Featured Favourites";

        let label =
            "Featured Selection";


        if (
            category &&
            category !== "all"
        ) {

            const activeTab =
                document.querySelector(
                    `.category-pill[data-category="${CSS.escape(category)}"]`
                );


            if (activeTab) {

                const categoryName =
                    activeTab.textContent.trim();


                title =
                    categoryName;

                label =
                    categoryName;

            } else {

                title =
                    "Our Menu";

                label =
                    "Menu Selection";

            }

        }


        if (coverflowTitle) {

            coverflowTitle.textContent =
                title;

        }


        if (categoryLabel) {

            categoryLabel.textContent =
                `${label} · ${itemCount} ITEM${itemCount === 1 ? "" : "S"}`;

        }

    }


    /* =====================================================
       LOAD MENU FROM DJANGO API
    ====================================================== */

    function fetchMenuItems(
        category = "all",
        query = "",
        showAll = false
    ) {

        currentCategory =
            category;

        currentQuery =
            query;


        if (menuLoading) {

            menuLoading.classList.remove(
                "hidden"
            );

        }


        menuGrid.classList.add(
            "menu-loading"
        );


        const url =
            `/api/menu/?category=${encodeURIComponent(category)}`
            +
            `&q=${encodeURIComponent(query)}`
            +
            `&show_all=${showAll ? "1" : "0"}`;


        fetch(url)

            .then(
                (response) => {

                    if (!response.ok) {

                        throw new Error(
                            `HTTP ${response.status}`
                        );

                    }


                    return response.json();

                }
            )

            .then(
                (data) => {

                    if (
                        !data ||
                        !Array.isArray(
                            data.items
                        )
                    ) {

                        throw new Error(
                            "Invalid menu response"
                        );

                    }


                    menuItems =
                        data.items;


                    /*
                     * Start each category at
                     * the middle card where
                     * possible.
                     */

                    if (
                        menuItems.length > 1
                    ) {

                        activeIndex =
                            Math.floor(
                                menuItems.length / 2
                            );

                    } else {

                        activeIndex = 0;

                    }


                    updateCategoryHeading(
                        category,
                        menuItems.length
                    );


                    renderCards();

                }
            )

            .catch(
                (error) => {

                    console.error(
                        "Menu loading error:",
                        error
                    );


                    menuItems = [];

                    menuGrid.innerHTML = `

                        <div class="cf-menu-error">

                            <div class="cf-menu-error__icon">

                                <i class="fa-solid fa-circle-exclamation"></i>

                            </div>

                            <h3>
                                Unable to load menu
                            </h3>

                            <p>
                                Please refresh the page
                                and try again.
                            </p>

                        </div>

                    `;


                    if (menuEmpty) {

                        menuEmpty.classList.add(
                            "hidden"
                        );

                    }

                }
            )

            .finally(
                () => {

                    menuGrid.classList.remove(
                        "menu-loading"
                    );


                    if (menuLoading) {

                        menuLoading.classList.add(
                            "hidden"
                        );

                    }

                }
            );

    }


    /* =====================================================
       CATEGORY BUTTONS
    ====================================================== */

    tabs.forEach(
        (tab) => {

            tab.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        (t) => {

                            t.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    const category =
                        tab.dataset.category ||
                        "all";


                    fetchMenuItems(
                        category,
                        searchInput
                            ? searchInput.value.trim()
                            : "",
                        false
                    );

                }
            );

        }
    );


    /* =====================================================
       SEARCH
    ====================================================== */

    if (searchInput) {

        let debounceTimer;


        searchInput.addEventListener(
            "input",
            (event) => {

                clearTimeout(
                    debounceTimer
                );


                const value =
                    event.target.value.trim();


                if (searchClear) {

                    searchClear.classList.toggle(
                        "hidden",
                        !value
                    );

                }


                debounceTimer =
                    setTimeout(
                        () => {

                            const activeTab =
                                document.querySelector(
                                    ".category-pill.active"
                                );


                            const category =
                                activeTab
                                    ? activeTab.dataset.category
                                    : "all";


                            fetchMenuItems(
                                category,
                                value,
                                false
                            );

                        },
                        300
                    );

            }
        );

    }


    /* =====================================================
       SEARCH CLEAR
    ====================================================== */

    if (searchClear) {

        searchClear.addEventListener(
            "click",
            () => {

                if (searchInput) {

                    searchInput.value = "";

                }


                searchClear.classList.add(
                    "hidden"
                );


                const activeTab =
                    document.querySelector(
                        ".category-pill.active"
                    );


                const category =
                    activeTab
                        ? activeTab.dataset.category
                        : "all";


                fetchMenuItems(
                    category,
                    "",
                    false
                );

            }
        );

    }


    /* =====================================================
       PREVIOUS / NEXT BUTTONS
    ====================================================== */

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            previousItem
        );

    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            nextItem
        );

    }


    /* =====================================================
       KEYBOARD NAVIGATION
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (!menuItems.length) {
                return;
            }


            const stage =
                document.getElementById("menuCoverflow") ||
                menuGrid.closest(".cf-menu-coverflow") ||
                menuGrid.parentElement;

            if (!stage) {
                return;
            }


            const rect =
                stage.getBoundingClientRect();


            const inView =
                rect.top <
                window.innerHeight &&
                rect.bottom > 0;


            if (!inView) {
                return;
            }


            /*
             * Don't steal arrow keys from
             * an input field.
             */

            const tag =
                document.activeElement
                    ? document.activeElement.tagName
                    : "";


            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT"
            ) {

                return;

            }


            if (
                event.key === "ArrowLeft"
            ) {

                event.preventDefault();

                previousItem();

            }


            if (
                event.key === "ArrowRight"
            ) {

                event.preventDefault();

                nextItem();

            }

        }
    );


    /* =====================================================
       TOUCH / SWIPE
    ====================================================== */

    menuGrid.addEventListener(
        "touchstart",
        (event) => {

            if (
                !event.touches ||
                !event.touches.length
            ) {

                return;

            }


            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    menuGrid.addEventListener(
        "touchend",
        (event) => {

            if (
                touchStartX === null ||
                touchStartY === null
            ) {

                return;

            }


            const endX =
                event.changedTouches[0].clientX;

            const endY =
                event.changedTouches[0].clientY;


            const dx =
                endX - touchStartX;

            const dy =
                endY - touchStartY;


            /*
             * Only treat it as a swipe when
             * horizontal movement is stronger
             * than vertical movement.
             */

            if (
                Math.abs(dx) > 45 &&
                Math.abs(dx) > Math.abs(dy)
            ) {

                if (dx < 0) {

                    nextItem();

                } else {

                    previousItem();

                }

            }


            touchStartX = null;

            touchStartY = null;

        },
        {
            passive: true
        }
    );


    /* =====================================================
       RESIZE
    ====================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        renderCoverflow();

                    },
                    120
                );

        }
    );


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    fetchMenuItems(
        "all",
        "",
        false
    );

}

/* =========================================================
   4. SAFE HTML HELPERS
   ========================================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}


function escapeJS(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");
}


/* =========================================================
   5. BOOKING MODAL
   ========================================================= */

function initBookingModal() {

    const modal =
        document.getElementById("bookingModal");

    if (!modal) return;


    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            closeBookingModal();
        }
    });


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeBookingModal();
            }
        }
    );
}


function openBookingModal() {

    const modal =
        document.getElementById("bookingModal");

    if (!modal) return;

    modal.classList.remove("hidden");

    document.body.classList.add(
        "modal-open"
    );


    if (
        typeof gsap !== "undefined"
    ) {

        gsap.fromTo(
            "#bookingModal > div",
            {
                scale: 0.92,
                opacity: 0,
                y: 20
            },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "back.out(1.5)"
            }
        );

    }
}


function closeBookingModal() {

    const modal =
        document.getElementById("bookingModal");

    if (!modal) return;

    modal.classList.add("hidden");

    document.body.classList.remove(
        "modal-open"
    );
}


function quickOrderWhatsApp(dishName) {

    const text =
        `*CHAI GRILL KOCHI - INSTANT ORDER*%0A%0A` +
        `Hi, I would like to order: *${dishName}*%0A` +
        `Please confirm outlet availability & delivery.`;

    window.open(
        `https://wa.me/919747478292?text=${text}`,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   6. GSAP ANIMATIONS
   ========================================================= */

function initGSAPAnimations() {

    // IMPORTANT:
    // Never hide content if GSAP is unavailable.
    if (
        typeof gsap === "undefined" ||
        typeof ScrollTrigger === "undefined"
    ) {

        console.warn(
            "GSAP / ScrollTrigger unavailable. " +
            "Animations disabled safely."
        );

        return;
    }


    gsap.registerPlugin(
        ScrollTrigger
    );


    /* HERO */

    if (
        document.querySelector(
            ".hero-title-reveal"
        )
    ) {

        gsap.fromTo(
            ".hero-title-reveal",
            {
                opacity: 0,
                y: 40
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.1,
                stagger: 0.12,
                ease: "power4.out"
            }
        );
    }


    if (
        document.querySelector(
            ".hero-badge-reveal"
        )
    ) {

        gsap.fromTo(
            ".hero-badge-reveal",
            {
                opacity: 0,
                scale: 0.85
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: 0.15,
                ease: "back.out(1.8)"
            }
        );
    }


    /* EXPERIENCE CARDS */

    const experienceCards =
        document.querySelectorAll(
            ".exp-card"
        );


    if (experienceCards.length) {

        // Make absolutely sure cards are visible
        gsap.set(
            experienceCards,
            {
                opacity: 1,
                visibility: "visible"
            }
        );


        gsap.fromTo(
            experienceCards,
            {
                opacity: 0,
                y: 35
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",

                scrollTrigger: {
                    trigger: "#experience",
                    start: "top 85%",
                    toggleActions:
                        "play none none none"
                }
            }
        );
    }


    /* OUTLET CARDS */

    const outletCards =
        document.querySelectorAll(
            ".outlet-card-anim"
        );


    if (outletCards.length) {

        gsap.set(
            outletCards,
            {
                opacity: 1,
                visibility: "visible"
            }
        );


        gsap.fromTo(
            outletCards,
            {
                opacity: 0,
                y: 35
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out",

                scrollTrigger: {
                    trigger: "#outlets",
                    start: "top 85%",
                    toggleActions:
                        "play none none none"
                }
            }
        );
    }


    // Refresh after everything has rendered
    setTimeout(() => {

        ScrollTrigger.refresh();

    }, 300);
}


/* =========================================================
   7. HEADER SCROLL
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.getElementById(
            "main-header"
        );

    if (!header) return;


    function updateHeader() {

        if (window.scrollY > 40) {

            header.classList.add(
                "header-scrolled"
            );

        } else {

            header.classList.remove(
                "header-scrolled"
            );
        }
    }


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();
}


/* =========================================================
   8. MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {

    const drawer =
        document.getElementById(
            "mobile-drawer"
        );

    if (!drawer) return;


    const menuButton =
        document.querySelector(
            "#main-header button.md\\:hidden"
        );


    // Close drawer when link is clicked
    drawer.querySelectorAll("a").forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    drawer.classList.add(
                        "hidden"
                    );
                }
            );
        }
    );


    // Close drawer when clicking outside
    document.addEventListener(
        "click",
        (event) => {

            if (
                !drawer.classList.contains(
                    "hidden"
                ) &&
                !drawer.contains(
                    event.target
                ) &&
                !event.target.closest(
                    "#main-header button"
                )
            ) {

                drawer.classList.add(
                    "hidden"
                );
            }
        }
    );


    // Close on resize to desktop
    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth >= 768) {

                drawer.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   9. VANILLA TILT
   ========================================================= */

function initTilt() {

    if (
        typeof VanillaTilt === "undefined"
    ) {
        return;
    }


    // Avoid tilt on touch devices
    if (
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "[data-tilt]"
        );


    elements.forEach((element) => {

        // Prevent initializing twice
        if (
            element.vanillaTilt
        ) {
            return;
        }


        VanillaTilt.init(
            element,
            {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.01
            }
        );
    });
}


/* =========================================================
   10. SMOOTH ANCHOR SCROLL
   ========================================================= */

function initSmoothScroll() {

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach((link) => {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    this.getAttribute(
                        "href"
                    );

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) return;

                event.preventDefault();


                const header =
                    document.getElementById(
                        "main-header"
                    );

                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 80;


                const targetPosition =
                    target.getBoundingClientRect()
                        .top +
                    window.scrollY -
                    headerHeight -
                    15;


                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        );
    });
}

/* =========================================================
   0. FLOATING PROMO VIDEO WIDGET
   ========================================================= */

function initPromoVideoWidget() {
    const widget = document.getElementById("promoVideoWidget");
    if (!widget) return;

    const closeBtn = document.getElementById("promoVideoClose");
    const muteBtn = document.getElementById("promoVideoMute");
    const muteIcon = document.getElementById("promoVideoMuteIcon");
    const player = document.getElementById("promoVideoPlayer");

    closeBtn.addEventListener("click", () => {
        widget.classList.add("hidden");
        if (player) player.pause();
    });

    muteBtn.addEventListener("click", () => {
        if (!player) return;
        player.muted = !player.muted;
        muteIcon.className = player.muted
            ? "fa-solid fa-volume-xmark"
            : "fa-solid fa-volume-high";
    });

    if (player) {
        player.play().catch(() => {});
    }
}
/* SPECIALITY CARDS */
const specialtyCards = document.querySelectorAll(".specialty-card");

if (specialtyCards.length) {
    gsap.set(specialtyCards, { opacity: 1, visibility: "visible" });

    gsap.fromTo(
        specialtyCards,
        { opacity: 0, y: 40, scale: 0.96 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#specialities",
                start: "top 82%",
                toggleActions: "play none none none"
            }
        }
    );
}