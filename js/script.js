// Global variables
let currentImageIndex = 0
const images = [
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
]

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeCalculators()
  initializeOrderForm()
  initializeSmoothScroll()
  initializeMobileMenu()
  initializePhoneFormatting()
  setMinDate()
})

// Initialize all calculators
function initializeCalculators() {
  // Hero calculator
  const heroProductSelect = document.getElementById("heroProductSelect")
  const heroWeightInput = document.getElementById("heroWeightInput")
  const heroTotalPrice = document.getElementById("heroTotalPrice")

  if (heroProductSelect && heroWeightInput && heroTotalPrice) {
    function calculateHeroPrice() {
      const pricePerKg = Number.parseFloat(heroProductSelect.value)
      const weight = Number.parseFloat(heroWeightInput.value) || 0
      const total = pricePerKg * weight

      if (total > 0) {
        heroTotalPrice.textContent = `${total.toLocaleString("ru-RU")} ₸`
      } else {
        heroTotalPrice.textContent = "0 ₸"
      }
    }

    heroProductSelect.addEventListener("change", calculateHeroPrice)
    heroWeightInput.addEventListener("input", calculateHeroPrice)
  }

  // Quick calculator (order page)
  const quickProductSelect = document.getElementById("quickProductSelect")
  const quickWeightInput = document.getElementById("quickWeightInput")
  const quickTotalPrice = document.getElementById("quickTotalPrice")

  if (quickProductSelect && quickWeightInput && quickTotalPrice) {
    function calculateQuickPrice() {
      const pricePerKg = Number.parseFloat(quickProductSelect.value)
      const weight = Number.parseFloat(quickWeightInput.value) || 0
      const total = pricePerKg * weight

      if (total > 0) {
        quickTotalPrice.textContent = `${total.toLocaleString("ru-RU")} ₸`
      } else {
        quickTotalPrice.textContent = "0 ₸"
      }
    }

    quickProductSelect.addEventListener("change", calculateQuickPrice)
    quickWeightInput.addEventListener("input", calculateQuickPrice)
  }
}

// Order Modal Functions
function openOrderModal() {
  const modal = document.getElementById("orderModal")
  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"
  }
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal")
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }
}

function addToOrder(productName, price) {
  openOrderModal()
  const productSelect = document.getElementById("productType")
  if (productSelect) {
    // Find the option with matching product name
    for (const option of productSelect.options) {
      if (option.value === productName) {
        productSelect.value = productName
        break
      }
    }
    updateOrderCalculation()
  }
}

// Order Form Handling
function initializeOrderForm() {
  const orderForm = document.getElementById("orderForm")

  if (orderForm) {
    // Add event listeners for real-time calculation
    const productType = document.getElementById("productType")
    const quantity = document.getElementById("quantity")
    const deliveryType = document.getElementById("deliveryType")
    const addressGroup = document.getElementById("addressGroup")

    if (productType) productType.addEventListener("change", updateOrderCalculation)
    if (quantity) quantity.addEventListener("input", updateOrderCalculation)
    if (deliveryType) {
      deliveryType.addEventListener("change", function () {
        updateOrderCalculation()
        if (addressGroup) {
          if (this.value === "delivery") {
            addressGroup.style.display = "block"
            document.getElementById("deliveryAddress").required = true
          } else {
            addressGroup.style.display = "none"
            document.getElementById("deliveryAddress").required = false
          }
        }
      })
    }

    orderForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        name: document.getElementById("customerName")?.value,
        phone: document.getElementById("customerPhone")?.value,
        product: document.getElementById("productType")?.value,
        quantity: document.getElementById("quantity")?.value,
        deliveryType: document.getElementById("deliveryType")?.value,
        address: document.getElementById("deliveryAddress")?.value,
        paymentMethod: document.getElementById("paymentMethod")?.value,
        notes: document.getElementById("orderNotes")?.value,
      }

      // Validate form
      if (
        !formData.name ||
        !formData.phone ||
        !formData.product ||
        !formData.quantity ||
        !formData.deliveryType ||
        !formData.paymentMethod
      ) {
        alert("Пожалуйста, заполните все обязательные поля")
        return
      }

      if (Number.parseFloat(formData.quantity) < 3) {
        alert("Минимальный заказ: 3 кг")
        return
      }

      if (formData.deliveryType === "delivery" && !formData.address) {
        alert("Укажите адрес доставки")
        return
      }

      // Create WhatsApp message
      const message = createWhatsAppMessage(formData)

      // Send to WhatsApp
      const whatsappUrl = `https://wa.me/77771234567?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      // Close modal and show success message
      closeOrderModal()
      showSuccessMessage()

      // Reset form
      orderForm.reset()
      updateOrderCalculation()
    })
  }
}

function updateOrderCalculation() {
  const productSelect = document.getElementById("productType")
  const quantityInput = document.getElementById("quantity")
  const deliverySelect = document.getElementById("deliveryType")

  const productCost = document.getElementById("productCost")
  const deliveryCost = document.getElementById("deliveryCost")
  const finalTotal = document.getElementById("finalTotal")
  const orderTotal = document.getElementById("orderTotal")

  if (!productSelect || !quantityInput || !deliverySelect) return

  const selectedOption = productSelect.options[productSelect.selectedIndex]
  const quantity = Number.parseFloat(quantityInput.value) || 0

  let productPrice = 0
  let deliveryPrice = 0
  let total = 0

  if (selectedOption && selectedOption.dataset.price) {
    const pricePerKg = Number.parseFloat(selectedOption.dataset.price)
    productPrice = pricePerKg * quantity
  }

  // Calculate delivery cost
  if (deliverySelect.value === "delivery") {
    deliveryPrice = 1000
  }

  total = productPrice + deliveryPrice

  // Apply discount for orders over 15000 ₸
  let discount = 0
  if (total >= 15000) {
    discount = Math.floor(total * 0.05) // 5% discount
    deliveryPrice = 0 // Free delivery
    total = productPrice - discount
  }

  // Update display
  if (productCost) productCost.textContent = `${productPrice.toLocaleString("ru-RU")} ₸`
  if (deliveryCost) deliveryCost.textContent = `${deliveryPrice.toLocaleString("ru-RU")} ₸`
  if (finalTotal) finalTotal.textContent = `${total.toLocaleString("ru-RU")} ₸`
  if (orderTotal) orderTotal.value = `${total.toLocaleString("ru-RU")} ₸`

  // Show/hide discount row
  const discountRow = document.getElementById("discountRow")
  const orderDiscount = document.getElementById("orderDiscount")
  if (discountRow && orderDiscount) {
    if (discount > 0) {
      discountRow.style.display = "flex"
      orderDiscount.textContent = `-${discount.toLocaleString("ru-RU")} ₸`
    } else {
      discountRow.style.display = "none"
    }
  }
}

function createWhatsAppMessage(data) {
  let message = `🐔 *Новый заказ с сайта*\n\n`
  message += `👤 *Имя:* ${data.name}\n`
  message += `📞 *Телефон:* ${data.phone}\n`
  message += `🛒 *Товар:* ${data.product}\n`
  message += `⚖️ *Количество:* ${data.quantity} кг\n`

  if (data.deliveryType === "delivery") {
    message += `🚚 *Доставка:* По адресу\n`
    if (data.address) {
      message += `📍 *Адрес:* ${data.address}\n`
    }
  } else {
    message += `🏪 *Получение:* Самовывоз\n`
  }

  message += `💳 *Оплата:* ${getPaymentMethodText(data.paymentMethod)}\n`

  if (data.notes) {
    message += `📝 *Комментарий:* ${data.notes}\n`
  }

  message += `\n⏰ *Время заказа:* ${new Date().toLocaleString("ru-RU")}`

  return message
}

function getPaymentMethodText(method) {
  const methods = {
    cash: "Наличными",
    card: "Картой",
    kaspi: "Kaspi Pay",
    transfer: "Банковский перевод",
  }
  return methods[method] || method
}

function showSuccessMessage() {
  const successDiv = document.createElement("div")
  successDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #28a745;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            z-index: 3000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
            <h3>✅ Заказ отправлен!</h3>
            <p>Мы свяжемся с вами в ближайшее время</p>
        </div>
    `

  document.body.appendChild(successDiv)

  setTimeout(() => {
    document.body.removeChild(successDiv)
  }, 3000)
}

// Image Modal Functions
function openImageModal(imageSrc) {
  const modal = document.getElementById("imageModal")
  const sliderImage = document.getElementById("sliderImage")

  if (modal && sliderImage) {
    currentImageIndex = images.indexOf(imageSrc) !== -1 ? images.indexOf(imageSrc) : 0
    sliderImage.src = imageSrc
    modal.style.display = "block"
    document.body.style.overflow = "hidden"
  }
}

function closeImageModal() {
  const modal = document.getElementById("imageModal")
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length
  const sliderImage = document.getElementById("sliderImage")
  if (sliderImage) {
    sliderImage.src = images[currentImageIndex]
  }
}

function prevImage() {
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length
  const sliderImage = document.getElementById("sliderImage")
  if (sliderImage) {
    sliderImage.src = images[currentImageIndex]
  }
}

// Terms Modal Functions
function showTerms() {
  const modal = document.getElementById("termsModal")
  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"
  }
}

function closeTermsModal() {
  const modal = document.getElementById("termsModal")
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }
}

// Smooth Scroll Navigation
function initializeSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav a[href^="#"]')

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        const headerHeight = document.querySelector(".header").offsetHeight
        const targetPosition = targetSection.offsetTop - headerHeight - 20

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })
}

// Mobile Menu
