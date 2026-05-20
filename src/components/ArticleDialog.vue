<template>
  <el-dialog width="50%" v-model="dialogVisible" @close="handleClose">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择分类">
          <el-option v-for="item in props.categories" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="文章摘要" prop="summary">
        <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要（可选）" maxlength="1000" show-word-limit
          :rows="4" />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select v-model="formData.tagArray" placeholder="请输入文章标签" multiple filterable allow-create
          style="width: 100%">
          <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>

      <el-form-item label="封面图片">
        <div class="cover-upload">
          <el-upload class="avatar-upload" action="#" :before-upload="beforeUpload" :http-request="handleUploadRequest"
            :show-file-list="false" accept="image/*">
            <div v-if="!imgUrl" class="cover-placeholder">
              <p>点击上传封面</p>
            </div>
            <img v-else :src="imgUrl" class="cover-image" alt="封面图片" />
          </el-upload>
          <div v-if="imgUrl" style="margin-top: 10px;">
            <el-button type="danger" size="small" @click="handleRemove">移除封面</el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="文章内容" prop="content">
        <RichTextEditor v-model="formData.content" placeholder="请输入文章内容..." :maxCharCount="5000" min-height="400px" />
      </el-form-item>
    </el-form>

    <div v-if="btnPreview">
      <h3>内容预览</h3>
      <div v-html="formData.content" style="border: 1px solid #eee; padding: 10px;"></div>
    </div>

    <template #footer>
      <el-button @click="btnPreview = !btnPreview">{{ btnPreview ? '隐藏预览' : '预览效果' }}</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? '更新文章' : '创建文章' }}</el-button>
    </template>

  </el-dialog>
</template>
<script setup>
  import { ref, reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { uploadFileAPI, createArticleAPI, updateArticleAPI } from '@/api/admin'
  import { fileBaseUrl } from '@/config/index.js'
  import RichTextEditor from './RichTextEditor.vue'

  const props = defineProps({
    categories: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  })

  const rules = reactive({
    title: [
      { required: true, message: '请输入文章标题', trigger: 'blur' },
      { max: 200, message: '文章标题最多200个字', trigger: 'blur' }
    ],
    categoryId: [
      { required: true, message: '请选择分类', trigger: 'change' }
    ],
    content: [
      { required: true, message: '请输入文章内容', trigger: 'blur' }
    ]
  })

  // 表单数据
  const formData = reactive({
    title: "",
    content: "",
    coverImage: "",
    categoryId: "",
    summary: "",
    tagArray: [], // 使用数组处理多选
    id: ""
  })

  const commonTags = ['情绪管理', '焦虑', '抑郁', '压力', '睡眠', '冥想', '心理健康', '自我成长']

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })


  const imgUrl = ref("")
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt5 = file.size / 1024 / 1024 < 5
    if (!isImage) {
      ElMessage.error('请上传图片格式的文件')
      return false
    }
    if (!isLt5) {
      ElMessage.error('图片大小不能超过5MB')
      return false
    }
    imgUrl.value = URL.createObjectURL(file)
    return true
  }

  const handleUploadRequest = async (options) => {
    const { file, onSuccess, onError } = options
    const businessId = crypto.randomUUID()
    try {
      const fileRes = await uploadFileAPI(file, { businessId })
      const uploadedPath = typeof fileRes === 'string' ? fileRes : (fileRes?.filePath || fileRes?.url || fileRes?.coverImage || '')
      if (!uploadedPath) {
        throw new Error('上传成功但未返回文件地址')
      }
      formData.coverImage = uploadedPath
      imgUrl.value = uploadedPath.startsWith('http') ? uploadedPath : `${fileBaseUrl}${uploadedPath}`
      onSuccess?.(fileRes)
    } catch (error) {
      onError(error)
    }
  }

  const handleRemove = () => {
    imgUrl.value = ''
    formData.coverImage = ''
  }

  const handleClose = () => {
    dialogVisible.value = false
  }

  // 提交
  const formRef = ref()
  const loading = ref(false)
  const btnPreview = ref(false)

  // 提交表单
  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
    } catch {
      return
    }

    const submitData = {
      ...formData,
      tags: formData.tagArray.join(','),
    }
    delete submitData.tagArray

    loading.value = true

    try {
      const api = isEdit.value ? updateArticle : createArticle
      await api(submitData)
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      emit('success')
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }


</script>
<style lang="scss" scoped>
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  background: #f6f8fa;
  border: 1px dashed #d9d9d9;
}

.cover-image {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style>