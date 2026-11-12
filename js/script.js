
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

// Lead = an attempt to press "Отправить заявку", even when HTML validation fails.
// The independent click handler runs before the form submit validation.
// A retry is possible after a failed HTTP response; never lock out the click in advance.
const inFlightLeadClicks = new Set();
async function trackLeadButtonClick() {
    const subid = getKeitaroSubid();
    if (!subid) return; // No attributable campaign click.

    const key = "legion_lead_button_" + subid;
    try {
        if (sessionStorage.getItem(key) === "1") return;
    } catch (_) { /* Continue if storage is unavailable. */ }
    if (inFlightLeadClicks.has(subid)) return;
    inFlightLeadClicks.add(subid);

    try {
        const response = await fetch("/api/lead-click", {
            method: "POST",
            headers: {"Content-Type": "text/plain;charset=UTF-8"},
            body: JSON.stringify({ subid }),
            credentials: "same-origin",
            keepalive: true
        });
        if (!response.ok) {
            // No PII or postback secret is logged.
            console.warn("LEGION: lead-click endpoint returned HTTP", response.status);
            return; // Do not mark as delivered: the next press may retry.
        }
        try { sessionStorage.setItem(key, "1"); } catch (_) {}
    } catch (_) {
        console.warn("LEGION: lead-click endpoint is unreachable");
    } finally {
        inFlightLeadClicks.delete(subid);
    }
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

        const lossAmount = document.getElementById("lossAmount").value;
        const description = document.getElementById("clientMessage").value.trim();
        // Include the range in the existing description field so older Google Apps Script
        // receivers still retain it, even if they ignore the new lossAmount parameter.
        const fullDescription = lossAmount
            ? `Сумма потери: ${lossAmount}\n${description}`
            : description;

        const data = new URLSearchParams({
            name: document.getElementById("clientName").value.trim(),
            country: document.getElementById("clientCountry").value.trim(),
            email: "", // Retain the parameter for compatibility with the existing Google Apps Script.
            phone: document.getElementById("clientPhone").value.trim(),
            description: fullDescription,
            lossAmount: lossAmount,
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
