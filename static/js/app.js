/**
 * CHAI'S GRILL
 * Premium Motion + Mobile Experience Engine
 */

document.addEventListener("DOMContentLoaded", () => {
    initCustomCursor();
    initSmokeEmberCanvas();
    setupMenuFilters();
    initGSAPAnimations();
    initHeaderScroll();
    initMobileNavigation();
    initBookingModal();
    initTilt();
    initSmoothScroll();
});


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
   3. MENU AJAX FILTER
   ========================================================= */

function setupMenuFilters() {

    const tabs =
        document.querySelectorAll(".category-pill");

    const searchInput =
        document.getElementById("menuSearch");

    const menuGrid =
        document.getElementById("menuGrid");

    if (!menuGrid) return;


    function buildSpiceLevelHTML(level) {

        if (!level || level === 0) {

            return `
                <span class="text-[10px] text-slate-400 font-medium">
                    Mild & Aromatic
                </span>
            `;
        }

        let peppers = "";

        for (let i = 0; i < level; i++) {

            peppers += `
                <i class="fa-solid fa-fire
                text-amber-500 flame-glow
                text-[11px] mr-0.5"></i>
            `;
        }

        return `
            <div class="flex items-center gap-1">
                ${peppers}
                <span class="text-[10px] text-amber-400
                font-semibold uppercase tracking-wider ml-1">
                    Smoked Heat
                </span>
            </div>
        `;
    }


    function fetchMenuItems(
        category = "all",
        query = "",
        showAll = false
    ) {

        menuGrid.classList.add("menu-loading");

        fetch(
            `/api/menu/?category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}&show_all=${showAll ? "1" : "0"}`
        )
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                return response.json();
            })

            .then((data) => {

                if (!data.items) {
                    throw new Error(
                        "Invalid menu response"
                    );
                }


                if (data.items.length === 0) {

                    menuGrid.innerHTML = `
                        <div class="col-span-full
                        py-16 text-center">

                            <div class="w-16 h-16
                            rounded-full bg-gold/10
                            border border-gold/30
                            flex items-center
                            justify-center
                            text-gold mx-auto mb-4">

                                <i class="fa-solid fa-mug-hot
                                text-2xl"></i>

                            </div>

                            <h3 class="font-cinzel
                            text-xl font-bold
                            text-white mb-1">

                                No Culinary Matches Found

                            </h3>

                            <p class="text-xs text-slate-400">

                                Try searching for
                                "Alfaham", "Dum Chai",
                                "Shawarma" or "Burger".

                            </p>

                        </div>
                    `;

                    return;
                }


                menuGrid.innerHTML =
                    data.items.map((item) => `

                    <div
                        class="luxury-glass-card
                        rounded-3xl p-5
                        flex flex-col
                        justify-between group
                        menu-item-card"
                        data-tilt
                    >

                        <div>

                            <div class="relative
                            h-52 sm:h-56
                            rounded-2xl overflow-hidden
                            mb-4 bg-charcoal-800">

                                <img
                                    src="${item.image || ''}"
                                    alt="${escapeHTML(item.name)}"
                                    class="w-full h-full
                                    object-cover
                                    group-hover:scale-110
                                    transition-transform
                                    duration-700"
                                    loading="lazy"
                                />

                                <div class="absolute inset-0
                                bg-gradient-to-t
                                from-charcoal-900/90
                                via-transparent
                                to-transparent">
                                </div>

                                <div class="absolute
                                top-3 right-3
                                bg-charcoal-900/90
                                backdrop-blur-md
                                px-3.5 py-1
                                rounded-full
                                border border-gold/40
                                font-cinzel
                                text-gold font-bold
                                text-sm">

                                    ₹${item.price}

                                </div>

                                <div class="absolute
                                bottom-3 left-3
                                flex gap-2 flex-wrap">

                                    ${
                                        item.is_veg
                                        ?
                                        `
                                        <span class="px-2.5 py-1
                                        text-[10px] font-bold
                                        rounded-lg border
                                        bg-emerald-500/20
                                        text-emerald-300
                                        border-emerald-500/40">
                                            VEG
                                        </span>
                                        `
                                        :
                                        `
                                        <span class="px-2.5 py-1
                                        text-[10px] font-bold
                                        rounded-lg border
                                        bg-red-500/20
                                        text-red-300
                                        border-red-500/40">
                                            NON-VEG
                                        </span>
                                        `
                                    }

                                    ${
                                        item.is_bestseller
                                        ?
                                        `
                                        <span class="pulse-badge
                                        px-2.5 py-1
                                        text-[10px]
                                        font-bold rounded-lg
                                        border bg-gradient-to-r
                                        from-gold via-amber-500
                                        to-gold-600
                                        text-charcoal-950
                                        border-gold shadow-md">
                                            BESTSELLER
                                        </span>
                                        `
                                        :
                                        ""
                                    }

                                </div>

                            </div>


                            <h3 class="font-cinzel
                            text-lg sm:text-xl
                            font-bold text-white
                            group-hover:text-gold
                            transition-colors">

                                ${escapeHTML(item.name)}

                            </h3>


                            <p class="text-xs
                            text-slate-400 mt-2
                            line-clamp-2
                            leading-relaxed">

                                ${escapeHTML(item.desc || "")}

                            </p>

                        </div>


                        <div class="mt-6 pt-4
                        border-t border-slate-700/60
                        flex items-center
                        justify-between gap-3">

                            ${buildSpiceLevelHTML(item.spice)}

                            <button
                                onclick="quickOrderWhatsApp('${escapeJS(item.name)}')"
                                class="shrink-0 px-4 py-2
                                rounded-xl
                                bg-gradient-to-r
                                from-gold/15
                                to-amber-500/10
                                hover:from-gold
                                hover:to-amber-500
                                hover:text-charcoal-950
                                text-gold text-xs
                                font-bold border
                                border-gold/30
                                transition-all
                                flex items-center gap-1.5">

                                <span>Order</span>

                                <i class="fa-brands
                                fa-whatsapp text-sm"></i>

                            </button>

                        </div>

                    </div>

                `).join("");


                initTilt();


                // Animate newly loaded menu cards
                if (
                    typeof gsap !== "undefined"
                ) {

                    gsap.fromTo(
                        ".menu-item-card",
                        {
                            opacity: 0,
                            y: 20
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.45,
                            stagger: 0.06,
                            ease: "power2.out"
                        }
                    );
                }

            })

            .catch((error) => {

                console.error(
                    "Menu loading error:",
                    error
                );

                menuGrid.innerHTML = `
                    <div class="col-span-full
                    text-center py-12">

                        <i class="fa-solid fa-circle-exclamation
                        text-red-400 text-3xl mb-3"></i>

                        <p class="text-slate-400">
                            Unable to load menu.
                            Please refresh the page.
                        </p>

                    </div>
                `;

            })

            .finally(() => {

                menuGrid.classList.remove(
                    "menu-loading"
                );

            });
    }


    tabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            tabs.forEach((t) =>
                t.classList.remove("active")
            );

            tab.classList.add("active");

            fetchMenuItems(
                tab.dataset.category,
                searchInput
                    ? searchInput.value
                    : ""
            );
        });
    });

    const showAllToggle = document.getElementById("showAllToggle");
    let showingAll = false;

    if (showAllToggle) {
        showAllToggle.addEventListener("click", () => {
            showingAll = !showingAll;

            const activeTab = document.querySelector(".category-pill.active");
            const category = activeTab ? activeTab.dataset.category : "all";

            fetchMenuItems(category, searchInput ? searchInput.value : "", showingAll);

            showAllToggle.innerHTML = showingAll
                ? `Showing full menu — <span class="underline">tap to view bestsellers only</span>`
                : `Showing our bestsellers — <span class="underline">tap to view the full menu</span>`;
        });
    }

    if (searchInput) {

        let debounceTimer;

        searchInput.addEventListener(
            "input",
            (event) => {

                clearTimeout(debounceTimer);

                debounceTimer = setTimeout(() => {

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
                        event.target.value
                    );

                }, 300);
            }
        );
    }
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