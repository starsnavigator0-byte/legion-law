
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


// CONTACT FORM

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzoWX8SMQl8muhtRDv8df0SaxOwm11_-eaAJz9tSlQimlEe4k6ONSzokyG_w-mJT4QU/exec";

if (contactForm && formMessage) {

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
            website: honeypot ? honeypot.value.trim() : ""
        });

        try {

            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: data
            });

            formMessage.textContent =
                "Ваш запрос передан на обработку. Если потребуется, мы свяжемся с вами.";

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
