<template>
  <div class="markdown-content" :class="{ 'ai-markdown': isAiMessage }">
    <div v-html="renderedContent"></div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { marked } from 'marked'
  import { sanitizeHtml } from '@/utils/sanitize'

  const props = defineProps({
    content: {
      type: String,
      required: true
    },
    isAiMessage: {
      type: Boolean,
      default: false
    }
  })

  marked.setOptions({
    gfm: true,
    breaks: true
  })

  // 先用 marked 渲染，再统一经 DOMPurify 净化，阻止 AI 输出中的 HTML / javascript: 链接注入
  const renderedContent = computed(() => sanitizeHtml(marked.parse(props.content || '')))
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  color: inherit;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 1.5em;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.3em;
  color: #374151;
}

.markdown-content h3 {
  font-size: 1.1em;
  color: #4b5563;
}

.markdown-content p {
  margin: 0.5em 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content li {
  margin: 0.3em 0;
}

.markdown-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
  background: #f9fafb;
  border-radius: 0 0.5em 0.5em 0;
  padding: 0.5em 1em;
}

.ai-markdown blockquote {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.markdown-content hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1.5em 0;
}

.markdown-content code.inline-code {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
  color: #e11d48;
}

.ai-markdown code.inline-code {
  background: #dbeafe;
  color: #1e40af;
}

.markdown-content pre.code-block {
  background: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
  line-height: 1.4;
}

.markdown-content pre.code-block code {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.markdown-content a:hover {
  border-bottom-color: #3b82f6;
}

.ai-markdown a {
  color: #1e40af;
}

.ai-markdown a:hover {
  border-bottom-color: #1e40af;
}

.markdown-content strong {
  font-weight: 600;
  color: #374151;
}

.ai-markdown strong {
  color: #1e40af;
}

.markdown-content em {
  font-style: italic;
  color: #6b7280;
}
</style>
