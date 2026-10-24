// 元素要真正“进屏”一段距离才触发，避免贴着底边就提前播完动效
const OBSERVER_OPTIONS = {
  threshold: 0.1,
  rootMargin: '0px 0px -10% 0px'
}

const observers = new Map()
const elementObservers = new WeakMap()
const directions = new Set(['up', 'left', 'right', 'zoom'])

const getObserver = () => {
  const key = `${OBSERVER_OPTIONS.threshold}|${OBSERVER_OPTIONS.rootMargin}`
  if (observers.has(key)) return observers.get(key)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target
      el.classList.add('is-visible')
      observer.unobserve(el)
      elementObservers.delete(el)
    })
  }, OBSERVER_OPTIONS)

  observers.set(key, observer)
  return observer
}

const applyDirection = (el, binding) => {
  const direction = directions.has(binding.arg) ? binding.arg : 'up'
  el.classList.add('reveal', `reveal-${direction}`)
}

const removeDirection = (el) => {
  el.classList.remove('reveal-up', 'reveal-left', 'reveal-right', 'reveal-zoom')
}

export default {
  mounted(el, binding) {
    applyDirection(el, binding)
    el.style.setProperty('--stagger', Number(binding.value) || 0)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }

    const observer = getObserver()
    elementObservers.set(el, observer)
    observer.observe(el)
  },

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.style.setProperty('--stagger', Number(binding.value) || 0)
    }

    if (binding.arg !== binding.oldArg) {
      removeDirection(el)
      applyDirection(el, binding)
    }
  },

  unmounted(el) {
    const observer = elementObservers.get(el)
    if (observer) observer.unobserve(el)
    elementObservers.delete(el)
  }
}
