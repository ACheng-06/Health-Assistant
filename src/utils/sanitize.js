import DOMPurify from 'dompurify'

// 统一的 HTML 净化入口：所有 v-html 内容必须先经过这里
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', {
    ADD_ATTR: ['target', 'rel']
  })
}
