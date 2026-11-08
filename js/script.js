
// =========================================
// LEGION — INTERACTIVE FUNCTIONS
// =========================================


// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {

    menuToggle.addEventListener("click", () => {

        navigation.classList.toggle("active");

        const isOpen = navigation.classList.contains("active");

        menuToggle.textContent = isOpen ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", String(isOpen));

    });

    // Закрываем меню после перехода по ссылке

    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navigation.classList.remove("active");

            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");

        });

    });

}


// Save the click ID supplied by Keitaro for form attribution.
// sessionStorage persists across navigation in this tab, but not indefinitely.
const KEITARO_SUBID_KEY = "legion_keitaro_subid";
function getKeitaroSubid() {
    const fromUrl = new URLSearchParams(window.location.search).get("subid");
    const validSubid = (value) => typeof value === "string" &&
        /^[a-zA-Z0-9._-]{1,128}$/.test(value) && value !== "subid";
    try {
        if (validSubid(fromUrl)) {
            sessionStorage.setItem(KEITARO_SUBID_KEY, fromUrl);
            return fromUrl;
        }
        const saved = sessionStorage.getItem(KEITARO_SUBID_KEY);
        return validSubid(saved) ? saved : "";
    } catch (_) {
        return validSubid(fromUrl) ? fromUrl : "";
    }
}
// Capture the ID before the visitor navigates to another page.
getKeitaroSubid();

// Count a click on "Отправить заявку" as a Keitaro Lead attempt.
// This is intentionally NOT confirmation that a form was saved.
// A Pages Function keeps the private Keitaro postback URL off the public site.
function trackLeadButtonClick() {
    const subid = getKeitaroSubid();
    if (!subid) return; // No attributable campaign click.

    // Prevent accidental double-counting from repeated presses in the same tab.
    const key = "legion_lead_button_" + subid;
    try {
        if (sessionStorage.getItem(key) === "1") return;
        sessionStorage.setItem(key, "1");
    } catch (_) { /* storage unavailable: proceed */ }

    const payload = JSON.stringify({subid});
    const endpoint = "/api/lead-click";
    try {
        if (navigator.sendBeacon) {
            const queued = navigator.sendBeacon(endpoint, new Blob([payload], {type: "text/plain"}));
            if (queued) return;
        }
        fetch(endpoint, {method: "POST", headers: {"Content-Type": "text/plain"},
            body: payload, keepalive: true, credentials: "same-origin"}).catch(() => {});
    } catch (_) { /* Lead attempt must never break form submission. */ }
}

// CONTACT FORM

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzoWX8SMQl8muhtRDv8df0SaxOwm11_-eaAJz9tSlQimlEe4k6ONSzokyG_w-mJT4QU/exec";

if (contactForm && formMessage) {

    const submitButtonForTracking = contactForm.querySelector('[type="submit"]');
    if (submitButtonForTracking) {
        // Real button clicks, including when HTML validation prevents submit.
        submitButtonForTracking.addEventListener("click", trackLeadButtonClick);
    }

    let requestInProgress = false;

    contactForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        if (requestInProgress) return;

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const honeypot = document.getElementById("website");

        if (honeypot && honeypot.value.trim() !== "") {
            return;
        }

        requestInProgress = true;

        const submitButton = contactForm.querySelector('[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        formMessage.textContent = "Отправляем заявку...";

        const data = new URLSearchParams({
            name: document.getElementById("clientName").value.trim(),
            country: document.getElementById("clientCountry").value.trim(),
            email: document.getElementById("clientEmail").value.trim(),
            phone: document.getElementById("clientPhone").value.trim(),
            description: document.getElementById("clientMessage").value.trim(),
            website: honeypot ? honeypot.value.trim() : "",
            subid: getKeitaroSubid()
        });

        try {

            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: data
            });

            // A no-cors response is opaque: it does not confirm the row was saved.
            formMessage.textContent =
                "Запрос отправлен. Если потребуется, мы свяжемся с вами.";

            contactForm.reset();

        } catch (error) {

            formMessage.textContent =
                "Не удалось отправить запрос. Проверьте интернет и попробуйте ещё раз.";

        } finally {

            requestInProgress = false;

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    });
}
