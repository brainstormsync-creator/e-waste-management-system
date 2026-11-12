// =========================================================
// E-WASTE MANAGEMENT SYSTEM - HOMEPAGE JAVASCRIPT
// =========================================================

// Wait until the whole HTML page has loaded before running our code
document.addEventListener("DOMContentLoaded", function () {
  // ---------- 1. SELECT ELEMENTS WE NEED ----------
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.getElementById("backToTop");
  const sections = document.querySelectorAll("main section[id]");

  // ---------- 2. MOBILE MENU TOGGLE ----------
  // Clicking the hamburger opens or closes the menu on small screens
  menuToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Close the mobile menu after the user clicks a link
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- 3. SCROLL EFFECTS ----------
  // Runs every time the user scrolls the page
  function handleScroll() {
    const scrollY = window.scrollY;

    // Add a shadow to the navbar after scrolling down a little
    navbar.classList.toggle("scrolled", scrollY > 10);

    // Show the "back to top" button after scrolling 400px
    backToTop.classList.toggle("show", scrollY > 400);

    // Highlight the nav link of the section currently on screen
    let currentSection = "home";
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + currentSection
      );
    });
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // run once on page load

  // Back to top button click
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- 4. ANIMATED NUMBER COUNTERS (hero card) ----------
  const counters = document.querySelectorAll(".stat strong");

  function animateCounter(counter) {
    const target = Number(counter.getAttribute("data-target"));
    const duration = 1500; // total animation time in milliseconds
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      counter.textContent = Math.floor(progress * target) + "+";
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  counters.forEach(animateCounter);

  // ---------- 5. SCROLL REVEAL ANIMATION ----------
  // Cards and steps fade in when they scroll into view
  const revealItems = document.querySelectorAll(".card, .step, .contact-info, .contact-form, .about-box");
  revealItems.forEach(function (item) {
    item.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });

  // ---------- 6. CONTACT FORM VALIDATION ----------
  const contactForm = document.getElementById("contactForm");
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const messageInput = document.getElementById("contactMessage");
  const formSuccess = document.getElementById("formSuccess");

  // Shows an error message under a field and turns its border red
  function showError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.parentElement.classList.add("invalid");
  }

  // Clears the error message of a field
  function clearError(input, errorId) {
    document.getElementById(errorId).textContent = "";
    input.parentElement.classList.remove("invalid");
  }

  // Checks all fields. Returns true only if everything is valid.
  function validateContactForm() {
    let isValid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Simple email pattern: text@text.text
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name check
    if (name.length < 3) {
      showError(nameInput, "nameError", "Name must be at least 3 characters.");
      isValid = false;
    } else {
      clearError(nameInput, "nameError");
    }

    // Email check
    if (!emailPattern.test(email)) {
      showError(emailInput, "emailError", "Please enter a valid email address.");
      isValid = false;
    } else {
      clearError(emailInput, "emailError");
    }

    // Message check
    if (message.length < 10) {
      showError(messageInput, "messageError", "Message must be at least 10 characters.");
      isValid = false;
    } else {
      clearError(messageInput, "messageError");
    }

    return isValid;
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading
    formSuccess.textContent = "";

    if (validateContactForm()) {
      // NOTE: There is no backend yet, so we only show a success message.
      // In a later module we will send this data to the server.
      formSuccess.textContent = "✅ Thank you! Your message has been received.";
      contactForm.reset();
    }
  });

  // ---------- 7. FOOTER YEAR ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});